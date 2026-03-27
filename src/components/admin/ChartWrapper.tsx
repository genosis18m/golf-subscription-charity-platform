'use client';

/**
 * ChartWrapper component (Admin).
 *
 * A loading/error wrapper for chart components. Displays a skeleton
 * while data loads and an error state if the fetch fails.
 * Actual chart rendering is delegated to child components which use
 * a charting library like recharts or chart.js.
 *
 * Usage:
 * <ChartWrapper title="Subscriber Growth" isLoading={loading}>
 *   <MyRechartsLineChart data={data} />
 * </ChartWrapper>
 */

import { Skeleton } from '@/components/ui/Skeleton';

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  error?: string | null;
  /** Chart height in pixels. Defaults to 280. */
  height?: number;
  children: React.ReactNode;
}

export function ChartWrapper({
  title,
  subtitle,
  isLoading = false,
  error = null,
  height = 280,
  children,
}: ChartWrapperProps) {
  return (
    <div
      className="rounded-2xl p-5 shadow-sm"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--cream)', fontFamily: 'var(--font-syne)' }}>
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
            {subtitle}
          </p>
        ) : null}
      </div>

      <div style={{ height }} className="relative">
        {isLoading ? (
          <div className="absolute inset-0 space-y-3">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ color: 'var(--muted)' }}>
            <span className="text-3xl">📊</span>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
