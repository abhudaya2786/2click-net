import React, { useState, useEffect, useRef } from 'react';
import { GoogleTranslateWidget } from './GoogleTranslateWidget';
import { FontSizeWidget } from './FontSizeWidget';
import { 
  Building2, 
  Sun, 
  Sparkles, 
  Layers, 
  ChevronDown, 
  User as UserIcon, 
  Moon, 
  SunMedium, 
  Menu, 
  X, 
  MapPin,
  Bot,
  Gavel,
  Store,
  ShieldCheck,
  Zap,
  Droplets,
  Hammer,
  Box,
  Eye,
  Landmark,
  Compass,
  LogIn,
  BookOpen,
  Palette,
  Home,
  Truck,
  Navigation,
  Globe,
  Grid,
  FileCheck,
  Search,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Filter,
  CheckCircle2,
  ExternalLink,
  SlidersHorizontal,
  FolderKanban,
  Sparkle,
  HelpCircle,
  Info,
  Lock,
  Smartphone,
  Paintbrush
} from 'lucide-react';
import { INDIAN_CITIES } from '../data/initialData';
import { User, SystemSettings } from '../types';
import { detectFreeUserLocation } from '../utils/freeApisService';
import { useLanguage } from '../context/LanguageContext';
import { ClerkUserButton } from './ClerkUserButton';
import { getRolePermissionDetail } from '../utils/rolePermissions';
import { LocationScopeBar } from './LocationScopeBar';
import { MobileApkInstallModal } from './MobileApkInstallModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onToggleCopilot: () => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenUserProfile?: () => void;
  systemSettings?: SystemSettings;
  selectedThemeId?: string;
  onOpenThemeModal?: () => void;
  minimalistMode?: boolean;
  onToggleMinimalistMode?: (val: boolean) => void;
  onOpenSecurityModal?: () => void;
  children?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedCity,
  setSelectedCity,
  darkMode,
  setDarkMode,
  onOpenAuth,
  onToggleCopilot,
  currentUser,
  onLogout,
  onOpenUserProfile,
  systemSettings,
  selectedThemeId,
  onOpenThemeModal,
  minimalistMode = true,
  onToggleMinimalistMode,
  onOpenSecurityModal,
  children
}) => {
  const { selectedLanguage, setSelectedLanguage, languages, currentLanguageObj, t } = useLanguage();
  
  // Procore Layout States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('2click_sidebar_collapsed') === 'true';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [globalSearchFocused, setGlobalSearchFocused] = useState(false);
  const [sidebarSearchFilter, setSidebarSearchFilter] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [rolePopoverOpen, setRolePopoverOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  const userRoleDetail = getRolePermissionDetail(currentUser?.role);

  const globalSearchInputRef = useRef<HTMLInputElement>(null);

  const isSuperAdminUser = currentUser?.role === 'SuperAdmin' || currentUser?.email?.toLowerCase() === 'shrinet.info@gmail.com';
  const isGuest = !currentUser;

  // Toggle Sidebar Collapse
  const toggleSidebar = () => {
    const next = !isSidebarCollapsed;
    setIsSidebarCollapsed(next);
    localStorage.setItem('2click_sidebar_collapsed', String(next));
  };

  // Keyboard shortcut Ctrl+K or / to focus global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        globalSearchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setGlobalSearchFocused(false);
        setNotificationsOpen(false);
        setLangDropdownOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Secret Admin Portal Trigger via Logo Triple Click
  const handleLogoClick = () => {
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    if (newCount >= 3) {
      setLogoClickCount(0);
      const pin = prompt('🔒 ProCore Super Admin Secret Portal Key Required:');
      if (pin === (systemSettings?.superAdminSecretPin || '2026') || pin === '2CLICK-ADMIN-KEY') {
        alert('Access Granted: Welcome ProCore Super Admin!');
        setActiveTab('super_admin');
      } else if (pin) {
        alert('Invalid Super Admin Secret Key.');
      }
    } else {
      setActiveTab('home');
    }
  };

  const labels = systemSettings?.moduleLabels || {};
  const modules = systemSettings?.enabledModules || {
    home: true,
    construction: true,
    solar: true,
    dukandar_market: true,
    bank_loans: true,
    water_etp_stp: true,
    electrical_elv: true,
    vendors_binding: true,
    naksha_vastu: true,
    lidar: true,
    vr: true,
  };

  // Procore Grouped Navigation Menu Structure
  const menuCategories = [
    {
      group: t('groupCore', 'CORE MANAGEMENT'),
      items: [
        { id: 'dashboard', label: t('dashboard', 'Executive Dashboard'), icon: LayoutDashboard, badge: t('badgeAnalytics', 'Analytics'), desc: t('dashboardDesc', 'KPIs, Project Milestones & Live Cost Index'), enabled: true },
        { id: 'home', label: t('home', 'Project Hub & Overview'), icon: Home, badge: t('badgeCore', 'Core'), desc: t('homeDesc', 'Project B2B Hub, City Metrics & Quick Tools'), enabled: modules.home !== false },
        { id: 'construction', label: t('construction', labels['construction'] || 'Civil BOQ & Material Costing'), icon: Hammer, badge: t('badgeAiEngine', 'AI Engine'), desc: t('constructionDesc', 'Cement, Steel, Footing & Quantity Takeoff'), enabled: modules.construction !== false },
        { id: 'naksha_vastu', label: t('naksha_vastu', labels['naksha_vastu'] || 'Naksha & Vastu Studio'), icon: Compass, badge: '2D/3D', desc: t('naksha_vastuDesc', 'House Layouts, Vastu Compass & Architect Chat'), enabled: modules.naksha_vastu !== false },
        { id: 'interior', label: t('interior', 'Interior Design Studio'), icon: Palette, badge: t('badgeStudio', 'Studio'), desc: t('interiorDesc', '3D Room Layouts & Interior Specs'), enabled: true },
      ]
    },
    {
      group: t('groupEng', 'ENGINEERING & TRADES'),
      items: [
        { id: 'electrical_elv', label: t('electrical_elv', labels['electrical_elv'] || 'Electrical & ELV Studio'), icon: Zap, badge: t('badgeMep', 'MEP'), desc: t('electrical_elvDesc', 'Transformers, Substations & Cables'), enabled: modules.electrical_elv !== false },
        { id: 'water_etp_stp', label: t('water_etp_stp', labels['water_etp_stp'] || 'Water & ETP/STP Systems'), icon: Droplets, badge: t('badgePlumbing', 'Plumbing'), desc: t('water_etp_stpDesc', 'Effluent & Sewage Treatment Plant Design'), enabled: modules.water_etp_stp !== false },
        { id: 'tiles_marble', label: t('tiles_marble', labels['tiles_marble'] || 'Tiles & Marble Studio'), icon: Grid, badge: t('badgeFlooring', 'Flooring'), desc: t('tiles_marbleDesc', 'Tile Box Calculator, Usama & Labor Rates'), enabled: true },
        { id: 'paints_catalog', label: '🎨 पेंटिंग मैटेरियल कैटलॉग (Paints & Colors Catalog)', icon: Paintbrush, badge: 'Paints & Rate', desc: 'Category-wise paint rates, Asian Paints/Berger shade cards & Dukandar list', enabled: true },
        { id: 'solar', label: t('solar', labels['solar'] || 'Solar Rooftop & Subsidies'), icon: Sun, badge: t('badgeMnre', 'MNRE'), desc: t('solarDesc', 'KW Solar Power & PM Surya Ghar Subsidy'), enabled: modules.solar !== false },
      ]
    },
    {
      group: t('groupSupply', 'SUPPLY CHAIN & B2B MARKETPLACE'),
      items: [
        { id: 'vendor_kyc_agreements', label: '🤝 वेंडर & दुकानदार KYC एग्रीमेंट (KYC & MOUs)', icon: ShieldCheck, badge: 'Pincode KYC', desc: 'Category-wise KYC, Pincode coverage & Legal Supply MOUs', enabled: true },
        { id: 'hyperlocal_directory', label: t('hyperlocal_directory', '📍 हाइपर-लोकल वेंडर डायरेक्टरी'), icon: Navigation, badge: t('badgeGps', 'GPS Radius'), desc: t('hyperlocalDesc', 'GPS लोकेशन और दूरी के आधार पर पास के सप्लायर'), enabled: true },
        { id: 'vendor_enrolment', label: t('vendor_enrolment', '🏪 वेंडर एनरोलमेंट फ़ॉर्म'), icon: Store, badge: t('badgeJoin', 'Register'), desc: t('vendorEnrolmentDesc', 'दुकान पंजीकृत करें और GPS लोकेशन टैग करें'), enabled: true },
        { id: 'bidding_hub', label: t('bidding_hub', '⚖️ Master Bidding & Tender Suite'), icon: Gavel, badge: 'Cyber Suite', desc: 'Bidding Dashboard, Tender Registry, Comparative L1 Matrix & Rule Engine', enabled: true },
        { id: 'vendors_binding', label: t('vendors_binding', labels['vendors_binding'] || 'Vendor Binding & Tenders'), icon: Gavel, badge: t('badgeB2bBidding', 'B2B Bidding'), desc: t('vendors_bindingDesc', 'Contractor Directory, Escrow & Tenders'), enabled: modules.vendors_binding !== false },
        { id: 'dukandar_market', label: t('dukandar_market', labels['dukandar_market'] || '🛒 2click Mart (Flipkart & Amazon B2B)'), icon: Store, badge: t('badgeMarket', 'E-Com Mart'), desc: t('dukandar_marketDesc', 'Flipkart & Amazon Style Building Materials & Hardware Mart'), enabled: modules.dukandar_market !== false },
        { id: 'logistics', label: t('logistics', labels['logistics'] || 'Freight & Logistics Hub'), icon: Truck, badge: t('badgeFleet', 'Fleet'), desc: t('logisticsDesc', 'Tipper Trucks, Cement Dispatch & GPS'), enabled: true },
      ]
    },
    {
      group: t('groupFinance', 'FINANCIALS & COMPLIANCE'),
      items: [
        { id: 'ca_gst', label: t('ca_gst', labels['ca_gst'] || 'CA Services & GST Hub'), icon: FileCheck, badge: t('badgeTaxItr', 'Tax & ITR'), desc: t('ca_gstDesc', 'GST Filing, TDS Returns, ITR & Audit'), enabled: true },
        { id: 'crm_khatabook', label: t('crm_khatabook', labels['crm_khatabook'] || 'KhataBook & CRM ERP Suite'), icon: BookOpen, badge: t('badgeErp', 'ERP'), desc: t('crm_khatabookDesc', 'Ledger Book, UDHAR Management & Invoicing'), enabled: true },
        { id: 'bank_loans', label: t('bank_loans', labels['bank_loans'] || 'Bank Loans & Escrow KYC'), icon: Landmark, badge: t('badgeBanking', 'Banking'), desc: t('bank_loansDesc', 'Project Sanctions, Escrow Finance & KYC'), enabled: modules.bank_loans !== false },
      ]
    },
    {
      group: t('groupTech', 'ADVANCED SURVEY & TECH'),
      items: [
        { id: 'lidar', label: t('lidar', labels['lidar'] || 'LiDAR 3D Point Cloud Survey'), icon: Box, badge: t('badgeLaser3d', 'Laser 3D'), desc: t('lidarDesc', 'Drone Topo Surveys & Spatial Measurements'), enabled: modules.lidar !== false },
        { id: 'vr', label: t('vr', labels['vr'] || '3D VR Site Walkthrough'), icon: Eye, badge: t('badgeWebxr', 'WebXR'), desc: t('vrDesc', 'Virtual Reality Construction Inspection'), enabled: modules.vr !== false },
      ]
    },
    {
      group: t('groupAdmin', 'ADMINISTRATION'),
      items: [
        { id: 'super_admin', label: t('superAdmin', 'Super Admin Portal'), icon: ShieldCheck, badge: t('badgeAdmin', 'Admin'), desc: t('super_adminDesc', 'System Configuration, Role Permissions & Settings'), enabled: isSuperAdminUser },
      ]
    }
  ];

  // Flatten all menu items for search filter
  const allMenuItems = menuCategories.flatMap(cat => 
    cat.items.filter(item => item.enabled).map(item => ({ ...item, group: cat.group }))
  );

  // Global search filtering
  const filteredSearchItems = globalSearch.trim()
    ? allMenuItems.filter(item => 
        item.label.toLowerCase().includes(globalSearch.toLowerCase()) ||
        item.desc.toLowerCase().includes(globalSearch.toLowerCase()) ||
        item.group.toLowerCase().includes(globalSearch.toLowerCase()) ||
        item.badge?.toLowerCase().includes(globalSearch.toLowerCase())
      )
    : [];

  // Active module helper info
  const currentActiveItem = allMenuItems.find(item => item.id === activeTab) || allMenuItems[0];

  // Mock Procore Notifications Data
  const mockNotifications = [
    { id: '1', title: 'Steel Price Index Alert', desc: 'Fe 550D TMT Steel rate updated in Bengaluru zone (+₹850/tonne)', time: '10 mins ago', unread: true },
    { id: '2', title: 'GST Filing Reminder', desc: 'Q2 GSTR-3B compliance submission window is active', time: '1 hour ago', unread: true },
    { id: '3', title: 'Vendor Bid Received', desc: 'Apex Structural Infra submitted tender for BOQ #2026-B', time: '3 hours ago', unread: false },
    { id: '4', title: 'PM Surya Ghar Subsidy', desc: '₹78,000 Government Subsidy credited for 3KW solar install', time: '1 day ago', unread: false },
  ];

  const activeCategoryWl = systemSettings?.categoryWhiteLabels?.find(
    c => c.isWhiteLabelActive && (c.id === systemSettings.activeGlobalWhiteLabelId || c.categoryKey === activeTab)
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* 1. TOP HEADER — minimalist for guests, full enterprise when logged in */}
      {isGuest ? (
        <header className="h-14 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/80 text-slate-900 dark:text-white flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 shrink-0">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-teal-400">2</span>
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              {systemSettings?.siteName || '2click.in'}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <SunMedium className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          </div>
        </header>
      ) : (
      <header className="h-16 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between px-3 sm:px-5 sticky top-0 z-40 shadow-sm shrink-0">
        
        {/* Left Section: Mobile Menu Toggle + Brand Logo + Project Selector */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Collapse Toggle for Desktop */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700/60"
            title={isSidebarCollapsed ? "Expand Navigation Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5 text-orange-400" /> : <PanelLeftClose className="w-5 h-5 text-slate-300" />}
          </button>

          {/* Mobile Drawer Trigger */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-orange-400" />}
          </button>

          {/* Procore Brand Logo / Active Category White Label Branding */}
          <button 
            onClick={handleLogoClick}
            title="Triple click for Secret Super Admin Portal"
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            {activeCategoryWl ? (
              <img
                src={activeCategoryWl.partnerLogoUrl}
                alt={activeCategoryWl.partnerBrandName}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-xl object-cover border border-emerald-400/40 shadow-md group-hover:scale-105 transition-transform shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-blue-500/40 flex items-center justify-center text-white shadow-lg shadow-blue-500/10 group-hover:scale-105 transition-transform border-white/20 shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-purple-600/30 to-emerald-500/30"></div>
                <div className="relative z-10 flex items-center gap-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#4285F4] animate-pulse"></span>
                  <span className="w-2 h-2 rounded-full bg-[#EA4335] animate-pulse" style={{ animationDelay: '200ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-[#FBBC05] animate-pulse" style={{ animationDelay: '400ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" style={{ animationDelay: '600ms' }}></span>
                </div>
              </div>
            )}

            <div className="flex flex-col text-left max-w-[180px] sm:max-w-xs">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-black text-base sm:text-lg tracking-tight text-white leading-none truncate">
                  {activeCategoryWl ? activeCategoryWl.partnerBrandName : (systemSettings?.siteName || '2Click.in')}
                </span>
                <span className="text-[8px] sm:text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 tracking-wider shrink-0 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
                  2CLICK AI
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-teal-300/80 tracking-wider uppercase leading-tight truncate">
                {activeCategoryWl ? (activeCategoryWl.customBannerTagline || activeCategoryWl.categoryDisplayName) : 'Construction, Solar & B2B Ecosystem'}
              </span>
            </div>
          </button>

          {/* Procore Project & City Selector Dropdown */}
          {systemSettings?.publicDisplayControls?.showCitySelector !== false && (
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-800">
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-200">
                <FolderKanban className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span className="text-[11px] font-bold text-slate-400 hidden xl:inline">Project Zone:</span>
                <select 
                  value={selectedCity} 
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent font-black focus:outline-none cursor-pointer text-white max-w-[140px] truncate"
                >
                  {INDIAN_CITIES.map(city => (
                    <option key={city} value={city} className="bg-slate-900 text-white">
                      {city} Zone
                    </option>
                  ))}
                </select>
                <button
                  onClick={async () => {
                    const loc = await detectFreeUserLocation();
                    if (loc.district) {
                      setSelectedCity(loc.district);
                      alert(`📍 Procore Free Location API: Auto-detected district "${loc.district}, ${loc.state}"`);
                    }
                  }}
                  title="Auto-Detect District via Free GPS & IP API"
                  className="px-2 py-0.5 rounded-md bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-[10px] font-black flex items-center gap-0.5 border border-orange-500/40 transition cursor-pointer shrink-0"
                >
                  <Navigation className="w-3 h-3" />
                  <span>GPS</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center Section: Global Procore Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={globalSearchInputRef}
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onFocus={() => setGlobalSearchFocused(true)}
              placeholder="Search drawings, BOQ, GST, vendors, equipment... (Ctrl+K)"
              className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-800/90 text-white placeholder-slate-400 border border-slate-700/80 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <kbd className="hidden sm:inline-block text-[9px] font-mono bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-xs border border-slate-600">
                Ctrl+K
              </kbd>
            </div>
          </div>

          {/* Global Search Results Overlay Popup */}
          {globalSearchFocused && globalSearch.trim().length > 0 && (
            <div 
              className="absolute top-full left-0 right-0 mt-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-96 overflow-y-auto"
              onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
            >
              <div className="text-[10px] font-extrabold uppercase text-slate-400 px-3 py-1 tracking-wider flex items-center justify-between">
                <span>Matching Procore Modules ({filteredSearchItems.length})</span>
                <span className="text-[9px] text-slate-400">Esc to close</span>
              </div>

              {filteredSearchItems.length > 0 ? (
                <div className="space-y-1 mt-1">
                  {filteredSearchItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setGlobalSearch('');
                          setGlobalSearchFocused(false);
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-orange-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/80 text-orange-600 shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{item.label}</span>
                              {item.badge && (
                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">{item.desc}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching Procore tools found for "{globalSearch}". Try "BOQ", "GST", "Solar", "Naksha", or "Logistics".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Language, Font Size, Copilot, Security, Theme, Notifications & User Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Font Size Adjuster Widget */}
          <div className="hidden sm:block">
            <FontSizeWidget />
          </div>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              title="Change Language / भाषा बदलें"
            >
              <Globe className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[11px] font-bold text-orange-300 flex items-center gap-1">
                <span>{currentLanguageObj.flag}</span>
                <span className="max-w-[70px] sm:max-w-none truncate">{currentLanguageObj.nativeName}</span>
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {langDropdownOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-68 max-h-[420px] overflow-y-auto p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <GoogleTranslateWidget compact />

                <div className="text-[10px] font-extrabold uppercase text-slate-400 px-3 pt-3 pb-1 tracking-wider flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-2">
                  <span>Direct Select (22 Official)</span>
                  <span className="text-orange-400 font-bold">भाषा चुनें</span>
                </div>
                <div className="space-y-0.5 mt-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between cursor-pointer ${
                        selectedLanguage === lang.code
                          ? 'bg-orange-500/10 text-orange-600 dark:text-orange-300 font-extrabold border border-orange-500/30'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">{lang.flag}</span>
                        <div className="flex flex-col">
                          <span className="font-bold">{lang.nativeName}</span>
                          <span className="text-[10px] text-slate-400">{lang.name}</span>
                        </div>
                      </span>
                      {selectedLanguage === lang.code && (
                        <span className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-500"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile App & APK Installer Button */}
          <button
            onClick={() => setIsApkModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-md shadow-teal-500/20"
            title="Install Mobile App & Download Android APK"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">📱 App / APK</span>
          </button>

          {/* AI Assistant Floating Trigger */}
          {systemSettings?.publicDisplayControls?.showAiCopilotButton !== false && (
            <button
              onClick={onToggleCopilot}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-xs shadow-orange-500/30"
              title="Open Procore AI Copilot Assistant (Ctrl+K)"
            >
              <Bot className="w-3.5 h-3.5 animate-bounce text-amber-200" />
              <span className="hidden sm:inline">AI Copilot</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] bg-black/30 border border-white/20 rounded font-mono text-amber-100 ml-0.5">
                Ctrl+K
              </kbd>
            </button>
          )}

          {/* Theme Selector Button */}
          <button
            onClick={onOpenThemeModal}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-orange-400 border border-slate-700 transition cursor-pointer"
            title="Color Theme & Layout Preset"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Security Modal Button */}
          {onOpenSecurityModal && (
            <button
              onClick={onOpenSecurityModal}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition cursor-pointer"
              title="Security & Data Protection Vault"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}

          {/* Procore Notifications Bell Drawer */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer relative"
              title="Notifications & System Logs"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-slate-900 animate-pulse"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-orange-500" />
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">Procore Notifications</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-300">
                    2 New
                  </span>
                </div>

                <div className="space-y-2 mt-2 max-h-72 overflow-y-auto no-scrollbar">
                  {mockNotifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`p-2.5 rounded-xl border transition ${
                        notif.unread 
                          ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/60' 
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                        <span>{notif.title}</span>
                        <span className="text-[9px] text-slate-400 font-normal">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {notif.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <SunMedium className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Clerk Style User Button Widget */}
          <ClerkUserButton
            currentUser={currentUser}
            onOpenAuth={onOpenAuth}
            onLogout={onLogout}
            onOpenUserProfile={onOpenUserProfile || (() => {})}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
            onNavigateToSuperAdmin={() => setActiveTab('super_admin')}
            isSuperAdminUser={isSuperAdminUser}
          />

        </div>
      </header>
      )}

      {/* GOOGLE FLOW WORKFLOW ENGINE NAVIGATION BAR */}
      {!isGuest && (
      <div className="bg-slate-950/90 border-b border-blue-500/20 px-3 py-2 overflow-x-auto no-scrollbar shadow-lg relative z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 min-w-[760px] text-xs">
          <div className="flex items-center gap-1.5 font-black text-[11px] text-blue-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            <span className="tracking-wider uppercase">Google Flow Step:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { id: 'construction', step: '01', title: 'AI BOQ Estimate', icon: '🏗️' },
              { id: 'solar', step: '02', title: 'Solar Rooftop', icon: '☀️' },
              { id: 'naksha_vastu', step: '03', title: '3D Naksha & Vastu', icon: '🏛️' },
              { id: 'lidar', step: '04', title: 'LiDAR & VR Survey', icon: '👓' },
              { id: 'vendors_binding', step: '05', title: 'Tenders & Bidding', icon: '⚖️' },
              { id: 'dukandar_market', step: '06', title: '2Click Mart', icon: '🛒' },
              { id: 'logistics', step: '07', title: 'Logistics Fleet', icon: '🚚' },
            ].map((flow, index) => {
              const isActive = activeTab === flow.id;
              return (
                <React.Fragment key={flow.id}>
                  <button
                    onClick={() => setActiveTab(flow.id)}
                    className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/25 ring-2 ring-blue-400/50 scale-105'
                        : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span className="text-[10px] font-mono opacity-80">{flow.step}.</span>
                    <span>{flow.icon} {flow.title}</span>
                  </button>
                  {index < 6 && (
                    <span className="text-slate-600 font-black text-[10px]">➔</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <button
            onClick={onToggleCopilot}
            className="px-3 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-black flex items-center gap-1 transition cursor-pointer shrink-0"
          >
            <span>⚡ AI Copilot Flow</span>
          </button>
        </div>
      </div>
      )}

      {/* 2. MAIN BODY: COLLAPSIBLE SIDEBAR + MAIN CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* DESKTOP & TABLET COLLAPSIBLE SIDEBAR NAVIGATION */}
        {!isGuest && (
        <aside 
          className={`bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-all duration-300 z-30 shrink-0 ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          } hidden md:flex`}
        >
          {/* Quick Filter Search inside Sidebar (When Expanded) */}
          {!isSidebarCollapsed && (
            <div className="p-3 border-b border-slate-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={sidebarSearchFilter}
                  onChange={(e) => setSidebarSearchFilter(e.target.value)}
                  placeholder="Filter menu tools..."
                  className="w-full pl-8 pr-3 py-1 text-xs bg-slate-800/80 text-white placeholder-slate-400 border border-slate-700/60 rounded-lg focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>
          )}

          {/* Grouped Sidebar Menu Items */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-4">
            {menuCategories.map((cat, idx) => {
              // Filter items based on sidebar search
              const filteredItems = cat.items.filter(item => 
                item.enabled && 
                (!sidebarSearchFilter.trim() || item.label.toLowerCase().includes(sidebarSearchFilter.toLowerCase()))
              );

              if (filteredItems.length === 0) return null;

              return (
                <div key={idx} className="space-y-1">
                  {/* Category Header */}
                  {!isSidebarCollapsed && (
                    <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      {cat.group}
                    </div>
                  )}

                  {/* Items */}
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        title={isSidebarCollapsed ? `${item.label} — ${item.desc}` : undefined}
                        className={`w-full text-left rounded-xl transition flex items-center group relative cursor-pointer ${
                          isSidebarCollapsed ? 'justify-center py-2.5 px-0' : 'px-3 py-2 gap-3'
                        } ${
                          isActive
                            ? 'bg-orange-600 text-white font-black shadow-sm shadow-orange-600/30'
                            : 'hover:bg-slate-800 text-slate-300 hover:text-white font-medium'
                        }`}
                      >
                        {/* Active Left Accent Bar */}
                        {isActive && !isSidebarCollapsed && (
                          <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber-300 rounded-r-full"></div>
                        )}

                        <Icon className={`shrink-0 transition-transform ${
                          isSidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4'
                        } ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'}`} />

                        {!isSidebarCollapsed && (
                          <div className="flex-1 min-w-0 flex items-center justify-between">
                            <span className="text-xs truncate">{item.label}</span>
                            {item.badge && (
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-xs uppercase tracking-tight shrink-0 ${
                                isActive 
                                  ? 'bg-orange-700 text-amber-200' 
                                  : 'bg-slate-800 text-slate-400 group-hover:text-slate-200 border border-slate-700'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Bottom Sidebar Footer: Collapse Button & Status */}
          <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-slate-400">Procore Cloud Active</span>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className={`p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer ${
                isSidebarCollapsed ? 'mx-auto' : ''
              }`}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4 text-orange-400" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </aside>
        )}

        {/* MOBILE DRAWER SIDEBAR */}
        {!isGuest && mobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex">
            <div className="w-72 bg-slate-900 text-slate-300 h-full flex flex-col p-4 shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-500" />
                  <span className="font-extrabold text-white text-sm">Procore Menu</span>
                </div>
                <button 
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 py-3">
                {menuCategories.map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2">
                      {cat.group}
                    </div>
                    {cat.items.filter(item => item.enabled).map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setMobileSidebarOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between ${
                            isActive ? 'bg-orange-600 text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-xs bg-slate-950 text-slate-300">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileSidebarOpen(false)}></div>
          </div>
        )}

        {/* 3. MAIN DISPLAY AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          
          {/* Enterprise Sub-Header Breadcrumb Bar — logged-in only */}
          {!isGuest && (
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs shadow-2xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
              <span className="font-extrabold text-orange-600 dark:text-orange-400">Procore Enterprise</span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCity} Project Zone</span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                {currentActiveItem?.label}
              </span>
            </div>

            {/* Quick Action Badges */}
            <div className="flex items-center gap-2">
              {currentUser && (
                <div className="relative inline-block text-left">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all shadow-2xs ${userRoleDetail.badgeBg} ${userRoleDetail.badgeBorder} ${userRoleDetail.badgeText}`}>
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                    <span>Logged in as: <strong className="underline underline-offset-2 decoration-emerald-500/40">{currentUser.role}</strong></span>
                    {currentUser.subscriptionPlanName && (
                      <span className="text-[10px] font-mono opacity-80 hidden md:inline">({currentUser.subscriptionPlanName})</span>
                    )}

                    {/* Small Help Icon explaining user permissions */}
                    <button
                      type="button"
                      onClick={() => setRolePopoverOpen(!rolePopoverOpen)}
                      className="ml-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                      title={`Click to view ${currentUser.role} permissions & access level`}
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </button>
                  </div>

                  {/* Role Permissions Help Popover Card */}
                  {rolePopoverOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100 space-y-3">
                      <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                        <div className="space-y-0.5">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${userRoleDetail.badgePill}`}>
                            {userRoleDetail.title}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-1">
                            <span>Permissions &amp; Access Level</span>
                          </h4>
                        </div>

                        <button
                          type="button"
                          onClick={() => setRolePopoverOpen(false)}
                          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {userRoleDetail.description}
                      </p>

                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Active Role Capabilities:
                        </div>
                        <ul className="space-y-1 text-[11px]">
                          {userRoleDetail.keyPermissions.map((perm, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-200 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{perm}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          <ShieldCheck className="w-3 h-3" />
                          Authenticated User
                        </span>
                        <span className="font-semibold text-slate-500">
                          {currentUser.subscriptionPlanName || 'Standard Tier'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>IS Code 2026 Compliant</span>
              </span>

              <button
                onClick={onToggleCopilot}
                className="px-2.5 py-1 rounded-md bg-orange-50 dark:bg-orange-950/60 hover:bg-orange-100 text-orange-700 dark:text-orange-300 font-bold text-[11px] border border-orange-200 dark:border-orange-800 flex items-center gap-1 cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-orange-500" />
                <span>AI Consult</span>
              </button>
            </div>
          </div>
          )}

          {/* MAIN MODULE CONTENT VIEW */}
          <div className={`flex-1 min-w-0 space-y-6 ${isGuest ? 'p-0' : 'p-3 sm:p-5 lg:p-6'}`}>
            {children}
          </div>

        </div>

      </div>

      {/* Mobile App & APK Modal */}
      <MobileApkInstallModal isOpen={isApkModalOpen} onClose={() => setIsApkModalOpen(false)} />
    </div>
  );
};

