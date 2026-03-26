/**
 * About page (/about) — dark editorial theme.
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about the Golf Charity Club mission — connecting golfers with charitable causes through a transparent, prize-based subscription model.',
};

const TEAM = [
  { name: 'James Hargreaves', role: 'Founder & CEO', initials: 'JH' },
  { name: 'Sarah Mitchell', role: 'Head of Charity Partnerships', initials: 'SM' },
  { name: 'Tom Patel', role: 'Chief Technology Officer', initials: 'TP' },
  { name: 'Lucy Brennan', role: 'Operations Director', initials: 'LB' },
];

const STATS = [
  { value: '2,400+', label: 'Members' },
  { value: '£1.25M', label: 'Raised for Charity' },
  { value: '36', label: 'Draws Completed' },
  { value: '18', label: 'Charities Supported' },
];

const VALUES = [
  {
    title: 'Radical Transparency',
    body: 'Every penny of every subscription is publicly accounted for — split between prizes, charity, and operations at clearly published percentages. No fine print.',
    icon: '◎',
    accent: 'green' as const,
  },
  {
    title: 'Golfers First',
    body: 'We built this for weekend golfers, club members, and social players who want their game to mean something beyond the scorecard.',
    icon: '⛳',
    accent: 'green' as const,
  },
  {
    title: 'Charity Impact',
    body: 'We partner only with UK registered charities vetted by the Charity Commission. Every contribution is tracked and reported quarterly.',
    icon: '💚',
    accent: 'gold' as const,
  },
  {
    title: 'Fair Play',
    body: "Our draw engine rewards active players with subtle weighting — but everyone has a real shot at the jackpot every single month.",
    icon: '🎱',
    accent: 'gold' as const,
  },
];

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--bg-void)', color: 'var(--cream)' }}>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        className="relative py-32 overflow-hidden grain-overlay"
        style={{ background: 'radial-gradient(ellipse 100% 80% at 30% 50%, rgba(18,45,20,0.6) 0%, var(--bg-void) 65%)' }}
      >
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-[640px]">
            <p className="text-[11px] uppercase tracking-[0.12em] mb-6"
              style={{ color: 'var(--green)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
              Our Story
            </p>
            <h1 className="display-heading mb-7" style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}>
              Golf with
              <br />
              <span className="serif-accent text-gradient-green" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05em' }}>
                purpose.
              </span>
            </h1>
            <p style={{ color: 'var(--cream-dim)', fontSize: '17px', lineHeight: 1.7, maxWidth: '520px' }}>
              We founded Golf Charity Club because we believed golfers could do more
              than just play — they could make a real, measurable difference to
              charities every time they teed up.
            </p>
          </div>
        </div>

        {/* Floating number decoration */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.04]" aria-hidden="true">
          <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '28rem', color: 'var(--green)', lineHeight: 1 }}>
            G
          </span>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── Mission ────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: 'var(--bg-void)' }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'start' }}>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] mb-5"
                style={{ color: 'var(--green)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
                Our Mission
              </p>
              <h2 className="display-heading mb-6" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
                Transparent giving,
                <br />
                <span className="serif-accent" style={{ fontFamily: 'var(--font-serif)' }}>
                  every month.
                </span>
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '8px' }}>
              <p style={{ color: 'var(--cream-dim)', fontSize: '15px', lineHeight: 1.75 }}>
                Golf Charity Club is a subscription platform that fuses the excitement of
                monthly prize draws with direct charitable giving. For a fixed monthly fee,
                members enter an automated draw based on their golf scores, with a portion
                of every subscription going directly to their chosen registered charity.
              </p>
              <p style={{ color: 'var(--cream-dim)', fontSize: '15px', lineHeight: 1.75 }}>
                We believe in radical transparency: every penny of every subscription is
                accounted for — split between prizes, charity, and platform operations
                at clearly published percentages. No fine print. No hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: 'var(--bg-deep)' }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '40px' }}>
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <dd className="display-heading text-gradient-green" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: 1 }}>
                  {value}
                </dd>
                <dt className="text-[11px] uppercase tracking-[0.1em] mt-3"
                  style={{ color: 'var(--muted)', fontFamily: 'var(--font-syne)', fontWeight: 500 }}>
                  {label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── Values ─────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: 'var(--bg-void)' }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-14">
            <p className="text-[11px] uppercase tracking-[0.12em] mb-4"
              style={{ color: 'var(--green)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
              What We Stand For
            </p>
            <h2 className="display-heading" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Our values.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {VALUES.map(({ title, body, icon, accent }) => (
              <div
                key={title}
                className="glass-card p-7"
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: accent === 'gold' ? 'var(--gold-muted)' : 'var(--green-muted)',
                  border: `1px solid ${accent === 'gold' ? 'rgba(245,166,35,0.2)' : 'var(--border-bright)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  marginBottom: '16px',
                }}>
                  {icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1rem', color: 'var(--cream)', marginBottom: '10px', letterSpacing: '-0.01em' }}>
                  {title}
                </h3>
                <p style={{ color: 'var(--cream-dim)', fontSize: '13px', lineHeight: 1.7 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── Team ───────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: 'var(--bg-deep)' }}>
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.12em] mb-4"
              style={{ color: 'var(--green)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
              The People
            </p>
            <h2 className="display-heading" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              The Team
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
            {TEAM.map(({ name, role, initials }) => (
              <div key={name} className="glass-card p-6" style={{ textAlign: 'center' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(74,255,107,0.08)',
                  border: '1px solid rgba(74,255,107,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  fontFamily: 'var(--font-syne)',
                  fontWeight: 700,
                  fontSize: '15px',
                  color: 'var(--green)',
                }}>
                  {initials}
                </div>
                <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', color: 'var(--cream)', marginBottom: '4px' }}>
                  {name}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section
        className="py-28 text-center grain-overlay relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(22,55,24,0.65) 0%, var(--bg-void) 70%)' }}
      >
        <div className="relative z-10 mx-auto max-w-2xl px-5">
          <p className="text-[11px] uppercase tracking-[0.12em] mb-6"
            style={{ color: 'var(--green)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
            Join the Community
          </p>
          <h2 className="display-heading mb-8" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}>
            Play golf.
            <br />
            <span className="serif-accent" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05em' }}>Give back.</span>
          </h2>
          <Link href="/signup" className="btn btn-primary btn-xl">
            Get Started Today
          </Link>
        </div>
      </section>

    </div>
  );
}
