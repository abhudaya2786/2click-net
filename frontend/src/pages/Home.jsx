import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import TrustBadges from "@/components/marketing/TrustBadges";
import PageSEO from "@/components/marketing/PageSEO";
import SiteJsonLd from "@/components/marketing/SiteJsonLd";
import LeadCaptureForm from "@/components/marketing/LeadCaptureForm";
import RegionalLanding from "@/components/marketing/RegionalLanding";
import UpcomingProjectsBlock from "@/components/marketing/UpcomingProjectsBlock";
import PlatformToolsGrid from "@/components/marketing/PlatformToolsGrid";
import CatalogShowcase from "@/components/catalog/CatalogShowcase";
import { Gavel, Store, Sun, Building2, Bot, ShieldCheck, ArrowRight, TrendingUp, Package, Users } from "lucide-react";
import { useBranding } from "@/context/BrandingContext";
import { useLang } from "@/context/LanguageContext";
import { HOME_COPY } from "@/lib/homeCopy";
import { useDemoMode } from "@/context/DemoModeContext";

const HERO = "https://images.unsplash.com/photo-1527335988388-b40ee248d80c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBzaXRlJTIwY3JhbmUlMjBtb2Rlcm4lMjBhcmNoaXRlY3R1cmV8ZW58MHx8fHwxNzg2MDc3Mzc4fDA&ixlib=rb-4.1.0&q=85";

const MODULE_ICONS = [Gavel, Store, Sun, Building2, Bot, ShieldCheck];
const MODULE_COLORS = ["text-tender", "text-primary", "text-solar", "text-primary", "text-tender", "text-solar"];
const MODULE_LINKS = ["/tenders", "/store", "/solar", "/login", "/services", "/pricing"];

export default function Home() {
  const { hero_layout } = useBranding();
  const { lang } = useLang();
  const c = HOME_COPY[lang] || HOME_COPY.en;
  const centered = hero_layout === "centered";
  const { openPanel } = useDemoMode();

  return (
    <div>
      <PageSEO
        title={c.seoTitle}
        description={c.seoDesc}
        path="/"
        keywords="construction materials, BOQ calculator, tender, solar, interior BOQ, enrollment, brand store, India"
      />
      <SiteJsonLd />

      {/* Hero — calm, single focus */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background pointer-events-none" />
        <div className={`relative mx-auto max-w-6xl ${centered ? "px-4 md:px-8 py-16 md:py-24 text-center" : "grid lg:grid-cols-2 px-4 md:px-8"}`}>
          <div className={`py-12 md:py-20 flex flex-col justify-center ${centered ? "max-w-3xl mx-auto" : "order-2 lg:order-1 lg:pr-8"}`}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground mb-5">
                {c.badge}
              </p>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[3.25rem] tracking-tight leading-[1.08] text-balance">
                {c.heroTitle}
                <span className="text-primary"> {c.heroTitleAccent}</span>
              </h1>
              <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">{c.heroSub}</p>
              <TrustBadges className="mt-6" />
              <div className={`mt-8 flex flex-wrap gap-3 ${centered ? "justify-center" : ""}`}>
                <Link to="/register"><Button data-testid="hero-cta" size="lg" className="btn-premium">{c.ctaStart} <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
                <Button data-testid="hero-demo-cta" size="lg" variant="secondary" className="btn-premium" onClick={openPanel}>
                  {lang === "hi" ? "डेमो देखें" : "Try demo"}
                </Button>
                <Link to="/tenders"><Button data-testid="hero-tenders" size="lg" variant="outline" className="btn-premium">{c.ctaTenders}</Button></Link>
                <WhatsAppShare message={c.waMsg} label={c.waLabel} size="lg" />
              </div>
              <TrustBadges className="mt-8 opacity-90" />
            </motion.div>
          </div>
          {!centered && (
            <div className="relative min-h-[280px] lg:min-h-0 order-1 lg:order-2 rounded-2xl overflow-hidden my-6 lg:my-12 lg:ml-4">
              <img src={HERO} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 grid grid-cols-3 gap-3">
                {c.stats.map((s, i) => {
                  const Icon = [TrendingUp, Package, Users][i];
                  return (
                    <div key={s.v} className="rounded-xl bg-background/95 backdrop-blur px-3 py-3 border border-border/50">
                      <Icon className="h-4 w-4 text-primary mb-1.5" strokeWidth={1.5} />
                      <div className="font-display font-bold text-sm tracking-tight">{s.k}</div>
                      <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{s.v}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Regional — compact */}
      <RegionalLanding compact />

      <section className="mx-auto max-w-[1400px] px-4 md:px-10 py-16 md:py-20 border-b border-border bg-gradient-to-b from-background to-secondary/10">
        <UpcomingProjectsBlock compact limit={6} />
      </section>

      <CatalogShowcase variant="full" />

      {/* Core modules — 6 cards, not 13+ tool grid */}
      <section className="section-premium mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-12 md:mb-16">
          <h2 className="section-heading">{c.modulesTitle}</h2>
          <p className="section-sub">{c.modulesSub}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {c.modules.map((m, i) => {
            const Icon = MODULE_ICONS[i];
            return (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={MODULE_LINKS[i]}
                  data-testid={`module-${i}`}
                  className="group block h-full rounded-2xl border border-border/70 bg-card p-6 md:p-7 hover:border-primary/30 hover:shadow-md transition-all duration-300"
                >
                  <Icon className={`h-7 w-7 ${MODULE_COLORS[i]} mb-4`} strokeWidth={1.5} />
                  <h3 className="font-display font-bold text-lg tracking-tight flex items-center gap-2">
                    {m.title}
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/services"
            className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            {lang === "hi" ? "सभी सेवाएँ देखें" : "View all capabilities"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Lead capture — minimal */}
      <section className="border-t border-border/40 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{c.leadTag}</span>
              <h2 className="section-heading mt-3">{c.leadTitle}</h2>
              <p className="section-sub mt-3">
                {lang === "hi" ? (
                  <>
                    विक्रेता हैं?{" "}
                    <Link to="/become-vendor" className="text-primary font-medium hover:underline">{c.leadVendor}</Link>
                  </>
                ) : (
                  <>
                    Are you a vendor?{" "}
                    <Link to="/become-vendor" className="text-primary font-medium hover:underline">{c.leadVendor}</Link>
                  </>
                )}
              </p>
            </div>
            <LeadCaptureForm source="home" interest="general" compact />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-border/40 bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-16 md:py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight max-w-xl text-balance">
              {c.bottomTitle}
            </h2>
            <p className="mt-4 text-background/60 max-w-md leading-relaxed">{c.bottomSub}</p>
          </div>
          <Link to="/login">
            <Button
              data-testid="cta-bottom"
              size="lg"
              variant="secondary"
              className="btn-premium rounded-xl h-12 px-6 bg-background text-foreground hover:bg-background/90"
            >
              {c.bottomCta} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
