/**
 * Charities Directory — /charities
 */

import type { Metadata } from 'next';
import { fetchCharities } from '@/lib/data/charities';
import { CharityDirectory } from './CharityDirectory';

export const metadata: Metadata = {
  title: 'Supported Charities',
  description: 'Browse the registered charities supported by Golf Charity Club members.',
};

export const revalidate = 600;

export default async function CharitiesPage() {
  const charities = await fetchCharities();
  return (
    <>
      <section
        className="relative pt-36 pb-20 px-5 overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(20,50,22,0.5) 0%, var(--bg-void) 70%)' }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[11px] uppercase tracking-[0.14em] mb-5" style={{ color: 'var(--green)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
            Where Your Subscription Goes
          </p>
          <h1 className="display-heading mb-5" style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)' }}>
            Choose your<br />
            <span className="serif-accent" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.05em' }}>cause.</span>
          </h1>
          <p className="mx-auto max-w-lg leading-relaxed" style={{ color: 'var(--cream-dim)', fontSize: '16px' }}>
            Every Golf Charity Club subscription funds one charity you believe in. At least 10% goes directly to them — every single month.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-mid), transparent)' }} />
      </section>
      <CharityDirectory charities={charities} />
    </>
  );
}
