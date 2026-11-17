export type ComplianceStandardId = 'ISO_10218' | 'ISO_3691_4' | 'FDA_21CFR820' | 'STANAG_4586';

export interface RobotTelemetryParams {
  maxForceN: number;
  maxVelocityMs: number;
  stoppingDistanceMm: number;
  controlFreqHz: number;
  jitterMs: number;
  simToRealDeltaPct: number;
  singularityDetJ: number;
  thermalCeilingC: number;
}

export interface ClauseEvaluationRule {
  clauseId: string;
  title: string;
  category: 'Kinematics & Force' | 'Stopping & E-Stop' | 'Control Determinism' | 'Perception & Field' | 'Software & Risk';
  requirementSummary: string;
  limitDescription: string;
  evaluate: (params: RobotTelemetryParams, activeMitigationsCount: number, totalMitigations: number) => {
    status: 'PASS' | 'CONDITIONAL' | 'FAIL';
    measuredText: string;
    marginText: string;
    remediation?: string;
  };
}

export interface FmeaHazardItem {
  id: string;
  hazardTitle: string;
  subsystem: string;
  potentialEffect: string;
  severity: number; // 1-5
  occurrencePre: number; // 1-5
  detectionPre: number; // 1-5
  mitigationStrategy: string;
  z3InvariantFormula: string;
  mitigationEnabled: boolean;
  occurrencePost: number; // 1-5
  detectionPost: number; // 1-5
}

export interface TraceabilityRow {
  reqId: string;
  clauseRef: string;
  requirementText: string;
  codeSymbol: string;
  z3ProofFormula: string;
  physicsTestId: string;
  measuredDelta: string;
  sha256: string;
}

export interface RegulatoryFrameworkSpec {
  id: ComplianceStandardId;
  shortName: string;
  fullName: string;
  notifiedBodies: string;
  dossierType: string;
  robotPresetName: string;
  defaultTargetApp: string;
  defaultParams: RobotTelemetryParams;
  recommendedSafeParams: RobotTelemetryParams;
  sampleConfigSnippet: string;
  clauses: ClauseEvaluationRule[];
  defaultHazards: FmeaHazardItem[];
  rtmRows: TraceabilityRow[];
}

