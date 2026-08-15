import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatCard } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Megaphone, Eye, MousePointerClick, Percent, IndianRupee, Loader2, PlusSquare } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { inr, num } from "./adsShared";

export default function AdOverview({ onCreate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/ads/analytics/me")
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const d = data || { active_ads: 0, impressions: 0, clicks: 0, ctr: 0, spend: 0, series: [] };
  const series = d.series || [];

  return (
    <div className="space-y-6" data-testid="ad-overview">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display font-extrabold text-xl tracking-tight">Campaign Performance</h2>
        <Button data-testid="overview-create-btn" onClick={onCreate} className="rounded-none"><PlusSquare className="h-4 w-4 mr-1.5" />Create Ad</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Megaphone} label="Active Ads" value={num(d.active_ads)} />
        <StatCard icon={Eye} label="Total Impressions" value={num(d.impressions)} color="text-solar" />
        <StatCard icon={MousePointerClick} label="Total Clicks" value={num(d.clicks)} color="text-primary" />
        <StatCard icon={Percent} label="Average CTR" value={`${d.ctr}%`} color="text-amber-600" />
        <StatCard icon={IndianRupee} label="Total Ad Spend" value={inr(d.spend)} color="text-solar" />
      </div>

      <div className="bg-card border border-border p-5">
        <h3 className="font-display font-bold text-sm tracking-tight mb-4">Impressions &amp; Clicks — daily</h3>
        {series.length === 0 ? (
          <div className="py-14 text-center text-sm text-muted-foreground">
            No performance data yet. Create and activate a campaign to start collecting impressions &amp; clicks.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={series} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="ov-impr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5A1F" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#FF5A1F" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ov-clk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 0 }} />
              <Area type="monotone" dataKey="impressions" stroke="#FF5A1F" fill="url(#ov-impr)" strokeWidth={2} name="Impressions" />
              <Area type="monotone" dataKey="clicks" stroke="#0d9488" fill="url(#ov-clk)" strokeWidth={2} name="Clicks" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
