/**
 * Card primitive component.
 *
 * A flexible container with consistent border, shadow, and padding.
 * Exported as compound components (Card, Card.Header, Card.Body, Card.Footer)
 * so consumers can compose the layout they need.
 */

import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Removes padding from the card body. Useful for full-bleed images or tables. */
  noPadding?: boolean;
}

export function Card({ children, className, noPadding = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-200 shadow-sm',
        !noPadding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

Card.Header = function CardHeader({
  title,
  subtitle,
  action,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)} {...props}>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
};

Card.Body = function CardBody({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-4 pt-4 border-t border-slate-100', className)}
      {...props}
    >
      {children}
    </div>
  );
};
