import React, { useState } from 'react';
import { MapPin, Smartphone, Bell, LogIn, LogOut, UserCheck } from 'lucide-react';
import { FontSizeWidget } from './FontSizeWidget';
import { LocationSelectorModal } from './LocationSelectorModal';

interface MinimalHeaderProps {
  isLoggedIn: boolean;
  userName?: string;
  userRole?: string;
  activeBrandTitle?: string;
  onOpenLoginModal?: () => void;
  onLoginClick?: () => void;
  onLogoutClick: () => void;
  currentGpsLocation?: string;
}

export const MinimalHeader: React.FC<MinimalHeaderProps> = ({
  isLoggedIn,
  userName = 'User',
  userRole = 'Regular User',
  activeBrandTitle = '2click.in',
  onOpenLoginModal,
  onLoginClick,
  onLogoutClick,
  currentGpsLocation = 'Lucknow Zone'
}) => {
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const handleLogin = onOpenLoginModal || onLoginClick || (() => {});

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/95 backdrop-blur-xl border-b border-blue-500/20 px-4 py-2.5 transition-all shadow-2xl shadow-blue-500/5">
      {/* Top Google Stitch Flow Connecting Line */}
      <div className="absolute top-0 left-0 right-0 google-stitch-flow-line" />

      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* GOOGLE STITCH LOGO & BRAND NAME */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-slate-900 border border-blue-500/40 flex items-center justify-center font-black text-white text-base shadow-xl group overflow-hidden cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-purple-600/30 to-emerald-500/30 group-hover:scale-110 transition duration-300"></div>
            {/* Google Stitch Quad Color Nodes */}
            <div className="relative z-10 flex items-center gap-0.5">
              <span className="w-2 h-2 rounded-full bg-[#4285F4] animate-pulse"></span>
              <span className="w-2 h-2 rounded-full bg-[#EA4335] animate-pulse" style={{ animationDelay: '200ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-[#FBBC05] animate-pulse" style={{ animationDelay: '400ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" style={{ animationDelay: '600ms' }}></span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                {activeBrandTitle}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 font-mono text-[10px] font-extrabold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                2Click AI Engine
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <span>Smart Construction &amp; B2B Ecosystem</span>
            </span>
          </div>
        </div>

        {/* HEADER CONTROLS (GPS, APK, FONT SIZE, NOTIFICATION, LOGIN) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Font Size Widget */}
          <div className="hidden sm:block">
            <FontSizeWidget />
          </div>

          {/* 1. GPS Location Button */}
          <button
            onClick={() => setShowLocationModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-teal-500/40 text-amber-300 text-xs font-black transition shadow-lg shadow-teal-500/10 cursor-pointer hover:border-teal-400"
            title="🇮🇳 India | 🇳🇵 Nepal Complete Region Hierarchy & GPS"
          >
            <MapPin size={14} className="animate-pulse text-amber-400 shrink-0" />
            <span className="hidden sm:inline">🇮🇳 India | 🇳🇵 Nepal ({currentGpsLocation})</span>
            <span className="sm:hidden font-extrabold text-[11px]">🇮🇳|🇳🇵 {currentGpsLocation}</span>
          </button>

          <LocationSelectorModal
            isOpen={showLocationModal}
            onClose={() => setShowLocationModal(false)}
          />

          {/* 2. App / APK Download */}
          <a
            href="#download-apk"
            onClick={(e) => { e.preventDefault(); alert('Google Flow Ready Android APK डाउनलोड हो रहा है...'); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-purple-500/30 text-purple-300 text-xs font-bold transition cursor-pointer"
          >
            <Smartphone size={14} className="text-purple-400" />
            <span className="hidden sm:inline font-mono">Flow APK</span>
          </a>

          {/* 3. Notification */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition relative"
              title="Notifications"
            >
              <Bell size={16} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 text-xs space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white">नोटिफिकेशन्स</span>
                  <button onClick={() => setUnreadNotifications(0)} className="text-[10px] text-emerald-400 hover:underline">
                    Clear
                  </button>
                </div>
                <div className="space-y-1.5 text-slate-300 text-[11px]">
                  <div className="p-2 bg-slate-950 rounded-xl">📍 नया सोलर कोटेशन अपडेट हुआ।</div>
                </div>
              </div>
            )}
          </div>

          {/* 4. 🔴 CLEAR & PROMINENT LOGIN BUTTON */}
          {!isLoggedIn ? (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/25 transform active:scale-95 cursor-pointer"
            >
              <LogIn size={15} />
              <span>Login / Sign In</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 pl-3">
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <UserCheck size={12} className="text-emerald-400" /> {userName}
                </div>
                <div className="text-[9px] text-slate-400 uppercase font-mono">{userRole}</div>
              </div>
              <button
                onClick={onLogoutClick}
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 transition cursor-pointer"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
