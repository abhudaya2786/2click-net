import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { useDemoMode } from "@/context/DemoModeContext";
import PageSEO from "@/components/marketing/PageSEO";
import { DEMO_BOQ_SECTIONS, demoBoqCatalog, demoGenerateBOQ } from "@/lib/demoData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  buildBOQPrintHtml, buildBOQShareText, copyToClipboard, printHtml, shareViaEmail,
} from "@/lib/printShare";
import {
  ArrowLeft, Check, ClipboardList, Loader2, Plus, Printer, Share2,
  Sparkles, Trash2, Wand2,
} from "lucide-react";
import { toast } from "sonner";
import ModuleWorkflowBanner from "@/components/marketing/ModuleWorkflowBanner";
import { MODULE_SCREENS } from "@/lib/moduleUpgrades";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function FullBOQBuilder() {
  const { lang } = useLang();
  const hi = lang === "hi";
  const { demoMode, markSampleData, enableDemo, usingSampleData } = useDemoMode();

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [step, setStep] = useState("select");
  const [activeSection, setActiveSection] = useState(null);
  const [catalogs, setCatalogs] = useState({});
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [manualLines, setManualLines] = useState([]);
  const [boq, setBoq] = useState(null);
  const [generating, setGenerating] = useState(false);

  const [pickProduct, setPickProduct] = useState("");
  const [pickBrandId, setPickBrandId] = useState("");
  const [pickQty, setPickQty] = useState("");
  const [loadError, setLoadError] = useState(false);

  const loadSections = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    api.get("/mart/boq-builder/sections")
      .then(({ data }) => {
        setSections(data || []);
        markSampleData(false);
      })
      .catch(() => {
        enableDemo();
        setSections(DEMO_BOQ_SECTIONS);
        setLoadError(false);
        markSampleData(true);
        toast.message(hi ? "डेमो BOQ स्टोर दिखाए जा रहे हैं" : "Showing demo BOQ stores");
      })
      .finally(() => setLoading(false));
  }, [hi, markSampleData, enableDemo]);

  useEffect(() => {
    if (demoMode) {
      setSections(DEMO_BOQ_SECTIONS);
      markSampleData(true);
      setLoading(false);
    } else {
      loadSections();
    }
  }, [demoMode, loadSections, markSampleData]);

  const toggleSection = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(sections.map((s) => s.id)));
  const clearAll = () => setSelected(new Set());

  const loadCatalogs = useCallback(async (ids) => {
    setCatalogLoading(true);
    const entries = {};
    await Promise.all(
      ids.map(async (sid) => {
        try {
          const { data } = await api.get(`/mart/boq-builder/sections/${sid}/catalog`);
          entries[sid] = data;
        } catch {
          entries[sid] = demoBoqCatalog(sid);
          markSampleData(true);
        }
      }),
    );
    setCatalogs((prev) => ({ ...prev, ...entries }));
    setCatalogLoading(false);
  }, [markSampleData]);

  const goToBuild = async () => {
    if (selected.size === 0) {
      toast.error(hi ? "कम से कम एक स्टोर चुनें" : "Select at least one store");
      return;
    }
    const ids = [...selected];
    setActiveSection(ids[0]);
    setStep("build");
    await loadCatalogs(ids);
  };

  const activeCatalog = activeSection ? catalogs[activeSection] : null;
  const activeProducts = activeCatalog?.products || [];
  const activeProduct = activeProducts.find((p) => p.name === pickProduct);
  const brandOptions = activeProduct?.brands || [];

  useEffect(() => {
    if (!activeSection || !catalogs[activeSection]) return;
    const prods = catalogs[activeSection].products || [];
    if (!prods.length) return;
    setPickProduct(prods[0].name);
    setPickBrandId(prods[0].brands?.[0]?.id || "");
  }, [activeSection, catalogs]);

  useEffect(() => {
    if (activeProduct?.brands?.length) {
      const ok = activeProduct.brands.some((b) => b.id === pickBrandId);
      if (!ok) setPickBrandId(activeProduct.brands[0].id);
    }
  }, [pickProduct, activeProduct, pickBrandId]);

  const selectedBrand = brandOptions.find((b) => b.id === pickBrandId);
  const pickEstimate = selectedBrand && pickQty && Number(pickQty) > 0
    ? Math.round(selectedBrand.rate * Number(pickQty) * 100) / 100
    : null;

  const addManualLine = () => {
    if (!activeSection || !selectedBrand) return;
    const q = Number(pickQty);
    if (!q || q <= 0) {
      toast.error(hi ? "मात्रा दर्ज करें" : "Enter quantity");
      return;
    }
    const sec = sections.find((s) => s.id === activeSection);
    setManualLines((prev) => [
      ...prev,
      {
        key: Date.now() + Math.random(),
        material_id: selectedBrand.id,
        section_id: activeSection,
        section_name: hi ? sec?.name_hi || sec?.name : sec?.name,
        name: activeProduct.name,
        brand: selectedBrand.brand,
        unit: selectedBrand.unit,
        rate: selectedBrand.rate,
        qty: q,
        amount: Math.round(selectedBrand.rate * q * 100) / 100,
        image: selectedBrand.image,
      },
    ]);
    setPickQty("");
    toast.success(hi ? "जोड़ा गया" : "Added");
  };

  const removeManualLine = (key) => setManualLines((prev) => prev.filter((l) => l.key !== key));

  const manualBySection = useMemo(() => {
    const map = {};
    manualLines.forEach((l) => {
      map[l.section_id] = (map[l.section_id] || 0) + l.amount;
    });
    return map;
  }, [manualLines]);

  const generateBOQ = async () => {
    setGenerating(true);
    try {
      const sectionIds = [...selected];
      const lines = manualLines.map((l) => ({
        material_id: l.material_id,
        qty: l.qty,
        section_id: l.section_id,
      }));
      if (demoMode || usingSampleData) {
        const data = demoGenerateBOQ(sectionIds, manualLines);
        setBoq(data);
        setStep("result");
        toast.success(hi ? "डेमो BOQ जनरेट हो गया" : "Demo BOQ generated");
        return;
      }
      const { data } = await api.post("/mart/boq-builder/generate", {
        lines,
        sections: sectionIds,
      });
      setBoq(data);
      setStep("result");
      toast.success(hi ? "BOQ जनरेट हो गया" : "BOQ generated");
    } catch {
      const sectionIds = [...selected];
      const data = demoGenerateBOQ(sectionIds, manualLines);
      setBoq(data);
      setStep("result");
      markSampleData(true);
      toast.success(hi ? "डेमो BOQ (सैंपल)" : "Demo BOQ (sample data)");
    } finally {
      setGenerating(false);
    }
  };

  const onPrint = () => {
    if (!boq) return;
    printHtml(hi ? "पूरा घर BOQ" : "Full Home BOQ", buildBOQPrintHtml(boq, lang));
  };

  const onShare = async () => {
    if (!boq) return;
    const text = buildBOQShareText(boq, lang);
    try {
      await copyToClipboard(text);
      toast.success(hi ? "कॉपी हो गया" : "Copied to clipboard");
    } catch {
      shareViaEmail(hi ? "2click BOQ" : "2click BOQ", text);
    }
  };

  const screenMeta = MODULE_SCREENS.find((m) => m.id === "boq-builder");
  const stepLabels = hi
    ? ["स्टोर चयन", "आइटम चुनें", "BOQ परिणाम"]
    : ["Store selection", "Pick items", "BOQ result"];
  const workflowStep = step === "select" ? 0 : step === "build" ? 1 : 2;

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="full-boq-builder">
      <PageSEO
        title={hi ? "पूरा घर BOQ बिल्डर" : "Full Home BOQ Builder"}
        description={hi
          ? "प्लंबर, इलेक्ट्रिकल, पेंट, किचन, बाथरूम — सभी स्टोर चुनें और BOQ जनरेट करें।"
          : "Select plumber, electrical, paint, kitchen, bathroom stores — generate full BOQ."}
        path="/boq-builder"
      />

      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-10">
        <Link to="/store" className="text-sm text-primary hover:underline flex items-center gap-1 mb-4">
          <ArrowLeft className="h-3.5 w-3.5" />
          {hi ? "स्टोर" : "Store"}
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-primary">
              {hi ? "मल्टी-स्टोर BOQ" : "Multi-store BOQ"}
            </span>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">
              {hi ? "पूरा घर BOQ बिल्डर" : "Full Home BOQ Builder"}
            </h1>
            <p className="mt-3 text-muted-foreground text-sm">
              {hi
                ? "प्लंबर, इलेक्ट्रिकल, वायर, स्विच, पेंट, पुट्टी, PVC पैनल, किचन, बाथरूम, बेडरूम, लॉबी, TV पैनल — सभी चुनें → BOQ जनरेट।"
                : "Plumber, electrical, wire, switch, paint, putty, PVC panel, kitchen, bathroom, bedroom, lobby, TV panel — select all → generate BOQ."}
            </p>
          </div>
          {boq && step === "result" && (
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-muted-foreground">{hi ? "कुल योग" : "Grand total"}</div>
              <div className="font-display font-extrabold text-3xl text-primary font-mono">{fmt(boq.total)}</div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-6 text-xs">
          {stepLabels.map((label, i) => (
            <span
              key={label}
              className={`px-3 py-1 border rounded-full ${
                workflowStep >= i ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
              }`}
            >
              {i + 1}. {label}
            </span>
          ))}
        </div>

        {screenMeta && step === "select" && (
          <ModuleWorkflowBanner
            hi={hi}
            flowEn={screenMeta.flowEn}
            flowHi={screenMeta.flowHi}
            stepsEn={screenMeta.stepsEn}
            stepsHi={screenMeta.stepsHi}
          />
        )}

        {step === "select" && (
          <div className="space-y-6">
            {loadError && (
              <div className="border border-destructive/40 bg-destructive/5 rounded-xl p-4 text-sm space-y-2">
                <p className="font-medium text-destructive">
                  {hi ? "स्टोर लोड नहीं हो सके" : "Could not load stores"}
                </p>
                <p className="text-muted-foreground">
                  {hi
                    ? "फ्रंटएंड नया है लेकिन बैकएंड सर्वर पर BOQ API अपडेट नहीं हुआ। Backend redeploy/restart करें (wallet-vendor-mvp.emergent.host)।"
                    : "The website is updated but the API server does not have BOQ builder endpoints yet. Restart/redeploy the backend with the latest code from main."}
                </p>
                <Button variant="outline" size="sm" className="rounded-lg" onClick={loadSections}>
                  {hi ? "फिर से कोशिश करें" : "Retry"}
                </Button>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" onClick={selectAll} className="rounded-lg text-xs">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                {hi ? "सभी चुनें" : "Select all"}
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll} className="rounded-lg text-xs">
                {hi ? "साफ़ करें" : "Clear"}
              </Button>
              <span className="text-xs text-muted-foreground">
                {selected.size}/{sections.length} {hi ? "चुने गए" : "selected"}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sections.map((s) => {
                const on = selected.has(s.id);
                const label = hi ? s.name_hi || s.name : s.name;
                return (
                  <button
                    key={s.id}
                    type="button"
                    data-testid={`boq-section-${s.id}`}
                    onClick={() => toggleSection(s.id)}
                    className={`group relative border rounded-xl overflow-hidden text-left transition-all ${
                      on ? "border-primary ring-2 ring-primary/30 shadow-md" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="relative h-28 bg-muted">
                      {s.image ? (
                        <img src={s.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <ClipboardList className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      {on && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="font-display font-bold text-sm">{label}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {s.item_count || 0} {hi ? "आइटम" : "items"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                size="lg"
                className="rounded-full px-8"
                data-testid="boq-continue-btn"
                onClick={goToBuild}
                disabled={selected.size === 0}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                {hi ? "आइटम चुनें / BOQ बनाएँ" : "Pick items / Build BOQ"}
              </Button>
            </div>
          </div>
        )}

        {step === "build" && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
              {[...selected].map((sid) => {
                const s = sections.find((x) => x.id === sid);
                const label = hi ? s?.name_hi || s?.name : s?.name;
                const manualTotal = manualBySection[sid];
                return (
                  <button
                    key={sid}
                    type="button"
                    onClick={() => setActiveSection(sid)}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                      activeSection === sid
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:border-primary/50"
                    }`}
                  >
                    {label}
                    {manualTotal ? ` · ${fmt(manualTotal)}` : ""}
                  </button>
                );
              })}
            </div>

            {catalogLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid lg:grid-cols-[1fr_320px] gap-6">
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    {hi
                      ? "आइटम जोड़ें या सीधे जनरेट करें — चुने स्टोर के preset आइटम अपने आप जुड़ेंगे।"
                      : "Add items or generate directly — preset items auto-fill for selected stores without manual lines."}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {activeProducts.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setPickProduct(p.name)}
                        className={`flex gap-3 p-3 border rounded-xl text-left transition-all ${
                          pickProduct === p.name ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="h-14 w-14 rounded-lg bg-muted overflow-hidden shrink-0">
                          {p.image ? (
                            <img src={p.image} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{p.name}</div>
                          <div className="text-[10px] text-muted-foreground">{p.category}</div>
                          {p.from_rate && (
                            <div className="text-xs font-mono text-primary mt-0.5">from {fmt(p.from_rate)}/{p.unit}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border border-border rounded-xl p-4 bg-card space-y-4 lg:sticky lg:top-24 h-fit">
                  <h3 className="font-display font-bold text-sm">{hi ? "आइटम जोड़ें" : "Add item"}</h3>
                  {activeProduct && (
                    <>
                      <div className="text-sm font-medium">{activeProduct.name}</div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase text-muted-foreground">{hi ? "ब्रांड" : "Brand"}</label>
                        <div className="flex flex-wrap gap-1.5">
                          {brandOptions.map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setPickBrandId(b.id)}
                              className={`px-2.5 py-1 rounded-md text-xs border ${
                                pickBrandId === b.id ? "border-primary bg-primary/10" : "border-border"
                              }`}
                            >
                              {b.brand} · {fmt(b.rate)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase text-muted-foreground">{hi ? "मात्रा" : "Quantity"}</label>
                        <Input
                          value={pickQty}
                          onChange={(e) => setPickQty(e.target.value)}
                          placeholder={activeProduct.unit}
                          className="mt-1"
                          data-testid="boq-qty-input"
                        />
                      </div>
                      {pickEstimate && (
                        <div className="text-sm font-mono text-primary">{fmt(pickEstimate)}</div>
                      )}
                      <Button onClick={addManualLine} className="w-full rounded-lg" size="sm">
                        <Plus className="h-3.5 w-3.5 mr-1" />{hi ? "BOQ में जोड़ें" : "Add to BOQ"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {manualLines.length > 0 && (
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-muted/50 font-display font-bold text-sm">
                  {hi ? "मैन्युअल लाइन" : "Manual lines"} ({manualLines.length})
                </div>
                <div className="divide-y divide-border">
                  {manualLines.map((l) => (
                    <div key={l.key} className="flex items-center gap-3 px-4 py-3 text-sm">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{l.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {l.section_name} · {l.brand} · {l.qty} {l.unit}
                        </div>
                      </div>
                      <div className="font-mono text-primary shrink-0">{fmt(l.amount)}</div>
                      <button type="button" onClick={() => removeManualLine(l.key)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setStep("select")} className="rounded-lg">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {hi ? "स्टोर बदलें" : "Change stores"}
              </Button>
              <Button
                size="lg"
                className="rounded-full px-8"
                data-testid="boq-generate-btn"
                onClick={generateBOQ}
                disabled={generating}
              >
                {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                {hi ? "पूरा BOQ जनरेट करें" : "Generate full BOQ"}
              </Button>
            </div>
          </div>
        )}

        {step === "result" && boq && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={onPrint} className="rounded-lg">
                <Printer className="h-3.5 w-3.5 mr-1" />{hi ? "प्रिंट" : "Print"}
              </Button>
              <Button variant="outline" size="sm" onClick={onShare} className="rounded-lg">
                <Share2 className="h-3.5 w-3.5 mr-1" />{hi ? "शेयर" : "Share"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setStep("build")} className="rounded-lg">
                {hi ? "संपादित करें" : "Edit"}
              </Button>
            </div>

            {(boq.groups || []).map((g) => (
              <div key={g.section_id || g.section_name} className="border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-muted/50">
                  <h2 className="font-display font-bold">{g.section_name}</h2>
                  <span className="font-mono text-primary font-bold">{fmt(g.total)}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] font-mono uppercase text-muted-foreground border-b border-border">
                        <th className="text-left px-4 py-2">{hi ? "आइटम" : "Item"}</th>
                        <th className="text-left px-4 py-2">{hi ? "ब्रांड" : "Brand"}</th>
                        <th className="text-right px-4 py-2">{hi ? "मात्रा" : "Qty"}</th>
                        <th className="text-right px-4 py-2">{hi ? "दर" : "Rate"}</th>
                        <th className="text-right px-4 py-2">{hi ? "राशि" : "Amount"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(g.lines || []).map((l, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0">
                          <td className="px-4 py-2.5">
                            <div className="font-medium">{l.name}</div>
                            <div className="text-[10px] text-muted-foreground">{l.category}</div>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">{l.brand}</td>
                          <td className="px-4 py-2.5 text-right font-mono">{l.qty} {l.unit}</td>
                          <td className="px-4 py-2.5 text-right font-mono">{fmt(l.rate)}</td>
                          <td className="px-4 py-2.5 text-right font-mono text-primary">{fmt(l.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center p-6 border-2 border-primary rounded-xl bg-primary/5">
              <span className="font-display font-bold text-lg">{hi ? "कुल योग" : "Grand total"}</span>
              <span className="font-display font-extrabold text-3xl font-mono text-primary" data-testid="boq-grand-total">
                {fmt(boq.total)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
