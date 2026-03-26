/**
 * 404 Not Found Page.
 *
 * Rendered by Next.js whenever `notFound()` is called or when no route
 * matches the requested URL. Uses a golf-themed copy to keep the tone
 * consistent with the rest of the platform.
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Decorative number */}
        <div className="flex justify-center items-center gap-2">
          <span className="text-8xl font-bold text-green-600 font-playfair">4</span>
          <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
            <span className="text-3xl" role="img" aria-label="Golf ball">⛳</span>
          </div>
          <span className="text-8xl font-bold text-green-600 font-playfair">4</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Out of bounds!
          </h1>
          <p className="text-slate-500 leading-relaxed">
            The page you&apos;re looking for has gone out of bounds. Let&apos;s
            get you back on the fairway.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-green-600 text-white font-medium text-sm hover:bg-green-700 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
