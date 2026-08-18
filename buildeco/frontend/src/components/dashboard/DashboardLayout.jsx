import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useBranding } from "@/context/BrandingContext";
import { HardHat, LogOut, Sun, Moon, Globe } from "lucide-react";
import BrandLogo from "@/components/marketing/BrandLogo";
import { isNativeCapacitor } from "@/lib/pwa";
import CatalogBrandStrip from "@/components/catalog/CatalogBrandStrip";

const ROLE_LABEL = { super_admin: "Super Admin", vendor: "Vendor", customer: "Customer", contractor: "Contractor" };

export default function DashboardLayout({ nav, active, setActive, children, title }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { brand_name } = useBranding();
  const nativeApp = isNativeCapacitor();

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-background ${nativeApp ? "pt-[env(safe-area-inset-top)]" : ""}`}>
      {/* Mobile top tab bar */}
      <div className="md:hidden border-b border-border bg-card sticky top-0 z-30">
        <div className="h-14 flex items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo className="h-9 w-9" />
            <span className="font-display font-extrabold text-sm tracking-tight truncate max-w-[140px]">{title}</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/" className="h-10 w-10 flex items-center justify-center border border-border" title="View site">
              <Globe className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <button onClick={toggle} className="h-10 w-10 flex items-center justify-center border border-border">
              {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={1.5} /> : <Moon className="h-4 w-4" strokeWidth={1.5} />}
            </button>
            <button data-testid="dash-logout-mobile" onClick={logout} className="h-10 w-10 flex items-center justify-center border border-border text-muted-foreground hover:text-destructive" title="Log out">
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <nav className="dashboard-mobile-nav flex gap-1 overflow-x-auto px-2 pb-2" aria-label="Dashboard sections">
          {nav.map((n) => (
            <button
              key={n.id}
              data-testid={`nav-mobile-${n.id}`}
              onClick={() => setActive(n.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-full transition-colors touch-target ${
                active === n.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              <n.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              {n.label}
              {n.badge > 0 && (
                <span className="ml-0.5 min-w-[16px] h-4 px-1 text-[9px] font-bold rounded-full bg-white/20">
                  {n.badge > 99 ? "99+" : n.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <aside className="hidden md:flex w-60 border-r border-border flex-col shrink-0 bg-card">
        <Link to="/" className="h-16 flex items-center gap-2.5 px-4 border-b border-border">
          <BrandLogo className="h-9 w-9" />
          <span className="font-display font-extrabold tracking-tight hidden md:inline">{brand_name}</span>
        </Link>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {nav.map((n) => (
            <button key={n.id} data-testid={`nav-${n.id}`} onClick={() => setActive(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${active === n.id ? "bg-primary text-white" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
              <n.icon className="h-4.5 w-4.5 shrink-0" strokeWidth={1.5} />
              <span className="hidden md:inline">{n.label}</span>
              {n.badge > 0 && (
                <span data-testid={`nav-badge-${n.id}`}
                  className={`ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full ${active === n.id ? "bg-white text-primary" : "bg-primary text-white"}`}>
                  {n.badge > 99 ? "99+" : n.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-border">
          <button data-testid="dash-logout" onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="h-4.5 w-4.5" strokeWidth={1.5} /><span className="hidden md:inline">Log out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-16 border-b border-border items-center justify-between px-5 md:px-8 bg-card">
          <div>
            <h1 className="font-display font-extrabold text-lg tracking-tight leading-none">{title}</h1>
            <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{ROLE_LABEL[user?.role]} workspace</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="h-9 w-9 flex items-center justify-center border border-border hover:bg-accent transition-colors" title="View site"><Globe className="h-4 w-4" strokeWidth={1.5} /></Link>
            <button onClick={toggle} className="h-9 w-9 flex items-center justify-center border border-border hover:bg-accent transition-colors">
              {theme === "dark" ? <Sun className="h-4 w-4" strokeWidth={1.5} /> : <Moon className="h-4 w-4" strokeWidth={1.5} />}
            </button>
            <div className="h-9 px-3 flex items-center gap-2 bg-accent">
              <div className="h-6 w-6 bg-primary text-white flex items-center justify-center text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</div>
              <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <PersonalBanner user={user} />
          {children}
          <div className="mt-8 -mx-4 md:-mx-8">
            <CatalogBrandStrip />
          </div>
        </main>
      </div>
    </div>
  );
}

function PersonalBanner({ user }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const interests = user?.interests || [];
  return (
    <div data-testid="personal-banner" className="mb-6 border border-border bg-card p-5 flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="font-display font-extrabold text-xl tracking-tight">{greet}, {user?.name?.split(" ")[0]} 👋</div>
        <div className="text-sm text-muted-foreground mt-0.5">Your personalized {user?.role?.replace("_", " ")} workspace{user?.company ? ` · ${user.company}` : ""}</div>
      </div>
      {interests.length > 0 && (
        <div className="flex flex-wrap gap-1.5" data-testid="personal-interests">
          {interests.slice(0, 6).map((i) => (
            <span key={i} className="text-xs font-mono bg-primary/10 text-primary px-2.5 py-1">{i}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, color = "text-primary" }) {
  return (
    <div className="bg-card border border-border p-5 hover:shadow-sm transition-shadow">
      <Icon className={`h-5 w-5 ${color} mb-3`} strokeWidth={1.5} />
      <div className="font-display font-extrabold text-2xl tracking-tight mono">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
