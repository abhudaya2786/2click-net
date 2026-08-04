import { Project, LiDARSurvey, VRScene, InteriorModule, Vendor, VendorBid, BindingContract, ShopProduct, SolarEquipmentItem, LoanApplication, EmpanelledBrand, MaterialWithFittingItem, HouseNakshaPlan, VastuRoomRule, VendorConversation, GovernmentAwardedTender, SarkarSubBid, SubscriptionPlan, SubscriptionTransaction } from '../types';

export const INDIAN_CITIES = [
  'Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune',
  'Chennai', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi'
];

export const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'PRJ-2026-001',
    title: 'Prestige Royal Green Villa G+2',
    clientName: 'Rajesh Sharma',
    category: 'construction',
    city: 'Bengaluru',
    pincode: '560001',
    address: 'Prestige Whitefield Road, Ward 22',
    gpsLat: 12.9716,
    gpsLng: 77.5946,
    status: 'Under Execution',
    progressPercentage: 62,
    budgetEstimatedINR: 4850000,
    startDate: '2026-02-10',
    expectedCompletion: '2026-11-30'
  },
  {
    id: 'PRJ-2026-002',
    title: '15kW On-Grid Rooftop Solar Plant',
    clientName: 'Apex Precision Tools Factory',
    category: 'solar',
    city: 'Pune',
    pincode: '411001',
    address: 'Hinjewadi IT Park Phase 2',
    gpsLat: 18.5204,
    gpsLng: 73.8567,
    status: 'In Survey',
    progressPercentage: 25,
    budgetEstimatedINR: 720000,
    startDate: '2026-07-01',
    expectedCompletion: '2026-08-15'
  },
  {
    id: 'PRJ-2026-003',
    title: '3BHK Luxury Modern Interior',
    clientName: 'Priya & Anish Nair',
    category: 'interior',
    city: 'Mumbai',
    pincode: '400001',
    address: 'Andheri West Link Road Industrial Hub',
    gpsLat: 19.0760,
    gpsLng: 72.8777,
    status: 'Estimation',
    progressPercentage: 40,
    budgetEstimatedINR: 1850000,
    startDate: '2026-06-15',
    expectedCompletion: '2026-09-10'
  },
  {
    id: 'PRJ-2026-004',
    title: '12 Acre Industrial Park LiDAR Contour Survey',
    clientName: 'Vanguard Infrastructure Developers',
    category: 'lidar',
    city: 'Hyderabad',
    pincode: '500001',
    address: 'Gachibowli Financial District Hilltop',
    gpsLat: 17.3850,
    gpsLng: 78.4867,
    status: 'Completed',
    progressPercentage: 100,
    budgetEstimatedINR: 350000,
    startDate: '2026-05-01',
    expectedCompletion: '2026-05-18'
  },
  {
    id: 'PRJ-2026-005',
    title: '150 KLD MBBR Sewage Treatment Plant (STP)',
    clientName: 'Sobha Horizon Apartments RWA',
    category: 'water_etp_stp',
    city: 'Bengaluru',
    pincode: '560100',
    address: 'Electronics City Phase 1 Main Road',
    gpsLat: 12.8452,
    gpsLng: 77.6602,
    status: 'Under Execution',
    progressPercentage: 55,
    budgetEstimatedINR: 2850000,
    startDate: '2026-04-10',
    expectedCompletion: '2026-08-30'
  },
  {
    id: 'PRJ-2026-006',
    title: '500 kVA HT Substation & BMS Electrical Panel',
    clientName: 'TCS IT Tech Park Tower-B',
    category: 'electrical_elv',
    city: 'Chennai',
    pincode: '600001',
    address: 'Guindy Industrial Estate Sector 4',
    gpsLat: 13.0827,
    gpsLng: 80.2707,
    status: 'In Survey',
    progressPercentage: 15,
    budgetEstimatedINR: 6400000,
    startDate: '2026-06-20',
    expectedCompletion: '2026-12-15'
  },
  {
    id: 'PRJ-2026-007',
    title: 'Gorakhpur Smart Highway & Boundary Wall Complex',
    clientName: 'Purvanchal Industrial Development Corp',
    category: 'construction',
    city: 'Gorakhpur',
    pincode: '273001',
    address: 'Civil Lines Road, Near AIIMS Gorakhpur',
    gpsLat: 26.7606,
    gpsLng: 83.3732,
    status: 'Under Execution',
    progressPercentage: 35,
    budgetEstimatedINR: 8500000,
    startDate: '2026-03-01',
    expectedCompletion: '2026-12-30'
  }
];

export const SAMPLE_LIDAR_SURVEY: LiDARSurvey = {
  id: 'LIDAR-HYD-9912',
  projectName: 'Gachibowli High-Tech Hilltop Site',
  location: 'Gachibowli, Hyderabad (Telangana)',
  surveyDate: '2026-07-15',
  pointCount: 1420000,
  areaSqMeters: 48500,
  maxElevationMeters: 564.2,
  contourIntervalMeters: 0.5,
  accuracyCm: 1.2,
  points: [
    { id: 'p1', x: 10, y: 15, z: 12.4, classification: 'Terrain', intensity: 220 },
    { id: 'p2', x: 25, y: 30, z: 18.2, classification: 'Structure', intensity: 245 },
    { id: 'p3', x: 40, y: 45, z: 15.1, classification: 'Vegetation', intensity: 110 },
    { id: 'p4', x: 60, y: 70, z: 22.8, classification: 'Terrain', intensity: 190 },
    { id: 'p5', x: 80, y: 85, z: 26.3, classification: 'Boundary', intensity: 255 }
  ]
};

export const SAMPLE_VR_SCENES: VRScene[] = [
  {
    id: 'vr-1',
    title: 'Under-Construction RCC Frame & Column Matrix',
    category: 'Structural BIM',
    panoramaUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=1600&q=80',
    wireframeModeAvailable: true,
    hotspots: [
      { id: 'h1', label: 'Fe550D TMT Reinforcement Column', x: 30, y: 40, details: '16mm 8-bar main steel with 8mm stirrups at 150mm c/c as per IS 13920 seismic design.' },
      { id: 'h2', label: 'M25 Ready Mix Concrete Beam', x: 65, y: 50, details: 'Compaction checked via immersion vibrator. Curing period 14 days.' }
    ]
  },
  {
    id: 'vr-2',
    title: '10kW Mono-PERC Rooftop Solar Array',
    category: 'Solar Rooftop',
    panoramaUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1600&q=80',
    wireframeModeAvailable: false,
    hotspots: [
      { id: 'h3', label: '540W Bifacial Solar Modules', x: 45, y: 35, details: 'Tilted at 18° South angle for max annual yield in South India.' },
      { id: 'h4', label: '3-Phase On-Grid String Inverter', x: 80, y: 60, details: 'IP65 outdoor rated inverter with Wi-Fi telemetry & dual MPPT trackers.' }
    ]
  },
  {
    id: 'vr-3',
    title: 'Modern Luxury Living Room & Acoustic Ceiling',
    category: 'Modern Interior',
    panoramaUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    wireframeModeAvailable: true,
    hotspots: [
      { id: 'h5', label: 'Cove Lighting Gyproc False Ceiling', x: 50, y: 25, details: 'Dual cove warm white 3000K LED strips with Saint-Gobain plasterboards.' },
      { id: 'h6', label: 'Italian Fluted Marble TV Unit', x: 35, y: 55, details: 'Bookmatched Michelangelo marble backdrop with charcoal fluted paneling.' }
    ]
  }
];

export const INTERIOR_CATALOG: InteriorModule[] = [
  {
    id: 'int-1',
    name: 'Acrylic Soft-Close Modular Kitchen',
    category: 'Kitchen',
    basePriceINR: 195000,
    finishType: 'BWR Plywood + High Gloss German Acrylic',
    description: 'Tandem drawer boxes (Hettich), corner carousel, pantry pull-out and quartz stone countertop.',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'int-2',
    name: 'Floor-to-Ceiling Sliding Wardrobe with Lacquered Glass',
    category: 'Wardrobe',
    basePriceINR: 125000,
    finishType: '18mm CenturyPlywood + Lacquered Glass Doors',
    description: 'Integrated sensor LED clothing bar, tie organizer, digital locker safe, soft close slider.',
    imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'int-3',
    name: 'Minimalist Gyproc False Ceiling with Magnetic Track Lights',
    category: 'Ceiling',
    basePriceINR: 65000,
    finishType: '12.5mm Gyproc Board + Asian Paints Royale Emulsion',
    description: 'Precision laser aligned perimeter channel, dimmable COB spotlight spots & magnetic track fixtures.',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'int-4',
    name: 'Veneered TV Media Console & Accent Wall',
    category: 'Living',
    basePriceINR: 88000,
    finishType: 'Natural Teak Veneer + PU Matt Polish',
    description: 'Concealed cable management conduit, louvred acoustic panels and floating drawer storage.',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
  }
];

