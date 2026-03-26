'use client';

/**
 * ScoreForm — dark design, submits golf scores to /api/scores.
 */

import { useState } from 'react';
import { SCORE_LIMITS } from '@/constants';
import type { ScoreFormValues } from '@/types';

interface ScoreFormProps {
  onScoreSubmitted?: () => void;
}

const defaultValues: ScoreFormValues = {
  round_date: new Date().toISOString().split('T')[0],
  gross_score: 0,
  course_name: '',
  notes: '',
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '14px',
  color: 'var(--cream)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
  colorScheme: 'dark',
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 500,
  color: 'var(--cream)',
  opacity: 0.75,
  marginBottom: '6px',
  display: 'block',
};

export function ScoreForm({ onScoreSubmitted }: ScoreFormProps) {
  const [values, setValues] = useState<ScoreFormValues>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof ScoreFormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!values.round_date) {
      newErrors.round_date = 'Round date is required.';
    } else if (new Date(values.round_date) > new Date()) {
      newErrors.round_date = 'Round date cannot be in the future.';
    }
    if (values.gross_score < SCORE_LIMITS.MIN || values.gross_score > SCORE_LIMITS.MAX) {
      newErrors.gross_score = `Score must be between ${SCORE_LIMITS.MIN} and ${SCORE_LIMITS.MAX}.`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setSuccessMessage('');
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error ?? 'Failed to submit score');
      }
      setSuccessMessage('Score submitted! Your draw weighting has been updated.');
      setValues(defaultValues);
      onScoreSubmitted?.();
    } catch (err) {
      setErrors({ gross_score: err instanceof Error ? err.message : 'Submission failed' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'rgba(74,255,107,0.35)';
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {successMessage && (
        <div style={{
          background: 'rgba(74,255,107,0.07)',
          border: '1px solid rgba(74,255,107,0.2)',
          borderRadius: '8px',
          padding: '12px 14px',
          fontSize: '13px',
          color: 'var(--green)',
        }} role="status">
          {successMessage}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div>
          <label style={labelStyle}>Round Date</label>
          <input
            type="date"
            value={values.round_date}
            onChange={(e) => setValues((v) => ({ ...v, round_date: e.target.value }))}
            max={new Date().toISOString().split('T')[0]}
            required
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
          {errors.round_date && <p style={{ fontSize: '12px', color: '#f87171', marginTop: '4px' }}>{errors.round_date}</p>}
        </div>

        <div>
          <label style={labelStyle}>Gross Score</label>
          <input
            type="number"
            min={SCORE_LIMITS.MIN}
            max={SCORE_LIMITS.MAX}
            value={values.gross_score || ''}
            onChange={(e) => setValues((v) => ({ ...v, gross_score: parseInt(e.target.value, 10) || 0 }))}
            required
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>Between {SCORE_LIMITS.MIN} and {SCORE_LIMITS.MAX}</p>
          {errors.gross_score && <p style={{ fontSize: '12px', color: '#f87171', marginTop: '4px' }}>{errors.gross_score}</p>}
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Course Name</label>
          <input
            type="text"
            placeholder="e.g. St Andrews Old Course"
            value={values.course_name}
            onChange={(e) => setValues((v) => ({ ...v, course_name: e.target.value }))}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Notes (optional)</label>
          <textarea
            rows={2}
            placeholder="Conditions, partners, notable holes…"
            value={values.notes}
            onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
            style={{ ...inputStyle, resize: 'vertical' }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          alignSelf: 'flex-start',
          padding: '11px 24px',
          borderRadius: '8px',
          background: isSubmitting ? 'rgba(74,255,107,0.4)' : 'var(--green)',
          color: '#07090A',
          fontFamily: 'var(--font-syne)',
          fontWeight: 700,
          fontSize: '14px',
          border: 'none',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
        }}
      >
        {isSubmitting ? 'Submitting…' : 'Submit Score'}
      </button>
    </form>
  );
}
