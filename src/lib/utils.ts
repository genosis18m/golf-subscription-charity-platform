/**
 * Shared utility functions used throughout the application.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS class names, resolving conflicts with tailwind-merge.
 * This is the standard pattern for conditional class composition in the project.
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-green-500', 'text-sm')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as a currency string.
 * Defaults to GBP; pass `currency` to override.
 */
export function formatCurrency(
  pence: number,
  currency = 'GBP',
  locale = 'en-GB'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(pence / 100);
}

/**
 * Formats an ISO date string for display.
 * @example formatDate('2024-03-15') → 'March 15, 2024'
 */
export function formatDate(isoString: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(isoString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

/**
 * Returns the number of days remaining until a target date.
 * Useful for "X days until next draw" countdowns.
 */
export function daysUntil(targetIso: string): number {
  const now = new Date();
  const target = new Date(targetIso);
  const diffMs = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Truncates a string to a maximum length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Converts a string to a URL-safe slug.
 * @example slugify('St Andrews Golf Club') → 'st-andrews-golf-club'
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Returns initials from a full name (up to 2 characters).
 * Used for avatar fallbacks.
 */
export function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

/**
 * Formats a golf handicap index for display.
 * Positive handicaps show as-is; plus handicaps (below 0) show with '+' prefix.
 */
export function formatHandicap(handicap: number): string {
  if (handicap < 0) return `+${Math.abs(handicap)}`;
  return handicap.toFixed(1);
}

/**
 * Determines if a given route path matches the current pathname.
 * Handles nested routes correctly (e.g., /dashboard matches /dashboard/scores).
 */
export function isActiveRoute(pathname: string, href: string, exact = false): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

/**
 * Capitalises the first letter of a string.
 */
export function capitalise(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Safely parses JSON, returning null on failure instead of throwing.
 */
export function safeJsonParse<T>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return null;
  }
}

/**
 * Returns a number clamped between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
