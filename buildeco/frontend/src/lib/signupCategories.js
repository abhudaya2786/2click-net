import { api } from "./api";

function asList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.categories)) return data.categories;
  return [];
}

function buildTreeFromFlat(list) {
  if (!list?.length) return [];
  const byParent = {};
  for (const c of list) {
    const pid = c.parent_id || "__root__";
    if (!byParent[pid]) byParent[pid] = [];
    byParent[pid].push(c);
  }
  const attach = (pid) =>
    (byParent[pid] || []).map((c) => ({
      ...c,
      children: attach(c.id),
    }));
  const roots = attach("__root__");
  return roots.map((r) => ({
    ...r,
    children: r.children?.length ? r.children : undefined,
  }));
}

async function fetchTreeForType(categoryType) {
  try {
    const r = await api.get("/categories/tree", { params: { category_type: categoryType } });
    const tree = asList(r.data);
    if (tree.length) return tree;
  } catch {
    /* fallback */
  }

  try {
    const r = await api.get(`/categories/type/${encodeURIComponent(categoryType)}`);
    const flat = asList(r.data);
    if (flat.length) return buildTreeFromFlat(flat);
  } catch {
    /* fallback */
  }

  try {
    const r = await api.get("/categories", { params: { category_type: categoryType } });
    const flat = asList(r.data);
    if (flat.length) return buildTreeFromFlat(flat);
  } catch {
    /* fallback */
  }

  return fallbackTreeForType(categoryType);
}

const FALLBACK_SEEDS = {
  marketplace: { name: "Marketplace", children: ["Cement", "Steel", "Sand", "Aggregate", "Bricks", "Electrical Material", "Plumbing Material", "Hardware", "Paint", "Tiles"] },
  construction: { name: "Construction", children: ["Civil Work", "Plumbing", "Electrical", "Painting", "Tiles", "Flooring", "Wood Work", "Interior", "Renovation"] },
  solar: { name: "Solar", children: ["Solar Panels", "Inverters", "Batteries", "Structure", "Installation"] },
  logistics: { name: "Logistics", children: ["Dumper", "Tipper", "JCB", "Crane", "Heavy Transport"] },
  professional_service: { name: "Professional Services", children: ["Architect", "Engineer", "CA", "Legal", "Consultant", "Freelancer"] },
  freelancer: { name: "Freelancer Services", children: ["Architecture", "CAD Design", "3D Design", "Estimation", "BOQ", "Accounting"] },
  architecture: { name: "Architecture", children: ["Residential", "Commercial", "Interior Design", "Vastu", "3D Visualization"] },
};

export function fallbackTreeForType(categoryType) {
  const seed = FALLBACK_SEEDS[categoryType];
  if (!seed) return [];
  const parentId = `fallback_${categoryType}`;
  return [{
    id: parentId,
    name: seed.name,
    slug: categoryType,
    category_type: categoryType,
    parent_id: null,
    children: seed.children.map((name, i) => ({
      id: `${parentId}_${i}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      category_type: categoryType,
      parent_id: parentId,
    })),
  }];
}

/** Load grouped category trees for signup. */
export async function fetchCategoryTrees(categoryTypes) {
  if (!categoryTypes?.length) return {};
  const entries = await Promise.all(
    categoryTypes.map(async (ct) => [ct, await fetchTreeForType(ct)])
  );
  return Object.fromEntries(entries);
}
