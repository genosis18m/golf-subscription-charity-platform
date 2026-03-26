/**
 * Auth Layout — dark split-screen with branding panel + form.
 */

import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-2" style={{ background: 'var(--bg-void)' }}>

      {/* ── Left: Branding panel ──────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 120% 80% at 20% 50%, rgba(18,45,20,0.8) 0%, var(--bg-void) 70%)' }}
      >
        {/* Floating number balls */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {[
            { n: 7,  top: '15%', left: '70%', size: '80px', opacity: '0.25', anim: 'float-a' },
            { n: 23, top: '50%', left: '80%', size: '55px', opacity: '0.15', anim: 'float-b' },
            { n: 14, top: '75%', left: '65%', size: '45px', opacity: '0.12', anim: 'float-c' },
            { n: 31, top: '30%', left: '55%', size: '35px', opacity: '0.10', anim: 'float-a' },
          ].map(({ n, top, left, size, opacity, anim }) => (
            <div
              key={n}
              className="absolute number-ball"
              style={{
                top, left, width: size, height: size,
                fontSize: `calc(${size} * 0.32)`, opacity,
                animation: `${anim} ${anim === 'float-a' ? '7s' : anim === 'float-b' ? '9s' : '5.5s'} ease-in-out infinite`,
                background: 'radial-gradient(circle at 35% 30%, rgba(74,255,107,0.12), transparent 60%), rgba(17,27,18,0.6)',
                borderColor: 'rgba(74,255,107,0.15)',
                color: 'rgba(74,255,107,0.6)',
              }}
            >
              {n}
            </div>
          ))}
        </div>

        <Link href="/" className="flex items-center gap-3 relative z-10">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-bright)] text-[var(--green)] text-sm"
            style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, background: 'radial-gradient(circle at 35% 30%, rgba(74,255,107,0.15), transparent 60%), var(--bg-card)' }}
          >
            G
          </span>
          <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '15px', color: 'var(--cream)', letterSpacing: '-0.02em' }}>
            GOLF-Fego
          </span>
        </Link>

        <blockquote className="relative z-10 space-y-5">
          <p
            className="leading-snug"
            style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.75rem', fontWeight: 300, color: 'var(--cream)' }}
          >
            &ldquo;Every round I play now means something more than just the score.&rdquo;
          </p>
          <footer className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm border border-[var(--border-bright)]"
              style={{ background: 'var(--green-muted)', color: 'var(--green)', fontFamily: 'var(--font-syne)', fontWeight: 700 }}
            >
              RB
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: '14px', color: 'var(--cream)' }}>Richard B.</p>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Member since 2023</p>
            </div>
          </footer>
        </blockquote>

        <p style={{ fontSize: '12px', color: 'var(--muted)', position: 'relative', zIndex: 10 }}>
          &copy; {new Date().getFullYear()} GOLF-Fego Ltd.
        </p>
      </div>

      {/* ── Right: Auth form ──────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-center px-5 pt-10 pb-24 overflow-y-auto"
        style={{ background: 'var(--bg-deep)' }}
      >
        <div className="w-full max-w-[29rem]">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-3 mb-10 lg:hidden">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-bright)] text-[var(--green)] text-sm"
              style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, background: 'var(--bg-card)' }}
            >
              G
            </span>
            <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', color: 'var(--cream)' }}>
              GOLF-Fego
            </span>
          </Link>

          {children}
        </div>
      </div>
    </div>
  );
}
