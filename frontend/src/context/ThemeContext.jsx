import { createContext, useContext, useEffect, useState } from "react";
import { useBranding } from "@/context/BrandingContext";

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const { default_theme: siteDefault } = useBranding();
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("bs_theme");
    if (saved) return saved;
    return siteDefault === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    if (!localStorage.getItem("bs_theme") && siteDefault && siteDefault !== "system") {
      setTheme(siteDefault);
    }
  }, [siteDefault]);

  useEffect(() => {
    const resolved = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    document.documentElement.classList.toggle("dark", resolved === "dark");
    localStorage.setItem("bs_theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>;
}
