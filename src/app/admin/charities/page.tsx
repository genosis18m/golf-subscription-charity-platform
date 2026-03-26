/**
 * Admin: Charities management (/admin/charities) — dark design.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DataTable, type ColumnDef } from '@/components/admin/DataTable';
import { formatCurrency } from '@/lib/utils';
import { SEED_CHARITIES } from '@/lib/data/seed-charities';
import type { Charity } from '@/types';

export const metadata: Metadata = { title: 'Charities — Admin' };

const columns: ColumnDef<Charity>[] = [
  {
    key: 'name',
    header: 'Charity',
    cell: (row) => (
      <div>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cream)' }}>{row.name}</p>
        {row.tagline && <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{row.tagline}</p>}
      </div>
    ),
  },
  {
    key: 'supporter_count',
    header: 'Supporters',
    cell: (row) => <span style={{ fontSize: '13px', color: 'var(--cream-dim)' }}>{row.supporter_count}</span>,
    align: 'center',
  },
  {
    key: 'total_raised',
    header: 'Total Raised',
    cell: (row) => (
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--green)' }}>
        {formatCurrency(row.total_raised)}
      </span>
    ),
    align: 'right',
  },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => (
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{
          padding: '3px 8px', borderRadius: '99px', fontSize: '10px',
          fontFamily: 'var(--font-syne)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
          background: row.is_active ? 'rgba(74,255,107,0.1)' : 'rgba(255,255,255,0.05)',
          color: row.is_active ? 'var(--green)' : 'var(--muted)',
          border: `1px solid ${row.is_active ? 'rgba(74,255,107,0.2)' : 'var(--border)'}`,
        }}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
        {row.is_featured && (
          <span style={{ padding: '3px 8px', borderRadius: '99px', fontSize: '10px', fontFamily: 'var(--font-syne)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>
            Featured
          </span>
        )}
      </div>
    ),
  },
  {
    key: 'actions',
    header: '',
    cell: (row) => (
      <Link
        href={`/admin/charities/${row.id}`}
        style={{ fontSize: '12px', fontWeight: 600, color: 'var(--green)', textDecoration: 'none', fontFamily: 'var(--font-syne)' }}
      >
        Edit →
      </Link>
    ),
    width: 'w-16',
    align: 'right',
  },
];

export default async function AdminCharitiesPage() {
  let charities: Charity[] = SEED_CHARITIES as Charity[];

  try {
    const supabase = await createClient();
    const { data } = await supabase.from('charities').select('*').order('supporter_count', { ascending: false });
    if (data && data.length > 0) charities = data as Charity[];
  } catch { /* use seed */ }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--cream)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Charities
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>{charities.length} registered charities</p>
        </div>
        <Link
          href="/admin/charities/new"
          style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--green)', color: '#07090A', fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}
        >
          + Add Charity
        </Link>
      </div>

      <DataTable data={charities} columns={columns} emptyMessage="No charities yet." />
    </div>
  );
}
