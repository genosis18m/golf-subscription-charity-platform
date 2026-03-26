/**
 * Stripe Billing Portal API — POST.
 *
 * Creates a Stripe Billing Portal session so the user can manage
 * their subscription (cancel, upgrade, update payment method).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { createBillingPortalSession } from '@/lib/stripe/client';

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No billing account found. Please subscribe first.' },
      { status: 404 }
    );
  }

  // Free Tier users do not have a Stripe Billing Portal as they have no payment records
  if (subscription.stripe_customer_id.startsWith('cus_free_')) {
    return NextResponse.json(
      { error: 'You are currently on the Free plan. There is no billing information to manage.' },
      { status: 400 }
    );
  }

  const returnUrl = new URL('/dashboard/subscription', request.url).toString();

  const session = await createBillingPortalSession({
    customerId: subscription.stripe_customer_id,
    returnUrl,
  });

  return NextResponse.json({ data: { url: session.url } });
}
