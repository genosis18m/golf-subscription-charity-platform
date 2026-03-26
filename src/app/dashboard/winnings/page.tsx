/**
 * Dashboard: Winnings — works with demo + Supabase sessions.
 */

import type { Metadata } from 'next';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { getServerDemoSession, DEMO_USERS } from '@/lib/demo-auth-server';
import { DarkStatCard } from '@/components/dashboard/DarkStatCard';
import { formatCurrency } from '@/lib/utils';
import type { Winner } from '@/types';

export const metadata: Metadata = { title: 'My Winnings' };

// Demo winnings history
const DEMO_WINNINGS = [
  {
    id: 'w1',
    draw_month: '2026-02',
    draw_title: 'February 2026 Draw',
    match_tier: 'five_match' as const,
    prize_amount: 24500,
    status: 'paid',
    matched_numbers: [3, 19, 27, 33, 44],
    paid_at: '2026-02-28T18:30:00Z',
  },
];

export default async function WinningsPage() {
  // ── Demo session ────────────────────────────────────────────────────────
  const demoSession = await getServerDemoSession();

  if (demoSession) {
    return (
      <WinningsContent
        totalPaidPence={DEMO_USERS.user.total_winnings}
        totalWinsCount={1}
        pendingCount={0}
        winnings={DEMO_WINNINGS}
        isDemo
      />
    );
  }

  // ── Supabase session ────────────────────────────────────────────────────
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('winners')
    .select('*, draw:draws(id, title, draw_month, status)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const winners = (data ?? []) as Winner[];
  const paid = winners.filter((w) => w.status === 'paid');
  const pending = winners.filter((w) => w.status === 'pending' || w.status === 'verified');

  return (
    <WinningsContent
      totalPaidPence={paid.reduce((s, w) => s + w.prize_amount, 0)}
      totalWinsCount={paid.length}
      pendingCount={pending.length}
      winnings={paid.map((w) => ({
        id: w.id,
        draw_title: (w as Winner & { draw?: { title: string } }).draw?.title ?? 'Draw',
        draw_month: '',
        match_tier: w.match_tier,
        prize_amount: w.prize_amount,
        status: w.status,
        matched_numbers: w.matched_numbers,
        paid_at: w.paid_at,
      }))}
    />
  );
}

// ── Presentation ─────────────────────────────────────────────────────────────

const TIER_LABELS: Record<string, string> = {
  five_match: 'Jackpot — 5 matches',
  four_match: '4-match win',
  three_match: '3-match prize',
};

interface WinningsContentProps {
  totalPaidPence: number;
  totalWinsCount: number;
  pendingCount: number;
  winnings: Array<{
    id: string;
    draw_title: string;
    draw_month: string;
    match_tier: string;
    prize_amount: number;
    status: string;
    matched_numbers: number[];
    paid_at: string | null;
  }>;
  isDemo?: boolean;
}

function WinningsContent({ totalPaidPence, totalWinsCount, pendingCount, winnings, isDemo }: WinningsContentProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px' }}>

      <div>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.75rem', color: 'var(--cream)', letterSpacing: '-0.03em', marginBottom: '4px' }}>
          My Winnings
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Your complete prize history across all draws.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
        <DarkStatCard title="Total Won" value={formatCurrency(totalPaidPence)} accent="gold" icon="🏆" />
        <DarkStatCard title="Total Wins" value={String(totalWinsCount)} subtitle="paid prizes" accent="green" icon="✓" />
        <DarkStatCard title="Pending" value={String(pendingCount)} subtitle="awaiting verification" accent="neutral" icon="⏳" />
      </div>

      {/* Winnings list */}
      {winnings.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
        }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎱</p>
          <p style={{ color: 'var(--cream)', fontWeight: 500, marginBottom: '6px' }}>No wins yet</p>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Keep submitting scores — your first win could be next month!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {winnings.map((w) => (
            <div
              key={w.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(245,166,35,0.2)',
                borderRadius: '16px',
                padding: '22px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', color: 'var(--cream)', marginBottom: '4px' }}>
                  {w.draw_title}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  {TIER_LABELS[w.match_tier] ?? w.match_tier}
                  {w.paid_at && ` · Paid ${new Date(w.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                </p>
                <div style={{ display: 'flex', gap: '5px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {w.matched_numbers.map((n) => (
                    <span
                      key={n}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'rgba(245,166,35,0.12)',
                        border: '1px solid rgba(245,166,35,0.3)',
                        color: 'var(--gold)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontFamily: 'var(--font-syne)',
                        fontWeight: 700,
                      }}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontFamily: 'var(--font-syne)',
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  color: 'var(--gold)',
                  letterSpacing: '-0.03em',
                }}>
                  {formatCurrency(w.prize_amount)}
                </p>
                <p style={{
                  fontSize: '11px',
                  color: w.status === 'paid' ? 'var(--green)' : 'var(--muted)',
                  fontFamily: 'var(--font-syne)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginTop: '4px',
                }}>
                  {w.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
