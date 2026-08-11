import { useState } from "react";
import PageSEO from "@/components/marketing/PageSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/context/LanguageContext";
import { SUPER_COPY } from "@/lib/superAppCopy";
import { PenTool, Sofa, Palette, Layout, Sparkles } from "lucide-react";
import { toast } from "sonner";

const FEATURES = [
  { id: "floor", icon: Layout, en: "AI floor plan", hi: "AI फ़्लोर प्लान" },
  { id: "elevation", icon: PenTool, en: "AI elevation", hi: "AI एलिवेशन" },
  { id: "interior", icon: Sofa, en: "Interior concept", hi: "इंटीरियर कॉन्सेप्ट" },
  { id: "color", icon: Palette, en: "Colour suggestions", hi: "रंग सुझाव" },
];

export default function DesignStudio() {
  const { lang } = useLang();
  const c = SUPER_COPY[lang] || SUPER_COPY.en;
  const [room, setRoom] = useState("");
  const [style, setStyle] = useState("modern");

  const generate = () => {
    if (!room.trim()) {
      toast.error(lang === "hi" ? "कमरा/क्षेत्र बताएं" : "Describe your room or area");
      return;
    }
    toast.success(
      lang === "hi"
        ? "डिज़ाइन जनरेशन जल्द — API कनेक्ट होने पर सक्रिय होगा"
        : "Design generation coming soon — activates when AI design API is connected"
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-10 md:py-14">
      <PageSEO title="AI Design Studio — 2click.in" path="/design" />
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{c.nav.design}</p>
      </div>
      <h1 className="font-display font-extrabold text-3xl tracking-tight">
        {lang === "hi" ? "AI डिज़ाइन स्टूडियो" : "AI Design Studio"}
      </h1>
      <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
        {lang === "hi"
          ? "फ़्लोर प्लान, एलिवेशन, इंटीरियर कॉन्सेप्ट और सामग्री सुझाव — एक स्थान पर।"
          : "Floor plans, elevations, interior concepts and material suggestions in one place."}
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mt-8">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.id} className="glass-card rounded-2xl p-5 border border-border/60 flex gap-3">
              <Icon className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-sm">{lang === "hi" ? f.hi : f.en}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.comingSoon}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card rounded-2xl p-6 border border-border/60 mt-8 space-y-4">
        <Input
          placeholder={lang === "hi" ? "कमरा / क्षेत्र (जैसे 3BHK living)" : "Room / area (e.g. 3BHK living)"}
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="rounded-xl"
        />
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="h-10 w-full border rounded-xl px-3 text-sm"
        >
          <option value="modern">{lang === "hi" ? "आधुनिक" : "Modern"}</option>
          <option value="traditional">{lang === "hi" ? "पारंपरिक" : "Traditional"}</option>
          <option value="minimal">{lang === "hi" ? "मिनिमल" : "Minimal"}</option>
          <option value="luxury">{lang === "hi" ? "लक्ज़री" : "Luxury"}</option>
        </select>
        <Button className="w-full rounded-xl h-11" onClick={generate}>
          {lang === "hi" ? "डिज़ाइन जनरेट करें" : "Generate design"}
        </Button>
      </div>
    </div>
  );
}
