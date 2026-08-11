/** Module-by-module screen workflows and advanced platform upgrades */

export const MODULE_SCREENS = [
  {
    id: "property-advisory",
    path: "/property-advisory",
    titleEn: "Property Advisory",
    titleHi: "प्रॉपर्टी सलाह",
    flowEn: "Type Selection → Location → Project Details → Advisor Match",
    flowHi: "प्रकार → लोकेशन → विवरण → सलाहकार मिलान",
    stepsEn: [
      "Persona: Company/developer, Individual/family, Contractor, or Investor — adjusts advisory logic (ROI vs plot legal checks).",
      "Property type: New building, plot, commercial, industrial shed, villa, apartment, renovation, township — sets consultant skill sets.",
      "Continue advances to location, then budget & specifics.",
      "Verified consultant profiles match your criteria; submit request for direct contact.",
    ],
    stepsHi: [
      "पहचान: कंपनी/डेवलपर, व्यक्ति/परिवार, ठेकेदार या निवेशक — ROI vs प्लॉट कानूनी जाँच।",
      "प्रॉपर्टी प्रकार: नया बिल्डिंग, प्लॉट, कॉमर्शियल, औद्योगिक शेड, विला, अपार्टमेंट, रेनोवेशन, टाउनशिप।",
      "आगे → लोकेशन, फिर बजट और विशिष्ट विवरण।",
      "सत्यापित सलाहकार प्रोफ़ाइल मिलान; अनुरोध भेजें।",
    ],
  },
  {
    id: "interior-boq",
    path: "/interior-boq",
    titleEn: "Interior BOQ Calculators",
    titleHi: "इंटीरियर BOQ कैलकुलेटर",
    flowEn: "Catalog cards → Open catalog → Itemized estimate",
    flowHi: "कैटलॉग कार्ड → कैटलॉग खोलें → आइटम अनुमान",
    stepsEn: [
      "Browse trade cards: Interior Décor, Tiles, False Ceiling, PVC, Renovation, Gardening, Vastu, Fabrication.",
      "Each card shows item counts, brand partners (Asian Paints, Somany, Prince…), and base pricing (e.g. From ₹42/sqft).",
      "Open catalog → pick tile designs, paint finishes, or fabrication materials.",
      "Enter room dimensions for itemized cost breakdown and exportable BOQ lines.",
    ],
    stepsHi: [
      "श्रेणी कार्ड: इंटीरियर, टाइल्स, फॉल्स सीलिंग, PVC, रेनोवेशन, गार्डनिंग, वास्तु, फैब्रिकेशन।",
      "आइटम संख्या, ब्रांड पार्टनर और बेस प्राइस (जैसे ₹42/sqft से)।",
      "कैटलॉग खोलें → डिज़ाइन/फिनिश चुनें।",
      "रूम आयाम दर्ज करें → आइटमाइज़्ड लागत।",
    ],
  },
  {
    id: "boq-builder",
    path: "/boq-builder",
    titleEn: "Full Home BOQ Builder",
    titleHi: "पूरा घर BOQ बिल्डर",
    flowEn: "Store selection → Pick items → Unified BOQ",
    flowHi: "स्टोर चयन → आइटम → एकीकृत BOQ",
    stepsEn: [
      "Choose category stores: Plumber, Electrical, Wire & Switch, Paint & Putty, PVC Panel, Interior, Kitchen, Bathroom, Bedroom, etc.",
      "Select all / Clear toggles batch-select all 13 categories or reset.",
      "Add brand-specific materials with quantities per store.",
      "Generate unified BOQ — export PDF/Excel or order from suppliers.",
    ],
    stepsHi: [
      "स्टोर चुनें: प्लंबर, इलेक्ट्रिकल, वायर, पेंट, PVC, किचन, बाथरूम, बेडरूम…",
      "सभी चुनें / साफ़ करें — 13 श्रेणियाँ एक साथ।",
      "ब्रांड और मात्रा जोड़ें।",
      "एकीकृत BOQ — PDF/Excel या सप्लायर ऑर्डर।",
    ],
  },
  {
    id: "technology",
    path: "/technology",
    titleEn: "LiDAR, 3D & VR",
    titleHi: "LiDAR, 3D और VR",
    flowEn: "LiDAR scan → 3D studio → VR walkthrough",
    flowHi: "LiDAR स्कैन → 3D स्टूडियो → VR वॉकथ्रू",
    stepsEn: [
      "LiDAR Survey: mobile/tablet scans → auto-scaled 2D floor plans.",
      "3D Models: 2D plans become interactive architectural meshes.",
      "VR Preview: WebXR virtual walkthroughs before construction.",
      "Start my project / Design links LiDAR data into the AI 3D studio engine.",
    ],
    stepsHi: [
      "LiDAR: मोबाइल स्कैन → ऑटो 2D फ्लोर प्लान।",
      "3D: इंटरैक्टिव आर्किटेक्चरल मॉडल।",
      "VR: WebXR वर्चुअल वॉकथ्रू।",
      "प्रोजेक्ट शुरू / डिज़ाइन → LiDAR डेटा 3D स्टूडियो में।",
    ],
  },
  {
    id: "solar",
    path: "/solar",
    titleEn: "Solar EPC Calculator",
    titleHi: "सोलर EPC कैलकुलेटर",
    flowEn: "Segment → Sizing & finance → WhatsApp quote",
    flowHi: "सेगमेंट → साइज़िंग → WhatsApp कोट",
    stepsEn: [
      "EPC Configurator: Residential vs Commercial / Industrial segment toggle.",
      "System sizing (kW), 25-year generation, PM Surya Ghar subsidy, EMI, bank-ready DPR.",
      "Component brands and ready-made packages optional.",
      "Solar quote on WhatsApp sends tailored proposal to your phone.",
    ],
    stepsHi: [
      "EPC: आवासीय vs व्यावसायिक/औद्योगिक।",
      "प्लांट क्षमता, 25-वर्ष मॉडल, सब्सिडी, EMI, DPR।",
      "ब्रांड और पैकेज वैकल्पिक।",
      "WhatsApp पर सोलर कोट — तैयार प्रस्ताव।",
    ],
  },
];

