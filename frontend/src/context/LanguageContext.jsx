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
    enrollment_title: "Enrollment & Registration",
    enrollment_sub: "Complete user-wise or shop-wise enrollment with agreements",
    your_profile: "Your profile",
    your_profile_hint: "Basic details for your 2click.in account",
    shop_details: "Shop details",
    shop_details_hint: "GST, PAN and shop address for marketplace listing",
    shop_name: "Shop / business name",
    shop_name_required: "Shop name is required",
    shop_type: "Shop type",
    shop_phone: "Shop phone",
    shop_email: "Shop email",
    address_line: "Street address",
    gst_number: "GST number",
    pan_number: "PAN number",
    phone: "Phone",
    agreements_intro: "Please read and accept all required agreements to continue.",
    loading_agreements: "Loading agreements…",
    required: "Required",
    accept_all_agreements: "Please accept all required agreements",
    create_login: "Create your login",
    complete_enrollment: "Complete enrollment",
    enrollment_submitted: "Enrollment submitted — we will review your shop shortly",
    name_required: "Full name is required",
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
    enrollment_title: "पंजीकरण और नामांकन",
    enrollment_sub: "समझौते के साथ व्यक्ति या दुकान पंजीकरण पूरा करें",
    your_profile: "आपकी प्रोफ़ाइल",
    your_profile_hint: "2click.in खाते के लिए बुनियादी विवरण",
    shop_details: "दुकान का विवरण",
    shop_details_hint: "GST, PAN और दुकान का पता मार्केटप्लेस के लिए",
    shop_name: "दुकान / व्यवसाय का नाम",
    shop_name_required: "दुकान का नाम ज़रूरी है",
    shop_type: "दुकान का प्रकार",
    shop_phone: "दुकान फ़ोन",
    shop_email: "दुकान ईमेल",
    address_line: "पता",
    gst_number: "GST नंबर",
    pan_number: "PAN नंबर",
    phone: "फ़ोन",
    agreements_intro: "जारी रखने के लिए सभी ज़रूरी समझौते पढ़ें और स्वीकार करें।",
    loading_agreements: "समझौते लोड हो रहे हैं…",
    required: "ज़रूरी",
    accept_all_agreements: "कृपया सभी ज़रूरी समझौते स्वीकार करें",
    create_login: "लॉगिन बनाएँ",
    complete_enrollment: "पंजीकरण पूरा करें",
    enrollment_submitted: "पंजीकरण भेजा गया — हम जल्द समीक्षा करेंगे",
    name_required: "पूरा नाम ज़रूरी है",
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
