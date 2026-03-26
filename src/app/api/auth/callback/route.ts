/**
 * Supabase OAuth/Email Callback Handler.
 *
 * Exchanges the `code` parameter (from Supabase email confirmation or
 * OAuth redirect) for a session, then redirects the user to their
 * intended destination.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (!code) {
    // No code — something went wrong with the OAuth flow
    return NextResponse.redirect(
      `${origin}/login?error=missing_code`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Auth callback error:', error.message);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    sendWelcomeEmail({
      to: user.email,
      fullName:
        typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null,
    }).catch((emailError) => {
      console.error('Welcome email error:', emailError);
    });
  }

  const safeNext = next.startsWith('/') ? next : '/dashboard';
  return NextResponse.redirect(`${origin}${safeNext}`);
}
