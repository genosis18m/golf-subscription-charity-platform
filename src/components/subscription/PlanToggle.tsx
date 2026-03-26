'use client';

/**
 * PlanToggle — dark billing period toggle.
 */

import { SUBSCRIPTION_PLANS } from '@/constants';
import type { SubscriptionPlanId } from '@/types';

interface PlanToggleProps {
  selected: SubscriptionPlanId;
  onChange: (plan: SubscriptionPlanId) => void;
}

export function PlanToggle({ selected, onChange }: PlanToggleProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border-mid)',
        borderRadius: '99px',
        padding: '4px',
        gap: '4px',
      }}
      role="radiogroup"
      aria-label="Billing period"
    >
      {(['monthly', 'yearly'] as SubscriptionPlanId[]).map((planId) => {
        const plan = SUBSCRIPTION_PLANS[planId];
        const isSelected = selected === planId;

        return (
          <button
            key={planId}
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(planId)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 20px',
              borderRadius: '99px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-syne)',
              fontWeight: 600,
              fontSize: '13px',
              letterSpacing: '-0.01em',
              transition: 'all 0.15s',
              background: isSelected ? 'var(--green)' : 'transparent',
              color: isSelected ? '#020a03' : 'var(--muted)',
            }}
          >
            {plan.label}
            {plan.savings_pct !== null && (
              <span style={{
                padding: '2px 7px',
                borderRadius: '99px',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                background: isSelected ? 'rgba(2,10,3,0.2)' : 'rgba(74,255,107,0.1)',
                color: isSelected ? '#020a03' : 'var(--green)',
              }}>
                -{plan.savings_pct}%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
