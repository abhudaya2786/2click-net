import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function SegmentCatalog({ segment = "interior" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/home/segment/${segment}`)
      .then(({ data: d }) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [segment]);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
  if (!data?.packages?.length) return <p className="text-sm text-muted-foreground">इस segment के लिए catalog जल्द आएगा। Super Mart देखें।</p>;

  return (
    <div>
      <h4 className="font-display font-bold mb-4 capitalize">{segment.replace("_", " ")} Packages — Photo + Rate</h4>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.packages.map((p) => (
          <div key={p.name} className="border border-border overflow-hidden">
            {p.image && <img src={p.image} alt={p.name} className="h-36 w-full object-cover" />}
            <div className="p-4">
              <div className="font-medium text-sm">{p.name}</div>
              <div className="font-mono font-bold text-primary mt-1">₹{p.rate?.toLocaleString("en-IN")}/{p.unit}</div>
            </div>
          </div>
        ))}
      </div>
      {data.trade_rates?.length > 0 && (
        <div className="mt-8">
          <h4 className="font-display font-bold mb-3 text-sm">Admin-Controlled Trade Rates</h4>
          <div className="grid sm:grid-cols-2 gap-2">
            {data.trade_rates.slice(0, 8).map((t) => (
              <div key={t.id} className="flex justify-between text-sm p-2 border border-border">
                <span className="text-muted-foreground capitalize">{t.trade?.replace("_", " ")} — {t.name}</span>
                <span className="font-mono">₹{t.rate}/{t.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
