import { Link, useLocation } from "react-router-dom";
import { Home, Store, Gavel, Sun, LayoutDashboard, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const TABS = [
  { to: "/", label: "Home", icon: Home, match: (p) => p === "/" },
  { to: "/store", label: "Store", icon: Store, match: (p) => p.startsWith("/store") || p.startsWith("/marketplace") || p.startsWith("/mart") },
  { to: "/tenders", label: "Tenders", icon: Gavel, match: (p) => p.startsWith("/tenders") },
  { to: "/solar", label: "Solar", icon: Sun, match: (p) => p.startsWith("/solar") },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const lastTab = user
    ? { to: "/dashboard", label: "App", icon: LayoutDashboard, match: (p) => p.startsWith("/dashboard") || p.startsWith("/ads") }
    : { to: "/login", label: "Login", icon: LogIn, match: (p) => p === "/login" || p === "/register" };

  const items = [...TABS, lastTab];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl mobile-bottom-nav"
      aria-label="Main navigation"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {items.map(({ to, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={to}
              to={to}
              data-testid={`mobile-tab-${label.toLowerCase()}`}
              className={`relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors active:scale-95 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} strokeWidth={active ? 2.5 : 1.75} />
              <span>{label}</span>
              {active && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
