import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Camera,
  ChevronRight,
  CreditCard,
  Gift,
  HandHeart,
  Lock,
  Medal,
  Target,
} from 'lucide-react';
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
    icon: Bell,
    title: 'Push Notifications',
    description: 'Alerts for draw entries and winner announcements',
    enabled: true,
    action: 'toggle',
  },
  {
    icon: Lock,
    title: 'Privacy Mode',
    description: 'Keep your stats hidden from public leaderboards',
    enabled: false,
    action: 'toggle',
  },
  {
    icon: CreditCard,
    title: 'Payment Methods',
    description: 'Mastercard ending in 4421',
    enabled: false,
    action: 'link',
  },
] as const satisfies ReadonlyArray<{
  icon: LucideIcon;
  title: string;
  description: string;
  enabled: boolean;
  action: 'toggle' | 'link';
}>;

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
    golfClub: string | null;
    charityName: string;
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
    golfClub: DEMO_USERS.user.golf_club,
    charityName: DEMO_USERS.user.charity_name,
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
      const subscription = subscriptionResult.data as (Subscription & { charity?: { name: string } | null }) | null;
      const winners = (winnersResult.data ?? []) as Winner[];

      if (profile) {
        profileData.fullName = profile.full_name;
        profileData.createdAt = profile.created_at;
        profileData.handicap = profile.handicap ?? 0;
        profileData.avatarUrl = profile.avatar_url;
        profileData.golfClub = profile.golf_club;
      }

      profileData.userId = user.id;

      if (subscription) {
        profileData.planId = subscription.plan_id;
        profileData.totalDonated = Math.floor(
          (subscription.plan_id === 'yearly' ? 25000 : 2500) * subscription.charity_contribution_pct
        );
        profileData.charityName = subscription.charity?.name ?? 'Selected charity';
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
  const handicapLabel = profileData.handicap > 0 ? String(profileData.handicap) : 'N/A';

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <section
        className="relative overflow-hidden rounded-[2rem] border p-6 md:p-8"
        style={{
          background:
            'radial-gradient(circle at top left, rgba(74,255,107,0.12), transparent 34%), radial-gradient(circle at right center, rgba(245,166,35,0.08), transparent 28%), var(--bg-card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
          <div className="relative mx-auto w-fit lg:mx-0">
            <div
              className="absolute inset-0 scale-90 rounded-full"
              style={{ background: 'var(--green-muted)', filter: 'blur(38px)' }}
            />
            <div
              className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 shadow-2xl md:h-48 md:w-48"
              style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-void)' }}
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
              className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full border shadow-lg"
              style={{
                background: 'rgba(7,9,10,0.92)',
                color: 'var(--green)',
                borderColor: 'rgba(74,255,107,0.22)',
              }}
            >
              <Camera size={18} strokeWidth={2.1} aria-hidden="true" />
            </div>
          </div>

          <div className="space-y-5 text-center lg:text-left">
            <div className="space-y-3">
              <p
                className="text-[11px] font-bold uppercase tracking-[0.28em]"
                style={{ color: 'var(--muted)' }}
              >
                Member Profile
              </p>
              <h1 className="display-heading text-4xl leading-none md:text-5xl">
                {profileData.fullName}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <span
                  className="rounded-full px-4 py-1.5 text-sm font-bold"
                  style={{
                    background: 'var(--gold-muted)',
                    color: 'var(--gold)',
                    border: '1px solid rgba(245,166,35,0.18)',
                  }}
                >
                  {memberTier}
                </span>
                <span
                  className="rounded-full px-4 py-1.5 text-sm font-semibold"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--cream-dim)',
                    border: '1px solid var(--border)',
                  }}
                >
                  Joined {joinDate}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <span
                className="rounded-full px-4 py-2 text-sm"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--cream)' }}
              >
                Supporting {profileData.charityName}
              </span>
              <span
                className="rounded-full px-4 py-2 text-sm"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--cream)' }}
              >
                {profileData.golfClub ?? 'Home club not set'}
              </span>
            </div>

            <p className="max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--cream-dim)' }}>
              Keep your profile current, refresh your avatar, and stay on top of your draw activity from one clean member hub.
            </p>

            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <a href="#profile-settings" className="btn btn-primary btn-sm rounded-full font-bold">
                Manage Preferences
              </a>
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--cream)',
                  border: '1px solid var(--border)',
                }}
              >
                <Medal size={15} strokeWidth={2.1} aria-hidden="true" style={{ color: 'var(--gold)' }} />
                {profileData.winsCount} paid wins
              </div>
            </div>
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

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
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
            <Medal size={28} strokeWidth={2.1} aria-hidden="true" style={{ color: 'var(--gold)' }} />
          </div>
          <div className="mt-4">
            <p className="text-4xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
              {profileData.winsCount}
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--gold)' }}>
              {formatCurrency(profileData.totalWinnings)} confirmed payouts
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
            <HandHeart size={28} strokeWidth={2.1} aria-hidden="true" style={{ color: 'var(--green)' }} />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
              {formatCurrency(profileData.totalDonated)}
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--cream-dim)' }}>
              Current cycle support for {profileData.charityName}
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
            <Target size={28} strokeWidth={2.1} aria-hidden="true" style={{ color: 'var(--green)' }} />
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
                {handicapLabel}
              </span>
            </div>
            <div className="text-right">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                Home Club
              </p>
              <p className="max-w-[170px] text-lg font-bold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {profileData.golfClub ?? 'Add your club'}
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
                <Gift size={14} strokeWidth={2.1} aria-hidden="true" />
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
          {preferenceItems.map((item) => {
            const Icon = item.icon;

            return (
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
                    <Icon size={18} strokeWidth={2.1} aria-hidden="true" style={{ color: 'var(--muted)' }} />
                  </div>
                  <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {item.description}
                    </p>
                  </div>
                </div>

                {item.action === 'link' ? (
                  <ChevronRight
                    size={18}
                    strokeWidth={2.1}
                    className="opacity-50 transition-transform group-hover:translate-x-1"
                    style={{ color: 'var(--muted)' }}
                    aria-hidden="true"
                  />
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
            );
          })}

          <LogoutButton />
        </div>
      </section>
    </div>
  );
}
