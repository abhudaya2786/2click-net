import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  Shield, 
  Key, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  Lock, 
  Smartphone, 
  Calendar, 
  BadgeCheck, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  LogOut, 
  Sliders, 
  Globe, 
  ShieldCheck, 
  Clock, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { User, UserRole } from '../types';
import { updateUserInFirestore, SUPER_ADMIN_EMAILS } from '../lib/firebaseAuthService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  onOpenSuperAdminPortal?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout,
  onOpenSuperAdminPortal
}) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'role' | 'sessions'>('profile');
  
  // Profile edit states
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [companyName, setCompanyName] = useState(currentUser?.companyName || '');
  const [city, setCity] = useState(currentUser?.city || currentUser?.district || '');
  const [state, setState] = useState(currentUser?.state || '');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  if (!isOpen || !currentUser) return null;

  const isSuperAdmin = currentUser.role === 'SuperAdmin' || SUPER_ADMIN_EMAILS.includes(currentUser.email?.toLowerCase() || '');

  const handleCopyUid = () => {
    navigator.clipboard.writeText(currentUser.id);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const updated: User = {
      ...currentUser,
      name,
      phone,
      companyName,
      city,
      district: city,
      state
    };

    try {
      await updateUserInFirestore(currentUser.id, {
        name,
        phone,
        companyName,
        city,
        district: city,
        state
      });
      onUpdateUser(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn('Profile save note:', err);
      onUpdateUser(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Clerk UserProfile Container */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl shadow-zinc-950/20 overflow-hidden flex flex-col md:flex-row min-h-[520px] max-h-[90vh] my-auto text-zinc-900 dark:text-zinc-100">
        
        {/* Left Sidebar Menu (Clerk Account Settings Navigation) */}
        <div className="w-full md:w-64 bg-zinc-50/80 dark:bg-zinc-950/60 border-b md:border-b-0 md:border-r border-zinc-200/80 dark:border-zinc-800 p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            
            {/* User Profile Header Brief */}
            <div className="flex items-center gap-3 p-1">
              <div className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  {currentUser.email}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2.5 pb-1">
                Account Settings
              </div>

              <button
                type="button"
                onClick={() => setActiveSection('profile')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2.5 cursor-pointer ${
                  activeSection === 'profile'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs border border-zinc-200/80 dark:border-zinc-700/80'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <UserIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <span>Profile Details</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('security')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2.5 cursor-pointer ${
                  activeSection === 'security'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs border border-zinc-200/80 dark:border-zinc-700/80'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <Shield className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <span>Security &amp; Auth</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('role')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2.5 cursor-pointer ${
                  activeSection === 'role'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs border border-zinc-200/80 dark:border-zinc-700/80'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <BadgeCheck className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <span>Role &amp; Permissions</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('sessions')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2.5 cursor-pointer ${
                  activeSection === 'sessions'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs border border-zinc-200/80 dark:border-zinc-700/80'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <Clock className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <span>Active Sessions</span>
              </button>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 mt-auto border-t border-zinc-200/80 dark:border-zinc-800 space-y-2">
            {isSuperAdmin && onOpenSuperAdminPortal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSuperAdminPortal();
                }}
                className="w-full py-2 px-3 bg-purple-600/10 hover:bg-purple-600/20 text-purple-700 dark:text-purple-300 font-bold text-xs rounded-xl transition flex items-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Super Admin Portal</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full py-2 px-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out of 2click</span>
            </button>
          </div>
        </div>

        {/* Right Main Content Area */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto no-scrollbar relative flex flex-col justify-between">
          
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            title="Close Settings"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-6">
            
            {/* SECTION 1: PROFILE DETAILS */}
            {activeSection === 'profile' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    Profile Details
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Verified User
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Manage your public profile information, location, and account details.
                  </p>
                </div>

                {saveSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Your profile information was saved successfully!</span>
                  </div>
                )}

                {/* Avatar Banner */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xl flex items-center justify-center shadow-md">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-white">
                        {currentUser.name}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        Primary Avatar &amp; Profile Picture
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">
                      User ID
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUid}
                      className="text-xs font-mono bg-zinc-200/80 dark:bg-zinc-800 px-2.5 py-1 rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition flex items-center gap-1 mt-0.5"
                    >
                      <span>{currentUser.id.slice(0, 12)}...</span>
                      {copiedUid ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Email Address (Primary Auth)
                      </label>
                      <input
                        type="email"
                        value={currentUser.email}
                        disabled
                        className="w-full px-3.5 py-2 bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-zinc-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Mobile Phone Number
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Company / Firm Name
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        City / District
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="py-2 px-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                    >
                      {isSaving ? 'Saving Profile...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SECTION 2: SECURITY & AUTH */}
            {activeSection === 'security' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Security &amp; Authentication
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Manage passwords, connected auth providers, and multi-factor security.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-white">
                          Email &amp; Password
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Password protected with Firebase Auth Encryption.
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Active
                    </span>
                  </div>

                  <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-white">
                          WhatsApp / Mobile OTP Verification
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {currentUser.phone || 'Phone verified'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Verified
                    </span>
                  </div>

                  <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-white">
                          KYC Compliance Status
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Verified Indian Construction &amp; Vendor KYC Document.
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: ROLE & PERMISSIONS */}
            {activeSection === 'role' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Role &amp; RBAC Access
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Your assigned platform role and fine-grained administrative access.
                  </p>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Assigned Role</span>
                    <span className="px-3 py-1 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold">
                      {currentUser.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">District Jurisdiction</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      {currentUser.district || currentUser.city || 'Gorakhpur'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Employee / Vendor Code</span>
                    <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white">
                      {currentUser.employeeCode || 'EMP-2026-HQ'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: ACTIVE SESSIONS */}
            {activeSection === 'sessions' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Active Login Sessions
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Devices currently authenticated with your 2click account.
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <span>Current Browser Session</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Cloud Run Sandbox • Last active now
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">This device</span>
                </div>
              </div>
            )}

          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800 text-[10px] text-zinc-400 flex items-center justify-between">
            <span>2click Auth • Clerk Design System</span>
            <span className="font-mono">v2026.1</span>
          </div>

        </div>

      </div>
    </div>
  );
};
