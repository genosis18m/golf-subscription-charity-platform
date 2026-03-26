'use client';

/**
 * Forgot Password page (/forgot-password) — dark auth design.
 */

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      if (authError) throw authError;
      setIsSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isSent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>📬</div>
        <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.4rem', color: 'var(--cream)' }}>Reset link sent</h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>
          If an account exists for <strong style={{ color: 'var(--cream)' }}>{email}</strong>, a reset link has been sent.
          Check your inbox and spam folder.
        </p>
        <Link href="/login" style={{ fontSize: '13px', color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>
          ← Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
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
          Forgot password?
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.07)',
          border: '1px solid rgba(239,68,68,0.18)',
          borderRadius: '8px',
          padding: '12px 14px',
          fontSize: '13px',
          color: '#f87171',
        }} role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            style={{
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
            }}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(74,255,107,0.35)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
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
          }}
        >
          {isLoading ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--muted)' }}>
        <Link href="/login" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>
          ← Back to Sign In
        </Link>
      </p>
    </div>
  );
}
