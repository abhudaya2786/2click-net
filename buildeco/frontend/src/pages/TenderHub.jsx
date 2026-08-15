import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Search, LayoutGrid, Layers } from "lucide-react";
import PageSEO from "@/components/marketing/PageSEO";
import TenderCard from "@/components/tenders/TenderCard";
import { TENDER_SUBJECTS, MATERIAL_TYPES, materialLabel } from "@/lib/tenderConstants";
import { normalizeTendersResponse, groupTendersByMaterial, pickDisplayTenders } from "@/lib/tenderNormalize";
import { DEMO_TENDERS } from "@/lib/demoData";

export default function TenderHub() {
  const { user } = useAuth();
  const [tenders, setTenders] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [q, setQ] = useState("");
  const [view, setView] = useState("material"); // material | subject | all

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { published_only: true };
      if (subject) params.subject = subject;
      if (materialType) params.material_type = materialType;
      if (q.trim()) params.q = q.trim();
      const { data } = await api.get("/tenders", { params });
      const { list, grouped } = normalizeTendersResponse(data);
      const display = pickDisplayTenders(list);
      if (display.length) {
        setTenders(display);
        setGrouped(grouped && Object.keys(grouped).length ? grouped : groupTendersByMaterial(display));
      } else {
        setTenders(DEMO_TENDERS);
        setGrouped(groupTendersByMaterial(DEMO_TENDERS));
      }
    } catch {
      setTenders(DEMO_TENDERS);
      setGrouped(groupTendersByMaterial(DEMO_TENDERS));
    } finally {
      setLoading(false);
    }
  }, [subject, materialType, q]);

  useEffect(() => { load(); }, [load]);

  const groupBySubject = () => {
    const g = {};
    tenders.forEach((t) => {
      const key = t.subject || "general";
      g[key] = g[key] || [];
      g[key].push(t);
    });
    return g;
  };

  const renderGroup = (label, items, startIdx = 0) => (
    <section key={label} className="mb-10">
      <h2 className="font-display font-bold text-lg tracking-tight mb-4 flex items-center gap-2 border-b border-border pb-2">
        <span className="h-2 w-2 rounded-full bg-primary" />
        {label}
        <span className="text-xs font-mono text-muted-foreground font-normal">({items.length})</span>
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t, i) => <TenderCard key={t.id} tender={t} index={startIdx + i} />)}
      </div>
    </section>
  );

  let idx = 0;
  const subjectGroups = groupBySubject();

  return (
    <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-10">
      <PageSEO
        title="Tender Hub — Subject & Material-wise Live Auctions"
        description="Browse construction tenders by subject and material type — steel, cement, solar, electrical, plumbing. Live reverse auction on buildecogroup.com"
        path="/tenders"
      />

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-tender">Tender Hub</span>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">Live tenders — subject & material wise</h1>
          <p className="text-sm text-muted-foreground mt-2">Steel, cement, solar, electrical, tiles — alag alag sections mein browse karein</p>
        </div>
        <Link to={user ? "/dashboard" : "/login"} className="text-sm text-primary font-medium flex items-center gap-1">
          {user ? "Manage my tenders" : "Login to post"} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Filters */}
      <div className="card-premium p-4 mb-8 border border-border space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input placeholder="Search tenders..." value={q} onChange={(e) => setQ(e.target.value)} className="rounded-none max-w-xs flex-1" />
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="border border-input bg-background px-3 py-2 text-sm rounded-none">
            <option value="">All Subjects</option>
            {TENDER_SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <select value={materialType} onChange={(e) => setMaterialType(e.target.value)} className="border border-input bg-background px-3 py-2 text-sm rounded-none">
            <option value="">All Materials</option>
            {MATERIAL_TYPES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <div className="flex gap-1 ml-auto">
            <Button size="sm" variant={view === "material" ? "default" : "outline"} className="rounded-none" onClick={() => setView("material")}>
              <Layers className="h-3.5 w-3.5 mr-1" /> Material
            </Button>
            <Button size="sm" variant={view === "subject" ? "default" : "outline"} className="rounded-none" onClick={() => setView("subject")}>
              <LayoutGrid className="h-3.5 w-3.5 mr-1" /> Subject
            </Button>
            <Button size="sm" variant={view === "all" ? "default" : "outline"} className="rounded-none" onClick={() => setView("all")}>All</Button>
          </div>
        </div>
        {/* Material type quick chips */}
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setMaterialType("")}
            className={`text-xs px-2.5 py-1 border rounded-full transition-colors ${!materialType ? "bg-primary text-white border-primary" : "border-border hover:bg-accent"}`}>
            All
          </button>
          {MATERIAL_TYPES.map((m) => (
            <button key={m.id} type="button" onClick={() => setMaterialType(materialType === m.id ? "" : m.id)}
              className={`text-xs px-2.5 py-1 border rounded-full transition-colors ${materialType === m.id ? "bg-primary text-white border-primary" : "border-border hover:bg-accent"}`}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : tenders.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No tenders match your filters.</p>
      ) : view === "all" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tenders.map((t, i) => <TenderCard key={t.id} tender={t} index={i} />)}
        </div>
      ) : view === "subject" ? (
        <>
          {Object.entries(subjectGroups).map(([key, items]) => {
            const label = TENDER_SUBJECTS.find((s) => s.id === key)?.label || key;
            const start = idx;
            idx += items.length;
            return renderGroup(label, items, start);
          })}
        </>
      ) : (
        <>
          {Object.entries(grouped).sort(([a], [b]) => materialLabel(a).localeCompare(materialLabel(b))).map(([key, items]) => {
            const start = idx;
            idx += items.length;
            return renderGroup(materialLabel(key), items, start);
          })}
        </>
      )}
    </div>
  );
}
