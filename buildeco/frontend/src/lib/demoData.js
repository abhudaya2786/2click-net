/** Client-side demo samples when API is offline or ?demo=1 */

const IMG = {
  plumbing: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800",
  electrical: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
  paint: "https://images.unsplash.com/photo-1589939705383-27aebcfb7259?w=800",
  kitchen: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800",
  tiles: "https://images.unsplash.com/photo-1647102256335-7a7370d99924?w=800",
  cement: "https://images.unsplash.com/photo-1581094790879-aeaee3f07ae2?w=800",
};

export const DEMO_FEATURES = [
  { id: "store", path: "/store", en: "Construction Store", hi: "कंस्ट्रक्शन स्टोर", descEn: "Browse brands like Myntra", descHi: "Myntra जैसा ब्राउज़", icon: "store" },
  { id: "boq", path: "/boq-builder", en: "Full Home BOQ", hi: "पूरा घर BOQ", descEn: "Kitchen, bath, plumber…", descHi: "किचन, बाथ, प्लंबर…", icon: "boq" },
  { id: "interior", path: "/interior-boq", en: "Interior BOQ", hi: "इंटीरियर BOQ", descEn: "Tiles, ceiling, PVC", descHi: "टाइल्स, सीलिंग, PVC", icon: "interior" },
  { id: "mart", path: "/mart", en: "Super Mart", hi: "सुपर मार्ट", descEn: "Live brand rates", descHi: "लाइव ब्रांड दर", icon: "mart" },
  { id: "tenders", path: "/tenders", en: "Tender Hub", hi: "टेंडर", descEn: "Live auctions", descHi: "लाइव ऑक्शन", icon: "tenders" },
  { id: "upcoming", path: "/upcoming-projects", en: "Upcoming Projects", hi: "आगामी प्रोजेक्ट", descEn: "Plots by city & BHK", descHi: "शहर और BHK वाइज प्लॉट", icon: "upcoming" },
  { id: "advisory", path: "/property-advisory", en: "Property Advisory", hi: "प्रॉपर्टी सलाह", descEn: "Expert + real estate guide", descHi: "विशेषज्ञ रियल एस्टेट गाइड", icon: "advisory" },
  { id: "rental", path: "/equipment-rental", en: "Equipment Rental", hi: "उपकरण रेंटल", descEn: "JCB, crane, logistics", descHi: "JCB, क्रेन, लॉजिस्टिक्स", icon: "rental" },
  { id: "solar", path: "/solar", en: "Solar EPC", hi: "सोलर EPC", descEn: "Subsidy & EMI", descHi: "सब्सिडी और EMI", icon: "solar" },
  { id: "enroll", path: "/enroll", en: "Enrollment", hi: "पंजीकरण", descEn: "Shop & user signup", descHi: "दुकान पंजीकरण", icon: "enroll" },
  { id: "customer", path: "/dashboard", en: "Customer Demo", hi: "ग्राहक डेमो", descEn: "Mera Ghar dashboard", descHi: "मेरा घर डैशबोर्ड", icon: "customer", loginProfile: "customer" },
  { id: "vendor", path: "/dashboard", en: "Vendor Demo", hi: "विक्रेता डेमो", descEn: "Orders & catalog", descHi: "ऑर्डर और कैटलॉग", icon: "vendor", loginProfile: "vendor" },
  { id: "contractor", path: "/dashboard", en: "Contractor Demo", hi: "ठेकेदार डेमो", descEn: "Projects & BOQ", descHi: "प्रोजेक्ट और BOQ", icon: "contractor", loginProfile: "contractor" },
  { id: "architect", path: "/dashboard", en: "Architect Demo", hi: "वास्तुकार डेमो", descEn: "Design studio & enquiries", descHi: "डिज़ाइन स्टूडियो", icon: "architect", loginProfile: "architect" },
];

export const DEMO_BOQ_SECTIONS = [
  { id: "plumbing", name: "Plumber Store", name_hi: "प्लंबर स्टोर", image: IMG.plumbing, item_count: 18 },
  { id: "electrical", name: "Electrical, Wire & Switch", name_hi: "इलेक्ट्रिकल, वायर, स्विच", image: IMG.electrical, item_count: 24 },
  { id: "paint_putty", name: "Paint & Putty", name_hi: "पेंट और पुट्टी", image: IMG.paint, item_count: 16 },
  { id: "pvc_panel", name: "PVC Panel & Ceiling", name_hi: "PVC पैनल", image: IMG.tiles, item_count: 12 },
  { id: "interior", name: "Interior & Décor", name_hi: "इंटीरियर", image: IMG.kitchen, item_count: 20 },
  { id: "kitchen", name: "Kitchen", name_hi: "किचन", image: IMG.kitchen, item_count: 35 },
  { id: "bathroom", name: "Bathroom", name_hi: "बाथरूम", image: IMG.plumbing, item_count: 28 },
  { id: "bedroom", name: "Bedroom", name_hi: "बेडरूम", image: IMG.kitchen, item_count: 22 },
  { id: "lobby", name: "Lobby / Living", name_hi: "लॉबी", image: IMG.kitchen, item_count: 25 },
  { id: "tv_panel", name: "TV Panel & Feature Wall", name_hi: "TV पैनल", image: IMG.kitchen, item_count: 15 },
  { id: "tiles", name: "Tiles & Flooring", name_hi: "टाइल्स", image: IMG.tiles, item_count: 30 },
  { id: "civil", name: "Civil & Structure", name_hi: "सिविल", image: IMG.cement, item_count: 40 },
  { id: "fabrication", name: "Fabrication / MS-SS", name_hi: "फैब्रिकेशन", image: IMG.cement, item_count: 38 },
];

