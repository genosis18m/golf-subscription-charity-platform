'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PUBLIC_NAV_LINKS } from '@/constants';

interface NavbarProps {
  isAuthenticated?: boolean;
}

export function Navbar({ isAuthenticated = false }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[var(--bg-void)]/90 backdrop-blur-xl border-b border-[var(--border)]'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto max-w-7xl px-5 sm:px-8" aria-label="Main navigation">
        <div className="flex h-[70px] items-center justify-between gap-8">

          {/* ── Logo ──────────────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            {/* Logo mark — number ball with "G" */}
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-bright)] text-[var(--green)] text-sm"
              style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 800,
                background: 'radial-gradient(circle at 35% 30%, rgba(74,255,107,0.15), transparent 60%), var(--bg-card)',
                boxShadow: '0 0 16px rgba(74,255,107,0.12)',
              }}
              aria-hidden="true"
            >
              G
            </span>
            <span
              className="text-[var(--cream)] text-[15px] tracking-[-0.02em] group-hover:text-[var(--green)] transition-colors"
              style={{ fontFamily: 'var(--font-syne)', fontWeight: 700 }}
            >
              Golf Charity Club
            </span>
          </Link>

          {/* ── Desktop Nav ───────────────────────────────────────────────── */}
          <ul className="hidden md:flex items-center gap-1" role="list">
            {PUBLIC_NAV_LINKS.map(({ label, href }) => {
              const active = pathname === href || (href.length > 1 && pathname.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'px-4 py-2 rounded-full text-[13px] transition-all duration-200',
                      active
                        ? 'text-[var(--green)] bg-[var(--green-muted)]'
                        : 'text-[var(--cream-dim)] hover:text-[var(--cream)] hover:bg-[var(--border)]'
                    )}
                    style={{ fontFamily: 'var(--font-syne)', fontWeight: 500, letterSpacing: '-0.01em' }}
                    aria-current={active ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* ── CTA ───────────────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn btn-primary btn-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[13px] text-[var(--cream-dim)] hover:text-[var(--cream)] transition-colors"
                  style={{ fontFamily: 'var(--font-syne)', fontWeight: 500 }}
                >
                  Sign in
                </Link>
                <Link href="/signup" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ──────────────────────────────────────────── */}
          <button
            className="md:hidden flex flex-col gap-[5px] p-2 group"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            <span
              className={cn(
                'block h-[1.5px] w-5 bg-[var(--cream-dim)] transition-all duration-300 origin-center',
                open && 'rotate-45 translate-y-[6.5px]'
              )}
            />
            <span
              className={cn(
                'block h-[1.5px] w-5 bg-[var(--cream-dim)] transition-all duration-300',
                open && 'opacity-0 scale-x-0'
              )}
            />
            <span
              className={cn(
                'block h-[1.5px] w-5 bg-[var(--cream-dim)] transition-all duration-300 origin-center',
                open && '-rotate-45 -translate-y-[6.5px]'
              )}
            />
          </button>
        </div>

        {/* ── Mobile Menu ─────────────────────────────────────────────────── */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-[var(--ease-out-expo)]',
            open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="pb-5 pt-2 border-t border-[var(--border)] space-y-1">
            {PUBLIC_NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="block px-4 py-2.5 rounded-xl text-sm text-[var(--cream-dim)] hover:text-[var(--cream)] hover:bg-[var(--bg-card)] transition-colors"
                style={{ fontFamily: 'var(--font-syne)', fontWeight: 500 }}
              >
                {label}
              </Link>
            ))}
            <div className="pt-3 flex gap-2">
              <Link
                href="/login"
                className="flex-1 btn btn-outline btn-sm text-center"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="flex-1 btn btn-primary btn-sm text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
