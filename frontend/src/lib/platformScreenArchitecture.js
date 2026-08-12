/**
 * Complete screen-by-screen functional architecture for the buildecogroup.com core journey.
 * Used by /platform and per-page workflow banners.
 */

export const CORE_PLATFORM_SCREENS = [
  {
    id: "build-step-1",
    screen: 1,
    path: "/build",
    titleEn: "BuildEco Builder — Step 1",
    titleHi: "BuildEco बिल्डर — चरण 1",
    headlineEn: "What do you want to build?",
    headlineHi: "आप क्या बनाना चाहते हैं?",
    flowEn: "Category card → Next — click 2",
    flowHi: "श्रेणी कार्ड → आगे — क्लिक 2",
    visualsEn: "6 category cards (Residential, Commercial, Industrial, Renovation, Interior, Solar) and Next — click 2 action.",
    visualsHi: "6 श्रेणी कार्ड और आगे — क्लिक 2 बटन।",
    stepsEn: [
      "Select a build category card — active border highlights selection.",
      "Click Next — click 2 → advances to Step 2.",
      "Backend stores project_type in session and loads property options for profiling.",
    ],
    stepsHi: [
      "बिल्ड श्रेणी कार्ड चुनें — सक्रिय बॉर्डर हाइलाइट।",
      "आगे — क्लिक 2 → चरण 2।",
      "बैकएंड project_type सेव करता है और प्रॉपर्टी विकल्प लोड करता है।",
    ],
    backendEn: "Stores project_type in localStorage/session; dynamically filters Step 2 property subtypes.",
    backendHi: "project_type localStorage में; चरण 2 प्रॉपर्टी विकल्प फ़िल्टर।",
  },
  {
    id: "build-step-2",
    screen: 2,
    path: "/build",
    titleEn: "Property & User Profiling — Step 2",
    titleHi: "प्रॉपर्टी और उपयोगकर्ता प्रोफ़ाइल — चरण 2",
    headlineEn: "Who are you & project details",
    headlineHi: "आप कौन हैं और प्रोजेक्ट विवरण",
    flowEn: "Persona → Property type → Continue",
    flowHi: "पहचान → प्रॉपर्टी प्रकार → जारी रखें",
    visualsEn: "Persona cards (Company/developer, Individual/family, Contractor, Investor) and property types (New building, Plot, Commercial, Industrial shed, Villa, Apartment, Renovation, Township).",
    visualsHi: "पहचान कार्ड और प्रॉपर्टी प्रकार विकल्प।",
    stepsEn: [
      "Select profile card (e.g. Individual / family).",
      "Select property type (e.g. Villa / home).",
      "Enter location, plot/built-up area, quality tier → open AI Project Dashboard.",
    ],
    stepsHi: [
      "प्रोफ़ाइल कार्ड चुनें (जैसे व्यक्ति/परिवार)।",
      "प्रॉपर्टी प्रकार चुनें (जैसे विला/घर)।",
      "लोकेशन, क्षेत्रफल, गुणवत्ता → AI प्रोजेक्ट डैशबोर्ड।",
    ],
    backendEn: "Configures steel/sq.ft multipliers and customizes AI dashboard by persona and property subtype.",
    backendHi: "स्टील/sq.ft गुणक और persona के हिसाब से AI डैशबोर्ड कस्टमाइज़।",
  },
  {
    id: "estimate",
    screen: 3,
    path: "/estimate",
    titleEn: "Instant Cost Calculator Engine",
    titleHi: "तत्काल लागत कैलकुलेटर",
    headlineEn: "Cost calculator",
    headlineHi: "लागत कैलकुलेटर",
    flowEn: "Pincode/GPS → Area & quality → Calculate estimate",
    flowHi: "पिनकोड/GPS → क्षेत्र और गुणवत्ता → अनुमान",
    visualsEn: "Pincode + Use GPS, Plot/Built-up sqft, Floor/BHK, Quality tier dropdown, Solar checkbox, Calculate estimate.",
    visualsHi: "पिनकोड + GPS, प्लॉट/बिल्ट-अप, फ्लोर/BHK, गुणवत्ता, सोलर चेकबॉक्स, अनुमान बटन।",
    stepsEn: [
      "Enter 6-digit pincode or click Use GPS for auto-detect.",
      "Enter plot/built-up area; select structural quality level.",
      "Click Calculate estimate → itemized materials (cement bags, steel kg, sand, tiles).",
    ],
    stepsHi: [
      "6-अंकीय पिनकोड या GPS ऑटो-डिटेक्ट।",
      "प्लॉट/बिल्ट-अप और गुणवत्ता स्तर।",
      "अनुमान लगाएं → सीमेंट, स्टील, रेत, टाइल्स।",
    ],
    backendEn: "Location-adjusted pricing via /api/project-planner/estimate; material breakdown from platform coefficients.",
    backendHi: "स्थान-समायोजित मूल्य; /api/project-planner/estimate और मटेरियल गुणक।",
  },
  {
    id: "design",
    screen: 4,
    path: "/design",
    titleEn: "AI Design Studio",
    titleHi: "AI डिज़ाइन स्टूडियो",
    headlineEn: "AI 3D Home Studio",
    headlineHi: "AI 3D होम स्टूडियो",
    flowEn: "Feature module → Prompt + Style → Generate design",
    flowHi: "फ़ीचर मॉड्यूल → प्रॉम्प्ट + स्टाइल → डिज़ाइन जनरेट",
    visualsEn: "AI floor plan, elevation, interior concept, colour suggestions; prompt field; style selector (Modern, Minimalist, Traditional); Generate design.",
    visualsHi: "फ्लोर प्लान, एलिवेशन, इंटीरियर, रंग; प्रॉम्प्ट; स्टाइल; जनरेट बटन।",
    stepsEn: [
      "Select AI feature module (e.g. Interior concept).",
      "Enter text prompt (room/area description).",
      "Choose style from dropdown → Generate design.",
    ],
    stepsHi: [
      "AI फ़ीचर मॉड्यूल चुनें (जैसे इंटीरियर कॉन्सेप्ट)।",
      "टेक्स्ट प्रॉम्प्ट दर्ज करें।",
      "स्टाइल चुनें → डिज़ाइन जनरेट।",
    ],
    backendEn: "Structured prompts to /api/design-studio/workflow; text-to-image / ControlNet pipeline for renders.",
    backendHi: "संरचित प्रॉम्प्ट /api/design-studio/workflow; टेक्स्ट-टू-इमेज पाइपलाइन।",
  },
  {
    id: "projects",
    screen: 5,
    path: "/projects",
    titleEn: "AI Project Dashboard",
    titleHi: "AI प्रोजेक्ट डैशबोर्ड",
    headlineEn: "AI Project Dashboard",
    headlineHi: "AI प्रोजेक्ट डैशबोर्ड",
    flowEn: "Review scope → Generate my project plan",
    flowHi: "स्कोप देखें → योजना जनरेट",
    visualsEn: "Project summary header (type · location, sqft, floors, BHK) and Generate my project plan button.",
    visualsHi: "प्रोजेक्ट सारांश हेडर और योजना जनरेट बटन।",
    stepsEn: [
      "View aggregated project scope from prior selections.",
      "Click Generate my project plan.",
      "Dashboard: material/cost tab + AI 3D studio tab with BOQ and milestones.",
    ],
    stepsHi: [
      "पिछले चयन से एकत्रित स्कोप देखें।",
      "मेरी प्रोजेक्ट योजना जनरेट करें क्लिक करें।",
      "डैशबोर्ड: मटेरियल/लागत + AI 3D टैब।",
    ],
    backendEn: "Compiles drawings, BOQ costs, milestone schedule, contractor matches via /api/project-planner/plan.",
    backendHi: "/api/project-planner/plan — BOQ, माइलस्टोन, ठेकेदार मिलान।",
  },
  {
    id: "store",
    screen: 6,
    path: "/store",
    titleEn: "Construction Store & E-Commerce",
    titleHi: "कंस्ट्रक्शन स्टोर",
    headlineEn: "Construction Store",
    headlineHi: "कंस्ट्रक्शन स्टोर",
    flowEn: "Search/filter → Product card → Add to bag / BOQ",
    flowHi: "खोज/फ़िल्टर → उत्पाद → बैग/BOQ में जोड़ें",
    visualsEn: "Search bar, My bag, Full BOQ link, category badges, product cards with LIVE RATE (cement, TMT steel, tiles, paint, PVC).",
    visualsHi: "खोज, मेरा बैग, BOQ लिंक, श्रेणी बैज, LIVE RATE कार्ड।",
    stepsEn: [
      "Search materials or filter by category (Cement, Steel, Tiles).",
      "Click product card for live market price per unit.",
      "Add to bag or Add to BOQ — pincode-based supplier pricing sync.",
    ],
    stepsHi: [
      "सामग्री खोजें या श्रेणी फ़िल्टर।",
      "उत्पाद कार्ड — लाइव मार्केट प्राइस।",
      "बैग या BOQ में जोड़ें — पिनकोड-आधारित कीमत।",
    ],
    backendEn: "Live pincode-based inventory pricing via /api/store/browse into cart and BOQ estimates.",
    backendHi: "/api/store/browse — पिनकोड आधारित लाइव कीमत कार्ट/BOQ में।",
  },
  {
    id: "professionals",
    screen: 7,
    path: "/professionals",
    titleEn: "Professionals & Vendor Portal",
    titleHi: "पेशेवर और विक्रेता पोर्टल",
    headlineEn: "Professionals",
    headlineHi: "पेशेवर",
    flowEn: "Portal card → Profiles / Join as professional",
    flowHi: "पोर्टल कार्ड → प्रोफ़ाइल / पेशेवर पंजीकरण",
    visualsEn: "6 portal cards: Architects & engineers, Contractors & labour, Interior designers, Solar providers, Material vendors, Join as professional.",
    visualsHi: "6 पोर्टल कार्ड: वास्तुकार, ठेकेदार, इंटीरियर, सोलर, विक्रेता, पंजीकरण।",
    stepsEn: [
      "Project owners click domain card → verified profiles, portfolios, ratings.",
      "Service providers click Join as professional → verification and lead claims.",
      "Backend matches providers to active leads by geography and specialization.",
    ],
    stepsHi: [
      "प्रोजेक्ट मालिक डोमेन कार्ड → सत्यापित प्रोफ़ाइल।",
      "सेवा प्रदाता पेशेवर पंजीकरण → सत्यापन और लीड।",
      "भूगोल और विशेषज्ञता से मिलान।",
    ],
    backendEn: "Geographic and specialization matching for verified service providers and project leads.",
    backendHi: "भौगोलिक और विशेषज्ञता मिलान — सत्यापित प्रदाता और लीड।",
  },
];

