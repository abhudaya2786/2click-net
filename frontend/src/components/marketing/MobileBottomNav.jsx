import { Link, useLocation } from "react-router-dom";
import { Home, FolderKanban, Layers, Sparkles, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { SUPER_COPY } from "@/lib/superAppCopy";

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { lang } = useLang();
  const nav = SUPER_COPY[lang]?.nav || SUPER_COPY.en.nav;

  const openAi = () => {
    window.dispatchEvent(new Event("open-ai-assistant"));
  };

  const profileTab = user
    ? { to: "/dashboard", label: nav.profile, icon: User, match: (p) => p.startsWith("/dashboard") || p.startsWith("/ads") }
    : { to: "/login", label: nav.profile, icon: User, match: (p) => p === "/login" || p === "/register" };

  const items = [
    { to: "/", label: nav.home, icon: Home, match: (p) => p === "/" },
    { to: "/projects", label: nav.projects, icon: FolderKanban, match: (p) => p.startsWith("/projects") || p.startsWith("/build") },
    { to: "/services", label: nav.services, icon: Layers, match: (p) => p.startsWith("/services") || p.startsWith("/store") || p.startsWith("/mart") },
    { type: "ai", label: nav.ai, icon: Sparkles, match: () => false },
    profileTab,
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl mobile-bottom-nav"
      aria-label="Main navigation"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          if (item.type === "ai") {
            return (
              <button
                key="ai"
                type="button"
                data-testid="mobile-tab-ai"
                onClick={openAi}
                className="relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground active:scale-95"
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
                <span className="max-w-[4.5rem] truncate text-center leading-tight">{item.label}</span>
              </button>
            );
          }
          const active = item.match(pathname);
          const tabId = item.to.replace(/\W+/g, "-").replace(/^-|-$/g, "") || "home";
          return (
            <Link
              key={item.to}
              to={item.to}
              data-testid={`mobile-tab-${tabId}`}
              className={`relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors active:scale-95 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} strokeWidth={active ? 2.5 : 1.75} />
              <span className="max-w-[4.5rem] truncate text-center leading-tight">{item.label}</span>
              {active && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
