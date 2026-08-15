import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/context/LanguageContext";
import { isNativeCapacitor, isStandalonePwa } from "@/lib/pwa";

const COPY = {
  en: {
    title: "Install BuildEco Group App",
    sub: "Add to home screen — works like a native app",
    install: "Install",
    apk: "Get APK",
  },
  hi: {
    title: "BuildEco Group ऐप इंस्टॉल करें",
    sub: "होम स्क्रीन पर जोड़ें — ऐप जैसा चलेगा",
    install: "इंस्टॉल",
    apk: "APK लें",
  },
};

export default function InstallAppBanner() {
  const { lang } = useLang();
  const t = COPY[lang] || COPY.en;
  const [prompt, setPrompt] = useState(null);
  const [hidden, setHidden] = useState(() => localStorage.getItem("bs_install_dismissed") === "1");

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden || isStandalonePwa() || isNativeCapacitor()) return null;

  const dismiss = () => {
    setHidden(true);
    localStorage.setItem("bs_install_dismissed", "1");
  };

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
    dismiss();
  };

  return (
    <div className="md:hidden fixed bottom-[4.25rem] inset-x-3 z-40 rounded-xl border border-primary/30 bg-card shadow-lg p-3 flex items-center gap-3 mobile-install-banner safe-bottom-offset">
      <div className="h-11 w-11 rounded-lg bg-primary flex items-center justify-center shrink-0 touch-target">
        <Download className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0 pr-6">
        <div className="text-sm font-semibold">{t.title}</div>
        <div className="text-xs text-muted-foreground">{t.sub}</div>
      </div>
      {prompt ? (
        <Button size="sm" className="rounded-lg shrink-0 min-h-[44px]" onClick={install}>{t.install}</Button>
      ) : (
        <Button size="sm" variant="outline" className="rounded-lg shrink-0 min-h-[44px]" asChild>
          <Link to="/download-app">{t.apk}</Link>
        </Button>
      )}
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute top-2 right-2 h-8 w-8 flex items-center justify-center text-muted-foreground"
        onClick={dismiss}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
