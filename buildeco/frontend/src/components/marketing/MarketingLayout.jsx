import { useLocation } from "react-router-dom";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import MobileBottomNav from "@/components/marketing/MobileBottomNav";
import InstallAppBanner from "@/components/marketing/InstallAppBanner";
import AIAssistant from "@/components/AIAssistant";
import AdSlot from "@/components/ads/AdSlot";
import CatalogBrandStrip from "@/components/catalog/CatalogBrandStrip";
import { DemoFloatingButton, DemoModeBanner } from "@/components/demo/PlatformDemo";

/** Pages where live brand strip adds value — not on every marketing page */
const BRAND_STRIP_PREFIXES = ["/store", "/mart", "/interior-boq", "/marketplace", "/boq-builder"];

export default function MarketingLayout({ children }) {
  const { pathname } = useLocation();
  const showBrandStrip = BRAND_STRIP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const hideFooter = pathname.startsWith("/login") || pathname.startsWith("/register");

  return (
    <div className="App min-h-screen flex flex-col mobile-app-shell" data-testid="mobile-app-shell">
      <Navbar />
      <DemoModeBanner />
      <AdSlot placement="header" />
      <main className="flex-1 mobile-main-content">{children}</main>
      {showBrandStrip && <CatalogBrandStrip className="border-t border-border/40" />}
      {!hideFooter && (
        <div className="hidden md:block border-t border-border/40">
          <Footer />
        </div>
      )}
      <AIAssistant />
      <InstallAppBanner />
      <MobileBottomNav />
      <DemoFloatingButton />
    </div>
  );
}
