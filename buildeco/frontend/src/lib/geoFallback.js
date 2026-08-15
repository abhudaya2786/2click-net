/** Offline India geo used when /api/geo/* is missing on the live backend. */

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
  "Chandigarh", "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep",
];

export const CITIES_BY_STATE = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad"],
  Delhi: ["New Delhi", "South Delhi", "North Delhi", "East Delhi", "West Delhi"],
  Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Noida", "Ghaziabad", "Gorakhpur", "Varanasi"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur"],
  Telangana: ["Hyderabad", "Warangal"],
  Haryana: ["Gurugram", "Faridabad", "Panipat"],
  Punjab: ["Chandigarh", "Ludhiana", "Amritsar"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur"],
  Bihar: ["Patna", "Gaya", "Muzaffarpur"],
  Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode"],
};

export const PINCODE_SEED = [
  { pincode: "400001", state: "Maharashtra", city: "Mumbai", district: "Mumbai", lat: 18.9388, lng: 72.8354 },
  { pincode: "411001", state: "Maharashtra", city: "Pune", district: "Pune", lat: 18.5204, lng: 73.8567 },
  { pincode: "110001", state: "Delhi", city: "New Delhi", district: "Central Delhi", lat: 28.6139, lng: 77.209 },
  { pincode: "560001", state: "Karnataka", city: "Bengaluru", district: "Bengaluru Urban", lat: 12.9716, lng: 77.5946 },
  { pincode: "380001", state: "Gujarat", city: "Ahmedabad", district: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { pincode: "201301", state: "Uttar Pradesh", city: "Noida", district: "Gautam Buddha Nagar", lat: 28.5355, lng: 77.391 },
  { pincode: "122001", state: "Haryana", city: "Gurugram", district: "Gurugram", lat: 28.4595, lng: 77.0266 },
  { pincode: "273001", state: "Uttar Pradesh", city: "Gorakhpur", district: "Gorakhpur", lat: 26.7606, lng: 83.3732 },
  { pincode: "396191", state: "Gujarat", city: "Vapi", district: "Valsad", lat: 20.3893, lng: 72.9106 },
  { pincode: "700001", state: "West Bengal", city: "Kolkata", district: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { pincode: "500001", state: "Telangana", city: "Hyderabad", district: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { pincode: "302001", state: "Rajasthan", city: "Jaipur", district: "Jaipur", lat: 26.9124, lng: 75.7873 },
];

const PIN_MAP = Object.fromEntries(PINCODE_SEED.map((r) => [r.pincode, r]));

export function fallbackStates() {
  return INDIAN_STATES;
}

export function fallbackDistricts(state) {
  const set = new Set(PINCODE_SEED.filter((r) => r.state === state).map((r) => r.district));
  return [...set];
}

export function fallbackCities(state, district) {
  let cities = CITIES_BY_STATE[state] || [];
  if (district) {
    const fromPin = PINCODE_SEED.filter((r) => r.state === state && r.district === district).map((r) => r.city);
    if (fromPin.length) cities = [...new Set(fromPin)];
  }
  return cities;
}

export function fallbackPincodes({ state, city, district } = {}) {
  return PINCODE_SEED.filter((r) => {
    if (state && r.state !== state) return false;
    if (city && r.city !== city) return false;
    if (district && r.district !== district) return false;
    return true;
  });
}

export function lookupPincode(code) {
  const pin = String(code || "").replace(/\D/g, "");
  return PIN_MAP[pin] || null;
}

export function reverseGeocode(lat, lng) {
  if (lat == null || lng == null) return null;
  let best = null;
  let bestD = Infinity;
  for (const row of PINCODE_SEED) {
    const d = (row.lat - lat) ** 2 + (row.lng - lng) ** 2;
    if (d < bestD) {
      bestD = d;
      best = row;
    }
  }
  return best;
}
