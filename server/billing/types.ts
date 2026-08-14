export type PlanTier = 'FREE' | 'STARTER' | 'BUSINESS' | 'ENTERPRISE';
export type BillingCycle = 'monthly' | 'yearly';
export type CurrencyCode = 'USD' | 'INR';

export interface CustomerParams {
  email: string;
  name: string;
  orgId: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionParams {
  orgId: string;
  userEmail: string;
  userName: string;
  planTier: PlanTier;
  billingCycle: BillingCycle;
  currency: CurrencyCode;
  amount: number; // in minor units (cents or paise)
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResult {
  provider: 'STRIPE' | 'RAZORPAY' | 'SANDBOX';
  sessionId?: string;
  orderId?: string;
  checkoutUrl?: string;
  clientSecret?: string;
  keyId?: string; // For client-side SDKs
  amount: number;
  currency: CurrencyCode;
  planTier: PlanTier;
  billingCycle: BillingCycle;
  isSimulated: boolean;
  message?: string;
}

export interface SubscriptionOperationResult {
  success: boolean;
  subscriptionId?: string;
  status: string;
  message?: string;
  raw?: any;
}

export interface WebhookEventPayload {
  rawBody: string | Buffer;
  headers: Record<string, string | string[] | undefined>;
  parsedBody?: any;
}

export interface WebhookProcessingResult {
  handled: boolean;
  eventType: string;
  orgId?: string;
  planTier?: PlanTier;
  status?: string;
  invoiceId?: string;
  amount?: number;
  currency?: CurrencyCode;
  customerId?: string;
  subscriptionId?: string;
  rawEvent?: any;
}

export interface IBillingProvider {
  readonly name: 'STRIPE' | 'RAZORPAY' | 'SANDBOX';
  
  /**
   * Checks if required API keys / credentials are set in environment variables.
   */
  isConfigured(): boolean;

  /**
   * Get configuration status detail (safe for exposing to client).
   */
  getStatus(): {
    isConfigured: boolean;
    hasSecretKey: boolean;
    hasPublicKey: boolean;
    hasWebhookSecret: boolean;
    testMode: boolean;
  };

  /**
   * Create or fetch a customer profile on the payment gateway.
   */
  createCustomer(params: CustomerParams): Promise<{ customerId: string; isSimulated: boolean }>;

  /**
   * Create a checkout session or order for a plan subscription.
   */
  createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult>;

  /**
   * Cancel an active subscription on the payment provider.
   */
  cancelSubscription(subscriptionId: string): Promise<SubscriptionOperationResult>;

  /**
   * Verify cryptographic webhook signatures if secrets are configured.
   */
  verifyWebhookSignature(payload: WebhookEventPayload): boolean;

  /**
   * Parse and normalize inbound webhook events.
   */
  handleWebhook(payload: WebhookEventPayload): Promise<WebhookProcessingResult>;
}
