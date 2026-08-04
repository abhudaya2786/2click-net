import React, { useState } from 'react';
import {
  ShieldCheck,
  FileCheck,
  Store,
  MapPin,
  Building2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Plus,
  Download,
  UserCheck,
  QrCode,
  Phone,
  Mail,
  Layers,
  Award,
  DollarSign,
  X,
  Send,
  Lock,
  FileText,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Clock,
  User,
  BadgeCheck,
  CreditCard,
  Building
} from 'lucide-react';
import { User as UserType } from '../types';

export interface KycVendorShopkeeper {
  id: string;
  name: string;
  ownerName: string;
  role: 'Vendor' | 'Shopkeeper' | 'Contractor';
  category: string;
  primaryPincode: string;
  coveredPincodes: string[];
  city: string;
  phone: string;
  email: string;
  gstin: string;
  panNumber: string;
  aadhaarMasked: string;
  tradeLicenseNo: string;
  shopAddress: string;
  gpsCoordinates: string;
  shopfrontPhotoUrl: string;
  bankAccountNo: string;
  bankIfsc: string;
  upiVpa: string;
  kycStatus: 'Verified' | 'Pending' | 'Action Needed' | 'Rejected';
  kycApprovedDate?: string;
  rating: number;
  yearsInBusiness: number;
  agreementsSignedCount: number;
  rateDiscountOfferedPct: number;
}

export interface SupplyAgreement {
  id: string;
  agreementNumber: string;
  agreementType: 'Rate Lock Supply MOU' | 'Dukandar Display & Stock MOU' | 'Quality & Warranty Covenant' | 'B2B Credit Settlement';
  userRole: 'Client' | 'Contractor' | 'Vendor' | 'District Admin';
  partyA_Name: string;
  partyA_Role: string;
  partyB_Name: string;
  partyB_Role: string;
  partnerPincodes: string[];
  categoryScope: string;
  agreedRateDiscountPct: number;
  creditDays: number;
  penaltyPerDayINR: number;
  advanceDepositINR: number;
  startDate: string;
  validUntil: string;
  status: 'Active / Executed' | 'Pending Counter-Signature' | 'Draft' | 'Expired';
  qrVerificationCode: string;
  digitalSignatureStamp: string;
}

