import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import TrustBadges from "@/components/marketing/TrustBadges";
import PageSEO from "@/components/marketing/PageSEO";
import LeadCaptureForm from "@/components/marketing/LeadCaptureForm";
import WhatsAppShare from "@/components/marketing/WhatsAppShare";
import { Gavel, Store, Sun, Building2, Bot, ShieldCheck, ArrowRight, TrendingUp, Package, Users } from "lucide-react";

const HERO = "https://images.unsplash.com/photo-1527335988388-b40ee248d80c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBzaXRlJTIwY3JhbmUlMjBtb2Rlcm4lMjBhcmNoaXRlY3R1cmV8ZW58MHx8fHwxNzg2MDc3Mzc4fDA&ixlib=rb-4.1.0&q=85";

const MODULES = [
  { icon: Gavel, title: "Tender & Reverse Auction", desc: "Publish tenders, run live reverse auctions with auto-ranking and AI bid evaluation.", color: "text-tender", to: "/tenders" },
  { icon: Store, title: "B2B/B2C Marketplace", desc: "Multi-vendor procurement of steel, cement, solar & more with GST invoicing.", color: "text-primary", to: "/marketplace" },
  { icon: Sun, title: "Solar Energy Portal", desc: "Capacity & ROI calculators, subsidy estimation and instant quotations.", color: "text-solar", to: "/solar" },
  { icon: Building2, title: "Construction ERP", desc: "BOQ, DPR, labour, equipment and project scheduling in one workspace.", color: "text-primary", to: "/services" },
  { icon: Bot, title: "AI Platform", desc: "AI assistant, tender summarization, cost estimation & recommendations.", color: "text-tender", to: "/services" },
  { icon: ShieldCheck, title: "RBAC & Admin", desc: "Unlimited roles, granular permissions and enterprise audit logging.", color: "text-solar", to: "/pricing" },
];

const STATS = [
  { icon: TrendingUp, k: "₹2,400 Cr+", v: "Tender value processed" },
  { icon: Package, k: "48,000+", v: "SKUs in marketplace" },
  { icon: Users, k: "12,500+", v: "Verified vendors" },
];

export default function Home() {
  const waMsg = "नमस्ते 2click.in — मुझे construction platform के बारे में जानकारी चाहिए।";

  return (
    <div>
      <PageSEO
        title="2click.in — SaaS, ERP, Marketplace, Solar & Tender Bidding"
        description="India का Construction Super App — tender bidding, B2B marketplace, solar EPC calculator, construction ERP और SaaS billing एक ही login पर।"
        path="/"
      />
      <section className="relative border-b border-border overflow-hidden bg-gradient-to-b from-background to-secondary/30">
        <div className="mx-auto max-w-[1400px] grid lg:grid-cols-2">
          <div className="px-4 md:px-10 py-10 md:py-28 flex flex-col justify-center order-2 lg:order-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary border border-primary/25 bg-primary/5 px-3 py-1.5 rounded-full mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Enterprise Construction OS
              </span>
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.08]">
                Build. Bid. <span className="text-primary">Procure.</span><br />All in one platform.
              </h1>
              <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
                SaaS + ERP + Marketing + Solar + Tender Bidding + Marketplace — सब एक ही login पर।
                India की construction economy के लिए पूरा operating system।
              </p>
              <TrustBadges className="mt-6" />
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register"><Button data-testid="hero-cta" size="lg" className="btn-premium">मुफ़्त शुरू करें <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
                <Link to="/tenders"><Button data-testid="hero-tenders" size="lg" variant="outline" className="btn-premium">Live Tenders देखें</Button></Link>
                <WhatsAppShare message={waMsg} label="WhatsApp" size="lg" />
              </div>
            </motion.div>
          </div>
          <div className="relative min-h-[220px] sm:min-h-[320px] lg:min-h-0 order-1 lg:order-2">
            <img src={HERO} alt="Construction" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 grid grid-cols-3 gap-2 md:gap-3">
              {STATS.map((s) => (
                <div key={s.v} className="card-premium bg-background/95 backdrop-blur p-3 md:p-4">
                  <s.icon className="h-4 w-4 text-primary mb-2" strokeWidth={1.5} />
                  <div className="font-display font-extrabold text-base md:text-lg tracking-tight">{s.k}</div>
                  <div className="text-[10px] md:text-[11px] text-muted-foreground leading-tight">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 md:px-10 py-16 md:py-24">
        <div className="max-w-2xl mb-12">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">One platform. Eight verticals.</h2>
          <p className="mt-3 text-muted-foreground">Every workflow your construction business needs — modular, integrated, enterprise-grade.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {MODULES.map((m, i) => (
            <motion.div key={m.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link to={m.to} data-testid={`module-${i}`} className="group block card-premium p-6 md:p-8 h-full hover:bg-accent/30">
                <m.icon className={`h-8 w-8 ${m.color} mb-5`} strokeWidth={1.5} />
                <h3 className="font-display font-bold text-lg tracking-tight flex items-center gap-2">
                  {m.title}
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 md:px-10 py-16 md:py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-primary">Get started</span>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-3">आज ही शुरू करें</h2>
            <p className="mt-3 text-muted-foreground">Vendor हैं? <Link to="/become-vendor" className="text-primary font-medium hover:underline">अपनी दुकान online लगाएँ</Link>। Solar quote चाहिए? <Link to="/solar" className="text-primary font-medium hover:underline">Calculator खोलें</Link>।</p>
          </div>
          <LeadCaptureForm source="home" interest="general" compact />
        </div>
      </section>

      <section className="border-t border-border bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-20" />
        <div className="relative mx-auto max-w-[1400px] px-4 md:px-10 py-16 md:py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl tracking-tight max-w-xl">Ready to digitize your construction business?</h2>
            <p className="mt-4 text-slate-400 max-w-md">Join thousands of vendors, contractors and buyers already on 2click.in.</p>
          </div>
          <Link to="/register"><Button data-testid="cta-bottom" size="lg" className="btn-premium">Create your account <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>
      </section>
    </div>
  );
}
