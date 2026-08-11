import { useLang } from "@/context/LanguageContext";
import { SUPER_COPY } from "@/lib/superAppCopy";
import { Sparkles, Scan, Box, Eye } from "lucide-react";

const ICONS = [Sparkles, Scan, Box, Eye];

export default function TechHighlights({ className = "" }) {
  const { lang } = useLang();
  const c = SUPER_COPY[lang] || SUPER_COPY.en;
  const label = (item) => (lang === "hi" ? item.hi : item.en);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {c.tech.map((t, i) => {
        const Icon = ICONS[i];
        return (
          <span
            key={t.en}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20"
          >
            <Icon className="h-3.5 w-3.5" />
            {label(t)}
          </span>
        );
      })}
    </div>
  );
}
