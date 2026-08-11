import axios from "axios";
import { api } from "./api";

const PRODUCTION_API = "https://wallet-vendor-mvp.emergent.host";

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

async function fetchTreeFromBase(baseUrl, categoryType) {
  const root = baseUrl.replace(/\/$/, "");
  const apiBase = root.endsWith("/api") ? root : `${root}/api`;
  const enc = encodeURIComponent(categoryType);

  try {
    const r = await axios.get(`${apiBase}/categories/tree`, {
      params: { category_type: categoryType },
      timeout: 20000,
    });
    const tree = asList(r.data);
    if (tree.length) return tree;
  } catch {
    /* try flat endpoints */
  }

  try {
    const r = await axios.get(`${apiBase}/categories/type/${enc}`, { timeout: 20000 });
    const flat = asList(r.data);
    if (flat.length) return buildTreeFromFlat(flat);
  } catch {
    /* continue */
  }

  try {
    const r = await axios.get(`${apiBase}/categories`, {
      params: { category_type: categoryType },
      timeout: 20000,
    });
    const flat = asList(r.data);
    if (flat.length) return buildTreeFromFlat(flat);
  } catch {
    /* continue */
  }

  return [];
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

  return await fetchTreeFromBase(PRODUCTION_API, categoryType);
}

/** Load grouped category trees for signup — resilient to API host / endpoint issues. */
export async function fetchCategoryTrees(categoryTypes) {
  if (!categoryTypes?.length) return {};
  const entries = await Promise.all(
    categoryTypes.map(async (ct) => [ct, await fetchTreeForType(ct)])
  );
  return Object.fromEntries(entries);
}
