import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Smartphone, Share, Home, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/context/LanguageContext";
import { isAndroidBrowser, isStandalonePwa, isNativeCapacitor } from "@/lib/pwa";

const COPY = {
  en: {
    title: "Get the BuildEco Group App",
    sub: "Install on your phone — tenders, marketplace, solar and dashboard in one tap.",
    pwa_title: "Install from browser (recommended)",
    pwa_1: "Open this site in Chrome on Android",
    pwa_2: "Tap menu (⋮) → Install app or Add to Home screen",
    pwa_3: "Open the icon — works like a native app",
    apk_title: "Download Android APK",
    apk_sub: "Direct install for Android phones (enable Install from unknown sources if asked).",
    apk_btn: "Download APK",
    apk_note: "APK is built from the latest release. For always-latest UI, use browser install above.",
    ios_title: "iPhone / iPad",
    ios_sub: "Safari → Share → Add to Home Screen",
    installed: "You are already using the installed app.",
    open_dashboard: "Open dashboard",
    back_home: "Back to home",
  },
  hi: {
    title: "BuildEco Group ऐप डाउनलोड करें",
    sub: "फोन पर इंस्टॉल करें — टेंडर, मार्केटप्लेस, सोलर और डैशबोर्ड एक टैप में।",
    pwa_title: "ब्राउज़र से इंस्टॉल करें (सुझावित)",
    pwa_1: "Android पर Chrome में यह साइट खोलें",
    pwa_2: "मेनू (⋮) → Install app या Add to Home screen",
    pwa_3: "आइकन खोलें — नेटिव ऐप जैसा चलेगा",
    apk_title: "Android APK डाउनलोड",
    apk_sub: "Android फोन पर सीधे इंस्टॉल (अगर पूछे तो Unknown sources अनुमति दें)।",
    apk_btn: "APK डाउनलोड करें",
    apk_note: "APK नवीनतम रिलीज़ से बनता है। हमेशा नया UI चाहिए तो ऊपर ब्राउज़र इंस्टॉल उपयोग करें।",
    ios_title: "iPhone / iPad",
    ios_sub: "Safari → Share → Add to Home Screen",
    installed: "आप पहले से इंस्टॉल किए ऐप का उपयोग कर रहे हैं।",
    open_dashboard: "डैशबोर्ड खोलें",
    back_home: "होम पर वापस",
  },
};

const APK_URL = process.env.REACT_APP_APK_URL || "/buildecogroup.apk";

export default function DownloadApp() {
  const { lang } = useLang();
  const t = COPY[lang] || COPY.en;
  const [deferred, setDeferred] = useState(null);
  const installed = isStandalonePwa() || isNativeCapacitor();

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const installPwa = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
      <div className="text-center mb-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white mb-4">
          <Smartphone className="h-8 w-8" />
        </div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight">{t.title}</h1>
        <p className="text-muted-foreground mt-2">{t.sub}</p>
      </div>

      {installed ? (
        <div className="border border-primary/30 bg-primary/5 rounded-xl p-6 text-center space-y-4">
          <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
          <p className="font-medium">{t.installed}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild><Link to="/dashboard">{t.open_dashboard}</Link></Button>
            <Button variant="outline" asChild><Link to="/">{t.back_home}</Link></Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="border border-border rounded-xl p-5 bg-card">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              {t.pwa_title}
            </h2>
            <ol className="mt-4 space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>{t.pwa_1}</li>
              <li>{t.pwa_2}</li>
              <li>{t.pwa_3}</li>
            </ol>
            {deferred && (
              <Button className="mt-4 w-full sm:w-auto" onClick={installPwa}>
                <Download className="h-4 w-4 mr-2" />
                {lang === "hi" ? "अभी इंस्टॉल करें" : "Install now"}
              </Button>
            )}
          </section>

          {isAndroidBrowser() && (
            <section className="border border-border rounded-xl p-5 bg-card">
              <h2 className="font-display font-bold text-lg flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                {t.apk_title}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">{t.apk_sub}</p>
              <Button className="mt-4" asChild>
                <a href={APK_URL} download="buildecogroup.apk" data-testid="apk-download">
                  <Download className="h-4 w-4 mr-2" />
                  {t.apk_btn}
                </a>
              </Button>
              <p className="text-xs text-muted-foreground mt-3">{t.apk_note}</p>
            </section>
          )}

          <section className="border border-border rounded-xl p-5 bg-card">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <Share className="h-5 w-5 text-primary" />
              {t.ios_title}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">{t.ios_sub}</p>
          </section>
        </div>
      )}

      <p className="text-center mt-8">
        <Link to="/" className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
          <ExternalLink className="h-3.5 w-3.5" />
          www.buildecogroup.com
        </Link>
      </p>
    </div>
  );
}
