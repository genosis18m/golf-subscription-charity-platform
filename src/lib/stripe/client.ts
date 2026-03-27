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

let stripeClient: Stripe | null = null;

/**
 * Returns a lazily-created Stripe client.
 *
 * Delayed-start and complimentary-access flows do not require Stripe, so we
 * avoid throwing at module import time when the secret key is absent.
 */
export function getStripeClient() {
  if (stripeClient) {
    return stripeClient;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error(
      'Missing STRIPE_SECRET_KEY environment variable. ' +
      'Add it to .env.local and never commit it to source control.'
    );
  }

  stripeClient = new Stripe(stripeSecretKey, {
    apiVersion: '2026-02-25.clover',
    typescript: true,
    appInfo: {
      name: 'GOLF-Fego',
      version: '1.0.0',
    },
  });

  return stripeClient;
}

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
  const stripe = getStripeClient();
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
  const stripe = getStripeClient();
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Retrieves an existing Stripe customer by ID.
 */
export async function getStripeCustomer(customerId: string) {
  const stripe = getStripeClient();
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
  const stripe = getStripeClient();
  return stripe.customers.create({
    email,
    name,
    metadata: { platform_user_id: userId },
  });
}
