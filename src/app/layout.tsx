/**
 * Root Layout.
 * Sets global providers and the Sonner toast container.
 */

import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: 'Golf Charity Club — Play, Win & Give Back',
    template: '%s | Golf Charity Club',
  },
  description:
    'Subscribe to monthly golf draws, support your favourite charity, and win real prizes based on your Stableford scores. Golf with purpose.',
  keywords: ['golf', 'charity', 'subscription', 'draw', 'prize', 'stableford', 'monthly'],
  openGraph: {
    title: 'Golf Charity Club',
    description: 'Play golf. Win prizes. Support charity.',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Golf Charity Club',
    description: 'Play golf. Win prizes. Support charity.',
  },
};

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen" style={{ fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}>
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              border: '1px solid var(--border-mid)',
              color: 'var(--cream)',
              fontFamily: 'var(--font-dm-sans)',
            },
          }}
        />
      </body>
    </html>
  );
}
