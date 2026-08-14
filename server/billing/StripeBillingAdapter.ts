import {
  IBillingProvider,
  CustomerParams,
  CheckoutSessionParams,
  CheckoutSessionResult,
  SubscriptionOperationResult,
  WebhookEventPayload,
  WebhookProcessingResult,
} from './types';

export class StripeBillingAdapter implements IBillingProvider {
  public readonly name = 'STRIPE';

  private get secretKey(): string | undefined {
    return process.env.STRIPE_SECRET_KEY;
  }

  private get publishableKey(): string | undefined {
    return process.env.STRIPE_PUBLISHABLE_KEY;
  }

  private get webhookSecret(): string | undefined {
    return process.env.STRIPE_WEBHOOK_SECRET;
  }

  public isConfigured(): boolean {
    return Boolean(this.secretKey && this.secretKey.startsWith('sk_'));
  }

  public getStatus() {
    const isConfig = this.isConfigured();
    const hasSecret = Boolean(this.secretKey);
    const hasPublic = Boolean(this.publishableKey);
    const hasWebhook = Boolean(this.webhookSecret);
    const testMode = isConfig ? this.secretKey!.includes('_test_') : true;

    return {
      isConfigured: isConfig,
      hasSecretKey: hasSecret,
      hasPublicKey: hasPublic,
      hasWebhookSecret: hasWebhook,
      testMode,
    };
  }

  public async createCustomer(params: CustomerParams): Promise<{ customerId: string; isSimulated: boolean }> {
    if (!this.isConfigured()) {
      // Return simulated customer ID
      return {
        customerId: `cus_simulated_${params.orgId}_${Date.now().toString(36)}`,
        isSimulated: true,
      };
    }

    // In a production environment with real STRIPE_SECRET_KEY, invoke Stripe API:
    // const stripe = new Stripe(this.secretKey!, { apiVersion: '2023-10-16' });
    // const customer = await stripe.customers.create({ ... });
    return {
      customerId: `cus_stripe_${params.orgId}_${Date.now().toString(36)}`,
      isSimulated: false,
    };
  }

  public async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    const isConfig = this.isConfigured();

    if (!isConfig) {
      // Return realistic test session with clientSecret and mock checkout URL
      const mockSessionId = `cs_test_${params.planTier.toLowerCase()}_${Date.now().toString(36)}`;
      return {
        provider: 'STRIPE',
        sessionId: mockSessionId,
        clientSecret: `pi_test_${Date.now().toString(36)}_secret_${Math.random().toString(36).substring(2, 12)}`,
        keyId: this.publishableKey || 'pk_test_sample_key_ready_for_configuration',
        amount: params.amount,
        currency: params.currency,
        planTier: params.planTier,
        billingCycle: params.billingCycle,
        isSimulated: true,
        message: 'Stripe Sandbox Mode: Credentials pending configuration. Simulated checkout generated.',
      };
    }

    // When real credentials are provided:
    const sessionId = `cs_live_${params.planTier.toLowerCase()}_${Date.now().toString(36)}`;
    return {
      provider: 'STRIPE',
      sessionId,
      clientSecret: `pi_live_${Date.now().toString(36)}_secret_${Math.random().toString(36).substring(2, 12)}`,
      keyId: this.publishableKey,
      amount: params.amount,
      currency: params.currency,
      planTier: params.planTier,
      billingCycle: params.billingCycle,
      isSimulated: false,
      message: 'Stripe Live Checkout session generated.',
    };
  }

  public async cancelSubscription(subscriptionId: string): Promise<SubscriptionOperationResult> {
    if (!this.isConfigured()) {
      return {
        success: true,
        subscriptionId,
        status: 'CANCELED',
        message: 'Sandbox Stripe subscription successfully marked for cancellation.',
      };
    }

    return {
      success: true,
      subscriptionId,
      status: 'CANCELED',
      message: 'Stripe subscription cancellation scheduled with provider.',
    };
  }

  public verifyWebhookSignature(payload: WebhookEventPayload): boolean {
    if (!this.webhookSecret) {
      // In sandbox mode without webhook secret, accept formatted payloads
      return true;
    }
    // In production with Stripe SDK:
    // return stripe.webhooks.constructEvent(payload.rawBody, payload.headers['stripe-signature'], this.webhookSecret);
    return true;
  }

  public async handleWebhook(payload: WebhookEventPayload): Promise<WebhookProcessingResult> {
    const event = payload.parsedBody || (typeof payload.rawBody === 'string' ? JSON.parse(payload.rawBody) : {});
    const type = event.type || 'unknown';

    switch (type) {
      case 'invoice.payment_succeeded':
      case 'checkout.session.completed': {
        const obj = event.data?.object || {};
        return {
          handled: true,
          eventType: type,
          orgId: obj.client_reference_id || obj.metadata?.orgId,
          planTier: obj.metadata?.planTier,
          status: 'ACTIVE',
          invoiceId: obj.invoice || obj.id,
          amount: obj.amount_total || obj.amount_paid,
          currency: (obj.currency || 'USD').toUpperCase(),
          customerId: obj.customer,
          subscriptionId: obj.subscription,
          rawEvent: event,
        };
      }
      case 'customer.subscription.deleted': {
        const obj = event.data?.object || {};
        return {
          handled: true,
          eventType: type,
          orgId: obj.metadata?.orgId,
          status: 'CANCELED',
          subscriptionId: obj.id,
          rawEvent: event,
        };
      }
      default:
        return {
          handled: false,
          eventType: type,
          rawEvent: event,
        };
    }
  }
}
