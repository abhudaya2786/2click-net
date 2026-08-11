import { useParams } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import PageSEO from "@/components/marketing/PageSEO";
import InteriorBOQHub from "@/components/dashboard/InteriorBOQHub";
import VerticalCategoryCalculator from "@/components/dashboard/VerticalCategoryCalculator";
import { useLang } from "@/context/LanguageContext";

export default function InteriorBOQ() {
  const { verticalId } = useParams();
  const { lang } = useLang();
  const hi = lang === "hi";

  const isHub = !verticalId || verticalId === "all";

  return (
    <MarketingLayout>
      <PageSEO
        title={hi ? "इंटीरियर BOQ कैलकुलेटर" : "Interior BOQ Calculator"}
        description={hi ? "श्रेणी-वार ब्रांड कैलकुलेटर" : "Category-wise brand calculators"}
        path={isHub ? "/interior-boq" : `/interior-boq/${verticalId}`}
      />
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-10">
        {isHub ? (
          <>
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-primary">
                {hi ? "BOQ + प्राइसिंग" : "BOQ + Pricing"}
              </span>
              <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">
                {hi ? "श्रेणी-वार BOQ कैलकुलेटर" : "Category-wise BOQ calculators"}
              </h1>
              <p className="mt-3 text-muted-foreground text-sm">
                {hi
                  ? "हर विकल्प का अपना कैलकुलेटर — इंटीरियर, वास्तु, फैब्रिकेशन, टाइल्स, फॉल्स सीलिंग, PVC, रेनोवेशन, गार्डनिंग। ब्रांड compare करके BOQ बनाएँ।"
                  : "Each option has its own calculator — interior, vastu, fabrication, tiles, false ceiling, PVC, renovation, gardening. Compare brands and build BOQ."}
              </p>
            </div>
            <InteriorBOQHub />
          </>
        ) : (
          <VerticalCategoryCalculator verticalId={verticalId} />
        )}
      </div>
    </MarketingLayout>
  );
}
