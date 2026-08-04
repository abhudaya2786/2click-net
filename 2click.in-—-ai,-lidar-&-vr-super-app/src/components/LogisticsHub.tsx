import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  Calculator, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Package, 
  AlertCircle, 
  Search, 
  ChevronRight, 
  Sparkles, 
  Building2, 
  Scale, 
  Anchor, 
  Navigation, 
  ExternalLink, 
  Plus, 
  X, 
  Zap, 
  ArrowRight,
  Gauge,
  Share2,
  FileCheck,
  User,
  PhoneCall,
  Check,
  Download,
  Boxes,
  Compass,
  Gavel,
  TrendingDown,
  Award,
  DollarSign,
  Send,
  RefreshCw
} from 'lucide-react';
import { User as UserType } from '../types';

interface LogisticsHubProps {
  currentUser?: UserType | null;
  selectedCity: string;
  onOpenAuth?: () => void;
}

export interface VehicleFleetItem {
  id: string;
  transporterName: string;
  driverName: string;
  phone: string;
  vehicleType: string;
  vehicleCategory: 'tipper' | 'pickup' | 'heavy_trailer' | 'container';
  vehicleNumber: string;
  capacityTonnes: number;
  baseRatePerKm: number;
  minFare: number;
  district: string;
  rating: number;
  totalTrips: number;
  isAvailable: boolean;
  features: string[];
}

export interface FreightBidItem {
  id: string;
  transporterName: string;
  vehicleNumber: string;
  vehicleType: string;
  bidAmountINR: number;
  driverPhone: string;
  deliveryTimeHours: number;
  timestamp: string;
  isL1Winner?: boolean;
}

export interface FreightLoadTender {
  id: string;
  title: string;
  category: 'local' | 'under_state' | 'interstate';
  materialName: string;
  quantityStr: string;
  pickupLocation: string;
  deliveryLocation: string;
  distanceKm: number;
  maxTargetBudgetINR: number;
  postedBy: string;
  postedDate: string;
  expiryHours: number;
  status: 'open' | 'awarded' | 'closed';
  bids: FreightBidItem[];
}

const SAMPLE_FLEET: VehicleFleetItem[] = [
  {
    id: 'FLEET-01',
    transporterName: 'Ramesh Heavy Tipper & Cement Express',
    driverName: 'Ramesh Yadav',
    phone: '+91 98390 12345',
    vehicleType: '10-Wheeler Tipper (25 Tonne)',
    vehicleCategory: 'tipper',
    vehicleNumber: 'UP 53 ET 8912',
    capacityTonnes: 25,
    baseRatePerKm: 85,
    minFare: 2500,
    district: 'Gorakhpur',
    rating: 4.9,
    totalTrips: 420,
    isAvailable: true,
    features: ['Hydraulic Unloading', 'GPS Live Tracked', 'E-Way Bill Enabled', 'Weighbridge Certified']
  },
  {
    id: 'FLEET-02',
    transporterName: 'Azad Pickups & Dukandar Local Express',
    driverName: 'Mohd Azad',
    phone: '+91 94150 98765',
    vehicleType: 'Tata Ace (छोटा हाथी 750 KG)',
    vehicleCategory: 'pickup',
    vehicleNumber: 'UP 53 AT 3411',
    capacityTonnes: 0.75,
    baseRatePerKm: 25,
    minFare: 500,
    district: 'Gorakhpur',
    rating: 4.8,
    totalTrips: 890,
    isAvailable: true,
    features: ['2-Hour Express Delivery', 'Dukandar Special', 'Labor On-Demand', 'Cash on Delivery']
  },
  {
    id: 'FLEET-03',
    transporterName: 'Gupta Heavy Cranes & Low-Bed Trailers',
    driverName: 'Suresh Chandra Gupta',
    phone: '+91 99180 54321',
    vehicleType: 'Low-Bed Trailer (40 Tonne Heavy Duty)',
    vehicleCategory: 'heavy_trailer',
    vehicleNumber: 'UP 65 CT 9001',
    capacityTonnes: 40,
    baseRatePerKm: 160,
    minFare: 6500,
    district: 'Varanasi',
    rating: 5.0,
    totalTrips: 180,
    isAvailable: true,
    features: ['ODC Permit Clearance', 'JCB & Crane Transport', 'Hydraulic Rigging', 'Escort Guarded']
  },
  {
    id: 'FLEET-04',
    transporterName: 'Purvanchal Steel & Rebar Logistics',
    driverName: 'Virendra Singh',
    phone: '+91 97920 11223',
    vehicleType: '14-Wheeler Multi-Axle Truck (32 Tonne)',
    vehicleCategory: 'tipper',
    vehicleNumber: 'UP 53 BT 6789',
    capacityTonnes: 32,
    baseRatePerKm: 110,
    minFare: 3800,
    district: 'Gorakhpur',
    rating: 4.7,
    totalTrips: 310,
    isAvailable: true,
    features: ['Long Rebar Bed (40ft)', 'Transit Insurance', 'E-Way Bill Direct', 'Multi-Stop Drop']
  },
  {
    id: 'FLEET-05',
    transporterName: 'Shri Ram Container & Solar Express',
    driverName: 'Anil Kumar Sharma',
    phone: '+91 98890 33445',
    vehicleType: '22-ft Sealed Closed Container (12 Tonne)',
    vehicleCategory: 'container',
    vehicleNumber: 'UP 32 DT 4567',
    capacityTonnes: 12,
    baseRatePerKm: 55,
    minFare: 1800,
    district: 'Lucknow',
    rating: 4.9,
    totalTrips: 540,
    isAvailable: true,
    features: ['Weatherproof Sealed', 'Solar Panel Safe', 'Electrical Cable Reels', 'Digital POD Receipt']
  },
  {
    id: 'FLEET-06',
    transporterName: 'Maan Bolero Maxi Truck Services',
    driverName: 'Ranjeet Maan',
    phone: '+91 96210 77889',
    vehicleType: 'Mahindra Bolero Maxi Truck (1.5 Tonne)',
    vehicleCategory: 'pickup',
    vehicleNumber: 'UP 53 FT 1290',
    capacityTonnes: 1.5,
    baseRatePerKm: 32,
    minFare: 750,
    district: 'Gorakhpur',
    rating: 4.8,
    totalTrips: 670,
    isAvailable: true,
    features: ['Cement 30-Bags Spec', 'Site Direct Access', 'Quick Loading', 'Khata Payment']
  }
];

