import React, { useState } from 'react';
import { 
  AlertTriangle, ShieldAlert, Cpu, Flame, EyeOff, Wrench, RefreshCw, 
  CheckCircle2, Activity, Zap, Play, Pause, Gauge, Layers, ShieldCheck
} from 'lucide-react';
import { ObjectiveScenario } from '../types';
import { PRESET_SCENARIOS } from '../data/scenariosData';
import { checkQuota, consumeQuota, getStoredQuota, PLAN_DEFINITIONS } from '../utils/quotaManager';

interface HardwareStressSimulatorProps {
  currentScenario?: ObjectiveScenario;
  onOpenBarrier?: (barrierInfo: any) => void;
  onNavigateToPricing?: () => void;
}

export const HardwareStressSimulator: React.FC<HardwareStressSimulatorProps> = ({
  currentScenario = PRESET_SCENARIOS[0],
  onOpenBarrier,
  onNavigateToPricing
}) => {
  const [thermalLossPercent, setThermalLossPercent] = useState<number>(25);
  const [sensorNoisePercent, setSensorNoisePercent] = useState<number>(35);
  const [backlashMm, setBacklashMm] = useState<number>(0.85);
  const [system2RecoveryActive, setSystem2RecoveryActive] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  const quota = getStoredQuota();
  const limits = PLAN_DEFINITIONS[quota.plan] || PLAN_DEFINITIONS.developer;

  const handleTriggerStressRun = () => {
    const quotaCheck = checkQuota('simulation_run');
    if (!quotaCheck.allowed) {
      if (onOpenBarrier) {
        onOpenBarrier({
          title: 'Simulation Rollout Limit Reached',
          description: quotaCheck.reason || `You have reached your limit of ${limits.simulationsLimit} simulation rollouts on the ${limits.name} plan.`,
          currentPlan: quota.plan,
          recommendedPlan: 'pro',
          used: quota.simulationsUsed,
          limit: limits.simulationsLimit,
          featureName: 'Physics & Stress Simulator'
        });
      }
      return;
    }
    consumeQuota('simulation_run');
    setIsRunning(!isRunning);
  };

  // Dynamic calculations based on failure inputs
  const nominalTorque = currentScenario.defaultRobotics.targetTorqueNm[0] || 50;
  const degradedTorque = Math.max(1, nominalTorque * (1 - thermalLossPercent / 100));
  
  // System 2 compensation calculation
  const rawConfidence = Math.max(20, 100 - (thermalLossPercent * 0.4 + sensorNoisePercent * 0.5 + backlashMm * 10));
  const compensatedConfidence = system2RecoveryActive 
    ? Math.min(99.9, rawConfidence + 32)
    : rawConfidence;

  const isCriticalHazard = compensatedConfidence < 70;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-mono font-semibold">
            <Flame className="w-3.5 h-3.5" />
            <span>Edge-Case Fault Injector</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-mono">
            Live Hardware Stress & Edge-Case Failure Simulator
          </h2>
          <p className="text-xs text-slate-400">
            Inject real-time motor thermal degradation, sensor occlusion noise, and mechanical joint backlash to test System 2 safety reasoning recovery.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <button
            onClick={() => setSystem2RecoveryActive(!system2RecoveryActive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              system2RecoveryActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                : 'bg-red-500/20 text-red-300 border-red-500/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>System 2 Recovery: {system2RecoveryActive ? 'ENABLED' : 'DISABLED'}</span>
          </button>

          <button
            onClick={() => {
              setThermalLossPercent(0);
              setSensorNoisePercent(0);
              setBacklashMm(0);
            }}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700"
            title="Reset Faults to Zero"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Control Sliders & Live Physics Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fault Injection Sliders Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Wrench className="w-4 h-4 text-red-400" />
            <span>Fault Injection Controls</span>
          </h3>

          {/* Fault 1: Motor Thermal Overheat / Torque Loss */}
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Actuator Thermal Drop:</span>
              </span>
              <span className="text-amber-400 font-bold">{thermalLossPercent}% Loss</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={thermalLossPercent}
              onChange={(e) => setThermalLossPercent(Number(e.target.value))}
              className="w-full accent-amber-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Nominal ({nominalTorque} Nm)</span>
              <span>Degraded ({degradedTorque.toFixed(1)} Nm)</span>
            </div>
          </div>

          {/* Fault 2: Sensor Noise & Glare/Silt Occlusion */}
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-cyan-400" />
                <span>Optical Glare / Silt Noise:</span>
              </span>
              <span className="text-cyan-400 font-bold">{sensorNoisePercent}% Occluded</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              value={sensorNoisePercent}
              onChange={(e) => setSensorNoisePercent(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              Simulates dust storms, underwater silt turbulence, or blood reflections.
            </p>
          </div>

          {/* Fault 3: Mechanical Joint Backlash & Slack */}
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Joint Mechanical Backlash:</span>
              </span>
              <span className="text-red-400 font-bold">{backlashMm.toFixed(2)} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="2.5"
              step="0.05"
              value={backlashMm}
              onChange={(e) => setBacklashMm(Number(e.target.value))}
              className="w-full accent-red-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              Gearwear slack causing spatial trajectory divergence.
            </p>
          </div>
        </div>

        {/* Middle: Real-Time Hardware Telemetry Visualizer */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Closed-Loop Fault Response</span>
            </h3>

            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isCriticalHazard ? 'bg-red-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="text-xs font-mono text-slate-300 font-bold">
                {isCriticalHazard ? 'SYSTEM HAZARD WARNING' : 'STABLE RECOVERY ACTIVE'}
              </span>
            </div>
          </div>

          {/* Gauge Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Motor Torque Degradation</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">
                {degradedTorque.toFixed(1)} <span className="text-xs text-slate-400">Nm</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-amber-400 h-full transition-all duration-300" 
                  style={{ width: `${(degradedTorque / nominalTorque) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Perception Signal Integrity</span>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {(100 - sensorNoisePercent).toFixed(0)}%
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-cyan-400 h-full transition-all duration-300" 
                  style={{ width: `${100 - sensorNoisePercent}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Overall Mission Safety Margin</span>
              <div className={`text-2xl font-bold mt-1 ${isCriticalHazard ? 'text-red-400' : 'text-emerald-400'}`}>
                {compensatedConfidence.toFixed(1)}%
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${isCriticalHazard ? 'bg-red-400' : 'bg-emerald-400'}`} 
                  style={{ width: `${compensatedConfidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* System 2 Mitigation Protocol Log Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs space-y-2">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
              <span>System 2 Hardware Fault Recovery Protocol Log</span>
              <span className="text-emerald-400 font-bold">1000Hz Feedback Active</span>
            </div>

            {system2RecoveryActive ? (
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                <li className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Sub-millisecond current spike detection engaged. Motor thermal derating active ({thermalLossPercent}% torque backoff).</span>
                </li>
                <li className="flex items-center gap-2 text-cyan-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Multimodal Kalman sensor fusion switching from optical to acoustic/IMU fallback ({sensorNoisePercent}% optical noise).</span>
                </li>
                <li className="flex items-center gap-2 text-indigo-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Kinematic hysteresis compensation offset applied: +{backlashMm.toFixed(2)}mm trajectory pre-bias.</span>
                </li>
              </ul>
            ) : (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <span>System 2 Safety Guardrails DISABLED! Motor torque divergence and trajectory drift unmitigated.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
