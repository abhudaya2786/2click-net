import { useLang } from "@/context/LanguageContext";
import { SUPER_COPY } from "@/lib/superAppCopy";
import { ShieldCheck, BadgeCheck, FileText, LineChart, FolderLock, CreditCard } from "lucide-react";

const ICONS = [BadgeCheck, ShieldCheck, FileText, LineChart, FolderLock, CreditCard];

export default function TrustStrip({ className = "" }) {
  const { lang } = useLang();
  const c = SUPER_COPY[lang] || SUPER_COPY.en;
  const label = (item) => (lang === "hi" ? item.hi : item.en);

  return (
    <ul className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5 ${className}`}>
      {c.trust.map((t, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <li key={t.en} className="flex items-start gap-3">
            <Icon className="h-4 w-4 text-primary shrink-0 mt-1" strokeWidth={1.75} />
            <span className="text-sm md:text-base text-foreground/80 leading-snug">{label(t)}</span>
          </li>
        );
      })}
    </ul>
  );
}
