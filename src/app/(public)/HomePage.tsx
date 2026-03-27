/**
 * Homepage — the emotional entry point.
 *
 * Design: Dark editorial luxury. Number balls as visual motif.
 * Sections: Hero → Manifesto → How It Works → Stats → Charities → Prize Draw → CTA
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchFeaturedCharities } from '@/lib/data/charities';
import { SUBSCRIPTION_PLANS } from '@/constants';
import type { Charity } from '@/types';

export const homePageMetadata: Metadata = {
  title: 'GOLF-Fego — Play, Win & Give Back',
};

export const revalidate = 600;

// ─── Static data ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: '01',
    title: 'Subscribe',
    body: 'Pick a monthly or annual plan. Choose a charity that matters to you. Done in 2 minutes.',
    accent: 'green' as const,
  },
  {
    num: '02',
    title: 'Score',
    body: 'Log your last 5 golf rounds in Stableford format. Your scores become your draw numbers.',
    accent: 'green' as const,
  },
  {
    num: '03',
    title: 'Draw',
    body: 'Every month, 5 numbers are drawn. Match 3, 4, or all 5 to claim your prize tier.',
    accent: 'gold' as const,
  },
  {
    num: '04',
    title: 'Impact',
    body: 'Win or not — 10%+ of every subscription goes directly to your chosen charity.',
    accent: 'gold' as const,
  },
];

const STATS = [
  { value: '2,400+', label: 'Active Members' },
  { value: '£125k',  label: 'Raised for Charity' },
  { value: '£18k',   label: 'Monthly Prize Pool' },
  { value: '18',     label: 'Partner Charities' },
];

const PRIZE_TIERS = [
  { match: '5 Matched', share: '40%', label: 'Jackpot', rollover: true,  accent: 'gold' },
  { match: '4 Matched', share: '35%', label: 'Major Prize', rollover: false, accent: 'green' },
  { match: '3 Matched', share: '25%', label: 'Prize',     rollover: false, accent: 'green' },
];

// ─── Floating ball positions (hero decoration) ─────────────────────────────

const FLOAT_BALLS: { n: number; top: string; right: string; size: string; anim: string; delay: string; opacity: string }[] = [
  { n: 7,  top: '12%', right: '8%',  size: '72px', anim: 'float-a', delay: '0s',    opacity: '0.55' },
  { n: 23, top: '28%', right: '22%', size: '52px', anim: 'float-b', delay: '1.2s',  opacity: '0.35' },
  { n: 14, top: '55%', right: '6%',  size: '88px', anim: 'float-c', delay: '0.6s',  opacity: '0.45' },
  { n: 31, top: '72%', right: '28%', size: '44px', anim: 'float-a', delay: '2s',    opacity: '0.25' },
  { n: 42, top: '18%', right: '38%', size: '36px', anim: 'float-b', delay: '0.3s',  opacity: '0.18' },
  { n: 5,  top: '82%', right: '14%', size: '60px', anim: 'float-c', delay: '1.5s',  opacity: '0.30' },
  { n: 19, top: '40%', right: '44%', size: '28px', anim: 'float-a', delay: '0.9s',  opacity: '0.12' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const featuredCharities = await fetchFeaturedCharities(3);

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col justify-center overflow-hidden grain-overlay"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(20,50,22,0.55) 0%, var(--bg-void) 70%)',
        }}
        aria-label="Hero"
      >
        {/* ── Floating draw balls (decorative) ──────────────────────────── */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
          {FLOAT_BALLS.map(({ n, top, right, size, anim, delay, opacity }) => (
            <div
              key={n}
              className={`absolute number-ball`}
              style={{
                top,
                right,
                width: size,
                height: size,
                fontSize: `calc(${size} * 0.32)`,
                opacity,
                animation: `${anim} ${anim === 'float-a' ? '7s' : anim === 'float-b' ? '9s' : '5.5s'} ease-in-out ${delay} infinite`,
                background: 'radial-gradient(circle at 35% 30%, rgba(74,255,107,0.12), transparent 60%), rgba(17,27,18,0.6)',
                borderColor: 'rgba(74,255,107,0.15)',
                color: 'rgba(74,255,107,0.7)',
                backdropFilter: 'blur(2px)',
              }}
            >
              {n}
            </div>
          ))}
          {/* Large ambient glow circles */}
          <div
            className="absolute rounded-full animate-glow-pulse"
            style={{
              width: '500px', height: '500px',
              top: '10%', right: '-100px',
              background: 'radial-gradient(circle, rgba(74,255,107,0.04) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: '400px', height: '400px',
              bottom: '5%', left: '-80px',
              background: 'radial-gradient(circle, rgba(245,166,35,0.04) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
        </div>

        {/* ── Content ───────────────────────────────────────────────────── */}
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pt-32 pb-20">
          <div className="max-w-[700px]">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8">
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] tracking-[0.1em] uppercase"
                style={{
                  fontFamily: 'var(--font-syne)',
                  fontWeight: 600,
                  background: 'var(--green-muted)',
                  border: '1px solid var(--border-bright)',
                  color: 'var(--green)',
                }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full animate-glow-pulse"
                  style={{ background: 'var(--green)' }}
                />
                Monthly Draws Now Open
              </span>
            </div>

            {/* Main Headline */}
            <h1
              className="display-heading mb-6"
              style={{ fontSize: 'clamp(3.2rem, 8vw, 6.5rem)' }}
            >
              Golf that{' '}
              <span
                className="serif-accent"
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: '1.1em',
                  color: 'var(--cream)',
                }}
              >
                actually
              </span>
              <br />
              <span className="text-gradient-green">changes</span>
              <br />
              something.
            </h1>

            {/* Sub */}
            <p
              className="mb-10 max-w-[520px] leading-relaxed"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '17px',
                color: 'var(--cream-dim)',
              }}
            >
              Subscribe. Enter your scores. Win prizes based on your game.
              Every single month, your subscription funds a charity you believe in.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="btn btn-primary btn-lg"
              >
                Start Playing — {SUBSCRIPTION_PLANS.monthly.price_display}/mo
              </Link>
              <Link
                href="/how-it-works"
                className="btn btn-outline btn-lg"
              >
                How it works →
              </Link>
            </div>

            {/* Social proof */}
            <p
              className="mt-8 text-[13px]"
              style={{ color: 'var(--muted)' }}
            >
              Join 2,400+ golfers already playing with purpose
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          aria-hidden="true"
        >
          <span className="text-[11px] tracking-[0.12em] uppercase" style={{ color: 'var(--muted)', fontFamily: 'var(--font-syne)' }}>
            Scroll
          </span>
          <div
            className="w-[1px] h-10 animate-glow-pulse"
            style={{ background: 'linear-gradient(to bottom, var(--muted), transparent)' }}
          />
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════════════
          MANIFESTO STRIP
      ════════════════════════════════════════════════════════════════════ */}
      <div
        className="overflow-hidden py-5 border-y border-[var(--border)]"
        style={{ background: 'var(--bg-deep)' }}
        aria-hidden="true"
      >
        <div className="animate-ticker flex items-center gap-8 whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, set) => (
            <div key={set} className="flex items-center gap-8">
              {['Play Golf', '◆ Win Real Prizes', '◆ Support Charity', '◆ Every Month', '◆ Stableford Scoring', '◆ Monthly Draw', '◆ Zero Drama'].map((text) => (
                <span
                  key={text}
                  className="text-[12px] tracking-[0.08em] uppercase"
                  style={{
                    color: 'var(--muted)',
                    fontFamily: 'var(--font-syne)',
                    fontWeight: 500,
                  }}
                >
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>


      {/* ════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-28"
        style={{ background: 'var(--bg-void)' }}
        aria-labelledby="how-heading"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Header */}
          <div className="mb-16 max-w-xl">
            <p
              className="text-[11px] uppercase tracking-[0.12em] mb-4"
              style={{ color: 'var(--green)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}
            >
              The Process
            </p>
            <h2
              id="how-heading"
              className="display-heading mb-4"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}
            >
              Four steps.
              <br />
              <span className="serif-accent" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.1em' }}>
                Endless impact.
              </span>
            </h2>
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {STEPS.map(({ num, title, body, accent }) => (
              <div
                key={num}
                className="glass-card p-8 relative overflow-hidden group"
              >
                {/* Background number */}
                <span
                  className="absolute top-4 right-6 leading-none pointer-events-none select-none"
                  style={{
                    fontFamily: 'var(--font-syne)',
                    fontWeight: 800,
                    fontSize: '7rem',
                    color: accent === 'gold' ? 'rgba(245,166,35,0.06)' : 'rgba(74,255,107,0.06)',
                    letterSpacing: '-0.04em',
                  }}
                  aria-hidden="true"
                >
                  {num}
                </span>

                {/* Step pill */}
                <span
                  className="inline-block px-2.5 py-1 rounded-full text-[10px] tracking-[0.1em] uppercase mb-5"
                  style={{
                    fontFamily: 'var(--font-syne)',
                    fontWeight: 600,
                    background: accent === 'gold' ? 'var(--gold-muted)' : 'var(--green-muted)',
                    color: accent === 'gold' ? 'var(--gold)' : 'var(--green)',
                    border: `1px solid ${accent === 'gold' ? 'rgba(245,166,35,0.25)' : 'var(--border-bright)'}`,
                  }}
                >
                  Step {num}
                </span>

                <h3
                  className="mb-3"
                  style={{
                    fontFamily: 'var(--font-syne)',
                    fontWeight: 700,
                    fontSize: '1.35rem',
                    color: 'var(--cream)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {title}
                </h3>
                <p style={{ color: 'var(--cream-dim)', fontSize: '14px', lineHeight: 1.65 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/how-it-works"
              className="text-[13px] transition-colors hover:text-[var(--cream)]"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-syne)', fontWeight: 500 }}
            >
              Read the full breakdown →
            </Link>
          </div>
        </div>
      </section>

      <div className="section-divider" />


      {/* ════════════════════════════════════════════════════════════════════
          STATS
      ════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: 'var(--bg-deep)' }}
        aria-label="Platform statistics"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {STATS.map(({ value, label }) => (
              <div key={label} className="space-y-2">
                <dd
                  className="display-heading text-gradient-green leading-none"
                  style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}
                >
                  {value}
                </dd>
                <dt
                  className="text-[12px] uppercase tracking-[0.1em]"
                  style={{ color: 'var(--muted)', fontFamily: 'var(--font-syne)', fontWeight: 500 }}
                >
                  {label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="section-divider" />


      {/* ════════════════════════════════════════════════════════════════════
          FEATURED CHARITIES
      ════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-28"
        style={{ background: 'var(--bg-void)' }}
        aria-labelledby="charities-heading"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <div>
              <p
                className="text-[11px] uppercase tracking-[0.12em] mb-4"
                style={{ color: 'var(--green)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}
              >
                Where Your Money Goes
              </p>
              <h2
                id="charities-heading"
                className="display-heading"
                style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}
              >
                Choose your
                <br />
                <span className="serif-accent" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.1em' }}>
                  cause.
                </span>
              </h2>
            </div>
            <Link
              href="/charities"
              className="btn btn-outline btn-sm shrink-0 self-start sm:self-auto"
            >
              All charities →
            </Link>
          </div>

          {/* Charity cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredCharities.map((charity) => (
              <Link
                key={charity.id}
                href={`/charities/${charity.slug}`}
                className="glass-card overflow-hidden group block"
                style={{ minHeight: '280px' }}
              >
                {/* Cover image */}
                <div
                  className="relative h-36 overflow-hidden"
                  style={{
                    background: charity.banner_url
                      ? undefined
                      : 'linear-gradient(135deg, #0d2010, #0a1a0c)',
                  }}
                >
                  {charity.banner_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={charity.banner_url}
                      alt={charity.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, var(--bg-card) 100%)' }} />
                  <span
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] tracking-[0.08em] uppercase"
                    style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, background: 'var(--green-muted)', border: '1px solid var(--border-bright)', color: 'var(--green)', backdropFilter: 'blur(8px)' }}
                  >
                    10%+ donated
                  </span>
                </div>

                <div className="p-6 space-y-2">
                  <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1rem', color: 'var(--cream)', letterSpacing: '-0.01em' }}>
                    {charity.name}
                  </h3>
                  <p className="text-[13px] leading-relaxed line-clamp-2" style={{ color: 'var(--cream-dim)' }}>
                    {charity.tagline ?? charity.description}
                  </p>
                  <div className="pt-3">
                    <span className="text-[12px] font-medium transition-colors group-hover:text-[var(--cream)]" style={{ color: 'var(--green)', fontFamily: 'var(--font-syne)' }}>
                      Learn more →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />


      {/* ════════════════════════════════════════════════════════════════════
          PRIZE DRAW BREAKDOWN
      ════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: 'var(--bg-deep)' }}
        aria-labelledby="draw-heading"
      >
        {/* Background number ball decoration */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none"
          aria-hidden="true"
          style={{ opacity: 0.03 }}
        >
          <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '32rem', color: 'var(--gold)', lineHeight: 1 }}>
            5
          </span>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <div>
              <p
                className="text-[11px] uppercase tracking-[0.12em] mb-4"
                style={{ color: 'var(--gold)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}
              >
                The Draw
              </p>
              <h2
                id="draw-heading"
                className="display-heading mb-6"
                style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}
              >
                Match numbers.
                <br />
                <span className="text-gradient-gold">Win prizes.</span>
              </h2>
              <p style={{ color: 'var(--cream-dim)', fontSize: '15px', lineHeight: 1.7, maxWidth: '420px' }}>
                Each month, 5 numbers are drawn from 1–45. Your entered Stableford scores
                are your numbers. Match 3, 4, or all 5 to win your tier.
                The jackpot rolls over if no one hits 5.
              </p>

              {/* Visual draw balls */}
              <div className="mt-8 flex items-center gap-3 flex-wrap">
                <span
                  className="text-[11px] uppercase tracking-[0.1em] mr-1"
                  style={{ color: 'var(--muted)', fontFamily: 'var(--font-syne)' }}
                >
                  This month:
                </span>
                {[7, 14, 23, 31, 42].map((n) => (
                  <span key={n} className="number-ball number-ball--gold h-12 w-12 text-base">
                    {n}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: prize tiers */}
            <div className="space-y-4">
              {PRIZE_TIERS.map(({ match, share, label, rollover, accent }) => (
                <div
                  key={match}
                  className="flex items-center justify-between p-5 rounded-2xl"
                  style={{
                    background: accent === 'gold' ? 'rgba(245,166,35,0.05)' : 'var(--bg-card)',
                    border: `1px solid ${accent === 'gold' ? 'rgba(245,166,35,0.2)' : 'var(--border)'}`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Match indicator balls */}
                    <div className="flex gap-1.5">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const filled = match === '5 Matched' ? 5 : match === '4 Matched' ? 4 : 3;
                        return (
                          <span
                            key={i}
                            className="inline-block rounded-full"
                            style={{
                              width: '8px',
                              height: '8px',
                              background: i < filled
                                ? (accent === 'gold' ? 'var(--gold)' : 'var(--green)')
                                : 'var(--border-mid)',
                            }}
                          />
                        );
                      })}
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: 'var(--font-syne)',
                          fontWeight: 700,
                          fontSize: '14px',
                          color: 'var(--cream)',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {label}
                        {rollover && (
                          <span
                            className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{
                              background: 'var(--gold-muted)',
                              color: 'var(--gold)',
                              border: '1px solid rgba(245,166,35,0.2)',
                              fontWeight: 600,
                              letterSpacing: '0.05em',
                            }}
                          >
                            ROLLOVER
                          </span>
                        )}
                      </p>
                      <p
                        style={{
                          fontSize: '12px',
                          color: 'var(--muted)',
                          fontFamily: 'var(--font-dm-sans)',
                        }}
                      >
                        {match}
                      </p>
                    </div>
                  </div>
                  <span
                    className="display-heading"
                    style={{
                      fontSize: '2.2rem',
                      color: accent === 'gold' ? 'var(--gold)' : 'var(--green)',
                    }}
                  >
                    {share}
                  </span>
                </div>
              ))}
              <p className="text-[12px] text-center pt-2" style={{ color: 'var(--muted)' }}>
                Prize pool auto-calculated from active subscriber count each month
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />


      {/* ════════════════════════════════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-32 relative overflow-hidden grain-overlay"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(22,55,24,0.7) 0%, var(--bg-void) 70%)',
        }}
        aria-label="Call to action"
      >
        <div className="relative z-10 mx-auto max-w-3xl px-5 text-center">
          <p
            className="text-[11px] uppercase tracking-[0.12em] mb-6"
            style={{ color: 'var(--green)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}
          >
            Ready to play?
          </p>
          <h2
            className="display-heading mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
          >
            Tee off.
            <br />
            <span className="serif-accent" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.05em' }}>
              Give back.
            </span>
            <br />
            Win big.
          </h2>
          <p
            className="mb-10 mx-auto max-w-md"
            style={{ color: 'var(--cream-dim)', fontSize: '16px', lineHeight: 1.7 }}
          >
            From {SUBSCRIPTION_PLANS.monthly.price_display}/month. Cancel anytime.
            Every round matters — to your game and to your charity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn btn-primary btn-xl">
              Start Your Membership
            </Link>
            <Link href="/pricing" className="btn btn-outline btn-xl">
              Compare Plans
            </Link>
          </div>

          {/* Draw number balls as CTA decoration */}
          <div className="flex justify-center gap-3 mt-14 opacity-20" aria-hidden="true">
            {[3, 9, 17, 28, 35].map((n) => (
              <span
                key={n}
                className="number-ball h-10 w-10 text-sm"
                style={{ color: 'var(--green)' }}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
