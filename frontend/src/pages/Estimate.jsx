import { useState } from "react";
import { Link } from "react-router-dom";
import PageSEO from "@/components/marketing/PageSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LocationPicker from "@/components/location/LocationPicker";
import { api } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { SUPER_COPY } from "@/lib/superAppCopy";
import { LoadingSkeleton } from "@/components/superapp/EmptyState";
import MaterialCalculator from "@/components/calculator/MaterialCalculator";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";

const QUALITIES = ["low", "standard", "premium", "luxury"];

export default function Estimate() {
  const { lang } = useLang();
  const c = SUPER_COPY[lang] || SUPER_COPY.en;
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [location, setLocation] = useState({ state: "", city: "", district: "", pincode: "" });
  const [form, setForm] = useState({
    project_type: "residential",
    plot_area_sqft: "",
    built_up_sqft: "",
    floors: "1",
    bhk: "",
    quality: "standard",
    structure_type: "rcc",
    interior_level: "basic",
    solar_required: false,
    monthly_bill: "",
  });

  const qLabel = (q) => {
    const map = { low: c.qualityLow, standard: c.qualityStandard, premium: c.qualityPremium, luxury: c.qualityLuxury };
    return map[q] || q;
  };

  const run = async () => {
    setBusy(true);
    try {
      const payload = {
        project_type: form.project_type,
        state: location.state,
        city: location.city,
        pincode: location.pincode,
        plot_area_sqft: Number(form.plot_area_sqft) || 0,
        built_up_sqft: Number(form.built_up_sqft) || 0,
        floors: Number(form.floors) || 1,
        bhk: Number(form.bhk) || 0,
        quality: form.quality,
        structure_type: form.structure_type,
        interior_level: form.interior_level,
        solar_required: form.solar_required,
        monthly_bill: Number(form.monthly_bill) || 0,
      };
      const { data } = await api.post("/project-planner/estimate", payload);
      setResult(data.result);
    } catch {
      toast.error(lang === "hi" ? "अनुमान विफल" : "Estimate failed");
    } finally {
      setBusy(false);
    }
  };

  const downloadPdf = () => {
    if (!result) return;
    const text = Object.entries(result.breakdown || {})
      .map(([k, v]) => `${k}: ₹${v.toLocaleString("en-IN")}`)
      .join("\n");
    const blob = new Blob([`2click.in Estimate\n\nTotal: ₹${result.total_estimated_cost}\n\n${text}`], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "2click-estimate.txt";
    a.click();
    toast.success(lang === "hi" ? "कोटेशन डाउनलोड" : "Quotation downloaded");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-10 md:py-14">
      <PageSEO title="Cost calculator — 2click.in" description="Construction cost estimate" path="/estimate" />
      <h1 className="font-display font-extrabold text-3xl tracking-tight">{c.estimateTitle}</h1>
      <p className="text-sm text-muted-foreground mt-2">
        {lang === "hi" ? "स्थान, क्षेत्रफल और गुणवत्ता — तुरंत विस्तृत अनुमान।" : "Location, area and quality — instant detailed estimate."}
      </p>

      <div className="mt-8 grid lg:grid-cols-2 gap-8">
        <div className="space-y-4 glass-card p-6 rounded-2xl border border-border/60">
          <LocationPicker pincodeFirst value={location} onChange={setLocation} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="Plot sqft" value={form.plot_area_sqft} onChange={(e) => setForm({ ...form, plot_area_sqft: e.target.value })} className="rounded-xl" />
            <Input placeholder="Built-up sqft" value={form.built_up_sqft} onChange={(e) => setForm({ ...form, built_up_sqft: e.target.value })} className="rounded-xl" />
            <Input placeholder="Floors" value={form.floors} onChange={(e) => setForm({ ...form, floors: e.target.value })} className="rounded-xl" />
            <Input placeholder="BHK" value={form.bhk} onChange={(e) => setForm({ ...form, bhk: e.target.value })} className="rounded-xl" />
            <select value={form.quality} onChange={(e) => setForm({ ...form, quality: e.target.value })} className="h-10 border rounded-xl px-3 text-sm">
              {QUALITIES.map((q) => <option key={q} value={q}>{qLabel(q)}</option>)}
            </select>
            <Input placeholder="Monthly bill (solar)" value={form.monthly_bill} onChange={(e) => setForm({ ...form, monthly_bill: e.target.value })} className="rounded-xl" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.solar_required} onChange={(e) => setForm({ ...form, solar_required: e.target.checked })} />
            {lang === "hi" ? "सोलर आवश्यक" : "Include solar"}
          </label>
          <Button className="w-full rounded-xl h-11" onClick={run} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (lang === "hi" ? "अनुमान लगाएं" : "Calculate estimate")}
          </Button>
        </div>

        <div className="space-y-4">
          {busy && <LoadingSkeleton rows={6} />}
          {!busy && !result && (
            <p className="text-sm text-muted-foreground p-6 border border-dashed rounded-2xl">
              {lang === "hi" ? "विवरण भरें और अनुमान लगाएं।" : "Fill details and calculate."}
            </p>
          )}
          {result && (
            <div className="glass-card p-6 rounded-2xl border border-border/60 space-y-4">
              <p className="text-2xl font-display font-bold">
                ₹{result.total_estimated_cost?.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground">
                {result.duration_months} months · {result.built_up_sqft} sqft built-up
              </p>
              <div className="space-y-1 text-sm">
                {Object.entries(result.breakdown || {}).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border/40 py-1.5">
                    <span className="capitalize text-muted-foreground">{k.replace(/_/g, " ")}</span>
                    <span className="font-mono">₹{Number(v).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              {result.quality_tiers && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(result.quality_tiers).map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-muted/50 px-2 py-1.5">
                      <span className="font-medium">{qLabel(k)}:</span> ₹{v.toLocaleString("en-IN")}
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" className="rounded-xl w-full" onClick={downloadPdf}>
                <Download className="h-4 w-4 mr-2" /> {c.downloadPdf}
              </Button>
              <Link to="/projects" className="block text-center text-sm text-primary hover:underline">
                {c.generatePlan}
              </Link>
            </div>
          )}
        </div>
      </div>

      <section className="mt-14 border-t border-border/40 pt-12">
        <h2 className="font-display font-bold text-xl mb-2 text-center">
          {lang === "hi" ? "मकान निर्माण सामग्री कैलकुलेटर" : "House material calculator"}
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-8 max-w-xl mx-auto">
          {lang === "hi"
            ? "सीमेंट, सरिया, ईंट, टाइल्स और पेंट — बिल्ट-अप एरिया से तुरंत अनुमान"
            : "Cement, steel, bricks, tiles and paint — instant estimate from built-up area"}
        </p>
        <MaterialCalculator embedded />
      </section>
    </div>
  );
}
