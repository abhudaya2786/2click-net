import React, { useState, useRef, useEffect } from 'react';
import { 
  User as UserIcon, 
  Settings, 
  LayoutDashboard, 
  ShieldCheck, 
  LogOut, 
  ChevronDown, 
  Sparkles, 
  Check, 
  ExternalLink,
  Sliders,
  Bell,
  HelpCircle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { User } from '../types';
import { getRolePermissionDetail } from '../utils/rolePermissions';

interface ClerkUserButtonProps {
  currentUser: User | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenUserProfile: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToSuperAdmin?: () => void;
  isSuperAdminUser?: boolean;
}

export const ClerkUserButton: React.FC<ClerkUserButtonProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenUserProfile,
  onNavigateToDashboard,
  onNavigateToSuperAdmin,
  isSuperAdminUser = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const roleDetail = getRolePermissionDetail(currentUser?.role);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) {
    return (
      <button
        onClick={() => onOpenAuth('login')}
        className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 font-semibold text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
      >
        <UserIcon className="w-3.5 h-3.5" />
        <span>Sign in</span>
      </button>
    );
  }

  const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      
      {/* Clerk Style Avatar Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer group"
        aria-label="User account menu"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold shadow-xs transition-transform group-hover:scale-105">
          {initial}
        </div>
        <div className="hidden md:flex flex-col text-left pr-2">
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 max-w-[110px] truncate leading-tight">
            {currentUser.name}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold max-w-[130px] truncate leading-tight">
            Logged in as: {currentUser.role || 'Member'}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Clerk Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl shadow-xl shadow-zinc-950/15 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-zinc-900 dark:text-zinc-100">
          
          {/* User Profile Header Section */}
          <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                  {currentUser.email || currentUser.phone}
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] border ${roleDetail.badgeBg} ${roleDetail.badgeBorder} ${roleDetail.badgeText}`}>
                      {currentUser.role}
                    </span>
                    {isSuperAdminUser && (
                      <span className="px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-[9px] font-extrabold flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5 text-amber-500" />
                        Admin
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPermissions(!showPermissions)}
                    className="p-1 rounded-md bg-zinc-200/60 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                    title="View specific role permissions"
                  >
                    <HelpCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Info</span>
                  </button>
                </div>

                {/* Expandable Role Permissions Drawer */}
                {showPermissions && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800/80 text-[10px] space-y-1.5 animate-in fade-in duration-150 shadow-inner">
                    <div className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                      <span>{roleDetail.title} Access Rights:</span>
                    </div>
                    <ul className="space-y-1 text-zinc-600 dark:text-zinc-300 font-medium">
                      {roleDetail.keyPermissions.map((p, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Options */}
          <div className="p-1.5 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenUserProfile();
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition flex items-center justify-between cursor-pointer group"
            >
              <span className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition" />
                <span>Manage account</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Clerk</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onNavigateToDashboard();
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition flex items-center gap-2.5 cursor-pointer group"
            >
              <LayoutDashboard className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition" />
              <span>Executive Dashboard</span>
            </button>

            {isSuperAdminUser && onNavigateToSuperAdmin && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToSuperAdmin();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition flex items-center gap-2.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Super Admin Portal</span>
              </button>
            )}
          </div>

          {/* Footer Section: Sign Out */}
          <div className="p-1.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/30">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition flex items-center gap-2.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sign out</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
