import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { 
  PieChart as PieIcon, 
  Layers, 
  Sparkles, 
  Info, 
  DollarSign, 
  Filter, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight,
  BarChart3
} from 'lucide-react';

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  itemsCount: number;
}

export interface CustomItemData {
  id: string;
  title: string;
  category: string;
  unitRateINR: number;
  quantity: number;
  unit: string;
  totalCostINR: number;
  brandName?: string;
}

interface MaterialBudgetPieChartProps {
  categoryBreakdown: CategoryBreakdownItem[];
  customItems: CustomItemData[];
  totalBudgetINR: number;
  rawTotalINR: number;
  wastageAmountINR?: number;
  contractorProfitINR?: number;
  gstAmountINR?: number;
  wastageMarginPct?: number;
}

const CATEGORY_COLORS: { [key: string]: string } = {
  'Cement & Concrete': '#0d9488', // Teal
  'Steel & Structure': '#3b82f6', // Blue
  'Masonry & Bricks': '#f59e0b', // Amber
  'Sand & Aggregate': '#8b5cf6', // Purple
  'Plumbing & Water': '#06b6d4', // Cyan
  'Electrical & ELV': '#eab308', // Yellow
  'Finishes & Tiles': '#ec4899', // Pink
  'Paints & Coatings': '#10b981', // Emerald
  'Labor & Services': '#6366f1', // Indigo
  'Other Materials': '#64748b', // Slate
};

const DEFAULT_COLOR_PALETTE = [
  '#0d9488', '#3b82f6', '#f59e0b', '#8b5cf6', 
  '#06b6d4', '#eab308', '#ec4899', '#10b981', 
  '#6366f1', '#f97316', '#14b8a6', '#64748b'
];

