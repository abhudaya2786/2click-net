import { useState } from "react";
import PageSEO from "@/components/marketing/PageSEO";
import Ai3dHomeStudio from "@/components/design/Ai3dHomeStudio";
import AiHomeStudio from "@/components/studio/AiHomeStudio";
import { useLang } from "@/context/LanguageContext";
import { SUPER_COPY } from "@/lib/superAppCopy";
import { Sparkles } from "lucide-react";
import ModuleWorkflowBanner from "@/components/marketing/ModuleWorkflowBanner";
import { CORE_PLATFORM_SCREENS } from "@/lib/platformScreenArchitecture";

export default function DesignStudio() {
  const { lang } = useLang();
  const c = SUPER_COPY[lang] || SUPER_COPY.en;
  const hi = lang === "hi";
  const screenMeta = CORE_PLATFORM_SCREENS.find((s) => s.id === "design");
  const [showAi3dStudio, setShowAi3dStudio] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8 py-10 md:py-14">
      <PageSEO
        title={hi ? "AI 3D Home Studio — buildecogroup.com" : "AI 3D Home Studio — buildecogroup.com"}
        description={hi
          ? "लोकेशन/GPS, 3D होम प्रीव्यू, 4-चरण जनरेशन पाइपलाइन और AI डिज़ाइन टूल्स"
          : "Location/GPS, 3D home preview, 4-step generation pipeline and AI design tools"}
        path="/design"
      />
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{c.nav.design}</p>
      </div>
      <h1 className="font-display font-extrabold text-3xl tracking-tight">
        {hi ? "AI 3D Home Studio" : "AI 3D Home Studio"}
      </h1>
      <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
        {hi
          ? "साइट लोकेशन, GPS पता, 3D होम प्रीव्यू, स्केल फार्मूला, ज़ोन लेआउट और Text-to-3D — एक ही स्टूडियो में।"
          : "Site location, GPS address, 3D home preview, scale formula, zone layout and text-to-3D — one studio."}
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

      <div className="mt-8">
        <button
          type="button"
          onClick={() => setShowAi3dStudio((open) => !open)}
          className="inline-flex items-center rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:border-primary"
        >
          {showAi3dStudio
            ? (hi ? "मौजूदा स्टूडियो दिखाएँ" : "Show existing studio")
            : (hi ? "Open AI 3D Studio" : "Open AI 3D Studio")}
        </button>
      </div>

      <div className="mt-10">
        {showAi3dStudio ? <AiHomeStudio /> : <Ai3dHomeStudio />}
      </div>
    </div>
  );
}
