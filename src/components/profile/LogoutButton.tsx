'use client';

import { createClient } from '@/lib/supabase/client';

export function LogoutButton() {
  async function handleSignOut() {
    const supabase = createClient();

    await Promise.allSettled([
      supabase.auth.signOut(),
      fetch('/api/auth/demo', { method: 'DELETE' }),
    ]);

    // Hard redirect so the server re-reads the cleared demo cookie immediately.
    window.location.href = '/';
  }

  return (
    <button
      onClick={handleSignOut}
      className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-transparent p-6 text-left transition-colors hover:border-red-900/30 hover:bg-[rgba(255,0,0,0.1)]"
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full text-red-500"
          style={{ background: 'var(--bg-void)' }}
        >
          <span className="material-symbols-outlined">logout</span>
        </div>
        <div>
          <p className="font-bold text-red-500">Sign Out</p>
          <p className="text-xs text-red-500/60">End your current session</p>
        </div>
      </div>
      <span className="material-symbols-outlined text-red-500/70 transition-transform group-hover:translate-x-1">
        chevron_right
      </span>
    </button>
  );
}
