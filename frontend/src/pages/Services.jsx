import { Gavel, Store, Sun, Building2, Bot, Truck, Boxes, Calculator } from "lucide-react";

const SERVICES = [
  { icon: Gavel, t: "Tender Management", d: "End-to-end tendering with document management, EMD tracking, approval workflows and AI-powered tender summaries." },
  { icon: Building2, t: "Construction ERP", d: "BOQ calculators, Daily Progress Reports, labour & equipment management, project scheduling and cost control." },
  { icon: Store, t: "B2B/B2C Marketplace", d: "Multi-vendor marketplace for building materials with inventory, cart, checkout and order tracking." },
  { icon: Sun, t: "Solar Energy", d: "Capacity sizing, ROI & subsidy estimation, quotation generation and solar project lifecycle management." },
  { icon: Calculator, t: "GST & Accounting", d: "GST-compliant invoicing, tax reports, e-way bills and financial dashboards for every transaction." },
  { icon: Truck, t: "Logistics & Fleet", d: "Fleet booking, freight calculators, driver management and delivery tracking for heavy materials." },
  { icon: Boxes, t: "Inventory Management", d: "SKU, warehouse, stock alerts, barcode/QR and supplier management across locations." },
  { icon: Bot, t: "AI Platform", d: "AI assistant, OCR, cost estimation, image analysis and a smart recommendation engine." },
];

export default function Services() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-16 md:py-24">
      <div className="max-w-2xl mb-14">
        <span className="text-xs font-mono uppercase tracking-widest text-primary">Capabilities</span>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight mt-3">Everything the construction industry runs on.</h1>
        <p className="mt-4 text-muted-foreground">A modular suite covering procurement, projects, finance, energy and intelligence.</p>
      </div>
      <div className="grid gap-px bg-border border border-border md:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((s, i) => (
          <div key={i} data-testid={`service-${i}`} className="bg-card p-8 hover:bg-accent/40 transition-colors">
            <s.icon className="h-8 w-8 text-primary mb-5" strokeWidth={1.5} />
            <h3 className="font-display font-bold text-lg tracking-tight">{s.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
