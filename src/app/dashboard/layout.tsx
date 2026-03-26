/**
 * Dashboard Layout — handles both demo and Supabase sessions.
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';
import { getDemoSession, DEMO_COOKIE, DEMO_USERS } from '@/lib/demo-auth';
import type { Profile, Subscription } from '@/types';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ── 1. Check demo session first ───────────────────────────────────────────
  const cookieStore = await cookies();
  const demoSession = getDemoSession(cookieStore.get(DEMO_COOKIE)?.value);

  if (demoSession) {
    const demoProfile: Profile = {
      id: DEMO_USERS.user.id,
      user_id: DEMO_USERS.user.id,
      full_name: DEMO_USERS.user.full_name,
      display_name: null,
      handicap: DEMO_USERS.user.handicap,
      golf_club: DEMO_USERS.user.golf_club,
      avatar_url: null,
      phone: null,
      notification_preferences: {
        email_draw_results: true,
        email_score_reminders: true,
        email_subscription_updates: true,
        sms_enabled: false,
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    return (
      <div className="flex min-h-[100dvh]" style={{ background: 'var(--bg-void)' }}>
        <Sidebar profile={demoProfile} />
        <main className="flex-1 min-w-0 p-6 pb-36 lg:pb-6 overflow-y-auto" id="main-content">
          {children}
        </main>
      </div>
    );
  }

  // ── 2. Supabase session ───────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/dashboard');

  const [profileResult, subscriptionResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .single(),
  ]);

  const profile = profileResult.data as Profile | null;
  const subscription = subscriptionResult.data as Subscription | null;

  if (!profile) redirect('/onboarding/profile');
  if (!subscription) redirect('/onboarding/subscribe');

  return (
    <div className="flex min-h-[100dvh]" style={{ background: 'var(--bg-void)' }}>
      <Sidebar profile={profile} />
      <main className="flex-1 min-w-0 p-6 pb-36 lg:pb-6 overflow-y-auto" id="main-content">
        {children}
      </main>
    </div>
  );
}
