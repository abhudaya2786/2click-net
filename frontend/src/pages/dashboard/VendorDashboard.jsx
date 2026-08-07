import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import DashboardLayout, { StatCard } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { LayoutDashboard, Package, ShoppingBag, Plus, Trash2, Loader2, IndianRupee, Boxes, Star } from "lucide-react";
import { toast } from "sonner";

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "My Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
];
const EMPTY = { name: "", category: "Steel & TMT", price: "", unit: "unit", stock: "", description: "", image: "https://images.unsplash.com/photo-1763926062529-1edf8664c366?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" };

export default function VendorDashboard() {
  const [active, setActive] = useState("overview");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
                  <th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Total</th><th className="p-3">Status</th></tr></thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-3 font-mono text-xs">{o.id}</td>
                      <td className="p-3">{o.user_email}</td>
                      <td className="p-3 font-mono">₹{o.total.toLocaleString("en-IN")}</td>
                      <td className="p-3"><span className={`text-xs font-mono px-2 py-0.5 ${o.status === "paid" ? "bg-solar/10 text-solar" : "bg-muted text-muted-foreground"}`}>{o.status}</span></td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-muted-foreground">No orders yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
