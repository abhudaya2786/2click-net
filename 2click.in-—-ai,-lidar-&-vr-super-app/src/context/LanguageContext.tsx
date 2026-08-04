import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ALL_INDIAN_LANGUAGES, getTranslation, LanguageOption } from '../utils/indianLanguages';

export interface LanguageContextType {
  selectedLanguage: string;
  language: string;
  setSelectedLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
  languages: LanguageOption[];
  currentLanguageObj: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: string;
  onLanguageChange?: (lang: string) => void;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  initialLanguage,
  onLanguageChange
}) => {
  const [selectedLanguage, setSelectedLanguageState] = useState<string>(() => {
    if (localStorage.getItem('2click_lang_default_en_v2') !== 'true') {
      localStorage.setItem('2click_language', 'en');
      localStorage.setItem('2click_lang_default_en_v2', 'true');
      try {
        const host = window.location.hostname;
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        if (host) document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host}`;
      } catch (e) {
        // ignore
      }
      return 'en';
    }
    return initialLanguage || localStorage.getItem('2click_language') || 'en';
  });

  const setSelectedLanguage = (lang: string) => {
    setSelectedLanguageState(lang);
    localStorage.setItem('2click_language', lang);
    document.documentElement.lang = lang;
    
    if (onLanguageChange) {
      onLanguageChange(lang);
    }

    // Notify window listeners for instant dynamic re-render across components
    try {
      window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
      window.dispatchEvent(new Event('languageChange'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      // ignore
    }

    // Google Translate / Auto-translation browser cookie & select element dispatch
    try {
      const host = window.location.hostname;
      if (lang === 'en') {
        // Explicitly clear Google Translate cookies when English is selected
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host}`;
        if (host.includes('.')) {
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${host}`;
        }
      } else {
        const googleLangMap: Record<string, string> = {
          en: 'en', hi: 'hi', bho: 'bho', bn: 'bn', mr: 'mr', te: 'te', ta: 'ta', ur: 'ur',
          gu: 'gu', kn: 'kn', ml: 'ml', or: 'or', pa: 'pa', as: 'as', mai: 'mai', sat: 'sat',
          ks: 'ks', ne: 'ne', sd: 'sd', kok: 'kok', doi: 'doi', mni: 'mni', sa: 'sa'
        };
        const targetLang = googleLangMap[lang] || lang;
        
        // Set translation cookies for root path and hostname
        document.cookie = `googtrans=/en/${targetLang}; path=/;`;
        document.cookie = `googtrans=/auto/${targetLang}; path=/;`;
        if (host) {
          document.cookie = `googtrans=/en/${targetLang}; path=/; domain=${host}`;
          document.cookie = `googtrans=/auto/${targetLang}; path=/; domain=${host}`;
        }
      }

      // Helper function to trigger Google Translate select DOM element
      const attemptGoogleTranslate = (retriesLeft = 10) => {
        const selectElem = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (selectElem) {
          selectElem.value = lang === 'en' ? 'en' : (lang || 'en');
          selectElem.dispatchEvent(new Event('change', { bubbles: true }));
          selectElem.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (retriesLeft > 0) {
          setTimeout(() => attemptGoogleTranslate(retriesLeft - 1), 300);
        }
      };

      attemptGoogleTranslate();
    } catch (e) {
      console.warn('Translate trigger exception:', e);
    }
  };

  useEffect(() => {
    if (initialLanguage && initialLanguage !== selectedLanguage) {
      setSelectedLanguageState(initialLanguage);
    }
  }, [initialLanguage]);

  useEffect(() => {
    document.documentElement.lang = selectedLanguage;
  }, [selectedLanguage]);

  const t = (key: string, fallback?: string): string => {
    const translated = getTranslation(selectedLanguage, key);
    if (translated && translated !== key) {
      return translated;
    }
    return fallback || key;
  };

  const currentLanguageObj = ALL_INDIAN_LANGUAGES.find(l => l.code === selectedLanguage) || ALL_INDIAN_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{
      selectedLanguage,
      language: selectedLanguage,
      setSelectedLanguage,
      t,
      languages: ALL_INDIAN_LANGUAGES,
      currentLanguageObj
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      selectedLanguage: 'en',
      language: 'en',
      setSelectedLanguage: () => {},
      t: (key, fallback) => fallback || key,
      languages: ALL_INDIAN_LANGUAGES,
      currentLanguageObj: ALL_INDIAN_LANGUAGES[0]
    };
  }
  return context;
};

export const useTranslation = useLanguage;
