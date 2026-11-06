import React, { useState, useMemo } from 'react';
import { 
  DollarSign, Shield, FileText, Download, CheckCircle2, 
  Sparkles, Layers, Box, Cpu, HardDrive, ShoppingCart, 
  Award, ArrowRight, Zap, Check, Lock, Globe, Building2, 
  FileCode, Terminal, HelpCircle, AlertTriangle, ExternalLink,
  ChevronRight, Calendar, UserCheck, ShieldCheck, Mail,
  TrendingUp, Calculator, GitPullRequest, GitBranch, GitCommit,
  AlertOctagon, Briefcase, Scale, CheckCheck, RefreshCw, Key,
  Sliders, ShieldAlert, FileSpreadsheet, CreditCard
} from 'lucide-react';
import { ActiveTab, PlanTier } from '../../types';
import { useQuota } from '../../hooks/useQuota';

export type CommercialTab = 
  | 'pilot-sow' 
  | 'boardroom-pitch' 
  | 'trust-center' 
  | 'ci-gatekeeper' 
  | 'enterprise-programs' 
  | 'regulatory-audit' 
  | 'synthetic-data' 
  | 'hardware-dongle' 
  | 'gpu-tokens' 
  | 'air-gapped';

interface EnterpriseMonetizationHubProps {
  initialTab?: CommercialTab;
  onNavigateTab?: (tab: ActiveTab) => void;
  onOpenPricing?: () => void;
}

