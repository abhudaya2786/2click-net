import { parseNominatimAddress, nominatimUrl, fetchNominatimReverse, formatLiveAddress } from "./nominatim";

describe("nominatim reverse geocode", () => {
  it("builds the OSM reverse URL with lat/lon", () => {
    expect(nominatimUrl(26.8467, 80.9462)).toBe(
      "https://nominatim.openstreetmap.org/reverse?format=json&lat=26.8467&lon=80.9462&addressdetails=1",
    );
  });

  it("parses Lucknow city, state, and pincode from Nominatim JSON", () => {
    const row = parseNominatimAddress({
      display_name: "Lucknow, Uttar Pradesh, 226001, India",
      address: {
        city: "Lucknow",
        state: "Uttar Pradesh",
        postcode: "226001",
        country: "India",
      },
    });
    expect(row.city).toBe("Lucknow");
    expect(row.state).toBe("Uttar Pradesh");
    expect(row.pincode).toBe("226001");
    expect(row.display_name).toContain("Lucknow");
  });

  it("uses town/village when city is missing", () => {
    const row = parseNominatimAddress({
      address: { town: "Vapi", state: "Gujarat", postcode: "396191" },
    });
    expect(row.city).toBe("Vapi");
  });

  it("returns null for empty payloads", () => {
    expect(parseNominatimAddress(null)).toBeNull();
    expect(parseNominatimAddress({})).toBeNull();
  });

  it("formatLiveAddress prefers display_name then city/state/pin", () => {
    expect(formatLiveAddress({ display_name: "Lucknow, Uttar Pradesh, India" })).toContain("Lucknow");
    expect(formatLiveAddress({ city: "Lucknow", state: "Uttar Pradesh", pincode: "226027" })).toBe(
      "Lucknow, Uttar Pradesh, 226027",
    );
  });

  it("fetchNominatimReverse maps JSON via fetch", async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        display_name: "Lucknow, Uttar Pradesh, India",
        address: { city: "Lucknow", state: "Uttar Pradesh", postcode: "226001" },
      }),
    });
    const row = await fetchNominatimReverse(26.8467, 80.9462, { fetchImpl });
    expect(fetchImpl).toHaveBeenCalled();
    expect(row.city).toBe("Lucknow");
    expect(row.state).toBe("Uttar Pradesh");
  });
});
