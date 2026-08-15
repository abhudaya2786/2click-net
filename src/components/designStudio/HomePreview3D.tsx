type Props = {
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
};

/** CSS 3D house preview — no Three.js, so Vercel/Vite builds stay dependency-safe. */
export function HomePreview3D({ latitude, longitude, address }: Props) {
  const label =
    address ||
    (latitude != null && longitude != null
      ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
      : '3D home preview — use GPS to pin this site');

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">3D preview</p>
        <p className="text-sm font-medium mt-1 line-clamp-2 text-slate-800 dark:text-slate-100">{label}</p>
      </div>
      <div className="h-[360px] w-full bg-gradient-to-b from-sky-100 to-emerald-50 dark:from-slate-800 dark:to-slate-900 grid place-items-center">
        <div
          className="relative w-40 h-40"
          style={{ perspective: '600px' }}
          aria-hidden
        >
          <div
            className="absolute inset-0"
            style={{
              transformStyle: 'preserve-3d',
              transform: 'rotateX(-18deg) rotateY(-28deg)',
            }}
          >
            <div className="absolute left-6 top-16 w-28 h-20 bg-stone-100 border border-stone-400 shadow-md" />
            <div
              className="absolute left-2 top-6 w-0 h-0"
              style={{
                borderLeft: '72px solid transparent',
                borderRight: '72px solid transparent',
                borderBottom: '48px solid #c45c26',
              }}
            />
            <div className="absolute left-[4.75rem] top-[5.75rem] w-3 h-8 bg-sky-400/80 border border-sky-700" />
            <div className="absolute left-10 top-[6.4rem] w-4 h-10 bg-amber-900" />
          </div>
        </div>
      </div>
    </div>
  );
}
