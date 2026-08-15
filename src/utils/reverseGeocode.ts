import { resolveApiUrl } from './apiBase';

export type ReverseGeocodeResult = {
  displayName: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  road?: string;
  suburb?: string;
};

/**
 * Reverse geocode lat/lon via app API (proxies OpenStreetMap Nominatim).
 * Example: Lucknow ≈ 26.8467, 80.9462
 */
export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<ReverseGeocodeResult> {
  const url = resolveApiUrl(
    `/api/v1/geo/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`,
  );
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error || `Reverse geocode failed (${res.status})`);
  }
  return {
    displayName: String(body.displayName || ''),
    city: body.city,
    state: body.state,
    country: body.country,
    postcode: body.postcode,
    road: body.road,
    suburb: body.suburb,
  };
}

/** Short label for Field Talk / lists: "Hazratganj, Lucknow" */
export function formatShortPlace(r: ReverseGeocodeResult): string {
  const parts = [r.suburb || r.road, r.city, r.state].filter(Boolean);
  if (parts.length) return parts.slice(0, 3).join(', ');
  return r.displayName;
}
