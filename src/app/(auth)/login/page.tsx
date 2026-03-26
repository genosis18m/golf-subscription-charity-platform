'use client';

/**
 * Login page — dark design with demo credentials quick-fill.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function fill(type: 'member' | 'admin') {
    if (type === 'member') {
      setEmail('demo@golfcharity.com');
      setPassword('Demo1234!');
    } else {
      setEmail('admin@golfcharity.com');
      setPassword('Admin1234!');
    }
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // 1. Try demo auth first
    try {
      const demoRes = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (demoRes.ok) {
        router.push(redirectTo);
        router.refresh();
        return;
      }
    } catch {
      // ignore — fall through to Supabase
    }

    // 2. Fall back to Supabase
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError('Invalid email or password. Use the demo buttons above to try the platform.');
        setIsLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
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
            onClick={() => fill('member')}
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
            }}
          >
            Member Account
          </button>
          <button
            type="button"
            onClick={() => fill('admin')}
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
            }}
          >
            Admin Account
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
            onChange={(e) => setEmail(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
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
