import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PageSEO from "@/components/marketing/PageSEO";
import SiteJsonLd from "@/components/marketing/SiteJsonLd";
import LeadCaptureForm from "@/components/marketing/LeadCaptureForm";
import UpcomingProjectsBlock from "@/components/marketing/UpcomingProjectsBlock";
import CatalogShowcase from "@/components/catalog/CatalogShowcase";
import ServiceGrid from "@/components/superapp/ServiceGrid";
import TrustStrip from "@/components/superapp/TrustStrip";
import {
  Gavel,
  Store,
  Sun,
  Building2,
  Bot,
  ShieldCheck,
  ArrowRight,
  Compass,
  Leaf,
  Headset,
} from "lucide-react";
import { useBranding } from "@/context/BrandingContext";
import { useLang } from "@/context/LanguageContext";
import { HOME_COPY } from "@/lib/homeCopy";
import { SUPER_COPY } from "@/lib/superAppCopy";

/** Modern biophilic tower — matches eco-corporate reference imagery */
const HERO =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80";

const MODULE_ICONS = [Gavel, Store, Sun, Building2, Bot, ShieldCheck];
const MODULE_LINKS = ["/tenders", "/store", "/solar", "/login", "/services", "/pricing"];

const CAPABILITIES = {
  en: [
    {
      icon: Compass,
      title: "Modular Homes",
      body: "Precision-engineered homes from land selection to handover.",
      to: "/build",
    },
    {
      icon: Leaf,
      title: "Green Building",
      body: "Sustainable materials, solar, and efficiency-led design.",
      to: "/services",
    },
    {
      icon: Headset,
      title: "Project Advisory",
      body: "Estimates, BOQ, professionals, and tracked delivery.",
      to: "/estimate",
    },
  ],
  hi: [
    {
      icon: Compass,
      title: "मॉड्यूलर होम",
      body: "ज़मीन से हैंडओवर तक सटीक इंजीनियरिंग वाले घर।",
      to: "/build",
    },
    {
      icon: Leaf,
      title: "ग्रीन बिल्डिंग",
      body: "सतत् सामग्री, सोलर और दक्षता-आधारित डिज़ाइन।",
      to: "/services",
    },
    {
      icon: Headset,
      title: "प्रोजेक्ट सलाह",
      body: "अनुमान, BOQ, पेशेवर और ट्रैक्ड डिलीवरी।",
      to: "/estimate",
    },
  ],
};

const STEPS = {
  en: [
    { n: "01", title: "Define the brief", body: "Home, commercial, solar, or interior scope." },
    { n: "02", title: "Plan & estimate", body: "BOQ, materials, and transparent budgeting." },
    { n: "03", title: "Build & deliver", body: "Professionals, store, and tracked milestones." },
  ],
  hi: [
    { n: "01", title: "ब्रीफ तय करें", body: "घर, कमर्शियल, सोलर या इंटीरियर स्कोप।" },
    { n: "02", title: "योजना और अनुमान", body: "BOQ, सामग्री और पारदर्शी बजट।" },
    { n: "03", title: "बनाएँ और डिलीवर करें", body: "पेशेवर, स्टोर और ट्रैक्ड माइलस्टोन।" },
  ],
};

