/**
 * Individual Charity Profile — /charities/[slug]
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchCharityBySlug, fetchCharities } from '@/lib/data/charities';
import { formatCurrency } from '@/lib/utils';

interface PageProps { params: Promise<{ slug: string }>; }

export async function generateStaticParams() {
  const charities = await fetchCharities();
  return charities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const charity = await fetchCharityBySlug(slug);
  if (!charity) return { title: 'Charity Not Found' };
  return {
    title: charity.name,
    description: charity.tagline ?? charity.description.slice(0, 160),
  };
}

export default async function CharityProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const charity = await fetchCharityBySlug(slug);
  if (!charity) notFound();

  const upcomingEvents = (charity.events ?? [])
    .filter((e) => e.is_published && new Date(e.event_date) >= new Date())
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  return (
    <article style={{ background: 'var(--bg-void)', minHeight: '100vh' }}>

      {/* ── Banner ─────────────────────────────────────────────────────── */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        {charity.banner_url ? (
          <Image
            src={charity.banner_url}
            alt={`${charity.name} cover`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #0a2010 0%, #050a06 100%)' }}
          />
        )}
        {/* Deep gradient overlay so header text is readable */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(7,9,10,0.85) 70%, var(--bg-void) 100%)' }}
        />

        {/* Featured badge */}
        {charity.is_featured && (
          <div className="absolute top-6 left-6" style={{ marginTop: '70px' }}>
            <span
              className="px-3 py-1.5 rounded-full text-[10px] tracking-[0.1em] uppercase"
              style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, background: 'var(--gold-muted)', border: '1px solid rgba(245,166,35,0.3)', color: 'var(--gold)', backdropFilter: 'blur(8px)' }}
            >
              Spotlight Charity
            </span>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-5xl px-5 sm:px-8 -mt-20 relative z-10 pb-24">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-end gap-5 mb-8">
          {charity.logo_url && (
            <div
              className="relative w-20 h-20 rounded-2xl shrink-0 overflow-hidden border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-mid)' }}
            >
              <Image src={charity.logo_url} alt={`${charity.name} logo`} fill className="object-contain p-2" />
            </div>
          )}
          <div className="pb-1">
            <h1 className="display-heading" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
              {charity.name}
            </h1>
            {charity.tagline && (
              <p className="mt-1.5 serif-accent" style={{ color: 'var(--cream-dim)', fontSize: '18px', fontFamily: 'var(--font-cormorant)' }}>
                {charity.tagline}
              </p>
            )}
          </div>
        </div>

        {/* ── Stats strip ─────────────────────────────────────────────────── */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-px mb-12 rounded-2xl overflow-hidden"
          style={{ background: 'var(--border)', border: '1px solid var(--border)' }}
        >
          {[
            { value: formatCurrency(charity.total_raised), label: 'Total Raised' },
            { value: charity.supporter_count.toLocaleString(), label: 'Active Supporters' },
            ...(charity.registration_number
              ? [{ value: charity.registration_number, label: 'Registered Charity', mono: true }]
              : []),
          ].map(({ value, label, mono }) => (
            <div key={label} className="px-6 py-5 text-center" style={{ background: 'var(--bg-card)' }}>
              <p
                style={{
                  fontFamily: mono ? 'monospace' : 'var(--font-syne)',
                  fontWeight: 700,
                  fontSize: mono ? '14px' : '1.6rem',
                  color: label === 'Total Raised' ? 'var(--green)' : 'var(--cream)',
                  letterSpacing: mono ? '0.05em' : '-0.02em',
                }}
              >
                {value}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-syne)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left: about + events */}
          <div className="lg:col-span-2 space-y-10">

            {/* About */}
            <section>
              <h2 className="mb-4" style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--cream)', letterSpacing: '-0.01em' }}>
                About
              </h2>
              <div className="space-y-4">
                {charity.description.split('\n').map((para, i) => (
                  <p key={i} style={{ color: 'var(--cream-dim)', fontSize: '15px', lineHeight: 1.75 }}>
                    {para}
                  </p>
                ))}
              </div>
            </section>

            {/* Impact bar */}
            <section
              className="rounded-2xl p-6"
              style={{ background: 'var(--green-muted)', border: '1px solid var(--border-bright)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full shrink-0"
                  style={{ background: 'rgba(74,255,107,0.15)', border: '1px solid var(--border-bright)' }}
                >
                  <span style={{ color: 'var(--green)', fontSize: '20px' }}>◆</span>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '15px', color: 'var(--cream)' }}>
                    Minimum 10% of your subscription goes here
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--cream-dim)', marginTop: '2px' }}>
                    You can increase your contribution percentage at any time in your dashboard.
                  </p>
                </div>
              </div>
            </section>

            {/* Upcoming events */}
            {upcomingEvents.length > 0 && (
              <section>
                <h2 className="mb-5" style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--cream)', letterSpacing: '-0.01em' }}>
                  Upcoming Events
                </h2>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl p-5"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', color: 'var(--cream)' }}>
                            {event.title}
                          </p>
                          {event.location && (
                            <p className="mt-1 flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--muted)' }}>
                              <span>◎</span> {event.location}
                            </p>
                          )}
                          {event.description && (
                            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--cream-dim)' }}>
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div
                          className="shrink-0 px-3 py-1.5 rounded-full text-[11px]"
                          style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, background: 'var(--bg-deep)', color: 'var(--gold)', border: '1px solid rgba(245,166,35,0.2)' }}
                        >
                          {new Date(event.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right: sticky CTA */}
          <div className="lg:col-span-1">
            <div
              className="sticky rounded-2xl p-7 space-y-5"
              style={{ top: '96px', background: 'var(--bg-card)', border: '1px solid var(--border-bright)' }}
            >
              <div>
                <p
                  style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1rem', color: 'var(--cream)', letterSpacing: '-0.01em' }}
                >
                  Support {charity.name}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--cream-dim)' }}>
                  Subscribe to Golf Charity Club and choose this charity. A portion of every subscription goes directly to them — automatically, every month.
                </p>
              </div>

              {/* Contribution visual */}
              <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)' }}>
                <div className="flex justify-between text-[12px]">
                  <span style={{ color: 'var(--muted)', fontFamily: 'var(--font-syne)' }}>Your contribution</span>
                  <span style={{ color: 'var(--green)', fontFamily: 'var(--font-syne)', fontWeight: 700 }}>Min. 10%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-mid)' }}>
                  <div className="h-full rounded-full" style={{ width: '10%', background: 'var(--green)' }} />
                </div>
                <p className="text-[11px]" style={{ color: 'var(--muted)' }}>Increase anytime in your dashboard</p>
              </div>

              <Link
                href={`/signup?charity=${charity.id}`}
                className="btn btn-primary btn-md w-full text-center block"
              >
                Subscribe &amp; Support
              </Link>

              {charity.website_url && (
                <a
                  href={charity.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm w-full text-center block"
                >
                  Visit Website →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Back link ─────────────────────────────────────────────────────── */}
        <div className="mt-16">
          <Link
            href="/charities"
            className="inline-flex items-center gap-2 text-[13px] transition-colors hover:text-[var(--cream)]"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-syne)', fontWeight: 500 }}
          >
            ← Back to all charities
          </Link>
        </div>
      </div>
    </article>
  );
}
