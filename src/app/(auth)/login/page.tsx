'use client';

/**
 * Login page — dark design with demo credentials quick-fill.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function getLoginErrorMessage(errorCode: string | null) {
  if (!errorCode) return null;

  if (errorCode === 'missing_code') {
    return 'That sign-in link is missing required data. Request a fresh link and try again.';
  }

  return decodeURIComponent(errorCode.replace(/\+/g, ' '));
}

function getDemoCredentials(type: 'member' | 'admin') {
  if (type === 'member') {
    return { email: 'demo@golfcharity.com', password: 'Demo1234!' };
  }

  return { email: 'admin@golfcharity.com', password: 'Admin1234!' };
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard';
  const prefersAdminDefault =
    !searchParams.get('redirectTo') || searchParams.get('redirectTo')?.startsWith('/dashboard');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(() => getLoginErrorMessage(searchParams.get('error')));
  const [isLoading, setIsLoading] = useState(false);

  function getDestination(role?: string) {
    if ((role === 'admin' || role === 'super_admin') && prefersAdminDefault) {
      return '/admin';
    }

    return redirectTo;
  }

  function clearError() {
    if (error) {
      setError(null);
    }
  }

  async function signInWithDemoCredentials(nextEmail: string, nextPassword: string) {
    const demoRes = await fetch('/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: nextEmail.trim(), password: nextPassword }),
    });

    if (!demoRes.ok) {
      return false;
    }

    const data = await demoRes.json();
    window.location.assign(getDestination(data.role));
    return true;
  }

  async function handleDemoAccess(type: 'member' | 'admin') {
    const credentials = getDemoCredentials(type);

    setEmail(credentials.email);
    setPassword(credentials.password);
    setError(null);
    setIsLoading(true);

    try {
      if (await signInWithDemoCredentials(credentials.email, credentials.password)) {
        return;
      }
    } catch {
      // fall through to inline error
    }

    setError('Demo sign-in is temporarily unavailable. Try again in a moment.');
    setIsLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // 1. Try demo auth first
    try {
      if (await signInWithDemoCredentials(email, password)) {
        return;
      }
    } catch {
      // ignore — fall through to Supabase
    }

    // 2. Fall back to Supabase
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError('Invalid email or password. Use the demo buttons above to try the platform.');
        setIsLoading(false);
        return;
      }

      const role = data.user?.app_metadata?.role;
      window.location.assign(getDestination(role));
    } catch {
      setError('Invalid email or password. Use the demo buttons above to try the platform.');
      setIsLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '11px 14px',
    fontSize: '14px',
    color: 'var(--cream)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Heading */}
      <div>
        <h1 style={{
          fontFamily: 'var(--font-syne)',
          fontWeight: 800,
          fontSize: '1.85rem',
          color: 'var(--cream)',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginBottom: '8px',
        }}>
          Welcome back
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>
          Sign in to your account — or use a demo below.
        </p>
      </div>

      {/* Demo access panel */}
      <div style={{
        background: 'rgba(74,255,107,0.04)',
        border: '1px solid rgba(74,255,107,0.15)',
        borderRadius: '12px',
        padding: '16px',
      }}>
        <p style={{
          fontSize: '10px',
          fontFamily: 'var(--font-syne)',
          fontWeight: 700,
          color: 'var(--green)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '12px',
          opacity: 0.8,
        }}>
          Demo Access — no signup required
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleDemoAccess('member')}
            disabled={isLoading}
            style={{
              fontSize: '12px',
              padding: '7px 14px',
              borderRadius: '7px',
              background: 'rgba(74,255,107,0.08)',
              border: '1px solid rgba(74,255,107,0.2)',
              color: 'var(--green)',
              cursor: 'pointer',
              fontFamily: 'var(--font-syne)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              transition: 'background 0.15s',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            Continue as Member
          </button>
          <button
            type="button"
            onClick={() => handleDemoAccess('admin')}
            disabled={isLoading}
            style={{
              fontSize: '12px',
              padding: '7px 14px',
              borderRadius: '7px',
              background: 'rgba(245,166,35,0.08)',
              border: '1px solid rgba(245,166,35,0.2)',
              color: 'var(--gold)',
              cursor: 'pointer',
              fontFamily: 'var(--font-syne)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              transition: 'background 0.15s',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            Continue as Admin
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.07)',
          border: '1px solid rgba(239,68,68,0.18)',
          borderRadius: '8px',
          padding: '12px 14px',
          fontSize: '13px',
          color: '#f87171',
          lineHeight: 1.5,
        }} role="alert">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Email */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="email" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--cream)', opacity: 0.75 }}>
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              clearError();
              setEmail(e.target.value);
            }}
            required
            placeholder="you@example.com"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(74,255,107,0.35)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>

        {/* Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="password" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--cream)', opacity: 0.75 }}>
              Password
            </label>
            <Link
              href="/forgot-password"
              style={{ fontSize: '12px', color: 'var(--green)', textDecoration: 'none', opacity: 0.7 }}
            >
              Forgot?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              clearError();
              setPassword(e.target.value);
            }}
            required
            placeholder="Your password"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(74,255,107,0.35)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            marginTop: '4px',
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            background: isLoading ? 'rgba(74,255,107,0.4)' : 'var(--green)',
            color: '#07090A',
            fontFamily: 'var(--font-syne)',
            fontWeight: 700,
            fontSize: '14px',
            letterSpacing: '-0.01em',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.15s',
          }}
        >
          {isLoading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      {/* Divider */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
