import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import {
  Sofa, Compass, Wrench, Grid3x3, Layers, Pipette, Hammer, Leaf, Calculator, ArrowRight, Loader2,
} from "lucide-react";

const ICONS = {
  sofa: Sofa, compass: Compass, wrench: Wrench, grid: Grid3x3,
  layers: Layers, pipe: Pipette, hammer: Hammer, leaf: Leaf,
};

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
          const Icon = ICONS[v.icon] || Calculator;
          const inner = (
            <div
              className="group p-5 border border-border rounded-xl bg-card hover:border-primary hover:shadow-md transition-all h-full flex flex-col"
            >
              <Icon className="h-6 w-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-display font-bold text-sm leading-snug">
                {hi ? v.name_hi || v.name : v.name}
              </div>
              <div className="text-xs text-muted-foreground mt-2 flex-1">
                {hi ? "ब्रांड-वार कैलकुलेटर" : "Brand-wise calculator"}
              </div>
              <div className="mt-3 text-xs font-medium text-primary flex items-center gap-1">
                {hi ? "खोलें" : "Open"}<ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
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
