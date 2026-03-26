export function GolfLoader() {
  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-hidden bg-[#08160d] px-6">
      <div className="fixed inset-0 bg-gradient-to-br from-[#101f14] via-[#08160d] to-[#041108]" />

      <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden opacity-[0.03] select-none">
        <span
          style={{ fontFamily: 'var(--font-display)' }}
          className="whitespace-nowrap text-[25vw] font-black italic leading-none tracking-tighter text-[#abd600]"
        >
          GOLF-Fego
        </span>
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center justify-center">
        <span
          style={{ fontFamily: 'var(--font-display)' }}
          className="mb-10 text-xl font-black italic tracking-tight text-[#abd600]/70"
        >
          GOLF-Fego
        </span>

        <div className="relative mb-10 flex h-64 w-full items-center justify-center overflow-visible">
          <div className="absolute h-72 w-72 rounded-full bg-[#abd600]/5 blur-[120px]" />
          <div className="electric-line absolute left-1/2 z-10 h-[2px] w-[450px] animate-trail rounded-full" />

          <div className="absolute left-1/2 z-30 mb-16 -ml-32 animate-putter">
            <div className="metal-finish relative h-36 w-1.5 origin-top rounded-full">
              <div className="absolute top-0 h-10 w-full rounded-t-full border-b border-white/5 bg-[#29382d]" />
              <div className="metal-finish absolute bottom-0 -right-2 flex h-4 w-10 flex-col justify-between rounded-sm border-r border-white/20 p-[2px]">
                <div className="h-[1px] w-full bg-white/20" />
                <div className="h-[1px] w-full bg-white/10" />
              </div>
            </div>
          </div>

          <div className="absolute left-1/2 z-40 -ml-2.5 animate-ball-roll">
            <div
              className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-[#d5e7d6] shadow-[inset_-3px_-3px_6px_rgba(0,0,0,0.3)]"
              style={{ animation: 'pulse-glow 2.5s infinite' }}
            >
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_30%,_#e9c349_1.2px,_transparent_1.2px)] bg-[length:5px_5px]" />
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle,_#000_1px,_transparent_1px)] bg-[length:3px_3px]" />
            </div>
          </div>
        </div>

        <div className="space-y-3 text-center">
          <h1
            style={{ fontFamily: 'var(--font-display)' }}
            className="shimmer-text text-3xl font-black uppercase tracking-tighter md:text-4xl"
          >
            Loading the clubhouse
          </h1>
          <p
            className="text-xs font-bold uppercase tracking-[0.3em] text-[#d5e7d6]/40"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            Preparing your next view
          </p>
        </div>

        <div className="relative mt-14 h-[2px] w-48 overflow-hidden rounded-full bg-[#29382d]">
          <div className="absolute inset-y-0 left-0 w-2/3 rounded-full bg-[#abd600] shadow-[0_0_10px_#abd600]" />
        </div>
      </div>

      <div className="pointer-events-none fixed right-0 top-0 z-0 p-20 opacity-5 select-none">
        <span
          style={{ fontFamily: 'var(--font-display)' }}
          className="text-[20vw] font-black italic leading-none tracking-tighter text-[#abd600]"
        >
          CLUB
        </span>
      </div>
    </div>
  );
}
