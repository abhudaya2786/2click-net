import { reverseGeocodeSafe, locateWithNominatim } from "./GpsLocator";
import { fetchNominatimReverse } from "../../lib/nominatim";

jest.mock("../../lib/nominatim", () => ({
  fetchNominatimReverse: jest.fn(),
  formatLiveAddress: (loc) => (loc && loc.display_name) || [loc?.city, loc?.state, loc?.pincode].filter(Boolean).join(", "),
}));

describe("GpsLocator helpers", () => {
  beforeEach(() => {
    fetchNominatimReverse.mockReset();
  });

  it("returns coordinates and address when Nominatim succeeds", async () => {
    fetchNominatimReverse.mockResolvedValue({
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226027",
      display_name: "Lucknow, Uttar Pradesh, 226027, India",
      source: "nominatim",
    });
    const row = await reverseGeocodeSafe(26.8467, 80.9462);
    expect(row.ok).toBe(true);
    expect(row.lat).toBe(26.8467);
    expect(row.address).toContain("Lucknow");
    expect(row.error).toBeNull();
  });

  it("does not throw when Nominatim fails", async () => {
    fetchNominatimReverse.mockRejectedValue(new Error("network down"));
    const row = await reverseGeocodeSafe(26.8467, 80.9462);
    expect(row.ok).toBe(true);
    expect(row.lat).toBe(26.8467);
    expect(row.address).toContain("26.84670");
    expect(row.error).toMatch(/network down/i);
  });

  it("maps blocked geolocation without throwing", async () => {
    const original = global.navigator;
    Object.defineProperty(global, "navigator", {
      configurable: true,
      value: {
        geolocation: {
          getCurrentPosition: (_ok, fail) => fail({ code: 1, message: "denied" }),
        },
      },
    });
    const row = await locateWithNominatim();
    expect(row.ok).toBe(false);
    expect(row.error).toMatch(/blocked/i);
    Object.defineProperty(global, "navigator", { configurable: true, value: original });
  });
});
