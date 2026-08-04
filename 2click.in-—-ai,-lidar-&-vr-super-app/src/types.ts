export type ServiceCategory = 
  | 'construction' 
  | 'solar' 
  | 'interior' 
  | 'lidar' 
  | 'vr' 
  | 'water_etp_stp' 
  | 'electrical_elv' 
  | 'vendors_binding'
  | 'dukandar_market'
  | 'bank_loans'
  | 'naksha_vastu'
  | 'crm_khatabook'
  | 'logistics'
  | 'super_admin';

export type QualityGrade = 'Standard' | 'Premium' | 'Luxury';

// Roles Definition
export type UserRole = 
  | 'SuperAdmin'
  | 'DistrictAdmin'
  | 'DistrictEmployee'
  | 'Employee'
  | 'Dukandar'
  | 'Supplier'
  | 'Vendor'
  | 'Architect'
  | 'Engineer'
  | 'Electrician'
  | 'Plumber'
  | 'Contractor'
  | 'BankManager'
  | 'Client'
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'regular_user';

// Permissions List
export type Permission =
  | 'view_public_tools'
  | 'use_calculators'
  | 'view_analytics'
  | 'manage_content'
  | 'access_admin_panel'
  | 'manage_users'
  | 'change_roles'
  | 'delete_users'
  | 'view_audit_logs'
  | 'approve_major_changes';

// Role-Permission Mapping Matrix
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: [
    'view_public_tools',
    'use_calculators',
    'view_analytics',
    'manage_content',
    'access_admin_panel',
    'manage_users',
    'change_roles',
    'delete_users',
    'view_audit_logs',
    'approve_major_changes'
  ],
  admin: [
    'view_public_tools',
    'use_calculators',
    'view_analytics',
    'manage_content',
    'access_admin_panel',
    'manage_users'
  ],
  manager: [
    'view_public_tools',
    'use_calculators',
    'view_analytics',
    'manage_content'
  ],
  regular_user: [
    'view_public_tools',
    'use_calculators'
  ],
  // Mappings for existing platform roles
  SuperAdmin: [
    'view_public_tools',
    'use_calculators',
    'view_analytics',
    'manage_content',
    'access_admin_panel',
    'manage_users',
    'change_roles',
    'delete_users',
    'view_audit_logs',
    'approve_major_changes'
  ],
  DistrictAdmin: [
    'view_public_tools',
    'use_calculators',
    'view_analytics',
    'manage_content',
    'access_admin_panel',
    'manage_users'
  ],
  DistrictEmployee: [
    'view_public_tools',
    'use_calculators',
    'view_analytics',
    'manage_content'
  ],
  Employee: [
    'view_public_tools',
    'use_calculators',
    'view_analytics',
    'manage_content'
  ],
  Dukandar: [
    'view_public_tools',
    'use_calculators',
    'manage_content'
  ],
  Supplier: [
    'view_public_tools',
    'use_calculators',
    'manage_content'
  ],
  Vendor: [
    'view_public_tools',
    'use_calculators',
    'manage_content'
  ],
  Contractor: [
    'view_public_tools',
    'use_calculators'
  ],
  Architect: [
    'view_public_tools',
    'use_calculators'
  ],
  Engineer: [
    'view_public_tools',
    'use_calculators'
  ],
  Electrician: [
    'view_public_tools',
    'use_calculators'
  ],
  Plumber: [
    'view_public_tools',
    'use_calculators'
  ],
  BankManager: [
    'view_public_tools',
    'use_calculators',
    'view_analytics'
  ],
  Client: [
    'view_public_tools',
    'use_calculators'
  ]
};

// User Profile Interface
export interface UserProfile {
  id: string;
  fullName: string;
  emailOrPhone: string;
  role: UserRole;
  location: string;
  pincode: string;
  is2FAEnabled: boolean;
  createdAt: string;
  lastLogin: string;
}

// Audit Activity Log
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  timestamp: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

