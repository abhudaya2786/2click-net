import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Wallet, CreditCard, Pause, Play, Trash2, PlusSquare } from "lucide-react";
import { STATUS_STYLE, STATUS_LABEL, inr, num } from "./adsShared";

export default function MyCampaigns({ onCreate }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/ads/campaigns").then(({ data }) => setRows(data)).catch(() => setRows([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const act = async (id, fn, okMsg) => {
    setBusyId(id);
    try { await fn(); if (okMsg) toast.success(okMsg); load(); }
    catch (e) { toast.error(e.response?.data?.detail || "Action failed"); }
    finally { setBusyId(null); }
  };

  const payWallet = (id) => act(id, () => api.post(`/ads/campaigns/${id}/pay-wallet`), "Paid via wallet — submitted for approval");
  const payCard = async (id) => {
    setBusyId(id);
    try {
      const { data } = await api.post(`/ads/campaigns/${id}/checkout`, { origin_url: window.location.origin });
      window.location.href = data.checkout_url;
    } catch (e) { toast.error(e.response?.data?.detail || "Checkout failed"); setBusyId(null); }
  };
  const pause = (id) => act(id, () => api.post(`/ads/campaigns/${id}/pause`), "Campaign paused");
  const resume = (id) => act(id, () => api.post(`/ads/campaigns/${id}/resume`), "Campaign resumed");
  const del = (id) => act(id, () => api.delete(`/ads/campaigns/${id}`), "Campaign deleted");

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5" data-testid="my-campaigns">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-extrabold text-xl tracking-tight">My Campaigns</h2>
        <Button data-testid="campaigns-create-btn" onClick={onCreate} className="rounded-none"><PlusSquare className="h-4 w-4 mr-1.5" />Create Ad</Button>
      </div>

      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="p-3">Campaign</th><th className="p-3">Placement</th><th className="p-3">Status</th>
              <th className="p-3">Performance</th><th className="p-3">Total</th><th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} data-testid={`campaign-row-${c.id}`} className="border-b border-border hover:bg-muted/50 align-top">
                <td className="p-3">
                  <div className="font-medium">{c.name}</div>
                  <a href={c.destination_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline break-all">{c.destination_url}</a>
                </td>
                <td className="p-3 whitespace-nowrap">{c.placement_name}<div className="text-xs text-muted-foreground">{c.duration_weeks} wk · {c.start_date}</div></td>
                <td className="p-3">
                  <span data-testid={`campaign-status-${c.id}`} className={`text-xs font-mono px-2 py-0.5 whitespace-nowrap ${STATUS_STYLE[c.status] || "bg-muted"}`}>{STATUS_LABEL[c.status] || c.status}</span>
                  {c.status === "rejected" && c.reject_reason && <div className="text-xs text-destructive mt-1 max-w-[180px]">“{c.reject_reason}”{c.refunded ? " · refunded" : ""}</div>}
                </td>
                <td className="p-3 whitespace-nowrap">
                  <div className="font-mono">{num(c.clicks)} <span className="text-muted-foreground text-xs">clicks</span></div>
                  <div className="text-xs text-muted-foreground font-mono">{num(c.impressions)} impr · {c.ctr}% CTR</div>
                </td>
                <td className="p-3 font-mono whitespace-nowrap">{inr(c.total)}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {c.payment_status === "unpaid" && c.status !== "rejected" && (
                      <>
                        <Button data-testid={`pay-wallet-${c.id}`} onClick={() => payWallet(c.id)} disabled={busyId === c.id} size="sm" className="rounded-none h-8"><Wallet className="h-3.5 w-3.5 mr-1" />Wallet</Button>
                        <Button data-testid={`pay-card-${c.id}`} onClick={() => payCard(c.id)} disabled={busyId === c.id} size="sm" variant="outline" className="rounded-none h-8"><CreditCard className="h-3.5 w-3.5 mr-1" />Card</Button>
                        <Button data-testid={`delete-${c.id}`} onClick={() => del(c.id)} disabled={busyId === c.id} size="sm" variant="ghost" className="rounded-none h-8 px-2 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </>
                    )}
                    {c.status === "active" && <Button data-testid={`pause-${c.id}`} onClick={() => pause(c.id)} disabled={busyId === c.id} size="sm" variant="outline" className="rounded-none h-8"><Pause className="h-3.5 w-3.5 mr-1" />Pause</Button>}
                    {c.status === "paused" && <Button data-testid={`resume-${c.id}`} onClick={() => resume(c.id)} disabled={busyId === c.id} size="sm" className="rounded-none h-8"><Play className="h-3.5 w-3.5 mr-1" />Resume</Button>}
                    {busyId === c.id && <Loader2 className="h-4 w-4 animate-spin text-primary self-center" />}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan="6" className="p-10 text-center text-muted-foreground">No campaigns yet. Click “Create Ad” to launch your first campaign.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