export const SAMPLE_VENDORS: Vendor[] = [
  {
    id: 'VND-001',
    name: 'Aquafab Water & Environmental Engineering',
    category: 'ETP/STP Water',
    city: 'Bengaluru',
    pincode: '560001',
    address: 'Whitefield Main Road, Outer Ring Road Zone',
    gpsLat: 12.9720,
    gpsLng: 77.5950,
    maxServiceRadiusKm: 50,
    coveredPincodes: ['560001', '560002', '560100', '560037', '560066', '562125'],
    rating: 4.9,
    reviewsCount: 48,
    verifiedGstin: '29AAACA1234B1ZD',
    cpwdClassLicense: 'CPWD Class-I Environmental Contractor',
    projectsCompleted: 85,
    phone: '+91 98450 11223',
    email: 'projects@aquafabindia.com',
    specialization: 'MBBR & MBR Sewage Plants, Chemical ETPs, RO Plant Refurbishment',
    hourlyOrBaseRateINR: 1500
  },
  {
    id: 'VND-002',
    name: 'Larsen & Switchgear MEP Electricals',
    category: 'Electrical & ELV',
    city: 'Chennai',
    pincode: '600001',
    address: 'Guindy Industrial Estate Sector 2',
    gpsLat: 13.0830,
    gpsLng: 80.2710,
    maxServiceRadiusKm: 60,
    coveredPincodes: ['600001', '600002', '600032', '600096', '600113'],
    rating: 4.8,
    reviewsCount: 62,
    verifiedGstin: '33AABCL9876C1ZE',
    cpwdClassLicense: 'Superintendent Electrical Grade A License',
    projectsCompleted: 140,
    phone: '+91 94440 88776',
    email: 'tenders@larsenmep.in',
    specialization: 'HT Substation Transformers, LT Panels, Honeywell BMS & IP CCTV',
    hourlyOrBaseRateINR: 1800
  },
  {
    id: 'VND-003',
    name: 'Godrej & Boyce Civil Engineering',
    category: 'Civil Contractor',
    city: 'Mumbai',
    pincode: '400001',
    address: 'Andheri East Industrial Estate',
    gpsLat: 19.0770,
    gpsLng: 72.8780,
    maxServiceRadiusKm: 40,
    coveredPincodes: ['400001', '400053', '400069', '400093', '400072'],
    rating: 4.9,
    reviewsCount: 110,
    verifiedGstin: '27AAACG3321A1ZB',
    cpwdClassLicense: 'Class Super Special A Civil',
    projectsCompleted: 210,
    phone: '+91 98200 44332',
    email: 'contracts@godrejcivil.com',
    specialization: 'RCC Frame Residential Villas, Commercial Tower Shell, Post-Tension Slabs',
    hourlyOrBaseRateINR: 2200
  },
  {
    id: 'VND-004',
    name: 'SunEdison GreenTech Solar EPC',
    category: 'Solar Rooftop',
    city: 'Pune',
    pincode: '411001',
    address: 'Hinjewadi Phase 1 Software Tech Park',
    gpsLat: 18.5210,
    gpsLng: 73.8570,
    maxServiceRadiusKm: 75,
    coveredPincodes: ['411001', '411057', '411045', '411014', '411038'],
    rating: 4.7,
    reviewsCount: 39,
    verifiedGstin: '27AABCS7711D1ZX',
    cpwdClassLicense: 'MNRE Channel Partner Grade-1',
    projectsCompleted: 95,
    phone: '+91 97650 99881',
    email: 'sales@sunedisongreentech.in',
    specialization: 'PM Surya Ghar Industrial Solar, Net-Metering Approval, High Yield Bifacial',
    hourlyOrBaseRateINR: 1200
  },
  {
    id: 'VND-005',
    name: 'Purvanchal Civil & Highway Infra Builders',
    category: 'Civil Contractor',
    city: 'Gorakhpur',
    pincode: '273001',
    address: 'Civil Lines Road Near Golghar Market',
    gpsLat: 26.7610,
    gpsLng: 83.3740,
    maxServiceRadiusKm: 120,
    coveredPincodes: ['273001', '273002', '273015', '273209', '226001'],
    rating: 4.85,
    reviewsCount: 54,
    verifiedGstin: '09AAACP4422K1ZM',
    cpwdClassLicense: 'UP PWD Class-A Highway & Building Contractor',
    projectsCompleted: 115,
    phone: '+91 94152 88100',
    email: 'projects@purvanchalinfra.co.in',
    specialization: 'Precast Boundary Walls, RCC Culverts, Commercial Dukans & Industrial Warehouses',
    hourlyOrBaseRateINR: 1350
  },
  {
    id: 'VND-006',
    name: 'Awadh Solar & ETP Systems',
    category: 'Solar Rooftop',
    city: 'Lucknow',
    pincode: '226001',
    address: 'Hazratganj Tech Corridor',
    gpsLat: 26.8470,
    gpsLng: 80.9470,
    maxServiceRadiusKm: 150,
    coveredPincodes: ['226001', '226010', '226016', '273001', '208001'],
    rating: 4.75,
    reviewsCount: 42,
    verifiedGstin: '09AABCA8833E1ZK',
    cpwdClassLicense: 'UPNEDA Tier-1 Empanelled EPC Partner',
    projectsCompleted: 78,
    phone: '+91 94500 22334',
    email: 'contact@awadhsolar.in',
    specialization: '10kW-100kW Rooftop Solar PV, Hybrid Battery Storage & Net Metering',
    hourlyOrBaseRateINR: 1100
  },
  {
    id: 'VND-007',
    name: 'Deccan Interior Architects & Modular Studios',
    category: 'Interior Architecture',
    city: 'Hyderabad',
    pincode: '500001',
    address: 'Gachibowli Bio-Tech Park',
    gpsLat: 17.3860,
    gpsLng: 78.4870,
    maxServiceRadiusKm: 35,
    coveredPincodes: ['500001', '500032', '500081', '500019'],
    rating: 4.9,
    reviewsCount: 88,
    verifiedGstin: '36AAACD1122F1ZP',
    cpwdClassLicense: 'IIID Certified Commercial Interior Firm',
    projectsCompleted: 165,
    phone: '+91 99890 55443',
    email: 'designs@deccaninteriors.in',
    specialization: 'Acoustic Glass Partitions, False Ceilings, Modular Kitchens & Luxury Villas',
    hourlyOrBaseRateINR: 2000
  },
  {
    id: 'VND-008',
    name: 'Apex MEP & ETP Water Tech',
    category: 'ETP/STP Water',
    city: 'Bengaluru',
    pincode: '560100',
    address: 'Electronics City Phase 1 Main Tech Park',
    gpsLat: 12.8460,
    gpsLng: 77.6610,
    maxServiceRadiusKm: 30,
    coveredPincodes: ['560100', '560001', '560068', '560037'],
    rating: 4.82,
    reviewsCount: 33,
    verifiedGstin: '29AABCA9911H1ZQ',
    cpwdClassLicense: 'Karnataka KPCB Approved Water Auditor',
    projectsCompleted: 52,
    phone: '+91 98800 77112',
    email: 'info@apexetpwater.com',
    specialization: '100-500 KLD Modular MBR STP Plants, RO Plant Overhaul & Automated Dosing',
    hourlyOrBaseRateINR: 1650
  }
];

export const SAMPLE_VENDOR_BIDS: VendorBid[] = [
  {
    id: 'BID-101',
    vendorId: 'VND-001',
    vendorName: 'Aquafab Water & Environmental Engineering',
    projectName: '150 KLD MBBR Sewage Treatment Plant (STP)',
    bidAmountINR: 2650000,
    deliveryDays: 45,
    warrantyYears: 3,
    submittedDate: '2026-07-20',
    status: 'Bound',
    scopeNotes: 'Turnkey MBBR supply with air blowers, PVC media, Grundfos submersible pumps, UV disinfection and CPCB IoT online monitoring panel.'
  },
  {
    id: 'BID-102',
    vendorId: 'VND-002',
    vendorName: 'Larsen & Switchgear MEP Electricals',
    projectName: '500 kVA HT Substation & BMS Electrical Panel',
    bidAmountINR: 5950000,
    deliveryDays: 60,
    warrantyYears: 2,
    submittedDate: '2026-07-22',
    status: 'Accepted',
    scopeNotes: 'Includes 500kVA Dry Type Transformer, Schneider VCB Break, APFC Panel, Flameproof XLPE cabling and Fire Alarm Smoke Detectors.'
  }
];

export const SAMPLE_BINDING_CONTRACTS: BindingContract[] = [
  {
    id: 'BND-2026-881',
    contractNumber: '2CLICK-BIND-STP-001',
    projectId: 'PRJ-2026-005',
    projectName: '150 KLD MBBR Sewage Treatment Plant (STP)',
    clientName: 'Sobha Horizon Apartments RWA',
    vendorName: 'Aquafab Water & Environmental Engineering',
    vendorGstin: '29AAACA1234B1ZD',
    contractType: 'ETP/STP Turnkey',
    agreedAmountINR: 2650000,
    retentionMoneyPct: 5,
    advanceDepositINR: 265000,
    completionDeadline: '2026-08-30',
    bindingStatus: 'Binding Deposit Escrowed',
    signedDate: '2026-07-25',
    penaltyClausePerWeekPct: 0.5,
    digitalSignatureHash: '0x8f2a9c41b...2click_verified'
  }
];