// Approval Request Item
export interface ApprovalRequest {
  id: string;
  requestedBy: string;
  userRole: UserRole;
  actionType: 'DELETE_USER' | 'ROLE_CHANGE' | 'SYSTEM_CONFIG_CHANGE';
  details: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
}

// Helper Function to Check Permission
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

export interface UserPermissions {
  canAccessCivilBoq?: boolean;
  canAccessSolarEngine?: boolean;
  canAccessDukandarMarket?: boolean;
  canAccessBankLoans?: boolean;
  canAccessWaterEtpStp?: boolean;
  canAccessElectricalMep?: boolean;
  canAccessVendorBidding?: boolean;
  canAccessLogistics?: boolean;
  canAccessLidarSurveys?: boolean;
  canAccessVrTour?: boolean;
  canAccessNakshaVastu?: boolean;
  canAccessKhatabookCrm?: boolean;
  canEditProductPrices?: boolean;
  canApproveVendorListings?: boolean;
  canDownloadPdfReports?: boolean;
  [key: string]: boolean | undefined;
}

export interface UserShareSettings {
  shareableSlug?: string;
  showProducts: boolean;
  showPrices: boolean;
  showContactPhone: boolean;
  showAddressLocation: boolean;
  showKhataQrPayment: boolean;
  showRatingReviews: boolean;
  showGstin: boolean;
  headlineMessage?: string;
  allowedProductIds?: string[];
}

export interface PlatformFeeSettings {
  showFeesOnPublicApp: boolean; // Controlled strictly by Super Admin!
  userFeeINR: number;           // User / Client registration fee
  dukandarFeeINR: number;       // Dukandar / Shopkeeper fee
  supplierFeeINR: number;       // Supplier / Vendor / Contractor fee
  brandFeeINR: number;          // Brand / Empanelled Brand fee
  materialProviderFeeINR: number; // Material Provider fee
  feePeriod: 'Annual' | 'Lifetime' | 'Monthly';
  gstApplicable: boolean;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  state?: string;      // State (राज्य) e.g., Uttar Pradesh
  mandal?: string;     // Mandal / Division (मंडल) e.g., Gorakhpur Mandal
  district?: string;   // District (ज़िला) e.g., Gorakhpur
  city?: string;
  zone?: string;       // Legacy Zone reference
  companyName?: string;
  avatarUrl?: string;
  isKycVerified?: boolean;
  gstinNumber?: string;
  bankAccountNo?: string;
  employeeCode?: string;
  status?: 'Active' | 'Suspended' | 'Pending Verification';
  subscriptionPlanId?: string;
  subscriptionPlanName?: string;
  subscriptionStatus?: 'Active' | 'Trialing' | 'Pending Payment' | 'Pending Approval' | 'Expired';
  subscriptionExpiresAt?: string;
  assignedTasksCount?: number;
  rating?: number;
  permissions?: UserPermissions;
  shareSettings?: UserShareSettings;
  customProducts?: Array<{
    id: string;
    title: string;
    category: string;
    priceINR: number;
    unit: string;
    imageUrl: string;
    inStock: boolean;
    description: string;
  }>;
}

export interface BOQItem {
  category: string;
  percentage: number;
  amount: number;
  items: string;
}

export interface MaterialQuantity {
  cementBags: number;
  steelTonnes: string;
  bricksPieces: number;
  mSandCft: number;
  aggregateCft: number;
}

export interface BOQResult {
  title: string;
  builtupArea: number;
  qualityGrade: QualityGrade;
  ratePerSqft: string;
  totalEstimatedCostINR: number;
  totalEstFormatted: string;
  gstRate: string;
  breakdown: BOQItem[];
  materialsQuantity: MaterialQuantity;
}

export interface CustomCostItem {
  id: string;
  title: string;
  category: string;
  brandName: string;
  unit: string;
  unitRateINR: number;
  quantity: number;
  totalCostINR: number;
  photoUrl?: string;
  isCustomItem?: boolean;
  isActive?: boolean;
  orderStatus?: 'Ordered' | 'PO Approved' | 'In Transit' | 'Site Delivered' | 'Installed';
  expectedDeliveryDate?: string;
}

