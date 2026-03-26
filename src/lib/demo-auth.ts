/**
 * Demo auth — cookie-based mock session for local dev / demos.
 * Works completely without Supabase credentials.
 *
 * Credentials:
 *   User:  demo@golfcharity.com  /  Demo1234!
 *   Admin: admin@golfcharity.com /  Admin1234!
 */

export const DEMO_COOKIE = 'gcc_demo_session';

export const DEMO_USERS = {
  user: {
    id:    'demo-user-001',
    email: 'demo@golfcharity.com',
    password: 'Demo1234!',
    role:  'member',
    full_name: 'Alex Demo',
    golf_club: 'Sunningdale Golf Club',
    handicap: 12,
    subscription_status: 'active',
    charity_id: 'c1',
    charity_name: 'Cancer Research UK',
    charity_pct: 15,
    scores: [
      { id: 's1', gross_score: 34, round_date: '2026-03-20', course_name: 'Sunningdale Old' },
      { id: 's2', gross_score: 28, round_date: '2026-03-12', course_name: 'Sunningdale New' },
      { id: 's3', gross_score: 31, round_date: '2026-03-05', course_name: 'Wentworth East' },
      { id: 's4', gross_score: 25, round_date: '2026-02-22', course_name: 'Sunningdale Old' },
      { id: 's5', gross_score: 38, round_date: '2026-02-14', course_name: 'Camberley Heath' },
    ],
    total_winnings: 24500,
    draws_entered: 8,
    total_donated: 7800,
  },
  admin: {
    id:    'demo-admin-001',
    email: 'admin@golfcharity.com',
    password: 'Admin1234!',
    role:  'admin',
    full_name: 'Admin User',
  },
} as const;

export type DemoRole = 'user' | 'admin';

export interface DemoSession {
  userId: string;
  email:  string;
  role:   string;
  name:   string;
}

export function getDemoSession(cookieValue: string | undefined): DemoSession | null {
  if (!cookieValue) return null;
  try {
    return JSON.parse(Buffer.from(cookieValue, 'base64').toString('utf-8')) as DemoSession;
  } catch {
    return null;
  }
}

export function encodeDemoSession(session: DemoSession): string {
  return Buffer.from(JSON.stringify(session)).toString('base64');
}

export function validateDemoCredentials(email: string, password: string): DemoSession | null {
  const trimmed = email.trim().toLowerCase();
  if (trimmed === DEMO_USERS.user.email && password === DEMO_USERS.user.password) {
    return { userId: DEMO_USERS.user.id, email: DEMO_USERS.user.email, role: 'member', name: DEMO_USERS.user.full_name };
  }
  if (trimmed === DEMO_USERS.admin.email && password === DEMO_USERS.admin.password) {
    return { userId: DEMO_USERS.admin.id, email: DEMO_USERS.admin.email, role: 'admin', name: DEMO_USERS.admin.full_name };
  }
  return null;
}
