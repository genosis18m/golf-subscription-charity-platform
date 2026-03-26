/**
 * Onboarding Stepper — dark design.
 */

import { ONBOARDING_STEPS } from '@/constants';

interface StepperProps {
  currentStep: number;
}

export function Stepper({ currentStep }: StepperProps) {
  return (
    <nav aria-label="Onboarding progress">
      <ol style={{ display: 'flex', alignItems: 'center', gap: 0, listStyle: 'none', margin: 0, padding: 0 }}>
        {ONBOARDING_STEPS.map(({ step, label }, index) => {
          const isComplete = step < currentStep;
          const isActive = step === currentStep;
          const isLast = index === ONBOARDING_STEPS.length - 1;

          return (
            <li key={step} style={{ display: 'flex', alignItems: 'center', flex: isLast ? undefined : 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '36px', height: '36px', borderRadius: '50%',
                    border: `2px solid ${isComplete ? 'var(--green)' : isActive ? 'rgba(74,255,107,0.5)' : 'var(--border)'}`,
                    background: isComplete ? 'var(--green)' : isActive ? 'rgba(74,255,107,0.08)' : 'transparent',
                    color: isComplete ? '#07090A' : isActive ? 'var(--green)' : 'var(--muted)',
                    fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-syne)',
                    transition: 'all 0.2s',
                  }}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isComplete ? (
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : step}
                </div>
                <span style={{
                  fontSize: '11px', fontFamily: 'var(--font-syne)', fontWeight: 600,
                  whiteSpace: 'nowrap', letterSpacing: '0.02em',
                  color: isActive ? 'var(--green)' : 'var(--muted)',
                }}>
                  {label}
                </span>
              </div>

              {!isLast && (
                <div
                  style={{
                    flex: 1, height: '1px', marginBottom: '20px', marginLeft: '8px', marginRight: '8px',
                    background: isComplete ? 'var(--green)' : 'var(--border)',
                    transition: 'background 0.2s',
                  }}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
