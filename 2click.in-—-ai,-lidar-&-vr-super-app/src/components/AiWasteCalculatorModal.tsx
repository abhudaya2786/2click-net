import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  X, 
  HelpCircle, 
  Maximize2, 
  Layers, 
  Grid, 
  Wrench,
  TrendingDown,
  DollarSign,
  Building2,
  Check
} from 'lucide-react';

export interface WasteAnalysisResult {
  materialType: string;
  standardWastagePct: number;
  optimizedWastagePct: number;
  savedWastagePct: number;
  standardQuantityNeeded: number;
  optimizedQuantityNeeded: number;
  totalSavedAmountINR: number;
  recommendedCuttingPattern: string;
  cutPlanDetails: Array<{
    section: string;
    piecesNeeded: number;
    offcutPercent: number;
    note: string;
  }>;
  aiTechnicianAdvice: string;
}

interface AiWasteCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToBoq?: (optimizedQty: number, wastagePct: number) => void;
  initialMaterialType?: string;
  initialUnitPriceINR?: number;
}

const MATERIAL_PRESETS = [
  {
    id: 'tiles',
    name: 'Vitrified Floor Tiles & Marble',
    icon: '📐',
    defaultStock: { lengthFt: 4, widthFt: 2, unit: 'ft' },
    defaultDim: { lengthFt: 18.5, widthFt: 14.2, heightFt: 0 },
    defaultUnitPrice: 85,
    commercialSizes: ['2ft x 2ft (600x600mm)', '2ft x 4ft (600x1200mm)', '4ft x 8ft (1200x2400mm GVT Slab)']
  },
  {
    id: 'rebar',
    name: 'TMT Steel Rebar (12m Stock Bar)',
    icon: '🏗️',
    defaultStock: { lengthFt: 39.37, widthFt: 0.05, unit: 'ft' }, // 12 meters
    defaultDim: { lengthFt: 12.5, widthFt: 0, heightFt: 0 }, // Cut length per column/beam
    defaultUnitPrice: 62,
    commercialSizes: ['12 Meters (39.37 ft Standard Factory Length)', '6 Meters Half Bar']
  },
  {
    id: 'plywood',
    name: 'BWR Plywood & MDF Sheets',
    icon: '🪵',
    defaultStock: { lengthFt: 8, widthFt: 4, unit: 'ft' },
    defaultDim: { lengthFt: 7, widthFt: 3.5, heightFt: 0 },
    defaultUnitPrice: 110,
    commercialSizes: ['8ft x 4ft (2440x1220mm Standard)', '7ft x 3ft Commercial Sheet', '8ft x 3ft Sheet']
  },
  {
    id: 'aac_blocks',
    name: 'AAC Masonry Blocks',
    icon: '🧱',
    defaultStock: { lengthFt: 2, widthFt: 0.66, unit: 'ft' }, // 600x200mm
    defaultDim: { lengthFt: 32, widthFt: 0, heightFt: 10 }, // Wall length x height
    defaultUnitPrice: 65,
    commercialSizes: ['600 x 200 x 150mm (24x8x6 in)', '600 x 200 x 200mm (24x8x8 in)']
  },
  {
    id: 'gypsum',
    name: 'Gypsum Board False Ceiling',
    icon: '🏛️',
    defaultStock: { lengthFt: 6, widthFt: 4, unit: 'ft' },
    defaultDim: { lengthFt: 22, widthFt: 16, heightFt: 0 },
    defaultUnitPrice: 48,
    commercialSizes: ['6ft x 4ft Gyproc Board', '8ft x 4ft Board']
  }
];

