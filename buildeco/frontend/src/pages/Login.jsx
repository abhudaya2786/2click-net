import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, HardHat, Languages, Loader2, LogIn, Package, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useDemoMode } from "@/context/DemoModeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LOGIN_PROFILES, profilesFromUserTypes } from "@/lib/loginProfiles";
import {
  buildLocalDemoSession,
  fetchLoginCategories,
  isKnownDemoLogin,
  loginErrorText,
  loginWithPassword,
  resendLoginOtp,
  sendPasswordReset,
  verifyLoginOtp,
} from "@/lib/loginClient";

const BASE_ROLES = LOGIN_PROFILES.filter((p) => p.id !== "admin");

export default function Login() {
  const nav = useNavigate();
  const { setSession } = useAuth();
  const { enableDemo, openPanel } = useDemoMode();

  const [lang, setLang] = useState(() => localStorage.getItem("bs_lang") || "en");
  const hi = lang === "hi";
  const t = (en, h) => (hi ? h : en);

  const [roles, setRoles] = useState(BASE_ROLES);
  const [roleId, setRoleId] = useState("customer");
  const [stage, setStage] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const role = useMemo(
    () => roles.find((r) => r.id === roleId) || roles[0] || BASE_ROLES[0],
    [roles, roleId],
  );
  const Icon = role.icon || Package;

  useEffect(() => {
    let live = true;
    fetchLoginCategories()
      .then((types) => {
        if (!live || !types.length) return;
        setRoles(profilesFromUserTypes(types));
      })
      .catch(() => {
        if (live) setRoles(BASE_ROLES);
      });
    return () => { live = false; };
  }, []);

  const enterSession = (token, user, localDemo) => {
    if (!token || !user) {
      setErr(t("Login did not return a session.", "सेशन नहीं मिला।"));
      return;
    }
    if (localDemo) enableDemo();
    setSession(token, user);
    toast.success(t(`Welcome, ${user.name || user.email}`, `स्वागत है, ${user.name || user.email}`));
    nav("/dashboard");
  };

  const runPasswordLogin = async () => {
    const em = email.trim().toLowerCase();
    const pw = password;
    if (!em.includes("@") || !pw) {
      setErr(t("Please enter a valid email and password.", "कृपया सही ईमेल और पासवर्ड डालें।"));
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const result = await loginWithPassword(em, pw);
      if (result.ok && result.data?.requires_otp) {
        setOtpEmail(result.data.email || em);
        setStage("otp");
        toast.info(t("We emailed a 6-digit code.", "6 अंकों का कोड ईमेल किया गया।"));
        return;
      }
      if (result.ok && result.data?.token && result.data?.user) {
        enterSession(result.data.token, result.data.user, false);
        return;
      }
      if (isKnownDemoLogin(em, pw)) {
        const demo = buildLocalDemoSession(roleId);
        enterSession(demo.token, demo.user, true);
        toast.message(t(
          "Live demo users are not on the server — opened a local demo workspace.",
          "लाइव डेमो यूज़र सर्वर पर नहीं — लोकल डेमो खोला।",
        ));
        return;
      }
      setErr(loginErrorText(result));
    } finally {
      setBusy(false);
    }
  };

  const pickRole = (id) => {
    setRoleId(id);
    setErr("");
    const next = roles.find((r) => r.id === id) || BASE_ROLES.find((r) => r.id === id);
    if (next?.demo) {
      setEmail(next.demo.email);
      setPassword(next.demo.password);
    } else {
      setEmail("");
      setPassword("");
    }
  };

  const runDemo = () => {
    if (!role.demo) return;
    setEmail(role.demo.email);
    setPassword(role.demo.password);
    setBusy(true);
    setErr("");
    loginWithPassword(role.demo.email, role.demo.password)
      .then((result) => {
        if (result.ok && result.data?.token && result.data?.user) {
          enterSession(result.data.token, result.data.user, false);
          return;
        }
        const demo = buildLocalDemoSession(role.id);
        enterSession(demo.token, demo.user, true);
        toast.message(t(
          "Opened local demo workspace (live demo accounts are not seeded).",
          "लोकल डेमो वर्कस्पेस खुला (लाइव डेमो अकाउंट नहीं हैं)।",
        ));
      })
      .finally(() => setBusy(false));
  };

  const runOtp = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const result = await verifyLoginOtp(otpEmail, otp);
      if (result.ok && result.data?.token && result.data?.user) {
        enterSession(result.data.token, result.data.user, false);
        return;
      }
      setErr(loginErrorText(result, t("Invalid code.", "गलत कोड।")));
    } finally {
      setBusy(false);
    }
  };

  const runResendOtp = async () => {
    const result = await resendLoginOtp(otpEmail);
    if (result.ok) toast.success(t("Code re-sent.", "कोड फिर भेजा गया।"));
    else toast.error(loginErrorText(result, t("Could not resend.", "भेज नहीं सका।")));
  };

  const runReset = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const result = await sendPasswordReset(resetEmail, window.location.origin);
      if (result.ok) setResetSent(true);
      else setErr(loginErrorText(result));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex relative bg-slate-950 flex-col">
        <div className="relative flex flex-col h-full p-10 xl:p-12 text-white">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-primary flex items-center justify-center rounded-lg">
              <HardHat className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight">buildecogroup.com</span>
          </Link>
          <div className="flex-1 flex flex-col justify-center py-10">
            <div className={`inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest border px-3 py-1.5 rounded-full w-fit mb-6 ${role.bg || "border-white/20"}`}>
              <Icon className={`h-3.5 w-3.5 ${role.color || "text-white"}`} />
              {hi ? role.labelHi : role.label}
            </div>
            <h2 className="font-display font-extrabold text-3xl xl:text-4xl tracking-tight leading-tight">
              {hi ? role.subtitleHi : role.subtitle}
            </h2>
            <p className="mt-3 text-slate-400 text-sm">
              {t("After login you will see:", "लॉगिन के बाद:")}{" "}
              <span className="text-white font-medium">{role.dashboard}</span>
            </p>
            <ul className="mt-8 space-y-3">
              {(role.features || []).map((f) => (
                <li key={f.en || f.hi} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="h-8 w-8 shrink-0 bg-white/10 flex items-center justify-center rounded-lg">
                    {f.icon ? <f.icon className={`h-4 w-4 ${role.color || ""}`} /> : null}
                  </span>
                  <span className="pt-1.5">{hi ? f.hi : f.en}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs font-mono text-slate-500">Sign-in server: wallet-vendor-mvp.emergent.host</p>
        </div>
      </div>

      <div className="flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border lg:border-0">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <div className="h-8 w-8 bg-primary flex items-center justify-center rounded-lg">
              <HardHat className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-sm">buildecogroup.com</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              const n = lang === "en" ? "hi" : "en";
              localStorage.setItem("bs_lang", n);
              setLang(n);
            }}
            className="ml-auto flex items-center gap-1.5 text-xs font-mono border border-border px-2.5 py-1.5 rounded-lg"
          >
            <Languages className="h-3.5 w-3.5" />
            {hi ? "EN" : "हि"}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md">
            {stage === "login" && (
              <>
                <div className="flex gap-1 p-1 border border-border rounded-lg bg-muted/30 mb-6">
                  <span className="flex-1 text-center py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground">
                    {t("Log in", "लॉग इन")}
                  </span>
                  <Link to={`/register?type=${roleId}`} className="flex-1 text-center py-2.5 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent/50">
                    {t("Create account", "खाता बनाएँ")}
                  </Link>
                </div>

                <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">{t("Log in", "लॉग इन")}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("Choose a category, then sign in on the BuildEco server.", "श्रेणी चुनें, फिर BuildEco सर्वर पर साइन इन करें।")}
                </p>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {roles.map((p) => {
                    const PIcon = p.icon || Package;
                    const on = roleId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => pickRole(p.id)}
                        className={`text-left p-3 border rounded-lg ${on ? `${p.bg || ""} ring-2 ring-primary` : "border-border hover:bg-accent/50"}`}
                      >
                        <PIcon className={`h-5 w-5 mb-1.5 ${on ? p.color : "text-muted-foreground"}`} />
                        <div className="text-xs font-semibold">{hi ? p.labelHi : p.label}</div>
                      </button>
                    );
                  })}
                </div>

                {err ? (
                  <div className="mt-4 text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">{err}</div>
                ) : null}

                <form
                  className="mt-5 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void runPasswordLogin();
                  }}
                >
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("Email", "ईमेल")}</label>
                    <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-none" autoComplete="username" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("Password", "पासवर्ड")}</label>
                    <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-none" autoComplete="current-password" />
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => {
                        setStage("forgot");
                        setErr("");
                        setResetSent(false);
                        setResetEmail(email);
                      }}
                    >
                      {t("Forgot password?", "पासवर्ड भूल गए?")}
                    </button>
                  </div>
                  <Button type="submit" disabled={busy} className="w-full rounded-none btn-premium">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><LogIn className="h-4 w-4 mr-1.5" />{t("Log in", "लॉग इन")}</>}
                  </Button>
                </form>

                {role.demo ? (
                  <Button type="button" variant="outline" disabled={busy} onClick={runDemo} className="w-full rounded-none mt-2 border-dashed">
                    {t(`Demo: ${role.demo.name}`, `डेमो: ${role.demo.name}`)} <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : null}

                <p className="text-sm text-muted-foreground mt-6 text-center">
                  {t("No account?", "खाता नहीं?")}{" "}
                  <Link to={`/register?type=${roleId}`} className="text-primary font-medium">{t("Sign up", "रजिस्टर करें")}</Link>
                </p>
                <p className="text-sm text-center mt-3">
                  <button type="button" onClick={openPanel} className="text-primary font-medium hover:underline">
                    {t("Try interactive demo (no signup)", "बिना साइनअप डेमो")}
                  </button>
                </p>
              </>
            )}

            {stage === "otp" && (
              <>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  <h1 className="font-display font-extrabold text-2xl">{t("Verify it's you", "कोड डालें")}</h1>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{otpEmail}</p>
                {err ? <div className="mt-4 text-sm text-destructive border border-destructive/30 px-3 py-2">{err}</div> : null}
                <form onSubmit={runOtp} className="mt-6 space-y-4">
                  <Input inputMode="numeric" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} className="rounded-none tracking-[0.5em] text-center font-mono text-lg" />
                  <Button type="submit" disabled={busy} className="w-full rounded-none btn-premium">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Verify & continue", "सत्यापित करें")}
                  </Button>
                </form>
                <div className="mt-4 flex justify-between text-xs">
                  <button type="button" onClick={() => { setStage("login"); setErr(""); setOtp(""); }} className="flex items-center gap-1 text-muted-foreground">
                    <ArrowLeft className="h-3 w-3" />{t("Back", "पीछे")}
                  </button>
                  <button type="button" onClick={() => void runResendOtp()} className="text-primary">{t("Resend code", "फिर भेजें")}</button>
                </div>
              </>
            )}

            {stage === "forgot" && (
              <>
                <h1 className="font-display font-extrabold text-2xl">{t("Reset password", "पासवर्ड रीसेट")}</h1>
                {resetSent ? (
                  <p className="mt-4 text-sm border px-3 py-3">
                    {t("If an account exists, a reset link was emailed to", "अगर खाता है तो लिंक भेजा गया:")} {resetEmail}
                  </p>
                ) : (
                  <form onSubmit={runReset} className="mt-6 space-y-4">
                    {err ? <div className="text-sm text-destructive border px-3 py-2">{err}</div> : null}
                    <Input type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="rounded-none" />
                    <Button type="submit" disabled={busy} className="w-full rounded-none">
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Send reset link", "लिंक भेजें")}
                    </Button>
                  </form>
                )}
                <button type="button" onClick={() => { setStage("login"); setErr(""); }} className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
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
