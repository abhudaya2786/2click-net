import React, { useState } from 'react';
import {
  Paintbrush,
  Tag,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Phone,
  MessageSquare,
  FileText,
  Download,
  Store,
  Truck,
  Building2,
  Sparkles,
  Calculator,
  Eye,
  ExternalLink,
  ChevronRight,
  ShoppingBag,
  Star,
  Zap,
  Info,
  Droplets,
  Layers,
  MapPin,
  Share2,
  ArrowRight,
  Check,
  Award,
  DollarSign
} from 'lucide-react';
import { User } from '../types';
import { logAnalyticsEvent } from '../lib/firebase';

interface PaintingMaterialCatalogHubProps {
  currentUser?: User | null;
  onOpenAuth?: () => void;
}

export interface PaintProductItem {
  id: string;
  name: string;
  brand: string;
  category: 'Interior Emulsion' | 'Exterior Weatherproof' | 'Primers & Undercoats' | 'Wall Putty & Finish' | 'Waterproofing' | 'Wood & Metal Enamel' | 'Tools & Accessories';
  finishType: string;
  packSizes: string[]; // e.g. ['1L', '4L', '10L', '20L']
  priceINRPer20L: number;
  priceINRPer1L: number;
  coveragePerLitre: string; // e.g. '140-160 sq.ft/Litre for 2 coats'
  mrpINR: number;
  discountPercent: number;
  warrantyYears: number;
  rating: number;
  inStock: boolean;
  hasComputerTinting: boolean;
  description: string;
  imageUrl: string;
  catalogPdfName: string;
  shadeCardName: string;
}

export interface PaintSupplier {
  id: string;
  name: string;
  companyName: string;
  type: 'Wholesaler / C&F' | 'Authorized Distributor' | 'Super Stockist';
  city: string;
  phone: string;
  whatsappPhone: string;
  gstin: string;
  authorizedBrands: string[];
  minOrderQty: string;
  rating: number;
  verified: boolean;
  address: string;
}

export interface PaintShopkeeper {
  id: string;
  shopName: string;
  ownerName: string;
  city: string;
  area: string;
  phone: string;
  whatsappPhone: string;
  mainBrands: string[];
  hasTintingMachine: boolean;
  deliveryAvailable: boolean;
  rating: number;
  address: string;
  stockStatus: 'In Stock' | 'Fast Delivery';
}

export interface ShadeCardItem {
  code: string;
  name: string;
  hex: string;
  category: string;
  recommendedFor: string;
}

