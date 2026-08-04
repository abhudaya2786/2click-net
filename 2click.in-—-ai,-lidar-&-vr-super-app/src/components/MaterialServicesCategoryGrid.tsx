import React, { useState, useEffect } from 'react';
import {
  Sun,
  Zap,
  Building2,
  Paintbrush,
  Droplets,
  Wrench,
  ChevronRight,
  Search,
  CheckCircle2,
  ShoppingBag,
  ExternalLink,
  X,
  Phone,
  MessageSquare,
  ShieldCheck,
  Tag,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  Info,
  BadgePercent,
  Plus,
  PlusCircle,
  Image as ImageIcon,
  Calculator,
  Share2,
  Check,
  DollarSign,
  Store,
  Truck,
  Grid,
  Box,
  Key,
  Shield
} from 'lucide-react';
import { User } from '../types';
import { PlatformFeesPublicCard } from './PlatformFeesPublicCard';

interface MaterialServicesCategoryGridProps {
  currentUser: User | null;
  onOpenAuth?: () => void;
}

export interface SubMaterialItem {
  id: string;
  name: string;
  brand: string;
  specs: string;
  rateINR: number;
  unit: string;
  imageUrl: string;
  tag?: string;
  description: string;
  inStock: boolean;
  supplierRole?: string;
  shopCategory?: string;
}

export interface MainCategory {
  id: string;
  title: string;
  titleHi: string;
  iconName: string;
  badge: string;
  accentColor: string;
  borderColor: string;
  bgGradient: string;
  coverImage: string;
  brandLogos: string[];
  shopCategory?: string;
  defaultSupplierRole?: string;
  subCategories: Array<{
    name: string;
    items: SubMaterialItem[];
  }>;
}

