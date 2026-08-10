import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, ShoppingCart, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import AdSlot from "@/components/ads/AdSlot";
import PageSEO from "@/components/marketing/PageSEO";

export default function Marketplace() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [active, setActive] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/products", { params: { category: active, q } });
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
      setError("Could not load products. Check backend URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get("/products/categories")
      .then(({ data }) => setCats(Array.isArray(data) ? data : []))
      .catch(() => setCats([]));
  }, []);
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [active]);

  const addToCart = (p) => {
    if (!user) { toast.error("Please log in to add to cart"); nav("/login"); return; }
    const cart = JSON.parse(localStorage.getItem("bs_cart") || "[]");
    const ex = cart.find((c) => c.product_id === p.id);
    if (ex) ex.qty += 1;
    else cart.push({ product_id: p.id, name: p.name, price: p.price, qty: 1, unit: p.unit, image: p.image });
    localStorage.setItem("bs_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));
    toast.success(`${p.name} added to cart`);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-10">
      <PageSEO
        title="B2B Construction Marketplace — Steel, Cement, Solar"
        description="Multi-vendor B2B marketplace for building materials — steel, cement, solar panels with GST invoicing and cart checkout on 2click.in"
        path="/marketplace"
      />
      <div className="mb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-primary">Marketplace</span>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">Building materials, sourced smart.</h1>
      </div>
      <div className="flex gap-2 mb-6 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input data-testid="market-search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search steel, cement, solar…" className="rounded-lg pl-9" />
        </div>
        <Button data-testid="market-search-btn" onClick={load} className="btn-premium">Search</Button>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <aside className="space-y-1">
          <button onClick={() => setActive("all")} data-testid="cat-all"
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${active === "all" ? "bg-primary text-white" : "hover:bg-accent"}`}>All Products</button>
          {cats.map((c) => (
            <button key={c} onClick={() => setActive(c)} data-testid={`cat-${c}`}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${active === c ? "bg-primary text-white" : "hover:bg-accent"}`}>{c}</button>
          ))}
          <AdSlot placement="sidebar" className="mt-6" />
        </aside>

        <div>
          {error && (
            <div className="mb-4 border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>
          )}
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground"><Package className="h-8 w-8 mx-auto mb-3" strokeWidth={1.5} />No products found.</div>
          ) : (
            <div className="grid gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-3">
              <AdSlot placement="infeed" limit={1} />
              {products.map((p) => (
                <div key={p.id} data-testid={`product-${p.id}`} className="group bg-card">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{p.category}</span>
                      <span className="flex items-center gap-1 text-xs"><Star className="h-3 w-3 fill-primary text-primary" />{p.rating}</span>
                    </div>
                    <h3 className="font-medium text-sm leading-tight h-10">{p.name}</h3>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <span className="font-display font-extrabold text-lg tracking-tight">₹{p.price.toLocaleString("en-IN")}</span>
                        <span className="text-xs text-muted-foreground">/{p.unit}</span>
                      </div>
                      <button data-testid={`add-cart-${p.id}`} onClick={() => addToCart(p)}
                        className="h-9 w-9 bg-primary text-white flex items-center justify-center hover:-translate-y-0.5 transition-transform">
                        <ShoppingCart className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