export const SAMPLE_SHOP_PRODUCTS: ShopProduct[] = [
  // ELECTRICAL WIRING & SWITCHES
  {
    id: 'PROD-ELE-001',
    vendorId: 'VND-002',
    vendorName: 'Larsen & Switchgear MEP Electricals',
    vendorCity: 'Chennai',
    vendorPhone: '+91 94440 88776',
    title: 'Polycab 25mm Heavy Duty PVC Wiring Conduit Pipe (25m Bundle)',
    brand: 'Polycab India',
    category: 'Electrical Wiring & Switches',
    subcategory: 'Conduit Pipes',
    mrpINR: 1850,
    priceINR: 1350,
    discountPercent: 27,
    warrantyPeriod: '10 Year Structural Guarantee',
    guaranteeNotes: 'High impact resistance, fire retardant heavy gauge IS:9537 compliant PVC pipe for recessed wiring.',
    unit: 'Per Bundle (25m)',
    stockQty: 120,
    specs: '25mm Outer Dia, High Dielectric Strength, Flame Retardant Low Smoke (FRLS) Grade.',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },
  {
    id: 'PROD-ELE-002',
    vendorId: 'VND-002',
    vendorName: 'Larsen & Switchgear MEP Electricals',
    vendorCity: 'Chennai',
    vendorPhone: '+91 94440 88776',
    title: 'Finolex 1.5 sqmm Flame Retardant (FR) Copper Wire (90m Roll)',
    brand: 'Finolex Cables',
    category: 'Electrical Wiring & Switches',
    subcategory: 'Copper Wires',
    mrpINR: 2400,
    priceINR: 1720,
    discountPercent: 28,
    warrantyPeriod: 'Lifetime Brand Guarantee',
    guaranteeNotes: '100% Electrolytic Bare Copper, 1100V Grade, IS 694 Certified.',
    unit: 'Per 90m Roll',
    stockQty: 200,
    specs: 'Ideal for 5A Light & Fan Circuits. High insulation resistance & low voltage drop.',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1558441719-6705166e03c0?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },
  {
    id: 'PROD-ELE-003',
    vendorId: 'VND-002',
    vendorName: 'Larsen & Switchgear MEP Electricals',
    vendorCity: 'Chennai',
    vendorPhone: '+91 94440 88776',
    title: 'Legrand Myrius 6A 1-Way Modular Switch + Socket Combo Plate (Set of 10)',
    brand: 'Legrand',
    category: 'Electrical Wiring & Switches',
    subcategory: 'Modular Switches',
    mrpINR: 1950,
    priceINR: 1420,
    discountPercent: 27,
    warrantyPeriod: '12 Year Mechanical Warranty',
    guaranteeNotes: 'Tested for 100,000 click operations, silver alloy contact points to prevent spark wear.',
    unit: 'Set of 10 Plates',
    stockQty: 85,
    specs: 'White Antibacterial Polycarbonate Plate, Child Safety Shutter Socket.',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },
  {
    id: 'PROD-ELE-004',
    vendorId: 'VND-002',
    vendorName: 'Larsen & Switchgear MEP Electricals',
    vendorCity: 'Chennai',
    vendorPhone: '+91 94440 88776',
    title: 'Philips Stellar Bright 12W B22 Cool Day LED Bulb (Pack of 10)',
    brand: 'Philips Lighting',
    category: 'Electrical Wiring & Switches',
    subcategory: 'LED Bulbs & Fixtures',
    mrpINR: 1500,
    priceINR: 990,
    discountPercent: 34,
    warrantyPeriod: '2 Year On-Site Replacement Guarantee',
    guaranteeNotes: 'EyeComfort technology, zero UV emissions, surge protection up to 4kV.',
    unit: 'Pack of 10 Bulbs',
    stockQty: 300,
    specs: '1200 Lumens Output, 6500K Cool Daylight, 25,000 Hours Lifespan.',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },

  // PLUMBING & PIPES
  {
    id: 'PROD-PLM-001',
    vendorId: 'VND-001',
    vendorName: 'Aquafab Water & Environmental Engineering',
    vendorCity: 'Bengaluru',
    vendorPhone: '+91 98450 11223',
    title: 'Astral CPVC Pro 1 Inch Heavy Pressure Hot & Cold Water Pipe (3m Length)',
    brand: 'Astral Pipes',
    category: 'Plumbing & Pipes',
    subcategory: 'CPVC Plumbing Pipes',
    mrpINR: 680,
    priceINR: 490,
    discountPercent: 28,
    warrantyPeriod: '25 Year Manufacturer Warranty',
    guaranteeNotes: 'NSF 61 Approved, Non-toxic Lead-free compound, withstands temperature up to 93°C.',
    unit: 'Per 3m Pipe',
    stockQty: 180,
    specs: 'SDR 11 Pressure Class, UV Resistant, No corrosion or scaling.',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },
  {
    id: 'PROD-PLM-002',
    vendorId: 'VND-001',
    vendorName: 'Aquafab Water & Environmental Engineering',
    vendorCity: 'Bengaluru',
    vendorPhone: '+91 98450 11223',
    title: 'Grundfos CMB3-46 Automatic Pressure Booster Water Pump 1.0 HP',
    brand: 'Grundfos',
    category: 'Water Pumps & ETP Equipment',
    subcategory: 'Water Pumps',
    mrpINR: 28500,
    priceINR: 22800,
    discountPercent: 20,
    warrantyPeriod: '2 Year On-Site Brand Warranty',
    guaranteeNotes: 'Stainless Steel AISI 304 Impeller, Dry-run protection, whisper quiet 55dB operation.',
    unit: 'Per Booster Pump',
    stockQty: 25,
    specs: 'Constant water pressure across 4 bathrooms simultaneously. Built-in PM1 pressure manager.',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },
  {
    id: 'PROD-PLM-003',
    vendorId: 'VND-001',
    vendorName: 'Aquafab Water & Environmental Engineering',
    vendorCity: 'Bengaluru',
    vendorPhone: '+91 98450 11223',
    title: 'Jaquar Florentine Chrome Single Lever Basin Mixer Tap',
    brand: 'Jaquar',
    category: 'Plumbing & Pipes',
    subcategory: 'Sanitaryware & Faucets',
    mrpINR: 4850,
    priceINR: 3600,
    discountPercent: 25,
    warrantyPeriod: '10 Year Complete Warranty',
    guaranteeNotes: 'Includes free home technician service. Chrome finish salt-spray tested for 450 hours.',
    unit: 'Per Tap Unit',
    stockQty: 45,
    specs: 'Brass body construction with honeycomb aerator for soft foam water flow.',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },

  // SOLAR PV & INVERTERS / BATTERIES / STRUCTURES
  {
    id: 'PROD-SOL-001',
    vendorId: 'VND-004',
    vendorName: 'SunEdison GreenTech Solar EPC',
    vendorCity: 'Pune',
    vendorPhone: '+91 97650 99881',
    title: 'Waaree 540W Bifacial Mono-PERC Solar Panel (ALMM Approved)',
    brand: 'Waaree Energies',
    category: 'Solar PV & Inverters',
    subcategory: 'Solar PV Modules',
    mrpINR: 18000,
    priceINR: 12800,
    discountPercent: 29,
    warrantyPeriod: '30 Year Linear Power Output Warranty',
    guaranteeNotes: 'Guaranteed 85% power retention after 25 years. Dual glass anti-reflective coating.',
    unit: 'Per Module',
    stockQty: 250,
    specs: '21.4% Module Efficiency, 144 Half-cut cells, Glass-Glass Dual Protection.',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },
  {
    id: 'PROD-SOL-002',
    vendorId: 'VND-004',
    vendorName: 'SunEdison GreenTech Solar EPC',
    vendorCity: 'Pune',
    vendorPhone: '+91 97650 99881',
    title: 'Growatt MIN 5000TL-X 5kW 1-Phase Grid-Tied Solar Inverter',
    brand: 'Growatt',
    category: 'Solar PV & Inverters',
    subcategory: 'Solar Inverters',
    mrpINR: 58000,
    priceINR: 42500,
    discountPercent: 26,
    warrantyPeriod: '5 Year Manufacturer Warranty (Extendable to 10 Yrs)',
    guaranteeNotes: 'Dual MPPT Tracker, 98.4% Efficiency, Built-in Wi-Fi Shine WiFi-X Dongle.',
    unit: 'Per Unit',
    stockQty: 40,
    specs: 'IP65 Waterproof Enclosure, Touch key OLED display, Anti-Islanding Protection.',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1558441719-6705166e03c0?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },
  {
    id: 'PROD-SOL-003',
    vendorId: 'VND-001',
    vendorName: 'Aquafab Water & Environmental Engineering',
    vendorCity: 'Bengaluru',
    vendorPhone: '+91 98450 11223',
    title: 'Luminous 15kWh 51.2V 300Ah LiFePO4 Lithium Battery Wall Mount',
    brand: 'Luminous Power',
    category: 'Batteries & Energy Storage',
    subcategory: 'Lithium Battery Packs',
    mrpINR: 260000,
    priceINR: 195000,
    discountPercent: 25,
    warrantyPeriod: '10 Year Replacement Guarantee',
    guaranteeNotes: '6000+ Cycle Life @ 80% DoD, Smart CAN/RS485 BMS Communication.',
    unit: 'Per Pack',
    stockQty: 15,
    specs: 'Maintenance-free, 3x longer life than tubular batteries, fast 2-hour charging.',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },

  // CIVIL BUILDING MATERIALS
  {
    id: 'PROD-CVL-001',
    vendorId: 'VND-003',
    vendorName: 'Godrej & Boyce Civil Engineering',
    vendorCity: 'Mumbai',
    vendorPhone: '+91 98200 44332',
    title: 'UltraTech Super Cement PPC 50kg Bag (IS 1489 Compliant)',
    brand: 'UltraTech Cement',
    category: 'Civil Building Materials',
    subcategory: 'Cement',
    mrpINR: 420,
    priceINR: 365,
    discountPercent: 13,
    warrantyPeriod: 'BIS Certified Quality Guarantee',
    guaranteeNotes: 'Micro-fine fly ash particles for high strength, sulphate resistance & zero crack curing.',
    unit: 'Per 50kg Bag',
    stockQty: 500,
    specs: 'PPC Portland Pozzolana Cement for RCC columns, slabs & brick masonry.',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },
  {
    id: 'PROD-CVL-002',
    vendorId: 'VND-003',
    vendorName: 'Godrej & Boyce Civil Engineering',
    vendorCity: 'Mumbai',
    vendorPhone: '+91 98200 44332',
    title: 'Tata Tiscon Fe550D Super Ductile TMT Rebar (1 Tonne - 12mm)',
    brand: 'Tata Steel',
    category: 'Civil Building Materials',
    subcategory: 'TMT Steel',
    mrpINR: 68000,
    priceINR: 58500,
    discountPercent: 14,
    warrantyPeriod: 'Original Factory Test Certificate Included',
    guaranteeNotes: 'Earthquake resistance steel with superior rib pattern for high concrete bond.',
    unit: 'Per Tonne',
    stockQty: 80,
    specs: 'Fe550D Grade TMT Bars. Corrosion resistant with high elongation %.',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },

  // INTERIOR & EXTERIOR RENOVATION
  {
    id: 'PROD-INT-001',
    vendorId: 'VND-003',
    vendorName: 'Godrej & Boyce Civil Engineering',
    vendorCity: 'Mumbai',
    vendorPhone: '+91 98200 44332',
    title: 'Kajaria 800x1600mm Polish Vitrified Floor Tiles (Box of 2 Pcs / 27.5 sqft)',
    brand: 'Kajaria Ceramics',
    category: 'Interior & Exterior Renovation',
    subcategory: 'Floor & Wall Tiles',
    mrpINR: 2400,
    priceINR: 1750,
    discountPercent: 27,
    warrantyPeriod: '10 Year Glaze & Crack Guarantee',
    guaranteeNotes: 'Ultra-low water absorption (<0.05%), stain proof nano-seal technology.',
    unit: 'Per Box (27.5 sqft)',
    stockQty: 140,
    specs: 'High gloss Italian Marble replica finish for living room & master bedroom.',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },
  {
    id: 'PROD-INT-002',
    vendorId: 'VND-003',
    vendorName: 'Godrej & Boyce Civil Engineering',
    vendorCity: 'Mumbai',
    vendorPhone: '+91 98200 44332',
    title: 'Asian Paints Royale Luxury Emulsion Interior Paint (20 Litre Bucket)',
    brand: 'Asian Paints',
    category: 'Interior & Exterior Renovation',
    subcategory: 'Paints & Coatings',
    mrpINR: 9800,
    priceINR: 7400,
    discountPercent: 24,
    warrantyPeriod: '8 Year Stain-Free Guarantee',
    guaranteeNotes: 'Teflon surface protector, washable wall finish with soft sheen smoothness.',
    unit: '20L Bucket',
    stockQty: 60,
    specs: 'Washable interior emulsion with anti-bacterial and anti-fungal properties.',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },
  {
    id: 'PROD-INT-003',
    vendorId: 'VND-003',
    vendorName: 'Godrej & Boyce Civil Engineering',
    vendorCity: 'Mumbai',
    vendorPhone: '+91 98200 44332',
    title: 'Asian Paints Apex Ultima Weatherproof Exterior Emulsion Paint (20 Litre)',
    brand: 'Asian Paints',
    category: 'Interior & Exterior Renovation',
    subcategory: 'Paints & Coatings',
    mrpINR: 11200,
    priceINR: 8500,
    discountPercent: 24,
    warrantyPeriod: '10 Year Exterior Weather Performance Warranty',
    guaranteeNotes: 'Colour Stay technology, high dirt pick-up resistance, protects against heavy monsoon & UV heat.',
    unit: '20L Bucket',
    stockQty: 50,
    specs: 'Advanced silicone technology exterior wall paint with algae resistance.',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },

  // Brand-wise & Category-wise Additions
  {
    id: 'PROD-CEM-001',
    vendorId: 'VND-001',
    vendorName: 'UltraTech Building Solutions Mart',
    vendorCity: 'Bengaluru',
    vendorPhone: '+91 98860 11223',
    title: 'UltraTech Super OPC 53 Grade High Compressive Cement (50kg)',
    brand: 'UltraTech Cement',
    category: 'Cement & AAC Blocks',
    subcategory: 'Cement Bags',
    mrpINR: 420,
    priceINR: 385,
    discountPercent: 8,
    warrantyPeriod: 'BIS IS 12269 Quality Certification',
    guaranteeNotes: '100% genuine factory fresh batch with test certificate.',
    unit: '50kg Bag',
    stockQty: 1000,
    specs: 'Compressive strength > 53 MPa at 28 days, ideal for RCC columns, slabs & foundations.',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },
  {
    id: 'PROD-STL-001',
    vendorId: 'VND-002',
    vendorName: 'Tata Tiscon Official Authorized Dealer',
    vendorCity: 'Pune',
    vendorPhone: '+91 98220 55443',
    title: 'Tata Tiscon Fe550D Super Ductile TMT Rebar Steel (12mm/16mm)',
    brand: 'Tata Tiscon',
    category: 'TMT Steel Rebars',
    subcategory: 'TMT Bars',
    mrpINR: 72000,
    priceINR: 67500,
    discountPercent: 6,
    warrantyPeriod: 'Tata Steel Mill Test Report',
    guaranteeNotes: 'Earthquake resistant Fe550D grade with superior rib design for concrete grip.',
    unit: 'Metric Tonne (MT)',
    stockQty: 50,
    specs: 'Ductile Fe550D TMT bar with low carbon content and high weldability.',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },
  {
    id: 'PROD-PUT-001',
    vendorId: 'VND-003',
    vendorName: 'Birla White WallCare Experience Center',
    vendorCity: 'Jaipur',
    vendorPhone: '+91 94140 33221',
    title: 'Birla White WallCare Polymer Modified Waterproof Putty (40kg Bag)',
    brand: 'Birla White',
    category: 'Paints & Wall Putty',
    subcategory: 'Wall Putty',
    mrpINR: 1100,
    priceINR: 920,
    discountPercent: 16,
    warrantyPeriod: 'Anti-Flaking Wall Adhesion Guarantee',
    guaranteeNotes: 'Extra HP polymers for zero flaking, smooth mirror-like wall base.',
    unit: '40kg Bag',
    stockQty: 250,
    specs: 'White cement based putty with water resistance for interior and exterior walls.',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },
  {
    id: 'PROD-BND-001',
    vendorId: 'VND-001',
    vendorName: 'Precast Boundary Solutions Dukandar',
    vendorCity: 'Hyderabad',
    vendorPhone: '+91 98490 88776',
    title: 'UltraTech Precast 8ft Heavy RCC Boundary Wall Panel System',
    brand: 'UltraTech Precast',
    category: 'Boundary Wall & Fencing',
    subcategory: 'Boundary Wall',
    mrpINR: 450,
    priceINR: 380,
    discountPercent: 15,
    warrantyPeriod: '20 Year Structural Integrity Warranty',
    guaranteeNotes: 'Pre-stressed high strength concrete planks, weather proof & fast installation.',
    unit: 'Running Foot (RFT)',
    stockQty: 2000,
    specs: '8ft high RCC boundary plank system for plot boundary and highway safety.',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },
  {
    id: 'PROD-RLG-001',
    vendorId: 'VND-002',
    vendorName: 'Jindal SS Railings & Hardware Studio',
    vendorCity: 'Mumbai',
    vendorPhone: '+91 98200 99887',
    title: 'Jindal SS304 Stainless Steel Balustrade & Toughened Glass Railing',
    brand: 'Jindal Stainless',
    category: 'SS & Glass Railings',
    subcategory: 'Glass Railing',
    mrpINR: 1750,
    priceINR: 1450,
    discountPercent: 17,
    warrantyPeriod: '15 Year Anti-Tarnish Corrosion Guarantee',
    guaranteeNotes: 'Heavy SS304 pillar fittings with 12mm Saint-Gobain toughened glass.',
    unit: 'Running Foot (RFT)',
    stockQty: 500,
    specs: 'Sleek, rust-proof architectural glass railing for balconies and staircases.',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },
  {
    id: 'PROD-SHP-001',
    vendorId: 'VND-003',
    vendorName: 'Dukan & Commercial Frontage Craft',
    vendorCity: 'Delhi NCR',
    vendorPhone: '+91 98100 22334',
    title: '12mm Toughened Glass Storefront Entrance with Dorma Patch Fittings',
    brand: 'Saint-Gobain / Dorma',
    category: 'Shop (Dukan) Renovation',
    subcategory: 'Glass Frontage',
    mrpINR: 520,
    priceINR: 420,
    discountPercent: 19,
    warrantyPeriod: '10 Year Structural Glass Warranty',
    guaranteeNotes: 'Crystal clear 12mm glass with heavy floor springs and SS handles.',
    unit: 'Square Foot (Sqft)',
    stockQty: 1500,
    specs: 'Commercial shop frontage renovation with lockable frameless glass doors.',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  },
  {
    id: 'PROD-OFF-001',
    vendorId: 'VND-001',
    vendorName: 'Office Infrastructure Fitouts Ltd',
    vendorCity: 'Bengaluru',
    vendorPhone: '+91 98800 33445',
    title: 'Acoustic Double Glazed Glass Partition Cabin System for Office Renovation',
    brand: 'Jindal Aluminium / Saint-Gobain',
    category: 'Office Renovation',
    subcategory: 'Glass Partitions',
    mrpINR: 680,
    priceINR: 580,
    discountPercent: 14,
    warrantyPeriod: '10 Year Frame Alignment Guarantee',
    guaranteeNotes: '42 dB sound attenuation for silent executive cabins & meeting rooms.',
    unit: 'Square Foot (Sqft)',
    stockQty: 3000,
    specs: 'Modular aluminium framed double glass cabin partitioning system.',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    isApproved: true
  }
];

