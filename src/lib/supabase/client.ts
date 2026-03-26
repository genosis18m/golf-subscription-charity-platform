/**
 * Browser-side Supabase client.
 * Returns a real client when credentials are configured,
 * otherwise a no-op stub so pages don't crash during dev/demo.
 */

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const REAL_CREDS =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here';

export function createClient() {
  if (REAL_CREDS) {
    return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  }
  // Stub — returns a client that fails gracefully without throwing
  return createBrowserClient(
    'https://placeholder.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder'
  );
}
