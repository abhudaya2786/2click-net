import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { Calculator, ArrowRight, Loader2 } from "lucide-react";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function InteriorBOQHub({ onSelect, hideIntro = false }) {
  const { lang } = useLang();
  const hi = lang === "hi";
  const [verticals, setVerticals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/mart/interior-verticals")
      .then(({ data }) => setVerticals(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="interior-boq-hub">
      {!hideIntro && (
      <p className="text-sm text-muted-foreground">
        {hi
          ? "हर श्रेणी का अपना कैलकुलेटर — ब्रांड compare करके BOQ बनाएँ।"
          : "Each category has its own calculator — compare brands and build BOQ."}
      </p>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {verticals.map((v) => {
          const inner = (
            <div className="group border border-border rounded-xl bg-card hover:border-primary hover:shadow-md transition-all h-full overflow-hidden">
              <div className="relative h-28 overflow-hidden bg-muted">
                {v.image ? (
                  <img src={v.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Calculator className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3">
                  <div className="font-display font-bold text-sm text-white leading-snug">
                    {hi ? v.name_hi || v.name : v.name}
                  </div>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-2">
                <div className="text-xs text-muted-foreground">
                  {v.product_count || 0} {hi ? "उत्पाद" : "products"} · {v.brand_count || 0} {hi ? "ब्रांड" : "brands"}
                </div>
                {v.from_rate != null && (
                  <div className="text-xs">
                    {hi ? "शुरू" : "From"} <span className="font-mono font-bold text-primary">{fmt(v.from_rate)}</span>
                    <span className="text-muted-foreground">/{v.from_unit}</span>
                    {v.from_brand && <span className="text-muted-foreground"> · {v.from_brand}</span>}
                  </div>
                )}
                <div className="text-xs font-medium text-primary flex items-center gap-1 mt-1">
                  {hi ? "कैटलॉग खोलें" : "Open catalog"}
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
          if (onSelect) {
            return (
              <button key={v.id} type="button" data-testid={`hub-${v.id}`} onClick={() => onSelect(v.id)} className="text-left">
                {inner}
              </button>
            );
          }
          return (
            <Link key={v.id} to={`/interior-boq/${v.id}`} data-testid={`hub-${v.id}`}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