export const SOLAR_EQUIPMENT_CATALOG: SolarEquipmentItem[] = [
  {
    componentName: 'Mono-PERC / Bifacial Solar PV Modules (ALMM Grade)',
    category: 'Solar PV Module',
    systemCompatibility: 'All',
    requiredQtyFor3KW: '6 Modules x 540Wp',
    topBrands: ['Tata Power Solar', 'Waaree Energies', 'Vikram Solar', 'Adani Solar', 'Premier Energies', 'Rayzon Solar'],
    approxCostINR: 76000,
    description: 'Converts sunlight into DC power. Bifacial panels generate 10-15% extra energy from rear roof reflections.'
  },
  {
    componentName: 'On-Grid String Inverter with Net-Metering Synchronizer',
    category: 'Inverter',
    systemCompatibility: 'On-Grid',
    requiredQtyFor3KW: '1 Unit (3kW 1-Phase)',
    topBrands: ['Growatt', 'Havells (Enviro)', 'Sungrow', 'GoodWe', 'Fronius', 'Enphase Microinverters'],
    approxCostINR: 34000,
    description: 'Converts DC to 230V AC grid voltage. Automatically shuts down during power outages to protect linemen (Anti-Islanding).'
  },
  {
    componentName: 'Hybrid PCU Solar Inverter with Off-Grid Switchover',
    category: 'Inverter',
    systemCompatibility: 'Hybrid',
    requiredQtyFor3KW: '1 Unit (3.5kVA / 48V)',
    topBrands: ['Luminous (Solarverter)', 'Microtek', 'Livguard', 'Eastman', 'UTL Solar', 'Studer'],
    approxCostINR: 48000,
    description: 'Combines grid export capability with battery storage backup during grid load-shedding.'
  },
  {
    componentName: 'Lithium LiFePO4 / Heavy Duty Tubular Battery Storage',
    category: 'Battery Bank',
    systemCompatibility: 'Off-Grid',
    requiredQtyFor3KW: '4 Units x 150Ah Tubular OR 1x 5kWh LFP Battery',
    topBrands: ['Exide Industries', 'Amaron Volt', 'Luminous Power', 'Livguard', 'Amita Lithium', 'Exide Sunday'],
    approxCostINR: 68000,
    description: 'Mandatory for Off-Grid / Hybrid systems. Stores excess daytime solar yield for night-time lighting & fans.'
  },
  {
    componentName: 'Bi-Directional Net Meter (DISCOM Approved)',
    category: 'Net Meter',
    systemCompatibility: 'On-Grid',
    requiredQtyFor3KW: '1 Unit (3-Phase / 1-Phase Approved)',
    topBrands: ['L&T Metering', 'Genus Power', 'HPL Electric', 'Schneider Electric', 'Secure Meters'],
    approxCostINR: 9500,
    description: 'Tracks energy imported from state DISCOM and energy exported to grid for monthly bill credit adjustments.'
  },
  {
    componentName: 'ACDB & DCDB Distribution Box with SPD & Surge Protection',
    category: 'ACDB / DCDB Box',
    systemCompatibility: 'All',
    requiredQtyFor3KW: '1 DCDB + 1 ACDB Box',
    topBrands: ['Siemens', 'Schneider Electric', 'ABB India', 'Legrand', 'Havells'],
    approxCostINR: 8500,
    description: 'Houses MCBs, Fuses, Type-II Surge Protection Devices (SPD) to protect solar panels from lightning voltage spikes.'
  },
  {
    componentName: 'Hot-Dip Galvanized High-Rise Aluminium Structures',
    category: 'Mounting Structure',
    systemCompatibility: 'All',
    requiredQtyFor3KW: '1 Set (Elevated Walkway / Roof Anchor)',
    topBrands: ['Tata Structural', 'Pennar Industries', 'Metalkraft', 'Ganga Solar', 'Jindal Steel'],
    approxCostINR: 18500,
    description: 'Wind-resistant up to 150 km/h. Holds solar panels at 12° to 18° optimal tilt angle towards True South.'
  },
  {
    componentName: 'Pure Copper Chemical Earthing Pit & UV DC Solar Cabling',
    category: 'Earthing & Cables',
    systemCompatibility: 'All',
    requiredQtyFor3KW: '3 Earthing Pits + 50m Solar Cable',
    topBrands: ['Polycab India', 'Havells', 'Finolex Cables', 'Lapp India', 'True Power Earthing'],
    approxCostINR: 14000,
    description: '3-point earthing (Inverter earth, Structure earth, Lightning Arrester) to prevent electrical shocks and fire hazards.'
  }
];

export const SAMPLE_LOAN_APPLICATIONS: LoanApplication[] = [
  {
    id: 'LN-2026-901',
    applicantName: 'Ramesh Sharma',
    applicantPhone: '+91 98112 33445',
    applicantCity: 'Delhi NCR',
    bankName: 'State Bank of India (SBI)',
    schemeName: 'SBI Surya Ghar Solar Rooftop Loan',
    loanType: 'PM Surya Ghar Solar Loan',
    requestedAmountINR: 180000,
    tenureMonths: 60,
    interestRatePct: 7.0,
    monthlyEmiINR: 3564,
    kycStatus: 'KYC Verified',
    appliedDate: '2026-07-22',
    cibilScore: 780,
    documents: [
      { docType: 'Aadhaar Card', fileName: 'aadhaar_ramesh.pdf', isUploaded: true, isVerified: true, uploadedAt: '2026-07-22' },
      { docType: 'PAN Card', fileName: 'pan_ramesh.pdf', isUploaded: true, isVerified: true, uploadedAt: '2026-07-22' },
      { docType: 'Electricity Bill', fileName: 'ebill_delhi.pdf', isUploaded: true, isVerified: true, uploadedAt: '2026-07-22' },
      { docType: '6 Month Bank Statement', fileName: 'sbi_statement_6m.pdf', isUploaded: true, isVerified: true, uploadedAt: '2026-07-22' },
      { docType: 'Project BOQ Estimate', fileName: '2click_boq_3kw.pdf', isUploaded: true, isVerified: true, uploadedAt: '2026-07-22' }
    ]
  },
  {
    id: 'LN-2026-902',
    applicantName: 'Priya Kulkarni',
    applicantPhone: '+91 97640 11223',
    applicantCity: 'Pune',
    bankName: 'Canara Bank',
    schemeName: 'Canara Green Renewable Rooftop Credit',
    loanType: 'PM Surya Ghar Solar Loan',
    requestedAmountINR: 240000,
    tenureMonths: 84,
    interestRatePct: 7.15,
    monthlyEmiINR: 3640,
    kycStatus: 'Pending Verification',
    appliedDate: '2026-07-26',
    cibilScore: 755,
    documents: [
      { docType: 'Aadhaar Card', fileName: 'aadhaar_priya.pdf', isUploaded: true, isVerified: true, uploadedAt: '2026-07-26' },
      { docType: 'PAN Card', fileName: 'pan_priya.pdf', isUploaded: true, isVerified: true, uploadedAt: '2026-07-26' },
      { docType: 'Electricity Bill', fileName: 'msedcl_bill.pdf', isUploaded: true, isVerified: false, uploadedAt: '2026-07-26' },
      { docType: '6 Month Bank Statement', fileName: 'hdfc_bank_st.pdf', isUploaded: true, isVerified: false, uploadedAt: '2026-07-26' },
      { docType: 'Project BOQ Estimate', fileName: 'solar_boq_pune.pdf', isUploaded: true, isVerified: true, uploadedAt: '2026-07-26' }
    ]
  }
];

