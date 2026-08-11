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
  { id: "solar", path: "/solar", en: "Solar EPC", hi: "सोलर EPC", descEn: "Subsidy & EMI", descHi: "सब्सिडी और EMI", icon: "solar" },
  { id: "enroll", path: "/enroll", en: "Enrollment", hi: "पंजीकरण", descEn: "Shop & user signup", descHi: "दुकान पंजीकरण", icon: "enroll" },
  { id: "customer", path: "/dashboard", en: "Customer Demo", hi: "ग्राहक डेमो", descEn: "Mera Ghar dashboard", descHi: "मेरा घर डैशबोर्ड", icon: "customer", loginProfile: "customer" },
  { id: "vendor", path: "/dashboard", en: "Vendor Demo", hi: "विक्रेता डेमो", descEn: "Orders & catalog", descHi: "ऑर्डर और कैटलॉग", icon: "vendor", loginProfile: "vendor" },
  { id: "contractor", path: "/dashboard", en: "Contractor Demo", hi: "ठेकेदार डेमो", descEn: "Projects & BOQ", descHi: "प्रोजेक्ट और BOQ", icon: "contractor", loginProfile: "contractor" },
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
  { id: "fabrication", name: "Fabrication", name_hi: "फैब्रिकेशन", image: IMG.cement, product_count: 7, brand_count: 3, from_rate: 420, from_unit: "sqft", from_brand: "Local MS" },
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
