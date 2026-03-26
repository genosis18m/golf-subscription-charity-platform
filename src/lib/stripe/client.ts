/**
 * Stripe server-side client.
 *
 * The Stripe SDK is only ever instantiated server-side (Route Handlers,
 * Server Actions). The secret key must NEVER be exposed to the browser.
 *
 * For client-side Stripe.js (e.g., Elements), use `@stripe/stripe-js`
 * directly in components with the publishable key.
 */

import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error(
    'Missing STRIPE_SECRET_KEY environment variable. ' +
    'Add it to .env.local and never commit it to source control.'
  );
}

/**
 * Singleton Stripe instance configured for the current API version.
 * Import this wherever you need server-side Stripe operations.
 *
 * @example
 * ```ts
 * import { stripe } from '@/lib/stripe/client'
 *
 * const session = await stripe.checkout.sessions.create({ ... })
 * ```
 */
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
  appInfo: {
    name: 'Golf Charity Subscription Platform',
    version: '1.0.0',
  },
});

/**
 * Creates a Stripe Checkout session for the given plan.
 * Redirects the user to Stripe's hosted checkout page.
 */
export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  metadata = {},
}: {
  customerId?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    subscription_data: { metadata },
    allow_promotion_codes: true,
  });
}

/**
 * Creates a Stripe Billing Portal session so users can manage their
 * subscription (cancel, upgrade, update payment method) directly.
 */
export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Retrieves an existing Stripe customer by ID.
 */
export async function getStripeCustomer(customerId: string) {
  return stripe.customers.retrieve(customerId);
}

/**
 * Creates a new Stripe customer record linked to a platform user.
 */
export async function createStripeCustomer({
  email,
  name,
  userId,
}: {
  email: string;
  name: string;
  userId: string;
}) {
  return stripe.customers.create({
    email,
    name,
    metadata: { platform_user_id: userId },
  });
}
