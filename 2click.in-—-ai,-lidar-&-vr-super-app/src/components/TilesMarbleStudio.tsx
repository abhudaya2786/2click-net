import React, { useState, useMemo } from 'react';
import { 
  Grid, 
  Ruler, 
  Calculator, 
  Store, 
  HardHat, 
  ShieldCheck, 
  PhoneCall, 
  Share2, 
  Download, 
  Sparkles, 
  Check, 
  Building2, 
  Wrench, 
  ChevronRight, 
  Info, 
  MapPin, 
  Layers, 
  Package, 
  DollarSign, 
  Star,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  FileText,
  UserCheck,
  Award
} from 'lucide-react';
import { INDIAN_CITIES } from '../data/initialData';
import { useLanguage } from '../context/LanguageContext';

interface TilesMarbleStudioProps {
  selectedCity?: string;
  onNavigateToVendors?: (category: string) => void;
  onOpenAuth?: () => void;
}

// Preset Tile Sizes
const TILE_SIZES = [
  { id: '2x2', name: '2ft × 2ft (600 × 600 mm)', widthFt: 2, heightFt: 2, sqftPerTile: 4, sqftPerBox: 16, tilesPerBox: 4, category: 'Floor' },
  { id: '2x4', name: '2ft × 4ft (600 × 1200 mm) GVT/PGVT', widthFt: 2, heightFt: 4, sqftPerTile: 8, sqftPerBox: 16, tilesPerBox: 2, category: 'Floor & Wall' },
  { id: '800x1600', name: '800 × 1600 mm (Large Slab)', widthFt: 2.62, heightFt: 5.25, sqftPerTile: 13.78, sqftPerBox: 27.56, tilesPerBox: 2, category: 'Large Slab' },
  { id: '4x8', name: '4ft × 8ft (1200 × 2400 mm) Grand Slab', widthFt: 4, heightFt: 8, sqftPerTile: 32, sqftPerBox: 32, tilesPerBox: 1, category: 'Grand Slab' },
  { id: '12x18', name: '12in × 18in (300 × 450 mm) Ceramic Wall', widthFt: 1, heightFt: 1.5, sqftPerTile: 1.5, sqftPerBox: 9, tilesPerBox: 6, category: 'Wall' },
  { id: '12x12', name: '12in × 12in (300 × 300 mm) Bathroom Anti-Skid', widthFt: 1, heightFt: 1, sqftPerTile: 1, sqftPerBox: 10, tilesPerBox: 10, category: 'Floor' },
  { id: 'marble_slab', name: 'Custom Marble Slab (Cut to Fit)', widthFt: 5, heightFt: 8, sqftPerTile: 40, sqftPerBox: 40, tilesPerBox: 1, category: 'Marble' },
  { id: 'granite_counter', name: 'Kitchen Granite Slab (2ft × 8ft)', widthFt: 2, heightFt: 8, sqftPerTile: 16, sqftPerBox: 16, tilesPerBox: 1, category: 'Granite' }
];

// Top Tile & Marble Brands in India
const TOP_BRANDS = [
  { name: 'Kajaria Ceramics', logo: '🏆', rating: 4.9, tagline: 'India\'s No.1 Tile Brand - Vitrified & PGVT', warranty: '10 Years', priceRange: '₹42 - ₹180 / sq.ft' },
  { name: 'Somany Ceramics', logo: '✨', rating: 4.8, tagline: 'VC Shield & Slip Shield Technology', warranty: '10 Years', priceRange: '₹38 - ₹160 / sq.ft' },
  { name: 'Orientbell Tiles', logo: '🔷', rating: 4.7, tagline: 'Germ-Free & Cool Tile Solutions', warranty: '7 Years', priceRange: '₹35 - ₹140 / sq.ft' },
  { name: 'Asian Granito India (AGL)', logo: '💎', rating: 4.8, tagline: 'Large Slabs & Composite Marble', warranty: '8 Years', priceRange: '₹45 - ₹220 / sq.ft' },
  { name: 'Nitco Tiles & Marble', logo: '🏛️', rating: 4.7, tagline: 'Italian Marble & Designer Vitrified', warranty: '10 Years', priceRange: '₹60 - ₹450 / sq.ft' },
  { name: 'H&R Johnson India', logo: '🧱', rating: 4.8, tagline: 'Endura Industrial & Residential Tiles', warranty: '8 Years', priceRange: '₹40 - ₹170 / sq.ft' },
  { name: 'Simpolo Ceramics', logo: '⭐', rating: 4.9, tagline: 'SCS Seamless & Full Body Porcelain', warranty: '10 Years', priceRange: '₹55 - ₹250 / sq.ft' },
  { name: 'Makrana & Katni Marble Association', logo: '🏔️', rating: 4.9, tagline: 'Pure White Makrana & Katni Natural Marble Slabs', warranty: 'Lifetime Natural', priceRange: '₹85 - ₹650 / sq.ft' }
];

