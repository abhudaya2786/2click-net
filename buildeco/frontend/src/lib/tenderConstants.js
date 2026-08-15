/** Tender taxonomy — subject (work type) + material_type (procurement category) */

export const TENDER_SUBJECTS = [
  { id: "material_supply", label: "Material Supply", labelHi: "सामग्री आपूर्ति" },
  { id: "civil_construction", label: "Civil & Construction", labelHi: "सिविल निर्माण" },
  { id: "mep", label: "MEP (Electrical / Plumbing)", labelHi: "MEP कार्य" },
  { id: "solar_epc", label: "Solar EPC", labelHi: "सोलर EPC" },
  { id: "interior_finishing", label: "Interior & Finishing", labelHi: "इंटीरियर" },
  { id: "logistics", label: "Logistics & Transport", labelHi: "लॉजिस्टिक्स" },
  { id: "consultancy", label: "Consultancy & Design", labelHi: "परामर्श" },
  { id: "labour_services", label: "Labour & Services", labelHi: "श्रम सेवाएँ" },
];

export const MATERIAL_TYPES = [
  { id: "steel_tmt", label: "Steel & TMT", icon: "🔩" },
  { id: "cement_concrete", label: "Cement & Concrete", icon: "🧱" },
  { id: "sand_aggregate", label: "Sand & Aggregate", icon: "⛰️" },
  { id: "bricks_blocks", label: "Bricks & Blocks", icon: "🧱" },
  { id: "electrical", label: "Electrical", icon: "⚡" },
  { id: "plumbing", label: "Plumbing", icon: "🚿" },
  { id: "tiles_flooring", label: "Tiles & Flooring", icon: "◻️" },
  { id: "paint_chemicals", label: "Paint & Chemicals", icon: "🎨" },
  { id: "plywood_wood", label: "Plywood & Wood", icon: "🪵" },
  { id: "solar", label: "Solar Equipment", icon: "☀️" },
  { id: "waterproofing", label: "Waterproofing", icon: "💧" },
  { id: "general", label: "General / Mixed", icon: "📦" },
];

export function subjectLabel(id) {
  return TENDER_SUBJECTS.find((s) => s.id === id)?.label || id || "General";
}

export function materialLabel(id) {
  return MATERIAL_TYPES.find((m) => m.id === id)?.label || id || "General";
}

export const EMPTY_TENDER_FORM = {
  title: "",
  description: "",
  subject: "material_supply",
  material_type: "steel_tmt",
  category: "Steel & TMT",
  budget: "",
  emd: "",
  quantity: "",
  unit: "MT",
  location: "",
  closes_in_minutes: 1440,
  auction: true,
  published: true,
};
