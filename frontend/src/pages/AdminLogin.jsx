import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HardHat, Loader2, ShieldCheck, Lock, Mail, KeyRound } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const { setSession } = useAuth();
  const nav = useNavigate();
  const [lang] = useState(() => localStorage.getItem("bs_lang") || "en");
  const hi = lang === "hi";
  const t = (en, h) => (hi ? h : en);

  const [stage, setStage] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", access_pin: "" });
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const finish = (data) => {
    setSession(data.token, data.user);
    toast.success(t("Welcome back", "स्वागत है"));
    nav("/dashboard");
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const { data } = await api.post("/auth/admin/login", {
        email: form.email,
        password: form.password,
        access_pin: form.access_pin || null,
      });
      if (data.requires_otp) {
        setOtpEmail(data.email);
        setStage("otp");
        toast.info(t("We emailed you a 6-digit security code", "हमने 6 अंकों का सुरक्षा कोड ईमेल किया"));
      } else {
        finish(data);
      }
    } catch (e2) {
      setErr(formatApiErrorDetail(e2.response?.data?.detail) || e2.message);
    } finally {
      setBusy(false);
    }
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

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-white/10 bg-slate-900/80 backdrop-blur p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-destructive flex items-center justify-center rounded-lg">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display font-extrabold text-lg tracking-tight">2click.in</div>
            <div className="text-xs text-slate-400 font-mono uppercase tracking-widest">
              {t("Secure Admin Console", "सुरक्षित एडमिन कंसोल")}
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-400 mb-4">
          {t(
            "Owner access only. Use the email and password set in server ADMIN_EMAIL / ADMIN_PASSWORD. Email OTP is required after password verification.",
            "केवल मालिक की पहुँच। सर्वर पर ADMIN_EMAIL / ADMIN_PASSWORD से सेट ईमेल और पासवर्ड उपयोग करें। पासवर्ड के बाद ईमेल OTP ज़रूरी है।"
          )}
        </p>
        <p className="text-xs text-slate-500 mb-6 font-mono">
          {t("Regular /login does not work for owner — use this page only.", "सामान्य /login मालिक के लिए नहीं — केवल यह पेज।")}
        </p>

        {err && (
          <div className="mb-4 text-sm text-red-300 border border-red-500/30 bg-red-500/10 px-3 py-2">
            {err}
          </div>
        )}

        {stage === "login" && (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />{t("Admin email", "एडमिन ईमेल")}
              </label>
              <Input
                data-testid="admin-login-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-none bg-slate-950 border-white/15 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />{t("Password", "पासवर्ड")}
              </label>
              <Input
                data-testid="admin-login-password"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="rounded-none bg-slate-950 border-white/15 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" />{t("Access PIN", "एक्सेस PIN")}
              </label>
              <Input
                data-testid="admin-login-pin"
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder={t("Set in ADMIN_ACCESS_PIN", "ADMIN_ACCESS_PIN में सेट करें")}
                value={form.access_pin}
                onChange={(e) => setForm({ ...form, access_pin: e.target.value })}
                className="rounded-none bg-slate-950 border-white/15 text-white"
              />
            </div>
            <Button data-testid="admin-login-submit" type="submit" disabled={busy} className="w-full rounded-none">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Continue securely", "सुरक्षित जारी रखें")}
            </Button>
          </form>
        )}

        {stage === "otp" && (
          <form onSubmit={verifyOtp} className="space-y-4">
            <p className="text-sm text-slate-400">
              {t("Enter the 6-digit code sent to", "6 अंकों का कोड दर्ज करें")}{" "}
              <span className="font-mono text-white">{otpEmail}</span>
            </p>
            <Input
              data-testid="admin-login-otp"
              inputMode="numeric"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="rounded-none bg-slate-950 border-white/15 text-white text-center text-lg tracking-[0.4em] font-mono"
            />
            <Button type="submit" disabled={busy} className="w-full rounded-none">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Verify & sign in", "सत्यापित करें")}
            </Button>
            <button type="button" onClick={resendOtp} className="text-xs text-slate-400 hover:text-white w-full text-center">
              {t("Resend code", "कोड फिर भेजें")}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
          <Link to="/" className="inline-flex items-center gap-1.5 hover:text-white">
            <HardHat className="h-3.5 w-3.5" />{t("Back to site", "साइट पर वापस")}
          </Link>
          <span className="font-mono">/sys/console</span>
        </div>
      </div>
    </div>
  );
}
