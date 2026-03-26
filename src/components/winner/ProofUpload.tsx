'use client';

/**
 * ProofUpload component.
 *
 * Allows a winner to upload verification proof (e.g., ID, photo) to
 * Supabase Storage. Displays upload progress and the current proof status.
 */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';

interface ProofUploadProps {
  winnerId: string;
  existingProofUrl?: string | null;
  onUploadComplete?: (url: string) => void;
}

export function ProofUpload({ winnerId, existingProofUrl, onUploadComplete }: ProofUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(existingProofUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size (max 5MB)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, WEBP, or PDF file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be smaller than 5MB.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('winner_id', winnerId);

      const response = await fetch('/api/winners/upload-proof', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error ?? 'Upload failed');
      }

      const { data } = await response.json();
      setUploadedUrl(data.url);
      setProgress(100);
      onUploadComplete?.(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-700 mb-1">Upload Verification Proof</p>
        <p className="text-xs text-slate-500">
          Please upload a photo ID or any documentation required to verify your win.
          Accepted formats: JPG, PNG, WEBP, PDF (max 5MB).
        </p>
      </div>

      {uploadedUrl ? (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-green-800">Proof uploaded</p>
            <p className="text-xs text-green-600">Awaiting admin verification</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="ml-auto text-xs text-green-700 underline hover:no-underline"
          >
            Replace
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center gap-2 text-slate-500 hover:border-green-400 hover:text-green-600 transition-colors"
          disabled={isUploading}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span className="text-sm font-medium">
            {isUploading ? 'Uploading…' : 'Click to upload proof'}
          </span>
        </button>
      )}

      {isUploading && (
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1.5" role="alert">
          <span>⚠</span> {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        className="sr-only"
        onChange={handleFileChange}
        aria-hidden="true"
      />
    </div>
  );
}