export interface SolarAnalysisResult {
  recommendedCapacityKW: number;
  monthlyUnitsGenerated: number;
  roofAreaRequiredSqft: number;
  grossCostINR: number;
  pmSuryaGharSubsidyINR: number;
  netCostINR: number;
  monthlySavingsINR: number;
  annualSavingsINR: number;
  paybackPeriodYears: string;
  lifetime25YrSavingsINR: number;
  co2OffsetTonnesAnnual: string;
  equivalentTreesPlanted: number;
}

export interface InteriorModule {
  id: string;
  name: string;
  category: 'Kitchen' | 'Wardrobe' | 'Living' | 'Bedroom' | 'Bathroom' | 'Ceiling';
  basePriceINR: number;
  finishType: string;
  description: string;
  imageUrl: string;
}

export interface LiDARPoint {
  id: string;
  x: number;
  y: number;
  z: number;
  classification: 'Terrain' | 'Structure' | 'Vegetation' | 'Boundary';
  intensity: number;
}

export interface LiDARSurvey {
  id: string;
  projectName: string;
  location: string;
  surveyDate: string;
  pointCount: number;
  areaSqMeters: number;
  maxElevationMeters: number;
  contourIntervalMeters: number;
  accuracyCm: number;
  points: LiDARPoint[];
}

export interface VRScene {
  id: string;
  title: string;
  category: 'Structural BIM' | 'Solar Rooftop' | 'Modern Interior' | 'Commercial Layout';
  panoramaUrl: string;
  wireframeModeAvailable: boolean;
  hotspots: { id: string; label: string; x: number; y: number; details: string }[];
}

export interface Project {
  id: string;
  title: string;
  clientName: string;
  category: ServiceCategory;
  city: string;
  pincode?: string;
  address?: string;
  gpsLat?: number;
  gpsLng?: number;
  status: 'In Survey' | 'Estimation' | 'Under Execution' | 'Completed';
  progressPercentage: number;
  budgetEstimatedINR: number;
  startDate: string;
  expectedCompletion: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  sources?: string[];
}

export interface DailyProgressReport {
  id: string;
  projectId: string;
  date: string;
  weather: 'Clear & Sunny' | 'Light Rain' | 'Cloudy' | 'Extreme Heat';
  workforceCount: { skilled: number; unskilled: number; engineers: number };
  completedTasks: string[];
  materialsConsumed: { item: string; qty: string }[];
  issuesDelayed?: string;
  preparedBy: string;
}

export interface EtpStpAnalysisResult {
  plantType: 'STP Sewage Plant' | 'ETP Effluent Plant' | 'WTP RO Filtration' | 'Rainwater Recycling';
  techTechnology: 'MBBR (Biofilm)' | 'MBR (Membrane)' | 'SBR (Batch Reactor)' | 'Physico-Chemical ETP';
  capacityKLD: number;
  occupancyHeadcount?: number;
  estimatedCapExINR: number;
  estimatedOpExMonthlyINR: number;
  treatedWaterRecoveryPct: number;
  dailyRecycledLiters: number;
  annualWaterBillSavingsINR: number;
  cpcbNormCompliance: string;
  breakdown: { item: string; costINR: number; specs: string }[];
}

export interface ElectricalAnalysisResult {
  buildingType: 'Commercial Complex' | 'Industrial Factory' | 'Residential G+3' | 'Hospital / Data Center';
  totalAreaSqft: number;
  connectedLoadKVA: number;
  transformerRatingKVA: number;
  dgBackupRatingKVA: number;
  mainPanelCostINR: number;
  wiringConduitCostINR: number;
  elvAutomationCostINR: number;
  totalEstimatedElectricalCostINR: number;
  breakdown: { item: string; costINR: number; qty: string }[];
}

