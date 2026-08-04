import React from 'react';
import { 
  X, 
  Palette, 
  Check, 
  Sparkles, 
  Eye, 
  Layout, 
  SlidersHorizontal, 
  Layers, 
  Building2, 
  Sun, 
  ShieldCheck,
  Zap,
  Moon,
  SunMedium,
  Globe,
  LayoutGrid
} from 'lucide-react';
import { ALL_INDIAN_LANGUAGES } from '../utils/indianLanguages';
import { DASHBOARD_DESIGN_PRESETS } from '../utils/dashboardStyles';
import { useLanguage } from '../context/LanguageContext';

export interface ThemePreset {
  id: string;
  name: string;
  nameHindi: string;
  category: string;
  bgGradient: string;
  primaryBg: string;
  primaryText: string;
  accentColor: string;
  badgeBg: string;
  description: string;
  previewColors: string[];
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'google_stitch_flow',
    name: 'Google Stitch AI & Google Flow Engine',
    nameHindi: 'गूगल स्टिच AI कैनवास एवं गूगल फ्लो इंजन (नेक्स्ट-जनरेशन AI थीम)',
    category: 'Google AI Studio Core',
    bgGradient: 'from-slate-950 via-indigo-950 to-slate-950',
    primaryBg: 'bg-blue-600',
    primaryText: 'text-blue-400',
    accentColor: '#4285F4',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    description: 'Google Stitch connected workflow nodes, Google Flow animated mesh canvas, glowing glass pill controls & multi-colored AI studio highlights.',
    previewColors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853']
  },
  {
    id: 'tailstore_emerald',
    name: 'Tailstore Modern Dark Header & Pill Controls',
    nameHindi: 'टेलस्टोर डार्क हेडर एवं पिल बटन स्टाइल (टेलस्टोर थीम)',
    category: 'Tailstore Modern B2B',
    bgGradient: 'from-slate-900 via-slate-950 to-slate-900',
    primaryBg: 'bg-teal-500',
    primaryText: 'text-teal-400',
    accentColor: '#0d9488',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    description: 'Sleek Tailstore dark sticky header (#0f172a), high-contrast white text, rounded pill controls, and crisp emerald accents.',
    previewColors: ['#0f172a', '#0d9488', '#ffffff', '#1e293b']
  },
  {
    id: 'midnight_black',
    name: '1. Midnight Black (Luxury Stealth Obsidian)',
    nameHindi: 'मिडनाइट ब्लैक - अल्ट्रा लक्जरी एवं डार्क ओब्सीडियन',
    category: 'Ultra Dark Luxury',
    bgGradient: 'from-black via-zinc-950 to-slate-950',
    primaryBg: 'bg-zinc-800',
    primaryText: 'text-zinc-200',
    accentColor: '#18181b',
    badgeBg: 'bg-zinc-800 text-zinc-200 border-zinc-700',
    description: 'Deep midnight obsidian canvas with subtle metallic highlights for luxury real estate & AI infrastructure.',
    previewColors: ['#000000', '#18181b', '#3f3f46', '#a1a1aa']
  },
  {
    id: 'royal_blue',
    name: '2. Royal Blue & Sapphire Blue',
    nameHindi: 'रॉयल ब्लू एवं सफायर ब्लू (बैंकिंग एवं फाइनेंस)',
    category: 'Corporate Finance',
    bgGradient: 'from-blue-950 via-slate-900 to-cyan-950',
    primaryBg: 'bg-blue-600',
    primaryText: 'text-blue-400',
    accentColor: '#2563eb',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    description: 'Deep sapphire ocean blue with electric cyan highlights for bank loan & escrow finance.',
    previewColors: ['#1e3a8a', '#2563eb', '#06b6d4', '#0f172a']
  },
  {
    id: 'emerald_green',
    name: '3. Emerald Green & Architectural Steel',
    nameHindi: 'एमराल्ड ग्रीन एवं स्टील ग्रीन (कंस्ट्रक्शन थीम)',
    category: 'Civil & Construction',
    bgGradient: 'from-emerald-950 via-slate-900 to-teal-950',
    primaryBg: 'bg-emerald-600',
    primaryText: 'text-emerald-400',
    accentColor: '#059669',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    description: 'Crisp structural emerald green and concrete steel slate for building materials & contractors.',
    previewColors: ['#064e3b', '#059669', '#10b981', '#334155']
  },
  {
    id: 'sunrise_gold',
    name: '4. Sunrise Gold & Solar Amber',
    nameHindi: 'सनराइज गोल्ड एवं सोलर एम्बर (अक्षय ऊर्जा थीम)',
    category: 'Renewable Energy',
    bgGradient: 'from-amber-950 via-zinc-950 to-slate-950',
    primaryBg: 'bg-amber-500',
    primaryText: 'text-amber-400',
    accentColor: '#f59e0b',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    description: 'Glowing solar amber and warm gold tones designed for rooftop solar & electrical MEP.',
    previewColors: ['#18181b', '#f59e0b', '#fbbf24', '#78350f']
  },
  {
    id: 'neo_purple',
    name: '5. Neo Purple & Cyberpunk AI',
    nameHindi: 'नियो पर्पल एवं साइबरपंक एआई (फ्यूचरिस्टिक टेक)',
    category: 'AI & LiDAR High-Tech',
    bgGradient: 'from-purple-950 via-slate-950 to-indigo-950',
    primaryBg: 'bg-purple-600',
    primaryText: 'text-purple-400',
    accentColor: '#9333ea',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    description: 'Electric violet neon and futuristic deep purple canvas for 3D LiDAR point clouds & AI Copilot.',
    previewColors: ['#3b0764', '#9333ea', '#c084fc', '#0f172a']
  },
  {
    id: 'pure_light',
    name: '6. Pure Light & Nordic Pearl',
    nameHindi: 'प्योर लाइट एवं नॉर्डिक पर्ल (अल्ट्रा-क्लीन लाइट थीम)',
    category: 'Minimalist Ultra-Clean',
    bgGradient: 'from-slate-100 via-indigo-50 to-white',
    primaryBg: 'bg-indigo-600',
    primaryText: 'text-indigo-600',
    accentColor: '#4f46e5',
    badgeBg: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    description: 'Clean pearl white snow with sharp royal indigo typography for modern corporate B2B.',
    previewColors: ['#f8fafc', '#4f46e5', '#6366f1', '#e0e7ff']
  }
];

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedThemeId: string;
  onSelectTheme: (themeId: string) => void;
  minimalistMode: boolean;
  onToggleMinimalistMode: (val: boolean) => void;
  selectedLanguage?: string;
  onSelectLanguage?: (code: string) => void;
  selectedDashboardPreset?: string;
  onSelectDashboardPreset?: (presetId: string) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedThemeId,
  onSelectTheme,
  minimalistMode,
  onToggleMinimalistMode,
  selectedLanguage = 'en',
  onSelectLanguage,
  selectedDashboardPreset = 'executive',
  onSelectDashboardPreset
}) => {
  const { language } = useLanguage();
  const isHi = language === 'hi' || language === 'bho';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[85vh] overflow-y-auto no-scrollbar rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl my-auto animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 p-6 text-white relative border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/20 border border-teal-400/40 rounded-2xl text-teal-300">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-lg text-[10px] font-black uppercase">
                2Click Regional Studio &amp; Dashboard Customizer
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {isHi ? 'भारतीय भाषाएँ, डैशबोर्ड डिज़ाइन एवं थीम विकल्प' : 'Languages, Dashboard Layouts & Theme Options'}
              </h2>
            </div>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          
          {/* SECTION 1: ALL INDIAN LANGUAGES SELECTOR */}
          <div className="p-5 bg-teal-50/50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-200/60 dark:border-teal-800/60 pb-3">
              <div>
                <span className="px-2.5 py-0.5 bg-teal-600 text-white text-[10px] font-black rounded-md uppercase tracking-wider flex items-center gap-1 w-fit mb-1">
                  <Globe className="w-3.5 h-3.5" /> 22 Official Indian Languages + English
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isHi ? 'अपनी पसंदीदा भारतीय भाषा चुनें (Select Preferred Language)' : 'Select Preferred Language'}
                </h3>
              </div>
              <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                {ALL_INDIAN_LANGUAGES.length} Languages Available
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
              {ALL_INDIAN_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => onSelectLanguage && onSelectLanguage(lang.code)}
                    className={`p-2 rounded-xl text-left border transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 font-extrabold shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span>{lang.flag}</span>
                      <span className="text-[10px] opacity-70 uppercase">{lang.code}</span>
                    </div>
                    <div className="mt-1">
                      <div className="text-xs font-bold truncate">{lang.nativeName}</div>
                      <div className="text-[9px] opacity-80 truncate">{lang.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: MULTIPLE DASHBOARD DESIGN PRESETS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-indigo-500" />
                डैशबोर्ड डिज़ाइन स्टाइल चुनें (Select Dashboard Design Layout)
              </h3>
              <span className="text-xs text-slate-400 font-semibold">{DASHBOARD_DESIGN_PRESETS.length} Dashboard Styles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {DASHBOARD_DESIGN_PRESETS.map((preset) => {
                const isSelected = selectedDashboardPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onSelectDashboardPreset && onSelectDashboardPreset(preset.id)}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 relative cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/60 shadow-xl ring-2 ring-indigo-500/50'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-indigo-300'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 p-1 bg-indigo-600 text-white rounded-full">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{preset.icon}</span>
                      <div>
                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200 text-[9px] font-black rounded uppercase">
                          {preset.badge}
                        </span>
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mt-0.5">
                          {preset.name}
                        </h4>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: MINIMALIST MODERN NAV MODE TOGGLE */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-[10px] font-black rounded-md uppercase tracking-wider flex items-center gap-1 w-fit">
                <Sparkles className="w-3 h-3 text-indigo-500" /> Ultra-Clean Layout
              </span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                कम विकल्प एवं मॉडर्न मिनिमल लुक (Minimum Options &amp; Ultra-Modern Layout)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                नेविगेशन बार को केवल 4 मुख्य बटन (Home, Engineering Tools, KhataBook, AI) में संक्षिप्त करें।
              </p>
            </div>

            <button
              onClick={() => onToggleMinimalistMode(!minimalistMode)}
              className={`px-5 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 shrink-0 shadow-md cursor-pointer ${
                minimalistMode
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
              }`}
            >
              <Layout className="w-4 h-4" />
              <span>{minimalistMode ? 'Minimal Mode: ON' : 'Minimal Mode: OFF'}</span>
            </button>
          </div>

          {/* SECTION 4: THEME PRESETS GRID */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-teal-600" />
                पसंदीदा कलर थीम चुनें (Choose Modern Color Palette)
              </h3>
              <span className="text-xs text-slate-400 font-semibold">{THEME_PRESETS.length} Available Themes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {THEME_PRESETS.map((preset) => {
                const isSelected = selectedThemeId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onSelectTheme(preset.id)}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-3 relative overflow-hidden cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 shadow-xl ring-2 ring-teal-500/50'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 p-1 bg-teal-600 text-white rounded-full">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}

                    <div className="space-y-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${preset.badgeBg}`}>
                        {preset.category}
                      </span>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white mt-1">
                        {preset.name}
                      </h4>
                      <p className="text-[11px] text-teal-700 dark:text-teal-300 font-bold">
                        {preset.nameHindi}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        {preset.description}
                      </p>
                    </div>

                    {/* Color Swatch Circles */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-400 font-bold mr-1">Palette:</span>
                      {preset.previewColors.map((color, i) => (
                        <span
                          key={i}
                          className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                          style={{ backgroundColor: color }}
                        ></span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span className="font-bold">
            💡 चुने गए भाषा, थीम और डैशबोर्ड लेआउट से पूरा ऐप तुरंत लाइव अपडेट होगा।
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-md transition cursor-pointer"
          >
            Apply &amp; Close
          </button>
        </div>

      </div>
    </div>
  );
};

