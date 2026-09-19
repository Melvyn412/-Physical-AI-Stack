import { CompanyMechanism, FailureModeItem, IterationSavingsReport } from '../types';

export const COMPANY_MECHANISM_PRESETS: {
  mechanism: CompanyMechanism;
  failureModes: FailureModeItem[];
  defaultSavings: IterationSavingsReport;
}[] = [
  {
    mechanism: {
      id: 'intuitive-wrist-4dof',
      companyName: 'MedTech Systems (Intuitive Surgical Class)',
      mechanismName: 'Articulated Micro-Wrist Laparoscopic End-Effector',
      industry: 'Surgical & Medical',
      dof: 4,
      nominalPayloadKg: 0.8,
      operatingFrequencyHz: 1000,
      actuatorType: 'Brushless DC with Multi-Tendon Tungsten Cable Drive',
      gearReduction: 'Capstan 14:1 Precision Pulley Reduction',
      nominalCycleDurationSec: 15,
      typicalIterationCostUsd: 22000,
      typicalIterationWeeks: 3.5,
      cadModelDescription: '4-DoF sub-centimeter micro-wrist with decoupled pitch, yaw, roll, and bi-polar grasping jaws.',
      nominalTorqueNm: 2.8,
      maxTorqueNm: 5.4,
      gearBacklashArcmin: 2.5,
      thermalLimitCelsius: 43.0 // Clinical patient safety ceiling
    },
    failureModes: [
      {
        id: 'FM-SURG-01',
        title: 'Deep-Angle Gimbal Lock & Singularity Deadlock',
        severity: 'CRITICAL',
        subsystem: 'Kinematics & Singularity',
        telemetryTrigger: 'Jacobian Determinant det(J) < 0.003 at Pitch = 46.2°',
        rootCause: 'Decoupled wrist axes align co-linearly when approaching steep abdominal retroperitoneal approach angle.',
        hardwareRisk: 'Actuator commands infinite joint velocity spike (3,400 deg/sec); causes emergency motor trip and involuntary surgical jaw drop in vivo.',
        simulatedFix: 'Damped Least-Squares (DLS) Jacobian regularizer with λ²=0.015 and predictive boundary velocity clamping.',
        confidenceScore: 99.4
      },
      {
        id: 'FM-SURG-02',
        title: 'Tendon Cable Creep & 1.8mm End-Effector Tracking Hysteresis',
        severity: 'HIGH',
        subsystem: 'Structural / Fatigue',
        telemetryTrigger: 'Tungsten cable tension delta ΔT > 42 N during 12 Hz suturing knots',
        rootCause: 'Repetitive high-cycle knot tying over 8mm capstan drum causes microscopic wire strand deformation.',
        hardwareRisk: 'Surgeon tremor filter desynchronizes; needle slip during 6-0 Prolene vascular suturing.',
        simulatedFix: 'Inverse cable elasticity compensation model implemented in Layer 5 (1000 Hz motor loop).',
        confidenceScore: 96.8
      },
      {
        id: 'FM-SURG-03',
        title: 'Trocar Cannula Friction Thermal Heat Stagnation',
        severity: 'MEDIUM',
        subsystem: 'Thermal & Winding',
        telemetryTrigger: 'Outer shaft skin temperature reached 44.8°C at continuous 45-minute articulation',
        rootCause: 'Friction between PTFE-coated titanium shaft and trocar seal with zero airflow dissipation.',
        hardwareRisk: 'Exceeds IEC 60601-1 thermal limit (43°C) for patient tissue contact.',
        simulatedFix: 'Dynamic duty-cycle power throttling and trajectory smoothing reducing RMS motor current by 28%.',
        confidenceScore: 94.2
      }
    ],
    defaultSavings: {
      mechanismId: 'intuitive-wrist-4dof',
      mechanismName: 'Articulated Micro-Wrist Laparoscopic End-Effector',
      companyName: 'MedTech Systems (Intuitive Surgical Class)',
      generatedDate: '2026-09-18',
      physicalIterationsAvoided: 4,
      machiningCostSavedUsd: 88000,
      benchTestHoursSaved: 160,
      scrappedHardwareSavedUsd: 26000,
      scheduleWeeksAccelerated: 14,
      totalFinancialSavingsUsd: 114000,
      energyEfficiencyGainPct: 24.5,
      roiMultiplier: 12.8,
      failureModesCount: 3,
      summaryNote: 'Discovered singularity deadlock and trocar thermal rise virtually in-browser, preventing catastrophic animal lab failure and saving 14 weeks of cleanroom machining.'
    }
  },
  {
    mechanism: {
      id: 'boston-quad-knee',
      companyName: 'Agile Dynamics (Boston Dynamics Class)',
      mechanismName: 'High-Torque Quasi-Direct Drive Leg Joint & Cycloidal Knee',
      industry: 'Humanoid Robotics',
      dof: 3,
      nominalPayloadKg: 35.0,
      operatingFrequencyHz: 1000,
      actuatorType: 'Frameless Outrunner BLDC with Planetary/Cycloidal Gearbox',
      gearReduction: '9:1 Low-Inertia Cycloidal Transmission',
      nominalCycleDurationSec: 20,
      typicalIterationCostUsd: 28000,
      typicalIterationWeeks: 4.0,
      cadModelDescription: 'High-bandwidth quasi-direct-drive joint with integrated dual-encoder feedback and oil-bath cycloidal teeth.',
      nominalTorqueNm: 85.0,
      maxTorqueNm: 220.0,
      gearBacklashArcmin: 1.2,
      thermalLimitCelsius: 95.0
    },
    failureModes: [
      {
        id: 'FM-ROBOT-01',
        title: 'Ground Impact Shock Peak Shearing Planetary Output Pins',
        severity: 'CRITICAL',
        subsystem: 'Structural / Fatigue',
        telemetryTrigger: 'Ground Reaction Force (GRF) spike = 3,420 N in 4.1 ms during 1.2m drop',
        rootCause: 'Direct mechanical shock transmits back through low 9:1 gear ratio before software torque control can react.',
        hardwareRisk: 'Cycloidal output drive pin shearing, damaging $14,000 machined titanium leg assembly.',
        simulatedFix: 'Virtual impedance compliance layer running at 1000 Hz with predictive touchdown torque pre-cushioning.',
        confidenceScore: 98.7
      },
      {
        id: 'FM-ROBOT-02',
        title: 'Thermal Saturation & Torque Roll-Off in Heavy Slope Trot',
        severity: 'HIGH',
        subsystem: 'Thermal & Winding',
        telemetryTrigger: 'Winding temperature T_stator reached 118°C after 6.4 minutes on 22° incline',
        rootCause: 'I²R copper resistive heating exceeds aluminium housing passive convective heat rejection.',
        hardwareRisk: 'Neodymium permanent magnet demagnetization; 42% uncommanded motor stall.',
        simulatedFix: 'Field-Oriented Control (FOC) id flux-weakening algorithm and gait frequency modulation.',
        confidenceScore: 97.1
      },
      {
        id: 'FM-ROBOT-03',
        title: 'Gear Backlash Limit-Cycle Chatter During High-Stiffness Stance',
        severity: 'MEDIUM',
        subsystem: 'Backlash & Resonance',
        telemetryTrigger: 'Phase lag 18° at 48 Hz oscillation between joint input and output encoders',
        rootCause: 'Gear tooth micro-clearance creates non-linear spring dynamics under high proportional gain (Kp=850).',
        hardwareRisk: 'Violent high-frequency vibration shakes LiDAR sensor calibration and damages foot strain gauges.',
        simulatedFix: 'Kalman-state disturbance observer with adaptive deadband notch filtering.',
        confidenceScore: 95.5
      }
    ],
    defaultSavings: {
      mechanismId: 'boston-quad-knee',
      mechanismName: 'High-Torque Quasi-Direct Drive Leg Joint & Cycloidal Knee',
      companyName: 'Agile Dynamics (Boston Dynamics Class)',
      generatedDate: '2026-09-18',
      physicalIterationsAvoided: 3,
      machiningCostSavedUsd: 84000,
      benchTestHoursSaved: 190,
      scrappedHardwareSavedUsd: 38000,
      scheduleWeeksAccelerated: 12,
      totalFinancialSavingsUsd: 122000,
      energyEfficiencyGainPct: 31.0,
      roiMultiplier: 14.2,
      failureModesCount: 3,
      summaryNote: 'Eliminated cycloidal pin fracture and stator thermal runaway in digital twin, bypassing 3 dynamometer rebuilds and saving $122,000.'
    }
  },
  {
    mechanism: {
      id: 'defense-gimbal-eoir',
      companyName: 'Defense AeroSystems (Lockheed / L3Harris Class)',
      mechanismName: 'Gyrostabilized 2-Axis EO/IR Surveillance & Targeting Gimbal',
      industry: 'Defense & Aerospace',
      dof: 2,
      nominalPayloadKg: 14.5,
      operatingFrequencyHz: 1000,
      actuatorType: 'Direct-Drive Slotless Brushless Torque Motors with Optical Encoders',
      gearReduction: 'Direct Drive 1:1 (Zero-Backlash)',
      nominalCycleDurationSec: 30,
      typicalIterationCostUsd: 38000,
      typicalIterationWeeks: 5.0,
      cadModelDescription: 'Carbon-fibre shell with direct-drive elevation and azimuth rings, slip ring pass-through, and dual-axis FOG gyro feedback.',
      nominalTorqueNm: 18.0,
      maxTorqueNm: 45.0,
      gearBacklashArcmin: 0.05,
      thermalLimitCelsius: 75.0
    },
    failureModes: [
      {
        id: 'FM-DEF-01',
        title: 'Airframe Aero-Acoustic Vibration Resonance at 114 Hz',
        severity: 'CRITICAL',
        subsystem: 'Backlash & Resonance',
        telemetryTrigger: 'Line-of-Sight (LOS) angular jitter reached 84 µrad (spec limit: 12 µrad)',
        rootCause: 'Slipstream boundary layer eddy shedding aligns with outer elevation gimbal structural eigenmode.',
        hardwareRisk: 'Optical image blur at 45x zoom; target identification fails in operational mission trial.',
        simulatedFix: 'Adaptive feed-forward inverse notch filtering and structural rib stiffening in CAD geometry.',
        confidenceScore: 99.1
      },
      {
        id: 'FM-DEF-02',
        title: 'Cryogenic Cold-Soak Bearing Lubricant Viscosity Drag Spike',
        severity: 'HIGH',
        subsystem: 'Control Loop Latency',
        telemetryTrigger: 'Bearing breakout torque increased 480% at -40°C high-altitude descent',
        rootCause: 'Fluorosilicone grease thickening overloads low-current direct-drive winding headroom.',
        hardwareRisk: 'Gimbal azimuth rate lags UAV yaw rate; tracking lock loss during tactical turn.',
        simulatedFix: 'Automated software current boost pre-heating cycle and torque observer compensation.',
        confidenceScore: 96.3
      }
    ],
    defaultSavings: {
      mechanismId: 'defense-gimbal-eoir',
      mechanismName: 'Gyrostabilized 2-Axis EO/IR Surveillance & Targeting Gimbal',
      companyName: 'Defense AeroSystems (Lockheed / L3Harris Class)',
      generatedDate: '2026-09-18',
      physicalIterationsAvoided: 3,
      machiningCostSavedUsd: 114000,
      benchTestHoursSaved: 220,
      scrappedHardwareSavedUsd: 45000,
      scheduleWeeksAccelerated: 15,
      totalFinancialSavingsUsd: 159000,
      energyEfficiencyGainPct: 19.5,
      roiMultiplier: 16.5,
      failureModesCount: 2,
      summaryNote: 'Identified 114 Hz aero-resonance and -40°C lube drag before physical environmental shake-table testing, saving $159k and 15 weeks.'
    }
  },
  {
    mechanism: {
      id: 'ev-steer-by-wire',
      companyName: 'Autonomous Mobility Corp (Tesla / Waymo Class)',
      mechanismName: 'Dual-Redundant Steer-by-Wire Rack-and-Pinion Actuator',
      industry: 'Autonomous Vehicles',
      dof: 2,
      nominalPayloadKg: 1800.0,
      operatingFrequencyHz: 1000,
      actuatorType: 'Dual-Stator Permanent Magnet Synchronous Motors (PMSM)',
      gearReduction: 'Recirculating Ball Nut & High-Helix Rack 16:1',
      nominalCycleDurationSec: 25,
      typicalIterationCostUsd: 45000,
      typicalIterationWeeks: 6.0,
      cadModelDescription: 'Automotive ISO 26262 ASIL-D certified dual-channel steering gear with integrated position resolver and electronic torque sensor.',
      nominalTorqueNm: 120.0,
      maxTorqueNm: 310.0,
      gearBacklashArcmin: 3.8,
      thermalLimitCelsius: 110.0
    },
    failureModes: [
      {
        id: 'FM-AUTO-01',
        title: 'Dual-Motor Torque Fighting on Asynchronous CAN-FD Bus Delay',
        severity: 'CRITICAL',
        subsystem: 'Control Loop Latency',
        telemetryTrigger: 'Differential motor fight torque ΔTorque = 42 Nm across common rack teeth',
        rootCause: 'Secondary redundant microcontroller experiences 3.2 ms bus jitter relative to primary master controller.',
        hardwareRisk: 'Premature pinion gear tooth pitting; rack bind leading to emergency autonomous disengagement.',
        simulatedFix: 'Microsecond deterministic clock synchronization with Layer 5 torque cross-feed decoupling.',
        confidenceScore: 99.8
      },
      {
        id: 'FM-AUTO-02',
        title: 'Curb-Strike Lateral Force Shock Transferred to Resolver Coupling',
        severity: 'HIGH',
        subsystem: 'Structural / Fatigue',
        telemetryTrigger: 'Lateral steering knuckle force = 18.5 kN at 25 km/h curb impact',
        rootCause: 'Rigid mechanical coupling lacks torsional damping for high-amplitude curb-strike shocks.',
        hardwareRisk: 'Resolver shaft slippage causing 4.5° absolute steering angle offset in traffic.',
        simulatedFix: 'Added virtual electronic damper in 1000 Hz loop and recommended elastomeric flexure in CAD.',
        confidenceScore: 97.4
      }
    ],
    defaultSavings: {
      mechanismId: 'ev-steer-by-wire',
      mechanismName: 'Dual-Redundant Steer-by-Wire Rack-and-Pinion Actuator',
      companyName: 'Autonomous Mobility Corp (Tesla / Waymo Class)',
      generatedDate: '2026-09-18',
      physicalIterationsAvoided: 4,
      machiningCostSavedUsd: 180000,
      benchTestHoursSaved: 310,
      scrappedHardwareSavedUsd: 65000,
      scheduleWeeksAccelerated: 18,
      totalFinancialSavingsUsd: 245000,
      energyEfficiencyGainPct: 22.0,
      roiMultiplier: 21.0,
      failureModesCount: 2,
      summaryNote: 'Detected multi-motor fighting and curb impact resolver slip virtually, eliminating 4 physical vehicle integration cycles and saving $245k.'
    }
  }
];
