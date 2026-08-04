import React, { useState } from 'react';
import { 
  Maximize2, 
  Layers, 
  Download, 
  Compass, 
  BarChart3, 
  Activity, 
  ShieldCheck, 
  Info,
  MapPin,
  RefreshCw,
  FileCheck,
  Ruler,
  Sparkles,
  Zap,
  Flame,
  AlertTriangle,
  Sliders,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ChevronRight,
  Filter
} from 'lucide-react';
import { SAMPLE_LIDAR_SURVEY } from '../data/initialData';
import { ArMeasurementOverlay } from './ArMeasurementOverlay';

export interface DiscrepancyPoint {
  id: string;
  gridCode: string;
  x: number;
  y: number;
  z: number; // Actual scanned elevation (m)
  designZ: number; // Designed target elevation (m)
  deltaCm: number; // Difference in cm
  classification: 'Terrain' | 'Structure' | 'Vegetation' | 'Boundary';
  intensity: number;
  slopeDeg: number;
  discrepancyType: 'Major-Fill' | 'Minor-Fill' | 'On-Grade' | 'Minor-Cut' | 'Major-Cut' | 'Structural-Shift';
  severity: 'High' | 'Medium' | 'Low' | 'Pass';
  recommendedAction: string;
}

// 16 Grid Points with calculated construction discrepancy metrics
const RICH_DISCREPANCY_POINTS: DiscrepancyPoint[] = [
  { id: 'DP-01', gridCode: 'A1', x: 12, y: 15, z: 550.8, designZ: 550.0, deltaCm: 80, classification: 'Terrain', intensity: 220, slopeDeg: 14.2, discrepancyType: 'Major-Fill', severity: 'High', recommendedAction: 'High fill deviation +80cm. Excavate topsoil or revise grade line.' },
  { id: 'DP-02', gridCode: 'A2', x: 28, y: 18, z: 552.4, designZ: 552.3, deltaCm: 10, classification: 'Terrain', intensity: 210, slopeDeg: 4.1, discrepancyType: 'Minor-Fill', severity: 'Low', recommendedAction: 'Minor +10cm variance. Within acceptable sub-base tolerance.' },
  { id: 'DP-03', gridCode: 'A3', x: 45, y: 22, z: 555.1, designZ: 555.1, deltaCm: 0, classification: 'Structure', intensity: 245, slopeDeg: 1.2, discrepancyType: 'On-Grade', severity: 'Pass', recommendedAction: '100% On Grade (±0cm). Approved for slab shuttering.' },
  { id: 'DP-04', gridCode: 'A4', x: 62, y: 25, z: 558.9, designZ: 559.4, deltaCm: -50, classification: 'Terrain', intensity: 195, slopeDeg: 18.5, discrepancyType: 'Major-Cut', severity: 'High', recommendedAction: 'Deficit -50cm (Cut required). Backfill 12.4 m³ WMM aggregate.' },
  { id: 'DP-05', gridCode: 'B1', x: 15, y: 40, z: 551.2, designZ: 551.0, deltaCm: 20, classification: 'Terrain', intensity: 205, slopeDeg: 6.8, discrepancyType: 'Minor-Fill', severity: 'Medium', recommendedAction: 'Fill excess +20cm. Grade with JCB roller before compaction.' },
  { id: 'DP-06', gridCode: 'B2', x: 32, y: 42, z: 553.6, designZ: 553.6, deltaCm: 2, classification: 'Structure', intensity: 250, slopeDeg: 2.1, discrepancyType: 'On-Grade', severity: 'Pass', recommendedAction: 'On Grade (+2cm). Structural column base in alignment.' },
  { id: 'DP-07', gridCode: 'B3', x: 50, y: 48, z: 556.8, designZ: 557.4, deltaCm: -60, classification: 'Boundary', intensity: 230, slopeDeg: 22.1, discrepancyType: 'Major-Cut', severity: 'High', recommendedAction: 'Severe slope discrepancy -60cm. Retaining wall footings required.' },
  { id: 'DP-08', gridCode: 'B4', x: 68, y: 52, z: 561.1, designZ: 561.0, deltaCm: 10, classification: 'Structure', intensity: 240, slopeDeg: 3.5, discrepancyType: 'Minor-Fill', severity: 'Low', recommendedAction: 'Minor +10cm beam clearance deviation. Safe.' },
  { id: 'DP-09', gridCode: 'C1', x: 18, y: 65, z: 551.9, designZ: 552.2, deltaCm: -30, classification: 'Terrain', intensity: 180, slopeDeg: 11.4, discrepancyType: 'Minor-Cut', severity: 'Medium', recommendedAction: 'Cut zone -30cm. Requires 8.2 m³ earth fill.' },
  { id: 'DP-10', gridCode: 'C2', x: 36, y: 68, z: 554.8, designZ: 554.8, deltaCm: -1, classification: 'Structure', intensity: 255, slopeDeg: 1.5, discrepancyType: 'On-Grade', severity: 'Pass', recommendedAction: 'Optimal grade. Zero discrepancy.' },
  { id: 'DP-11', gridCode: 'C3', x: 54, y: 72, z: 558.3, designZ: 557.1, deltaCm: 120, classification: 'Structure', intensity: 248, slopeDeg: 15.8, discrepancyType: 'Structural-Shift', severity: 'High', recommendedAction: 'CRITICAL: +120cm elevation shift & lateral drift detected on column C3.' },
  { id: 'DP-12', gridCode: 'C4', x: 72, y: 75, z: 562.9, designZ: 562.8, deltaCm: 10, classification: 'Vegetation', intensity: 110, slopeDeg: 8.9, discrepancyType: 'Minor-Fill', severity: 'Low', recommendedAction: 'Vegetation clearing required prior to final leveling.' },
  { id: 'DP-13', gridCode: 'D1', x: 22, y: 88, z: 552.8, designZ: 552.8, deltaCm: 0, classification: 'Boundary', intensity: 215, slopeDeg: 2.8, discrepancyType: 'On-Grade', severity: 'Pass', recommendedAction: 'Boundary wall foundation level verified.' },
  { id: 'DP-14', gridCode: 'D2', x: 40, y: 90, z: 556.0, designZ: 555.2, deltaCm: 80, classification: 'Terrain', intensity: 190, slopeDeg: 12.0, discrepancyType: 'Major-Fill', severity: 'High', recommendedAction: 'Excess earth fill +80cm. Excavate to avoid stormwater pooling.' },
  { id: 'DP-15', gridCode: 'D3', x: 58, y: 92, z: 560.2, designZ: 560.5, deltaCm: -30, classification: 'Terrain', intensity: 200, slopeDeg: 9.3, discrepancyType: 'Minor-Cut', severity: 'Medium', recommendedAction: 'Depression -30cm. Fill & compact before road paving.' },
  { id: 'DP-16', gridCode: 'D4', x: 78, y: 95, z: 564.2, designZ: 564.1, deltaCm: 10, classification: 'Terrain', intensity: 225, slopeDeg: 5.2, discrepancyType: 'Minor-Fill', severity: 'Low', recommendedAction: 'Site peak elevation verified within +10cm tolerance.' }
];

