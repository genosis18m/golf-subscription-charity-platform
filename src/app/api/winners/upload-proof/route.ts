/**
 * Winner Proof Upload API — POST.
 *
 * Receives a multipart file upload and stores it in Supabase Storage
 * under the `winner-proofs` bucket, then updates the winner record.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const winnerId = formData.get('winner_id') as string | null;

  if (!file || !winnerId) {
    return NextResponse.json({ error: 'file and winner_id are required' }, { status: 422 });
  }

  // Validate file type and size
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Use JPG, PNG, WEBP, or PDF.' }, { status: 422 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large. Maximum 5MB.' }, { status: 422 });
  }

  const supabase = await createClient();

  // Verify this winner belongs to the authenticated user
  const { data: winner } = await supabase
    .from('winners')
    .select('id, user_id, status')
    .eq('id', winnerId)
    .single();

  if (!winner || winner.user_id !== user.id) {
    return NextResponse.json({ error: 'Winner not found or access denied' }, { status: 403 });
  }

  if (winner.status !== 'pending') {
    return NextResponse.json(
      { error: `Cannot upload proof for a winner with status "${winner.status}"` },
      { status: 409 }
    );
  }

  // Upload to Supabase Storage
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${user.id}/${winnerId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('winner-proofs')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('winner-proofs')
    .getPublicUrl(path);

  // Update winner record with proof URL
  await supabase
    .from('winners')
    .update({ proof_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', winnerId);

  return NextResponse.json({ data: { url: publicUrl } });
}
