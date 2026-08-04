import { useState, useEffect } from 'react';
import { optionTranslations } from '../i18n/optionTranslations';

export const useOptionTranslation = (optionName: keyof typeof optionTranslations) => {
  const [lang, setLang] = useState<'en' | 'hi'>(() => {
    return (localStorage.getItem('2click_language') as 'en' | 'hi') || 'en';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const currentLang = (localStorage.getItem('2click_language') as 'en' | 'hi') || 'en';
      setLang(currentLang);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, []);

  // t(key) फ़ंक्शन: चुनी हुई भाषा के हिसाब से टेक्स्ट निकालेगा
  const t = (key: string): string => {
    const optionData = optionTranslations[optionName];
    if (optionData && optionData[lang] && (optionData[lang] as Record<string, string>)[key]) {
      return (optionData[lang] as Record<string, string>)[key];
    }
    // अगर हिंदी में की (key) न मिले तो डिफ़ॉल्ट इंग्लिश दिखाएगा
    return (optionData?.en as Record<string, string>)?.[key] || key;
  };

  return { t, lang };
};