export const MaterialBudgetPieChart: React.FC<MaterialBudgetPieChartProps> = ({
  categoryBreakdown,
  customItems,
  totalBudgetINR,
  rawTotalINR,
  wastageAmountINR = 0,
  contractorProfitINR = 0,
  gstAmountINR = 0,
  wastageMarginPct = 5
}) => {
  const [viewMode, setViewMode] = useState<'category' | 'component' | 'top_items'>('category');
  const [hoveredSlice, setHoveredSlice] = useState<{
    label: string;
    value: number;
    percentage: number;
    itemsCount?: number;
    color: string;
  } | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Prepare data based on selected view mode
  const chartData = useMemo(() => {
    if (viewMode === 'category') {
      return categoryBreakdown.map((item, idx) => ({
        label: item.category,
        value: item.amount,
        percentage: item.percentage,
        itemsCount: item.itemsCount,
        color: CATEGORY_COLORS[item.category] || DEFAULT_COLOR_PALETTE[idx % DEFAULT_COLOR_PALETTE.length]
      }));
    }

    if (viewMode === 'component') {
      const total = totalBudgetINR || 1;
      const data = [
        {
          label: 'Raw Materials Base Cost',
          value: rawTotalINR,
          percentage: Math.round((rawTotalINR / total) * 100),
          itemsCount: customItems.length,
          color: '#0d9488'
        },
        {
          label: `Site Wastage Buffer (${wastageMarginPct}%)`,
          value: wastageAmountINR,
          percentage: Math.round((wastageAmountINR / total) * 100),
          itemsCount: 0,
          color: '#f59e0b'
        },
        {
          label: 'Contractor Profit & Supervision (10%)',
          value: contractorProfitINR,
          percentage: Math.round((contractorProfitINR / total) * 100),
          itemsCount: 0,
          color: '#3b82f6'
        },
        {
          label: 'GST & Statutory Taxes (18%)',
          value: gstAmountINR,
          percentage: Math.round((gstAmountINR / total) * 100),
          itemsCount: 0,
          color: '#8b5cf6'
        }
      ].filter(d => d.value > 0);

      return data;
    }

    // Top Items Mode
    const sortedItems = [...customItems].sort((a, b) => b.totalCostINR - a.totalCostINR);
    const top5 = sortedItems.slice(0, 5);
    const otherCost = sortedItems.slice(5).reduce((acc, curr) => acc + curr.totalCostINR, 0);

    const result = top5.map((item, idx) => ({
      label: item.title,
      value: item.totalCostINR,
      percentage: totalBudgetINR > 0 ? Math.round((item.totalCostINR / totalBudgetINR) * 100) : 0,
      itemsCount: 1,
      color: DEFAULT_COLOR_PALETTE[idx % DEFAULT_COLOR_PALETTE.length]
    }));

    if (otherCost > 0) {
      result.push({
        label: `Other ${sortedItems.length - 5} Materials`,
        value: otherCost,
        percentage: totalBudgetINR > 0 ? Math.round((otherCost / totalBudgetINR) * 100) : 0,
        itemsCount: sortedItems.length - 5,
        color: '#64748b'
      });
    }

    return result;
  }, [viewMode, categoryBreakdown, customItems, totalBudgetINR, rawTotalINR, wastageAmountINR, contractorProfitINR, gstAmountINR, wastageMarginPct]);

  // Render Interactive D3 Pie Chart
  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const size = 280;
    const margin = 10;
    const radius = size / 2 - margin;
    const innerRadius = radius * 0.62; // Donut chart inner hole

    svg
      .attr('width', size)
      .attr('height', size)
      .attr('viewBox', `0 0 ${size} ${size}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${size / 2}, ${size / 2})`);

    const pie = d3
      .pie<any>()
      .value(d => d.value)
      .sort(null)
      .padAngle(0.025);

    const arc = d3
      .arc<any>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(6);

    const hoverArc = d3
      .arc<any>()
      .innerRadius(innerRadius - 4)
      .outerRadius(radius + 8)
      .cornerRadius(8);

    const arcs = g
      .selectAll('.arc')
      .data(pie(chartData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs
      .append('path')
      .attr('d', arc as any)
      .attr('fill', d => d.data.color)
      .attr('stroke', 'rgba(15, 23, 42, 0.8)')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('transition', 'all 0.2s ease')
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('d', hoverArc as any)
          .attr('filter', 'drop-shadow(0px 4px 12px rgba(20, 184, 166, 0.4))');

        setHoveredSlice(d.data);
      })
      .on('mouseleave', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('d', arc as any)
          .attr('filter', 'none');

        setHoveredSlice(null);
      })
      .on('click', function (event, d) {
        if (viewMode === 'category') {
          setSelectedCategory(prev => prev === d.data.label ? null : d.data.label);
        }
      });

    // Center Display Text
    const centerGroup = g.append('g').attr('text-anchor', 'middle');

    centerGroup
      .append('text')
      .attr('dy', '-0.5em')
      .style('fill', '#94a3b8')
      .style('font-size', '10px')
      .style('font-weight', '700')
      .style('letter-spacing', '0.05em')
      .text('TOTAL BUDGET');

    const lakhsVal = (totalBudgetINR / 100000).toFixed(2);
    centerGroup
      .append('text')
      .attr('dy', '0.8em')
      .style('fill', '#ffffff')
      .style('font-size', '18px')
      .style('font-weight', '900')
      .text(`₹ ${lakhsVal} L`);

  }, [chartData, totalBudgetINR, viewMode]);

  // Selected Category Items drilldown
  const categoryItems = useMemo(() => {
    if (!selectedCategory) return [];
    return customItems.filter(i => i.category === selectedCategory);
  }, [selectedCategory, customItems]);

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-extrabold text-[10px] border border-teal-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Visual Cost Allocation
            </span>
            <span className="text-xs text-slate-400">Itemized Material Cost Share</span>
          </div>
          <h3 className="text-lg font-black text-white flex items-center gap-2 mt-1">
            <PieIcon className="w-5 h-5 text-teal-400" />
            Project Budget Cost Percentage Breakdown
          </h3>
        </div>

        {/* View Switcher Pills */}
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs self-start sm:self-auto">
          <button
            onClick={() => { setViewMode('category'); setSelectedCategory(null); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
              viewMode === 'category' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>By Category</span>
          </button>
          <button
            onClick={() => { setViewMode('component'); setSelectedCategory(null); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
              viewMode === 'component' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>By Cost Component</span>
          </button>
          <button
            onClick={() => { setViewMode('top_items'); setSelectedCategory(null); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
              viewMode === 'top_items' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Top Materials</span>
          </button>
        </div>
      </div>

      {/* Main Chart Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: Interactive D3 Donut Chart */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-2xl border border-slate-800 relative min-h-[300px]">
          
          <svg ref={svgRef} className="overflow-visible drop-shadow-xl"></svg>

          {/* Interactive Hover Card Overlay */}
          {hoveredSlice ? (
            <div className="mt-4 w-full bg-slate-800/95 border border-teal-500/50 p-3 rounded-xl text-center space-y-1 animate-in fade-in zoom-in duration-150">
              <span className="text-xs font-bold text-teal-300 block">{hoveredSlice.label}</span>
              <div className="text-lg font-black text-white">
                ₹{hoveredSlice.value.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-bold text-teal-400">({hoveredSlice.percentage}% of Budget)</span>
              </div>
              {hoveredSlice.itemsCount !== undefined && hoveredSlice.itemsCount > 0 && (
                <span className="text-[10px] text-slate-400 block">
                  Includes {hoveredSlice.itemsCount} material &amp; labor items
                </span>
              )}
            </div>
          ) : (
            <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-teal-400" />
              <span>Hover over pie slices or click category legend to inspect details</span>
            </div>
          )}
        </div>

        {/* Right Column: Legend & Category Percentage Progress List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold border-b border-slate-800 pb-2">
            <span>Material Vertical / Component</span>
            <span>Cost (INR) &amp; Share (%)</span>
          </div>

          <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
            {chartData.map((item) => {
              const isCategorySelected = selectedCategory === item.label;

              return (
                <div
                  key={item.label}
                  onClick={() => viewMode === 'category' && setSelectedCategory(prev => prev === item.label ? null : item.label)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex flex-col gap-2 ${
                    isCategorySelected
                      ? 'bg-slate-800 border-teal-500 ring-1 ring-teal-500/40 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span 
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" 
                        style={{ backgroundColor: item.color }} 
                      />
                      <span className="text-xs font-bold text-white block truncate">{item.label}</span>
                      {item.itemsCount !== undefined && item.itemsCount > 0 && (
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                          {item.itemsCount} items
                        </span>
                      )}
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <span className="text-xs font-black text-white">
                        ₹{item.value.toLocaleString('en-IN')}
                      </span>
                      <span 
                        className="px-2 py-0.5 rounded-md font-extrabold text-[11px] text-white"
                        style={{ backgroundColor: item.color + 'dd' }}
                      >
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar Visual Representation */}
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.max(item.percentage, 3)}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Selected Category Material Itemization Drilldown */}
      {selectedCategory && categoryItems.length > 0 && (
        <div className="p-4 bg-slate-950 rounded-2xl border border-teal-500/40 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-teal-300 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-teal-400" />
              Itemized Material Breakdown for "{selectedCategory}" ({categoryItems.length} items)
            </h4>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-[10px] text-slate-400 hover:text-white underline font-semibold"
            >
              Clear Filter
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {categoryItems.map(item => (
              <div key={item.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span className="truncate">{item.title}</span>
                  <span className="text-teal-400">₹{item.totalCostINR.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Qty: {item.quantity} {item.unit} @ ₹{item.unitRateINR}</span>
                  <span className="text-amber-400 font-semibold">{item.brandName || 'Empanelled'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Summary Bar */}
      <div className="p-3 bg-teal-950/40 border border-teal-800/60 rounded-xl text-xs text-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            <strong>Pro Tip:</strong> Raw materials constitute approx. 70-75% of overall civil expenditure. Use this pie chart to audit high-value material drivers.
          </span>
        </div>
        <span className="text-[10px] font-mono text-teal-300 font-bold shrink-0">
          Sync Rate: 100% Itemized
        </span>
      </div>

    </div>
  );
};
