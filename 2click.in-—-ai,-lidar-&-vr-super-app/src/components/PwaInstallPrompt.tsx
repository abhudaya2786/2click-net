import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  X, 
  Sparkles, 
  Share2, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface PwaInstallPromptProps {
  onOpenApkModal?: () => void;
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({ onOpenApkModal }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (installed as PWA)
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) {
      return; // Do not show prompt if already running as installed app
    }

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('2click_pwa_prompt_dismissed');
    if (dismissed === 'true') {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Listen for beforeinstallprompt event on Chrome/Android/Edge/Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt automatically after 1.5s delay
      setTimeout(() => setIsVisible(true), 1500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS or browsers where event doesn't fire immediately, show prompt after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(!showIosGuide);
    } else if (onOpenApkModal) {
      onOpenApkModal();
    } else {
      alert("To install 2click.in App:\n• Chrome/Android: Tap menu (⋮) -> 'Add to Home screen' or 'Install App'\n• iPhone: Tap Share button -> 'Add to Home Screen'");
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('2click_pwa_prompt_dismissed', 'true');
  };

  if (isStandalone || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="relative bg-slate-900/95 backdrop-blur-xl border border-teal-500/40 rounded-2xl p-4 shadow-2xl text-white overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
          aria-label="Close download prompt"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          {/* App Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center p-2 shadow-lg shadow-teal-500/20 shrink-0">
            <img 
              src="https://img.icons8.com/fluency/192/building.png" 
              alt="2click App Icon" 
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to icon if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <Smartphone className="w-6 h-6 text-slate-950 hidden" />
          </div>

          <div className="flex-1 pr-6">
            <div className="flex items-center gap-1.5">
              <h4 className="font-black text-sm text-white">Download 2click.in App</h4>
              <span className="px-1.5 py-0.5 bg-teal-500/20 text-teal-300 text-[10px] font-bold rounded border border-teal-500/30">
                PWA / Android
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-snug">
              Install web app to your home screen for instant offline BOQ calculators &amp; Dukandar market access.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-teal-300 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Zero storage • Fast</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenApkModal && (
              <button
                onClick={onOpenApkModal}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition"
              >
                APK Guide
              </button>
            )}

            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{deferredPrompt ? 'Install App' : isIos ? 'iPhone Guide' : 'Download App'}</span>
            </button>
          </div>
        </div>

        {/* iOS Quick Guide Dropdown */}
        {showIosGuide && isIos && (
          <div className="mt-3 p-3 bg-slate-950/80 rounded-xl border border-teal-500/30 text-xs text-slate-300 space-y-1.5 animate-in fade-in">
            <p className="font-bold text-white flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5 text-teal-400" /> Safari iPhone Installation:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px]">
              <li>Tap the <span className="text-teal-300 font-bold">Share</span> icon in Safari toolbar</li>
              <li>Scroll down &amp; tap <span className="text-white font-bold">&quot;Add to Home Screen&quot;</span></li>
              <li>Tap <span className="text-teal-300 font-bold">&quot;Add&quot;</span> to launch as native app</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
