/**
 * Random Draw Engine.
 *
 * Implements a cryptographically fair random draw where 5 numbers are drawn
 * from a pool of 1–45 for each eligible participant. The winning numbers are
 * also randomly selected from the same pool.
 *
 * This mode treats all eligible subscribers equally — no weighting based on
 * golf scores. It's the simpler, lottery-style draw mode.
 */

import { DRAW_NUMBER_POOL, DRAW_BALLS_PER_ENTRY, SCORE_LIMITS } from '@/constants';
import type { DrawEntry } from '@/types';

/**
 * Shuffles an array in-place using the Fisher-Yates algorithm.
 * This is the standard O(n) unbiased shuffle.
 */
function fisherYatesShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Draws `count` unique numbers from the provided pool.
 * Returns a sorted array of the selected numbers.
 */
function drawUniqueNumbers(pool: number[], count: number): number[] {
  if (count > pool.length) {
    throw new Error(`Cannot draw ${count} numbers from a pool of ${pool.length}.`);
  }
  return fisherYatesShuffle(pool).slice(0, count).sort((a, b) => a - b);
}

/**
 * Generates a set of 5 random entry numbers for a single participant.
 * Numbers are drawn without replacement from the 1–45 pool.
 */
export function generateRandomEntry(): number[] {
  return drawUniqueNumbers(DRAW_NUMBER_POOL, DRAW_BALLS_PER_ENTRY);
}

/**
 * Draws the 5 winning numbers for a draw.
 * Independent of participant entries — drawn from the same 1–45 pool.
 */
export function drawWinningNumbers(): number[] {
  return drawUniqueNumbers(DRAW_NUMBER_POOL, DRAW_BALLS_PER_ENTRY);
}

/**
 * Runs a full random draw simulation for a list of eligible user IDs.
 *
 * @param eligibleUserIds - Array of user IDs that qualify for this draw
 * @returns Object containing winning numbers and all entry assignments
 */
export function runRandomDraw(eligibleUserIds: string[]): {
  winningNumbers: number[];
  entries: Array<{ userId: string; numbers: number[] }>;
} {
  const winningNumbers = drawWinningNumbers();

  const entries = eligibleUserIds.map((userId) => ({
    userId,
    numbers: generateRandomEntry(),
  }));

  return { winningNumbers, entries };
}

/**
 * Counts how many numbers in an entry match the winning numbers.
 */
export function countMatches(entryNumbers: number[], winningNumbers: number[]): number {
  const winningSet = new Set(winningNumbers);
  return entryNumbers.filter((n) => winningSet.has(n)).length;
}

/**
 * Given all entries and winning numbers, returns categorised winner groups.
 */
export function categoriseWinners(
  entries: DrawEntry[],
  winningNumbers: number[]
): {
  fiveMatch: string[];
  fourMatch: string[];
  threeMatch: string[];
} {
  const fiveMatch: string[] = [];
  const fourMatch: string[] = [];
  const threeMatch: string[] = [];

  for (const entry of entries) {
    const matches = countMatches(entry.entry_numbers, winningNumbers);
    if (matches === 5) fiveMatch.push(entry.user_id);
    else if (matches === 4) fourMatch.push(entry.user_id);
    else if (matches === 3) threeMatch.push(entry.user_id);
  }

  return { fiveMatch, fourMatch, threeMatch };
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validates that a score value is within the acceptable draw range.
 */
export function isValidScore(score: number): boolean {
  return score >= SCORE_LIMITS.MIN && score <= SCORE_LIMITS.MAX;
}
