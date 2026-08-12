import { Link, useNavigate } from "react-router-dom";
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
import { SUPER_COPY } from "@/lib/superAppCopy";
import ExploreDropdownLinks, { exploreLabel } from "@/components/marketing/ExploreDropdownLinks";
import { EXPLORE_MENU, EXPLORE_EXTENDED } from "@/lib/exploreNavMap";
import { useDemoMode } from "@/context/DemoModeContext";

const PRIMARY_LINKS = [
  { to: "/", key: "home" },
  { to: "/build", key: "build" },
  { to: "/estimate", key: "estimate" },
  { to: "/design", key: "design" },
  { to: "/projects", key: "projects" },
];

const MOBILE_EXPLORE = [...EXPLORE_MENU, ...EXPLORE_EXTENDED];

export default function Navbar() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const { brand_name, navbar_style } = useBranding();
  const { lang, toggle: toggleLang, t, enabled } = useLang();
  const navCopy = NAV_COPY[lang] || NAV_COPY.en;
  const superNav = SUPER_COPY[lang]?.nav || SUPER_COPY.en.nav;
  const [open, setOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const nav = useNavigate();
  const { openPanel } = useDemoMode();

  const lbl = (l) => {
    if (l.key && superNav[l.key]) return superNav[l.key];
    if (l.key) {
      const translated = t(l.key);
      if (translated && translated !== l.key) return translated;
    }
    return exploreLabel(l, lang, t);
  };

  const openAi = () => {
    window.dispatchEvent(new Event("open-ai-assistant"));
  };

  return (
    <header
      className={`z-50 border-b border-border/40 bg-background/80 backdrop-blur-2xl mobile-app-header ${
        navbar_style === "sticky" ? "sticky top-0" : "sticky top-0 md:static"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2.5 shrink-0">
          <BrandLogo className="h-8 w-8" iconClass="h-4 w-4" />
          <span className="font-display font-extrabold text-base tracking-tight truncate max-w-[10rem] sm:max-w-none">{brand_name}</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-4 xl:gap-5">
          {PRIMARY_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.key}`}
              className="nav-link"
            >
              {lbl(l)}
            </Link>
          ))}
          <button type="button" onClick={openAi} className="nav-link">
            {superNav.ai}
          </button>
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
                <div className="absolute top-full right-0 mt-2 w-56 rounded-xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-lg py-2 z-50 max-h-[70vh] overflow-y-auto">
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
              className="h-9 w-9 flex items-center justify-center rounded-lg text-xs font-mono uppercase text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              title="Switch language"
            >
              {navCopy.langSwitch}
            </button>
          )}
          <CartNavButton />
          <button
            data-testid="theme-toggle"
            onClick={toggle}
            className="h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={1.5} /> : <Moon className="h-4 w-4" strokeWidth={1.5} />}
          </button>
          {user ? (
            <Button
              data-testid="nav-dashboard-btn"
              onClick={() => nav("/dashboard")}
              className="btn-premium hidden sm:inline-flex h-9 rounded-xl px-4"
            >
              {navCopy.dashboard}
            </Button>
          ) : (
            <>
              <Button variant="ghost" data-testid="nav-demo-btn" onClick={openPanel}
                className="rounded-lg hidden sm:inline-flex h-9 text-primary">{lang === "hi" ? "डेमो" : "Demo"}</Button>
              <Button variant="ghost" data-testid="nav-login-btn" onClick={() => nav("/login")}
                className="rounded-lg hidden sm:inline-flex h-9">{navCopy.login}</Button>
              <Button data-testid="nav-signup-btn" onClick={() => nav("/register")}
                className="btn-premium hidden sm:inline-flex h-9 text-sm px-3">{navCopy.join}</Button>
            </>
          )}
          <button
            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg hover:bg-accent/60"
            onClick={() => setOpen(!open)}
            data-testid="nav-mobile-toggle"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/40 bg-background px-4 py-4 flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
          {PRIMARY_LINKS.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm font-medium py-2.5 px-2 rounded-lg hover:bg-accent/50 active:text-primary">
              {lbl(l)}
            </Link>
          ))}
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 pt-2">{navCopy.explore}</p>
          {MOBILE_EXPLORE.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-sm font-medium py-2.5 px-2 rounded-lg hover:bg-accent/50 active:text-primary"
            >
              {lbl(l)}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => { setOpen(false); openAi(); }}
            className="text-sm font-medium py-2.5 px-2 rounded-lg hover:bg-accent/50 text-left"
          >
            {superNav.ai}
          </button>
          {!user && (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="mt-2 text-center text-sm font-semibold py-2.5 rounded-xl bg-primary text-primary-foreground"
            >
              {navCopy.authCta}
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
