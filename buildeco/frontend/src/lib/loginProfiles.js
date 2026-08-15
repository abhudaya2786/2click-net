import {
  ShoppingBag, Store, HardHat, Compass, Shield, Home, Gavel, Sun, Calculator, Package, Inbox,
} from "lucide-react";

/** Role-based login profiles — drives panel copy + demo accounts */
export const LOGIN_PROFILES = [
  {
    id: "customer",
    role: "customer",
    label: "Customer",
    labelHi: "ग्राहक",
    subtitle: "Buy materials & build your home",
    subtitleHi: "सामग्री खरीदें और घर बनाएं",
    icon: ShoppingBag,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/30",
    features: [
      { icon: Home, en: "Mera Ghar — naksha to griha pravesh", hi: "मेरा घर — पूरा निर्माण सफर" },
      { icon: ShoppingBag, en: "Marketplace & cart checkout", hi: "मार्केटप्लेस और ऑर्डर" },
      { icon: Sun, en: "Solar EPC quotes", hi: "सोलर EPC अनुमान" },
      { icon: Gavel, en: "Post & track tenders", hi: "टेंडर पोस्ट करें" },
    ],
    demo: { email: "customer@buildecogroup.com", password: "Demo@12345", name: "Priya Sharma" },
    dashboard: "Customer Dashboard",
  },
  {
    id: "vendor",
    role: "vendor",
    label: "Vendor",
    labelHi: "विक्रेता",
    subtitle: "Sell materials & bid on tenders",
    subtitleHi: "सामग्री बेचें और टेंडर बिड करें",
    icon: Store,
    color: "text-tender",
    bg: "bg-tender/10 border-tender/30",
    features: [
      { icon: Package, en: "Product catalog & orders", hi: "प्रोडक्ट लिस्टिंग और ऑर्डर" },
      { icon: Inbox, en: "Anonymous RFQ inbox", hi: "ग्राहक RFQ इनबॉक्स" },
      { icon: Gavel, en: "Live tender bidding", hi: "लाइव टेंडर बिडिंग" },
      { icon: Sun, en: "Solar brand catalog", hi: "सोलर ब्रांड कैटलॉग" },
    ],
    demo: { email: "vendor@buildecogroup.com", password: "Demo@12345", name: "Anil Steel Traders" },
    dashboard: "Vendor Portal",
  },
  {
    id: "contractor",
    role: "contractor",
    label: "Contractor",
    labelHi: "ठेकेदार",
    subtitle: "Manage projects, BOQ & DPR",
    subtitleHi: "प्रोजेक्ट, BOQ और DPR",
    icon: HardHat,
    color: "text-solar",
    bg: "bg-solar/10 border-solar/30",
    features: [
      { icon: Calculator, en: "BOQ & Super Mart rates", hi: "BOQ और मटेरियल रेट" },
      { icon: Home, en: "Home lifecycle for clients", hi: "ग्राहक का घर प्रोजेक्ट" },
      { icon: Gavel, en: "Tender bidding", hi: "टेंडर बिडिंग" },
      { icon: HardHat, en: "Daily progress reports", hi: "दैनिक प्रगति रिपोर्ट" },
    ],
    demo: { email: "contractor@buildecogroup.com", password: "Demo@12345", name: "Rajesh Constructions" },
    dashboard: "Contractor Workspace",
  },
  {
    id: "architect",
    role: "architect",
    userType: "architect",
    label: "Architect",
    labelHi: "वास्तुकार",
    subtitle: "Design, BOQ & client enquiries",
    subtitleHi: "डिज़ाइन, BOQ और ग्राहक",
    icon: Compass,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/30",
    features: [
      { icon: Compass, en: "Architect studio workspace", hi: "आर्किटेक्ट स्टूडियो" },
      { icon: Sun, en: "Solar EPC designer", hi: "सोलर EPC डिज़ाइन" },
      { icon: Inbox, en: "Client enquiries", hi: "ग्राहक पूछताछ" },
      { icon: Gavel, en: "Consultancy tenders", hi: "परामर्श टेंडर" },
    ],
    demo: { email: "architect@buildecogroup.com", password: "Demo@12345", name: "Demo Architect" },
    dashboard: "Freelancer Workspace",
  },
  {
    id: "admin",
    role: "super_admin",
    label: "Admin",
    labelHi: "एडमिन",
    subtitle: "Platform control & analytics",
    subtitleHi: "प्लेटफ़ॉर्म नियंत्रण",
    icon: Shield,
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/30",
    features: [
      { icon: Shield, en: "Users, roles & RBAC", hi: "यूज़र और अनुमति" },
      { icon: Store, en: "Super Mart rate control", hi: "मटेरियल रेट कंट्रोल" },
      { icon: Gavel, en: "Tender & RFQ oversight", hi: "टेंडर और RFQ" },
      { icon: Home, en: "Home build admin", hi: "होम बिल्ड एडमिन" },
    ],
    demo: null,
    adminNote: "Use your admin email & password",
    adminNoteHi: "अपना एडमिन ईमेल और पासवर्ड उपयोग करें",
    dashboard: "Super Admin Panel",
  },
];

export function getProfile(id) {
  return LOGIN_PROFILES.find((p) => p.id === id) || LOGIN_PROFILES[0];
}

/** Merge /user-types into the login role grid (skip admin). */
export function profilesFromUserTypes(types) {
  const publicProfiles = LOGIN_PROFILES.filter((p) => p.id !== "admin");
  const known = new Set(publicProfiles.map((p) => p.id));
  const extra = [];
  for (const ut of types || []) {
    const code = ut?.code;
    if (!code || known.has(code) || code === "super_admin" || code === "admin") continue;
    extra.push({
      id: code,
      role: ut.role || code,
      userType: code,
      label: ut.label || code,
      labelHi: ut.label || code,
      subtitle: ut.label || code,
      subtitleHi: ut.label || code,
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/30",
      features: [{ icon: Package, en: `${ut.label || code} workspace`, hi: ut.label || code }],
      demo: null,
      dashboard: ut.default_dashboard || ut.label || code,
    });
  }
  extra.sort((a, b) => a.label.localeCompare(b.label));
  return publicProfiles.concat(extra);
}
