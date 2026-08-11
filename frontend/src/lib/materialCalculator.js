/** House construction material & cost calculator — sqft-based formulas */

import { getCoefficients, getBrandRecommendations } from "./platformArchitecture";

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
export function calculateConstructionMaterials(area, ratePerSqft, projectType = "residential") {
  const sqft = Number(area);
  const rate = Number(ratePerSqft);
  if (!sqft || sqft <= 0) return null;

  const coeff = getCoefficients(projectType);
  const tierId = rate === 1400 ? "basic" : rate === 2200 ? "premium" : "standard";
  const brands = getBrandRecommendations(tierId);

  return {
    built_up_sqft: sqft,
    rate_per_sqft: rate,
    total_cost: Math.round(sqft * rate),
    cement_bags: Math.round(sqft * coeff.cement),
    steel_kg: Math.round(sqft * coeff.steel),
    sand_cu_ft: Math.round(sqft * coeff.sand),
    aggregate_cu_ft: Math.round(sqft * coeff.aggregate),
    bricks: Math.round(sqft * coeff.bricks),
    tiles_sqft: Math.round(sqft * coeff.tiles),
    paint_liters: Math.round(sqft * coeff.paint),
    brands,
  };
}
