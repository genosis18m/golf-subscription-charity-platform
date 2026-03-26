'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Charity } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface Props { charities: Charity[]; }

export function CharityDirectory({ charities }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'featured'>('all');

  const filtered = useMemo(() => {
    return charities.filter((c) => {
      const matchesQuery =
        !query ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        (c.tagline ?? '').toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === 'all' || (filter === 'featured' && c.is_featured);
      return matchesQuery && matchesFilter;
    });
  }, [charities, query, filter]);

  return (
    <section className="py-16 px-5" style={{ background: 'var(--bg-void)' }}>
      <div className="mx-auto max-w-7xl">

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--muted)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search charities..."
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--cream)',
                fontFamily: 'var(--font-dm-sans)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--border-bright)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'featured'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-5 py-3 rounded-xl text-sm transition-all capitalize"
                style={{
                  fontFamily: 'var(--font-syne)',
                  fontWeight: 600,
                  background: filter === f ? 'var(--green-muted)' : 'var(--bg-card)',
                  border: `1px solid ${filter === f ? 'var(--border-bright)' : 'var(--border)'}`,
                  color: filter === f ? 'var(--green)' : 'var(--cream-dim)',
                }}
              >
                {f === 'all' ? `All (${charities.length})` : 'Featured'}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="text-[12px] mb-6" style={{ color: 'var(--muted)', fontFamily: 'var(--font-syne)' }}>
          {filtered.length} {filtered.length === 1 ? 'charity' : 'charities'} found
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4" style={{ opacity: 0.3 }}>◎</p>
            <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-syne)' }}>
              No charities match &ldquo;{query}&rdquo;
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((charity) => (
              <CharityListCard key={charity.id} charity={charity} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CharityListCard({ charity }: { charity: Charity }) {
  return (
    <Link href={`/charities/${charity.slug}`} className="glass-card overflow-hidden group block">
      {/* Cover */}
      <div
        className="relative h-44 overflow-hidden"
        style={{
          background: charity.banner_url ? undefined : 'linear-gradient(135deg, #0d2010, #0a1a0c)',
        }}
      >
        {charity.banner_url && (
          <Image
            src={charity.banner_url}
            alt={charity.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, var(--bg-card) 100%)' }} />

        {charity.is_featured && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] tracking-[0.1em] uppercase"
            style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, background: 'var(--gold-muted)', border: '1px solid rgba(245,166,35,0.3)', color: 'var(--gold)', backdropFilter: 'blur(8px)' }}
          >
            Spotlight
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <div>
          <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '15px', color: 'var(--cream)', letterSpacing: '-0.01em' }}>
            {charity.name}
          </h3>
          {charity.tagline && (
            <p className="mt-0.5 line-clamp-1" style={{ fontSize: '12px', color: 'var(--muted)' }}>
              {charity.tagline}
            </p>
          )}
        </div>

        <p className="line-clamp-2 text-[13px] leading-relaxed" style={{ color: 'var(--cream-dim)' }}>
          {charity.description}
        </p>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-4">
            <div>
              <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', color: 'var(--green)' }}>
                {formatCurrency(charity.total_raised)}
              </p>
              <p style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-syne)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Raised
              </p>
            </div>
            <div className="w-px h-8" style={{ background: 'var(--border)' }} />
            <div>
              <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', color: 'var(--cream)' }}>
                {charity.supporter_count}
              </p>
              <p style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-syne)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Supporters
              </p>
            </div>
          </div>
          <span
            className="text-[12px] transition-colors group-hover:text-[var(--cream)]"
            style={{ color: 'var(--green)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}
          >
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
