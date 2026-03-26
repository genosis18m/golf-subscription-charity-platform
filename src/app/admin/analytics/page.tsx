/**
 * Admin: Analytics (/admin/analytics).
 *
 * Charts: subscriber growth, prize pool over time, charity contributions.
 * Chart rendering is delegated to ChartWrapper + placeholder implementations.
 * In production, replace placeholders with recharts or chart.js components.
 */

import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ChartWrapper } from '@/components/admin/ChartWrapper';
import { KPICard } from '@/components/admin/KPICard';

export const metadata: Metadata = { title: 'Analytics — Admin' };

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [subCountResult, charityTotalResult] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('id', { count: 'exact' })
      .in('status', ['active', 'trialing']),
    supabase
      .from('charities')
      .select('total_raised'),
  ]);

  const activeSubscribers = subCountResult.count ?? 0;
  const totalRaised = ((charityTotalResult.data ?? []) as { total_raised: number }[])
    .reduce((sum, c) => sum + (c.total_raised ?? 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Platform metrics and trends.</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
          value={activeSubscribers * 2500}
          isCurrency
          accentColor="amber"
          description="Monthly recurring revenue (est.)"
        />
        <KPICard
          title="ARR"
          value={activeSubscribers * 2500 * 12}
          isCurrency
          accentColor="purple"
          description="Annual recurring revenue (est.)"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper
          title="Subscriber Growth"
          subtitle="Active subscribers over the last 12 months"
        >
          {/*
            Mount a recharts LineChart here:
            <LineChart data={subscriberGrowthData}>
              <Line dataKey="count" stroke="#16a34a" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
            </LineChart>
          */}
          <div className="h-full flex items-center justify-center text-slate-300 text-sm">
            Install recharts and mount LineChart here
          </div>
        </ChartWrapper>

        <ChartWrapper
          title="Prize Pool Over Time"
          subtitle="Monthly prize pool size (£)"
        >
          <div className="h-full flex items-center justify-center text-slate-300 text-sm">
            Install recharts and mount BarChart here
          </div>
        </ChartWrapper>

        <ChartWrapper
          title="Charity Contributions"
          subtitle="Monthly donations split by charity"
        >
          <div className="h-full flex items-center justify-center text-slate-300 text-sm">
            Install recharts and mount PieChart here
          </div>
        </ChartWrapper>

        <ChartWrapper
          title="Draw Match Distribution"
          subtitle="5-match, 4-match, 3-match wins per draw"
        >
          <div className="h-full flex items-center justify-center text-slate-300 text-sm">
            Install recharts and mount StackedBarChart here
          </div>
        </ChartWrapper>
      </div>
    </div>
  );
}
