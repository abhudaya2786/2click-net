import React, { useState } from 'react';
import { 
  Building2, 
  Sun, 
  Sparkles, 
  Box, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Maximize2,
  FileText,
  Eye,
  Sliders,
  Lock,
  UserCheck,
  Search,
  Compass,
  ChevronRight,
  LayoutGrid
} from 'lucide-react';
import { INDIAN_CITIES } from '../data/initialData';
import { CompleteEcosystemHub } from './CompleteEcosystemHub';
import { User } from '../types';

interface HeroSectionProps {
  onNavigate: (tab: string, quickData?: any) => void;
  selectedCity: string;
  currentUser?: User | null;
  onOpenAuth?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  onNavigate, 
  selectedCity,
  currentUser,
  onOpenAuth 
}) => {
  const [activeSlide, setActiveSlide] = useState<'slide1_fancy' | 'slide2_engine'>('slide1_fancy');
  const [projectType, setProjectType] = useState<'construction' | 'solar' | 'interior'>('construction');
  const [areaSqft, setAreaSqft] = useState<number>(1800);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const categoriesList = [
    { id: 'all', name: 'सब देखें (All Services)', icon: '✨' },
    { id: 'boq', name: 'प्रोजेक्ट कैलकुलेटर (BOQ)', icon: '🏗️', tab: 'construction' },
    { id: 'lidar', name: '3D LiDAR & सर्वे', icon: '📡', tab: 'lidar_terrain' },
    { id: 'solar', name: 'सोलर रूफटॉप', icon: '☀️', tab: 'solar' },
    { id: 'naksha', name: '3D नक्शा व वास्तु', icon: '🏛️', tab: 'naksha_vastu' },
    { id: 'dukandar', name: 'दुकानदार B2B hub', icon: '🏪', tab: 'dukandar_market' },
    { id: 'logistics', name: 'ट्रांसपोर्ट व रेट्स', icon: '🚚', tab: 'logistics' },
    { id: 'mep', name: 'इलेक्ट्रिकल व प्लंबिंग', icon: '⚡', tab: 'electrical_elv' },
  ];

  const handleQuickEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate(projectType, { areaSqft, city: selectedCity });
  };

  return (
    <div className="space-y-6">
      
      {/* 2-SLIDE VIEW SWITCHER TOP NAVIGATION */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900/90 text-white rounded-2xl border border-slate-700/80 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span className="text-xs font-black text-slate-200 tracking-wide">
            2CLICK DISPLAY MODE:
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto justify-center">
          <button
            type="button"
            onClick={() => setActiveSlide('slide1_fancy')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSlide === 'slide1_fancy'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>स्लाइड 1: 2Click Sober Home (Sober Showcase)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSlide('slide2_engine')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSlide === 'slide2_engine'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>स्लाइड 2: लाइव कैलकुलेटर एवं डैशबोर्ड</span>
          </button>
        </div>
      </div>

      {/* SLIDE 1: FANCY CLEAN SOWER WEBSITE (Cushman & Wakefield / Myntra Style Clean Showcase) */}
      {activeSlide === 'slide1_fancy' && (
        <section className="relative overflow-hidden bg-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-10">
          
          {/* Ambient Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* User Status Header Bar */}
          {!currentUser ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto shadow-md">
              <div className="flex items-center gap-2.5 text-left">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>सार्वजनिक वर्शन (Public Showcase):</strong> मूल जानकारी एवं ओवरव्यू सुलभ हैं। आंतरिक कैलकुलेटर, दुकान डैशबोर्ड व फाइलें <strong>लॉगिन के बाद ही खुलेंगी</strong>।
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow-sm transition"
              >
                लॉगिन / साइन-अप करें
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto shadow-md">
              <div className="flex items-center gap-2.5 text-left">
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>लॉगिन एक्टिव ({currentUser.role}):</strong> {currentUser.name || currentUser.companyName} — आपका स्पेशल पोर्टल तैयार है!
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (currentUser.role === 'Dukandar') onNavigate('dukandar_market');
                  else if (currentUser.role === 'SuperAdmin') onNavigate('super_admin');
                  else onNavigate('construction');
                }}
                className="px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow-md transition flex items-center gap-1.5"
              >
                <span>अपना रोल डैशबोर्ड खोलें ({currentUser.role})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Clean Sober Hero Card (Cushman & Wakefield Inspired) */}
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl max-w-5xl mx-auto relative z-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-teal-500/30 text-teal-300 text-xs font-black">
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span>DELIVER COMPLEX REAL ESTATE &amp; CONSTRUCTION PROJECTS WITH CERTAINTY</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              मकान, दुकान व निर्माण का <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-cyan-200 to-emerald-300">
                सटीक, डिजिटल व सुरक्षित प्लेटफ़ॉर्म
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
              2Click.in - Your trusted partner for planning, LiDAR 3D mapping, construction BOQ, solar rooftop, and verified building materials supply chain.
            </p>

            {/* Quick Clean Search Box */}
            <div className="max-w-xl mx-auto relative pt-2">
              <div className="flex items-center bg-slate-950 border border-slate-700 focus-within:border-teal-400 rounded-2xl p-2 shadow-inner">
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="खोजें: सीमेंट रेट, नक्शा, 3D LiDAR, सोलर सब्सिडी, इलेक्ट्रिक..."
                  className="w-full bg-transparent px-3 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => onNavigate('construction')}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer shrink-0"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Clean Category Navigation Pills */}
            <div className="flex flex-wrap justify-center gap-2 pt-3">
              {categoriesList.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryFilter(cat.id);
                    if (cat.tab) onNavigate(cat.tab);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    selectedCategoryFilter === cat.id
                      ? 'bg-teal-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Key Feature Categories Showcase (Grid Layout) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-teal-400" />
                <span>श्रेणी अनुसार मुख्य सेवाएं (Key Services by Category)</span>
              </h2>
              <span className="text-xs text-slate-400">
                चयनित क्षेत्र: <strong className="text-amber-300">🇮🇳 India | 🇳🇵 Nepal ({selectedCity})</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
              
              {/* Card 1: Project Calculator BOQ */}
              <div 
                onClick={() => onNavigate('construction')}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500 transition cursor-pointer group space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold text-xl">
                    🏗️
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-800 text-teal-300">
                    Civil Engine
                  </span>
                </div>
                <h3 className="text-sm font-black text-white group-hover:text-teal-300 transition">
                  Project Calculator &amp; BOQ (सिविल अनुमान)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  सीमेंट, सरिया (Fe550D), गिट्टी, बालू, ईंट व पेंट की सटीक मात्रा व स्थानीय बजट लिस्ट रिपोर्ट।
                </p>
                <div className="text-xs text-teal-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition pt-2">
                  <span>कैलकुलेटर खोलें</span> →
                </div>
              </div>

              {/* Card 2: 3D LiDAR & Contour Mapping */}
              <div 
                onClick={() => onNavigate('lidar_terrain')}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500 transition cursor-pointer group space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold text-xl">
                    📡
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-800 text-cyan-300">
                    LiDAR Survey
                  </span>
                </div>
                <h3 className="text-sm font-black text-white group-hover:text-cyan-300 transition">
                  3D LiDAR &amp; Contour Scanning (ड्रोन मैपिंग)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  भूमि व प्लॉट का उच्च-सटीक एलिवेशन, ढलान माप व कंटूर मैप डिजिटल सर्वे।
                </p>
                <div className="text-xs text-cyan-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition pt-2">
                  <span>LiDAR मैपिंग देखें</span> →
                </div>
              </div>

              {/* Card 3: Solar Rooftop Calc */}
              <div 
                onClick={() => onNavigate('solar')}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500 transition cursor-pointer group space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-xl">
                    ☀️
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-800 text-amber-300">
                    Solar ROI
                  </span>
                </div>
                <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition">
                  Rooftop Solar &amp; PM Surya Ghar Subsidy
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ₹78,000 तक की सरकारी सब्सिडी, नेट-मीटरिंग बचत व सोलर किलोवाट आवश्यकता का गणित।
                </p>
                <div className="text-xs text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition pt-2">
                  <span>सोलर कैलकुलेटर</span> →
                </div>
              </div>

              {/* Card 4: 3D Vastu & Naksha */}
              <div 
                onClick={() => onNavigate('naksha_vastu')}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500 transition cursor-pointer group space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xl">
                    🏛️
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-800 text-purple-300">
                    Architect
                  </span>
                </div>
                <h3 className="text-sm font-black text-white group-hover:text-purple-300 transition">
                  3D Naksha, Elevation &amp; Vastu Studio
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  प्लॉट साइज़ अनुसार 2D/3D हाउस प्लान, वास्तु कम्पलायंस व 3D फ्रंट एलिवेशन।
                </p>
                <div className="text-xs text-purple-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition pt-2">
                  <span>नक्शा स्टूडियो</span> →
                </div>
              </div>

              {/* Card 5: Dukandar B2B Hub */}
              <div 
                onClick={() => onNavigate('dukandar_market')}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500 transition cursor-pointer group space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xl">
                    🏪
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-800 text-emerald-300">
                    B2B Marketplace
                  </span>
                </div>
                <h3 className="text-sm font-black text-white group-hover:text-emerald-300 transition">
                  Dukandar &amp; Wholesale Materials Directory
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  नजदीकी अधिकृत सीमेंट, स्टील व बिल्डिंग मटीरियल दुकानदारों की डायरेक्ट लिस्टिंग व व्हाट्सएप ऑर्डर।
                </p>
                <div className="text-xs text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition pt-2">
                  <span>दुकानदार मार्केट</span> →
                </div>
              </div>

              {/* Card 6: Logistics & Rate Trends */}
              <div 
                onClick={() => onNavigate('logistics')}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500 transition cursor-pointer group space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xl">
                    🚚
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-800 text-blue-300">
                    Supply Chain
                  </span>
                </div>
                <h3 className="text-sm font-black text-white group-hover:text-blue-300 transition">
                  Logistics &amp; Material Rate Trends
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ट्रक ट्रांसपोर्ट बुकिंग, गिट्टी-ईंट ढुलाई किराया व लाइव बाजार मटीरियल रेट चार्ट।
                </p>
                <div className="text-xs text-blue-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition pt-2">
                  <span>ट्रांसपोर्ट व रेट्स</span> →
                </div>
              </div>

            </div>
          </div>

          {/* Sleek Trust Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <div>
              <div className="text-2xl font-black text-teal-400">12,400+</div>
              <div className="text-[11px] text-slate-400 mt-0.5">साइट सर्वे पूर्ण</div>
            </div>
            <div>
              <div className="text-2xl font-black text-teal-400">₹450 Cr+</div>
              <div className="text-[11px] text-slate-400 mt-0.5">मटीरियल बजट बचत</div>
            </div>
            <div>
              <div className="text-2xl font-black text-teal-400">IS 456</div>
              <div className="text-[11px] text-slate-400 mt-0.5">सर्टिफाइड सिविल फॉर्मूला</div>
            </div>
            <div>
              <div className="text-2xl font-black text-teal-400">200+</div>
              <div className="text-[11px] text-slate-400 mt-0.5">भारत व नेपाल जिले</div>
            </div>
          </div>

        </section>
      )}

      {/* SLIDE 2: FULL INTERACTIVE CALCULATORS & ECOSYSTEM HUB */}
      {activeSlide === 'slide2_engine' && (
        <div className="space-y-12 fade-in">
          {/* 2Click.in Integrated 360 Ecosystem Hub */}
          <CompleteEcosystemHub
            onNavigateTab={(tab) => onNavigate(tab)}
          />

          {/* Advanced AI & LiDAR Super App Preview Section */}
          <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-slate-50 dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-950 pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200/60 dark:border-slate-800 rounded-3xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 dark:bg-teal-950/80 border border-teal-300/80 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs font-semibold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>PM Surya Ghar Muft Bijli &amp; IS 456 Civil AI Engine Updated for 2026</span>
                </div>
              </div>

              <div className="mt-6 text-center max-w-4xl mx-auto">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                  AI, LiDAR &amp; VR Super App for{' '}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-cyan-600 to-violet-600 dark:from-teal-400 dark:via-cyan-300 dark:to-violet-400">
                    Construction, Solar &amp; Interiors
                  </span>
                </h1>
                <p className="mt-4 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  Instant AI Bill of Quantities (BOQ), 3D LiDAR terrain mapping, 360° VR interior walkthroughs, and rooftop solar ROI calculations in 2 clicks.
                </p>
              </div>

              {/* Quick Estimator Tool Bar */}
              <div className="mt-8 max-w-4xl mx-auto space-y-4">
                <div className="p-4 sm:p-6 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xl backdrop-blur-md">
                  
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-4">
                    <button
                      onClick={() => onNavigate('construction')}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-800 dark:text-slate-200 text-xs font-bold transition text-center cursor-pointer"
                    >
                      🏗️ Civil BOQ
                    </button>
                    <button
                      onClick={() => onNavigate('logistics')}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-800 dark:text-slate-200 text-xs font-bold transition text-center cursor-pointer"
                    >
                      🚚 Logistics
                    </button>
                    <button
                      onClick={() => onNavigate('water_etp_stp')}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-800 dark:text-slate-200 text-xs font-bold transition text-center cursor-pointer"
                    >
                      💧 ETP/STP
                    </button>
                    <button
                      onClick={() => onNavigate('electrical_elv')}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-800 dark:text-slate-200 text-xs font-bold transition text-center cursor-pointer"
                    >
                      ⚡ Electrical
                    </button>
                    <button
                      onClick={() => onNavigate('vendors_binding')}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-800 dark:text-slate-200 text-xs font-bold transition text-center cursor-pointer"
                    >
                      🤝 Bidding
                    </button>
                    <button
                      onClick={() => onNavigate('solar')}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-800 dark:text-slate-200 text-xs font-bold transition text-center cursor-pointer"
                    >
                      ☀️ Solar Engine
                    </button>
                  </div>

                  <form onSubmit={handleQuickEstimate} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Target Location
                      </label>
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
                        <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">🇮🇳|🇳🇵 {selectedCity}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {projectType === 'solar' ? 'Monthly Bill (INR ₹)' : 'Plot / Built-up Area (Sq.Ft)'}
                      </label>
                      <input
                        type="number"
                        value={areaSqft}
                        onChange={(e) => setAreaSqft(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder={projectType === 'solar' ? 'e.g. 4500' : 'e.g. 1800'}
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      >
                        <span>Generate Instant AI Estimate</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          </section>
        </div>
      )}

    </div>
  );
};
