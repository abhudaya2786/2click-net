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

/** Core nav — premium sites keep primary nav to 4–5 items max */
const PRIMARY_LINKS = [
  { to: "/store", key: "nav.store", label: "Store", labelHi: "स्टोर" },
  { to: "/tenders", key: "nav.tenders", label: "Tenders", labelHi: "टेंडर" },
  { to: "/mart", key: "nav.mart", label: "Super Mart", labelHi: "सुपर मार्ट" },
  { to: "/interior-boq", key: "nav.interior_boq", label: "Interior BOQ", labelHi: "इंटीरियर BOQ" },
];

const EXPLORE_LINKS = [
  { to: "/consultants", key: "nav.consultants", label: "Consultants", labelHi: "कंसल्टेंट" },
  { to: "/boq-builder", key: "nav.boq_builder", label: "Full BOQ", labelHi: "पूरा BOQ" },
  { to: "/solar", label: "Solar", labelHi: "सोलर" },
  { to: "/marketplace", label: "Marketplace", labelHi: "मार्केटप्लेस" },
  { to: "/freelancers", label: "Freelancers", labelHi: "फ्रीलांसर" },
  { to: "/services", label: "All services", labelHi: "सभी सेवाएँ" },
  { to: "/pricing", key: "nav.pricing", label: "Pricing", labelHi: "प्लान" },
  { to: "/enroll", label: "Enrollment", labelHi: "पंजीकरण" },
  { to: "/become-vendor", label: "Become vendor", labelHi: "विक्रेता बनें" },
  { to: "/contact", label: "Contact", labelHi: "संपर्क" },
];

const MOBILE_LINKS = [...PRIMARY_LINKS, ...EXPLORE_LINKS];

export default function Navbar() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const { brand_name, navbar_style } = useBranding();
  const { lang, toggle: toggleLang, t, enabled } = useLang();
  const navCopy = NAV_COPY[lang] || NAV_COPY.en;
  const [open, setOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const nav = useNavigate();
  const lbl = (l) => t(l.key) || (lang === "hi" ? l.labelHi : l.label);

  return (
    <header
      className={`z-50 border-b border-border/40 bg-background/80 backdrop-blur-2xl ${
        navbar_style === "sticky" ? "sticky top-0" : ""
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2.5 shrink-0">
          <BrandLogo className="h-8 w-8" iconClass="h-4 w-4" />
          <span className="font-display font-extrabold text-base tracking-tight hidden sm:inline">{brand_name}</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {PRIMARY_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              className="nav-link"
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
                <div className="absolute top-full right-0 mt-2 w-52 rounded-xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-lg py-2 z-50">
                  {EXPLORE_LINKS.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setExploreOpen(false)}
                      className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                    >
                      {lbl(l)}
                    </Link>
                  ))}
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
            <Button
              data-testid="nav-auth-btn"
              onClick={() => nav("/login")}
              className="btn-premium hidden sm:inline-flex h-9 text-sm px-4 rounded-xl"
            >
              {navCopy.authCta}
            </Button>
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
          {MOBILE_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-sm font-medium py-2.5 px-2 rounded-lg hover:bg-accent/50 active:text-primary"
            >
              {lbl(l)}
            </Link>
          ))}
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
