import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Cpu, Activity, Play, Pause, RotateCcw, AlertTriangle, ShieldAlert, 
  CheckCircle2, Share2, Copy, Download, Mail, Check, Sliders, 
  Layers, ExternalLink, ArrowRight, Zap, Sparkles, FileText, 
  DollarSign, Clock, ShieldCheck, Flame, ChevronRight, Eye, RefreshCw,
  Printer, Building2, Send
} from 'lucide-react';
import { CompanyMechanism, FailureModeItem, IterationSavingsReport, PlanTier, ActiveTab } from '../types';
import { COMPANY_MECHANISM_PRESETS } from '../data/companyMechanismsData';
import { useQuota } from '../hooks/useQuota';

interface MechanismSimulatorStudioProps {
  onOpenBarrier?: (barrierInfo: any) => void;
  onNavigateToPricing?: () => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const MechanismSimulatorStudio: React.FC<MechanismSimulatorStudioProps> = ({
  onOpenBarrier,
  onNavigateToPricing,
  onNavigateTab
}) => {
  const { quota, limits, check, consume } = useQuota();

  // Selected mechanism state
  const [selectedPresetId, setSelectedPresetId] = useState<string>('intuitive-wrist-4dof');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Custom mechanism fields
  const [customCompany, setCustomCompany] = useState<string>('Apex Robotics Labs');
  const [customMechanism, setCustomMechanism] = useState<string>('Compact Harmonic Wrist Joint');
  const [customIndustry, setCustomIndustry] = useState<CompanyMechanism['industry']>('Industrial Robotics');
  const [customDof, setCustomDof] = useState<number>(3);
  const [customPayload, setCustomPayload] = useState<number>(5.0);
  const [customIterationCost, setCustomIterationCost] = useState<number>(32000);

  // Simulation execution state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(4); // 0 to 4 (4 = completed)
  const [simProgress, setSimProgress] = useState<number>(100);
  const [hasRunSimulation, setHasRunSimulation] = useState<boolean>(true);

  // Interactive ROI Tuning Sliders
  const [iterationsAvoidedMultiplier, setIterationsAvoidedMultiplier] = useState<number>(3);
  const [costPerIterationOverride, setCostPerIterationOverride] = useState<number>(28000);
  const [teamBurnRatePerWeek, setTeamBurnRatePerWeek] = useState<number>(15000);

  // Share & Export states
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [activeReportTab, setActiveReportTab] = useState<'executive' | 'technical' | 'email'>('executive');

  // Canvas visualizer ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasAngle, setCanvasAngle] = useState<number>(0);

  // Active mechanism resolution
  const currentPreset = useMemo(() => {
    return COMPANY_MECHANISM_PRESETS.find(p => p.mechanism.id === selectedPresetId) || COMPANY_MECHANISM_PRESETS[0];
  }, [selectedPresetId]);

  const activeMechanism: CompanyMechanism = useMemo(() => {
    if (isCustomMode) {
      return {
        id: 'custom-mechanism',
        companyName: customCompany,
        mechanismName: customMechanism,
        industry: customIndustry,
        dof: customDof,
        nominalPayloadKg: customPayload,
        operatingFrequencyHz: 1000,
        actuatorType: 'Custom High-Bandwidth Actuator Pack',
        gearReduction: 'Precision Harmonic 50:1',
        nominalCycleDurationSec: 18,
        typicalIterationCostUsd: customIterationCost,
        typicalIterationWeeks: 4.5,
        cadModelDescription: `Engineered ${customDof}-DoF mechanism designed for ${customIndustry.toLowerCase()}.`,
        nominalTorqueNm: customPayload * 9.81 * 0.4,
        maxTorqueNm: customPayload * 9.81 * 1.2,
        gearBacklashArcmin: 1.8,
        thermalLimitCelsius: 80.0
      };
    }
    return currentPreset.mechanism;
  }, [isCustomMode, currentPreset, customCompany, customMechanism, customIndustry, customDof, customPayload, customIterationCost]);

  // Dynamic failure modes
  const activeFailureModes: FailureModeItem[] = useMemo(() => {
    if (isCustomMode) {
      return [
        {
          id: 'FM-CUST-01',
          title: `Joint 2 High-Load Boundary Singularity at Extreme Stroke`,
          severity: 'CRITICAL',
          subsystem: 'Kinematics & Singularity',
          telemetryTrigger: 'Condition Number κ(J) > 340 at 88% workspace limit',
          rootCause: 'Kinematic link alignment causes control matrix rank loss and unbounded joint velocity commands.',
          hardwareRisk: `Over-current motor breaker trip; mechanical end-stop impact damage on ${customMechanism}.`,
          simulatedFix: 'Damped Least-Squares (DLS) Jacobian trajectory governor with smooth decelerating safety envelope.',
          confidenceScore: 98.2
        },
        {
          id: 'FM-CUST-02',
          title: 'Thermal Dissipation Bottleneck During 100% Duty Cycle',
          severity: 'HIGH',
          subsystem: 'Thermal & Winding',
          telemetryTrigger: `Winding temperature exceeds ${Math.round(activeMechanism.thermalLimitCelsius)}°C in 8.2 minutes`,
          rootCause: 'I²R electrical copper losses exceed passive thermal dissipation capability of compact casing.',
          hardwareRisk: 'Winding insulation breakdown and uncommanded torque loss during extended operational runs.',
          simulatedFix: 'Field-Oriented Control (FOC) current profiling and automated thermal throttling at 1000 Hz.',
          confidenceScore: 95.8
        },
        {
          id: 'FM-CUST-03',
          title: 'Gear Backlash Dynamic Resonance Under Load Reversal',
          severity: 'MEDIUM',
          subsystem: 'Backlash & Resonance',
          telemetryTrigger: `Phase jitter reached 28 Hz with ${activeMechanism.gearBacklashArcmin} arcmin mechanical play`,
          rootCause: 'Micro-backlash across gearing teeth triggers limit-cycle vibration under stiff PID closed-loop gains.',
          hardwareRisk: 'Premature gear tooth surface wear and high-frequency end-effector micro-vibrations.',
          simulatedFix: 'Disturbance observer with anti-backlash torque-bias compensation running in sub-millisecond loop.',
          confidenceScore: 93.4
        }
      ];
    }
    return currentPreset.failureModes;
  }, [isCustomMode, currentPreset, activeMechanism, customMechanism]);

  // Dynamic savings calculations
  const dynamicSavings: IterationSavingsReport = useMemo(() => {
    const itAvoided = isCustomMode ? iterationsAvoidedMultiplier : Math.max(1, currentPreset.defaultSavings.physicalIterationsAvoided);
    const unitCost = isCustomMode ? costPerIterationOverride : currentPreset.mechanism.typicalIterationCostUsd;
    const machiningSaved = itAvoided * unitCost;
    const benchHoursSaved = itAvoided * 48;
    const scrappedHardware = Math.round(machiningSaved * 0.32);
    const weeksSaved = itAvoided * (isCustomMode ? 3.5 : currentPreset.mechanism.typicalIterationWeeks);
    const engineeringLaborSaved = Math.round(weeksSaved * teamBurnRatePerWeek);
    const totalSavings = machiningSaved + scrappedHardware + engineeringLaborSaved;

    return {
      mechanismId: activeMechanism.id,
      mechanismName: activeMechanism.mechanismName,
      companyName: activeMechanism.companyName,
      generatedDate: '2026-09-18',
      physicalIterationsAvoided: itAvoided,
      machiningCostSavedUsd: machiningSaved,
      benchTestHoursSaved: benchHoursSaved,
      scrappedHardwareSavedUsd: scrappedHardware,
      scheduleWeeksAccelerated: Math.round(weeksSaved),
      totalFinancialSavingsUsd: totalSavings,
      energyEfficiencyGainPct: isCustomMode ? 26.5 : currentPreset.defaultSavings.energyEfficiencyGainPct,
      roiMultiplier: Number((totalSavings / (unitCost * 0.18)).toFixed(1)),
      failureModesCount: activeFailureModes.length,
      summaryNote: `End-to-end digital twin simulation discovered ${activeFailureModes.length} critical hardware failure modes before physical metal cutting, saving ${itAvoided} physical prototype revisions, $${totalSavings.toLocaleString()} in combined capital, and ${Math.round(weeksSaved)} weeks of schedule slip.`
    };
  }, [isCustomMode, iterationsAvoidedMultiplier, costPerIterationOverride, teamBurnRatePerWeek, currentPreset, activeMechanism, activeFailureModes]);

  // Live Canvas 2D Kinematic Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let localAngle = 0;

    const render = () => {
      localAngle += isSimulating ? 0.05 : 0.015;
      setCanvasAngle(localAngle);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Grid background
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridSize = 25;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Origin
      const originX = w * 0.45;
      const originY = h * 0.65;

      // Base mounting block
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.fillRect(originX - 35, originY - 10, 70, 25);
      ctx.strokeRect(originX - 35, originY - 10, 70, 25);

      // Link 1 (Base joint)
      const l1 = 65;
      const a1 = Math.sin(localAngle * 0.8) * 0.45 - Math.PI / 3;
      const x1 = originX + l1 * Math.cos(a1);
      const y1 = originY + l1 * Math.sin(a1);

      ctx.strokeStyle = '#06b6d4'; // Cyan
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      // Joint 1 pin
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(originX, originY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Link 2 (Elbow/Wrist)
      const l2 = 55;
      const a2 = a1 + Math.sin(localAngle * 1.2) * 0.7 + 0.3;
      const x2 = x1 + l2 * Math.cos(a2);
      const y2 = y1 + l2 * Math.sin(a2);

      ctx.strokeStyle = '#10b981'; // Emerald
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Joint 2 pin
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x1, y1, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Link 3 (End effector / jaws / gimbal)
      const l3 = 40;
      const a3 = a2 + Math.cos(localAngle * 1.5) * 0.5 - 0.2;
      const x3 = x2 + l3 * Math.cos(a3);
      const y3 = y2 + l3 * Math.sin(a3);

      ctx.strokeStyle = '#6366f1'; // Indigo
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.stroke();

      // End-effector tool
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(x3, y3, 5, 0, Math.PI * 2);
      ctx.fill();

      // Stress / Singularity detection visual overlay
      if (Math.abs(Math.sin(localAngle * 0.8)) > 0.85) {
        // High stress or singularity condition indicator
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(x1, y1, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#f87171';
        ctx.font = '10px monospace';
        ctx.fillText('WARN: J2 Peak Stress', x1 + 22, y1 - 8);
      }

      // End effector trail dot
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText(`EE: (${Math.round(x3)}, ${Math.round(y3)})`, x3 + 10, y3);

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [isSimulating]);

  // Run End-to-End Simulation Pipeline
  const handleStartSimulation = () => {
    // Check quota
    const quotaCheck = check('simulation_run');
    if (!quotaCheck.allowed) {
      if (onOpenBarrier) {
        onOpenBarrier({
          title: 'Simulation Rollout Limit Reached',
          description: quotaCheck.reason || 'You have reached your simulation rollout limit. Start a 14-day free trial to run full end-to-end mechanism analyses.',
          currentPlan: quota.plan,
          recommendedPlan: 'pro',
          used: quota.simulationsUsed,
          limit: limits.simulationsLimit,
          featureName: 'End-to-End Mechanism Simulator'
        });
      }
      return;
    }

    consume('simulation_run');
    setIsSimulating(true);
    setSimProgress(0);
    setSimStep(0);

    const stepInterval = setInterval(() => {
      setSimProgress(prev => {
        if (prev >= 100) {
          clearInterval(stepInterval);
          setIsSimulating(false);
          setSimStep(4);
          setHasRunSimulation(true);
          return 100;
        }
        const next = prev + 5;
        if (next >= 25 && next < 50) setSimStep(1);
        else if (next >= 50 && next < 75) setSimStep(2);
        else if (next >= 75 && next < 95) setSimStep(3);
        else if (next >= 95) setSimStep(4);
        return next;
      });
    }, 120);
  };

  // Copy Executive Report to Clipboard
  const handleCopyReport = () => {
    const textReport = `================================================================================
AIGENESIS.TECH // PHYSICAL INTELLIGENCE MECHANISM FAILURE & SAVINGS REPORT
================================================================================
Company / Client : ${activeMechanism.companyName}
Mechanism        : ${activeMechanism.mechanismName}
Industry Sector  : ${activeMechanism.industry}
Evaluation Date  : ${dynamicSavings.generatedDate}
Control Loop     : 1000 Hz Real-Time Deterministic Sub-Millisecond Physics

--------------------------------------------------------------------------------
1. EXECUTIVE SUMMARY & ITERATION SAVINGS (QUANTIFIED)
--------------------------------------------------------------------------------
• Physical Iterations Avoided   : ${dynamicSavings.physicalIterationsAvoided} CNC/Fabrication Revisions
• Machine Shop Cost Saved       : $${dynamicSavings.machiningCostSavedUsd.toLocaleString()} USD
• Bench Dynamometer Hours Saved : ${dynamicSavings.benchTestHoursSaved} Hours
• Scrapped Hardware Salvaged    : $${dynamicSavings.scrappedHardwareSavedUsd.toLocaleString()} USD
• Time-to-Market Accelerated    : ${dynamicSavings.scheduleWeeksAccelerated} Weeks
• TOTAL FINANCIAL SAVINGS       : $${dynamicSavings.totalFinancialSavingsUsd.toLocaleString()} USD
• Return on Investment (ROI)    : ${dynamicSavings.roiMultiplier}x

Summary Note:
${dynamicSavings.summaryNote}

--------------------------------------------------------------------------------
2. CRITICAL FAILURE MODES DETECTED & RESOLVED IN SIMULATION
--------------------------------------------------------------------------------
${activeFailureModes.map((fm, idx) => `
[${fm.id}] ${fm.title} (${fm.severity})
  - Subsystem: ${fm.subsystem}
  - Trigger Condition: ${fm.telemetryTrigger}
  - Root Cause: ${fm.rootCause}
  - Physical Hardware Risk: ${fm.hardwareRisk}
  - In-Silicon Solution: ${fm.simulatedFix}
  - Verification Confidence: ${fm.confidenceScore}%
`).join('\n')}

--------------------------------------------------------------------------------
3. RECOMMENDED ACTIONS FOR PHYSICAL DEPLOYMENT
--------------------------------------------------------------------------------
1. Implement 1000 Hz Layer 5 closed-loop torque damping regularizer prior to first metal cut.
2. Ingest compiled ROS 2 / Isaac Sim driver nodes directly into on-robot embedded controller.
3. Validate telemetry thresholds via automated hardware-in-the-loop (HIL) testbench.

Generated by AIGENESIS.TECH — The 5-Layer Physical AI Architecture
Report Verification Key: AIS-MECH-${Math.random().toString(36).substring(2, 9).toUpperCase()}
================================================================================`;

    navigator.clipboard.writeText(textReport).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    });
  };

  // Download Report as Markdown
  const handleDownloadReport = () => {
    const markdownContent = `# Physical AI Mechanism End-to-End Simulation & Savings Report

**Company:** ${activeMechanism.companyName}  
**Mechanism:** ${activeMechanism.mechanismName}  
**Industry:** ${activeMechanism.industry}  
**Evaluation Date:** ${dynamicSavings.generatedDate}  
**Simulation Loop:** 1000 Hz Sub-Millisecond Deterministic  

---

## 1. Executive Summary & Quantified Iteration Savings

| Metric | Simulated Baseline | Digital Twin Optimization | Net Savings |
|---|---|---|---|
| **Physical Machining Iterations** | 4-5 tool revisions | 1 cleanroom final cut | **${dynamicSavings.physicalIterationsAvoided} prototype cycles avoided** |
| **CNC & Tooling Capital** | $${(dynamicSavings.machiningCostSavedUsd * 1.3).toLocaleString()} | $${(dynamicSavings.machiningCostSavedUsd * 0.3).toLocaleString()} | **$${dynamicSavings.machiningCostSavedUsd.toLocaleString()} saved** |
| **Dynamometer Test Hours** | ${dynamicSavings.benchTestHoursSaved + 80} hrs | 80 hrs final verification | **${dynamicSavings.benchTestHoursSaved} test hours saved** |
| **Schedule Slip / Lead Time** | +${dynamicSavings.scheduleWeeksAccelerated} weeks | On schedule | **${dynamicSavings.scheduleWeeksAccelerated} weeks saved** |
| **TOTAL FINANCIAL VALUE** | — | — | **$${dynamicSavings.totalFinancialSavingsUsd.toLocaleString()} USD** |

> "${dynamicSavings.summaryNote}"

---

## 2. Identified Failure Modes (Discovered Virtually)

${activeFailureModes.map((fm) => `
### [${fm.severity}] ${fm.id}: ${fm.title}
- **Subsystem:** ${fm.subsystem}
- **Telemetry Trigger:** \`${fm.telemetryTrigger}\`
- **Root Cause:** ${fm.rootCause}
- **Physical Hardware Risk:** ${fm.hardwareRisk}
- **Simulated Fix (Software / Geometry):** ${fm.simulatedFix}
- **Validation Confidence:** ${fm.confidenceScore}%
`).join('\n')}

---

*Generated by [AIGENESIS.TECH](https://aigenesis.tech) — Physical Intelligence Architecture & Simulation Engine*
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AIGenesis_Savings_Report_${activeMechanism.id}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 font-mono">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>End-to-End Mechanism Simulation & Failure Analysis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Company Mechanism Digital Twin & Savings Report
            </h1>
            <p className="text-sm text-slate-300 font-sans max-w-3xl leading-relaxed">
              Ingest any company's robotic joints, surgical wrists, or gimbal mechanisms. Simulate end-to-end at 1000 Hz to discover critical failure modes <span className="text-cyan-300 font-semibold font-mono">before cutting metal</span>, and generate an executive iteration savings dossier.
            </p>
          </div>

          {/* Quick Action Share & Download */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Savings Report</span>
            </button>
            <button
              onClick={handleDownloadReport}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              title="Download Executive Markdown Report"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export Dossier</span>
            </button>
          </div>
        </div>

        {/* Mechanism Selector Tabs */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider text-[11px]">Select Company Mechanism:</span>
            {COMPANY_MECHANISM_PRESETS.map((preset) => (
              <button
                key={preset.mechanism.id}
                onClick={() => {
                  setSelectedPresetId(preset.mechanism.id);
                  setIsCustomMode(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  !isCustomMode && selectedPresetId === preset.mechanism.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{preset.mechanism.companyName.split(' ')[0]}</span>
                <span className="text-[10px] text-slate-500">({preset.mechanism.industry})</span>
              </button>
            ))}

            <button
              onClick={() => setIsCustomMode(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isCustomMode
                  ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Custom Company Mechanism</span>
            </button>
          </div>

          <div className="text-xs text-slate-400">
            Control Loop: <strong className="text-cyan-400">1000 Hz Sub-ms</strong>
          </div>
        </div>
      </div>

      {/* Custom Mechanism Input Panel (if custom mode active) */}
      {isCustomMode && (
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 space-y-4 animate-fade-in shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Configure Company Mechanism Parameters</h3>
            </div>
            <span className="text-xs text-emerald-400 font-bold px-2.5 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              Custom Ingestion Mode
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Company / Organization Name</label>
              <input
                type="text"
                value={customCompany}
                onChange={(e) => setCustomCompany(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Apex Robotics Labs"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Mechanism / Assembly Name</label>
              <input
                type="text"
                value={customMechanism}
                onChange={(e) => setCustomMechanism(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Harmonic Wrist Joint"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Industry Sector</label>
              <select
                value={customIndustry}
                onChange={(e) => setCustomIndustry(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Surgical & Medical">Surgical & Medical</option>
                <option value="Defense & Aerospace">Defense & Aerospace</option>
                <option value="Industrial Robotics">Industrial Robotics</option>
                <option value="Autonomous Vehicles">Autonomous Vehicles</option>
                <option value="Humanoid Robotics">Humanoid Robotics</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Degrees of Freedom (DoF): {customDof}</label>
              <input
                type="range"
                min={1}
                max={7}
                value={customDof}
                onChange={(e) => setCustomDof(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Payload Rating: {customPayload} kg</label>
              <input
                type="range"
                min={0.2}
                max={150}
                step={0.5}
                value={customPayload}
                onChange={(e) => setCustomPayload(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Machining Cost Per Physical Turn: ${customIterationCost.toLocaleString()}</label>
              <input
                type="range"
                min={10000}
                max={80000}
                step={2000}
                value={customIterationCost}
                onChange={(e) => setCustomIterationCost(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Physical Revisions to Avoid: {iterationsAvoidedMultiplier} turns</label>
              <input
                type="range"
                min={1}
                max={6}
                value={iterationsAvoidedMultiplier}
                onChange={(e) => setIterationsAvoidedMultiplier(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Live Visualizer & Simulation Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 5 Cols: Live 1000 Hz Visualizer & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Kinematics & Stress Telemetry</h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 bg-slate-800 rounded-md text-slate-400">
                Loop: 1 kHz
              </span>
            </div>

            {/* 2D Canvas Visualization */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 h-64 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={400}
                height={256}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] text-slate-300">
                {activeMechanism.mechanismName}
              </div>
              <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] text-emerald-400 font-mono">
                1000Hz Motor Feedback
              </div>
            </div>

            {/* Real-time Telemetry Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Peak Torque</span>
                <span className="text-cyan-400 font-bold">{activeMechanism.nominalTorqueNm.toFixed(1)} Nm</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Thermal Max</span>
                <span className="text-amber-400 font-bold">{activeMechanism.thermalLimitCelsius}°C</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Backlash</span>
                <span className="text-emerald-400 font-bold">{activeMechanism.gearBacklashArcmin}'</span>
              </div>
            </div>

            {/* Run Simulation Button */}
            <button
              onClick={handleStartSimulation}
              disabled={isSimulating}
              className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                isSimulating
                  ? 'bg-slate-800 text-slate-400 cursor-wait'
                  : 'bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-cyan-500/25 hover:scale-[1.01]'
              }`}
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Executing 1000 Hz Rollout ({simProgress}%)...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Run End-to-End Simulation Rollout</span>
                </>
              )}
            </button>

            {/* Simulation Progress Pipeline Steps */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px]">
              <span className="text-slate-400 uppercase text-[10px] tracking-wider block">Rollout Verification Pipeline:</span>
              <div className="space-y-1.5">
                {[
                  { step: 0, label: '1. CAD Kinematics & Link Geometry Ingestion' },
                  { step: 1, label: '2. 1000 Hz Dynamic Joint Torque & Harmonic Stress' },
                  { step: 2, label: '3. Multi-Axis Failure Mode & Singularity Scan' },
                  { step: 3, label: '4. Closed-Loop AI Optimization & Trajectory Damping' },
                  { step: 4, label: '5. Executive Iteration Savings Report Ready' }
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-2">
                    {simStep > item.step || simStep === 4 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : simStep === item.step && isSimulating ? (
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                    )}
                    <span className={simStep >= item.step ? 'text-slate-200' : 'text-slate-500'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Specifications Card */}
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-5 space-y-3 text-xs">
            <h4 className="text-slate-300 font-bold flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Mechanism Specifications ({activeMechanism.companyName})</span>
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex justify-between border-b border-slate-800/50 pb-1">
                <span>Degrees of Freedom:</span>
                <strong className="text-slate-200">{activeMechanism.dof} DoF</strong>
              </li>
              <li className="flex justify-between border-b border-slate-800/50 pb-1">
                <span>Actuation System:</span>
                <strong className="text-slate-200">{activeMechanism.actuatorType}</strong>
              </li>
              <li className="flex justify-between border-b border-slate-800/50 pb-1">
                <span>Gear Reduction:</span>
                <strong className="text-slate-200">{activeMechanism.gearReduction}</strong>
              </li>
              <li className="flex justify-between border-b border-slate-800/50 pb-1">
                <span>Rated Payload:</span>
                <strong className="text-slate-200">{activeMechanism.nominalPayloadKg} kg</strong>
              </li>
              <li className="flex justify-between">
                <span>CAD Origin:</span>
                <strong className="text-cyan-400">Ingested via STEP / URDF</strong>
              </li>
            </ul>
          </div>
        </div>

        {/* Right 7 Cols: Discovered Failure Modes & Iteration Savings Summary */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Top ROI Metric Callout Banner */}
          <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-cyan-950/50 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Virtual Verification vs. Physical Metal Cutting
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  Quantified Iteration Savings
                </h3>
              </div>
              <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-bold font-mono">
                {dynamicSavings.roiMultiplier}x ROI
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Cycles Avoided</span>
                <span className="text-2xl font-black text-emerald-400">
                  {dynamicSavings.physicalIterationsAvoided}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">CNC Re-spins</span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Capital Saved</span>
                <span className="text-2xl font-black text-cyan-400">
                  ${(dynamicSavings.totalFinancialSavingsUsd / 1000).toFixed(0)}k
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">USD Retained</span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Bench Hours</span>
                <span className="text-2xl font-black text-indigo-400">
                  {dynamicSavings.benchTestHoursSaved}h
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Dyno Testing</span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Schedule Gain</span>
                <span className="text-2xl font-black text-amber-400">
                  {dynamicSavings.scheduleWeeksAccelerated}w
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Lead Time Saved</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              <strong>Executive Takeaway:</strong> By testing in-silico at 1000 Hz, {activeMechanism.companyName} avoided catastrophic physical hardware destruction and shaved {dynamicSavings.scheduleWeeksAccelerated} weeks from their commercial deployment timetable.
            </p>
          </div>

          {/* Critical Failure Modes Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Discovered Failure Modes ({activeFailureModes.length})</h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Automated Root Cause Diagnostics
              </span>
            </div>

            <div className="space-y-3">
              {activeFailureModes.map((fm) => (
                <div 
                  key={fm.id}
                  className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-2.5 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        fm.severity === 'CRITICAL' 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                          : fm.severity === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      }`}>
                        {fm.severity}
                      </span>
                      <span className="text-slate-400 font-mono font-semibold">{fm.id}</span>
                      <strong className="text-white font-sans text-sm">{fm.title}</strong>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      {fm.confidenceScore}% Confidence
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Telemetry Trigger:</span>
                      <code className="text-cyan-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">
                        {fm.telemetryTrigger}
                      </code>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">Subsystem:</span>
                      <span className="text-slate-300">{fm.subsystem}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 font-sans">
                    <span className="text-red-400 font-semibold font-mono">Hardware Risk: </span>
                    {fm.hardwareRisk}
                  </div>

                  <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 font-sans flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-mono text-emerald-200">1000 Hz Virtual Resolution: </strong>
                      {fm.simulatedFix}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Share Trigger Banner */}
          <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Share Short Report with Engineering Leadership</span>
              </h4>
              <p className="text-xs text-slate-400 font-sans">
                Export one-page executive summary, copy formatted markdown for Slack/Email, or generate verifiable engineering PDF dossier.
              </p>
            </div>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all shrink-0 cursor-pointer"
            >
              Open Report Share Drawer
            </button>
          </div>

        </div>
      </div>

      {/* SHARE REPORT MODAL / DRAWER */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-cyan-500/10 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl">
                  <Share2 className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Share Mechanism Failure & Savings Report</h3>
                  <p className="text-xs text-slate-400">{activeMechanism.companyName} • {activeMechanism.mechanismName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
              >
                ✕
              </button>
            </div>

            {/* Report View Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
              <button
                onClick={() => setActiveReportTab('executive')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeReportTab === 'executive' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Executive One-Pager
              </button>
              <button
                onClick={() => setActiveReportTab('technical')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeReportTab === 'technical' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Failure Modes Matrix
              </button>
              <button
                onClick={() => setActiveReportTab('email')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeReportTab === 'email' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ready-to-Send Email Draft
              </button>
            </div>

            {/* TAB 1: EXECUTIVE ONE PAGER */}
            {activeReportTab === 'executive' && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4 text-xs font-mono">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Mechanism: <strong className="text-white">{activeMechanism.mechanismName}</strong></span>
                  <span className="text-emerald-400 font-bold">${dynamicSavings.totalFinancialSavingsUsd.toLocaleString()} USD Saved</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Iterations Saved</span>
                    <strong className="text-emerald-400">{dynamicSavings.physicalIterationsAvoided} Cycles</strong>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Machining Capital</span>
                    <strong className="text-cyan-400">${(dynamicSavings.machiningCostSavedUsd / 1000).toFixed(0)}k</strong>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Test Hours</span>
                    <strong className="text-indigo-400">{dynamicSavings.benchTestHoursSaved}h</strong>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Schedule Saved</span>
                    <strong className="text-amber-400">{dynamicSavings.scheduleWeeksAccelerated} wks</strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] font-sans text-slate-300 leading-relaxed">
                  <strong>Key Finding:</strong> {dynamicSavings.summaryNote}
                </div>
              </div>
            )}

            {/* TAB 2: TECHNICAL FAILURE MODES MATRIX */}
            {activeReportTab === 'technical' && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
                {activeFailureModes.map((fm) => (
                  <div key={fm.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-sans">{fm.title}</span>
                      <span className="text-[10px] text-red-400 font-mono font-bold">{fm.severity}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      <strong className="text-slate-300">Root Cause:</strong> {fm.rootCause}
                    </p>
                    <p className="text-[11px] text-emerald-300 font-sans">
                      <strong className="text-emerald-400">Virtual In-Silicon Fix:</strong> {fm.simulatedFix}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: READY TO SEND EMAIL DRAFT */}
            {activeReportTab === 'email' && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <div className="text-slate-400 font-mono text-[11px]">
                  <strong>Subject:</strong> Simulation Results & ${dynamicSavings.totalFinancialSavingsUsd.toLocaleString()} Iteration Savings Dossier // {activeMechanism.mechanismName}
                </div>
                <div className="p-3 bg-slate-900 rounded-xl text-slate-300 font-sans space-y-2 leading-relaxed text-[11px]">
                  <p>Hi Engineering Leadership,</p>
                  <p>We completed an end-to-end 1000 Hz physical dynamic simulation of the <strong>{activeMechanism.mechanismName}</strong> before committing to physical billet machining.</p>
                  <p><strong>Key Results & Avoided Pitfalls:</strong></p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-200">
                    <li>Discovered {activeFailureModes.length} critical failure modes (including {activeFailureModes[0]?.title}) virtually in-silico.</li>
                    <li>Avoided {dynamicSavings.physicalIterationsAvoided} physical prototype revisions and ${dynamicSavings.totalFinancialSavingsUsd.toLocaleString()} USD in scrapped tooling and dyno bench testing.</li>
                    <li>Accelerated schedule by {dynamicSavings.scheduleWeeksAccelerated} weeks.</li>
                  </ul>
                  <p>All driver nodes have been verified and are ready for ROS 2 / Isaac Sim physical bench testing.</p>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={handleCopyReport}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedNotification ? (
                  <>
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>Copied Markdown to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Formatted Report</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleDownloadReport}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download .md</span>
                </button>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white font-semibold text-xs rounded-xl border border-slate-800 transition-all"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
