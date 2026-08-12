import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PageSEO from "@/components/marketing/PageSEO";
import StoreProductCard from "@/components/store/StoreProductCard";
import { Search, Loader2, SlidersHorizontal, ShoppingBag } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { useDemoMode } from "@/context/DemoModeContext";
import { DEMO_STORE_ITEMS } from "@/lib/demoData";
import MarketRateTicker from "@/components/store/MarketRateTicker";
import ModuleWorkflowBanner from "@/components/marketing/ModuleWorkflowBanner";
import { CORE_PLATFORM_SCREENS } from "@/lib/platformScreenArchitecture";

export default function Store() {
  const { lang } = useLang();
  const hi = lang === "hi";
  const { demoMode, markSampleData, enableDemo } = useDemoMode();
  const [searchParams, setSearchParams] = useSearchParams();

  const [meta, setMeta] = useState({ categories: [], brands: [], verticals: [] });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const category = searchParams.get("category") || "all";
  const brand = searchParams.get("brand") || "all";
  const sort = searchParams.get("sort") || "name";
  const [q, setQ] = useState(searchParams.get("q") || "");

  useEffect(() => {
    api.get("/store/meta").then(({ data }) => setMeta(data)).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    api.get("/store/browse", {
      params: {
        category: category !== "all" ? category : undefined,
        brand: brand !== "all" ? brand : undefined,
        q: q || undefined,
        sort,
        limit: 120,
      },
    })
      .then(({ data }) => {
        setItems(data.items || []);
        setTotal(data.total || 0);
        markSampleData(false);
      })
      .catch(() => {
        enableDemo();
        let list = [...DEMO_STORE_ITEMS];
        if (category !== "all") list = list.filter((i) => i.category === category);
        if (q) {
          const s = q.toLowerCase();
          list = list.filter((i) => i.name.toLowerCase().includes(s) || i.brand.toLowerCase().includes(s));
        }
        setItems(list);
        setTotal(list.length);
        markSampleData(true);
      })
      .finally(() => setLoading(false));
  }, [category, brand, q, sort, markSampleData, enableDemo]);

  useEffect(() => { load(); }, [load]);

  const setFilter = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val === "all") next.delete(key);
    else next.set(key, val);
    setSearchParams(next, { replace: true });
  };

  const onSearch = () => {
    const next = new URLSearchParams(searchParams);
    if (q) next.set("q", q);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  };

  const screenMeta = CORE_PLATFORM_SCREENS.find((s) => s.id === "store");

  return (
    <div className="min-h-screen bg-background" data-testid="construction-store">
      <MarketRateTicker />
      <PageSEO
        title={hi ? "BuildEco Store — ब्रांड-वार सामग्री" : "BuildEco Store — Brand-wise materials"}
        description="Myntra-style construction store — tiles, cement, steel, interior, solar — brand catalogs with live rates and cart checkout."
        path="/store"
      />

      {/* Myntra-style header band */}
      <div className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-white">
        <div className="mx-auto max-w-[1400px] px-4 md:px-10 py-8 md:py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest opacity-90">buildecogroup.com</div>
              <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-1">
                {hi ? "कंस्ट्रक्शन स्टोर" : "Construction Store"}
              </h1>
              <p className="text-sm opacity-90 mt-2 max-w-lg">
                {hi
                  ? "हज़ारों ब्रांड — सामग्री, टाइल्स, सीलिंग, सोलर — Myntra जैसा browse करें, bag में add करें।"
                  : "Thousands of brands — materials, tiles, ceiling, solar — browse like Myntra, add to bag."}
              </p>
            </div>
          <Link to="/cart" className="flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2 rounded-full text-sm font-medium hover:bg-white/25 transition-colors">
            <ShoppingBag className="h-4 w-4" />{hi ? "मेरा बैग" : "My bag"}
          </Link>
          <Link to="/boq-builder" className="flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-colors">
            {hi ? "पूरा BOQ" : "Full BOQ"}
          </Link>
          </div>
          <div className="mt-6 flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-testid="store-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                placeholder={hi ? "स्टील, सीमेंट, टाइल्स खोजें…" : "Search steel, cement, tiles…"}
                className="pl-9 rounded-full bg-white text-foreground border-0 h-11"
              />
            </div>
            <Button onClick={onSearch} className="rounded-full h-11 px-6 bg-white text-primary hover:bg-white/90">
              {hi ? "खोजें" : "Search"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 md:px-10 py-6">
        {screenMeta && (
          <ModuleWorkflowBanner
            hi={hi}
            flowEn={screenMeta.flowEn}
            flowHi={screenMeta.flowHi}
            stepsEn={screenMeta.stepsEn}
            stepsHi={screenMeta.stepsHi}
          />
        )}

        {/* Category store tiles — like Myntra shop by category */}
        <div className="mb-8">
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
            {hi ? "शॉप बाय कैटेगरी" : "Shop by category"}
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            <button
              type="button"
              onClick={() => setFilter("category", "all")}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border transition-colors ${category === "all" ? "bg-primary text-white border-primary" : "border-border hover:border-primary/50"}`}
            >
              {hi ? "सभी" : "All"}
            </button>
            {(meta.verticals || []).map((v) => (
              <button
                key={v.id}
                type="button"
                data-testid={`store-cat-${v.id}`}
                onClick={() => setFilter("category", v.category)}
                className={`shrink-0 flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-colors ${category === v.category ? "bg-primary text-white border-primary" : "border-border hover:border-primary/50 bg-card"}`}
              >
                {v.image && <img src={v.image} alt="" className="h-8 w-8 rounded-full object-cover" />}
                <span className="text-xs font-medium">{hi ? v.name_hi || v.name : v.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Brand filter row */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            <span>{total} {hi ? "आइटम" : "items"}</span>
          </div>
          <select
            data-testid="store-sort"
            value={sort}
            onChange={(e) => setFilter("sort", e.target.value)}
            className="text-xs border border-border rounded-lg px-3 h-9 bg-background"
          >
            <option value="name">{hi ? "नाम" : "Name"}</option>
            <option value="price_asc">{hi ? "कीमत ↑" : "Price ↑"}</option>
            <option value="price_desc">{hi ? "कीमत ↓" : "Price ↓"}</option>
            <option value="brand">{hi ? "ब्रांड" : "Brand"}</option>
          </select>
          <div className="flex flex-wrap gap-1.5 flex-1">
            <button
              type="button"
              onClick={() => setFilter("brand", "all")}
              className={`text-xs px-3 py-1 rounded-full border ${brand === "all" ? "bg-primary text-white border-primary" : "border-border"}`}
            >
              {hi ? "सभी ब्रांड" : "All brands"}
            </button>
            {(meta.brands || []).slice(0, 12).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setFilter("brand", b)}
                className={`text-xs px-3 py-1 rounded-full border truncate max-w-[120px] ${brand === b ? "bg-primary text-white border-primary" : "border-border hover:border-primary/40"}`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground text-sm">{hi ? "कोई आइटम नहीं" : "No items found"}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {items.map((item) => (
              <StoreProductCard key={`${item.source}-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
