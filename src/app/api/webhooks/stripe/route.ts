/**
 * Stripe Webhook Handler — POST.
 *
 * Receives Stripe webhook events, verifies the signature, and dispatches
 * to the appropriate handler in lib/stripe/webhooks.ts.
 *
 * IMPORTANT: This route must NOT parse the request body before verifying
 * the Stripe signature — use the raw body from `request.text()`.
 *
 * Set up in Stripe Dashboard: Developers → Webhooks → Add endpoint
 * URL: https://yourdomain.com/api/webhooks/stripe
 *
 * Events to subscribe:
 *  - customer.subscription.created
 *  - customer.subscription.updated
 *  - customer.subscription.deleted
 *  - invoice.payment_succeeded
 *  - invoice.payment_failed
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe/client';
import {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
} from '@/lib/stripe/webhooks';
import type Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signature verification failed';
    console.error('Stripe webhook signature verification failed:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // Dispatch to event-specific handlers
  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        // Log unhandled event types for future implementation
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
  } catch (handlerError) {
    console.error(`Error processing Stripe event ${event.type}:`, handlerError);
    // Return 200 even on handler errors to prevent Stripe from retrying
    // Log to error tracking service in production
    return NextResponse.json({ received: true, warning: 'Handler error logged' });
  }

  return NextResponse.json({ received: true });
}
