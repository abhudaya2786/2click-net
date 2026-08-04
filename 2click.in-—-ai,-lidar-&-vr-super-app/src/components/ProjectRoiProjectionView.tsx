import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  Calculator,
  Percent,
  Sparkles,
  Zap,
  Building2,
  Sun,
  Home,
  ShieldCheck,
  Award,
  ArrowUpRight,
  Info,
  RefreshCw,
  Download,
  CheckCircle2,
  Layers,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
  BarChart
} from 'recharts';
import { User } from '../types';
import { logAnalyticsEvent } from '../lib/firebase';

interface ProjectRoiProjectionViewProps {
  currentUser?: User | null;
}

export interface RoiModulePreset {
  id: string;
  name: string;
  category: 'Solar Power' | 'Commercial Real Estate' | 'Residential & Interior' | 'Water & Infrastructure';
  icon: string;
  initialInvestmentLakhs: number;
  govtSubsidyLakhs: number;
  annualSavingsOrIncomeLakhs: number;
  annualEscalationPercent: number;
  maintenanceCostAnnualLakhs: number;
  lifespanYears: number;
  description: string;
}

const ROI_MODULE_PRESETS: RoiModulePreset[] = [
  {
    id: 'solar_10kw',
    name: '10kW PM Surya Ghar Rooftop Solar Plant',
    category: 'Solar Power',
    icon: 'Sun',
    initialInvestmentLakhs: 5.5,
    govtSubsidyLakhs: 0.78,
    annualSavingsOrIncomeLakhs: 1.35,
    annualEscalationPercent: 5.0, // Electricity tariff inflation
    maintenanceCostAnnualLakhs: 0.12,
    lifespanYears: 15,
    description: '10kW On-Grid Bifacial Solar System saving ~14,000 electricity units annually with UPNEDA Net-Metering subsidy.'
  },
  {
    id: 'commercial_floor',
    name: '30x50 RCC Commercial Plaza Additional Floor',
    category: 'Commercial Real Estate',
    icon: 'Building2',
    initialInvestmentLakhs: 22.0,
    govtSubsidyLakhs: 0.0,
    annualSavingsOrIncomeLakhs: 3.6, // Rental Yield ~16%
    annualEscalationPercent: 8.0, // Commercial Rent escalation
    maintenanceCostAnnualLakhs: 0.35,
    lifespanYears: 15,
    description: 'Third floor expansion yielding ₹30,000/month commercial shop rental in tier-2 city market hub.'
  },
  {
    id: 'interior_refit',
    name: 'Luxury Villa Modular Interior & Smart Automation',
    category: 'Residential & Interior',
    icon: 'Home',
    initialInvestmentLakhs: 12.0,
    govtSubsidyLakhs: 0.0,
    annualSavingsOrIncomeLakhs: 1.8, // Property valuation boost + Airbnb income
    annualEscalationPercent: 6.0,
    maintenanceCostAnnualLakhs: 0.2,
    lifespanYears: 10,
    description: 'Vastu-compliant Italian marble, Blum hardware & Schneider smart home automation increasing property resale value.'
  },
  {
    id: 'etp_water_recycle',
    name: '20 KLD ETP Wastewater Recycling Plant',
    category: 'Water & Infrastructure',
    icon: 'Layers',
    initialInvestmentLakhs: 8.5,
    govtSubsidyLakhs: 1.2,
    annualSavingsOrIncomeLakhs: 2.1, // Tanker water purchase savings
    annualEscalationPercent: 7.0,
    maintenanceCostAnnualLakhs: 0.25,
    lifespanYears: 12,
    description: 'Zero Liquid Discharge (ZLD) plant eliminating water tanker expenses for commercial laundry/site operations.'
  }
];

