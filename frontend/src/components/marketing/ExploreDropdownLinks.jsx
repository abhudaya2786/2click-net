import { Link } from "react-router-dom";
import { useLang } from "@/context/LanguageContext";
import { EXPLORE_MENU, EXPLORE_EXTENDED } from "@/lib/exploreNavMap";
import { NAV_COPY } from "@/lib/homeCopy";
import { SUPER_COPY } from "@/lib/superAppCopy";

/** Labels for explore dropdown — uses superApp nav keys when available */
export function exploreLabel(item, lang, t) {
  const superNav = SUPER_COPY[lang]?.nav || SUPER_COPY.en.nav;
  if (item.key && superNav[item.key]) return superNav[item.key];
  if (item.key) {
    const tr = t(item.key);
    if (tr && tr !== item.key) return tr;
  }
  return lang === "hi" ? item.labelHi || item.label : item.label;
}

export default function ExploreDropdownLinks({ onNavigate, lbl }) {
  const { lang, t } = useLang();
  const label = lbl || ((item) => exploreLabel(item, lang, t));

  return (
    <>
      {EXPLORE_MENU.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          {label(item)}
        </Link>
      ))}
      <div className="my-2 border-t border-border/40" />
      <p className="px-4 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {(NAV_COPY[lang] || NAV_COPY.en).exploreMore}
      </p>
      {EXPLORE_EXTENDED.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          {label(item)}
        </Link>
      ))}
    </>
  );
}
