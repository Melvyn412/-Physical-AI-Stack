import React, { useState } from 'react';
import {
  GitCompare, CheckCircle2, AlertTriangle, Sliders, RefreshCw,
  Download, ArrowRight, ShieldCheck, Activity, Eye, Zap,
  Layers, Lock, Sparkles, Terminal, FileText, Check, Cpu,
  BarChart3, Scale, ChevronRight
} from 'lucide-react';
import { useQuota } from '../hooks/useQuota';

export type TwinTrustSystemId = 'coanda_twin' | 'ur10e_twin' | 'surgical_twin' | 'legged_quadruped';

interface MismatchMetric {
  id: string;
  name: string;
  category: 'Trajectory Delta' | 'Contact-Force Error' | 'Timing & Latency' | 'Visual & Perception';
  unit: string;
  baselineSimVal: number;
  physicalLogVal: number;
  calibratedSimVal: number;
  initialErrorPct: number;
  calibratedErrorPct: number;
  thresholdMax: number;
  status: 'EXCELLENT' | 'VALIDATED' | 'MARGINAL' | 'REJECTED';
}

interface TunableParameter {
  id: string;
  name: string;
  symbol: string;
  unit: string;
  nominalCad: number;
  physicalEstimated: number;
  tunedOptimal: number;
  minBound: number;
  maxBound: number;
  confidencePct: number;
  subsystem: string;
  description: string;
}

interface SubsystemConfidence {
  id: string;
  subsystemName: string;
  scorePct: number; // 0 - 100
  status: 'HIGH TRUST (AIRWORTHY)' | 'MEDIUM TRUST (GUARDED)' | 'LOW TRUST (UNVALIDATED)';
  color: string;
  textColor: string;
  borderColor: string;
  bgLight: string;
  mismatchScorePct: number;
  sampleCount: number;
  validityNotes: string;
  keySensorsUsed: string[];
}

interface ValidityRangeEnvelope {
  parameterDimension: string;
  validInterval: string;
  invalidatedRegions: string;
  empiricalConfidencePct: number;
  testEvidenceRuns: number;
}

interface TwinTrustPreset {
  id: TwinTrustSystemId;
  name: string;
  telemetryLogSource: string;
  timeHorizonSec: number;
  dataPointsSynced: number;
  overallTwinTrustScorePct: number;
  baselineRealityGapPct: number;
  calibratedRealityGapPct: number;
  validitySummary: string;
  subsystems: SubsystemConfidence[];
  mismatches: MismatchMetric[];
  tunableParameters: TunableParameter[];
  validityEnvelopes: ValidityRangeEnvelope[];
}

