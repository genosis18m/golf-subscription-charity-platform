/**
 * UserRow component (Admin).
 *
 * Renders a single user row within the admin users DataTable.
 * Includes a quick-action dropdown for common user management tasks.
 */

import Link from 'next/link';
import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';
import { formatDate, getInitials } from '@/lib/utils';
import type { Profile, Subscription } from '@/types';

export interface UserRowData {
  id: string;
  email: string;
  profile: Profile | null;
  subscription: Subscription | null;
  created_at: string;
}

interface UserRowProps {
  user: UserRowData;
}

export function UserRow({ user }: UserRowProps) {
  const { profile, subscription } = user;
  const displayName = profile?.full_name ?? user.email;
  const initials = profile ? getInitials(profile.full_name) : '?';

  return (
    <tr className="group bg-white hover:bg-slate-50 transition-colors">
      {/* Avatar + name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-800 text-xs font-semibold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{displayName}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Handicap */}
      <td className="px-4 py-3 text-sm text-slate-600">
        {profile?.handicap != null ? profile.handicap : '—'}
      </td>

      {/* Golf club */}
      <td className="px-4 py-3 text-sm text-slate-600 max-w-[160px] truncate">
        {profile?.golf_club ?? '—'}
      </td>

      {/* Subscription */}
      <td className="px-4 py-3">
        {subscription ? (
          <SubscriptionBadge status={subscription.status} planId={subscription.plan_id} showPlan />
        ) : (
          <span className="text-xs text-slate-400">No subscription</span>
        )}
      </td>

      {/* Joined date */}
      <td className="px-4 py-3 text-sm text-slate-500">
        {formatDate(user.created_at, { day: 'numeric', month: 'short', year: 'numeric' })}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <Link
          href={`/admin/users/${user.id}`}
          className="text-xs font-medium text-green-700 hover:text-green-900 hover:underline"
        >
          View
        </Link>
      </td>
    </tr>
  );
}
