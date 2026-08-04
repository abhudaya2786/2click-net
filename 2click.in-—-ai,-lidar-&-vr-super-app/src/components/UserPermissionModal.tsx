import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Check, 
  Sliders, 
  Sparkles, 
  Building2, 
  Sun, 
  Store, 
  Landmark, 
  Droplets, 
  Zap, 
  Gavel, 
  Box, 
  Eye, 
  Compass, 
  BookOpen, 
  Tag, 
  FileText, 
  UserCheck,
  CheckCircle2,
  Lock,
  RotateCcw,
  Truck
} from 'lucide-react';
import { User, UserPermissions, UserRole } from '../types';

interface UserPermissionModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSavePermissions: (userId: string, newPermissions: UserPermissions, updatedUserProps?: Partial<User>) => void;
  onPreviewUserDashboard?: (userWithPermissions: User) => void;
}

export const PERMISSION_MODULE_DEFINITIONS = [
  { key: 'canAccessCivilBoq', label: 'Civil BOQ & Material Estimator', category: 'Engineering', icon: Building2, desc: 'Cement, steel, brick & aggregate calculation studio' },
  { key: 'canAccessSolarEngine', label: 'Solar Rooftop & Subsidy Calculator', category: 'Renewable', icon: Sun, desc: 'Rooftop solar panel, battery & Govt subsidy engine' },
  { key: 'canAccessDukandarMarket', label: 'Dukandar B2B Shopkeeper Portal', category: 'Commerce', icon: Store, desc: 'Wholesale product catalog, inventory & customer orders' },
  { key: 'canAccessLogistics', label: 'Logistics, Fleet & E-Way Freight Hub', category: 'Transport', icon: Truck, desc: 'Bulk tippers, Tata Ace, crane trailers, freight calculator & E-Way Tracking' },
  { key: 'canAccessBankLoans', label: 'Bank Loans & Credit Sanction Hub', category: 'Finance', icon: Landmark, desc: 'Loan applications, interest rate comparison & credit verification' },
  { key: 'canAccessWaterEtpStp', label: 'Water Treatment & ETP/STP Studio', category: 'Engineering', icon: Droplets, desc: 'Sewage plant design, flow rates & chemical dosage' },
  { key: 'canAccessElectricalMep', label: 'Electrical MEP & Transformer Studio', category: 'Engineering', icon: Zap, desc: 'Load calculations, single line diagram & panel sizing' },
  { key: 'canAccessVendorBidding', label: 'Vendor Bidding & Escrow Procurement', category: 'Procurement', icon: Gavel, desc: 'Tender submissions, competitive bids & escrow deposits' },
  { key: 'canAccessLidarSurveys', label: 'LiDAR 3D Point Cloud Survey', category: 'Tech', icon: Box, desc: 'Drone elevation data, contours & site survey maps' },
  { key: 'canAccessVrTour', label: 'VR 360 Degree Walkthrough Studio', category: 'Tech', icon: Eye, desc: '3D spatial design walkthrough & client presentation' },
  { key: 'canAccessNakshaVastu', label: '2D Naksha Blueprint & Vastu Engine', category: 'Architecture', icon: Compass, desc: 'House plan floor layouts & Vastu compass analysis' },
  { key: 'canAccessKhatabookCrm', label: 'Khatabook Ledger & B2B CRM', category: 'Business', icon: BookOpen, desc: 'Customer balance register, GST invoices & payment reminders' },
  { key: 'canEditProductPrices', label: 'Edit Product Rates & Wholesale Offers', category: 'Admin Control', icon: Tag, desc: 'Ability to change material price tags & discount banners' },
  { key: 'canDownloadPdfReports', label: 'Download Official PDF Reports & BOQs', category: 'Reports', icon: FileText, desc: 'Exporting branded PDFs for bank loans & government tenders' },
];

