import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, PlayCircle } from "lucide-react";
import { toast } from "sonner";

const A = "/admin";
const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

function Card({ label, value, sub }) {
  return (
    <div className="bg-card border border-border p-4">
      <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display font-extrabold text-xl tracking-tight mt-1">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

export default function AdminBilling() {
  const [summary, setSummary] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [subs, setSubs] = useState([]);
  const [tab, setTab] = useState("invoices");
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [s, inv, su] = await Promise.all([
      api.get(`${A}/billing/summary`),
      api.get(`${A}/billing/invoices`),
      api.get(`${A}/billing/subscriptions`),
    ]);
    setSummary(s.data); setInvoices(inv.data); setSubs(su.data);
  }, []);
  useEffect(() => { load(); }, [load]);

  const runCommission = async () => {
    setBusy(true);
    try {
      const { data } = await api.post(`${A}/billing/run-commission`, { period });
      toast.success(`Commission run for ${data.period}: ${data.invoices_created} invoice(s) created`);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Run failed"); } finally { setBusy(false); }
  };

  if (!summary) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6" data-testid="admin-billing">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="MRR" value={fmt(summary.mrr)} sub={`${summary.active_subscriptions} active subs`} />
        <Card label="Total Invoiced" value={fmt(summary.total_invoiced)} sub={`${summary.invoice_count} invoices`} />
        <Card label="Collected" value={fmt(summary.total_paid)} />
        <Card label="Outstanding" value={fmt(summary.outstanding)} sub={`Commission ${fmt(summary.total_commission)}`} />
      </div>

      <div className="bg-card border border-border p-4 flex items-end gap-3 flex-wrap">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">Commission payout period</label>
          <Input data-testid="commission-period" type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded-none h-9 w-44" />
        </div>
        <Button data-testid="run-commission-btn" onClick={runCommission} disabled={busy} className="rounded-none">
          {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <PlayCircle className="h-4 w-4 mr-1.5" />}Generate commission invoices
        </Button>
        <p className="text-xs text-muted-foreground">Aggregates platform commission from paid orders and bills each vendor.</p>
      </div>

      <div className="flex gap-1 border border-border bg-card">
        {["invoices", "subscriptions"].map((t) => (
          <button key={t} data-testid={`billing-subtab-${t}`} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize ${tab === t ? "bg-primary text-white" : "text-muted-foreground hover:bg-accent"}`}>{t}</button>
        ))}
      </div>

      {tab === "invoices" && (
        <div className="bg-card border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="p-3">Invoice</th><th className="p-3">Customer</th><th className="p-3">Type</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Date</th></tr></thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id} className="border-b border-border hover:bg-muted/50">
                  <td className="p-3 font-mono text-xs">{i.number}</td>
                  <td className="p-3">{i.user_email}</td>
                  <td className="p-3"><span className="text-xs font-mono px-1.5 py-0.5 bg-muted">{i.type}</span></td>
                  <td className="p-3 font-mono">{fmt(i.total)}</td>
                  <td className="p-3"><span className={`text-xs font-mono px-1.5 py-0.5 ${i.status === "paid" ? "bg-solar/10 text-solar" : "bg-muted text-muted-foreground"}`}>{i.status}</span></td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(i.created_at).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-muted-foreground">No invoices yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "subscriptions" && (
        <div className="bg-card border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="p-3">Customer</th><th className="p-3">Plan</th><th className="p-3">Price</th><th className="p-3">Status</th><th className="p-3">Renews</th></tr></thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b border-border hover:bg-muted/50">
                  <td className="p-3">{s.user_email || s.user_id}</td>
                  <td className="p-3 font-medium">{s.plan_name}</td>
                  <td className="p-3 font-mono">{fmt(s.price)}/{s.period}</td>
                  <td className="p-3"><span className={`text-xs font-mono px-1.5 py-0.5 ${s.status === "active" ? "bg-solar/10 text-solar" : "bg-muted text-muted-foreground"}`}>{s.status}</span></td>
                  <td className="p-3 text-xs text-muted-foreground">{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString("en-IN") : "—"}</td>
                </tr>
              ))}
              {subs.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-muted-foreground">No subscriptions yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
