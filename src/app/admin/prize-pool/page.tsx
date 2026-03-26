/**
 * Admin: Prize Pool (/admin/prize-pool).
 *
 * Shows current pool breakdown by tier, jackpot status, and rollover history.
 */

import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { estimatePrizePool, formatTierBreakdown } from '@/lib/draw-engine/prize-calculator';
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_TO_PRIZE_POOL_PCT, PRIZE_POOL_PERCENTAGES } from '@/constants';

export const metadata: Metadata = { title: 'Prize Pool — Admin' };

export default async function AdminPrizePoolPage() {
  const supabase = await createClient();

  const { count: activeSubscribers } = await supabase
    .from('subscriptions')
    .select('id', { count: 'exact' })
    .in('status', ['active', 'trialing']);

  const subs = activeSubscribers ?? 0;
  const estimatedPool = estimatePrizePool(
    subs,
    SUBSCRIPTION_PLANS.monthly.price_pence,
    SUBSCRIPTION_TO_PRIZE_POOL_PCT
  );

  const tiers = [
    {
      tier: 'five_match' as const,
      label: '5-Match (Jackpot)',
      percentage: PRIZE_POOL_PERCENTAGES.five_match,
      gross_amount: Math.floor(estimatedPool * PRIZE_POOL_PERCENTAGES.five_match),
      winner_count: 0,
      per_winner_amount: 0,
      rolled_over: false,
    },
    {
      tier: 'four_match' as const,
      label: '4-Match',
      percentage: PRIZE_POOL_PERCENTAGES.four_match,
      gross_amount: Math.floor(estimatedPool * PRIZE_POOL_PERCENTAGES.four_match),
      winner_count: 0,
      per_winner_amount: 0,
      rolled_over: false,
    },
    {
      tier: 'three_match' as const,
      label: '3-Match',
      percentage: PRIZE_POOL_PERCENTAGES.three_match,
      gross_amount: Math.floor(estimatedPool * PRIZE_POOL_PERCENTAGES.three_match),
      winner_count: 0,
      per_winner_amount: 0,
      rolled_over: false,
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Prize Pool</h1>
        <p className="text-slate-500 text-sm mt-1">
          Current month estimated breakdown based on {subs} active subscribers.
        </p>
      </div>

      {/* Total */}
      <Card>
        <div className="text-center py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">
            Estimated Prize Pool This Month
          </p>
          <p className="text-5xl font-bold text-green-700">{formatCurrency(estimatedPool)}</p>
          <p className="text-sm text-slate-400 mt-2">
            {subs} subscribers × {formatCurrency(SUBSCRIPTION_PLANS.monthly.price_pence)} × {SUBSCRIPTION_TO_PRIZE_POOL_PCT * 100}%
          </p>
        </div>
      </Card>

      {/* Tier breakdown */}
      <Card>
        <Card.Header title="Tier Breakdown" />
        <div className="space-y-4">
          {tiers.map((tier) => (
            <div key={tier.tier} className="flex items-center justify-between border border-slate-100 rounded-xl p-4">
              <div>
                <p className="font-semibold text-slate-900">{tier.label}</p>
                <p className="text-sm text-slate-500">{Math.round(tier.percentage * 100)}% of pool</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-700">{formatCurrency(tier.gross_amount)}</p>
                <p className="text-xs text-slate-400">gross allocation</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex h-4 rounded-full overflow-hidden">
            <div
              className="bg-amber-400"
              style={{ width: `${PRIZE_POOL_PERCENTAGES.five_match * 100}%` }}
              title="5-match"
            />
            <div
              className="bg-green-500"
              style={{ width: `${PRIZE_POOL_PERCENTAGES.four_match * 100}%` }}
              title="4-match"
            />
            <div
              className="bg-blue-400"
              style={{ width: `${PRIZE_POOL_PERCENTAGES.three_match * 100}%` }}
              title="3-match"
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Jackpot 40%</span>
            <span>4-Match 35%</span>
            <span>3-Match 25%</span>
          </div>
        </div>
      </Card>

      {/* Rollover explainer */}
      <Card>
        <Card.Header title="Rollover Rules" />
        <ul className="text-sm text-slate-600 space-y-2">
          <li>• <strong>5-match with no winners:</strong> Full jackpot amount rolls to next draw.</li>
          <li>• <strong>4-match with no winners:</strong> 50% goes to next jackpot, 50% to next 4-match pool.</li>
          <li>• <strong>3-match with no winners:</strong> Full amount rolls to next 4-match pool.</li>
        </ul>
      </Card>
    </div>
  );
}
