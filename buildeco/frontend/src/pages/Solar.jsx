import { useState } from "react";
import { Sun, MapPin } from "lucide-react";
import SolarEstimator from "@/components/solar/SolarEstimator";
import PageSEO from "@/components/marketing/PageSEO";
import LeadCaptureForm from "@/components/marketing/LeadCaptureForm";
import WhatsAppShare from "@/components/marketing/WhatsAppShare";
import ModuleWorkflowBanner from "@/components/marketing/ModuleWorkflowBanner";
import { useLang } from "@/context/LanguageContext";
import { MODULE_SCREENS, buildSolarWhatsAppMessage } from "@/lib/moduleUpgrades";

const SOLAR_IMG = "https://images.unsplash.com/photo-1726554068139-d3669703634a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwyfHxzb2xhciUyMHBhbmVscyUyMGRyb25lJTIwdmlldyUyMGdyZWVuJTIwZW5lcmd5fGVufDB8fHx8MTc4NjA3NzM3OHww&ixlib=rb-4.1.0&q=85";

export default function Solar() {
  const { lang } = useLang();
  const hi = lang === "hi";
  const screenMeta = MODULE_SCREENS.find((m) => m.id === "solar");
  const [estimate, setEstimate] = useState(null);
  const waMsg = buildSolarWhatsAppMessage(estimate, hi);

  return (
    <div>
      <PageSEO
        title="Solar EPC Calculator — Subsidy, EMI & DPR India"
        description="Rooftop solar capacity calculator, PM Surya Ghar subsidy, EMI financing, 25-year ROI model और bank-ready DPR — buildecogroup.com Solar Portal।"
        path="/solar"
      />
      <section className="relative border-b border-border">
        <img src={SOLAR_IMG} alt="Solar" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/65" />
        <div className="relative mx-auto max-w-[1400px] px-5 md:px-10 py-20 text-white">
          <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-solar border border-solar/40 px-3 py-1.5 mb-5">
            <Sun className="h-3.5 w-3.5" /> Solar EPC Engine
          </span>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight max-w-2xl leading-tight">
            {hi ? "पूर्ण सोलर EPC — साइज़िंग, BOQ, सब्सिडी और लोन एक साथ।" : "Full solar EPC — sizing, BOQ, subsidy & loan in one shot."}
          </h1>
          <p className="mt-4 text-slate-300 max-w-xl">
            {hi
              ? "इंजीनियरिंग अनुमान: प्लांट साइज़, BOQ, PM Surya Ghar सब्सिडी, EMI, 25-वर्ष मॉडल और बैंक-तैयार DPR।"
              : "Get a complete engineering estimate: system sizing, a tiered Bill of Quantities, PM Surya Ghar subsidy, EMI financing, 25-year generation model and a bank-ready DPR."}
          </p>
          <div className="mt-6">
            <WhatsAppShare
              message={waMsg}
              label={hi ? "Solar quote WhatsApp पर माँगें" : "Get solar quote on WhatsApp"}
              variant="default"
              className="bg-solar hover:bg-solar/90 text-white border-0"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-10">
        {screenMeta && (
          <ModuleWorkflowBanner
            hi={hi}
            flowEn={screenMeta.flowEn}
            flowHi={screenMeta.flowHi}
            stepsEn={screenMeta.stepsEn}
            stepsHi={screenMeta.stepsHi}
          />
        )}

        {/* Satellite rooftop mapping — advanced upgrade placeholder */}
        <div className="rounded-2xl border border-dashed border-solar/40 bg-solar/5 p-5 mb-10" data-testid="solar-satellite-placeholder">
          <div className="flex items-start gap-3">
            <MapPin className="h-6 w-6 text-solar shrink-0" />
            <div>
              <h2 className="font-display font-bold text-base">
                {hi ? "उपग्रह सोलर रूफटॉप मैपिंग" : "Satellite solar rooftop mapping"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {hi
                  ? "पता टाइप करें या मैप पर पिन — छत क्षेत्र, ढलान और छाया ऑटो-डिटेक्ट (Google Solar API — जल्द)।"
                  : "Type your address or drop a pin — auto-detect rooftop area, pitch, and shadow obstruction (Google Solar API — coming soon)."}
              </p>
              <div className="mt-3 rounded-xl bg-muted/50 border border-border h-24 flex items-center justify-center text-xs text-muted-foreground font-mono">
                {hi ? "सैटेलाइट प्रीव्यू — जल्द उपलब्ध" : "Satellite preview — coming soon"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 md:px-10 pb-14 grid lg:grid-cols-[1fr_340px] gap-10">
        <SolarEstimator onEstimate={setEstimate} />
        <div className="lg:sticky lg:top-24 h-fit space-y-6">
          <WhatsAppShare
            message={waMsg}
            label={hi ? "WhatsApp पर कोट भेजें" : "Send quote on WhatsApp"}
            variant="outline"
            className="w-full justify-center"
          />
          <LeadCaptureForm
            source="solar"
            interest="solar"
            title={hi ? "Solar expert से बात करें" : "Talk to a solar expert"}
            subtitle={hi ? "Calculator के बाद भी सवाल हैं? हमारी टीम मदद करेगी।" : "Questions after the calculator? Our team can help."}
          />
        </div>
      </section>
    </div>
  );
}
