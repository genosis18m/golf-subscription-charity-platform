'use client';

/**
 * Pricing page (/pricing) — dark editorial theme.
 */

import { useState } from 'react';
import Link from 'next/link';
import { PricingCard } from '@/components/subscription/PricingCard';
import { PlanToggle } from '@/components/subscription/PlanToggle';
import { SUBSCRIPTION_PLANS } from '@/constants';
import type { SubscriptionPlanId } from '@/types';

const FAQS = [
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your dashboard before the next billing cycle. No cancellation fees.' },
  { q: 'What if nobody wins the jackpot?', a: "Unclaimed prize tiers roll over to the next draw, growing the jackpot each month." },
  { q: 'How does charity contribution work?', a: 'You choose 10–30% of your subscription to go directly to your charity. We transfer it monthly.' },
  { q: 'Do I need to be a good golfer?', a: "Not at all. Scores affect your algorithmic weighting slightly, but everyone has a fair chance." },
];

export default function PricingPage() {
  const [selected, setSelected] = useState<SubscriptionPlanId>('yearly');

  return (
    <div style={{ background: 'var(--bg-void)', color: 'var(--cream)' }}>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section
        className="py-24 relative overflow-hidden grain-overlay"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(20,50,22,0.5) 0%, var(--bg-void) 65%)' }}
      >
        <div className="relative z-10 mx-auto max-w-3xl px-5 text-center">
          <p className="text-[11px] uppercase tracking-[0.12em] mb-5"
            style={{ color: 'var(--green)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
            Membership
          </p>
          <h1 className="display-heading mb-5" style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}>
            Simple, transparent
            <br />
            <span className="serif-accent text-gradient-green" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05em' }}>
              pricing.
            </span>
          </h1>
          <p style={{ color: 'var(--cream-dim)', fontSize: '16px', lineHeight: 1.7, marginBottom: '36px' }}>
            One plan. One entry per draw. Unlimited charity impact.
          </p>

          <PlanToggle selected={selected} onChange={setSelected} />
        </div>
      </section>

      <div className="section-divider" />

      {/* ── Pricing Cards ──────────────────────────────────────────── */}
      <section className="py-24" style={{ background: 'var(--bg-void)' }}>
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '680px', margin: '0 auto' }}>
            {(['monthly', 'yearly'] as SubscriptionPlanId[]).map((planId) => (
              <PricingCard
                key={planId}
                plan={SUBSCRIPTION_PLANS[planId]}
                isRecommended={planId === 'yearly'}
                onSelect={(plan) => {
                  window.location.href = `/signup?plan=${plan.id}`;
                }}
              />
            ))}
          </div>

          {/* Trust strip */}
          <div style={{ textAlign: 'center', marginTop: '40px', display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Cancel anytime', 'No hidden fees', 'Stripe-secured payments', 'Charity registered'].map((item) => (
              <span key={item} style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--green)', fontSize: '14px' }}>✓</span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: 'var(--bg-deep)' }}>
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.12em] mb-4"
              style={{ color: 'var(--green)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
              Questions
            </p>
            <h2 className="display-heading" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>Common Questions</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {FAQS.map(({ q, a }) => (
              <div
                key={q}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '22px',
                }}
              >
                <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '13px', color: 'var(--cream)', marginBottom: '8px', lineHeight: 1.4 }}>{q}</p>
                <p style={{ fontSize: '13px', color: 'var(--cream-dim)', lineHeight: 1.65 }}>{a}</p>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: '28px' }}>
            <Link href="/faq"
              style={{ fontSize: '13px', color: 'var(--green)', textDecoration: 'none', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
              View all FAQs →
            </Link>
          </p>
        </div>
      </section>

    </div>
  );
}
