import React, { useState } from 'react';
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart3,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building2,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw,
  ShieldAlert,
  FileText,
  DollarSign,
  Briefcase
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { User } from '../types';

interface FinancialAnalyticsViewProps {
  currentUser?: User | null;
  selectedCity?: string;
}

// 1. Monthly Expense Breakdown Data (Amounts in ₹ Lakhs)
const MONTHLY_EXPENSE_DATA = [
  { month: 'Oct 2025', civilMaterials: 18.2, laborCost: 8.5, equipmentLogistics: 3.8, solarEquipment: 4.2, interiorFitout: 12.0, totalExpense: 46.7, targetBudget: 50.0 },
  { month: 'Nov 2025', civilMaterials: 21.0, laborCost: 9.8, equipmentLogistics: 4.2, solarEquipment: 5.5, interiorFitout: 14.5, totalExpense: 55.0, targetBudget: 55.0 },
  { month: 'Dec 2025', civilMaterials: 24.5, laborCost: 11.2, equipmentLogistics: 5.0, solarEquipment: 7.0, interiorFitout: 18.0, totalExpense: 65.7, targetBudget: 65.0 },
  { month: 'Jan 2026', civilMaterials: 22.8, laborCost: 10.5, equipmentLogistics: 4.8, solarEquipment: 6.8, interiorFitout: 16.5, totalExpense: 61.4, targetBudget: 62.0 },
  { month: 'Feb 2026', civilMaterials: 28.0, laborCost: 12.8, equipmentLogistics: 5.8, solarEquipment: 8.5, interiorFitout: 22.0, totalExpense: 77.1, targetBudget: 75.0 },
  { month: 'Mar 2026', civilMaterials: 32.5, laborCost: 14.0, equipmentLogistics: 6.5, solarEquipment: 10.2, interiorFitout: 25.5, totalExpense: 88.7, targetBudget: 85.0 },
  { month: 'Apr 2026', civilMaterials: 29.0, laborCost: 13.2, equipmentLogistics: 5.8, solarEquipment: 9.8, interiorFitout: 23.0, totalExpense: 80.8, targetBudget: 82.0 },
  { month: 'May 2026', civilMaterials: 35.2, laborCost: 15.5, equipmentLogistics: 7.0, solarEquipment: 12.0, interiorFitout: 28.5, totalExpense: 98.2, targetBudget: 95.0 },
  { month: 'Jun 2026', civilMaterials: 32.8, laborCost: 14.8, equipmentLogistics: 6.2, solarEquipment: 11.5, interiorFitout: 26.0, totalExpense: 91.3, targetBudget: 90.0 },
  { month: 'Jul 2026', civilMaterials: 38.5, laborCost: 16.8, equipmentLogistics: 7.5, solarEquipment: 14.0, interiorFitout: 31.0, totalExpense: 107.8, targetBudget: 100.0 },
];

// 2. Project Budgets Data (Amounts in ₹ Lakhs)
const PROJECT_BUDGET_DATA = [
  { projectName: 'Gorakhpur Commercial Complex', allocatedBudget: 280.0, actualSpent: 242.5, committedCost: 25.0, variance: +12.5, status: 'On Track' },
  { projectName: 'Lucknow Metro Solar Rooftop 500kW', allocatedBudget: 145.0, actualSpent: 138.0, committedCost: 5.0, variance: +2.0, status: 'On Track' },
  { projectName: 'Varanasi Luxury Villa Fitout', allocatedBudget: 95.0, actualSpent: 92.8, committedCost: 4.2, variance: -2.0, status: 'Near Limit' },
  { projectName: 'Kanpur Industrial Warehouse ETP', allocatedBudget: 180.0, actualSpent: 165.0, committedCost: 12.0, variance: +3.0, status: 'On Track' },
  { projectName: 'Prayagraj Highway Smart Lighting', allocatedBudget: 110.0, actualSpent: 116.5, committedCost: 8.0, variance: -14.5, status: 'Over Budget' },
  { projectName: 'Ayodhya Hotel Heritage Interior', allocatedBudget: 210.0, actualSpent: 185.2, committedCost: 18.0, variance: +6.8, status: 'On Track' },
];

// 3. Vendor Payment Status Breakdown Data
const VENDOR_PAYMENT_STATUS_DATA = [
  { status: 'Paid in Full', count: 42, valueLakhs: 342.5, color: '#10b981' },
  { status: 'Pending Approval', count: 12, valueLakhs: 68.2, color: '#3b82f6' },
  { status: 'Due within 15 Days', count: 8, valueLakhs: 45.8, color: '#f59e0b' },
  { status: 'Overdue / Delayed', count: 3, valueLakhs: 18.4, color: '#ef4444' },
  { status: 'Under GST Audit', count: 5, valueLakhs: 22.0, color: '#8b5cf6' },
];

