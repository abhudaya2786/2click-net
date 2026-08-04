import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  X, 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Ruler, 
  Box, 
  Weight, 
  Layers, 
  Building2, 
  Sparkles,
  Info
} from 'lucide-react';

interface QuickUnitConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBuiltupSqft?: number;
  onApplyAreaToProject?: (newAreaSqft: number) => void;
}

export const QuickUnitConverterModal: React.FC<QuickUnitConverterModalProps> = ({
  isOpen,
  onClose,
  currentBuiltupSqft = 1800,
  onApplyAreaToProject
}) => {
  const [activeTab, setActiveTab] = useState<'area' | 'volume' | 'weight_steel' | 'concrete'>('area');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Area state
  const [areaVal, setAreaVal] = useState<number>(currentBuiltupSqft || 1000);
  const [areaUnit, setAreaUnit] = useState<'sqft' | 'sqm' | 'gaj' | 'brass' | 'katha' | 'acre'>('sqft');

  // Volume state
  const [volumeVal, setVolumeVal] = useState<number>(100);
  const [volumeUnit, setVolumeUnit] = useState<'cft' | 'cum' | 'brass' | 'liters' | 'bags'>('cft');

  // Weight & Steel state
  const [weightVal, setWeightVal] = useState<number>(1);
  const [weightUnit, setWeightUnit] = useState<'mt' | 'quintal' | 'kg'>('mt');

  // Steel Bar Calculator state
  const [barDiaMm, setBarDiaMm] = useState<number>(12);
  const [barLengthMeters, setBarLengthMeters] = useState<number>(12); // Standard 1 bar = 12m
  const [barCount, setBarCount] = useState<number>(50);

  // Concrete Mix state
  const [concreteVol, setConcreteVol] = useState<number>(10); // in Cum or CFT
  const [concreteUnit, setConcreteUnit] = useState<'cum' | 'cft'>('cum');
  const [mixGrade, setMixGrade] = useState<'M15' | 'M20' | 'M25'>('M20');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. Area conversions normalized to Sq.Ft
  const areaInSqft = useMemo(() => {
    const val = Number(areaVal) || 0;
    switch (areaUnit) {
      case 'sqft': return val;
      case 'sqm': return val * 10.7639;
      case 'gaj': return val * 9;
      case 'brass': return val * 100;
      case 'katha': return val * 1361.25;
      case 'acre': return val * 43560;
      default: return val;
    }
  }, [areaVal, areaUnit]);

  const areaResults = useMemo(() => {
    return {
      sqft: Math.round(areaInSqft * 100) / 100,
      sqm: Math.round((areaInSqft / 10.7639) * 100) / 100,
      gaj: Math.round((areaInSqft / 9) * 100) / 100,
      brass: Math.round((areaInSqft / 100) * 100) / 100,
      katha: Math.round((areaInSqft / 1361.25) * 100) / 100,
      acre: Math.round((areaInSqft / 43560) * 10000) / 10000
    };
  }, [areaInSqft]);

  // 2. Volume conversions normalized to CFT
  const volumeInCFT = useMemo(() => {
    const val = Number(volumeVal) || 0;
    switch (volumeUnit) {
      case 'cft': return val;
      case 'cum': return val * 35.3147;
      case 'brass': return val * 100;
      case 'liters': return val * 0.0353147;
      case 'bags': return val * 1.226; // 1 cement bag ~ 1.226 CFT
      default: return val;
    }
  }, [volumeVal, volumeUnit]);

  const volumeResults = useMemo(() => {
    return {
      cft: Math.round(volumeInCFT * 100) / 100,
      cum: Math.round((volumeInCFT / 35.3147) * 100) / 100,
      brass: Math.round((volumeInCFT / 100) * 100) / 100,
      liters: Math.round((volumeInCFT * 28.3168) * 10) / 10,
      bags: Math.round((volumeInCFT / 1.226) * 10) / 10
    };
  }, [volumeInCFT]);

  // 3. Weight conversions normalized to Kg
  const weightInKg = useMemo(() => {
    const val = Number(weightVal) || 0;
    switch (weightUnit) {
      case 'kg': return val;
      case 'quintal': return val * 100;
      case 'mt': return val * 1000;
      default: return val;
    }
  }, [weightVal, weightUnit]);

  const weightResults = useMemo(() => {
    return {
      kg: Math.round(weightInKg * 10) / 10,
      quintal: Math.round((weightInKg / 100) * 100) / 100,
      mt: Math.round((weightInKg / 1000) * 1000) / 1000
    };
  }, [weightInKg]);

  // TMT Steel Rebar Weight
  const steelWeightPerMeter = useMemo(() => {
    return (barDiaMm * barDiaMm) / 162.2;
  }, [barDiaMm]);

  const steelTotalWeightKg = useMemo(() => {
    return steelWeightPerMeter * barLengthMeters * barCount;
  }, [steelWeightPerMeter, barLengthMeters, barCount]);

  // 4. Concrete Mix Materials
  const concreteInCum = useMemo(() => {
    const val = Number(concreteVol) || 0;
    return concreteUnit === 'cum' ? val : val / 35.3147;
  }, [concreteVol, concreteUnit]);

  const concreteEstimate = useMemo(() => {
    // Ratios based on dry volume factor 1.54
    let cementBagsPerCum = 8;
    let sandCftPerCum = 15.5;
    let gittiCftPerCum = 31;
    let waterLitersPerCum = 160;

    if (mixGrade === 'M15') { // 1:2:4
      cementBagsPerCum = 6.4;
      sandCftPerCum = 14.5;
      gittiCftPerCum = 29;
      waterLitersPerCum = 150;
    } else if (mixGrade === 'M25') { // 1:1:2
      cementBagsPerCum = 11;
      sandCftPerCum = 12.5;
      gittiCftPerCum = 25;
      waterLitersPerCum = 175;
    }

    const totalCementBags = Math.ceil(concreteInCum * cementBagsPerCum);
    const totalSandCft = Math.round(concreteInCum * sandCftPerCum);
    const totalGittiCft = Math.round(concreteInCum * gittiCftPerCum);
    const totalWaterLiters = Math.round(concreteInCum * waterLitersPerCum);

    return {
      cementBags: totalCementBags,
      cementTonne: Math.round((totalCementBags * 50 / 1000) * 100) / 100,
      sandCft: totalSandCft,
      sandBrass: Math.round((totalSandCft / 100) * 100) / 100,
      gittiCft: totalGittiCft,
      gittiBrass: Math.round((totalGittiCft / 100) * 100) / 100,
      waterLiters: totalWaterLiters
    };
  }, [concreteInCum, mixGrade]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 p-5 text-white flex items-center justify-between border-b border-teal-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Civil Engineering Unit Converter
                <span className="text-[10px] bg-teal-500/30 text-teal-200 px-2 py-0.5 rounded-full border border-teal-400/30 font-medium">
                  इकाई कनवर्टर
                </span>
              </h3>
              <p className="text-xs text-teal-200/80">
                Quick conversion between Sq.Ft, Sq.M, Gaj, CFT, Cum, Brass, Steel weight &amp; Cement bags
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 pt-2 gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('area')}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 border-t border-x ${
              activeTab === 'area'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 border-slate-200 dark:border-slate-800 border-b-white dark:border-b-slate-900 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900'
            }`}
          >
            <Ruler className="w-4 h-4" />
            <span>Area (क्षेत्रफल / Sq.Ft / गज)</span>
          </button>

          <button
            onClick={() => setActiveTab('volume')}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 border-t border-x ${
              activeTab === 'volume'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 border-slate-200 dark:border-slate-800 border-b-white dark:border-b-slate-900 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>Volume (आयतन / CFT / Cum)</span>
          </button>

          <button
            onClick={() => setActiveTab('weight_steel')}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 border-t border-x ${
              activeTab === 'weight_steel'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 border-slate-200 dark:border-slate-800 border-b-white dark:border-b-slate-900 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900'
            }`}
          >
            <Weight className="w-4 h-4" />
            <span>Steel &amp; Weight (सरिया व वजन)</span>
          </button>

          <button
            onClick={() => setActiveTab('concrete')}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 border-t border-x ${
              activeTab === 'concrete'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 border-slate-200 dark:border-slate-800 border-b-white dark:border-b-slate-900 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Concrete Mix (कंक्रीट व सीमेंट)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

          {/* TAB 1: AREA CONVERTER */}
          {activeTab === 'area' && (
            <div className="space-y-5">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Enter Area Measurement (क्षेत्रफल दर्ज करें):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={areaVal || ''}
                      onChange={(e) => setAreaVal(Number(e.target.value))}
                      placeholder="e.g. 1800"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <select
                      value={areaUnit}
                      onChange={(e) => setAreaUnit(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="sqft">Square Feet (Sq.Ft)</option>
                      <option value="sqm">Square Meters (Sq.M)</option>
                      <option value="gaj">Gaj / Sq.Yard (गज / 9 Sq.Ft)</option>
                      <option value="brass">Brass (100 Sq.Ft)</option>
                      <option value="katha">Katha (1,361 Sq.Ft)</option>
                      <option value="acre">Acre (43,560 Sq.Ft)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Conversion Output Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Equivalent Measurements (तुल्य माप)
                  </h4>
                  {onApplyAreaToProject && (
                    <button
                      type="button"
                      onClick={() => {
                        onApplyAreaToProject(areaResults.sqft);
                        onClose();
                      }}
                      className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-2xs"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Set {areaResults.sqft} Sq.Ft as Project Area</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold block">Square Feet</span>
                      <span className="text-base font-black text-slate-900 dark:text-white">{areaResults.sqft.toLocaleString()} <span className="text-xs font-normal">Sq.Ft</span></span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(areaResults.sqft.toString(), 'sqft')}
                      className="p-1.5 text-slate-400 hover:text-teal-600 transition"
                      title="Copy"
                    >
                      {copiedKey === 'sqft' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">Square Meters</span>
                      <span className="text-base font-black text-slate-900 dark:text-white">{areaResults.sqm.toLocaleString()} <span className="text-xs font-normal">m²</span></span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(areaResults.sqm.toString(), 'sqm')}
                      className="p-1.5 text-slate-400 hover:text-teal-600 transition"
                    >
                      {copiedKey === 'sqm' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-3 bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block">Gaj / Sq.Yards (गज)</span>
                      <span className="text-base font-black text-slate-900 dark:text-white">{areaResults.gaj.toLocaleString()} <span className="text-xs font-normal">Gaj</span></span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(areaResults.gaj.toString(), 'gaj')}
                      className="p-1.5 text-slate-400 hover:text-amber-600 transition"
                    >
                      {copiedKey === 'gaj' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">Brass (Area)</span>
                      <span className="text-base font-black text-slate-900 dark:text-white">{areaResults.brass} <span className="text-xs font-normal">Brass</span></span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(areaResults.brass.toString(), 'brass')}
                      className="p-1.5 text-slate-400 hover:text-teal-600 transition"
                    >
                      {copiedKey === 'brass' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">Katha (कट्ठा)</span>
                      <span className="text-base font-black text-slate-900 dark:text-white">{areaResults.katha} <span className="text-xs font-normal">Katha</span></span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(areaResults.katha.toString(), 'katha')}
                      className="p-1.5 text-slate-400 hover:text-teal-600 transition"
                    >
                      {copiedKey === 'katha' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">Acre (एकड़)</span>
                      <span className="text-base font-black text-slate-900 dark:text-white">{areaResults.acre} <span className="text-xs font-normal">Acre</span></span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(areaResults.acre.toString(), 'acre')}
                      className="p-1.5 text-slate-400 hover:text-teal-600 transition"
                    >
                      {copiedKey === 'acre' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                <span>
                  <strong>Tip:</strong> In North India (UP, Bihar, MP), 1 Gaj (Sq.Yard) = 9 Sq.Ft. 1 Brass = 100 Sq.Ft slab area.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: VOLUME CONVERTER */}
          {activeTab === 'volume' && (
            <div className="space-y-5">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Enter Volume (बालू / गिट्टी / कंक्रीट आयतन):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={volumeVal || ''}
                      onChange={(e) => setVolumeVal(Number(e.target.value))}
                      placeholder="e.g. 100"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <select
                      value={volumeUnit}
                      onChange={(e) => setVolumeUnit(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="cft">Cubic Feet (CFT / Cu.Ft)</option>
                      <option value="cum">Cubic Meter (Cum / m³)</option>
                      <option value="brass">Brass (Volume: 100 CFT)</option>
                      <option value="liters">Liters (लिटर)</option>
                      <option value="bags">Cement Bags (1 Bag = 1.226 CFT)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Volume Results */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold block">Cubic Feet (CFT)</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">{volumeResults.cft.toLocaleString()} <span className="text-xs font-normal">CFT</span></span>
                  </div>
                  <button onClick={() => copyToClipboard(volumeResults.cft.toString(), 'vcft')} className="p-1.5 text-slate-400 hover:text-teal-600 transition">
                    {copiedKey === 'vcft' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">Cubic Meters (Cum)</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">{volumeResults.cum.toLocaleString()} <span className="text-xs font-normal">m³</span></span>
                  </div>
                  <button onClick={() => copyToClipboard(volumeResults.cum.toString(), 'vcum')} className="p-1.5 text-slate-400 hover:text-teal-600 transition">
                    {copiedKey === 'vcum' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block">Brass (100 CFT)</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">{volumeResults.brass} <span className="text-xs font-normal">Brass</span></span>
                  </div>
                  <button onClick={() => copyToClipboard(volumeResults.brass.toString(), 'vbrass')} className="p-1.5 text-slate-400 hover:text-amber-600 transition">
                    {copiedKey === 'vbrass' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">Water Tank Liters</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">{volumeResults.liters.toLocaleString()} <span className="text-xs font-normal">L</span></span>
                  </div>
                  <button onClick={() => copyToClipboard(volumeResults.liters.toString(), 'vliters')} className="p-1.5 text-slate-400 hover:text-teal-600 transition">
                    {copiedKey === 'vliters' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center sm:col-span-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">Approx Cement Bags Equivalent</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">{volumeResults.bags} <span className="text-xs font-normal">Bags (50kg)</span></span>
                  </div>
                  <button onClick={() => copyToClipboard(volumeResults.bags.toString(), 'vbags')} className="p-1.5 text-slate-400 hover:text-teal-600 transition">
                    {copiedKey === 'vbags' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WEIGHT & STEEL REBAR CALCULATOR */}
          {activeTab === 'weight_steel' && (
            <div className="space-y-6">
              
              {/* Part A: TMT Rebar Weight Calculator (d^2/162) */}
              <div className="bg-slate-900 text-white p-4.5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-teal-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    TMT Steel Rebar Weight Calculator (सरिया भार कैलकुलेटर)
                  </h4>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300 font-mono">
                    Formula: D²/162.2 kg/m
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">Bar Diameter (MM):</label>
                    <select
                      value={barDiaMm}
                      onChange={(e) => setBarDiaMm(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white"
                    >
                      {[8, 10, 12, 16, 20, 25, 32].map(d => (
                        <option key={d} value={d}>{d} mm TMT Bar</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">Bar Length (Meters):</label>
                    <input
                      type="number"
                      min="1"
                      value={barLengthMeters || ''}
                      onChange={(e) => setBarLengthMeters(Number(e.target.value))}
                      placeholder="12m standard"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">Number of Bars (Pcs):</label>
                    <input
                      type="number"
                      min="1"
                      value={barCount || ''}
                      onChange={(e) => setBarCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Unit Weight</span>
                    <span className="text-sm font-bold text-amber-400">{steelWeightPerMeter.toFixed(3)} kg/m</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Weight (Kg)</span>
                    <span className="text-sm font-black text-emerald-400">{steelTotalWeightKg.toFixed(1)} Kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Weight (Tonne)</span>
                    <span className="text-sm font-black text-teal-300">{(steelTotalWeightKg / 1000).toFixed(3)} MT</span>
                  </div>
                </div>
              </div>

              {/* Part B: General Weight Converter */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  General Weight Conversion (वजन रूपांतरण):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={weightVal || ''}
                      onChange={(e) => setWeightVal(Number(e.target.value))}
                      placeholder="e.g. 1"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <select
                      value={weightUnit}
                      onChange={(e) => setWeightUnit(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="mt">Metric Tonne (MT / टन)</option>
                      <option value="quintal">Quintal (क्विंटल / 100 kg)</option>
                      <option value="kg">Kilograms (Kg / किग्रा)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 block">Metric Tonnes</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{weightResults.mt} MT</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 block">Quintals</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{weightResults.quintal} Qtl</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 block">Kilograms</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{weightResults.kg.toLocaleString()} Kg</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONCRETE MIX & MATERIAL CALCULATOR */}
          {activeTab === 'concrete' && (
            <div className="space-y-5">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-700 dark:text-slate-300 font-bold block mb-1">
                      Concrete Mix Grade:
                    </label>
                    <select
                      value={mixGrade}
                      onChange={(e) => setMixGrade(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="M15">M15 Grade (1:2:4 Ratio)</option>
                      <option value="M20">M20 Grade (1:1.5:3 RCC Standard)</option>
                      <option value="M25">M25 Grade (1:1:2 Heavy Structural)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-700 dark:text-slate-300 font-bold block mb-1">
                      Concrete Volume:
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      value={concreteVol || ''}
                      onChange={(e) => setConcreteVol(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-700 dark:text-slate-300 font-bold block mb-1">
                      Volume Unit:
                    </label>
                    <select
                      value={concreteUnit}
                      onChange={(e) => setConcreteUnit(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="cum">Cubic Meters (Cum / m³)</option>
                      <option value="cft">Cubic Feet (CFT)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Concrete Raw Materials Result */}
              <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 text-white p-4.5 rounded-2xl border border-teal-800 space-y-3">
                <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  Raw Material Requirements for {concreteVol} {concreteUnit.toUpperCase()} {mixGrade} Concrete
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-teal-200 font-bold block">Cement Required</span>
                    <span className="text-base font-black text-white">{concreteEstimate.cementBags} <span className="text-xs font-normal">Bags</span></span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">({concreteEstimate.cementTonne} MT)</span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-amber-300 font-bold block">Sand / Coarse Sand</span>
                    <span className="text-base font-black text-white">{concreteEstimate.sandCft} <span className="text-xs font-normal">CFT</span></span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">({concreteEstimate.sandBrass} Brass)</span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-emerald-300 font-bold block">Aggregate / Gitti</span>
                    <span className="text-base font-black text-white">{concreteEstimate.gittiCft} <span className="text-xs font-normal">CFT</span></span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">({concreteEstimate.gittiBrass} Brass)</span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-blue-300 font-bold block">Water Needed</span>
                    <span className="text-base font-black text-white">{concreteEstimate.waterLiters.toLocaleString()} <span className="text-xs font-normal">Liters</span></span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Approx. Mix Water</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            2Click.in Civil Engineering Precision Toolkit
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition"
          >
            Close Converter
          </button>
        </div>

      </div>
    </div>
  );
};