export const SAMPLE_EMPANELLED_BRANDS: EmpanelledBrand[] = [
  {
    id: 'BRD-001',
    brandName: 'Polycab India Ltd.',
    companyLegalName: 'Polycab India Limited',
    category: 'Electrical Wiring & Switchgear',
    headquarters: 'Mumbai, Maharashtra',
    gstin: '27AAACP0123A1Z8',
    isEmpanelled: true,
    approvedStandards: 'IS 694 (FRLS Wires), IS 9537 (Conduits)',
    defaultDiscountPct: 28,
    warrantyPolicy: 'Lifetime Fire-Resistant Guarantee & 10 Yr Conduit Structural Warranty',
    itemCount: 42,
    contactPhone: '+91 1800 22 7070',
    logoUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'BRD-002',
    brandName: 'Finolex Cables',
    companyLegalName: 'Finolex Cables Limited',
    category: 'Electrical & Communication Cables',
    headquarters: 'Pune, Maharashtra',
    gstin: '27AAACF1020K1ZX',
    isEmpanelled: true,
    approvedStandards: 'IS 694, 100% Pure Bare Copper Grade',
    defaultDiscountPct: 26,
    warrantyPolicy: 'Lifetime Insulation Guarantee',
    itemCount: 35,
    contactPhone: '+91 1800 209 0101',
    logoUrl: 'https://images.unsplash.com/photo-1558441719-6705166e03c0?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'BRD-003',
    brandName: 'Astral Pipes',
    companyLegalName: 'Astral Limited',
    category: 'Plumbing & CPVC Piping',
    headquarters: 'Ahmedabad, Gujarat',
    gstin: '24AAACA5520M1Z2',
    isEmpanelled: true,
    approvedStandards: 'NSF 61 (Lead-Free Drinking Water), IS 15778',
    defaultDiscountPct: 30,
    warrantyPolicy: '10 Year Leak-Proof Lead-Free Guarantee',
    itemCount: 58,
    contactPhone: '+91 1800 233 7957',
    logoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'BRD-004',
    brandName: 'Supreme Industries',
    companyLegalName: 'The Supreme Industries Ltd',
    category: 'Plumbing, Tanks & Drainage',
    headquarters: 'Mumbai, Maharashtra',
    gstin: '27AAACS8840B1Z4',
    isEmpanelled: true,
    approvedStandards: 'IS 4985, Anti-Bacterial 3-Layer Food Grade',
    defaultDiscountPct: 25,
    warrantyPolicy: '10 Year UV Weathering & Crack Guarantee on Tanks',
    itemCount: 64,
    contactPhone: '+91 1800 102 4748',
    logoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'BRD-005',
    brandName: 'UltraTech Cement',
    companyLegalName: 'UltraTech Cement Ltd (Aditya Birla Group)',
    category: 'Civil Cement & Ready-Mix Concrete',
    headquarters: 'Mumbai, Maharashtra',
    gstin: '27AAACU1122L1ZP',
    isEmpanelled: true,
    approvedStandards: 'IS 1489 (PPC), IS 269 (OPC 53 Grade), Weather Plus Tech',
    defaultDiscountPct: 15,
    warrantyPolicy: 'Certified Strength Test Certificates for Every Batch',
    itemCount: 18,
    contactPhone: '+91 1800 210 3311',
    logoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'BRD-006',
    brandName: 'Tata Tiscon',
    companyLegalName: 'Tata Steel Limited',
    category: 'Civil Structural TMT Steel Rebars',
    headquarters: 'Jamshedpur, Jharkhand',
    gstin: '20AAACT0011C1Z0',
    isEmpanelled: true,
    approvedStandards: 'IS 1786 Fe 550D Super Ductile Earth-Quake Resistant',
    defaultDiscountPct: 12,
    warrantyPolicy: 'Standard Tata Steel Guarantee for Corrosion Resistance',
    itemCount: 22,
    contactPhone: '+91 1800 108 8282'
  },
  {
    id: 'BRD-007',
    brandName: 'Asian Paints',
    companyLegalName: 'Asian Paints Limited',
    category: 'Paints & Waterproofing Systems',
    headquarters: 'Mumbai, Maharashtra',
    gstin: '27AAACA0022P1Z1',
    isEmpanelled: true,
    approvedStandards: 'Royale Luxury Emulsion & Damp Proof Dr. Fixit Tech',
    defaultDiscountPct: 22,
    warrantyPolicy: '8 Year Waterproofing & Color Sheen Guarantee',
    itemCount: 75,
    contactPhone: '+91 1800 209 5678'
  },
  {
    id: 'BRD-008',
    brandName: 'Waaree Energies',
    companyLegalName: 'Waaree Energies Limited',
    category: 'Solar PV Modules & Inverters',
    headquarters: 'Mumbai, Maharashtra',
    gstin: '27AAACW9988D1Z9',
    isEmpanelled: true,
    approvedStandards: 'ALMM BIS Listed Tier-1 550Wp Mono PERC Bifacial',
    defaultDiscountPct: 25,
    warrantyPolicy: '25 Year Linear Performance Guarantee & 12 Yr Product Warranty',
    itemCount: 30,
    contactPhone: '+91 1800 212 1321'
  },
  {
    id: 'BRD-009',
    brandName: 'Havells India',
    companyLegalName: 'Havells India Limited',
    category: 'Modular Switches, MCBs & Lighting',
    headquarters: 'Noida, Uttar Pradesh',
    gstin: '09AAACH1234F1Z3',
    isEmpanelled: true,
    approvedStandards: 'IS 8828 (MCBs), IS 3854 (Modular Switches)',
    defaultDiscountPct: 27,
    warrantyPolicy: '10 Year Switch Mechanical Warranty & 2 Yr LED Replacement',
    itemCount: 88,
    contactPhone: '+91 1800 103 1313'
  },
  {
    id: 'BRD-010',
    brandName: 'Jaquar Group',
    companyLegalName: 'Jaquar & Company Private Limited',
    category: 'Sanitaryware & Bath Fittings',
    headquarters: 'Manesar, Haryana',
    gstin: '06AAACJ4433E1Z5',
    isEmpanelled: true,
    approvedStandards: 'IS 2556, Chrome Plating 0.3 Micron Standard',
    defaultDiscountPct: 23,
    warrantyPolicy: '10 Year Unconditional Free Service & Valve Warranty',
    itemCount: 95,
    contactPhone: '+91 1800 121 6800'
  }
];

