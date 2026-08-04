import { optionTranslations } from './optionTranslations';

export type Language = 'en' | 'hi' | 'bn' | 'ta';

export { optionTranslations };


export const translations = {
  en: {
    // Navbar & Common
    app_title: "2click.in — AI, LiDAR & VR Super App",
    project_zone: "Project Zone",
    select_language: "Language",
    
    // Solar Studio
    solar_title: optionTranslations.solar.en.title,
    solar_desc: optionTranslations.solar.en.subtitle,
    material_selection: optionTranslations.solar.en.materialBtn,
    detailed_boq: optionTranslations.solar.en.boqBtn,
    quick_package_rate: optionTranslations.solar.en.quickRate,
    budget: optionTranslations.solar.en.budget,
    standard: optionTranslations.solar.en.standard,
    premium: optionTranslations.solar.en.premium,
    power_consumption: "Power Consumption & Roof Area",
    pv_modules: "Solar Modules (PV Modules Tech)",

    // Tiles & Marble Studio
    tiles_title: optionTranslations.tiles.en.title,
    tiles_desc: optionTranslations.tiles.en.subtitle,
    
    // Buttons
    book_survey: "Book Free Site Survey",
    download_guidelines: "Download Guidelines"
  },

  hi: {
    // Navbar & Common
    app_title: "2click.in — AI, LiDAR & VR Super App",
    project_zone: "Project Zone",
    select_language: "Select Language",

    // Solar Studio
    solar_title: optionTranslations.solar.hi.title,
    solar_desc: optionTranslations.solar.hi.subtitle,
    material_selection: optionTranslations.solar.hi.materialBtn,
    detailed_boq: optionTranslations.solar.hi.boqBtn,
    quick_package_rate: optionTranslations.solar.hi.quickRate,
    budget: optionTranslations.solar.hi.budget,
    standard: optionTranslations.solar.hi.standard,
    premium: optionTranslations.solar.hi.premium,
    power_consumption: "Power Consumption & Roof Area",
    pv_modules: "Solar Modules (PV Modules Tech)",

    // Tiles & Marble Studio
    tiles_title: optionTranslations.tiles.hi.title,
    tiles_desc: optionTranslations.tiles.hi.subtitle,

    // Buttons
    book_survey: "Book Free Site Survey",
    download_guidelines: "Download Guidelines"
  }
};

