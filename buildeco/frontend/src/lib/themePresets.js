/** Premium UI theme presets — applied via CSS variables on <html> */
export const THEME_PRESETS = [
  {
    id: "slate",
    label: "Slate Dark",
    labelHi: "स्लेट डार्क",
    primary: "25 52% 52%",
    accent: "217 33% 22%",
    solar: "160 84% 39%",
    tender: "217 91% 60%",
  },
  {
    id: "navy",
    label: "Modern Navy",
    labelHi: "मॉडर्न नेवी",
    primary: "217 91% 55%",
    accent: "222 47% 14%",
    solar: "160 70% 42%",
    tender: "199 89% 48%",
  },
  {
    id: "emerald",
    label: "Eco Emerald",
    labelHi: "इको एमराल्ड",
    primary: "171 93% 22%",
    accent: "168 25% 92%",
    solar: "171 70% 32%",
    tender: "214 23% 28%",
  },
  {
    id: "amber",
    label: "Amber Gold",
    labelHi: "एम्बर गोल्ड",
    primary: "38 92% 50%",
    accent: "30 25% 14%",
    solar: "43 96% 56%",
    tender: "25 52% 52%",
  },
];

export function applyThemePreset(presetId) {
  const preset = THEME_PRESETS.find((p) => p.id === presetId) || THEME_PRESETS[0];
  const root = document.documentElement;
  root.style.setProperty("--primary", preset.primary);
  root.style.setProperty("--ring", preset.primary);
  root.style.setProperty("--accent", preset.accent);
  root.style.setProperty("--solar", preset.solar);
  root.style.setProperty("--tender", preset.tender);
  root.dataset.uiPreset = preset.id;
  localStorage.setItem("bs_ui_preset", preset.id);
}

export function loadStoredPreset() {
  const id = localStorage.getItem("bs_ui_preset") || "emerald";
  applyThemePreset(id);
}