const DEMO_PRESETS = {
  plumbing: [
    { category: "Plumbing", name: "CPVC Pipe", qty: 80, rate: 105, brand: "Prince", unit: "meter" },
    { category: "Plumbing", name: "PVC Pipe", qty: 40, rate: 85, brand: "Prince", unit: "meter" },
    { category: "Plumbing", name: "Water Tank 1000L", qty: 1, rate: 6200, brand: "Plasto", unit: "piece" },
  ],
  electrical: [
    { category: "Electrical", name: "Wire 2.5 sqmm", qty: 350, rate: 32, brand: "Polycab", unit: "meter" },
    { category: "Electrical", name: "Modular Switch", qty: 30, rate: 55, brand: "GM", unit: "piece" },
    { category: "Electrical", name: "LED Panel Light 18W", qty: 12, rate: 580, brand: "Syska", unit: "piece" },
  ],
  paint_putty: [
    { category: "Paint", name: "Interior Emulsion", qty: 80, rate: 250, brand: "Nerolac", unit: "litre" },
    { category: "Paint", name: "Wall Putty", qty: 120, rate: 38, brand: "Nerolac", unit: "kg" },
  ],
  kitchen: [
    { category: "Interior Decoration", name: "Modular Kitchen Base Unit", qty: 70, rate: 2100, brand: "Godrej Interio", unit: "sqft" },
    { category: "Tiles", name: "Vitrified Tile", qty: 90, rate: 58, brand: "Nitco", unit: "sqft" },
  ],
  bathroom: [
    { category: "Tiles", name: "Wall Tile", qty: 120, rate: 46, brand: "Johnson", unit: "sqft" },
    { category: "Renovation", name: "Bathroom Renovation Package", qty: 1, rate: 95000, brand: "Local Contractor", unit: "set" },
  ],
  civil: [
    { category: "Cement", name: "OPC 53 Grade", qty: 200, rate: 395, brand: "JK Lakshmi", unit: "bag" },
    { category: "Steel & TMT", name: "TMT Bar Fe500", qty: 2500, rate: 62, brand: "Kamdhenu", unit: "kg" },
  ],
  fabrication: [
    { category: "Fabrication", name: "MS Gate Fabrication", qty: 80, rate: 650, brand: "Local MS", unit: "sqft" },
    { category: "Fabrication", name: "SS Railing", qty: 50, rate: 720, brand: "Local SS", unit: "rft" },
    { category: "Fabrication", name: "MS Grill Window", qty: 60, rate: 420, brand: "Local MS", unit: "sqft" },
    { category: "Fabrication", name: "Welding Rod 12mm", qty: 25, rate: 125, brand: "Local", unit: "kg" },
  ],
};

export const DEMO_STORE_ITEMS = [
  { id: "demo-mat-1", name: "OPC 53 Grade Cement", brand: "UltraTech", category: "Cement", price: 420, unit: "bag", rating: 4.6, source: "material", image: IMG.cement },
  { id: "demo-mat-2", name: "TMT Bar Fe500", brand: "TATA Tiscon", category: "Steel & TMT", price: 68, unit: "kg", rating: 4.7, source: "material", image: IMG.cement },
  { id: "demo-mat-3", name: "Vitrified Tile", brand: "Kajaria", category: "Tiles", price: 65, unit: "sqft", rating: 4.5, source: "material", image: IMG.tiles },
  { id: "demo-mat-4", name: "Interior Emulsion", brand: "Asian Paints", category: "Paint", price: 280, unit: "litre", rating: 4.4, source: "material", image: IMG.paint },
  { id: "demo-mat-5", name: "CPVC Pipe", brand: "Astral", category: "Plumbing", price: 120, unit: "meter", rating: 4.3, source: "material", image: IMG.plumbing },
  { id: "demo-mat-6", name: "Modular Switch", brand: "Havells", category: "Electrical", price: 85, unit: "piece", rating: 4.5, source: "material", image: IMG.electrical },
  { id: "demo-mat-7", name: "PVC Ceiling Panel", brand: "Prince", category: "False Ceiling", price: 75, unit: "sqft", rating: 4.2, source: "material", image: IMG.tiles },
  { id: "demo-mat-8", name: "Wall Putty", brand: "Berger", category: "Paint", price: 40, unit: "kg", rating: 4.4, source: "material", image: IMG.paint },
];

export const DEMO_MART_MATERIALS = DEMO_STORE_ITEMS.map((i) => ({
  id: i.id,
  name: i.name,
  brand: i.brand,
  category: i.category,
  rate: i.price,
  unit: i.unit,
  image: i.image,
  rate_history: [{ date: "2026-01-01", rate: i.price - 5 }, { date: "2026-08-01", rate: i.price }],
}));

export const DEMO_INTERIOR_VERTICALS = [
  { id: "interior_decoration", name: "Interior Decoration", name_hi: "इंटीरियर", image: IMG.kitchen, product_count: 12, brand_count: 8, from_rate: 78, from_unit: "sqft", from_brand: "Asian Paints" },
  { id: "tiles", name: "Tiles", name_hi: "टाइल्स", image: IMG.tiles, product_count: 15, brand_count: 6, from_rate: 42, from_unit: "sqft", from_brand: "Somany" },
  { id: "false_ceiling", name: "False Ceiling", name_hi: "फॉल्स सीलिंग", image: IMG.tiles, product_count: 10, brand_count: 5, from_rate: 78, from_unit: "sqft", from_brand: "Local POP" },
  { id: "pvc_work", name: "PVC Work", name_hi: "PVC वर्क", image: IMG.plumbing, product_count: 11, brand_count: 4, from_rate: 24, from_unit: "meter", from_brand: "Prince" },
  { id: "renovation", name: "Renovation", name_hi: "रेनोवेशन", image: IMG.kitchen, product_count: 8, brand_count: 3, from_rate: 95000, from_unit: "set", from_brand: "Local" },
  { id: "gardening", name: "Gardening", name_hi: "गार्डनिंग", image: IMG.kitchen, product_count: 9, brand_count: 4, from_rate: 75, from_unit: "sqft", from_brand: "Local" },
  { id: "vastu", name: "Vastu", name_hi: "वास्तु", image: IMG.kitchen, product_count: 6, brand_count: 3, from_rate: 2500, from_unit: "visit", from_brand: "Online Vastu" },
  { id: "fabrication", name: "Fabrication", name_hi: "फैब्रिकेशन", image: IMG.cement, product_count: 38, brand_count: 12, from_rate: 420, from_unit: "sqft", from_brand: "Local MS" },
];

export function demoBoqCatalog(sectionId) {
  const presets = DEMO_PRESETS[sectionId] || DEMO_PRESETS.plumbing;
  const products = presets.map((p) => ({
    name: p.name,
    category: p.category,
    unit: p.unit,
    image: IMG.plumbing,
    from_rate: p.rate,
    cheapest_id: `demo-${sectionId}-${p.name}`,
    brands: [{ id: `demo-${sectionId}-${p.name}`, brand: p.brand, rate: p.rate, unit: p.unit, image: IMG.plumbing, name: p.name }],
  }));
  const sec = DEMO_BOQ_SECTIONS.find((s) => s.id === sectionId);
  return { section: sec, products };
}

