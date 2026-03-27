/**
 * Dashboard: Subscription (/dashboard/subscription) — dark design.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { getServerDemoSession, DEMO_USERS } from '@/lib/demo-auth-server';
import { formatDate, formatCurrency } from '@/lib/utils';
import { SUBSCRIPTION_PLANS } from '@/constants';
import ManageSubscriptionButton from './ManageSubscriptionButton';
import type { Subscription } from '@/types';

export const metadata: Metadata = { title: 'Subscription' };

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  padding: '24px',
};

export default async function SubscriptionPage() {
  // Demo session check
  const demo = await getServerDemoSession();
  if (demo) {
    const u = DEMO_USERS.user;
    const plan = SUBSCRIPTION_PLANS['monthly'];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--cream)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Subscription
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Manage your plan and billing.</p>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--cream)', marginBottom: '4px' }}>
                {plan.label} Plan
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{plan.price_display}</p>
            </div>
            <span style={{
              padding: '4px 12px', borderRadius: '99px', fontSize: '11px',
              fontFamily: 'var(--font-syne)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
              background: 'rgba(74,255,107,0.1)', color: 'var(--green)', border: '1px solid rgba(74,255,107,0.2)',
            }}>
              {u.subscription_status}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-syne)', fontWeight: 600, marginBottom: '4px' }}>
                Current Period
              </p>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cream-dim)' }}>1 Mar — 31 Mar 2026</p>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-syne)', fontWeight: 600, marginBottom: '4px' }}>
                Next Renewal
              </p>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cream-dim)' }}>1 April 2026</p>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-syne)', fontWeight: 600, marginBottom: '4px' }}>
                Charity Contribution
              </p>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cream-dim)' }}>
                {u.charity_pct}% ({formatCurrency(Math.floor(plan.price_pence * (u.charity_pct / 100)))}/month)
              </p>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', color: 'var(--cream)', marginBottom: '8px' }}>Manage Billing</h3>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', lineHeight: 1.5 }}>
            Billing portal is available once connected to Stripe. This is a demo account.
          </p>
          <span style={{
            display: 'inline-flex', padding: '9px 20px', borderRadius: '8px',
            border: '1px solid var(--border)', fontSize: '13px',
            color: 'var(--muted)', fontFamily: 'var(--font-syne)', fontWeight: 600,
            cursor: 'not-allowed', opacity: 0.6,
          }}>
            Open Billing Portal →
          </span>
        </div>
      </div>
    );
  }

  // Real user
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).single();
  const subscription = data as Subscription | null;
  const isDelayedStart = subscription?.stripe_price_id === 'price_delayed_start';
  const isSyntheticBilling =
    subscription?.stripe_customer_id.startsWith('cus_free_') ||
    subscription?.stripe_customer_id.startsWith('cus_trial_') ||
    false;
  const plannedContributionPct = subscription
    ? Math.round(subscription.charity_contribution_pct * 100)
    : 0;
  const plan = subscription
    ? {
        ...SUBSCRIPTION_PLANS[subscription.plan_id],
        label:
          subscription.plan_id === 'free'
            ? 'Free Access'
            : isDelayedStart
              ? 'Delayed Start'
              : SUBSCRIPTION_PLANS[subscription.plan_id].label,
        price_display:
          subscription.plan_id === 'free'
            ? '£0 / access'
            : isDelayedStart
              ? 'Access now, choose payment later'
              : SUBSCRIPTION_PLANS[subscription.plan_id].price_display,
      }
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--cream)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Subscription
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Manage your plan and billing.</p>
      </div>

      {subscription && plan ? (
        <>
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--cream)', marginBottom: '4px' }}>
                  {plan.label} Plan
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{plan.price_display}</p>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: '99px', fontSize: '11px',
                fontFamily: 'var(--font-syne)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                background: subscription.status === 'active' ? 'rgba(74,255,107,0.1)' : 'rgba(255,255,255,0.05)',
                color: subscription.status === 'active' ? 'var(--green)' : 'var(--muted)',
                border: `1px solid ${subscription.status === 'active' ? 'rgba(74,255,107,0.2)' : 'var(--border)'}`,
              }}>
                {subscription.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-syne)', fontWeight: 600, marginBottom: '4px' }}>Current Period</p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cream-dim)' }}>
                  {formatDate(subscription.current_period_start, { day: 'numeric', month: 'short' })}{' '}
                  — {formatDate(subscription.current_period_end, { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-syne)', fontWeight: 600, marginBottom: '4px' }}>
                  {subscription.cancel_at_period_end ? 'Cancels On' : 'Next Renewal'}
                </p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cream-dim)' }}>
                  {formatDate(subscription.current_period_end, { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              {subscription.charity_contribution_pct && !isSyntheticBilling && (
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-syne)', fontWeight: 600, marginBottom: '4px' }}>Charity Contribution</p>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cream-dim)' }}>
                    {Math.round(subscription.charity_contribution_pct * 100)}% ({formatCurrency(Math.floor(plan.price_pence * subscription.charity_contribution_pct))}/month)
                  </p>
                </div>
              )}
              {subscription.charity_contribution_pct && isSyntheticBilling && (
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-syne)', fontWeight: 600, marginBottom: '4px' }}>
                    Planned Contribution
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cream-dim)' }}>
                    {plannedContributionPct}% once billing begins
                  </p>
                </div>
              )}
            </div>

            {subscription.cancel_at_period_end && (
              <div style={{ marginTop: '16px', background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '8px', padding: '12px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--gold)' }}>
                  ⚠ Your subscription is set to cancel on{' '}
                  {formatDate(subscription.current_period_end, { day: 'numeric', month: 'long', year: 'numeric' })}.
                  You will retain access until then.
                </p>
              </div>
            )}

            {isDelayedStart && (
              <div style={{ marginTop: '16px', background: 'rgba(74,255,107,0.08)', border: '1px solid rgba(74,255,107,0.2)', borderRadius: '8px', padding: '12px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--green)' }}>
                  Delayed start is active. You can explore the dashboard now and receive one complimentary draw entry before upgrading to a paid plan.
                </p>
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', color: 'var(--cream)', marginBottom: '8px' }}>
              {isSyntheticBilling ? 'Complete Membership' : 'Manage Billing'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', lineHeight: 1.5 }}>
              {isSyntheticBilling
                ? 'Choose a paid plan when you are ready to keep entering future draws and unlock Stripe billing management.'
                : 'Update your payment method, download invoices, or cancel your subscription via the Stripe billing portal.'}
            </p>
            {isSyntheticBilling ? (
              <Link href="/onboarding/subscribe" className="btn btn-primary btn-sm">
                Choose Paid Plan
              </Link>
            ) : (
              <ManageSubscriptionButton />
            )}
          </div>
        </>
      ) : (
        <div style={cardStyle}>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>No active subscription found.</p>
        </div>
      )}
    </div>
  );
}