// Sample Local Shops & Wholesale Suppliers
const SAMPLE_SHOPS = [
  {
    id: 's1',
    name: 'Shree Ram Tiles & Italian Marble Depot',
    owner: 'Rajesh Sharma',
    city: 'Bengaluru',
    address: 'Ring Road, Near Marble Market, HSR Layout',
    phone: '+91 98450 11223',
    rating: 4.9,
    gstin: '29ABCDE1234F1Z5',
    brandsHandled: ['Kajaria', 'Somany', 'Makrana Marble', 'Black Galaxy Granite'],
    discounts: 'Up to 28% Off Wholesale Rates on Bulk Orders (>500 Sq.Ft)',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's2',
    name: 'Gupta Granites & Sanitaryware Mart',
    owner: 'Manoj Gupta',
    city: 'Lucknow',
    address: 'Faizabad Road, Near Polytechnic Chauraha',
    phone: '+91 94150 88990',
    rating: 4.8,
    gstin: '09AAACG5678H1Z2',
    brandsHandled: ['AGL', 'Orientbell', 'Jhansi Red Granite', 'Roff Chemical'],
    discounts: 'Free Transport Delivery within 15 km on 100+ Boxes',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's3',
    name: 'Mahadev Marble & Tile Emporium',
    owner: 'Vikram Singh',
    city: 'Gorakhpur',
    address: 'Medical College Road, Basharatpur',
    phone: '+91 99180 33445',
    rating: 4.9,
    gstin: '09AABCM9012K1Z8',
    brandsHandled: ['Simpolo', 'Nitco', 'Katni Marble', 'Ultratech Tilefix'],
    discounts: 'Direct Factory Rate Slabs + Free Laser Cut Edge Inspection',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's4',
    name: 'National Marble & Quartz Gallery',
    owner: 'Sanjay Patel',
    city: 'Mumbai',
    address: 'SVT Road, Vile Parle West',
    phone: '+91 98200 44556',
    rating: 4.9,
    gstin: '27AABCN3456L1Z3',
    brandsHandled: ['Italian Botticino', 'Nano White Quartz', 'Kajaria Eternity'],
    discounts: 'Export Quality Mirror Polish Slabs at Wholesale Market Rates',
    image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80'
  }
];

// Sample Mistri & Fitter Contractors
const SAMPLE_MISTRI = [
  {
    id: 'm1',
    name: 'Suresh Kumar Mistri (Tile & Slab Specialist)',
    role: 'Head Tile & Marble Fitter Mistri',
    city: 'Bengaluru',
    phone: '+91 98800 66778',
    experienceYears: 14,
    rating: 4.9,
    teamSize: '6 Skilled Lebar + 2 Cutter Operators',
    rates: {
      floorTilePerSqft: 28,
      gvtLargeSlabPerSqft: 45,
      marbleFittingPerSqft: 65,
      marblePolishingPerSqft: 40,
      skirtingPerRft: 18
    },
    specialties: ['2x4 GVT Zero Joint Laying', 'Italian Marble Epoxy & Diamond Polish', 'Staircase Chamfering']
  },
  {
    id: 'm2',
    name: 'Radhe Shyam & Sons Labour Team',
    role: 'Marble & Granite Specialist Fitter',
    city: 'Lucknow',
    phone: '+91 94500 22334',
    experienceYears: 18,
    rating: 4.8,
    teamSize: '8 Mistri + 4 Helper Lebar',
    rates: {
      floorTilePerSqft: 25,
      gvtLargeSlabPerSqft: 40,
      marbleFittingPerSqft: 60,
      marblePolishingPerSqft: 35,
      skirtingPerRft: 15
    },
    specialties: ['Makrana Marble Pattern Matching', 'Kitchen Counter Granite Molding', 'Waterproof Grout Filling']
  },
  {
    id: 'm3',
    name: 'Dharmendra Tile Fitter Contractor',
    role: 'Vitrified & Wall Tile Contractor',
    city: 'Gorakhpur',
    phone: '+91 97920 11223',
    experienceYears: 11,
    rating: 4.9,
    teamSize: '4 Mistri + 2 Helpers',
    rates: {
      floorTilePerSqft: 22,
      gvtLargeSlabPerSqft: 38,
      marbleFittingPerSqft: 55,
      marblePolishingPerSqft: 30,
      skirtingPerRft: 12
    },
    specialties: ['Bathroom 3D Highlighter Wall Tiles', 'Paper Joint Tile Leveler System', 'Acid Clean Washing']
  }
];

