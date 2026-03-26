/**
 * KPICard component (Admin) — dark design.
 */

import { formatCurrency } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  isCurrency?: boolean;
  suffix?: string;
  description?: string;
  accentColor?: 'green' | 'blue' | 'amber' | 'purple';
}

const accentStyles: Record<string, { border: string; color: string }> = {
  green:  { border: 'rgba(74,255,107,0.3)',  color: 'var(--green)' },
  blue:   { border: 'rgba(96,165,250,0.3)',  color: '#60a5fa' },
  amber:  { border: 'rgba(245,166,35,0.3)',  color: 'var(--gold)' },
  purple: { border: 'rgba(167,139,250,0.3)', color: '#a78bfa' },
};

export function KPICard({
  title,
  value,
  previousValue,
  isCurrency = false,
  suffix,
  description,
  accentColor = 'green',
}: KPICardProps) {
  const accent = accentStyles[accentColor];

  const displayValue =
    isCurrency && typeof value === 'number'
      ? formatCurrency(value)
      : `${value}${suffix ?? ''}`;

  const changePercent =
    previousValue && typeof value === 'number' && previousValue !== 0
      ? (((value - previousValue) / previousValue) * 100).toFixed(1)
      : null;

  const isPositive = changePercent !== null && parseFloat(changePercent) >= 0;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid var(--border)`,
      borderTop: `3px solid ${accent.border}`,
      borderRadius: '16px',
      padding: '20px',
    }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-syne)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </p>
      <p style={{ fontSize: '2rem', fontFamily: 'var(--font-syne)', fontWeight: 800, color: accent.color, marginTop: '6px', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {displayValue}
      </p>

      {changePercent !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '4px',
            background: isPositive ? 'rgba(74,255,107,0.1)' : 'rgba(239,68,68,0.1)',
            color: isPositive ? 'var(--green)' : '#f87171',
          }}>
            {isPositive ? '▲' : '▼'} {Math.abs(parseFloat(changePercent))}%
          </span>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>vs previous period</span>
        </div>
      )}

      {description && (
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px', lineHeight: 1.4 }}>{description}</p>
      )}
    </div>
  );
}
