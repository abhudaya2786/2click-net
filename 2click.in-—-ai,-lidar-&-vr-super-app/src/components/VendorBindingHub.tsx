import React, { useState } from 'react';
import { 
  Users, 
  FileCheck, 
  ShieldCheck, 
  Search, 
  Filter, 
  Building2, 
  Phone, 
  Mail, 
  Award, 
  Star, 
  Plus, 
  Lock, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  DollarSign, 
  Download,
  Key,
  ShieldAlert,
  Droplets,
  Zap,
  Hammer,
  Sun,
  Compass,
  Landmark,
  Layers,
  Tag,
  Send,
  MessageSquare,
  MapPin,
  Navigation,
  LocateFixed,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  Globe,
  Building,
  Upload,
  UploadCloud,
  FileSpreadsheet,
  X,
  CheckSquare,
  Square,
  Share2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { SAMPLE_VENDORS, SAMPLE_VENDOR_BIDS, SAMPLE_BINDING_CONTRACTS, SAMPLE_PROJECTS, SAMPLE_GOVT_TENDERS, SAMPLE_SARKAR_SUB_BIDS } from '../data/initialData';
import { Vendor, VendorBid, BindingContract, User, GovernmentAwardedTender, SarkarSubBid } from '../types';

interface VendorBindingHubProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  defaultCategoryFilter?: string;
}

const CITY_PINCODE_COORDS: Record<string, { lat: number; lng: number; city: string; pincode: string }> = {
  '560001': { lat: 12.9716, lng: 77.5946, city: 'Bengaluru', pincode: '560001' },
  '560100': { lat: 12.8452, lng: 77.6602, city: 'Bengaluru', pincode: '560100' },
  '600001': { lat: 13.0827, lng: 80.2707, city: 'Chennai', pincode: '600001' },
  '400001': { lat: 19.0760, lng: 72.8777, city: 'Mumbai', pincode: '400001' },
  '411001': { lat: 18.5204, lng: 73.8567, city: 'Pune', pincode: '411001' },
  '500001': { lat: 17.3850, lng: 78.4867, city: 'Hyderabad', pincode: '500001' },
  '273001': { lat: 26.7606, lng: 83.3732, city: 'Gorakhpur', pincode: '273001' },
  '226001': { lat: 26.8467, lng: 80.9462, city: 'Lucknow', pincode: '226001' },
  '110001': { lat: 28.6139, lng: 77.2090, city: 'Delhi', pincode: '110001' },
  '380001': { lat: 23.0225, lng: 72.5714, city: 'Ahmedabad', pincode: '380001' },
  '700001': { lat: 22.5726, lng: 88.3639, city: 'Kolkata', pincode: '700001' },
  '302001': { lat: 26.9124, lng: 75.7873, city: 'Jaipur', pincode: '302001' },
  '160001': { lat: 30.7333, lng: 76.7794, city: 'Chandigarh', pincode: '160001' },
  '682001': { lat: 9.9312, lng: 76.2673, city: 'Kochi', pincode: '682001' },
};

function calculateHaversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const VendorBindingHub: React.FC<VendorBindingHubProps> = ({
  currentUser,
  onOpenAuth,
  defaultCategoryFilter
}) => {
  const [activeTab, setActiveTab] = useState<'sarkar_tenders' | 'directory' | 'bids' | 'contracts'>('sarkar_tenders');
  
  // Sarkar Government Tenders state
  const [govtTenders, setGovtTenders] = useState<GovernmentAwardedTender[]>(SAMPLE_GOVT_TENDERS);
  const [sarkarSubBids, setSarkarSubBids] = useState<SarkarSubBid[]>(SAMPLE_SARKAR_SUB_BIDS);
  const [selectedTenderForSubBid, setSelectedTenderForSubBid] = useState<GovernmentAwardedTender | null>(null);

  // Sarkar Sub-Bid Form State
  const [subBidCategory, setSubBidCategory] = useState<string>('Paints & Wall Putty');
  const [subBidBrand, setSubBidBrand] = useState<string>('Asian Paints Royale / Birla Putty');
  const [subBidUnitPrice, setSubBidUnitPrice] = useState<number>(580);
  const [subBidTotalVal, setSubBidTotalVal] = useState<number>(1350000);
  const [subBidTimelineDays, setSubBidTimelineDays] = useState<number>(14);
  const [subBidRemarks, setSubBidRemarks] = useState<string>('Direct bulk distributor wholesale pricing with lab test certificates and staged site drop-off.');
  const [govtCategoryFilter, setGovtCategoryFilter] = useState<string>('All');

  // Construction Site Location & Radius State
  const [selectedProjectId, setSelectedProjectId] = useState<string>(SAMPLE_PROJECTS[0].id);
  const [sitePincode, setSitePincode] = useState<string>(SAMPLE_PROJECTS[0].pincode || '560001');
  const [siteCity, setSiteCity] = useState<string>(SAMPLE_PROJECTS[0].city || 'Bengaluru');
  const [siteGpsLat, setSiteGpsLat] = useState<number>(SAMPLE_PROJECTS[0].gpsLat || 12.9716);
  const [siteGpsLng, setSiteGpsLng] = useState<number>(SAMPLE_PROJECTS[0].gpsLng || 77.5946);
  const [siteAddress, setSiteAddress] = useState<string>(SAMPLE_PROJECTS[0].address || 'Prestige Whitefield Road, Ward 22, Bengaluru');

  // Radius & Filtering State
  const [maxRadiusKm, setMaxRadiusKm] = useState<number | 'all'>(50);
  const [pincodeFilter, setPincodeFilter] = useState<string>('');
  const [onlyCoveredPincode, setOnlyCoveredPincode] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'projects' | 'rate'>('distance');
  const [gpsDetecting, setGpsDetecting] = useState<boolean>(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<string | null>(null);

  // Directory state
  const [vendors, setVendors] = useState<Vendor[]>(SAMPLE_VENDORS);
  const [categoryFilter, setCategoryFilter] = useState<string>(defaultCategoryFilter || 'All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Bulk Upload Vendor Pincodes Modal State
  const [showBulkPincodeModal, setShowBulkPincodeModal] = useState<boolean>(false);
  const [selectedVendorForPincodes, setSelectedVendorForPincodes] = useState<string>(SAMPLE_VENDORS[0].id);
  const [bulkPincodesInput, setBulkPincodesInput] = useState<string>('560001, 560002, 560037, 560066, 560100, 562125');
  const [bulkMaxRadiusKm, setBulkMaxRadiusKm] = useState<number>(60);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);

  // Bulk Vendor Directory Actions State
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [showBulkWhatsappModal, setShowBulkWhatsappModal] = useState<boolean>(false);
  const [whatsappDraftMessage, setWhatsappDraftMessage] = useState<string>('');
  const [bulkActionSuccessMsg, setBulkActionSuccessMsg] = useState<string | null>(null);
  const [whatsappCopied, setWhatsappCopied] = useState<boolean>(false);

  // Bids & Contracts State
  const [bids, setBids] = useState<VendorBid[]>(SAMPLE_VENDOR_BIDS);
  const [contracts, setContracts] = useState<BindingContract[]>(SAMPLE_BINDING_CONTRACTS);
  const [showContractModal, setShowContractModal] = useState<boolean>(false);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState<string>(SAMPLE_PROJECTS[0]?.title || 'Prestige Whitefield Commercial Hub');
  const [selectedVendorName, setSelectedVendorName] = useState<string>('Jain STP Technologies');
  const [contractType, setContractType] = useState<string>('Turnkey Subcontract');
  const [agreedAmount, setAgreedAmount] = useState<number>(1850000);
  const [retentionPct, setRetentionPct] = useState<number>(5);
  const [advanceDeposit, setAdvanceDeposit] = useState<number>(185000);
  const [deadline, setDeadline] = useState<string>('2026-10-31');
  const [penaltyClause, setPenaltyClause] = useState<number>(1);
  const [activeCert, setActiveCert] = useState<BindingContract | null>(null);

  // Government Tender Sub-bidding Helpers
  const filteredGovtTenders = govtTenders.filter(t => {
    if (govtCategoryFilter === 'All') return true;
    return t.requiredMaterialsAndSubcontracts.some(req => req.category.toLowerCase().includes(govtCategoryFilter.toLowerCase()));
  });

  const handleOpenSubBidModal = (tender: GovernmentAwardedTender) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setSelectedTenderForSubBid(tender);
    if (tender.requiredMaterialsAndSubcontracts.length > 0) {
      setSubBidCategory(tender.requiredMaterialsAndSubcontracts[0].category);
      setSubBidTotalVal(tender.requiredMaterialsAndSubcontracts[0].targetEstimatedBudgetINR);
    }
  };

  const handleSubmitSarkarSubBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!selectedTenderForSubBid) return;

    const newSubBid: SarkarSubBid = {
      id: `SUB-BID-${Date.now().toString().slice(-4)}`,
      tenderId: selectedTenderForSubBid.id,
      primeContractorName: selectedTenderForSubBid.primeContractorName,
      subcontractorVendorName: currentUser.name || 'Vendor Profile',
      category: subBidCategory,
      quotedUnitPriceINR: subBidUnitPrice,
      totalQuotedINR: subBidTotalVal,
      deliveryDays: subBidTimelineDays,
      status: 'Submitted to L1 Prime',
      submittedAt: new Date().toISOString().split('T')[0],
      remarks: subBidRemarks
    };

    setSarkarSubBids([newSubBid, ...sarkarSubBids]);
    setSelectedTenderForSubBid(null);
    alert(`Sub-bid quote of ₹${subBidTotalVal.toLocaleString('en-IN')} submitted directly to Prime Contractor ${selectedTenderForSubBid.primeContractorName}!`);
  };

  const handleOpenBulkPincodeModal = (vendorId?: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const targetId = vendorId || selectedVendorForPincodes || (vendors[0] ? vendors[0].id : '');
    setSelectedVendorForPincodes(targetId);
    const v = vendors.find(item => item.id === targetId);
    if (v) {
      if (v.coveredPincodes && v.coveredPincodes.length > 0) {
        setBulkPincodesInput(v.coveredPincodes.join(', '));
      } else if (v.pincode) {
        setBulkPincodesInput(v.pincode);
      } else {
        setBulkPincodesInput('560001, 560002, 560037, 560066, 560100');
      }
      if (v.maxServiceRadiusKm) {
        setBulkMaxRadiusKm(v.maxServiceRadiusKm);
      }
    }
    setUploadedFileName(null);
    setBulkSuccessMsg(null);
    setShowBulkPincodeModal(true);
  };

  const handleFileUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const matched = text.match(/\b\d{6}\b/g);
          if (matched && matched.length > 0) {
            const uniquePincodes = Array.from(new Set(matched));
            setBulkPincodesInput(uniquePincodes.join(', '));
            setBulkSuccessMsg(`Loaded ${uniquePincodes.length} unique pincodes from file "${file.name}"`);
          } else {
            setBulkPincodesInput(text);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleAddPresetPincodes = (preset: string) => {
    const presets: Record<string, string> = {
      bengaluru: '560001, 560002, 560037, 560066, 560100, 562125, 560068, 560076',
      mumbai: '400001, 400053, 400069, 400093, 400072, 400018, 400028, 400050',
      delhi: '110001, 110002, 110020, 110092, 201301, 201304, 122001, 122002',
      purvanchal: '273001, 273002, 273015, 273209, 226001, 226010, 226016, 208001'
    };
    if (presets[preset]) {
      setBulkPincodesInput(prev => {
        if (!prev.trim()) return presets[preset];
        const combined = prev + ', ' + presets[preset];
        const matched = combined.match(/\b\d{6}\b/g);
        return matched ? Array.from(new Set(matched)).join(', ') : combined;
      });
    }
  };

  const handleSaveBulkPincodes = (e: React.FormEvent) => {
    e.preventDefault();
    const rawMatches = bulkPincodesInput.match(/\b\d{6}\b/g);
    const parsedPincodes = rawMatches ? Array.from(new Set(rawMatches)) : [];

    if (parsedPincodes.length === 0) {
      alert('Please enter or upload at least one valid 6-digit Indian pincode (e.g., 560001, 273001).');
      return;
    }

    setVendors(prevVendors =>
      prevVendors.map(v => {
        if (v.id === selectedVendorForPincodes) {
          return {
            ...v,
            coveredPincodes: parsedPincodes,
            maxServiceRadiusKm: Number(bulkMaxRadiusKm)
          };
        }
        return v;
      })
    );

    const targetVendor = vendors.find(v => v.id === selectedVendorForPincodes);
    const vendorName = targetVendor ? targetVendor.name : 'Vendor Profile';

    setBulkSuccessMsg(`✓ Successfully updated "${vendorName}" with ${parsedPincodes.length} serviceability pincodes & ${bulkMaxRadiusKm} km max radius!`);

    setTimeout(() => {
      setShowBulkPincodeModal(false);
      setBulkSuccessMsg(null);
    }, 1800);
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    if (projectId === 'custom') return;
    const prj = SAMPLE_PROJECTS.find(p => p.id === projectId);
    if (prj) {
      setSiteCity(prj.city);
      if (prj.pincode) setSitePincode(prj.pincode);
      if (prj.address) setSiteAddress(prj.address);
      if (prj.title) setSelectedProjectTitle(prj.title);
      if (prj.gpsLat && prj.gpsLng) {
        setSiteGpsLat(prj.gpsLat);
        setSiteGpsLng(prj.gpsLng);
      } else if (prj.pincode && CITY_PINCODE_COORDS[prj.pincode]) {
        setSiteGpsLat(CITY_PINCODE_COORDS[prj.pincode].lat);
        setSiteGpsLng(CITY_PINCODE_COORDS[prj.pincode].lng);
      }
    }
  };

  const handleSitePincodeChange = (pincodeVal: string) => {
    setSitePincode(pincodeVal);
    const cleaned = pincodeVal.trim();
    if (CITY_PINCODE_COORDS[cleaned]) {
      const info = CITY_PINCODE_COORDS[cleaned];
      setSiteCity(info.city);
      setSiteGpsLat(info.lat);
      setSiteGpsLng(info.lng);
      setSiteAddress(`Pincode ${info.pincode} Zone, ${info.city}`);
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatusMsg('Geolocation is not supported by your browser.');
      return;
    }
    setGpsDetecting(true);
    setGpsStatusMsg('Detecting live construction site GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Math.round(position.coords.latitude * 10000) / 10000;
        const lng = Math.round(position.coords.longitude * 10000) / 10000;
        setSiteGpsLat(lat);
        setSiteGpsLng(lng);
        setGpsDetecting(false);
        setGpsStatusMsg(`✓ GPS Acquired: ${lat}, ${lng}`);
        setTimeout(() => setGpsStatusMsg(null), 4000);
      },
      () => {
        setGpsDetecting(false);
        setGpsStatusMsg('GPS signal timeout or permission denied. Using standard project coordinates.');
        setTimeout(() => setGpsStatusMsg(null), 4000);
      },
      { timeout: 8000 }
    );
  };

  const getVendorDistanceKm = (vendor: Vendor): number => {
    let vLat = vendor.gpsLat;
    let vLng = vendor.gpsLng;
    if (vLat === undefined || vLng === undefined) {
      if (vendor.pincode && CITY_PINCODE_COORDS[vendor.pincode]) {
        vLat = CITY_PINCODE_COORDS[vendor.pincode].lat;
        vLng = CITY_PINCODE_COORDS[vendor.pincode].lng;
      } else {
        const cityMatch = Object.values(CITY_PINCODE_COORDS).find(
          c => c.city.toLowerCase() === vendor.city.toLowerCase()
        );
        if (cityMatch) {
          vLat = cityMatch.lat;
          vLng = cityMatch.lng;
        } else {
          vLat = 12.9716;
          vLng = 77.5946;
        }
      }
    }
    return calculateHaversineKm(siteGpsLat, siteGpsLng, vLat, vLng);
  };

  const processedVendors = vendors.map(v => {
    const distanceKm = getVendorDistanceKm(v);
    const coversSitePincode = (v.coveredPincodes && v.coveredPincodes.includes(sitePincode)) || v.pincode === sitePincode;
    const isWithinRadius = maxRadiusKm === 'all' || distanceKm <= maxRadiusKm;
    return {
      ...v,
      calculatedDistanceKm: distanceKm,
      coversSitePincode,
      isWithinRadius
    };
  });

  const filteredVendors = processedVendors.filter(v => {
    const matchesCategory = categoryFilter === 'All' || v.category === categoryFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery ||
      v.name.toLowerCase().includes(searchLower) || 
      v.specialization.toLowerCase().includes(searchLower) ||
      v.city.toLowerCase().includes(searchLower) ||
      (v.pincode && v.pincode.includes(searchLower)) ||
      (v.address && v.address.toLowerCase().includes(searchLower));

    const matchesPincodeFilter = 
      !pincodeFilter ||
      (v.pincode && v.pincode.includes(pincodeFilter.trim())) ||
      (v.coveredPincodes && v.coveredPincodes.some(p => p.includes(pincodeFilter.trim())));

    const matchesCoveredToggle = !onlyCoveredPincode || v.coversSitePincode;

    const matchesRadius = v.isWithinRadius;

    return matchesCategory && matchesSearch && matchesPincodeFilter && matchesCoveredToggle && matchesRadius;
  }).sort((a, b) => {
    if (sortBy === 'distance') {
      return a.calculatedDistanceKm - b.calculatedDistanceKm;
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    if (sortBy === 'projects') {
      return b.projectsCompleted - a.projectsCompleted;
    }
    if (sortBy === 'rate') {
      return a.hourlyOrBaseRateINR - b.hourlyOrBaseRateINR;
    }
    return 0;
  });

  // Bulk Vendor Handlers
  const handleToggleSelectVendor = (vendorId: string) => {
    setSelectedVendorIds(prev =>
      prev.includes(vendorId) ? prev.filter(id => id !== vendorId) : [...prev, vendorId]
    );
  };

  const handleSelectAllFilteredVendors = () => {
    const filteredIds = filteredVendors.map(v => v.id);
    const allSelected = filteredIds.length > 0 && filteredIds.every(id => selectedVendorIds.includes(id));
    if (allSelected) {
      setSelectedVendorIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedVendorIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const getTargetVendorsForBulk = () => {
    if (selectedVendorIds.length > 0) {
      return filteredVendors.filter(v => selectedVendorIds.includes(v.id));
    }
    return filteredVendors;
  };

  const handleExportSelectedCSV = () => {
    const targets = getTargetVendorsForBulk();

    if (targets.length === 0) {
      alert('No vendors selected or available in current filter to export.');
      return;
    }

    const headers = [
      'Vendor ID',
      'Name',
      'Category',
      'Specialization',
      'Rating',
      'Reviews Count',
      'GSTIN',
      'City',
      'Pincode',
      'Address',
      'Distance from Site (km)',
      'Base Rate (INR/day)',
      'Phone / WhatsApp',
      'Email'
    ];

    const csvRows = [
      headers.join(','),
      ...targets.map(v => [
        `"${v.id}"`,
        `"${v.name.replace(/"/g, '""')}"`,
        `"${v.category.replace(/"/g, '""')}"`,
        `"${v.specialization.replace(/"/g, '""')}"`,
        v.rating,
        v.reviewsCount,
        `"${v.verifiedGstin}"`,
        `"${v.city}"`,
        `"${v.pincode || ''}"`,
        `"${(v.address || '').replace(/"/g, '""')}"`,
        v.calculatedDistanceKm,
        v.hourlyOrBaseRateINR || '',
        `"${v.phone || '+91 9876543210'}"`,
        `"${v.email || 'vendor@bindinghub.com'}"`
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `verified_vendors_directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setBulkActionSuccessMsg(`✓ Successfully exported ${targets.length} vendor profiles to CSV!`);
    setTimeout(() => setBulkActionSuccessMsg(null), 4000);
  };

  const handleOpenBulkWhatsapp = () => {
    const targets = getTargetVendorsForBulk();
    if (targets.length === 0) {
      alert('Please select at least one vendor to send bulk WhatsApp message.');
      return;
    }

    const defaultMsg = `Namaste! We are reaching out regarding construction site project "${selectedProjectTitle}" in ${siteCity} (Pincode: ${sitePincode}).\n\nWe urgently require vendor rate bids for materials & subcontract services. Please confirm availability and share your latest price list. Thank you!`;
    setWhatsappDraftMessage(defaultMsg);
    setWhatsappCopied(false);
    setShowBulkWhatsappModal(true);
  };

  const handleCopyWhatsappBroadcast = () => {
    navigator.clipboard.writeText(whatsappDraftMessage);
    setWhatsappCopied(true);
    setTimeout(() => setWhatsappCopied(false), 3000);
  };

  const handleDispatchBulkRfp = () => {
    const targets = getTargetVendorsForBulk();
    if (targets.length === 0) {
      alert('Please select at least one vendor to dispatch bulk RFPs.');
      return;
    }

    setBulkActionSuccessMsg(`✓ Official RFP and Rate Quote request dispatched to ${targets.length} vendor profiles on 2Click Binding Hub!`);
    setTimeout(() => setBulkActionSuccessMsg(null), 4000);
  };

  const handleCreateBindingContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const matchedVendor = vendors.find(v => v.name === selectedVendorName);

    const newContract: BindingContract = {
      id: `BND-2026-${Math.floor(100 + Math.random() * 900)}`,
      contractNumber: `2CLICK-BIND-${Date.now().toString().slice(-5)}`,
      projectId: `PRJ-2026-00${contracts.length + 5}`,
      projectName: selectedProjectTitle,
      clientName: currentUser.name,
      vendorName: selectedVendorName,
      vendorGstin: matchedVendor ? matchedVendor.verifiedGstin : '29AAACA9988X1Z0',
      contractType,
      agreedAmountINR: Number(agreedAmount),
      retentionMoneyPct: Number(retentionPct),
      advanceDepositINR: Number(advanceDeposit),
      completionDeadline: deadline,
      bindingStatus: 'Binding Deposit Escrowed',
      signedDate: new Date().toISOString().split('T')[0],
      penaltyClausePerWeekPct: Number(penaltyClause),
      digitalSignatureHash: `0x${Math.random().toString(16).slice(2, 10)}...2click_verified_sha256`
    };

    setContracts([newContract, ...contracts]);
    setShowContractModal(false);
    setActiveTab('contracts');
    alert(`Binding Contract executed successfully! Advance deposit of ₹${Number(advanceDeposit).toLocaleString('en-IN')} held in 2click Escrow.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Verified Vendors &amp; Legally Binding E-Contracts</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Vendor Marketplace &amp; Binding Agreements Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Discover GST-verified contractors for ETP/STP Water Plants, Electrical/ELV, Civil Works, Solar and Interiors. Compare bids and execute legally binding contracts with escrow deposits &amp; SLA penalty clauses.
            </p>
          </div>

          <button
            onClick={() => {
              if (!currentUser) onOpenAuth();
              else setShowContractModal(true);
            }}
            className="px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition shrink-0"
          >
            <Lock className="w-4 h-4" />
            <span>Execute New Binding Agreement</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-bold overflow-x-auto pb-1">
        {[
          { id: 'sarkar_tenders', label: 'Sarkar Awarded Tenders B2B', icon: Landmark, count: govtTenders.length },
          { id: 'directory', label: 'Verified Vendors Directory', icon: Users, count: vendors.length },
          { id: 'bids', label: 'Vendor Bids & Tenders', icon: FileText, count: bids.length },
          { id: 'contracts', label: 'Binding Contracts & Escrow', icon: Lock, count: contracts.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 0: SARKAR AWARDED TENDERS B2B BIDDING SYSTEM */}
      {activeTab === 'sarkar_tenders' && (
        <div className="space-y-8">
          
          {/* Header & Filter Controls */}
          <div className="bg-white dark:bg-slate-800/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-700/80 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/20 mb-2">
                  <Landmark className="w-3.5 h-3.5 text-amber-500" />
                  <span>Government Awarded Tenders — B2B Procurement Hub</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Awarded Govt Infra &amp; PWD Tenders B2B Marketplace
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sub-contractors, Dukandars &amp; Material Suppliers can directly bid on awarded CPWD, State PWD, NHAI &amp; Smart City contracts.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 font-mono font-bold text-slate-700 dark:text-slate-200">
                  Total Active Govt Tenders: {govtTenders.length}
                </span>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1">
              <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>
              {[
                'All',
                'Paints & Wall Putty',
                'Cement & AAC Blocks',
                'TMT Steel Rebars',
                'Boundary Wall & Fencing',
                'SS & Glass Railings',
                'Kitchen & Bath',
                'Shop (Dukan) Renovation',
                'Office Renovation'
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setGovtCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
                    govtCategoryFilter === cat
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Govt Awarded Tenders Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredGovtTenders.map((tender) => (
              <div
                key={tender.id}
                className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col justify-between space-y-5 hover:border-amber-400 transition"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-extrabold text-[10px] border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                      <Landmark className="w-3 h-3" />
                      {tender.issuingAuthority}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                      {tender.tenderStatus}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 block">{tender.tenderNumber}</span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {tender.projectTitle}
                    </h3>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="text-[11px] text-slate-400">Awarded L1 Prime:</span>
                      <span className="font-bold text-right text-slate-900 dark:text-slate-100">{tender.primeContractorName}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="text-[11px] text-slate-400">GSTIN Verified:</span>
                      <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">{tender.primeContractorGstin}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-400">Awarded Contract Value:</span>
                      <span className="font-extrabold text-amber-600 dark:text-amber-400 font-mono">₹{(tender.awardedProjectValueINR / 10000000).toFixed(2)} Cr</span>
                    </div>
                  </div>

                  {/* Required Materials & Subcontracts Breakdown */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Required Materials &amp; Sub-contracts:
                    </span>
                    <div className="space-y-1.5">
                      {tender.requiredMaterialsAndSubcontracts.map((req, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{req.category}</span>
                            <span className="text-[10px] text-slate-500">{req.requiredQuantity} ({req.brandPreferred || 'Tier-1 Approved'})</span>
                          </div>
                          <span className="font-mono font-bold text-amber-700 dark:text-amber-300 text-[11px]">
                            ₹{(req.targetEstimatedBudgetINR / 100000).toFixed(1)} L
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400">
                    <span>Deadline: </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{tender.subBiddingDeadline}</span>
                  </div>
                  <button
                    onClick={() => handleOpenSubBidModal(tender)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit B2B Sub-Bid</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Active Submitted B2B Sub-Bids Table */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  Submitted B2B Sub-Bids &amp; Supplier Quotations
                </h3>
                <p className="text-xs text-slate-500">
                  Track quotations submitted by Dukandars, Suppliers &amp; Trade Specialists directly to Prime Contractors.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Tender Ref</th>
                    <th className="py-3 px-3">Bidding Vendor / Dukandar</th>
                    <th className="py-3 px-3">Offered Category &amp; Brand</th>
                    <th className="py-3 px-3">Quoted Total Value</th>
                    <th className="py-3 px-3">Delivery Days</th>
                    <th className="py-3 px-3">Bid Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sarkarSubBids.map((subBid) => (
                    <tr key={subBid.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 px-3 font-mono text-[11px] font-bold text-amber-600">
                        {subBid.tenderNumber}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 dark:text-white block">{subBid.biddingVendorName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">GSTIN: {subBid.biddingVendorGstin}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">{subBid.categoryOffered}</span>
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">{subBid.brandOffered}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-extrabold text-slate-900 dark:text-white">
                        ₹{subBid.quotedTotalValueINR.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-300">
                        {subBid.deliveryTimelineDays} Days
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          subBid.bidStatus === 'Shortlisted'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : subBid.bidStatus === 'Accepted'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {subBid.bidStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => alert(`Sub-Bid Remarks: ${subBid.remarks}\nQuoted Unit Price: ₹${subBid.quotedUnitPriceINR}\nSubmitted Date: ${subBid.bidDate}`)}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-[11px]"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SARKAR SUB-BID MODAL */}
      {selectedTenderForSubBid && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 fade-in text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px] mb-1">
                  <Landmark className="w-3 h-3" />
                  B2B Sub-Bid Submission
                </div>
                <h2 className="text-lg font-black">{selectedTenderForSubBid.projectTitle}</h2>
                <p className="text-xs text-slate-500">Prime Contractor: {selectedTenderForSubBid.primeContractorName}</p>
              </div>
              <button
                onClick={() => setSelectedTenderForSubBid(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSarkarSubBid} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Offered Sub-contract / Material Category
                  </label>
                  <select
                    value={subBidCategory}
                    onChange={(e) => setSubBidCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="Paints & Wall Putty">Paints &amp; Wall Putty (Asian Paints / Birla Putty)</option>
                    <option value="Cement & AAC Blocks">Cement &amp; AAC Blocks (UltraTech / Ambuja / Siporex)</option>
                    <option value="TMT Steel Rebars">TMT Steel Rebars (Tata Tiscon / JSW Neosteel)</option>
                    <option value="Bricks & Red Clay">Bricks &amp; Porotherm Clay Hollow Blocks</option>
                    <option value="Boundary Wall & Fencing">Boundary Wall &amp; Fencing (Precast RCC / Tata Wiron)</option>
                    <option value="SS & Glass Railings">SS &amp; Glass Railings (Jindal SS304 / Ozone)</option>
                    <option value="Kitchen & Bath Upgrades">Kitchen &amp; Bathroom Upgrades (Jaquar / Sleek)</option>
                    <option value="Custom Interiors & Panels">Custom Interiors &amp; Panels (CenturyPly / PVC Louvers)</option>
                    <option value="Shop (Dukan) Renovation">Shop (Dukan) Renovation (Glass Storefronts &amp; Signage)</option>
                    <option value="Office Renovation">Office Renovation (Acoustic Glass Partitions)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Brand &amp; Product Specification Offered
                  </label>
                  <input
                    type="text"
                    value={subBidBrand}
                    onChange={(e) => setSubBidBrand(e.target.value)}
                    placeholder="e.g. UltraTech OPC 53 / Asian Paints Royale"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Quoted Unit Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={subBidUnitPrice}
                    onChange={(e) => setSubBidUnitPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Package Value (₹)
                  </label>
                  <input
                    type="number"
                    value={subBidTotalVal}
                    onChange={(e) => setSubBidTotalVal(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-amber-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Supply Timeline (Days)
                  </label>
                  <input
                    type="number"
                    value={subBidTimelineDays}
                    onChange={(e) => setSubBidTimelineDays(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  B2B Supplier Remarks &amp; Compliance Certificates
                </label>
                <textarea
                  value={subBidRemarks}
                  onChange={(e) => setSubBidRemarks(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  placeholder="Mention test certificates, GSTIN invoice terms, delivery schedule, etc."
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                <p className="font-bold">✓ Direct B2B Verification Notice:</p>
                <p>Your quotation will be transmitted directly to L1 Prime Contractor ({selectedTenderForSubBid.primeContractorName}). Once shortlisted, a 2click binding escrow deposit contract can be established.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTenderForSubBid(null)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit B2B Quotation
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* TAB 1: VERIFIED VENDORS DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6">

          {/* Location & Radius Control Panel */}
          <div className="bg-white dark:bg-slate-800/95 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
            
            {/* Header: Construction Site Reference */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    Radius &amp; Site Location Filter
                    <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 text-[10px] font-extrabold">
                      GPS / Pincode
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Find suppliers, contractor shops and vendors near your active construction site
                  </p>
                </div>
              </div>

              {/* Site Project Dropdown & GPS Button */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs w-full sm:w-auto">
                  <Building className="w-4 h-4 text-slate-400" />
                  <select
                    value={selectedProjectId}
                    onChange={(e) => handleSelectProject(e.target.value)}
                    className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden text-xs cursor-pointer"
                  >
                    {SAMPLE_PROJECTS.map((prj) => (
                      <option key={prj.id} value={prj.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                        📍 {prj.title} ({prj.city} - {prj.pincode})
                      </option>
                    ))}
                    <option value="custom" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                      ⚙️ Custom Site Pincode / Location
                    </option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={gpsDetecting}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                  title="Detect GPS coordinates from device"
                >
                  <LocateFixed className={`w-3.5 h-3.5 ${gpsDetecting ? 'animate-spin text-teal-500' : 'text-teal-600'}`} />
                  {gpsDetecting ? 'Detecting...' : 'Detect Site GPS'}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenBulkPincodeModal()}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
                  title="Bulk upload or edit vendor serviceability area pincodes"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Bulk Upload Vendor Pincodes
                </button>
              </div>
            </div>

            {/* Site Inputs Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/80 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Site Pincode
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={sitePincode}
                    onChange={(e) => handleSitePincodeChange(e.target.value)}
                    maxLength={6}
                    placeholder="e.g. 560001"
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-extrabold text-slate-900 dark:text-white"
                  />
                  {CITY_PINCODE_COORDS[sitePincode] && (
                    <span className="absolute right-2 top-2 text-[10px] text-teal-600 font-bold">
                      ✓ Valid
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  City / Zone
                </label>
                <input
                  type="text"
                  value={siteCity}
                  onChange={(e) => setSiteCity(e.target.value)}
                  placeholder="e.g. Bengaluru"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Site GPS Coordinates
                </label>
                <div className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px] text-slate-700 dark:text-slate-300 font-bold truncate flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-teal-500 shrink-0" />
                  {siteGpsLat}, {siteGpsLng}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Sort Vendors By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="distance">📍 Nearest Distance First</option>
                  <option value="rating">⭐ Highest Rated Vendor</option>
                  <option value="projects">🏆 Most Projects Completed</option>
                  <option value="rate">💰 Lowest Hourly / Base Rate</option>
                </select>
              </div>
            </div>

            {gpsStatusMsg && (
              <div className="p-2 bg-teal-50 dark:bg-teal-950/60 rounded-xl text-xs text-teal-800 dark:text-teal-300 font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-teal-600" />
                {gpsStatusMsg}
              </div>
            )}

            {/* Radius Preset Buttons & Interactive Distance Slider */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
                  Max Search Radius from Site:
                  <span className="font-extrabold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800">
                    {maxRadiusKm === 'all' ? 'All Distances (Pan-India)' : `${maxRadiusKm} km`}
                  </span>
                </label>

                {/* Radius Pills */}
                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
                  {[10, 25, 50, 100, 250].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setMaxRadiusKm(r)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                        maxRadiusKm === r
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                    >
                      {r} km
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setMaxRadiusKm('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                      maxRadiusKm === 'all'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    All India
                  </button>
                </div>
              </div>

              {/* Range Slider */}
              {maxRadiusKm !== 'all' && (
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400">5 km</span>
                  <input
                    type="range"
                    min={5}
                    max={300}
                    step={5}
                    value={maxRadiusKm}
                    onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                    className="w-full accent-teal-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-slate-400">300 km</span>
                </div>
              )}

              {/* Filter Toggles Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={onlyCoveredPincode}
                    onChange={(e) => setOnlyCoveredPincode(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <span>Strictly show vendors covering site pincode ({sitePincode})</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">Specific Pincode Filter:</span>
                  <input
                    type="text"
                    value={pincodeFilter}
                    onChange={(e) => setPincodeFilter(e.target.value)}
                    placeholder="Search pincode..."
                    className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold w-28"
                  />
                </div>
              </div>

            </div>

          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendor, specialization, city, address..."
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium w-full sm:w-80"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {['All', 'ETP/STP Water', 'Electrical & ELV', 'Civil Contractor', 'Solar Rooftop', 'Interior Architecture'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Filtered Active Location Summary Bar */}
          <div className="p-3 bg-teal-500/10 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
            <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-bold">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                Site Anchor: <span className="underline">{siteAddress} ({siteCity} - Pincode {sitePincode})</span>
              </span>
            </div>
            <div className="px-3 py-1 bg-teal-600 text-white font-extrabold rounded-xl text-[11px] shadow-xs">
              Showing {filteredVendors.length} of {vendors.length} Vendors Within Radius
            </div>
          </div>

          {/* BULK ACTION TOOLBAR */}
          <div className="p-3.5 bg-slate-900 text-white dark:bg-slate-800/95 rounded-2xl border border-slate-700 shadow-md flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 text-xs">
            {/* Left: Select All & Count Badge */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAllFilteredVendors}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer"
              >
                {filteredVendors.length > 0 && filteredVendors.every(v => selectedVendorIds.includes(v.id)) ? (
                  <>
                    <CheckSquare className="w-4 h-4 text-teal-400" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 text-slate-400" />
                    <span>Select All ({filteredVendors.length})</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 rounded-lg font-mono text-xs border border-teal-500/30">
                  {selectedVendorIds.length} Selected
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  {selectedVendorIds.length === 0 ? '(Actions apply to all filtered vendors)' : '(Actions apply to checked vendors)'}
                </span>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* CSV Export Button */}
              <button
                type="button"
                onClick={handleExportSelectedCSV}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                title="Export selected vendor profiles with GSTIN, pincode & distance to CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              {/* Bulk WhatsApp Message Button */}
              <button
                type="button"
                onClick={handleOpenBulkWhatsapp}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                title="Send bulk WhatsApp message to selected vendors"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-white text-emerald-600" />
                <span>Bulk WhatsApp</span>
              </button>

              {/* Bulk RFP / Quote Dispatch Button */}
              <button
                type="button"
                onClick={handleDispatchBulkRfp}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                title="Request formal rate quote / bid from selected vendors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Request Bulk RFPs</span>
              </button>
            </div>
          </div>

          {/* Bulk Action Notification Toast */}
          {bulkActionSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 font-bold flex items-center gap-2 fade-in shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{bulkActionSuccessMsg}</span>
            </div>
          )}

          {/* Vendors Grid */}
          {filteredVendors.length === 0 ? (
            <div className="bg-white dark:bg-slate-800/90 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
              <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">No vendors found within this radius/pincode filter</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try expanding your search radius (e.g. to 100 km or All India) or clear specific category filters to view verified suppliers.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMaxRadiusKm('all');
                  setCategoryFilter('All');
                  setSearchQuery('');
                  setPincodeFilter('');
                  setOnlyCoveredPincode(false);
                }}
                className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl text-xs"
              >
                Reset Location Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredVendors.map((vendor) => {
                const isSelected = selectedVendorIds.includes(vendor.id);
                return (
                  <div
                    key={vendor.id}
                    className={`bg-white dark:bg-slate-800/90 p-6 rounded-2xl border transition shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md ${
                      isSelected
                        ? 'border-teal-500 ring-2 ring-teal-500/30 bg-teal-50/20 dark:bg-teal-950/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Header Selection & Badges */}
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Selection Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleToggleSelectVendor(vendor.id)}
                            className={`p-1.5 rounded-lg border flex items-center gap-1.5 transition cursor-pointer font-bold text-[11px] ${
                              isSelected
                                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-teal-500'
                            }`}
                            title={isSelected ? 'Deselect vendor' : 'Select vendor for bulk export/message'}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-3.5 h-3.5 text-white" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span>{isSelected ? 'Selected' : 'Select'}</span>
                          </button>

                          <span className="px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-[10px] border border-teal-200 dark:border-teal-800">
                            {vendor.category}
                          </span>

                        {/* Radius Distance Pill */}
                        <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] flex items-center gap-1 border ${
                          vendor.calculatedDistanceKm <= (typeof maxRadiusKm === 'number' ? maxRadiusKm : 999)
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}>
                          <Navigation className="w-3 h-3" />
                          {vendor.calculatedDistanceKm} km from site
                        </span>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-lg text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{vendor.rating} ({vendor.reviewsCount})</span>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-2.5">{vendor.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {vendor.specialization}
                    </p>

                    {/* Address & Pincode Coverage */}
                    <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1 text-xs">
                      <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>
                          {vendor.address || `${vendor.city} Industrial Hub`} ({vendor.pincode ? `Pincode ${vendor.pincode}` : vendor.city})
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[11px] pt-1 text-slate-500 dark:text-slate-400">
                        <span>Max Service Radius: <strong className="text-slate-800 dark:text-slate-200">{vendor.maxServiceRadiusKm || 50} km</strong></span>
                        {vendor.coversSitePincode ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Covers Site Pincode ({sitePincode})
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">Out-station Delivery</span>
                        )}
                      </div>

                      {/* Distance visual indicator */}
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${
                            vendor.calculatedDistanceKm <= 25 ? 'bg-emerald-500' :
                            vendor.calculatedDistanceKm <= 50 ? 'bg-teal-500' : 'bg-amber-500'
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(5, (vendor.calculatedDistanceKm / (vendor.maxServiceRadiusKm || 100)) * 100))}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>GSTIN Verification:</span>
                        <span className="font-mono font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                          {vendor.verifiedGstin}
                        </span>
                      </div>

                      {vendor.cpwdClassLicense && (
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>CPWD / License:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{vendor.cpwdClassLicense}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Projects Completed:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{vendor.projectsCompleted}+ Projects</span>
                      </div>

                      {vendor.hourlyOrBaseRateINR && (
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Base Contract Rate:</span>
                          <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400">₹{vendor.hourlyOrBaseRateINR.toLocaleString('en-IN')}/day</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-2">
                    <div className="text-xs">
                      <span className="text-slate-400">Base Location: </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{vendor.city}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenBulkPincodeModal(vendor.id)}
                        className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/80 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1 transition"
                        title="Upload or update serviceability area pincodes for this vendor"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-teal-600" />
                        <span className="hidden sm:inline">Pincodes ({vendor.coveredPincodes ? vendor.coveredPincodes.length : 1})</span>
                      </button>

                      <button
                        onClick={() => {
                          if (!currentUser) onOpenAuth();
                          else {
                            setSelectedVendorName(vendor.name);
                            setShowContractModal(true);
                          }
                        }}
                        className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                      >
                        <Lock className="w-3.5 h-3.5" /> Bind Contract
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: VENDOR BIDS & TENDERS */}
      {activeTab === 'bids' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {bids.map((bid) => (
              <div key={bid.id} className="bg-white dark:bg-slate-800/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{bid.id}</span>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{bid.projectName}</h3>
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-bold mt-0.5">Bidder: {bid.vendorName}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                      ₹{bid.bidAmountINR.toLocaleString('en-IN')}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                      {bid.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-bold">Scope &amp; Terms: </span>{bid.scopeNotes}
                </p>

                <div className="flex flex-wrap justify-between items-center text-xs text-slate-500 pt-2 gap-4">
                  <div className="flex gap-4">
                    <span>Delivery Time: <strong className="text-slate-800 dark:text-slate-200">{bid.deliveryDays} Days</strong></span>
                    <span>Warranty: <strong className="text-slate-800 dark:text-slate-200">{bid.warrantyYears} Years SLA</strong></span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProjectTitle(bid.projectName);
                      setSelectedVendorName(bid.vendorName);
                      setAgreedAmount(bid.bidAmountINR);
                      setAdvanceDeposit(Math.round(bid.bidAmountINR * 0.1));
                      setShowContractModal(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Lock className="w-3.5 h-3.5" /> Accept &amp; Create Binding Contract
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BINDING CONTRACTS & ESCROW */}
      {activeTab === 'contracts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {contracts.map((cnt) => (
              <div key={cnt.id} className="bg-white dark:bg-slate-800/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400">{cnt.contractNumber}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> {cnt.bindingStatus}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">{cnt.projectName}</h3>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-teal-600 dark:text-teal-400 font-mono">
                      ₹{cnt.agreedAmountINR.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400">Escrow Advance: ₹{cnt.advanceDepositINR.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-400">Client Signature</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{cnt.clientName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Bound Vendor (GSTIN)</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{cnt.vendorName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Completion Deadline</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{cnt.completionDeadline}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Delay Penalty Clause</div>
                    <div className="font-bold text-amber-600 dark:text-amber-400">{cnt.penaltyClausePerWeekPct}% per week</div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <div className="text-[10px] font-mono text-slate-400 truncate max-w-xs">
                    SHA256 Hash: {cnt.digitalSignatureHash}
                  </div>

                  <button
                    onClick={() => setActiveCert(cnt)}
                    className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-lg transition text-xs flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> View Binding Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW BINDING CONTRACT MODAL */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 fade-in">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-600" />
              Execute Legally Binding Vendor Agreement
            </h3>

            <form onSubmit={handleCreateBindingContract} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Project</label>
                <input
                  type="text"
                  required
                  value={selectedProjectTitle}
                  onChange={(e) => setSelectedProjectTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Selected Verified Vendor</label>
                <select
                  value={selectedVendorName}
                  onChange={(e) => setSelectedVendorName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.name}>{v.name} ({v.category})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Agreed Value (₹)</label>
                  <input
                    type="number"
                    value={agreedAmount}
                    onChange={(e) => setAgreedAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Advance Escrow Deposit (₹)</label>
                  <input
                    type="number"
                    value={advanceDeposit}
                    onChange={(e) => setAdvanceDeposit(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Completion Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Delay Penalty (%/Week)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={penaltyClause}
                    onChange={(e) => setPenaltyClause(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-[11px] text-teal-900 dark:text-teal-200 space-y-1">
                <div className="font-bold">E-Signature Binding Legal Term:</div>
                <p>By clicking execute, this contract is digitally signed and bound under the Indian Information Technology Act 2000 &amp; CPWD Escrow Norms.</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContractModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
                >
                  Sign &amp; Bind Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BINDING CERTIFICATE VIEW MODAL */}
      {activeCert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-8 shadow-2xl relative space-y-6 fade-in text-slate-900 dark:text-white">
            <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-2 font-bold shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-wider">2click.in Digital Binding Certificate</h2>
              <p className="text-xs text-slate-500">Contract Ref: {activeCert.contractNumber}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Project Title:</span>
                <span className="font-bold">{activeCert.projectName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Client Name:</span>
                <span className="font-bold">{activeCert.clientName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Bound Vendor (GSTIN):</span>
                <span className="font-bold">{activeCert.vendorName} ({activeCert.vendorGstin})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Total Agreed Contract Value:</span>
                <span className="font-extrabold text-teal-600 font-mono">₹{activeCert.agreedAmountINR.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Escrow Advance Deposit:</span>
                <span className="font-bold text-emerald-600 font-mono">₹{activeCert.advanceDepositINR.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Target Completion Date:</span>
                <span className="font-bold">{activeCert.completionDeadline}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">SLA Delay Penalty Clause:</span>
                <span className="font-bold text-amber-600">{activeCert.penaltyClausePerWeekPct}% penalty per week of delay</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl font-mono text-[10px] text-slate-500 break-all">
              Digital Signature Fingerprint: {activeCert.digitalSignatureHash}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setActiveCert(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert('Downloading official binding agreement PDF...');
                  setActiveCert(null);
                }}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download PDF Contract
              </button>
            </div>

          </div>
        </div>
      )}

      {/* BULK UPLOAD SERVICEABILITY AREA PINCODES MODAL */}
      {showBulkPincodeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 fade-in text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 border border-teal-200 dark:border-teal-800">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Bulk Upload Serviceability Area &amp; Pincodes
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Define serviceable pincodes and max operating radius for high-accuracy construction site search matching.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBulkPincodeModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bulkSuccessMsg && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{bulkSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveBulkPincodes} className="space-y-5 text-xs">
              
              {/* Select Vendor Profile */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Vendor Profile to Configure
                </label>
                <select
                  value={selectedVendorForPincodes}
                  onChange={(e) => {
                    const vId = e.target.value;
                    setSelectedVendorForPincodes(vId);
                    const v = vendors.find(item => item.id === vId);
                    if (v) {
                      setBulkPincodesInput(v.coveredPincodes?.join(', ') || v.pincode || '');
                      setBulkMaxRadiusKm(v.maxServiceRadiusKm || 60);
                    }
                  }}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-extrabold text-slate-900 dark:text-white text-xs cursor-pointer"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      🏢 {v.name} ({v.category} - {v.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Radius Slider */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Maximum Serviceability Radius (Distance from Vendor Dispatch Hub)
                  </label>
                  <span className="font-extrabold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2.5 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800 font-mono text-xs">
                    {bulkMaxRadiusKm} km
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={250}
                  step={5}
                  value={bulkMaxRadiusKm}
                  onChange={(e) => setBulkMaxRadiusKm(Number(e.target.value))}
                  className="w-full accent-teal-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>10 km (Hyperlocal)</span>
                  <span>50 km (City/District)</span>
                  <span>150 km (State Region)</span>
                  <span>250 km (Pan-State)</span>
                </div>
              </div>

              {/* CSV/TXT File Import Box */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Method 1: Upload Pincodes List File (.csv / .txt)
                </label>
                <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 rounded-2xl p-4 text-center transition bg-slate-50/50 dark:bg-slate-800/30">
                  <input
                    type="file"
                    accept=".csv, .txt, .json"
                    onChange={handleFileUploadSim}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                    <FileSpreadsheet className="w-7 h-7 text-teal-600" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {uploadedFileName ? `✓ File Selected: ${uploadedFileName}` : 'Drag & drop CSV or TXT file here, or click to browse'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Automatically detects 6-digit Indian Postal PIN codes from any document
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Regional Presets */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Method 2: Quick Metro/Regional Pincodes Preset Generators
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: 'bengaluru', label: '+ Bengaluru Metro' },
                    { key: 'mumbai', label: '+ Mumbai & Thane' },
                    { key: 'delhi', label: '+ Delhi NCR & Gurgaon' },
                    { key: 'purvanchal', label: '+ UP / Purvanchal Hubs' }
                  ].map(p => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => handleAddPresetPincodes(p.key)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-[11px] border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Area Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Method 3: Direct Pincodes Input (Comma or Space separated)
                  </label>
                  <span className="text-[11px] font-mono font-extrabold text-teal-600 dark:text-teal-400">
                    {bulkPincodesInput.match(/\b\d{6}\b/g)?.length || 0} Valid Pincodes Parsed
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={bulkPincodesInput}
                  onChange={(e) => setBulkPincodesInput(e.target.value)}
                  placeholder="Paste pincodes e.g. 560001, 560002, 560037, 560066, 560100, 273001..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs font-semibold text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              {/* Interactive Parsed Pincode Chips Preview */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Parsed Serviceability Pincodes Preview
                </label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 max-h-28 overflow-y-auto flex flex-wrap gap-1.5">
                  {(bulkPincodesInput.match(/\b\d{6}\b/g) || []).length === 0 ? (
                    <span className="text-slate-400 text-xs italic">No valid 6-digit pincodes found in input.</span>
                  ) : (
                    Array.from(new Set(bulkPincodesInput.match(/\b\d{6}\b/g) || [])).map(pin => (
                      <span
                        key={pin}
                        className="px-2 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 border border-teal-200 dark:border-teal-800"
                      >
                        {pin}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = bulkPincodesInput
                              .replace(new RegExp(`\\b${pin}\\b`, 'g'), '')
                              .replace(/,\s*,/g, ',')
                              .trim();
                            setBulkPincodesInput(updated);
                          }}
                          className="hover:text-red-500 font-extrabold ml-0.5 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBulkPincodeModal(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  Save &amp; Publish Serviceability Area
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* BULK WHATSAPP BROADCAST MODAL */}
      {showBulkWhatsappModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 fade-in text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                  <MessageSquare className="w-6 h-6 fill-emerald-600 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Bulk WhatsApp Broadcast &amp; RFPs
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Draft a material inquiry / rate request and connect with {getTargetVendorsForBulk().length} selected vendor profiles on WhatsApp.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBulkWhatsappModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Vendors Chips */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Target Recipients ({getTargetVendorsForBulk().length} Vendors):</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                  {selectedVendorIds.length > 0 ? 'Filtered Selection' : 'All Radius Vendors'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 max-h-32 overflow-y-auto flex flex-wrap gap-2">
                {getTargetVendorsForBulk().map(v => (
                  <div
                    key={v.id}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs flex items-center gap-2 shadow-xs"
                  >
                    <span className="font-bold text-slate-800 dark:text-slate-200">{v.name}</span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">({v.phone || '+91 9876543210'})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Draft Message Editor */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Broadcast Message Payload:
                </label>
                <button
                  type="button"
                  onClick={handleCopyWhatsappBroadcast}
                  className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {whatsappCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Payload</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                rows={5}
                value={whatsappDraftMessage}
                onChange={(e) => setWhatsappDraftMessage(e.target.value)}
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs leading-relaxed font-medium text-slate-900 dark:text-white"
              />
            </div>

            {/* Direct Individual WhatsApp Links List */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Direct WhatsApp Chat Launch Links:
              </label>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 max-h-40 overflow-y-auto">
                {getTargetVendorsForBulk().map(v => {
                  const phoneClean = (v.phone || '+91 9876543210').replace(/\D/g, '');
                  const waUrl = `https://api.whatsapp.com/send?phone=${phoneClean.startsWith('91') ? phoneClean : '91' + phoneClean}&text=${encodeURIComponent(whatsappDraftMessage)}`;
                  return (
                    <div
                      key={v.id}
                      className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center gap-2 text-xs"
                    >
                      <div className="truncate">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{v.name}</span>
                        <span className="text-[11px] text-slate-400 block">{v.category} • {v.city}</span>
                      </div>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1 shrink-0 transition"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Send WhatsApp</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setShowBulkWhatsappModal(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  setBulkActionSuccessMsg(`✓ WhatsApp broadcast payload dispatched to ${getTargetVendorsForBulk().length} vendors!`);
                  setShowBulkWhatsappModal(false);
                  setTimeout(() => setBulkActionSuccessMsg(null), 4000);
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Mark All Broadcast Sent</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
