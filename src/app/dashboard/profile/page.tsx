import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getDemoSession, DEMO_COOKIE, DEMO_USERS } from '@/lib/demo-auth';
import { DRAW_DEFAULT_DAY } from '@/constants';
import { DrawCountdown } from '@/components/dashboard/DrawCountdown';
import { AvatarUploader } from '@/components/profile/AvatarUploader';
import { LogoutButton } from '@/components/profile/LogoutButton';
import { formatCurrency } from '@/lib/utils';
import type { Profile, Subscription, Winner } from '@/types';

export const metadata: Metadata = { title: 'Member Profile' };

const preferenceItems = [
  {
    icon: 'notifications',
    title: 'Push Notifications',
    description: 'Alerts for draw entries and winner announcements',
    enabled: true,
  },
  {
    icon: 'lock',
    title: 'Privacy Mode',
    description: 'Keep your stats hidden from public leaderboards',
    enabled: false,
  },
  {
    icon: 'credit_card',
    title: 'Payment Methods',
    description: 'Mastercard ending in 4421',
    enabled: false,
  },
] as const;

function getNextDrawDate() {
  const now = new Date();
  const nextDraw = new Date(now.getFullYear(), now.getMonth(), DRAW_DEFAULT_DAY, 18, 0, 0);

  if (nextDraw <= now) {
    nextDraw.setMonth(nextDraw.getMonth() + 1);
  }

  return nextDraw.toISOString();
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const demoSession = getDemoSession(cookieStore.get(DEMO_COOKIE)?.value);

  const profileData: {
    fullName: string;
    createdAt: string;
    planId: string;
    totalWinnings: number;
    totalDonated: number;
    handicap: number;
    winsCount: number;
    avatarUrl: string | null;
    userId: string;
  } = {
    fullName: demoSession ? demoSession.name : DEMO_USERS.user.full_name,
    createdAt: '2023-08-15T00:00:00Z',
    planId: 'yearly',
    totalWinnings: DEMO_USERS.user.total_winnings,
    totalDonated: DEMO_USERS.user.total_donated,
    handicap: DEMO_USERS.user.handicap,
    winsCount: 4,
    avatarUrl: null,
    userId: demoSession ? demoSession.userId : 'demo-user-id',
  };

  if (!demoSession) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const [profileResult, subscriptionResult, winnersResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase
          .from('subscriptions')
          .select('*, charity:charities(name)')
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing'])
          .single(),
        supabase.from('winners').select('*').eq('user_id', user.id).eq('status', 'paid'),
      ]);

      const profile = profileResult.data as Profile | null;
      const subscription = subscriptionResult.data as Subscription | null;
      const winners = (winnersResult.data ?? []) as Winner[];

      if (profile) {
        profileData.fullName = profile.full_name;
        profileData.createdAt = profile.created_at;
        profileData.handicap = profile.handicap ?? 0;
        profileData.avatarUrl = profile.avatar_url;
      }

      profileData.userId = user.id;

      if (subscription) {
        profileData.planId = subscription.plan_id;
        const monthsActive = Math.ceil(
          (Date.now() - new Date(subscription.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
        );

        profileData.totalDonated =
          Math.floor(2500 * subscription.charity_contribution_pct) * Math.max(1, monthsActive);
      }

      profileData.winsCount = winners.length;
      profileData.totalWinnings = winners.reduce((sum, winner) => sum + winner.prize_amount, 0);
    }
  }

  const initials = profileData.fullName
    .split(' ')
    .map((name) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const joinDate = new Date(profileData.createdAt).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
  const memberTier = profileData.planId === 'yearly' ? 'Eagle Member' : 'Member';
  const nextDrawDate = getNextDrawDate();
  const drawMonth = new Date(nextDrawDate).toLocaleDateString('en-GB', { month: 'long' });

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-12">
      <section className="flex flex-col gap-8 md:flex-row md:items-end">
        <div className="relative group">
          <div
            className="absolute inset-0 scale-75 rounded-full transition-transform group-hover:scale-100"
            style={{ background: 'var(--green-muted)', filter: 'blur(30px)' }}
          />
          <div
            className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 shadow-2xl md:h-48 md:w-48"
            style={{ borderColor: 'var(--bg-card)', background: 'var(--bg-card)' }}
          >
            {profileData.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profileData.avatarUrl} alt="Member avatar" className="h-full w-full object-cover" />
            ) : (
              <span
                style={{ fontSize: '4rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--green)' }}
              >
                {initials}
              </span>
            )}
          </div>
          <div
            className="absolute bottom-2 right-2 rounded-full p-2 shadow-lg"
            style={{ background: 'var(--green)', color: 'var(--bg-void)' }}
          >
            <span className="material-symbols-outlined text-base">photo_camera</span>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="display-heading mb-2 text-4xl uppercase leading-tight md:text-6xl">
            Member Profile
          </h1>

          <div className="mt-2 flex flex-col items-center gap-3 md:flex-row">
            <span className="serif-accent text-2xl md:text-3xl" style={{ color: 'var(--gold)' }}>
              {memberTier}
            </span>
            <span
              className="hidden h-1 w-1 rounded-full md:block"
              style={{ background: 'var(--border-mid)' }}
            />
            <span
              style={{
                color: 'var(--muted)',
                fontSize: '14px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Joined {joinDate}
            </span>
          </div>

          <div className="mt-6">
            <a href="#profile-settings" className="btn btn-primary btn-sm rounded-full font-bold">
              Manage Preferences
            </a>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Avatar & Profile
        </h2>
        <AvatarUploader
          userId={profileData.userId}
          initialAvatarUrl={profileData.avatarUrl}
          isDemo={Boolean(demoSession)}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <article className="glass-card relative flex min-h-[160px] flex-col justify-between rounded-[1rem] p-8">
          <div className="flex items-start justify-between">
            <span
              style={{
                color: 'var(--muted)',
                fontSize: '12px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              Wins
            </span>
            <span className="material-symbols-outlined text-[28px]" style={{ color: 'var(--gold)' }}>
              emoji_events
            </span>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
              {profileData.winsCount}
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--gold)' }}>
              Paid results confirmed
            </p>
          </div>
        </article>

        <article className="glass-card flex min-h-[160px] flex-col justify-between rounded-[1rem] p-8">
          <div className="flex items-start justify-between">
            <span
              style={{
                color: 'var(--muted)',
                fontSize: '12px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              Charity Impact
            </span>
            <span className="material-symbols-outlined text-[28px]" style={{ color: 'var(--green)' }}>
              volunteer_activism
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
              {formatCurrency(profileData.totalDonated)}
            </p>
            <div
              className="mt-4 h-1.5 w-full overflow-hidden rounded-full"
              style={{ background: 'var(--border)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (profileData.totalDonated / 10000) * 100)}%`,
                  background: 'var(--green)',
                }}
              />
            </div>
          </div>
        </article>

        <article className="glass-card flex min-h-[160px] flex-col justify-between rounded-[1rem] p-8">
          <div className="flex items-start justify-between">
            <span
              style={{
                color: 'var(--muted)',
                fontSize: '12px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              Handicap
            </span>
            <span className="material-symbols-outlined text-[28px]" style={{ color: 'var(--green)' }}>
              golf_course
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full border-2"
              style={{
                background: 'var(--bg-void)',
                borderColor: 'var(--border-bright)',
                boxShadow: 'var(--green-glow)',
              }}
            >
              <span className="text-2xl font-black" style={{ color: 'var(--green)' }}>
                {profileData.handicap}
              </span>
            </div>
            <div className="text-right">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                Positioning
              </p>
              <p className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                Top 15%
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <div className="shimmer-gold glass-card rounded-lg p-1">
          <div
            className="flex h-full flex-col justify-between gap-8 rounded-[1.8rem] border p-8 md:p-12"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-mid)' }}
          >
            <div className="space-y-4 text-center md:text-left">
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
                style={{
                  background: 'var(--gold-muted)',
                  color: 'var(--gold)',
                  borderColor: 'rgba(245,166,35,0.2)',
                }}
              >
                <span className="material-symbols-outlined text-sm">redeem</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Active Draw</span>
              </div>
              <h2 className="text-2xl font-black leading-tight md:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
                Entered in {drawMonth} Monthly Draw
              </h2>
              <p style={{ color: 'var(--cream-dim)' }}>
                Your entry is confirmed. The main draw will take place on the {DRAW_DEFAULT_DAY}th.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
              <div className="text-center md:text-left">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--muted)' }}>
                  Draw Prize
                </p>
                <p className="text-3xl serif-accent" style={{ color: 'var(--gold)' }}>
                  Jackpot Pending
                </p>
              </div>
              <button className="btn btn-primary w-full shadow-xl md:w-auto">View Ticket</button>
            </div>
          </div>
        </div>

        <DrawCountdown nextDrawDate={nextDrawDate} drawTitle={`${drawMonth} Monthly Draw`} />
      </section>

      <section id="profile-settings" className="grid grid-cols-1 gap-12 pt-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Account Preferences
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--cream-dim)' }}>
            Adjust your global settings, notification preferences, and privacy controls to tailor
            your clubhouse experience.
          </p>
        </div>

        <div className="space-y-4 lg:col-span-8">
          {preferenceItems.map((item, index) => (
            <div
              key={item.title}
              className="group flex cursor-pointer items-center justify-between rounded-2xl p-6 transition-colors hover:bg-[var(--bg-card)]"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid transparent' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ background: 'var(--bg-void)' }}
                >
                  <span className="material-symbols-outlined" style={{ color: 'var(--muted)' }}>
                    {item.icon}
                  </span>
                </div>
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {item.description}
                  </p>
                </div>
              </div>

              {index === 2 ? (
                <span
                  className="material-symbols-outlined opacity-50 transition-transform group-hover:translate-x-1"
                  style={{ color: 'var(--muted)' }}
                >
                  chevron_right
                </span>
              ) : (
                <div
                  className="relative h-6 w-12 rounded-full p-1"
                  style={{ background: item.enabled ? 'var(--green-muted)' : 'var(--bg-void)' }}
                >
                  <div
                    className="absolute h-4 w-4 rounded-full"
                    style={{
                      background: item.enabled ? 'var(--green)' : 'var(--muted)',
                      right: item.enabled ? '4px' : 'auto',
                      left: item.enabled ? 'auto' : '4px',
                    }}
                  />
                </div>
              )}
            </div>
          ))}

          <LogoutButton />
        </div>
      </section>
    </div>
  );
}
