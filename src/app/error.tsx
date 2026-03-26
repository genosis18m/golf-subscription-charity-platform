'use client';

/**
 * Global Error Boundary.
 *
 * Catches unhandled errors thrown in any Server or Client Component
 * below the root layout. Provides a user-friendly recovery UI with
 * a "Try Again" button that calls `reset()` to re-render the segment.
 *
 * Note: This component must be a Client Component ('use client') because
 * it uses the `reset` function from Next.js error handling.
 */

import { useEffect } from 'react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // In production, log to your error tracking service (e.g., Sentry)
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Golf-themed error icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
            <span className="text-4xl" role="img" aria-label="Error">⛳</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Bogey! Something went wrong.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            We hit an unexpected error on our end. Please try again, and if
            the problem persists contact our support team.
          </p>
        </div>

        {/* Error digest for support reference */}
        {error.digest && (
          <p className="text-xs text-slate-400 font-mono bg-slate-50 rounded px-3 py-2">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-green-600 text-white font-medium text-sm hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
