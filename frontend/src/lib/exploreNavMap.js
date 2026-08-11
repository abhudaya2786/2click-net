/**
 * Master routing map — Explore dropdown & platform screen architecture.
 * Single source of truth for nav labels, routes, and functional logic.
 */

export const EXPLORE_MENU = [
  {
    id: "boq_builder",
    to: "/boq-builder",
    key: "nav.boq_builder",
    label: "Full BOQ",
    labelHi: "पूरा BOQ",
    actionEn: "Opens Full BOQ Calculator",
    actionHi: "पूरा BOQ कैलकुलेटर खोलता है",
    logicEn: "Civil, structural & finishing BOQ — PDF/Excel from built-up area.",
    logicHi: "बिल्ट-अप एरिया से civil, structural और finishing BOQ — PDF/Excel।",
  },
  {
    id: "interior_boq",
    to: "/interior-boq",
    key: "nav.interior_boq",
    label: "Interior BOQ",
    labelHi: "इंटीरियर BOQ",
    actionEn: "Interior Calculator",
    actionHi: "इंटीरियर कैलकुलेटर",
    logicEn: "Room count, woodwork, tiling, false ceiling itemized budget.",
    logicHi: "कमरे, वुडवर्क, टाइलिंग, फॉल्स सीलिंग का विस्तृत बजट।",
  },
  {
    id: "upcoming",
    to: "/upcoming-projects",
    key: "nav.upcoming",
    label: "Upcoming Projects",
    labelHi: "आगामी प्रोजेक्ट",
    actionEn: "Active projects / tenders board",
    actionHi: "सक्रिय प्रोजेक्ट / टेंडर बोर्ड",
    logicEn: "Location-wise ongoing projects — vendors place bids.",
    logicHi: "स्थान-वार प्रोजेक्ट — विक्रेता बोली लगाते हैं।",
  },
  {
    id: "advisory",
    to: "/property-advisory",
    key: "nav.advisory",
    label: "Property Advisory",
    labelHi: "प्रॉपर्टी सलाह",
    actionEn: "Real estate advisory",
    actionHi: "रियल एस्टेट सलाह",
    logicEn: "Land verification, legal guidance, consultant connect.",
    logicHi: "ज़मीन सत्यापन, कानूनी मार्गदर्शन, कंसल्टेंट।",
  },
  {
    id: "rental",
    to: "/equipment-rental",
    key: "nav.rental",
    label: "Equipment Rental",
    labelHi: "उपकरण रेंटल",
    actionEn: "Machinery & logistics rental",
    actionHi: "मशीनरी और लॉजिस्टिक्स रेंटल",
    logicEn: "JCB, crane, tipper listings — book/enquire modal.",
    logicHi: "JCB, क्रेन, टिपर — बुक/पूछताछ मोडल।",
  },
  {
    id: "consultants",
    to: "/consultants",
    label: "Consultants",
    labelHi: "कंसल्टेंट",
    actionEn: "Architect & engineer directory",
    actionHi: "वास्तुकार और इंजीनियर निर्देशिका",
    logicEn: "Filter by ratings, experience, category.",
    logicHi: "रेटिंग, अनुभव, श्रेणी से फ़िल्टर।",
  },
  {
    id: "marketplace",
    to: "/marketplace",
    label: "Marketplace",
    labelHi: "मार्केटप्लेस",
    actionEn: "Building material e-store",
    actionHi: "निर्माण सामग्री ई-स्टोर",
    logicEn: "Add to cart — cement, steel, bricks, finishing.",
    logicHi: "कार्ट — सीमेंट, स्टील, ईंट, finishing।",
  },
  {
    id: "freelancers",
    to: "/freelancers",
    label: "Freelancers",
    labelHi: "फ्रीलांसर",
    actionEn: "Talent network portal",
    actionHi: "टैलेंट नेटवर्क",
    logicEn: "Contractors, architects — search, hire, enquiry.",
    logicHi: "ठेकेदार, वास्तुकार — खोज, हायर, enquiry।",
  },
  {
    id: "services",
    to: "/services",
    label: "All Services",
    labelHi: "सभी सेवाएँ",
    actionEn: "Master service catalog",
    actionHi: "मास्टर सेवा कैटलॉग",
    logicEn: "Grid of all B2B and B2C offerings.",
    logicHi: "सभी B2B और B2C सेवाओं का ग्रिड।",
  },
  {
    id: "pricing",
    to: "/pricing",
    key: "nav.pricing",
    label: "Pricing",
    labelHi: "प्लान",
    actionEn: "Subscription / SaaS plans",
    actionHi: "सब्सक्रिप्शन / SaaS प्लान",
    logicEn: "Monthly/yearly tiers for vendors and premium users.",
    logicHi: "विक्रेता और प्रीमियम उपयोगकर्ता के लिए प्लान।",
  },
  {
    id: "enroll",
    to: "/enroll",
    label: "Enrollment",
    labelHi: "पंजीकरण",
    actionEn: "Onboarding wizard Step 1",
    actionHi: "ऑनबोर्डिंग चरण 1",
    logicEn: "User / Vendor / Shop role selection → 4-step flow.",
    logicHi: "यूज़र / विक्रेता / दुकान → 4-चरण फ्लो।",
  },
  {
    id: "become_vendor",
    to: "/become-vendor",
    label: "Become Vendor",
    labelHi: "विक्रेता बनें",
    actionEn: "Vendor onboarding landing",
    actionHi: "विक्रेता ऑनबोर्डिंग",
    logicEn: "Shop/vendor registration, WhatsApp, callback CRM.",
    logicHi: "दुकान/विक्रेता पंजीकरण, WhatsApp, कॉलबैक।",
  },
  {
    id: "contact",
    to: "/contact",
    label: "Contact",
    labelHi: "संपर्क",
    actionEn: "Support & inquiry desk",
    actionHi: "सहायता और संपर्क",
    logicEn: "Ticketing, customer service, WhatsApp contact.",
    logicHi: "टिकट, सपोर्ट, WhatsApp संपर्क।",
  },
];

