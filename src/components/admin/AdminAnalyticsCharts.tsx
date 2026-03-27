'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

const CHART_COLORS = {
  green: '#4AFF6B',
  gold: '#F5A623',
  blue: '#60A5FA',
  rose: '#FB7185',
  violet: '#A78BFA',
  teal: '#34D399',
  grid: 'rgba(239,233,221,0.08)',
  axis: 'rgba(239,233,221,0.56)',
  tooltipBg: 'rgba(7,9,10,0.94)',
  tooltipBorder: 'rgba(255,255,255,0.08)',
  cream: '#EFE9DD',
} as const;

function formatPounds(value: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function getNumericTooltipValue(value: ValueType | undefined) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;

  const firstValue = value?.[0];
  return typeof firstValue === 'number' ? firstValue : Number(firstValue ?? 0);
}

function getTooltipName(name: NameType | undefined, fallback: string) {
  if (typeof name === 'number') {
    return String(name);
  }

  return name ?? fallback;
}

const tooltipContentStyle = {
  backgroundColor: CHART_COLORS.tooltipBg,
  border: `1px solid ${CHART_COLORS.tooltipBorder}`,
  borderRadius: '14px',
  color: CHART_COLORS.cream,
  boxShadow: '0 16px 40px rgba(0,0,0,0.32)',
};

const tooltipLabelStyle = {
  color: CHART_COLORS.cream,
  fontWeight: 700,
};

const tooltipItemStyle = {
  color: CHART_COLORS.cream,
};

const legendStyle = {
  color: CHART_COLORS.axis,
  fontSize: 12,
  paddingTop: 12,
};

const axisStyle = {
  fontSize: 12,
  fill: CHART_COLORS.axis,
};

export interface SubscriberGrowthPoint {
  month: string;
  count: number;
}

export interface PrizePoolPoint {
  month: string;
  total: number;
}

export interface CharityContributionPoint {
  name: string;
  value: number;
  color: string;
}

export interface MatchDistributionPoint {
  draw: string;
  fiveMatch: number;
  fourMatch: number;
  threeMatch: number;
}

export function SubscriberGrowthChart({ data }: { data: SubscriberGrowthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 10, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisStyle} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={axisStyle} />
        <Tooltip
          formatter={(value) => [`${getNumericTooltipValue(value)} active members`, 'Subscribers']}
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          itemStyle={tooltipItemStyle}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke={CHART_COLORS.green}
          strokeWidth={3}
          dot={{ r: 3, fill: CHART_COLORS.green, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: CHART_COLORS.gold, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PrizePoolChart({ data }: { data: PrizePoolPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 10, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisStyle} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={axisStyle}
          tickFormatter={(value: number) => formatPounds(value)}
        />
        <Tooltip
          formatter={(value) => [formatPounds(getNumericTooltipValue(value)), 'Prize pool']}
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          itemStyle={tooltipItemStyle}
        />
        <Bar dataKey="total" radius={[10, 10, 0, 0]} fill={CHART_COLORS.gold} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CharityContributionsChart({ data }: { data: CharityContributionPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={56}
          outerRadius={92}
          paddingAngle={3}
          stroke="rgba(7,9,10,0.9)"
          strokeWidth={2}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [formatPounds(getNumericTooltipValue(value)), 'Monthly donation']}
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          itemStyle={tooltipItemStyle}
        />
        <Legend wrapperStyle={legendStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MatchDistributionChart({ data }: { data: MatchDistributionPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 10, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="draw" tickLine={false} axisLine={false} tick={axisStyle} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={axisStyle} />
        <Tooltip
          formatter={(value, name) => [getNumericTooltipValue(value), getTooltipName(name, 'Matches')]}
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          itemStyle={tooltipItemStyle}
        />
        <Legend wrapperStyle={legendStyle} />
        <Bar dataKey="threeMatch" stackId="matches" fill={CHART_COLORS.blue} radius={[0, 0, 8, 8]} name="3-match" />
        <Bar dataKey="fourMatch" stackId="matches" fill={CHART_COLORS.green} name="4-match" />
        <Bar dataKey="fiveMatch" stackId="matches" fill={CHART_COLORS.gold} radius={[8, 8, 0, 0]} name="5-match" />
      </BarChart>
    </ResponsiveContainer>
  );
}
