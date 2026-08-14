import { IBillingProvider, CheckoutSessionParams, CheckoutSessionResult } from './types';
import { StripeBillingAdapter } from './StripeBillingAdapter';
import { RazorpayBillingAdapter } from './RazorpayBillingAdapter';
import { MockBillingAdapter } from './MockBillingAdapter';
import { PlanDefinition, PlanTier, PlanLimits } from '../../src/types';

export * from './types';
export * from './StripeBillingAdapter';
export * from './RazorpayBillingAdapter';
export * from './MockBillingAdapter';

export const SAAS_PLANS: PlanDefinition[] = [
  {
    tier: 'FREE',
    name: 'Free',
    tagline: 'For individuals exploring voice transcription and automated AI minutes',
    monthlyPriceUsd: 0,
    yearlyPriceUsd: 0,
    monthlyPriceInr: 0,
    yearlyPriceInr: 0,
    limits: {
      maxUsers: 1,
      maxMeetingsPerMonth: 10,
      maxRecordingMinutesPerMonth: 60, // 1 hour
      maxTranscriptionMinutesPerMonth: 60,
      maxAiRequestsPerMonth: 30,
      maxStorageBytes: 500 * 1024 * 1024, // 500 MB
    },
    features: [
      '1 Active user seat',
      '60 Recording minutes / month',
      '60 Transcription minutes / month',
      '10 Meetings per month',
      '30 AI MoM & Summary requests',
      '500 MB Secure audio storage',
      'Standard email support',
      'Local JSON & TXT export',
    ],
  },
  {
    tier: 'STARTER',
    name: 'Starter',
    tagline: 'For growing teams and consultants conducting frequent collaborative reviews',
    monthlyPriceUsd: 19,
    yearlyPriceUsd: 15,
    monthlyPriceInr: 1499,
    yearlyPriceInr: 1199,
    popular: true,
    badge: 'Most Popular',
    limits: {
      maxUsers: 3,
      maxMeetingsPerMonth: 50,
      maxRecordingMinutesPerMonth: 300, // 5 hours
      maxTranscriptionMinutesPerMonth: 300,
      maxAiRequestsPerMonth: 200,
      maxStorageBytes: 5 * 1024 * 1024 * 1024, // 5 GB
    },
    features: [
      'Up to 3 Active user seats',
      '300 Recording minutes / month (5 hrs)',
      '300 Transcription minutes / month',
      '50 Meetings per month',
      '200 AI MoM & Action item extractions',
      '5 GB Secure cloud storage',
      'Multi-speaker Hindi & English diarization',
      'Branded PDF / Word report exports',
      '90-Day customizable data retention',
      'Priority processing queue',
    ],
  },
  {
    tier: 'BUSINESS',
    name: 'Business',
    tagline: 'For departments and fast-scaling organizations requiring robust compliance & automation',
    monthlyPriceUsd: 49,
    yearlyPriceUsd: 39,
    monthlyPriceInr: 3999,
    yearlyPriceInr: 3199,
    limits: {
      maxUsers: 15,
      maxMeetingsPerMonth: -1, // Unlimited (e.g. 500 soft gauge)
      maxRecordingMinutesPerMonth: 1500, // 25 hours
      maxTranscriptionMinutesPerMonth: 1500,
      maxAiRequestsPerMonth: 1000,
      maxStorageBytes: 50 * 1024 * 1024 * 1024, // 50 GB
    },
    features: [
      'Up to 15 Active user seats',
      '1,500 Recording minutes / month (25 hrs)',
      '1,500 Transcription minutes / month',
      'Unlimited meetings creation',
      '1,000 AI MoM & Sentiment analyses',
      '50 GB Encrypted cloud storage',
      'Automated recurring meeting bot recorder',
      'Custom MoM templates & executive summaries',
      'Granular consent management & audit trail',
      'Webhook notifications & CRM sync',
      '24/7 Priority support with SLA',
    ],
  },
  {
    tier: 'ENTERPRISE',
    name: 'Enterprise',
    tagline: 'For corporations requiring dedicated RLS data isolation, custom SLAs, and high volume',
    monthlyPriceUsd: 199,
    yearlyPriceUsd: 159,
    monthlyPriceInr: 15999,
    yearlyPriceInr: 12799,
    badge: 'Enterprise Security',
    limits: {
      maxUsers: -1, // Unlimited (100+ seats)
      maxMeetingsPerMonth: -1,
      maxRecordingMinutesPerMonth: 10000, // 160+ hours
      maxTranscriptionMinutesPerMonth: 10000,
      maxAiRequestsPerMonth: 10000,
      maxStorageBytes: 500 * 1024 * 1024 * 1024, // 500 GB
    },
    features: [
      'Unlimited user seats & role hierarchies',
      '10,000+ Recording & Transcription minutes',
      'Unlimited meetings & recordings',
      '10,000 AI processing requests / month',
      '500 GB Dedicated encrypted storage',
      'Supabase Row-Level Security (RLS) tenant isolation',
      'SSO (SAML / Okta / Azure AD) integration',
      'Automated legal hold & auto-purge lifecycle',
      'Custom LLM fine-tuning & vocabulary rules',
      'Dedicated compliance manager & 99.9% SLA',
    ],
  },
];

