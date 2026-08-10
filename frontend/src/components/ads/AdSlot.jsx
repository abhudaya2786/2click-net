import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { X } from "lucide-react";

const BACKEND = process.env.REACT_APP_BACKEND_URL;
const clickUrl = (id) => `${BACKEND}/api/ads/click/${id}`;
const bannerSrc = (a) => {
  const u = a.banner_url || "";
  if (!u) return "";
  return u.startsWith("http") ? u : `${BACKEND}${u}`;
};

/**
 * Live ad slot. Fetches an approved+active campaign for the given placement,
 * fires a genuine impression beacon on render, and routes clicks through the
 * tracked redirect endpoint. Renders nothing when no ad is available.
 */
export default function AdSlot({ placement, limit = 1, className = "" }) {
  const [ads, setAds] = useState([]);
  const [closed, setClosed] = useState(false);
  const [broken, setBroken] = useState({});
  const fired = useRef(new Set());
  const markBroken = (id) => setBroken((b) => ({ ...b, [id]: true }));
  const showImg = (a) => a.banner_url && !broken[a.id];

  useEffect(() => {
    let alive = true;
    api.get(`/ads/serve/${placement}`, { params: { limit } })
      .then(({ data }) => { if (alive) setAds(data.ads || []); })
      .catch(() => {});
    return () => { alive = false; };
  }, [placement, limit]);

  useEffect(() => {
    ads.forEach((a) => {
      if (!fired.current.has(a.id)) {
        fired.current.add(a.id);
        api.post("/ads/track/impression", { campaign_id: a.id }).catch(() => {});
      }
    });
  }, [ads]);

  if (closed || ads.length === 0) return null;

  if (placement === "header") {
    const a = ads[0];
    return (
      <div data-testid="ad-slot-header" className={`relative border-b border-border bg-card ${className}`}>
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <a href={clickUrl(a.id)} target="_blank" rel="noreferrer sponsored" data-testid={`ad-click-${a.id}`}
            className="flex items-center gap-4 py-2.5 pr-8 group">
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground border border-border px-1.5 py-0.5 shrink-0">Ad</span>
            {showImg(a)
              ? <img src={bannerSrc(a)} alt={a.name} onError={() => markBroken(a.id)} className="h-9 md:h-11 w-auto object-contain" />
              : <span className="font-display font-bold text-sm md:text-base truncate group-hover:text-primary transition-colors">{a.name}</span>}
            <span className="ml-auto text-xs font-medium text-primary hidden sm:inline group-hover:underline shrink-0">Learn more →</span>
          </a>
        </div>
        <button data-testid="ad-close-header" onClick={() => setClosed(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
      </div>
    );
  }

  if (placement === "sidebar") {
    const a = ads[0];
    return (
      <a data-testid="ad-slot-sidebar" href={clickUrl(a.id)} target="_blank" rel="noreferrer sponsored"
        className={`block border border-border bg-card overflow-hidden group sticky top-20 ${className}`}>
        <div className="aspect-[4/5] bg-muted overflow-hidden flex items-center justify-center">
          {showImg(a)
            ? <img src={bannerSrc(a)} alt={a.name} onError={() => markBroken(a.id)} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
            : <span className="font-display font-bold p-4 text-center">{a.name}</span>}
        </div>
        <div className="p-3">
          <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Sponsored</span>
          <div className="font-medium text-sm mt-1 group-hover:text-primary transition-colors">{a.name}</div>
        </div>
      </a>
    );
  }

  // in-feed native (one or more cells)
  return (
    <>
      {ads.map((a) => (
        <a key={a.id} data-testid={`ad-slot-infeed-${a.id}`} href={clickUrl(a.id)} target="_blank" rel="noreferrer sponsored"
          className={`block bg-card overflow-hidden group relative ring-1 ring-primary/40 ${className}`}>
          <span className="absolute top-2 left-2 z-10 text-[9px] font-mono uppercase tracking-widest bg-primary text-white px-1.5 py-0.5">Sponsored</span>
          <div className="aspect-[4/3] bg-muted overflow-hidden">
            {showImg(a)
              ? <img src={bannerSrc(a)} alt={a.name} onError={() => markBroken(a.id)} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
              : <div className="h-full flex items-center justify-center font-display font-bold p-4 text-center">{a.name}</div>}
          </div>
          <div className="p-4">
            <div className="font-medium text-sm group-hover:text-primary transition-colors">{a.name}</div>
            <div className="text-xs text-primary mt-2 group-hover:underline">Visit advertiser →</div>
          </div>
        </a>
      ))}
    </>
  );
}
