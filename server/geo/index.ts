/**
 * Reverse geocoding via OpenStreetMap Nominatim (proxied server-side for User-Agent + CORS).
 * Usage policy: https://operations.osmfoundation.org/policies/nominatim/
 */
import type { Express, Request, Response } from 'express';

const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse';
const USER_AGENT = '2Click.in/1.0 (https://www.2click.in; geo@2click.in)';

/** Simple 1 req/sec guard (Nominatim fair-use). */
let lastFetchAt = 0;

export type ReverseGeocodeResult = {
  displayName: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  road?: string;
  suburb?: string;
  rawAddress?: Record<string, string>;
};

function pickCity(addr: Record<string, string> | undefined): string | undefined {
  if (!addr) return undefined;
  return addr.city || addr.town || addr.village || addr.municipality || addr.county;
}

export async function reverseGeocodeNominatim(
  lat: number,
  lon: number,
): Promise<ReverseGeocodeResult> {
  const wait = 1100 - (Date.now() - lastFetchAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastFetchAt = Date.now();

  const url = new URL(NOMINATIM);
  url.searchParams.set('format', 'json');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('zoom', '18');

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
      'Accept-Language': 'en,hi',
    },
  });

  if (!res.ok) {
    throw Object.assign(new Error(`Nominatim HTTP ${res.status}`), { status: 502 });
  }

  const data = (await res.json()) as {
    display_name?: string;
    address?: Record<string, string>;
    error?: string;
  };

  if (data.error || !data.display_name) {
    throw Object.assign(new Error(data.error || 'No address found for these coordinates'), {
      status: 404,
    });
  }

  const address = data.address || {};
  return {
    displayName: data.display_name,
    city: pickCity(address),
    state: address.state,
    country: address.country,
    postcode: address.postcode,
    road: address.road,
    suburb: address.suburb || address.neighbourhood,
    rawAddress: address,
  };
}

export function registerGeoRoutes(app: Express) {
  app.get('/api/v1/geo/reverse', async (req: Request, res: Response) => {
    try {
      const lat = Number(req.query.lat);
      const lon = Number(req.query.lon ?? req.query.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        res.status(400).json({ error: 'lat and lon query params required (numbers)' });
        return;
      }
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        res.status(400).json({ error: 'lat/lon out of range' });
        return;
      }

      const result = await reverseGeocodeNominatim(lat, lon);
      res.json({ success: true, ...result });
    } catch (err: any) {
      const status = Number(err?.status) || 500;
      res.status(status).json({ error: err?.message || 'Reverse geocode failed' });
    }
  });
}
