import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

const BrandingContext = createContext(null);
export const useBranding = () => useContext(BrandingContext) || { brand_name: "2Click.in", primary_color: "#FF5A1F", logo: "", tagline: "" };

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
  const [brand, setBrand] = useState({ brand_name: "2Click.in", primary_color: "#FF5A1F", logo: "", tagline: "" });

  const refresh = useCallback(async () => {
    try { const { data } = await api.get("/branding"); setBrand(data); } catch {}
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    try {
      if (brand.primary_color) {
        const hsl = hexToHsl(brand.primary_color);
        document.documentElement.style.setProperty("--primary", hsl);
        document.documentElement.style.setProperty("--ring", hsl);
      }
      if (brand.brand_name) document.title = `${brand.brand_name} — Construction Super App`;
    } catch {}
  }, [brand]);

  return <BrandingContext.Provider value={{ ...brand, refresh }}>{children}</BrandingContext.Provider>;
}
