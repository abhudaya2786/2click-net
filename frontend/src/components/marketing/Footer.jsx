import { Link } from "react-router-dom";
import { useBranding } from "@/context/BrandingContext";
import BrandLogo from "@/components/marketing/BrandLogo";

const COLS = [
  {
    h: "Platform",
    items: [
      { label: "Marketplace", to: "/marketplace" },
      { label: "Tender Hub", to: "/tenders" },
      { label: "Solar Portal", to: "/solar" },
      { label: "Super Mart", to: "/mart" },
      { label: "Interior BOQ", to: "/interior-boq" },
      { label: "Become Vendor", to: "/become-vendor" },
    ],
  },
  {
    h: "People & Services",
    items: [
      { label: "Consultants", to: "/consultants" },
      { label: "Freelancers", to: "/freelancers" },
      { label: "Enrollment", to: "/enroll" },
      { label: "Services", to: "/services" },
      { label: "Pricing", to: "/pricing" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    h: "Legal",
    items: [
      { label: "Terms of Service", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Client Agreement", to: "/client-agreement" },
      { label: "Freelancer Agreement", to: "/freelancer-agreement" },
    ],
  },
  {
    h: "Account",
    items: [
      { label: "Log in", to: "/login" },
      { label: "Register", to: "/register" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Download App", to: "/download-app" },
    ],
  },
];

export default function Footer() {
  const { brand_name, tagline, footer_text } = useBranding();
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <BrandLogo className="h-9 w-9" iconClass="h-5 w-5" />
            <span className="font-display font-extrabold text-lg tracking-tight">{brand_name}</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            {footer_text || tagline || "SaaS + ERP + Marketplace + Solar + Tender Bidding — India's construction super-app, ek hi login par."}
          </p>
          <div className="mt-5 space-y-1.5 text-sm">
            <a href="tel:+917007254932" data-testid="footer-phone" className="block text-muted-foreground hover:text-primary transition-colors">+91 70072 54932</a>
            <a href="mailto:sales@2click.in" data-testid="footer-email" className="block text-muted-foreground hover:text-primary transition-colors">sales@2click.in</a>
          </div>
          <div className="mt-4 space-y-1 text-xs text-muted-foreground" data-testid="footer-offices">
            <div><span className="text-foreground font-medium">Head Office:</span> Gorakhpur, UP</div>
            <div><span className="text-foreground font-medium">Corporate Office:</span> Gurugram, Haryana</div>
            <div><span className="text-foreground font-medium">Branch Office:</span> Vapi, Gujarat</div>
          </div>
        </div>
        {COLS.map((c) => (
          <div key={c.h}>
            <h4 className="font-display font-bold text-sm mb-4">{c.h}</h4>
            <ul className="space-y-2.5">
              {c.items.map((i) => (
                <li key={i.label}>
                  <Link to={i.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">{i.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted-foreground">
          <span>© 2026 2click.in Technologies Pvt Ltd · Head Office: Gorakhpur, UP</span>
          <span className="font-mono">Made in India · GST Ready · ISO 27001</span>
        </div>
      </div>
    </footer>
  );
}
