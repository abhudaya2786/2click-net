import { THEME_PRESETS, applyThemePreset } from "@/lib/themePresets";
import { useLang } from "@/context/LanguageContext";

export default function ThemeSwitcher({ className = "" }) {
  const { lang } = useLang();
  const current = document.documentElement.dataset.uiPreset || localStorage.getItem("bs_ui_preset") || "slate";

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {THEME_PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => applyThemePreset(p.id)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
            current === p.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
          }`}
        >
          {lang === "hi" ? p.labelHi : p.label}
        </button>
      ))}
    </div>
  );
}
