import React, { useState } from 'react';
import {
  Check, Zap, Shield, Sparkles, ArrowRight, HelpCircle, Globe, Layers, Award,
  CheckCircle2, ChevronDown, ChevronUp, DollarSign, Gauge, Key, ShieldCheck, FileText
} from 'lucide-react';
import { PlanTier, ActiveTab } from '../types';
import { useQuota } from '../hooks/useQuota';
import { PayPalCheckoutModal } from './PayPalCheckoutModal';
import { EnterpriseFeaturesSection } from './EnterpriseFeaturesSection';

interface PricingPageProps {
  onOpenQuotaModal?: () => void;
  onOpenProTrialModal?: () => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  onOpenQuotaModal,
  onOpenProTrialModal,
  onNavigateTab
}) => {
  const { quota, limits, changePlan, activatePayPal, startTrial } = useQuota();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [isPayPalModalOpen, setIsPayPalModalOpen] = useState<boolean>(false);
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState<PlanTier>('pro');
  const [consultantRetainerGbp, setConsultantRetainerGbp] = useState<number>(220000);
  const [auditWeeksSaved, setAuditWeeksSaved] = useState<number>(18);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Unified Single-Service Regulatory Pricing
  const isAnnual = billingCycle === 'annual';
  const proMonthlyDisplay = isAnnual ? 399 : 499;
  const teamMonthlyDisplay = isAnnual ? 1199 : 1499;
  const enterpriseMonthlyDisplay = isAnnual ? 3999 : 4999;

  // Regulatory Cost & Consultant Fee Savings Calculator
  const engineeringLaborSaved = auditWeeksSaved * 40 * 120; // £120/hr loaded QA/robotics rate
  const annualProLicenseCost = 399 * 12;
  const annualSavings = Math.max(0, consultantRetainerGbp + engineeringLaborSaved - annualProLicenseCost);

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
      q: "What is included in a single AIGENESIS.SAFETY Regulatory Dossier license?",
      a: "Every paid license covers the full Automated Regulatory & Safety Dossier Engine: URDF/YAML clause-by-clause gap analysis, interactive ISO 14971 FMEA risk matrices, bi-directional Requirements Traceability Matrices (RTM), CI/CD GitHub/GitLab Safety Gatekeeper workflows, and unwatermarked PDF/HTML, Markdown, and signed JSON Design History Files."
    },
    {
      q: "Which international robotics & medical regulatory standards are supported?",
      a: "Out of the box, the engine compiles audit-ready dossiers for ISO 10218-1/2 & ISO/TS 15066 (Collaborative Cobots), ISO 3691-4 & ANSI/RIA R15.08 (Warehouse AMRs), FDA 21 CFR Part 820.30 / ISO 13485 / IEC 62304 Class C (Surgical Robotics), and STANAG 4586 / MIL-STD-810H (Defense Autonomy)."
    },
    {
      q: "Can we buy a single regulatory dossier pack or pay by Corporate PO instead of PayPal?",
      a: "Yes. You can subscribe directly via PayPal or Corporate Card below, start a 14-day free trial with no card required, or open the Commercial & SOW Store to pay via Net-30 Corporate Purchase Order (PO) / wire transfer for single pre-submission audit packs or Sovereign SCIF annual contracts."
    },
    {
      q: "Can we deploy air-gapped so proprietary CAD and firmware never leave our network?",
      a: "Yes. The Sovereign Enterprise tier provides self-contained Docker/Kubernetes SCIF containers with zero outbound telemetry egress. All URDFs, control laws, and Z3 safety proofs stay 100% inside your corporate firewall."
    }
  ];

  return (
    <div className="space-y-12">
      {/* Top Banner Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Single-Service Licensing • Automated Regulatory &amp; Safety Dossier Engine</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-mono">
          Simple Licensing for Audit-Ready Robotics Dossiers
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          One focused platform: turn your URDF/ROS 2 codebase into mathematically verified ISO 10218, ISO 3691-4, and FDA 21 CFR 820 compliance dossiers backed by Z3 formal proofs.
        </p>

        {/* Monthly vs Annual Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3 font-mono text-xs">
          <span className={`transition-colors ${!isAnnual ? 'text-white font-bold' : 'text-slate-400'}`}>
            Billed Monthly
          </span>

          <button
            id="btn-billing-toggle"
            onClick={() => setBillingCycle(isAnnual ? 'monthly' : 'annual')}
            className="relative w-14 h-7 bg-slate-800 rounded-full p-1 border border-slate-700 transition-colors focus:outline-none cursor-pointer"
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

        {/* 14-Day Free Dossier Pro Trial Banner */}
        <div className="mt-4 p-5 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/40 rounded-3xl shadow-xl shadow-cyan-500/5 flex flex-col md:flex-row items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/15 border border-cyan-500/30 rounded-2xl shrink-0">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                  No Credit Card Required
                </span>
                <span className="text-xs font-mono text-cyan-300 font-bold">Instant QA Evaluation</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white font-mono mt-1">
                Evaluate Dossier Pro Free for 14 Days
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Let your Quality &amp; Robotics engineers run live URDF gap audits, FMEA risk matrices, and unwatermarked DHF exports before procurement.
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            {quota.isTrialActive ? (
              <div className="px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs font-mono text-emerald-300 font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Trial Active: {quota.trialDaysRemaining ?? 14} Days Left</span>
              </div>
            ) : quota.plan === 'developer' ? (
              <button
                onClick={() => {
                  if (onOpenProTrialModal) {
                    onOpenProTrialModal();
                  } else {
                    startTrial();
                  }
                }}
                className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-mono font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Start 14-Day Free Trial</span>
              </button>
            ) : (
              <div className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-slate-300 flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>Paid Dossier License Active</span>
              </div>
            )}
          </div>
        </div>

        {/* One-Off Filing / Corporate PO Banner */}
        {onNavigateTab && (
          <div className="mt-4 p-5 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/40 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl shrink-0">
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                    Corporate PO &amp; Single-Filing Packs
                  </span>
                  <span className="text-xs font-mono text-emerald-300 font-bold">Net-30 Wire / Invoice</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white font-mono mt-1">
                  Prefer a One-Off Regulatory Audit Pack or Pilot SOW via Purchase Order?
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Generate a formal CFO ROI memo, 1-click MNDA, £3,999–£7,999 single-submission dossier packs, or Net-30 corporate PO invoices.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('commercial')}
              className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-mono font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] shrink-0"
            >
              <span>Open PO &amp; SOW Desk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Current Active Plan Status Bar */}
        <div className="mt-4 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300">Active Compliance License:</span>
            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full font-bold">
              {limits.name} {quota.isTrialActive ? `(14-Day Trial: ${quota.trialDaysRemaining ?? 14}d left)` : ''}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              Formal Audits Used: <strong>{quota.aiSynthesesUsed} / {limits.aiSynthesesLimit >= 100000 ? 'Unlimited' : limits.aiSynthesesLimit}</strong>
            </span>
            {onOpenQuotaModal && (
              <button
                onClick={onOpenQuotaModal}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
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
        {/* Plan 1: Evaluation Sandbox (Free) */}
        <div className={`bg-slate-900/80 rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all ${
          quota.plan === 'developer' ? 'border-2 border-emerald-500 shadow-xl shadow-emerald-500/10' : 'border border-slate-800 hover:border-slate-700'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-block px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-mono font-semibold">
                Evaluation Sandbox
              </div>
              {quota.plan === 'developer' && (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-[10px] font-bold font-mono">
                  ✓ Active
                </span>
              )}
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white font-mono">£0</div>
              <p className="text-xs text-slate-400 mt-1">Free forever for interactive audit testing</p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 font-sans pt-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>URDF / ROS 2 Clause Gap Analyzer</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Interactive ISO 14971 FMEA Matrix</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Watermarked Draft Dossier Previews</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>5 Z3 SMT Verification Audits / mo</span>
              </li>
            </ul>
          </div>

          <button
            id="plan-btn-developer"
            onClick={() => handleQuickActivate('developer')}
            className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              quota.plan === 'developer'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 cursor-default'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {quota.plan === 'developer' ? '✓ Currently Active' : 'Switch to Sandbox'}
          </button>
        </div>

        {/* Plan 2: Dossier Pro (POPULAR) */}
        <div className={`relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-2xl scale-105 z-10 ${
          quota.plan === 'pro' ? 'border-2 border-cyan-400 shadow-cyan-500/20 ring-2 ring-cyan-500/30' : 'border-2 border-cyan-500/60 shadow-cyan-500/10'
        }`}>
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider shadow-lg whitespace-nowrap">
            {quota.plan === 'pro' ? '★ Current License' : '★ Single Robot Program'}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-block px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded-lg text-xs font-mono font-semibold border border-cyan-500/30">
                Dossier Pro
              </div>
              {quota.plan === 'pro' && (
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-[10px] font-bold font-mono">
                  ✓ Active
                </span>
              )}
            </div>
            <div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-3xl font-extrabold text-white">£{proMonthlyDisplay}</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isAnnual ? 'Billed £4,788 annually (20% off)' : 'Billed monthly • 1 Robot Line'}
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-200 font-sans pt-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>250 Formal Z3 Clause Audits / mo</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Unwatermarked ISO &amp; FDA DHF Exports</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Print-Ready HTML/PDF, MD &amp; JSON Binders</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Bi-Directional RTM with SHA-256 Digest</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>GitHub &amp; GitLab CI Safety Gatekeeper</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            {quota.isTrialActive ? (
              <div className="space-y-2">
                <div className="w-full py-2 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs font-mono text-emerald-300 font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pro Trial Active ({quota.trialDaysRemaining ?? 14}d Left)</span>
                </div>
                <button
                  id="plan-btn-pro-convert"
                  onClick={() => handleOpenPayPalCheckout('pro')}
                  className="w-full py-2 bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-bold text-xs font-mono rounded-xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="font-extrabold italic"><span className="text-[#003087]">Pay</span><span className="text-[#0079C1]">Pal</span></span>
                  <span className="font-sans font-bold text-slate-900 ml-1">Activate Pro (£{proMonthlyDisplay}/mo)</span>
                </button>
              </div>
            ) : quota.plan === 'developer' ? (
              <div className="space-y-2">
                <button
                  id="plan-btn-pro-trial"
                  onClick={() => {
                    if (onOpenProTrialModal) {
                      onOpenProTrialModal();
                    } else {
                      startTrial();
                    }
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-mono font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02]"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Start 14-Day Free Trial</span>
                </button>
                <div className="text-[10px] text-center text-slate-400 font-mono">
                  No credit card required • Instant access
                </div>
                <button
                  id="plan-btn-pro-direct"
                  onClick={() => handleOpenPayPalCheckout('pro')}
                  className="w-full py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-[11px] font-mono transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Or Pay via PayPal (£{proMonthlyDisplay}/mo)</span>
                </button>
              </div>
            ) : (
              <button
                id="plan-btn-pro"
                disabled
                className="w-full py-2.5 rounded-xl text-xs font-mono font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 cursor-default flex items-center justify-center gap-1.5"
              >
                <span>✓ Currently Active</span>
              </button>
            )}
          </div>
        </div>

        {/* Plan 3: QA Team Studio */}
        <div className={`bg-slate-900/80 rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all ${
          quota.plan === 'team' ? 'border-2 border-indigo-500 shadow-xl shadow-indigo-500/10' : 'border border-slate-800 hover:border-slate-700'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-lg text-xs font-mono font-semibold border border-indigo-500/30">
                QA Team Studio
              </div>
              {quota.plan === 'team' && (
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full text-[10px] font-bold font-mono">
                  ✓ Active
                </span>
              )}
            </div>
            <div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-3xl font-extrabold text-white">£{teamMonthlyDisplay.toLocaleString()}</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isAnnual ? 'Billed £14,388 annually (20% off)' : 'Billed monthly • Up to 10 QA Seats'}
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 font-sans pt-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>2,000 Formal Z3 Safety Audits / mo</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>10 Quality &amp; Robotics Engineering Seats</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Unlimited Product Lines &amp; Revisions</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Multi-Repo CI/CD PR Merge Blocking</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Shared FMEA Hazard &amp; RTM Library</span>
              </li>
            </ul>
          </div>

          <button
            id="plan-btn-team"
            onClick={() => {
              if (quota.plan === 'team') return;
              handleOpenPayPalCheckout('team');
            }}
            className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                <span className="font-sans font-bold text-slate-900 ml-1">Subscribe to QA Team</span>
              </>
            )}
          </button>
        </div>

        {/* Plan 4: Sovereign Enterprise */}
        <div className={`bg-slate-900/80 rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all ${
          quota.plan === 'enterprise' ? 'border-2 border-amber-500 shadow-xl shadow-amber-500/10' : 'border border-slate-800 hover:border-slate-700'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-block px-3 py-1 bg-amber-500/10 text-amber-300 rounded-lg text-xs font-mono font-semibold border border-amber-500/30">
                Sovereign Enterprise
              </div>
              {quota.plan === 'enterprise' && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[10px] font-bold font-mono">
                  ✓ Active
                </span>
              )}
            </div>
            <div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-3xl font-extrabold text-white">£{enterpriseMonthlyDisplay.toLocaleString()}</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isAnnual ? 'Billed £47,988 annually (or Net-30 PO)' : 'Billed monthly or Corporate PO'}
              </p>
            </div>

            <ul className="space-y-2 text-xs text-slate-300 font-sans pt-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Unlimited Formal Audits &amp; 100 Seats</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Air-Gapped SCIF / On-Prem Kubernetes</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Hardware Enclave Notified-Body Seals</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>1 kHz Calibrated Dyno Residual Proofs</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Custom FDA 510(k) / CE / STANAG Templates</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Named Safety Compliance Architect SLA</span>
              </li>
            </ul>
          </div>

          <button
            id="plan-btn-enterprise"
            onClick={() => {
              if (quota.plan === 'enterprise') return;
              handleOpenPayPalCheckout('enterprise');
            }}
            className={`w-full py-2.5 rounded-xl text-xs font-mono font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                <span className="font-sans font-bold text-slate-900 ml-1">Activate Sovereign</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* PayPal Active Subscription Card */}
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
                  <h4 className="text-sm font-bold text-white">Active PayPal Compliance License</h4>
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
              <span>License: <strong className="text-cyan-300 font-bold">{quota.licenseKey || 'PAYPAL-AIGEN-DOSSIER-ACTIVE'}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-800/80">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] block">PayPal Order ID</span>
              <span className="text-cyan-300 font-semibold">{quota.paypalOrderId || 'pp_live_0981a'}</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Customer Email</span>
              <span className="text-slate-200 font-semibold">{quota.customerEmail || 'qa@robotics-oem.com'}</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Current License Tier</span>
              <span className="text-emerald-300 font-semibold uppercase">{limits.name}</span>
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
          <span>Payments securely processed with <strong>PayPal Buyer Protection</strong>, Card Checkout &amp; Corporate POs.</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit SSL Encryption</span>
          </span>
          <span className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>GBP / USD / EUR Supported</span>
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Dossier License Key</span>
          </span>
        </div>
      </div>

      {/* Regulatory ROI & Consultant Cost Savings Calculator */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Regulatory Certification ROI Calculator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-mono">
              External Consultant Fee &amp; Audit Timeline Savings
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Compare manual regulatory consulting retainers and 9-month paperwork cycles against automated Dossier synthesis.
            </p>
          </div>

          <div className="bg-slate-950 border border-emerald-500/30 p-4 rounded-2xl text-right font-mono">
            <span className="text-[10px] text-slate-400 block uppercase">Net Annual Certification Savings</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              £{annualSavings.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <label className="text-slate-300 font-semibold">External Safety Consultant Retainer Replaced:</label>
              <span className="text-cyan-400 font-bold text-sm">£{consultantRetainerGbp.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="50000"
              max="450000"
              step="10000"
              value={consultantRetainerGbp}
              onChange={(e) => setConsultantRetainerGbp(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Typical third-party fees for ISO 10218, ISO 3691-4, or FDA 510(k) DHF documentation &amp; gap audits.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <label className="text-slate-300 font-semibold">Internal QA &amp; Engineering Weeks Saved:</label>
              <span className="text-emerald-400 font-bold text-sm">{auditWeeksSaved} weeks/yr</span>
            </div>
            <input
              type="range"
              min="4"
              max="36"
              step="2"
              value={auditWeeksSaved}
              onChange={(e) => setAuditWeeksSaved(Number(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Engineering hours reclaimed by automated FMEA updates, RTM linking, and CI/CD Pull Request checks.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Feature Comparison Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>Regulatory Dossier Engine Capability Matrix</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-semibold">Compliance Capability</th>
                <th className="py-3 px-4 text-center">Sandbox</th>
                <th className="py-3 px-4 text-center text-cyan-400">Dossier Pro</th>
                <th className="py-3 px-4 text-center text-indigo-400">QA Team Studio</th>
                <th className="py-3 px-4 text-center text-amber-400">Sovereign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Formal Z3 Clause Gap Audits</td>
                <td className="py-3.5 px-4 text-center text-slate-400">5 / mo</td>
                <td className="py-3.5 px-4 text-center font-bold text-cyan-300">250 / mo</td>
                <td className="py-3.5 px-4 text-center font-bold text-indigo-300">2,000 / mo</td>
                <td className="py-3.5 px-4 text-center font-bold text-amber-300">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">ROS 2 YAML / URDF Safety Ingestion</td>
                <td className="py-3.5 px-4 text-center">✓</td>
                <td className="py-3.5 px-4 text-center text-cyan-400">✓</td>
                <td className="py-3.5 px-4 text-center text-indigo-400">✓</td>
                <td className="py-3.5 px-4 text-center text-amber-400">✓</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Interactive ISO 14971 FMEA Matrix</td>
                <td className="py-3.5 px-4 text-center">✓</td>
                <td className="py-3.5 px-4 text-center text-cyan-400">✓</td>
                <td className="py-3.5 px-4 text-center text-indigo-400">✓</td>
                <td className="py-3.5 px-4 text-center text-amber-400">✓</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Unwatermarked Printable PDF/HTML, MD &amp; JSON Dossiers</td>
                <td className="py-3.5 px-4 text-center text-slate-600">Draft Only</td>
                <td className="py-3.5 px-4 text-center text-cyan-400">✓</td>
                <td className="py-3.5 px-4 text-center text-indigo-400">✓</td>
                <td className="py-3.5 px-4 text-center text-amber-400">✓</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Bi-Directional RTM &amp; CI/CD Git Gatekeeper</td>
                <td className="py-3.5 px-4 text-center text-slate-600">Simulator</td>
                <td className="py-3.5 px-4 text-center text-cyan-400">✓ (1 Repo)</td>
                <td className="py-3.5 px-4 text-center text-indigo-400">✓ (Multi-Repo)</td>
                <td className="py-3.5 px-4 text-center text-amber-400">✓ (Org-Wide)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Air-Gapped SCIF Enclave &amp; Notified-Body Seal</td>
                <td className="py-3.5 px-4 text-center text-slate-600">✕</td>
                <td className="py-3.5 px-4 text-center text-slate-600">✕</td>
                <td className="py-3.5 px-4 text-center text-slate-600">✕</td>
                <td className="py-3.5 px-4 text-center text-amber-400 font-bold">✓ (Zero Egress)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Enterprise Capabilities Deep-Dive */}
      <EnterpriseFeaturesSection />

      {/* Frequently Asked Questions (FAQ) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          <span>Licensing &amp; Payment FAQs</span>
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
                  className="w-full flex items-center justify-between p-4 text-left font-mono text-xs font-semibold text-white hover:text-cyan-300 transition-colors cursor-pointer"
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
