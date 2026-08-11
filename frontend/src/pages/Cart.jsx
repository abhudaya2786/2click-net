import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageSEO from "@/components/marketing/PageSEO";
import { ShoppingBag, Trash2, Loader2, Wallet, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Cart() {
  const { items, remove, setQty, clear, count } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const { lang } = useLang();
  const hi = lang === "hi";
  const [paying, setPaying] = useState(false);
  const [details, setDetails] = useState({ address: "", architect_name: "", architect_phone: "", company_name: "" });

  const subtotal = items.reduce((s, c) => s + c.price * c.qty, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const orderBody = () => ({
    items: items.map((c) => ({
      product_id: c.product_id,
      name: c.name,
      price: c.price,
      qty: c.qty,
      unit: c.unit,
      category: c.category,
    })),
    address: details.address,
    site_location: details.address,
    architect_name: details.architect_name || null,
    architect_phone: details.architect_phone || null,
    company_name: details.company_name || null,
  });

  const checkout = async () => {
    if (!user) {
      nav("/login");
      return;
    }
    if (items.length === 0) return;
    if (!details.address.trim()) {
      toast.error(hi ? "डिलीवरी पता ज़रूरी" : "Delivery address required");
      return;
    }
    setPaying(true);
    try {
      const { data: order } = await api.post("/orders", orderBody());
      const { data: pay } = await api.post("/payments/create", { order_id: order.id });
      await api.post("/payments/verify", { order_id: order.id, mode: pay.mode });
      clear();
      toast.success(hi ? "ऑर्डर कन्फर्म!" : "Order confirmed!");
      nav("/dashboard");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Checkout failed");
    } finally {
      setPaying(false);
    }
  };

  const payWithWallet = async () => {
    if (!user) {
      nav("/login");
      return;
    }
    if (items.length === 0) return;
    if (!details.address.trim()) {
      toast.error(hi ? "डिलीवरी पता ज़रूरी" : "Delivery address required");
      return;
    }
    setPaying(true);
    try {
      const { data: order } = await api.post("/orders", orderBody());
      await api.post(`/orders/${order.id}/pay-wallet`);
      clear();
      toast.success(hi ? "वॉलेट से भुगतान हो गया" : "Paid via wallet");
      nav("/dashboard");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-10 py-10">
      <PageSEO title={hi ? "मेरा बैग" : "My bag"} description="Cart checkout on 2click construction store" path="/cart" />

      <Link to="/store" className="text-sm text-primary hover:underline flex items-center gap-1 mb-6">
        <ArrowLeft className="h-4 w-4" />{hi ? "स्टोर पर वापस" : "Back to store"}
      </Link>

      <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight flex items-center gap-2">
        <ShoppingBag className="h-7 w-7 text-primary" />
        {hi ? "मेरा बैग" : "My bag"}
        <span className="text-muted-foreground font-normal text-lg">({count})</span>
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>{hi ? "बैग खाली है" : "Your bag is empty"}</p>
          <Link to="/store"><Button className="mt-4 rounded-full">{hi ? "स्टोर browse करें" : "Browse store"}</Button></Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_340px] gap-8 mt-8">
          <div className="space-y-4">
            {items.map((c) => (
              <div key={c.product_id} className="flex gap-4 p-4 border border-border rounded-xl bg-card" data-testid={`cart-item-${c.product_id}`}>
                <Link to={`/store/product/${c.product_id}`} className="shrink-0">
                  <img src={c.image} alt="" className="h-24 w-24 rounded-lg object-cover border border-border" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">{c.brand}</div>
                  <Link to={`/store/product/${c.product_id}`} className="font-medium text-sm hover:text-primary line-clamp-2">{c.name}</Link>
                  <div className="text-xs text-muted-foreground mt-1">₹{c.price.toLocaleString("en-IN")}/{c.unit}</div>
                  <div className="flex items-center gap-3 mt-3">
                    <input
                      type="number"
                      min={1}
                      value={c.qty}
                      onChange={(e) => setQty(c.product_id, Math.max(1, Number(e.target.value)))}
                      className="w-16 border border-input rounded-lg px-2 py-1 text-sm"
                    />
                    <span className="font-mono font-bold text-sm">₹{(c.price * c.qty).toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <button type="button" onClick={() => remove(c.product_id)} className="text-muted-foreground hover:text-destructive shrink-0">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="border border-border rounded-xl bg-card p-6 lg:sticky lg:top-24 h-fit">
            <h3 className="font-display font-bold mb-4">{hi ? "ऑर्डर सारांश" : "Order summary"}</h3>
            <div className="space-y-2.5 mb-5">
              <Input
                placeholder={hi ? "साइट / डिलीवरी पता *" : "Site / delivery address *"}
                value={details.address}
                onChange={(e) => setDetails({ ...details, address: e.target.value })}
                className="rounded-lg"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Architect" value={details.architect_name} onChange={(e) => setDetails({ ...details, architect_name: e.target.value })} className="rounded-lg" />
                <Input placeholder="Phone" value={details.architect_phone} onChange={(e) => setDetails({ ...details, architect_phone: e.target.value })} className="rounded-lg" />
              </div>
            </div>
            <div className="space-y-2 text-sm border-t border-border pt-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">₹{subtotal.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">GST 18%</span><span className="font-mono">₹{tax.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                <span>Total</span><span className="font-mono">₹{total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
            <Button data-testid="cart-checkout" className="w-full rounded-full mt-5" disabled={paying} onClick={checkout}>
              {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : (hi ? "प्लेस ऑर्डर" : "Place order")}
            </Button>
            <Button variant="outline" className="w-full rounded-full mt-2" disabled={paying} onClick={payWithWallet}>
              <Wallet className="h-4 w-4 mr-1.5" />{hi ? "वॉलेट से pay" : "Pay with wallet"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
