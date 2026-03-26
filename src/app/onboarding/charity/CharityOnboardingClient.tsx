'use client';

/**
 * Charity onboarding client — dark design.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CharitySelector } from '@/components/charity/CharitySelector';
import { ContributionSlider } from '@/components/charity/ContributionSlider';
import { CHARITY_DEFAULT_CONTRIBUTION_PCT, SUBSCRIPTION_PLANS } from '@/constants';
import type { Charity } from '@/types';

interface CharityOnboardingClientProps {
  charities: Charity[];
}

export default function CharityOnboardingClient({ charities }: CharityOnboardingClientProps) {
  const router = useRouter();
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [contributionPct, setContributionPct] = useState(CHARITY_DEFAULT_CONTRIBUTION_PCT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    if (!selectedCharity) { setError('Please select a charity before continuing.'); return; }
    setIsLoading(true);
    setError(null);
    sessionStorage.setItem('onboarding_charity_id', selectedCharity.id);
    sessionStorage.setItem('onboarding_contribution_pct', String(contributionPct));
    router.push('/onboarding/subscribe');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Charity picker */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
        <CharitySelector
          charities={charities}
          selectedCharityId={selectedCharity?.id}
          onSelect={setSelectedCharity}
        />
      </div>

      {/* Contribution slider */}
      {selectedCharity && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(74,255,107,0.2)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', color: 'var(--cream)', marginBottom: '16px' }}>
            Your contribution to {selectedCharity.name}
          </h3>
          <ContributionSlider
            value={contributionPct}
            onChange={setContributionPct}
            subscriptionPricePence={SUBSCRIPTION_PLANS.monthly.price_pence}
          />
        </div>
      )}

      {error && (
        <p style={{ fontSize: '13px', color: '#f87171' }} role="alert">{error}</p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => router.push('/onboarding/profile')}
          style={{ fontSize: '13px', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-syne)' }}
        >
          ← Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedCharity || isLoading}
          style={{
            padding: '12px 28px', borderRadius: '8px',
            background: (!selectedCharity || isLoading) ? 'rgba(74,255,107,0.3)' : 'var(--green)',
            color: '#07090A', fontFamily: 'var(--font-syne)', fontWeight: 700,
            fontSize: '14px', border: 'none',
            cursor: (!selectedCharity || isLoading) ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Saving…' : 'Next: Subscribe →'}
        </button>
      </div>
    </div>
  );
}
