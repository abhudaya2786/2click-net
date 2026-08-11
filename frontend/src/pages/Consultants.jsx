import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Search, MapPin, Star, Loader2, Briefcase, Send, BadgeCheck,
  Building2, Sofa, Compass, Ruler, Leaf, Filter,
} from "lucide-react";
import { toast } from "sonner";
import PageSEO from "@/components/marketing/PageSEO";
import { motion } from "framer-motion";

const ROLE_ICONS = {
  exterior: Building2, interior: Sofa, architect: Compass, vastu: Compass,
  structural: Ruler, landscape: Leaf, real_estate: Building2,
};

export default function Consultants() {
  const { user } = useAuth();
  const { lang } = useLang();
  const hi = lang === "hi";
  const nav = useNavigate();

  const [meta, setMeta] = useState({ roles: [], experience_levels: [] });
  const [role, setRole] = useState("all");
  const [experience, setExperience] = useState("all");
  const [q, setQ] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get("/consultants/meta").then(({ data }) => setMeta(data));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (role !== "all") params.role = role;
    if (experience !== "all") params.experience = experience;
    if (q) params.q = q;
    api.get("/consultants", { params })
      .then(({ data }) => setList(data))
      .finally(() => setLoading(false));
  }, [role, experience, q]);

  useEffect(() => { load(); }, [load]);

  const contact = (c) => {
    if (!user) { toast.error(hi ? "लॉगिन करें" : "Please log in"); nav("/login"); return; }
    setTarget(c); setMsg("");
  };

  const send = async () => {
    if (!msg.trim()) return;
    setSending(true);
    try {
      await api.post(`/freelancers/${target.id}/enquiry`, {
        message: msg,
        category: target.role_name || target.consultant_role,
      });
      toast.success(hi ? "पूछताछ भेजी गई!" : "Enquiry sent!");
      setTarget(null);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    } finally {
      setSending(false);
    }
  };

  const roleLabel = (r) => hi ? r.name_hi || r.name : r.name;
  const expLabel = (l) => hi ? l.label_hi || l.label : l.label;

  return (
    <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-10">
      <PageSEO
        title={hi ? "कंसल्टेंट पैनल" : "Consultant panel"}
        description={hi
          ? "आर्किटेक्ट, इंटीरियर, वास्तु, स्ट्रक्चरल कंसल्टेंट — अनुभव स्तर के साथ खोजें।"
          : "Find architects, interior, vastu and structural consultants by experience level on 2click.in."}
        path="/consultants"
        keywords="architect consultant, interior designer, vastu consultant, construction consultant India"
      />
      <div className="mb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-primary">
          {hi ? "कंसल्टेंट पैनल" : "Consultant Panel"}
        </span>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">
          {hi ? "एक्सटीरियर, इंटीरियर, आर्किटेक्ट, वास्तु — अनुभव के साथ" : "Exterior, interior, architect, vastu — with experience"}
        </h1>
        <p className="mt-2 text-muted-foreground text-sm max-w-2xl">
          {hi
            ? "रोल और अनुभव स्तर के अनुसार सत्यापित कंसल्टेंट खोजें। लॉगिन करके पूछताछ भेजें।"
            : "Find consultants by role and experience level. Log in to send enquiries."}
        </p>
        <Link to="/register?type=interior_consultant" className="text-sm text-primary hover:underline mt-2 inline-block">
          {hi ? "कंसल्टेंट के रूप में पंजीकरण →" : "Register as a consultant →"}
        </Link>
      </div>

      {/* Role tabs */}
      <div className="flex flex-wrap gap-2 mb-4" data-testid="consultant-role-tabs">
        <button
          type="button"
          onClick={() => setRole("all")}
          className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${role === "all" ? "bg-primary text-white border-primary" : "border-border hover:border-primary/40"}`}
        >
          {hi ? "सभी" : "All"}
        </button>
        {meta.roles.map((r) => {
          const Icon = ROLE_ICONS[r.id] || Briefcase;
          return (
            <button
              key={r.id}
              type="button"
              data-testid={`role-tab-${r.id}`}
              onClick={() => setRole(r.id)}
              className={`px-3 py-1.5 text-sm border rounded-lg flex items-center gap-1.5 transition-colors ${role === r.id ? "bg-primary text-white border-primary" : "border-border hover:border-primary/40"}`}
            >
              <Icon className="h-3.5 w-3.5" />{roleLabel(r)}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-testid="consultant-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder={hi ? "नाम या विशेषज्ञता…" : "Name or specialization…"}
            className="pl-9 rounded-lg"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            data-testid="experience-filter"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="bg-background border border-input px-3 h-10 text-sm rounded-lg"
          >
            <option value="all">{hi ? "सभी अनुभव" : "All experience"}</option>
            {meta.experience_levels.map((l) => (
              <option key={l.id} value={l.id}>{expLabel(l)}</option>
            ))}
          </select>
        </div>
        <Button onClick={load} className="rounded-lg">{hi ? "खोजें" : "Search"}</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c, i) => {
            const Icon = ROLE_ICONS[c.consultant_role] || Briefcase;
            const roleName = hi ? c.role_name_hi || c.role_name : c.role_name;
            const expName = hi ? c.experience_label_hi || c.experience_label : c.experience_label;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                data-testid={`consultant-${c.id}`}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="h-11 w-11 bg-primary/10 text-primary flex items-center justify-center rounded-lg font-display font-bold">
                    {c.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="text-right">
                    <span className="flex items-center gap-1 text-xs justify-end"><Star className="h-3.5 w-3.5 fill-primary text-primary" />{c.rating}</span>
                    {c.verified && (
                      <span className="text-[10px] text-solar flex items-center gap-0.5 justify-end mt-1">
                        <BadgeCheck className="h-3 w-3" />{hi ? "सत्यापित" : "Verified"}
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="font-display font-bold">{c.name}</h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] font-mono uppercase tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded flex items-center gap-1">
                    <Icon className="h-3 w-3" />{roleName}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wide bg-muted px-2 py-0.5 rounded">
                    {c.experience_years} yrs · {expName}
                  </span>
                </div>
                {c.title && <p className="text-xs text-muted-foreground mt-2">{hi ? c.title_hi || c.title : c.title}</p>}
                {c.bio && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{c.bio}</p>}
                {(c.specializations || []).length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">{c.specializations.slice(0, 3).join(" · ")}</div>
                )}
                {c.service_area && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />{c.service_area}
                  </div>
                )}
                {c.expected_pricing && (
                  <div className="mt-1 text-xs font-mono text-primary">{c.expected_pricing}</div>
                )}
                <Button data-testid={`contact-${c.id}`} onClick={() => contact(c)} className="w-full rounded-lg mt-4">
                  <Briefcase className="h-4 w-4 mr-1.5" />{hi ? "पूछताछ भेजें" : "Send enquiry"}
                </Button>
              </motion.div>
            );
          })}
          {list.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
              {hi ? "कोई कंसल्टेंट नहीं मिला" : "No consultants found for this filter"}
            </div>
          )}
        </div>
      )}

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              {hi ? "पूछताछ —" : "Enquiry to"} {target?.name}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            data-testid="consultant-enquiry-message"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder={hi ? "प्रोजेक्ट का विवरण…" : "Describe your project…"}
            rows={5}
            className="rounded-lg"
          />
          <DialogFooter>
            <Button data-testid="consultant-enquiry-send" onClick={send} disabled={sending} className="rounded-lg">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-1.5" />{hi ? "भेजें" : "Send"}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
