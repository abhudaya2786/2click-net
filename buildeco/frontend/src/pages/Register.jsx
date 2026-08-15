import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useBranding } from "@/context/BrandingContext";
import { useLang } from "@/context/LanguageContext";
import { FALLBACK_USER_TYPES, findUserType } from "@/lib/userTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HardHat, Loader2, Check, ArrowLeft, ArrowRight, Languages } from "lucide-react";
import { toast } from "sonner";
import LocationPicker from "@/components/location/LocationPicker";
import AgreementPanel from "@/components/enrollment/AgreementPanel";
import CategoryPicker from "@/components/signup/CategoryPicker";
import AuthTabs from "@/components/auth/AuthTabs";

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
  const [typesLoading, setTypesLoading] = useState(true);
  const [typesError, setTypesError] = useState("");
  const [ut, setUt] = useState(() => (typeFromUrl ? findUserType(FALLBACK_USER_TYPES, typeFromUrl) : null));
  const [selected, setSelected] = useState([]);
  const [primaryId, setPrimaryId] = useState(null);
  const [form, setForm] = useState({
    name: "", email: "", password: "", company: "", business_type: "",
    skills: "", service_area: "", portfolio_url: "", expected_pricing: "", availability: "",
  });
  const [location, setLocation] = useState({ state: "", city: "", district: "", pincode: "", lat: null, lng: null, location: "" });
  const [agreements, setAgreements] = useState([]);
  const [accepted, setAccepted] = useState({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const applyTypeFromUrl = useCallback((types) => {
    if (!typeFromUrl) return;
    const match = findUserType(types, typeFromUrl);
    if (match) setUt(match);
  }, [typeFromUrl]);

  const loadUserTypes = useCallback(() => {
    setTypesLoading(true);
    setTypesError("");
    api.get("/user-types")
      .then(({ data }) => {
        const types = data?.length ? data : FALLBACK_USER_TYPES;
        setUserTypes(types);
        applyTypeFromUrl(types);
      })
      .catch(() => {
        setUserTypes(FALLBACK_USER_TYPES);
        applyTypeFromUrl(FALLBACK_USER_TYPES);
        setTypesError(t("api_offline_types"));
      })
      .finally(() => setTypesLoading(false));
  }, [applyTypeFromUrl, t]);

  useEffect(() => { loadUserTypes(); }, [loadUserTypes]);

  useEffect(() => {
    if (!ut?.code) {
      setAgreements([]);
      setAccepted({});
      return;
    }
    api.get("/enrollment/agreements", { params: { mode: "user", user_type: ut.code } })
      .then(({ data }) => setAgreements(data))
      .catch(() => setAgreements([]));
  }, [ut?.code]);

  const hasField = (f) => (ut?.fields || []).includes(f);
  const needsCategories = (ut?.category_types || []).length > 0;
  const displayTypes = userTypes.length ? userTypes : FALLBACK_USER_TYPES;

  const selectUserType = (u) => {
    setUt(u);
    setSelected([]);
    setPrimaryId(null);
  };

  const toggleAgreement = (code) => setAccepted((a) => ({ ...a, [code]: !a[code] }));

  const next = () => {
    setErr("");
    if (step === 0 && !ut) { setErr(t("select_user_type")); return; }
    if (step === 1 && needsCategories && selected.length === 0) { setErr(t("choose_at_least_one")); return; }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async (e) => {
    e.preventDefault();
    const required = agreements.filter((a) => a.required).map((a) => a.code);
    const missing = required.filter((c) => !accepted[c]);
    if (missing.length) { setErr(t("accept_all_agreements")); return; }
    setBusy(true);
    setErr("");
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        user_type: ut.code,
        company: form.company || null,
        business_type: form.business_type || null,
        primary_category_id: primaryId,
        category_ids: selected.map((s) => s.id),
        skills: form.skills ? form.skills.split(",").map((x) => x.trim()).filter(Boolean) : [],
        service_area: location.location || form.service_area || null,
        state: location.state || null,
        city: location.city || null,
        district: location.district || null,
        pincode: location.pincode || null,
        lat: location.lat,
        lng: location.lng,
        portfolio_url: form.portfolio_url || null,
        expected_pricing: form.expected_pricing || null,
        availability: form.availability || null,
      };
      const { data } = await api.post("/auth/register", payload);
      setSession(data.token, data.user);
      toast.success(t("account_created"));
      nav("/dashboard");
    } catch (e2) {
      setErr(formatApiErrorDetail(e2.response?.data?.detail) || e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border">
        <div className="mx-auto max-w-3xl px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-primary flex items-center justify-center">
              <HardHat className="h-4.5 w-4.5 text-white" strokeWidth={1.75} />
            </div>
            <span className="font-display font-extrabold tracking-tight">{brand_name}</span>
          </Link>
          <button
            data-testid="lang-toggle"
            onClick={toggle}
            className="flex items-center gap-1.5 text-sm border border-border px-3 h-9 hover:bg-accent transition-colors rounded-lg"
          >
            <Languages className="h-4 w-4" strokeWidth={1.5} />
            {t("lang_toggle_label")}
          </button>
        </div>
      </div>

      <div className="flex-1 mx-auto max-w-3xl w-full px-5 py-8">
        <AuthTabs
          active="register"
          registerTo={typeFromUrl ? `/register?type=${typeFromUrl}` : "/register"}
        />
        <h1 className="font-display font-extrabold text-3xl tracking-tight">{t("create_account")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("onboarding_sub")}</p>

        <div className="mt-6 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`h-8 w-8 flex items-center justify-center text-xs font-bold shrink-0 rounded-full ${i <= step ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{t(s)}</span>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {err && <div data-testid="register-error" className="mt-5 text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2 rounded-lg">{err}</div>}

        <div className="mt-6">
          {step === 0 && (
            <div data-testid="step-user-type">
              {typesLoading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <>
                  {typesError && <p className="text-xs text-amber-600 mb-3">{typesError}</p>}
                  <div className="grid sm:grid-cols-3 gap-px bg-border border border-border rounded-lg overflow-hidden">
                    {displayTypes.map((u) => (
                      <button
                        key={u.code}
                        data-testid={`usertype-${u.code}`}
                        type="button"
                        onClick={() => selectUserType(u)}
                        className={`p-5 text-left transition-colors ${ut?.code === u.code ? "bg-primary text-white" : "bg-card hover:bg-accent/40"}`}
                      >
                        <div className="font-display font-bold">{u.label}</div>
                        <div className={`text-xs mt-1 ${ut?.code === u.code ? "text-white/80" : "text-muted-foreground"}`}>
                          {(u.category_types || []).slice(0, 2).join(", ") || t("general")}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {step === 1 && (
            needsCategories ? (
              <CategoryPicker
                categoryTypes={ut?.category_types || []}
                selected={selected}
                primaryId={primaryId}
                onChange={(next, nextPrimary) => {
                  setSelected(next);
                  setPrimaryId(nextPrimary);
                }}
                lang={lang}
                t={t}
              />
            ) : (
              <p className="text-sm text-muted-foreground py-6">{t("no_categories_required")}</p>
            )
          )}

          {step === 2 && (
            <div data-testid="step-business" className="space-y-4 max-w-lg">
              {hasField("company") && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("company_name")}</label>
                  <Input data-testid="biz-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="rounded-lg" />
                </div>
              )}
              {hasField("business_type") && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("business_type")}</label>
                  <Input data-testid="biz-type" value={form.business_type} onChange={(e) => setForm({ ...form, business_type: e.target.value })} className="rounded-lg" />
                </div>
              )}
              {hasField("skills") && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("skills")}</label>
                  <Input data-testid="biz-skills" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="AutoCAD, BOQ, Estimation" className="rounded-lg" />
                </div>
              )}
              {hasField("service_area") && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("service_area")}</label>
                  <LocationPicker pincodeFirst value={location} onChange={setLocation} />
                </div>
              )}
              {hasField("portfolio") && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("portfolio")}</label>
                  <Input data-testid="biz-portfolio" value={form.portfolio_url} onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })} placeholder="https://…" className="rounded-lg" />
                </div>
              )}
              {hasField("pricing") && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("pricing")}</label>
                  <Input data-testid="biz-pricing" value={form.expected_pricing} onChange={(e) => setForm({ ...form, expected_pricing: e.target.value })} placeholder="₹ / hour or project" className="rounded-lg" />
                </div>
              )}
              {hasField("availability") && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("availability")}</label>
                  <Input data-testid="biz-availability" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} placeholder="Full-time / Part-time" className="rounded-lg" />
                </div>
              )}
              {(ut?.fields || []).length === 0 && <p className="text-sm text-muted-foreground py-6">{t("no_extra_details")}</p>}
            </div>
          )}

          {step === 3 && (
            <form onSubmit={submit} data-testid="step-account" className="space-y-4 max-w-lg">
              <Input data-testid="register-name" placeholder={t("full_name")} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg" />
              <Input data-testid="register-email" type="email" placeholder={t("email")} required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg" />
              <Input data-testid="register-password" type="password" placeholder={t("password")} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-lg" />
              {agreements.length > 0 && (
                <AgreementPanel agreements={agreements} accepted={accepted} onToggle={toggleAgreement} lang={lang} t={t} />
              )}
              <Button data-testid="register-submit" type="submit" disabled={busy} className="w-full rounded-lg">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t("create")}
              </Button>
            </form>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0} data-testid="wizard-back" className="rounded-lg">
            <ArrowLeft className="h-4 w-4 mr-1.5" />{t("back")}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next} data-testid="wizard-next" className="rounded-lg">
              {t("next")}<ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          ) : (
            <span className="text-sm text-muted-foreground">
              {t("have_account")} <Link to="/login" className="text-primary font-medium">{t("login")}</Link>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
