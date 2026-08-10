import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sun, Plus, Loader2, Trash2, Pencil, X, Eye, EyeOff, CheckCircle2, XCircle, Clock } from "lucide-react";

const EMPTY = { category_code: "module", brand_name: "", model: "", spec: "", rate: "", module_wp: "", is_active: true };
const STATUS = {
  approved: { label: "approved", cls: "bg-solar/10 text-solar", icon: CheckCircle2 },
  pending: { label: "pending review", cls: "bg-tender/10 text-tender", icon: Clock },
  rejected: { label: "rejected", cls: "bg-destructive/10 text-destructive", icon: XCircle },
};

export default function SolarBrandsManager({ scope = "admin" }) {
  const [comps, setComps] = useState([]);
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, b] = await Promise.all([
        api.get("/solar/epc/components"),
        api.get("/solar/epc/brands/manage"),
      ]);
      setComps(c.data.components || []);
      setBrands(b.data || []);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Could not load solar brands");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const comp = comps.find((c) => c.code === form.category_code);
  const labelFor = (code) => comps.find((c) => c.code === code)?.label || code;
  const unitFor = (code) => comps.find((c) => c.code === code)?.unit || "";
  const reset = () => { setForm(EMPTY); setEditId(null); };

  const save = async () => {
    if (!form.brand_name.trim() || !form.rate) { toast.error("Brand name and rate are required"); return; }
    setSaving(true);
    const payload = {
      category_code: form.category_code, brand_name: form.brand_name.trim(),
      model: form.model.trim(), spec: form.spec.trim(), rate: Number(form.rate),
      module_wp: form.category_code === "module" && form.module_wp ? Number(form.module_wp) : null,
      is_active: form.is_active,
    };
    try {
      if (editId) { await api.put(`/solar/epc/brands/${editId}`, payload); toast.success("Brand updated"); }
      else { await api.post("/solar/epc/brands", payload); toast.success("Brand added"); }
      reset(); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Save failed"); }
    finally { setSaving(false); }
  };

  const edit = (b) => {
    setEditId(b.id);
    setForm({ category_code: b.category_code, brand_name: b.brand_name, model: b.model || "",
      spec: b.spec || "", rate: b.rate, module_wp: b.module_wp || "", is_active: b.is_active });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const toggle = async (b) => { try { await api.patch(`/solar/epc/brands/${b.id}/status`); load(); } catch (e) { toast.error(e.response?.data?.detail || "Failed"); } };
  const del = async (b) => { if (!window.confirm(`Delete brand "${b.brand_name}"?`)) return; try { await api.delete(`/solar/epc/brands/${b.id}`); toast.success("Deleted"); load(); } catch (e) { toast.error(e.response?.data?.detail || "Failed"); } };
  const approve = async (b) => { try { await api.post(`/solar/epc/brands/${b.id}/approve`); toast.success("Brand approved & live"); load(); } catch (e) { toast.error(e.response?.data?.detail || "Failed"); } };
  const reject = async (b) => { const reason = window.prompt(`Reason for rejecting "${b.brand_name}"?`); if (!reason || !reason.trim()) return; try { await api.post(`/solar/epc/brands/${b.id}/reject`, { reason: reason.trim() }); toast.success("Brand rejected"); load(); } catch (e) { toast.error(e.response?.data?.detail || "Failed"); } };

  const pendingCount = brands.filter((b) => b.status === "pending").length;
  const shown = filter === "pending" ? brands.filter((b) => b.status === "pending") : brands;
  const cols = scope === "admin" ? 7 : 6;

  return (
    <div className="space-y-6" data-testid={`solar-brands-${scope}`}>
      {/* form */}
      <div className="border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sun className="h-4 w-4 text-solar" />
          <h3 className="font-display font-bold text-sm tracking-tight">{editId ? "Edit brand" : "Add solar brand & price"}</h3>
          {editId && <button data-testid="brand-cancel-edit" onClick={reset} className="ml-auto text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"><X className="h-3 w-3" />Cancel</button>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Component</label>
            <select data-testid="brand-category" value={form.category_code} onChange={(e) => set("category_code", e.target.value)} className="w-full bg-background border border-input px-2 h-10 text-sm rounded-none">
              {comps.map((c) => <option key={c.code} value={c.code} label={c.label} />)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Brand name</label>
            <Input data-testid="brand-name" value={form.brand_name} onChange={(e) => set("brand_name", e.target.value)} placeholder="e.g. Waaree TOPCon" className="rounded-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Model (optional)</label>
            <Input data-testid="brand-model" value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="e.g. WSMD-585" className="rounded-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Rate (₹{comp?.unit})</label>
            <Input data-testid="brand-rate" type="number" value={form.rate} onChange={(e) => set("rate", e.target.value)} placeholder={`₹ per ${comp?.unit?.replace("/", "")}`} className="rounded-none" />
          </div>
          {form.category_code === "module" && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Module Wp</label>
              <Input data-testid="brand-wp" type="number" value={form.module_wp} onChange={(e) => set("module_wp", e.target.value)} placeholder="e.g. 585" className="rounded-none" />
            </div>
          )}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="text-xs text-muted-foreground mb-1 block">Spec / description (optional)</label>
            <Input data-testid="brand-spec" value={form.spec} onChange={(e) => set("spec", e.target.value)} placeholder="e.g. N-Type TOPCon Bifacial >21.5% eff" className="rounded-none" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button data-testid="brand-save" onClick={save} disabled={saving} className="rounded-none">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1.5" />{editId ? "Update brand" : "Add brand"}</>}
          </Button>
          <p className="text-xs text-muted-foreground">Customers can pick this brand in the Solar EPC estimator — your rate flows into their BOQ.</p>
        </div>
      </div>

      {/* list */}
      <div className="border border-border bg-card overflow-x-auto">
        {scope === "admin" && (
          <div className="flex items-center gap-2 p-3 border-b border-border">
            <button data-testid="brand-filter-all" onClick={() => setFilter("all")} className={`text-xs px-3 py-1.5 border ${filter === "all" ? "bg-primary text-white border-primary" : "border-border hover:bg-accent"}`}>All ({brands.length})</button>
            <button data-testid="brand-filter-pending" onClick={() => setFilter("pending")} className={`text-xs px-3 py-1.5 border flex items-center gap-1.5 ${filter === "pending" ? "bg-tender text-white border-tender" : "border-border hover:bg-accent"}`}>
              <Clock className="h-3.5 w-3.5" />Pending approval ({pendingCount})
            </button>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <table className="w-full text-sm" data-testid="brands-table">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-3">Component</th><th className="p-3">Brand / Model</th>
                <th className="p-3 text-right">Rate</th>
                {scope === "admin" && <th className="p-3">Owner</th>}
                <th className="p-3">Approval</th><th className="p-3">Visibility</th><th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((b) => {
                const st = STATUS[b.status] || STATUS.approved;
                const SIcon = st.icon;
                return (
                <tr key={b.id} data-testid={`brand-row-${b.id}`} className="border-b border-border hover:bg-muted/40 align-top">
                  <td className="p-3"><span className="text-xs font-mono bg-solar/10 text-solar px-1.5 py-0.5">{labelFor(b.category_code)}</span></td>
                  <td className="p-3">
                    <div className="font-medium">{b.brand_name}{b.module_wp ? ` · ${b.module_wp} Wp` : ""}</div>
                    <div className="text-[11px] text-muted-foreground">{b.model || ""}{b.model && b.spec ? " · " : ""}{b.spec || ""}</div>
                  </td>
                  <td className="p-3 text-right font-mono whitespace-nowrap">₹{Number(b.rate).toLocaleString("en-IN")}<span className="text-muted-foreground text-xs">{unitFor(b.category_code)}</span></td>
                  {scope === "admin" && <td className="p-3 text-xs">{b.created_by_name || "—"}<div className="text-[10px] text-muted-foreground uppercase">{b.created_by_role}</div></td>}
                  <td className="p-3">
                    <span data-testid={`brand-status-${b.id}`} className={`inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 ${st.cls}`}><SIcon className="h-3 w-3" />{st.label}</span>
                    {b.status === "rejected" && b.rejection_reason && <div className="text-[10px] text-destructive mt-1 max-w-[160px]">{b.rejection_reason}</div>}
                  </td>
                  <td className="p-3">
                    <span className={`text-xs font-mono px-2 py-0.5 ${b.is_active ? "bg-solar/10 text-solar" : "bg-muted text-muted-foreground"}`}>{b.is_active ? "shown" : "hidden"}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      {scope === "admin" && b.status === "pending" && (
                        <>
                          <button data-testid={`brand-approve-${b.id}`} onClick={() => approve(b)} title="Approve" className="text-solar hover:opacity-70"><CheckCircle2 className="h-4 w-4" /></button>
                          <button data-testid={`brand-reject-${b.id}`} onClick={() => reject(b)} title="Reject" className="text-destructive hover:opacity-70"><XCircle className="h-4 w-4" /></button>
                        </>
                      )}
                      <button data-testid={`brand-toggle-${b.id}`} onClick={() => toggle(b)} title={b.is_active ? "Hide from customers" : "Show to customers"} className="text-muted-foreground hover:text-primary">{b.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                      <button data-testid={`brand-edit-${b.id}`} onClick={() => edit(b)} className="text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>
                      <button data-testid={`brand-del-${b.id}`} onClick={() => del(b)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ); })}
              {shown.length === 0 && (
                <tr><td colSpan={cols} className="p-10 text-center text-muted-foreground">{filter === "pending" ? "No brands pending approval." : "No solar brands yet. Add your first component brand above."}</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
