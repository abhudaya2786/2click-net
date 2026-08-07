import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Store, Loader2, ArrowRight } from "lucide-react";

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

  return (
    <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-14">
      <div className="max-w-2xl mb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-primary flex items-center gap-2"><Store className="h-4 w-4" />Super Mart</span>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight mt-3">Construction materials, brand-wise rates.</h1>
        <p className="mt-4 text-muted-foreground">Compare live rates across top brands. Pick your brand and build a BOQ instantly at those rates.</p>
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
          {materials.map((m) => (
            <div key={m.id} data-testid="mart-card" className="bg-card p-5 hover:bg-muted/40 transition-colors">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{m.category}</div>
              <div className="font-display font-bold text-base tracking-tight mt-1">{m.name}</div>
              <span className="inline-block mt-2 text-xs font-mono px-2 py-0.5 bg-primary/10 text-primary">{m.brand}</span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display font-extrabold text-2xl">{fmt(m.rate)}</span>
                <span className="text-xs text-muted-foreground">/{m.unit}</span>
              </div>
            </div>
          ))}
          {materials.length === 0 && <div className="bg-card p-10 col-span-full text-center text-muted-foreground">No materials found.</div>}
        </div>
      )}

      <div className="mt-10 border border-border bg-card p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="font-display font-bold text-lg tracking-tight">Build a BOQ at these rates</div>
          <p className="text-sm text-muted-foreground">Select materials by brand and generate a Bill of Quantities in seconds.</p>
        </div>
        <Link to="/dashboard"><Button data-testid="mart-boq-cta" className="rounded-none">Open Material Calculator<ArrowRight className="h-4 w-4 ml-1.5" /></Button></Link>
      </div>
    </div>
  );
}
