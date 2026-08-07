import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HardHat, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { setSession } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const { data } = await api.post("/auth/login", form);
      setSession(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}`);
      nav("/dashboard");
    } catch (e2) {
      setErr(formatApiErrorDetail(e2.response?.data?.detail) || e2.message);
    } finally { setBusy(false); }
  };

  const google = () => {
    const redirectUrl = window.location.origin + "/dashboard";
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const demo = (email) => setForm({ email, password: email.includes("abbhu") ? "Admin@12345" : "Demo@12345" });

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:block relative bg-slate-950">
        <div className="absolute inset-0 grid-lines opacity-20" />
        <div className="relative h-full flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-primary flex items-center justify-center"><HardHat className="h-5 w-5" strokeWidth={1.75} /></div>
            <span className="font-display font-extrabold text-lg tracking-tight">2click.in</span>
          </Link>
          <div>
            <h2 className="font-display font-extrabold text-4xl tracking-tight leading-tight">The operating system for<br />India's construction economy.</h2>
            <p className="mt-4 text-slate-400 max-w-md">Tenders, marketplace, ERP, solar and AI — unified in one enterprise platform.</p>
          </div>
          <p className="text-xs font-mono text-slate-500">ISO 27001 · GST Ready · SOC 2</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <h1 className="font-display font-extrabold text-3xl tracking-tight">Log in</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back. Enter your credentials.</p>
          {err && <div data-testid="login-error" className="mt-4 text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">{err}</div>}
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Input data-testid="login-email" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-none" />
            <Input data-testid="login-password" type="password" placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-none" />
            <Button data-testid="login-submit" type="submit" disabled={busy} className="w-full rounded-none">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
            </Button>
          </form>
          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />OR<div className="h-px flex-1 bg-border" /></div>
          <Button data-testid="login-google" variant="outline" onClick={google} className="w-full rounded-none">Continue with Google</Button>
          <p className="text-sm text-muted-foreground mt-6">No account? <Link to="/register" className="text-primary font-medium">Sign up</Link></p>
          <div className="mt-6 border border-border p-3 text-xs">
            <p className="font-medium mb-2 text-muted-foreground">Demo accounts (click to fill):</p>
            <div className="grid grid-cols-2 gap-1.5 font-mono">
              {["abbhuadaya@gmail.com","vendor@2click.in","customer@2click.in","contractor@2click.in"].map((e) => (
                <button key={e} type="button" data-testid={`demo-${e.split("@")[0]}`} onClick={() => demo(e)} className="text-left text-primary hover:underline truncate">{e}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
