/**
 * Draw Simulation API — POST.
 *
 * Runs either the random or algorithmic draw engine for a given draw,
 * persists the results (status: simulated), and returns the outcome.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDemoSession, DEMO_COOKIE } from '@/lib/demo-auth';
import { categoriseWinners, runRandomDraw } from '@/lib/draw-engine/random';
import { runAlgorithmicDraw } from '@/lib/draw-engine/algorithmic';
import { calculatePrizePool } from '@/lib/draw-engine/prize-calculator';
import { SCORE_LIMITS } from '@/constants';
import type { Draw, DrawEntry } from '@/types';

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

  // Fetch the draw
  const { data: drawData, error: drawError } = await supabase
    .from('draws')
    .select('*')
    .eq('id', draw_id)
    .single();

  if (drawError || !drawData) {
    return NextResponse.json({ error: 'Draw not found' }, { status: 404 });
  }

  const draw = drawData as Draw;

  if (draw.status !== 'draft') {
    return NextResponse.json(
      { error: `Cannot simulate a draw with status "${draw.status}"` },
      { status: 409 }
    );
  }

  // Find eligible users: active subscription + at least 1 score in draw month
  const { data: eligibleUsers } = await supabase
    .from('subscriptions')
    .select('user_id')
    .in('status', ['active', 'trialing']);

  const eligibleUserIds = (eligibleUsers ?? []).map((u: { user_id: string }) => u.user_id);

  if (eligibleUserIds.length === 0) {
    return NextResponse.json({ error: 'No eligible participants' }, { status: 422 });
  }

  let winningNumbers: number[];
  let entries: Array<{ userId: string; numbers: number[] }>;

  if (draw.logic_type === 'algorithmic') {
    // Fetch rolling score averages
    const { data: scoresData } = await supabase
      .from('scores')
      .select('user_id, gross_score')
      .in('user_id', eligibleUserIds);

    // Build rolling averages map
    const scoreMap = new Map<string, number[]>();
    for (const score of scoresData ?? []) {
      const existing = scoreMap.get(score.user_id) ?? [];
      scoreMap.set(score.user_id, [...existing, score.gross_score]);
    }

    const scoreAverages = eligibleUserIds.map((userId: string) => {
      const scores = scoreMap.get(userId) ?? [];
      const lastN = scores.slice(-SCORE_LIMITS.MAX_STORED);
      return {
        user_id: userId,
        average_gross:
          lastN.length > 0 ? lastN.reduce((s, n) => s + n, 0) / lastN.length : 30,
        average_net: null,
        scores_count: lastN.length,
        computed_at: new Date().toISOString(),
      };
    });

    const result = runAlgorithmicDraw(eligibleUserIds, scoreAverages, draw.algorithmic_preference);
    winningNumbers = result.winningNumbers;
    entries = result.entries;
  } else {
    const result = runRandomDraw(eligibleUserIds);
    winningNumbers = result.winningNumbers;
    entries = result.entries;
  }

  // Build DrawEntry objects for upsert
  const entryRows = entries.map(({ userId, numbers }) => ({
    draw_id,
    user_id: userId,
    entry_numbers: numbers,
    is_eligible: true,
  }));

  await supabase.from('draw_entries').upsert(entryRows, {
    onConflict: 'draw_id,user_id',
  });

  // Categorise winners
  const entryObjects: DrawEntry[] = entryRows.map((e, i) => ({
    id: i.toString(),
    draw_id,
    user_id: e.user_id,
    entry_numbers: e.entry_numbers,
    is_eligible: true,
    created_at: new Date().toISOString(),
  }));

  const { fiveMatch, fourMatch, threeMatch } = categoriseWinners(entryObjects, winningNumbers);

  // Calculate prize pool
  const prizeCalc = calculatePrizePool({
    totalPoolPence: draw.prize_pool_snapshot?.total_amount ?? 0,
    rolledOverJackpotPence: draw.prize_pool_snapshot?.jackpot_rolled_over ?? 0,
    winnerCounts: {
      five_match: fiveMatch.length,
      four_match: fourMatch.length,
      three_match: threeMatch.length,
    },
  });

  // Persist draw result
  await supabase.from('draw_results').upsert(
    {
      draw_id,
      winning_numbers: winningNumbers,
      five_match_winners: fiveMatch,
      four_match_winners: fourMatch,
      three_match_winners: threeMatch,
      total_entries: entries.length,
    },
    { onConflict: 'draw_id' }
  );

  // Update draw status to simulated
  await supabase
    .from('draws')
    .update({
      status: 'simulated',
      simulated_at: new Date().toISOString(),
      prize_pool_snapshot: {
        ...draw.prize_pool_snapshot,
        tiers: prizeCalc.prizePool.tiers,
      },
    })
    .eq('id', draw_id);

  return NextResponse.json({
    data: {
      winning_numbers: winningNumbers,
      five_match_count: fiveMatch.length,
      four_match_count: fourMatch.length,
      three_match_count: threeMatch.length,
      total_entries: entries.length,
    },
  });
}
