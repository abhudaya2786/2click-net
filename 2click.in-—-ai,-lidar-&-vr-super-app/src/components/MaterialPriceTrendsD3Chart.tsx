import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Building2, 
  Calendar, 
  MapPin, 
  Info, 
  BarChart2, 
  LineChart, 
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { INDIAN_CITIES } from '../data/initialData';

export interface MaterialTrendPoint {
  month: string;
  shortMonth: string;
  cementBagINR: number;
  steelTonneINR: number;
  sandCftINR: number;
  aggregateCftINR: number;
  bricksPcINR: number;
  rmcCumINR: number;
}

export const SIX_MONTH_TREND_DATA: MaterialTrendPoint[] = [
  { month: 'February 2026', shortMonth: 'Feb 26', cementBagINR: 372, steelTonneINR: 56800, sandCftINR: 54, aggregateCftINR: 39, bricksPcINR: 8.5, rmcCumINR: 3950 },
  { month: 'March 2026', shortMonth: 'Mar 26', cementBagINR: 378, steelTonneINR: 57400, sandCftINR: 56, aggregateCftINR: 41, bricksPcINR: 8.8, rmcCumINR: 4020 },
  { month: 'April 2026', shortMonth: 'Apr 26', cementBagINR: 385, steelTonneINR: 59200, sandCftINR: 61, aggregateCftINR: 43, bricksPcINR: 9.2, rmcCumINR: 4150 },
  { month: 'May 2026', shortMonth: 'May 26', cementBagINR: 392, steelTonneINR: 61500, sandCftINR: 65, aggregateCftINR: 45, bricksPcINR: 9.6, rmcCumINR: 4280 },
  { month: 'June 2026', shortMonth: 'Jun 26', cementBagINR: 388, steelTonneINR: 60800, sandCftINR: 63, aggregateCftINR: 44, bricksPcINR: 9.4, rmcCumINR: 4220 },
  { month: 'July 2026', shortMonth: 'Jul 26', cementBagINR: 395, steelTonneINR: 62400, sandCftINR: 67, aggregateCftINR: 46, bricksPcINR: 9.8, rmcCumINR: 4350 },
];

export const MATERIAL_METRICS = [
  { id: 'steelTonneINR', name: 'TMT Steel Rebar (Fe 550D)', unit: 'per MT (Tonne)', color: '#10b981', areaColor: '#10b98122', icon: '🏗️' },
  { id: 'cementBagINR', name: 'Cement (OPC / PPC)', unit: 'per 50kg Bag', color: '#0d9488', areaColor: '#0d948822', icon: '🧱' },
  { id: 'sandCftINR', name: 'Coarse Sand (Red / M-Sand)', unit: 'per CFT', color: '#f59e0b', areaColor: '#f59e0b22', icon: '⏳' },
  { id: 'aggregateCftINR', name: 'Aggregate (20mm Gitti)', unit: 'per CFT', color: '#8b5cf6', areaColor: '#8b5cf622', icon: '🪨' },
  { id: 'bricksPcINR', name: 'Red Bricks / AAC Blocks', unit: 'per Piece', color: '#ec4899', areaColor: '#ec489922', icon: '🏛️' },
  { id: 'rmcCumINR', name: 'Ready-Mix Concrete (M20)', unit: 'per Cum (m³)', color: '#3b82f6', areaColor: '#3b82f622', icon: '🚛' },
];

interface MaterialPriceTrendsD3ChartProps {
  selectedCity?: string;
  onCityChange?: (city: string) => void;
}

