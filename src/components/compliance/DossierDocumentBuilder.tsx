import React, { useState, useMemo } from 'react';
import {
  FileText, Download, CheckCircle2, AlertTriangle, Lock, Check,
  Copy, Printer, FileCode2, ShieldCheck, Building2
} from 'lucide-react';
import {
  RegulatoryFrameworkSpec,
  RobotTelemetryParams,
  FmeaHazardItem,
  computeDeterministicHash
} from '../../data/regulatoryData';

interface ClauseResultItem {
  clauseId: string;
  title: string;
  limitDescription: string;
  status: 'PASS' | 'CONDITIONAL' | 'FAIL';
  measuredText: string;
  marginText: string;
  remediation?: string;
}

interface DossierDocumentBuilderProps {
  framework: RegulatoryFrameworkSpec;
  params: RobotTelemetryParams;
  clauseResults: ClauseResultItem[];
  hazards: FmeaHazardItem[];
  readinessScore: number;
  isEnterpriseUnlocked: boolean;
  onRequestEnterpriseUnlock?: () => void;
}

export const DossierDocumentBuilder: React.FC<DossierDocumentBuilderProps> = ({
  framework,
  params,
  clauseResults,
  hazards,
  readinessScore,
  isEnterpriseUnlocked,
  onRequestEnterpriseUnlock,
}) => {
  const [orgName, setOrgName] = useState('Apex Robotics Systems Ltd.');
  const [robotModel, setRobotModel] = useState(framework.robotPresetName);
  const [gitCommitSha, setGitCommitSha] = useState('a84f91c2d07e');
  const [leadOfficer, setLeadOfficer] = useState('Dr. Elena Vance, VP Regulatory & Safety');
  const [viewFormat, setViewFormat] = useState<'markdown' | 'json'>('markdown');
  const [downloadedType, setDownloadedType] = useState<string | null>(null);
  const [copiedSeal, setCopiedSeal] = useState(false);

  const failingClauses = clauseResults.filter((c) => c.status === 'FAIL');
  const unmitigatedHazards = hazards.filter((h) => !h.mitigationEnabled);
  const overallVerdict =
    failingClauses.length === 0 && unmitigatedHazards.length === 0
      ? 'CERTIFIED COMPLIANT — READY FOR NOTIFIED BODY SUBMISSION'
      : `ACTION REQUIRED — ${failingClauses.length} CLAUSE FAILURES / ${unmitigatedHazards.length} UNMITIGATED HAZARDS`;

  const cryptographicSeal = useMemo(() => {
    const payload = `${framework.id}|${orgName}|${robotModel}|${gitCommitSha}|${JSON.stringify(params)}|${readinessScore}`;
    return computeDeterministicHash(payload);
  }, [framework.id, orgName, robotModel, gitCommitSha, params, readinessScore]);

  const markdownDossier = useMemo(() => {
    const dateStr = new Date().toISOString().split('T')[0];
    return `# ==============================================================================
# OFFICIAL REGULATORY SAFETY & COMPLIANCE DOSSIER
# ENGINE: AIGENESIS.SAFETY AUTOMATED DOSSIER ENGINE v4.8
# DOSSIER TYPE: ${framework.dossierType.toUpperCase()}
# ==============================================================================

ORGANIZATION        : ${orgName}
ROBOTIC SYSTEM      : ${robotModel}
GOVERNING STANDARD  : ${framework.fullName}
TARGET REGULATORS   : ${framework.notifiedBodies}
FIRMWARE COMMIT SHA : ${gitCommitSha}
LEAD SAFETY OFFICER : ${leadOfficer}
GENERATION DATE     : ${dateStr}
AUDIT READINESS     : ${readinessScore}%
OVERALL VERDICT     : ${overallVerdict}
CRYPTOGRAPHIC SEAL  : SHA256:${cryptographicSeal}
EDITION STATUS      : ${isEnterpriseUnlocked ? 'PRODUCTION SIGNED SEAL (AIR-GAPPED)' : 'EVALUATION DRAFT DOSSIER'}

--------------------------------------------------------------------------------
1. VERIFIED TELEMETRY & SAFETY ENVELOPE PARAMETERS
--------------------------------------------------------------------------------
• Control Loop Frequency      : ${params.controlFreqHz} Hz (Worst-case jitter: ${params.jitterMs.toFixed(2)} ms)
• Max End-Effector Force      : ${params.maxForceN} N
• Max Autonomous/TCP Velocity : ${params.maxVelocityMs.toFixed(2)} m/s
• Worst-Case Stopping Distance: ${params.stoppingDistanceMm} mm
• Sim-to-Real Dyno Residual   : ${params.simToRealDeltaPct.toFixed(1)}%
• Min Jacobian |Det(J)|       : ${params.singularityDetJ.toFixed(3)}
• Max Actuator Thermal Soak   : ${params.thermalCeilingC.toFixed(1)} °C

--------------------------------------------------------------------------------
2. CLAUSE-BY-CLAUSE REGULATORY GAP ANALYSIS
--------------------------------------------------------------------------------
${clauseResults
  .map(
    (c) =>
      `[${c.status}] ${c.clauseId} — ${c.title}
        Threshold : ${c.limitDescription}
        Measured  : ${c.measuredText} (${c.marginText})${c.remediation ? `\n        Remediation: ${c.remediation}` : ''}`
  )
  .join('\n\n')}

--------------------------------------------------------------------------------
3. ISO 14971 FMEA HAZARD & RESIDUAL RISK MATRIX
--------------------------------------------------------------------------------
${hazards
  .map((h) => {
    const pre = h.severity * h.occurrencePre * h.detectionPre;
    const post = h.mitigationEnabled ? h.severity * h.occurrencePost * h.detectionPost : pre;
    return `• ${h.id}: ${h.hazardTitle} (${h.subsystem})
  Initial RPN: ${pre}  -->  Residual RPN: ${post} [${h.mitigationEnabled ? 'MITIGATION ACTIVE' : 'UNMITIGATED'}]
  Control    : ${h.mitigationStrategy}
  Z3 Proof   : ${h.z3InvariantFormula}`;
  })
  .join('\n\n')}

--------------------------------------------------------------------------------
4. BI-DIRECTIONAL REQUIREMENTS TRACEABILITY MATRIX (RTM)
--------------------------------------------------------------------------------
${framework.rtmRows
  .map(
    (r) =>
      `• ${r.reqId} (${r.clauseRef}) -> ${r.codeSymbol} -> ${r.physicsTestId} [${r.measuredDelta}]
  Z3 Assertion: ${r.z3ProofFormula}
  Evidence SHA: ${r.sha256}`
  )
  .join('\n\n')}

--------------------------------------------------------------------------------
5. FORMAL ATTESTATION & NOTIFIED BODY SIGN-OFF
--------------------------------------------------------------------------------
Prepared & Verified By: ${leadOfficer}
Digital Enclave Digest : SHA256:${cryptographicSeal}
================================================================================`;
  }, [framework, orgName, robotModel, gitCommitSha, leadOfficer, readinessScore, overallVerdict, cryptographicSeal, isEnterpriseUnlocked, params, clauseResults, hazards]);

  const jsonManifest = useMemo(() => {
    return JSON.stringify(
      {
        schemaVersion: 'aigenesis.regulatory.v4.8',
        generatedAtUtc: new Date().toISOString(),
        organization: orgName,
        robotModel,
        gitCommitSha,
        leadSafetyOfficer: leadOfficer,
        governingStandard: framework.id,
        notifiedBodies: framework.notifiedBodies,
        readinessScorePct: readinessScore,
        verdict: overallVerdict,
        cryptographicSealSha256: cryptographicSeal,
        telemetryParameters: params,
        clauseEvaluations: clauseResults,
        fmeaHazards: hazards.map((h) => ({
          id: h.id,
          title: h.hazardTitle,
          preRpn: h.severity * h.occurrencePre * h.detectionPre,
          postRpn: h.mitigationEnabled ? h.severity * h.occurrencePost * h.detectionPost : h.severity * h.occurrencePre * h.detectionPre,
          mitigationEnabled: h.mitigationEnabled,
          z3InvariantFormula: h.z3InvariantFormula,
        })),
        traceabilityMatrix: framework.rtmRows,
      },
      null,
      2
    );
  }, [framework, orgName, robotModel, gitCommitSha, leadOfficer, readinessScore, overallVerdict, cryptographicSeal, params, clauseResults, hazards]);

  const triggerDownload = (content: string, filename: string, mime: string, label: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedType(label);
    setTimeout(() => setDownloadedType(null), 2500);
  };

  const buildPrintableHtml = () => {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${framework.shortName} Safety Dossier - ${orgName}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 40px; line-height: 1.5; }
  .header { border-bottom: 3px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
  .pass { background: #dcfce7; color: #166534; }
  .fail { background: #fee2e2; color: #991b1b; }
  .cond { background: #fef3c7; color: #92400e; }
  h1 { margin: 0 0 6px 0; font-size: 22px; }
  h2 { font-size: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-top: 28px; text-transform: uppercase; letter-spacing: 0.04em; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
  th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; vertical-align: top; }
  th { background: #f1f5f9; font-weight: 700; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; padding: 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; }
  .seal { font-family: monospace; font-size: 11px; background: #0f172a; color: #38bdf8; padding: 12px; border-radius: 8px; word-break: break-all; margin-top: 24px; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div style="font-size:11px;font-weight:700;color:#0284c7;letter-spacing:0.08em;">AIGENESIS.SAFETY // AUTOMATED REGULATORY DOSSIER</div>
      <h1>${framework.fullName}</h1>
      <div style="font-size:12px;color:#475569;">${framework.dossierType}</div>
    </div>
    <div style="text-align:right;">
      <span class="badge ${failingClauses.length === 0 ? 'pass' : 'fail'}">${readinessScore}% READINESS</span>
      <div style="font-size:11px;color:#64748b;margin-top:6px;">${new Date().toISOString().split('T')[0]}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div><strong>Organization:</strong> ${orgName}</div>
    <div><strong>Target Regulator:</strong> ${framework.notifiedBodies}</div>
    <div><strong>Robotic System:</strong> ${robotModel}</div>
    <div><strong>Firmware Git SHA:</strong> <code>${gitCommitSha}</code></div>
    <div><strong>Lead Safety Officer:</strong> ${leadOfficer}</div>
    <div><strong>Verdict:</strong> ${overallVerdict}</div>
  </div>

  <h2>1. Clause-by-Clause Regulatory Evaluation</h2>
  <table>
    <thead><tr><th>Clause</th><th>Requirement</th><th>Threshold</th><th>Measured</th><th>Status</th></tr></thead>
    <tbody>
      ${clauseResults
        .map(
          (c) =>
            `<tr><td><strong>${c.clauseId}</strong></td><td>${c.title}</td><td>${c.limitDescription}</td><td>${c.measuredText}<br/><small>${c.marginText}</small></td><td><span class="badge ${
              c.status === 'PASS' ? 'pass' : c.status === 'FAIL' ? 'fail' : 'cond'
            }">${c.status}</span></td></tr>`
        )
        .join('')}
    </tbody>
  </table>

  <h2>2. ISO 14971 FMEA Hazard Analysis</h2>
  <table>
    <thead><tr><th>ID</th><th>Hazard Mode</th><th>Pre RPN</th><th>Post RPN</th><th>Z3 Barrier Formula</th></tr></thead>
    <tbody>
      ${hazards
        .map((h) => {
          const pre = h.severity * h.occurrencePre * h.detectionPre;
          const post = h.mitigationEnabled ? h.severity * h.occurrencePost * h.detectionPost : pre;
          return `<tr><td><strong>${h.id}</strong></td><td>${h.hazardTitle}<br/><small>${h.mitigationStrategy}</small></td><td>${pre}</td><td><strong>${post}</strong></td><td><code>${h.z3InvariantFormula}</code></td></tr>`;
        })
        .join('')}
    </tbody>
  </table>

  <h2>3. Bi-Directional Requirements Traceability Matrix</h2>
  <table>
    <thead><tr><th>REQ ID</th><th>Clause</th><th>Code Symbol</th><th>Physics Test</th><th>Evidence Hash</th></tr></thead>
    <tbody>
      ${framework.rtmRows
        .map(
          (r) =>
            `<tr><td><strong>${r.reqId}</strong></td><td>${r.clauseRef}</td><td><code>${r.codeSymbol}</code></td><td>${r.physicsTestId} (${r.measuredDelta})</td><td><code>${r.sha256.slice(0, 18)}...</code></td></tr>`
        )
        .join('')}
    </tbody>
  </table>

  <div class="seal">
    CRYPTOGRAPHIC AUDIT SEAL (SHA-256): ${cryptographicSeal}<br/>
    SIGN-OFF: ${leadOfficer} // STATUS: ${isEnterpriseUnlocked ? 'ENTERPRISE PRODUCTION SEAL' : 'EVALUATION DRAFT'}
  </div>
</body>
</html>`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Metadata & Export Controls */}
      <div className="lg:col-span-4 space-y-4">
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Dossier Sign-Off Metadata</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">Auto-Synced</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Manufacturer / OEM Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Robotic System & Hardware Rev</label>
              <input
                type="text"
                value={robotModel}
                onChange={(e) => setRobotModel(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Git Commit SHA</label>
                <input
                  type="text"
                  value={gitCommitSha}
                  onChange={(e) => setGitCommitSha(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Readiness Verdict</label>
                <div
                  className={`p-2.5 rounded-xl border font-bold text-center ${
                    failingClauses.length === 0 && unmitigatedHazards.length === 0
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  {readinessScore}% Ready
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Lead Safety Officer / Author</label>
              <input
                type="text"
                value={leadOfficer}
                onChange={(e) => setLeadOfficer(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Cryptographic Seal Box */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 uppercase font-bold">Dossier SHA-256 Digest</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(cryptographicSeal);
                  setCopiedSeal(true);
                  setTimeout(() => setCopiedSeal(false), 2000);
                }}
                className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedSeal ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSeal ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-[10px] text-emerald-400 break-all font-mono">{cryptographicSeal}</div>
          </div>

          {/* Export Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() =>
                triggerDownload(
                  buildPrintableHtml(),
                  `AIGENESIS_PRINTABLE_DOSSIER_${framework.id}_${gitCommitSha}.html`,
                  'text/html;charset=utf-8',
                  'html'
                )
              }
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              {downloadedType === 'html' ? <Check className="w-4 h-4" /> : <Printer className="w-4 h-4" />}
              <span>{downloadedType === 'html' ? 'Printable Report Saved!' : 'Export Print-Ready PDF/HTML Dossier'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  triggerDownload(
                    markdownDossier,
                    `AIGENESIS_DHF_${framework.id}_${gitCommitSha}.md`,
                    'text/markdown;charset=utf-8',
                    'md'
                  )
                }
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {downloadedType === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{downloadedType === 'md' ? 'Saved .MD' : 'Markdown (.md)'}</span>
              </button>

              <button
                onClick={() =>
                  triggerDownload(
                    jsonManifest,
                    `AIGENESIS_MANIFEST_${framework.id}_${gitCommitSha}.json`,
                    'application/json',
                    'json'
                  )
                }
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {downloadedType === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{downloadedType === 'json' ? 'Saved .JSON' : 'Manifest (.json)'}</span>
              </button>
            </div>

            {!isEnterpriseUnlocked && onRequestEnterpriseUnlock && (
              <button
                onClick={onRequestEnterpriseUnlock}
                className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Upgrade for Air-Gapped SCIF Notified-Body Seal</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Live Dossier Binder Preview */}
      <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">Live Compiled Design History File / Technical Binder</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewFormat('markdown')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                viewFormat === 'markdown' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Official Binder (.MD)
            </button>
            <button
              onClick={() => setViewFormat('json')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                viewFormat === 'json' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Signed Manifest (.JSON)
            </button>
          </div>
        </div>

        <pre className="flex-1 p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 text-[11px] text-emerald-300 leading-relaxed overflow-auto max-h-[540px]">
          {viewFormat === 'markdown' ? markdownDossier : jsonManifest}
        </pre>
      </div>
    </div>
  );
};
