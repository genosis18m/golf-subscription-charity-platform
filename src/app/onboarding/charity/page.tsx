/**
 * Onboarding Step 2: Choose Charity (/onboarding/charity) — dark design.
 */

import { fetchCharities } from '@/lib/data/charities';
import CharityOnboardingClient from './CharityOnboardingClient';

export default async function OnboardingCharityPage() {
  const charities = await fetchCharities();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--cream)', letterSpacing: '-0.03em', marginBottom: '8px' }}>
          Choose your charity
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>
          A portion of your subscription will be donated to this charity every month.
          You can change your choice at any time from your dashboard.
        </p>
      </div>

      <CharityOnboardingClient charities={charities} />
    </div>
  );
}
