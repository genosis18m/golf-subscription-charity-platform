'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function PublishDrawButton({ drawId }: { drawId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePublish() {
    if (!confirm('Are you sure you want to publish this draw? This will notify all winners and cannot be undone.')) return;
    setIsLoading(true);
    const res = await fetch('/api/draws/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draw_id: drawId }),
    });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? 'Failed to publish');
      setIsLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <Button onClick={handlePublish} isLoading={isLoading} variant="primary">
        Publish Draw
      </Button>
    </div>
  );
}
