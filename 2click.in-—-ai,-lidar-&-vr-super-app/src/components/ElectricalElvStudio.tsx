import React, { useState } from 'react';
import { 
  Zap, 
  Settings2, 
  Cpu, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  Layers, 
  Radio, 
  Video, 
  Flame, 
  Activity,
  HardDrive,
  Wrench,
  Sparkles,
  Plus,
  Phone,
  CheckCircle,
  Clock,
  IndianRupee,
  Calculator,
  Search,
  Filter,
  FileText,
  AlertTriangle,
  Lightbulb,
  SlidersHorizontal,
  FolderPlus
} from 'lucide-react';
import { ElectricalAnalysisResult, User } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ElectricalElvStudioProps {
  selectedCity: string;
  onNavigateToVendors?: (prefillCategory?: string) => void;
  currentUser?: User | null;
}

export interface ElectricalJobItem {
  id: string;
  clientName: string;
  clientPhone: string;
  location: string;
  workType: 'wiring' | 'fitting' | 'earthing' | 'lighting' | 'maintenance' | 'testing';
  workTitle: string;
  pointsCount: number;
  agreedPriceINR: number;
  advancePaidINR: number;
  status: 'Pending Quote' | 'In Progress' | 'Completed' | 'Paid';
  scheduledDate: string;
  details: string;
}

