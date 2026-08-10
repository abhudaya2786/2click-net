import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useBranding } from "@/context/BrandingContext";
import { HardHat, LogOut, Sun, Moon, Globe } from "lucide-react";

const ROLE_LABEL = { super_admin: "Super Admin", vendor: "Vendor", customer: "Customer", contractor: "Contractor" };

export default function DashboardLayout({ nav, active, setActive, children, title }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { brand_name } = useBranding();

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-16 md:w-60 border-r border-border flex flex-col shrink-0 bg-card">
        <Link to="/" className="h-16 flex items-center gap-2.5 px-4 border-b border-border">
          <div className="h-8 w-8 bg-primary flex items-center justify-center shrink-0"><HardHat className="h-4.5 w-4.5 text-white" strokeWidth={1.75} /></div>
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
        <header className="h-16 border-b border-border flex items-center justify-between px-5 md:px-8 bg-card">
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
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <PersonalBanner user={user} />
          {children}
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
