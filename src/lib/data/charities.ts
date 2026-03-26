/**
 * Charity data access layer.
 *
 * Tries Supabase first; falls back to seed data when credentials
 * are not configured. This keeps the feature working for local dev / demos
 * while being production-ready when credentials are supplied.
 */

import type { Charity } from '@/types';
import { SEED_CHARITIES, getCharityBySlug as getSeedBySlug } from './seed-charities';

const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here'
);

/** Returns all active charities, featured first. */
export async function fetchCharities(): Promise<Charity[]> {
  if (hasSupabase) {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('charities')
        .select('*, events:charity_events(*)')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('supporter_count', { ascending: false });
      if (!error && data?.length) return data as Charity[];
    } catch {
      // fall through to seed data
    }
  }
  return SEED_CHARITIES.filter((c) => c.is_active);
}

/** Returns up to `limit` featured charities for the homepage. */
export async function fetchFeaturedCharities(limit = 3): Promise<Charity[]> {
  if (hasSupabase) {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('charities')
        .select('id, name, slug, tagline, description, logo_url, banner_url, total_raised, supporter_count, is_featured')
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(limit);
      if (!error && data?.length) return data as Charity[];
    } catch {
      // fall through
    }
  }
  return SEED_CHARITIES.filter((c) => c.is_active && c.is_featured).slice(0, limit);
}

/** Returns a single charity by slug. */
export async function fetchCharityBySlug(slug: string): Promise<Charity | null> {
  if (hasSupabase) {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('charities')
        .select('*, events:charity_events(*)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      if (!error && data) return data as Charity;
    } catch {
      // fall through
    }
  }
  return getSeedBySlug(slug);
}

/** Returns a single charity by ID. */
export async function fetchCharityById(id: string): Promise<Charity | null> {
  if (hasSupabase) {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('charities')
        .select('*, events:charity_events(*)')
        .eq('id', id)
        .single();
      if (!error && data) return data as Charity;
    } catch {
      // fall through
    }
  }
  return SEED_CHARITIES.find((c) => c.id === id) ?? null;
}
