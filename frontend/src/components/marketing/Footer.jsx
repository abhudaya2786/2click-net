import { Link } from "react-router-dom";
import { useBranding } from "@/context/BrandingContext";
import BrandLogo from "@/components/marketing/BrandLogo";

const COLS = [
  {
    h: "Shop & Build",
    items: [
      { label: "Store", to: "/store" },
      { label: "Super Mart", to: "/mart" },
      { label: "Interior BOQ", to: "/interior-boq" },
      { label: "Full Home BOQ", to: "/boq-builder" },
      { label: "Tenders", to: "/tenders" },
    ],
  },
  {
    h: "Platform",
    items: [
      { label: "Complete guide", to: "/platform" },
      { label: "How it works", to: "/how-it-works" },
      { label: "Consultants", to: "/consultants" },
      { label: "Sales MoM AI", to: "/sales-mom" },
      { label: "Solar", to: "/solar" },
      { label: "Services", to: "/services" },
      { label: "Pricing", to: "/pricing" },
      { label: "Become vendor", to: "/become-vendor" },
    ],
  },
  {
    h: "Company",
    items: [
      { label: "Contact", to: "/contact" },
      { label: "Enrollment", to: "/enroll" },
      { label: "Terms", to: "/terms" },
      { label: "Privacy", to: "/privacy" },
      { label: "Login / Join", to: "/login" },
      { label: "Owner console", to: "/sys/console" },
    ],
  },
];

export default function Footer() {
  const { brand_name, tagline, footer_text } = useBranding();
  return (
    <footer className="bg-card/50">
      <div className="mx-auto max-w-6xl px-4 md:px-8 py-14 md:py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <BrandLogo className="h-9 w-9" iconClass="h-5 w-5" />
            <span className="font-display font-extrabold text-lg tracking-tight">{brand_name}</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            {footer_text || tagline || "India's construction platform — materials, BOQ, tenders, solar, and consultants in one place."}
          </p>
          <div className="mt-5 space-y-1 text-sm text-muted-foreground">
            <a href="tel:+917007254932" data-testid="footer-phone" className="block hover:text-foreground transition-colors">+91 70072 54932</a>
            <a href="mailto:sales@2click.in" data-testid="footer-email" className="block hover:text-foreground transition-colors">sales@2click.in</a>
          </div>
        </div>
        {COLS.map((col) => (
          <div key={col.h}>
            <h4 className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground mb-4">{col.h}</h4>
            <ul className="space-y-2.5">
              {col.items.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-6xl px-4 md:px-8 py-6 border-t border-border/40 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} {brand_name}</span>
        <span>Made in India</span>
      </div>
    </footer>
  );
}
