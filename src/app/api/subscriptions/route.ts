/**
 * Subscriptions API — GET/POST.
 *
 * GET: Returns the current user's subscription status.
 * POST: Creates a Stripe Checkout session for a new subscription.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createCheckoutSession, createStripeCustomer } from '@/lib/stripe/client';
import { sendSubscriptionEmail } from '@/lib/email';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, charity:charities(id, name, logo_url)')
    .eq('user_id', user.id)
    .single();

  if (error) return NextResponse.json({ data: null });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { price_id, charity_id, charity_contribution_pct, success_url, cancel_url } = body;

  if (!price_id || !success_url || !cancel_url) {
    return NextResponse.json(
      { error: 'price_id, success_url, and cancel_url are required' },
      { status: 422 }
    );
  }

  const supabase = await createClient();
  const admin = createAdminClient();

  if (price_id === 'price_free') {
    const { error: upsertError } = await admin.from('subscriptions').upsert({
      user_id: user.id,
      plan_id: 'free',
      status: 'active',
      stripe_subscription_id: 'sub_free_' + user.id,
      stripe_customer_id: 'cus_free_' + user.id,
      stripe_price_id: 'price_free',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 100 years
      charity_id: charity_id || null,
      charity_contribution_pct: 0,
    }, { onConflict: 'user_id' });

    if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 });
    if (user.email) {
      sendSubscriptionEmail({
        to: user.email,
        fullName: typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null,
        planLabel: 'Free',
      }).catch((emailError) => {
        console.error('Free membership email error:', emailError);
      });
    }
    return NextResponse.json({ data: { url: success_url } }); // Returns the success URL so frontend routes seamlessly
  }

  // Check if a Stripe customer already exists for this user
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  let customerId: string | undefined = existingSub?.stripe_customer_id;

  if (!customerId) {
    const {
      data: { user: authUser },
    } = await admin.auth.admin.getUserById(user.id);
    const profile = await supabase.from('profiles').select('full_name').eq('user_id', user.id).single();

    const customer = await createStripeCustomer({
      email: authUser?.email ?? user.email ?? '',
      name: profile.data?.full_name ?? '',
      userId: user.id,
    });
    customerId = customer.id;
  }

  const session = await createCheckoutSession({
    customerId,
    priceId: price_id,
    successUrl: success_url,
    cancelUrl: cancel_url,
    metadata: {
      platform_user_id: user.id,
      charity_id: charity_id ?? '',
      charity_contribution_pct: String(charity_contribution_pct ?? 0.15),
    },
  });

  return NextResponse.json({ data: { url: session.url } });
}
