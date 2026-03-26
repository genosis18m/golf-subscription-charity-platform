/**
 * Admin: Edit Charity (/admin/charities/[id]).
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import EditCharityClient from './EditCharityClient';
import type { Charity } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: 'Edit Charity — Admin' };

export default async function EditCharityPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('charities')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) notFound();

  return <EditCharityClient charity={data as Charity} />;
}
