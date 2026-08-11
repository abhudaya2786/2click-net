import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Trash2, Loader2, LayoutTemplate, ArrowLeft, Check, Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

/**
 * Dedicated category-wise BOQ calculator with brand comparison cards.
 */
export default function VerticalCategoryCalculator({ verticalId, onBack, embedded = false }) {
  const { lang } = useLang();
  const hi = lang === "hi";
  const [vertical, setVertical] = useState(null);
  const [products, setProducts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tplBusy, setTplBusy] = useState(false);

  const [productName, setProductName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [qty, setQty] = useState("");
  const [lines, setLines] = useState([]);

  useEffect(() => {
    if (!verticalId) return;
    setLoading(true);
    Promise.all([
      api.get(`/mart/interior-verticals/${verticalId}/catalog`),
      api.get("/mart/boq-templates", { params: { vertical: verticalId } }),
    ])
      .then(([cat, tpl]) => {
        setVertical(cat.data.vertical);
        setProducts(cat.data.products || []);
        setProductName(cat.data.products?.[0]?.name || "");
        const firstBrands = cat.data.products?.[0]?.brands || [];
        setBrandId(firstBrands[0]?.id || "");
        setTemplates((tpl.data || []).filter((t) => t.vertical === verticalId));
      })
      .catch(() => {
        setVertical(null);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [verticalId]);

  const activeProduct = products.find((p) => p.name === productName);
  const brandOptions = activeProduct?.brands || [];
  const selectedBrand = brandOptions.find((b) => b.id === brandId);

  useEffect(() => {
    if (activeProduct?.brands?.length) {
      const stillValid = activeProduct.brands.some((b) => b.id === brandId);
      if (!stillValid) setBrandId(activeProduct.brands[0].id);
    }
  }, [productName, activeProduct, brandId]);

  const categoryTotal = useMemo(() => lines.reduce((s, l) => s + l.amount, 0), [lines]);

  const addLine = () => {
    if (!selectedBrand || !vertical) return;
    const q = Number(qty);
    if (!q || q <= 0) {
      toast.error(hi ? "मात्रा दर्ज करें" : "Enter quantity");
      return;
    }
    setLines([
      ...lines,
      {
        key: Date.now() + Math.random(),
        vertical_id: vertical.id,
        name: selectedBrand.name,
        brand: selectedBrand.brand,
        unit: selectedBrand.unit,
        rate: selectedBrand.rate,
        qty: q,
        amount: Math.round(selectedBrand.rate * q * 100) / 100,
        material_id: selectedBrand.id,
      },
    ]);
    setQty("");
    toast.success(hi ? "जोड़ा गया" : "Added");
  };

  const removeLine = (key) => setLines(lines.filter((l) => l.key !== key));

  const loadTemplate = async (tid) => {
    setTplBusy(true);
    try {
      const { data } = await api.get(`/mart/boq-templates/${tid}`);
      const newLines = data.lines.map((l, i) => ({
        key: Date.now() + i + Math.random(),
        vertical_id: vertical.id,
        name: l.name,
        brand: l.brand,
        unit: l.unit,
        rate: l.rate,
        qty: l.qty,
        amount: l.amount,
      }));
      setLines(newLines);
      toast.success(`${data.name} · ${fmt(data.total)}`);
    } catch {
      toast.error(hi ? "टेम्पलेट लोड नहीं हो सका" : "Could not load template");
    } finally {
      setTplBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!vertical) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {hi ? "श्रेणी नहीं मिली" : "Category not found"}
      </p>
    );
  }

  const title = hi ? vertical.name_hi || vertical.name : vertical.name;

  return (
    <div className="space-y-5" data-testid={`category-calculator-${verticalId}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {embedded && onBack && (
            <button type="button" onClick={onBack} className="text-sm text-primary hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft className="h-3.5 w-3.5" />{hi ? "सभी कैलकुलेटर" : "All calculators"}
            </button>
          )}
          {!embedded && (
            <Link to="/interior-boq" className="text-sm text-primary hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft className="h-3.5 w-3.5" />{hi ? "सभी कैलकुलेटर" : "All calculators"}
            </Link>
          )}
          <h2 className="font-display font-bold text-xl tracking-tight">{title}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {hi ? "सामग्री चुनें → ब्रांड compare करें → BOQ बनाएँ" : "Pick item → compare brands → build BOQ"}
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono uppercase text-muted-foreground">{hi ? "इस श्रेणी का कुल" : "Category total"}</div>
          <div className="font-display font-extrabold text-2xl text-primary font-mono" data-testid="category-total">
            {fmt(categoryTotal)}
          </div>
        </div>
      </div>

      {templates.length > 0 && (
        <div className="bg-card border border-border p-3 flex flex-wrap gap-2 items-center rounded-lg">
          <LayoutTemplate className="h-4 w-4 text-primary shrink-0" />
          <span className="text-xs font-medium">{hi ? "त्वरित टेम्पलेट" : "Quick templates"}</span>
          {templates.map((t) => (
            <Button key={t.id} type="button" variant="outline" size="sm" disabled={tplBusy} className="rounded-lg text-xs h-8" onClick={() => loadTemplate(t.id)}>
              {t.name}
            </Button>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_340px] gap-4">
        {/* BOQ table for this category only */}
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            {hi ? "BOQ — इस श्रेणी" : "BOQ — this category"}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
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
                  <tr key={l.key} className="border-b border-border/60 hover:bg-muted/40">
                    <td className="p-3">{l.name}</td>
                    <td className="p-3"><span className="text-xs font-mono px-2 py-0.5 bg-primary/10 text-primary rounded">{l.brand}</span></td>
                    <td className="p-3 font-mono">{l.qty} {l.unit}</td>
                    <td className="p-3 font-mono">{fmt(l.rate)}</td>
                    <td className="p-3 font-mono font-semibold">{fmt(l.amount)}</td>
                    <td className="p-3">
                      <button type="button" onClick={() => removeLine(l.key)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {lines.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-muted-foreground text-sm">
                      {hi ? "दाएँ से सामग्री और ब्रांड चुनें" : "Select material and brand on the right"}
                    </td>
                  </tr>
                )}
              </tbody>
              {lines.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-border font-bold bg-muted/20">
                    <td className="p-3" colSpan="4">{hi ? "कुल" : "Total"}</td>
                    <td className="p-3 font-mono">{fmt(categoryTotal)}</td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Brand-wise picker */}
        <div className="border border-border rounded-xl bg-card p-4 space-y-4">
          <h3 className="font-display font-bold text-sm">{hi ? "1. सामग्री / सेवा" : "1. Material / service"}</h3>
          <select
            data-testid="product-select"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full bg-background border border-input px-3 h-10 text-sm rounded-lg"
          >
            {products.map((p) => (
              <option key={p.name} value={p.name}>{p.name} ({p.unit})</option>
            ))}
          </select>

          <div>
            <h3 className="font-display font-bold text-sm mb-2">{hi ? "2. ब्रांड चुनें" : "2. Choose brand"}</h3>
            <div className="grid gap-2" data-testid="brand-cards">
              {brandOptions.map((b) => {
                const on = brandId === b.id;
                const isCheapest = b.id === activeProduct?.cheapest?.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    data-testid={`brand-${b.brand}`}
                    onClick={() => setBrandId(b.id)}
                    className={`flex items-center justify-between gap-2 p-3 border rounded-lg text-left transition-all ${on ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40"}`}
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{b.brand}</div>
                      {isCheapest && (
                        <span className="text-[10px] font-mono text-solar flex items-center gap-0.5 mt-0.5">
                          <Sparkles className="h-3 w-3" />{hi ? "सबसे सस्ता" : "Best price"}
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-primary">{fmt(b.rate)}</div>
                      <div className="text-[10px] text-muted-foreground">/{b.unit}</div>
                    </div>
                    {on && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-display font-bold text-sm mb-2">{hi ? "3. मात्रा" : "3. Quantity"}</h3>
            <Input
              data-testid="qty-input"
              type="number"
              placeholder={selectedBrand ? `${hi ? "मात्रा" : "Quantity"} (${selectedBrand.unit})` : (hi ? "मात्रा" : "Quantity")}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="rounded-lg"
            />
            {selectedBrand && qty && Number(qty) > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {hi ? "अनुमान" : "Estimate"}: <span className="font-mono font-bold text-primary">{fmt(selectedBrand.rate * Number(qty))}</span>
              </p>
            )}
          </div>

          <Button data-testid="add-line-btn" onClick={addLine} className="w-full rounded-lg" disabled={!selectedBrand}>
            <Plus className="h-4 w-4 mr-1.5" />{hi ? "BOQ में जोड़ें" : "Add to BOQ"}
          </Button>
        </div>
      </div>
    </div>
  );
}
