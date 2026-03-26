/**
 * Server-side demo session helper.
 * Uses next/headers (Node.js runtime only — do NOT import in middleware/Edge).
 */

import { cookies } from 'next/headers';
import { getDemoSession, DEMO_COOKIE, DEMO_USERS } from './demo-auth';
import type { DemoSession } from './demo-auth';

export async function getServerDemoSession(): Promise<DemoSession | null> {
  const cookieStore = await cookies();
  return getDemoSession(cookieStore.get(DEMO_COOKIE)?.value);
}

export { DEMO_USERS };