export const TilesMarbleStudio: React.FC<TilesMarbleStudioProps> = ({
  selectedCity = 'Bengaluru',
  onNavigateToVendors,
  onOpenAuth
}) => {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'calculator' | 'brands_shops' | 'mistri_labour'>('calculator');

  // Calculator State Inputs
  const [calculationMode, setCalculationMode] = useState<'dimensions' | 'direct_area'>('dimensions');
  const [roomLength, setRoomLength] = useState<number>(15);
  const [roomWidth, setRoomWidth] = useState<number>(12);
  const [directAreaSqFt, setDirectAreaSqFt] = useState<number>(180);
  
  const [surfaceType, setSurfaceType] = useState<string>('Floor');
  const [selectedSizeId, setSelectedSizeId] = useState<string>('2x4');
  const [customTilePricePerSqFt, setCustomTilePricePerSqFt] = useState<number>(55);
  
  // Skirting & Wastage
  const [includeSkirting, setIncludeSkirting] = useState<boolean>(true);
  const [skirtingHeightInches, setSkirtingHeightInches] = useState<number>(4);
  const [patternWastagePercent, setPatternWastagePercent] = useState<number>(8); // 8% default
  
  // Material (Usama) Pricing Assumptions
  const [cementBagPrice, setCementBagPrice] = useState<number>(380);
  const [chemicalAdhesivePrice, setChemicalAdhesivePrice] = useState<number>(420); // 20kg bag
  const [groutPricePerKg, setGroutPricePerKg] = useState<number>(120);
  const [adhesiveType, setAdhesiveType] = useState<'chemical_adhesive' | 'cement_mortar' | 'hybrid'>('hybrid');

  // Mistri Labor fitting rates (per Sq.Ft)
  const [laborFittingRatePerSqFt, setLaborFittingRatePerSqFt] = useState<number>(30);
  const [laborPolishingRatePerSqFt, setLaborPolishingRatePerSqFt] = useState<number>(0); // 0 for tiles, >0 for marble
  const [skirtingLaborRatePerRft, setSkirtingLaborRatePerRft] = useState<number>(15);

  // Modal / Share State
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [bookingTarget, setBookingTarget] = useState<string>('');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string>('');

  // Search filter for shops & mistri
  const [cityFilter, setCityFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Find selected tile size object
  const currentTileSize = useMemo(() => {
    return TILE_SIZES.find(s => s.id === selectedSizeId) || TILE_SIZES[1];
  }, [selectedSizeId]);

  // Derived Calculations
  const calculatedMetrics = useMemo(() => {
    // 1. Net Room Area in Sq.Ft
    const netArea = calculationMode === 'dimensions' 
      ? Math.max(0, roomLength * roomWidth) 
      : Math.max(0, directAreaSqFt);

    // 2. Skirting Running Feet (Perimeter)
    const perimeterRft = calculationMode === 'dimensions'
      ? 2 * (roomLength + roomWidth)
      : Math.sqrt(netArea) * 4;

    // Skirting Sq.Ft = Running Feet * (Height in Inches / 12)
    const skirtingSqFt = includeSkirting ? (perimeterRft * (skirtingHeightInches / 12)) : 0;

    // Total Net Sq.Ft required before wastage
    const netTotalSqFt = netArea + skirtingSqFt;

    // Wastage Sq.Ft
    const wastageSqFt = netTotalSqFt * (patternWastagePercent / 100);

    // Gross Sq.Ft Required
    const grossTotalSqFt = Math.ceil(netTotalSqFt + wastageSqFt);

    // Exact Tiles Count
    const totalTilesCount = Math.ceil(grossTotalSqFt / currentTileSize.sqftPerTile);

    // Exact Boxes Count
    const totalBoxesCount = Math.ceil(grossTotalSqFt / currentTileSize.sqftPerBox);

    // Total Tile Material Cost
    const totalTilesCost = grossTotalSqFt * customTilePricePerSqFt;

    // --- "Usama" / Material Consumables Calculation ---
    // 1 Bag Chemical Adhesive (20kg) covers ~45-50 Sq.Ft
    // 1 Bag Cement (50kg) covers ~30-35 Sq.Ft for thick bed
    let chemicalBags = 0;
    let cementBags = 0;
    
    if (adhesiveType === 'chemical_adhesive') {
      chemicalBags = Math.ceil(grossTotalSqFt / 45);
      cementBags = Math.ceil(skirtingSqFt / 50); // minimal for skirting
    } else if (adhesiveType === 'cement_mortar') {
      cementBags = Math.ceil(grossTotalSqFt / 30);
      chemicalBags = 0;
    } else {
      // Hybrid (Chemical Adhesive for Tiles + Cement for Base Mortar)
      chemicalBags = Math.ceil(grossTotalSqFt / 55);
      cementBags = Math.ceil(grossTotalSqFt / 60);
    }

    // Grout needed: ~1 kg per 80-100 sq.ft for standard 2mm joint
    const groutKg = Math.ceil(grossTotalSqFt / 80);
    
    // Tile Spacers & Wedges packs (1 pack per 250 sq.ft)
    const spacerPacks = Math.ceil(grossTotalSqFt / 250);
    const spacerCost = spacerPacks * 250; // ₹250 per pack

    const totalChemicalCost = chemicalBags * chemicalAdhesivePrice;
    const totalCementCost = cementBags * cementBagPrice;
    const totalGroutCost = groutKg * groutPricePerKg;

    const totalUsamaMaterialsCost = totalChemicalCost + totalCementCost + totalGroutCost + spacerCost;

    // --- "Mistri & Lebar" Labor Cost Calculation ---
    const areaFittingLaborCost = netArea * laborFittingRatePerSqFt;
    const skirtingLaborCost = includeSkirting ? (perimeterRft * skirtingLaborRatePerRft) : 0;
    const polishingLaborCost = netArea * laborPolishingRatePerSqFt;

    const totalMistriLaborCost = areaFittingLaborCost + skirtingLaborCost + polishingLaborCost;

    // Grand Budget Total
    const grandTotalBudget = totalTilesCost + totalUsamaMaterialsCost + totalMistriLaborCost;

    return {
      netArea,
      perimeterRft,
      skirtingSqFt,
      netTotalSqFt,
      wastageSqFt,
      grossTotalSqFt,
      totalTilesCount,
      totalBoxesCount,
      totalTilesCost,
      chemicalBags,
      cementBags,
      groutKg,
      spacerPacks,
      totalUsamaMaterialsCost,
      areaFittingLaborCost,
      skirtingLaborCost,
      polishingLaborCost,
      totalMistriLaborCost,
      grandTotalBudget
    };
  }, [
    calculationMode,
    roomLength,
    roomWidth,
    directAreaSqFt,
    includeSkirting,
    skirtingHeightInches,
    patternWastagePercent,
    currentTileSize,
    customTilePricePerSqFt,
    adhesiveType,
    chemicalAdhesivePrice,
    cementBagPrice,
    groutPricePerKg,
    laborFittingRatePerSqFt,
    laborPolishingRatePerSqFt,
    skirtingLaborRatePerRft
  ]);

  // Adjust default labor rates when size or material changes
  const handleTileSizeChange = (sizeId: string) => {
    setSelectedSizeId(sizeId);
    if (sizeId === '800x1600' || sizeId === '4x8') {
      setLaborFittingRatePerSqFt(45);
      setCustomTilePricePerSqFt(85);
      setLaborPolishingRatePerSqFt(0);
    } else if (sizeId === 'marble_slab') {
      setLaborFittingRatePerSqFt(65);
      setLaborPolishingRatePerSqFt(40); // Marble diamond polishing
      setCustomTilePricePerSqFt(180);
    } else if (sizeId === 'granite_counter') {
      setLaborFittingRatePerSqFt(75);
      setLaborPolishingRatePerSqFt(0);
      setCustomTilePricePerSqFt(140);
    } else {
      setLaborFittingRatePerSqFt(30);
      setCustomTilePricePerSqFt(55);
      setLaborPolishingRatePerSqFt(0);
    }
  };

  const filteredShops = SAMPLE_SHOPS.filter(s => {
    const matchesCity = cityFilter === 'All' || s.city.toLowerCase() === cityFilter.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.brandsHandled.some(b => b.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          s.owner.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCity && matchesSearch;
  });

  const filteredMistri = SAMPLE_MISTRI.filter(m => {
    const matchesCity = cityFilter === 'All' || m.city.toLowerCase() === cityFilter.toLowerCase();
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.specialties.some(sp => sp.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCity && matchesSearch;
  });

  const handleBookMistriOrShop = (title: string) => {
    setBookingTarget(title);
    setBookingModalOpen(true);
    setBookingSuccessMsg('');
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccessMsg(`✅ सफलतापूर्वक बुक हो गया! 2Click सपोर्ट टीम एवं वेंडर आपसे शीघ्र संपर्क करेंगे।`);
    setTimeout(() => {
      setBookingModalOpen(false);
      setBookingSuccessMsg('');
    }, 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 text-white p-6 sm:p-8 shadow-2xl border border-slate-800">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              <Grid className="w-3.5 h-3.5 text-teal-400" />
              <span>2Click Tiles &amp; Marble Engine</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              टाइल्स, मार्बल, मिस्त्री लेबर एवं सामान कैलकुलेटर
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              क्षेत्रफल (Area-wise) अनुसार टाइल्स-मार्बल के बॉक्स, केमिकल/सीमेंट सामान (Usama), मिस्त्री फिटिंग लेबर ठेका रेट एवं टॉप होलसेल दुकानों का संपूर्ण हिसाब लगाएं।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'calculator'
                  ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/30 scale-105'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>एरिया अनुसार कैलकुलेटर</span>
            </button>
            <button
              onClick={() => setActiveTab('brands_shops')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'brands_shops'
                  ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/30 scale-105'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>मार्बल/टाइल्स दुकानें व सप्लायर</span>
            </button>
            <button
              onClick={() => setActiveTab('mistri_labour')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'mistri_labour'
                  ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/30 scale-105'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <HardHat className="w-4 h-4" />
              <span>मिस्त्री एवं लेबर वेंडर</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AREA-WISE CALCULATOR ENGINE                                       */}
      {/* ========================================================================= */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Inputs Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Surface & Calculation Mode */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                    कमरा / सतह एवं एरिया विवरण (Area Dimensions)
                  </h3>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setCalculationMode('dimensions')}
                    className={`px-3 py-1 rounded-lg transition ${
                      calculationMode === 'dimensions'
                        ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    लंबाई × चौड़ाई (L × W)
                  </button>
                  <button
                    onClick={() => setCalculationMode('direct_area')}
                    className={`px-3 py-1 rounded-lg transition ${
                      calculationMode === 'direct_area'
                        ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    डायरेक्ट Sq.Ft एरिया
                  </button>
                </div>
              </div>

              {/* Surface Type selection */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-2">
                  सतह का प्रकार (Surface Application):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: '🛋️ हॉल / बेडरूम Floor', val: 'Floor' },
                    { label: '🚿 बाथरूम Wall & Floor', val: 'Bathroom' },
                    { label: '🍳 किचन Platform / Tile', val: 'Kitchen' },
                    { label: '🏢 एलिवेशन / Outer Wall', val: 'Elevation' },
                  ].map((s) => (
                    <button
                      key={s.val}
                      onClick={() => setSurfaceType(s.val)}
                      className={`p-2.5 rounded-2xl text-xs font-extrabold border transition text-left ${
                        surfaceType === s.val
                          ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length x Width Input */}
              {calculationMode === 'dimensions' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      कमरे की लंबाई (Length in Feet):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={roomLength}
                        onChange={(e) => setRoomLength(parseFloat(e.target.value) || 0)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">फ़ीट (Ft)</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      कमरे की चौड़ाई (Width in Feet):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={roomWidth}
                        onChange={(e) => setRoomWidth(parseFloat(e.target.value) || 0)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">फ़ीट (Ft)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    कुल एरिया (Total Area in Sq.Ft):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={directAreaSqFt}
                      onChange={(e) => setDirectAreaSqFt(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">Sq.Ft</span>
                  </div>
                </div>
              )}

              {/* Area Quick Calculator summary */}
              <div className="p-3 bg-teal-50/80 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-900/60 flex items-center justify-between text-xs">
                <span className="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-teal-600" />
                  शुद्ध फर्श एरिया (Net Floor Area):
                </span>
                <span className="font-black text-teal-900 dark:text-teal-200 text-sm">
                  {calculatedMetrics.netArea} Sq.Ft (वर्ग फ़ीट)
                </span>
              </div>
            </div>

            {/* Step 2: Tile & Marble Selection & Wastage */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="w-7 h-7 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  टाइल्स / मार्बल साइज एवं वेस्टेज मार्जिन (Size &amp; Wastage)
                </h3>
              </div>

              {/* Size dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  टाइल्स या मार्बल साइज चुनें (Select Tile / Slab Dimension):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TILE_SIZES.map((sz) => (
                    <button
                      key={sz.id}
                      onClick={() => handleTileSizeChange(sz.id)}
                      className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                        selectedSizeId === sz.id
                          ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-500 ring-2 ring-teal-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                          {sz.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          1 टाइल = {sz.sqftPerTile} Sq.Ft | 1 बॉक्स = {sz.sqftPerBox} Sq.Ft ({sz.tilesPerBox} पीस)
                        </div>
                      </div>
                      {selectedSizeId === sz.id && (
                        <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tile Price & Wastage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    अनुमानित दर (Tile / Marble Rate per Sq.Ft):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={customTilePricePerSqFt}
                      onChange={(e) => setCustomTilePricePerSqFt(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-12 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">/ sq.ft</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    कैटिंग वेस्टेज % (Cut Wastage Margin):
                  </label>
                  <select
                    value={patternWastagePercent}
                    onChange={(e) => setPatternWastagePercent(parseFloat(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value={5}>5% (सीधा बिछाव - Straight Laying)</option>
                    <option value={8}>8% (मानक कटिंग - Recommended Standard)</option>
                    <option value={10}>10% (तिरछा / Diagonal Laying)</option>
                    <option value={12}>12% (हेरिंगबोन / Border Pattern Cuts)</option>
                    <option value={15}>15% (कॉम्प्लेक्स कर्व कटिंग - Large Slabs)</option>
                  </select>
                </div>
              </div>

              {/* Skirting Toggle */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSkirting}
                    onChange={(e) => setIncludeSkirting(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600"
                  />
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    दीवार के किनारे स्कर्टिंग जोड़ें (Include Perimeter Wall Skirting)
                  </span>
                </label>
                {includeSkirting && (
                  <div className="flex items-center gap-3 pl-6 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">स्कर्टिंग ऊंचाई:</span>
                    <button
                      onClick={() => setSkirtingHeightInches(4)}
                      className={`px-2.5 py-1 rounded-lg font-bold border ${
                        skirtingHeightInches === 4
                          ? 'bg-teal-500 text-white border-teal-600'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      4 इंच (Standard)
                    </button>
                    <button
                      onClick={() => setSkirtingHeightInches(6)}
                      className={`px-2.5 py-1 rounded-lg font-bold border ${
                        skirtingHeightInches === 6
                          ? 'bg-teal-500 text-white border-teal-600'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      6 इंच (Tall Border)
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Step 3: "Usama" (Material) & "Mistri" (Labor) Rates */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="w-7 h-7 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  सामान (Materials/Usama) एवं मिस्त्री-लेबर रेट
                </h3>
              </div>

              {/* Adhesive / Cement Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  फिक्सिंग मटेरियल का प्रकार (Fixing Chemical / Mortar):
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    onClick={() => setAdhesiveType('chemical_adhesive')}
                    className={`p-2.5 rounded-xl border font-bold text-center transition ${
                      adhesiveType === 'chemical_adhesive'
                        ? 'bg-teal-500 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    100% केमिकल एडहेसिव (Roff/Tilefix)
                  </button>
                  <button
                    onClick={() => setAdhesiveType('hybrid')}
                    className={`p-2.5 rounded-xl border font-bold text-center transition ${
                      adhesiveType === 'hybrid'
                        ? 'bg-teal-500 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    हाइब्रिड (सीमेंट + एडहेसिव - रिकमेंडेड)
                  </button>
                  <button
                    onClick={() => setAdhesiveType('cement_mortar')}
                    className={`p-2.5 rounded-xl border font-bold text-center transition ${
                      adhesiveType === 'cement_mortar'
                        ? 'bg-teal-500 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    पारंपरिक सीमेंट मसाला (Cement Mortar)
                  </button>
                </div>
              </div>

              {/* Material and Labor rates inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    मिस्त्री टाइल लेबर दर:
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-slate-400">₹</span>
                    <input
                      type="number"
                      value={laborFittingRatePerSqFt}
                      onChange={(e) => setLaborFittingRatePerSqFt(parseFloat(e.target.value) || 0)}
                      className="w-full pl-6 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100"
                    />
                    <span className="absolute right-2 top-2 text-[10px] text-slate-400">/sq.ft</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    एडहेसिव बैग दर (20kg):
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-slate-400">₹</span>
                    <input
                      type="number"
                      value={chemicalAdhesivePrice}
                      onChange={(e) => setChemicalAdhesivePrice(parseFloat(e.target.value) || 0)}
                      className="w-full pl-6 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100"
                    />
                    <span className="absolute right-2 top-2 text-[10px] text-slate-400">/bag</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    सीमेंट बोरी दर (50kg):
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-slate-400">₹</span>
                    <input
                      type="number"
                      value={cementBagPrice}
                      onChange={(e) => setCementBagPrice(parseFloat(e.target.value) || 0)}
                      className="w-full pl-6 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100"
                    />
                    <span className="absolute right-2 top-2 text-[10px] text-slate-400">/bag</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Right Summary Column (5 Cols) - Sticky Estimate Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-6 sticky top-20">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-teal-400" />
                  <h3 className="font-extrabold text-base tracking-tight text-white">
                    अनुमानित बीओक्यू व बजट (Estimated BOQ)
                  </h3>
                </div>
                <span className="text-[10px] px-2.5 py-1 bg-teal-500/20 text-teal-300 font-extrabold rounded-full border border-teal-500/30">
                  2Click Certified
                </span>
              </div>

              {/* Major Box Count Highlight */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                  <span>कुल आवश्यक टाइल्स/मार्बल एरिया:</span>
                  <span className="text-teal-400 font-extrabold">{calculatedMetrics.grossTotalSqFt} Sq.Ft</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-xs text-slate-300 font-extrabold block">कुल आवश्यक बॉक्स (Boxes Needed):</span>
                    <span className="text-[11px] text-slate-400">({currentTileSize.sqftPerBox} sq.ft per box)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-teal-400">{calculatedMetrics.totalBoxesCount}</span>
                    <span className="text-xs text-slate-300 font-bold block">पेटी (Boxes)</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between bg-slate-900/80 p-2 rounded-xl">
                  <span>कुल टाइल्स पीस (Tile Pieces):</span>
                  <span className="font-extrabold text-white">{calculatedMetrics.totalTilesCount} Pieces</span>
                </div>
              </div>

              {/* Detailed Materials (Usama) Breakdown */}
              <div className="space-y-2.5 text-xs">
                <h4 className="font-black text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-teal-400" />
                  सामान सामग्री आवश्यकता (Usama Materials):
                </h4>

                <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  {calculatedMetrics.chemicalBags > 0 && (
                    <div className="flex justify-between items-center text-slate-300">
                      <span>• टाइल फिक्सिंग एडहेसिव (20kg):</span>
                      <span className="font-bold text-white">{calculatedMetrics.chemicalBags} बोरी (Bags)</span>
                    </div>
                  )}
                  {calculatedMetrics.cementBags > 0 && (
                    <div className="flex justify-between items-center text-slate-300">
                      <span>• पीपीसी सीमेंट (50kg):</span>
                      <span className="font-bold text-white">{calculatedMetrics.cementBags} बोरी (Bags)</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-slate-300">
                    <span>• ग्राउट/इपॉक्सी फ़िलर (Grout):</span>
                    <span className="font-bold text-white">{calculatedMetrics.groutKg} Kg</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>• टाइल स्पेसर्स एवं वेज (Spacers):</span>
                    <span className="font-bold text-white">{calculatedMetrics.spacerPacks} पैकेट</span>
                  </div>
                </div>
              </div>

              {/* Cost Summary Breakdown Table */}
              <div className="space-y-2 border-t border-slate-800 pt-4 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>1. टाइल्स/मार्बल सामग्री लागत:</span>
                  <span className="font-bold text-white">₹{calculatedMetrics.totalTilesCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>2. सामान (सीमेंट/केमिकल/ग्राउट) लागत:</span>
                  <span className="font-bold text-white">₹{calculatedMetrics.totalUsamaMaterialsCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>3. मिस्त्री लेबर एवं फिटिंग ठेका:</span>
                  <span className="font-bold text-teal-300">₹{calculatedMetrics.totalMistriLaborCost.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-700 text-base">
                  <span className="font-black text-white">कुल बजट (Grand Total):</span>
                  <span className="font-black text-2xl text-teal-400">
                    ₹{calculatedMetrics.grandTotalBudget.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 text-right">*(जीएसटी एवं परिवहन किराया अतिरिक्त हो सकता है)</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleBookMistriOrShop('area_calculation_quote')}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>दुकानदार से कोटेशन लें व मिस्त्री बुक करें</span>
                </button>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => alert('📄 पीडीएफ एस्टिमेट डाउनलोड हो गया!')}
                    className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-400" />
                    <span>PDF कोटेशन</span>
                  </button>
                  <button
                    onClick={() => {
                      const msg = `2Click Tiles Estimate for ${calculatedMetrics.grossTotalSqFt} sqft:\nBoxes: ${calculatedMetrics.totalBoxesCount}\nBudget: ₹${calculatedMetrics.grandTotalBudget.toLocaleString('en-IN')}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="py-2 bg-emerald-800/60 hover:bg-emerald-700 text-emerald-200 font-bold rounded-xl border border-emerald-700 flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>WhatsApp शेयर</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TOP TILE BRANDS & WHOLESALE SHOPS                                  */}
      {/* ========================================================================= */}
      {activeTab === 'brands_shops' && (
        <div className="space-y-8">
          
          {/* Top Indian Brands Carousel / Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  भारत के प्रमुख टाइल्स एवं मार्बल ब्रांड्स (Empanelled Brands)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  अधिकृत होलसेल डीलर्स एवं कंपनी वारंटी उत्पाद
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {TOP_BRANDS.map((b, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500 transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{b.logo}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {b.rating}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                    {b.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {b.tagline}
                  </p>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] font-extrabold">
                    <span className="text-teal-600 dark:text-teal-400">{b.priceRange}</span>
                    <span className="text-slate-400">{b.warranty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wholesale Shops & Distributors Directory */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  सत्यापित दुकानें एवं थोक सप्लायर्स (Verified Tiles &amp; Marble Shops)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  अपने शहर में होलसेल रेट, जीएसटी बिल व डायरेक्ट डिलीवरी हेतु संपर्क करें
                </p>
              </div>

              {/* City & Search Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="दुकान या ब्रांड खोजें..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 w-44 sm:w-56"
                  />
                </div>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="All">सभी शहर (All Cities)</option>
                  {INDIAN_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredShops.map((shop) => (
                <div
                  key={shop.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={shop.image}
                          alt={shop.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                              {shop.name}
                            </h3>
                            <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0" />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            प्रोप्राइटर: <span className="font-bold text-slate-700 dark:text-slate-300">{shop.owner}</span> | GSTIN: <span className="font-mono text-slate-600 dark:text-slate-400">{shop.gstin}</span>
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black rounded-full text-xs flex items-center gap-1 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {shop.rating}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span className="line-clamp-1">{shop.address}, {shop.city}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {shop.brandsHandled.map((br, bIdx) => (
                        <span key={bIdx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700">
                          {br}
                        </span>
                      ))}
                    </div>

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{shop.discounts}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <a
                      href={`tel:${shop.phone}`}
                      className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>कॉल करें ({shop.phone})</span>
                    </a>
                    <button
                      onClick={() => handleBookMistriOrShop(shop.name)}
                      className="px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs rounded-xl hover:opacity-90 transition"
                    >
                      थोक दर पूछताछ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MISTRI & LABOUR CONTRACTORS                                        */}
      {/* ========================================================================= */}
      {activeTab === 'mistri_labour' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                टाइल्स एवं मार्बल मिस्त्री - लेबर ठेकेदार (Mistri &amp; Fitter Directory)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                2Click सत्यापित अनुभवी मिस्त्री टीम, इपॉक्सी पॉलिशिंग एवं लेज़र कटिंग विशेषज्ञ
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All">सभी शहर (All Cities)</option>
                {INDIAN_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredMistri.map((m) => (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-md flex flex-col justify-between space-y-4 hover:border-teal-500 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                        {m.name}
                      </h3>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-bold">
                        {m.role}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black rounded-full text-xs flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {m.rating}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <p>📍 शहर: <span className="font-bold text-slate-800 dark:text-slate-200">{m.city}</span> | अनुभव: <span className="font-bold text-slate-800 dark:text-slate-200">{m.experienceYears} साल</span></p>
                    <p>👷 लेबर टीम: <span className="font-bold text-slate-800 dark:text-slate-200">{m.teamSize}</span></p>
                  </div>

                  {/* Standard Rates */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">• फर्श टाइल फिटिंग:</span>
                      <span className="font-bold text-teal-700 dark:text-teal-300">₹{m.rates.floorTilePerSqft} / sq.ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">• बड़े स्लैब (2x4 GVT):</span>
                      <span className="font-bold text-teal-700 dark:text-teal-300">₹{m.rates.gvtLargeSlabPerSqft} / sq.ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">• मार्बल फिक्सिंग &amp; पॉलिश:</span>
                      <span className="font-bold text-teal-700 dark:text-teal-300">₹{m.rates.marbleFittingPerSqft} / sq.ft</span>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">विशेषताएं (Specialties):</span>
                    <div className="flex flex-wrap gap-1">
                      {m.specialties.map((sp, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-[10px] font-bold rounded-lg border border-teal-200 dark:border-teal-800">
                          ✓ {sp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <a
                    href={`tel:${m.phone}`}
                    className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>मिस्त्री कॉल करें</span>
                  </a>
                  <button
                    onClick={() => handleBookMistriOrShop(m.name)}
                    className="px-3 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs rounded-xl hover:opacity-90 transition"
                  >
                    ठेका बुक करें
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking / Quotation Request Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                कोटेशन एवं मिस्त्री बुकिंग फॉर्म
              </h3>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              लक्ष्य: <span className="font-bold text-teal-600 dark:text-teal-400">{bookingTarget || '2Click Tiles Service'}</span>
            </p>

            {bookingSuccessMsg ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl text-emerald-800 dark:text-emerald-300 font-bold text-xs text-center">
                {bookingSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">आपका नाम (Your Name):</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. अमित कुमार"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">मोबाइल नंबर (Phone Number):</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">स्थान / शहर (Location / City):</label>
                  <input
                    type="text"
                    defaultValue={selectedCity}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-teal-500/20 transition"
                  >
                    बुकिंग रिक्वेस्ट भेजें
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