export class BillingManager {
  private static instance: BillingManager;

  private stripeAdapter: StripeBillingAdapter;
  private razorpayAdapter: RazorpayBillingAdapter;
  private mockAdapter: MockBillingAdapter;

  private constructor() {
    this.stripeAdapter = new StripeBillingAdapter();
    this.razorpayAdapter = new RazorpayBillingAdapter();
    this.mockAdapter = new MockBillingAdapter();
  }

  public static getInstance(): BillingManager {
    if (!BillingManager.instance) {
      BillingManager.instance = new BillingManager();
    }
    return BillingManager.instance;
  }

  public getProvider(providerType?: 'STRIPE' | 'RAZORPAY' | 'SANDBOX'): IBillingProvider {
    if (providerType === 'STRIPE') {
      return this.stripeAdapter;
    }
    if (providerType === 'RAZORPAY') {
      return this.razorpayAdapter;
    }
    if (this.stripeAdapter.isConfigured()) {
      return this.stripeAdapter;
    }
    if (this.razorpayAdapter.isConfigured()) {
      return this.razorpayAdapter;
    }
    return this.mockAdapter;
  }

  public getStripeAdapter(): StripeBillingAdapter {
    return this.stripeAdapter;
  }

  public getRazorpayAdapter(): RazorpayBillingAdapter {
    return this.razorpayAdapter;
  }

  public getProviderConfig() {
    const stripeStatus = this.stripeAdapter.getStatus();
    const razorpayStatus = this.razorpayAdapter.getStatus();

    let activeProvider: 'STRIPE' | 'RAZORPAY' | 'SANDBOX' = 'SANDBOX';
    if (stripeStatus.isConfigured) activeProvider = 'STRIPE';
    else if (razorpayStatus.isConfigured) activeProvider = 'RAZORPAY';

    return {
      stripe: {
        isConfigured: stripeStatus.isConfigured,
        publishableKeyConfigured: stripeStatus.hasPublicKey,
        secretKeyConfigured: stripeStatus.hasSecretKey,
        webhookConfigured: stripeStatus.hasWebhookSecret,
        testMode: stripeStatus.testMode,
      },
      razorpay: {
        isConfigured: razorpayStatus.isConfigured,
        keyIdConfigured: razorpayStatus.hasPublicKey,
        keySecretConfigured: razorpayStatus.hasSecretKey,
        webhookConfigured: razorpayStatus.hasWebhookSecret,
        testMode: razorpayStatus.testMode,
      },
      activeProvider,
    };
  }

  public getPlanDefinition(tier: PlanTier): PlanDefinition {
    const plan = SAAS_PLANS.find((p) => p.tier === tier);
    return plan || SAAS_PLANS[0];
  }

  public async initiateCheckout(params: CheckoutSessionParams, providerChoice?: 'STRIPE' | 'RAZORPAY' | 'SANDBOX'): Promise<CheckoutSessionResult> {
    const provider = this.getProvider(providerChoice);
    return await provider.createCheckoutSession(params);
  }
}

export const billingManager = BillingManager.getInstance();