export const LidarSurveyViewer: React.FC = () => {
  const [survey] = useState(SAMPLE_LIDAR_SURVEY);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Terrain' | 'Structure' | 'Vegetation' | 'Boundary'>('All');
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [contourInterval, setContourInterval] = useState<number>(0.5);
  const [isArOverlayOpen, setIsArOverlayOpen] = useState<boolean>(false);

  // HEATMAP LAYER STATES
  const [isHeatmapActive, setIsHeatmapActive] = useState<boolean>(true);
  const [heatmapMode, setHeatmapMode] = useState<'discrepancy' | 'elevation' | 'slope' | 'density'>('discrepancy');
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.85);
  const [selectedHotspot, setSelectedHotspot] = useState<DiscrepancyPoint | null>(RICH_DISCREPANCY_POINTS[0]);
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<'All' | 'High' | 'Medium' | 'Low' | 'Pass'>('All');

  // Filtered discrepancy points based on layer filter & severity filter
  const filteredDiscrepancyPoints = RICH_DISCREPANCY_POINTS.filter(p => {
    const matchesClassification = activeFilter === 'All' || p.classification === activeFilter;
    const matchesSeverity = selectedSeverityFilter === 'All' || p.severity === selectedSeverityFilter;
    return matchesClassification && matchesSeverity;
  });

  // Calculate summary metrics
  const highRiskCount = RICH_DISCREPANCY_POINTS.filter(p => p.severity === 'High').length;
  const mediumRiskCount = RICH_DISCREPANCY_POINTS.filter(p => p.severity === 'Medium').length;
  const passCount = RICH_DISCREPANCY_POINTS.filter(p => p.severity === 'Pass').length;
  const compliancePercent = Math.round((passCount / RICH_DISCREPANCY_POINTS.length) * 100);

  // Volumetric estimates
  const totalCutVolumeM3 = 640;
  const totalFillVolumeM3 = 410;
  const netBalanceM3 = totalCutVolumeM3 - totalFillVolumeM3;

  // Helper for heatmap colors
  const getPointHeatmapStyle = (pt: DiscrepancyPoint) => {
    if (!isHeatmapActive) {
      if (pt.classification === 'Terrain') return 'bg-emerald-500 shadow-emerald-500/50';
      if (pt.classification === 'Structure') return 'bg-amber-500 shadow-amber-500/50';
      if (pt.classification === 'Vegetation') return 'bg-teal-400 shadow-teal-400/50';
      return 'bg-cyan-400 shadow-cyan-400/50';
    }

    if (heatmapMode === 'discrepancy') {
      if (pt.severity === 'High') return 'bg-rose-500 shadow-rose-500/80 animate-pulse ring-4 ring-rose-500/30';
      if (pt.severity === 'Medium') return 'bg-amber-500 shadow-amber-500/70 ring-2 ring-amber-500/20';
      if (pt.severity === 'Low') return 'bg-yellow-400 shadow-yellow-400/60';
      return 'bg-emerald-500 shadow-emerald-500/60';
    }

    if (heatmapMode === 'elevation') {
      // 548m (blue) -> 564m (red)
      const ratio = Math.min(Math.max((pt.z - 550) / 14, 0), 1);
      if (ratio > 0.8) return 'bg-red-500 shadow-red-500/80';
      if (ratio > 0.6) return 'bg-orange-500 shadow-orange-500/70';
      if (ratio > 0.4) return 'bg-yellow-400 shadow-yellow-400/70';
      if (ratio > 0.2) return 'bg-emerald-400 shadow-emerald-400/70';
      return 'bg-cyan-500 shadow-cyan-500/70';
    }

    if (heatmapMode === 'slope') {
      if (pt.slopeDeg > 15) return 'bg-purple-600 shadow-purple-600/80 animate-pulse';
      if (pt.slopeDeg > 8) return 'bg-amber-500 shadow-amber-500/70';
      return 'bg-emerald-500 shadow-emerald-500/60';
    }

    // density / intensity
    return pt.intensity > 230 ? 'bg-indigo-500 shadow-indigo-500/80' : 'bg-blue-400 shadow-blue-400/60';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 shadow-md">
              <Maximize2 className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">3D LiDAR Survey &amp; Heatmap Discrepancy Engine</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono text-[10px] font-extrabold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-500 animate-bounce" /> HEATMAP ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Sub-centimeter topographical scanning, CAD elevation variance, terrain slope &amp; cut/fill discrepancy analysis.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsArOverlayOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-2 transition shadow-md cursor-pointer"
          >
            <Ruler className="w-4 h-4 animate-pulse" />
            <span>Launch WebXR AR Measurement</span>
          </button>

          <button
            onClick={() => alert('Generating Discrepancy Heatmap & LAS CAD Export...')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Heatmap DXF / LAS
          </button>
        </div>
      </div>

      {/* HEATMAP QUICK SUMMARY BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">High Discrepancies</div>
            <div className="text-xl font-black text-rose-400 font-mono">{highRiskCount} Zones</div>
            <div className="text-[10px] text-slate-500">&gt; ±15cm Variance</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">CAD Grade Compliance</div>
            <div className="text-xl font-black text-emerald-400 font-mono">{compliancePercent}%</div>
            <div className="text-[10px] text-slate-500">Within ±5cm Spec</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Net Earthwork Cut</div>
            <div className="text-xl font-black text-cyan-400 font-mono">+{netBalanceM3} m³</div>
            <div className="text-[10px] text-slate-500">Cut {totalCutVolumeM3}m³ / Fill {totalFillVolumeM3}m³</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Heatmap Active Mode</div>
            <div className="text-sm font-black text-purple-300 capitalize">{heatmapMode}</div>
            <div className="text-[10px] text-slate-500">Opacity {(heatmapOpacity * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Controls & Discrepancy Inspector */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Heatmap Layer Control Card */}
          <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                Heatmap Analysis Settings
              </h2>

              {/* Heatmap Toggle Button */}
              <button
                onClick={() => setIsHeatmapActive(!isHeatmapActive)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isHeatmapActive
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                {isHeatmapActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{isHeatmapActive ? 'Heatmap ON' : 'Heatmap OFF'}</span>
              </button>
            </div>

            {/* Heatmap Mode Selector */}
            {isHeatmapActive && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Heatmap Color Visualization Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'discrepancy', label: 'Discrepancy / Cut-Fill', icon: '⚠️' },
                    { id: 'elevation', label: 'Elevation Spectrum', icon: '🌡️' },
                    { id: 'slope', label: 'Slope & Slope Risk', icon: '⚡' },
                    { id: 'density', label: 'Reflectivity Density', icon: '📊' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setHeatmapMode(m.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold text-left transition cursor-pointer border ${
                        heatmapMode === m.id
                          ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div>{m.icon} {m.label}</div>
                    </button>
                  ))}
                </div>

                {/* Heatmap Opacity Slider */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Heatmap Overlay Opacity</span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400">{(heatmapOpacity * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={1.0}
                    step={0.05}
                    value={heatmapOpacity}
                    onChange={e => setHeatmapOpacity(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Severity Filter */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Filter Hotspots by Severity
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(['All', 'High', 'Medium', 'Low', 'Pass'] as const).map(sev => (
                  <button
                    key={sev}
                    onClick={() => setSelectedSeverityFilter(sev)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                      selectedSeverityFilter === sev
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {sev === 'High' ? '🔴 High Risk' : sev === 'Medium' ? '🟡 Medium' : sev === 'Pass' ? '🟢 On Spec' : sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Classification Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Point Cloud Layer Classification
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(['All', 'Terrain', 'Structure', 'Vegetation', 'Boundary'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                      activeFilter === f
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Contour interval */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contour Line Step Interval: {contourInterval}m
              </label>
              <input
                type="range"
                min={0.1}
                max={2.0}
                step={0.1}
                value={contourInterval}
                onChange={(e) => setContourInterval(Number(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Selected Hotspot Detailed Inspector Card */}
          {selectedHotspot && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${
                    selectedHotspot.severity === 'High' ? 'bg-rose-500 animate-ping' :
                    selectedHotspot.severity === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <span className="font-mono font-black text-white text-sm">
                    Grid {selectedHotspot.gridCode} ({selectedHotspot.id})
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  selectedHotspot.severity === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                  selectedHotspot.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {selectedHotspot.discrepancyType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Scanned LiDAR Z</div>
                  <div className="font-mono font-black text-cyan-400 text-sm">{selectedHotspot.z.toFixed(2)}m</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Designed Target Z</div>
                  <div className="font-mono font-black text-slate-200 text-sm">{selectedHotspot.designZ.toFixed(2)}m</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Elevation Delta</div>
                  <div className={`font-mono font-black text-sm ${
                    selectedHotspot.deltaCm > 0 ? 'text-rose-400' : selectedHotspot.deltaCm < 0 ? 'text-cyan-400' : 'text-emerald-400'
                  }`}>
                    {selectedHotspot.deltaCm > 0 ? `+${selectedHotspot.deltaCm} cm` : `${selectedHotspot.deltaCm} cm`}
                  </div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Terrain Slope Angle</div>
                  <div className="font-mono font-black text-purple-400 text-sm">{selectedHotspot.slopeDeg}°</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                  <ShieldCheck size={13} /> Recommended Engineering Action:
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {selectedHotspot.recommendedAction}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Right Interactive Point Cloud & Heatmap Canvas Simulator */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-6 shadow-2xl min-h-[480px] flex flex-col justify-between">
            
            {/* Top Bar inside Canvas */}
            <div className="flex justify-between items-center z-10 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  LiDAR Point Cloud + Heatmap Canvas
                </span>
              </div>

              <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setIsArOverlayOpen(true)}
                  className="px-2.5 py-1 rounded-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 flex items-center gap-1 shadow-sm hover:scale-102 transition cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" /> AR Ruler
                </button>
                <button
                  onClick={() => setIs3DMode(true)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    is3DMode ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  3D Mesh
                </button>
                <button
                  onClick={() => setIs3DMode(false)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    !is3DMode ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Contour Overlay
                </button>
              </div>
            </div>

            {/* Heatmap Layer Background Texture Surface */}
            <div className="my-6 relative h-80 w-full flex items-center justify-center rounded-xl overflow-hidden border border-slate-800/80">
              
              {/* Animated Heatmap Radial Gradient Texture */}
              {isHeatmapActive && (
                <div 
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                  style={{
                    opacity: heatmapOpacity,
                    backgroundImage: heatmapMode === 'discrepancy'
                      ? `radial-gradient(circle at 20% 30%, rgba(244, 63, 94, 0.45) 0%, transparent 40%),
                         radial-gradient(circle at 75% 75%, rgba(244, 63, 94, 0.4) 0%, transparent 35%),
                         radial-gradient(circle at 55% 40%, rgba(6, 182, 212, 0.35) 0%, transparent 40%),
                         radial-gradient(circle at 40% 80%, rgba(245, 158, 11, 0.35) 0%, transparent 35%),
                         radial-gradient(circle at 80% 25%, rgba(16, 185, 129, 0.25) 0%, transparent 45%)`
                      : heatmapMode === 'elevation'
                      ? `linear-gradient(135deg, rgba(6,182,212,0.3) 0%, rgba(16,185,129,0.3) 30%, rgba(245,158,11,0.3) 60%, rgba(244,63,94,0.4) 100%)`
                      : heatmapMode === 'slope'
                      ? `radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.4) 0%, rgba(245, 158, 11, 0.2) 50%, transparent 80%)`
                      : `radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.4) 0%, transparent 70%)`
                  }}
                />
              )}

              {/* Simulated elevation grid lines */}
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 gap-2 opacity-25">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-cyan-500/20 rounded-xs flex items-center justify-center text-[9px] font-mono text-cyan-300"
                  >
                    {(548 + (i % 8) * 2.1).toFixed(1)}m
                  </div>
                ))}
              </div>

              {/* Interactive Heatmap Points Grid */}
              <div className="relative z-10 w-full h-full grid grid-cols-4 grid-rows-4 gap-4 p-6">
                {filteredDiscrepancyPoints.map((pt) => {
                  const isSelected = selectedHotspot?.id === pt.id;
                  const colorClass = getPointHeatmapStyle(pt);

                  return (
                    <div
                      key={pt.id}
                      onClick={() => setSelectedHotspot(pt)}
                      className={`relative flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${
                        isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                      }`}
                    >
                      {/* Point Node Circle */}
                      <div 
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-xl transition-transform ${colorClass} ${
                          isSelected ? 'ring-4 ring-white border-2 border-slate-900' : ''
                        }`}
                      >
                        {pt.gridCode}
                      </div>

                      {/* Hotspot Alert Tag */}
                      {pt.severity === 'High' && (
                        <span className="absolute -top-2.5 bg-rose-600 text-white text-[8px] font-black px-1 rounded-full shadow-lg flex items-center gap-0.5 animate-bounce">
                          ⚡ Discrepancy
                        </span>
                      )}

                      {/* Label under point */}
                      <span className="text-[9px] font-mono text-slate-300 font-bold mt-1 bg-slate-950/80 px-1 rounded border border-slate-800">
                        {pt.z.toFixed(1)}m ({pt.deltaCm > 0 ? `+${pt.deltaCm}` : pt.deltaCm}cm)
                      </span>

                      {/* Tooltip on hover */}
                      <div className="absolute bottom-10 hidden group-hover:block bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl text-[10px] whitespace-nowrap z-40 shadow-2xl space-y-0.5">
                        <div className="font-bold text-cyan-400 flex items-center gap-1">
                          Grid {pt.gridCode} • {pt.classification}
                        </div>
                        <div>Elevation Scanned: <span className="font-mono font-bold">{pt.z.toFixed(2)}m</span></div>
                        <div>Elevation Design: <span className="font-mono">{pt.designZ.toFixed(2)}m</span></div>
                        <div className="font-bold text-amber-300">Delta: {pt.deltaCm > 0 ? `+${pt.deltaCm}cm` : `${pt.deltaCm}cm`}</div>
                        <div className="text-[9px] text-slate-400 italic mt-1">{pt.recommendedAction}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Bottom Heatmap Legend Bar */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 z-10 gap-3">
              {heatmapMode === 'discrepancy' ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-slate-300 text-xs">Heatmap Scale:</span>
                  <span className="flex items-center gap-1 text-[10px]"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High Fill (&gt;+15cm)</span>
                  <span className="flex items-center gap-1 text-[10px]"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderate (+5-15cm)</span>
                  <span className="flex items-center gap-1 text-[10px]"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> On Grade (±5cm)</span>
                  <span className="flex items-center gap-1 text-[10px]"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Cut Zone (&lt;-15cm)</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-slate-300 text-xs">Elevation Spectrum:</span>
                  <div className="h-2.5 w-32 rounded-full bg-gradient-to-r from-cyan-500 via-emerald-400 via-amber-400 to-rose-500" />
                  <span className="text-[10px] font-mono text-cyan-300">548.0m ➔ 564.2m</span>
                </div>
              )}

              <div className="font-mono text-cyan-300 text-xs font-bold flex items-center gap-2">
                <span>Hotspots Analyzed: {filteredDiscrepancyPoints.length}</span>
                <span>·</span>
                <span className="text-emerald-400">Pass Rate: {compliancePercent}%</span>
              </div>
            </div>

          </div>

          {/* Discrepancies Table / Hotspot List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                <h3 className="font-extrabold text-sm text-white">Construction Discrepancies &amp; Earthwork Hotspots Log</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Showing {filteredDiscrepancyPoints.length} of {RICH_DISCREPANCY_POINTS.length} Grid Hotspots</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                    <th className="py-2 px-3">Grid ID</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Scanned Z</th>
                    <th className="py-2 px-3">Target CAD Z</th>
                    <th className="py-2 px-3">Variance Delta</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredDiscrepancyPoints.map((pt) => (
                    <tr 
                      key={pt.id}
                      onClick={() => setSelectedHotspot(pt)}
                      className={`hover:bg-slate-800/50 cursor-pointer transition ${
                        selectedHotspot?.id === pt.id ? 'bg-blue-950/60 font-bold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        {pt.gridCode}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{pt.classification}</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">{pt.z.toFixed(2)}m</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{pt.designZ.toFixed(2)}m</td>
                      <td className={`py-2.5 px-3 font-mono font-bold ${
                        pt.deltaCm > 0 ? 'text-rose-400' : pt.deltaCm < 0 ? 'text-cyan-400' : 'text-emerald-400'
                      }`}>
                        {pt.deltaCm > 0 ? `+${pt.deltaCm} cm` : `${pt.deltaCm} cm`}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          pt.severity === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                          pt.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}>
                          {pt.discrepancyType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 ml-auto">
                          <span>Inspect</span> <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* AR MEASUREMENT OVERLAY MODAL */}
      <ArMeasurementOverlay
        isOpen={isArOverlayOpen}
        onClose={() => setIsArOverlayOpen(false)}
        surveyTitle={survey.location}
      />

    </div>
  );
};

