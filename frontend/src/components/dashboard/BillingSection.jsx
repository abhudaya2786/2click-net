import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function BillingSection() {
  const [sub, setSub] = useState(null);
  const [plans, setPlans] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [s, inv, pl] = await Promise.all([
      api.get("/subscriptions/me"),
      api.get("/invoices/me"),
      api.get("/plans"),
    ]);
    setSub(s.data.subscription);
    setInvoices(inv.data);
    setPlans(pl.data);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const subscribe = async (p) => {
    if (p.price === -1) { toast.info("Contact sales for the Enterprise plan"); return; }
    setBusy(`sub-${p.id}`);
    try {
      const { data } = await api.post("/subscriptions/subscribe", { plan_id: p.id });
      toast.success(data.invoice ? `Subscribed — invoice ${data.invoice.number} created` : `You're on ${p.name}`);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); } finally { setBusy(""); }
  };
  const cancel = async () => {
    setBusy("cancel");
    try { await api.post("/subscriptions/cancel"); toast.success("Subscription cancelled"); load(); }
    catch { toast.error("Failed"); } finally { setBusy(""); }
  };
  const pay = async (id) => {
    setBusy(`pay-${id}`);
    try {
      const { data } = await api.post("/payments/invoice-checkout", { invoice_id: id, origin_url: window.location.origin });
      window.location.href = data.checkout_url;
    } catch (e) { toast.error(e.response?.data?.detail || "Could not start payment"); setBusy(""); }
  };
  const download = async (inv) => {
    setBusy(`pdf-${inv.id}`);
    try {
      const res = await api.get(`/invoices/${inv.id}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch { toast.error("Could not open PDF"); } finally { setBusy(""); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6" data-testid="billing-section">
      <div className="bg-card border border-border p-6" data-testid="plan-current">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Current Plan</div>
            <div className="font-display font-extrabold text-2xl tracking-tight mt-1">{sub ? sub.plan_name : "No active plan"}</div>
            {sub && (
              <div className="text-sm text-muted-foreground mt-1">
                Status <span className={`font-mono px-1.5 py-0.5 ${sub.status === "active" ? "bg-solar/10 text-solar" : sub.status === "pending" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{sub.status}</span>
                {sub.current_period_end && sub.status !== "cancelled" && <> · renews {new Date(sub.current_period_end).toLocaleDateString("en-IN")}</>}
              </div>
            )}
          </div>
          {sub && sub.status !== "cancelled" && sub.price > 0 && (
            <Button data-testid="sub-cancel" onClick={cancel} disabled={busy === "cancel"} variant="outline" className="rounded-none">
              {busy === "cancel" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel plan"}
            </Button>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-display font-bold text-sm tracking-tight mb-3">Choose a plan</h3>
        <div className="grid gap-px bg-border border border-border md:grid-cols-3">
          {plans.map((p) => {
            const current = sub && sub.plan_id === p.id && sub.status !== "cancelled";
            return (
              <div key={p.id} className={`bg-card p-5 ${p.highlight ? "ring-2 ring-primary ring-inset" : ""}`}>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold">{p.name}</span>
                  {p.highlight && <Sparkles className="h-3.5 w-3.5 text-primary" />}
                </div>
                <div className="font-mono font-extrabold text-xl mt-1">{p.price === -1 ? "Custom" : fmt(p.price)}<span className="text-xs text-muted-foreground">{p.price > 0 ? `/${p.period}` : ""}</span></div>
                <p className="text-xs text-muted-foreground mt-1 h-8">{p.description}</p>
                <Button data-testid={`billing-subscribe-${p.name.toLowerCase()}`} onClick={() => subscribe(p)} disabled={current || busy === `sub-${p.id}`}
                  variant={p.highlight ? "default" : "outline"} className="w-full rounded-none mt-3">
                  {busy === `sub-${p.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : current ? "Current plan" : p.price === -1 ? "Contact Sales" : "Subscribe"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border">
        <div className="px-5 py-3 border-b border-border"><h3 className="font-display font-bold text-sm tracking-tight">Invoices ({invoices.length})</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="p-3">Invoice</th><th className="p-3">Type</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Date</th><th className="p-3 text-right">Actions</th></tr></thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} data-testid={`invoice-row-${inv.id}`} className="border-b border-border hover:bg-muted/50">
                  <td className="p-3 font-mono text-xs">{inv.number}</td>
                  <td className="p-3"><span className="text-xs font-mono px-1.5 py-0.5 bg-muted">{inv.type}</span></td>
                  <td className="p-3 font-mono">{fmt(inv.total)}</td>
                  <td className="p-3">{inv.status === "paid"
                    ? <span className="inline-flex items-center gap-1 text-xs font-mono text-solar"><CheckCircle2 className="h-3.5 w-3.5" />paid</span>
                    : <span className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground"><XCircle className="h-3.5 w-3.5" />{inv.status}</span>}</td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(inv.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      {inv.status !== "paid" && <Button data-testid={`invoice-pay-${inv.id}`} onClick={() => pay(inv.id)} disabled={busy === `pay-${inv.id}`} size="sm" className="rounded-none h-8">
                        {busy === `pay-${inv.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Pay with card"}</Button>}
                      <Button data-testid={`invoice-pdf-${inv.id}`} onClick={() => download(inv)} disabled={busy === `pdf-${inv.id}`} size="sm" variant="outline" className="rounded-none h-8">
                        {busy === `pdf-${inv.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-muted-foreground">No invoices yet. Subscribe to a plan to get started.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
