import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Home, Loader2, ChevronRight, Lock, Unlock, FileText, MapPin,
  Gavel, IndianRupee, CheckCircle2, Plus,
} from "lucide-react";
import LayoutViewer from "@/components/homebuild/LayoutViewer";
import SegmentCatalog from "@/components/homebuild/SegmentCatalog";

const STAGE_LABELS = {
  planning: "Planning",
  naksha: "Naksha",
  sanction: "Sanction",
  boq: "BOQ",
  agreement: "Agreement",
  foundation: "Foundation",
  structure: "Structure",
  mep: "MEP",
  finishing: "Finishing",
  griha_pravesh: "Griha Pravesh",
};

const SEGMENTS = [
  { id: "new_home", label: "Naya Ghar" },
  { id: "villa", label: "Villa" },
  { id: "interior", label: "Interior" },
  { id: "renovation", label: "Renovation" },
  { id: "villa_upgrade", label: "Villa Upgrade" },
];

export default function HomeBuildSection() {
  const { user } = useAuth();
  const canManage = user?.role === "contractor" || user?.role === "super_admin" || ["architect", "engineer"].includes(user?.user_type);
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [tab, setTab] = useState("journey");
  const [form, setForm] = useState({ name: "", location: "", budget: "", segment: "new_home", pincode: "", plot_area_sqft: "", floors: 1 });
  const [rfqForm, setRfqForm] = useState({ trade: "electrical", material_description: "", quantity: 1, unit: "unit", radius_km: 10 });
  const [rfqs, setRfqs] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: projs }, { data: rfqList }] = await Promise.all([
        api.get("/home/projects"),
        api.get("/home/rfq"),
      ]);
      setProjects(projs);
      setRfqs(rfqList);
      if (projs.length && !selected) setSelected(projs[0].id);
    } catch {
      toast.error("Could not load home projects");
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (pid) => {
    if (!pid) return;
    try {
      const { data } = await api.get(`/home/projects/${pid}`);
      setDetail(data);
    } catch {
      setDetail(null);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { loadDetail(selected); }, [selected]);

  const createProject = async () => {
    if (!form.name.trim()) { toast.error("Project name required"); return; }
    setBusy("create");
    try {
      const { data } = await api.post("/home/projects", {
        name: form.name,
        client: form.name,
        location: form.location,
        budget: Number(form.budget || 0),
        segment: form.segment,
        pincode: form.pincode,
        plot_area_sqft: Number(form.plot_area_sqft || 0) || null,
        floors: Number(form.floors) || 1,
      });
      toast.success("आपका घर प्रोजेक्ट बन गया!");
      setForm({ name: "", location: "", budget: "", segment: "new_home", pincode: "", plot_area_sqft: "", floors: 1 });
      setSelected(data.id);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Create failed");
    } finally {
      setBusy("");
    }
  };

  const unlockLayout = async (stepId, price) => {
    setBusy(stepId);
    try {
      await api.post(`/home/projects/${selected}/unlock-layout`, { step_id: stepId, payment_mode: price > 0 ? "wallet" : "demo" });
      toast.success(price > 0 ? `₹${price} से unlock हो गया` : "Unlocked!");
      loadDetail(selected);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Unlock failed");
    } finally {
      setBusy("");
    }
  };

  const createAgreement = async () => {
    setBusy("agr");
    try {
      await api.post(`/home/projects/${selected}/agreement`, {
        boq_total: detail?.boq_total || 0,
        advance_pct: 10,
        delivery_days: 180,
      });
      toast.success("Agreement draft तैयार — review करें");
      loadDetail(selected);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Agreement failed");
    } finally {
      setBusy("");
    }
  };

  const advanceStage = async (stage) => {
    setBusy("stage");
    try {
      await api.patch(`/home/projects/${selected}/stage`, { lifecycle_stage: stage });
      toast.success(`Stage updated: ${STAGE_LABELS[stage]}`);
      loadDetail(selected);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Stage update failed");
    } finally {
      setBusy("");
    }
  };

  const signAgreement = async () => {
    setBusy("sign");
    try {
      await api.post(`/home/projects/${selected}/agreement/sign`, { accepted: true });
      toast.success("Agreement signed! Construction शुरू हो सकता है।");
      loadDetail(selected);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Sign failed");
    } finally {
      setBusy("");
    }
  };

  const submitRfq = async () => {
    if (!rfqForm.material_description.trim()) { toast.error("Material description required"); return; }
    setBusy("rfq");
    try {
      const pos = await new Promise((res) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (p) => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => res({ lat: 26.7606, lng: 83.3732 }),
          );
        } else res({ lat: 26.7606, lng: 83.3732 });
      });
      const { data } = await api.post("/home/rfq", { ...rfqForm, project_id: selected, ...pos });
      toast.success(`${data.matched_vendors} vendors को anonymous request गई`);
      setRfqForm({ ...rfqForm, material_description: "" });
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "RFQ failed");
    } finally {
      setBusy("");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const unlocked = (detail?.layouts || []).filter((l) => l.unlocked).map((l) => l.id);
  const stages = detail?.lifecycle_stages || Object.keys(STAGE_LABELS);
  const currentIdx = detail?.current_stage_index ?? 0;

  return (
    <div className="space-y-6">
      {/* New project */}
      {projects.length === 0 && (
        <div className="card-premium p-6 border border-border">
          <h3 className="font-display font-bold text-lg flex items-center gap-2"><Home className="h-5 w-5 text-primary" /> मेरा घर — शुरू करें</h3>
          <p className="text-sm text-muted-foreground mt-1">Naksha se Griha Pravesh tak — ek jagah poora process</p>
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <Input placeholder="Project name (e.g. Sharma Villa)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-none" />
            <Input placeholder="Location / City" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="rounded-none" />
            <Input placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="rounded-none" />
            <Input type="number" placeholder="Budget (₹)" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="rounded-none" />
            <select value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })} className="border border-input bg-background px-3 py-2 text-sm rounded-none">
              {SEGMENTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <Button onClick={createProject} disabled={busy === "create"} className="rounded-none btn-premium">
              {busy === "create" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" /> प्रोजेक्ट बनाएँ</>}
            </Button>
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 items-center">
            <select value={selected || ""} onChange={(e) => setSelected(e.target.value)} className="border border-input bg-background px-3 py-2 text-sm rounded-none min-w-[200px]">
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name} — {STAGE_LABELS[p.lifecycle_stage] || p.lifecycle_stage}</option>)}
            </select>
            <Button variant="outline" size="sm" className="rounded-none" onClick={() => setTab("journey")}>Journey</Button>
            <Button variant="outline" size="sm" className="rounded-none" onClick={() => setTab("layout")}>Layout</Button>
            <Button variant="outline" size="sm" className="rounded-none" onClick={() => setTab("agreement")}>Agreement</Button>
            <Button variant="outline" size="sm" className="rounded-none" onClick={() => setTab("rfq")}>Material RFQ</Button>
            <Button variant="outline" size="sm" className="rounded-none" onClick={() => setTab("segment")}>Catalog</Button>
          </div>

          {detail && tab === "journey" && (
            <div className="grid lg:grid-cols-[1fr_280px] gap-6">
              <div className="card-premium p-6 border border-border">
                <h3 className="font-display font-bold mb-4">Naksha → Griha Pravesh</h3>
                <div className="flex flex-wrap gap-1">
                  {stages.map((s, i) => (
                    <div key={s} className={`flex items-center gap-1 text-xs px-2 py-1 border ${i <= currentIdx ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
                      {i < currentIdx ? <CheckCircle2 className="h-3 w-3" /> : <span className="font-mono">{i + 1}</span>}
                      {STAGE_LABELS[s] || s}
                      {i < stages.length - 1 && <ChevronRight className="h-3 w-3 opacity-40" />}
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid sm:grid-cols-3 gap-3">
                  <div className="p-3 border border-border"><div className="text-xs text-muted-foreground">Progress</div><div className="font-bold text-lg">{detail.progress || 0}%</div></div>
                  <div className="p-3 border border-border"><div className="text-xs text-muted-foreground">BOQ Total</div><div className="font-mono font-bold">₹{(detail.boq_total || 0).toLocaleString("en-IN")}</div></div>
                  <div className="p-3 border border-border"><div className="text-xs text-muted-foreground">Segment</div><div className="font-medium capitalize">{detail.segment?.replace("_", " ")}</div></div>
                </div>
                {detail.milestones?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Payment Milestones</h4>
                    <div className="space-y-1">
                      {detail.milestones.map((m) => (
                        <div key={m.id} className="flex justify-between text-sm py-1.5 border-b border-border/50">
                          <span>{m.label}</span>
                          <span className="font-mono text-muted-foreground">{m.payment_pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {canManage && currentIdx < stages.length - 1 && (
                  <div className="mt-4">
                    <Button size="sm" variant="outline" className="rounded-none" disabled={busy === "stage"}
                      onClick={() => advanceStage(stages[currentIdx + 1])}>
                      Advance to {STAGE_LABELS[stages[currentIdx + 1]]}
                    </Button>
                  </div>
                )}
              </div>
              <LayoutViewer activeStep="layout_basic" unlocked={unlocked} segment={detail.segment} />
            </div>
          )}

          {detail && tab === "layout" && (
            <div className="grid md:grid-cols-2 gap-4">
              <LayoutViewer activeStep={unlocked[unlocked.length - 1] || "layout_basic"} unlocked={unlocked} segment={detail.segment} />
              <div className="space-y-2">
                <h4 className="font-display font-bold text-sm">Layout Maps — Unlock</h4>
                {(detail.layouts || []).map((l) => (
                  <div key={l.id} className="flex items-center justify-between p-3 border border-border">
                    <div className="flex items-center gap-2">
                      {l.unlocked ? <Unlock className="h-4 w-4 text-solar" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                      <div>
                        <div className="text-sm font-medium">{l.name}</div>
                        <div className="text-xs text-muted-foreground">{l.free ? "मुफ़्त" : `₹${l.price}`}</div>
                      </div>
                    </div>
                    {!l.unlocked && (
                      <Button size="sm" className="rounded-none" disabled={busy === l.id} onClick={() => unlockLayout(l.id, l.price)}>
                        {busy === l.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Unlock"}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {detail && tab === "agreement" && (
            <div className="card-premium p-6 border border-border max-w-2xl">
              <h3 className="font-display font-bold flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Agreement & Payment</h3>
              {detail.agreement ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-muted-foreground">BOQ Total:</span> <span className="font-mono font-bold">₹{detail.agreement.boq_total?.toLocaleString("en-IN")}</span></div>
                    <div><span className="text-muted-foreground">Advance:</span> <span className="font-mono">₹{detail.agreement.advance_amount?.toLocaleString("en-IN")} ({detail.agreement.advance_pct}%)</span></div>
                    <div><span className="text-muted-foreground">Delivery:</span> {detail.agreement.delivery_days} days</div>
                    <div><span className="text-muted-foreground">Status:</span> <span className={detail.agreement.status === "signed" ? "text-solar" : "text-tender"}>{detail.agreement.status}</span></div>
                  </div>
                  {detail.payment_schedules?.length > 0 && (
                    <div className="border border-border mt-4">
                      <div className="px-3 py-2 bg-muted text-xs font-mono uppercase">Payment Breakdown</div>
                      {detail.payment_schedules.map((ps) => (
                        <div key={ps.id} className="flex justify-between px-3 py-2 text-sm border-t border-border">
                          <span>{ps.label}</span>
                          <span className="font-mono">₹{ps.amount?.toLocaleString("en-IN")} ({ps.payment_pct}%)</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {detail.agreement.status !== "signed" && (
                    <Button onClick={signAgreement} disabled={busy === "sign"} className="rounded-none btn-premium mt-4 w-full">
                      {busy === "sign" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Agreement Sign करें"}
                    </Button>
                  )}
                </div>
              ) : canManage ? (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-3">Architect + Engineer BOQ approve hone ke baad agreement generate karein।</p>
                  <Button onClick={createAgreement} disabled={busy === "agr" || !detail.boq_total} className="rounded-none">
                    {busy === "agr" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Agreement from BOQ"}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-4">Agreement abhi prepare ho raha hai — team jald contact karegi।</p>
              )}
            </div>
          )}

          {tab === "rfq" && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card-premium p-5 border border-border">
                <h4 className="font-display font-bold flex items-center gap-2"><Gavel className="h-4 w-4 text-primary" /> Anonymous Material Request</h4>
                <p className="text-xs text-muted-foreground mt-1">2–30 km radius — vendor ka naam aapko nahi dikhega</p>
                <div className="space-y-2 mt-4">
                  <select value={rfqForm.trade} onChange={(e) => setRfqForm({ ...rfqForm, trade: e.target.value })} className="w-full border border-input bg-background px-3 py-2 text-sm rounded-none">
                    {["electrical", "electronic", "plumbing", "paint_putty", "tiles", "aggregate", "logistics"].map((t) => (
                      <option key={t} value={t}>{t.replace("_", " ")}</option>
                    ))}
                  </select>
                  <Input placeholder="Material description" value={rfqForm.material_description} onChange={(e) => setRfqForm({ ...rfqForm, material_description: e.target.value })} className="rounded-none" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" placeholder="Qty" value={rfqForm.quantity} onChange={(e) => setRfqForm({ ...rfqForm, quantity: Number(e.target.value) })} className="rounded-none" />
                    <Input type="number" placeholder="Radius km (2-30)" value={rfqForm.radius_km} onChange={(e) => setRfqForm({ ...rfqForm, radius_km: Number(e.target.value) })} className="rounded-none" />
                  </div>
                  <Button onClick={submitRfq} disabled={busy === "rfq"} className="w-full rounded-none btn-premium">
                    {busy === "rfq" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><MapPin className="h-4 w-4 mr-1" /> Nearby Vendors को Request भेजें</>}
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-display font-bold text-sm">Your RFQs (Anonymous Bids)</h4>
                {rfqs.length === 0 && <p className="text-sm text-muted-foreground">No requests yet.</p>}
                {rfqs.map((r) => (
                  <div key={r.id} className="p-4 border border-border">
                    <div className="text-sm font-medium capitalize">{r.trade?.replace("_", " ")} — {r.material_description}</div>
                    <div className="text-xs text-muted-foreground mt-1">{r.matched_vendors} vendors matched · {r.status}</div>
                    {(r.anonymous_bids || []).map((b) => (
                      <div key={b.ref} className="flex justify-between text-sm mt-2 py-1 border-t border-border/50">
                        <span>{b.ref} · {b.delivery_days}d</span>
                        <span className="font-mono font-bold text-primary">₹{b.amount?.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {detail && tab === "segment" && <SegmentCatalog segment={detail.segment} />}
        </>
      )}
    </div>
  );
}
