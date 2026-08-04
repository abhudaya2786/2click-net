/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AiBoqCalculator } from './components/AiBoqCalculator';
import { SolarRooftopCalc } from './components/SolarRooftopCalc';
import { InteriorStudio } from './components/InteriorStudio';
import { LidarSurveyViewer } from './components/LidarSurveyViewer';
import { VrWalkthroughViewer } from './components/VrWalkthroughViewer';
import { WaterEtpStpCalc } from './components/WaterEtpStpCalc';
import { ElectricalElvStudio } from './components/ElectricalElvStudio';
import { TilesMarbleStudio } from './components/TilesMarbleStudio';
import { VendorBindingHub } from './components/VendorBindingHub';
import { BiddingTenderHub } from './components/BiddingTenderHub';
import { CyberSecureLoginModal } from './components/CyberSecureLoginModal';
import { DukandarMarketplace } from './components/DukandarMarketplace';
import { BankLoanKycHub } from './components/BankLoanKycHub';
import { NakshaVastuStudio } from './components/NakshaVastuStudio';
import { CrmErpKhatabookHub } from './components/CrmErpKhatabookHub';
import { LogisticsHub } from './components/LogisticsHub';
import { CaGstComplianceHub } from './components/CaGstComplianceHub';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { DashboardView } from './components/DashboardView';
import { VendorEnrolmentForm } from './components/VendorEnrolmentForm';
import { HyperLocalDirectory } from './components/HyperLocalDirectory';
import { PaintingMaterialCatalogHub } from './components/PaintingMaterialCatalogHub';
import { VendorShopkeeperAgreementKycHub } from './components/VendorShopkeeperAgreementKycHub';
import { getSafeLocalStorage, setSafeLocalStorage } from './lib/storage';
import { MinimalHeader } from './components/MinimalHeader';
import { WhiteLabelLoginModal } from './components/WhiteLabelLoginModal';
import { ModernFrontLayout } from './components/ModernFrontLayout';
import { auth, firebaseSignOut, isFirebaseConfigured, onAuthStateChanged } from './lib/firebase';
import { syncUserProfileInFirestore, SUPER_ADMIN_EMAILS } from './lib/firebaseAuthService';
import { PublicUserShowcaseModal } from './components/PublicUserShowcaseModal';
import { AiCopilotDrawer } from './components/AiCopilotDrawer';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { SecurityProtectionModal } from './components/SecurityProtectionModal';
import { Footer } from './components/Footer';
import { User, SystemSettings } from './types';
import { VendorProfile } from './types/vendor';
import { INITIAL_CATEGORY_WHITE_LABELS } from './data/sampleWhiteLabels';
import { LanguageProvider } from './context/LanguageContext';
import { FullscreenProvider } from './context/FullscreenContext';
import { LocationProvider } from './context/LocationContext';
import { FontSizeProvider } from './context/FontSizeContext';
import { FullscreenModal } from './components/FullscreenModal';
import { MobileBottomNavBar } from './components/MobileBottomNavBar';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { MobileApkInstallModal } from './components/MobileApkInstallModal';
import { useSessionTimeout } from './utils/security';

