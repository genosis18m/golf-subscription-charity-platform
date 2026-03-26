/**
 * DrawResult component.
 *
 * Shows the winning numbers from a published draw and the summary
 * of winners per tier. Used on the public draws page and the admin
 * draw detail view.
 */

import { NumberBallRow } from './NumberBall';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import type { Draw, DrawResult as DrawResultType } from '@/types';

interface DrawResultProps {
  draw: Draw;
  result: DrawResultType;
}

export function DrawResult({ draw, result }: DrawResultProps) {
  const pool = draw.prize_pool_snapshot;

  return (
    <Card>
      <Card.Header
        title={`${draw.title} — Draw Results`}
        subtitle={`Published draw · ${result.total_entries} total entries`}
      />

      {/* Winning Numbers */}
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-500 mb-3">Winning Numbers</p>
        <NumberBallRow
          numbers={result.winning_numbers}
          winningNumbers={result.winning_numbers}
          size="lg"
        />
      </div>

      {/* Winner Tiers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TierResult
          label="5-Match Jackpot"
          winners={result.five_match_winners.length}
          tierAmount={pool?.tiers.find((t) => t.tier === 'five_match')?.gross_amount ?? 0}
          perWinner={pool?.tiers.find((t) => t.tier === 'five_match')?.per_winner_amount ?? 0}
          color="amber"
        />
        <TierResult
          label="4-Match"
          winners={result.four_match_winners.length}
          tierAmount={pool?.tiers.find((t) => t.tier === 'four_match')?.gross_amount ?? 0}
          perWinner={pool?.tiers.find((t) => t.tier === 'four_match')?.per_winner_amount ?? 0}
          color="green"
        />
        <TierResult
          label="3-Match"
          winners={result.three_match_winners.length}
          tierAmount={pool?.tiers.find((t) => t.tier === 'three_match')?.gross_amount ?? 0}
          perWinner={pool?.tiers.find((t) => t.tier === 'three_match')?.per_winner_amount ?? 0}
          color="blue"
        />
      </div>
    </Card>
  );
}

function TierResult({
  label,
  winners,
  tierAmount,
  perWinner,
  color,
}: {
  label: string;
  winners: number;
  tierAmount: number;
  perWinner: number;
  color: 'amber' | 'green' | 'blue';
}) {
  const colorClasses = {
    amber: 'bg-amber-50 border-amber-200',
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
  };

  const textClasses = {
    amber: 'text-amber-800',
    green: 'text-green-800',
    blue: 'text-blue-800',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <p className={`text-sm font-semibold mb-2 ${textClasses[color]}`}>{label}</p>
      <p className="text-2xl font-bold text-slate-900">
        {winners === 0 ? 'Rolled Over' : `${winners} winner${winners !== 1 ? 's' : ''}`}
      </p>
      <p className="text-sm text-slate-600 mt-1">
        {winners > 0
          ? `${formatCurrency(perWinner)} each`
          : `${formatCurrency(tierAmount)} → next draw`}
      </p>
    </div>
  );
}
