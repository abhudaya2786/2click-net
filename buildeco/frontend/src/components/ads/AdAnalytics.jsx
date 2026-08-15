import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Eye, MousePointerClick, Percent } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { num } from "./adsShared";

export default function AdAnalytics() {
  const [campaigns, setCampaigns] = useState([]);
  const [sel, setSel] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/ads/campaigns").then(({ data }) => {
      const runnable = data.filter((c) => ["active", "paused", "expired"].includes(c.status));
      setCampaigns(runnable);
      if (runnable[0]) setSel(runnable[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!sel) { setStats(null); return; }
    setLoading(true);
    api.get(`/ads/campaigns/${sel}/stats`).then(({ data }) => setStats(data)).catch(() => setStats(null)).finally(() => setLoading(false));
  }, [sel]);

  return (
    <div className="space-y-5" data-testid="ad-analytics">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display font-extrabold text-xl tracking-tight">Campaign Analytics</h2>
        <select data-testid="analytics-campaign-select" value={sel} onChange={(e) => setSel(e.target.value)} className="bg-background border border-input px-3 h-10 text-sm min-w-[220px]">
          <option value="">Select a campaign…</option>
          {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {!sel && <div className="bg-card border border-border py-16 text-center text-sm text-muted-foreground">Select an active campaign to view its daily clicks &amp; impressions.</div>}

      {sel && loading && <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}

      {sel && !loading && stats && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border border-border p-4"><Eye className="h-4 w-4 text-solar mb-2" /><div className="font-display font-extrabold text-xl">{num(stats.impressions)}</div><div className="text-xs text-muted-foreground">Impressions</div></div>
            <div className="bg-card border border-border p-4"><MousePointerClick className="h-4 w-4 text-primary mb-2" /><div className="font-display font-extrabold text-xl">{num(stats.clicks)}</div><div className="text-xs text-muted-foreground">Clicks</div></div>
            <div className="bg-card border border-border p-4"><Percent className="h-4 w-4 text-amber-600 mb-2" /><div className="font-display font-extrabold text-xl">{stats.ctr}%</div><div className="text-xs text-muted-foreground">CTR</div></div>
          </div>
          <div className="bg-card border border-border p-5">
            <h3 className="font-display font-bold text-sm tracking-tight mb-4">Daily performance</h3>
            {(stats.series || []).length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">No data yet — this campaign hasn’t started running.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.series} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 0 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="impressions" stroke="#FF5A1F" strokeWidth={2} dot={false} name="Impressions" />
                  <Line type="monotone" dataKey="clicks" stroke="#0d9488" strokeWidth={2} dot={false} name="Clicks" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
