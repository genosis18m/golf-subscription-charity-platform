'use client';

/** Signup page. */

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { NumberBall } from '@/components/draw/NumberBall';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const ACCOUNT_PERKS = [
  {
    title: 'Monthly Entry',
    body: 'Log your rounds, turn scores into numbers, and enter the prize draw with purpose.',
    accent: 'green' as const,
  },
  {
    title: 'Choose a Charity',
    body: 'Choose a cause during onboarding and direct part of every membership payment toward it.',
    accent: 'gold' as const,
  },
  {
    title: 'Member Dashboard',
    body: 'Track scores, winnings, draw history, and your running impact in one clubhouse view.',
    accent: 'green' as const,
  },
];

const ONBOARDING_STEPS = [
  'Create your account',
  'Set up your player profile',
  'Choose your charity and plan',
];

function getSignupErrorMessage(message: string) {
  if (/invalid api key/i.test(message)) {
    return (
      'Supabase rejected the public API key configured for this app. ' +
      'Update NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel for deployments, or in .env.local for local dev, ' +
      'then redeploy or restart the dev server.'
    );
  }

  return message;
}

function getPlanLabel(planId: string) {
  if (planId === 'yearly') return 'Annual membership';
  if (planId === 'free') return 'Free access';
  return 'Monthly membership';
}

