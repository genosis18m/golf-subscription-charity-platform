/**
 * Admin Overview (/admin) — dark design with demo fallback.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { KPICard } from '@/components/admin/KPICard';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin Overview' };

const DEMO_STATS = {
  activeSubscribers: 2847,
  estimatedPrizePool: 4270500,
  totalRaised: 189400,
  pendingVerifications: 3,
  activeCharities: 6,
  recentDraws: [
    { id: 'demo-d1', title: 'March 2026 Draw', status: 'published', total: 1800000 },
    { id: 'demo-d2', title: 'February 2026 Draw', status: 'published', total: 1650000 },
    { id: 'demo-d3', title: 'April 2026 Draw', status: 'draft', total: 0 },
  ],
};

export default async function AdminOverviewPage() {
  let stats = DEMO_STATS;
  let usedDemo = true;

  try {
    const supabase = await createClient();
    const [subscribersResult, pendingWinnersResult, charitiesResult, drawsResult] = await Promise.all([
      supabase.from('subscriptions').select('id', { count: 'exact' }).in('status', ['active', 'trialing']),
      supabase.from('winners').select('id, prize_amount', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('charities').select('id, total_raised', { count: 'exact' }).eq('is_active', true),
      supabase.from('draws').select('id, title, status, prize_pool_snapshot').order('created_at', { ascending: false }).limit(5),
    ]);

    if (subscribersResult.count !== null) {
      const activeSubscribers = subscribersResult.count ?? 0;
      const totalRaised = (charitiesResult.data ?? []).reduce((sum, c) => sum + (c.total_raised ?? 0), 0);
      stats = {
        activeSubscribers,
        estimatedPrizePool: Math.floor(activeSubscribers * 2500 * 0.6),
        totalRaised,
        pendingVerifications: pendingWinnersResult.count ?? 0,
        activeCharities: charitiesResult.count ?? 0,
        recentDraws: (drawsResult.data ?? []).map((d) => ({
          id: d.id,
          title: `Draw #${d.id.slice(0, 8)}`,
          status: d.status,
          total: d.prize_pool_snapshot?.total_amount ?? 0,
        })),
      };
      usedDemo = false;
    }
  } catch { /* use demo stats */ }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--cream)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Admin Overview
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Platform health at a glance.</p>
        </div>
        {usedDemo && (
          <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontFamily: 'var(--font-syne)', fontWeight: 700, background: 'rgba(245,166,35,0.1)', color: 'var(--gold)', border: '1px solid rgba(245,166,35,0.2)' }}>
            Demo Data
          </span>
        )}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <KPICard title="Active Subscribers" value={stats.activeSubscribers} description="Active + trialing subscriptions" accentColor="green" />
        <KPICard title="Estimated Prize Pool" value={stats.estimatedPrizePool} isCurrency description="Current month (60% of subscriptions)" accentColor="amber" />
        <KPICard title="Total Raised for Charity" value={stats.totalRaised} isCurrency description={`Across ${stats.activeCharities} active charities`} accentColor="blue" />
        <KPICard title="Pending Verifications" value={stats.pendingVerifications} description="Winner claims awaiting review" accentColor="purple" />
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {[
          { href: '/admin/draws/new', icon: '🎱', label: 'New Draw', desc: 'Configure next monthly draw', accent: 'rgba(74,255,107,0.15)' },
          { href: '/admin/winners', icon: '🏆', label: `Verify Winners${stats.pendingVerifications > 0 ? ` (${stats.pendingVerifications})` : ''}`, desc: 'Review pending claims', accent: 'rgba(245,166,35,0.15)' },
          { href: '/admin/charities', icon: '❤️', label: 'Charities', desc: 'Manage charity partners', accent: 'rgba(96,165,250,0.15)' },
        ].map(({ href, icon, label, desc, accent }) => (
          <Link
            key={href}
            href={href}
            style={{
              background: accent, border: '1px solid var(--border)', borderRadius: '14px',
              padding: '20px', textAlign: 'center', textDecoration: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              transition: 'border-color 0.2s',
            }}
          >
            <span style={{ fontSize: '24px' }}>{icon}</span>
            <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '13px', color: 'var(--cream)' }}>{label}</span>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{desc}</span>
          </Link>
        ))}
      </div>

      {/* Recent draws */}
      {stats.recentDraws.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', color: 'var(--cream)' }}>Recent Draws</h2>
            <Link href="/admin/draws" style={{ fontSize: '12px', color: 'var(--green)', textDecoration: 'none', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
              View all →
            </Link>
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {stats.recentDraws.map((draw, idx) => (
              <li key={draw.id} style={{ borderBottom: idx < stats.recentDraws.length - 1 ? '1px solid var(--border)' : undefined }}>
                <Link
                  href={`/admin/draws/${draw.id}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', textDecoration: 'none', transition: 'background 0.15s' }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cream)', fontFamily: 'var(--font-syne)' }}>{draw.title}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {draw.total > 0 && (
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{formatCurrency(draw.total)}</span>
                    )}
                    <span style={{
                      fontSize: '10px', padding: '3px 10px', borderRadius: '99px',
                      fontFamily: 'var(--font-syne)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                      background: draw.status === 'published' ? 'rgba(74,255,107,0.1)' : draw.status === 'simulated' ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.05)',
                      color: draw.status === 'published' ? 'var(--green)' : draw.status === 'simulated' ? '#60a5fa' : 'var(--muted)',
                    }}>
                      {draw.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
