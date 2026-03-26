/**
 * Server-side Supabase client.
 * Fails gracefully when NEXT_PUBLIC_SUPABASE_URL / ANON_KEY are not set
 * (i.e. during local dev before credentials are configured).
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

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
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
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
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, charity:charities(*)')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}
