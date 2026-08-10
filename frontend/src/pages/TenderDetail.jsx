import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gavel, Clock, Loader2, TrendingDown, Trophy, ArrowLeft, Sparkles, MapPin, Package, Pencil } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import PageSEO from "@/components/marketing/PageSEO";
import WhatsAppShare from "@/components/marketing/WhatsAppShare";

function Countdown({ closesAt }) {
  const [left, setLeft] = useState("");
  useEffect(() => {
    const t = setInterval(() => {
      const diff = new Date(closesAt) - new Date();
      if (diff <= 0) { setLeft("CLOSED"); return; }
      const h = Math.floor(diff / 3.6e6), m = Math.floor((diff % 3.6e6) / 6e4), s = Math.floor((diff % 6e4) / 1000);
      setLeft(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    }, 1000);
    return () => clearInterval(t);
  }, [closesAt]);
  return <span className="font-mono text-2xl font-bold text-primary tracking-wider">{left || "—"}</span>;
}

export default function TenderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tender, setTender] = useState(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(false);
  const [summary, setSummary] = useState("");
  const [summBusy, setSummBusy] = useState(false);
  const prevCount = useRef(0);

  const load = async () => {
    const { data } = await api.get(`/tenders/${id}`);
    if (data.bids.length > prevCount.current && prevCount.current > 0) {
      setFlash(true); setTimeout(() => setFlash(false), 700);
    }
    prevCount.current = data.bids.length;
    setTender(data);
  };

  useEffect(() => { load(); const t = setInterval(load, 4000); return () => clearInterval(t); /* eslint-disable-next-line */ }, [id]);

  const placeBid = async () => {
    if (!user) { toast.error("Log in as a vendor/contractor to bid"); return; }
    if (!amount) return;
    setBusy(true);
    try {
      await api.post(`/tenders/${id}/bids`, { amount: Number(amount), note: "" });
      toast.success("Bid placed!");
      setAmount("");
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Bid failed"); } finally { setBusy(false); }
  };

  const aiSummary = async () => {
    setSummBusy(true);
    try {
      const { data } = await api.post("/ai/tender-summary", { text: `${tender.title}. ${tender.description}. Budget ₹${tender.budget}, EMD ₹${tender.emd}, Category ${tender.category}.` });
      setSummary(data.summary);
    } catch { toast.error("AI summary failed"); } finally { setSummBusy(false); }
  };

  if (!tender) return <div className="flex justify-center py-32"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const canBid = user && ["vendor", "contractor", "super_admin"].includes(user.role);
  const canEdit = user && (user.role === "super_admin" || tender.owner_id === user.id);
  const shareMsg = `2click.in Tender: ${tender.title} — Budget ₹${(tender.budget / 100000).toFixed(1)}L. Bid now: ${window.location.href}`;

  return (
    <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-10">
      <PageSEO
        title={tender.title}
        description={`${tender.description?.slice(0, 140) || "Construction tender"} — Budget ₹${(tender.budget / 100000).toFixed(1)}L. Live reverse auction on 2click.in`}
        path={`/tenders/${id}`}
      />
      <Link to="/tenders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="h-4 w-4" />Back to tenders</Link>

      <div className="grid lg:grid-cols-[1fr_380px] gap-px bg-border border border-border">
        <div className="bg-card p-8">
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider bg-tender/10 text-tender px-2 py-1">{tender.subject_label || tender.subject}</span>
            <span className="text-[10px] font-mono uppercase tracking-wider bg-primary/10 text-primary px-2 py-1">{tender.material_type_label || tender.category}</span>
            {tender.published === false && <span className="text-[10px] font-mono bg-muted px-2 py-1">draft</span>}
          </div>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">{tender.title}</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">{tender.description}</p>
          {(tender.location || tender.quantity) && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {tender.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{tender.location}</span>}
              {tender.quantity && <span className="flex items-center gap-1"><Package className="h-4 w-4" />{tender.quantity} {tender.unit}</span>}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <WhatsAppShare message={shareMsg} label="WhatsApp Share" size="sm" />
            {canEdit && (
              <Link to="/dashboard">
                <Button size="sm" variant="outline" className="rounded-none">
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Edit in Dashboard
                </Button>
              </Link>
            )}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-px bg-border border border-border">
            {[["Budget",`₹${(tender.budget/100000).toFixed(1)}L`],["EMD",`₹${(tender.emd/1000).toFixed(0)}K`],["Bids",tender.bids.length]].map(([l,v]) => (
              <div key={l} className="bg-card p-4"><div className="text-xs text-muted-foreground">{l}</div><div className="font-mono font-bold text-lg">{v}</div></div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h2 className="font-display font-bold text-lg tracking-tight">AI Tender Summary</h2>
            <Button data-testid="ai-summary-btn" onClick={aiSummary} disabled={summBusy} variant="outline" size="sm" className="rounded-none">
              {summBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Sparkles className="h-3.5 w-3.5 mr-1.5" />Generate</>}
            </Button>
          </div>
          {summary && <div data-testid="ai-summary-out" className="mt-4 text-sm whitespace-pre-wrap bg-muted p-4 leading-relaxed border-l-2 border-primary">{summary}</div>}
        </div>

        {/* Auction sidebar */}
        <div className="bg-card p-6">
          <div className={`border border-border p-5 text-center ${flash ? "pulse-bid" : ""}`}>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-2"><Clock className="h-3.5 w-3.5" />Auction closes in</div>
            <Countdown closesAt={tender.closes_at} />
          </div>

          <div className="mt-5 border border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm"><TrendingDown className="h-4 w-4 text-primary" />Lowest bid</div>
            <span className="font-mono font-bold text-lg">{tender.lowest_bid ? `₹${(tender.lowest_bid/100000).toFixed(2)}L` : "—"}</span>
          </div>

          {canBid && tender.status === "open" && (
            <div className="mt-5 flex gap-2">
              <Input data-testid="bid-amount" type="number" placeholder="Your bid (₹)" value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-none" />
              <Button data-testid="place-bid-btn" onClick={placeBid} disabled={busy} className="rounded-none shrink-0">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Place Bid"}
              </Button>
            </div>
          )}
          {!canBid && <p className="mt-4 text-xs text-muted-foreground">Log in as a vendor or contractor to place bids.</p>}

          <h3 className="font-display font-bold text-sm tracking-tight mt-7 mb-3">Live Bid Ranking</h3>
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {tender.bids.length === 0 && <p className="text-xs text-muted-foreground">No bids yet. Be the first!</p>}
            {tender.bids.map((b) => (
              <motion.div key={b.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`flex items-center gap-3 p-2.5 border ${b.rank === 1 ? "border-solar bg-solar/5" : "border-border"}`}>
                <span className={`h-6 w-6 flex items-center justify-center text-xs font-mono font-bold ${b.rank === 1 ? "bg-solar text-white" : "bg-muted"}`}>
                  {b.rank === 1 ? <Trophy className="h-3.5 w-3.5" /> : b.rank}
                </span>
                <span className="text-sm flex-1 truncate">{b.bidder_name}</span>
                <span className="font-mono font-bold text-sm">₹{(b.amount/100000).toFixed(2)}L</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
