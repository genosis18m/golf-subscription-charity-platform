'use client';

/**
 * ContributionSlider component.
 *
 * Allows users to choose what percentage of their subscription goes to
 * their chosen charity. Constrained between CHARITY_MIN and CHARITY_MAX
 * contribution percentages. The remaining amount funds prizes and operations.
 */

import { CHARITY_MIN_CONTRIBUTION_PCT, CHARITY_MAX_CONTRIBUTION_PCT } from '@/constants';

interface ContributionSliderProps {
  value: number; // 0.10 – 0.30 (fractional)
  onChange: (value: number) => void;
  subscriptionPricePence: number;
}

export function ContributionSlider({
  value,
  onChange,
  subscriptionPricePence,
}: ContributionSliderProps) {
  const minPct = CHARITY_MIN_CONTRIBUTION_PCT * 100;
  const maxPct = CHARITY_MAX_CONTRIBUTION_PCT * 100;
  const currentPct = Math.round(value * 100);
  const charityAmountPounds = ((subscriptionPricePence * value) / 100).toFixed(2);
  const prizePct = 60; // Fixed prize pool % (defined in constants)
  const opsPct = 100 - currentPct - prizePct;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const pct = parseInt(e.target.value, 10);
    onChange(pct / 100);
  }

  return (
    <div className="space-y-5">
      {/* Slider */}
      <div>
        <div className="flex justify-between items-end mb-2">
          <label
            htmlFor="contribution-slider"
            className="text-sm font-medium text-slate-700"
          >
            Charity Contribution
          </label>
          <span className="text-2xl font-bold text-green-700">{currentPct}%</span>
        </div>

        <input
          id="contribution-slider"
          type="range"
          min={minPct}
          max={maxPct}
          step={1}
          value={currentPct}
          onChange={handleChange}
          className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-green-600"
          aria-valuemin={minPct}
          aria-valuemax={maxPct}
          aria-valuenow={currentPct}
          aria-valuetext={`${currentPct}% to charity`}
        />

        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>{minPct}% min</span>
          <span>{maxPct}% max</span>
        </div>
      </div>

      {/* Breakdown visual */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
        <p className="text-sm font-medium text-slate-700">Monthly Breakdown</p>

        <div className="w-full h-3 rounded-full overflow-hidden flex">
          <div
            className="bg-green-500 transition-all duration-300"
            style={{ width: `${currentPct}%` }}
            title={`${currentPct}% charity`}
          />
          <div
            className="bg-amber-400 transition-all duration-300"
            style={{ width: `${prizePct}%` }}
            title="60% prize pool"
          />
          <div
            className="bg-slate-300 transition-all duration-300"
            style={{ width: `${opsPct}%` }}
            title={`${opsPct}% operations`}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-center">
          <div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 mx-auto mb-1" />
            <p className="text-slate-600">Charity</p>
            <p className="font-bold text-green-700">£{charityAmountPounds}</p>
          </div>
          <div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mx-auto mb-1" />
            <p className="text-slate-600">Prize Pool</p>
            <p className="font-bold text-amber-700">{prizePct}%</p>
          </div>
          <div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 mx-auto mb-1" />
            <p className="text-slate-600">Operations</p>
            <p className="font-bold text-slate-600">{opsPct}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
