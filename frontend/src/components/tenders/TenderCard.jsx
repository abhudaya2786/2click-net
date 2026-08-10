import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Gavel, Clock, Users, MapPin, Package } from "lucide-react";
import { motion } from "framer-motion";

function Countdown({ closesAt }) {
  const [left, setLeft] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(closesAt) - new Date();
      if (diff <= 0) { setLeft("CLOSED"); return; }
      const h = Math.floor(diff / 3.6e6), m = Math.floor((diff % 3.6e6) / 6e4), s = Math.floor((diff % 6e4) / 1000);
      setLeft(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [closesAt]);
  return <span className="font-mono text-sm text-primary">{left}</span>;
}

export default function TenderCard({ tender: t, index = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }}>
      <Link to={`/tenders/${t.id}`} data-testid={`tender-${t.id}`} className="group block bg-card p-5 h-full hover:bg-accent/40 transition-colors border border-border">
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="text-[10px] font-mono uppercase tracking-wider bg-tender/10 text-tender px-2 py-0.5">
            {t.subject_label || t.subject || "Tender"}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5">
            {t.material_type_label || t.category}
          </span>
          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 ml-auto ${t.status === "open" ? "bg-solar/10 text-solar" : "bg-muted text-muted-foreground"}`}>
            {t.published === false ? "draft" : t.status}
          </span>
        </div>
        <Gavel className="h-5 w-5 text-tender mb-2" strokeWidth={1.5} />
        <h3 className="font-display font-bold text-sm leading-snug tracking-tight group-hover:text-primary transition-colors line-clamp-2">{t.title}</h3>
        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{t.description}</p>
        {t.location && (
          <p className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{t.location}</p>
        )}
        {t.quantity && (
          <p className="mt-1 text-[10px] text-muted-foreground flex items-center gap-1">
            <Package className="h-3 w-3" />Qty: {t.quantity} {t.unit}
          </p>
        )}
        <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs">
          <div><div className="text-muted-foreground">Budget</div><div className="font-mono font-medium">₹{(t.budget/100000).toFixed(1)}L</div></div>
          <div><div className="text-muted-foreground">EMD</div><div className="font-mono font-medium">₹{(t.emd/1000).toFixed(0)}K</div></div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-muted-foreground"><Users className="h-3.5 w-3.5" />{t.bid_count || 0} bids</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary" /><Countdown closesAt={t.closes_at} /></span>
        </div>
      </Link>
    </motion.div>
  );
}
