/**
 * Dashboard: My Charity — works with demo + Supabase sessions.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { getServerDemoSession, DEMO_USERS } from '@/lib/demo-auth-server';
import { formatCurrency } from '@/lib/utils';
import type { Subscription, Charity } from '@/types';

export const metadata: Metadata = { title: 'My Charity' };

const APPROX_MONTH_MS = 1000 * 60 * 60 * 24 * 30;

export default async function MyCharityPage() {
  // ── Demo session ────────────────────────────────────────────────────────
  const demoSession = await getServerDemoSession();

  if (demoSession) {
    const u = DEMO_USERS.user;
    return (
      <CharityContent
        charityName={u.charity_name}
        charityTagline="Standing up to cancer — for everyone"
        charityWebsite="https://www.cancerresearchuk.org"
        charityLogoUrl={null}
        totalDonatedPence={u.total_donated}
        contributionPct={u.charity_pct / 100}
        monthsSupporting={6}
        isDemo
      />
    );
  }

  // ── Supabase session ────────────────────────────────────────────────────
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('subscriptions')
    .select('*, charity:charities(*)')
    .eq('user_id', user.id)
    .single();

  const subscription = data as (Subscription & { charity: Charity }) | null;

  if (!subscription?.charity) {
    return (
      <div style={{ maxWidth: '640px' }}>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.75rem', color: 'var(--cream)', letterSpacing: '-0.03em', marginBottom: '20px' }}>
          My Charity
        </h1>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '12px' }}>No charity linked to your subscription.</p>
          <Link href="/charities" style={{ color: 'var(--green)', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
            Browse charities →
          </Link>
        </div>
      </div>
    );
  }

  const charity = subscription.charity;
  const createdAt = new Date(subscription.created_at).getTime();
  const currentPeriodStart = subscription.current_period_start
    ? new Date(subscription.current_period_start).getTime()
    : createdAt;
  const months = Math.max(1, Math.floor((currentPeriodStart - createdAt) / APPROX_MONTH_MS) + 1);
  const monthly = Math.floor(2500 * subscription.charity_contribution_pct);

  return (
    <CharityContent
      charityName={charity.name}
      charityTagline={charity.tagline ?? undefined}
      charityWebsite={charity.website_url ?? undefined}
      charityLogoUrl={charity.logo_url}
      totalDonatedPence={monthly * months}
      contributionPct={subscription.charity_contribution_pct}
      monthsSupporting={months}
    />
  );
}

// ── Presentation ─────────────────────────────────────────────────────────────

interface CharityContentProps {
  charityName: string;
  charityTagline?: string;
  charityWebsite?: string;
  charityLogoUrl: string | null;
  totalDonatedPence: number;
  contributionPct: number;
  monthsSupporting: number;
  isDemo?: boolean;
}

function CharityContent({
  charityName,
  charityTagline,
  charityWebsite,
  charityLogoUrl,
  totalDonatedPence,
  contributionPct,
  monthsSupporting,
  isDemo,
}: CharityContentProps) {
  const pct = Math.round(contributionPct * 100);
  const milestoneProgress = Math.min(100, (totalDonatedPence / 10000) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.75rem', color: 'var(--cream)', letterSpacing: '-0.03em', marginBottom: '4px' }}>
            My Charity
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Your current charity and contribution details.</p>
        </div>
        <Link
          href="/charities"
          style={{
            fontSize: '12px',
            fontFamily: 'var(--font-syne)',
            fontWeight: 600,
            color: 'var(--green)',
            background: 'rgba(74,255,107,0.08)',
            border: '1px solid rgba(74,255,107,0.2)',
            borderRadius: '7px',
            padding: '7px 14px',
            textDecoration: 'none',
          }}
        >
          Change Charity
        </Link>
      </div>

      {/* Charity card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: 'rgba(74,255,107,0.08)',
            border: '1px solid rgba(74,255,107,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            flexShrink: 0,
          }}>
            💚
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--cream)', marginBottom: '4px' }}>
              {charityName}
            </h2>
            {charityTagline && (
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '6px' }}>{charityTagline}</p>
            )}
            {charityWebsite && (
              <a
                href={charityWebsite}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '12px', color: 'var(--green)', textDecoration: 'none', opacity: 0.8 }}
              >
                {charityWebsite.replace('https://', '')} →
              </a>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border)',
        }}>
          {[
            { label: 'Total Donated', value: formatCurrency(totalDonatedPence) },
            { label: 'Contribution Rate', value: `${pct}%` },
            { label: 'Months Supporting', value: String(monthsSupporting) },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--green)', letterSpacing: '-0.02em' }}>{value}</p>
              <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '3px' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Impact progress */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '13px', color: 'var(--cream)', letterSpacing: '-0.01em' }}>
            Impact Progress
          </p>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>£100 milestone</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{formatCurrency(totalDonatedPence)} donated</span>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{Math.round(milestoneProgress)}%</span>
        </div>
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${milestoneProgress}%`,
            background: 'linear-gradient(90deg, var(--green), #2dd55b)',
            borderRadius: '99px',
            transition: 'width 0.6s ease',
          }} />
        </div>
        <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
          {pct}% of your £25/month subscription goes directly to {charityName}.
          {isDemo && ' (Demo — figures are illustrative.)'}
        </p>
      </div>

    </div>
  );
}
