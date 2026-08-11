import { Link } from "react-router-dom";
import { useLang } from "@/context/LanguageContext";
import { withDemoParam } from "@/lib/demoData";
import {
  Gavel, Store, Sun, Building2, Calculator, Users, Briefcase,
  FileText, ClipboardList, ArrowRight, HardHat, Compass, ShoppingBag, Wand2,
} from "lucide-react";

const TOOLS = [
  { to: "/tenders", icon: Gavel, en: "Tender Hub", hi: "टेंडर", descEn: "Live tenders & reverse auction", descHi: "लाइव टेंडर और ऑक्शन" },
  { to: "/store", icon: ShoppingBag, en: "Store", hi: "स्टोर", descEn: "Myntra-style shop — all brands", descHi: "Myntra जैसा स्टोर — सभी ब्रांड" },
  { to: "/marketplace", icon: Store, en: "Marketplace", hi: "मार्केटप्लेस", descEn: "Materials & vendor catalog", descHi: "सामग्री और विक्रेता" },
  { to: "/mart", icon: Calculator, en: "Super Mart + BOQ", hi: "सुपर मार्ट + BOQ", descEn: "Brand-wise rates & BOQ", descHi: "ब्रांड-वार दर और BOQ" },
  { to: "/boq-builder", icon: Wand2, en: "Full Home BOQ", hi: "पूरा घर BOQ", descEn: "Kitchen, bath, plumber, paint…", descHi: "किचन, बाथ, प्लंबर, पेंट…" },
  { to: "/interior-boq", icon: ClipboardList, en: "Interior BOQ", hi: "इंटीरियर BOQ", descEn: "Tiles, ceiling, PVC, garden…", descHi: "टाइल्स, सीलिंग, PVC, गार्डन…" },
  { to: "/solar", icon: Sun, en: "Solar EPC", hi: "सोलर EPC", descEn: "Sizing, subsidy & quotes", descHi: "साइज़िंग, सब्सिडी, कोट" },
  { to: "/consultants", icon: Compass, en: "Consultants", hi: "कंसल्टेंट", descEn: "Architect, vastu, interior…", descHi: "आर्किटेक्ट, वास्तु, इंटीरियर…" },
  { to: "/freelancers", icon: Briefcase, en: "Freelancers", hi: "फ्रीलांसर", descEn: "Hire professionals", descHi: "पेशेवर हायर करें" },
  { to: "/enroll", icon: FileText, en: "Enrollment", hi: "पंजीकरण", descEn: "User & shop registration", descHi: "यूज़र और दुकान पंजीकरण" },
  { to: "/dashboard", icon: Building2, en: "Mera Ghar ERP", hi: "मेरा घर ERP", descEn: "Home build lifecycle", descHi: "घर निर्माण लाइफसाइकल" },
  { to: "/register", icon: Users, en: "Sign up", hi: "साइन अप", descEn: "Customer, vendor, consultant", descHi: "कस्टमर, विक्रेता, कंसल्टेंट" },
  { to: "/become-vendor", icon: HardHat, en: "Become Vendor", hi: "विक्रेता बनें", descEn: "List your shop online", descHi: "दुकान ऑनलाइन लगाएँ" },
];

export default function PlatformToolsGrid({ compact = false }) {
  const { lang } = useLang();
  const hi = lang === "hi";

  return (
    <div className={`grid gap-3 ${compact ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`} data-testid="platform-tools-grid">
      {TOOLS.map((t) => (
        <Link
          key={t.to}
          to={withDemoParam(t.to)}
          data-testid={`tool-${t.to.replace(/\//g, "")}`}
          className="group flex items-start gap-3 p-4 border border-border rounded-xl bg-card hover:border-primary/50 hover:shadow-sm transition-all"
        >
          <t.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="min-w-0 flex-1">
            <div className="font-display font-bold text-sm flex items-center gap-1">
              {hi ? t.hi : t.en}
              <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{hi ? t.descHi : t.descEn}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
