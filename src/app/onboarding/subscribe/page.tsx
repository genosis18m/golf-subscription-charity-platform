'use client';

/**
 * Onboarding Step 3: Subscribe (/onboarding/subscribe) — dark design.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PricingCard } from '@/components/subscription/PricingCard';
import { PlanToggle } from '@/components/subscription/PlanToggle';
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
          Both plans include one draw entry per month. Cancel anytime.
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
