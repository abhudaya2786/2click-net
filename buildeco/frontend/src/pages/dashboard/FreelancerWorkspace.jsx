import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import DashboardLayout, { StatCard } from "@/components/dashboard/DashboardLayout";
import {
  LayoutDashboard, Briefcase, Inbox, FolderOpen, Loader2, Tag, Star, MapPin, ExternalLink,
  IndianRupee, Wallet, Compass, Ruler, HardHat, Calculator, Sun, Store, Gavel, ShoppingBag,
  FileText, Users, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WalletSection from "@/components/dashboard/WalletSection";

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "services", label: "My Services", icon: Briefcase },
  { id: "enquiries", label: "Enquiries", icon: Inbox },
  { id: "orders", label: "Orders", icon: IndianRupee },
  { id: "portfolio", label: "Portfolio", icon: FolderOpen },
  { id: "wallet", label: "Wallet", icon: Wallet },
];

// Category-wise (profession) personalization.
const PROFILES = {
  architect: {
    title: "Architect Studio", icon: Compass,
    tagline: "Design projects, drawings & client enquiries — your architecture workspace.",
    quick: [
      { to: "/solar", icon: Sun, label: "Solar EPC Designer", desc: "Size rooftop systems & generate BOQ" },
      { to: "/mart", icon: Store, label: "Super Mart Rates", desc: "Live material rates for specs & estimates" },
      { to: "/tenders", icon: Gavel, label: "Tender Hub", desc: "Find design & consultancy tenders" },
    ],
  },
  engineer: {
    title: "Engineer Desk", icon: Ruler,
    tagline: "Structural, MEP & site engineering — manage projects and enquiries.",
    quick: [
      { to: "/mart", icon: Calculator, label: "Material Estimator", desc: "Category & brand-wise rate calculator" },
      { to: "/solar", icon: Sun, label: "Solar Engineering", desc: "System sizing & 25-yr generation model" },
      { to: "/tenders", icon: Gavel, label: "Tender Hub", desc: "Bid on engineering scopes" },
    ],
  },
  ca: {
    title: "CA Practice", icon: Calculator,
    tagline: "Accounts, GST & compliance — track billing, wallet and client work.",
    quick: [
      { to: "/pricing", icon: FileText, label: "Plans & GST Invoices", desc: "Subscription & invoicing (18% GST)" },
      { to: "/marketplace", icon: ShoppingBag, label: "Marketplace", desc: "Vendor orders & GST-ready invoices" },
      { to: "/tenders", icon: Gavel, label: "Tender Hub", desc: "Financial & audit consultancy tenders" },
    ],
  },
  service_provider: {
    title: "Service Desk", icon: HardHat,
    tagline: "On-site services & installation — respond to enquiries and grow leads.",
    quick: [
      { to: "/mart", icon: Store, label: "Super Mart", desc: "Materials for your service jobs" },
      { to: "/solar", icon: Sun, label: "Solar Installs", desc: "Quote & install solar EPC systems" },
      { to: "/tenders", icon: Gavel, label: "Tender Hub", desc: "Service & AMC contracts" },
    ],
  },
  freelancer: {
    title: "Freelancer Hub", icon: Briefcase,
    tagline: "Your skills, services & enquiries — all in one workspace.",
    quick: [
      { to: "/marketplace", icon: ShoppingBag, label: "Marketplace", desc: "Source materials for your gigs" },
      { to: "/tenders", icon: Gavel, label: "Tender Hub", desc: "Find work across construction" },
      { to: "/services", icon: Users, label: "Explore Services", desc: "See where you fit on the platform" },
    ],
  },
};

