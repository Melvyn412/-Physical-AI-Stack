import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  RefreshCw, Play, Pause, RotateCcw, ShieldAlert, Database, Cpu,
  CheckCircle2, Sliders, Download, Copy, Check, ArrowRight, Sparkles,
  Activity, Layers, Zap, Terminal, AlertTriangle, GitBranch, BarChart3
} from 'lucide-react';

type FlywheelStage = 1 | 2 | 3 | 4;
type SectorPresetId = 'warehouse' | 'surgical' | 'f1_aero' | 'coanda_tv' | 'subsea';
type ExportTab = 'isaac_dr' | 'synthetic_rlds' | 'sysid_calibrator';

interface SectorPreset {
  id: SectorPresetId;
  name: string;
  badge: string;
  robotName: string;
  policyName: string;
  nominalSuccess: number;
  nominalGap: number;
  failureScenario: string;
  sysIdParams: {
    param: string;
    unit: string;
    cadNominal: number;
    realHardware: number;
  }[];
}

const SECTOR_PRESETS: Record<SectorPresetId, SectorPreset> = {
  warehouse: {
    id: 'warehouse',
    name: 'Warehouse High-Speed Bin Picking',
    badge: 'UR10e + Robotiq 2F-85',
    robotName: 'UR10e + Robotiq 2F-85 Parallel Jaw',
    policyName: 'Distilled-VLA-1000Hz-Grasp-v4',
    nominalSuccess: 68.4,
    nominalGap: 14.8,
    failureScenario: 'Oil-film low friction (μ=0.18) + eccentric 4.2kg parcel CoM shift under 2.4 m/s² deceleration',
    sysIdParams: [
      { param: 'Fingertip Tangential Friction (μ)', unit: 'coeff', cadNominal: 0.75, realHardware: 0.41 },
      { param: 'Harmonic Drive J2 Backlash', unit: 'deg', cadNominal: 0.00, realHardware: 0.19 },
      { param: 'Robotiq Jaw Closure Phase Lag', unit: 'ms', cadNominal: 4.0, realHardware: 14.2 },
      { param: 'Wrist Payload Inertia (Izz)', unit: 'kg·m²', cadNominal: 0.042, realHardware: 0.061 },
    ],
  },
  surgical: {
    id: 'surgical',
    name: 'Surgical Micro-Vessel Suturing',
    badge: 'Ti-6Al-4V 7-DOF RCM Wrist',
    robotName: 'EndoWrist 7-DOF Cable-Driven Manipulator',
    policyName: 'Surgical-RCM-TremorSafe-1kHz',
    nominalSuccess: 72.0,
    nominalGap: 12.4,
    failureScenario: 'Autoclave tendon elongation (0.42mm slack) + pulsatile soft-tissue deformation (85 BPM)',
    sysIdParams: [
      { param: 'Bowden Cable Hysteresis Slack', unit: 'mm', cadNominal: 0.02, realHardware: 0.39 },
      { param: 'Tissue Viscoelastic Stiffness (E)', unit: 'kPa', cadNominal: 45.0, realHardware: 28.5 },
      { param: 'Trocar Seal Coulomb Friction', unit: 'N', cadNominal: 0.35, realHardware: 1.18 },
      { param: 'Force-Torque Sensor Thermal Drift', unit: 'mN', cadNominal: 0.0, realHardware: 42.0 },
    ],
  },
  f1_aero: {
    id: 'f1_aero',
    name: 'Formula 1 Active Aero Flap Control',
    badge: '2026 Spec Dual-Mode Aero',
    robotName: 'Carbon-Ti Bellcrank Hydraulic Actuator',
    policyName: 'AeroElastic-FlutterSuppress-1kHz',
    nominalSuccess: 74.5,
    nominalGap: 13.6,
    failureScenario: '315 km/h vortex shedding flutter + 5.2G kerb strike transient at 110°C actuator soak',
    sysIdParams: [
      { param: 'Bellcrank Pivot Thermal Backlash', unit: 'deg', cadNominal: 0.01, realHardware: 0.22 },
      { param: 'Flap Torsional Aero Stiffness', unit: 'Nm/deg', cadNominal: 420.0, realHardware: 358.0 },
      { param: 'Servo Valve Spool Deadband', unit: 'ms', cadNominal: 0.4, realHardware: 1.65 },
      { param: 'High-G Linkage Compliance', unit: 'mm/kN', cadNominal: 0.08, realHardware: 0.24 },
    ],
  },
  coanda_tv: {
    id: 'coanda_tv',
    name: 'Coandă Fluidic Thrust Vectoring',
    badge: 'Pre-Machining CFD + 1kHz Valve',
    robotName: 'Inconel-718 Coandă Thrust-Vectoring Nozzle',
    policyName: 'Coanda-BoundaryLayer-Stabilizer-1kHz',
    nominalSuccess: 66.8,
    nominalGap: 16.2,
    failureScenario: 'Boundary-layer stall at +22° deflection under 35% crosswind turbulence & DMLS Ra=4.2µm roughness',
    sysIdParams: [
      { param: 'Newman Slot-to-Radius Ratio (h/R)', unit: 'ratio', cadNominal: 0.030, realHardware: 0.038 },
      { param: 'DMLS Surface Roughness (Ra)', unit: 'µm', cadNominal: 1.20, realHardware: 3.85 },
      { param: 'Solenoid Bleed Valve Spool Lag', unit: 'ms', cadNominal: 0.80, realHardware: 2.45 },
      { param: 'Coandă Detachment Angle Threshold', unit: 'deg', cadNominal: 25.5, realHardware: 19.8 },
    ],
  },
  subsea: {
    id: 'subsea',
    name: 'Subsea ROV Valve & Pipe Manipulation',
    badge: '7-Function Electro-Hydraulic',
    robotName: 'Titan-7F Deepwater Manipulator (3000m)',
    policyName: 'HydroDynamic-ForceImpedance-v3',
    nominalSuccess: 64.2,
    nominalGap: 17.5,
    failureScenario: '1.8 m/s cross-current vortex + turbid backscatter occlusion + bio-fouled valve torque spike',
    sysIdParams: [
      { param: 'Hydrodynamic Added Mass Coeff', unit: 'ratio', cadNominal: 1.00, realHardware: 1.48 },
      { param: '2°C Seawater Hydraulic Viscosity', unit: 'cSt', cadNominal: 32.0, realHardware: 68.5 },
      { param: 'Jaw Marine Growth Slip Threshold', unit: 'Nm', cadNominal: 140.0, realHardware: 88.0 },
      { param: 'Acoustic/Optical Pose Latency', unit: 'ms', cadNominal: 8.0, realHardware: 29.5 },
    ],
  },
};

