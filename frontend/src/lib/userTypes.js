/** Fallback when /user-types API is unreachable — mirrors backend phase3a USER_TYPES */
export const FALLBACK_USER_TYPES = [
  { code: "customer", label: "Customer", category_types: ["marketplace", "construction", "solar", "logistics", "professional_service", "freelancer"], fields: [] },
  { code: "contractor", label: "Contractor", category_types: ["construction"], fields: ["company", "department"] },
  { code: "vendor", label: "Vendor", category_types: ["marketplace"], fields: ["company", "business_type"] },
  { code: "supplier", label: "Supplier", category_types: ["marketplace"], fields: ["company", "business_type"] },
  { code: "shop", label: "Shop", category_types: ["marketplace"], fields: ["company", "business_type"] },
  { code: "freelancer", label: "Freelancer", category_types: ["freelancer", "professional_service"], fields: ["skills", "service_area", "portfolio", "pricing", "availability"] },
  { code: "architect", label: "Architect", category_types: ["professional_service", "freelancer", "architecture"], fields: ["skills", "service_area", "portfolio"] },
  { code: "engineer", label: "Engineer", category_types: ["professional_service"], fields: ["skills", "service_area"] },
  { code: "ca", label: "CA", category_types: ["professional_service"], fields: ["skills", "service_area"] },
  { code: "transporter", label: "Transporter", category_types: ["logistics"], fields: ["company", "service_area"] },
  { code: "service_provider", label: "Service Provider", category_types: ["professional_service", "freelancer", "construction"], fields: ["skills", "service_area"] },
  { code: "employee", label: "Employee", category_types: [], fields: ["company", "department"] },
  { code: "company", label: "Company", category_types: ["construction", "marketplace"], fields: ["company", "department", "business_type"] },
  { code: "other", label: "Other", category_types: [], fields: [] },
];

export function findUserType(types, code) {
  return types.find((u) => u.code === code) || null;
}
