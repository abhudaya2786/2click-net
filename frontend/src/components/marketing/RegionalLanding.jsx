import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin, Navigation, Loader2, Store, Gavel, Home, Users, Sun, Truck, ArrowRight,
} from "lucide-react";

const ICONS = { store: Store, gavel: Gavel, home: Home, users: Users, sun: Sun, truck: Truck };

const LS_KEY = "bs_user_location";

export default function RegionalLanding() {
  const [lang, setLang] = useState(() => localStorage.getItem("bs_lang") || "en");
  const hi = lang === "hi";
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loc, setLoc] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
  });
  const [content, setContent] = useState(null);
  const [busy, setBusy] = useState(false);
  const [gpsBusy, setGpsBusy] = useState(false);

  const loadContent = useCallback(async (params) => {
    setBusy(true);
    try {
      const { data } = await api.get("/landing", { params });
      setContent(data);
    } catch {
      setContent(null);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { api.get("/geo/states").then(({ data }) => setStates(data.states || [])); }, []);

  useEffect(() => {
    if (loc.state) {
      api.get("/geo/cities", { params: { state: loc.state } }).then(({ data }) => setCities(data.cities || []));
    } else setCities([]);
  }, [loc.state]);

  useEffect(() => {
    loadContent({ state: loc.state, city: loc.city, pincode: loc.pincode });
    localStorage.setItem(LS_KEY, JSON.stringify(loc));
  }, [loc.state, loc.city, loc.pincode, loadContent]);

  const pickPincode = async (code) => {
    const pin = (code || "").replace(/\D/g, "").slice(0, 6);
    setLoc((l) => ({ ...l, pincode: pin }));
    if (pin.length !== 6) return;
    try {
      const { data } = await api.get(`/geo/pincode/${pin}`);
      setLoc({ state: data.state, city: data.city, pincode: pin, lat: data.lat, lng: data.lng });
    } catch { /* manual state/city */ }
  };

  const useGps = () => {
    if (!navigator.geolocation) return;
    setGpsBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { data } = await api.get("/geo/reverse", {
            params: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          });
          setLoc({
            state: data.state,
            city: data.city,
            pincode: data.pincode || "",
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        } finally {
          setGpsBusy(false);
        }
      },
      () => setGpsBusy(false),
      { timeout: 12000 },
    );
  };

  if (!content && busy) {
    return (
      <section className="border-y border-border bg-secondary/20 py-12 flex justify-center" data-testid="regional-landing">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </section>
    );
  }

  const label = hi ? (content?.region_label_hi || content?.region_label) : content?.region_label;
  const headline = hi ? content?.headline_hi : content?.headline_en;
  const cta = hi ? content?.cta_hi : content?.cta_en;

  return (
    <section className="border-y border-border bg-gradient-to-b from-secondary/30 to-background" data-testid="regional-landing">
      <div className="mx-auto max-w-[1400px] px-4 md:px-10 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-8">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-primary mb-3">
              <MapPin className="h-3.5 w-3.5" />
              {hi ? "आपके इलाके में" : "In your area"}
              {label ? ` · ${label}` : ""}
            </span>
            <h2 className="font-display font-extrabold text-2xl md:text-4xl tracking-tight leading-tight">
              {headline || (hi ? "आपके शहर के लिए key features" : "Key features for your city")}
            </h2>
            {(loc.city || loc.state) && (
              <p className="mt-2 text-sm text-muted-foreground">
                {[loc.city, loc.state].filter(Boolean).join(", ")}
                {loc.pincode ? ` · ${loc.pincode}` : ""}
              </p>
            )}
          </div>

          <div className="w-full lg:max-w-md space-y-2 card-premium p-4 border border-border bg-card">
            <p className="text-xs font-medium text-muted-foreground">
              {hi ? "अपना स्थान चुनें — नीचे local highlights दिखेंगे" : "Pick location — see local highlights below"}
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              <select
                data-testid="landing-state"
                value={loc.state || ""}
                onChange={(e) => setLoc({ state: e.target.value, city: "", pincode: "" })}
                className="h-10 border border-input bg-background px-2 text-sm"
              >
                <option value="">{hi ? "राज्य" : "State"}</option>
                {states.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                data-testid="landing-city"
                value={loc.city || ""}
                onChange={(e) => setLoc((l) => ({ ...l, city: e.target.value }))}
                disabled={!loc.state}
                className="h-10 border border-input bg-background px-2 text-sm disabled:opacity-50"
              >
                <option value="">{hi ? "शहर" : "City"}</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Input
                data-testid="landing-pincode"
                placeholder={hi ? "पिनकोड" : "Pincode"}
                value={loc.pincode || ""}
                onChange={(e) => pickPincode(e.target.value)}
                className="rounded-none h-10"
                maxLength={6}
              />
              <Button type="button" variant="outline" onClick={useGps} disabled={gpsBusy} className="rounded-none h-10 shrink-0">
                {gpsBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {(content?.key_points || []).map((pt, i) => {
            const Icon = ICONS[pt.icon] || MapPin;
            return (
              <div key={i} data-testid={`landing-point-${i}`} className="flex gap-3 p-4 border border-border bg-card hover:border-primary/40 transition-colors">
                <span className="h-10 w-10 shrink-0 bg-primary/10 flex items-center justify-center rounded-lg">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </span>
                <p className="text-sm leading-relaxed pt-1.5">{hi ? pt.hi : pt.en}</p>
              </div>
            );
          })}
        </div>

        {content?.stats?.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-2xl">
            {content.stats.map((s) => (
              <div key={s.k} className="text-center p-3 border border-border bg-card">
                <div className="font-display font-extrabold text-lg text-primary">{s.k}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{hi ? s.v_hi : s.v_en}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/register">
            <Button className="btn-premium rounded-none">
              {cta || (hi ? "मुफ़्त शुरू करें" : "Get started")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/freelancers">
            <Button variant="outline" className="rounded-none">
              {hi ? "पास के freelancer देखें" : "Find local freelancers"}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
