import { Link } from "react-router-dom";
import { useCatalog } from "@/context/CatalogContext";
import { useLang } from "@/context/LanguageContext";
import { Loader2, ArrowRight, ImageIcon } from "lucide-react";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

/**
 * Photo catalog grid — interior verticals + featured brand rates.
 * variant: compact (footer) | full (home hero section)
 */
export default function CatalogShowcase({ variant = "compact", className = "" }) {
  const { loading, verticals, featured, totalBrands } = useCatalog();
  const { lang } = useLang();
  const hi = lang === "hi";

  if (loading) {
    return (
      <div className={`flex justify-center py-10 ${className}`} data-testid="catalog-showcase">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!verticals.length && !featured.length) return null;

  const isFull = variant === "full";
  const featuredSlice = isFull ? featured : featured.slice(0, 8);
  const verticalSlice = isFull ? verticals : verticals.slice(0, 4);

  return (
    <section
      className={`${isFull ? "py-16 md:py-20" : "py-10 border-t border-border"} ${className}`}
      data-testid="catalog-showcase"
    >
      <div className="mx-auto max-w-[1400px] px-4 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-primary">
              {hi ? "ब्रांड कैटलॉग" : "Brand catalog"}
            </span>
            <h2 className={`font-display font-extrabold tracking-tight mt-2 ${isFull ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"}`}>
              {hi ? "हर श्रेणी — फोटो, ब्रांड और अनुमानित दर" : "Every category — photos, brands & estimated rates"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {totalBrands}+ {hi ? "ब्रांड · सुपर मार्ट + इंटीरियर BOQ पर लाइव दरें" : "brands · live rates on Super Mart + Interior BOQ"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/mart" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              {hi ? "सुपर मार्ट" : "Super Mart"}<ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/interior-boq" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              {hi ? "इंटीरियर BOQ" : "Interior BOQ"}<ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Interior vertical categories */}
        <div className={`grid gap-3 mb-8 ${isFull ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
          {verticalSlice.map((v) => (
            <Link
              key={v.id}
              to={`/interior-boq/${v.id}`}
              data-testid={`showcase-vertical-${v.id}`}
              className="group border border-border rounded-xl overflow-hidden bg-card hover:border-primary/50 hover:shadow-sm transition-all"
            >
              <div className="relative h-24 bg-muted overflow-hidden">
                {v.image ? (
                  <img src={v.image} alt="" loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="h-full flex items-center justify-center"><ImageIcon className="h-6 w-6 text-muted-foreground" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 text-white font-display font-bold text-sm leading-snug">
                  {hi ? v.name_hi || v.name : v.name}
                </div>
              </div>
              <div className="p-3 text-xs">
                {v.from_rate != null && (
                  <span className="font-mono font-bold text-primary">{fmt(v.from_rate)}</span>
                )}
                {v.from_unit && <span className="text-muted-foreground">/{v.from_unit}</span>}
                <span className="text-muted-foreground ml-2">{v.brand_count} {hi ? "ब्रांड" : "brands"}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured brand cards */}
        <div className={`grid gap-3 ${isFull ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
          {featuredSlice.map((f) => (
            <Link
              key={f.id}
              to={f.link}
              data-testid={`showcase-brand-${f.id}`}
              className="group flex gap-3 p-3 border border-border rounded-xl bg-card hover:border-primary/40 transition-all"
            >
              <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-muted border border-border">
                {f.image ? (
                  <img src={f.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-6 w-6 m-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium leading-snug line-clamp-2">{f.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{f.brand} · {f.category}</div>
                <div className="font-mono font-bold text-sm text-primary mt-1">
                  {fmt(f.rate)}<span className="text-muted-foreground font-normal text-xs">/{f.unit}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
