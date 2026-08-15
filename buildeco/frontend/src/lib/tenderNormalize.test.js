import { normalizeTendersResponse, pickDisplayTenders, groupTendersByMaterial } from "./tenderNormalize";
import { lookupPincode, fallbackCities } from "./geoFallback";

describe("tenderNormalize", () => {
  it("reads a raw array from the live API", () => {
    const { list } = normalizeTendersResponse([{ id: "a", title: "T1" }]);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("a");
  });

  it("reads { tenders, grouped_by_material }", () => {
    const { list, grouped } = normalizeTendersResponse({
      tenders: [{ id: "b" }],
      grouped_by_material: { cement: [{ id: "b" }] },
    });
    expect(list[0].id).toBe("b");
    expect(grouped.cement).toHaveLength(1);
  });

  it("keeps expired tenders when none are still open", () => {
    const expired = [{ id: "old", closes_at: "2020-01-01T00:00:00Z", status: "open" }];
    expect(pickDisplayTenders(expired)).toHaveLength(1);
  });

  it("prefers still-open tenders", () => {
    const mix = [
      { id: "old", closes_at: "2020-01-01T00:00:00Z" },
      { id: "new", closes_at: "2099-01-01T00:00:00Z" },
    ];
    const out = pickDisplayTenders(mix);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("new");
  });

  it("groups by material_type", () => {
    const g = groupTendersByMaterial([
      { id: "1", material_type: "cement" },
      { id: "2", material_type: "cement" },
      { id: "3", category: "Steel & TMT" },
    ]);
    expect(g.cement).toHaveLength(2);
    expect(g["Steel & TMT"]).toHaveLength(1);
  });
});

describe("geoFallback", () => {
  it("looks up a seeded pincode", () => {
    const row = lookupPincode("201301");
    expect(row.city).toBe("Noida");
    expect(row.state).toBe("Uttar Pradesh");
  });

  it("lists cities for Maharashtra", () => {
    expect(fallbackCities("Maharashtra")).toContain("Pune");
  });
});
