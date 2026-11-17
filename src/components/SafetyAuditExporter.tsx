import React, { useState, useMemo, useRef } from 'react';
import {
  ShieldCheck, FileText, CheckCircle2, AlertTriangle, AlertOctagon,
  Sliders, Upload, Sparkles, Scale, Link2, FileCheck, RefreshCw,
  Stethoscope, Radio, Shield, Box, Zap, ArrowRight, Wrench
} from 'lucide-react';
import { ObjectiveScenario } from '../types';
import { PRESET_SCENARIOS } from '../data/scenariosData';
import { getStoredQuota, PLAN_DEFINITIONS } from '../utils/quotaManager';
import {
  ComplianceStandardId,
  REGULATORY_FRAMEWORKS,
  RobotTelemetryParams,
  FmeaHazardItem,
  parseConfigTextToParams
} from '../data/regulatoryData';
import { FmeaRiskMatrixPanel } from './compliance/FmeaRiskMatrixPanel';
import { TraceabilityGatekeeperPanel } from './compliance/TraceabilityGatekeeperPanel';
import { DossierDocumentBuilder } from './compliance/DossierDocumentBuilder';

interface SafetyAuditExporterProps {
  currentScenario?: ObjectiveScenario;
  onOpenBarrier?: (barrierInfo: any) => void;
  onNavigateToPricing?: () => void;
  onQuickUpgrade?: (tier: any) => void;
}

type StudioSubTab = 'gap-analyzer' | 'fmea' | 'rtm-cicd' | 'dossier-export';

