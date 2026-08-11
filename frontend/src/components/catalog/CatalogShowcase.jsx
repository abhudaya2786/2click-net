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
  const featuredSlice = isFull ? featured : featured.slice(0, 6);
  const verticalSlice = isFull ? verticals : verticals.slice(0, 4);

  return (
    <section
      className={`${isFull ? "section-premium" : "py-12 md:py-14"} ${className}`}
      data-testid="catalog-showcase"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              {hi ? "ब्रांड कैटलॉग" : "Brand catalog"}
            </p>
            <h2 className={`font-display font-bold tracking-tight mt-2 text-balance ${isFull ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"}`}>
              {hi ? "फोटो, ब्रांड और लाइव दरें" : "Photos, brands & live rates"}
            </h2>
          </div>
          <Link to="/mart" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 shrink-0">
            {hi ? "सुपर मार्ट" : "Super Mart"}<ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Interior vertical categories */}
        <div className={`grid gap-3 mb-8 ${isFull ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
          {verticalSlice.map((v) => (
            <Link
              key={v.id}
              to={`/interior-boq/${v.id}`}
              data-testid={`showcase-vertical-${v.id}`}
              className="group border border-border/70 rounded-xl overflow-hidden bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-300"
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
