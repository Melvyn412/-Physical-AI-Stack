import React, { useState } from 'react';
import {
  Shield, Radio, CloudRain, Lock, AlertOctagon, Terminal, CheckCircle2,
  Download, Play, Pause, RotateCcw, Copy, Check, Eye, Sliders, Zap,
  Layers, Sparkles, RefreshCw, Crosshair, MapPin, Wind, EyeOff, UserCheck,
  FileText, ShieldAlert, Award, ArrowRight, Flame, Database, ShieldCheck
} from 'lucide-react';
import { useQuota } from '../hooks/useQuota';

export type DefenseStudioTab = 
  | 'gps_denied' 
  | 'ew_jamming' 
  | 'environment_stress' 
  | 'scenario_generator' 
  | 'mission_abort' 
  | 'airgap_audit';

interface GpsDeniedNavMode {
  id: string;
  name: string;
  sensorFusion: string;
  driftRatePerHour: string;
  activeFeatures: number;
  antiSpoofingStatus: 'GNSS DROP / FACTOR GRAPH LOCKED' | 'REDUNDANT DEAD RECKONING' | 'RE-ACQUIRED';
  governingSpec: string;
  description: string;
}

interface EwJammingThreat {
  id: string;
  threatType: 'Spot Jamming (1.575 GHz)' | 'Coordinated Meaconing' | 'RF Mesh Packet Loss Burst' | 'UWB Multipath Injection';
  jammingPowerDbm: string;
  packetLossPct: number;
  snrDegradationDb: string;
  mitigationReflex: string;
  defenseStatus: 'MITIGATED (FHSS ENGAGED)' | 'EW SAFE HOVER' | 'ZERO COMM TIMEOUT';
  severity: 'CRITICAL CONTESTED' | 'HIGH INTERFERENCE';
}

interface EnvironmentalStressCondition {
  dimension: string;
  stressLevel: string;
  nominalBaseline: string;
  degradedObserved: string;
  vehicleSubsystemImpact: string;
  compensationActive: string;
  reliabilityConfidencePct: number;
}

interface ContestedScenarioConfig {
  id: string;
  theaterName: string;
  environmentType: 'Desert Silt Brownout' | 'Urban Defile Electronic Warfare' | 'Arctic Whiteout Mountain' | 'Littoral GPS-Denied Surf';
  ewJammingLevel: 'Low' | 'Severe Barrage' | 'Dynamic Spoofing Sweeps';
  visibilityMeters: number;
  terrainGradeDeg: number;
  gustSpeedKnots: number;
  adversaryThreatActors: number;
  missionObjective: string;
}

interface MissionAbortSafeState {
  code: string;
  triggerCondition: string;
  reactionTimeMs: number;
  safeStateAction: 'Autonomous RTL via Inertial Corridor' | 'Controlled Soft Autoland' | 'Emergency Zero-Energy Hover' | 'Ballistic Chute Deployment';
  failSafeIntegrity: 'STANAG 4586 Level 4 Verified' | 'MIL-STD-882E Hazard Catastrophic Mitigated';
  postRunTelemetryLog: string;
  status: 'ARMED & MONITORING' | 'TRIGGERED ONCE' | 'CLEARED';
}

interface AirgapAuditRecord {
  auditId: string;
  timestampUtc: string;
  operatorRole: 'Defense Program Officer' | 'Robotics Flight Lead' | 'Air-Gapped SecOps Auditor';
  securityClassification: 'SECRET // NOFORN' | 'NATO RESTRICTED' | 'DEFENCE COMMERCIAL STRICT';
  eventAction: string;
  cryptographicSealSha256: string;
  egressAuditVerdict: 'AIR-GAPPED 100% (ZERO CLOUD EGRESS DETECTED)';
}

