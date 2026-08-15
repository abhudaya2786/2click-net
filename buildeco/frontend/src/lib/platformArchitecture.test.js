import { computeMaterialEstimate, QUALITY_TIERS, getCoefficients } from "./platformArchitecture";

describe("platformArchitecture", () => {
  it("residential 1000 sqft standard tier", () => {
    const r = computeMaterialEstimate({ builtUpSqft: 1000, projectType: "residential", qualityTier: "standard" });
    expect(r.total_cost).toBe(1700000);
    expect(r.materials.cement_bags).toBe(400);
    expect(r.materials.steel_kg).toBe(3800);
    expect(r.materials.bricks).toBe(18000);
    expect(r.brands.cement).toContain("UltraTech");
  });

  it("commercial uses higher steel coefficient 4.5", () => {
    const r = computeMaterialEstimate({ builtUpSqft: 1000, projectType: "commercial", qualityTier: "standard" });
    expect(r.materials.steel_kg).toBe(4500);
  });

  it("getCoefficients for commercial", () => {
    expect(getCoefficients("commercial").steel).toBe(4.5);
  });
});
