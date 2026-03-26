/**
 * Dashboard: My Draws — works with demo + Supabase sessions.
 */

import type { Metadata } from 'next';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { getServerDemoSession, DEMO_USERS } from '@/lib/demo-auth-server';
import { NumberBallRow } from '@/components/draw/NumberBall';
import { DrawStatusBadge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = { title: 'My Draws' };

// Demo draw history
const DEMO_DRAWS = [
  {
    id: 'd1',
    title: 'March 2026 Draw',
    draw_month: '2026-03',
    status: 'published',
    entry_numbers: [7, 14, 23, 31, 42],
    winning_numbers: [7, 12, 23, 35, 42],
    matchCount: 3,
    prize: 0,
  },
  {
    id: 'd2',
    title: 'February 2026 Draw',
    draw_month: '2026-02',
    status: 'published',
    entry_numbers: [3, 19, 27, 33, 44],
    winning_numbers: [3, 19, 27, 33, 44],
    matchCount: 5,
    prize: 24500,
  },
  {
    id: 'd3',
    title: 'January 2026 Draw',
    draw_month: '2026-01',
    status: 'published',
    entry_numbers: [11, 18, 24, 36, 40],
    winning_numbers: [5, 18, 22, 36, 41],
    matchCount: 2,
    prize: 0,
  },
  {
    id: 'd4',
    title: 'December 2025 Draw',
    draw_month: '2025-12',
    status: 'published',
    entry_numbers: [2, 15, 28, 37, 43],
    winning_numbers: [2, 9, 28, 34, 43],
    matchCount: 3,
    prize: 0,
  },
];

export default async function MyDrawsPage() {
  // ── Demo session ────────────────────────────────────────────────────────
  const demoSession = await getServerDemoSession();

  if (demoSession) {
    return <DrawsContent draws={DEMO_DRAWS} isDemo />;
  }

  // ── Supabase session ────────────────────────────────────────────────────
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('draw_entries')
    .select('id, draw_id, entry_numbers, is_eligible, draw:draws(id, title, status, draw_month, draw_results(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(24);

  const entries = (data ?? []) as unknown as Array<{
    id: string;
    draw_id: string;
    entry_numbers: number[];
    is_eligible: boolean;
    draw: { id: string; title: string; status: string; draw_month: string; draw_results: Array<{ winning_numbers: number[] }> };
  }>;

  const draws = entries.map((e) => {
    const wn = e.draw?.draw_results?.[0]?.winning_numbers ?? [];
    const matchCount = wn.length > 0 ? e.entry_numbers.filter((n) => wn.includes(n)).length : null;
    return {
      id: e.id,
      title: e.draw?.title ?? '',
      draw_month: e.draw?.draw_month ?? '',
      status: e.draw?.status ?? '',
      entry_numbers: e.entry_numbers,
      winning_numbers: wn,
      matchCount,
      prize: 0,
    };
  });

  return <DrawsContent draws={draws} />;
}

// ── Presentation ─────────────────────────────────────────────────────────────

interface DrawData {
  id: string;
  title: string;
  draw_month: string;
  status: string;
  entry_numbers: number[];
  winning_numbers: number[];
  matchCount: number | null;
  prize: number;
}

function DrawsContent({ draws, isDemo }: { draws: DrawData[]; isDemo?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.75rem', color: 'var(--cream)', letterSpacing: '-0.03em', marginBottom: '4px' }}>
            My Draws
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Your draw participation history and match results.</p>
        </div>
        {isDemo && (
          <span style={{
            marginLeft: 'auto',
            background: 'rgba(74,255,107,0.08)',
            border: '1px solid rgba(74,255,107,0.2)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11px',
            fontFamily: 'var(--font-syne)',
            fontWeight: 700,
            color: 'var(--green)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
          }}>
            Demo Data
          </span>
        )}
      </div>

      {draws.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
        }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎱</p>
          <p style={{ color: 'var(--cream)', fontWeight: 500, marginBottom: '6px' }}>No draw entries yet</p>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Submit a score this month to qualify for the next draw.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {draws.map((draw) => (
            <div
              key={draw.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '22px 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', color: 'var(--cream)' }}>{draw.title}</p>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                    {draw.draw_month && new Date(draw.draw_month + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {draw.status && <DrawStatusBadge status={draw.status} />}
                  {draw.prize > 0 && (
                    <span style={{
                      background: 'rgba(245,166,35,0.1)',
                      border: '1px solid rgba(245,166,35,0.2)',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '12px',
                      fontFamily: 'var(--font-syne)',
                      fontWeight: 700,
                      color: 'var(--gold)',
                    }}>
                      {formatCurrency(draw.prize)} won
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', fontFamily: 'var(--font-syne)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Your Numbers
                  </p>
                  <NumberBallRow numbers={draw.entry_numbers} winningNumbers={draw.winning_numbers} size="sm" />
                </div>

                {draw.winning_numbers.length > 0 && (
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', fontFamily: 'var(--font-syne)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      Winning Numbers
                    </p>
                    <NumberBallRow numbers={draw.winning_numbers} winningNumbers={draw.winning_numbers} size="sm" />
                  </div>
                )}
              </div>

              {draw.matchCount !== null && (
                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                  {draw.matchCount >= 3 ? (
                    <span style={{ fontSize: '13px', fontFamily: 'var(--font-syne)', fontWeight: 700, color: 'var(--green)' }}>
                      🏆 {draw.matchCount}-match — {draw.matchCount === 5 ? 'Jackpot!' : draw.matchCount === 4 ? '4th place win!' : 'Prize won!'}
                    </span>
                  ) : (
                    <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                      {draw.matchCount} match{draw.matchCount !== 1 ? 'es' : ''} — no prize this month
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