export const getDefaultPermissionsForRole = (role: UserRole): UserPermissions => {
  if (role === 'SuperAdmin' || role === 'DistrictAdmin') {
    return {
      canAccessCivilBoq: true,
      canAccessSolarEngine: true,
      canAccessDukandarMarket: true,
      canAccessBankLoans: true,
      canAccessWaterEtpStp: true,
      canAccessElectricalMep: true,
      canAccessVendorBidding: true,
      canAccessLidarSurveys: true,
      canAccessVrTour: true,
      canAccessNakshaVastu: true,
      canAccessKhatabookCrm: true,
      canEditProductPrices: true,
      canApproveVendorListings: true,
      canDownloadPdfReports: true,
    };
  }
  if (role === 'Dukandar' || role === 'Supplier') {
    return {
      canAccessCivilBoq: false,
      canAccessSolarEngine: true,
      canAccessDukandarMarket: true,
      canAccessBankLoans: true,
      canAccessWaterEtpStp: false,
      canAccessElectricalMep: false,
      canAccessVendorBidding: true,
      canAccessLidarSurveys: false,
      canAccessVrTour: false,
      canAccessNakshaVastu: false,
      canAccessKhatabookCrm: true,
      canEditProductPrices: true,
      canApproveVendorListings: false,
      canDownloadPdfReports: true,
    };
  }
  if (role === 'Contractor' || role === 'Architect' || role === 'Electrician' || role === 'Plumber') {
    return {
      canAccessCivilBoq: true,
      canAccessSolarEngine: true,
      canAccessDukandarMarket: true,
      canAccessBankLoans: false,
      canAccessWaterEtpStp: true,
      canAccessElectricalMep: true,
      canAccessVendorBidding: true,
      canAccessLidarSurveys: true,
      canAccessVrTour: true,
      canAccessNakshaVastu: true,
      canAccessKhatabookCrm: true,
      canEditProductPrices: false,
      canApproveVendorListings: false,
      canDownloadPdfReports: true,
    };
  }
  return {
    canAccessCivilBoq: true,
    canAccessSolarEngine: true,
    canAccessDukandarMarket: true,
    canAccessBankLoans: true,
    canAccessWaterEtpStp: true,
    canAccessElectricalMep: true,
    canAccessVendorBidding: true,
    canAccessLidarSurveys: true,
    canAccessVrTour: true,
    canAccessNakshaVastu: true,
    canAccessKhatabookCrm: true,
    canEditProductPrices: false,
    canApproveVendorListings: false,
    canDownloadPdfReports: true,
  };
};