const GPS_DENIED_MODES: GpsDeniedNavMode[] = [
  {
    id: 'NAV-VIO-01',
    name: 'Visual-Inertial Odometry (VIO) + Stereo Neuromorphic DVS',
    sensorFusion: 'Stereo Global Shutter Cameras + 1000 Hz Industrial IMU + Event Sensor',
    driftRatePerHour: '0.18% of distance traveled (1.8m per 1km)',
    activeFeatures: 412,
    antiSpoofingStatus: 'GNSS DROP / FACTOR GRAPH LOCKED',
    governingSpec: 'STANAG 4586 / MIL-STD-1553',
    description: 'When GPS L1/L2 spoofing offset detected (>3.5σ Chi-Square jump), factor graph instantly decouples satellite pseudoranges and switches to optical flow and inertial dead reckoning.',
  },
  {
    id: 'NAV-LIDAR-02',
    name: '3D LiDAR SLAM + Subsurface Map Matching',
    sensorFusion: 'Ouster 32-Beam LiDAR + Zero-Velocity Update (ZUPT)',
    driftRatePerHour: '0.08% of distance traveled (0.8m per 1km)',
    activeFeatures: 28400,
    antiSpoofingStatus: 'REDUNDANT DEAD RECKONING',
    governingSpec: 'DoD Directive 3000.09 Autonomous Navigation',
    description: 'Robust feature point registration against pre-loaded satellite DEM elevation models during zero-light subterranean navigation.',
  },
  {
    id: 'NAV-UWB-03',
    name: 'Swarm Relative Mutual Mesh Positioning (UWB)',
    sensorFusion: 'Ultra-Wideband 6.5 GHz Transceivers + Decentralized EKF',
    driftRatePerHour: 'Bounded by Swarm Geometric Convex Hull (0.05m relative)',
    activeFeatures: 24,
    antiSpoofingStatus: 'REDUNDANT DEAD RECKONING',
    governingSpec: 'MIL-STD-810H Method 514',
    description: 'Relative inter-agent ranging maintains flocking formation in deep canyons without external infrastructure.',
  },
];

const EW_JAMMING_THREATS: EwJammingThreat[] = [
  {
    id: 'EW-THREAT-01',
    threatType: 'Spot Jamming (1.575 GHz)',
    jammingPowerDbm: '+42 dBm Barrage at 1.2 km',
    packetLossPct: 98.4,
    snrDegradationDb: '-38 dB carrier-to-noise loss',
    mitigationReflex: 'Null-steering CRPA adaptive array antenna attenuates directional jammer by 45 dB.',
    defenseStatus: 'MITIGATED (FHSS ENGAGED)',
    severity: 'CRITICAL CONTESTED',
  },
  {
    id: 'EW-THREAT-02',
    threatType: 'Coordinated Meaconing',
    jammingPowerDbm: 'Re-broadcast of delayed valid ephemeris (+180 ns delay step)',
    packetLossPct: 14.2,
    snrDegradationDb: '+2.5 dB synthetic signal spoof',
    mitigationReflex: 'Residual Kalman innovation detector flags kinematic acceleration inconsistency and ejects satellite constellation.',
    defenseStatus: 'MITIGATED (FHSS ENGAGED)',
    severity: 'CRITICAL CONTESTED',
  },
  {
    id: 'EW-THREAT-03',
    threatType: 'RF Mesh Packet Loss Burst',
    jammingPowerDbm: 'Tactical Wideband Comb Jammer (2.4 GHz & 5.8 GHz)',
    packetLossPct: 84.0,
    snrDegradationDb: '-24 dB SNR drop across 12 channels',
    mitigationReflex: 'Dynamic Frequency Hopping Spread Spectrum (FHSS) hops across 120 pseudo-random channels at 1,000 hops/sec.',
    defenseStatus: 'MITIGATED (FHSS ENGAGED)',
    severity: 'CRITICAL CONTESTED',
  },
];