export const ProjectRoiProjectionView: React.FC<ProjectRoiProjectionViewProps> = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('solar_10kw');
  
  const activePreset = ROI_MODULE_PRESETS.find(p => p.id === selectedPresetId) || ROI_MODULE_PRESETS[0];

  // Customizable Sliders
  const [investment, setInvestment] = useState<number>(activePreset.initialInvestmentLakhs);
  const [subsidy, setSubsidy] = useState<number>(activePreset.govtSubsidyLakhs);
  const [annualIncome, setAnnualIncome] = useState<number>(activePreset.annualSavingsOrIncomeLakhs);
  const [escalationRate, setEscalationRate] = useState<number>(activePreset.annualEscalationPercent);
  const [maintCost, setMaintCost] = useState<number>(activePreset.maintenanceCostAnnualLakhs);
  const [projectionYears, setProjectionYears] = useState<number>(10);

  // Synchronize when switching preset module
  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = ROI_MODULE_PRESETS.find(item => item.id === presetId);
    if (p) {
      setInvestment(p.initialInvestmentLakhs);
      setSubsidy(p.govtSubsidyLakhs);
      setAnnualIncome(p.annualSavingsOrIncomeLakhs);
      setEscalationRate(p.annualEscalationPercent);
      setMaintCost(p.maintenanceCostAnnualLakhs);

      logAnalyticsEvent('roi_preset_selected', {
        preset_id: p.id,
        preset_name: p.name,
        category: p.category,
        initial_investment_lakhs: p.initialInvestmentLakhs,
        annual_savings_lakhs: p.annualSavingsOrIncomeLakhs
      });
    }
  };

  // Log initial module load
  useEffect(() => {
    logAnalyticsEvent('roi_projection_viewed', {
      active_preset: activePreset.name,
      category: activePreset.category
    });
  }, []);

  // Log milestone calculations when payback or investment values update
  useEffect(() => {
    const netCap = Math.max(0, investment - subsidy);
    logAnalyticsEvent('roi_milestone_simulated', {
      preset_id: selectedPresetId,
      total_investment_lakhs: investment,
      subsidy_lakhs: subsidy,
      net_outlay_lakhs: netCap,
      annual_benefit_lakhs: annualIncome,
      projection_years: projectionYears
    });
  }, [investment, subsidy, annualIncome, escalationRate, maintCost, projectionYears]);

  const handleExportReport = () => {
    const netCap = Math.max(0, investment - subsidy);
    logAnalyticsEvent('roi_report_exported', {
      preset_id: selectedPresetId,
      preset_name: activePreset.name,
      category: activePreset.category,
      net_investment_lakhs: netCap,
      roi_percentage: roiPercentage,
      payback_years: paybackYearFound || `>${projectionYears}`
    });
    alert(`Generating PDF ROI Financial Proposal for ${activePreset.name}...`);
  };

  // Calculate Net Initial Outlay
  const netInvestment = Math.max(0, investment - subsidy);

  // Generate Year-by-Year Financial Projections for Recharts
  const projectionData = [];
  let cumulativeCashFlow = -netInvestment;
  let paybackYearFound: number | null = null;

  for (let year = 0; year <= projectionYears; year++) {
    if (year === 0) {
      projectionData.push({
        year: 'Year 0',
        yearNum: 0,
        annualSavings: 0,
        maintCost: 0,
        netAnnualCashFlow: -netInvestment,
        cumulativeCashFlow: -netInvestment,
        capitalInvested: netInvestment,
      });
    } else {
      // Annual compounding escalation
      const escalatedIncome = annualIncome * Math.pow(1 + escalationRate / 100, year - 1);
      const escalatedMaint = maintCost * Math.pow(1 + 0.04, year - 1); // 4% inflation on maintenance
      const netAnnual = escalatedIncome - escalatedMaint;

      cumulativeCashFlow += netAnnual;

      if (cumulativeCashFlow >= 0 && paybackYearFound === null) {
        // Linear interpolation for exact fraction of payback year
        const prevCumulative = cumulativeCashFlow - netAnnual;
        const fraction = Math.abs(prevCumulative) / netAnnual;
        paybackYearFound = Number((year - 1 + fraction).toFixed(1));
      }

      projectionData.push({
        year: `Yr ${year}`,
        yearNum: year,
        annualSavings: Number(escalatedIncome.toFixed(2)),
        maintCost: Number(escalatedMaint.toFixed(2)),
        netAnnualCashFlow: Number(netAnnual.toFixed(2)),
        cumulativeCashFlow: Number(cumulativeCashFlow.toFixed(2)),
        capitalInvested: netInvestment
      });
    }
  }

  // Summary Metrics
  const totalInflow = projectionData.slice(1).reduce((acc, curr) => acc + curr.annualSavings, 0);
  const totalNetGains = cumulativeCashFlow;
  const roiPercentage = netInvestment > 0 ? ((totalNetGains / netInvestment) * 100).toFixed(1) : '0';

  // Comparative Module Chart Data
  const moduleComparisonData = ROI_MODULE_PRESETS.map(preset => {
    const netCap = Math.max(0, preset.initialInvestmentLakhs - preset.govtSubsidyLakhs);
    let cum = -netCap;
    let pbYear = 0;
    for (let y = 1; y <= 10; y++) {
      const inc = preset.annualSavingsOrIncomeLakhs * Math.pow(1 + preset.annualEscalationPercent / 100, y - 1);
      cum += (inc - preset.maintenanceCostAnnualLakhs);
      if (cum >= 0 && pbYear === 0) {
        pbYear = y;
      }
    }
    const tenYrROI = netCap > 0 ? ((cum / netCap) * 100).toFixed(0) : 0;
    return {
      name: preset.name.split(' ')[0] + ' ' + preset.name.split(' ')[1],
      fullName: preset.name,
      netInvestment: netCap,
      tenYrNetGains: Number(cum.toFixed(2)),
      roiPercent: Number(tenYrROI),
      paybackYears: pbYear || '>10'
    };
  });

  return (
    <div className="space-y-8 animate-fade-in">

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Financial Intelligence &amp; Capital Yield
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black rounded-xl">
                10-Year Projections
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Construction Project ROI Projection &amp; Payback Chart
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Interactive Return-on-Investment forecasting for solar rooftop, commercial plaza additions, interior fitouts, and infrastructure upgrades using Recharts cumulative cash-flow analytics.
            </p>
          </div>

          <button
            onClick={handleExportReport}
            className="px-5 py-3.5 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition hover:scale-102 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" /> Export ROI Report (PDF)
          </button>
        </div>
      </div>

      {/* PRESET MODULE SELECTION CARDS */}
      <div className="space-y-3">
        <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" /> Choose Construction / Solar Module Preset
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROI_MODULE_PRESETS.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(preset.id)}
                className={`p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-teal-500 shadow-xl ring-2 ring-teal-500/30'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`p-2.5 rounded-xl border ${
                    isSelected
                      ? 'bg-teal-500/20 text-teal-300 border-teal-400/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}>
                    {preset.id === 'solar_10kw' && <Sun className="w-5 h-5" />}
                    {preset.id === 'commercial_floor' && <Building2 className="w-5 h-5" />}
                    {preset.id === 'interior_refit' && <Home className="w-5 h-5" />}
                    {preset.id === 'etp_water_recycle' && <Layers className="w-5 h-5" />}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/20 dark:bg-slate-800 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                    {preset.category}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-xs line-clamp-1">{preset.name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {preset.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-mono font-bold">
                  <span>Investment: ₹{preset.initialInvestmentLakhs}L</span>
                  <span className="text-emerald-500">Savings: ₹{preset.annualSavingsOrIncomeLakhs}L/yr</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN INTERACTIVE PANEL: SLIDERS & RECHARTS PROJECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: INTERACTIVE FINANCIAL INPUT PARAMETERS */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-6 lg:col-span-1">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-teal-600" />
              Adjust ROI Variables
            </h3>
            <button
              onClick={() => handlePresetChange(selectedPresetId)}
              className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-extrabold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* Capital Investment */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-slate-700 dark:text-slate-300">Total Capital Cost:</span>
                <span className="font-mono text-slate-900 dark:text-white">₹{investment.toFixed(2)} Lakhs</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="0.5"
                value={investment}
                onChange={(e) => setInvestment(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            {/* Govt Subsidy / Tax Shield */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-slate-700 dark:text-slate-300">Govt Subsidy / Tax Shield:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">₹{subsidy.toFixed(2)} Lakhs</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={subsidy}
                onChange={(e) => setSubsidy(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Net Upfront Investment */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex justify-between items-center font-bold">
              <span className="text-slate-600 dark:text-slate-400">Net Upfront Outlay:</span>
              <span className="font-mono text-base font-black text-teal-600 dark:text-teal-400">
                ₹{netInvestment.toFixed(2)} Lakhs
              </span>
            </div>

            {/* Annual Savings / Income */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between font-bold">
                <span className="text-slate-700 dark:text-slate-300">Annual Benefit / Rental Income:</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">₹{annualIncome.toFixed(2)} Lakhs/yr</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="10"
                step="0.1"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(parseFloat(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Annual Escalation Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-slate-700 dark:text-slate-300">Annual Inflation / Escalation:</span>
                <span className="font-mono text-sky-600 dark:text-sky-400">{escalationRate}% p.a.</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={escalationRate}
                onChange={(e) => setEscalationRate(parseFloat(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Maintenance & Ops Cost */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-slate-700 dark:text-slate-300">Annual Ops &amp; Maintenance:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400">₹{maintCost.toFixed(2)} Lakhs/yr</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={maintCost}
                onChange={(e) => setMaintCost(parseFloat(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>

            {/* Projection Horizon */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-slate-700 dark:text-slate-300">Projection Horizon:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{projectionYears} Years</span>
              </div>
              <input
                type="range"
                min="5"
                max="20"
                step="1"
                value={projectionYears}
                onChange={(e) => setProjectionYears(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

          </div>

          {/* QUICK SUMMARY KPI CARDS */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase block">Calculated Payback Period</span>
                <span className="text-lg font-black text-teal-950 dark:text-white font-mono">
                  {paybackYearFound ? `${paybackYearFound} Years` : `> ${projectionYears} Years`}
                </span>
              </div>
              <span className="p-2 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-300">
                <ShieldCheck className="w-5 h-5" />
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 uppercase block">Total {projectionYears}-Year Net Gains</span>
                <span className="text-lg font-black text-indigo-950 dark:text-white font-mono">
                  ₹{totalNetGains.toFixed(2)} Lakhs ({roiPercentage}%)
                </span>
              </div>
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">
                <TrendingUp className="w-5 h-5" />
              </span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: RECHARTS COMPOSED CHART (CUMULATIVE CASH FLOW & ANNUAL SAVINGS) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-6 lg:col-span-2 flex flex-col justify-between">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                Cumulative Cash-Flow &amp; Payback Projection Chart
              </h2>
              <p className="text-xs text-slate-500">
                Bar indicates annual net savings; Area curve tracks cumulative return over {projectionYears} years.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-teal-500 inline-block"></span>
                Cumulative Profit
              </span>
              <span className="flex items-center gap-1.5 ml-2">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
                Annual Savings
              </span>
            </div>
          </div>

          {/* Recharts ComposedChart */}
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={projectionData}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis
                  unit="L"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  label={{ value: '₹ Lakhs', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [`₹ ${Number(value).toFixed(2)} Lakhs`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                {/* Breakeven Line at ₹ 0 */}
                <ReferenceLine y={0} stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="3 3" label={{ value: 'Breakeven (₹ 0)', fill: '#f43f5e', fontSize: 10, position: 'right' }} />

                {/* Annual Savings Bar */}
                <Bar dataKey="annualSavings" name="Annual Benefit / Income" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={16} />

                {/* Cumulative Cash Flow Area */}
                <Area
                  type="monotone"
                  dataKey="cumulativeCashFlow"
                  name="Cumulative Net Position"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCumulative)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* CHART INSIGHT FOOTER */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                <strong>Payback Milestone:</strong> Initial outlay of ₹{netInvestment.toFixed(2)}L will be fully recovered in <strong>{paybackYearFound ? `${paybackYearFound} years` : `more than ${projectionYears} years`}</strong>.
              </span>
            </div>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0 text-right">
              10-Yr ROI: {roiPercentage}%
            </span>
          </div>

        </div>

      </div>

      {/* SECTION 3: COMPARATIVE ROI BAR CHART ACROSS CONSTRUCTION MODULES */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-indigo-600" />
              Comparative Module ROI Benchmark (10-Year Capital Gain)
            </h2>
            <p className="text-xs text-slate-500">
              Side-by-side comparison of net investment versus projected 10-year financial returns.
            </p>
          </div>
        </div>

        {/* Recharts BarChart Comparison */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={moduleComparisonData}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis unit="L" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                formatter={(value: any, name: any) => [`₹ ${Number(value).toFixed(2)} Lakhs`, name]}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="netInvestment" name="Net Investment Required" fill="#64748b" radius={[6, 6, 0, 0]} barSize={28} />
              <Bar dataKey="tenYrNetGains" name="Projected 10-Yr Net Profit" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
};
