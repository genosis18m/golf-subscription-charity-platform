/**
 * Draws API — GET/POST.
 *
 * GET: Returns published draws (public) or all draws (admin).
 * POST: Creates a new draw (admin only).
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDemoSession, DEMO_COOKIE } from '@/lib/demo-auth';
import { estimatePrizePool } from '@/lib/draw-engine/prize-calculator';
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_TO_PRIZE_POOL_PCT, PRIZE_POOL_PERCENTAGES } from '@/constants';
import type { DrawConfigFormValues } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  let userRole: string | null = null;

  const cookieStore = await cookies();
  const demoSession = getDemoSession(cookieStore.get(DEMO_COOKIE)?.value);

  if (demoSession?.role) {
    userRole = demoSession.role;
  } else {
    const user = await getAuthUser();
    userRole = (user?.app_metadata?.role as string | undefined) ?? null;
  }

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  const supabase = createAdminClient();
  let query = supabase
    .from('draws')
    .select('*, draw_results(*)')
    .order('draw_month', { ascending: false });

  if (status) {
    if (!isAdmin && status !== 'published') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    query = query.eq('status', status);
  } else if (!isAdmin) {
    // Default: only published draws for public access
    query = query.eq('status', 'published');
  }

  const { data, error } = await query.limit(24);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

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

  const body: DrawConfigFormValues = await request.json();
  const { title, draw_month, logic_type, prize_pool_amount, algorithmic_preference } = body;

  if (!title || !draw_month) {
    return NextResponse.json({ error: 'title and draw_month are required' }, { status: 422 });
  }

  const supabase = await createClient();

  // Calculate prize pool
  const { count: activeSubscribers } = await supabase
    .from('subscriptions')
    .select('id', { count: 'exact' })
    .in('status', ['active', 'trialing']);

  const totalAmount =
    prize_pool_amount > 0
      ? prize_pool_amount
      : estimatePrizePool(
          activeSubscribers ?? 0,
          SUBSCRIPTION_PLANS.monthly.price_pence,
          SUBSCRIPTION_TO_PRIZE_POOL_PCT
        );

  const prizePoolSnapshot = {
    total_amount: totalAmount,
    jackpot_rolled_over: 0,
    tiers: [
      {
        tier: 'five_match',
        percentage: PRIZE_POOL_PERCENTAGES.five_match,
        gross_amount: Math.floor(totalAmount * PRIZE_POOL_PERCENTAGES.five_match),
        winner_count: 0,
        per_winner_amount: 0,
        rolled_over: false,
      },
      {
        tier: 'four_match',
        percentage: PRIZE_POOL_PERCENTAGES.four_match,
        gross_amount: Math.floor(totalAmount * PRIZE_POOL_PERCENTAGES.four_match),
        winner_count: 0,
        per_winner_amount: 0,
        rolled_over: false,
      },
      {
        tier: 'three_match',
        percentage: PRIZE_POOL_PERCENTAGES.three_match,
        gross_amount: Math.floor(totalAmount * PRIZE_POOL_PERCENTAGES.three_match),
        winner_count: 0,
        per_winner_amount: 0,
        rolled_over: false,
      },
    ],
  };

  const { data, error } = await supabase
    .from('draws')
    .insert({
      title,
      draw_month,
      logic_type,
      algorithmic_preference,
      status: 'draft',
      prize_pool_snapshot: prizePoolSnapshot,
      created_by: userObj.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
