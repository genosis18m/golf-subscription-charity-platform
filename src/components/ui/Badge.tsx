/**
 * Badge primitive component.
 *
 * Used throughout the platform for subscription status, draw status,
 * winner verification status, and user role indicators.
 */

import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'outline';

export type BadgeSize = 'sm' | 'md';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
  outline: 'bg-transparent border border-slate-300 text-slate-700',
};

const dotColorClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  purple: 'bg-purple-500',
  outline: 'bg-slate-500',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs',
};

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColorClasses[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

// ─── Convenience Components ───────────────────────────────────────────────────

/** Maps subscription status strings to appropriate badge variants. */
export function SubscriptionStatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    active: 'success',
    trialing: 'info',
    past_due: 'warning',
    canceled: 'danger',
    unpaid: 'danger',
    incomplete: 'warning',
  };
  return (
    <Badge variant={map[status] ?? 'default'} dot>
      {status.replace('_', ' ')}
    </Badge>
  );
}

/** Maps draw status strings to appropriate badge variants. */
export function DrawStatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    draft: 'default',
    simulated: 'info',
    published: 'success',
    archived: 'outline',
  };
  return (
    <Badge variant={map[status] ?? 'default'}>
      {status}
    </Badge>
  );
}
