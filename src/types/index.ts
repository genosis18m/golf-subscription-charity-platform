/**
 * Core TypeScript interfaces for the Golf Charity Subscription Platform.
 * These types mirror the Supabase database schema and are used throughout
 * the application for consistent type safety.
 */

// ─── User & Profile ───────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  role: UserRole;
}

export type UserRole = 'member' | 'admin' | 'super_admin';

export interface Profile {
  id: string; // references auth.users.id
  user_id: string;
  full_name: string;
  display_name: string | null;
  handicap: number | null; // Golf handicap index (-10 to 54)
  golf_club: string | null; // Club name
  avatar_url: string | null;
  phone: string | null;
  notification_preferences: NotificationPreferences;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  email_draw_results: boolean;
  email_score_reminders: boolean;
  email_subscription_updates: boolean;
  sms_enabled: boolean;
}

// ─── Score ────────────────────────────────────────────────────────────────────

export interface Score {
  id: string;
  user_id: string;
  round_date: string; // ISO date string
  gross_score: number; // Actual strokes taken
  net_score: number | null; // gross_score - handicap
  course_name: string | null;
  notes: string | null;
  submitted_at: string;
  created_at: string;
}

/**
 * Rolling average computed from up to the last 5 submitted scores.
 * Used as the primary metric for draw weighting in the algorithmic draw engine.
 */
export interface RollingScoreAverage {
  user_id: string;
  average_gross: number;
  average_net: number | null;
  scores_count: number; // 1–5
  computed_at: string;
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

export type DrawStatus = 'draft' | 'simulated' | 'published' | 'archived';
export type DrawLogicType = 'random' | 'algorithmic';

export interface Draw {
  id: string;
  title: string;
  draw_month: string; // e.g. "2024-03" — month this draw covers
  logic_type: DrawLogicType;
  status: DrawStatus;
  prize_pool_snapshot: PrizePool; // snapshot at time of draw
  simulated_at: string | null;
  published_at: string | null;
  created_by: string; // admin user_id
  created_at: string;
  updated_at: string;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  entry_numbers: number[]; // The 5 numbers drawn for this user [1–45]
  is_eligible: boolean; // Must have active subscription + ≥1 score
  created_at: string;
}

export interface DrawResult {
  id: string;
  draw_id: string;
  winning_numbers: number[]; // The 5 drawn winning numbers
  five_match_winners: string[]; // user_ids with all 5 matching
  four_match_winners: string[]; // user_ids with 4 matching
  three_match_winners: string[]; // user_ids with 3 matching
  total_entries: number;
  created_at: string;
}

// ─── Charity ──────────────────────────────────────────────────────────────────

export interface Charity {
  id: string;
  slug: string; // URL-safe identifier
  name: string;
  tagline: string | null;
  description: string;
  logo_url: string | null;
  banner_url: string | null;
  gallery_urls: string[];
  website_url: string | null;
  registration_number: string | null; // Official charity registration
  is_active: boolean;
  is_featured: boolean;
  total_raised: number; // Running total in pence/cents
  supporter_count: number; // Users currently backing this charity
  events: CharityEvent[];
  created_at: string;
  updated_at: string;
}

export interface CharityEvent {
  id: string;
  charity_id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
}

// ─── Winner ───────────────────────────────────────────────────────────────────

export type WinnerStatus = 'pending' | 'verified' | 'rejected' | 'paid';
export type MatchTier = 'five_match' | 'four_match' | 'three_match';

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  match_tier: MatchTier;
  prize_amount: number; // In pence/cents
  matched_numbers: number[];
  status: WinnerStatus;
  proof_url: string | null; // Supabase Storage URL for proof upload
  verified_by: string | null; // admin user_id
  verified_at: string | null;
  paid_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  profile?: Profile;
  draw?: Draw;
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete';

export type SubscriptionPlanId = 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  plan_id: SubscriptionPlanId;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_end: string | null;
  charity_id: string; // Currently selected charity
  charity_contribution_pct: number; // e.g. 0.15 = 15% of subscription to charity
  created_at: string;
  updated_at: string;
  // Joined relations
  charity?: Charity;
}

// ─── Prize Pool ───────────────────────────────────────────────────────────────

export interface PrizePool {
  id: string;
  draw_id: string | null; // null if this is the current live pool
  total_amount: number; // In pence/cents
  tiers: PrizePoolTier[];
  jackpot_rolled_over: number; // Amount rolled in from previous unclaimed jackpot
  computed_at: string;
}

export interface PrizePoolTier {
  tier: MatchTier;
  percentage: number; // e.g. 0.40 = 40%
  gross_amount: number; // total_amount * percentage
  winner_count: number; // Actual winners in this tier
  per_winner_amount: number; // gross_amount / winner_count (or 0 if no winners)
  rolled_over: boolean; // true if no winners — rolls to next draw jackpot
}

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType =
  | 'draw_published'
  | 'winner_verified'
  | 'score_reminder'
  | 'subscription_renewal'
  | 'subscription_canceled'
  | 'prize_paid';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

// ─── API Response Shapes ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface ProfileFormValues {
  full_name: string;
  display_name: string;
  handicap: number | null;
  golf_club: string;
  phone: string;
}

export interface ScoreFormValues {
  round_date: string;
  gross_score: number;
  course_name: string;
  notes: string;
}

export interface DrawConfigFormValues {
  title: string;
  draw_month: string;
  logic_type: DrawLogicType;
  prize_pool_amount: number;
}

export interface CharityFormValues {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  website_url: string;
  registration_number: string;
  is_active: boolean;
  is_featured: boolean;
}
