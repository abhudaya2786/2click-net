import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageSEO from "@/components/marketing/PageSEO";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { SUPER_COPY } from "@/lib/superAppCopy";
import { ProjectJourneyTimeline } from "@/components/superapp/ProjectJourney";
import EmptyState, { LoadingSkeleton } from "@/components/superapp/EmptyState";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const LS_KEY = "bs_two_click_project";

export default function ProjectPlanner() {
  const { lang } = useLang();
  const c = SUPER_COPY[lang] || SUPER_COPY.en;
  const [input, setInput] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [planBusy, setPlanBusy] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setInput(JSON.parse(raw));
    } catch {}
  }, []);

  const loadEstimate = async (payload) => {
    setBusy(true);
    try {
      const { data } = await api.post("/project-planner/estimate", payload);
      setResult(data.result);
    } catch {
      toast.error(lang === "hi" ? "अनुमान लोड विफल" : "Could not load estimate");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (input) loadEstimate(input);
  }, [input]);

  const generatePlan = async () => {
    if (!input) return;
    setPlanBusy(true);
    try {
      const { data } = await api.post("/project-planner/plan", input);
      setResult(data);
      toast.success(lang === "hi" ? "योजना बनाई गई" : "Project plan generated");
    } catch {
      toast.error(lang === "hi" ? "योजना विफल" : "Plan generation failed");
    } finally {
      setPlanBusy(false);
    }
  };

  if (!input && !busy) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-14">
        <PageSEO title="AI Project Dashboard — 2click.in" path="/projects" />
        <EmptyState
          title={lang === "hi" ? "कोई प्रोजेक्ट नहीं" : "No project yet"}
          description={lang === "hi" ? "2-क्लिक फ्लो से शुरू करें या अनुमान पेज पर जाएँ।" : "Start with the 2-click flow or use the cost calculator."}
          actionLabel={lang === "hi" ? "प्रोजेक्ट शुरू करें" : "Start my project"}
          onAction={() => window.location.href = "/build"}
        />
        <div className="mt-4 text-center">
          <Link to="/estimate" className="text-sm text-primary hover:underline">{c.estimateTitle}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-10 md:py-14">
      <PageSEO title="AI Project Dashboard — 2click.in" path="/projects" />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> {c.plannerTitle}
          </p>
          <h1 className="font-display font-extrabold text-3xl tracking-tight">
            {input?.project_type || "Project"} · {input?.city || input?.state || "India"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {input?.built_up_sqft || input?.plot_area_sqft} sqft · {input?.floors} floors · {input?.bhk || "—"} BHK
          </p>
        </div>
        <Button className="rounded-xl" onClick={generatePlan} disabled={planBusy || busy}>
          {planBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : c.generatePlan}
        </Button>
      </div>

      {busy && <LoadingSkeleton rows={8} />}

      {result && !busy && (
        <div className="space-y-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-5 border border-border/60">
              <p className="text-xs text-muted-foreground">{lang === "hi" ? "कुल अनुमान" : "Total estimate"}</p>
              <p className="text-2xl font-display font-bold mt-1">₹{result.total_estimated_cost?.toLocaleString("en-IN")}</p>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-border/60">
              <p className="text-xs text-muted-foreground">{lang === "hi" ? "अवधि" : "Duration"}</p>
              <p className="text-2xl font-display font-bold mt-1">{result.duration_months} mo</p>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-border/60">
              <p className="text-xs text-muted-foreground">{lang === "hi" ? "सोलर" : "Solar"}</p>
              <p className="text-2xl font-display font-bold mt-1">{result.solar_kw || 0} kW</p>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-border/60">
              <p className="text-xs text-muted-foreground">{lang === "hi" ? "पैकेज" : "Package"}</p>
              <p className="text-2xl font-display font-bold mt-1 capitalize">{result.recommended_package}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="glass-card rounded-2xl p-6 border border-border/60">
              <h2 className="font-display font-bold text-lg mb-4">{lang === "hi" ? "लागत विवरण" : "Cost breakdown"}</h2>
              <div className="space-y-1 text-sm">
                {Object.entries(result.breakdown || {}).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border/40 py-2">
                    <span className="capitalize text-muted-foreground">{k.replace(/_/g, " ")}</span>
                    <span className="font-mono">₹{Number(v).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              {result.boq_hint && (
                <p className="text-xs text-muted-foreground mt-4">{result.boq_hint}</p>
              )}
              {result.labour_hint && (
                <p className="text-xs text-muted-foreground">{result.labour_hint}</p>
              )}
            </div>

            <div>
              <h2 className="font-display font-bold text-lg mb-4">{lang === "hi" ? "प्रोजेक्ट यात्रा" : "Project journey"}</h2>
              <ProjectJourneyTimeline stages={result.journey} lang={lang} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/estimate"><Button variant="outline" className="rounded-xl">{c.estimateTitle}</Button></Link>
            <Link to="/store"><Button variant="outline" className="rounded-xl">{c.nav.materials}</Button></Link>
            <Link to="/professionals"><Button variant="outline" className="rounded-xl">{c.nav.professionals}</Button></Link>
            <Link to="/dashboard"><Button className="rounded-xl">{lang === "hi" ? "पूर्ण डैशबोर्ड" : "Full dashboard"} <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </div>
      )}
    </div>
  );
}
