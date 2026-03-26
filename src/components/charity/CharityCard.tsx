/**
 * CharityCard — dark, premium card for displaying a charity in grid/list context.
 * Supports both a "browse" mode (with a detail link) and a "select" mode
 * (for the onboarding charity picker, with an interactive select button).
 */

import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import type { Charity } from '@/types';

interface CharityCardProps {
  charity: Charity;
  onSelect?: (charity: Charity) => void;
  isSelected?: boolean;
}

export function CharityCard({ charity, onSelect, isSelected }: CharityCardProps) {
  return (
    <article
      className="glass-card overflow-hidden"
      aria-selected={isSelected}
      style={isSelected ? {
        borderColor: 'var(--border-bright)',
        boxShadow: '0 0 0 1px rgba(74,255,107,0.15), 0 8px 32px rgba(0,0,0,0.4)',
      } : undefined}
    >
      {/* Cover image */}
      <div
        className="relative h-40 overflow-hidden"
        style={{
          background: charity.banner_url
            ? undefined
            : 'linear-gradient(135deg, #0d2010, #0a1a0c)',
        }}
      >
        {charity.banner_url && (
          <Image
            src={charity.banner_url}
            alt={`${charity.name} cover`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
        {/* Gradient fade to card */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, var(--bg-card) 100%)' }}
        />

        {/* Featured badge */}
        {charity.is_featured && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] tracking-[0.1em] uppercase"
            style={{
              fontFamily: 'var(--font-syne)',
              fontWeight: 600,
              background: 'var(--gold-muted)',
              border: '1px solid rgba(245,166,35,0.3)',
              color: 'var(--gold)',
              backdropFilter: 'blur(8px)',
            }}
          >
            Spotlight
          </span>
        )}

        {/* Logo floated on bottom-left */}
        {charity.logo_url && (
          <div
            className="absolute -bottom-5 left-5 w-11 h-11 rounded-xl overflow-hidden border border-[var(--border-mid)]"
            style={{ background: 'var(--bg-deep)' }}
          >
            <Image
              src={charity.logo_url}
              alt={`${charity.name} logo`}
              fill
              className="object-contain p-1.5"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-5 ${charity.logo_url ? 'pt-8' : 'pt-5'} flex flex-col gap-4`}>
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-syne)',
              fontWeight: 700,
              fontSize: '15px',
              color: 'var(--cream)',
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
            }}
          >
            {charity.name}
          </h3>
          {charity.tagline && (
            <p
              className="mt-1 line-clamp-1"
              style={{ fontSize: '12px', color: 'var(--muted)' }}
            >
              {charity.tagline}
            </p>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4">
          <div>
            <p
              style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '15px', color: 'var(--green)' }}
            >
              {formatCurrency(charity.total_raised)}
            </p>
            <p style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-syne)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Raised
            </p>
          </div>
          <div
            className="w-px h-8"
            style={{ background: 'var(--border)' }}
          />
          <div>
            <p
              style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '15px', color: 'var(--cream)' }}
            >
              {charity.supporter_count ?? 0}
            </p>
            <p style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-syne)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Supporters
            </p>
          </div>
        </div>

        {/* Action */}
        {onSelect ? (
          <button
            onClick={() => onSelect(charity)}
            className="btn w-full"
            style={{
              fontFamily: 'var(--font-syne)',
              fontWeight: 600,
              padding: '10px 20px',
              fontSize: '13px',
              borderRadius: 'var(--radius-pill)',
              background: isSelected ? 'var(--green)' : 'transparent',
              color: isSelected ? '#020a03' : 'var(--green)',
              border: `1px solid ${isSelected ? 'var(--green)' : 'rgba(74,255,107,0.3)'}`,
              transition: 'all 0.2s var(--ease-out-expo)',
            }}
          >
            {isSelected ? '✓ Selected' : 'Select Charity'}
          </button>
        ) : (
          <Link
            href={`/charities/${charity.slug}`}
            className="btn btn-outline btn-sm text-center w-full"
          >
            View Profile →
          </Link>
        )}
      </div>
    </article>
  );
}
