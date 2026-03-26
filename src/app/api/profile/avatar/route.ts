import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ensureStorageBucket } from '@/lib/storage';

export async function POST(request: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contentType = request.headers.get('content-type') ?? '';
  const admin = createAdminClient();

  if (contentType.includes('application/json')) {
    const { avatar_url } = await request.json();

    if (!avatar_url) {
      return NextResponse.json({ error: 'avatar_url is required' }, { status: 422 });
    }

    const { error } = await admin
      .from('profiles')
      .update({ avatar_url, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: { url: avatar_url } });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file is required' }, { status: 422 });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Use JPG, PNG, WEBP, or AVIF.' }, { status: 422 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large. Maximum 5MB.' }, { status: 422 });
  }

  await ensureStorageBucket('avatars', {
    public: true,
    allowedMimeTypes: allowedTypes,
    fileSizeLimit: '5MB',
  });

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from('avatars').getPublicUrl(path);

  const { error: profileError } = await admin
    .from('profiles')
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('user_id', user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ data: { url: publicUrl } });
}
