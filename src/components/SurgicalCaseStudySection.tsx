import React, { useState } from 'react';
import { 
  AlertTriangle, CheckCircle2, ShieldCheck, Activity, Clock, 
  Cpu, ArrowRight, Play, FileText, RotateCcw, Check, 
  ChevronRight, Sparkles, Layers, Sliders, Target, ShieldAlert
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SurgicalCaseStudySectionProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const SurgicalCaseStudySection: React.FC<SurgicalCaseStudySectionProps> = ({ onNavigate }) => {
  const [activeStage, setActiveStage] = useState<'problem' | 'diagnosis' | 'resolution' | 'outcome'>('problem');
  const [simulationState, setSimulationState] = useState<'before' | 'after'>('before');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);

  const handleRunSim = () => {
    setIsSimulating(true);
    setSimulationProgress(0);
    const interval = setInterval(() => {
      setSimulationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulating(false);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const stages = [
    {
      id: 'problem' as const,
      label: '1. The Crisis (T-72h)',
      time: '72 Hours to Animal Lab',
      tag: 'Hardware Failure',
      tagColor: 'bg-red-500/10 text-red-400 border-red-500/30',
      title: 'Deep-Pelvic Trajectory Singularity & Arm Clash'
    },
    {
      id: 'diagnosis' as const,
      label: '2. 1 kHz Ingestion',
      time: 'T-70 Hours',
      tag: 'Browser Diagnostics',
      tagColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      title: 'Full CAD Kinematics Ingested in 90 Seconds'
    },
    {
      id: 'resolution' as const,
      label: '3. The Virtual Fix',
      time: 'T-68 Hours',
      tag: 'Zero-Hardware Cost',
      tagColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      title: '8mm Port Shift & Jacobian Damping'
    },
    {
      id: 'outcome' as const,
      label: '4. Clinical Impact',
      time: 'Monday 08:00',
      tag: 'Flawless Trial',
      tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      title: '$180,000 Lab Saved & ISO 13849 Dossier Exported'
    }
  ];

  return (
    <section 
      id="surgical-case-study-section"
      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 relative overflow-hidden shadow-2xl"
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-800 pb-6">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Real-World Solution Breakdown // Medical Robotics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-mono tracking-tight">
            Case Study: The 72-Hour Preclinical Crisis
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            How surgical robotics startup <span className="text-cyan-300 font-bold">EndoVance Systems</span> diagnosed a catastrophic 4-arm kinematic singularity and saved their $180,000 clinical trial without rebuilding physical hardware.
          </p>
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs shrink-0">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-500 block uppercase">Trial Budget Saved</span>
            <span className="text-lg font-bold text-emerald-400">$180,000</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-500 block uppercase">Peak Joint Torque</span>
            <span className="text-lg font-bold text-cyan-400">32 → 9.8 Nm</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-500 block uppercase">Arm Clearance</span>
            <span className="text-lg font-bold text-indigo-400">-2 → +24 mm</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-500 block uppercase">Turnaround Time</span>
            <span className="text-lg font-bold text-amber-400">&lt; 2 Hours</span>
          </div>
        </div>
      </div>

      {/* Interactive Timeline Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        {stages.map((stage) => {
          const isActive = activeStage === stage.id;
          return (
            <button
              key={stage.id}
              id={`case-study-tab-${stage.id}`}
              onClick={() => setActiveStage(stage.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between space-y-2 ${
                isActive 
                  ? 'bg-slate-950 border-cyan-500/50 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/20' 
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-bold">{stage.time}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${stage.tagColor}`}>
                  {stage.tag}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{stage.label}</span>
                <p className="text-[11px] text-slate-400 line-clamp-1">{stage.title}</p>
              </div>
              {isActive && (
                <div className="w-full h-1 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Stage Detail Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Narrative Content (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5 font-mono">
          {activeStage === 'problem' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                <span>The Red Flag: 72 Hours Before Animal-Lab Trial</span>
              </div>
              <h3 className="text-xl font-bold text-white leading-snug">
                Actuator Over-Torque Trips & Multi-Arm Spatial Clashing
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Three days before shipping the physical 4-arm laparoscopy prototype to a non-refundable $180,000 preclinical animal suite, bench testing encountered severe failure. When the robotic needle-driver attempted a deep pelvic suture angle at <strong>Joint 4 and Joint 6</strong>, the physical arm shuddered violently and threw an emergency torque saturation trip (<code className="text-red-400 bg-red-950/50 px-1 py-0.5 rounded">Fault 0x7E: Joint Overload</code>).
              </p>
              <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Critical Failure Vectors Identified on Bench:
                </span>
                <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
                  <li><strong className="text-red-300">Kinematic Singularity:</strong> Wrist motor demanded 32 Nm of dynamic torque—far exceeding the motor's 14 Nm continuous ceiling.</li>
                  <li><strong className="text-red-300">Endoscope Collision:</strong> Secondary camera arm elbow grazed the needle driver shaft (-2 mm clash), creating catastrophic tissue tear risk.</li>
                  <li><strong className="text-red-300">Hardware Dilemma:</strong> Re-machining titanium links and rewiring motors would take <strong>4 to 6 weeks and £35,000+</strong>, forfeiting their FDA submission window.</li>
                </ul>
              </div>
            </div>
          )}

          {activeStage === 'diagnosis' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <Cpu className="w-4 h-4" />
                <span>Under 2-Minute Ingestion: Zero Linux Installations</span>
              </div>
              <h3 className="text-xl font-bold text-white leading-snug">
                Visualizing Real-Time Kinematic Singularities in 3D
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                With the clock ticking, EndoVance's lead systems engineer opened <strong>AiGenesis</strong> in Google Chrome. Instead of spending weeks wrestling with complex local ROS installs or static desktop CAD:
              </p>
              <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  What Static CAD Missed That AiGenesis Caught:
                </span>
                <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
                  <li><strong className="text-cyan-300">Instant Ingestion:</strong> Dragged raw STEP assembly directly into the CAD Ingestion Studio; moments of inertia and CoM computed in 90s.</li>
                  <li><strong className="text-cyan-300">1 kHz Jacobian Monitor:</strong> Evaluated the inverse kinematics solver at a 42° approach angle, flagging a severe determinant drop to <code>det(J) = 0.0001</code>.</li>
                  <li><strong className="text-cyan-300">Zero-Clash Mapping:</strong> 3D collision mesh pinpointed the exact millisecond and vertex coordinate where Arm 2 impacted the endoscope.</li>
                </ul>
              </div>
            </div>
          )}

          {activeStage === 'resolution' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sliders className="w-4 h-4" />
                <span>Software Optimization: No Physical Re-Machining</span>
              </div>
              <h3 className="text-xl font-bold text-white leading-snug">
                8mm Virtual Trocar Port Offset & Damped Least Squares Solver
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Without touching a single lathe or drill, the engineering team tested virtual modifications directly within AiGenesis's browser workspace:
              </p>
              <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" />
                  The Virtual Fix Implemented:
                </span>
                <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
                  <li><strong className="text-amber-300">8mm Lateral Port Shift:</strong> Adjusted the patient abdominal incision entry point by just 8mm laterally, unlocking an unobstructed work envelope.</li>
                  <li><strong className="text-amber-300">Damped Least Squares (DLS):</strong> Switched from pseudoinverse to Jacobian DLS damping in the PID Controller Studio to bypass the wrist singularity.</li>
                  <li><strong className="text-amber-300">500 Continuous Virtual Cycles:</strong> Simulated 500 complete suturing motions with zero motor trips, peak torque at 9.8 Nm, and +24mm arm clearance.</li>
                </ul>
              </div>
            </div>
          )}

          {activeStage === 'outcome' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Monday 08:00: Complete Clinical Success</span>
              </div>
              <h3 className="text-xl font-bold text-white leading-snug">
                Zero Downtime, Flawless Lab, & 1-Click ISO 13849 Dossier
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                The updated trajectory configuration and joint velocity limit parameters were exported directly to the robot's onboard controller on Sunday afternoon:
              </p>
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Measurable Operational Outcomes:
                </span>
                <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
                  <li><strong className="text-emerald-300">4-Hour Flawless Trial:</strong> Lead surgeon completed all 12 deep-pelvic sutures with zero emergency stops or arm collisions.</li>
                  <li><strong className="text-emerald-300">$180,000 Budget Preserved:</strong> Prevented trial forfeiture and avoided a 6-month delay in Series A fundraising milestones.</li>
                  <li><strong className="text-emerald-300">Audit-Ready Documentation:</strong> Exported a 14-page ISO 13849 & IEC 62061 safety fault-tree dossier directly from the Safety Audit Exporter.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Direct Quote Box */}
          <div className="p-4 bg-slate-900 border-l-2 border-cyan-400 rounded-r-xl text-xs space-y-1">
            <p className="text-slate-300 italic font-sans">
              "Without AiGenesis, we would have burned $180,000 on a failed preclinical session and spent a month rebuilding hardware in the dark. We diagnosed, simulated, and resolved a critical kinematic failure in an afternoon—straight from a web browser."
            </p>
            <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">
              — VP of Robotics Engineering, EndoVance Systems
            </span>
          </div>
        </div>

        {/* Right: Live Interactive Telemetry & Before/After Comparison (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase">Live Telemetry Comparator</span>
            </div>
            
            {/* Toggle State */}
            <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px]">
              <button
                onClick={() => setSimulationState('before')}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  simulationState === 'before'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Before Fix
              </button>
              <button
                onClick={() => setSimulationState('after')}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  simulationState === 'after'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                AiGenesis Fix
              </button>
            </div>
          </div>

          {/* Comparative Metrics Grid */}
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Joint 4 Motor Torque:</span>
              <span className={`font-bold ${simulationState === 'before' ? 'text-red-400' : 'text-emerald-400'}`}>
                {simulationState === 'before' ? '32.0 Nm [TRIP >14Nm]' : '9.8 Nm [NOMINAL]'}
              </span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Arm 2 to Endoscope Gap:</span>
              <span className={`font-bold ${simulationState === 'before' ? 'text-red-400' : 'text-emerald-400'}`}>
                {simulationState === 'before' ? '-2.1 mm [CLASH]' : '+24.4 mm [SAFE]'}
              </span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Jacobian Condition det(J):</span>
              <span className={`font-bold ${simulationState === 'before' ? 'text-red-400' : 'text-cyan-400'}`}>
                {simulationState === 'before' ? '0.0001 [SINGULARITY]' : '0.4120 [DAMPED]'}
              </span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Preclinical Lab Status:</span>
              <span className={`font-bold ${simulationState === 'before' ? 'text-red-400' : 'text-emerald-400'}`}>
                {simulationState === 'before' ? 'CANCELLED / $180k LOSS' : 'COMPLETED (100% PASS)'}
              </span>
            </div>
          </div>

          {/* Simulated 1 kHz Cycle Progress */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Simulated 1 kHz Kinematic Run:</span>
              <span className="font-bold text-cyan-400">
                {isSimulating ? `${simulationProgress}%` : (simulationState === 'before' ? 'Fault at 42%' : '100% Suture Complete')}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div 
                className={`h-full transition-all duration-300 ${
                  simulationState === 'before' 
                    ? 'bg-red-500 w-[42%]' 
                    : (isSimulating ? 'bg-cyan-400' : 'bg-emerald-400 w-full')
                }`}
                style={isSimulating ? { width: `${simulationProgress}%` } : undefined}
              />
            </div>
          </div>

          {/* Interactive Test Action */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleRunSim}
              disabled={isSimulating}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold text-xs rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Simulating 1 kHz Cycle...' : 'Re-Run Virtual Trajectory Test'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => onNavigate('ik')}
                className="flex items-center justify-center gap-1.5 py-2 bg-slate-950 hover:bg-slate-900 text-slate-300 text-[11px] rounded-lg border border-slate-800 hover:text-cyan-300 transition-all"
              >
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>Inspect in IK Studio</span>
              </button>
              <button
                onClick={() => onNavigate('compliance')}
                className="flex items-center justify-center gap-1.5 py-2 bg-slate-950 hover:bg-slate-900 text-slate-300 text-[11px] rounded-lg border border-slate-800 hover:text-emerald-300 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>View ISO 13849 Dossier</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
