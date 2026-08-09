import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Building2, Network, Shield, Grid3x3, UserCog, Boxes, Menu as MenuIcon, ScrollText, Plus, Loader2, Trash2, Check, Tag, Palette, CreditCard, Receipt, Store, Wallet, Sun } from "lucide-react";
import { useBranding } from "@/context/BrandingContext";
import AdminBilling from "@/pages/dashboard/AdminBilling";
import AdminMaterials from "@/pages/dashboard/AdminMaterials";
import SolarBrandsManager from "@/components/solar/SolarBrandsManager";

const TABS = [
  { id: "companies", label: "Companies", icon: Building2 },
  { id: "departments", label: "Departments", icon: Network },
  { id: "roles", label: "Roles", icon: Shield },
  { id: "matrix", label: "Permission Matrix", icon: Grid3x3 },
  { id: "assign", label: "Users & Assignments", icon: UserCog },
  { id: "categories", label: "Categories", icon: Tag },
  { id: "branding", label: "White Label", icon: Palette },
  { id: "pricing", label: "Plans & Commission", icon: CreditCard },
  { id: "billing", label: "Billing", icon: Receipt },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "materials", label: "Super Mart", icon: Store },
  { id: "solar", label: "Solar Brands", icon: Sun },
  { id: "modules", label: "Modules", icon: Boxes },
  { id: "menus", label: "Menus", icon: MenuIcon },
  { id: "audit", label: "Audit Logs", icon: ScrollText },
];
const R = "/admin/rbac";
const A = "/admin";

