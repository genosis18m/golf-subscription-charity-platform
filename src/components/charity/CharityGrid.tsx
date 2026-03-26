/**
 * CharityGrid component.
 *
 * Renders a responsive grid of CharityCard components.
 * Supports loading and empty states.
 */

import { CharityCard } from './CharityCard';
import { CharityCardSkeleton } from '@/components/ui/Skeleton';
import type { Charity } from '@/types';

interface CharityGridProps {
  charities: Charity[];
  isLoading?: boolean;
  onSelect?: (charity: Charity) => void;
  selectedCharityId?: string;
  emptyMessage?: string;
}

export function CharityGrid({
  charities,
  isLoading = false,
  onSelect,
  selectedCharityId,
  emptyMessage = 'No charities found.',
}: CharityGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <CharityCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (charities.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl block mb-4">💚</span>
        <p className="text-slate-600 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {charities.map((charity) => (
        <CharityCard
          key={charity.id}
          charity={charity}
          onSelect={onSelect}
          isSelected={selectedCharityId === charity.id}
        />
      ))}
    </div>
  );
}