export default function SignupPage() {
  const searchParams = useSearchParams();
  const preSelectedCharity = searchParams.get('charity');
  const preSelectedPlan = searchParams.get('plan') ?? 'monthly';
  const selectedPlanLabel = getPlanLabel(preSelectedPlan);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [existingAccountEmail, setExistingAccountEmail] = useState<string | null>(null);

  function clearFieldErrors(...fieldNames: Array<keyof typeof errors>) {
    setErrors((current) => {
      if (Object.keys(current).length === 0) {
        return current;
      }

      const nextErrors = { ...current };

      for (const fieldName of fieldNames) {
        delete nextErrors[fieldName];
      }

      delete nextErrors.form;
      return nextErrors;
    });

    if (existingAccountEmail) {
      setExistingAccountEmail(null);
    }
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};

    if (!fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!email.trim()) nextErrors.email = 'Email address is required.';
    if (password.length < 8) nextErrors.password = 'Minimum 8 characters.';
    if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setExistingAccountEmail(null);
    const supabase = createClient();
    const nextPath = `/onboarding/profile?plan=${preSelectedPlan}${
      preSelectedCharity ? `&charity=${preSelectedCharity}` : ''
    }`;
    const emailRedirectUrl = new URL('/api/auth/callback', window.location.origin);
    emailRedirectUrl.searchParams.set('next', nextPath);

    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: emailRedirectUrl.toString(),
      },
    });

    if (authError) {
      setErrors({ form: getSignupErrorMessage(authError.message) });
      setIsLoading(false);
      return;
    }

    if (Array.isArray(data.user?.identities) && data.user.identities.length === 0) {
      setExistingAccountEmail(email.trim());
      setErrors({
        form:
          'An account with this email already exists. Sign in or reset your password instead.',
      });
      setIsLoading(false);
      return;
    }

    setIsVerificationSent(true);
    setIsLoading(false);
  }

  const inputBaseClass =
    'w-full rounded-[16px] border bg-[rgba(255,255,255,0.04)] px-4 py-3.5 text-[14px] text-[var(--cream)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[rgba(74,255,107,0.35)]';

  if (isVerificationSent) {
    return (
      <div className="relative overflow-hidden rounded-[30px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(17,27,18,0.92),rgba(9,14,10,0.96))] px-6 py-7 sm:px-8 sm:py-9">
        <div
          className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(74,255,107,0.12) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-[-3rem] h-48 w-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.1) 0%, transparent 72%)' }}
        />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em]"
              style={{
                borderColor: 'rgba(74,255,107,0.22)',
                color: 'var(--green)',
                background: 'rgba(74,255,107,0.08)',
                fontFamily: 'var(--font-syne)',
                fontWeight: 700,
              }}
            >
              Verification Sent
            </span>
            <div className="flex items-center gap-2">
              <NumberBall value={7} size="xs" variant="green" />
              <NumberBall value={14} size="xs" variant="gold" />
              <NumberBall value={28} size="xs" variant="default" />
            </div>
          </div>

          <div>
            <h1 className="display-heading mb-3 text-[clamp(2.6rem,9vw,4.2rem)]">
              Check your{' '}
              <span className="serif-accent text-gradient-green">inbox</span>
            </h1>
            <p className="max-w-md text-[15px] leading-7 text-[var(--cream-dim)]">
              We&apos;ve sent a verification link to{' '}
              <strong className="font-semibold text-[var(--cream)]">{email}</strong>. Open it to confirm your account and continue into onboarding.
            </p>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-5">
            <p
              className="mb-3 text-[11px] uppercase tracking-[0.14em]"
              style={{ color: 'var(--gold)', fontFamily: 'var(--font-syne)', fontWeight: 700 }}
            >
              Next
            </p>
            <div className="flex flex-col gap-3">
              {ONBOARDING_STEPS.map((step, index) => (
                <div key={step} className="flex items-start gap-3">
                  <span
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px]"
                    style={{
                      borderColor: 'rgba(255,255,255,0.08)',
                      color: 'var(--cream)',
                      background: 'rgba(255,255,255,0.03)',
                      fontFamily: 'var(--font-syne)',
                      fontWeight: 700,
                    }}
                  >
                    0{index + 1}
                  </span>
                  <p className="pt-1 text-[13px] leading-6 text-[var(--cream-dim)]">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[12px] leading-6 text-[var(--muted)]">
            Didn&apos;t receive it? Check spam, then{' '}
            <button
              type="button"
              onClick={() => setIsVerificationSent(false)}
              className="border-none bg-transparent p-0 font-semibold text-[var(--green)] underline decoration-[rgba(74,255,107,0.35)] underline-offset-4"
            >
              try again with another email
            </button>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em]"
          style={{
            borderColor: 'rgba(74,255,107,0.22)',
            color: 'var(--green)',
            background: 'rgba(74,255,107,0.08)',
            fontFamily: 'var(--font-syne)',
            fontWeight: 700,
          }}
        >
          {selectedPlanLabel}
        </span>
        <span
          className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em]"
          style={{
            borderColor: 'rgba(245,166,35,0.18)',
            color: 'var(--gold)',
            background: 'rgba(245,166,35,0.08)',
            fontFamily: 'var(--font-syne)',
            fontWeight: 700,
          }}
        >
          {preSelectedCharity ? 'Charity selected' : 'Clubhouse access'}
        </span>
      </div>

      <div className="space-y-3">
        <h1 className="display-heading text-[clamp(2.3rem,8vw,3.9rem)]">
          Create your{' '}
          <span className="serif-accent text-gradient-green">account</span>
        </h1>
        <p className="max-w-md text-[14px] leading-6 text-[var(--cream-dim)]">
          Set up your profile, choose a charity, and start your membership in a few quick steps.
        </p>
        <div className="flex items-center gap-2">
          <NumberBall value={7} size="xs" variant="green" />
          <NumberBall value={14} size="xs" variant="gold" />
          <NumberBall value={23} size="xs" variant="default" />
          <p className="ml-1 text-[12px] uppercase tracking-[0.12em] text-[var(--muted)]">
            Your last 5 scores become draw numbers
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(17,27,18,0.96),rgba(8,13,9,0.96))] px-5 py-5 sm:px-6 sm:py-6">
        <div
          className="pointer-events-none absolute -right-16 top-8 h-36 w-36 rounded-full opacity-80"
          style={{ background: 'radial-gradient(circle, rgba(74,255,107,0.12) 0%, transparent 68%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 right-[-2rem] h-56 w-56 rounded-full opacity-80"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 72%)' }}
        />
        <div
          className="pointer-events-none absolute bottom-5 right-5 h-24 w-24 rounded-full border"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}
        />
        <div
          className="pointer-events-none absolute bottom-11 right-11 h-12 w-12 rounded-full border"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}
        />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="rounded-[20px] border border-[rgba(74,255,107,0.14)] bg-[rgba(74,255,107,0.05)] p-3.5">
            <p
              className="mb-1.5 text-[11px] uppercase tracking-[0.14em]"
              style={{ color: 'var(--green)', fontFamily: 'var(--font-syne)', fontWeight: 700 }}
            >
              Try The Demo
            </p>
            <p className="text-[12px] leading-5 text-[var(--cream-dim)]">
              Want to look around first?{' '}
              <Link href="/login" className="font-semibold text-[var(--green)] transition-colors hover:text-[var(--cream)]">
                Use a demo account
              </Link>{' '}
              to preview the member area without signing up.
            </p>
          </div>

          {errors.form && (
            <div
              className="rounded-[18px] border px-4 py-3 text-[13px] leading-6"
              style={{
                background: 'rgba(239,68,68,0.07)',
                borderColor: 'rgba(239,68,68,0.18)',
                color: '#f87171',
              }}
              role="alert"
            >
              {errors.form}
              {existingAccountEmail && (
                <span className="mt-2 block text-[12px] text-[var(--cream-dim)]">
                  Existing account: <strong className="font-semibold text-[var(--cream)]">{existingAccountEmail}</strong>
                </span>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="grid gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="fullName"
                  className="text-[11px] uppercase tracking-[0.16em]"
                  style={{ color: 'rgba(239,233,221,0.55)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => {
                    clearFieldErrors('fullName');
                    setFullName(e.target.value);
                  }}
                  required
                  placeholder="Alex Fairway"
                  className={cn(
                    inputBaseClass,
                    errors.fullName ? 'border-[rgba(239,68,68,0.4)]' : 'border-white/10'
                  )}
                />
                {errors.fullName && <p className="text-[12px] text-[#f87171]">{errors.fullName}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-[11px] uppercase tracking-[0.16em]"
                  style={{ color: 'rgba(239,233,221,0.55)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    clearFieldErrors('email');
                    setEmail(e.target.value);
                  }}
                  required
                  placeholder="you@example.com"
                  className={cn(
                    inputBaseClass,
                    errors.email ? 'border-[rgba(239,68,68,0.4)]' : 'border-white/10'
                  )}
                />
                {errors.email && <p className="text-[12px] text-[#f87171]">{errors.email}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="password"
                    className="text-[11px] uppercase tracking-[0.16em]"
                    style={{ color: 'rgba(239,233,221,0.55)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      clearFieldErrors('password', 'confirmPassword');
                      setPassword(e.target.value);
                    }}
                    required
                    placeholder="Minimum 8 characters"
                    className={cn(
                      inputBaseClass,
                      errors.password ? 'border-[rgba(239,68,68,0.4)]' : 'border-white/10'
                    )}
                  />
                  {errors.password && <p className="text-[12px] text-[#f87171]">{errors.password}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-[11px] uppercase tracking-[0.16em]"
                    style={{ color: 'rgba(239,233,221,0.55)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}
                  >
                    Confirm
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      clearFieldErrors('confirmPassword');
                      setConfirmPassword(e.target.value);
                    }}
                    required
                    placeholder="Repeat password"
                    className={cn(
                      inputBaseClass,
                      errors.confirmPassword ? 'border-[rgba(239,68,68,0.4)]' : 'border-white/10'
                    )}
                  />
                  {errors.confirmPassword && <p className="text-[12px] text-[#f87171]">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p
                    className="text-[11px] uppercase tracking-[0.14em]"
                    style={{ color: 'var(--gold)', fontFamily: 'var(--font-syne)', fontWeight: 700 }}
                  >
                    Next Up
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-[var(--cream-dim)]">
                    After signup we&apos;ll guide you through profile, charity, and membership setup.
                  </p>
                </div>
                <NumberBall value={28} size="sm" variant="gold" />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {ACCOUNT_PERKS.map((perk, index) => (
                  <div key={perk.title} className="rounded-[18px] border border-white/5 bg-white/[0.02] p-3">
                    <span
                      className="mb-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px]"
                      style={{
                        borderColor:
                          perk.accent === 'gold' ? 'rgba(245,166,35,0.18)' : 'rgba(74,255,107,0.18)',
                        color: perk.accent === 'gold' ? 'var(--gold)' : 'var(--green)',
                        background:
                          perk.accent === 'gold' ? 'rgba(245,166,35,0.08)' : 'rgba(74,255,107,0.08)',
                        fontFamily: 'var(--font-syne)',
                        fontWeight: 700,
                      }}
                    >
                      0{index + 1}
                    </span>
                    <p className="text-[12px] font-semibold leading-5 text-[var(--cream)]">{perk.title}</p>
                    <p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">{perk.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-lg w-full justify-center"
            >
              {isLoading ? 'Creating Account…' : 'Create Account'}
            </button>

            <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] text-[var(--muted)]">
              <p className="leading-5">
                We&apos;ll email a secure verification link before onboarding begins.
              </p>
              <div className="flex items-center gap-2">
                {ONBOARDING_STEPS.map((step, index) => (
                  <span
                    key={step}
                    className="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em]"
                    style={{
                      borderColor: 'rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.03)',
                      color: 'var(--cream-dim)',
                      fontFamily: 'var(--font-syne)',
                      fontWeight: 700,
                    }}
                  >
                    0{index + 1}
                  </span>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="space-y-2 text-center">
        <p className="text-[12px] leading-5 text-[var(--muted)]">
          By signing up you agree to our{' '}
          <Link href="/terms" className="text-[var(--cream)] underline decoration-[rgba(239,233,221,0.35)] underline-offset-4">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-[var(--cream)] underline decoration-[rgba(239,233,221,0.35)] underline-offset-4">
            Privacy Policy
          </Link>
          .
        </p>
        <p className="text-[13px] text-[var(--cream-dim)]">
          Already a member?{' '}
          <Link href="/login" className="font-semibold text-[var(--green)] transition-colors hover:text-[var(--cream)]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
