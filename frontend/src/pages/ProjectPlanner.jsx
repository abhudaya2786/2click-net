import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageSEO from "@/components/marketing/PageSEO";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { SUPER_COPY } from "@/lib/superAppCopy";
import ProjectDashboard from "@/components/project/ProjectDashboard";
import EmptyState, { LoadingSkeleton } from "@/components/superapp/EmptyState";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import ModuleWorkflowBanner from "@/components/marketing/ModuleWorkflowBanner";
import { CORE_PLATFORM_SCREENS } from "@/lib/platformScreenArchitecture";

const LS_KEY = "bs_two_click_project";

export default function ProjectPlanner() {
  const { lang } = useLang();
  const c = SUPER_COPY[lang] || SUPER_COPY.en;
  const hi = lang === "hi";
  const [input, setInput] = useState(null);
  const [busy, setBusy] = useState(false);
  const [planBusy, setPlanBusy] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setInput(JSON.parse(raw));
    } catch {}
  }, []);

  const generatePlan = async () => {
    if (!input) return;
    setPlanBusy(true);
    try {
      await api.post("/project-planner/plan", input);
      toast.success(hi ? "योजना सेव हो गई" : "Plan saved");
    } catch {
      toast.error(hi ? "योजना विफल" : "Plan failed");
    } finally {
      setPlanBusy(false);
    }
  };

  if (!input) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-14">
        <PageSEO title="AI Project Dashboard — 2click.in" path="/projects" />
        <EmptyState
          title={hi ? "कोई प्रोजेक्ट नहीं" : "No project yet"}
          description={hi ? "2-क्लिक फ्लो से शुरू करें।" : "Start with the 2-click flow."}
          actionLabel={hi ? "प्रोजेक्ट शुरू करें" : "Start my project"}
          onAction={() => window.location.href = "/build"}
        />
        <div className="mt-4 text-center">
          <Link to="/estimate" className="text-sm text-primary hover:underline">{c.estimateTitle}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8 py-10 md:py-14">
      <PageSEO title="AI Project Dashboard — 2click.in" path="/projects" />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> {c.plannerTitle}
          </p>
          <h1 className="font-display font-extrabold text-3xl tracking-tight">
            {input.project_type} · {input.city || input.state || "India"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {input.built_up_sqft} sqft · {input.floors || 1} {hi ? "फ़्लोर" : "floors"}
            {input.bhk ? ` · ${input.bhk}BHK` : ""} · {input.quality || "standard"} · {input.persona || "individual"}
          </p>
        </div>
        <Button className="rounded-xl" onClick={generatePlan} disabled={planBusy}>
          {planBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : c.generatePlan}
        </Button>
      </div>

      {(() => {
        const screenMeta = CORE_PLATFORM_SCREENS.find((s) => s.id === "projects");
        return screenMeta ? (
          <ModuleWorkflowBanner
            hi={hi}
            flowEn={screenMeta.flowEn}
            flowHi={screenMeta.flowHi}
            stepsEn={screenMeta.stepsEn}
            stepsHi={screenMeta.stepsHi}
          />
        ) : null;
      })()}

      {busy ? <LoadingSkeleton rows={8} /> : <ProjectDashboard input={input} />}
    </div>
  );
}
