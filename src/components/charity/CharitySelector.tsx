'use client';

/**
 * CharitySelector component.
 *
 * Combines search/filter UI with the CharityGrid to create a full
 * charity selection experience for the onboarding flow.
 */

import { useState, useCallback } from 'react';
import { CharityGrid } from './CharityGrid';
import { Input } from '@/components/ui/Input';
import type { Charity } from '@/types';

interface CharitySelectorProps {
  charities: Charity[];
  selectedCharityId?: string;
  onSelect: (charity: Charity) => void;
}

export function CharitySelector({
  charities,
  selectedCharityId,
  onSelect,
}: CharitySelectorProps) {
  const [query, setQuery] = useState('');

  const filtered = charities.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      (c.tagline ?? '').toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = useCallback(
    (charity: Charity) => {
      onSelect(charity);
    },
    [onSelect]
  );

  return (
    <div className="space-y-5">
      <Input
        type="search"
        placeholder="Search charities…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search charities"
      />

      {/* Featured filter row */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Featured', 'Health', 'Environment', 'Sport', 'Education'].map((tag) => (
          <button
            key={tag}
            className="px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-700 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>

      <CharityGrid
        charities={filtered}
        onSelect={handleSelect}
        selectedCharityId={selectedCharityId}
        emptyMessage={`No charities match "${query}"`}
      />
    </div>
  );
}
