'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Banknote,
  Circle,
  CreditCard,
  Gift,
  Heart,
  House,
  LogOut,
  Settings,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { DASHBOARD_NAV_LINKS } from '@/constants';
import { createClient } from '@/lib/supabase/client';
import { getInitials } from '@/lib/utils';
import type { Profile } from '@/types';

interface SidebarProps {
  profile: Profile | null;
}

const NAV_ICONS: Record<string, LucideIcon> = {
  home: House,
  clipboard: Target,
  trophy: Gift,
  heart: Heart,
  banknotes: Banknote,
  'credit-card': CreditCard,
  cog: Settings,
};

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();

  async function handleSignOut() {
    const supabase = createClient();

    await Promise.allSettled([
      supabase.auth.signOut(),
      fetch('/api/auth/demo', { method: 'DELETE' }),
    ]);

    // Hard redirect so the server re-reads the cleared demo cookie immediately.
    // Soft router.push won't force the middleware to pick up the cleared cookie.
    window.location.href = '/';
  }

  return (
    <>
      <aside
        className="hidden shrink-0 lg:flex lg:flex-col"
        style={{
          width: '240px',
          minHeight: '100dvh',
          background: 'var(--bg-deep)',
          borderRight: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          height: '100dvh',
          overflow: 'hidden auto',
        }}
      >
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--border)' }}>
          <Link
            href="/dashboard"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
          >
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid rgba(74,255,107,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                background: 'rgba(74,255,107,0.08)',
                color: 'var(--green)',
                fontFamily: 'var(--font-syne)',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              G
            </span>
            <span
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 700,
                fontSize: '13px',
                color: 'var(--cream)',
                letterSpacing: '-0.02em',
              }}
            >
              GOLF-Fego
            </span>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: '12px 10px' }} aria-label="Dashboard navigation">
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {DASHBOARD_NAV_LINKS.map(({ label, href, icon }) => {
              const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
              const Icon = NAV_ICONS[icon] ?? Circle;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '11px 12px',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontFamily: 'var(--font-syne)',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'var(--cream)' : 'var(--muted)',
                      background: isActive ? 'rgba(74,255,107,0.1)' : 'transparent',
                      border: isActive ? '1px solid rgba(74,255,107,0.12)' : '1px solid transparent',
                      transition: 'all 0.12s',
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '18px',
                        height: '18px',
                        flexShrink: 0,
                        opacity: isActive ? 1 : 0.72,
                      }}
                      aria-hidden="true"
                    >
                      <Icon size={16} strokeWidth={isActive ? 2.4 : 2.1} />
                    </span>
                    <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {label}
                    </span>
                    {isActive && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: 'var(--green)',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div style={{ padding: '12px 10px 16px', borderTop: '1px solid var(--border)' }}>
          {profile && (
            <Link
              href="/dashboard/profile"
              className="group flex cursor-pointer items-center gap-[10px] rounded-[8px] p-[10px_12px] no-underline transition-colors duration-200 hover:bg-[rgba(255,255,255,0.06)]"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(74,255,107,0.12)',
                  border: '1px solid rgba(74,255,107,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--green)',
                  fontFamily: 'var(--font-syne)',
                  fontWeight: 700,
                  fontSize: '11px',
                  flexShrink: 0,
                }}
              >
                {getInitials(profile.full_name)}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p
                  style={{
                    fontFamily: 'var(--font-syne)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--cream)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {profile.full_name}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '1px' }}>Member Profile</p>
              </div>
            </Link>
          )}

          <button
            onClick={handleSignOut}
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
              fontFamily: 'var(--font-syne)',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              transition: 'all 0.12s',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Sign out</span>
            <LogOut size={16} strokeWidth={2.1} aria-hidden="true" />
          </button>
        </div>
      </aside>

      <nav
        className="flex lg:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          background: 'var(--bg-deep)',
          borderTop: '1px solid var(--border)',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '8px 4px',
          backdropFilter: 'blur(12px)',
        }}
        aria-label="Mobile navigation"
      >
        {DASHBOARD_NAV_LINKS.slice(0, 4).map(({ label, href, icon }) => {
          const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
          const Icon = NAV_ICONS[icon] ?? Circle;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                padding: '6px 10px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '10px',
                fontFamily: 'var(--font-syne)',
                fontWeight: 600,
                color: isActive ? 'var(--green)' : 'var(--muted)',
                minWidth: 0,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
                <Icon size={18} strokeWidth={isActive ? 2.4 : 2.1} />
              </span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {label.split(' ')[0]}
              </span>
            </Link>
          );
        })}

        <Link
          href="/dashboard/profile"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            textDecoration: 'none',
            background: pathname === '/dashboard/profile' ? 'var(--green)' : 'rgba(74,255,107,0.12)',
            color: pathname === '/dashboard/profile' ? '#000' : 'var(--green)',
            border: pathname === '/dashboard/profile' ? 'none' : '1px solid rgba(74,255,107,0.2)',
            transform: 'translateY(-4px)',
            boxShadow: pathname === '/dashboard/profile' ? 'var(--green-glow)' : 'none',
          }}
        >
          <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '13px' }}>
            {profile ? getInitials(profile.full_name) : 'P'}
          </span>
        </Link>
      </nav>
    </>
  );
}