const INITIAL_LOAD_TENDERS: FreightLoadTender[] = [
  {
    id: 'LOAD-8801',
    title: '500 Bags UltraTech PPC Cement Dispatch',
    category: 'local',
    materialName: 'Cement Bags (50kg)',
    quantityStr: '500 Bags (25 MT)',
    pickupLocation: 'Gorakhpur Railway Siding Yard',
    deliveryLocation: 'Deoria Highway Project Site, Ward 4',
    distanceKm: 48,
    maxTargetBudgetINR: 6500,
    postedBy: 'Purvanchal Builders & Infra',
    postedDate: 'Today, 10:30 AM',
    expiryHours: 3,
    status: 'open',
    bids: [
      {
        id: 'BID-01',
        transporterName: 'Ramesh Heavy Tipper & Cement Express',
        vehicleNumber: 'UP 53 ET 8912',
        vehicleType: '10-Wheeler Tipper (25T)',
        bidAmountINR: 4800,
        driverPhone: '+91 98390 12345',
        deliveryTimeHours: 2,
        timestamp: '10:42 AM',
        isL1Winner: true
      },
      {
        id: 'BID-02',
        transporterName: 'Purvanchal Steel & Rebar Freight',
        vehicleNumber: 'UP 53 BT 6789',
        vehicleType: '14-Wheeler Multi-Axle (32T)',
        bidAmountINR: 5400,
        driverPhone: '+91 97920 11223',
        deliveryTimeHours: 2.5,
        timestamp: '10:35 AM'
      },
      {
        id: 'BID-03',
        transporterName: 'Maan Bolero Maxi Truck Services',
        vehicleNumber: 'UP 53 FT 1290',
        vehicleType: 'Bolero Maxi Truck (1.5T)',
        bidAmountINR: 6100,
        driverPhone: '+91 96210 77889',
        deliveryTimeHours: 3,
        timestamp: '10:31 AM'
      }
    ]
  },
  {
    id: 'LOAD-8802',
    title: '25 MT Tata Tiscon Fe550D Rebars (Under State)',
    category: 'under_state',
    materialName: 'TMT Rebar Steel Bundles',
    quantityStr: '25 Metric Tonne (40ft Length)',
    pickupLocation: 'Varanasi Industrial Freight Depot',
    deliveryLocation: 'Lucknow Gomti Nagar Extension Site',
    distanceKm: 310,
    maxTargetBudgetINR: 36000,
    postedBy: 'Shree Krishna Construction Pvt Ltd',
    postedDate: 'Today, 09:15 AM',
    expiryHours: 5,
    status: 'open',
    bids: [
      {
        id: 'BID-04',
        transporterName: 'Purvanchal Steel & Rebar Freight',
        vehicleNumber: 'UP 53 BT 6789',
        vehicleType: '14-Wheeler Multi-Axle (32T)',
        bidAmountINR: 29500,
        driverPhone: '+91 97920 11223',
        deliveryTimeHours: 8,
        timestamp: '09:45 AM',
        isL1Winner: true
      },
      {
        id: 'BID-05',
        transporterName: 'Gupta Heavy Cranes & Low-Bed Trailers',
        vehicleNumber: 'UP 65 CT 9001',
        vehicleType: 'Low-Bed Trailer (40T)',
        bidAmountINR: 32000,
        driverPhone: '+91 99180 54321',
        deliveryTimeHours: 9,
        timestamp: '09:30 AM'
      },
      {
        id: 'BID-06',
        transporterName: 'Shri Ram Container Express',
        vehicleNumber: 'UP 32 DT 4567',
        vehicleType: '22-ft Sealed Container (12T)',
        bidAmountINR: 34500,
        driverPhone: '+91 98890 33445',
        deliveryTimeHours: 10,
        timestamp: '09:20 AM'
      }
    ]
  },
  {
    id: 'LOAD-8803',
    title: 'JCB 3DX Excavator Machine Transport (Under State)',
    category: 'under_state',
    materialName: 'Heavy Machinery / ODC Equipment',
    quantityStr: '1 Unit JCB Excavator (8.5 Tonne)',
    pickupLocation: 'Kanpur Panki Heavy Industrial Yard',
    deliveryLocation: 'Prayagraj Naini Bridge Site',
    distanceKm: 215,
    maxTargetBudgetINR: 28000,
    postedBy: 'Ganga Expressway Infra Contract',
    postedDate: 'Yesterday, 04:00 PM',
    expiryHours: 8,
    status: 'open',
    bids: [
      {
        id: 'BID-07',
        transporterName: 'Gupta Heavy Cranes & Low-Bed Trailers',
        vehicleNumber: 'UP 65 CT 9001',
        vehicleType: 'Low-Bed Trailer (40T Heavy Duty)',
        bidAmountINR: 23500,
        driverPhone: '+91 99180 54321',
        deliveryTimeHours: 6,
        timestamp: '05:10 PM',
        isL1Winner: true
      },
      {
        id: 'BID-08',
        transporterName: 'Purvanchal Steel Freight',
        vehicleNumber: 'UP 53 BT 6789',
        vehicleType: '14-Wheeler Trailer (32T)',
        bidAmountINR: 26000,
        driverPhone: '+91 97920 11223',
        deliveryTimeHours: 7,
        timestamp: '04:30 PM'
      }
    ]
  },
  {
    id: 'LOAD-8804',
    title: '1,200 Sq.Ft Vitrified Tiles Pallets (Inter-State)',
    category: 'interstate',
    materialName: 'Vitrified Tiles (2x2 ft)',
    quantityStr: '12 Pallets (18 Tonne)',
    pickupLocation: 'Morbi Factory Yard, Gujarat',
    deliveryLocation: 'Gorakhpur Central Material Depot',
    distanceKm: 1150,
    maxTargetBudgetINR: 68000,
    postedBy: 'Purvanchal Tiles & Granite Wholesaler',
    postedDate: 'Yesterday, 02:00 PM',
    expiryHours: 12,
    status: 'open',
    bids: [
      {
        id: 'BID-09',
        transporterName: 'Shri Ram Container & Solar Express',
        vehicleNumber: 'UP 32 DT 4567',
        vehicleType: '22-ft Closed Container (12T)',
        bidAmountINR: 54000,
        driverPhone: '+91 98890 33445',
        deliveryTimeHours: 36,
        timestamp: '03:15 PM',
        isL1Winner: true
      },
      {
        id: 'BID-10',
        transporterName: 'Gujarat UP National Highway Carriers',
        vehicleNumber: 'GJ 03 XY 7711',
        vehicleType: '32-ft Multi-Axle Container (20T)',
        bidAmountINR: 59000,
        driverPhone: '+91 94260 88990',
        deliveryTimeHours: 32,
        timestamp: '02:40 PM'
      }
    ]
  }
];

