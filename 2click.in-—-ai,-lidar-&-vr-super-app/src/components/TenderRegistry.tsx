import React, { useState, useEffect } from 'react';
import { 
  Gavel, 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  IndianRupee, 
  ChevronRight, 
  ChevronLeft, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Building2, 
  Eye, 
  Share2, 
  Tag
} from 'lucide-react';
import { getSafeLocalStorage, setSafeLocalStorage } from '../lib/storage';

export interface TenderItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  location: string;
  budgetMin: string;
  budgetMax: string;
  bidsCount: number;
  status: 'Open' | 'Evaluation' | 'Awarded';
  deadline: string;
  createdAt: string;
  description?: string;
}

const INITIAL_TENDERS: TenderItem[] = [
  {
    id: '#TN-2023-891',
    title: 'Neo-Tokyo Metro Hub',
    subtitle: 'Architectural RCC Foundation & Civil Works',
    category: 'RCC Construction',
    location: 'Shibuya, Tokyo Zone',
    budgetMin: '₹4.5Cr',
    budgetMax: '₹6.0Cr',
    bidsCount: 24,
    status: 'Open',
    deadline: '2026-08-15',
    createdAt: '2026-07-28',
    description: 'RCC foundation works with heavy structural grade reinforcement as per IS 456 guidelines.'
  },
  {
    id: '#TN-2023-902',
    title: 'Cyber-Garden Solar Farm',
    subtitle: '5MW Rooftop & Ground Solar Installation',
    category: 'Solar Energy',
    location: 'Minato City / Gorakhpur Zone',
    budgetMin: '₹12.0Cr',
    budgetMax: '₹15.5Cr',
    bidsCount: 12,
    status: 'Evaluation',
    deadline: '2026-08-10',
    createdAt: '2026-07-25',
    description: 'PM Surya Ghar 5MW Solar Installation with Tier-1 bifacial panels & inverter stringing.'
  },
  {
    id: '#TN-2023-945',
    title: 'Onyx Corporate Executive Suites',
    subtitle: 'Lounge & Glass Partition Interior Studio',
    category: 'Interior Design',
    location: 'Roppongi Hills / Bengaluru',
    budgetMin: '₹85L',
    budgetMax: '₹1.2Cr',
    bidsCount: 45,
    status: 'Awarded',
    deadline: '2026-07-30',
    createdAt: '2026-07-10',
    description: 'Premium acoustic wall panelling, Italian marble flooring & automated ELV lighting.'
  },
  {
    id: '#TN-2023-958',
    title: 'Neon District Residences',
    subtitle: 'Phase 4 High-Rise Electrical & Plumbing Works',
    category: 'Electrical & Plumbing',
    location: 'Nakano City / Delhi NCR',
    budgetMin: '₹22.5Cr',
    budgetMax: '₹30.0Cr',
    bidsCount: 8,
    status: 'Open',
    deadline: '2026-08-20',
    createdAt: '2026-07-29',
    description: 'Comprehensive electrical distribution, transformer setup, STP piping & fire hydrants.'
  },
  {
    id: '#SOL-2024-SV',
    title: 'Skyline Villa Solar Phase II',
    subtitle: 'Hybrid Rooftop Solar & Lithium Battery Backup',
    category: 'Solar Energy',
    location: 'Gorakhpur / Mumbai Zone',
    budgetMin: '₹1.2Cr',
    budgetMax: '₹1.5Cr',
    bidsCount: 3,
    status: 'Evaluation',
    deadline: '2026-08-05',
    createdAt: '2026-07-20',
    description: 'Hybrid rooftop solar system with smart net metering, battery storage & remote monitoring.'
  }
];

interface TenderRegistryProps {
  onSelectTenderForEvaluation: (tenderId: string) => void;
  openCreateModalDirectly?: boolean;
}

