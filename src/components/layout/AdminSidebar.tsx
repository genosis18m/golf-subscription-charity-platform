'use client';

/**
 * Admin Sidebar — dark design using CSS variables.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_NAV_LINKS } from '@/constants';
import { getInitials } from '@/lib/utils';
import type { Profile } from '@/types';

interface AdminSidebarProps {
  profile: Profile | null;
}

export function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      background: 'var(--bg-deep)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }} className="hidden lg:flex">
      {/* Logo + Admin badge */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', textDecoration: 'none' }}>
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(245,166,35,0.15)', fontSize: '16px',
            border: '1px solid rgba(245,166,35,0.3)',
          }}>⛳</span>
          <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '13px', color: 'var(--cream)' }}>
            Golf Charity Club
          </span>
        </Link>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '3px 10px', borderRadius: '99px',
          fontSize: '10px', fontFamily: 'var(--font-syne)', fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          background: 'rgba(245,166,35,0.1)',
          color: 'var(--gold)',
          border: '1px solid rgba(245,166,35,0.25)',
        }}>
          Admin Panel
        </span>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px' }} aria-label="Admin navigation">
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }} role="list">
          {ADMIN_NAV_LINKS.map(({ label, href }) => {
            const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 12px', borderRadius: '8px',
                    fontSize: '13px', fontFamily: 'var(--font-syne)', fontWeight: 600,
                    textDecoration: 'none', transition: 'all 0.15s',
                    background: isActive ? 'rgba(245,166,35,0.12)' : 'transparent',
                    color: isActive ? 'var(--gold)' : 'var(--muted)',
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span style={{ fontSize: '14px' }}>›</span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <Link
            href="/dashboard"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', borderRadius: '8px', fontSize: '12px', color: 'var(--muted)', textDecoration: 'none', fontFamily: 'var(--font-syne)', fontWeight: 500 }}
          >
            ← Member Dashboard
          </Link>
        </div>
      </nav>

      {/* Admin profile footer */}
      {profile && (
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(245,166,35,0.2)', color: 'var(--gold)',
              fontSize: '12px', fontWeight: 700, flexShrink: 0,
            }}>
              {getInitials(profile.full_name)}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cream)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile.full_name}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--gold)' }}>Administrator</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
