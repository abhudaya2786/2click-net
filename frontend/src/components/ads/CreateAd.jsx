import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Check, Upload, Wallet, CreditCard, ImageIcon } from "lucide-react";
import { inr } from "./adsShared";

const TAX_RATE = 0.18;
const todayStr = new Date().toISOString().slice(0, 10);

const STEPS = ["Ad Details", "Placement", "Duration", "Fee & Payment"];

export default function CreateAd({ onDone }) {
  const [step, setStep] = useState(1);
  const [placements, setPlacements] = useState([]);
  const [form, setForm] = useState({ name: "", destination_url: "", placement_code: "", start_date: todayStr, duration_weeks: 1, banner_url: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [createdId, setCreatedId] = useState(null);

  useEffect(() => {
    api.get("/ads/placements").then(({ data }) => setPlacements(data)).catch(() => {});
  }, []);

  const selected = placements.find((p) => p.code === form.placement_code);
  const weeks = Math.max(1, Number(form.duration_weeks) || 1);
  const base = selected ? selected.price_per_week * weeks : 0;
  const tax = base * TAX_RATE;
  const total = base + tax;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    set("media_type", f.type.startsWith("video") ? "video" : "image");
  };

  const canNext = () => {
    if (step === 1) return form.name.trim().length >= 2 && form.destination_url.trim().length >= 3;
    if (step === 2) return !!form.placement_code;
    if (step === 3) return !!form.start_date && weeks >= 1;
    return true;
  };

  const ensureCampaign = async () => {
    if (createdId) return createdId;
    const { data } = await api.post("/ads/campaigns", {
      name: form.name, destination_url: form.destination_url, placement_code: form.placement_code,
      start_date: form.start_date, duration_weeks: weeks, banner_url: form.banner_url || "",
      media_type: form.media_type || "image",
    });
    setCreatedId(data.id);
    if (file) {
      const fd = new FormData();
      fd.append("file", file);
      try { await api.post(`/ads/campaigns/${data.id}/banner`, fd); } catch { /* banner optional */ }
    }
    return data.id;
  };

  const pay = async (mode) => {
    setBusy(true);
    try {
      const id = await ensureCampaign();
      if (mode === "wallet") {
        await api.post(`/ads/campaigns/${id}/pay-wallet`);
        toast.success("Paid via wallet — campaign submitted for approval");
        onDone();
      } else {
        const { data } = await api.post(`/ads/campaigns/${id}/checkout`, { origin_url: window.location.origin });
        window.location.href = data.checkout_url;
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Payment failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-3xl" data-testid="create-ad">
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = step > n;
          return (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`h-8 w-8 flex items-center justify-center text-sm font-bold shrink-0 ${step === n ? "bg-primary text-white" : done ? "bg-solar/20 text-solar" : "bg-muted text-muted-foreground"}`}>
                {done ? <Check className="h-4 w-4" /> : n}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step === n ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
              {n < STEPS.length && <div className="h-px flex-1 bg-border" />}
            </div>
          );
        })}
      </div>

      <div className="bg-card border border-border p-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Campaign name *</label>
              <Input data-testid="ad-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Monsoon Cement Sale" className="rounded-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Destination URL *</label>
              <Input data-testid="ad-url" value={form.destination_url} onChange={(e) => set("destination_url", e.target.value)} placeholder="https://your-landing-page.com" className="rounded-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Banner (image or video)</label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 border border-input px-3 h-10 text-sm cursor-pointer hover:bg-accent">
                  <Upload className="h-4 w-4" /> Upload file
                  <input data-testid="ad-banner-file" type="file" accept="image/*,video/*" className="hidden" onChange={pickFile} />
                </label>
                <span className="text-xs text-muted-foreground">or</span>
                <Input data-testid="ad-banner-url" value={form.banner_url} onChange={(e) => { set("banner_url", e.target.value); setPreview(e.target.value); }} placeholder="Paste image URL" className="rounded-none flex-1 min-w-[180px]" />
              </div>
              <div className="mt-3 h-32 border border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden">
                {preview ? <img src={preview} alt="preview" className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-muted-foreground flex items-center gap-2"><ImageIcon className="h-4 w-4" />Banner preview</span>}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid sm:grid-cols-3 gap-4" data-testid="ad-placements">
            {placements.map((p) => (
              <button key={p.code} data-testid={`placement-${p.code}`} onClick={() => set("placement_code", p.code)}
                className={`text-left border p-4 transition-colors ${form.placement_code === p.code ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50"}`}>
                <div className="font-display font-bold text-sm">{p.name}</div>
                <div className="font-mono font-extrabold text-lg mt-2">{inr(p.price_per_week)}<span className="text-xs text-muted-foreground font-normal">/week</span></div>
                <div className="text-xs text-muted-foreground mt-2">{p.description}</div>
              </button>
            ))}
            {placements.length === 0 && <div className="text-sm text-muted-foreground">No ad slots are currently available.</div>}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 max-w-sm">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Start date *</label>
              <Input data-testid="ad-start-date" type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} className="rounded-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Duration (weeks) *</label>
              <Input data-testid="ad-duration" type="number" min={1} max={52} value={form.duration_weeks} onChange={(e) => set("duration_weeks", e.target.value)} className="rounded-none" />
              <p className="text-xs text-muted-foreground mt-1">{selected ? `${inr(selected.price_per_week)}/week × ${weeks} week(s)` : "Select a placement first"}</p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1.5">
                <div className="flex justify-between"><span className="text-muted-foreground">Campaign</span><span className="font-medium">{form.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Placement</span><span className="font-medium">{selected?.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Schedule</span><span className="font-medium">{form.start_date} · {weeks} wk</span></div>
              </div>
              <div className="bg-muted/40 p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Base fee</span><span className="font-mono" data-testid="fee-base">{inr(base)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST (18%)</span><span className="font-mono" data-testid="fee-tax">{inr(tax)}</span></div>
                <div className="flex justify-between border-t border-border pt-2 font-bold"><span>Total</span><span className="font-mono" data-testid="fee-total">{inr(total)}</span></div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button data-testid="pay-wallet-btn" onClick={() => pay("wallet")} disabled={busy} className="rounded-none">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Wallet className="h-4 w-4 mr-1.5" />Pay with Wallet</>}
              </Button>
              <Button data-testid="pay-card-btn" onClick={() => pay("card")} disabled={busy} variant="outline" className="rounded-none">
                <CreditCard className="h-4 w-4 mr-1.5" />Pay with Card
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">After payment your ad enters the <b>Approval Queue</b>. It goes live once a Super Admin approves it.</p>
          </div>
        )}

        {/* Nav */}
        <div className="flex justify-between mt-8 pt-5 border-t border-border">
          <Button data-testid="ad-back" variant="ghost" className="rounded-none" disabled={step === 1 || busy} onClick={() => setStep((s) => s - 1)}>Back</Button>
          {step < 4 && <Button data-testid="ad-next" className="rounded-none" disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>Continue</Button>}
        </div>
      </div>
    </div>
  );
}
