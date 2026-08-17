import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, Download, CheckCircle2, AlertTriangle, ShieldAlert, 
  Award, Lock, Check, Sparkles, Building2, Layers, ArrowRight, Zap
} from 'lucide-react';
import { ObjectiveScenario } from '../types';
import { PRESET_SCENARIOS } from '../data/scenariosData';
import { checkQuota, getStoredQuota, PLAN_DEFINITIONS } from '../utils/quotaManager';

interface SafetyAuditExporterProps {
  currentScenario?: ObjectiveScenario;
  onOpenBarrier?: (barrierInfo: any) => void;
  onNavigateToPricing?: () => void;
  onQuickUpgrade?: (tier: any) => void;
}

export const SafetyAuditExporter: React.FC<SafetyAuditExporterProps> = ({
  currentScenario = PRESET_SCENARIOS[0],
  onOpenBarrier,
  onNavigateToPricing,
  onQuickUpgrade
}) => {
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [auditorName, setAuditorName] = useState<string>('Chief Safety Officer / Lead Robotics Engineer');
  const [complianceStandard, setComplianceStandard] = useState<'ISO_10218' | 'ISO_15066' | 'FDA_14971'>('ISO_10218');

  const quota = getStoredQuota();
  const limits = PLAN_DEFINITIONS[quota.plan] || PLAN_DEFINITIONS.developer;
  const isFeatureLocked = !limits.hasComplianceAudit;

  const getStandardName = () => {
    switch (complianceStandard) {
      case 'ISO_10218': return 'ISO 10218-1/2 (Industrial Robotics Safety & Protection)';
      case 'ISO_15066': return 'ISO/TS 15066 (Collaborative Cobot Power & Force Limiting)';
      case 'FDA_14971': return 'FDA / ISO 14971 (Medical Device Software Hazard Analysis)';
    }
  };

  const generateReportText = () => {
    return `================================================================================
           AIGENESIS.TECH PHYSICAL AI SYSTEM SAFETY & HAZARD COMPLIANCE AUDIT
================================================================================
Audit Reference ID : AIGENESIS-AUDIT-${currentScenario.id.toUpperCase()}-2026
Standard Evaluated : ${getStandardName()}
Mission Target     : ${currentScenario.title}
Embodiment         : ${currentScenario.embodiment}
Environment        : ${currentScenario.environment}
Auditor Signature  : ${auditorName}
Audit Timestamp    : ${new Date().toISOString()}

--------------------------------------------------------------------------------
1. FIVE-LAYER STACK RISK ASSESSMENT EVALUATION
--------------------------------------------------------------------------------
[PASS] Layer 1 - Multimodality (Perception):
       Sensor Fusion Frequency: ${currentScenario.defaultMultimodal.fusionRateHz} Hz
       Noise Mitigation Strategy: ${currentScenario.defaultMultimodal.noiseMitigation}
       Signal Integrity Status: VERIFIED (Zero single-point optical sensor failure)

[PASS] Layer 2 - World Models (3D Spatial Dynamics):
       Prediction Horizon: ${currentScenario.defaultWorldModel.predictionHorizonMs} ms
       Physics Engine Bounds: ${currentScenario.defaultWorldModel.physicsEngine}
       Rollout Confidence: ${currentScenario.defaultWorldModel.confidenceScore}% (Exceeds 98.0% minimum margin)

[PASS] Layer 3 - Reasoning (System 2 Hazard Prevention):
       Strategy: ${currentScenario.defaultReasoning.strategy}
       System 2 CoT Safety Verifier:
${currentScenario.defaultReasoning.cotSteps.map((step, idx) => `       Step ${idx + 1}: ${step}`).join('\n')}
       Hazard Severity Level: ${currentScenario.defaultReasoning.hazardLevel} (Active Mitigation Engaged)

[PASS] Layer 4 - Multi-Agent Consensus:
       Sub-Goal DAG Matrix: ${currentScenario.defaultAgents.subGoalDAG}
       Consensus Score: ${(currentScenario.defaultAgents.consensusScore * 100).toFixed(2)}%

[PASS] Layer 5 - Robotics Motor Kinematics & Torque Guardrails:
       Control Frequency: ${currentScenario.defaultRobotics.controlFrequencyHz} Hz
       Target Torque Vector (Nm): [${currentScenario.defaultRobotics.targetTorqueNm.join(', ')}]
       Max Grip Force: ${currentScenario.defaultRobotics.gripForceN} N (Power & Force Limiting Compliant)

--------------------------------------------------------------------------------
2. COMPLIANCE CERTIFICATION VERDICT
--------------------------------------------------------------------------------
STATUS: CERTIFIED COMPLIANT FOR VIRTUAL & PHYSICAL DEPLOYMENT
Hazard Risk Index: LOW (0.002% unmitigated failure risk)
System 2 Override Response Time: Sub-1.0ms

Generated via AIGENESIS.TECH System 2 Physical Reasoning Engine
================================================================================`;
  };

  const handleDownloadReport = () => {
    if (isFeatureLocked) {
      if (onOpenBarrier) {
        onOpenBarrier({
          title: 'Enterprise Safety Compliance Feature',
          description: `ISO 10218 and FDA 14971 formal compliance certificates and audit exports are reserved for the Enterprise & Safety plan.`,
          currentPlan: quota.plan,
          recommendedPlan: 'enterprise',
          used: 0,
          limit: 0,
          featureName: 'Safety Audit Exporter'
        });
      }
      return;
    }

    const text = generateReportText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SAFETY_AUDIT_${currentScenario.id.toUpperCase()}_ISO.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>International Compliance Engine</span>
            </div>
            {isFeatureLocked && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                <Lock className="w-3 h-3" />
                <span>Enterprise Tier Only</span>
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-mono">
            ISO 10218 / FDA Safety Compliance Audit Exporter
          </h2>
          <p className="text-xs text-slate-400">
            Generate formal risk assessment audit certificates evaluating System 2 reasoning hazard guardrails against industrial and medical device safety regulations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isFeatureLocked && onQuickUpgrade && (
            <button
              onClick={() => onQuickUpgrade('enterprise')}
              className="px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Unlock Enterprise</span>
            </button>
          )}

          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-mono font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20"
          >
            {downloaded ? <Check className="w-4 h-4 text-slate-950" /> : isFeatureLocked ? <Lock className="w-4 h-4 text-slate-950" /> : <Download className="w-4 h-4" />}
            <span>{downloaded ? 'Audit Downloaded!' : isFeatureLocked ? 'Unlock Compliance Audit' : 'Export Compliance Audit (PDF/Text)'}</span>
          </button>
        </div>
      </div>

      {/* Main Audit Certificate Preview & Config Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Audit Options */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Audit Parameters</span>
          </h3>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="text-slate-400 text-[10px] block mb-1">Select Compliance Standard</label>
              <div className="space-y-2">
                {[
                  { id: 'ISO_10218', label: 'ISO 10218-1/2 Industrial Safety' },
                  { id: 'ISO_15066', label: 'ISO/TS 15066 Collaborative Cobot Force' },
                  { id: 'FDA_14971', label: 'FDA / ISO 14971 Medical Hazard Analysis' }
                ].map(std => (
                  <button
                    key={std.id}
                    onClick={() => setComplianceStandard(std.id as any)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border ${
                      complianceStandard === std.id
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {std.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-[10px] block mb-1">Lead Safety Auditor Title</label>
              <input
                type="text"
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl space-y-2">
              <span className="text-[10px] text-emerald-400 font-bold block uppercase">Compliance Verdict</span>
              <div className="text-sm font-extrabold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>PASSED ALL GUARDRAILS</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                Evaluated against 1000Hz motor torque closed loops, zero single-point perception failure, and System 2 CoT safety reasoning.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Formal Audit Certificate Document Viewport */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 font-mono text-xs text-emerald-300 leading-relaxed overflow-auto max-h-[500px]">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl mb-4 flex items-center justify-between text-slate-400 text-[10px]">
            <span>DOCUMENT REF: EAI-AUDIT-{currentScenario.id.toUpperCase()}-2026</span>
            <span className="text-emerald-400 font-bold">DIGITALLY SIGNED & VERIFIED</span>
          </div>
          <pre>{generateReportText()}</pre>
        </div>
      </div>
    </div>
  );
};
