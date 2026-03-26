/**
 * Winners API — GET.
 *
 * Returns the authenticated user's winner records (or all winners for admin).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const role = user.app_metadata?.role as string | undefined;
  const isAdmin = role === 'admin' || role === 'super_admin';

  const supabase = await createClient();
  let query = supabase
    .from('winners')
    .select('*, profile:profiles(full_name), draw:draws(title, draw_month)')
    .order('created_at', { ascending: false });

  // Admins can fetch all; members only see their own
  if (!isAdmin) {
    query = query.eq('user_id', user.id);
  }

  const status = searchParams.get('status');
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
