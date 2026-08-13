import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

const BrandingContext = createContext(null);
const DEFAULTS = {
  brand_name: "BuildEco Group",
  primary_color: "#FF5A1F",
  accent_color: "#10B981",
  logo: "",
  favicon: "",
  tagline: "Construction super app for India",
  theme: {
    default_theme: "light",
    layout: "standard",
    navbar_style: "sticky",
    icon_mode: "hardhat",
    support_badge_url: "",
    footer_text: "",
    hero_layout: "split",
    card_style: "rounded",
    enabled_languages: ["en", "hi"],
    default_language: "en",
  },
};

/** Never surface Emergent-era 2Click branding on owner domains. */
function sanitizeBranding(data = {}) {
  const raw = (data.brand_name || "").trim();
  const compact = raw.toLowerCase().replace(/\s+/g, "");
  const isLegacy = !raw || compact === "2click.in" || compact === "2click" || compact.includes("2click");
  if (!isLegacy) {
    return { ...data, theme: { ...DEFAULTS.theme, ...(data.theme || {}) } };
  }
  return {
    ...DEFAULTS,
    ...data,
    brand_name: DEFAULTS.brand_name,
    tagline:
      !data.tagline || /operating system for construction/i.test(data.tagline)
        ? DEFAULTS.tagline
        : data.tagline,
    favicon: data.favicon && !/favicon-test/i.test(data.favicon) ? data.favicon : "",
    theme: { ...DEFAULTS.theme, ...(data.theme || {}) },
  };
}

export const useBranding = () => {
  const ctx = useContext(BrandingContext);
  if (!ctx) return { ...DEFAULTS, ...DEFAULTS.theme, refresh: () => {} };
  return ctx;
};

function hexToHsl(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hue = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) hue = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue /= 6;
  }
  return `${Math.round(hue * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function BrandingProvider({ children }) {
  const [brand, setBrand] = useState(DEFAULTS);

  const refresh = useCallback(async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get("company") || params.get("tenant") || undefined;
      const host = window.location.hostname;
      const { data } = await api.get("/site-config", { params: { slug, host, company_id: undefined } });
      setBrand(sanitizeBranding({ ...DEFAULTS, ...data }));
    } catch {
      try {
        const { data } = await api.get("/branding");
        setBrand(sanitizeBranding({ ...DEFAULTS, ...data }));
      } catch { /* keep defaults */ }
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    try {
      const b = brand;
      if (b.primary_color) {
        const hsl = hexToHsl(b.primary_color);
        document.documentElement.style.setProperty("--primary", hsl);
        document.documentElement.style.setProperty("--ring", hsl);
      }
      if (b.accent_color) document.documentElement.style.setProperty("--brand-accent", b.accent_color);
      if (b.brand_name) document.title = `${b.brand_name} — Construction Super App`;
      if (b.favicon) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
        link.href = b.favicon;
      }
      const layout = b.theme?.layout || "standard";
      document.documentElement.dataset.siteLayout = layout;
      document.documentElement.dataset.heroLayout = b.theme?.hero_layout || "split";
    } catch { /* noop */ }
  }, [brand]);

  const value = {
    ...brand,
    ...brand.theme,
    support_badge_url: brand.theme?.support_badge_url || "",
    refresh,
  };

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}
