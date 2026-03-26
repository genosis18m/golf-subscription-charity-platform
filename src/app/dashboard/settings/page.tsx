'use client';

/**
 * Dashboard: Settings (/dashboard/settings) — dark design.
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';

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
  fontSize: '12px', fontWeight: 500, color: 'var(--cream)', opacity: 0.75,
  marginBottom: '5px', display: 'block',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: '16px', padding: '24px',
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<Partial<Profile>>({
    full_name: '', display_name: '', golf_club: '', phone: '', handicap: null,
  });
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (data) setProfile(data);
    });
  }, []);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setIsProfileLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({
      full_name: profile.full_name,
      display_name: profile.display_name || null,
      golf_club: profile.golf_club || null,
      phone: profile.phone || null,
      handicap: profile.handicap,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id);
    setProfileSuccess('Profile updated successfully.');
    setIsProfileLoading(false);
    setTimeout(() => setProfileSuccess(''), 3000);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) { setPasswordError('New password must be at least 8 characters.'); return; }
    setIsPasswordLoading(true);
    setPasswordError('');
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setPasswordError(error.message);
    else { setNewPassword(''); setPasswordSuccess('Password updated.'); setTimeout(() => setPasswordSuccess(''), 3000); }
    setIsPasswordLoading(false);
  }

  const focus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = 'rgba(74,255,107,0.35)');
  const blur  = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--cream)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Manage your profile and account security.</p>
      </div>

      {/* Profile section */}
      <div style={cardStyle}>
        <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', color: 'var(--cream)', marginBottom: '16px' }}>
          Profile Information
        </h2>
        {profileSuccess && (
          <div style={{ background: 'rgba(74,255,107,0.07)', border: '1px solid rgba(74,255,107,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--green)', marginBottom: '16px' }} role="status">
            {profileSuccess}
          </div>
        )}
        <form onSubmit={handleProfileSave} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input type="text" required value={profile.full_name ?? ''} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={labelStyle}>Display Name</label>
              <input type="text" value={profile.display_name ?? ''} onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))} style={inputStyle} onFocus={focus} onBlur={blur} />
              <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>Shown publicly on leaderboard</p>
            </div>
            <div>
              <label style={labelStyle}>Handicap Index</label>
              <input type="number" step={0.1} value={profile.handicap ?? ''} onChange={(e) => setProfile((p) => ({ ...p, handicap: e.target.value === '' ? null : parseFloat(e.target.value) }))} style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={labelStyle}>Golf Club</label>
              <input type="text" value={profile.golf_club ?? ''} onChange={(e) => setProfile((p) => ({ ...p, golf_club: e.target.value }))} style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Phone</label>
              <input type="tel" value={profile.phone ?? ''} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isProfileLoading}
              style={{ padding: '10px 24px', borderRadius: '8px', background: isProfileLoading ? 'rgba(74,255,107,0.4)' : 'var(--green)', color: '#07090A', fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', border: 'none', cursor: isProfileLoading ? 'not-allowed' : 'pointer' }}
            >
              {isProfileLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Password section */}
      <div style={cardStyle}>
        <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', color: 'var(--cream)', marginBottom: '16px' }}>
          Change Password
        </h2>
        {passwordError && (
          <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#f87171', marginBottom: '16px' }} role="alert">
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div style={{ background: 'rgba(74,255,107,0.07)', border: '1px solid rgba(74,255,107,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--green)', marginBottom: '16px' }} role="status">
            {passwordSuccess}
          </div>
        )}
        <form onSubmit={handlePasswordChange} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>New Password</label>
            <input
              type="password" autoComplete="new-password" value={newPassword} required
              placeholder="Minimum 8 characters"
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle} onFocus={focus} onBlur={blur}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isPasswordLoading}
              style={{ padding: '10px 24px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', cursor: isPasswordLoading ? 'not-allowed' : 'pointer' }}
            >
              {isPasswordLoading ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
