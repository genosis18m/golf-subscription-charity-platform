/**
 * Stripe Billing Portal API — POST.
 *
 * Creates a Stripe Billing Portal session so the user can manage
 * their subscription (cancel, upgrade, update payment method).
 */

import { NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { createBillingPortalSession } from '@/lib/stripe/client';

export async function POST() {
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

  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/subscription`;

  const session = await createBillingPortalSession({
    customerId: subscription.stripe_customer_id,
    returnUrl,
  });

  return NextResponse.json({ data: { url: session.url } });
}
