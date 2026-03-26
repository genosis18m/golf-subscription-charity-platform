/**
 * How It Works page (/how-it-works) — dark editorial theme.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { SUBSCRIPTION_PLANS, PRIZE_POOL_PERCENTAGES, SCORE_LIMITS } from '@/constants';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Understand the Golf Charity Club subscription model, monthly draw process, and how your contributions reach your chosen charity.',
};

const FLOW_STEPS = [
  {
    step: '01',
    icon: '📋',
    title: 'Subscribe to a Plan',
    description:
      'Choose between our monthly (£25/month) or annual (£250/year) plan. Both give you one entry per monthly draw. Your subscription is split between the prize pool, your chosen charity, and platform operations.',
    highlight: 'Cancel anytime — no lock-in.',
    accent: 'green' as const,
  },
  {
    step: '02',
    icon: '💚',
    title: 'Choose Your Charity',
    description:
      "Browse our vetted list of registered charities and select the one you want to support. You'll decide what percentage of your subscription (10–30%) goes directly to them each month.",
    highlight: 'Change your charity anytime from your dashboard.',
    accent: 'green' as const,
  },
  {
    step: '03',
    icon: '⛳',
    title: 'Submit Your Scores',
    description: `Log your golf rounds after each game. We store your last ${SCORE_LIMITS.MAX_STORED} scores and compute a rolling average. This average is used as your weighting in the algorithmic draw mode.`,
    highlight: 'You must submit at least one score to be eligible for the draw.',
    accent: 'gold' as const,
  },
  {
    step: '04',
    icon: '🎱',
    title: 'Monthly Draw',
    description:
      'On the last business day of each month, our draw engine assigns 5 numbers (from 1–45) to each eligible member and draws 5 winning numbers. Match 3, 4, or 5 to win a share of the prize pool.',
    highlight: '5-match = 40% · 4-match = 35% · 3-match = 25%',
    accent: 'gold' as const,
  },
  {
    step: '05',
    icon: '🏆',
    title: 'Claim Your Winnings',
    description:
      'Winners are notified by email. Log into your dashboard, upload verification proof, and our team confirms within 48 hours. Prizes are paid via bank transfer.',
    highlight: 'No winner? The jackpot rolls over to next month!',
    accent: 'gold' as const,
  },
];

const PRIZE_TIERS = [
  { match: '5 Matched', label: 'Jackpot', pct: PRIZE_POOL_PERCENTAGES.five_match * 100, rollover: true, accent: 'gold' },
  { match: '4 Matched', label: 'Major Prize', pct: PRIZE_POOL_PERCENTAGES.four_match * 100, rollover: false, accent: 'green' },
  { match: '3 Matched', label: 'Prize', pct: PRIZE_POOL_PERCENTAGES.three_match * 100, rollover: false, accent: 'green' },
];

export default function HowItWorksPage() {
  return (
    <div style={{ background: 'var(--bg-void)', color: 'var(--cream)' }}>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        className="relative py-28 overflow-hidden grain-overlay"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(20,50,22,0.5) 0%, var(--bg-void) 65%)' }}
      >
        <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center relative z-10">
          <p className="text-[11px] uppercase tracking-[0.12em] mb-5"
            style={{ color: 'var(--green)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
            The Process
          </p>
          <h1 className="display-heading mb-6" style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}>
            How it{' '}
            <span className="serif-accent" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05em' }}>
              actually
            </span>{' '}
            works.
          </h1>
          <p style={{ color: 'var(--cream-dim)', fontSize: '17px', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto' }}>
            A transparent, community-driven subscription that rewards great golf
            and funds the causes you care about.
          </p>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── Flow Steps ──────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: 'var(--bg-void)' }}>
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {FLOW_STEPS.map(({ step, icon, title, description, highlight, accent }, i) => (
              <div
                key={step}
                className="glass-card p-8 relative overflow-hidden"
                style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}
              >
                {/* Large step number background */}
                <span
                  className="absolute top-2 right-5 leading-none pointer-events-none select-none"
                  aria-hidden="true"
                  style={{
                    fontFamily: 'var(--font-syne)',
                    fontWeight: 800,
                    fontSize: '9rem',
                    color: accent === 'gold' ? 'rgba(245,166,35,0.05)' : 'rgba(74,255,107,0.05)',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {step}
                </span>

                {/* Icon + step pill */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: accent === 'gold' ? 'var(--gold-muted)' : 'var(--green-muted)',
                    border: `1px solid ${accent === 'gold' ? 'rgba(245,166,35,0.2)' : 'var(--border-bright)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                  }}>
                    {icon}
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-syne)',
                    fontWeight: 700,
                    color: accent === 'gold' ? 'var(--gold)' : 'var(--green)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}>
                    Step {step}
                  </span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: '220px', position: 'relative', zIndex: 1 }}>
                  <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.3rem', color: 'var(--cream)', letterSpacing: '-0.02em', marginBottom: '10px' }}>
                    {title}
                  </h2>
                  <p style={{ color: 'var(--cream-dim)', fontSize: '14px', lineHeight: 1.7, marginBottom: '16px' }}>
                    {description}
                  </p>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-syne)',
                    fontWeight: 600,
                    background: accent === 'gold' ? 'var(--gold-muted)' : 'var(--green-muted)',
                    color: accent === 'gold' ? 'var(--gold)' : 'var(--green)',
                    border: `1px solid ${accent === 'gold' ? 'rgba(245,166,35,0.2)' : 'var(--border-bright)'}`,
                  }}>
                    <span>✓</span> {highlight}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── Prize Pool Structure ─────────────────────────────────────── */}
      <section className="py-24" style={{ background: 'var(--bg-deep)' }}>
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.12em] mb-4"
              style={{ color: 'var(--gold)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
              The Draw
            </p>
            <h2 className="display-heading mb-4" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}>
              Prize Pool Structure
            </h2>
            <p style={{ color: 'var(--cream-dim)', fontSize: '15px', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
              Every draw distributes the pool across three winning tiers.
              Unclaimed tiers roll over, growing the jackpot.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {PRIZE_TIERS.map(({ match, label, pct, rollover, accent }) => (
              <div
                key={match}
                style={{
                  background: accent === 'gold' ? 'rgba(245,166,35,0.05)' : 'var(--bg-card)',
                  border: `1px solid ${accent === 'gold' ? 'rgba(245,166,35,0.2)' : 'var(--border)'}`,
                  borderRadius: '16px',
                  padding: '28px 24px',
                  textAlign: 'center',
                }}
              >
                {/* Match dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '16px' }}>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const filled = label === 'Jackpot' ? 5 : label === 'Major Prize' ? 4 : 3;
                    return (
                      <span key={i} style={{
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        background: i < filled
                          ? (accent === 'gold' ? 'var(--gold)' : 'var(--green)')
                          : 'var(--border-mid)',
                        display: 'inline-block',
                      }} />
                    );
                  })}
                </div>
                <p style={{
                  fontFamily: 'var(--font-syne)',
                  fontWeight: 800,
                  fontSize: '2.8rem',
                  letterSpacing: '-0.04em',
                  color: accent === 'gold' ? 'var(--gold)' : 'var(--green)',
                  lineHeight: 1,
                  marginBottom: '6px',
                }}>
                  {pct}%
                </p>
                <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', color: 'var(--cream)', marginBottom: '4px' }}>
                  {label}
                  {rollover && (
                    <span style={{
                      marginLeft: '6px',
                      fontSize: '9px',
                      padding: '2px 6px',
                      borderRadius: '99px',
                      background: 'var(--gold-muted)',
                      color: 'var(--gold)',
                      border: '1px solid rgba(245,166,35,0.2)',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}>
                      ROLLOVER
                    </span>
                  )}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{match}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section
        className="py-28 grain-overlay relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(22,55,24,0.6) 0%, var(--bg-void) 70%)' }}
      >
        <div className="relative z-10 mx-auto max-w-2xl px-5 text-center">
          <p className="text-[11px] uppercase tracking-[0.12em] mb-6"
            style={{ color: 'var(--green)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
            Ready?
          </p>
          <h2 className="display-heading mb-6" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}>
            Start playing.
            <br />
            <span className="serif-accent" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05em' }}>
              Give back.
            </span>
          </h2>
          <p style={{ color: 'var(--cream-dim)', fontSize: '16px', lineHeight: 1.7, marginBottom: '36px' }}>
            From {SUBSCRIPTION_PLANS.monthly.price_display}/month. Cancel anytime.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn btn-primary btn-lg">
              Get Started — {SUBSCRIPTION_PLANS.monthly.price_display}
            </Link>
            <Link href="/pricing" className="btn btn-outline btn-lg">
              Compare Plans
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