export function demoGenerateBOQ(sectionIds, manualLines = []) {
  const resolved = [];
  const sectionTotals = {};
  const grouped = {};

  const addLine = (line, sid, secName) => {
    const amount = Math.round(line.rate * line.qty * 100) / 100;
    const full = { ...line, section_id: sid, section_name: secName, amount, material_id: line.material_id || `demo-${sid}` };
    resolved.push(full);
    sectionTotals[sid] = Math.round((sectionTotals[sid] || 0) + amount * 100) / 100;
    const key = sid || "general";
    if (!grouped[key]) grouped[key] = { section_id: sid, section_name: secName, lines: [], total: 0 };
    grouped[key].lines.push(full);
    grouped[key].total = Math.round(grouped[key].total + amount * 100) / 100;
  };

  manualLines.forEach((l) => {
    const sec = DEMO_BOQ_SECTIONS.find((s) => s.id === l.section_id);
    addLine(l, l.section_id, sec?.name || "Manual");
  });

  sectionIds.forEach((sid) => {
    if (sectionTotals[sid]) return;
    const sec = DEMO_BOQ_SECTIONS.find((s) => s.id === sid);
    const presets = DEMO_PRESETS[sid] || [];
    presets.forEach((p) => {
      addLine({ name: p.name, brand: p.brand, category: p.category, unit: p.unit, rate: p.rate, qty: p.qty }, sid, sec?.name);
    });
  });

  const total = Object.values(grouped).reduce((s, g) => s + g.total, 0);
  return {
    groups: Object.values(grouped),
    lines: resolved,
    section_totals: sectionTotals,
    total: Math.round(total * 100) / 100,
    line_count: resolved.length,
    demo: true,
  };
}

export function withDemoParam(path) {
  if (!path) return "/?demo=1";
  return path.includes("?") ? `${path}&demo=1` : `${path}?demo=1`;
}

const UPC_IMG = {
  plot: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
  apt: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
  villa: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
  township: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
};

export const DEMO_UPCOMING_META = {
  project_types: [
    { id: "residential_plot", name: "Residential Plot", name_hi: "आवासीय प्लॉट" },
    { id: "apartment", name: "Apartment / Flat", name_hi: "अपार्टमेंट / फ्लैट" },
    { id: "villa", name: "Villa / Bungalow", name_hi: "विला / बंगला" },
    { id: "township", name: "Township", name_hi: "टाउनशिप" },
    { id: "commercial", name: "Commercial", name_hi: "कॉमर्शियल" },
    { id: "industrial", name: "Industrial / Shed", name_hi: "औद्योगिक / शेड" },
  ],
  bhk_options: [
    { id: "1", label: "1 BHK", label_hi: "1 BHK" },
    { id: "2", label: "2 BHK", label_hi: "2 BHK" },
    { id: "3", label: "3 BHK", label_hi: "3 BHK" },
    { id: "4", label: "4 BHK", label_hi: "4 BHK" },
    { id: "5+", label: "5+ BHK", label_hi: "5+ BHK" },
    { id: "plot", label: "Plot only", label_hi: "केवल प्लॉट" },
  ],
  requirement_tags: [
    { id: "gated", name: "Gated community", name_hi: "गेटेड कम्युनिटी" },
    { id: "corner_plot", name: "Corner plot", name_hi: "कॉर्नर प्लॉट" },
    { id: "near_metro", name: "Near metro / highway", name_hi: "मेट्रो / हाईवे के पास" },
    { id: "loan_approved", name: "Bank loan approved", name_hi: "बैंक लोन स्वीकृत" },
    { id: "vastu_compliant", name: "Vastu compliant", name_hi: "वास्तु अनुकूल" },
    { id: "under_construction", name: "Under construction", name_hi: "निर्माणाधीन" },
    { id: "pre_launch", name: "Pre-launch offer", name_hi: "प्री-लॉन्च ऑफर" },
    { id: "club_house", name: "Club house / amenities", name_hi: "क्लब हाउस / सुविधाएँ" },
    { id: "green_zone", name: "Green / open area", name_hi: "हरित / खुला क्षेत्र" },
  ],
  statuses: [
    { id: "upcoming", name: "Upcoming", name_hi: "आगामी" },
    { id: "launching_soon", name: "Launching soon", name_hi: "जल्द लॉन्च" },
    { id: "pre_launch", name: "Pre-launch", name_hi: "प्री-लॉन्च" },
    { id: "under_construction", name: "Under construction", name_hi: "निर्माणाधीन" },
  ],
  states: ["Maharashtra", "Uttar Pradesh", "Haryana", "Karnataka", "Telangana", "Gujarat", "West Bengal", "Rajasthan", "Delhi", "Tamil Nadu"],
};

