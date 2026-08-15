import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Navigation } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { fetchNominatimReverse, formatLiveAddress } from "@/lib/nominatim";
import { reverseGeocode as seedReverse } from "@/lib/geoFallback";
import { api } from "@/lib/api";

/**
 * Fetch automatic GPS location via Nominatim reverse geocode.
 * onLocationFound(addressString, locationObject)
 */
export default function GpsTracker({ onLocationFound }) {
  const { lang } = useLang();
  const hi = lang === "hi";
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const locate = () => {
    if (!navigator.geolocation) {
      setErr(hi ? "GPS उपलब्ध नहीं" : "GPS not supported");
      return;
    }
    setBusy(true);
    setErr("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          let data = null;
          try {
            const res = await api.get("/geo/reverse", { params: { lat, lng: lon } });
            data = res.data;
          } catch { /* live API may 404 */ }
          if (!data?.city && !data?.state) {
            data = await fetchNominatimReverse(lat, lon);
          }
          if (!data?.city && !data?.state) {
            data = seedReverse(lat, lon);
          }
          const loc = { ...(data || {}), lat, lng: lon, lon };
          const address = formatLiveAddress(loc);
          onLocationFound?.(address, loc);
          if (!address) setErr(hi ? "पता नहीं मिला" : "Could not resolve address");
        } catch {
          setErr(hi ? "API कॉल में कोई एरर आ गया" : "Location lookup failed");
        } finally {
          setBusy(false);
        }
      },
      () => {
        setErr(hi ? "लोकेशन अनुमति नहीं मिली" : "Location permission denied");
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  return (
    <div className="space-y-2" data-testid="gps-tracker">
      <Button type="button" variant="outline" className="rounded-xl" onClick={locate} disabled={busy} data-testid="gps-tracker-btn">
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Navigation className="h-4 w-4 mr-2" />}
        {hi ? "लाइव GPS लोकेशन" : "Use live GPS location"}
      </Button>
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}
