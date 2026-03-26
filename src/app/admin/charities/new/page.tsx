'use client';

/**
 * Admin: New Charity (/admin/charities/new).
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { slugify } from '@/lib/utils';
import type { CharityFormValues } from '@/types';

export default function NewCharityPage() {
  const router = useRouter();
  const [values, setValues] = useState<CharityFormValues>({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    website_url: '',
    registration_number: '',
    is_active: true,
    is_featured: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(name: string) {
    setValues((v) => ({ ...v, name, slug: slugify(name) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name || !values.description) {
      setError('Name and description are required.');
      return;
    }
    setIsLoading(true);
    const res = await fetch('/api/charities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? 'Failed to create charity');
      setIsLoading(false);
      return;
    }
    const { data } = await res.json();
    router.push(`/admin/charities/${data.id}`);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Add Charity</h1>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input label="Charity Name" type="text" value={values.name} onChange={(e) => handleNameChange(e.target.value)} required />
          <Input label="URL Slug" type="text" value={values.slug} onChange={(e) => setValues((v) => ({ ...v, slug: e.target.value }))} helperText="Used in the URL: /charities/[slug]" required />
          <Input label="Tagline" type="text" value={values.tagline} onChange={(e) => setValues((v) => ({ ...v, tagline: e.target.value }))} placeholder="Short one-liner" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Description <span className="text-red-500">*</span></label>
            <textarea
              rows={5}
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
              required
            />
          </div>
          <Input label="Website URL" type="url" value={values.website_url} onChange={(e) => setValues((v) => ({ ...v, website_url: e.target.value }))} placeholder="https://" />
          <Input label="Registration Number" type="text" value={values.registration_number} onChange={(e) => setValues((v) => ({ ...v, registration_number: e.target.value }))} />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={values.is_active} onChange={(e) => setValues((v) => ({ ...v, is_active: e.target.checked }))} className="rounded" />
              Active (visible to members)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={values.is_featured} onChange={(e) => setValues((v) => ({ ...v, is_featured: e.target.checked }))} className="rounded" />
              Featured on homepage
            </label>
          </div>
          <div className="flex gap-3">
            <Button type="submit" isLoading={isLoading}>Save Charity</Button>
            <Button type="button" variant="outline" onClick={() => router.push('/admin/charities')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
