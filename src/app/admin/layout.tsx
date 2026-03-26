/**
 * Admin Layout — dark design, supports demo admin session.
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getDemoSession, DEMO_COOKIE, DEMO_USERS } from '@/lib/demo-auth';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import type { Profile } from '@/types';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Check demo session first
  const cookieStore = await cookies();
  const demoSession = getDemoSession(cookieStore.get(DEMO_COOKIE)?.value);

  if (demoSession) {
    if (demoSession.role !== 'admin') {
      redirect('/dashboard');
    }
    const demoProfile: Profile = {
      id: demoSession.userId,
      user_id: demoSession.userId,
      full_name: demoSession.name,
      display_name: null,
      handicap: null,
      golf_club: null,
      phone: null,
      avatar_url: null,
      notification_preferences: { email_draw_results: true, email_score_reminders: false, email_subscription_updates: true, sms_enabled: false },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)' }}>
        <AdminSidebar profile={demoProfile} />
        <main style={{ flex: 1, minWidth: 0, padding: '28px', color: 'var(--cream)' }} id="main-content">
          {children}
        </main>
      </div>
    );
  }

  // Supabase auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/admin');

  const role = user.app_metadata?.role as string | undefined;
  if (role !== 'admin' && role !== 'super_admin') redirect('/dashboard');

  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)' }}>
      <AdminSidebar profile={profile as Profile | null} />
      <main style={{ flex: 1, minWidth: 0, padding: '28px', color: 'var(--cream)' }} id="main-content">
        {children}
      </main>
    </div>
  );
}
