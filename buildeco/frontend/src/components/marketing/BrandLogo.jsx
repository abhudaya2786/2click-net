import { HardHat } from "lucide-react";
import { useBranding } from "@/context/BrandingContext";

/** Site icon from super-admin branding (logo / hardhat / support badge). */
export default function BrandLogo({ className = "h-8 w-8", iconClass = "h-4 w-4" }) {
  const { logo, theme, support_badge_url } = useBranding();
  const mode = theme?.icon_mode || "hardhat";

  if (mode === "logo" && logo) {
    return <img src={logo} alt="" className={`${className} object-contain rounded-lg`} />;
  }
  if (mode === "support" && support_badge_url) {
    return <img src={support_badge_url} alt="" className={`${className} object-contain rounded-lg`} />;
  }
  if (logo && mode === "hardhat") {
    return <img src={logo} alt="" className={`${className} object-contain rounded-lg`} />;
  }
  return (
    <div className={`${className} bg-primary flex items-center justify-center rounded shadow-sm`}>
      <HardHat className={`${iconClass} text-white`} strokeWidth={1.75} />
    </div>
  );
}
