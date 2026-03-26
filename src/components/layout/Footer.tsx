/**
 * Footer — dark, editorial. Shows platform links, legal, and a minimal brand statement.
 */

import Link from 'next/link';

const footerLinks = {
  Platform: [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Monthly Draws', href: '/draws' },
    { label: 'Charities', href: '/charities' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'FAQ', href: '/faq' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Gambling Policy', href: '/gambling-policy' },
  ],
};

export function Footer() {
  return (
    <footer
      aria-label="Site footer"
      style={{
        background: 'var(--bg-deep)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-12">

          {/* Brand */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-bright)] text-[var(--green)] text-sm"
                style={{
                  fontFamily: 'var(--font-syne)',
                  fontWeight: 800,
                  background: 'radial-gradient(circle at 35% 30%, rgba(74,255,107,0.15), transparent 60%), var(--bg-card)',
                }}
              >
                G
              </span>
              <span
                className="text-[var(--cream)] text-[15px]"
                style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, letterSpacing: '-0.02em' }}
              >
                GOLF-Fego
              </span>
            </Link>
            <p
              className="text-sm leading-relaxed max-w-[240px]"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '15px' }}
            >
              Play golf. Win prizes.<br />Make a real difference.
            </p>
            {/* Draw number decorations */}
            <div className="flex gap-2 pt-1">
              {[7, 14, 23, 31, 45].map((n) => (
                <span
                  key={n}
                  className="number-ball number-ball--ghost flex h-8 w-8 text-xs"
                  aria-hidden="true"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3
                className="text-[11px] uppercase tracking-[0.12em] mb-5"
                style={{ color: 'var(--muted)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}
              >
                {group}
              </h3>
              <ul className="space-y-3" role="list">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm transition-colors hover:text-[var(--cream)]"
                      style={{ color: 'var(--cream-dim)', fontFamily: 'var(--font-dm-sans)' }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-[12px]" style={{ color: 'var(--muted)' }}>
            &copy; {new Date().getFullYear()} GOLF-Fego Ltd. All rights reserved.
          </p>
          <p className="text-[12px] text-center" style={{ color: 'var(--muted)' }}>
            Registered Charity No. XXXXXXXX &middot; Gambling Commission Licensed
          </p>
        </div>
      </div>
    </footer>
  );
}
