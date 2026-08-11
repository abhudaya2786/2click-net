import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Trash2, Loader2, LayoutTemplate, ArrowLeft, Check, Sparkles, Pencil, ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

/**
 * Category-wise BOQ calculator with photo catalog, brand comparison and estimated prices.
 */
export default function VerticalCategoryCalculator({ verticalId, onBack, embedded = false }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const { lang } = useLang();
  const hi = lang === "hi";
  const isAdmin = user?.role === "super_admin";

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
  const estimate = selectedBrand && qty && Number(qty) > 0
    ? Math.round(selectedBrand.rate * Number(qty) * 100) / 100
    : null;

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
        image: selectedBrand.image,
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
      <div className="flex flex-wrap items-start justify-between gap-3">
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
            {hi ? "फोटो कैटलॉग → ब्रांड compare → अनुमानित कीमत → BOQ" : "Photo catalog → compare brands → estimated price → BOQ"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg text-xs"
              onClick={() => nav("/dashboard", { state: { adminTab: "interior-boq" } })}
            >
              <Pencil className="h-3.5 w-3.5 mr-1" />
              {hi ? "कैटलॉग एडिट" : "Edit catalog"}
            </Button>
          )}
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">{hi ? "इस श्रेणी का कुल" : "Category total"}</div>
            <div className="font-display font-extrabold text-2xl text-primary font-mono" data-testid="category-total">
              {fmt(categoryTotal)}
            </div>
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

      {/* Product photo catalog */}
      <div>
        <h3 className="font-display font-bold text-sm mb-3">{hi ? "1. सामग्री / सेवा चुनें" : "1. Pick material / service"}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" data-testid="product-catalog">
          {products.map((p) => {
            const on = productName === p.name;
            return (
              <button
                key={p.name}
                type="button"
                data-testid={`product-${p.name}`}
                onClick={() => setProductName(p.name)}
                className={`text-left border rounded-xl overflow-hidden bg-card transition-all ${on ? "border-primary ring-2 ring-primary/30 shadow-md" : "border-border hover:border-primary/40"}`}
              >
                <div className="relative h-24 bg-muted">
                  {p.image ? (
                    <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full flex items-center justify-center"><ImageIcon className="h-6 w-6 text-muted-foreground" /></div>
                  )}
                  {on && <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center"><Check className="h-3.5 w-3.5" /></div>}
                </div>
                <div className="p-3">
                  <div className="font-medium text-xs leading-snug line-clamp-2">{p.name}</div>
                  {p.from_rate != null && (
                    <div className="text-[10px] mt-1.5 font-mono text-primary font-bold">
                      {fmt(p.from_rate)}<span className="text-muted-foreground font-normal">/{p.unit}</span>
                    </div>
                  )}
                  <div className="text-[10px] text-muted-foreground mt-0.5">{p.brands?.length || 0} {hi ? "ब्रांड" : "brands"}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
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
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {l.image && <img src={l.image} alt="" className="h-8 w-8 rounded object-cover border border-border shrink-0" />}
                        <span>{l.name}</span>
                      </div>
                    </td>
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
                      {hi ? "नीचे ब्रांड चुनें और BOQ में जोड़ें" : "Choose a brand below and add to BOQ"}
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

        <div className="border border-border rounded-xl bg-card p-4 space-y-4">
          {activeProduct?.image && (
            <div className="h-36 rounded-lg overflow-hidden border border-border bg-muted">
              <img src={activeProduct.image} alt={activeProduct.name} className="h-full w-full object-cover" />
            </div>
          )}

          <div>
            <h3 className="font-display font-bold text-sm mb-2">{hi ? "2. ब्रांड compare करें" : "2. Compare brands"}</h3>
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
                    className={`flex items-center gap-3 p-3 border rounded-lg text-left transition-all ${on ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40"}`}
                  >
                    <div className="h-12 w-12 shrink-0 rounded-md overflow-hidden bg-muted border border-border">
                      {b.image ? (
                        <img src={b.image} alt={b.brand} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-5 w-5 m-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{b.brand}</div>
                      {isCheapest && (
                        <span className="text-[10px] font-mono text-solar flex items-center gap-0.5 mt-0.5">
                          <Sparkles className="h-3 w-3" />{hi ? "सबसे सस्ता" : "Best price"}
                        </span>
                      )}
                      <div className="text-[10px] text-muted-foreground mt-0.5">{hi ? "अनुमानित दर" : "Est. rate"}: {fmt(b.rate)}/{b.unit}</div>
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
            {estimate != null && (
              <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">{hi ? "अनुमानित कीमत" : "Estimated price"}</div>
                <div className="font-display font-extrabold text-xl text-primary font-mono mt-1">{fmt(estimate)}</div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {selectedBrand.brand} · {qty} {selectedBrand.unit} × {fmt(selectedBrand.rate)}
                </div>
              </div>
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
