import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  X, Calculator, ShoppingBag, Sun, Gavel, Building2,
  Compass, HardHat, ClipboardList, Wand2, Users, FileText, Download, Sparkles,
} from "lucide-react";
import { useLang } from "@/context/LanguageContext";

const APPS = [
  { to: "/store", icon: ShoppingBag, en: "Store", hi: "स्टोर" },
  { to: "/mart", icon: Calculator, en: "Super Mart", hi: "सुपर मार्ट" },
  { to: "/estimate", icon: Calculator, en: "Estimate", hi: "अनुमान" },
  { to: "/boq-builder", icon: Wand2, en: "Full BOQ", hi: "पूरा BOQ" },
  { to: "/interior-boq", icon: ClipboardList, en: "Interior BOQ", hi: "इंटीरियर BOQ" },
  { to: "/tenders", icon: Gavel, en: "Tenders", hi: "टेंडर" },
  { to: "/solar", icon: Sun, en: "Solar", hi: "सोलर" },
  { to: "/upcoming-projects", icon: Building2, en: "Projects", hi: "प्रोजेक्ट" },
  { to: "/property-advisory", icon: Compass, en: "Advisory", hi: "सलाह" },
  { to: "/equipment-rental", icon: HardHat, en: "Rental", hi: "रेंटल" },
  { to: "/consultants", icon: Compass, en: "Consultants", hi: "कंसल्टेंट" },
  { to: "/freelancers", icon: Users, en: "Freelancers", hi: "फ्रीलांसर" },
  { to: "/enroll", icon: FileText, en: "Enroll", hi: "पंजीकरण" },
  { to: "/download-app", icon: Download, en: "Install App", hi: "ऐप इंस्टॉल" },
];

export default function MobileMoreSheet({ open, onClose }) {
  const { lang } = useLang();
  const hi = lang === "hi";
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) setVisible(true);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!visible && !open) return null;

  const handleAnimEnd = () => {
    if (!open) setVisible(false);
  };

  return (
    <div
      className={`md:hidden fixed inset-0 z-[60] ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      data-testid="mobile-more-sheet"
    >
      <button
        type="button"
        aria-label="Close"
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        onTransitionEnd={handleAnimEnd}
        className={`absolute inset-x-0 bottom-0 rounded-t-2xl border border-border bg-background shadow-2xl transition-transform duration-300 ease-out pb-[env(safe-area-inset-bottom)] ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div>
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30" />
            <h2 className="font-display font-bold text-base">
              {hi ? "सभी ऐप्स" : "All apps"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {hi ? "निर्माण सुपर-ऐप टूल्स" : "Construction super-app tools"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-muted flex items-center justify-center touch-target"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 px-3 pb-4 max-h-[55vh] overflow-y-auto">
          {APPS.map((app) => (
            <Link
              key={app.to}
              to={app.to}
              onClick={onClose}
              data-testid={`more-app-${app.to.replace(/\//g, "")}`}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl active:bg-muted/80 transition-colors"
            >
              <span className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <app.icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="text-[10px] font-medium text-center leading-tight line-clamp-2">
                {hi ? app.hi : app.en}
              </span>
            </Link>
          ))}
        </div>

        <div className="px-4 pb-4">
          <Link
            to="/platform"
            onClick={onClose}
            className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border text-sm font-medium active:bg-muted"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            {hi ? "पूरा प्लेटफ़ॉर्म गाइड" : "Full platform guide"}
          </Link>
        </div>
      </div>
    </div>
  );
}