const PAINT_PRODUCTS_DATA: PaintProductItem[] = [
  // Interior Emulsion
  {
    id: 'pnt-01',
    name: 'Asian Paints Royale Luxury Emulsion',
    brand: 'Asian Paints',
    category: 'Interior Emulsion',
    finishType: 'Teflon Soft Sheen / Washable Velvet',
    packSizes: ['1L', '4L', '10L', '20L'],
    priceINRPer1L: 420,
    priceINRPer20L: 7400,
    mrpINR: 9800,
    discountPercent: 24,
    coveragePerLitre: '140 - 160 sq.ft/Litre (2 Coats)',
    warrantyYears: 8,
    rating: 4.9,
    inStock: true,
    hasComputerTinting: true,
    description: 'Teflon surface protector with anti-bacterial protection. Stain washable luxury interior wall paint.',
    imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
    catalogPdfName: 'Royale_Luxury_Emulsion_TDS_2026.pdf',
    shadeCardName: 'Asian_Paints_Royale_ShadeCard.pdf'
  },
  {
    id: 'pnt-02',
    name: 'Berger Silk Glamor High Shine Luxury Emulsion',
    brand: 'Berger Paints',
    category: 'Interior Emulsion',
    finishType: 'Ultra High Gloss Sheen',
    packSizes: ['1L', '4L', '10L', '20L'],
    priceINRPer1L: 395,
    priceINRPer20L: 6950,
    mrpINR: 9200,
    discountPercent: 24,
    coveragePerLitre: '135 - 150 sq.ft/Litre (2 Coats)',
    warrantyYears: 7,
    rating: 4.8,
    inStock: true,
    hasComputerTinting: true,
    description: 'Formulated with 100% acrylic emulsions and ultra-fine pigments for mirror-like smooth silk walls.',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    catalogPdfName: 'Berger_Silk_Glamor_Catalog.pdf',
    shadeCardName: 'Berger_Silk_ShadeCard.pdf'
  },
  {
    id: 'pnt-03',
    name: 'Nerolac Impressions Ultra HD Washable Emulsion',
    brand: 'Nerolac Paints',
    category: 'Interior Emulsion',
    finishType: 'High Definition Soft Sheen',
    packSizes: ['1L', '4L', '10L', '20L'],
    priceINRPer1L: 380,
    priceINRPer20L: 6700,
    mrpINR: 8800,
    discountPercent: 23,
    coveragePerLitre: '140 - 155 sq.ft/Litre (2 Coats)',
    warrantyYears: 7,
    rating: 4.8,
    inStock: true,
    hasComputerTinting: true,
    description: 'Micro-gel technology providing rich color depth and extreme washability against oil & food stains.',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    catalogPdfName: 'Nerolac_Impressions_HD_TDS.pdf',
    shadeCardName: 'Nerolac_Ultra_Shades.pdf'
  },
  {
    id: 'pnt-04',
    name: 'Dulux Velvet Touch Diamond Glo Emulsion',
    brand: 'Dulux',
    category: 'Interior Emulsion',
    finishType: 'Velvet Smooth Gloss',
    packSizes: ['1L', '4L', '10L', '20L'],
    priceINRPer1L: 410,
    priceINRPer20L: 7200,
    mrpINR: 9500,
    discountPercent: 24,
    coveragePerLitre: '130 - 150 sq.ft/Litre (2 Coats)',
    warrantyYears: 8,
    rating: 4.9,
    inStock: true,
    hasComputerTinting: true,
    description: 'Infused with Golden Pearl shimmer particles for walls that glow under warm LED spotlights.',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    catalogPdfName: 'Dulux_Velvet_Touch_Catalog.pdf',
    shadeCardName: 'Dulux_Diamond_ShadeCard.pdf'
  },

  // Exterior Weatherproof
  {
    id: 'pnt-05',
    name: 'Asian Paints Apex Ultima Protek Exterior Emulsion',
    brand: 'Asian Paints',
    category: 'Exterior Weatherproof',
    finishType: 'Lamination Coat Dust Proof',
    packSizes: ['1L', '4L', '10L', '20L'],
    priceINRPer1L: 460,
    priceINRPer20L: 8200,
    mrpINR: 10800,
    discountPercent: 24,
    coveragePerLitre: '55 - 65 sq.ft/Litre (2 Coats)',
    warrantyYears: 10,
    rating: 4.9,
    inStock: true,
    hasComputerTinting: true,
    description: 'Silicone polymer technology resisting heavy monsoon rains, extreme UV heat rays, algae & fungus.',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    catalogPdfName: 'Apex_Ultima_Protek_10Yr_Warranty.pdf',
    shadeCardName: 'Asian_Paints_Apex_Exterior_Shades.pdf'
  },
  {
    id: 'pnt-06',
    name: 'Berger WeatherCoat Long Life 10 Exterior Paint',
    brand: 'Berger Paints',
    category: 'Exterior Weatherproof',
    finishType: 'PU & Acrylic Elastomeric',
    packSizes: ['1L', '4L', '10L', '20L'],
    priceINRPer1L: 440,
    priceINRPer20L: 7850,
    mrpINR: 10200,
    discountPercent: 23,
    coveragePerLitre: '50 - 60 sq.ft/Litre (2 Coats)',
    warrantyYears: 10,
    rating: 4.8,
    inStock: true,
    hasComputerTinting: true,
    description: 'Elastomeric film bridging hairline cracks with high solar heat reflectivity keeping interiors cooler.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    catalogPdfName: 'Berger_WeatherCoat_LongLife_TDS.pdf',
    shadeCardName: 'Berger_Exterior_Palette.pdf'
  },

  // Primers & Undercoats
  {
    id: 'pnt-07',
    name: 'Asian Paints Decoprime Interior Wall Primer (WT)',
    brand: 'Asian Paints',
    category: 'Primers & Undercoats',
    finishType: 'Water-based Primer',
    packSizes: ['1L', '4L', '10L', '20L'],
    priceINRPer1L: 160,
    priceINRPer20L: 2650,
    mrpINR: 3400,
    discountPercent: 22,
    coveragePerLitre: '200 - 220 sq.ft/Litre (1 Coat)',
    warrantyYears: 3,
    rating: 4.8,
    inStock: true,
    hasComputerTinting: false,
    description: 'Superior opacity water thinnable wall primer for new plaster binding & uniform topcoat coverage.',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    catalogPdfName: 'Asian_Paints_Decoprime_TDS.pdf',
    shadeCardName: 'Primer_Technical_Guide.pdf'
  },
  {
    id: 'pnt-08',
    name: 'Nerolac Nextgen Performance Exterior Primer',
    brand: 'Nerolac Paints',
    category: 'Primers & Undercoats',
    finishType: 'Alkali Resistant Exterior Primer',
    packSizes: ['1L', '4L', '10L', '20L'],
    priceINRPer1L: 175,
    priceINRPer20L: 2850,
    mrpINR: 3600,
    discountPercent: 21,
    coveragePerLitre: '180 - 200 sq.ft/Litre (1 Coat)',
    warrantyYears: 3,
    rating: 4.7,
    inStock: true,
    hasComputerTinting: false,
    description: 'Prevents salt efflorescence and alkali damage on fresh exterior cement plaster.',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80',
    catalogPdfName: 'Nerolac_Exterior_Primer_TDS.pdf',
    shadeCardName: 'Nerolac_Primer_Guide.pdf'
  },

  // Wall Putty & Surface Finish
  {
    id: 'pnt-09',
    name: 'Birla White WallCare Waterproof Putty (40kg Bag)',
    brand: 'Birla White',
    category: 'Wall Putty & Finish',
    finishType: 'White Cement Polymer Putty',
    packSizes: ['5kg', '20kg', '40kg Bag'],
    priceINRPer1L: 25,
    priceINRPer20L: 920, // 40kg bag price
    mrpINR: 1180,
    discountPercent: 22,
    coveragePerLitre: '16 - 20 sq.ft/kg (2 Coats)',
    warrantyYears: 5,
    rating: 4.9,
    inStock: true,
    hasComputerTinting: false,
    description: 'HP Polymer formula preventing flaking & peeling. Provides marble white smooth surface for paints.',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    catalogPdfName: 'Birla_White_WallCare_Putty_TDS.pdf',
    shadeCardName: 'Birla_White_Putty_Guide.pdf'
  },

  // Waterproofing
  {
    id: 'pnt-10',
    name: 'Dr. Fixit Newcoat Raincoat Waterproofing Coating',
    brand: 'Dr. Fixit (Pidilite)',
    category: 'Waterproofing',
    finishType: 'Heavy Elastomeric Acrylic System',
    packSizes: ['1L', '4L', '10L', '20L'],
    priceINRPer1L: 520,
    priceINRPer20L: 9400,
    mrpINR: 12200,
    discountPercent: 23,
    coveragePerLitre: '35 - 40 sq.ft/Litre (2 Coats)',
    warrantyYears: 10,
    rating: 4.9,
    inStock: true,
    hasComputerTinting: true,
    description: '110% elongation coating for roof terraces & exterior parapet walls stopping water seepage completely.',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    catalogPdfName: 'DrFixit_Raincoat_Waterproofing_TDS.pdf',
    shadeCardName: 'DrFixit_Color_Shield.pdf'
  },
  {
    id: 'pnt-11',
    name: 'Asian Paints SmartCare Damp Proof Heavy Duty',
    brand: 'Asian Paints',
    category: 'Waterproofing',
    finishType: 'Fiber Reinforced Waterproofing',
    packSizes: ['1L', '4L', '10L', '20L'],
    priceINRPer1L: 490,
    priceINRPer20L: 8900,
    mrpINR: 11500,
    discountPercent: 22,
    coveragePerLitre: '30 - 35 sq.ft/Litre (2 Coats)',
    warrantyYears: 8,
    rating: 4.9,
    inStock: true,
    hasComputerTinting: false,
    description: 'Reinforced synthetic fibers providing 10m hydrostatic pressure resistance and 10°C thermal cooling.',
    imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
    catalogPdfName: 'SmartCare_DampProof_TDS.pdf',
    shadeCardName: 'SmartCare_Waterproofing_Brochure.pdf'
  },

  // Wood & Metal Enamel
  {
    id: 'pnt-12',
    name: 'Asian Paints Apcolite Premium Gloss Synthetic Enamel',
    brand: 'Asian Paints',
    category: 'Wood & Metal Enamel',
    finishType: 'Mirror High Gloss Enamel',
    packSizes: ['500ml', '1L', '4L', '20L'],
    priceINRPer1L: 340,
    priceINRPer20L: 5900,
    mrpINR: 7600,
    discountPercent: 22,
    coveragePerLitre: '110 - 130 sq.ft/Litre (2 Coats)',
    warrantyYears: 5,
    rating: 4.8,
    inStock: true,
    hasComputerTinting: true,
    description: 'Rust-resistant high gloss synthetic oil enamel for steel gates, window grills, doors & timber furniture.',
    imageUrl: 'https://images.unsplash.com/photo-1585336261026-8f5786392b66?auto=format&fit=crop&w=800&q=80',
    catalogPdfName: 'Apcolite_Synthetic_Enamel_TDS.pdf',
    shadeCardName: 'Apcolite_Enamel_Shades.pdf'
  }
];