export interface Vendor {
  id: string;
  name: string;
  category: 'ETP/STP Water' | 'Electrical & ELV' | 'Civil Contractor' | 'Solar Rooftop' | 'Interior Architecture' | 'LiDAR Survey';
  city: string;
  pincode?: string;
  address?: string;
  gpsLat?: number;
  gpsLng?: number;
  maxServiceRadiusKm?: number;
  coveredPincodes?: string[];
  rating: number;
  reviewsCount: number;
  verifiedGstin: string;
  cpwdClassLicense?: string;
  projectsCompleted: number;
  phone: string;
  email: string;
  specialization: string;
  hourlyOrBaseRateINR: number;
}

export interface VendorBid {
  id: string;
  vendorId: string;
  vendorName: string;
  projectName: string;
  projectTitle?: string;
  category?: string;
  bidAmountINR: number;
  deliveryDays: number;
  timelineWeeks?: number;
  warrantyYears: number;
  submittedDate: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Bound';
  scopeNotes: string;
}

export interface BindingContract {
  id: string;
  contractNumber: string;
  projectId: string;
  projectName: string;
  clientName: string;
  vendorName: string;
  vendorGstin: string;
  contractType: 'ETP/STP Turnkey' | 'Electrical MEP Package' | 'Civil RCC Construction' | 'Solar EPC Contract' | 'Turnkey Subcontract' | string;
  agreedAmountINR: number;
  retentionMoneyPct: number;
  advanceDepositINR: number;
  completionDeadline: string;
  bindingStatus: 'Draft' | 'Binding Deposit Escrowed' | 'Active Execution' | 'Discharged & Completed';
  signedDate: string;
  penaltyClausePerWeekPct: number;
  digitalSignatureHash: string;
}

export interface ShopProduct {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorCity: string;
  vendorPhone: string;
  title: string;
  brand: string;
  category: 
    | 'Cement & AAC Blocks'
    | 'Bricks & Red Clay'
    | 'TMT Steel Rebars'
    | 'Paints & Wall Putty'
    | 'Boundary Wall & Fencing'
    | 'SS & Glass Railings'
    | 'Kitchen & Bathroom Upgrades'
    | 'Custom Interiors & Panels'
    | 'Shop (Dukan) Renovation'
    | 'Office Renovation'
    | 'Electrical Wiring & Switches'
    | 'Plumbing & Pipes'
    | 'Solar PV & Inverters'
    | 'Batteries & Energy Storage'
    | 'Water Pumps & ETP Equipment'
    | 'Civil Building Materials'
    | 'Interior & Exterior Renovation'
    | 'Structures & Hardware';
  subcategory?: string;
  mrpINR?: number;
  priceINR: number;
  discountPercent?: number;
  warrantyPeriod?: string;
  guaranteeNotes?: string;
  unit: string;
  stockQty: number;
  specs: string;
  rating: number;
  imageUrl: string;
  isApproved: boolean;
  officialWebsiteUrl?: string;
}

export interface LoanKycDocument {
  docType: 'Aadhaar Card' | 'PAN Card' | 'Electricity Bill' | '6 Month Bank Statement' | 'Project BOQ Estimate';
  fileName: string;
  isUploaded: boolean;
  isVerified: boolean;
  uploadedAt?: string;
}

export interface LoanApplication {
  id: string;
  applicantName: string;
  applicantPhone: string;
  applicantCity: string;
  bankName: string;
  schemeName: string;
  loanType: 'PM Surya Ghar Solar Loan' | 'Green Infrastructure Loan' | 'Commercial MEP Loan';
  requestedAmountINR: number;
  tenureMonths: number;
  interestRatePct: number;
  monthlyEmiINR: number;
  kycStatus: 'Incomplete' | 'Pending Verification' | 'KYC Verified' | 'Approved & Sanctioned' | 'Rejected';
  appliedDate: string;
  documents: LoanKycDocument[];
  cibilScore?: number;
}

export interface SolarEquipmentItem {
  componentName: string;
  category: 'Solar PV Module' | 'Inverter' | 'Battery Bank' | 'Net Meter' | 'ACDB / DCDB Box' | 'Mounting Structure' | 'Earthing & Cables';
  systemCompatibility: 'On-Grid' | 'Off-Grid' | 'Hybrid' | 'All';
  requiredQtyFor3KW: string;
  topBrands: string[];
  approxCostINR: number;
  description: string;
}

