'use client';

/**
 * Reset Password page (/reset-password) — dark auth design.
 *
 * Renders after the user clicks the reset link from their email.
 * Supabase includes the session token in the URL hash.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

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

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setSessionReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrors({ form: error.message });
      setIsLoading(false);
      return;
    }
    setIsSuccess(true);
    setTimeout(() => router.push('/dashboard'), 2000);
  }

  if (isSuccess) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>✅</div>
        <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.4rem', color: 'var(--cream)' }}>Password updated!</h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>
          Redirecting you to the dashboard…
        </p>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontSize: '14px' }}>
        Processing reset link…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{
          fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.85rem',
          color: 'var(--cream)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '8px',
        }}>
          Set a new password
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>
          Choose a strong password for your account.
        </p>
      </div>

      {errors.form && (
        <div style={{
          background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)',
          borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#f87171',
        }} role="alert">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="password" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--cream)', opacity: 0.75 }}>
            New Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Minimum 8 characters"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(74,255,107,0.35)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
          {errors.password && <p style={{ fontSize: '12px', color: '#f87171', marginTop: '2px' }}>{errors.password}</p>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="confirmPassword" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--cream)', opacity: 0.75 }}>
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Repeat your password"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(74,255,107,0.35)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
          {errors.confirmPassword && <p style={{ fontSize: '12px', color: '#f87171', marginTop: '2px' }}>{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%', padding: '12px', borderRadius: '8px',
            background: isLoading ? 'rgba(74,255,107,0.4)' : 'var(--green)',
            color: '#07090A', fontFamily: 'var(--font-syne)', fontWeight: 700,
            fontSize: '14px', letterSpacing: '-0.01em', border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Updating…' : 'Update Password'}
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
