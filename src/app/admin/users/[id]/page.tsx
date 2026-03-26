/**
 * Admin: Individual User (/admin/users/[id]).
 *
 * Full member profile view with scores, subscription, draw history,
 * and admin edit controls.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';
import { ScoreList } from '@/components/score/ScoreList';
import { formatDate, formatHandicap } from '@/lib/utils';
import type { Profile, Subscription, Score } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `User ${id.slice(0, 8)} — Admin` };
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [profileResult, subscriptionResult, scoresResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', id).single(),
    supabase.from('subscriptions').select('*, charity:charities(name)').eq('user_id', id).single(),
    supabase
      .from('scores')
      .select('*')
      .eq('user_id', id)
      .order('round_date', { ascending: false })
      .limit(5),
  ]);

  if (profileResult.error) notFound();

  const profile = profileResult.data as Profile;
  const subscription = subscriptionResult.data as (Subscription & { charity?: { name: string } }) | null;
  const scores = (scoresResult.data ?? []) as Score[];

  const rollingAverage =
    scores.length > 0
      ? scores.reduce((s, score) => s + score.gross_score, 0) / scores.length
      : null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{profile.full_name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">User ID: {id}</p>
        </div>
      </div>

      {/* Profile details */}
      <Card>
        <Card.Header title="Profile" />
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Full Name', value: profile.full_name },
            { label: 'Display Name', value: profile.display_name ?? '—' },
            { label: 'Handicap', value: profile.handicap !== null ? formatHandicap(profile.handicap) : '—' },
            { label: 'Golf Club', value: profile.golf_club ?? '—' },
            { label: 'Phone', value: profile.phone ?? '—' },
            { label: 'Member Since', value: formatDate(profile.created_at, { day: 'numeric', month: 'long', year: 'numeric' }) },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</dt>
              <dd className="text-sm text-slate-900 mt-0.5">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {/* Subscription */}
      <Card>
        <Card.Header title="Subscription" />
        {subscription ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <SubscriptionBadge status={subscription.status} planId={subscription.plan_id} showPlan />
              {subscription.charity && (
                <span className="text-sm text-slate-600">
                  Supporting: <strong>{subscription.charity.name}</strong>
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">
              Renews{' '}
              {formatDate(subscription.current_period_end, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No active subscription.</p>
        )}
      </Card>

      {/* Scores */}
      <Card>
        <Card.Header title="Recent Scores" subtitle={`Rolling average: ${rollingAverage?.toFixed(1) ?? '—'}`} />
        <ScoreList scores={scores} rollingAverage={rollingAverage} />
      </Card>
    </div>
  );
}