export interface EmpanelledBrand {
  id: string;
  brandName: string;
  companyLegalName: string;
  category: string;
  headquarters: string;
  gstin: string;
  isEmpanelled: boolean;
  approvedStandards: string;
  defaultDiscountPct: number;
  warrantyPolicy: string;
  itemCount: number;
  logoUrl?: string;
  contactPhone: string;
}

export interface CustomCostItem {
  id: string;
  title: string;
  category: string;
  brandName: string;
  unit: string;
  unitRateINR: number;
  quantity: number;
  totalCostINR: number;
  isCustomItem?: boolean;
  imageUrl?: string;
  isActive?: boolean;
}

export interface HouseNakshaPlan {
  id: string;
  title: string;
  plotDimensionsFt: string;
  totalAreaSqft: number;
  facingDirection: 'North' | 'East' | 'West' | 'South';
  bhkConfig: '1BHK' | '2BHK' | '3BHK' | '4BHK Villa' | 'Duplex Plan';
  architectName: string;
  architectRating: number;
  vastuScorePct: number;
  estimatedConstructionCostINR: number;
  imageUrl: string;
  floorplan2DUrl?: string;
  features: string[];
  description: string;
}

export interface VastuRoomRule {
  roomName: 'Main Entrance' | 'Kitchen' | 'Master Bedroom' | 'Puja Room' | 'Toilet & Septic Tank' | 'Overhead Water Tank' | 'Staircase' | 'Living Room';
  idealDirections: string[];
  currentDirection: string;
  isCompliant: boolean;
  score: number;
  importanceLevel: 'Critical' | 'High' | 'Medium';
  vastuNotes: string;
  remedyIfFlawed: string;
}

export interface MaterialWithFittingItem {
  id: string;
  itemTitle: string;
  brandName: string;
  modelNumber: string;
  category: 
    | 'Cement & AAC Blocks'
    | 'Bricks & Red Clay'
    | 'TMT Steel Rebars'
    | 'Paints & Wall Putty'
    | 'Boundary Wall & Fencing'
    | 'SS & Glass Railings'
    | 'Kitchen & Bath Upgrades'
    | 'Custom Interiors & Panels'
    | 'Shop (Dukan) Renovation'
    | 'Office Renovation'
    | 'Plumbing & Bath'
    | 'Electrical & Wiring'
    | 'Civil & Cement'
    | 'Tiles & Marble';
  unit: string;
  materialPriceINR: number;
  fittingLaborChargeINR: number;
  laborRateUnit: string;
  imageUrl: string;
  specs: string;
  warranty: string;
  empanelledSupplier: string;
  plumberOrElectricianRole: 'Plumber' | 'Electrician' | 'Mason' | 'Painter' | 'Carpenter' | 'General Vendor' | 'Sub-Contractor';
  officialWebsiteUrl?: string;
}

export interface GovernmentAwardedTender {
  id: string;
  tenderNumber: string;
  issuingAuthority: 'CPWD' | 'State PWD' | 'NHAI' | 'Indian Railways' | 'Nagar Nigam' | 'Smart City Mission' | 'Defence Infrastructure';
  projectTitle: string;
  primeContractorName: string;
  primeContractorGstin: string;
  awardedProjectValueINR: number;
  workCategory: 'Highway & Boundary Wall Construction' | 'Government Office Renovation' | 'Public Hospital Upgrade' | 'Railway Station Railing & Interior' | 'School & College Building' | 'Commercial Complex & Dukans';
  locationStateCity: string;
  requiredMaterialsAndSubcontracts: {
    category: string;
    brandPreferred?: string;
    requiredQuantity: string;
    targetEstimatedBudgetINR: number;
  }[];
  subBiddingDeadline: string;
  tenderStatus: 'Sub-Bidding Open' | 'Evaluation In Progress' | 'Materials Awarded' | 'Work Under Execution';
  contactPersonPhone: string;
}

