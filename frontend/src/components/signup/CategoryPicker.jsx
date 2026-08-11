import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { typeMeta, flattenTree } from "@/lib/categoryMeta";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, Star, X, Check, Loader2, RefreshCw, Package, Sparkles, ChevronDown,
} from "lucide-react";

function highlight(text, q) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-primary/20 text-inherit rounded-sm px-0.5">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

function GroupPanel({ group, categoryType, selectedIds, primaryId, search, t, lang, onToggle, onSelectGroup, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const meta = typeMeta(categoryType, lang);
  const leaves = group.children?.length ? group.children : [group];
  const visible = leaves.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));
  if (!visible.length) return null;

  const groupSelected = visible.filter((c) => selectedIds.has(c.id)).length;

  return (
    <div className="border border-border rounded-lg mb-2 bg-card/50 overflow-hidden">
      <div className="flex items-center gap-2 px-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-2 py-3 text-left"
        >
          <span className={`h-7 w-7 rounded-md flex items-center justify-center border shrink-0 ${meta.bg}`}>
            <meta.icon className={`h-3.5 w-3.5 ${meta.color}`} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{group.name}</div>
            <div className="text-[10px] text-muted-foreground font-mono">
              {visible.length} {t("options")}{groupSelected > 0 && ` · ${groupSelected} ${t("selected")}`}
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <button
          type="button"
          onClick={() => onSelectGroup(visible)}
          className="text-[10px] font-medium text-primary hover:underline shrink-0"
        >
          {t("select_all")}
        </button>
      </div>
      {open && (
        <div className="px-3 pb-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {visible.map((c) => {
            const on = selectedIds.has(c.id);
            const isPrimary = primaryId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                data-testid={`signup-cat-${c.slug}`}
                data-selected={on}
                onClick={() => onToggle(c, categoryType, group.name)}
                className={`relative text-left p-2.5 border text-xs transition-all rounded-md ${meta.chip} ${
                  on ? "text-white shadow-sm" : "bg-background border-border text-foreground"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="font-medium leading-snug pr-4">{highlight(c.name, search)}</span>
                  {on && <Check className="h-3.5 w-3.5 shrink-0 opacity-90" />}
                </div>
                {isPrimary && (
                  <span className="absolute top-1.5 right-1.5">
                    <Star className="h-3 w-3 fill-current" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CategoryPicker({
  categoryTypes = [],
  selected = [],
  primaryId,
  onChange,
  lang = "en",
  t = (k) => k,
}) {
  const [trees, setTrees] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(categoryTypes[0] || "");

  const load = useCallback(async () => {
    if (!categoryTypes.length) {
      setTrees({});
      return;
    }
    setLoading(true);
    setError("");
    try {
      const entries = await Promise.all(
        categoryTypes.map((ct) =>
          api.get("/categories/tree", { params: { category_type: ct } })
            .then((r) => [ct, r.data])
            .catch(() => [ct, []])
        )
      );
      const map = Object.fromEntries(entries);
      setTrees(map);
      const total = entries.reduce((n, [, tree]) => n + flattenTree(tree).length, 0);
      if (total === 0) setError(t("no_categories_found"));
    } catch {
      setError(t("categories_load_failed"));
    } finally {
      setLoading(false);
    }
  }, [categoryTypes, t]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (categoryTypes.length && !categoryTypes.includes(activeTab)) {
      setActiveTab(categoryTypes[0]);
    }
  }, [categoryTypes, activeTab]);

  const selectedIds = useMemo(() => new Set(selected.map((s) => s.id)), [selected]);

  const toggle = (c, categoryType, parentName) => {
    const exists = selected.find((x) => x.id === c.id);
    let next = selected;
    let nextPrimary = primaryId;
    if (exists) {
      next = selected.filter((x) => x.id !== c.id);
      if (nextPrimary === c.id) nextPrimary = next[0]?.id || null;
    } else {
      next = [...selected, { id: c.id, name: c.name, category_type: categoryType, parent_name: parentName }];
      if (!nextPrimary) nextPrimary = c.id;
    }
    onChange(next, nextPrimary);
  };

  const selectGroup = (items, categoryType, parentName) => {
    let next = [...selected];
    let nextPrimary = primaryId;
    for (const c of items) {
      if (!next.find((x) => x.id === c.id)) {
        next.push({ id: c.id, name: c.name, category_type: categoryType, parent_name: parentName });
        if (!nextPrimary) nextPrimary = c.id;
      }
    }
    onChange(next, nextPrimary);
  };

  const filteredTrees = useMemo(() => {
    if (!search) return trees;
    const q = search.toLowerCase();
    const out = {};
    for (const [ct, tree] of Object.entries(trees)) {
      out[ct] = (tree || []).map((g) => ({
        ...g,
        children: (g.children || []).filter((c) => c.name.toLowerCase().includes(q)),
      })).filter((g) => g.children?.length || g.name.toLowerCase().includes(q));
    }
    return out;
  }, [trees, search]);

  if (!categoryTypes.length) {
    return <p className="text-sm text-muted-foreground py-6">{t("no_categories_required")}</p>;
  }

  const activeTree = filteredTrees[activeTab] || [];

  return (
    <div data-testid="step-categories" className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-display font-bold text-lg">{t("select_categories")}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t("categories_hint")}</p>
        </div>
        {selected.length > 0 && (
          <Badge variant="secondary" className="rounded-full shrink-0">
            {selected.length} {t("selected")}
          </Badge>
        )}
      </div>

      {selected.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">{t("your_selection")}</span>
            <button type="button" onClick={() => onChange([], null)} className="text-xs text-primary hover:underline">{t("clear_all")}</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selected.map((s) => {
              const isPrimary = primaryId === s.id;
              return (
                <span
                  key={s.id}
                  className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 border rounded-full ${
                    isPrimary ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border"
                  }`}
                >
                  {isPrimary ? (
                    <Star className="h-3 w-3 fill-current" />
                  ) : (
                    <button type="button" onClick={() => onChange(selected, s.id)} title={t("make_primary")}>
                      <Star className="h-3 w-3 opacity-50 hover:opacity-100" />
                    </button>
                  )}
                  <span className="max-w-[120px] truncate">{s.name}</span>
                  <button type="button" onClick={() => toggle({ id: s.id, name: s.name }, s.category_type, s.parent_name)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
          {!primaryId && <p className="text-[10px] text-amber-600 mt-2">{t("tap_star_primary")}</p>}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-testid="cat-search-signup"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search_categories")}
          className="rounded-lg pl-9 h-11"
        />
      </div>

      {categoryTypes.length > 1 && (
        <div className="flex flex-wrap gap-1.5 p-1 bg-muted/50 rounded-lg">
          {categoryTypes.map((ct) => {
            const meta = typeMeta(ct, lang);
            const count = flattenTree(trees[ct] || []).length;
            const Icon = meta.icon;
            const active = activeTab === ct;
            return (
              <button
                key={ct}
                type="button"
                onClick={() => setActiveTab(ct)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-md transition-all ${
                  active ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                {meta.labelText}
                <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center justify-between gap-3 text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-3 rounded-lg">
          <span>{error}</span>
          <button type="button" onClick={load} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <RefreshCw className="h-3.5 w-3.5" />{t("retry")}
          </button>
        </div>
      )}

      {!loading && !error && (
        activeTree.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">{search ? t("no_search_results") : t("no_categories_found")}</p>
          </div>
        ) : (
          <div className="max-h-[28rem] overflow-y-auto pr-1">
            {activeTree.map((group, i) => (
              <GroupPanel
                key={group.id}
                group={group}
                categoryType={activeTab}
                selectedIds={selectedIds}
                primaryId={primaryId}
                search={search}
                t={t}
                lang={lang}
                onToggle={toggle}
                onSelectGroup={(items) => selectGroup(items, activeTab, group.name)}
                defaultOpen={i < 2 || !!search}
              />
            ))}
          </div>
        )
      )}

      {loading && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
