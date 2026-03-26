/**
 * Admin: Draw Detail (/admin/draws/[id]).
 *
 * Shows full draw info: simulate, view results, and publish.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { DrawStatusBadge } from '@/components/ui/Badge';
import { DrawSimulator } from '@/components/draw/DrawSimulator';
import { DrawResult } from '@/components/draw/DrawResult';
import { formatDate, formatCurrency } from '@/lib/utils';
import PublishDrawButton from './PublishDrawButton';
import type { Draw, DrawResult as DrawResultType } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Draw ${id.slice(0, 8)} — Admin` };
}

export default async function AdminDrawDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('draws')
    .select('*, draw_results(*)')
    .eq('id', id)
    .single();

  if (error || !data) notFound();

  const draw = data as Draw & { draw_results: DrawResultType[] };
  const result = draw.draw_results?.[0] ?? null;

  const canSimulate = draw.status === 'draft';
  const canPublish = draw.status === 'simulated';

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{draw.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <DrawStatusBadge status={draw.status} />
            <span className="text-sm text-slate-500">
              {draw.draw_month
                ? formatDate(draw.draw_month + '-01', { month: 'long', year: 'numeric' })
                : ''}
            </span>
          </div>
        </div>
        {canPublish && (
          <PublishDrawButton drawId={draw.id} />
        )}
      </div>

      {/* Prize pool summary */}
      <Card>
        <Card.Header title="Prize Pool" />
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(draw.prize_pool_snapshot?.total_amount ?? 0)}
            </p>
            <p className="text-xs text-slate-500">Total Pool</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600 capitalize">{draw.logic_type}</p>
            <p className="text-xs text-slate-500">Logic Type</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(draw.prize_pool_snapshot?.jackpot_rolled_over ?? 0)}
            </p>
            <p className="text-xs text-slate-500">Rolled Over</p>
          </div>
        </div>
      </Card>

      {/* Simulator — show only for draft draws */}
      {canSimulate && (
        <Card>
          <DrawSimulator drawId={draw.id} drawTitle={draw.title} />
        </Card>
      )}

      {/* Results — show for simulated and published draws */}
      {result && (draw.status === 'simulated' || draw.status === 'published') && (
        <DrawResult draw={draw} result={result} />
      )}

      {/* Audit trail */}
      <Card>
        <Card.Header title="Timeline" />
        <ul className="space-y-2 text-sm text-slate-600">
          <li>Created: {formatDate(draw.created_at, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</li>
          {draw.simulated_at && (
            <li>Simulated: {formatDate(draw.simulated_at, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</li>
          )}
          {draw.published_at && (
            <li className="text-green-700 font-medium">
              Published: {formatDate(draw.published_at, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
