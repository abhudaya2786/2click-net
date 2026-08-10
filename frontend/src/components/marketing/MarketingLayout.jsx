import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import AIAssistant from "@/components/AIAssistant";
import AdSlot from "@/components/ads/AdSlot";

export default function MarketingLayout({ children }) {
  return (
    <div className="App min-h-screen flex flex-col">
      <Navbar />
      <AdSlot placement="header" />
      <main className="flex-1">{children}</main>
      <Footer />
      <AIAssistant />
    </div>
  );
}
