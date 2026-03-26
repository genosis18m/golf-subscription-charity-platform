/**
 * Draw Publish API — POST.
 *
 * Publishes a simulated draw: creates winner records, updates status,
 * and (in production) triggers winner notification emails.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDemoSession, DEMO_COOKIE } from '@/lib/demo-auth';
import { sendWinnerNotificationEmail } from '@/lib/email';
import type { Draw } from '@/types';

export async function POST(request: NextRequest) {
  let userObj: { id: string; role: string } | null = null;
  const cookieStore = await cookies();
  const demoSession = getDemoSession(cookieStore.get(DEMO_COOKIE)?.value);

  if (demoSession && demoSession.role === 'admin') {
    userObj = { id: demoSession.userId, role: 'admin' };
  } else {
    const user = await getAuthUser();
    if (user) {
      userObj = { id: user.id, role: user.app_metadata?.role as string };
    }
  }

  if (!userObj) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (userObj.role !== 'admin' && userObj.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { draw_id } = await request.json();
  if (!draw_id) return NextResponse.json({ error: 'draw_id required' }, { status: 422 });

  const supabase = createAdminClient();

  // Fetch draw and result
  const { data: drawData } = await supabase
    .from('draws')
    .select('*, draw_results(*)')
    .eq('id', draw_id)
    .single();

  if (!drawData) return NextResponse.json({ error: 'Draw not found' }, { status: 404 });

  const draw = drawData as Draw & {
    draw_results: Array<{
      five_match_winners: string[];
      four_match_winners: string[];
      three_match_winners: string[];
    }>;
  };

  if (draw.status !== 'simulated') {
    return NextResponse.json(
      { error: `Draw must be in "simulated" state to publish. Current: "${draw.status}"` },
      { status: 409 }
    );
  }

  const result = draw.draw_results[0];
  if (!result) {
    return NextResponse.json({ error: 'No simulation results found. Run simulation first.' }, { status: 422 });
  }

  const pool = draw.prize_pool_snapshot;

  // Build winner records
  const winnerRows = [
    ...result.five_match_winners.map((userId: string) => ({
      draw_id,
      user_id: userId,
      match_tier: 'five_match',
      prize_amount: pool?.tiers?.find((t: { tier: string }) => t.tier === 'five_match')?.per_winner_amount ?? 0,
      matched_numbers: [],
      status: 'pending',
    })),
    ...result.four_match_winners.map((userId: string) => ({
      draw_id,
      user_id: userId,
      match_tier: 'four_match',
      prize_amount: pool?.tiers?.find((t: { tier: string }) => t.tier === 'four_match')?.per_winner_amount ?? 0,
      matched_numbers: [],
      status: 'pending',
    })),
    ...result.three_match_winners.map((userId: string) => ({
      draw_id,
      user_id: userId,
      match_tier: 'three_match',
      prize_amount: pool?.tiers?.find((t: { tier: string }) => t.tier === 'three_match')?.per_winner_amount ?? 0,
      matched_numbers: [],
      status: 'pending',
    })),
  ];

  if (winnerRows.length > 0) {
    await supabase.from('winners').insert(winnerRows);

    const winnerProfiles = await Promise.all(
      winnerRows.map(async (winner) => {
        const [{ data: authLookup }, { data: profile }] = await Promise.all([
          supabase.auth.admin.getUserById(winner.user_id),
          supabase.from('profiles').select('full_name').eq('user_id', winner.user_id).maybeSingle(),
        ]);

        if (!authLookup.user?.email) {
          return null;
        }

        return {
          email: authLookup.user.email,
          fullName: profile?.full_name ?? null,
          matchTier: winner.match_tier as 'five_match' | 'four_match' | 'three_match',
          prizeAmount: winner.prize_amount,
        };
      })
    );

    await Promise.allSettled(
      winnerProfiles
        .filter((winner): winner is NonNullable<typeof winner> => winner !== null)
        .map((winner) =>
          sendWinnerNotificationEmail({
            to: winner.email,
            fullName: winner.fullName,
            drawTitle: draw.title,
            matchTier: winner.matchTier,
            prizeAmount: winner.prizeAmount,
          })
        )
    );
  }

  // Update draw to published
  const { error } = await supabase
    .from('draws')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', draw_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    data: {
      published: true,
      winners_created: winnerRows.length,
    },
  });
}
