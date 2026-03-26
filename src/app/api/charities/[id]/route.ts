/**
 * Individual Charity API — GET/PATCH/DELETE.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';

interface Params { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('charities')
    .select('*, events:charity_events(*)')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: 'Charity not found' }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = user.app_metadata?.role as string | undefined;
  if (role !== 'admin' && role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('charities')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = user.app_metadata?.role as string | undefined;
  if (role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super admins can delete charities' }, { status: 403 });
  }

  const supabase = await createClient();
  // Soft delete: mark inactive rather than hard delete
  const { error } = await supabase
    .from('charities')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { deleted: true } });
}
