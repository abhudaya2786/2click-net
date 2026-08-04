import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  QrCode, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  Share2, 
  Globe, 
  ShieldCheck, 
  X, 
  Cpu,
  Layers,
  Zap,
  Info
} from 'lucide-react';

interface MobileApkInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileApkInstallModal: React.FC<MobileApkInstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk' | 'ios'>('pwa');

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert("To install on Android/Chrome: Tap Chrome menu (⋮) -> 'Add to Home screen' or 'Install app'.");
    }
  };

  const currentUrl = window.location.href;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-teal-500/40 rounded-3xl p-6 shadow-2xl text-white overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 border border-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-slate-800 pb-4">
          <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl text-slate-950 font-black shadow-lg">
            <Smartphone className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-white">2click.in Mobile App &amp; APK Center</h3>
              <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold rounded-full border border-teal-500/30">
                PWA / Android Ready
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              मोबाइल फोन में ऐप की तरह चलाएं व इंस्टॉल करें (Install as App / Download WebAPK)
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-slate-850 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`py-2.5 px-3 rounded-xl font-extrabold flex items-center justify-center gap-2 transition ${
              activeTab === 'pwa'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>1-Click App Install</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`py-2.5 px-3 rounded-xl font-extrabold flex items-center justify-center gap-2 transition ${
              activeTab === 'apk'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Android APK Package</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`py-2.5 px-3 rounded-xl font-extrabold flex items-center justify-center gap-2 transition ${
              activeTab === 'ios'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>iPhone / iOS Setup</span>
          </button>
        </div>

        {/* TAB 1: PWA Instant Install */}
        {activeTab === 'pwa' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="p-5 bg-gradient-to-r from-teal-950/60 to-slate-850 rounded-2xl border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-black text-sm text-white flex items-center gap-2 justify-center sm:justify-start">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  Instant Mobile Web Application Mode
                </h4>
                <p className="text-xs text-slate-300 max-w-md">
                  Works offline, loads instantly, occupies zero phone storage, and provides fullscreen mobile app experience on Android &amp; Desktop.
                </p>
              </div>

              <button
                onClick={handleInstallClick}
                className="px-5 py-3 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-black rounded-2xl shadow-xl hover:shadow-teal-500/20 shrink-0 transition flex items-center gap-2 text-xs"
              >
                <Download className="w-4 h-4" />
                {isInstalled ? '✅ App Already Installed' : '📱 Install App Now'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <div className="font-bold text-teal-300 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> 100% Safe &amp; Fast
                </div>
                <p className="text-[11px] text-slate-300">
                  No APK warnings or Google Play restrictions. Runs in secure sandboxed container.
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <div className="font-bold text-teal-300 mb-1 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" /> Auto-Updating
                </div>
                <p className="text-[11px] text-slate-300">
                  New features, Dukandar listings &amp; BOQ rates update automatically without downloading updates.
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                <div className="font-bold text-teal-300 mb-1 flex items-center gap-1.5">
                  <Globe className="w-4 h-4" /> Offline Cache
                </div>
                <p className="text-[11px] text-slate-300">
                  View saved BOQ estimates and phone directories even without internet on construction sites.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Android APK Package Guide */}
        {activeTab === 'apk' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="p-4 bg-slate-800/90 rounded-2xl border border-teal-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-sm text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-teal-400" />
                  Generate Native Android .APK / Google Play Package
                </h4>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] rounded-md font-bold">
                  PWABuilder Ready
                </span>
              </div>

              <p className="text-slate-300 text-[11px] leading-relaxed">
                2click.in includes a complete <code className="text-teal-300 font-mono">manifest.json</code>. You can generate a signed native Android APK file or Google Play Store bundle (.aab) in 1 minute using official PWABuilder / Bubblewrap:
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-700/60">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                  <div>
                    <span className="font-bold text-white">Copy App URL:</span>
                    <input
                      type="text"
                      readOnly
                      value={currentUrl}
                      className="w-full mt-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl font-mono text-[11px] text-teal-300 select-all"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                  <div>
                    <span className="font-bold text-white">Open Official PWABuilder (Android APK Generator):</span>
                    <a
                      href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-slate-950 font-black rounded-xl hover:bg-teal-400 transition"
                    >
                      🚀 Open PWABuilder &amp; Download APK <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-teal-950/40 rounded-xl border border-teal-800/60 text-[11px] text-teal-200 flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-400 shrink-0" />
              <span>
                <strong>Direct WebAPK Feature:</strong> On Chrome for Android, clicking &quot;Install App&quot; automatically creates a system WebAPK in your Android apps drawer with native notifications support.
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: iOS iPhone Setup */}
        {activeTab === 'ios' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-3">
              <h4 className="font-black text-sm text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-teal-400" />
                iPhone / iPad Safari Install Steps
              </h4>

              <ol className="space-y-2.5 text-slate-300 text-[11px] list-decimal list-inside pl-1">
                <li className="leading-relaxed">
                  Open this website in <strong className="text-white">Safari Browser</strong> on your iPhone or iPad.
                </li>
                <li className="leading-relaxed">
                  Tap the <strong className="text-teal-300">Share Button</strong> (square icon with an arrow pointing up at the bottom of Safari).
                </li>
                <li className="leading-relaxed">
                  Scroll down and select <strong className="text-white">&quot;Add to Home Screen&quot; (होम स्क्रीन में जोड़ें)</strong>.
                </li>
                <li className="leading-relaxed">
                  Tap <strong className="text-teal-300">&quot;Add&quot;</strong> in the top right corner. The 2click.in icon will appear on your iPhone home screen!
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <Smartphone className="w-4 h-4 text-teal-400" />
            <span>Package Name: <strong className="text-slate-200">in.twoclick.app</strong></span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-xl border border-slate-700 transition"
          >
            Close / बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
