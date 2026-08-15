import { useState } from 'react';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { locateWithNominatim, ReverseGeocodeResult } from '../../utils/geoCoder';

type Props = {
  onLocationChange?: (result: ReverseGeocodeResult) => void;
};

export function GpsLocatorPanel({ onLocationChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ReverseGeocodeResult | null>(null);

  const handleLocate = async () => {
    setBusy(true);
    try {
      const next = await locateWithNominatim();
      setResult(next);
      onLocationChange?.(next);
    } catch (err) {
      const fallback: ReverseGeocodeResult = {
        ok: false,
        lat: null,
        lon: null,
        address: null,
        displayName: '',
        error: err instanceof Error ? err.message : 'Unexpected GPS error.',
      };
      setResult(fallback);
      onLocationChange?.(fallback);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">GPS location</p>
          <h3 className="mt-1 font-bold text-lg text-slate-900 dark:text-white">OpenStreetMap / Nominatim</h3>
          <p className="text-sm text-slate-500 mt-1">
            English address labels (`accept-language=en`). If GPS is blocked, the 3D preview still works.
          </p>
        </div>
        <MapPin className="w-5 h-5 text-[#00baf2] shrink-0" />
      </div>

      <button
        type="button"
        onClick={() => void handleLocate()}
        disabled={busy}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#00baf2] text-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
        {busy ? 'Locating…' : 'Use my GPS'}
      </button>

      {result?.error ? (
        <p className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          {result.error}
        </p>
      ) : null}

      {result?.lat != null && result?.lon != null ? (
        <dl className="mt-3 grid gap-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-slate-500 w-24">Latitude</dt>
            <dd className="font-mono">{result.lat.toFixed(6)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-slate-500 w-24">Longitude</dt>
            <dd className="font-mono">{result.lon.toFixed(6)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-slate-500 w-24">Address</dt>
            <dd>{result.displayName || '—'}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}
