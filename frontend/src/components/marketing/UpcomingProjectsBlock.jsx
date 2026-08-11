import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { useDemoMode } from "@/context/DemoModeContext";
import { DEMO_UPCOMING_PROJECTS, DEMO_UPCOMING_META } from "@/lib/demoData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  MapPin, Search, Loader2, Building2, Filter, ArrowRight, Calendar,
  Home, Layers, IndianRupee,
} from "lucide-react";
import { motion } from "framer-motion";

const LS_KEY = "bs_user_location";

function readSavedLocation() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}

function filterProjects(list, filters) {
  const { state, city, projectType, bhk, status, requirement, budgetMin, budgetMax, q } = filters;
  return list.filter((p) => {
    if (state && p.state !== state) return false;
    if (city && p.city !== city) return false;
    if (projectType && projectType !== "all" && p.project_type !== projectType) return false;
    if (bhk && bhk !== "all" && p.bhk !== bhk) return false;
    if (status && status !== "all" && p.status !== status) return false;
    if (requirement && requirement !== "all" && !p.requirement_tags?.includes(requirement)) return false;
    if (budgetMin && (p.budget_max || 0) < Number(budgetMin)) return false;
    if (budgetMax && (p.budget_min || 0) > Number(budgetMax)) return false;
    if (q) {
      const blob = `${p.title} ${p.title_hi || ""} ${p.developer || ""} ${p.area || ""} ${p.city || ""}`.toLowerCase();
      if (!blob.includes(q.toLowerCase())) return false;
    }
    return true;
  });
}

