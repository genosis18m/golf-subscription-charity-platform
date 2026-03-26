/**
 * POST /api/auth/demo — sets a demo session cookie
 * DELETE /api/auth/demo — clears the demo session (sign out)
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateDemoCredentials, encodeDemoSession, DEMO_COOKIE } from '@/lib/demo-auth';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const session = validateDemoCredentials(email, password);

  if (!session) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, role: session.role, name: session.name });
  response.cookies.set(DEMO_COOKIE, encodeDemoSession(session), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(DEMO_COOKIE);
  return response;
}
