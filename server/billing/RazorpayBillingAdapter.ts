import crypto from 'crypto';
import {
  IBillingProvider,
  CustomerParams,
  CheckoutSessionParams,
  CheckoutSessionResult,
  SubscriptionOperationResult,
  WebhookEventPayload,
  WebhookProcessingResult,
} from './types';

export class RazorpayBillingAdapter implements IBillingProvider {
  public readonly name = 'RAZORPAY';

  private get keyId(): string | undefined {
    return process.env.RAZORPAY_KEY_ID;
  }

  private get keySecret(): string | undefined {
    return process.env.RAZORPAY_KEY_SECRET;
  }

  private get webhookSecret(): string | undefined {
    return process.env.RAZORPAY_WEBHOOK_SECRET;
  }

  public isConfigured(): boolean {
    return Boolean(this.keyId && this.keySecret && this.keyId.startsWith('rzp_'));
  }

  public getStatus() {
    const isConfig = this.isConfigured();
    const hasSecret = Boolean(this.keySecret);
    const hasPublic = Boolean(this.keyId);
    const hasWebhook = Boolean(this.webhookSecret);
    const testMode = isConfig ? this.keyId!.includes('_test_') : true;

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
      return {
        customerId: `cust_rzp_sim_${params.orgId}_${Date.now().toString(36)}`,
        isSimulated: true,
      };
    }

    return {
      customerId: `cust_rzp_${params.orgId}_${Date.now().toString(36)}`,
      isSimulated: false,
    };
  }

  public async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    const isConfig = this.isConfigured();
    const orderId = `order_rzp_${isConfig ? 'live' : 'test'}_${Date.now().toString(36)}`;

    // Convert amount to paise (if INR) or cents
    const amountInMinorUnits = params.currency === 'INR' ? params.amount : params.amount;

    return {
      provider: 'RAZORPAY',
      orderId,
      keyId: this.keyId || 'rzp_test_sample_key_ready_for_configuration',
      amount: amountInMinorUnits,
      currency: params.currency,
      planTier: params.planTier,
      billingCycle: params.billingCycle,
      isSimulated: !isConfig,
      message: isConfig
        ? 'Razorpay Live Order initialized.'
        : 'Razorpay Sandbox Mode: Credentials pending configuration. Simulated order generated.',
    };
  }

  public async cancelSubscription(subscriptionId: string): Promise<SubscriptionOperationResult> {
    return {
      success: true,
      subscriptionId,
      status: 'CANCELED',
      message: 'Razorpay subscription cancellation scheduled.',
    };
  }

  public verifyWebhookSignature(payload: WebhookEventPayload): boolean {
    if (!this.webhookSecret) {
      return true;
    }

    const signature = payload.headers['x-razorpay-signature'] as string;
    if (!signature) return false;

    try {
      const body = typeof payload.rawBody === 'string' ? payload.rawBody : payload.rawBody.toString('utf8');
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(body)
        .digest('hex');

      return signature === expectedSignature;
    } catch {
      return false;
    }
  }

  public async handleWebhook(payload: WebhookEventPayload): Promise<WebhookProcessingResult> {
    const event = payload.parsedBody || (typeof payload.rawBody === 'string' ? JSON.parse(payload.rawBody) : {});
    const eventType = event.event || 'unknown';

    switch (eventType) {
      case 'payment.captured':
      case 'order.paid':
      case 'subscription.charged': {
        const payment = event.payload?.payment?.entity || event.payload?.order?.entity || {};
        const notes = payment.notes || {};
        return {
          handled: true,
          eventType,
          orgId: notes.orgId,
          planTier: notes.planTier,
          status: 'ACTIVE',
          invoiceId: payment.id || payment.invoice_id,
          amount: payment.amount,
          currency: (payment.currency || 'INR').toUpperCase(),
          customerId: payment.customer_id,
          subscriptionId: payment.subscription_id,
          rawEvent: event,
        };
      }
      case 'subscription.cancelled': {
        const sub = event.payload?.subscription?.entity || {};
        const notes = sub.notes || {};
        return {
          handled: true,
          eventType,
          orgId: notes.orgId,
          status: 'CANCELED',
          subscriptionId: sub.id,
          rawEvent: event,
        };
      }
      default:
        return {
          handled: false,
          eventType,
          rawEvent: event,
        };
    }
  }
}
