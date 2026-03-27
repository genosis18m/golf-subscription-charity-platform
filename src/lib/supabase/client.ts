/**
 * Browser-side Supabase client.
 * Returns a real client when credentials are configured,
 * otherwise a no-op stub so pages don't crash during dev/demo.
 */

import { createBrowserClient } from '@supabase/ssr';
import { supabaseAnonKey, supabaseUrl, hasSupabaseCredentials } from './config';

export function createClient() {
  if (hasSupabaseCredentials) {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  // Stub — returns a client that fails gracefully without throwing
  return createBrowserClient(
    'https://placeholder.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder'
  );
}
