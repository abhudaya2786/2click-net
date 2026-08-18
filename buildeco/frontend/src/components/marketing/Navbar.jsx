import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon, ChevronDown } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useBranding } from "@/context/BrandingContext";
import { useLang } from "@/context/LanguageContext";
import BrandLogo from "@/components/marketing/BrandLogo";
import CartNavButton from "@/components/store/CartNavButton";
import { NAV_COPY } from "@/lib/homeCopy";
import ExploreDropdownLinks, { exploreLabel } from "@/components/marketing/ExploreDropdownLinks";
import { EXPLORE_MENU, EXPLORE_EXTENDED } from "@/lib/exploreNavMap";

const PRIMARY_LINKS = [
  { to: "/build", key: "modular", en: "Modular Homes", hi: "मॉड्यूलर होम" },
  { to: "/services", key: "green", en: "Green Building", hi: "ग्रीन बिल्डिंग" },
  { to: "/upcoming-projects", key: "portfolio", en: "Portfolio", hi: "पोर्टफोलियो" },
  { to: "/about", key: "about", en: "About", hi: "हमारे बारे में" },
  { to: "/platform", key: "insights", en: "Insights", hi: "इनसाइट्स" },
];

const MOBILE_EXPLORE = [...EXPLORE_MENU, ...EXPLORE_EXTENDED];

export default function Navbar() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const { brand_name, navbar_style } = useBranding();
  const { lang, toggle: toggleLang, t, enabled } = useLang();
  const navCopy = NAV_COPY[lang] || NAV_COPY.en;
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const nav = useNavigate();

  const lbl = (l) => {
    if (l.en) return lang === "hi" ? l.hi : l.en;
    if (l.key) {
      const translated = t(l.key);
      if (translated && translated !== l.key) return translated;
    }
    return exploreLabel(l, lang, t);
  };

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <header
      className={`z-50 border-b border-border bg-card mobile-app-header ${
        navbar_style === "sticky" ? "sticky top-0" : "sticky top-0 md:static"
      }`}
    >
      <div className="marketing-shell h-16 flex items-center justify-between gap-4">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2.5 shrink-0">
          <BrandLogo className="h-11 w-11" />
          <span className="font-display font-bold text-base tracking-tight text-primary truncate max-w-[11rem] sm:max-w-none">
            {brand_name || "Build Eco Group"}
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 xl:gap-7">
          {PRIMARY_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.key}`}
              className={`nav-link ${isActive(l.to) ? "nav-link-active" : ""}`}
            >
              {lbl(l)}
            </Link>
          ))}
          <div className="relative">
            <button
              type="button"
              data-testid="nav-more"
              onClick={() => setExploreOpen((v) => !v)}
              className="nav-link flex items-center gap-1"
            >
              {navCopy.explore}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${exploreOpen ? "rotate-180" : ""}`} />
            </button>
            {exploreOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setExploreOpen(false)} aria-hidden />
                <div className="absolute top-full right-0 mt-2 w-60 rounded border border-border bg-card emerald-shadow py-2 z-50 max-h-[70vh] overflow-y-auto">
                  <ExploreDropdownLinks onNavigate={() => setExploreOpen(false)} lbl={lbl} />
                </div>
              </>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-1.5">
          {enabled.length > 1 && (
            <button
              type="button"
              data-testid="lang-toggle"
              onClick={toggleLang}
              className="h-9 w-9 flex items-center justify-center rounded text-xs font-mono uppercase text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Switch language"
            >
              {navCopy.langSwitch}
            </button>
          )}
          <CartNavButton />
          <button
            data-testid="theme-toggle"
            onClick={toggle}
            className="h-9 w-9 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={1.5} /> : <Moon className="h-4 w-4" strokeWidth={1.5} />}
          </button>
          {user ? (
            <Button
              data-testid="nav-dashboard-btn"
              onClick={() => nav("/dashboard")}
              className="btn-premium btn-primary-eco hidden sm:inline-flex h-9 rounded px-4"
            >
              {navCopy.dashboard}
            </Button>
          ) : (
            <Button
              data-testid="nav-enquire-btn"
              onClick={() => nav("/contact")}
              className="btn-premium btn-primary-eco hidden sm:inline-flex h-9 text-xs font-semibold uppercase tracking-[0.06em] px-4 rounded"
            >
              {lang === "hi" ? "Enquire Now" : "Enquire Now"}
            </Button>
          )}
          <button
            className="lg:hidden h-9 w-9 flex items-center justify-center rounded hover:bg-accent"
            onClick={() => setOpen(!open)}
            data-testid="nav-mobile-toggle"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-card px-4 py-4 flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
          {PRIMARY_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-sm font-semibold uppercase tracking-wide py-2.5 px-2 rounded hover:bg-accent active:text-primary"
            >
              {lbl(l)}
            </Link>
          ))}
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 pt-2">{navCopy.explore}</p>
          {MOBILE_EXPLORE.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-sm font-medium py-2.5 px-2 rounded hover:bg-accent active:text-primary"
            >
              {lbl(l)}
            </Link>
          ))}
          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className="mt-2 text-center text-sm font-semibold uppercase tracking-wide py-2.5 rounded bg-primary text-primary-foreground"
          >
            Enquire Now
          </Link>
        </div>
      )}
    </header>
  );
}
