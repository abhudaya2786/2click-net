import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { DEMO_FEATURES, withDemoParam } from "@/lib/demoData";
import { runDemoLogin } from "@/lib/demoAuth";
import { toast } from "sonner";

const DemoModeContext = createContext(null);

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) throw new Error("useDemoMode outside provider");
  return ctx;
}

export function DemoModeProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [panelOpen, setPanelOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(() => localStorage.getItem("bs_demo_mode") === "1");
  const [usingSampleData, setUsingSampleData] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("demo") === "1") {
      setDemoMode(true);
      localStorage.setItem("bs_demo_mode", "1");
    }
  }, [location.search]);

  const enableDemo = useCallback(() => {
    setDemoMode(true);
    localStorage.setItem("bs_demo_mode", "1");
  }, []);

  const markSampleData = useCallback((on) => setUsingSampleData(on), []);

  const launchFeature = useCallback(async (feature) => {
    enableDemo();
    const path = withDemoParam(feature.path);
    try {
      if (feature.loginProfile) {
        const data = await runDemoLogin(feature.loginProfile);
        setSession(data.token, data.user);
        toast.success(`Demo: ${feature.en}`);
        navigate(path.replace("?demo=1", "").replace("&demo=1", "") || "/dashboard");
      } else {
        toast.success(`Demo: ${feature.en}`);
        navigate(path);
      }
    } catch (e) {
      toast.message(feature.hi ? "डेमो डेटा दिखाया जा रहा है (लाइव API नहीं)" : "Showing demo data (live API unavailable)");
      navigate(path);
    }
    setPanelOpen(false);
  }, [enableDemo, navigate, setSession]);

  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  const value = useMemo(() => ({
    demoMode,
    panelOpen,
    usingSampleData,
    features: DEMO_FEATURES,
    enableDemo,
    markSampleData,
    launchFeature,
    openPanel,
    closePanel,
    withDemoParam,
  }), [demoMode, panelOpen, usingSampleData, enableDemo, markSampleData, launchFeature, openPanel, closePanel]);

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
}
