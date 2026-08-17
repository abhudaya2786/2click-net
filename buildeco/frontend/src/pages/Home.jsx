import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PageSEO from "@/components/marketing/PageSEO";
import SiteJsonLd from "@/components/marketing/SiteJsonLd";
import LeadCaptureForm from "@/components/marketing/LeadCaptureForm";
import RegionalLanding from "@/components/marketing/RegionalLanding";
import UpcomingProjectsBlock from "@/components/marketing/UpcomingProjectsBlock";
import CatalogShowcase from "@/components/catalog/CatalogShowcase";
import ServiceGrid from "@/components/superapp/ServiceGrid";
import TrustStrip from "@/components/superapp/TrustStrip";
import { Gavel, Store, Sun, Building2, Bot, ShieldCheck, ArrowRight } from "lucide-react";
import { useBranding } from "@/context/BrandingContext";
import { useLang } from "@/context/LanguageContext";
import { HOME_COPY } from "@/lib/homeCopy";
import { SUPER_COPY } from "@/lib/superAppCopy";
import { useDemoMode } from "@/context/DemoModeContext";

const HERO =
  "https://images.unsplash.com/photo-1527335988388-b40ee248d80c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBzaXRlJTIwY3JhbmUlMjBtb2Rlcm4lMjBhcmNoaXRlY3R1cmV8ZW58MHx8fHwxNzg2MDc3Mzc4fDA&ixlib=rb-4.1.0&q=85";

const MODULE_ICONS = [Gavel, Store, Sun, Building2, Bot, ShieldCheck];
const MODULE_COLORS = ["text-tender", "text-primary", "text-solar", "text-primary", "text-tender", "text-solar"];
const MODULE_LINKS = ["/tenders", "/store", "/solar", "/login", "/services", "/pricing"];

const STEPS = {
  en: [
    { n: "01", title: "Choose what to build", body: "Home, interior, solar, or commercial scope." },
    { n: "02", title: "Get estimate & plan", body: "BOQ, materials, and AI project outline." },
    { n: "03", title: "Track & deliver", body: "Professionals, store, tenders — one login." },
  ],
  hi: [
    { n: "01", title: "क्या बनाना है चुनें", body: "घर, इंटीरियर, सोलर या कमर्शियल स्कोप।" },
    { n: "02", title: "अनुमान और योजना लें", body: "BOQ, सामग्री और AI प्रोजेक्ट आउटलाइन।" },
    { n: "03", title: "ट्रैक कर के पूरा करें", body: "पेशेवर, स्टोर, टेंडर — एक लॉगिन।" },
  ],
};

