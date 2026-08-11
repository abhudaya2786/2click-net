import {
  buildFullWorkflow,
  buildPrompt1Concept,
  buildPrompt5LookXRender,
  computeLayoutZones,
  FOV_DEFAULT,
} from "./ai3dStudio";

describe("ai3dStudio workflow", () => {
  it("computes zones for 400 sqft studio", () => {
    const zones = computeLayoutZones(400);
    expect(zones[0].sqft).toBe(160);
    expect(zones[1].sqft).toBe(100);
    expect(zones[2].sqft).toBe(80);
    expect(zones[3].sqft).toBe(60);
  });

  it("builds 5 prompts in full workflow", () => {
    const w = buildFullWorkflow({ builtUpSqft: 400, fov: FOV_DEFAULT });
    expect(w.prompts.prompt1).toContain("architectural prompt engineer");
    expect(w.prompts.prompt2).toContain("isometric");
    expect(w.prompts.prompt3).toContain("Redesign this uploaded room");
    expect(w.prompts.prompt4).toContain("ergonomic workstation");
    expect(w.prompts.prompt5).toContain("raytracing");
  });

  it("prompt1 includes zoning percentages", () => {
    const p = buildPrompt1Concept({ builtUpSqft: 400 });
    expect(p).toContain("40%");
    expect(p).toContain("400 sq ft");
  });

  it("prompt5 matches LookX render template", () => {
    const p = buildPrompt5LookXRender();
    expect(p).toContain("soft warm filling light from the left");
    expect(p).toContain("raytracing");
  });
});
