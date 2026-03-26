'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Charity } from '@/types';

export default function EditCharityClient({ charity }: { charity: Charity }) {
  const router = useRouter();
  const [values, setValues] = useState({
    name: charity.name,
    tagline: charity.tagline ?? '',
    description: charity.description,
    website_url: charity.website_url ?? '',
    registration_number: charity.registration_number ?? '',
    is_active: charity.is_active,
    is_featured: charity.is_featured,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    const res = await fetch(`/api/charities/${charity.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? 'Update failed');
    } else {
      setSuccess('Charity updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    }
    setIsLoading(false);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Edit: {charity.name}</h1>
      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">{success}</div>}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input label="Name" type="text" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} required />
          <Input label="Tagline" type="text" value={values.tagline} onChange={(e) => setValues((v) => ({ ...v, tagline: e.target.value }))} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea rows={5} value={values.description} onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500" />
          </div>
          <Input label="Website URL" type="url" value={values.website_url} onChange={(e) => setValues((v) => ({ ...v, website_url: e.target.value }))} />
          <Input label="Registration Number" type="text" value={values.registration_number} onChange={(e) => setValues((v) => ({ ...v, registration_number: e.target.value }))} />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={values.is_active} onChange={(e) => setValues((v) => ({ ...v, is_active: e.target.checked }))} />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={values.is_featured} onChange={(e) => setValues((v) => ({ ...v, is_featured: e.target.checked }))} />
              Featured
            </label>
          </div>
          <div className="flex gap-3">
            <Button type="submit" isLoading={isLoading}>Save Changes</Button>
            <Button type="button" variant="outline" onClick={() => router.push('/admin/charities')}>Back</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