export const DEMO_UPCOMING_PROJECTS = [
  {
    id: "demo-upc-1", slug: "pune-hinjewadi-plots",
    title: "Hinjewadi Green Plots Phase II", title_hi: "हिंजेवाड़ी ग्रीन प्लॉट्स फेज II",
    developer: "Maharashtra Housing Co.", state: "Maharashtra", city: "Pune", area: "Hinjewadi", pincode: "411057",
    location_label: "Hinjewadi, Pune, Maharashtra",
    project_type: "residential_plot", project_type_name: "Residential Plot", project_type_name_hi: "आवासीय प्लॉट",
    bhk: "plot", bhk_label: "Plot only", bhk_label_hi: "केवल प्लॉट",
    budget_min: 4500000, budget_max: 7200000, price_label: "₹45–72 Lakh",
    status: "launching_soon", status_name: "Launching soon", status_name_hi: "जल्द लॉन्च",
    launch_date: "2026-09-01", requirement_tags: ["gated", "corner_plot", "loan_approved", "green_zone"],
    highlights_en: ["DTCP approved", "15 min from IT park"], highlights_hi: ["DTCP स्वीकृत", "आईटी पार्क से 15 मिनट"],
    image: UPC_IMG.plot, featured: true,
  },
  {
    id: "demo-upc-2", slug: "mumbai-thane-3bhk",
    title: "Thane Skyline Residences — 3 BHK", title_hi: "ठाणे स्काईलाइन रेजिडेंस — 3 BHK",
    developer: "Western Build Corp", state: "Maharashtra", city: "Mumbai", area: "Thane West", pincode: "400601",
    location_label: "Thane West, Mumbai, Maharashtra",
    project_type: "apartment", project_type_name: "Apartment / Flat", project_type_name_hi: "अपार्टमेंट / फ्लैट",
    bhk: "3", bhk_label: "3 BHK", bhk_label_hi: "3 BHK",
    budget_min: 12500000, budget_max: 15800000, price_label: "₹1.25–1.58 Cr",
    status: "under_construction", status_name: "Under construction", status_name_hi: "निर्माणाधीन",
    launch_date: "2025-06-01", requirement_tags: ["gated", "near_metro", "club_house", "under_construction"],
    highlights_en: ["RERA registered", "Metro 800 m"], highlights_hi: ["RERA पंजीकृत", "मेट्रो 800 मी"],
    image: UPC_IMG.apt, featured: true,
  },
  {
    id: "demo-upc-3", slug: "noida-sector-150-villa",
    title: "Sector 150 Luxury Villas", title_hi: "सेक्टर 150 लक्ज़री विला",
    developer: "NCR Premium Homes", state: "Uttar Pradesh", city: "Noida", area: "Sector 150", pincode: "201301",
    location_label: "Sector 150, Noida, Uttar Pradesh",
    project_type: "villa", project_type_name: "Villa / Bungalow", project_type_name_hi: "विला / बंगला",
    bhk: "4", bhk_label: "4 BHK", bhk_label_hi: "4 BHK",
    budget_min: 28000000, budget_max: 42000000, price_label: "₹2.8–4.2 Cr",
    status: "pre_launch", status_name: "Pre-launch", status_name_hi: "प्री-लॉन्च",
    launch_date: "2026-11-15", requirement_tags: ["gated", "vastu_compliant", "pre_launch", "club_house"],
    highlights_en: ["Golf course facing", "Private garden"], highlights_hi: ["गोल्फ कोर्स फेसिंग", "निजी गार्डन"],
    image: UPC_IMG.villa, featured: true,
  },
  {
    id: "demo-upc-4", slug: "gurugram-sector-92-2bhk",
    title: "Sector 92 Affordable 2 BHK", title_hi: "सेक्टर 92 किफायती 2 BHK",
    developer: "Haryana Urban Dev", state: "Haryana", city: "Gurugram", area: "Sector 92", pincode: "122001",
    location_label: "Sector 92, Gurugram, Haryana",
    project_type: "apartment", project_type_name: "Apartment / Flat", project_type_name_hi: "अपार्टमेंट / फ्लैट",
    bhk: "2", bhk_label: "2 BHK", bhk_label_hi: "2 BHK",
    budget_min: 6800000, budget_max: 8200000, price_label: "₹68–82 Lakh",
    status: "upcoming", status_name: "Upcoming", status_name_hi: "आगामी",
    launch_date: "2026-10-01", requirement_tags: ["loan_approved", "near_metro", "under_construction"],
    highlights_en: ["PM Awas eligible", "Dwarka expressway 5 km"], highlights_hi: ["पीएम आवास योग्य", "द्वारका एक्सप्रेसवे 5 किमी"],
    image: UPC_IMG.apt, featured: true,
  },
  {
    id: "demo-upc-5", slug: "bengaluru-whitefield-township",
    title: "Whitefield Integrated Township", title_hi: "व्हाइटफील्ड इंटीग्रेटेड टाउनशिप",
    developer: "Karnataka Land Dev", state: "Karnataka", city: "Bengaluru", area: "Whitefield", pincode: "560066",
    location_label: "Whitefield, Bengaluru, Karnataka",
    project_type: "township", project_type_name: "Township", project_type_name_hi: "टाउनशिप",
    bhk: "3", bhk_label: "3 BHK", bhk_label_hi: "3 BHK",
    budget_min: 9500000, budget_max: 18500000, price_label: "₹95 Lakh–1.85 Cr",
    status: "under_construction", status_name: "Under construction", status_name_hi: "निर्माणाधीन",
    launch_date: "2025-03-01", requirement_tags: ["gated", "club_house", "green_zone", "under_construction"],
    highlights_en: ["IT corridor", "Hospital on-site"], highlights_hi: ["आईटी कॉरिडोर", "अस्पताल ऑन-साइट"],
    image: UPC_IMG.township, featured: false,
  },
  {
    id: "demo-upc-6", slug: "gorakhpur-affordable-plots",
    title: "Gorakhpur Affordable Plots", title_hi: "गोरखपुर किफायती प्लॉट",
    developer: "Eastern UP Housing", state: "Uttar Pradesh", city: "Gorakhpur", area: "Basharatpur", pincode: "273001",
    location_label: "Basharatpur, Gorakhpur, Uttar Pradesh",
    project_type: "residential_plot", project_type_name: "Residential Plot", project_type_name_hi: "आवासीय प्लॉट",
    bhk: "plot", bhk_label: "Plot only", bhk_label_hi: "केवल प्लॉट",
    budget_min: 1800000, budget_max: 2800000, price_label: "₹18–28 Lakh",
    status: "upcoming", status_name: "Upcoming", status_name_hi: "आगामी",
    launch_date: "2026-09-15", requirement_tags: ["loan_approved", "green_zone", "vastu_compliant"],
    highlights_en: ["PM Awas linked", "Main road 200 m"], highlights_hi: ["पीएम आवास लिंक्ड", "मुख्य सड़क 200 मी"],
    image: UPC_IMG.plot, featured: false,
  },
];