const SAMPLE_KYC_PARTNERS: KycVendorShopkeeper[] = [
  {
    id: 'PARTNER-GORAKHPUR-101',
    name: 'Shree Ram Cement & Building Materials Mart',
    ownerName: 'Ramprasad Sharma',
    role: 'Shopkeeper',
    category: 'Cement & Aggregates',
    primaryPincode: '273001',
    coveredPincodes: ['273001', '273002', '273005', '273012', '273015'],
    city: 'Gorakhpur',
    phone: '+91 98390 11223',
    email: 'shreeram.cement@gmail.com',
    gstin: '09AAACR9981A1Z4',
    panNumber: 'AAACR9981A',
    aadhaarMasked: 'XXXX-XXXX-4812',
    tradeLicenseNo: 'TRD/GKP/2024/8812',
    shopAddress: 'Shop #14, Golghar Main Road, Near Town Hall, Gorakhpur',
    gpsCoordinates: '26.7606° N, 83.3732° E',
    shopfrontPhotoUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    bankAccountNo: '98120010005432',
    bankIfsc: 'SBIN0000123',
    upiVpa: 'shreeram.cement@sbi',
    kycStatus: 'Verified',
    kycApprovedDate: '2026-01-15',
    rating: 4.9,
    yearsInBusiness: 18,
    agreementsSignedCount: 12,
    rateDiscountOfferedPct: 6.5
  },
  {
    id: 'PARTNER-GORAKHPUR-102',
    name: 'Gorakhpur TMT Rebar & Hardware Wholesalers',
    ownerName: 'Vikas Kumar Agarwal',
    role: 'Vendor',
    category: 'Steel & TMT Rebar',
    primaryPincode: '273015',
    coveredPincodes: ['273001', '273015', '273020', '273209'],
    city: 'Gorakhpur',
    phone: '+91 94152 44332',
    email: 'sales@gorakhpurtmt.in',
    gstin: '09AABCG4412B1ZX',
    panNumber: 'AABCG4412B',
    aadhaarMasked: 'XXXX-XXXX-9901',
    tradeLicenseNo: 'TRD/GKP/2023/1029',
    shopAddress: 'Plot 42, GIDA Industrial Area Sector-15, Gorakhpur',
    gpsCoordinates: '26.7410° N, 83.2980° E',
    shopfrontPhotoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    bankAccountNo: '50200043128901',
    bankIfsc: 'HDFC0000412',
    upiVpa: 'gorakhpurtmt@hdfcbank',
    kycStatus: 'Verified',
    kycApprovedDate: '2026-02-01',
    rating: 4.8,
    yearsInBusiness: 12,
    agreementsSignedCount: 24,
    rateDiscountOfferedPct: 8.0
  },
  {
    id: 'PARTNER-BANGALORE-201',
    name: 'South India Paints & Waterproofing Hub',
    ownerName: 'K. S. Narayana Swamy',
    role: 'Shopkeeper',
    category: 'Paints & Waterproofing',
    primaryPincode: '560001',
    coveredPincodes: ['560001', '560002', '560025', '560038'],
    city: 'Bengaluru',
    phone: '+91 98450 66778',
    email: 'contact@southindiapaints.com',
    gstin: '29AABCS8812D1ZE',
    panNumber: 'AABCS8812D',
    aadhaarMasked: 'XXXX-XXXX-3341',
    tradeLicenseNo: 'BBMP/TRD/2025/9941',
    shopAddress: ' #88, MG Road, Opposite Metro Station, Bengaluru',
    gpsCoordinates: '12.9716° N, 77.5946° E',
    shopfrontPhotoUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    bankAccountNo: '0012015099812',
    bankIfsc: 'ICIC0000012',
    upiVpa: 'southpaints@icici',
    kycStatus: 'Verified',
    kycApprovedDate: '2026-02-10',
    rating: 4.9,
    yearsInBusiness: 22,
    agreementsSignedCount: 19,
    rateDiscountOfferedPct: 10.0
  },
  {
    id: 'PARTNER-LUCKNOW-301',
    name: 'Awadh Tiles, Granite & Sanitaryware Mart',
    ownerName: 'Mohd. Tariq Siddiqui',
    role: 'Shopkeeper',
    category: 'Tiles & Marble',
    primaryPincode: '226001',
    coveredPincodes: ['226001', '226010', '226016', '226022'],
    city: 'Lucknow',
    phone: '+91 93350 88221',
    email: 'awadhtiles@gmail.com',
    gstin: '09AAACT5541E1ZA',
    panNumber: 'AAACT5541E',
    aadhaarMasked: 'XXXX-XXXX-7712',
    tradeLicenseNo: 'LMC/TRD/2024/3312',
    shopAddress: 'Shop #4, Hazratganj Market Complex, Lucknow',
    gpsCoordinates: '26.8467° N, 80.9462° E',
    shopfrontPhotoUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    bankAccountNo: '3099120005412',
    bankIfsc: 'CBIN0280123',
    upiVpa: 'awadhtiles@centralbank',
    kycStatus: 'Pending',
    rating: 4.6,
    yearsInBusiness: 9,
    agreementsSignedCount: 5,
    rateDiscountOfferedPct: 5.0
  },
  {
    id: 'PARTNER-DELHI-401',
    name: 'Capital Electricals & Havells Lighting Gallery',
    ownerName: 'Rajender Kumar Gupta',
    role: 'Vendor',
    category: 'Electrical & Lighting',
    primaryPincode: '110001',
    coveredPincodes: ['110001', '110002', '110006', '110055'],
    city: 'Delhi NCR',
    phone: '+91 98110 33445',
    email: 'sales@capitalelectricals.in',
    gstin: '07AABCC3312A1Z9',
    panNumber: 'AABCC3312A',
    aadhaarMasked: 'XXXX-XXXX-1190',
    tradeLicenseNo: 'NDMC/TRD/2023/1088',
    shopAddress: '1022, Bhagirath Palace Electrical Market, Chandni Chowk, Delhi',
    gpsCoordinates: '28.6562° N, 77.2310° E',
    shopfrontPhotoUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    bankAccountNo: '000705001234',
    bankIfsc: 'UTIB0000007',
    upiVpa: 'capitalelectricals@axisbank',
    kycStatus: 'Verified',
    kycApprovedDate: '2026-01-20',
    rating: 4.9,
    yearsInBusiness: 30,
    agreementsSignedCount: 38,
    rateDiscountOfferedPct: 12.0
  }
];

