import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLang } from "@/context/LanguageContext";
import { computeMaterialEstimate } from "@/lib/platformArchitecture";
import { buildFullWorkflow, computeLayoutZones, LIGHTING_FORMULA, FOV_DEFAULT } from "@/lib/ai3dStudio";
import { Download, Copy, Box, Sparkles, Store, Users } from "lucide-react";
import { toast } from "sonner";

function fmt(n) {
  return Number(n).toLocaleString("en-IN");
}

function ZoneCanvas({ zones, hi }) {
  if (!zones?.length) return null;
  return (
    <div className="grid grid-cols-2 gap-2 h-48 rounded-xl border border-border/60 bg-muted/20 p-3">
      {zones.map((z) => (
        <div
          key={z.id}
          className="rounded-lg border border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-center p-2"
          style={{ flex: z.pct }}
        >
          <span className="text-[10px] font-medium">{hi ? z.hi : z.en}</span>
          <span className="text-xs text-muted-foreground">{z.pct}% · {z.sqft} sqft</span>
        </div>
      ))}
    </div>
  );
}

export default function ProjectDashboard({ input }) {
  const { lang } = useLang();
  const hi = lang === "hi";
  const [tab, setTab] = useState("estimate");

  const builtUp = Number(input?.built_up_sqft) || Number(input?.plot_area_sqft) || 0;
  const projectType = input?.property_subtype === "villa_home"
    ? "villa"
    : (input?.project_type || "residential");
  const quality = input?.quality || "standard";
  const persona = input?.persona || "individual";

  const material = useMemo(
    () => computeMaterialEstimate({ builtUpSqft: builtUp, projectType, qualityTier: quality }),
    [builtUp, projectType, quality]
  );

  const zones = useMemo(() => computeLayoutZones(builtUp), [builtUp]);
  const workflow = useMemo(
    () => buildFullWorkflow({ builtUpSqft: builtUp || 400, style: projectType === "villa_home" ? "luxury" : "studio", lang }),
    [builtUp, projectType, lang]
  );

  const downloadBoq = () => {
    if (!material) return;
    const m = material.materials;
    const lines = [
      "buildecogroup.com — BOQ Estimate",
      `Project: ${projectType} · ${builtUp} sqft · ${quality}`,
      `Total: ₹${material.total_cost}`,
      "",
      `Cement: ${m.cement_bags} bags — ${material.brands.cement.join(", ")}`,
      `Steel: ${m.steel_kg} kg — ${material.brands.steel.join(", ")}`,
      m.bricks ? `Bricks: ${m.bricks} nos` : `AAC blocks: ${m.aac_blocks}`,
      `Tiles: ${m.tiles_sqft} sqft — ${material.brands.tiles.join(", ")}`,
      `Paint: ${m.paint_liters} L — ${material.brands.paint.join(", ")}`,
      `Sand: ${m.sand_cu_ft} cu.ft · Aggregate: ${m.aggregate_cu_ft} cu.ft`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "buildecogroup-boq.txt";
    a.click();
    toast.success(hi ? "BOQ डाउनलोड" : "BOQ downloaded");
  };

  const copyPrompt = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(hi ? "कॉपी हो गया" : "Copied");
  };

  const bulkPersona = persona === "company" || persona === "contractor";

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-2 border-b border-border/60 pb-2">
        <button
          type="button"
          onClick={() => setTab("estimate")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "estimate" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          {hi ? "सामग्री व लागत" : "Material & cost"}
        </button>
        <button
          type="button"
          onClick={() => setTab("design")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "design" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          {hi ? "AI 3D स्टूडियो" : "AI 3D studio"}
        </button>
      </div>

      {bulkPersona && tab === "estimate" && (
        <div className="glass-card rounded-xl p-4 border border-primary/30 flex flex-wrap gap-3 items-center">
          <Users className="h-5 w-5 text-primary" />
          <p className="text-sm flex-1">{hi ? "बल्क खरीद, विक्रेता सूची और प्रोजेक्ट शेड्यूलिंग उपलब्ध।" : "Bulk purchasing, vendor lists and project scheduling available."}</p>
          <Link to="/mart"><Button size="sm" variant="outline" className="rounded-xl">Super Mart</Button></Link>
          <Link to="/professionals"><Button size="sm" className="rounded-xl">Vendors</Button></Link>
        </div>
      )}

      {tab === "estimate" && material && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6 border border-border/60 space-y-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{hi ? "कुल अनुमानित लागत" : "Total estimated cost"}</p>
            <p className="text-3xl font-display font-bold">₹ {fmt(material.total_cost)}</p>
            <p className="text-xs text-muted-foreground">₹{material.rate_per_sqft}/sqft · {projectType}</p>
            <ul className="space-y-3 text-sm">
              <li className="border-b border-border/40 pb-2">
                <strong>{hi ? "सीमेंट" : "Cement"}:</strong> {fmt(material.materials.cement_bags)} bags
                <br /><small className="text-muted-foreground">{material.brands.cement.join(", ")}</small>
              </li>
              <li className="border-b border-border/40 pb-2">
                <strong>{hi ? "सरिया" : "Steel"}:</strong> {fmt(material.materials.steel_kg)} kg
                <br /><small className="text-muted-foreground">{material.brands.steel.join(", ")}</small>
              </li>
              <li className="border-b border-border/40 pb-2">
                <strong>{hi ? "ईंटें" : "Bricks"}:</strong> {material.materials.bricks ? `${fmt(material.materials.bricks)} red` : `${fmt(material.materials.aac_blocks)} AAC`}
              </li>
              <li className="border-b border-border/40 pb-2">
                <strong>{hi ? "टाइल्स" : "Tiles"}:</strong> {fmt(material.materials.tiles_sqft)} sqft
                <br /><small className="text-muted-foreground">{material.brands.tiles.join(", ")}</small>
              </li>
              <li className="border-b border-border/40 pb-2">
                <strong>{hi ? "पेंट" : "Paint"}:</strong> {fmt(material.materials.paint_liters)} L
                <br /><small className="text-muted-foreground">{material.brands.paint.join(", ")}</small>
              </li>
              <li><strong>{hi ? "बालू" : "Sand"}:</strong> {fmt(material.materials.sand_cu_ft)} cu.ft · <strong>{hi ? "गिट्टी" : "Aggregate"}:</strong> {fmt(material.materials.aggregate_cu_ft)} cu.ft</li>
            </ul>
            <Button className="w-full rounded-xl" onClick={downloadBoq}>
              <Download className="h-4 w-4 mr-2" /> {hi ? "BOQ PDF डाउनलोड" : "Download BOQ"}
            </Button>
            <Link to="/store" className="block">
              <Button variant="outline" className="w-full rounded-xl"><Store className="h-4 w-4 mr-2" /> {hi ? "स्टोर में खरीदें" : "Buy in store"}</Button>
            </Link>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-border/60">
            <h3 className="font-display font-bold mb-4">{hi ? "फॉर्मूला" : "Formulas"}</h3>
            <div className="text-xs font-mono space-y-1 text-muted-foreground">
              <p>Cement = A × {material.coefficients.cement}</p>
              <p>Steel = A × {material.coefficients.steel} kg/sqft</p>
              <p>Bricks = A × {material.coefficients.bricks}</p>
              <p>Tiles = A × {material.coefficients.tiles}</p>
              <p>Paint = A × {material.coefficients.paint} L</p>
              <p>Cost = A × ₹{material.rate_per_sqft}</p>
            </div>
          </div>
        </div>
      )}

      {tab === "design" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-6 border border-border/60">
              <h3 className="font-display font-bold mb-2 flex items-center gap-2">
                <Box className="h-5 w-5 text-primary" /> {hi ? "2D फ्लोर प्लान ग्रिड" : "2D floor plan grid"}
              </h3>
              <ZoneCanvas zones={zones} hi={hi} />
              <p className="text-xs text-muted-foreground mt-3">
                FOV: {FOV_DEFAULT}° · {hi ? "लाइटिंग" : "Lighting"}: Key {LIGHTING_FORMULA.key.pct}% · Fill {LIGHTING_FORMULA.fill.pct}% · Back {LIGHTING_FORMULA.ambient.pct}%
              </p>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-dashed border-border/60 h-32 flex items-center justify-center text-sm text-muted-foreground">
              {hi ? "3D कैनवस — API कनेक्ट होने पर इंटरैक्टिव व्यू" : "3D canvas — interactive view when API connected"}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-border/60 space-y-4">
            <h3 className="font-display font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> {hi ? "AI प्रॉम्प्ट जनरेटर" : "AI prompt generator"}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{workflow.prompts.prompt2}</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="rounded-xl" onClick={() => copyPrompt(workflow.prompts.prompt2)}>
                <Copy className="h-3.5 w-3.5 mr-1" /> {hi ? "कॉपी प्रॉम्प्ट" : "Copy prompt"}
              </Button>
              <Link to="/design"><Button size="sm" className="rounded-xl">{hi ? "पूरा 5-फेज वर्कफ़्लो" : "Full 5-phase workflow"}</Button></Link>
            </div>
            <Button className="w-full rounded-xl" variant="secondary" onClick={() => toast.info(hi ? "रेंडर API जल्द" : "Render API coming soon")}>
              {hi ? "फोटोरियलिस्टिक रेंडर जनरेट" : "Generate photorealistic render"}
            </Button>
            <Button className="w-full rounded-xl" variant="outline" onClick={() => toast.info(hi ? "CAD/GLTF एक्सपोर्ट जल्द" : "CAD/GLTF export coming soon")}>
              {hi ? "3D CAD/GLTF एक्सपोर्ट" : "Export 3D CAD/GLTF"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
