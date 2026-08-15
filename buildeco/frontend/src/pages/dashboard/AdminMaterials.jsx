import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

const A = "/admin";

export default function AdminMaterials() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState({});
  const [form, setForm] = useState({ category: "", name: "", brand: "", unit: "unit", rate: "", image: "" });
  const [q, setQ] = useState("");

  const load = useCallback(async () => { setLoading(true); const { data } = await api.get(`${A}/mart/materials`); setRows(data); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const saveRate = async (m) => {
    const v = edits[m.id]; if (v == null || v === "") return;
    await api.put(`${A}/mart/materials/${m.id}`, { rate: Number(v) });
    toast.success("Rate updated"); setEdits((e) => { const n = { ...e }; delete n[m.id]; return n; }); load();
  };
  const toggle = async (m) => { await api.put(`${A}/mart/materials/${m.id}`, { status: m.status === "active" ? "disabled" : "active" }); load(); };
  const del = async (m) => { await api.delete(`${A}/mart/materials/${m.id}`); toast.success("Deleted"); load(); };
  const add = async () => {
    if (!form.category || !form.name || !form.brand || !form.rate) { toast.error("Fill category, material, brand, rate"); return; }
    await api.post(`${A}/mart/materials`, { ...form, rate: Number(form.rate), image: form.image || undefined });
    toast.success("Material added"); setForm({ category: "", name: "", brand: "", unit: "unit", rate: "", image: "" }); load();
  };

  const filtered = rows.filter((r) => !q || `${r.category} ${r.name} ${r.brand}`.toLowerCase().includes(q.toLowerCase()));
  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5" data-testid="admin-materials">
      <div className="bg-card border border-border p-4 grid md:grid-cols-7 gap-2 items-end">
        <Input data-testid="mat-category" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-none" />
        <Input data-testid="mat-name" placeholder="Material" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-none" />
        <Input data-testid="mat-brand" placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="rounded-none" />
        <Input data-testid="mat-unit" placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="rounded-none" />
        <Input data-testid="mat-rate" type="number" placeholder="Rate ₹" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} className="rounded-none" />
        <Input data-testid="mat-image" placeholder="Photo URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="rounded-none" />
        <Button data-testid="mat-add" onClick={add} className="rounded-none"><Plus className="h-4 w-4 mr-1" />Add</Button>
      </div>
      <Input data-testid="mat-filter" placeholder="Filter materials…" value={q} onChange={(e) => setQ(e.target.value)} className="rounded-none max-w-xs" />
      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="p-3">Category</th><th className="p-3">Material</th><th className="p-3">Brand</th><th className="p-3">Unit</th><th className="p-3">Photo</th><th className="p-3">Rate (editable)</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} data-testid={`mat-row-${m.id}`} className="border-b border-border hover:bg-muted/40">
                <td className="p-3">{m.category}</td>
                <td className="p-3 font-medium">{m.name}</td>
                <td className="p-3"><span className="text-xs font-mono px-1.5 py-0.5 bg-muted">{m.brand}</span></td>
                <td className="p-3 text-muted-foreground">{m.unit}</td>
                <td className="p-3">
                  {m.image ? <img src={m.image} alt="" className="h-8 w-8 rounded object-cover border border-border" /> : <span className="text-xs text-muted-foreground">—</span>}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <Input data-testid={`mat-rate-${m.id}`} type="number" defaultValue={m.rate} onChange={(e) => setEdits({ ...edits, [m.id]: e.target.value })} className="rounded-none h-8 w-24" />
                    {edits[m.id] != null && <button data-testid={`mat-save-${m.id}`} onClick={() => saveRate(m)} className="text-primary"><Check className="h-4 w-4" /></button>}
                  </div>
                </td>
                <td className="p-3"><button data-testid={`mat-toggle-${m.id}`} onClick={() => toggle(m)} className={`text-xs font-mono px-1.5 py-0.5 ${m.status === "active" ? "bg-solar/10 text-solar" : "bg-muted text-muted-foreground"}`}>{m.status}</button></td>
                <td className="p-3 text-right"><button data-testid={`mat-del-${m.id}`} onClick={() => del(m)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} materials · rates feed the public Super Mart, Material Calculator & BOQ.</p>
    </div>
  );
}
