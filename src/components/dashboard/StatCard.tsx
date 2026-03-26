/**
 * StatCard component.
 *
 * KPI card for the dashboard overview. Displays a metric with an optional
 * trend indicator and icon. Used for "Total Donated", "Prize Pool", etc.
 */

import { cn, formatCurrency } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  /** Optional subtitle shown below the value (e.g., "last 3 months"). */
  subtitle?: string;
  /** Optional trend percentage (+/- from previous period). */
  trend?: number;
  /** If true, formats the value as currency. */
  isCurrency?: boolean;
  icon?: React.ReactNode;
  /** Tailwind color class for the icon background (e.g., 'bg-green-100'). */
  iconBgClass?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  isCurrency = false,
  icon,
  iconBgClass = 'bg-slate-100',
}: StatCardProps) {
  const displayValue = isCurrency && typeof value === 'number'
    ? formatCurrency(value)
    : String(value);

  const trendPositive = trend !== undefined && trend >= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4">
      {icon && (
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0',
            iconBgClass
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 font-medium truncate">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5 tabular-nums">{displayValue}</p>

        <div className="flex items-center gap-2 mt-1">
          {trend !== undefined && (
            <span
              className={cn(
                'inline-flex items-center text-xs font-medium',
                trendPositive ? 'text-green-600' : 'text-red-600'
              )}
              aria-label={`${trendPositive ? 'Up' : 'Down'} ${Math.abs(trend)}%`}
            >
              {trendPositive ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-slate-400">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
}
