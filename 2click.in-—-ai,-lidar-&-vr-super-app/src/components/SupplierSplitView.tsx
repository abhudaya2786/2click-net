import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  ArrowLeftRight, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Building2, 
  Search, 
  Sliders, 
  Share2, 
  Sparkles, 
  Check, 
  HelpCircle,
  Truck,
  Tag,
  Layers,
  Zap,
  ArrowRight
} from 'lucide-react';
import { CustomCostItem } from '../types';

interface SupplierSplitViewProps {
  customItems: CustomCostItem[];
  builtupAreaSqft: number;
  selectedCity: string;
  projectType: string;
  onApplyRatesToBoq: (updatedItems: CustomCostItem[]) => void;
}

interface SupplierPreset {
  id: string;
  label: string;
  description: string;
  nameA: string;
  discountA: number;
  freightA: number;
  nameB: string;
  discountB: number;
  freightB: number;
  rateMultiplierB: number; // e.g. 0.92 for 8% cheaper average
}

const SUPPLIER_PRESETS: SupplierPreset[] = [
  {
    id: 'wholesale_vs_retail',
    label: '🏢 Factory Wholesale Depot vs. Local Retail Dealer',
    description: 'Compare bulk factory-direct dispatch with regional retail hardware prices',
    nameA: 'Supplier A: UltraTech & Tata Wholesale Depot',
    discountA: 6,
    freightA: 15000,
    nameB: 'Supplier B: Local City Retail Hardware Market',
    discountB: 2,
    freightB: 6000,
    rateMultiplierB: 1.08
  },
  {
    id: 'b2b_vs_local',
    label: '🛒 2Click B2B BuildMart Portal vs. Contractor Vendor',
    description: 'Compare verified empanelled B2B hub quotes with traditional contractor rates',
    nameA: 'Supplier A: 2Click B2B BuildMart Direct',
    discountA: 8,
    freightA: 8500,
    nameB: 'Supplier B: Local Civil Contractor Sourced Vendor',
    discountB: 3,
    freightB: 12000,
    rateMultiplierB: 0.93
  },
  {
    id: 'brand_a_vs_brand_b',
    label: '🏆 Tier-1 Premium Brands vs. Regional Standard Brands',
    description: 'Compare high-grade premium materials (Asian Paints, Kajaria, Polycab) with economy grade',
    nameA: 'Supplier A: Premium Grade Brand Distributors',
    discountA: 5,
    freightA: 10000,
    nameB: 'Supplier B: Economy Grade Regional Material Outlet',
    discountB: 10,
    freightB: 8000,
    rateMultiplierB: 0.85
  }
];

