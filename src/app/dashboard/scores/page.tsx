/**
 * Dashboard: My Scores — works with demo + Supabase sessions.
 */

import type { Metadata } from 'next';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { getServerDemoSession, DEMO_USERS } from '@/lib/demo-auth-server';
import { ScoreForm } from '@/components/score/ScoreForm';
import { SCORE_LIMITS } from '@/constants';
import type { Score } from '@/types';

export const metadata: Metadata = { title: 'My Scores' };

export default async function ScoresPage() {
  // ── Demo session ────────────────────────────────────────────────────────
  const demoSession = await getServerDemoSession();

  if (demoSession) {
    const u = DEMO_USERS.user;
    const avg = u.scores.reduce((s, r) => s + r.gross_score, 0) / u.scores.length;

    return (
      <ScoresContent
        scores={u.scores.map((s) => ({
          id: s.id,
          user_id: u.id,
          round_date: s.round_date,
          gross_score: s.gross_score,
          net_score: null,
          course_name: s.course_name,
          notes: null,
          submitted_at: s.round_date,
          created_at: s.round_date,
        }))}
        rollingAverage={avg}
        isDemo
      />
    );
  }

  // ── Supabase session ────────────────────────────────────────────────────
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('round_date', { ascending: false })
    .limit(SCORE_LIMITS.MAX_STORED);

  const scores = (data ?? []) as Score[];
  const rollingAverage = scores.length > 0
    ? scores.reduce((s, r) => s + r.gross_score, 0) / scores.length
    : null;

  return <ScoresContent scores={scores} rollingAverage={rollingAverage} />;
}

// ── Presentation ────────────────────────────────────────────────────────────

interface ScoresContentProps {
  scores: Score[];
  rollingAverage: number | null;
  isDemo?: boolean;
}

function ScoresContent({ scores, rollingAverage, isDemo }: ScoresContentProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '720px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.75rem', color: 'var(--cream)', letterSpacing: '-0.03em', marginBottom: '6px' }}>
          My Scores
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>
          Submit round scores to qualify for the monthly draw. We store your last {SCORE_LIMITS.MAX_STORED} scores
          and compute your rolling average for draw weighting.
        </p>
      </div>

      {/* Score submission form — disabled in demo mode */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', color: 'var(--cream)', marginBottom: '20px', letterSpacing: '-0.01em' }}>
          Submit a Score
        </h2>
        {isDemo ? (
          <div style={{
            background: 'rgba(74,255,107,0.04)',
            border: '1px solid rgba(74,255,107,0.12)',
            borderRadius: '10px',
            padding: '16px',
            fontSize: '13px',
            color: 'var(--muted)',
            lineHeight: 1.6,
          }}>
            Score submission is disabled in demo mode. In a real account you&apos;d submit your round score here and it would qualify you for the next monthly draw.
          </div>
        ) : (
          <ScoreForm />
        )}
      </div>

      {/* Score history */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', color: 'var(--cream)', letterSpacing: '-0.01em' }}>
            Recent Scores
            <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '12px', marginLeft: '6px' }}>
              (last {SCORE_LIMITS.MAX_STORED})
            </span>
          </h2>
          {rollingAverage !== null && (
            <span style={{
              background: 'rgba(74,255,107,0.08)',
              border: '1px solid rgba(74,255,107,0.15)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '12px',
              fontFamily: 'var(--font-syne)',
              fontWeight: 700,
              color: 'var(--green)',
            }}>
              Avg: {rollingAverage.toFixed(1)}
            </span>
          )}
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          {scores.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
              <p style={{ fontSize: '2rem', marginBottom: '8px' }}>⛳</p>
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>No scores yet — submit your first round above.</p>
            </div>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {scores.map((score, i) => (
                <li
                  key={score.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 24px',
                    borderBottom: i < scores.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      color: 'var(--muted)',
                      fontFamily: 'var(--font-syne)',
                      fontWeight: 600,
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <div>
                      <p style={{ fontSize: '14px', color: 'var(--cream)', fontWeight: 500 }}>
                        {score.course_name ?? 'Round'}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                        {new Date(score.round_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-syne)',
                    fontWeight: 800,
                    fontSize: '1.4rem',
                    color: 'var(--green)',
                    letterSpacing: '-0.03em',
                  }}>
                    {score.gross_score}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
