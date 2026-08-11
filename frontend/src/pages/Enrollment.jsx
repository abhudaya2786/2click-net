import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserEnrollmentForm from "@/components/enrollment/UserEnrollmentForm";
import ShopEnrollmentForm from "@/components/enrollment/ShopEnrollmentForm";
import AgreementPanel from "@/components/enrollment/AgreementPanel";
import EnrollmentReceipt from "@/components/enrollment/EnrollmentReceipt";
import {
  HardHat, Loader2, Check, ArrowLeft, ArrowRight, User, Store, ShoppingBag, Languages,
} from "lucide-react";
import { toast } from "sonner";
import PageSEO from "@/components/marketing/PageSEO";
import CategoryPicker from "@/components/signup/CategoryPicker";

const MODES = [
  { id: "user", icon: User, en: "Individual User", hi: "व्यक्तिगत उपयोगकर्ता", subEn: "Buy, tender, solar quotes", subHi: "खरीदें, टेंडर, सोलर" },
  { id: "vendor", icon: ShoppingBag, en: "Vendor Business", hi: "विक्रेता व्यवसाय", subEn: "Sell materials & bid tenders", subHi: "सामग्री बेचें" },
  { id: "shop", icon: Store, en: "Shop Enrollment", hi: "दुकान पंजीकरण", subEn: "Register your physical shop", subHi: "अपनी दुकान पंजीकृत करें" },
];

const STEPS_USER = ["mode", "profile", "agreements", "account"];
const STEPS_SHOP = ["mode", "profile", "shop", "agreements", "account"];

