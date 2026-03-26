/**
 * Prize Pool Calculator.
 *
 * Computes prize tier allocations from the total pool amount, determines
 * per-winner payouts, and handles rollover logic when a tier has no winners.
 *
 * Rollover rules:
 *  - If the 5-match (jackpot) tier has no winners, 100% of its allocation
 *    rolls over to the next draw's jackpot.
 *  - If the 4-match tier has no winners, 50% rolls to the jackpot and
 *    50% carries to the next 4-match pool.
 *  - If the 3-match tier has no winners, its allocation rolls to 4-match
 *    for the next draw.
 *
 * These rules are designed to grow the jackpot organically while keeping
 *  lower-tier prizes funded for the next draw cycle.
 */

import {
  PRIZE_POOL_PERCENTAGES,
  MINIMUM_JACKPOT_AMOUNT,
  penceToPounds,
} from '@/constants';
import type { PrizePool, PrizePoolTier, MatchTier } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DrawWinnerCounts {
  five_match: number;
  four_match: number;
  three_match: number;
}

export interface PrizeCalculationInput {
  totalPoolPence: number; // Total prize pool in pence
  rolledOverJackpotPence: number; // Any jackpot rolled over from previous draw
  winnerCounts: DrawWinnerCounts;
}

export interface PrizeCalculationResult {
  prizePool: Omit<PrizePool, 'id' | 'draw_id' | 'computed_at'>;
  rolloverAmounts: {
    toJackpot: number; // Pence to add to next draw's jackpot
    toFourMatch: number; // Pence to carry to next 4-match pool
    toThreeMatch: number; // Pence to carry to next 3-match pool
  };
  summary: string; // Human-readable summary for admin UI
}

// ─── Core Calculation ─────────────────────────────────────────────────────────

/**
 * Calculates prize tier allocations and per-winner payouts for a given draw.
 *
 * The total effective pool includes any rolled-over jackpot from the
 * previous draw. Each tier receives a fixed percentage of the base pool;
 * rolled-over amounts are added on top of the jackpot tier.
 *
 * @example
 * ```ts
 * const result = calculatePrizePool({
 *   totalPoolPence: 500_000,    // £5,000
 *   rolledOverJackpotPence: 200_000, // £2,000 rolled over
 *   winnerCounts: { five_match: 1, four_match: 3, three_match: 8 },
 * })
 * // result.prizePool.tiers[0].per_winner_amount = 400_000 + 200_000 = 600_000 / 1 = £6,000
 * ```
 */
