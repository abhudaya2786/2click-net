import { useBranding } from "@/context/BrandingContext";

/** Default circular Build Eco Group seal — public/logo-build-eco-group.png */
export const DEFAULT_LOGO_SRC = "/logo-build-eco-group.png";

/** Site icon from super-admin branding (logo / support badge), with seal fallback. */
export default function BrandLogo({
  className = "h-10 w-10",
  iconClass = "h-4 w-4",
  alt = "Build Eco Group",
}) {
  const { logo, theme, support_badge_url, brand_name } = useBranding();
  const mode = theme?.icon_mode || "logo";
  const label = brand_name || alt;

  if (mode === "support" && support_badge_url) {
    return (
      <img
        src={support_badge_url}
        alt={label}
        className={`${className} object-contain rounded-full`}
      />
    );
  }

  const src = logo || DEFAULT_LOGO_SRC;
  return (
    <img
      src={src}
      alt={label}
      className={`${className} object-contain rounded-full shrink-0`}
      width={40}
      height={40}
      decoding="async"
    />
  );
}
