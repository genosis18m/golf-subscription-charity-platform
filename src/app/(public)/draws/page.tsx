/**
 * Public Draw Results page (/draws) — dark editorial theme.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { NumberBallRow } from '@/components/draw/NumberBall';
import { formatCurrency } from '@/lib/utils';
import type { Draw, DrawResult } from '@/types';

export const metadata: Metadata = {
  title: 'Draw Results',
  description: 'View published Golf Charity Club monthly draw results and winning numbers.',
};

export const revalidate = 300;

interface DrawWithResult extends Draw {
  draw_results: DrawResult[];
}

// Demo draws shown when no Supabase data
const DEMO_DRAW_RESULTS: DrawWithResult[] = [
  {
    id: 'd1',
    title: 'March 2026 Draw',
    draw_month: '2026-03',
    logic_type: 'algorithmic',
    status: 'published',
    prize_pool_snapshot: { id: 'p1', draw_id: 'd1', total_amount: 1800000, tiers: [], jackpot_rolled_over: 0, computed_at: '2026-03-28T18:00:00Z' },
    simulated_at: '2026-03-28T14:00:00Z',
    published_at: '2026-03-28T18:00:00Z',
    created_by: 'admin',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-28T18:00:00Z',
    draw_results: [{
      id: 'r1', draw_id: 'd1',
      winning_numbers: [7, 14, 23, 31, 42],
      five_match_winners: [],
      four_match_winners: ['u2'],
      three_match_winners: ['u4', 'u7', 'u12'],
      total_entries: 2412,
      created_at: '2026-03-28T18:00:00Z',
    }],
  },
  {
    id: 'd2',
    title: 'February 2026 Draw',
    draw_month: '2026-02',
    logic_type: 'algorithmic',
    status: 'published',
    prize_pool_snapshot: { id: 'p2', draw_id: 'd2', total_amount: 1650000, tiers: [], jackpot_rolled_over: 0, computed_at: '2026-02-28T18:00:00Z' },
    simulated_at: '2026-02-28T14:00:00Z',
    published_at: '2026-02-28T18:00:00Z',
    created_by: 'admin',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-28T18:00:00Z',
    draw_results: [{
      id: 'r2', draw_id: 'd2',
      winning_numbers: [3, 19, 27, 33, 44],
      five_match_winners: ['demo-user-001'],
      four_match_winners: [],
      three_match_winners: ['u3', 'u9'],
      total_entries: 2378,
      created_at: '2026-02-28T18:00:00Z',
    }],
  },
];

async function getPublishedDraws(): Promise<DrawWithResult[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('draws')
      .select('*, draw_results(*)')
      .eq('status', 'published')
      .order('draw_month', { ascending: false })
      .limit(12);
    if (data && data.length > 0) return data as DrawWithResult[];
  } catch { /* fall through */ }
  return DEMO_DRAW_RESULTS;
}