export const DEMO_PROPERTY_ADVISORY_META = {
  property_needs: [
    { id: "new_building", name: "New building construction", name_hi: "नया बिल्डिंग निर्माण", desc: "Land to handover", desc_hi: "जमीन से हैंडOver" },
    { id: "residential_plot", name: "Residential plot", name_hi: "आवासीय प्लॉट", desc: "Land purchase", desc_hi: "जमीन खरीद" },
    { id: "commercial_space", name: "Commercial property", name_hi: "कॉमर्शियल", desc: "Office, retail", desc_hi: "ऑफिस, रिटेल" },
    { id: "industrial_shed", name: "Industrial shed", name_hi: "औद्योगिक शेड", desc: "Factory, warehouse", desc_hi: "फैक्टरी, गोदाम" },
    { id: "villa_home", name: "Villa / home", name_hi: "विला / घर", desc: "Custom build", desc_hi: "कस्टम निर्माण" },
    { id: "apartment_flat", name: "Apartment", name_hi: "अपार्टमेंट", desc: "Flat purchase", desc_hi: "फ्लैट खरीद" },
    { id: "renovation", name: "Renovation", name_hi: "नवीनीकरण", desc: "Remodel", desc_hi: "रीमॉडल" },
    { id: "township", name: "Township", name_hi: "टाउनशिप", desc: "Large project", desc_hi: "बड़ा प्रोजेक्ट" },
  ],
  timelines: [
    { id: "urgent", label: "Within 3 months", label_hi: "3 महीने के अंदर" },
    { id: "short", label: "3–6 months", label_hi: "3–6 महीने" },
    { id: "medium", label: "6–12 months", label_hi: "6–12 महीने" },
    { id: "long", label: "1–2 years", label_hi: "1–2 वर्ष" },
    { id: "planning", label: "Planning only", label_hi: "केवल योजना" },
  ],
  client_types: [
    { id: "company", label: "Company / developer", label_hi: "कंपनी / डेवलपर" },
    { id: "individual", label: "Individual / family", label_hi: "व्यक्ति / परिवार" },
    { id: "contractor", label: "Contractor", label_hi: "ठेकेदार" },
    { id: "investor", label: "Investor", label_hi: "निवेशक" },
  ],
};

const DEMO_GUIDANCE_NEW_BUILDING = [
  { step: 1, title_en: "Site & land advisory", title_hi: "साइट और जमीन सलाह", detail_en: "Title, zoning, utilities.", detail_hi: "टाइटल, ज़ोनिंग, उपयोगिताएँ।", tools: ["/upcoming-projects", "/consultants"] },
  { step: 2, title_en: "Architectural naksha", title_hi: "आर्किटेक्ट नक्शा", detail_en: "Plans, 3D, FAR compliance.", detail_hi: "प्लान, 3D, FAR।", tools: ["/consultants"] },
  { step: 3, title_en: "Vastu review", title_hi: "वास्तु समीक्षा", detail_en: "Orientation and layout.", detail_hi: "ओरिएंटेशन और लेआउट।", tools: ["/consultants"] },
  { step: 4, title_en: "Structural design", title_hi: "स्ट्रक्चरल डिज़ाइन", detail_en: "RCC, soil test, IS codes.", detail_hi: "RCC, मिट्टी परीक्षण।", tools: ["/consultants"] },
  { step: 5, title_en: "BOQ & costing", title_hi: "BOQ और लागत", detail_en: "Brand-wise material BOQ.", detail_hi: "ब्रांड-वार BOQ।", tools: ["/boq-builder", "/mart"] },
  { step: 6, title_en: "Tender & vendors", title_hi: "टेंडर और विक्रेता", detail_en: "Reverse auction, verified vendors.", detail_hi: "रिवर्स ऑक्शन।", tools: ["/tenders", "/store"] },
  { step: 7, title_en: "Construction & handover", title_hi: "निर्माण और हैंडOver", detail_en: "Supervision, snagging.", detail_hi: "पर्यवेक्षण, स्नैगिंग।", tools: ["/dashboard"] },
];

export const DEMO_CONSULTANT_META = {
  roles: [
    { id: "exterior", name: "Exterior Consultant", name_hi: "एक्सटीरियर कंसल्टेंट" },
    { id: "interior", name: "Interior Consultant", name_hi: "इंटीरियर कंसल्टेंट" },
    { id: "architect", name: "Architect", name_hi: "आर्किटेक्ट" },
    { id: "vastu", name: "Vastu Consultant", name_hi: "वास्तु कंसल्टेंट" },
    { id: "structural", name: "Structural Engineer", name_hi: "स्ट्रक्चरल इंजीनियर" },
    { id: "landscape", name: "Landscape Consultant", name_hi: "लैंडस्केप कंसल्टेंट" },
    { id: "real_estate", name: "Real Estate Advisor", name_hi: "रियल एस्टेट सलाहकार" },
  ],
  experience_levels: [
    { id: "fresher", label: "Fresher (0–2 yrs)", label_hi: "नया (0–2 वर्ष)" },
    { id: "junior", label: "Junior (2–5 yrs)", label_hi: "जूनियर (2–5 वर्ष)" },
    { id: "mid", label: "Mid-level (5–10 yrs)", label_hi: "मिड (5–10 वर्ष)" },
    { id: "senior", label: "Senior (10–15 yrs)", label_hi: "सीनियर (10–15 वर्ष)" },
    { id: "expert", label: "Expert (15+ yrs)", label_hi: "एक्सपर्ट (15+ वर्ष)" },
  ],
};