export const TenderRegistry: React.FC<TenderRegistryProps> = ({
  onSelectTenderForEvaluation,
  openCreateModalDirectly = false,
}) => {
  const [tenders, setTenders] = useState<TenderItem[]>(() => {
    return getSafeLocalStorage<TenderItem[]>('2click_tender_registry', INITIAL_TENDERS);
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(openCreateModalDirectly);

  // New Tender Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState('Solar Energy');
  const [newLocation, setNewLocation] = useState('Gorakhpur Zone');
  const [newBudgetMin, setNewBudgetMin] = useState('₹50L');
  const [newBudgetMax, setNewBudgetMax] = useState('₹1.5Cr');
  const [newDeadline, setNewDeadline] = useState('2026-08-30');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    setSafeLocalStorage('2click_tender_registry', tenders);
  }, [tenders]);

  useEffect(() => {
    if (openCreateModalDirectly) {
      setIsCreateModalOpen(true);
    }
  }, [openCreateModalDirectly]);

  const handleCreateTender = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTender: TenderItem = {
      id: `#TN-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'General Civil & Engineering Tender',
      category: newCategory,
      location: newLocation,
      budgetMin: newBudgetMin,
      budgetMax: newBudgetMax,
      bidsCount: 1,
      status: 'Open',
      deadline: newDeadline,
      createdAt: new Date().toISOString().split('T')[0],
      description: newDescription
    };

    setTenders(prev => [newTender, ...prev]);
    setIsCreateModalOpen(false);
    
    // Reset Form
    setNewTitle('');
    setNewSubtitle('');
    setNewDescription('');

    alert('🎉 नई निविदा (New Tender) सफलतापूर्वक रजिस्टर्ड हो गई है!');
  };

  const filteredTenders = tenders.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesLocation = selectedLocation === 'All' || t.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesSearch = searchQuery === '' || 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesLocation && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs font-mono text-pink-400 mb-1">
            <span>2CLICK ENTERPRISE</span>
            <span>/</span>
            <span className="text-cyan-400">GLOBAL TENDER REGISTRY</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Tender <span className="text-pink-500 drop-shadow-[0_0_8px_rgba(255,45,120,0.8)]">Registry</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Centralized procurement management for solar, RCC construction, interior & infrastructure tenders.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="group relative px-5 py-3 rounded-xl overflow-hidden shadow-lg cursor-pointer shrink-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 group-hover:from-pink-500 group-hover:to-rose-500 transition" />
          <div className="relative flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
            <Plus className="w-4 h-4" />
            <span>Create New Tender</span>
          </div>
        </button>
      </div>

      {/* Stats Quick Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 p-5 rounded-2xl border-l-4 border-cyan-400 border-slate-800 backdrop-blur-md">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
            Active Registry Tenders
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{tenders.length}</span>
            <span className="text-cyan-400 text-xs font-bold">+100% Live</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border-l-4 border-pink-500 border-slate-800 backdrop-blur-md">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
            Pending Evaluation
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {tenders.filter(t => t.status === 'Evaluation').length}
            </span>
            <span className="text-pink-400 text-xs font-bold">L1 Comparative</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border-l-4 border-amber-400 border-slate-800 backdrop-blur-md">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
            Awarded Contracts
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {tenders.filter(t => t.status === 'Awarded').length}
            </span>
            <span className="text-amber-400 text-xs font-bold">₹1.2Cr Volume</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border-l-4 border-emerald-400 border-slate-800 backdrop-blur-md">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
            Total Vendor Bids
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {tenders.reduce((sum, t) => sum + t.bidsCount, 0)}
            </span>
            <span className="text-emerald-400 text-xs font-bold">Verified Bidders</span>
          </div>
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mr-2">
            <Filter className="w-4 h-4" />
            <span>Filters:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs font-medium text-white rounded-xl px-3 py-2 outline-none focus:border-cyan-400"
          >
            <option value="All">All Categories</option>
            <option value="Solar">Solar Energy</option>
            <option value="RCC">RCC Construction</option>
            <option value="Interior">Interior Design</option>
            <option value="Electrical">Electrical & Plumbing</option>
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs font-medium text-white rounded-xl px-3 py-2 outline-none focus:border-cyan-400"
          >
            <option value="All">All Locations</option>
            <option value="Tokyo">Tokyo Zone</option>
            <option value="Gorakhpur">Gorakhpur Zone</option>
            <option value="Mumbai">Mumbai Zone</option>
            <option value="Delhi">Delhi NCR</option>
            <option value="Bengaluru">Bengaluru</option>
          </select>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tenders, ID, or works..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-pink-500/20 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700/80 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Tender ID</th>
                <th className="px-6 py-4">Project Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-right">Budget Range</th>
                <th className="px-6 py-4 text-center">Bids Received</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredTenders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <p className="font-bold text-sm">No tenders found matching selected filter criteria.</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting filters or search terms.</p>
                  </td>
                </tr>
              ) : (
                filteredTenders.map((tender) => (
                  <tr
                    key={tender.id}
                    onClick={() => onSelectTenderForEvaluation(tender.id)}
                    className="hover:bg-pink-500/5 transition cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-cyan-400">
                      {tender.id}
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-white group-hover:text-pink-400 transition">
                          {tender.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">
                          {tender.subtitle}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-medium text-slate-300">
                        {tender.category}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-300 flex items-center gap-1 mt-2">
                      <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span>{tender.location}</span>
                    </td>

                    <td className="px-6 py-4 text-right font-bold text-emerald-400">
                      {tender.budgetMin} - {tender.budgetMax}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-800 font-bold text-white">
                        {tender.bidsCount} Bids
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {tender.status === 'Open' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          Open
                        </span>
                      )}
                      {tender.status === 'Evaluation' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/40 text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                          Evaluation
                        </span>
                      )}
                      {tender.status === 'Awarded' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3 text-amber-300" />
                          Awarded
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTenderForEvaluation(tender.id);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-pink-600 hover:text-white border border-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer"
                      >
                        Evaluate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Tender Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-pink-500/30 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-pink-500" />
                  <span>Register New Enterprise Tender</span>
                </h3>
                <p className="text-xs text-slate-400">Post tender requirements to local and national contractor network</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTender} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Tender Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gorakhpur Solar Microgrid / Residential RCC Works"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Project Subtitle / Scope Summary</label>
                <input
                  type="text"
                  placeholder="e.g. 500kW rooftop installation & transformer stringing"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-pink-500"
                  >
                    <option value="Solar Energy">Solar Energy</option>
                    <option value="RCC Construction">RCC Construction</option>
                    <option value="Interior Design">Interior Design</option>
                    <option value="Electrical & Plumbing">Electrical & Plumbing</option>
                    <option value="General Civil">General Civil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Location Zone</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Min Budget</label>
                  <input
                    type="text"
                    value={newBudgetMin}
                    onChange={(e) => setNewBudgetMin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Max Budget</label>
                  <input
                    type="text"
                    value={newBudgetMax}
                    onChange={(e) => setNewBudgetMax(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Bidding Deadline</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Detailed Technical Scope</label>
                <textarea
                  rows={3}
                  placeholder="Specify material standards, CPWD rates, IS Code requirements..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-pink-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg transition cursor-pointer"
                >
                  Publish Tender Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
