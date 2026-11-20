import React, { useState, useMemo } from 'react';
import {
  Shield, FileText, Download, CheckCircle2,
  Award, ArrowRight, Check, Lock, Building2,
  FileCode, ShieldCheck, TrendingUp, Calculator,
  Briefcase, Scale, CreditCard, FileSpreadsheet,
  Sparkles, Key, Mail
} from 'lucide-react';
import { ActiveTab, PlanTier } from '../../types';
import { useQuota } from '../../hooks/useQuota';
import { PayPalCheckoutModal } from '../PayPalCheckoutModal';
import { OutreachMailerPanel } from './OutreachMailerPanel';

export type CommercialTab =
  | 'regulatory-audit'
  | 'boardroom-pitch'
  | 'pilot-sow'
  | 'trust-center'
  | 'enterprise-programs'
  | 'outreach-mailer';

interface EnterpriseMonetizationHubProps {
  initialTab?: CommercialTab;
  onNavigateTab?: (tab: ActiveTab) => void;
  onOpenPricing?: () => void;
}

interface TurnkeyPack {
  id: string;
  title: string;
  standardCode: string;
  priceNum: number;
  priceFormatted: string;
  turnaround: string;
  desc: string;
  standards: string[];
  deliverables: string[];
}

const TURNKEY_DOSSIER_PACKS: TurnkeyPack[] = [
  {
    id: 'iso-cobot',
    title: 'ISO 10218-1/2 Industrial Cobot Pack',
    standardCode: 'ISO 10218 & ISO/TS 15066',
    priceNum: 3499,
    priceFormatted: '£3,499',
    turnaround: '48 Hours',
    desc: 'Pre-submission power & force limiting (PFL) biomechanical dossier, joint torque barrier proofs, and CE Machinery Directive annex.',
    standards: ['ISO 10218-1/2', 'ISO/TS 15066', 'CE Machinery 2006/42/EC'],
    deliverables: [
      'Z3 Control Barrier Proof Ledger (Torques & Separation Distances)',
      'ISO 14971 / ISO 12100 Hazard & FMEA Risk Matrix',
      'Bi-Directional Requirements Traceability Matrix (RTM)',
      'SHA-256 Signed Audit Readiness Dossier (.html/.md/.json)'
    ]
  },
  {
    id: 'iso-amr',
    title: 'ISO 3691-4 Autonomous AMR Safety Pack',
    standardCode: 'ISO 3691-4 & ANSI/RIA R15.08',
    priceNum: 3999,
    priceFormatted: '£3,999',
    turnaround: '48 Hours',
    desc: 'Braking distance formal bounds, LiDAR occlusion zone verification, and VDA 5050 emergency-stop safety file for notified-body sign-off.',
    standards: ['ISO 3691-4', 'ANSI/RIA R15.08', 'EN 1525'],
    deliverables: [
      'Emergency Deceleration & Stopping Distance Proof Bounds',
      'Dynamic Personnel Occlusion FMEA & Mitigation Ledger',
      '1 kHz Safety Twin Verification Telemetry Manifest',
      'Cryptographically Sealed Notified-Body Submission Binder'
    ]
  },
  {
    id: 'stanag-defense',
    title: 'STANAG 4586 Defense UAV/UGV Pack',
    standardCode: 'STANAG 4586 & MIL-STD-810H',
    priceNum: 6999,
    priceFormatted: '£6,999',
    turnaround: '72 Hours',
    desc: 'NATO interoperability control assurance, GPS-denied geofence containment proofs, and DEF-STAN 00-56 safety case evidence.',
    standards: ['STANAG 4586', 'MIL-STD-810H', 'DEF-STAN 00-56'],
    deliverables: [
      'Deterministic Geofence & Payload Interlock Z3 Proofs',
      'RF / GNSS Spoofing & Lost-Link FMEA Risk Register',
      'Air-Gapped CI/CD Gatekeeper Evidence Artifacts',
      'SHA-256 Sovereign Compliance Certificate'
    ]
  },
  {
    id: 'fda-surgical',
    title: 'FDA 21 CFR Part 820 Surgical DHF Pack',
    standardCode: 'FDA 21 CFR 820 & ISO 13485',
    priceNum: 7999,
    priceFormatted: '£7,999',
    turnaround: '72 Hours',
    desc: 'Turnkey 510(k) / De Novo software & electromechanical Design History File (DHF) with IEC 62304 Class C traceability.',
    standards: ['FDA 21 CFR 820.30', 'ISO 13485', 'IEC 62304 Class C'],
    deliverables: [
      'Complete 21 CFR 820.30 Design Verification & Validation Binder',
      'ISO 14971 Medical Device FMEA (Pre/Post RPN Residual Risk)',
      'Bi-Directional RTM Mapped to Patient Force & Thermal Bounds',
      '21 CFR Part 11 Cryptographic Audit Signature Manifest'
    ]
  }
];

