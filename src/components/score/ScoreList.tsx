/**
 * ScoreList component.
 *
 * Renders a user's last N scores in a clean list with their rolling
 * average highlighted. Shows which scores are being used in the draw calculation.
 */

import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import { SCORE_LIMITS } from '@/constants';
import type { Score } from '@/types';

interface ScoreListProps {
  scores: Score[];
  rollingAverage?: number | null;
}

export function ScoreList({ scores, rollingAverage }: ScoreListProps) {
  if (scores.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-3xl mb-3">⛳</p>
          <p className="text-slate-600 font-medium">No scores yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Submit your first round to activate draw weighting.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card noPadding>
      {/* Rolling average banner */}
      {rollingAverage !== null && rollingAverage !== undefined && (
        <div className="px-5 py-4 border-b border-slate-100 bg-green-50 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Rolling Average ({Math.min(scores.length, SCORE_LIMITS.MAX_STORED)} scores)
          </p>
          <p className="text-xl font-bold text-green-700">
            {rollingAverage.toFixed(1)}
          </p>
        </div>
      )}

      <ul className="divide-y divide-slate-100" role="list">
        {scores.map((score, index) => (
          <li
            key={score.id}
            className="flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-4">
              {/* Score rank badge */}
              <span
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 text-xs font-medium"
                aria-label={`Score ${index + 1}`}
              >
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {score.course_name ?? 'Round'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatDate(score.round_date, { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">{score.gross_score}</p>
              {score.net_score !== null && (
                <p className="text-xs text-slate-400">Net: {score.net_score}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