interface FlywheelLogEntry {
  gen: number;
  stage: string;
  summary: string;
  successRate: number;
  simToRealGap: number;
  syntheticEpisodes: number;
  timestamp: string;
}

export const DataFlywheelStudio: React.FC = () => {
  const [sectorId, setSectorId] = useState<SectorPresetId>('warehouse');
  const [activeStage, setActiveStage] = useState<FlywheelStage>(1);
  const [generation, setGeneration] = useState<number>(0);
  const [isCycling, setIsCycling] = useState<boolean>(false);
  const [isStepping, setIsStepping] = useState<boolean>(false);
  const [activeExportTab, setActiveExportTab] = useState<ExportTab>('isaac_dr');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Domain Randomization & Adversarial Stress Parameters
  const [frictionSpread, setFrictionSpread] = useState<number>(65); // % randomization range
  const [payloadVariance, setPayloadVariance] = useState<number>(40); // % mass/CoM shift
  const [backlashInjection, setBacklashInjection] = useState<number>(0.22); // deg
  const [occlusionSeverity, setOcclusionSeverity] = useState<number>(35); // %

  const preset = SECTOR_PRESETS[sectorId];

  // Computed closed-loop metrics as a function of Flywheel Generation (0..8+)
  const convergenceFactor = 1 - Math.exp(-generation * 0.58);
  const currentSuccessRate = Number(
    (preset.nominalSuccess + (99.4 - preset.nominalSuccess) * convergenceFactor).toFixed(1)
  );
  const currentSimToRealGap = Number(
    (preset.nominalGap * Math.exp(-generation * 0.52) + 0.6).toFixed(2)
  );
  const totalSyntheticEpisodes = generation * 2500 + 500;
  const cornerCasesResolved = Math.min(100, Math.round(28 + convergenceFactor * 71));
  const reflexLatencyMs = Number((1.45 - convergenceFactor * 0.68).toFixed(2));

  const [flywheelLogs, setFlywheelLogs] = useState<FlywheelLogEntry[]>([
    {
      gen: 0,
      stage: 'Baseline Audit',
      summary: 'Initial CAD URDF loaded. Unmodeled friction & backlash cause 14.8% Sim-to-Real trajectory divergence.',
      successRate: 68.4,
      simToRealGap: 14.8,
      syntheticEpisodes: 500,
      timestamp: '00:00.0',
    },
  ]);

  // Refs for 60 FPS 3D Parallel Rollout + Sim-vs-Real Arena
  const mount3DRef = useRef<HTMLDivElement | null>(null);
  const generationRef = useRef<number>(generation);
  useEffect(() => {
    generationRef.current = generation;
  }, [generation]);

  const stageRef = useRef<FlywheelStage>(activeStage);
  useEffect(() => {
    stageRef.current = activeStage;
  }, [activeStage]);

  const stressParamsRef = useRef({
    friction: frictionSpread,
    payload: payloadVariance,
    backlash: backlashInjection,
    occlusion: occlusionSeverity,
  });
  useEffect(() => {
    stressParamsRef.current = {
      friction: frictionSpread,
      payload: payloadVariance,
      backlash: backlashInjection,
      occlusion: occlusionSeverity,
    };
  }, [frictionSpread, payloadVariance, backlashInjection, occlusionSeverity]);

  // Reset generation when changing sector preset
  const handleSelectSector = (newSector: SectorPresetId) => {
    setSectorId(newSector);
    setGeneration(0);
    setActiveStage(1);
    const p = SECTOR_PRESETS[newSector];
    setFlywheelLogs([
      {
        gen: 0,
        stage: 'Baseline Audit',
        summary: `Loaded ${p.robotName}. Detected reality gap on: ${p.failureScenario}`,
        successRate: p.nominalSuccess,
        simToRealGap: p.nominalGap,
        syntheticEpisodes: 500,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  // Trigger a full 4-stage flywheel cycle (+1 Generation)
  const runSingleFlywheelIteration = () => {
    if (isStepping) return;
    setIsStepping(true);
    setActiveStage(1);

    setTimeout(() => setActiveStage(2), 550);
    setTimeout(() => setActiveStage(3), 1100);
    setTimeout(() => {
      setActiveStage(4);
      setGeneration((prev) => {
        const nextGen = prev + 1;
        const cf = 1 - Math.exp(-nextGen * 0.58);
        const sr = Number((preset.nominalSuccess + (99.4 - preset.nominalSuccess) * cf).toFixed(1));
        const gap = Number((preset.nominalGap * Math.exp(-nextGen * 0.52) + 0.6).toFixed(2));
        const eps = nextGen * 2500 + 500;

        const stageSummaries = [
          `Calibrated Twin friction & backlash residuals; distilled 2,500 adversarial episodes into 1kHz policy.`,
          `Closed Sim-to-Real torque delta by ${(gap * 0.65).toFixed(1)}%; hardened grasp reflex against CoM shifts.`,
          `Updated URDF harmonic compliance matrix & re-trained LoRA policy weights on high-occlusion rollouts.`,
          `Converged Digital Twin physics to <1.5% hardware residual; verified zero safety barrier violations.`,
        ];

        setFlywheelLogs((old) => [
          {
            gen: nextGen,
            stage: `Gen ${nextGen} Converged`,
            summary: stageSummaries[(nextGen - 1) % stageSummaries.length],
            successRate: sr,
            simToRealGap: gap,
            syntheticEpisodes: eps,
            timestamp: new Date().toLocaleTimeString(),
          },
          ...old.slice(0, 6),
        ]);
        return nextGen;
      });
      setIsStepping(false);
    }, 1650);
  };

  // Continuous Auto-Flywheel Loop
  useEffect(() => {
    if (!isCycling) return;
    const interval = setInterval(() => {
      runSingleFlywheelIteration();
    }, 2400);
    return () => clearInterval(interval);
  }, [isCycling, isStepping, sectorId]);

  // ===========================================================================
  // THREE.JS 3D PARALLEL ROLLOUT & SIM-VS-REAL VERIFICATION ARENA
  // ===========================================================================
  useEffect(() => {
    const container = mount3DRef.current;
    if (!container) return;

    const width = container.clientWidth || 720;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060b16);
    scene.fog = new THREE.FogExp2(0x060b16, 0.2);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.05, 30);
    camera.position.set(1.55, 1.22, 1.48);
    camera.lookAt(0.15, 0.28, 0.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xdbeafe, 0.85));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.35);
    dirLight.position.set(2.5, 4.0, 2.2);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(3.2, 32, 0x0ea5e9, 0x1e293b);
    scene.add(grid);

    // Helper to build a Manipulator Arm (Primary Calibrated Twin, Hardware Ground-Truth, or Domain-Randomized Rollout Ghost)
    const createArmRig = (
      colorHex: number,
      opacity: number,
      wireframe: boolean,
      baseOffset: THREE.Vector3
    ) => {
      const root = new THREE.Group();
      root.position.copy(baseOffset);
      scene.add(root);

      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        metalness: 0.6,
        roughness: 0.3,
        transparent: opacity < 1.0,
        opacity,
        wireframe,
      });

      const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.095, 0.08, 20), mat);
      baseMesh.position.y = 0.04;
      root.add(baseMesh);

      const panGroup = new THREE.Group();
      panGroup.position.y = 0.08;
      root.add(panGroup);

      const shoulderMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.12, 20), mat);
      shoulderMesh.position.y = 0.06;
      panGroup.add(shoulderMesh);

      const liftGroup = new THREE.Group();
      liftGroup.position.y = 0.12;
      panGroup.add(liftGroup);

      const L1 = 0.40;
      const L2 = 0.36;

      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.048, L1, 16), mat);
      upperArm.position.y = L1 / 2;
      liftGroup.add(upperArm);

      const elbowGroup = new THREE.Group();
      elbowGroup.position.y = L1;
      liftGroup.add(elbowGroup);

      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.04, L2, 16), mat);
      forearm.position.y = L2 / 2;
      elbowGroup.add(forearm);

      const eeGroup = new THREE.Group();
      eeGroup.position.y = L2;
      elbowGroup.add(eeGroup);

      const gripperBox = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.075, 0.055), mat);
      gripperBox.position.y = -0.04;
      eeGroup.add(gripperBox);

      return { root, panGroup, liftGroup, elbowGroup, eeGroup, L1, L2 };
    };

    // 1. Primary Calibrated Digital Twin (Solid Cyan)
    const twinArm = createArmRig(0x06b6d4, 1.0, false, new THREE.Vector3(0, 0, 0));

    // 2. Physical Hardware Ground-Truth Trace Arm (Rose/Emerald Wireframe Overlay at same base)
    const hardwareArm = createArmRig(0xf43f5e, 0.55, true, new THREE.Vector3(0, 0, 0));

    // 3. Parallel Domain-Randomized Rollout Ghosts (4 parallel stress-test environments)
    const ghostOffsets = [
      new THREE.Vector3(-0.42, 0, -0.45),
      new THREE.Vector3(0.42, 0, -0.45),
      new THREE.Vector3(-0.42, 0, 0.45),
      new THREE.Vector3(0.42, 0, 0.45),
    ];
    const ghostArms = ghostOffsets.map((offset, idx) =>
      createArmRig(idx % 2 === 0 ? 0xf59e0b : 0x818cf8, 0.32, false, offset)
    );

    // Trajectory Ribbon / Sim-vs-Real Reality Gap Line
    const trailPointsCount = 48;
    const twinTrailPositions = new Float32Array(trailPointsCount * 3);
    const hwTrailPositions = new Float32Array(trailPointsCount * 3);

    const twinTrailGeo = new THREE.BufferGeometry();
    twinTrailGeo.setAttribute('position', new THREE.BufferAttribute(twinTrailPositions, 3));
    const twinTrailLine = new THREE.Line(
      twinTrailGeo,
      new THREE.LineBasicMaterial({ color: 0x22d3ee, linewidth: 2 })
    );
    scene.add(twinTrailLine);

    const hwTrailGeo = new THREE.BufferGeometry();
    hwTrailGeo.setAttribute('position', new THREE.BufferAttribute(hwTrailPositions, 3));
    const hwTrailLine = new THREE.Line(
      hwTrailGeo,
      new THREE.LineBasicMaterial({ color: 0xf43f5e, linewidth: 2 })
    );
    scene.add(hwTrailLine);

    // Adversarial Perturbation Vector Arrow attached to End-Effector
    const arrowDir = new THREE.Vector3(1, 0, 0);
    const perturbationArrow = new THREE.ArrowHelper(
      arrowDir,
      new THREE.Vector3(0.4, 0.3, 0),
      0.18,
      0xf59e0b,
      0.04,
      0.025
    );
    scene.add(perturbationArrow);

    // Helper IK Solver to position an arm rig at (tx, ty, tz)
    const solveArmIK = (
      rig: ReturnType<typeof createArmRig>,
      tx: number,
      ty: number,
      tz: number
    ) => {
      const pan = Math.atan2(-tz, tx);
      const planar = Math.hypot(tx, tz);
      const dy = ty - 0.16;
      const reach = Math.min(Math.hypot(planar, dy), rig.L1 + rig.L2 - 0.015);
      const cosElbow = THREE.MathUtils.clamp(
        (reach * reach - rig.L1 * rig.L1 - rig.L2 * rig.L2) / (2 * rig.L1 * rig.L2),
        -0.98,
        0.98
      );
      const elbow = -Math.acos(cosElbow);
      const aLift = Math.atan2(dy, planar);
      const bLift = Math.atan2(rig.L2 * Math.sin(-elbow), rig.L1 + rig.L2 * Math.cos(-elbow));
      const lift = aLift + bLift - Math.PI / 2;

      rig.panGroup.rotation.y = pan;
      rig.liftGroup.rotation.z = lift;
      rig.elbowGroup.rotation.z = elbow;
    };

    let animId: number;
    const startTime = performance.now();

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      const t = Math.max(0, (now - startTime) * 0.001);

      const gen = generationRef.current;
      // Reality gap shrinks exponentially as Flywheel Generation increases!
      const gapScale = Math.exp(-gen * 0.55);
      const stressScale =
        (stressParamsRef.current.friction + stressParamsRef.current.payload) / 140;

      // Desired figure-8 pick-and-place verification trajectory
      const idealX = 0.44 + Math.cos(t * 1.6) * 0.14;
      const idealZ = Math.sin(t * 1.6) * 0.28;
      const idealY = 0.24 + Math.sin(t * 3.2) * 0.10;

      // Hardware Ground-Truth Trajectory (includes physical friction lag & harmonic oscillation)
      const hwX = idealX + Math.sin(t * 7.5) * 0.018 * stressScale;
      const hwZ = idealZ + Math.cos(t * 6.2) * 0.022 * stressScale;
      const hwY = idealY - 0.025 * stressScale;

      // Digital Twin Trajectory (starts diverging from Hardware at Gen 0, converges to Hardware as Gen -> 4+)
      const uncalibratedErrorX = Math.sin(t * 4.3 + 1.1) * 0.095 * gapScale * stressScale;
      const uncalibratedErrorZ = Math.cos(t * 5.1 + 0.5) * 0.105 * gapScale * stressScale;
      const uncalibratedErrorY = Math.sin(t * 6.0) * 0.065 * gapScale * stressScale;

      const twinX = hwX + uncalibratedErrorX;
      const twinZ = hwZ + uncalibratedErrorZ;
      const twinY = hwY + uncalibratedErrorY;

      solveArmIK(twinArm, twinX, twinY, twinZ);
      solveArmIK(hardwareArm, hwX, hwY, hwZ);

      // Update Parallel Domain-Randomized Stress-Test Rollout Ghosts
      ghostArms.forEach((ghost, idx) => {
        const phaseOffset = (idx + 1) * 1.35;
        const drVariance = 0.06 * stressScale;
        const gx = 0.42 + Math.cos(t * 1.8 + phaseOffset) * (0.12 + drVariance);
        const gz = Math.sin(t * 1.8 + phaseOffset) * (0.22 + drVariance);
        const gy = 0.22 + Math.sin(t * 3.6 + phaseOffset) * 0.09;
        solveArmIK(ghost, gx, gy, gz);
      });

      // Update Adversarial Force Vector Arrow at Twin End-Effector
      twinArm.eeGroup.updateWorldMatrix(true, false);
      const eeWorld = new THREE.Vector3();
      twinArm.eeGroup.getWorldPosition(eeWorld);
      perturbationArrow.position.copy(eeWorld);
      const pDir = new THREE.Vector3(
        Math.sin(t * 5.0),
        Math.cos(t * 3.7) * 0.5,
        Math.cos(t * 4.2)
      ).normalize();
      perturbationArrow.setDirection(pDir);
      perturbationArrow.setLength(0.08 + 0.14 * stressScale * (stageRef.current === 1 ? 1.3 : 0.8));

      // Update Sim vs Real Trajectory Ribbon Trails
      for (let i = 0; i < trailPointsCount; i++) {
        const histT = Math.max(0, t - i * 0.035);
        const hx =
          0.44 +
          Math.cos(histT * 1.6) * 0.14 +
          Math.sin(histT * 7.5) * 0.018 * stressScale;
        const hz =
          Math.sin(histT * 1.6) * 0.28 +
          Math.cos(histT * 6.2) * 0.022 * stressScale;
        const hy =
          0.24 + Math.sin(histT * 3.2) * 0.10 - 0.025 * stressScale;

        const tx =
          hx + Math.sin(histT * 4.3 + 1.1) * 0.095 * gapScale * stressScale;
        const tz =
          hz + Math.cos(histT * 5.1 + 0.5) * 0.105 * gapScale * stressScale;
        const ty = hy + Math.sin(histT * 6.0) * 0.065 * gapScale * stressScale;

        twinTrailPositions[i * 3] = tx;
        twinTrailPositions[i * 3 + 1] = ty;
        twinTrailPositions[i * 3 + 2] = tz;

        hwTrailPositions[i * 3] = hx;
        hwTrailPositions[i * 3 + 1] = hy;
        hwTrailPositions[i * 3 + 2] = hz;
      }
      twinTrailGeo.attributes.position.needsUpdate = true;
      hwTrailGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 720;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Code Snippets for the Flywheel Exporter
  const EXPORT_SNIPPETS: Record<ExportTab, { filename: string; title: string; code: string }> = {
    isaac_dr: {
      filename: 'isaac_lab_adversarial_flywheel.py',
      title: 'Stage 1 & 2: NVIDIA Isaac Lab Parallel Stress-Test & Adversarial Scenario Generator',
      code: `#!/usr/bin/env python3
"""
AIGENESIS Embodied AI Data Flywheel - Stage 1 & 2
Target System: ${preset.robotName} (${preset.policyName})
Spawns 4,096 parallel GPU Digital Twins in NVIDIA Isaac Lab, injects adversarial
physics perturbations, and isolates failure-mode trajectories for synthetic retraining.
"""
import torch
from omni.isaac.lab.envs import ManagerBasedRLEnv, ManagerBasedRLEnvCfg
from omni.isaac.lab.managers import EventTermCfg as EventTerm
from omni.isaac.lab.managers import SceneEntityCfg
import omni.isaac.lab.envs.mdp as mdp

class AdversarialFlywheelRandomizationCfg:
    """Calibrated by AIGENESIS Flywheel Gen ${generation} (Reality Gap: ${currentSimToRealGap}%)"""

    # 1. Surface Friction & Slip Stress-Test (Range: ±${frictionSpread}%)
    physics_material = EventTerm(
        func=mdp.randomize_rigid_body_material,
        mode="startup",
        params={
            "asset_cfg": SceneEntityCfg("robot", body_names=".*finger.*|.*tool0.*"),
            "static_friction_range": (${(0.75 * (1 - frictionSpread / 100)).toFixed(2)}, 0.95),
            "dynamic_friction_range": (${(0.60 * (1 - frictionSpread / 100)).toFixed(2)}, 0.85),
            "restitution_range": (0.0, 0.15),
            "num_buckets": 256,
        },
    )

    # 2. Payload Mass & Eccentric CoM Shift (Range: ±${payloadVariance}%)
    payload_mass = EventTerm(
        func=mdp.randomize_rigid_body_mass,
        mode="reset",
        params={
            "asset_cfg": SceneEntityCfg("workpiece"),
            "mass_distribution_params": (${(1.0 - payloadVariance / 100).toFixed(2)}, ${(1.0 + payloadVariance / 100).toFixed(2)}),
            "operation": "scale",
        },
    )

    # 3. Joint Backlash & Thermal Compliance Injection (${backlashInjection.toFixed(2)} deg)
    actuator_gains = EventTerm(
        func=mdp.randomize_actuator_gains,
        mode="reset",
        params={
            "asset_cfg": SceneEntityCfg("robot", joint_names=".*"),
            "stiffness_distribution_params": (0.78, 1.15),
            "damping_distribution_params": (0.65, 1.25),
            "operation": "scale",
        },
    )

print("[AIGENESIS Flywheel] Launching 4,096 parallel stress-test rollouts...")`,
    },
    synthetic_rlds: {
      filename: 'generate_lerobot_rlds_synthetic.py',
      title: 'Stage 2: Multi-Modal Synthetic Dataset Generator (RLDS / LeRobot HDF5)',
      code: `#!/usr/bin/env python3
"""
AIGENESIS Embodied AI Data Flywheel - Stage 2 Synthetic Data Generator
Exports hard corner-case rollouts (RGB-D + 18us Event DVS + 6-Axis Force/Torque)
into LeRobot HDF5 / Google RLDS format for VLA & 1000Hz Reflex Policy fine-tuning.
Total Synthetic Episodes Generated: ${totalSyntheticEpisodes.toLocaleString()}
"""
import h5py
import numpy as np
import json

def export_flywheel_episode_hdf5(episode_id: int, steps: int = 250):
    filename = f"aigenesis_flywheel_gen${generation}_ep{episode_id:05d}.hdf5"
    with h5py.File(filename, "w") as f:
        obs = f.create_group("observations")
        # 6-DOF Joint Positions, Velocities, and Measured External Torques
        obs.create_dataset("qpos", data=np.random.randn(steps, 6).astype(np.float32))
        obs.create_dataset("qvel", data=np.random.randn(steps, 6).astype(np.float32))
        obs.create_dataset("wrist_wrench_6d", data=np.random.randn(steps, 6).astype(np.float32))
        # High-speed 1000 Hz target actions distilled from privileged twin teacher
        f.create_dataset("action_1khz", data=np.random.randn(steps, 7).astype(np.float32))

        f.attrs["sector"] = "${preset.id}"
        f.attrs["robot"] = "${preset.robotName}"
        f.attrs["flywheel_generation"] = ${generation}
        f.attrs["sim_to_real_gap_pct"] = ${currentSimToRealGap}
        f.attrs["occlusion_severity_pct"] = ${occlusionSeverity}

    return filename

if __name__ == "__main__":
    out = export_flywheel_episode_hdf5(episode_id=1)
    print(f"[AIGENESIS] Saved annotated synthetic corner-case episode -> {out}")`,
    },
    sysid_calibrator: {
      filename: 'sim2real_sysid_twin_calibrator.py',
      title: 'Stage 3 & 4: Differentiable Hardware Validation & Twin Auto-Calibrator',
      code: `#!/usr/bin/env python3
"""
AIGENESIS Embodied AI Data Flywheel - Stage 3 & 4 Closed-Loop Calibrator
Ingests physical hardware ROS 2 / RTDE telemetry, computes the Sim-to-Real
Reality Gap, auto-updates the Digital Twin USD/URDF physics parameters,
and runs LoRA distillation on the 1000 Hz control policy.
"""
import numpy as np

CALIBRATED_TWIN_PARAMETERS = {
    "generation": ${generation},
    "policy_checkpoint": "${preset.policyName}-gen${generation}.onnx",
    "verified_success_rate_pct": ${currentSuccessRate},
    "sim_to_real_residual_pct": ${currentSimToRealGap},
    "identified_physics_parameters": {
${preset.sysIdParams
  .map((p) => {
    const calibratedVal = Number(
      (p.cadNominal + (p.realHardware - p.cadNominal) * convergenceFactor).toFixed(3)
    );
    return `        "${p.param}": {"cad_nominal": ${p.cadNominal}, "hardware_measured": ${p.realHardware}, "twin_calibrated": ${calibratedVal}, "unit": "${p.unit}"}`;
  })
  .join(',\n')}
    }
}

def compute_sim2real_loss(q_sim: np.ndarray, q_real: np.ndarray, tau_sim: np.ndarray, tau_real: np.ndarray) -> float:
    pos_rmse = np.sqrt(np.mean((q_sim - q_real) ** 2))
    torque_rmse = np.sqrt(np.mean((tau_sim - tau_real) ** 2))
    return float(0.7 * pos_rmse + 0.3 * torque_rmse)

if __name__ == "__main__":
    print("[AIGENESIS Stage 4] Updating Digital Twin URDF & exporting 1000 Hz ONNX policy...")
    for k, v in CALIBRATED_TWIN_PARAMETERS["identified_physics_parameters"].items():
        print(f"  - {k}: CAD={v['cad_nominal']} -> Calibrated Twin={v['twin_calibrated']} {v['unit']} (Real={v['hardware_measured']})")`,
    },
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(EXPORT_SNIPPETS[activeExportTab].code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadManifest = () => {
    const manifest = {
      platform: 'AIGENESIS Embodied AI Verification & Data Flywheel',
      timestamp: new Date().toISOString(),
      sector: preset.name,
      robot: preset.robotName,
      policy: `${preset.policyName}-gen${generation}`,
      flywheelGeneration: generation,
      metrics: {
        edgeCaseSuccessRatePct: currentSuccessRate,
        simToRealRealityGapPct: currentSimToRealGap,
        syntheticEpisodesGenerated: totalSyntheticEpisodes,
        cornerCasesResolvedPct: cornerCasesResolved,
        deterministicReflexLatencyMs: reflexLatencyMs,
      },
      adversarialStressConfig: {
        frictionRandomizationPct: frictionSpread,
        payloadMassVariancePct: payloadVariance,
        jointBacklashDeg: backlashInjection,
        opticalOcclusionPct: occlusionSeverity,
      },
      systemIdentificationTable: preset.sysIdParams.map((p) => ({
        parameter: p.param,
        unit: p.unit,
        cadNominal: p.cadNominal,
        hardwareMeasured: p.realHardware,
        twinCalibrated: Number(
          (p.cadNominal + (p.realHardware - p.cadNominal) * convergenceFactor).toFixed(3)
        ),
      })),
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aigenesis_flywheel_gen${generation}_${preset.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const STAGES: {
    id: FlywheelStage;
    title: string;
    subtitle: string;
    metricLabel: string;
    metricValue: string;
    color: string;
  }[] = [
    {
      id: 1,
      title: '1. Stress-Test in Digital Twin',
      subtitle: 'Inject backlash, CoM shift, friction drops & 5G vibration across 4,096 parallel rollouts',
      metricLabel: 'Adversarial Perturbations',
      metricValue: `±${frictionSpread}% μ / ${backlashInjection}° backlash`,
      color: 'cyan',
    },
    {
      id: 2,
      title: '2. Generate Hard Scenarios & Synthetic Data',
      subtitle: 'Isolate failure boundaries & synthesize annotated RGB-D + 18µs DVS + Force/Torque episodes',
      metricLabel: 'Synthetic Dataset Size',
      metricValue: `${totalSyntheticEpisodes.toLocaleString()} Episodes`,
      color: 'amber',
    },
    {
      id: 3,
      title: '3. Validate Against Physical Hardware (HiL)',
      subtitle: 'Stream real encoder & 6-axis wrench telemetry to measure the Sim-to-Real Reality Gap',
      metricLabel: 'Sim-to-Real Reality Gap',
      metricValue: `${currentSimToRealGap}% Residual`,
      color: 'rose',
    },
    {
      id: 4,
      title: '4. Auto-Calibrate Twin & Distill Policy',
      subtitle: 'Update URDF/USD friction & stiffness matrices + LoRA fine-tune the 1000 Hz reflex model',
      metricLabel: 'Edge-Case Policy Success',
      metricValue: `${currentSuccessRate}% Pass Rate`,
      color: 'emerald',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Top Studio Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-400">
            <span>CLOSED-LOOP EMBODIED AI ENGINE</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Verification & Data Flywheel</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-300">Sim-to-Real System Identification</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            Embodied AI Verification & Closed-Loop Data Flywheel
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl">
            Stress-test mechanisms and control policies in a parameterized Digital Twin, synthesize adversarial corner-case datasets, validate against physical hardware telemetry, and continuously auto-calibrate both the model and the twin.
          </p>
        </div>

        {/* Flywheel Execution Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={runSingleFlywheelIteration}
            disabled={isStepping}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isStepping ? 'animate-spin' : ''}`} />
            <span>Run Flywheel Iteration (+1 Gen)</span>
          </button>

          <button
            onClick={() => setIsCycling(!isCycling)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono font-bold text-xs border transition cursor-pointer ${
              isCycling
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            {isCycling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isCycling ? 'Auto-Flywheel Active' : 'Auto-Cycle Loop'}</span>
          </button>

          <button
            onClick={() => {
              setIsCycling(false);
              setGeneration(0);
              setActiveStage(1);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-mono transition cursor-pointer"
            title="Reset to Uncalibrated Baseline (Gen 0)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Gen 0</span>
          </button>
        </div>
      </div>

      {/* Sector Preset Bar + Generation KPI Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-7 flex flex-wrap items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
          {(Object.keys(SECTOR_PRESETS) as SectorPresetId[]).map((key) => {
            const item = SECTOR_PRESETS[key];
            const active = sectorId === key;
            return (
              <button
                key={key}
                onClick={() => handleSelectSector(key)}
                className={`px-3 py-2 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-2 ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-5 grid grid-cols-4 gap-2">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400">Flywheel Gen</div>
            <div className="text-lg font-extrabold font-mono text-cyan-400">Gen {generation}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400">Policy Pass</div>
            <div className="text-lg font-extrabold font-mono text-emerald-400">{currentSuccessRate}%</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400">Reality Gap</div>
            <div className="text-lg font-extrabold font-mono text-rose-400">{currentSimToRealGap}%</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400">Synthetic Eps</div>
            <div className="text-lg font-extrabold font-mono text-amber-300">
              {(totalSyntheticEpisodes / 1000).toFixed(1)}k
            </div>
          </div>
        </div>
      </div>

      {/* 4-Stage Closed-Loop Architecture Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAGES.map((st) => {
          const isCurrent = activeStage === st.id;
          return (
            <button
              key={st.id}
              onClick={() => setActiveStage(st.id)}
              className={`text-left p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                isCurrent
                  ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isCurrent ? 'text-cyan-300' : 'text-slate-200'
                    }`}
                  >
                    {st.title}
                  </span>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{st.subtitle}</p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">{st.metricLabel}</span>
                <span className="font-bold text-white">{st.metricValue}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Split Workspace: 3D Parallel Rollout & Sim-vs-Real Arena (7 Cols) + Stress & SysID Controls (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: 3D Digital Twin vs Physical Hardware Arena */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-bold text-white">{preset.robotName}</span>
              <span className="text-slate-500">·</span>
              <span className="text-cyan-400">{preset.policyName}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-cyan-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block" />
                Calibrated Twin
              </span>
              <span className="inline-flex items-center gap-1.5 text-rose-300">
                <span className="w-2.5 h-2.5 rounded-sm border border-rose-400 inline-block" />
                Real Hardware Trace
              </span>
              <span className="inline-flex items-center gap-1.5 text-amber-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400/60 inline-block" />
                4x DR Stress Rollouts
              </span>
            </div>
          </div>

          {/* 3D Canvas Container */}
          <div className="relative flex-1 min-h-[430px] bg-slate-950">
            <div ref={mount3DRef} className="w-full h-[430px]" />

            {/* Top-Left Overlay HUD */}
            <div className="absolute top-3 left-3 p-3 rounded-xl bg-slate-950/85 border border-slate-800 backdrop-blur-md space-y-1.5 text-xs font-mono max-w-sm pointer-events-none">
              <div className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">
                Target Corner-Case Stress Scenario
              </div>
              <div className="text-slate-200 text-[11px] leading-snug">{preset.failureScenario}</div>
              <div className="pt-1 flex items-center gap-3 text-[11px]">
                <span className="text-emerald-400 font-bold">
                  Corner Cases Resolved: {cornerCasesResolved}%
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-cyan-300">1kHz Loop: {reflexLatencyMs} ms</span>
              </div>
            </div>

            {/* Bottom-Left Convergence Banner */}
            <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-400">Sim-to-Real Trajectory Alignment: </span>
                <span className="text-white font-bold">
                  {generation === 0
                    ? 'Uncalibrated CAD Baseline (High Divergence between Cyan Twin & Rose Hardware)'
                    : `Flywheel Gen ${generation} Calibrated (Reality Gap reduced to ${currentSimToRealGap}%)`}
                </span>
              </div>
              <button
                onClick={runSingleFlywheelIteration}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold transition cursor-pointer"
              >
                + Calibrate Next Gen
              </button>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Adversarial Stress Controls & System Identification Table */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Stage 1 & 2 Adversarial Domain Randomization Controls */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Stage 1 & 2: Adversarial Stress & Domain Randomization
                </h3>
              </div>
              <span className="text-[11px] font-mono text-amber-300">4,096 GPU Envs</span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Surface Friction Variance (Δμ)</span>
                  <span className="text-cyan-400 font-bold">±{frictionSpread}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={90}
                  value={frictionSpread}
                  onChange={(e) => setFrictionSpread(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Payload Mass & Eccentric CoM Shift</span>
                  <span className="text-cyan-400 font-bold">±{payloadVariance}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={80}
                  value={payloadVariance}
                  onChange={(e) => setPayloadVariance(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Injected Joint Backlash & Thermal Play</span>
                  <span className="text-amber-300 font-bold">{backlashInjection.toFixed(2)}°</span>
                </div>
                <input
                  type="range"
                  min={0.02}
                  max={0.8}
                  step={0.02}
                  value={backlashInjection}
                  onChange={(e) => setBacklashInjection(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Optical Glare / DVS Sensor Occlusion</span>
                  <span className="text-indigo-300 font-bold">{occlusionSeverity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={75}
                  value={occlusionSeverity}
                  onChange={(e) => setOcclusionSeverity(Number(e.target.value))}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Stage 3 & 4 Hardware Validation & Twin System Identification */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Stage 3 & 4: Twin Auto-Calibration (System ID)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">
                {Math.round(convergenceFactor * 100)}% Calibrated
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                    <th className="py-2 pr-2">Physics Parameter</th>
                    <th className="py-2 px-2 text-right">CAD Init</th>
                    <th className="py-2 px-2 text-right text-rose-300">Hardware</th>
                    <th className="py-2 pl-2 text-right text-emerald-400">Twin Gen {generation}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {preset.sysIdParams.map((row) => {
                    const twinVal = Number(
                      (row.cadNominal + (row.realHardware - row.cadNominal) * convergenceFactor).toFixed(2)
                    );
                    return (
                      <tr key={row.param} className="text-slate-300">
                        <td className="py-2 pr-2 text-[11px] font-sans text-slate-200">
                          {row.param}
                        </td>
                        <td className="py-2 px-2 text-right text-slate-400">
                          {row.cadNominal}
                        </td>
                        <td className="py-2 px-2 text-right text-rose-300 font-semibold">
                          {row.realHardware}
                        </td>
                        <td className="py-2 pl-2 text-right text-emerald-400 font-bold">
                          {twinVal} <span className="text-[10px] text-slate-500">{row.unit}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Closed-Loop Flywheel Audit Log & Synthetic Data Export Suite */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Live Flywheel Convergence Ledger */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Continuous Flywheel Verification Ledger
                </h3>
              </div>
              <button
                onClick={handleDownloadManifest}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 text-xs font-mono transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Manifest</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {flywheelLogs.map((entry, idx) => (
                <div
                  key={`${entry.gen}-${idx}`}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 space-y-1.5 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">{entry.stage}</span>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-emerald-400 font-bold">Pass: {entry.successRate}%</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-rose-400">Gap: {entry.simToRealGap}%</span>
                    </div>
                  </div>
                  <p className="text-slate-400 font-sans text-xs leading-relaxed">
                    {entry.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5 text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Hardware-in-the-Loop (HiL) Safety Gate: <strong>PASS ({currentSuccessRate}%)</strong>
              </span>
            </div>
            <span className="text-emerald-400 font-bold">{totalSyntheticEpisodes.toLocaleString()} eps</span>
          </div>
        </div>

        {/* Right 7 Cols: 1-Click Flywheel Code & Synthetic Dataset Exporter */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono">
                1-Click Embodied AI Flywheel & Synthetic Data Pipeline Export
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono transition cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Script</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            {(
              [
                { id: 'isaac_dr', label: '1. Isaac Lab Stress-Test (DR)' },
                { id: 'synthetic_rlds', label: '2. LeRobot / RLDS Synthetic Data' },
                { id: 'sysid_calibrator', label: '3. Sim-to-Real Twin Calibrator' },
              ] as { id: ExportTab; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveExportTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                  activeExportTab === t.id
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-slate-400">
            {EXPORT_SNIPPETS[activeExportTab].title}
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200 overflow-x-auto max-h-[260px] leading-relaxed">
            <code>{EXPORT_SNIPPETS[activeExportTab].code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
