/**
 * Server-side Supabase client.
 * Fails gracefully when NEXT_PUBLIC_SUPABASE_URL / ANON_KEY are not set
 * (i.e. during local dev before credentials are configured).
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { withTimeout } from '@/lib/with-timeout';
import { hasSupabaseAuthCookies } from './auth-cookies';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const SUPABASE_REQUEST_TIMEOUT_MS = 2500;

const hasCredentials = Boolean(supabaseUrl && supabaseAnonKey);

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Safe to ignore in Server Components — middleware handles refresh
          }
        },
      },
    }
  );
}

export async function getAuthUser() {
  if (!hasCredentials) return null;
  try {
    const cookieStore = await cookies();
    if (!hasSupabaseAuthCookies(cookieStore.getAll())) return null;

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await withTimeout(
      supabase.auth.getUser(),
      SUPABASE_REQUEST_TIMEOUT_MS,
      'Supabase auth timed out'
    );
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

export async function getUserProfile(userId: string) {
  if (!hasCredentials) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await withTimeout(
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single(),
      SUPABASE_REQUEST_TIMEOUT_MS,
      'Profile query timed out'
    );
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getUserSubscription(userId: string) {
  if (!hasCredentials) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await withTimeout(
      supabase
        .from('subscriptions')
        .select('*, charity:charities(*)')
        .eq('user_id', userId)
        .in('status', ['active', 'trialing'])
        .single(),
      SUPABASE_REQUEST_TIMEOUT_MS,
      'Subscription query timed out'
    );
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}
