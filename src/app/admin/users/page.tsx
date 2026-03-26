/**
 * Admin: Users (/admin/users) — dark design.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DataTable, type ColumnDef } from '@/components/admin/DataTable';
import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';
import { formatDate } from '@/lib/utils';
import type { UserRowData } from '@/components/admin/UserRow';

export const metadata: Metadata = { title: 'Users — Admin' };

const DEMO_USERS_TABLE: UserRowData[] = [
  {
    id: 'demo-user-001',
    email: 'demo@golfcharity.com',
    profile: { user_id: 'demo-user-001', full_name: 'Alex Demo', handicap: 12, golf_club: 'Sunningdale Golf Club' } as UserRowData['profile'],
    subscription: { status: 'active', plan_id: 'monthly' } as UserRowData['subscription'],
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'demo-user-002',
    email: 'james.wilson@example.com',
    profile: { user_id: 'demo-user-002', full_name: 'James Wilson', handicap: 8, golf_club: 'Royal Birkdale' } as UserRowData['profile'],
    subscription: { status: 'active', plan_id: 'yearly' } as UserRowData['subscription'],
    created_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'demo-user-003',
    email: 'sarah.jones@example.com',
    profile: { user_id: 'demo-user-003', full_name: 'Sarah Jones', handicap: 22, golf_club: 'Wentworth Club' } as UserRowData['profile'],
    subscription: { status: 'active', plan_id: 'monthly' } as UserRowData['subscription'],
    created_at: '2026-02-03T10:00:00Z',
  },
];

const columns: ColumnDef<UserRowData>[] = [
  {
    key: 'email',
    header: 'User',
    cell: (row) => (
      <div>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cream)' }}>{row.profile?.full_name ?? '—'}</p>
        <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{row.email}</p>
      </div>
    ),
  },
  {
    key: 'handicap',
    header: 'Handicap',
    cell: (row) => (
      <span style={{ fontSize: '13px', color: 'var(--cream-dim)' }}>
        {row.profile?.handicap != null ? row.profile.handicap : '—'}
      </span>
    ),
    width: 'w-24',
  },
  {
    key: 'subscription',
    header: 'Subscription',
    cell: (row) =>
      row.subscription ? (
        <SubscriptionBadge status={row.subscription.status} planId={row.subscription.plan_id} showPlan />
      ) : (
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>None</span>
      ),
  },
  {
    key: 'created_at',
    header: 'Joined',
    cell: (row) => (
      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
        {formatDate(row.created_at, { day: 'numeric', month: 'short', year: 'numeric' })}
      </span>
    ),
  },
  {
    key: 'actions',
    header: '',
    cell: (row) => (
      <Link
        href={`/admin/users/${row.id}`}
        style={{ fontSize: '12px', fontWeight: 600, color: 'var(--green)', textDecoration: 'none', fontFamily: 'var(--font-syne)' }}
      >
        View →
      </Link>
    ),
    width: 'w-16',
    align: 'right',
  },
];

export default async function AdminUsersPage() {
  let users: UserRowData[] = DEMO_USERS_TABLE;

  try {
    const supabase = await createClient();
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*, user:users(id, email, created_at)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (profilesData && profilesData.length > 0) {
      users = profilesData.map((p: {
        user_id: string; full_name: string; handicap: number | null;
        golf_club: string | null; created_at: string;
      }) => ({
        id: p.user_id,
        email: '',
        profile: p as unknown as UserRowData['profile'],
        subscription: null,
        created_at: p.created_at,
      }));
    }
  } catch { /* use demo */ }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--cream)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Users
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          {users.length} registered member{users.length !== 1 ? 's' : ''}
        </p>
      </div>

      <DataTable data={users} columns={columns} emptyMessage="No users found." />
    </div>
  );
}
