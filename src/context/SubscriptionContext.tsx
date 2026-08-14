import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  PlanDefinition,
  PlanTier,
  BillingCycle,
  SubscriptionEntity,
  UsageSummary,
  InvoiceEntity,
  BillingProviderConfig,
  PaymentProviderType,
} from '../types';
import { meetingDb } from '../utils/meetingDatabase';

interface SubscriptionContextType {
  plans: PlanDefinition[];
  subscription: SubscriptionEntity | null;
  currentPlan: PlanDefinition | null;
  usage: UsageSummary | null;
  invoices: InvoiceEntity[];
  providerConfig: BillingProviderConfig | null;
  currency: 'USD' | 'INR';
  billingCycle: BillingCycle;
  isLoading: boolean;
  isCheckoutModalOpen: boolean;
  selectedTargetPlan: PlanDefinition | null;
  setCurrency: (currency: 'USD' | 'INR') => void;
  setBillingCycle: (cycle: BillingCycle) => void;
  setIsCheckoutModalOpen: (open: boolean) => void;
  setSelectedTargetPlan: (plan: PlanDefinition | null) => void;
  openUpgradeModal: (targetPlan: PlanDefinition) => void;
  executeUpgrade: (params: {
    planTier: PlanTier;
    billingCycle?: BillingCycle;
    currency?: 'USD' | 'INR';
    paymentProvider?: PaymentProviderType;
    paymentMethod?: any;
  }) => Promise<{ success: boolean; invoice?: InvoiceEntity; error?: string }>;
  cancelSubscription: (immediate?: boolean) => Promise<{ success: boolean; error?: string }>;
  refreshSubscription: () => Promise<void>;
  refreshUsage: () => Promise<void>;
  refreshInvoices: () => Promise<void>;
  simulateUsage: (metric: string, amount: number) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<PlanDefinition[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionEntity | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanDefinition | null>(null);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [invoices, setInvoices] = useState<InvoiceEntity[]>([]);
  const [providerConfig, setProviderConfig] = useState<BillingProviderConfig | null>(null);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [selectedTargetPlan, setSelectedTargetPlan] = useState<PlanDefinition | null>(null);

  const refreshPlans = useCallback(async () => {
    try {
      const p = await meetingDb.getBillingPlans();
      if (p && p.length > 0) setPlans(p);
    } catch (err) {
      console.error('Failed to load plans:', err);
    }
  }, []);

  const refreshSubscription = useCallback(async () => {
    try {
      const data = await meetingDb.getSubscription();
      if (data) {
        setSubscription(data.subscription);
        setCurrentPlan(data.plan);
        if (data.subscription?.billing_cycle) {
          setBillingCycle(data.subscription.billing_cycle);
        }
      }
    } catch (err) {
      console.error('Failed to load subscription:', err);
    }
  }, []);

  const refreshUsage = useCallback(async () => {
    try {
      const u = await meetingDb.getUsageSummary();
      if (u) setUsage(u);
    } catch (err) {
      console.error('Failed to load usage summary:', err);
    }
  }, []);

  const refreshInvoices = useCallback(async () => {
    try {
      const invs = await meetingDb.getBillingInvoices();
      if (invs) setInvoices(invs);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    }
  }, []);

  const refreshConfig = useCallback(async () => {
    try {
      const cfg = await meetingDb.getBillingConfig();
      if (cfg) setProviderConfig(cfg);
    } catch (err) {
      console.error('Failed to load billing config:', err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      setIsLoading(true);
      await Promise.all([
        refreshPlans(),
        refreshSubscription(),
        refreshUsage(),
        refreshInvoices(),
        refreshConfig(),
      ]);
      if (mounted) setIsLoading(false);
    };
    init();
    return () => {
      mounted = false;
    };
  }, [refreshPlans, refreshSubscription, refreshUsage, refreshInvoices, refreshConfig]);

  const openUpgradeModal = useCallback((targetPlan: PlanDefinition) => {
    setSelectedTargetPlan(targetPlan);
    setIsCheckoutModalOpen(true);
  }, []);

  const executeUpgrade = useCallback(
    async (params: {
      planTier: PlanTier;
      billingCycle?: BillingCycle;
      currency?: 'USD' | 'INR';
      paymentProvider?: PaymentProviderType;
      paymentMethod?: any;
    }) => {
      try {
        setIsLoading(true);
        const res = await meetingDb.confirmCheckout({
          planTier: params.planTier,
          billingCycle: params.billingCycle || billingCycle,
          currency: params.currency || currency,
          paymentProvider: params.paymentProvider || 'STRIPE',
          paymentMethod: params.paymentMethod,
        });

        if (res.success && res.subscription) {
          setSubscription(res.subscription);
          if (res.usage) setUsage(res.usage);
          if (res.invoice) {
            setInvoices((prev) => [res.invoice, ...prev]);
          }
          // Refresh plan details
          const matchingPlan = plans.find((p) => p.tier === res.subscription.plan_tier);
          if (matchingPlan) setCurrentPlan(matchingPlan);

          setIsCheckoutModalOpen(false);
          setIsLoading(false);
          return { success: true, invoice: res.invoice };
        } else {
          setIsLoading(false);
          return { success: false, error: res.error || 'Failed to complete upgrade' };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || 'Upgrade failed' };
      }
    },
    [billingCycle, currency, plans]
  );

  const cancelSubscription = useCallback(async (immediate: boolean = false) => {
    try {
      setIsLoading(true);
      const res = await meetingDb.cancelSubscription('org-default-enterprise', immediate);
      if (res.success && res.subscription) {
        setSubscription(res.subscription);
        if (res.usage) setUsage(res.usage);
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: res.error || 'Failed to cancel subscription' };
      }
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Cancellation failed' };
    }
  }, []);

  const simulateUsage = useCallback(
    async (metric: string, amount: number) => {
      const res = await meetingDb.simulateAddUsage(metric, amount);
      if (res.success && res.usage) {
        setUsage(res.usage);
      }
    },
    []
  );

  return (
    <SubscriptionContext.Provider
      value={{
        plans,
        subscription,
        currentPlan,
        usage,
        invoices,
        providerConfig,
        currency,
        billingCycle,
        isLoading,
        isCheckoutModalOpen,
        selectedTargetPlan,
        setCurrency,
        setBillingCycle,
        setIsCheckoutModalOpen,
        setSelectedTargetPlan,
        openUpgradeModal,
        executeUpgrade,
        cancelSubscription,
        refreshSubscription,
        refreshUsage,
        refreshInvoices,
        simulateUsage,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
