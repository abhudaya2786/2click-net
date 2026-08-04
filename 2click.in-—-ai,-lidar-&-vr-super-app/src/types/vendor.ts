export interface VendorWhiteLabelSettings {
  brandTitle?: string;
  logoUrl?: string;
  supportPhone?: string;
  domainName?: string;
  themeColor?: string;
  customHeaderNotice?: string;
}

export interface VendorProfile {
  id: string;
  businessName: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  district?: string;
  category?: string;
  isVerified?: boolean;
  whiteLabelSettings: VendorWhiteLabelSettings;
}