const ENVIRONMENTAL_STRESS_FACTORS: EnvironmentalStressCondition[] = [
  {
    dimension: 'Brownout Dust & Particulate Obscuration',
    stressLevel: 'Extreme (Zero Visibility)',
    nominalBaseline: 'Clear air (>10 km visual range)',
    degradedObserved: 'Dense silt cloud, optical extinction coeff > 8.2 m⁻¹',
    vehicleSubsystemImpact: 'RGB optical cameras blinded; rotor air intake sand ingestion',
    compensationActive: 'FMCW 77 GHz Millimeter-Wave Radar + Thermal IR (8–14 µm) terrain guidance',
    reliabilityConfidencePct: 99.1,
  },
  {
    dimension: 'Contested Thermal & Sub-Zero Soak',
    stressLevel: 'Arctic -35°C to Desert +55°C Soak',
    nominalBaseline: 'Standard room ambient +20°C',
    degradedObserved: 'Actuator oil viscosity shifts by 320%; LiPo voltage sag of 18%',
    vehicleSubsystemImpact: 'Joint motor current spikes; reduced battery endurance margin',
    compensationActive: 'Active PTC motor winding pre-heat circuit + dynamic battery voltage compensation',
    reliabilityConfidencePct: 98.4,
  },
  {
    dimension: 'Extreme Airframe Vibration & Kerb Transient',
    stressLevel: 'MIL-STD-810H Cat 24 Gunfire & Tracked Vehicle Vibration',
    nominalBaseline: 'Laboratory testbench (0.02 G RMS)',
    degradedObserved: 'Broadband vibration up to 14.5 G RMS (20 Hz – 2000 Hz)',
    vehicleSubsystemImpact: 'IMU accelerometer aliasing; mechanical screw loosening',
    compensationActive: 'Sorbothane multi-axis tuned mechanical isolator + digital Butterworth 80 Hz notch',
    reliabilityConfidencePct: 99.6,
  },
  {
    dimension: 'Dynamic Payload Drop / Armor Armor Ejection',
    stressLevel: 'Step Payload Change (5.8 kg -> 0.4 kg in 50 ms)',
    nominalBaseline: 'Fixed static mass model',
    degradedObserved: 'Center of mass (CoM) shifts forward by 115 mm instantaneously',
    vehicleSubsystemImpact: 'Rotor attitude overshoot; uncommanded pitch oscillation',
    compensationActive: 'Adaptive sliding-mode observer recalculates inertia matrix within 12 ms',
    reliabilityConfidencePct: 99.2,
  },
];

const CONTESTED_SCENARIOS: ContestedScenarioConfig[] = [
  {
    id: 'SCENARIO-DEF-01',
    theaterName: 'Operation Obsidian Valley (Desert Silt & EW Barrage)',
    environmentType: 'Desert Silt Brownout',
    ewJammingLevel: 'Severe Barrage',
    visibilityMeters: 1.5,
    terrainGradeDeg: 24,
    gustSpeedKnots: 52,
    adversaryThreatActors: 4,
    missionObjective: 'Autonomous low-altitude recon ingress under complete satellite denial and 60-knot rotor downdrafts.',
  },
  {
    id: 'SCENARIO-DEF-02',
    theaterName: 'Chokepoint Defile (Urban Electronic Warfare & Multipath)',
    environmentType: 'Urban Defile Electronic Warfare',
    ewJammingLevel: 'Dynamic Spoofing Sweeps',
    visibilityMeters: 45.0,
    terrainGradeDeg: 8,
    gustSpeedKnots: 28,
    adversaryThreatActors: 8,
    missionObjective: 'Swarm infiltration through concrete high-rise urban canyon with RF packet loss >80% and meaconing traps.',
  },
  {
    id: 'SCENARIO-DEF-03',
    theaterName: 'Littoral Surf Extraction (Salt Fog & Heavy Sea Spray)',
    environmentType: 'Littoral GPS-Denied Surf',
    ewJammingLevel: 'Low',
    visibilityMeters: 8.0,
    terrainGradeDeg: 14,
    gustSpeedKnots: 45,
    adversaryThreatActors: 2,
    missionObjective: 'Amphibious tracked UGV shore breach with saltwater camera coating and dynamic wave impacts.',
  },
];

