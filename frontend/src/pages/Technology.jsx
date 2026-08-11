import { Link } from "react-router-dom";
import PageSEO from "@/components/marketing/PageSEO";
import { Button } from "@/components/ui/button";
import { useLang } from "@/context/LanguageContext";
import { SUPER_COPY } from "@/lib/superAppCopy";
import ModuleWorkflowBanner from "@/components/marketing/ModuleWorkflowBanner";
import { MODULE_SCREENS } from "@/lib/moduleUpgrades";
import { Scan, Box, Eye, ArrowRight, Map, Layers3 } from "lucide-react";

const MODULES = [
  {
    id: "lidar",
    icon: Scan,
    en: "LiDAR Survey",
    hi: "LiDAR सर्वे",
    descEn: "Mobile or tablet LiDAR scans room dimensions and existing structures — auto-scaled 2D floor plans ready for the 3D studio.",
    descHi: "मोबाइल/टैबलेट LiDAR से रूम और संरचना स्कैन — ऑटो-स्केल 2D फ्लोर प्लान, 3D स्टूडियो के लिए तैयार।",
    itemsEn: ["Site measurement", "Room scans", "Structure capture", "2D floor plan export"],
    itemsHi: ["साइट माप", "रूम स्कैन", "संरचना कैप्चर", "2D प्लान एक्सपोर्ट"],
    status: "integration",
    ctaTo: "/design",
    ctaEn: "Start site mapping",
    ctaHi: "साइट मैपिंग शुरू करें",
  },
  {
    id: "3d",
    icon: Box,
    en: "3D Models",
    hi: "3D मॉडल",
    descEn: "Convert 2D plans into interactive 3D architectural meshes with the AI 3D Home Studio workflow.",
    descHi: "2D प्लान को इंटरैक्टिव 3D आर्किटेक्चरल मॉडल में — AI 3D होम स्टूडियो।",
    itemsEn: ["3D house model", "Architectural walkthrough", "Layout zones"],
    itemsHi: ["3D घर मॉडल", "वास्तु वॉकथ्रू", "लेआउट ज़ोन"],
    status: "live",
    ctaTo: "/design",
    ctaEn: "Open 3D studio",
    ctaHi: "3D स्टूडियो खोलें",
  },
  {
    id: "vr",
    icon: Eye,
    en: "VR Preview",
    hi: "VR पूर्वावलोकन",
    descEn: "WebXR/VR virtual walkthroughs of proposed designs before construction begins.",
    descHi: "निर्माण से पहले WebXR/VR वर्चुअल वॉकथ्रू।",
    itemsEn: ["Virtual house tour", "Interior preview", "WebXR ready"],
    itemsHi: ["वर्चुअल घर टूर", "इंटीरियर पूर्वावलोकन", "WebXR तैयार"],
    status: "coming_soon",
    ctaTo: "/technology",
    ctaEn: "Preview coming soon",
    ctaHi: "पूर्वावलोकन जल्द",
  },
];

export default function Technology() {
  const { lang } = useLang();
  const hi = lang === "hi";
  const c = SUPER_COPY[lang] || SUPER_COPY.en;
  const screenMeta = MODULE_SCREENS.find((m) => m.id === "technology");

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-10 md:py-14">
      <PageSEO title="3D / VR / LiDAR — 2click.in" path="/technology" />
      <h1 className="font-display font-extrabold text-3xl tracking-tight">{c.techTitle}</h1>
      <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
        {hi
          ? "स्थानिक कैप्चर और इमर्सिव विज़ुअलाइज़ेशन — LiDAR स्कैन डेटा सीधे 3D स्टूडियो में लिंक।"
          : "Spatial capture and immersive visualization — LiDAR scan data links directly into the 3D studio engine."}
      </p>

      {screenMeta && (
        <div className="mt-8">
          <ModuleWorkflowBanner
            hi={hi}
            flowEn={screenMeta.flowEn}
            flowHi={screenMeta.flowHi}
            stepsEn={screenMeta.stepsEn}
            stepsHi={screenMeta.stepsHi}
          />
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {MODULES.map((m) => {
          const Icon = m.icon;
          const items = hi ? m.itemsHi : m.itemsEn;
          const isLive = m.status === "live";
          const isIntegration = m.status === "integration";
          return (
            <div key={m.id} className="glass-card rounded-2xl p-6 border border-border/60 flex flex-col">
              <Icon className="h-8 w-8 text-primary mb-4" strokeWidth={1.5} />
              <h2 className="font-display font-bold text-lg">{hi ? m.hi : m.en}</h2>
              <p className="text-sm text-muted-foreground mt-2">{hi ? m.descHi : m.descEn}</p>
              <ul className="mt-4 space-y-1 text-sm flex-1">
                {items.map((item) => (
                  <li key={item} className="text-muted-foreground">· {item}</li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {isLive && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {hi ? "लाइव" : "Live"}
                  </span>
                )}
                {isIntegration && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    {hi ? "API तैयार" : "API ready"}
                  </span>
                )}
                {m.status === "coming_soon" && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {c.comingSoon}
                  </span>
                )}
              </div>
              {m.status !== "coming_soon" && (
                <Link to={m.ctaTo} className="mt-4">
                  <Button variant="outline" size="sm" className="rounded-xl w-full">
                    {hi ? m.ctaHi : m.ctaEn}
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* WebGL 3D room customizer — advanced upgrade placeholder */}
      <section className="mt-12 glass-card rounded-2xl p-6 border border-dashed border-primary/30">
        <div className="flex items-start gap-4">
          <Layers3 className="h-8 w-8 text-primary shrink-0" strokeWidth={1.5} />
          <div className="flex-1">
            <h2 className="font-display font-bold text-lg">
              {hi ? "WebGL 3D रूम कस्टमाइज़र" : "WebGL 3D room customizer"}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {hi
                ? "ब्राउज़र में टाइल पैटर्न, पेंट रंग और फर्नीचर लेआउट बदलें — मटेरियल लागत लाइव अपडेट।"
                : "Swap tile patterns, wall paint, and furniture layouts in a real-time browser canvas — material costs recalculate as you design."}
            </p>
            <div className="mt-4 rounded-xl bg-muted/40 border border-border/60 h-32 flex items-center justify-center text-xs text-muted-foreground font-mono">
              {hi ? "WebGL / Canvas प्रीव्यू — जल्द" : "WebGL / Canvas preview — coming soon"}
            </div>
            <Link to="/design" className="inline-block mt-4">
              <Button variant="outline" size="sm" className="rounded-xl">
                {hi ? "डिज़ाइन टैब देखें" : "Explore Design tab"}
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/build">
          <Button className="rounded-xl">{c.ctaStartProject} <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </Link>
        <Link to="/design">
          <Button variant="outline" className="rounded-xl">
            <Map className="mr-2 h-4 w-4" />
            {hi ? "डिजिटल साइट-मैपिंग" : "Digital site-mapping"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
