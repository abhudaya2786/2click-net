import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Gavel, Store, Sun, Building2, Bot, Truck, Boxes, Calculator, ArrowUpRight, Clock } from "lucide-react";

const SERVICES = [
  { icon: Gavel, t: "Tender Management", d: "End-to-end tendering with document management, EMD tracking, approval workflows and AI-powered tender summaries.", to: "/tenders", cta: "Explore tenders" },
  { icon: Building2, t: "Construction ERP", d: "BOQ calculators, Daily Progress Reports, labour & equipment management, project scheduling and cost control.", to: "/dashboard", cta: "Open workspace" },
  { icon: Store, t: "B2B/B2C Marketplace", d: "Multi-vendor marketplace for building materials with inventory, cart, checkout and order tracking.", to: "/marketplace", cta: "Browse materials" },
  { icon: Sun, t: "Solar Energy", d: "Capacity sizing, ROI & subsidy estimation, quotation generation and solar project lifecycle management.", to: "/solar", cta: "Estimate savings" },
  { icon: Calculator, t: "GST & Accounting", d: "GST-compliant invoicing, tax reports, e-way bills and financial dashboards for every transaction.", to: "/contact", soon: true },
  { icon: Truck, t: "Logistics & Fleet", d: "Fleet booking, freight calculators, driver management and delivery tracking for heavy materials.", to: "/contact", soon: true },
  { icon: Boxes, t: "Inventory Management", d: "SKU, warehouse, stock alerts, barcode/QR and supplier management across locations.", to: "/dashboard", cta: "Manage stock" },
  { icon: Bot, t: "AI Platform", d: "AI assistant, OCR, cost estimation, image analysis and a smart recommendation engine.", action: "ai", cta: "Ask 2click AI" },
];

export default function Services() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const openAI = () => {
    if (!user) { navigate("/login"); return; }
    window.dispatchEvent(new Event("open-ai-assistant"));
  };

  const Inner = ({ s }) => (
    <>
      <div className="flex items-start justify-between mb-5">
        <s.icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
        {s.soon
          ? <span className="text-[10px] font-mono uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 inline-flex items-center gap-1"><Clock className="h-3 w-3" />Soon</span>
          : <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />}
      </div>
      <h3 className="font-display font-bold text-lg tracking-tight">{s.t}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">{s.d}</p>
      <span className="mt-6 text-sm font-medium text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
        {s.soon ? "Join the waitlist" : s.cta} <ArrowUpRight className="h-4 w-4" />
      </span>
    </>
  );

  const cls = "group relative bg-card p-8 hover:bg-accent/40 transition-colors flex flex-col text-left";

  return (
    <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-16 md:py-24">
      <div className="max-w-2xl mb-14">
        <span className="text-xs font-mono uppercase tracking-widest text-primary">Capabilities</span>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight mt-3">Everything the construction industry runs on.</h1>
        <p className="mt-4 text-muted-foreground">A modular suite covering procurement, projects, finance, energy and intelligence. Tap any capability to jump straight in.</p>
      </div>
      <div className="grid gap-px bg-border border border-border md:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((s, i) =>
          s.action === "ai" ? (
            <button key={i} data-testid={`service-${i}`} onClick={openAI} className={cls}>
              <Inner s={s} />
            </button>
          ) : (
            <Link key={i} to={s.to} data-testid={`service-${i}`} className={cls}>
              <Inner s={s} />
            </Link>
          )
        )}
      </div>
    </div>
  );
}
