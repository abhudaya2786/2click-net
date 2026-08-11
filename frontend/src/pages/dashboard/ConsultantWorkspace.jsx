import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import DashboardLayout, { StatCard } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  LayoutDashboard, UserCircle, Inbox, IndianRupee, Wallet, Loader2,
  Building2, Sofa, Compass, Ruler, Leaf, Briefcase, Star, Save,
} from "lucide-react";
import WalletSection from "@/components/dashboard/WalletSection";

const ROLE_ICONS = {
  exterior: Building2, interior: Sofa, architect: Compass, vastu: Compass,
  structural: Ruler, landscape: Leaf,
};

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "Consultant Profile", icon: UserCircle },
  { id: "enquiries", label: "Enquiries", icon: Inbox },
  { id: "orders", label: "Orders", icon: IndianRupee },
  { id: "wallet", label: "Wallet", icon: Wallet },
];

export default function ConsultantWorkspace() {
  const { user } = useAuth();
  const [active, setActive] = useState("overview");
  const [meta, setMeta] = useState({ roles: [], experience_levels: [] });
  const [profile, setProfile] = useState(null);
  const [enq, setEnq] = useState({ received: [], sent: [], unread: 0 });
  const [orders, setOrders] = useState({ as_freelancer: [], as_customer: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const seen = useRef(null);

  const [form, setForm] = useState({
    consultant_role: "interior",
    experience_years: 5,
    title: "",
    bio: "",
    specializations: "",
    projects_completed: 0,
    service_area: "",
    expected_pricing: "",
    portfolio_url: "",
    availability: "",
  });

  const loadEnq = useCallback(async () => {
    try {
      const { data } = await api.get("/freelancers/me/enquiries");
      if (seen.current) {
        (data.received || []).filter((e) => !seen.current.has(e.id)).forEach((e) =>
          toast.info(`New enquiry from ${e.from_name || "client"}`));
      }
      seen.current = new Set((data.received || []).map((e) => e.id));
      setEnq(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    Promise.all([
      api.get("/consultants/meta"),
      api.get("/consultants/me/profile"),
      api.get("/freelancers/me/orders").catch(() => ({ data: { as_freelancer: [], as_customer: [] } })),
    ]).then(([m, p, o]) => {
      setMeta(m.data);
      setProfile(p.data);
      setOrders(o.data);
      if (p.data?.has_profile) {
        setForm({
          consultant_role: p.data.consultant_role || "interior",
          experience_years: p.data.experience_years || 0,
          title: p.data.title || "",
          bio: p.data.bio || "",
          specializations: (p.data.specializations || []).join(", "),
          projects_completed: p.data.projects_completed || 0,
          service_area: p.data.service_area || "",
          expected_pricing: p.data.expected_pricing || "",
          portfolio_url: p.data.portfolio_url || "",
          availability: p.data.availability || "",
        });
      }
    }).finally(() => setLoading(false));
    loadEnq();
    const t = setInterval(loadEnq, 15000);
    return () => clearInterval(t);
  }, [loadEnq]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put("/consultants/me/profile", {
        consultant_role: form.consultant_role,
        experience_years: Number(form.experience_years),
        title: form.title || null,
        bio: form.bio || null,
        specializations: form.specializations ? form.specializations.split(",").map((s) => s.trim()).filter(Boolean) : [],
        projects_completed: Number(form.projects_completed) || 0,
        service_area: form.service_area || null,
        expected_pricing: form.expected_pricing || null,
        portfolio_url: form.portfolio_url || null,
        availability: form.availability || null,
      });
      const { data } = await api.get("/consultants/me/profile");
      setProfile(data);
      toast.success("Consultant profile saved — visible on Consultant Panel");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const roleInfo = meta.roles?.find((r) => r.id === (profile?.consultant_role || form.consultant_role));
  const levelInfo = meta.experience_levels?.find((l) => l.id === profile?.experience_level);
  const Icon = ROLE_ICONS[profile?.consultant_role || form.consultant_role] || Briefcase;
  const navItems = NAV.map((n) => (n.id === "enquiries" ? { ...n, badge: enq.unread } : n));

  if (loading) {
    return (
      <DashboardLayout nav={navItems} active={active} setActive={setActive} title="Consultant Panel">
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout nav={navItems} active={active} setActive={setActive} title="Consultant Panel">
      {active === "overview" && (
        <div className="space-y-6" data-testid="consultant-overview">
          <div className="border border-border bg-card p-6 rounded-xl flex items-start gap-4">
            <div className="h-12 w-12 bg-primary/10 text-primary flex items-center justify-center rounded-lg shrink-0">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-xl">{user?.name}</h2>
              {profile?.has_profile ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs font-mono uppercase bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {roleInfo?.name || profile.consultant_role}
                  </span>
                  <span className="text-xs font-mono uppercase bg-muted px-2 py-0.5 rounded">
                    {profile.experience_years} yrs · {levelInfo?.label || profile.experience_level}
                  </span>
                  {profile.verified && <span className="text-xs text-solar">Verified</span>}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">
                  Complete your consultant profile to appear on the public panel.
                </p>
              )}
              {profile?.bio && <p className="text-sm text-muted-foreground mt-3 max-w-2xl">{profile.bio}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Inbox} label="Enquiries" value={enq.received.length} color="text-tender" />
            <StatCard icon={IndianRupee} label="Orders" value={orders.as_freelancer?.length || 0} />
            <StatCard icon={Briefcase} label="Projects done" value={profile?.projects_completed || 0} color="text-solar" />
            <StatCard icon={Star} label="Rating" value={user?.rating || "4.6"} />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link to="/consultants" className="border border-border rounded-xl p-4 hover:border-primary/40 bg-card">
              <div className="font-display font-bold text-sm">Public Consultant Panel</div>
              <div className="text-xs text-muted-foreground mt-1">See how clients find you</div>
            </Link>
            <Link to="/interior-boq" className="border border-border rounded-xl p-4 hover:border-primary/40 bg-card">
              <div className="font-display font-bold text-sm">Interior BOQ Calculator</div>
              <div className="text-xs text-muted-foreground mt-1">Brand-wise estimates for clients</div>
            </Link>
            <Link to="/mart" className="border border-border rounded-xl p-4 hover:border-primary/40 bg-card">
              <div className="font-display font-bold text-sm">Super Mart Rates</div>
              <div className="text-xs text-muted-foreground mt-1">Live material pricing</div>
            </Link>
          </div>
        </div>
      )}

      {active === "profile" && (
        <div className="max-w-xl space-y-4" data-testid="consultant-profile-form">
          <h3 className="font-display font-bold text-lg">Consultant profile</h3>
          <p className="text-sm text-muted-foreground">Role and experience shown on the public consultant panel.</p>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Consultant role</label>
            <select
              data-testid="consultant-role-select"
              value={form.consultant_role}
              onChange={(e) => setForm({ ...form, consultant_role: e.target.value })}
              className="w-full bg-background border border-input px-3 h-10 text-sm rounded-lg"
            >
              {meta.roles?.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Experience (years)</label>
            <Input
              data-testid="experience-years"
              type="number"
              min={0}
              max={60}
              value={form.experience_years}
              onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
              className="rounded-lg"
            />
          </div>
          <Input placeholder="Professional title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-lg" />
          <Textarea placeholder="Bio — your expertise and services" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} className="rounded-lg" />
          <Input placeholder="Specializations (comma separated)" value={form.specializations} onChange={(e) => setForm({ ...form, specializations: e.target.value })} className="rounded-lg" />
          <Input placeholder="Service area / city" value={form.service_area} onChange={(e) => setForm({ ...form, service_area: e.target.value })} className="rounded-lg" />
          <Input placeholder="Expected pricing (e.g. ₹500/sqft)" value={form.expected_pricing} onChange={(e) => setForm({ ...form, expected_pricing: e.target.value })} className="rounded-lg" />
          <Input placeholder="Portfolio URL" value={form.portfolio_url} onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })} className="rounded-lg" />
          <Input placeholder="Availability" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className="rounded-lg" />
          <Input type="number" placeholder="Projects completed" value={form.projects_completed} onChange={(e) => setForm({ ...form, projects_completed: e.target.value })} className="rounded-lg" />
          <Button data-testid="save-consultant-profile" onClick={saveProfile} disabled={saving} className="rounded-lg w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1.5" />Save & publish profile</>}
          </Button>
        </div>
      )}

      {active === "enquiries" && (
        <div className="space-y-3">
          {enq.received.length === 0 && <p className="text-sm text-muted-foreground">No enquiries yet.</p>}
          {enq.received.map((e) => (
            <div key={e.id} className="border border-border rounded-xl p-4 bg-card">
              <div className="font-medium text-sm">{e.from_name || "Client"}</div>
              <p className="text-sm text-muted-foreground mt-1">{e.message}</p>
              <div className="text-[10px] font-mono text-muted-foreground mt-2">{e.created_at}</div>
            </div>
          ))}
        </div>
      )}

      {active === "orders" && (
        <div className="space-y-3">
          {(orders.as_freelancer || []).length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
          {(orders.as_freelancer || []).map((o) => (
            <div key={o.id} className="border border-border rounded-xl p-4 bg-card flex justify-between gap-4">
              <div>
                <div className="font-medium">{o.service_name}</div>
                <div className="text-xs text-muted-foreground">{o.customer_name}</div>
              </div>
              <div className="font-mono font-bold">₹{o.amount?.toLocaleString("en-IN")}</div>
            </div>
          ))}
        </div>
      )}

      {active === "wallet" && <WalletSection />}
    </DashboardLayout>
  );
}
