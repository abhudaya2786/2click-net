// Multiple Dashboard Layout & Design Preset Engine

export interface DashboardDesignPreset {
  id: string;
  name: string;
  nameHindi: string;
  badge: string;
  description: string;
  cardStyle: string;
  containerBg: string;
  headerBanner: string;
  layoutGrid: 'executive' | 'contractor' | 'bento' | 'minimal' | 'field_mobile';
  icon: string;
}

export const DASHBOARD_DESIGN_PRESETS: DashboardDesignPreset[] = [
  {
    id: 'executive',
    name: 'Executive Command Center',
    nameHindi: 'एग्जीक्यूटिव कमांड सेंटर (क्लासिक फोर-ग्रिड)',
    badge: 'Standard B2B Grid',
    description: 'Balanced 4-quadrant grid featuring revenue charts, active projects, BOQ totals, and quick actions.',
    cardStyle: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md rounded-2xl',
    containerBg: 'space-y-6',
    headerBanner: 'bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 text-white border-b border-teal-500/20',
    layoutGrid: 'executive',
    icon: '📊'
  },
  {
    id: 'bento',
    name: 'Modern Bento Box Matrix',
    nameHindi: 'मॉडर्न बेंटो बॉक्स मैट्रिक्स (हाई-टेक विजेट्स)',
    badge: 'High-Tech Modern',
    description: 'Asymmetric Bento box layout with large visual KPI hero cards, micro-charts, and AI Insights drawer.',
    cardStyle: 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-xl rounded-3xl',
    containerBg: 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4',
    headerBanner: 'bg-gradient-to-r from-indigo-950 via-slate-900 to-teal-950 text-white rounded-3xl border border-indigo-500/30 shadow-2xl',
    layoutGrid: 'bento',
    icon: '🍱'
  },
  {
    id: 'contractor',
    name: 'Contractor Fast Command',
    nameHindi: 'ठेकेदार फ़ास्ट कमांड सेंटर (हाई-डेंसिटी डेटा)',
    badge: 'High-Density Table',
    description: 'Data-dense layout with live site status tables, BOQ approval queues, material rates, and one-tap tenders.',
    cardStyle: 'bg-slate-900 text-white border border-slate-800 rounded-2xl p-4 shadow-lg',
    containerBg: 'space-y-4 font-mono text-xs',
    headerBanner: 'bg-slate-950 text-emerald-400 border-b-2 border-emerald-500 p-4',
    layoutGrid: 'contractor',
    icon: '🏗️'
  },
  {
    id: 'minimal',
    name: 'Nordic Clean Analytics',
    nameHindi: 'नॉर्डिक क्लीन एनालिटिक्स (मिनिमल सफ़ेद लुक)',
    badge: 'Ultra-Clean Space',
    description: 'Spacious, high-contrast light layout with generous whitespace, crisp typography, and subtle border lines.',
    cardStyle: 'bg-white text-slate-900 border border-slate-200 shadow-sm rounded-xl p-6',
    containerBg: 'max-w-5xl mx-auto space-y-8',
    headerBanner: 'bg-slate-50 border-b border-slate-200 text-slate-900 py-8 px-6',
    layoutGrid: 'minimal',
    icon: '❄️'
  },
  {
    id: 'field_mobile',
    name: 'Site Engineer Field Hub',
    nameHindi: 'साइट इंजीनियर फ़ील्ड हब (मोबाइल-फर्स्ट टच-फ़्रेंडली)',
    badge: 'Field Engineers',
    description: 'Large touch target cards designed for quick field inspections, daily labor logs, and photo uploads on site.',
    cardStyle: 'bg-teal-950 text-teal-100 border-2 border-teal-500/40 rounded-3xl p-5 shadow-2xl',
    containerBg: 'space-y-5 max-w-xl mx-auto',
    headerBanner: 'bg-teal-900 text-white p-5 rounded-2xl border border-teal-400/40',
    layoutGrid: 'field_mobile',
    icon: '📱'
  }
];
