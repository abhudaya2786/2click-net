import PageSEO from "@/components/marketing/PageSEO";
import Ai3dHomeStudio from "@/components/design/Ai3dHomeStudio";
import { useLang } from "@/context/LanguageContext";
import { SUPER_COPY } from "@/lib/superAppCopy";
import { Sparkles } from "lucide-react";

export default function DesignStudio() {
  const { lang } = useLang();
  const c = SUPER_COPY[lang] || SUPER_COPY.en;
  const hi = lang === "hi";

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-10 md:py-14">
      <PageSEO
        title={hi ? "AI 3D Home Studio — 2click.in" : "AI 3D Home Studio — 2click.in"}
        description={hi
          ? "4-चरण 3D जनरेशन पाइपलाइन, स्पेशियल लेआउट और AI डिज़ाइन टूल्स"
          : "4-step 3D generation pipeline, spatial layout and AI design tools"}
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
          ? "स्केल फार्मूला, 3-पॉइंट लाइटिंग, FOV कैमरा, ज़ोन लेआउट और Text-to-3D प्रॉम्प्ट — एक स्थान पर।"
          : "Scale formula, 3-point lighting, FOV camera, zone layout and text-to-3D prompts — all in one place."}
      </p>

      <div className="mt-10">
        <Ai3dHomeStudio />
      </div>
    </div>
  );
}