function ProjectCard({ project: p, hi, compact }) {
  return (
    <motion.article
      data-testid={`upcoming-project-${p.id}`}
      className={`group border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors ${compact ? "rounded-xl" : "rounded-xl"}`}
    >
      <div className={`relative ${compact ? "h-36" : "h-44"} bg-secondary/30 overflow-hidden`}>
        {p.image ? (
          <img src={p.image} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="h-full flex items-center justify-center">
            <Building2 className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        {p.status_name && (
          <span className="absolute top-2 left-2 text-[10px] font-medium uppercase tracking-wide bg-background/90 px-2 py-0.5 border border-border">
            {hi ? p.status_name_hi : p.status_name}
          </span>
        )}
      </div>
      <div className={`p-4 ${compact ? "space-y-2" : "space-y-3"}`}>
        <div>
          <h3 className="font-display font-bold text-sm md:text-base leading-snug line-clamp-2">
            {hi ? p.title_hi || p.title : p.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {p.location_label || [p.area, p.city, p.state].filter(Boolean).join(", ")}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 text-[10px]">
          {p.bhk_label && (
            <span className="px-2 py-0.5 border border-border bg-secondary/40">{hi ? p.bhk_label_hi : p.bhk_label}</span>
          )}
          {p.project_type_name && (
            <span className="px-2 py-0.5 border border-border bg-secondary/40">
              {hi ? p.project_type_name_hi : p.project_type_name}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="font-display font-bold text-primary text-sm flex items-center gap-0.5">
            <IndianRupee className="h-3.5 w-3.5" />
            {p.price_label?.replace("₹", "") || "—"}
          </span>
          {p.launch_date && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {p.launch_date}
            </span>
          )}
        </div>
        {!compact && p.highlights_en?.length > 0 && (
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {(hi ? p.highlights_hi : p.highlights_en).slice(0, 2).map((h) => (
              <li key={h}>· {h}</li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <Link to="/register" className="text-xs text-primary hover:underline">
            {hi ? "जानकारी के लिए पंजीकरण →" : "Register for details →"}
          </Link>
          <Link to="/consultants" className="text-xs text-muted-foreground hover:text-foreground">
            {hi ? "कंसल्टेंट" : "Consultant"}
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function UpcomingProjectsBlock({ compact = false, limit = 6, showFilters = true, className = "" }) {
  const { lang } = useLang();
  const hi = lang === "hi";
  const { demoActive } = useDemoMode();

  const [meta, setMeta] = useState({ project_types: [], bhk_options: [], requirement_tags: [], statuses: [], states: [] });
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loc, setLoc] = useState(readSavedLocation);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [state, setState] = useState(loc.state || "");
  const [city, setCity] = useState(loc.city || "");
  const [projectType, setProjectType] = useState("all");
  const [bhk, setBhk] = useState("all");
  const [status, setStatus] = useState("all");
  const [requirement, setRequirement] = useState("all");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/geo/states").then(({ data }) => setStates(data.states || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (state) {
      api.get("/geo/cities", { params: { state } }).then(({ data }) => setCities(data.cities || [])).catch(() => setCities([]));
    } else setCities([]);
  }, [state]);

  useEffect(() => {
    if (!state && loc.state) {
      setState(loc.state);
      if (loc.city) setCity(loc.city);
    }
  }, [loc.state, loc.city, state]);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (state) params.state = state;
    if (city) params.city = city;
    if (projectType !== "all") params.project_type = projectType;
    if (bhk !== "all") params.bhk = bhk;
    if (status !== "all") params.status = status;
    if (requirement !== "all") params.requirement = requirement;
    if (budgetMin) params.budget_min = Number(budgetMin);
    if (budgetMax) params.budget_max = Number(budgetMax);
    if (q) params.q = q;
    if (compact) params.limit = limit;

    api.get("/upcoming-projects/meta")
      .then(({ data }) => setMeta(data))
      .catch(() => setMeta(DEMO_UPCOMING_META));

    api.get("/upcoming-projects", { params })
      .then(({ data }) => setList(data))
      .catch(() => {
        const filtered = filterProjects(DEMO_UPCOMING_PROJECTS, {
          state, city, projectType, bhk, status, requirement, budgetMin, budgetMax, q,
        });
        setList(compact ? filtered.slice(0, limit) : filtered);
        if (!meta.project_types?.length) setMeta(DEMO_UPCOMING_META);
      })
      .finally(() => setLoading(false));
  }, [state, city, projectType, bhk, status, requirement, budgetMin, budgetMax, q, compact, limit]);

  useEffect(() => { load(); }, [load]);

  const displayList = useMemo(() => {
    if (demoActive && list.length === 0) {
      return filterProjects(DEMO_UPCOMING_PROJECTS, {
        state, city, projectType, bhk, status, requirement, budgetMin, budgetMax, q,
      }).slice(0, compact ? limit : 100);
    }
    return list;
  }, [list, demoActive, state, city, projectType, bhk, status, requirement, budgetMin, budgetMax, q, compact, limit]);

  const regionSummary = useMemo(() => {
    const map = {};
    displayList.forEach((p) => {
      const st = p.state || "Other";
      const ct = p.city || "Other";
      map[st] = map[st] || {};
      map[st][ct] = (map[st][ct] || 0) + 1;
    });
    return map;
  }, [displayList]);

  return (
    <div className={className} data-testid="upcoming-projects-block">
      {!compact && (
        <div className="mb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-primary">
            {hi ? "आगामी प्रोजेक्ट" : "Upcoming projects"}
          </span>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">
            {hi ? "लैंड लोकेशन और ज़रूरत के हिसाब से" : "By land location & your requirements"}
          </h2>
          <p className="mt-2 text-muted-foreground text-sm max-w-2xl">
            {hi
              ? "राज्य, शहर, BHK, बजट और सुविधाओं के अनुसार आगामी प्लॉट, अपार्टमेंट और टाउनशिप खोजें।"
              : "Browse upcoming plots, apartments and townships filtered by state, city, BHK, budget and amenities."}
          </p>
        </div>
      )}

      {compact && (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-primary">
              {hi ? "आगामी प्रोजेक्ट" : "Upcoming projects"}
            </span>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight mt-1">
              {hi ? "लोकेशन वाइज प्रोजेक्ट" : "Projects by location"}
            </h2>
          </div>
          <Link to="/upcoming-projects" className="text-sm text-primary hover:underline flex items-center gap-1 shrink-0">
            {hi ? "सभी देखें" : "View all"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {showFilters && (
        <div className="card-premium border border-border p-4 mb-6 space-y-3" data-testid="upcoming-filters">
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              data-testid="upcoming-filter-state"
              value={state}
              onChange={(e) => { setState(e.target.value); setCity(""); }}
              className="h-9 border border-input bg-background px-2 text-sm rounded-md min-w-[140px]"
            >
              <option value="">{hi ? "सभी राज्य" : "All states"}</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              data-testid="upcoming-filter-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!state}
              className="h-9 border border-input bg-background px-2 text-sm rounded-md min-w-[130px] disabled:opacity-50"
            >
              <option value="">{hi ? "सभी शहर" : "All cities"}</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="h-9 border border-input bg-background px-2 text-sm rounded-md"
            >
              <option value="all">{hi ? "सभी प्रकार" : "All types"}</option>
              {(meta.project_types || []).map((t) => (
                <option key={t.id} value={t.id}>{hi ? t.name_hi : t.name}</option>
              ))}
            </select>
            <select
              value={bhk}
              onChange={(e) => setBhk(e.target.value)}
              className="h-9 border border-input bg-background px-2 text-sm rounded-md"
            >
              <option value="all">{hi ? "सभी BHK" : "All BHK"}</option>
              {(meta.bhk_options || []).map((b) => (
                <option key={b.id} value={b.id}>{hi ? b.label_hi : b.label}</option>
              ))}
            </select>
            {!compact && (
              <div className="relative flex-1 min-w-[160px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={hi ? "खोजें…" : "Search…"}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="h-9 pl-9 rounded-md"
                />
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-md"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              {hi ? "और फ़िल्टर" : "More filters"}
            </Button>
          </div>

          {(showAdvanced || !compact) && (
            <div className="flex flex-wrap gap-2 pt-1">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-9 border border-input bg-background px-2 text-sm rounded-md"
              >
                <option value="all">{hi ? "सभी स्थिति" : "All status"}</option>
                {(meta.statuses || []).map((s) => (
                  <option key={s.id} value={s.id}>{hi ? s.name_hi : s.name}</option>
                ))}
              </select>
              <select
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                className="h-9 border border-input bg-background px-2 text-sm rounded-md"
              >
                <option value="all">{hi ? "सभी ज़रूरत" : "All requirements"}</option>
                {(meta.requirement_tags || []).map((t) => (
                  <option key={t.id} value={t.id}>{hi ? t.name_hi : t.name}</option>
                ))}
              </select>
              <Input
                placeholder={hi ? "बजट मिन (₹)" : "Budget min (₹)"}
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value.replace(/\D/g, ""))}
                className="h-9 w-32 rounded-md"
              />
              <Input
                placeholder={hi ? "बजट मैक्स (₹)" : "Budget max (₹)"}
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value.replace(/\D/g, ""))}
                className="h-9 w-32 rounded-md"
              />
            </div>
          )}

          {Object.keys(regionSummary).length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground pt-1">
              <Layers className="h-3.5 w-3.5" />
              {Object.entries(regionSummary).map(([st, citiesMap]) => (
                <span key={st} className="px-2 py-0.5 border border-border rounded-full">
                  {st}: {Object.values(citiesMap).reduce((a, b) => a + b, 0)} {hi ? "प्रोजेक्ट" : "projects"}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : displayList.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <Home className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {hi ? "इस लोकेशन/फ़िल्टर में कोई प्रोजेक्ट नहीं। फ़िल्टर बदलें।" : "No projects match this location or filters. Try adjusting filters."}
          </p>
          <Button type="button" variant="outline" className="mt-4 rounded-md" onClick={() => {
            setState(""); setCity(""); setProjectType("all"); setBhk("all"); setStatus("all"); setRequirement("all");
            setBudgetMin(""); setBudgetMax(""); setQ("");
          }}>
            {hi ? "फ़िल्टर साफ़ करें" : "Clear filters"}
          </Button>
        </div>
      ) : (
        <div className={`grid gap-4 ${compact ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
          {displayList.map((p) => (
            <ProjectCard key={p.id} project={p} hi={hi} compact={compact} />
          ))}
        </div>
      )}

      {compact && displayList.length > 0 && (
        <div className="mt-6 text-center">
          <Link to="/upcoming-projects">
            <Button variant="outline" className="rounded-md">
              {hi ? "सभी आगामी प्रोजेक्ट" : "All upcoming projects"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
