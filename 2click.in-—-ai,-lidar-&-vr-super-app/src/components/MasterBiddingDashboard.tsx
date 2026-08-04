import React, { useState } from 'react';
import { 
  Gavel, 
  BarChart3, 
  Wallet, 
  PiggyBank, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Users, 
  CheckCircle2, 
  PlusCircle, 
  Search, 
  Bell, 
  HelpCircle, 
  User as UserIcon, 
  ArrowRight, 
  Sparkles,
  Zap,
  ShieldAlert,
  FileSpreadsheet,
  Activity
} from 'lucide-react';

interface MasterBiddingDashboardProps {
  onNavigateToRegistry: () => void;
  onNavigateToEvaluation: (tenderId?: string) => void;
  onNavigateToRules: () => void;
  onCreateTenderClick: () => void;
}

export const MasterBiddingDashboard: React.FC<MasterBiddingDashboardProps> = ({
  onNavigateToRegistry,
  onNavigateToEvaluation,
  onNavigateToRules,
  onCreateTenderClick,
}) => {
  const [activeBidsCount, setActiveBidsCount] = useState<number>(4892);
  const [timeFilter, setTimeFilter] = useState<'30d' | '7d' | '24h'>('30d');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 p-6 rounded-2xl border border-pink-500/20 shadow-xl backdrop-blur-md">
        <div>
          <nav className="flex items-center gap-2 text-xs font-mono text-pink-400 mb-1">
            <span>2CLICK ENTERPRISE</span>
            <span>/</span>
            <span className="text-cyan-400">MASTER BIDDING INTELLIGENCE</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Master Bidding <span className="text-pink-500 drop-shadow-[0_0_10px_rgba(255,45,120,0.8)]">Dashboard</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time enterprise bidding intelligence, tender analytics & system oversight.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCreateTenderClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(255,45,120,0.4)] transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Tender</span>
          </button>
          <button
            onClick={onNavigateToRules}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
          >
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Rules Engine</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Open Tenders */}
        <div 
          onClick={onNavigateToRegistry}
          className="group relative bg-slate-900/80 border border-cyan-500/40 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_15px_rgba(0,255,204,0.1)] hover:border-cyan-400 transition cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-2xl -mr-8 -mt-8 group-hover:bg-cyan-500/20 transition" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                Total Open Tenders
              </p>
              <h3 className="text-3xl font-black text-white mt-2 tracking-tight">1,248</h3>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Gavel className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex items-center text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.4%
            </span>
            <span className="text-[10px] font-mono text-slate-400">vs last month</span>
          </div>
        </div>

        {/* Active Bids */}
        <div className="group relative bg-slate-900/80 border border-pink-500/40 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_15px_rgba(255,45,120,0.1)] hover:border-pink-400 transition cursor-pointer overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 blur-2xl -mr-8 -mt-8 group-hover:bg-pink-500/20 transition" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                Active Live Bids
              </p>
              <h3 className="text-3xl font-black text-white mt-2 tracking-tight">
                {activeBidsCount.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex items-center text-[10px] font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded">
              <Activity className="w-3 h-3 mr-1 animate-spin" />
              Live Feed
            </span>
            <span className="text-[10px] font-mono text-slate-400">Submissions incoming</span>
          </div>
        </div>

        {/* Project GMV */}
        <div className="group relative bg-slate-900/80 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_15px_rgba(255,224,74,0.05)] hover:border-amber-400/50 transition cursor-pointer overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-2xl -mr-8 -mt-8 group-hover:bg-amber-500/20 transition" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                Project GMV Value
              </p>
              <h3 className="text-3xl font-black text-amber-300 mt-2 tracking-tight">₹84.2Cr</h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex items-center text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
              <Zap className="w-3 h-3 mr-1" />
              Active Pipeline
            </span>
            <span className="text-[10px] font-mono text-slate-400">Under bidding</span>
          </div>
        </div>

        {/* Avg Bid Savings */}
        <div className="group relative bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:border-emerald-400 transition cursor-pointer overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl -mr-8 -mt-8 group-hover:bg-emerald-500/20 transition" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                Avg. Bid Savings
              </p>
              <h3 className="text-3xl font-black text-emerald-400 mt-2 tracking-tight">18.4%</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Optimized
            </span>
            <span className="text-[10px] font-mono text-slate-400">CPWD Target: 15%</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart & Activity Feed Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bidding Velocity Chart Container */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col backdrop-blur-md">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-pink-500" />
                  <span>Bidding Velocity Analytics</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daily bid submission volume & bidding velocity trajectory
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                  <button
                    onClick={() => setTimeFilter('30d')}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded ${timeFilter === '30d' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    30D
                  </button>
                  <button
                    onClick={() => setTimeFilter('7d')}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded ${timeFilter === '7d' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    7D
                  </button>
                </div>
                <button 
                  onClick={onNavigateToRegistry}
                  className="px-3 py-1.5 text-[10px] font-mono font-bold border border-cyan-500/30 text-cyan-400 rounded-lg uppercase tracking-wider hover:bg-cyan-500/10 transition"
                >
                  View All Registry
                </button>
              </div>
            </div>

            {/* SVG Bidding Velocity Graph */}
            <div className="h-64 relative w-full pt-4">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 240">
                <defs>
                  <linearGradient id="velocityGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ff2d78" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ff2d78" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,190 Q120,150 250,170 T500,100 T750,50 T1000,80 L1000,240 L0,240 Z"
                  fill="url(#velocityGrad)"
                />
                <path
                  d="M0,190 Q120,150 250,170 T500,100 T750,50 T1000,80"
                  fill="none"
                  stroke="#ff2d78"
                  strokeWidth="3.5"
                  className="drop-shadow-[0_0_8px_rgba(255,45,120,0.8)]"
                />
                <path
                  d="M0,210 Q180,190 350,170 T700,140 T1000,110"
                  fill="none"
                  stroke="#00ffcc"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
              </svg>
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2 border-t border-slate-800/80 pt-2">
                <span>30 Days Ago</span>
                <span>20 Days Ago</span>
                <span>10 Days Ago</span>
                <span className="text-cyan-400 font-bold">Today (Peak Bidding)</span>
              </div>
            </div>
          </div>

          {/* Recent Bid Activity Feed */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Live Activity Stream</span>
              </h3>
              <button 
                onClick={onNavigateToRegistry}
                className="text-xs text-cyan-400 font-mono hover:underline"
              >
                View Log Registry →
              </button>
            </div>
            <div className="divide-y divide-slate-800/60">
              <div 
                onClick={() => onNavigateToEvaluation('#TN-2023-902')}
                className="p-4 flex items-center gap-4 hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    Cyber-Garden Solar Farm <span className="text-slate-400 font-normal">received bid of</span> ₹12.8Cr
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">2 minutes ago • Vendor: Zenith Power Systems</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/30 font-bold">
                  Active
                </span>
              </div>

              <div 
                onClick={() => onNavigateToEvaluation('#SOL-2024-SV')}
                className="p-4 flex items-center gap-4 hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    Bid Evaluation Complete <span className="text-slate-400 font-normal">for</span> Skyline Villa Solar Phase
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">14 minutes ago • L1 Ranking Auto-Assigned</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                  Evaluated
                </span>
              </div>

              <div 
                onClick={onNavigateToRegistry}
                className="p-4 flex items-center gap-4 hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    New Tender Published: <span className="text-slate-300">Neo-Tokyo Metro RCC Foundation</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">1 hour ago • Budget: ₹4.5Cr - ₹6.0Cr</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                  Published
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Urgent Attention Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-pink-500/30 rounded-2xl flex flex-col backdrop-blur-md overflow-hidden">
            <div className="p-5 bg-pink-500/10 border-b border-pink-500/20">
              <div className="flex items-center gap-2 text-pink-400 mb-1">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-white">
                  Urgent Bidding Actions
                </h3>
              </div>
              <p className="text-xs text-slate-400">Critical action required for 3 expiring tenders</p>
            </div>

            <div className="p-5 space-y-4">
              {/* Alert Item 1 */}
              <div 
                onClick={() => onNavigateToEvaluation('#TN-2023-891')}
                className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-pink-500/50 transition cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-mono font-bold bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30 uppercase">
                    Time Critical
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-pink-400" />
                    45m left
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-pink-400 transition">
                  Neo-Structure Phase II
                </h4>
                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>2/5 Bids Target</span>
                  <span className="text-pink-400 font-bold">40% Reached</span>
                </div>
                <div className="mt-1.5 w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-pink-500 h-full w-[40%] shadow-[0_0_8px_rgba(255,45,120,0.8)]" />
                </div>
              </div>

              {/* Alert Item 2 */}
              <div 
                onClick={() => onNavigateToEvaluation('#TN-2023-958')}
                className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-amber-500/50 transition cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 uppercase">
                    Low Participation
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3 text-amber-400" />
                    0 Bids
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                  Underground Conduits X-9
                </h4>
                <p className="text-[10px] text-slate-400 mt-2 font-mono">No vendor submissions yet</p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('📤 Vendor invitations dispatched to Tier 1 & Tier 2 contractors!');
                  }}
                  className="w-full mt-3 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[10px] font-bold uppercase rounded-lg transition cursor-pointer"
                >
                  Auto-Invite Vendors
                </button>
              </div>

              {/* System Optimization Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 text-center">
                <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
                  CPWD & IS Code Rule Engine
                </p>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                  Auto-invitation & fee limits enabled. Minimum 5 bidders enforced per tender.
                </p>
                <button
                  onClick={onNavigateToRules}
                  className="text-[10px] font-bold text-cyan-300 hover:text-white flex items-center justify-center gap-1 w-full py-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20 cursor-pointer"
                >
                  Configure Rule Engine <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