export const DEMO_CONSULTANTS = [
  { id: "demo-cns-arch", name: "Priya Sharma", consultant_role: "architect", role_name: "Architect", role_name_hi: "आर्किटेक्ट", experience_years: 12, experience_level: "senior", experience_label: "Senior (10–15 yrs)", experience_label_hi: "सीनियर (10–15 वर्ष)", rating: 4.7, verified: true, service_area: "Maharashtra", bio: "Senior Architect — residential & villa", title: "Architect", specializations: ["Villa", "Naksha"] },
  { id: "demo-cns-int", name: "Rahul Verma", consultant_role: "interior", role_name: "Interior Consultant", role_name_hi: "इंटीरियर कंसल्टेंट", experience_years: 8, experience_level: "mid", experience_label: "Mid-level (5–10 yrs)", experience_label_hi: "मिड (5–10 वर्ष)", rating: 4.6, verified: true, service_area: "Delhi NCR", bio: "Interior designer — modular kitchens", title: "Interior Consultant", specializations: ["Kitchen", "Wardrobe"] },
  { id: "demo-cns-ext", name: "Amit Khanna", consultant_role: "exterior", role_name: "Exterior Consultant", role_name_hi: "एक्सटीरियर कंसल्टेंट", experience_years: 15, experience_level: "expert", experience_label: "Expert (15+ yrs)", experience_label_hi: "एक्सपर्ट (15+ वर्ष)", rating: 4.8, verified: true, service_area: "Delhi NCR", bio: "Exterior facade & elevation specialist", title: "Exterior Consultant", specializations: ["Facade"] },
  { id: "demo-cns-vastu", name: "Dr. Meena Joshi", consultant_role: "vastu", role_name: "Vastu Consultant", role_name_hi: "वास्तु कंसल्टेंट", experience_years: 20, experience_level: "expert", experience_label: "Expert (15+ yrs)", experience_label_hi: "एक्सपर्ट (15+ वर्ष)", rating: 4.9, verified: true, service_area: "India", bio: "Certified Vastu consultant", title: "Vastu Consultant", specializations: ["Residential"] },
  { id: "demo-cns-struct", name: "Vikram Singh", consultant_role: "structural", role_name: "Structural Engineer", role_name_hi: "स्ट्रक्चरल इंजीनियर", experience_years: 14, experience_level: "senior", experience_label: "Senior (10–15 yrs)", experience_label_hi: "सीनियर (10–15 वर्ष)", rating: 4.6, verified: true, service_area: "Delhi NCR", bio: "Structural engineer — RCC & steel", title: "Structural Engineer", specializations: ["RCC"] },
  { id: "demo-cns-land", name: "Sneha Patel", consultant_role: "landscape", role_name: "Landscape Consultant", role_name_hi: "लैंडस्केप कंसल्टेंट", experience_years: 6, experience_level: "mid", experience_label: "Mid-level (5–10 yrs)", experience_label_hi: "मिड (5–10 वर्ष)", rating: 4.5, verified: true, service_area: "Gujarat", bio: "Landscape & gardening consultant", title: "Landscape Consultant", specializations: ["Garden"] },
  { id: "demo-cns-re", name: "Rajesh Malhotra", consultant_role: "real_estate", role_name: "Real Estate Advisor", role_name_hi: "रियल एस्टेट सलाहकार", experience_years: 18, experience_level: "expert", experience_label: "Expert (15+ yrs)", experience_label_hi: "एक्सपर्ट (15+ वर्ष)", rating: 4.8, verified: true, service_area: "Delhi NCR", bio: "Plots, RERA, commercial deals", title: "Real Estate Advisor", specializations: ["RERA"] },
];

export const DEMO_TENDERS = [
  { id: "demo-tender-steel", title: "TMT Fe500D supply — 40 MT", category: "Steel & TMT", material_type: "steel_tmt", subject: "materials", status: "open", budget: 2800000, city: "Pune", closes_at: "2027-12-31T18:00:00+00:00", bid_count: 4 },
  { id: "demo-tender-cement", title: "OPC 53 Grade — 2000 bags", category: "Cement", material_type: "cement", subject: "materials", status: "open", budget: 820000, city: "Noida", closes_at: "2027-12-31T18:00:00+00:00", bid_count: 6 },
  { id: "demo-tender-solar", title: "Rooftop solar 50 kW EPC", category: "Solar Equipment", material_type: "solar", subject: "solar", status: "open", budget: 1850000, city: "Jaipur", closes_at: "2027-12-31T18:00:00+00:00", bid_count: 3 },
];

const DEMO_CONSULTANTS_MATCH = [
  { id: "demo-cns-re", name: "Rajesh Malhotra", consultant_role: "real_estate", role_name: "Real Estate Advisor", role_name_hi: "रियल एस्टेट सलाहकार", rating: 4.8, experience_years: 18, verified: true, service_area: "Delhi NCR" },
  { id: "demo-cns-arch", name: "Priya Sharma", consultant_role: "architect", role_name: "Architect", role_name_hi: "आर्किटेक्ट", rating: 4.7, experience_years: 12, verified: true, service_area: "Maharashtra" },
  { id: "demo-cns-struct", name: "Vikram Singh", consultant_role: "structural", role_name: "Structural Engineer", role_name_hi: "स्ट्रक्चरल इंजीनियर", rating: 4.6, experience_years: 14, verified: true, service_area: "Delhi NCR" },
];

export function demoPropertyAdvisoryMatch(payload) {
  const need = DEMO_PROPERTY_ADVISORY_META.property_needs.find((n) => n.id === payload.property_need) || DEMO_PROPERTY_ADVISORY_META.property_needs[0];
  let projects = DEMO_UPCOMING_PROJECTS;
  if (payload.state) projects = projects.filter((p) => p.state === payload.state);
  if (payload.city) projects = projects.filter((p) => p.city === payload.city);
  return {
    property_need: payload.property_need,
    property_need_meta: need,
    guidance_steps: DEMO_GUIDANCE_NEW_BUILDING,
    expert_opinions: [
      { topic_en: "Is my plot suitable for G+2 or G+3?", topic_hi: "मेरा प्लॉट G+2 या G+3 के लिए उपयुक्त?" },
      { topic_en: "Estimated cost per sqft?", topic_hi: "प्रति वर्ग फुट अनुमानित लागत?" },
      { topic_en: "Mandatory approvals before start?", topic_hi: "शुरू करने से पहले अनिवार्य अनुमोदन?" },
    ],
    recommended_roles: ["architect", "real_estate", "structural", "vastu"],
    matched_consultants: DEMO_CONSULTANTS_MATCH,
    matched_projects: projects.slice(0, 4).map((p) => ({
      id: p.id, title: p.title, title_hi: p.title_hi, city: p.city, state: p.state, price_label: p.price_label,
    })),
    demo: true,
  };
}

const FAB_IMG = "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800";