export default function AdminRBAC() {
  const [tab, setTab] = useState("departments");
  return (
    <div>
      <div className="flex flex-wrap gap-1 border border-border bg-card mb-6">
        {TABS.map((t) => (
          <button key={t.id} data-testid={`rbac-tab-${t.id}`} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${tab === t.id ? "bg-primary text-white" : "hover:bg-accent text-muted-foreground"}`}>
            <t.icon className="h-4 w-4" strokeWidth={1.5} />{t.label}
          </button>
        ))}
      </div>
      {tab === "companies" && <Companies />}
      {tab === "departments" && <Departments />}
      {tab === "roles" && <Roles />}
      {tab === "matrix" && <Matrix />}
      {tab === "assign" && <Assignments />}
      {tab === "categories" && <Categories />}
      {tab === "branding" && <Branding />}
      {tab === "pricing" && <PricingCommission />}
      {tab === "billing" && <AdminBilling />}
      {tab === "wallet" && <AdminWallet />}
      {tab === "materials" && <AdminMaterials />}
      {tab === "solar" && <SolarBrandsManager scope="admin" />}
      {tab === "modules" && <SimpleList url={`${R}/modules`} cols={["name", "code", "status"]} testid="modules" />}
      {tab === "menus" && <SimpleList url={`${R}/menus`} cols={["name", "module_code", "path"]} testid="menus" />}
      {tab === "audit" && <Audit />}
    </div>
  );
}

function Panel({ title, action, children }) {
  return (
    <div className="bg-card border border-border">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <h3 className="font-display font-bold text-sm tracking-tight">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Companies() {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const load = () => api.get(`${R}/companies`).then(({ data }) => setRows(data));
  useEffect(() => { load(); }, []);
  const add = async () => { if (!name) return; await api.post(`${R}/companies`, { name }); setName(""); toast.success("Company created"); load(); };
  return (
    <Panel title="Companies" action={<div className="flex gap-2"><Input data-testid="company-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="New company" className="rounded-none h-9 w-52" /><Button data-testid="add-company" onClick={add} size="sm" className="rounded-none"><Plus className="h-4 w-4" /></Button></div>}>
      <table className="w-full text-sm">
        <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="p-3">Name</th><th className="p-3">Code</th><th className="p-3">Status</th></tr></thead>
        <tbody>{rows.map((c) => (<tr key={c.id} className="border-b border-border hover:bg-muted/50"><td className="p-3 font-medium">{c.name}</td><td className="p-3 font-mono text-xs">{c.code}</td><td className="p-3"><span className="text-xs font-mono bg-solar/10 text-solar px-2 py-0.5">{c.status}</span></td></tr>))}</tbody>
      </table>
    </Panel>
  );
}

function Departments() {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const load = () => api.get(`${R}/departments`).then(({ data }) => setRows(data));
  useEffect(() => { load(); }, []);
  const add = async () => { if (!name) return; await api.post(`${R}/departments`, { name }); setName(""); toast.success("Department created"); load(); };
  const toggle = async (d) => { await api.patch(`${R}/departments/${d.id}`, { status: d.status === "active" ? "disabled" : "active" }); load(); };
  return (
    <Panel title={`Departments (${rows.length})`} action={<div className="flex gap-2"><Input data-testid="dept-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="New department" className="rounded-none h-9 w-52" /><Button data-testid="add-dept" onClick={add} size="sm" className="rounded-none"><Plus className="h-4 w-4" /></Button></div>}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
        {rows.map((d) => (
          <div key={d.id} data-testid={`dept-${d.code}`} className="bg-card p-4 flex items-center justify-between">
            <div><div className="font-medium text-sm">{d.name}</div><div className="text-xs text-muted-foreground font-mono">{d.code}</div></div>
            <button onClick={() => toggle(d)} className={`text-[10px] font-mono px-2 py-0.5 ${d.status === "active" ? "bg-solar/10 text-solar" : "bg-muted text-muted-foreground"}`}>{d.status}</button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Roles() {
  const [rows, setRows] = useState([]);
  const [depts, setDepts] = useState([]);
  const [form, setForm] = useState({ name: "", department_id: "" });
  const load = () => api.get(`${R}/roles`).then(({ data }) => setRows(data));
  useEffect(() => { load(); api.get(`${R}/departments`).then(({ data }) => setDepts(data)); }, []);
  const add = async () => { if (!form.name) return; await api.post(`${R}/roles`, form); setForm({ name: "", department_id: "" }); toast.success("Role created"); load(); };
  const del = async (r) => { await api.delete(`${R}/roles/${r.id}`); toast.success("Role disabled"); load(); };
  return (
    <Panel title={`Roles (${rows.length})`} action={
      <div className="flex gap-2">
        <select data-testid="role-dept" value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} className="bg-background border border-input px-2 h-9 text-sm"><option value="">Department…</option>{depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        <Input data-testid="role-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="New role" className="rounded-none h-9 w-44" />
        <Button data-testid="add-role" onClick={add} size="sm" className="rounded-none"><Plus className="h-4 w-4" /></Button>
      </div>}>
      <table className="w-full text-sm">
        <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="p-3">Role</th><th className="p-3">Code</th><th className="p-3">Type</th><th className="p-3">Perms</th><th className="p-3">Users</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.id} className="border-b border-border hover:bg-muted/50">
            <td className="p-3 font-medium">{r.name}</td><td className="p-3 font-mono text-xs">{r.code}</td>
            <td className="p-3">{r.is_system_role ? <span className="text-xs font-mono bg-tender/10 text-tender px-2 py-0.5">system</span> : <span className="text-xs font-mono bg-muted px-2 py-0.5">custom</span>}</td>
            <td className="p-3 font-mono">{r.perm_count}</td><td className="p-3 font-mono">{r.user_count}</td>
            <td className="p-3"><span className={`text-xs font-mono px-2 py-0.5 ${r.status === "active" ? "bg-solar/10 text-solar" : "bg-muted text-muted-foreground"}`}>{r.status}</span></td>
            <td className="p-3">{!r.is_system_role && <button onClick={() => del(r)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>}</td>
          </tr>))}</tbody>
      </table>
    </Panel>
  );
}

function Matrix() {
  const [meta, setMeta] = useState({ actions: [], modules: [] });
  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState("");
  const [grid, setGrid] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`${R}/meta`).then(({ data }) => setMeta(data));
    api.get(`${R}/roles`).then(({ data }) => { setRoles(data); if (data[0]) setRoleId(data[0].id); });
  }, []);

  const loadPerms = useCallback(async (rid) => {
    if (!rid) return;
    setLoading(true);
    const { data } = await api.get(`${R}/roles/${rid}/permissions`);
    setGrid(new Set(data.permissions));
    setLoading(false);
  }, []);
  useEffect(() => { loadPerms(roleId); }, [roleId, loadPerms]);

  const key = (m, a) => `${m}:${a}`;
  const toggle = (m, a) => { const n = new Set(grid); const k = key(m, a); n.has(k) ? n.delete(k) : n.add(k); setGrid(n); };
  const toggleRow = (m, on) => { const n = new Set(grid); meta.actions.forEach((a) => on ? n.add(key(m, a)) : n.delete(key(m, a))); setGrid(n); };
  const selectAll = (on) => { const n = new Set(); if (on) meta.modules.forEach((mo) => meta.actions.forEach((a) => n.add(key(mo.code, a)))); setGrid(n); };
  const save = async () => { setSaving(true); try { await api.put(`${R}/roles/${roleId}/permissions`, { permissions: [...grid] }); toast.success("Permissions saved"); } catch (e) { toast.error(e.response?.data?.detail || "Save failed"); } finally { setSaving(false); } };

  return (
    <Panel title="Role Permission Matrix" action={
      <div className="flex items-center gap-2">
        <select data-testid="matrix-role" value={roleId} onChange={(e) => setRoleId(e.target.value)} className="bg-background border border-input px-2 h-9 text-sm">{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
        <Button variant="outline" size="sm" onClick={() => selectAll(true)} className="rounded-none">All</Button>
        <Button variant="outline" size="sm" onClick={() => selectAll(false)} className="rounded-none">Clear</Button>
        <Button data-testid="matrix-save" size="sm" onClick={save} disabled={saving} className="rounded-none">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
      </div>}>
      {loading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border sticky top-0 bg-card">
              <th className="p-2 text-left sticky left-0 bg-card min-w-[160px]">Module</th>
              {meta.actions.map((a) => <th key={a} className="p-2 font-mono text-[10px] text-muted-foreground rotate-0">{a}</th>)}
            </tr></thead>
            <tbody>{meta.modules.map((mo) => {
              const rowOn = meta.actions.every((a) => grid.has(key(mo.code, a)));
              return (
                <tr key={mo.code} data-testid={`matrix-row-${mo.code}`} className="border-b border-border hover:bg-muted/50">
                  <td className="p-2 sticky left-0 bg-card"><button onClick={() => toggleRow(mo.code, !rowOn)} className="font-medium hover:text-primary text-left">{mo.name}</button></td>
                  {meta.actions.map((a) => {
                    const on = grid.has(key(mo.code, a));
                    return <td key={a} className="p-1 text-center">
                      <button data-testid={`cell-${mo.code}-${a}`} onClick={() => toggle(mo.code, a)}
                        className={`h-6 w-6 border flex items-center justify-center mx-auto transition-colors ${on ? "bg-primary border-primary text-white" : "border-border hover:border-primary"}`}>
                        {on && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                      </button>
                    </td>;
                  })}
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function Assignments() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [pick, setPick] = useState({});
  const load = () => api.get(`${R}/users`).then(({ data }) => setUsers(data));
  useEffect(() => { load(); api.get(`${R}/roles`).then(({ data }) => setRoles(data)); }, []);
  const assign = async (uid) => { const rid = pick[uid]; if (!rid) return; try { await api.post(`${R}/user-roles`, { user_id: uid, role_id: rid }); toast.success("Role assigned"); load(); } catch (e) { toast.error(e.response?.data?.detail || "Failed"); } };
  const remove = async (urid) => { await api.delete(`${R}/user-roles/${urid}`); toast.success("Removed"); load(); };
  const roleName = (id) => roles.find((r) => r.id === id)?.name || id;
  return (
    <Panel title="Users & Role Assignments">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="p-3">User</th><th className="p-3">Legacy Role</th><th className="p-3">Assigned Roles</th><th className="p-3">Assign</th></tr></thead>
        <tbody>{users.map((u) => (
          <tr key={u.id} className="border-b border-border align-top hover:bg-muted/50">
            <td className="p-3"><div className="font-medium">{u.name}</div><div className="text-xs text-muted-foreground font-mono">{u.email}</div></td>
            <td className="p-3"><span className="text-xs font-mono bg-muted px-2 py-0.5">{u.role}</span></td>
            <td className="p-3"><div className="flex flex-wrap gap-1.5">{(u.assignments || []).map((a) => (
              <span key={a.id} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5">{roleName(a.role_id)}<button onClick={() => remove(a.id)} className="hover:text-destructive"><Trash2 className="h-3 w-3" /></button></span>
            ))}{(u.assignments || []).length === 0 && <span className="text-xs text-muted-foreground">—</span>}</div></td>
            <td className="p-3"><div className="flex gap-2">
              <select data-testid={`assign-role-${u.id}`} value={pick[u.id] || ""} onChange={(e) => setPick({ ...pick, [u.id]: e.target.value })} className="bg-background border border-input px-2 py-1 text-xs"><option value="">Role…</option>{roles.filter((r) => r.status === "active").map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
              <button data-testid={`assign-btn-${u.id}`} onClick={() => assign(u.id)} className="h-7 px-2 bg-primary text-white text-xs">Assign</button>
            </div></td>
          </tr>))}</tbody>
      </table>
    </Panel>
  );
}

function SimpleList({ url, cols, testid }) {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get(url).then(({ data }) => setRows(data)); }, [url]);
  return (
    <Panel title={testid.charAt(0).toUpperCase() + testid.slice(1)}>
      <table className="w-full text-sm">
        <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">{cols.map((c) => <th key={c} className="p-3">{c.replace("_", " ")}</th>)}</tr></thead>
        <tbody>{rows.map((r) => (<tr key={r.id} className="border-b border-border hover:bg-muted/50">{cols.map((c) => <td key={c} className="p-3 font-mono text-xs">{String(r[c] ?? "")}</td>)}</tr>))}</tbody>
      </table>
    </Panel>
  );
}

function Categories() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name: "", category_type: "construction", parent_id: "" });
  const [q, setQ] = useState("");
  const load = () => api.get("/categories", { params: { include_disabled: true } }).then(({ data }) => setRows(data));
  useEffect(() => { load(); }, []);
  const add = async () => {
    if (!form.name) return;
    try { await api.post("/categories", { name: form.name, category_type: form.category_type, parent_id: form.parent_id || null }); setForm({ ...form, name: "" }); toast.success("Category added"); load(); }
    catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };
  const toggle = async (c) => { await api.patch(`/categories/${c.id}/status`, { status: c.status === "active" ? "disabled" : "active" }); load(); };
  const del = async (c) => { await api.delete(`/categories/${c.id}`); toast.success("Removed"); load(); };
  const types = [...new Set(rows.map((r) => r.category_type).filter(Boolean))];
  const matches = (r) => !q || (r.name || "").toLowerCase().includes(q.toLowerCase());
  const parents = (t) => rows.filter((r) => r.category_type === t && !r.parent_id);
  const childrenOf = (pid) => rows.filter((r) => r.parent_id === pid && matches(r));
  const parentOptions = rows.filter((r) => r.category_type === form.category_type && !r.parent_id);
  const ALL_TYPES = ["construction", "marketplace", "solar", "logistics", "professional_service", "freelancer", "product", "service", "tender", "architecture", "general"];
  return (
    <Panel title={`Categories (${rows.length})`} action={
      <div className="flex flex-wrap gap-2">
        <Input data-testid="cat-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="rounded-none h-9 w-32" />
        <select data-testid="cat-type" value={form.category_type} onChange={(e) => setForm({ ...form, category_type: e.target.value, parent_id: "" })} className="bg-background border border-input px-2 h-9 text-sm">
          {ALL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select data-testid="cat-parent" value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })} className="bg-background border border-input px-2 h-9 text-sm">
          <option value="">— top level —</option>{parentOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <Input data-testid="cat-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="New category" className="rounded-none h-9 w-36" />
        <Button data-testid="add-cat" onClick={add} size="sm" className="rounded-none"><Plus className="h-4 w-4" /></Button>
      </div>}>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
        {rows.length === 0 && <div className="bg-card p-6 text-sm text-muted-foreground" data-testid="cat-empty">No categories yet. Add one above.</div>}
        {types.map((t) => (
          <div key={t} className="bg-card p-4" data-testid={`cat-group-${t}`}>
            <div className="font-mono text-xs uppercase tracking-wider text-primary mb-3">{(t || "").replace(/_/g, " ")}</div>
            <div className="space-y-2.5">
              {parents(t).map((p) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between">
                    <span data-testid={`cat-chip-${p.slug}`} className={`font-medium text-sm ${p.status !== "active" ? "opacity-40 line-through" : ""}`}>{p.name}</span>
                    <span className="flex gap-1.5 items-center">
                      <button onClick={() => toggle(p)} className={`text-[10px] font-mono px-1.5 py-0.5 border ${p.status === "active" ? "border-solar/40 text-solar" : "border-border text-muted-foreground"}`}>{p.status === "active" ? "ON" : "OFF"}</button>
                      <button onClick={() => del(p)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </span>
                  </div>
                  <div className="pl-3 mt-1.5 flex flex-wrap gap-1">
                    {childrenOf(p.id).map((c) => (
                      <span key={c.id} data-testid={`cat-chip-${c.slug}`} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 border border-border ${c.status !== "active" ? "opacity-40 line-through" : ""}`}>
                        {c.name}
                        <button onClick={() => toggle(c)} className="hover:text-solar text-[9px] font-mono">{c.status === "active" ? "•" : "×"}</button>
                        <button onClick={() => del(c)} className="hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Branding() {
  const { refresh } = useBranding();
  const [companies, setCompanies] = useState([]);
  const [cid, setCid] = useState("company_default");
  const [b, setB] = useState({ brand_name: "", primary_color: "#FF5A1F", accent_color: "#10B981", logo: "", favicon: "", tagline: "", slug: "", custom_domain: "" });
  const [saving, setSaving] = useState(false);
  useEffect(() => { api.get(`${R}/companies`).then(({ data }) => setCompanies(data)); }, []);
  const loadBrand = useCallback((id) => { api.get("/branding", { params: { company_id: id } }).then(({ data }) => setB(data)); }, []);
  useEffect(() => { loadBrand(cid); }, [cid, loadBrand]);
  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`${A}/branding`, { company_id: cid, brand_name: b.brand_name, tagline: b.tagline, primary_color: b.primary_color, accent_color: b.accent_color, logo: b.logo, favicon: b.favicon, slug: b.slug, custom_domain: b.custom_domain });
      toast.success("Branding saved");
      if (cid === "company_default") refresh();
    } catch (e) { toast.error("Save failed"); } finally { setSaving(false); }
  };
  const set = (k, v) => setB({ ...b, [k]: v });
  const host = typeof window !== "undefined" ? window.location.host : "";
  return (
    <Panel title="White-Label Branding" action={
      <select data-testid="brand-company" value={cid} onChange={(e) => setCid(e.target.value)} className="bg-background border border-input px-2 h-9 text-sm">
        {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>}>
      <div className="p-5 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid md:grid-cols-2 gap-5">
          <div><label className="text-sm font-medium mb-1.5 block">Brand name</label>
            <Input data-testid="brand-name" value={b.brand_name || ""} onChange={(e) => set("brand_name", e.target.value)} className="rounded-none" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Tagline</label>
            <Input data-testid="brand-tagline" value={b.tagline || ""} onChange={(e) => set("tagline", e.target.value)} className="rounded-none" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Primary color</label>
            <div className="flex gap-2 items-center">
              <input data-testid="brand-color" type="color" value={b.primary_color || "#FF5A1F"} onChange={(e) => set("primary_color", e.target.value)} className="h-10 w-14 border border-input" />
              <Input value={b.primary_color || ""} onChange={(e) => set("primary_color", e.target.value)} className="rounded-none" />
            </div></div>
          <div><label className="text-sm font-medium mb-1.5 block">Accent color</label>
            <div className="flex gap-2 items-center">
              <input data-testid="brand-accent" type="color" value={b.accent_color || "#10B981"} onChange={(e) => set("accent_color", e.target.value)} className="h-10 w-14 border border-input" />
              <Input value={b.accent_color || ""} onChange={(e) => set("accent_color", e.target.value)} className="rounded-none" />
            </div></div>
          <div><label className="text-sm font-medium mb-1.5 block">Logo URL</label>
            <Input data-testid="brand-logo" value={b.logo || ""} onChange={(e) => set("logo", e.target.value)} placeholder="https://…" className="rounded-none" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Favicon URL</label>
            <Input data-testid="brand-favicon" value={b.favicon || ""} onChange={(e) => set("favicon", e.target.value)} placeholder="https://…" className="rounded-none" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Subdomain slug</label>
            <Input data-testid="brand-slug" value={b.slug || ""} onChange={(e) => set("slug", e.target.value)} placeholder="acme" className="rounded-none" />
            <p className="text-[10px] text-muted-foreground mt-1 font-mono">{b.slug ? `${b.slug}.${host} · ?company=${b.slug}` : "?company=<slug>"}</p></div>
          <div><label className="text-sm font-medium mb-1.5 block">Custom domain</label>
            <Input data-testid="brand-domain" value={b.custom_domain || ""} onChange={(e) => set("custom_domain", e.target.value)} placeholder="portal.acme.com" className="rounded-none" />
            <p className="text-[10px] text-muted-foreground mt-1">Point this domain's DNS to the app after deploy.</p></div>
          <div className="md:col-span-2"><Button data-testid="brand-save" onClick={save} disabled={saving} className="rounded-none">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save branding"}</Button></div>
        </div>
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Live preview</div>
          <div className="border border-border" data-testid="brand-preview" style={{ borderTopWidth: 4, borderTopColor: b.primary_color }}>
            <div className="p-4 flex items-center gap-2 border-b border-border">
              {b.logo ? <img src={b.logo} alt="logo" className="h-7 w-7 object-contain" /> : <div className="h-7 w-7 flex items-center justify-center text-white text-xs font-bold" style={{ background: b.primary_color }}>2</div>}
              <span className="font-display font-extrabold tracking-tight">{b.brand_name || "Brand"}</span>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground">{b.tagline || "Your tagline here"}</p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm text-white rounded-none" style={{ background: b.primary_color }}>Primary</button>
                <button className="px-3 py-1.5 text-sm text-white rounded-none" style={{ background: b.accent_color }}>Accent</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function PricingCommission() {
  const [plans, setPlans] = useState([]);
  const [comm, setComm] = useState({ default_percent: 5, per_category: [] });
  const [saving, setSaving] = useState(false);
  const load = () => { api.get(`${A}/plans`).then(({ data }) => setPlans(data)); api.get(`${A}/commission`).then(({ data }) => setComm(data)); };
  useEffect(() => { load(); }, []);
  const saveComm = async () => {
    setSaving(true);
    try { await api.put(`${A}/commission`, { default_percent: Number(comm.default_percent), per_category: comm.per_category }); toast.success("Commission saved"); }
    catch { toast.error("Save failed"); } finally { setSaving(false); }
  };
  const addRow = () => setComm({ ...comm, per_category: [...comm.per_category, { category: "", percent: 0 }] });
  const setRow = (i, k, v) => { const pc = [...comm.per_category]; pc[i] = { ...pc[i], [k]: k === "percent" ? Number(v) : v }; setComm({ ...comm, per_category: pc }); };
  const delRow = (i) => setComm({ ...comm, per_category: comm.per_category.filter((_, x) => x !== i) });
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Panel title={`Subscription Plans (${plans.length})`}>
        <div className="divide-y divide-border">
          {plans.map((p) => (
            <div key={p.id} className="p-4 flex items-center justify-between">
              <div><div className="font-medium">{p.name} {p.highlight && <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 ml-1">POPULAR</span>}</div>
                <div className="text-xs text-muted-foreground">{p.description}</div></div>
              <div className="font-mono font-bold">{p.price === -1 ? "Custom" : `₹${Number(p.price).toLocaleString("en-IN")}`}<span className="text-xs text-muted-foreground">{p.price > 0 ? `/${p.period}` : ""}</span></div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Commission Engine" action={<Button data-testid="comm-save" onClick={saveComm} disabled={saving} size="sm" className="rounded-none">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>}>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Default platform commission</label>
            <Input data-testid="comm-default" type="number" value={comm.default_percent} onChange={(e) => setComm({ ...comm, default_percent: e.target.value })} className="rounded-none w-24 h-9" />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">Per-category overrides</span>
              <Button data-testid="comm-add-row" onClick={addRow} size="sm" variant="outline" className="rounded-none"><Plus className="h-3.5 w-3.5" /></Button></div>
            <div className="space-y-2">
              {comm.per_category.map((r, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input value={r.category} onChange={(e) => setRow(i, "category", e.target.value)} placeholder="Category" className="rounded-none h-9 flex-1" />
                  <Input type="number" value={r.percent} onChange={(e) => setRow(i, "percent", e.target.value)} className="rounded-none h-9 w-24" />
                  <span className="text-sm text-muted-foreground">%</span>
                  <button onClick={() => delRow(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function AdminWallet() {
  const [users, setUsers] = useState([]);
  const [txns, setTxns] = useState([]);
  const [form, setForm] = useState({ user_id: "", type: "credit", amount: "", reason: "" });
  const [busy, setBusy] = useState(false);
  const load = () => {
    api.get(`${A}/wallet/users`).then(({ data }) => setUsers(data));
    api.get(`${A}/wallet/transactions`).then(({ data }) => setTxns(data));
  };
  useEffect(() => { load(); }, []);
  const submit = async () => {
    if (!form.user_id) { toast.error("Select a user"); return; }
    if (!(Number(form.amount) > 0)) { toast.error("Enter a valid amount"); return; }
    if (!form.reason || form.reason.trim().length < 2) { toast.error("Reason is mandatory"); return; }
    setBusy(true);
    try {
      const { data } = await api.post(`${A}/wallet/adjust`, { user_id: form.user_id, type: form.type, amount: Number(form.amount), reason: form.reason.trim() });
      toast.success(`Wallet ${form.type} done · new balance ₹${Number(data.balance).toLocaleString("en-IN")}`);
      setForm({ user_id: "", type: "credit", amount: "", reason: "" });
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Adjustment failed"); } finally { setBusy(false); }
  };
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Panel title="Adjust Wallet Balance">
        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">User</label>
            <select data-testid="wallet-user" value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} className="w-full bg-background border border-input px-2 h-10 text-sm">
              <option value="">Select user…</option>
              {users.map((u) => <option key={u.id} value={u.id}>{`${u.name || u.email} · ₹${Number(u.wallet_balance).toLocaleString("en-IN")}`}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select data-testid="wallet-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="bg-background border border-input px-2 h-10 text-sm">
              <option value="credit">Credit (+)</option>
              <option value="debit">Debit (−)</option>
            </select>
            <Input data-testid="wallet-amount" type="number" placeholder="Amount (₹)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="rounded-none" />
          </div>
          <Input data-testid="wallet-reason" placeholder="Reason (mandatory)" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="rounded-none" />
          <Button data-testid="wallet-submit" onClick={submit} disabled={busy} className="w-full rounded-none">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply Adjustment"}</Button>
        </div>
        <div className="border-t border-border">
          <div className="px-5 py-2 text-xs uppercase tracking-wider text-muted-foreground">User Balances ({users.length})</div>
          <div className="max-h-72 overflow-y-auto divide-y divide-border">
            {users.map((u) => (
              <div key={u.id} className="px-5 py-2 flex items-center justify-between text-sm">
                <div><div className="font-medium">{u.name || "—"}</div><div className="text-xs text-muted-foreground font-mono">{u.email}</div></div>
                <span data-testid={`wallet-bal-${u.id}`} className="font-mono font-bold">₹{Number(u.wallet_balance).toLocaleString("en-IN")}</span>
              </div>
            ))}
            {users.length === 0 && <div className="px-5 py-6 text-center text-muted-foreground text-sm">No users.</div>}
          </div>
        </div>
      </Panel>
      <Panel title={`Wallet Ledger — all users (${txns.length})`}>
        <div className="overflow-x-auto max-h-[560px]">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border text-left uppercase tracking-wider text-muted-foreground"><th className="p-2.5">User</th><th className="p-2.5">Type</th><th className="p-2.5">Amount</th><th className="p-2.5">Reason</th><th className="p-2.5">Bal After</th><th className="p-2.5">Time</th></tr></thead>
            <tbody>{txns.map((t) => (
              <tr key={t.id} data-testid={`admin-wtx-${t.id}`} className="border-b border-border hover:bg-muted/50">
                <td className="p-2.5">{t.user_email || t.user_id}</td>
                <td className="p-2.5"><span className={`font-mono px-2 py-0.5 ${t.type === "credit" ? "bg-solar/10 text-solar" : "bg-destructive/10 text-destructive"}`}>{t.type}</span></td>
                <td className="p-2.5 font-mono">₹{Number(t.amount).toLocaleString("en-IN")}</td>
                <td className="p-2.5 text-muted-foreground">{t.reason}</td>
                <td className="p-2.5 font-mono">₹{Number(t.balance_after).toLocaleString("en-IN")}</td>
                <td className="p-2.5 font-mono text-[10px]">{new Date(t.created_at).toLocaleString("en-IN")}</td>
              </tr>))}
              {txns.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-muted-foreground">No transactions yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Audit() {
  const [rows, setRows] = useState([]);
  const [f, setF] = useState({ module: "", action: "" });
  const load = useCallback(() => {
    const p = {}; if (f.module) p.module = f.module; if (f.action) p.action = f.action;
    api.get(`${R}/audit`, { params: p }).then(({ data }) => setRows(data));
  }, [f]);
  useEffect(() => { load(); }, [load]);
  return (
    <Panel title="Enterprise Audit Logs" action={
      <div className="flex gap-2">
        <Input data-testid="audit-module" value={f.module} onChange={(e) => setF({ ...f, module: e.target.value })} placeholder="module" className="rounded-none h-9 w-32" />
        <Input data-testid="audit-action" value={f.action} onChange={(e) => setF({ ...f, action: e.target.value })} placeholder="action" className="rounded-none h-9 w-32" />
      </div>}>
      <div className="overflow-x-auto"><table className="w-full text-xs">
        <thead><tr className="border-b border-border text-left uppercase tracking-wider text-muted-foreground"><th className="p-2.5">Action</th><th className="p-2.5">Module</th><th className="p-2.5">User</th><th className="p-2.5">Record</th><th className="p-2.5">IP</th><th className="p-2.5">Device</th><th className="p-2.5">Time</th></tr></thead>
        <tbody>{rows.map((l) => (
          <tr key={l.id} className="border-b border-border hover:bg-muted/50">
            <td className="p-2.5"><span className="font-mono bg-primary/10 text-primary px-2 py-0.5">{l.action}</span></td>
            <td className="p-2.5 font-mono">{l.module || "—"}</td>
            <td className="p-2.5">{l.user_email || "system"}</td>
            <td className="p-2.5 font-mono text-[10px]">{l.record_id || "—"}</td>
            <td className="p-2.5 font-mono">{l.ip_address || "—"}</td>
            <td className="p-2.5">{l.device || "—"}</td>
            <td className="p-2.5 font-mono text-[10px]">{new Date(l.timestamp || l.created_at).toLocaleString("en-IN")}</td>
          </tr>))}</tbody>
      </table></div>
    </Panel>
  );
}
