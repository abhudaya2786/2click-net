import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const PermissionContext = createContext(null);
export const usePermissions = () => useContext(PermissionContext);

export function PermissionProvider({ children }) {
  const { user } = useAuth();
  const [perms, setPerms] = useState({ super: false, permissions: [], roles: [] });
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setPerms({ super: false, permissions: [], roles: [] }); setLoaded(true); return; }
    try {
      const { data } = await api.get("/auth/permissions");
      setPerms(data);
    } catch {
      setPerms({ super: false, permissions: [], roles: [] });
    } finally { setLoaded(true); }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const has = useCallback((module, action) => {
    if (perms.super) return true;
    const set = perms.permissions || [];
    return set.includes(`${module}:${action}`) || set.includes(`${module}:MANAGE`) || set.includes("*:*");
  }, [perms]);

  return (
    <PermissionContext.Provider value={{ ...perms, has, loaded, refresh }}>
      {children}
    </PermissionContext.Provider>
  );
}