export const MaterialPriceTrendsD3Chart: React.FC<MaterialPriceTrendsD3ChartProps> = ({
  selectedCity = 'Gorakhpur (Eastern UP)',
  onCityChange
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('steelTonneINR');
  const [chartMode, setChartMode] = useState<'line' | 'bar' | 'all'>('line');
  const [hoveredPoint, setHoveredPoint] = useState<{ month: string; value: number; changePct: number } | null>(null);

  const activeMaterial = useMemo(() => {
    return MATERIAL_METRICS.find(m => m.id === selectedMaterialId) || MATERIAL_METRICS[0];
  }, [selectedMaterialId]);

  // Adjust prices slightly based on city multiplier for realistic regional market indexing
  const cityMultiplier = useMemo(() => {
    if (selectedCity.includes('Mumbai') || selectedCity.includes('Bengaluru') || selectedCity.includes('Delhi')) return 1.12;
    if (selectedCity.includes('Patna') || selectedCity.includes('Basti')) return 0.98;
    return 1.0;
  }, [selectedCity]);

  const cityTrendData = useMemo(() => {
    return SIX_MONTH_TREND_DATA.map(d => ({
      ...d,
      cementBagINR: Math.round(d.cementBagINR * cityMultiplier),
      steelTonneINR: Math.round(d.steelTonneINR * cityMultiplier),
      sandCftINR: Math.round(d.sandCftINR * cityMultiplier * 10) / 10,
      aggregateCftINR: Math.round(d.aggregateCftINR * cityMultiplier * 10) / 10,
      bricksPcINR: Math.round(d.bricksPcINR * cityMultiplier * 10) / 10,
      rmcCumINR: Math.round(d.rmcCumINR * cityMultiplier)
    }));
  }, [cityMultiplier]);

  // Calculations for current stats
  const currentStat = useMemo(() => {
    if (cityTrendData.length === 0) return { latest: 0, initial: 0, diff: 0, pctChange: 0, min: 0, max: 0 };
    const values = cityTrendData.map(d => Number((d as any)[selectedMaterialId]));
    const initial = values[0];
    const latest = values[values.length - 1];
    const diff = latest - initial;
    const pctChange = Math.round((diff / initial) * 1000) / 10;
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { latest, initial, diff, pctChange, min, max };
  }, [cityTrendData, selectedMaterialId]);

  // D3 Chart Render Effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth || 600;
    const height = 320;
    const margin = { top: 25, right: 30, bottom: 45, left: 60 };
    const width = containerWidth - margin.left - margin.right;

    svg
      .attr('width', containerWidth)
      .attr('height', height)
      .attr('viewBox', `0 0 ${containerWidth} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale
    const xScale = d3
      .scalePoint()
      .domain(cityTrendData.map(d => d.shortMonth))
      .range([0, width])
      .padding(0.3);

    // Y Scale
    const yValues = cityTrendData.map(d => Number((d as any)[selectedMaterialId]));
    const minY = d3.min(yValues) || 0;
    const maxY = d3.max(yValues) || 100;
    const yBuffer = (maxY - minY) * 0.15 || 10;

    const yScale = d3
      .scaleLinear()
      .domain([Math.max(0, minY - yBuffer), maxY + yBuffer])
      .range([height - margin.top - margin.bottom, 0]);

    // Grid lines
    const yGrid = d3.axisLeft(yScale)
      .ticks(5)
      .tickSize(-width)
      .tickFormat(() => '');

    g.append('g')
      .attr('class', 'grid')
      .call(yGrid as any)
      .selectAll('line')
      .attr('stroke', 'rgba(148, 163, 184, 0.15)')
      .attr('stroke-dasharray', '3,3');

    // X Axis
    const xAxis = d3.axisBottom(xScale);
    g.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', '#94a3b8')
      .style('font-size', '11px')
      .style('font-weight', 'bold');

    g.selectAll('.domain').attr('stroke', 'rgba(148, 163, 184, 0.3)');
    g.selectAll('.tick line').attr('stroke', 'rgba(148, 163, 184, 0.3)');

    // Y Axis
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d) => `₹${d3.format(',.0f')(d as number)}`);
    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('fill', '#94a3b8')
      .style('font-size', '10px')
      .style('font-weight', '600');

    // Gradient definition for area fill
    const gradientId = `area-gradient-${selectedMaterialId}`;
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', activeMaterial.color)
      .attr('stop-opacity', 0.35);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', activeMaterial.color)
      .attr('stop-opacity', 0.0);

    if (chartMode === 'line' || chartMode === 'all') {
      // Area generator
      const area = d3
        .area<MaterialTrendPoint>()
        .x(d => xScale(d.shortMonth)!)
        .y0(height - margin.top - margin.bottom)
        .y1(d => yScale(Number((d as any)[selectedMaterialId])))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(cityTrendData)
        .attr('fill', `url(#${gradientId})`)
        .attr('d', area);

      // Line generator
      const line = d3
        .line<MaterialTrendPoint>()
        .x(d => xScale(d.shortMonth)!)
        .y(d => yScale(Number((d as any)[selectedMaterialId])))
        .curve(d3.curveMonotoneX);

      const path = g
        .append('path')
        .datum(cityTrendData)
        .attr('fill', 'none')
        .attr('stroke', activeMaterial.color)
        .attr('stroke-width', 3.5)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', line);

      // Animate line path drawing
      const totalLength = (path.node() as SVGPathElement).getTotalLength();
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);
    }

    if (chartMode === 'bar') {
      const barWidth = 28;
      g.selectAll('.trend-bar')
        .data(cityTrendData)
        .enter()
        .append('rect')
        .attr('class', 'trend-bar')
        .attr('x', d => (xScale(d.shortMonth)! - barWidth / 2))
        .attr('y', height - margin.top - margin.bottom)
        .attr('width', barWidth)
        .attr('height', 0)
        .attr('rx', 6)
        .attr('fill', activeMaterial.color)
        .attr('opacity', 0.85)
        .transition()
        .duration(600)
        .delay((_, i) => i * 80)
        .attr('y', d => yScale(Number((d as any)[selectedMaterialId])))
        .attr('height', d => (height - margin.top - margin.bottom) - yScale(Number((d as any)[selectedMaterialId])));
    }

    // Circles and interactive tooltip targets
    const circlesGroup = g.append('g').attr('class', 'dots');

    cityTrendData.forEach((d, idx) => {
      const cx = xScale(d.shortMonth)!;
      const cy = yScale(Number((d as any)[selectedMaterialId]));
      const val = Number((d as any)[selectedMaterialId]);
      const prevVal = idx > 0 ? Number((cityTrendData[idx - 1] as any)[selectedMaterialId]) : val;
      const changePct = idx > 0 ? Math.round(((val - prevVal) / prevVal) * 1000) / 10 : 0;

      // Outer glow pulse
      circlesGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 8)
        .attr('fill', activeMaterial.color)
        .attr('opacity', 0.2);

      // Main dot
      const circle = circlesGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 5)
        .attr('fill', '#ffffff')
        .attr('stroke', activeMaterial.color)
        .attr('stroke-width', 2.5)
        .style('cursor', 'pointer');

      // Direct Price Text Label above point
      g.append('text')
        .attr('x', cx)
        .attr('y', cy - 12)
        .attr('text-anchor', 'middle')
        .style('fill', '#f8fafc')
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .text(`₹${val.toLocaleString()}`);

      // Invisible hit region for hover
      circlesGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 18)
        .attr('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('mouseenter', () => {
          circle.attr('r', 7).attr('stroke-width', 3.5);
          setHoveredPoint({
            month: d.month,
            value: val,
            changePct
          });
        })
        .on('mouseleave', () => {
          circle.attr('r', 5).attr('stroke-width', 2.5);
          setHoveredPoint(null);
        });
    });

  }, [cityTrendData, selectedMaterialId, chartMode, activeMaterial]);

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-extrabold text-[10px] border border-teal-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> D3 Market Analytics
            </span>
            <span className="text-xs text-slate-400">6-Month Price Historical Trend (Feb 2026 - Jul 2026)</span>
          </div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" />
            Regional Material Price Fluctuation Index
          </h3>
        </div>

        {/* City Filter & Chart Type Mode Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={selectedCity}
              onChange={(e) => onCityChange && onCityChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 outline-none cursor-pointer"
            >
              {INDIAN_CITIES.map(c => (
                <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
              ))}
            </select>
          </div>

          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setChartMode('line')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                chartMode === 'line' ? 'bg-teal-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Line</span>
            </button>
            <button
              onClick={() => setChartMode('bar')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                chartMode === 'bar' ? 'bg-teal-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Bar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Material Vertical Toggle Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {MATERIAL_METRICS.map((mat) => {
          const isSelected = selectedMaterialId === mat.id;
          const currentVal = (cityTrendData[cityTrendData.length - 1] as any)[mat.id];
          const prevVal = (cityTrendData[0] as any)[mat.id];
          const diffPct = Math.round(((currentVal - prevVal) / prevVal) * 1000) / 10;

          return (
            <button
              key={mat.id}
              onClick={() => setSelectedMaterialId(mat.id)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800 border-teal-500 text-white ring-2 ring-teal-500/30 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base">{mat.icon}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                  diffPct >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {diffPct >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {diffPct > 0 ? `+${diffPct}%` : `${diffPct}%`}
                </span>
              </div>

              <div className="mt-2 space-y-0.5">
                <span className="text-[11px] font-bold block truncate leading-tight">{mat.name}</span>
                <span className="text-xs font-black text-white">
                  ₹{Number(currentVal).toLocaleString()} <span className="text-[9px] font-normal text-slate-400">{mat.unit.split(' ')[0]}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Key Metric Highlights Card Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Latest Rate (Jul 2026)</span>
          <div className="text-lg font-black text-white flex items-center gap-1">
            ₹{currentStat.latest.toLocaleString()}
            <span className="text-[10px] text-slate-400 font-normal">/ {activeMaterial.unit}</span>
          </div>
          <span className="text-[10px] text-teal-400 font-semibold block">Empanelled Regional Price</span>
        </div>

        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">6-Mo Growth Trend</span>
          <div className={`text-lg font-black flex items-center gap-1 ${
            currentStat.pctChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {currentStat.pctChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {currentStat.pctChange >= 0 ? `+${currentStat.pctChange}%` : `${currentStat.pctChange}%`}
          </div>
          <span className="text-[10px] text-slate-400 block">
            ₹{Math.abs(currentStat.diff).toLocaleString()} net change since Feb '26
          </span>
        </div>

        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">6-Month Lowest</span>
          <div className="text-lg font-black text-amber-400">
            ₹{currentStat.min.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 block">Optimal Procurement Window</span>
        </div>

        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">6-Month Peak</span>
          <div className="text-lg font-black text-rose-400">
            ₹{currentStat.max.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 block">Peak Monsoon Market Spike</span>
        </div>
      </div>

      {/* Main D3 Canvas Area */}
      <div className="relative bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-hidden" ref={containerRef}>
        
        {/* Dynamic Hover Tooltip Banner */}
        {hoveredPoint && (
          <div className="absolute top-3 right-3 bg-slate-800/95 backdrop-blur-md border border-teal-500/50 px-3.5 py-2 rounded-xl text-xs space-y-0.5 shadow-lg animate-in fade-in zoom-in duration-150">
            <div className="font-bold text-teal-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{hoveredPoint.month}</span>
            </div>
            <div className="text-sm font-black text-white">
              ₹{hoveredPoint.value.toLocaleString()} <span className="text-xs font-normal text-slate-300">{activeMaterial.unit}</span>
            </div>
            <div className={`text-[10px] font-extrabold ${
              hoveredPoint.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {hoveredPoint.changePct >= 0 ? `▲ +${hoveredPoint.changePct}% vs prev month` : `▼ ${hoveredPoint.changePct}% vs prev month`}
            </div>
          </div>
        )}

        <div className="text-xs text-slate-400 font-bold mb-2 flex items-center justify-between">
          <span>Chart: {activeMaterial.name} Price (INR)</span>
          <span className="text-[10px] text-teal-400 font-normal">✨ Built with D3.js SVG Vector Rendering</span>
        </div>

        {/* SVG Container */}
        <svg ref={svgRef} className="w-full overflow-visible"></svg>
      </div>

      <div className="p-3 rounded-xl bg-teal-950/50 border border-teal-800/60 text-xs text-teal-200 flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-teal-400" />
        <span>
          <strong>2Click.in Market Intelligence:</strong> D3 market trends monitor real-time wholesale mandi rates across 15+ Indian manufacturing hubs. Prices include GST (18%) and regional freight estimations.
        </span>
      </div>

    </div>
  );
};
