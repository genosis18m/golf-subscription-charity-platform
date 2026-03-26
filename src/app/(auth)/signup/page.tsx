'use client';

/**
 * Signup page (/signup) — dark design, email/password registration.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedCharity = searchParams.get('charity');
  const preSelectedPlan = searchParams.get('plan') ?? 'monthly';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required.';
    if (!email.trim()) e.email = 'Email address is required.';
    if (password.length < 8) e.password = 'Minimum 8 characters.';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/onboarding/profile?plan=${preSelectedPlan}${
          preSelectedCharity ? `&charity=${preSelectedCharity}` : ''
        }`,
      },
    });

    if (authError) {
      setErrors({ form: authError.message });
      setIsLoading(false);
      return;
    }

    setIsVerificationSent(true);
    setIsLoading(false);
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

  if (isVerificationSent) {
    return (
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '3rem' }}>✉️</div>
        <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.4rem', color: 'var(--cream)' }}>
          Check your inbox
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6 }}>
          We&apos;ve sent a verification link to{' '}
          <strong style={{ color: 'var(--cream)' }}>{email}</strong>. Click it to
          confirm your account and complete onboarding.
        </p>
        <p style={{ fontSize: '12px', color: 'var(--muted)', opacity: 0.6 }}>
          Didn&apos;t receive it? Check your spam folder or{' '}
          <button
            onClick={() => setIsVerificationSent(false)}
            style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px', padding: 0 }}
          >
            try again
          </button>.
        </p>
      </div>
    );
  }

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
          Create account
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>
          Join Golf Charity Club in under 2 minutes.
        </p>
      </div>

      {/* Demo hint */}
      <div style={{
        background: 'rgba(74,255,107,0.04)',
        border: '1px solid rgba(74,255,107,0.12)',
        borderRadius: '10px',
        padding: '12px 14px',
        fontSize: '13px',
        color: 'var(--muted)',
        lineHeight: 1.5,
      }}>
        Want to explore first?{' '}
        <Link href="/login" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>
          Use a demo account
        </Link>{' '}
        — no signup needed.
      </div>

      {/* Form error */}
      {errors.form && (
        <div style={{
          background: 'rgba(239,68,68,0.07)',
          border: '1px solid rgba(239,68,68,0.18)',
          borderRadius: '8px',
          padding: '12px 14px',
          fontSize: '13px',
          color: '#f87171',
        }} role="alert">
          {errors.form}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Full Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="fullName" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--cream)', opacity: 0.75 }}>
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Your full name"
            style={{ ...inputStyle, borderColor: errors.fullName ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)' }}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(74,255,107,0.35)')}
            onBlur={(e) => (e.target.style.borderColor = errors.fullName ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)')}
          />
          {errors.fullName && <p style={{ fontSize: '12px', color: '#f87171' }}>{errors.fullName}</p>}
        </div>

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
            style={{ ...inputStyle, borderColor: errors.email ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)' }}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(74,255,107,0.35)')}
            onBlur={(e) => (e.target.style.borderColor = errors.email ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)')}
          />
          {errors.email && <p style={{ fontSize: '12px', color: '#f87171' }}>{errors.email}</p>}
        </div>

        {/* Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="password" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--cream)', opacity: 0.75 }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Minimum 8 characters"
            style={{ ...inputStyle, borderColor: errors.password ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)' }}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(74,255,107,0.35)')}
            onBlur={(e) => (e.target.style.borderColor = errors.password ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)')}
          />
          {errors.password && <p style={{ fontSize: '12px', color: '#f87171' }}>{errors.password}</p>}
        </div>

        {/* Confirm Password */}
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
            style={{ ...inputStyle, borderColor: errors.confirmPassword ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)' }}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(74,255,107,0.35)')}
            onBlur={(e) => (e.target.style.borderColor = errors.confirmPassword ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)')}
          />
          {errors.confirmPassword && <p style={{ fontSize: '12px', color: '#f87171' }}>{errors.confirmPassword}</p>}
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
          {isLoading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: 'var(--muted)', opacity: 0.6, lineHeight: 1.5 }}>
          By signing up you agree to our{' '}
          <Link href="/terms" style={{ color: 'var(--cream)', textDecoration: 'underline' }}>Terms</Link>{' '}
          and{' '}
          <Link href="/privacy" style={{ color: 'var(--cream)', textDecoration: 'underline' }}>Privacy Policy</Link>.
        </p>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
