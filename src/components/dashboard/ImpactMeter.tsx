/**
 * ImpactMeter component.
 *
 * Visual representation of how much the member has contributed to their
 * charity over the lifetime of their subscription. Shows cumulative total
 * and a progress ring towards a milestone amount.
 */

import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

interface ImpactMeterProps {
  charityName: string;
  charityLogoUrl?: string | null;
  totalDonatedPence: number;
  /** Milestone target in pence (e.g. £100 = 10000). */
  milestonePence: number;
  contributionPct: number;
}

export function ImpactMeter({
  charityName,
  charityLogoUrl,
  totalDonatedPence,
  milestonePence,
  contributionPct,
}: ImpactMeterProps) {
  const progress = Math.min(1, totalDonatedPence / milestonePence);
  const circumference = 2 * Math.PI * 36; // r=36
  const offset = circumference - progress * circumference;

  return (
    <Card>
      <Card.Header
        title="Charity Impact"
        subtitle={charityName}
      />

      <div className="flex items-center gap-6">
        {/* Progress ring */}
        <div className="relative w-24 h-24 flex-shrink-0" aria-hidden="true">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
            {/* Track */}
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="6"
            />
            {/* Progress */}
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#16a34a"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          {charityLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={charityLogoUrl}
              alt={charityName}
              className="absolute inset-3 w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)] object-contain rounded-full"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-2xl">
              💚
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
              Total Donated
            </p>
            <p className="text-2xl font-bold text-green-700 mt-0.5">
              {formatCurrency(totalDonatedPence)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">
              {Math.round(progress * 100)}% to {formatCurrency(milestonePence)} milestone
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {contributionPct * 100}% of your subscription
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
