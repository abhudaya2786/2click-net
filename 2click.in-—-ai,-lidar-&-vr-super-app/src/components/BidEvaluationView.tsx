import React, { useState } from 'react';
import { 
  Gavel, 
  Award, 
  Star, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  BrainCircuit, 
  FileCheck, 
  SlidersHorizontal, 
  Download, 
  Lock, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface VendorBidCard {
  id: string;
  name: string;
  badge: string;
  isL1: boolean;
  quoteAmount: string;
  timeline: string;
  rating: number;
  techScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskPercent: number;
  iconColor: string;
}

const SAMPLE_BIDS: VendorBidCard[] = [
  {
    id: 'v1',
    name: 'Zenith Energy Co.',
    badge: 'Verified Tier-A Contractor',
    isL1: true,
    quoteAmount: '₹1.24 Cr',
    timeline: '14 Weeks',
    rating: 4.9,
    techScore: 98,
    riskLevel: 'Low',
    riskPercent: 15,
    iconColor: 'cyan'
  },
  {
    id: 'v2',
    name: 'Helios Infrastructure',
    badge: 'Legacy CPWD Contractor',
    isL1: false,
    quoteAmount: '₹1.31 Cr',
    timeline: '12 Weeks',
    rating: 4.7,
    techScore: 92,
    riskLevel: 'Medium',
    riskPercent: 45,
    iconColor: 'pink'
  },
  {
    id: 'v3',
    name: 'NovaGrid Systems',
    badge: 'Specialized Solar Installer',
    isL1: false,
    quoteAmount: '₹1.28 Cr',
    timeline: '16 Weeks',
    rating: 4.2,
    techScore: 88,
    riskLevel: 'High',
    riskPercent: 78,
    iconColor: 'amber'
  }
];

interface BidEvaluationViewProps {
  tenderId?: string;
  onBackToRegistry: () => void;
}

export const BidEvaluationView: React.FC<BidEvaluationViewProps> = ({
  tenderId = '#SOL-2024-SV',
  onBackToRegistry,
}) => {
  const [awardedVendorId, setAwardedVendorId] = useState<string | null>('v1');
  const [bids, setBids] = useState<VendorBidCard[]>(SAMPLE_BIDS);
  const [negotiationModalOpen, setNegotiationModalOpen] = useState(false);

  const handleAwardContract = (vendor: VendorBidCard) => {
    setAwardedVendorId(vendor.id);
    alert(`🎉 [Contract Awarded] Contract for ${tenderId} has been awarded to ${vendor.name} (${vendor.quoteAmount})!`);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <button onClick={onBackToRegistry} className="hover:text-cyan-400 cursor-pointer">
              Evaluation Registry
            </button>
            <span>/</span>
            <span className="text-amber-400 font-bold">{tenderId}</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Skyline Villa Solar Phase II <span className="text-pink-500 drop-shadow-[0_0_8px_rgba(255,45,120,0.8)]">Evaluation</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Phase 2: Comparative Bid Analysis, L1 Ranking Matrix & Contract Selection
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert('📄 Evaluation report exported to PDF.')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono uppercase tracking-wider rounded-xl transition cursor-pointer"
          >
            <Download className="w-4 h-4 inline mr-1" />
            Export Matrix
          </button>
          <button 
            onClick={() => alert('🔒 Tender bids frozen and locked for final auditing.')}
            className="px-4 py-2.5 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 text-xs font-mono uppercase tracking-wider rounded-xl hover:bg-cyan-500/20 transition cursor-pointer"
          >
            <Lock className="w-4 h-4 inline mr-1" />
            Freeze Bids
          </button>
        </div>
      </div>

      {/* Bento Grid - Vendor Bid Comparison Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {bids.map((vendor) => {
          const isAwarded = awardedVendorId === vendor.id;
          return (
            <div
              key={vendor.id}
              className={`rounded-2xl overflow-hidden relative backdrop-blur-md transition-all p-6 space-y-6 ${
                vendor.isL1 
                  ? 'bg-slate-900/90 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,255,204,0.15)]' 
                  : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {vendor.isL1 && (
                <div className="absolute top-0 right-0 bg-cyan-400 text-slate-950 px-4 py-1 text-[10px] font-extrabold font-mono uppercase tracking-widest rounded-bl-xl shadow-md">
                  L1 Preferred Ranking
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                  vendor.isL1 
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' 
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}>
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{vendor.name}</h3>
                  <p className="text-xs font-mono text-cyan-400">{vendor.badge}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Quote Amount</p>
                  <p className="text-lg font-extrabold text-cyan-400 mt-0.5">{vendor.quoteAmount}</p>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Project Timeline</p>
                  <p className="text-lg font-extrabold text-white mt-0.5">{vendor.timeline}</p>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Vendor Rating</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-lg font-bold text-white">{vendor.rating}</span>
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Tech Score</p>
                  <p className="text-lg font-bold text-amber-300 mt-0.5">{vendor.techScore}/100</p>
                </div>
              </div>

              {/* Risk Assessment Indicator */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono uppercase text-slate-400">
                  <span>Risk Assessment</span>
                  <span className={vendor.riskLevel === 'Low' ? 'text-cyan-400 font-bold' : vendor.riskLevel === 'Medium' ? 'text-amber-300 font-bold' : 'text-rose-400 font-bold'}>
                    {vendor.riskLevel} Risk
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${vendor.riskLevel === 'Low' ? 'bg-cyan-400' : vendor.riskLevel === 'Medium' ? 'bg-amber-400' : 'bg-rose-500'}`}
                    style={{ width: `${vendor.riskPercent}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => handleAwardContract(vendor)}
                className={`w-full py-3.5 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                  isAwarded
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(255,224,74,0.3)]'
                    : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-lg'
                }`}
              >
                {isAwarded ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                    <span>Awarded Contract</span>
                  </>
                ) : (
                  <span>Award Contract to {vendor.name.split(' ')[0]}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Comparative Radar & AI Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive Radar Chart Visualization */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-pink-500" />
              <span>Comparative Radar Metric Analysis</span>
            </h3>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> Zenith
              </span>
              <span className="flex items-center gap-1 text-pink-400">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" /> Helios
              </span>
            </div>
          </div>

          <div className="h-64 relative flex items-center justify-center">
            {/* Concentric Radar Rings */}
            <div className="absolute w-52 h-52 border border-slate-800 rounded-full" />
            <div className="absolute w-36 h-36 border border-slate-800/80 rounded-full" />
            <div className="absolute w-20 h-20 border border-slate-800/60 rounded-full" />

            {/* Radar Spoke Axes */}
            <div className="absolute w-52 h-px bg-slate-800 rotate-0" />
            <div className="absolute w-52 h-px bg-slate-800 rotate-60" />
            <div className="absolute w-52 h-px bg-slate-800 rotate-120" />

            {/* Radar Labels */}
            <span className="absolute -top-2 font-mono text-[10px] text-slate-400 uppercase">Pricing</span>
            <span className="absolute -bottom-2 font-mono text-[10px] text-slate-400 uppercase">Technical Quality</span>
            <span className="absolute left-4 font-mono text-[10px] text-slate-400 uppercase">Timeline</span>
            <span className="absolute right-4 font-mono text-[10px] text-slate-400 uppercase">Compliance</span>

            {/* Zenith Cyan Polygon SVG */}
            <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_10px_rgba(0,255,204,0.3)]" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="50,18 80,50 50,82 20,50" fill="rgba(0,255,204,0.15)" stroke="#00ffcc" strokeWidth="1" />
            </svg>

            {/* Helios Pink Polygon SVG */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="50,28 68,52 62,68 32,58" fill="rgba(255,45,120,0.15)" stroke="#ff2d78" strokeWidth="1" />
            </svg>
          </div>
        </div>

        {/* AI Recommendation Summary */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-amber-500/40 p-6 rounded-2xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400" />
            <h3 className="font-bold text-amber-300 text-sm mb-2 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-amber-400" />
              <span>AI Evaluation Recommendation</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Based on IS Code compliance and vendor execution history, <strong className="text-white">Zenith Energy Co.</strong> offers the lowest financial risk with the highest technical adherence score (98/100).
            </p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              However, <strong className="text-white">Helios Infra</strong> guarantees delivery 2 weeks faster, which could save approximately ₹4.5 Lakhs in project delay overheads.
            </p>
          </div>

          <button
            onClick={() => setNegotiationModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-cyan-400 font-bold text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer"
          >
            <Gavel className="w-4 h-4" />
            <span>Initiate Multi-Round Negotiation</span>
          </button>
        </div>
      </div>

      {/* Negotiation Modal */}
      {negotiationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Gavel className="w-5 h-5 text-cyan-400" />
              <span>Initiate Multi-Round Counter-Bidding</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Send automated counter-bidding invitation to top 2 L1 & L2 bidders (Zenith & Helios) for final price discount round.
            </p>
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-xs text-slate-400 space-y-1 font-mono">
              <p>• Target Discount: 3.5%</p>
              <p>• Round Window: 24 Hours</p>
              <p>• Enforced Minimum: 5 Bidders Rule Active</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setNegotiationModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setNegotiationModalOpen(false);
                  alert('🚀 Counter-bidding round dispatched to vendors!');
                }}
                className="px-5 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-cyan-400 cursor-pointer"
              >
                Dispatch Counter Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
