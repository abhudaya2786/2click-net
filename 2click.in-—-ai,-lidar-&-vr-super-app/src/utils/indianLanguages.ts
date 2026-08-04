import { optionTranslations } from '../i18n/translations';
export { optionTranslations };

export type Language = 'en' | 'hi' | 'bn' | 'ta';

export const translations = {
  en: {
    // Navbar & Common
    app_title: "2click.in — AI, LiDAR & VR Super App",
    project_zone: "Project Zone",
    select_language: "Language",
    
    // Solar Studio
    solar_title: "Solar Rooftop Engine & Calculator",
    solar_desc: "Configure solar panel technology, inverter, structure, cabling & battery to set real rates (Rate per Watt/kW) and brand options.",
    material_selection: "Material Selection, Brand & Rate Customizer",
    detailed_boq: "Detailed BOQ Estimate Sheet",
    quick_package_rate: "Quick Package Rates:",
    budget: "Budget (Economy)",
    standard: "Standard",
    premium: "Premium (TopCon)",
    power_consumption: "Power Consumption & Roof Area",
    pv_modules: "Solar Modules (PV Modules Tech)",

    // Tiles & Marble Studio
    tiles_title: "Tiles, Marble & Labor Calculator",
    tiles_desc: "Calculate complete tile boxes, chemical, cement, labor rates and wholesale shop estimates.",
    
    // Buttons
    book_survey: "Book Free Site Survey",
    download_guidelines: "Download Guidelines"
  },

  hi: {
    // Navbar & Common
    app_title: "2click.in — एआई, लिडार एवं वीआर सुपर ऐप",
    project_zone: "प्रोजेक्ट ज़ोन",
    select_language: "भाषा चुनें",

    // Solar Studio
    solar_title: "सोलर रूफटॉप इंजन एवं कैलकुलेटर",
    solar_desc: "सोलर पैनल टेक्नोलॉजी, इनवर्टर, स्ट्रक्चर, केबलिंग एवं बैटरी चुनकर वास्तविक दर (Rate per Watt/kW) एवं नया ब्रांड निर्धारित करें।",
    material_selection: "सामग्री चयन, नया ब्रांड व दर कस्टमाइज़र",
    detailed_boq: "विस्तृत दर विवरण पत्रक (Detailed BOQ Estimate)",
    quick_package_rate: "त्वरित पैकेज रेट:",
    budget: "बजट (Economy)",
    standard: "मानक (Standard)",
    premium: "प्रीमियम (TopCon)",
    power_consumption: "बिजली खपत एवं छत का क्षेत्र",
    pv_modules: "सोलर मॉड्यूल (PV Modules Tech)",

    // Tiles & Marble Studio
    tiles_title: "टाइल्स, मार्बल, मिस्त्री लेबर एवं सामान कैलकुलेटर",
    tiles_desc: "क्षेत्रफल अनुसार टाइल्स-मार्बल के बॉक्स, केमिकल/सीमेंट सामान, मिस्त्री फिटिंग लेबर ठेका रेट का संपूर्ण हिसाब लगाएं।",

    // Buttons
    book_survey: "फ्री साइट सर्वे व कोटेशन बुक करें",
    download_guidelines: "गाइडलाइन डाउनलोड करें"
  }
};

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  states: string[];
  speakers: string;
  flag?: string;
}

