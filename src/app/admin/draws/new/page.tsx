'use client';

/**
 * Admin: New Draw (/admin/draws/new).
 *
 * Form to configure a new monthly draw: month, logic type, prize pool amount.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { DrawConfigFormValues } from '@/types';

export default function NewDrawPage() {
  const router = useRouter();
  const [values, setValues] = useState<DrawConfigFormValues>({
    title: '',
    draw_month: new Date().toISOString().slice(0, 7), // YYYY-MM
    logic_type: 'algorithmic',
    algorithmic_preference: 'lowest',
    prize_pool_amount: 0,
  });
  const [prizeInput, setPrizeInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const response = await fetch('/api/draws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const json = await response.json();
      setError(json.error ?? 'Failed to create draw');
      setIsLoading(false);
      return;
    }

    const { data } = await response.json();
    router.push(`/admin/draws/${data.id}`);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Draw</h1>
        <p className="text-slate-500 text-sm mt-1">
          Configure a new monthly draw. Once saved, you can simulate and then publish it.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            label="Draw Title"
            type="text"
            value={values.title}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            placeholder="e.g. March 2025 Monthly Draw"
            required
          />

          <Input
            label="Draw Month"
            type="month"
            value={values.draw_month}
            onChange={(e) => setValues((v) => ({ ...v, draw_month: e.target.value }))}
            required
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Draw Logic</label>
            <div className="grid grid-cols-2 gap-3">
              {(['random', 'algorithmic'] as const).map((type) => (
                <label
                  key={type}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    values.logic_type === type
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="logic_type"
                    value={type}
                    checked={values.logic_type === type}
                    onChange={() => setValues((v) => ({ ...v, logic_type: type }))}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-slate-900 capitalize">{type}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {type === 'random'
                        ? 'Equal probability for all participants'
                        : 'Score-weighted entry distribution'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Conditional Algorithmic Preference */}
          {values.logic_type === 'algorithmic' && (
             <div className="space-y-1.5 mt-2 animate-reveal-up rounded-xl bg-orange-50 border border-orange-100 p-4">
               <label className="text-sm font-semibold text-orange-900">Algorithmic Preference</label>
               <p className="text-xs text-orange-700 mb-3">Which demographic should receive a slightly elevated probability of winning draw numbers?</p>
               <div className="grid grid-cols-2 gap-3">
                 <label className={`flex flex-col gap-1 p-3 rounded-lg border-2 cursor-pointer transition-colors ${values.algorithmic_preference === 'lowest' ? 'border-orange-400 bg-white' : 'border-orange-200/50 bg-white/50 hover:border-orange-300'}`}>
                   <div className="flex items-center gap-2">
                     <input type="radio" value="lowest" checked={values.algorithmic_preference === 'lowest' || !values.algorithmic_preference} onChange={() => setValues(v => ({ ...v, algorithmic_preference: 'lowest' }))} className="mt-0.5" />
                     <span className="font-semibold text-orange-900 text-sm">Favour Lowest Scores</span>
                   </div>
                   <span className="text-[10px] text-orange-700 ml-5">Rewards highly competitive and accurate golfers.</span>
                 </label>
                 <label className={`flex flex-col gap-1 p-3 rounded-lg border-2 cursor-pointer transition-colors ${values.algorithmic_preference === 'highest' ? 'border-orange-400 bg-white' : 'border-orange-200/50 bg-white/50 hover:border-orange-300'}`}>
                   <div className="flex items-center gap-2">
                     <input type="radio" value="highest" checked={values.algorithmic_preference === 'highest'} onChange={() => setValues(v => ({ ...v, algorithmic_preference: 'highest' }))} className="mt-0.5" />
                     <span className="font-semibold text-orange-900 text-sm">Favour Highest Scores</span>
                   </div>
                   <span className="text-[10px] text-orange-700 ml-5">Rewards beginners and developing players needing encouragement.</span>
                 </label>
               </div>
             </div>
          )}

          <Input
            label="Prize Pool Amount (£)"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.01}
            value={prizeInput}
            onChange={(e) => {
              setPrizeInput(e.target.value);
              setValues((v) => ({
                ...v,
                prize_pool_amount: Math.round(parseFloat(e.target.value) * 100) || 0,
              }));
            }}
            helperText="Leave as 0 to auto-calculate from active subscriptions"
            placeholder="0.00"
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isLoading}>
              Create Draw
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/draws')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
