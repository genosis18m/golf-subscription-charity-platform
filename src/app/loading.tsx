/**
 * Global loading skeleton.
 *
 * Shown by React Suspense / Next.js streaming while a page or layout
 * is loading server-side. Provides a neutral, branded skeleton rather
 * than a blank white screen during data fetching.
 */

export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6 w-full max-w-md px-4">
        {/* Animated logo placeholder */}
        <div className="w-16 h-16 rounded-full bg-green-600 animate-pulse" />

        {/* Page content skeleton */}
        <div className="w-full space-y-4">
          <div className="h-8 bg-slate-200 rounded-lg animate-pulse w-3/4 mx-auto" />
          <div className="h-4 bg-slate-100 rounded animate-pulse w-full" />
          <div className="h-4 bg-slate-100 rounded animate-pulse w-5/6 mx-auto" />
          <div className="h-4 bg-slate-100 rounded animate-pulse w-4/6 mx-auto" />
        </div>

        {/* Card skeletons */}
        <div className="w-full grid grid-cols-2 gap-4 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-slate-100 rounded-xl animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
