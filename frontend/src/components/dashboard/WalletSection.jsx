import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";

export default function WalletSection() {
  const [data, setData] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get("/wallet/me"); setData(data); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6" data-testid="wallet-section">
      <div className="bg-primary text-white p-6 border border-primary max-w-sm">
        <div className="flex items-center gap-2 text-sm opacity-90"><Wallet className="h-4 w-4" />Wallet Balance</div>
        <div data-testid="wallet-balance" className="font-display font-extrabold text-4xl tracking-tight mt-3">₹{Number(data.balance).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
        <p className="text-xs opacity-80 mt-2">Credited &amp; managed by buildecogroup.com Super Admin</p>
      </div>
      <div className="bg-card border border-border overflow-x-auto">
        <div className="px-5 py-3 border-b border-border font-display font-bold text-sm">Transaction Ledger</div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="p-3">Type</th><th className="p-3">Amount</th><th className="p-3">Reason</th><th className="p-3">Balance After</th><th className="p-3">Date</th></tr></thead>
          <tbody>
            {data.transactions.map((t) => (
              <tr key={t.id} data-testid={`wtx-${t.id}`} className="border-b border-border hover:bg-muted/50">
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 ${t.type === "credit" ? "bg-solar/10 text-solar" : "bg-destructive/10 text-destructive"}`}>
                    {t.type === "credit" ? <ArrowDownCircle className="h-3 w-3" /> : <ArrowUpCircle className="h-3 w-3" />}{t.type}
                  </span>
                </td>
                <td className={`p-3 font-mono font-medium ${t.type === "credit" ? "text-solar" : "text-destructive"}`}>{t.type === "credit" ? "+" : "−"}₹{Number(t.amount).toLocaleString("en-IN")}</td>
                <td className="p-3 text-muted-foreground">{t.reason || "—"}</td>
                <td className="p-3 font-mono">₹{Number(t.balance_after).toLocaleString("en-IN")}</td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString("en-IN")}</td>
              </tr>
            ))}
            {data.transactions.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-muted-foreground">No transactions yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
