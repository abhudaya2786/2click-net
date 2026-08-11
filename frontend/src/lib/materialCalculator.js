/** House construction material & cost calculator — sqft-based formulas */

export const MATERIAL_QUALITY_TIERS = [
  { id: "basic", rate: 1400, labelEn: "Basic Quality (₹1,400 / sq. ft.)", labelHi: "बेसिक क्वालिटी (₹1,400 / वर्ग फुट)" },
  { id: "standard", rate: 1700, labelEn: "Standard Quality (₹1,700 / sq. ft.)", labelHi: "स्टैंडर्ड क्वालिटी (₹1,700 / वर्ग फुट)" },
  { id: "premium", rate: 2200, labelEn: "Premium Quality (₹2,200 / sq. ft.)", labelHi: "प्रीमियम क्वालिटी (₹2,200 / वर्ग फुट)" },
];

export const MATERIAL_BRANDS = {
  cement: { en: "UltraTech, Ambuja, ACC", hi: "UltraTech, Ambuja, ACC" },
  steel: { en: "Tata Tiscon, JSW Neosteel", hi: "Tata Tiscon, JSW Neosteel" },
  tiles: { en: "Kajaria, Somany", hi: "Kajaria, Somany" },
  paint: { en: "Asian Paints, Berger", hi: "Asian Paints, Berger" },
};

/**
 * @param {number} area - built-up area in sq ft
 * @param {number} ratePerSqft - quality tier rate
 */
export function calculateConstructionMaterials(area, ratePerSqft) {
  const sqft = Number(area);
  const rate = Number(ratePerSqft);
  if (!sqft || sqft <= 0) return null;

  return {
    built_up_sqft: sqft,
    rate_per_sqft: rate,
    total_cost: Math.round(sqft * rate),
    cement_bags: Math.round(sqft * 0.4),
    steel_kg: Math.round(sqft * 3.8),
    sand_cu_ft: Math.round(sqft * 1.8),
    aggregate_cu_ft: Math.round(sqft * 1.35),
    bricks: Math.round(sqft * 18),
    tiles_sqft: Math.round(sqft * 1.3),
    paint_liters: Math.round(sqft * 0.15),
  };
}
