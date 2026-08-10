import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { HardHat, Menu, X, Sun, Moon, ChevronDown } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useBranding } from "@/context/BrandingContext";
import { useLang } from "@/context/LanguageContext";

const PRIMARY_LINKS = [
  { to: "/marketplace", label: "Marketplace", labelHi: "मार्केट" },
  { to: "/tenders", label: "Tenders", labelHi: "टेंडर" },
  { to: "/solar", label: "Solar", labelHi: "सोलर" },
  { to: "/mart", label: "Super Mart", labelHi: "सुपर मार्ट" },
  { to: "/pricing", label: "Pricing", labelHi: "प्लान" },
];

const MORE_LINKS = [
  { to: "/become-vendor", label: "Become Vendor", labelHi: "Vendor बनें" },
  { to: "/freelancers", label: "Freelancers", labelHi: "फ्रीलांसर" },
  { to: "/ads", label: "Advertise", labelHi: "विज्ञापन" },
  { to: "/services", label: "Services", labelHi: "सेवाएँ" },
  { to: "/contact", label: "Contact", labelHi: "संपर्क" },
];

const ALL_LINKS = [...PRIMARY_LINKS, ...MORE_LINKS];

export default function Navbar() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const { brand_name } = useBranding();
  const { lang, toggle: toggleLang } = useLang();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const nav = useNavigate();
  const lbl = (l) => (lang === "hi" ? l.labelHi : l.label);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-xl shadow-sm">
      <div className="mx-auto max-w-[1400px] px-4 md:px-10 h-14 md:h-16 flex items-center justify-between">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2.5">
          <div className="h-8 w-8 md:h-9 md:w-9 bg-primary flex items-center justify-center rounded-lg shadow-sm">
            <HardHat className="h-4 w-4 md:h-5 md:w-5 text-white" strokeWidth={1.75} />
          </div>
          <span className="font-display font-extrabold text-base md:text-lg tracking-tight">{brand_name}</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {PRIMARY_LINKS.map((l) => (
            <Link key={l.to} to={l.to} data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {lbl(l)}
            </Link>
          ))}
          <div className="relative">
            <button
              type="button"
              data-testid="nav-more"
              onClick={() => setMoreOpen((v) => !v)}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              More <ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <div className="absolute top-full right-0 mt-2 w-44 rounded-lg border border-border bg-card shadow-lg py-1 z-50">
                {MORE_LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMoreOpen(false)}
                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {lbl(l)}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="lang-toggle"
            onClick={toggleLang}
            className="h-9 px-2 flex items-center justify-center border border-border hover:bg-accent transition-colors rounded-lg text-xs font-mono uppercase"
            title="Switch language"
          >
            {lang === "en" ? "हि" : "EN"}
          </button>
          <button data-testid="theme-toggle" onClick={toggle}
            className="h-9 w-9 flex items-center justify-center border border-border hover:bg-accent transition-colors rounded-lg">
            {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={1.5} /> : <Moon className="h-4 w-4" strokeWidth={1.5} />}
          </button>
          {user ? (
            <Button data-testid="nav-dashboard-btn" onClick={() => nav("/dashboard")}
              className="btn-premium hidden sm:inline-flex h-9">Dashboard</Button>
          ) : (
            <>
              <Button variant="ghost" data-testid="nav-login-btn" onClick={() => nav("/login")}
                className="rounded-lg hidden sm:inline-flex h-9">Log in</Button>
              <Button data-testid="nav-signup-btn" onClick={() => nav("/register")}
                className="btn-premium hidden sm:inline-flex h-9 text-sm px-3">Join</Button>
            </>
          )}
          <button className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg border border-border" onClick={() => setOpen(!open)} data-testid="nav-mobile-toggle">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-1">Menu</p>
          {ALL_LINKS.filter((l) => !["/marketplace", "/tenders", "/solar"].includes(l.to)).map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm font-medium py-2 px-1 active:text-primary">{l.label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
