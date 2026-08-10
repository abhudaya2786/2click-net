import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import MobileBottomNav from "@/components/marketing/MobileBottomNav";
import InstallAppBanner from "@/components/marketing/InstallAppBanner";
import AIAssistant from "@/components/AIAssistant";
import AdSlot from "@/components/ads/AdSlot";

export default function MarketingLayout({ children }) {
  return (
    <div className="App min-h-screen flex flex-col mobile-app-shell">
      <Navbar />
      <AdSlot placement="header" />
      <main className="flex-1 mobile-main-content">{children}</main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <AIAssistant />
      <InstallAppBanner />
      <MobileBottomNav />
    </div>
  );
}
