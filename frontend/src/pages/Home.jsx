import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import TrustBadges from "@/components/marketing/TrustBadges";
import PageSEO from "@/components/marketing/PageSEO";
import LeadCaptureForm from "@/components/marketing/LeadCaptureForm";
import RegionalLanding from "@/components/marketing/RegionalLanding";
import WhatsAppShare from "@/components/marketing/WhatsAppShare";
import { Gavel, Store, Sun, Building2, Bot, ShieldCheck, ArrowRight, TrendingUp, Package, Users } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { HOME_COPY } from "@/lib/homeCopy";

const HERO = "https://images.unsplash.com/photo-1527335988388-b40ee248d80c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBzaXRlJTIwY3JhbmUlMjBtb2Rlcm4lMjBhcmNoaXRlY3R1cmV8ZW58MHx8fHwxNzg2MDc3Mzc4fDA&ixlib=rb-4.1.0&q=85";

const MODULE_ICONS = [Gavel, Store, Sun, Building2, Bot, ShieldCheck];
const MODULE_COLORS = ["text-tender", "text-primary", "text-solar", "text-primary", "text-tender", "text-solar"];
const MODULE_LINKS = ["/tenders", "/marketplace", "/solar", "/login", "/services", "/pricing"];

export default function Home() {
  const { lang } = useLang();
  const c = HOME_COPY[lang] || HOME_COPY.en;

  return (
    <div>
      <PageSEO title={c.seoTitle} description={c.seoDesc} path="/" />
      <section className="relative border-b border-border overflow-hidden bg-gradient-to-b from-background to-secondary/30">
        <div className="mx-auto max-w-[1400px] grid lg:grid-cols-2">
          <div className="px-4 md:px-10 py-10 md:py-28 flex flex-col justify-center order-2 lg:order-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary border border-primary/25 bg-primary/5 px-3 py-1.5 rounded-full mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {c.badge}
              </span>
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.08]">
                {c.heroTitle}<br /><span className="text-primary">{c.heroTitleAccent}</span>
              </h1>
              <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">{c.heroSub}</p>
              <TrustBadges className="mt-6" />
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register"><Button data-testid="hero-cta" size="lg" className="btn-premium">{c.ctaStart} <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
                <Link to="/tenders"><Button data-testid="hero-tenders" size="lg" variant="outline" className="btn-premium">{c.ctaTenders}</Button></Link>
                <WhatsAppShare message={c.waMsg} label={c.waLabel} size="lg" />
              </div>
            </motion.div>
          </div>
          <div className="relative min-h-[220px] sm:min-h-[320px] lg:min-h-0 order-1 lg:order-2">
            <img src={HERO} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 grid grid-cols-3 gap-2 md:gap-3">
              {c.stats.map((s, i) => {
                const Icon = [TrendingUp, Package, Users][i];
                return (
                  <div key={s.v} className="card-premium bg-background/95 backdrop-blur p-3 md:p-4">
                    <Icon className="h-4 w-4 text-primary mb-2" strokeWidth={1.5} />
                    <div className="font-display font-extrabold text-base md:text-lg tracking-tight">{s.k}</div>
                    <div className="text-[10px] md:text-[11px] text-muted-foreground leading-tight">{s.v}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <RegionalLanding />

      <section className="mx-auto max-w-[1400px] px-4 md:px-10 py-16 md:py-24">
        <div className="max-w-2xl mb-12">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight">{c.modulesTitle}</h2>
          <p className="mt-3 text-muted-foreground">{c.modulesSub}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {c.modules.map((m, i) => {
            const Icon = MODULE_ICONS[i];
            return (
              <motion.div key={m.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link to={MODULE_LINKS[i]} data-testid={`module-${i}`} className="group block card-premium p-6 md:p-8 h-full hover:bg-accent/30">
                  <Icon className={`h-8 w-8 ${MODULE_COLORS[i]} mb-5`} strokeWidth={1.5} />
                  <h3 className="font-display font-bold text-lg tracking-tight flex items-center gap-2">
                    {m.title}
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 md:px-10 py-16 md:py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-primary">{c.leadTag}</span>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-3">{c.leadTitle}</h2>
            <p className="mt-3 text-muted-foreground">
              {lang === "hi" ? (
                <>विक्रेता हैं? <Link to="/become-vendor" className="text-primary font-medium hover:underline">{c.leadVendor}</Link>। सोलर कोट चाहिए? <Link to="/solar" className="text-primary font-medium hover:underline">{c.leadSolar}</Link>।</>
              ) : (
                <>Are you a vendor? <Link to="/become-vendor" className="text-primary font-medium hover:underline">{c.leadVendor}</Link>. Need a solar quote? <Link to="/solar" className="text-primary font-medium hover:underline">{c.leadSolar}</Link>.</>
              )}
            </p>
          </div>
          <LeadCaptureForm source="home" interest="general" compact />
        </div>
      </section>

      <section className="border-t border-border bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-20" />
        <div className="relative mx-auto max-w-[1400px] px-4 md:px-10 py-16 md:py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl tracking-tight max-w-xl">{c.bottomTitle}</h2>
            <p className="mt-4 text-slate-400 max-w-md">{c.bottomSub}</p>
          </div>
          <Link to="/register"><Button data-testid="cta-bottom" size="lg" className="btn-premium">{c.bottomCta} <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>
      </section>
    </div>
  );
}
