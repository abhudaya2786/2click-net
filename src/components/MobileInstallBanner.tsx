import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

/**
 * Lightweight install / APK banner for phones.
 * Shows Add-to-Home-Screen when PWA install is available, else APK download link.
 */
export function MobileInstallBanner() {
  const [deferred, setDeferred] = useState<any>(null);
  const [hidden, setHidden] = useState(false);
  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsPhone(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener('beforeinstallprompt', onBip);
    if (localStorage.getItem('mom-install-banner-dismissed') === '1') setHidden(true);
    return () => {
      mq.removeEventListener?.('change', sync);
      window.removeEventListener('beforeinstallprompt', onBip);
    };
  }, []);

  if (!isPhone || hidden) return null;

  const dismiss = () => {
    setHidden(true);
    localStorage.setItem('mom-install-banner-dismissed', '1');
  };

  const installPwa = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  };

  return (
    <div className="md:hidden shrink-0 border-b border-hs-100 bg-hs-50 px-3.5 py-3 flex items-center gap-2.5 no-print">
      <Smartphone className="w-5 h-5 text-hs-700 shrink-0" />
      <p className="text-sm text-slate-800 flex-1 leading-snug font-medium">
        {deferred
          ? 'Phone pe 2Click MoM install karo — jaldi recording ke liye.'
          : 'Android app download karo — Voice MoM pocket mein.'}
      </p>
      {deferred ? (
        <button
          type="button"
          onClick={installPwa}
          className="shrink-0 text-sm font-bold px-3.5 py-2 rounded-lg bg-hs-600 text-white cursor-pointer min-h-10"
        >
          Install
        </button>
      ) : (
        <a
          href="/2click-mom.apk"
          className="shrink-0 inline-flex items-center gap-1.5 text-sm font-bold px-3.5 py-2 rounded-lg bg-hs-600 text-white no-underline min-h-10"
        >
          <Download className="w-4 h-4" />
          APK
        </a>
      )}
      <button type="button" onClick={dismiss} className="p-1.5 text-slate-500 cursor-pointer" aria-label="Dismiss">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