export default async function DrawsPage() {
  const draws = await getPublishedDraws();
  const [latest, ...previous] = draws;

  return (
    <div style={{ background: 'var(--bg-void)', color: 'var(--cream)' }}>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        className="py-24 relative overflow-hidden grain-overlay"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(30,15,5,0.5) 0%, var(--bg-void) 65%)' }}
      >
        <div className="relative z-10 mx-auto max-w-3xl px-5 text-center">
          <p className="text-[11px] uppercase tracking-[0.12em] mb-5"
            style={{ color: 'var(--gold)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
            Monthly Results
          </p>
          <h1 className="display-heading mb-5" style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}>
            Draw Results
          </h1>
          <p style={{ color: 'var(--cream-dim)', fontSize: '16px', lineHeight: 1.7 }}>
            Every published draw is shown here in full — winning numbers,
            winner counts, and prize distributions.
          </p>
        </div>
      </section>

      <div className="section-divider" />

      <section className="py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

          {draws.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <p style={{ fontSize: '3rem', marginBottom: '16px' }}>🎱</p>
              <p style={{ color: 'var(--cream)', fontWeight: 500, marginBottom: '8px', fontFamily: 'var(--font-syne)', fontSize: '1.1rem' }}>No draws published yet</p>
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Results will appear here after each monthly draw.</p>
            </div>
          ) : (
            <>
              {/* Latest draw — featured */}
              {latest && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'glow-pulse 2s ease-in-out infinite' }} />
                    <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '11px', color: 'var(--green)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Latest Draw
                    </span>
                  </div>
                  <DrawDetailCard draw={latest} featured />
                </div>
              )}

              {/* Previous draws grid */}
              {previous.length > 0 && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '13px', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '16px' }}>
                    Previous Draws
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                    {previous.map((draw) => (
                      <DrawDetailCard key={draw.id} draw={draw} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

    </div>
  );
}

// ── Draw Card component ──────────────────────────────────────────────────────

function DrawDetailCard({ draw, featured }: { draw: DrawWithResult; featured?: boolean }) {
  const result = draw.draw_results?.[0];
  const total = draw.prize_pool_snapshot?.total_amount ?? 0;
  const jackpotWinners = result?.five_match_winners?.length ?? 0;
  const fourWinners = result?.four_match_winners?.length ?? 0;
  const threeWinners = result?.three_match_winners?.length ?? 0;
  const hasResult = !!result;

  return (
    <div style={{
      background: featured ? 'rgba(245,166,35,0.04)' : 'var(--bg-card)',
      border: `1px solid ${featured ? 'rgba(245,166,35,0.18)' : 'var(--border)'}`,
      borderRadius: '16px',
      padding: featured ? '28px 32px' : '22px 24px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: featured ? '1.2rem' : '1rem', color: 'var(--cream)', marginBottom: '4px' }}>
            {draw.title}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
            {new Date(draw.draw_month + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            {draw.published_at && ` · Drawn ${new Date(draw.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            padding: '3px 10px',
            borderRadius: '99px',
            fontSize: '10px',
            fontFamily: 'var(--font-syne)',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            background: draw.status === 'published' ? 'rgba(74,255,107,0.1)' : 'rgba(255,255,255,0.05)',
            color: draw.status === 'published' ? 'var(--green)' : 'var(--muted)',
            border: `1px solid ${draw.status === 'published' ? 'rgba(74,255,107,0.2)' : 'var(--border)'}`,
          }}>
            {draw.status}
          </span>
        </div>
      </div>

      {/* Prize pool */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-syne)', fontWeight: 600, marginBottom: '4px' }}>
          Prize Pool
        </p>
        <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: featured ? '2rem' : '1.4rem', color: 'var(--gold)', letterSpacing: '-0.03em' }}>
          {formatCurrency(total)}
        </p>
      </div>

      {/* Winning numbers */}
      {hasResult && result.winning_numbers.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-syne)', fontWeight: 600, marginBottom: '10px' }}>
            Winning Numbers
          </p>
          <NumberBallRow numbers={result.winning_numbers} size={featured ? 'md' : 'sm'} />
        </div>
      )}

      {/* Winners */}
      {hasResult && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          {[
            { label: 'Jackpot (5)', count: jackpotWinners, accent: 'gold' },
            { label: '4-Match', count: fourWinners, accent: 'green' },
            { label: '3-Match', count: threeWinners, accent: 'neutral' },
          ].map(({ label, count, accent }) => (
            <div key={label}>
              <p style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-syne)', fontWeight: 600, marginBottom: '2px' }}>
                {label}
              </p>
              <p style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 800,
                fontSize: '1.3rem',
                color: accent === 'gold' ? 'var(--gold)' : accent === 'green' ? 'var(--green)' : 'var(--cream-dim)',
                letterSpacing: '-0.02em',
              }}>
                {count === 0 ? '—' : count}
              </p>
            </div>
          ))}
          <div>
            <p style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-syne)', fontWeight: 600, marginBottom: '2px' }}>
              Entries
            </p>
            <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--cream-dim)', letterSpacing: '-0.02em' }}>
              {result.total_entries.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