export default function FreelancerWorkspace() {
  const [active, setActive] = useState("overview");
  const [session, setSession] = useState(null);
  const [enq, setEnq] = useState({ received: [], sent: [], unread: 0 });
  const [orders, setOrders] = useState({ as_freelancer: [], as_customer: [] });
  const [rates, setRates] = useState(null);
  const [orderForm, setOrderForm] = useState({});
  const [loading, setLoading] = useState(true);
  const seen = useRef(null);

  const loadEnq = useCallback(async () => {
    try {
      const { data } = await api.get("/freelancers/me/enquiries");
      if (seen.current) {
        (data.received || []).filter((e) => !seen.current.has(e.id)).forEach((e) =>
          toast.info(`New enquiry from ${e.from_name || "a client"}`, { description: (e.message || "").slice(0, 80) }));
      }
      seen.current = new Set((data.received || []).map((e) => e.id));
      setEnq(data);
    } catch { /* ignore poll errors */ }
  }, []);

  useEffect(() => {
    api.get("/auth/session").then((s) => setSession(s.data)).catch(() => {});
    api.get("/commission/freelancer-rates").then(({ data }) => setRates(data)).catch(() => {});
    api.get("/freelancers/me/orders").then(({ data }) => setOrders(data)).catch(() => {});
    loadEnq().finally(() => setLoading(false));
    const t = setInterval(loadEnq, 15000);
    return () => clearInterval(t);
  }, [loadEnq]);

  const createOrderFromEnquiry = async (eid) => {
    const f = orderForm[eid] || {};
    if (!f.amount || !f.service_name) { toast.error("Amount and service name required"); return; }
    try {
      await api.post(`/freelancers/enquiries/${eid}/create-order`, {
        amount: Number(f.amount),
        service_name: f.service_name,
        category: f.category || undefined,
        product_key: f.product_key || undefined,
      });
      toast.success("Order created — customer can pay");
      const { data } = await api.get("/freelancers/me/orders");
      setOrders(data);
      loadEnq();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    }
  };

  useEffect(() => {
    if (active !== "enquiries") return;
    (async () => {
      await loadEnq();                          // always fetch fresh when opening the tab
      try { await api.post("/freelancers/me/enquiries/mark-read"); } catch { /* ignore */ }
      setEnq((p) => ({ ...p, unread: 0 }));
    })();
  }, [active, loadEnq]);

  const nav = NAV.map((n) => (n.id === "enquiries" ? { ...n, badge: enq.unread } : n));

  const u = session?.user || {};
  const cats = session?.categories || [];
  const userType = session?.user_type || "freelancer";
  const profile = PROFILES[userType] || PROFILES.freelancer;
  const PIcon = profile.icon;

  return (
    <DashboardLayout nav={nav} active={active} setActive={setActive} title={profile.title}>
      {loading ? <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <>
          {active === "overview" && (
            <div className="space-y-6" data-testid="freelancer-overview">
              {/* profession banner */}
              <div data-testid="freelancer-profile-banner" className="border border-border bg-card p-6 flex items-start gap-4">
                <div className="h-12 w-12 bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <PIcon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display font-extrabold text-xl tracking-tight">{profile.title}</h2>
                    <span data-testid="freelancer-profession-tag" className="text-[10px] font-mono uppercase tracking-wider bg-solar/10 text-solar px-2 py-0.5">{userType.replace("_", " ")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{profile.tagline}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Tag} label="Categories" value={cats.length} />
                <StatCard icon={Inbox} label="Enquiries Received" value={enq.received.length} color="text-tender" />
                <StatCard icon={Briefcase} label="Skills" value={(u.skills || []).length} color="text-solar" />
                <StatCard icon={IndianRupee} label="Pricing" value={u.expected_pricing || "—"} />
              </div>

              {/* category-wise quick actions */}
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2.5">Recommended for you</div>
                <div className="grid gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-3">
                  {profile.quick.map((q) => (
                    <Link key={q.to} to={q.to} data-testid={`freelancer-quick-${q.to.replace("/", "")}`}
                      className="bg-card p-5 group hover:bg-accent transition-colors">
                      <div className="flex items-center justify-between">
                        <q.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div className="font-display font-bold text-sm mt-3">{q.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{q.desc}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {active === "services" && (
            <div className="grid lg:grid-cols-2 gap-px bg-border border border-border">
              <div className="bg-card p-6">
                <h3 className="font-display font-bold text-sm mb-4">Service Categories</h3>
                <div className="flex flex-wrap gap-1.5">
                  {cats.map((c) => (
                    <span key={c.id} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1">
                      {session?.primary_category?.id === c.id && <Star className="h-3 w-3 fill-current" />}{c.name}
                    </span>
                  ))}
                  {cats.length === 0 && <span className="text-sm text-muted-foreground">No categories.</span>}
                </div>
              </div>
              <div className="bg-card p-6">
                <h3 className="font-display font-bold text-sm mb-4">Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {(u.skills || []).map((s) => <span key={s} className="text-xs bg-muted px-2.5 py-1">{s}</span>)}
                  {(u.skills || []).length === 0 && <span className="text-sm text-muted-foreground">No skills listed.</span>}
                </div>
              </div>
            </div>
          )}

          {active === "enquiries" && (
            <div className="space-y-4">
              {rates && (
                <div className="text-xs text-muted-foreground border border-border bg-card p-3">
                  Platform commission: order default <strong>{rates.order_platform_percent}%</strong> — product/category rates apply when set.
                </div>
              )}
            <div className="bg-card border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-3">From</th><th className="p-3">Message</th><th className="p-3">Create order</th><th className="p-3">Date</th></tr></thead>
                <tbody>
                  {enq.received.map((e) => (
                    <tr key={e.id} className="border-b border-border hover:bg-muted/50 align-top">
                      <td className="p-3"><div className="font-medium">{e.from_name}</div><div className="text-xs text-muted-foreground font-mono">{e.from_email}</div></td>
                      <td className="p-3 max-w-xs"><div>{e.message}</div><div className="text-xs text-muted-foreground mt-1">{e.category || "—"}</div></td>
                      <td className="p-3 min-w-[220px]">
                        {e.status === "ordered" ? (
                          <span className="text-xs font-mono text-solar">Order created</span>
                        ) : (
                          <div className="space-y-1.5">
                            <Input placeholder="Service name" value={orderForm[e.id]?.service_name || ""} onChange={(ev) => setOrderForm({ ...orderForm, [e.id]: { ...orderForm[e.id], service_name: ev.target.value, category: e.category } })} className="rounded-none h-8 text-xs" />
                            <Input type="number" placeholder="Amount ₹" value={orderForm[e.id]?.amount || ""} onChange={(ev) => setOrderForm({ ...orderForm, [e.id]: { ...orderForm[e.id], amount: ev.target.value } })} className="rounded-none h-8 text-xs" />
                            <select value={orderForm[e.id]?.product_key || ""} onChange={(ev) => setOrderForm({ ...orderForm, [e.id]: { ...orderForm[e.id], product_key: ev.target.value } })} className="w-full h-8 border text-xs px-2">
                              <option value="">Product package (optional)</option>
                              {(rates?.per_product || []).map((p) => <option key={p.product_key} value={p.product_key}>{p.label} ({p.percent}%)</option>)}
                            </select>
                            <Button size="sm" onClick={() => createOrderFromEnquiry(e.id)} className="rounded-none h-8 w-full text-xs">Create order</Button>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(e.created_at).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                  {enq.received.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-muted-foreground">No enquiries yet.</td></tr>}
                </tbody>
              </table>
            </div>
            </div>
          )}

          {active === "orders" && (
            <div className="bg-card border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-3">Service</th><th className="p-3">Customer</th><th className="p-3">Amount</th><th className="p-3">Commission</th><th className="p-3">Your payout</th><th className="p-3">Status</th></tr></thead>
                <tbody>
                  {(orders.as_freelancer || []).map((o) => (
                    <tr key={o.id} className="border-b border-border">
                      <td className="p-3 font-medium">{o.service_name}</td>
                      <td className="p-3">{o.customer_name}</td>
                      <td className="p-3">₹{o.amount?.toLocaleString("en-IN")}</td>
                      <td className="p-3 text-muted-foreground">{o.commission_percent}% (₹{o.platform_commission})</td>
                      <td className="p-3 text-solar font-medium">₹{o.freelancer_payout?.toLocaleString("en-IN")}</td>
                      <td className="p-3"><span className="text-xs font-mono uppercase">{o.status}</span></td>
                    </tr>
                  ))}
                  {(orders.as_freelancer || []).length === 0 && <tr><td colSpan="6" className="p-8 text-center text-muted-foreground">No orders yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {active === "portfolio" && (
            <div className="bg-card border border-border p-6 max-w-lg space-y-4">
              <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary" />{u.service_area || "Service area not set"}</div>
              <div className="flex items-center gap-2 text-sm"><IndianRupee className="h-4 w-4 text-primary" />{u.expected_pricing || "Pricing not set"}</div>
              {u.portfolio_url ? (
                <a href={u.portfolio_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary">
                  <ExternalLink className="h-4 w-4" />{u.portfolio_url}</a>
              ) : <div className="text-sm text-muted-foreground">No portfolio URL added.</div>}
            </div>
          )}

          {active === "wallet" && <WalletSection />}
        </>
      )}
    </DashboardLayout>
  );
}
