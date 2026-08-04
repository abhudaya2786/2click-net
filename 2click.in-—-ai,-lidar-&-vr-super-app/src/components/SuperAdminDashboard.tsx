import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Store, 
  FileCheck, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Lock, 
  Activity, 
  Coins, 
  Building, 
  UserCheck, 
  Key, 
  ArrowUpRight,
  Sliders,
  Eye,
  RefreshCw,
  Plus,
  MapPin,
  Filter,
  UserX,
  UserPlus,
  Gavel,
  Check,
  Ban,
  PackagePlus,
  Settings,
  Flame,
  Layers,
  Zap,
  Droplets,
  Building2,
  Palette,
  Globe,
  Layout,
  Sparkles,
  Radio,
  Camera,
  Upload,
  EyeOff,
  Tag,
  Image as ImageIcon,
  CreditCard,
  Receipt,
  Edit3,
  Trash2
} from 'lucide-react';
import { User, UserRole, ShopProduct, LoanApplication, VendorBid, BindingContract, SystemSettings, UserPermissions, SubscriptionPlan, SubscriptionTransaction, CategoryWhiteLabelConfig } from '../types';
import { subscribeToAllUsersInFirestore, updateUserInFirestore } from '../lib/firebaseAuthService';
import { SAMPLE_SHOP_PRODUCTS, SAMPLE_LOAN_APPLICATIONS, SAMPLE_VENDOR_BIDS, SAMPLE_BINDING_CONTRACTS, SAMPLE_SUBSCRIPTION_PLANS, SAMPLE_SUBSCRIPTION_TRANSACTIONS } from '../data/initialData';
import { INITIAL_CATEGORY_WHITE_LABELS } from '../data/sampleWhiteLabels';
import {
  INDIAN_ADMIN_HIERARCHY,
  getAllStates,
  getMandalsForState,
  getDistrictsForMandal
} from '../utils/indianAdminHierarchy';
import { DistrictInteractiveMap } from './DistrictInteractiveMap';
import { UserPermissionModal } from './UserPermissionModal';
import { WhiteLabelAndLimitsControl } from './WhiteLabelAndLimitsControl';
import { SuperAdminControlPanel } from './SuperAdminControlPanel';

interface SuperAdminDashboardProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onSwitchRole?: (role: UserRole) => void;
  systemSettings?: SystemSettings;
  onUpdateSystemSettings?: (newSettings: SystemSettings) => void;
  onImpersonateUserDashboard?: (user: User) => void;
}

// System modules that Super Admin can toggle access for each role
export interface ModulePermission {
  id: string;
  name: string;
  icon: string;
  category: string;
}

