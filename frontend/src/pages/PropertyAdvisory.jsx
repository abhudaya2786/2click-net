import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PageSEO from "@/components/marketing/PageSEO";
import { DEMO_PROPERTY_ADVISORY_META, demoPropertyAdvisoryMatch } from "@/lib/demoData";
import {
  Building2, MapPin, Home, Store, Factory, Hammer, Layers,
  Loader2, ArrowRight, ArrowLeft, CheckCircle2, Star, Users, Lightbulb,
  Compass, BadgeCheck, Send,
} from "lucide-react";
import { toast } from "sonner";

const NEED_ICONS = {
  new_building: Building2,
  residential_plot: MapPin,
  commercial_space: Store,
  industrial_shed: Factory,
  villa_home: Home,
  apartment_flat: Building2,
  renovation: Hammer,
  township: Layers,
};

const ROLE_ICONS = {
  architect: Compass,
  real_estate: Building2,
  interior: Home,
  structural: Building2,
  vastu: Compass,
  exterior: Building2,
  landscape: Layers,
};

export default function PropertyAdvisory() {
  const { lang } = useLang();
  const hi = lang === "hi";
  const { user } = useAuth();
  const nav = useNavigate();

  const [step, setStep] = useState(1);
  const [meta, setMeta] = useState(DEMO_PROPERTY_ADVISORY_META);
  const [busy, setBusy] = useState(false);
  const [match, setMatch] = useState(null);

  const [form, setForm] = useState({
    client_type: "company",
    property_need: "new_building",
    state: "",
    city: "",
    budget_min: "",
    budget_max: "",
    bhk: "",
    built_up_sqft: "",
    plot_sqft: "",
    timeline: "medium",
    company_name: "",
    notes: "",
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    api.get("/property-advisory/meta")
      .then(({ data }) => setMeta(data))
      .catch(() => setMeta(DEMO_PROPERTY_ADVISORY_META));
  }, []);

  useEffect(() => {
    if (user?.name) setForm((f) => ({ ...f, name: f.name || user.name, email: f.email || user.email || "" }));
  }, [user]);

  const runMatch = async () => {
    setBusy(true);
    const payload = {
      property_need: form.property_need,
      client_type: form.client_type,
      state: form.state || undefined,
      city: form.city || undefined,
      budget_min: form.budget_min ? Number(form.budget_min) : undefined,
      budget_max: form.budget_max ? Number(form.budget_max) : undefined,
      bhk: form.bhk || undefined,
      built_up_sqft: form.built_up_sqft ? Number(form.built_up_sqft) : undefined,
      plot_sqft: form.plot_sqft ? Number(form.plot_sqft) : undefined,
      timeline: form.timeline,
      company_name: form.company_name || undefined,
      notes: form.notes || undefined,
    };
    try {
      const { data } = await api.post("/property-advisory/match", payload);
      setMatch(data);
      setStep(4);
    } catch {
      setMatch(demoPropertyAdvisoryMatch(payload));
      setStep(4);
    } finally {
      setBusy(false);
    }
  };

  const submitRequest = async () => {
    if (!form.name.trim()) {
      toast.error(hi ? "नाम दें" : "Please enter your name");
      return;
    }
    if (!form.phone && !form.email) {
      toast.error(hi ? "फ़ोन या ईमेल दें" : "Phone or email required");
      return;
    }
    setBusy(true);
    const payload = {
      ...form,
      budget_min: form.budget_min ? Number(form.budget_min) : undefined,
      budget_max: form.budget_max ? Number(form.budget_max) : undefined,
      built_up_sqft: form.built_up_sqft ? Number(form.built_up_sqft) : undefined,
      plot_sqft: form.plot_sqft ? Number(form.plot_sqft) : undefined,
    };
    try {
      const { data } = await api.post("/property-advisory/request", payload);
      setMatch(data.match || match);
      toast.success(hi ? "विशेषज्ञ सलाह अनुरोध भेजा गया!" : "Expert advisory request submitted!");
      setStep(5);
    } catch {
      toast.success(hi ? "अनुरोध दर्ज (डेमो)" : "Request recorded (demo mode)");
      setStep(5);
    } finally {
      setBusy(false);
    }
  };

  const needLabel = (n) => hi ? n.name_hi || n.name : n.name;
  const clientLabel = (c) => hi ? c.label_hi || c.label : c.label;
  const timelineLabel = (t) => hi ? t.label_hi || t.label : t.label;

  return (
    <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-10">
      <PageSEO
        title={hi ? "प्रॉपर्टी सलाह — विशेषज्ञ मार्गदर्शन" : "Property advisory — expert guidance"}
        description={hi
          ? "कंपनी या व्यक्ति — प्रॉपर्टी प्रकार के हिसाब से रियल एस्टेट सलाहकार, आर्किटेक्ट और पूर्ण निर्माण गाइड।"
          : "Company or individual — real estate advisors, architects and full build guidance by property type on 2click.in."}
        path="/property-advisory"
        keywords="property advisory, real estate consultant, new building guidance, construction expert India"
      />

      <div className="mb-8 max-w-3xl">
        <span className="text-xs font-mono uppercase tracking-widest text-primary">
          {hi ? "विशेषज्ञ सलाह" : "Expert advisory"}
        </span>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">
          {hi ? "प्रॉपर्टी चाहिए? प्रकार के हिसाब से पूरी गाइडेंस" : "Need property? Complete guidance by type"}
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          {hi
            ? "नया बिल्डिंग, प्लॉट, कॉमर्शियल — रियल एस्टेट सलाहकार, कंसल्टेंट और चरण-दर-चरण विशेषज्ञ मार्गदर्शन।"
            : "New building, plot, commercial — matched real estate advisors, consultants and step-by-step expert guidance."}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex flex-wrap gap-2 mb-8 text-xs">
        {[1, 2, 3, 4].map((s) => (
          <span
            key={s}
            className={`px-3 py-1 border rounded-full ${step >= s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
          >
            {s === 1 && (hi ? "प्रकार" : "Type")}
            {s === 2 && (hi ? "लोकेशन" : "Location")}
            {s === 3 && (hi ? "विवरण" : "Details")}
            {s === 4 && (hi ? "परिणाम" : "Results")}
          </span>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6" data-testid="advisory-step-1">
          <div>
            <p className="text-sm font-medium mb-3">{hi ? "आप कौन हैं?" : "Who are you?"}</p>
            <div className="flex flex-wrap gap-2">
              {(meta.client_types || []).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setForm({ ...form, client_type: c.id })}
                  className={`px-4 py-2 text-sm border rounded-lg ${form.client_type === c.id ? "bg-primary text-white border-primary" : "border-border hover:border-primary/40"}`}
                >
                  {clientLabel(c)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">{hi ? "किस प्रकार की प्रॉपर्टी चाहिए?" : "What type of property do you need?"}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(meta.property_needs || []).map((n) => {
                const Icon = NEED_ICONS[n.id] || Building2;
                return (
                  <button
                    key={n.id}
                    type="button"
                    data-testid={`need-${n.id}`}
                    onClick={() => setForm({ ...form, property_need: n.id })}
                    className={`flex items-start gap-3 p-4 border rounded-xl text-left transition-colors ${form.property_need === n.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                  >
                    <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-display font-bold text-sm">{needLabel(n)}</div>
                      <p className="text-xs text-muted-foreground mt-1">{hi ? n.desc_hi : n.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={() => setStep(2)} className="rounded-md">
            {hi ? "आगे" : "Continue"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 max-w-lg" data-testid="advisory-step-2">
          <p className="text-sm font-medium">{hi ? "लोकेशन (राज्य / शहर)" : "Location (state / city)"}</p>
          <Input placeholder={hi ? "राज्य — e.g. Maharashtra" : "State — e.g. Maharashtra"} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          <Input placeholder={hi ? "शहर — e.g. Pune" : "City — e.g. Pune"} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="rounded-md"><ArrowLeft className="mr-2 h-4 w-4" />{hi ? "वापस" : "Back"}</Button>
            <Button onClick={() => setStep(3)} className="rounded-md">{hi ? "आगे" : "Continue"} <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 max-w-lg" data-testid="advisory-step-3">
          {form.client_type === "company" && (
            <Input placeholder={hi ? "कंपनी का नाम" : "Company name"} value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder={hi ? "बजट मिन (₹)" : "Budget min (₹)"} value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: e.target.value.replace(/\D/g, "") })} />
            <Input placeholder={hi ? "बजट मैक्स (₹)" : "Budget max (₹)"} value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: e.target.value.replace(/\D/g, "") })} />
          </div>
          <Input placeholder={hi ? "बिल्ट-अप sqft" : "Built-up sqft"} value={form.built_up_sqft} onChange={(e) => setForm({ ...form, built_up_sqft: e.target.value.replace(/\D/g, "") })} />
          <Input placeholder={hi ? "प्लॉट sqft" : "Plot sqft"} value={form.plot_sqft} onChange={(e) => setForm({ ...form, plot_sqft: e.target.value.replace(/\D/g, "") })} />
          <select value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className="h-10 w-full border border-input bg-background px-3 text-sm rounded-md">
            {(meta.timelines || []).map((t) => (
              <option key={t.id} value={t.id}>{timelineLabel(t)}</option>
            ))}
          </select>
          <Textarea placeholder={hi ? "अतिरिक्त ज़रूरतें…" : "Additional requirements…"} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)} className="rounded-md"><ArrowLeft className="mr-2 h-4 w-4" />{hi ? "वापस" : "Back"}</Button>
            <Button onClick={runMatch} disabled={busy} className="rounded-md">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (hi ? "विशेषज्ञ मिलान देखें" : "Get expert match")}
            </Button>
          </div>
        </div>
      )}

      {(step === 4 || step === 5) && match && (
        <div className="space-y-10" data-testid="advisory-results">
          {step === 5 && (
            <div className="p-4 border border-primary/30 bg-primary/5 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
              <p className="text-sm">{hi ? "अनुरोध भेज दिया गया। विशेषज्ञ जल्द संपर्क करेंगे।" : "Request sent. Experts will contact you soon."}</p>
            </div>
          )}

          {/* Guidance steps */}
          <section>
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              {hi ? "पूर्ण गाइडेंस — चरण दर चरण" : "Complete guidance — step by step"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {hi ? match.property_need_meta?.name_hi : match.property_need_meta?.name}
            </p>
            <ol className="space-y-3">
              {(match.guidance_steps || []).map((s) => (
                <li key={s.step} className="flex gap-4 p-4 border border-border rounded-xl bg-card">
                  <span className="h-8 w-8 shrink-0 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">{s.step}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-bold text-sm">{hi ? s.title_hi : s.title_en}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{hi ? s.detail_hi : s.detail_en}</p>
                    {s.tools?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {s.tools.map((t) => (
                          <Link key={t} to={t} className="text-xs text-primary hover:underline">{t}</Link>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Expert opinions */}
          {(match.expert_opinions?.length > 0) && (
            <section>
              <h2 className="font-display font-bold text-xl flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                {hi ? "विशेषज्ञ से पूछें" : "Ask an expert"}
              </h2>
              <ul className="mt-4 grid sm:grid-cols-2 gap-2">
                {match.expert_opinions.map((o, i) => (
                  <li key={i} className="text-sm p-3 border border-border rounded-lg bg-secondary/20">
                    {hi ? o.topic_hi : o.topic_en}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Matched consultants */}
          <section>
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {hi ? "मिले कंसल्टेंट / रियल एस्टेट विशेषज्ञ" : "Matched consultants & real estate experts"}
            </h2>
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(match.matched_consultants || []).map((c) => {
                const Icon = ROLE_ICONS[c.consultant_role] || Compass;
                return (
                  <div key={c.id} className="p-4 border border-border rounded-xl bg-card">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <div className="font-display font-bold text-sm flex items-center gap-1">
                          {c.name}
                          {c.verified && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{hi ? c.role_name_hi : c.role_name}</p>
                        <p className="text-xs mt-1 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-primary text-primary" /> {c.rating?.toFixed(1)} · {c.experience_years} {hi ? "वर्ष" : "yrs"}
                        </p>
                        <Link to="/consultants" className="text-xs text-primary hover:underline mt-2 inline-block">
                          {hi ? "पूछताछ भेजें →" : "Send enquiry →"}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link to="/consultants" className="text-sm text-primary hover:underline mt-3 inline-block">
              {hi ? "सभी कंसल्टेंट देखें →" : "Browse all consultants →"}
            </Link>
          </section>

          {/* Matched projects */}
          {(match.matched_projects?.length > 0) && (
            <section>
              <h2 className="font-display font-bold text-xl">{hi ? "मिले आगामी प्रोजेक्ट" : "Matching upcoming projects"}</h2>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                {match.matched_projects.map((p) => (
                  <Link key={p.id} to="/upcoming-projects" className="p-3 border border-border rounded-lg hover:border-primary/40 block">
                    <div className="font-medium text-sm">{hi ? p.title_hi || p.title : p.title}</div>
                    <div className="text-xs text-muted-foreground">{p.city}, {p.state} · {p.price_label}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="card-premium border border-border p-6 rounded-xl max-w-lg">
              <h3 className="font-display font-bold">{hi ? "विशेषज्ञ कॉलबैक" : "Expert callback"}</h3>
              <p className="text-sm text-muted-foreground mt-1">{hi ? "पूरी गाइडेंस के लिए संपर्क विवरण दें।" : "Share contact details for full expert guidance."}</p>
              <div className="space-y-3 mt-4">
                <Input required placeholder={hi ? "नाम" : "Name"} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input type="tel" placeholder={hi ? "मोबाइल" : "Mobile"} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Input type="email" placeholder={hi ? "ईमेल" : "Email"} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Textarea placeholder={hi ? "संदेश" : "Message"} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={2} />
                <Button onClick={submitRequest} disabled={busy} className="w-full rounded-md">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="mr-2 h-4 w-4" />{hi ? "विशेषज्ञ सलाह अनुरोध भेजें" : "Request expert advisory"}</>}
                </Button>
              </div>
            </section>
          )}

          {step === 5 && (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => nav("/dashboard")} variant="outline" className="rounded-md">{hi ? "डैशबोर्ड" : "Dashboard"}</Button>
              <Button onClick={() => { setStep(1); setMatch(null); }} className="rounded-md">{hi ? "नया अनुरोध" : "New request"}</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
