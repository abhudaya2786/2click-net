/**
 * 2click.in — Platform architecture: nav mapping, coefficients, brand tiers, personas
 */

export const NAV_CAPABILITY_MAP = [
  {
    nav: "Estimate",
    navHi: "अनुमान",
    capability: "Construction Material Calculator",
    path: "/estimate",
    logic: "Cement A×0.40, steel A×coeff, sand, bricks, total cost from built-up A",
  },
  {
    nav: "Design",
    navHi: "डिज़ाइन",
    capability: "AI 3D Home Studio Engine",
    path: "/design",
    logic: "2D→Depth→Mesh→Materials→Render; 3-point lighting Key 100% Fill 50% Back 30%",
  },
  {
    nav: "Build",
    navHi: "बिल्ड",
    capability: "2-Click Wizard & User Profiling",
    path: "/build",
    logic: "Project type + persona + property scope → dashboard",
  },
  {
    nav: "AI",
    navHi: "AI",
    capability: "Auto Prompt & Layout Generator",
    path: "/design",
    logic: "Text-to-3D prompts, spatial zoning 40/25/20/15",
  },
  {
    nav: "Explore / Brands",
    navHi: "ब्रांड्स",
    capability: "Material Brand Recommendation",
    path: "/store",
    logic: "Tier-based brands: UltraTech, Tata Tiscon, Kajaria, Asian Paints",
  },
];

export const USER_PERSONAS = [
  { id: "individual", en: "Individual / Family", hi: "व्यक्ति / परिवार", bulk: false },
  { id: "company", en: "Company / Developer", hi: "कंपनी / डेवलपर", bulk: true },
  { id: "contractor", en: "Contractor", hi: "ठेकेदार", bulk: true },
  { id: "investor", en: "Investor", hi: "इन्वेस्टर", bulk: false },
];

export const PROPERTY_SUBTYPES = [
  { id: "new_building", en: "New building", hi: "नया भवन" },
  { id: "residential_plot", en: "Residential plot", hi: "आवासीय प्लॉट" },
  { id: "commercial", en: "Commercial", hi: "व्यावसायिक" },
  { id: "villa_home", en: "Villa / Home", hi: "विला / घर" },
  { id: "township", en: "Township", hi: "टाउनशिप" },
];

/** Material coefficients per project type — steel kg/sqft varies by type */
export const PROJECT_COEFFICIENTS = {
  residential: { steel: 3.8, cement: 0.4, sand: 1.8, aggregate: 1.35, bricks: 18, aac: 1.2, tiles: 1.3, paint: 0.15 },
  commercial: { steel: 4.5, cement: 0.45, sand: 2.0, aggregate: 1.5, bricks: 14, aac: 1.5, tiles: 1.4, paint: 0.12 },
  industrial: { steel: 5.0, cement: 0.5, sand: 2.2, aggregate: 1.6, bricks: 12, aac: 1.8, tiles: 1.0, paint: 0.1 },
  renovation: { steel: 2.5, cement: 0.25, sand: 1.2, aggregate: 1.0, bricks: 8, aac: 0.8, tiles: 1.5, paint: 0.2 },
  interior: { steel: 0.5, cement: 0.1, sand: 0.5, aggregate: 0.3, bricks: 2, aac: 0.5, tiles: 2.0, paint: 0.25 },
  solar: { steel: 1.0, cement: 0.15, sand: 0.4, aggregate: 0.3, bricks: 0, aac: 0, tiles: 0.5, paint: 0.05 },
  villa: { steel: 4.0, cement: 0.42, sand: 1.9, aggregate: 1.4, bricks: 16, aac: 1.3, tiles: 1.5, paint: 0.18 },
};

export const QUALITY_TIERS = [
  { id: "basic", rate: 1400, labelEn: "Basic (₹1,400/sqft)", labelHi: "बेसिक (₹1,400/वर्ग फुट)" },
  { id: "standard", rate: 1700, labelEn: "Standard (₹1,700/sqft)", labelHi: "स्टैंडर्ड (₹1,700/वर्ग फुट)" },
  { id: "premium", rate: 2200, labelEn: "Premium (₹2,200/sqft)", labelHi: "प्रीमियम (₹2,200/वर्ग फुट)" },
];

export const BRAND_TIER_MAP = {
  basic: {
    cement: ["ACC", "Ambuja"],
    steel: ["JSW Neosteel", "SAIL"],
    tiles: ["Somany", "Orient Bell"],
    paint: ["Berger", "Nerolac"],
  },
  standard: {
    cement: ["UltraTech", "Ambuja", "ACC"],
    steel: ["Tata Tiscon", "JSW Neosteel"],
    tiles: ["Kajaria", "Somany"],
    paint: ["Asian Paints Apex", "Berger"],
  },
  premium: {
    cement: ["UltraTech Premium", "Ambuja Plus"],
    steel: ["Tata Tiscon SD", "JSW Neosteel"],
    tiles: ["Kajaria Premium", "Somany Elite"],
    paint: ["Asian Paints Royale", "Dulux"],
  },
};

export function getCoefficients(projectType) {
  if (projectType === "villa_home") return PROJECT_COEFFICIENTS.villa;
  return PROJECT_COEFFICIENTS[projectType] || PROJECT_COEFFICIENTS.residential;
}

export function getBrandRecommendations(qualityTier) {
  const tier = qualityTier === "low" ? "basic" : qualityTier === "luxury" ? "premium" : qualityTier;
  return BRAND_TIER_MAP[tier] || BRAND_TIER_MAP.standard;
}

export function computeMaterialEstimate({
  builtUpSqft,
  projectType = "residential",
  qualityTier = "standard",
  useAac = false,
}) {
  const A = Number(builtUpSqft);
  if (!A || A <= 0) return null;

  const coeff = getCoefficients(projectType);
  const tier = QUALITY_TIERS.find((t) => t.id === qualityTier) || QUALITY_TIERS[1];
  const brands = getBrandRecommendations(qualityTier);

  const cement = Math.round(A * coeff.cement);
  const steel = Math.round(A * coeff.steel);
  const sand = Math.round(A * coeff.sand);
  const aggregate = Math.round(A * coeff.aggregate);
  const bricks = useAac ? null : Math.round(A * coeff.bricks);
  const aacBlocks = useAac ? Math.round(A * coeff.aac) : null;
  const tiles = Math.round(A * coeff.tiles);
  const paint = Math.round(A * coeff.paint);
  const totalCost = Math.round(A * tier.rate);

  return {
    built_up_sqft: A,
    project_type: projectType,
    quality_tier: qualityTier,
    rate_per_sqft: tier.rate,
    total_cost: totalCost,
    materials: {
      cement_bags: cement,
      steel_kg: steel,
      sand_cu_ft: sand,
      aggregate_cu_ft: aggregate,
      bricks: bricks,
      aac_blocks: aacBlocks,
      tiles_sqft: tiles,
      paint_liters: paint,
    },
    coefficients: coeff,
    brands,
  };
}