const POPULAR_SHADES: ShadeCardItem[] = [
  { code: 'AP-0101', name: 'Silk Pure White', hex: '#FDFBF7', category: 'Neutral Whites', recommendedFor: 'Living Room & Master Bedroom' },
  { code: 'AP-0245', name: 'Royal Ivory Cream', hex: '#F5E6CA', category: 'Warm Earthy', recommendedFor: 'Dining Hall & Hallways' },
  { code: 'BG-1102', name: 'Mystic Cloud Grey', hex: '#E2E8F0', category: 'Modern Modernist', recommendedFor: 'Accent Walls & Offices' },
  { code: 'NR-3420', name: 'Mint Breeze Green', hex: '#DCFCE7', category: 'Pastel Serenity', recommendedFor: 'Bedrooms & Meditation Spot' },
  { code: 'DL-5080', name: 'Oceanic Horizon Blue', hex: '#E0E7FF', category: 'Cool Blues', recommendedFor: 'Kids Room & Ceiling Coves' },
  { code: 'AP-7020', name: 'Blossom Rose Pink', hex: '#FCE7F3', category: 'Soft Pastels', recommendedFor: 'Dressing Room & Vanity' },
  { code: 'IN-4010', name: 'Terracotta Sunrise', hex: '#FFEDD5', category: 'Warm Heritage', recommendedFor: 'Exterior Facade & Balcony' },
  { code: 'SH-8800', name: 'Imperial Sun Gold', hex: '#FEF08A', category: 'Vibrant Warmth', recommendedFor: 'Pooja Room & Festive Walls' }
];

