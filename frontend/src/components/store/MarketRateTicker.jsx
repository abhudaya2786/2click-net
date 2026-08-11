import { useLang } from "@/context/LanguageContext";
import { DEMO_MARKET_RATES } from "@/lib/platformScreenArchitecture";
import { TrendingDown, TrendingUp, Activity } from "lucide-react";

/**
 * Live commodity market ticker placeholder — ERP sync coming soon.
 */
export default function MarketRateTicker() {
  const { lang } = useLang();
  const hi = lang === "hi";

  return (
    <div
      className="bg-slate-900 text-white border-b border-slate-700"
      data-testid="market-rate-ticker"
    >
      <div className="mx-auto max-w-[1400px] px-4 md:px-10 py-2 flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-amber-400 shrink-0">
          <Activity className="h-3 w-3" />
          {hi ? "लाइव मार्केट" : "Live market"}
        </span>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-mono">
          {DEMO_MARKET_RATES.map((r) => {
            const up = r.change >= 0;
            return (
              <span key={r.commodityEn} className="flex items-center gap-2">
                <span className="text-slate-400">{hi ? r.commodityHi : r.commodityEn}</span>
                <span className="font-bold">{r.rate.toLocaleString("en-IN")}{r.unit}</span>
                <span className={up ? "text-emerald-400" : "text-red-400"}>
                  {up ? <TrendingUp className="h-3 w-3 inline" /> : <TrendingDown className="h-3 w-3 inline" />}
                  {up ? "+" : ""}{r.change}%
                </span>
              </span>
            );
          })}
        </div>
        <span className="text-[10px] text-slate-500 ml-auto">
          {hi ? "डेमो दरें · ERP सिंक जल्द" : "Demo rates · ERP sync coming soon"}
        </span>
      </div>
    </div>
  );
}
