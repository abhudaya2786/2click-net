import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, MapPin, Star, Loader2, Briefcase, Send } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FREELANCER_MODULE } from "@/lib/exploreNavMap";
import { useLang } from "@/context/LanguageContext";
import ClientAgreementGate from "@/components/enrollment/ClientAgreementGate";

export default function Freelancers() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { lang } = useLang();
  const hi = lang === "hi";
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [clientGateOpen, setClientGateOpen] = useState(false);
  const [pendingFreelancer, setPendingFreelancer] = useState(null);

  const [rates, setRates] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get("/freelancers", { params: { q } }),
      api.get("/commission/freelancer-rates").catch(() => ({ data: null })),
    ]).then(([fl, rt]) => { setList(fl.data); setRates(rt.data); }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const hasClientAgreement = async () => {
    try {
      const { data } = await api.get("/enrollment/me");
      return (data.agreements_accepted || []).some((a) => a.agreement_code === "client_agreement");
    } catch {
      return false;
    }
  };

  const contact = async (f) => {
    if (!user) { toast.error("Please log in to contact freelancers"); nav("/login"); return; }
    const ok = await hasClientAgreement();
    if (!ok) {
      setPendingFreelancer(f);
      setClientGateOpen(true);
      return;
    }
    setTarget(f); setMsg("");
  };

  const onClientAgreementAccepted = () => {
    if (pendingFreelancer) {
      setTarget(pendingFreelancer);
      setMsg("");
      setPendingFreelancer(null);
    }
  };
  const send = async () => {
    if (!msg.trim()) return;
    setSending(true);
    try {
      await api.post(`/freelancers/${target.id}/enquiry`, { message: msg, category: target.categories?.[0] });
      toast.success("Enquiry sent!");
      setTarget(null);
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); } finally { setSending(false); }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-10">
      <div className="mb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-primary">Talent Network</span>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">Hire verified professionals & freelancers.</h1>
        <p className="mt-2 text-muted-foreground text-sm">Architects, engineers, CAs and specialists — browse freely, log in to connect.</p>
        {rates && (
          <p className="mt-2 text-xs text-muted-foreground border border-border inline-block px-3 py-1.5 bg-card">
            Commission-based: platform fee from <strong>{rates.order_platform_percent}%</strong> per order (varies by service/product — freelancer receives net payout).
          </p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          <Link to="/client-agreement" className="text-primary hover:underline">Client agreement</Link>
          {" · "}
          <Link to="/freelancer-agreement" className="text-primary hover:underline">Freelancer agreement</Link>
        </p>
      </div>

      <div className="flex gap-2 mb-6 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input data-testid="freelancer-search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder={hi ? FREELANCER_MODULE.searchPlaceholderHi : FREELANCER_MODULE.searchPlaceholderEn} className="rounded-none pl-9" />
        </div>
        <Button onClick={load} data-testid="freelancer-search-btn" className="rounded-none">Search</Button>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <div className="grid gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-3">
          {list.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              data-testid={`freelancer-${f.id}`} className="bg-card p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-11 w-11 bg-primary text-white flex items-center justify-center font-display font-bold">{f.name?.[0]?.toUpperCase()}</div>
                <span className="flex items-center gap-1 text-xs"><Star className="h-3.5 w-3.5 fill-primary text-primary" />{f.rating}</span>
              </div>
              <h3 className="font-display font-bold">{f.name}</h3>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">{f.user_type}</div>
              <div className="mt-3 flex flex-wrap gap-1">
                {(f.categories || []).slice(0, 3).map((c) => <span key={c} className="text-xs bg-primary/10 text-primary px-2 py-0.5">{c}</span>)}
              </div>
              {(f.skills || []).length > 0 && <div className="mt-2 text-xs text-muted-foreground">{f.skills.slice(0, 4).join(" · ")}</div>}
              {f.service_area && <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{f.service_area}</div>}
              <Button data-testid={`contact-${f.id}`} onClick={() => contact(f)} className="w-full rounded-none mt-4"><Briefcase className="h-4 w-4 mr-1.5" />{hi ? "हायर / पूछताछ" : "Hire / Send enquiry"}</Button>
            </motion.div>
          ))}
          {list.length === 0 && <div className="bg-card p-10 col-span-full text-center text-muted-foreground text-sm">{hi ? FREELANCER_MODULE.emptyHi : FREELANCER_MODULE.emptyEn}</div>}
        </div>
      )}

      <ClientAgreementGate
        open={clientGateOpen}
        onOpenChange={setClientGateOpen}
        onAccepted={onClientAgreementAccepted}
      />

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent className="rounded-none">
          <DialogHeader><DialogTitle className="font-display">Send enquiry to {target?.name}</DialogTitle></DialogHeader>
          <Textarea data-testid="enquiry-message" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Describe your project or requirement…" rows={5} className="rounded-none" />
          <DialogFooter>
            <Button data-testid="enquiry-send" onClick={send} disabled={sending} className="rounded-none">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-1.5" />Send enquiry</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
