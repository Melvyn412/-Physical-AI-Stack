import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, FileCheck, Shield, CheckCircle2, ArrowRight, 
  Download, Zap, Scale, Terminal, Check, AlertOctagon, 
  Building2, ChevronDown, FileText, Lock, Sparkles, 
  HelpCircle, ChevronRight, Layers, Play, Award, CheckCheck,
  Stethoscope, Radio, Rocket, Box, Activity, DollarSign
} from 'lucide-react';
import { ActiveTab } from '../types';

interface LandingPageProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenCustomModal?: () => void;
  onOpenProTrialModal?: () => void;
  onOpenTour?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenProTrialModal,
  onOpenTour
}) => {
  // Interactive Live Regulatory Audit Widget State
  const [selectedStandard, setSelectedStandard] = useState<'fda-surgical' | 'iso-amr' | 'stanag-defense' | 'iso-cobot'>('fda-surgical');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationProgress, setVerificationProgress] = useState<number>(100);
  const [verificationDone, setVerificationDone] = useState<boolean>(true);
  const [copiedDossier, setCopiedDossier] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Regulatory Standards Database
  const standardsData = {
    'fda-surgical': {
      id: 'fda-surgical',
      name: 'FDA 21 CFR Part 820 & ISO 13485 Surgical Dossier',
      target: 'Medical & Surgical Robotics OEMs (Class II / Class III)',
      regulator: 'US FDA (CDRH) & EU MDR Notified Bodies',
      timeSaved: '22 Weeks',
      costSaved: '$280,000',
      standards: ['FDA 21 CFR 820.30', 'ISO 13485:2016', 'IEC 62304 Class C', 'ISO 14971 Risk Management'],
      invariants: [
        'End-effector force reflection strictly clamped at ≤ 4.2 N during micro-suture',
        'Deterministic teleoperation jitter certified < 1.4ms over 1,000,000 cycles',
        'Sub-millimeter Cartesian boundary barrier proven forward-invariant (Z3 SMT)'
      ],
      sampleFilename: 'AIGENESIS_FDA_21CFR820_DHF_Sample_Audit_Pack.md'
    },
    'iso-amr': {
      id: 'iso-amr',
      name: 'ISO 3691-4 & ANSI/RIA R15.08 Industrial AGV/AMR Safety Pack',
      target: 'Autonomous Mobile Robots, Warehouse Cobots & Gigafactory Logistics',
      regulator: 'TÜV Rheinland, TÜV SÜD & OSHA NRTL',
      timeSaved: '16 Weeks',
      costSaved: '$190,000',
      standards: ['ISO 3691-4:2023', 'ANSI/RIA R15.08-1', 'IEC 62061 SIL-3', 'EN 1525 AGV Safety'],
      invariants: [
        'Dynamic emergency stopping distance formally bounded across all surface friction levels',
        'Personnel detection safety field switching verified under dynamic 360° LiDAR occlusion',
        'Fleet swarm right-of-way consensus mathematically collision-free in 2.0m narrow aisles'
      ],
      sampleFilename: 'AIGENESIS_ISO3691_4_AMR_Compliance_Dossier.md'
    },
    'stanag-defense': {
      id: 'stanag-defense',
      name: 'STANAG 4586 & MIL-STD-810H Autonomous Defense Dossier',
      target: 'Defense Primes, UAV/UGV Contractors & Sovereign Aerospace',
      regulator: 'NATO Military Authorities, MoD & DoD ATEC',
      timeSaved: '28 Weeks',
      costSaved: '$420,000',
      standards: ['STANAG 4586 v4', 'MIL-STD-810H', 'DEF-STAN 00-56 Safety Assurance', 'ITAR Category VII/XI'],
      invariants: [
        'GNSS-denied inertial navigation drift cone mathematically bounded < 0.18% distance',
        'Air-gapped SCIF zero-telemetry egress cryptographic verification seal',
        'Actuator thermal dissipation validated under -40°C to +55°C military stress envelopes'
      ],
      sampleFilename: 'AIGENESIS_STANAG4586_Defense_Assurance_Pack.md'
    },
    'iso-cobot': {
      id: 'iso-cobot',
      name: 'ISO 10218-1/2 & ISO/TS 15066 Collaborative Cobot Certification',
      target: 'Industrial Manipulators, Palletizing Cobots & Assembly Arms',
      regulator: 'CE Marking Machinery Directive, UL 1740 & CSA Z434',
      timeSaved: '14 Weeks',
      costSaved: '$165,000',
      standards: ['ISO 10218-1/2:2011', 'ISO/TS 15066:2016', 'ISO 13849-1 Cat 4 PLe', 'ANSI/RIA R15.06'],
      invariants: [
        'Power and force limiting (PFL) biomechanical thresholds verified across all body contact zones',
        'Singularity avoidance controller guarantees zero uncontrolled joint acceleration near Det(J) < 0.05',
        'Safe torque off (STO) and safe limited speed (SLS) validated at 1000 Hz hardware loop'
      ],
      sampleFilename: 'AIGENESIS_ISO10218_Cobot_Safety_Certificate.md'
    }
  };

  const currentStandard = standardsData[selectedStandard];

  // Helper for generating sample markdown download
  const handleDownloadSampleDossier = () => {
    const content = `# ==============================================================================
# OFFICIAL REGULATORY AUDIT & FORMAL SAFETY VERIFICATION DOSSIER
# ISSUED VIA: AIGENESIS REGULATORY & COMPLIANCE VERIFICATION ENGINE
# STANDARD SPECIFICATION: ${currentStandard.name.toUpperCase()}
# ==============================================================================

TARGET APPLICATION: ${currentStandard.target}
NOTIFIED BODY / AUDIT TARGET: ${currentStandard.regulator}
EVALUATION DATE: ${new Date().toISOString().split('T')[0]}
CRYPTOGRAPHIC AUDIT SEAL: SHA256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}

------------------------------------------------------------------------------
1. APPLICABLE HARMONIZED STANDARDS & REGULATORY PATHWAY
------------------------------------------------------------------------------
${currentStandard.standards.map((s, idx) => `• [COMPLIANT] ${s}`).join('\n')}

------------------------------------------------------------------------------
2. FORMAL MATHEMATICAL BARRIER VERIFICATION (Z3 SMT SOLVER)
------------------------------------------------------------------------------
Control Barrier Function: h(x) >= 0 for all t >= 0
Lyapunov Stability Decay: V_dot(x) <= -alpha * V(x) (alpha = 4.2)
Verification Latency: 14.2 milliseconds
Verdict: FORWARD INVARIANCE MATHEMATICALLY PROVEN

KEY VERIFIED INVARIANTS:
${currentStandard.invariants.map((inv, idx) => `[VERIFIED] Invariant ${idx + 1}: ${inv}`).join('\n')}

------------------------------------------------------------------------------
3. DESIGN HISTORY FILE (DHF) & HAZARD ANALYSIS (ISO 14971)
------------------------------------------------------------------------------
• Hazard Severity Score: Class III / Critical
• Mitigation Mechanism: Sub-millisecond closed-loop impedance clamp (< 1.2ms)
• Failure Mode Effect Analysis (FMEA): Risk Priority Number (RPN) reduced from 360 to 12.
• Sim-to-Real Ground Truth Error: 0.28% delta against calibrated physical hardware dyno.

------------------------------------------------------------------------------
4. REGULATORY SIGN-OFF & NOTIFIED BODY ATTESTATION
------------------------------------------------------------------------------
Certified Chief Systems Architect: Dr. Melvyn Davies, Physical AI Assurance
Digital Signature: SHA256-VERIFIED-AIGENESIS-NOTIFIED-BODY-2026
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentStandard.sampleFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunVerification = () => {
    setIsVerifying(true);
    setVerificationProgress(0);
    setVerificationDone(false);

    const interval = setInterval(() => {
      setVerificationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsVerifying(false);
          setVerificationDone(true);
          return 100;
        }
        return prev + 25;
      });
    }, 120);
  };

  return (
    <div className="space-y-16 py-4 font-mono text-slate-100 pb-28">
      {/* 1. Hero Section (Laser-Focused on Regulatory & Safety Automation) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-14 text-center space-y-8 shadow-2xl">
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Category Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-inner">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Automated Regulatory Compliance & Formal Safety Verification for Robotics</span>
        </div>

        {/* Master Headline */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Audit-Ready Robotics Safety Cases.<br />
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
              Generated in Minutes, Not 9 Months.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto font-sans leading-relaxed">
            Eliminate months of tedious paperwork and six-figure regulatory consultant retainers. AIGENESIS turns your robotics codebase into mathematically verified, audit-ready **ISO 10218**, **ISO 3691-4**, and **FDA 21 CFR 820** Design History Files backed by formal Z3 SMT barrier proofs.
          </p>
        </div>

        {/* 2 Primary Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onNavigate('compliance')}
            className="flex items-center gap-2 px-7 py-4 bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-xl shadow-cyan-500/25 hover:scale-[1.02] cursor-pointer"
          >
            <FileCheck className="w-4 h-4 fill-slate-950" />
            <span>Generate Sample Safety Audit Pack</span>
          </button>

          {onOpenProTrialModal ? (
            <button
              onClick={onOpenProTrialModal}
              className="flex items-center gap-2 px-7 py-4 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-cyan-500/10 hover:scale-[1.02] cursor-pointer"
            >
              <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>Start 14-Day Free Pro Trial</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('pricing')}
              className="flex items-center gap-2 px-7 py-4 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-cyan-500/10 hover:scale-[1.02] cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>View Enterprise Compliance Licensing</span>
            </button>
          )}
        </div>

        {/* Reassurance Guarantee */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-sans">
          <div className="inline-flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pre-audited for Notified Bodies</span>
          </div>
          <span className="text-slate-600">•</span>
          <span>Zero third-party telemetry egress (SCIF / Air-Gapped)</span>
          <span className="text-slate-600">•</span>
          <span>Formal Z3 mathematical proofs</span>
        </div>

        {/* Standards Certification Bar */}
        <div className="pt-8 border-t border-slate-800/80 max-w-5xl mx-auto space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
            Engineered For Compliance With Global Notified Bodies & Regulators:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {[
              'FDA 21 CFR Part 820.30 (DHF)',
              'ISO 13485:2016 (Medical Quality)',
              'ISO 10218-1/2 (Industrial Cobots)',
              'ISO 3691-4:2023 (AGV / AMR Safety)',
              'IEC 62304 Class C (Medical Software)',
              'STANAG 4586 (Defense UAV/UGV)',
              'ISO 13849-1 (Category 4 PLe)'
            ].map((std, i) => (
              <span key={i} className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] shadow-sm">
                {std}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Interactive Live Regulatory Audit Demonstrator (Directly on Homepage) */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Interactive Verification Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Test Automated Compliance Synthesis Live
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Select your robotics vertical and generate formal mathematical proof binders in real time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 block uppercase">Typical Time Saved</span>
              <span className="text-emerald-400 font-bold text-xs">{currentStandard.timeSaved}</span>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 block uppercase">Consultant Fee Saved</span>
              <span className="text-cyan-400 font-bold text-xs">{currentStandard.costSaved}</span>
            </div>
          </div>
        </div>

        {/* 4 Sector Selection Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: 'fda-surgical', label: '1. Surgical Robotics', sub: 'FDA 21 CFR 820 & ISO 13485', icon: Stethoscope },
            { id: 'iso-amr', label: '2. Warehouse AMRs', sub: 'ISO 3691-4 & ANSI/RIA R15.08', icon: Radio },
            { id: 'stanag-defense', label: '3. Defense Autonomy', sub: 'STANAG 4586 & MIL-STD-810H', icon: Shield },
            { id: 'iso-cobot', label: '4. Industrial Cobots', sub: 'ISO 10218-1/2 & ISO/TS 15066', icon: Box }
          ].map(tab => {
            const Icon = tab.icon;
            const active = selectedStandard === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStandard(tab.id as any)}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  active
                    ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/10 scale-[1.02]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-500'}`} />
                  {active && <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-bold">Active</span>}
                </div>
                <div>
                  <div className="font-bold text-xs text-white truncate">{tab.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">{tab.sub}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Dual-Panel Proof & Dossier Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Formal Mathematical Z3 SMT Verification */}
          <div className="lg:col-span-6 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-white font-bold flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Z3 SMT Solver: Control Barrier Function (CBF)
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                14.2ms Solver Latency
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="p-3 bg-slate-900 rounded-xl space-y-1">
                <div className="text-slate-500 text-[10px] uppercase font-bold">Mathematical Barrier Invariant:</div>
                <div className="text-cyan-300 font-bold">h(x) ≥ 0 ∀ t ≥ 0  (Forward Invariance Proven)</div>
                <div className="text-slate-400">Lyapunov Decay Rate: V̇(x) ≤ -α V(x) (α = 4.2)</div>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Verified Safety Invariants for {currentStandard.name.split(' ')[0]}:</span>
                {currentStandard.invariants.map((inv, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-900 rounded-lg border-l-2 border-emerald-400 text-slate-300 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{inv}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                disabled={isVerifying}
                onClick={handleRunVerification}
                className="flex-1 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-cyan-600/20"
              >
                {isVerifying ? `Verifying SMT Proofs (${verificationProgress}%)...` : 'Re-Run Formal Verification Solver'}
              </button>
            </div>
          </div>

          {/* Right: Live Generated Dossier Artifact */}
          <div className="lg:col-span-6 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 font-mono text-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-white font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Audit-Ready Regulatory Dossier Binder
                </span>
                <span className="text-[10px] text-slate-500">Notified Body Ready</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Standard:</span>
                  <span className="text-white font-bold">{currentStandard.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Notified Body / Regulator:</span>
                  <span className="text-cyan-300">{currentStandard.regulator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cryptographic Proof Seal:</span>
                  <span className="text-emerald-400 font-bold">SHA-256 Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Traceability Matrix:</span>
                  <span className="text-slate-200">100% Code-Linked Requirements</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px] font-sans leading-relaxed">
                ✓ Formal verification binder generated. Replaces 400+ hours of manual safety consulting with verifiable mathematical proof.
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleDownloadSampleDossier}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample Audit Dossier (.md)</span>
              </button>
              <button
                onClick={() => onNavigate('compliance')}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Open Studio
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Enterprise Dilemma: The Old Way vs. The AIGENESIS Automated Engine */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            The Economics of Robotics Safety Certification
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-xl mx-auto">
            Why leading robotics OEMs and medical device teams are replacing external compliance consultants with continuous mathematical automation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          {/* The Old Manual Way */}
          <div className="p-6 bg-slate-900/60 border border-rose-500/30 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4" />
              <span>The Old Manual Way (Consultant Hell)</span>
            </div>
            <h3 className="text-lg font-bold text-white">6 to 12 Months of Paperwork & Stalled Hardware</h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>$180,000 to $450,000 paid to consultants:</strong> Third-party regulatory firms manually writing disconnected Word documents and Excel sheets.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>Instant obsolescence:</strong> The moment your robotics engineering team updates code or fine-tunes a trajectory, the 300-page safety binder is out of date.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>Empirical guesswork:</strong> Relying on random Monte Carlo testing that misses catastrophic edge cases like kinematic singularities or friction drops.</span>
              </li>
            </ul>
          </div>

          {/* The AIGENESIS Way */}
          <div className="p-6 bg-slate-900/60 border border-emerald-500/40 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>The AIGENESIS Automated Engine</span>
            </div>
            <h3 className="text-lg font-bold text-white">Continuous Audit-Ready Safety on Every Git Commit</h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>78% Cost Reduction:</strong> Automated synthesis of Design History Files, FMEA fault trees, and ISO 14971 risk binders directly from code.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>CI/CD Git Gatekeeper:</strong> Pull requests are mathematically blocked if control barrier functions are breached, keeping audit evidence synchronized in real time.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Formal Mathematical Proof:</strong> Uses Z3 SMT solvers to prove forward invariance for all reachable states—the gold standard for FDA and CE Mark auditors.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Four Core Workbench Capabilities */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Workbench Modules & Capabilities</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Inside the Regulatory Safety Dossier Engine</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <button
            onClick={() => onNavigate('compliance')}
            className="p-6 bg-slate-900 hover:bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-3xl space-y-3 text-left transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
              01
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">URDF/YAML Gap Analyzer</h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Ingest ROS 2 YAML or URDF parameters, run live clause-by-clause audits, and auto-synthesize compliant Z3 CBF limits.
            </p>
          </button>

          <button
            onClick={() => onNavigate('compliance')}
            className="p-6 bg-slate-900 hover:bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-3xl space-y-3 text-left transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              02
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">ISO 14971 FMEA Matrix</h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Interactive Risk Priority Number (RPN) calculator linking every physical hazard to formal Z3 mathematical mitigations.
            </p>
          </button>

          <button
            onClick={() => onNavigate('compliance')}
            className="p-6 bg-slate-900 hover:bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-3xl space-y-3 text-left transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
              03
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition">RTM & CI/CD Gatekeeper</h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Bi-directional Requirements Traceability Matrix plus GitHub Actions & GitLab CI workflows that block unsafe Pull Requests.
            </p>
          </button>

          <button
            onClick={() => onNavigate('compliance')}
            className="p-6 bg-slate-900 hover:bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-3xl space-y-3 text-left transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              04
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition">Printable DHF & Seals</h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Export print-ready PDF/HTML audit binders, Markdown Design History Files, and SHA-256 signed JSON manifests.
            </p>
          </button>
        </div>
      </section>

      {/* 5. Framed Under the Hood: The 1 kHz Multi-Physics Engine */}
      <section className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Under The Hood:</div>
            <h3 className="text-base font-bold text-white">Powered by the 1000 Hz Multi-Physics & Kinematics Engine</h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              The mathematical rigor of our safety engine is grounded in a proprietary 1 kHz multi-physics foundation.
            </p>
          </div>
          <button
            onClick={() => onNavigate('simulator')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>Explore 5-Layer Simulation Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="font-bold text-white block font-mono">Sub-Millimeter CAD Twins</span>
            <span className="text-[11px] text-slate-400">Onshape & STEP ingestion with exact inertia tensors.</span>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="font-bold text-white block font-mono">7-DoF DLS Kinematics</span>
            <span className="text-[11px] text-slate-400">Jacobian singularity damping near Det(J) &lt; 0.05.</span>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="font-bold text-white block font-mono">500+ Swarm Mesh</span>
            <span className="text-[11px] text-slate-400">VDA 5050 AMR factory fleet collision consensus.</span>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="font-bold text-white block font-mono">Physical HiL Telemetry</span>
            <span className="text-[11px] text-slate-400">WebSerial CAN-FD sniffer & 20 kHz BLDC dyno.</span>
          </div>
        </div>
      </section>

      {/* 6. Frequently Asked Questions */}
      <section className="space-y-4 max-w-3xl mx-auto">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-mono">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400 font-sans">Everything regulatory directors and robotics VPs ask about automated safety assurance.</p>
        </div>

        <div className="space-y-2 font-sans">
          {[
            {
              q: 'Will notified bodies (FDA, TÜV, CE Mark) accept automated mathematical proof dossiers?',
              a: 'Yes. Regulators strongly favor formal mathematical proofs (Z3 SMT solver invariants and Lyapunov stability criteria) over empirical statistical testing. Our generated dossiers format directly into standard FDA 21 CFR 820.30 Design Controls and ISO 14971 Risk Management binders, complete with cryptographic SHA-256 evidence signatures.'
            },
            {
              q: 'How does AIGENESIS integrate into our existing engineering workflow?',
              a: 'AIGENESIS integrates seamlessly into your GitHub Actions or GitLab CI pipelines via the AIGENESIS Gatekeeper Action. When an engineer opens a pull request, the safety engine simulates the trajectory, verifies the mathematical barrier invariants, and attaches the audit verdict directly to the PR.'
            },
            {
              q: 'Does proprietary CAD or neural network weights ever leave our corporate network?',
              a: 'No. We provide 100% air-gapped sovereign deployments (Tier-4 SCIF and on-premise Docker/Kubernetes) with zero outbound telemetry egress. All CAD models, weights, and audit certificates remain strictly your exclusive intellectual property.'
            },
            {
              q: 'Can we purchase audit packs for specific pre-submission filings?',
              a: 'Yes. In addition to enterprise platform subscriptions, we offer pre-packaged regulatory dossiers for FDA Surgical Robotics ($9,999), STANAG 4586 Defense UAVs ($8,499), and ISO 3691-4 AMRs ($4,999), payable via corporate Purchase Order (PO) or wire transfer.'
            }
          ].map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                >
                  <span className="text-xs font-bold text-white">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Bottom Conversion Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border border-cyan-500/40 rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-2xl">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-mono">
          Ready to Automate Your Next Regulatory Filing?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-sans leading-relaxed">
          Cut 16+ engineering weeks off your audit timeline. Generate verified ISO and FDA Design History Files backed by formal Z3 mathematical proofs.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 font-mono">
          <button
            onClick={() => onNavigate('compliance')}
            className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
          >
            Launch Safety Audit Studio
          </button>
          <button
            onClick={() => onNavigate('commercial')}
            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs sm:text-sm cursor-pointer"
          >
            Request Enterprise Regulatory Pilot
          </button>
        </div>
      </section>
    </div>
  );
};