const SAMPLE_AGREEMENTS: SupplyAgreement[] = [
  {
    id: 'AGR-2026-8801',
    agreementNumber: 'MOU/GKP/2026/001',
    agreementType: 'Rate Lock Supply MOU',
    userRole: 'Client',
    partyA_Name: 'Er. Rakesh Verma (Gorakhpur Villa G+2 Project)',
    partyA_Role: 'Client / Project Owner',
    partyB_Name: 'Shree Ram Cement & Building Materials Mart',
    partyB_Role: 'Local Shopkeeper',
    partnerPincodes: ['273001', '273015'],
    categoryScope: 'Cement & Aggregates',
    agreedRateDiscountPct: 6.5,
    creditDays: 30,
    penaltyPerDayINR: 1000,
    advanceDepositINR: 50000,
    startDate: '2026-02-01',
    validUntil: '2027-01-31',
    status: 'Active / Executed',
    qrVerificationCode: 'VERIFIED-MOU-273001-8801',
    digitalSignatureStamp: 'STAMP_STATIONERY_GORAKHPUR_REG_09AAACR'
  },
  {
    id: 'AGR-2026-8802',
    agreementNumber: 'MOU/DEL/2026/014',
    agreementType: 'Dukandar Display & Stock MOU',
    userRole: 'Vendor',
    partyA_Name: '2click B2B Direct Procurement Cell',
    partyA_Role: 'Platform Super Admin',
    partyB_Name: 'Capital Electricals & Havells Lighting Gallery',
    partyB_Role: 'Wholesale Vendor',
    partnerPincodes: ['110001', '110002', '110006'],
    categoryScope: 'Electrical & Lighting',
    agreedRateDiscountPct: 12.0,
    creditDays: 45,
    penaltyPerDayINR: 2500,
    advanceDepositINR: 200000,
    startDate: '2026-01-15',
    validUntil: '2027-01-14',
    status: 'Active / Executed',
    qrVerificationCode: 'VERIFIED-MOU-110001-8802',
    digitalSignatureStamp: 'STAMP_DELHI_NDMC_AUTH_07AABCC'
  }
];

interface VendorShopkeeperAgreementKycHubProps {
  currentUser: UserType | null;
  onOpenAuth: () => void;
  selectedCity?: string;
}

