import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function fmtPrice(p) {
  if (p === -1 || p === "Custom") return "Custom";
  if (p === 0) return "₹0";
  return `₹${Number(p).toLocaleString("en-IN")}`;
}

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/plans").then(({ data }) => setPlans(data)).finally(() => setLoading(false)); }, []);

  return (
    <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-16 md:py-24">
      <div className="max-w-2xl mb-14">
        <span className="text-xs font-mono uppercase tracking-widest text-primary">Pricing</span>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight mt-3">Plans that scale with your projects.</h1>
        <p className="mt-4 text-muted-foreground">Transparent pricing. No hidden fees. Cancel anytime.</p>
      </div>
      {loading ? <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <div className="grid gap-px bg-border border border-border lg:grid-cols-3">
          {plans.map((p) => (
            <div key={p.id} data-testid={`plan-${p.name.toLowerCase()}`}
              className={`bg-card p-8 relative ${p.highlight ? "ring-2 ring-primary ring-inset" : ""}`}>
              {p.highlight && <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-mono uppercase tracking-wider px-3 py-1">Popular</span>}
              <h3 className="font-display font-extrabold text-xl tracking-tight">{p.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 h-10">{p.description}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display font-extrabold text-4xl tracking-tight">{fmtPrice(p.price)}</span>
                {p.price > 0 && <span className="text-muted-foreground text-sm">/{p.period}</span>}
              </div>
              <Link to="/register"><Button className="w-full rounded-none mt-6" variant={p.highlight ? "default" : "outline"} data-testid={`plan-cta-${p.name.toLowerCase()}`}>
                {p.price === -1 ? "Contact Sales" : "Get Started"}</Button></Link>
              <ul className="mt-6 space-y-3">
                {(p.features || []).map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" strokeWidth={2} />{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
