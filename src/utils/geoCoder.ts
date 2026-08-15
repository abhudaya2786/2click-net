/** OpenStreetMap Nominatim reverse geocoder (lat/lon → English address). */

export const NOMINATIM_REVERSE_ENDPOINT = 'https://nominatim.openstreetmap.org/reverse';

export type GeoAddress = {
  city: string;
  district: string;
  state: string;
  postcode: string;
  displayName: string;
  source: 'nominatim';
};

export type ReverseGeocodeResult = {
  ok: boolean;
  lat: number | null;
  lon: number | null;
  address: GeoAddress | null;
  displayName: string;
  error: string | null;
};

export function buildNominatimReverseUrl(lat: number, lon: number): string {
  const params = new URLSearchParams({
    format: 'json',
    lat: String(lat),
    lon: String(lon),
    addressdetails: '1',
    'accept-language': 'en',
  });
  return `${NOMINATIM_REVERSE_ENDPOINT}?${params.toString()}`;
}

export function parseNominatimPayload(data: unknown): GeoAddress | null {
  try {
    if (!data || typeof data !== 'object') return null;
    const row = data as { display_name?: string; address?: Record<string, string> };
    const a = row.address || {};
    const city = a.city || a.town || a.village || a.municipality || a.city_district || a.county || '';
    const district = a.state_district || a.county || a.district || city;
    const state = a.state || '';
    const postcode = String(a.postcode || '').replace(/\D/g, '').slice(0, 6);
    if (!city && !state && !postcode && !row.display_name) return null;
    return {
      city,
      district,
      state,
      postcode,
      displayName: row.display_name || [city, state, postcode].filter(Boolean).join(', '),
      source: 'nominatim',
    };
  } catch {
    return null;
  }
}

function geoErrorMessage(err: unknown): string {
  const anyErr = err as { code?: number; message?: string } | undefined;
  if (anyErr?.code === 1) {
    return 'Location permission was blocked. You can still preview the home without GPS.';
  }
  if (anyErr?.code === 2) return 'GPS position is unavailable.';
  if (anyErr?.code === 3) return 'GPS request timed out. Try again.';
  return anyErr?.message || 'Could not reverse-geocode this location.';
}

/** Reverse-geocode coordinates. Never throws — safe for production builds and blocked networks. */
export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Accept-Language': 'en',
    };
    // Browsers forbid setting User-Agent; Node/Vercel fetches need one or Nominatim returns 403.
    if (typeof window === 'undefined') {
      headers['User-Agent'] = '2ClickDesignStudio/1.0 (https://2click.in; design-studio)';
    }
    const res = await fetch(buildNominatimReverseUrl(lat, lon), { headers });
    if (!res.ok) {
      return {
        ok: false,
        lat,
        lon,
        address: null,
        displayName: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
        error: `Nominatim returned HTTP ${res.status}`,
      };
    }
    const data = await res.json();
    const address = parseNominatimPayload(data);
    return {
      ok: Boolean(address),
      lat,
      lon,
      address,
      displayName: address?.displayName || `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
      error: address ? null : 'No English address found for these coordinates.',
    };
  } catch (err) {
    return {
      ok: false,
      lat,
      lon,
      address: null,
      displayName: `${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)}`,
      error: geoErrorMessage(err),
    };
  }
}

/** Browser GPS + Nominatim. Never throws if location is blocked. */
export async function locateWithNominatim(): Promise<ReverseGeocodeResult> {
  try {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return {
        ok: false,
        lat: null,
        lon: null,
        address: null,
        displayName: '',
        error: 'Geolocation is not supported in this browser.',
      };
    }

    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });
    });

    return reverseGeocode(pos.coords.latitude, pos.coords.longitude);
  } catch (err) {
    return {
      ok: false,
      lat: null,
      lon: null,
      address: null,
      displayName: '',
      error: geoErrorMessage(err),
    };
  }
}
