import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import DashboardLayout, { StatCard } from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Briefcase, Inbox, FolderOpen, Loader2, Tag, Star, MapPin, ExternalLink, IndianRupee, Wallet } from "lucide-react";
import WalletSection from "@/components/dashboard/WalletSection";

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "services", label: "My Services", icon: Briefcase },
  { id: "enquiries", label: "Enquiries", icon: Inbox },
  { id: "portfolio", label: "Portfolio", icon: FolderOpen },
  { id: "wallet", label: "Wallet", icon: Wallet },
];

export default function FreelancerWorkspace() {
  const [active, setActive] = useState("overview");
  const [session, setSession] = useState(null);
  const [enq, setEnq] = useState({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/auth/session"), api.get("/freelancers/me/enquiries")])
      .then(([s, e]) => { setSession(s.data); setEnq(e.data); })
      .finally(() => setLoading(false));
  }, []);

  const u = session?.user || {};
  const cats = session?.categories || [];

  return (
    <DashboardLayout nav={NAV} active={active} setActive={setActive} title="Freelancer Workspace">
      {loading ? <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <>
          {active === "overview" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Tag} label="Categories" value={cats.length} />
              <StatCard icon={Inbox} label="Enquiries Received" value={enq.received.length} color="text-tender" />
              <StatCard icon={Briefcase} label="Skills" value={(u.skills || []).length} color="text-solar" />
              <StatCard icon={IndianRupee} label="Pricing" value={u.expected_pricing || "—"} />
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
            <div className="bg-card border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-3">From</th><th className="p-3">Message</th><th className="p-3">Category</th><th className="p-3">Date</th></tr></thead>
                <tbody>
                  {enq.received.map((e) => (
                    <tr key={e.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-3"><div className="font-medium">{e.from_name}</div><div className="text-xs text-muted-foreground font-mono">{e.from_email}</div></td>
                      <td className="p-3 max-w-md">{e.message}</td>
                      <td className="p-3">{e.category || "—"}</td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(e.created_at).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                  {enq.received.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-muted-foreground">No enquiries yet.</td></tr>}
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