export const ElectricalElvStudio: React.FC<ElectricalElvStudioProps> = ({
  selectedCity,
  onNavigateToVendors,
  currentUser
}) => {
  const { language } = useLanguage();
  const isHi = language === 'hi' || language === 'bho';

  // Top level View Mode State: Electrician Dashboard vs Transformer HT/LT Calculator
  const [activeStudioMode, setActiveStudioMode] = useState<'electrician_dashboard' | 'transformer_calculator'>('electrician_dashboard');

  // Work Type Filter for Electrician Dashboard
  const [selectedWorkType, setSelectedWorkType] = useState<string>('all');
  const [jobSearchQuery, setJobSearchQuery] = useState<string>('');

  // Electrician Rate Calculator State
  const [calcPointsCount, setCalcPointsCount] = useState<number>(35);
  const [calcBoardsCount, setCalcBoardsCount] = useState<number>(6);
  const [calcEarthingPits, setCalcEarthingPits] = useState<number>(1);
  const [calcWallCuttingFeet, setCalcWallCuttingFeet] = useState<number>(120);
  const [calcDbPanels, setCalcDbPanels] = useState<number>(1);

  // Default Unit Rates (Per Point / Per Item in INR)
  const [ratePerPoint, setRatePerPoint] = useState<number>(180);
  const [ratePerBoard, setRatePerBoard] = useState<number>(450);
  const [ratePerEarthingPit, setRatePerEarthingPit] = useState<number>(3500);
  const [ratePerCuttingFoot, setRatePerCuttingFoot] = useState<number>(40);
  const [ratePerDbPanel, setRatePerDbPanel] = useState<number>(1200);

  const estimatedWiringLaborINR = (calcPointsCount * ratePerPoint) + 
    (calcBoardsCount * ratePerBoard) + 
    (calcEarthingPits * ratePerEarthingPit) + 
    (calcWallCuttingFeet * ratePerCuttingFoot) + 
    (calcDbPanels * ratePerDbPanel);

  // Electrician Work Orders / Jobs Database
  const [jobsList, setJobsList] = useState<ElectricalJobItem[]>([
    {
      id: 'JOB-EL-101',
      clientName: 'Shri Ram Niwas (Shukla ji)',
      clientPhone: '+91 98390 11223',
      location: 'Gyanpur, Bhadohi',
      workType: 'wiring',
      workTitle: '3BHK Villa Concealed PVC Pipe & Circuit Wiring',
      pointsCount: 45,
      agreedPriceINR: 14500,
      advancePaidINR: 5000,
      status: 'In Progress',
      scheduledDate: '2026-07-28',
      details: '4.0 sqmm AC lines, 2.5 sqmm socket circuits & 1.5 sqmm light points with inverter loop.'
    },
    {
      id: 'JOB-EL-102',
      clientName: 'Apna Bazar Showroom',
      clientPhone: '+91 94152 88990',
      location: 'Gorakhpur Town',
      workType: 'fitting',
      workTitle: 'Commercial Modular Switchboard & MCB DB Dressing',
      pointsCount: 28,
      agreedPriceINR: 9800,
      advancePaidINR: 9800,
      status: 'Paid',
      scheduledDate: '2026-07-26',
      details: 'Legrand 18-module boards, 63A 4-Pole RCCB & 12-way TPN DB dressing.'
    },
    {
      id: 'JOB-EL-103',
      clientName: 'Verma Cold Storage',
      clientPhone: '+91 99180 77665',
      location: 'Varanasi Bypass',
      workType: 'earthing',
      workTitle: 'Chemical Gel Copper Earthing Pit & LT Busbar Panel',
      pointsCount: 4,
      agreedPriceINR: 18500,
      advancePaidINR: 6000,
      status: 'Pending Quote',
      scheduledDate: '2026-07-30',
      details: '2 x 50mm Copper Pipe gel chemical earthing with test link and 200A busbar cabling.'
    },
    {
      id: 'JOB-EL-104',
      clientName: 'Dr. Alok Srivastava Residency',
      clientPhone: '+91 98110 44332',
      location: 'Gomti Nagar, Lucknow',
      workType: 'lighting',
      workTitle: 'False Ceiling LED Profile & COB Spot Lighting',
      pointsCount: 32,
      agreedPriceINR: 8400,
      advancePaidINR: 3000,
      status: 'In Progress',
      scheduledDate: '2026-07-29',
      details: 'Aluminium profile channel cutting with 240 LED/m strip & magnetic track light fitting.'
    },
    {
      id: 'JOB-EL-105',
      clientName: 'Mishra Sweets & Bakery',
      clientPhone: '+91 97920 33110',
      location: 'Prayagraj Civil Lines',
      workType: 'maintenance',
      workTitle: 'Main Cable Burnout Repair & Phase Balancing',
      pointsCount: 1,
      agreedPriceINR: 3500,
      advancePaidINR: 3500,
      status: 'Completed',
      scheduledDate: '2026-07-27',
      details: 'Emergency night call for 35 sqmm aluminium main cable jointing and 3-phase load audit.'
    }
  ]);

  // Modal State: Add New Job
  const [showAddJobModal, setShowAddJobModal] = useState<boolean>(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newLocation, setNewLocation] = useState(selectedCity);
  const [newWorkType, setNewWorkType] = useState<'wiring' | 'fitting' | 'earthing' | 'lighting' | 'maintenance' | 'testing'>('wiring');
  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newPointsCount, setNewPointsCount] = useState('20');
  const [newAgreedPrice, setNewAgreedPrice] = useState('5000');
  const [newAdvancePaid, setNewAdvancePaid] = useState('1000');
  const [newDetails, setNewDetails] = useState('');

  // Substation Transformer Parameters (Mode 2)
  const [buildingType, setBuildingType] = useState<'Commercial Complex' | 'Industrial Factory' | 'Residential G+3' | 'Hospital / Data Center'>('Commercial Complex');
  const [totalAreaSqft, setTotalAreaSqft] = useState<number>(25000);
  const [dgBackupRequired, setDgBackupRequired] = useState<boolean>(true);
  const [includeElvAutomation, setIncludeElvAutomation] = useState<boolean>(true);

  let wattsPerSqft = 8;
  if (buildingType === 'Industrial Factory') wattsPerSqft = 14;
  else if (buildingType === 'Residential G+3') wattsPerSqft = 6;
  else if (buildingType === 'Hospital / Data Center') wattsPerSqft = 22;

  const connectedLoadKW = Math.round((totalAreaSqft * wattsPerSqft) / 1000);
  const powerFactor = 0.92;
  const connectedLoadKVA = Math.round(connectedLoadKW / powerFactor);

  const standardRatings = [63, 100, 250, 500, 750, 1000, 1250, 1600, 2000, 2500];
  const targetKva = connectedLoadKVA * 1.25;
  const transformerRatingKVA = standardRatings.find(r => r >= targetKva) || 2500;
  const mainPanelCostINR = Math.round(transformerRatingKVA * 2400 + 180000);
  const wiringConduitCostINR = Math.round(totalAreaSqft * 65);
  const elvAutomationCostINR = includeElvAutomation ? Math.round(totalAreaSqft * 38 + 120000) : 0;
  const substationCivilCostINR = Math.round(transformerRatingKVA * 1800 + 250000);

  const totalEstimatedCostINR = mainPanelCostINR + wiringConduitCostINR + elvAutomationCostINR + substationCivilCostINR;

  const handleAddNewJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newWorkTitle) return;

    const newJob: ElectricalJobItem = {
      id: `JOB-EL-${Date.now()}`,
      clientName: newClientName,
      clientPhone: newClientPhone || '+91 98000 00000',
      location: newLocation || selectedCity,
      workType: newWorkType,
      workTitle: newWorkTitle,
      pointsCount: parseInt(newPointsCount) || 1,
      agreedPriceINR: parseFloat(newAgreedPrice) || 0,
      advancePaidINR: parseFloat(newAdvancePaid) || 0,
      status: 'Pending Quote',
      scheduledDate: new Date().toISOString().split('T')[0],
      details: newDetails || 'Electrical installation work as specified by client.'
    };

    setJobsList([newJob, ...jobsList]);
    setShowAddJobModal(false);
    setNewClientName('');
    setNewClientPhone('');
    setNewWorkTitle('');
    setNewDetails('');
  };

  const handleUpdateJobStatus = (id: string, newStatus: ElectricalJobItem['status']) => {
    setJobsList(prev => prev.map(j => j.id === id ? { ...j, status: newStatus } : j));
  };

  // Filtered jobs list
  const filteredJobs = jobsList.filter(job => {
    const matchType = selectedWorkType === 'all' || job.workType === selectedWorkType;
    const matchQuery = jobSearchQuery === '' ||
      job.clientName.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
      job.workTitle.toLowerCase().includes(jobSearchQuery.toLowerCase());
    return matchType && matchQuery;
  });

  // Calculate earnings metrics
  const totalEarnedINR = jobsList.filter(j => j.status === 'Completed' || j.status === 'Paid').reduce((sum, j) => sum + j.agreedPriceINR, 0);
  const pendingCollectionINR = jobsList.filter(j => j.status !== 'Paid').reduce((sum, j) => sum + (j.agreedPriceINR - j.advancePaidINR), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* TOP HEADER BANNER WITH STUDIO MODE TOGGLE */}
      <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-amber-500/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/30">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{isHi ? 'इलेक्ट्रीशियन वर्क एवं MEP इलेक्ट्रो-मेकेनिकल Hub' : 'Electrician Work & MEP Electro-Mechanical Hub'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isHi ? 'इलेक्ट्रीशियन डैशबोर्ड & वर्क ऑटोमेशन स्टूडियो' : 'Electrician Dashboard & Work Automation Studio'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isHi ? 'वायरिंग (Wiring), फ़िटिंग्स (Fitting), ग्राइंडिंग/अर्थिंग (Earthing/Grinding), डीबी पैनल (DB Panel), फ़ॉल्ट रिपेयर एवं सबस्टेशन लोडिंग का स्मार्ट प्रबंधन।' : 'Smart management of wiring, fitting, earthing, DB panels, fault repair, and substation load calculations.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="bg-black/40 p-1.5 rounded-2xl border border-white/20 flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              onClick={() => setActiveStudioMode('electrician_dashboard')}
              className={`px-4 py-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
                activeStudioMode === 'electrician_dashboard'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg font-black'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>⚡ {isHi ? 'इलेक्ट्रीशियन वर्क डैशबोर्ड (Electrician Work)' : 'Electrician Work Dashboard'}</span>
            </button>

            <button
              onClick={() => setActiveStudioMode('transformer_calculator')}
              className={`px-4 py-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
                activeStudioMode === 'transformer_calculator'
                  ? 'bg-indigo-600 text-white shadow-lg font-black'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>🏭 {isHi ? 'सबस्टेशन HT/LT लोड कैलकुलेटर' : 'Substation HT/LT Load Calculator'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODE 1: ELECTRICIAN WORK DASHBOARD */}
      {activeStudioMode === 'electrician_dashboard' && (
        <div className="space-y-8">

          {/* KPI CARDS: Earnings & Work Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">{isHi ? 'कुल पूरे किए काम' : 'Total Work Orders'}</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {jobsList.length} <span className="text-xs font-normal text-slate-400">Jobs</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> {jobsList.filter(j => j.status === 'Completed' || j.status === 'Paid').length} Completed
              </span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">{isHi ? 'कुल प्राप्त कमाई (Earned)' : 'Total Earnings'}</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{totalEarnedINR.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{isHi ? 'बैंक/कैश खाते में जमा' : 'Collected in Bank/Cash'}</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">{isHi ? 'बकाया पेमेंट (Pending)' : 'Pending Balance'}</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                ₹{pendingCollectionINR.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-amber-600 dark:text-amber-300 font-bold">{isHi ? 'वसूली योग्य बैलेंस' : 'To be collected'}</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">{isHi ? 'ग्राहक रेटिंग & बैज' : 'Client Rating & Badge'}</span>
              <div className="text-2xl font-black text-amber-500 flex items-center gap-1">
                ⭐ 4.9 <span className="text-xs text-slate-400 font-normal">(18 Reviews)</span>
              </div>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                Licensed MEP Electrician
              </span>
            </div>

          </div>

          {/* ELECTRICIAN RATE ESTIMATOR & QUOTATION CALCULATOR (रेट कार्ड) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="px-3 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black rounded-lg uppercase">
                  Instant Work Rate Calculator
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-500" />
                  {isHi ? 'इलेक्ट्रीशियन वर्क रेट कार्ड एवं तुरंत कोटेशन कैलकुलेटर' : 'Electrician Work Rate Card & Quotation Calculator'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isHi ? 'प्वाइंट wiring, स्विच बोर्ड, केमिकल अर्थिंग एवं कटिंग के हिसाब से कुल मजदूरी का तुरंत हिसाब लगाएं।' : 'Instantly compute labor charges based on point wiring, switch boards, earthing pits, and wall cutting.'}
                </p>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-2xl border border-amber-200 dark:border-amber-800 text-right">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block">{isHi ? 'अनुमानित कुल मजदूरी (Estimated Labor)' : 'Estimated Total Labor Cost'}</span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  ₹{estimatedWiringLaborINR.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Item 1: Points */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-extrabold text-slate-900 dark:text-white">
                  1. {isHi ? 'लाइट/फ़ैन प्वाइंट्स (Qty)' : 'Light/Fan Points (Qty)'}
                </label>
                <input
                  type="number"
                  value={calcPointsCount}
                  onChange={(e) => setCalcPointsCount(Number(e.target.value))}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{isHi ? 'दर (Rate):' : 'Rate:'} ₹{ratePerPoint}/{isHi ? 'प्वाइंट' : 'pt'}</span>
                  <span className="font-bold text-indigo-600">₹{(calcPointsCount * ratePerPoint).toLocaleString()}</span>
                </div>
              </div>

              {/* Item 2: Switch Boards */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-extrabold text-slate-900 dark:text-white">
                  2. {isHi ? 'मॉड्युलर स्विच बोर्ड (Qty)' : 'Modular Switchboards (Qty)'}
                </label>
                <input
                  type="number"
                  value={calcBoardsCount}
                  onChange={(e) => setCalcBoardsCount(Number(e.target.value))}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{isHi ? 'दर (Rate):' : 'Rate:'} ₹{ratePerBoard}/{isHi ? 'बोर्ड' : 'board'}</span>
                  <span className="font-bold text-indigo-600">₹{(calcBoardsCount * ratePerBoard).toLocaleString()}</span>
                </div>
              </div>

              {/* Item 3: Earthing Pits */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-extrabold text-slate-900 dark:text-white">
                  3. {isHi ? 'केमिकल अर्थिंग पिट (Pits)' : 'Chemical Earthing Pits (Pits)'}
                </label>
                <input
                  type="number"
                  value={calcEarthingPits}
                  onChange={(e) => setCalcEarthingPits(Number(e.target.value))}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{isHi ? 'दर (Rate):' : 'Rate:'} ₹{ratePerEarthingPit}/{isHi ? 'पिट' : 'pit'}</span>
                  <span className="font-bold text-indigo-600">₹{(calcEarthingPits * ratePerEarthingPit).toLocaleString()}</span>
                </div>
              </div>

              {/* Item 4: Wall Grinding / Cutting */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-extrabold text-slate-900 dark:text-white">
                  4. {isHi ? 'कटिंग/ग्राइंडिंग (Feet)' : 'Wall Cutting & Chipping (Feet)'}
                </label>
                <input
                  type="number"
                  value={calcWallCuttingFeet}
                  onChange={(e) => setCalcWallCuttingFeet(Number(e.target.value))}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{isHi ? 'दर (Rate):' : 'Rate:'} ₹{ratePerCuttingFoot}/{isHi ? 'फ़ीट' : 'ft'}</span>
                  <span className="font-bold text-indigo-600">₹{(calcWallCuttingFeet * ratePerCuttingFoot).toLocaleString()}</span>
                </div>
              </div>

              {/* Item 5: DB Panel Dressing */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-extrabold text-slate-900 dark:text-white">
                  5. {isHi ? 'MCB DB बॉक्स ड्रेसिंग (Sets)' : 'MCB DB Box Dressing (Sets)'}
                </label>
                <input
                  type="number"
                  value={calcDbPanels}
                  onChange={(e) => setCalcDbPanels(Number(e.target.value))}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{isHi ? 'दर (Rate):' : 'Rate:'} ₹{ratePerDbPanel}/{isHi ? 'सेट' : 'set'}</span>
                  <span className="font-bold text-indigo-600">₹{(calcDbPanels * ratePerDbPanel).toLocaleString()}</span>
                </div>
              </div>

            </div>
          </div>

          {/* WORK TYPE CATEGORIES & ACTIVE JOBS SECTION */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-500" />
                  {isHi ? 'इलेक्ट्रीशियन कार्य श्रेणियां एवं एक्टिव जॉब्स (Electrical Field Jobs)' : 'Electrical Field Jobs & Work Orders'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isHi ? 'कार्य के प्रकार के अनुसार फ़िल्टर करें - वायरिंग, फ़िटिंग्स, ग्राइंडिंग/अर्थिंग, डीबी पैनल एवं मेंटेनेंस।' : 'Filter by work type - wiring, fittings, earthing, DB panels & maintenance.'}
                </p>
              </div>

              <button
                onClick={() => setShowAddJobModal(true)}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{isHi ? 'नया काम / जॉब दर्ज करें (Add New Job)' : 'Add New Job'}</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <button
                  onClick={() => setSelectedWorkType('all')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    selectedWorkType === 'all'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isHi ? 'सभी काम (All Jobs)' : 'All Jobs'}
                </button>

                <button
                  onClick={() => setSelectedWorkType('wiring')}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                    selectedWorkType === 'wiring'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  🔌 1. {isHi ? 'वायरिंग (Wiring)' : 'Wiring'}
                </button>

                <button
                  onClick={() => setSelectedWorkType('fitting')}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                    selectedWorkType === 'fitting'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  🎛️ 2. {isHi ? 'फ़िटिंग्स & बोर्ड (Fitting)' : 'Fittings & Boards'}
                </button>

                <button
                  onClick={() => setSelectedWorkType('earthing')}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                    selectedWorkType === 'earthing'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  ⚡ 3. {isHi ? 'ग्राइंडिंग, अर्थिंग & DB' : 'Grinding, Earthing & DB'}
                </button>

                <button
                  onClick={() => setSelectedWorkType('lighting')}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                    selectedWorkType === 'lighting'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  💡 4. {isHi ? 'लाइटिंग फ़िटिंग्स (Lighting)' : 'Lighting Fittings'}
                </button>

                <button
                  onClick={() => setSelectedWorkType('maintenance')}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                    selectedWorkType === 'maintenance'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  🛠️ 5. {isHi ? 'फ़ॉल्ट रिपेयर (Maintenance)' : 'Fault Repair & Maintenance'}
                </button>
              </div>

              {/* Search Box */}
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={isHi ? 'क्लाइंट या स्थान खोजें...' : 'Search client or location...'}
                  value={jobSearchQuery}
                  onChange={(e) => setJobSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Jobs Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map(job => (
                <div key={job.id} className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        job.workType === 'wiring' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        job.workType === 'fitting' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                        job.workType === 'earthing' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                        job.workType === 'lighting' ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' :
                        'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {job.workType.toUpperCase()}
                      </span>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        job.status === 'Paid' ? 'bg-emerald-600 text-white' :
                        job.status === 'Completed' ? 'bg-blue-600 text-white' :
                        job.status === 'In Progress' ? 'bg-amber-500 text-slate-950 font-bold' :
                        'bg-slate-300 text-slate-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-2">
                        {job.workTitle}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        👤 {job.clientName} • 📍 {job.location}
                      </p>
                    </div>

                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                        {job.details}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Points/Units: {job.pointsCount} | Scheduled: {job.scheduledDate}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">AGREED RATE</span>
                        <span className="font-black text-amber-600 dark:text-amber-400 text-base">
                          ₹{job.agreedPriceINR.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-bold">ADVANCE PAID</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{job.advancePaidINR.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${job.clientPhone}`}
                        className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-[10px] rounded-xl transition flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>Call Client</span>
                      </a>

                      <select
                        value={job.status}
                        onChange={(e) => handleUpdateJobStatus(job.id, e.target.value as any)}
                        className="flex-1 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold"
                      >
                        <option value="Pending Quote">Pending Quote</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Paid">Paid / Received</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* MODE 2: SUBSTATION & HT/LT TRANSFORMER CALCULATOR (EXiSTING COMPONENT) */}
      {activeStudioMode === 'transformer_calculator' && (
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Inputs */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                <Settings2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-bold text-base text-slate-900 dark:text-white">{isHi ? 'सुविधा एवं लोड पैरामीटर्स (Facility & Load Parameters)' : 'Facility & Load Parameters'}</h2>
              </div>

              <div className="space-y-4 text-xs">
                
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{isHi ? 'भवन का प्रकार (Building Type)' : 'Building Occupancy Type'}</label>
                  <select
                    value={buildingType}
                    onChange={(e) => setBuildingType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="Commercial Complex">{isHi ? 'कमर्शियल ऑफिस कॉम्प्लेक्स (8 W/sqft)' : 'Commercial Office Complex (8 W/sqft)'}</option>
                    <option value="Industrial Factory">{isHi ? 'इंडस्ट्रियल मैन्युफैक्चरिंग फैक्टरी (14 W/sqft)' : 'Industrial Manufacturing Factory (14 W/sqft)'}</option>
                    <option value="Residential G+3">{isHi ? 'रेजिडेंशियल अपार्टमेंट G+3/G+4 (6 W/sqft)' : 'Residential Apartment G+3/G+4 (6 W/sqft)'}</option>
                    <option value="Hospital / Data Center">{isHi ? 'अस्पताल / डेटा सेंटर (22 W/sqft)' : 'Hospital / Data Center (22 W/sqft High Density)'}</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">{isHi ? 'कुल निर्मित क्षेत्रफल:' : 'Total Builtup Floor Area:'}</label>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{totalAreaSqft.toLocaleString()} sqft</span>
                  </div>
                  <input
                    type="range"
                    min="2000"
                    max="150000"
                    step="1000"
                    value={totalAreaSqft}
                    onChange={(e) => setTotalAreaSqft(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dgBackupRequired}
                      onChange={(e) => setDgBackupRequired(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{isHi ? '100% AMF डीजल जनरेटर (DG) बैकअप शामिल करें' : 'Include 100% AMF Diesel Generator (DG) Backup'}</span>
                  </label>

                  <label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeElvAutomation}
                      onChange={(e) => setIncludeElvAutomation(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{isHi ? 'ELV इलेक्ट्रॉनिक्स (CCTV, फ़ायर अलार्म & BMS IoT) शामिल करें' : 'Include ELV Electronics (CCTV, Fire Alarm & BMS IoT)'}</span>
                  </label>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>{selectedCity} {isHi ? 'डिस्कॉम ग्रिड नियम:' : 'DISCOM Grid Compliance:'}</span>
                  </div>
                  <p>{isHi ? '100 kVA से ऊपर HT 11kV कनेक्शन अनिवार्य है। पेनल्टी से बचने हेतु APFC पैनल आवश्यक है।' : 'HT 11kV connection mandatory above 100 kVA load. APFC panel required to maintain 0.99 PF & prevent penalty surcharges.'}</p>
                </div>

              </div>
            </div>

            {/* Right Output */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-500">{isHi ? 'कनेक्टेड डिमांड' : 'Connected Demand'}</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {connectedLoadKVA} <span className="text-xs font-semibold text-indigo-600">kVA</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{connectedLoadKW} kW Peak Power</div>
                </div>

                <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-500">{isHi ? 'सबस्टेशन रेटिंग' : 'Substation Rating'}</div>
                  <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                    {transformerRatingKVA} <span className="text-xs font-semibold">kVA</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">HT/LT Transformer</div>
                </div>

                <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-semibold text-slate-500">{isHi ? 'टर्नकी MEP अनुमान' : 'Turnkey MEP Estimate'}</div>
                  <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                    ₹{(totalEstimatedCostINR / 100000).toFixed(2)} <span className="text-xs font-semibold">{isHi ? 'लाख' : 'Lakhs'}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Supply, Cabling &amp; ELV</div>
                </div>
              </div>

              {/* Footer Call to Action */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <div className="font-bold text-sm">{isHi ? 'क्लास-A इलेक्ट्रीशियन ठेकेदार की आवश्यकता है?' : 'Need a Class-A Electrical Contractor?'}</div>
                  <p className="text-xs text-slate-400">
                    {isHi ? 'लाइसेंस प्राप्त MEP वेंडरों को टेंडर हेतु आमंत्रित करें एवं डिजिटल अनुबंध करें।' : 'Invite licensed MEP vendors for competitive tenders and sign digitally bound contracts.'}
                  </p>
                </div>
                <button
                  onClick={() => onNavigateToVendors && onNavigateToVendors('Electrical & ELV')}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs whitespace-nowrap transition shadow-md"
                >
                  {isHi ? 'MEP वेंडर टेंडर जारी करें' : 'Issue MEP Vendor Tender'}
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* MODAL: ADD NEW ELECTRICAL JOB */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-500" />
                {isHi ? 'नया इलेक्ट्रीशियन वर्क / जॉब जोड़ें' : 'Add New Electrical Work Order / Job'}
              </h3>
              <button
                onClick={() => setShowAddJobModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewJob} className="space-y-3 text-xs">
              
              <div>
                <label className="block font-bold mb-1">{isHi ? 'ग्राहक / क्लाइंट नाम *' : 'Client / Customer Name *'}</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder={isHi ? 'उदा. Ramesh Chandra (Mishra ji)' : 'e.g. Ramesh Chandra'}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">{isHi ? 'मोबाइल नंबर' : 'Phone Number'}</label>
                  <input
                    type="text"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">{isHi ? 'स्थान / ज़िला' : 'Location / City'}</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">{isHi ? 'काम की श्रेणी (Work Category) *' : 'Work Category *'}</label>
                <select
                  value={newWorkType}
                  onChange={(e) => setNewWorkType(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  <option value="wiring">🔌 Wiring ({isHi ? 'हाउस एवं इंडस्ट्रियल वायरिंग' : 'House & Industrial Wiring'})</option>
                  <option value="fitting">🎛️ Fitting ({isHi ? 'स्विच बोर्ड & MCB फ़िटिंग्स' : 'Switchboard & MCB Fittings'})</option>
                  <option value="earthing">⚡ Earthing &amp; DB ({isHi ? 'केमिकल अर्थिंग & पैनल' : 'Chemical Earthing & Panel'})</option>
                  <option value="lighting">💡 Lighting ({isHi ? 'एलईडी प्रोफ़ाइल & फ़ैंसी लाइटिंग' : 'LED Profile & Decorative Lighting'})</option>
                  <option value="maintenance">🛠️ Maintenance ({isHi ? 'फ़ॉल्ट रिपेयर & नाइटकॉल' : 'Fault Repair & Breakdown'})</option>
                  <option value="testing">📋 Inspection ({isHi ? 'मेगर टेस्ट & लोड ऑडिट' : 'Megger Testing & Load Audit'})</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">{isHi ? 'काम का विवरण (Work Title) *' : 'Work Title *'}</label>
                <input
                  type="text"
                  required
                  value={newWorkTitle}
                  onChange={(e) => setNewWorkTitle(e.target.value)}
                  placeholder="e.g. 3BHK Concealed Pipe Wiring & MCB Fitting"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold mb-1">{isHi ? 'कुल प्वाइंट्स' : 'Total Points'}</label>
                  <input
                    type="number"
                    value={newPointsCount}
                    onChange={(e) => setNewPointsCount(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">{isHi ? 'तय रेट (₹)' : 'Agreed Rate (₹)'}</label>
                  <input
                    type="number"
                    value={newAgreedPrice}
                    onChange={(e) => setNewAgreedPrice(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">{isHi ? 'एडवांस (₹)' : 'Advance (₹)'}</label>
                  <input
                    type="number"
                    value={newAdvancePaid}
                    onChange={(e) => setNewAdvancePaid(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">{isHi ? 'अतिरिक्त नोट्स / विवरण' : 'Additional Notes / Details'}</label>
                <textarea
                  rows={2}
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder={isHi ? 'तार की मोटाई, स्विच ब्रांड एवं विशेष निर्देश...' : 'Wire gauge, switch brand, special instructions...'}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddJobModal(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md"
                >
                  {isHi ? 'काम जोड़ें (Save Job)' : 'Save Job'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
