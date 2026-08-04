import { optionTranslations } from '../i18n/optionTranslations';
import { useLanguage } from '../context/LanguageContext';

const MODULE_MAP: Record<string, keyof typeof optionTranslations> = {
  solar_rooftop: 'solar',
  solar: 'solar',
  tiles_marble: 'tiles',
  tiles: 'tiles',
  naksha_vastu: 'naksha',
  naksha: 'naksha',
  civil_boq: 'civil',
  civil: 'civil',
  electrical_elv: 'electrical',
  electrical: 'electrical',
  water_etp: 'water',
  water_etp_stp: 'water',
  water: 'water',
  interior: 'interior',
  logistics: 'logistics',
  dukandar: 'dukandar',
  khata_book: 'khata_book',
  khatabook: 'khata_book',
};

export const useModuleTranslation = (moduleName: string) => {
  const { language } = useLanguage();
  const lang = (language === 'hi' || language === 'bho') ? 'hi' : 'en';

  const mappedKey = MODULE_MAP[moduleName] || (moduleName as keyof typeof optionTranslations);

  const t = (key: string, fallback?: string): string => {
    const optionData = optionTranslations[mappedKey];
    if (optionData && optionData[lang] && (optionData[lang] as Record<string, string>)[key]) {
      return (optionData[lang] as Record<string, string>)[key];
    }
    if (optionData?.en && (optionData.en as Record<string, string>)[key]) {
      return (optionData.en as Record<string, string>)[key];
    }
    return fallback || key;
  };

  return { t, lang };
};
