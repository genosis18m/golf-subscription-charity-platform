/**
 * VerificationBadge component.
 *
 * Small icon+label badge showing a winner's verification status.
 * Used inline in winner rows and winner cards.
 */

import type { Winner } from '@/types';

interface VerificationBadgeProps {
  status: Winner['status'];
}

const config: Record<Winner['status'], { icon: string; label: string; className: string }> = {
  pending: {
    icon: '⏳',
    label: 'Pending Verification',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  verified: {
    icon: '✓',
    label: 'Verified',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  rejected: {
    icon: '✕',
    label: 'Rejected',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  paid: {
    icon: '💰',
    label: 'Paid',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
};

export function VerificationBadge({ status }: VerificationBadgeProps) {
  const { icon, label, className } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}
