'use client';

/**
 * Button — design-system primitive.
 * Uses the CSS class-based design tokens from globals.css (.btn, .btn-primary, etc.)
 * so styles are centrally maintained and consistent everywhere.
 */

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'outline' | 'gold' | 'ghost' | 'danger';
export type ButtonSize    = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  gold:    'btn-gold',
  ghost:   'text-[var(--cream-dim)] hover:text-[var(--cream)] hover:bg-[var(--bg-card)] rounded-full transition-colors',
  danger:  'bg-red-500/90 text-white hover:bg-red-400 rounded-full transition-colors',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
  xl: 'btn-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, children, className, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'btn',
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{ fontFamily: 'var(--font-syne)' }}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : leftIcon ? (
        <span aria-hidden="true">{leftIcon}</span>
      ) : null}

      {children}

      {!isLoading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
    </button>
  );
});
