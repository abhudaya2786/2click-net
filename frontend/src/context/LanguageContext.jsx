import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";

const FALLBACK = {
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
    general: "General",
    retry: "Retry",
    options: "options",
    select_all: "Select all",
    your_selection: "Your selection",
    tap_star_primary: "Tap ★ on a chip to set your primary category",
    no_categories_required: "No categories required for this account type. Continue →",
    no_categories_found: "No categories found. Please try again or contact support.",
    no_search_results: "No categories match your search",
    categories_load_failed: "Could not load categories. Check your connection and retry.",
    no_extra_details: "No extra details needed. Continue →",
    category_groups: "category groups",
    account_created: "Account created!",
    lang_toggle_label: "हि / EN",
    "location.state": "State",
    "location.city": "City",
    "location.pincode": "Pincode",
    "location.gps": "Use GPS",
    "nav.marketplace": "Marketplace",
    "nav.tenders": "Tenders",
    "nav.solar": "Solar",
    "nav.mart": "Super Mart",
    "nav.pricing": "Pricing",
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
    general: "सामान्य",
    retry: "फिर कोशिश करें",
    options: "विकल्प",
    select_all: "सब चुनें",
    your_selection: "आपका चयन",
    tap_star_primary: "प्राथमिक श्रेणी के लिए ★ दबाएँ",
    no_categories_required: "इस खाता प्रकार के लिए श्रेणी की ज़रूरत नहीं। आगे बढ़ें →",
    no_categories_found: "कोई श्रेणी नहीं मिली। फिर कोशिश करें या सहायता से संपर्क करें।",
    no_search_results: "आपकी खोज से कोई श्रेणी मेल नहीं खाती",
    categories_load_failed: "श्रेणियाँ लोड नहीं हो सकीं। कनेक्शन जाँचें और फिर कोशिश करें।",
    no_extra_details: "अतिरिक्त विवरण की ज़रूरत नहीं। आगे बढ़ें →",
    category_groups: "श्रेणी समूह",
    account_created: "खाता बन गया!",
    lang_toggle_label: "EN / हि",
    "location.state": "राज्य",
    "location.city": "शहर",
    "location.pincode": "पिनकोड",
    "location.gps": "GPS लोकेशन",
    "nav.marketplace": "मार्केट",
    "nav.tenders": "टेंडर",
    "nav.solar": "सोलर",
    "nav.mart": "सुपर मार्ट",
    "nav.pricing": "प्लान",
  },
};

const LanguageContext = createContext(null);
export const useLang = () => useContext(LanguageContext) || { lang: "en", t: (k) => FALLBACK.en[k] || k, toggle: () => {}, enabled: ["en", "hi"] };

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("bs_lang") || "en");
  const [remote, setRemote] = useState({ enabled: ["en", "hi"], default: "en", strings: {} });

  useEffect(() => {
    api.get("/locales").then(({ data }) => {
      setRemote(data);
      const stored = localStorage.getItem("bs_lang");
      if (!stored && data.default) {
        setLang(data.default);
        localStorage.setItem("bs_lang", data.default);
      }
    }).catch(() => {});
  }, []);

  const enabled = remote.enabled || ["en", "hi"];

  const toggle = useCallback(() => {
    setLang((l) => {
      const idx = enabled.indexOf(l);
      const n = enabled[(idx + 1) % enabled.length] || (l === "en" ? "hi" : "en");
      localStorage.setItem("bs_lang", n);
      return n;
    });
  }, [enabled]);

  const t = useCallback((k) => {
    const fromRemote = remote.strings?.[k]?.[lang];
    if (fromRemote) return fromRemote;
    return (FALLBACK[lang] && FALLBACK[lang][k]) || FALLBACK.en[k] || k;
  }, [lang, remote]);

  return (
    <LanguageContext.Provider value={{ lang, t, toggle, enabled, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
