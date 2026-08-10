import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Gavel, MapPin } from "lucide-react";

export default function VendorRFQInbox() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState({});
  const [busy, setBusy] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/home/rfq/vendor-inbox");
      setRfqs(data);
    } catch {
      toast.error("Could not load RFQ inbox");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const placeBid = async (rfqId) => {
    const b = bids[rfqId];
    if (!b?.amount) { toast.error("Enter bid amount"); return; }
    setBusy(rfqId);
    try {
      await api.post(`/home/rfq/${rfqId}/bid`, {
        amount: Number(b.amount),
        delivery_days: Number(b.delivery_days || 7),
        note: b.note || "",
      });
      toast.success("Anonymous bid placed — client will see Vendor ref only");
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Bid failed");
    } finally {
      setBusy("");
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Anonymous requests from nearby clients — your identity is hidden from them.</p>
      {rfqs.length === 0 && <p className="text-sm text-muted-foreground">No open RFQs in your area. Set lat/lng on your profile for geo-matching.</p>}
      {rfqs.map((r) => (
        <div key={r.id} className="p-4 border border-border bg-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-medium capitalize flex items-center gap-2">
                <Gavel className="h-4 w-4 text-primary" />
                {r.trade?.replace("_", " ")} — {r.material_description}
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {r.distance_km} km away · Qty: {r.quantity} {r.unit}
              </div>
            </div>
            {r.already_bid && <span className="text-xs bg-solar/10 text-solar px-2 py-0.5">Bid placed</span>}
          </div>
          {!r.already_bid && (
            <div className="flex flex-wrap gap-2 mt-3">
              <Input type="number" placeholder="Your rate ₹" className="rounded-none w-32"
                value={bids[r.id]?.amount || ""} onChange={(e) => setBids({ ...bids, [r.id]: { ...bids[r.id], amount: e.target.value } })} />
              <Input type="number" placeholder="Delivery days" className="rounded-none w-28"
                value={bids[r.id]?.delivery_days || ""} onChange={(e) => setBids({ ...bids, [r.id]: { ...bids[r.id], delivery_days: e.target.value } })} />
              <Button size="sm" className="rounded-none" disabled={busy === r.id} onClick={() => placeBid(r.id)}>
                {busy === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Place Bid"}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
