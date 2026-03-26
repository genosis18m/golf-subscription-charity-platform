/**
 * Dashboard Overview — works with both demo and Supabase sessions.
 */

import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getDemoSession, DEMO_COOKIE, DEMO_USERS } from '@/lib/demo-auth';
import { DarkStatCard } from '@/components/dashboard/DarkStatCard';
import { DrawCountdown } from '@/components/dashboard/DrawCountdown';
import { formatCurrency } from '@/lib/utils';
import { DRAW_DEFAULT_DAY } from '@/constants';
import type { Score, Winner, Subscription } from '@/types';

export const metadata: Metadata = { title: 'Dashboard' };

function getNextDrawDate(): string {
  const now = new Date();
  const nextDraw = new Date(now.getFullYear(), now.getMonth(), DRAW_DEFAULT_DAY, 18, 0, 0);
  if (nextDraw <= now) nextDraw.setMonth(nextDraw.getMonth() + 1);
  return nextDraw.toISOString();
}

export default async function DashboardPage() {
  const nextDrawDate = getNextDrawDate();
  const drawTitle = `${new Date(nextDrawDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} Draw`;

  // ── Demo session ────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const demoSession = getDemoSession(cookieStore.get(DEMO_COOKIE)?.value);

  if (demoSession) {
    const u = DEMO_USERS.user;
    const avgScore = u.scores.reduce((s, r) => s + r.gross_score, 0) / u.scores.length;

    return (
      <DashboardContent
        userName={u.full_name}
        scoreAvg={avgScore}
        totalWinningsPence={u.total_winnings}
        totalDonatedPence={u.total_donated}
        drawsEntered={u.draws_entered}
        charityName={u.charity_name}
        charityPct={u.charity_pct}
        nextDrawDate={nextDrawDate}
        drawTitle={drawTitle}
        recentScores={u.scores.map((s) => ({ course: s.course_name, score: s.gross_score, date: s.round_date }))}
        isDemo
      />
    );
  }

  // ── Supabase session ────────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [scoresResult, winnersResult, subscriptionResult] = await Promise.all([
    supabase.from('scores').select('*').eq('user_id', user.id).order('round_date', { ascending: false }).limit(5),
    supabase.from('winners').select('*').eq('user_id', user.id).eq('status', 'paid'),
    supabase.from('subscriptions').select('*, charity:charities(name,logo_url)').eq('user_id', user.id).single(),
  ]);

  const scores = (scoresResult.data ?? []) as Score[];
  const winners = (winnersResult.data ?? []) as Winner[];
  const subscription = subscriptionResult.data as (Subscription & { charity: { name: string; logo_url: string | null } }) | null;

  const avgScore = scores.length > 0 ? scores.reduce((s, r) => s + r.gross_score, 0) / scores.length : null;
  const totalWinnings = winners.reduce((s, w) => s + w.prize_amount, 0);
  const months = subscription
    ? Math.ceil((Date.now() - new Date(subscription.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0;
  const totalDonated = subscription ? Math.floor(2500 * subscription.charity_contribution_pct) * months : 0;

  return (
    <DashboardContent
      userName={user.email ?? 'Member'}
      scoreAvg={avgScore}
      totalWinningsPence={totalWinnings}
      totalDonatedPence={totalDonated}
      drawsEntered={scores.length}
      charityName={subscription?.charity?.name ?? 'Your charity'}
      charityPct={subscription ? Math.round(subscription.charity_contribution_pct * 100) : 15}
      nextDrawDate={nextDrawDate}
      drawTitle={drawTitle}
      recentScores={scores.map((s) => ({ course: s.course_name ?? 'Unknown', score: s.gross_score, date: s.round_date }))}
    />
  );
}

// ── Presentation component ──────────────────────────────────────────────────

interface DashboardContentProps {
  userName: string;
  scoreAvg: number | null;
  totalWinningsPence: number;
  totalDonatedPence: number;
  drawsEntered: number;
  charityName: string;
  charityPct: number;
  nextDrawDate: string;
  drawTitle: string;
  recentScores: { course: string; score: number; date: string }[];
  isDemo?: boolean;
}

function DashboardContent({
  userName,
  scoreAvg,
  totalWinningsPence,
  totalDonatedPence,
  drawsEntered,
  charityName,
  charityPct,
  nextDrawDate,
  drawTitle,
  recentScores,
  isDemo,
}: DashboardContentProps) {
  const firstName = userName.split(' ')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1100px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-syne)',
            fontWeight: 800,
            fontSize: '1.75rem',
            color: 'var(--cream)',
            letterSpacing: '-0.03em',
            marginBottom: '4px',
          }}>
            Good morning, {firstName}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            {isDemo && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(74,255,107,0.08)',
                border: '1px solid rgba(74,255,107,0.2)',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '11px',
                fontFamily: 'var(--font-syne)',
                fontWeight: 700,
                color: 'var(--green)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginRight: '8px',
              }}>
                Demo
              </span>
            )}
            Here&apos;s your subscription at a glance.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <DarkStatCard
          title="Score Average"
          value={scoreAvg !== null ? scoreAvg.toFixed(1) : '—'}
          subtitle="last 5 rounds"
          accent="green"
          icon="⛳"
        />
        <DarkStatCard
          title="Total Winnings"
          value={formatCurrency(totalWinningsPence)}
          subtitle="lifetime paid"
          accent="gold"
          icon="🏆"
        />
        <DarkStatCard
          title="Charity Donated"
          value={formatCurrency(totalDonatedPence)}
          subtitle={charityName}
          accent="green"
          icon="💚"
        />
        <DarkStatCard
          title="Draws Entered"
          value={String(drawsEntered)}
          subtitle={`${charityPct}% goes to charity`}
          accent="neutral"
          icon="🎱"
        />
      </div>

      {/* Draw Countdown + Recent Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <DrawCountdown nextDrawDate={nextDrawDate} drawTitle={drawTitle} />

        {/* Recent Scores */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '22px 24px',
        }}>
          <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '13px', color: 'var(--cream)', marginBottom: '16px', letterSpacing: '-0.01em' }}>
            Recent Scores
          </p>
          {recentScores.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '13px' }}>No scores submitted yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentScores.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--cream)', fontWeight: 500 }}>{s.course}</p>
                    <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '1px' }}>
                      {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-syne)',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    color: 'var(--green)',
                    letterSpacing: '-0.02em',
                  }}>
                    {s.score}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Charity impact bar */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '13px', color: 'var(--cream)', letterSpacing: '-0.01em' }}>
              Charity Impact
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{charityName}</p>
          </div>
          <span style={{
            fontSize: '11px',
            fontFamily: 'var(--font-syne)',
            fontWeight: 700,
            color: 'var(--green)',
            background: 'rgba(74,255,107,0.08)',
            border: '1px solid rgba(74,255,107,0.15)',
            borderRadius: '4px',
            padding: '3px 8px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            {charityPct}% of your sub
          </span>
        </div>

        {/* Progress bar toward £100 milestone */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{formatCurrency(totalDonatedPence)} donated</span>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>£100 milestone</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, (totalDonatedPence / 10000) * 100)}%`,
              background: 'linear-gradient(90deg, var(--green), #2dd55b)',
              borderRadius: '99px',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      </div>

    </div>
  );
}
