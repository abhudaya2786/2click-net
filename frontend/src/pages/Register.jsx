import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useBranding } from "@/context/BrandingContext";
import { useLang } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HardHat, Loader2, Check, Star, Search, X, ArrowLeft, ArrowRight, Languages } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import LocationPicker from "@/components/location/LocationPicker";

const STEPS = ["step_type", "step_category", "step_business", "step_account"];

export default function Register() {
  const { setSession } = useAuth();
  const { brand_name } = useBranding();
  const { t, lang, toggle } = useLang();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get("type");

  const [step, setStep] = useState(0);
  const [userTypes, setUserTypes] = useState([]);
  const [ut, setUt] = useState(null);
  const [cats, setCats] = useState([]);
  const [catQ, setCatQ] = useState("");
  const [selected, setSelected] = useState([]);   // [{id,name}]
  const [primaryId, setPrimaryId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "", business_type: "", skills: "", service_area: "", portfolio_url: "", expected_pricing: "", availability: "" });
  const [location, setLocation] = useState({ state: "", city: "", pincode: "", lat: null, lng: null, location: "" });
  const [terms, setTerms] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/user-types").then(({ data }) => {
      setUserTypes(data);
      if (typeFromUrl) {
        const match = data.find((u) => u.code === typeFromUrl);
        if (match) setUt(match);
      }
    });
  }, [typeFromUrl]);

  useEffect(() => {
    if (step === 1 && ut) {
      const cts = ut.category_types || [];
      if (cts.length === 0) { setCats([]); return; }
      Promise.all(cts.map((ct) => api.get(`/categories/type/${ct}`).then((r) => r.data).catch(() => [])))
        .then((arr) => setCats(arr.flat()));
    }
  }, [step, ut]);

  const hasField = (f) => (ut?.fields || []).includes(f);
  const needsCategories = (ut?.category_types || []).length > 0;

  const toggleCat = (c) => {
    setSelected((s) => {
      const exists = s.find((x) => x.id === c.id);
      if (exists) { if (primaryId === c.id) setPrimaryId(null); return s.filter((x) => x.id !== c.id); }
      if (!primaryId) setPrimaryId(c.id);
      return [...s, { id: c.id, name: c.name }];
    });
  };

  const next = () => {
    setErr("");
    if (step === 0 && !ut) { setErr(t("select_user_type")); return; }
    if (step === 1 && needsCategories && selected.length === 0) { setErr(t("choose_at_least_one")); return; }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async (e) => {
    e.preventDefault();
    if (!terms) { setErr(t("accept_required")); return; }
    setBusy(true); setErr("");
    try {
      const payload = {
        name: form.name, email: form.email, password: form.password,
        user_type: ut.code, company: form.company || null,
        business_type: form.business_type || null,
        primary_category_id: primaryId, category_ids: selected.map((s) => s.id),
        skills: form.skills ? form.skills.split(",").map((x) => x.trim()).filter(Boolean) : [],
        service_area: location.location || form.service_area || null,
        state: location.state || null,
        city: location.city || null,
        pincode: location.pincode || null,
        lat: location.lat,
        lng: location.lng,
        portfolio_url: form.portfolio_url || null,
        expected_pricing: form.expected_pricing || null, availability: form.availability || null,
      };
      const { data } = await api.post("/auth/register", payload);
      setSession(data.token, data.user);
      toast.success("Account created!");
      nav("/dashboard");
    } catch (e2) {
      setErr(formatApiErrorDetail(e2.response?.data?.detail) || e2.message);
    } finally { setBusy(false); }
  };

  const filteredCats = cats.filter((c) => !catQ || c.name.toLowerCase().includes(catQ.toLowerCase()));
  const grouped = filteredCats.reduce((acc, c) => { (acc[c.category_type] = acc[c.category_type] || []).push(c); return acc; }, {});

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border">
        <div className="mx-auto max-w-3xl px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-primary flex items-center justify-center"><HardHat className="h-4.5 w-4.5 text-white" strokeWidth={1.75} /></div>
            <span className="font-display font-extrabold tracking-tight">{brand_name}</span>
          </Link>
          <button data-testid="lang-toggle" onClick={toggle} className="flex items-center gap-1.5 text-sm border border-border px-3 h-9 hover:bg-accent transition-colors">
            <Languages className="h-4 w-4" strokeWidth={1.5} />{t("lang_toggle_label")}
          </button>
        </div>
      </div>

      <div className="flex-1 mx-auto max-w-3xl w-full px-5 py-8">
        <h1 className="font-display font-extrabold text-3xl tracking-tight">{t("create_account")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("onboarding_sub")}</p>

        {/* stepper */}
        <div className="mt-6 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`h-8 w-8 flex items-center justify-center text-xs font-bold shrink-0 ${i < step ? "bg-primary text-white" : i === step ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{t(s)}</span>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {err && <div data-testid="register-error" className="mt-5 text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">{err}</div>}

        <div className="mt-6">
          {/* STEP 1 — user type */}
          {step === 0 && (
            <div data-testid="step-user-type" className="grid sm:grid-cols-3 gap-px bg-border border border-border">
              {userTypes.map((u) => (
                <button key={u.code} data-testid={`usertype-${u.code}`} type="button" onClick={() => { setUt(u); setSelected([]); setPrimaryId(null); }}
                  className={`p-5 text-left transition-colors ${ut?.code === u.code ? "bg-primary text-white" : "bg-card hover:bg-accent/40"}`}>
                  <div className="font-display font-bold">{u.label}</div>
                  <div className={`text-xs mt-1 ${ut?.code === u.code ? "text-white/80" : "text-muted-foreground"}`}>{(u.category_types || []).slice(0, 2).join(", ") || "General"}</div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 2 — categories */}
          {step === 1 && (
            <div data-testid="step-categories">
              <div className="flex items-center justify-between mb-3">
                <div><h3 className="font-display font-bold">{t("select_categories")}</h3><p className="text-xs text-muted-foreground">{t("categories_hint")}</p></div>
                {selected.length > 0 && <button onClick={() => { setSelected([]); setPrimaryId(null); }} className="text-xs text-primary">{t("clear_all")}</button>}
              </div>
              {!needsCategories ? (
                <p className="text-sm text-muted-foreground py-6">No categories required for this account type. Continue →</p>
              ) : (
                <>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input data-testid="cat-search-signup" value={catQ} onChange={(e) => setCatQ(e.target.value)} placeholder={t("search_categories")} className="rounded-none pl-9" />
                  </div>
                  {selected.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {selected.map((s) => (
                        <span key={s.id} className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 border ${primaryId === s.id ? "bg-primary text-white border-primary" : "border-border"}`}>
                          {primaryId === s.id && <Star className="h-3 w-3 fill-current" />}{s.name}
                          {primaryId !== s.id && <button type="button" onClick={() => setPrimaryId(s.id)} title={t("make_primary")}><Star className="h-3 w-3" /></button>}
                          <button type="button" onClick={() => toggleCat(s)}><X className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="space-y-4 max-h-80 overflow-y-auto border border-border p-4">
                    {Object.entries(grouped).map(([type, list]) => (
                      <div key={type}>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-primary mb-2">{type.replace("_", " ")}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {list.map((c) => {
                            const on = selected.find((x) => x.id === c.id);
                            return <button key={c.id} type="button" data-testid={`signup-cat-${c.slug}`} onClick={() => toggleCat(c)}
                              className={`text-xs px-2.5 py-1 border transition-colors ${on ? "bg-primary text-white border-primary" : "border-border hover:border-primary"}`}>{c.name}</button>;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 3 — business details */}
          {step === 2 && (
            <div data-testid="step-business" className="space-y-4 max-w-lg">
              {hasField("company") && <div><label className="text-sm font-medium mb-1.5 block">{t("company_name")}</label>
                <Input data-testid="biz-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="rounded-none" /></div>}
              {hasField("business_type") && <div><label className="text-sm font-medium mb-1.5 block">{t("business_type")}</label>
                <Input data-testid="biz-type" value={form.business_type} onChange={(e) => setForm({ ...form, business_type: e.target.value })} className="rounded-none" /></div>}
              {hasField("skills") && <div><label className="text-sm font-medium mb-1.5 block">{t("skills")}</label>
                <Input data-testid="biz-skills" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="AutoCAD, BOQ, Estimation" className="rounded-none" /></div>}
              {hasField("service_area") && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">{t("service_area")}</label>
                  <LocationPicker value={location} onChange={setLocation} />
                </div>
              )}
              {hasField("portfolio") && <div><label className="text-sm font-medium mb-1.5 block">{t("portfolio")}</label>
                <Input data-testid="biz-portfolio" value={form.portfolio_url} onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })} placeholder="https://…" className="rounded-none" /></div>}
              {hasField("pricing") && <div><label className="text-sm font-medium mb-1.5 block">{t("pricing")}</label>
                <Input data-testid="biz-pricing" value={form.expected_pricing} onChange={(e) => setForm({ ...form, expected_pricing: e.target.value })} placeholder="₹ / hour or project" className="rounded-none" /></div>}
              {hasField("availability") && <div><label className="text-sm font-medium mb-1.5 block">{t("availability")}</label>
                <Input data-testid="biz-availability" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} placeholder="Full-time / Part-time" className="rounded-none" /></div>}
              {(ut?.fields || []).length === 0 && <p className="text-sm text-muted-foreground py-6">No extra details needed. Continue →</p>}
            </div>
          )}

          {/* STEP 4 — account */}
          {step === 3 && (
            <form onSubmit={submit} data-testid="step-account" className="space-y-4 max-w-lg">
              <Input data-testid="register-name" placeholder={t("full_name")} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-none" />
              <Input data-testid="register-email" type="email" placeholder={t("email")} required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-none" />
              <Input data-testid="register-password" type="password" placeholder={t("password")} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-none" />
              <label className="flex items-center gap-2 text-sm">
                <input data-testid="register-terms" type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                {t("accept_terms")}
              </label>
              <Button data-testid="register-submit" type="submit" disabled={busy} className="w-full rounded-none">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t("create")}
              </Button>
            </form>
          )}
        </div>

        {/* nav buttons */}
        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0} data-testid="wizard-back" className="rounded-none"><ArrowLeft className="h-4 w-4 mr-1.5" />{t("back")}</Button>
          {step < STEPS.length - 1
            ? <Button onClick={next} data-testid="wizard-next" className="rounded-none">{t("next")}<ArrowRight className="h-4 w-4 ml-1.5" /></Button>
            : <span className="text-sm text-muted-foreground">{t("have_account")} <Link to="/login" className="text-primary font-medium">{t("login")}</Link></span>}
        </div>
      </div>
    </div>
  );
}
