import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

/**
 * State → City → Pincode picker with optional GPS.
 * onChange({ state, city, pincode, lat, lng, location })
 */
export default function LocationPicker({ value = {}, onChange, className = "" }) {
  const { t, lang } = useLang();
  const tr = (en, hi) => (lang === "hi" ? hi : en);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [busy, setBusy] = useState(false);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [err, setErr] = useState("");

  const v = {
    state: value.state || "",
    city: value.city || "",
    pincode: value.pincode || "",
    lat: value.lat ?? null,
    lng: value.lng ?? null,
  };

  const emit = (patch) => {
    const next = { ...v, ...patch };
    const location = [next.city, next.state].filter(Boolean).join(", ");
    onChange?.({ ...next, location });
  };

  useEffect(() => {
    api.get("/geo/states").then(({ data }) => setStates(data.states || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!v.state) { setCities([]); return; }
    api.get("/geo/cities", { params: { state: v.state } })
      .then(({ data }) => setCities(data.cities || []))
      .catch(() => setCities([]));
  }, [v.state]);

  const lookupPincode = async (code) => {
    const pin = (code || "").replace(/\D/g, "");
    if (pin.length !== 6) return;
    setBusy(true);
    setErr("");
    try {
      const { data } = await api.get(`/geo/pincode/${pin}`);
      emit({
        pincode: pin,
        state: data.state || v.state,
        city: data.city || v.city,
        lat: data.lat ?? v.lat,
        lng: data.lng ?? v.lng,
      });
    } catch {
      setErr(tr("Pincode not found — select state/city manually", "पिनकोड नहीं मिला — राज्य/शहर चुनें"));
    } finally {
      setBusy(false);
    }
  };

  const useGps = () => {
    if (!navigator.geolocation) {
      setErr(tr("GPS not supported", "GPS उपलब्ध नहीं"));
      return;
    }
    setGpsBusy(true);
    setErr("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const { data } = await api.get("/geo/reverse", { params: { lat, lng } });
          emit({
            lat,
            lng,
            state: data.state || v.state,
            city: data.city || v.city,
            pincode: data.pincode || v.pincode,
          });
        } catch {
          emit({ lat, lng });
        } finally {
          setGpsBusy(false);
        }
      },
      () => {
        setErr(tr("Location permission denied", "लोकेशन अनुमति नहीं मिली"));
        setGpsBusy(false);
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  return (
    <div className={`space-y-3 ${className}`} data-testid="location-picker">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            {t("location.state") || tr("State", "राज्य")}
          </label>
          <select
            data-testid="loc-state"
            value={v.state}
            onChange={(e) => emit({ state: e.target.value, city: "" })}
            className="w-full h-10 border border-input bg-background px-3 text-sm"
          >
            <option value="">{tr("Select state", "राज्य चुनें")}</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            {t("location.city") || tr("City", "शहर")}
          </label>
          <select
            data-testid="loc-city"
            value={v.city}
            onChange={(e) => emit({ city: e.target.value })}
            disabled={!v.state}
            className="w-full h-10 border border-input bg-background px-3 text-sm disabled:opacity-50"
          >
            <option value="">{tr("Select city", "शहर चुनें")}</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            {t("location.pincode") || tr("Pincode", "पिनकोड")}
          </label>
          <Input
            data-testid="loc-pincode"
            value={v.pincode}
            onChange={(e) => emit({ pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
            onBlur={(e) => lookupPincode(e.target.value)}
            placeholder="6-digit pincode"
            className="rounded-none"
            maxLength={6}
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            data-testid="loc-gps"
            onClick={useGps}
            disabled={gpsBusy}
            className="rounded-none h-10"
            title={t("location.gps") || "GPS"}
          >
            {gpsBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
            <span className="ml-1.5 hidden sm:inline">{t("location.gps") || tr("GPS", "GPS")}</span>
          </Button>
        </div>
      </div>
      {(busy || v.lat) && (
        <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {busy ? tr("Looking up pincode…", "पिनकोड खोज रहे हैं…") : `GPS: ${v.lat?.toFixed(4)}, ${v.lng?.toFixed(4)}`}
        </p>
      )}
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}
