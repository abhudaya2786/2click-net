import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const nav = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const hash = location.hash || window.location.hash;
    const sessionId = new URLSearchParams(hash.replace("#", "")).get("session_id");
    if (!sessionId) { nav("/login"); return; }
    (async () => {
      try {
        const { data } = await api.post("/auth/google/session", {}, { headers: { "X-Session-ID": sessionId } });
        setSession(data.token, data.user);
        window.history.replaceState({}, "", "/dashboard");
        nav("/dashboard", { state: { user: data.user } });
      } catch {
        nav("/login");
      }
    })();
  }, [location.hash, nav, setSession]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" strokeWidth={1.5} />
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  );
}