export const AiWasteCalculatorModal: React.FC<AiWasteCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyToBoq,
  initialMaterialType = 'tiles',
  initialUnitPriceINR = 85
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('tiles');
  const [elementName, setElementName] = useState<string>('Living Room Floor Area');
  const [lengthFt, setLengthFt] = useState<number>(18.5);
  const [widthFt, setWidthFt] = useState<number>(14.2);
  const [heightFt, setHeightFt] = useState<number>(0);
  
  const [stockLengthFt, setStockLengthFt] = useState<number>(4);
  const [stockWidthFt, setStockWidthFt] = useState<number>(2);
  const [unitPriceINR, setUnitPriceINR] = useState<number>(initialUnitPriceINR);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<WasteAnalysisResult | null>(null);
  const [isApplied, setIsApplied] = useState<boolean>(false);

  // Handle Preset Selection Change
  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = MATERIAL_PRESETS.find(m => m.id === presetId);
    if (!p) return;

    setLengthFt(p.defaultDim.lengthFt);
    setWidthFt(p.defaultDim.widthFt);
    setHeightFt(p.defaultDim.heightFt);
    setStockLengthFt(p.defaultStock.lengthFt);
    setStockWidthFt(p.defaultStock.widthFt);
    setUnitPriceINR(p.defaultUnitPrice);
    setElementName(`${p.name.split(' ')[0]} Layout`);
    setResult(null);
    setIsApplied(false);
  };

  // Run AI Analysis
  const runAnalysis = async () => {
    setIsLoading(true);
    setIsApplied(false);
    try {
      const response = await fetch('/api/ai/waste-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialType: selectedPresetId,
          elementName,
          dimensions: { lengthFt, widthFt, heightFt },
          stockSize: { lengthFt: stockLengthFt, widthFt: stockWidthFt },
          unitPriceINR
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Waste calc error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial analysis on modal open
  useEffect(() => {
    if (isOpen && !result) {
      runAnalysis();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPreset = MATERIAL_PRESETS.find(m => m.id === selectedPresetId) || MATERIAL_PRESETS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/20 text-teal-400 rounded-2xl border border-teal-500/30">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-extrabold text-[10px] border border-teal-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Material Optimizer
                </span>
                <span className="text-xs text-slate-400">IS-Code &amp; Commercial Off-cut Engine</span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5">
                Smart Commercial Off-Cut Waste Calculator
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin">
          
          {/* Material Category Presets Bar */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
              1. Select Material &amp; Cutting Context
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {MATERIAL_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    selectedPresetId === preset.id
                      ? 'bg-slate-800 border-teal-500 text-white ring-2 ring-teal-500/30 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xl mb-1">{preset.icon}</span>
                  <span className="text-xs font-bold leading-tight block truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dimension Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Element Description
              </label>
              <input
                type="text"
                value={elementName}
                onChange={e => setElementName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-teal-500"
                placeholder="e.g. Master Bedroom Flooring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Required Dimensions (Ft)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={lengthFt}
                  onChange={e => setLengthFt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-teal-500"
                  placeholder="Length (Ft)"
                />
                <input
                  type="number"
                  value={widthFt}
                  onChange={e => setWidthFt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-teal-500"
                  placeholder="Width (Ft)"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Commercial Stock Unit Size (Ft)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={stockLengthFt}
                  onChange={e => setStockLengthFt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-teal-500"
                  placeholder="Stock L (Ft)"
                />
                <input
                  type="number"
                  value={stockWidthFt}
                  onChange={e => setStockWidthFt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-teal-500"
                  placeholder="Stock W (Ft)"
                />
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="flex justify-end">
            <button
              onClick={runAnalysis}
              disabled={isLoading}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg transition"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing AI Cut Bin-Packing...</span>
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4" />
                  <span>Run AI Off-cut Optimization</span>
                </>
              )}
            </button>
          </div>

          {/* AI Optimization Results Section */}
          {result && (
            <div className="space-y-6 pt-2 animate-in fade-in duration-300">
              
              {/* Stat Highlight Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Unoptimized Wastage</span>
                  <div className="text-xl font-black text-rose-400 flex items-center gap-1">
                    {result.standardWastagePct}%
                    <span className="text-xs text-slate-400 font-normal">Off-cut Scrap</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">~{result.standardQuantityNeeded} Commercial Units</span>
                </div>

                <div className="p-4 bg-teal-950/60 rounded-2xl border border-teal-500/50 space-y-1">
                  <span className="text-[10px] text-teal-300 font-bold block uppercase">AI Optimized Wastage</span>
                  <div className="text-xl font-black text-teal-300 flex items-center gap-1">
                    {result.optimizedWastagePct}%
                    <span className="text-xs text-teal-400/80 font-normal">Off-cut Scrap</span>
                  </div>
                  <span className="text-[10px] text-teal-300/80 block">~{result.optimizedQuantityNeeded} Commercial Units</span>
                </div>

                <div className="p-4 bg-emerald-950/60 rounded-2xl border border-emerald-500/50 space-y-1">
                  <span className="text-[10px] text-emerald-300 font-bold block uppercase">Wastage Reduction</span>
                  <div className="text-xl font-black text-emerald-400 flex items-center gap-1">
                    <TrendingDown className="w-5 h-5" />
                    -{result.savedWastagePct}%
                  </div>
                  <span className="text-[10px] text-emerald-300/80 block">Scrap Prevention</span>
                </div>

                <div className="p-4 bg-amber-950/60 rounded-2xl border border-amber-500/50 space-y-1">
                  <span className="text-[10px] text-amber-300 font-bold block uppercase">Estimated Net Savings</span>
                  <div className="text-xl font-black text-amber-300 flex items-center gap-1">
                    ₹{result.totalSavedAmountINR.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-amber-300/80 block">Direct Capital Saved</span>
                </div>

              </div>

              {/* Visual Cut Pattern Layout Diagram (SVG) */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                  <span className="flex items-center gap-2 text-teal-400">
                    <Grid className="w-4 h-4" />
                    Visual Stock Cut Diagram ({selectedPresetId.toUpperCase()})
                  </span>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Primary Piece</span>
                    <span className="flex items-center gap-1 text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Off-cut Reused</span>
                    <span className="flex items-center gap-1 text-rose-400"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Scrap Waste</span>
                  </div>
                </div>

                {/* SVG Visual Representation */}
                <div className="w-full bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center min-h-[120px]">
                  {selectedPresetId === 'rebar' ? (
                    /* Rebar 12m Bar Cut Plan Representation */
                    <div className="w-full space-y-3">
                      <div className="text-[10px] text-slate-400 font-mono text-center">
                        Standard 12 Meter Factory Rebar Bar (39.37 ft) Cut Layout
                      </div>
                      <div className="w-full h-8 bg-slate-800 rounded-lg flex overflow-hidden border border-slate-700">
                        <div className="h-full bg-emerald-500/80 text-white text-[10px] font-bold flex items-center justify-center border-r border-slate-900" style={{ width: '32%' }}>
                          Cut 1 (3.8m Column)
                        </div>
                        <div className="h-full bg-emerald-500/80 text-white text-[10px] font-bold flex items-center justify-center border-r border-slate-900" style={{ width: '32%' }}>
                          Cut 2 (3.8m Column)
                        </div>
                        <div className="h-full bg-emerald-500/80 text-white text-[10px] font-bold flex items-center justify-center border-r border-slate-900" style={{ width: '32%' }}>
                          Cut 3 (3.8m Column)
                        </div>
                        <div className="h-full bg-amber-500/80 text-slate-950 text-[9px] font-extrabold flex items-center justify-center" style={{ width: '4%' }}>
                          Stirrup
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Grid Layout for Tiles / Plywood / Sheets */
                    <div className="w-full space-y-2">
                      <div className="grid grid-cols-6 gap-1.5 w-full">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-10 rounded-md border text-[10px] font-bold flex items-center justify-center transition ${
                              i < 9
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                : i < 11
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                            }`}
                          >
                            {i < 9 ? 'Full Grid' : i < 11 ? 'Border Trim' : 'Scrap'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Civil Engineer Advice Card */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-teal-500/30 space-y-2">
                <h4 className="text-xs font-bold text-teal-300 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-teal-400" />
                  AI Civil Engineer Layout Directive
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {result.aiTechnicianAdvice}
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <strong>Recommended Pattern:</strong> {result.recommendedCuttingPattern}
                </div>
              </div>

              {/* Apply to BOQ Button */}
              {onApplyToBoq && (
                <div className="flex items-center justify-between p-4 bg-teal-950/40 border border-teal-800/60 rounded-2xl">
                  <div className="text-xs text-teal-200">
                    <span className="font-bold block text-white">Apply Optimization to Project BOQ</span>
                    <span>Sets recommended quantity (~{result.optimizedQuantityNeeded} units) &amp; updates wastage margin to {result.optimizedWastagePct}%.</span>
                  </div>

                  <button
                    onClick={() => {
                      onApplyToBoq(result.optimizedQuantityNeeded, result.optimizedWastagePct);
                      setIsApplied(true);
                    }}
                    disabled={isApplied}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                      isApplied
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Applied to BOQ!</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        <span>Apply to Active BOQ</span>
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
