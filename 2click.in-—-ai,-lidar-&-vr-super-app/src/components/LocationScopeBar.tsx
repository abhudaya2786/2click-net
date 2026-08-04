import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Search, 
  SlidersHorizontal, 
  Globe, 
  Landmark, 
  Compass, 
  CheckCircle2, 
  ChevronDown,
  Sparkles,
  Crosshair
} from 'lucide-react';
import { useLocationScope, LocationScopeMode } from '../context/LocationContext';
import { INDIAN_CITIES } from '../data/initialData';
import { LocationSelectorModal } from './LocationSelectorModal';

interface LocationScopeBarProps {
  variant?: 'compact' | 'expanded' | 'filter_bar';
  className?: string;
}

export const LocationScopeBar: React.FC<LocationScopeBarProps> = ({ 
  variant = 'compact',
  className = ''
}) => {
  const {
    scopeMode,
    setScopeMode,
    pinCode,
    setPinCode,
    radiusKm,
    setRadiusKm,
    selectedCity,
    setSelectedCity,
    pinLocationLabel
  } = useLocationScope();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showHierarchyModal, setShowHierarchyModal] = useState(false);
  const [pinInput, setPinInput] = useState(pinCode);
  const [pinError, setPinError] = useState('');

  const RADIUS_OPTIONS = [
    { value: 5, label: '5 Km', desc: 'Local masons & nearby shops (Hyperlocal)' },
    { value: 10, label: '10 Km', desc: 'City / Tehsil level vendors' },
    { value: 25, label: '25 Km', desc: 'District level (Gorakhpur & surrounds)' },
    { value: 50, label: '50 Km', desc: 'Regional belt (Campierganj, Basti, Deoria)' },
    { value: 100, label: '100 Km+', desc: 'State level contractors' },
  ];

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pinInput.trim())) {
      setPinCode(pinInput.trim());
      setPinError('');
    } else {
      setPinError('Valid 6-digit Indian PIN required (e.g. 273212)');
    }
  };

  // Compact Header Bar variant
  if (variant === 'compact') {
    return (
      <div className={`relative flex items-center gap-2 ${className}`}>
        <div className="flex items-center bg-slate-800/90 hover:bg-slate-800 border border-teal-500/30 rounded-2xl p-1 text-white shadow-md text-xs transition">
          {/* Scope Mode Selector Buttons */}
          <button
            type="button"
            onClick={() => setScopeMode('hyperlocal')}
            title="📌 PIN Code / Hyperlocal Mode (5 Km)"
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition ${
              scopeMode === 'hyperlocal'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">📌 PIN</span>
          </button>

          <button
            type="button"
            onClick={() => setScopeMode('radius')}
            title="📏 Distance Radius Scope"
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition ${
              scopeMode === 'radius'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">📏 {radiusKm} Km</span>
          </button>

          <button
            type="button"
            onClick={() => setScopeMode('domestic')}
            title="🇮🇳 Domestic PAN-India Brands & Manufacturers"
            className={`px-2 py-1 rounded-xl font-bold flex items-center gap-1 transition ${
              scopeMode === 'domestic'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span className="hidden md:inline">🇮🇳 India</span>
          </button>

          <button
            type="button"
            onClick={() => setScopeMode('global')}
            title="🌐 Global Scope & NRI Projects"
            className={`px-2 py-1 rounded-xl font-bold flex items-center gap-1 transition ${
              scopeMode === 'global'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">🌐 Global</span>
          </button>

          {/* Location Trigger Dropdown */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="ml-1 pl-2 pr-2.5 py-1 bg-slate-900/80 hover:bg-slate-900 rounded-xl border border-teal-500/40 text-teal-300 font-extrabold flex items-center gap-1.5 transition text-[11px]"
          >
            <Crosshair className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span className="max-w-[120px] sm:max-w-[160px] truncate">{pinLocationLabel}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Floating Location Control Panel Modal Popover */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-teal-500/40 rounded-3xl p-4 shadow-2xl z-50 text-white space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-teal-400" />
                <h4 className="font-black text-xs text-white">Location Scope Navigation (#location-scope)</h4>
              </div>
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* PIN Code Search Form */}
            <div>
              <label className="block text-[11px] font-bold text-teal-300 mb-1">
                📌 Search 6-Digit Indian PIN Code (e.g. 273212, 273001)
              </label>
              <form onSubmit={handlePinSubmit} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="273212"
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-500 text-slate-950 font-black rounded-xl text-xs hover:bg-teal-400 shrink-0 transition"
                >
                  Set PIN
                </button>
              </form>
              {pinError && <p className="text-[10px] text-rose-400 font-bold mt-1">{pinError}</p>}
            </div>

            {/* Distance Radius Slider & Presets */}
            <div>
              <div className="flex justify-between items-center mb-1 text-[11px]">
                <span className="font-bold text-slate-300">📏 Radius Distance Scope:</span>
                <span className="font-mono font-black text-teal-300 bg-teal-950 px-2 py-0.5 rounded-md border border-teal-800">
                  {radiusKm} Km Radius
                </span>
              </div>

              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={radiusKm}
                onChange={(e) => {
                  setRadiusKm(Number(e.target.value));
                  setScopeMode('radius');
                }}
                className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              <div className="grid grid-cols-5 gap-1 mt-2">
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setRadiusKm(opt.value);
                      setScopeMode('radius');
                    }}
                    className={`py-1 text-[10px] font-extrabold rounded-lg border transition ${
                      radiusKm === opt.value && scopeMode === 'radius'
                        ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-sm'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* City Level Dropdown Option */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-300">
                  🏙️ District Hub City:
                </label>
                <button
                  type="button"
                  onClick={() => setShowHierarchyModal(true)}
                  className="text-[10px] font-extrabold text-teal-400 hover:text-teal-300 underline"
                >
                  📍 पूर्ण राज्य/जिला/तहसील चुनें
                </button>
              </div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Lucknow">Lucknow (Hazratganj, Gomti Nagar, Alambagh)</option>
                <option value="Gorakhpur">Gorakhpur (Campierganj, GDA, AIIMS)</option>
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Active Scope Summary */}
            <div className="p-2.5 bg-teal-950/60 border border-teal-800/60 rounded-xl text-[11px] text-teal-200 flex items-center justify-between">
              <span>Active Scope: <strong>{scopeMode.toUpperCase()} ({radiusKm} Km)</strong></span>
              <span className="text-[10px] bg-teal-500/20 px-2 py-0.5 rounded-full font-mono text-teal-300">
                Live Filtering Enabled
              </span>
            </div>
          </div>
        )}

        <LocationSelectorModal
          isOpen={showHierarchyModal}
          onClose={() => setShowHierarchyModal(false)}
        />
      </div>
    );
  }

  // Filter Bar Variant (Embedded in Vendors / Dukandar Marketplace)
  return (
    <div className={`bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-teal-800/60 rounded-3xl p-4 sm:p-5 shadow-xl text-white space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-500/20 text-teal-300 rounded-2xl border border-teal-500/30">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm text-white flex items-center gap-2">
              📍 Geo-Radius &amp; Hyperlocal Scope Engine (#location-scope)
            </h3>
            <p className="text-[11px] text-slate-300">
              Filter local masons, cement/steel dukandars, plumbers, &amp; ETP/STP dealers by distance radius
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHierarchyModal(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 rounded-xl text-xs font-black shadow-md transition flex items-center gap-1 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>लोकेशन बदलें (State/District/Tehsil)</span>
          </button>
          <span className="px-3 py-1 bg-teal-500/10 text-teal-300 rounded-full border border-teal-500/20 font-mono text-xs font-extrabold hidden lg:inline">
            {pinLocationLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        {/* Scope Mode Options */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-300">
            1. Search Scope Mode (लोकेशन का दायरा चुनें):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => setScopeMode('hyperlocal')}
              className={`p-2 rounded-2xl font-bold flex flex-col items-center justify-center text-center gap-1 border transition ${
                scopeMode === 'hyperlocal'
                  ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span className="text-[10px]">📌 Hyperlocal</span>
              <span className="text-[9px] opacity-80">&lt; 5 Km</span>
            </button>

            <button
              type="button"
              onClick={() => setScopeMode('radius')}
              className={`p-2 rounded-2xl font-bold flex flex-col items-center justify-center text-center gap-1 border transition ${
                scopeMode === 'radius'
                  ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span className="text-[10px]">📏 Radius</span>
              <span className="text-[9px] opacity-80">{radiusKm} Km</span>
            </button>

            <button
              type="button"
              onClick={() => setScopeMode('domestic')}
              className={`p-2 rounded-2xl font-bold flex flex-col items-center justify-center text-center gap-1 border transition ${
                scopeMode === 'domestic'
                  ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span className="text-[10px]">🇮🇳 Domestic</span>
              <span className="text-[9px] opacity-80">PAN India</span>
            </button>

            <button
              type="button"
              onClick={() => setScopeMode('global')}
              className={`p-2 rounded-2xl font-bold flex flex-col items-center justify-center text-center gap-1 border transition ${
                scopeMode === 'global'
                  ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="text-[10px]">🌐 Global</span>
              <span className="text-[9px] opacity-80">Import/NRI</span>
            </button>
          </div>
        </div>

        {/* PIN Code Search Input */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-300">
            2. 📌 Enter 6-Digit PIN Code:
          </label>
          <form onSubmit={handlePinSubmit} className="flex gap-1.5">
            <input
              type="text"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="e.g. 273212"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-teal-500 text-slate-950 font-black rounded-xl text-xs hover:bg-teal-400 shrink-0 transition"
            >
              Apply
            </button>
          </form>
          {pinError && <p className="text-[10px] text-rose-400 font-bold">{pinError}</p>}
        </div>

        {/* Radius Distance Selector */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px]">
            <label className="font-bold text-slate-300">3. 📏 Radius Limit:</label>
            <span className="font-mono font-black text-teal-300">{radiusKm} Km</span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setRadiusKm(opt.value);
                  setScopeMode('radius');
                }}
                className={`py-1.5 text-[10px] font-extrabold rounded-lg border transition ${
                  radiusKm === opt.value && scopeMode === 'radius'
                    ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
