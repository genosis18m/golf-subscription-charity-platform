/**
 * Public Layout — wraps all public pages (/charities, /how-it-works, etc.)
 * with Navbar and Footer. "/" itself is handled by app/page.tsx directly.
 */

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getAuthUser } from '@/lib/supabase/server';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isAuthenticated={!!user} />
      <main className="flex-1" id="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}
