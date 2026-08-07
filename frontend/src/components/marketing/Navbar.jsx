import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { HardHat, Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const LINKS = [
  { to: "/marketplace", label: "Marketplace" },
  { to: "/tenders", label: "Tender Hub" },
  { to: "/solar", label: "Solar" },
  { to: "/services", label: "Services" },
  { to: "/pricing", label: "Pricing" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 h-16 flex items-center justify-between">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2.5">
          <div className="h-9 w-9 bg-primary flex items-center justify-center">
            <HardHat className="h-5 w-5 text-white" strokeWidth={1.75} />
          </div>
          <span className="font-display font-extrabold text-lg tracking-tight">BuildSphere</span>
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
            className="h-9 w-9 flex items-center justify-center border border-border hover:bg-accent transition-colors">
            {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={1.5} /> : <Moon className="h-4 w-4" strokeWidth={1.5} />}
          </button>
          {user ? (
            <Button data-testid="nav-dashboard-btn" onClick={() => nav("/dashboard")}
              className="rounded-none hidden sm:inline-flex hover:-translate-y-0.5 transition-transform">Dashboard</Button>
          ) : (
            <>
              <Button variant="ghost" data-testid="nav-login-btn" onClick={() => nav("/login")}
                className="rounded-none hidden sm:inline-flex">Log in</Button>
              <Button data-testid="nav-signup-btn" onClick={() => nav("/register")}
                className="rounded-none hover:-translate-y-0.5 transition-transform">Get Started</Button>
            </>
          )}
          <button className="lg:hidden h-9 w-9 flex items-center justify-center" onClick={() => setOpen(!open)} data-testid="nav-mobile-toggle">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background px-5 py-4 flex flex-col gap-3">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm font-medium py-1">{l.label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