// 4. Detailed Vendor Payment Ledger Sample
const VENDOR_PAYMENT_LEDGER = [
  { id: 'INV-2026-881', vendorName: 'Tata Tiscon Steel Distributors', category: 'Materials', project: 'Gorakhpur Commercial Complex', amountINR: 1850000, invoiceDate: '2026-07-20', dueDate: '2026-08-05', status: 'Paid in Full', paymentMode: 'NEFT / RTGS' },
  { id: 'INV-2026-882', vendorName: 'Kajaria World Tiles & Marble', category: 'Interiors', project: 'Ayodhya Hotel Heritage Interior', amountINR: 1240000, invoiceDate: '2026-07-22', dueDate: '2026-08-10', status: 'Pending Approval', paymentMode: 'Letter of Credit' },
  { id: 'INV-2026-883', vendorName: 'Waaree Solar Modules Pvt Ltd', category: 'Solar', project: 'Lucknow Metro Solar Rooftop 500kW', amountINR: 2450000, invoiceDate: '2026-07-25', dueDate: '2026-08-15', status: 'Due within 15 Days', paymentMode: '2click Escrow' },
  { id: 'INV-2026-884', vendorName: 'UltraTech Cement Bulk Depot', category: 'Materials', project: 'Kanpur Industrial Warehouse ETP', amountINR: 980000, invoiceDate: '2026-06-30', dueDate: '2026-07-15', status: 'Overdue / Delayed', paymentMode: 'Bank Guarantee' },
  { id: 'INV-2026-885', vendorName: 'Blum Austrian Hardware India', category: 'Interiors', project: 'Varanasi Luxury Villa Fitout', amountINR: 650000, invoiceDate: '2026-07-18', dueDate: '2026-08-08', status: 'Paid in Full', paymentMode: 'UPI AutoPay' },
  { id: 'INV-2026-886', vendorName: 'Havells Heavy Electricals', category: 'Electrical', project: 'Prayagraj Highway Smart Lighting', amountINR: 1420000, invoiceDate: '2026-07-28', dueDate: '2026-08-20', status: 'Under GST Audit', paymentMode: 'Direct Deposit' },
];