export const UserPermissionModal: React.FC<UserPermissionModalProps> = ({
  user,
  isOpen,
  onClose,
  onSavePermissions,
  onPreviewUserDashboard
}) => {
  if (!isOpen || !user) return null;

  const [permissions, setPermissions] = useState<UserPermissions>(() => {
    return user.permissions || getDefaultPermissionsForRole(user.role);
  });

  const [userRole, setUserRole] = useState<UserRole>(user.role);
  const [userStatus, setUserStatus] = useState<'Active' | 'Suspended' | 'Pending Verification'>(user.status || 'Active');
  const [savedSuccessToast, setSavedSuccessToast] = useState(false);

  useEffect(() => {
    setPermissions(user.permissions || getDefaultPermissionsForRole(user.role));
    setUserRole(user.role);
    setUserStatus(user.status || 'Active');
  }, [user]);

  const togglePermission = (key: string) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const applyPreset = (presetType: 'all_access' | 'dukandar' | 'contractor' | 'minimal') => {
    if (presetType === 'all_access') {
      const full: UserPermissions = {};
      PERMISSION_MODULE_DEFINITIONS.forEach(m => { full[m.key] = true; });
      setPermissions(full);
    } else if (presetType === 'dukandar') {
      setPermissions({
        canAccessCivilBoq: false,
        canAccessSolarEngine: true,
        canAccessDukandarMarket: true,
        canAccessBankLoans: true,
        canAccessWaterEtpStp: false,
        canAccessElectricalMep: false,
        canAccessVendorBidding: true,
        canAccessLidarSurveys: false,
        canAccessVrTour: false,
        canAccessNakshaVastu: false,
        canAccessKhatabookCrm: true,
        canEditProductPrices: true,
        canDownloadPdfReports: true,
      });
    } else if (presetType === 'contractor') {
      setPermissions({
        canAccessCivilBoq: true,
        canAccessSolarEngine: true,
        canAccessDukandarMarket: true,
        canAccessBankLoans: false,
        canAccessWaterEtpStp: true,
        canAccessElectricalMep: true,
        canAccessVendorBidding: true,
        canAccessLidarSurveys: true,
        canAccessVrTour: true,
        canAccessNakshaVastu: true,
        canAccessKhatabookCrm: true,
        canEditProductPrices: false,
        canDownloadPdfReports: true,
      });
    } else if (presetType === 'minimal') {
      setPermissions({
        canAccessCivilBoq: true,
        canAccessSolarEngine: false,
        canAccessDukandarMarket: true,
        canAccessBankLoans: false,
        canAccessWaterEtpStp: false,
        canAccessElectricalMep: false,
        canAccessVendorBidding: false,
        canAccessLidarSurveys: false,
        canAccessVrTour: false,
        canAccessNakshaVastu: false,
        canAccessKhatabookCrm: true,
        canEditProductPrices: false,
        canDownloadPdfReports: false,
      });
    }
  };

  const handleSave = () => {
    onSavePermissions(user.id, permissions, { role: userRole, status: userStatus });
    setSavedSuccessToast(true);
    setTimeout(() => {
      setSavedSuccessToast(false);
      onClose();
    }, 1200);
  };

  const handleSaveAndPreview = () => {
    const updatedUser: User = {
      ...user,
      role: userRole,
      status: userStatus,
      permissions
    };
    onSavePermissions(user.id, permissions, { role: userRole, status: userStatus });
    if (onPreviewUserDashboard) {
      onPreviewUserDashboard(updatedUser);
    }
    onClose();
  };

  const activeCount = Object.values(permissions).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 text-white relative border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/20 border border-indigo-400/40 rounded-2xl text-indigo-300">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-lg text-[10px] font-black uppercase tracking-wider">
                  Super Admin User-Wise Permissions Command
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {user.name} - कस्टमाइज्ड डैशबोर्ड परमिशन (User Permission Matrix)
                </h2>
                <p className="text-xs text-slate-300">
                  {user.email} • ID: {user.id} • District: {user.district || user.city || 'National'}
                </p>
              </div>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl border border-white/20 text-right shrink-0">
              <span className="text-[10px] text-indigo-200 uppercase font-black block">Active Modules Granted</span>
              <span className="text-xl font-black text-emerald-400">{activeCount} / {PERMISSION_MODULE_DEFINITIONS.length}</span>
            </div>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">

          {/* Toast Notification */}
          {savedSuccessToast && (
            <div className="p-3 bg-emerald-600 text-white font-black text-xs rounded-2xl flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>User Permissions Successfully Saved! Redirecting...</span>
            </div>
          )}

          {/* USER BASIC PROFILE & ROLE CONFIG */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                User Assigned Role
              </label>
              <select
                value={userRole}
                onChange={(e) => {
                  const newR = e.target.value as UserRole;
                  setUserRole(newR);
                  // Option to auto-load role defaults if requested
                }}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="SuperAdmin">SuperAdmin</option>
                <option value="DistrictAdmin">DistrictAdmin</option>
                <option value="DistrictEmployee">DistrictEmployee</option>
                <option value="Dukandar">Dukandar (Shopkeeper)</option>
                <option value="Supplier">Supplier</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Architect">Architect</option>
                <option value="Contractor">Contractor</option>
                <option value="Client">Client</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                Account Security Status
              </label>
              <select
                value={userStatus}
                onChange={(e) => setUserStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="Active">Active (Full Access Allowed)</option>
                <option value="Suspended">Suspended (Access Restricted)</option>
                <option value="Pending Verification">Pending Verification</option>
              </select>
            </div>

            {/* QUICK PRESETS */}
            <div>
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                Quick Permission Presets
              </label>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => applyPreset('all_access')}
                  className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950 hover:bg-indigo-200 text-indigo-800 dark:text-indigo-300 rounded-lg text-[10px] font-black border border-indigo-300/40"
                >
                  Full Access
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('dukandar')}
                  className="px-2.5 py-1 bg-teal-100 dark:bg-teal-950 hover:bg-teal-200 text-teal-800 dark:text-teal-300 rounded-lg text-[10px] font-black border border-teal-300/40"
                >
                  Dukandar
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('contractor')}
                  className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 hover:bg-amber-200 text-amber-800 dark:text-amber-300 rounded-lg text-[10px] font-black border border-amber-300/40"
                >
                  Contractor
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('minimal')}
                  className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-black"
                >
                  Minimal
                </button>
              </div>
            </div>
          </div>

          {/* PERMISSION TILES MATRIX */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Select Authorized Dashboard Modules For {user.name}
              </h3>
              <span className="text-xs text-slate-400 font-bold">Click tile to Toggle Permission</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PERMISSION_MODULE_DEFINITIONS.map((m) => {
                const IconComp = m.icon;
                const isAllowed = permissions[m.key] ?? false;

                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => togglePermission(m.key)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 relative ${
                      isAllowed
                        ? 'bg-gradient-to-br from-indigo-50/90 to-emerald-50/50 dark:from-indigo-950/60 dark:to-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/40'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl border ${
                          isAllowed 
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs' 
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                        }`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                            {m.category}
                          </span>
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight block">
                            {m.label}
                          </span>
                        </div>
                      </div>

                      <div className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 flex items-center gap-1 ${
                        isAllowed
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {isAllowed ? <Check className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        <span>{isAllowed ? 'ALLOWED' : 'LOCKED'}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {m.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-semibold text-center sm:text-left">
            💡 परमिशन सेव करने पर उपयोगकर्ता के अकाउंट में केवल चुने गए मोड्यूल्स ही खुलेंगे।
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-300 transition w-1/2 sm:w-auto"
            >
              Cancel
            </button>

            {onPreviewUserDashboard && (
              <button
                type="button"
                onClick={handleSaveAndPreview}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl shadow-md transition flex items-center justify-center gap-1.5 w-1/2 sm:w-auto"
              >
                <Eye className="w-4 h-4" />
                <span>Save &amp; Open User Dashboard</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <Check className="w-4 h-4" />
              <span>Save Permissions</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
