import React, { useState } from 'react';
import {
  Sparkles, Calendar, Layers, Sliders, AlertTriangle, ShieldCheck,
  CheckCircle2, Download, Play, Pause, RotateCcw, Copy, Check,
  Terminal, BarChart3, Plus, RefreshCw, Clock, ArrowRight, Zap,
  Cpu, Boxes, Activity, Eye, Radio, FileCode
} from 'lucide-react';
import { useQuota } from '../hooks/useQuota';

export type ScenarioArchetypeId = 'defense_coanda' | 'ur10e_kitting' | 'surgical_laparoscopy' | 'swarm_recon';
export type ScenarioStudioTab = 'distributions' | 'layouts' | 'fault_profiles' | 'acceptance_criteria' | 'test_matrix';

interface ParameterDistribution {
  name: string;
  symbol: string;
  unit: string;
  distributionType: 'Normal (Gaussian)' | 'Uniform (Latin Hypercube)' | 'Beta (Corner-Biased)' | 'Log-Normal (Long-Tail)';
  nominal: number;
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  syntheticP99Value: number;
  physicsContext: string;
}

interface LayoutVariation {
  id: string;
  name: string;
  complexity: 'Low' | 'Medium' | 'High' | 'Adversarial Cluttered';
  objectCount: number;
  obstacleType: string;
  lightingCondition: string;
  surfaceTexture: string;
  collisionRiskScorePct: number;
  description: string;
}

interface FaultProfile {
  id: string;
  targetType: 'Sensor Fault' | 'Actuator Fault' | 'Compute & Network Fault';
  name: string;
  injectionTimeMs: string;
  magnitude: string;
  failurePattern: 'Sudden Step Bias' | 'High-Frequency Gaussian Jitter' | 'Thermal Ramp Degradation' | 'Packet Dropout Burst' | 'Deadband & Backlash Slack';
  expectedMitigation: string;
  severity: 'CRITICAL (Cat 4 / PL e)' | 'HIGH' | 'MODERATE';
}

interface AcceptanceCriterion {
  id: string;
  requirementTag: string;
  metric: string;
  passRule: string;
  toleranceMargin: string;
  safetyGoverningStandard: string;
  status: 'AUTOMATED GATED' | 'MANDATORY AIRWORTHINESS' | 'COMPLIANT';
}

interface ScheduledTestRun {
  jobId: string;
  scheduledTime: string;
  batchSize: number;
  parallelGpuNodes: number;
  scenarioPreset: string;
  layoutId: string;
  faultProfileId: string;
  estimatedDurationMin: number;
  ciTrigger: 'Nightly Soak Matrix (02:00 UTC)' | 'PR Automated Gate (Air-Gapped)' | 'Release Certification Sweep';
  status: 'SCHEDULED' | 'RUNNING' | 'QUEUED' | 'COMPLETED';
}

interface ScenarioArchetype {
  id: ScenarioArchetypeId;
  name: string;
  domain: string;
  governingStandard: string;
  seedPrompt: string;
  distributions: ParameterDistribution[];
  layouts: LayoutVariation[];
  faults: FaultProfile[];
  criteria: AcceptanceCriterion[];
  scheduledMatrix: ScheduledTestRun[];
}

