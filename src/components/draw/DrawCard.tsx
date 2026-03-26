/**
 * DrawCard component.
 *
 * Displays a summary of a single draw — its month, status, prize pool,
 * and result summary. Used in both the public draws page and the member
 * draw history.
 */

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { DrawStatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Draw } from '@/types';

interface DrawCardProps {
  draw: Draw;
  /** If provided, wraps the card in a link to the draw detail page. */
  href?: string;
}

export function DrawCard({ draw, href }: DrawCardProps) {
  const totalPrize = draw.prize_pool_snapshot?.total_amount ?? 0;

  const content = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-900">{draw.title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {formatDate(draw.draw_month + '-01', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <DrawStatusBadge status={draw.status} />
      </div>

      <div className="flex items-end justify-between mt-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
            Prize Pool
          </p>
          <p className="text-2xl font-bold text-green-700 mt-0.5">
            {formatCurrency(totalPrize)}
          </p>
        </div>

        {draw.status === 'published' && draw.published_at && (
          <p className="text-xs text-slate-400">
            Drawn {formatDate(draw.published_at, { month: 'short', day: 'numeric' })}
          </p>
        )}
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
