import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HardHat, Loader2, ArrowLeft, ShieldCheck, Languages, ChevronRight, LogIn,
} from "lucide-react";
import { toast } from "sonner";
import { LOGIN_PROFILES } from "@/lib/loginProfiles";
import { useDemoMode } from "@/context/DemoModeContext";

const PUBLIC_LOGIN_PROFILES = LOGIN_PROFILES.filter((p) => p.id !== "admin");

function getPublicProfile(id) {
  return PUBLIC_LOGIN_PROFILES.find((p) => p.id === id) || PUBLIC_LOGIN_PROFILES[0];
}

export default function Login() {
  const { setSession } = useAuth();
  const nav = useNavigate();
  const [lang, setLang] = useState(() => localStorage.getItem("bs_lang") || "en");
  const [profileId, setProfileId] = useState("customer");
  const [stage, setStage] = useState("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const profile = getPublicProfile(profileId);
  const hi = lang === "hi";
  const { openPanel } = useDemoMode();
  const t = (en, h) => (hi ? h : en);

  const toggleLang = () => {
    const n = lang === "en" ? "hi" : "en";
    localStorage.setItem("bs_lang", n);
    setLang(n);
  };

  const finish = (data) => {
    setSession(data.token, data.user);
    toast.success(t(`Welcome back, ${data.user.name}`, `स्वागत है, ${data.user.name}`));
    nav("/dashboard");
  };

  const doLogin = async (creds) => {
    setBusy(true);
    setErr("");
    try {
      const { data } = await api.post("/auth/login", creds);
      if (data.requires_otp) {
        setOtpEmail(data.email);
        setStage("otp");
        toast.info(t("We emailed you a 6-digit code", "हमने 6 अंकों का कोड ईमेल किया"));
      } else {
        finish(data);
      }
    } catch (e2) {
      setErr(formatApiErrorDetail(e2.response?.data?.detail) || e2.message);
    } finally {
      setBusy(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    doLogin(form);
  };

  const demoLogin = () => {
    if (!profile.demo) return;
    const creds = { email: profile.demo.email, password: profile.demo.password };
    setForm(creds);
    doLogin(creds);
  };

  const selectProfile = (id) => {
    setProfileId(id);
    const p = getPublicProfile(id);
    if (p.demo) setForm({ email: p.demo.email, password: p.demo.password });
    else setForm({ email: "", password: "" });
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const { data } = await api.post("/auth/otp/verify", { email: otpEmail, code: otp });
      finish(data);
    } catch (e2) {
      setErr(formatApiErrorDetail(e2.response?.data?.detail) || e2.message);
    } finally {
      setBusy(false);
    }
  };

  const resendOtp = async () => {
    try {
      await api.post("/auth/otp/resend", { email: otpEmail });
      toast.success(t("Code re-sent", "कोड फिर भेजा गया"));
    } catch {
      toast.error(t("Could not resend", "भेज नहीं हो पाया"));
    }
  };

  const sendReset = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await api.post("/auth/forgot-password", { email: forgotEmail, origin: window.location.origin });
      setForgotSent(true);
    } catch (e2) {
      setErr(formatApiErrorDetail(e2.response?.data?.detail) || e2.message);
    } finally {
      setBusy(false);
    }
  };

  const google = () => {
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const Icon = profile.icon;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — role-specific panel */}
      <div className="hidden lg:flex relative bg-slate-950 flex-col">
        <div className="absolute inset-0 grid-lines opacity-20" />
        <div className="relative flex flex-col h-full p-10 xl:p-12 text-white">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-primary flex items-center justify-center rounded-lg">
              <HardHat className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight">2click.in</span>
          </Link>

          <div className="flex-1 flex flex-col justify-center py-10">
            <div className={`inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest border px-3 py-1.5 rounded-full w-fit mb-6 ${profile.bg}`}>
              <Icon className={`h-3.5 w-3.5 ${profile.color}`} />
              {hi ? profile.labelHi : profile.label}
            </div>
            <h2 className="font-display font-extrabold text-3xl xl:text-4xl tracking-tight leading-tight">
              {hi ? profile.subtitleHi : profile.subtitle}
            </h2>
            <p className="mt-3 text-slate-400 text-sm">
              {t("After login you will see:", "लॉगिन के बाद आपको मिलेगा:")}{" "}
              <span className="text-white font-medium">{profile.dashboard}</span>
            </p>
            <ul className="mt-8 space-y-3">
              {profile.features.map((f) => (
                <li key={f.en} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="h-8 w-8 shrink-0 bg-white/10 flex items-center justify-center rounded-lg">
                    <f.icon className={`h-4 w-4 ${profile.color}`} />
                  </span>
                  <span className="pt-1.5">{hi ? f.hi : f.en}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs font-mono text-slate-500">ISO 27001 · GST Ready · Made in India</p>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border lg:border-0">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <div className="h-8 w-8 bg-primary flex items-center justify-center rounded-lg">
              <HardHat className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-sm">2click.in</span>
          </Link>
          <button
            type="button"
            onClick={toggleLang}
            data-testid="login-lang-toggle"
            className="ml-auto flex items-center gap-1.5 text-xs font-mono border border-border px-2.5 py-1.5 rounded-lg hover:bg-accent"
          >
            <Languages className="h-3.5 w-3.5" />
            {hi ? "EN" : "हि"}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md">
            {stage === "login" && <AuthTabs active="login" registerTo={`/register?type=${profileId}`} />}
            {stage === "login" && (
              <>
                <h1 data-testid="login-title" className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">
                  {t("Log in", "लॉग इन")}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("Choose your role, then sign in", "अपनी भूमिका चुनें, फिर लॉग इन करें")}
                </p>

                {/* Role selector */}
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2" data-testid="login-role-grid">
                  {PUBLIC_LOGIN_PROFILES.map((p) => {
                    const PIcon = p.icon;
                    const active = profileId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        data-testid={`login-role-${p.id}`}
                        onClick={() => selectProfile(p.id)}
                        className={`text-left p-3 border transition-all rounded-lg ${
                          active ? `${p.bg} ring-2 ring-primary ring-offset-1` : "border-border hover:bg-accent/50"
                        }`}
                      >
                        <PIcon className={`h-5 w-5 mb-1.5 ${active ? p.color : "text-muted-foreground"}`} />
                        <div className="text-xs font-semibold leading-tight">{hi ? p.labelHi : p.label}</div>
                      </button>
                    );
                  })}
                </div>

                {err && (
                  <div data-testid="login-error" className="mt-4 text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">
                    {err}
                  </div>
                )}

                <form onSubmit={submit} className="mt-5 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("Email", "ईमेल")}</label>
                    <Input
                      data-testid="login-email"
                      type="email"
                      placeholder="you@company.com"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="rounded-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("Password", "पासवर्ड")}</label>
                    <Input
                      data-testid="login-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="rounded-none"
                    />
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      data-testid="forgot-password-link"
                      onClick={() => { setStage("forgot"); setErr(""); setForgotSent(false); setForgotEmail(form.email); }}
                      className="text-xs text-primary hover:underline"
                    >
                      {t("Forgot password?", "पासवर्ड भूल गए?")}
                    </button>
                  </div>
                  <Button data-testid="login-submit" type="submit" disabled={busy} className="w-full rounded-none btn-premium">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      <><LogIn className="h-4 w-4 mr-1.5" />{t("Log in", "लॉग इन")}</>
                    )}
                  </Button>
                </form>

                {profile.demo && (
                  <Button
                    type="button"
                    variant="outline"
                    data-testid="demo-login-btn"
                    disabled={busy}
                    onClick={demoLogin}
                    className="w-full rounded-none mt-2 border-dashed"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      <>{t(`Demo: ${profile.demo.name}`, `डेमो: ${profile.demo.name}`)} <ChevronRight className="h-4 w-4 ml-1" /></>
                    )}
                  </Button>
                )}
                {profile.adminNote && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {hi ? profile.adminNoteHi : profile.adminNote}
                  </p>
                )}

                <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="h-px flex-1 bg-border" />{t("OR", "या")}<div className="h-px flex-1 bg-border" />
                </div>
                <Button data-testid="login-google" variant="outline" onClick={google} className="w-full rounded-none">
                  {t("Continue with Google", "Google से जारी रखें")}
                </Button>

                <p className="text-sm text-muted-foreground mt-6 text-center">
                  {t("No account?", "खाता नहीं है?")}{" "}
                  <Link to={`/register?type=${profileId}`} className="text-primary font-medium hover:underline">
                    {t("Sign up", "रजिस्टर करें")}
                  </Link>
                </p>
                <p className="text-sm text-center mt-3">
                  <button type="button" onClick={openPanel} className="text-primary font-medium hover:underline" data-testid="login-try-demo">
                    {t("Try interactive demo (no signup)", "बिना साइनअप डेमो देखें")}
                  </button>
                </p>
              </>
            )}

            {stage === "otp" && (
              <>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  <h1 className="font-display font-extrabold text-2xl tracking-tight">{t("Verify it's you", "पहचान सत्यापित करें")}</h1>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("Enter the 6-digit code sent to", "6 अंकों का कोड दर्ज करें")}{" "}
                  <span className="font-mono">{otpEmail}</span>
                </p>
                {err && <div className="mt-4 text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">{err}</div>}
                <form onSubmit={verifyOtp} className="mt-6 space-y-4">
                  <Input
                    data-testid="otp-code"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="______"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="rounded-none tracking-[0.5em] text-center font-mono text-lg"
                  />
                  <Button data-testid="otp-submit" type="submit" disabled={busy} className="w-full rounded-none btn-premium">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Verify & continue", "सत्यापित करें")}
                  </Button>
                </form>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <button type="button" onClick={() => { setStage("login"); setErr(""); setOtp(""); }} className="text-muted-foreground hover:underline flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" />{t("Back", "पीछे")}
                  </button>
                  <button type="button" data-testid="otp-resend" onClick={resendOtp} className="text-primary hover:underline">
                    {t("Resend code", "कोड फिर भेजें")}
                  </button>
                </div>
              </>
            )}

            {stage === "forgot" && (
              <>
                <h1 className="font-display font-extrabold text-2xl tracking-tight">{t("Reset password", "पासवर्ड रीसेट")}</h1>
                {forgotSent ? (
                  <div data-testid="forgot-sent" className="mt-4 text-sm border border-border bg-muted/40 px-3 py-3">
                    {t("If an account exists for", "यदि खाता मौजूद है")}{" "}
                    <span className="font-mono">{forgotEmail}</span>, {t("a reset link has been emailed.", "रीसेट लिंक ईमेल किया गया।")}
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mt-1">{t("Enter your email for a reset link.", "रीसेट लिंक के लिए ईमेल दें।")}</p>
                    {err && <div className="mt-4 text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">{err}</div>}
                    <form onSubmit={sendReset} className="mt-6 space-y-4">
                      <Input data-testid="forgot-email" type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="rounded-none" />
                      <Button data-testid="forgot-submit" type="submit" disabled={busy} className="w-full rounded-none">
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Send reset link", "रीसेट लिंक भेजें")}
                      </Button>
                    </form>
                  </>
                )}
                <button type="button" onClick={() => { setStage("login"); setErr(""); }} className="mt-4 text-xs text-muted-foreground hover:underline flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" />{t("Back to log in", "लॉग इन पर वापस")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
