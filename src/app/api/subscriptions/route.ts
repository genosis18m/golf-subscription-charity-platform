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

const FREE_PRICE_ID = 'price_free';
const DELAYED_START_PRICE_ID = 'price_delayed_start';

function isSyntheticCustomerId(customerId?: string | null) {
  return Boolean(
    customerId &&
      (customerId.startsWith('cus_free_') || customerId.startsWith('cus_trial_'))
  );
}

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

  if (price_id === FREE_PRICE_ID || price_id === DELAYED_START_PRICE_ID) {
    const isDelayedStart = price_id === DELAYED_START_PRICE_ID;
    const now = new Date();
    const normalizedContributionPct = Number(charity_contribution_pct ?? 0.15);
    const periodEnd = new Date(
      now.getTime() + (isDelayedStart ? 14 : 36500) * 24 * 60 * 60 * 1000
    );

    if (isDelayedStart && !charity_id) {
      return NextResponse.json(
        { error: 'Choose a charity before starting delayed access.' },
        { status: 422 }
      );
    }

    const { error: upsertError } = await admin.from('subscriptions').upsert({
      user_id: user.id,
      plan_id: isDelayedStart ? 'monthly' : 'free',
      status: isDelayedStart ? 'trialing' : 'active',
      stripe_subscription_id: `${isDelayedStart ? 'sub_trial_' : 'sub_free_'}${user.id}`,
      stripe_customer_id: `${isDelayedStart ? 'cus_trial_' : 'cus_free_'}${user.id}`,
      stripe_price_id: price_id,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      charity_id: charity_id || null,
      charity_contribution_pct: isDelayedStart ? normalizedContributionPct : 0,
      cancel_at_period_end: false,
      canceled_at: null,
      trial_end: isDelayedStart ? periodEnd.toISOString() : null,
      updated_at: now.toISOString(),
    }, { onConflict: 'user_id' });

    if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 });
    if (user.email) {
      sendSubscriptionEmail({
        to: user.email,
        fullName: typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null,
        planLabel: isDelayedStart ? 'Delayed Start' : 'Free',
      }).catch((emailError) => {
        console.error('Complimentary access email error:', emailError);
      });
    }
    return NextResponse.json({ data: { url: success_url } });
  }

  // Check if a Stripe customer already exists for this user
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  let customerId: string | undefined = existingSub?.stripe_customer_id;
  if (isSyntheticCustomerId(customerId)) {
    customerId = undefined;
  }

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
