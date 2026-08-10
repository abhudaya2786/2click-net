import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Gavel, Clock, Users, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import PageSEO from "@/components/marketing/PageSEO";

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
  return <span className="font-mono text-sm text-primary">{left}</span>;
}

export default function TenderHub() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/tenders").then(({ data }) => { setTenders(data); setLoading(false); }); }, []);

  return (
    <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-10">
      <PageSEO
        title="Tender Hub — Live Reverse Auction & Bidding"
        description="Construction tender bidding platform with live reverse auction, auto-ranking and AI tender summary — 2click.in Tender Hub"
        path="/tenders"
      />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-tender">Tender Hub</span>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-2">Live tenders & reverse auctions.</h1>
        </div>
        <Link to="/dashboard" className="text-sm text-primary font-medium flex items-center gap-1">Post a tender <ArrowRight className="h-4 w-4" /></Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-px bg-border border border-border md:grid-cols-2 lg:grid-cols-3">
          {tenders.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link to={`/tenders/${t.id}`} data-testid={`tender-${t.id}`} className="group block bg-card p-6 h-full hover:bg-accent/40 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-tender/10 text-tender px-2 py-1">{t.category}</span>
                  <span className={`text-[10px] font-mono uppercase px-2 py-1 ${t.status === "open" ? "bg-solar/10 text-solar" : "bg-muted text-muted-foreground"}`}>{t.status}</span>
                </div>
                <Gavel className="h-6 w-6 text-tender mb-3" strokeWidth={1.5} />
                <h3 className="font-display font-bold text-base leading-tight tracking-tight group-hover:text-primary transition-colors">{t.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{t.description}</p>
                <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 gap-3 text-xs">
                  <div><div className="text-muted-foreground">Budget</div><div className="font-mono font-medium">₹{(t.budget/100000).toFixed(1)}L</div></div>
                  <div><div className="text-muted-foreground">EMD</div><div className="font-mono font-medium">₹{(t.emd/1000).toFixed(0)}K</div></div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><Users className="h-3.5 w-3.5" />{t.bid_count} bids</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /><Countdown closesAt={t.closes_at} /></span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
