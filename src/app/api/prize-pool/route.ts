/**
 * Prize Pool API — GET.
 *
 * Returns the current estimated prize pool breakdown.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { estimatePrizePool, formatTierBreakdown } from '@/lib/draw-engine/prize-calculator';
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_TO_PRIZE_POOL_PCT, PRIZE_POOL_PERCENTAGES } from '@/constants';

export async function GET() {
  const supabase = await createClient();

  const { count } = await supabase
    .from('subscriptions')
    .select('id', { count: 'exact' })
    .in('status', ['active', 'trialing']);

  const activeSubscribers = count ?? 0;
  const totalAmount = estimatePrizePool(
    activeSubscribers,
    SUBSCRIPTION_PLANS.monthly.price_pence,
    SUBSCRIPTION_TO_PRIZE_POOL_PCT
  );

  const tiers = [
    {
      tier: 'five_match' as const,
      percentage: PRIZE_POOL_PERCENTAGES.five_match,
      gross_amount: Math.floor(totalAmount * PRIZE_POOL_PERCENTAGES.five_match),
      winner_count: 0,
      per_winner_amount: 0,
      rolled_over: false,
    },
    {
      tier: 'four_match' as const,
      percentage: PRIZE_POOL_PERCENTAGES.four_match,
      gross_amount: Math.floor(totalAmount * PRIZE_POOL_PERCENTAGES.four_match),
      winner_count: 0,
      per_winner_amount: 0,
      rolled_over: false,
    },
    {
      tier: 'three_match' as const,
      percentage: PRIZE_POOL_PERCENTAGES.three_match,
      gross_amount: Math.floor(totalAmount * PRIZE_POOL_PERCENTAGES.three_match),
      winner_count: 0,
      per_winner_amount: 0,
      rolled_over: false,
    },
  ];

  return NextResponse.json({
    data: {
      active_subscribers: activeSubscribers,
      total_amount: totalAmount,
      tiers,
      breakdown: formatTierBreakdown(tiers),
    },
  });
}