export interface SarkarSubBid {
  id: string;
  tenderId: string;
  tenderNumber?: string;
  primeContractorName?: string;
  subcontractorVendorName?: string;
  biddingVendorName?: string;
  biddingVendorRole?: 'Dukandar' | 'Supplier' | 'Vendor' | 'Civil Contractor' | 'Sub-Contractor';
  biddingVendorGstin?: string;
  category?: string;
  categoryOffered?: string;
  brandOffered?: string;
  quotedUnitPriceINR?: number;
  totalQuotedINR?: number;
  quotedTotalValueINR?: number;
  deliveryDays?: number;
  deliveryTimelineDays?: number;
  status?: string;
  bidStatus?: 'Submitted' | 'Shortlisted' | 'Accepted' | 'Rejected';
  submittedAt?: string;
  bidDate?: string;
  remarks?: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  attachments?: { title: string; type: string }[];
}

export interface VendorConversation {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorRole: 'Architect' | 'Plumber' | 'Electrician' | 'Supplier' | 'Dukandar' | 'Civil Contractor' | 'Vendor';
  vendorAvatar?: string;
  vendorPhone: string;
  projectTopic: string;
  lastUpdated: string;
  unreadCount: number;
  messages: DirectMessage[];
}

export interface WhiteLabelFunctionLimits {
  allowAiGenerations: boolean;       // Enable/Disable AI Naksha, AI BOQ & Copilot
  allowDirectPdfExport: boolean;     // Enable/Disable PDF report download
  allowPriceEditing: boolean;        // Enable/Disable custom product/price edit
  allowVendorBidding: boolean;       // Enable/Disable tender/bidding participation
  allowBankLoanApply: boolean;       // Enable/Disable bank loan applications
  allowDirectWhatsappLeads: boolean; // Enable/Disable direct WhatsApp lead routing
  allowCustomProductListing: boolean;// Enable/Disable adding custom Dukandar/Vendor products
  allow3dLidarVrTour: boolean;       // Enable/Disable 3D LiDAR and VR walkthrough features
  allowExportExcelCsv: boolean;      // Enable/Disable data export to CSV/Excel

  // Quotas & Caps controlled strictly by Super Admin
  maxAiPromptsPerDay: number;
  maxPdfDownloadsPerMonth: number;
  maxProductListingsLimit: number;
  maxDailyLeadsQuota: number;
  maxVendorBidsQuota: number;
  maxTeamUsersCount: number;
}

export interface CategoryWhiteLabelConfig {
  id: string;
  categoryKey: string;               // e.g. 'solar', 'construction', 'dukandar_market', 'tiles_hardware', 'bank_loans', 'interior', 'water_etp_stp', 'electrical_elv', 'global_partner'
  categoryDisplayName: string;       // e.g. "Solar Rooftop & Renewable Energy", "Civil & BOQ Construction"
  partnerBrandName: string;          // e.g. "SuryaShakti Solar Partner Mart"
  partnerLogoUrl: string;            // Custom brand logo URL
  customDomainOrSlug: string;        // e.g. "solar-express" or "solar.brandpartner.in"
  primaryColorTheme: 'emerald' | 'indigo' | 'amber' | 'rose' | 'cyan' | 'slate';
  supportPhoneWhatsapp: string;
  supportEmail?: string;
  customHeaderTitle?: string;
  customBannerTagline?: string;
  copyrightFooterText?: string;
  isWhiteLabelActive: boolean;

  // Function Limitations & Quotas set by Super Admin
  functionLimits: WhiteLabelFunctionLimits;

  createdDate: string;
  lastUpdatedDate: string;
}

