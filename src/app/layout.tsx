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
    default: 'GOLF-Fego — Play, Win & Give Back',
    template: '%s | GOLF-Fego',
  },
  description:
    'Subscribe to monthly golf draws, support your favourite charity, and win real prizes based on your Stableford scores. Golf with purpose.',
  keywords: ['golf', 'charity', 'subscription', 'draw', 'prize', 'stableford', 'monthly'],
  openGraph: {
    title: 'GOLF-Fego',
    description: 'Play golf. Win prizes. Support charity.',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GOLF-Fego',
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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL,GRAD@400,1,0&icon_names=home,redeem,leaderboard,person,photo_camera,add_a_photo,military_tech,volunteer_activism,golf_course,emoji_events,notifications,lock,credit_card,chevron_right,settings,logout,radio_button_unchecked&display=block" rel="stylesheet" />
      </head>
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
