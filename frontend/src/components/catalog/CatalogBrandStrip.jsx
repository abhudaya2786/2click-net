import { Link } from "react-router-dom";
import { useCatalog } from "@/context/CatalogContext";
import { useLang } from "@/context/LanguageContext";
import { Loader2, ArrowRight } from "lucide-react";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

/**
 * Horizontal live brand-rate strip — embedded site-wide above footer / in dashboard.
 */
export default function CatalogBrandStrip({ className = "" }) {
  const { loading, featured, totalBrands } = useCatalog();
  const { lang } = useLang();
  const hi = lang === "hi";

  if (loading) {
    return (
      <div className={`border-y border-border bg-muted/30 py-3 flex justify-center ${className}`} data-testid="catalog-brand-strip">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    );
  }

  if (!featured.length) return null;

  return (
    <div className={`border-y border-border bg-muted/20 ${className}`} data-testid="catalog-brand-strip">
      <div className="mx-auto max-w-[1400px] px-4 md:px-10 py-3 flex items-center gap-3">
        <div className="shrink-0 hidden sm:block">
          <div className="text-[10px] font-mono uppercase tracking-widest text-primary">
            {hi ? "लाइव कैटलॉग" : "Live catalog"}
          </div>
          <div className="text-[10px] text-muted-foreground">{totalBrands}+ {hi ? "ब्रांड" : "brands"}</div>
        </div>
        <div className="flex-1 overflow-x-auto scrollbar-thin flex gap-2 pb-1 -mb-1">
          {featured.map((f) => (
            <Link
              key={f.id}
              to={f.link}
              data-testid={`strip-brand-${f.id}`}
              className="shrink-0 flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/50 transition-colors max-w-[220px]"
            >
              {f.image && (
                <img src={f.image} alt="" className="h-8 w-8 rounded-full object-cover border border-border shrink-0" />
              )}
              <div className="min-w-0 text-left">
                <div className="text-[10px] font-medium truncate leading-tight">{f.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{f.brand}</div>
              </div>
              <span className="text-[10px] font-mono font-bold text-primary shrink-0">{fmt(f.rate)}</span>
            </Link>
          ))}
        </div>
        <Link to="/mart" className="shrink-0 text-xs font-medium text-primary flex items-center gap-1 hover:underline hidden md:flex">
          {hi ? "सभी दरें" : "All rates"}<ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
