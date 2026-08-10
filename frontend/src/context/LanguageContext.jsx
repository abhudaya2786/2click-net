import { createContext, useContext, useState, useCallback, useEffect } from "react";

const STRINGS = {
  en: {
    create_account: "Create your 2Click.in Account",
    onboarding_sub: "A few quick steps to set up your workspace",
    step_type: "Account Type",
    step_category: "Categories",
    step_business: "Business Details",
    step_account: "Your Account",
    select_user_type: "Who are you signing up as?",
    select_categories: "Select your categories",
    categories_hint: "Pick a primary and any additional categories",
    primary: "Primary",
    make_primary: "Make primary",
    search_categories: "Search categories…",
    clear_all: "Clear all",
    selected: "Selected",
    company_name: "Company name",
    department: "Department",
    business_type: "Business type",
    skills: "Skills (comma separated)",
    service_area: "Service area / city",
    portfolio: "Portfolio URL",
    pricing: "Expected pricing",
    availability: "Availability",
    full_name: "Full name",
    email: "Email",
    password: "Password (min 6 chars)",
    accept_terms: "I accept the Terms & Privacy Policy",
    back: "Back",
    next: "Next",
    create: "Create account",
    have_account: "Already have an account?",
    login: "Log in",
    choose_at_least_one: "Please select at least one category",
    accept_required: "Please accept the terms to continue",
    lang_toggle_label: "हिन्दी",
  },
  hi: {
    create_account: "अपना 2Click.in खाता बनाएँ",
    onboarding_sub: "अपना कार्यक्षेत्र सेट करने के लिए कुछ आसान चरण",
    step_type: "खाता प्रकार",
    step_category: "श्रेणियाँ",
    step_business: "व्यवसाय विवरण",
    step_account: "आपका खाता",
    select_user_type: "आप किस रूप में साइन अप कर रहे हैं?",
    select_categories: "अपनी श्रेणियाँ चुनें",
    categories_hint: "एक प्राथमिक और अन्य श्रेणियाँ चुनें",
    primary: "प्राथमिक",
    make_primary: "प्राथमिक बनाएँ",
    search_categories: "श्रेणियाँ खोजें…",
    clear_all: "सब हटाएँ",
    selected: "चयनित",
    company_name: "कंपनी का नाम",
    department: "विभाग",
    business_type: "व्यवसाय प्रकार",
    skills: "कौशल (अलग करने के लिए अल्पविराम)",
    service_area: "सेवा क्षेत्र / शहर",
    portfolio: "पोर्टफोलियो यूआरएल",
    pricing: "अपेक्षित मूल्य",
    availability: "उपलब्धता",
    full_name: "पूरा नाम",
    email: "ईमेल",
    password: "पासवर्ड (कम से कम 6 अक्षर)",
    accept_terms: "मैं नियम और गोपनीयता नीति स्वीकार करता/करती हूँ",
    back: "पीछे",
    next: "आगे",
    create: "खाता बनाएँ",
    have_account: "पहले से खाता है?",
    login: "लॉग इन",
    choose_at_least_one: "कृपया कम से कम एक श्रेणी चुनें",
    accept_required: "जारी रखने के लिए कृपया नियम स्वीकार करें",
    lang_toggle_label: "English",
  },
};

const LanguageContext = createContext(null);

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      lang: "en",
      isHi: false,
      t: (k) => STRINGS.en[k] || k,
      pick: (en) => en,
      toggle: () => {},
    };
  }
  return ctx;
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("bs_lang") || "en");

  useEffect(() => {
    document.documentElement.lang = lang === "hi" ? "hi" : "en";
  }, [lang]);

  const toggle = useCallback(() => {
    setLang((l) => {
      const n = l === "en" ? "hi" : "en";
      localStorage.setItem("bs_lang", n);
      return n;
    });
  }, []);

  const t = useCallback(
    (k) => (STRINGS[lang] && STRINGS[lang][k]) || STRINGS.en[k] || k,
    [lang],
  );

  const pick = useCallback((en, hi) => (lang === "hi" ? hi : en), [lang]);

  const value = {
    lang,
    isHi: lang === "hi",
    t,
    pick,
    toggle,
    setLang: (l) => {
      localStorage.setItem("bs_lang", l);
      setLang(l);
    },
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
