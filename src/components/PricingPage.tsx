import React, { useState } from 'react';
import { 
  Check, Zap, Shield, Sparkles, Building2, Users, Cpu, ArrowRight, 
  HelpCircle, Download, FileText, Lock, Globe, Layers, Award, CreditCard, CheckCircle2,
  X, RefreshCw, ChevronDown, ChevronUp, DollarSign, Gauge, AlertTriangle, ExternalLink, Key
} from 'lucide-react';
import { PlanTier } from '../types';
import { useQuota } from '../hooks/useQuota';
import { PLAN_DEFINITIONS } from '../utils/quotaManager';
import { PayPalCheckoutModal } from './PayPalCheckoutModal';

interface PricingPageProps {
  onOpenQuotaModal?: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onOpenQuotaModal }) => {
  const { quota, limits, changePlan, activatePayPal, reset, fillToLimit } = useQuota();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [isPayPalModalOpen, setIsPayPalModalOpen] = useState<boolean>(false);
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState<PlanTier>('pro');
  const [simulationsPerMonth, setSimulationsPerMonth] = useState<number>(500);
  const [hardwareCostPerTest, setHardwareCostPerTest] = useState<number>(1200);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Pricing calculations
  const isAnnual = billingCycle === 'annual';
  const discountMultiplier = isAnnual ? 0.8 : 1.0;

  const proPrice = Math.round(79 * discountMultiplier);
  const teamPrice = Math.round(399 * discountMultiplier);
  const enterprisePrice = Math.round(100000 * discountMultiplier);

  // Hardware cost savings calculation
  const physicalTestingCost = (simulationsPerMonth * hardwareCostPerTest);
  const virtualSimCost = 399 * 12; // Team annual plan
  const annualSavings = Math.max(0, (physicalTestingCost * 12) - virtualSimCost);

  const handleOpenPayPalCheckout = (tier: PlanTier) => {
    setSelectedTierForCheckout(tier);
    setIsPayPalModalOpen(true);
  };

  const handleSuccessfulPayPalPayment = (data: {
    tier: PlanTier;
    orderId: string;
    payerId?: string;
    licenseKey: string;
    email: string;
    billingCycle: 'monthly' | 'annual';
  }) => {
    activatePayPal({
      tier: data.tier,
      orderId: data.orderId,
      payerId: data.payerId,
      licenseKey: data.licenseKey,
      email: data.email,
      billingCycle: data.billingCycle,
    });
  };

  const handleQuickActivate = (tier: PlanTier) => {
    changePlan(tier);
  };

  const faqs = [
    {
      q: "Can I export telemetry and kinematic trajectories to ROS 2 and NVIDIA Isaac Sim?",
      a: "Yes. Pro, Team, and Enterprise tiers include export pipelines for standard ROS 2 joint trajectory messages (`trajectory_msgs/JointTrajectory`), URDF spatial anchors, and raw CSV/JSON logs compatible with NVIDIA Isaac Sim and Gazebo."
    },
    {
      q: "How does the 5-layer physical AI stack decomposition engine operate?",
      a: "Our engine uses Gemini 3.6 Flash combined with real-time domain physics models to translate natural language real-world goals into an integrated 5-layer execution plan: Multimodality (sensor fusion), World Models (3D spatial rollout), Reasoning (System 2 safety bounds), Agents (sub-goal DAG), and Robotics (1000Hz motor torque closed loops)."
    },
    {
      q: "Can we deploy the platform on-premises for defense or surgical medical compliance?",
      a: "Yes. Enterprise plans support single-tenant VPC deployments or fully air-gapped Docker/Kubernetes containers. All AI reasoning and 3D simulation loops run inside your security perimeter without external telemetry outbound."
    },
    {
      q: "What is the difference between Monthly and Billed Annually?",
      a: "Billed Annually saves 20% on all Pro and Team tier subscriptions, billed as a single annual payment. Enterprise licenses can be paid annually or via custom perpetual CapEx site licenses."
    }
  ];

  return (
    <div className="space-y-12">
      {/* Top Banner Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
          <DollarSign className="w-4 h-4 text-cyan-400" />
          <span>Flexible Enterprise Licensing & API Plans</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-mono">
          Accelerate Physical AI Deployment
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          From surgical robotics to autonomous field rovers—simulate physical dynamics, verify System 2 safety reasoning, and orchestrate motor closed-loops before touching physical hardware.
        </p>

        {/* Monthly vs Annual Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3 font-mono text-xs">
          <span className={`transition-colors ${!isAnnual ? 'text-white font-bold' : 'text-slate-400'}`}>
            Billed Monthly
          </span>

          <button
            id="btn-billing-toggle"
            onClick={() => setBillingCycle(isAnnual ? 'monthly' : 'annual')}
            className="relative w-14 h-7 bg-slate-800 rounded-full p-1 border border-slate-700 transition-colors focus:outline-none"
          >
            <div
              className={`w-5 h-5 rounded-full bg-cyan-400 shadow-md transform transition-transform ${
                isAnnual ? 'translate-x-7 bg-emerald-400' : 'translate-x-0'
              }`}
            />
          </button>

          <div className="flex items-center gap-2">
            <span className={`transition-colors ${isAnnual ? 'text-white font-bold' : 'text-slate-400'}`}>
              Billed Annually
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
              SAVE 20%
            </span>
          </div>
        </div>

        {/* Current Active Plan Status Bar */}
        <div className="mt-4 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300">Your Current Workspace Tier:</span>
            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full font-bold">
              {limits.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">AI Goals Used: <strong>{quota.aiSynthesesUsed} / {limits.aiSynthesesLimit >= 100000 ? 'Unlimited' : limits.aiSynthesesLimit}</strong></span>
            {onOpenQuotaModal && (
              <button
                onClick={onOpenQuotaModal}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <Gauge className="w-3 h-3 text-cyan-400" />
                <span>Inspect Quota Meters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Plan 1: Developer / Free */}
        <div className={`bg-slate-900/80 rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all ${
          quota.plan === 'developer' ? 'border-2 border-emerald-500 shadow-xl shadow-emerald-500/10' : 'border border-slate-800 hover:border-slate-700'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-block px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-mono font-semibold">
                Developer / Free
              </div>
              {quota.plan === 'developer' && (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-[10px] font-bold font-mono">
                  ✓ Active Plan
                </span>
              )}
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white font-mono">£0</div>
              <p className="text-xs text-slate-400 mt-1">Free forever for evaluation & students</p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 font-sans pt-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>5 Custom Goal Decompositions / mo</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>25 Physical Simulation Rollouts / mo</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>3 Code & Script Exports</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Standard Preset Domain Scenarios</span>
              </li>
            </ul>
          </div>

          <button
            id="plan-btn-developer"
            onClick={() => handleQuickActivate('developer')}
            className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
              quota.plan === 'developer'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 cursor-default'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {quota.plan === 'developer' ? '✓ Currently Active' : 'Switch to Free Tier'}
          </button>
        </div>

        {/* Plan 2: Pro Innovator (POPULAR) */}
        <div className={`relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-2xl scale-105 z-10 ${
          quota.plan === 'pro' ? 'border-2 border-cyan-400 shadow-cyan-500/20 ring-2 ring-cyan-500/30' : 'border-2 border-cyan-500/60 shadow-cyan-500/10'
        }`}>
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider shadow-lg">
            {quota.plan === 'pro' ? '★ Current Plan' : '★ Most Popular'}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-block px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded-lg text-xs font-mono font-semibold border border-cyan-500/30">
                Pro Innovator
              </div>
              {quota.plan === 'pro' && (
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-[10px] font-bold font-mono">
                  ✓ Active Plan
                </span>
              )}
            </div>
            <div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-3xl font-extrabold text-white">£{proPrice}</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isAnnual ? 'Billed £756 annually (20% off)' : 'Billed monthly'}
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-200 font-sans pt-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>250 Custom AI Goal Syntheses / mo</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>500 Simulation Rollouts / mo</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>ROS 2 & Isaac Sim Code Exporter</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>1000Hz Motor Torque Telemetry</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Priority Gemini 3.6 Flash Processing</span>
              </li>
            </ul>
          </div>

          <button
            id="plan-btn-pro"
            onClick={() => {
              if (quota.plan === 'pro') return;
              handleOpenPayPalCheckout('pro');
            }}
            className={`w-full py-2.5 rounded-xl text-xs font-mono font-extrabold transition-all shadow-lg flex items-center justify-center gap-1.5 ${
              quota.plan === 'pro'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 cursor-default'
                : 'bg-[#FFC439] hover:bg-[#F2BA36] active:bg-[#E2AF32] text-[#003087] shadow-[#FFC439]/20'
            }`}
          >
            {quota.plan === 'pro' ? (
              '✓ Currently Active'
            ) : (
              <>
                <span className="font-extrabold italic"><span className="text-[#003087]">Pay</span><span className="text-[#0079C1]">Pal</span></span>
                <span className="font-sans font-bold text-slate-900 ml-1">Subscribe to Pro</span>
              </>
            )}
          </button>
        </div>

        {/* Plan 3: Team / Studio */}
        <div className={`bg-slate-900/80 rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all ${
          quota.plan === 'team' ? 'border-2 border-indigo-500 shadow-xl shadow-indigo-500/10' : 'border border-slate-800 hover:border-slate-700'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-lg text-xs font-mono font-semibold border border-indigo-500/30">
                Team / Studio
              </div>
              {quota.plan === 'team' && (
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full text-[10px] font-bold font-mono">
                  ✓ Active Plan
                </span>
              )}
            </div>
            <div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-3xl font-extrabold text-white">£{teamPrice}</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isAnnual ? 'Billed £3,828 annually (20% off)' : 'Billed monthly'}
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 font-sans pt-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>2,000 Custom AI Syntheses / mo</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>10 Team Member Workspace Seats</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Unlimited ROS 2 & Isaac Sim Exports</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Synthetic Sensor Dataset Generator</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Shared Scenario & Asset Library</span>
              </li>
            </ul>
          </div>

          <button
            id="plan-btn-team"
            onClick={() => {
              if (quota.plan === 'team') return;
              handleOpenPayPalCheckout('team');
            }}
            className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
              quota.plan === 'team'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 cursor-default'
                : 'bg-[#FFC439] hover:bg-[#F2BA36] active:bg-[#E2AF32] text-[#003087] shadow-lg'
            }`}
          >
            {quota.plan === 'team' ? (
              '✓ Currently Active'
            ) : (
              <>
                <span className="font-extrabold italic"><span className="text-[#003087]">Pay</span><span className="text-[#0079C1]">Pal</span></span>
                <span className="font-sans font-bold text-slate-900 ml-1">Subscribe to Team</span>
              </>
            )}
          </button>
        </div>

        {/* Plan 4: Enterprise AI & Safety */}
        <div className={`bg-slate-900/80 rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all ${
          quota.plan === 'enterprise' ? 'border-2 border-amber-500 shadow-xl shadow-amber-500/10' : 'border border-slate-800 hover:border-slate-700'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-block px-3 py-1 bg-amber-500/10 text-amber-300 rounded-lg text-xs font-mono font-semibold border border-amber-500/30">
                Enterprise & Safety
              </div>
              {quota.plan === 'enterprise' && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[10px] font-bold font-mono">
                  ✓ Active Plan
                </span>
              )}
            </div>
            <div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-3xl font-extrabold text-white">£{enterprisePrice.toLocaleString()}</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isAnnual ? 'Billed £960,000 annually (20% off)' : 'Billed £100,000 monthly or CapEx'}
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 font-sans pt-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Unlimited Custom AI Goal Pipeline</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>On-Premise Air-Gapped VPC Container</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>ISO 10218 & FDA Safety Compliance Audit</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Custom CAD Hardware Digital Twins</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Dedicated Enterprise SLA & 24/7 Engineers</span>
              </li>
            </ul>
          </div>

          <button
            id="plan-btn-enterprise"
            onClick={() => {
              if (quota.plan === 'enterprise') return;
              handleOpenPayPalCheckout('enterprise');
            }}
            className={`w-full py-2.5 rounded-xl text-xs font-mono font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              quota.plan === 'enterprise'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 cursor-default'
                : 'bg-[#FFC439] hover:bg-[#F2BA36] active:bg-[#E2AF32] text-[#003087] shadow-lg'
            }`}
          >
            {quota.plan === 'enterprise' ? (
              '✓ Currently Active'
            ) : (
              <>
                <span className="font-extrabold italic"><span className="text-[#003087]">Pay</span><span className="text-[#0079C1]">Pal</span></span>
                <span className="font-sans font-bold text-slate-900 ml-1">Activate Enterprise</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* PayPal Trust & Active Subscription Card */}
      {quota.isPayPalActive && (
        <div className="p-6 bg-gradient-to-r from-[#003087]/20 via-slate-900 to-[#0079C1]/20 border border-[#0079C1]/40 rounded-3xl space-y-4 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#003087]/40 border border-[#0079C1]/50 flex items-center justify-center font-bold text-xl shadow-md">
                <span className="text-[#0079C1] font-black italic">P</span>
                <span className="text-white font-black italic -ml-1 text-sm">P</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Active PayPal Subscription</h4>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-bold">
                    PayPal Verified
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans">
                  Billing cycle: {quota.billingCycle || 'monthly'} • Buyer Protection Active
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>License: <strong className="text-cyan-300 font-bold">{quota.licenseKey || 'PAYPAL-AIGEN-PRO-ACTIVE'}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-800/80">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] block">PayPal Order ID</span>
              <span className="text-cyan-300 font-semibold">{quota.paypalOrderId || 'pp_live_0981a'}</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Customer Email</span>
              <span className="text-slate-200 font-semibold">{quota.customerEmail || 'engineer@company.com'}</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Current Plan Tier</span>
              <span className="text-emerald-300 font-semibold uppercase">{quota.plan}</span>
            </div>
          </div>
        </div>
      )}

      {/* PayPal Payment Gateway Trust Footer */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3 text-slate-300">
          <span className="font-extrabold italic text-base">
            <span className="text-[#0079C1]">Pay</span><span className="text-[#00457C]">Pal</span>
          </span>
          <span>Payments securely processed with <strong>PayPal Buyer Protection</strong> & Card Checkout.</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit SSL Encryption</span>
          </span>
          <span className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>200+ Countries & Currencies</span>
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant API Key Provisioning</span>
          </span>
        </div>
      </div>

      {/* ROI & Cost Savings Calculator Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Interactive ROI Calculator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-mono">
              Hardware Risk Reduction & Testing Cost Calculator
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Estimate annual savings by catching kinematic collisions and System 2 safety failures virtually before physical prototype testing.
            </p>
          </div>

          <div className="bg-slate-950 border border-emerald-500/30 p-4 rounded-2xl text-right font-mono">
            <span className="text-[10px] text-slate-400 block uppercase">Estimated Annual Cost Savings</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              £{annualSavings.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <label className="text-slate-300 font-semibold">Monthly Virtual Physical Simulations:</label>
              <span className="text-cyan-400 font-bold text-sm">{simulationsPerMonth} runs/mo</span>
            </div>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={simulationsPerMonth}
              onChange={(e) => setSimulationsPerMonth(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Number of physical goal scenarios and trajectory rollouts executed per month.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <label className="text-slate-300 font-semibold">Avg. Cost Per Physical Rig Test:</label>
              <span className="text-emerald-400 font-bold text-sm">£{hardwareCostPerTest} / test</span>
            </div>
            <input
              type="range"
              min="200"
              max="10000"
              step="100"
              value={hardwareCostPerTest}
              onChange={(e) => setHardwareCostPerTest(Number(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Cost of technician hours, hardware wear-and-tear, and physical test bench resets.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Feature Comparison Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>Full Feature & Infrastructure Matrix</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-semibold">Capability / Layer</th>
                <th className="py-3 px-4 text-center">Developer</th>
                <th className="py-3 px-4 text-center text-cyan-400">Pro Innovator</th>
                <th className="py-3 px-4 text-center text-indigo-400">Team / Studio</th>
                <th className="py-3 px-4 text-center text-amber-400">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Gemini 3.6 Flash Custom Goal Synthesizer</td>
                <td className="py-3.5 px-4 text-center text-slate-400">5 / mo</td>
                <td className="py-3.5 px-4 text-center font-bold text-cyan-300">250 / mo</td>
                <td className="py-3.5 px-4 text-center font-bold text-indigo-300">2,000 / mo</td>
                <td className="py-3.5 px-4 text-center font-bold text-amber-300">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">3D WebGL Real-Time Physical Simulator</td>
                <td className="py-3.5 px-4 text-center">✓</td>
                <td className="py-3.5 px-4 text-center text-cyan-400">✓</td>
                <td className="py-3.5 px-4 text-center text-indigo-400">✓</td>
                <td className="py-3.5 px-4 text-center text-amber-400">✓</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">ROS 2 JointTrajectory & URDF Exporter</td>
                <td className="py-3.5 px-4 text-center text-slate-600">✕</td>
                <td className="py-3.5 px-4 text-center text-cyan-400">✓</td>
                <td className="py-3.5 px-4 text-center text-indigo-400">✓</td>
                <td className="py-3.5 px-4 text-center text-amber-400">✓</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">1000Hz Actuator Kinematics & Torque Logs</td>
                <td className="py-3.5 px-4 text-center text-slate-600">✕</td>
                <td className="py-3.5 px-4 text-center text-cyan-400">✓</td>
                <td className="py-3.5 px-4 text-center text-indigo-400">✓</td>
                <td className="py-3.5 px-4 text-center text-amber-400">✓</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Synthetic Sensor Dataset Generator</td>
                <td className="py-3.5 px-4 text-center text-slate-600">✕</td>
                <td className="py-3.5 px-4 text-center text-slate-600">✕</td>
                <td className="py-3.5 px-4 text-center text-indigo-400">✓</td>
                <td className="py-3.5 px-4 text-center text-amber-400">✓</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">ISO 10218 / FDA Safety Audit Exporter</td>
                <td className="py-3.5 px-4 text-center text-slate-600">✕</td>
                <td className="py-3.5 px-4 text-center text-slate-600">✕</td>
                <td className="py-3.5 px-4 text-center text-slate-600">✕</td>
                <td className="py-3.5 px-4 text-center text-amber-400">✓</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Single-Tenant Air-Gapped Deployment</td>
                <td className="py-3.5 px-4 text-center text-slate-600">✕</td>
                <td className="py-3.5 px-4 text-center text-slate-600">✕</td>
                <td className="py-3.5 px-4 text-center text-slate-600">✕</td>
                <td className="py-3.5 px-4 text-center text-amber-400">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="space-y-3 font-sans">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-mono text-xs font-semibold text-white hover:text-cyan-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>

                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-900/80">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PayPal Official Checkout Modal */}
      <PayPalCheckoutModal
        isOpen={isPayPalModalOpen}
        onClose={() => setIsPayPalModalOpen(false)}
        tier={selectedTierForCheckout}
        billingCycle={billingCycle}
        onSuccessfulPayment={handleSuccessfulPayPalPayment}
      />
    </div>
  );
};