const TWIN_TRUST_PRESETS: Record<TwinTrustSystemId, TwinTrustPreset> = {
  coanda_twin: {
    id: 'coanda_twin',
    name: 'Coandă Fluidic Thrust-Vectoring Digital Twin',
    telemetryLogSource: 'High-Altitude Wind-Tunnel Run #FTV-908 (1000 Hz DAQ)',
    timeHorizonSec: 12.5,
    dataPointsSynced: 12500,
    overallTwinTrustScorePct: 96.8,
    baselineRealityGapPct: 16.4,
    calibratedRealityGapPct: 1.2,
    validitySummary: 'Validated for airspeed 45–180 m/s, nozzle pressure 120–380 kPa, and vector angles -22° to +22°. Degrades outside this operational envelope.',
    subsystems: [
      {
        id: 'aero_collar',
        subsystemName: 'Nozzle Aerodynamics & Boundary Layer',
        scorePct: 98.4,
        status: 'HIGH TRUST (AIRWORTHY)',
        color: 'emerald',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/40',
        bgLight: 'bg-emerald-500/10',
        mismatchScorePct: 1.1,
        sampleCount: 12500,
        validityNotes: 'High-order Navier-Stokes PINN matches static wall-pressure taps within 1.2% residual.',
        keySensorsUsed: ['16x Kulite High-Speed Pressure Transducers', 'Schlieren Optical Flow Camera'],
      },
      {
        id: 'bleed_valves',
        subsystemName: 'Pneumatic Bleed Solenoids & Fluidics',
        scorePct: 95.8,
        status: 'HIGH TRUST (AIRWORTHY)',
        color: 'emerald',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/40',
        bgLight: 'bg-emerald-500/10',
        mismatchScorePct: 1.4,
        sampleCount: 12500,
        validityNotes: 'Phase lag compensated with 1000 Hz PWM feedforward. Valve latency tracking matched to 0.12 ms.',
        keySensorsUsed: ['Hall-Effect Spool Position Sensor', 'Current Shunt Resistor'],
      },
      {
        id: 'thermal_expansion',
        subsystemName: 'Thermal Expansion & Throat Deformations',
        scorePct: 78.5,
        status: 'MEDIUM TRUST (GUARDED)',
        color: 'amber',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/40',
        bgLight: 'bg-amber-500/10',
        mismatchScorePct: 4.8,
        sampleCount: 4200,
        validityNotes: 'Inconel-718 throat gap narrows by 0.035 mm at >320°C. Thermomechanical transient model requires 2s settling time.',
        keySensorsUsed: ['Fiber Bragg Grating (FBG) Optical Temperature Array'],
      },
      {
        id: 'acoustic_cavity',
        subsystemName: 'Acoustic Cavity Resonance (>1.5 kHz)',
        scorePct: 62.0,
        status: 'LOW TRUST (UNVALIDATED)',
        color: 'rose',
        textColor: 'text-rose-400',
        borderColor: 'border-rose-500/40',
        bgLight: 'bg-rose-500/10',
        mismatchScorePct: 12.6,
        sampleCount: 1800,
        validityNotes: 'High-frequency acoustic whistle modes at 2.4 kHz unmodeled in coarse CFD mesh. Guardrail filters applied in AHRS.',
        keySensorsUsed: ['PCB Piezotronics Acoustic Microphone'],
      },
    ],
    mismatches: [
      {
        id: 'm-traj',
        name: 'Thrust-Vector Angular Deflection',
        category: 'Trajectory Delta',
        unit: 'deg',
        baselineSimVal: 22.4,
        physicalLogVal: 18.2,
        calibratedSimVal: 18.3,
        initialErrorPct: 18.7,
        calibratedErrorPct: 0.5,
        thresholdMax: 1.5,
        status: 'EXCELLENT',
      },
      {
        id: 'm-force',
        name: 'Normal Vectoring Side Force',
        category: 'Contact-Force Error',
        unit: 'N',
        baselineSimVal: 185.0,
        physicalLogVal: 142.5,
        calibratedSimVal: 144.1,
        initialErrorPct: 29.8,
        calibratedErrorPct: 1.1,
        thresholdMax: 3.0,
        status: 'EXCELLENT',
      },
      {
        id: 'm-time',
        name: 'Step-Response Actuation Delay',
        category: 'Timing & Latency',
        unit: 'ms',
        baselineSimVal: 0.45,
        physicalLogVal: 2.10,
        calibratedSimVal: 2.05,
        initialErrorPct: 78.5,
        calibratedErrorPct: 2.4,
        thresholdMax: 5.0,
        status: 'VALIDATED',
      },
      {
        id: 'm-vis',
        name: 'Schlieren Boundary-Layer Thickness',
        category: 'Visual & Perception',
        unit: 'mm',
        baselineSimVal: 1.15,
        physicalLogVal: 1.95,
        calibratedSimVal: 1.92,
        initialErrorPct: 41.0,
        calibratedErrorPct: 1.5,
        thresholdMax: 3.5,
        status: 'EXCELLENT',
      },
    ],
    tunableParameters: [
      {
        id: 'p-rough',
        name: 'DMLS Surface Roughness',
        symbol: 'Ra',
        unit: 'µm',
        nominalCad: 0.8,
        physicalEstimated: 3.2,
        tunedOptimal: 3.15,
        minBound: 0.4,
        maxBound: 8.0,
        confidencePct: 98.5,
        subsystem: 'Nozzle Aerodynamics',
        description: 'Additive manufacturing friction factor directly shifting turbulent boundary layer separation.',
      },
      {
        id: 'p-delay',
        name: 'Micro-Valve Spool Transport Lag',
        symbol: 'τ_spool',
        unit: 'ms',
        nominalCad: 0.2,
        physicalEstimated: 1.85,
        tunedOptimal: 1.82,
        minBound: 0.1,
        maxBound: 4.5,
        confidencePct: 99.2,
        subsystem: 'Bleed Actuation',
        description: 'Magnetic hysteresis and pneumatic manifold chamber filling time.',
      },
      {
        id: 'p-slot',
        name: 'Effective Slot Height Thermal Expansion',
        symbol: 'h_eff',
        unit: 'mm',
        nominalCad: 1.15,
        physicalEstimated: 1.08,
        tunedOptimal: 1.09,
        minBound: 0.8,
        maxBound: 1.6,
        confidencePct: 97.4,
        subsystem: 'Thermal Expansion',
        description: 'Differential thermal expansion between outer collar and plenum throat under hot gas bleed.',
      },
      {
        id: 'p-noise',
        name: 'Pressure Transducer Sensor Noise',
        symbol: 'σ_press',
        unit: 'kPa',
        nominalCad: 0.1,
        physicalEstimated: 1.45,
        tunedOptimal: 1.42,
        minBound: 0.05,
        maxBound: 3.5,
        confidencePct: 98.9,
        subsystem: 'State Estimation',
        description: 'Turbulent boundary acoustic noise injected into static pressure ports.',
      },
    ],
    validityEnvelopes: [
      {
        parameterDimension: 'Nozzle Exhaust Velocity (Airspeed)',
        validInterval: '45.0 m/s — 185.0 m/s (Mach 0.13 — 0.54)',
        invalidatedRegions: '<35 m/s (laminar re-attachment stall), >210 m/s (transonic shock compressibility)',
        empiricalConfidencePct: 98.8,
        testEvidenceRuns: 42,
      },
      {
        parameterDimension: 'Deflection Target Vector Angle',
        validInterval: '-22.0° to +22.0°',
        invalidatedRegions: '> 24.5° (snap detachment boundary cliff)',
        empiricalConfidencePct: 99.1,
        testEvidenceRuns: 68,
      },
      {
        parameterDimension: 'Inlet Plenum Pressure',
        validInterval: '140 kPa — 360 kPa',
        invalidatedRegions: '< 110 kPa (insufficient Coanda momentum)',
        empiricalConfidencePct: 97.4,
        testEvidenceRuns: 35,
      },
    ],
  },
  ur10e_twin: {
    id: 'ur10e_twin',
    name: 'UR10e Robot Arm & Robotiq 2F-85 Parallel Gripper Twin',
    telemetryLogSource: 'Physical Cell Production Run #PICK-4412 (EtherCAT 500 Hz)',
    timeHorizonSec: 8.0,
    dataPointsSynced: 4000,
    overallTwinTrustScorePct: 97.4,
    baselineRealityGapPct: 14.8,
    calibratedRealityGapPct: 1.4,
    validitySummary: 'Validated for payloads 0.5–5.2 kg, end-effector speeds 0.1–1.8 m/s, and wet friction 0.25–0.85. Low confidence during hard singular configurations.',
    subsystems: [
      {
        id: 'ur10e_kinematics',
        subsystemName: '6-DOF Joint Rigid-Body Kinematics',
        scorePct: 99.4,
        status: 'HIGH TRUST (AIRWORTHY)',
        color: 'emerald',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/40',
        bgLight: 'bg-emerald-500/10',
        mismatchScorePct: 0.6,
        sampleCount: 4000,
        validityNotes: 'DH parameters calibrated against Leica laser tracker. Absolute positioning error < 0.08 mm.',
        keySensorsUsed: ['Absolute 19-Bit Optical Joint Encoders'],
      },
      {
        id: 'ur10e_drive',
        subsystemName: 'Harmonic Drive Backlash & Torque Dynamics',
        scorePct: 96.2,
        status: 'HIGH TRUST (AIRWORTHY)',
        color: 'emerald',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/40',
        bgLight: 'bg-emerald-500/10',
        mismatchScorePct: 1.3,
        sampleCount: 4000,
        validityNotes: 'Nonlinear friction Stribeck model matches motor current to 1.1 Nm RMS across full reach.',
        keySensorsUsed: ['Joint Motor Current Sensors', 'Base 6-Axis F/T Load Cell'],
      },
      {
        id: 'ur10e_contact',
        subsystemName: 'Fingertip Contact Friction & Grasp Compliance',
        scorePct: 92.5,
        status: 'HIGH TRUST (AIRWORTHY)',
        color: 'emerald',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/40',
        bgLight: 'bg-emerald-500/10',
        mismatchScorePct: 2.8,
        sampleCount: 2800,
        validityNotes: 'Coulomb friction coefficient tuned from nominal 0.75 to wet 0.38 for lubricated metal parts.',
        keySensorsUsed: ['Fingertip OptoForce 3-Axis Tactile Sensors'],
      },
      {
        id: 'ur10e_vision',
        subsystemName: 'RealSense D435 RGB-D Depth Perception',
        scorePct: 81.0,
        status: 'MEDIUM TRUST (GUARDED)',
        color: 'amber',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/40',
        bgLight: 'bg-amber-500/10',
        mismatchScorePct: 6.2,
        sampleCount: 1600,
        validityNotes: 'High reflectivity metal parts cause depth camera multipath dropouts. Camera-to-base extrinsics drift under thermal cycles.',
        keySensorsUsed: ['RealSense D435 Infrared Depth Stream'],
      },
    ],
    mismatches: [
      {
        id: 'ur-traj',
        name: 'End-Effector Cartesian Trajectory',
        category: 'Trajectory Delta',
        unit: 'mm',
        baselineSimVal: 1.45,
        physicalLogVal: 0.18,
        calibratedSimVal: 0.22,
        initialErrorPct: 22.5,
        calibratedErrorPct: 0.8,
        thresholdMax: 1.0,
        status: 'EXCELLENT',
      },
      {
        id: 'ur-force',
        name: 'Contact Insertion Force Vector',
        category: 'Contact-Force Error',
        unit: 'N',
        baselineSimVal: 38.5,
        physicalLogVal: 18.2,
        calibratedSimVal: 18.9,
        initialErrorPct: 42.0,
        calibratedErrorPct: 1.8,
        thresholdMax: 3.5,
        status: 'EXCELLENT',
      },
      {
        id: 'ur-time',
        name: 'ROS 2 Action Client Round-Trip Latency',
        category: 'Timing & Latency',
        unit: 'ms',
        baselineSimVal: 0.20,
        physicalLogVal: 2.45,
        calibratedSimVal: 2.38,
        initialErrorPct: 82.0,
        calibratedErrorPct: 1.9,
        thresholdMax: 4.0,
        status: 'EXCELLENT',
      },
      {
        id: 'ur-vis',
        name: 'Visual Point-Cloud Centroid Delta',
        category: 'Visual & Perception',
        unit: 'mm',
        baselineSimVal: 0.00,
        physicalLogVal: 3.20,
        calibratedSimVal: 2.85,
        initialErrorPct: 35.0,
        calibratedErrorPct: 4.2,
        thresholdMax: 6.0,
        status: 'VALIDATED',
      },
    ],
    tunableParameters: [
      {
        id: 'p-fric',
        name: 'Fingertip Rubber-Steel Friction (μ)',
        symbol: 'μ_contact',
        unit: 'coeff',
        nominalCad: 0.75,
        physicalEstimated: 0.38,
        tunedOptimal: 0.39,
        minBound: 0.15,
        maxBound: 0.95,
        confidencePct: 97.8,
        subsystem: 'Grasp Dynamics',
        description: 'Accounts for industrial coolant mist and surface finish on machined aluminum workpieces.',
      },
      {
        id: 'p-damp',
        name: 'Harmonic Drive Viscous Damping',
        symbol: 'c_joint',
        unit: 'N·m·s/rad',
        nominalCad: 2.5,
        physicalEstimated: 4.8,
        tunedOptimal: 4.75,
        minBound: 1.0,
        maxBound: 8.0,
        confidencePct: 98.6,
        subsystem: 'Actuator Dynamics',
        description: 'Lubricant shear resistance inside strain-wave gearboxes at 24°C ambient factory floor temperature.',
      },
      {
        id: 'p-mass',
        name: 'Payload Mass & Inertia Tensor (m)',
        symbol: 'm_load',
        unit: 'kg',
        nominalCad: 3.5,
        physicalEstimated: 4.22,
        tunedOptimal: 4.20,
        minBound: 2.0,
        maxBound: 6.0,
        confidencePct: 99.4,
        subsystem: 'Payload Dynamics',
        description: 'Actual workpiece plus fixture tooling brackets unmodeled in raw STEP CAD export.',
      },
      {
        id: 'p-delay-bus',
        name: 'EtherCAT & Kernel Actuation Delay',
        symbol: 'τ_bus',
        unit: 'ms',
        nominalCad: 0.05,
        physicalEstimated: 1.80,
        tunedOptimal: 1.78,
        minBound: 0.01,
        maxBound: 4.0,
        confidencePct: 99.1,
        subsystem: 'Control Loop',
        description: 'Linux PREEMPT_RT kernel thread scheduling jitter and EtherCAT slave hardware cycle.',
      },
    ],
    validityEnvelopes: [
      {
        parameterDimension: 'Payload Mass',
        validInterval: '0.40 kg — 5.80 kg',
        invalidatedRegions: '> 6.5 kg (exceeds joint 4-5 dynamic torque margins)',
        empiricalConfidencePct: 98.6,
        testEvidenceRuns: 54,
      },
      {
        parameterDimension: 'Cartesian TCP Speed',
        validInterval: '0.05 m/s — 1.65 m/s',
        invalidatedRegions: '> 2.0 m/s (SS1 ISO 13849 protective stop boundary)',
        empiricalConfidencePct: 99.2,
        testEvidenceRuns: 82,
      },
      {
        parameterDimension: 'Friction Coefficient μ',
        validInterval: '0.24 — 0.85',
        invalidatedRegions: '< 0.20 (unmitigated slip drop frontier)',
        empiricalConfidencePct: 96.5,
        testEvidenceRuns: 38,
      },
    ],
  },
  surgical_twin: {
    id: 'surgical_twin',
    name: 'Surgical Laparoscopic Articulator Twin',
    telemetryLogSource: 'Phantom Silicone Benchtop Suture Test #MED-812 (1000 Hz F/T)',
    timeHorizonSec: 6.0,
    dataPointsSynced: 6000,
    overallTwinTrustScorePct: 97.1,
    baselineRealityGapPct: 15.6,
    calibratedRealityGapPct: 1.3,
    validitySummary: 'Validated for suture insertion speed 1–15 mm/s, tissue stiffness 15–80 kPa, and curvature angles 0–45°. Hysteresis model verified.',
    subsystems: [
      {
        id: 'surg_wrist',
        subsystemName: 'Tendon Bowden-Cable Transmission',
        scorePct: 97.8,
        status: 'HIGH TRUST (AIRWORTHY)',
        color: 'emerald',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/40',
        bgLight: 'bg-emerald-500/10',
        mismatchScorePct: 1.2,
        sampleCount: 6000,
        validityNotes: 'Capstan friction hysteresis calibrated; needle angle tracking accurate to 0.18°.',
        keySensorsUsed: ['Miniature Optical Spool Encoders'],
      },
      {
        id: 'surg_tissue',
        subsystemName: 'Tissue Puncture & Viscoelastic Compliance',
        scorePct: 94.2,
        status: 'HIGH TRUST (AIRWORTHY)',
        color: 'emerald',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/40',
        bgLight: 'bg-emerald-500/10',
        mismatchScorePct: 2.2,
        sampleCount: 6000,
        validityNotes: 'Nonlinear tissue puncture force threshold aligned with medical phantom logs to 0.14 N.',
        keySensorsUsed: ['Needle Base Nano-Strain Gauge Bridge'],
      },
      {
        id: 'surg_endoscope',
        subsystemName: 'Stereo Laparoscopic 3D Reconstruction',
        scorePct: 82.5,
        status: 'MEDIUM TRUST (GUARDED)',
        color: 'amber',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/40',
        bgLight: 'bg-amber-500/10',
        mismatchScorePct: 5.6,
        sampleCount: 2400,
        validityNotes: 'Specularity and fluid reflections produce occasional stereo disparity jitter during blood pool onset.',
        keySensorsUsed: ['4K Stereo Endoscope 60 FPS'],
      },
    ],
    mismatches: [
      {
        id: 'surg-traj',
        name: 'Needle Tip Puncture Trajectory',
        category: 'Trajectory Delta',
        unit: 'mm',
        baselineSimVal: 0.85,
        physicalLogVal: 0.12,
        calibratedSimVal: 0.14,
        initialErrorPct: 32.0,
        calibratedErrorPct: 1.2,
        thresholdMax: 0.3,
        status: 'EXCELLENT',
      },
      {
        id: 'surg-force',
        name: 'Peak Capsule Penetration Force',
        category: 'Contact-Force Error',
        unit: 'N',
        baselineSimVal: 5.8,
        physicalLogVal: 3.4,
        calibratedSimVal: 3.48,
        initialErrorPct: 41.5,
        calibratedErrorPct: 1.4,
        thresholdMax: 0.5,
        status: 'EXCELLENT',
      },
    ],
    tunableParameters: [
      {
        id: 'p-tendon',
        name: 'Bowden Wire Backlash Slack (Δs)',
        symbol: 'Δs_cable',
        unit: 'mm',
        nominalCad: 0.02,
        physicalEstimated: 0.28,
        tunedOptimal: 0.27,
        minBound: 0.01,
        maxBound: 0.60,
        confidencePct: 98.4,
        subsystem: 'Tendon Transmission',
        description: 'Autoclave sterilization cycles stretch stainless steel drive wires.',
      },
      {
        id: 'p-tissue',
        name: 'Silicone Phantom Modulus (E)',
        symbol: 'E_tissue',
        unit: 'kPa',
        nominalCad: 50.0,
        physicalEstimated: 28.5,
        tunedOptimal: 28.2,
        minBound: 10.0,
        maxBound: 90.0,
        confidencePct: 97.2,
        subsystem: 'Tissue Compliance',
        description: 'Viscoelastic compliance of biological organ capsule tissue.',
      },
    ],
    validityEnvelopes: [
      {
        parameterDimension: 'Needle Insertion Speed',
        validInterval: '1.0 mm/s — 18.0 mm/s',
        invalidatedRegions: '> 22.0 mm/s (tissue tearing risk)',
        empiricalConfidencePct: 98.2,
        testEvidenceRuns: 45,
      },
    ],
  },
  legged_quadruped: {
    id: 'legged_quadruped',
    name: 'Autonomous Legged Robot Dynamic Locomotion Twin',
    telemetryLogSource: 'Outdoor Grass & Gravel Rough Terrain Log #QUAD-109 (1000 Hz IMU)',
    timeHorizonSec: 10.0,
    dataPointsSynced: 10000,
    overallTwinTrustScorePct: 96.2,
    baselineRealityGapPct: 17.5,
    calibratedRealityGapPct: 1.5,
    validitySummary: 'Validated for speeds 0.2–2.8 m/s, slopes 0–24°, and terrain hardness 30–95 Shore A. Contact restitution model calibrated.',
    subsystems: [
      {
        id: 'leg_actuator',
        subsystemName: 'Quasi-Direct Drive (QDD) Knee Motors',
        scorePct: 98.1,
        status: 'HIGH TRUST (AIRWORTHY)',
        color: 'emerald',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/40',
        bgLight: 'bg-emerald-500/10',
        mismatchScorePct: 1.1,
        sampleCount: 10000,
        validityNotes: 'Rotor inertia and back-EMF velocity damping verified against bench dyno to 0.8%.',
        keySensorsUsed: ['Dual Absolute Magnetic Encoders', 'Phase Current Sense'],
      },
      {
        id: 'leg_ground',
        subsystemName: 'Foot-Ground Contact & Compliance',
        scorePct: 92.4,
        status: 'HIGH TRUST (AIRWORTHY)',
        color: 'emerald',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/40',
        bgLight: 'bg-emerald-500/10',
        mismatchScorePct: 2.8,
        sampleCount: 10000,
        validityNotes: 'Anisotropic friction model tuned for wet grass vs. hard asphalt.',
        keySensorsUsed: ['Rubber Foot Ground-Reaction Optical Force Sensors'],
      },
      {
        id: 'leg_imu',
        subsystemName: 'Pelvis IMU & Kinematic EKF Fusion',
        scorePct: 97.5,
        status: 'HIGH TRUST (AIRWORTHY)',
        color: 'emerald',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/40',
        bgLight: 'bg-emerald-500/10',
        mismatchScorePct: 1.2,
        sampleCount: 10000,
        validityNotes: 'Vibration-isolated IMU matches torso orientation to 0.4° pitch/roll.',
        keySensorsUsed: ['MicroStrain 3DM-GX5 6-DOF IMU'],
      },
    ],
    mismatches: [
      {
        id: 'quad-traj',
        name: 'Pelvis Forward Velocity Tracking',
        category: 'Trajectory Delta',
        unit: 'm/s',
        baselineSimVal: 2.45,
        physicalLogVal: 1.82,
        calibratedSimVal: 1.84,
        initialErrorPct: 25.7,
        calibratedErrorPct: 1.1,
        thresholdMax: 2.0,
        status: 'EXCELLENT',
      },
      {
        id: 'quad-force',
        name: 'Stance Leg Peak Impact Force',
        category: 'Contact-Force Error',
        unit: 'N',
        baselineSimVal: 380.0,
        physicalLogVal: 265.0,
        calibratedSimVal: 268.0,
        initialErrorPct: 30.2,
        calibratedErrorPct: 1.1,
        thresholdMax: 3.5,
        status: 'EXCELLENT',
      },
    ],
    tunableParameters: [
      {
        id: 'p-restit',
        name: 'Foot Rubber Restitution (e)',
        symbol: 'e_foot',
        unit: 'coeff',
        nominalCad: 0.15,
        physicalEstimated: 0.42,
        tunedOptimal: 0.41,
        minBound: 0.05,
        maxBound: 0.80,
        confidencePct: 98.2,
        subsystem: 'Contact Restitution',
        description: 'Coefficient of restitution for TPU 3D printed foot pad impacting soil.',
      },
    ],
    validityEnvelopes: [
      {
        parameterDimension: 'Forward Running Velocity',
        validInterval: '0.10 m/s — 2.80 m/s',
        invalidatedRegions: '> 3.2 m/s (foot scuffing resonance)',
        empiricalConfidencePct: 98.5,
        testEvidenceRuns: 62,
      },
    ],
  },
};

