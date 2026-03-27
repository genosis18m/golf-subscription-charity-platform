'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface AvatarUploaderProps {
  userId: string;
  initialAvatarUrl: string | null;
  size?: 'sm' | 'lg';
  isDemo?: boolean;
}

function createPresetAvatarDataUrl({
  start,
  end,
  accent,
}: {
  start: string;
  end: string;
  accent: string;
}) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="bg" x1="14" y1="8" x2="104" y2="112" gradientUnits="userSpaceOnUse">
          <stop stop-color="${start}" />
          <stop offset="1" stop-color="${end}" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="60" fill="url(#bg)" />
      <circle cx="36" cy="34" r="18" fill="#F6F0E5" fill-opacity="0.12" />
      <circle cx="88" cy="42" r="8" fill="#F6F0E5" fill-opacity="0.2" />
      <circle cx="80" cy="82" r="24" fill="#F6F0E5" fill-opacity="0.08" />
      <path d="M34 84C46 70 74 70 86 84" stroke="${accent}" stroke-width="8" stroke-linecap="round" />
      <circle cx="60" cy="56" r="18" fill="#F6F0E5" fill-opacity="0.14" stroke="#F6F0E5" stroke-opacity="0.24" stroke-width="2" />
      <circle cx="54" cy="50" r="2" fill="#F6F0E5" fill-opacity="0.9" />
      <circle cx="66" cy="50" r="2" fill="#F6F0E5" fill-opacity="0.9" />
      <circle cx="60" cy="58" r="2" fill="#F6F0E5" fill-opacity="0.9" />
      <circle cx="52" cy="64" r="2" fill="#F6F0E5" fill-opacity="0.9" />
      <circle cx="68" cy="64" r="2" fill="#F6F0E5" fill-opacity="0.9" />
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const stockAvatars = [
  {
    id: 'fairway',
    label: 'Fairway',
    url: createPresetAvatarDataUrl({ start: '#173D24', end: '#0D1A13', accent: '#4AFF6B' }),
  },
  {
    id: 'sunrise',
    label: 'Sunrise',
    url: createPresetAvatarDataUrl({ start: '#5E3111', end: '#20140A', accent: '#F5A623' }),
  },
  {
    id: 'midnight',
    label: 'Midnight',
    url: createPresetAvatarDataUrl({ start: '#15243A', end: '#0A101B', accent: '#7DD3FC' }),
  },
  {
    id: 'heather',
    label: 'Heather',
    url: createPresetAvatarDataUrl({ start: '#3A1E39', end: '#120B18', accent: '#D8B4FE' }),
  },
] as const;

export function AvatarUploader({ initialAvatarUrl, isDemo }: AvatarUploaderProps) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);

  async function saveAvatar(url: string) {
    if (isDemo) {
      setAvatarUrl(url);
      toast.success('Demo profile updated');
      return;
    }

    const response = await fetch('/api/profile/avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar_url: url }),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error ?? 'Failed to update profile picture');
    }

    setAvatarUrl(json.data.url);
    toast.success('Profile picture updated');
    router.refresh();
  }

  async function updateProfileAvatar(url: string) {
    try {
      await saveAvatar(url);
    } catch (error) {
      console.error('Avatar update failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile picture');
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Select an image to upload.');
      }

      const file = event.target.files[0];

      if (isDemo) {
        const mockUrl = URL.createObjectURL(file);
        await updateProfileAvatar(mockUrl);
        return;
      }

      const formData = new FormData();
      formData.set('file', file);

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? 'Error uploading image');
      }

      setAvatarUrl(json.data.url);
      toast.success('Profile picture updated');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error uploading image');
    } finally {
      event.target.value = '';
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {stockAvatars.map(({ id, label, url }, index) => (
        <button
          key={id}
          onClick={() => updateProfileAvatar(url)}
          className="group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-full p-0 transition-transform active:scale-95"
          style={{
            width: '76px',
            height: '76px',
            border: avatarUrl === url ? '2px solid var(--green)' : '1px solid var(--border-mid)',
            background: 'var(--bg-card)',
            boxShadow: avatarUrl === url ? 'var(--green-glow)' : 'none',
          }}
          aria-label={`Select ${label} avatar preset`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={`${label} avatar preset ${index + 1}`} className="h-full w-full object-cover" />
          <span
            className="absolute inset-x-2 bottom-2 rounded-full px-2 py-1 text-center text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{
              background: 'rgba(7,9,10,0.72)',
              color: 'var(--cream)',
              opacity: avatarUrl === url ? 1 : 0,
              transition: 'opacity 0.18s ease',
            }}
          >
            Active
          </span>
        </button>
      ))}

      <div className="relative">
        <label
          className="flex cursor-pointer flex-col items-center justify-center rounded-full border border-[var(--border-bright)] bg-[var(--bg-card)] text-[var(--green)] transition-colors hover:scale-105 active:scale-95"
          style={{
            width: '76px',
            height: '76px',
            opacity: uploading ? 0.5 : 1,
            pointerEvents: uploading ? 'none' : 'auto',
          }}
        >
          <Upload size={18} strokeWidth={2.1} />
          <span className="mt-2 text-[9px] font-bold uppercase tracking-[0.18em]">
            {uploading ? 'Saving' : 'Upload'}
          </span>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}