const SCENARIO_PRESETS: Record<ScenarioArchetypeId, ScenarioArchetype> = {
  defense_coanda: {
    id: 'defense_coanda',
    name: 'Coandă Fluidic Thrust-Vectoring & High-Speed Valve Suite',
    domain: 'UAV / Missile Dynamic Thrust Vectoring (Gimballess)',
    governingStandard: 'MIL-STD-810H / ARP4754A (Aviation Flight Readiness)',
    seedPrompt: 'Synthesize 500 adversarial flight trajectories testing boundary-layer attachment during 60-knot crosswind gusts with thermal valve resistance soak.',
    distributions: [
      {
        name: 'Inlet Plenum Pressure',
        symbol: 'P_plenum',
        unit: 'kPa',
        distributionType: 'Normal (Gaussian)',
        nominal: 280,
        min: 140,
        max: 420,
        mean: 280,
        stdDev: 35,
        syntheticP99Value: 395,
        physicsContext: 'Combustor bleed tap pressure fluctuation across throttle transient envelope.',
      },
      {
        name: 'Throat Gap Machining Tolerance',
        symbol: 'h_throat',
        unit: 'mm',
        distributionType: 'Uniform (Latin Hypercube)',
        nominal: 1.15,
        min: 0.95,
        max: 1.35,
        mean: 1.15,
        stdDev: 0.08,
        syntheticP99Value: 1.32,
        physicsContext: '5-Axis CNC / DMLS titanium machining batch-to-batch manufacturing variance.',
      },
      {
        name: 'Crosswind Turbulence Gust Intensity',
        symbol: 'TI',
        unit: '%',
        distributionType: 'Beta (Corner-Biased)',
        nominal: 15.0,
        min: 5.0,
        max: 68.0,
        mean: 22.0,
        stdDev: 14.5,
        syntheticP99Value: 62.4,
        physicsContext: 'Atmospheric boundary-layer wind sheer and von Kármán vortex shedding.',
      },
      {
        name: 'Solenoid Bleed Valve Actuation Delay',
        symbol: 'τ_valve',
        unit: 'ms',
        distributionType: 'Log-Normal (Long-Tail)',
        nominal: 1.20,
        min: 0.85,
        max: 4.80,
        mean: 1.45,
        stdDev: 0.65,
        syntheticP99Value: 3.85,
        physicsContext: 'Coil thermal rise and magnetic hysteresis under continuous 350 Hz cycling.',
      },
    ],
    layouts: [
      {
        id: 'LAY-AERO-01',
        name: 'Clean Atmosphere Laminar Inflow',
        complexity: 'Low',
        objectCount: 1,
        obstacleType: 'Free Stream Airflow',
        lightingCondition: 'High Sunlight Exposure (IR glint)',
        surfaceTexture: 'Polished Inconel-718 (Ra = 0.8 µm)',
        collisionRiskScorePct: 2.4,
        description: 'Nominal baseline flight path verifying steady-state vector angle tracking without external shear.',
      },
      {
        id: 'LAY-AERO-02',
        name: 'Mountain Canyon Cross-Ridge Thermal Sheer',
        complexity: 'High',
        objectCount: 8,
        obstacleType: 'Turbulent Terrain Boundary Layer',
        lightingCondition: 'Strobe Shadow Transitions',
        surfaceTexture: 'Raw DMLS Sintered Surface (Ra = 3.6 µm)',
        collisionRiskScorePct: 48.2,
        description: 'Adversarial crosswind downdraft forcing micro-valves to switch differential bleed at 280 Hz.',
      },
      {
        id: 'LAY-AERO-03',
        name: 'Transonic Shock Wake Envelope',
        complexity: 'Adversarial Cluttered',
        objectCount: 16,
        obstacleType: 'Bow Shock Vortices & Debris Specks',
        lightingCondition: 'Zero Optical Visibility (Dense Silt Cloud)',
        surfaceTexture: 'Thermal Soaked Throat (320°C expanded)',
        collisionRiskScorePct: 82.5,
        description: 'Multi-body sonic flow interaction testing whether boundary snap detachment stall occurs.',
      },
    ],
    faults: [
      {
        id: 'FLT-SENS-01',
        targetType: 'Sensor Fault',
        name: 'Kulite Pressure Transducer 14 kHz Resonance Aliasing',
        injectionTimeMs: 'T+1.450s during 18° vector pull',
        magnitude: '+18.5 kPa spike + 3.8 kHz harmonic noise',
        failurePattern: 'High-Frequency Gaussian Jitter',
        expectedMitigation: 'Innovation Chi-Square gating inside 1000 Hz EKF observer rejects spurious transient.',
        severity: 'HIGH',
      },
      {
        id: 'FLT-ACT-02',
        targetType: 'Actuator Fault',
        name: 'Top Bleed Solenoid Spool Thermal Latchup',
        injectionTimeMs: 'T+3.200s (Continuous duty cycle)',
        magnitude: '50% flow choke (Valve stuck half-open)',
        failurePattern: 'Deadband & Backlash Slack',
        expectedMitigation: 'Closed-loop attitude governor commands bottom valve over-bleed to balance net vector.',
        severity: 'CRITICAL (Cat 4 / PL e)',
      },
      {
        id: 'FLT-NET-03',
        targetType: 'Compute & Network Fault',
        name: 'Flight Computer CAN-FD Bus Arbitration Jitter',
        injectionTimeMs: 'T+5.800s during gust onset',
        magnitude: 'Burst drop of 3 consecutive 1ms frames',
        failurePattern: 'Packet Dropout Burst',
        expectedMitigation: 'Deterministic dead-reckoning forward model maintains throttle PWM for up to 8ms.',
        severity: 'HIGH',
      },
    ],
    criteria: [
      {
        id: 'CRIT-01',
        requirementTag: 'REQ-AERO-014',
        metric: 'Boundary-Layer Attachment Margin',
        passRule: 'Newman ratio h/R <= 0.0500 under all gust vectors',
        toleranceMargin: '+22.4% headroom',
        safetyGoverningStandard: 'MIL-STD-810H Method 514',
        status: 'MANDATORY AIRWORTHINESS',
      },
      {
        id: 'CRIT-02',
        requirementTag: 'REQ-ACT-008',
        metric: 'Thrust Vector Step Response Settling Time',
        passRule: 'Settling time to 95% command <= 18.0 ms',
        toleranceMargin: '14.2 ms measured',
        safetyGoverningStandard: 'ARP4754A Safety Level A',
        status: 'AUTOMATED GATED',
      },
      {
        id: 'CRIT-03',
        requirementTag: 'REQ-SAFE-099',
        metric: 'Uncommanded Pitch / Yaw Over-Rotation',
        passRule: 'Peak angular attitude error <= 1.25 deg',
        toleranceMargin: '0.42 deg peak error',
        safetyGoverningStandard: 'MIL-HDBK-516C Airworthiness',
        status: 'COMPLIANT',
      },
    ],
    scheduledMatrix: [
      {
        jobId: 'SCHED-COANDA-NIGHTLY',
        scheduledTime: '02:00 UTC (Nightly)',
        batchSize: 500,
        parallelGpuNodes: 64,
        scenarioPreset: 'Coanda Nozzle Suite v4.8',
        layoutId: 'LAY-AERO-02 (Canyon Thermal Sheer)',
        faultProfileId: 'FLT-ACT-02 (Solenoid Spool Latchup)',
        estimatedDurationMin: 14,
        ciTrigger: 'Nightly Soak Matrix (02:00 UTC)',
        status: 'SCHEDULED',
      },
      {
        jobId: 'SCHED-COANDA-PR-GATE',
        scheduledTime: 'On Git Push / PR',
        batchSize: 120,
        parallelGpuNodes: 16,
        scenarioPreset: 'Fast Regression Flight Check',
        layoutId: 'LAY-AERO-01 (Clean Inflow)',
        faultProfileId: 'FLT-SENS-01 (Sensor Jitter)',
        estimatedDurationMin: 3,
        ciTrigger: 'PR Automated Gate (Air-Gapped)',
        status: 'QUEUED',
      },
    ],
  },
  ur10e_kitting: {
    id: 'ur10e_kitting',
    name: 'UR10e Industrial Kitting & Assembly Digital Twin',
    domain: 'Factory Logistics & High-Speed Bin-Picking',
    governingStandard: 'ISO 10218-1/2 (Robotics Safety) / ISO/TS 15066 (Cobot Power)',
    seedPrompt: 'Synthesize 1,000 multi-object bin kitting layouts with lubricated oily steel brackets, varying tray angles, and human cobot speed-separation intrusions.',
    distributions: [
      {
        name: 'Workpiece Surface Friction Coefficient',
        symbol: 'μ_contact',
        unit: 'coeff',
        distributionType: 'Uniform (Latin Hypercube)',
        nominal: 0.65,
        min: 0.18,
        max: 0.85,
        mean: 0.52,
        stdDev: 0.16,
        syntheticP99Value: 0.21,
        physicsContext: 'Coolant oil mist residual on stamped sheet-metal workpieces.',
      },
      {
        name: 'Payload Mass Distribution',
        symbol: 'm_payload',
        unit: 'kg',
        distributionType: 'Normal (Gaussian)',
        nominal: 3.50,
        min: 1.20,
        max: 5.80,
        mean: 3.50,
        stdDev: 0.85,
        syntheticP99Value: 5.48,
        physicsContext: 'Multiple part SKUs mixed in chaotic kitting totes.',
      },
      {
        name: 'Ambient Factory Illumination',
        symbol: 'E_lux',
        unit: 'lux',
        distributionType: 'Beta (Corner-Biased)',
        nominal: 600,
        min: 40,
        max: 2400,
        mean: 620,
        stdDev: 380,
        syntheticP99Value: 2280,
        physicsContext: 'Direct skylight glare and night-shift unlit warehouse conditions.',
      },
    ],
    layouts: [
      {
        id: 'LAY-ROBOT-01',
        name: 'Structured Grid Jigs (Clean Singulation)',
        complexity: 'Low',
        objectCount: 6,
        obstacleType: 'Precision Fixture Pegs',
        lightingCondition: 'Controlled Diffuse LED (700 lux)',
        surfaceTexture: 'Matte Anodized Aluminum',
        collisionRiskScorePct: 4.5,
        description: 'Standard kitting tray with fixed pocket coordinate indexing.',
      },
      {
        id: 'LAY-ROBOT-02',
        name: 'High-Density Tangled Tumble Bin',
        complexity: 'High',
        objectCount: 32,
        obstacleType: 'Interlocked Metal Brackets & Totes',
        lightingCondition: 'High Specular Glare (Overhead floodlights)',
        surfaceTexture: 'Oil-Coated Stamped Steel',
        collisionRiskScorePct: 56.4,
        description: 'Heavily occluded parts requiring suction pre-separation and tactile re-grasping.',
      },
    ],
    faults: [
      {
        id: 'FLT-ROBOT-01',
        targetType: 'Sensor Fault',
        name: 'RealSense D435 Depth Camera Infrared Specular Glare Multipath',
        injectionTimeMs: 'T+0.850s (Grasp planning cycle)',
        magnitude: 'Missing 40% depth pixels on part edges',
        failurePattern: 'Sudden Step Bias',
        expectedMitigation: 'Tactile finger contact verification validates point cloud pose estimate.',
        severity: 'HIGH',
      },
      {
        id: 'FLT-ACT-02',
        targetType: 'Actuator Fault',
        name: 'Robotiq 2F-85 Gripper Lead-Screw Backlash Slack',
        injectionTimeMs: 'T+2.100s during 2.4 m/s² deceleration',
        magnitude: '2.4mm fingertip play + 15N force drop',
        failurePattern: 'Deadband & Backlash Slack',
        expectedMitigation: 'High-frequency micro-slip reflex clamps normal squeeze force within 4.2ms.',
        severity: 'CRITICAL (Cat 4 / PL e)',
      },
    ],
    criteria: [
      {
        id: 'CRIT-ROB-01',
        requirementTag: 'REQ-GRIP-019',
        metric: 'Grasp Slip During Deceleration',
        passRule: 'Payload slip distance <= 1.0 mm at 2.5 m/s² deceleration',
        toleranceMargin: '0.14 mm measured',
        safetyGoverningStandard: 'ISO 10218-1 Clause 5.10',
        status: 'MANDATORY AIRWORTHINESS',
      },
    ],
    scheduledMatrix: [
      {
        jobId: 'SCHED-ROBOT-NIGHTLY',
        scheduledTime: '03:30 UTC (Nightly)',
        batchSize: 1000,
        parallelGpuNodes: 32,
        scenarioPreset: 'Chaotic Bin Picking Matrix v2.1',
        layoutId: 'LAY-ROBOT-02 (Tangled Tumble Bin)',
        faultProfileId: 'FLT-ACT-02 (Gripper Lead-Screw Slack)',
        estimatedDurationMin: 22,
        ciTrigger: 'Nightly Soak Matrix (02:00 UTC)',
        status: 'SCHEDULED',
      },
    ],
  },
  surgical_laparoscopy: {
    id: 'surgical_laparoscopy',
    name: 'Surgical Laparoscopic Articulator & Phantom Suite',
    domain: 'Minimally Invasive Robotic Surgery (RAMS)',
    governingStandard: 'FDA / ISO 14971 (Risk Management) & IEC 62304 (Medical Software)',
    seedPrompt: 'Synthesize 400 patient anatomy variations with variable tissue compliance, vessel proximities, and saline specularity reflections.',
    distributions: [
      {
        name: 'Organ Capsule Young Modulus',
        symbol: 'E_tissue',
        unit: 'kPa',
        distributionType: 'Log-Normal (Long-Tail)',
        nominal: 45.0,
        min: 12.0,
        max: 95.0,
        mean: 48.0,
        stdDev: 18.0,
        syntheticP99Value: 88.5,
        physicsContext: 'Viscoelastic variation across liver, kidney, and arterial capsule tissue.',
      },
    ],
    layouts: [
      {
        id: 'LAY-SURG-01',
        name: 'Deep Cavity Micro-Vascular Suture Field',
        complexity: 'Adversarial Cluttered',
        objectCount: 14,
        obstacleType: 'Pulsatile Major Vessel (<2mm clearance)',
        lightingCondition: 'Endoscopic Optical Fiber Shadow Transitions',
        surfaceTexture: 'Viscoelastic Wet Silicone Phantom',
        collisionRiskScorePct: 76.5,
        description: 'Confined surgical operative field requiring sub-millimeter needle arc trajectory execution.',
      },
    ],
    faults: [
      {
        id: 'FLT-SURG-01',
        targetType: 'Actuator Fault',
        name: 'Bowden Tendon Sterilization Cable Elongation',
        injectionTimeMs: 'T+1.120s (Penetration arc)',
        magnitude: '0.38mm drive wire slack',
        failurePattern: 'Deadband & Backlash Slack',
        expectedMitigation: 'Real-time tension observer applies feed-forward strain compensation.',
        severity: 'CRITICAL (Cat 4 / PL e)',
      },
    ],
    criteria: [
      {
        id: 'CRIT-SURG-01',
        requirementTag: 'REQ-MED-033',
        metric: 'Peak Tissue Puncture Force',
        passRule: 'Force vector magnitude <= 4.5 N (prevent laceration)',
        toleranceMargin: '3.12 N limit strictly enforced',
        safetyGoverningStandard: 'FDA ISO 14971 Risk Category IV',
        status: 'MANDATORY AIRWORTHINESS',
      },
    ],
    scheduledMatrix: [
      {
        jobId: 'SCHED-SURG-REGRESSION',
        scheduledTime: '01:00 UTC (Weekly)',
        batchSize: 400,
        parallelGpuNodes: 16,
        scenarioPreset: 'Vascular Suture Clearance Suite',
        layoutId: 'LAY-SURG-01 (Micro-Vascular Field)',
        faultProfileId: 'FLT-SURG-01 (Bowden Cable Slack)',
        estimatedDurationMin: 18,
        ciTrigger: 'Release Certification Sweep',
        status: 'SCHEDULED',
      },
    ],
  },
  swarm_recon: {
    id: 'swarm_recon',
    name: '24-Agent Swarm GPS-Denied Reconnaissance Suite',
    domain: 'Defense Swarm Autonomy & Anti-Jamming Mesh',
    governingStandard: 'STANAG 4586 / MIL-STD-1553 (UAV Flocking Interoperability)',
    seedPrompt: 'Synthesize 500 electronic-warfare missions with localized GNSS spoofing, narrow canyon corridors, and 20% RF packet loss.',
    distributions: [
      {
        name: 'RF Mesh Packet Loss Rate',
        symbol: 'P_drop',
        unit: '%',
        distributionType: 'Normal (Gaussian)',
        nominal: 2.0,
        min: 0.1,
        max: 35.0,
        mean: 5.5,
        stdDev: 8.2,
        syntheticP99Value: 28.4,
        physicsContext: 'Directional EW jamming transmitters in contested theater.',
      },
    ],
    layouts: [
      {
        id: 'LAY-SWARM-01',
        name: 'Constrained Urban Canyon Corridor',
        complexity: 'High',
        objectCount: 24,
        obstacleType: 'Concrete High-Rise Facades (4.5m gap)',
        lightingCondition: 'Dusk Low-Light with Infrared Strobes',
        surfaceTexture: 'Multi-Path RF Reflective Concrete',
        collisionRiskScorePct: 68.0,
        description: 'Tight formation flight through urban defile forcing rapid decentralized evasive maneuvers.',
      },
    ],
    faults: [
      {
        id: 'FLT-NET-SWARM',
        targetType: 'Compute & Network Fault',
        name: 'Localized GNSS Spoofing Offset Jump',
        injectionTimeMs: 'T+4.000s during canyon entry',
        magnitude: 'False +45m GPS coordinate jump in 2 flank drones',
        failurePattern: 'Sudden Step Bias',
        expectedMitigation: 'Factor-Graph EKF drops GNSS upon Chi-Square innovation check; locks to VIO + UWB mesh.',
        severity: 'CRITICAL (Cat 4 / PL e)',
      },
    ],
    criteria: [
      {
        id: 'CRIT-SWARM-01',
        requirementTag: 'REQ-SWRM-004',
        metric: 'Minimum Inter-Drone Separation Distance',
        passRule: 'Separation distance >= 1.50 m at 15 m/s flight velocity',
        toleranceMargin: '1.82 m minimum maintained',
        safetyGoverningStandard: 'STANAG 4586 Level 4 Anti-Collision',
        status: 'MANDATORY AIRWORTHINESS',
      },
    ],
    scheduledMatrix: [
      {
        jobId: 'SCHED-SWARM-SOAK',
        scheduledTime: '04:00 UTC (Nightly)',
        batchSize: 500,
        parallelGpuNodes: 64,
        scenarioPreset: 'EW Swarm Resilience Suite v3.2',
        layoutId: 'LAY-SWARM-01 (Urban Canyon)',
        faultProfileId: 'FLT-NET-SWARM (GNSS Spoofing)',
        estimatedDurationMin: 28,
        ciTrigger: 'Nightly Soak Matrix (02:00 UTC)',
        status: 'SCHEDULED',
      },
    ],
  },
};

