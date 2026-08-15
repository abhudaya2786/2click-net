import { calculateConstructionMaterials } from "./materialCalculator";

describe("materialCalculator", () => {
  it("calculates materials for 1000 sqft standard rate", () => {
    const r = calculateConstructionMaterials(1000, 1700);
    expect(r.total_cost).toBe(1700000);
    expect(r.cement_bags).toBe(400);
    expect(r.steel_kg).toBe(3800);
    expect(r.sand_cu_ft).toBe(1800);
    expect(r.aggregate_cu_ft).toBe(1350);
    expect(r.bricks).toBe(18000);
    expect(r.tiles_sqft).toBe(1300);
    expect(r.paint_liters).toBe(150);
  });

  it("returns null for invalid area", () => {
    expect(calculateConstructionMaterials(0, 1700)).toBeNull();
    expect(calculateConstructionMaterials(-100, 1700)).toBeNull();
  });
});
