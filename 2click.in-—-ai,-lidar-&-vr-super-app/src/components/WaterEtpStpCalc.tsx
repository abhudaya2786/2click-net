import React, { useState } from 'react';
import { 
  Droplets, 
  Settings2, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  IndianRupee, 
  TrendingUp, 
  Building2, 
  Download, 
  ArrowRight,
  RefreshCw,
  Zap,
  Award,
  Factory,
  Plus
} from 'lucide-react';
import { EtpStpAnalysisResult } from '../types';
import { AddCustomItemModal, CustomItemPayload } from './AddCustomItemModal';
import { VisualItemCard } from './VisualItemCard';

interface WaterEtpStpCalcProps {
  selectedCity: string;
  onNavigateToVendors?: (prefillCategory?: string) => void;
}

export const WaterEtpStpCalc: React.FC<WaterEtpStpCalcProps> = ({ 
  selectedCity,
  onNavigateToVendors 
}) => {
  const [plantType, setPlantType] = useState<'STP Sewage Plant' | 'ETP Effluent Plant' | 'WTP RO Filtration' | 'Rainwater Recycling'>('STP Sewage Plant');
  const [techTechnology, setTechTechnology] = useState<'MBBR (Biofilm)' | 'MBR (Membrane)' | 'SBR (Batch Reactor)' | 'Physico-Chemical ETP'>('MBBR (Biofilm)');
  const [inputMode, setInputMode] = useState<'headcount' | 'kld'>('headcount');
  const [occupancyHeadcount, setOccupancyHeadcount] = useState<number>(350);
  const [customKld, setCustomKld] = useState<number>(100);

  // Custom Water Plant Items with Photo Attachments
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [customWaterItems, setCustomWaterItems] = useState<Array<{
    id: string;
    title: string;
    category: string;
    priceINR: number;
    unit: string;
    quantity: number;
    brandName: string;
    imageUrl: string;
    isActive: boolean;
  }>>([
    {
      id: 'W-ITEM-1',
      title: 'SS-304 High-Pressure Dosing Pump',
      category: 'Pumps & Dosing',
      priceINR: 32000,
      unit: 'Units',
      quantity: 2,
      brandName: 'Grundfos / Kirloskar',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
      isActive: true
    },
    {
      id: 'W-ITEM-2',
      title: 'MBR Hollow Fiber Membrane Cassette',
      category: 'Membranes & Bio-Media',
      priceINR: 125000,
      unit: 'Cassette Set',
      quantity: 1,
      brandName: 'Toray / Kubota',
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80',
      isActive: true
    }
  ]);

  const handleAddCustomWaterItem = (payload: CustomItemPayload) => {
    const newItem = {
      id: payload.id,
      title: payload.title,
      category: payload.category || 'Water Plant Equipment',
      priceINR: payload.priceINR,
      unit: payload.unit || 'Nos',
      quantity: payload.quantity || 1,
      brandName: payload.brandName || 'Custom Vendor',
      imageUrl: payload.imageUrl,
      isActive: true
    };
    setCustomWaterItems(prev => [newItem, ...prev]);
  };

  const handleRemoveWaterItem = (id: string) => {
    setCustomWaterItems(prev => prev.filter(item => item.id !== id));
  };

  // Calculate sizing
  const capacityKLD = inputMode === 'headcount' 
    ? Math.round((occupancyHeadcount * 135) / 1000) 
    : customKld;

  const effectiveKLD = Math.max( capacityKLD, 10 );

  // Base costs calculation per KLD
  let baseCapExPerKLD = 18000; // ₹18k per KLD for MBBR
  if (techTechnology === 'MBR (Membrane)') baseCapExPerKLD = 28000;
  else if (techTechnology === 'SBR (Batch Reactor)') baseCapExPerKLD = 22000;
  else if (techTechnology === 'Physico-Chemical ETP') baseCapExPerKLD = 32000;

  // Add custom water items total to CapEx
  const customItemsTotalINR = customWaterItems
    .filter(i => i.isActive)
    .reduce((acc, i) => acc + (i.priceINR * i.quantity), 0);

  const basePlantCapEx = Math.round(effectiveKLD * baseCapExPerKLD + 450000);
  const totalCapEx = basePlantCapEx + customItemsTotalINR;
  const monthlyOpEx = Math.round(effectiveKLD * 480 + 15000); // Power + chemicals + maintenance
  
  const recoveryPct = techTechnology === 'MBR (Membrane)' ? 92 : techTechnology === 'MBBR (Biofilm)' ? 85 : 80;
  const dailyRecycledLiters = Math.round(effectiveKLD * 1000 * (recoveryPct / 100));
  
  // Municipal water rate avg ₹75 per kiloliter in urban India
  const annualSavingsINR = Math.round((dailyRecycledLiters / 1000) * 365 * 72);

  const breakdown = [
    { item: 'RCC Equalization & Aeration Tanks', costINR: Math.round(totalCapEx * 0.32), specs: 'M30 Concrete with Epoxy Inner Lining & Slag Protection' },
    { item: 'Air Blowers & Fine Bubble Diffusers', costINR: Math.round(totalCapEx * 0.22), specs: 'Twin Lobe Roots Blowers with EPDM Diffuser Grid' },
    { item: 'Bio-Media / MBR Membrane Cassette', costINR: Math.round(totalCapEx * 0.20), specs: `${techTechnology} with 650 m²/m³ Specific Surface Area` },
    { item: 'Submersible Pumps & Dosing Systems', costINR: Math.round(totalCapEx * 0.14), specs: 'Grundfos / Kirloskar non-clog cutter pumps + Poly-dosing' },
    { item: 'Electrical Panel & CPCB Online Sensor', costINR: Math.round(totalCapEx * 0.12), specs: 'IP65 PLC Control Panel with IoT BOD/COD/TSS telemetry' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>Water Infrastructure & CPCB Norm Compliance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ETP, STP & WTP Water Plant AI Calculator
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Design Sewage Treatment Plants (STP), Effluent Treatment Plants (ETP) and Water Recycling Systems with instant KLD capacity sizing, CapEx/OpEx forecasts, and CPCB Pollution Board compliance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigateToVendors && onNavigateToVendors('ETP/STP Water')}
              className="px-5 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              <span>Invite Water Plant Vendor Bids</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs + Output Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <Settings2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">Plant Specifications & Sizing</h2>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* Category Select */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Treatment Plant Category</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'STP Sewage Plant', label: 'STP Sewage', icon: Building2 },
                  { id: 'ETP Effluent Plant', label: 'ETP Industrial', icon: Factory },
                  { id: 'WTP RO Filtration', label: 'WTP RO Plant', icon: Droplets },
                  { id: 'Rainwater Recycling', label: 'Rainwater', icon: Zap }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPlantType(item.id as any)}
                    className={`p-2.5 rounded-xl border text-left font-semibold flex items-center gap-2 transition ${
                      plantType === item.id
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <item.icon className="w-4 h-4 text-teal-600" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Technology Select */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Process Technology</label>
              <select
                value={techTechnology}
                onChange={(e) => setTechTechnology(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-xs"
              >
                <option value="MBBR (Biofilm)">MBBR (Moving Bed Biofilm Reactor - Low Footprint)</option>
                <option value="MBR (Membrane)">MBR (Membrane Bioreactor - Highest Purity 92% Re-use)</option>
                <option value="SBR (Batch Reactor)">SBR (Sequential Batch Reactor - High Volume)</option>
                <option value="Physico-Chemical ETP">Physico-Chemical ETP (Industrial Dosing & Clarifier)</option>
              </select>
            </div>

            {/* Sizing Mode Toggle */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Sizing Calculation Mode</label>
                <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg text-[10px]">
                  <button
                    onClick={() => setInputMode('headcount')}
                    className={`px-2 py-1 rounded-md font-bold transition ${inputMode === 'headcount' ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-xs' : 'text-slate-400'}`}
                  >
                    By Occupants
                  </button>
                  <button
                    onClick={() => setInputMode('kld')}
                    className={`px-2 py-1 rounded-md font-bold transition ${inputMode === 'kld' ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-xs' : 'text-slate-400'}`}
                  >
                    Direct KLD
                  </button>
                </div>
              </div>

              {inputMode === 'headcount' ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Inhabitants / Daily Occupancy:</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">{occupancyHeadcount} Heads</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="2500"
                    step="25"
                    value={occupancyHeadcount}
                    onChange={(e) => setOccupancyHeadcount(Number(e.target.value))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">
                    Based on NBC 2026 norm: 135 Liters per capita per day (LCPD) domestic sewage yield.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-slate-500">Target Hydraulic Capacity (KLD):</label>
                  <input
                    type="number"
                    value={customKld}
                    onChange={(e) => setCustomKld(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>
              )}
            </div>

            {/* City Location Info */}
            <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 rounded-xl text-[11px] text-cyan-900 dark:text-cyan-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-600" />
                <span>State PCB Norms for {selectedCity}:</span>
              </div>
              <p>Mandatory Treated Water Standards: BOD &lt; 10 mg/L, COD &lt; 50 mg/L, TSS &lt; 10 mg/L for flushing &amp; HVAC cooling tower reuse.</p>
            </div>

          </div>
        </div>

        {/* Right Column: AI Output & Results */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            
            <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500">Design Capacity</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {capacityKLD} <span className="text-xs font-semibold text-teal-600">KLD</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{capacityKLD * 1000} Liters / Day</div>
            </div>

            <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500">Est. Turnkey CapEx</div>
              <div className="text-xl font-black text-teal-600 dark:text-teal-400 mt-1">
                ₹{(totalCapEx / 100000).toFixed(2)} <span className="text-xs font-semibold">Lakhs</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Supply, Civil & Errection</div>
            </div>

            <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs col-span-2 sm:col-span-1">
              <div className="text-[11px] font-semibold text-slate-500">Annual Water Savings</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                ₹{(annualSavingsINR / 100000).toFixed(2)} <span className="text-xs font-semibold">Lakhs/yr</span>
              </div>
              <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">{recoveryPct}% Water Recycled</div>
            </div>

          </div>

          {/* Detailed Itemized CapEx Breakdown */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Itemized ETP/STP Turnkey Bill of Quantities (BOQ)</h3>
                <p className="text-[11px] text-slate-500">CPWD Schedule of Rates + Environmental Equipment Standards</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-[10px] rounded-full border border-teal-300 dark:border-teal-800">
                  {techTechnology}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>➕ Add Custom Item (फोटो जोड़ें)</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {breakdown.map((row, idx) => (
                <div key={idx} className="py-2.5 flex justify-between items-center gap-4">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{row.item}</div>
                    <div className="text-[10px] text-slate-400">{row.specs}</div>
                  </div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white text-right">
                    ₹{row.costINR.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Water Plant Visual Equipment Cards */}
            {customWaterItems.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>Custom Water Plant Line Items &amp; Attachments ({customWaterItems.length})</span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400">
                    💡 Double-click image to inspect in 3D/HD Fullscreen
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {customWaterItems.map((item) => (
                    <VisualItemCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      category={item.category}
                      priceINR={item.priceINR}
                      unit={item.unit}
                      quantity={item.quantity}
                      brandName={item.brandName}
                      imageUrl={item.imageUrl}
                      isActive={item.isActive}
                      isCustomItem={true}
                      onRemoveItem={handleRemoveWaterItem}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Estimated Monthly OpEx (Power + Chemicals + AMC):</span>
              <span className="font-extrabold text-teal-600 dark:text-teal-400 font-mono">₹{monthlyOpEx.toLocaleString('en-IN')} / month</span>
            </div>
          </div>

          {/* PLUMBING & WATER MATERIAL BRAND RATE, DISCOUNT & WARRANTY COMPARISON */}
          <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 shadow-lg space-y-4 border border-teal-900/60">
            <div className="flex items-center justify-between border-b border-teal-800/60 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">Plumbing Materials, Pumps &amp; Sanitaryware Rates</h3>
                  <p className="text-[11px] text-teal-300">CPVC Pipes, Drainage Fittings, Hydro-Pneumatic Pumps &amp; Water Tanks</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-teal-500/20 text-teal-300 text-[10px] font-bold rounded-full border border-teal-500/30">
                Verified Dukandar Discount
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              
              {/* Item 1: CPVC Pipes */}
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-400 text-[11px]">Plumbing CPVC Pipes</span>
                  <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 font-extrabold text-[10px] rounded">30% OFF</span>
                </div>
                <div className="font-bold text-slate-100">Astral / Supreme CPVC Pro Pipe SDR-11 (1 Inch, 3m)</div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="line-through text-slate-400">MRP ₹1,250</span>
                  <span className="font-extrabold text-cyan-300">Dukandar Rate: ₹875</span>
                </div>
                <div className="text-[10px] text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>10 Year Lead-Free Brand Guarantee (NSF 61 Certified)</span>
                </div>
              </div>

              {/* Item 2: Hydro-Pneumatic Booster Pumps */}
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-400 text-[11px]">Water Booster Pumps</span>
                  <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 font-extrabold text-[10px] rounded">16% OFF</span>
                </div>
                <div className="font-bold text-slate-100">Grundfos / Kirloskar Hydro-Pneumatic Booster Pump (1.5 HP)</div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="line-through text-slate-400">MRP ₹38,000</span>
                  <span className="font-extrabold text-cyan-300">Dukandar Rate: ₹32,000</span>
                </div>
                <div className="text-[10px] text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>2 Year On-Site Motor Replacement Warranty</span>
                </div>
              </div>

              {/* Item 3: Commercial Overhead Water Tanks */}
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-400 text-[11px]">Commercial Water Storage</span>
                  <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 font-extrabold text-[10px] rounded">25% OFF</span>
                </div>
                <div className="font-bold text-slate-100">Sintex Triple Layer Anti-Bacterial Tank (2,000 Liters)</div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="line-through text-slate-400">MRP ₹24,000</span>
                  <span className="font-extrabold text-cyan-300">Dukandar Rate: ₹18,000</span>
                </div>
                <div className="text-[10px] text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>10 Year UV Weathering &amp; Crack Guarantee</span>
                </div>
              </div>

              {/* Item 4: Sanitary Fixtures */}
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-400 text-[11px]">Bathroom Fittings</span>
                  <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 font-extrabold text-[10px] rounded">23% OFF</span>
                </div>
                <div className="font-bold text-slate-100">Jaquar Kubix Prime Wall Hung Closet &amp; Flush Valve</div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="line-through text-slate-400">MRP ₹16,200</span>
                  <span className="font-extrabold text-cyan-300">Dukandar Rate: ₹12,500</span>
                </div>
                <div className="text-[10px] text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>10 Year Chrome Finish &amp; Internal Valve Warranty</span>
                </div>
              </div>

            </div>
          </div>

          {/* Action Footer Call to Action */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <div className="font-bold text-sm">Ready to execute this Water Plant project?</div>
              <p className="text-xs text-slate-400">
                Issue RFQs to verified Grade-A water contractors and lock legally binding contracts with escrow deposits.
              </p>
            </div>
            <button
              onClick={() => onNavigateToVendors && onNavigateToVendors('ETP/STP Water')}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-extrabold rounded-xl text-xs whitespace-nowrap transition shadow-md"
            >
              Request Binding Vendor Bids
            </button>
          </div>

        </div>

      </div>

      {/* Add Custom Water Item Modal */}
      <AddCustomItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleAddCustomWaterItem}
        moduleName="Water Treatment Plant"
      />

    </div>
  );
};
