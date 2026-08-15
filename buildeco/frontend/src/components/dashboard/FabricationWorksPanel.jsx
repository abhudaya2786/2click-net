import { useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "@/context/LanguageContext";
import { Wrench, ChevronDown, ChevronUp, ArrowRight, IndianRupee } from "lucide-react";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

/**
 * Fabrication work types with material-wise SKUs — shown on /interior-boq/fabrication
 */
export default function FabricationWorksPanel({ workTypes = [], onPickMaterial }) {
  const { lang } = useLang();
  const hi = lang === "hi";
  const [openId, setOpenId] = useState(workTypes[0]?.id || null);

  if (!workTypes?.length) return null;

  return (
    <section className="border border-border rounded-xl bg-secondary/10 p-4 md:p-6" data-testid="fabrication-works-panel">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-primary flex items-center gap-1.5">
            <Wrench className="h-3.5 w-3.5" />
            {hi ? "फैब्रिकेशन वर्क" : "Fabrication work"}
          </span>
          <h3 className="font-display font-bold text-lg mt-1">
            {hi ? "क्या-क्या हो सकता है — मटेरियल के साथ" : "What can be done — with materials"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            {hi
              ? "गेट, रेलिंग, ग्रिल, सीढ़ी, बाउंड्री, शेड, फेसाड, औद्योगिक एमएस/एसएस — हर वर्क के सामग्री और दर।"
              : "Gates, railings, grills, stairs, boundary, shed, facade, industrial MS/SS — materials and rates per work type."}
          </p>
        </div>
        <Link to="/boq-builder" className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0">
          {hi ? "Full BOQ में जोड़ें" : "Add in Full BOQ"} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-2">
        {workTypes.map((wt) => {
          const isOpen = openId === wt.id;
          return (
            <div key={wt.id} className="border border-border rounded-lg bg-card overflow-hidden" data-testid={`fab-work-${wt.id}`}>
              <button
                type="button"
                className="w-full flex items-center justify-between gap-3 p-3 md:p-4 text-left hover:bg-accent/30 transition-colors"
                onClick={() => setOpenId(isOpen ? null : wt.id)}
              >
                <div>
                  <div className="font-display font-bold text-sm">{hi ? wt.name_hi || wt.name : wt.name}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">{hi ? wt.desc_hi || wt.desc_en : wt.desc_en}</p>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
              </button>
              {isOpen && wt.material_items?.length > 0 && (
                <div className="px-3 md:px-4 pb-3 md:pb-4 border-t border-border">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
                    {wt.material_items.map((m) => (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => onPickMaterial?.(m.name)}
                        className="flex items-start gap-2 p-2 border border-border rounded-md hover:border-primary/50 text-left transition-colors"
                      >
                        {m.image ? (
                          <img src={m.image} alt="" className="h-10 w-10 rounded object-cover shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium leading-snug line-clamp-2">{m.name}</div>
                          {m.from_rate != null && (
                            <div className="text-[10px] text-primary font-mono mt-0.5 flex items-center gap-0.5">
                              <IndianRupee className="h-3 w-3" />
                              {fmt(m.from_rate)}/{m.unit}
                              {m.from_brand && <span className="text-muted-foreground ml-1">· {m.from_brand}</span>}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
