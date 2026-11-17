import React, { useState } from 'react';
import {
  GitBranch, GitPullRequest, ShieldCheck, AlertOctagon, CheckCircle2,
  Copy, Check, Search, Terminal, Play, Link2, Lock
} from 'lucide-react';
import { TraceabilityRow, ComplianceStandardId } from '../../data/regulatoryData';

interface TraceabilityGatekeeperPanelProps {
  standardId: ComplianceStandardId;
  standardShortName: string;
  rtmRows: TraceabilityRow[];
  failingClausesCount: number;
}

export const TraceabilityGatekeeperPanel: React.FC<TraceabilityGatekeeperPanelProps> = ({
  standardId,
  standardShortName,
  rtmRows,
  failingClausesCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ciProvider, setCiProvider] = useState<'github' | 'gitlab'>('github');
  const [prSimMode, setPrSimMode] = useState<'safe' | 'unsafe' | null>(null);
  const [prSimRunning, setPrSimRunning] = useState(false);

  const filteredRows = rtmRows.filter((row) => {
    const q = searchQuery.toLowerCase();
    return (
      row.reqId.toLowerCase().includes(q) ||
      row.clauseRef.toLowerCase().includes(q) ||
      row.requirementText.toLowerCase().includes(q) ||
      row.codeSymbol.toLowerCase().includes(q)
    );
  });

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const githubYaml = `# .github/workflows/aigenesis-safety-gate.yml
name: AIGENESIS Formal Regulatory Safety Gatekeeper
on:
  pull_request:
    branches: [ main, release/* ]
jobs:
  z3-compliance-dossier-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run AIGENESIS Z3 SMT Barrier & 1kHz Twin Verifier
        uses: aigenesis-safety/gatekeeper-action@v4
        with:
          standard: "${standardId}"
          fail-on-rpn-above: "15"
          verify-sim2real-max-delta: "3.0"
          export-dhf-artifact: "artifacts/safety_dossier_\${{ github.sha }}.md"
      - name: Upload Cryptographic Audit Evidence
        uses: actions/upload-artifact@v4
        with:
          name: notified-body-dossier-\${{ github.sha }}
          path: artifacts/`;

  const gitlabYaml = `# .gitlab-ci.yml (AIGENESIS Air-Gapped Runner)
stages:
  - formal_safety_gate

aigenesis_dossier_verification:
  stage: formal_safety_gate
  image: registry.internal/aigenesis/z3-safety-verifier:4.8-scif
  script:
    - aigenesis-cli verify --standard ${standardId} --config ./config/safety.yaml
    - aigenesis-cli export-dossier --format markdown,json --sign-enclave
  artifacts:
    when: always
    paths:
      - aigenesis-dossier/
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'`;

  const activeYaml = ciProvider === 'github' ? githubYaml : gitlabYaml;

  const triggerPrSimulation = (mode: 'safe' | 'unsafe') => {
    setPrSimRunning(true);
    setPrSimMode(null);
    setTimeout(() => {
      setPrSimRunning(false);
      setPrSimMode(mode);
    }, 550);
  };

  return (
    <div className="space-y-6">
      {/* 1. Bi-Directional Requirements Traceability Matrix (RTM) */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Link2 className="w-4 h-4 text-cyan-400" />
              <span>Bi-Directional Requirements Traceability Matrix (RTM)</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Auditors verify 100% linkage from {standardShortName} clause → Controller C++/ROS symbol → Z3 proof → SHA-256 test digest.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter REQ, clause, symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">Req ID</th>
                <th className="py-2.5 px-3">Standard Clause</th>
                <th className="py-2.5 px-3">Code Symbol</th>
                <th className="py-2.5 px-3">Z3 SMT Assertion</th>
                <th className="py-2.5 px-3">1 kHz Test & Delta</th>
                <th className="py-2.5 px-3">Evidence SHA-256</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredRows.map((row) => (
                <tr key={row.reqId} className="hover:bg-slate-900/60 transition">
                  <td className="py-3 px-3 font-bold text-cyan-400 whitespace-nowrap">{row.reqId}</td>
                  <td className="py-3 px-3 text-slate-200">
                    <div className="font-bold text-white">{row.clauseRef}</div>
                    <div className="text-[11px] text-slate-400 font-sans max-w-xs">{row.requirementText}</div>
                  </td>
                  <td className="py-3 px-3">
                    <code className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-indigo-300 text-[11px]">
                      {row.codeSymbol}
                    </code>
                  </td>
                  <td className="py-3 px-3">
                    <code className="text-emerald-300 text-[11px]">{row.z3ProofFormula}</code>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-200 font-bold">{row.physicsTestId}</div>
                    <div className="text-[11px] text-emerald-400">{row.measuredDelta}</div>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => copyText(row.sha256, row.reqId)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] cursor-pointer"
                      title={row.sha256}
                    >
                      <span>{row.sha256.slice(0, 10)}…</span>
                      {copiedId === row.reqId ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. CI/CD Git Gatekeeper + Live PR Blocker Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: CI/CD Workflow Generator */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-emerald-400" />
                <span>Continuous Compliance CI/CD Git Gatekeeper</span>
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Auto-block pull requests that violate safety margins and regenerate signed audit binders on every merge.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setCiProvider('github')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                  ciProvider === 'github' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                GitHub Actions
              </button>
              <button
                onClick={() => setCiProvider('gitlab')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                  ciProvider === 'gitlab' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                GitLab CI (SCIF)
              </button>
            </div>
          </div>

          <div className="relative">
            <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-cyan-200 overflow-x-auto leading-relaxed">
              {activeYaml}
            </pre>
            <button
              onClick={() => copyText(activeYaml, 'ci-yaml')}
              className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 cursor-pointer"
            >
              {copiedId === 'ci-yaml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'ci-yaml' ? 'Copied YAML' : 'Copy Pipeline'}</span>
            </button>
          </div>
        </div>

        {/* Right: Interactive PR Gatekeeper Simulator */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-purple-400" />
                <span>Simulate PR Gatekeeper Check</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                Active Clauses Failing: {failingClausesCount}
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans">
              Test how the AIGENESIS CI Gatekeeper intercepts unsafe firmware changes before they reach physical hardware.
            </p>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => triggerPrSimulation('unsafe')}
                disabled={prSimRunning}
                className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-left transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                  <span>PR #418: "Increase gripper force limit for faster cycle"</span>
                  <Play className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Diff: <code className="text-rose-300">max_force_n: 128.0 → 188.0</code>
                </div>
              </button>

              <button
                onClick={() => triggerPrSimulation('safe')}
                disabled={prSimRunning}
                className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                  <span>PR #419: "Tighten DLS damping & 1 kHz CBF clamp"</span>
                  <Play className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Diff: <code className="text-emerald-300">max_force_n: 128.0 → 118.0</code>
                </div>
              </button>
            </div>
          </div>

          {/* Simulator Output Terminal */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono min-h-[140px] flex flex-col justify-center">
            {prSimRunning ? (
              <div className="text-cyan-400 animate-pulse flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span>Running Z3 SMT solver & 1 kHz trajectory sweep...</span>
              </div>
            ) : prSimMode === 'unsafe' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <AlertOctagon className="w-4 h-4 shrink-0" />
                  <span>MERGE BLOCKED BY AIGENESIS GATEKEEPER (EXIT 1)</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  Z3 Counterexample found at <code className="text-rose-300">t = 0.042s</code>: Transient contact force reaches <strong className="text-white">188.0 N</strong>, violating {standardShortName} threshold. Existing Dossier remains locked until remediated.
                </p>
              </div>
            ) : prSimMode === 'safe' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>ALL PROOFS VERIFIED — MERGE APPROVED & DHF RE-SIGNED</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  Forward invariance proven in <strong className="text-white">13.8 ms</strong>. Updated Dossier binder automatically archived with SHA-256 digest <code className="text-emerald-300">9f4c...b21a</code>.
                </p>
              </div>
            ) : (
              <div className="text-slate-500 text-[11px] font-sans">
                Select a Pull Request above to watch live Z3 barrier enforcement inside CI/CD.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
