import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SUBSCRIPTION_PLANS } from '@/constants';
import { ChartWrapper } from '@/components/admin/ChartWrapper';
import {
  CharityContributionsChart,
  MatchDistributionChart,
  PrizePoolChart,
  SubscriberGrowthChart,
  type CharityContributionPoint,
  type MatchDistributionPoint,
  type PrizePoolPoint,
  type SubscriberGrowthPoint,
} from '@/components/admin/AdminAnalyticsCharts';
import { KPICard } from '@/components/admin/KPICard';

export const metadata: Metadata = { title: 'Analytics — Admin' };

type SubscriptionRow = {
  id: string;
  plan_id: 'free' | 'monthly' | 'yearly';
  status: string;
  stripe_price_id: string | null;
  charity_id: string | null;
  charity_contribution_pct: number | null;
  created_at: string;
};

type CharityRow = {
  id: string;
  name: string;
  total_raised: number | null;
};

type DrawRow = {
  id: string;
  title: string;
  draw_month: string | null;
  prize_pool_snapshot: { total_amount?: number | null } | null;
  draw_results?: Array<{
    five_match_winners?: string[] | null;
    four_match_winners?: string[] | null;
    three_match_winners?: string[] | null;
  }> | null;
};

const COMPLIMENTARY_PRICE_IDS = new Set(['price_free', 'price_delayed_start']);
const PIE_COLORS = ['#4AFF6B', '#F5A623', '#60A5FA', '#FB7185', '#A78BFA', '#34D399'];

function isPaidSubscription(subscription: SubscriptionRow) {
  return (
    subscription.plan_id !== 'free' &&
    !COMPLIMENTARY_PRICE_IDS.has(subscription.stripe_price_id ?? '')
  );
}

function getMonthlyRecurringRevenuePence(subscription: SubscriptionRow) {
  if (!isPaidSubscription(subscription)) {
    return 0;
  }

  if (subscription.plan_id === 'yearly') {
    return Math.round(SUBSCRIPTION_PLANS.yearly.price_pence / 12);
  }

  return SUBSCRIPTION_PLANS.monthly.price_pence;
}

function toMonthKey(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function getMonthStartFromKey(monthKey: string) {
  return new Date(`${monthKey}-01T00:00:00.000Z`);
}

function formatMonth(monthKey: string, options: Intl.DateTimeFormatOptions = { month: 'short' }) {
  return getMonthStartFromKey(monthKey).toLocaleDateString('en-GB', {
    timeZone: 'UTC',
    ...options,
  });
}

function getRecentMonthKeys(count: number) {
  const today = new Date();
  const baseYear = today.getUTCFullYear();
  const baseMonth = today.getUTCMonth();

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(baseYear, baseMonth - (count - 1 - index), 1));
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

    return {
      key,
      label: date.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }),
    };
  });
}

