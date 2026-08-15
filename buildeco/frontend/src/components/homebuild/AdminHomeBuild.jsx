import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Home, Gavel } from "lucide-react";

export default function AdminHomeBuild() {
  const [tab, setTab] = useState("rates");
  const [rates, setRates] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ trade: "electrical", name: "", unit: "sqft", rate: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: r }, { data: q }] = await Promise.all([
        api.get("/admin/home/trade-rates"),
        api.get("/admin/home/rfq"),
      ]);
      setRates(r);
      setRfqs(q);
    } catch {
      toast.error("Could not load home build admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addRate = async () => {
    if (!form.name || !form.rate) return;
    try {
      await api.post("/admin/home/trade-rates", { ...form, rate: Number(form.rate) });
      toast.success("Trade rate added");
      setForm({ ...form, name: "", rate: "" });
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };

  const delRate = async (id) => {
    await api.delete(`/admin/home/trade-rates/${id}`);
    toast.success("Removed");
    load();
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button variant={tab === "rates" ? "default" : "outline"} size="sm" className="rounded-none" onClick={() => setTab("rates")}>
          <Home className="h-4 w-4 mr-1" /> Trade Rates
        </Button>
        <Button variant={tab === "rfq" ? "default" : "outline"} size="sm" className="rounded-none" onClick={() => setTab("rfq")}>
          <Gavel className="h-4 w-4 mr-1" /> RFQ Admin (Vendor Details)
        </Button>
      </div>

      {tab === "rates" && (
        <div className="bg-card border border-border">
          <div className="p-4 border-b border-border flex flex-wrap gap-2">
            <select value={form.trade} onChange={(e) => setForm({ ...form, trade: e.target.value })} className="border border-input px-2 py-1.5 text-sm">
              {["electrical", "electronic", "plumbing", "paint_putty", "tiles", "aggregate", "logistics"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <Input placeholder="Service name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-none max-w-[200px]" />
            <Input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="rounded-none w-20" />
            <Input type="number" placeholder="Rate ₹" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} className="rounded-none w-24" />
            <Button size="sm" onClick={addRate} className="rounded-none"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {rates.filter((r) => r.status !== "inactive").map((r) => (
              <div key={r.id} className="flex justify-between items-center px-4 py-2 border-b border-border text-sm">
                <span><span className="text-muted-foreground capitalize">{r.trade?.replace("_", " ")}</span> — {r.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono">₹{r.rate}/{r.unit}</span>
                  <button onClick={() => delRate(r.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "rfq" && (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          <p className="text-xs text-muted-foreground">Super Admin only — vendor names visible here, NOT to clients</p>
          {rfqs.map((r) => (
            <div key={r.id} className="p-4 border border-border bg-card text-sm">
              <div className="font-medium capitalize">{r.trade} — {r.material_description}</div>
              <div className="text-xs text-muted-foreground">{r.matched_vendors} vendors · {r.status}</div>
              {(r.bids || []).map((b) => (
                <div key={b.id} className="mt-2 p-2 bg-muted/50 flex justify-between">
                  <span>{b.vendor_name || b.vendor_id} · {b.vendor_email} · {b.distance_km}km</span>
                  <span className="font-mono font-bold">₹{b.amount?.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          ))}
          {rfqs.length === 0 && <p className="text-muted-foreground text-sm">No RFQs yet.</p>}
        </div>
      )}
    </div>
  );
}
