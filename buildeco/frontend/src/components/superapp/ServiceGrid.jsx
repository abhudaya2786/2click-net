import { Link } from "react-router-dom";
import { useLang } from "@/context/LanguageContext";
import { SUPER_COPY } from "@/lib/superAppCopy";
import {
  Hammer, PenTool, Sofa, Sun, Scan, Box, Package, Users, HardHat, Kanban,
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
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 ${className}`}>
      {c.services.map((s) => {
        const Icon = ICONS[s.id] || Package;
        return (
          <Link
            key={s.id}
            to={s.to}
            className="glass-card group flex flex-col items-center text-center p-4 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm hover:border-primary/35 hover:shadow-md transition-all"
          >
            <Icon className="h-6 w-6 text-primary mb-2 group-hover:scale-105 transition-transform" strokeWidth={1.5} />
            <span className="text-xs font-medium leading-tight">{label({ en: s.en, hi: s.hi })}</span>
          </Link>
        );
      })}
    </div>
  );
}