/** End-to-end system workflow nodes for platform guide */
export const END_TO_END_WORKFLOW = {
  nodesEn: [
    "BuildEco Builder (Step 1 + 2)",
    "Property Profiling",
    "Cost Calculator → BOQ & materials",
    "AI Design Studio → 3D renders",
    "Professionals Portal → architect/contractor match",
    "Construction Store checkout",
  ],
  nodesHi: [
    "BuildEco बिल्डर (चरण 1 + 2)",
    "प्रॉपर्टी प्रोफ़ाइलिंग",
    "लागत कैलकुलेटर → BOQ",
    "AI डिज़ाइन → 3D रेंडर",
    "पेशेवर पोर्टल → मिलान",
    "कंस्ट्रक्शन स्टोर चेकआउट",
  ],
  branchesEn: [
    { from: "Property Profiling", to: "Cost Calculator", label: "Estimate" },
    { from: "Property Profiling", to: "AI Design Studio", label: "Design" },
    { from: "Property Profiling", to: "Professionals Portal", label: "Match" },
    { from: "Professionals Portal", to: "Construction Store", label: "Checkout" },
  ],
};

/** Design studio feature modules (Screen 4 visual elements) */
export const DESIGN_FEATURE_MODULES = [
  { id: "floor_plan", en: "AI floor plan", hi: "AI फ्लोर प्लान", promptPrefixEn: "Generate a floor plan for", promptPrefixHi: "फ्लोर प्लान जनरेट करें:" },
  { id: "elevation", en: "AI elevation", hi: "AI एलिवेशन", promptPrefixEn: "Design an elevation concept for", promptPrefixHi: "एलिवेशन कॉन्सेप्ट:" },
  { id: "interior", en: "Interior concept", hi: "इंटीरियर कॉन्सेप्ट", promptPrefixEn: "Interior concept for", promptPrefixHi: "इंटीरियर कॉन्सेप्ट:" },
  { id: "colour", en: "Colour suggestions", hi: "रंग सुझाव", promptPrefixEn: "Colour palette and finishes for", promptPrefixHi: "रंग और फिनिश:" },
];

