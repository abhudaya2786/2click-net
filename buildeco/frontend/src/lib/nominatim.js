/** OpenStreetMap Nominatim reverse geocode (lat/lon → city, state, pincode). */

export const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

export function nominatimUrl(lat, lon) {
  return `${NOMINATIM_REVERSE_URL}?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1`;
}

/** Map Nominatim JSON to BuildEco location fields. */
export function parseNominatimAddress(data) {
  if (!data || typeof data !== "object") return null;
  const a = data.address || {};
  const city = a.city || a.town || a.village || a.municipality || a.city_district || a.county || "";
  const district = a.state_district || a.county || a.district || city;
  const state = a.state || "";
  const pincode = String(a.postcode || "").replace(/\D/g, "").slice(0, 6);
  if (!city && !state && !pincode) return null;
  return {
    city,
    district,
    state,
    pincode,
    display_name: data.display_name || "",
    source: "nominatim",
  };
}

export async function fetchNominatimReverse(lat, lon, { fetchImpl } = {}) {
  const doFetch = fetchImpl || (typeof fetch === "function" ? fetch : null);
  if (!doFetch) return null;
  const res = await doFetch(nominatimUrl(lat, lon), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return parseNominatimAddress(data);
}
