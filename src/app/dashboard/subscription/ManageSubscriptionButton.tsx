'use client';

/**
 * ManageSubscriptionButton — client component that calls the portal API
 * and redirects to the Stripe billing portal.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    const res = await fetch('/api/subscriptions/portal', { method: 'POST' });
    const { data } = await res.json();
    if (data?.url) window.location.href = data.url;
    else setIsLoading(false);
  }

  return (
    <Button variant="outline" onClick={handleClick} isLoading={isLoading}>
      Open Billing Portal →
    </Button>
  );
}
