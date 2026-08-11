import { Link } from "react-router-dom";
import PageSEO from "@/components/marketing/PageSEO";
import { useLang } from "@/context/LanguageContext";
import { SUPER_COPY } from "@/lib/superAppCopy";
import { Users, HardHat, PenTool, Sofa, Sun, Store, ArrowRight } from "lucide-react";
import ModuleWorkflowBanner from "@/components/marketing/ModuleWorkflowBanner";
import { CORE_PLATFORM_SCREENS } from "@/lib/platformScreenArchitecture";

const PORTALS = [
  { to: "/consultants", icon: PenTool, en: "Architects & engineers", hi: "वास्तुकार और इंजीनियर", roleEn: "Receive design leads", roleHi: "डिज़ाइन लीड प्राप्त करें" },
  { to: "/freelancers", icon: HardHat, en: "Contractors & labour", hi: "ठेकेदार और श्रम", roleEn: "Manage projects & quotes", roleHi: "प्रोजेक्ट और कोटेशन" },
  { to: "/freelancers", icon: Sofa, en: "Interior designers", hi: "इंटीरियर डिज़ाइनर", roleEn: "Interior project leads", roleHi: "इंटीरियर लीड" },
  { to: "/solar", icon: Sun, en: "Solar providers", hi: "सोलर प्रदाता", roleEn: "Installation leads", roleHi: "इंस्टॉलेशन लीड" },
  { to: "/become-vendor", icon: Store, en: "Material vendors", hi: "सामग्री विक्रेता", roleEn: "Orders & quotations", roleHi: "ऑर्डर और कोटेशन" },
  { to: "/enroll", icon: Users, en: "Join as professional", hi: "पेशेवर पंजीकरण", roleEn: "Enrollment & verification", roleHi: "पंजीकरण और सत्यापन" },
];

export default function ProfessionalsHub() {
  const { lang } = useLang();
  const c = SUPER_COPY[lang] || SUPER_COPY.en;
  const hi = lang === "hi";
  const screenMeta = CORE_PLATFORM_SCREENS.find((s) => s.id === "professionals");

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-10 md:py-14">
      <PageSEO title="Professionals — 2click.in" path="/professionals" />
      <h1 className="font-display font-extrabold text-3xl tracking-tight">{c.nav.professionals}</h1>
      <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
        {lang === "hi"
          ? "ग्राहक और पेशेवर पोर्टल — सत्यापित प्रोफ़ाइल, रेटिंग और कोटेशन।"
          : "Customer and professional portals — verified profiles, ratings and quotations."}
      </p>

      {screenMeta && (
        <div className="mt-6">
          <ModuleWorkflowBanner
            hi={hi}
            flowEn={screenMeta.flowEn}
            flowHi={screenMeta.flowHi}
            stepsEn={screenMeta.stepsEn}
            stepsHi={screenMeta.stepsHi}
          />
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        {PORTALS.map((p) => {
          const Icon = p.icon;
          return (
            <Link
              key={p.en}
              to={p.to}
              className="glass-card group rounded-2xl p-6 border border-border/60 hover:border-primary/35 transition-all flex gap-4"
            >
              <Icon className="h-6 w-6 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold">{lang === "hi" ? p.hi : p.en}</p>
                <p className="text-sm text-muted-foreground mt-1">{lang === "hi" ? p.roleHi : p.roleEn}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
