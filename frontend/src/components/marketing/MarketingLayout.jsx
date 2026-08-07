import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import AIAssistant from "@/components/AIAssistant";

export default function MarketingLayout({ children }) {
  return (
    <div className="App min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <AIAssistant />
    </div>
  );
}
