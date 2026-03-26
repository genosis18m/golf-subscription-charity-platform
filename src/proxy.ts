/**
 * Next.js proxy guard for auth + demo session handling.
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { DEMO_COOKIE, getDemoSession } from '@/lib/demo-auth';

const PROTECTED  = ['/dashboard', '/onboarding'];
const ADMIN_PATH = '/admin';
const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Check demo session first (no Supabase needed) ──────────────────────
  const demoCookie = request.cookies.get(DEMO_COOKIE)?.value;
  const demoSession = getDemoSession(demoCookie);

  if (demoSession) {
    // Logged-in demo user trying to access auth pages → redirect to dashboard
    if (AUTH_PATHS.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Admin guard for demo admin
    if (pathname.startsWith(ADMIN_PATH) && demoSession.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ── 2. Try Supabase session ────────────────────────────────────────────────
  const { supabaseResponse, user } = await updateSession(request);

  if (user) {
    if (AUTH_PATHS.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (pathname.startsWith(ADMIN_PATH)) {
      const role = user.app_metadata?.role as string | undefined;
      if (role !== 'admin' && role !== 'super_admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    return supabaseResponse;
  }

  // ── 3. No session — guard protected routes ────────────────────────────────
  const needsAuth =
    PROTECTED.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith(ADMIN_PATH);

  if (needsAuth) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)$).*)',
  ],
};
