import { Link } from "react-router-dom";
import PageSEO from "@/components/marketing/PageSEO";
import { Button } from "@/components/ui/button";
import { useLang } from "@/context/LanguageContext";
import { SUPER_COPY } from "@/lib/superAppCopy";
import { Scan, Box, Eye, ArrowRight } from "lucide-react";

const MODULES = [
  {
    id: "lidar",
    icon: Scan,
    en: "LiDAR Survey",
    hi: "LiDAR सर्वे",
    descEn: "Site measurement, room scans and existing structure capture — ready for device API integration.",
    descHi: "साइट माप, रूम स्कैन और मौजूदा संरचना — डिवाइस API के लिए तैयार।",
    itemsEn: ["Site measurement", "Room measurement", "Structure scan"],
    itemsHi: ["साइट माप", "रूम माप", "संरचना स्कैन"],
  },
  {
    id: "3d",
    icon: Box,
    en: "3D Models",
    hi: "3D मॉडल",
    descEn: "3D house models and architectural walkthroughs.",
    descHi: "3D घर मॉडल और वास्तु वॉकथ्रू।",
    itemsEn: ["3D house model", "Walkthrough"],
    itemsHi: ["3D घर मॉडल", "वॉकथ्रू"],
  },
  {
    id: "vr",
    icon: Eye,
    en: "VR Preview",
    hi: "VR पूर्वावलोकन",
    descEn: "Virtual house tours and interior previews before you build.",
    descHi: "निर्माण से पहले वर्चुअल घर टूर और इंटीरियर पूर्वावलोकन।",
    itemsEn: ["Virtual house tour", "Interior preview"],
    itemsHi: ["वर्चुअल घर टूर", "इंटीरियर पूर्वावलोकन"],
  },
];

export default function Technology() {
  const { lang } = useLang();
  const c = SUPER_COPY[lang] || SUPER_COPY.en;

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-10 md:py-14">
      <PageSEO title="3D / VR / LiDAR — 2click.in" path="/technology" />
      <h1 className="font-display font-extrabold text-3xl tracking-tight">{c.techTitle}</h1>
      <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
        {lang === "hi"
          ? "मॉड्यूल API और डिवाइस कनेक्शन के लिए तैयार — जल्द पूर्ण एकीकरण।"
          : "Modules are ready for API and device integration — full integration coming soon."}
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-10">
        {MODULES.map((m) => {
          const Icon = m.icon;
          const items = lang === "hi" ? m.itemsHi : m.itemsEn;
          return (
            <div key={m.id} className="glass-card rounded-2xl p-6 border border-border/60">
              <Icon className="h-8 w-8 text-primary mb-4" strokeWidth={1.5} />
              <h2 className="font-display font-bold text-lg">{lang === "hi" ? m.hi : m.en}</h2>
              <p className="text-sm text-muted-foreground mt-2">{lang === "hi" ? m.descHi : m.descEn}</p>
              <ul className="mt-4 space-y-1 text-sm">
                {items.map((item) => (
                  <li key={item} className="text-muted-foreground">· {item}</li>
                ))}
              </ul>
              <span className="inline-block mt-4 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {c.comingSoon}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/build">
          <Button className="rounded-xl">{c.ctaStartProject} <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </Link>
        <Link to="/design">
          <Button variant="outline" className="rounded-xl">{c.nav.design}</Button>
        </Link>
      </div>
    </div>
  );
}
