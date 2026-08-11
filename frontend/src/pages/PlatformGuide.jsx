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
import { ArrowRight, ExternalLink } from "lucide-react";

export default function PlatformGuide() {
  const { lang } = useLang();
  const hi = lang === "hi";

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-10 md:py-14">
      <PageSEO
        title="Platform architecture — 2click.in"
        description="Screen-by-screen functional map: Explore menu, enrollment, vendor onboarding, equipment rental, talent network."
        path="/platform"
      />
      <h1 className="font-display font-extrabold text-3xl tracking-tight">
        {hi ? "प्लेटफ़ॉर्म आर्किटेक्चर" : "Platform architecture"}
      </h1>
      <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
        {hi
          ? "स्क्रीन-दर-स्क्रीन और क्लिक-दर-क्लिक फ़ंक्शनल मैपिंग — सभी मुख्य मॉड्यूल।"
          : "Screen-by-screen and click-by-click functional mapping for all major modules."}
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
