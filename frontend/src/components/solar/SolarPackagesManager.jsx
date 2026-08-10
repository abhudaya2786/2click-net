import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Loader2, Trash2, Pencil, X, Eye, EyeOff, CheckCircle2, XCircle, Clock, Layers } from "lucide-react";

const TIERS = ["Premium", "Value", "Budget", "Custom"];
const STATUS = {
  approved: { label: "approved", cls: "bg-solar/10 text-solar", icon: CheckCircle2 },
  pending: { label: "pending review", cls: "bg-tender/10 text-tender", icon: Clock },
  rejected: { label: "rejected", cls: "bg-destructive/10 text-destructive", icon: XCircle },
};
const EMPTY = { name: "", tier_label: "Premium", description: "", selections: {}, is_active: true };

export default function SolarPackagesManager({ scope = "admin" }) {
  const [comps, setComps] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pkgs, setPkgs] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, b, p] = await Promise.all([
        api.get("/solar/epc/components"),
        api.get("/solar/epc/brands/manage"),
        api.get("/solar/epc/packages/manage"),
      ]);
      setComps(c.data.components || []);
      setBrands(b.data || []);
      setPkgs(p.data || []);
    } catch (e) { toast.error(e.response?.data?.detail || "Could not load packages"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const brandsByCat = useMemo(() => {
    const m = {};
    brands.forEach((b) => { (m[b.category_code] = m[b.category_code] || []).push(b); });
    return m;
  }, [brands]);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setSel = (code, bid) => setForm((p) => { const s = { ...p.selections }; if (bid) s[code] = bid; else delete s[code]; return { ...p, selections: s }; });
  const reset = () => { setForm(EMPTY); setEditId(null); };
  const selCount = Object.keys(form.selections).length;
  const withBrands = comps.filter((c) => (brandsByCat[c.code] || []).length);

  const save = async () => {
    if (!form.name.trim()) { toast.error("Package name is required"); return; }
    if (selCount === 0) { toast.error("Pick at least one component brand"); return; }
    setSaving(true);
    const payload = { name: form.name.trim(), tier_label: form.tier_label, description: form.description.trim(), selections: form.selections, is_active: form.is_active };
    try {
      if (editId) { await api.put(`/solar/epc/packages/${editId}`, payload); toast.success("Package updated"); }
      else { await api.post("/solar/epc/packages", payload); toast.success("Package created"); }
      reset(); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Save failed"); }
    finally { setSaving(false); }
  };
  const edit = (p) => { setEditId(p.id); setForm({ name: p.name, tier_label: p.tier_label || "Custom", description: p.description || "", selections: { ...(p.selections || {}) }, is_active: p.is_active }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const toggle = async (p) => { try { await api.patch(`/solar/epc/packages/${p.id}/status`); load(); } catch (e) { toast.error(e.response?.data?.detail || "Failed"); } };
  const del = async (p) => { if (!window.confirm(`Delete package "${p.name}"?`)) return; try { await api.delete(`/solar/epc/packages/${p.id}`); toast.success("Deleted"); load(); } catch (e) { toast.error(e.response?.data?.detail || "Failed"); } };
  const approve = async (p) => { try { await api.post(`/solar/epc/packages/${p.id}/approve`); toast.success("Package approved & live"); load(); } catch (e) { toast.error(e.response?.data?.detail || "Failed"); } };
  const reject = async (p) => { const reason = window.prompt(`Reason for rejecting "${p.name}"?`); if (!reason || !reason.trim()) return; try { await api.post(`/solar/epc/packages/${p.id}/reject`, { reason: reason.trim() }); toast.success("Package rejected"); load(); } catch (e) { toast.error(e.response?.data?.detail || "Failed"); } };

  const cols = scope === "admin" ? 6 : 5;

  return (
    <div className="space-y-6" data-testid={`solar-packages-${scope}`}>
      {/* form */}
      <div className="border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-4 w-4 text-solar" />
          <h3 className="font-display font-bold text-sm tracking-tight">{editId ? "Edit package" : "Create a package preset"}</h3>
          {editId && <button data-testid="pkg-cancel-edit" onClick={reset} className="ml-auto text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"><X className="h-3 w-3" />Cancel</button>}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div><label className="text-xs text-muted-foreground mb-1 block">Package name</label>
            <Input data-testid="pkg-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Premium Home Bundle" className="rounded-none" /></div>
          <div><label className="text-xs text-muted-foreground mb-1 block">Tier label</label>
            <select data-testid="pkg-tier" value={form.tier_label} onChange={(e) => set("tier_label", e.target.value)} className="w-full bg-background border border-input px-2 h-10 text-sm rounded-none">
              {TIERS.map((t) => <option key={t} value={t} label={t} />)}
            </select></div>
          <div><label className="text-xs text-muted-foreground mb-1 block">Short description</label>
            <Input data-testid="pkg-desc" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="e.g. Best-in-class components" className="rounded-none" /></div>
        </div>
        <div className="mt-4">
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Bundle brands ({selCount} chosen)</div>
          {withBrands.length === 0 ? (
            <p className="text-xs text-muted-foreground">Add some brands first, then bundle them into a package.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {withBrands.map((c) => (
                <div key={c.code}>
                  <label className="text-xs text-muted-foreground mb-1 block">{c.label}</label>
                  <select data-testid={`pkg-sel-${c.code}`} value={form.selections[c.code] || ""} onChange={(e) => setSel(c.code, e.target.value)} className="w-full bg-background border border-input px-2 h-9 text-sm rounded-none">
                    <option value="" label="— none —" />
                    {(brandsByCat[c.code] || []).map((b) => <option key={b.id} value={b.id} label={`${b.brand_name} — ₹${Number(b.rate).toLocaleString("en-IN")}${c.unit}${b.status !== "approved" ? " (" + b.status + ")" : ""}`} />)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button data-testid="pkg-save" onClick={save} disabled={saving} className="rounded-none">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1.5" />{editId ? "Update package" : "Create package"}</>}
          </Button>
          <p className="text-xs text-muted-foreground">Customers apply a package in one tap in the Solar EPC estimator.</p>
        </div>
      </div>

      {/* list */}
      <div className="border border-border bg-card overflow-x-auto">
        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
          <table className="w-full text-sm" data-testid="packages-table">
            <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="p-3">Package</th><th className="p-3">Components</th>
              {scope === "admin" && <th className="p-3">Owner</th>}
              <th className="p-3">Approval</th><th className="p-3">Visibility</th><th className="p-3 text-right">Actions</th>
            </tr></thead>
            <tbody>
              {pkgs.map((p) => {
                const st = STATUS[p.status] || STATUS.approved; const SIcon = st.icon;
                return (
                <tr key={p.id} data-testid={`pkg-row-${p.id}`} className="border-b border-border hover:bg-muted/40 align-top">
                  <td className="p-3"><div className="font-medium">{p.name}</div><span className="text-[10px] font-mono uppercase bg-solar/10 text-solar px-1.5 py-0.5">{p.tier_label}</span>{p.description && <div className="text-[11px] text-muted-foreground mt-1 max-w-[180px]">{p.description}</div>}</td>
                  <td className="p-3">
                    <div className="space-y-0.5">
                      {(p.items || []).map((it) => (
                        <div key={it.category_code} className="text-[11px]"><span className="text-muted-foreground">{it.label}:</span> {it.brand_name || "—"}{!it.available && <span className="text-destructive"> (unavailable)</span>}</div>
                      ))}
                      {(p.items || []).length === 0 && <span className="text-xs text-muted-foreground">No components</span>}
                    </div>
                  </td>
                  {scope === "admin" && <td className="p-3 text-xs">{p.created_by_name || "—"}<div className="text-[10px] text-muted-foreground uppercase">{p.created_by_role}</div></td>}
                  <td className="p-3"><span data-testid={`pkg-status-${p.id}`} className={`inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 ${st.cls}`}><SIcon className="h-3 w-3" />{st.label}</span>{p.status === "rejected" && p.rejection_reason && <div className="text-[10px] text-destructive mt-1 max-w-[160px]">{p.rejection_reason}</div>}</td>
                  <td className="p-3"><span className={`text-xs font-mono px-2 py-0.5 ${p.is_active ? "bg-solar/10 text-solar" : "bg-muted text-muted-foreground"}`}>{p.is_active ? "shown" : "hidden"}</span></td>
                  <td className="p-3"><div className="flex items-center justify-end gap-2">
                    {scope === "admin" && p.status === "pending" && (<>
                      <button data-testid={`pkg-approve-${p.id}`} onClick={() => approve(p)} title="Approve" className="text-solar hover:opacity-70"><CheckCircle2 className="h-4 w-4" /></button>
                      <button data-testid={`pkg-reject-${p.id}`} onClick={() => reject(p)} title="Reject" className="text-destructive hover:opacity-70"><XCircle className="h-4 w-4" /></button>
                    </>)}
                    <button data-testid={`pkg-toggle-${p.id}`} onClick={() => toggle(p)} title={p.is_active ? "Hide" : "Show"} className="text-muted-foreground hover:text-primary">{p.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                    <button data-testid={`pkg-edit-${p.id}`} onClick={() => edit(p)} className="text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>
                    <button data-testid={`pkg-del-${p.id}`} onClick={() => del(p)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>
              ); })}
              {pkgs.length === 0 && <tr><td colSpan={cols} className="p-10 text-center text-muted-foreground">No packages yet. Bundle your brands into a ready-made package above.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