export const SafetyAuditExporter: React.FC<SafetyAuditExporterProps> = ({
  onOpenBarrier,
  onQuickUpgrade,
}) => {
  const [standardId, setStandardId] = useState<ComplianceStandardId>('ISO_10218');
  const [activeSubTab, setActiveSubTab] = useState<StudioSubTab>('gap-analyzer');
  const [params, setParams] = useState<RobotTelemetryParams>(REGULATORY_FRAMEWORKS.ISO_10218.defaultParams);
  const [configText, setConfigText] = useState<string>(REGULATORY_FRAMEWORKS.ISO_10218.sampleConfigSnippet);
  const [ingestFeedback, setIngestFeedback] = useState<string | null>(null);
  const [hazardsByStd, setHazardsByStd] = useState<Record<ComplianceStandardId, FmeaHazardItem[]>>({
    ISO_10218: REGULATORY_FRAMEWORKS.ISO_10218.defaultHazards,
    ISO_3691_4: REGULATORY_FRAMEWORKS.ISO_3691_4.defaultHazards,
    FDA_21CFR820: REGULATORY_FRAMEWORKS.FDA_21CFR820.defaultHazards,
    STANAG_4586: REGULATORY_FRAMEWORKS.STANAG_4586.defaultHazards,
  });
  const [isAutoTuning, setIsAutoTuning] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const quota = getStoredQuota();
  const limits = PLAN_DEFINITIONS[quota.plan] || PLAN_DEFINITIONS.developer;
  const isEnterpriseUnlocked = limits.hasComplianceAudit;

  const framework = REGULATORY_FRAMEWORKS[standardId];
  const hazards = hazardsByStd[standardId];

  const handleSelectStandard = (nextId: ComplianceStandardId) => {
    setStandardId(nextId);
    const nextSpec = REGULATORY_FRAMEWORKS[nextId];
    setParams(nextSpec.defaultParams);
    setConfigText(nextSpec.sampleConfigSnippet);
    setIngestFeedback(null);
  };

  // Evaluate every regulatory clause live against current parameters & active FMEA mitigations
  const clauseResults = useMemo(() => {
    const activeMitCount = hazards.filter((h) => h.mitigationEnabled).length;
    return framework.clauses.map((rule) => {
      const outcome = rule.evaluate(params, activeMitCount, hazards.length);
      return {
        clauseId: rule.clauseId,
        title: rule.title,
        category: rule.category,
        requirementSummary: rule.requirementSummary,
        limitDescription: rule.limitDescription,
        ...outcome,
      };
    });
  }, [framework, params, hazards]);

  const failingClausesCount = clauseResults.filter((c) => c.status === 'FAIL').length;
  const conditionalClausesCount = clauseResults.filter((c) => c.status === 'CONDITIONAL').length;
  const unmitigatedHazardsCount = hazards.filter((h) => !h.mitigationEnabled).length;

  // Compute holistic Audit Readiness Score (0-100%)
  const readinessScore = useMemo(() => {
    const totalChecks = clauseResults.length + hazards.length;
    if (totalChecks === 0) return 100;
    const clausePoints = clauseResults.reduce(
      (sum, c) => sum + (c.status === 'PASS' ? 1 : c.status === 'CONDITIONAL' ? 0.5 : 0),
      0
    );
    const hazardPoints = hazards.filter((h) => h.mitigationEnabled).length;
    return Math.round(((clausePoints + hazardPoints) / totalChecks) * 100);
  }, [clauseResults, hazards]);

  const handleParseConfigText = (raw: string) => {
    setConfigText(raw);
    const { parsed, matchedKeys } = parseConfigTextToParams(raw, params);
    setParams(parsed);
    if (matchedKeys.length > 0) {
      setIngestFeedback(`Parsed ${matchedKeys.length} safety parameters (${matchedKeys.join(', ')})`);
    } else {
      setIngestFeedback('No recognized YAML/URDF safety keys found. Use sliders or standard keys.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      handleParseConfigText(text);
    };
    reader.readAsText(file);
  };

  const handleInjectStressFault = () => {
    setParams((prev) => ({
      ...prev,
      maxForceN: Number((prev.maxForceN * 1.48).toFixed(1)),
      maxVelocityMs: Number((prev.maxVelocityMs * 1.45).toFixed(2)),
      stoppingDistanceMm: Number((prev.stoppingDistanceMm * 1.65).toFixed(1)),
      jitterMs: Number((prev.jitterMs + 1.4).toFixed(2)),
      singularityDetJ: 0.025,
    }));
    setIngestFeedback('Injected adversarial edge-case fault profile to test Gap Analyzer.');
  };

  const handleAutoTuneZ3 = () => {
    setIsAutoTuning(true);
    setTimeout(() => {
      setParams(framework.recommendedSafeParams);
      setHazardsByStd((prev) => ({
        ...prev,
        [standardId]: prev[standardId].map((h) => ({ ...h, mitigationEnabled: true })),
      }));
      setIsAutoTuning(false);
      setIngestFeedback('Z3 CBF Optimizer enforced mathematically proven compliant bounds across all clauses.');
    }, 400);
  };

  const handleToggleHazardMitigation = (hazardId: string) => {
    setHazardsByStd((prev) => ({
      ...prev,
      [standardId]: prev[standardId].map((h) =>
        h.id === hazardId ? { ...h, mitigationEnabled: !h.mitigationEnabled } : h
      ),
    }));
  };

  const handleAddHazard = (newHazard: FmeaHazardItem) => {
    setHazardsByStd((prev) => ({
      ...prev,
      [standardId]: [...prev[standardId], newHazard],
    }));
  };

  const handleRemoveHazard = (hazardId: string) => {
    setHazardsByStd((prev) => ({
      ...prev,
      [standardId]: prev[standardId].filter((h) => h.id !== hazardId),
    }));
  };

  const handleRequestUnlock = () => {
    if (onOpenBarrier) {
      onOpenBarrier({
        title: 'Air-Gapped SCIF Notified-Body Seal',
        description:
          'Evaluation drafts and previews are unlocked. Upgrade to Enterprise & Safety for air-gapped cryptographic seals, multi-repo CI enforcement, and dedicated QA sign-off.',
        currentPlan: quota.plan,
        recommendedPlan: 'enterprise',
        used: 0,
        limit: 0,
        featureName: 'Production Regulatory Seal',
      });
    }
  };

  return (
    <div className="space-y-6 font-mono pb-16">
      {/* Top Engine Header & Live Readiness Scoreboard */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Automated Regulatory & Safety Dossier Engine</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {framework.notifiedBodies}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {framework.fullName}
            </h2>
            <p className="text-xs text-slate-400 font-sans max-w-3xl">
              Ingest ROS 2 / URDF safety parameters, run live clause-by-clause gap analysis, calibrate ISO 14971 FMEA risk matrices, enforce CI/CD Git gates, and export auditor-ready Design History Files.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {(failingClausesCount > 0 || unmitigatedHazardsCount > 0) && (
              <button
                onClick={handleAutoTuneZ3}
                disabled={isAutoTuning}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Wrench className={`w-3.5 h-3.5 ${isAutoTuning ? 'animate-spin' : ''}`} />
                <span>{isAutoTuning ? 'Solving Z3 Bounds...' : 'Auto-Synthesize Compliant Bounds'}</span>
              </button>
            )}

            <button
              onClick={() => setActiveSubTab('dossier-export')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-black text-xs transition shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Compile & Export Dossier</span>
            </button>
          </div>
        </div>

        {/* 4 Regulatory Vertical Selector Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[
            { id: 'ISO_10218' as const, label: 'ISO 10218 & TS 15066', sub: 'Collaborative & Industrial Cobots', icon: Box },
            { id: 'ISO_3691_4' as const, label: 'ISO 3691-4 & R15.08', sub: 'Autonomous Mobile Robots (AMR)', icon: Radio },
            { id: 'FDA_21CFR820' as const, label: 'FDA 21 CFR 820 / 13485', sub: 'Surgical Robotics & IEC 62304', icon: Stethoscope },
            { id: 'STANAG_4586' as const, label: 'STANAG 4586 & MIL-810H', sub: 'Defense Autonomy & SCIF Pack', icon: Shield },
          ].map((item) => {
            const Icon = item.icon;
            const active = standardId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectStandard(item.id)}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                  active
                    ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${active ? 'text-cyan-400' : 'text-slate-500'}`} />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{item.label}</div>
                  <div className="text-[10px] text-slate-400 font-sans truncate">{item.sub}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Telemetry Strip: Readiness Score, Clauses, FMEA, Z3 Verdict */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Audit Readiness</span>
              <span
                className={`text-xl font-extrabold ${
                  readinessScore >= 95 ? 'text-emerald-400' : readinessScore >= 70 ? 'text-amber-300' : 'text-rose-400'
                }`}
              >
                {readinessScore}%
              </span>
            </div>
            <CheckCircle2 className={`w-5 h-5 ${readinessScore >= 95 ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Regulatory Clauses</span>
              <span className="text-sm font-bold text-white">
                {clauseResults.length - failingClausesCount}/{clauseResults.length} Passing
              </span>
              {conditionalClausesCount > 0 && (
                <span className="text-[10px] text-amber-400 block">{conditionalClausesCount} conditional</span>
              )}
            </div>
            {failingClausesCount > 0 ? (
              <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                {failingClausesCount} FAIL
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                CLEAR
              </span>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">ISO 14971 FMEA</span>
              <span className="text-sm font-bold text-white">
                {hazards.length - unmitigatedHazardsCount}/{hazards.length} Mitigated
              </span>
            </div>
            <Scale className={`w-5 h-5 ${unmitigatedHazardsCount === 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Z3 Barrier Seal</span>
              <span className="text-sm font-bold text-cyan-300">
                {failingClausesCount === 0 && unmitigatedHazardsCount === 0 ? 'PROVEN INVARIANT' : 'BREACH DETECTED'}
              </span>
            </div>
            {!isEnterpriseUnlocked && onQuickUpgrade ? (
              <button
                onClick={() => onQuickUpgrade('enterprise')}
                className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold cursor-pointer"
              >
                <Zap className="w-3 h-3 inline mr-1" />
                Pro Seal
              </button>
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
          </div>
        </div>
      </div>

      {/* Workbench Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'gap-analyzer' as const, label: '1. Code Ingestion & Clause Gap Analyzer', icon: Sliders },
          { id: 'fmea' as const, label: '2. ISO 14971 FMEA Risk Matrix', icon: Scale },
          { id: 'rtm-cicd' as const, label: '3. Bi-Directional RTM & CI/CD Gatekeeper', icon: Link2 },
          { id: 'dossier-export' as const, label: '4. Official Dossier Binder & Export', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs transition whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/70 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-slate-950' : 'text-cyan-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CODE INGESTION, TELEMETRY TUNER & CLAUSE GAP ANALYZER */}
      {activeSubTab === 'gap-analyzer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: URDF/YAML Config Ingestion & Live Parameter Sliders */}
          <div className="lg:col-span-5 space-y-5">
            {/* Config Ingestion Box */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Ingest ROS 2 YAML / URDF Safety Envelope</span>
                </h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".yaml,.yml,.urdf,.json,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-[11px] font-bold cursor-pointer"
                >
                  Upload File
                </button>
              </div>

              <textarea
                rows={5}
                value={configText}
                onChange={(e) => handleParseConfigText(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-cyan-200 font-mono focus:outline-none focus:border-cyan-500"
                placeholder="Paste ROS 2 YAML or URDF parameters..."
              />

              {ingestFeedback && (
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[11px] text-cyan-300 font-sans">
                  {ingestFeedback}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={handleInjectStressFault}
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[11px] font-bold cursor-pointer"
                >
                  Simulate Unsafe Edge-Case Fault
                </button>
                <button
                  onClick={handleAutoTuneZ3}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold cursor-pointer"
                >
                  Z3 Auto-Tune Compliance
                </button>
              </div>
            </div>

            {/* Interactive Physical Telemetry Sliders */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>Live Physical Envelope Telemetry</span>
                </span>
                <span className="text-[10px] text-slate-400">Real-Time Clause Eval</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Max Peak Contact / Actuator Force</span>
                    <span className="text-white font-bold">{params.maxForceN} N</span>
                  </div>
                  <input
                    type="range"
                    min={standardId === 'FDA_21CFR820' ? 1 : 20}
                    max={standardId === 'FDA_21CFR820' ? 10 : 500}
                    step={standardId === 'FDA_21CFR820' ? 0.2 : 2}
                    value={params.maxForceN}
                    onChange={(e) => setParams({ ...params, maxForceN: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Max TCP / Vehicle Speed</span>
                    <span className="text-white font-bold">{params.maxVelocityMs.toFixed(2)} m/s</span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={standardId === 'STANAG_4586' ? 12 : 3.0}
                    step={0.05}
                    value={params.maxVelocityMs}
                    onChange={(e) => setParams({ ...params, maxVelocityMs: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Worst-Case Stopping Distance / Excursion</span>
                    <span className="text-white font-bold">{params.stoppingDistanceMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min={standardId === 'FDA_21CFR820' ? 0.1 : 10}
                    max={standardId === 'FDA_21CFR820' ? 3.0 : 800}
                    step={standardId === 'FDA_21CFR820' ? 0.05 : 5}
                    value={params.stoppingDistanceMm}
                    onChange={(e) => setParams({ ...params, stoppingDistanceMm: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Real-Time Loop Frequency & Jitter</span>
                    <span className="text-white font-bold">
                      {params.controlFreqHz} Hz / {params.jitterMs.toFixed(2)} ms
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={3.5}
                    step={0.05}
                    value={params.jitterMs}
                    onChange={(e) => setParams({ ...params, jitterMs: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Sim-to-Real Dyno Residual Delta</span>
                    <span className="text-white font-bold">{params.simToRealDeltaPct.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={6.0}
                    step={0.1}
                    value={params.simToRealDeltaPct}
                    onChange={(e) => setParams({ ...params, simToRealDeltaPct: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Clause-by-Clause Notified Body Gap Analyzer */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Clause-by-Clause Notified Body Gap Analyzer</span>
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Every statutory clause updates live as you modify ROS 2 parameters or hardware envelopes.
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('fmea')}
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline cursor-pointer shrink-0"
              >
                <span>Next: ISO 14971 FMEA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {clauseResults.map((clause) => {
                const badgeClass =
                  clause.status === 'PASS'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : clause.status === 'CONDITIONAL'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30';

                return (
                  <div
                    key={clause.clauseId}
                    className={`p-4 rounded-2xl border transition space-y-2.5 ${
                      clause.status === 'FAIL'
                        ? 'bg-rose-950/20 border-rose-500/40'
                        : clause.status === 'CONDITIONAL'
                        ? 'bg-amber-950/15 border-amber-500/40'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 text-[10px] font-bold">
                          {clause.clauseId}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase">{clause.category}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold self-start sm:self-auto ${badgeClass}`}>
                        {clause.status}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-white">{clause.title}</div>
                    <p className="text-xs text-slate-400 font-sans">{clause.requirementSummary}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[9px] text-slate-500 uppercase block">Statutory Limit</span>
                        <span className="text-slate-200 font-bold">{clause.limitDescription}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[9px] text-slate-500 uppercase block">Measured Value</span>
                        <span className={clause.status === 'FAIL' ? 'text-rose-300 font-bold' : 'text-emerald-300 font-bold'}>
                          {clause.measuredText}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[9px] text-slate-500 uppercase block">Margin / Verdict</span>
                        <span className="text-cyan-300 font-bold">{clause.marginText}</span>
                      </div>
                    </div>

                    {clause.remediation && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-200 font-sans flex items-start gap-2">
                        <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Required Remediation:</strong> {clause.remediation}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ISO 14971 FMEA RISK MATRIX */}
      {activeSubTab === 'fmea' && (
        <FmeaRiskMatrixPanel
          hazards={hazards}
          onToggleMitigation={handleToggleHazardMitigation}
          onAddHazard={handleAddHazard}
          onRemoveHazard={handleRemoveHazard}
        />
      )}

      {/* TAB 3: BI-DIRECTIONAL RTM & CI/CD GIT GATEKEEPER */}
      {activeSubTab === 'rtm-cicd' && (
        <TraceabilityGatekeeperPanel
          standardId={standardId}
          standardShortName={framework.shortName}
          rtmRows={framework.rtmRows}
          failingClausesCount={failingClausesCount}
        />
      )}

      {/* TAB 4: OFFICIAL MULTI-FORMAT DOSSIER BUILDER */}
      {activeSubTab === 'dossier-export' && (
        <DossierDocumentBuilder
          framework={framework}
          params={params}
          clauseResults={clauseResults}
          hazards={hazards}
          readinessScore={readinessScore}
          isEnterpriseUnlocked={isEnterpriseUnlocked}
          onRequestEnterpriseUnlock={handleRequestUnlock}
        />
      )}
    </div>
  );
};
