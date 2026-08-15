import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, IndianRupee } from "lucide-react";
import { inr } from "./adsShared";

export default function AdsBilling() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/ads/campaigns")
      .then(({ data }) => setRows(data.filter((c) => c.payment_status === "paid")))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const totalSpend = rows.reduce((s, c) => s + (c.total || 0), 0);

  return (
    <div className="space-y-5" data-testid="ads-billing">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display font-extrabold text-xl tracking-tight">Billing &amp; Invoices</h2>
        <div className="bg-card border border-border px-5 py-3 flex items-center gap-3">
          <IndianRupee className="h-5 w-5 text-solar" />
          <div><div className="text-xs text-muted-foreground">Total Ad Spend</div><div className="font-display font-extrabold text-lg" data-testid="billing-total-spend">{inr(totalSpend)}</div></div>
        </div>
      </div>

      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="p-3">Campaign</th><th className="p-3">Placement</th><th className="p-3">Base</th>
              <th className="p-3">GST</th><th className="p-3">Total</th><th className="p-3">Mode</th><th className="p-3">Paid On</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} data-testid={`invoice-row-${c.id}`} className="border-b border-border hover:bg-muted/50">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3">{c.placement_name}</td>
                <td className="p-3 font-mono">{inr(c.base_fee)}</td>
                <td className="p-3 font-mono">{inr(c.tax)}</td>
                <td className="p-3 font-mono font-bold">{inr(c.total)}</td>
                <td className="p-3"><span className="text-xs font-mono px-2 py-0.5 bg-accent">{c.payment_mode || "—"}</span></td>
                <td className="p-3 font-mono text-xs">{c.paid_at ? new Date(c.paid_at).toLocaleDateString("en-IN") : "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan="7" className="p-10 text-center text-muted-foreground">No paid ad invoices yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
