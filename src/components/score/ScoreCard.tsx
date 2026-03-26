/**
 * ScoreCard component.
 *
 * Compact summary card showing a user's latest score, rolling average,
 * and handicap. Used in the dashboard overview.
 */

import { Card } from '@/components/ui/Card';
import { formatHandicap } from '@/lib/utils';
import type { Score } from '@/types';

interface ScoreCardProps {
  latestScore: Score | null;
  rollingAverage: number | null;
  handicap: number | null;
  scoresCount: number;
}

export function ScoreCard({
  latestScore,
  rollingAverage,
  handicap,
  scoresCount,
}: ScoreCardProps) {
  return (
    <Card>
      <Card.Header
        title="My Scores"
        subtitle={`${scoresCount} score${scoresCount !== 1 ? 's' : ''} submitted`}
      />

      <div className="grid grid-cols-3 gap-4">
        <Stat
          label="Latest"
          value={latestScore?.gross_score.toString() ?? '—'}
          sublabel="gross score"
        />
        <Stat
          label="Rolling Avg"
          value={rollingAverage !== null ? rollingAverage.toFixed(1) : '—'}
          sublabel="last 5 rounds"
        />
        <Stat
          label="Handicap"
          value={handicap !== null ? formatHandicap(handicap) : '—'}
          sublabel="index"
        />
      </div>
    </Card>
  );
}

function Stat({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <div className="text-center">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>
    </div>
  );
}