export const SAMPLE_MATERIALS_WITH_FITTING: MaterialWithFittingItem[] = [
  // Cement & AAC Blocks
  {
    id: 'MAT-CEM-01',
    itemTitle: 'UltraTech Super OPC 53 Grade High Early Strength Cement',
    brandName: 'UltraTech Cement',
    modelNumber: 'UT-OPC53-50KG',
    category: 'Cement & AAC Blocks',
    unit: '50kg Bag',
    materialPriceINR: 390,
    fittingLaborChargeINR: 60,
    laborRateUnit: 'per bag mixing & concrete casting',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    specs: 'Compressive strength > 53 MPa at 28 days, Low C3A heat of hydration',
    warranty: 'BIS Test Certificate Guarantee',
    empanelledSupplier: 'Karnataka Cement Depot, Bengaluru',
    plumberOrElectricianRole: 'Mason'
  },
  {
    id: 'MAT-CEM-02',
    itemTitle: 'Ambuja Kawach Waterproof & Damp-Proof Cement',
    brandName: 'Ambuja Cements',
    modelNumber: 'AMB-KAWACH-50KG',
    category: 'Cement & AAC Blocks',
    unit: '50kg Bag',
    materialPriceINR: 410,
    fittingLaborChargeINR: 65,
    laborRateUnit: 'per bag plastering & roof waterproofing',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    specs: 'Hydrophobic silane technology, prevents saltpetre / efflorescence',
    warranty: 'Anti-Dampness Certificate Guarantee',
    empanelledSupplier: 'Shree Balaji Dukandar Mart, Mumbai',
    plumberOrElectricianRole: 'Mason'
  },
  {
    id: 'MAT-CEM-03',
    itemTitle: 'Siporex / Aerocon Thermal Insulated AAC Blocks (600x200x150mm)',
    brandName: 'Siporex India',
    modelNumber: 'SIP-AAC-150MM',
    category: 'Cement & AAC Blocks',
    unit: 'Cubic Meter (CBM)',
    materialPriceINR: 3600,
    fittingLaborChargeINR: 850,
    laborRateUnit: 'per CBM block masonry labor',
    imageUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80',
    specs: 'Dry density 550-650 kg/m3, 4-hour fire rating, 30% reduction in dead weight',
    warranty: 'Structural Load Certification',
    empanelledSupplier: 'National AAC Block Suppliers, Delhi NCR',
    plumberOrElectricianRole: 'Mason'
  },

  // Bricks & Red Clay
  {
    id: 'MAT-BRK-01',
    itemTitle: 'Wienerberger Porotherm Smart Clay Hollow Insulated Bricks',
    brandName: 'Wienerberger',
    modelNumber: 'WNB-PORO-400X200',
    category: 'Bricks & Red Clay',
    unit: 'Thousand Pieces (1000 Nos)',
    materialPriceINR: 9800,
    fittingLaborChargeINR: 2400,
    laborRateUnit: 'per 1000 brick laying labor',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    specs: 'Natural red clay, 60% lighter than solid bricks, thermal thermal comfort',
    warranty: 'Lifetime Clay Integrity Warranty',
    empanelledSupplier: 'Deccan Brick Works, Hyderabad',
    plumberOrElectricianRole: 'Mason'
  },
  {
    id: 'MAT-BRK-02',
    itemTitle: 'Class-1 High Compressive Strength Red Clay Kiln Bricks',
    brandName: 'Local Kiln Class-1',
    modelNumber: 'RED-BRK-CLS1',
    category: 'Bricks & Red Clay',
    unit: 'Thousand Pieces (1000 Nos)',
    materialPriceINR: 7200,
    fittingLaborChargeINR: 1800,
    laborRateUnit: 'per 1000 brick laying labor',
    imageUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80',
    specs: 'Red burnt clay, sharp edges, crushing strength > 10.5 N/mm2',
    warranty: 'Quality Checked Batch Test',
    empanelledSupplier: 'Ganga Valley Kiln Traders, Lucknow',
    plumberOrElectricianRole: 'Mason'
  },

  // TMT Steel Rebars
  {
    id: 'MAT-STL-01',
    itemTitle: 'Tata Tiscon Fe550D Super Ductile TMT Rebar Steel (12mm / 16mm)',
    brandName: 'Tata Tiscon',
    modelNumber: 'TATA-FE550D-12MM',
    category: 'TMT Steel Rebars',
    unit: 'Metric Tonne (MT)',
    materialPriceINR: 67500,
    fittingLaborChargeINR: 4200,
    laborRateUnit: 'per MT cutting, bending & binding labor',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    specs: 'Earthquake resistant Fe550D grade, superior rib pattern for high concrete bond',
    warranty: 'Tata Steel Mill Test Certificate Guarantee',
    empanelledSupplier: 'Apex Steel & Iron Mart, Pune',
    plumberOrElectricianRole: 'Sub-Contractor'
  },
  {
    id: 'MAT-STL-02',
    itemTitle: 'JSW Neosteel 550D High Ductility Corrosion Resistant Rebars',
    brandName: 'JSW Steel',
    modelNumber: 'JSW-NEO-550D',
    category: 'TMT Steel Rebars',
    unit: 'Metric Tonne (MT)',
    materialPriceINR: 65800,
    fittingLaborChargeINR: 4000,
    laborRateUnit: 'per MT rebar placement & cage tying',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    specs: '100% Virgin steel, low sulphur and phosphorus, IS 1786 Fe550D certified',
    warranty: 'JSW Manufacturer Test Report',
    empanelledSupplier: 'Western India Steel Corporation, Ahmedabad',
    plumberOrElectricianRole: 'Sub-Contractor'
  },

  // Paints & Wall Putty
  {
    id: 'MAT-PNT-01',
    itemTitle: 'Asian Paints Royale Aspira Interior Luxury Sheen Paint',
    brandName: 'Asian Paints',
    modelNumber: 'AP-ROYALE-ASP-20L',
    category: 'Paints & Wall Putty',
    unit: '20 Liter Bucket',
    materialPriceINR: 12400,
    fittingLaborChargeINR: 1800,
    laborRateUnit: 'per 20L application (2 coats with primer)',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
    specs: 'Teflon surface protector, washable crack-bridging sheen finish, zero VOC',
    warranty: '5 Year Sheen & Color Retention Warranty',
    empanelledSupplier: 'Rainbow Color House Dukandar, Jaipur',
    plumberOrElectricianRole: 'Painter'
  },
  {
    id: 'MAT-PNT-02',
    itemTitle: 'Birla White WallCare Polymer Modified Waterproof White Putty',
    brandName: 'Birla White',
    modelNumber: 'BIRLA-PUTTY-40KG',
    category: 'Paints & Wall Putty',
    unit: '40kg Bag',
    materialPriceINR: 920,
    fittingLaborChargeINR: 350,
    laborRateUnit: 'per 40kg bag double coat smooth sanding',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
    specs: 'White cement based putty with extra HP polymers, prevents paint flaking',
    warranty: 'Adhesion Guarantee Certificate',
    empanelledSupplier: 'City Paint & Hardware Store, Chandigarh',
    plumberOrElectricianRole: 'Painter'
  },

  // Boundary Wall & Fencing
  {
    id: 'MAT-BND-01',
    itemTitle: 'Precast Reinforced Concrete Boundary Wall Panels & Column Posts',
    brandName: 'Ultratech Precast',
    modelNumber: 'PRC-BWALL-8FT',
    category: 'Boundary Wall & Fencing',
    unit: 'Running Foot (RFT)',
    materialPriceINR: 380,
    fittingLaborChargeINR: 120,
    laborRateUnit: 'per RFT post erection & panel fitting',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    specs: '8ft height prestressed RCC plank system, rapid 1-day installation, high wind load capacity',
    warranty: '20 Year Structural Integrity Warranty',
    empanelledSupplier: 'Prism Precast Boundary Solutions, Bengaluru',
    plumberOrElectricianRole: 'Sub-Contractor'
  },
  {
    id: 'MAT-BND-02',
    itemTitle: 'Tata Wiron Heavy Duty Galvanized Anti-Rust Barbed Wire Fencing',
    brandName: 'Tata Wiron',
    modelNumber: 'TATA-WRN-BARB-200M',
    category: 'Boundary Wall & Fencing',
    unit: 'Roll (200 Meters)',
    materialPriceINR: 3400,
    fittingLaborChargeINR: 650,
    laborRateUnit: 'per roll stretching & angle post fixing',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    specs: 'Zinc coated 270 GSM heavy galvanized wire, sharp 4-point barbs, weather proof',
    warranty: '10 Year Rust-Free Warranty',
    empanelledSupplier: 'Balaji Hardware & Fencing Mart, Hyderabad',
    plumberOrElectricianRole: 'General Vendor'
  },

  // SS & Glass Railings
  {
    id: 'MAT-RLG-01',
    itemTitle: 'Jindal SS304 Stainless Steel Balustrade & Glass Railing System',
    brandName: 'Jindal Stainless',
    modelNumber: 'JND-SS304-RLG-12MM',
    category: 'SS & Glass Railings',
    unit: 'Running Foot (RFT)',
    materialPriceINR: 1450,
    fittingLaborChargeINR: 350,
    laborRateUnit: 'per RFT precision glass bracket installation',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    specs: '12mm Toughened Glass with SS304 Grade Heavy Pillars, mirror polish finish',
    warranty: '15 Year Anti-Tarnish Warranty',
    empanelledSupplier: 'Royal Glass & Steel Craft, Mumbai',
    plumberOrElectricianRole: 'Sub-Contractor'
  },
  {
    id: 'MAT-RLG-02',
    itemTitle: 'Ozone Architectural Hardware Glass Railing Base Shoe Profile',
    brandName: 'Ozone Overseas',
    modelNumber: 'OZN-SHOE-ALUM-3M',
    category: 'SS & Glass Railings',
    unit: '3 Meter Length',
    materialPriceINR: 6200,
    fittingLaborChargeINR: 900,
    laborRateUnit: 'per length anchor bolting & glass alignment',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    specs: 'Heavy Anodized Aluminium Continuous Base Track, holds 12-15mm toughened glass',
    warranty: '10 Year Structural Anchor Warranty',
    empanelledSupplier: 'Ozone Experience Center, Delhi NCR',
    plumberOrElectricianRole: 'Sub-Contractor'
  },

  // Kitchen & Bathroom Upgrades
  {
    id: 'MAT-KITCH-01',
    itemTitle: 'Sleek Modular Kitchen Quartz Countertop & Soft-Close Tandem Drawers',
    brandName: 'Sleek by Asian Paints',
    modelNumber: 'SLK-MOD-KITCH-QUARTZ',
    category: 'Kitchen & Bath Upgrades',
    unit: 'Running Foot (RFT)',
    materialPriceINR: 3800,
    fittingLaborChargeINR: 750,
    laborRateUnit: 'per RFT cabinet alignment & countertop cutting',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    specs: 'BWP marine ply carcass, Blum soft-close tandem drawers, 18mm Nano Quartz top',
    warranty: '10 Year Termite & Water Proof Guarantee',
    empanelledSupplier: 'Sleek Kitchen Studio, Kolkata',
    plumberOrElectricianRole: 'Carpenter'
  },

  // Custom Interiors & Panels
  {
    id: 'MAT-INT-01',
    itemTitle: 'CenturyPly Club Prime BWP Marine Grade Waterproof Plywood (19mm)',
    brandName: 'CenturyPly',
    modelNumber: 'CEN-CLUB-PRIME-19MM',
    category: 'Custom Interiors & Panels',
    unit: 'Sheet (8x4 Feet / 32 Sqft)',
    materialPriceINR: 4100,
    fittingLaborChargeINR: 650,
    laborRateUnit: 'per sheet carpentry framing',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    specs: 'ViroKill anti-viral technology, IS 710 BWP certified, Glue Line Protection',
    warranty: 'Lifetime 30-Year Guarantee',
    empanelledSupplier: 'Plywood King Dukandar Mart, Chennai',
    plumberOrElectricianRole: 'Carpenter'
  },
  {
    id: 'MAT-INT-02',
    itemTitle: 'Charcoal PVC Fluted Wall Louver Panels for Feature Accent Walls',
    brandName: 'Euro Pratik',
    modelNumber: 'EUR-FLUTED-9FT',
    category: 'Custom Interiors & Panels',
    unit: 'Panel (9ft x 6 inch)',
    materialPriceINR: 1150,
    fittingLaborChargeINR: 250,
    laborRateUnit: 'per panel silicone adhesive installation',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    specs: '100% Waterproof & Termite Proof High Density Polymer, metallic foil sheen',
    warranty: '10 Year Color Sheen Warranty',
    empanelledSupplier: 'Modern Decor & Panels, Pune',
    plumberOrElectricianRole: 'Carpenter'
  },

  // Shop (Dukan) Renovation
  {
    id: 'MAT-SHP-01',
    itemTitle: 'Toughened Glass Frontage Storefront with Frameless Patch Fittings',
    brandName: 'Saint-Gobain / Dorma',
    modelNumber: 'STG-DUKAN-GLASS-12MM',
    category: 'Shop (Dukan) Renovation',
    unit: 'Square Foot (Sqft)',
    materialPriceINR: 420,
    fittingLaborChargeINR: 110,
    laborRateUnit: 'per sqft glass hoisting & floor spring installation',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
    specs: '12mm Clear Saint-Gobain Toughened Glass with Dorma SS304 heavy patch lock',
    warranty: '10 Year Glass Clarity & Patch Warranty',
    empanelledSupplier: 'Commercial Glass Solutions, Delhi NCR',
    plumberOrElectricianRole: 'Sub-Contractor'
  },

  // Office Renovation
  {
    id: 'MAT-OFF-01',
    itemTitle: 'Acoustic Double Glazed Aluminium Glass Office Cabin Partitioning System',
    brandName: 'Jindal Aluminium / Saint-Gobain',
    modelNumber: 'JND-OFFICE-CABIN-PART',
    category: 'Office Renovation',
    unit: 'Square Foot (Sqft)',
    materialPriceINR: 580,
    fittingLaborChargeINR: 140,
    laborRateUnit: 'per sqft partition channel fixing & glass fitting',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
    specs: '42 dB sound attenuation acoustic insulation, powder coated aluminium section',
    warranty: '10 Year Structural Partition Warranty',
    empanelledSupplier: 'Corporate Office Fitouts Ltd, Bengaluru',
    plumberOrElectricianRole: 'Sub-Contractor'
  }
];