/** Extended super-app links (after core Explore items) */
export const EXPLORE_EXTENDED = [
  { to: "/store", key: "materials", label: "Material Store", labelHi: "मटेरियल स्टोर" },
  { to: "/mart", key: "nav.mart", label: "Super Mart", labelHi: "सुपर मार्ट" },
  { to: "/tenders", key: "nav.tenders", label: "Tenders", labelHi: "टेंडर" },
  { to: "/solar", key: "solar", label: "Solar", labelHi: "सोलर" },
  { to: "/material-calculator", label: "Material Calculator", labelHi: "सामग्री कैलकुलेटर" },
  { to: "/professionals", key: "professionals", label: "Professionals Hub", labelHi: "पेशेवर हब" },
  { to: "/technology", label: "3D / LiDAR / VR", labelHi: "3D / LiDAR / VR" },
  { to: "/about", key: "about", label: "About", labelHi: "हमारे बारे में" },
  { to: "/platform", label: "Platform Guide", labelHi: "प्लेटफ़ॉर्म गाइड" },
];

export const ENROLLMENT_FLOW = {
  stepsEn: ["User type", "Details / KYC", "Agreements", "Account & dashboard"],
  stepsHi: ["यूज़र प्रकार", "विवरण / KYC", "समझौते", "खाता और डैशबोर्ड"],
  modes: [
    { id: "user", en: "Individual User", hi: "व्यक्तिगत उपयोगकर्ता", descEn: "Buy, tender, solar quotes", descHi: "खरीदें, टेंडर, सोलर" },
    { id: "vendor", en: "Vendor Business", hi: "विक्रेता व्यवसाय", descEn: "Sell materials & bid tenders", descHi: "सामग्री बेचें और बोली" },
    { id: "shop", en: "Shop Enrollment", hi: "दुकान पंजीकरण", descEn: "Register physical shop", descHi: "भौतिक दुकान पंजीकरण" },
  ],
};

export const VENDOR_ONBOARDING_STEPS = [
  { en: "Fill form", hi: "फॉर्म भरें" },
  { en: "Submit documents", hi: "दस्तावेज़ जमा" },
  { en: "Verification", hi: "सत्यापन" },
  { en: "Store live", hi: "स्टोर लाइव" },
];

export const EQUIPMENT_MODULES = {
  tabs: [
    { id: "all", en: "All rental", hi: "सभी रेंटल" },
    { id: "logistics", en: "Logistics & transport", hi: "लॉजिस्टिक्स और ट्रांसपोर्ट" },
  ],
  categoriesEn: ["JCB & Earthmoving", "Crane & Lifting", "Concrete", "Tipper & Dumper", "Flatbed haulage", "Generator", "Scaffolding", "Material delivery", "Specialized"],
};

export const FREELANCER_MODULE = {
  searchPlaceholderEn: "Search by name, skill, or city…",
  searchPlaceholderHi: "नाम, स्किल या शहर से खोजें…",
  emptyEn: "No professionals found yet. Try a different search.",
  emptyHi: "कोई पेशेवर नहीं मिला। खोज बदलें।",
};
