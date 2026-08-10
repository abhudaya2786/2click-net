import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sun, Loader2, Zap, IndianRupee, TrendingUp, Leaf, Ruler, FileText, FileCheck2,
  Upload, CheckCircle2, Download, Save, Building2, Home, BatteryCharging, Trash2, Layers,
} from "lucide-react";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const SEGMENTS = [
  { id: "residential", label: "Residential", icon: Home },
  { id: "commercial", label: "Commercial / Industrial", icon: Building2 },
];
const SYSTEMS = [
  { id: "ongrid", label: "On-Grid" },
  { id: "hybrid", label: "Hybrid" },
  { id: "offgrid", label: "Off-Grid" },
];
const TIERS = [
  { id: "premium", label: "Tier-1 Premium", note: "TOPCon Bifacial" },
  { id: "standard", label: "Standard", note: "Mono-PERC" },
  { id: "budget", label: "Budget", note: "ALMM Mono-PERC" },
];

const Metric = ({ icon: Icon, label, value, color = "text-primary" }) => (
  <div className="bg-card p-4">
    <Icon className={`h-5 w-5 ${color} mb-2`} strokeWidth={1.5} />
    <div className="font-display font-extrabold text-xl tracking-tight">{value}</div>
    <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
  </div>
);

export default function SolarEstimator({ embedded = false }) {
  const { user } = useAuth();
  const [f, setF] = useState({
    segment: "residential", system_type: "ongrid", tier: "standard",
    monthly_bill: 5000, tariff: 8, roof_area_sqft: 600, autonomy_days: 1,
    down_payment_percent: 20, tenure_years: 10, interest_rate: "",
    customer_name: "", site_address: "", state: "Maharashtra", discom: "", contact: "",
  });
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [proposal, setProposal] = useState(null);
  const [brands, setBrands] = useState([]);
  const [components, setComponents] = useState([]);
  const [sel, setSel] = useState({});
  const [packages, setPackages] = useState([]);
  const [appliedPkg, setAppliedPkg] = useState(null);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    Promise.all([api.get("/solar/epc/brands"), api.get("/solar/epc/components"), api.get("/solar/epc/packages")])
      .then(([b, c, p]) => { setBrands(b.data || []); setComponents(c.data.components || []); setPackages(p.data || []); })
      .catch(() => {});
  }, []);

  const brandsByCat = useMemo(() => {
    const m = {};
    brands.forEach((b) => { (m[b.category_code] = m[b.category_code] || []).push(b); });
    return m;
  }, [brands]);
  const selCount = Object.values(sel).filter(Boolean).length;

  const applyPackage = (p) => {
    const next = {};
    (p.items || []).forEach((it) => { if (it.available && it.brand_id) next[it.category_code] = it.brand_id; });
    setSel(next);
    setAppliedPkg(p.id);
    toast.success(`Applied "${p.name}" — now generate your estimate`);
  };
  const clearPackage = () => { setSel({}); setAppliedPkg(null); };

  const payload = () => ({
    segment: f.segment, system_type: f.system_type, tier: f.tier,
    monthly_bill: Number(f.monthly_bill) || 0, tariff: Number(f.tariff) || 8,
    roof_area_sqft: Number(f.roof_area_sqft) || 0, autonomy_days: Number(f.autonomy_days) || 1,
    loan_enabled: true, down_payment_percent: Number(f.down_payment_percent) || 0,
    tenure_years: Number(f.tenure_years) || 0, interest_rate: f.interest_rate ? Number(f.interest_rate) : null,
    customer_name: f.customer_name, site_address: f.site_address, state: f.state,
    discom: f.discom, contact: f.contact,
    brand_selections: Object.fromEntries(Object.entries(sel).filter(([, v]) => v)),
  });

  const estimate = async () => {
    setBusy(true); setProposal(null);
    try {
      const { data } = await api.post("/solar/epc/estimate", payload());
      setRes(data);
    } catch { toast.error("Could not compute estimate"); } finally { setBusy(false); }
  };

  const save = async () => {
    if (!user) { toast.error("Log in to save this proposal"); return; }
    setSaving(true);
    try {
      const { data } = await api.post("/solar/epc/proposals", payload());
      setProposal(data);
      toast.success(`Proposal ${data.proposal_no} saved`);
    } catch (e) { toast.error(e.response?.data?.detail || "Save failed"); } finally { setSaving(false); }
  };

  const openDoc = async (kind) => {
    if (!proposal) return;
    try {
      const r = await api.get(`/solar/epc/proposals/${proposal.id}/${kind}`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([r.data], { type: "application/pdf" }));
      window.open(url, "_blank"); setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch { toast.error("Could not open PDF"); }
  };

  const battery = f.system_type !== "ongrid";
  const chartData = res?.generation?.yearly || [];

  return (
    <div className="space-y-6" data-testid="solar-estimator">
      <div className={`grid ${embedded ? "lg:grid-cols-[380px_1fr]" : "lg:grid-cols-[400px_1fr]"} gap-px bg-border border border-border`}>
        {/* ------------------------------------------------- form */}
        <div className="bg-card p-6 space-y-5">
          <div className="flex items-center gap-2"><Zap className="h-5 w-5 text-solar" /><h2 className="font-display font-bold text-lg tracking-tight">EPC Configurator</h2></div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Segment</label>
            <div className="grid grid-cols-2 gap-2">
              {SEGMENTS.map((s) => (
                <button key={s.id} data-testid={`seg-${s.id}`} onClick={() => set("segment", s.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm border transition-colors ${f.segment === s.id ? "bg-primary text-white border-primary" : "border-border hover:bg-accent"}`}>
                  <s.icon className="h-4 w-4" />{s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">System type</label>
            <div className="grid grid-cols-3 gap-2">
              {SYSTEMS.map((s) => (
                <button key={s.id} data-testid={`sys-${s.id}`} onClick={() => set("system_type", s.id)}
                  className={`px-2 py-2 text-sm border transition-colors ${f.system_type === s.id ? "bg-primary text-white border-primary" : "border-border hover:bg-accent"}`}>{s.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Component grade</label>
            <div className="grid grid-cols-3 gap-2">
              {TIERS.map((t) => (
                <button key={t.id} data-testid={`tier-${t.id}`} onClick={() => set("tier", t.id)}
                  className={`px-2 py-2 text-xs border transition-colors text-left ${f.tier === t.id ? "bg-primary text-white border-primary" : "border-border hover:bg-accent"}`}>
                  <div className="font-semibold">{t.label}</div><div className={`text-[10px] ${f.tier === t.id ? "text-white/80" : "text-muted-foreground"}`}>{t.note}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Monthly bill (₹)</label>
              <Input data-testid="epc-bill" type="number" value={f.monthly_bill} onChange={(e) => set("monthly_bill", e.target.value)} className="rounded-none" /></div>
            <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tariff (₹/unit)</label>
              <Input data-testid="epc-tariff" type="number" value={f.tariff} onChange={(e) => set("tariff", e.target.value)} className="rounded-none" /></div>
            <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Roof area (sq.ft)</label>
              <Input data-testid="epc-roof" type="number" value={f.roof_area_sqft} onChange={(e) => set("roof_area_sqft", e.target.value)} className="rounded-none" /></div>
            {battery && <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Backup (days)</label>
              <Input data-testid="epc-autonomy" type="number" step="0.5" value={f.autonomy_days} onChange={(e) => set("autonomy_days", e.target.value)} className="rounded-none" /></div>}
          </div>

          {packages.length > 0 && (
            <div data-testid="solar-packages">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" />Ready-made packages (1-tap)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {packages.map((p) => (
                  <button key={p.id} type="button" data-testid={`pkg-pick-${p.id}`} onClick={() => applyPackage(p)}
                    className={`text-left border p-2.5 transition-colors ${appliedPkg === p.id ? "border-primary bg-primary/5" : "border-border hover:bg-accent"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm">{p.name}</span>
                      <span className="text-[10px] font-mono uppercase bg-solar/10 text-solar px-1.5 py-0.5">{p.tier_label}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{(p.items || []).filter((i) => i.available).length} components{p.description ? ` · ${p.description}` : ""}</div>
                  </button>
                ))}
              </div>
              {appliedPkg && <button type="button" data-testid="pkg-clear" onClick={clearPackage} className="text-xs text-muted-foreground hover:text-destructive mt-1.5">Clear package & choose manually</button>}
            </div>
          )}

          {components.filter((c) => (brandsByCat[c.code] || []).length && (c.code !== "battery" || battery)).length > 0 && (
            <details className="text-sm" data-testid="brand-select">
              <summary className="cursor-pointer text-muted-foreground text-xs font-medium">
                Choose component brands (optional){selCount > 0 ? ` · ${selCount} selected` : ""}
              </summary>
              <p className="text-[11px] text-muted-foreground mt-2">Pick specific brands — their live rates replace the default {TIERS.find((t) => t.id === f.tier)?.label} pricing in your BOQ.</p>
              <div className="mt-2.5 space-y-2.5">
                {components.filter((c) => (brandsByCat[c.code] || []).length && (c.code !== "battery" || battery)).map((c) => (
                  <div key={c.code}>
                    <label className="text-xs text-muted-foreground mb-1 block">{c.label}</label>
                    <select data-testid={`brand-sel-${c.code}`} value={sel[c.code] || ""}
                      onChange={(e) => setSel((p) => ({ ...p, [c.code]: e.target.value }))}
                      className="w-full bg-background border border-input px-2 h-9 text-sm rounded-none">
                      <option value="" label={`Default (${TIERS.find((t) => t.id === f.tier)?.label || "Standard"})`} />
                      {(brandsByCat[c.code] || []).map((b) => (
                        <option key={b.id} value={b.id} label={`${b.brand_name}${b.module_wp ? ` ${b.module_wp}Wp` : ""} — ₹${Number(b.rate).toLocaleString("en-IN")}${c.unit}`} />
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </details>
          )}

          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground text-xs font-medium">Financing & customer details</summary>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div><label className="text-xs text-muted-foreground mb-1 block">Down payment (%)</label>
                <Input type="number" value={f.down_payment_percent} onChange={(e) => set("down_payment_percent", e.target.value)} className="rounded-none" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Tenure (yrs)</label>
                <Input type="number" value={f.tenure_years} onChange={(e) => set("tenure_years", e.target.value)} className="rounded-none" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Interest % (opt)</label>
                <Input type="number" value={f.interest_rate} placeholder="auto" onChange={(e) => set("interest_rate", e.target.value)} className="rounded-none" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">State</label>
                <Input value={f.state} onChange={(e) => set("state", e.target.value)} className="rounded-none" /></div>
              <div className="col-span-2"><label className="text-xs text-muted-foreground mb-1 block">Customer / Company name</label>
                <Input data-testid="epc-customer" value={f.customer_name} onChange={(e) => set("customer_name", e.target.value)} className="rounded-none" /></div>
              <div className="col-span-2"><label className="text-xs text-muted-foreground mb-1 block">Site address</label>
                <Input value={f.site_address} onChange={(e) => set("site_address", e.target.value)} className="rounded-none" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">DISCOM</label>
                <Input value={f.discom} onChange={(e) => set("discom", e.target.value)} className="rounded-none" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Contact</label>
                <Input value={f.contact} onChange={(e) => set("contact", e.target.value)} className="rounded-none" /></div>
            </div>
          </details>

          <Button data-testid="epc-estimate" onClick={estimate} disabled={busy} className="w-full rounded-none">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate EPC estimate"}
          </Button>
        </div>

        {/* ------------------------------------------------- results */}
        <div className="bg-card p-6">
          {!res ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-16">
              <Sun className="h-10 w-10 mb-4 text-solar" strokeWidth={1.25} />
              <p className="text-sm">Configure your system and generate a full EPC estimate — sizing, BOQ, subsidy, loan & DPR.</p>
            </div>
          ) : (
            <div className="space-y-6" data-testid="epc-results">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
                <Metric icon={Zap} label="Recommended capacity" value={`${res.sizing.recommended_capacity_kwp} kWp`} color="text-solar" />
                <Metric icon={Ruler} label="Rooftop area needed" value={`${res.sizing.area_required_sqft} ft²`} color="text-tender" />
                <Metric icon={Sun} label="Year-1 generation" value={`${res.generation.annual_kwh_y1.toLocaleString("en-IN")} kWh`} color="text-solar" />
                <Metric icon={IndianRupee} label="Net cost (after subsidy)" value={inr(res.pricing.net_cost)} />
                {res.financing?.emi ? <Metric icon={IndianRupee} label="EMI / month" value={inr(res.financing.emi)} color="text-tender" /> : null}
                <Metric icon={TrendingUp} label="Payback" value={`${res.payback_years} yrs`} color="text-solar" />
              </div>

              {res.sizing.roof_limited && (
                <div className="text-xs border border-primary/30 bg-primary/5 text-primary px-3 py-2" data-testid="epc-roof-warn">
                  Capacity limited by available roof area. Increase roof area for a larger plant.
                </div>
              )}

              {/* generation chart */}
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                  <Leaf className="h-3.5 w-3.5" /> 25-year generation (0.55%/yr degradation) · {res.environment.co2_offset_tonnes_25yr} T CO₂ saved
                </div>
                <div className="h-52 border border-border p-2" data-testid="epc-gen-chart">
                  <ResponsiveContainer width="100%" height="100%" minHeight={180}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -8, bottom: 0 }}>
                      <defs><linearGradient id="genfill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--solar))" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="hsl(var(--solar))" stopOpacity={0} />
                      </linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v, n) => n === "generation_kwh" ? [`${v.toLocaleString("en-IN")} kWh`, "Generation"] : [inr(v), "Cumulative savings"]} contentStyle={{ borderRadius: 0, fontSize: 12 }} />
                      <Area type="monotone" dataKey="generation_kwh" stroke="hsl(var(--solar))" strokeWidth={2} fill="url(#genfill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* BOQ */}
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Bill of Quantities · {res.boq.tier_label}</div>
                <div className="border border-border overflow-x-auto">
                  <table className="w-full text-sm" data-testid="epc-boq">
                    <thead><tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="p-2.5">#</th><th className="p-2.5">Component</th><th className="p-2.5">Brand</th><th className="p-2.5 text-right">Qty</th><th className="p-2.5 text-right">Rate</th><th className="p-2.5 text-right">Amount</th></tr></thead>
                    <tbody>
                      {res.boq.items.map((it) => (
                        <tr key={it.sr} className="border-b border-border align-top">
                          <td className="p-2.5 text-muted-foreground">{it.sr}</td>
                          <td className="p-2.5"><div className="font-medium">{it.item}</div><div className="text-[11px] text-muted-foreground">{it.spec}</div></td>
                          <td className="p-2.5 text-xs">{it.brand}</td>
                          <td className="p-2.5 text-right font-mono whitespace-nowrap">{it.qty} {it.unit}</td>
                          <td className="p-2.5 text-right font-mono">{inr(it.rate)}</td>
                          <td className="p-2.5 text-right font-mono font-medium">{inr(it.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="font-mono">
                      <tr className="border-b border-border"><td colSpan="5" className="p-2.5 text-right text-muted-foreground">Subtotal</td><td className="p-2.5 text-right">{inr(res.boq.subtotal)}</td></tr>
                      <tr className="border-b border-border"><td colSpan="5" className="p-2.5 text-right text-muted-foreground">GST ({(res.boq.gst_rate * 100).toFixed(1)}%)</td><td className="p-2.5 text-right">{inr(res.boq.gst)}</td></tr>
                      <tr className="font-bold"><td colSpan="5" className="p-2.5 text-right">Total project cost</td><td className="p-2.5 text-right">{inr(res.boq.total)}</td></tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* pricing + financing */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-border p-4 space-y-2 text-sm">
                  <div className="font-display font-bold text-sm mb-1">Pricing</div>
                  <Row label="Total project cost" value={inr(res.boq.total)} />
                  {res.pricing.subsidy > 0 && <Row label={`PM Surya Ghar subsidy`} value={`− ${inr(res.pricing.subsidy)}`} accent />}
                  <Row label="Net cost to you" value={inr(res.pricing.net_cost)} bold />
                  <Row label="Cost per watt" value={`₹${res.pricing.per_watt}/Wp`} muted />
                  {res.commercial?.applicable && <>
                    <div className="pt-2 mt-2 border-t border-border font-display font-bold text-xs">C&I Tax Benefits</div>
                    <Row label="40% Accelerated Depreciation" value={`− ${inr(res.commercial.accelerated_depreciation_benefit)}`} accent />
                    <Row label="GST Input Tax Credit" value={`− ${inr(res.commercial.gst_itc)}`} accent />
                    <Row label="Net effective cost" value={inr(res.commercial.net_effective_cost)} bold />
                  </>}
                </div>
                <div className="border border-border p-4 space-y-2 text-sm">
                  <div className="font-display font-bold text-sm mb-1">Financing</div>
                  {res.financing?.emi ? <>
                    <Row label="Scheme" value={res.financing.scheme} small />
                    <Row label="Down payment" value={inr(res.financing.down_payment)} />
                    <Row label="Loan amount" value={inr(res.financing.principal)} />
                    <Row label={`Interest · tenure`} value={`${res.financing.interest_rate}% · ${res.financing.tenure_years} yr`} />
                    <Row label="Monthly EMI" value={inr(res.financing.emi)} bold />
                    <Row label="Total interest" value={inr(res.financing.total_interest)} muted />
                  </> : <p className="text-xs text-muted-foreground">Financing disabled.</p>}
                  <Row label="Lifetime savings (25 yr)" value={inr(res.lifetime_savings)} accent />
                </div>
              </div>

              {/* actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                {!proposal ? (
                  <Button data-testid="epc-save" onClick={save} disabled={saving} className="rounded-none">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1.5" />{user ? "Save proposal" : "Log in to save"}</>}
                  </Button>
                ) : (
                  <>
                    <span className="text-xs font-mono px-2 py-1 bg-solar/10 text-solar flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />{proposal.proposal_no}</span>
                    <Button data-testid="epc-pdf" onClick={() => openDoc("pdf")} variant="outline" className="rounded-none"><FileText className="h-4 w-4 mr-1.5" />Proposal PDF</Button>
                    <Button data-testid="epc-dpr" onClick={() => openDoc("dpr")} variant="outline" className="rounded-none"><FileCheck2 className="h-4 w-4 mr-1.5" />Bank DPR</Button>
                  </>
                )}
              </div>

              {proposal && <KycPanel proposalId={proposal.id} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const Row = ({ label, value, bold, muted, accent, small }) => (
  <div className="flex justify-between gap-3">
    <span className={`${muted ? "text-muted-foreground/70" : "text-muted-foreground"} ${small ? "text-xs" : ""}`}>{label}</span>
    <span className={`font-mono text-right ${bold ? "font-bold" : ""} ${accent ? "text-solar" : ""} ${small ? "text-xs" : ""}`}>{value}</span>
  </div>
);

function KycPanel({ proposalId }) {
  const [data, setData] = useState(null);
  const [uploading, setUploading] = useState("");

  const load = useCallback(() => {
    api.get(`/solar/epc/proposals/${proposalId}/kyc`).then(({ data }) => setData(data));
  }, [proposalId]);
  useState(() => { load(); });

  const upload = async (key, file) => {
    if (!file) return;
    setUploading(key);
    try {
      const fd = new FormData(); fd.append("file", file);
      await api.post(`/solar/epc/proposals/${proposalId}/kyc?doc_type=${encodeURIComponent(key)}`, fd);
      toast.success("Document uploaded");
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Upload failed"); } finally { setUploading(""); }
  };
  const download = async (fileId, name) => {
    try {
      const r = await api.get(`/solar/epc/kyc/${fileId}/download`, { responseType: "blob" });
      const url = URL.createObjectURL(r.data); const a = document.createElement("a");
      a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 8000);
    } catch { toast.error("Could not download"); }
  };
  const remove = async (fileId) => { await api.delete(`/solar/epc/kyc/${fileId}`); load(); };

  if (!data) return null;
  const byType = {};
  (data.uploaded || []).forEach((u) => { (byType[u.doc_type] = byType[u.doc_type] || []).push(u); });

  return (
    <div className="border border-border" data-testid="kyc-panel">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2"><Upload className="h-4 w-4 text-primary" /><span className="font-display font-bold text-sm">KYC & Loan Documents</span></div>
      <div className="divide-y divide-border">
        {data.checklist.map((c) => {
          const ups = byType[c.key] || [];
          return (
            <div key={c.key} className="p-3 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-sm font-medium flex items-center gap-2">{c.label}
                  {c.required && <span className="text-[10px] font-mono bg-destructive/10 text-destructive px-1">required</span>}
                  {ups.length > 0 && <CheckCircle2 className="h-3.5 w-3.5 text-solar" />}
                </div>
                <div className="text-[11px] text-muted-foreground">{c.group}</div>
                {ups.map((u) => (
                  <div key={u.id} className="text-[11px] mt-1 flex items-center gap-2">
                    <button onClick={() => download(u.id, u.original_filename)} className="text-primary hover:underline flex items-center gap-1"><Download className="h-3 w-3" />{u.original_filename}</button>
                    <button onClick={() => remove(u.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
              <label className="cursor-pointer text-xs border border-border px-3 py-1.5 hover:bg-accent transition-colors flex items-center gap-1.5">
                {uploading === c.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}Upload
                <input type="file" data-testid={`kyc-upload-${c.key}`} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp,.csv"
                  onChange={(e) => upload(c.key, e.target.files?.[0])} />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
