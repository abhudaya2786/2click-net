import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import DashboardLayout, { StatCard } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LayoutDashboard, ShoppingCart, ReceiptText, Sun, Trash2, Loader2, IndianRupee, Package, CreditCard, Store, Zap, Wallet, Home } from "lucide-react";
import HomeBuildSection from "@/components/homebuild/HomeBuildSection";
import { toast } from "sonner";
import BillingSection from "@/components/dashboard/BillingSection";
import MaterialCalculator from "@/components/dashboard/MaterialCalculator";
import SolarEstimator from "@/components/solar/SolarEstimator";
import WalletSection from "@/components/dashboard/WalletSection";

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "mera-ghar", label: "Mera Ghar", icon: Home },
  { id: "cart", label: "Cart & Checkout", icon: ShoppingCart },
  { id: "orders", label: "My Orders", icon: ReceiptText },
  { id: "quotes", label: "Solar Quotes", icon: Sun },
  { id: "solar-epc", label: "Solar EPC", icon: Zap },
  { id: "materials", label: "Material Calc", icon: Store },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "billing", label: "Billing", icon: CreditCard },
];

export default function CustomerDashboard() {
  const [active, setActive] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [details, setDetails] = useState({ address: "", architect_name: "", architect_phone: "", company_name: "" });

  const readCart = () => setCart(JSON.parse(localStorage.getItem("bs_cart") || "[]"));
  const load = async () => {
    setLoading(true);
    const [o, q] = await Promise.all([api.get("/orders"), api.get("/solar/quotations")]);
    setOrders(o.data); setQuotes(q.data); readCart(); setLoading(false);
  };
  useEffect(() => { load(); window.addEventListener("cart-updated", readCart); return () => window.removeEventListener("cart-updated", readCart); }, []);

  const updateCart = (next) => { localStorage.setItem("bs_cart", JSON.stringify(next)); setCart(next); };
  const removeItem = (pid) => updateCart(cart.filter((c) => c.product_id !== pid));

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const orderBody = () => ({
    items: cart, address: details.address, site_location: details.address,
    architect_name: details.architect_name || null, architect_phone: details.architect_phone || null,
    company_name: details.company_name || null,
  });
  const resetDetails = () => setDetails({ address: "", architect_name: "", architect_phone: "", company_name: "" });

  const checkout = async () => {
    if (cart.length === 0) return;
    if (!details.address.trim()) { toast.error("Site location / delivery address is required"); return; }
    setPaying(true);
    try {
      const { data: order } = await api.post("/orders", orderBody());
      const { data: pay } = await api.post("/payments/create", { order_id: order.id });
      // Razorpay live flow would open checkout here; running in DEMO mode when keys absent
      await api.post("/payments/verify", { order_id: order.id, mode: pay.mode });
      updateCart([]); resetDetails();
      toast.success(`Payment successful (${pay.mode} mode) — order confirmed`);
      setActive("orders"); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Checkout failed"); } finally { setPaying(false); }
  };

  const payWithWallet = async () => {
    if (cart.length === 0) return;
    if (!details.address.trim()) { toast.error("Site location / delivery address is required"); return; }
    setPaying(true);
    try {
      const { data: order } = await api.post("/orders", orderBody());
      const { data } = await api.post(`/orders/${order.id}/pay-wallet`);
      updateCart([]); resetDetails();
      toast.success(`Paid via wallet — new balance ₹${Number(data.balance).toLocaleString("en-IN")}`);
      setActive("orders"); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Wallet payment failed"); } finally { setPaying(false); }
  };

  return (
    <DashboardLayout nav={NAV} active={active} setActive={setActive} title="Customer Dashboard">
      {loading ? <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <>
          {active === "overview" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={ReceiptText} label="Total Orders" value={orders.length} />
              <StatCard icon={ShoppingCart} label="Cart Items" value={cart.length} color="text-tender" />
              <StatCard icon={IndianRupee} label="Total Spent" value={`₹${(orders.filter(o=>o.status==="paid").reduce((s,o)=>s+o.total,0)/1000).toFixed(1)}K`} color="text-solar" />
              <StatCard icon={Sun} label="Solar Quotes" value={quotes.length} color="text-solar" />
            </div>
          )}

          {active === "mera-ghar" && <HomeBuildSection />}

          {active === "cart" && (
            <div className="grid lg:grid-cols-[1fr_320px] gap-px bg-border border border-border">
              <div className="bg-card">
                {cart.length === 0 ? <div className="p-10 text-center text-muted-foreground text-sm"><Package className="h-8 w-8 mx-auto mb-3" strokeWidth={1.5} />Your cart is empty. Browse the marketplace.</div> :
                  cart.map((c) => (
                    <div key={c.product_id} className="flex items-center gap-4 p-4 border-b border-border">
                      <img src={c.image} alt={c.name} className="h-14 w-14 object-cover" />
                      <div className="flex-1 min-w-0"><div className="font-medium text-sm truncate">{c.name}</div><div className="text-xs text-muted-foreground font-mono">₹{c.price.toLocaleString("en-IN")}/{c.unit}</div></div>
                      <input type="number" min="1" value={c.qty} onChange={(e) => updateCart(cart.map((x) => x.product_id === c.product_id ? { ...x, qty: Math.max(1, Number(e.target.value)) } : x))}
                        className="w-16 bg-background border border-input px-2 py-1 text-sm" />
                      <span className="font-mono font-bold text-sm w-24 text-right">₹{(c.price * c.qty).toLocaleString("en-IN")}</span>
                      <button data-testid={`cart-remove-${c.product_id}`} onClick={() => removeItem(c.product_id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
              </div>
              <div className="bg-card p-6">
                <h3 className="font-display font-bold text-sm tracking-tight mb-3">Delivery &amp; Site Details</h3>
                <div className="space-y-2.5 mb-5">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Site location / delivery address *</label>
                    <Input data-testid="order-address" value={details.address} onChange={(e) => setDetails({ ...details, address: e.target.value })} placeholder="Plot 42, Whitefield, Bengaluru" className="rounded-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input data-testid="order-architect-name" value={details.architect_name} onChange={(e) => setDetails({ ...details, architect_name: e.target.value })} placeholder="Architect name" className="rounded-none" />
                    <Input data-testid="order-architect-phone" value={details.architect_phone} onChange={(e) => setDetails({ ...details, architect_phone: e.target.value })} placeholder="Architect phone" className="rounded-none" />
                  </div>
                  <Input data-testid="order-company-name" value={details.company_name} onChange={(e) => setDetails({ ...details, company_name: e.target.value })} placeholder="Company name (optional)" className="rounded-none" />
                </div>
                <h3 className="font-display font-bold text-sm tracking-tight mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">₹{subtotal.toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">GST (18%)</span><span className="font-mono">₹{tax.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between border-t border-border pt-2 mt-2 font-bold"><span>Total</span><span className="font-mono">₹{total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span></div>
                </div>
                <Button data-testid="checkout-btn" onClick={checkout} disabled={cart.length === 0 || paying} className="w-full rounded-none mt-5">
                  {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pay with Razorpay"}
                </Button>
                <Button data-testid="wallet-checkout-btn" onClick={payWithWallet} disabled={cart.length === 0 || paying} variant="outline" className="w-full rounded-none mt-2">
                  <Wallet className="h-4 w-4 mr-1.5" />Pay with Wallet
                </Button>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">Razorpay demo mode · Wallet uses your 2click balance</p>
              </div>
            </div>
          )}

          {active === "orders" && (
            <div className="bg-card border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-3">Order ID</th><th className="p-3">Items</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Date</th></tr></thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-3 font-mono text-xs">{o.id}</td>
                      <td className="p-3">{o.items.length} item(s)</td>
                      <td className="p-3 font-mono">₹{o.total.toLocaleString("en-IN")}</td>
                      <td className="p-3"><span className={`text-xs font-mono px-2 py-0.5 ${o.status === "paid" ? "bg-solar/10 text-solar" : "bg-muted text-muted-foreground"}`}>{o.status}</span></td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-muted-foreground">No orders yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {active === "quotes" && (
            <div className="grid gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-3">
              {quotes.map((q) => (
                <div key={q.id} className="bg-card p-5">
                  <Sun className="h-6 w-6 text-solar mb-3" strokeWidth={1.5} />
                  <div className="font-display font-bold">{q.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">Capacity: {q.capacity_kw} kW</div>
                  <div className="font-mono font-bold mt-2">₹{q.total_cost.toLocaleString("en-IN")}</div>
                </div>
              ))}
              {quotes.length === 0 && <div className="bg-card p-8 col-span-full text-center text-muted-foreground text-sm">No saved quotes. Use the Solar calculator.</div>}
            </div>
          )}

          {active === "materials" && <MaterialCalculator />}
          {active === "solar-epc" && <SolarEstimator embedded />}
          {active === "wallet" && <WalletSection />}
          {active === "billing" && <BillingSection />}
        </>
      )}
    </DashboardLayout>
  );
}