export const EnterpriseMonetizationHub: React.FC<EnterpriseMonetizationHubProps> = ({
  initialTab = 'boardroom-pitch',
  onNavigateTab,
  onOpenPricing
}) => {
  const [activeTab, setActiveTab] = useState<CommercialTab>(initialTab);
  const { quota } = useQuota();

  // Helper for downloading generated files
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
  // 1. SOW Generator State
  // ==========================================
  const [clientCompany, setClientCompany] = useState<string>('BAE Systems Applied Intelligence');
  const [fleetSize, setFleetSize] = useState<number>(25);
  const [targetVertical, setTargetVertical] = useState<'warehouse' | 'surgical' | 'defense' | 'aerospace'>('defense');
  const [selectedSilicon, setSelectedSilicon] = useState<string>('NVIDIA Jetson AGX Orin (64GB)');
  const [selectedStandard, setSelectedStandard] = useState<string>('STANAG 4586 & MIL-STD-810H');
  const [sowSubmitted, setSowSubmitted] = useState<boolean>(false);
  const [copiedSow, setCopiedSow] = useState<boolean>(false);

  const basePilotFee = 25000;
  const perRobotCost = 600;
  const standardSurcharge = targetVertical === 'defense' ? 12000 : targetVertical === 'surgical' ? 15000 : 5000;
  const totalPilotPrice = basePilotFee + (fleetSize * perRobotCost) + standardSurcharge;
  const calculatedSavings = Math.round(fleetSize * 14500);

  // ==========================================
  // 2. CFO Pitch & Business Case State
  // ==========================================
  const [cfoTeamSize, setCfoTeamSize] = useState<number>(18);
  const [cfoCrashCost, setCfoCrashCost] = useState<number>(45000); // £45k per destroyed prototype
  const [cfoCrashesAvoided, setCfoCrashesAvoided] = useState<number>(8); // physical incidents avoided/yr
  const [cfoToolingCyclesSaved, setCfoToolingCyclesSaved] = useState<number>(5); // £35k/spin
  const [cfoAuditWeeksSaved, setCfoAuditWeeksSaved] = useState<number>(16); // 16 engineering weeks saved
  const [copiedCfoMemo, setCopiedCfoMemo] = useState<boolean>(false);

  // Financial calculations
  const hardwareDamageAvoided = cfoCrashesAvoided * cfoCrashCost;
  const toolingCyclesSavings = cfoToolingCyclesSaved * 35000;
  const auditLaborSavings = cfoAuditWeeksSaved * 40 * 125; // £125/hr loaded robotics engineer rate
  const engineeringVelocityGain = cfoTeamSize * 18000; // 15% efficiency increase on £120k salary
  const totalEconomicBenefit = hardwareDamageAvoided + toolingCyclesSavings + auditLaborSavings + engineeringVelocityGain;
  const annualAigenesisLicense = 145000;
  const netCfoValue = totalEconomicBenefit - annualAigenesisLicense;
  const cfoRoiMultiplier = (totalEconomicBenefit / annualAigenesisLicense).toFixed(1);
  const paybackPeriodMonths = ((annualAigenesisLicense / totalEconomicBenefit) * 12).toFixed(1);

  // ==========================================
  // 3. Enterprise Trust Center State
  // ==========================================
  const [mndaEntity, setMndaEntity] = useState<string>('Lockheed Martin Autonomous Systems Inc.');
  const [mndaJurisdiction, setMndaJurisdiction] = useState<string>('England & Wales');
  const [mndaSignatory, setMndaSignatory] = useState<string>('Sarah Jenkins, VP of Engineering & Procurement');
  const [mndaGenerated, setMndaGenerated] = useState<boolean>(false);
  const [sigFilterCategory, setSigFilterCategory] = useState<string>('all');
  const [fastTrackSubmitted, setFastTrackSubmitted] = useState<boolean>(false);

  // ==========================================
  // 4. CI/CD Gatekeeper State
  // ==========================================
  const [ciProvider, setCiProvider] = useState<'github' | 'gitlab'>('github');
  const [simulatedPrState, setSimulatedPrState] = useState<'pass' | 'singularity' | 'gap-fail'>('pass');
  const [ciLicenseOrdered, setCiLicenseOrdered] = useState<boolean>(false);

  // ==========================================
  // 5. High-Ticket Enterprise Programs & PO State
  // ==========================================
  const [selectedProgramTier, setSelectedProgramTier] = useState<'defense' | 'medical' | 'amr'>('defense');
  const [poEntityName, setPoEntityName] = useState<string>('BAE Systems plc');
  const [poBillingAddress, setPoBillingAddress] = useState<string>('Warwick House, PO Box 87, Farnborough Aerospace Centre, Hampshire, GU14 6YU');
  const [poNumber, setPoNumber] = useState<string>('PO-2026-BAE-88392');
  const [poPaymentTerms, setPoPaymentTerms] = useState<string>('Net 30 via BACS / SWIFT Wire');
  const [poContactEmail, setPoContactEmail] = useState<string>('procurement.autonomy@baesystems.com');
  const [poSubmitted, setPoSubmitted] = useState<boolean>(false);

  // 6. Regulatory Audit State
  const [purchasedAudits, setPurchasedAudits] = useState<string[]>([]);
  const [selectedAuditForPreview, setSelectedAuditForPreview] = useState<string>('fda-surgical');

  // 7. Synthetic Data State
  const [licensedDatasets, setLicensedDatasets] = useState<string[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('dataset-defense-vio');

  // 8. Hardware Dongle State
  const [selectedDongleTier, setSelectedDongleTier] = useState<'standard' | 'extreme'>('extreme');
  const [shippingCountry, setShippingCountry] = useState<string>('United Kingdom');
  const [dongleOrdered, setDongleOrdered] = useState<boolean>(false);

  // 9. GPU Tokens State
  const [tokenBalance, setTokenBalance] = useState<number>(18.5);
  const [selectedTokenPack, setSelectedTokenPack] = useState<number>(50);

  // 10. Air-Gapped State
  const [airGappedRequested, setAirGappedRequested] = useState<boolean>(false);

  // Pre-populated SIG Lite security questionnaire items
  const sigQuestions = [
    { id: 'SEC-01', cat: 'Data Protection', q: 'Are data streams encrypted in transit and at rest?', a: 'Yes. TLS 1.3 enforced for all WebSerial/EtherCAT transports. AES-256-GCM at rest with customer-managed AWS KMS / Vault keys.' },
    { id: 'SEC-02', cat: 'Data Sovereignty', q: 'Does telemetry or proprietary CAD ever leave client air-gapped VPCs?', a: 'Zero Telemetry Egress. Local docker-compose / Podman SCIF deployment conducts 100% of physics resolution offline.' },
    { id: 'SEC-03', cat: 'Formal Verification', q: 'How are safety boundaries mathematically verified?', a: 'Formally proven using Z3 SMT solver Control Barrier Functions (CBFs) ensuring invariant safety sets are never breached.' },
    { id: 'SEC-04', cat: 'Access Control', q: 'Is multi-factor authentication (MFA) and SAML 2.0 / Okta supported?', a: 'Yes. Enterprise SSO with Okta, Azure AD, and hardware FIDO2 / YubiKey WebAuthn is enforced out of the box.' },
    { id: 'SEC-05', cat: 'Auditing & Logging', q: 'Are all simulation runs and policy parameter adjustments audit-logged?', a: 'Immutable append-only cryptographic audit logs compliant with FDA 21 CFR Part 11 and ISO 26262 ASIL-D.' },
    { id: 'SEC-06', cat: 'Vulnerability Management', q: 'How frequently are third-party penetration tests executed?', a: 'Biannual black-box & white-box audits by CREST/Cure53 certified penetration testers. Zero Critical/High CVEs allowed in release builds.' }
  ];

  const filteredSigQuestions = sigFilterCategory === 'all' 
    ? sigQuestions 
    : sigQuestions.filter(q => q.cat.toLowerCase().includes(sigFilterCategory.toLowerCase()));

  // Markdown SOW text
  const generatedSowMarkdown = useMemo(() => `# ==============================================================================
# STATEMENT OF WORK (SOW) & ENTERPRISE AUTONOMOUS PILOT AGREEMENT
# ISSUED BY: AIGENESIS PHYSICAL AI LTD (UK)
# PREPARED FOR: ${clientCompany.toUpperCase()}
# ==============================================================================

PROJECT CODENAME: PROJECT AETHEL-FRONT-REALIZATION
EFFECTIVE DURATION: 60 CALENDAR DAYS (PHASE 1 DEPLOYMENT)
TOTAL COMMITTED INVESTMENT: £${totalPilotPrice.toLocaleString()} (EXCL. VAT)
ESTIMATED HARDWARE PROTOTYPE DAMAGE AVOIDED: £${calculatedSavings.toLocaleString()} (ROI: ${(calculatedSavings / totalPilotPrice).toFixed(1)}x)

------------------------------------------------------------------------------
1. SCOPE OF TECHNICAL ENGAGEMENT
------------------------------------------------------------------------------
AIGENESIS shall deploy its complete Physical AI & Digital Twin Engine to onboard
and mathematically calibrate ${fleetSize} autonomous units operating in ${targetVertical.toUpperCase()} missions.

• TARGET EDGE SILICON: ${selectedSilicon}
• SAFETY & REGULATORY GATEWAY: ${selectedStandard}
• SIM-TO-REAL ACCURACY TARGET: Ground truth dynamic tracking error <= 0.28%
• MOTOR LOOP INFERENCE BUDGET: Sub-4.0ms deterministic 1000 Hz cycle

------------------------------------------------------------------------------
2. 60-DAY PHASED MILESTONES & DELIVERABLES
------------------------------------------------------------------------------
• MILESTONE 1 (DAYS 1-14): CAD & URDF Ingestion, V-HACD Mass Matrix Identification.
• MILESTONE 2 (DAYS 15-30): HiL CAN-FD / EtherCAT Bus Sniffer Integration & Fault Injection.
• MILESTONE 3 (DAYS 31-45): Edge Silicon TensorRT-LLM FP8 Quantization on Target Boards.
• MILESTONE 4 (DAYS 46-60): ISO/FDA/STANAG Audit-Ready Safety Certificate Sign-off.

------------------------------------------------------------------------------
3. INTELLECTUAL PROPERTY & DATA SOVEREIGNTY
------------------------------------------------------------------------------
• Zero Telemetry Egress: All trained weights and proprietary CAD assemblies remain
  100% the sole and exclusive property of ${clientCompany}.
• Deployment Tier: Sovereign Air-Gapped VPC or Local Secured Hardware Rig.

------------------------------------------------------------------------------
4. EXECUTIVE SIGN-OFF & AUTHORIZATION
------------------------------------------------------------------------------
Client Authorized Officer: __________________________  Date: ____________
AIGENESIS Lead Systems Architect: Dr. Melvyn Davies     Date: ${new Date().toISOString().split('T')[0]}
`, [clientCompany, totalPilotPrice, calculatedSavings, fleetSize, targetVertical, selectedSilicon, selectedStandard]);

  // Executive CFO Memo Text
  const generatedCfoMemo = useMemo(() => `# EXECUTIVE MEMORANDUM: CFO CAPITAL ALLOCATION & BUSINESS CASE
# TO: Chief Financial Officer & Board of Directors
# FROM: Lead Robotics Engineering Systems Architecture
# DATE: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
# SUBJECT: Investment Justification: AIGENESIS Physical AI Enterprise Platform

1. EXECUTIVE SUMMARY & KEY FINANCIAL INDICES
------------------------------------------------------------------------------
Annual AIGENESIS License:             £${annualAigenesisLicense.toLocaleString()}
Total Quantified Economic Value:       £${totalEconomicBenefit.toLocaleString()}
Net Annual CFO Cash-Flow Benefit:      £${netCfoValue.toLocaleString()}
Return on Investment (ROI):            ${cfoRoiMultiplier}x Multiplier
Estimated Capital Payback Period:      ${paybackPeriodMonths} Months

2. QUANTIFIED VALUE PILLARS & COST AVOIDANCE
------------------------------------------------------------------------------
• Avoided Hardware Crash Losses:       £${hardwareDamageAvoided.toLocaleString()}
  (Prevention of ${cfoCrashesAvoided} severe prototype destruction incidents @ £${cfoCrashCost.toLocaleString()} per rig)
  
• Elimination of Physical Re-Spins:    £${toolingCyclesSavings.toLocaleString()}
  (${cfoToolingCyclesSaved} tooling mold / machining iterations replaced with sub-millimeter digital twin validation)
  
• Regulatory & DHF Certification Time: £${auditLaborSavings.toLocaleString()}
  (${cfoAuditWeeksSaved} engineering weeks saved via automated ISO/FDA compliance proof binder)
  
• Engineering Velocity Gain:           £${engineeringVelocityGain.toLocaleString()}
  (15% capacity boost across ${cfoTeamSize} robotics engineers previously stalled by hardware-sharing bottlenecks)

3. CAPEX VS OPEX ALLOCATION
------------------------------------------------------------------------------
This software license replaces high-risk capital expenditure (physical robot arms,
test track leases, crash repairs) with an operational subscription that carries
contractual SLAs, full IP indemnification, and zero cloud telemetry egress.

RECOMMENDATION: Full Executive Board Authorization for Enterprise Master Services Agreement.
`, [annualAigenesisLicense, totalEconomicBenefit, netCfoValue, cfoRoiMultiplier, paybackPeriodMonths, hardwareDamageAvoided, cfoCrashesAvoided, cfoCrashCost, toolingCyclesSavings, cfoToolingCyclesSaved, auditLaborSavings, cfoAuditWeeksSaved, engineeringVelocityGain, cfoTeamSize]);

  // Generated MNDA Text
  const generatedMnda = useMemo(() => `MUTUAL NON-DISCLOSURE & PROPRIETARY TECHNOLOGY EVALUATION AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString('en-GB')}, by and between:
1. AIGENESIS PHYSICAL AI LTD, a corporation registered under the laws of England and Wales (Company No. 15429810), with registered offices at Tech City, London, EC1V 2NX ("AIGENESIS"); and
2. ${mndaEntity.toUpperCase()} ("Enterprise Partner").
Authorized Representative: ${mndaSignatory}

WHEREAS, the parties wish to explore a high-value commercial engagement involving autonomous physical robotics, control barrier functions, and edge silicon compilation;

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" encompasses all proprietary source code, URDF kinematics, neural policy weights, CAN-FD timing traces, hardware-in-the-loop firmware, and benchmark datasets disclosed by either party.

2. ZERO DATA EGRESS & IP OWNERSHIP
All CAD assemblies, neural network weights trained using Enterprise Partner telemetry, and simulation scenarii generated within AIGENESIS shall remain the sole and exclusive intellectual property of ${mndaEntity}.

3. GOVERNING LAW & JURISDICTION
This Agreement shall be governed by, and construed in accordance with, the laws of ${mndaJurisdiction}, without regard to conflict of laws principles.

IN WITNESS WHEREOF, the parties hereto have executed this Mutual Non-Disclosure Agreement:

For AIGENESIS PHYSICAL AI LTD:
Signature: __________________________  Date: ${new Date().toISOString().split('T')[0]}
Dr. Melvyn Davies, Chief Commercial Officer

For ${mndaEntity.toUpperCase()}:
Signature: __________________________  Date: ${new Date().toISOString().split('T')[0]}
${mndaSignatory}
`, [mndaEntity, mndaSignatory, mndaJurisdiction]);

  // Generated CI/CD Workflow YAML
  const generatedCiYaml = useMemo(() => `name: AIGENESIS Autonomous Safety Gate
on:
  pull_request:
    branches: [ main, release/* ]
  push:
    branches: [ main ]

jobs:
  aigenesis-safety-barrier:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Robotics Codebase
        uses: actions/checkout@v4

      - name: Setup Python & Z3 SMT Theorem Prover
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: AIGENESIS Formal Verification & Sim-to-Real Gate
        uses: aigenesis/gatekeeper-action@v2.4
        with:
          api-token: \${{ secrets.AIGENESIS_ENTERPRISE_TOKEN }}
          urdf-path: 'robots/manipulator_arm.urdf'
          cbf-safety-invariants: 'true'
          max-sim-to-real-gap: '0.5%'
          max-motor-jitter-us: '250'
          fail-on-singularity: 'true'
          generate-iso-compliance-report: 'true'

      - name: Upload Safety Certificate Artifact
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: aigenesis-safety-cert-\${{ github.sha }}
          path: ./aigenesis-safety-report.json
`, []);

  // Generated PO Invoice text
  const generatedPoText = useMemo(() => `==============================================================================
OFFICIAL CORPORATE PURCHASE ORDER & TAX INVOICE
AIGENESIS PHYSICAL AI LTD | COMPANY NO: 15429810 | VAT ID: GB 482 9102 38
100 Silicon Way, Tech City, London EC1V 2NX, United Kingdom
==============================================================================

INVOICE NO: INV-2026-${Math.floor(10000 + Math.random() * 90000)}
PO REFERENCE: ${poNumber}
DATE OF ISSUE: ${new Date().toISOString().split('T')[0]}
DUE DATE: 30 Days Net (${new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]})

BILLED TO (CLIENT LEGAL ENTITY):
${poEntityName}
${poBillingAddress}
Contact Email: ${poContactEmail}

------------------------------------------------------------------------------
ITEM DESCRIPTION                                           TOTAL (EXCL. VAT)
------------------------------------------------------------------------------
${selectedProgramTier === 'defense' ? 'SOVEREIGN DEFENSE AUTONOMY PROGRAM (ANNUAL CONTRACT)' : selectedProgramTier === 'medical' ? 'MEDICAL & SURGICAL DHF ACCELERATION PROGRAM (ANNUAL CONTRACT)' : 'AUTONOMOUS AMR FACTORY SWARM PROGRAM (ANNUAL CONTRACT)'}
- Tier 4 SCIF / Air-Gapped High-Assurance Deployment
- Deterministic 1000 Hz Sim-to-Real Verification Suite
- Formal Z3 Barrier Proofs & ISO/FDA Automated Audit Binder
- Unlimited Simulation Seats & Dedicated Field Systems Architect
                                                           £${selectedProgramTier === 'defense' ? '250,000.00' : selectedProgramTier === 'medical' ? '180,000.00' : '120,000.00'}

SUBTOTAL:                                                  £${selectedProgramTier === 'defense' ? '250,000.00' : selectedProgramTier === 'medical' ? '180,000.00' : '120,000.00'}
VAT (0% Reverse Charge / B2B Export):                      £0.00
TOTAL PAYABLE:                                             £${selectedProgramTier === 'defense' ? '250,000.00' : selectedProgramTier === 'medical' ? '180,000.00' : '120,000.00'}

PAYMENT TERMS & WIRE SETTLEMENT DETAILS:
Payment Terms: ${poPaymentTerms}
Beneficiary: AIGENESIS PHYSICAL AI LTD
Bank: Barclays Commercial Bank UK
Sort Code: 20-00-00
Account No: 83920194
SWIFT / BIC: BUKBGB22
IBAN: GB29 BUKB 2000 0083 9201 94
Payment Reference: ${poNumber}
`, [poNumber, poEntityName, poBillingAddress, poContactEmail, selectedProgramTier, poPaymentTerms]);

  return (
    <div className="space-y-8 font-mono text-slate-100 pb-20">
      {/* Top Enterprise Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>AIGENESIS Enterprise Revenue Engine & Executive Commercial Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Enterprise Procurement & Multi-Million-Dollar ARR Suite
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-3xl">
              Turnkey B2B commercialization designed for defense primes, surgical robotics OEMs, and industrial automation conglomerates. Synthesize boardroom CFO business cases, execute 1-click legal MNDAs, enforce CI/CD Git barrier gates, and bill six-figure enterprise contracts via corporate POs.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500 block uppercase">Contract Range</span>
              <span className="text-emerald-400 font-extrabold text-sm">£120k – £250k/yr</span>
            </div>
            <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500 block uppercase">Procurement Speed</span>
              <span className="text-cyan-400 font-extrabold text-sm">14-Day Fast Track</span>
            </div>
          </div>
        </div>

        {/* Section 1: 4 High-Ticket ARR Acceleration Pillars */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-xs text-indigo-300 font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Core Enterprise ARR Engine (Executive & Procurement Suite)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              { id: 'boardroom-pitch', label: '1. CFO Business Case', sub: 'Dynamic 6.0x ROI Model & Memo', icon: TrendingUp, tag: 'High Conversion' },
              { id: 'trust-center', label: '2. Trust & Procurement', sub: '1-Click MNDA & SOC 2 Vault', icon: ShieldCheck, tag: '14-Day Fast Track' },
              { id: 'ci-gatekeeper', label: '3. CI/CD Gatekeeper', sub: 'GitHub PR Safety Barrier ($25k)', icon: GitPullRequest, tag: 'DevOps Embed' },
              { id: 'enterprise-programs', label: '4. High-Ticket Programs', sub: '£120k–£250k Annual PO Billing', icon: Briefcase, tag: 'Primary ARR' }
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                    active
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-xl shadow-indigo-600/20 scale-[1.02]'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="text-[8px] px-1.5 py-0.5 rounded font-bold border bg-indigo-500/10 text-indigo-300 border-indigo-500/30">
                      {tab.tag}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white truncate">{tab.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{tab.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Productized Add-on Stores & Pilot Generator */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
            <span>Productized Add-On Stores, Datasets & Pilots</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { id: 'pilot-sow', label: 'Pilot SOW Generator', sub: '£25k–£75k Pilot', icon: FileText },
              { id: 'regulatory-audit', label: 'Regulatory Audit Packs', sub: 'FDA/ISO Dossiers ($5k-$10k)', icon: Shield },
              { id: 'synthetic-data', label: 'Data & Policy Store', sub: 'Pre-Trained LeRobot DaaS', icon: HardDrive },
              { id: 'hardware-dongle', label: 'Physical HiL Kits', sub: 'WebSerial Hardware Dongles', icon: Box },
              { id: 'gpu-tokens', label: 'Silicon GPU Tokens', sub: 'TensorRT Cloud Compilation', icon: Cpu },
              { id: 'air-gapped', label: 'Sovereign SCIF License', sub: 'Air-Gapped Deployment', icon: Lock }
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                    active
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-white shadow-lg'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="font-bold text-[10px] text-white truncate">{tab.label}</span>
                  </div>
                  <div className="text-[9px] text-slate-500 truncate">{tab.sub}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* PILLAR 1 (Tab: 'boardroom-pitch'): CFO Business Case Synthesizer     */}
      {/* ==================================================================== */}
      {activeTab === 'boardroom-pitch' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Financial Sliders */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-400" />
                CFO Value & ROI Parameters
              </h3>
              <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                Interactive Model
              </span>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Robotics Engineering Team Size:</span>
                  <span className="text-white font-bold">{cfoTeamSize} Engineers</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="60"
                  step="1"
                  value={cfoTeamSize}
                  onChange={e => setCfoTeamSize(parseInt(e.target.value))}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">Assumes £120k loaded annual cost per robotics engineer.</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Average Hardware Crash Damage:</span>
                  <span className="text-white font-bold">£{cfoCrashCost.toLocaleString()} / collision</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="100000"
                  step="5000"
                  value={cfoCrashCost}
                  onChange={e => setCfoCrashCost(parseInt(e.target.value))}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">Arm joints, harmonic drives, vision sensors destroyed in physical bringup.</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Hardware Incidents Prevented / Year:</span>
                  <span className="text-emerald-400 font-bold">{cfoCrashesAvoided} Catastrophes Avoided</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={cfoCrashesAvoided}
                  onChange={e => setCfoCrashesAvoided(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">Blocked by AIGENESIS formal Z3 barrier invariant proofs prior to physical flashing.</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Tooling Re-Spins Eliminated:</span>
                  <span className="text-white font-bold">{cfoToolingCyclesSaved} Physical Spins</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={cfoToolingCyclesSaved}
                  onChange={e => setCfoToolingCyclesSaved(parseInt(e.target.value))}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">Saves £35,000 per CNC/injection mold re-spin through digital twin fidelity.</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Regulatory & Safety Audit Weeks Saved:</span>
                  <span className="text-cyan-400 font-bold">{cfoAuditWeeksSaved} Weeks Saved</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="30"
                  step="2"
                  value={cfoAuditWeeksSaved}
                  onChange={e => setCfoAuditWeeksSaved(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">Automated FDA 21 CFR Part 820 and ISO 13485/3691 compliance generation.</span>
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  downloadFile(generatedCfoMemo, `AIGENESIS_CFO_Boardroom_Memo_${new Date().toISOString().split('T')[0]}.md`);
                }}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-indigo-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                Download Official Boardroom CFO Memo (.md)
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedCfoMemo);
                  setCopiedCfoMemo(true);
                  setTimeout(() => setCopiedCfoMemo(false), 3000);
                }}
                className="w-full py-2 px-4 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {copiedCfoMemo ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
                {copiedCfoMemo ? 'Copied CFO Memo to Clipboard!' : 'Copy Executive Summary to Clipboard'}
              </button>
            </div>
          </div>

          {/* Right: Live Boardroom Synthesis Dashboard */}
          <div className="lg:col-span-7 space-y-5">
            {/* 4 Big Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[10px] text-slate-400 block uppercase">Total Economic Value</span>
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">£{totalEconomicBenefit.toLocaleString()}</span>
                <span className="text-[9px] text-slate-500 block mt-1">Gross Annual Benefit</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[10px] text-slate-400 block uppercase">Net CFO Cash-Flow</span>
                <span className="text-xl sm:text-2xl font-extrabold text-white font-mono">£{netCfoValue.toLocaleString()}</span>
                <span className="text-[9px] text-emerald-400 block mt-1">After Software Cost</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[10px] text-slate-400 block uppercase">ROI Multiplier</span>
                <span className="text-xl sm:text-2xl font-extrabold text-indigo-400 font-mono">{cfoRoiMultiplier}x</span>
                <span className="text-[9px] text-slate-500 block mt-1">Capital Return Ratio</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[10px] text-slate-400 block uppercase">Payback Horizon</span>
                <span className="text-xl sm:text-2xl font-extrabold text-cyan-400 font-mono">{paybackPeriodMonths} Mo</span>
                <span className="text-[9px] text-slate-500 block mt-1">Cash Breakeven</span>
              </div>
            </div>

            {/* Cost Breakdown Visualizer */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-bold text-sm text-white">Annual Cost Avoidance & Reclaimed Capital Waterfall</h4>
                <span className="text-[10px] text-slate-400">Board Deck Ready</span>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-slate-300">1. Avoided Physical Prototype Crash Damage</span>
                    <span className="text-emerald-400 font-bold">£{hardwareDamageAvoided.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${Math.min(100, (hardwareDamageAvoided / totalEconomicBenefit) * 100)}%` }} 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-slate-300">2. Eliminated Physical Tooling & Machining Re-Spins</span>
                    <span className="text-cyan-400 font-bold">£{toolingCyclesSavings.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500 rounded-full" 
                      style={{ width: `${Math.min(100, (toolingCyclesSavings / totalEconomicBenefit) * 100)}%` }} 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-slate-300">3. Regulatory Dossier (FDA/ISO) Engineering Labor</span>
                    <span className="text-indigo-400 font-bold">£{auditLaborSavings.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full" 
                      style={{ width: `${Math.min(100, (auditLaborSavings / totalEconomicBenefit) * 100)}%` }} 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-slate-300">4. Engineering Velocity Gain ({cfoTeamSize} FTEs @ 15% boost)</span>
                    <span className="text-purple-400 font-bold">£{engineeringVelocityGain.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full" 
                      style={{ width: `${Math.min(100, (engineeringVelocityGain / totalEconomicBenefit) * 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CFO Memo Live Preview */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  Live Executive CFO Memo Output
                </span>
                <span className="text-[10px] text-slate-500">Board Authorization Document</span>
              </div>
              <pre className="text-[11px] leading-relaxed text-slate-300 font-mono whitespace-pre-wrap max-h-56 overflow-y-auto bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
                {generatedCfoMemo}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PILLAR 2 (Tab: 'trust-center'): Trust Center & Procurement Fast-Track */}
      {/* ==================================================================== */}
      {activeTab === 'trust-center' && (
        <div className="space-y-6">
          {/* Trust Banner with Badges */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Enterprise Procurement Fast-Track & Trust Center
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Compress standard 9-month defense & medical procurement vetting cycles down to 14 calendar days.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Pre-Audited & Vendor Approved
                </span>
              </div>
            </div>

            {/* 4 Compliance Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-sans">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-white">SOC 2 Type II</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400">Continuous 365-day automated auditing via Vanta / Drata with zero exceptions.</p>
                <span className="text-[10px] text-indigo-400 font-mono block pt-1">Report ID: SOC2-2026-UK</span>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-white">ISO/IEC 27001:2022</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400">Information Security Management System (ISMS) accredited by UKAS.</p>
                <span className="text-[10px] text-indigo-400 font-mono block pt-1">Cert: ISMS-89102-UK</span>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-white">ITAR & EAR Cat VII/XI</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400">Military ground vehicles and avionics export control compliant. US/UK cleared.</p>
                <span className="text-[10px] text-indigo-400 font-mono block pt-1">Registration: M-48192-ITAR</span>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-white">Cyber Essentials Plus</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400">UK NCSC National Cyber Security Centre verified technical security verification.</p>
                <span className="text-[10px] text-indigo-400 font-mono block pt-1">Badge: NCSC-CEP-2026</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1-Click MNDA Generator */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  1-Click Mutual NDA (MNDA) Generator
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Bilateral Execution</span>
              </div>

              <div className="space-y-3 text-xs font-sans">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Your Legal Entity Name:</label>
                  <input
                    type="text"
                    value={mndaEntity}
                    onChange={e => setMndaEntity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Governing Jurisdiction:</label>
                    <select
                      value={mndaJurisdiction}
                      onChange={e => setMndaJurisdiction(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="England & Wales">England & Wales</option>
                      <option value="State of Delaware (USA)">State of Delaware (USA)</option>
                      <option value="State of California (USA)">State of California (USA)</option>
                      <option value="Switzerland (Zurich)">Switzerland (Zurich)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Authorized Signer:</label>
                    <input
                      type="text"
                      value={mndaSignatory}
                      onChange={e => setMndaSignatory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-mono">
                  • 100% CAD & Neural Weight IP Protection Guarantee<br />
                  • Strict Zero-Telemetry Egress Clause Included<br />
                  • Mutual Confidentiality with Standard 3-Year Term
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      downloadFile(generatedMnda, `AIGENESIS_MNDA_${mndaEntity.replace(/\s+/g, '_')}.md`);
                      setMndaGenerated(true);
                    }}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Executable MNDA (.md)
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedMnda);
                      setMndaGenerated(true);
                    }}
                    className="py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>

                {mndaGenerated && (
                  <div className="text-emerald-400 text-[11px] font-bold flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Bilateral MNDA ready for legal signature.
                  </div>
                )}
              </div>
            </div>

            {/* Pre-Answered SIG Lite 120-Question Questionnaire */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                    Standardized Information Gathering (SIG Lite)
                  </h4>
                  <span className="text-[10px] text-slate-400 font-sans">Pre-populated 120-question cybersecurity audit for enterprise infosec</span>
                </div>
                <button
                  onClick={() => {
                    const csvContent = "Question ID,Category,Security Audit Question,AIGENESIS Enterprise Response\n" + 
                      sigQuestions.map(q => `"${q.id}","${q.cat}","${q.q}","${q.a}"`).join('\n');
                    downloadFile(csvContent, 'AIGENESIS_Vendor_Security_Assessment_SIG_Lite.csv', 'text/csv');
                  }}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  Download CSV
                </button>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1.5">
                {['all', 'Protection', 'Sovereignty', 'Verification', 'Control'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setSigFilterCategory(filter)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      sigFilterCategory === filter 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {filter === 'all' ? 'All Questions' : filter}
                  </button>
                ))}
              </div>

              {/* Questions List */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {filteredSigQuestions.map(item => (
                  <div key={item.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">{item.id} • {item.cat}</span>
                      <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">Compliant</span>
                    </div>
                    <div className="text-white font-bold font-sans text-xs">{item.q}</div>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>

              {/* 14-Day Fast Track CTA */}
              <div className="p-4 bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <span className="text-white font-bold text-xs block">Need immediate procurement clearance?</span>
                  <span className="text-[10px] text-slate-400 font-sans">Our Legal & CISO desk handles direct vendor portal registration (Coupa, Ariba).</span>
                </div>
                {fastTrackSubmitted ? (
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Fast-Track Active
                  </span>
                ) : (
                  <button
                    onClick={() => setFastTrackSubmitted(true)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
                  >
                    Initiate 14-Day Fast Track
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PILLAR 3 (Tab: 'ci-gatekeeper'): CI/CD GitHub Action Hub            */}
      {/* ==================================================================== */}
      {activeTab === 'ci-gatekeeper' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive PR Safety Barrier Simulator */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <GitPullRequest className="w-4 h-4 text-purple-400" />
                  AIGENESIS Gatekeeper PR Checker
                </h3>
                <span className="text-[10px] text-slate-400 font-sans">Automated barrier proofs on every Git pull request</span>
              </div>
              <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                v2.4 CI Engine
              </span>
            </div>

            {/* Test Case Selector */}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 uppercase font-bold block">Simulate Pull Request Event:</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => setSimulatedPrState('pass')}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    simulatedPrState === 'pass'
                      ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Clean PR #219</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block font-normal">All invariants verified</span>
                </button>

                <button
                  onClick={() => setSimulatedPrState('singularity')}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    simulatedPrState === 'singularity'
                      ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                    <span>Joint Singularity</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block font-normal">Torque limit breach</span>
                </button>

                <button
                  onClick={() => setSimulatedPrState('gap-fail')}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    simulatedPrState === 'gap-fail'
                      ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sim-to-Real Delta</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block font-normal">Tracking error &gt; 0.5%</span>
                </button>
              </div>
            </div>

            {/* Live CI Check Pipeline Visualizer */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
                <span className="flex items-center gap-1.5 text-white">
                  <GitCommit className="w-3.5 h-3.5 text-slate-400" />
                  PR #219: feat(kinematics): trajectory planner v3
                </span>
                <span className={`font-bold ${simulatedPrState === 'pass' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {simulatedPrState === 'pass' ? 'PASSED (Merge Ready)' : 'CHECKS FAILED (Blocked)'}
                </span>
              </div>

              {/* Gate 1: Singularity & Torques */}
              <div className="flex items-center justify-between">
                <span className="text-slate-300">1. URDF Kinematic Singularity & Torques:</span>
                <span className={`font-bold flex items-center gap-1 ${simulatedPrState === 'singularity' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {simulatedPrState === 'singularity' ? (
                    <>
                      <AlertOctagon className="w-3 h-3" /> FAILED (Joint 4: 58.4 Nm &gt; 50 Nm)
                    </>
                  ) : (
                    <>
                      <Check className="w-3 h-3" /> PASSED (Det(J) = 0.082 &gt; 0.05)
                    </>
                  )}
                </span>
              </div>

              {/* Gate 2: Z3 Barrier Function */}
              <div className="flex items-center justify-between">
                <span className="text-slate-300">2. Z3 SMT Control Barrier Invariance:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> PASSED (Proven in 14ms)
                </span>
              </div>

              {/* Gate 3: Sim-to-Real Gap */}
              <div className="flex items-center justify-between">
                <span className="text-slate-300">3. Sim-to-Real Trajectory Deviation:</span>
                <span className={`font-bold flex items-center gap-1 ${simulatedPrState === 'gap-fail' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {simulatedPrState === 'gap-fail' ? (
                    <>
                      <AlertTriangle className="w-3 h-3" /> FAILED (Delta 0.84% &gt; 0.5%)
                    </>
                  ) : (
                    <>
                      <Check className="w-3 h-3" /> PASSED (Delta 0.29% &lt; 0.5%)
                    </>
                  )}
                </span>
              </div>

              {/* Gate 4: Real-Time Motor Latency */}
              <div className="flex items-center justify-between">
                <span className="text-slate-300">4. 1000 Hz CAN-FD Deterministic Jitter:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> PASSED (Max Jitter: 162µs &lt; 250µs)
                </span>
              </div>
            </div>

            {/* Terminal Log Output */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] space-y-1">
              <div className="text-slate-500 flex items-center gap-1">
                <Terminal className="w-3 h-3 text-slate-400" />
                <span>Runner Terminal: aigenesis/gatekeeper-action@v2.4</span>
              </div>
              <div className="text-slate-300">
                {simulatedPrState === 'pass' && (
                  <span className="text-emerald-400">
                    [INFO] 12,500 random trajectories evaluated.<br />
                    [INFO] Mathematical forward invariance verified by Z3 SMT.<br />
                    [SUCCESS] 0 fatal violations. Safe for physical hardware deployment.
                  </span>
                )}
                {simulatedPrState === 'singularity' && (
                  <span className="text-rose-400">
                    [ERROR] Invariant breach detected in Joint 4 near boundary [-1.57, +1.57].<br />
                    [FATAL] Peak torque reached 58.4 Nm (Exceeds motor rating 50.0 Nm).<br />
                    [BLOCK] PR #219 blocked from merge to prevent physical motor burnout!
                  </span>
                )}
                {simulatedPrState === 'gap-fail' && (
                  <span className="text-amber-400">
                    [WARN] Domain randomization error bound exceeded: 0.84% (Threshold: 0.50%).<br />
                    [BLOCK] Physical hardware safety lock engaged. Retraining required.
                  </span>
                )}
              </div>
            </div>

            {/* Commercial Licensing Card */}
            <div className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-purple-300 uppercase font-bold block">Enterprise Gatekeeper CI/CD License</span>
                <span className="text-white font-extrabold text-sm">$25,000 / year (Unlimited Repos & Runs)</span>
              </div>
              {ciLicenseOrdered ? (
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-4 h-4" /> License Provisioned
                </span>
              ) : (
                <button
                  onClick={() => setCiLicenseOrdered(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-purple-600/20"
                >
                  Provision CI License
                </button>
              )}
            </div>
          </div>

          {/* Right: Pipeline YAML Code Generator */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <h4 className="font-bold text-sm text-white">Pipeline Definition</h4>
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px]">
                  <button
                    onClick={() => setCiProvider('github')}
                    className={`px-2.5 py-0.5 rounded-lg font-bold cursor-pointer ${
                      ciProvider === 'github' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    GitHub Actions
                  </button>
                  <button
                    onClick={() => setCiProvider('gitlab')}
                    className={`px-2.5 py-0.5 rounded-lg font-bold cursor-pointer ${
                      ciProvider === 'gitlab' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    GitLab CI
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  downloadFile(generatedCiYaml, '.github/workflows/aigenesis-safety-gate.yml', 'text/yaml');
                }}
                className="px-3 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3 h-3 text-purple-400" />
                Download YAML
              </button>
            </div>

            <pre className="text-[11px] leading-relaxed text-slate-300 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              {generatedCiYaml}
            </pre>

            <div className="grid grid-cols-2 gap-3 text-xs font-sans">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="font-bold text-white block font-mono text-[11px]">Zero Hardware Damage</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Catches kinematic singularity & actuator thermal runaway prior to physical merge.</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                <span className="font-bold text-white block font-mono text-[11px]">Audit-Ready JSON</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Automated upload of signed mathematical certificates to ISO/FDA DHF binders.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PILLAR 4 (Tab: 'enterprise-programs'): High-Ticket Turnkey Programs  */}
      {/* ==================================================================== */}
      {activeTab === 'enterprise-programs' && (
        <div className="space-y-6">
          {/* 3 High-Ticket Programs Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                id: 'defense',
                title: 'Sovereign Defense Autonomy',
                price: '£250,000',
                cadence: '/ year (Annual Contract)',
                target: 'Defense Primes, UAV/UGV Contractors & MoD',
                badge: 'ITAR Tier 4 SCIF',
                color: 'border-indigo-500/60 bg-gradient-to-b from-indigo-950/40 to-slate-900',
                btnColor: 'bg-indigo-600 hover:bg-indigo-500',
                features: [
                  'Air-Gapped Bare-Metal SCIF Deployment',
                  'STANAG 4586 & MIL-STD-810H Compliant',
                  'Physical Anti-Tamper Hardware Dongles',
                  'Deterministic Jam-Resistant Swarm Comms',
                  'Dedicated Clearable Field Systems Architect',
                  'Full Source Code Escrow & Perpetual Rights'
                ]
              },
              {
                id: 'medical',
                title: 'Medical & Surgical DHF',
                price: '£180,000',
                cadence: '/ year (Annual Contract)',
                target: 'Surgical Robotics, Orthopedic & Endoscopic OEMs',
                badge: 'FDA 21 CFR Part 820',
                color: 'border-cyan-500/60 bg-gradient-to-b from-cyan-950/40 to-slate-900',
                btnColor: 'bg-cyan-600 hover:bg-cyan-500',
                features: [
                  'Design History File (DHF) Automated Binder',
                  'ISO 13485 & IEC 62304 Class C Sign-Off',
                  'Sub-1.5ms Deterministic Teleoperation Loop',
                  'Tactile Force-Feedback Patient Barrier Proofs',
                  'Biocompatibility Environmental Calibrations',
                  'Pre-Notified 510(k) Dossier Package'
                ]
              },
              {
                id: 'amr',
                title: 'Autonomous AMR Factory Swarm',
                price: '£120,000',
                cadence: '/ year (Annual Contract)',
                target: 'Tier-1 Automotive & Gigafactory Logistics',
                badge: 'ISO 3691-4 Industrial',
                color: 'border-emerald-500/60 bg-gradient-to-b from-emerald-950/40 to-slate-900',
                btnColor: 'bg-emerald-600 hover:bg-emerald-500',
                features: [
                  '500+ AMR High-Density Swarm Simulation',
                  'ISO 3691-4 Industrial AGV Safety Proofs',
                  'Fleet-Wide OTA Progressive Rollout Orchestrator',
                  'SAP EWM & Manhattan WMS Direct Bridges',
                  'LiDAR Dynamic Occlusion Stress Testing',
                  '99.999% Industrial High-Availability SLA'
                ]
              }
            ].map(prog => {
              const selected = selectedProgramTier === prog.id;
              return (
                <div
                  key={prog.id}
                  className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                    selected ? `${prog.color} ring-2 ring-indigo-500 scale-[1.02]` : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">{prog.badge}</span>
                      {selected && <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Selected</span>}
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold text-white">{prog.title}</h4>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5">{prog.target}</p>
                    </div>

                    <div className="py-2 border-y border-slate-800/80">
                      <div className="text-2xl font-black text-white font-mono">{prog.price}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{prog.cadence}</div>
                    </div>

                    <ul className="space-y-2 text-xs font-sans text-slate-300">
                      {prog.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => setSelectedProgramTier(prog.id as any)}
                    className={`mt-6 w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer ${
                      selected ? prog.btnColor : 'bg-slate-950 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {selected ? 'Program Selected for Invoicing' : 'Select Program'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Corporate PO & Invoicing Desk */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
            {/* Form Inputs */}
            <div className="lg:col-span-5 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Corporate Purchase Order (PO) Billing Desk
                </h4>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Generate formal corporate invoices with standard Net-30 payment terms and wire details.
                </p>
              </div>

              <div className="space-y-3 text-xs font-sans">
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
                    <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">PO Reference Number:</label>
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
                      <option value="50% Upfront, 50% on Milestone 4">50% Advance / 50% Delivery</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Procurement Officer Email:</label>
                  <input
                    type="email"
                    value={poContactEmail}
                    onChange={e => setPoContactEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      downloadFile(generatedPoText, `AIGENESIS_Invoice_${poNumber}.txt`);
                    }}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Tax Invoice (.txt)
                  </button>
                  <button
                    onClick={() => setPoSubmitted(true)}
                    className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Submit PO
                  </button>
                </div>

                {poSubmitted && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Purchase order registered. AIGENESIS Finance dispatched wire verification instructions to {poContactEmail}.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Live PO Document Preview */}
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  Official Corporate PO Invoice Preview
                </span>
                <span className="text-[10px] text-slate-500 font-mono">GB VAT 482 9102 38</span>
              </div>
              <pre className="text-[11px] leading-relaxed text-slate-300 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                {generatedPoText}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STREAM 1 (Tab: 'pilot-sow'): Enterprise Pilot & SOW Proposal         */}
      {/* ==================================================================== */}
      {activeTab === 'pilot-sow' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Proposal Configurator */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Enterprise Pilot & SOW Configurator
              </h3>
              <span className="text-[10px] text-emerald-400">Formal Contract</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Company / Organization Name:</label>
                <input
                  type="text"
                  value={clientCompany}
                  onChange={e => setClientCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Robotics Operational Domain:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'defense', label: 'Defense Autonomy' },
                    { id: 'surgical', label: 'Surgical Robotics' },
                    { id: 'warehouse', label: 'Warehouse Logistics' },
                    { id: 'aerospace', label: 'Aerospace & UAVs' }
                  ].map(v => (
                    <button
                      key={v.id}
                      onClick={() => setTargetVertical(v.id as any)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        targetVertical === v.id
                          ? 'bg-emerald-500/20 border-emerald-500/60 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Orchestrated Robot Fleet Size:</span>
                  <span className="text-emerald-400 font-bold">{fleetSize} Autonomous Units</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="100"
                  step="1"
                  value={fleetSize}
                  onChange={e => setFleetSize(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Edge Silicon Target:</label>
                <select
                  value={selectedSilicon}
                  onChange={e => setSelectedSilicon(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="NVIDIA Jetson AGX Orin (64GB)">NVIDIA Jetson AGX Orin (64GB)</option>
                  <option value="Tenstorrent Wormhole n150 (RISC-V)">Tenstorrent Wormhole n150 (RISC-V)</option>
                  <option value="Hailo-8 M.2 AI Acceleration Module">Hailo-8 M.2 AI Acceleration Module</option>
                  <option value="Qualcomm RB5 Robotics Platform">Qualcomm RB5 Robotics Platform</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Target Regulatory Framework:</label>
                <select
                  value={selectedStandard}
                  onChange={e => setSelectedStandard(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="STANAG 4586 & MIL-STD-810H">STANAG 4586 & MIL-STD-810H (Defense / Aerospace)</option>
                  <option value="FDA 21 CFR Part 820 & ISO 13485">FDA 21 CFR Part 820 & ISO 13485 (Medical / Surgical)</option>
                  <option value="ISO 3691-4 & ANSI/RIA R15.08">ISO 3691-4 & ANSI/RIA R15.08 (Industrial AGV/AMR)</option>
                  <option value="ISO 26262 ASIL-D">ISO 26262 ASIL-D (Automotive Functional Safety)</option>
                </select>
              </div>

              {/* Price Calculation Box */}
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Phase 1 Pilot Contract Value:</span>
                  <span className="text-emerald-400 font-extrabold text-base">£{totalPilotPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Calculated Hardware Risk Avoidance:</span>
                  <span className="text-cyan-300 font-bold">£{calculatedSavings.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    downloadFile(generatedSowMarkdown, `AIGENESIS_Pilot_SOW_${clientCompany.replace(/\s+/g, '_')}.md`);
                  }}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-600/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Official SOW (.md)
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedSowMarkdown);
                    setCopiedSow(true);
                    setTimeout(() => setCopiedSow(false), 3000);
                  }}
                  className="py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  {copiedSow ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Live SOW Markdown Document Preview */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>Live Generated Statement of Work Preview</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">BACS / Wire Settlement</span>
            </div>

            <pre className="text-[11px] leading-relaxed text-slate-300 font-mono whitespace-pre-wrap max-h-[460px] overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              {generatedSowMarkdown}
            </pre>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-white text-xs font-bold block">Need Custom Master Services Agreement (MSA)?</span>
                <span className="text-[10px] text-slate-400">Our commercial legal team executes bilateral MSAs within 48 hours.</span>
              </div>
              <button
                onClick={() => setSowSubmitted(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {sowSubmitted ? 'Proposal Dispatched' : 'Request Enterprise Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STREAM 2: Regulatory Audit-Ready Compliance Packs */}
      {activeTab === 'regulatory-audit' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Pre-Packaged Regulatory Compliance & Safety Dossiers
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Instant turnkey regulatory dossiers with formal mathematical Z3 barrier proofs, fault-tree FMEA, and automated verification matrices.
                </p>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                ISO & FDA Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: 'fda-surgical',
                  title: 'FDA 21 CFR Part 820 Surgical Dossier',
                  price: '$9,999',
                  desc: 'Complete Design History File (DHF), biocompatibility safety limits, 1000Hz motor loop jitter logs, and clinical trial audit proofs.',
                  standards: ['FDA Class II/III', 'ISO 13485', 'IEC 62304']
                },
                {
                  id: 'stanag-defense',
                  title: 'STANAG 4586 Defense UAV/UGV Pack',
                  price: '$8,499',
                  desc: 'NATO interoperability control architecture, MIL-STD-810H environmental profiles, and anti-spoofing trajectory barrier guarantees.',
                  standards: ['STANAG 4586', 'MIL-STD-810H', 'DEF-STAN 00-56']
                },
                {
                  id: 'iso-industrial',
                  title: 'ISO 3691-4 Industrial AGV/AMR Safety Pack',
                  price: '$4,999',
                  desc: 'Personnel detection safety zones, emergency brake stopping distance formal bounds, and CE Marking machinery directive sign-off.',
                  standards: ['ISO 3691-4', 'ANSI/RIA R15.08', 'EN 1525']
                }
              ].map(pack => {
                const isPurchased = purchasedAudits.includes(pack.id);
                return (
                  <div
                    key={pack.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      selectedAuditForPreview === pack.id
                        ? 'bg-slate-950 border-emerald-500/70 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-extrabold text-white font-mono">{pack.price}</span>
                        {isPurchased && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded font-bold">
                            Licensed
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs text-white leading-tight">{pack.title}</h4>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{pack.desc}</p>

                      <div className="flex flex-wrap gap-1">
                        {pack.standards.map((std, i) => (
                          <span key={i} className="text-[9px] px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300">
                            {std}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedAuditForPreview(pack.id)}
                        className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Inspect Dossier
                      </button>
                      <button
                        onClick={() => {
                          if (!isPurchased) setPurchasedAudits([...purchasedAudits, pack.id]);
                        }}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          isPurchased
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {isPurchased ? 'Download' : 'Purchase'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STREAM 3: Synthetic Data & Policy Store */}
      {activeTab === 'synthetic-data' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  Pre-Trained Robotic Policies & LeRobot Synthetic Datasets
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  High-fidelity photorealistic and physics-grounded trajectories with domain-randomized friction, lighting, and sensor noise.
                </p>
              </div>
              <span className="text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
                100,000+ Verified Demonstrations
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: 'dataset-defense-vio',
                  title: 'GPS-Denied Visual Inertial Odometry (VIO)',
                  trajectories: '25,000 Episodes',
                  size: '480 GB (HDF5 + ROS2 bag)',
                  price: '$18,500',
                  application: 'Subterranean tunnels, urban canyons, dynamic jamming'
                },
                {
                  id: 'dataset-bimanual-surgery',
                  title: 'Bimanual Micro-Suture Tactile Traces',
                  trajectories: '50,000 Traces',
                  size: '1.2 TB (6-DoF F/T Sensors)',
                  price: '$14,000',
                  application: 'Sub-millimeter tension control, soft tissue deformation'
                },
                {
                  id: 'dataset-warehouse-bin',
                  title: 'Universal Deformable Bin Picking',
                  trajectories: '100,000 Trajectories',
                  size: '850 GB (RGB-D + Depth)',
                  price: '$4,500',
                  application: 'High-speed parcel picking, plastic polybags, shrinkwrap'
                }
              ].map(ds => {
                const isLicensed = licensedDatasets.includes(ds.id);
                return (
                  <div key={ds.id} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-cyan-400 font-extrabold font-mono text-base">{ds.price}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{ds.trajectories}</span>
                      </div>
                      <h4 className="font-bold text-xs text-white leading-tight">{ds.title}</h4>
                      <p className="text-[11px] text-slate-400 font-sans">{ds.application}</p>
                      <div className="text-[10px] text-slate-500 font-mono">Format: {ds.size}</div>
                    </div>

                    <button
                      onClick={() => {
                        if (!isLicensed) setLicensedDatasets([...licensedDatasets, ds.id]);
                      }}
                      className={`w-full py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        isLicensed
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                      }`}
                    >
                      {isLicensed ? 'License Active (S3 Access Ready)' : `License Dataset (${ds.price})`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STREAM 4: Physical Hardware-in-the-Loop Kits */}
      {activeTab === 'hardware-dongle' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Box className="w-4 h-4 text-amber-400" />
                  Physical WebSerial Hardware Gateway Kits
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Plug-and-play USB-C hardware bridges for live CAN-FD, RS-485, and EtherCAT sniffer telemetry.
                </p>
              </div>
              <span className="text-xs text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                Direct Hardware
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setSelectedDongleTier('standard')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedDongleTier === 'standard'
                    ? 'bg-slate-950 border-amber-500 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-amber-400 font-mono font-bold text-sm">$1,299</span>
                  <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-slate-400">Lab Grade</span>
                </div>
                <h4 className="font-bold text-xs text-white">AIGENESIS Bridge Pro</h4>
                <p className="text-[11px] text-slate-400 font-sans mt-1">Dual CAN-FD (5 Mbps) + isolated RS-485 with real-time hardware timestamping.</p>
              </div>

              <div
                onClick={() => setSelectedDongleTier('extreme')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedDongleTier === 'extreme'
                    ? 'bg-slate-950 border-amber-500 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-amber-400 font-mono font-bold text-sm">$2,499</span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">Industrial Rugged</span>
                </div>
                <h4 className="font-bold text-xs text-white">AIGENESIS Extreme HiL Rig</h4>
                <p className="text-[11px] text-slate-400 font-sans mt-1">MIL-STD-810H CNC aluminum enclosure with optical isolation, EtherCAT slave, and 1000 Hz hardware watchdog.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
              <label className="text-slate-400 text-[10px] uppercase font-bold block">Shipping Country & Customs Classification:</label>
              <input
                type="text"
                value={shippingCountry}
                onChange={e => setShippingCountry(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
              <div className="text-[10px] text-slate-500">HS Code: 8471.80.00 (Automatic Data Processing Units). Dispatched via DHL Express (2-3 business days).</div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-white">Order Summary</h4>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Selected Hardware:</span>
                  <span className="text-white font-bold">{selectedDongleTier === 'standard' ? 'AIGENESIS Bridge Pro' : 'AIGENESIS Extreme HiL Rig'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Unit Price:</span>
                  <span className="text-amber-400 font-bold">{selectedDongleTier === 'standard' ? '$1,299' : '$2,499'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DHL Express Priority:</span>
                  <span className="text-emerald-400 font-bold">FREE (Included)</span>
                </div>
              </div>
            </div>

            {dongleOrdered ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1 inline mr-1" />
                Hardware order dispatched to fulfillment center. DHL tracking will arrive at corporate email.
              </div>
            ) : (
              <button
                onClick={() => setDongleOrdered(true)}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-lg shadow-amber-600/20"
              >
                Place Commercial Hardware Order
              </button>
            )}
          </div>
        </div>
      )}

      {/* STREAM 5: Silicon GPU Tokens */}
      {activeTab === 'gpu-tokens' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  Cloud GPU Compilation & Quantization Tokens
                </h3>
                <span className="text-xs text-slate-400 font-sans">NVIDIA H100 SXM5 / B200 compilation cluster hours</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase">Balance</span>
                <span className="text-purple-400 font-bold font-mono text-sm">{tokenBalance.toFixed(1)} GPU Hrs</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { hours: 10, price: '$450', perHr: '$45/hr' },
                { hours: 50, price: '$1,850', perHr: '$37/hr', popular: true },
                { hours: 100, price: '$3,200', perHr: '$32/hr' }
              ].map(pack => (
                <div
                  key={pack.hours}
                  onClick={() => setSelectedTokenPack(pack.hours)}
                  className={`p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                    selectedTokenPack === pack.hours
                      ? 'bg-slate-950 border-purple-500 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <span className="font-bold text-xs text-white block">{pack.hours} Hours</span>
                  <span className="text-purple-400 font-extrabold text-sm font-mono block mt-1">{pack.price}</span>
                  <span className="text-[9px] text-slate-500">{pack.perHr}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setTokenBalance(prev => prev + selectedTokenPack)}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
            >
              Add {selectedTokenPack} GPU Hours to Organization Account
            </button>
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">Estimated GPU Burn-Rate Reference</h3>
              <span className="text-[10px] text-slate-400">FP8 Quantization</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-white font-bold block">OpenVLA-7B (TensorRT-LLM FP8 Engine)</span>
                  <span className="text-[10px] text-slate-400">Target: Jetson AGX Orin 64GB</span>
                </div>
                <span className="text-purple-400 font-mono font-bold">1.4 GPU Hours</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-white font-bold block">Physical Intelligence π0 (Flow-Matching Policy)</span>
                  <span className="text-[10px] text-slate-400">Target: Tenstorrent Wormhole n150</span>
                </div>
                <span className="text-purple-400 font-mono font-bold">2.8 GPU Hours</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-white font-bold block">Octo-Base 93M (Hailo Dataflow Compiler)</span>
                  <span className="text-[10px] text-slate-400">Target: Hailo-8 M.2 Module</span>
                </div>
                <span className="text-purple-400 font-mono font-bold">0.6 GPU Hours</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STREAM 6: Sovereign Air-Gapped SCIF License */}
      {activeTab === 'air-gapped' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" />
                Sovereign Air-Gapped On-Premises Enterprise License
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Zero external telemetry egress. Complete platform deployment inside classified SCIFs, air-gapped clusters, or private cloud VPCs.
              </p>
            </div>
            <span className="text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30">
              Tier 4 SCIF Compliant
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-indigo-400 font-mono text-[10px] uppercase font-bold">1. Zero Cloud Egress</span>
              <h4 className="text-white font-bold font-mono">Air-Gapped Kubernetes & Podman</h4>
              <p className="text-slate-400 text-xs">Self-contained OCI container images with local physics solvers and offline license keys. No outbound ping ever leaves your firewall.</p>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-indigo-400 font-mono text-[10px] uppercase font-bold">2. Dedicated Field Architect</span>
              <h4 className="text-white font-bold font-mono">Named Senior Robotics Lead</h4>
              <p className="text-slate-400 text-xs">Guaranteed 15-minute SLA with an assigned physical AI architect to assist your internal team with hardware bringup and calibration.</p>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-indigo-400 font-mono text-[10px] uppercase font-bold">3. Unlimited Seats & Fleet</span>
              <h4 className="text-white font-bold font-mono">Uncapped Sim-to-Real Swarms</h4>
              <p className="text-slate-400 text-xs">Simulate, certify, and orchestrate up to 500+ physical robots without per-seat or compute overage charges.</p>
            </div>
          </div>

          <div className="p-6 bg-slate-950 border border-indigo-500/40 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block font-mono">Enterprise Air-Gapped Investment:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white font-mono">£150,000 – £350,000</span>
                <span className="text-xs text-slate-400">/ year (Billed Annually via Wire/PO)</span>
              </div>
            </div>

            {airGappedRequested ? (
              <div className="text-emerald-400 text-xs font-bold flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4" /> Enterprise Air-Gapped SCIF deployment packet dispatched to engineering leadership.
              </div>
            ) : (
              <button
                onClick={() => setAirGappedRequested(true)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                Request Sovereign Air-Gapped Deployment Dossier
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
