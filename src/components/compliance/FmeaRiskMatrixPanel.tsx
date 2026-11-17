import React, { useState } from 'react';
import {
  AlertTriangle, CheckCircle2, ShieldCheck, Plus, ToggleLeft, ToggleRight,
  Sliders, ShieldAlert, Scale, Trash2
} from 'lucide-react';
import { FmeaHazardItem } from '../../data/regulatoryData';

interface FmeaRiskMatrixPanelProps {
  hazards: FmeaHazardItem[];
  onToggleMitigation: (id: string) => void;
  onAddHazard: (hazard: FmeaHazardItem) => void;
  onRemoveHazard: (id: string) => void;
}

export const FmeaRiskMatrixPanel: React.FC<FmeaRiskMatrixPanelProps> = ({
  hazards,
  onToggleMitigation,
  onAddHazard,
  onRemoveHazard,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubsystem, setNewSubsystem] = useState('Actuator & Control Loop');
  const [newEffect, setNewEffect] = useState('');
  const [newSeverity, setNewSeverity] = useState(4);
  const [newOccurrence, setNewOccurrence] = useState(4);
  const [newDetection, setNewDetection] = useState(3);
  const [newMitigation, setNewMitigation] = useState('1000 Hz Z3 Control Barrier Clamp');

  const getRpnBadge = (rpn: number) => {
    if (rpn <= 12) return { label: 'ALARP / ACCEPTABLE', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    if (rpn <= 30) return { label: 'MODERATE — MONITOR', cls: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
    return { label: 'CRITICAL — BLOCKED', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
  };

  const avgPreRpn = hazards.length
    ? Math.round(hazards.reduce((acc, h) => acc + h.severity * h.occurrencePre * h.detectionPre, 0) / hazards.length)
    : 0;

  const avgPostRpn = hazards.length
    ? Math.round(
        hazards.reduce(
          (acc, h) =>
            acc +
            h.severity *
              (h.mitigationEnabled ? h.occurrencePost : h.occurrencePre) *
              (h.mitigationEnabled ? h.detectionPost : h.detectionPre),
          0
        ) / hazards.length
      )
    : 0;

  const rpnReductionPct = avgPreRpn > 0 ? Math.round(((avgPreRpn - avgPostRpn) / avgPreRpn) * 100) : 0;

  const handleCreateHazard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const item: FmeaHazardItem = {
      id: `HAZ-CUST-${String(hazards.length + 1).padStart(2, '0')}`,
      hazardTitle: newTitle.trim(),
      subsystem: newSubsystem.trim() || 'Hardware Subsystem',
      potentialEffect: newEffect.trim() || 'Safety envelope breach or hardware degradation',
      severity: newSeverity,
      occurrencePre: newOccurrence,
      detectionPre: newDetection,
      mitigationStrategy: newMitigation.trim() || 'Closed-loop CBF Interlock',
      z3InvariantFormula: '∀t ≥ 0: h(x(t)) ≥ 0 ∧ STO_latency ≤ 1.2 ms',
      mitigationEnabled: true,
      occurrencePost: 1,
      detectionPost: 1,
    };
    onAddHazard(item);
    setNewTitle('');
    setNewEffect('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top ISO 14971 KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase text-slate-500 font-bold">Total Hazard Modes</span>
          <div className="text-2xl font-extrabold text-white">{hazards.length} Analyzed</div>
          <span className="text-[11px] text-slate-400 font-sans">ISO 14971 FMEA Matrix</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase text-rose-400 font-bold">Pre-Mitigation Avg RPN</span>
          <div className="text-2xl font-extrabold text-rose-400">{avgPreRpn}</div>
          <span className="text-[11px] text-slate-400 font-sans">Unmitigated baseline risk</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase text-emerald-400 font-bold">Post-Mitigation Avg RPN</span>
          <div className="text-2xl font-extrabold text-emerald-400">{avgPostRpn}</div>
          <span className="text-[11px] text-slate-400 font-sans">Active Z3 barrier clamped</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
          <span className="text-[10px] uppercase text-emerald-300 font-bold">Net Risk Reduction</span>
          <div className="text-2xl font-extrabold text-white">-{rpnReductionPct}% RPN</div>
          <span className="text-[11px] text-emerald-400 font-sans">Toggle mitigations below to test</span>
        </div>
      </div>

      {/* Add Hazard Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            <span>Interactive ISO 14971 FMEA & Residual Risk Table</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Toggle hardware/CBF mitigations on or off to observe live Risk Priority Number (RPN = S × O × D) impact on your Dossier.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Cancel New Hazard' : 'Add Custom Hazard Mode'}</span>
        </button>
      </div>

      {/* Custom Hazard Creation Form */}
      {showAddForm && (
        <form onSubmit={handleCreateHazard} className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-4">
          <div className="text-xs font-bold text-cyan-300 uppercase">Register New System Failure Mode (ISO 14971)</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Hazard / Failure Mode Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., Knife Blade Force Spike on Dense Fruit Core"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Subsystem</label>
              <input
                type="text"
                value={newSubsystem}
                onChange={(e) => setNewSubsystem(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Potential Clinical / Physical Effect</label>
              <input
                type="text"
                placeholder="e.g., End-effector slip or fixture overload"
                value={newEffect}
                onChange={(e) => setNewEffect(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Z3 / Hardware Mitigation Control</label>
              <input
                type="text"
                value={newMitigation}
                onChange={(e) => setNewMitigation(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Severity (1-5): {newSeverity}</label>
              <input type="range" min={1} max={5} value={newSeverity} onChange={(e) => setNewSeverity(Number(e.target.value))} className="w-full accent-cyan-400" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Pre-Occurrence (1-5): {newOccurrence}</label>
              <input type="range" min={1} max={5} value={newOccurrence} onChange={(e) => setNewOccurrence(Number(e.target.value))} className="w-full accent-cyan-400" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Pre-Detection (1-5): {newDetection}</label>
              <input type="range" min={1} max={5} value={newDetection} onChange={(e) => setNewDetection(Number(e.target.value))} className="w-full accent-cyan-400" />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Add to FMEA Risk Matrix
            </button>
          </div>
        </form>
      )}

      {/* Hazard Cards List */}
      <div className="space-y-3">
        {hazards.map((h) => {
          const preRpn = h.severity * h.occurrencePre * h.detectionPre;
          const postRpn = h.mitigationEnabled
            ? h.severity * h.occurrencePost * h.detectionPost
            : preRpn;
          const badge = getRpnBadge(postRpn);

          return (
            <div
              key={h.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                h.mitigationEnabled
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-rose-950/15 border-rose-500/40'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400 text-[10px] font-bold">
                      {h.id}
                    </span>
                    <span className="text-xs text-slate-400">{h.subsystem}</span>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{h.hazardTitle}</h4>
                  <p className="text-xs text-slate-400 font-sans">
                    Potential Effect: <span className="text-slate-300">{h.potentialEffect}</span>
                  </p>
                </div>

                {/* RPN Comparison & Toggle */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <div className="text-[9px] text-slate-500 uppercase">Initial RPN</div>
                    <div className="text-sm font-bold text-rose-400 line-through">{preRpn}</div>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <div className="text-[9px] text-slate-500 uppercase">Residual RPN</div>
                    <div className={`text-sm font-extrabold ${postRpn <= 12 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {postRpn}
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleMitigation(h.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                      h.mitigationEnabled
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                        : 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
                    }`}
                  >
                    {h.mitigationEnabled ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-400" />
                        <span>Mitigation Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-rose-400" />
                        <span>Mitigation Disabled</span>
                      </>
                    )}
                  </button>

                  {h.id.startsWith('HAZ-CUST-') && (
                    <button
                      onClick={() => onRemoveHazard(h.id)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 cursor-pointer"
                      title="Remove custom hazard"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Mitigation & Formal Formula Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-900 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                  <span className="text-slate-500 uppercase text-[9px] font-bold block">Engineering Control / Barrier Mitigation</span>
                  <span className="text-slate-200 font-sans">{h.mitigationStrategy}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                  <span className="text-slate-500 uppercase text-[9px] font-bold block">Formal Z3 SMT Proof Invariant</span>
                  <code className="text-cyan-300 font-mono">{h.z3InvariantFormula}</code>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
