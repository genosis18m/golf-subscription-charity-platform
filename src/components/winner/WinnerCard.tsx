/**
 * WinnerCard component.
 *
 * Shows a winner's prize details, match tier, prize amount, and status.
 * Used in both the member winnings page and the admin winners queue.
 */

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { NumberBallRow } from '@/components/draw/NumberBall';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Winner } from '@/types';

interface WinnerCardProps {
  winner: Winner;
  /** Show admin action buttons if true. */
  showActions?: boolean;
  onVerify?: (winner: Winner) => void;
  onReject?: (winner: Winner) => void;
  onMarkPaid?: (winner: Winner) => void;
}

const statusVariantMap: Record<Winner['status'], 'warning' | 'success' | 'danger' | 'info'> = {
  pending: 'warning',
  verified: 'success',
  rejected: 'danger',
  paid: 'info',
};

const tierLabelMap: Record<Winner['match_tier'], string> = {
  five_match: '5-Match Jackpot',
  four_match: '4-Match Prize',
  three_match: '3-Match Prize',
};

export function WinnerCard({ winner, showActions, onVerify, onReject, onMarkPaid }: WinnerCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {tierLabelMap[winner.match_tier]}
          </p>
          {winner.draw && (
            <p className="text-xs text-slate-500 mt-0.5">{winner.draw.title}</p>
          )}
        </div>
        <Badge variant={statusVariantMap[winner.status]} dot>
          {winner.status}
        </Badge>
      </div>

      {/* Matched numbers */}
      <div className="mb-4">
        <p className="text-xs text-slate-500 mb-2">Matched Numbers</p>
        <NumberBallRow numbers={winner.matched_numbers} size="sm" />
      </div>

      {/* Prize amount */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs text-slate-500">Prize Amount</p>
          <p className="text-xl font-bold text-green-700 mt-0.5">
            {formatCurrency(winner.prize_amount)}
          </p>
        </div>
        {winner.paid_at && (
          <div className="text-right">
            <p className="text-xs text-slate-500">Paid on</p>
            <p className="text-sm text-slate-700 mt-0.5">
              {formatDate(winner.paid_at, { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>

      {/* Admin actions */}
      {showActions && winner.status === 'pending' && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
          <button
            onClick={() => onVerify?.(winner)}
            className="flex-1 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Verify
          </button>
          <button
            onClick={() => onReject?.(winner)}
            className="flex-1 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Reject
          </button>
        </div>
      )}
      {showActions && winner.status === 'verified' && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => onMarkPaid?.(winner)}
            className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Mark as Paid
          </button>
        </div>
      )}
    </Card>
  );
}
