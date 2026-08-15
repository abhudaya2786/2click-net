import { useParams } from "react-router-dom";
import PageSEO from "@/components/marketing/PageSEO";
import InteriorBOQHub from "@/components/dashboard/InteriorBOQHub";
import VerticalCategoryCalculator from "@/components/dashboard/VerticalCategoryCalculator";
import { useLang } from "@/context/LanguageContext";
import ModuleWorkflowBanner from "@/components/marketing/ModuleWorkflowBanner";
import { MODULE_SCREENS } from "@/lib/moduleUpgrades";

export default function InteriorBOQ() {
  const { verticalId } = useParams();
  const { lang } = useLang();
  const hi = lang === "hi";

  const isHub = !verticalId || verticalId === "all";
  const screenMeta = MODULE_SCREENS.find((m) => m.id === "interior-boq");

  return (
    <>
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
                  ? "फोटो कैटलॉग, ब्रांड-वार अनुमानित कीमत — इंटीरियर, वास्तु, फैब्रिकेशन (गेट, रेलिंग, ग्रिल, शेड…), टाइल्स, PVC, रेनोवेशन।"
                  : "Photo catalogs with brand-wise prices — interior, vastu, fabrication (gates, railings, grills, sheds…), tiles, PVC, renovation."}
              </p>
            </div>
            {screenMeta && (
              <ModuleWorkflowBanner
                hi={hi}
                flowEn={screenMeta.flowEn}
                flowHi={screenMeta.flowHi}
                stepsEn={screenMeta.stepsEn}
                stepsHi={screenMeta.stepsHi}
              />
            )}
            <InteriorBOQHub hideIntro />
          </>
        ) : (
          <VerticalCategoryCalculator verticalId={verticalId} />
        )}
      </div>
    </>
  );
}
