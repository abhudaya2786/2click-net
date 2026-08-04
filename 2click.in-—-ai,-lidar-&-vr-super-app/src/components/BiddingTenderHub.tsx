import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Scale, 
  SlidersHorizontal, 
  PlusCircle, 
  Gavel, 
  Sparkles,
  Zap
} from 'lucide-react';
import { MasterBiddingDashboard } from './MasterBiddingDashboard';
import { TenderRegistry } from './TenderRegistry';
import { BidEvaluationView } from './BidEvaluationView';
import { BiddingRuleEngine } from './BiddingRuleEngine';

interface BiddingTenderHubProps {
  initialSubTab?: 'dashboard' | 'registry' | 'evaluation' | 'rules';
  initialTenderId?: string;
  onOpenCreateTenderModal?: () => void;
}

export const BiddingTenderHub: React.FC<BiddingTenderHubProps> = ({
  initialSubTab = 'dashboard',
  initialTenderId = '#SOL-2024-SV',
}) => {
  const [subTab, setSubTab] = useState<'dashboard' | 'registry' | 'evaluation' | 'rules'>(initialSubTab);
  const [selectedTenderId, setSelectedTenderId] = useState<string>(initialTenderId);
  const [openCreateTender, setOpenCreateTender] = useState<boolean>(false);

  const handleSelectTenderForEvaluation = (tenderId: string) => {
    setSelectedTenderId(tenderId);
    setSubTab('evaluation');
  };

  const handleOpenCreateModal = () => {
    setSubTab('registry');
    setOpenCreateTender(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Cyber Bidding Navigation Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => { setSubTab('dashboard'); setOpenCreateTender(false); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              subTab === 'dashboard'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Master Dashboard</span>
          </button>

          <button
            onClick={() => { setSubTab('registry'); setOpenCreateTender(false); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              subTab === 'registry'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Tender Registry</span>
          </button>

          <button
            onClick={() => { setSubTab('evaluation'); setOpenCreateTender(false); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              subTab === 'evaluation'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Bid Evaluation ({selectedTenderId})</span>
          </button>

          <button
            onClick={() => { setSubTab('rules'); setOpenCreateTender(false); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              subTab === 'rules'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span>Rule Engine</span>
          </button>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Tender</span>
        </button>
      </div>

      {/* Render Selected View */}
      {subTab === 'dashboard' && (
        <MasterBiddingDashboard
          onNavigateToRegistry={() => setSubTab('registry')}
          onNavigateToEvaluation={(tId) => handleSelectTenderForEvaluation(tId || '#SOL-2024-SV')}
          onNavigateToRules={() => setSubTab('rules')}
          onCreateTenderClick={handleOpenCreateModal}
        />
      )}

      {subTab === 'registry' && (
        <TenderRegistry
          onSelectTenderForEvaluation={handleSelectTenderForEvaluation}
          openCreateModalDirectly={openCreateTender}
        />
      )}

      {subTab === 'evaluation' && (
        <BidEvaluationView
          tenderId={selectedTenderId}
          onBackToRegistry={() => setSubTab('registry')}
        />
      )}

      {subTab === 'rules' && (
        <BiddingRuleEngine />
      )}
    </div>
  );
};
