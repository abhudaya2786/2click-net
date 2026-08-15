import { useCallback, useState } from "react";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { fetchNominatimReverse, formatLiveAddress } from "../../lib/nominatim";

function geoErrorMessage(err) {
  if (!err) return "Location is unavailable.";
  const code = err.code;
  if (code === 1) return "Location permission was blocked. You can still preview the 3D home without GPS.";
  if (code === 2) return "GPS position is unavailable. Check device location services.";
  if (code === 3) return "GPS request timed out. Try again.";
  return err.message || "Could not read GPS coordinates.";
}

/**
 * Reverse-geocode lat/lon via OpenStreetMap Nominatim.
 * Never throws — callers always get a result object.
 */
export async function reverseGeocodeSafe(lat, lon) {
  try {
    const parsed = await fetchNominatimReverse(lat, lon);
    if (parsed) {
      return {
        ok: true,
        lat,
        lon,
        parsed,
        address: formatLiveAddress(parsed),
        error: null,
      };
    }
    return {
      ok: true,
      lat,
      lon,
      parsed: null,
      address: `${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)}`,
      error: "Address lookup returned no result. Coordinates are still available.",
    };
  } catch (err) {
    return {
      ok: true,
      lat,
      lon,
      parsed: null,
      address: `${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)}`,
      error: err?.message || "Nominatim reverse geocode failed.",
    };
  }
}

/**
 * Read browser GPS then reverse-geocode. Never throws.
 */
export async function locateWithNominatim() {
  try {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return {
        ok: false,
        lat: null,
        lon: null,
        parsed: null,
        address: "",
        error: "Geolocation is not supported in this browser.",
      };
    }

    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });
    });

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    return reverseGeocodeSafe(lat, lon);
  } catch (err) {
    return {
      ok: false,
      lat: null,
      lon: null,
      parsed: null,
      address: "",
      error: geoErrorMessage(err),
    };
  }
}

export default function GpsLocator({ onLocationChange }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const handleLocate = useCallback(async () => {
    setBusy(true);
    try {
      const next = await locateWithNominatim();
      setResult(next);
      if (typeof onLocationChange === "function") {
        onLocationChange(next);
      }
    } catch (err) {
      const fallback = {
        ok: false,
        lat: null,
        lon: null,
        parsed: null,
        address: "",
        error: err?.message || "Unexpected GPS error.",
      };
      setResult(fallback);
      if (typeof onLocationChange === "function") {
        onLocationChange(fallback);
      }
    } finally {
      setBusy(false);
    }
  }, [onLocationChange]);

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">GPS location</p>
          <h3 className="mt-1 font-display font-bold text-lg">OpenStreetMap / Nominatim</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Fetch coordinates from the browser, then reverse-geocode to a street address.
          </p>
        </div>
        <MapPin className="h-5 w-5 text-primary shrink-0" />
      </div>

      <button
        type="button"
        onClick={handleLocate}
        disabled={busy}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
        {busy ? "Locating…" : "Use my GPS"}
      </button>

      {result?.error ? (
        <p className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          {result.error}
        </p>
      ) : null}

      {result?.ok && result.lat != null ? (
        <dl className="mt-3 grid gap-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-24">Latitude</dt>
            <dd className="font-mono">{Number(result.lat).toFixed(6)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-24">Longitude</dt>
            <dd className="font-mono">{Number(result.lon).toFixed(6)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-24">Address</dt>
            <dd>{result.address || "—"}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}