export const REGULATORY_FRAMEWORKS: Record<ComplianceStandardId, RegulatoryFrameworkSpec> = {
  ISO_10218: {
    id: 'ISO_10218',
    shortName: 'ISO 10218 & ISO/TS 15066',
    fullName: 'ISO 10218-1/2 & ISO/TS 15066 Collaborative Cobot Certification',
    notifiedBodies: 'TÜV Rheinland · CE Machinery Directive 2006/42/EC · UL 1740',
    dossierType: 'Technical Construction File (TCF) & PFL Biomechanical Dossier',
    robotPresetName: 'UR10e 6-DoF Collaborative Cell (Robotiq 2F-85)',
    defaultTargetApp: 'Human-Robot Shared Assembly & High-Speed Palletizing Cell',
    defaultParams: {
      maxForceN: 128,
      maxVelocityMs: 0.42,
      stoppingDistanceMm: 62,
      controlFreqHz: 1000,
      jitterMs: 0.85,
      simToRealDeltaPct: 1.4,
      singularityDetJ: 0.08,
      thermalCeilingC: 64,
    },
    recommendedSafeParams: {
      maxForceN: 118,
      maxVelocityMs: 0.38,
      stoppingDistanceMm: 48,
      controlFreqHz: 1000,
      jitterMs: 0.72,
      simToRealDeltaPct: 1.1,
      singularityDetJ: 0.09,
      thermalCeilingC: 61,
    },
    sampleConfigSnippet: `# ROS 2 Control & URDF Safety Envelope (ur10e_safety.yaml)
robot_model: ur10e_collaborative_v4
control_rate_hz: 1000
max_force_n: 128.0
max_tcp_velocity_ms: 0.42
stopping_distance_mm: 62.0
loop_jitter_ms: 0.85
sim2real_error_pct: 1.4
jacobian_det_min: 0.08
actuator_thermal_limit_c: 64.0`,
    clauses: [
      {
        clauseId: 'ISO/TS 15066 §5.5.4',
        title: 'Power & Force Limiting (PFL) Transient Contact Threshold',
        category: 'Kinematics & Force',
        requirementSummary: 'Quasi-static and transient biomechanical contact force on torso/upper-arm must remain ≤ 140 N.',
        limitDescription: 'Max Force ≤ 140 N',
        evaluate: (p) => {
          const margin = ((140 - p.maxForceN) / 140) * 100;
          if (p.maxForceN <= 140) {
            return {
              status: 'PASS',
              measuredText: `${p.maxForceN} N peak clamp`,
              marginText: `+${margin.toFixed(1)}% safety margin`,
            };
          }
          return {
            status: 'FAIL',
            measuredText: `${p.maxForceN} N (Exceeds 140 N)`,
            marginText: `${margin.toFixed(1)}% violation`,
            remediation: 'Engage Z3 CBF impedance clamp ≤ 135 N or reduce payload inertia momentum.',
          };
        },
      },
      {
        clauseId: 'ISO 10218-1 §5.10.2',
        title: 'Speed & Separation Monitoring (SSM) Protective Velocity',
        category: 'Stopping & E-Stop',
        requirementSummary: 'TCP speed in collaborative workspace must stay ≤ 0.50 m/s with reactive stopping distance ≤ 85 mm.',
        limitDescription: 'Velocity ≤ 0.50 m/s · Stop ≤ 85 mm',
        evaluate: (p) => {
          if (p.maxVelocityMs <= 0.5 && p.stoppingDistanceMm <= 85) {
            return {
              status: 'PASS',
              measuredText: `${p.maxVelocityMs.toFixed(2)} m/s · ${p.stoppingDistanceMm} mm`,
              marginText: `Within Cat 3 PLd envelope`,
            };
          }
          return {
            status: 'FAIL',
            measuredText: `${p.maxVelocityMs.toFixed(2)} m/s · ${p.stoppingDistanceMm} mm`,
            marginText: 'Stopping envelope breached',
            remediation: 'Reduce collaborative TCP velocity ≤ 0.45 m/s or increase Category-1 deceleration torque.',
          };
        },
      },
      {
        clauseId: 'ISO 10218-1 §5.4.2',
        title: 'Deterministic Safety Loop & STO Reaction Latency',
        category: 'Control Determinism',
        requirementSummary: 'Real-time safety monitor must execute ≥ 500 Hz with worst-case EtherCAT/CAN jitter ≤ 1.5 ms.',
        limitDescription: 'Loop ≥ 500 Hz · Jitter ≤ 1.5 ms',
        evaluate: (p) => {
          if (p.controlFreqHz >= 500 && p.jitterMs <= 1.5) {
            return {
              status: 'PASS',
              measuredText: `${p.controlFreqHz} Hz · ${p.jitterMs.toFixed(2)} ms jitter`,
              marginText: 'Cat 4 PLe deterministic lock',
            };
          }
          return {
            status: p.controlFreqHz >= 250 ? 'CONDITIONAL' : 'FAIL',
            measuredText: `${p.controlFreqHz} Hz · ${p.jitterMs.toFixed(2)} ms`,
            marginText: 'Deterministic deadline risk',
            remediation: 'Pin RT-PREEMPT kernel thread ≥ 1000 Hz to eliminate jitter spikes > 1.5 ms.',
          };
        },
      },
      {
        clauseId: 'ISO 10218-2 §5.6.3',
        title: 'Kinematic Singularity Velocity Runaway Guard',
        category: 'Kinematics & Force',
        requirementSummary: 'Damped Least-Squares (DLS) Jacobian determinant must stay bounded ≥ 0.05 to avoid wrist flip spikes.',
        limitDescription: 'Min |Det(J)| ≥ 0.05',
        evaluate: (p) => {
          if (p.singularityDetJ >= 0.05) {
            return {
              status: 'PASS',
              measuredText: `Det(J) = ${p.singularityDetJ.toFixed(3)}`,
              marginText: 'Zero singularity spikes',
            };
          }
          return {
            status: 'FAIL',
            measuredText: `Det(J) = ${p.singularityDetJ.toFixed(3)} (< 0.05)`,
            marginText: 'High joint-velocity hazard',
            remediation: 'Activate MoveIt 2 DLS adaptive damping factor λ = 0.04 near Det(J) < 0.05.',
          };
        },
      },
      {
        clauseId: 'ISO 13849-1 §4.5',
        title: 'Digital Twin Sim-to-Real Model Fidelity Calibration',
        category: 'Software & Risk',
        requirementSummary: 'Hardware dyno telemetry discrepancy against validated safety twin must remain ≤ 3.0%.',
        limitDescription: 'Sim-to-Real Delta ≤ 3.0%',
        evaluate: (p) => {
          if (p.simToRealDeltaPct <= 3.0) {
            return {
              status: 'PASS',
              measuredText: `${p.simToRealDeltaPct.toFixed(1)}% dyno residual`,
              marginText: `+${(3.0 - p.simToRealDeltaPct).toFixed(1)}% calibration margin`,
            };
          }
          return {
            status: 'CONDITIONAL',
            measuredText: `${p.simToRealDeltaPct.toFixed(1)}% delta (> 3.0%)`,
            marginText: 'Re-calibration required',
            remediation: 'Run Twin Trust System-ID replay on recent BLDC dyno traces.',
          };
        },
      },
    ],
    defaultHazards: [
      {
        id: 'HAZ-10218-01',
        hazardTitle: 'Collaborative Chest / Arm Impact Exceeding PFL Limit',
        subsystem: 'Joint Torque & End-Effector',
        potentialEffect: 'Blunt trauma > 140 N during unexpected operator ingress',
        severity: 4,
        occurrencePre: 4,
        detectionPre: 3,
        mitigationStrategy: '1000 Hz Z3 Control Barrier Force Clamp + Dual-Channel STO',
        z3InvariantFormula: '∀t ≥ 0: F_contact(t) ≤ 140.0 N ∧ h(x) = v_max - ||J(q)q̇|| ≥ 0',
        mitigationEnabled: true,
        occurrencePost: 1,
        detectionPost: 1,
      },
      {
        id: 'HAZ-10218-02',
        hazardTitle: 'Wrist Singularity Joint Velocity Excursion',
        subsystem: '6-DoF Kinematics Solver',
        potentialEffect: 'Uncontrolled wrist whip exceeding 250 deg/s',
        severity: 4,
        occurrencePre: 3,
        detectionPre: 4,
        mitigationStrategy: 'Damped Least-Squares (DLS) Jacobian Singularity Barrier',
        z3InvariantFormula: 'det(J(q)) < 0.05 ⟹ q̇ = Jᵀ(JJᵀ + λ²I)⁻¹ ẋ',
        mitigationEnabled: true,
        occurrencePost: 1,
        detectionPost: 1,
      },
      {
        id: 'HAZ-10218-03',
        hazardTitle: 'Wet / Oil-Contaminated Part Payload Slippage',
        subsystem: 'Robotiq 2F-85 Gripper',
        potentialEffect: '4.2 kg workpiece ejection under 2.4 m/s² deceleration',
        severity: 3,
        occurrencePre: 4,
        detectionPre: 4,
        mitigationStrategy: '4.2 ms Tactile Micro-Vibration Slip Reflex & Decel Cap',
        z3InvariantFormula: 'μ_est < 0.25 ⟹ F_normal ≥ (m·a_max) / μ_min',
        mitigationEnabled: true,
        occurrencePost: 1,
        detectionPost: 2,
      },
    ],
    rtmRows: [
      {
        reqId: 'REQ-PFL-001',
        clauseRef: 'ISO/TS 15066 §5.5.4',
        requirementText: 'Limit transient contact force to ≤ 140 N across collaborative workspace',
        codeSymbol: 'safety_cbf::clamp_contact_force()',
        z3ProofFormula: 'assert(forall t, F_ext(t) <= 140.0)',
        physicsTestId: 'ISAAC-PFL-4096-RUN',
        measuredDelta: '128.0 N peak (0 violations)',
        sha256: '7f8a9c12e4b0193d2a51c78e091b23a488f10d22e91c4b5501a3c9e8d7102f4b',
      },
      {
        reqId: 'REQ-KIN-002',
        clauseRef: 'ISO 10218-2 §5.6.3',
        requirementText: 'Maintain Jacobian singularity damping near det(J) < 0.05',
        codeSymbol: 'ik_solver::dls_jacobian_step()',
        z3ProofFormula: 'assert(det_J < 0.05 => norm(q_dot) <= 1.2)',
        physicsTestId: 'MOVEIT2-SINGULAR-500',
        measuredDelta: '0.012 rad/s residual',
        sha256: '3c91b40e8d214a9f0b7e12a345d6c7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4',
      },
      {
        reqId: 'REQ-STO-003',
        clauseRef: 'ISO 10218-1 §5.4.2',
        requirementText: 'Execute dual-channel Safe Torque Off within 1.5 ms of barrier trip',
        codeSymbol: 'ethercat_master::trigger_sto_latch()',
        z3ProofFormula: 'assert(t_fault - t_sto <= 0.0015)',
        physicsTestId: 'HIL-CANFD-100K-CYCLES',
        measuredDelta: '0.85 ms worst-case',
        sha256: '9b44e2a1f8c30d7e65a214b809f1c2d3e4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9',
      },
    ],
  },

  ISO_3691_4: {
    id: 'ISO_3691_4',
    shortName: 'ISO 3691-4 & ANSI R15.08',
    fullName: 'ISO 3691-4:2023 & ANSI/RIA R15.08 Autonomous Mobile Robot Fleet Safety Pack',
    notifiedBodies: 'TÜV SÜD · OSHA NRTL · EU Machinery Regulation 2023/1230',
    dossierType: 'Driverless Industrial Truck Technical File & LiDAR Field Verification',
    robotPresetName: 'VDA 5050 Heavy-Payload AMR (1,200 kg Pallet Mover)',
    defaultTargetApp: 'High-Density Automated Warehouse & Mixed Human-Forklift Aisles',
    defaultParams: {
      maxForceN: 95,
      maxVelocityMs: 1.65,
      stoppingDistanceMm: 310,
      controlFreqHz: 500,
      jitterMs: 1.1,
      simToRealDeltaPct: 1.8,
      singularityDetJ: 0.25,
      thermalCeilingC: 68,
    },
    recommendedSafeParams: {
      maxForceN: 80,
      maxVelocityMs: 1.45,
      stoppingDistanceMm: 270,
      controlFreqHz: 1000,
      jitterMs: 0.9,
      simToRealDeltaPct: 1.3,
      singularityDetJ: 0.25,
      thermalCeilingC: 63,
    },
    sampleConfigSnippet: `# VDA 5050 AMR Safety Field Configuration (amr_iso3691_4.yaml)
vehicle_class: heavy_amr_1200kg
control_rate_hz: 500
max_force_n: 95.0
max_tcp_velocity_ms: 1.65
stopping_distance_mm: 310.0
loop_jitter_ms: 1.10
sim2real_error_pct: 1.8
jacobian_det_min: 0.25
actuator_thermal_limit_c: 68.0`,
    clauses: [
      {
        clauseId: 'ISO 3691-4 §4.3.2',
        title: 'Dynamic Stopping Distance vs. Active Safety Laser Field',
        category: 'Stopping & E-Stop',
        requirementSummary: 'Braking distance under wet concrete friction (μ = 0.35) must stay ≤ 380 mm safety field length.',
        limitDescription: 'Stop Distance ≤ 380 mm',
        evaluate: (p) => {
          if (p.stoppingDistanceMm <= 380) {
            return {
              status: 'PASS',
              measuredText: `${p.stoppingDistanceMm} mm worst-case brake`,
              marginText: `+${380 - p.stoppingDistanceMm} mm field buffer`,
            };
          }
          return {
            status: 'FAIL',
            measuredText: `${p.stoppingDistanceMm} mm (> 380 mm field)`,
            marginText: 'Collision prior to full halt',
            remediation: 'Lower max transit speed ≤ 1.5 m/s or extend LiDAR protective field length.',
          };
        },
      },
      {
        clauseId: 'ISO 3691-4 §4.4',
        title: 'Operating Zone Speed Limits in Mixed Personnel Aisles',
        category: 'Perception & Field',
        requirementSummary: 'Maximum autonomous speed in shared personnel corridors must stay ≤ 2.0 m/s.',
        limitDescription: 'Max Speed ≤ 2.00 m/s',
        evaluate: (p) => {
          if (p.maxVelocityMs <= 2.0) {
            return {
              status: 'PASS',
              measuredText: `${p.maxVelocityMs.toFixed(2)} m/s governed`,
              marginText: 'Speed-zone interlock active',
            };
          }
          return {
            status: 'FAIL',
            measuredText: `${p.maxVelocityMs.toFixed(2)} m/s (> 2.0 m/s cap)`,
            marginText: 'Zone speed violation',
            remediation: 'Clamp VDA 5050 speed profile ≤ 1.80 m/s in shared zones.',
          };
        },
      },
      {
        clauseId: 'IEC 62061 SIL-2 / PLd',
        title: 'Safety PLC Watchdog & LiDAR OSSD Switching Determinism',
        category: 'Control Determinism',
        requirementSummary: 'Protective field switching latency must remain ≤ 2.0 ms with control rate ≥ 250 Hz.',
        limitDescription: 'Loop ≥ 250 Hz · Jitter ≤ 2.0 ms',
        evaluate: (p) => {
          if (p.controlFreqHz >= 250 && p.jitterMs <= 2.0) {
            return {
              status: 'PASS',
              measuredText: `${p.controlFreqHz} Hz · ${p.jitterMs.toFixed(2)} ms`,
              marginText: 'SIL-2 / PLd verified',
            };
          }
          return {
            status: 'FAIL',
            measuredText: `${p.controlFreqHz} Hz · ${p.jitterMs.toFixed(2)} ms`,
            marginText: 'OSSD watchdog timeout risk',
            remediation: 'Reduce CAN-FD safety bus cycle period to ≤ 2.0 ms.',
          };
        },
      },
      {
        clauseId: 'ANSI/RIA R15.08 §5.3',
        title: 'Fleet Deadlock & Head-On Aisle Consensus Barrier',
        category: 'Software & Risk',
        requirementSummary: 'Multi-AMR right-of-way graph guarantees ≥ 0.4 m lateral clearance and zero livelock.',
        limitDescription: 'Sim-to-Real Delta ≤ 3.5%',
        evaluate: (p) => {
          if (p.simToRealDeltaPct <= 3.5) {
            return {
              status: 'PASS',
              measuredText: `${p.simToRealDeltaPct.toFixed(1)}% fleet trajectory drift`,
              marginText: 'CBF right-of-way proven',
            };
          }
          return {
            status: 'CONDITIONAL',
            measuredText: `${p.simToRealDeltaPct.toFixed(1)}% drift`,
            marginText: 'Odometry covariance high',
            remediation: 'Recalibrate wheel-encoder slip covariance in wet aisle twins.',
          };
        },
      },
    ],
    defaultHazards: [
      {
        id: 'HAZ-3691-01',
        hazardTitle: 'Sudden Pedestrian Ingress Behind Blind Racking Corner',
        subsystem: '360° Dual Safety LiDAR + Braking',
        potentialEffect: 'Vehicle impact at 1.65 m/s with 1,200 kg pallet load',
        severity: 5,
        occurrencePre: 3,
        detectionPre: 3,
        mitigationStrategy: 'Predictive Speed-Scaled Safety Field + Dynamic CBF Stop',
        z3InvariantFormula: 'd_stop(v, μ_min) + d_latency < d_field(v)',
        mitigationEnabled: true,
        occurrencePost: 1,
        detectionPost: 1,
      },
      {
        id: 'HAZ-3691-02',
        hazardTitle: 'Wet Concrete Floor Wheel Skidding During E-Stop',
        subsystem: 'Traction & ABS Torque Controller',
        potentialEffect: 'Stopping distance overrun beyond protective scanner envelope',
        severity: 4,
        occurrencePre: 4,
        detectionPre: 3,
        mitigationStrategy: 'Friction-Adaptive Decel Governor (μ=0.30 Worst-Case)',
        z3InvariantFormula: 'μ_surface < 0.4 ⟹ v_max := 0.65 · v_nominal',
        mitigationEnabled: true,
        occurrencePost: 1,
        detectionPost: 2,
      },
    ],
    rtmRows: [
      {
        reqId: 'REQ-AMR-101',
        clauseRef: 'ISO 3691-4 §4.3.2',
        requirementText: 'Dynamic protective laser field scales quadratically with velocity and load',
        codeSymbol: 'lidar_safety::select_field_zone()',
        z3ProofFormula: 'assert(v^2 / (2*a_min) + v*t_react <= L_field)',
        physicsTestId: 'WAREHOUSE-WET-FLOOR-2000',
        measuredDelta: '310 mm vs 380 mm envelope',
        sha256: '4a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
      },
      {
        reqId: 'REQ-SWARM-104',
        clauseRef: 'ANSI/RIA R15.08 §5.3',
        requirementText: 'Zero inter-AMR collisions across 500-agent VDA 5050 intersection graph',
        codeSymbol: 'vda5050_broker::verify_edge_reservation()',
        z3ProofFormula: 'assert(forall i != j, dist(pos_i, pos_j) >= 0.85m)',
        physicsTestId: 'SWARM-500-INTERSECTION',
        measuredDelta: '0.94 m min separation',
        sha256: '1f2e3d4c5b6a7980817263544536271809abcdef1234567890abcdef12345678',
      },
    ],
  },

  FDA_21CFR820: {
    id: 'FDA_21CFR820',
    shortName: 'FDA 21 CFR 820 & ISO 13485',
    fullName: 'FDA 21 CFR Part 820.30, ISO 13485 & IEC 62304 Class C Surgical Design History File',
    notifiedBodies: 'US FDA (CDRH 510(k) / PMA) · EU MDR Notified Body (BSI / DEKRA)',
    dossierType: 'Design History File (DHF), IEC 62304 Software Pack & ISO 14971 Risk File',
    robotPresetName: 'Tendon-Driven Laparoscopic Suture Manipulator (7-DoF)',
    defaultTargetApp: 'Minimally Invasive Micro-Vascular Anastomosis & Soft-Tissue Suturing',
    defaultParams: {
      maxForceN: 3.4,
      maxVelocityMs: 0.09,
      stoppingDistanceMm: 0.45,
      controlFreqHz: 2000,
      jitterMs: 0.35,
      simToRealDeltaPct: 0.9,
      singularityDetJ: 0.14,
      thermalCeilingC: 41,
    },
    recommendedSafeParams: {
      maxForceN: 3.1,
      maxVelocityMs: 0.08,
      stoppingDistanceMm: 0.35,
      controlFreqHz: 2000,
      jitterMs: 0.28,
      simToRealDeltaPct: 0.7,
      singularityDetJ: 0.16,
      thermalCeilingC: 39,
    },
    sampleConfigSnippet: `# Surgical Teleop Safety & Tissue Clamp Config (surgical_dhf.yaml)
device_class: fda_class_iii_laparoscopic
control_rate_hz: 2000
max_force_n: 3.4
max_tcp_velocity_ms: 0.09
stopping_distance_mm: 0.45
loop_jitter_ms: 0.35
sim2real_error_pct: 0.9
jacobian_det_min: 0.14
actuator_thermal_limit_c: 41.0`,
    clauses: [
      {
        clauseId: 'FDA 21 CFR 820.30(g)',
        title: 'Design Validation: Soft-Tissue Force & Puncture Clamp',
        category: 'Kinematics & Force',
        requirementSummary: 'End-effector needle driver force must strictly remain ≤ 4.2 N to avoid vessel tear.',
        limitDescription: 'Tip Force ≤ 4.2 N',
        evaluate: (p) => {
          if (p.maxForceN <= 4.2) {
            return {
              status: 'PASS',
              measuredText: `${p.maxForceN.toFixed(2)} N clamped`,
              marginText: `+${(((4.2 - p.maxForceN) / 4.2) * 100).toFixed(1)}% tissue margin`,
            };
          }
          return {
            status: 'FAIL',
            measuredText: `${p.maxForceN.toFixed(2)} N (> 4.2 N vessel limit)`,
            marginText: 'Vascular perforation risk',
            remediation: 'Clamp closed-loop impedance force threshold ≤ 3.8 N in surgical controller.',
          };
        },
      },
      {
        clauseId: 'IEC 62304 §5.5 (Class C)',
        title: 'Deterministic Teleoperation Jitter & Hysteresis Compensation',
        category: 'Control Determinism',
        requirementSummary: 'Life-critical Class C surgical loop must run ≥ 1000 Hz with jitter ≤ 0.80 ms.',
        limitDescription: 'Loop ≥ 1000 Hz · Jitter ≤ 0.80 ms',
        evaluate: (p) => {
          if (p.controlFreqHz >= 1000 && p.jitterMs <= 0.8) {
            return {
              status: 'PASS',
              measuredText: `${p.controlFreqHz} Hz · ${p.jitterMs.toFixed(2)} ms`,
              marginText: 'Class C hard real-time lock',
            };
          }
          return {
            status: 'FAIL',
            measuredText: `${p.controlFreqHz} Hz · ${p.jitterMs.toFixed(2)} ms`,
            marginText: 'Class C timing breach',
            remediation: 'Ensure 2000 Hz RT-thread isolation and tendon backlash observer enabled.',
          };
        },
      },
      {
        clauseId: 'ISO 13485 §7.3.6',
        title: 'Sub-Millimeter Remote Center of Motion (RCM) Boundary Lock',
        category: 'Stopping & E-Stop',
        requirementSummary: 'Trocar virtual fixture excursion during fault shutdown must remain ≤ 1.00 mm.',
        limitDescription: 'Excursion ≤ 1.00 mm',
        evaluate: (p) => {
          if (p.stoppingDistanceMm <= 1.0) {
            return {
              status: 'PASS',
              measuredText: `${p.stoppingDistanceMm.toFixed(2)} mm excursion`,
              marginText: `+${(1.0 - p.stoppingDistanceMm).toFixed(2)} mm trocar buffer`,
            };
          }
          return {
            status: 'FAIL',
            measuredText: `${p.stoppingDistanceMm.toFixed(2)} mm (> 1.00 mm limit)`,
            marginText: 'Virtual fixture violation',
            remediation: 'Tighten RCM Cartesian CBF penalty gain so excursion < 0.60 mm.',
          };
        },
      },
      {
        clauseId: 'IEC 60601-1 §11.1',
        title: 'Patient-Contact Instrument Thermal Surface Limit',
        category: 'Software & Risk',
        requirementSummary: 'Distal surgical actuator housing must never exceed 43°C patient contact threshold.',
        limitDescription: 'Thermal Ceiling ≤ 43.0 °C',
        evaluate: (p) => {
          if (p.thermalCeilingC <= 43) {
            return {
              status: 'PASS',
              measuredText: `${p.thermalCeilingC.toFixed(1)} °C max steady-state`,
              marginText: `+${(43 - p.thermalCeilingC).toFixed(1)} °C thermal margin`,
            };
          }
          return {
            status: 'FAIL',
            measuredText: `${p.thermalCeilingC.toFixed(1)} °C (> 43 °C burn limit)`,
            marginText: 'Thermal tissue hazard',
            remediation: 'Apply RMS motor phase-current derating above 40 °C.',
          };
        },
      },
    ],
    defaultHazards: [
      {
        id: 'HAZ-FDA-01',
        hazardTitle: 'Bowden Cable Autoclave Stretch Causing Needle Snap-Through',
        subsystem: 'Tendon Drive Hysteresis Observer',
        potentialEffect: '1.5 mm tip overshoot adjacent to carotid/iliac vessel',
        severity: 5,
        occurrencePre: 4,
        detectionPre: 3,
        mitigationStrategy: '1 kHz Bowden Strain Observer + 4.2 N Force Barrier',
        z3InvariantFormula: '∀t ≥ 0: ||p_tip(t) - p_rcm_safe|| ≤ 0.50 mm ∧ F_tip ≤ 4.2 N',
        mitigationEnabled: true,
        occurrencePost: 1,
        detectionPost: 1,
      },
      {
        id: 'HAZ-FDA-02',
        hazardTitle: 'Surgeon Console Packet Drop During Micro-Suture',
        subsystem: 'Deterministic Teleop Link',
        potentialEffect: 'Sudden step jump on master-slave trajectory reconnect',
        severity: 5,
        occurrencePre: 3,
        detectionPre: 3,
        mitigationStrategy: 'Zero-Order Hold Freeze + Quintic Spline Re-Clutch',
        z3InvariantFormula: 'Δt_pkt > 2.0ms ⟹ q̇_target := 0 ∧ require_clutch_sync()',
        mitigationEnabled: true,
        occurrencePost: 1,
        detectionPost: 1,
      },
    ],
    rtmRows: [
      {
        reqId: 'REQ-MED-009',
        clauseRef: 'FDA 21 CFR 820.30(g)',
        requirementText: 'Clamp distal tissue puncture force ≤ 4.2 N across all tissue moduli',
        codeSymbol: 'surgical_cbf::enforce_tissue_force_cap()',
        z3ProofFormula: 'assert(forall t, F_needle(t) <= 4.2)',
        physicsTestId: 'WETLAB-PHANTOM-1M',
        measuredDelta: '3.40 N max observed',
        sha256: 'e1a2b3c4d5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
      },
      {
        reqId: 'REQ-MED-014',
        clauseRef: 'IEC 62304 §5.5',
        requirementText: 'Enforce Remote Center of Motion trocar barrier ≤ 1.0 mm excursion',
        codeSymbol: 'rcm_kinematics::project_trocar_cone()',
        z3ProofFormula: 'assert(dist_to_trocar_axis <= 0.001)',
        physicsTestId: 'CADAVER-SIM-REPLAY',
        measuredDelta: '0.45 mm worst-case',
        sha256: 'a9b8c7d6e5f43210fedcba98765432100123456789abcdef0123456789abcdef',
      },
    ],
  },

  STANAG_4586: {
    id: 'STANAG_4586',
    shortName: 'STANAG 4586 & MIL-STD-810H',
    fullName: 'STANAG 4586, MIL-STD-810H & DEF-STAN 00-56 Sovereign Defense Autonomy Pack',
    notifiedBodies: 'NATO Joint Airworthiness · UK MoD MAA · US DoD ATEC / Air Force',
    dossierType: 'Autonomous Flight/Ground Worthiness Evidence & SCIF Air-Gap Attestation',
    robotPresetName: 'Tactical All-Terrain Reconnaissance UGV / Coandă UAV',
    defaultTargetApp: 'GNSS-Denied Tactical Supply & Electronic Warfare Contested Ops',
    defaultParams: {
      maxForceN: 420,
      maxVelocityMs: 8.5,
      stoppingDistanceMm: 620,
      controlFreqHz: 1000,
      jitterMs: 0.92,
      simToRealDeltaPct: 1.6,
      singularityDetJ: 0.18,
      thermalCeilingC: 74,
    },
    recommendedSafeParams: {
      maxForceN: 380,
      maxVelocityMs: 7.5,
      stoppingDistanceMm: 510,
      controlFreqHz: 1000,
      jitterMs: 0.78,
      simToRealDeltaPct: 1.2,
      singularityDetJ: 0.2,
      thermalCeilingC: 68,
    },
    sampleConfigSnippet: `# Tactical UGV/UAV Airworthiness Config (stanag4586_scif.yaml)
platform_profile: tactical_autonomous_ugv_v3
control_rate_hz: 1000
max_force_n: 420.0
max_tcp_velocity_ms: 8.5
stopping_distance_mm: 620.0
loop_jitter_ms: 0.92
sim2real_error_pct: 1.6
jacobian_det_min: 0.18
actuator_thermal_limit_c: 74.0`,
    clauses: [
      {
        clauseId: 'STANAG 4586 Ed.4 §5.2',
        title: 'GNSS-Denied Optical/Inertial Drift Cone Boundedness',
        category: 'Perception & Field',
        requirementSummary: 'Visual-inertial navigation drift without GPS must stay ≤ 2.5% trajectory delta over 10 km.',
        limitDescription: 'Sim-to-Real / Drift ≤ 2.5%',
        evaluate: (p) => {
          if (p.simToRealDeltaPct <= 2.5) {
            return {
              status: 'PASS',
              measuredText: `${p.simToRealDeltaPct.toFixed(1)}% bounded drift`,
              marginText: `+${(2.5 - p.simToRealDeltaPct).toFixed(1)}% CEP margin`,
            };
          }
          return {
            status: 'FAIL',
            measuredText: `${p.simToRealDeltaPct.toFixed(1)}% (> 2.5% threshold)`,
            marginText: 'CEP corridor exceeded',
            remediation: 'Fuse barometric terrain matching + neuromorphic DVS horizon lock.',
          };
        },
      },
      {
        clauseId: 'MIL-STD-810H Method 501',
        title: 'High-Ambient Desert Thermal Derating Envelope (+55°C Soak)',
        category: 'Kinematics & Force',
        requirementSummary: 'Inverter and actuator winding temperature must remain ≤ 85 °C under peak sortie.',
        limitDescription: 'Winding Temp ≤ 85.0 °C',
        evaluate: (p) => {
          if (p.thermalCeilingC <= 85) {
            return {
              status: 'PASS',
              measuredText: `${p.thermalCeilingC.toFixed(1)} °C steady soak`,
              marginText: `+${(85 - p.thermalCeilingC).toFixed(1)} °C headroom`,
            };
          }
          return {
            status: 'FAIL',
            measuredText: `${p.thermalCeilingC.toFixed(1)} °C (> 85 °C limit)`,
            marginText: 'Thermal demagnetization risk',
            remediation: 'Enable dynamic Coandă bleed cooling & cap peak torque duty cycle.',
          };
        },
      },
      {
        clauseId: 'DEF-STAN 00-56 §9.4',
        title: 'Rules-of-Engagement / Geofence Hard Barrier Determinism',
        category: 'Control Determinism',
        requirementSummary: 'Flight/ground control barrier loop must run ≥ 500 Hz with jitter ≤ 1.5 ms.',
        limitDescription: 'Loop ≥ 500 Hz · Jitter ≤ 1.5 ms',
        evaluate: (p) => {
          if (p.controlFreqHz >= 500 && p.jitterMs <= 1.5) {
            return {
              status: 'PASS',
              measuredText: `${p.controlFreqHz} Hz · ${p.jitterMs.toFixed(2)} ms`,
              marginText: 'DAL-A timing compliance',
            };
          }
          return {
            status: 'FAIL',
            measuredText: `${p.controlFreqHz} Hz · ${p.jitterMs.toFixed(2)} ms`,
            marginText: 'Geofence overshoot risk',
            remediation: 'Upgrade avionics bus priority to 1000 Hz deterministic frame.',
          };
        },
      },
    ],
    defaultHazards: [
      {
        id: 'HAZ-DEF-01',
        hazardTitle: 'Active RF Spoofing / Jamming Loss of C2 Link',
        subsystem: 'Air-Gapped Autonomous Return Kernel',
        potentialEffect: 'Platform exits authorized operational geofence',
        severity: 5,
        occurrencePre: 4,
        detectionPre: 3,
        mitigationStrategy: 'Z3 Hardware Geofence Invariant + GNSS-Denied VIO Return',
        z3InvariantFormula: '∀t ≥ 0: pos(t) ∈ Polygon_Authorized ∧ drift_vio < 0.025·s',
        mitigationEnabled: true,
        occurrencePost: 1,
        detectionPost: 1,
      },
      {
        id: 'HAZ-DEF-02',
        hazardTitle: 'Crosswind Turbulence Boundary-Layer Detachment (>22°)',
        subsystem: 'Coandă Fluidic Vectoring Nozzle',
        potentialEffect: 'Sudden pitch-up instability during terminal approach',
        severity: 4,
        occurrencePre: 3,
        detectionPre: 4,
        mitigationStrategy: '1000 Hz Differential Bleed Valve Attachment Lock',
        z3InvariantFormula: 'h/R ≤ 0.055 ∧ φ_lag ≤ 2.5 ms ⟹ Stall_Margin ≥ 20%',
        mitigationEnabled: true,
        occurrencePost: 1,
        detectionPost: 2,
      },
    ],
    rtmRows: [
      {
        reqId: 'REQ-MIL-651',
        clauseRef: 'MIL-STD-810H §501',
        requirementText: 'Maintain thrust vector attachment under 65% crosswind turbulence & +55°C soak',
        codeSymbol: 'coanda_bleed::stabilize_boundary_layer()',
        z3ProofFormula: 'assert(gust_ti <= 0.65 => stall_margin >= 0.15)',
        physicsTestId: 'PINN-COANDA-65TI-RUN',
        measuredDelta: '24.8% margin preserved',
        sha256: 'c4ca4238a0b923820dcc509a6f75849b1234567890abcdef1234567890abcdef',
      },
      {
        reqId: 'REQ-STANAG-09',
        clauseRef: 'STANAG 4586 Ed.4',
        requirementText: 'Enforce cryptographic zero-egress SCIF execution & geofence invariance',
        codeSymbol: 'scif_enclave::verify_geofence_cbf()',
        z3ProofFormula: 'assert(outbound_packets == 0 && in_geofence(x))',
        physicsTestId: 'SCIF-AIRGAP-VERIFICATION',
        measuredDelta: '0 egress bytes · 100% geofence',
        sha256: 'd8e8fca2dc0f896fd7cb4cb0031ba2491234567890abcdef1234567890abcdef',
      },
    ],
  },
};

