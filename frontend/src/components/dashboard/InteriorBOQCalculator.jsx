import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Trash2, Calculator, Loader2, LayoutTemplate,
  Sofa, Compass, Wrench, Grid3x3, Layers, Pipette, Hammer, Leaf,
} from "lucide-react";
import { toast } from "sonner";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const ICONS = {
  sofa: Sofa, compass: Compass, wrench: Wrench, grid: Grid3x3,
  layers: Layers, pipe: Pipette, hammer: Hammer, leaf: Leaf,
};

export default function InteriorBOQCalculator() {
  const { lang } = useLang();
  const hi = lang === "hi";
  const [verticals, setVerticals] = useState([]);
  const [activeVid, setActiveVid] = useState("");
  const [materials, setMaterials] = useState([]);
  const [brands, setBrands] = useState([]);
  const [brand, setBrand] = useState("all");
  const [selId, setSelId] = useState("");
  const [qty, setQty] = useState("");
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [tplBusy, setTplBusy] = useState(false);

  useEffect(() => {
    api.get("/mart/interior-verticals")
      .then(({ data }) => {
        setVerticals(data);
        setActiveVid(data[0]?.id || "");
      })
      .finally(() => setLoading(false));
    api.get("/mart/boq-templates").then(({ data }) => setTemplates(data.filter((t) => t.vertical)));
  }, []);

  const loadVertical = useCallback((vid, br = "all") => {
    if (!vid) return;
    api.get(`/mart/interior-verticals/${vid}/materials`, { params: br !== "all" ? { brand: br } : {} })
      .then(({ data }) => {
        setMaterials(data.materials || []);
        setBrands(data.brands || []);
        setSelId(data.materials?.[0]?.id || "");
      });
  }, []);

  useEffect(() => {
    if (activeVid) loadVertical(activeVid, brand);
  }, [activeVid, brand, loadVertical]);

  const activeVertical = verticals.find((v) => v.id === activeVid);
  const sel = materials.find((m) => m.id === selId);

  const columnTotals = useMemo(() => {
    const totals = {};
    verticals.forEach((v) => { totals[v.id] = 0; });
    lines.forEach((l) => {
      if (l.vertical_id && totals[l.vertical_id] !== undefined) {
        totals[l.vertical_id] += l.amount;
      }
    });
    return totals;
  }, [lines, verticals]);

  const grandTotal = Object.values(columnTotals).reduce((s, n) => s + n, 0);

  const addLine = () => {
    if (!sel || !activeVertical) return;
    const q = Number(qty);
    if (!q || q <= 0) { toast.error(hi ? "मात्रा दर्ज करें" : "Enter quantity"); return; }
    setLines([
      ...lines,
      {
        key: Date.now() + Math.random(),
        vertical_id: activeVid,
        vertical: hi ? activeVertical.name_hi || activeVertical.name : activeVertical.name,
        category: sel.category,
        name: sel.name,
        brand: sel.brand,
        unit: sel.unit,
        rate: sel.rate,
        qty: q,
        amount: Math.round(sel.rate * q * 100) / 100,
      },
    ]);
    setQty("");
  };

  const removeLine = (k) => setLines(lines.filter((l) => l.key !== k));

  const loadTemplate = async (tid) => {
    if (!tid) return;
    setTplBusy(true);
    try {
      const { data } = await api.get(`/mart/boq-templates/${tid}`);
      const v = verticals.find((x) => x.id === data.vertical || templates.find((t) => t.id === tid)?.vertical);
      const newLines = data.lines.map((l, i) => ({
        key: Date.now() + i,
        vertical_id: v?.id || data.vertical,
        vertical: v ? (hi ? v.name_hi || v.name : v.name) : l.category,
        category: l.category,
        name: l.name,
        brand: l.brand,
        unit: l.unit,
        rate: l.rate,
        qty: l.qty,
        amount: l.amount,
      }));
      setLines((prev) => [...prev, ...newLines]);
      toast.success(`${data.name} — ${newLines.length} items · ${fmt(data.total)}`);
    } catch {
      toast.error(hi ? "टेम्पलेट लोड नहीं हो सका" : "Could not load template");
    } finally {
      setTplBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const verticalTemplates = templates.filter((t) => t.vertical === activeVid);

  return (
    <div className="space-y-6" data-testid="interior-boq-calculator">
      <div className="flex items-center gap-2 flex-wrap">
        <Calculator className="h-5 w-5 text-primary" />
        <h2 className="font-display font-bold text-lg tracking-tight">
          {hi ? "इंटीरियर BOQ कैलकुलेटर" : "Interior & Finishing BOQ Calculator"}
        </h2>
        <span className="text-xs text-muted-foreground">{hi ? "ब्रांड-वार दर · 8 श्रेणियाँ" : "Brand-wise rates · 8 verticals"}</span>
      </div>

      {/* Column totals — 8 vertical columns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2" data-testid="vertical-column-totals">
        {verticals.map((v) => {
          const Icon = ICONS[v.icon] || Calculator;
          const total = columnTotals[v.id] || 0;
          const on = activeVid === v.id;
          return (
            <button
              key={v.id}
              type="button"
              data-testid={`vertical-col-${v.id}`}
              onClick={() => { setActiveVid(v.id); setBrand("all"); }}
              className={`p-3 border text-left transition-all rounded-lg ${on ? "bg-primary text-white border-primary shadow-md" : "border-border bg-card hover:border-primary/40"}`}
            >
              <Icon className={`h-4 w-4 mb-1.5 ${on ? "text-white" : "text-primary"}`} />
              <div className={`text-[10px] font-mono uppercase tracking-wide leading-tight ${on ? "text-white/90" : "text-muted-foreground"}`}>
                {hi ? v.name_hi || v.name : v.name}
              </div>
              <div className={`font-display font-bold text-sm mt-1 font-mono ${on ? "text-white" : "text-primary"}`}>
                {fmt(total)}
              </div>
            </button>
          );
        })}
      </div>

      {verticalTemplates.length > 0 && (
        <div className="bg-card border border-border p-4 flex flex-wrap gap-2 items-center" data-testid="vertical-templates">
          <LayoutTemplate className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium">{hi ? "टेम्पलेट" : "Templates"}</span>
          {verticalTemplates.map((t) => (
            <Button
              key={t.id}
              type="button"
              variant="outline"
              size="sm"
              disabled={tplBusy}
              className="rounded-lg text-xs"
              onClick={() => loadTemplate(t.id)}
            >
              {t.name}
            </Button>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_300px] gap-px bg-border border border-border">
        <div className="bg-card overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-3">{hi ? "श्रेणी" : "Vertical"}</th>
                <th className="p-3">{hi ? "आइटम" : "Item"}</th>
                <th className="p-3">{hi ? "ब्रांड" : "Brand"}</th>
                <th className="p-3">{hi ? "मात्रा" : "Qty"}</th>
                <th className="p-3">{hi ? "दर" : "Rate"}</th>
                <th className="p-3">{hi ? "राशि" : "Amount"}</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.key} className="border-b border-border hover:bg-muted/50" data-testid="boq-line">
                  <td className="p-3 text-xs font-mono text-primary">{l.vertical}</td>
                  <td className="p-3">{l.name}</td>
                  <td className="p-3"><span className="text-xs font-mono px-1.5 py-0.5 bg-muted">{l.brand}</span></td>
                  <td className="p-3 font-mono">{l.qty} {l.unit}</td>
                  <td className="p-3 font-mono">{fmt(l.rate)}</td>
                  <td className="p-3 font-mono font-medium">{fmt(l.amount)}</td>
                  <td className="p-3">
                    <button type="button" onClick={() => removeLine(l.key)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {lines.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-muted-foreground">
                    {hi ? "ऊपर श्रेणी चुनें और सामग्री जोड़ें" : "Select a vertical above and add materials."}
                  </td>
                </tr>
              )}
            </tbody>
            {lines.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border font-bold">
                  <td className="p-3" colSpan="5">{hi ? "कुल BOQ" : "Grand Total"}</td>
                  <td className="p-3 font-mono" data-testid="boq-grand-total">{fmt(grandTotal)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="bg-card p-5 space-y-3">
          <h3 className="font-display font-bold text-sm">
            {hi ? "सामग्री जोड़ें" : "Add material"}
            {activeVertical && (
              <span className="text-primary block text-xs font-normal mt-0.5">
                {hi ? activeVertical.name_hi : activeVertical.name}
              </span>
            )}
          </h3>
          {brands.length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{hi ? "ब्रांड" : "Brand"}</label>
              <select
                data-testid="brand-filter"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-background border border-input px-3 h-10 text-sm"
              >
                <option value="all">{hi ? "सभी ब्रांड" : "All brands"}</option>
                {brands.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{hi ? "सामग्री" : "Material"}</label>
            <select
              data-testid="material-select"
              value={selId}
              onChange={(e) => setSelId(e.target.value)}
              className="w-full bg-background border border-input px-3 h-10 text-sm"
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} · {m.brand} — ₹{m.rate}/{m.unit}
                </option>
              ))}
            </select>
          </div>
          {sel && (
            <div className="text-sm bg-muted/50 p-2.5 flex justify-between">
              <span>{hi ? "दर" : "Rate"}</span>
              <span className="font-mono font-bold text-primary">{fmt(sel.rate)}/{sel.unit}</span>
            </div>
          )}
          <Input
            data-testid="qty-input"
            type="number"
            placeholder={sel ? `${hi ? "मात्रा" : "Quantity"} (${sel.unit})` : (hi ? "मात्रा" : "Quantity")}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="rounded-lg"
          />
          <Button data-testid="add-line-btn" onClick={addLine} className="w-full rounded-lg">
            <Plus className="h-4 w-4 mr-1.5" />{hi ? "BOQ में जोड़ें" : "Add to BOQ"}
          </Button>
        </div>
      </div>
    </div>
  );
}
