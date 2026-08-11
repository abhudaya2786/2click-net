import { Link } from "react-router-dom";
import PageSEO from "@/components/marketing/PageSEO";
import { Button } from "@/components/ui/button";
import TrustStrip from "@/components/superapp/TrustStrip";
import ThemeSwitcher from "@/components/superapp/ThemeSwitcher";
import { useLang } from "@/context/LanguageContext";
import { SUPER_COPY } from "@/lib/superAppCopy";
import { ArrowRight } from "lucide-react";

export default function About() {
  const { lang } = useLang();
  const c = SUPER_COPY[lang] || SUPER_COPY.en;

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-10 md:py-14">
      <PageSEO title="About — 2click.in" path="/about" />
      <h1 className="font-display font-extrabold text-3xl tracking-tight">2click.in</h1>
      <p className="text-lg text-primary font-medium mt-2">{c.tagline}</p>
      <p className="text-muted-foreground mt-4 leading-relaxed">
        {lang === "hi"
          ? "2click.in भारत का प्रीमियम AI-संचालित निर्माण, इंटीरियर, सोलर, डिज़ाइन और प्रोजेक्ट प्रबंधन सुपर ऐप है। प्लॉट से हैंडओवर तक — एक प्लेटफ़ॉर्म, पूर्ण पारदर्शिता।"
          : "2click.in is India's premium AI-powered construction, interior, solar, design and project management super app. From plot to handover — one platform, full transparency."}
      </p>

      <section className="mt-12">
        <h2 className="font-display font-bold text-xl mb-4">{c.trustTitle}</h2>
        <TrustStrip />
      </section>

      <section className="mt-12">
        <h2 className="font-display font-bold text-xl mb-4">{lang === "hi" ? "UI थीम" : "UI themes"}</h2>
        <ThemeSwitcher />
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link to="/build">
          <Button className="rounded-xl">{c.ctaStartProject} <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </Link>
        <Link to="/contact">
          <Button variant="outline" className="rounded-xl">{lang === "hi" ? "संपर्क" : "Contact"}</Button>
        </Link>
      </div>
    </div>
  );
}