export default async function AdminAnalyticsPage() {
  let supabase: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createAdminClient>;

  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const [subscriptionsResult, charitiesResult, drawsResult] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('id, plan_id, status, stripe_price_id, charity_id, charity_contribution_pct, created_at')
      .in('status', ['active', 'trialing']),
    supabase
      .from('charities')
      .select('id, name, total_raised'),
    supabase
      .from('draws')
      .select('id, title, draw_month, prize_pool_snapshot, draw_results(five_match_winners, four_match_winners, three_match_winners)')
      .order('draw_month', { ascending: true })
      .limit(24),
  ]);

  const subscriptions = ((subscriptionsResult.data ?? []) as SubscriptionRow[]).filter(
    (subscription) => subscription.status === 'active' || subscription.status === 'trialing'
  );
  const charities = (charitiesResult.data ?? []) as CharityRow[];
  const draws = (drawsResult.data ?? []) as DrawRow[];

  const activeSubscribers = subscriptions.length;
  const totalRaised = charities
    .reduce((sum, c) => sum + (c.total_raised ?? 0), 0);
  const paidSubscriptions = subscriptions.filter(isPaidSubscription);
  const mrr = paidSubscriptions.reduce(
    (sum, subscription) => sum + getMonthlyRecurringRevenuePence(subscription),
    0
  );
  const arr = mrr * 12;

  const monthBuckets = getRecentMonthKeys(12);
  const firstMonthKey = monthBuckets[0]?.key ?? '';
  const subscriberAddsByMonth = new Map(monthBuckets.map(({ key }) => [key, 0]));
  const baselineActiveMembers = subscriptions.filter((subscription) => {
    const monthKey = toMonthKey(subscription.created_at);
    return Boolean(monthKey && monthKey < firstMonthKey);
  }).length;

  for (const subscription of subscriptions) {
    const monthKey = toMonthKey(subscription.created_at);
    if (!monthKey || !subscriberAddsByMonth.has(monthKey)) continue;
    subscriberAddsByMonth.set(monthKey, (subscriberAddsByMonth.get(monthKey) ?? 0) + 1);
  }

  const subscriberGrowthData = monthBuckets.reduce<SubscriberGrowthPoint[]>(
    (points, { key, label }) => {
      const previousCount = points.at(-1)?.count ?? baselineActiveMembers;
      const nextCount = previousCount + (subscriberAddsByMonth.get(key) ?? 0);

      points.push({ month: label, count: nextCount });
      return points;
    },
    []
  );

  const prizePoolData: PrizePoolPoint[] = draws
    .filter((draw) => Boolean(draw.draw_month))
    .slice(-8)
    .map((draw) => ({
      month: formatMonth(draw.draw_month!, { month: 'short', year: '2-digit' }),
      total: Number(((draw.prize_pool_snapshot?.total_amount ?? 0) / 100).toFixed(2)),
    }));

  const charityNameById = new Map(charities.map((charity) => [charity.id, charity.name]));
  const charityContributionTotals = new Map<string, number>();

  for (const subscription of paidSubscriptions) {
    const monthlyDonationPence = Math.round(
      getMonthlyRecurringRevenuePence(subscription) * (subscription.charity_contribution_pct ?? 0)
    );

    if (monthlyDonationPence <= 0) continue;

    const charityName = charityNameById.get(subscription.charity_id ?? '') ?? 'Unassigned charity';
    charityContributionTotals.set(
      charityName,
      (charityContributionTotals.get(charityName) ?? 0) + monthlyDonationPence
    );
  }

  const rawCharityContributionData = Array.from(charityContributionTotals.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([name, pence]) => ({
      name,
      value: Number((pence / 100).toFixed(2)),
    }));

  const visibleCharityContributionData = rawCharityContributionData.slice(0, 5);
  const remainingContributionValue = rawCharityContributionData
    .slice(5)
    .reduce((sum, entry) => sum + entry.value, 0);

  if (remainingContributionValue > 0) {
    visibleCharityContributionData.push({
      name: 'Other',
      value: Number(remainingContributionValue.toFixed(2)),
    });
  }

  const charityContributionData: CharityContributionPoint[] = visibleCharityContributionData.map(
    (entry, index) => ({
      ...entry,
      color: PIE_COLORS[index % PIE_COLORS.length],
    })
  );

  const matchDistributionData: MatchDistributionPoint[] = draws
    .filter((draw) => Boolean(draw.draw_month) && Boolean(draw.draw_results?.[0]))
    .slice(-8)
    .map((draw) => {
      const result = draw.draw_results?.[0];

      return {
        draw: formatMonth(draw.draw_month!, { month: 'short', year: '2-digit' }),
        fiveMatch: result?.five_match_winners?.length ?? 0,
        fourMatch: result?.four_match_winners?.length ?? 0,
        threeMatch: result?.three_match_winners?.length ?? 0,
      };
    });

  const hasPrizePoolData = prizePoolData.length > 0;
  const hasCharityContributionData = charityContributionData.some((entry) => entry.value > 0);
  const hasMatchDistributionData = matchDistributionData.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-syne)',
            fontWeight: 800,
            fontSize: '1.6rem',
            color: 'var(--cream)',
            letterSpacing: '-0.02em',
            marginBottom: '4px',
          }}
        >
          Analytics
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Platform metrics and trends.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <KPICard
          title="Active Members"
          value={activeSubscribers}
          accentColor="green"
          description="Current billing period"
        />
        <KPICard
          title="Total Charity Raised"
          value={totalRaised}
          isCurrency
          accentColor="blue"
          description="All time across all charities"
        />
        <KPICard
          title="MRR"
          value={mrr}
          isCurrency
          accentColor="amber"
          description="Monthly recurring revenue (est.)"
        />
        <KPICard
          title="ARR"
          value={arr}
          isCurrency
          accentColor="purple"
          description="Annual recurring revenue (est.)"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartWrapper
          title="Subscriber Growth"
          subtitle="Active subscribers over the last 12 months"
        >
          <SubscriberGrowthChart data={subscriberGrowthData} />
        </ChartWrapper>

        <ChartWrapper
          title="Prize Pool Over Time"
          subtitle="Monthly prize pool size (£)"
          error={hasPrizePoolData ? null : 'No draw pool data yet.'}
        >
          <PrizePoolChart data={prizePoolData} />
        </ChartWrapper>

        <ChartWrapper
          title="Charity Contributions"
          subtitle="Estimated monthly donations split by charity"
          error={hasCharityContributionData ? null : 'No donation allocation data yet.'}
        >
          <CharityContributionsChart data={charityContributionData} />
        </ChartWrapper>

        <ChartWrapper
          title="Draw Match Distribution"
          subtitle="5-match, 4-match, 3-match wins per draw"
          error={hasMatchDistributionData ? null : 'No published draw results yet.'}
        >
          <MatchDistributionChart data={matchDistributionData} />
        </ChartWrapper>
      </div>
    </div>
  );
}
