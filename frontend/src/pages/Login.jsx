import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HardHat, Loader2, ArrowLeft, ShieldCheck, Gavel, Store, Sun, Building2, Bot } from "lucide-react";
import { toast } from "sonner";

const MODULES = [
  { icon: Gavel, label: "Tender Bidding" },
  { icon: Store, label: "Marketplace" },
  { icon: Sun, label: "Solar EPC" },
  { icon: Building2, label: "Construction ERP" },
  { icon: Bot, label: "AI Assistant" },
];

export default function Login() {
  const { setSession } = useAuth();
  const nav = useNavigate();
  const [stage, setStage] = useState("login"); // login | otp | forgot
  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const finish = (data) => {
    setSession(data.token, data.user);
    toast.success(`Welcome back, ${data.user.name}`);
    nav("/dashboard");
  };

  const doLogin = async (creds) => {
    setBusy(true); setErr("");
    try {
      const { data } = await api.post("/auth/login", creds);
      if (data.requires_otp) {
        setOtpEmail(data.email);
        setStage("otp");
        toast.info("We emailed you a 6-digit login code");
      } else {
        finish(data);
      }
    } catch (e2) {
      setErr(formatApiErrorDetail(e2.response?.data?.detail) || e2.message);
    } finally { setBusy(false); }
  };

  const submit = (e) => { e.preventDefault(); doLogin(form); };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const { data } = await api.post("/auth/otp/verify", { email: otpEmail, code: otp });
      finish(data);
    } catch (e2) {
      setErr(formatApiErrorDetail(e2.response?.data?.detail) || e2.message);
    } finally { setBusy(false); }
  };

  const resendOtp = async () => {
    try { await api.post("/auth/otp/resend", { email: otpEmail }); toast.success("Code re-sent"); }
    catch { toast.error("Could not resend"); }
  };

  const sendReset = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      await api.post("/auth/forgot-password", { email: forgotEmail, origin: window.location.origin });
      setForgotSent(true);
    } catch (e2) {
      setErr(formatApiErrorDetail(e2.response?.data?.detail) || e2.message);
    } finally { setBusy(false); }
  };

  const google = () => {
    const redirectUrl = window.location.origin + "/dashboard";
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const demo = (email) => setForm({ email, password: "Demo@12345" });

  return (
    <div className="min-h-screen grid lg:grid-cols-2 mobile-app-shell">
      <div className="lg:hidden sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur px-4 h-14 flex items-center">
        <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          2click.in
        </Link>
      </div>
      <div className="hidden lg:block relative bg-slate-950">
        <div className="absolute inset-0 grid-lines opacity-20" />
        <div className="relative h-full flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-primary flex items-center justify-center"><HardHat className="h-5 w-5" strokeWidth={1.75} /></div>
            <span className="font-display font-extrabold text-lg tracking-tight">2click.in</span>
          </Link>
          <div>
            <h2 className="font-display font-extrabold text-4xl tracking-tight leading-tight">SaaS + ERP + Marketing<br />+ Solar + Bidding</h2>
            <p className="mt-4 text-slate-400 max-w-md">एक login — tenders, marketplace, solar calculator, construction ERP और AI। India's construction super-app।</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {MODULES.map((m) => (
                <span key={m.label} className="inline-flex items-center gap-1.5 text-xs bg-white/10 border border-white/15 px-3 py-1.5 rounded-full">
                  <m.icon className="h-3.5 w-3.5 text-primary" />
                  {m.label}
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs font-mono text-slate-500">ISO 27001 · GST Ready · SOC 2</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          {err && <div data-testid="login-error" className="mb-4 text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">{err}</div>}

          {stage === "login" && (
            <>
              <h1 data-testid="login-title" className="font-display font-extrabold text-3xl tracking-tight select-none cursor-default">Log in</h1>
              <p className="text-sm text-muted-foreground mt-1">Welcome back. Enter your credentials.</p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <Input data-testid="login-email" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-none" />
                <Input data-testid="login-password" type="password" placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-none" />
                <div className="text-right -mt-1">
                  <button type="button" data-testid="forgot-password-link" onClick={() => { setStage("forgot"); setErr(""); setForgotSent(false); setForgotEmail(form.email); }} className="text-xs text-primary hover:underline">Forgot password?</button>
                </div>
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
                  {["vendor@2click.in","customer@2click.in","contractor@2click.in"].map((e) => (
                    <button key={e} type="button" data-testid={`demo-${e.split("@")[0]}`} onClick={() => demo(e)} className="text-left text-primary hover:underline truncate">{e}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {stage === "otp" && (
            <>
              <div className="flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-primary" /><h1 className="font-display font-extrabold text-3xl tracking-tight">Verify it's you</h1></div>
              <p className="text-sm text-muted-foreground mt-1">Enter the 6-digit code we emailed to <span className="font-mono">{otpEmail}</span>.</p>
              <form onSubmit={verifyOtp} className="mt-6 space-y-4">
                <Input data-testid="otp-code" inputMode="numeric" maxLength={6} placeholder="______" required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} className="rounded-none tracking-[0.5em] text-center font-mono text-lg" />
                <Button data-testid="otp-submit" type="submit" disabled={busy} className="w-full rounded-none">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & continue"}
                </Button>
              </form>
              <div className="mt-4 flex items-center justify-between text-xs">
                <button type="button" onClick={() => { setStage("login"); setErr(""); setOtp(""); }} className="text-muted-foreground hover:underline flex items-center gap-1"><ArrowLeft className="h-3 w-3" />Back</button>
                <button type="button" data-testid="otp-resend" onClick={resendOtp} className="text-primary hover:underline">Resend code</button>
              </div>
            </>
          )}

          {stage === "forgot" && (
            <>
              <h1 className="font-display font-extrabold text-3xl tracking-tight">Reset password</h1>
              {forgotSent ? (
                <div data-testid="forgot-sent" className="mt-4 text-sm border border-border bg-muted/40 px-3 py-3">
                  If an account exists for <span className="font-mono">{forgotEmail}</span>, a reset link has been emailed. Check your inbox (and spam).
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mt-1">Enter your email and we'll send a reset link.</p>
                  <form onSubmit={sendReset} className="mt-6 space-y-4">
                    <Input data-testid="forgot-email" type="email" placeholder="Email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="rounded-none" />
                    <Button data-testid="forgot-submit" type="submit" disabled={busy} className="w-full rounded-none">
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
                    </Button>
                  </form>
                </>
              )}
              <button type="button" onClick={() => { setStage("login"); setErr(""); }} className="mt-4 text-xs text-muted-foreground hover:underline flex items-center gap-1"><ArrowLeft className="h-3 w-3" />Back to log in</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
