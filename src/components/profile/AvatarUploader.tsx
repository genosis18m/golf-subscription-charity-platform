'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface AvatarUploaderProps {
  userId: string;
  initialAvatarUrl: string | null;
  size?: 'sm' | 'lg';
  isDemo?: boolean;
}

const stockAvatars = [
  'https://images.unsplash.com/photo-1592500055182-3d898ec651b7?auto=format&fit=crop&q=80&w=150&h=150',
  'https://images.unsplash.com/photo-1587321526362-e91e5d71319c?auto=format&fit=crop&q=80&w=150&h=150',
  'https://images.unsplash.com/photo-1593111774240-d529f12eb416?auto=format&fit=crop&q=80&w=150&h=150',
  'https://images.unsplash.com/photo-1535133606992-068a045caaf4?auto=format&fit=crop&q=80&w=150&h=150',
];

export function AvatarUploader({ initialAvatarUrl, isDemo }: AvatarUploaderProps) {
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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error uploading image');
    } finally {
      event.target.value = '';
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {stockAvatars.map((url, index) => (
        <button
          key={url}
          onClick={() => updateProfileAvatar(url)}
          className="flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-full p-0 transition-transform active:scale-95"
          style={{
            border: avatarUrl === url ? '2px solid var(--green)' : '2px solid transparent',
            background: 'var(--bg-card)',
          }}
          aria-label={`Select preset avatar ${index + 1}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={`Preset golf avatar ${index + 1}`} className="h-full w-full object-cover" />
        </button>
      ))}

      <div className="relative">
        <label
          className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-full border border-[var(--border-bright)] bg-[var(--bg-card)] text-[var(--green)] transition-colors hover:scale-105 active:scale-95"
          style={{ opacity: uploading ? 0.5 : 1, pointerEvents: uploading ? 'none' : 'auto' }}
        >
          <span className="material-symbols-outlined">
            {uploading ? 'hourglass_empty' : 'add_a_photo'}
          </span>
          <span className="mt-1 text-[8px] font-bold uppercase">{uploading ? 'Wait' : 'Upload'}</span>
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
