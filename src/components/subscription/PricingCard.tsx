/**
 * PricingCard — dark glass pricing card.
 */

import type { SubscriptionPlanConfig } from '@/constants';

interface PricingCardProps {
  plan: SubscriptionPlanConfig;
  isRecommended?: boolean;
  isCurrentPlan?: boolean;
  onSelect?: (plan: SubscriptionPlanConfig) => void;
  isLoading?: boolean;
}

export function PricingCard({
  plan,
  isRecommended = false,
  isCurrentPlan = false,
  onSelect,
  isLoading = false,
}: PricingCardProps) {
  const price = plan.price_display.split('/')[0];
  const interval = plan.billing_interval;

  return (
    <article
      style={{
        position: 'relative',
        background: isRecommended
          ? 'linear-gradient(145deg, rgba(74,255,107,0.06) 0%, var(--bg-card) 50%)'
          : 'var(--bg-card)',
        border: `1px solid ${isRecommended ? 'rgba(74,255,107,0.3)' : 'var(--border)'}`,
        borderRadius: '20px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        boxShadow: isRecommended ? '0 0 40px rgba(74,255,107,0.06)' : 'none',
      }}
    >
      {/* Best Value badge */}
      {isRecommended && (
        <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 14px',
            borderRadius: '99px',
            background: 'var(--green)',
            color: '#020a03',
            fontSize: '11px',
            fontFamily: 'var(--font-syne)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            Best Value
          </span>
        </div>
      )}

      {/* Header */}
      <div>
        <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1rem', color: 'var(--cream)', marginBottom: '6px', letterSpacing: '-0.01em' }}>
          {plan.label}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>{plan.description}</p>
      </div>

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
        <span style={{
          fontFamily: 'var(--font-syne)',
          fontWeight: 800,
          fontSize: '2.8rem',
          color: isRecommended ? 'var(--green)' : 'var(--cream)',
          letterSpacing: '-0.04em',
          lineHeight: 1,
        }}>
          {price}
        </span>
        <span style={{ fontSize: '13px', color: 'var(--muted)', paddingBottom: '6px' }}>
          /{interval}
        </span>
      </div>

      {/* Savings badge */}
      {plan.savings_pct !== null && (
        <span style={{
          display: 'inline-flex',
          alignSelf: 'flex-start',
          padding: '4px 10px',
          borderRadius: '99px',
          background: 'rgba(74,255,107,0.08)',
          border: '1px solid rgba(74,255,107,0.2)',
          color: 'var(--green)',
          fontSize: '11px',
          fontFamily: 'var(--font-syne)',
          fontWeight: 700,
          marginTop: '-12px',
        }}>
          Save {plan.savings_pct}% vs monthly
        </span>
      )}

      {/* Features */}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }} role="list">
        {plan.features.map((feature) => (
          <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--cream-dim)', lineHeight: 1.5 }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: '1px', color: 'var(--green)' }}>
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={() => onSelect?.(plan)}
        disabled={isCurrentPlan || isLoading}
        className={isRecommended ? 'btn btn-primary btn-md' : 'btn btn-outline btn-md'}
        style={{ width: '100%', opacity: isCurrentPlan ? 0.5 : 1, cursor: isCurrentPlan ? 'not-allowed' : 'pointer' }}
      >
        {isCurrentPlan ? 'Current Plan' : isLoading ? 'Loading…' : `Start ${plan.label}`}
      </button>
    </article>
  );
}
