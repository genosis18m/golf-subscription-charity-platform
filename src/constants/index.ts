/**
 * Application-wide constants for the GOLF-Fego.
 * Centralizing these values ensures consistency across the draw engine,
 * pricing, and UI without magic numbers scattered through the codebase.
 */

import type { MatchTier, SubscriptionPlanId } from '@/types';

// ─── Prize Pool ───────────────────────────────────────────────────────────────

/**
 * Distribution percentages for each prize tier.
 * Must sum to 1.0. Adjust carefully — all three tiers are linked.
 *
 * Five-match (jackpot) takes the largest share to incentivise play.
 * Unclaimed tiers roll over to the next draw's jackpot.
 */
export const PRIZE_POOL_PERCENTAGES: Record<MatchTier, number> = {
  five_match: 0.40,
  four_match: 0.35,
  three_match: 0.25,
} as const;

/** Minimum guaranteed jackpot even when prize pool is low (in pence/cents). */
export const MINIMUM_JACKPOT_AMOUNT = 10_000; // £100.00

/** Percentage of each subscription payment that goes into the prize pool. */
export const SUBSCRIPTION_TO_PRIZE_POOL_PCT = 0.60;

// ─── Score Limits ────────────────────────────────────────────────────────────

export const SCORE_LIMITS = {
  /** Minimum valid gross score per round. */
  MIN: 1,
  /** Maximum valid gross score per round (45 draws from 1–45 range). */
  MAX: 45,
  /** Number of most-recent scores kept for rolling average calculation. */
  MAX_STORED: 5,
  /** Minimum scores required before a user is eligible for the algorithmic draw. */
  MIN_FOR_ALGORITHMIC: 1,
} as const;

/** The pool of numbers used in a draw (1 through 45, inclusive). */
export const DRAW_NUMBER_POOL = Array.from({ length: 45 }, (_, i) => i + 1);

/** Number of balls drawn per entry in a monthly draw. */
export const DRAW_BALLS_PER_ENTRY = 5;

// ─── Subscription Plans ───────────────────────────────────────────────────────

export interface SubscriptionPlanConfig {
  id: SubscriptionPlanId;
  label: string;
  description: string;
  price_pence: number; // Price in pence (GBP) or cents (USD)
  price_display: string; // Human-readable price string
  billing_interval: 'month' | 'year';
  stripe_price_id: string; // Set via environment variable in production
  savings_pct: number | null; // Percentage saved vs monthly (null for monthly plan)
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, SubscriptionPlanConfig> = {
  free: {
    id: 'free',
    label: 'Free',
    description: 'Basic access to the platform without entering the prize pools.',
    price_pence: 0,
    price_display: '£0 / forever',
    billing_interval: 'month',
    stripe_price_id: 'price_free',
    savings_pct: null,
    features: [
      'Access member discussions',
      'Follow your favourite charities',
      'View upcoming draw details',
      'Log golf scores strictly for fun',
      'No prize pool eligibility',
    ],
  },
  monthly: {
    id: 'monthly',
    label: 'Monthly',
    description: 'Flexible monthly subscription, cancel anytime.',
    price_pence: 2500, // £25.00/month
    price_display: '£25/month',
    billing_interval: 'month',
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ?? 'price_monthly',
    savings_pct: null,
    features: [
      'One entry per monthly draw',
      'Choose & support your charity',
      'Real-time draw results',
      'Score submission portal',
      'Win up to 40% of the prize pool',
    ],
  },
  yearly: {
    id: 'yearly',
    label: 'Annual',
    description: 'Best value — two months free.',
    price_pence: 25000, // £250.00/year (saves £50)
    price_display: '£250/year',
    billing_interval: 'year',
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID ?? 'price_yearly',
    savings_pct: 17, // ~16.7% saving
    features: [
      'Everything in Monthly',
      'Priority draw entry',
      'Dedicated charity impact report',
      'Annual prize bonus eligibility',
      'Two months FREE',
    ],
  },
} as const;

// ─── Charity Contribution ─────────────────────────────────────────────────────

/** Minimum fraction of subscription that goes to the member's chosen charity. */
export const CHARITY_MIN_CONTRIBUTION_PCT = 0.10; // 10%

/** Maximum fraction of subscription that goes to charity (leaves funds for prizes + ops). */
export const CHARITY_MAX_CONTRIBUTION_PCT = 0.30; // 30%

/** Default contribution percentage shown during onboarding. */
export const CHARITY_DEFAULT_CONTRIBUTION_PCT = 0.15; // 15%

// ─── Draw Configuration ───────────────────────────────────────────────────────

export const DRAW_CADENCE = 'monthly' as const;

/** Day of the month on which draws are typically run (admins can override). */
export const DRAW_DEFAULT_DAY = 28;

export const DRAW_STATUSES = ['draft', 'simulated', 'published', 'archived'] as const;

// ─── Onboarding Steps ─────────────────────────────────────────────────────────

export const ONBOARDING_STEPS = [
  { step: 1, label: 'Your Profile', path: '/onboarding/profile' },
  { step: 2, label: 'Choose Charity', path: '/onboarding/charity' },
  { step: 3, label: 'Subscribe', path: '/onboarding/subscribe' },
] as const;

// ─── Navigation ───────────────────────────────────────────────────────────────

export const PUBLIC_NAV_LINKS = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Charities', href: '/charities' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Draws', href: '/draws' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
] as const;

export const DASHBOARD_NAV_LINKS = [
  { label: 'Overview', href: '/dashboard', icon: 'home' },
  { label: 'My Scores', href: '/dashboard/scores', icon: 'clipboard' },
  { label: 'Draws', href: '/dashboard/draws', icon: 'trophy' },
  { label: 'My Charity', href: '/dashboard/charity', icon: 'heart' },
  { label: 'Winnings', href: '/dashboard/winnings', icon: 'banknotes' },
  { label: 'Subscription', href: '/dashboard/subscription', icon: 'credit-card' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'cog' },
] as const;

export const ADMIN_NAV_LINKS = [
  { label: 'Overview', href: '/admin', icon: 'chart-bar' },
  { label: 'Users', href: '/admin/users', icon: 'users' },
  { label: 'Draws', href: '/admin/draws', icon: 'trophy' },
  { label: 'Charities', href: '/admin/charities', icon: 'heart' },
  { label: 'Winners', href: '/admin/winners', icon: 'star' },
  { label: 'Prize Pool', href: '/admin/prize-pool', icon: 'banknotes' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'chart-line' },
] as const;

// ─── Routes ───────────────────────────────────────────────────────────────────

/** Routes that are publicly accessible without authentication. */
export const PUBLIC_ROUTES = [
  '/',
  '/how-it-works',
  '/charities',
  '/pricing',
  '/draws',
  '/about',
  '/faq',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
] as const;

/** Routes that require admin role. */
export const ADMIN_ROUTES = ['/admin'] as const;

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;
export const ADMIN_TABLE_PAGE_SIZE = 25;

// ─── Format Helpers ───────────────────────────────────────────────────────────

/** Currency code used for display (update for multi-currency support). */
export const CURRENCY_CODE = 'GBP' as const;
export const CURRENCY_SYMBOL = '£' as const;

/** Convert pence to pounds for display. */
export const penceToPounds = (pence: number): string =>
  `${CURRENCY_SYMBOL}${(pence / 100).toFixed(2)}`;
