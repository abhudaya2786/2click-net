import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Check, X, IndianRupee, TrendingUp, SlidersHorizontal, ListChecks } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { inr, num } from "./adsShared";

const SUBTABS = [
  { id: "queue", label: "Approval Queue", icon: ListChecks },
  { id: "revenue", label: "Revenue Analytics", icon: TrendingUp },
  { id: "pricing", label: "Pricing & Slots", icon: SlidersHorizontal },
];

export default function AdminAds() {
  const [tab, setTab] = useState("queue");
  return (
    <div className="space-y-5" data-testid="admin-ads">
      <div className="flex gap-2 border-b border-border">
        {SUBTABS.map((s) => (
          <button key={s.id} data-testid={`admin-ads-tab-${s.id}`} onClick={() => setTab(s.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === s.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <s.icon className="h-4 w-4" />{s.label}
          </button>
        ))}
      </div>
      {tab === "queue" && <Queue />}
      {tab === "revenue" && <Revenue />}
      {tab === "pricing" && <Pricing />}
    </div>
  );
}

function Queue() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [rejectFor, setRejectFor] = useState(null);
  const [reason, setReason] = useState("");

  const load = () => { setLoading(true); api.get("/ads/admin/queue").then(({ data }) => setRows(data)).catch(() => setRows([])).finally(() => setLoading(false)); };
  useEffect(load, []);

  const approve = async (id) => {
    setBusyId(id);
    try { await api.post(`/ads/admin/campaigns/${id}/approve`); toast.success("Campaign approved & live"); load(); }
    catch (e) { toast.error(e.response?.data?.detail || "Failed"); } finally { setBusyId(null); }
  };
  const reject = async (id) => {
    if (reason.trim().length < 2) { toast.error("Please enter a reason"); return; }
    setBusyId(id);
    try { const { data } = await api.post(`/ads/admin/campaigns/${id}/reject`, { reason: reason.trim() }); toast.success(`Rejected${data.refunded ? " · wallet refunded" : ""}`); setRejectFor(null); setReason(""); load(); }
    catch (e) { toast.error(e.response?.data?.detail || "Failed"); } finally { setBusyId(null); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3" data-testid="admin-queue">
      {rows.map((c) => (
        <div key={c.id} data-testid={`queue-row-${c.id}`} className="bg-card border border-border p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-4">
              <div className="h-16 w-28 bg-muted/40 border border-border flex items-center justify-center overflow-hidden shrink-0">
                {c.banner_url ? <img src={c.banner_url.startsWith("http") ? c.banner_url : `${process.env.REACT_APP_BACKEND_URL}${c.banner_url}`} alt="" className="max-h-full max-w-full object-contain" /> : <span className="text-[10px] text-muted-foreground">No banner</span>}
              </div>
              <div>
                <div className="font-display font-bold">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.user_email} · {c.placement_name} · {c.duration_weeks} wk from {c.start_date}</div>
                <a href={c.destination_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline break-all">{c.destination_url}</a>
                <div className="text-sm font-mono mt-1">{inr(c.total)} <span className="text-xs text-muted-foreground">paid via {c.payment_mode}</span></div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button data-testid={`approve-${c.id}`} onClick={() => approve(c.id)} disabled={busyId === c.id} size="sm" className="rounded-none h-9"><Check className="h-4 w-4 mr-1" />Approve</Button>
              <Button data-testid={`reject-open-${c.id}`} onClick={() => { setRejectFor(rejectFor === c.id ? null : c.id); setReason(""); }} disabled={busyId === c.id} size="sm" variant="outline" className="rounded-none h-9 text-destructive"><X className="h-4 w-4 mr-1" />Reject</Button>
            </div>
          </div>
          {rejectFor === c.id && (
            <div className="mt-3 flex flex-wrap gap-2 items-center border-t border-border pt-3">
              <Input data-testid={`reject-reason-${c.id}`} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for rejection (advertiser will see this)" className="rounded-none flex-1 min-w-[220px]" />
              <Button data-testid={`reject-confirm-${c.id}`} onClick={() => reject(c.id)} disabled={busyId === c.id} size="sm" variant="destructive" className="rounded-none h-9">Confirm Reject</Button>
            </div>
          )}
        </div>
      ))}
      {rows.length === 0 && <div className="bg-card border border-border py-14 text-center text-sm text-muted-foreground">No ads awaiting review. 🎉</div>}
    </div>
  );
}

function Revenue() {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/ads/admin/analytics").then(({ data }) => setD(data)).catch(() => setD(null)).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!d) return <div className="text-sm text-muted-foreground">Could not load analytics.</div>;

  return (
    <div className="space-y-6" data-testid="admin-revenue">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4"><IndianRupee className="h-4 w-4 text-solar mb-2" /><div className="font-display font-extrabold text-xl">{inr(d.total_revenue)}</div><div className="text-xs text-muted-foreground">Total Ad Revenue</div></div>
        <div className="bg-card border border-border p-4"><div className="font-display font-extrabold text-xl">{d.active}</div><div className="text-xs text-muted-foreground">Active Campaigns</div></div>
        <div className="bg-card border border-border p-4"><div className="font-display font-extrabold text-xl">{d.pending}</div><div className="text-xs text-muted-foreground">Pending Approval</div></div>
        <div className="bg-card border border-border p-4"><div className="font-display font-extrabold text-xl">{d.paid_campaigns}</div><div className="text-xs text-muted-foreground">Paid Campaigns</div></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-5">
          <h3 className="font-display font-bold text-sm tracking-tight mb-4">Monthly Ad Revenue</h3>
          {(d.monthly || []).length === 0 ? <div className="py-12 text-center text-sm text-muted-foreground">No revenue yet.</div> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={d.monthly} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 0 }} formatter={(v) => inr(v)} />
                <Bar dataKey="revenue" fill="#FF5A1F" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-card border border-border p-5">
          <h3 className="font-display font-bold text-sm tracking-tight mb-4">Top Performing Ad Slots</h3>
          <div className="space-y-2">
            {(d.top_slots || []).map((s) => (
              <div key={s.code} className="flex items-center justify-between text-sm border-b border-border pb-2">
                <div><div className="font-medium">{s.placement}</div><div className="text-xs text-muted-foreground">{s.campaigns} campaign(s)</div></div>
                <span className="font-mono font-bold">{inr(s.revenue)}</span>
              </div>
            ))}
            {(d.top_slots || []).length === 0 && <div className="text-sm text-muted-foreground py-6 text-center">No slot revenue yet.</div>}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border overflow-x-auto">
        <div className="px-5 py-3 font-display font-bold text-sm tracking-tight border-b border-border">Active Advertisers</div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="p-3">Advertiser</th><th className="p-3">Campaigns</th><th className="p-3">Active</th><th className="p-3">Impressions</th><th className="p-3">Spend</th></tr></thead>
          <tbody>
            {(d.advertisers || []).map((a) => (
              <tr key={a.user_id} className="border-b border-border hover:bg-muted/50">
                <td className="p-3"><div className="font-medium">{a.name || "—"}</div><div className="text-xs text-muted-foreground font-mono">{a.email}</div></td>
                <td className="p-3 font-mono">{a.campaigns}</td><td className="p-3 font-mono">{a.active}</td>
                <td className="p-3 font-mono">{num(a.impressions)}</td><td className="p-3 font-mono font-bold">{inr(a.spend)}</td>
              </tr>
            ))}
            {(d.advertisers || []).length === 0 && <tr><td colSpan="5" className="p-8 text-center text-muted-foreground">No advertisers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Pricing() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = () => { setLoading(true); api.get("/ads/admin/placements").then(({ data }) => setRows(data)).catch(() => setRows([])).finally(() => setLoading(false)); };
  useEffect(load, []);

  const setPrice = (code, v) => setRows((r) => r.map((p) => p.code === code ? { ...p, price_per_week: v } : p));

  const save = async (p) => {
    setBusy(p.code);
    try { await api.put(`/ads/admin/placements/${p.code}`, { price_per_week: Number(p.price_per_week) }); toast.success(`${p.name} updated`); }
    catch (e) { toast.error(e.response?.data?.detail || "Update failed"); } finally { setBusy(null); }
  };
  const toggle = async (p) => {
    setBusy(p.code);
    try { const { data } = await api.put(`/ads/admin/placements/${p.code}`, { enabled: !p.enabled }); setRows((r) => r.map((x) => x.code === p.code ? data : x)); toast.success(`${p.name} ${data.enabled ? "enabled" : "disabled"}`); }
    catch (e) { toast.error(e.response?.data?.detail || "Update failed"); } finally { setBusy(null); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="grid sm:grid-cols-3 gap-4" data-testid="admin-pricing">
      {rows.map((p) => (
        <div key={p.code} data-testid={`pricing-${p.code}`} className={`bg-card border p-5 ${p.enabled ? "border-border" : "border-dashed border-border opacity-70"}`}>
          <div className="flex items-center justify-between">
            <div className="font-display font-bold">{p.name}</div>
            <button data-testid={`toggle-${p.code}`} onClick={() => toggle(p)} disabled={busy === p.code} className={`text-xs font-mono px-2 py-0.5 ${p.enabled ? "bg-solar/10 text-solar" : "bg-muted text-muted-foreground"}`}>{p.enabled ? "Enabled" : "Disabled"}</button>
          </div>
          <div className="text-xs text-muted-foreground mt-2 mb-4 min-h-[32px]">{p.description}</div>
          <label className="text-xs text-muted-foreground mb-1 block">Price / week (₹)</label>
          <div className="flex gap-2">
            <Input data-testid={`price-${p.code}`} type="number" value={p.price_per_week} onChange={(e) => setPrice(p.code, e.target.value)} className="rounded-none" />
            <Button data-testid={`save-price-${p.code}`} onClick={() => save(p)} disabled={busy === p.code} className="rounded-none">{busy === p.code ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
