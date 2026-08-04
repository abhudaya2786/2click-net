import React, { useState } from 'react';
import { useFullscreen } from '../context/FullscreenContext';
import { AddCustomItemModal, CustomItemPayload } from './AddCustomItemModal';
import { VisualItemCard } from './VisualItemCard';
import {
  Compass,
  Sparkles,
  Check,
  Plus,
  Minus,
  Layers,
  ShoppingBag,
  Palette,
  Maximize2,
  Eye,
  Grid,
  Box,
  Sliders,
  Download,
  Send,
  CheckCircle2,
  Zap,
  Award,
  Info,
  X,
  ChevronRight,
  RefreshCw,
  Sun,
  Moon,
  FileText,
  Lightbulb,
  Printer,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

// Types for Customization Engine
export type UnitType = 'kitchen' | 'wardrobe' | 'tv_unit' | 'false_ceiling' | 'bathroom';

export type CarcassMaterial = 'Commercial Ply' | 'BWP Marine Plywood (IS:710)' | 'HDMR Board' | 'Particle Board';
export type SurfaceFinish = '1mm High-Pressure Laminate' | '2mm Anti-Scratch Acrylic' | 'Natural Teak Veneer with PU Polish' | 'Lacquered Glass';
export type HardwareBrand = 'Standard Soft-Close' | 'Hettich Germany' | 'Hafele' | 'Ebco Systems';
export type CountertopType = 'Quartz Stone (18mm Nano Quartz)' | 'Jet Black Granite Slab' | 'Profile LED Channel' | 'Wooden Louvered Panels' | 'Metallic Fluted Panels';

export interface RoomUnitConfig {
  id: UnitType;
  title: string;
  hindiTitle: string;
  category: string;
  defaultAreaSqft: number;
  baseRatePerSqft: number;
  carcass: CarcassMaterial;
  finish: SurfaceFinish;
  hardware: HardwareBrand;
  countertop: CountertopType;
  selectedUpgrades: string[];
  swatchColor: string;
  imageUrl: string;
}

export interface UpgradeOption {
  id: string;
  name: string;
  category: string;
  priceINR: number;
  description: string;
  applicableUnits: UnitType[];
}

const AVAILABLE_UPGRADES: UpgradeOption[] = [
  {
    id: 'upg-led-sensor',
    name: 'Smart Sensor LED Profile Lighting',
    category: 'Lighting',
    priceINR: 4500,
    description: 'Motion activated under-cabinet diffuse warm white 3000K LED channel strip',
    applicableUnits: ['kitchen', 'wardrobe', 'tv_unit', 'bathroom', 'false_ceiling']
  },
  {
    id: 'upg-cutlery-organizer',
    name: 'Cutlery Organizer & Spice Tray Insert',
    category: 'Accessories',
    priceINR: 3200,
    description: 'Stainless steel 304 adjustable cutlery divider with spice jar rack',
    applicableUnits: ['kitchen']
  },
  {
    id: 'upg-magic-corner',
    name: 'Magic Corner Carousel Pull-Out System',
    category: 'Hardware',
    priceINR: 14500,
    description: 'Heavy duty chrome basket blind corner pull-out carousel for maximum storage',
    applicableUnits: ['kitchen']
  },
  {
    id: 'upg-pantry-tall',
    name: 'Pantry Tall Unit Pull-Out (6 Wire Baskets)',
    category: 'Hardware',
    priceINR: 22000,
    description: 'Full height soft-close pantry pull-out frame with 6 German chrome wire baskets',
    applicableUnits: ['kitchen']
  },
  {
    id: 'upg-blum-hinges',
    name: 'Soft-Close Blum Motion Hinges Upgrade',
    category: 'Hardware',
    priceINR: 6800,
    description: 'Austrian Blumotion 110-degree clip-top soft-close concealed hinges',
    applicableUnits: ['kitchen', 'wardrobe', 'tv_unit', 'bathroom']
  },
  {
    id: 'upg-oven-cutout',
    name: 'Built-in Microwave & Oven Cutout Frame',
    category: 'Carpentry',
    priceINR: 5500,
    description: 'Reinforced heat resistant frame with rear ventilation for built-in appliances',
    applicableUnits: ['kitchen', 'tv_unit']
  },
  {
    id: 'upg-ss-sink',
    name: 'Anti-Scratch SS304 Sink & Pull-down Faucet',
    category: 'Plumbing',
    priceINR: 8900,
    description: 'Single bowl handmade 1.2mm SS304 satin sink with 360-degree brass sprayer faucet',
    applicableUnits: ['kitchen', 'bathroom']
  },
  {
    id: 'upg-brass-fluting',
    name: 'Profile Handle Fluting & Gold Brass Trim',
    category: 'Aesthetics',
    priceINR: 4200,
    description: 'Anodized gold champagne brass profile handles and fluted edge banding',
    applicableUnits: ['wardrobe', 'tv_unit', 'bathroom']
  },
  {
    id: 'upg-sensor-mirror',
    name: 'Anti-Fog LED Touch Sensor Vanity Mirror',
    category: 'Bathroom',
    priceINR: 6500,
    description: 'Dimmable dual-color LED backlight with heated anti-fog touch demister pad',
    applicableUnits: ['bathroom']
  }
];

export const InteriorStudio: React.FC = () => {
  const { openFullscreen } = useFullscreen();

  // Property Configuration
  const [propertyConfig, setPropertyConfig] = useState<string>('3BHK Luxury Apartment');
  const [activeUnit, setActiveUnit] = useState<UnitType>('kitchen');
  const [previewMode, setPreviewMode] = useState<'3d_visual' | '2d_map'>('3d_visual');
  const [activePresetTheme, setActivePresetTheme] = useState<string>('Royal Indian Luxury');

  // Camera and Lighting controls for 3D Preview
  const [cameraAngle, setCameraAngle] = useState<'perspective' | 'front' | 'isometric'>('perspective');
  const [underCabinetLightsOn, setUnderCabinetLightsOn] = useState<boolean>(true);
  const [coveLightingOn, setCoveLightingOn] = useState<boolean>(true);
  
  // Customization state for each unit
  const [unitConfigs, setUnitConfigs] = useState<Record<UnitType, RoomUnitConfig>>({
    kitchen: {
      id: 'kitchen',
      title: 'Modular Kitchen (L-Shape / Parallel)',
      hindiTitle: 'मॉड्यूलर किचन',
      category: 'Kitchen',
      defaultAreaSqft: 120,
      baseRatePerSqft: 1450,
      carcass: 'BWP Marine Plywood (IS:710)',
      finish: '2mm Anti-Scratch Acrylic',
      hardware: 'Hettich Germany',
      countertop: 'Quartz Stone (18mm Nano Quartz)',
      selectedUpgrades: ['upg-led-sensor', 'upg-cutlery-organizer', 'upg-magic-corner'],
      swatchColor: '#0f766e', // Emerald Teal Gloss
      imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
    },
    wardrobe: {
      id: 'wardrobe',
      title: 'Bedroom Wardrobe (Sliding / Walk-In)',
      hindiTitle: 'बेडरूम अलमारी',
      category: 'Bedroom',
      defaultAreaSqft: 90,
      baseRatePerSqft: 1350,
      carcass: 'HDMR Board',
      finish: 'Natural Teak Veneer with PU Polish',
      hardware: 'Hafele',
      countertop: 'Wooden Louvered Panels',
      selectedUpgrades: ['upg-led-sensor', 'upg-brass-fluting'],
      swatchColor: '#78350f', // Warm Amber Teak
      imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80'
    },
    tv_unit: {
      id: 'tv_unit',
      title: 'Living Room TV Console & Feature Wall',
      hindiTitle: 'लिविंग रूम टीवी यूनिट',
      category: 'Living',
      defaultAreaSqft: 75,
      baseRatePerSqft: 1200,
      carcass: 'Commercial Ply',
      finish: 'Lacquered Glass',
      hardware: 'Ebco Systems',
      countertop: 'Metallic Fluted Panels',
      selectedUpgrades: ['upg-led-sensor', 'upg-oven-cutout'],
      swatchColor: '#1e293b', // Slate Dark
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    },
    false_ceiling: {
      id: 'false_ceiling',
      title: 'False Ceiling & Acoustic Cove Lighting',
      hindiTitle: 'फॉल्स सीलिंग',
      category: 'Ceiling',
      defaultAreaSqft: 350,
      baseRatePerSqft: 130,
      carcass: 'Commercial Ply',
      finish: '1mm High-Pressure Laminate',
      hardware: 'Standard Soft-Close',
      countertop: 'Profile LED Channel',
      selectedUpgrades: ['upg-led-sensor'],
      swatchColor: '#f8fafc', // Soft Ivory
      imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
    },
    bathroom: {
      id: 'bathroom',
      title: 'Bathroom Quartz Vanity & Mirror Cabinet',
      hindiTitle: 'बाथरुम वैनिटी',
      category: 'Bathroom',
      defaultAreaSqft: 35,
      baseRatePerSqft: 1650,
      carcass: 'BWP Marine Plywood (IS:710)',
      finish: '2mm Anti-Scratch Acrylic',
      hardware: 'Hettich Germany',
      countertop: 'Quartz Stone (18mm Nano Quartz)',
      selectedUpgrades: ['upg-sensor-mirror', 'upg-ss-sink'],
      swatchColor: '#334155', // Charcoal Polish
      imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
    }
  });

  // Active Contractor Enquiry Modal State
  const [enquiryModalOpen, setEnquiryModalOpen] = useState<boolean>(false);
  const [enquirySuccessToast, setEnquirySuccessToast] = useState<string | null>(null);

  // Custom Line Items with Image Attachments
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [customInteriorItems, setCustomInteriorItems] = useState<Array<{
    id: string;
    title: string;
    category: string;
    priceINR: number;
    unit: string;
    quantity: number;
    brandName: string;
    imageUrl: string;
    isActive: boolean;
  }>>([
    {
      id: 'INT-ITEM-1',
      title: 'Modular Acrylic Shutter Door Panel',
      category: 'Kitchen & Shutters',
      priceINR: 18500,
      unit: 'Sq.Ft / Panel',
      quantity: 1,
      brandName: 'Rehau German Edging',
      imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80',
      isActive: true
    },
    {
      id: 'INT-ITEM-2',
      title: 'Fluted Teak Louver Panel Backdrop',
      category: 'Living & Accent',
      priceINR: 24000,
      unit: 'Panels',
      quantity: 2,
      brandName: 'Asian Paints Woodtech',
      imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80',
      isActive: true
    }
  ]);

  const handleAddCustomInteriorItem = (payload: CustomItemPayload) => {
    const newItem = {
      id: payload.id,
      title: payload.title,
      category: payload.category || 'Custom Interior Fixture',
      priceINR: payload.priceINR,
      unit: payload.unit || 'Nos',
      quantity: payload.quantity || 1,
      brandName: payload.brandName || 'Custom Craftsman',
      imageUrl: payload.imageUrl,
      isActive: true
    };
    setCustomInteriorItems(prev => [newItem, ...prev]);
  };

  const handleRemoveInteriorItem = (id: string) => {
    setCustomInteriorItems(prev => prev.filter(item => item.id !== id));
  };

  // Helper to calculate price adjustments based on materials
  const getCarcassCostAdj = (carcass: CarcassMaterial): number => {
    switch (carcass) {
      case 'BWP Marine Plywood (IS:710)': return 220;
      case 'HDMR Board': return 180;
      case 'Particle Board': return -100;
      default: return 0; // Commercial Ply
    }
  };

  const getFinishCostAdj = (finish: SurfaceFinish): number => {
    switch (finish) {
      case '2mm Anti-Scratch Acrylic': return 280;
      case 'Natural Teak Veneer with PU Polish': return 450;
      case 'Lacquered Glass': return 520;
      default: return 0; // 1mm Laminate
    }
  };

  const getHardwareCostAdj = (hardware: HardwareBrand): number => {
    switch (hardware) {
      case 'Hettich Germany': return 160;
      case 'Hafele': return 190;
      case 'Ebco Systems': return 110;
      default: return 0; // Standard
    }
  };

  // Calculate Unit Total Cost
  const calculateUnitCost = (config: RoomUnitConfig) => {
    const baseRate = config.baseRatePerSqft;
    const carcassAdj = getCarcassCostAdj(config.carcass);
    const finishAdj = getFinishCostAdj(config.finish);
    const hardwareAdj = getHardwareCostAdj(config.hardware);

    const effectiveRatePerSqft = baseRate + carcassAdj + finishAdj + hardwareAdj;
    const baseAreaCost = Math.round(effectiveRatePerSqft * config.defaultAreaSqft);

    // Calculate upgrades cost
    const upgradesCost = config.selectedUpgrades.reduce((sum, upgId) => {
      const option = AVAILABLE_UPGRADES.find(u => u.id === upgId);
      return sum + (option ? option.priceINR : 0);
    }, 0);

    return {
      effectiveRatePerSqft,
      baseAreaCost,
      upgradesCost,
      totalUnitCost: baseAreaCost + upgradesCost
    };
  };

  // Calculate Overall Interior Grand Total
  const calculateGrandTotal = () => {
    const unitsTotal = Object.values(unitConfigs).reduce((sum, config) => {
      return sum + calculateUnitCost(config).totalUnitCost;
    }, 0);

    const customTotal = customInteriorItems
      .filter(item => item.isActive)
      .reduce((sum, item) => sum + (item.priceINR * item.quantity), 0);

    return unitsTotal + customTotal;
  };

  const grandTotalINR = calculateGrandTotal();

  // Handle Preset Theme Loading
  const handleApplyPresetTheme = (themeName: string) => {
    setActivePresetTheme(themeName);
    if (themeName === 'Modern Minimalist') {
      setUnitConfigs(prev => ({
        ...prev,
        kitchen: { ...prev.kitchen, finish: '2mm Anti-Scratch Acrylic', swatchColor: '#ffffff', carcass: 'BWP Marine Plywood (IS:710)' },
        wardrobe: { ...prev.wardrobe, finish: '2mm Anti-Scratch Acrylic', swatchColor: '#e2e8f0', carcass: 'HDMR Board' },
        tv_unit: { ...prev.tv_unit, finish: '1mm High-Pressure Laminate', swatchColor: '#f1f5f9' }
      }));
    } else if (themeName === 'Royal Indian Luxury') {
      setUnitConfigs(prev => ({
        ...prev,
        kitchen: { ...prev.kitchen, finish: 'Natural Teak Veneer with PU Polish', swatchColor: '#78350f', carcass: 'BWP Marine Plywood (IS:710)' },
        wardrobe: { ...prev.wardrobe, finish: 'Natural Teak Veneer with PU Polish', swatchColor: '#92400e' },
        tv_unit: { ...prev.tv_unit, finish: 'Lacquered Glass', swatchColor: '#0f172a' }
      }));
    } else if (themeName === 'Urban Industrial') {
      setUnitConfigs(prev => ({
        ...prev,
        kitchen: { ...prev.kitchen, finish: 'Lacquered Glass', swatchColor: '#111827', carcass: 'HDMR Board' },
        wardrobe: { ...prev.wardrobe, finish: '2mm Anti-Scratch Acrylic', swatchColor: '#374151' },
        tv_unit: { ...prev.tv_unit, finish: 'Lacquered Glass', swatchColor: '#1e293b' }
      }));
    } else if (themeName === 'Scandi Wood & Pastel') {
      setUnitConfigs(prev => ({
        ...prev,
        kitchen: { ...prev.kitchen, finish: '1mm High-Pressure Laminate', swatchColor: '#0d9488' },
        wardrobe: { ...prev.wardrobe, finish: '1mm High-Pressure Laminate', swatchColor: '#d97706' },
        tv_unit: { ...prev.tv_unit, finish: '1mm High-Pressure Laminate', swatchColor: '#f59e0b' }
      }));
    }
  };

  // Toggle Upgrade Option for active unit
  const toggleUpgradeOption = (upgradeId: string) => {
    const current = unitConfigs[activeUnit];
    const isSelected = current.selectedUpgrades.includes(upgradeId);
    const updatedUpgrades = isSelected
      ? current.selectedUpgrades.filter(id => id !== upgradeId)
      : [...current.selectedUpgrades, upgradeId];

    setUnitConfigs({
      ...unitConfigs,
      [activeUnit]: {
        ...current,
        selectedUpgrades: updatedUpgrades
      }
    });
  };

  // Current Unit Details
  const activeConfig = unitConfigs[activeUnit];
  const activeCostData = calculateUnitCost(activeConfig);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-violet-600/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
              <Compass className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              AI Modular Interior Studio &amp; Material Customizer
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure modular kitchens, lacquered wardrobes, false ceilings &amp; vanities with 2D floorplan layout maps and 3D visual preview (&quot;कैसा लगेगा&quot; engine).
          </p>
        </div>

        {/* Total Cost & Quotation Trigger */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-2xl shadow-md flex items-center gap-3">
            <div>
              <div className="text-[10px] text-violet-200 uppercase font-black tracking-wider">Total Interior Estimate</div>
              <div className="text-xl font-black">₹{grandTotalINR.toLocaleString('en-IN')}</div>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-1 rounded-lg font-bold">
              Incl. 18% GST
            </span>
          </div>

          <button
            onClick={() => setEnquiryModalOpen(true)}
            className="px-4 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-2xl border border-slate-700 flex items-center gap-2 transition shadow-xs"
          >
            <Download className="w-4 h-4 text-violet-400" />
            <span>Download BOQ PDF / Inquiry</span>
          </button>
        </div>
      </div>

      {/* Preset Interior Themes Bar */}
      <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold shrink-0">
          <Palette className="w-4 h-4 text-amber-500" />
          <span>Quick Preset Themes (&quot;थीम चुनें&quot;):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Royal Indian Luxury', desc: 'Teak Veneer + Brass Trim + Quartz' },
            { name: 'Modern Minimalist', desc: 'High Gloss White Acrylic + LED' },
            { name: 'Urban Industrial', desc: 'Lacquered Charcoal Glass + Louvers' },
            { name: 'Scandi Wood & Pastel', desc: 'Warm Laminate + Fluted Panels' }
          ].map(theme => (
            <button
              key={theme.name}
              onClick={() => handleApplyPresetTheme(theme.name)}
              className={`px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1.5 ${
                activePresetTheme === theme.name
                  ? 'bg-violet-600 text-white border-violet-700 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{theme.name}</span>
              <span className="text-[9px] opacity-75">({theme.desc})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Multi-Room Units Selector (Tab Header Bar) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {(Object.keys(unitConfigs) as UnitType[]).map((unitKey) => {
          const config = unitConfigs[unitKey];
          const isActive = activeUnit === unitKey;
          const unitCost = calculateUnitCost(config).totalUnitCost;

          return (
            <button
              key={unitKey}
              onClick={() => setActiveUnit(unitKey)}
              className={`p-4 rounded-2xl border transition text-left flex flex-col justify-between relative overflow-hidden ${
                isActive
                  ? 'bg-white dark:bg-slate-800 border-violet-500 shadow-md ring-2 ring-violet-500/30'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-violet-600 dark:text-violet-400 tracking-wider">
                  {config.category} Unit
                </span>
                <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                  {config.title}
                </h3>
                <span className="text-[10px] text-slate-500 font-medium block">
                  {config.hindiTitle} • {config.defaultAreaSqft} Sq.Ft
                </span>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  ₹{unitCost.toLocaleString('en-IN')}
                </span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Studio Customizer Workspace (Left Customization Engine + Right 2D/3D Preview Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN: Deep Material-Wise Customization Engine */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">

            {/* Active Unit Title & Area Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-violet-600" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Customizing {activeConfig.title}
                  </h2>
                </div>
                <p className="text-xs text-slate-500">Select material grades, shutter finishes, hardware brands &amp; upgrades</p>
              </div>

              {/* Area Sq.Ft Input */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300">Unit Area:</label>
                <input
                  type="number"
                  min="10"
                  max="2000"
                  value={activeConfig.defaultAreaSqft}
                  onChange={(e) => {
                    const newArea = Math.max(10, Number(e.target.value));
                    setUnitConfigs({
                      ...unitConfigs,
                      [activeUnit]: { ...activeConfig, defaultAreaSqft: newArea }
                    });
                  }}
                  className="w-20 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg font-bold text-center"
                />
                <span className="text-slate-500 font-semibold">Sq.Ft</span>
              </div>
            </div>

            {/* Material Dropdown Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

              {/* 1. Core Carcass Material */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>1. Core Carcass Material</span>
                  <span className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold">Structure</span>
                </label>
                <select
                  value={activeConfig.carcass}
                  onChange={(e) => {
                    setUnitConfigs({
                      ...unitConfigs,
                      [activeUnit]: { ...activeConfig, carcass: e.target.value as CarcassMaterial }
                    });
                  }}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-slate-900 dark:text-white"
                >
                  <option value="Commercial Ply">Commercial Ply (MR Grade Base)</option>
                  <option value="BWP Marine Plywood (IS:710)">BWP Marine Plywood IS:710 (+ ₹220/sqft)</option>
                  <option value="HDMR Board">HDMR Board (Action TESA) (+ ₹180/sqft)</option>
                  <option value="Particle Board">Particle Board (- ₹100/sqft)</option>
                </select>
                <p className="text-[10px] text-slate-500">Internal box frame and shelf load-bearing material.</p>
              </div>

              {/* 2. Shutter & Surface Finish */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>2. Shutter &amp; Surface Finish</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Aesthetics</span>
                </label>
                <select
                  value={activeConfig.finish}
                  onChange={(e) => {
                    setUnitConfigs({
                      ...unitConfigs,
                      [activeUnit]: { ...activeConfig, finish: e.target.value as SurfaceFinish }
                    });
                  }}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-slate-900 dark:text-white"
                >
                  <option value="11mm High-Pressure Laminate">1mm High-Pressure Laminate (Standard Matt/SF)</option>
                  <option value="2mm Anti-Scratch Acrylic">2mm Anti-Scratch Acrylic Gloss (+ ₹280/sqft)</option>
                  <option value="Natural Teak Veneer with PU Polish">Natural Teak Veneer with PU Polish (+ ₹450/sqft)</option>
                  <option value="Lacquered Glass">Lacquered Glass with Aluminium (+ ₹520/sqft)</option>
                </select>
                <p className="text-[10px] text-slate-500">External visible door shutter look and touch finish.</p>
              </div>

              {/* 3. Hardware & Fittings Brand */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>3. Hardware &amp; Fittings Brand</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Durability</span>
                </label>
                <select
                  value={activeConfig.hardware}
                  onChange={(e) => {
                    setUnitConfigs({
                      ...unitConfigs,
                      [activeUnit]: { ...activeConfig, hardware: e.target.value as HardwareBrand }
                    });
                  }}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-slate-900 dark:text-white"
                >
                  <option value="Standard Soft-Close">Standard Soft-Close Hinges</option>
                  <option value="Hettich Germany">Hettich Germany (Sensys &amp; Atira) (+ ₹160/sqft)</option>
                  <option value="Hafele">Hafele Germany (Free Flap &amp; Matrix) (+ ₹190/sqft)</option>
                  <option value="Ebco Systems">Ebco Tandem &amp; Carousel (+ ₹110/sqft)</option>
                </select>
                <p className="text-[10px] text-slate-500">Soft-close hinges, drawer runners &amp; lift-up mechanisms.</p>
              </div>

              {/* 4. Countertop & Accessories */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>4. Countertop / Accent Panel</span>
                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">Feature</span>
                </label>
                <select
                  value={activeConfig.countertop}
                  onChange={(e) => {
                    setUnitConfigs({
                      ...unitConfigs,
                      [activeUnit]: { ...activeConfig, countertop: e.target.value as CountertopType }
                    });
                  }}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-slate-900 dark:text-white"
                >
                  <option value="Quartz Stone (18mm Nano Quartz)">Quartz Stone (18mm Nano Quartz)</option>
                  <option value="Jet Black Granite Slab">Jet Black Granite Slab</option>
                  <option value="Profile LED Channel">Profile LED Channel Lighting</option>
                  <option value="Wooden Louvered Panels">Wooden Louvered Panels</option>
                  <option value="Metallic Fluted Panels">Metallic Fluted Panels</option>
                </select>
                <p className="text-[10px] text-slate-500">Top work surface or vertical wall feature material.</p>
              </div>

            </div>

            {/* Shutter Color Swatch Selector for Live 3D Preview */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Palette className="w-4 h-4 text-violet-600" />
                <span>Shutter Finish Color Swatch (Live 3D Preview):</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Emerald Teal', color: '#0f766e' },
                  { name: 'Royal Navy', color: '#1e3a8a' },
                  { name: 'Teak Wood', color: '#78350f' },
                  { name: 'Charcoal Grey', color: '#334155' },
                  { name: 'Champagne Gold', color: '#d97706' },
                  { name: 'High Gloss White', color: '#f8fafc' },
                  { name: 'Ruby Wine', color: '#881337' }
                ].map((swatch) => (
                  <button
                    key={swatch.name}
                    type="button"
                    onClick={() => {
                      setUnitConfigs({
                        ...unitConfigs,
                        [activeUnit]: { ...activeConfig, swatchColor: swatch.color }
                      });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                      activeConfig.swatchColor === swatch.color
                        ? 'ring-2 ring-violet-500 border-violet-600 bg-violet-50 dark:bg-violet-950/40'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-400" style={{ backgroundColor: swatch.color }} />
                    <span className="text-slate-800 dark:text-slate-200">{swatch.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Interactive Line-Item Add/Remove Upgrades */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-violet-600" />
                  5. Optional Line-Item Upgrades (Add / Remove):
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {activeConfig.selectedUpgrades.length} upgrades selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {AVAILABLE_UPGRADES.filter(u => u.applicableUnits.includes(activeUnit)).map((upgrade) => {
                  const isChecked = activeConfig.selectedUpgrades.includes(upgrade.id);

                  return (
                    <div
                      key={upgrade.id}
                      onClick={() => toggleUpgradeOption(upgrade.id)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                        isChecked
                          ? 'bg-violet-50/70 dark:bg-violet-950/40 border-violet-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-violet-600 border-violet-600 text-white' : 'border-slate-400 bg-white dark:bg-slate-800'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            {upgrade.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 pl-6">
                          {upgrade.description}
                        </p>
                      </div>

                      <span className="text-xs font-black text-violet-600 dark:text-violet-400 shrink-0">
                        +₹{upgrade.priceINR.toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 6. Custom Bespoke Interior Line Items (With Image Attachments) */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-600" />
                    6. Bespoke Interior Items &amp; Attachments ({customInteriorItems.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Attach photos of custom shutters, wallpapers, solid teak louvers, or designer lighting
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>➕ Add Custom Item (फोटो जोड़ें)</span>
                </button>
              </div>

              {customInteriorItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {customInteriorItems.map((item) => (
                    <VisualItemCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      category={item.category}
                      priceINR={item.priceINR}
                      unit={item.unit}
                      quantity={item.quantity}
                      brandName={item.brandName}
                      imageUrl={item.imageUrl}
                      isActive={item.isActive}
                      isCustomItem={true}
                      onRemoveItem={handleRemoveInteriorItem}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
                  No custom line items added yet. Click &quot;Add Custom Item&quot; to upload photo and set price.
                </div>
              )}
            </div>

            {/* Active Unit Cost Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
              <div>
                <span className="text-[10px] text-violet-300 font-extrabold uppercase tracking-wider block">
                  {activeConfig.title} Total
                </span>
                <div className="text-lg font-black text-white">
                  ₹{activeCostData.totalUnitCost.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-slate-400 ml-2">
                    (@ ₹{activeCostData.effectiveRatePerSqft}/sqft)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-300">
                <div>Base Area: ₹{activeCostData.baseAreaCost.toLocaleString('en-IN')}</div>
                <div>+ Upgrades: ₹{activeCostData.upgradesCost.toLocaleString('en-IN')}</div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: 2D MAP & 3D VISUAL LOOK PREVIEW ("कैसा लगेगा" Engine) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md space-y-4 sticky top-24">

            {/* Mode Switcher Header: 3D Visual vs 2D Layout Map */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-violet-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  &quot;कैसा लगेगा&quot; Visual Look Engine
                </h3>
              </div>

              {/* View Switcher Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewMode('3d_visual')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                    previewMode === '3d_visual'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3D Look</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('2d_map')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                    previewMode === '2d_map'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>2D Layout Map</span>
                </button>
              </div>
            </div>

            {/* 3D Visual Preview Mode */}
            {previewMode === '3d_visual' && (
              <div className="space-y-4">
                {/* 3D Render Window Box */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 h-80 shadow-inner flex flex-col justify-between p-4">

                  {/* Top Controls Overlay */}
                  <div className="flex justify-between items-center z-10">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-violet-300 border border-violet-500/40 text-[10px] font-black flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Interactive 3D Material Render
                    </span>

                    {/* Camera Angle Switcher */}
                    <div className="flex bg-black/60 backdrop-blur-md rounded-xl border border-slate-700 p-0.5 text-[10px] text-white">
                      <button
                        onClick={() => setCameraAngle('perspective')}
                        className={`px-2 py-1 rounded-lg ${cameraAngle === 'perspective' ? 'bg-violet-600 font-bold' : 'opacity-70'}`}
                      >
                        Perspective
                      </button>
                      <button
                        onClick={() => setCameraAngle('front')}
                        className={`px-2 py-1 rounded-lg ${cameraAngle === 'front' ? 'bg-violet-600 font-bold' : 'opacity-70'}`}
                      >
                        Elevation
                      </button>
                      <button
                        onClick={() => setCameraAngle('isometric')}
                        className={`px-2 py-1 rounded-lg ${cameraAngle === 'isometric' ? 'bg-violet-600 font-bold' : 'opacity-70'}`}
                      >
                        Isometric
                      </button>
                    </div>
                  </div>

                  {/* Simulated 3D Room Visual Render Container */}
                  <div className="absolute inset-0 flex items-center justify-center p-6 overflow-hidden">
                    {/* Background Wall Texture */}
                    <div
                      className="absolute inset-0 opacity-40 transition-all duration-700"
                      style={{
                        backgroundImage: `radial-gradient(circle at 50% 30%, ${activeConfig.swatchColor} 0%, #090d16 100%)`
                      }}
                    />

                    {/* Main Rendered Unit Graphic Representation */}
                    <div
                      className={`relative z-0 w-full max-w-sm transition-all duration-500 p-6 rounded-2xl border border-white/20 shadow-2xl flex flex-col justify-between ${
                        cameraAngle === 'isometric' ? 'rotate-3 skew-y-2' : cameraAngle === 'front' ? 'scale-105' : ''
                      }`}
                      style={{
                        backgroundColor: activeConfig.swatchColor,
                        boxShadow: underCabinetLightsOn ? '0 20px 50px rgba(245, 158, 11, 0.25)' : 'none'
                      }}
                    >
                      {/* Top Wall Cabinets / Ceiling Line */}
                      <div className="flex justify-between items-center gap-2 mb-4 pb-3 border-b border-white/20">
                        <div className="h-10 w-1/3 bg-white/20 rounded-lg border border-white/30 backdrop-blur-xs flex items-center justify-center text-[10px] text-white font-bold">
                          Wall Unit
                        </div>
                        <div className="h-10 w-1/3 bg-white/20 rounded-lg border border-white/30 backdrop-blur-xs flex items-center justify-center text-[10px] text-white font-bold">
                          Glass Display
                        </div>
                        <div className="h-10 w-1/3 bg-white/20 rounded-lg border border-white/30 backdrop-blur-xs flex items-center justify-center text-[10px] text-white font-bold">
                          Tall Cabinet
                        </div>
                      </div>

                      {/* Under-cabinet Profile LED Glow Line */}
                      {underCabinetLightsOn && (
                        <div className="h-2 w-full bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 rounded-full blur-[2px] my-2 animate-pulse" />
                      )}

                      {/* Countertop Slab Render */}
                      <div className="h-5 w-full bg-slate-900 border-t-2 border-amber-400 rounded-sm my-2 flex items-center justify-between px-3 text-[9px] text-amber-200 font-mono">
                        <span>{activeConfig.countertop}</span>
                        <span>{activeConfig.hardware}</span>
                      </div>

                      {/* Base Drawer Modules */}
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="h-12 bg-black/40 rounded-lg border border-white/10 p-2 flex flex-col justify-between">
                          <span className="text-[8px] text-white/70">Cutlery</span>
                          <div className="h-1 w-full bg-white/40 rounded-full" />
                        </div>
                        <div className="h-12 bg-black/40 rounded-lg border border-white/10 p-2 flex flex-col justify-between">
                          <span className="text-[8px] text-white/70">Tandem Box</span>
                          <div className="h-1 w-full bg-white/40 rounded-full" />
                        </div>
                        <div className="h-12 bg-black/40 rounded-lg border border-white/10 p-2 flex flex-col justify-between">
                          <span className="text-[8px] text-white/70">Pantry Carousel</span>
                          <div className="h-1 w-full bg-white/40 rounded-full" />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Bottom Lighting & Spec Overlay Controls */}
                  <div className="z-10 flex justify-between items-end text-white text-[10px]">
                    <div className="bg-black/60 backdrop-blur-md p-2 rounded-xl border border-slate-700 space-y-0.5">
                      <div className="font-bold text-violet-300">{activeConfig.finish}</div>
                      <div className="text-slate-400">{activeConfig.carcass}</div>
                    </div>

                    {/* Lighting Toggles */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setUnderCabinetLightsOn(!underCabinetLightsOn)}
                        className={`px-2.5 py-1.5 rounded-xl border font-bold transition flex items-center gap-1 ${
                          underCabinetLightsOn
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <Zap className="w-3 h-3" />
                        <span>Profile LED {underCabinetLightsOn ? 'ON' : 'OFF'}</span>
                      </button>

                      <button
                        onClick={() => setCoveLightingOn(!coveLightingOn)}
                        className={`px-2.5 py-1.5 rounded-xl border font-bold transition flex items-center gap-1 ${
                          coveLightingOn
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <Sun className="w-3 h-3" />
                        <span>Cove Lighting</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Material Spec Callout Summary */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white">
                    <span>Selected Material Specifications</span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono">Verified B2B Grade</span>
                  </div>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px] list-disc list-inside">
                    <li><strong className="text-slate-900 dark:text-white">Carcass:</strong> {activeConfig.carcass}</li>
                    <li><strong className="text-slate-900 dark:text-white">Finish:</strong> {activeConfig.finish}</li>
                    <li><strong className="text-slate-900 dark:text-white">Hardware:</strong> {activeConfig.hardware}</li>
                    <li><strong className="text-slate-900 dark:text-white">Countertop:</strong> {activeConfig.countertop}</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 2D Floor Plan Layout Map Mode */}
            {previewMode === '2d_map' && (
              <div className="space-y-4">
                <div className="relative rounded-2xl bg-slate-900 border border-slate-700 p-6 h-80 flex flex-col justify-between text-white text-xs">

                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-bold text-violet-300 flex items-center gap-1.5">
                      <Grid className="w-4 h-4 text-violet-400" />
                      2D Architectural Layout Map
                    </span>
                    <span className="text-[10px] bg-slate-800 px-2.5 py-1 rounded text-slate-300 font-mono">
                      {activeConfig.defaultAreaSqft} Sq.Ft Layout
                    </span>
                  </div>

                  {/* Architectural Blueprint Vector Map Drawing */}
                  <div className="my-auto border-2 border-dashed border-violet-500/50 rounded-2xl p-4 bg-slate-950/80 space-y-3">
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>◄ Wall Length: {Math.round(Math.sqrt(activeConfig.defaultAreaSqft) * 1.3)} Feet ►</span>
                      <span>Clearance: 4.5 Feet</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                      <div className="p-3 bg-violet-900/40 border border-violet-500 rounded-xl text-violet-200">
                        Base Cabinet A<br />(Sink Unit)
                      </div>
                      <div className="p-3 bg-violet-900/40 border border-violet-500 rounded-xl text-violet-200">
                        Base Cabinet B<br />(Tandem Drawers)
                      </div>
                      <div className="p-3 bg-violet-900/40 border border-violet-500 rounded-xl text-violet-200">
                        Base Cabinet C<br />(Corner Carousel)
                      </div>
                      <div className="p-3 bg-indigo-900/40 border border-indigo-500 rounded-xl text-indigo-200">
                        Tall Pantry<br />(6 Baskets)
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-emerald-400 font-mono pt-1">
                      <span>⚡ Electrical Conduit Points: 4 Nos</span>
                      <span>🚰 Water Inlet &amp; Drain Point</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 flex justify-between items-center">
                    <span>Scale 1:50 Architectural Plan</span>
                    <span className="text-violet-400 font-bold">Auto CAD Export Ready</span>
                  </div>

                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white">
                    Layout Map Highlights:
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Designed according to ergonomic work triangle standards for maximum efficiency. Includes pre-marked electrical sockets, plumbing drainage conduits, and soft-close shutter swing allowances.
                  </p>
                </div>
              </div>
            )}

            {/* Total Quotation Summary Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white space-y-3">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2 text-xs">
                <span className="font-bold text-slate-300">Complete Home Interior BOQ</span>
                <span className="text-amber-400 font-bold">5 Modular Rooms</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                {Object.values(unitConfigs).map(c => (
                  <div key={c.id} className="flex justify-between items-center">
                    <span>{c.title} ({c.defaultAreaSqft} sqft):</span>
                    <span className="font-bold text-white">₹{calculateUnitCost(c).totalUnitCost.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-700 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-violet-300 uppercase font-black block">Grand Total</span>
                  <div className="text-xl font-black text-amber-400">
                    ₹{grandTotalINR.toLocaleString('en-IN')}
                  </div>
                </div>

                <button
                  onClick={() => setEnquiryModalOpen(true)}
                  className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Contractor Inquiry</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Download BOQ / Send Contractor Inquiry Modal */}
      {enquiryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl max-w-lg w-full border border-violet-500 shadow-2xl space-y-5 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Get Interior Contractor Quotes &amp; BOQ
                </h3>
              </div>
              <button onClick={() => setEnquiryModalOpen(null as any)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 space-y-2">
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Property: {propertyConfig}
              </div>
              <div className="text-base font-black text-violet-600 dark:text-violet-400">
                Total Estimate: ₹{grandTotalINR.toLocaleString('en-IN')} (Incl. GST)
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Includes detailed breakdown for Modular Kitchen, Bedroom Wardrobes, False Ceilings, TV Unit &amp; Bath Vanities.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEnquiryModalOpen(false);
                setEnquirySuccessToast(`Interior BOQ Inquiry sent successfully! Verified contractors will contact you with site measurement dates.`);
                setTimeout(() => setEnquirySuccessToast(null), 5000);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  defaultValue="Anand Kumar"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    defaultValue="+91 98765 43210"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">City / Location</label>
                  <input
                    type="text"
                    required
                    defaultValue="Bengaluru"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEnquiryModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-md"
                >
                  Confirm &amp; Send Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification Toast */}
      {enquirySuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-emerald-900 text-white p-4 rounded-2xl border border-emerald-500 shadow-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="font-semibold">{enquirySuccessToast}</p>
          </div>
          <button onClick={() => setEnquirySuccessToast(null)} className="p-1 hover:bg-emerald-800 rounded-lg">
            <X className="w-4 h-4 text-emerald-300" />
          </button>
        </div>
      )}

      {/* Add Custom Interior Item Modal */}
      <AddCustomItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleAddCustomInteriorItem}
        moduleName="Interior Studio"
      />

    </div>
  );
};