export const ADVANCED_UPGRADES = [
  {
    id: "vision-boq",
    titleEn: "Vision AI Auto-BOQ Generator",
    titleHi: "Vision AI ऑटो-BOQ",
    descEn: "Upload architectural PDFs or sketches — CV parses room boundaries, wall lengths, door/window counts to auto-populate the Full Home BOQ Builder.",
    descHi: "PDF/स्केच अपलोड — CV रूम, दीवार, दरवाज़े/खिड़की पार्स करके BOQ बिल्डर ऑटो-फिल।",
    status: "coming_soon",
    route: "/boq-builder",
  },
  {
    id: "solar-satellite",
    titleEn: "Satellite Solar Rooftop Mapping",
    titleHi: "उपग्रह सोलर मैपिंग",
    descEn: "Address or map pin → satellite APIs detect rooftop area, pitch, and shadow obstruction for panel placement and yield preview.",
    descHi: "पता या पिन → छत क्षेत्र, ढलान, छाया — पैनल प्लेसमेंट और उत्पादन मॉडल।",
    status: "coming_soon",
    route: "/solar",
  },
  {
    id: "tender-escrow",
    titleEn: "B2B Tender Bidding & Escrow",
    titleHi: "B2B टेंडर और Escrow",
    descEn: "Publish BOQs to the vendor marketplace; suppliers bid competitively. Escrow holds milestone funds until verified.",
    descHi: "BOQ मार्केटप्लेस पर प्रकाशित करें; विक्रेता बोली। Escrow माइलस्टोन भुगतान सुरक्षित।",
    status: "coming_soon",
    route: "/tenders",
  },
  {
    id: "webgl-customizer",
    titleEn: "WebGL 3D Room Customizer",
    titleHi: "WebGL 3D रूम कस्टमाइज़र",
    descEn: "Real-time browser rendering — swap tiles, paint, furniture in a 3D canvas; material costs recalculate dynamically.",
    descHi: "ब्राउज़र 3D — टाइल, पेंट, फर्नीचर बदलें; लागत लाइव अपडेट।",
    status: "coming_soon",
    route: "/design",
  },
  {
    id: "voice-boq",
    titleEn: "Multi-Lingual Voice Assistant",
    titleHi: "बहुभाषी वॉयस असिस्टेंट",
    descEn: "Voice-to-BOQ in local languages — site supervisors speak natural queries; NLP populates BOQ statements.",
    descHi: "स्थानीय भाषा में वॉयस → BOQ — NLP से पैरामीटर फिल।",
    status: "coming_soon",
    route: "/ai",
  },
  {
    id: "erp-sync",
    titleEn: "Live Vendor ERP Inventory Sync",
    titleHi: "लाइव ERP इन्वेंटरी",
    descEn: "Supplier ERP APIs sync cement, steel, tile prices and local availability in real time.",
    descHi: "सप्लायर ERP — सीमेंट, स्टील, टाइल कीमत और उपलब्धता लाइव।",
    status: "coming_soon",
    route: "/store",
  },
];

/** Build WhatsApp message from solar EPC estimate result */
export function buildSolarWhatsAppMessage(res, hi = false) {
  if (!res?.sizing) {
    return hi
      ? "नमस्ते 2click.in — मुझे rooftop solar EPC estimate और subsidy जानकारी चाहिए।"
      : "Hi 2click.in — I need a rooftop solar EPC estimate and subsidy details.";
  }
  const kwp = res.sizing.recommended_capacity_kwp;
  const net = res.pricing?.net_cost;
  const subsidy = res.pricing?.subsidy;
  const emi = res.financing?.emi;
  const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  if (hi) {
    return `नमस्ते 2click.in — सोलर EPC कोट चाहिए:\n• क्षमता: ${kwp} kWp\n• नेट लागत: ${fmt(net)}${subsidy ? `\n• सब्सिडी: ${fmt(subsidy)}` : ""}${emi ? `\n• EMI: ${fmt(emi)}/माह` : ""}`;
  }
  return `Hi 2click.in — solar EPC quote request:\n• Capacity: ${kwp} kWp\n• Net cost: ${fmt(net)}${subsidy ? `\n• Subsidy: ${fmt(subsidy)}` : ""}${emi ? `\n• EMI: ${fmt(emi)}/mo` : ""}`;
}