const PAINT_SUPPLIERS: PaintSupplier[] = [
  {
    id: 'SUP-PNT-01',
    name: 'Shree Ji Paint & Chemical Wholesalers',
    companyName: 'Shree Ji Enterprises C&F',
    type: 'Wholesaler / C&F',
    city: 'Lucknow',
    phone: '+91 94150 11223',
    whatsappPhone: '919415011223',
    gstin: '09AABCU9603R1ZM',
    authorizedBrands: ['Asian Paints', 'Berger Paints', 'Dr. Fixit'],
    minOrderQty: '5 x 20L Buckets',
    rating: 4.9,
    verified: true,
    address: 'Transport Nagar, Phase 2, Near Warehousing Complex, Lucknow, UP'
  },
  {
    id: 'SUP-PNT-02',
    name: 'National Paints & Building Hardware Stockist',
    companyName: 'National Trade Links Pvt Ltd',
    type: 'Authorized Distributor',
    city: 'Varanasi',
    phone: '+91 98390 44556',
    whatsappPhone: '919839044556',
    gstin: '09AAACN8871Q1ZH',
    authorizedBrands: ['Nerolac Paints', 'Dulux', 'Birla White'],
    minOrderQty: '₹25,000 Minimum Billing',
    rating: 4.8,
    verified: true,
    address: 'G.T. Road, Near Lahurabir Chauraha, Varanasi, UP'
  },
  {
    id: 'SUP-PNT-03',
    name: 'Shankar Hardware & Paint Super Stockist',
    companyName: 'Shankar Hardware & Infra Supply',
    type: 'Super Stockist',
    city: 'Kanpur',
    phone: '+91 99350 77889',
    whatsappPhone: '919935077889',
    gstin: '09AABFS3341P1ZK',
    authorizedBrands: ['Asian Paints', 'Indigo Paints', 'Shalimar Paints'],
    minOrderQty: '10 Buckets Mix Brand',
    rating: 4.9,
    verified: true,
    address: 'Cooperganj Goods Shed Road, Kanpur, UP'
  }
];

const PAINT_SHOPKEEPERS: PaintShopkeeper[] = [
  {
    id: 'SHOP-PNT-01',
    shopName: 'Gupta Paint Store & Automatic Color Tinting Center',
    ownerName: 'Ramesh Chandra Gupta',
    city: 'Lucknow',
    area: 'Alambagh Market',
    phone: '+91 98391 22334',
    whatsappPhone: '919839122334',
    mainBrands: ['Asian Paints', 'Berger', 'Birla White'],
    hasTintingMachine: true,
    deliveryAvailable: true,
    rating: 4.9,
    address: 'Shop No. 12, Main Chauraha, Opposite Bus Terminal, Alambagh, Lucknow',
    stockStatus: 'In Stock'
  },
  {
    id: 'SHOP-PNT-02',
    shopName: 'Kashi Vishwanath Paint & Hardware House',
    ownerName: 'Vikas Kumar Sharma',
    city: 'Varanasi',
    area: 'Sigra Crossing',
    phone: '+91 94152 33445',
    whatsappPhone: '919415233445',
    mainBrands: ['Nerolac', 'Dulux', 'Dr. Fixit'],
    hasTintingMachine: true,
    deliveryAvailable: true,
    rating: 4.8,
    address: 'Plot 45, Sigra - Mahmoorganj Main Road, Varanasi',
    stockStatus: 'In Stock'
  },
  {
    id: 'SHOP-PNT-03',
    shopName: 'Sri Balaji Paint & Waterproofing Agency',
    ownerName: 'Subhash Balaji',
    city: 'Kanpur',
    area: 'Gumti No. 5',
    phone: '+91 98380 99887',
    whatsappPhone: '919838099887',
    mainBrands: ['Asian Paints', 'Berger', 'Indigo'],
    hasTintingMachine: true,
    deliveryAvailable: true,
    rating: 4.9,
    address: 'Shop 8, Near Central Bank, Gumti No. 5 Market, Kanpur',
    stockStatus: 'In Stock'
  },
  {
    id: 'SHOP-PNT-04',
    shopName: 'Royal Color Hub & Designer Wallpaper Studio',
    ownerName: 'Sanjay Rastogi',
    city: 'Delhi NCR',
    area: 'Noida Sector 63',
    phone: '+91 98110 55443',
    whatsappPhone: '919811055443',
    mainBrands: ['Dulux', 'Asian Paints Royale', 'Pidilite'],
    hasTintingMachine: true,
    deliveryAvailable: true,
    rating: 4.9,
    address: 'C-28, Main Commercial Belt, Sector 63, Noida',
    stockStatus: 'Fast Delivery'
  }
];