export default function Home() {
  const { brand_name, hero_layout } = useBranding();
  const { lang } = useLang();
  const c = HOME_COPY[lang] || HOME_COPY.en;
  const sa = SUPER_COPY[lang] || SUPER_COPY.en;
  const centered = hero_layout === "centered";
  const { openPanel } = useDemoMode();
  const steps = STEPS[lang] || STEPS.en;
  const brand = brand_name || "BuildEco Group";

  return (
    <div className="bg-background">
      <PageSEO
        title={c.seoTitle}
        description={c.seoDesc}
        path="/"
        keywords="construction materials, BOQ calculator, tender, solar, interior BOQ, enrollment, brand store, India"
      />
      <SiteJsonLd />

      {/* Full-bleed hero — brand + one headline + one sub + CTA + image */}
      <section className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden">
        <img
          src={HERO}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 hero-gradient" aria-hidden />
        <div className="absolute inset-0 noise-overlay opacity-40 pointer-events-none" aria-hidden />

        <div
          className={`relative z-10 marketing-shell pb-16 pt-32 md:pb-24 md:pt-40 ${
            centered ? "text-center mx-auto" : ""
          } ${centered ? "max-w-3xl" : "max-w-3xl"}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[0.98] text-white text-balance">
              {brand}
            </p>
            <h1 className="mt-5 md:mt-6 font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-[1.15] text-white/95 text-balance">
              {sa.heroTitle}
            </h1>
            <p
              className={`mt-4 text-base md:text-lg text-white/70 leading-relaxed ${
                centered ? "mx-auto max-w-xl" : "max-w-lg"
              }`}
            >
              {sa.heroSub}
            </p>
            <div className={`mt-8 flex flex-wrap gap-3 ${centered ? "justify-center" : ""}`}>
              <Link to="/build">
                <Button data-testid="hero-cta" size="lg" className="btn-premium h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90">
                  {sa.ctaStartProject} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/estimate">
                <Button
                  data-testid="hero-estimate-cta"
                  size="lg"
                  variant="secondary"
                  className="btn-premium h-12 px-6 bg-white text-foreground hover:bg-white/90"
                >
                  {sa.ctaFreeEstimate}
                </Button>
              </Link>
              <Button
                data-testid="hero-demo-cta"
                size="lg"
                variant="outline"
                className="btn-premium h-12 px-6 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={openPanel}
              >
                {lang === "hi" ? "डेमो देखें" : "Try demo"}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services — one job */}
      <section className="border-b border-border bg-background">
        <div className="marketing-shell section-premium">
          <h2 className="section-heading">{sa.servicesTitle}</h2>
          <p className="section-sub">{sa.servicesSub}</p>
          <ServiceGrid className="mt-10" />
        </div>
      </section>

      {/* How it works — three clear steps */}
      <section className="border-b border-border bg-muted/30">
        <div className="marketing-shell section-premium">
          <h2 className="section-heading">{sa.quickStartTitle}</h2>
          <p className="section-sub">{sa.quickStartSub}</p>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.li
                key={step.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className="border-t-2 border-primary pt-5"
              >
                <span className="font-mono text-xs text-muted-foreground tracking-wider">{step.n}</span>
                <h3 className="mt-2 font-display font-bold text-lg tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Regional */}
      <RegionalLanding compact />

      {/* Platform pillars */}
      <section className="border-y border-border bg-background">
        <div className="marketing-shell section-premium">
          <h2 className="section-heading">{c.modulesTitle}</h2>
          <p className="section-sub">{c.modulesSub}</p>
          <div className="mt-10 grid gap-0 md:grid-cols-2 lg:grid-cols-3 border-t border-border">
            {c.modules.map((m, i) => {
              const Icon = MODULE_ICONS[i];
              return (
                <motion.div
                  key={m.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={MODULE_LINKS[i]}
                    data-testid={`module-${i}`}
                    className="group block h-full border-b border-border md:border-r p-6 md:p-8 hover:bg-muted/40 transition-colors"
                  >
                    <Icon className={`h-6 w-6 ${MODULE_COLORS[i]} mb-4`} strokeWidth={1.5} />
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
          <div className="mt-8 flex flex-wrap gap-6">
            <Link to="/tenders" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
              {c.ctaTenders} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/services" className="text-sm font-medium text-muted-foreground hover:text-primary hover:underline inline-flex items-center gap-1">
              {lang === "hi" ? "सभी सेवाएँ देखें" : "View all capabilities"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/platform" className="text-sm font-medium text-muted-foreground hover:text-primary hover:underline inline-flex items-center gap-1">
              {c.quickGuide}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="marketing-shell py-14 md:py-16 border-b border-border">
        <UpcomingProjectsBlock compact limit={6} />
      </section>

      <CatalogShowcase variant="compact" />

      {/* Trust */}
      <section className="border-y border-border bg-muted/20">
        <div className="marketing-shell section-premium">
          <h2 className="section-heading">{sa.trustTitle}</h2>
          <TrustStrip className="mt-8" />
        </div>
      </section>

      {/* Lead capture */}
      <section className="border-b border-border bg-background">
        <div className="marketing-shell py-14 md:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">{c.leadTag}</span>
              <h2 className="section-heading mt-3">{c.leadTitle}</h2>
              <p className="section-sub mt-3">
                {lang === "hi" ? (
                  <>
                    विक्रेता हैं?{" "}
                    <Link to="/become-vendor" className="text-primary font-medium hover:underline">
                      {c.leadVendor}
                    </Link>
                  </>
                ) : (
                  <>
                    Are you a vendor?{" "}
                    <Link to="/become-vendor" className="text-primary font-medium hover:underline">
                      {c.leadVendor}
                    </Link>
                  </>
                )}
              </p>
            </div>
            <LeadCaptureForm source="home" interest="general" compact />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-foreground text-background">
        <div className="marketing-shell py-14 md:py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight max-w-xl text-balance">
              {c.bottomTitle}
            </h2>
            <p className="mt-4 text-background/60 max-w-md leading-relaxed">{c.bottomSub}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/login">
              <Button
                data-testid="cta-bottom"
                size="lg"
                variant="secondary"
                className="btn-premium h-12 px-6 bg-background text-foreground hover:bg-background/90"
              >
                {lang === "hi" ? "लॉग इन" : "Log in"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" className="btn-premium h-12 px-6">
                {c.bottomCta} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
