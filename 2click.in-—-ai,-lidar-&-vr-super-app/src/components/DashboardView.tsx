import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  Clock, 
  FileCheck, 
  Upload, 
  Building2, 
  Sun, 
  Compass, 
  Maximize2,
  Users,
  TrendingUp,
  IndianRupee,
  PieChart as PieChartIcon,
  BarChart3,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Share2,
  Copy,
  MessageSquare,
  Eye,
  Store,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShoppingBag,
  Trash2,
  Phone,
  QrCode,
  BadgeCheck,
  Sliders,
  Lock
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { SAMPLE_PROJECTS } from '../data/initialData';
import { Project, User, UserShareSettings } from '../types';
import { PublicUserShowcaseModal } from './PublicUserShowcaseModal';
import { PERMISSION_MODULE_DEFINITIONS, getDefaultPermissionsForRole } from './UserPermissionModal';
import { MaterialServicesCategoryGrid } from './MaterialServicesCategoryGrid';
import { FinancialAnalyticsView } from './FinancialAnalyticsView';
import { ProjectGanttTimelineView } from './ProjectGanttTimelineView';
import { ProjectRoiProjectionView } from './ProjectRoiProjectionView';
import { logAnalyticsEvent } from '../lib/firebase';

interface DashboardViewProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  selectedDashboardPreset?: string;
  selectedLanguage?: string;
}