export const SAMPLE_GOVT_TENDERS: GovernmentAwardedTender[] = [
  {
    id: 'TND-GOVT-001',
    tenderNumber: 'CPWD/2026/DEL/OFF-0842',
    issuingAuthority: 'CPWD',
    projectTitle: 'Renovation & Interior Fitout of Government Secretariat Block B (Delhi NCR)',
    primeContractorName: 'Larsen & Toubro Construction Ltd (L1 Awarded Prime)',
    primeContractorGstin: '07AAACL1234F1Z9',
    awardedProjectValueINR: 48500000,
    workCategory: 'Government Office Renovation',
    locationStateCity: 'Delhi NCR',
    subBiddingDeadline: '2026-08-15',
    tenderStatus: 'Sub-Bidding Open',
    contactPersonPhone: '+91 98110 44332',
    requiredMaterialsAndSubcontracts: [
      {
        category: 'Paints & Wall Putty',
        brandPreferred: 'Asian Paints / Birla White',
        requiredQuantity: '1,200 Liters Sheen Paint + 300 Bags Birla Putty',
        targetEstimatedBudgetINR: 1450000
      },
      {
        category: 'SS & Glass Railings',
        brandPreferred: 'Jindal SS304 / Ozone',
        requiredQuantity: '850 Running Feet SS Glass Balustrade',
        targetEstimatedBudgetINR: 1800000
      },
      {
        category: 'Office Renovation',
        brandPreferred: 'Saint-Gobain Glass',
        requiredQuantity: '12,500 Sqft Acoustic Glass Cabins',
        targetEstimatedBudgetINR: 8200000
      }
    ]
  },
  {
    id: 'TND-GOVT-002',
    tenderNumber: 'PWD/KAR/2026/HWY-102',
    issuingAuthority: 'State PWD',
    projectTitle: 'Construction of 12 KM Highway Precast Boundary Wall & Fencing (Bengaluru Outer Ring)',
    primeContractorName: 'KNR Constructions Ltd (L1 Awarded Prime)',
    primeContractorGstin: '29AAACK9988E1Z4',
    awardedProjectValueINR: 82000000,
    workCategory: 'Highway & Boundary Wall Construction',
    locationStateCity: 'Bengaluru, Karnataka',
    subBiddingDeadline: '2026-08-20',
    tenderStatus: 'Sub-Bidding Open',
    contactPersonPhone: '+91 98450 77889',
    requiredMaterialsAndSubcontracts: [
      {
        category: 'Boundary Wall & Fencing',
        brandPreferred: 'Precast RCC / Tata Wiron',
        requiredQuantity: '15,000 Running Feet 8ft Precast Panel Boundary',
        targetEstimatedBudgetINR: 7500000
      },
      {
        category: 'Cement & Concrete',
        brandPreferred: 'UltraTech / Ambuja',
        requiredQuantity: '12,000 Bags OPC 53 Grade',
        targetEstimatedBudgetINR: 4680000
      },
      {
        category: 'TMT Steel Rebars',
        brandPreferred: 'Tata Tiscon / JSW Neosteel',
        requiredQuantity: '180 Metric Tonnes Fe550D Rebar',
        targetEstimatedBudgetINR: 12150000
      }
    ]
  },
  {
    id: 'TND-GOVT-003',
    tenderNumber: 'SMC/UP/LKO/SHOP-332',
    issuingAuthority: 'Smart City Mission',
    projectTitle: 'Smart City Commercial Shopping Complex Dukan Renovation & Signage (Lucknow)',
    primeContractorName: 'NCC Infra Projects Ltd (L1 Awarded Prime)',
    primeContractorGstin: '09AAACN8877G1Z1',
    awardedProjectValueINR: 32000000,
    workCategory: 'Commercial Complex & Dukans',
    locationStateCity: 'Lucknow, Uttar Pradesh',
    subBiddingDeadline: '2026-08-25',
    tenderStatus: 'Sub-Bidding Open',
    contactPersonPhone: '+91 94150 11223',
    requiredMaterialsAndSubcontracts: [
      {
        category: 'Shop (Dukan) Renovation',
        brandPreferred: 'Dorma / Saint-Gobain',
        requiredQuantity: '48 Dukans Toughened Glass Frontage',
        targetEstimatedBudgetINR: 3800000
      },
      {
        category: 'Bricks & AAC Blocks',
        brandPreferred: 'Siporex / Wienerberger Porotherm',
        requiredQuantity: '850 CBM AAC Blocks',
        targetEstimatedBudgetINR: 3060000
      }
    ]
  }
];

export const SAMPLE_SARKAR_SUB_BIDS: SarkarSubBid[] = [
  {
    id: 'SUB-BID-101',
    tenderId: 'TND-GOVT-001',
    tenderNumber: 'CPWD/2026/DEL/OFF-0842',
    biddingVendorName: 'Rainbow Paint & Hardware Dukandar Mart',
    biddingVendorRole: 'Dukandar',
    biddingVendorGstin: '07AAACR9988A1Z5',
    categoryOffered: 'Paints & Wall Putty',
    brandOffered: 'Asian Paints Royale + Birla White Putty',
    quotedUnitPriceINR: 580,
    quotedTotalValueINR: 1320000,
    deliveryTimelineDays: 14,
    bidStatus: 'Shortlisted',
    bidDate: '2026-07-25',
    remarks: 'Direct factory supply with test certificate and free site delivery in 3 batches.'
  },
  {
    id: 'SUB-BID-102',
    tenderId: 'TND-GOVT-002',
    tenderNumber: 'PWD/KAR/2026/HWY-102',
    biddingVendorName: 'Prism Precast Infrastructure Suppliers',
    biddingVendorRole: 'Supplier',
    biddingVendorGstin: '29AAACP4455H1Z3',
    categoryOffered: 'Boundary Wall & Fencing',
    brandOffered: 'UltraTech Precast 8ft RCC Plank System',
    quotedUnitPriceINR: 470,
    quotedTotalValueINR: 7050000,
    deliveryTimelineDays: 21,
    bidStatus: 'Submitted',
    bidDate: '2026-07-27',
    remarks: 'Includes post erection, panel slotting & 15-year weather coating guarantee.'
  }
];


export const SAMPLE_NAKSHA_PLANS: HouseNakshaPlan[] = [
  {
    id: 'NAK-3040-N',
    title: '30x40 Ft North Facing 3BHK Modern Duplex Naksha',
    plotDimensionsFt: '30 ft x 40 ft',
    totalAreaSqft: 1200,
    facingDirection: 'North',
    bhkConfig: '3BHK',
    architectName: 'Ar. Rajesh Vastu Associates',
    architectRating: 4.9,
    vastuScorePct: 96,
    estimatedConstructionCostINR: 3250000,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    floorplan2DUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    features: [
      'Ishan Kona (NE) Main Gate & Open Garden',
      'Agni Kona (SE) Kitchen with Granite Slab',
      'Nairutya Kona (SW) Master Bedroom G+1',
      'Vayu Kona (NW) Guest Room & Bathroom',
      'Covered Car Parking & Underground Sump'
    ],
    description: '100% Vastu-compliant 30x40 feet plot layout design with double-height ceiling living room, spacious master balcony, and 3D front elevation blueprints.'
  },
  {
    id: 'NAK-2050-E',
    title: '20x50 Ft East Facing 2BHK Renovation House Naksha',
    plotDimensionsFt: '20 ft x 50 ft',
    totalAreaSqft: 1000,
    facingDirection: 'East',
    bhkConfig: '2BHK',
    architectName: 'Ar. Deepa Design Studio',
    architectRating: 4.8,
    vastuScorePct: 92,
    estimatedConstructionCostINR: 2400000,
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    features: [
      'East Facing Natural Morning Sun Entrance',
      'SE Agni Kitchen with Modular Chimney',
      'SW Master Suite with Walk-in Wardrobe',
      'External Staircase for Rental Potential',
      'Compact Skylight Ventilation Courtyard'
    ],
    description: 'Perfect for narrow plot renovation or new house construction. Optimizes light airflow with Vastu-balanced room coordinates.'
  },
  {
    id: 'NAK-4060-S',
    title: '40x60 Ft South-East Facing 4BHK Luxury Villa Naksha',
    plotDimensionsFt: '40 ft x 60 ft',
    totalAreaSqft: 2400,
    facingDirection: 'South',
    bhkConfig: '4BHK Villa',
    architectName: 'Vanguard Architects & BIM Consultants',
    architectRating: 4.9,
    vastuScorePct: 89,
    estimatedConstructionCostINR: 6500000,
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    features: [
      'Grand East Gate Entrance Corridor',
      'Private Home Theater Room on First Floor',
      'NE Ishan Puja Room with Marble Inlay',
      'Rooftop Solar Ready Deck & Terrace Garden',
      'Dual Car Garage with EV Charging Point'
    ],
    description: 'Ultra-luxurious 4BHK Villa blueprint with structural CAD drawings, electrical MEP diagrams, and custom Vastu corrective pyramid placements.'
  },
  {
    id: 'NAK-3050-W',
    title: '30x50 Ft West Facing 3BHK Compact Duplex Plan',
    plotDimensionsFt: '30 ft x 50 ft',
    totalAreaSqft: 1500,
    facingDirection: 'West',
    bhkConfig: 'Duplex Plan',
    architectName: 'Ar. Vikram Vastu Architecture',
    architectRating: 4.7,
    vastuScorePct: 94,
    estimatedConstructionCostINR: 3900000,
    imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
    features: [
      'West Entrance with Vastu Brass Door Studs',
      'SE Kitchen & SW Master Bedroom',
      'North-East Open Lawn & Borewell Point',
      'Spacious Kitchen Store & Utility Wash Area'
    ],
    description: 'Modern West-facing home plan engineered for optimal thermal insulation and full Vastu compliance.'
  }
];

