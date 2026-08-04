import React, { useState, useEffect, useMemo } from 'react';
import { getSafeLocalStorage, setSafeLocalStorage } from '../lib/storage';
import { 
  Sun, 
  Zap, 
  DollarSign, 
  Award, 
  TreePine, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2,
  Calendar,
  Sparkles,
  PhoneCall,
  Sliders,
  FileSpreadsheet,
  Layers,
  Printer,
  Download,
  Wrench,
  Check,
  Building2,
  PackageCheck,
  HelpCircle,
  FileText,
  Plus,
  PlusCircle,
  Trash2,
  X,
  Tag
} from 'lucide-react';
import { SolarAnalysisResult } from '../types';
import { INDIAN_CITIES } from '../data/initialData';
import { useLanguage } from '../context/LanguageContext';
import { useOptionTranslation } from '../hooks/useOptionTranslation';

interface SolarRooftopCalcProps {
  selectedCity: string;
  onNavigate: (tab: string) => void;
}

export const SolarRooftopCalc: React.FC<SolarRooftopCalcProps> = ({ selectedCity, onNavigate }) => {
  // Global Language Hook & Solar Option Translation Hook
  const { t, language } = useLanguage();
  const isHi = language === 'hi' || language === 'bho';
  const { t: st } = useOptionTranslation('solar');

  // Primary Consumption States
  const [monthlyBill, setMonthlyBill] = useState<number>(4500);
  const [roofArea, setRoofArea] = useState<number>(650);
  const [city, setCity] = useState<string>(selectedCity);
  const [solarType, setSolarType] = useState<'On-Grid' | 'Hybrid' | 'Off-Grid'>('On-Grid');
  const [category, setCategory] = useState<'residential' | 'commercial' | 'industrial'>('residential');

  // View Mode: 'quick' or 'material_customizer' or 'boq_estimate'
  const [viewTab, setViewTab] = useState<'quick' | 'material_customizer' | 'boq_estimate'>('material_customizer');

  // --- DYNAMIC MATERIAL BRANDS LISTS (Local Storage Persisted) ---
  const [panelBrands, setPanelBrands] = useState<string[]>(() => {
    return getSafeLocalStorage<string[]>('solar_panel_brands', ['Waaree Energies', 'Tata Power Solar', 'Vikram Solar', 'Adani Solar', 'Premier Energies', 'Rayzon Solar', 'Goldi Solar', 'Servotech']);
  });

  const [inverterBrands, setInverterBrands] = useState<string[]>(() => {
    return getSafeLocalStorage<string[]>('solar_inverter_brands', ['Growatt', 'Havells (Enviro)', 'Sungrow', 'Luminous', 'Microtek', 'Fronius', 'Enphase', 'Solis', 'GoodWe']);
  });

  const [structureBrands, setStructureBrands] = useState<string[]>(() => {
    return getSafeLocalStorage<string[]>('solar_structure_brands', ['Metalkraft GI', 'Tata Structura', 'Jindal Steel HDG', 'Standard Aluminium Rail', 'Sterling & Wilson']);
  });

  const [protectionBrands, setProtectionBrands] = useState<string[]>(() => {
    return getSafeLocalStorage<string[]>('solar_protection_brands', ['Polycab Solar Cable', 'Havells Solar Cable', 'Finolex Solar', 'KEI Wires & SPD', 'Schneider Electric']);
  });

  const [batteryBrands, setBatteryBrands] = useState<string[]>(() => {
    return getSafeLocalStorage<string[]>('solar_battery_brands', ['Exide Industries', 'Amaron Volt', 'Luminous Power', 'Livguard', 'Eastman', 'UTL Solar', 'Okaya']);
  });

  // Selected Brand States
  const [panelBrand, setPanelBrand] = useState<string>('Waaree Energies');
  const [inverterBrand, setInverterBrand] = useState<string>('Growatt');
  const [structureBrand, setStructureBrand] = useState<string>('Metalkraft GI');
  const [protectionBrand, setProtectionBrand] = useState<string>('Polycab Solar Cable');
  const [batteryBrand, setBatteryBrand] = useState<string>('Exide Industries');

  // Add Brand Modal State
  const [addBrandCategory, setAddBrandCategory] = useState<'panel' | 'inverter' | 'structure' | 'protection' | 'battery' | null>(null);
  const [newBrandName, setNewBrandName] = useState<string>('');
  const [newBrandRate, setNewBrandRate] = useState<string>('');

  // 1. Solar Panels Specs & Rates
  const [panelTech, setPanelTech] = useState<'mono_perc' | 'bifacial_topcon' | 'polycrystalline' | 'glass_glass_flexible'>('mono_perc');
  const [panelRatePerWatt, setPanelRatePerWatt] = useState<number>(22); // ₹/Watt

  // 2. Solar Inverters Specs & Rates
  const [inverterTech, setInverterTech] = useState<'ongrid_string' | 'hybrid_mppt' | 'micro_inverter' | 'offgrid_pcu'>('ongrid_string');
  const [inverterRatePerKw, setInverterRatePerKw] = useState<number>(7500); // ₹/kW

  // 3. Mounting Structure Specs & Rates
  const [structureType, setStructureType] = useState<'standard_gi' | 'high_rise_pergola' | 'ballasted_flat'>('standard_gi');
  const [structureRatePerKw, setStructureRatePerKw] = useState<number>(3500); // ₹/kW

  // 4. Protection, Wiring & Earthing
  const [protectionType, setProtectionType] = useState<'standard' | 'premium'>('standard');
  const [protectionRatePerKw, setProtectionRatePerKw] = useState<number>(3800); // ₹/kW

  // 5. Battery Storage (for Hybrid / Off-Grid)
  const [batteryType, setBatteryType] = useState<'none' | 'lithium_5kwh' | 'tubular_150ah'>('none');
  const [batteryUnits, setBatteryUnits] = useState<number>(1);

  // 6. Installation Labor & DISCOM Fees
  const [laborRatePerKw, setLaborRatePerKw] = useState<number>(4500); // ₹/kW
  const [discomFee, setDiscomFee] = useState<number>(12000); // Flat ₹

  // Loading state & API result
  const [loading, setLoading] = useState<boolean>(false);
  const [apiResult, setApiResult] = useState<SolarAnalysisResult | null>(null);

  // Helper calculation for Tariff per unit
  const tariffPerUnit = category === 'residential' ? 7.5 : 9.5;
  const generationPerKwMonthly = 120; // Units/kW/mo

  // Calculate Capacity
  const estimatedUnits = Math.round(monthlyBill / tariffPerUnit);
  let recommendedKw = Math.max(1, Math.ceil(estimatedUnits / generationPerKwMonthly));
  if (recommendedKw > 50) recommendedKw = 50;

  const requiredAreaSqft = recommendedKw * 95;
  const totalSystemWatts = recommendedKw * 1000;

  // Material BOQ Costs calculation
  const totalPanelCost = totalSystemWatts * panelRatePerWatt;
  const totalInverterCost = recommendedKw * inverterRatePerKw;
  const totalStructureCost = recommendedKw * structureRatePerKw;
  const totalProtectionCost = recommendedKw * protectionRatePerKw;
  const totalLaborCost = recommendedKw * laborRatePerKw;
  
  const totalBatteryCost = batteryType === 'none' 
    ? 0 
    : batteryType === 'lithium_5kwh' 
      ? 115000 * batteryUnits 
      : 16000 * batteryUnits;

  const grossSystemCost = totalPanelCost + totalInverterCost + totalStructureCost + totalProtectionCost + totalLaborCost + totalBatteryCost + discomFee;

  // PM Surya Ghar Subsidy
  let pmSuryaGharSubsidy = 0;
  if (category === 'residential' && (solarType === 'On-Grid' || solarType === 'Hybrid')) {
    if (recommendedKw === 1) pmSuryaGharSubsidy = 30000;
    else if (recommendedKw === 2) pmSuryaGharSubsidy = 60000;
    else if (recommendedKw >= 3) pmSuryaGharSubsidy = 78000;
  }

  const netPayableCost = Math.max(0, grossSystemCost - pmSuryaGharSubsidy);
  const monthlySavings = Math.round(recommendedKw * generationPerKwMonthly * tariffPerUnit);
  const annualSavings = monthlySavings * 12;
  const paybackYears = Number((netPayableCost / (annualSavings || 1)).toFixed(1));
  const effectiveCostPerWatt = Number((grossSystemCost / totalSystemWatts).toFixed(1));

  // Add Brand Logic
  const handleSaveNewBrand = () => {
    if (!newBrandName.trim() || !addBrandCategory) {
      alert('कृपया ब्रांड का नाम दर्ज करें!');
      return;
    }

    const brandClean = newBrandName.trim();
    const rateVal = Number(newBrandRate);

    if (addBrandCategory === 'panel') {
      if (!panelBrands.includes(brandClean)) {
        const updated = [...panelBrands, brandClean];
        setPanelBrands(updated);
        localStorage.setItem('solar_panel_brands', JSON.stringify(updated));
      }
      setPanelBrand(brandClean);
      if (rateVal > 0) setPanelRatePerWatt(rateVal);
    } else if (addBrandCategory === 'inverter') {
      if (!inverterBrands.includes(brandClean)) {
        const updated = [...inverterBrands, brandClean];
        setInverterBrands(updated);
        localStorage.setItem('solar_inverter_brands', JSON.stringify(updated));
      }
      setInverterBrand(brandClean);
      if (rateVal > 0) setInverterRatePerKw(rateVal);
    } else if (addBrandCategory === 'structure') {
      if (!structureBrands.includes(brandClean)) {
        const updated = [...structureBrands, brandClean];
        setStructureBrands(updated);
        localStorage.setItem('solar_structure_brands', JSON.stringify(updated));
      }
      setStructureBrand(brandClean);
      if (rateVal > 0) setStructureRatePerKw(rateVal);
    } else if (addBrandCategory === 'protection') {
      if (!protectionBrands.includes(brandClean)) {
        const updated = [...protectionBrands, brandClean];
        setProtectionBrands(updated);
        localStorage.setItem('solar_protection_brands', JSON.stringify(updated));
      }
      setProtectionBrand(brandClean);
      if (rateVal > 0) setProtectionRatePerKw(rateVal);
    } else if (addBrandCategory === 'battery') {
      if (!batteryBrands.includes(brandClean)) {
        const updated = [...batteryBrands, brandClean];
        setBatteryBrands(updated);
        localStorage.setItem('solar_battery_brands', JSON.stringify(updated));
      }
      setBatteryBrand(brandClean);
    }

    setNewBrandName('');
    setNewBrandRate('');
    setAddBrandCategory(null);
    alert(`🎉 '${brandClean}' ब्रांड सूची में जोड़ दिया गया है!`);
  };

  // Delete Custom Brand Logic
  const handleDeleteBrand = (category: 'panel' | 'inverter' | 'structure' | 'protection' | 'battery', brandToDelete: string) => {
    if (!confirm(`क्या आप निश्चित रूप से '${brandToDelete}' ब्रांड को सूची से हटाना चाहते हैं?`)) return;

    if (category === 'panel') {
      const updated = panelBrands.filter(b => b !== brandToDelete);
      setPanelBrands(updated);
      localStorage.setItem('solar_panel_brands', JSON.stringify(updated));
      if (panelBrand === brandToDelete && updated.length > 0) setPanelBrand(updated[0]);
    } else if (category === 'inverter') {
      const updated = inverterBrands.filter(b => b !== brandToDelete);
      setInverterBrands(updated);
      localStorage.setItem('solar_inverter_brands', JSON.stringify(updated));
      if (inverterBrand === brandToDelete && updated.length > 0) setInverterBrand(updated[0]);
    } else if (category === 'structure') {
      const updated = structureBrands.filter(b => b !== brandToDelete);
      setStructureBrands(updated);
      localStorage.setItem('solar_structure_brands', JSON.stringify(updated));
      if (structureBrand === brandToDelete && updated.length > 0) setStructureBrand(updated[0]);
    } else if (category === 'protection') {
      const updated = protectionBrands.filter(b => b !== brandToDelete);
      setProtectionBrands(updated);
      localStorage.setItem('solar_protection_brands', JSON.stringify(updated));
      if (protectionBrand === brandToDelete && updated.length > 0) setProtectionBrand(updated[0]);
    } else if (category === 'battery') {
      const updated = batteryBrands.filter(b => b !== brandToDelete);
      setBatteryBrands(updated);
      localStorage.setItem('solar_battery_brands', JSON.stringify(updated));
      if (batteryBrand === brandToDelete && updated.length > 0) setBatteryBrand(updated[0]);
    }
  };

  // Package Preset Handler
  const handleApplyPreset = (preset: 'economy' | 'standard' | 'premium') => {
    if (preset === 'economy') {
      setPanelTech('polycrystalline');
      setPanelRatePerWatt(18);
      setInverterTech('ongrid_string');
      setInverterRatePerKw(6800);
      setStructureType('standard_gi');
      setStructureRatePerKw(3000);
      setProtectionType('standard');
      setProtectionRatePerKw(3200);
      setLaborRatePerKw(4000);
      setBatteryType('none');
    } else if (preset === 'standard') {
      setPanelTech('mono_perc');
      setPanelRatePerWatt(22);
      setInverterTech('ongrid_string');
      setInverterRatePerKw(7500);
      setStructureType('standard_gi');
      setStructureRatePerKw(3500);
      setProtectionType('standard');
      setProtectionRatePerKw(3800);
      setLaborRatePerKw(4500);
      if (solarType === 'Off-Grid') {
        setBatteryType('tubular_150ah');
        setBatteryUnits(2);
      } else {
        setBatteryType('none');
      }
    } else if (preset === 'premium') {
      setPanelTech('bifacial_topcon');
      setPanelRatePerWatt(26);
      setInverterTech('hybrid_mppt');
      setInverterRatePerKw(14000);
      setStructureType('high_rise_pergola');
      setStructureRatePerKw(7000);
      setProtectionType('premium');
      setProtectionRatePerKw(6200);
      setLaborRatePerKw(5500);
      if (solarType !== 'On-Grid') {
        setBatteryType('lithium_5kwh');
        setBatteryUnits(1);
      }
    }
  };

  // Sync with AI endpoint if needed
  const calculateSolarApi = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/solar-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyBillINR: monthlyBill,
          roofAreaSqft: roofArea,
          city
        })
      });
      const data = await res.json();
      if (data.analysis) {
        setApiResult(data.analysis);
      }
    } catch (e) {
      console.error('Solar calculation AI call error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateSolarApi();
  }, [monthlyBill, roofArea, city]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sun className="w-6 h-6 animate-spin-slow" />
            </span>
            <h1 className="text-2xl font-extrabold text-white">
              {st('title')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {st('subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Award className="w-4 h-4 text-amber-400" />
            <span>PM Surya Ghar Subsidy (₹78,000 Max) Eligible</span>
          </div>
        </div>
      </div>

      {/* Main Mode Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-2 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewTab('material_customizer')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition ${
              viewTab === 'material_customizer'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" /> {st('materialBtn')}
          </button>

          <button
            onClick={() => setViewTab('boq_estimate')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition ${
              viewTab === 'boq_estimate'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> {st('boqBtn')}
          </button>

          <button
            onClick={() => setViewTab('quick')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition ${
              viewTab === 'quick'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" /> ⚡ {isHi ? 'त्वरित ऊर्जा एवं बचत रिपोर्ट' : 'Quick Savings & Energy Report'}
          </button>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
          <span className="text-slate-400 px-2 font-semibold hidden sm:inline">{st('quickRate')}</span>
          <button
            onClick={() => handleApplyPreset('economy')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
            title="Polycrystalline Panel + Basic On-Grid Inverter"
          >
            {st('budget')}
          </button>
          <button
            onClick={() => handleApplyPreset('standard')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold"
            title="Mono PERC 540W + String Inverter"
          >
            {st('standard')}
          </button>
          <button
            onClick={() => handleApplyPreset('premium')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold"
            title="TopCon Bifacial + Hybrid MPPT + Pergola"
          >
            {st('premium')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CONSUMPTION & SYSTEM CAPACITY INPUTS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Zap className="w-4 h-4 text-amber-400" />
              1. {isHi ? 'बिजली खपत एवं छत का क्षेत्र (Basic Profile)' : 'Power Consumption & Roof Area'}
            </h2>

            {/* Consumer Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">{isHi ? 'उपभोक्ता श्रेणी (Category):' : 'Consumer Category:'}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'residential', label: isHi ? '🏡 घरेलू (Domestic)' : '🏡 Domestic' },
                  { id: 'commercial', label: isHi ? '🏢 कमर्शियल' : '🏢 Commercial' },
                  { id: 'industrial', label: isHi ? '🏭 इंडस्ट्रियल' : '🏭 Industrial' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id as any)}
                    className={`py-2 px-1.5 text-[11px] font-bold rounded-xl border transition text-center ${
                      category === item.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Bill Range */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">{isHi ? 'औसत मासिक बिजली बिल:' : 'Avg. Monthly Electricity Bill:'}</span>
                <span className="text-amber-400 font-bold">₹{monthlyBill.toLocaleString('en-IN')} / {isHi ? 'माह' : 'mo'}</span>
              </div>
              <input
                type="range"
                min={1000}
                max={50000}
                step={500}
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer bg-slate-950 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>₹1,000</span>
                <span>₹25,000</span>
                <span>₹50,000+</span>
              </div>
            </div>

            {/* Roof Area */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">{isHi ? 'उपलब्ध छाया-रहित छत एरिया (Sq.Ft):' : 'Available Shadow-Free Roof Area (Sq.Ft):'}</span>
                <span className="text-amber-400 font-bold">{roofArea} Sq.Ft</span>
              </div>
              <input
                type="range"
                min={100}
                max={5000}
                step={50}
                value={roofArea}
                onChange={(e) => setRoofArea(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer bg-slate-950 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>100 sqft</span>
                <span>2,500 sqft</span>
                <span>5,000 sqft</span>
              </div>
              {roofArea < requiredAreaSqft && (
                <p className="text-[11px] text-amber-400 mt-1.5 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  ⚠️ {isHi ? `नोट: ${recommendedKw} kW प्लांट हेतु कम से कम ${requiredAreaSqft} Sq.Ft छत का स्थान अनुशंसित है।` : `Note: At least ${requiredAreaSqft} Sq.Ft shadow-free roof area is recommended for a ${recommendedKw} kW solar plant.`}
                </p>
              )}
            </div>

            {/* City Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'शहर / डिस्कॉम जोन (City DISCOM Tariff Zone):' : 'City / DISCOM Tariff Zone:'}
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {INDIAN_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Topology / System Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">{isHi ? 'सोलर सिस्टम का प्रकार (Topology):' : 'Solar System Topology:'}</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                {(['On-Grid', 'Hybrid', 'Off-Grid'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setSolarType(t);
                      if (t === 'On-Grid') setBatteryType('none');
                      if (t === 'Off-Grid' && batteryType === 'none') setBatteryType('tubular_150ah');
                      if (t === 'Hybrid' && batteryType === 'none') setBatteryType('lithium_5kwh');
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition ${
                      solarType === t 
                        ? 'bg-amber-500 text-slate-950 shadow-md' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Capacity Summary Badge */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">{isHi ? 'अनुशंसित सोलर क्षमता:' : 'Recommended Capacity:'}</span>
                <span className="text-lg font-black text-amber-400">{recommendedKw} kWp ({totalSystemWatts.toLocaleString('en-IN')} Watts)</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>{isHi ? 'मासिक औसत उत्पादन:' : 'Avg. Monthly Generation:'}</span>
                <span className="text-white font-bold">~{estimatedUnits} Units/Month</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MATERIAL SELECTION & RATE DETERMINATION / BOQ */}
        <div className="lg:col-span-8 space-y-6">

          {/* VIEW TAB 1: MATERIAL SELECTION & CUSTOM RATE DETERMINATION */}
          {viewTab === 'material_customizer' && (
            <div className="space-y-6">
              
              {/* Section 1: Solar Modules */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <Sun className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-sm text-white">1. {isHi ? 'सोलर मॉड्यूल (PV Modules Technology & Brand)' : 'Solar PV Modules (Technology & Brand)'}</h3>
                  </div>
                  <div className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    {isHi ? 'सब-टोटल:' : 'Sub-total:'} ₹{totalPanelCost.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{isHi ? 'पैनल तकनीक चुनिए (Technology):' : 'Select Panel Technology:'}</label>
                    <select
                      value={panelTech}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setPanelTech(val);
                        if (val === 'bifacial_topcon') setPanelRatePerWatt(26);
                        else if (val === 'mono_perc') setPanelRatePerWatt(22);
                        else if (val === 'polycrystalline') setPanelRatePerWatt(18);
                        else if (val === 'glass_glass_flexible') setPanelRatePerWatt(29);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
                    >
                      <option value="mono_perc">540W+ Mono PERC Half-Cut (Standard ₹22/W)</option>
                      <option value="bifacial_topcon">550W+ Bifacial TopCon N-Type (Premium ₹26/W)</option>
                      <option value="polycrystalline">330W+ Polycrystalline ALMM Grade (Economy ₹18/W)</option>
                      <option value="glass_glass_flexible">Glass-Glass BIPV Flexible Modules (Luxury ₹29/W)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-300 font-semibold">{isHi ? 'ब्रांड चयन (Brand):' : 'Select Brand:'}</label>
                      <button
                        onClick={() => {
                          setAddBrandCategory('panel');
                          setNewBrandName('');
                          setNewBrandRate(String(panelRatePerWatt));
                        }}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30"
                      >
                        <Plus className="w-3 h-3" /> {isHi ? 'नया ब्रांड जोड़ें' : 'Add Brand'}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={panelBrand}
                        onChange={(e) => setPanelBrand(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
                      >
                        {panelBrands.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Custom Rate Control Input */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="text-xs">
                    <span className="font-bold text-slate-200 block">{isHi ? 'कस्टम दर निर्धारण (Custom Rate per Watt):' : 'Custom Rate per Watt:'}</span>
                    <span className="text-[11px] text-slate-400">{isHi ? 'चुने गए पैनल हेतु प्रति वाट दर तय करें' : 'Set custom rate per watt for selected module'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min={10}
                      max={60}
                      step={0.5}
                      value={panelRatePerWatt}
                      onChange={(e) => setPanelRatePerWatt(Number(e.target.value))}
                      className="w-24 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-sm font-bold text-emerald-400 text-center focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-slate-400 font-bold">/ Watt</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Inverters */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <Zap className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-sm text-white">2. {isHi ? 'सोलर इनवर्टर (Solar Inverter Technology & Brand)' : 'Solar Inverter System'}</h3>
                  </div>
                  <div className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    {isHi ? 'सब-टोटल:' : 'Sub-total:'} ₹{totalInverterCost.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{isHi ? 'इनवर्टर प्रकार:' : 'Inverter Type:'}</label>
                    <select
                      value={inverterTech}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setInverterTech(val);
                        if (val === 'ongrid_string') setInverterRatePerKw(7500);
                        else if (val === 'hybrid_mppt') setInverterRatePerKw(14000);
                        else if (val === 'micro_inverter') setInverterRatePerKw(18500);
                        else if (val === 'offgrid_pcu') setInverterRatePerKw(9000);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
                    >
                      <option value="ongrid_string">On-Grid String Inverter with Wi-Fi App (₹7,500/kW)</option>
                      <option value="hybrid_mppt">Hybrid Grid-Interactive MPPT Inverter (₹14,000/kW)</option>
                      <option value="micro_inverter">Micro-Inverter System (Module MPPT) (₹18,500/kW)</option>
                      <option value="offgrid_pcu">Off-Grid Heavy Duty PCU Solar Inverter (₹9,000/kW)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-300 font-semibold">{isHi ? 'इनवर्टर ब्रांड:' : 'Inverter Brand:'}</label>
                      <button
                        onClick={() => {
                          setAddBrandCategory('inverter');
                          setNewBrandName('');
                          setNewBrandRate(String(inverterRatePerKw));
                        }}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30"
                      >
                        <Plus className="w-3 h-3" /> {isHi ? 'नया ब्रांड जोड़ें' : 'Add Brand'}
                      </button>
                    </div>
                    <select
                      value={inverterBrand}
                      onChange={(e) => setInverterBrand(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
                    >
                      {inverterBrands.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="text-xs">
                    <span className="font-bold text-slate-200 block">{isHi ? 'कस्टम इनवर्टर दर (Rate per kW):' : 'Custom Inverter Rate per kW:'}</span>
                    <span className="text-[11px] text-slate-400">{isHi ? 'प्रति किलोवाट दर अनुकूलित करें' : 'Customize cost per kW for inverter'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min={3000}
                      max={30000}
                      step={500}
                      value={inverterRatePerKw}
                      onChange={(e) => setInverterRatePerKw(Number(e.target.value))}
                      className="w-28 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-sm font-bold text-emerald-400 text-center focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-slate-400 font-bold">/ kW</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Mounting Structure & Electrical Accessories */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <Layers className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-sm text-white">3. {isHi ? 'माउंटिंग स्ट्रक्चर एवं सुरक्षा केबलिंग (Structure & Safety)' : 'Mounting Structure & Protection Cabling'}</h3>
                  </div>
                  <div className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    {isHi ? 'सब-टोटल:' : 'Sub-total:'} ₹{(totalStructureCost + totalProtectionCost).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-300 font-semibold">{isHi ? 'स्ट्रक्चर ब्रांड चयन:' : 'Structure Brand:'}</label>
                      <button
                        onClick={() => {
                          setAddBrandCategory('structure');
                          setNewBrandName('');
                          setNewBrandRate(String(structureRatePerKw));
                        }}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30"
                      >
                        <Plus className="w-3 h-3" /> {isHi ? 'नया ब्रांड' : 'Add Brand'}
                      </button>
                    </div>
                    <select
                      value={structureBrand}
                      onChange={(e) => setStructureBrand(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
                    >
                      {structureBrands.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-300 font-semibold">{isHi ? 'केबल व सुरक्षा ब्रांड:' : 'Cabling & Protection Brand:'}</label>
                      <button
                        onClick={() => {
                          setAddBrandCategory('protection');
                          setNewBrandName('');
                          setNewBrandRate(String(protectionRatePerKw));
                        }}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30"
                      >
                        <Plus className="w-3 h-3" /> {isHi ? 'नया ब्रांड' : 'Add Brand'}
                      </button>
                    </div>
                    <select
                      value={protectionBrand}
                      onChange={(e) => setProtectionBrand(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
                    >
                      {protectionBrands.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{isHi ? 'स्ट्रक्चर दर (₹/kW):' : 'Structure Rate (₹/kW):'}</span>
                    <input
                      type="number"
                      step={250}
                      value={structureRatePerKw}
                      onChange={(e) => setStructureRatePerKw(Number(e.target.value))}
                      className="w-24 bg-slate-900 border border-slate-700 rounded-lg p-1 text-center font-bold text-emerald-400"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{isHi ? 'केबल व अर्थिंग दर (₹/kW):' : 'Cabling & Earthing Rate (₹/kW):'}</span>
                    <input
                      type="number"
                      step={250}
                      value={protectionRatePerKw}
                      onChange={(e) => setProtectionRatePerKw(Number(e.target.value))}
                      className="w-24 bg-slate-900 border border-slate-700 rounded-lg p-1 text-center font-bold text-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Battery Storage (Optional) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <Zap className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-sm text-white">4. {isHi ? 'बैकअप बैटरी बैंक (Battery Storage Options)' : 'Backup Battery Storage'}</h3>
                  </div>
                  <div className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    {isHi ? 'सब-टोटल:' : 'Sub-total:'} ₹{totalBatteryCost.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{isHi ? 'बैटरी का प्रकार:' : 'Battery Type:'}</label>
                    <select
                      value={batteryType}
                      onChange={(e) => setBatteryType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
                    >
                      <option value="none">{isHi ? 'कोई नहीं (केवल On-Grid Net Metering)' : 'None (Grid-tied Net Metering)'}</option>
                      <option value="lithium_5kwh">51.2V 100Ah LiFePO4 Lithium Wall Battery (₹1,15,000/pack)</option>
                      <option value="tubular_150ah">12V 150Ah Heavy Duty Tubular Lead-Acid (₹16,000/battery)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-300 font-semibold">{isHi ? 'बैटरी ब्रांड:' : 'Battery Brand:'}</label>
                      <button
                        disabled={batteryType === 'none'}
                        onClick={() => {
                          setAddBrandCategory('battery');
                          setNewBrandName('');
                          setNewBrandRate('');
                        }}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30 disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" /> {isHi ? 'नया ब्रांड' : 'Add Brand'}
                      </button>
                    </div>
                    <select
                      disabled={batteryType === 'none'}
                      value={batteryBrand}
                      onChange={(e) => setBatteryBrand(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-amber-500 disabled:opacity-40"
                    >
                      {batteryBrands.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{isHi ? 'बैटरी यूनिट्स (संख्या):' : 'Battery Units (Qty):'}</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      disabled={batteryType === 'none'}
                      value={batteryUnits}
                      onChange={(e) => setBatteryUnits(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-bold text-center focus:outline-none focus:border-amber-500 disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Labor & DISCOM Administrative Charges */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <Wrench className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-sm text-white">5. {isHi ? 'लेबर, इंस्टॉलेशन व डिस्कॉम नेट-मीटर शुल्क (EPC & Approval Fees)' : 'Installation, Labor & DISCOM Approval Fees'}</h3>
                  </div>
                  <div className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    {isHi ? 'सब-टोटल:' : 'Sub-total:'} ₹{(totalLaborCost + discomFee).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <label className="block text-slate-300 font-semibold">{isHi ? 'इन्स्टॉलेशन व लेबर वर्क की दर (₹/kW):' : 'Installation & Labor Rate (₹/kW):'}</label>
                    <input
                      type="number"
                      step={250}
                      value={laborRatePerKw}
                      onChange={(e) => setLaborRatePerKw(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-bold text-emerald-400 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500">{isHi ? 'सिविल कार्य, फिटिंग, टेस्टिंग एवं कमीशनिंग' : 'Civil work, fitting, testing & commissioning'}</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <label className="block text-slate-300 font-semibold">{isHi ? 'नेट-मीटरिंग व DISCOM फाइलिंग शुल्क (₹ Flat):' : 'Net-Metering & DISCOM Filing Fee (₹ Flat):'}</label>
                    <input
                      type="number"
                      step={500}
                      value={discomFee}
                      onChange={(e) => setDiscomFee(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-bold text-emerald-400 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500">{isHi ? 'डिस्कॉम फीस, सोलर मीटर टेस्टिंग एवं अप्रूवल चालान' : 'DISCOM charges, solar meter testing & approval'}</p>
                  </div>
                </div>
              </div>

              {/* Final Cost & Subsidy Summary Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950 via-slate-900 to-slate-900 text-white border border-amber-500/40 shadow-2xl space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-500/20 pb-4">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{isHi ? 'कुल सामग्री एवं दर विश्लेषण (Total BOQ Summary)' : 'Total BOQ & Cost Analysis'}</span>
                    <h2 className="text-2xl font-black text-white mt-0.5">
                      {recommendedKw} kWp Solar System ({solarType})
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {isHi ? 'प्रभावित दर (Effective Cost per Watt):' : 'Effective Cost per Watt:'} <span className="font-bold text-amber-300">₹{effectiveCostPerWatt}/Watt</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">{isHi ? 'PM सूर्य घर सरकारी सब्सिडी' : 'PM Surya Ghar Subsidy'}</div>
                    <div className="text-2xl font-black text-emerald-400">- ₹{pmSuryaGharSubsidy.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-emerald-300">{isHi ? 'सीधे बैंक खाते में (DTC Transfer)' : 'Direct Bank Credit (DBT)'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <div className="text-[11px] text-slate-400">{isHi ? 'सकल सिस्टम लागत (Gross Cost)' : 'Gross System Cost'}</div>
                    <div className="text-lg font-bold text-white mt-1">₹{grossSystemCost.toLocaleString('en-IN')}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <div className="text-[11px] text-slate-400">{isHi ? 'शुद्ध देय राशि (Net Payable)' : 'Net Payable Amount'}</div>
                    <div className="text-xl font-black text-amber-400 mt-1">₹{netPayableCost.toLocaleString('en-IN')}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <div className="text-[11px] text-slate-400">{isHi ? 'अनुमानित मासिक बचत' : 'Estimated Monthly Savings'}</div>
                    <div className="text-lg font-bold text-emerald-400 mt-1">₹{monthlySavings.toLocaleString('en-IN')}/{isHi ? 'माह' : 'mo'}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <div className="text-[11px] text-slate-400">{isHi ? 'पे-बैक समय (Payback Period)' : 'Payback Period'}</div>
                    <div className="text-lg font-bold text-sky-400 mt-1">{paybackYears} {isHi ? 'वर्ष' : 'Yrs'}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => setViewTab('boq_estimate')}
                    className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg transition"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> {isHi ? 'कोटेशन एवं सामग्री दर पत्रक देखें (View Detailed BOQ)' : 'View Detailed BOQ & Quotation'}
                  </button>

                  <button
                    onClick={() => onNavigate('dukandar_market')}
                    className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 transition"
                  >
                    <PackageCheck className="w-4 h-4" /> {isHi ? 'दुकानदार मार्किट से सामान आर्डर करें' : 'Order Materials from Dukandar Market'}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* VIEW TAB 2: DETAILED BOQ ESTIMATE SHEET */}
          {viewTab === 'boq_estimate' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
              
              <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                    {isHi ? 'सामग्री दर पत्रक एवं विस्तृत कोटेशन (Detailed Solar BOQ & Cost Sheet)' : 'Detailed Solar BOQ & Quotation Cost Sheet'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isHi ? 'स्थान' : 'Location'}: {city} • {isHi ? 'सोलर क्षमता' : 'Capacity'}: {recommendedKw} kWp ({solarType})
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700"
                  >
                    <Printer className="w-4 h-4" /> {isHi ? 'प्रिंट कोटेशन' : 'Print Quotation'}
                  </button>
                </div>
              </div>

              {/* Table of Items */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">{isHi ? 'क्र. सं.' : 'S.No.'}</th>
                      <th className="p-3">{isHi ? 'सामग्री का विवरण (Item Particulars)' : 'Item Description'}</th>
                      <th className="p-3">{isHi ? 'ब्रांड / स्पेसिफिकेशन' : 'Brand / Spec'}</th>
                      <th className="p-3 text-center">{isHi ? 'मात्रा / यूनिट' : 'Qty / Unit'}</th>
                      <th className="p-3 text-right">{isHi ? 'निर्धारित दर (Rate)' : 'Rate'}</th>
                      <th className="p-3 text-right">{isHi ? 'कुल लागत (Total)' : 'Total Amount'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    <tr>
                      <td className="p-3 font-bold text-slate-500">01</td>
                      <td className="p-3">
                        <div className="font-bold text-white">{isHi ? 'सोलर फोटोवोल्टिक मॉड्युल्स' : 'Solar PV Modules'}</div>
                        <div className="text-[11px] text-slate-400">{panelTech.toUpperCase()} ALMM Grade Panels</div>
                      </td>
                      <td className="p-3 text-amber-400 font-semibold">{panelBrand}</td>
                      <td className="p-3 text-center">{totalSystemWatts} Watts</td>
                      <td className="p-3 text-right">₹{panelRatePerWatt}/Watt</td>
                      <td className="p-3 text-right font-bold text-white">₹{totalPanelCost.toLocaleString('en-IN')}</td>
                    </tr>

                    <tr>
                      <td className="p-3 font-bold text-slate-500">02</td>
                      <td className="p-3">
                        <div className="font-bold text-white">{isHi ? 'सोलर इनवर्टर सिस्टम' : 'Solar Inverter System'}</div>
                        <div className="text-[11px] text-slate-400">{inverterTech.replace('_', ' ').toUpperCase()}</div>
                      </td>
                      <td className="p-3 text-amber-400 font-semibold">{inverterBrand}</td>
                      <td className="p-3 text-center">{recommendedKw} kW</td>
                      <td className="p-3 text-right">₹{inverterRatePerKw.toLocaleString('en-IN')}/kW</td>
                      <td className="p-3 text-right font-bold text-white">₹{totalInverterCost.toLocaleString('en-IN')}</td>
                    </tr>

                    <tr>
                      <td className="p-3 font-bold text-slate-500">03</td>
                      <td className="p-3">
                        <div className="font-bold text-white">{isHi ? 'माउंटिंग स्ट्रक्चर (Hot-Dip GI)' : 'Mounting Structure (Hot-Dip GI)'}</div>
                        <div className="text-[11px] text-slate-400">{structureType.replace('_', ' ').toUpperCase()}</div>
                      </td>
                      <td className="p-3 text-emerald-400 font-semibold">{structureBrand}</td>
                      <td className="p-3 text-center">{recommendedKw} kW</td>
                      <td className="p-3 text-right">₹{structureRatePerKw.toLocaleString('en-IN')}/kW</td>
                      <td className="p-3 text-right font-bold text-white">₹{totalStructureCost.toLocaleString('en-IN')}</td>
                    </tr>

                    <tr>
                      <td className="p-3 font-bold text-slate-500">04</td>
                      <td className="p-3">
                        <div className="font-bold text-white">{isHi ? 'केबल, डीसीडीबी, एसीडीबी व अर्थिंग' : 'Cables, DCDB, ACDB & Earthing'}</div>
                        <div className="text-[11px] text-slate-400">Chemical Earthing &amp; Lightning Arrester</div>
                      </td>
                      <td className="p-3 text-emerald-400 font-semibold">{protectionBrand}</td>
                      <td className="p-3 text-center">{recommendedKw} kW</td>
                      <td className="p-3 text-right">₹{protectionRatePerKw.toLocaleString('en-IN')}/kW</td>
                      <td className="p-3 text-right font-bold text-white">₹{totalProtectionCost.toLocaleString('en-IN')}</td>
                    </tr>

                    {batteryType !== 'none' && (
                      <tr>
                        <td className="p-3 font-bold text-slate-500">05</td>
                        <td className="p-3">
                          <div className="font-bold text-white">{isHi ? 'बैकअप बैटरी बैंक' : 'Backup Battery Storage'}</div>
                          <div className="text-[11px] text-slate-400">{batteryType.toUpperCase()}</div>
                        </td>
                        <td className="p-3 text-amber-400 font-semibold">{batteryBrand}</td>
                        <td className="p-3 text-center">{batteryUnits} Units</td>
                        <td className="p-3 text-right">
                          ₹{batteryType === 'lithium_5kwh' ? '1,15,000' : '16,000'}/unit
                        </td>
                        <td className="p-3 text-right font-bold text-white">₹{totalBatteryCost.toLocaleString('en-IN')}</td>
                      </tr>
                    )}

                    <tr>
                      <td className="p-3 font-bold text-slate-500">{batteryType !== 'none' ? '06' : '05'}</td>
                      <td className="p-3">
                        <div className="font-bold text-white">{isHi ? 'इंस्टॉलेशन, लेबर व टेस्टिंग' : 'Installation, Labor & Testing'}</div>
                        <div className="text-[11px] text-slate-400">Civil, Electrical &amp; Commissioning</div>
                      </td>
                      <td className="p-3 text-slate-400">Certified Installers</td>
                      <td className="p-3 text-center">{recommendedKw} kW</td>
                      <td className="p-3 text-right">₹{laborRatePerKw.toLocaleString('en-IN')}/kW</td>
                      <td className="p-3 text-right font-bold text-white">₹{totalLaborCost.toLocaleString('en-IN')}</td>
                    </tr>

                    <tr>
                      <td className="p-3 font-bold text-slate-500">{batteryType !== 'none' ? '07' : '06'}</td>
                      <td className="p-3">
                        <div className="font-bold text-white">{isHi ? 'डिस्कॉम अप्रूवल व नेट-मीटर चालान' : 'DISCOM Approval & Net-Meter Fees'}</div>
                        <div className="text-[11px] text-slate-400">Bi-Directional Net Meter Fee</div>
                      </td>
                      <td className="p-3 text-slate-400">State DISCOM Approved</td>
                      <td className="p-3 text-center">Flat</td>
                      <td className="p-3 text-right">₹{discomFee.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-bold text-white">₹{discomFee.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>

                  <tfoot className="bg-slate-950 font-bold border-t border-slate-800">
                    <tr>
                      <td colSpan={5} className="p-3 text-right text-slate-300">{isHi ? 'सकल प्रोजेक्ट लागत (Gross Project Cost):' : 'Gross Project Cost:'}</td>
                      <td className="p-3 text-right text-base text-white">₹{grossSystemCost.toLocaleString('en-IN')}</td>
                    </tr>
                    {pmSuryaGharSubsidy > 0 && (
                      <tr className="text-emerald-400">
                        <td colSpan={5} className="p-3 text-right">(-) {isHi ? 'PM सूर्य घर सरकारी सब्सिडी:' : 'PM Surya Ghar Subsidy:'}</td>
                        <td className="p-3 text-right text-base font-extrabold">- ₹{pmSuryaGharSubsidy.toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                    <tr className="text-amber-400 bg-amber-500/10">
                      <td colSpan={5} className="p-3 text-right text-sm">{isHi ? 'शुद्ध देय राशि (Net Amount Payable):' : 'Net Amount Payable:'}</td>
                      <td className="p-3 text-right text-lg font-black">₹{netPayableCost.toLocaleString('en-IN')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                <div className="text-slate-400">
                  💡 {isHi ? 'क्या आप दरों या ब्रांड्स को फिर से एडजस्ट करना चाहते हैं?' : 'Want to adjust rates or custom brands again?'}
                </div>
                <button
                  onClick={() => setViewTab('material_customizer')}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-extrabold flex items-center gap-2"
                >
                  <Sliders className="w-4 h-4" /> {isHi ? 'दरें व ब्रांड्स कस्टमाइज़ करें' : 'Customize Rates & Brands'}
                </button>
              </div>

            </div>
          )}

          {/* VIEW TAB 3: QUICK SUMMARY REPORT */}
          {viewTab === 'quick' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950 via-slate-900 to-slate-900 text-white shadow-xl border border-amber-800/60">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-800/40 pb-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">
                      {isHi ? 'अनुशंसित क्षमता' : 'Recommended Capacity'}
                    </span>
                    <h2 className="text-3xl font-extrabold text-amber-400 mt-1">
                      {recommendedKw} kWp Solar Plant
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      ~{estimatedUnits} Units (kWh) {isHi ? 'प्रति माह उत्पादन स्थान:' : 'per month in'} {city}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-xs text-slate-400">PM Surya Ghar Subsidy</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      - ₹{pmSuryaGharSubsidy.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700">
                    <div className="text-xs text-slate-400 font-medium">{isHi ? 'शुद्ध लागत (Net Cost)' : 'Net Payable Cost'}</div>
                    <div className="text-xl font-bold text-white mt-1">
                      ₹{netPayableCost.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700">
                    <div className="text-xs text-slate-400 font-medium">{isHi ? 'मासिक बचत' : 'Monthly Savings'}</div>
                    <div className="text-xl font-bold text-emerald-400 mt-1">
                      ₹{monthlySavings.toLocaleString('en-IN')} / {isHi ? 'माह' : 'mo'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700">
                    <div className="text-xs text-slate-400 font-medium">{isHi ? 'पे-बैक पीरियड' : 'Payback Period'}</div>
                    <div className="text-xl font-bold text-amber-400 mt-1">
                      {paybackYears} {isHi ? 'वर्ष' : 'Yrs'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700">
                    <div className="text-xs text-slate-400 font-medium">{isHi ? '25-वर्षीय कुल लाभ' : '25-Yr Lifetime Savings'}</div>
                    <div className="text-xl font-bold text-teal-300 mt-1">
                      ₹{((annualSavings * 25 - netPayableCost) / 100000).toFixed(2)} {isHi ? 'लाख' : 'Lakhs'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Environmental Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TreePine className="w-4 h-4 text-emerald-400" />
                    {isHi ? 'पर्यावरण लाभ (Environmental Impact)' : 'Environmental Impact'}
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">{isHi ? 'वार्षिक कार्बन डाईऑक्साइड कमी' : 'Annual CO2 Reduction'}</span>
                      <span className="font-bold text-emerald-400">{(recommendedKw * 1.3).toFixed(1)} {isHi ? 'टन CO₂' : 'Tons CO₂'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">{isHi ? 'तुल्यकाली लगाए गए पेड़' : 'Equivalent Trees Planted'}</span>
                      <span className="font-bold text-emerald-400">{Math.round(recommendedKw * 55)} {isHi ? 'बड़े पेड़' : 'Trees'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    {isHi ? 'वारंटी सुरक्षा कवरेज' : 'Warranty & Coverage'}
                  </h3>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{isHi ? '25 वर्ष सोलर पैनल परफॉर्मेंस वारंटी' : '25 Years Linear Performance Warranty on Solar PV Modules'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{isHi ? '10 वर्ष ऑन-ग्रिड / हाइब्रिड इनवर्टर ऑन-साइट वारंटी' : '10 Years On-Site Warranty on Inverters'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{isHi ? '5 वर्ष ऑन-साइट फ्री EPC मेंटेनेंस' : '5 Years Free Comprehensive Maintenance (O&M)'}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Action Bar */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold">{isHi ? 'निःशुल्क सोलर साइट सर्वे एवं DISCOM अप्रूवल हेतु संपर्क करें' : 'Get Free Solar Site Survey & DISCOM Approval Support'}</h4>
              <p className="text-xs text-slate-400">{isHi ? `2click सत्यापित सोलर वेंडर्स ${city} में मुफ़्त 3D सर्वे प्रदान करेंगे।` : `2click verified EPC vendors will provide a free 3D site survey in ${city}.`}</p>
            </div>
            <button
              onClick={() => alert(`Solar survey booked for ${city}! Our verified EPC vendor will call you within 24 hours.`)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition"
            >
              <PhoneCall className="w-4 h-4" /> {isHi ? 'मुफ़्त साइट सर्वे बुक करें' : 'Book Free Site Survey'}
            </button>
          </div>

        </div>

      </div>

      {/* --- ADD NEW BRAND MODAL --- */}
      {addBrandCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Tag className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {isHi ? (
                      `नया ${addBrandCategory === 'panel' ? 'सोलर पैनल' : addBrandCategory === 'inverter' ? 'सोलर इनवर्टर' : addBrandCategory === 'structure' ? 'माउंटिंग स्ट्रक्चर' : addBrandCategory === 'protection' ? 'केबल व सुरक्षा' : 'बैटरी'} ब्रांड जोड़ें`
                    ) : (
                      `Add New ${addBrandCategory === 'panel' ? 'Solar Panel' : addBrandCategory === 'inverter' ? 'Inverter' : addBrandCategory === 'structure' ? 'Structure' : addBrandCategory === 'protection' ? 'Protection & Cabling' : 'Battery'} Brand`
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">{isHi ? 'अपनी पसंद का नया ब्रांड व डिफ़ॉल्ट दर दर्ज करें' : 'Enter custom brand name & default rate'}</p>
                </div>
              </div>
              <button
                onClick={() => setAddBrandCategory(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {isHi ? 'ब्रांड का नाम (Brand Name):' : 'Brand Name:'} <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder={isHi ? 'उदा. Loom Solar, Gautam Solar, Longi, etc.' : 'e.g. Loom Solar, Gautam Solar, Longi'}
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {isHi ? 'अनुमानित डिफ़ॉल्ट दर' : 'Estimated Default Rate'} ({addBrandCategory === 'panel' ? '₹/Watt' : '₹/kW'}):
                </label>
                <input
                  type="number"
                  placeholder={isHi ? 'उदा. 24' : 'e.g. 24'}
                  value={newBrandRate}
                  onChange={(e) => setNewBrandRate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAddBrandCategory(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveNewBrand}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4" /> {isHi ? 'ब्रांड सुरक्षित करें' : 'Save Brand'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SolarRooftopCalc;