export const DEMO_FABRICATION_WORK_TYPES = [
  {
    id: "gate_entry", name: "Main gate & entry", name_hi: "मुख्य गेट और प्रवेश",
    desc_en: "MS gate, sliding gate, designer gate, automation",
    desc_hi: "एमएस गेट, स्लाइडिंग गेट, डिज़ाइनर गेट, ऑटोमेशन",
    material_items: [
      { name: "MS Gate Fabrication", unit: "sqft", from_rate: 650, from_brand: "Local MS", image: FAB_IMG },
      { name: "MS Sliding Gate", unit: "sqft", from_rate: 780, from_brand: "Local MS", image: FAB_IMG },
      { name: "Designer Fancy Gate", unit: "sqft", from_rate: 950, from_brand: "Local MS", image: FAB_IMG },
      { name: "Gate Automation Motor Kit", unit: "set", from_rate: 12500, from_brand: "Local", image: FAB_IMG },
    ],
  },
  {
    id: "railing_balcony", name: "Railing & balcony", name_hi: "रेलिंग और बालकनी",
    desc_en: "SS/MS balcony railing, glass railing",
    desc_hi: "एसएस/एमएस बालकनी रेलिंग, ग्लास रेलिंग",
    material_items: [
      { name: "SS Railing", unit: "rft", from_rate: 720, from_brand: "Local SS", image: FAB_IMG },
      { name: "MS Balcony Railing", unit: "rft", from_rate: 420, from_brand: "Local MS", image: FAB_IMG },
      { name: "Glass Railing with SS", unit: "rft", from_rate: 980, from_brand: "Local SS", image: FAB_IMG },
    ],
  },
  {
    id: "window_grill", name: "Window grill & safety", name_hi: "विंडो ग्रिल और सुरक्षा",
    desc_en: "Fixed grill, SS grill, safety door",
    desc_hi: "फिक्स्ड ग्रिल, एसएस ग्रिल, सेफ्टी दरवाज़ा",
    material_items: [
      { name: "MS Grill Window", unit: "sqft", from_rate: 420, from_brand: "Local MS", image: FAB_IMG },
      { name: "SS Window Grill", unit: "sqft", from_rate: 550, from_brand: "Jindal SS", image: FAB_IMG },
      { name: "MS Safety Door", unit: "piece", from_rate: 6500, from_brand: "Local MS", image: FAB_IMG },
    ],
  },
  {
    id: "staircase", name: "Staircase MS/SS", name_hi: "सीढ़ी एमएस/एसएस",
    desc_en: "MS staircase, railing, handrail",
    desc_hi: "एमएस सीढ़ी, रेलिंग, हैंडरेल",
    material_items: [
      { name: "MS Staircase Structure", unit: "sqft", from_rate: 520, from_brand: "Local MS", image: FAB_IMG },
      { name: "MS Staircase Railing", unit: "rft", from_rate: 380, from_brand: "Local MS", image: FAB_IMG },
      { name: "SS Staircase Handrail", unit: "rft", from_rate: 650, from_brand: "Local SS", image: FAB_IMG },
    ],
  },
  {
    id: "boundary_fence", name: "Boundary & fencing", name_hi: "बाउंड्री और फेंसिंग",
    desc_en: "Boundary railing, chain link",
    desc_hi: "बाउंड्री रेलिंग, चेन लिंक",
    material_items: [
      { name: "Boundary Wall MS Railing", unit: "rft", from_rate: 350, from_brand: "Local MS", image: FAB_IMG },
      { name: "Chain Link Fencing", unit: "rft", from_rate: 180, from_brand: "Local", image: FAB_IMG },
    ],
  },
  {
    id: "structural_ms", name: "Structural MS", name_hi: "स्ट्रक्चरल एमएस",
    desc_en: "Angle, channel, beam, truss",
    desc_hi: "एंगल, चैनल, बीम, ट्रस",
    material_items: [
      { name: "MS Angle 50x50", unit: "kg", from_rate: 62, from_brand: "Local MS", image: FAB_IMG },
      { name: "MS Roof Truss", unit: "sqft", from_rate: 280, from_brand: "Local MS", image: FAB_IMG },
      { name: "GI Sheet 1mm", unit: "sqft", from_rate: 85, from_brand: "Local", image: FAB_IMG },
    ],
  },
  {
    id: "roof_shed", name: "Roof & shed", name_hi: "छत और शेड",
    desc_en: "PEB shed, polycarbonate roof",
    desc_hi: "PEB शेड, पॉलीकार्बोनेट छत",
    material_items: [
      { name: "PEB Shed Fabrication", unit: "sqft", from_rate: 360, from_brand: "Local MS", image: FAB_IMG },
      { name: "Car Porch MS Structure", unit: "sqft", from_rate: 450, from_brand: "Local MS", image: FAB_IMG },
    ],
  },
  {
    id: "facade_cladding", name: "Facade support", name_hi: "फेसाड सपोर्ट",
    desc_en: "ACP frame, aluminium louvers",
    desc_hi: "ACP फ्रेम, एल्युमिनियम लूवर",
    material_items: [
      { name: "ACP Fixing MS Frame", unit: "sqft", from_rate: 180, from_brand: "Local MS", image: FAB_IMG },
      { name: "Aluminium Louver Panel", unit: "sqft", from_rate: 260, from_brand: "Local", image: FAB_IMG },
    ],
  },
  {
    id: "industrial", name: "Industrial", name_hi: "औद्योगिक",
    desc_en: "Mezzanine, platform",
    desc_hi: "मेज़ानिन, प्लेटफॉर्म",
    material_items: [
      { name: "MS Mezzanine Floor", unit: "sqft", from_rate: 340, from_brand: "Local MS", image: FAB_IMG },
      { name: "MS Platform Fabrication", unit: "sqft", from_rate: 420, from_brand: "Local MS", image: FAB_IMG },
    ],
  },
  {
    id: "stainless_commercial", name: "Stainless commercial", name_hi: "स्टेनलेस कॉमर्शियल",
    desc_en: "SS counter, sink, railing",
    desc_hi: "एसएस काउंटर, सिंक, रेलिंग",
    material_items: [
      { name: "SS Kitchen Counter", unit: "sqft", from_rate: 1850, from_brand: "Local SS", image: FAB_IMG },
      { name: "SS Sink Unit with Stand", unit: "set", from_rate: 9800, from_brand: "Local SS", image: FAB_IMG },
    ],
  },
  {
    id: "consumables", name: "Welding & finishing", name_hi: "वेल्डिंग और फिनिशिंग",
    desc_en: "Welding rod, primer, paint",
    desc_hi: "वेल्डिंग रॉड, प्राइमर, पेंट",
    material_items: [
      { name: "Welding Rod 12mm", unit: "kg", from_rate: 125, from_brand: "Local", image: FAB_IMG },
      { name: "MS Primer Red Oxide", unit: "litre", from_rate: 82, from_brand: "Nerolac", image: FAB_IMG },
      { name: "MS Enamel Paint", unit: "litre", from_rate: 158, from_brand: "Nerolac", image: FAB_IMG },
    ],
  },
];


const EQ_IMG = "https://images.unsplash.com/photo-1581094790879-aeaee3f07ae2?w=800";
const TRUCK_IMG = "https://images.unsplash.com/photo-1601584115207-0bbf79590007?w=800";

