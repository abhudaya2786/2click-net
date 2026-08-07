import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import DashboardLayout, { StatCard } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { LayoutDashboard, Building2, Calculator, ClipboardList, Plus, Loader2, IndianRupee, HardHat } from "lucide-react";
import { toast } from "sonner";

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "projects", label: "Projects", icon: Building2 },
  { id: "boq", label: "BOQ", icon: Calculator },
  { id: "dpr", label: "Daily Report", icon: ClipboardList },
];

export default function ContractorDashboard() {
  const [active, setActive] = useState("overview");
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [boq, setBoq] = useState({ items: [], total: 0 });
  const [dpr, setDpr] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pForm, setPForm] = useState({ name: "", client: "", budget: "", location: "" });
  const [bForm, setBForm] = useState({ item: "", unit: "cum", quantity: "", rate: "" });
  const [dForm, setDForm] = useState({ date: new Date().toISOString().slice(0,10), work_done: "", labour_count: "", weather: "Clear" });
  const [pOpen, setPOpen] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    const { data } = await api.get("/erp/projects");
    setProjects(data);
    if (data.length && !selected) setSelected(data[0].id);
    setLoading(false);
  };
  const loadDetail = async (pid) => {
    if (!pid) return;
    const [b, d] = await Promise.all([api.get(`/erp/boq/${pid}`), api.get(`/erp/dpr/${pid}`)]);
    setBoq(b.data); setDpr(d.data);
  };
  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { loadDetail(selected); /* eslint-disable-next-line */ }, [selected]);

  const addProject = async () => {
    if (!pForm.name) { toast.error("Project name required"); return; }
    const { data } = await api.post("/erp/projects", { ...pForm, budget: Number(pForm.budget || 0) });
    toast.success("Project created"); setPOpen(false); setPForm({ name: "", client: "", budget: "", location: "" });
    setSelected(data.id); loadProjects();
  };
  const addBoq = async () => {
    if (!selected) { toast.error("Create/select a project first"); return; }
    await api.post("/erp/boq", { project_id: selected, item: bForm.item, unit: bForm.unit, quantity: Number(bForm.quantity), rate: Number(bForm.rate) });
    setBForm({ item: "", unit: "cum", quantity: "", rate: "" }); loadDetail(selected); toast.success("BOQ item added");
  };
  const addDpr = async () => {
    if (!selected) { toast.error("Select a project first"); return; }
    await api.post("/erp/dpr", { project_id: selected, date: dForm.date, work_done: dForm.work_done, labour_count: Number(dForm.labour_count || 0), weather: dForm.weather });
    setDForm({ ...dForm, work_done: "", labour_count: "" }); loadDetail(selected); toast.success("DPR logged");
  };

  return (
    <DashboardLayout nav={NAV} active={active} setActive={setActive} title="Contractor Workspace">
      {loading ? <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <>
          {active === "overview" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Building2} label="Active Projects" value={projects.length} />
              <StatCard icon={IndianRupee} label="Total Budget" value={`₹${(projects.reduce((s,p)=>s+p.budget,0)/10000000).toFixed(2)}Cr`} color="text-solar" />
              <StatCard icon={Calculator} label="BOQ Value" value={`₹${(boq.total/100000).toFixed(1)}L`} color="text-tender" />
              <StatCard icon={ClipboardList} label="DPR Entries" value={dpr.length} />
            </div>
          )}

          {(active === "boq" || active === "dpr") && projects.length > 0 && (
            <div className="mb-5 flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Project:</span>
              <select data-testid="project-select" value={selected || ""} onChange={(e) => setSelected(e.target.value)} className="bg-background border border-input px-3 py-2 text-sm">
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          {active === "projects" && (
            <div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-display font-bold text-lg tracking-tight">Projects</h2>
                <Dialog open={pOpen} onOpenChange={setPOpen}>
                  <DialogTrigger asChild><Button data-testid="add-project-btn" className="rounded-none"><Plus className="h-4 w-4 mr-1.5" />New Project</Button></DialogTrigger>
                  <DialogContent className="rounded-none">
                    <DialogHeader><DialogTitle className="font-display">Create project</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <Input data-testid="proj-name" placeholder="Project name" value={pForm.name} onChange={(e) => setPForm({ ...pForm, name: e.target.value })} className="rounded-none" />
                      <Input placeholder="Client" value={pForm.client} onChange={(e) => setPForm({ ...pForm, client: e.target.value })} className="rounded-none" />
                      <Input type="number" placeholder="Budget (₹)" value={pForm.budget} onChange={(e) => setPForm({ ...pForm, budget: e.target.value })} className="rounded-none" />
                      <Input placeholder="Location" value={pForm.location} onChange={(e) => setPForm({ ...pForm, location: e.target.value })} className="rounded-none" />
                    </div>
                    <DialogFooter><Button data-testid="save-project" onClick={addProject} className="rounded-none">Create</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((p) => (
                  <div key={p.id} className="bg-card p-5">
                    <HardHat className="h-6 w-6 text-primary mb-3" strokeWidth={1.5} />
                    <div className="font-display font-bold">{p.name}</div>
                    <div className="text-sm text-muted-foreground">{p.client} · {p.location}</div>
                    <div className="font-mono font-bold mt-2">₹{(p.budget/10000000).toFixed(2)} Cr</div>
                  </div>
                ))}
                {projects.length === 0 && <div className="bg-card p-8 col-span-full text-center text-muted-foreground text-sm">No projects yet. Create your first.</div>}
              </div>
            </div>
          )}

          {active === "boq" && (
            <div className="grid lg:grid-cols-[1fr_300px] gap-px bg-border border border-border">
              <div className="bg-card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="p-3">Item</th><th className="p-3">Qty</th><th className="p-3">Rate</th><th className="p-3">Amount</th></tr></thead>
                  <tbody>
                    {boq.items.map((b) => (
                      <tr key={b.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3">{b.item}</td><td className="p-3 font-mono">{b.quantity} {b.unit}</td>
                        <td className="p-3 font-mono">₹{b.rate}</td><td className="p-3 font-mono font-medium">₹{b.amount.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                    {boq.items.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-muted-foreground">No BOQ items. Add on the right.</td></tr>}
                  </tbody>
                  {boq.items.length > 0 && <tfoot><tr className="border-t-2 border-border font-bold"><td className="p-3" colSpan="3">Total BOQ Value</td><td className="p-3 font-mono">₹{boq.total.toLocaleString("en-IN")}</td></tr></tfoot>}
                </table>
              </div>
              <div className="bg-card p-5">
                <h3 className="font-display font-bold text-sm mb-4">Add BOQ Item</h3>
                <div className="space-y-3">
                  <Input data-testid="boq-item" placeholder="Item (e.g. M25 Concrete)" value={bForm.item} onChange={(e) => setBForm({ ...bForm, item: e.target.value })} className="rounded-none" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Unit" value={bForm.unit} onChange={(e) => setBForm({ ...bForm, unit: e.target.value })} className="rounded-none" />
                    <Input type="number" placeholder="Qty" value={bForm.quantity} onChange={(e) => setBForm({ ...bForm, quantity: e.target.value })} className="rounded-none" />
                  </div>
                  <Input type="number" placeholder="Rate (₹)" value={bForm.rate} onChange={(e) => setBForm({ ...bForm, rate: e.target.value })} className="rounded-none" />
                  <Button data-testid="add-boq-btn" onClick={addBoq} className="w-full rounded-none">Add Item</Button>
                </div>
              </div>
            </div>
          )}

          {active === "dpr" && (
            <div className="grid lg:grid-cols-[1fr_300px] gap-px bg-border border border-border">
              <div className="bg-card divide-y divide-border">
                {dpr.map((d) => (
                  <div key={d.id} className="p-4">
                    <div className="flex items-center justify-between"><span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5">{d.date}</span><span className="text-xs text-muted-foreground">{d.labour_count} workers · {d.weather}</span></div>
                    <p className="text-sm mt-2">{d.work_done}</p>
                  </div>
                ))}
                {dpr.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No daily reports logged.</div>}
              </div>
              <div className="bg-card p-5">
                <h3 className="font-display font-bold text-sm mb-4">Log Daily Progress</h3>
                <div className="space-y-3">
                  <Input data-testid="dpr-date" type="date" value={dForm.date} onChange={(e) => setDForm({ ...dForm, date: e.target.value })} className="rounded-none" />
                  <Textarea data-testid="dpr-work" placeholder="Work done today" value={dForm.work_done} onChange={(e) => setDForm({ ...dForm, work_done: e.target.value })} className="rounded-none" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" placeholder="Labour count" value={dForm.labour_count} onChange={(e) => setDForm({ ...dForm, labour_count: e.target.value })} className="rounded-none" />
                    <Input placeholder="Weather" value={dForm.weather} onChange={(e) => setDForm({ ...dForm, weather: e.target.value })} className="rounded-none" />
                  </div>
                  <Button data-testid="add-dpr-btn" onClick={addDpr} className="w-full rounded-none">Log Report</Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
