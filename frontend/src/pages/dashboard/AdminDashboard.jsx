import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import DashboardLayout, { StatCard } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, ScrollText, IndianRupee, Package, Gavel, Trash2, Loader2, ShieldCheck } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "Users & Roles", icon: Users },
  { id: "audit", label: "Audit Logs", icon: ScrollText },
];
const COLORS = ["#FF5A1F", "#10B981", "#3B82F6"];
const ROLES = ["super_admin", "vendor", "customer", "contractor"];

export default function AdminDashboard() {
  const [active, setActive] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [a, u, l] = await Promise.all([api.get("/admin/analytics"), api.get("/admin/users"), api.get("/admin/audit")]);
    setStats(a.data); setUsers(u.data); setLogs(l.data); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const changeRole = async (id, role) => { await api.patch(`/admin/users/${id}/role`, { role }); toast.success("Role updated"); load(); };
  const verifyKyc = async (id) => { await api.patch(`/admin/users/${id}/kyc`, { status: "verified" }); toast.success("KYC verified"); load(); };
  const del = async (id) => { await api.delete(`/admin/users/${id}`); toast.success("User removed"); load(); };

  return (
    <DashboardLayout nav={NAV} active={active} setActive={setActive} title="Super Admin Panel">
      {loading || !stats ? <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <>
          {active === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${(stats.revenue/1000).toFixed(1)}K`} />
                <StatCard icon={Users} label="Total Users" value={stats.total_users} color="text-tender" />
                <StatCard icon={Package} label="Products" value={stats.products} color="text-solar" />
                <StatCard icon={Gavel} label="Tenders" value={stats.tenders} color="text-tender" />
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 bg-card border border-border p-5">
                  <h3 className="font-display font-bold text-sm tracking-tight mb-4">User distribution by role</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={stats.by_role}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 0 }} />
                      <Bar dataKey="value" fill="#FF5A1F" radius={[2,2,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-card border border-border p-5">
                  <h3 className="font-display font-bold text-sm tracking-tight mb-4">Composition</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={stats.by_role} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                        {stats.by_role.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 0 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {active === "users" && (
            <div className="bg-card border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">KYC</th><th className="p-3">Actions</th>
                </tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} data-testid={`user-row-${u.id}`} className="border-b border-border hover:bg-muted/50">
                      <td className="p-3 font-medium">{u.name}</td>
                      <td className="p-3 text-muted-foreground font-mono text-xs">{u.email}</td>
                      <td className="p-3">
                        <select data-testid={`role-select-${u.id}`} value={u.role} onChange={(e) => changeRole(u.id, e.target.value)}
                          className="bg-background border border-input px-2 py-1 text-xs">
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className="p-3"><span className={`text-xs font-mono px-2 py-0.5 ${u.kyc_status === "verified" ? "bg-solar/10 text-solar" : "bg-muted text-muted-foreground"}`}>{u.kyc_status}</span></td>
                      <td className="p-3 flex gap-1.5">
                        {u.kyc_status !== "verified" && <button onClick={() => verifyKyc(u.id)} className="h-7 w-7 flex items-center justify-center border border-border hover:bg-accent" title="Verify KYC"><ShieldCheck className="h-3.5 w-3.5 text-solar" /></button>}
                        <button data-testid={`del-user-${u.id}`} onClick={() => del(u.id)} className="h-7 w-7 flex items-center justify-center border border-border hover:bg-destructive hover:text-white"><Trash2 className="h-3.5 w-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {active === "audit" && (
            <div className="bg-card border border-border divide-y divide-border">
              {logs.map((l) => (
                <div key={l.id} className="p-3 flex items-center gap-4 text-sm hover:bg-muted/50">
                  <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5">{l.action}</span>
                  <span className="text-muted-foreground">{l.user_email || "system"}</span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString("en-IN")}</span>
                </div>
              ))}
              {logs.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">No activity yet.</div>}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
