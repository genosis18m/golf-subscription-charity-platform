/**
 * NumberBall — the platform's signature visual element.
 * Each Stableford score / draw number is rendered as a styled spherical token.
 * Used in draw results, hero backgrounds, prize tier displays, and user dashboards.
 */

import { cn } from '@/lib/utils';

export type BallVariant = 'default' | 'gold' | 'green' | 'ghost' | 'match' | 'miss';
export type BallSize   = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_STYLES: Record<BallSize, { size: string; font: string }> = {
  xs: { size: '28px',  font: '11px' },
  sm: { size: '36px',  font: '13px' },
  md: { size: '48px',  font: '16px' },
  lg: { size: '64px',  font: '20px' },
  xl: { size: '80px',  font: '26px' },
};

const VARIANT_STYLES: Record<BallVariant, React.CSSProperties> = {
  default: {
    background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.08), transparent 60%), var(--bg-card)',
    borderColor: 'var(--border-mid)',
    color: 'var(--cream-dim)',
  },
  gold: {
    background: 'radial-gradient(circle at 35% 30%, rgba(245,166,35,0.25), transparent 65%), #1A1200',
    borderColor: 'rgba(245,166,35,0.35)',
    color: 'var(--gold)',
    boxShadow: '0 0 20px rgba(245,166,35,0.18)',
  },
  green: {
    background: 'radial-gradient(circle at 35% 30%, rgba(74,255,107,0.2), transparent 65%), #001204',
    borderColor: 'rgba(74,255,107,0.3)',
    color: 'var(--green)',
    boxShadow: '0 0 20px rgba(74,255,107,0.15)',
  },
  ghost: {
    background: 'transparent',
    borderColor: 'rgba(255,255,255,0.05)',
    color: 'var(--muted)',
    opacity: 0.4,
  },
  match: {
    background: 'radial-gradient(circle at 35% 30%, rgba(74,255,107,0.25), transparent 65%), #001204',
    borderColor: 'rgba(74,255,107,0.35)',
    color: 'var(--green)',
    boxShadow: '0 0 24px rgba(74,255,107,0.2)',
  },
  miss: {
    background: 'var(--bg-card)',
    borderColor: 'var(--border)',
    color: 'var(--muted)',
    opacity: 0.5,
  },
};

interface NumberBallProps {
  value: number;
  variant?: BallVariant;
  size?: BallSize;
  className?: string;
  animate?: boolean;
  reveal?: boolean;
  style?: React.CSSProperties;
}

export function NumberBall({
  value,
  variant = 'default',
  size = 'md',
  className,
  animate = false,
  reveal = false,
  style,
}: NumberBallProps) {
  const { size: wh, font } = SIZE_STYLES[size];
  const variantStyle = VARIANT_STYLES[variant];

  return (
    <span
      className={cn(
        'number-ball',
        animate && 'animate-float-c',
        reveal && 'animate-reveal-in',
        className
      )}
      style={{
        width: wh,
        height: wh,
        fontSize: font,
        ...variantStyle,
        ...style,
      }}
      aria-label={`Number ${value}${variant === 'match' ? ' (matched)' : ''}`}
    >
      {value}
    </span>
  );
}

// ─── NumberBallRow — draw result display ─────────────────────────────────────

interface NumberBallRowProps {
  /** The 5 drawn numbers (preferred prop name) */
  drawn?: number[];
  /** Alias for drawn — accepted for backward compat */
  numbers?: number[];
  /** User's submitted scores — used to highlight matches */
  userScores?: number[];
  /** Alias for userScores — accepted for backward compat */
  winningNumbers?: number[];
  size?: BallSize;
  className?: string;
}

export function NumberBallRow({ drawn, numbers, userScores, winningNumbers, size = 'md', className }: NumberBallRowProps) {
  const resolvedDrawn = drawn ?? numbers ?? [];
  const resolvedScores = userScores ?? winningNumbers ?? [];
  const matchSet = new Set(resolvedScores);

  return (
    <div
      className={cn('flex items-center gap-2 flex-wrap', className)}
      role="list"
      aria-label="Draw numbers"
    >
      {resolvedDrawn.map((n, i) => {
        const isMatch = resolvedScores.length > 0 && matchSet.has(n);
        return (
          <NumberBall
            key={`${n}-${i}`}
            value={n}
            variant={resolvedScores.length === 0 ? 'gold' : isMatch ? 'match' : 'miss'}
            size={size}
          />
        );
      })}
    </div>
  );
}
