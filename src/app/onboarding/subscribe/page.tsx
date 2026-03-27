'use client';

/**
 * Onboarding Step 3: Subscribe (/onboarding/subscribe) — dark design.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PricingCard } from '@/components/subscription/PricingCard';
import { PlanToggle } from '@/components/subscription/PlanToggle';
import { DeferredAccessButton } from '@/components/onboarding/DeferredAccessButton';
import { SUBSCRIPTION_PLANS } from '@/constants';
import type { SubscriptionPlanConfig } from '@/constants';
import type { SubscriptionPlanId } from '@/types';

export default function OnboardingSubscribePage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>('yearly');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelectPlan(plan: SubscriptionPlanConfig) {
    setIsRedirecting(true);
    setError(null);
    const charityId = sessionStorage.getItem('onboarding_charity_id') ?? '';
    const contributionPct = sessionStorage.getItem('onboarding_contribution_pct') ?? '0.15';

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: plan.id,
          price_id: plan.stripe_price_id,
          charity_id: charityId,
          charity_contribution_pct: parseFloat(contributionPct),
          success_url: `${window.location.origin}/dashboard?subscribed=true`,
          cancel_url: `${window.location.origin}/onboarding/subscribe`,
        }),
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error ?? 'Failed to start checkout');
      }

      const { data } = await response.json();
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
      setIsRedirecting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--cream)', letterSpacing: '-0.03em', marginBottom: '8px' }}>
          Choose your plan
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>
          Choose a paid plan now, or delay payment and unlock one complimentary draw entry while you get started.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <PlanToggle selected={selectedPlan} onChange={setSelectedPlan} />
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)',
          borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#f87171',
        }} role="alert">
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {(['monthly', 'yearly'] as SubscriptionPlanId[]).map((planId) => (
          <PricingCard
            key={planId}
            plan={SUBSCRIPTION_PLANS[planId]}
            isRecommended={planId === 'yearly'}
            onSelect={handleSelectPlan}
            isLoading={isRedirecting}
          />
        ))}
      </div>

      <section
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(17,27,18,0.96) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div>
          <p
            style={{
              color: 'var(--gold)',
              fontSize: '11px',
              fontFamily: 'var(--font-syne)',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            Delayed Start
          </p>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--cream)', marginBottom: '8px' }}>
            Start now, choose payment later
          </h2>
          <p style={{ color: 'var(--cream-dim)', fontSize: '14px', lineHeight: 1.6, maxWidth: '56ch' }}>
            We&apos;ll let you into the dashboard immediately, keep your charity selection, and give you one complimentary draw entry. Upgrade to a paid membership before your following draw to continue participating.
          </p>
        </div>

        <DeferredAccessButton
          label="Start with delayed payment"
          pendingLabel="Opening access…"
          showInlineError
          variant="outline"
          size="md"
          style={{ width: '100%', justifyContent: 'center' }}
        />
      </section>

      {/* Trust badges */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
        {['🔒 SSL Encrypted', '💳 Powered by Stripe', '↩ Cancel anytime'].map((item) => (
          <span key={item} style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-syne)' }}>{item}</span>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => router.push('/onboarding/charity')}
          style={{ fontSize: '13px', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-syne)' }}
        >
          ← Back to charity selection
        </button>
      </div>
    </div>
  );
}
