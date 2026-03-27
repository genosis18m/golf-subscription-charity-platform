/**
 * Root page at "/".
 * app/page.tsx takes precedence over (public)/page.tsx for the "/" route.
 * We render the full public layout (Navbar + homepage) here directly.
 */

import { Navbar } from '@/components/layout/Navbar';
import HomePage from './(public)/page';
import { getAuthUser } from '@/lib/supabase/server';

export { metadata } from './(public)/page';

export default async function RootPage() {
  const user = await getAuthUser();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isAuthenticated={!!user} />
      <main className="flex-1" id="main-content">
        <HomePage />
      </main>
    </div>
  );
}