export default function Home() {
  const { brand_name } = useBranding();
  const { lang } = useLang();
  const c = HOME_COPY[lang] || HOME_COPY.en;
  const sa = SUPER_COPY[lang] || SUPER_COPY.en;
  const steps = STEPS[lang] || STEPS.en;
  const capabilities = CAPABILITIES[lang] || CAPABILITIES.en;
  const brand = brand_name || "Build Eco Group";

  return (
    <div className="bg-background">
      <PageSEO
        title={c.seoTitle}
        description={c.seoDesc}
        path="/"
        keywords="sustainable construction, modular homes, green building, BOQ, solar, Build Eco Group, India"
      />
      <SiteJsonLd />

      {/* Full-bleed eco hero */}
      <section className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden">
        <img src={HERO} alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
        <div className="absolute inset-0 hero-gradient" aria-hidden />

        <div className="relative z-10 marketing-shell pb-16 pt-32 md:pb-24 md:pt-40 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <p className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.02] text-white text-balance">
              {brand}
            </p>
            <h1 className="mt-5 md:mt-6 font-display font-semibold text-2xl sm:text-3xl lg:text-[2.15rem] tracking-tight leading-[1.2] text-white/95 text-balance">
              {sa.heroTitle}
            </h1>
            <p className="mt-4 text-base md:text-lg text-white/70 leading-relaxed max-w-xl">{sa.heroSub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/upcoming-projects">
                <Button data-testid="hero-cta" size="lg" className="btn-premium btn-primary-eco h-12 px-6 uppercase text-xs font-semibold tracking-[0.08em]">
                  {lang === "hi" ? "पोर्टफोलियो देखें" : "View Portfolio"}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/services">
                <Button
                  data-testid="hero-estimate-cta"
                  size="lg"
                  variant="outline"
                  className="btn-premium h-12 px-6 border-2 border-white/80 bg-transparent text-white hover:bg-white/10 hover:text-white uppercase text-xs font-semibold tracking-[0.08em]"
                >
                  {lang === "hi" ? "हमारी सेवाएँ" : "Our Services"}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core capabilities */}
      <section className="border-b border-border bg-card">
        <div className="marketing-shell section-premium">
          <p className="section-label text-center">{lang === "hi" ? "क्षमताएँ" : "Core Capabilities"}</p>
          <h2 className="section-heading text-center mt-3">{sa.servicesTitle}</h2>
          <p className="section-sub text-center mx-auto">{sa.servicesSub}</p>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {capabilities.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={item.to}
                    className="group block h-full rounded-lg border border-border bg-card p-7 hover:border-primary/40 emerald-shadow transition-colors"
                  >
                    <div className="h-11 w-11 rounded bg-accent flex items-center justify-center mb-5">
                      <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-display font-semibold text-lg tracking-tight">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                      {lang === "hi" ? "और जानें" : "Learn more"}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Full platform services */}
      <section className="border-b border-border bg-background">
        <div className="marketing-shell section-premium">
          <p className="section-label">{lang === "hi" ? "प्लेटफ़ॉर्म" : "Platform"}</p>
          <h2 className="section-heading mt-3">{lang === "hi" ? "निर्माण के लिए सब कुछ" : "Everything to build with clarity"}</h2>
          <p className="section-sub">{sa.servicesSub}</p>
          <ServiceGrid className="mt-10" />
        </div>
      </section>

      {/* Process */}
      <section className="border-b border-border bg-muted/40">
        <div className="marketing-shell section-premium">
          <p className="section-label text-center">{lang === "hi" ? "प्रक्रिया" : "Process"}</p>
          <h2 className="section-heading text-center mt-3">{sa.quickStartTitle}</h2>
          <p className="section-sub text-center mx-auto">{sa.quickStartSub}</p>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
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
                <h3 className="mt-2 font-display font-semibold text-lg tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Platform pillars */}
      <section className="border-b border-border bg-card">
        <div className="marketing-shell section-premium">
          <p className="section-label">{lang === "hi" ? "स्तंभ" : "Pillars"}</p>
          <h2 className="section-heading mt-3">{c.modulesTitle}</h2>
          <p className="section-sub">{c.modulesSub}</p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {c.modules.map((m, i) => {
              const Icon = MODULE_ICONS[i];
              return (
                <Link
                  key={m.title}
                  to={MODULE_LINKS[i]}
                  data-testid={`module-${i}`}
                  className="group block rounded-lg border border-border bg-background p-6 hover:border-primary/35 transition-colors"
                >
                  <Icon className="h-5 w-5 text-primary mb-4" strokeWidth={1.5} />
                  <h3 className="font-display font-semibold text-base tracking-tight flex items-center gap-2">
                    {m.title}
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="marketing-shell py-16 md:py-20 border-b border-border">
        <UpcomingProjectsBlock compact limit={6} />
      </section>

      <CatalogShowcase variant="compact" />

      {/* Trust */}
      <section className="border-y border-border bg-background">
        <div className="marketing-shell section-premium">
          <p className="section-label">{lang === "hi" ? "विश्वास" : "Trust"}</p>
          <h2 className="section-heading mt-3">{sa.trustTitle}</h2>
          <TrustStrip className="mt-8" />
        </div>
      </section>

      {/* Lead capture — emerald modular block */}
      <section className="border-b border-border bg-[hsl(var(--emerald-light))]">
        <div className="marketing-shell py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="section-label">{c.leadTag}</p>
              <h2 className="section-heading mt-3">{c.leadTitle}</h2>
              <p className="section-sub mt-3">
                {lang === "hi" ? (
                  <>
                    विक्रेता हैं?{" "}
                    <Link to="/become-vendor" className="text-primary font-semibold hover:underline">
                      {c.leadVendor}
                    </Link>
                  </>
                ) : (
                  <>
                    Are you a vendor?{" "}
                    <Link to="/become-vendor" className="text-primary font-semibold hover:underline">
                      {c.leadVendor}
                    </Link>
                  </>
                )}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 md:p-8 emerald-shadow">
              <LeadCaptureForm source="home" interest="general" compact />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[hsl(var(--slate-deep))] text-white">
        <div className="marketing-shell py-16 md:py-24 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight max-w-xl text-balance">
              {lang === "hi" ? "अगले लैंडमार्क के लिए तैयार?" : "Ready for your next landmark?"}
            </h2>
            <p className="mt-4 text-white/60 max-w-md leading-relaxed">{c.bottomSub}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact">
              <Button data-testid="cta-bottom" size="lg" className="btn-premium btn-primary-eco h-12 px-6 uppercase text-xs font-semibold tracking-[0.08em]">
                Enquire Now <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/register">
              <Button
                size="lg"
                variant="outline"
                className="btn-premium h-12 px-6 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white uppercase text-xs font-semibold tracking-[0.08em]"
              >
                {c.bottomCta}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
