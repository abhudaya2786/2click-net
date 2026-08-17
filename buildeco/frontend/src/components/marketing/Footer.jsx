import { Link } from "react-router-dom";
import { useBranding } from "@/context/BrandingContext";
import BrandLogo from "@/components/marketing/BrandLogo";

const COLS = [
  {
    h: "Services",
    items: [
      { label: "Modular Homes", to: "/build" },
      { label: "Green Building", to: "/services" },
      { label: "Solar", to: "/solar" },
      { label: "Design Studio", to: "/design" },
      { label: "Estimate", to: "/estimate" },
    ],
  },
  {
    h: "Corporate",
    items: [
      { label: "About Us", to: "/about" },
      { label: "Portfolio", to: "/upcoming-projects" },
      { label: "Platform guide", to: "/platform" },
      { label: "Become vendor", to: "/become-vendor" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    h: "Legal",
    items: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Client Agreement", to: "/client-agreement" },
      { label: "Login / Join", to: "/login" },
    ],
  },
];

export default function Footer() {
  const { brand_name, tagline, footer_text } = useBranding();
  return (
    <footer className="bg-[hsl(var(--slate-deep))] text-white">
      <div className="marketing-shell py-14 md:py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <BrandLogo className="h-9 w-9 rounded" iconClass="h-5 w-5" />
            <span className="font-display font-bold text-lg tracking-tight">{brand_name || "Build Eco Group"}</span>
          </div>
          <p className="text-sm text-white/65 max-w-sm leading-relaxed">
            {footer_text ||
              tagline ||
              "Sustainable Engineering Excellence — modular construction, green building, and precision delivery."}
          </p>
          <div className="mt-5 space-y-1 text-sm text-white/65">
            <a href="tel:+917007254932" data-testid="footer-phone" className="block hover:text-white transition-colors">
              +91 70072 54932
            </a>
            <a
              href="mailto:sales@buildecogroup.com"
              data-testid="footer-email"
              className="block hover:text-white transition-colors"
            >
              sales@buildecogroup.com
            </a>
          </div>
        </div>
        {COLS.map((col) => (
          <div key={col.h}>
            <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50 mb-4">{col.h}</h4>
            <ul className="space-y-2.5">
              {col.items.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm text-white/70 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="marketing-shell py-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/45">
        <span>
          © {new Date().getFullYear()} {brand_name || "Build Eco Group"}
        </span>
        <span>Designed for a sustainable future</span>
      </div>
    </footer>
  );
}
