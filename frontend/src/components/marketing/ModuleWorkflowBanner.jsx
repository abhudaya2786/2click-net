import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * Compact step-by-step workflow banner for module screens.
 */
export default function ModuleWorkflowBanner({
  flowEn,
  flowHi,
  stepsEn,
  stepsHi,
  hi = false,
  platformLink = true,
}) {
  const flow = hi ? flowHi : flowEn;
  const steps = hi ? stepsHi : stepsEn;

  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 md:p-5 mb-8" data-testid="module-workflow-banner">
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
        {hi ? "क्लिक-दर-क्लिक वर्कफ़्लो" : "Click-by-click workflow"}
      </p>
      <p className="text-sm font-medium text-foreground">{flow}</p>
      <ol className="mt-3 space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
        {steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      {platformLink && (
        <Link
          to="/platform"
          className="inline-flex items-center gap-1 text-xs text-primary mt-3 hover:underline"
        >
          {hi ? "पूर्ण प्लेटफ़ॉर्म मैप" : "Full platform map"}
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