export const EnterpriseMonetizationHub: React.FC<EnterpriseMonetizationHubProps> = ({
  initialTab = 'regulatory-audit',
  onNavigateTab,
  onOpenPricing
}) => {
  const [activeTab, setActiveTab] = useState<CommercialTab>(initialTab);
  const { quota, changePlan } = useQuota();

  // PayPal modal state for subscription upgrades directly from Commercial Desk
  const [checkoutState, setCheckoutState] = useState<{
    isOpen: boolean;
    tier: PlanTier;
    billingCycle: 'monthly' | 'annual';
  }>({
    isOpen: false,
    tier: 'pro',
    billingCycle: 'annual'
  });
  const [activatedLicenseMessage, setActivatedLicenseMessage] = useState<string | null>(null);

  const downloadFile = (content: string, filename: string, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // 1. Turnkey Single-Submission Dossier Packs
  // ==========================================
  const [selectedPackId, setSelectedPackId] = useState<string>('iso-amr');
  const [orderedPackPoIds, setOrderedPackPoIds] = useState<string[]>([]);
  const selectedPack = TURNKEY_DOSSIER_PACKS.find(p => p.id === selectedPackId) || TURNKEY_DOSSIER_PACKS[1];

  // ==========================================
  // 2. CFO Compliance ROI State
  // ==========================================
  const [filingsPerYear, setFilingsPerYear] = useState<number>(3);
  const [consultantRetainerPerFiling, setConsultantRetainerPerFiling] = useState<number>(35000);
  const [qaEngineersCount, setQaEngineersCount] = useState<number>(6);
  const [auditWeeksSavedPerFiling, setAuditWeeksSavedPerFiling] = useState<number>(10);
  const [selectedLicenseForRoi, setSelectedLicenseForRoi] = useState<'team' | 'enterprise'>('team');
  const [copiedCfoMemo, setCopiedCfoMemo] = useState<boolean>(false);

  const consultantSavings = filingsPerYear * consultantRetainerPerFiling;
  const qaLaborSavings = filingsPerYear * auditWeeksSavedPerFiling * 40 * 115; // £115/hr loaded safety QA rate
  const delayAvoidanceBenefit = filingsPerYear * 22000; // avoided notified-body non-conformance re-submission delay
  const totalComplianceBenefit = consultantSavings + qaLaborSavings + delayAvoidanceBenefit;
  const annualLicenseInvestment = selectedLicenseForRoi === 'enterprise' ? 47988 : 14388;
  const netComplianceSavings = totalComplianceBenefit - annualLicenseInvestment;
  const complianceRoiMultiplier = (totalComplianceBenefit / annualLicenseInvestment).toFixed(1);
  const paybackMonths = Math.max(0.4, (annualLicenseInvestment / totalComplianceBenefit) * 12).toFixed(1);

  // ==========================================
  // 3. Regulatory Pilot SOW State
  // ==========================================
  const [clientCompany, setClientCompany] = useState<string>('Vanguard Robotics UK Ltd');
  const [robotPlatformsCount, setRobotPlatformsCount] = useState<number>(3);
  const [targetStandard, setTargetStandard] = useState<string>('ISO 10218 & ISO/TS 15066 (Industrial Cobot)');
  const [ciProvider, setCiProvider] = useState<string>('GitHub Actions Gatekeeper');
  const [pilotScope, setPilotScope] = useState<'single-line' | 'multi-line'>('single-line');
  const [sowDispatched, setSowDispatched] = useState<boolean>(false);
  const [copiedSow, setCopiedSow] = useState<boolean>(false);

  const pilotPrice = pilotScope === 'single-line' ? 4999 : 9999;

  // ==========================================
  // 4. Trust & Procurement Vault State
  // ==========================================
  const [mndaEntity, setMndaEntity] = useState<string>('Oxford Surgical Systems Ltd');
  const [mndaJurisdiction, setMndaJurisdiction] = useState<string>('England & Wales');
  const [mndaSignatory, setMndaSignatory] = useState<string>('Dr. Hannah Vance, VP Regulatory & QA');
  const [mndaGenerated, setMndaGenerated] = useState<boolean>(false);
  const [sigFilterCategory, setSigFilterCategory] = useState<string>('all');
  const [fastTrackSubmitted, setFastTrackSubmitted] = useState<boolean>(false);

  // ==========================================
  // 5. Corporate PO & Sovereign SCIF State
  // ==========================================
  const [poProductKey, setPoProductKey] = useState<'team-annual' | 'enterprise-annual' | 'single-pack'>('enterprise-annual');
  const [poEntityName, setPoEntityName] = useState<string>('BAE Systems Applied Intelligence');
  const [poBillingAddress, setPoBillingAddress] = useState<string>('Warwick House, Farnborough Aerospace Centre, Hampshire, GU14 6YU');
  const [poNumber, setPoNumber] = useState<string>('PO-2026-REG-4092');
  const [poPaymentTerms, setPoPaymentTerms] = useState<string>('Net 30 via BACS / SWIFT Wire');
  const [poContactEmail, setPoContactEmail] = useState<string>('qa.procurement@company.com');
  const [poSubmitted, setPoSubmitted] = useState<boolean>(false);

  const poLineItem = useMemo(() => {
    if (poProductKey === 'team-annual') {
      return {
        label: 'AIGENESIS.SAFETY — QA TEAM STUDIO (ANNUAL LICENSE)',
        amount: 14388,
        bullets: [
          '10 QA & Robotics Engineering Seats',
          '2,000 Formal Z3 Clause & Telemetry Audits / Month',
          'Unlimited Robot Product Lines & Unwatermarked PDF/MD/JSON Dossiers',
          'Multi-Repo GitHub Actions & GitLab CI Merge Gatekeeper'
        ]
      };
    }
    if (poProductKey === 'enterprise-annual') {
      return {
        label: 'AIGENESIS.SAFETY — SOVEREIGN ENTERPRISE SCIF (ANNUAL LICENSE)',
        amount: 47988,
        bullets: [
          'Up to 100 Engineering & Regulatory Affairs Seats',
          'Unlimited Z3 Formal Audits & Safety Twin Runs',
          'Air-Gapped On-Prem / SCIF Kubernetes Deployment (Zero Cloud Egress)',
          'Hardware-Enclave SHA-256 Notified-Body Evidence Seals & Dedicated Compliance Engineer'
        ]
      };
    }
    return {
      label: `AIGENESIS.SAFETY — TURNKEY SUBMISSION PACK (${selectedPack.title.toUpperCase()})`,
      amount: selectedPack.priceNum,
      bullets: selectedPack.deliverables
    };
  }, [poProductKey, selectedPack]);

  const sigQuestions = [
    { id: 'SEC-01', cat: 'Data Protection', q: 'Are proprietary URDF, STEP CAD, and telemetry traces encrypted?', a: 'Yes. TLS 1.3 in transit and AES-256-GCM at rest. Zero training on customer geometry or control configs.' },
    { id: 'SEC-02', cat: 'Data Sovereignty', q: 'Does proprietary CAD ever leave client air-gapped networks on Sovereign Enterprise?', a: 'No. Zero Telemetry Egress. Sovereign Enterprise deploys as self-contained OCI containers inside your private VPC or SCIF.' },
    { id: 'SEC-03', cat: 'Verification', q: 'How are safety boundaries mathematically verified for notified bodies?', a: 'Every dossier combines deterministic Z3 SMT constraint verification, ISO 14971 FMEA residual RPN proofs, and SHA-256 signed JSON manifests.' },
    { id: 'SEC-04', cat: 'Access Control', q: 'Is SSO / SAML 2.0 supported for QA & Engineering teams?', a: 'Yes. Okta, Azure AD / Entra ID, and role-based approval locks are supported on Sovereign Enterprise.' },
    { id: 'SEC-05', cat: 'Auditing', q: 'Are generated dossiers compliant with FDA 21 CFR Part 11 traceability?', a: 'Yes. Each exported dossier embeds commit SHAs, timestamped verification digests, and Quality Officer sign-off blocks.' }
  ];

  const filteredSigQuestions = sigFilterCategory === 'all'
    ? sigQuestions
    : sigQuestions.filter(q => q.cat.toLowerCase().includes(sigFilterCategory.toLowerCase()));

  const generatedSowMarkdown = useMemo(() => `# ==============================================================================
# STATEMENT OF WORK (SOW) — AUTOMATED REGULATORY & SAFETY DOSSIER ROLLOUT
# ISSUED BY: AIGENESIS SAFETY SYSTEMS LTD (UK)
# PREPARED FOR: ${clientCompany.toUpperCase()}
# ==============================================================================

ENGAGEMENT TYPE: ${pilotScope === 'single-line' ? '30-Day Single-Line Dossier Certification Pilot' : '60-Day Multi-Line Dossier & CI/CD Gatekeeper Rollout'}
PILOT INVESTMENT: £${pilotPrice.toLocaleString()} (100% CREDITED TOWARD ANNUAL LICENSE UPON CONVERSION)
PLATFORMS IN SCOPE: ${robotPlatformsCount} Robotic Product Configuration(s)
TARGET STANDARD: ${targetStandard}
CI/CD INTEGRATION: ${ciProvider}

1. DELIVERABLES
• Ingestion of client URDF/Xacro kinematics and ROS 2 controller YAML limits.
• Automated Z3 Clause Gap Analysis & Remediation Synthesis against ${targetStandard}.
• Complete ISO 14971 Pre/Post Mitigation FMEA Risk Matrix + Bi-Directional RTM.
• Unwatermarked, SHA-256 Sealed Submission Dossier (.html/.pdf, .md, .json).
• Automated ${ciProvider} Pull-Request Gatekeeper preventing unsafe merges.

2. DATA SOVEREIGNTY GUARANTEE
• Zero training on client IP. Optional air-gapped container execution available.

AUTHORIZED SIGNATURES:
Client Officer: ___________________________ Date: ____________
AIGENESIS Safety Architect: _______________ Date: ${new Date().toISOString().split('T')[0]}
`, [clientCompany, pilotScope, pilotPrice, robotPlatformsCount, targetStandard, ciProvider]);

  const generatedCfoMemo = useMemo(() => `# EXECUTIVE MEMORANDUM: REGULATORY COMPLIANCE AUTOMATION ROI
# TO: Chief Financial Officer & VP of Regulatory Affairs
# DATE: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
# SUBJECT: Replacing Manual Safety Dossier Consulting with AIGENESIS.SAFETY

1. FINANCIAL SUMMARY
------------------------------------------------------------------------------
Selected Annual License (${selectedLicenseForRoi === 'enterprise' ? 'Sovereign Enterprise' : 'QA Team Studio'}): £${annualLicenseInvestment.toLocaleString()} / year
Total Quantified Compliance Value:           £${totalComplianceBenefit.toLocaleString()} / year
Net Annual Cash-Flow Benefit:                £${netComplianceSavings.toLocaleString()} / year
Return on Investment (ROI):                  ${complianceRoiMultiplier}x
Estimated Capital Payback Period:            ${paybackMonths} Months

2. COST AVOIDANCE BREAKDOWN (${filingsPerYear} Regulatory Filings / Year)
------------------------------------------------------------------------------
• External Regulatory Consultant Fees Saved: £${consultantSavings.toLocaleString()}
  (${filingsPerYear} submissions × £${consultantRetainerPerFiling.toLocaleString()} average third-party retainer)
• QA & Safety Engineering Hours Saved:       £${qaLaborSavings.toLocaleString()}
  (${auditWeeksSavedPerFiling} weeks saved per filing across ${qaEngineersCount} QA/robotics engineers)
• Notified-Body Delay & Re-Submission Risk:  £${delayAvoidanceBenefit.toLocaleString()}
  (Automated pre-merge CI/CD gatekeeper catches clause regressions prior to audit)

RECOMMENDATION: Approve annual subscription via Corporate PO or PayPal.
`, [selectedLicenseForRoi, annualLicenseInvestment, totalComplianceBenefit, netComplianceSavings, complianceRoiMultiplier, paybackMonths, filingsPerYear, consultantSavings, consultantRetainerPerFiling, qaLaborSavings, auditWeeksSavedPerFiling, qaEngineersCount, delayAvoidanceBenefit]);

  const generatedMnda = useMemo(() => `MUTUAL NON-DISCLOSURE AGREEMENT (REGULATORY SAFETY DOSSIER ENGINE)

Entered into on ${new Date().toLocaleDateString('en-GB')} between:
1. AIGENESIS SAFETY SYSTEMS LTD (Company No. 15429810, London, United Kingdom)
2. ${mndaEntity.toUpperCase()} — Authorized Signatory: ${mndaSignatory}

1. SCOPE & CONFIDENTIALITY
Covers all robot URDF descriptions, ROS 2 controller YAML limits, FMEA hazard logs,
and generated ISO/FDA/STANAG safety dossiers exchanged for evaluation or licensing.

2. ZERO IP RETENTION & DATA SOVEREIGNTY
All CAD models, telemetry bounds, and generated compliance dossiers remain 100% the
exclusive intellectual property of ${mndaEntity}.

3. GOVERNING LAW: ${mndaJurisdiction}

Signed (AIGENESIS): _______________________  Date: ${new Date().toISOString().split('T')[0]}
Signed (${mndaEntity}): ___________________  Date: ${new Date().toISOString().split('T')[0]}
`, [mndaEntity, mndaSignatory, mndaJurisdiction]);

  const generatedPoText = useMemo(() => `==============================================================================
OFFICIAL CORPORATE PURCHASE ORDER & TAX INVOICE
AIGENESIS SAFETY SYSTEMS LTD | COMPANY NO: 15429810 | VAT ID: GB 482 9102 38
100 Silicon Way, Tech City, London EC1V 2NX, United Kingdom
==============================================================================

PO REFERENCE: ${poNumber}
DATE OF ISSUE: ${new Date().toISOString().split('T')[0]}
PAYMENT TERMS: ${poPaymentTerms}

BILLED TO:
${poEntityName}
${poBillingAddress}
Procurement Contact: ${poContactEmail}

------------------------------------------------------------------------------
ITEM DESCRIPTION                                           AMOUNT (GBP)
------------------------------------------------------------------------------
${poLineItem.label}
${poLineItem.bullets.map(b => `  • ${b}`).join('\n')}
                                                           £${poLineItem.amount.toLocaleString()}.00

SUBTOTAL (EXCL. VAT):                                      £${poLineItem.amount.toLocaleString()}.00
TOTAL PAYABLE:                                             £${poLineItem.amount.toLocaleString()}.00

WIRE SETTLEMENT DETAILS (BACS / SWIFT):
Beneficiary: AIGENESIS SAFETY SYSTEMS LTD
Bank: Barclays Commercial Bank UK | Sort Code: 20-00-00 | Account: 83920194
SWIFT/BIC: BUKBGB22 | IBAN: GB29 BUKB 2000 0083 9201 94
Reference: ${poNumber}
`, [poNumber, poPaymentTerms, poEntityName, poBillingAddress, poContactEmail, poLineItem]);

  return (
    <div className="space-y-8 font-mono text-slate-100 pb-20">
      {/* Top Single-Service Commercial Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>AIGENESIS.SAFETY // Single-Service Licensing, Turnkey Packs & PO Desk</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Regulatory Dossier Store & Corporate PO Billing
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-3xl">
              Procure turnkey single-submission dossier packs (£3,499–£7,999), calculate consultant-replacement ROI for your CFO, execute a 1-click MNDA, or bill annual QA Team Studio (£14,388/yr) and Sovereign Enterprise (£47,988/yr) licenses via PayPal or Net-30 Corporate PO.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500 block uppercase">Subscriptions</span>
              <span className="text-cyan-400 font-extrabold text-sm">£499 – £4,999/mo</span>
            </div>
            <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500 block uppercase">1-Time Filing Packs</span>
              <span className="text-emerald-400 font-extrabold text-sm">£3,499 – £7,999</span>
            </div>
            {onOpenPricing && (
              <button
                onClick={onOpenPricing}
                className="px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                View Monthly Plans
              </button>
            )}
          </div>
        </div>

        {activatedLicenseMessage && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-xs text-emerald-300">
            <span className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {activatedLicenseMessage}
            </span>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('compliance')}
                className="px-3 py-1 bg-emerald-500 text-slate-950 rounded-lg font-bold cursor-pointer"
              >
                Open Audit Studio →
              </button>
            )}
          </div>
        )}

        {/* Focused 6-Tab Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
          {[
            { id: 'regulatory-audit', label: '1. Turnkey Dossier Packs', sub: 'Single Filing (£3,499–£7,999)', icon: Shield },
            { id: 'enterprise-programs', label: '2. Subscriptions & PO Desk', sub: 'Team & Sovereign Net-30 PO', icon: CreditCard },
            { id: 'boardroom-pitch', label: '3. CFO Compliance ROI', sub: 'Consultant Savings Calculator', icon: TrendingUp },
            { id: 'pilot-sow', label: '4. Regulatory Pilot SOW', sub: '30/60-Day Certification Rollout', icon: FileText },
            { id: 'trust-center', label: '5. Legal & InfoSec Vault', sub: '1-Click MNDA & SIG Lite CSV', icon: Lock },
            { id: 'outreach-mailer', label: '6. 1:1 Inbox Outreach', sub: 'Plain-Text & DNS Auth Check', icon: Mail }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as CommercialTab)}
                className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                  active
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                  {active && <span className="text-[9px] font-bold text-emerald-400 uppercase">Active</span>}
                </div>
                <div>
                  <div className="font-bold text-xs text-white truncate">{tab.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate font-sans">{tab.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: Turnkey Single-Submission Dossier Packs                       */}
      {/* ==================================================================== */}
      {activeTab === 'regulatory-audit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TURNKEY_DOSSIER_PACKS.map(pack => {
              const isSelected = selectedPackId === pack.id;
              const isPoOrdered = orderedPackPoIds.includes(pack.id);
              return (
                <div
                  key={pack.id}
                  onClick={() => setSelectedPackId(pack.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-white font-mono">{pack.priceFormatted}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                        {pack.turnaround}
                      </span>
                    </div>

                    <div>
                      <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">{pack.standardCode}</div>
                      <h4 className="font-bold text-sm text-white mt-0.5">{pack.title}</h4>
                    </div>

                    <p className="text-xs text-slate-400 font-sans leading-relaxed">{pack.desc}</p>

                    <div className="flex flex-wrap gap-1">
                      {pack.standards.map((std, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-300">
                          {std}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPackId(pack.id);
                        setPoProductKey('single-pack');
                        if (!isPoOrdered) setOrderedPackPoIds([...orderedPackPoIds, pack.id]);
                        setActiveTab('enterprise-programs');
                      }}
                      className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      {isPoOrdered ? 'Open PO Invoice' : `Order via PO (${pack.priceFormatted})`}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCheckoutState({ isOpen: true, tier: 'pro', billingCycle: 'monthly' });
                      }}
                      className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-[11px] font-bold cursor-pointer"
                    >
                      Or Subscribe Dossier Pro (£499/mo)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Pack Deliverables Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold uppercase">
                <Award className="w-4 h-4" />
                <span>Included Filing Artifacts — {selectedPack.title}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedPack.deliverables.map((d, i) => (
                  <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-2 text-xs font-sans text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="text-xs font-bold text-white">Preview Sample Manifest or Open Live Workbench</div>
              <p className="text-[11px] text-slate-400 font-sans">
                Test your own URDF/YAML files in the Safety Audit Studio right now, or download a sample cryptographic JSON manifest for your Quality Director.
              </p>
              <div className="flex flex-wrap gap-2">
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('compliance')}
                    className="flex-1 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Launch Audit Studio <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    const manifest = JSON.stringify({
                      pack: selectedPack.title,
                      standard: selectedPack.standardCode,
                      priceGBP: selectedPack.priceNum,
                      deliverables: selectedPack.deliverables,
                      sha256SampleDigest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                      generatedBy: 'AIGENESIS.SAFETY Dossier Engine'
                    }, null, 2);
                    downloadFile(manifest, `${selectedPack.id}-sample-manifest.json`, 'application/json');
                  }}
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  Sample Manifest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: Subscriptions & Corporate PO Desk                             */}
      {/* ==================================================================== */}
      {activeTab === 'enterprise-programs' && (
        <div className="space-y-6">
          {/* 3 Clean Subscription / PO Cards Matching PricingPage */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                id: 'pro' as PlanTier,
                poKey: null,
                title: 'Dossier Pro',
                price: '£499',
                cadence: '/ month (or £4,788/yr billed annually)',
                badge: 'Single Robot Program',
                features: [
                  '250 Formal Z3 Clause Audits / month',
                  'Unwatermarked PDF/HTML, MD & SHA-256 JSON Dossiers',
                  'Editable ISO 14971 FMEA Risk Matrix',
                  'Bi-Directional RTM & CI/CD Gatekeeper (1 repo)',
                  'Instant PayPal / Card Activation'
                ]
              },
              {
                id: 'team' as PlanTier,
                poKey: 'team-annual' as const,
                title: 'QA Team Studio',
                price: '£1,499',
                cadence: '/ month (£14,388/yr via PayPal or Net-30 PO)',
                badge: 'Multi-Line QA Teams',
                features: [
                  '10 QA & Robotics Engineering Seats',
                  '2,000 Formal Z3 Clause Audits / month',
                  'Unlimited Robot Product Lines & Standards',
                  'Multi-Repo GitHub & GitLab Merge Blocking',
                  'Pay via PayPal or Net-30 Corporate PO'
                ]
              },
              {
                id: 'enterprise' as PlanTier,
                poKey: 'enterprise-annual' as const,
                title: 'Sovereign Enterprise',
                price: '£4,999',
                cadence: '/ month (£47,988/yr via PayPal or Net-30 PO)',
                badge: 'SCIF / Notified-Body Grade',
                features: [
                  '100 Seats • Unlimited Z3 Audits & FMEA Sweeps',
                  'Air-Gapped On-Prem / SCIF Kubernetes Deployment',
                  'Hardware-Enclave Signed Notified-Body Seals',
                  'Custom FDA 21 CFR 820 / STANAG / ISO Profiles',
                  'Pay via PayPal or Net-30 Corporate PO'
                ]
              }
            ].map(plan => {
              const isCurrent = quota.plan === plan.id && !quota.isTrialActive;
              return (
                <div
                  key={plan.id}
                  className={`p-6 rounded-3xl border flex flex-col justify-between space-y-5 ${
                    plan.id === 'team'
                      ? 'bg-gradient-to-b from-cyan-950/30 to-slate-900 border-cyan-500/50'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-cyan-400">{plan.badge}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                          Active Tier
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{plan.title}</h3>
                    <div className="py-2 border-y border-slate-800">
                      <span className="text-2xl font-black text-white font-mono">{plan.price}</span>
                      <span className="text-[11px] text-slate-400 font-sans block mt-0.5">{plan.cadence}</span>
                    </div>
                    <ul className="space-y-2 text-xs font-sans text-slate-300">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => setCheckoutState({ isOpen: true, tier: plan.id, billingCycle: 'monthly' })}
                      className="w-full py-2.5 px-4 bg-[#0070ba] hover:bg-[#005ea6] text-white rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Pay Monthly via PayPal ({plan.price}/mo)
                    </button>
                    {plan.poKey && (
                      <button
                        onClick={() => setPoProductKey(plan.poKey!)}
                        className={`w-full py-2 px-4 rounded-xl text-xs font-bold cursor-pointer border transition-all ${
                          poProductKey === plan.poKey
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
                        }`}
                      >
                        Select for Net-30 Annual PO Below
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Corporate PO & Tax Invoice Generator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <div className="lg:col-span-5 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  Corporate Purchase Order (PO) Invoice Desk
                </h4>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Select an annual subscription or single-submission pack to generate a Net-30 BACS/SWIFT invoice.
                </p>
              </div>

              <div className="space-y-3 text-xs font-sans">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Line Item to Invoice:</label>
                  <select
                    value={poProductKey}
                    onChange={e => setPoProductKey(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="enterprise-annual">Sovereign Enterprise SCIF Annual (£47,988/yr)</option>
                    <option value="team-annual">QA Team Studio Annual (£14,388/yr)</option>
                    <option value="single-pack">Single-Filing Pack: {selectedPack.title} ({selectedPack.priceFormatted})</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Corporate Legal Entity:</label>
                  <input
                    type="text"
                    value={poEntityName}
                    onChange={e => setPoEntityName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Corporate Billing Address:</label>
                  <textarea
                    rows={2}
                    value={poBillingAddress}
                    onChange={e => setPoBillingAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">PO Reference:</label>
                    <input
                      type="text"
                      value={poNumber}
                      onChange={e => setPoNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Payment Terms:</label>
                    <select
                      value={poPaymentTerms}
                      onChange={e => setPoPaymentTerms(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Net 30 via BACS / SWIFT Wire">Net 30 via Wire</option>
                      <option value="Net 60 via BACS / SWIFT Wire">Net 60 via Wire</option>
                      <option value="Due on Receipt via PayPal / Wire">Due on Receipt</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Procurement Contact Email:</label>
                  <input
                    type="email"
                    value={poContactEmail}
                    onChange={e => setPoContactEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => downloadFile(generatedPoText, `AIGENESIS_PO_Invoice_${poNumber}.txt`)}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Invoice (.txt)
                  </button>
                  <button
                    onClick={() => setPoSubmitted(true)}
                    className="py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl cursor-pointer"
                  >
                    Register PO
                  </button>
                </div>

                {poSubmitted && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>PO {poNumber} registered. Wire instructions prepared for {poContactEmail}.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  Live Net-30 Corporate Invoice Preview
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Total: £{poLineItem.amount.toLocaleString()}.00</span>
              </div>
              <pre className="text-[11px] leading-relaxed text-slate-300 font-mono whitespace-pre-wrap max-h-[420px] overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                {generatedPoText}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: CFO Compliance ROI Calculator                                 */}
      {/* ==================================================================== */}
      {activeTab === 'boardroom-pitch' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-cyan-400" />
                CFO Compliance & Consultant Savings Model
              </h3>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px]">
                <button
                  onClick={() => setSelectedLicenseForRoi('team')}
                  className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                    selectedLicenseForRoi === 'team' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Team (£14.4k/yr)
                </button>
                <button
                  onClick={() => setSelectedLicenseForRoi('enterprise')}
                  className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                    selectedLicenseForRoi === 'enterprise' ? 'bg-indigo-500 text-white' : 'text-slate-400'
                  }`}
                >
                  Sovereign (£48k/yr)
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Regulatory Submissions / Audits per Year:</span>
                  <span className="text-cyan-400 font-bold">{filingsPerYear} Filings/yr</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={filingsPerYear}
                  onChange={e => setFilingsPerYear(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">External Safety Consultant Retainer Replaced / Filing:</span>
                  <span className="text-emerald-400 font-bold">£{consultantRetainerPerFiling.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="90000"
                  step="5000"
                  value={consultantRetainerPerFiling}
                  onChange={e => setConsultantRetainerPerFiling(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">QA & Safety Engineering Weeks Saved / Filing:</span>
                  <span className="text-purple-400 font-bold">{auditWeeksSavedPerFiling} Weeks</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="24"
                  value={auditWeeksSavedPerFiling}
                  onChange={e => setAuditWeeksSavedPerFiling(Number(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">QA & Robotics Engineers Supported:</span>
                  <span className="text-amber-400 font-bold">{qaEngineersCount} Engineers</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  value={qaEngineersCount}
                  onChange={e => setQaEngineersCount(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                <span className="text-[10px] text-slate-500 block uppercase">Annual Value</span>
                <span className="text-emerald-400 font-extrabold text-sm">£{totalComplianceBenefit.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                <span className="text-[10px] text-slate-500 block uppercase">ROI Multiple</span>
                <span className="text-cyan-400 font-extrabold text-sm">{complianceRoiMultiplier}x</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                <span className="text-[10px] text-slate-500 block uppercase">Payback</span>
                <span className="text-amber-400 font-extrabold text-sm">{paybackMonths} mo</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Executive CFO Memo Preview
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCfoMemo);
                    setCopiedCfoMemo(true);
                    setTimeout(() => setCopiedCfoMemo(false), 2500);
                  }}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 cursor-pointer"
                >
                  {copiedCfoMemo ? 'Copied!' : 'Copy Memo'}
                </button>
                <button
                  onClick={() => downloadFile(generatedCfoMemo, 'AIGENESIS_CFO_Compliance_ROI.md')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export .md
                </button>
              </div>
            </div>
            <pre className="text-[11px] leading-relaxed text-slate-300 font-mono whitespace-pre-wrap max-h-[380px] overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              {generatedCfoMemo}
            </pre>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: Regulatory Pilot SOW Generator                                */}
      {/* ==================================================================== */}
      {activeTab === 'pilot-sow' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Regulatory Certification Pilot SOW
              </h3>
              <span className="text-[10px] text-emerald-400 font-bold">100% Credited to Annual</span>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Client Legal Entity:</label>
                <input
                  type="text"
                  value={clientCompany}
                  onChange={e => setClientCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Pilot Scope:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPilotScope('single-line')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                      pilotScope === 'single-line'
                        ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs">30-Day Single Line</div>
                    <div className="text-[10px] text-emerald-400 font-mono">£4,999</div>
                  </button>
                  <button
                    onClick={() => setPilotScope('multi-line')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                      pilotScope === 'multi-line'
                        ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs">60-Day Multi-Line</div>
                    <div className="text-[10px] text-emerald-400 font-mono">£9,999</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Target Regulatory Framework:</label>
                <select
                  value={targetStandard}
                  onChange={e => setTargetStandard(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="ISO 10218 & ISO/TS 15066 (Industrial Cobot)">ISO 10218 & ISO/TS 15066 (Industrial Cobot)</option>
                  <option value="ISO 3691-4 & ANSI/RIA R15.08 (Autonomous AMR)">ISO 3691-4 & ANSI/RIA R15.08 (Autonomous AMR)</option>
                  <option value="FDA 21 CFR 820 & ISO 13485 (Surgical Robotics)">FDA 21 CFR 820 & ISO 13485 (Surgical Robotics)</option>
                  <option value="STANAG 4586 & MIL-STD-810H (Defense UAV/UGV)">STANAG 4586 & MIL-STD-810H (Defense UAV/UGV)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Robot Configs:</label>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    value={robotPlatformsCount}
                    onChange={e => setRobotPlatformsCount(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">CI/CD Gatekeeper:</label>
                  <select
                    value={ciProvider}
                    onChange={e => setCiProvider(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
                  >
                    <option value="GitHub Actions Gatekeeper">GitHub Actions</option>
                    <option value="GitLab CI Runner">GitLab CI</option>
                    <option value="Air-Gapped Jenkins Runner">Jenkins (Air-Gapped)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => downloadFile(generatedSowMarkdown, `AIGENESIS_Pilot_SOW_${clientCompany.replace(/\s+/g, '_')}.md`)}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download SOW (.md)
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedSowMarkdown);
                    setCopiedSow(true);
                    setTimeout(() => setCopiedSow(false), 2500);
                  }}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {copiedSow ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                Live Statement of Work Preview
              </span>
              <button
                onClick={() => setSowDispatched(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {sowDispatched ? 'Pilot SOW Logged ✓' : 'Request Legal Countersignature'}
              </button>
            </div>
            <pre className="text-[11px] leading-relaxed text-slate-300 font-mono whitespace-pre-wrap max-h-[420px] overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              {generatedSowMarkdown}
            </pre>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: Legal & InfoSec Trust Vault                                   */}
      {/* ==================================================================== */}
      {activeTab === 'trust-center' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                1-Click Mutual NDA (MNDA) Generator
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Zero IP Retention</span>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Your Legal Entity Name:</label>
                <input
                  type="text"
                  value={mndaEntity}
                  onChange={e => setMndaEntity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Governing Law:</label>
                  <select
                    value={mndaJurisdiction}
                    onChange={e => setMndaJurisdiction(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
                  >
                    <option value="England & Wales">England & Wales</option>
                    <option value="State of Delaware (USA)">State of Delaware (USA)</option>
                    <option value="Germany (Munich)">Germany (Munich)</option>
                    <option value="Switzerland (Zurich)">Switzerland (Zurich)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Authorized Signer:</label>
                  <input
                    type="text"
                    value={mndaSignatory}
                    onChange={e => setMndaSignatory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  downloadFile(generatedMnda, `AIGENESIS_MNDA_${mndaEntity.replace(/\s+/g, '_')}.md`);
                  setMndaGenerated(true);
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Executable MNDA (.md)
              </button>
              {mndaGenerated && (
                <div className="text-emerald-400 text-xs font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Bilateral MNDA ready for legal countersignature.
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                SIG Lite InfoSec Questionnaire
              </h4>
              <button
                onClick={() => {
                  const csv = 'ID,Category,Question,Response\n' +
                    sigQuestions.map(q => `"${q.id}","${q.cat}","${q.q}","${q.a}"`).join('\n');
                  downloadFile(csv, 'AIGENESIS_SAFETY_SIG_Lite.csv', 'text/csv');
                }}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                Export CSV
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['all', 'Protection', 'Sovereignty', 'Verification', 'Control', 'Auditing'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSigFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                    sigFilterCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  {cat === 'all' ? 'All Controls' : cat}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {filteredSigQuestions.map(item => (
                <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-cyan-400 font-bold">{item.id} • {item.cat}</span>
                    <span className="text-emerald-400 font-bold">Compliant</span>
                  </div>
                  <div className="text-white font-bold font-sans">{item.q}</div>
                  <p className="text-[11px] text-slate-400 font-sans">{item.a}</p>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-slate-950 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-300 font-sans">Coupa / Ariba vendor onboarding needed?</span>
              {fastTrackSubmitted ? (
                <span className="text-emerald-400 text-xs font-bold">Fast-Track Active ✓</span>
              ) : (
                <button
                  onClick={() => setFastTrackSubmitted(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
                >
                  14-Day Fast Track
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: 1:1 Plain-Text Outreach & DNS Deliverability Inspector        */}
      {/* ==================================================================== */}
      {activeTab === 'outreach-mailer' && (
        <OutreachMailerPanel />
      )}

      {/* PayPal Checkout Modal */}
      <PayPalCheckoutModal
        isOpen={checkoutState.isOpen}
        onClose={() => setCheckoutState(prev => ({ ...prev, isOpen: false }))}
        tier={checkoutState.tier}
        billingCycle={checkoutState.billingCycle}
        onSuccessfulPayment={({ tier, licenseKey }) => {
          changePlan(tier);
          setActivatedLicenseMessage(`License Activated (${tier.toUpperCase()}): ${licenseKey}`);
          setCheckoutState(prev => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
};
