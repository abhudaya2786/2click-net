import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { HardHat, Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useBranding } from "@/context/BrandingContext";

const LINKS = [
  { to: "/marketplace", label: "Marketplace" },
  { to: "/mart", label: "Super Mart" },
  { to: "/tenders", label: "Tender Hub" },
  { to: "/freelancers", label: "Freelancers" },
  { to: "/solar", label: "Solar" },
  { to: "/ads", label: "Advertise" },
  { to: "/services", label: "Services" },
  { to: "/pricing", label: "Pricing" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const { brand_name } = useBranding();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl md:bg-background/70">
      <div className="mx-auto max-w-[1400px] px-4 md:px-10 h-14 md:h-16 flex items-center justify-between">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2.5">
          <div className="h-8 w-8 md:h-9 md:w-9 bg-primary flex items-center justify-center rounded-lg md:rounded-none">
            <HardHat className="h-4 w-4 md:h-5 md:w-5 text-white" strokeWidth={1.75} />
          </div>
          <span className="font-display font-extrabold text-base md:text-lg tracking-tight">{brand_name}</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} data-testid={`nav-${l.label.toLowerCase().replace(" ", "-")}`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button data-testid="theme-toggle" onClick={toggle}
            className="h-9 w-9 flex items-center justify-center border border-border hover:bg-accent transition-colors rounded-lg md:rounded-none">
            {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={1.5} /> : <Moon className="h-4 w-4" strokeWidth={1.5} />}
          </button>
          {user ? (
            <Button data-testid="nav-dashboard-btn" onClick={() => nav("/dashboard")}
              className="rounded-lg md:rounded-none hidden sm:inline-flex hover:-translate-y-0.5 transition-transform h-9">Dashboard</Button>
          ) : (
            <>
              <Button variant="ghost" data-testid="nav-login-btn" onClick={() => nav("/login")}
                className="rounded-lg md:rounded-none hidden sm:inline-flex h-9">Log in</Button>
              <Button data-testid="nav-signup-btn" onClick={() => nav("/register")}
                className="rounded-lg md:rounded-none hidden sm:inline-flex hover:-translate-y-0.5 transition-transform h-9 text-sm px-3">Join</Button>
            </>
          )}
          <button className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg border border-border" onClick={() => setOpen(!open)} data-testid="nav-mobile-toggle">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-1">More</p>
          {LINKS.filter((l) => !["/marketplace", "/tenders", "/solar"].includes(l.to)).map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm font-medium py-2 px-1 active:text-primary">{l.label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
