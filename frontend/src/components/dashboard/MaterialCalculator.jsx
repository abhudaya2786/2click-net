import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Store, Loader2 } from "lucide-react";
import { toast } from "sonner";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function MaterialCalculator() {
  const [cats, setCats] = useState([]);
  const [category, setCategory] = useState("");
  const [materials, setMaterials] = useState([]);
  const [selId, setSelId] = useState("");
  const [qty, setQty] = useState("");
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/mart/categories").then(({ data }) => { setCats(data); setCategory(data[0] || ""); }).finally(() => setLoading(false));
  }, []);
  const loadMaterials = useCallback((c) => {
    if (!c) return;
    api.get("/mart/materials", { params: { category: c } }).then(({ data }) => { setMaterials(data); setSelId(data[0]?.id || ""); });
  }, []);
  useEffect(() => { loadMaterials(category); }, [category, loadMaterials]);

  const sel = materials.find((m) => m.id === selId);
  const addLine = () => {
    if (!sel) return;
    const q = Number(qty);
    if (!q || q <= 0) { toast.error("Enter a valid quantity"); return; }
    setLines([...lines, { key: Date.now() + Math.random(), name: sel.name, brand: sel.brand, unit: sel.unit, rate: sel.rate, qty: q, amount: Math.round(sel.rate * q * 100) / 100 }]);
    setQty("");
  };
  const removeLine = (k) => setLines(lines.filter((l) => l.key !== k));
  const total = lines.reduce((s, l) => s + l.amount, 0);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6" data-testid="material-calculator">
      <div className="flex items-center gap-2">
        <Store className="h-5 w-5 text-primary" />
        <h2 className="font-display font-bold text-lg tracking-tight">Material Calculator</h2>
        <span className="text-xs text-muted-foreground">Super Mart rates · brand-wise</span>
      </div>
      <div className="grid lg:grid-cols-[1fr_320px] gap-px bg-border border border-border">
        <div className="bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="p-3">Material</th><th className="p-3">Brand</th><th className="p-3">Qty</th><th className="p-3">Rate</th><th className="p-3">Amount</th><th className="p-3"></th></tr></thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.key} className="border-b border-border hover:bg-muted/50" data-testid="calc-line">
                  <td className="p-3">{l.name}</td>
                  <td className="p-3"><span className="text-xs font-mono px-1.5 py-0.5 bg-muted">{l.brand}</span></td>
                  <td className="p-3 font-mono">{l.qty} {l.unit}</td>
                  <td className="p-3 font-mono">{fmt(l.rate)}</td>
                  <td className="p-3 font-mono font-medium">{fmt(l.amount)}</td>
                  <td className="p-3"><button onClick={() => removeLine(l.key)} data-testid="calc-remove" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
              {lines.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-muted-foreground">Pick materials on the right to estimate cost.</td></tr>}
            </tbody>
            {lines.length > 0 && <tfoot><tr className="border-t-2 border-border font-bold"><td className="p-3" colSpan="4">Estimated Total</td><td className="p-3 font-mono" data-testid="calc-total">{fmt(total)}</td><td></td></tr></tfoot>}
          </table>
        </div>
        <div className="bg-card p-5 space-y-3">
          <h3 className="font-display font-bold text-sm">Add material</h3>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Category</label>
            <select data-testid="calc-category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-background border border-input px-3 h-10 text-sm">
              {cats.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Material · Brand</label>
            <select data-testid="calc-material" value={selId} onChange={(e) => setSelId(e.target.value)} className="w-full bg-background border border-input px-3 h-10 text-sm">
              {materials.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.brand} — ₹{m.rate}/{m.unit}</option>)}
            </select>
          </div>
          {sel && <div className="text-sm bg-muted/50 p-2.5 flex justify-between"><span>Rate</span><span className="font-mono font-bold text-primary">{fmt(sel.rate)}/{sel.unit}</span></div>}
          <Input data-testid="calc-qty" type="number" placeholder={`Quantity${sel ? ` (${sel.unit})` : ""}`} value={qty} onChange={(e) => setQty(e.target.value)} className="rounded-none" />
          <Button data-testid="calc-add" onClick={addLine} className="w-full rounded-none"><Plus className="h-4 w-4 mr-1.5" />Add to estimate</Button>
        </div>
      </div>
    </div>
  );
}
