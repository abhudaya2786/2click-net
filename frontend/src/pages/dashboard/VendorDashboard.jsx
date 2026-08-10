import { useEffect, useState, Fragment } from "react";
import { api } from "@/lib/api";
import DashboardLayout, { StatCard } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { LayoutDashboard, Package, ShoppingBag, Plus, Trash2, Loader2, IndianRupee, Boxes, Star, CreditCard, Wallet, Sun, Gavel } from "lucide-react";
import VendorRFQInbox from "@/components/homebuild/VendorRFQInbox";
import { toast } from "sonner";
import BillingSection from "@/components/dashboard/BillingSection";
import WalletSection from "@/components/dashboard/WalletSection";
import SolarCatalogManager from "@/components/solar/SolarCatalogManager";

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "My Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "rfq", label: "RFQ Inbox", icon: Gavel },
  { id: "solar", label: "Solar Brands", icon: Sun },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "billing", label: "Billing", icon: CreditCard },
];
const EMPTY = { name: "", category: "Steel & TMT", price: "", unit: "unit", stock: "", description: "", image: "https://images.unsplash.com/photo-1763926062529-1edf8664c366?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" };

export default function VendorDashboard() {
  const [active, setActive] = useState("overview");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openOrder, setOpenOrder] = useState(null);

  const load = async () => {
    setLoading(true);
    const [p, o] = await Promise.all([api.get("/vendor/products"), api.get("/vendor/orders")]);
    setProducts(p.data); setOrders(o.data); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.name || !form.price) { toast.error("Name and price required"); return; }
    await api.post("/products", { ...form, price: Number(form.price), stock: Number(form.stock || 0) });
    toast.success("Product listed"); setOpen(false); setForm(EMPTY); load();
  };
  const del = async (id) => { await api.delete(`/products/${id}`); toast.success("Removed"); load(); };

  const revenue = orders.filter((o) => o.status === "paid").reduce((s, o) => s + o.total, 0);

  return (
    <DashboardLayout nav={NAV} active={active} setActive={setActive} title="Vendor Portal">
      {loading ? <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <>
          {active === "overview" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Package} label="Listed Products" value={products.length} />
              <StatCard icon={ShoppingBag} label="Total Orders" value={orders.length} color="text-tender" />
              <StatCard icon={IndianRupee} label="Revenue" value={`₹${(revenue/1000).toFixed(1)}K`} color="text-solar" />
              <StatCard icon={Boxes} label="Total Stock" value={products.reduce((s,p)=>s+(p.stock||0),0).toLocaleString("en-IN")} />
            </div>
          )}

          {active === "products" && (
            <div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-display font-bold text-lg tracking-tight">Product Catalog</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild><Button data-testid="add-product-btn" className="rounded-none"><Plus className="h-4 w-4 mr-1.5" />Add Product</Button></DialogTrigger>
                  <DialogContent className="rounded-none">
                    <DialogHeader><DialogTitle className="font-display">List a new product</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <Input data-testid="prod-name" placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-none" />
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-none" />
                        <Input placeholder="Unit (kg/bag)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="rounded-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input data-testid="prod-price" type="number" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-none" />
                        <Input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="rounded-none" />
                      </div>
                      <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-none" />
                    </div>
                    <DialogFooter><Button data-testid="save-product" onClick={add} className="rounded-none">List Product</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <div key={p.id} className="bg-card p-4">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{p.category}</span>
                      <button data-testid={`del-prod-${p.id}`} onClick={() => del(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <h3 className="font-medium text-sm mt-1 leading-tight">{p.name}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-mono font-bold">₹{p.price.toLocaleString("en-IN")}</span>
                      <span className="text-xs text-muted-foreground">Stock: {p.stock}</span>
                    </div>
                  </div>
                ))}
                {products.length === 0 && <div className="bg-card p-8 col-span-full text-center text-muted-foreground text-sm">No products yet. Add your first listing.</div>}
              </div>
            </div>
          )}

          {active === "orders" && (
            <div className="bg-card border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Site / Architect</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
                <tbody>
                  {orders.map((o) => (
                    <Fragment key={o.id}>
                      <tr className="border-b border-border hover:bg-muted/50">
                        <td className="p-3 font-mono text-xs">{o.id}</td>
                        <td className="p-3">{o.user_email}</td>
                        <td className="p-3 text-xs">{o.site_location || o.address || "—"}{o.architect_name ? ` · ${o.architect_name}` : ""}</td>
                        <td className="p-3 font-mono">₹{o.total.toLocaleString("en-IN")}</td>
                        <td className="p-3"><span className={`text-xs font-mono px-2 py-0.5 ${o.status === "paid" ? "bg-solar/10 text-solar" : "bg-muted text-muted-foreground"}`}>{o.status}</span></td>
                        <td className="p-3"><button data-testid={`view-order-${o.id}`} onClick={() => setOpenOrder(openOrder === o.id ? null : o.id)} className="text-xs text-primary hover:underline">{openOrder === o.id ? "Hide" : "View"}</button></td>
                      </tr>
                      {openOrder === o.id && (
                        <tr data-testid={`order-details-${o.id}`} className="bg-muted/30 border-b border-border">
                          <td colSpan="6" className="p-4">
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Site Location</div><div className="font-medium mt-0.5 text-sm">{o.site_location || o.address || "—"}</div></div>
                              <div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Architect</div><div className="font-medium mt-0.5 text-sm">{o.architect_name || "—"}</div></div>
                              <div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Architect Phone</div><div className="font-medium mt-0.5 text-sm">{o.architect_phone || "—"}</div></div>
                              <div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Company</div><div className="font-medium mt-0.5 text-sm">{o.company_name || "—"}</div></div>
                            </div>
                            <div className="mt-4">
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Items</div>
                              <div className="space-y-1">
                                {o.items.map((it, i) => <div key={i} className="flex justify-between text-sm max-w-md"><span>{it.name} × {it.qty || 1}</span><span className="font-mono">₹{(it.price * (it.qty || 1)).toLocaleString("en-IN")}</span></div>)}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                  {orders.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-muted-foreground">No orders yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {active === "solar" && (
            <div>
              <div className="mb-5">
                <h2 className="font-display font-bold text-lg tracking-tight">Solar Component Brands</h2>
                <p className="text-sm text-muted-foreground mt-1">List your solar components with prices. Customers pick these in the Solar EPC estimator and your rates flow into their BOQ.</p>
              </div>
              <SolarCatalogManager scope="vendor" />
            </div>
          )}

          {active === "rfq" && <VendorRFQInbox />}

          {active === "wallet" && <WalletSection />}
          {active === "billing" && <BillingSection />}
        </>
      )}
    </DashboardLayout>
  );
}
