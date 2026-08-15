import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/context/LanguageContext";
import {
  FORMULA_PIPELINE,
  SCALE_OPTIONS,
  LIGHTING_FORMULA,
  AI_DESIGN_TOOLS,
  WORKFLOW_PHASES,
  FOV_MIN,
  FOV_MAX,
  FOV_DEFAULT,
  computeLayoutZones,
  buildFullWorkflow,
} from "@/lib/ai3dStudio";
import { DESIGN_FEATURE_MODULES, DESIGN_STYLES } from "@/lib/platformScreenArchitecture";
import { api } from "@/lib/api";
import {
  Sparkles, Copy, Layout, Sun, Camera, ExternalLink, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

function PromptBlock({ label, text, hi, onCopy }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-border/60 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 text-sm font-medium"
      >
        {label}
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="p-4">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{text}</p>
          <Button variant="outline" size="sm" className="mt-3 rounded-xl" onClick={() => onCopy(text)}>
            <Copy className="h-3.5 w-3.5 mr-2" /> {hi ? "कॉपी" : "Copy"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function Ai3dHomeStudio() {
  const { lang } = useLang();
  const hi = lang === "hi";

  const [builtUp, setBuiltUp] = useState("400");
  const [style, setStyle] = useState("modern");
  const [featureModule, setFeatureModule] = useState("interior");
  const [roomPrompt, setRoomPrompt] = useState("");
  const [scale, setScale] = useState("1:50");
  const [fov, setFov] = useState(FOV_DEFAULT);
  const [extra, setExtra] = useState("");
  const [workflow, setWorkflow] = useState(() =>
    buildFullWorkflow({ builtUpSqft: 400, style: "modern", scale: "1:50", fov: FOV_DEFAULT, lang })
  );
  const [busy, setBusy] = useState(false);

  const zones = useMemo(() => computeLayoutZones(parseFloat(builtUp) || 0), [builtUp]);

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(hi ? "कॉपी हो गया" : "Copied");
  };

  useEffect(() => {
    const sqft = parseFloat(builtUp) || 400;
    setWorkflow(buildFullWorkflow({ builtUpSqft: sqft, style, scale, fov, extra, lang }));
  }, [builtUp, style, scale, fov, extra, lang]);

  const activeFeature = DESIGN_FEATURE_MODULES.find((f) => f.id === featureModule);
  const styleLabel = DESIGN_STYLES.find((s) => s.id === style);

  const generate = async () => {
    const sqft = parseFloat(builtUp);
    if (!sqft || sqft <= 0) {
      toast.error(hi ? "बिल्ट-अप एरिया दर्ज करें" : "Enter built-up area");
      return;
    }
    const prefix = hi ? activeFeature?.promptPrefixHi : activeFeature?.promptPrefixEn;
    const room = roomPrompt.trim();
    const composedExtra = [
      prefix && room ? `${prefix} ${room}` : room,
      styleLabel ? (hi ? styleLabel.hi : styleLabel.en) : style,
    ].filter(Boolean).join(" · ");
    setBusy(true);
    const local = buildFullWorkflow({ builtUpSqft: sqft, style, scale, fov, extra: composedExtra, lang });
    try {
      const { data } = await api.post("/design-studio/workflow", {
        built_up_sqft: sqft,
        style,
        scale,
        fov,
        extra: composedExtra,
        feature_module: featureModule,
        lang,
      });
      setWorkflow(data.workflow || local);
    } catch {
      setWorkflow(local);
    } finally {
      setBusy(false);
      toast.success(hi ? "5-चरण वर्कफ़्लो तैयार" : "5-phase workflow ready");
    }
  };

  const prompts = workflow?.prompts;
  const phasePrompt = (key) => prompts?.[key] || "";

  return (
    <div className="space-y-10">
      {/* AI feature modules */}
      <section>
        <h2 className="font-display font-bold text-lg mb-3">
          {hi ? "AI फ़ीचर मॉड्यूल" : "AI feature modules"}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {DESIGN_FEATURE_MODULES.map((f) => (
            <button
              key={f.id}
              type="button"
              data-testid={`design-feature-${f.id}`}
              onClick={() => setFeatureModule(f.id)}
              className={`p-3 rounded-xl border text-sm text-left transition-colors ${
                featureModule === f.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
              }`}
            >
              {hi ? f.hi : f.en}
            </button>
          ))}
        </div>
      </section>

      {/* Formula pipeline */}
      <section>
        <h2 className="font-display font-bold text-lg mb-2">
          {hi ? "AI पाइपलाइन फार्मूला" : "AI pipeline formula"}
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          {hi
            ? "2D Blueprint → Depth Map → 3D Mesh → Material Mapping → Render"
            : "2D Blueprint → Depth Map → 3D Mesh → Material Mapping → Render"}
        </p>
        <div className="flex flex-wrap gap-2">
          {FORMULA_PIPELINE.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <span className="glass-card text-xs px-3 py-1.5 rounded-full border border-border/60 font-medium">
                {i + 1}. {hi ? step.hi : step.en}
              </span>
              {i < FORMULA_PIPELINE.length - 1 && <span className="text-muted-foreground text-xs">→</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Config */}
      <div className="glass-card rounded-2xl p-6 border border-border/60 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">{hi ? "बिल्ट-अप (sqft)" : "Built-up (sqft)"}</label>
          <Input value={builtUp} onChange={(e) => setBuiltUp(e.target.value)} type="number" min="1" className="rounded-xl" />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">{hi ? "स्टाइल" : "Style"}</label>
          <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full h-10 border rounded-xl px-3 text-sm bg-background" data-testid="design-style-select">
            {DESIGN_STYLES.map((s) => (
              <option key={s.id} value={s.id}>{hi ? s.hi : s.en}</option>
            ))}
            <option value="studio">{hi ? "3D Home Studio" : "3D Home Studio"}</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">{hi ? "स्केल" : "Scale"}</label>
          <select value={scale} onChange={(e) => setScale(e.target.value)} className="w-full h-10 border rounded-xl px-3 text-sm bg-background">
            {SCALE_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>{hi ? s.labelHi : s.labelEn}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Camera className="h-4 w-4" /> FOV: {fov}°
          </label>
          <input type="range" min={FOV_MIN} max={FOV_MAX} value={fov} onChange={(e) => setFov(Number(e.target.value))} className="w-full" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium mb-2 block">{hi ? "रूम / एरिया प्रॉम्प्ट" : "Room / area prompt"}</label>
          <Input
            value={roomPrompt}
            onChange={(e) => setRoomPrompt(e.target.value)}
            placeholder={hi ? "जैसे: 3BHK लिविंग रूम, आधुनिक वुड पैनलिंग…" : "e.g. 3BHK living room with modern wood panelling…"}
            className="rounded-xl"
            data-testid="design-room-prompt"
          />
        </div>
        <div className="sm:col-span-2">
          <Input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder={hi ? "अतिरिक्त विवरण…" : "Extra details…"} className="rounded-xl" />
        </div>
        <Button className="sm:col-span-2 rounded-xl h-11" onClick={generate} disabled={busy} data-testid="generate-design-btn">
          <Sparkles className="h-4 w-4 mr-2" />
          {hi ? "डिज़ाइन जनरेट करें" : "Generate design"}
        </Button>
      </div>

      {/* Layout zones */}
      {zones && (
        <section>
          <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
            <Layout className="h-5 w-5 text-primary" />
            {hi ? "स्पेस ज़ोनिंग" : "Space zoning"}
          </h2>
          <div className="space-y-3">
            {zones.map((z) => (
              <div key={z.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{hi ? z.hi : z.en}</span>
                  <span className="text-muted-foreground">{z.pct}% · {z.sqft} sqft</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${z.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5 Phase workflow — all phases visible */}
      {workflow && (
        <section className="space-y-6">
          <h2 className="font-display font-bold text-xl">
            {hi ? "चरणबद्ध AI 3D वर्कफ़्लो" : "Step-by-step AI 3D workflow"}
          </h2>

          {WORKFLOW_PHASES.map((phase) => {
            const promptText = phasePrompt(phase.promptKey);
            return (
              <div key={phase.id} className="glass-card rounded-2xl border border-border/60">
                <div className="flex items-start gap-4 p-5">
                  <span className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {phase.phase}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold">{hi ? phase.hi : phase.en}</p>
                    <p className="text-xs text-primary mt-1">{phase.tools}</p>
                  </div>
                  <a href={phase.toolUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary shrink-0">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <div className="px-5 pb-5 space-y-4 border-t border-border/40 pt-4">
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    {(hi ? phase.stepsHi : phase.stepsEn).map((s) => <li key={s}>{s}</li>)}
                  </ol>
                  {promptText && (
                    <PromptBlock
                      label={hi ? `AI Prompt ${phase.phase}` : `AI Prompt ${phase.phase}`}
                      text={promptText}
                      hi={hi}
                      onCopy={copy}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Lighting */}
      <section>
        <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
          <Sun className="h-5 w-5 text-primary" />
          {hi ? "3-पॉइंट लाइटिंग (Phase 5)" : "3-point lighting (Phase 5)"}
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {Object.entries(LIGHTING_FORMULA).map(([key, l]) => (
            <div key={key} className="glass-card rounded-xl p-4 border border-border/60 text-center">
              <p className="text-2xl font-display font-bold text-primary">{l.pct}%</p>
              <p className="text-xs text-muted-foreground mt-1">{hi ? l.hi : l.en}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tools table */}
      <section>
        <h2 className="font-display font-bold text-lg mb-4">{hi ? "AI Studio टूल्स" : "AI Studio tools"}</h2>
        <div className="overflow-x-auto rounded-2xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">{hi ? "श्रेणी" : "Category"}</th>
                <th className="text-left p-3">{hi ? "टूल" : "Tool"}</th>
                <th className="text-left p-3">{hi ? "उपयोग" : "Use"}</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {AI_DESIGN_TOOLS.map((row) => (
                <tr key={row.tool} className="border-t border-border/40">
                  <td className="p-3 text-muted-foreground">{hi ? row.categoryHi : row.categoryEn}</td>
                  <td className="p-3 font-medium">{row.tool}</td>
                  <td className="p-3 text-muted-foreground">{hi ? row.useHi : row.useEn}</td>
                  <td className="p-3">
                    <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline inline-flex items-center gap-1">
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
