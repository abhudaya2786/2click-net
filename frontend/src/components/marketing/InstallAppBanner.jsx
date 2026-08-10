import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InstallAppBanner() {
  const [prompt, setPrompt] = useState(null);
  const [hidden, setHidden] = useState(() => localStorage.getItem("bs_install_dismissed") === "1");
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true);
    const onPrompt = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden || isStandalone || !prompt) return null;

  const install = async () => {
    prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
    setHidden(true);
    localStorage.setItem("bs_install_dismissed", "1");
  };

  return (
    <div className="md:hidden fixed bottom-[4.25rem] inset-x-3 z-40 rounded-xl border border-primary/30 bg-card shadow-lg p-3 flex items-center gap-3 mobile-install-banner">
      <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
        <Download className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">Install 2click App</div>
        <div className="text-xs text-muted-foreground">Home screen par add karo — app jaisa chalega</div>
      </div>
      <Button size="sm" className="rounded-lg shrink-0" onClick={install}>Install</Button>
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute top-2 right-2 text-muted-foreground"
        onClick={() => { setHidden(true); localStorage.setItem("bs_install_dismissed", "1"); }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
