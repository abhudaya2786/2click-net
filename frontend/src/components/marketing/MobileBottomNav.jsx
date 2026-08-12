import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Calculator, LayoutGrid, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { SUPER_COPY } from "@/lib/superAppCopy";
import MobileMoreSheet from "@/components/marketing/MobileMoreSheet";

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { lang } = useLang();
  const nav = SUPER_COPY[lang]?.nav || SUPER_COPY.en.nav;
  const hi = lang === "hi";
  const [moreOpen, setMoreOpen] = useState(false);

  const profileTab = user
    ? {
        to: "/dashboard",
        label: nav.profile,
        icon: User,
        match: (p) => p.startsWith("/dashboard") || p.startsWith("/ads"),
      }
    : {
        to: "/login",
        label: nav.profile,
        icon: User,
        match: (p) => p === "/login" || p === "/register" || p === "/enroll",
      };

  const items = [
    { to: "/", label: nav.home, icon: Home, match: (p) => p === "/" },
    {
      to: "/store",
      label: hi ? "स्टोर" : "Store",
      icon: ShoppingBag,
      match: (p) => p.startsWith("/store") || p.startsWith("/marketplace") || p.startsWith("/cart"),
    },
    {
      to: "/estimate",
      label: nav.estimate || (hi ? "अनुमान" : "Estimate"),
      icon: Calculator,
      match: (p) =>
        p.startsWith("/estimate") ||
        p.startsWith("/mart") ||
        p.startsWith("/boq") ||
        p.startsWith("/interior-boq") ||
        p.startsWith("/build"),
    },
    {
      type: "more",
      label: hi ? "और" : "More",
      icon: LayoutGrid,
      match: (p) =>
        p.startsWith("/tenders") ||
        p.startsWith("/solar") ||
        p.startsWith("/consultants") ||
        p.startsWith("/platform") ||
        p.startsWith("/download-app"),
    },
    profileTab,
  ];

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl mobile-bottom-nav"
        aria-label="Main navigation"
        data-testid="mobile-bottom-nav"
      >
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
          {items.map((item) => {
            const Icon = item.icon;
            if (item.type === "more") {
              const active = moreOpen || item.match(pathname);
              return (
                <button
                  key="more"
                  type="button"
                  data-testid="mobile-tab-more"
                  onClick={() => setMoreOpen(true)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors active:scale-95 ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} strokeWidth={active ? 2.5 : 1.75} />
                  <span className="max-w-[4.5rem] truncate text-center leading-tight">{item.label}</span>
                  {active && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />}
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
                onClick={() => setMoreOpen(false)}
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
      <MobileMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
