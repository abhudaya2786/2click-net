import { Link } from "react-router-dom";
import PageSEO from "@/components/marketing/PageSEO";
import { useLang } from "@/context/LanguageContext";
import {
  EXPLORE_MENU,
  EXPLORE_EXTENDED,
  ENROLLMENT_FLOW,
  VENDOR_ONBOARDING_STEPS,
  EQUIPMENT_MODULES,
  FREELANCER_MODULE,
} from "@/lib/exploreNavMap";
import { MODULE_SCREENS, ADVANCED_UPGRADES } from "@/lib/moduleUpgrades";
import {
  CORE_PLATFORM_SCREENS,
  ECOSYSTEM_ADVANCED_FEATURES,
} from "@/lib/platformScreenArchitecture";
import EndToEndWorkflowDiagram from "@/components/marketing/EndToEndWorkflowDiagram";
import PlatformCompleteReference from "@/components/marketing/PlatformCompleteReference";
import { ArrowRight, ExternalLink, Sparkles, Layers, BookOpen } from "lucide-react";

export default function PlatformGuide() {
  const { lang } = useLang();
  const hi = lang === "hi";

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-10 md:py-14">
      <PageSEO
        title="Complete 2click.in guide — functions, options & work types"
        description="Full platform reference: every module, click workflow, user roles, BOQ, store, solar, tenders, enrollment."
        path="/platform"
      />
      <div className="flex items-start gap-3">
        <BookOpen className="h-8 w-8 text-primary shrink-0 mt-1" />
        <div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight">
            {hi ? "2click.in — पूर्ण कार्य गाइड" : "2click.in — complete working guide"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            {hi
              ? "सभी फ़ंक्शन, विकल्प, प्रकार की कार्य और क्लिक-दर-क्लिक वर्कफ़्लो — एक स्थान पर।"
              : "All functions, options, types of work, and click-by-click workflows — in one place."}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <PlatformCompleteReference />
      </div>

      <hr className="my-14 border-border/60" />

      <h2 className="font-display font-bold text-xl mb-2">
        {hi ? "तकनीकी आर्किटेक्चर (विस्तृत)" : "Technical architecture (detailed)"}
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        {hi ? "डेवलपर और ऑपरेटर के लिए स्क्रीन-दर-स्क्रीन मैप।" : "Screen-by-screen map for developers and operators."}
      </p>

      {/* 1. Explore menu */}
      <section className="mt-12">
        <h2 className="font-display font-bold text-xl mb-4">
          {hi ? "1. Explore ड्रॉपडाउन (मास्टर रouting)" : "1. Explore dropdown (master routing)"}
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">{hi ? "विकल्प" : "Option"}</th>
                <th className="text-left p-3">{hi ? "क्लिक एक्शन" : "Click action"}</th>
                <th className="text-left p-3">{hi ? "लॉजिक" : "Logic"}</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {EXPLORE_MENU.map((item) => (
                <tr key={item.id} className="border-t border-border/40">
                  <td className="p-3 font-medium">{hi ? item.labelHi : item.label}</td>
                  <td className="p-3 text-muted-foreground">{hi ? item.actionHi : item.actionEn}</td>
                  <td className="p-3 text-muted-foreground text-xs">{hi ? item.logicHi : item.logicEn}</td>
                  <td className="p-3">
                    <Link to={item.to} className="text-primary text-xs hover:underline inline-flex items-center gap-1">
                      Open <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Enrollment */}
      <section className="mt-12 glass-card rounded-2xl p-6 border border-border/60">
        <h2 className="font-display font-bold text-xl mb-4">
          {hi ? "2. ऑनबोर्डिंग विज़ार्ड (/enroll)" : "2. Onboarding wizard (/enroll)"}
        </h2>
        <p className="text-sm text-muted-foreground mb-4 font-mono">
          Step 1 → Step 2 → Step 3 → Step 4 → Dashboard
        </p>
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          {ENROLLMENT_FLOW.modes.map((m) => (
            <div key={m.id} className="rounded-xl border border-border/60 p-4">
              <p className="font-medium text-sm">{hi ? m.hi : m.en}</p>
              <p className="text-xs text-muted-foreground mt-1">{hi ? m.descHi : m.descEn}</p>
            </div>
          ))}
        </div>
        <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
          {(hi ? ENROLLMENT_FLOW.stepsHi : ENROLLMENT_FLOW.stepsEn).map((s) => <li key={s}>{s}</li>)}
        </ol>
        <Link to="/enroll" className="inline-flex items-center gap-1 text-primary text-sm mt-4 hover:underline">
          {hi ? "पंजीकरण शुरू करें" : "Start enrollment"} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* 3. Vendor onboarding */}
      <section className="mt-12 glass-card rounded-2xl p-6 border border-border/60">
        <h2 className="font-display font-bold text-xl mb-4">
          {hi ? "3. विक्रेता ऑनबोर्डिंग (/become-vendor)" : "3. Vendor onboarding (/become-vendor)"}
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {VENDOR_ONBOARDING_STEPS.map((s, i) => (
            <span key={s.en} className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/30">
              {i + 1}. {hi ? s.hi : s.en}
            </span>
          ))}
        </div>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• {hi ? "दुकान पंजीकरण → /enroll?mode=shop" : "Shop registration → /enroll?mode=shop"}</li>
          <li>• {hi ? "Vendor पंजीकरण → /enroll?mode=vendor" : "Vendor registration → /enroll?mode=vendor"}</li>
          <li>• {hi ? "WhatsApp सपोर्ट + कॉलबैक CRM फॉर्म" : "WhatsApp support + callback CRM form"}</li>
        </ul>
        <Link to="/become-vendor" className="inline-flex items-center gap-1 text-primary text-sm mt-4 hover:underline">
          {hi ? "विक्रेता पोर्टल" : "Vendor portal"} <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </section>

      {/* 4. Equipment rental */}
      <section className="mt-12 glass-card rounded-2xl p-6 border border-border/60">
        <h2 className="font-display font-bold text-xl mb-4">
          {hi ? "4. उपकरण रेंटल (/equipment-rental)" : "4. Equipment rental (/equipment-rental)"}
        </h2>
        <p className="text-sm text-muted-foreground mb-2">
          Tabs: {EQUIPMENT_MODULES.tabs.map((t) => hi ? t.hi : t.en).join(" · ")}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          {hi ? "श्रेणी फ़िल्टर, राज्य/शहर, कार्ड → बुक/पूछताछ मोडल → ऑपरेटर अलर्ट" : "Category filters, state/city, card → book/enquire modal → operator alert"}
        </p>
        <Link to="/equipment-rental" className="text-primary text-sm hover:underline inline-flex items-center gap-1">
          {hi ? "रेंटल मॉड्यूल" : "Rental module"} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* 5. Freelancers */}
      <section className="mt-12 glass-card rounded-2xl p-6 border border-border/60">
        <h2 className="font-display font-bold text-xl mb-4">
          {hi ? "5. टैलेंट नेटवर्क (/freelancers)" : "5. Talent network (/freelancers)"}
        </h2>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• {hi ? "खोज: नाम, स्किल, शहर" : "Search: name, skill, city"}</li>
          <li>• <Link to="/client-agreement" className="text-primary hover:underline">Client agreement</Link> · <Link to="/freelancer-agreement" className="text-primary hover:underline">Freelancer agreement</Link></li>
          <li>• {hi ? "प्रोफ़ाइल कार्ड → Contact / Send enquiry" : "Profile cards → Contact / Send enquiry"}</li>
          <li>• {hi ? FREELANCER_MODULE.emptyHi : FREELANCER_MODULE.emptyEn}</li>
        </ul>
        <Link to="/freelancers" className="inline-flex items-center gap-1 text-primary text-sm mt-4 hover:underline">
          {hi ? "फ्रीलांसर निर्देशिका" : "Freelancer directory"} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* 6. Core platform journey — 7 screens */}
      <section className="mt-12">
        <h2 className="font-display font-bold text-xl mb-2 flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          {hi ? "6. मुख्य प्लेटफ़ॉर्म यात्रा — 7 स्क्रीन" : "6. Core platform journey — 7 screens"}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {hi
            ? "2-क्लिक बिल्डर से स्टोर चेकआउट तक — विकल्प-दर-विकल्प विश्लेषण और बैकएंड लॉजिक।"
            : "From 2-click builder to store checkout — option-by-option analysis and backend logic."}
        </p>
        <div className="space-y-5">
          {CORE_PLATFORM_SCREENS.map((s) => (
            <div key={s.id} className="glass-card rounded-2xl p-5 border border-border/60">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">
                    Screen {s.screen}
                  </span>
                  <h3 className="font-display font-bold text-base mt-0.5">
                    {hi ? s.titleHi : s.titleEn}
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground mt-1">{s.path}</p>
                </div>
                <Link to={s.path} className="text-primary text-xs hover:underline inline-flex items-center gap-1 shrink-0">
                  {hi ? "खोलें" : "Open"} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-sm font-medium">{hi ? s.headlineHi : s.headlineEn}</p>
              <p className="text-xs text-muted-foreground mt-2">{hi ? s.visualsHi : s.visualsEn}</p>
              <p className="text-sm font-medium mt-3">{hi ? s.flowHi : s.flowEn}</p>
              <ol className="mt-2 space-y-1 text-xs text-muted-foreground list-decimal list-inside">
                {(hi ? s.stepsHi : s.stepsEn).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="text-xs mt-3 px-3 py-2 rounded-lg bg-muted/40 border border-border/40">
                <span className="font-mono uppercase text-[10px] text-primary">{hi ? "बैकएंड" : "Backend"}: </span>
                {hi ? s.backendHi : s.backendEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. End-to-end workflow */}
      <section className="mt-12 glass-card rounded-2xl p-6 border border-border/60">
        <h2 className="font-display font-bold text-xl mb-4">
          {hi ? "7. एंड-टू-एंड सिस्टम वर्कफ़्लो" : "7. End-to-end system workflow"}
        </h2>
        <EndToEndWorkflowDiagram />
      </section>

      {/* 8. Ecosystem advanced features */}
      <section className="mt-12">
        <h2 className="font-display font-bold text-xl mb-2">
          {hi ? "8. इकोसिस्टम उन्नत फ़ीचर" : "8. Ecosystem advanced features"}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {hi
            ? "पूर्ण निर्माण इकोसिस्टम विस्तार — Vision AI, AR, लाइव टिकर, WhatsApp बॉट, Escrow, IoT/ड्रोन।"
            : "Complete construction ecosystem expansion — Vision AI, AR, live ticker, WhatsApp bot, escrow, IoT/drone."}
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {ECOSYSTEM_ADVANCED_FEATURES.map((u) => (
            <div key={u.id} className="rounded-2xl border border-border/60 p-5 bg-muted/10">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-bold text-sm">{hi ? u.titleHi : u.titleEn}</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                  {hi ? "जल्द" : "Soon"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{hi ? u.descHi : u.descEn}</p>
              <Link to={u.route} className="text-primary text-xs mt-3 inline-flex items-center gap-1 hover:underline">
                {hi ? "संबंधित मॉड्यूल" : "Related module"} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Specialized module screens */}
      <section className="mt-12">
        <h2 className="font-display font-bold text-xl mb-2 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {hi ? "9. विशेष मॉड्यूल स्क्रीन" : "9. Specialized module screens"}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {hi
            ? "प्रॉपर्टी सलाह, इंटीरियर BOQ, पूरा घर BOQ, टेक्नोलॉजी और सोलर।"
            : "Property advisory, interior BOQ, full home BOQ, technology suite, and solar EPC."}
        </p>
        <div className="space-y-4">
          {MODULE_SCREENS.map((m) => (
            <div key={m.id} className="glass-card rounded-2xl p-5 border border-border/60">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-display font-bold text-base">{hi ? m.titleHi : m.titleEn}</h3>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{m.path}</p>
                </div>
                <Link to={m.path} className="text-primary text-xs hover:underline inline-flex items-center gap-1 shrink-0">
                  {hi ? "खोलें" : "Open"} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-sm font-medium">{hi ? m.flowHi : m.flowEn}</p>
              <ol className="mt-3 space-y-1 text-xs text-muted-foreground list-decimal list-inside">
                {(hi ? m.stepsHi : m.stepsEn).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Platform upgrade roadmap */}
      <section className="mt-12">
        <h2 className="font-display font-bold text-xl mb-2">
          {hi ? "10. प्लेटफ़ॉर्म अपग्रेड रोडमैप" : "10. Platform upgrade roadmap"}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {hi
            ? "अतिरिक्त नियोजित क्षमताएँ — WebGL, ERP सिंक, सैटेलाइट सोलर।"
            : "Additional planned capabilities — WebGL, ERP sync, satellite solar."}
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {ADVANCED_UPGRADES.map((u) => (
            <div key={u.id} className="rounded-2xl border border-border/60 p-5 bg-muted/10">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-bold text-sm">{hi ? u.titleHi : u.titleEn}</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                  {hi ? "जल्द" : "Soon"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{hi ? u.descHi : u.descEn}</p>
              <Link to={u.route} className="text-primary text-xs mt-3 inline-flex items-center gap-1 hover:underline">
                {hi ? "संबंधित मॉड्यूल" : "Related module"} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Extended links */}
      <section className="mt-12">
        <h2 className="font-display font-bold text-lg mb-3">{hi ? "अतिरिक्त लिंक" : "Extended links"}</h2>
        <div className="flex flex-wrap gap-2">
          {EXPLORE_EXTENDED.map((item) => (
            <Link key={item.to} to={item.to} className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/40 hover:text-primary transition-colors">
              {hi ? item.labelHi || item.label : item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
