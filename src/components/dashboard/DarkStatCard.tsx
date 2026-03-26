/**
 * DarkStatCard — KPI card for the dark dashboard.
 */

interface DarkStatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
  accent?: 'green' | 'gold' | 'neutral';
}

export function DarkStatCard({ title, value, subtitle, icon, accent = 'green' }: DarkStatCardProps) {
  const accentColor =
    accent === 'green' ? 'var(--green)' :
    accent === 'gold'  ? 'var(--gold)'  :
    'rgba(255,255,255,0.35)';

  const accentBg =
    accent === 'green' ? 'rgba(74,255,107,0.07)'  :
    accent === 'gold'  ? 'rgba(245,166,35,0.07)' :
    'rgba(255,255,255,0.04)';

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '22px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '12px', fontFamily: 'var(--font-syne)', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          {title}
        </p>
        {icon && (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: accentBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
          }}>
            {icon}
          </div>
        )}
      </div>
      <div>
        <p style={{
          fontFamily: 'var(--font-syne)',
          fontWeight: 800,
          fontSize: '1.75rem',
          color: accentColor,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          marginBottom: subtitle ? '6px' : 0,
        }}>
          {value}
        </p>
        {subtitle && (
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}