const CustomTooltipExpense = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-xl text-xs text-slate-100 backdrop-blur-md">
        <p className="font-bold border-b border-slate-700 pb-1mb-2 text-teal-400">{label}</p>
        <div className="space-y-1 mt-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={`exp-${index}`} className="flex justify-between items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white">₹{Number(entry.value).toFixed(1)} L</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const CustomTooltipPie = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-xl text-xs text-slate-100 backdrop-blur-md">
        <p className="font-bold border-b border-slate-700 pb-1 mb-1" style={{ color: data.payload.color }}>
          {data.name}
        </p>
        <div className="space-y-1 font-medium">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Invoices:</span>
            <span className="font-bold text-white">{data.payload.count} Vendors</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Total Volume:</span>
            <span className="font-mono font-bold text-teal-300">₹{data.payload.valueLakhs.toFixed(1)} Lakhs</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const FinancialAnalyticsView: React.FC<FinancialAnalyticsViewProps> = ({
  currentUser,
  selectedCity = 'Gorakhpur'
}) => {
  const [timeRange, setTimeRange] = useState<'6m' | '1y'>('6m');
  const [expenseChartType, setExpenseChartType] = useState<'stacked' | 'bar' | 'composed'>('stacked');
  const [vendorFilter, setVendorFilter] = useState<string>('All');
  const [searchLedger, setSearchLedger] = useState<string>('');

  const displayExpenseData = timeRange === '6m' ? MONTHLY_EXPENSE_DATA.slice(-6) : MONTHLY_EXPENSE_DATA;

  // Calculate Aggregates
  const totalExpensesYTD = displayExpenseData.reduce((acc, curr) => acc + curr.totalExpense, 0);
  const totalBudgetYTD = displayExpenseData.reduce((acc, curr) => acc + curr.targetBudget, 0);
  const totalAllocatedProjects = PROJECT_BUDGET_DATA.reduce((acc, curr) => acc + curr.allocatedBudget, 0);
  const totalSpentProjects = PROJECT_BUDGET_DATA.reduce((acc, curr) => acc + curr.actualSpent, 0);
  const totalVendorPending = VENDOR_PAYMENT_STATUS_DATA.find(s => s.status === 'Pending Approval')?.valueLakhs || 0;
  const totalVendorDue15 = VENDOR_PAYMENT_STATUS_DATA.find(s => s.status === 'Due within 15 Days')?.valueLakhs || 0;
  const totalVendorOverdue = VENDOR_PAYMENT_STATUS_DATA.find(s => s.status === 'Overdue / Delayed')?.valueLakhs || 0;

  const filteredLedger = VENDOR_PAYMENT_LEDGER.filter(item => {
    const matchesFilter = vendorFilter === 'All' || item.status === vendorFilter;
    const matchesSearch = item.vendorName.toLowerCase().includes(searchLedger.toLowerCase()) ||
                          item.project.toLowerCase().includes(searchLedger.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchLedger.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* HEADER & CONTROLS BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" /> 2click Enterprise Finance
              </span>
              <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-xl text-[10px] font-extrabold uppercase">
                Location: {selectedCity}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Financial Analytics &amp; Ledger Hub
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time cash flow monitoring, monthly expense breakdowns across engineering verticals, project budget utilization, and vendor payment audit ledgers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setTimeRange('6m')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                timeRange === '6m'
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Last 6 Months
            </button>

            <button
              onClick={() => setTimeRange('1y')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                timeRange === '1y'
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              FY 2025–26 (Full Year)
            </button>

            <button
              onClick={() => alert('Downloading Financial Analytics Statement (PDF / Excel)...')}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition hover:scale-102 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>
      </div>

      {/* TOP SUMMARY METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-extrabold uppercase tracking-wider">Total Expenses ({timeRange})</span>
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{(totalExpensesYTD / 100).toFixed(2)} Cr
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>3.2% under allocated budget (₹{(totalBudgetYTD / 100).toFixed(2)} Cr)</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-extrabold uppercase tracking-wider">Project Budgets</span>
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{(totalSpentProjects / 100).toFixed(2)} Cr <span className="text-xs font-normal text-slate-400">/ ₹{(totalAllocatedProjects / 100).toFixed(2)} Cr</span>
            </div>
            <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{((totalSpentProjects / totalAllocatedProjects) * 100).toFixed(1)}% Total Budget Utilized</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-extrabold uppercase tracking-wider">Pending Vendor Invoices</span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              ₹{(totalVendorPending + totalVendorDue15).toFixed(1)} Lakhs
            </div>
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-1">
              <span>20 Vendor Invoices Awaiting Audit / Due Soon</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-extrabold uppercase tracking-wider">Overdue &amp; Audit Risk</span>
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              ₹{totalVendorOverdue.toFixed(1)} Lakhs
            </div>
            <div className="text-xs font-semibold text-rose-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>3 Critical Invoices Require Immediate Release</span>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 1: MONTHLY EXPENSE BREAKDOWN CHART */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Monthly Expense Breakdown (महीनेवार खर्च का विवरण)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Civil materials, labor wages, equipment logistics, solar kits &amp; interior fittings in ₹ Lakhs.
            </p>
          </div>

          {/* Chart Style Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setExpenseChartType('stacked')}
              className={`px-3 py-1.5 rounded-xl transition ${
                expenseChartType === 'stacked'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Stacked Area
            </button>
            <button
              onClick={() => setExpenseChartType('bar')}
              className={`px-3 py-1.5 rounded-xl transition ${
                expenseChartType === 'bar'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Category Bars
            </button>
            <button
              onClick={() => setExpenseChartType('composed')}
              className={`px-3 py-1.5 rounded-xl transition ${
                expenseChartType === 'composed'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Total vs Target
            </button>
          </div>
        </div>

        {/* Recharts Render Container */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {expenseChartType === 'stacked' ? (
              <AreaChart data={displayExpenseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCivil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="gradInterior" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="gradSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="gradLabor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit="L" />
                <Tooltip content={<CustomTooltipExpense />} />
                <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                <Area type="monotone" dataKey="civilMaterials" name="Civil Materials" stackId="1" stroke="#0d9488" fill="url(#gradCivil)" />
                <Area type="monotone" dataKey="interiorFitout" name="Interior Fitouts" stackId="1" stroke="#6366f1" fill="url(#gradInterior)" />
                <Area type="monotone" dataKey="solarEquipment" name="Solar Rooftops" stackId="1" stroke="#f59e0b" fill="url(#gradSolar)" />
                <Area type="monotone" dataKey="laborCost" name="Labor & Workers" stackId="1" stroke="#10b981" fill="url(#gradLabor)" />
              </AreaChart>
            ) : expenseChartType === 'bar' ? (
              <BarChart data={displayExpenseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit="L" />
                <Tooltip content={<CustomTooltipExpense />} />
                <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                <Bar dataKey="civilMaterials" name="Civil Materials" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="laborCost" name="Labor & Workers" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="solarEquipment" name="Solar Kits" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="interiorFitout" name="Interior Studio" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="equipmentLogistics" name="Logistics & Machinery" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <ComposedChart data={displayExpenseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit="L" />
                <Tooltip content={<CustomTooltipExpense />} />
                <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                <Bar dataKey="totalExpense" name="Actual Expense Total" fill="#0d9488" radius={[6, 6, 0, 0]} />
                <Line type="monotone" dataKey="targetBudget" name="Approved Target Ceiling" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

      </div>

      {/* SECTION 2 & 3 GRID: PROJECT BUDGETS + VENDOR PAYMENT STATUS PIE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PROJECT BUDGETS COMPARISON (2 COLUMNS) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Active Project Budgets vs Actual Spend (प्रोजेक्ट बजट एवं वास्तविक व्यय)
              </h3>
              <p className="text-xs text-slate-500">Allocated budget vs actual spent + committed costs in ₹ Lakhs</p>
            </div>
            <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-black rounded-xl">
              6 Active Projects
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={PROJECT_BUDGET_DATA} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis type="number" unit="L" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis dataKey="projectName" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={140} />
                <Tooltip
                  formatter={(val: any) => [`₹${val} Lakhs`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="allocatedBudget" name="Allocated Budget" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="actualSpent" name="Actual Spent" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Project Budget Variance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {PROJECT_BUDGET_DATA.slice(0, 3).map((p, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span className="truncate max-w-[120px]">{p.projectName}</span>
                  <span className={`px-1.5 py-0.5 rounded ${
                    p.status === 'On Track' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    p.status === 'Near Limit' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-black text-slate-900 dark:text-white">₹{p.actualSpent} L</span>
                  <span className="text-[10px] font-mono text-slate-500">/ ₹{p.allocatedBudget} L</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${p.actualSpent > p.allocatedBudget ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, (p.actualSpent / p.allocatedBudget) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* VENDOR PAYMENT STATUS PIE CHART (1 COLUMN) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-5 flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-teal-600" />
              Vendor Payment Status (भुगतान स्थिति)
            </h3>
            <p className="text-xs text-slate-500">Breakdown of invoices by audit &amp; release state</p>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={VENDOR_PAYMENT_STATUS_DATA}
                  dataKey="valueLakhs"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {VENDOR_PAYMENT_STATUS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltipPie />} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Ledger</span>
              <span className="text-base font-black text-slate-900 dark:text-white">₹486.9 L</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {VENDOR_PAYMENT_STATUS_DATA.map((st, i) => (
              <div key={i} className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }}></span>
                  <span className="truncate max-w-[130px]">{st.status}</span>
                </span>
                <div className="flex items-center gap-2 font-mono font-bold">
                  <span>{st.count} Invoices</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-teal-600 dark:text-teal-400">₹{st.valueLakhs} L</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* SECTION 4: DETAILED VENDOR PAYMENT AUDIT LEDGER TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Vendor Payment Audit &amp; Release Ledger (वेंडर भुगतान लेजर)
            </h2>
            <p className="text-xs text-slate-500">
              Filter by invoice status, track due dates, GST compliance &amp; payment release modes
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={searchLedger}
              onChange={(e) => setSearchLedger(e.target.value)}
              placeholder="Search vendor or invoice ID..."
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium w-48"
            />

            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Payment Statuses</option>
              <option value="Paid in Full">Paid in Full</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Due within 15 Days">Due within 15 Days</option>
              <option value="Overdue / Delayed">Overdue / Delayed</option>
              <option value="Under GST Audit">Under GST Audit</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-700 uppercase font-black tracking-wider">
                <th className="p-3 rounded-l-xl">Invoice ID</th>
                <th className="p-3">Vendor / Supplier Name</th>
                <th className="p-3">Project Site</th>
                <th className="p-3">Invoice Amount</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Payment Mode</th>
                <th className="p-3 rounded-r-xl">Status &amp; Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLedger.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-3 font-mono font-bold text-teal-600 dark:text-teal-400">{row.id}</td>
                  <td className="p-3 font-extrabold text-slate-900 dark:text-white">
                    {row.vendorName}
                    <span className="block text-[10px] font-normal text-slate-400">{row.category} Supplier</span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{row.project}</td>
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                    ₹{row.amountINR.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-slate-500 font-medium">{row.dueDate}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold rounded-md text-[10px]">
                      {row.paymentMode}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 ${
                        row.status === 'Paid in Full' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        row.status === 'Pending Approval' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                        row.status === 'Due within 15 Days' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        row.status === 'Overdue / Delayed' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      }`}>
                        {row.status === 'Paid in Full' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {row.status === 'Overdue / Delayed' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                        <span>{row.status}</span>
                      </span>

                      {row.status !== 'Paid in Full' && (
                        <button
                          onClick={() => alert(`Initiating payment release for ${row.id} (${row.vendorName}) via 2click Escrow...`)}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-black text-[10px] rounded-lg transition shadow-xs cursor-pointer"
                        >
                          Release Payment
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