export const ALL_INDIAN_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', states: ['All India', 'Corporate & B2B'], speakers: '128 Million', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', states: ['UP', 'MP', 'Bihar', 'Rajasthan', 'Delhi', 'Haryana'], speakers: '528 Million', flag: '🇮🇳' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', script: 'Devanagari', states: ['Bihar', 'Eastern UP', 'Jharkhand'], speakers: '51 Million', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', states: ['West Bengal', 'Tripura', 'Assam'], speakers: '97 Million', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', states: ['Maharashtra', 'Goa'], speakers: '83 Million', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', states: ['Andhra Pradesh', 'Telangana'], speakers: '81 Million', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', states: ['Tamil Nadu', 'Puducherry'], speakers: '69 Million', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'Perso-Arabic', states: ['Telangana', 'UP', 'Jammu & Kashmir', 'Bihar'], speakers: '50 Million', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', states: ['Gujarat', 'Daman & Diu'], speakers: '55 Million', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', states: ['Karnataka'], speakers: '44 Million', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', states: ['Kerala', 'Lakshadweep'], speakers: '35 Million', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia', states: ['Odisha'], speakers: '38 Million', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', states: ['Punjab', 'Delhi'], speakers: '33 Million', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'Bengali-Assamese', states: ['Assam'], speakers: '15 Million', flag: '🇮🇳' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', script: 'Devanagari', states: ['Bihar', 'Jharkhand'], speakers: '14 Million', flag: '🇮🇳' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'Ol Chiki', states: ['Jharkhand', 'Odisha', 'WB'], speakers: '7 Million', flag: '🇮🇳' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर', script: 'Perso-Arabic', states: ['Jammu & Kashmir'], speakers: '7 Million', flag: '🇮🇳' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', script: 'Devanagari', states: ['Sikkim', 'WB'], speakers: '3 Million', flag: '🇳🇵' },
  { code: 'sd', name: 'Sindhi', nativeName: 'सिंधी', script: 'Devanagari / Arabic', states: ['Gujarat', 'Maharashtra'], speakers: '3 Million', flag: '🇮🇳' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', script: 'Devanagari', states: ['Goa', 'Karnataka', 'Maharashtra'], speakers: '2.5 Million', flag: '🇮🇳' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', script: 'Devanagari', states: ['Jammu & Kashmir'], speakers: '2.6 Million', flag: '🇮🇳' },
  { code: 'mni', name: 'Manipuri (Meitei)', nativeName: 'মৈতৈলোন্', script: 'Meitei Mayek', states: ['Manipur'], speakers: '1.8 Million', flag: '🇮🇳' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'Devanagari', states: ['Pan-India Classical'], speakers: 'Classical', flag: '🇮🇳' }
];

