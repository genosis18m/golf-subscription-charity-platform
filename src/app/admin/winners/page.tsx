/**
 * Admin: Winners Queue (/admin/winners) — dark design.
 */

import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { DataTable, type ColumnDef } from '@/components/admin/DataTable';
import { VerificationBadge } from '@/components/winner/VerificationBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Winner } from '@/types';

export const metadata: Metadata = { title: 'Winners — Admin' };

type WinnerRow = Omit<Winner, 'profile' | 'draw'> & {
  profile?: { full_name: string; };
  draw?: { title: string; };
}

const DEMO_WINNERS: WinnerRow[] = [
  {
    id: 'w1', draw_id: 'demo-d2', user_id: 'demo-user-001',
    match_tier: 'five_match', prize_amount: 24500,
    matched_numbers: [3, 19, 27, 33, 44], status: 'paid',
    proof_url: null, verified_by: 'admin', verified_at: '2026-03-01T10:00:00Z',
    paid_at: '2026-03-02T10:00:00Z', rejection_reason: null,
    profile: { full_name: 'Alex Demo' },
    draw: { title: 'February 2026 Draw' },
    created_at: '2026-02-28T18:00:00Z', updated_at: '2026-03-02T10:00:00Z',
  },
  {
    id: 'w2', draw_id: 'demo-d2', user_id: 'demo-user-002',
    match_tier: 'four_match', prize_amount: 2500,
    matched_numbers: [3, 19, 27, 33], status: 'pending',
    proof_url: null, verified_by: null, verified_at: null,
    paid_at: null, rejection_reason: null,
    profile: { full_name: 'James Wilson' },
    draw: { title: 'February 2026 Draw' },
    created_at: '2026-02-28T18:00:00Z', updated_at: '2026-02-28T18:00:00Z',
  },
  {
    id: 'w3', draw_id: 'demo-d1', user_id: 'demo-user-003',
    match_tier: 'three_match', prize_amount: 500,
    matched_numbers: [7, 14, 23], status: 'verified',
    proof_url: null, verified_by: 'admin', verified_at: '2026-03-29T10:00:00Z',
    paid_at: null, rejection_reason: null,
    profile: { full_name: 'Sarah Jones' },
    draw: { title: 'March 2026 Draw' },
    created_at: '2026-03-28T18:00:00Z', updated_at: '2026-03-29T10:00:00Z',
  },
];

const columns: ColumnDef<WinnerRow>[] = [
  {
    key: 'user',
    header: 'Winner',
    cell: (row) => (
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cream)' }}>
        {row.profile?.full_name ?? row.user_id.slice(0, 8)}
      </span>
    ),
  },
  {
    key: 'draw',
    header: 'Draw',
    cell: (row) => (
      <span style={{ fontSize: '13px', color: 'var(--cream-dim)' }}>{row.draw?.title ?? '—'}</span>
    ),
  },
  {
    key: 'match_tier',
    header: 'Tier',
    cell: (row) => (
      <span style={{ fontSize: '13px', color: 'var(--cream-dim)', textTransform: 'capitalize' }}>
        {row.match_tier.replace('_', '-')}
      </span>
    ),
  },
  {
    key: 'prize_amount',
    header: 'Prize',
    cell: (row) => (
      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold)' }}>
        {formatCurrency(row.prize_amount)}
      </span>
    ),
    align: 'right',
  },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => <VerificationBadge status={row.status} />,
  },
  {
    key: 'created_at',
    header: 'Date',
    cell: (row) => (
      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
        {formatDate(row.created_at, { day: 'numeric', month: 'short' })}
      </span>
    ),
  },
];

export default async function AdminWinnersPage() {
  let winners: WinnerRow[] = DEMO_WINNERS;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('winners')
      .select('*, profile:profiles(full_name), draw:draws(title)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data && data.length > 0) winners = data as WinnerRow[];
  } catch { /* use demo */ }

  const pending = winners.filter((w) => w.status === 'pending');
  const verified = winners.filter((w) => w.status === 'verified');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--cream)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Winners Queue
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          {pending.length} pending · {verified.length} verified, awaiting payment
        </p>
      </div>

      {/* Pending verification cards */}
      {pending.length > 0 && (
        <section>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
            Pending Verification
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {pending.map((winner) => (
              <div key={winner.id} style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.18)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', color: 'var(--cream)' }}>
                    {winner.profile?.full_name ?? 'Unknown'}
                  </p>
                  <VerificationBadge status={winner.status} />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>{winner.draw?.title}</p>
                <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--gold)', letterSpacing: '-0.02em' }}>
                  {formatCurrency(winner.prize_amount)}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', textTransform: 'capitalize' }}>
                  {winner.match_tier.replace('_', '-')} prize
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All winners table */}
      <section>
        <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
          All Winners
        </h2>
        <DataTable data={winners} columns={columns} emptyMessage="No winners yet." />
      </section>
    </div>
  );
}
