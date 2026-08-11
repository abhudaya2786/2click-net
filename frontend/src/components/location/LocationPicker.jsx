import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

/**
 * Location picker — pincode drives state/city/district when pincodeFirst is set.
 * onChange({ state, city, district, pincode, lat, lng, location })
 */
export default function LocationPicker({ value = {}, onChange, className = "", pincodeFirst = false }) {
  const { t, lang } = useLang();
  const tr = (en, hi) => (lang === "hi" ? hi : en);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [pinOptions, setPinOptions] = useState([]);
  const [busy, setBusy] = useState(false);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [err, setErr] = useState("");
  const [manual, setManual] = useState(!pincodeFirst);

  const v = {
    state: value.state || "",
    city: value.city || "",
    district: value.district || "",
    pincode: value.pincode || "",
    lat: value.lat ?? null,
    lng: value.lng ?? null,
  };

  const emit = (patch) => {
    const next = { ...v, ...patch };
    const location = [next.city, next.district, next.state].filter(Boolean).join(", ");
    onChange?.({ ...next, location });
  };

  useEffect(() => {
    api.get("/geo/states").then(({ data }) => setStates(data.states || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!v.state) {
      setDistricts([]);
      return;
    }
    api.get("/geo/districts", { params: { state: v.state } })
      .then(({ data }) => setDistricts(data.districts || []))
      .catch(() => setDistricts([]));
  }, [v.state]);

  useEffect(() => {
    if (!v.state) {
      setCities([]);
      return;
    }
    const params = { state: v.state };
    if (v.district) params.district = v.district;
    api.get("/geo/cities", { params })
      .then(({ data }) => setCities(data.cities || []))
      .catch(() => setCities([]));
  }, [v.state, v.district]);

  useEffect(() => {
    if (!v.state && !v.city && !v.district) {
      setPinOptions([]);
      return;
    }
    const params = { limit: 200 };
    if (v.state) params.state = v.state;
    if (v.city) params.city = v.city;
    if (v.district) params.district = v.district;
    api.get("/geo/pincodes", { params })
      .then(({ data }) => setPinOptions(data.pincodes || []))
      .catch(() => setPinOptions([]));
  }, [v.state, v.city, v.district]);

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
        district: data.district || data.city || v.district,
        lat: data.lat ?? v.lat,
        lng: data.lng ?? v.lng,
      });
      if (pincodeFirst) setManual(false);
    } catch {
      setErr(tr("Pincode not found — select state / district / city", "पिनकोड नहीं मिला — राज्य / ज़िला / शहर चुनें"));
      if (pincodeFirst) setManual(true);
    } finally {
      setBusy(false);
    }
  };

  const pickPinFromList = (pin) => {
    const row = pinOptions.find((p) => p.pincode === pin);
    if (row) {
      emit({
        pincode: row.pincode,
        state: row.state,
        city: row.city,
        district: row.district || row.city,
        lat: row.lat ?? v.lat,
        lng: row.lng ?? v.lng,
      });
    } else {
      lookupPincode(pin);
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
            district: data.district || v.district,
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

  const pincodeBlock = (
    <div className="flex gap-2">
      <div className="flex-1">
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          {t("location.pincode") || tr("Pincode", "पिनकोड")}
          {pincodeFirst && <span className="text-primary"> *</span>}
        </label>
        <Input
          data-testid="loc-pincode"
          value={v.pincode}
          onChange={(e) => emit({ pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
          onBlur={(e) => lookupPincode(e.target.value)}
          placeholder={tr("6-digit pincode", "6 अंकों का पिनकोड")}
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
  );

  const manualPickers = (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            {t("location.state") || tr("State", "राज्य")}
          </label>
          <select
            data-testid="loc-state"
            value={v.state}
            onChange={(e) => emit({ state: e.target.value, city: "", district: "", pincode: "" })}
            className="w-full h-10 border border-input bg-background px-3 text-sm"
          >
            <option value="">{tr("Select state", "राज्य चुनें")}</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            {t("location.district") || tr("District", "ज़िला")}
          </label>
          <select
            data-testid="loc-district"
            value={v.district}
            onChange={(e) => emit({ district: e.target.value, city: "", pincode: "" })}
            disabled={!v.state}
            className="w-full h-10 border border-input bg-background px-3 text-sm disabled:opacity-50"
          >
            <option value="">{tr("Select district", "ज़िला चुनें")}</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            {t("location.city") || tr("City", "शहर")}
          </label>
          <select
            data-testid="loc-city"
            value={v.city}
            onChange={(e) => emit({ city: e.target.value, pincode: "" })}
            disabled={!v.state}
            className="w-full h-10 border border-input bg-background px-3 text-sm disabled:opacity-50"
          >
            <option value="">{tr("Select city", "शहर चुनें")}</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {pinOptions.length > 0 && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              {tr("Pincode from list", "सूची से पिनकोड")}
            </label>
            <select
              data-testid="loc-pincode-select"
              value={v.pincode}
              onChange={(e) => pickPinFromList(e.target.value)}
              disabled={!v.state}
              className="w-full h-10 border border-input bg-background px-3 text-sm disabled:opacity-50"
            >
              <option value="">{tr("Select pincode", "पिनकोड चुनें")}</option>
              {pinOptions.map((p) => (
                <option key={p.pincode} value={p.pincode}>
                  {p.pincode} — {p.city}{p.district && p.district !== p.city ? ` (${p.district})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );

  const showPickers = !pincodeFirst || manual;

  const resolvedSummary = v.pincode && v.state && !manual && pincodeFirst && (
    <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm space-y-0.5">
      <p className="font-medium">{v.pincode}</p>
      <p className="text-muted-foreground text-xs">
        {[v.city, v.district, v.state].filter(Boolean).join(" · ")}
      </p>
      <button
        type="button"
        className="text-xs text-primary hover:underline mt-1"
        onClick={() => setManual(true)}
      >
        {tr("Change location manually", "लोकेशन मैन्युअल बदलें")}
      </button>
    </div>
  );

  return (
    <div className={`space-y-3 ${className}`} data-testid="location-picker">
      {pincodeFirst && (
        <p className="text-xs text-muted-foreground">
          {tr("Enter pincode first — state, district and city will auto-fill.", "पहले पिनकोड दर्ज करें — राज्य, ज़िला और शहर अपने आप भर जाएंगे।")}
        </p>
      )}

      {pincodeFirst ? (
        <>
          {pincodeBlock}
          {resolvedSummary}
          {showPickers && manualPickers}
        </>
      ) : (
        <>
          {manualPickers}
          {pincodeBlock}
        </>
      )}

      {(busy || v.lat) && (
        <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {busy ? tr("Looking up pincode…", "पिनकोड खोज रहे हैं…") : `GPS: ${v.lat?.toFixed(4)}, ${v.lng?.toFixed(4)}`}
        </p>
      )}
      {err && <p className="text-xs text-destructive">{err}</p>}
      {pincodeFirst && !manual && (
        <button type="button" className="text-xs text-muted-foreground hover:text-primary" onClick={() => setManual(true)}>
          {tr("Browse by state / district / city", "राज्य / ज़िला / शहर से खोजें")}
        </button>
      )}
    </div>
  );
}
