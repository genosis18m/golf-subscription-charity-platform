/**
 * Onboarding Layout — dark design.
 */

import { headers } from 'next/headers';
import { Stepper } from '@/components/layout/Stepper';
import Link from 'next/link';

function getStepFromPathname(pathname: string): number {
  if (pathname.includes('/onboarding/charity')) return 2;
  if (pathname.includes('/onboarding/subscribe')) return 3;
  return 1;
}

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '/onboarding/profile';
  const currentStep = getStepFromPathname(pathname);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', color: 'var(--cream)' }}>
      {/* Top bar */}
      <header style={{
        background: 'var(--bg-deep)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 20px',
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <span style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'rgba(74,255,107,0.12)', fontSize: '15px',
              border: '1px solid rgba(74,255,107,0.25)',
            }}>⛳</span>
            <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '13px', color: 'var(--cream)' }} className="hidden sm:block">
              Golf Charity Club
            </span>
          </Link>

          <Stepper currentStep={currentStep} />

          <div style={{ width: '100px', textAlign: 'right' }}>
            <Link href="/dashboard" style={{ fontSize: '12px', color: 'var(--muted)', textDecoration: 'none', fontFamily: 'var(--font-syne)' }}>
              Skip for now
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 20px' }}>
        {children}
      </main>
    </div>
  );
}