export const SupplierSplitView: React.FC<SupplierSplitViewProps> = ({
  customItems,
  builtupAreaSqft,
  selectedCity,
  projectType,
  onApplyRatesToBoq
}) => {
  // Supplier A state
  const [supplierAName, setSupplierAName] = useState<string>('Supplier A: UltraTech & Tata Wholesale Depot');
  const [discountA, setDiscountA] = useState<number>(5);
  const [freightA, setFreightA] = useState<number>(12000);

  // Supplier B state
  const [supplierBName, setSupplierBName] = useState<string>('Supplier B: 2Click B2B BuildMart Outlet');
  const [discountB, setDiscountB] = useState<number>(8);
  const [freightB, setFreightB] = useState<number>(8500);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Custom Item Rates Override maps
  const [ratesA, setRatesA] = useState<{ [id: string]: number }>(() => {
    const map: { [id: string]: number } = {};
    customItems.forEach((item) => {
      map[item.id] = item.unitRateINR;
    });
    return map;
  });

  const [ratesB, setRatesB] = useState<{ [id: string]: number }>(() => {
    const map: { [id: string]: number } = {};
    customItems.forEach((item, index) => {
      // realistic variation for Supplier B
      const variation = (index % 3 === 0) ? 0.92 : (index % 3 === 1) ? 0.96 : 0.89;
      map[item.id] = Math.round(item.unitRateINR * variation);
    });
    return map;
  });

  // Apply Preset
  const handleApplyPreset = (preset: SupplierPreset) => {
    setSupplierAName(preset.nameA);
    setDiscountA(preset.discountA);
    setFreightA(preset.freightA);

    setSupplierBName(preset.nameB);
    setDiscountB(preset.discountB);
    setFreightB(preset.freightB);

    const newMapA: { [id: string]: number } = {};
    const newMapB: { [id: string]: number } = {};

    customItems.forEach((item) => {
      newMapA[item.id] = item.unitRateINR;
      newMapB[item.id] = Math.round(item.unitRateINR * preset.rateMultiplierB);
    });

    setRatesA(newMapA);
    setRatesB(newMapB);
  };

  // Update specific item rate for Supplier A or B
  const handleRateChange = (id: string, supplier: 'A' | 'B', newRate: number) => {
    if (supplier === 'A') {
      setRatesA((prev) => ({ ...prev, [id]: newRate }));
    } else {
      setRatesB((prev) => ({ ...prev, [id]: newRate }));
    }
  };

  // Calculate totals
  const comparisonList = useMemo(() => {
    return customItems.map((item) => {
      const rateA = ratesA[item.id] !== undefined ? ratesA[item.id] : item.unitRateINR;
      const rateB = ratesB[item.id] !== undefined ? ratesB[item.id] : Math.round(item.unitRateINR * 0.93);

      const totalA = rateA * item.quantity;
      const totalB = rateB * item.quantity;

      const diffRate = rateB - rateA;
      const diffTotal = totalB - totalA;
      const diffPct = rateA > 0 ? ((rateB - rateA) / rateA) * 100 : 0;

      return {
        ...item,
        rateA,
        totalA,
        rateB,
        totalB,
        diffRate,
        diffTotal,
        diffPct
      };
    });
  }, [customItems, ratesA, ratesB]);

  // Filtered list
  const filteredList = useMemo(() => {
    return comparisonList.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [comparisonList, searchQuery, selectedCategory]);

  // Aggregates
  const rawTotalA = useMemo(() => comparisonList.reduce((acc, i) => acc + i.totalA, 0), [comparisonList]);
  const rawTotalB = useMemo(() => comparisonList.reduce((acc, i) => acc + i.totalB, 0), [comparisonList]);

  const discountAmountA = Math.round(rawTotalA * (discountA / 100));
  const discountAmountB = Math.round(rawTotalB * (discountB / 100));

  const netTotalA = rawTotalA - discountAmountA + freightA;
  const netTotalB = rawTotalB - discountAmountB + freightB;

  const netSavingsINR = Math.abs(netTotalA - netTotalB);
  const netSavingsPct = Math.min(netTotalA, netTotalB) > 0 ? ((netSavingsINR / Math.max(netTotalA, netTotalB)) * 100).toFixed(1) : '0';
  const winner = netTotalB < netTotalA ? 'Supplier B' : netTotalA < netTotalB ? 'Supplier A' : 'Equal';

  // Category breakdown comparison
  const categoryComparison = useMemo(() => {
    const cats: { [key: string]: { catName: string; totalA: number; totalB: number } } = {};
    comparisonList.forEach((i) => {
      if (!cats[i.category]) {
        cats[i.category] = { catName: i.category, totalA: 0, totalB: 0 };
      }
      cats[i.category].totalA += i.totalA;
      cats[i.category].totalB += i.totalB;
    });
    return Object.values(cats);
  }, [comparisonList]);

  // Apply selected supplier rates back to BOQ
  const handleApplyToBOQ = (supplierChoice: 'A' | 'B') => {
    const updatedItems = customItems.map((item) => {
      const chosenRate = supplierChoice === 'A' 
        ? (ratesA[item.id] !== undefined ? ratesA[item.id] : item.unitRateINR)
        : (ratesB[item.id] !== undefined ? ratesB[item.id] : Math.round(item.unitRateINR * 0.93));
      
      const chosenBrand = supplierChoice === 'A' ? `${item.brandName} (${supplierAName})` : `${item.brandName} (${supplierBName})`;

      return {
        ...item,
        unitRateINR: chosenRate,
        totalCostINR: chosenRate * item.quantity,
        brandName: chosenBrand
      };
    });

    onApplyRatesToBoq(updatedItems);
    alert(`Successfully applied ${supplierChoice === 'A' ? supplierAName : supplierBName} rates to project BOQ calculator!`);
  };

  // WhatsApp comparison text
  const handleShareComparison = () => {
    const text = `*2Click.in Split-View Supplier Cost Comparison*\n` +
      `*Project:* ${projectType} (${builtupAreaSqft} Sq.Ft - ${selectedCity})\n\n` +
      `🟢 *${supplierAName}:* ₹${netTotalA.toLocaleString('en-IN')} (₹${Math.round(netTotalA/builtupAreaSqft)}/sqft)\n` +
      `🔵 *${supplierBName}:* ₹${netTotalB.toLocaleString('en-IN')} (₹${Math.round(netTotalB/builtupAreaSqft)}/sqft)\n\n` +
      `🏆 *Winning Supplier:* ${winner === 'Supplier B' ? supplierBName : supplierAName} saves ₹${netSavingsINR.toLocaleString('en-IN')} (${netSavingsPct}%)!\n\n` +
      `Generated via 2click.in AI Civil Calculator.`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const categories = ['All', 'Structure & RCC', 'Electrical & Wiring', 'Plumbing & Water', 'Flooring & Tiles', 'Paints & Finishes', 'Masonry & AAC', 'Doors & Windows', 'Labor & Supervision', 'Solar & Power'];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Hero Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-indigo-800/80 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-800/60 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-indigo-400" />
                SPLIT-VIEW DUAL SUPPLIER COMPARISON ENGINE
              </span>
              <span className="text-xs text-slate-300">• Side-by-Side Market Quotation Decision Tool</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              Side-by-Side Supplier Rate &amp; Margin Comparison
            </h2>
            <p className="text-xs text-slate-300">
              Compare quotes, discounts, freight logistics, and line-item prices between two vendors or trade suppliers in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareComparison}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share WhatsApp Comparison</span>
            </button>
          </div>
        </div>

        {/* TOP DUAL COMPARISON STAT CARDS & WINNER CALLOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          
          {/* LEFT: SUPPLIER A CARD */}
          <div className="lg:col-span-5 bg-slate-950/80 p-5 rounded-2xl border border-blue-500/40 space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider font-mono">
                  SUPPLIER A (OPTION 1)
                </span>
                <input
                  type="text"
                  value={supplierAName}
                  onChange={(e) => setSupplierAName(e.target.value)}
                  className="w-full bg-slate-900/90 text-white font-bold text-sm px-2 py-1 rounded border border-slate-700 mt-1 focus:border-blue-400 focus:outline-none"
                />
              </div>
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 font-extrabold text-xs rounded-lg border border-blue-500/30">
                Option A
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <div className="text-2xl font-black text-blue-400 font-mono">
                  ₹{netTotalA.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-400">
                  Effective Rate: <span className="font-bold text-slate-200 font-mono">₹{Math.round(netTotalA / builtupAreaSqft)}/sq.ft</span>
                </div>
              </div>

              <button
                onClick={() => handleApplyToBOQ('A')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Rates</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-slate-800/80">
              <div>
                <label className="text-[10px] text-slate-400 block">Trade Discount (%)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={discountA}
                    onChange={(e) => setDiscountA(Number(e.target.value))}
                    className="w-16 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs font-bold text-white"
                  />
                  <span className="text-slate-400 text-[11px]">% OFF</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block">Freight / Delivery (₹)</label>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 text-[11px]">₹</span>
                  <input
                    type="number"
                    value={freightA}
                    onChange={(e) => setFreightA(Number(e.target.value))}
                    className="w-20 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs font-bold text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CENTER: VS WINNER CALLOUT */}
          <div className="lg:col-span-2 text-center p-3 rounded-2xl bg-slate-900/90 border border-indigo-700/60 space-y-1 my-2 lg:my-0 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-400/40 flex items-center justify-center mx-auto text-xs font-black">
              VS
            </div>

            {winner === 'Supplier B' ? (
              <div className="space-y-0.5">
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] rounded-full border border-emerald-500/40 inline-flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> Supplier B Cheaper
                </span>
                <div className="text-xs font-black text-emerald-400 font-mono">
                  Saves ₹{netSavingsINR.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">({netSavingsPct}% Lower Cost)</div>
              </div>
            ) : winner === 'Supplier A' ? (
              <div className="space-y-0.5">
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-extrabold text-[10px] rounded-full border border-blue-500/40 inline-flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> Supplier A Cheaper
                </span>
                <div className="text-xs font-black text-blue-400 font-mono">
                  Saves ₹{netSavingsINR.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">({netSavingsPct}% Lower Cost)</div>
              </div>
            ) : (
              <div className="text-xs font-bold text-slate-300">
                Equal Total Cost
              </div>
            )}
          </div>

          {/* RIGHT: SUPPLIER B CARD */}
          <div className="lg:col-span-5 bg-slate-950/80 p-5 rounded-2xl border border-purple-500/40 space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider font-mono">
                  SUPPLIER B (OPTION 2)
                </span>
                <input
                  type="text"
                  value={supplierBName}
                  onChange={(e) => setSupplierBName(e.target.value)}
                  className="w-full bg-slate-900/90 text-white font-bold text-sm px-2 py-1 rounded border border-slate-700 mt-1 focus:border-purple-400 focus:outline-none"
                />
              </div>
              <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 font-extrabold text-xs rounded-lg border border-purple-500/30">
                Option B
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <div className="text-2xl font-black text-purple-400 font-mono">
                  ₹{netTotalB.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-400">
                  Effective Rate: <span className="font-bold text-slate-200 font-mono">₹{Math.round(netTotalB / builtupAreaSqft)}/sq.ft</span>
                </div>
              </div>

              <button
                onClick={() => handleApplyToBOQ('B')}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Rates</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-slate-800/80">
              <div>
                <label className="text-[10px] text-slate-400 block">Trade Discount (%)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={discountB}
                    onChange={(e) => setDiscountB(Number(e.target.value))}
                    className="w-16 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs font-bold text-white"
                  />
                  <span className="text-slate-400 text-[11px]">% OFF</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block">Freight / Delivery (₹)</label>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 text-[11px]">₹</span>
                  <input
                    type="number"
                    value={freightB}
                    onChange={(e) => setFreightB(Number(e.target.value))}
                    className="w-20 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs font-bold text-white"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* QUICK SUPPLIER COMPARISON PRESETS */}
        <div className="space-y-2 pt-2 border-t border-indigo-800/60">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Quick Comparison Presets (त्वरित सप्लायर मॉडल):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {SUPPLIER_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleApplyPreset(p)}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-left transition cursor-pointer space-y-1 hover:border-indigo-400"
              >
                <div className="text-xs font-extrabold text-indigo-300">{p.label}</div>
                <div className="text-[10px] text-slate-400">{p.description}</div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search materials by name, category, or brand..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Filter Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SPLIT-VIEW SIDE-BY-SIDE MATERIAL COMPARISON TABLE */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-black flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-400" />
              Itemized Side-by-Side Supplier Rate Matrix ({filteredList.length} Items)
            </h3>
            <p className="text-[11px] text-slate-400">
              Edit unit rates directly in left or right column to recalculate instant savings
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Supplier B Cheaper</span>
            <span className="flex items-center gap-1 text-blue-400"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Supplier A Cheaper</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-700 text-[11px] uppercase tracking-wider">
                <th className="p-3 w-1/3">Material Description &amp; Quantity</th>
                <th className="p-3 w-1/4 bg-blue-50/50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border-l border-blue-200 dark:border-blue-900">
                  {supplierAName}
                </th>
                <th className="p-3 text-center w-1/6">Price Variance (Delta)</th>
                <th className="p-3 w-1/4 bg-purple-50/50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 border-l border-purple-200 dark:border-purple-900">
                  {supplierBName}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
              {filteredList.map((item) => {
                const isBCheaper = item.diffRate < 0;
                const isACheaper = item.diffRate > 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                    
                    {/* Material Title & Info */}
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[10px] rounded font-semibold">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                          {item.brandName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Qty: <strong className="text-slate-800 dark:text-slate-200">{item.quantity} {item.unit}</strong>
                        </span>
                      </div>
                    </td>

                    {/* Supplier A Rate & Total */}
                    <td className="p-3 bg-blue-50/20 dark:bg-blue-950/10 border-l border-blue-100 dark:border-blue-900/50 space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 text-[10px]">Unit ₹</span>
                        <input
                          type="number"
                          value={item.rateA}
                          onChange={(e) => handleRateChange(item.id, 'A', Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800 rounded-lg font-mono font-bold text-xs text-slate-900 dark:text-white"
                        />
                        <span className="text-[10px] text-slate-500">/{item.unit.split(' ')[0]}</span>
                      </div>
                      <div className="text-xs font-black text-blue-700 dark:text-blue-300 font-mono">
                        Total: ₹{item.totalA.toLocaleString('en-IN')}
                      </div>
                    </td>

                    {/* Price Difference / Delta Badge */}
                    <td className="p-3 text-center align-middle">
                      {isBCheaper ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-[10px] rounded-md border border-emerald-300 dark:border-emerald-800 flex items-center gap-0.5">
                            <TrendingDown className="w-3 h-3" /> Supplier B -₹{Math.abs(item.diffRate)} ({item.diffPct.toFixed(1)}%)
                          </span>
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                            Saves ₹{Math.abs(item.diffTotal).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : isACheaper ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black text-[10px] rounded-md border border-blue-300 dark:border-blue-800 flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" /> Supplier A -₹{item.diffRate} ({Math.abs(item.diffPct).toFixed(1)}%)
                          </span>
                          <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                            Saves ₹{item.diffTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-500 text-[10px] font-bold rounded">
                          Same Rate
                        </span>
                      )}
                    </td>

                    {/* Supplier B Rate & Total */}
                    <td className="p-3 bg-purple-50/20 dark:bg-purple-950/10 border-l border-purple-100 dark:border-purple-900/50 space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 text-[10px]">Unit ₹</span>
                        <input
                          type="number"
                          value={item.rateB}
                          onChange={(e) => handleRateChange(item.id, 'B', Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800 rounded-lg font-mono font-bold text-xs text-slate-900 dark:text-white"
                        />
                        <span className="text-[10px] text-slate-500">/{item.unit.split(' ')[0]}</span>
                      </div>
                      <div className="text-xs font-black text-purple-700 dark:text-purple-300 font-mono">
                        Total: ₹{item.totalB.toLocaleString('en-IN')}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CATEGORY-WISE SPLIT BREAKDOWN BAR CHART */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          Category-wise Supplier Cost Distribution Comparison
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryComparison.map((cat) => {
            const diffCat = cat.totalB - cat.totalA;
            const isBBetter = diffCat < 0;

            return (
              <div key={cat.catName} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{cat.catName}</span>
                  {isBBetter ? (
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded">
                      Supplier B -₹{Math.abs(diffCat).toLocaleString('en-IN')}
                    </span>
                  ) : diffCat > 0 ? (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold rounded">
                      Supplier A -₹{diffCat.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Equal</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                    <div className="text-[9px] text-blue-600 dark:text-blue-400 font-sans font-bold">Supplier A</div>
                    <div className="font-bold text-blue-800 dark:text-blue-200">₹{cat.totalA.toLocaleString('en-IN')}</div>
                  </div>

                  <div className="p-2 rounded bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
                    <div className="text-[9px] text-purple-600 dark:text-purple-400 font-sans font-bold">Supplier B</div>
                    <div className="font-bold text-purple-800 dark:text-purple-200">₹{cat.totalB.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