export const DESIGN_STYLES = [
  { id: "modern", en: "Modern", hi: "आधुनिक" },
  { id: "minimal", en: "Minimalist", hi: "मिनिमलिस्ट" },
  { id: "traditional", en: "Traditional", hi: "पारंपरिक" },
  { id: "luxury", en: "Luxury", hi: "लक्ज़री" },
];

/** Ecosystem advanced features (construction ecosystem expansion) */
export const ECOSYSTEM_ADVANCED_FEATURES = [
  {
    id: "vision-boq-upload",
    titleEn: "Vision AI Auto-BOQ (Floor Plan Upload)",
    titleHi: "Vision AI ऑटो-BOQ (फ्लोर प्लान)",
    descEn: "Upload 2D floor plan PDF or sketch — CV detects walls, doors, room dimensions; auto-calculates plaster, paint, and tile sqft.",
    descHi: "2D प्लान/PDF — CV दीवार, दरवाज़े, रूम आयाम; प्लास्टर, पेंट, टाइल sqft ऑटो।",
    route: "/boq-builder",
  },
  {
    id: "ar-overlay",
    titleEn: "AR Site Overlay",
    titleHi: "AR साइट ओवरले",
    descEn: "Mobile WebAR — point camera at unfinished walls to see AI 3D interiors and furniture overlaid in real time.",
    descHi: "मोबाइल WebAR — कैमरा से unfinished दीवार पर AI 3D इंटीरियर ओवरले।",
    route: "/technology",
  },
  {
    id: "market-ticker",
    titleEn: "Live Steel & Cement Market Ticker",
    titleHi: "लाइव स्टील और सीमेंट टिकर",
    descEn: "Real-time commodity ticker on store — TMT Fe500/Fe550D and OPC/PPC cement daily rates with price-drop alerts.",
    descHi: "स्टोर पर लाइव टिकर — TMT और सीमेंट दैनिक दर, प्राइस-ड्रॉप अलर्ट।",
    route: "/store",
  },
  {
    id: "whatsapp-bot",
    titleEn: "WhatsApp AI Bot (Chat-to-Estimate)",
    titleHi: "WhatsApp AI बॉट",
    descEn: "Conversational bot via WhatsApp API — text/voice (e.g. \"1,200 sqft home in Gorakhpur\") → instant BOQ PDF on WhatsApp.",
    descHi: "WhatsApp बॉट — टेक्स्ट/वॉयस → तुरंत BOQ PDF WhatsApp पर।",
    route: "/ai",
  },
  {
    id: "milestone-escrow",
    titleEn: "Milestone-Based Escrow Payments",
    titleHi: "माइलस्टोन Escrow भुगतान",
    descEn: "Digital escrow — funds released in installments (20% foundation, 30% slab) upon site photo / AI verification.",
    descHi: "डिजिटल Escrow — माइलस्टोन पर किस्त (20% फाउंडेशन, 30% स्लैब) फोटो/AI सत्यापन पर।",
    route: "/tenders",
  },
  {
    id: "iot-drone",
    titleEn: "IoT & Drone Site Progress Tracking",
    titleHi: "IoT और ड्रोन साइट ट्रैकिंग",
    descEn: "Live CCTV and drone feeds in AI Project Dashboard — labor count, material delivery, progress vs timeline.",
    descHi: "AI डैशबोर्ड में CCTV/ड्रोन — श्रम संख्या, सामग्री डिलीवरी, प्रगति ट्रैकिंग।",
    route: "/projects",
  },
];

/** Demo market ticker rates for store placeholder */
export const DEMO_MARKET_RATES = [
  { commodityEn: "TMT Fe500", commodityHi: "TMT Fe500", unit: "₹/kg", rate: 62.5, change: -0.8 },
  { commodityEn: "OPC 53 Grade Cement", commodityHi: "OPC 53 ग्रेड सीमेंट", unit: "₹/bag", rate: 410, change: 2.1 },
  { commodityEn: "PPC Cement", commodityHi: "PPC सीमेंट", unit: "₹/bag", rate: 385, change: 0.5 },
  { commodityEn: "Fe550D TMT", commodityHi: "Fe550D TMT", unit: "₹/kg", rate: 64.2, change: -1.2 },
];
