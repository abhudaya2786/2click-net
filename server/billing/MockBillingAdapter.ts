import {
  IBillingProvider,
  CustomerParams,
  CheckoutSessionParams,
  CheckoutSessionResult,
  SubscriptionOperationResult,
  WebhookEventPayload,
  WebhookProcessingResult,
} from './types';

export class MockBillingAdapter implements IBillingProvider {
  public readonly name = 'SANDBOX';

  public isConfigured(): boolean {
    return true;
  }

  public getStatus() {
    return {
      isConfigured: true,
      hasSecretKey: true,
      hasPublicKey: true,
      hasWebhookSecret: true,
      testMode: true,
    };
  }

  public async createCustomer(params: CustomerParams): Promise<{ customerId: string; isSimulated: boolean }> {
    return {
      customerId: `cus_sandbox_${params.orgId}_${Date.now().toString(36)}`,
      isSimulated: true,
    };
  }

  public async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    return {
      provider: 'SANDBOX',
      sessionId: `sandbox_sess_${Date.now().toString(36)}`,
      clientSecret: `sandbox_secret_${Math.random().toString(36).substring(2, 10)}`,
      amount: params.amount,
      currency: params.currency,
      planTier: params.planTier,
      billingCycle: params.billingCycle,
      isSimulated: true,
      message: 'Simulated instant billing session activated.',
    };
  }

  public async cancelSubscription(subscriptionId: string): Promise<SubscriptionOperationResult> {
    return {
      success: true,
      subscriptionId,
      status: 'CANCELED',
      message: 'Sandbox subscription cancellation executed.',
    };
  }

  public verifyWebhookSignature(_payload: WebhookEventPayload): boolean {
    return true;
  }

  public async handleWebhook(payload: WebhookEventPayload): Promise<WebhookProcessingResult> {
    const event = payload.parsedBody || {};
    return {
      handled: true,
      eventType: 'sandbox.event',
      rawEvent: event,
    };
  }
}
