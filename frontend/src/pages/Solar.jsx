import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sun, Loader2, IndianRupee, Leaf, TrendingUp, Zap } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const SOLAR_IMG = "https://images.unsplash.com/photo-1726554068139-d3669703634a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwyfHxzb2xhciUyMHBhbmVscyUyMGRyb25lJTIwdmlldyUyMGdyZWVuJTIwZW5lcmd5fGVufDB8fHx8MTc4NjA3NzM3OHww&ixlib=rb-4.1.0&q=85";

export default function Solar() {
  const { user } = useAuth();
  const [form, setForm] = useState({ monthly_bill: 5000, roof_area_sqft: 600, state: "Maharashtra", tariff: 8 });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const calc = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/solar/calculate", {
        monthly_bill: Number(form.monthly_bill), roof_area_sqft: Number(form.roof_area_sqft),
        state: form.state, tariff: Number(form.tariff),
      });
      setResult(data);
    } catch { toast.error("Calculation failed"); } finally { setBusy(false); }
  };

  const saveQuote = async () => {
    if (!user) { toast.error("Log in to save quotation"); return; }
    await api.post("/solar/quotations", { name: `Solar ${result.recommended_capacity_kw}kW`, capacity_kw: result.recommended_capacity_kw, total_cost: result.net_cost, payload: result });
    toast.success("Quotation saved to your dashboard");
  };

  const metrics = result ? [
    { icon: Zap, label: "Recommended capacity", value: `${result.recommended_capacity_kw} kW`, color: "text-solar" },
    { icon: IndianRupee, label: "Net cost (after subsidy)", value: `₹${result.net_cost.toLocaleString("en-IN")}`, color: "text-primary" },
    { icon: TrendingUp, label: "Payback period", value: `${result.payback_years} yrs`, color: "text-tender" },
    { icon: Leaf, label: "CO₂ offset / year", value: `${result.co2_offset_tonnes} T`, color: "text-solar" },
  ] : [];

  return (
    <div>
      <section className="relative border-b border-border">
        <img src={SOLAR_IMG} alt="Solar" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="relative mx-auto max-w-[1400px] px-5 md:px-10 py-20 text-white">
          <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-solar border border-solar/40 px-3 py-1.5 mb-5">
            <Sun className="h-3.5 w-3.5" /> Solar Energy Portal
          </span>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight max-w-2xl leading-tight">Size your solar plant in 30 seconds.</h1>
          <p className="mt-4 text-slate-300 max-w-lg">Instant capacity, subsidy, ROI and payback estimation for rooftop solar across India.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-14 grid lg:grid-cols-[400px_1fr] gap-px bg-border border border-border">
        <div className="bg-card p-8">
          <h2 className="font-display font-bold text-lg tracking-tight mb-6">Calculator</h2>
          <div className="space-y-5">
            {[["monthly_bill","Monthly electricity bill (₹)"],["roof_area_sqft","Available roof area (sq.ft)"],["tariff","Electricity tariff (₹/unit)"]].map(([k,l]) => (
              <div key={k}><label className="text-sm font-medium mb-1.5 block">{l}</label>
                <Input data-testid={`solar-${k}`} type="number" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="rounded-none" /></div>
            ))}
            <div><label className="text-sm font-medium mb-1.5 block">State</label>
              <Input data-testid="solar-state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="rounded-none" /></div>
            <Button data-testid="solar-calc" onClick={calc} disabled={busy} className="w-full rounded-none">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Calculate"}
            </Button>
          </div>
        </div>

        <div className="bg-card p-8">
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-16">
              <Sun className="h-10 w-10 mb-4 text-solar" strokeWidth={1.25} />
              <p className="text-sm">Enter your details to see your personalized solar estimate.</p>
            </div>
          ) : (
            <div>
              <div className="grid sm:grid-cols-2 gap-px bg-border border border-border">
                {metrics.map((m, i) => (
                  <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="bg-card p-5">
                    <m.icon className={`h-5 w-5 ${m.color} mb-3`} strokeWidth={1.5} />
                    <div className="font-display font-extrabold text-2xl tracking-tight mono">{m.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between border-b border-border py-2"><span className="text-muted-foreground">Total cost</span><span className="font-mono">₹{result.total_cost.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between border-b border-border py-2"><span className="text-muted-foreground">Subsidy</span><span className="font-mono text-solar">−₹{result.subsidy.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between border-b border-border py-2"><span className="text-muted-foreground">Annual generation</span><span className="font-mono">{result.annual_generation_kwh.toLocaleString("en-IN")} kWh</span></div>
                <div className="flex justify-between border-b border-border py-2"><span className="text-muted-foreground">25-yr savings</span><span className="font-mono text-solar">₹{result.roi_25yr.toLocaleString("en-IN")}</span></div>
              </div>
              <Button data-testid="solar-save-quote" onClick={saveQuote} className="mt-6 rounded-none">Save quotation</Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