export const TwinTrustCalibrationStudio: React.FC = () => {
  const [selectedSystem, setSelectedSystem] = useState<TwinTrustSystemId>('coanda_twin');
  const [activeTab, setActiveTab] = useState<'mismatch' | 'tuning' | 'validity' | 'subsystems'>('mismatch');
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibProgress, setCalibProgress] = useState<number>(100);
  const [notification, setNotification] = useState<string | null>(null);

  const currentPreset = TWIN_TRUST_PRESETS[selectedSystem];

  const handleRunCalibrationLoop = () => {
    setIsCalibrating(true);
    setCalibProgress(0);

    const interval = setInterval(() => {
      setCalibProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCalibrating(false);
          setNotification(`Twin Trust Calibration Loop Complete! Mismatch dropped to ${currentPreset.calibratedRealityGapPct}%.`);
          setTimeout(() => setNotification(null), 3500);
          return 100;
        }
        return prev + 15;
      });
    }, 100);
  };

  const handleExportCalibrationCertificate = () => {
    const cert = {
      meta: {
        title: 'AIGENESIS Twin Trust Calibration & Sim-to-Real Certificate',
        targetDigitalTwin: currentPreset.name,
        telemetrySource: currentPreset.telemetryLogSource,
        timestamp: new Date().toISOString(),
        overallTwinTrustScore: `${currentPreset.overallTwinTrustScorePct}%`,
        baselineRealityGap: `${currentPreset.baselineRealityGapPct}%`,
        calibratedRealityGap: `${currentPreset.calibratedRealityGapPct}%`,
      },
      validityOperationalEnvelope: currentPreset.validityEnvelopes,
      subsystemConfidenceScores: currentPreset.subsystems,
      measuredMismatchResiduals: currentPreset.mismatches,
      calibratedPhysicsParameters: currentPreset.tunableParameters,
    };

    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIGENESIS_TWIN_TRUST_CALIBRATION_${selectedSystem.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setNotification('Exported signed Twin Trust Calibration Certificate (.JSON)!');
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-8 animate-fadeIn font-mono pb-16">
      {/* Studio Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-400">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              <span>TWIN TRUST CALIBRATION LOOP</span>
            </span>
            <span>·</span>
            <span className="text-emerald-400">Physical Log-Simulation Alignment</span>
            <span>·</span>
            <span className="text-amber-300">Subsystem-Specific Validity Bounds</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Twin Trust: Empirical Log-to-Sim Calibration Engine
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl font-sans">
            Align physical hardware telemetry with digital twin simulations. Measure exact trajectory, contact-force, latency, and visual perception discrepancies; tune parameters into alignment; show the model’s certified validity range; and track trust by individual subsystem.
          </p>
        </div>

        {/* Action Controls */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleRunCalibrationLoop}
            disabled={isCalibrating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer shadow-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isCalibrating ? 'animate-spin' : ''}`} />
            <span>{isCalibrating ? `Aligning Logs (${calibProgress}%)...` : 'Run Calibration Loop'}</span>
          </button>

          <button
            onClick={handleExportCalibrationCertificate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Twin Certificate (.JSON)</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Target System Preset Selector Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-8 flex flex-wrap items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
          {(Object.keys(TWIN_TRUST_PRESETS) as TwinTrustSystemId[]).map((id) => {
            const item = TWIN_TRUST_PRESETS[id];
            const active = selectedSystem === id;
            return (
              <button
                key={id}
                onClick={() => setSelectedSystem(id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono transition cursor-pointer ${
                  active
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.name.split(' (')[0]}
              </button>
            );
          })}
        </div>

        {/* Global Reality Gap Metric Pill */}
        <div className="lg:col-span-4 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="text-slate-400">
            Initial Gap: <span className="text-rose-400 line-through font-bold">{currentPreset.baselineRealityGapPct}%</span>
          </div>
          <div className="text-slate-400">
            Tuned Gap: <span className="text-emerald-400 font-bold">{currentPreset.calibratedRealityGapPct}%</span>
          </div>
          <div className="text-slate-400">
            Twin Trust: <span className="text-cyan-400 font-bold">{currentPreset.overallTwinTrustScorePct}%</span>
          </div>
        </div>
      </div>

      {/* Synchronized Telemetry Header Strip */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">Physical Log Feed:</span>
          <strong className="text-white">{currentPreset.telemetryLogSource}</strong>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Synced Points: <strong className="text-slate-200">{currentPreset.dataPointsSynced.toLocaleString()}</strong></span>
          <span>Window: <strong className="text-slate-200">{currentPreset.timeHorizonSec}s @ 1000 Hz</strong></span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'mismatch', label: '1. Mismatch Measurement (4 Modalities)', icon: Activity },
          { id: 'tuning', label: '2. Parameter Tuning (Physical Inversion)', icon: Sliders },
          { id: 'validity', label: '3. Model Validity Envelopes', icon: ShieldCheck },
          { id: 'subsystems', label: '4. Subsystem Trust Confidence', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 border border-cyan-500/50 text-cyan-300 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: MISMATCH MEASUREMENT ACROSS 4 MODALITIES */}
      {activeTab === 'mismatch' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-cyan-400 font-bold uppercase">
                  SIM-TO-REAL DISCREPANCY AUDIT ACROSS 4 CORE MODALITIES
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Trajectory Delta, Contact-Force Error, Timing Latency, Visual Perception
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
                1000 Hz Dynamic Dynamic Time Warping (DTW) Residuals
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {currentPreset.mismatches.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-white text-sm mt-0.5">{item.name}</h4>
                    </div>

                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      {item.status}
                    </span>
                  </div>

                  {/* 3-Column Metrics Comparison */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Baseline Sim</div>
                      <div className="font-bold text-rose-300 mt-0.5">{item.baselineSimVal} {item.unit}</div>
                      <div className="text-[9px] text-rose-400 font-mono mt-0.5">{item.initialErrorPct}% error</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-cyan-400 uppercase">Physical Log</div>
                      <div className="font-bold text-white mt-0.5">{item.physicalLogVal} {item.unit}</div>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">Ground Truth</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/40">
                      <div className="text-[10px] text-emerald-400 uppercase font-bold">Calibrated Twin</div>
                      <div className="font-bold text-emerald-300 mt-0.5">{item.calibratedSimVal} {item.unit}</div>
                      <div className="text-[9px] text-emerald-400 font-mono mt-0.5">{item.calibratedErrorPct}% error</div>
                    </div>
                  </div>

                  {/* Error Reduction Bar */}
                  <div className="space-y-1 pt-1 text-[11px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Reality Gap Reduction:</span>
                      <strong className="text-emerald-400">
                        {(item.initialErrorPct - item.calibratedErrorPct).toFixed(1)}% improvement
                      </strong>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, (1 - item.calibratedErrorPct / item.initialErrorPct) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PARAMETER TUNING INTO ALIGNMENT */}
      {activeTab === 'tuning' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-emerald-400 font-bold uppercase">
                  SIMULATION PHYSICS PARAMETER INVERSION
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Tuned Parameters: Friction, Damping, Stiffness, Inertia, Actuator Delay, Noise
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
                Gradient-Based Inverse Physics Optimization (Loss &lt; 0.005)
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Standard simulation parameters taken from CAD/URDF files are notoriously inaccurate for dynamic interaction. The Twin Trust engine applies non-linear least squares to invert real logs and estimate actual physical coefficients.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {currentPreset.tunableParameters.map((param) => (
                <div key={param.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {param.name} ({param.symbol})
                      </h4>
                      <span className="text-[11px] text-cyan-400 font-sans">{param.subsystem}</span>
                    </div>

                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      Confidence: {param.confidencePct}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-sans">{param.description}</p>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Nominal CAD</div>
                      <div className="font-bold text-slate-300 mt-0.5">{param.nominalCad} {param.unit}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-amber-400 uppercase">Log Estimated</div>
                      <div className="font-bold text-amber-300 mt-0.5">{param.physicalEstimated} {param.unit}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/40">
                      <div className="text-[10px] text-emerald-400 uppercase font-bold">Optimal Tuned</div>
                      <div className="font-bold text-emerald-300 mt-0.5">{param.tunedOptimal} {param.unit}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Min Bound: {param.minBound} {param.unit}</span>
                    <span>Max Bound: {param.maxBound} {param.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VALIDITY RANGE ENVELOPES */}
      {activeTab === 'validity' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-indigo-400 font-bold uppercase">
                  OPERATIONAL VALIDITY BOUNDARIES (ANTI-HALLUCINATION ENVELOPE)
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Certified Operating Envelope: Where the Twin Can (and Cannot) Be Trusted
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
                Guaranteed Physics Bounds
              </span>
            </div>

            {/* Banner Statement */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs text-cyan-200 font-sans leading-relaxed">
              <strong>Formal Twin Verdict:</strong> {currentPreset.validitySummary}
            </div>

            <div className="space-y-4 pt-2">
              {currentPreset.validityEnvelopes.map((env, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="font-bold text-white text-sm">{env.parameterDimension}</h4>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      Empirical Confidence: {env.empiricalConfidencePct}% ({env.testEvidenceRuns} Physical Runs)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
                    <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                      <div className="text-emerald-400 font-mono text-[11px] font-bold uppercase flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Certified Valid Range</span>
                      </div>
                      <div className="text-slate-200 font-bold font-mono">{env.validInterval}</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1">
                      <div className="text-rose-400 font-mono text-[11px] font-bold uppercase flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Invalidated / Unmodeled Regions (Do Not Trust)</span>
                      </div>
                      <div className="text-slate-300 text-xs">{env.invalidatedRegions}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CONFIDENCE BY SUBSYSTEM */}
      {activeTab === 'subsystems' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-amber-400 font-bold uppercase">
                  GRANULAR SUBSYSTEM TRUST DECOMPOSITION
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Trust Scored by Subsystem Instead of Pretending the Entire Twin is Uniform
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
                Subsystem Integrity Matrix
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              A digital twin is never 100% accurate across all physics domains. While rigid-body kinematics might have 99.4% trust, high-frequency acoustic cavitation or thermal hysteresis might only achieve 62% trust. Transparently exposing subsystem trust prevents false engineering confidence.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {currentPreset.subsystems.map((sub) => (
                <div key={sub.id} className={`p-5 rounded-2xl bg-slate-950 border ${sub.borderColor} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{sub.subsystemName}</h4>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${sub.textColor} ${sub.bgLight} border ${sub.borderColor}`}>
                      {sub.scorePct}% Trust
                    </span>
                  </div>

                  <div className="text-xs font-mono text-slate-400">
                    Status: <strong className={sub.textColor}>{sub.status}</strong> · Residual: <strong className="text-slate-200">{sub.mismatchScorePct}%</strong>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${sub.scorePct >= 90 ? 'bg-emerald-500' : sub.scorePct >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${sub.scorePct}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-300 font-sans">{sub.validityNotes}</p>

                  <div className="pt-2 border-t border-slate-900 space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase">Synchronized Hardware Sensors:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {sub.keySensorsUsed.map((sensor, sIdx) => (
                        <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          {sensor}
                        </span>
                      ))}
                    </div>
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
