/**
 * Shared Supabase public configuration.
 *
 * The anon key is intentionally safe to expose to browsers; RLS and auth rules
 * still protect data access. We keep the live project's public config here so
 * auth continues to work even if a deployment has stale NEXT_PUBLIC_* vars.
 */

const FALLBACK_SUPABASE_URL = 'https://ouxdmqzfdslcsuqxgeof.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91eGRtcXpmZHNsY3N1cXhnZW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MjgyMjksImV4cCI6MjA5MDEwNDIyOX0.-aftiDMyw02apgUsvraMQpEbgOctqebBzfJ_YjUJblk';

export const supabaseUrl = FALLBACK_SUPABASE_URL;
export const supabaseAnonKey = FALLBACK_SUPABASE_ANON_KEY;

export const hasSupabaseCredentials = Boolean(supabaseUrl && supabaseAnonKey);