export const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    ...translations.en,
    siteTitle: '2click.in - Civil, Solar & BOQ Platform',
    services: 'Services & BOQ',
    civilBoq: 'Civil BOQ Engine',
    solarEngine: 'Solar Rooftop Engine',
    electrical: 'Electrical & MEP Studio',
    vendorBidding: 'Vendor Bidding',
    logistics: 'Logistics & Transport',
    khatabook: 'Khatabook & Billing',
    dashboard: 'Command Dashboard',
    superAdmin: 'Super Admin',
    login: 'Login Services',
    getBoqQuote: 'Get BOQ Estimate',
    selectDistrict: 'Select District',
    visionaryTitle: 'Founder & Visionary',
    corporateOffices: 'Corporate & Regional Offices',
    regdOffice: 'Registered Office',
    headOffice: 'Head Office',
    corporateOffice: 'Corporate Office',
    home: 'Home / Portal',
    construction: 'Civil Construction & BOQ',
    solar: 'Solar Rooftop Engine',
    dukandar_market: 'Dukandar Wholesale Market',
    bank_loans: 'Bank Loans & KYC Hub',
    water_etp_stp: 'Water, ETP & STP Studio',
    electrical_elv: 'Electrical & ELV Studio',
    vendors_binding: 'Vendors Binding & B2B Hub',
    naksha_vastu: 'Naksha & Vastu Studio',
    lidar: 'LiDAR Survey 3D Viewer',
    vr: 'VR 360° Walkthrough',
    interior: 'Interior Design Studio',
    tiles_marble: 'Tiles & Marble Studio',
    ca_gst: 'CA & GST Compliance Hub',
    language: 'Language',
    search: 'Search...',
    searchPlaceholder: 'Search Naksha, BOQ, GST, Vendor or Equipment... (Ctrl+K)',
    filter: 'Filter',
    calculate: 'Calculate',
    share: 'Share',
    callClient: 'Call Client',
    downloadPdf: 'Download PDF',
    quickDemo: 'Quick Demo',
    groupCore: 'CORE MANAGEMENT',
    groupEng: 'ENGINEERING & TRADES',
    groupSupply: 'SUPPLY CHAIN & B2B MARKETPLACE',
    groupBusiness: 'BUSINESS & FINANCE',
    badgeAnalytics: 'Analytics',
    badgeCore: 'Core',
    badgeAiEngine: 'AI Engine',
    badgeStudio: 'Studio',
    badgeMep: 'MEP',
    badgePlumbing: 'Plumbing',
    badgeFlooring: 'Flooring',
    badgeMnre: 'MNRE',
    badgeB2b: 'B2B',
    badgeMarket: 'Market',
    badgeFintech: 'Fintech',
    badge3d: '3D',
    badgeVr: 'VR',
    badgeCa: 'CA',
    badgeLogistics: 'Logistics',
    dashboardDesc: 'KPIs, Project Milestones & Live Cost Index',
    homeDesc: 'Project B2B Hub, City Metrics & Quick Tools',
    constructionDesc: 'Cement, Steel, Footing & Quantity Takeoff',
    naksha_vastuDesc: 'House Layouts, Vastu Compass & Architect Chat',
    interiorDesc: '3D Room Layouts & Interior Specs',
    electrical_elvDesc: 'Transformers, Substations & Cables',
    water_etp_stpDesc: 'Effluent & Sewage Treatment Plant Design',
    tiles_marbleDesc: 'Tile Box Calculator, Usama & Labor Rates',
    solarDesc: 'KW Solar Power & PM Surya Ghar Subsidy',
    dukandar_marketDesc: 'Building Material Wholesale Directory',
    vendors_bindingDesc: 'Contractor Binding, Escrow & GST B2B',
    bank_loansDesc: 'Project Loans, Escrow & Bank KYC',
    crm_khatabookDesc: 'Udhaar Khatabook, GST Invoicing & CRM',
    logisticsDesc: 'Truck Hire, JCB/Crane Rental & Haulage',
    ca_gstDesc: 'GST Filing, Tax & E-Way Bill Hub',
    superAdminDesc: 'Global System Control & Analytics'
  },
  hi: {
    ...translations.en,
    siteTitle: '2click.in - Civil Construction, Solar & BOQ Platform',
    services: 'Services & BOQ',
    civilBoq: 'Civil BOQ Calculator',
    solarEngine: 'Solar Rooftop Engine',
    electrical: 'Electrical MEP Studio',
    vendorBidding: 'Vendor Bidding',
    logistics: 'Logistics & Fleet Rental',
    khatabook: 'KhataBook & Billing',
    dashboard: 'Command Dashboard',
    superAdmin: 'Super Admin Portal',
    login: 'Login Portal',
    getBoqQuote: 'Get BOQ Estimate',
    selectDistrict: 'Select District',
    visionaryTitle: 'Founders & Visionaries',
    corporateOffices: 'Corporate & Regional Offices',
    regdOffice: 'Registered Office',
    headOffice: 'Head Office',
    corporateOffice: 'Corporate Office',
    home: 'Home / Portal',
    construction: 'Civil Construction & BOQ',
    solar: 'Solar Rooftop Engine',
    dukandar_market: 'Dukandar Wholesale Market',
    bank_loans: 'Bank Loans & KYC Hub',
    water_etp_stp: 'Water, ETP & STP Studio',
    electrical_elv: 'Electrical & ELV Studio',
    vendors_binding: 'Vendors Binding & B2B Hub',
    naksha_vastu: 'Naksha & Vastu Studio',
    lidar: 'LiDAR Survey 3D Viewer',
    vr: 'VR 360° Walkthrough',
    interior: 'Interior Design Studio',
    tiles_marble: 'Tiles & Marble Studio',
    ca_gst: 'CA & GST Compliance Hub',
    language: 'Language',
    search: 'Search...',
    searchPlaceholder: 'Search Naksha, BOQ, GST, Vendor or Equipment... (Ctrl+K)',
    filter: 'Filter',
    calculate: 'Calculate',
    share: 'Share',
    callClient: 'Call Client',
    downloadPdf: 'Download PDF',
    quickDemo: 'Quick Demo',
    groupCore: 'CORE MANAGEMENT',
    groupEng: 'ENGINEERING & TRADES',
    groupSupply: 'SUPPLY CHAIN & B2B MARKETPLACE',
    groupBusiness: 'BUSINESS & FINANCE',
    badgeAnalytics: 'Analytics',
    badgeCore: 'Core',
    badgeAiEngine: 'AI Engine',
    badgeStudio: 'Studio',
    badgeMep: 'MEP',
    badgePlumbing: 'Plumbing',
    badgeFlooring: 'Flooring',
    badgeMnre: 'MNRE',
    badgeB2b: 'B2B',
    badgeMarket: 'Market',
    badgeFintech: 'Fintech',
    badge3d: '3D',
    badgeVr: 'VR',
    badgeCa: 'CA',
    badgeLogistics: 'Logistics',
    dashboardDesc: 'KPIs, Project Milestones & Live Cost Index',
    homeDesc: 'Project B2B Hub, City Metrics & Quick Tools',
    constructionDesc: 'Cement, Steel, Footing & Quantity Takeoff',
    naksha_vastuDesc: 'House Layouts, Vastu Compass & Architect Chat',
    interiorDesc: '3D Room Layouts & Interior Specs',
    electrical_elvDesc: 'Transformers, Substations & Cables',
    water_etp_stpDesc: 'Effluent & Sewage Treatment Plant Design',
    tiles_marbleDesc: 'Tile Box Calculator, Usama & Labor Rates',
    solarDesc: 'KW Solar Power & PM Surya Ghar Subsidy',
    dukandar_marketDesc: 'Building Material Wholesale Directory',
    vendors_bindingDesc: 'Contractor Binding, Escrow & GST B2B',
    bank_loansDesc: 'Project Loans, Escrow & Bank KYC',
    crm_khatabookDesc: 'Udhaar Khatabook, GST Invoicing & CRM',
    logisticsDesc: 'Truck Hire, JCB/Crane Rental & Haulage',
    ca_gstDesc: 'GST Filing, Tax & E-Way Bill Hub',
    superAdminDesc: 'Global System Control & Analytics'
  },
  bho: {
    siteTitle: '2click.in - सिविल, सोलर अउर BOQ प्लेटफ़ॉर्म',
    services: 'सेवा अउर BOQ',
    civilBoq: 'सिविल BOQ कैलकुलेटर',
    solarEngine: 'सोलर रूफटॉप इंजन',
    electrical: 'इलेक्ट्रिकल एमईपी स्टूडियो',
    vendorBidding: 'वेंडर बिडिंग मंडी',
    logistics: 'गाड़ी भाड़ा अउर लॉजिस्टिक्स',
    khatabook: 'खाताबुक अउर उधारी',
    dashboard: 'मुख्य डैशबोर्ड',
    superAdmin: 'सुपर मालिक',
    login: 'लॉगिन करीं',
    getBoqQuote: 'BOQ एस्टीमेट लीं',
    selectDistrict: 'जिला चुनीं',
    visionaryTitle: 'संस्थापक अउर विजनरी',
    corporateOffices: 'कॉर्पोरेट दफ्तर',
    home: 'गृह / पोर्टल',
    construction: 'सिविल कंस्ट्रक्शन एवं BOQ',
    solar: 'सोलर रूफटॉप इंजन',
    dukandar_market: 'दुकानदार थोक मंडी',
    bank_loans: 'बैंक लोन अउर KYC',
    water_etp_stp: 'पानी अउर STP स्टूडियो',
    electrical_elv: 'इलेक्ट्रिकल स्टूडियो',
    vendors_binding: 'वेंडर बाइंडिंग',
    naksha_vastu: 'नक्शा अउर वास्तु',
    lidar: 'LiDAR 3D व्यूअर',
    vr: 'VR 360° वॉकथ्रू',
    interior: 'इंटीरियर डिज़ाइन',
    tiles_marble: 'टाइल्स अउर मार्बल',
    ca_gst: 'CA अउर GST हब',
    language: 'भाषा',
    search: 'खोजीं...',
    filter: 'फ़िल्टर',
    calculate: 'हिसाब करीं',
    share: 'शेयर करीं',
    callClient: 'क्लाइंट के फोन करीं',
    downloadPdf: 'पीडीएफ डाउनलोड करीं',
    quickDemo: 'क्विक डेमो',
    groupCore: 'मुख्य प्रबंधन',
    groupEng: 'इंजीनियरिंग अउर ट्रेड'
  },
  bn: {
    siteTitle: '2click.in - সিভিল, সোলার ও BOQ প্ল্যাটফর্ম',
    services: 'পরিষেবা ও বিওকিউ',
    civilBoq: 'সিভিল বিওকিউ ক্যালকুলেটর',
    solarEngine: 'সোলার রুফটপ ইঞ্জিন',
    electrical: 'ইলেকট্রিক্যাল এমইপি স্টুডিও',
    vendorBidding: 'ভেন্ডর বিডিং',
    logistics: 'লজিস্টিকস ও পরিবহন',
    khatabook: 'খাতাবুক ও বিলিং',
    dashboard: 'কমান্ড ড্যাশবোর্ড',
    superAdmin: 'সুপার অ্যাডমিন',
    login: 'লগইন সার্ভিস',
    getBoqQuote: 'বিওকিউ হিসাব পান',
    selectDistrict: 'জেলা নির্বাচন করুন',
    visionaryTitle: 'প্রতিষ্ঠাতা ও ভিশনারি',
    corporateOffices: 'করপোরেট ও আঞ্চলিক কার্যালয়',
    home: 'হোম / পোর্টাল',
    construction: 'সিভিল কনস্ট্রাকশন ও BOQ',
    solar: 'সোলার রুফটপ ইঞ্জিন',
    dukandar_market: 'দোকানদার পাইকারি বাজার',
    bank_loans: 'ব্যাংক লোন ও KYC হাব',
    water_etp_stp: 'ওয়াটার, ETP ও STP স্টুডিও',
    electrical_elv: 'ইলেকট্রিক্যাল ও ELV স্টুডিও',
    vendors_binding: 'ভেন্ডর বাইন্ডিং ও B2B হাব',
    naksha_vastu: 'নকশা ও বাস্তু স্টুডিও',
    lidar: 'LiDAR সার্ভে 3D ভিউয়ার',
    vr: 'VR 360° ওয়াকথ্রু',
    interior: 'ইন্টেরিয়র ডিজাইন স্টুডিও',
    tiles_marble: 'টাইলস ও মার্বেল স্টুডিও',
    ca_gst: 'CA ও GST হাব',
    language: 'ভাষা',
    search: 'খুঁজুন...',
    filter: 'ফিল্টার',
    calculate: 'গণনা করুন',
    share: 'শেয়ার করুন',
    callClient: 'ক্লায়েন্টকে কল করুন',
    downloadPdf: 'পিডিএফ ডাউনলোড করুন',
    quickDemo: 'কুইক ডেমো',
    groupCore: 'প্রধান পরিচালনা',
    groupEng: 'ইঞ্জিনিয়ারিং ও ট্রেডস'
  },
  mr: {
    siteTitle: '2click.in - सिव्हिल, सोलर आणि BOQ प्लॅटफॉर्म',
    services: 'सेवा आणि BOQ',
    civilBoq: 'सिव्हिल BOQ कॅल्क्युलेटर',
    solarEngine: 'सोलर रूफटॉप इंजिन',
    electrical: 'इलेक्ट्रिकल MEP स्टुडिओ',
    vendorBidding: 'व्हेंडर बिडिंग',
    logistics: 'लॉजिस्टिक्स आणि वाहतूक',
    khatabook: 'खाताबुक आणि बिलिंग',
    dashboard: 'कमांड डॅशबोर्ड',
    superAdmin: 'सुपर ॲडमिन',
    login: 'लॉगिन सेवा',
    getBoqQuote: 'BOQ अंदाज मिळवा',
    selectDistrict: 'जिल्हा निवडा',
    home: 'होम / पोर्टल',
    construction: 'सिव्हिल कन्स्ट्रक्शन आणि BOQ',
    solar: 'सोलर रूफटॉप इंजिन',
    dukandar_market: 'दुकानदार घाऊक बाजार',
    bank_loans: 'बँक कर्ज आणि KYC हब',
    naksha_vastu: 'नकाशा आणि वास्तु स्टुडिओ',
    interior: 'इंटेरिअर डिझाइन स्टुडिओ',
    tiles_marble: 'टाईल्स आणि मार्बल स्टुडिओ',
    language: 'भाषा',
    search: 'शोधा...',
    filter: 'फिल्टर',
    calculate: 'गणना करा',
    share: 'शेअर करा',
    downloadPdf: 'पीडीएफ डाउनलोड करा',
    groupCore: 'मुख्य व्यवस्थापन',
    groupEng: 'इंजिनिअरिंग आणि ट्रेड्स'
  },
  te: {
    siteTitle: '2click.in - సివిల్, సోలార్ & BOQ ప్లాట్‌ఫారమ్',
    services: 'సేవలు & BOQ',
    civilBoq: 'సివిల్ BOQ క్యాలిక్యులేటర్',
    solarEngine: 'సోలార్ రూఫ్‌టాప్ ఇంజిన్',
    home: 'హోమ్ / పోర్టల్',
    construction: 'సివిల్ కన్స్ట్రక్షన్ & BOQ',
    solar: 'సోలార్ రూఫ్‌టాప్',
    dukandar_market: 'దుకాణదారు హోల్‌సేల్ మార్కెట్',
    bank_loans: 'బ్యాంక్ రుణాలు & KYC హబ్',
    naksha_vastu: 'నక్షా & వాస్తు స్టూడియో',
    language: 'భాష',
    search: 'శోధించండి...',
    calculate: 'లెక్కించండి',
    share: 'షేర్ చేయండి',
    downloadPdf: 'PDF డౌన్‌లోడ్ చేయండి',
    groupCore: 'కోర్ మేనేజ్‌మెంట్'
  },
  ta: {
    siteTitle: '2click.in - சிவில், சோலார் & BOQ தளம்',
    services: 'சேவைகள் & BOQ',
    civilBoq: 'சிவில் BOQ கணக்கிடுவான்',
    home: 'முகப்பு / போர்டல்',
    construction: 'சிவில் கட்டுமானம் & BOQ',
    solar: 'சோலார் கூரை இன்ஜின்',
    dukandar_market: 'கடைக்காரர் மொத்த சந்தை',
    naksha_vastu: 'வரைபடம் & வாஸ்து ஸ்டுடியோ',
    language: 'மொழி',
    search: 'தேடுக...',
    calculate: 'கணக்கிடு',
    share: 'பகிர்',
    downloadPdf: 'PDF பதிவிறக்கவும்',
    groupCore: 'முதன்மை நிர்வாகம்'
  },
  ur: {
    siteTitle: '2click.in - سول، سولر اور BOQ پلیٹ فارم',
    services: 'خدمات اور BOQ',
    civilBoq: 'سول BOQ کیلکولیٹر',
    home: 'ہوم / پورٹل',
    construction: 'سول کنسٹرکشن اور BOQ',
    solar: 'سولر روtop انجن',
    dukandar_market: 'دوکاندار ہول سیل مارکیٹ',
    naksha_vastu: 'نقشہ اور واستو اسٹوڈیو',
    language: 'زبان',
    search: 'تلاش کریں...',
    calculate: 'حساب کریں',
    share: 'شیئر کریں',
    downloadPdf: 'پی ڈی ایف ڈاؤن لوڈ کریں',
    groupCore: 'بنیادی انتظام'
  },
  gu: {
    siteTitle: '2click.in - સિવિલ, સોલર અને BOQ પ્લેટફોર્મ',
    services: 'સેવાઓ અને BOQ',
    civilBoq: 'સિવિલ BOQ કેલ્ક્યુલેટર',
    home: 'હોમ / પોર્ટલ',
    construction: 'સિવિલ બાંધકામ અને BOQ',
    solar: 'સોલર રૂફટોપ એન્જિન',
    dukandar_market: 'દુકાનદાર જથ્થાબંધ બજાર',
    naksha_vastu: 'નકશો અને વાસ્તુ સ્ટુડિયો',
    language: 'ભાષા',
    search: 'શોધો...',
    calculate: 'ગણતરી કરો',
    share: 'શેર કરો',
    downloadPdf: 'પીડીએફ ડાઉનલોડ કરો',
    groupCore: 'મુખ્ય વ્યવસ્થાપન'
  },
  kn: {
    siteTitle: '2click.in - ಸಿವಿಲ್, ಸೋಲಾರ್ ಮತ್ತು BOQ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್',
    services: 'ಸೇವೆಗಳು ಮತ್ತು BOQ',
    civilBoq: 'ಸಿವಿಲ್ BOQ ಕ್ಯಾಲ್ಕುಲೇಟರ್',
    home: 'ಹೋಮ್ / ಪೋರ್ಟಲ್',
    construction: 'ಸಿವಿಲ್ ನಿರ್ಮಾಣ ಮತ್ತು BOQ',
    solar: 'ಸೋಲಾರ್ ರೂಫ್‌ಟಾಪ್ ಇಂಜಿನ್',
    dukandar_market: 'ದುಕಾನದಾರ್ ಸಾಗಟ ಮಾರುಕಟ್ಟೆ',
    naksha_vastu: 'ನಕ್ಷಾ ಮತ್ತು ವಾಸ್ತು ಸ್ಟುಡಿಯೋ',
    language: 'ಭಾಷೆ',
    search: 'ಹುಡುಕಿ...',
    calculate: 'ಲೆಕ್ಕಹಾಕಿ',
    share: 'ಹಂಚಿಕೊಳ್ಳಿ',
    downloadPdf: 'PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    groupCore: 'ಮುಖ್ಯ ನಿರ್ವಹಣೆ'
  },
  ml: {
    siteTitle: '2click.in - സിവിൽ, സോളാർ & BOQ പ്ലാറ്റ്ഫോം',
    services: 'സേവനങ്ങൾ & BOQ',
    civilBoq: 'സിവിൽ BOQ കാൽക്കുലേറ്റർ',
    home: 'ഹോം / പോർട്ടൽ',
    construction: 'സിവിൽ കൺസ്ട്രക്ഷൻ & BOQ',
    solar: 'സോളാർ റൂഫ് ടോപ്പ്',
    naksha_vastu: 'പ്ലാൻ & വാസ്തു സ്റ്റുഡിയോ',
    language: 'ഭാഷ',
    search: 'തിരയുക...',
    calculate: 'കണക്കാക്കുക',
    share: 'പങ്കുവെക്കുക',
    downloadPdf: 'PDF ഡൗൺലോഡ് ചെയ്യുക'
  },
  or: {
    siteTitle: '2click.in - ସିଭିଲ୍, ସୋଲାର୍ ଏବଂ BOQ ପ୍ଲାଟଫର୍ମ',
    services: 'ସେବା ଏବଂ BOQ',
    civilBoq: 'ସିଭିଲ୍ BOQ କାଲକୁଲେଟର',
    home: 'ହୋମ୍ / ପୋର୍ଟାଲ୍',
    construction: 'ସିଭିଲ୍ କନଷ୍ଟ୍ରକ୍ସନ୍',
    solar: 'ସୋଲାର୍ ରୁଫଟପ୍',
    naksha_vastu: 'ନକ୍ସା ଏବଂ ବାସ୍ତୁ ସ୍ଟୁଡିଓ',
    language: 'ଭାଷା',
    search: 'ଖୋଜନ୍ତୁ...',
    calculate: 'ଗଣନା କରନ୍ତୁ',
    share: 'ସେୟାର୍ କରନ୍ତୁ',
    downloadPdf: 'PDF ଡାଉନଲୋଡ୍ କରନ୍ତୁ'
  },
  pa: {
    siteTitle: '2click.in - ਸਿਵਲ, ਸੋਲਰ ਅਤੇ BOQ ਪਲੇਟਫਾਰਮ',
    services: 'ਸੇਵਾਵਾਂ ਅਤੇ BOQ',
    civilBoq: 'ਸਿਵਲ BOQ ਕੈਲਕੁਲੇਟਰ',
    home: 'ਹੋਮ / ਪੋਰਟਲ',
    construction: 'ਸਿਵਲ ਉਸਾਰੀ',
    solar: 'ਸੋਲਰ ਰੂਫਟੌਪ',
    naksha_vastu: 'ਨਕਸ਼ਾ ਅਤੇ ਵਾਸਤੂ ਸਟੂਡੀਓ',
    language: 'ਭਾਸ਼ਾ',
    search: 'ਖੋਜੋ...',
    calculate: 'ਹਿਸਾਬ ਕਰੋ',
    share: 'ਸ਼ੇਅਰ ਕਰੋ',
    downloadPdf: 'PDF ਡਾਊਨਲੋਡ ਕਰੋ'
  },
  as: {
    siteTitle: '2click.in - চিভিল, ছ\'লাৰ আৰু BOQ প্লেটফৰ্ম',
    services: 'সেৱাসমূহ আৰু BOQ',
    home: 'হোম / প\'ৰ্টেল',
    construction: 'চিভিল নিৰ্মাণ',
    language: 'ভাষা'
  },
  mai: {
    siteTitle: '2click.in - सिविल, सोलर आ BOQ प्लेटफार्म',
    services: 'सेवा सभ आ BOQ',
    home: 'घर / पोर्टल',
    construction: 'सिविल निर्माण',
    language: 'भाषा'
  },
  sat: {
    siteTitle: '2click.in - BOQ ᱯᱞᱮᱴᱯᱷᱚᱨᱢ',
    services: 'ᱥᱮᱵᱟ BOQ',
    language: 'ᱯᱟᱹᱨᱥᱤ'
  },
  ks: {
    siteTitle: '2click.in - سول، سولر تہٕ BOQ پلیٹ فارم',
    services: 'خدمات تہٕ BOQ',
    language: 'زبانہٕ'
  },
  ne: {
    siteTitle: '2click.in - सिभिल, सोलार र BOQ प्लेटफर्म',
    services: 'सेवाहरू र BOQ',
    language: 'भाषा'
  },
  sd: {
    siteTitle: '2click.in - سول ۽ سائلر BOQ',
    services: 'خدمتون',
    language: 'ٻولي'
  },
  kok: {
    siteTitle: '2click.in - सिव्हिल आनी सोलर प्लॅटफॉर्म',
    services: 'सेवा आनी BOQ',
    language: 'भास'
  },
  doi: {
    siteTitle: '2click.in - सिविल ते सोलर प्लेटफार्म',
    services: 'सेवा ते BOQ',
    language: 'बोली'
  },
  mni: {
    siteTitle: '2click.in - सिविल অমসুং BOQ प्लेटफार्म',
    services: 'সেবা অমসুং BOQ',
    language: 'লোন্'
  },
  sa: {
    siteTitle: '2click.in - निर्माणं, सौरोर्जा च BOQ मञ्चम्',
    services: 'सेवाः च BOQ',
    language: 'भाषा'
  }
};