// Historical spending trend mock data (amounts in ₹ Lakhs)
const ALL_COST_TREND_DATA = [
  { month: 'Oct 2025', construction: 28.5, solar: 4.2, interior: 12.0, lidar: 2.1, total: 46.8, budget: 50.0 },
  { month: 'Nov 2025', construction: 32.0, solar: 5.5, interior: 14.5, lidar: 2.8, total: 54.8, budget: 55.0 },
  { month: 'Dec 2025', construction: 38.5, solar: 7.0, interior: 18.0, lidar: 3.2, total: 66.7, budget: 65.0 },
  { month: 'Jan 2026', construction: 35.0, solar: 6.8, interior: 16.5, lidar: 3.0, total: 61.3, budget: 62.0 },
  { month: 'Feb 2026', construction: 42.8, solar: 8.5, interior: 22.0, lidar: 3.8, total: 77.1, budget: 75.0 },
  { month: 'Mar 2026', construction: 48.5, solar: 10.2, interior: 25.5, lidar: 4.5, total: 88.7, budget: 85.0 },
  { month: 'Apr 2026', construction: 44.0, solar: 9.8, interior: 23.0, lidar: 4.0, total: 80.8, budget: 82.0 },
  { month: 'May 2026', construction: 52.5, solar: 12.0, interior: 28.5, lidar: 5.2, total: 98.2, budget: 95.0 },
  { month: 'Jun 2026', construction: 49.0, solar: 11.5, interior: 26.0, lidar: 4.8, total: 91.3, budget: 90.0 },
  { month: 'Jul 2026', construction: 56.2, solar: 14.0, interior: 31.0, lidar: 5.8, total: 107.0, budget: 100.0 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-xl text-xs text-slate-100 backdrop-blur-md">
        <p className="font-bold border-b border-slate-700 pb-1 mb-2 text-teal-400">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex justify-between items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white">₹{Number(entry.value).toFixed(1)} Lakhs</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  currentUser, 
  onOpenAuth,
  selectedDashboardPreset = 'executive',
  selectedLanguage = 'hi'
}) => {
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewProjectModal, setShowNewProjectModal] = useState<boolean>(false);

  // Active Main Tab on Dashboard
  const [activeDashTab, setActiveDashTab] = useState<'overview' | 'gantt_timeline' | 'roi_projections' | 'financial_analytics' | 'my_products' | 'privacy_controls'>('overview');

  // Active User State
  const activeUser: User = currentUser || {
    id: 'USR-101',
    name: 'Ramesh Hardware & Cement Mart',
    email: 'ramesh.cement@2click.in',
    phone: '+91 70072 54932',
    role: 'Dukandar',
    district: 'Lucknow',
    companyName: 'Ramesh Hardware & Wholesale Building Materials',
    isKycVerified: true,
    gstinNumber: '07AAACR1234F1Z9',
    rating: 4.9,
    status: 'Active'
  };

  const userPermissions = activeUser.permissions || getDefaultPermissionsForRole(activeUser.role);

  // User Privacy & Visibility Share Settings State
  const [shareSettings, setShareSettings] = useState<UserShareSettings>(() => {
    return activeUser.shareSettings || {
      showProducts: true,
      showPrices: true,
      showContactPhone: true,
      showAddressLocation: true,
      showKhataQrPayment: true,
      showRatingReviews: true,
      showGstin: true,
      headlineMessage: 'अल्ट्राटेक सीमेंट एवं टाटा स्टील अधिकृत डीलर - विशेष डिस्काउंट हेतु संपर्क करें'
    };
  });

  // User Products Catalog State
  const [userProducts, setUserProducts] = useState<Array<{
    id: string;
    title: string;
    category: string;
    priceINR: number;
    unit: string;
    imageUrl: string;
    inStock: boolean;
    description: string;
  }>>([
    {
      id: 'P-1',
      title: 'Ultratech Cement (PPC 50kg Bag)',
      category: 'Cement',
      priceINR: 380,
      unit: 'Bag',
      imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
      inStock: true,
      description: 'High performance cement for slab casting & foundation work.'
    },
    {
      id: 'P-2',
      title: 'Tata Tiscon Fe550D TMT Steel Bars (12mm)',
      category: 'Steel TMT',
      priceINR: 62000,
      unit: 'Ton',
      imageUrl: 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=600&q=80',
      inStock: true,
      description: 'Earthquake resistant Fe550D ductile TMT rebar.'
    },
    {
      id: 'P-3',
      title: 'Red Clay Bricks (1st Class Quality)',
      category: 'Bricks & Masonry',
      priceINR: 8,
      unit: 'Piece',
      imageUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80',
      inStock: true,
      description: 'Standard kiln burned 1st class red clay construction bricks.'
    }
  ]);

  // Public Preview Modal State
  const [showPublicPreviewModal, setShowPublicPreviewModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // New Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Building Materials');
  const [newProdPrice, setNewProdPrice] = useState('380');
  const [newProdUnit, setNewProdUnit] = useState('Bag');
  const [newProdImg, setNewProdImg] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');

  // Chart options state
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');
  const [timeRange, setTimeRange] = useState<'6m' | '1y'>('1y');

  // New project form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'construction' | 'solar' | 'interior' | 'lidar'>('construction');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [newBudget, setNewBudget] = useState(2500000);

  const shareableUrl = `${window.location.origin}/?shareUser=${activeUser.id}`;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    logAnalyticsEvent('profile_link_copied', {
      user_id: activeUser.id,
      company_name: activeUser.companyName
    });
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleWhatsAppShare = () => {
    const text = `नमस्ते! यह हमारा 2Click डिजिटल स्टोर / डैशबोर्ड लिंक है। हमारे प्रोडक्ट्स एवं सेवाएं देखने के लिए नीचे दिए गए लिंक पर क्लिक करें:\n\n${shareableUrl}\n\n-${activeUser.companyName || activeUser.name}`;
    logAnalyticsEvent('profile_whatsapp_shared', {
      user_id: activeUser.id,
      company_name: activeUser.companyName
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const toggleShareSetting = (key: keyof UserShareSettings) => {
    setShareSettings(prev => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key]
    }));
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdTitle) return;

    const newProd = {
      id: `P-${Date.now()}`,
      title: newProdTitle,
      category: newProdCategory,
      priceINR: parseFloat(newProdPrice) || 0,
      unit: newProdUnit,
      imageUrl: newProdImg || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
      inStock: true,
      description: newProdDesc || 'High quality material direct from vendor.'
    };

    setUserProducts([newProd, ...userProducts]);
    logAnalyticsEvent('product_added_to_catalog', {
      product_id: newProd.id,
      title: newProdTitle,
      category: newProdCategory,
      price_inr: newProd.priceINR
    });

    setShowAddProductModal(false);
    setNewProdTitle('');
    setNewProdDesc('');
  };

  const toggleProductStock = (id: string) => {
    setUserProducts(prev => prev.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p));
  };

  const deleteProduct = (id: string) => {
    setUserProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleDashTabSwitch = (tab: 'overview' | 'gantt_timeline' | 'roi_projections' | 'financial_analytics' | 'my_products' | 'privacy_controls') => {
    setActiveDashTab(tab);
    logAnalyticsEvent('dashboard_tab_switched', {
      tab_name: tab,
      user_role: activeUser.role
    });
  };

  const handleFilterChange = (filterName: string) => {
    setActiveFilter(filterName);
    logAnalyticsEvent('project_filter_applied', {
      filter_name: filterName
    });
  };

  const filteredProjects = projects.filter(p => {
    const matchesFilter = activeFilter === 'All' || p.status === activeFilter;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const chartData = timeRange === '6m' ? ALL_COST_TREND_DATA.slice(-6) : ALL_COST_TREND_DATA;

  const totalSpentYTD = chartData.reduce((acc, d) => acc + d.total, 0);
  const avgMonthlySpend = totalSpentYTD / chartData.length;
  const lastMonthSpend = chartData[chartData.length - 1].total;
  const prevMonthSpend = chartData[chartData.length - 2].total;
  const monthOverMonthChange = ((lastMonthSpend - prevMonthSpend) / prevMonthSpend) * 100;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const proj: Project = {
      id: `PRJ-2026-0${projects.length + 1}`,
      title: newTitle,
      clientName: currentUser ? currentUser.name : 'New Client',
      category: newCategory,
      city: newCity,
      status: 'In Survey',
      progressPercentage: 10,
      budgetEstimatedINR: Number(newBudget),
      startDate: new Date().toISOString().split('T')[0],
      expectedCompletion: '2026-12-31'
    };

    setProjects([proj, ...projects]);
    logAnalyticsEvent('project_created', {
      project_id: proj.id,
      title: proj.title,
      category: proj.category,
      city: proj.city,
      budget_estimated_inr: proj.budgetEstimatedINR,
      initial_progress: proj.progressPercentage
    });

    setShowNewProjectModal(false);
    setNewTitle('');
    alert('Project created successfully on 2click Super App dashboard!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* USER PERSONAL DASHBOARD HEADER BANNER */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-2xl font-black text-teal-300 shrink-0 shadow-lg">
              <Store className="w-8 h-8 text-teal-400" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 bg-teal-400/20 text-teal-300 border border-teal-400/30 rounded-lg text-[10px] font-extrabold uppercase">
                  {activeUser.role} Dashboard
                </span>
                {activeUser.isKycVerified && (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-lg text-[10px] font-extrabold flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3 text-emerald-400" /> KYC Verified
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {activeUser.companyName || activeUser.name}
              </h1>

              <p className="text-xs text-slate-300 flex items-center gap-3">
                <span>📍 {activeUser.district || activeUser.city || 'India'}</span>
                <span>•</span>
                <span>📞 {activeUser.phone}</span>
              </p>
            </div>
          </div>

          {/* Quick Share Link Control Box */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 space-y-2 shrink-0 max-w-md">
            <span className="text-[11px] font-black text-amber-300 uppercase block flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5" /> आपका शेयर करने योग्य डिजिटल प्रोफाइल/स्टोर लिंक
            </span>

            <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/10 text-xs">
              <span className="font-mono text-[10px] text-teal-300 truncate max-w-[200px] px-2">
                {shareableUrl}
              </span>

              <button
                onClick={handleCopyShareLink}
                className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-[10px] rounded-lg transition shrink-0 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg transition shrink-0 flex items-center gap-1"
              >
                <MessageSquare className="w-3 h-3" />
                <span>WhatsApp</span>
              </button>
            </div>

            <button
              onClick={() => setShowPublicPreviewModal(true)}
              className="w-full py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>👁️ देखें कि ग्राहक को क्या दिखेगा (Preview Public View)</span>
            </button>
          </div>
        </div>

        {/* Dashboard Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-slate-800">
          <button
            onClick={() => handleDashTabSwitch('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeDashTab === 'overview'
                ? 'bg-teal-600 text-white shadow-lg'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>📊 ओवरव्यू (Projects Overview)</span>
          </button>

          <button
            onClick={() => handleDashTabSwitch('gantt_timeline')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeDashTab === 'gantt_timeline'
                ? 'bg-teal-600 text-white shadow-lg'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>📅 गंट टाइमलाइन (Gantt Timeline Chart)</span>
          </button>

          <button
            onClick={() => handleDashTabSwitch('roi_projections')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeDashTab === 'roi_projections'
                ? 'bg-teal-600 text-white shadow-lg'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>📈 प्रोजेक्ट ROI प्रोजेक्शन (Project ROI)</span>
          </button>

          <button
            onClick={() => handleDashTabSwitch('financial_analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeDashTab === 'financial_analytics'
                ? 'bg-teal-600 text-white shadow-lg'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>💳 फाइनेंस &amp; लेजर (Financial Analytics)</span>
          </button>

          <button
            onClick={() => handleDashTabSwitch('my_products')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeDashTab === 'my_products'
                ? 'bg-teal-600 text-white shadow-lg'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>🛍️ मेरे प्रोडक्ट्स एवं रेट लिस्ट (My Products - {userProducts.length})</span>
          </button>

          <button
            onClick={() => handleDashTabSwitch('privacy_controls')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeDashTab === 'privacy_controls'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>⚙️ क्या दिखाना है? (Custom Share Link Controls)</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD TAB: GANTT TIMELINE VIEW */}
      {activeDashTab === 'gantt_timeline' && (
        <ProjectGanttTimelineView currentUser={currentUser} projects={projects} />
      )}

      {/* DASHBOARD TAB: PROJECT ROI PROJECTION VIEW */}
      {activeDashTab === 'roi_projections' && (
        <ProjectRoiProjectionView currentUser={currentUser} />
      )}

      {/* DASHBOARD TAB: FINANCIAL ANALYTICS VIEW */}
      {activeDashTab === 'financial_analytics' && (
        <FinancialAnalyticsView currentUser={currentUser} />
      )}

      {/* DASHBOARD TAB 1: PRIVACY & VISIBILITY CONTROLS ("क्या दिखाना है?") */}
      {activeDashTab === 'privacy_controls' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div>
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black rounded-lg">
              गोपनीयता एवं शेयर लिंक नियंत्रण (Share Link Privacy Settings)
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-2">
              कंट्रोल करें कि जब आप किसी को अपना डैशबोर्ड/लिंक भेजें तो उसे क्या-क्या दिखाई दे
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              आप नीचे दिए गए विकल्पों में से जिसे ON रखेंगे, वही जानकारी आपके सार्वजनिक लिंक खोलने वाले ग्राहक या वेंडर को दिखाई देगी।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Toggle 1: Show Products */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                  🛍️ मेरे प्रोडक्ट्स एवं कैटलॉग दिखाएं (Show Product Catalog)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  ग्राहक आपके अपलोड किए गए सामान की सूची देख सकेंगे।
                </span>
              </div>
              <button
                onClick={() => toggleShareSetting('showProducts')}
                className={`p-1.5 rounded-xl font-black text-xs transition flex items-center gap-1 ${
                  shareSettings.showProducts
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {shareSettings.showProducts ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                <span>{shareSettings.showProducts ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Toggle 2: Show Rates */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                  🏷️ सामग्री के रेट/दाम सार्वजनिक करें (Show Prices &amp; Rates)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  OFF करने पर ग्राहक को "Call for Rate" दिखेगा।
                </span>
              </div>
              <button
                onClick={() => toggleShareSetting('showPrices')}
                className={`p-1.5 rounded-xl font-black text-xs transition flex items-center gap-1 ${
                  shareSettings.showPrices
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {shareSettings.showPrices ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                <span>{shareSettings.showPrices ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Toggle 3: Show Contact Phone */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                  📞 मोबाइल एवं व्हाट्सएप संपर्क (Show Phone &amp; WhatsApp)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  ग्राहक सीधे कॉल या व्हाट्सएप पर इंक्वायरी कर सकेंगे।
                </span>
              </div>
              <button
                onClick={() => toggleShareSetting('showContactPhone')}
                className={`p-1.5 rounded-xl font-black text-xs transition flex items-center gap-1 ${
                  shareSettings.showContactPhone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {shareSettings.showContactPhone ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                <span>{shareSettings.showContactPhone ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Toggle 4: Show Address */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                  📍 दुकान/ऑफिस पता एवं शहर (Show Location &amp; Address)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  शहर एवं जिले की जानकारी लिंक में दिखाई देगी।
                </span>
              </div>
              <button
                onClick={() => toggleShareSetting('showAddressLocation')}
                className={`p-1.5 rounded-xl font-black text-xs transition flex items-center gap-1 ${
                  shareSettings.showAddressLocation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {shareSettings.showAddressLocation ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                <span>{shareSettings.showAddressLocation ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Toggle 5: Show UPI Payment QR */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                  💳 UPI / PhonePe स्कैनर पेमेंट बॉक्स (Show QR Payment Scanner)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  ग्राहक आपको सीधे ऑनलाइन पेमेंट ट्रांसफर कर सकेंगे।
                </span>
              </div>
              <button
                onClick={() => toggleShareSetting('showKhataQrPayment')}
                className={`p-1.5 rounded-xl font-black text-xs transition flex items-center gap-1 ${
                  shareSettings.showKhataQrPayment
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {shareSettings.showKhataQrPayment ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                <span>{shareSettings.showKhataQrPayment ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Toggle 6: Show GSTIN */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                  🏢 जीएसटी नंबर एवं लाइसेंस (Show GSTIN Number)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  कॉर्पोरेट एवं सरकारी टेंडर क्लाइंट्स हेतु जीएसटीिन दिखाएं।
                </span>
              </div>
              <button
                onClick={() => toggleShareSetting('showGstin')}
                className={`p-1.5 rounded-xl font-black text-xs transition flex items-center gap-1 ${
                  shareSettings.showGstin
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {shareSettings.showGstin ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                <span>{shareSettings.showGstin ? 'ON' : 'OFF'}</span>
              </button>
            </div>

          </div>

          {/* Headline Text Setting */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="block font-black text-xs text-slate-900 dark:text-white">
              कस्टम मैसेज / टैगलाइन (Custom Headline Banner for Shared Link)
            </label>
            <input
              type="text"
              value={shareSettings.headlineMessage || ''}
              onChange={(e) => setShareSettings({ ...shareSettings, headlineMessage: e.target.value })}
              placeholder="e.g. अल्ट्राटेक सीमेंट एवं टाटा स्टील अधिकृत डीलर - थोक रेट हेतु कॉल करें"
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => alert('Visibility Settings Saved Successfully!')}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-2xl shadow-md transition"
            >
              सेटिंग्स सेव करें (Save Privacy Controls)
            </button>

            <button
              onClick={() => setShowPublicPreviewModal(true)}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-md transition flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>पब्लिक व्यू प्रीव्यू देखें (Test Public Link)</span>
            </button>
          </div>
        </div>
      )}

      {/* DASHBOARD TAB 2: MY PRODUCTS MANAGER */}
      {activeDashTab === 'my_products' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-teal-600" />
                मेरे सामान एवं सेवाओं का कैटलॉग (My Product Catalog)
              </h2>
              <p className="text-xs text-slate-500">
                यहाँ अपने नए सामान जोड़ें, दाम सेट करें एवं इन-स्टॉक स्टेटस टॉगल करें।
              </p>
            </div>

            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>नया प्रोडक्ट जोड़ें (Add Product)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userProducts.map((p) => (
              <div key={p.id} className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-36 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden relative">
                    <img src={p.imageUrl} alt={p.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <span className={`absolute top-2 left-2 px-2 py-0.5 font-extrabold text-[10px] rounded-md text-white ${p.inStock ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                    {p.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">RATE</span>
                    <span className="text-base font-black text-teal-600 dark:text-teal-400">
                      ₹{p.priceINR.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-slate-500">/{p.unit}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleProductStock(p.id)}
                      className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition ${
                        p.inStock ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {p.inStock ? 'Mark Out' : 'Mark In'}
                    </button>

                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-lg transition"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DASHBOARD TAB 0: ENTERPRISE OVERVIEW & COST ANALYTICS */}
      {activeDashTab === 'overview' && (
        <div className="space-y-8">
            
            {/* INTERACTIVE MATERIAL & SERVICES CATEGORY EXPLORER */}
            <MaterialServicesCategoryGrid currentUser={currentUser} onOpenAuth={onOpenAuth} />
            
            {/* USER-WISE AUTHORIZED DASHBOARD MODULES LAUNCHER */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 border border-indigo-500/30 text-white space-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      Super Admin Customized User Access
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-lg text-[10px] font-black uppercase">
                      User ID: {activeUser.id}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-400" />
                    आपके लिए विशेष अधिकृत टूल एवं डैशबोर्ड सेवाएं (Authorized Modules)
                  </h2>
                  <p className="text-xs text-slate-300">
                    सुपर एडमिन द्वारा आपके खाते ({activeUser.name}) के लिए कस्टमाइज्ड किए गए डैशबोर्ड टूल्स एवं अनुमतियां
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/20 text-right shrink-0">
                  <span className="text-[10px] text-indigo-200 uppercase font-black block">Role Access Level</span>
                  <span className="text-sm font-black text-teal-300">{activeUser.role}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-2 relative z-10">
                {PERMISSION_MODULE_DEFINITIONS.map((mod) => {
                  const isAllowed = userPermissions[mod.key] ?? true;
                  const IconComp = mod.icon;

                  return (
                    <div
                      key={mod.key}
                      className={`p-3.5 rounded-2xl border transition flex flex-col justify-between space-y-2.5 ${
                        isAllowed
                          ? 'bg-white/10 hover:bg-white/20 border-indigo-400/40 text-white shadow-md'
                          : 'bg-black/40 border-white/5 text-slate-500 opacity-40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className={`p-2 rounded-xl border ${
                          isAllowed 
                            ? 'bg-indigo-600 text-white border-indigo-400' 
                            : 'bg-slate-800 text-slate-600 border-slate-700'
                        }`}>
                          <IconComp className="w-4 h-4" />
                        </div>

                        <span className={`px-2 py-0.5 text-[9px] font-black rounded-md flex items-center gap-1 ${
                          isAllowed 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}>
                          {isAllowed ? <BadgeCheck className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3" />}
                          <span>{isAllowed ? 'AVAILABLE' : 'LOCKED'}</span>
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] font-extrabold uppercase text-indigo-300 block tracking-wider">
                          {mod.category}
                        </span>
                        <h4 className="font-extrabold text-xs text-slate-100 leading-snug truncate">
                          {mod.label}
                        </h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {mod.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                  <FolderKanban className="w-5 h-5" />
                </span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Enterprise Projects &amp; Cost Analytics</h1>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Manage LiDAR surveys, civil BOQs, solar installations, interior budgets and spending trends in real-time.
              </p>
            </div>

            <button
              onClick={() => {
                if (!currentUser) onOpenAuth();
                else setShowNewProjectModal(true);
              }}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Create New Project
            </button>
          </div>

          {/* Cost Trend Analysis Card (Recharts) */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
            
            {/* Analytics Header & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Historical Project Cost &amp; Spending Trends</h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Track monthly billing variances across Civil, Solar, Interior &amp; LiDAR operations in ₹ Lakhs.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setTimeRange('6m')}
                    className={`px-3 py-1 rounded-lg transition ${
                      timeRange === '6m'
                        ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Last 6 Months
                  </button>
                  <button
                    onClick={() => setTimeRange('1y')}
                    className={`px-3 py-1 rounded-lg transition ${
                      timeRange === '1y'
                        ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    FY 2025–26
                  </button>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setChartType('area')}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition ${
                      chartType === 'area'
                        ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Cumulative Stacked Area"
                  >
                    <Layers className="w-3.5 h-3.5" /> Stacked Area
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition ${
                      chartType === 'bar'
                        ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Category Breakdown Bar Chart"
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> Sector Bar
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition ${
                      chartType === 'line'
                        ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Budget vs Actual Variance Line Chart"
                  >
                    <TrendingUp className="w-3.5 h-3.5" /> Budget vs Actual
                  </button>
                </div>
              </div>
            </div>

            {/* Quick KPI Summary Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Spending ({timeRange})</div>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  ₹{(totalSpentYTD / 100).toFixed(2)} Cr
                </div>
                <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium flex items-center gap-1 mt-0.5">
                  <ArrowUpRight className="w-3 h-3" /> Cumulative billing
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Avg Monthly Run Rate</div>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  ₹{avgMonthlySpend.toFixed(1)} Lakhs
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5"> Across 4 engineering sectors</div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">MoM Growth Rate</div>
                <div className={`text-lg font-extrabold mt-1 flex items-center gap-1 ${
                  monthOverMonthChange >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {monthOverMonthChange >= 0 ? '+' : ''}{monthOverMonthChange.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5"> Jul 2026 vs Jun 2026</div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Budget Compliance</div>
                <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  96.8%
                </div>
                <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-medium mt-0.5"> Within CPWD tolerance</div>
              </div>
            </div>

            {/* Recharts Render Container */}
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorConstruction" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorInterior" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorLidar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit="L" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                    <Area type="monotone" dataKey="construction" name="Civil Construction" stackId="1" stroke="#0d9488" fill="url(#colorConstruction)" />
                    <Area type="monotone" dataKey="interior" name="Interior Studio" stackId="1" stroke="#6366f1" fill="url(#colorInterior)" />
                    <Area type="monotone" dataKey="solar" name="Rooftop Solar" stackId="1" stroke="#f59e0b" fill="url(#colorSolar)" />
                    <Area type="monotone" dataKey="lidar" name="LiDAR Topo Survey" stackId="1" stroke="#06b6d4" fill="url(#colorLidar)" />
                  </AreaChart>
                ) : chartType === 'bar' ? (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit="L" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                    <Bar dataKey="construction" name="Civil Construction" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="interior" name="Interior Studio" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="solar" name="Rooftop Solar" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lidar" name="LiDAR Topo Survey" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit="L" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                    <Line type="monotone" dataKey="total" name="Actual Total Spending" stroke="#0d9488" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="budget" name="Approved Target Budget" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects or clients..."
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium w-full sm:w-64"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {['All', 'In Survey', 'Estimation', 'Under Execution', 'Completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setActiveFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    activeFilter === st
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{proj.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      proj.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      proj.status === 'Under Execution' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                    }`}>
                      {proj.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5">{proj.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Client: {proj.clientName}</p>

                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-3">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span>{proj.city}</span>
                    <span className="text-slate-300">|</span>
                    <span className="capitalize font-semibold text-slate-800 dark:text-slate-200">{proj.category}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">Execution Completion</span>
                      <span className="text-teal-600 dark:text-teal-400 font-bold">{proj.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${proj.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">Budget Estimate</div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        ₹{(proj.budgetEstimatedINR / 100000).toFixed(2)} Lakhs
                      </div>
                    </div>

                    <button
                      onClick={() => alert(`Opening full project report for ${proj.title}...`)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg font-bold text-xs transition"
                    >
                      View Details
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-base text-slate-900 dark:text-white">नया प्रोडक्ट या सर्विस जोड़ें</h3>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">सामग्री का नाम (Title)</label>
                <input
                  type="text"
                  required
                  value={newProdTitle}
                  onChange={(e) => setNewProdTitle(e.target.value)}
                  placeholder="e.g. UltraTech Weather Plus Cement"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">कैटेगरी</label>
                  <input
                    type="text"
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">यूनिट (Unit)</label>
                  <input
                    type="text"
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    placeholder="Bag, Ton, Sqft..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">दाम (Rate INR ₹)</label>
                <input
                  type="number"
                  required
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">विवरण (Description)</label>
                <textarea
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="सामग्री की विशेषताएं..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
                >
                  प्रोडक्ट सेव करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW PROJECT MODAL */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 fade-in">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Create New 2click Project</h3>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Whitefield G+3 Residential Construction"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="construction">Civil Construction</option>
                  <option value="solar">Rooftop Solar Plant</option>
                  <option value="interior">Interior Architecture</option>
                  <option value="lidar">LiDAR Topo Survey</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Budget INR (₹)</label>
                <input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PUBLIC SHOWCASE MODAL FOR PREVIEWING SHAREABLE LINK */}
      <PublicUserShowcaseModal
        user={{ ...activeUser, shareSettings, customProducts: userProducts }}
        isOpen={showPublicPreviewModal}
        onClose={() => setShowPublicPreviewModal(false)}
        isPreviewMode={true}
      />

    </div>
  );
};
