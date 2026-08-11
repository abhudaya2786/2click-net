import { useLang } from "@/context/LanguageContext";
import { SUPER_COPY } from "@/lib/superAppCopy";
import { ShieldCheck, BadgeCheck, FileText, LineChart, FolderLock, CreditCard } from "lucide-react";

const ICONS = [BadgeCheck, ShieldCheck, FileText, LineChart, FolderLock, CreditCard];

export default function TrustStrip({ className = "" }) {
  const { lang } = useLang();
  const c = SUPER_COPY[lang] || SUPER_COPY.en;
  const label = (item) => (lang === "hi" ? item.hi : item.en);

  return (
    <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-3 ${className}`}>
      {c.trust.map((t, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <div key={t.en} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/60 px-4 py-3">
            <Icon className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm text-muted-foreground">{label(t)}</span>
          </div>
        );
      })}
    </div>
  );
}
