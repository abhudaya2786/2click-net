import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageSEO from "@/components/marketing/PageSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LocationPicker from "@/components/location/LocationPicker";
import { useLang } from "@/context/LanguageContext";
import { SUPER_COPY } from "@/lib/superAppCopy";
import { ArrowRight, Check } from "lucide-react";

const LS_KEY = "bs_two_click_project";

export default function Build() {
  const { lang } = useLang();
  const c = SUPER_COPY[lang] || SUPER_COPY.en;
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [type, setType] = useState("");
  const [location, setLocation] = useState({ state: "", city: "", district: "", pincode: "", lat: null, lng: null, location: "" });
  const [form, setForm] = useState({
    plot_area_sqft: "", built_up_sqft: "", floors: "1", bhk: "", budget: "",
  });

  const types = c.projectTypes;
  const label = (item) => (lang === "hi" ? item.hi : item.en);

  const finish = () => {
    const payload = {
      project_type: type,
      state: location.state,
      city: location.city,
      pincode: location.pincode,
      plot_area_sqft: Number(form.plot_area_sqft) || 0,
      built_up_sqft: Number(form.built_up_sqft) || 0,
      floors: Number(form.floors) || 1,
      bhk: Number(form.bhk) || 0,
      budget: Number(form.budget) || 0,
      quality: "standard",
    };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
    nav("/projects");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-10 md:py-14">
      <PageSEO title="Start your project — 2click.in" description="2-click project setup" path="/build" />
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{c.twoClickTitle}</p>
      <h1 className="font-display font-extrabold text-3xl tracking-tight">
        {step === 0 ? (lang === "hi" ? "आप क्या बनाना चाहते हैं?" : "What do you want to build?") : (lang === "hi" ? "प्रोजेक्ट के बारे में बताएं" : "Tell us about your project")}
      </h1>
      <p className="text-sm text-muted-foreground mt-2">{c.twoClickSub}</p>

      <div className="mt-8 flex gap-2 mb-8">
        {[0, 1].map((i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      {step === 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                type === t.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30"
              }`}
            >
              <span className="font-display font-bold">{label(t)}</span>
              {type === t.id && <Check className="h-4 w-4 text-primary mt-2" />}
            </button>
          ))}
          <Button
            className="sm:col-span-2 mt-4 rounded-xl h-12"
            disabled={!type}
            onClick={() => setStep(1)}
          >
            {lang === "hi" ? "आगे — क्लिक 2" : "Next — click 2"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <LocationPicker pincodeFirst value={location} onChange={setLocation} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder={lang === "hi" ? "प्लॉट एरिया (sqft)" : "Plot area (sqft)"} value={form.plot_area_sqft} onChange={(e) => setForm({ ...form, plot_area_sqft: e.target.value })} className="rounded-xl" />
            <Input placeholder={lang === "hi" ? "बिल्ट-अप (sqft)" : "Built-up area (sqft)"} value={form.built_up_sqft} onChange={(e) => setForm({ ...form, built_up_sqft: e.target.value })} className="rounded-xl" />
            <Input placeholder={lang === "hi" ? "फ़्लोर" : "Floors"} value={form.floors} onChange={(e) => setForm({ ...form, floors: e.target.value })} className="rounded-xl" />
            <Input placeholder="BHK" value={form.bhk} onChange={(e) => setForm({ ...form, bhk: e.target.value })} className="rounded-xl" />
            <Input placeholder={lang === "hi" ? "बजट (₹)" : "Budget (₹)"} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="rounded-xl" />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="rounded-xl" onClick={() => setStep(0)}>{lang === "hi" ? "पीछे" : "Back"}</Button>
            <Button className="rounded-xl flex-1" onClick={finish}>
              {lang === "hi" ? "AI डैशबोर्ड खोलें" : "Open AI dashboard"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
