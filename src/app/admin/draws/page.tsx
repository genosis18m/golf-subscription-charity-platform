/**
 * Admin: Draws List (/admin/draws) — dark design.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DrawCard } from '@/components/draw/DrawCard';
import type { Draw } from '@/types';

export const metadata: Metadata = { title: 'Draws — Admin' };

const DEMO_DRAWS: Draw[] = [
  {
    id: 'demo-d1', title: 'March 2026 Draw', draw_month: '2026-03',
    logic_type: 'algorithmic', status: 'published',
    prize_pool_snapshot: { id: 'p1', draw_id: 'demo-d1', total_amount: 1800000, tiers: [], jackpot_rolled_over: 0, computed_at: '2026-03-28T18:00:00Z' },
    simulated_at: '2026-03-28T14:00:00Z', published_at: '2026-03-28T18:00:00Z',
    created_by: 'admin', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-28T18:00:00Z',
  },
  {
    id: 'demo-d2', title: 'February 2026 Draw', draw_month: '2026-02',
    logic_type: 'algorithmic', status: 'published',
    prize_pool_snapshot: { id: 'p2', draw_id: 'demo-d2', total_amount: 1650000, tiers: [], jackpot_rolled_over: 0, computed_at: '2026-02-28T18:00:00Z' },
    simulated_at: '2026-02-28T14:00:00Z', published_at: '2026-02-28T18:00:00Z',
    created_by: 'admin', created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-28T18:00:00Z',
  },
  {
    id: 'demo-d3', title: 'April 2026 Draw', draw_month: '2026-04',
    logic_type: 'algorithmic', status: 'draft',
    prize_pool_snapshot: { id: '', draw_id: 'demo-d3', total_amount: 0, tiers: [], jackpot_rolled_over: 0, computed_at: '' },
    simulated_at: null, published_at: null,
    created_by: 'admin', created_at: '2026-04-01T00:00:00Z', updated_at: '2026-04-01T00:00:00Z',
  },
];

export default async function AdminDrawsPage() {
  let draws: Draw[] = DEMO_DRAWS;

  try {
    const supabase = await createClient();
    const { data } = await supabase.from('draws').select('*, prize_pool_snapshot').order('draw_month', { ascending: false }).limit(24);
    if (data && data.length > 0) draws = data as Draw[];
  } catch { /* use demo */ }

  const draftDraws = draws.filter((d) => d.status === 'draft' || d.status === 'simulated');
  const publishedDraws = draws.filter((d) => d.status === 'published' || d.status === 'archived');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--cream)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Draws
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Configure, simulate, and publish monthly draws.</p>
        </div>
        <Link
          href="/admin/draws/new"
          style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--green)', color: '#07090A', fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}
        >
          + New Draw
        </Link>
      </div>

      {/* Draft / in-progress draws */}
      {draftDraws.length > 0 && (
        <section>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
            In Progress
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {draftDraws.map((draw) => (
              <DrawCard key={draw.id} draw={draw} href={`/admin/draws/${draw.id}`} />
            ))}
          </div>
        </section>
      )}

      {/* Published / archived */}
      {publishedDraws.length > 0 && (
        <section>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
            Published Draws
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {publishedDraws.map((draw) => (
              <DrawCard key={draw.id} draw={draw} href={`/admin/draws/${draw.id}`} />
            ))}
          </div>
        </section>
      )}

      {draws.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎱</p>
          <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, color: 'var(--cream)', marginBottom: '6px' }}>No draws yet</p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>Create your first draw to get started.</p>
          <Link
            href="/admin/draws/new"
            style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--green)', color: '#07090A', fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}
          >
            Create First Draw
          </Link>
        </div>
      )}
    </div>
  );
}
