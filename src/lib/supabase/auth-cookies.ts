type CookieLike = { name: string };

export function hasSupabaseAuthCookies(cookies: CookieLike[]): boolean {
  return cookies.some(({ name }) =>
    name.startsWith('sb-') ||
    name.startsWith('__Host-sb-') ||
    name.startsWith('__Secure-sb-') ||
    name.includes('supabase') ||
    name.includes('auth-token')
  );
}