export interface SystemSettings {
  siteName: string;
  siteTagline: string;
  primaryColor: 'teal' | 'purple' | 'amber' | 'emerald' | 'indigo' | 'rose';
  enabledModules: {
    home: boolean;
    construction: boolean;
    solar: boolean;
    dukandar_market: boolean;
    bank_loans: boolean;
    water_etp_stp: boolean;
    electrical_elv: boolean;
    vendors_binding: boolean;
    naksha_vastu: boolean;
    lidar: boolean;
    vr: boolean;
  };
  moduleLabels: Record<string, string>;

  // Category-wise White Label Configurations & Function Limits (Managed by Super Admin)
  categoryWhiteLabels?: CategoryWhiteLabelConfig[];
  activeGlobalWhiteLabelId?: string | null;

  // Super Admin Display Controls (Login & Public Display)
  loginDisplayControls?: {
    showQuickRoleDemo?: boolean;
    showWhatsAppOtpTab?: boolean;
    showEmailOtpTab?: boolean;
    showPasswordTab?: boolean;
    allowPublicRegistration?: boolean;
    showDistrictAdminLoginNotice?: boolean;
  };

  publicDisplayControls?: {
    showPublicPrices?: boolean;
    showVendorContacts?: boolean;
    showPublicBiddingTenders?: boolean;
    showCitySelector?: boolean;
    showAiCopilotButton?: boolean;
    showDistrictHierarchyBar?: boolean;
  };

  publicRegistrationEnabled: boolean;
  requireOtpLogin: boolean;
  showPublicPrices: boolean;
  allowPublicVendorChat: boolean;
  superAdminSecretPin: string;

  // Platform Membership & Registration Fees (Managed by Super Admin)
  platformFees?: PlatformFeeSettings;
}

export interface KhataTransaction {
  id: string;
  accountId: string;
  type: 'Gave' | 'Got'; // Gave = Udhaar Given (You Gave), Got = Jama Received (You Got)
  amount: number;
  date: string;
  billNumber?: string;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';
  itemCategory?: string;
  notes?: string;
  billPhotoUrl?: string;
}

export interface KhataAccount {
  id: string;
  name: string;
  phone: string;
  accountType: 'Customer' | 'Dukandar' | 'Supplier' | 'Contractor';
  district: string;
  address?: string;
  gpsLat?: number;
  gpsLng?: number;
  netBalanceINR: number; // Positive = You will receive (+), Negative = You have to pay (-)
  lastTransactionDate: string;
  transactions: KhataTransaction[];
}

export interface CrmLead {
  id: string;
  customerName: string;
  companyName?: string;
  phone: string;
  email?: string;
  district: string;
  address: string;
  gpsLat?: number;
  gpsLng?: number;
  serviceInterest: string; // Solar, BOQ, Interior, Naksha, Water ETP
  estimatedValueINR: number;
  stage: 'New Lead' | 'Site Visit Scheduled' | 'Quotation Sent' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  assignedEmployeeName: string;
  nextFollowUpDate: string;
  notes?: string;
  siteCheckInHistory?: Array<{
    date: string;
    inspectorName: string;
    lat: number;
    lng: number;
    remarks: string;
  }>;
}

export interface ErpInvoiceItem {
  id: string;
  itemName: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  unitRateINR: number;
  gstPercent: number;
  totalAmountINR: number;
}

export interface ErpInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerGstin?: string;
  district: string;
  date: string;
  dueDate: string;
  items: ErpInvoiceItem[];
  subtotalINR: number;
  gstAmountINR: number;
  grandTotalINR: number;
  status: 'Unpaid' | 'Partially Paid' | 'Paid';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceINR: number;
  billingCycle: 'Monthly' | 'Annual' | 'One-Time';
  description: string;
  features: string[];
  maxProjectsLimit: number;
  isActive: boolean;
  targetRoles: UserRole[];
  popularBadge?: string;
}

export interface SubscriptionTransaction {
  id: string;
  invoiceNo: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  planId: string;
  planName: string;
  amountINR: number;
  paymentGateway: 'UPI / Razorpay' | 'Bank Transfer / NEFT' | 'Escrow Wallet';
  paymentDate: string;
  status: 'Completed' | 'Pending Approval' | 'Failed' | 'Refunded';
}




