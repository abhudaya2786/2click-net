import React, { useEffect } from 'react';
import { Globe, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export const GoogleTranslateWidget: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { selectedLanguage, setSelectedLanguage } = useLanguage();

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'hi,bho,bn,mr,te,ta,ur,gu,kn,ml,or,pa,as,mai,sat,ks,ne,sd,kok,doi,mni,sa,en',
            layout: window.google?.translate?.TranslateElement?.InlineLayout?.SIMPLE,
            autoDisplay: false
          },
          'google_translate_inline'
        );
      }
    };

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'hi,bho,bn,mr,te,ta,ur,gu,kn,ml,or,pa,as,mai,sat,ks,ne,sd,kok,doi,mni,sa,en',
            layout: window.google?.translate?.TranslateElement?.InlineLayout?.SIMPLE,
            autoDisplay: false
          },
          'google_translate_inline'
        );
      } catch (e) {
        // already initialized
      }
    }
  }, []);

  return (
    <div className={`flex flex-col gap-1.5 p-2 bg-slate-900/90 rounded-xl border border-amber-500/30 ${compact ? 'text-xs' : ''}`}>
      <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-400">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Inbuilt Google Translate</span>
        </div>
        <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 uppercase">Auto Sync</span>
      </div>
      
      {/* Official Google Translate Native Dropdown Target */}
      <div id="google_translate_inline" className="min-h-[28px] flex items-center justify-center overflow-hidden" />
      
      <p className="text-[10px] text-slate-400 text-center font-medium">
        Select language from list or use Google Translate above
      </p>
    </div>
  );
};