export const AiScenarioGenerationStudio: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<ScenarioArchetypeId>('defense_coanda');
  const [activeTab, setActiveTab] = useState<ScenarioStudioTab>('distributions');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>('');
  const [synthesizedBatchCount, setSynthesizedBatchCount] = useState<number>(500);
  const [notification, setNotification] = useState<string | null>(null);

  const preset = SCENARIO_PRESETS[selectedPresetId];

  const handleSynthesizeWithAi = () => {
    setIsGeneratingAi(true);
    setNotification(null);

    setTimeout(() => {
      setIsGeneratingAi(false);
      setNotification(`Synthesized ${synthesizedBatchCount} multi-physics test cases using Gemini Reasoning! Latin Hypercube parameter distributions, layout clutter variations, and fault profiles generated.`);
      setTimeout(() => setNotification(null), 4500);
    }, 1200);
  };

  const handleExportTestMatrixPack = () => {
    const pack = {
      metadata: {
        title: 'AIGENESIS AI-Assisted Scenario Generation & Test Matrix Pack',
        archetype: preset.name,
        domain: preset.domain,
        governingStandard: preset.governingStandard,
        timestamp: new Date().toISOString(),
        synthesizedBatchSize: synthesizedBatchCount,
      },
      parameterDistributions: preset.distributions,
      layoutVariations: preset.layouts,
      sensorAndActuatorFaultProfiles: preset.faults,
      formalAcceptanceCriteria: preset.criteria,
      scheduledCiCdTestMatrix: preset.scheduledMatrix,
    };

    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIGENESIS_SCENARIO_MATRIX_${selectedPresetId.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setNotification('Exported complete Scenario Matrix Pack (.JSON) successfully!');
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-8 animate-fadeIn font-mono pb-16">
      {/* Studio Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-purple-400">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI SCENARIO GENERATION & TEST MATRIX</span>
            </span>
            <span>·</span>
            <span className="text-emerald-400">Latin Hypercube & Gaussian Sampling</span>
            <span>·</span>
            <span className="text-amber-300">Continuous CI/CD Air-Gapped Sweep</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI-Assisted Scenario Generation & Test Matrix Studio
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl font-sans">
            Automatically generate high-coverage test suites: parameter distributions across real physics bounds, procedural scene & layout clutter variations, sensor/actuator fault profiles, formal acceptance gates, and automated scheduled test matrices for nightly regression.
          </p>
        </div>

        {/* Action Controls */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleSynthesizeWithAi}
            disabled={isGeneratingAi}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-xs font-bold transition cursor-pointer shadow-lg shadow-purple-500/10 disabled:opacity-60"
          >
            <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isGeneratingAi ? 'animate-spin' : ''}`} />
            <span>{isGeneratingAi ? 'Synthesizing Space...' : 'Synthesize Scenarios via AI'}</span>
          </button>

          <button
            onClick={handleExportTestMatrixPack}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Test Matrix Pack (.JSON)</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Target System Preset Selector Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-8 flex flex-wrap items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
          {(Object.keys(SCENARIO_PRESETS) as ScenarioArchetypeId[]).map((id) => {
            const item = SCENARIO_PRESETS[id];
            const active = selectedPresetId === id;
            return (
              <button
                key={id}
                onClick={() => setSelectedPresetId(id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono transition cursor-pointer ${
                  active
                    ? 'bg-purple-500 text-slate-950 font-bold shadow-md shadow-purple-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.name.split(' (')[0].split(' &')[0]}
              </button>
            );
          })}
        </div>

        {/* Global Evaluation Metric Pill */}
        <div className="lg:col-span-4 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="text-slate-400">
            Standard: <span className="text-emerald-400 font-bold">{preset.governingStandard.split(' / ')[0]}</span>
          </div>
          <div className="text-slate-400">
            Batch: <span className="text-white font-bold">{synthesizedBatchCount} Runs</span>
          </div>
        </div>
      </div>

      {/* Interactive AI Scenario Prompt Synthesizer Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/30 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-purple-300 font-bold">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Scenario Prompt (Gemini Reasoning Inversion)</span>
          </span>
          <span className="text-slate-400 text-[11px]">Domain: {preset.domain}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={aiCustomPrompt || preset.seedPrompt}
            onChange={(e) => setAiCustomPrompt(e.target.value)}
            placeholder="Describe operational constraints, weather conditions, or hardware degradations..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-purple-500 transition"
          />
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={synthesizedBatchCount}
              onChange={(e) => setSynthesizedBatchCount(Number(e.target.value))}
              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
            >
              <option value={100}>100 Scenarios (Fast Gate)</option>
              <option value={500}>500 Scenarios (Standard)</option>
              <option value={2000}>2,000 Scenarios (Soak)</option>
              <option value={5000}>5,000 Scenarios (Flight Cert)</option>
            </select>

            <button
              onClick={handleSynthesizeWithAi}
              disabled={isGeneratingAi}
              className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* 5 Core Feature Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'distributions', label: '1. Parameter Distributions', icon: Sliders },
          { id: 'layouts', label: '2. Scenario Assets & Layouts', icon: Boxes },
          { id: 'fault_profiles', label: '3. Sensor & Actuator Faults', icon: AlertTriangle },
          { id: 'acceptance_criteria', label: '4. Acceptance Criteria Gates', icon: ShieldCheck },
          { id: 'test_matrix', label: '5. Scheduled Test Matrix', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ScenarioStudioTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 border border-purple-500/50 text-purple-300 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PARAMETER DISTRIBUTIONS */}
      {activeTab === 'distributions' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-purple-400 font-bold uppercase">
                  MULTI-PHYSICS STOCHASTIC PARAMETER SAMPLING
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Latin Hypercube, Gaussian & Long-Tail Distribution Profiles
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
                Active Space: 4 Continuous Physical Dimensions
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Real world hardware never operates at single nominal CAD values. Parameter distributions define the statistical variability of pressures, machining offsets, gust turbulence, and coil temperatures so Monte Carlo engines can explore the entire operational volume.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {preset.distributions.map((dist) => (
                <div key={dist.name} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {dist.name} ({dist.symbol})
                      </h4>
                      <span className="text-[10px] text-purple-400 font-mono">{dist.distributionType}</span>
                    </div>

                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 font-mono">
                      Nominal: {dist.nominal} {dist.unit}
                    </span>
                  </div>

                  {/* Distribution Mini-Bar Graph */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Min: {dist.min} {dist.unit}</span>
                      <span className="text-purple-300">Mean: {dist.mean} ± {dist.stdDev}</span>
                      <span>Max: {dist.max} {dist.unit}</span>
                    </div>

                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                      <div className="bg-slate-700 h-full" style={{ width: '20%' }} />
                      <div className="bg-purple-500 h-full" style={{ width: '60%' }} title="68% Confidence Interval (±1σ)" />
                      <div className="bg-amber-500 h-full" style={{ width: '20%' }} title="Adversarial Corner Tail (P99)" />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>95% CI Range</span>
                      <span className="text-amber-400">Synthetic P99 Worst-Case: {dist.syntheticP99Value} {dist.unit}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 font-sans pt-1 border-t border-slate-900">
                    {dist.physicsContext}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCENARIO ASSETS & LAYOUT VARIATIONS */}
      {activeTab === 'layouts' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-cyan-400 font-bold uppercase">
                  PROCEDURAL 3D ENVIRONMENT & OBSTACLE CLUTTER
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Scenario Assets, Lighting Transients & Environmental Geometry
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
                USD / Isaac Sim Compatible Prefabs
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Layout variations prevent perception and planning policies from overfitting to a sterile simulation box. Each scene procedurally randomizes obstacle density, lighting glare, surface roughness, and spatial occlusion.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {preset.layouts.map((layout) => (
                <div key={layout.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">{layout.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        layout.complexity === 'Adversarial Cluttered'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : layout.complexity === 'High'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {layout.complexity}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm leading-snug">{layout.name}</h4>
                    <p className="text-xs text-slate-300 font-sans">{layout.description}</p>

                    <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-slate-900 text-slate-400">
                      <div>Obstacles: <strong className="text-slate-200">{layout.objectCount} bodies</strong> ({layout.obstacleType})</div>
                      <div>Lighting: <strong className="text-slate-200">{layout.lightingCondition}</strong></div>
                      <div>Surface: <strong className="text-slate-200">{layout.surfaceTexture}</strong></div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Collision / Detachment Risk:</span>
                    <strong className={layout.collisionRiskScorePct > 60 ? 'text-rose-400' : 'text-emerald-400'}>
                      {layout.collisionRiskScorePct}%
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SENSOR & ACTUATOR FAULT PROFILES */}
      {activeTab === 'fault_profiles' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-rose-400 font-bold uppercase">
                  ACTIVE FAULT INJECTION TIMELINES
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Sensor Drift, Actuator Deadband Slack, and Bus Dropouts
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
                Simulated Hardware Degraded States
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Fault profiles simulate physical degradation, wiring degradation, sensor resonance, and spool wear injected at precise millisecond timestamps during critical flight or grasp maneuvers.
            </p>

            <div className="space-y-4 pt-2">
              {preset.faults.map((flt) => (
                <div key={flt.id} className="p-5 rounded-2xl bg-slate-950 border border-rose-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-rose-400 font-mono tracking-wider">
                        {flt.targetType} · {flt.id}
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">{flt.name}</h4>
                    </div>

                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-mono uppercase ${
                      flt.severity.includes('CRITICAL')
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {flt.severity}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Injection Timing</div>
                      <div className="font-bold text-white mt-0.5">{flt.injectionTimeMs}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Magnitude / Offset</div>
                      <div className="font-bold text-rose-300 mt-0.5">{flt.magnitude}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Failure Pattern</div>
                      <div className="font-bold text-amber-300 mt-0.5">{flt.failurePattern}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs font-sans text-emerald-200">
                    <strong>Expected Control Mitigation:</strong> {flt.expectedMitigation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACCEPTANCE CRITERIA */}
      {activeTab === 'acceptance_criteria' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-emerald-400 font-bold uppercase">
                  FORMAL REGULATORY PASS/FAIL GATES
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Acceptance Criteria for Hardware Sign-Off & Flight Readiness
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
                MIL-STD / ISO / FDA Requirements Traceability
              </span>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-3">Req ID</th>
                    <th className="py-3 px-3">Evaluation Metric</th>
                    <th className="py-3 px-3">Pass / Fail Rule</th>
                    <th className="py-3 px-3">Tolerance Headroom</th>
                    <th className="py-3 px-3">Governing Standard</th>
                    <th className="py-3 px-3">Gating Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {preset.criteria.map((crit) => (
                    <tr key={crit.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-3 font-bold text-purple-400">{crit.requirementTag}</td>
                      <td className="py-3.5 px-3 font-semibold text-white">{crit.metric}</td>
                      <td className="py-3.5 px-3 text-slate-300 font-sans">{crit.passRule}</td>
                      <td className="py-3.5 px-3 font-semibold text-emerald-400">{crit.toleranceMargin}</td>
                      <td className="py-3.5 px-3 text-slate-400">{crit.safetyGoverningStandard}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          {crit.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SCHEDULED TEST MATRIX */}
      {activeTab === 'test_matrix' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-amber-400 font-bold uppercase">
                  CONTINUOUS CI/CD AUTOMATED SCHEDULED SWEEPS
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Scheduled Test Matrix for Nightly Soaks & Pull-Request Gates
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
                Parallel Isaac Lab GPU Cluster Orchestrator
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Automatically trigger scheduled sweeps across parameter distributions and fault profiles. When engineers update URDF models, control gains, or neural policy checkpoints, the matrix validates that zero acceptance criteria regress.
            </p>

            <div className="space-y-4 pt-2">
              {preset.scheduledMatrix.map((item) => (
                <div key={item.jobId} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 font-mono">
                        JOB ID: {item.jobId}
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">{item.ciTrigger}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                        {item.status}
                      </span>
                      <span className="text-xs text-slate-400">Schedule: <strong className="text-white">{item.scheduledTime}</strong></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Batch Size</div>
                      <div className="font-bold text-white mt-0.5">{item.batchSize} Parallel Runs</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">GPU Nodes</div>
                      <div className="font-bold text-purple-300 mt-0.5">{item.parallelGpuNodes} A100/H100 Nodes</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Layout Config</div>
                      <div className="font-bold text-slate-200 mt-0.5 truncate">{item.layoutId.split(' ')[0]}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Est. Duration</div>
                      <div className="font-bold text-emerald-300 mt-0.5">{item.estimatedDurationMin} minutes</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-900 text-xs">
                    <span className="text-slate-400">
                      Target Preset: <strong className="text-slate-200">{item.scenarioPreset}</strong> · Fault: <strong className="text-rose-400">{item.faultProfileId.split(' ')[0]}</strong>
                    </span>
                    <button
                      onClick={() => {
                        setNotification(`Triggered immediate cloud execution of ${item.jobId} across ${item.parallelGpuNodes} GPU nodes!`);
                        setTimeout(() => setNotification(null), 3500);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold border border-slate-700 hover:border-cyan-500/50 transition cursor-pointer text-xs"
                    >
                      Run Batch Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
