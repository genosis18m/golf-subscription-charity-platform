'use client';

/**
 * Onboarding Step 1: Profile (/onboarding/profile) — dark design.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { ProfileFormValues } from '@/types';

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
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 500,
  color: 'var(--cream)',
  opacity: 0.75,
  marginBottom: '5px',
  display: 'block',
};

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [values, setValues] = useState<ProfileFormValues>({
    full_name: '', display_name: '', handicap: null, golf_club: '', phone: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormValues, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!values.full_name.trim()) e.full_name = 'Full name is required.';
    if (values.handicap !== null && (values.handicap < -10 || values.handicap > 54)) {
      e.handicap = 'Handicap must be between -10 and 54.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { error } = await supabase.from('profiles').upsert(
      {
        user_id: user.id,
        full_name: values.full_name.trim(),
        display_name: values.display_name.trim() || null,
        handicap: values.handicap,
        golf_club: values.golf_club.trim() || null,
        phone: values.phone.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (error) { setErrors({ full_name: error.message }); setIsLoading(false); return; }
    router.push('/onboarding/charity');
  }

  const focus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = 'rgba(74,255,107,0.35)');
  const blur  = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--cream)', letterSpacing: '-0.03em', marginBottom: '8px' }}>
          Tell us about yourself
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>
          We&apos;ll use this to personalise your draw experience and calculate your score weighting.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '28px',
        display: 'flex', flexDirection: 'column', gap: '20px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Full Name <span style={{ color: '#f87171' }}>*</span></label>
            <input
              type="text" autoComplete="name" value={values.full_name} required
              placeholder="e.g. John Smith"
              onChange={(e) => setValues((v) => ({ ...v, full_name: e.target.value }))}
              style={inputStyle} onFocus={focus} onBlur={blur}
            />
            {errors.full_name && <p style={{ fontSize: '12px', color: '#f87171', marginTop: '4px' }}>{errors.full_name}</p>}
          </div>

          <div>
            <label style={labelStyle}>Display Name</label>
            <input
              type="text" value={values.display_name} placeholder="e.g. JohnS"
              onChange={(e) => setValues((v) => ({ ...v, display_name: e.target.value }))}
              style={inputStyle} onFocus={focus} onBlur={blur}
            />
            <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>Shown on the leaderboard (optional)</p>
          </div>

          <div>
            <label style={labelStyle}>Golf Handicap Index</label>
            <input
              type="number" min={-10} max={54} step={0.1}
              value={values.handicap ?? ''}
              placeholder="e.g. 12.4"
              onChange={(e) => setValues((v) => ({ ...v, handicap: e.target.value === '' ? null : parseFloat(e.target.value) }))}
              style={inputStyle} onFocus={focus} onBlur={blur}
            />
            {errors.handicap && <p style={{ fontSize: '12px', color: '#f87171', marginTop: '4px' }}>{errors.handicap}</p>}
          </div>

          <div>
            <label style={labelStyle}>Golf Club</label>
            <input
              type="text" value={values.golf_club} placeholder="e.g. St Andrews Golf Club"
              onChange={(e) => setValues((v) => ({ ...v, golf_club: e.target.value }))}
              style={inputStyle} onFocus={focus} onBlur={blur}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Phone Number</label>
            <input
              type="tel" autoComplete="tel" value={values.phone}
              placeholder="+44 7700 900000"
              onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
              style={inputStyle} onFocus={focus} onBlur={blur}
            />
            <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>For prize notifications (optional)</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '12px 28px', borderRadius: '8px',
              background: isLoading ? 'rgba(74,255,107,0.4)' : 'var(--green)',
              color: '#07090A', fontFamily: 'var(--font-syne)', fontWeight: 700,
              fontSize: '14px', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Saving…' : 'Next: Choose Charity →'}
          </button>
        </div>
      </form>
    </div>
  );
}