export const PaintingMaterialCatalogHub: React.FC<PaintingMaterialCatalogHubProps> = ({
  currentUser,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'brands_price' | 'shade_cards' | 'estimator' | 'suppliers' | 'shopkeepers'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('All');
  const [selectedShade, setSelectedShade] = useState<ShadeCardItem>(POPULAR_SHADES[0]);

  // Estimator State
  const [wallHeightFt, setWallHeightFt] = useState<number>(10);
  const [wallWidthFt, setWallWidthFt] = useState<number>(15);
  const [wallCount, setWallCount] = useState<number>(4);
  const [windowDoorDeductionSqft, setWindowDoorDeductionSqft] = useState<number>(40);
  const [selectedPaintQuality, setSelectedPaintQuality] = useState<'royale' | 'emulsion' | 'distemper'>('royale');

  // Modal / Quote Request State
  const [activeRfqProduct, setActiveRfqProduct] = useState<PaintProductItem | null>(null);
  const [rfqQuantity, setRfqQuantity] = useState<string>('20L Bucket x 2');
  const [rfqNotes, setRfqNotes] = useState<string>('');

  // Calculations for Paint Estimator
  const grossAreaSqft = wallHeightFt * wallWidthFt * wallCount;
  const netAreaSqft = Math.max(0, grossAreaSqft - windowDoorDeductionSqft);

  // Litres needed based on quality
  // Primer (1 coat): 200 sq.ft/L, Putty (2 coats): 18 sq.ft/kg, Paint (2 coats): 140 sq.ft/L
  const primerLitres = Math.ceil(netAreaSqft / 200);
  const puttyKg = Math.ceil(netAreaSqft / 18);
  const paintLitres = Math.ceil(netAreaSqft / 140);

  let costPerLitrePaint = 370; // Royale
  if (selectedPaintQuality === 'emulsion') costPerLitrePaint = 260;
  if (selectedPaintQuality === 'distemper') costPerLitrePaint = 120;

  const estimatedPaintCost = paintLitres * costPerLitrePaint;
  const estimatedPrimerCost = primerLitres * 150;
  const estimatedPuttyCost = puttyKg * 25;
  const totalMaterialEstimate = estimatedPaintCost + estimatedPrimerCost + estimatedPuttyCost;
  const estimatedLaborCost = Math.round(netAreaSqft * 12); // ₹12/sq.ft labor rate
  const grandTotalEstimate = totalMaterialEstimate + estimatedLaborCost;

  // Filtering products
  const filteredProducts = PAINT_PRODUCTS_DATA.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesBrand = selectedBrandFilter === 'All' || p.brand === selectedBrandFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesBrand && matchesSearch;
  });

  const handleOpenRfqModal = (product: PaintProductItem) => {
    setActiveRfqProduct(product);
    logAnalyticsEvent('paint_rfq_modal_opened', {
      product_id: product.id,
      product_name: product.name,
      brand: product.brand
    });
  };

  const handleSendWhatsAppOrder = (phone: string, text: string) => {
    logAnalyticsEvent('paint_order_whatsapp_sent', {
      phone
    });
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDownloadPdf = (pdfName: string) => {
    logAnalyticsEvent('paint_catalog_pdf_downloaded', {
      pdf_name: pdfName
    });
    alert(`Downloading Official Technical Specification PDF & Color Guide: ${pdfName}`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* HEADER HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-400/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Paintbrush className="w-3.5 h-3.5" /> 2Click Painting Materials &amp; Colors Hub
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black rounded-xl">
                GST Verified Wholesalers &amp; Shopkeepers
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              पेंटिंग मैटेरियल कैटलॉग, ब्रांड रेट लिस्ट व दुकानदार डायरेक्ट संपर्क
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Explore category-wise interior emulsions, exterior weatherproof paints, wall putty, primers, and waterproofing coatings. Compare top brand prices (Asian Paints, Berger, Nerolac, Dulux, Pidilite), download technical shade cards, and connect directly with local paint shopkeepers &amp; wholesale distributors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('estimator')}
              className="px-5 py-3.5 bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition hover:scale-102 flex items-center gap-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4" /> paint quantity calculator
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-rose-600 text-white shadow-lg'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Layers className="w-4 h-4" /> Category-Wise Paints ({filteredProducts.length})
          </button>

          <button
            onClick={() => setActiveTab('brands_price')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'brands_price'
                ? 'bg-rose-600 text-white shadow-lg'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Tag className="w-4 h-4" /> Brand Price List (1L - 20L)
          </button>

          <button
            onClick={() => setActiveTab('shade_cards')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'shade_cards'
                ? 'bg-rose-600 text-white shadow-lg'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Eye className="w-4 h-4" /> Digital Shade Cards &amp; Wall Visualizer
          </button>

          <button
            onClick={() => setActiveTab('estimator')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'estimator'
                ? 'bg-rose-600 text-white shadow-lg'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Calculator className="w-4 h-4" /> Paint &amp; Cost Estimator
          </button>

          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'suppliers'
                ? 'bg-rose-600 text-white shadow-lg'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Truck className="w-4 h-4" /> C&amp;F Wholesalers &amp; Distributors ({PAINT_SUPPLIERS.length})
          </button>

          <button
            onClick={() => setActiveTab('shopkeepers')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'shopkeepers'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Store className="w-4 h-4" /> Local Shopkeeper Directory ({PAINT_SHOPKEEPERS.length})
          </button>
        </div>
      </div>

      {/* TAB 1: CATEGORY-WISE PAINTING MATERIAL CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search emulsions, primers, putty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {['All', 'Interior Emulsion', 'Exterior Weatherproof', 'Primers & Undercoats', 'Wall Putty & Finish', 'Waterproofing', 'Wood & Metal Enamel'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Brand Filter */}
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-bold focus:outline-none"
            >
              <option value="All">All Brands</option>
              <option value="Asian Paints">Asian Paints</option>
              <option value="Berger Paints">Berger Paints</option>
              <option value="Nerolac Paints">Nerolac Paints</option>
              <option value="Dulux">Dulux</option>
              <option value="Birla White">Birla White</option>
              <option value="Dr. Fixit (Pidilite)">Dr. Fixit</option>
            </select>
          </div>

          {/* PRODUCTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Image Header with Badges */}
                  <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase backdrop-blur-md">
                        {product.brand}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold backdrop-blur-md">
                        {product.category}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 text-[11px] font-black shadow-lg">
                      {product.warrantyYears} Yrs Warranty
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        {product.rating}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Specs Pills */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1.5 font-mono">
                      <div className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span className="text-slate-500 font-sans">Finish:</span>
                        <span className="font-bold">{product.finishType}</span>
                      </div>
                      <div className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span className="text-slate-500 font-sans">Coverage:</span>
                        <span className="font-bold text-teal-600 dark:text-teal-400">{product.coveragePerLitre}</span>
                      </div>
                    </div>

                    {/* Pack Sizes */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Packs:</span>
                      {product.packSizes.map((size) => (
                        <span
                          key={size}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700"
                        >
                          {size}
                        </span>
                      ))}
                      {product.hasComputerTinting && (
                        <span className="ml-auto px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold border border-purple-500/20">
                          Auto Tinting
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Pricing & Actions */}
                <div className="p-5 pt-0 space-y-3">
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">20L Wholesale Price</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
                          ₹{product.priceINRPer20L.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-400 line-through font-mono">
                          ₹{product.mrpINR.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                          {product.discountPercent}% OFF
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadPdf(product.catalogPdfName)}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
                      title="Download Catalog PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOpenRfqModal(product)}
                      className="py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-rose-400" /> Get Wholesale Quote
                    </button>

                    <button
                      onClick={() => handleSendWhatsAppOrder('919839122334', `Hello, I want to order/enquire about ${product.name} (${product.brand}) for my construction site.`)}
                      className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-white" /> Order WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: BRAND PRICE COMPARISON TABLE */}
      {activeTab === 'brands_price' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-rose-600" />
                Category &amp; Brand Price Comparison Sheet (Indian Market Standard)
              </h2>
              <p className="text-xs text-slate-500">
                Authorized dealer retail prices &amp; bulk bucket rates across top Indian paint brands.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
              Updated GST Included Rates
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-black uppercase text-[10px]">
                  <th className="py-3 px-4">Product &amp; Brand</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Finish &amp; Warranty</th>
                  <th className="py-3 px-4">1 Litre Rate</th>
                  <th className="py-3 px-4">20 Litre Bucket Rate</th>
                  <th className="py-3 px-4">Coverage (sq.ft)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {PAINT_PRODUCTS_DATA.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">{p.name}</div>
                      <div className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">{p.brand}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">
                      {p.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 dark:text-slate-300">{p.finishType}</div>
                      <span className="text-[10px] text-amber-500 font-bold">{p.warrantyYears} Years Warranty</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      ₹{p.priceINRPer1L} / L
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-rose-600 dark:text-rose-400">
                      ₹{p.priceINRPer20L.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {p.coveragePerLitre}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenRfqModal(p)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[11px] font-extrabold transition cursor-pointer"
                      >
                        RFQ Quote
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DIGITAL SHADE CARDS & COLOR WALL VISUALIZER */}
      {activeTab === 'shade_cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SHADE SELECTOR */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-4 lg:col-span-1">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-rose-600" /> Popular Paint Shade Cards
            </h3>
            <p className="text-xs text-slate-500">
              Select architectural colors to preview live on wall canvas.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {POPULAR_SHADES.map((s) => (
                <button
                  key={s.code}
                  onClick={() => setSelectedShade(s)}
                  className={`p-3 rounded-2xl border text-left transition duration-200 cursor-pointer flex flex-col justify-between ${
                    selectedShade.code === s.code
                      ? 'border-rose-500 ring-2 ring-rose-500/30 bg-slate-50 dark:bg-slate-800'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div
                    className="w-full h-12 rounded-xl border border-slate-300 shadow-inner mb-2"
                    style={{ backgroundColor: s.hex }}
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">{s.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{s.code}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* WALL VISUALIZER CANVAS */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md lg:col-span-2 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    Simulated Living Room Accent Wall
                  </h3>
                  <span className="text-xs text-slate-500">
                    Active Shade: <strong>{selectedShade.name}</strong> ({selectedShade.code})
                  </span>
                </div>
                <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs">
                  {selectedShade.hex}
                </span>
              </div>

              {/* Simulated Room Interior */}
              <div className="mt-4 relative h-72 w-full rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-xl flex items-center justify-center transition-all duration-500" style={{ backgroundColor: selectedShade.hex }}>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                
                <div className="relative z-10 p-6 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/20 text-white max-w-md text-center shadow-2xl">
                  <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <h4 className="font-black text-base">{selectedShade.name}</h4>
                  <p className="text-xs text-slate-300 mt-1">Recommended for: {selectedShade.recommendedFor}</p>
                  <div className="mt-3 flex justify-center gap-2 text-[10px] font-mono font-bold">
                    <span className="px-2 py-1 bg-white/20 rounded-lg">High Washability</span>
                    <span className="px-2 py-1 bg-white/20 rounded-lg">Anti-Fungal</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-300">
                Need a physical shade card delivered to your site or architect studio?
              </span>
              <button
                onClick={() => alert(`Shade Card sample book requested for shade: ${selectedShade.name}`)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl transition cursor-pointer"
              >
                Request Free Shade Booklet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PAINT & COST QUANTITY CALCULATOR */}
      {activeTab === 'estimator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* INPUT FORM */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-4 lg:col-span-1">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-rose-600" /> Wall Dimensions &amp; Quality
            </h3>

            <div className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Wall Height (Feet):</label>
                <input
                  type="number"
                  value={wallHeightFt}
                  onChange={(e) => setWallHeightFt(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Wall Width (Feet):</label>
                <input
                  type="number"
                  value={wallWidthFt}
                  onChange={(e) => setWallWidthFt(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Number of Walls:</label>
                <input
                  type="number"
                  value={wallCount}
                  onChange={(e) => setWallCount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Window / Door Deduction (Sq.Ft):</label>
                <input
                  type="number"
                  value={windowDoorDeductionSqft}
                  onChange={(e) => setWindowDoorDeductionSqft(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Paint Finish Quality Grade:</label>
                <select
                  value={selectedPaintQuality}
                  onChange={(e) => setSelectedPaintQuality(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="royale">Royale Luxury Emulsion (₹370/L)</option>
                  <option value="emulsion">Premium Acrylic Emulsion (₹260/L)</option>
                  <option value="distemper">Acrylic Distemper (₹120/L)</option>
                </select>
              </div>
            </div>
          </div>

          {/* CALCULATED ESTIMATE SUMMARY */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md lg:col-span-2 space-y-6 flex flex-col justify-between">
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Calculated Material Requirement &amp; Budget Summary
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                  <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase block">Net Wall Area</span>
                  <span className="text-xl font-black text-rose-950 dark:text-white font-mono">{netAreaSqft} Sq.Ft</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                  <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase block">Paint Required (2 Coats)</span>
                  <span className="text-xl font-black text-teal-950 dark:text-white font-mono">{paintLitres} Litres</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase block">Wall Putty Needed</span>
                  <span className="text-xl font-black text-amber-950 dark:text-white font-mono">{puttyKg} Kg</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase block">Wall Primer Needed</span>
                  <span className="text-xl font-black text-indigo-950 dark:text-white font-mono">{primerLitres} Litres</span>
                </div>
              </div>

              {/* COST BREAKDOWN */}
              <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400 font-sans">Paint Cost ({paintLitres}L @ ₹{costPerLitrePaint}):</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{estimatedPaintCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400 font-sans">Wall Primer Cost ({primerLitres}L):</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{estimatedPrimerCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400 font-sans">Acrylic Wall Putty Cost ({puttyKg}kg):</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{estimatedPuttyCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400 font-sans">Estimated Labor Cost (Putty + 2 Coats @ ₹12/sqft):</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{estimatedLaborCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-300 dark:border-slate-600 text-sm font-black text-rose-600 dark:text-rose-400">
                  <span className="font-sans">Grand Total Estimated Painting Budget:</span>
                  <span>₹{grandTotalEstimate.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => alert(`Exported Paint BOQ Budget Estimate: ₹${grandTotalEstimate}`)}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-extrabold text-xs rounded-2xl shadow-lg transition hover:scale-101 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Paint Quantity &amp; BOQ Cost PDF Report
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: SUPPLIER & DISTRIBUTOR LIST */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-rose-600" /> C&amp;F Wholesalers &amp; Authorized Distributors
            </h2>
            <span className="text-xs text-slate-500 font-mono">Verified GST Stockists</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAINT_SUPPLIERS.map((s) => (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-[10px]">
                        {s.type}
                      </span>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-1">
                        {s.name}
                      </h3>
                      <p className="text-xs text-slate-500">{s.companyName}</p>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1 font-mono">
                    <div className="text-slate-700 dark:text-slate-300">
                      <strong>City:</strong> {s.city}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      <strong>GSTIN:</strong> {s.gstin}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      <strong>MOQ:</strong> {s.minOrderQty}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Authorized Brand Stockist:</span>
                    <div className="flex flex-wrap gap-1">
                      {s.authorizedBrands.map((b) => (
                        <span key={b} className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <a
                    href={`tel:${s.phone}`}
                    className="flex-1 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-rose-400" /> Call Dealer
                  </a>
                  <button
                    onClick={() => handleSendWhatsAppOrder(s.whatsappPhone, `Hello ${s.name}, I need a bulk quote for paint buckets for my site in ${s.city}.`)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-white" /> WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: LOCAL SHOPKEEPER DIRECTORY & CONTACTS */}
      {activeTab === 'shopkeepers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-600" /> Local Paint Shopkeeper &amp; Dukandar Directory
            </h2>
            <span className="text-xs text-slate-500 font-mono">Direct Contact &amp; Computer Color Tinting</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PAINT_SHOPKEEPERS.map((shop) => (
              <div
                key={shop.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-md space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px]">
                        {shop.city} · {shop.area}
                      </span>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-sm mt-1">
                        {shop.shopName}
                      </h3>
                      <p className="text-xs text-slate-500">Propr: {shop.ownerName}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-[11px] space-y-1.5">
                    <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="line-clamp-2">{shop.address}</span>
                    </div>

                    {shop.hasTintingMachine && (
                      <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
                        <Zap className="w-3.5 h-3.5 text-amber-500" /> Automatic Shade Tinting Machine
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Available Paint Brands:</span>
                    <div className="flex flex-wrap gap-1">
                      {shop.mainBrands.map((b) => (
                        <span key={b} className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <a
                    href={`tel:${shop.phone}`}
                    className="w-full py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-rose-400" /> Call {shop.ownerName.split(' ')[0]}
                  </a>
                  <button
                    onClick={() => handleSendWhatsAppOrder(shop.whatsappPhone, `Namaste ${shop.ownerName} ji, I got your shop details from 2Click App. I want to check paint stock availability for my site in ${shop.city}.`)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-white" /> Order via WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RFQ / QUOTE REQUEST MODAL */}
      {activeRfqProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-600" /> Request Wholesale Quote
              </h3>
              <button
                onClick={() => setActiveRfqProduct(null)}
                className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-xs">
              <div className="font-extrabold text-slate-900 dark:text-white">{activeRfqProduct.name}</div>
              <div className="text-slate-500 font-mono mt-0.5">Brand: {activeRfqProduct.brand} · Wholesale Est: ₹{activeRfqProduct.priceINRPer20L}/20L</div>
            </div>

            <div className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Required Quantity &amp; Packaging:</label>
                <input
                  type="text"
                  value={rfqQuantity}
                  onChange={(e) => setRfqQuantity(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  placeholder="e.g., 20L Bucket x 5"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Site Location / Notes:</label>
                <textarea
                  rows={2}
                  value={rfqNotes}
                  onChange={(e) => setRfqNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="Enter project site city, shade code required..."
                />
              </div>
            </div>

            <button
              onClick={() => {
                alert(`Wholesale Quote request for ${activeRfqProduct.name} sent to 2Click verified C&F paint distributors!`);
                setActiveRfqProduct(null);
              }}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg transition"
            >
              Submit RFQ to All Local Distributors
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