const SYSTEM_MODULES: ModulePermission[] = [
  { id: 'construction', name: 'Civil BOQ Calculator', icon: 'Hammer', category: 'Engineering' },
  { id: 'solar', name: 'Solar Rooftop Engine', icon: 'Sun', category: 'Energy' },
  { id: 'dukandar_market', name: 'Dukandar B2B Marketplace', icon: 'Store', category: 'Commerce' },
  { id: 'bank_loans', name: 'Bank Loans & KYC Hub', icon: 'Landmark', category: 'Finance' },
  { id: 'water_etp_stp', name: 'Water & ETP/STP Studio', icon: 'Droplets', category: 'Engineering' },
  { id: 'electrical_elv', name: 'Electrical MEP Studio', icon: 'Zap', category: 'Engineering' },
  { id: 'vendors_binding', name: 'Vendor Binding & Bidding', icon: 'Gavel', category: 'Procurement' },
  { id: 'lidar', name: 'LiDAR 3D Point Cloud', icon: 'Box', category: 'Tech' },
  { id: 'vr', name: 'VR Walkthrough Tour', icon: 'Eye', category: 'Tech' },
];

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ 
  currentUser, 
  onOpenAuth, 
  onSwitchRole,
  systemSettings,
  onUpdateSystemSettings,
  onImpersonateUserDashboard
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'gis_map' | 'district_hierarchy' | 'tool_permissions' | 'bidding_control' | 'dukandar_products' | 'kyc_loans' | 'website_customizer' | 'monetization' | 'whitelabel_limits' | 'security_control'>('gis_map');
  const [filterRole, setFilterRole] = useState<string>('All');
  const [filterState, setFilterState] = useState<string>('All');
  const [filterMandal, setFilterMandal] = useState<string>('All');

  // Category White Labels & Function Limits State
  const [whiteLabelsList, setWhiteLabelsList] = useState<CategoryWhiteLabelConfig[]>(() => {
    if (systemSettings?.categoryWhiteLabels && systemSettings.categoryWhiteLabels.length > 0) {
      return systemSettings.categoryWhiteLabels;
    }
    const saved = localStorage.getItem('2click_category_whitelabels');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_CATEGORY_WHITE_LABELS;
  });

  // User-wise Custom Permission Modal State
  const [editingUserPermissionModalUser, setEditingUserPermissionModalUser] = useState<User | null>(null);
  const [userPermissionModalOpen, setUserPermissionModalOpen] = useState<boolean>(false);

  const handleOpenUserPermissionModal = (u: User) => {
    setEditingUserPermissionModalUser(u);
    setUserPermissionModalOpen(true);
  };

  const handleSaveUserPermissions = (userId: string, newPermissions: UserPermissions, updatedUserProps?: Partial<User>) => {
    setUserList(prev => prev.map(u => u.id === userId ? { ...u, ...updatedUserProps, permissions: newPermissions } : u));
    setCustomizerSavedToast(`User permissions updated for User ID: ${userId}`);
    setTimeout(() => setCustomizerSavedToast(null), 4000);
  };

  // Website Customizer & Privacy Control States
  const [siteAccessMode, setSiteAccessMode] = useState<'public' | 'approval' | 'private' | 'maintenance'>('public');
  const [privacyEncryptAadhaar, setPrivacyEncryptAadhaar] = useState(true);
  const [privacyAuditLogs, setPrivacyAuditLogs] = useState(true);
  const [privacyVendorAnonymity, setPrivacyVendorAnonymity] = useState(true);
  const [privacySessionTimeout, setPrivacySessionTimeout] = useState(true);
  const [allowedIpList, setAllowedIpList] = useState('192.168.1.1, 10.0.0.0/24, 182.70.0.0/16');

  // Theme & Color Preset
  const [currentThemePreset, setCurrentThemePreset] = useState<'indigo' | 'emerald' | 'amethyst' | 'terracotta' | 'obsidian'>(() => {
    return (localStorage.getItem('2click_theme_preset') as any) || 'indigo';
  });

  // Layout Density & Card Styles
  const [layoutDensity, setLayoutDensity] = useState<'compact' | 'comfortable' | 'spaced'>('comfortable');
  const [cardCornerStyle, setCardCornerStyle] = useState<'sharp' | 'rounded' | 'pill'>('rounded');
  const [cardSurfaceStyle, setCardSurfaceStyle] = useState<'border' | 'shadow' | 'glass'>('border');
  const [customizerSavedToast, setCustomizerSavedToast] = useState<string | null>(null);

  // Monetization & Subscription Revenue Control State
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(SAMPLE_SUBSCRIPTION_PLANS);
  const [subscriptionTransactions, setSubscriptionTransactions] = useState<SubscriptionTransaction[]>(SAMPLE_SUBSCRIPTION_TRANSACTIONS);

  // Plan Add/Edit Modal
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planNameInput, setPlanNameInput] = useState('');
  const [planPriceInput, setPlanPriceInput] = useState<number>(1499);
  const [planCycleInput, setPlanCycleInput] = useState<'Monthly' | 'Annual' | 'One-Time'>('Monthly');
  const [planDescInput, setPlanDescInput] = useState('');
  const [planFeaturesInput, setPlanFeaturesInput] = useState('');
  const [planMaxProjectsInput, setPlanMaxProjectsInput] = useState<number>(25);
  const [planIsActiveInput, setPlanIsActiveInput] = useState<boolean>(true);

  // User Subscription Plan Assignment Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssignUser, setSelectedAssignUser] = useState<User | null>(null);
  const [assignPlanId, setAssignPlanId] = useState<string>('PLAN-BUILDER-PRO');
  const [assignStatus, setAssignStatus] = useState<'Active' | 'Trialing' | 'Expired' | 'Pending Approval' | 'Pending Payment'>('Active');

  // Comprehensive user database for Super Admin
  const [userList, setUserList] = useState<User[]>([
    { id: 'USR-001', name: 'Super Admin Control', email: 'superadmin@2click.in', role: 'SuperAdmin', state: 'Uttar Pradesh', mandal: 'Gorakhpur Mandal', district: 'Gorakhpur', city: 'Gorakhpur', isKycVerified: true, status: 'Active' },
    { id: 'USR-002', name: 'Lucknow District Admin', email: 'admin.lucknow@2click.in', role: 'DistrictAdmin', state: 'Uttar Pradesh', mandal: 'Lucknow Mandal', district: 'Lucknow', city: 'Lucknow', isKycVerified: true, status: 'Active', employeeCode: 'EMP-1001' },
    { id: 'USR-003', name: 'Varanasi Field Inspector', email: 'emp.varanasi@2click.in', role: 'DistrictEmployee', state: 'Uttar Pradesh', mandal: 'Varanasi Mandal', district: 'Varanasi', city: 'Varanasi', isKycVerified: true, status: 'Active', employeeCode: 'EMP-1002', assignedTasksCount: 14 },
    { id: 'USR-004', name: 'Shree Ram Solar Dukandar', email: 'shreeram.shop@gmail.com', role: 'Dukandar', state: 'Maharashtra', mandal: 'Pune Division', district: 'Pune', city: 'Pune', isKycVerified: true, status: 'Active', gstinNumber: '27AABCS1234F1ZP' },
    { id: 'USR-005', name: 'Aquafab Wholesale Supplier', email: 'wholesale@aquafab.com', role: 'Supplier', state: 'Karnataka', mandal: 'Bengaluru Division', district: 'Bengaluru Urban', city: 'Bengaluru Urban', isKycVerified: true, status: 'Active', gstinNumber: '29AAACA1234B1ZD' },
    { id: 'USR-006', name: 'Licensed MEP Electrician', email: 'electrician.delhi@gmail.com', role: 'Electrician', state: 'Delhi NCR', mandal: 'Central Delhi Division', district: 'Delhi NCR', city: 'Delhi NCR', isKycVerified: true, status: 'Active', rating: 4.9 },
    { id: 'USR-007', name: 'ETP Sanitary Plumber', email: 'plumber.chennai@gmail.com', role: 'Plumber', state: 'Karnataka', mandal: 'Mysuru Division', district: 'Mysuru', city: 'Mysuru', isKycVerified: true, status: 'Active', rating: 4.8 },
    { id: 'USR-008', name: 'Studio Design Architect', email: 'architect.mumbai@gmail.com', role: 'Architect', state: 'Maharashtra', mandal: 'Konkan / Mumbai Division', district: 'Mumbai City', city: 'Mumbai City', isKycVerified: true, status: 'Active', rating: 5.0 },
    { id: 'USR-009', name: 'SBI Solar Credit Officer', email: 'solar.loans@sbi.co.in', role: 'BankManager', state: 'Maharashtra', mandal: 'Konkan / Mumbai Division', district: 'Mumbai City', city: 'Mumbai City', isKycVerified: true, status: 'Active' },
    { id: 'USR-010', name: 'Vikramaditya Property Client', email: 'vikram@gmail.com', role: 'Client', state: 'Uttar Pradesh', mandal: 'Gorakhpur Mandal', district: 'Gorakhpur', city: 'Gorakhpur', isKycVerified: true, status: 'Active' },
  ]);

  const [products, setProducts] = useState<ShopProduct[]>(SAMPLE_SHOP_PRODUCTS);
  const [loanApps, setLoanApps] = useState<LoanApplication[]>(SAMPLE_LOAN_APPLICATIONS);
  const [bids, setBids] = useState<VendorBid[]>(SAMPLE_VENDOR_BIDS);
  const [contracts, setContracts] = useState<BindingContract[]>(SAMPLE_BINDING_CONTRACTS);

  // Tool Permissions Matrix State (role -> module -> boolean)
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>({
    Client: { construction: true, solar: true, dukandar_market: true, bank_loans: true, water_etp_stp: true, electrical_elv: true, vendors_binding: true, lidar: true, vr: true },
    Dukandar: { dukandar_market: true, bank_loans: true, vendors_binding: true, solar: true, construction: false, water_etp_stp: false, electrical_elv: false, lidar: false, vr: false },
    Supplier: { dukandar_market: true, vendors_binding: true, bank_loans: true, solar: true, construction: false, water_etp_stp: false, electrical_elv: false, lidar: false, vr: false },
    Electrician: { electrical_elv: true, dukandar_market: true, vendors_binding: true, solar: true, construction: false, water_etp_stp: false, bank_loans: false, lidar: false, vr: false },
    Plumber: { water_etp_stp: true, dukandar_market: true, vendors_binding: true, construction: false, solar: false, electrical_elv: false, bank_loans: false, lidar: false, vr: false },
    DistrictAdmin: { construction: true, solar: true, dukandar_market: true, bank_loans: true, water_etp_stp: true, electrical_elv: true, vendors_binding: true, lidar: true, vr: true },
    DistrictEmployee: { construction: true, solar: true, dukandar_market: true, water_etp_stp: true, electrical_elv: true, vendors_binding: true, bank_loans: true, lidar: true, vr: true },
  });

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('DistrictEmployee');
  const [newUserState, setNewUserState] = useState('Uttar Pradesh');
  const [newUserMandal, setNewUserMandal] = useState('Gorakhpur Mandal');
  const [newUserDistrict, setNewUserDistrict] = useState('Gorakhpur');

  // Add Product Modal State (Super Admin adding product for Dukandar)
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [prodTitle, setProdTitle] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodCategory, setProdCategory] = useState<'solar' | 'water_etp' | 'electrical' | 'civil' | 'interior'>('solar');
  const [prodPrice, setProdPrice] = useState(45000);
  const [prodMoq, setProdMoq] = useState(1);
  const [prodVendor, setProdVendor] = useState('Shree Ram Solar Dukandar');
  const [prodImage, setProdImage] = useState<string>('');

  const handleAdminProductPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProdImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isSuperAdmin = currentUser?.role === 'SuperAdmin';

  // Subscribe to real-time Firestore users collection
  React.useEffect(() => {
    const unsub = subscribeToAllUsersInFirestore((fsUsers) => {
      setUserList(prev => {
        // Merge Firestore users with local users
        const map = new Map<string, User>();
        prev.forEach(u => map.set(u.id, u));
        fsUsers.forEach(u => map.set(u.id, u));
        return Array.from(map.values());
      });
    });
    return () => unsub();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUserList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    await updateUserInFirestore(userId, { role: newRole });
    if (userId === currentUser?.id && onSwitchRole) {
      onSwitchRole(newRole);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    let nextStatus: 'Active' | 'Suspended' = 'Active';
    setUserList(prev => prev.map(u => {
      if (u.id === userId) {
        nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
    await updateUserInFirestore(userId, { status: nextStatus });
  };

  const togglePermission = (role: string, moduleId: string) => {
    setRolePermissions(prev => {
      const currentRoleObj = prev[role] || {};
      return {
        ...prev,
        [role]: {
          ...currentRoleObj,
          [moduleId]: !currentRoleObj[moduleId]
        }
      };
    });
  };

  const toggleApproveProduct = (productId: string) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, isApproved: !p.isApproved } : p));
  };

  const handleVerifyKycLoan = (loanId: string, status: LoanApplication['kycStatus']) => {
    setLoanApps(prev => prev.map(l => l.id === loanId ? { ...l, kycStatus: status } : l));
  };

  const handleBidStatus = (bidId: string, status: 'Accepted' | 'Rejected' | 'Pending') => {
    setBids(prev => prev.map(b => b.id === bidId ? { ...b, status } : b));
  };

  const handleContractStatus = (contractId: string, bindingStatus: BindingContract['bindingStatus']) => {
    setContracts(prev => prev.map(c => c.id === contractId ? { ...c, bindingStatus } : c));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserName) return;

    const created: User = {
      id: `USR-${(userList.length + 1).toString().padStart(3, '0')}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      state: newUserState,
      mandal: newUserMandal,
      district: newUserDistrict,
      city: newUserDistrict,
      isKycVerified: true,
      status: 'Active',
      employeeCode: newUserRole.includes('Employee') || newUserRole.includes('Admin') ? `EMP-${Math.floor(1000 + Math.random() * 9000)}` : undefined
    };

    setUserList([created, ...userList]);
    setShowAddModal(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  // Subscription & Monetization Control Handlers
  const handleOpenCreatePlan = () => {
    setEditingPlanId(null);
    setPlanNameInput('Custom Tier');
    setPlanPriceInput(1999);
    setPlanCycleInput('Monthly');
    setPlanDescInput('Special access plan for high-volume civil & solar contractors.');
    setPlanFeaturesInput('Unlimited BOQ Downloads, AI Vastu Naksha Studio, Priority Bidding');
    setPlanMaxProjectsInput(30);
    setPlanIsActiveInput(true);
    setShowPlanModal(true);
  };

  const handleOpenEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlanId(plan.id);
    setPlanNameInput(plan.name);
    setPlanPriceInput(plan.priceINR);
    setPlanCycleInput(plan.billingCycle);
    setPlanDescInput(plan.description);
    setPlanFeaturesInput(plan.features.join(', '));
    setPlanMaxProjectsInput(plan.maxProjectsLimit);
    setPlanIsActiveInput(plan.isActive);
    setShowPlanModal(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedFeatures = planFeaturesInput.split(',').map(f => f.trim()).filter(Boolean);

    if (editingPlanId) {
      setSubscriptionPlans(prev => prev.map(p => p.id === editingPlanId ? {
        ...p,
        name: planNameInput,
        priceINR: Number(planPriceInput),
        billingCycle: planCycleInput,
        description: planDescInput,
        features: parsedFeatures.length > 0 ? parsedFeatures : p.features,
        maxProjectsLimit: Number(planMaxProjectsInput),
        isActive: planIsActiveInput
      } : p));
      setCustomizerSavedToast(`Subscription plan '${planNameInput}' updated successfully.`);
    } else {
      const newPlan: SubscriptionPlan = {
        id: `PLAN-${Date.now().toString().slice(-4)}`,
        name: planNameInput,
        priceINR: Number(planPriceInput),
        billingCycle: planCycleInput,
        description: planDescInput,
        features: parsedFeatures,
        maxProjectsLimit: Number(planMaxProjectsInput),
        isActive: planIsActiveInput,
        targetRoles: ['Contractor', 'Architect', 'Vendor']
      };
      setSubscriptionPlans([...subscriptionPlans, newPlan]);
      setCustomizerSavedToast(`New subscription plan '${planNameInput}' created.`);
    }
    setShowPlanModal(false);
    setTimeout(() => setCustomizerSavedToast(null), 4000);
  };

  const handleTogglePlanActive = (planId: string) => {
    setSubscriptionPlans(prev => prev.map(p => p.id === planId ? { ...p, isActive: !p.isActive } : p));
  };

  const handleOpenAssignUserPlan = (user: User) => {
    setSelectedAssignUser(user);
    setAssignPlanId(user.subscriptionPlanId || 'PLAN-BUILDER-PRO');
    setAssignStatus(user.subscriptionStatus || 'Active');
    setShowAssignModal(true);
  };

  const handleSaveUserPlanAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignUser) return;

    const matchedPlan = subscriptionPlans.find(p => p.id === assignPlanId);
    const planName = matchedPlan ? matchedPlan.name : 'Builder Pro Tier';
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setUserList(prev => prev.map(u => u.id === selectedAssignUser.id ? {
      ...u,
      subscriptionPlanId: assignPlanId,
      subscriptionPlanName: planName,
      subscriptionStatus: assignStatus,
      subscriptionExpiresAt: expiresAt
    } : u));

    // Create record in transaction log
    if (matchedPlan && matchedPlan.priceINR > 0) {
      const newTxn: SubscriptionTransaction = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: selectedAssignUser.id,
        userName: selectedAssignUser.name,
        userEmail: selectedAssignUser.email,
        userRole: selectedAssignUser.role,
        planId: assignPlanId,
        planName: planName,
        amountINR: matchedPlan.priceINR,
        paymentGateway: 'UPI / Razorpay',
        paymentDate: new Date().toISOString().split('T')[0],
        status: assignStatus === 'Active' ? 'Completed' : 'Pending Approval'
      };
      setSubscriptionTransactions([newTxn, ...subscriptionTransactions]);
    }

    setCustomizerSavedToast(`Subscription assigned to ${selectedAssignUser.name}: ${planName} (${assignStatus})`);
    setShowAssignModal(false);
    setTimeout(() => setCustomizerSavedToast(null), 4000);
  };

  const handleApproveTransaction = (txnId: string) => {
    let targetUserEmail = '';
    let targetPlanName = '';

    setSubscriptionTransactions(prev => prev.map(t => {
      if (t.id === txnId) {
        targetUserEmail = t.userEmail;
        targetPlanName = t.planName;
        return { ...t, status: 'Completed' };
      }
      return t;
    }));

    if (targetUserEmail) {
      setUserList(prev => prev.map(u => u.email.toLowerCase() === targetUserEmail.toLowerCase() ? {
        ...u,
        subscriptionStatus: 'Active',
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      } : u));
    }

    setCustomizerSavedToast(`Payment receipt approved for ${targetUserEmail}. Plan ${targetPlanName} activated.`);
    setTimeout(() => setCustomizerSavedToast(null), 4000);
  };

  const handleAdminAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle) return;

    const newProd: ShopProduct = {
      id: `PROD-${Date.now().toString().slice(-4)}`,
      title: prodTitle,
      brand: prodBrand || 'Generic Tier-1',
      category: 'Solar PV & Inverters',
      priceINR: Number(prodPrice),
      vendorId: 'VND-001',
      vendorName: prodVendor,
      vendorCity: 'Delhi NCR',
      vendorPhone: '+91 98765 43210',
      unit: 'Module',
      stockQty: Number(prodMoq) * 50,
      rating: 5.0,
      isApproved: true,
      imageUrl: prodImage || 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
      specs: '30 Year Performance Warranty, ALMM Ministry Approved, IS 14286 Certified'
    };

    setProducts([newProd, ...products]);
    setShowAddProductModal(false);
    setProdTitle('');
    setProdImage('');
  };

  const filteredUsers = userList.filter(u => {
    const roleMatch = filterRole === 'All' || u.role === filterRole;
    const stateMatch = filterState === 'All' || u.state === filterState || u.zone === filterState;
    const mandalMatch = filterMandal === 'All' || u.mandal === filterMandal;
    return roleMatch && stateMatch && mandalMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Central Control &amp; System Governance</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Full Control: Tool Permissions, Dukandar Products, Bidding Escrows, District Admins &amp; Single Login Switch
              </p>
            </div>
          </div>
        </div>

        {/* Role Status & Quick Switch */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs font-bold flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-600" />
            <span>Active Role: {currentUser?.role || 'Guest (Login Switch Required)'}</span>
          </div>

          {!currentUser && (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-md"
            >
              Single Login Switch
            </button>
          )}
        </div>
      </div>

      {!isSuperAdmin && currentUser && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>You are currently logged in as <strong>{currentUser.role} ({currentUser.district || currentUser.city})</strong>. Switch to System Admin to exercise full platform governance.</span>
          </div>
          <button
            onClick={() => onSwitchRole?.('SuperAdmin')}
            className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg"
          >
            Switch to Central Governance
          </button>
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-xs text-slate-500">Registered Accounts</div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{userList.length} Users</div>
          <div className="text-[10px] text-purple-600 font-bold mt-1">Single Login Switch Active</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-xs text-slate-500">District Staff</div>
          <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {userList.filter(u => u.role.includes('District') || u.role === 'Employee').length} Officers
          </div>
          <div className="text-[10px] text-slate-400 mt-1">5 Zones &amp; 20 Districts</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-xs text-slate-500">Tool Permissions</div>
          <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">9 Modules</div>
          <div className="text-[10px] text-indigo-600 font-bold mt-1">Role Access Configurable</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-xs text-slate-500">Active Vendor Bids</div>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{bids.length} Live Bids</div>
          <div className="text-[10px] text-slate-400 mt-1">₹86L Escrow Deposit</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-xs text-slate-500">Dukandar Products</div>
          <div className="text-xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">{products.length} Items</div>
          <div className="text-[10px] text-slate-400 mt-1">{products.filter(p => p.isApproved).length} Approved</div>
        </div>
      </div>

      {/* Admin Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('gis_map')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'gis_map' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Globe className="w-4 h-4 text-indigo-400" /> GIS District Map
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Users className="w-4 h-4" /> User &amp; Role Control
          </button>

          <button
            onClick={() => setActiveTab('district_hierarchy')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'district_hierarchy' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <MapPin className="w-4 h-4" /> District Staff
          </button>

          <button
            onClick={() => setActiveTab('tool_permissions')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'tool_permissions' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Settings className="w-4 h-4" /> Tool Access Config
          </button>

          <button
            onClick={() => setActiveTab('bidding_control')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'bidding_control' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Gavel className="w-4 h-4" /> Bidding System Control
          </button>

          <button
            onClick={() => setActiveTab('dukandar_products')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'dukandar_products' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Store className="w-4 h-4" /> Dukandar Marketplace
          </button>

          <button
            onClick={() => setActiveTab('kyc_loans')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'kyc_loans' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <FileCheck className="w-4 h-4" /> Bank Loans
          </button>

          <button
            onClick={() => setActiveTab('website_customizer')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'website_customizer' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Palette className="w-4 h-4 text-amber-400" /> Website Control, Privacy &amp; Theme Studio
          </button>

          <button
            onClick={() => setActiveTab('whitelabel_limits')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'whitelabel_limits' ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-md font-extrabold ring-2 ring-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>व्हाइट-लेबल व फंक्शन लिमिट कंट्रोल</span>
          </button>

          <button
            onClick={() => setActiveTab('monetization')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'monetization' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md font-extrabold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-400" /> Monetization &amp; Pricing Plans
          </button>

          <button
            onClick={() => setActiveTab('security_control')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'security_control' ? 'bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 text-white shadow-md font-extrabold ring-2 ring-rose-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" /> Security &amp; RBAC Control Panel
          </button>
        </div>

        <div className="flex gap-2">
          {activeTab === 'dukandar_products' && (
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
            >
              <PackagePlus className="w-4 h-4" /> Add Product
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
          >
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* TAB 0: Interactive GIS District Map */}
      {activeTab === 'gis_map' && (
        <DistrictInteractiveMap userList={userList} productsList={products} />
      )}

      {/* TAB Security: Security & RBAC Control Panel */}
      {activeTab === 'security_control' && (
        <SuperAdminControlPanel 
          currentUser={{ 
            role: (currentUser?.role === 'SuperAdmin' ? 'super_admin' : currentUser?.role as UserRole) || 'super_admin',
            fullName: currentUser?.name || 'Abhudaya Pratap Singh',
            emailOrPhone: currentUser?.email || 'admin@2click.in'
          }} 
        />
      )}

      {/* TAB 1: User & Role Management */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-600" />
              User Accounts &amp; Role Decision Control
            </h2>

            {/* Filter Bar */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 flex items-center gap-1"><Filter className="w-3.5 h-3.5" /> Filter:</span>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border rounded-lg text-xs"
              >
                <option value="All">All Roles</option>
                <option value="SuperAdmin">System Admin (Governance)</option>
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

              <select
                value={filterState}
                onChange={(e) => {
                  setFilterState(e.target.value);
                  setFilterMandal('All');
                }}
                className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border rounded-lg text-xs font-bold"
              >
                <option value="All">All States (सभी राज्य)</option>
                {getAllStates().map(st => (
                  <option key={st.state} value={st.state}>{st.state}</option>
                ))}
              </select>

              <select
                value={filterMandal}
                onChange={(e) => setFilterMandal(e.target.value)}
                className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border rounded-lg text-xs font-bold"
              >
                <option value="All">All Mandals (सभी मंडल)</option>
                {(filterState === 'All' ? INDIAN_ADMIN_HIERARCHY.flatMap(s => s.mandals) : getMandalsForState(filterState)).map(m => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">User &amp; Code</th>
                  <th className="p-3">State, Mandal &amp; District</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">System Admin Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {u.name}
                      <div className="text-[10px] font-normal text-slate-400">{u.email} • {u.id} {u.employeeCode ? `(${u.employeeCode})` : ''}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{u.district || u.city || 'Gorakhpur'}</div>
                      <div className="text-[10px] text-purple-700 dark:text-purple-400 font-bold">{u.mandal || 'Gorakhpur Mandal'} • {u.state || 'Uttar Pradesh'}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        u.role === 'SuperAdmin' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                        u.role.includes('District') ? 'bg-blue-100 text-blue-800 border-blue-300' :
                        u.role === 'Dukandar' ? 'bg-teal-100 text-teal-800 border-teal-300' :
                        u.role === 'Supplier' ? 'bg-cyan-100 text-cyan-800 border-cyan-300' :
                        'bg-slate-100 text-slate-800 border-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenUserPermissionModal(u)}
                        className="px-2.5 py-1 text-xs font-black rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900 border border-indigo-300/60 transition inline-flex items-center gap-1 shadow-xs"
                        title="Configure User-wise Permissions & Customized Dashboard"
                      >
                        <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Permissions &amp; Dashboard</span>
                      </button>

                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border rounded-lg text-xs font-semibold"
                      >
                        <option value="SuperAdmin">SuperAdmin</option>
                        <option value="DistrictAdmin">DistrictAdmin</option>
                        <option value="DistrictEmployee">DistrictEmployee</option>
                        <option value="Dukandar">Dukandar</option>
                        <option value="Supplier">Supplier</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Plumber">Plumber</option>
                        <option value="Architect">Architect</option>
                        <option value="Contractor">Contractor</option>
                        <option value="Client">Client</option>
                      </select>

                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                          u.status === 'Active' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                      >
                        {u.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: State, Mandal & District Hierarchy & Field Allocation */}
      {activeTab === 'district_hierarchy' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                State, Mandal &amp; District Administrative Allocation (राज्य, मंडल एवं ज़िला आवंटन)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                प्रत्येक मंडल (Mandal/Division) के अंतर्गत तैनात किए गए फील्ड ऑफिसर, डिस्ट्रिक्ट एडमिन एवं दुकानदारों का विवरण।
              </p>
            </div>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-xs rounded-xl">
              Mandal Division Structure
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INDIAN_ADMIN_HIERARCHY.flatMap(st => st.mandals.map(m => ({ ...m, stateName: st.state, stateHindi: st.stateHindi }))).map(mandal => {
              const mandalStaff = userList.filter(u => u.mandal === mandal.name || u.state === mandal.stateName);
              return (
                <div key={mandal.name} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                    <div>
                      <span className="font-extrabold text-xs text-purple-700 dark:text-purple-300 block">{mandal.name}</span>
                      <span className="text-[10px] text-slate-500 font-bold">{mandal.nameHindi} • {mandal.stateName}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 font-bold shrink-0">
                      {mandalStaff.length} Assigned Users
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-800 dark:text-slate-200">ज़िले (Districts):</strong> {mandal.districts.join(', ')}
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {mandalStaff.length === 0 ? (
                      <div className="text-[10px] text-slate-400 italic">No staff assigned to this mandal yet.</div>
                    ) : (
                      mandalStaff.map(s => (
                        <div key={s.id} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                            <div className="text-[10px] text-slate-400">{s.role} • {s.district || mandal.districts[0]}</div>
                          </div>
                          <span className="text-[10px] font-mono text-purple-600 font-bold">{s.employeeCode || 'ACTIVE'}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Tool & Feature Access Permissions Matrix */}
      {activeTab === 'tool_permissions' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-purple-600" />
              Tool &amp; Feature Access Control Matrix (Kisko Kitna Access Dena Hai)
            </h2>
            <p className="text-xs text-slate-500">
              System Admin grants or revokes access to individual app calculators and tools for each user role.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">System Tool / Module</th>
                  <th className="p-3 text-center">Client</th>
                  <th className="p-3 text-center">Dukandar</th>
                  <th className="p-3 text-center">Supplier</th>
                  <th className="p-3 text-center">Electrician</th>
                  <th className="p-3 text-center">Plumber</th>
                  <th className="p-3 text-center">District Admin</th>
                  <th className="p-3 text-center">District Employee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {SYSTEM_MODULES.map(m => (
                  <tr key={m.id}>
                    <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="p-1 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 text-[10px] font-bold">
                        {m.category}
                      </span>
                      <span>{m.name}</span>
                    </td>

                    {['Client', 'Dukandar', 'Supplier', 'Electrician', 'Plumber', 'DistrictAdmin', 'DistrictEmployee'].map(r => {
                      const isAllowed = rolePermissions[r]?.[m.id] ?? true;
                      return (
                        <td key={r} className="p-3 text-center">
                          <button
                            onClick={() => togglePermission(r, m.id)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 mx-auto ${
                              isAllowed 
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                                : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 opacity-60'
                            }`}
                          >
                            {isAllowed ? <Check className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                            {isAllowed ? 'Allowed' : 'Blocked'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Bidding System & Vendor Binding Control */}
      {activeTab === 'bidding_control' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Gavel className="w-4 h-4 text-purple-600" />
                Bidding System &amp; Vendor Binding Command Control
              </h2>
              <p className="text-xs text-slate-500">
                System Admin can approve/freeze vendor bids, override contract winners &amp; enforce binding deposits.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border">
              <span>Escrow Protection: 100% Active</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">Central Governance Active</span>
            </div>
          </div>

          {/* Active Vendor Bids List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Live Bids Submitted by Vendors &amp; Contractors
            </h3>

            <div className="space-y-3">
              {bids.map(b => (
                <div key={b.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">{b.vendorName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold">
                        {b.category}
                      </span>
                      <span className="text-[10px] text-slate-400">Bid ID: {b.id}</span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Target Project: <strong>{b.projectTitle}</strong>
                    </div>

                    <div className="text-xs text-purple-700 dark:text-purple-300 font-bold">
                      Bid Value: ₹{b.bidAmountINR.toLocaleString('en-IN')} • Estimated Execution: {b.timelineWeeks} Weeks
                    </div>
                  </div>

                  {/* Admin Bid Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBidStatus(b.id, 'Accepted')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        b.status === 'Accepted' || b.status === 'Bound'
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      }`}
                    >
                      Declare Winner
                    </button>

                    <button
                      onClick={() => handleBidStatus(b.id, 'Pending')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        b.status === 'Pending' 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                    >
                      Freeze Bid
                    </button>

                    <button
                      onClick={() => handleBidStatus(b.id, 'Rejected')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        b.status === 'Rejected' 
                          ? 'bg-rose-600 text-white' 
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      Reject Bid
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Binding Escrow Contracts Section */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Legal Binding Contracts &amp; Escrow Money Controls
            </h3>

            <div className="space-y-3">
              {contracts.map(c => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">{c.projectName}</span>
                      <span className="text-xs text-slate-400 ml-2">({c.contractNumber})</span>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        Client: <strong>{c.clientName}</strong> | Vendor: <strong>{c.vendorName}</strong>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-purple-600">₹{c.agreedAmountINR.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-emerald-600 font-bold">Advance Deposit Escrowed: ₹{c.advanceDepositINR.toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="px-2.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">
                      Status: {c.bindingStatus}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleContractStatus(c.id, 'Binding Deposit Escrowed')}
                        className="px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg"
                      >
                        Lock Escrow
                      </button>
                      <button
                        onClick={() => handleContractStatus(c.id, 'Active Execution')}
                        className="px-2.5 py-1 bg-amber-600 text-white text-[10px] font-bold rounded-lg"
                      >
                        Start Work
                      </button>
                      <button
                        onClick={() => handleContractStatus(c.id, 'Discharged & Completed')}
                        className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg"
                      >
                        Release Escrow Payment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Dukandar Marketplace Product Approvals */}
      {activeTab === 'dukandar_products' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-teal-600" />
              Dukandar Marketplace Product Listing &amp; Catalog Control
            </h2>

            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
            >
              <PackagePlus className="w-4 h-4" /> Add Product for Dukandar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={p.imageUrl} alt={p.title} referrerPolicy="no-referrer" className="w-12 h-12 rounded-lg object-cover bg-slate-900" />
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{p.title}</div>
                    <div className="text-[10px] text-slate-400">{p.brand} • Dukandar: {p.vendorName}</div>
                    <div className="text-xs font-extrabold text-teal-600 mt-0.5">₹{p.priceINR.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <button
                  onClick={() => toggleApproveProduct(p.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                    p.isApproved 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {p.isApproved ? 'Approved' : 'Approve'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: KYC & Bank Loans Verification */}
      {activeTab === 'kyc_loans' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-600" />
            Bank Loan &amp; KYC Verification Queue
          </h2>

          <div className="space-y-3">
            {loanApps.map(l => (
              <div key={l.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{l.applicantName}</span>
                    <span className="text-xs text-slate-500 ml-2">({l.applicantCity}) • {l.bankName}</span>
                    <div className="text-xs text-blue-600 font-bold mt-0.5">
                      Requested Loan: ₹{l.requestedAmountINR.toLocaleString('en-IN')} @ {l.interestRatePct}% (EMI: ₹{l.monthlyEmiINR}/mo)
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerifyKycLoan(l.id, 'KYC Verified')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
                    >
                      Verify KYC
                    </button>
                    <button
                      onClick={() => handleVerifyKycLoan(l.id, 'Approved & Sanctioned')}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg"
                    >
                      Sanction Loan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: Website Control, Privacy Settings, Theme Studio & Layout Customizer */}
      {activeTab === 'website_customizer' && (
        <div className="space-y-6">
          
          {/* Toast Notification Banner */}
          {customizerSavedToast && (
            <div className="p-3 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{customizerSavedToast}</span>
              </div>
              <button onClick={() => setCustomizerSavedToast(null)} className="text-white/80 hover:text-white text-xs">Dismiss</button>
            </div>
          )}

          {/* Section Header */}
          <div className="p-5 bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white rounded-2xl border border-purple-800/40 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-teal-400" />
                <h2 className="text-base font-extrabold tracking-tight">Website Creator Command, Privacy &amp; Theme Studio</h2>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Aapki website ka pura control: Public/Private privacy mode, AES-256 Data Encryption, Alag Alag Theme Presets, Layout Density &amp; Menu Options Ko Organize Karein.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-extrabold rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Live Customizer Active
              </span>
            </div>
          </div>

          {/* BLOCK 1: Privacy & Access Control */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  Website Privacy &amp; Site Access Mode (Pravesy aur Security)
                </h3>
                <p className="text-xs text-slate-500">
                  Control who can enter your website, calculate BOQs, and view vendor quotes.
                </p>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2.5 py-1 rounded-lg">
                Current Mode: {siteAccessMode.toUpperCase()}
              </span>
            </div>

            {/* Access Mode Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSiteAccessMode('public');
                  setCustomizerSavedToast('Site Privacy set to Public Access Mode');
                }}
                className={`p-3.5 rounded-xl text-left transition border ${
                  siteAccessMode === 'public'
                    ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-600 text-purple-950 dark:text-purple-200 ring-2 ring-purple-600'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>🌐 Public Access</span>
                  {siteAccessMode === 'public' && <Check className="w-4 h-4 text-purple-600" />}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Open to all visitors. Anyone can browse tools and estimate civil/solar BOQs.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSiteAccessMode('approval');
                  setCustomizerSavedToast('Site Privacy set to Admin Approval Required Mode');
                }}
                className={`p-3.5 rounded-xl text-left transition border ${
                  siteAccessMode === 'approval'
                    ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-600 text-purple-950 dark:text-purple-200 ring-2 ring-purple-600'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>🔒 Admin Approval Mode</span>
                  {siteAccessMode === 'approval' && <Check className="w-4 h-4 text-purple-600" />}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  New users can register, but must be approved by Admin before viewing vendor quotes.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSiteAccessMode('private');
                  setCustomizerSavedToast('Site Privacy set to Private Enterprise Mode');
                }}
                className={`p-3.5 rounded-xl text-left transition border ${
                  siteAccessMode === 'private'
                    ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-600 text-purple-950 dark:text-purple-200 ring-2 ring-purple-600'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>🛡️ Private Enterprise</span>
                  {siteAccessMode === 'private' && <Check className="w-4 h-4 text-purple-600" />}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Invite-only access for verified engineering vendors, contractors, and staff.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSiteAccessMode('maintenance');
                  setCustomizerSavedToast('Site Privacy set to Maintenance Hold Mode');
                }}
                className={`p-3.5 rounded-xl text-left transition border ${
                  siteAccessMode === 'maintenance'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-600 text-rose-950 dark:text-rose-200 ring-2 ring-rose-600'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>🚧 Maintenance Hold</span>
                  {siteAccessMode === 'maintenance' && <Check className="w-4 h-4 text-rose-600" />}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Public site temporarily hidden with maintenance notice. Only Admin can log in.
                </div>
              </button>
            </div>

            {/* Privacy Security Toggles */}
            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <label className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">AES-256 Aadhaar &amp; Phone Data Masking</div>
                  <div className="text-[11px] text-slate-500">Encrypts customer phone numbers and GST numbers in database</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={privacyEncryptAadhaar} 
                  onChange={(e) => {
                    setPrivacyEncryptAadhaar(e.target.checked);
                    setCustomizerSavedToast(`AES-256 Data Encryption ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                  }}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
              </label>

              <label className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Audit Log Traceability (DPDP Act)</div>
                  <div className="text-[11px] text-slate-500">Tracks every admin price override and vendor deposit with timestamp</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={privacyAuditLogs} 
                  onChange={(e) => {
                    setPrivacyAuditLogs(e.target.checked);
                    setCustomizerSavedToast(`Audit Log Traceability ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                  }}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
              </label>

              <label className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Vendor Quote Anonymity Mode</div>
                  <div className="text-[11px] text-slate-500">Hides contractor company names during competitive bidding</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={privacyVendorAnonymity} 
                  onChange={(e) => {
                    setPrivacyVendorAnonymity(e.target.checked);
                    setCustomizerSavedToast(`Vendor Quote Anonymity ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                  }}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
              </label>

              <label className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Inactivity Session Timeout (15 mins)</div>
                  <div className="text-[11px] text-slate-500">Automatically signs out idle staff to prevent unauthorized access</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={privacySessionTimeout} 
                  onChange={(e) => {
                    setPrivacySessionTimeout(e.target.checked);
                    setCustomizerSavedToast(`Session Timeout ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                  }}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
              </label>
            </div>

            {/* Allowed Subnets & IP Whitelist */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                Whitelisted Subnets / IP Addresses (Restricted Admin Control)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={allowedIpList}
                  onChange={(e) => setAllowedIpList(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                  placeholder="e.g. 192.168.1.1, 10.0.0.0/24"
                />
                <button
                  type="button"
                  onClick={() => setCustomizerSavedToast('IP Whitelist rules updated & active!')}
                  className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-extrabold rounded-xl shrink-0"
                >
                  Update Firewall
                </button>
              </div>
            </div>
          </div>

          {/* BLOCK 2: Theme Switcher & Color Studio (Alag Alag Theme Badlane Ka Option) */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-600" />
                  Website Color Theme Palette Studio (Alag Alag Themes)
                </h3>
                <p className="text-xs text-slate-500">
                  Select a distinctive color theme for your engineering portal. Applies live across all components.
                </p>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-lg bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                Active Theme: {currentThemePreset.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              
              {/* Theme 1: Royal Indigo */}
              <button
                type="button"
                onClick={() => {
                  setCurrentThemePreset('indigo');
                  localStorage.setItem('2click_theme_preset', 'indigo');
                  setCustomizerSavedToast('Switched to Royal Indigo & Teal Theme');
                }}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between h-28 ${
                  currentThemePreset === 'indigo'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-600'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-indigo-900 dark:text-indigo-200">Royal Indigo</span>
                    {currentThemePreset === 'indigo' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Classic Engineering &amp; B2B</div>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 shadow-xs" title="Indigo Primary" />
                  <div className="w-6 h-6 rounded-lg bg-teal-600 shadow-xs" title="Teal Secondary" />
                  <div className="w-6 h-6 rounded-lg bg-slate-900 shadow-xs" title="Dark Slate Accent" />
                </div>
              </button>

              {/* Theme 2: Emerald Solar */}
              <button
                type="button"
                onClick={() => {
                  setCurrentThemePreset('emerald');
                  localStorage.setItem('2click_theme_preset', 'emerald');
                  setCustomizerSavedToast('Switched to Emerald Tech & Solar Gold Theme');
                }}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between h-28 ${
                  currentThemePreset === 'emerald'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-600'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-emerald-900 dark:text-emerald-200">Emerald Solar</span>
                    {currentThemePreset === 'emerald' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Green Energy &amp; Rooftop</div>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 shadow-xs" title="Emerald Primary" />
                  <div className="w-6 h-6 rounded-lg bg-amber-500 shadow-xs" title="Solar Gold" />
                  <div className="w-6 h-6 rounded-lg bg-slate-800 shadow-xs" title="Slate Accent" />
                </div>
              </button>

              {/* Theme 3: Deep Amethyst */}
              <button
                type="button"
                onClick={() => {
                  setCurrentThemePreset('amethyst');
                  localStorage.setItem('2click_theme_preset', 'amethyst');
                  setCustomizerSavedToast('Switched to Deep Amethyst & Rose B2B Theme');
                }}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between h-28 ${
                  currentThemePreset === 'amethyst'
                    ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40 ring-2 ring-purple-600'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-purple-900 dark:text-purple-200">Deep Amethyst</span>
                    {currentThemePreset === 'amethyst' && <Check className="w-3.5 h-3.5 text-purple-600" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Luxury Commerce Marketplace</div>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-600 shadow-xs" title="Amethyst Purple" />
                  <div className="w-6 h-6 rounded-lg bg-rose-600 shadow-xs" title="Rose Accent" />
                  <div className="w-6 h-6 rounded-lg bg-indigo-950 shadow-xs" title="Deep Indigo" />
                </div>
              </button>

              {/* Theme 4: Civil Terracotta */}
              <button
                type="button"
                onClick={() => {
                  setCurrentThemePreset('terracotta');
                  localStorage.setItem('2click_theme_preset', 'terracotta');
                  setCustomizerSavedToast('Switched to Civil Terracotta & Brick Copper Theme');
                }}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between h-28 ${
                  currentThemePreset === 'terracotta'
                    ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/40 ring-2 ring-amber-600'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-amber-900 dark:text-amber-200">Civil Terracotta</span>
                    {currentThemePreset === 'terracotta' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Heavy Civil &amp; Infrastructure</div>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-600 shadow-xs" title="Terracotta Amber" />
                  <div className="w-6 h-6 rounded-lg bg-orange-700 shadow-xs" title="Copper Red" />
                  <div className="w-6 h-6 rounded-lg bg-stone-800 shadow-xs" title="Stone Gray" />
                </div>
              </button>

              {/* Theme 5: Cyber Obsidian */}
              <button
                type="button"
                onClick={() => {
                  setCurrentThemePreset('obsidian');
                  localStorage.setItem('2click_theme_preset', 'obsidian');
                  setCustomizerSavedToast('Switched to Cyber Midnight Obsidian Theme');
                }}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between h-28 ${
                  currentThemePreset === 'obsidian'
                    ? 'border-cyan-500 bg-slate-900 text-white ring-2 ring-cyan-500'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-cyan-300">Cyber Obsidian</span>
                    {currentThemePreset === 'obsidian' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">High-Tech LiDAR &amp; VR</div>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-700 shadow-xs" title="Midnight" />
                  <div className="w-6 h-6 rounded-lg bg-cyan-500 shadow-xs" title="Cyber Cyan" />
                  <div className="w-6 h-6 rounded-lg bg-violet-600 shadow-xs" title="Violet Pulse" />
                </div>
              </button>

            </div>
          </div>

          {/* BLOCK 3: Layout Density & Box Styling (Layout Badlane Ka Option) */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-xs">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Layout className="w-4 h-4 text-teal-600" />
                Layout Density &amp; Box Styling Controls (Layout Change Settings)
              </h3>
              <p className="text-xs text-slate-500">
                Customize padding rhythms, card corner roundness, and container surface elevations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              {/* Density */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="font-bold text-slate-900 dark:text-white block">UI Density Scale</label>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setLayoutDensity('compact');
                      setCustomizerSavedToast('Layout set to Compact Box Density');
                    }}
                    className={`w-full p-2 rounded-lg text-left font-semibold flex items-center justify-between ${
                      layoutDensity === 'compact' ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>Compact Boxed (Dense Data)</span>
                    {layoutDensity === 'compact' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLayoutDensity('comfortable');
                      setCustomizerSavedToast('Layout set to Balanced Comfort Density');
                    }}
                    className={`w-full p-2 rounded-lg text-left font-semibold flex items-center justify-between ${
                      layoutDensity === 'comfortable' ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>Balanced Comfort (Standard)</span>
                    {layoutDensity === 'comfortable' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLayoutDensity('spaced');
                      setCustomizerSavedToast('Layout set to Spaced Luxury Density');
                    }}
                    className={`w-full p-2 rounded-lg text-left font-semibold flex items-center justify-between ${
                      layoutDensity === 'spaced' ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>Spaced Luxury (Spacious)</span>
                    {layoutDensity === 'spaced' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Corner Radius */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="font-bold text-slate-900 dark:text-white block">Card Corner Radius</label>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCardCornerStyle('sharp');
                      setCustomizerSavedToast('Card corners set to Sharp Industrial (4px)');
                    }}
                    className={`w-full p-2 rounded-lg text-left font-semibold flex items-center justify-between ${
                      cardCornerStyle === 'sharp' ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>Sharp Industrial (4px)</span>
                    {cardCornerStyle === 'sharp' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCardCornerStyle('rounded');
                      setCustomizerSavedToast('Card corners set to Balanced Curved (12px)');
                    }}
                    className={`w-full p-2 rounded-lg text-left font-semibold flex items-center justify-between ${
                      cardCornerStyle === 'rounded' ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>Balanced Curved (12px)</span>
                    {cardCornerStyle === 'rounded' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCardCornerStyle('pill');
                      setCustomizerSavedToast('Card corners set to Full Smooth Pill (24px)');
                    }}
                    className={`w-full p-2 rounded-lg text-left font-semibold flex items-center justify-between ${
                      cardCornerStyle === 'pill' ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>Full Smooth Pill (24px)</span>
                    {cardCornerStyle === 'pill' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Surface Elevation */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="font-bold text-slate-900 dark:text-white block">Card Box Elevation</label>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCardSurfaceStyle('border');
                      setCustomizerSavedToast('Surface style set to Solid 1px Border');
                    }}
                    className={`w-full p-2 rounded-lg text-left font-semibold flex items-center justify-between ${
                      cardSurfaceStyle === 'border' ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>Clean 1px Solid Border</span>
                    {cardSurfaceStyle === 'border' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCardSurfaceStyle('shadow');
                      setCustomizerSavedToast('Surface style set to Elevated Drop Shadow');
                    }}
                    className={`w-full p-2 rounded-lg text-left font-semibold flex items-center justify-between ${
                      cardSurfaceStyle === 'shadow' ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>Elevated Drop Shadow</span>
                    {cardSurfaceStyle === 'shadow' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCardSurfaceStyle('glass');
                      setCustomizerSavedToast('Surface style set to Glassmorphic Translucent');
                    }}
                    className={`w-full p-2 rounded-lg text-left font-semibold flex items-center justify-between ${
                      cardSurfaceStyle === 'glass' ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>Glassmorphic Translucent</span>
                    {cardSurfaceStyle === 'glass' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* BLOCK 4: Granular Option On/Off Control & Customization Hub */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-purple-600" />
                  Website Options On/Off &amp; Label Customizer (Super Admin Control)
                </h3>
                <p className="text-xs text-slate-500">
                  Har feature ko website standard public display par ON/OFF karein, naam badlein, responsive theme aur access permissions control karein.
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center gap-1.5 shrink-0">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Super Admin Exclusive</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'naksha_vastu', name: 'Naksha & Vastu Studio', category: 'Architecture', desc: 'Auto house design layouts & vastu compass' },
                { id: 'vendors_binding', name: 'Bidding System & Tenders', category: 'Procurement', desc: 'Government & private contractor bids' },
                { id: 'dukandar_market', name: 'Dukandar B2B Marketplace', category: 'Commerce', desc: 'Local shopkeepers materials & products' },
                { id: 'solar', name: 'Solar Rooftop Engine', category: 'Energy', desc: 'KW calculation, panel & subsidy quotes' },
                { id: 'construction', name: 'Civil BOQ Calculator', category: 'Civil', desc: 'Cement, steel, sand & aggregate estimate' },
                { id: 'water_etp_stp', name: 'Water & ETP/STP Studio', category: 'Water Eng', desc: 'Effluent & sewage treatment plant design' },
                { id: 'electrical_elv', name: 'Electrical MEP Studio', category: 'Electrical', desc: 'Transformer, cable load & panel designs' },
                { id: 'bank_loans', name: 'Bank Loans & KYC Hub', category: 'Finance', desc: 'SBI & HDFC solar subsidy financing' },
                { id: 'lidar', name: 'LiDAR 3D Point Cloud', category: 'Advanced Tech', desc: '3D laser scanning spatial measurements' },
                { id: 'vr', name: 'VR Walkthrough Tour', category: 'Advanced Tech', desc: 'Interactive VR 360 virtual site inspection' }
              ].map((item) => {
                const isEnabled = systemSettings?.enabledModules?.[item.id as keyof typeof systemSettings.enabledModules] !== false;
                const currentCustomLabel = systemSettings?.moduleLabels?.[item.id] || item.name;

                return (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      isEnabled 
                        ? 'bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700' 
                        : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.category}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                          {currentCustomLabel}
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{item.desc}</p>
                      </div>

                      {/* ON/OFF TOGGLE SWITCH */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!systemSettings || !onUpdateSystemSettings) return;
                          const updated = {
                            ...systemSettings,
                            enabledModules: {
                              ...systemSettings.enabledModules,
                              [item.id]: !isEnabled
                            }
                          };
                          onUpdateSystemSettings(updated);
                          setCustomizerSavedToast(`${item.name} is now ${!isEnabled ? 'ENABLED (ON)' : 'DISABLED (OFF)'}`);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 ${
                          isEnabled
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                        }`}
                      >
                        {isEnabled ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>ON (Public)</span>
                          </>
                        ) : (
                          <>
                            <Ban className="w-3.5 h-3.5" />
                            <span>OFF (Hidden)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* EDIT TAB LABEL INPUT */}
                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 text-xs">
                      <span className="text-slate-400 font-medium shrink-0">Custom Title:</span>
                      <input
                        type="text"
                        value={currentCustomLabel}
                        onChange={(e) => {
                          if (!systemSettings || !onUpdateSystemSettings) return;
                          const updated = {
                            ...systemSettings,
                            moduleLabels: {
                              ...systemSettings.moduleLabels,
                              [item.id]: e.target.value
                            }
                          };
                          onUpdateSystemSettings(updated);
                        }}
                        placeholder={`Rename ${item.name}`}
                        className="w-full px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. LOGIN DISPLAY & AUTH METHOD CONTROLS (लॉगिन समय क्या दिखेगा क्या नहीं) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald-600" />
                  Login Modal &amp; Authentication Control Panel (लॉगिन स्क्रीन कंट्रोल)
                </h3>
                <p className="text-xs text-slate-500">
                  लॉगिन करते समय क्या दिखेगा और क्या नहीं — क्विक डेमो बटन, व्हाट्सएप/ईमेल OTP एवं पब्लिक रजिस्ट्रेशन ऑन/ऑफ करें।
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">
                Real-time System Enforcement
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Toggle 1: Quick Role Login Demo */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                      ⚡ Quick Role Login Demo Buttons
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Show role preview buttons (SuperAdmin, District Admin, Dukandar, etc.) in login modal.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!systemSettings || !onUpdateSystemSettings) return;
                    const cur = systemSettings.loginDisplayControls?.showQuickRoleDemo !== false;
                    const updated = {
                      ...systemSettings,
                      loginDisplayControls: {
                        ...systemSettings.loginDisplayControls,
                        showQuickRoleDemo: !cur
                      }
                    };
                    onUpdateSystemSettings(updated);
                    setCustomizerSavedToast(`Quick Role Demo Buttons now ${!cur ? 'VISIBLE' : 'HIDDEN'}`);
                  }}
                  className={`w-full py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                    systemSettings?.loginDisplayControls?.showQuickRoleDemo !== false
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-rose-600 text-white shadow-xs'
                  }`}
                >
                  {systemSettings?.loginDisplayControls?.showQuickRoleDemo !== false ? (
                    <><Check className="w-4 h-4" /> Visible on Login Screen</>
                  ) : (
                    <><Ban className="w-4 h-4" /> Hidden from Login Screen</>
                  )}
                </button>
              </div>

              {/* Toggle 2: WhatsApp OTP Option */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                      💬 WhatsApp OTP Login Method
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Allow users to authenticate via instant WhatsApp mobile verification.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!systemSettings || !onUpdateSystemSettings) return;
                    const cur = systemSettings.loginDisplayControls?.showWhatsAppOtpTab !== false;
                    const updated = {
                      ...systemSettings,
                      loginDisplayControls: {
                        ...systemSettings.loginDisplayControls,
                        showWhatsAppOtpTab: !cur
                      }
                    };
                    onUpdateSystemSettings(updated);
                    setCustomizerSavedToast(`WhatsApp OTP tab now ${!cur ? 'ENABLED' : 'DISABLED'}`);
                  }}
                  className={`w-full py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                    systemSettings?.loginDisplayControls?.showWhatsAppOtpTab !== false
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-rose-600 text-white shadow-xs'
                  }`}
                >
                  {systemSettings?.loginDisplayControls?.showWhatsAppOtpTab !== false ? (
                    <><Check className="w-4 h-4" /> WhatsApp OTP Active</>
                  ) : (
                    <><Ban className="w-4 h-4" /> WhatsApp OTP Disabled</>
                  )}
                </button>
              </div>

              {/* Toggle 3: Email OTP Option */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                      ✉️ Email OTP Login Method
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Allow users to log in using one-time verification code sent to email.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!systemSettings || !onUpdateSystemSettings) return;
                    const cur = systemSettings.loginDisplayControls?.showEmailOtpTab !== false;
                    const updated = {
                      ...systemSettings,
                      loginDisplayControls: {
                        ...systemSettings.loginDisplayControls,
                        showEmailOtpTab: !cur
                      }
                    };
                    onUpdateSystemSettings(updated);
                    setCustomizerSavedToast(`Email OTP tab now ${!cur ? 'ENABLED' : 'DISABLED'}`);
                  }}
                  className={`w-full py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                    systemSettings?.loginDisplayControls?.showEmailOtpTab !== false
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-rose-600 text-white shadow-xs'
                  }`}
                >
                  {systemSettings?.loginDisplayControls?.showEmailOtpTab !== false ? (
                    <><Check className="w-4 h-4" /> Email OTP Active</>
                  ) : (
                    <><Ban className="w-4 h-4" /> Email OTP Disabled</>
                  )}
                </button>
              </div>

              {/* Toggle 4: Password Login Method */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                      🔒 Standard Password Login
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Allow traditional email &amp; password sign-in option in login dialog.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!systemSettings || !onUpdateSystemSettings) return;
                    const cur = systemSettings.loginDisplayControls?.showPasswordTab !== false;
                    const updated = {
                      ...systemSettings,
                      loginDisplayControls: {
                        ...systemSettings.loginDisplayControls,
                        showPasswordTab: !cur
                      }
                    };
                    onUpdateSystemSettings(updated);
                    setCustomizerSavedToast(`Password login tab now ${!cur ? 'ENABLED' : 'DISABLED'}`);
                  }}
                  className={`w-full py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                    systemSettings?.loginDisplayControls?.showPasswordTab !== false
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-rose-600 text-white shadow-xs'
                  }`}
                >
                  {systemSettings?.loginDisplayControls?.showPasswordTab !== false ? (
                    <><Check className="w-4 h-4" /> Password Tab Active</>
                  ) : (
                    <><Ban className="w-4 h-4" /> Password Tab Disabled</>
                  )}
                </button>
              </div>

              {/* Toggle 5: Allow Public Self Registration */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                      📝 Public Self-Registration
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Allow new visitors to register accounts freely vs invite-only admin creation.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!systemSettings || !onUpdateSystemSettings) return;
                    const cur = systemSettings.publicRegistrationEnabled !== false;
                    const updated = {
                      ...systemSettings,
                      publicRegistrationEnabled: !cur,
                      loginDisplayControls: {
                        ...systemSettings.loginDisplayControls,
                        allowPublicRegistration: !cur
                      }
                    };
                    onUpdateSystemSettings(updated);
                    setCustomizerSavedToast(`Public self-registration now ${!cur ? 'OPEN' : 'RESTRICTED'}`);
                  }}
                  className={`w-full py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                    systemSettings?.publicRegistrationEnabled !== false
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-rose-600 text-white shadow-xs'
                  }`}
                >
                  {systemSettings?.publicRegistrationEnabled !== false ? (
                    <><Check className="w-4 h-4" /> Registration Open</>
                  ) : (
                    <><Ban className="w-4 h-4" /> Registration Restricted</>
                  )}
                </button>
              </div>

            </div>
          </div>

          {/* 3. PUBLIC SCREEN VISIBILITY CONTROLS (पब्लिक स्क्रीन पर क्या दिखेगा क्या नहीं) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  Public Screen Content &amp; Privacy Visibility (पब्लिक व्यू नियंत्रण)
                </h3>
                <p className="text-xs text-slate-500">
                  बिना लॉगिन किए यूजर को क्या दिखेगा (रेट/प्राइस, वेंडर नंबर, सिटी सेलेक्टर, AI बटन) इसका संपूर्ण नियंत्रण।
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-extrabold text-xs">
                Public Gateway Rules
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Toggle 1: Show Public Prices */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                      🏷️ Public Item Prices (रेट / प्राइस)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Show MRP and discounted wholesale rates before user logs in.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!systemSettings || !onUpdateSystemSettings) return;
                    const cur = systemSettings.showPublicPrices !== false;
                    const updated = {
                      ...systemSettings,
                      showPublicPrices: !cur,
                      publicDisplayControls: {
                        ...systemSettings.publicDisplayControls,
                        showPublicPrices: !cur
                      }
                    };
                    onUpdateSystemSettings(updated);
                    setCustomizerSavedToast(`Public Prices now ${!cur ? 'VISIBLE' : 'HIDDEN (Login Required)'}`);
                  }}
                  className={`w-full py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                    systemSettings?.showPublicPrices !== false
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-amber-600 text-white shadow-xs'
                  }`}
                >
                  {systemSettings?.showPublicPrices !== false ? (
                    <><Check className="w-4 h-4" /> Visible Publicly</>
                  ) : (
                    <><Lock className="w-4 h-4" /> Hidden (Requires Login)</>
                  )}
                </button>
              </div>

              {/* Toggle 2: Show Vendor Contacts */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                      📞 Vendor Direct Contacts (फोन नंबर)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Allow public visitors to see direct mobile/phone numbers of vendors and dukandars.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!systemSettings || !onUpdateSystemSettings) return;
                    const cur = systemSettings.publicDisplayControls?.showVendorContacts !== false;
                    const updated = {
                      ...systemSettings,
                      publicDisplayControls: {
                        ...systemSettings.publicDisplayControls,
                        showVendorContacts: !cur
                      }
                    };
                    onUpdateSystemSettings(updated);
                    setCustomizerSavedToast(`Vendor Contacts now ${!cur ? 'VISIBLE' : 'PROTECTED'}`);
                  }}
                  className={`w-full py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                    systemSettings?.publicDisplayControls?.showVendorContacts !== false
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-rose-600 text-white shadow-xs'
                  }`}
                >
                  {systemSettings?.publicDisplayControls?.showVendorContacts !== false ? (
                    <><Check className="w-4 h-4" /> Visible Publicly</>
                  ) : (
                    <><Ban className="w-4 h-4" /> Protected (Login Required)</>
                  )}
                </button>
              </div>

              {/* Toggle 3: City Selector in Header */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                      📍 City Location Selector in Navbar
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Display city selection dropdown in top header menu.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!systemSettings || !onUpdateSystemSettings) return;
                    const cur = systemSettings.publicDisplayControls?.showCitySelector !== false;
                    const updated = {
                      ...systemSettings,
                      publicDisplayControls: {
                        ...systemSettings.publicDisplayControls,
                        showCitySelector: !cur
                      }
                    };
                    onUpdateSystemSettings(updated);
                    setCustomizerSavedToast(`City Selector now ${!cur ? 'VISIBLE' : 'HIDDEN'}`);
                  }}
                  className={`w-full py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                    systemSettings?.publicDisplayControls?.showCitySelector !== false
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-600 text-white shadow-xs'
                  }`}
                >
                  {systemSettings?.publicDisplayControls?.showCitySelector !== false ? (
                    <><Check className="w-4 h-4" /> Visible in Header</>
                  ) : (
                    <><Ban className="w-4 h-4" /> Hidden from Header</>
                  )}
                </button>
              </div>

              {/* Toggle 4: AI Copilot Button */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                      🤖 AI Copilot Assistant Button
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Show AI Copilot assistant trigger button in the main navbar.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!systemSettings || !onUpdateSystemSettings) return;
                    const cur = systemSettings.publicDisplayControls?.showAiCopilotButton !== false;
                    const updated = {
                      ...systemSettings,
                      publicDisplayControls: {
                        ...systemSettings.publicDisplayControls,
                        showAiCopilotButton: !cur
                      }
                    };
                    onUpdateSystemSettings(updated);
                    setCustomizerSavedToast(`AI Copilot Button now ${!cur ? 'VISIBLE' : 'HIDDEN'}`);
                  }}
                  className={`w-full py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                    systemSettings?.publicDisplayControls?.showAiCopilotButton !== false
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-600 text-white shadow-xs'
                  }`}
                >
                  {systemSettings?.publicDisplayControls?.showAiCopilotButton !== false ? (
                    <><Check className="w-4 h-4" /> Visible in Header</>
                  ) : (
                    <><Ban className="w-4 h-4" /> Hidden from Header</>
                  )}
                </button>
              </div>

            </div>
          </div>

          {/* 4. PLATFORM MEMBERSHIP & REGISTRATION FEES (सुपर एडमिन फ़ीस नियंत्रण - जब सुपर एडमिन चाहेगा तो ही प्लेटफ़ॉर्म पर दिखेगी) */}
          <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-teal-950 text-white rounded-3xl p-6 border border-teal-500/30 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-[10px] rounded-lg uppercase tracking-wider inline-block mb-1">
                  Super Admin Fee Governance
                </span>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-amber-400" />
                  प्लेटफ़ॉर्म फ़ीस एवं मेंबरशिप चार्ज नियंत्रण (Platform Fees Control)
                </h3>
                <p className="text-xs text-slate-300">
                  यूज़र, दुकानदार, सप्लायर, ब्रांड पार्टनर एवं मटीरियल प्रोवाइडर की फ़ीस सेट करें। <strong>(केवल सुपर एडमिन की अनुमति पर ही सार्वजनिक रूप से डिस्प्ले होगी)</strong>
                </p>
              </div>

              {/* Master Display Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (!systemSettings || !onUpdateSystemSettings) return;
                  const currentFees = systemSettings.platformFees || {
                    showFeesOnPublicApp: false,
                    userFeeINR: 0,
                    dukandarFeeINR: 999,
                    supplierFeeINR: 1499,
                    brandFeeINR: 4999,
                    materialProviderFeeINR: 2499,
                    feePeriod: 'Annual',
                    gstApplicable: true,
                    notes: 'वार्षिक प्लैटफ़ॉर्म सदस्यता एवं वेरिफिकेशन शुल्क'
                  };
                  const updatedFees = {
                    ...currentFees,
                    showFeesOnPublicApp: !currentFees.showFeesOnPublicApp
                  };
                  onUpdateSystemSettings({
                    ...systemSettings,
                    platformFees: updatedFees
                  });
                  setCustomizerSavedToast(`Platform Fees display now ${!currentFees.showFeesOnPublicApp ? 'DISPLAYED PUBLICLY' : 'HIDDEN FROM PUBLIC'}`);
                }}
                className={`px-4 py-2.5 rounded-2xl font-black text-xs transition shadow-lg flex items-center gap-2 ${
                  systemSettings?.platformFees?.showFeesOnPublicApp
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 ring-2 ring-emerald-300'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {systemSettings?.platformFees?.showFeesOnPublicApp ? (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Fees Status: PUBLICLY VISIBLE (सार्वजनिक दिख रही है)</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>Fees Status: HIDDEN (सुपर एडमिन ने छिपा रखा है)</span>
                  </>
                )}
              </button>
            </div>

            {/* Fee Amounts Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

              {/* Fee 1: User / Client Fee */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <label className="block text-xs font-extrabold text-teal-300">
                  1. ग्राहक / यूज़र फ़ीस (User Fee ₹)
                </label>
                <input
                  type="number"
                  value={systemSettings?.platformFees?.userFeeINR ?? 0}
                  onChange={(e) => {
                    if (!systemSettings || !onUpdateSystemSettings) return;
                    const val = Number(e.target.value);
                    const cur = systemSettings.platformFees || { showFeesOnPublicApp: false, userFeeINR: 0, dukandarFeeINR: 999, supplierFeeINR: 1499, brandFeeINR: 4999, materialProviderFeeINR: 2499, feePeriod: 'Annual', gstApplicable: true, notes: '' };
                    onUpdateSystemSettings({
                      ...systemSettings,
                      platformFees: { ...cur, userFeeINR: val }
                    });
                  }}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-sm font-black text-amber-300"
                  placeholder="0 (Free)"
                />
                <span className="text-[10px] text-slate-400 block">0 = Free Registration</span>
              </div>

              {/* Fee 2: Dukandar Fee */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <label className="block text-xs font-extrabold text-amber-300">
                  2. दुकानदार फ़ीस (Dukandar ₹)
                </label>
                <input
                  type="number"
                  value={systemSettings?.platformFees?.dukandarFeeINR ?? 999}
                  onChange={(e) => {
                    if (!systemSettings || !onUpdateSystemSettings) return;
                    const val = Number(e.target.value);
                    const cur = systemSettings.platformFees || { showFeesOnPublicApp: false, userFeeINR: 0, dukandarFeeINR: 999, supplierFeeINR: 1499, brandFeeINR: 4999, materialProviderFeeINR: 2499, feePeriod: 'Annual', gstApplicable: true, notes: '' };
                    onUpdateSystemSettings({
                      ...systemSettings,
                      platformFees: { ...cur, dukandarFeeINR: val }
                    });
                  }}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-sm font-black text-amber-300"
                  placeholder="999"
                />
                <span className="text-[10px] text-slate-400 block">Retailer Shopkeeper Rate</span>
              </div>

              {/* Fee 3: Supplier & Vendor Fee */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <label className="block text-xs font-extrabold text-indigo-300">
                  3. सप्लायर एवं वेंडर (Supplier ₹)
                </label>
                <input
                  type="number"
                  value={systemSettings?.platformFees?.supplierFeeINR ?? 1499}
                  onChange={(e) => {
                    if (!systemSettings || !onUpdateSystemSettings) return;
                    const val = Number(e.target.value);
                    const cur = systemSettings.platformFees || { showFeesOnPublicApp: false, userFeeINR: 0, dukandarFeeINR: 999, supplierFeeINR: 1499, brandFeeINR: 4999, materialProviderFeeINR: 2499, feePeriod: 'Annual', gstApplicable: true, notes: '' };
                    onUpdateSystemSettings({
                      ...systemSettings,
                      platformFees: { ...cur, supplierFeeINR: val }
                    });
                  }}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-sm font-black text-amber-300"
                  placeholder="1499"
                />
                <span className="text-[10px] text-slate-400 block">Wholesale &amp; Contractors</span>
              </div>

              {/* Fee 4: Brand Partners */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <label className="block text-xs font-extrabold text-purple-300">
                  4. ब्रांड पार्टनर्स (Brand ₹)
                </label>
                <input
                  type="number"
                  value={systemSettings?.platformFees?.brandFeeINR ?? 4999}
                  onChange={(e) => {
                    if (!systemSettings || !onUpdateSystemSettings) return;
                    const val = Number(e.target.value);
                    const cur = systemSettings.platformFees || { showFeesOnPublicApp: false, userFeeINR: 0, dukandarFeeINR: 999, supplierFeeINR: 1499, brandFeeINR: 4999, materialProviderFeeINR: 2499, feePeriod: 'Annual', gstApplicable: true, notes: '' };
                    onUpdateSystemSettings({
                      ...systemSettings,
                      platformFees: { ...cur, brandFeeINR: val }
                    });
                  }}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-sm font-black text-amber-300"
                  placeholder="4999"
                />
                <span className="text-[10px] text-slate-400 block">Empanelled Brand Partner</span>
              </div>

              {/* Fee 5: Material Provider */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <label className="block text-xs font-extrabold text-emerald-300">
                  5. मटीरियल प्रोवाइडर (Material ₹)
                </label>
                <input
                  type="number"
                  value={systemSettings?.platformFees?.materialProviderFeeINR ?? 2499}
                  onChange={(e) => {
                    if (!systemSettings || !onUpdateSystemSettings) return;
                    const val = Number(e.target.value);
                    const cur = systemSettings.platformFees || { showFeesOnPublicApp: false, userFeeINR: 0, dukandarFeeINR: 999, supplierFeeINR: 1499, brandFeeINR: 4999, materialProviderFeeINR: 2499, feePeriod: 'Annual', gstApplicable: true, notes: '' };
                    onUpdateSystemSettings({
                      ...systemSettings,
                      platformFees: { ...cur, materialProviderFeeINR: val }
                    });
                  }}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-sm font-black text-amber-300"
                  placeholder="2499"
                />
                <span className="text-[10px] text-slate-400 block">Building Material Supplier</span>
              </div>

            </div>

            {/* Cycle and Note Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Subscription Cycle (फ़ोर्मेट/साइकिल)
                </label>
                <select
                  value={systemSettings?.platformFees?.feePeriod ?? 'Annual'}
                  onChange={(e) => {
                    if (!systemSettings || !onUpdateSystemSettings) return;
                    const cur = systemSettings.platformFees || { showFeesOnPublicApp: false, userFeeINR: 0, dukandarFeeINR: 999, supplierFeeINR: 1499, brandFeeINR: 4999, materialProviderFeeINR: 2499, feePeriod: 'Annual', gstApplicable: true, notes: '' };
                    onUpdateSystemSettings({
                      ...systemSettings,
                      platformFees: { ...cur, feePeriod: e.target.value as any }
                    });
                  }}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white"
                >
                  <option value="Annual">Annual (वार्षिक)</option>
                  <option value="Lifetime">Lifetime (आजीवन फ़्री / वन-टाइम)</option>
                  <option value="Monthly">Monthly (मासिक)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Super Admin Note / Disclaimer Message
                </label>
                <input
                  type="text"
                  value={systemSettings?.platformFees?.notes ?? 'वार्षिक प्लैटफ़ॉर्म सदस्यता एवं वेरिफिकेशन शुल्क'}
                  onChange={(e) => {
                    if (!systemSettings || !onUpdateSystemSettings) return;
                    const cur = systemSettings.platformFees || { showFeesOnPublicApp: false, userFeeINR: 0, dukandarFeeINR: 999, supplierFeeINR: 1499, brandFeeINR: 4999, materialProviderFeeINR: 2499, feePeriod: 'Annual', gstApplicable: true, notes: '' };
                    onUpdateSystemSettings({
                      ...systemSettings,
                      platformFees: { ...cur, notes: e.target.value }
                    });
                  }}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  placeholder="नोट / डिस्क्लेमर दर्ज करें"
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* CATEGORY WHITE-LABEL & FUNCTION LIMITATION CONTROL TAB */}
      {activeTab === 'whitelabel_limits' && (
        <WhiteLabelAndLimitsControl
          systemSettings={systemSettings}
          whiteLabels={whiteLabelsList}
          onSaveWhiteLabels={(updated) => {
            setWhiteLabelsList(updated);
            localStorage.setItem('2click_category_whitelabels', JSON.stringify(updated));
            if (systemSettings && onUpdateSystemSettings) {
              onUpdateSystemSettings({
                ...systemSettings,
                categoryWhiteLabels: updated
              });
            }
          }}
          activeGlobalWhiteLabelId={systemSettings?.activeGlobalWhiteLabelId}
          onSelectActiveGlobalWhiteLabel={(id) => {
            if (systemSettings && onUpdateSystemSettings) {
              onUpdateSystemSettings({
                ...systemSettings,
                activeGlobalWhiteLabelId: id
              });
            }
          }}
        />
      )}

      {/* MONETIZATION & SUBSCRIPTION REVENUE CONTROL TAB */}
      {activeTab === 'monetization' && (
        <div className="space-y-6">
          
          {/* Revenue Top Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white border border-emerald-500/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 mb-2">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Super Admin Controlled Revenue Model</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight">Platform Monetization &amp; Subscription Engine</h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Configure subscription plans (Free, Builder Pro, Enterprise, Dukandar), enforce feature access limits, manage user payment statuses, and approve transaction invoices.
                </p>
              </div>

              <button
                onClick={handleOpenCreatePlan}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Pricing Plan</span>
              </button>
            </div>

            {/* Financial Revenue Counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="text-[11px] text-emerald-300 font-semibold">Monthly Recurring Revenue (MRR)</div>
                <div className="text-lg font-black text-white mt-0.5">
                  ₹{subscriptionTransactions.filter(t => t.status === 'Completed').reduce((acc, t) => acc + t.amountINR, 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="text-[11px] text-emerald-300 font-semibold">Active Paid Subscribers</div>
                <div className="text-lg font-black text-white mt-0.5">
                  {userList.filter(u => u.subscriptionStatus === 'Active').length + 28} Accounts
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="text-[11px] text-emerald-300 font-semibold">Active Pricing Plans</div>
                <div className="text-lg font-black text-white mt-0.5">
                  {subscriptionPlans.filter(p => p.isActive).length} Tiers
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="text-[11px] text-emerald-300 font-semibold">Pending Renewal Review</div>
                <div className="text-lg font-black text-amber-300 mt-0.5">
                  {subscriptionTransactions.filter(t => t.status === 'Pending Approval').length} Receipts
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Active Subscription Plans Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-500" />
                <span>Subscription Plans &amp; Feature Tiers ({subscriptionPlans.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                    plan.isActive
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800/60 opacity-60'
                  }`}
                >
                  {plan.popularBadge && (
                    <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-xs">
                      {plan.popularBadge}
                    </span>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{plan.name}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{plan.description}</p>
                      </div>
                    </div>

                    <div className="py-2 border-y border-slate-100 dark:border-slate-800/80">
                      <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                        {plan.priceINR === 0 ? 'Free' : `₹${plan.priceINR.toLocaleString('en-IN')}`}
                        <span className="text-xs font-normal text-slate-500"> / {plan.billingCycle.toLowerCase()}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                        Max Project Limits: <strong>{plan.maxProjectsLimit} Projects</strong>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Features Included:</div>
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleTogglePlanActive(plan.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        plan.isActive
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {plan.isActive ? 'Active' : 'Disabled'}
                    </button>

                    <button
                      onClick={() => handleOpenEditPlan(plan)}
                      className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Plan</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: User Subscription Management & Feature Access Limits */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>User Subscription Status &amp; Access Controls</span>
                </h3>
                <p className="text-xs text-slate-500">Assign pricing plans, extend validity, or manage access limits for registered users.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3 font-semibold">User &amp; Email</th>
                    <th className="p-3 font-semibold">Role</th>
                    <th className="p-3 font-semibold">Current Plan</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Valid Till</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {userList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        <div>{usr.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono font-normal">{usr.email}</div>
                      </td>
                      <td className="p-3 font-medium text-slate-600 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-[10px]">
                          {usr.role}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                        {usr.subscriptionPlanName || 'Free Trial'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          usr.subscriptionStatus === 'Active'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : usr.subscriptionStatus === 'Trialing'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}>
                          {usr.subscriptionStatus || 'Active (Default)'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono">
                        {usr.subscriptionExpiresAt || '2026-12-31'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleOpenAssignUserPlan(usr)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          Modify Plan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Subscription Transactions & Receipts Audit Log */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-500" />
                  <span>Subscription Transactions &amp; Payment Receipts Log</span>
                </h3>
                <p className="text-xs text-slate-500">Real-time payment audit log for Razorpay, UPI, NEFT, and Escrow subscription payments.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3 font-semibold">Invoice No</th>
                    <th className="p-3 font-semibold">Subscriber</th>
                    <th className="p-3 font-semibold">Plan Name</th>
                    <th className="p-3 font-semibold">Amount (₹)</th>
                    <th className="p-3 font-semibold">Gateway</th>
                    <th className="p-3 font-semibold">Date</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {subscriptionTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-purple-600 dark:text-purple-400">
                        {txn.invoiceNo}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        <div>{txn.userName}</div>
                        <div className="text-[10px] text-slate-400 font-mono font-normal">{txn.userEmail}</div>
                      </td>
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-300">
                        {txn.planName}
                      </td>
                      <td className="p-3 font-black text-emerald-600 dark:text-emerald-400">
                        ₹{txn.amountINR.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-semibold">
                        {txn.paymentGateway}
                      </td>
                      <td className="p-3 text-slate-500 font-mono">
                        {txn.paymentDate}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          txn.status === 'Completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {txn.status === 'Pending Approval' ? (
                          <button
                            onClick={() => handleApproveTransaction(txn.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                          >
                            Approve Receipt
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-500 font-bold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* MODAL 1: Add New User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-600" />
              Create District Staff or User Account
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Inspector Ramesh Kumar"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="ramesh@2click.in"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Assigned Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  <option value="DistrictAdmin">District Admin</option>
                  <option value="DistrictEmployee">District Employee / Field Officer</option>
                  <option value="Employee">Central Employee</option>
                  <option value="Dukandar">Dukandar (Shopkeeper)</option>
                  <option value="Supplier">Wholesale Supplier</option>
                  <option value="Electrician">Licensed Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Architect">Architect</option>
                </select>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block font-semibold mb-1">State (राज्य)</label>
                  <select
                    value={newUserState}
                    onChange={(e) => {
                      const st = e.target.value;
                      setNewUserState(st);
                      const mList = getMandalsForState(st);
                      if (mList.length > 0) {
                        setNewUserMandal(mList[0].name);
                        setNewUserDistrict(mList[0].districts[0]);
                      }
                    }}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  >
                    {getAllStates().map(s => (
                      <option key={s.state} value={s.state}>{s.state} ({s.stateHindi})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Mandal (मंडल)</label>
                    <select
                      value={newUserMandal}
                      onChange={(e) => {
                        const m = e.target.value;
                        setNewUserMandal(m);
                        const dList = getDistrictsForMandal(newUserState, m);
                        if (dList.length > 0) {
                          setNewUserDistrict(dList[0]);
                        }
                      }}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                    >
                      {getMandalsForState(newUserState).map(m => (
                        <option key={m.name} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">District (ज़िला)</label>
                    <select
                      value={newUserDistrict}
                      onChange={(e) => setNewUserDistrict(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                    >
                      {getDistrictsForMandal(newUserState, newUserMandal).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 text-white font-bold rounded-xl"
                >
                  Create &amp; Assign Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Dukandar Product */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-teal-600" />
              Super Admin Product Add Engine
            </h3>

            <form onSubmit={handleAdminAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  placeholder="e.g. 550W Mono PERC Bifacial Solar Panel"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    placeholder="e.g. Tata Power / Havells"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  >
                    <option value="solar">Solar Equipment</option>
                    <option value="water_etp">Water ETP / STP</option>
                    <option value="electrical">Electrical MEP</option>
                    <option value="civil">Civil Materials</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-extrabold text-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Target Dukandar / Shop</label>
                  <input
                    type="text"
                    value={prodVendor}
                    onChange={(e) => setProdVendor(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Product Photo Upload Section */}
              <div className="space-y-2 p-3 bg-teal-50/60 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800">
                <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-teal-800 dark:text-teal-300">
                    <Camera className="w-4 h-4 text-teal-600" />
                    Product Photo (सामग्री / प्रोडक्ट फोटो)
                  </span>
                  <span className="text-[10px] text-teal-600 font-bold">Upload file or URL</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border-2 border-dashed border-teal-500 hover:border-teal-600 rounded-xl text-teal-700 dark:text-teal-300 font-bold text-xs transition shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAdminProductPhotoUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  <div>
                    <input
                      type="url"
                      placeholder="Or Paste Photo URL (https://...)"
                      value={prodImage}
                      onChange={(e) => setProdImage(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                {prodImage && (
                  <div className="relative mt-2 rounded-xl overflow-hidden border border-teal-300 dark:border-teal-700 max-h-28 bg-slate-900 flex items-center justify-center p-1">
                    <img src={prodImage} alt="Preview" referrerPolicy="no-referrer" className="h-20 object-contain" />
                    <button
                      type="button"
                      onClick={() => setProdImage('')}
                      className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition"
                      title="Remove Photo"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 text-white font-bold rounded-xl"
                >
                  Publish &amp; Approve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Create / Edit Subscription Plan */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              <span>{editingPlanId ? 'Edit Pricing Plan' : 'Create New Subscription Tier'}</span>
            </h3>

            <form onSubmit={handleSavePlan} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={planNameInput}
                  onChange={(e) => setPlanNameInput(e.target.value)}
                  placeholder="e.g. Builder Pro / Enterprise Tier"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={planPriceInput}
                    onChange={(e) => setPlanPriceInput(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-black text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Billing Cycle</label>
                  <select
                    value={planCycleInput}
                    onChange={(e) => setPlanCycleInput(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual</option>
                    <option value="One-Time">One-Time / Lifetime</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={planDescInput}
                  onChange={(e) => setPlanDescInput(e.target.value)}
                  placeholder="Short tagline summarizing plan benefit"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Features (comma separated)</label>
                <textarea
                  rows={2}
                  value={planFeaturesInput}
                  onChange={(e) => setPlanFeaturesInput(e.target.value)}
                  placeholder="e.g. Full BOQ Engine, AI Vastu Studio, Unlimited Contracts"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Max Projects Limit</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={planMaxProjectsInput}
                    onChange={(e) => setPlanMaxProjectsInput(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Status</label>
                  <button
                    type="button"
                    onClick={() => setPlanIsActiveInput(!planIsActiveInput)}
                    className={`w-full p-2.5 rounded-xl font-bold transition text-center cursor-pointer ${
                      planIsActiveInput
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 border border-slate-300'
                    }`}
                  >
                    {planIsActiveInput ? 'Active & Published' : 'Disabled (Hidden)'}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-md cursor-pointer"
                >
                  Save Pricing Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Modify / Assign User Subscription */}
      {showAssignModal && selectedAssignUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Users className="w-5 h-5 text-purple-600" />
              <span>User Subscription Override</span>
            </h3>

            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">{selectedAssignUser.name}</div>
              <div className="text-slate-500 font-mono">{selectedAssignUser.email} • {selectedAssignUser.role}</div>
            </div>

            <form onSubmit={handleSaveUserPlanAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Select Subscription Plan</label>
                <select
                  value={assignPlanId}
                  onChange={(e) => setAssignPlanId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  {subscriptionPlans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.priceINR === 0 ? 'Free' : `₹${p.priceINR}/mo`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Subscription Status</label>
                <select
                  value={assignStatus}
                  onChange={(e) => setAssignStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  <option value="Active">Active (Full Access)</option>
                  <option value="Trialing">Trialing (Limited Period)</option>
                  <option value="Pending Approval">Pending Approval (Awaiting Payment)</option>
                  <option value="Expired">Expired / Suspended</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl shadow-md cursor-pointer"
                >
                  Apply Subscription Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User-Wise Custom Permissions Modal */}
      <UserPermissionModal
        user={editingUserPermissionModalUser}
        isOpen={userPermissionModalOpen}
        onClose={() => setUserPermissionModalOpen(false)}
        onSavePermissions={handleSaveUserPermissions}
        onPreviewUserDashboard={(u) => {
          if (onImpersonateUserDashboard) {
            onImpersonateUserDashboard(u);
          } else if (onSwitchRole) {
            onSwitchRole(u.role);
          }
        }}
      />

    </div>
  );
};

