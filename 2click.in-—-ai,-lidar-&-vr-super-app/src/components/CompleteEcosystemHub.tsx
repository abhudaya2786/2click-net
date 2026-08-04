import React, { useState } from 'react';
import {
  Sparkles,
  Building2,
  Paintbrush,
  Zap,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Search,
  Phone,
  MessageSquare,
  FileText,
  Calculator,
  Store,
  Truck,
  ArrowRight,
  Sun,
  Layers,
  ChevronRight,
  Star,
  Download,
  Info,
  Sliders,
  DollarSign,
  TrendingUp,
  Volume2,
  HelpCircle,
  Globe,
  User as UserIcon,
  ShoppingBag,
  Award,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { User } from '../types';
import { INDIAN_CITIES } from '../data/initialData';
import { logAnalyticsEvent } from '../lib/firebase';

interface CompleteEcosystemHubProps {
  currentUser?: User | null;
  onOpenAuth?: () => void;
  onNavigateTab?: (tabId: string) => void;
}

interface MaterialPackageOption {
  id: string;
  tierName: string;
  hindiLabel: string;
  tagline: string;
  ratePerSqftINR: number;
  badge: string;
  badgeBg: string;
  cementBrand: string;
  steelBrand: string;
  paintBrand: string;
  tilesBrand: string;
  electricalBrand: string;
  plumbingBrand: string;
  keyFeatures: string[];
}

const PACKAGE_TIERS: MaterialPackageOption[] = [
  {
    id: 'economy',
    tierName: 'Economy Budget Friendly',
    hindiLabel: 'बजट-फ्रेंडली (कम लागत में मजबूत घर)',
    tagline: 'Best for standard budget construction with durable certified local & national materials.',
    ratePerSqftINR: 1450,
    badge: 'Save 18%',
    badgeBg: 'bg-emerald-500 text-slate-950',
    cementBrand: 'Bangur / MP Birla / Prism Cement',
    steelBrand: 'Kamdhenu NXT / Prime TMT Fe500D',
    paintBrand: 'Asian Paints Tractor Emulsion / Berger Bison',
    tilesBrand: 'Orient Bell / Somany Vitrified 2x2',
    electricalBrand: 'Anchor by Panasonic / Finolex Wires',
    plumbingBrand: 'Prince Pipes / Supreme CPVC',
    keyFeatures: [
      'IS 456 Compliant Structural Material',
      'Anti-fungal standard interior paint',
      '2x2 Vitrified floor tiles',
      'Standard modular switches & copper wiring'
    ]
  },
  {
    id: 'standard',
    tierName: 'Standard Prime Quality',
    hindiLabel: 'स्टैंडर्ड प्राइम (सबसे लोकप्रिय पैकेज)',
    tagline: 'Most popular package balancing top-grade cement, TMT steel, smooth paint & branded fitting.',
    ratePerSqftINR: 1780,
    badge: 'Most Popular',
    badgeBg: 'bg-rose-500 text-white',
    cementBrand: 'UltraTech Super / Ambuja Kawach',
    steelBrand: 'Tata Tiscon 550SD / JSW Neosteel',
    paintBrand: 'Asian Paints Apcolite Premium / Berger Silk',
    tilesBrand: 'Kajaria Double Charge / Nitco Porcelain',
    electricalBrand: 'Havells HRFR Wires / Crabtree Switches',
    plumbingBrand: 'Astral CPVC / Ashirvad FlowGuard',
    keyFeatures: [
      'Waterproof Ambuja/UltraTech cement for roof slab',
      'Tata Tiscon corrosion resistant steel bars',
      'High-washability silk interior emulsion paint',
      '10-Year leak-proof CPVC plumbing warranty'
    ]
  },
  {
    id: 'luxury',
    tierName: 'Premium Luxury Villa',
    hindiLabel: 'प्रीमियम लक्जरी (विदेशी व इटैलियन फिनिश)',
    tagline: 'Ultra luxury experience with Royale paints, Italian marble look tiles, smart automation & solar.',
    ratePerSqftINR: 2350,
    badge: 'Premium Grade',
    badgeBg: 'bg-amber-400 text-slate-950',
    cementBrand: 'UltraTech Weather Plus / ACC Gold WaterShield',
    steelBrand: 'Tata Tiscon 550SD Anti-Corrosive',
    paintBrand: 'Asian Paints Royale Luxury Velvet / Dulux Velvet',
    tilesBrand: 'Kajaria Eternity Large Slabs / Italian Marble',
    electricalBrand: 'Schneider Electric / Legrand Smart Home',
    plumbingBrand: 'Kohler / Grohe Thermostatic Sanitary',
    keyFeatures: [
      'Teflon stain-washable luxury wall paint',
      'Large format porcelain slabs & Italian marble',
      'Smart home touch switches & solar roof ready',
      'Thermostatic rain showers & Kohler sanitaryware'
    ]
  }
];

const QUICK_SHOPKEEPERS_PREVIEW = [
  {
    id: 'sh-01',
    name: 'Gupta Paint & Automatic Tinting Hub',
    city: 'Lucknow',
    phone: '+91 98391 22334',
    brands: 'Asian Paints, Berger, Birla White',
    delivery: 'Free Site Delivery',
    rating: 4.9,
    verified: true
  },
  {
    id: 'sh-02',
    name: 'Shree Ji Building Hardware & Cement Depot',
    city: 'Varanasi',
    phone: '+91 94150 11223',
    brands: 'UltraTech, Tata Tiscon, Kamdhenu',
    delivery: 'Wholesale Truck Load',
    rating: 4.8,
    verified: true
  },
  {
    id: 'sh-03',
    name: 'National Sanitary, Tiles & Electrical Store',
    city: 'Kanpur',
    phone: '+91 98380 99887',
    brands: 'Kajaria, Havells, Astral, Kohler',
    delivery: '1-Day Express Delivery',
    rating: 4.9,
    verified: true
  }
];

export const CompleteEcosystemHub: React.FC<CompleteEcosystemHubProps> = ({
  currentUser,
  onOpenAuth,
  onNavigateTab
}) => {
  // Global Header State
  const [selectedCity, setSelectedCity] = useState<string>('Lucknow');
  const [selectedLanguage, setSelectedLanguage] = useState<'hi' | 'en'>('hi');
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // Budget Calculator State
  const [plotAreaSqft, setPlotAreaSqft] = useState<number>(1000);
  const [numberOfFloors, setNumberOfFloors] = useState<number>(2); // G+1
  const [selectedTierId, setSelectedTierId] = useState<string>('standard');
  const [customBudgetINR, setCustomBudgetINR] = useState<number>(0);

  // Search Bar
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeTier = PACKAGE_TIERS.find((t) => t.id === selectedTierId) || PACKAGE_TIERS[1];

  // Total built-up area
  const totalBuiltupSqft = plotAreaSqft * numberOfFloors;
  const totalEstimatedCostINR = totalBuiltupSqft * activeTier.ratePerSqftINR;

  // Breakdown calculation (standard civil ratios)
  const cementCostINR = Math.round(totalEstimatedCostINR * 0.16);
  const steelCostINR = Math.round(totalEstimatedCostINR * 0.18);
  const bricksSandCostINR = Math.round(totalEstimatedCostINR * 0.12);
  const paintCostINR = Math.round(totalEstimatedCostINR * 0.08);
  const tilesCostINR = Math.round(totalEstimatedCostINR * 0.10);
  const electricalPlumbingCostINR = Math.round(totalEstimatedCostINR * 0.12);
  const laborContractorCostINR = Math.round(totalEstimatedCostINR * 0.24);

  const handleVoiceAssistantTrigger = () => {
    setIsAudioPlaying(true);
    logAnalyticsEvent('voice_assistant_triggered', { language: selectedLanguage });
    const msg = selectedLanguage === 'hi' 
      ? "2click.in में आपका स्वागत है! यहाँ आप अपने मकान का एरिया या बजट चुनकर सीमेंट, सरिया, पेंट, टाइल्स और बिजली का पूरा रेट देख सकते हैं और नजदीकी दुकान से ऑर्डर कर सकते हैं।"
      : "Welcome to 2click.in! Here you can enter your plot area or budget to view instant brand rates for cement, steel, paint, tiles, and order directly from local verified shops.";

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-US';
      utterance.onend = () => setIsAudioPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsAudioPlaying(false), 4000);
    }
  };

  const handleWhatsAppQuote = (text: string) => {
    logAnalyticsEvent('whatsapp_ecosystem_quote_sent', { city: selectedCity, tier: selectedTierId });
    window.open(`https://wa.me/919839122334?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-10 animate-fade-in pb-16 font-sans text-slate-900 dark:text-slate-100">
      
      {/* 1. TOP HEADER & QUICK ACTION BAR (NEET & CLEAN ENTRY) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white font-black text-xl flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
              2C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  2Click<span className="text-rose-600 dark:text-rose-400">.in</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase">
                  Verified Ecosystem
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                मकान, दुकान व निर्माण सामग्री का 360° संपूर्ण डिजिटल समाधान
              </p>
            </div>
          </div>

          {/* Quick Actions: City, Language, Audio Guide, Auth */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 w-full lg:w-auto">
            
            {/* City Selector */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white font-black focus:outline-none cursor-pointer"
              >
                {INDIAN_CITIES.map((city) => (
                  <option key={city} value={city} className="dark:bg-slate-800 text-slate-900 dark:text-white">
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center rounded-2xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black">
              <button
                onClick={() => setSelectedLanguage('hi')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  selectedLanguage === 'hi'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setSelectedLanguage('en')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  selectedLanguage === 'en'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            {/* Listen Audio Voice Assistant */}
            <button
              onClick={handleVoiceAssistantTrigger}
              className={`px-3.5 py-2 rounded-2xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isAudioPlaying
                  ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
              title="बोलकर सुनें"
            >
              <Volume2 className="w-4 h-4 text-amber-500" />
              <span>{isAudioPlaying ? 'बोल रहा है...' : 'सुनें (Listen)'}</span>
            </button>

            {/* Login / Profile */}
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <UserIcon className="w-4 h-4" />
              <span>{currentUser ? currentUser.name : 'लॉगिन / साइनअप'}</span>
            </button>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative pt-2">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              selectedLanguage === 'hi'
                ? "खोजें: सीमेंट, टाटा टिसकॉन सरिया, एशियन पेंट, कजारिया टाइल्स, हैवेल्स या नजदीकी दुकानदार..."
                : "Search: Cement, Tata Tiscon TMT, Asian Paints, Kajaria Tiles, Havells, or local shops..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-2xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          />
        </div>
      </div>

      {/* 2. "हम क्या करते हैं?" CINEMATIC HERO INTRO WITH GRAPHICAL AMBIENT LIGHTING */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-rose-900/30">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl space-y-6 relative z-10">
          
          {/* Live Ecosystem Badge Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-black uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" /> 2Click.in — 360° Construction &amp; Material Engine
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live GST Market Rates ({selectedCity})
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
            {selectedLanguage === 'hi' ? (
              <>
                घर या दुकान निर्माण के लिए <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-rose-300 bg-clip-text text-transparent">सब कुछ एक जगह</span> — सही ब्रांड, सही रेट व भरोसेमंद दुकानदार!
              </>
            ) : (
              <>
                Complete Construction &amp; Material Ecosystem — <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-rose-300 bg-clip-text text-transparent">Right Brands, Fair Rates &amp; Verified Local Dealers</span>
              </>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-3xl">
            {selectedLanguage === 'hi' ? (
              "चाहे आपको सीमेंट, सरिया, पेंट, टाइल्स या बिजली का सामान खरीदना हो, अपने बजट के अनुसार ब्रांड चुनें, रेट लिस्ट देखें और अपने ही शहर के सत्यापित होलसेलर व दुकानदार से सीधे व्हॉट्सऐप या कॉल पर आर्डर करें।"
            ) : (
              "Whether buying cement, TMT steel, paints, tiles, or electrical fittings — compare top Indian brands, calculate itemized cost as per your budget, and directly connect with local GST-verified shopkeepers."
            )}
          </p>

          {/* CINEMATIC BRAND SHOWCASE BADGES */}
          <div className="pt-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-2">
              Official Ecosystem Brands (आधिकारिक ब्रांड पार्टनर):
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { name: 'UltraTech Cement', tag: 'No.1 Cement', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
                { name: 'Tata Tiscon 550SD', tag: 'Super Steel', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
                { name: 'Asian Paints Royale', tag: 'Luxury Paint', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
                { name: 'Kajaria Vitrified', tag: '2x2 Tiles', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
                { name: 'Havells & Polycab', tag: 'FRLS Wires', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
                { name: 'Astral & Jaquar', tag: 'CPVC Baths', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
                { name: 'Waaree Solar', tag: 'PM Surya Ghar', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
              ].map((brand) => (
                <div key={brand.name} className={`px-2.5 py-1 rounded-xl border text-[11px] font-black flex items-center gap-1.5 backdrop-blur-md ${brand.color}`}>
                  <span>{brand.name}</span>
                  <span className="text-[9px] px-1 rounded bg-black/40 text-slate-300 font-mono">{brand.tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3-STEP VISUAL CARDS WITH CINEMATIC GLASSMORPHISM */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-2 hover:-translate-y-1 transition duration-300 hover:bg-white/15 hover:border-rose-400/50">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-rose-500/30">
                1
              </div>
              <h3 className="font-extrabold text-sm text-white">
                {selectedLanguage === 'hi' ? '1. एरिया व बजट चुनें' : '1. Select Area & Budget'}
              </h3>
              <p className="text-[11px] text-slate-300">
                1000 sq ft या ₹15 लाख के अनुसार पूरा मैटेरियल ब्रेकडाउन निकालें।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-2 hover:-translate-y-1 transition duration-300 hover:bg-white/15 hover:border-amber-400/50">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg shadow-amber-500/30">
                2
              </div>
              <h3 className="font-extrabold text-sm text-white">
                {selectedLanguage === 'hi' ? '2. ब्रांड व रेट कम्पेयर करें' : '2. Compare Brand Rates'}
              </h3>
              <p className="text-[11px] text-slate-300">
                Ultratech, Tata Tiscon, Asian Paints, Kajaria के लाइव थोक रेट देखें।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-2 hover:-translate-y-1 transition duration-300 hover:bg-white/15 hover:border-emerald-400/50">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-300 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg shadow-emerald-500/30">
                3
              </div>
              <h3 className="font-extrabold text-sm text-white">
                {selectedLanguage === 'hi' ? '3. दुकान से डायरेक्ट लें' : '3. Direct Shopkeeper Order'}
              </h3>
              <p className="text-[11px] text-slate-300">
                {selectedCity} के पास के GST सत्यापित वेंडर से WhatsApp/कॉल पर आर्डर करें।
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* 3. BUDGET & MATERIAL CUSTOMIZER ENGINE (बजट व मटीरियल सेलेक्टर) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase">
              Budget &amp; Material Package Engine
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              अपने बजट व प्लॉट साइज के अनुसार संपूर्ण सामग्री और ब्रांड पैकेज बनाएं
            </h2>
            <p className="text-xs text-slate-500">
              Select built-up area &amp; material quality tier to view estimated costs and matching brand combinations.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono font-black text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <Calculator className="w-4 h-4" />
            <span>₹{totalEstimatedCostINR.toLocaleString('en-IN')} Total Est.</span>
          </div>
        </div>

        {/* INPUT CONTROLS: Area & Floors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              1. मकान का प्लॉट एरिया (Plot Area in Sq.Ft):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={plotAreaSqft}
                onChange={(e) => setPlotAreaSqft(Math.max(100, Number(e.target.value)))}
                className="w-full p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-bold font-mono text-slate-900 dark:text-white"
              />
              <span className="text-xs text-slate-500 font-bold shrink-0">Sq.Ft</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              2. मंजिलों की संख्या (Floors Construction):
            </label>
            <select
              value={numberOfFloors}
              onChange={(e) => setNumberOfFloors(Number(e.target.value))}
              className="w-full p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
            >
              <option value={1}>केवल ग्राउंड फ्लोर (Single Floor - Ground Only)</option>
              <option value={2}>ग्राउंड + 1 मंजिल (G + 1 Duplex House)</option>
              <option value={3}>ग्राउंड + 2 मंजिल (G + 2 Triple Storey)</option>
              <option value={4}>ग्राउंड + 3 मंजिल (G + 3 Apartment Block)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              कुल निर्मित क्षेत्र (Total Built-Up Area):
            </label>
            <div className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-700/80 font-mono font-black text-base text-slate-900 dark:text-white">
              {totalBuiltupSqft.toLocaleString('en-IN')} Sq.Ft
            </div>
          </div>
        </div>

        {/* PACKAGE TIER SELECTION CARDS */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            3. सामग्री व ब्रांड श्रेणी का चयन करें (Select Material &amp; Brand Quality Grade):
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PACKAGE_TIERS.map((tier) => {
              const tierEstCost = totalBuiltupSqft * tier.ratePerSqftINR;
              const isSelected = selectedTierId === tier.id;

              return (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTierId(tier.id)}
                  className={`p-5 rounded-3xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 shadow-xl ring-2 ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${tier.badgeBg}`}>
                          {tier.badge}
                        </span>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                          {tier.hindiLabel}
                        </h3>
                      </div>
                      <span className="font-mono font-black text-xs text-slate-500 dark:text-slate-400 shrink-0">
                        ₹{tier.ratePerSqftINR}/sq.ft
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {tier.tagline}
                    </p>

                    <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1.5 font-medium">
                      <div className="flex justify-between">
                        <span className="text-slate-400">सीमेंट:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{tier.cementBrand}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">सरिया (TMT):</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{tier.steelBrand}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">पेंट:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{tier.paintBrand}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">टाइल्स:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{tier.tilesBrand}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-baseline justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Total</span>
                    <span className="font-mono font-black text-lg text-rose-600 dark:text-rose-400">
                      ₹{tierEstCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ITEMIZED MATERIAL & COST BREAKDOWN */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-rose-400" />
                मकान निर्माण सामग्री का मद-वार बजट विभाजन ({activeTier.tierName})
              </h3>
              <p className="text-xs text-slate-400">
                Itemized expense allocation based on civil engineering standard ratios for {totalBuiltupSqft.toLocaleString('en-IN')} sq.ft.
              </p>
            </div>

            <button
              onClick={() => handleWhatsAppQuote(`Hello 2Click.in, I need complete material quote for ${totalBuiltupSqft} sq.ft construction in ${selectedCity} with ${activeTier.tierName} package.`)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-lg shrink-0"
            >
              <MessageSquare className="w-4 h-4 fill-white" /> WhatsApp Complete Estimate Quote
            </button>
          </div>

          {/* VISUAL GRAPHICAL MULTI-SEGMENT COST SHARE BAR CHART */}
          <div className="space-y-2 py-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span>ग्राफिकल बजट विभाजन (Cost Ratio Visualization)</span>
              <span className="font-mono text-rose-400">Total: 100%</span>
            </div>
            
            <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-700">
              <div style={{ width: '16%' }} className="bg-blue-500 h-full rounded-l-full relative group cursor-pointer transition-all hover:brightness-125" title="Cement: 16%">
                <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-950 text-[10px] text-white rounded border border-slate-700 whitespace-nowrap z-20">
                  Cement 16% (₹{cementCostINR.toLocaleString('en-IN')})
                </div>
              </div>
              <div style={{ width: '18%' }} className="bg-rose-500 h-full relative group cursor-pointer transition-all hover:brightness-125" title="TMT Steel: 18%">
                <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-950 text-[10px] text-white rounded border border-slate-700 whitespace-nowrap z-20">
                  TMT Steel 18% (₹{steelCostINR.toLocaleString('en-IN')})
                </div>
              </div>
              <div style={{ width: '12%' }} className="bg-amber-500 h-full relative group cursor-pointer transition-all hover:brightness-125" title="Bricks & Sand: 12%">
                <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-950 text-[10px] text-white rounded border border-slate-700 whitespace-nowrap z-20">
                  Bricks & Sand 12% (₹{bricksSandCostINR.toLocaleString('en-IN')})
                </div>
              </div>
              <div style={{ width: '8%' }} className="bg-purple-500 h-full relative group cursor-pointer transition-all hover:brightness-125" title="Paint: 8%">
                <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-950 text-[10px] text-white rounded border border-slate-700 whitespace-nowrap z-20">
                  Paint & Putty 8% (₹{paintCostINR.toLocaleString('en-IN')})
                </div>
              </div>
              <div style={{ width: '10%' }} className="bg-emerald-500 h-full relative group cursor-pointer transition-all hover:brightness-125" title="Tiles: 10%">
                <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-950 text-[10px] text-white rounded border border-slate-700 whitespace-nowrap z-20">
                  Tiles & Marble 10% (₹{tilesCostINR.toLocaleString('en-IN')})
                </div>
              </div>
              <div style={{ width: '12%' }} className="bg-cyan-500 h-full relative group cursor-pointer transition-all hover:brightness-125" title="MEP: 12%">
                <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-950 text-[10px] text-white rounded border border-slate-700 whitespace-nowrap z-20">
                  Electrical & Plumbing 12% (₹{electricalPlumbingCostINR.toLocaleString('en-IN')})
                </div>
              </div>
              <div style={{ width: '24%' }} className="bg-indigo-500 h-full rounded-r-full relative group cursor-pointer transition-all hover:brightness-125" title="Labor: 24%">
                <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-950 text-[10px] text-white rounded border border-slate-700 whitespace-nowrap z-20">
                  Labor & Contractor 24% (₹{laborContractorCostINR.toLocaleString('en-IN')})
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400 font-medium pt-1">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"/> सीमेंट (16%)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"/> सरिया (18%)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"/> ईंट बालू (12%)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-purple-500 inline-block"/> पेंट (8%)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"/> टाइल्स (10%)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-cyan-500 inline-block"/> बिजली प्लंबिंग (12%)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block"/> लेबर ठेका (24%)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">1. सीमेंट (Cement)</span>
              <span className="text-base font-black text-rose-400 font-mono">₹{cementCostINR.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-400 block">{activeTier.cementBrand}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">2. सरिया TMT (Steel Bar)</span>
              <span className="text-base font-black text-rose-400 font-mono">₹{steelCostINR.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-400 block">{activeTier.steelBrand}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">3. ईंट, बालू व गिट्टी (Bricks &amp; Sand)</span>
              <span className="text-base font-black text-rose-400 font-mono">₹{bricksSandCostINR.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-400 block">Red Brick / AAC Block &amp; Coarse Sand</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">4. पेंट व पुट्टी (Paint &amp; Putty)</span>
              <span className="text-base font-black text-rose-400 font-mono">₹{paintCostINR.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-400 block">{activeTier.paintBrand}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">5. टाइल्स व मार्बल (Flooring Tiles)</span>
              <span className="text-base font-black text-rose-400 font-mono">₹{tilesCostINR.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-400 block">{activeTier.tilesBrand}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">6. इलेक्ट्रिक व प्लंबिंग (MEP Fittings)</span>
              <span className="text-base font-black text-rose-400 font-mono">₹{electricalPlumbingCostINR.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-400 block">{activeTier.electricalBrand} &amp; {activeTier.plumbingBrand}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1 sm:col-span-2">
              <span className="text-[10px] text-amber-400 font-bold uppercase block">7. लेबर व ठेकेदारी लागत (Labor &amp; Civil Contractor)</span>
              <span className="text-base font-black text-amber-300 font-mono">₹{laborContractorCostINR.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-400 block">Excluding material, skilled mistri &amp; mason labor charges</span>
            </div>

          </div>
        </div>

      </div>

      {/* 4. LOCAL SHOPKEEPERS & VERIFIED SUPPLIER DIRECTORY */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase">
                {selectedCity} Local Verified Shops
              </span>
              <span className="text-xs text-slate-400 font-bold">GST Verified</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              आपके नजदीकी हार्डवेयर, सीमेंट, पेंट व इलेक्ट्रिकल दुकानदार
            </h2>
            <p className="text-xs text-slate-500">
              Direct phone &amp; WhatsApp connection with authorized distributors and neighborhood paint/hardware storekeepers.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab && onNavigateTab('paints_catalog')}
            className="px-4 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl text-xs font-black hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Paintbrush className="w-4 h-4 text-rose-400" /> पेंट मैटेरियल व दुकान सूची खोलें
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {QUICK_SHOPKEEPERS_PREVIEW.map((shop) => (
            <div
              key={shop.id}
              className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between hover:shadow-lg transition"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white leading-snug">
                    {shop.name}
                  </h3>
                  <span className="flex items-center gap-1 text-amber-500 text-xs font-extrabold shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    {shop.rating}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{shop.city}, Main Market Area</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono space-y-1">
                  <span className="text-[10px] text-slate-400 block font-sans">मुख्य ब्रांड्स:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{shop.brands}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={`tel:${shop.phone}`}
                  className="py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> कॉल करें
                </a>

                <button
                  onClick={() => handleWhatsAppQuote(`Hello ${shop.name}, I found your shop on 2click.in and want to enquire about material rates in ${selectedCity}.`)}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-white" /> WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 5. EASY TOUCH NAVIGATION MODULES (FOR LOW LITERACY & QUICK ACCESS) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white">
              2Click.in संपूर्ण डिजिटल इकोसिस्टम मॉड्यूल (1-क्लिक एक्सेस)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            आसानी से अपने पसंदीदा टूल या सर्विस पर जाने के लिए नीचे दिए गए कार्ड्स पर क्लिक करें।
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <button
            onClick={() => onNavigateTab && onNavigateTab('paints_catalog')}
            className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left space-y-2 transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-black">
              <Paintbrush className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-white group-hover:text-rose-400 transition">
              1. पेंट कैटलॉग व रेट
            </h3>
            <p className="text-[11px] text-slate-400">
              Asian Paints, Berger, Nerolac कैटलॉग व शेड कार्ड
            </p>
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab('tiles_marble')}
            className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left space-y-2 transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-white group-hover:text-amber-400 transition">
              2. टाइल्स व मार्बल स्टूडियो
            </h3>
            <p className="text-[11px] text-slate-400">
              Kajaria 2x2 Box कैलकुलेटर व मिस्त्री रेट
            </p>
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab('solar')}
            className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left space-y-2 transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-black">
              <Sun className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-white group-hover:text-teal-400 transition">
              3. सोलर रूपटॉप व सब्सिडी
            </h3>
            <p className="text-[11px] text-slate-400">
              PM सूर्य घर सब्सिडी एवं KW पावर कैलकुलेटर
            </p>
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab('directory')}
            className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left space-y-2 transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-white group-hover:text-emerald-400 transition">
              4. ठेकेदार व ट्रांसपोर्टर
            </h3>
            <p className="text-[11px] text-slate-400">
              लोकल मिस्त्री, प्लंबर व ट्रांसपोर्टर सूची
            </p>
          </button>

        </div>
      </div>

    </div>
  );
};
