'use client';

/**
 * DrawSimulator component (Admin).
 *
 * Provides UI for an admin to trigger a draw simulation and preview
 * the results before publishing. Shows a loading animation during
 * the simulation request and then displays the preliminary results.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { NumberBallRow } from './NumberBall';

interface SimulationResult {
  winning_numbers: number[];
  five_match_count: number;
  four_match_count: number;
  three_match_count: number;
  total_entries: number;
}

interface DrawSimulatorProps {
  drawId: string;
  drawTitle: string;
  onSimulationComplete?: (result: SimulationResult) => void;
}

export function DrawSimulator({
  drawId,
  drawTitle,
  onSimulationComplete,
}: DrawSimulatorProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSimulate() {
    setIsSimulating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/draws/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draw_id: drawId }),
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error ?? 'Simulation failed');
      }

      const json = await response.json();
      setResult(json.data);
      onSimulationComplete?.(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSimulating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Run Simulation</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Simulate {drawTitle} to preview results before publishing.
            This will not notify any users.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleSimulate}
          isLoading={isSimulating}
          disabled={isSimulating}
        >
          {isSimulating ? 'Simulating…' : 'Run Simulation'}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-5 space-y-4">
          <p className="text-sm font-semibold text-green-800">
            Simulation complete — preview only (not published)
          </p>

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
              Simulated Winning Numbers
            </p>
            <NumberBallRow
              numbers={result.winning_numbers}
              winningNumbers={result.winning_numbers}
              size="md"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-amber-600">{result.five_match_count}</p>
              <p className="text-xs text-slate-500">5-Match</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{result.four_match_count}</p>
              <p className="text-xs text-slate-500">4-Match</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{result.three_match_count}</p>
              <p className="text-xs text-slate-500">3-Match</p>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Total eligible entries: {result.total_entries}
          </p>
        </div>
      )}
    </div>
  );
}
