'use client';

/**
 * DrawCountdown — dark-themed real-time countdown to the next monthly draw.
 */

import { useState, useEffect } from 'react';

interface DrawCountdownProps {
  nextDrawDate: string;
  drawTitle: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDate: string): TimeLeft {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export function DrawCountdown({ nextDrawDate, drawTitle }: DrawCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(nextDrawDate));
    const interval = setInterval(() => setTimeLeft(calculateTimeLeft(nextDrawDate)), 1000);
    return () => clearInterval(interval);
  }, [nextDrawDate]);

  const isLive = timeLeft !== null && Object.values(timeLeft).every((v) => v === 0);

  const display = timeLeft ?? { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const units = [
    { label: 'Days',  value: display.days },
    { label: 'Hrs',   value: display.hours },
    { label: 'Mins',  value: display.minutes },
    { label: 'Secs',  value: display.seconds },
  ];

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '22px 24px',
    }}>
      <p style={{ fontSize: '12px', fontFamily: 'var(--font-syne)', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: '4px' }}>
        Next Draw
      </p>
      <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', color: 'var(--cream)', marginBottom: '18px' }}>
        {drawTitle}
      </p>

      {isLive ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'glow-pulse 2s ease-in-out infinite' }} />
          <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '14px', color: 'var(--green)' }}>Draw is Live!</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }} aria-label="Countdown timer">
          {units.map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '10px',
                padding: '10px 6px',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 800,
                fontSize: '1.35rem',
                color: 'var(--cream)',
                letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {String(value).padStart(2, '0')}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-syne)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