export const SAMPLE_VASTU_RULES: VastuRoomRule[] = [
  {
    roomName: 'Main Entrance',
    idealDirections: ['North', 'East', 'North-East (Ishan)'],
    currentDirection: 'North-East',
    isCompliant: true,
    score: 100,
    importanceLevel: 'Critical',
    vastuNotes: 'Main door in North-East brings prosperity, positive energy flow, and good health for residents.',
    remedyIfFlawed: 'Place a Brass Swastika or Om symbol above the doorway and install a wooden threshold.'
  },
  {
    roomName: 'Kitchen',
    idealDirections: ['South-East (Agni Kona)', 'North-West (Vayu Kona)'],
    currentDirection: 'South-East',
    isCompliant: true,
    score: 100,
    importanceLevel: 'Critical',
    vastuNotes: 'Agni Kona governs fire element. Stove facing East ensures happiness during meal preparation.',
    remedyIfFlawed: 'If in South-West or North-East, place a yellow marble slab under stove and install copper pyramid.'
  },
  {
    roomName: 'Master Bedroom',
    idealDirections: ['South-West (Nairutya Kona)'],
    currentDirection: 'South-West',
    isCompliant: true,
    score: 100,
    importanceLevel: 'Critical',
    vastuNotes: 'Nairutya Kona provides stability, leadership, and peaceful sleep for head of family.',
    remedyIfFlawed: 'Keep heavy furniture in South-West corner and sleep with head towards South or East.'
  },
  {
    roomName: 'Puja Room',
    idealDirections: ['North-East (Ishan Kona)', 'East', 'North'],
    currentDirection: 'North-East',
    isCompliant: true,
    score: 100,
    importanceLevel: 'High',
    vastuNotes: 'Ishan Kona is divine energy direction. Idol faces East or West.',
    remedyIfFlawed: 'Maintain clean clutter-free space with white/cream marble flooring and light brass lamps.'
  },
  {
    roomName: 'Toilet & Septic Tank',
    idealDirections: ['North-West (Vayu Kona)', 'South-of-South-West'],
    currentDirection: 'North-West',
    isCompliant: true,
    score: 100,
    importanceLevel: 'High',
    vastuNotes: 'Prevents negative energy accumulation when placed in North-West Vayu direction.',
    remedyIfFlawed: 'Never place in North-East. If wrongly positioned, place sea salt bowls and Vastu copper strip.'
  },
  {
    roomName: 'Overhead Water Tank',
    idealDirections: ['South-West (Nairutya Kona)', 'West'],
    currentDirection: 'South-West',
    isCompliant: true,
    score: 100,
    importanceLevel: 'Medium',
    vastuNotes: 'Adds weight to South-West, enhancing stability and financial growth.',
    remedyIfFlawed: 'Do not place overhead water tank directly above Master Bedroom or Kitchen.'
  }
];

export const SAMPLE_CONVERSATIONS: VendorConversation[] = [
  {
    id: 'CONV-001',
    vendorId: 'ARCH-101',
    vendorName: 'Ar. Rajesh Sharma (Senior Architect)',
    vendorRole: 'Architect',
    vendorPhone: '+91 98450 12345',
    projectTopic: '30x40 Ft 3BHK Naksha CAD & Vastu Certification',
    lastUpdated: '10:15 AM',
    unreadCount: 1,
    messages: [
      {
        id: 'm1',
        senderId: 'user',
        senderName: 'Client (You)',
        senderRole: 'Client',
        text: 'Namaste Ar. Rajesh, I liked your 30x40 North facing Naksha. Can we customize the kitchen to South-East Agni Kona with a utility wash space?',
        timestamp: 'Yesterday 04:30 PM'
      },
      {
        id: 'm2',
        senderId: 'ARCH-101',
        senderName: 'Ar. Rajesh Sharma',
        senderRole: 'Architect',
        text: 'Namaste! Yes, absolutely. I have modified the CAD drawing to place the Agni Kona kitchen with 6ft utility. Attached the revised Naksha blueprint.',
        timestamp: '10:15 AM',
        attachments: [{ title: 'Revised_30x40_Naksha_Vastu_Signed.pdf', type: 'Naksha PDF' }]
      }
    ]
  },
  {
    id: 'CONV-002',
    vendorId: 'PLUMB-202',
    vendorName: 'Ramesh Plumber & Sanitary Works',
    vendorRole: 'Plumber',
    vendorPhone: '+91 97110 56789',
    projectTopic: 'Concealed CPVC Pipe Fitting & Jaquar Diverter Labor Rates',
    lastUpdated: '09:40 AM',
    unreadCount: 0,
    messages: [
      {
        id: 'm1',
        senderId: 'user',
        senderName: 'Client (You)',
        senderRole: 'Client',
        text: 'Hi Ramesh ji, what will be your fitting rate per bathroom for Astral CPVC pipes + Jaquar concealed diverters for my 3 bathrooms?',
        timestamp: 'Yesterday 06:10 PM'
      },
      {
        id: 'm2',
        senderId: 'PLUMB-202',
        senderName: 'Ramesh Plumber',
        senderRole: 'Plumber',
        text: 'Bhai sahib, my fitting rate is ₹1,800 per bathroom set including pressure testing & overhead 1000L tank connection with 5 years leak guarantee!',
        timestamp: '09:40 AM',
        attachments: [{ title: 'Plumbing_Labor_Estimate_3Baths.pdf', type: 'BOQ Quote' }]
      }
    ]
  },
  {
    id: 'CONV-003',
    vendorId: 'ELEC-303',
    vendorName: 'Suresh Electrician & MEP Contractor',
    vendorRole: 'Electrician',
    vendorPhone: '+91 99801 44332',
    projectTopic: 'House Point Wiring, Havells Board & MCB DB Installation',
    lastUpdated: '02 days ago',
    unreadCount: 0,
    messages: [
      {
        id: 'm1',
        senderId: 'user',
        senderName: 'Client (You)',
        senderRole: 'Client',
        text: 'Suresh ji, please share rate for 1800 sqft wiring with Polycab wires and Schneider 12-way MCB panel.',
        timestamp: '02 days ago'
      },
      {
        id: 'm2',
        senderId: 'ELEC-303',
        senderName: 'Suresh Electrician',
        senderRole: 'Electrician',
        text: 'Namaste! Point wiring rate is ₹350 per point + ₹1,500 for main DB panel earthing & load balancing. Fully certified team.',
        timestamp: '02 days ago'
      }
    ]
  },
  {
    id: 'CONV-004',
    vendorId: 'DUK-404',
    vendorName: 'Balaji Building Material Dukandar Mart',
    vendorRole: 'Dukandar',
    vendorPhone: '+91 98220 99887',
    projectTopic: 'Bulk Cement OPC 53 & Tata Tiscon Rebar Supply Rates',
    lastUpdated: '03 days ago',
    unreadCount: 0,
    messages: [
      {
        id: 'm1',
        senderId: 'user',
        senderName: 'Client (You)',
        senderRole: 'Client',
        text: 'Hello Dukandar Sahib, what is the best wholesale price for 450 bags UltraTech Cement and 6 Tonne Tata Tiscon Fe550D steel?',
        timestamp: '03 days ago'
      },
      {
        id: 'm2',
        senderId: 'DUK-404',
        senderName: 'Balaji Dukandar',
        senderRole: 'Dukandar',
        text: 'We offer ₹380/bag for UltraTech + ₹67,500/MT for Tata Tiscon with free site unloading & test certificates!',
        timestamp: '03 days ago'
      }
    ]
  }
];

export const SAMPLE_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'PLAN-FREE',
    name: 'Free Trial / Visitor',
    priceINR: 0,
    billingCycle: 'Monthly',
    description: 'Basic access to public calculators & Dukandar store listings.',
    features: [
      'Basic Civil BOQ Estimates',
      'Solar Rooftop Solar Savings Calculator',
      'Dukandar Marketplace Product View',
      'Standard Email & WhatsApp Support'
    ],
    maxProjectsLimit: 2,
    isActive: true,
    targetRoles: ['Client', 'Dukandar']
  },
  {
    id: 'PLAN-BUILDER-PRO',
    name: 'Builder Pro Tier',
    priceINR: 1499,
    billingCycle: 'Monthly',
    description: 'Full civil estimation, AI Naksha Vastu Studio & vendor binding.',
    features: [
      'Unlimited Civil & Structural BOQ Downloads',
      'AI Vastu Naksha Studio Export',
      'Direct Binding Escrow Bidding with Suppliers',
      'Khatabook & CRM Multi-ledger Tracking',
      'Priority Bank Loan Application Processing'
    ],
    maxProjectsLimit: 25,
    isActive: true,
    targetRoles: ['Contractor', 'Architect', 'Engineer', 'Vendor'],
    popularBadge: 'MOST POPULAR'
  },
  {
    id: 'PLAN-ENTERPRISE-GOVT',
    name: 'Enterprise & Govt Contractor',
    priceINR: 4999,
    billingCycle: 'Monthly',
    description: 'Advanced LiDAR point cloud, VR walkthrough & government tender bidding.',
    features: [
      'Multi-user RBAC District Staff Access',
      'LiDAR 3D Point Cloud & VR Walkthrough',
      'Sarkar Tender Sub-contracting Bidding Suite',
      'Dedicated Account Manager & 24x7 Priority SLA',
      'Custom API & White-label Report Branding'
    ],
    maxProjectsLimit: 100,
    isActive: true,
    targetRoles: ['SuperAdmin', 'DistrictAdmin', 'Contractor', 'Supplier']
  },
  {
    id: 'PLAN-DUKANDAR-WHOLESALE',
    name: 'Dukandar Verified Store',
    priceINR: 2499,
    billingCycle: 'Annual',
    description: 'Empanelled Dukandar digital shop with GST invoicing & QR payment.',
    features: [
      'Unlimited B2B Product Listing Catalog',
      'Verified Dukandar Badge on District Map',
      'GST Compliant POS Invoice Generator',
      'Khata QR Digital Payment Collection',
      'Direct Customer Enquiries & Lead Alerts'
    ],
    maxProjectsLimit: 50,
    isActive: true,
    targetRoles: ['Dukandar', 'Supplier', 'Vendor']
  }
];

export const SAMPLE_SUBSCRIPTION_TRANSACTIONS: SubscriptionTransaction[] = [
  {
    id: 'TXN-9021',
    invoiceNo: 'INV-2026-0812',
    userId: 'USR-102',
    userName: 'Vikramaditya Singh Builders',
    userEmail: 'vikram.builder@2click.in',
    userRole: 'Contractor',
    planId: 'PLAN-BUILDER-PRO',
    planName: 'Builder Pro Tier',
    amountINR: 1499,
    paymentGateway: 'UPI / Razorpay',
    paymentDate: '2026-07-28',
    status: 'Completed'
  },
  {
    id: 'TXN-9022',
    invoiceNo: 'INV-2026-0813',
    userId: 'USR-204',
    userName: 'Shree Ram Solar Dukandar',
    userEmail: 'shreeram.solar@2click.in',
    userRole: 'Dukandar',
    planId: 'PLAN-DUKANDAR-WHOLESALE',
    planName: 'Dukandar Verified Store',
    amountINR: 2499,
    paymentGateway: 'Bank Transfer / NEFT',
    paymentDate: '2026-07-26',
    status: 'Completed'
  },
  {
    id: 'TXN-9023',
    invoiceNo: 'INV-2026-0814',
    userId: 'USR-305',
    userName: 'Vanguard Infra Tech Pvt Ltd',
    userEmail: 'vanguard.infra@2click.in',
    userRole: 'Supplier',
    planId: 'PLAN-ENTERPRISE-GOVT',
    planName: 'Enterprise & Govt Contractor',
    amountINR: 4999,
    paymentGateway: 'Escrow Wallet',
    paymentDate: '2026-07-25',
    status: 'Completed'
  },
  {
    id: 'TXN-9024',
    invoiceNo: 'INV-2026-0815',
    userId: 'USR-401',
    userName: 'Aarti Construction Company',
    userEmail: 'aarti.const@2click.in',
    userRole: 'Contractor',
    planId: 'PLAN-BUILDER-PRO',
    planName: 'Builder Pro Tier',
    amountINR: 1499,
    paymentGateway: 'UPI / Razorpay',
    paymentDate: '2026-07-20',
    status: 'Pending Approval'
  }
];




