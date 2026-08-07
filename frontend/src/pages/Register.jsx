import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useBranding } from "@/context/BrandingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HardHat, Loader2, Store, User, Building2 } from "lucide-react";
import { toast } from "sonner";

const ROLES = [
  { id: "customer", label: "Buyer / Customer", icon: User, desc: "Procure materials & post tenders" },
  { id: "vendor", label: "Vendor / Supplier", icon: Store, desc: "Sell products & bid on tenders" },
  { id: "contractor", label: "Contractor", icon: Building2, desc: "Manage projects, BOQ & DPR" },
];

export default function Register() {
  const { setSession } = useAuth();
  const { brand_name } = useBranding();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer", company: "", business_type: "", primary_category: "", interests: [] });
  const [cats, setCats] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get("/categories", { params: { type: "service" } }).then(({ data }) => setCats(data)); }, []);

  const toggleInterest = (name) => setForm((f) => ({ ...f, interests: f.interests.includes(name) ? f.interests.filter((x) => x !== name) : [...f.interests, name] }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const { data } = await api.post("/auth/register", form);
      setSession(data.token, data.user);
      toast.success("Account created!");
      nav("/dashboard");
    } catch (e2) {
      setErr(formatApiErrorDetail(e2.response?.data?.detail) || e2.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-12 bg-background">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2.5 mb-8">
          <div className="h-9 w-9 bg-primary flex items-center justify-center"><HardHat className="h-5 w-5 text-white" strokeWidth={1.75} /></div>
          <span className="font-display font-extrabold text-lg tracking-tight">{brand_name}</span>
        </Link>
        <h1 className="font-display font-extrabold text-3xl tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose your role to get a tailored workspace.</p>
        {err && <div data-testid="register-error" className="mt-4 text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">{err}</div>}

        <div className="grid grid-cols-3 gap-px bg-border border border-border mt-6">
          {ROLES.map((r) => (
            <button key={r.id} type="button" data-testid={`role-${r.id}`} onClick={() => setForm({ ...form, role: r.id })}
              className={`p-4 text-left transition-colors ${form.role === r.id ? "bg-primary text-white" : "bg-card hover:bg-accent/40"}`}>
              <r.icon className="h-5 w-5 mb-2" strokeWidth={1.5} />
              <div className="text-xs font-bold leading-tight">{r.label}</div>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">{ROLES.find((r) => r.id === form.role)?.desc}</p>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <Input data-testid="register-name" placeholder="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-none" />
          {form.role !== "customer" && (
            <Input data-testid="register-company" placeholder="Company name" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="rounded-none" />
          )}
          {form.role !== "customer" && (
            <Input data-testid="register-business-type" placeholder="Business type (e.g. Steel supplier, EPC)" value={form.business_type} onChange={(e) => setForm({ ...form, business_type: e.target.value })} className="rounded-none" />
          )}
          <div>
            <label className="text-sm font-medium mb-2 block">Your interests <span className="text-muted-foreground font-normal">(personalizes your workspace)</span></label>
            <div className="flex flex-wrap gap-1.5" data-testid="register-interests">
              {cats.map((c) => (
                <button key={c.id} type="button" data-testid={`interest-${c.slug}`} onClick={() => toggleInterest(c.name)}
                  className={`text-xs px-2.5 py-1 border transition-colors ${form.interests.includes(c.name) ? "bg-primary text-white border-primary" : "border-border hover:border-primary"}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <Input data-testid="register-email" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-none" />
          <Input data-testid="register-password" type="password" placeholder="Password (min 6 chars)" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-none" />
          <Button data-testid="register-submit" type="submit" disabled={busy} className="w-full rounded-none">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground mt-6">Already have an account? <Link to="/login" className="text-primary font-medium">Log in</Link></p>
      </div>
    </div>
  );
}
