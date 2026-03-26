/**
 * SubscriptionBadge component.
 *
 * Compact indicator for subscription status shown in the dashboard
 * sidebar header and user tables.
 */

import { Badge } from '@/components/ui/Badge';
import type { SubscriptionStatus, SubscriptionPlanId } from '@/types';

interface SubscriptionBadgeProps {
  status: SubscriptionStatus;
  planId?: SubscriptionPlanId;
  showPlan?: boolean;
}

const statusVariantMap: Record<SubscriptionStatus, 'success' | 'info' | 'warning' | 'danger'> = {
  active: 'success',
  trialing: 'info',
  past_due: 'warning',
  canceled: 'danger',
  unpaid: 'danger',
  incomplete: 'warning',
};

export function SubscriptionBadge({ status, planId, showPlan = false }: SubscriptionBadgeProps) {
  const variant = statusVariantMap[status] ?? 'default';
  const label = showPlan && planId ? `${planId} · ${status}` : status.replace('_', ' ');

  return (
    <Badge variant={variant} dot>
      {label}
    </Badge>
  );
}
