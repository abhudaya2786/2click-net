import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Store, Loader2, ArrowRight, TrendingUp, TrendingDown, LineChart as LineIcon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default function Mart() {
  const [cats, setCats] = useState([]);
  const [category, setCategory] = useState("all");
  const [brands, setBrands] = useState([]);
  const [brand, setBrand] = useState("all");
  const [q, setQ] = useState("");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState(null); // selected material for rate-history dialog

  useEffect(() => { api.get("/mart/categories").then(({ data }) => setCats(data)); }, []);
  useEffect(() => {
    api.get("/mart/brands", { params: { category: category !== "all" ? category : undefined } }).then(({ data }) => setBrands(data));
    setBrand("all");
  }, [category]);
  const load = useCallback(() => {
    setLoading(true);
    api.get("/mart/materials", { params: { category: category !== "all" ? category : undefined, brand: brand !== "all" ? brand : undefined, q: q || undefined } })
      .then(({ data }) => setMaterials(data)).finally(() => setLoading(false));
  }, [category, brand, q]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const history = trend?.rate_history || [];
  const firstRate = history[0]?.rate || 0;
  const lastRate = history[history.length - 1]?.rate || 0;
  const delta = firstRate ? ((lastRate - firstRate) / firstRate) * 100 : 0;

  return (
    <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-14">
      <div className="max-w-2xl mb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-primary flex items-center gap-2"><Store className="h-4 w-4" />Super Mart</span>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight mt-3">Construction materials, brand-wise rates.</h1>
        <p className="mt-4 text-muted-foreground">Compare live rates across top brands, track price trends, and build a BOQ instantly at those rates.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input data-testid="mart-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search material…" className="pl-9 rounded-none" />
        </div>
        <select data-testid="mart-brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="bg-background border border-input px-3 h-10 text-sm">
          <option value="all">All brands</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setCategory("all")} data-testid="mart-cat-all" className={`px-3 py-1.5 text-sm border transition-colors ${category === "all" ? "bg-primary text-white border-primary" : "border-border hover:bg-accent"}`}>All</button>
        {cats.map((c) => (
          <button key={c} onClick={() => setCategory(c)} data-testid={`mart-cat-${slug(c)}`} className={`px-3 py-1.5 text-sm border transition-colors ${category === c ? "bg-primary text-white border-primary" : "border-border hover:bg-accent"}`}>{c}</button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <div className="grid gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {materials.map((m) => {
            const h = m.rate_history || [];
            const up = h.length > 1 && h[h.length - 1].rate >= h[0].rate;
            return (
              <div key={m.id} data-testid="mart-card" className="bg-card group flex flex-col">
                <div className="relative h-32 overflow-hidden bg-muted">
                  {m.image && <img src={m.image} alt={m.category} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                  <span className="absolute top-2 left-2 text-[10px] font-mono uppercase tracking-wider text-white bg-black/55 px-1.5 py-0.5">{m.category}</span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="font-display font-bold text-base tracking-tight">{m.name}</div>
                  <span className="inline-block mt-2 text-xs font-mono px-2 py-0.5 bg-primary/10 text-primary w-fit">{m.brand}</span>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-display font-extrabold text-2xl">{fmt(m.rate)}</span>
                    <span className="text-xs text-muted-foreground">/{m.unit}</span>
                  </div>
                  <button data-testid="mart-trend-btn" onClick={() => setTrend(m)} className={`mt-3 inline-flex items-center gap-1.5 text-xs font-mono ${up ? "text-destructive" : "text-solar"} hover:underline w-fit`}>
                    {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}Rate trend
                  </button>
                </div>
              </div>
            );
          })}
          {materials.length === 0 && <div className="bg-card p-10 col-span-full text-center text-muted-foreground">No materials found.</div>}
        </div>
      )}

      <Dialog open={!!trend} onOpenChange={(o) => !o && setTrend(null)}>
        <DialogContent className="rounded-none max-w-lg" data-testid="mart-trend-dialog">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2"><LineIcon className="h-4 w-4 text-primary" />{trend?.name} · {trend?.brand}</DialogTitle>
            <DialogDescription className="sr-only">Six-month brand-wise price trend and best-time-to-buy guidance.</DialogDescription>
          </DialogHeader>
          {history.length > 1 ? (
            <div>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="font-display font-extrabold text-2xl">{fmt(lastRate)}<span className="text-xs text-muted-foreground font-normal">/{trend?.unit}</span></span>
                <span className={`text-xs font-mono px-1.5 py-0.5 ${delta > 0 ? "bg-destructive/10 text-destructive" : "bg-solar/10 text-solar"}`}>
                  {delta > 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}% (6 mo)
                </span>
              </div>
              <div className="h-56" data-testid="mart-trend-chart">
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                  <LineChart data={history} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={["auto", "auto"]} />
                    <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 0, fontSize: 12 }} />
                    <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {delta <= 0 ? "Prices have softened — a good window to buy." : "Prices are trending up — consider buying sooner."}
              </p>
            </div>
          ) : <p className="text-sm text-muted-foreground py-8 text-center">Not enough price history yet.</p>}
        </DialogContent>
      </Dialog>

      <div className="mt-10 border border-border bg-card p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="font-display font-bold text-lg tracking-tight">Build a BOQ at these rates</div>
          <p className="text-sm text-muted-foreground">Use ready templates (3BHK Villa, 2BHK Flat…) or pick materials by brand.</p>
        </div>
        <Link to="/dashboard"><Button data-testid="mart-boq-cta" className="rounded-none">Open Material Calculator<ArrowRight className="h-4 w-4 ml-1.5" /></Button></Link>
      </div>
    </div>
  );
}
