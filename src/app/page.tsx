/**
 * Root page at "/".
 * We render the homepage directly here and reuse the public-page component.
 */

import { Navbar } from '@/components/layout/Navbar';
import HomePage from './(public)/HomePage';
import { getAuthUser } from '@/lib/supabase/server';

export { homePageMetadata as metadata, revalidate } from './(public)/HomePage';

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
