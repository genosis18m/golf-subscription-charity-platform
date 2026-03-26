/**
 * Charities API — GET/POST.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { fetchCharities } from '@/lib/data/charities';

export async function GET() {
  const charities = await fetchCharities();
  return NextResponse.json({ data: charities });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = user.app_metadata?.role as string | undefined;
  if (role !== 'admin' && role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { name, slug, tagline, description, website_url, registration_number, is_active, is_featured } = body;

  if (!name || !slug || !description) {
    return NextResponse.json(
      { error: 'name, slug, and description are required' },
      { status: 422 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('charities')
    .insert({
      name,
      slug,
      tagline: tagline || null,
      description,
      website_url: website_url || null,
      registration_number: registration_number || null,
      is_active: is_active ?? true,
      is_featured: is_featured ?? false,
      total_raised: 0,
      supporter_count: 0,
      gallery_urls: [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
