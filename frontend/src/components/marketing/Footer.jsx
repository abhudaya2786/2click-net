import { Link } from "react-router-dom";
import { HardHat } from "lucide-react";

const COLS = [
  { h: "Platform", items: ["Marketplace", "Tender Hub", "Reverse Auction", "Solar Portal", "Construction ERP"] },
  { h: "Company", items: ["About", "Careers", "Press", "Partners", "Contact"] },
  { h: "Resources", items: ["Documentation", "API", "Blog", "Support", "Status"] },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-16 grid gap-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-9 w-9 bg-primary flex items-center justify-center">
              <HardHat className="h-5 w-5 text-white" strokeWidth={1.75} />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight">2click.in</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            The enterprise operating system for construction — tenders, marketplace, ERP, solar and AI in one platform.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.h}>
            <h4 className="font-display font-bold text-sm mb-4">{c.h}</h4>
            <ul className="space-y-2.5">
              {c.items.map((i) => (
                <li key={i}><Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">{i}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted-foreground">
          <span>© 2026 2click.in Technologies Pvt Ltd. All rights reserved.</span>
          <span className="font-mono">Made in India · GST Ready · ISO 27001</span>
        </div>
      </div>
    </footer>
  );
}
