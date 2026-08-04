export interface RolePermissionDetail {
  role: string;
  title: string;
  description: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  badgePill: string;
  keyPermissions: string[];
}

export const ROLE_PERMISSIONS_MAP: Record<string, RolePermissionDetail> = {
  Engineer: {
    role: 'Engineer',
    title: 'Civil & Structural Engineer',
    description: 'Licensed engineering access for civil estimations, structural BOQ compliance, site audits, and material stress calculations.',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/80',
    badgeBorder: 'border-blue-200 dark:border-blue-800',
    badgeText: 'text-blue-700 dark:text-blue-300',
    badgePill: 'bg-blue-600 text-white',
    keyPermissions: [
      'Full Civil BOQ & Material Density Estimator',
      'Structural Load & IS 2026 Code Audit Reports',
      'Site Survey & LiDAR Point-Cloud Processing',
      'Quality Inspection & Technical Sign-off'
    ]
  },
  Architect: {
    role: 'Architect',
    title: 'Architect & Interior Designer',
    description: 'Design suite access for AI Vastu Naksha plans, 3D VR elevation renders, and spatial layout submissions.',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/80',
    badgeBorder: 'border-indigo-200 dark:border-indigo-800',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    badgePill: 'bg-indigo-600 text-white',
    keyPermissions: [
      'AI Vastu Naksha Plan Generator & Export',
      'VR Scene 3D Walkthrough Rendering',
      'Interior Design & Modular Fitting Suite',
      'Client Design Approval & Contract Submissions'
    ]
  },
  Contractor: {
    role: 'Contractor',
    title: 'General Construction Contractor',
    description: 'Execution suite access for bidding, subcontractor tenders, Khatabook CRM multi-ledger, and worker allocation.',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/80',
    badgeBorder: 'border-amber-200 dark:border-amber-800',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgePill: 'bg-amber-600 text-white',
    keyPermissions: [
      'Direct Binding Escrow Bidding on Projects',
      'Sarkar Tender Sub-contracting Suite',
      'Khatabook Ledger & Daily Attendance Log',
      'Material Order Requisitions to Wholesalers'
    ]
  },
  Builder: {
    role: 'Builder',
    title: 'Real Estate Developer & Builder',
    description: 'Enterprise project management for township developments, vendor binding contracts, and bank loan approvals.',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/80',
    badgeBorder: 'border-orange-200 dark:border-orange-800',
    badgeText: 'text-orange-700 dark:text-orange-300',
    badgePill: 'bg-orange-600 text-white',
    keyPermissions: [
      'Multi-Site Project Governance Dashboard',
      'Vendor Binding Escrow Contract Signing',
      'Bank Construction Loan Milestone Tracking',
      'Material Procurement & Budget Allocations'
    ]
  },
  Customer: {
    role: 'Customer',
    title: 'Client / Home Owner',
    description: 'Homeowner portal for project tracking, civil BOQ estimates, rooftop solar savings calculations, and vendor directory.',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/80',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgePill: 'bg-emerald-600 text-white',
    keyPermissions: [
      'Real-Time Home Construction Progress View',
      'Civil & Solar Rooftop Savings Calculator',
      'Architect & Verified Vendor Directory',
      'Bank Loan Application & Document Vault'
    ]
  },
  Client: {
    role: 'Client',
    title: 'Client / Home Owner',
    description: 'Homeowner portal for project tracking, civil BOQ estimates, rooftop solar savings calculations, and vendor directory.',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/80',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgePill: 'bg-emerald-600 text-white',
    keyPermissions: [
      'Real-Time Home Construction Progress View',
      'Civil & Solar Rooftop Savings Calculator',
      'Architect & Verified Vendor Directory',
      'Bank Loan Application & Document Vault'
    ]
  },
  Vendor: {
    role: 'Vendor',
    title: 'Material Vendor & Wholesaler',
    description: 'B2B supply portal for listing construction materials, responding to contractor RFQs, and managing deliveries.',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/80',
    badgeBorder: 'border-teal-200 dark:border-teal-800',
    badgeText: 'text-teal-700 dark:text-teal-300',
    badgePill: 'bg-teal-600 text-white',
    keyPermissions: [
      'B2B Wholesale Material Product Catalog',
      'Direct Contractor Bid Submission',
      'POS Invoice Generation & GST Reports',
      'Order Delivery Tracking & Khata Payments'
    ]
  },
  Supplier: {
    role: 'Supplier',
    title: 'Material Supplier',
    description: 'Wholesale supply portal for building materials, cement, steel, sand, and heavy equipment.',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/80',
    badgeBorder: 'border-teal-200 dark:border-teal-800',
    badgeText: 'text-teal-700 dark:text-teal-300',
    badgePill: 'bg-teal-600 text-white',
    keyPermissions: [
      'Bulk Material Rate Card Publishing',
      'Contractor Supply Contract Management',
      'GST Invoice & Dispatch Slip Printing',
      'Escrow Wallet Payment Settlement'
    ]
  },
  Dukandar: {
    role: 'Dukandar',
    title: 'Empanelled Dukandar Shop Keeper',
    description: 'Local verified hardware store portal for product listings, QR code payments, and local customer inquiries.',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/80',
    badgeBorder: 'border-cyan-200 dark:border-cyan-800',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    badgePill: 'bg-cyan-600 text-white',
    keyPermissions: [
      'District GIS Dukandar Storefront Listing',
      'Local Retail Hardware Price Publishing',
      'Khata QR Digital UPI Collection',
      'Customer Lead Notifications & WhatsApp Chat'
    ]
  },
  Electrician: {
    role: 'Electrician',
    title: 'Certified Electrician & Solar Installer',
    description: 'Electrical and solar wiring specialist portal for load estimation, single-line diagrams, and solar installation.',
    badgeBg: 'bg-yellow-50 dark:bg-yellow-950/80',
    badgeBorder: 'border-yellow-200 dark:border-yellow-800',
    badgeText: 'text-yellow-700 dark:text-yellow-300',
    badgePill: 'bg-yellow-600 text-white',
    keyPermissions: [
      'Rooftop Solar Load & Wiring Calculator',
      'Electrical Fixture & Cable Requirement BOQ',
      'Safety Compliance Audit Checklist',
      'Direct Sub-contract Bidding'
    ]
  },
  Plumber: {
    role: 'Plumber',
    title: 'Sanitary & Plumbing Specialist',
    description: 'Plumbing & ETP infrastructure portal for pipe sizing, septic tank specs, and sanitary fixture BOQs.',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/80',
    badgeBorder: 'border-sky-200 dark:border-sky-800',
    badgeText: 'text-sky-700 dark:text-sky-300',
    badgePill: 'bg-sky-600 text-white',
    keyPermissions: [
      'Sanitary & Drainage Piping BOQ Calculator',
      'Water Tank & ETP Spec Estimator',
      'Plumbing Layout Document Vault',
      'Project Sub-contract Tenders'
    ]
  },
  DistrictAdmin: {
    role: 'DistrictAdmin',
    title: 'District Governance Administrator',
    description: 'Government district oversight for verifying local contractors, approving public tenders, and managing GIS maps.',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/80',
    badgeBorder: 'border-purple-200 dark:border-purple-800',
    badgeText: 'text-purple-700 dark:text-purple-300',
    badgePill: 'bg-purple-600 text-white',
    keyPermissions: [
      'District GIS Contractor & Dukandar Verification',
      'Public Infrastructure Tender Publishing',
      'Sarkar Awarded Sub-bid Audit Oversight',
      'Local Civil Compliance Approvals'
    ]
  },
  BankManager: {
    role: 'BankManager',
    title: 'Bank Loan Verification Officer',
    description: 'Financial portal for inspecting home & commercial loan applications, verifying valuation reports, and approving disbursements.',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/80',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgePill: 'bg-emerald-600 text-white',
    keyPermissions: [
      'Home & Solar Loan Application Review',
      'Construction Milestone Verification',
      'Property Valuation & Credit Risk Audit',
      'Direct Loan Sanction Letter Issuance'
    ]
  },
  SuperAdmin: {
    role: 'SuperAdmin',
    title: 'Super Admin Governance Officer',
    description: 'Full administrative control over user RBAC permissions, district hierarchies, monetization plans, and audit logs.',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/80',
    badgeBorder: 'border-rose-200 dark:border-rose-800',
    badgeText: 'text-rose-700 dark:text-rose-300',
    badgePill: 'bg-rose-600 text-white',
    keyPermissions: [
      'Full User Management & Role Assignment',
      'Platform Monetization & Subscription Plan Control',
      'Tool & Module Access Rights Configuration',
      'System Audit Logs & Security Oversight'
    ]
  }
};

export function getRolePermissionDetail(role?: string): RolePermissionDetail {
  if (!role) return ROLE_PERMISSIONS_MAP['Customer'];
  return ROLE_PERMISSIONS_MAP[role] || {
    role: role,
    title: `${role} Portal Access`,
    description: `Standard access permissions for ${role} users on the platform.`,
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/80',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgePill: 'bg-emerald-600 text-white',
    keyPermissions: [
      `Access to ${role} Dashboard Tools`,
      'Verified Workspace Account Data',
      'Real-Time System Notifications'
    ]
  };
}
