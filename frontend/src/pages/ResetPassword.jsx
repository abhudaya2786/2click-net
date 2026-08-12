import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HardHat, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (pw.length < 6) { setErr("Password must be at least 6 characters"); return; }
    if (pw !== pw2) { setErr("Passwords do not match"); return; }
    setBusy(true);
    try {
      await api.post("/auth/reset-password", { token, password: pw });
      setDone(true);
      toast.success("Password updated. You can log in now.");
      setTimeout(() => nav("/login"), 1800);
    } catch (e2) {
      setErr(formatApiErrorDetail(e2.response?.data?.detail) || e2.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <div className="w-full max-w-sm bg-card border border-border p-8">
        <Link to="/" className="flex items-center gap-2.5 mb-6">
          <div className="h-9 w-9 bg-primary flex items-center justify-center"><HardHat className="h-5 w-5 text-white" strokeWidth={1.75} /></div>
          <span className="font-display font-extrabold text-lg tracking-tight">buildecogroup.com</span>
        </Link>
        {done ? (
          <div className="text-center py-6" data-testid="reset-success">
            <CheckCircle2 className="h-10 w-10 text-solar mx-auto" />
            <h1 className="font-display font-bold text-xl mt-3">Password updated</h1>
            <p className="text-sm text-muted-foreground mt-1">Redirecting you to log in…</p>
          </div>
        ) : (
          <>
            <h1 className="font-display font-extrabold text-2xl tracking-tight">Set a new password</h1>
            <p className="text-sm text-muted-foreground mt-1">Choose a strong password for your account.</p>
            {!token && <div className="mt-4 text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">Missing reset token. Please use the link from your email.</div>}
            {err && <div data-testid="reset-error" className="mt-4 text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">{err}</div>}
            <form onSubmit={submit} className="mt-6 space-y-4">
              <Input data-testid="reset-password" type="password" placeholder="New password" required value={pw} onChange={(e) => setPw(e.target.value)} className="rounded-none" />
              <Input data-testid="reset-password-confirm" type="password" placeholder="Confirm new password" required value={pw2} onChange={(e) => setPw2(e.target.value)} className="rounded-none" />
              <Button data-testid="reset-submit" type="submit" disabled={busy || !token} className="w-full rounded-none">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mt-6"><Link to="/login" className="text-primary font-medium">Back to log in</Link></p>
          </>
        )}
      </div>
    </div>
  );
}
