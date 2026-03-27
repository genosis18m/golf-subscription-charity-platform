/**
 * Stripe Webhook Event Handlers.
 *
 * Each handler receives a verified Stripe event and updates the Supabase
 * database accordingly. All handlers are idempotent — re-processing the
 * same event should not corrupt state (Stripe may deliver events more than once).
 *
 * Webhook signature verification happens in `app/api/webhooks/stripe/route.ts`
 * before these handlers are called.
 */

import type Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendSubscriptionEmail } from '@/lib/email';
import type { SubscriptionStatus, SubscriptionPlanId } from '@/types';

// ─── Type Helpers ─────────────────────────────────────────────────────────────

function mapStripeStatus(status: Stripe.Subscription['status']): SubscriptionStatus {
  const map: Record<string, SubscriptionStatus> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'unpaid',
    incomplete: 'incomplete',
    incomplete_expired: 'canceled',
    paused: 'canceled',
  };
  return map[status] ?? 'canceled';
}

function getPlanIdFromPriceId(priceId: string): SubscriptionPlanId {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID) return 'yearly';
  return 'monthly';
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

/**
 * Fired when a new subscription is created (after successful payment).
 * Upserts the subscription record in Supabase.
 */
export async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const supabase = createAdminClient();
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0].price.id;
  const userId = subscription.metadata?.platform_user_id;

  if (!userId) {
    console.error('Stripe subscription missing platform_user_id metadata', subscription.id);
    return;
  }

  await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      plan_id: getPlanIdFromPriceId(priceId),
      status: mapStripeStatus(subscription.status),
      current_period_start: new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_end: (subscription as unknown as { trial_end: number | null }).trial_end
        ? new Date((subscription as unknown as { trial_end: number }).trial_end * 1000).toISOString()
        : null,
    },
    { onConflict: 'user_id' }
  );

  const [{ data: authLookup }, { data: profile }] = await Promise.all([
    supabase.auth.admin.getUserById(userId),
    supabase.from('profiles').select('full_name').eq('user_id', userId).maybeSingle(),
  ]);

  if (authLookup.user?.email) {
    sendSubscriptionEmail({
      to: authLookup.user.email,
      fullName: profile?.full_name ?? null,
      planLabel: getPlanIdFromPriceId(priceId) === 'yearly' ? 'Annual' : 'Monthly',
    }).catch((emailError) => {
      console.error('Subscription email error:', emailError);
    });
  }
}

/**
 * Fired when a subscription is updated (plan change, status change, etc.).
 * Updates the existing subscription record.
 */
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = createAdminClient();
  const priceId = subscription.items.data[0].price.id;

  await supabase
    .from('subscriptions')
    .update({
      stripe_price_id: priceId,
      plan_id: getPlanIdFromPriceId(priceId),
      status: mapStripeStatus(subscription.status),
      current_period_start: new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: (subscription as unknown as { canceled_at: number | null }).canceled_at
        ? new Date((subscription as unknown as { canceled_at: number }).canceled_at * 1000).toISOString()
        : null,
      trial_end: (subscription as unknown as { trial_end: number | null }).trial_end
        ? new Date((subscription as unknown as { trial_end: number }).trial_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

/**
 * Fired when a subscription is canceled (immediately or at period end).
 * Marks the subscription as canceled in Supabase.
 */
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = createAdminClient();

  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

/**
 * Fired when a payment succeeds. Can be used to reset failed payment flags
 * or trigger "welcome back" notifications.
 */
export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // If the invoice is for a subscription, the subscription.updated event
  // will handle the status change. This handler can be used for side effects
  // like sending a receipt notification.
  console.log('Payment succeeded for invoice:', invoice.id);
}

/**
 * Fired when a payment fails. Can be used to send payment failure notifications
 * or trigger dunning email sequences.
 */
export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.error('Payment failed for invoice:', invoice.id, '— customer:', invoice.customer);
  // In production: trigger dunning notification via email/SMS
}
