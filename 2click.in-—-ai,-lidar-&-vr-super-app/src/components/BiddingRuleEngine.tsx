import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Users, 
  Percent, 
  Clock, 
  ShieldCheck, 
  Calculator, 
  SlidersHorizontal, 
  CheckCircle2, 
  AlertTriangle, 
  Flame,
  ArrowRight
} from 'lucide-react';
import { getSafeLocalStorage, setSafeLocalStorage } from '../lib/storage';

export interface BiddingRulesState {
  minBidders: number;
  platformFeePercent: number;
  autoClosureEnabled: boolean;
  selectedVendorTier: 'tier1' | 'tier2' | 'tier3';
}

const DEFAULT_RULES: BiddingRulesState = {
  minBidders: 5,
  platformFeePercent: 2.5,
  autoClosureEnabled: true,
  selectedVendorTier: 'tier2'
};

export const BiddingRuleEngine: React.FC = () => {
  const [rules, setRules] = useState<BiddingRulesState>(() => {
    return getSafeLocalStorage<BiddingRulesState>('2click_bidding_rules', DEFAULT_RULES);
  });

  const [hypotheticalValue, setHypotheticalValue] = useState<number>(10000000); // ₹1 Cr
  const [isDeploying, setIsDeploying] = useState<boolean>(false);

  useEffect(() => {
    setSafeLocalStorage('2click_bidding_rules', rules);
  }, [rules]);

  const calculatedRevenue = (hypotheticalValue * (rules.platformFeePercent / 100));

  const handleDeployRules = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      alert('🚀 Systemic Logic Updates Deployed! Rules actively applied across all tender validation gateways.');
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/50 p-6 rounded-2xl border border-cyan-500/30 shadow-xl backdrop-blur-md">
        <nav className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
          <span>2CLICK ENTERPRISE</span>
          <span>/</span>
          <span className="text-pink-400">BIDDING RULE ENGINE</span>
        </nav>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Systemic <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,204,0.8)]">Logic Engine</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Define global constraints, platform fee rates & bidder validation protocols for the 2Click ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column Controls */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Min Bidders Card */}
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-pink-500/30 backdrop-blur-md flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-pink-500/10 border border-pink-500/30 rounded-xl text-pink-400">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold text-pink-400 bg-pink-500/10 px-2 py-1 rounded border border-pink-500/20">
                  CRITICAL VALIDATION
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">Min Bidders per Tender</h3>
              <p className="text-xs text-slate-400 mb-6">
                Minimum required contractor submissions before tender can proceed to evaluation.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Min: 2</span>
                <span className="text-2xl font-black text-pink-400">{rules.minBidders} Bidders</span>
                <span className="text-slate-400">Max: 15</span>
              </div>
              <input
                type="range"
                min={2}
                max={15}
                value={rules.minBidders}
                onChange={(e) => setRules(prev => ({ ...prev, minBidders: parseInt(e.target.value) }))}
                className="w-full accent-pink-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          {/* Platform Fee Card */}
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-cyan-500/30 backdrop-blur-md shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
                <Percent className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
                <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
                ACTIVE FEE
              </div>
            </div>
            <h3 className="text-base font-bold text-white mb-1">Platform Fee (%)</h3>
            <p className="text-xs text-slate-400 mb-4">
              Commission percentage levied on awarded contracts.
            </p>

            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="10"
                value={rules.platformFeePercent}
                onChange={(e) => setRules(prev => ({ ...prev, platformFeePercent: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-2xl font-black text-cyan-400 outline-none focus:border-cyan-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-extrabold text-cyan-400/50">%</span>
            </div>
          </div>

          {/* Auto-Closure Logic */}
          <div className="bg-slate-900/80 p-6 rounded-2xl border-l-4 border-l-amber-400 border-slate-800 md:col-span-2 backdrop-blur-md shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Auto-Closure Logic</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automatically close tenders upon deadline expiry without manual administrative intervention.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={rules.autoClosureEnabled}
                onChange={(e) => setRules(prev => ({ ...prev, autoClosureEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-slate-400 peer-checked:after:bg-amber-300 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500/30 border border-slate-700" />
            </label>
          </div>

          {/* Vendor Tier Selection */}
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 md:col-span-2 backdrop-blur-md shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-pink-500" />
              <span>Vendor Qualification Tier Requirements</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => setRules(prev => ({ ...prev, selectedVendorTier: 'tier1' }))}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  rules.selectedVendorTier === 'tier1'
                    ? 'border-pink-500 bg-pink-500/10'
                    : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <p className="text-[10px] font-mono text-slate-400 uppercase">Tier 1</p>
                <p className="text-sm font-bold text-white mt-1">Premium Strategic</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Unlimited Contract Cap</p>
              </div>

              <div
                onClick={() => setRules(prev => ({ ...prev, selectedVendorTier: 'tier2' }))}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  rules.selectedVendorTier === 'tier2'
                    ? 'border-pink-500 bg-pink-500/10'
                    : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <p className="text-[10px] font-mono text-slate-400 uppercase">Tier 2</p>
                <p className="text-sm font-bold text-white mt-1">Standard Enterprise</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Max Value: ₹5.0 Cr</p>
              </div>

              <div
                onClick={() => setRules(prev => ({ ...prev, selectedVendorTier: 'tier3' }))}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  rules.selectedVendorTier === 'tier3'
                    ? 'border-pink-500 bg-pink-500/10'
                    : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <p className="text-[10px] font-mono text-slate-400 uppercase">Tier 3</p>
                <p className="text-sm font-bold text-white mt-1">Local Specialized</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Max Value: ₹50 Lakhs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Calculator & Deploy */}
        <div className="lg:col-span-4 space-y-6">
          {/* Fee Preview Calculator */}
          <div className="bg-slate-900/90 p-6 rounded-2xl border border-cyan-500/30 backdrop-blur-md shadow-2xl relative overflow-hidden space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-cyan-400" />
              <span>Revenue Calculator</span>
            </h3>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-2">
                Hypothetical Tender Value (₹)
              </label>
              <input
                type="number"
                value={hypotheticalValue}
                onChange={(e) => setHypotheticalValue(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-lg font-bold text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-300">
              <span>Applied Platform Fee</span>
              <span className="font-mono font-bold text-cyan-400">{rules.platformFeePercent}%</span>
            </div>

            <div className="pt-2">
              <p className="text-[10px] font-mono text-slate-400 uppercase">Calculated Platform Revenue</p>
              <p className="text-3xl font-black text-cyan-400 mt-1 drop-shadow-[0_0_8px_rgba(0,255,204,0.6)]">
                ₹{calculatedRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Deploy Logic Button */}
          <button
            onClick={handleDeployRules}
            disabled={isDeploying}
            className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            {isDeploying ? (
              <span>Deploying Logic...</span>
            ) : (
              <>
                <span>Deploy System Logic Updates</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
