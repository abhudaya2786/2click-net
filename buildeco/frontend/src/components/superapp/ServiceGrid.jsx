import { Link } from "react-router-dom";
import { useLang } from "@/context/LanguageContext";
import { SUPER_COPY } from "@/lib/superAppCopy";
import {
  Hammer, PenTool, Sofa, Sun, Scan, Box, Package, Users, HardHat, Kanban, ArrowUpRight,
} from "lucide-react";

const ICONS = {
  construction: Hammer,
  architecture: PenTool,
  interior: Sofa,
  solar: Sun,
  lidar: Scan,
  vr: Box,
  materials: Package,
  labour: Users,
  contractor: HardHat,
  pm: Kanban,
};

export default function ServiceGrid({ className = "" }) {
  const { lang } = useLang();
  const c = SUPER_COPY[lang] || SUPER_COPY.en;
  const label = (item) => (lang === "hi" ? item.hi : item.en);

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-t border-l border-border ${className}`}>
      {c.services.map((s) => {
        const Icon = ICONS[s.id] || Package;
        return (
          <Link
            key={s.id}
            to={s.to}
            className="group flex items-start gap-3 border-r border-b border-border p-5 md:p-6 bg-background hover:bg-muted/40 transition-colors"
          >
            <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="min-w-0 flex-1">
              <span className="text-sm font-semibold tracking-tight flex items-center gap-1">
                {label({ en: s.en, hi: s.hi })}
                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