export const LogisticsHub: React.FC<LogisticsHubProps> = ({
  currentUser,
  selectedCity,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<'workflow_guide' | 'calculator' | 'bidding' | 'fleet' | 'live_tracking'>('bidding');
  const [selectedLogisticsType, setSelectedLogisticsType] = useState<'bulk' | 'express' | 'heavy' | 'interdistrict'>('bulk');
  const [selectedFleetFilter, setSelectedFleetFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Local vs Under-State Calculator Scope State
  const [routeCategory, setRouteCategory] = useState<'local' | 'under_state' | 'interstate'>('local');
  const [calcMaterial, setCalcMaterial] = useState<'cement' | 'steel' | 'bricks' | 'sand' | 'hardware' | 'machinery'>('cement');
  const [calcDistance, setCalcDistance] = useState<number>(35);
  const [calcWeightTonnes, setCalcWeightTonnes] = useState<number>(15);
  const [calcVehicleType, setCalcVehicleType] = useState<string>('tipper_10w');
  const [incLabor, setIncLabor] = useState<boolean>(true);
  const [incWeighbridge, setIncWeighbridge] = useState<boolean>(true);
  const [incInsurance, setIncInsurance] = useState<boolean>(false);
  const [incTollTax, setIncTollTax] = useState<boolean>(true);

  // Price Bidding System State
  const [loadTenders, setLoadTenders] = useState<FreightLoadTender[]>(INITIAL_LOAD_TENDERS);
  const [biddingCategoryFilter, setBiddingCategoryFilter] = useState<string>('all');
  const [bidModalTender, setBidModalTender] = useState<FreightLoadTender | null>(null);
  
  // Transporter New Bid Form
  const [newBidTransporter, setNewBidTransporter] = useState<string>('');
  const [newBidVehicleNum, setNewBidVehicleNum] = useState<string>('');
  const [newBidVehicleType, setNewBidVehicleType] = useState<string>('10-Wheeler Tipper (25T)');
  const [newBidAmount, setNewBidAmount] = useState<number>(0);
  const [newBidPhone, setNewBidPhone] = useState<string>('');
  const [newBidDeliveryHours, setNewBidDeliveryHours] = useState<number>(4);
  const [bidSuccessToast, setBidSuccessToast] = useState<boolean>(false);

  // Post New Load Modal State
  const [showPostLoadModal, setShowPostLoadModal] = useState<boolean>(false);
  const [postLoadTitle, setPostLoadTitle] = useState<string>('');
  const [postLoadCategory, setPostLoadCategory] = useState<'local' | 'under_state' | 'interstate'>('local');
  const [postLoadMaterial, setPostLoadMaterial] = useState<string>('Cement Bags');
  const [postLoadQty, setPostLoadQty] = useState<string>('500 Bags (25 MT)');
  const [postLoadPickup, setPostLoadPickup] = useState<string>(`${selectedCity} Mandi Yard`);
  const [postLoadDelivery, setPostLoadDelivery] = useState<string>('Site Address, Ward 12');
  const [postLoadDist, setPostLoadDist] = useState<number>(45);
  const [postLoadTargetBudget, setPostLoadTargetBudget] = useState<number>(7000);

  // Booking Modal State
  const [bookingModalVehicle, setBookingModalVehicle] = useState<VehicleFleetItem | null>(null);
  const [bookingPickupAddr, setBookingPickupAddr] = useState<string>('Ramesh Hardware & Cement Mart, Ward 12');
  const [bookingDropAddr, setBookingDropAddr] = useState<string>('Site Project #402, Civil Lines Road');
  const [bookingMaterialDesc, setBookingMaterialDesc] = useState<string>('500 Bags Ultratech PPC Cement');
  const [bookingSuccessToast, setBookingSuccessToast] = useState<boolean>(false);

  // Transporter Register Modal State
  const [showRegModal, setShowRegModal] = useState<boolean>(false);
  const [regFirmName, setRegFirmName] = useState<string>('');
  const [regDriverName, setRegDriverName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regVehicleNum, setRegVehicleNum] = useState<string>('');
  const [regVehicleType, setRegVehicleType] = useState<string>('Tata Ace (0.75 Tonne)');

  // Freight Calculation Logic (Local & Under-State)
  const calculateFreight = () => {
    let ratePerKm = 50;
    let minFare = 1000;
    let laborCost = incLabor ? 800 : 0;
    let weighbridgeFee = incWeighbridge ? 150 : 0;
    let insuranceFee = incInsurance ? 350 : 0;

    if (calcVehicleType === 'tata_ace') {
      ratePerKm = 25;
      minFare = 500;
    } else if (calcVehicleType === 'bolero_pickup') {
      ratePerKm = 35;
      minFare = 750;
    } else if (calcVehicleType === 'tipper_6w') {
      ratePerKm = 60;
      minFare = 1800;
    } else if (calcVehicleType === 'tipper_10w') {
      ratePerKm = 85;
      minFare = 2500;
    } else if (calcVehicleType === 'trailer_heavy') {
      ratePerKm = 160;
      minFare = 6500;
    }

    // Route Category Multipliers
    let routeMultiplier = 1.0;
    let tollTaxEstimate = 0;
    let statePermitFee = 0;
    let nightBhatta = 0;

    if (routeCategory === 'local') {
      routeMultiplier = 1.0;
      tollTaxEstimate = incTollTax ? 120 : 0;
    } else if (routeCategory === 'under_state') {
      routeMultiplier = 1.10; // State highway fuel/traffic factor
      tollTaxEstimate = incTollTax ? Math.round(calcDistance * 4.2) : 0; // ~₹4.2 per km toll
      statePermitFee = 350; // Intra-state RTO pass
      nightBhatta = calcDistance > 180 ? 500 : 0;
    } else if (routeCategory === 'interstate') {
      routeMultiplier = 1.25; // All India National Highway
      tollTaxEstimate = incTollTax ? Math.round(calcDistance * 5.8) : 0; // National toll
      statePermitFee = 1500; // Border entry fee
      nightBhatta = 1000;
    }

    const calculatedBase = calcDistance * ratePerKm * routeMultiplier;
    const baseFreight = Math.max(calculatedBase, minFare);
    const totalFreight = Math.round(baseFreight + laborCost + weighbridgeFee + insuranceFee + tollTaxEstimate + statePermitFee + nightBhatta);

    const avgSpeed = routeCategory === 'local' ? 25 : routeCategory === 'under_state' ? 50 : 65;
    const approxMins = Math.round((calcDistance / avgSpeed) * 60 + 45); // travel + loading
    const hours = Math.floor(approxMins / 60);
    const mins = approxMins % 60;
    const timeStr = hours > 0 ? `${hours} hr ${mins} mins` : `${mins} mins`;

    return {
      baseFreight: Math.round(baseFreight),
      laborCost,
      weighbridgeFee,
      insuranceFee,
      tollTaxEstimate,
      statePermitFee,
      nightBhatta,
      totalFreight,
      ratePerKm,
      timeStr
    };
  };

  const calcResult = calculateFreight();

  // Handle Transporter Submitting a Lower Bid in Reverse Auction
  const handlePlaceBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidModalTender) return;

    const newBidObj: FreightBidItem = {
      id: `BID-${Date.now().toString().slice(-4)}`,
      transporterName: newBidTransporter || 'Gupta Local Freight Transport',
      vehicleNumber: newBidVehicleNum || 'UP 53 ET 9988',
      vehicleType: newBidVehicleType,
      bidAmountINR: Number(newBidAmount),
      driverPhone: newBidPhone || '+91 98390 00000',
      deliveryTimeHours: Number(newBidDeliveryHours),
      timestamp: 'Just Now'
    };

    const updatedTenders = loadTenders.map(tender => {
      if (tender.id === bidModalTender.id) {
        const allBids = [...tender.bids, newBidObj];
        // Re-calculate L1 Winner (lowest bid amount)
        const sortedBids = allBids.sort((a, b) => a.bidAmountINR - b.bidAmountINR);
        const markedBids = sortedBids.map((b, index) => ({
          ...b,
          isL1Winner: index === 0
        }));
        return {
          ...tender,
          bids: markedBids
        };
      }
      return tender;
    });

    setLoadTenders(updatedTenders);
    setBidSuccessToast(true);
    setTimeout(() => {
      setBidSuccessToast(false);
      setBidModalTender(null);
    }, 1800);
  };

  // Handle Contractor Posting a New Load for Reverse Auction
  const handlePostLoadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTenderObj: FreightLoadTender = {
      id: `LOAD-${Math.floor(1000 + Math.random() * 9000)}`,
      title: postLoadTitle || `${postLoadMaterial} (${postLoadQty})`,
      category: postLoadCategory,
      materialName: postLoadMaterial,
      quantityStr: postLoadQty,
      pickupLocation: postLoadPickup,
      deliveryLocation: postLoadDelivery,
      distanceKm: Number(postLoadDist),
      maxTargetBudgetINR: Number(postLoadTargetBudget),
      postedBy: currentUser?.name || 'Local Builder',
      postedDate: 'Just Now',
      expiryHours: 6,
      status: 'open',
      bids: []
    };

    setLoadTenders([newTenderObj, ...loadTenders]);
    setShowPostLoadModal(false);
    alert('आपका माल लोड सफलतापूर्वक पोस्ट हो गया है! अब ट्रांसपोर्टर इस पर बोली (Bid) लगाएंगे।');
  };

  const filteredFleet = SAMPLE_FLEET.filter(item => {
    const matchesCategory = selectedFleetFilter === 'all' || item.vehicleCategory === selectedFleetFilter;
    const matchesSearch = item.transporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredTenders = loadTenders.filter(tender => {
    if (biddingCategoryFilter === 'all') return true;
    return tender.category === biddingCategoryFilter;
  });

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccessToast(true);
    setTimeout(() => {
      setBookingSuccessToast(false);
      setBookingModalVehicle(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* 1. TOP HEADER & DISTRICT METRICS BANNER */}
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-teal-400" />
                2CLICK Logistics &amp; Transport Hub
              </span>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-black uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                District: {selectedCity} Fleet Network
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              निर्माण सामग्री लॉजिस्टिक्स एवं 2-घंटे लोकल एक्सप्रेस ट्रांसपोर्ट
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              भारी सीमेंट टिपर्स, सरिया ट्रेलर्स, क्रेन ओडीसी, एवं दुकानदार पिकअप डिलीवरी। धर्म कांटा पर्ची सत्यापन, ई-वे बिल जनरेशन एवं लाइव जीपीएस ट्रैकिंग।
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowRegModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-black rounded-xl text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>अपनी गाड़ी नेटवर्क में जोड़ें (Attach Vehicle)</span>
              </button>

              <button
                onClick={() => setActiveTab('calculator')}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs border border-white/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>भाड़ा रेट कैलकुलेट करें</span>
              </button>
            </div>
          </div>

          {/* District Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 shrink-0 lg:w-80">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <span className="text-[10px] text-teal-300 font-extrabold uppercase tracking-wider block">Active Fleet</span>
              <span className="text-2xl font-black text-white mt-1 block">64+ Trucks</span>
              <span className="text-[10px] text-slate-300 font-semibold">Tippers &amp; Tata Ace</span>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider block">Avg Dispatch</span>
              <span className="text-2xl font-black text-amber-300 mt-1 block">22 Mins</span>
              <span className="text-[10px] text-slate-300 font-semibold">Express Delivery</span>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <span className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider block">E-Way Bills</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">Auto-Sync</span>
              <span className="text-[10px] text-slate-300 font-semibold">GST Compliant</span>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <span className="text-[10px] text-purple-300 font-extrabold uppercase tracking-wider block">Weighbridge</span>
              <span className="text-2xl font-black text-purple-300 mt-1 block">100% Valid</span>
              <span className="text-[10px] text-slate-300 font-semibold">धर्म कांटा पर्ची</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION SUB-TABS */}
      <div className="max-w-7xl mx-auto flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('bidding')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 ${
              activeTab === 'bidding'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Gavel className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>लाइव भाड़ा बिडिंग (Price Bidding &amp; Tenders)</span>
            <span className="px-1.5 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-black rounded-full border border-amber-400/30">L1 LIVE</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 ${
              activeTab === 'calculator'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>लोकल एवं स्टेट माल भाड़ा कैलकुलेटर</span>
          </button>

          <button
            onClick={() => setActiveTab('workflow_guide')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 ${
              activeTab === 'workflow_guide'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>लॉजिस्टिक्स के प्रकार (How it Works)</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 ${
              activeTab === 'fleet'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>उपलब्ध गाड़ियां (Fleet Directory)</span>
          </button>

          <button
            onClick={() => setActiveTab('live_tracking')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 ${
              activeTab === 'live_tracking'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span>लाइव शिपमेंट ट्रैकिंग &amp; धर्म कांटा पर्ची</span>
          </button>
        </div>
      </div>

      {/* TAB 0: LIVE REVERSE AUCTION PRICE BIDDING SYSTEM */}
      {activeTab === 'bidding' && (
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Hero Banner for Bidding System */}
          <div className="p-8 bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-3xl border border-amber-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-400/30 text-xs font-black">
                <Gavel className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>लाइव ट्रांसपोर्टर रिवर्स ऑक्शन (Live Reverse Bidding)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                लोड पोस्ट करें एवं पाएं <span className="text-amber-400">सबसे कम भाड़ा (L1 Winner Rates)</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                कांट्रेक्टर एवं व्यापारी अपने सीमेंट, सरिया, ब्रिक्स एवं मशीनरी का लोड पोस्ट करें। क्षेत्र के सत्यापित ट्रांसपोर्टर आपके लोड पर लाइव बोली लगाते हैं — आप सबसे कम रेट (L1 Bid) तुरंत स्वीकार कर गाड़ी बुक कर सकते हैं!
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setShowPostLoadModal(true)}
                  className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-slate-950" />
                  <span>➕ नया माल लोड पोस्ट करें (Post Load Tender)</span>
                </button>

                <div className="px-3 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-[11px] font-bold text-amber-300 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <span>औसत 18-25% भाड़ा बचत (Direct Savings)</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Widget */}
            <div className="grid grid-cols-2 gap-3 shrink-0 w-full md:w-auto relative z-10">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-300 uppercase font-black block">Active Tenders</span>
                <span className="text-2xl font-black text-amber-400">{loadTenders.length} Loads</span>
                <span className="text-[10px] text-emerald-400 font-bold block">Open for Bids</span>
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-300 uppercase font-black block">Transporters Live</span>
                <span className="text-2xl font-black text-emerald-400">140+ Drivers</span>
                <span className="text-[10px] text-slate-300 font-bold block">Local &amp; State</span>
              </div>
            </div>
          </div>

          {/* Filter Bar for Tenders */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider shrink-0 pr-2">फ़िल्टर श्रेणी:</span>
              <button
                onClick={() => setBiddingCategoryFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition shrink-0 ${
                  biddingCategoryFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                सभी लोड ({loadTenders.length})
              </button>
              <button
                onClick={() => setBiddingCategoryFilter('local')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition shrink-0 ${
                  biddingCategoryFilter === 'local'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                📍 Local (0-50 km)
              </button>
              <button
                onClick={() => setBiddingCategoryFilter('under_state')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition shrink-0 ${
                  biddingCategoryFilter === 'under_state'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                🛣️ Under State (50-500 km)
              </button>
              <button
                onClick={() => setBiddingCategoryFilter('interstate')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition shrink-0 ${
                  biddingCategoryFilter === 'interstate'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                🚛 Inter-State (500+ km)
              </button>
            </div>

            <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5 shrink-0">
              <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              <span>लाइव रेट अपडेट सक्रिय (Live Bidding active)</span>
            </div>
          </div>

          {/* ACTIVE REVERSE AUCTION LOAD TENDERS LIST */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTenders.map(tender => {
              const l1Bid = tender.bids.find(b => b.isL1Winner) || tender.bids[0];
              const savingsAmount = l1Bid ? Math.max(0, tender.maxTargetBudgetINR - l1Bid.bidAmountINR) : 0;

              return (
                <div key={tender.id} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 relative overflow-hidden flex flex-col justify-between">
                  
                  <div className="space-y-4">
                    {/* Header Pill & Title */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-md uppercase tracking-wider ${
                            tender.category === 'local'
                              ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300'
                              : tender.category === 'under_state'
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300'
                              : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300'
                          }`}>
                            {tender.category === 'local' ? '📍 Local Freight (0-50 km)' : tender.category === 'under_state' ? '🛣️ Under State (Intra-State)' : '🚛 Inter-State Highway'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono font-bold">{tender.id}</span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                          {tender.title}
                        </h3>
                      </div>

                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-black rounded-xl shrink-0">
                        ⏳ {tender.expiryHours}h Expiry
                      </span>
                    </div>

                    {/* Pickup & Delivery Route Details */}
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                      <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                        <span className="font-bold text-slate-400">सामग्री &amp; मात्रा:</span>
                        <span className="font-black text-slate-900 dark:text-white">{tender.quantityStr}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">पिकअप:</span>
                        <span className="truncate">{tender.pickupLocation}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Navigation className="w-4 h-4 text-teal-500 shrink-0" />
                        <span className="font-bold text-teal-600 dark:text-teal-400">डिलीवरी साइट:</span>
                        <span className="truncate">{tender.deliveryLocation} ({tender.distanceKm} km)</span>
                      </div>
                    </div>

                    {/* Target Budget vs L1 Lowest Bid Comparison */}
                    <div className="grid grid-cols-2 gap-3 p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-500/30">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-black block">मैक्स बजट (Target Budget)</span>
                        <span className="text-lg font-black text-slate-300">₹{tender.maxTargetBudgetINR.toLocaleString('en-IN')}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-amber-300 uppercase font-black block flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          L1 Lowest Bid (न्यूनतम भाड़ा)
                        </span>
                        {l1Bid ? (
                          <div className="space-y-0.5">
                            <span className="text-xl font-black text-emerald-400">₹{l1Bid.bidAmountINR.toLocaleString('en-IN')}</span>
                            {savingsAmount > 0 && (
                              <span className="text-[10px] text-emerald-300 font-bold block">
                                (₹{savingsAmount.toLocaleString('en-IN')} बचत!)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-amber-200 font-bold">कोई बोली नहीं आई (Be First!)</span>
                        )}
                      </div>
                    </div>

                    {/* Live Bids History List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-700 dark:text-slate-300">
                          प्राप्त बोलियां (Live Transporter Bids): ({tender.bids.length})
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">L1 सबसे कम रेट ऊपर है</span>
                      </div>

                      <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                        {tender.bids.map((bid) => (
                          <div
                            key={bid.id}
                            className={`p-3 rounded-xl border text-xs transition flex items-center justify-between gap-3 ${
                              bid.isL1Winner
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100'
                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 dark:text-white">{bid.transporterName}</span>
                                {bid.isL1Winner && (
                                  <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-black rounded-md">
                                    L1 WINNER
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span>🚛 {bid.vehicleNumber} ({bid.vehicleType})</span>
                                <span>⏱️ {bid.deliveryTimeHours} hours delivery</span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-base font-black text-slate-900 dark:text-white block">
                                ₹{bid.bidAmountINR.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] text-slate-400">{bid.timestamp}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Place Bid or Accept L1 Contract */}
                  <div className="pt-2 grid grid-cols-2 gap-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setBidModalTender(tender);
                        setNewBidAmount(l1Bid ? l1Bid.bidAmountINR - 200 : tender.maxTargetBudgetINR - 500);
                      }}
                      className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Gavel className="w-4 h-4 text-slate-950" />
                      <span>अपनी बिड (कम रेट) लगाएं</span>
                    </button>

                    <button
                      onClick={() => {
                        const l1Winner = l1Bid || tender.bids[0];
                        const msg = `*2CLICK LOGISTICS TRANSPORT CONTRACT*\n\n*Tender:* ${tender.title}\n*Pickup:* ${tender.pickupLocation}\n*Delivery:* ${tender.deliveryLocation}\n\n*Accepted L1 Bid:* ₹${l1Winner ? l1Winner.bidAmountINR : tender.maxTargetBudgetINR}\n*Transporter:* ${l1Winner ? l1Winner.transporterName : 'Pending'}\n*Vehicle:* ${l1Winner ? l1Winner.vehicleNumber : 'Tipper'}\n*Contact:* ${l1Winner ? l1Winner.driverPhone : ''}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>L1 बिड स्वीकार करें &amp; WhatsApp</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 1: LOGISTICS TYPES & WORKFLOW GUIDE ("कैसा काम करेगा?") */}
      {activeTab === 'workflow_guide' && (
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header Title */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-black rounded-md uppercase tracking-wider">
              Complete Logistics Architecture
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              2CLICK पर उपलब्ध 4 मुख्य लॉजिस्टिक्स मॉडल एवं उनकी कार्यप्रणाली
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              प्रत्येक प्रकार की सामग्री (सीमेंट, सरिया, गिट्टी, इलेक्ट्रिक केबल, जेसीबी, नल-पाइप) के लिए विशेष वाहन एवं ट्रैकिंग व्यवस्था
            </p>
          </div>

          {/* Logistics Types Interactive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* TYPE 1: HEAVY BULK MATERIAL FREIGHT */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 relative overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/20 text-amber-500 rounded-2xl border border-amber-400/30">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
                      Type 1: Heavy Bulk Freight
                    </span>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      भारी निर्माण सामग्री लॉजिस्टिक्स (टिपर्स व डंपर)
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black rounded-lg border border-amber-300">
                  10 - 40 Tonne
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white">📦 उपयुक्त सामग्री (Scope):</div>
                <p>सीमेंट (500-2000 बैग्स), TMT सरिया (10-40 टन), ईंटें (5,000-20,000 नग), मोरंग/बालू, एवं गिट्टी एग्रीगेट।</p>
                <div className="font-bold text-slate-900 dark:text-white pt-1">🚚 वाहन (Vehicles):</div>
                <p>6-व्हीलर टिपर्स (10T), 10-व्हीलर टिपर्स (25T), 14-व्हीलर मल्टि-एक्सल ट्रेलर्स (40T)।</p>
              </div>

              {/* Step By Step Workflow */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  कार्यप्रणाली चरण (Step-by-Step Workflow):
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">1</span>
                    <span>साइट या दुकानदार द्वारा बुकिंग</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">2</span>
                    <span>प्लांट/क्वारी में लोडिंग</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">3</span>
                    <span>धर्म कांटा (Weigh Slip) अपलोड</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">4</span>
                    <span>E-Way Bill &amp; OTP डिलीवरी</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TYPE 2: LOCAL DUKANDAR EXPRESS DELIVERY */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 relative overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-500/20 text-teal-500 rounded-2xl border border-teal-400/30">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400">
                      Type 2: Local Dukandar Express
                    </span>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      लोकल दुकानदार एवं साइट 2-घंटे एक्सप्रेस डिलीवरी
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-black rounded-lg border border-teal-300">
                  0.5 - 2.5 Tonne
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white">📦 उपयुक्त सामग्री (Scope):</div>
                <p>हार्डवेयर, पेंट्स, सैनिटरीवेयर, इलेक्ट्रिक केबल, नल पाइप्स, एवं छोटे सीमेंट बैच (10-50 बैग्स)।</p>
                <div className="font-bold text-slate-900 dark:text-white pt-1">🚚 वाहन (Vehicles):</div>
                <p>टाटा एस (छोटा हाथी - 750 KG), महिंद्रा बोलेरो मैक्स पिकअप (1.5T), ई-रिक्शा कार्गो लोडर।</p>
              </div>

              {/* Step By Step Workflow */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  कार्यप्रणाली चरण (Step-by-Step Workflow):
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">1</span>
                    <span>दुकानदार पोर्टल से 1-क्लिक डिस्पैच</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">2</span>
                    <span>15 मिनट में ड्राइवर दुकान पर पहुंचना</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">3</span>
                    <span>व्हाट्सएप लाइव ट्रैकिंग लिंक</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">4</span>
                    <span>साइट अनलोडिंग &amp; कैश/UPI पेमेंट</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TYPE 3: HEAVY EQUIPMENT & CRANE HAULAGE */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 relative overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/20 text-purple-500 rounded-2xl border border-purple-400/30">
                    <Anchor className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
                      Type 3: Machinery &amp; Heavy Crane
                    </span>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      भारी मशीनरी, जेसीबी एवं ओडीसी क्रेन ट्राली
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px] font-black rounded-lg border border-purple-300">
                  30 - 80 Tonne
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white">📦 उपयुक्त सामग्री (Scope):</div>
                <p>जेसीबी/एक्सकेवेटर 3DX, टावर क्रेन सेक्शंस, पाइलिंग रिग्स, भारी सबस्टेशन ट्रांसफॉर्मर, कंक्रीट बूम पंप्स।</p>
                <div className="font-bold text-slate-900 dark:text-white pt-1">🚚 वाहन (Vehicles):</div>
                <p>लो-बेड ट्रेलर्स (30T-80T), टेलिस्कोपिक मोबाइल क्रेंस (25T-100T), हाइड्रोलिक एक्सल पुलर।</p>
              </div>

              {/* Step By Step Workflow */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  कार्यप्रणाली चरण (Step-by-Step Workflow):
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">1</span>
                    <span>रूट हाइट व ब्रिज क्लीयरेंस सर्वे</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">2</span>
                    <span>RTO ओवर-डायमेंशनल परमिट</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">3</span>
                    <span>हाइड्रोलिक एंकरिंग व रिगिंग</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">4</span>
                    <span>एस्कॉर्ट गार्ड ट्रांजिट व अनलोडिंग</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TYPE 4: INTER-DISTRICT & STATE CONTAINER LOGISTICS */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 relative overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/20 text-blue-500 rounded-2xl border border-blue-400/30">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                      Type 4: Inter-District &amp; State Freight
                    </span>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      अंतर-ज़िला एवं राज्य स्तरीय क्लोज्ड कंटेनर लारी
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-black rounded-lg border border-blue-300">
                  5 - 20 Tonne
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white">📦 उपयुक्त सामग्री (Scope):</div>
                <p>सोलर पैनल पैलेट्स, PVC जल संशोधन पाइप्स, हाई-वोल्टेज केबल्स, टाइल्स एवं ग्रेनाइट्स (फैक्ट्री से ज़िला गोदाम)।</p>
                <div className="font-bold text-slate-900 dark:text-white pt-1">🚚 वाहन (Vehicles):</div>
                <p>FTL 19ft/22ft सील्ड क्लोज्ड कंटेनर, LTL शेयर्ड एक्सप्रेस माल लारी।</p>
              </div>

              {/* Step By Step Workflow */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  कार्यप्रणाली चरण (Step-by-Step Workflow):
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">1</span>
                    <span>डिजिटल कंजाइनमेंट नोट (LR)</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">2</span>
                    <span>ट्रांजिट मरीन इंश्योरेंस कवर</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">3</span>
                    <span>सील्ड क्लोज्ड हाईवे ट्रांजिट</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">4</span>
                    <span>मल्टी-ड्रॉप डिलीवरी POD रसीद</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: FREIGHT RATE CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CALCULATOR INPUT FORM */}
          <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black rounded-md uppercase">
                  Real-time Cost Matrix
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  इन्स्टेंट माल भाड़ा रेट कैलकुलेटर (Freight Rate Matrix)
                </h2>
              </div>
              <Calculator className="w-6 h-6 text-amber-500" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Scope Selector: Local vs Under State vs Inter-State */}
              <div className="sm:col-span-2 space-y-1.5 p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-300 dark:border-amber-700/50">
                <label className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-500" />
                  परिवहन क्षेत्र का दायरा (Scope of Route):
                </label>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRouteCategory('local');
                      if (calcDistance > 50) setCalcDistance(35);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold transition flex flex-col items-center text-center ${
                      routeCategory === 'local'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>📍 Local (लोकल)</span>
                    <span className="text-[10px] opacity-80 font-normal">0 - 50 km</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRouteCategory('under_state');
                      if (calcDistance < 50 || calcDistance > 500) setCalcDistance(180);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold transition flex flex-col items-center text-center ${
                      routeCategory === 'under_state'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>🛣️ Under State (अंदर राज्य)</span>
                    <span className="text-[10px] opacity-80 font-normal">50 - 500 km</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRouteCategory('interstate');
                      if (calcDistance < 500) setCalcDistance(750);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold transition flex flex-col items-center text-center ${
                      routeCategory === 'interstate'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>🚛 Inter-State (अंतर-राज्य)</span>
                    <span className="text-[10px] opacity-80 font-normal">500+ km</span>
                  </button>
                </div>
              </div>

              {/* Material Selector */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  सामग्री प्रकार (Material Type)
                </label>
                <select
                  value={calcMaterial}
                  onChange={(e) => setCalcMaterial(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="cement">सीमेंट (Cement Bags)</option>
                  <option value="steel">सरिया TMT Steel Bars</option>
                  <option value="bricks">ईंटें / ऐश ब्रिक्स (Bricks)</option>
                  <option value="sand">बालू / गिट्टी (Sand &amp; Aggregates)</option>
                  <option value="hardware">हार्डवेयर &amp; पेंट्स (Hardware &amp; Paints)</option>
                  <option value="machinery">जेसीबी / भारी मशीनरी (Heavy Equipment)</option>
                </select>
              </div>

              {/* Vehicle Type Selector */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  वाहन प्रकार (Vehicle Specification)
                </label>
                <select
                  value={calcVehicleType}
                  onChange={(e) => setCalcVehicleType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="tata_ace">टाटा एस (छोटा हाथी - 0.75 Tonne) - ₹25/km</option>
                  <option value="bolero_pickup">महिंद्रा बोलेरो पिकअप (1.5 Tonne) - ₹35/km</option>
                  <option value="tipper_6w">6-व्हीलर टिपर्स (10 Tonne) - ₹60/km</option>
                  <option value="tipper_10w">10-व्हीलर टिपर्स (25 Tonne) - ₹85/km</option>
                  <option value="trailer_heavy">लो-बेड ओडीसी ट्रेलर (40 Tonne) - ₹160/km</option>
                </select>
              </div>

              {/* Distance Slider */}
              <div className="sm:col-span-2 space-y-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    परिवहन दूरी (Transit Distance):
                  </label>
                  <span className="text-base font-black text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-950/80 px-3 py-1 rounded-xl">
                    {calcDistance} Kilometer (किमी)
                  </span>
                </div>

                <input
                  type="range"
                  min="5"
                  max="250"
                  step="5"
                  value={calcDistance}
                  onChange={(e) => setCalcDistance(Number(e.target.value))}
                  className="w-full accent-teal-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>5 km (Local Shop)</span>
                  <span>50 km (Inter-Tehsil)</span>
                  <span>150 km (District Border)</span>
                  <span>250 km (State Highway)</span>
                </div>
              </div>

              {/* Checkboxes for Extra Charges */}
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                  अतिरिक्त सुविधाएं एवं रसीदें (Additional Add-ons):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-2 ${
                    incLabor ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 text-teal-900 dark:text-teal-200' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={incLabor}
                      onChange={(e) => setIncLabor(e.target.checked)}
                      className="accent-teal-600 w-4 h-4"
                    />
                    <div className="text-xs font-bold leading-tight">
                      हम्माली लोडिंग (Labor) (+₹800)
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-2 ${
                    incWeighbridge ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 text-teal-900 dark:text-teal-200' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={incWeighbridge}
                      onChange={(e) => setIncWeighbridge(e.target.checked)}
                      className="accent-teal-600 w-4 h-4"
                    />
                    <div className="text-xs font-bold leading-tight">
                      धर्म कांटा पर्ची (+₹150)
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-2 ${
                    incInsurance ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 text-teal-900 dark:text-teal-200' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={incInsurance}
                      onChange={(e) => setIncInsurance(e.target.checked)}
                      className="accent-teal-600 w-4 h-4"
                    />
                    <div className="text-xs font-bold leading-tight">
                      ट्रांजिट इंश्योरेंस (+₹350)
                    </div>
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* CALCULATOR ESTIMATED BREAKDOWN BILL */}
          <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-500/40 shadow-2xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-400/20 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-teal-300">
                  Estimated Fare Receipt
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black rounded-md border border-emerald-400/30">
                  Instant Quote
                </span>
              </div>

              <div className="text-center py-2 space-y-1 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[10px] uppercase font-extrabold text-slate-300 block">कुल अनुमानित माल भाड़ा (Total Estimated Freight)</span>
                <span className="text-3xl font-black text-emerald-400">₹{calcResult.totalFreight.toLocaleString('en-IN')}</span>
                <span className="text-[11px] text-amber-300 font-bold block">
                  अनुमानित समय: {calcResult.timeStr} ({calcResult.ratePerKm} ₹/km)
                </span>
              </div>

              {/* Itemized Lines */}
              <div className="space-y-2 text-xs divide-y divide-white/10">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-300">Base Transport Fare ({calcDistance} km):</span>
                  <span className="font-extrabold">₹{calcResult.baseFreight.toLocaleString('en-IN')}</span>
                </div>
                {incLabor && (
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-300">Loading/Unloading Labor:</span>
                    <span className="font-extrabold text-teal-300">+₹{calcResult.laborCost}</span>
                  </div>
                )}
                {incWeighbridge && (
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-300">Weighbridge Slips (धर्म कांटा):</span>
                    <span className="font-extrabold text-amber-300">+₹{calcResult.weighbridgeFee}</span>
                  </div>
                )}
                {incInsurance && (
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-300">Goods Transit Insurance:</span>
                    <span className="font-extrabold text-purple-300">+₹{calcResult.insuranceFee}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 font-extrabold text-emerald-300">
                  <span>Digital E-Way Bill auto-sync:</span>
                  <span>FREE</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const fleetMatch = SAMPLE_FLEET[0];
                setBookingModalVehicle(fleetMatch);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-black rounded-2xl text-xs shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Truck className="w-4 h-4 text-slate-950" />
              <span>बुकिंग हेतु गाड़ी सेलेक्ट करें (Proceed to Book)</span>
            </button>
          </div>

        </div>
      )}

      {/* TAB 3: FLEET DIRECTORY & INSTANT BOOKING */}
      {activeTab === 'fleet' && (
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* SEARCH & CATEGORY FILTERS */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="ट्रांसपोर्टर या गाड़ियां खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setSelectedFleetFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  selectedFleetFilter === 'all'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                सभी गाड़ियां ({SAMPLE_FLEET.length})
              </button>
              <button
                onClick={() => setSelectedFleetFilter('tipper')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  selectedFleetFilter === 'tipper'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                टिपर्स व डंपर
              </button>
              <button
                onClick={() => setSelectedFleetFilter('pickup')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  selectedFleetFilter === 'pickup'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                टाटा एस व पिकअप
              </button>
              <button
                onClick={() => setSelectedFleetFilter('heavy_trailer')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  selectedFleetFilter === 'heavy_trailer'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                ओडीसी क्रेन ट्रेलर्स
              </button>
            </div>
          </div>

          {/* FLEET CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFleet.map((vehicle) => (
              <div
                key={vehicle.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-2xl transition flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-black rounded-md uppercase border border-teal-300/40">
                      {vehicle.vehicleType}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> AVAILABLE
                    </span>
                  </div>

                  <h3 className="font-black text-base text-slate-900 dark:text-white leading-tight">
                    {vehicle.transporterName}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    <span>चालक: {vehicle.driverName}</span>
                    <span>•</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{vehicle.vehicleNumber}</span>
                  </div>

                  {/* Rate & Capacity Pill */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Capacity</span>
                      <span className="font-black text-slate-900 dark:text-white">{vehicle.capacityTonnes} Tonnes</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Freight Rate</span>
                      <span className="font-black text-teal-600 dark:text-teal-400">₹{vehicle.baseRatePerKm}/km</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Min Fare</span>
                      <span className="font-black text-amber-600 dark:text-amber-400">₹{vehicle.minFare}</span>
                    </div>
                  </div>

                  {/* Features Badges */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {vehicle.features.map((feat, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-md">
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CARD ACTION BUTTONS */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <a
                    href={`tel:${vehicle.phone}`}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-black rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                    <span>Call Driver</span>
                  </a>

                  <button
                    onClick={() => setBookingModalVehicle(vehicle)}
                    className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Book Dispatch</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 4: LIVE SHIPMENT TRACKING & WEIGHBRIDGE SLIPS */}
      {activeTab === 'live_tracking' && (
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black rounded-md uppercase">
                  Live Dispatch Simulation
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-emerald-500" />
                  सक्रिय शिपमेंट ट्रैकिंग एवं धर्म कांटा डिजिटल रसीद (Live GPS &amp; Weighbridge)
                </h2>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 rounded-xl text-xs font-black animate-pulse flex items-center gap-1">
                ● LIVE GPS CONNECTED
              </span>
            </div>

            {/* DEMO ACTIVE SHIPMENT CARD */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-500/30 space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-amber-300 uppercase font-black tracking-wider block">Shipment ID: SHP-908122</span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    500 Bags Ultratech Cement (Gorakhpur Plant to Civil Lines Site)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Vehicle: UP 53 ET 8912 (10-Wheeler Tipper) • Driver: Ramesh Yadav (+91 98390 12345)
                  </p>
                </div>

                <div className="p-3 bg-white/10 rounded-2xl border border-white/20 text-right">
                  <span className="text-[10px] text-slate-300 uppercase font-bold block">Estimated Arrival</span>
                  <span className="text-lg font-black text-emerald-400">11:45 AM (In 24 Mins)</span>
                </div>
              </div>

              {/* Progress Milestones Timeline */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider">
                  डिस्पैच प्रगति टाइमलाइन (Dispatch Milestones):
                </span>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px]">
                  <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-300 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>1. Order Confirmed</span>
                  </div>
                  <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-300 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>2. Loaded at Yard</span>
                  </div>
                  <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-300 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>3. धर्म कांटा Certified</span>
                  </div>
                  <div className="p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-300 font-bold flex items-center gap-1.5 animate-pulse">
                    <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>4. On-Route Transit</span>
                  </div>
                  <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>5. Site OTP Unloading</span>
                  </div>
                </div>
              </div>

              {/* DIGITAL WEIGHBRIDGE SLIP (धर्म कांटा पर्ची) PREVIEW */}
              <div className="p-4 bg-black/40 rounded-2xl border border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 uppercase flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-amber-400" />
                    डिजिटल धर्म कांटा पर्ची (Certified Weighbridge Slip #WB-88192)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">STAMP VERIFIED ✓</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block font-bold">Gross Weight (ग्रॉस भार)</span>
                    <span className="font-black text-white text-sm">38,500 KG</span>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block font-bold">Tare Weight (खाली गाड़ी)</span>
                    <span className="font-black text-white text-sm">13,500 KG</span>
                  </div>
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-400/30">
                    <span className="text-[10px] text-emerald-300 block font-bold">Net Material (शुद्ध माल)</span>
                    <span className="font-black text-emerald-400 text-sm">25,000 KG (25 Ton)</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingModalVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
            
            <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 p-6 text-white relative">
              <button
                onClick={() => setBookingModalVehicle(null)}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-2xl">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-md text-[10px] font-black uppercase">
                    Confirm Vehicle Booking
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    {bookingModalVehicle.transporterName}
                  </h3>
                </div>
              </div>
            </div>

            <form onSubmit={handleBookSubmit} className="p-6 space-y-4">
              
              {bookingSuccessToast && (
                <div className="p-3 bg-emerald-600 text-white font-black text-xs rounded-2xl flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>बुकिंग सफल! ड्राइवर को व्हाट्सएप एवं कॉल भेज दिया गया है।</span>
                </div>
              )}

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  सामग्री का विवरण (Material Description)
                </label>
                <input
                  type="text"
                  required
                  value={bookingMaterialDesc}
                  onChange={(e) => setBookingMaterialDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  पिकअप पता (Pickup Address)
                </label>
                <input
                  type="text"
                  required
                  value={bookingPickupAddr}
                  onChange={(e) => setBookingPickupAddr(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  अनलोडिंग साइट पता (Delivery Site Address)
                </label>
                <input
                  type="text"
                  required
                  value={bookingDropAddr}
                  onChange={(e) => setBookingDropAddr(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">Base Transport Rate:</span>
                  <span>₹{bookingModalVehicle.baseRatePerKm}/km</span>
                </div>
                <div className="flex justify-between font-bold text-teal-600 dark:text-teal-400">
                  <span>E-Way Bill Auto-Sync:</span>
                  <span>INCLUDED</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBookingModalVehicle(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-md transition"
                >
                  Confirm &amp; Send Booking
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* REGISTRATION MODAL FOR TRANSPORTERS */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
              <button
                onClick={() => setShowRegModal(false)}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-black text-white">अपनी गाड़ी 2CLICK नेटवर्क में जोड़ें</h3>
              <p className="text-xs text-slate-300">ट्रांसपोर्टर/ड्राइवर रजिस्ट्रेशन - डेली आर्डर अलर्ट प्राप्त करें</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">फर्म का नाम (Transporter Firm Name)</label>
                <input
                  type="text"
                  placeholder="उदा. गुप्ता टिपर्स एवं ट्रांसपोर्ट"
                  value={regFirmName}
                  onChange={(e) => setRegFirmName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">चालक का नाम (Driver Name)</label>
                <input
                  type="text"
                  placeholder="ड्राइवर नाम"
                  value={regDriverName}
                  onChange={(e) => setRegDriverName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">गाड़ी नंबर (Vehicle Number)</label>
                <input
                  type="text"
                  placeholder="UP 53 ET 0000"
                  value={regVehicleNum}
                  onChange={(e) => setRegVehicleNum(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('आपकी गाड़ी रजिस्ट्रेशन रिक्वेस्ट प्राप्त हो गयी है। वेरिफिकेशन टीम जल्द संपर्क करेगी।');
                    setShowRegModal(false);
                  }}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-md transition"
                >
                  Submit Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POST NEW LOAD TENDER MODAL */}
      {showPostLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-slate-950 relative">
              <button
                onClick={() => setShowPostLoadModal(false)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-slate-950 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-black flex items-center gap-2">
                <Plus className="w-6 h-6" />
                नया माल लोड टेंडर पोस्ट करें (Reverse Auction)
              </h3>
              <p className="text-xs text-slate-900 font-bold">
                कम से कम भाड़ा पाने के लिए अपनी सामग्री का टेंडर लाइव करें
              </p>
            </div>

            <form onSubmit={handlePostLoadSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1">
                  लोड का शीर्षक (Tender Title)
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. 400 बैग अल्ट्राटेक सीमेंट - साइट डिलीवरी"
                  value={postLoadTitle}
                  onChange={(e) => setPostLoadTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1">
                    मार्ग श्रेणी (Route Category)
                  </label>
                  <select
                    value={postLoadCategory}
                    onChange={(e) => setPostLoadCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="local">📍 Local (0-50 km)</option>
                    <option value="under_state">🛣️ Under State (50-500 km)</option>
                    <option value="interstate">🚛 Inter-State (500+ km)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1">
                    मात्रा (Quantity)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. 20 टन / 400 बैग्स"
                    value={postLoadQty}
                    onChange={(e) => setPostLoadQty(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1">
                    पिकअप स्थान (Pickup Location)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. गीडा यार्ड, गोरखपुर"
                    value={postLoadPickup}
                    onChange={(e) => setPostLoadPickup(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1">
                    अनलोडिंग स्थान (Delivery Site)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. सिविल लाइन्स साइट, बस्ती"
                    value={postLoadDelivery}
                    onChange={(e) => setPostLoadDelivery(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1">
                    अनुमानित दूरी (Approx Distance KM)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={postLoadDist}
                    onChange={(e) => setPostLoadDist(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1">
                    मैक्स बजट (Maximum Target Budget ₹)
                  </label>
                  <input
                    type="number"
                    required
                    step="500"
                    placeholder="उदा. 12000"
                    value={postLoadTargetBudget || ''}
                    onChange={(e) => setPostLoadTargetBudget(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs space-y-1">
                <p className="font-extrabold text-amber-900 dark:text-amber-300">
                  💡 टेंडर लाइव करने के बाद 140+ सत्यापित ट्रांसपोर्टर्स को तुरंत व्हाट्सएप नोटिफिकेशन भेजा जाएगा!
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostLoadModal(false)}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
                >
                  टेंडर पोस्ट करें (Publish Tender)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PLACE LOWER BID MODAL (TRANSPORTER AUCTION BID) */}
      {bidModalTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
              <button
                onClick={() => setBidModalTender(null)}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="inline-block px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-black rounded-md uppercase mb-1">
                Transporter Bid Submission
              </div>
              <h3 className="text-lg font-black text-white">{bidModalTender.title}</h3>
              <p className="text-xs text-slate-300">
                वर्तमान L1 न्यूनतम रेट से कम रेट की बोली लगाएं
              </p>
            </div>

            <form onSubmit={handlePlaceBidSubmit} className="p-6 space-y-4">
              <div className="p-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-500">
                  <span>Target Budget:</span>
                  <span className="line-through">₹{bidModalTender.maxTargetBudgetINR.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-black text-emerald-600 dark:text-emerald-400">
                  <span>Current L1 Winner Rate:</span>
                  <span>
                    ₹{(bidModalTender.bids[0]?.bidAmountINR || bidModalTender.maxTargetBudgetINR).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1">
                  ट्रांसपोर्टर/फर्म नाम (Transporter Name)
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. पूर्वांचल रोडवेज"
                  value={newBidTransporter}
                  onChange={(e) => setNewBidTransporter(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1">
                    गाड़ी नंबर (Vehicle No.)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="UP 53 ET 1234"
                    value={newBidVehicleNum}
                    onChange={(e) => setNewBidVehicleNum(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1">
                    ड्राइवर मोबाइल नंबर
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={newBidPhone}
                    onChange={(e) => setNewBidPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1">
                    डिलीवरी टाइम (Hours)
                  </label>
                  <input
                    type="number"
                    required
                    value={newBidDeliveryHours}
                    onChange={(e) => setNewBidDeliveryHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-emerald-600 dark:text-emerald-400 block mb-1">
                    आपकी बोली (Your Lower Bid Amount ₹)
                  </label>
                  <input
                    type="number"
                    required
                    step="100"
                    value={newBidAmount}
                    onChange={(e) => setNewBidAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500 rounded-xl text-sm font-black text-emerald-900 dark:text-emerald-200"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBidModalTender(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
                >
                  सबमिट करें (Submit L1 Bid)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
