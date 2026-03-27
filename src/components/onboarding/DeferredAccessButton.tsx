'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, type ButtonProps } from '@/components/ui/Button';

const DELAYED_START_PRICE_ID = 'price_delayed_start';

type DeferredAccessButtonProps = Pick<ButtonProps, 'variant' | 'size' | 'className' | 'style'> & {
  label?: string;
  pendingLabel?: string;
  showInlineError?: boolean;
};

export function DeferredAccessButton({
  label = 'Skip for now',
  pendingLabel = 'Starting access…',
  showInlineError = false,
  variant = 'ghost',
  size = 'sm',
  className,
  style,
}: DeferredAccessButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsLoading(true);
    setError(null);

    const charityId = sessionStorage.getItem('onboarding_charity_id') ?? '';
    const contributionPct = sessionStorage.getItem('onboarding_contribution_pct') ?? '0.15';

    if (!charityId) {
      setError('Choose a charity first so we can finish your access setup.');
      setIsLoading(false);
      router.push('/onboarding/charity');
      return;
    }

    try {
      const successUrl = `${window.location.origin}/dashboard?delayed_start=true`;
      const cancelUrl = `${window.location.origin}/onboarding/subscribe`;
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: 'monthly',
          price_id: DELAYED_START_PRICE_ID,
          charity_id: charityId,
          charity_contribution_pct: parseFloat(contributionPct),
          success_url: successUrl,
          cancel_url: cancelUrl,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? 'Unable to start delayed access right now.');
      }

      window.location.assign(json.data?.url ?? successUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start delayed access right now.');
      setIsLoading(false);
    }
  }

  return (
    <div className={showInlineError ? 'space-y-3' : undefined}>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        style={style}
        isLoading={isLoading}
        onClick={handleClick}
      >
        {isLoading ? pendingLabel : label}
      </Button>

      {showInlineError && error ? (
        <p className="text-sm" style={{ color: '#f87171' }} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
