import { materialLabel } from "./tenderConstants";

function isOpenTender(t) {
  if (!t) return false;
  if (String(t.status || "").toLowerCase() === "closed") return false;
  if (!t.closes_at) return true;
  const closes = new Date(t.closes_at).getTime();
  if (Number.isNaN(closes)) return true;
  return closes > Date.now();
}

export function normalizeTendersResponse(data) {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.tenders)
      ? data.tenders
      : [];
  const grouped = data && !Array.isArray(data) && data.grouped_by_material
    ? data.grouped_by_material
    : null;
  return { list, grouped };
}

export function groupTendersByMaterial(list) {
  const grouped = {};
  list.forEach((t) => {
    const key = t.material_type || t.category || "general";
    grouped[key] = grouped[key] || [];
    grouped[key].push(t);
  });
  return grouped;
}

/** Prefer live/open tenders; if the API only has expired test rows, still show them. */
export function pickDisplayTenders(list) {
  const open = list.filter(isOpenTender);
  if (open.length) return open;
  return list;
}

export function materialGroupLabel(key) {
  try {
    return materialLabel(key);
  } catch {
    return key;
  }
}