export const DEMO_EQUIPMENT_META = {
  service_types: [
    { id: "equipment_rental", name: "Equipment rental", name_hi: "उपकरण रेंटल" },
    { id: "machinery_hire", name: "Machinery hire", name_hi: "मशीनरी हायर" },
    { id: "logistics", name: "Logistics & transport", name_hi: "लॉजिस्टिक्स" },
    { id: "site_delivery", name: "Site delivery", name_hi: "साइट डिलीवरी" },
    { id: "heavy_haulage", name: "Heavy haulage", name_hi: "भारी ढुलाई" },
  ],
  equipment_categories: [
    { id: "jcb_earthmoving", name: "JCB & Earthmoving", name_hi: "JCB और अर्थमूविंग" },
    { id: "crane_lifting", name: "Crane & Lifting", name_hi: "क्रेन और लिफ्टिंग" },
    { id: "concrete", name: "Concrete equipment", name_hi: "कंक्रीट उपकरण" },
    { id: "transport_tipper", name: "Tipper & Dumper", name_hi: "टिपर और डंपर" },
    { id: "flatbed_haulage", name: "Flatbed haulage", name_hi: "फ्लैटबेड ढुलाई" },
    { id: "generator_power", name: "Generator", name_hi: "जनरेटर" },
    { id: "scaffolding", name: "Scaffolding", name_hi: "स्कैफोल्डिंग" },
    { id: "material_delivery", name: "Material delivery", name_hi: "मटेरियल डिलीवरी" },
    { id: "specialized", name: "Specialized", name_hi: "विशेष मशीनरी" },
  ],
};

export const DEMO_EQUIPMENT_RENTALS = [
  {
    id: "demo-eqr-1", slug: "jcb-pune",
    title: "JCB 3DX — with operator", title_hi: "JCB 3DX — ऑपरेटर सहित",
    category_id: "jcb_earthmoving", service_type: "equipment_rental",
    service_type_name: "Equipment rental", service_type_name_hi: "उपकरण रेंटल",
    category_name: "JCB & Earthmoving", category_name_hi: "JCB और अर्थमूविंग",
    equipment_model: "JCB 3DX", brand: "JCB", capacity: "1.1 cum",
    state: "Maharashtra", city: "Pune", location_label: "Pune, Maharashtra",
    rate: 2200, rate_unit: "hour", rate_label: "₹2,200/hr",
    operator_included: true, verified: true, vendor_name: "Western Earthmovers",
    availability: "available", min_duration: "8 hours",
    image: EQ_IMG,
  },
  {
    id: "demo-eqr-2", slug: "crane-delhi",
    title: "25T Mobile Crane", title_hi: "25T मोबाइल क्रेन",
    category_id: "crane_lifting", service_type: "equipment_rental",
    service_type_name: "Equipment rental", service_type_name_hi: "उपकरण रेंटल",
    category_name: "Crane & Lifting", category_name_hi: "क्रेन और लिफ्टिंग",
    equipment_model: "Escorts TRX 2529", capacity: "25 ton",
    state: "Delhi", city: "New Delhi", location_label: "New Delhi, Delhi",
    rate: 28000, rate_unit: "day", rate_label: "₹28,000/day",
    operator_included: true, verified: true, vendor_name: "NCR Crane Services",
    image: EQ_IMG,
  },
  {
    id: "demo-eqr-3", slug: "tipper-pune",
    title: "10T Tipper — sand / aggregate", title_hi: "10T टिपर — रेत / एग्रीगेट",
    category_id: "transport_tipper", service_type: "logistics",
    service_type_name: "Logistics & transport", service_type_name_hi: "लॉजिस्टिक्स",
    category_name: "Tipper & Dumper", category_name_hi: "टिपर और डंपर",
    equipment_model: "Tata 10T", capacity: "10 ton",
    state: "Maharashtra", city: "Pune", location_label: "Pune, Maharashtra",
    rate: 2800, rate_unit: "trip", rate_label: "₹2,800/trip",
    operator_included: true, verified: true, vendor_name: "Pune Site Logistics",
    image: TRUCK_IMG,
  },
  {
    id: "demo-eqr-4", slug: "flatbed-mumbai",
    title: "Flatbed — steel / TMT transport", title_hi: "फ्लैटबेड — स्टील ट्रांसपोर्ट",
    category_id: "flatbed_haulage", service_type: "heavy_haulage",
    service_type_name: "Heavy haulage", service_type_name_hi: "भारी ढुलाई",
    category_name: "Flatbed haulage", category_name_hi: "फ्लैटबेड",
    equipment_model: "40T Flatbed", capacity: "40 ton",
    state: "Maharashtra", city: "Mumbai", location_label: "Mumbai, Maharashtra",
    rate: 18500, rate_unit: "trip", rate_label: "₹18,500/trip",
    operator_included: true, verified: true, vendor_name: "Western Steel Movers",
    image: TRUCK_IMG,
  },
  {
    id: "demo-eqr-5", slug: "mixer-bengaluru",
    title: "Transit Mixer 6 cum", title_hi: "ट्रांजिट मिक्सर 6 cum",
    category_id: "concrete", service_type: "machinery_hire",
    service_type_name: "Machinery hire", service_type_name_hi: "मशीनरी हायर",
    category_name: "Concrete equipment", category_name_hi: "कंक्रीट उपकरण",
    equipment_model: "Ashok Leyland 6 cum", capacity: "6 cum",
    state: "Karnataka", city: "Bengaluru", location_label: "Bengaluru, Karnataka",
    rate: 3200, rate_unit: "hour", rate_label: "₹3,200/hr",
    operator_included: true, verified: true, vendor_name: "BLR Concrete Fleet",
    image: EQ_IMG,
  },
  {
    id: "demo-eqr-6", slug: "cement-gorakhpur",
    title: "Cement & material delivery", title_hi: "सीमेंट डिलीवरी",
    category_id: "material_delivery", service_type: "site_delivery",
    service_type_name: "Site delivery", service_type_name_hi: "साइट डिलीवरी",
    category_name: "Material delivery", category_name_hi: "मटेरियल डिलीवरी",
    equipment_model: "Mixed fleet", capacity: "15 ton",
    state: "Uttar Pradesh", city: "Gorakhpur", location_label: "Gorakhpur, UP",
    rate: 1800, rate_unit: "trip", rate_label: "₹1,800/trip",
    operator_included: true, verified: false, vendor_name: "Eastern UP Transport",
    image: TRUCK_IMG,
  },
];
