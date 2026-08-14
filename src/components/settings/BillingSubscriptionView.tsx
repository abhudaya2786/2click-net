import React, { useState } from 'react';
import {
  CreditCard,
  Zap,
  TrendingUp,
  Clock,
  Mic,
  FileText,
  Sparkles,
  HardDrive,
  Users,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Download,
  Receipt,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  X,
  Plus,
  HelpCircle,
  Building,
  Check,
  Lock,
  ArrowLeft,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSubscription } from '../../context/SubscriptionContext';
import { PlanDefinition, PlanTier, PaymentProviderType, InvoiceEntity } from '../../types';

interface BillingSubscriptionViewProps {
  onNavigate: (route: string) => void;
}

export function BillingSubscriptionView({ onNavigate }: BillingSubscriptionViewProps) {
  const {
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
    openUpgradeModal,
    executeUpgrade,
    cancelSubscription,
    refreshSubscription,
    refreshUsage,
    simulateUsage,
  } = useSubscription();

  const [activeTab, setActiveTab] = useState<'plans' | 'usage' | 'invoices' | 'gateways'>('plans');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceEntity | null>(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [cancelImmediate, setCancelImmediate] = useState(false);
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<PaymentProviderType>('STRIPE');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [upiId, setUpiId] = useState('admin@okaxis');
  const [isSimulatingAdd, setIsSimulatingAdd] = useState(false);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetPlan) return;

    setIsProcessingUpgrade(true);
    setUpgradeError(null);

    const paymentMethod =
      selectedPaymentProvider === 'RAZORPAY'
        ? { brand: 'UPI / NetBanking', type: 'upi', upi_id: upiId }
        : { brand: 'Visa', last4: cardNumber.slice(-4) || '4242', exp_month: 12, exp_year: 2028, type: 'card' };

    const result = await executeUpgrade({
      planTier: selectedTargetPlan.tier,
      billingCycle,
      currency,
      paymentProvider: selectedPaymentProvider,
      paymentMethod,
    });

    setIsProcessingUpgrade(false);

    if (result.success) {
      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore if canvas not supported
      }
    } else {
      setUpgradeError(result.error || 'Upgrade failed. Please try again.');
    }
  };

  const handleCancelSubscription = async () => {
    const res = await cancelSubscription(cancelImmediate);
    if (res.success) {
      setIsCancelConfirmOpen(false);
    }
  };

  const handleSimulateUsage = async (metric: string, amount: number) => {
    setIsSimulatingAdd(true);
    await simulateUsage(metric, amount);
    setIsSimulatingAdd(false);
  };

  const getTierColor = (tier?: PlanTier) => {
    switch (tier) {
      case 'ENTERPRISE':
        return 'from-purple-600 to-indigo-600 text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800';
      case 'BUSINESS':
        return 'from-indigo-600 to-blue-600 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800';
      case 'STARTER':
        return 'from-emerald-600 to-hs-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
      case 'FREE':
      default:
        return 'from-slate-600 to-gray-600 text-slate-600 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800';
    }
  };

  const formatPrice = (plan: PlanDefinition) => {
    if (currency === 'INR') {
      const price = billingCycle === 'yearly' ? plan.yearlyPriceInr : plan.monthlyPriceInr;
      return price === 0 ? '₹0' : `₹${price.toLocaleString('en-IN')}`;
    } else {
      const price = billingCycle === 'yearly' ? plan.yearlyPriceUsd : plan.monthlyPriceUsd;
      return price === 0 ? '$0' : `$${price}`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-slate-900 dark:text-slate-100">
      {/* Navigation Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
            <button
              onClick={() => onNavigate('/meetings')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Meetings</span>
            </button>
            <span>/</span>
            <span>Settings</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100 font-medium">Subscriptions & Usage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>SaaS Subscription & Usage</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Manage organization subscription tiers, track multi-metric usage limits, calculate remaining voice transcription minutes, and access billing invoices.
          </p>
        </div>

        {/* Top Controls & Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="nav-voice-settings"
            onClick={() => onNavigate('/settings/voice')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Voice & AI Models
          </button>
          <button
            id="nav-schedule-settings"
            onClick={() => onNavigate('/settings/schedule')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Recording Schedules
          </button>
          <button
            id="nav-privacy-settings"
            onClick={() => onNavigate('/settings/privacy')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Privacy & Retention
          </button>
          <button
            id="refresh-billing-btn"
            onClick={() => {
              refreshSubscription();
              refreshUsage();
            }}
            disabled={isLoading}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Refresh Usage & Subscription"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Active Subscription Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-slate-900 dark:to-indigo-950/20 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Current Plan
              </span>
              <span
                id="current-plan-badge"
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getTierColor(
                  subscription?.plan_tier
                )}`}
              >
                <Zap className="w-3.5 h-3.5" />
                {subscription?.plan_tier || 'STARTER'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {subscription?.status || 'ACTIVE'}
              </span>
              {subscription?.cancel_at_period_end && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-3 h-3" />
                  Canceling at period end
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {currentPlan?.name || 'Starter Plan'} —{' '}
              <span className="font-normal text-slate-600 dark:text-slate-300">
                {currentPlan ? formatPrice(currentPlan) : '$19'}/{billingCycle === 'yearly' ? 'mo (billed annually)' : 'month'}
              </span>
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              {currentPlan?.tagline || 'Collaborative voice recording, AI minutes, and team meeting summaries.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Renews on: <strong>{new Date(subscription?.current_period_end || Date.now() + 86400000 * 20).toLocaleDateString()}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                Payment Method:{' '}
                <strong>
                  {subscription?.payment_method?.brand || 'Visa'} •••• {subscription?.payment_method?.last4 || '4242'}
                </strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Org: <strong>Acme Corp (Enterprise)</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              id="upgrade-plan-btn"
              onClick={() => {
                const nextPlan = plans.find((p) => p.tier === 'BUSINESS') || plans[2] || plans[0];
                if (nextPlan) openUpgradeModal(nextPlan);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md hover:shadow-indigo-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Change / Upgrade Plan</span>
            </button>

            {subscription?.plan_tier !== 'FREE' && !subscription?.cancel_at_period_end && (
              <button
                id="cancel-plan-btn"
                onClick={() => setIsCancelConfirmOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 font-medium text-sm transition cursor-pointer"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        {/* Prominent Highlight: Remaining Voice Minutes Banner */}
        <div className="px-6 py-4 bg-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-indigo-100">
                Voice Transcription Quota
              </div>
              <div className="text-lg font-bold">
                {usage?.remainingRecordingMinutes === 999999
                  ? 'Unlimited Recording & Transcription Minutes'
                  : `${usage?.remainingRecordingMinutes || 175} Remaining Recording Minutes`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-indigo-100 text-right hidden md:block">
              Used {usage?.metrics?.recordingMinutes?.formattedUsed || '125 mins'} of{' '}
              {usage?.metrics?.recordingMinutes?.formattedLimit || '300 mins'} limit this cycle
            </div>
            <button
              onClick={() => {
                const target = plans.find((p) => p.tier === 'BUSINESS') || plans[0];
                if (target) openUpgradeModal(target);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-xs transition shadow-xs cursor-pointer whitespace-nowrap"
            >
              Get More Minutes
            </button>
          </div>
        </div>
      </div>

      {/* Main Feature Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'plans'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Subscription Plans & Tiers</span>
        </button>

        <button
          onClick={() => setActiveTab('usage')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'usage'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Live Usage Meters</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'invoices'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Billing History & Invoices</span>
          {invoices.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
              {invoices.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('gateways')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'gateways'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Payment Providers Architecture</span>
        </button>
      </div>

      {/* TAB 1: Subscription Plans Matrix */}
      {activeTab === 'plans' && (
        <div className="space-y-8 animate-fade-in">
          {/* Toggles: Currency and Billing Frequency */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {/* Currency Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Currency:
              </span>
              <div className="inline-flex rounded-xl p-1 bg-slate-200 dark:bg-slate-800">
                <button
                  id="currency-usd-btn"
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currency === 'USD'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  $ USD (Global)
                </button>
                <button
                  id="currency-inr-btn"
                  onClick={() => setCurrency('INR')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currency === 'INR'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  ₹ INR (India & Razorpay)
                </button>
              </div>
            </div>

            {/* Annual vs Monthly Switcher */}
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500'}`}>
                Monthly Billing
              </span>
              <button
                id="billing-cycle-toggle-btn"
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  billingCycle === 'yearly' ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    billingCycle === 'yearly' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-xs font-medium flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500'}`}>
                <span>Annual Billing</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          {/* 4 Plan Cards Grid: FREE, STARTER, BUSINESS, ENTERPRISE */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const isCurrent = subscription?.plan_tier === plan.tier;
              const isPopular = plan.popular;

              return (
                <div
                  key={plan.tier}
                  id={`plan-card-${plan.tier.toLowerCase()}`}
                  className={`relative rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    isCurrent
                      ? 'border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-slate-900 shadow-md'
                      : isPopular
                      ? 'border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-900 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Top Badges */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-hs-600 text-white shadow-xs">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="p-6 space-y-5">
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[36px]">
                        {plan.tagline}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                          {formatPrice(plan)}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          /{billingCycle === 'yearly' ? 'mo billed annually' : 'month'}
                        </span>
                      </div>
                    </div>

                    {/* Quota Highlights */}
                    <div className="space-y-2 py-3 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-500" />
                          Seats:
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {plan.limits.maxUsers === -1 ? 'Unlimited' : `${plan.limits.maxUsers} seat${plan.limits.maxUsers > 1 ? 's' : ''}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-500" />
                          Recording:
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {plan.limits.maxRecordingMinutesPerMonth === -1
                            ? 'Unlimited'
                            : `${plan.limits.maxRecordingMinutesPerMonth} mins/mo`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          AI Requests:
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {plan.limits.maxAiRequestsPerMonth.toLocaleString()} reqs/mo
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <HardDrive className="w-3.5 h-3.5 text-blue-500" />
                          Cloud Storage:
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {(plan.limits.maxStorageBytes / (1024 * 1024 * 1024)).toFixed(0)} GB
                        </span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-2.5 pt-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Included Features:
                      </div>
                      <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                        {plan.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="p-6 pt-0">
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold text-xs cursor-default flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                        Current Plan
                      </button>
                    ) : (
                      <button
                        id={`select-plan-${plan.tier.toLowerCase()}`}
                        onClick={() => openUpgradeModal(plan)}
                        className={`w-full py-2.5 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          plan.tier === 'ENTERPRISE'
                            ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                            : plan.tier === 'BUSINESS'
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                            : 'bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900'
                        }`}
                      >
                        <span>Select {plan.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Live Usage Meters & Metrics */}
      {activeTab === 'usage' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header & Simulator Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span>Current Cycle Quota & Resource Usage ({usage?.period || '2026-08'})</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Metrics reset on the 1st of every billing month. Overages trigger automated alert notifications.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 hidden sm:inline">Simulate Usage:</span>
              <button
                id="sim-voice-usage-btn"
                onClick={() => handleSimulateUsage('recordingMinutes', 30)}
                disabled={isSimulatingAdd}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1"
                title="Simulate recording a 30-minute meeting to test quota meters"
              >
                <Plus className="w-3 h-3 text-indigo-500" />
                <span>+30 Mins Audio</span>
              </button>
              <button
                id="sim-refresh-usage-btn"
                onClick={() => refreshUsage()}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 6 Metric Gauges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Active Users */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Organization Users</h4>
                    <span className="text-xs text-slate-400">Active seat allocation</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {usage?.metrics?.users?.formattedUsed || '1'} / {usage?.metrics?.users?.formattedLimit || '3'}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>Usage percentage</span>
                  <span className="font-semibold">{usage?.metrics?.users?.percent || 33}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (usage?.metrics?.users?.percent || 0) >= 90 ? 'bg-red-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(100, usage?.metrics?.users?.percent || 33)}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                Remaining seats: <strong>{usage?.metrics?.users?.formattedRemaining || '2 seats'}</strong>
              </div>
            </div>

            {/* 2. Monthly Meetings */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Meetings Created</h4>
                    <span className="text-xs text-slate-400">Total sessions this period</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {usage?.metrics?.meetings?.formattedUsed || '8'} / {usage?.metrics?.meetings?.formattedLimit || '50'}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>Usage percentage</span>
                  <span className="font-semibold">{usage?.metrics?.meetings?.percent || 16}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, usage?.metrics?.meetings?.percent || 16)}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                Remaining meetings:{' '}
                <strong>{usage?.metrics?.meetings?.formattedRemaining || '42 meetings'}</strong>
              </div>
            </div>

            {/* 3. Recording Minutes (Highlighted Gauge) */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/30 dark:border-emerald-500/30 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Recording Minutes</h4>
                    <span className="text-xs text-slate-400">Live microphone audio</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {usage?.metrics?.recordingMinutes?.formattedUsed || '125 mins'} /{' '}
                  {usage?.metrics?.recordingMinutes?.formattedLimit || '300 mins'}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>Voice quota used</span>
                  <span className="font-semibold">{usage?.metrics?.recordingMinutes?.percent || 42}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, usage?.metrics?.recordingMinutes?.percent || 42)}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium pt-1">
                Remaining minutes:{' '}
                <strong>{usage?.remainingRecordingMinutes || 175} mins</strong>
              </div>
            </div>

            {/* 4. Transcription Minutes */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-hs-50 dark:bg-hs-900/60 text-hs-600 dark:text-hs-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Transcription Minutes</h4>
                    <span className="text-xs text-slate-400">Speech-to-text processed</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {usage?.metrics?.transcriptionMinutes?.formattedUsed || '120 mins'} /{' '}
                  {usage?.metrics?.transcriptionMinutes?.formattedLimit || '300 mins'}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>Usage percentage</span>
                  <span className="font-semibold">{usage?.metrics?.transcriptionMinutes?.percent || 40}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-hs-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, usage?.metrics?.transcriptionMinutes?.percent || 40)}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                Remaining transcription:{' '}
                <strong>{usage?.remainingTranscriptionMinutes || 180} mins</strong>
              </div>
            </div>

            {/* 5. AI Processing Requests */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">AI Requests (MoM)</h4>
                    <span className="text-xs text-slate-400">Gemini 2.5 / 3.7 summaries</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {usage?.metrics?.aiRequests?.formattedUsed || '48'} /{' '}
                  {usage?.metrics?.aiRequests?.formattedLimit || '200'}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>Usage percentage</span>
                  <span className="font-semibold">{usage?.metrics?.aiRequests?.percent || 24}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, usage?.metrics?.aiRequests?.percent || 24)}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                Remaining requests:{' '}
                <strong>{usage?.metrics?.aiRequests?.formattedRemaining || '152 reqs'}</strong>
              </div>
            </div>

            {/* 6. Cloud Storage */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cloud Storage</h4>
                    <span className="text-xs text-slate-400">Encrypted audio & exports</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {usage?.metrics?.storage?.formattedUsed || '1.45 GB'} /{' '}
                  {usage?.metrics?.storage?.formattedLimit || '5 GB'}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>Usage percentage</span>
                  <span className="font-semibold">{usage?.metrics?.storage?.percent || 29}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, usage?.metrics?.storage?.percent || 29)}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                Total storage limit: <strong>{usage?.metrics?.storage?.formattedLimit || '5 GB'}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Invoices & Billing History */}
      {activeTab === 'invoices' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <span>Invoices & Payment History</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Download PDF tax receipts and inspect past payment settlements.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Plan / Description</th>
                    <th className="py-3.5 px-4">Billing Date</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Provider</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No previous billing history found.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-white">
                          {inv.invoice_number}
                        </td>
                        <td className="py-3.5 px-4 font-medium">{inv.plan_name}</td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(inv.paid_at || inv.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {inv.currency === 'INR' ? `₹${inv.amount.toLocaleString('en-IN')}` : `$${inv.amount}`}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            {inv.payment_provider || 'STRIPE'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer font-medium"
                          >
                            <Download className="w-3 h-3" />
                            <span>Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Payment Provider Gateway Architecture & Readiness */}
      {activeTab === 'gateways' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                Polymorphic BillingProvider Abstraction
              </h4>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1 leading-relaxed">
                The billing architecture conforms to a strict adapter pattern. It dynamically decouples payment gateways
                (Stripe & Razorpay) and runs safe Sandbox simulations until live credentials are provided in server secrets.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stripe Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold">
                    S
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Stripe Billing Provider</h4>
                    <span className="text-xs text-slate-400">Global Credit Cards, SEPA & Apple Pay</span>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    providerConfig?.stripe.isConfigured
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  {providerConfig?.stripe.isConfigured ? 'Live Configured' : 'Ready / Sandbox Mode'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Secret Key (`STRIPE_SECRET_KEY`):</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {providerConfig?.stripe.secretKeyConfigured ? '✓ Configured' : 'Pending Server Env'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Publishable Key (`STRIPE_PUBLISHABLE_KEY`):</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {providerConfig?.stripe.publishableKeyConfigured ? '✓ Configured' : 'Pending Server Env'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-500">Webhook Endpoint:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">/api/billing/webhook/stripe</span>
                </div>
              </div>
            </div>

            {/* Razorpay Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                    R
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Razorpay Billing Provider</h4>
                    <span className="text-xs text-slate-400">UPI, NetBanking, INR & Global Cards</span>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    providerConfig?.razorpay.isConfigured
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  {providerConfig?.razorpay.isConfigured ? 'Live Configured' : 'Ready / Sandbox Mode'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Key ID (`RAZORPAY_KEY_ID`):</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {providerConfig?.razorpay.keyIdConfigured ? '✓ Configured' : 'Pending Server Env'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Key Secret (`RAZORPAY_KEY_SECRET`):</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {providerConfig?.razorpay.keySecretConfigured ? '✓ Configured' : 'Pending Server Env'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-500">Webhook Endpoint:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">/api/billing/webhook/razorpay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT / PLAN UPGRADE MODAL */}
      {isCheckoutModalOpen && selectedTargetPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Checkout & Upgrade
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Upgrade to {selectedTargetPlan.name} Plan
                </h3>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plan Price Summary */}
            <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedTargetPlan.name} ({billingCycle === 'yearly' ? 'Annual' : 'Monthly'})
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedTargetPlan.limits.maxRecordingMinutesPerMonth === -1
                    ? 'Unlimited voice minutes'
                    : `${selectedTargetPlan.limits.maxRecordingMinutesPerMonth} voice recording minutes / month`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {formatPrice(selectedTargetPlan)}
                </div>
                <div className="text-[10px] text-slate-400">
                  {billingCycle === 'yearly' ? 'billed annually' : 'billed monthly'}
                </div>
              </div>
            </div>

            {/* Payment Provider Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Select Payment Method
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentProvider('STRIPE')}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    selectedPaymentProvider === 'STRIPE'
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">Stripe</span>
                    <CreditCard className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-[11px] text-slate-500">Credit / Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentProvider('RAZORPAY')}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    selectedPaymentProvider === 'RAZORPAY'
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">Razorpay</span>
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-[11px] text-slate-500">UPI / NetBanking (INR)</span>
                </button>
              </div>
            </div>

            {/* Payment Fields Simulator */}
            {selectedPaymentProvider === 'STRIPE' ? (
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 mb-1">Expires</label>
                    <input
                      type="text"
                      defaultValue="12/28"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">CVC</label>
                    <input
                      type="password"
                      defaultValue="888"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Virtual Payment Address (UPI ID)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="user@okhdfcbank"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>
                <div className="text-[11px] text-slate-400">
                  A payment request will be sent to your UPI app (Google Pay / PhonePe / Paytm).
                </div>
              </div>
            )}

            {/* Sandbox Notice Guarantee */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                Sandbox Mode Active. No real charges are applied until credentials are configured.
              </span>
            </div>

            {upgradeError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{upgradeError}</span>
              </div>
            )}

            {/* Submit Upgrade */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-upgrade-submit-btn"
                onClick={handleCheckoutSubmit}
                disabled={isProcessingUpgrade}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessingUpgrade ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Upgrade...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Confirm & Activate Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL SUBSCRIPTION CONFIRMATION MODAL */}
      {isCancelConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cancel Subscription?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to cancel your {currentPlan?.name || 'Active'} subscription?
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cancelType"
                  checked={!cancelImmediate}
                  onChange={() => setCancelImmediate(false)}
                />
                <span>
                  Cancel at end of billing period (retain access until{' '}
                  {new Date(subscription?.current_period_end || Date.now()).toLocaleDateString()})
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cancelType"
                  checked={cancelImmediate}
                  onChange={() => setCancelImmediate(true)}
                />
                <span>Downgrade immediately to Free Tier (60 mins/month)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsCancelConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE RECEIPT MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tax Invoice & Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-400">Invoice Number</div>
                  <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                    {selectedInvoice.invoice_number}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400">Date Paid</div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {new Date(selectedInvoice.paid_at || selectedInvoice.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Plan Description:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedInvoice.plan_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Billing Provider:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {selectedInvoice.payment_provider}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Organization:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Acme Corp (Enterprise)</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 text-sm font-bold">
                  <span>Total Amount Paid:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {selectedInvoice.currency === 'INR'
                      ? `₹${selectedInvoice.amount.toLocaleString('en-IN')}`
                      : `$${selectedInvoice.amount}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
