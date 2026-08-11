import MarketingLayout from "@/components/marketing/MarketingLayout";
import PageSEO from "@/components/marketing/PageSEO";
import InteriorBOQCalculator from "@/components/dashboard/InteriorBOQCalculator";
import { useLang } from "@/context/LanguageContext";

export default function InteriorBOQ() {
  const { lang } = useLang();
  const hi = lang === "hi";

  return (
    <MarketingLayout>
      <PageSEO
        title={hi ? "इंटीरियर BOQ कैलकुलेटर" : "Interior BOQ Calculator"}
        description={hi ? "टाइल्स, फॉल्स सीलिंग, PVC, रेनोवेशन, गार्डनिंग — ब्रांड-वार BOQ" : "Tiles, false ceiling, PVC, renovation, gardening — brand-wise BOQ"}
        path="/interior-boq"
      />
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-10">
        <div className="max-w-3xl mb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-primary">
            {hi ? "BOQ + प्राइसिंग" : "BOQ + Pricing"}
          </span>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">
            {hi ? "इंटीरियर और फिनिशिंग BOQ" : "Interior & finishing BOQ"}
          </h1>
          <p className="mt-3 text-muted-foreground text-sm">
            {hi
              ? "8 अलग कॉलम: इंटीरियर डेकोरेशन, वास्तु, फैब्रिकेशन, टाइल्स, फॉल्स सीलिंग, PVC, रेनोवेशन, गार्डनिंग — ब्रांड-वार दर से BOQ बनाएँ।"
              : "8 separate columns: interior decoration, vastu, fabrication, tiles, false ceiling, PVC work, renovation, gardening — build BOQ with brand-wise rates."}
          </p>
        </div>
        <InteriorBOQCalculator />
      </div>
    </MarketingLayout>
  );
}