export const VendorShopkeeperAgreementKycHub: React.FC<VendorShopkeeperAgreementKycHubProps> = ({
  currentUser,
  onOpenAuth,
  selectedCity = 'Gorakhpur'
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'agreements' | 'add_partner'>('directory');

  // Directory filter states
  const [partnerList, setPartnerList] = useState<KycVendorShopkeeper[]>(SAMPLE_KYC_PARTNERS);
  const [agreementsList, setAgreementsList] = useState<SupplyAgreement[]>(SAMPLE_AGREEMENTS);

  const [pincodeFilter, setPincodeFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [kycStatusFilter, setKycStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected partner for detail modal or agreement creation
  const [selectedPartnerForModal, setSelectedPartnerForModal] = useState<KycVendorShopkeeper | null>(null);
  const [showAgreementFormModal, setShowAgreementFormModal] = useState<boolean>(false);
  const [selectedPartnerForAgreement, setSelectedPartnerForAgreement] = useState<KycVendorShopkeeper | null>(null);

  // New Agreement Form State
  const [agreementType, setAgreementType] = useState<SupplyAgreement['agreementType']>('Rate Lock Supply MOU');
  const [agreedDiscount, setAgreedDiscount] = useState<number>(7.5);
  const [creditDays, setCreditDays] = useState<number>(30);
  const [advanceDepositINR, setAdvanceDepositINR] = useState<number>(50000);
  const [penaltyPerDayINR, setPenaltyPerDayINR] = useState<number>(1000);
  const [userRoleContext, setUserRoleContext] = useState<SupplyAgreement['userRole']>('Client');

  // New Partner Registration Form State
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newRole, setNewRole] = useState<'Shopkeeper' | 'Vendor'>('Shopkeeper');
  const [newCategory, setNewCategory] = useState('Cement & Aggregates');
  const [newPincode, setNewPincode] = useState('273001');
  const [newCoveredPincodesStr, setNewCoveredPincodesStr] = useState('273001, 273002, 273015');
  const [newCity, setNewCity] = useState('Gorakhpur');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newGstin, setNewGstin] = useState('');
  const [newPan, setNewPan] = useState('');
  const [newAadhaar, setNewAadhaar] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newBankAcc, setNewBankAcc] = useState('');
  const [newIfsc, setNewIfsc] = useState('');
  const [newUpi, setNewUpi] = useState('');

  // Filtered Partners
  const filteredPartners = partnerList.filter(p => {
    const matchesPincode = !pincodeFilter.trim() || 
                           p.primaryPincode.includes(pincodeFilter.trim()) ||
                           p.coveredPincodes.some(pin => pin.includes(pincodeFilter.trim()));
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesRole = roleFilter === 'All' || p.role === roleFilter;
    const matchesKyc = kycStatusFilter === 'All' || p.kycStatus === kycStatusFilter;
    const matchesQuery = !searchQuery.trim() || 
                         p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.city.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesPincode && matchesCategory && matchesRole && matchesKyc && matchesQuery;
  });

  // Verify KYC action
  const handleVerifyKyc = (partnerId: string) => {
    setPartnerList(prev => prev.map(p => {
      if (p.id === partnerId) {
        return {
          ...p,
          kycStatus: 'Verified',
          kycApprovedDate: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    }));
    alert('KYC Verified successfully! Stamp & Green Badge active.');
  };

  // Submit New Agreement
  const handleCreateAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerForAgreement) return;

    const newAgreement: SupplyAgreement = {
      id: `AGR-${Date.now().toString().slice(-4)}`,
      agreementNumber: `MOU/${selectedPartnerForAgreement.primaryPincode}/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      agreementType,
      userRole: userRoleContext,
      partyA_Name: currentUser?.companyName || currentUser?.name || 'Er. Rakesh Verma (Registered Client)',
      partyA_Role: currentUser?.role || 'Client / Builder',
      partyB_Name: selectedPartnerForAgreement.name,
      partyB_Role: `${selectedPartnerForAgreement.role} (${selectedPartnerForAgreement.category})`,
      partnerPincodes: selectedPartnerForAgreement.coveredPincodes,
      categoryScope: selectedPartnerForAgreement.category,
      agreedRateDiscountPct: Number(agreedDiscount),
      creditDays: Number(creditDays),
      penaltyPerDayINR: Number(penaltyPerDayINR),
      advanceDepositINR: Number(advanceDepositINR),
      startDate: new Date().toISOString().split('T')[0],
      validUntil: '2027-08-01',
      status: 'Active / Executed',
      qrVerificationCode: `VERIFIED-${selectedPartnerForAgreement.primaryPincode}-${Date.now().toString().slice(-4)}`,
      digitalSignatureStamp: `STAMP_${selectedPartnerForAgreement.primaryPincode}_DIGITAL_STATIONERY`
    };

    setAgreementsList([newAgreement, ...agreementsList]);
    
    // update agreements count for partner
    setPartnerList(prev => prev.map(p => p.id === selectedPartnerForAgreement.id ? { ...p, agreementsSignedCount: p.agreementsSignedCount + 1 } : p));

    setShowAgreementFormModal(false);
    setSelectedPartnerForAgreement(null);
    alert(`Legal Supply Agreement #${newAgreement.agreementNumber} generated & digitally signed!`);
  };

  // Submit New Partner KYC Form
  const handleRegisterNewPartner = (e: React.FormEvent) => {
    e.preventDefault();
    const coveredArr = newCoveredPincodesStr.split(',').map(s => s.trim()).filter(Boolean);

    const newPartner: KycVendorShopkeeper = {
      id: `PARTNER-USER-${Date.now().toString().slice(-4)}`,
      name: newPartnerName,
      ownerName: newOwnerName,
      role: newRole,
      category: newCategory,
      primaryPincode: newPincode,
      coveredPincodes: coveredArr.length > 0 ? coveredArr : [newPincode],
      city: newCity,
      phone: newPhone,
      email: newEmail,
      gstin: newGstin || 'Pending Verification',
      panNumber: newPan || 'ABCDE1234F',
      aadhaarMasked: newAadhaar ? `XXXX-XXXX-${newAadhaar.slice(-4)}` : 'XXXX-XXXX-0000',
      tradeLicenseNo: `TRD/${newPincode}/2026/${Math.floor(1000 + Math.random() * 9000)}`,
      shopAddress: newAddress,
      gpsCoordinates: '26.7600° N, 83.3700° E',
      shopfrontPhotoUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
      bankAccountNo: newBankAcc,
      bankIfsc: newIfsc,
      upiVpa: newUpi,
      kycStatus: 'Pending',
      rating: 5.0,
      yearsInBusiness: 5,
      agreementsSignedCount: 0,
      rateDiscountOfferedPct: 5.0
    };

    setPartnerList([newPartner, ...partnerList]);
    setActiveTab('directory');
    alert(`New ${newRole} account submitted with Pincode ${newPincode}. KYC approval pending.`);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl border border-indigo-500/30 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Complete KYC &amp; Agreement Engine
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl text-xs font-extrabold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Pincode-Wise Hyperlocal Supply
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>वेंडर एवं दुकानदार केवाईसी और एग्रीमेंट प्रबंधन</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              User Role-wise Digital Supply Agreements, Category Classification, and 100% Verified Pincode-wise Vendor &amp; Shopkeeper Directory with GSTIN, PAN, Bank VPA &amp; Shopfront Proofs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('add_partner')}
              className="px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg hover:scale-102 transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Register Vendor / Shopkeeper
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 mt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="block text-[11px] text-slate-400 font-bold uppercase">Total Verified Partners</span>
            <span className="text-xl font-black text-white">{partnerList.length} Network Nodes</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="block text-[11px] text-slate-400 font-bold uppercase">KYC Pass Rate</span>
            <span className="text-xl font-black text-emerald-400">
              {Math.round((partnerList.filter(p => p.kycStatus === 'Verified').length / partnerList.length) * 100)}% Verified
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="block text-[11px] text-slate-400 font-bold uppercase">Active Agreements</span>
            <span className="text-xl font-black text-indigo-400">{agreementsList.length} Legal MOUs</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="block text-[11px] text-slate-400 font-bold uppercase">Pincodes Covered</span>
            <span className="text-xl font-black text-amber-400">48 Pin Regions</span>
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-sm font-bold gap-2">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 px-4 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'directory'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Complete KYC Directory (Pincode &amp; Category)</span>
        </button>

        <button
          onClick={() => setActiveTab('agreements')}
          className={`pb-3 px-4 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'agreements'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>User-Wise Supply Agreements ({agreementsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('add_partner')}
          className={`pb-3 px-4 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'add_partner'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Enroll New Vendor / Dukandar</span>
        </button>
      </div>

      {/* TAB 1: COMPLETE KYC DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          
          {/* FILTER TOOLBAR */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Vendor, Shop, GSTIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Pincode Filter */}
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by Pincode (e.g. 273001)"
                  value={pincodeFilter}
                  onChange={(e) => setPincodeFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Role Filter */}
              <div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                >
                  <option value="All">All Roles (Vendors &amp; Shopkeepers)</option>
                  <option value="Shopkeeper">Local Shopkeeper / Dukandar</option>
                  <option value="Vendor">Wholesale Vendor / Distributor</option>
                  <option value="Contractor">Turnkey Contractor</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                >
                  <option value="All">All Material Categories</option>
                  <option value="Cement & Aggregates">Cement &amp; Aggregates</option>
                  <option value="Steel & TMT Rebar">Steel &amp; TMT Rebar</option>
                  <option value="Paints & Waterproofing">Paints &amp; Waterproofing</option>
                  <option value="Tiles & Marble">Tiles &amp; Marble</option>
                  <option value="Electrical & Lighting">Electrical &amp; Lighting</option>
                </select>
              </div>

              {/* KYC Status Filter */}
              <div>
                <select
                  value={kycStatusFilter}
                  onChange={(e) => setKycStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                >
                  <option value="All">All KYC Statuses</option>
                  <option value="Verified">Verified ✅</option>
                  <option value="Pending">Pending Approval ⏳</option>
                  <option value="Action Needed">Action Needed ⚠️</option>
                </select>
              </div>

            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Showing {filteredPartners.length} of {partnerList.length} registered partners</span>
              {(pincodeFilter || searchQuery || categoryFilter !== 'All' || roleFilter !== 'All' || kycStatusFilter !== 'All') && (
                <button
                  onClick={() => {
                    setPincodeFilter('');
                    setSearchQuery('');
                    setCategoryFilter('All');
                    setRoleFilter('All');
                    setKycStatusFilter('All');
                  }}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>

          {/* PARTNERS LIST CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPartners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-lg space-y-4 hover:border-indigo-500/50 transition relative overflow-hidden"
              >
                {/* Header Row */}
                <div className="flex items-start gap-4">
                  <img
                    src={partner.shopfrontPhotoUrl}
                    alt={partner.name}
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm"
                  />

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        partner.role === 'Shopkeeper' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}>
                        {partner.role === 'Shopkeeper' ? '🏬 Dukandar / Retailer' : '🏭 Wholesale Vendor'}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1 ${
                        partner.kycStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {partner.kycStatus === 'Verified' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                        <span>KYC: {partner.kycStatus}</span>
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base truncate">
                      {partner.name}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Owner: <strong className="text-slate-700 dark:text-slate-300">{partner.ownerName}</strong>
                    </p>

                    <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                      <MapPin className="w-3.5 h-3.5" /> Primary Pincode: <strong>{partner.primaryPincode}</strong> ({partner.city})
                    </div>
                  </div>
                </div>

                {/* PINCODES SERVED CHIPS */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Covered Service Pincodes:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {partner.coveredPincodes.map((pin) => (
                      <span
                        key={pin}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          pin === partner.primaryPincode
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        📍 {pin}
                      </span>
                    ))}
                  </div>
                </div>

                {/* KYC DETAILS GRID */}
                <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-indigo-950/20 dark:bg-indigo-950/40 border border-indigo-500/20 rounded-2xl text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">GSTIN Number:</span>
                    <strong className="text-indigo-600 dark:text-indigo-300">{partner.gstin}</strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">PAN Verification:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{partner.panNumber}</strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Aadhaar (Masked):</span>
                    <strong className="text-slate-800 dark:text-slate-200">{partner.aadhaarMasked}</strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Bank UPI VPA:</span>
                    <strong className="text-emerald-600 dark:text-emerald-300">{partner.upiVpa}</strong>
                  </div>
                </div>

                {/* BOTTOM ACTIONS */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    ★ <strong>{partner.rating}</strong> ({partner.yearsInBusiness} yrs exp) • {partner.agreementsSignedCount} MOUs
                  </div>

                  <div className="flex items-center gap-2">
                    {partner.kycStatus === 'Pending' && (
                      <button
                        onClick={() => handleVerifyKyc(partner.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer"
                      >
                        Verify KYC
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedPartnerForAgreement(partner);
                        setShowAgreementFormModal(true);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <FileCheck className="w-3.5 h-3.5" /> Sign Agreement
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 2: USER-WISE SUPPLY AGREEMENTS */}
      {activeTab === 'agreements' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Executed Digital Supply Agreements (MOU)
            </h2>
            <span className="text-xs text-slate-500">
              Legally stamped &amp; pincode-locked contracts
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agreementsList.map((agr) => (
              <div
                key={agr.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg text-[10px] font-black uppercase">
                      {agr.agreementType}
                    </span>
                    <h3 className="font-black text-slate-900 dark:text-white text-base mt-1">
                      #{agr.agreementNumber}
                    </h3>
                  </div>

                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-black">
                    {agr.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block">PARTIES TO AGREEMENT:</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      A: {agr.partyA_Name} ({agr.partyA_Role})
                    </p>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">
                      B: {agr.partyB_Name} ({agr.partyB_Role})
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Category Scope:</span>
                      <strong>{agr.categoryScope}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Rate Lock Discount:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">{agr.agreedRateDiscountPct}% Below MRP</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Credit Period:</span>
                      <strong>{agr.creditDays} Days Interest Free</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Delay Penalty:</span>
                      <strong className="text-rose-500">₹{agr.penaltyPerDayINR}/day</strong>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900 text-slate-300 rounded-xl flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span>{agr.qrVerificationCode}</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">Valid: {agr.startDate} to {agr.validUntil}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => alert(`Printable Supply MOU #${agr.agreementNumber} generated!`)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Stamped MOU PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ENROLL NEW VENDOR / DUKANDAR */}
      {activeTab === 'add_partner' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-indigo-500" /> Enroll Vendor / Shopkeeper with Complete KYC
            </h2>
            <p className="text-xs text-slate-500">
              Enter shop address, Pincode coverage, GSTIN, and Bank details for digital onboarding.
            </p>
          </div>

          <form onSubmit={handleRegisterNewPartner} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Role Type
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Shopkeeper">🏬 Local Dukandar / Retailer</option>
                  <option value="Vendor">🏭 Wholesale Vendor / Distributor</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Cement & Aggregates">Cement &amp; Aggregates</option>
                  <option value="Steel & TMT Rebar">Steel &amp; TMT Rebar</option>
                  <option value="Paints & Waterproofing">Paints &amp; Waterproofing</option>
                  <option value="Tiles & Marble">Tiles &amp; Marble</option>
                  <option value="Electrical & Lighting">Electrical &amp; Lighting</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Business / Shop Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gorakhpur Hardware Mart"
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Owner Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Pincode
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 273001"
                  value={newPincode}
                  onChange={(e) => setNewPincode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gorakhpur"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Phone
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98390..."
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Covered Service Pincodes (Comma separated)
              </label>
              <input
                type="text"
                placeholder="273001, 273002, 273012, 273015"
                value={newCoveredPincodesStr}
                onChange={(e) => setNewCoveredPincodesStr(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  GSTIN Number
                </label>
                <input
                  type="text"
                  placeholder="09AAACR9981A1Z4"
                  value={newGstin}
                  onChange={(e) => setNewGstin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  PAN Number
                </label>
                <input
                  type="text"
                  placeholder="AAACR9981A"
                  value={newPan}
                  onChange={(e) => setNewPan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Shop Address
              </label>
              <textarea
                rows={2}
                placeholder="Shop #, Street, Landmark..."
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('directory')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md transition cursor-pointer"
              >
                Submit Partner KYC
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CREATE AGREEMENT */}
      {showAgreementFormModal && selectedPartnerForAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Sign Supply MOU with {selectedPartnerForAgreement.name}
                </h3>
              </div>
              <button
                onClick={() => setShowAgreementFormModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgreement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Agreement Type
                </label>
                <select
                  value={agreementType}
                  onChange={(e) => setAgreementType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Rate Lock Supply MOU">Rate Lock Supply MOU (Fixed Pricing 1 Year)</option>
                  <option value="Dukandar Display & Stock MOU">Dukandar Display &amp; Stock MOU</option>
                  <option value="Quality & Warranty Covenant">Quality &amp; Warranty Guarantee Covenant</option>
                  <option value="B2B Credit Settlement">B2B Credit &amp; Escrow Settlement MOU</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Agreed Discount (% Below MRP)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={agreedDiscount}
                    onChange={(e) => setAgreedDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Credit Period (Days)
                  </label>
                  <input
                    type="number"
                    value={creditDays}
                    onChange={(e) => setCreditDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl space-y-1 text-slate-700 dark:text-slate-300">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block uppercase">Pincodes Locked:</span>
                <p className="font-bold">{selectedPartnerForAgreement.coveredPincodes.join(', ')}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAgreementFormModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md transition cursor-pointer"
                >
                  Digitally Stamp &amp; Execute MOU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
