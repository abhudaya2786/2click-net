import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchSessionUser, LOGIN_API_BASE } from "@/lib/loginClient";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const DEMO_USER_KEY = "bs_demo_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem("bs_token");
    if (!token) { setLoading(false); return; }
    if (token.startsWith("demo.")) {
      try {
        const stored = JSON.parse(localStorage.getItem(DEMO_USER_KEY) || "null");
        setUser(stored);
        if (!stored) localStorage.removeItem("bs_token");
      } catch {
        localStorage.removeItem("bs_token");
        localStorage.removeItem(DEMO_USER_KEY);
        setUser(null);
      }
      setLoading(false);
      return;
    }
    try {
      const result = await fetchSessionUser(token);
      if (result.ok && result.data) setUser(result.data);
      else {
        localStorage.removeItem("bs_token");
        setUser(null);
      }
    } catch {
      localStorage.removeItem("bs_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (window.location.hash?.includes("session_id=")) { setLoading(false); return; }
    loadMe();
  }, [loadMe]);

  const setSession = (token, u) => {
    if (token) localStorage.setItem("bs_token", token);
    if (token && String(token).startsWith("demo.") && u) {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(DEMO_USER_KEY);
    }
    setUser(u);
  };

  const logout = async () => {
    try { await fetch(`${LOGIN_API_BASE}/auth/logout`, { method: "POST" }); } catch {}
    localStorage.removeItem("bs_token");
    localStorage.removeItem(DEMO_USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setSession, logout, loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}