export function calculatePrizePool(
  input: PrizeCalculationInput
): PrizeCalculationResult {
  const { totalPoolPence, rolledOverJackpotPence, winnerCounts } = input;

  // Enforce minimum jackpot
  const effectivePool = Math.max(totalPoolPence, MINIMUM_JACKPOT_AMOUNT);

  // Base tier allocations from the subscription-derived pool
  const baseFiveMatch = Math.floor(effectivePool * PRIZE_POOL_PERCENTAGES.five_match);
  const baseFourMatch = Math.floor(effectivePool * PRIZE_POOL_PERCENTAGES.four_match);
  const baseThreeMatch = Math.floor(effectivePool * PRIZE_POOL_PERCENTAGES.three_match);

  // Add rollover to jackpot tier
  const effectiveFiveMatch = baseFiveMatch + rolledOverJackpotPence;

  const tiers = buildTiers({
    fiveMatchGross: effectiveFiveMatch,
    fourMatchGross: baseFourMatch,
    threeMatchGross: baseThreeMatch,
    winnerCounts,
  });

  // Compute rollover amounts for tiers with no winners
  const rolloverAmounts = computeRollovers(tiers, {
    fiveMatchGross: effectiveFiveMatch,
    fourMatchGross: baseFourMatch,
    threeMatchGross: baseThreeMatch,
  });

  const prizePool = {
    total_amount: effectivePool,
    tiers,
    jackpot_rolled_over: rolledOverJackpotPence,
  };

  const summary = buildSummary(prizePool, rolloverAmounts);

  return { prizePool, rolloverAmounts, summary };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildTiers({
  fiveMatchGross,
  fourMatchGross,
  threeMatchGross,
  winnerCounts,
}: {
  fiveMatchGross: number;
  fourMatchGross: number;
  threeMatchGross: number;
  winnerCounts: DrawWinnerCounts;
}): PrizePoolTier[] {
  const tierData: Array<{
    tier: MatchTier;
    percentage: number;
    gross: number;
    winners: number;
  }> = [
    {
      tier: 'five_match',
      percentage: PRIZE_POOL_PERCENTAGES.five_match,
      gross: fiveMatchGross,
      winners: winnerCounts.five_match,
    },
    {
      tier: 'four_match',
      percentage: PRIZE_POOL_PERCENTAGES.four_match,
      gross: fourMatchGross,
      winners: winnerCounts.four_match,
    },
    {
      tier: 'three_match',
      percentage: PRIZE_POOL_PERCENTAGES.three_match,
      gross: threeMatchGross,
      winners: winnerCounts.three_match,
    },
  ];

  return tierData.map(({ tier, percentage, gross, winners }) => ({
    tier,
    percentage,
    gross_amount: gross,
    winner_count: winners,
    per_winner_amount: winners > 0 ? Math.floor(gross / winners) : 0,
    rolled_over: winners === 0,
  }));
}

function computeRollovers(
  tiers: PrizePoolTier[],
  grossAmounts: {
    fiveMatchGross: number;
    fourMatchGross: number;
    threeMatchGross: number;
  }
): PrizeCalculationResult['rolloverAmounts'] {
  const { fiveMatchGross, fourMatchGross, threeMatchGross } = grossAmounts;
  const tierMap = new Map(tiers.map((t) => [t.tier, t]));

  let toJackpot = 0;
  let toFourMatch = 0;
  let toThreeMatch = 0;

  // Jackpot (5-match): full rollover to next jackpot
  if (tierMap.get('five_match')?.rolled_over) {
    toJackpot += fiveMatchGross;
  }

  // 4-match: split 50/50 between jackpot and next 4-match
  if (tierMap.get('four_match')?.rolled_over) {
    toJackpot += Math.floor(fourMatchGross * 0.5);
    toFourMatch += Math.floor(fourMatchGross * 0.5);
  }

  // 3-match: full rollover to next 4-match pool
  if (tierMap.get('three_match')?.rolled_over) {
    toFourMatch += threeMatchGross;
  }

  return { toJackpot, toFourMatch, toThreeMatch };
}

function buildSummary(
  prizePool: Omit<PrizePool, 'id' | 'draw_id' | 'computed_at'>,
  rollovers: PrizeCalculationResult['rolloverAmounts']
): string {
  const lines: string[] = [
    `Total pool: ${penceToPounds(prizePool.total_amount)}`,
  ];

  for (const tier of prizePool.tiers) {
    const tierLabel = tier.tier.replace('_', '-');
    if (tier.winner_count > 0) {
      lines.push(
        `${tierLabel}: ${tier.winner_count} winner(s) × ${penceToPounds(tier.per_winner_amount)} each`
      );
    } else {
      lines.push(`${tierLabel}: No winners — ${penceToPounds(tier.gross_amount)} rolled over`);
    }
  }

  if (rollovers.toJackpot > 0) {
    lines.push(`Next draw jackpot boost: +${penceToPounds(rollovers.toJackpot)}`);
  }

  return lines.join('\n');
}

// ─── Projection Utilities ─────────────────────────────────────────────────────

/**
 * Estimates the prize pool for a given number of active subscribers.
 * Useful for admin dashboard projections before the draw runs.
 *
 * @param activeSubscribers - Current count of active members
 * @param monthlyPricePence - Subscription price in pence
 * @param prizePoolPct - Fraction of subscription revenue going to prizes
 */
export function estimatePrizePool(
  activeSubscribers: number,
  monthlyPricePence: number,
  prizePoolPct: number
): number {
  return Math.floor(activeSubscribers * monthlyPricePence * prizePoolPct);
}

/**
 * Returns a display-friendly breakdown of the prize pool tiers.
 */
export function formatTierBreakdown(tiers: PrizePoolTier[]): string[] {
  return tiers.map((tier) => {
    const label = tier.tier === 'five_match' ? '5-Match (Jackpot)'
      : tier.tier === 'four_match' ? '4-Match'
      : '3-Match';
    const pct = (tier.percentage * 100).toFixed(0);
    const amount = penceToPounds(tier.gross_amount);
    const perWinner = tier.winner_count > 0
      ? ` — ${penceToPounds(tier.per_winner_amount)} per winner`
      : ' — No winners (rolled over)';
    return `${label} (${pct}%): ${amount}${perWinner}`;
  });
}