export default function App() {
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem('2click_selected_city') || 'Lucknow';
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('2click_theme') === 'dark' || 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Theme, Language & Minimalist Layout States
  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
    return localStorage.getItem('2click_theme_preset') || 'cyber_teal';
  });
  const [themeModalOpen, setThemeModalOpen] = useState<boolean>(false);
  const [securityModalOpen, setSecurityModalOpen] = useState<boolean>(false);
  const [minimalistMode, setMinimalistMode] = useState<boolean>(() => {
    return localStorage.getItem('2click_minimalist_mode') !== 'false';
  });
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    return localStorage.getItem('2click_language') || 'en';
  });

  // Listen for language changes across the app for instant re-rendering
  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvt = e as CustomEvent;
      const updatedLang = customEvt.detail || localStorage.getItem('2click_language') || 'en';
      setSelectedLanguage(updatedLang);
    };

    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);
  const [selectedDashboardPreset, setSelectedDashboardPreset] = useState<string>(() => {
    return localStorage.getItem('2click_dashboard_preset') || 'executive';
  });

  // एक्टिव वाइट-लेबल वेंडर की स्टेट (Active White-Label Vendor Configuration)
  const [activeVendorConfig, setActiveVendorConfig] = useState<VendorProfile | null>(null);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('2click_system_settings');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (!parsed.categoryWhiteLabels) {
          parsed.categoryWhiteLabels = INITIAL_CATEGORY_WHITE_LABELS;
        }
        return parsed; 
      } catch (e) {}
    }
    return {
      siteName: '2click',
      siteTagline: 'Engineers & B2B Hub',
      primaryColor: 'teal',
      categoryWhiteLabels: INITIAL_CATEGORY_WHITE_LABELS,
      enabledModules: {
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
      },
      moduleLabels: {},
      loginDisplayControls: {
        showQuickRoleDemo: true,
        showWhatsAppOtpTab: true,
        showEmailOtpTab: true,
        showPasswordTab: true,
        allowPublicRegistration: true,
        showDistrictAdminLoginNotice: true,
      },
      publicDisplayControls: {
        showPublicPrices: true,
        showVendorContacts: true,
        showPublicBiddingTenders: true,
        showCitySelector: true,
        showAiCopilotButton: true,
        showDistrictHierarchyBar: true,
      },
      publicRegistrationEnabled: true,
      requireOtpLogin: true,
      showPublicPrices: true,
      allowPublicVendorChat: true,
      superAdminSecretPin: '2026',
    };
  });

  const handleUpdateSystemSettings = (newSettings: SystemSettings) => {
    setSystemSettings(newSettings);
    setSafeLocalStorage('2click_system_settings', newSettings);
  };

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return getSafeLocalStorage<User | null>('2click_user', null);
  });

  // Low Network & Offline State Watcher for smooth performance
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [lowNetworkNotice, setLowNetworkNotice] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLowNetworkNotice(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setLowNetworkNotice(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check Network Information API if supported
    const nav = navigator as any;
    if (nav.connection) {
      const conn = nav.connection;
      if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g' || conn.saveData) {
        setLowNetworkNotice(true);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getDefaultTabForRole = (role?: string): string => {
    if (!role) return 'home';
    switch (role) {
      case 'Dukandar':
      case 'Supplier':
        return 'dukandar_market';
      case 'Electrician':
        return 'electrical_elv';
      case 'Plumber':
        return 'water_etp_stp';
      case 'Architect':
        return 'naksha_vastu';
      case 'BankManager':
        return 'bank_loans';
      case 'Vendor':
      case 'Contractor':
        return 'vendors_binding';
      case 'DistrictAdmin':
      case 'DistrictEmployee':
      case 'Employee':
      case 'SuperAdmin':
        return 'super_admin';
      case 'Client':
      default:
        return 'construction';
    }
  };

  const [activeTab, setActiveTab] = useState<string>(() => {
    const savedUser = localStorage.getItem('2click_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.role) return getDefaultTabForRole(parsed.role);
      } catch (e) {
        // fallback
      }
    }
    return 'home';
  });

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [cyberLoginModalOpen, setCyberLoginModalOpen] = useState<boolean>(false);
  const [whiteLabelLoginOpen, setWhiteLabelLoginOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'super_admin_portal'>('login');
  const [userProfileModalOpen, setUserProfileModalOpen] = useState<boolean>(false);
  const [copilotOpen, setCopilotOpen] = useState<boolean>(false);
  const [apkInstallModalOpen, setApkInstallModalOpen] = useState<boolean>(false);

  // Share user public showcase state
  const [publicShareUser, setPublicShareUser] = useState<User | null>(null);
  const [publicShareModalOpen, setPublicShareModalOpen] = useState<boolean>(false);

  // Access Denied Route Guard Toast
  const [accessDeniedToast, setAccessDeniedToast] = useState<string | null>(null);

  const handleSetActiveTabWithGuard = (targetTab: string) => {
    // 1. Strict Authentication Wall: Gating internal tools & dashboards for unauthenticated visitors
    if (!currentUser && targetTab !== 'home') {
      if (targetTab === 'super_admin' || targetTab === 'admin' || targetTab === 'secure-super-admin-portal') {
        setAccessDeniedToast('🔒 Isolated Super Admin Security Portal: Please authenticate with authorized Super Admin credentials.');
        handleOpenAuth('super_admin_portal');
      } else {
        setAccessDeniedToast('🔒 Strict Authentication Required: Visitors must sign up or log in to access internal tools & dashboards.');
        handleOpenAuth('login');
      }
      setTimeout(() => setAccessDeniedToast(null), 6000);
      return;
    }

    // 2. Isolated Super Admin Route Guard
    if (targetTab === 'super_admin' || targetTab === 'admin' || targetTab === 'secure-super-admin-portal') {
      const userRole = currentUser?.role;
      const userEmail = currentUser?.email?.toLowerCase() || '';
      const isSuperAdminUser = userRole === 'SuperAdmin' || SUPER_ADMIN_EMAILS.includes(userEmail);

      if (!isSuperAdminUser) {
        setAccessDeniedToast(
          `🚫 Access Denied: Super Admin Security & Privacy Protection. Account (${userEmail}, Role: ${userRole}) is strictly blocked from Super Admin Dashboard.`
        );
        setTimeout(() => setAccessDeniedToast(null), 6000);
        
        // Redirect to user's authorized role default tab
        const fallback = currentUser ? getDefaultTabForRole(currentUser.role) : 'home';
        setActiveTab(fallback);
        return;
      }
    }

    setActiveTab(targetTab);
  };

  // URL search parameter & Auth state sync
  useEffect(() => {
    // Check Firebase Auth active session & sync user profile from Firestore
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (fbUser) => {
        if (fbUser) {
          try {
            const syncedUser = await syncUserProfileInFirestore(fbUser);
            setCurrentUser(syncedUser);
            localStorage.setItem('2click_user', JSON.stringify(syncedUser));
          } catch (e) {
            console.warn('Profile sync note:', e);
          }
        }
      },
      (_error) => {
        // Cleanly suppress unauthenticated warnings on startup
      }
    );

    // Support direct URL /admin or /secure-super-admin-portal route
    const currentPath = window.location.pathname;
    if (currentPath === '/secure-super-admin-portal' || currentPath === '/admin' || currentPath === '/superadmin') {
      if (!currentUser || currentUser.role !== 'SuperAdmin') {
        setAuthMode('super_admin_portal');
        setAuthModalOpen(true);
      } else {
        handleSetActiveTabWithGuard('super_admin');
      }
    }

    const params = new URLSearchParams(window.location.search);
    const vendorIdFromUrl = params.get('vendorId');

    if (vendorIdFromUrl) {
      // 1. Check local storage for registered vendors
      const allVendors: VendorProfile[] = getSafeLocalStorage<VendorProfile[]>('2click_vendors', []);
      let matchedVendor = allVendors.find(v => v.id === vendorIdFromUrl);

      // 2. Check systemSettings category white label configs
      if (!matchedVendor && systemSettings?.categoryWhiteLabels) {
        const catConfig = systemSettings.categoryWhiteLabels.find(c => c.id === vendorIdFromUrl || c.categoryKey === vendorIdFromUrl);
        if (catConfig) {
          matchedVendor = {
            id: catConfig.id,
            businessName: catConfig.partnerBrandName,
            whiteLabelSettings: {
              brandTitle: catConfig.partnerBrandName,
              logoUrl: catConfig.partnerLogoUrl,
              supportPhone: catConfig.supportPhoneWhatsapp,
              domainName: catConfig.customDomainOrSlug,
              customHeaderNotice: catConfig.customHeaderTitle || catConfig.customBannerTagline
            }
          };
        }
      }

      // 3. Fallback default profile if vendorId specified directly
      if (!matchedVendor) {
        matchedVendor = {
          id: vendorIdFromUrl,
          businessName: `Partner Vendor (${vendorIdFromUrl})`,
          whiteLabelSettings: {
            brandTitle: `Vendor Hub - ${vendorIdFromUrl}`,
            supportPhone: '+91 70072 54932',
            customHeaderNotice: 'White-Label Approved Partner Portal'
          }
        };
      }

      if (matchedVendor) {
        setActiveVendorConfig(matchedVendor);
        console.log(`Loaded custom white-label panel for: ${matchedVendor.businessName}`);
      }
    }

    const sharedUserId = params.get('shareUser') || params.get('vendor');
    if (sharedUserId) {
      const showcaseUser: User = {
        id: sharedUserId,
        name: 'Ramesh Hardware & Cement Mart',
        email: 'ramesh.cement@2click.in',
        phone: '+91 70072 54932',
        role: 'Dukandar',
        district: selectedCity,
        companyName: 'Ramesh Hardware & Wholesale Building Materials',
        isKycVerified: true,
        gstinNumber: '07AAACR1234F1Z9',
        rating: 4.9,
        shareSettings: {
          showProducts: true,
          showPrices: true,
          showContactPhone: true,
          showAddressLocation: true,
          showKhataQrPayment: true,
          showRatingReviews: true,
          showGstin: true,
          headlineMessage: 'अल्ट्राटेक सीमेंट एवं टाटा स्टील अधिकृत थोक विक्रेता - विशेष छूट हेतु संपर्क करें'
        }
      };
      setPublicShareUser(showcaseUser);
      setPublicShareModalOpen(true);
    }

    return () => unsubscribeAuth();
  }, [selectedCity]);

  // Sync theme preset and dark mode class with HTML element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', selectedThemeId);
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('2click_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('2click_theme', 'light');
    }
  }, [darkMode, selectedThemeId]);

  const getThemeContainerClass = (themeId: string, isDark: boolean): string => {
    switch (themeId) {
      case 'midnight_black':
        return isDark 
          ? 'bg-gradient-to-b from-black via-zinc-950 to-slate-950 text-zinc-100'
          : 'bg-gradient-to-b from-zinc-100 via-slate-50 to-zinc-200 text-zinc-900';
      case 'royal_blue':
        return isDark 
          ? 'bg-gradient-to-b from-blue-950 via-slate-950 to-cyan-950 text-slate-100'
          : 'bg-gradient-to-b from-blue-50 via-indigo-50 to-sky-100 text-slate-900';
      case 'emerald_green':
        return isDark 
          ? 'bg-gradient-to-b from-emerald-950 via-slate-950 to-teal-950 text-slate-100'
          : 'bg-gradient-to-b from-emerald-50 via-teal-50 to-slate-100 text-slate-900';
      case 'sunrise_gold':
        return isDark 
          ? 'bg-gradient-to-b from-amber-950 via-zinc-950 to-slate-950 text-slate-100'
          : 'bg-gradient-to-b from-amber-50 via-orange-50 to-zinc-100 text-slate-900';
      case 'neo_purple':
        return isDark 
          ? 'bg-gradient-to-b from-purple-950 via-slate-950 to-indigo-950 text-slate-100'
          : 'bg-gradient-to-b from-purple-50 via-indigo-50 to-slate-100 text-slate-900';
      case 'pure_light':
        return isDark 
          ? 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-slate-100'
          : 'bg-gradient-to-b from-slate-50 via-indigo-50/50 to-white text-slate-900';
      case 'tailstore_emerald':
      default:
        return isDark 
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-900';
    }
  };

  // Global Keyboard Shortcuts (Ctrl+K for AiCopilotDrawer, Esc to close any active modal/drawer)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Ctrl+K or Cmd+K to toggle AiCopilotDrawer
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setCopilotOpen(prev => !prev);
      }

      // 2. Escape key to close any active modal/drawer
      if (e.key === 'Escape' || e.key === 'Esc') {
        setCopilotOpen(false);
        setAuthModalOpen(false);
        setWhiteLabelLoginOpen(false);
        setUserProfileModalOpen(false);
        setThemeModalOpen(false);
        setSecurityModalOpen(false);
        setApkInstallModalOpen(false);
        setPublicShareModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register' | 'super_admin_portal' = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('2click_user', JSON.stringify(user));
    setActiveTab(getDefaultTabForRole(user.role));
  };

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase logout error:', e);
    }
    if (isFirebaseConfigured) {
      alert("Logged Out Successfully");
    }
    setCurrentUser(null);
    localStorage.removeItem('2click_user');
  };

  // Auto Inactivity Logout Security Guard (15 Minutes)
  useSessionTimeout(() => {
    if (currentUser) {
      handleLogout();
      alert('⏰ सुरक्षा कारणों से: 15 मिनट की निष्क्रियता (Inactivity) के कारण आपका सत्र समाप्त कर दिया गया है!');
    }
  }, 15);

  const handleNavigateFromHero = (tab: string) => {
    handleSetActiveTabWithGuard(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <LanguageProvider key={selectedLanguage} initialLanguage={selectedLanguage} onLanguageChange={setSelectedLanguage}>
      <FontSizeProvider>
        <FullscreenProvider>
          <LocationProvider>
            <div key={`${selectedLanguage}-${selectedThemeId}`} className={`min-h-screen ${getThemeContainerClass(selectedThemeId, darkMode)} flex flex-col justify-between font-sans selection:bg-teal-500 selection:text-white transition-colors duration-300`}>
      
      {/* Minimal Header Bar — logged-in users only (guests get clean Navbar header) */}
      {currentUser && (
        <MinimalHeader
          isLoggedIn={!!currentUser}
          userName={currentUser?.name || currentUser?.companyName}
          userRole={currentUser?.role}
          activeBrandTitle={activeVendorConfig?.businessName || systemSettings.siteName || '2click.in Super App'}
          onOpenLoginModal={() => handleOpenAuth('login')}
          onLogoutClick={handleLogout}
          currentGpsLocation={selectedCity}
        />
      )}

      {/* 🟢 ACTIVE WHITE-LABEL VENDOR HEADER BANNER (If loaded via ?vendorId=...) */}
      {activeVendorConfig && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-b border-emerald-500/30 px-4 py-2.5 text-xs text-white flex flex-col sm:flex-row justify-between items-center gap-2 shadow-lg sticky top-0 z-50">
          <div className="flex items-center gap-3">
            {activeVendorConfig.whiteLabelSettings?.logoUrl ? (
              <img 
                src={activeVendorConfig.whiteLabelSettings.logoUrl} 
                alt={activeVendorConfig.businessName}
                className="h-6 w-auto object-contain rounded"
              />
            ) : (
              <span className="p-1 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30 uppercase tracking-wider">
                WHITE-LABEL
              </span>
            )}
            <div>
              <h1 className="font-extrabold text-emerald-400 text-xs sm:text-sm">
                {activeVendorConfig.whiteLabelSettings?.brandTitle || activeVendorConfig.businessName}
              </h1>
              {activeVendorConfig.whiteLabelSettings?.customHeaderNotice && (
                <p className="text-[10px] text-slate-300 hidden sm:block">
                  {activeVendorConfig.whiteLabelSettings.customHeaderNotice}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            {(activeVendorConfig.whiteLabelSettings?.supportPhone || activeVendorConfig.phone) && (
              <a 
                href={`tel:${activeVendorConfig.whiteLabelSettings?.supportPhone || activeVendorConfig.phone}`}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 rounded-full flex items-center gap-1 transition shadow-sm"
              >
                📞 हेल्पलाइन: {activeVendorConfig.whiteLabelSettings?.supportPhone || activeVendorConfig.phone}
              </a>
            )}
            <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              Personalized Partner Hub
            </span>
          </div>
        </div>
      )}

      {/* Procore-style Header & Collapsible Sidebar Navigation Layout Shell */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleSetActiveTabWithGuard}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenAuth={handleOpenAuth}
        onToggleCopilot={() => setCopilotOpen(!copilotOpen)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenUserProfile={() => setUserProfileModalOpen(true)}
        systemSettings={systemSettings}
        selectedThemeId={selectedThemeId}
        onOpenThemeModal={() => setThemeModalOpen(true)}
        onOpenSecurityModal={() => setSecurityModalOpen(true)}
        minimalistMode={minimalistMode}
        onToggleMinimalistMode={(val) => {
          setMinimalistMode(val);
          localStorage.setItem('2click_minimalist_mode', String(val));
        }}
      >
        {/* LOW NETWORK & OFFLINE OPTIMIZATION NOTICE */}
        {(!isOnline || lowNetworkNotice) && (
          <div className="mb-3 px-3.5 py-2 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center justify-between gap-2 shadow-xs transition">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
              <span>
                {!isOnline 
                  ? "⚡ ऑफ़लाइन मोड सक्रिय (Offline Mode Active) — लोकल कैश्ड डाटा एवं त्वरित रेस्पोंस लोडेड!" 
                  : "📶 धीमा नेटवर्क मोड (Low Network Connection Detected) — स्मूथ लोडिंग एवं लाइटवेट एसेट मोड सक्रिय!"}
              </span>
            </div>
            <button 
              onClick={() => setLowNetworkNotice(false)} 
              className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100 shrink-0"
            >
              ठीक है
            </button>
          </div>
        )}

        {/* ACCESS DENIED ROUTE GUARD TOAST */}
        {accessDeniedToast && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-950 text-rose-100 border border-rose-500/80 shadow-2xl flex items-center justify-between gap-3 animate-shake">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 font-bold">🚫</span>
              <div>
                <h4 className="font-bold text-xs text-rose-300">Access Denied &amp; Redirected</h4>
                <p className="text-xs text-rose-100">{accessDeniedToast}</p>
              </div>
            </div>
            <button
              onClick={() => setAccessDeniedToast(null)}
              className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
            >
              Dismiss
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="gpu-accelerated space-y-6"
          >
            {activeTab === 'home' && (
              <HeroSection
                onNavigate={handleNavigateFromHero}
                selectedCity={selectedCity}
                currentUser={currentUser}
                onOpenAuth={() => handleOpenAuth('login')}
              />
            )}

            {activeTab === 'construction' && (
              <AiBoqCalculator selectedCity={selectedCity} />
            )}

            {activeTab === 'ca_gst' && (
              <CaGstComplianceHub 
                selectedCity={selectedCity}
                onOpenAuth={() => handleOpenAuth('login')}
              />
            )}

            {activeTab === 'tiles_marble' && (
              <TilesMarbleStudio 
                selectedCity={selectedCity}
                onNavigateToVendors={() => setActiveTab('vendors_binding')}
                onOpenAuth={() => handleOpenAuth('login')}
              />
            )}

            {activeTab === 'paints_catalog' && (
              <PaintingMaterialCatalogHub
                currentUser={currentUser}
                onOpenAuth={() => handleOpenAuth('login')}
              />
            )}

            {activeTab === 'water_etp_stp' && (
              <WaterEtpStpCalc 
                selectedCity={selectedCity}
                onNavigateToVendors={(cat) => {
                  setActiveTab('vendors_binding');
                }}
              />
            )}

            {activeTab === 'electrical_elv' && (
              <ElectricalElvStudio 
                selectedCity={selectedCity}
                onNavigateToVendors={(cat) => {
                  setActiveTab('vendors_binding');
                }}
              />
            )}

            {activeTab === 'hyperlocal_directory' && (
              <HyperLocalDirectory />
            )}

            {activeTab === 'vendor_enrolment' && (
              <VendorEnrolmentForm />
            )}

            {(activeTab === 'bidding_hub' || activeTab === 'bidding_suite') && (
              <BiddingTenderHub />
            )}

            {activeTab === 'vendors_binding' && (
              <VendorBindingHub 
                currentUser={currentUser}
                onOpenAuth={() => handleOpenAuth('login')}
              />
            )}

            {(activeTab === 'vendor_kyc_agreements' || activeTab === 'vendor_kyc') && (
              <VendorShopkeeperAgreementKycHub 
                currentUser={currentUser}
                onOpenAuth={() => handleOpenAuth('login')}
                selectedCity={selectedCity}
              />
            )}

            {activeTab === 'solar' && (
              <SolarRooftopCalc
                selectedCity={selectedCity}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'dukandar_market' && (
              <DukandarMarketplace
                currentUser={currentUser}
                onOpenAuth={() => handleOpenAuth('login')}
              />
            )}

            {activeTab === 'bank_loans' && (
              <BankLoanKycHub
                currentUser={currentUser}
                onOpenAuth={() => handleOpenAuth('login')}
              />
            )}

            {activeTab === 'naksha_vastu' && (
              <NakshaVastuStudio
                currentUser={currentUser}
                onOpenAuth={() => handleOpenAuth('login')}
                selectedCity={selectedCity}
              />
            )}

            {activeTab === 'crm_khatabook' && (
              <CrmErpKhatabookHub
                currentUser={currentUser}
                onOpenAuth={() => handleOpenAuth('login')}
                selectedCity={selectedCity}
              />
            )}

            {activeTab === 'logistics' && (
              <LogisticsHub
                currentUser={currentUser}
                selectedCity={selectedCity}
                onOpenAuth={() => handleOpenAuth('login')}
              />
            )}

            {activeTab === 'super_admin' && (
              <SuperAdminDashboard
                currentUser={currentUser}
                onOpenAuth={() => handleOpenAuth('login')}
                systemSettings={systemSettings}
                onUpdateSystemSettings={handleUpdateSystemSettings}
                onSwitchRole={(newRole) => {
                  if (currentUser) {
                    const updated = { ...currentUser, role: newRole };
                    setCurrentUser(updated);
                    localStorage.setItem('2click_user', JSON.stringify(updated));
                    setActiveTab(getDefaultTabForRole(newRole));
                  }
                }}
              />
            )}

            {activeTab === 'interior' && (
              <InteriorStudio />
            )}

            {activeTab === 'lidar' && (
              <LidarSurveyViewer />
            )}

            {activeTab === 'vr' && (
              <VrWalkthroughViewer />
            )}

            {activeTab === 'dashboard' && (
              <DashboardView
                currentUser={currentUser}
                onOpenAuth={() => handleOpenAuth('login')}
                selectedDashboardPreset={selectedDashboardPreset}
                selectedLanguage={selectedLanguage}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <Footer />
      </Navbar>

      {/* Floating 2click AI Copilot Drawer */}
      <AiCopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        selectedCity={selectedCity}
        activeTab={activeTab}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
        superAdminSecretPin={systemSettings.superAdminSecretPin}
        systemSettings={systemSettings}
      />

      {/* White Label RBAC Login Modal */}
      <WhiteLabelLoginModal
        isOpen={whiteLabelLoginOpen}
        onClose={() => setWhiteLabelLoginOpen(false)}
        brandTitle={activeVendorConfig?.businessName || systemSettings.siteName || '2click.in Hub'}
        onSuccessLogin={(userData) => {
          const userObj: User = {
            id: `usr_${Date.now()}`,
            name: userData.name,
            email: `${userData.name.toLowerCase().replace(/\s+/g, '')}@2click.in`,
            role: userData.role === 'Super Admin' ? 'SuperAdmin' : userData.role === 'Field Admin' ? 'Employee' : 'Client',
            companyName: '2click Partner Hub',
            isKycVerified: true,
          };
          handleAuthSuccess(userObj);
        }}
      />

      {/* Clerk Style User Profile & Account Settings Modal */}
      <UserProfileModal
        isOpen={userProfileModalOpen}
        onClose={() => setUserProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updatedUser) => {
          setCurrentUser(updatedUser);
          localStorage.setItem('2click_user', JSON.stringify(updatedUser));
        }}
        onLogout={handleLogout}
        onOpenSuperAdminPortal={() => handleSetActiveTabWithGuard('super_admin')}
      />

      {/* Public Share Showcase Modal (Triggered by link click ?shareUser=... or preview) */}
      {publicShareUser && (
        <PublicUserShowcaseModal
          user={publicShareUser}
          isOpen={publicShareModalOpen}
          onClose={() => setPublicShareModalOpen(false)}
        />
      )}

      {/* Modern Visual Theme & Minimalist Layout Modal */}
      <ThemeSelectorModal
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        selectedThemeId={selectedThemeId}
        onSelectTheme={(themeId) => {
          setSelectedThemeId(themeId);
          localStorage.setItem('2click_theme_preset', themeId);
        }}
        minimalistMode={minimalistMode}
        onToggleMinimalistMode={(val) => {
          setMinimalistMode(val);
          localStorage.setItem('2click_minimalist_mode', String(val));
        }}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={(code) => {
          setSelectedLanguage(code);
          localStorage.setItem('2click_language', code);
        }}
        selectedDashboardPreset={selectedDashboardPreset}
        onSelectDashboardPreset={(presetId) => {
          setSelectedDashboardPreset(presetId);
          localStorage.setItem('2click_dashboard_preset', presetId);
        }}
      />

      {/* Security & Data Protection Modal */}
      <SecurityProtectionModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
        currentUserRole={currentUser?.role || 'Customer'}
      />

      {/* Mobile App Bottom Navigation Bar — logged-in users only */}
      {currentUser && (
        <MobileBottomNavBar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onToggleCopilot={() => setCopilotOpen(!copilotOpen)} 
        />
      )}

      {/* Universal Double-Click Fullscreen Modal */}
      <FullscreenModal />

      {/* Download App / PWA Mobile Install Prompt */}
      <PwaInstallPrompt onOpenApkModal={() => setApkInstallModalOpen(true)} />

      {/* Mobile App & APK Installer Center Modal */}
      <MobileApkInstallModal
        isOpen={apkInstallModalOpen}
        onClose={() => setApkInstallModalOpen(false)}
      />

      {/* Cyberpunk Secure Session Login Modal */}
      <CyberSecureLoginModal
        isOpen={cyberLoginModalOpen}
        onClose={() => setCyberLoginModalOpen(false)}
        onSuccessLogin={(user) => {
          setCurrentUser(user);
          setSafeLocalStorage('2click_user', user);
          alert(`Welcome back ${user.name}! Neural protocol session authorized.`);
        }}
      />

      </div>
          </LocationProvider>
        </FullscreenProvider>
      </FontSizeProvider>
    </LanguageProvider>
  );
}