export const PHRASE_MAPPINGS: Record<string, Record<string, string>> = {
  'Exit Full Screen': {
    en: 'Exit Full Screen',
    hi: 'फ़ुल स्क्रीन बंद करें',
    bho: 'फ़ुल स्क्रीन बंद करीं',
    bn: 'ফুল স্ক্রিন বন্ধ করুন'
  },
  'Download Snapshot': {
    en: 'Download Snapshot',
    hi: 'स्नैपशॉट डाउनलोड करें',
    bho: 'स्नैपशॉट डाउनलोड करीं',
    bn: 'স্ন্যাপশট ডাউনলোড করুন'
  },
  'CORE MANAGEMENT': {
    en: 'CORE MANAGEMENT',
    hi: 'मुख्य प्रबंधन',
    bho: 'मुख्य प्रबंधन',
    bn: 'প্রধান পরিচালনা'
  },
  'ENGINEERING & TRADES': {
    en: 'ENGINEERING & TRADES',
    hi: 'इंजीनियरिंग एवं ट्रेंड्स',
    bho: 'इंजीनियरिंग अउर ट्रेड',
    bn: 'ইঞ্জিনিয়ারিং ও ট্রেডস'
  },
  'SUPPLY CHAIN & B2B MARKETPLACE': {
    en: 'SUPPLY CHAIN & B2B MARKETPLACE',
    hi: 'सप्लाई चेन एवं B2B मार्केट',
    bho: 'सप्लाई चेन अउर B2B मंडी',
    bn: 'সাপ্লাই চেইন ও B2B মার্কেট'
  }
};

export function getTranslation(langCode: string, key: string): string {
  const dict = UI_TRANSLATIONS[langCode] || UI_TRANSLATIONS['en'] || UI_TRANSLATIONS['hi'];
  if (dict && dict[key]) {
    return dict[key];
  }

  if (PHRASE_MAPPINGS[key]) {
    const pMap = PHRASE_MAPPINGS[key];
    if (pMap[langCode]) return pMap[langCode];
    if (pMap['en']) return pMap['en'];
    if (pMap['hi']) return pMap['hi'];
  }

  // Fallback to English dictionary
  if (UI_TRANSLATIONS['en'] && UI_TRANSLATIONS['en'][key]) {
    return UI_TRANSLATIONS['en'][key];
  }
  if (UI_TRANSLATIONS['hi'] && UI_TRANSLATIONS['hi'][key]) {
    return UI_TRANSLATIONS['hi'][key];
  }

  return key;
}
