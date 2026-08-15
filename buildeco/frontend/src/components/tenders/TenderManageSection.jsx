import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Gavel, Plus, Loader2, Pencil, Eye, EyeOff, ExternalLink } from "lucide-react";
import { EMPTY_TENDER_FORM, TENDER_SUBJECTS, MATERIAL_TYPES, materialLabel } from "@/lib/tenderConstants";

export default function TenderManageSection() {
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_TENDER_FORM);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/tenders", { params: { mine: true, published_only: false } });
      setMine(data.tenders || data);
    } catch {
      toast.error("Could not load your tenders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_TENDER_FORM);
    setOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      title: t.title || "",
      description: t.description || "",
      subject: t.subject || "material_supply",
      material_type: t.material_type || "general",
      category: t.category || materialLabel(t.material_type),
      budget: String(t.budget || ""),
      emd: String(t.emd || ""),
      quantity: t.quantity != null ? String(t.quantity) : "",
      unit: t.unit || "unit",
      location: t.location || "",
      closes_in_minutes: t.closes_in_minutes || 1440,
      auction: t.auction !== false,
      published: t.published !== false,
    });
    setOpen(true);
  };

  const onMaterialChange = (material_type) => {
    setForm({ ...form, material_type, category: materialLabel(material_type) });
  };

  const save = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description required");
      return;
    }
    setBusy(true);
    const payload = {
      ...form,
      budget: Number(form.budget || 0),
      emd: Number(form.emd || 0),
      quantity: form.quantity ? Number(form.quantity) : null,
      closes_in_minutes: Number(form.closes_in_minutes) || 1440,
    };
    try {
      if (editing) {
        await api.patch(`/tenders/${editing.id}`, payload);
        toast.success("Tender updated");
      } else {
        await api.post("/tenders", payload);
        toast.success(form.published ? "Tender published live!" : "Draft saved");
      }
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = async (t) => {
    try {
      await api.patch(`/tenders/${t.id}`, { published: !t.published });
      toast.success(t.published ? "Unpublished" : "Published live");
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-bold text-lg flex items-center gap-2"><Gavel className="h-5 w-5 text-tender" /> My Tenders</h2>
          <p className="text-sm text-muted-foreground">Create, edit aur subject / material type ke hisaab se publish karein</p>
        </div>
        <Button onClick={openCreate} className="rounded-none btn-premium" data-testid="create-tender-btn">
          <Plus className="h-4 w-4 mr-1" /> New Tender
        </Button>
      </div>

      <div className="space-y-2">
        {mine.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border">
            Abhi koi tender nahi — &quot;New Tender&quot; se live publish karein
          </p>
        )}
        {mine.map((t) => (
          <div key={t.id} className="flex flex-wrap items-center gap-3 p-4 border border-border bg-card">
            <div className="flex-1 min-w-[200px]">
              <div className="flex flex-wrap gap-1.5 mb-1">
                <span className="text-[10px] font-mono bg-tender/10 text-tender px-1.5 py-0.5">{t.subject_label || t.subject}</span>
                <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5">{t.material_type_label || t.material_type}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 ${t.published === false ? "bg-muted" : "bg-solar/10 text-solar"}`}>
                  {t.published === false ? "draft" : t.status}
                </span>
              </div>
              <div className="font-medium text-sm">{t.title}</div>
              <div className="text-xs text-muted-foreground">₹{(t.budget/100000).toFixed(1)}L · {t.bid_count || 0} bids</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="rounded-none" onClick={() => openEdit(t)}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
              <Button size="sm" variant="outline" className="rounded-none" onClick={() => togglePublish(t)}>
                {t.published === false ? <><Eye className="h-3.5 w-3.5 mr-1" /> Publish</> : <><EyeOff className="h-3.5 w-3.5 mr-1" /> Unpublish</>}
              </Button>
              <Link to={`/tenders/${t.id}`}>
                <Button size="sm" variant="ghost" className="rounded-none"><ExternalLink className="h-3.5 w-3.5" /></Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-none max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Tender" : "Publish New Tender"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Tender title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-none" />
            <Textarea placeholder="Description / scope of work" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-none" />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Subject (विषय)</label>
                <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full border border-input bg-background px-2 py-2 text-sm rounded-none">
                  {TENDER_SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Material Type</label>
                <select value={form.material_type} onChange={(e) => onMaterialChange(e.target.value)} className="w-full border border-input bg-background px-2 py-2 text-sm rounded-none">
                  {MATERIAL_TYPES.map((m) => <option key={m.id} value={m.id}>{m.icon} {m.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Budget (₹)" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="rounded-none" />
              <Input type="number" placeholder="EMD (₹)" value={form.emd} onChange={(e) => setForm({ ...form, emd: e.target.value })} className="rounded-none" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="rounded-none" />
              <Input placeholder="Unit (MT/sqft)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="rounded-none" />
              <Input type="number" placeholder="Closes (mins)" value={form.closes_in_minutes} onChange={(e) => setForm({ ...form, closes_in_minutes: e.target.value })} className="rounded-none" />
            </div>
            <Input placeholder="Location (city, state)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="rounded-none" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              Publish live on Tender Hub
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.auction} onChange={(e) => setForm({ ...form, auction: e.target.checked })} />
              Reverse auction (lowest bid wins)
            </label>
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={busy} className="rounded-none w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Save Changes" : form.published ? "Publish Tender" : "Save Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