export default function Enrollment() {
  const { setSession } = useAuth();
  const { t, lang, toggle } = useLang();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const hi = lang === "hi";

  const initialMode = searchParams.get("mode") || (searchParams.get("type") === "shop" ? "shop" : searchParams.get("type") === "vendor" ? "vendor" : "user");

  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState(0);
  const [agreements, setAgreements] = useState([]);
  const [accepted, setAccepted] = useState({});
  const [selectedCats, setSelectedCats] = useState([]);
  const [primaryCatId, setPrimaryCatId] = useState(null);
  const [userForm, setUserForm] = useState({ name: "", phone: "", company: "", business_type: "", state: "", city: "", pincode: "", service_area: "" });
  const [location, setLocation] = useState({ state: "", city: "", pincode: "", lat: null, lng: null, location: "" });
  const [shopForm, setShopForm] = useState({
    name: "", shop_type: "material_store", gst_number: "", pan_number: "",
    phone: "", email: "", address_line: "", state: "", city: "", pincode: "", business_type: "",
  });
  const [shopLocation, setShopLocation] = useState({ state: "", city: "", pincode: "", lat: null, lng: null, location: "" });
  const [account, setAccount] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(null);

  const steps = mode === "user" ? STEPS_USER : STEPS_SHOP;
  const userType = mode === "shop" ? "shop" : mode === "vendor" ? "vendor" : "customer";

  useEffect(() => {
    api.get("/enrollment/agreements", { params: { mode, user_type: userType } })
      .then(({ data }) => setAgreements(data))
      .catch(() => setAgreements([]));
  }, [mode, userType]);

  const toggleAgreement = (code) => setAccepted((a) => ({ ...a, [code]: !a[code] }));

  const next = () => {
    setErr("");
    const key = steps[step];
    if (key === "profile" && !userForm.name.trim()) { setErr(t("name_required")); return; }
    if (key === "shop" && !shopForm.name.trim()) { setErr(t("shop_name_required")); return; }
    if (key === "agreements") {
      const required = agreements.filter((a) => a.required).map((a) => a.code);
      const missing = required.filter((c) => !accepted[c]);
      if (missing.length) { setErr(t("accept_all_agreements")); return; }
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const acceptedList = Object.keys(accepted).filter((k) => accepted[k]);
      const payload = {
        name: userForm.name,
        email: account.email,
        password: account.password,
        user_type: userType,
        enrollment_mode: mode,
        company: userForm.company || shopForm.name || null,
        business_type: userForm.business_type || shopForm.business_type || null,
        phone: userForm.phone || shopForm.phone || null,
        state: userForm.state || shopForm.state,
        city: userForm.city || shopForm.city,
        pincode: userForm.pincode || shopForm.pincode,
        service_area: userForm.service_area || shopLocation.location || location.location,
        category_ids: selectedCats.map((c) => c.id),
        primary_category_id: primaryCatId || selectedCats[0]?.id || null,
        accepted_agreements: acceptedList,
        shop: mode !== "user" ? {
          ...shopForm,
          category_ids: selectedCats.map((c) => c.id),
          primary_category_id: primaryCatId || selectedCats[0]?.id || null,
        } : null,
      };
      const { data } = await api.post("/enrollment/complete", payload);
      setSession(data.token, data.user);
      const receiptAgreements = agreements
        .filter((a) => acceptedList.includes(a.code))
        .map((a) => ({ code: a.code, title: hi ? a.title_hi || a.title : a.title, version: a.version }));
      setCompleted({
        user: data.user,
        shop: data.shop,
        mode,
        user_type: userType,
        name: userForm.name,
        email: account.email,
        phone: userForm.phone || shopForm.phone,
        enrollment_status: data.user?.enrollment_status || data.shop?.status,
        categories: selectedCats,
        agreements: receiptAgreements,
      });
      toast.success(mode === "user" ? t("account_created") : t("enrollment_submitted"));
    } catch (e2) {
      setErr(formatApiErrorDetail(e2.response?.data?.detail) || e2.message);
    } finally {
      setBusy(false);
    }
  };

  const stepKey = steps[step];

  if (completed) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 mx-auto max-w-3xl w-full px-5 py-10">
          <div className="text-center mb-6">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Check className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-display font-extrabold text-2xl">{t("enrollment_complete_title")}</h1>
            <p className="text-sm text-muted-foreground mt-2">{t("enrollment_complete_sub")}</p>
          </div>
          <EnrollmentReceipt data={completed} lang={lang} t={t} />
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Button onClick={() => nav("/dashboard")} className="rounded-lg">{t("go_dashboard")}</Button>
            <Button variant="outline" onClick={() => nav("/enroll")} className="rounded-lg">{t("new_enrollment")}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageSEO
        title={hi ? "पंजीकरण और नामांकन" : "Enrollment & registration"}
        description={hi
          ? "2click.in पर यूज़र, विक्रेता और दुकान पंजीकरण — समझौते, प्रिंट और रसीद।"
          : "User, vendor and shop enrollment on 2click.in — agreements, print and share receipts."}
        path="/enroll"
        keywords="enrollment, shop registration, vendor registration, construction marketplace India"
      />
      <div className="border-b border-border">
        <div className="mx-auto max-w-3xl px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-primary flex items-center justify-center rounded-lg"><HardHat className="h-4 w-4 text-white" /></div>
            <span className="font-display font-extrabold tracking-tight">2click.in</span>
          </Link>
          <button onClick={toggle} className="flex items-center gap-1.5 text-sm border border-border px-3 h-9 rounded-lg hover:bg-accent">
            <Languages className="h-4 w-4" />{t("lang_toggle_label")}
          </button>
        </div>
      </div>

      <div className="flex-1 mx-auto max-w-3xl w-full px-5 py-8">
        <h1 className="font-display font-extrabold text-3xl tracking-tight">{t("enrollment_title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("enrollment_sub")}</p>

        <div className="mt-6 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i <= step ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {err && <div data-testid="enroll-error" className="mt-5 text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2 rounded-lg">{err}</div>}

        <div className="mt-6">
          {stepKey === "mode" && (
            <div className="grid sm:grid-cols-3 gap-3" data-testid="enroll-mode">
              {MODES.map((m) => {
                const Icon = m.icon;
                const active = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    data-testid={`enroll-mode-${m.id}`}
                    onClick={() => { setMode(m.id); setStep(0); }}
                    className={`p-5 text-left border rounded-xl transition-all ${active ? "bg-primary text-white border-primary shadow-md" : "border-border hover:border-primary/40"}`}
                  >
                    <Icon className={`h-6 w-6 mb-2 ${active ? "text-white" : "text-primary"}`} />
                    <div className="font-display font-bold">{hi ? m.hi : m.en}</div>
                    <div className={`text-xs mt-1 ${active ? "text-white/80" : "text-muted-foreground"}`}>{hi ? m.subHi : m.subEn}</div>
                  </button>
                );
              })}
            </div>
          )}

          {stepKey === "profile" && (
            <div className="space-y-6">
              <UserEnrollmentForm
                value={userForm}
                onChange={setUserForm}
                location={location}
                onLocationChange={setLocation}
                showBusiness={mode !== "user"}
                t={t}
              />
              {mode !== "user" && (
                <CategoryPicker
                  categoryTypes={["marketplace"]}
                  selected={selectedCats}
                  primaryId={primaryCatId}
                  onChange={(next, pid) => {
                    setSelectedCats(next);
                    setPrimaryCatId(pid);
                  }}
                  lang={lang}
                  t={t}
                />
              )}
            </div>
          )}

          {stepKey === "shop" && (
            <ShopEnrollmentForm
              value={shopForm}
              onChange={setShopForm}
              location={shopLocation}
              onLocationChange={setShopLocation}
              lang={lang}
              t={t}
            />
          )}

          {stepKey === "agreements" && (
            <AgreementPanel agreements={agreements} accepted={accepted} onToggle={toggleAgreement} lang={lang} t={t} />
          )}

          {stepKey === "account" && (
            <form onSubmit={submit} className="space-y-4 max-w-lg" data-testid="enroll-account">
              <h3 className="font-display font-bold text-lg">{t("create_login")}</h3>
              <Input data-testid="enroll-email" type="email" placeholder={t("email")} required value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} className="rounded-lg" />
              <Input data-testid="enroll-password" type="password" placeholder={t("password")} required value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} className="rounded-lg" />
              <p className="text-xs text-muted-foreground">
                {t("have_account")} <Link to="/login" className="text-primary">{t("login")}</Link>
              </p>
              <Button type="submit" disabled={busy} className="w-full rounded-lg" data-testid="enroll-submit">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t("complete_enrollment")}
              </Button>
            </form>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0} className="rounded-lg"><ArrowLeft className="h-4 w-4 mr-1.5" />{t("back")}</Button>
          {stepKey !== "account" && (
            <Button onClick={next} data-testid="enroll-next" className="rounded-lg">{t("next")}<ArrowRight className="h-4 w-4 ml-1.5" /></Button>
          )}
        </div>
      </div>
    </div>
  );
}