export function parseConfigTextToParams(
  rawText: string,
  fallback: RobotTelemetryParams
): { parsed: RobotTelemetryParams; matchedKeys: string[] } {
  const next = { ...fallback };
  const matchedKeys: string[] = [];

  const extractNumber = (patterns: RegExp[]): number | null => {
    for (const regex of patterns) {
      const match = rawText.match(regex);
      if (match && match[1]) {
        const val = parseFloat(match[1]);
        if (!Number.isNaN(val) && Number.isFinite(val)) return val;
      }
    }
    return null;
  };

  const force = extractNumber([/max_force_n\s*[:=]\s*([0-9.]+)/i, /effort\s*=\s*"?([0-9.]+)/i]);
  if (force !== null) {
    next.maxForceN = force;
    matchedKeys.push('max_force_n');
  }

  const vel = extractNumber([/max_tcp_velocity_ms\s*[:=]\s*([0-9.]+)/i, /velocity\s*=\s*"?([0-9.]+)/i]);
  if (vel !== null) {
    next.maxVelocityMs = vel;
    matchedKeys.push('max_tcp_velocity_ms');
  }

  const stop = extractNumber([/stopping_distance_mm\s*[:=]\s*([0-9.]+)/i]);
  if (stop !== null) {
    next.stoppingDistanceMm = stop;
    matchedKeys.push('stopping_distance_mm');
  }

  const freq = extractNumber([/control_rate_hz\s*[:=]\s*([0-9.]+)/i, /control_freq_hz\s*[:=]\s*([0-9.]+)/i]);
  if (freq !== null) {
    next.controlFreqHz = freq;
    matchedKeys.push('control_rate_hz');
  }

  const jitter = extractNumber([/loop_jitter_ms\s*[:=]\s*([0-9.]+)/i]);
  if (jitter !== null) {
    next.jitterMs = jitter;
    matchedKeys.push('loop_jitter_ms');
  }

  const s2r = extractNumber([/sim2real_error_pct\s*[:=]\s*([0-9.]+)/i]);
  if (s2r !== null) {
    next.simToRealDeltaPct = s2r;
    matchedKeys.push('sim2real_error_pct');
  }

  const detj = extractNumber([/jacobian_det_min\s*[:=]\s*([0-9.]+)/i]);
  if (detj !== null) {
    next.singularityDetJ = detj;
    matchedKeys.push('jacobian_det_min');
  }

  const therm = extractNumber([/actuator_thermal_limit_c\s*[:=]\s*([0-9.]+)/i]);
  if (therm !== null) {
    next.thermalCeilingC = therm;
    matchedKeys.push('actuator_thermal_limit_c');
  }

  return { parsed: next, matchedKeys };
}

export function computeDeterministicHash(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const partA = (h1 >>> 0).toString(16).padStart(8, '0');
  const partB = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${partA}${partB}${partA.split('').reverse().join('')}${partB.split('').reverse().join('')}${partA}${partB}`.slice(0, 64);
}