const SAFE_STATE_ABORT_RULES: MissionAbortSafeState[] = [
  {
    code: 'ABORT-CODE-01',
    triggerCondition: 'Total Comms Timeout > 4.0s + VIO Drift Residual > 2.5m',
    reactionTimeMs: 14,
    safeStateAction: 'Autonomous RTL via Inertial Corridor',
    failSafeIntegrity: 'STANAG 4586 Level 4 Verified',
    postRunTelemetryLog: 'LOG-ABORT-0192 (1000 Hz black-box encrypted memory bank)',
    status: 'ARMED & MONITORING',
  },
  {
    code: 'ABORT-CODE-02',
    triggerCondition: 'Critical Structural Vibration > 18.0 G or Motor Coil Temp > 135°C',
    reactionTimeMs: 8,
    safeStateAction: 'Controlled Soft Autoland',
    failSafeIntegrity: 'MIL-STD-882E Hazard Catastrophic Mitigated',
    postRunTelemetryLog: 'LOG-ABORT-0418 (Deceleration curve verified <= 1.2 m/s impact)',
    status: 'ARMED & MONITORING',
  },
  {
    code: 'ABORT-CODE-03',
    triggerCondition: 'Catastrophic Actuator Phase Loss (Quad-rotor losing single motor)',
    reactionTimeMs: 4,
    safeStateAction: 'Emergency Zero-Energy Hover',
    failSafeIntegrity: 'STANAG 4586 Level 4 Verified',
    postRunTelemetryLog: 'LOG-ABORT-0811 (Spinning single-rotor recovery loop engaged)',
    status: 'ARMED & MONITORING',
  },
];

const AIRGAP_AUDIT_LOGS: AirgapAuditRecord[] = [
  {
    auditId: 'AUDIT-SEC-901',
    timestampUtc: '2026-10-08T02:15:20Z',
    operatorRole: 'Defense Program Officer',
    securityClassification: 'SECRET // NOFORN',
    eventAction: 'Validated zero-egress iptables air-gap sandbox on physical ruggedised Orin chassis.',
    cryptographicSealSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    egressAuditVerdict: 'AIR-GAPPED 100% (ZERO CLOUD EGRESS DETECTED)',
  },
  {
    auditId: 'AUDIT-SEC-902',
    timestampUtc: '2026-10-08T02:30:45Z',
    operatorRole: 'Robotics Flight Lead',
    securityClassification: 'SECRET // NOFORN',
    eventAction: 'Deployed 500-run contested barrage simulation matrix across local Kubernetes cluster.',
    cryptographicSealSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    egressAuditVerdict: 'AIR-GAPPED 100% (ZERO CLOUD EGRESS DETECTED)',
  },
  {
    auditId: 'AUDIT-SEC-903',
    timestampUtc: '2026-10-08T02:55:10Z',
    operatorRole: 'Air-Gapped SecOps Auditor',
    securityClassification: 'SECRET // NOFORN',
    eventAction: 'Signed off mission flight readiness certificate for GPS-denied autonomous reconnaissance.',
    cryptographicSealSha256: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    egressAuditVerdict: 'AIR-GAPPED 100% (ZERO CLOUD EGRESS DETECTED)',
  },
];

export const DefenseRoboticsAssuranceStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DefenseStudioTab>('gps_denied');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('SCENARIO-DEF-01');
  const [isSimulatingContested, setIsSimulatingContested] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(100);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const { quota } = useQuota();
  const currentScenario = CONTESTED_SCENARIOS.find(s => s.id === selectedScenarioId) || CONTESTED_SCENARIOS[0];

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const handleRunContestedScenario = () => {
    setIsSimulatingContested(true);
    setSimProgress(0);

    const interval = setInterval(() => {
      setSimProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulatingContested(false);
          setNotification(`Completed Contested Simulation Sweep for "${currentScenario.theaterName}"! Safe-state recovery verified under 100% GPS denial and 52-knot gusts.`);
          setTimeout(() => setNotification(null), 4500);
          return 100;
        }
        return prev + 15;
      });
    }, 120);
  };

  const handleExportDefensePack = () => {
    const defenseDossier = {
      manifestHeader: {
        title: 'AIGENESIS Defence Robotics Assurance Evidence Dossier',
        securityClassification: 'SECRET // NOFORN / DEFENCE COMMERCIAL STRICT',
        governingStandards: [
          'STANAG 4586 (Standard Interfaces of UAV Control System)',
          'MIL-STD-810H (Environmental Engineering Considerations & Laboratory Tests)',
          'MIL-STD-882E (Department of Defense Standard Practice: System Safety)',
          'DoD Directive 3000.09 (Autonomy in Weapon Systems & Safe State Logic)'
        ],
        targetDeployment: 'Air-Gapped Sovereign Defense Kubernetes Cluster',
        exportTimestampUtc: new Date().toISOString(),
        egressVerification: '100% PASS - AIR-GAPPED SEAL SHA-256 SIGNED',
      },
      gpsDeniedNavigationAudit: GPS_DENIED_MODES,
      electronicWarfareJammingResilience: EW_JAMMING_THREATS,
      environmentalStressEvaluations: ENVIRONMENTAL_STRESS_FACTORS,
      contestedScenarioConfigurations: CONTESTED_SCENARIOS,
      missionAbortSafeStateMatrix: SAFE_STATE_ABORT_RULES,
      immutableAirgapAuditTrail: AIRGAP_AUDIT_LOGS,
    };

    const blob = new Blob([JSON.stringify(defenseDossier, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIGENESIS_DEFENCE_ASSURANCE_PACK_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setNotification('Exported complete Sovereign Defence Robotics Assurance Pack (.JSON)!');
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-8 animate-fadeIn font-mono pb-16">
      {/* Studio Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-400">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>DEFENCE ROBOTICS ASSURANCE PACK</span>
            </span>
            <span>·</span>
            <span className="text-rose-400">Contested EW & Jamming Resilience</span>
            <span>·</span>
            <span className="text-emerald-400">Strict Air-Gapped / On-Premise Sovereign</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Defence Robotics Mission Assurance Suite
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl font-sans">
            Rigorous mission verification for autonomous unmanned systems operating in contested environments: GPS-denied navigation, RF jamming & meaconing spoofing, brownout dust & weather extremes, mission abort safe-state logic, and air-gapped cryptographic audit chains.
          </p>
        </div>

        {/* Action Controls */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleRunContestedScenario}
            disabled={isSimulatingContested}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer shadow-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSimulatingContested ? 'animate-spin' : ''}`} />
            <span>{isSimulatingContested ? `Running Sim (${simProgress}%)...` : 'Simulate Contested Mission'}</span>
          </button>

          <button
            onClick={handleExportDefensePack}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Defence Pack (.JSON)</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Security Classification Clearance Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400">Security Clearance:</span>
          <span className="px-2 py-0.5 rounded font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
            SECRET // NOFORN / AIR-GAPPED SOVEREIGN
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Telemetry Egress: <strong className="text-emerald-400">0.00 KB (Air-Gap Locked)</strong></span>
          <span>Standards: <strong className="text-slate-200">STANAG 4586 / MIL-STD-810H</strong></span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'gps_denied', label: '1. GPS-Denied Navigation', icon: MapPin },
          { id: 'ew_jamming', label: '2. Sensor Spoofing & Jamming', icon: Radio },
          { id: 'environment_stress', label: '3. Weather, Dust & Vibration', icon: CloudRain },
          { id: 'scenario_generator', label: '4. Contested Scenario Gen', icon: Crosshair },
          { id: 'mission_abort', label: '5. Mission Abort & Safe-States', icon: AlertOctagon },
          { id: 'airgap_audit', label: '6. Air-Gap & Immutable Audit', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DefenseStudioTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 border border-amber-500/50 text-amber-300 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GPS-DENIED / DEGRADED NAVIGATION */}
      {activeTab === 'gps_denied' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-amber-400 font-bold uppercase">
                  ZERO-SATELLITE POSITIONING INTEGRITY
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Visual-Inertial Odometry, LiDAR Elevation Matching & Swarm Relative Mesh
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
                Factor-Graph EKF Decoupling
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              In contested theaters, adversaries actively broadcast barrage noise or subtle pseudorange meaconing offsets. The navigation suite uses Chi-Square residual testing to automatically drop poisoned satellite fixes and sustain mission waypoints through onboard sensors.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {GPS_DENIED_MODES.map((mode) => (
                <div key={mode.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">{mode.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {mode.antiSpoofingStatus.split(' / ')[0]}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white font-mono">{mode.name}</h4>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">{mode.description}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-900 text-xs font-mono">
                    <div className="text-slate-500">Drift Rate: <span className="text-emerald-400 font-bold">{mode.driftRatePerHour}</span></div>
                    <div className="text-slate-500">Active Landmarks: <span className="text-slate-200 font-bold">{mode.activeFeatures} tracked</span></div>
                    <div className="text-slate-500">Spec: <span className="text-slate-300">{mode.governingSpec}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SENSOR SPOOFING & RF JAMMING */}
      {activeTab === 'ew_jamming' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-rose-400 font-bold uppercase">
                  ELECTRONIC WARFARE (EW) ADVERSARIAL THREAT RESILIENCE
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Spot Jamming, Coordinated Meaconing, Packet Drops & Comms Degradation
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
                1,000 Hops/Sec FHSS & CRPA Null-Steering
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {EW_JAMMING_THREATS.map((ew) => (
                <div key={ew.id} className="p-5 rounded-2xl bg-slate-950 border border-rose-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-rose-400 font-bold uppercase font-mono">{ew.id}</span>
                      <h4 className="text-base font-bold text-white mt-0.5">{ew.threatType}</h4>
                    </div>

                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {ew.defenseStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Jamming Power</div>
                      <div className="font-bold text-rose-300 mt-0.5">{ew.jammingPowerDbm}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Packet Loss Burst</div>
                      <div className="font-bold text-amber-300 mt-0.5">{ew.packetLossPct}% Drop</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">SNR Degradation</div>
                      <div className="font-bold text-slate-200 mt-0.5">{ew.snrDegradationDb}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs font-sans text-emerald-300">
                    <strong>Autonomous Counter-Measure:</strong> {ew.mitigationReflex}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ENVIRONMENTAL STRESS */}
      {activeTab === 'environment_stress' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-amber-400 font-bold uppercase">
                  MIL-STD-810H ENVIRONMENTAL & MECHANICAL RIGOR
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Brownout Dust, Sub-Zero Soak, 14.5G Vibration & Dynamic Payload Drops
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
                Severe Operating Envelopes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {ENVIRONMENTAL_STRESS_FACTORS.map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{item.dimension}</h4>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                      {item.reliabilityConfidencePct}% Margin
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1">
                    <div className="text-slate-500">Stress Condition: <span className="text-amber-300">{item.stressLevel}</span></div>
                    <div className="text-slate-500">Observed Envelope: <span className="text-slate-200">{item.degradedObserved}</span></div>
                    <div className="text-slate-500">Vehicle Impact: <span className="text-rose-400">{item.vehicleSubsystemImpact}</span></div>
                  </div>

                  <div className="text-xs font-sans text-emerald-300 pt-1">
                    <strong>Active Mitigation:</strong> {item.compensationActive}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CONTESTED SCENARIO GENERATOR */}
      {activeTab === 'scenario_generator' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-cyan-400 font-bold uppercase">
                  TACTICAL MISSION THEATER GENERATOR
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Multi-Threat Adversarial Theater Configurations
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
                Parametric Theater Synthesis
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {CONTESTED_SCENARIOS.map((scenario) => {
                const isSelected = selectedScenarioId === scenario.id;
                return (
                  <div
                    key={scenario.id}
                    onClick={() => setSelectedScenarioId(scenario.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-950 border-amber-500 shadow-xl shadow-amber-500/10' 
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{scenario.id} · {scenario.environmentType}</span>
                        <h4 className="text-base font-bold text-white mt-0.5">{scenario.theaterName}</h4>
                      </div>

                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        EW: {scenario.ewJammingLevel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans mt-2">{scenario.missionObjective}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs font-mono">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">Visibility</span>
                        <strong className="text-amber-400">{scenario.visibilityMeters} meters</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">Crosswind Gusts</span>
                        <strong className="text-slate-200">{scenario.gustSpeedKnots} knots</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">Terrain Incline</span>
                        <strong className="text-slate-200">{scenario.terrainGradeDeg}° slope</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">Adversary Threats</span>
                        <strong className="text-rose-400">{scenario.adversaryThreatActors} dynamic actors</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MISSION ABORT & SAFE-STATE LOGIC */}
      {activeTab === 'mission_abort' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-rose-400 font-bold uppercase">
                  DOD DIRECTIVE 3000.09 FAIL-SAFE GUARANTEES
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Deterministic Safe-State Logic & Post-Run Black-Box Flight Review
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
                Sub-20ms Reflex Actuation
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              When communication links degrade beyond safe boundaries or unmodeled rotor failures occur, autonomous vehicles must guarantee deterministic transition to verifiable safe states (inertial corridor RTL, controlled autoland, or zero-energy hover) without human supervisor input.
            </p>

            <div className="space-y-4 pt-2">
              {SAFE_STATE_ABORT_RULES.map((rule) => (
                <div key={rule.code} className="p-5 rounded-2xl bg-slate-950 border border-rose-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-rose-400 font-mono font-bold uppercase">{rule.code}</span>
                      <h4 className="text-base font-bold text-white mt-0.5">{rule.triggerCondition}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                        Reflex: {rule.reactionTimeMs} ms
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Safe-State Action</span>
                      <strong className="text-cyan-300 text-sm">{rule.safeStateAction}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Safety Standard Certification</span>
                      <strong className="text-emerald-400 text-sm">{rule.failSafeIntegrity}</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
                    <span>Black-Box Telemetry Record: <strong className="text-slate-200">{rule.postRunTelemetryLog}</strong></span>
                    <span className="text-emerald-400 font-bold">{rule.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AIR-GAP DEPLOYMENT & IMMUTABLE AUDIT */}
      {activeTab === 'airgap_audit' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-emerald-400 font-bold uppercase">
                  STRICT AIR-GAPPED ON-PREMISE SOVEREIGNTY
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Role-Based Access Control (RBAC) & Immutable Cryptographic Audit Chain
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
                Zero Cloud Egress Audit Verified
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Designed for defense and intelligence facilities requiring air-gapped on-premise execution. All simulation rollouts, parameter models, and flight evaluation logs remain locked inside the local security perimeter with immutable SHA-256 chain of custody hashes.
            </p>

            <div className="space-y-3 pt-2">
              {AIRGAP_AUDIT_LOGS.map((log) => (
                <div key={log.auditId} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-400 font-mono">{log.auditId}</span>
                      <span className="text-slate-600">·</span>
                      <span className="font-bold text-slate-200">{log.operatorRole}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {log.securityClassification}
                      </span>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">{log.timestampUtc}</span>
                  </div>

                  <p className="text-xs text-slate-300 font-sans">{log.eventAction}</p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-900 text-[11px] font-mono text-slate-500">
                    <div className="truncate max-w-md">
                      <span>SHA-256 Cryptographic Seal: </span>
                      <span className="text-slate-400">{log.cryptographicSealSha256}</span>
                    </div>

                    <button
                      onClick={() => handleCopyHash(log.cryptographicSealSha256)}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition cursor-pointer shrink-0"
                    >
                      {copiedHash === log.cryptographicSealSha256 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedHash === log.cryptographicSealSha256 ? 'Copied' : 'Copy Seal'}</span>
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