// Preset High Quality Photo Library for Easy Material Addition
export const PRESET_MATERIAL_PHOTOS = [
  { name: 'Solar Panel Board', url: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80' },
  { name: 'Solar Rooftop System', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80' },
  { name: 'Solar Battery / Inverter', url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80' },
  { name: 'Lithium Battery Wall', url: 'https://images.unsplash.com/photo-1558441719-6705166e2106?auto=format&fit=crop&w=600&q=80' },
  { name: 'Electric Wire Coil', url: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80' },
  { name: 'Switch Board / Panel', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80' },
  { name: 'LED Bulb / Lights', url: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=600&q=80' },
  { name: 'Cement Bag', url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Steel TMT Bars', url: 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=600&q=80' },
  { name: 'Red Kiln Bricks', url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80' },
  { name: 'Paint Bucket / Wall', url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80' },
  { name: 'Plumbing Pipes', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' },
  { name: 'Tiles & Marble Floor', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80' },
  { name: 'Black Granite Slab', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80' },
  { name: 'Hardware Locks & Handles', url: 'https://images.unsplash.com/photo-1585336261026-8f5786392b66?auto=format&fit=crop&w=600&q=80' },
  { name: 'Power Drill & Tools', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80' },
  { name: 'Plywood Board & Sheet', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Glass Window & Aluminium', url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Engineer / Architect', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80' }
];

export const INITIAL_MATERIAL_SERVICES_DATA: MainCategory[] = [
  {
    id: 'solar_energy',
    title: 'Solar & Energy Solutions',
    titleHi: 'सोलर पैनल, इनवर्टर, बोर्ड एवं बैटरी',
    iconName: 'Sun',
    badge: 'Govt. 78,000 Subsidy Available',
    accentColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-800',
    bgGradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
    coverImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    brandLogos: ['Tata Power Solar', 'Waaree', 'Adani Solar', 'Luminous', 'Microtek', 'Exide'],
    shopCategory: 'सोलर व रिन्यूएबल एनर्जी मार्ट',
    defaultSupplierRole: 'सोलर डिस्ट्रीब्यूटर एवं ऑथोराइज्ड वेंडर',
    subCategories: [
      {
        name: 'Solar Panels & Mounting Board (सोलर पैनल व बोर्ड)',
        items: [
          {
            id: 'sol-01',
            name: 'Waaree 540W Mono PERC Half-Cut Panel Board',
            brand: 'Waaree Energies',
            specs: '21.5% Efficiency, 25-Year Performance Warranty, Heavy GI Mounting Board Structure Included',
            rateINR: 15800,
            unit: 'Per Panel + Board',
            imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80',
            tag: 'Highest Efficiency',
            description: 'Top grade Mono PERC half-cut solar panel mounted on heavy galvanized iron roof board structure for extreme wind resistance.',
            inStock: true
          },
          {
            id: 'sol-02',
            name: 'Tata Power Solar 3KW On-Grid Rooftop Plant System',
            brand: 'Tata Power',
            specs: 'Includes 3KW Panels, Net Metering Box, DC Wiring Board, Galvanized Frame',
            rateINR: 145000,
            unit: 'Complete 3KW Kit',
            imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
            tag: '₹78,000 Govt Subsidy',
            description: 'Turnkey 3KW solar rooftop system with official net metering application and state DISCOM approval.',
            inStock: true
          },
          {
            id: 'sol-03',
            name: 'Adani Solar Bifacial Dual Glass Module (550W)',
            brand: 'Adani Solar',
            specs: 'Dual Sided Generation (+30% Rear Power Boost), Ultra Glass Board Protection',
            rateINR: 17200,
            unit: 'Per Panel',
            imageUrl: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=600&q=80',
            tag: 'Dual Glass Tech',
            description: 'Bifacial solar glass board module capturing sunlight from both front and ground reflection.',
            inStock: true
          },
          {
            id: 'sol-04',
            name: 'Heavy Galvanized GI Solar Mounting Board Structure (3 Panel Frame)',
            brand: 'Sarkar Solar Accessories',
            specs: 'Rust-proof Hot Dip Galvanized Iron, 30 Degree Tilt Angle Board, Wind Speed 150 kmph',
            rateINR: 4200,
            unit: '3 Panel Board Frame',
            imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80',
            tag: 'Wind-Proof Board',
            description: 'Heavy gauge solar roof frame structure board for secure solar panel elevated mounting.',
            inStock: true
          }
        ]
      },
      {
        name: 'Solar Batteries & Inverters (बैटरी एवं इनवर्टर)',
        items: [
          {
            id: 'bat-01',
            name: 'Luminous NXG 1850 Solar Hybrid Inverter Board',
            brand: 'Luminous',
            specs: '1500VA / 12V-24V Hybrid MPPT Solar Inverter with LCD Monitoring Screen',
            rateINR: 11400,
            unit: 'Piece',
            imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80',
            tag: 'Pure Sine Wave',
            description: 'High efficiency solar hybrid inverter with intelligent load battery charge controller.',
            inStock: true
          },
          {
            id: 'bat-02',
            name: 'Exide Solar C10 Tubular Heavy Duty Battery (150Ah)',
            brand: 'Exide Solar',
            specs: '12V 150Ah C10 Rating, 5-Year Replacement Warranty, Low Maintenance',
            rateINR: 14200,
            unit: 'Piece',
            imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
            tag: '5-Year Warranty',
            description: 'Specialized deep cycle C10 tubular solar battery for high thermal stability in Indian climate.',
            inStock: true
          },
          {
            id: 'bat-03',
            name: 'Microtek Lithium-ion Wall Mounted Solar Battery Storage (48V 100Ah)',
            brand: 'Microtek Solar',
            specs: '4.8kWh LiFePO4 Battery Wall Unit, 10-Year Lifecycle, Smart BMS Interface',
            rateINR: 98000,
            unit: 'Piece',
            imageUrl: 'https://images.unsplash.com/photo-1558441719-6705166e2106?auto=format&fit=crop&w=600&q=80',
            tag: 'Next-Gen LiFePO4',
            description: 'Space-saving wall mounted lithium solar battery with 6000+ deep discharge cycles.',
            inStock: true
          }
        ]
      },
      {
        name: 'Solar DC Wires & Distribution Board (सोलर वायर व एमसी4)',
        items: [
          {
            id: 'solwire-01',
            name: 'Polycab 6 sq.mm UV Protection Solar DC Cable Wire (100m Red+Black)',
            brand: 'Polycab Solar Wire',
            specs: 'Tinned Copper Conductor, Double Insulated XLPO, Rated 1500V DC',
            rateINR: 4800,
            unit: '100m Pair Coil',
            imageUrl: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80',
            tag: '1500V DC Rated',
            description: 'Heavy weather resistant tinned copper DC cable for connecting solar panels to solar inverter.',
            inStock: true
          },
          {
            id: 'solwire-02',
            name: 'Solar AJB/DCDB Distribution Box Board with MC4 Connectors',
            brand: 'Havells Solar Accessories',
            specs: 'IP65 Waterproof Enclosure, 1000V Surge Protection Device (SPD), DC MCB Board',
            rateINR: 2850,
            unit: 'Piece Board',
            imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
            tag: 'IP65 Waterproof',
            description: 'DC safety junction distribution board protecting solar inverter from lightning surges.',
            inStock: true
          }
        ]
      }
    ]
  },
  {
    id: 'electrical_switches',
    title: 'Electrical, Switches, Wires & Bulbs',
    titleHi: 'तार, स्विच बोर्ड, बल्ब एवं एमसीबी',
    iconName: 'Zap',
    badge: '100% Original ISI Marked',
    accentColor: 'text-yellow-600 dark:text-yellow-400',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    bgGradient: 'from-yellow-500/10 via-amber-500/5 to-transparent',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    brandLogos: ['Havells', 'Anchor Panasonic', 'Finolex', 'Polycab', 'Philips', 'Legrand'],
    subCategories: [
      {
        name: 'Electric Wires & Cables (कॉपर वायर एवं केबल)',
        items: [
          {
            id: 'wir-01',
            name: 'Finolex Flame Retardant (FR-LSH) Copper Wire 1.5 sq.mm',
            brand: 'Finolex Cables',
            specs: '100 Meter Coil, 99.97% Pure Electrolytic Copper, Flame Retardant Low Smoke',
            rateINR: 1850,
            unit: '100m Coil',
            imageUrl: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80',
            tag: 'Bestseller Wire',
            description: 'Industry standard house wiring copper cable engineered for heat resistance and safety.',
            inStock: true
          },
          {
            id: 'wir-02',
            name: 'Polycab Maxima Green 2.5 sq.mm Heavy Duty Wire',
            brand: 'Polycab',
            specs: '100 Meter Box, High Current Capacity for Power Sockets & AC Points',
            rateINR: 2750,
            unit: '100m Coil',
            imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
            tag: 'Power Line Grade',
            description: 'High conductivity copper cable ideal for geysers, air conditioners, and kitchen appliances.',
            inStock: true
          }
        ]
      },
      {
        name: 'Modular Switch Boards & Sockets (स्विच बोर्ड व सॉकेट)',
        items: [
          {
            id: 'swi-01',
            name: 'Anchor Roma Classic 8-Module Glass Finish Switch Board',
            brand: 'Anchor Panasonic',
            specs: 'Includes 4 Switches (6A), 2 Sockets (6/16A), 1 Fan Regulator, High Grade Polycarbonate Plate',
            rateINR: 980,
            unit: 'Complete Board',
            imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
            tag: 'Spark Shield',
            description: 'Sleek modular switchboard plate with silver contact switches for long spark-free life.',
            inStock: true
          },
          {
            id: 'swi-02',
            name: 'Havells Crabtree Smart Touch Feather-Touch Switch Panel Board',
            brand: 'Havells',
            specs: 'Wi-Fi Enabled Smart Board, Works with Alexa/Google Assistant, Glass Touch Finish',
            rateINR: 4200,
            unit: 'Board Unit',
            imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
            tag: 'Smart Home Touch',
            description: 'Tempered glass smart touch board for controlling room lights and fans via mobile app or voice.',
            inStock: true
          }
        ]
      },
      {
        name: 'LED Bulbs, COB Lights & Panel Lights (एलईडी बल्ब व लाइट)',
        items: [
          {
            id: 'bul-01',
            name: 'Philips Stellar Bright 9W Cool Day LED Bulb (Pack of 10)',
            brand: 'Philips Lighting',
            specs: '1050 Lumens, B22 Base, Surge Protection 4kV, 2-Year Replacement Guarantee',
            rateINR: 890,
            unit: 'Box of 10 Bulbs',
            imageUrl: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=600&q=80',
            tag: 'EyeComfort Tech',
            description: 'Energy-saving cool white LED light bulbs with uniform glare-free light distribution.',
            inStock: true
          },
          {
            id: 'bul-02',
            name: 'Havells 12W Concealed COB Downlight Panel Light',
            brand: 'Havells',
            specs: 'Die-cast Aluminum Body, Warm White 3000K, Ceiling Recessed Fitting',
            rateINR: 480,
            unit: 'Piece',
            imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80',
            tag: 'Architectural Light',
            description: 'Modern ceiling spotlight for False Ceiling living room and showroom accent lighting.',
            inStock: true
          }
        ]
      }
    ]
  },
  {
    id: 'building_materials',
    title: 'Cement, Steel TMT, Bricks & Sand',
    titleHi: 'सीमेंट, टीएमटी सरिया, ईंट एवं बालू',
    iconName: 'Building2',
    badge: 'Direct Mill Wholesale Price',
    accentColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    bgGradient: 'from-blue-500/10 via-slate-500/5 to-transparent',
    coverImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    brandLogos: ['UltraTech', 'Tata Tiscon', 'Ambuja Cement', 'JSW Steel', 'ACC', 'Birla A1'],
    subCategories: [
      {
        name: 'Cement (सीमेंट बोरी)',
        items: [
          {
            id: 'cem-01',
            name: 'UltraTech Super PPC Cement (50kg Bag)',
            brand: 'UltraTech Cement',
            specs: 'Portland Pozzolana Cement, Weather Shield Waterproofing Formula, IS 1489 Compliant',
            rateINR: 385,
            unit: '50kg Bag',
            imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
            tag: 'India No.1 Cement',
            description: 'Engineered micro-fine cement for high strength slab casting, pillars, and plasters.',
            inStock: true
          },
          {
            id: 'cem-02',
            name: 'ACC Gold Water Shield OPC 53 Grade Cement',
            brand: 'ACC Cement',
            specs: 'Early High Strength 53 Grade, Water Repellent Coating Micro-particles',
            rateINR: 410,
            unit: '50kg Bag',
            imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
            tag: 'Fast Setting',
            description: 'Premium OPC cement designed for heavy structural columns and bridge foundations.',
            inStock: true
          }
        ]
      },
      {
        name: 'Steel TMT Rebars (टी०एम०टी० सरिया)',
        items: [
          {
            id: 'ste-01',
            name: 'Tata Tiscon Fe550D Super Ductile TMT Steel Bars (12mm)',
            brand: 'Tata Steel',
            specs: 'Earthquake Resistant Fe550D Ribbed Design, Corrosion Resistance Index 1.8',
            rateINR: 62500,
            unit: 'Per Ton',
            imageUrl: 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=600&q=80',
            tag: 'Tata Genuine Steel',
            description: 'Primary steel TMT bars offering maximum flexibility and bonding strength with concrete.',
            inStock: true
          },
          {
            id: 'ste-02',
            name: 'JSW Neosteel Fe550D Pure TMT Steel (10mm / 16mm)',
            brand: 'JSW Steel',
            specs: '100% Virgin Iron Ore Grade, Uniform Rib Pattern for Superior Grip',
            rateINR: 60800,
            unit: 'Per Ton',
            imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
            tag: 'Best Rate Steel',
            description: 'High tensile TMT bars manufactured from virgin blast furnace iron.',
            inStock: true
          }
        ]
      },
      {
        name: 'Bricks, AAC Blocks & Aggregate (ईंट, फ्लाई ऐश व बालू)',
        items: [
          {
            id: 'bri-01',
            name: 'Class-1 Red Kiln Clay Bricks (1st Class Quality)',
            brand: 'Local Kiln Associated',
            specs: 'Dimensions 9"x4.25"x2.75", Water Absorption <12%, Compressive Strength 105 kg/cm²',
            rateINR: 8,
            unit: 'Per Piece',
            imageUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80',
            tag: '1st Quality Brick',
            description: 'Traditional solid burned red clay bricks for durable load-bearing exterior walls.',
            inStock: true
          },
          {
            id: 'bri-02',
            name: 'Autoclaved Aerated Concrete (AAC) Lightweight Blocks (600x200x150mm)',
            brand: 'Magicrete',
            specs: 'Thermal Insulation, Fire Resistant 4 Hours, 3x Faster Construction Speed',
            rateINR: 62,
            unit: 'Per Block',
            imageUrl: 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=600&q=80',
            tag: 'Lightweight & Thermal',
            description: 'Eco-friendly lightweight building block reducing structural dead weight and electricity bills.',
            inStock: true
          }
        ]
      }
    ]
  },
  {
    id: 'paints_wall_finishes',
    title: 'Paints, Wall Putty, Primers & Finishes',
    titleHi: 'पेंट, पुट्टी, प्राइमर एवं वाटरप्रूफिंग',
    iconName: 'Paintbrush',
    badge: 'Custom Machine Shade Mixing',
    accentColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800',
    bgGradient: 'from-purple-500/10 via-pink-500/5 to-transparent',
    coverImage: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
    brandLogos: ['Asian Paints', 'Berger Paints', 'Nerolac', 'Birla White', 'Dulux', 'Dr. Fixit'],
    subCategories: [
      {
        name: 'Wall Paints & Emulsions (दीवार पेंट व डिस्टेंपर)',
        items: [
          {
            id: 'pnt-01',
            name: 'Asian Paints Royale Luxury Interior Emulsion (20 Liters)',
            brand: 'Asian Paints',
            specs: 'Teflon Surface Protector, Soft Sheen Finish, Washable Stain Resistance',
            rateINR: 8400,
            unit: '20L Bucket',
            imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80',
            tag: 'Royale Luxury',
            description: 'Ultra-durable interior wall paint with dirt resistance and smooth silk finish.',
            inStock: true
          },
          {
            id: 'pnt-02',
            name: 'Asian Paints Apex Ultima Exterior Dust Proof Paint (20 Liters)',
            brand: 'Asian Paints',
            specs: '7-Year Performance Warranty, Silicon Additives for Anti-Algae & UV Protection',
            rateINR: 6850,
            unit: '20L Bucket',
            imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
            tag: '7-Year Weather Armor',
            description: 'Advanced exterior wall emulsion engineered for heavy rain and harsh summer heat.',
            inStock: true
          }
        ]
      },
      {
        name: 'Wall Putty, Primer & Waterproofing (पुट्टी, प्राइमर व वॉटरप्रूफिंग)',
        items: [
          {
            id: 'put-01',
            name: 'Birla White WallCare Waterproof Putty (40kg Bag)',
            brand: 'Birla White',
            specs: 'Extra White Polymer Modified Putty, Prevents Paint Flaking, Smooth Base',
            rateINR: 890,
            unit: '40kg Bag',
            imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
            tag: 'White Cement Putty',
            description: 'White cement based smooth wall putty providing moisture seal before painting.',
            inStock: true
          },
          {
            id: 'put-02',
            name: 'Dr. Fixit LW+ 101 Waterproofing Liquid Additive (5 Liters)',
            brand: 'Pidilite Dr. Fixit',
            specs: 'Integral Liquid Waterproofing Compound for Concrete & Plaster Mortar',
            rateINR: 680,
            unit: '5L Can',
            imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
            tag: 'Dampness Lock',
            description: 'Liquid waterproofing compound added to cement mortar to stop dampness and efflorescence.',
            inStock: true
          }
        ]
      }
    ]
  },
  {
    id: 'plumbing_sanitary',
    title: 'Plumbing, Pipes, Tanks & Fittings',
    titleHi: 'पाइप, वाटर टैंक एवं सैनिटरी फिटिंग्स',
    iconName: 'Droplets',
    badge: '100% Lead-Free & Heavy Pressure',
    accentColor: 'text-sky-600 dark:text-sky-400',
    borderColor: 'border-sky-200 dark:border-sky-800',
    bgGradient: 'from-sky-500/10 via-cyan-500/5 to-transparent',
    coverImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    brandLogos: ['Astral Pipes', 'Supreme', 'Finolex', 'Sintex', 'Jaquar', 'Cera'],
    subCategories: [
      {
        name: 'CPVC / UPVC Heavy Duty Pipes & Fittings (सी०पी०वी०सी० पाइप)',
        items: [
          {
            id: 'pip-01',
            name: 'Astral ProPEX CPVC Hot & Cold Water Pipe 1 inch (3 Meter)',
            brand: 'Astral Pipes',
            specs: 'Class 1 SDR 11, Temperature Resistance up to 93°C, NSF Certified Lead Free',
            rateINR: 420,
            unit: '3m Length',
            imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
            tag: 'Lead-Free Hot Water',
            description: 'High pressure CPVC pipe for hot & cold domestic plumbing lines.',
            inStock: true
          },
          {
            id: 'pip-02',
            name: 'Supreme AquaGold UPVC Pressure Pipe 1.25 inch (3 Meter)',
            brand: 'Supreme Industries',
            specs: 'Schedule 40 UPVC Pipe,UV Stabilized, Smooth Inner Bore for Maximum Flow',
            rateINR: 310,
            unit: '3m Length',
            imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
            tag: 'Heavy Pressure',
            description: 'Durable UPVC pipe for main water supply and overhead tank connections.',
            inStock: true
          }
        ]
      },
      {
        name: 'Overhead Water Storage Tanks (पानी की टंकी)',
        items: [
          {
            id: 'tnk-01',
            name: 'Sintex Pure 1000 Liters 4-Layer Antibacterial Water Tank',
            brand: 'Sintex',
            specs: '4-Layer UV Protected Virgin Food Grade Plastic, Anti-Bacterial Silver Nano Tech',
            rateINR: 7600,
            unit: '1000L Unit',
            imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
            tag: 'Food-Grade Virgin Plastic',
            description: '4-layered thermal water tank keeping water cooler in summers and free from algae.',
            inStock: true
          },
          {
            id: 'tnk-02',
            name: 'Plasto 6-Layer Foam Shield 500 Liters Water Storage Tank',
            brand: 'Plasto',
            specs: 'Insulated Foam Layer, Gold Finish UV Armor Outer Shell, 10-Year Warranty',
            rateINR: 4800,
            unit: '500L Unit',
            imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
            tag: 'Foam Insulation',
            description: 'Insulated water tank preventing water heating during extreme summer months.',
            inStock: true
          }
        ]
      }
    ]
  },
  {
    id: 'services_contractors',
    title: 'Services, Architects, Engineers & Contractors',
    titleHi: 'इंजीनियर, आर्किटेक्ट, ठेकेदार एवं लेबर सेवाएं',
    iconName: 'Wrench',
    badge: 'Verified & Escrow Contract Protected',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    bgGradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    coverImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
    brandLogos: ['2Click Certified Engineer', 'Sarkar Empanelled', 'Council of Architecture', 'IS Code Auditor'],
    subCategories: [
      {
        name: 'Design & Engineering Services (आर्किटेक्ट व इंजीनियर नक्शा)',
        items: [
          {
            id: 'srv-01',
            name: 'AI Vastu Naksha 2D/3D Architecture Plan & Map Sanction',
            brand: '2Click Architecture Studio',
            specs: 'Includes 2D Floor Plan, Structural Column Grid, 3D Front Elevation, Vastu Direction Audit',
            rateINR: 15,
            unit: 'Per Sq.Ft.',
            imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
            tag: 'Instant AI + Architect Sanction',
            description: 'Complete home map design package with municipality map sanction documents.',
            inStock: true
          },
          {
            id: 'srv-02',
            name: 'Civil Engineer BOQ Estimation & IS 2026 Structural Load Audit',
            brand: 'Licensed Structural Engineer',
            specs: 'Detailed Bill of Quantities, Steel Reinforcement Schedule, Concrete Mix Design Audit',
            rateINR: 2500,
            unit: 'Per Project Inspection',
            imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80',
            tag: 'Bank Loan Approved',
            description: 'Professional structural safety audit and accurate material estimation for bank home loans.',
            inStock: true
          }
        ]
      },
      {
        name: 'Execution Labor Tenders & Turnkey Tenders (ठेकेदारी व लेबर सेवा)',
        items: [
          {
            id: 'srv-03',
            name: 'Turnkey Residential Home Construction (Labor + Material Package)',
            brand: 'Verified Master Contractor Tenders',
            specs: 'Includes Excavation, Structure, Brickwork, Plaster, Tiles, Plumbing, Wiring & Paint',
            rateINR: 1650,
            unit: 'Per Sq.Ft. Built-up Area',
            imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
            tag: 'Escrow Guarantee',
            description: 'Complete turnkey home building with 100% milestone protected escrow payments.',
            inStock: true
          },
          {
            id: 'srv-04',
            name: 'Rooftop Solar System Installation & DISCOM Net-Metering Service',
            brand: 'Govt Certified Solar Installer',
            specs: 'Rooftop Framing, Cable Wiring, Earthing Pit, Lightening Arrester & DISCOM Approval',
            rateINR: 8000,
            unit: 'Per KW Installation',
            imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
            tag: 'Turnkey Solar Fit',
            description: 'End-to-end solar roof mounting, cable connection, earthing pit creation, and net meter registration.',
            inStock: true
          }
        ]
      }
    ]
  }
];

export const MaterialServicesCategoryGrid: React.FC<MaterialServicesCategoryGridProps> = ({
  currentUser,
  onOpenAuth
}) => {
  // Categories State with LocalStorage Persistence
  const [categories, setCategories] = useState<MainCategory[]>(() => {
    try {
      const saved = localStorage.getItem('IS_CODE_MATERIAL_SERVICES_CATALOG');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load catalog from localStorage', e);
    }
    return INITIAL_MATERIAL_SERVICES_DATA;
  });

  const [selectedCategory, setSelectedCategory] = useState<MainCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<string>('All');
  const [showFeesSection, setShowFeesSection] = useState(false);
  
  // Modals state
  const [inquiryModalItem, setInquiryModalItem] = useState<SubMaterialItem | null>(null);
  const [detailModalItem, setDetailModalItem] = useState<SubMaterialItem | null>(null);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);

  // Detail Modal Calculator State
  const [calcQuantity, setCalcQuantity] = useState(1);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Item Form State
  const [newItemCatId, setNewItemCatId] = useState<string>('solar_energy');
  const [newItemSubName, setNewItemSubName] = useState<string>('');
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemBrand, setNewItemBrand] = useState<string>('');
  const [newItemPrice, setNewItemPrice] = useState<number>(0);
  const [newItemUnit, setNewItemUnit] = useState<string>('Piece');
  const [newItemSpecs, setNewItemSpecs] = useState<string>('');
  const [newItemTag, setNewItemTag] = useState<string>('Verified Quality');
  const [newItemShopCategory, setNewItemShopCategory] = useState<string>('बिल्डिंग व हार्डवेयर स्टोर');
  const [newItemSupplierRole, setNewItemSupplierRole] = useState<string>('ऑथोराइज्ड वेंडर सप्लायर');
  const [newItemPhotoUrl, setNewItemPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80');

  // Save to LocalStorage whenever categories state updates
  useEffect(() => {
    try {
      localStorage.setItem('IS_CODE_MATERIAL_SERVICES_CATALOG', JSON.stringify(categories));
    } catch (e) {
      console.warn('Failed to save catalog to localStorage', e);
    }
  }, [categories]);

  const handleOpenCategoryModal = (cat: MainCategory) => {
    // Sync current category from latest state
    const current = categories.find(c => c.id === cat.id) || cat;
    setSelectedCategory(current);
    setActiveSubTab('All');
    setSearchQuery('');
  };

  const handleItemCardClick = (item: SubMaterialItem) => {
    setDetailModalItem(item);
    setCalcQuantity(1);
  };

  const handleSendInquiry = (item: SubMaterialItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setInquiryModalItem(item);
    setOrderQuantity(1);
  };

  const handleConfirmOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryModalItem) return;

    const totalVal = inquiryModalItem.rateINR * orderQuantity;
    setSuccessToast(`Inquiry & Bid Request for ${inquiryModalItem.name} (Qty: ${orderQuantity} ${inquiryModalItem.unit}) sent successfully! Estimated Total: ₹${totalVal.toLocaleString('en-IN')}`);
    setInquiryModalItem(null);

    setTimeout(() => {
      setSuccessToast(null);
    }, 5000);
  };

  // Open Add Item Modal pre-selected with category if available
  const handleOpenAddItemModal = (catId?: string) => {
    if (catId) {
      setNewItemCatId(catId);
      const cat = categories.find(c => c.id === catId);
      if (cat && cat.subCategories.length > 0) {
        setNewItemSubName(cat.subCategories[0].name);
      }
    }
    setAddItemModalOpen(true);
  };

  // Create & Insert New Item into Catalog
  const handleCreateNewItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;

    const createdItem: SubMaterialItem = {
      id: `custom-${Date.now()}`,
      name: newItemName,
      brand: newItemBrand || 'Standard Brand',
      specs: newItemSpecs || 'Standard ISO specifications & quality guarantee',
      rateINR: Number(newItemPrice),
      unit: newItemUnit || 'Piece',
      imageUrl: newItemPhotoUrl,
      tag: newItemTag || 'Custom Added',
      description: `${newItemName} - Brand: ${newItemBrand}. ${newItemSpecs}`,
      inStock: true,
      shopCategory: newItemShopCategory || 'General Store',
      supplierRole: newItemSupplierRole || 'Authorized Vendor Supplier'
    };

    setCategories(prevCats => {
      return prevCats.map(cat => {
        if (cat.id !== newItemCatId) return cat;

        const targetSubName = newItemSubName || (cat.subCategories[0]?.name ?? 'General Items');
        let subFound = false;

        const updatedSubs = cat.subCategories.map(sub => {
          if (sub.name === targetSubName) {
            subFound = true;
            return {
              ...sub,
              items: [createdItem, ...sub.items]
            };
          }
          return sub;
        });

        if (!subFound) {
          updatedSubs.push({
            name: targetSubName,
            items: [createdItem]
          });
        }

        return {
          ...cat,
          subCategories: updatedSubs
        };
      });
    });

    setSuccessToast(`New item "${newItemName}" added at ₹${newItemPrice.toLocaleString('en-IN')} / ${newItemUnit} successfully!`);
    setAddItemModalOpen(false);

    // Reset Form
    setNewItemName('');
    setNewItemBrand('');
    setNewItemPrice(0);
    setNewItemSpecs('');

    // Refresh selected category if open
    if (selectedCategory) {
      const updatedCat = categories.find(c => c.id === selectedCategory.id);
      if (updatedCat) setSelectedCategory(updatedCat);
    }

    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div className="space-y-6 my-4">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-4 z-50 p-4 bg-emerald-900 text-white border border-emerald-500 rounded-2xl shadow-2xl flex items-start gap-3 max-w-md animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-extrabold text-sm text-emerald-300">Success Action</div>
            <div>{successToast}</div>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-slate-400 hover:text-white ml-auto cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header Banner with Add Material Button */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white border border-slate-700/80 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-500/40">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Logged in as: <strong>{currentUser?.role || 'Verified Member'}</strong></span>
              {currentUser?.subscriptionPlanName && (
                <span className="text-[10px] opacity-80">({currentUser.subscriptionPlanName})</span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Materials & Services Catalog</span>
              <span className="text-xs font-normal text-slate-300 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 hidden sm:inline-block">
                Material &amp; Services Hub
              </span>
            </h2>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Explore solar panels, inverters, batteries, wiring, switchboards, cement, paint, contractor & engineering rates. Click any card to view detailed price estimates or add custom items!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Membership Fees & Service SLA Toggle Button */}
            <button
              onClick={() => setShowFeesSection(!showFeesSection)}
              className={`px-4 py-2.5 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer border ${
                showFeesSection
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/20'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              <Tag className="w-4 h-4 text-amber-300" />
              <span>Membership Fees & SLA Terms</span>
            </button>

            {/* Global Add Item & Price Button */}
            <button
              onClick={() => handleOpenAddItemModal()}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer border border-emerald-400/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Material / Rate</span>
            </button>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[90px]">
              <div className="text-[10px] text-slate-300 font-semibold uppercase">Categories</div>
              <div className="text-base font-black text-amber-300 mt-0.5">{categories.length} Core Hubs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Fees & Service SLA Duration Section (Always or when toggled) */}
      {(showFeesSection || true) && (
        <PlatformFeesPublicCard compact={!showFeesSection} />
      )}

      {/* Main Interactive Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleOpenCategoryModal(cat)}
            className={`group rounded-3xl bg-white dark:bg-slate-900 border ${cat.borderColor} shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between hover:-translate-y-1 relative`}
          >
            {/* Top Cover Image Container */}
            <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={cat.coverImage}
                alt={cat.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-black border border-amber-500/30">
                {cat.badge}
              </span>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="text-[11px] text-slate-300 font-semibold">{cat.titleHi}</div>
                <h3 className="text-base font-extrabold line-clamp-1">{cat.title}</h3>
              </div>
            </div>

            {/* Sub-item count & Shop/Supplier Info */}
            <div className="p-4 space-y-3">
              {/* Shop Category & Supplier Role Badges */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Store className="w-3 h-3 text-emerald-500" />
                  <span>{cat.shopCategory || 'Building & Hardware Store'}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                  <Truck className="w-3 h-3 text-indigo-500" />
                  <span>{cat.defaultSupplierRole || 'Authorized Supplier'}</span>
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Included Sub-categories:</div>
                <div className="flex flex-wrap gap-1">
                  {cat.subCategories.map((sub, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                      {sub.name.split('(')[0]}
                    </span>
                  ))}
                </div>
              </div>

              {/* Brand Logos Row */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-medium">Top Brands:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                  {cat.brandLogos.slice(0, 3).join(' • ')}
                </span>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between group-hover:bg-indigo-600 transition-colors duration-300">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 group-hover:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:text-amber-300" />
                <span>View Items &amp; Rates</span>
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* DETAILED CATEGORY SUB-ITEMS EXPANSION MODAL */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                  {selectedCategory.badge}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">{selectedCategory.title}</h3>
                <p className="text-xs text-slate-300">{selectedCategory.titleHi}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAddItemModal(selectedCategory.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Item / Rate</span>
                </button>

                <button
                  onClick={() => setSelectedCategory(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Filter Tabs & Search Bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                
                {/* Sub category tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
                  <button
                    onClick={() => setActiveSubTab('All')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      activeSubTab === 'All'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    All Items
                  </button>

                  {selectedCategory.subCategories.map((sub, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSubTab(sub.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        activeSubTab === sub.name
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {sub.name.split('(')[0]}
                    </button>
                  ))}
                </div>

                {/* Search input */}
                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search model, brand, price..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Modal Sub-Items Body Grid */}
            <div className="p-5 overflow-y-auto space-y-6 grow">
              {selectedCategory.subCategories
                .filter(sub => activeSubTab === 'All' || activeSubTab === sub.name)
                .map((subGroup, sIdx) => {
                  const filteredItems = subGroup.items.filter(item =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.specs.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={sIdx} className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <Layers className="w-4 h-4 text-indigo-500" />
                          <span>{subGroup.name}</span>
                        </h4>
                        <span className="text-xs font-mono text-slate-400">({filteredItems.length} Products)</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleItemCardClick(item)}
                            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all shadow-xs hover:shadow-lg flex flex-col sm:flex-row gap-4 group/card cursor-pointer relative"
                          >
                            {/* Product Picture with Click to View indicator */}
                            <div className="w-full sm:w-32 h-32 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative shrink-0">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                              />
                              {item.tag && (
                                <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-extrabold shadow-sm">
                                  {item.tag}
                                </span>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1 backdrop-blur-xs">
                                <ImageIcon className="w-4 h-4" />
                                <span>View Large Photo</span>
                              </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-2 grow flex flex-col justify-between">
                              <div>
                                <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center justify-between">
                                  <span>{item.brand}</span>
                                  <span className="text-[9px] text-slate-400 font-normal">Click for full detail</span>
                                </div>
                                <h5 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover/card:text-indigo-600 dark:group-hover/card:text-indigo-400 transition-colors">
                                  {item.name}
                                </h5>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{item.specs}</p>
                                
                                {/* Shop Category & Supplier Role Badges */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[9px]">
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                    <Store className="w-2.5 h-2.5 text-emerald-500" />
                                    <span>{item.shopCategory || selectedCategory?.shopCategory || 'Building & Hardware Store'}</span>
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                                    <Truck className="w-2.5 h-2.5 text-indigo-500" />
                                    <span>{item.supplierRole || selectedCategory?.defaultSupplierRole || 'Authorized Supplier'}</span>
                                  </span>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                                <div>
                                  <div className="text-[10px] text-slate-400 font-medium">Market Rate:</div>
                                  <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                                    ₹{item.rateINR.toLocaleString('en-IN')}
                                    <span className="text-[10px] font-normal text-slate-400"> / {item.unit}</span>
                                  </div>
                                </div>

                                <button
                                  onClick={(e) => handleSendInquiry(item, e)}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                                >
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                  <span>Inquire / Bid</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>GST Tax Invoice &amp; Direct Vendor Escrow Payment Protected</span>
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleOpenAddItemModal(selectedCategory.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Custom Item</span>
                </button>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ITEM FULL PHOTO & DETAIL MODAL */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full flex flex-col shadow-2xl overflow-hidden my-auto">
            
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-xs">
                  {detailModalItem.brand}
                </span>
                <span className="text-xs text-slate-400">Full Photo &amp; Specifications</span>
              </div>
              <button
                onClick={() => setDetailModalItem(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Photo Showcase */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 max-h-80 border border-slate-800 group">
                <img
                  src={detailModalItem.imageUrl}
                  alt={detailModalItem.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain max-h-80 mx-auto"
                />
                {detailModalItem.tag && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-xs shadow-lg">
                    {detailModalItem.tag}
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{detailModalItem.name}</h3>
                
                {/* Shop Category & Supplier Info Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5">
                    <Store className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Shop / Store Category</div>
                      <div className="font-extrabold">{detailModalItem.shopCategory || 'Building & Hardware Depot'}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 flex items-center gap-2.5">
                    <Truck className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">Supplier Role & Profile</div>
                      <div className="font-extrabold">{detailModalItem.supplierRole || 'Authorized Vendor Supplier'}</div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{detailModalItem.description}</p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
                  <strong>Specifications:</strong> {detailModalItem.specs}
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-emerald-600" />
                    <span>Price &amp; Quantity Estimator</span>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    Base Rate: ₹{detailModalItem.rateINR.toLocaleString('en-IN')} / {detailModalItem.unit}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Enter Quantity ({detailModalItem.unit}):</label>
                    <input
                      type="number"
                      min={1}
                      value={calcQuantity}
                      onChange={(e) => setCalcQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white text-sm"
                    />
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-300 dark:border-emerald-700 space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Estimated Cost (Excl. Freight)</div>
                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      ₹{(detailModalItem.rateINR * calcQuantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDetailModalItem(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl"
              >
                Back to List
              </button>

              <button
                type="button"
                onClick={() => {
                  const itemToInquire = detailModalItem;
                  setDetailModalItem(null);
                  handleSendInquiry(itemToInquire);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Submit Inquiry / Bid Request</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW MATERIAL / SERVICE / SOLAR ITEM MODAL */}
      {addItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-500" />
                <span>Add Material, Solar or Service (Add Item &amp; Price)</span>
              </h3>
              <button onClick={() => setAddItemModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewItemSubmit} className="space-y-4 text-xs">
              
              {/* Category & Sub-category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Main Category *</label>
                  <select
                    value={newItemCatId}
                    onChange={(e) => {
                      setNewItemCatId(e.target.value);
                      const cat = categories.find(c => c.id === e.target.value);
                      if (cat && cat.subCategories.length > 0) {
                        setNewItemSubName(cat.subCategories[0].name);
                      }
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select / Enter Sub-Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solar Panels, Battery, Inverter, Wire"
                    value={newItemSubName}
                    onChange={(e) => setNewItemSubName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Name & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Item / Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Luminous 220Ah Solar Battery"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Luminous, Tata, Exide, Havells"
                    value={newItemBrand}
                    onChange={(e) => setNewItemBrand(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Rate & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Price / Rate in ₹ (INR) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    placeholder="e.g. 15800"
                    value={newItemPrice || ''}
                    onChange={(e) => setNewItemPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-emerald-600 dark:text-emerald-400 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unit *</label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Piece">Piece / Unit</option>
                    <option value="Per Panel + Board">Per Panel + Board</option>
                    <option value="Complete Kit">Complete Kit</option>
                    <option value="100m Coil">100m Coil</option>
                    <option value="50kg Bag">50kg Bag</option>
                    <option value="Per Ton">Per Ton</option>
                    <option value="Per Sq.Ft.">Per Sq.Ft.</option>
                    <option value="Per KW Installation">Per KW Installation</option>
                    <option value="20L Bucket">20L Bucket</option>
                  </select>
                </div>
              </div>

              {/* Shop Category & Supplier Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Shop / Store Category *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tiles & Hardware Showroom, Solar Mart, Electricals"
                    value={newItemShopCategory}
                    onChange={(e) => setNewItemShopCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Supplier Role *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Authorized Solar Vendor, Tiles Wholesaler, Cement Distributor"
                    value={newItemSupplierRole}
                    onChange={(e) => setNewItemSupplierRole(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Tag & Specs */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Badge Tag (e.g. 25-Yr Warranty, Govt Subsidy)</label>
                <input
                  type="text"
                  placeholder="e.g. Highest Efficiency, Bestseller"
                  value={newItemTag}
                  onChange={(e) => setNewItemTag(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Specifications &amp; Features</label>
                <textarea
                  rows={2}
                  placeholder="e.g. High efficiency Mono PERC cells with heavy iron board mounting."
                  value={newItemSpecs}
                  onChange={(e) => setNewItemSpecs(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              {/* Photo Preset Picker / Custom URL */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">Choose Material Photo / Image URL</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  {PRESET_MATERIAL_PHOTOS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewItemPhotoUrl(p.url)}
                      className={`relative rounded-lg overflow-hidden border-2 h-14 transition cursor-pointer ${
                        newItemPhotoUrl === p.url ? 'border-emerald-500 ring-2 ring-emerald-400' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      title={p.name}
                    >
                      <img src={p.url} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  placeholder="Or paste custom Image URL (https://...)"
                  value={newItemPhotoUrl}
                  onChange={(e) => setNewItemPhotoUrl(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-[11px]"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddItemModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save &amp; Publish Rate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER / INQUIRY BIDDING MODAL */}
      {inquiryModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                <span>Material Order &amp; Vendor Inquiry</span>
              </h3>
              <button onClick={() => setInquiryModalItem(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <img src={inquiryModalItem.imageUrl} alt={inquiryModalItem.name} referrerPolicy="no-referrer" className="w-14 h-14 object-cover rounded-xl shrink-0" />
              <div>
                <div className="text-[10px] font-bold text-indigo-500 uppercase">{inquiryModalItem.brand}</div>
                <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{inquiryModalItem.name}</div>
                <div className="text-xs font-black text-emerald-600 mt-0.5">₹{inquiryModalItem.rateINR.toLocaleString('en-IN')} / {inquiryModalItem.unit}</div>
              </div>
            </div>

            <form onSubmit={handleConfirmOrderSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Quantity Required ({inquiryModalItem.unit})</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl space-y-1">
                <div className="flex items-center justify-between font-bold text-indigo-900 dark:text-indigo-200">
                  <span>Estimated Total Amount:</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    ₹{(inquiryModalItem.rateINR * orderQuantity).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Inquiry will be sent to empanelled vendors in your district. You will receive competitive rate quotes via WhatsApp &amp; In-app notification.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInquiryModalItem(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Quotation Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
