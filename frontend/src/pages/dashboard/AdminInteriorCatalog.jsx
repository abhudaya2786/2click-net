import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Check, Pencil, ImageIcon, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const A = "/admin";
const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function AdminInteriorCatalog() {
  const [verticals, setVerticals] = useState([]);
  const [vid, setVid] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState({});
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    category: "", name: "", brand: "", unit: "sqft", rate: "", image: "",
  });

  useEffect(() => {
    api.get("/mart/interior-verticals").then(({ data }) => {
      setVerticals(data);
      if (data[0]) setVid(data[0].id);
    });
  }, []);

  const activeVertical = verticals.find((v) => v.id === vid);

  useEffect(() => {
    if (activeVertical) {
      setForm((f) => ({ ...f, category: activeVertical.category }));
    }
  }, [activeVertical?.category]);

  const load = useCallback(async () => {
    if (!activeVertical) return;
    setLoading(true);
    const { data } = await api.get(`${A}/mart/materials`);
    setRows(data.filter((r) => r.category === activeVertical.category));
    setLoading(false);
  }, [activeVertical]);

  useEffect(() => { load(); }, [load]);

  const grouped = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      if (!map[r.name]) map[r.name] = { unit: r.unit, image: r.image, brands: [] };
      map[r.name].brands.push(r);
      if (r.image && !map[r.name].image) map[r.name].image = r.image;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [rows]);

  const resetForm = () => {
    setEditId(null);
    setForm({
      category: activeVertical?.category || "",
      name: "", brand: "", unit: "sqft", rate: "", image: "",
    });
  };

  const startEdit = (m) => {
    setEditId(m.id);
    setForm({
      category: m.category,
      name: m.name,
      brand: m.brand,
      unit: m.unit,
      rate: String(m.rate),
      image: m.image || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async () => {
    if (!form.category || !form.name || !form.brand || !form.rate) {
      toast.error("Category, material, brand and rate required");
      return;
    }
    const payload = {
      category: form.category,
      name: form.name,
      brand: form.brand,
      unit: form.unit || "unit",
      rate: Number(form.rate),
      image: form.image || undefined,
    };
    if (editId) {
      await api.put(`${A}/mart/materials/${editId}`, payload);
      toast.success("Updated");
    } else {
      await api.post(`${A}/mart/materials`, payload);
      toast.success("Added");
    }
    resetForm();
    load();
  };

  const saveRate = async (m) => {
    const v = edits[m.id];
    if (v == null || v === "") return;
    await api.put(`${A}/mart/materials/${m.id}`, { rate: Number(v) });
    toast.success("Rate updated");
    setEdits((e) => { const n = { ...e }; delete n[m.id]; return n; });
    load();
  };

  const del = async (m) => {
    await api.delete(`${A}/mart/materials/${m.id}`);
    toast.success("Deleted");
    load();
  };

  const toggle = async (m) => {
    await api.put(`${A}/mart/materials/${m.id}`, { status: m.status === "active" ? "disabled" : "active" });
    load();
  };

  if (!verticals.length) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-5" data-testid="admin-interior-catalog">
      <div className="flex flex-wrap gap-2">
        {verticals.map((v) => (
          <button
            key={v.id}
            type="button"
            data-testid={`admin-vertical-${v.id}`}
            onClick={() => { setVid(v.id); resetForm(); }}
            className={`text-xs font-medium px-3 py-1.5 border rounded-lg transition-colors ${vid === v.id ? "bg-primary text-white border-primary" : "border-border hover:border-primary/50"}`}
          >
            {v.name}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display font-bold text-sm">
            {editId ? "Edit catalog entry" : "Add brand / material"}
            {activeVertical && <span className="text-muted-foreground font-normal"> · {activeVertical.category}</span>}
          </h3>
          {editId && (
            <Button variant="ghost" size="sm" onClick={resetForm}>Cancel edit</Button>
          )}
        </div>
        <div className="grid md:grid-cols-6 gap-2 items-end">
          <Input placeholder="Material / service" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg" />
          <Input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="rounded-lg" />
          <Input placeholder="Unit (sqft, bag…)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="rounded-lg" />
          <Input type="number" placeholder="Rate ₹" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} className="rounded-lg" />
          <Input placeholder="Photo URL (https://…)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="rounded-lg" />
          <Button onClick={save} className="rounded-lg">
            {editId ? <Check className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            {editId ? "Save" : "Add"}
          </Button>
        </div>
        {form.image && (
          <div className="h-24 w-40 rounded-lg overflow-hidden border border-border bg-muted">
            <img src={form.image} alt="" className="h-full w-full object-cover" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {rows.length} brand entries · {grouped.length} products · edits appear live on Interior BOQ
        </p>
        <Button variant="outline" size="sm" onClick={load} className="rounded-lg">
          <RefreshCw className="h-3.5 w-3.5 mr-1" />Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([productName, data]) => (
            <div key={productName} className="border border-border rounded-xl bg-card overflow-hidden">
              <div className="flex gap-4 p-4 border-b border-border bg-muted/20">
                <div className="h-20 w-28 shrink-0 rounded-lg overflow-hidden bg-muted border border-border">
                  {data.image ? (
                    <img src={data.image} alt={productName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-display font-bold">{productName}</h4>
                  <p className="text-xs text-muted-foreground mt-1">Unit: {data.unit} · {data.brands.length} brands</p>
                  {data.brands[0] && (
                    <p className="text-xs mt-2">
                      From <span className="font-mono font-bold text-primary">{fmt(Math.min(...data.brands.map((b) => b.rate)))}</span>/{data.unit}
                    </p>
                  )}
                </div>
              </div>
              <div className="divide-y divide-border">
                {data.brands.sort((a, b) => a.rate - b.rate).map((m) => (
                  <div key={m.id} className="flex flex-wrap items-center gap-3 p-3 hover:bg-muted/30" data-testid={`catalog-row-${m.id}`}>
                    <div className="h-12 w-12 shrink-0 rounded-md overflow-hidden bg-muted border border-border">
                      {m.image ? <img src={m.image} alt={m.brand} className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 m-3.5 text-muted-foreground" />}
                    </div>
                    <div className="min-w-[120px]">
                      <div className="font-medium text-sm">{m.brand}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{m.status}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        defaultValue={m.rate}
                        onChange={(e) => setEdits({ ...edits, [m.id]: e.target.value })}
                        className="rounded-lg h-8 w-24 font-mono"
                      />
                      <span className="text-xs text-muted-foreground">/{m.unit}</span>
                      {edits[m.id] != null && (
                        <button onClick={() => saveRate(m)} className="text-primary"><Check className="h-4 w-4" /></button>
                      )}
                    </div>
                    <div className="text-sm font-mono font-semibold text-primary">{fmt(m.rate)}</div>
                    <div className="flex items-center gap-2 ml-auto">
                      <button onClick={() => startEdit(m)} className="text-muted-foreground hover:text-primary" title="Edit all fields">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => toggle(m)} className={`text-xs font-mono px-1.5 py-0.5 rounded ${m.status === "active" ? "bg-solar/10 text-solar" : "bg-muted text-muted-foreground"}`}>
                        {m.status}
                      </button>
                      <button onClick={() => del(m)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
