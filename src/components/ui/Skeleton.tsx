/**
 * Skeleton loading component.
 *
 * Used to display placeholder shapes while content is loading.
 * Wrap data-dependent content in these during async data fetching.
 */

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Renders as a circle (useful for avatars). */
  circle?: boolean;
}

export function Skeleton({ circle = false, className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-slate-200',
        circle ? 'rounded-full' : 'rounded-md',
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

/** Pre-built skeleton for a stat/KPI card. */
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

/** Pre-built skeleton for a table row. */
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/** Pre-built skeleton for a charity card. */
export function CharityCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
