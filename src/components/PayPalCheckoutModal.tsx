import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Shield, 
  Zap, 
  Lock, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  ArrowRight,
  CreditCard,
  Building2,
  Mail,
  User,
  Globe2
} from 'lucide-react';
import { PlanTier } from '../types';
import { PLAN_DEFINITIONS } from '../utils/quotaManager';

interface PayPalCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: PlanTier;
  billingCycle: 'monthly' | 'annual';
  onSuccessfulPayment: (data: {
    tier: PlanTier;
    orderId: string;
    payerId?: string;
    licenseKey: string;
    email: string;
    billingCycle: 'monthly' | 'annual';
  }) => void;
}

export const PayPalCheckoutModal: React.FC<PayPalCheckoutModalProps> = ({
  isOpen,
  onClose,
  tier,
  billingCycle,
  onSuccessfulPayment
}) => {
  const [email, setEmail] = useState('engineer@robotics-lab.ai');
  const [name, setName] = useState('Senior Robotics Engineer');
  const [organization, setOrganization] = useState('Autonomous Systems Lab');
  const [currency, setCurrency] = useState('USD');
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card' | 'paylater'>('paypal');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    orderId: string;
    payerId: string;
    licenseKey: string;
    tier: PlanTier;
    amount: number;
    email: string;
  } | null>(null);

  const [paypalConfig, setPaypalConfig] = useState<{
    configured: boolean;
    clientId: string | null;
    mode: string;
  } | null>(null);

  const planDef = PLAN_DEFINITIONS[tier] || PLAN_DEFINITIONS.pro;

  const prices: Record<PlanTier, { monthly: number; annual: number }> = {
    developer: { monthly: 0, annual: 0 },
    pro: { monthly: 79, annual: 63 * 12 },
    team: { monthly: 399, annual: 319 * 12 },
    enterprise: { monthly: 1500, annual: 1200 * 12 }
  };

  const currentPrice = billingCycle === 'annual' ? prices[tier].annual : prices[tier].monthly;
  const monthlyEquivalent = billingCycle === 'annual' ? Math.round(prices[tier].annual / 12) : prices[tier].monthly;

  useEffect(() => {
    if (!isOpen) {
      setSuccessData(null);
      setError(null);
      setIsLoading(false);
      setIsProcessingPayment(false);
      return;
    }

    // Fetch PayPal config from backend
    fetch('/api/paypal/config')
      .then(res => res.json())
      .then(data => setPaypalConfig(data))
      .catch(() => setPaypalConfig({ configured: false, clientId: null, mode: 'sandbox' }));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExecutePayPalPayment = async (selectedMethod: 'paypal' | 'card' | 'paylater') => {
    setIsLoading(true);
    setIsProcessingPayment(true);
    setError(null);

    try {
      // Step 1: Create PayPal Order via server backend
      const createRes = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          billingCycle,
          currency,
          email,
          payerName: name,
          organization
        })
      });

      const orderData = await createRes.json();
      if (!createRes.ok || !orderData.orderId) {
        throw new Error(orderData.error || 'Failed to initialize PayPal order');
      }

      const orderId = orderData.orderId;

      // Step 2: Capture PayPal Order via server backend
      const captureRes = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          tier,
          email,
          billingCycle
        })
      });

      const captureData = await captureRes.json();
      if (!captureRes.ok || !captureData.success) {
        throw new Error(captureData.error || 'Failed to capture PayPal payment');
      }

      const completed = {
        orderId: captureData.orderId || orderId,
        payerId: captureData.payerId || `PP-PAYER-${Date.now().toString(36).toUpperCase()}`,
        licenseKey: captureData.licenseKey || `PAYPAL-AIGEN-${tier.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        tier,
        amount: currentPrice,
        email
      };

      setSuccessData(completed);

      // Trigger workspace upgrade callback
      onSuccessfulPayment({
        tier,
        orderId: completed.orderId,
        payerId: completed.payerId,
        licenseKey: completed.licenseKey,
        email,
        billingCycle
      });
    } catch (err: any) {
      console.error('PayPal checkout error:', err);
      setError(err.message || 'An unexpected error occurred during PayPal checkout.');
    } finally {
      setIsLoading(false);
      setIsProcessingPayment(false);
    }
  };

  return (
    <div id="paypal-checkout-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 font-mono text-slate-200">
        
        {/* Close Button */}
        <button
          id="close-paypal-checkout"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#003087]/20 border border-[#0079C1]/50 flex items-center justify-center font-bold text-base text-[#0079C1] shadow-inner">
              <span className="text-[#0079C1] font-black italic">P</span>
              <span className="text-[#00457C] font-black italic -ml-1 text-sm">P</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003087]/20 border border-[#0079C1]/40 text-[#0079C1] text-xs font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>PayPal Verified Checkout</span>
            </div>
            {paypalConfig?.mode && (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {paypalConfig.mode === 'live' ? '⚡ PayPal Live' : '🛠️ Sandbox Mode'}
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {successData ? 'Payment Confirmed & Workspace Upgraded' : `Activate ${planDef.name}`}
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            {successData 
              ? 'Your PayPal subscription is active. Production API keys and advanced Physical AI toolchains are unlocked.'
              : 'Securely subscribe via PayPal with instant API key and cloud workspace provisioning.'}
          </p>
        </div>

        {/* Success View */}
        {successData ? (
          <div className="space-y-6">
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">PayPal Transaction Successful</h4>
                  <p className="text-xs text-emerald-300 font-sans">
                    Subscription active for <strong className="text-white">{successData.email}</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">PayPal Order ID</span>
                  <code className="text-emerald-400 font-bold break-all">{successData.orderId}</code>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Payer ID</span>
                  <code className="text-cyan-400 font-bold">{successData.payerId}</code>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 sm:col-span-2">
                  <span className="text-[10px] text-slate-500 block">Assigned License Key</span>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <code className="text-amber-300 font-bold text-xs">{successData.licenseKey}</code>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      ACTIVATED
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                id="btn-return-workspace"
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>Launch Upgraded Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Interactive Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Order Summary */}
            <div className="lg:col-span-5 bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Selected Plan</span>
                  <h4 className="text-base font-bold text-white">{planDef.name}</h4>
                  <span className="text-[11px] text-slate-400">
                    Billed {billingCycle} {billingCycle === 'annual' && '(-20% off)'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-white">${currentPrice}</div>
                  <span className="text-[10px] text-slate-400">
                    {billingCycle === 'annual' ? `$${monthlyEquivalent}/mo` : '/month'}
                  </span>
                </div>
              </div>

              {/* Inclusions */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Includes</span>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{planDef.aiSynthesesLimit.toLocaleString()} AI Syntheses / month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{planDef.simulationsLimit.toLocaleString()} Physics Sim Runs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>ROS 2 Humble & Isaac Sim Exporters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Instant API Key Provisioning</span>
                  </li>
                </ul>
              </div>

              {/* Currency Selector */}
              <div className="pt-3 border-t border-slate-800/80">
                <label className="block text-[10px] text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Billing Currency</span>
                </label>
                <select
                  id="paypal-currency-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#0079C1]"
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="CAD">CAD ($) - Canadian Dollar</option>
                  <option value="JPY">JPY (¥) - Japanese Yen</option>
                  <option value="AUD">AUD ($) - Australian Dollar</option>
                </select>
              </div>

              {/* Security badge */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 flex items-center gap-2.5 text-[10px] text-slate-400">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Encrypted 256-bit TLS connection. PayPal Buyer Protection included.</span>
              </div>
            </div>

            {/* Right Column: Customer Details & PayPal Smart Buttons */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Account Details Form */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-cyan-400" />
                    <span>PayPal / Work Email</span>
                  </label>
                  <input
                    id="paypal-input-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@robotics-lab.ai"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#0079C1] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>Account Holder</span>
                    </label>
                    <input
                      id="paypal-input-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Alex Rivera"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#0079C1]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>Lab / Organization</span>
                    </label>
                    <input
                      id="paypal-input-org"
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Autonomous Lab"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-[#0079C1]"
                    />
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* PayPal Payment Option Buttons */}
              <div className="pt-2 space-y-2.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Select PayPal Payment Option
                </span>

                {/* 1. Official PayPal Button (Golden Brand) */}
                <button
                  id="btn-paypal-standard"
                  disabled={isLoading}
                  onClick={() => {
                    setPaymentMethod('paypal');
                    handleExecutePayPalPayment('paypal');
                  }}
                  className="w-full py-3.5 px-4 bg-[#FFC439] hover:bg-[#F2BA36] active:bg-[#E2AF32] text-[#003087] font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                >
                  {isLoading && paymentMethod === 'paypal' ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#003087]" />
                  ) : (
                    <>
                      <span className="font-extrabold italic tracking-tight text-base">
                        <span className="text-[#003087]">Pay</span>
                        <span className="text-[#0079C1]">Pal</span>
                      </span>
                      <span className="text-xs font-semibold text-slate-800 font-sans ml-1">
                        Pay ${currentPrice} {currency}
                      </span>
                    </>
                  )}
                </button>

                {/* 2. PayPal Pay in 4 / Pay Later (Navy Brand) */}
                <button
                  id="btn-paypal-paylater"
                  disabled={isLoading}
                  onClick={() => {
                    setPaymentMethod('paylater');
                    handleExecutePayPalPayment('paylater');
                  }}
                  className="w-full py-3 px-4 bg-[#003087] hover:bg-[#00256B] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
                >
                  {isLoading && paymentMethod === 'paylater' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span className="font-extrabold italic text-sm">
                        <span className="text-white">Pay</span>
                        <span className="text-[#0079C1]">Pal</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#0079C1]/40 text-[10px] font-bold">
                        Pay Later (4 × ${(currentPrice / 4).toFixed(2)})
                      </span>
                    </>
                  )}
                </button>

                {/* 3. Debit or Credit Card via PayPal Guest Checkout */}
                <button
                  id="btn-paypal-card"
                  disabled={isLoading}
                  onClick={() => {
                    setPaymentMethod('card');
                    handleExecutePayPalPayment('card');
                  }}
                  className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-xl border border-slate-700 shadow transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
                >
                  {isLoading && paymentMethod === 'card' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-200" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 text-cyan-400" />
                      <span>Debit or Credit Card (Processed by PayPal)</span>
                    </>
                  )}
                </button>
              </div>

              {/* PayPal Trust and Guarantee note */}
              <div className="text-[10px] text-slate-500 text-center font-sans pt-1">
                By completing payment, you agree to the Terms of Service. Manage or cancel your PayPal subscription anytime in Account Settings.
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
