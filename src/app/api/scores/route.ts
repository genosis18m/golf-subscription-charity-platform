/**
 * Scores API — GET/POST.
 *
 * GET: Returns the authenticated user's last MAX_STORED scores.
 * POST: Validates and inserts a new score, pruning to keep only the last
 *       MAX_STORED scores per user (rolling window logic).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { isValidScore } from '@/lib/draw-engine/random';
import { SCORE_LIMITS } from '@/constants';
import type { ScoreFormValues } from '@/types';

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('round_date', { ascending: false })
    .limit(SCORE_LIMITS.MAX_STORED);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: ScoreFormValues;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { round_date, gross_score, course_name, notes } = body;

  // Validate score
  if (!gross_score || !isValidScore(gross_score)) {
    return NextResponse.json(
      {
        error: `Score must be between ${SCORE_LIMITS.MIN} and ${SCORE_LIMITS.MAX}.`,
      },
      { status: 422 }
    );
  }

  // Validate date (cannot be in the future)
  if (new Date(round_date) > new Date()) {
    return NextResponse.json(
      { error: 'Round date cannot be in the future.' },
      { status: 422 }
    );
  }

  const supabase = await createClient();

  // Insert the new score
  const { data: newScore, error: insertError } = await supabase
    .from('scores')
    .insert({
      user_id: user.id,
      round_date,
      gross_score,
      course_name: course_name || null,
      notes: notes || null,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Rolling window: fetch all scores ordered oldest first, then delete
  // any that exceed the MAX_STORED limit
  const { data: allScores } = await supabase
    .from('scores')
    .select('id')
    .eq('user_id', user.id)
    .order('round_date', { ascending: false });

  if (allScores && allScores.length > SCORE_LIMITS.MAX_STORED) {
    const idsToDelete = allScores
      .slice(SCORE_LIMITS.MAX_STORED)
      .map((s) => s.id);

    await supabase
      .from('scores')
      .delete()
      .in('id', idsToDelete);
  }

  return NextResponse.json({ data: newScore }, { status: 201 });
}
