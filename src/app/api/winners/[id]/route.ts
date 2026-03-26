/**
 * Individual Winner API — PATCH.
 *
 * Admin: verify, reject, or mark a winner as paid.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = user.app_metadata?.role as string | undefined;
  if (role !== 'admin' && role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body: { action: 'verify' | 'reject' | 'mark_paid'; rejection_reason?: string } =
    await request.json();

  const updateMap = {
    verify: {
      status: 'verified',
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    },
    reject: {
      status: 'rejected',
      verified_by: user.id,
      verified_at: new Date().toISOString(),
      rejection_reason: body.rejection_reason ?? 'Verification failed',
    },
    mark_paid: {
      status: 'paid',
      paid_at: new Date().toISOString(),
    },
  };

  const update = updateMap[body.action];
  if (!update) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 422 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('winners')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
