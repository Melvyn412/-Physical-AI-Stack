import React, { useState } from 'react';
import { 
  Cpu, Activity, Terminal, Network, Box, ShieldCheck, Sparkles, 
  ArrowRight, CheckCircle2, Zap, Layers, Play, Check, Shield, 
  Building2, Globe, FileCode, Flame, ChevronRight, Users, Wrench, 
  Calculator, ChevronDown, DollarSign, ExternalLink, Compass, Sliders,
  Target, GitFork, BarChart3, FileCheck, AlertOctagon, Scale, Calendar, Database, Stethoscope, Server, Film, HelpCircle
} from 'lucide-react';
import { ActiveTab } from '../types';
import { SurgicalCaseStudySection } from './SurgicalCaseStudySection';

interface LandingPageProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenCustomModal: () => void;
  onOpenProTrialModal?: () => void;
  onOpenTour?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenCustomModal,
  onOpenProTrialModal,
  onOpenTour
}) => {
  const [activeService, setActiveService] = useState<string>('simulation');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // ROI Calculator State
  const [robotCount, setRobotCount] = useState<number>(12);
  const [avgDevRate, setAvgDevRate] = useState<number>(125); // £/hr

  // Calculated ROI estimates
  const savedDevHoursPerRobot = 180; // hours saved per deployment
  const totalHoursSaved = robotCount * savedDevHoursPerRobot;
  const totalCostSaved = totalHoursSaved * avgDevRate;
  const hazardReductionPercent = 99.8;

  const servicesList = [
    {
      id: 'simulation',
      title: '5-Layer Physical AI Reasoning Engine',
      category: 'Core AI Synthesis',
      icon: Activity,
      badge: 'Core Service',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      description: 'Synthesizes high-level human objectives into closed-loop physical execution pipelines across perception, 3D world modeling, System 2 CoT safety reasoning, multi-agent consensus, and 1000Hz motor control.',
      deliverables: [
        'Multimodal Sensor Fusion (optical, LIDAR, acoustic, tactile)',
        '3D Spatial World Model physics rollouts',
        'System 2 Chain-of-Thought hazard prevention',
        'Closed-loop motor torque vector calculations'
      ],
      targetTab: 'simulator' as ActiveTab,
      btnText: 'Launch 5-Layer Simulator'
    },
    {
      id: 'mechanism-sim',
      title: 'Company Mechanism End-to-End Simulation & Savings',
      category: 'Digital Twin & Hardware ROI',
      icon: Cpu,
      badge: 'Failure & Savings Report',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      description: 'Simulate any company mechanism (surgical wrists, cycloidal legs, EO/IR gimbals, steer-by-wire) end-to-end at 1000 Hz. Identify critical failure modes and export an executive iteration savings report.',
      deliverables: [
        'Multi-axis kinematic workspace & 1000 Hz dynamic torque load simulation',
        'Singularity, thermal saturation, and gear backlash resonance detection',
        'Quantified physical prototype cycles avoided ($80k-$245k saved)',
        'One-click shareable executive report (Markdown, PDF, Email draft)'
      ],
      targetTab: 'mechanism-sim' as ActiveTab,
      btnText: 'Simulate Mechanism & View Savings'
    },
    {
      id: 'innovations',
      title: 'Next-Gen Innovations Lab (2025–2026 SOTA)',
      category: 'Physical AI & Cutting-Edge Autonomy',
      icon: Sparkles,
      badge: '6 Bleeding-Edge Modules',
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      description: '6 state-of-the-art physical AI breakthroughs: VLA foundation model distillation to 1000 Hz, <3ms optical tactile slip reflex, GPS-denied & EW navigation, Sim2Real digital certification, bare-metal EtherCAT firmware, and neuromorphic DVS vision.',
      deliverables: [
        'VLA Action Distillation (OpenVLA / Octo / π₀ continuous joint flows)',
        'Optical Tactile Array & <3ms closed-loop micro-slip reflex governor',
        'Electronic-Warfare & GPS-denied VIO + UWB swarm navigation',
        'Sim2Real Monte Carlo certification (ISO 26262, IEC 62304, MIL-STD-810H)',
        'Bare-metal C++20 / Rust firmware synthesizer for STM32, TI & Orin',
        'Event-based neuromorphic vision (DVS) with zero motion blur'
      ],
      targetTab: 'innovations' as ActiveTab,
      btnText: 'Explore Innovations Lab'
    },
    {
      id: 'slam',
      title: 'SLAM & Occupancy Grid Studio',
      category: 'Perception & Localization',
      icon: Compass,
      badge: 'Nav2 / Cartographer',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      description: 'Interactive Simultaneous Localization and Mapping with 360° LiDAR raycasting, Bresenham occupancy grid generation, Ceres graph loop closure optimization, and Nav2 parameter synthesis.',
      deliverables: [
        '2D LiDAR & Visual SLAM (vSLAM) feature point tracking',
        'Real-time occupancy grid mapping (free vs. occupied space)',
        'Odometry drift vs. Graph SLAM pose error estimation',
        'Production ROS 2 slam_toolbox_params.yaml & Nav2 bringup export'
      ],
      targetTab: 'slam' as ActiveTab,
      btnText: 'Open SLAM Studio'
    },
    {
      id: 'pid',
      title: 'PID Control & Step-Response Studio',
      category: 'Closed-Loop Actuation',
      icon: Sliders,
      badge: '1 kHz ros2_control',
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      description: 'High-frequency Proportional-Integral-Derivative closed-loop tuning. Simulate robotic arm joints, drone thrust, and motor velocity with anti-windup clamping and disturbance rejection.',
      deliverables: [
        'Real-time step-response oscilloscope (setpoint vs. process variable)',
        'P, I, D individual term telemetry & actuator saturation limits',
        'Ziegler-Nichols & critically damped auto-tuning presets',
        'C++ header-only & ROS 2 ros2_control YAML firmware export'
      ],
      targetTab: 'pid' as ActiveTab,
      btnText: 'Open PID Studio'
    },
    {
      id: 'ik',
      title: 'Inverse Kinematics (IK) & MoveIt 2 Studio',
      category: 'Manipulators & Arm Planning',
      icon: Target,
      badge: '6-DoF MoveGroup',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      description: 'Cartesian coordinate solver with Jacobian Damped Least Squares and CCD algorithms. Detects boundary singularities and generates ROS 2 MoveIt 2 kinematics.yaml and C++ trajectory nodes.',
      deliverables: [
        'Interactive draggable end-effector target & reachable workspace envelope',
        'Singularity & Jacobian condition monitoring',
        'Cartesian spline & inspection arc trajectory interpolation',
        'ROS 2 MoveIt 2 kinematics.yaml & C++ MoveGroup action exporter'
      ],
      targetTab: 'ik' as ActiveTab,
      btnText: 'Open IK Studio'
    },
    {
      id: 'bt',
      title: 'Behavior Tree (BT.CPP) Mission Studio',
      category: 'Autonomous Decision Engine',
      icon: GitFork,
      badge: 'Nav2 BT Navigator',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      description: 'Visual execution graph engine for complex robotics mission workflows. Simulate sequences, reactive fallbacks, battery condition gates, and spin recovery behaviors with BehaviorTree.CPP v4 export.',
      deliverables: [
        'Real-time tree ticking simulation (Success / Running / Failure states)',
        'Fault injection and obstacle spin-recovery branch execution',
        'ROS 2 Nav2 BT Navigator XML specification export',
        'C++ custom StatefulActionNode template generator'
      ],
      targetTab: 'bt' as ActiveTab,
      btnText: 'Open Behavior Tree Studio'
    },
    {
      id: 'export',
      title: 'ROS 2 & NVIDIA Isaac Sim Code Export',
      category: 'Hardware Middleware',
      icon: Terminal,
      badge: 'Hardware Bridge',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      description: 'Seamlessly translates virtual physical AI execution plans into production-ready Python rclpy nodes, high-frequency C++ trajectory controllers, URDF XML manifests, and NVIDIA Omniverse USD scripts.',
      deliverables: [
        'ROS 2 JointTrajectory & Torque controller packages',
        'NVIDIA Isaac Sim Omniverse Python scripts',
        'Kinematic URDF XML spatial definitions',
        'Sub-millisecond motor timing precision'
      ],
      targetTab: 'export' as ActiveTab,
      btnText: 'Open ROS 2 / Isaac Exporter'
    },
    {
      id: 'stress_testing',
      title: 'Live Fault & Hardware Stress Testing',
      category: 'Safety & Resilience',
      icon: Flame,
      badge: 'Fault Simulation',
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/30',
      description: 'Inject real-time physical degradation into your simulation—including motor overheating, sensor silt/glare occlusions, and joint backlash—to verify System 2 safety recovery before hardware deployment.',
      deliverables: [
        'Actuator thermal derating & torque drop models',
        'Optical dust, glare, and underwater silt noise injection',
        'Mechanical gear wear hysteresis compensation',
        'Real-time sub-millisecond fault mitigation logs'
      ],
      targetTab: 'simulator' as ActiveTab,
      btnText: 'Run Stress Simulator'
    },
    {
      id: 'kinematics',
      title: 'Interactive URDF & Robot CAD Builder',
      category: 'Kinematics & Hardware',
      icon: Box,
      badge: '3D CAD Tool',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      description: 'Prototype custom robotic manipulators and mobile platforms directly in your browser. Configure spatial link geometries, joint torque limits, and specialized end-effector tools.',
      deliverables: [
        '3-DOF to 7-DOF manipulator kinematics prototyping',
        'Custom joint angle limits and torque bounds',
        'Specialized end-effector tool heads (surgical, pneumatic, jaw, suction)',
        'Real-time forward kinematics spatial position feedback (X, Y, Z)'
      ],
      targetTab: 'kinematics' as ActiveTab,
      btnText: 'Build Custom URDF Arm'
    },
    {
      id: 'cad',
      title: 'CAD Ingestion & 3D Digital Twin Studio',
      category: 'Digital Twin & Modeling',
      icon: Box,
      badge: 'CAD-to-Sim',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      description: 'Connect Onshape, SolidWorks, or Fusion 360 models, or upload STL/OBJ/STEP files. Automatically compute mass & moments of inertia, generate V-HACD convex hulls, and synthesize URDF and MuJoCo models.',
      deliverables: [
        'Direct Onshape REST API cloud assembly sync',
        'In-browser 3D STL & OBJ file drag-and-drop parsing',
        'Automated mass, CoM, and 3x3 inertia tensor calculation',
        'V-HACD collision decomposition & MuJoCo/URDF synthesis'
      ],
      targetTab: 'cad' as ActiveTab,
      btnText: 'Open CAD Ingestion Studio'
    },
    {
      id: 'swarm',
      title: 'Multi-Agent Swarm Consensus Sandbox',
      category: 'Collaborative Robotics',
      icon: Network,
      badge: 'Multi-Robot',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      description: 'Coordinate multiple physical robots working in synchronized harmony. Simulates real-time mesh consensus voting, sub-goal Directed Acyclic Graph (DAG) task allocation, and obstacle avoidance.',
      deliverables: [
        'Mesh, Star, and Decentralized network topologies',
        'Sub-goal DAG task distribution matrix',
        'Real-time mesh consensus score tracking (>99.4%)',
        'Dynamic collision & obstacle avoidance'
      ],
      targetTab: 'swarm' as ActiveTab,
      btnText: 'Open Swarm Sandbox'
    },
    {
      id: 'compliance',
      title: 'ISO 10218 / FDA Safety Audit Certification',
      category: 'Enterprise & Regulatory',
      icon: ShieldCheck,
      badge: 'Regulatory',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      description: 'Generate audit-ready safety reports evaluating your physical AI pipelines against international robotics regulations (ISO 10218-1/2, ISO/TS 15066 cobots, FDA medical hazard analysis).',
      deliverables: [
        'Formal risk assessment audit reports',
        'Sub-millisecond System 2 guardrail verification',
        'Compliance verdict certificates for deployment approval',
        'Exportable PDF/Text audit documentation'
      ],
      targetTab: 'compliance' as ActiveTab,
      btnText: 'Export Safety Certificate'
    },
    {
      id: 'vv-evidence',
      title: 'V&V Evidence Engine (Exportable Evidence Pack)',
      category: 'Airworthiness & Regulated Systems',
      icon: FileCheck,
      badge: 'MIL-STD / FAA Ready',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      description: 'Generate verifiable, exportable engineering evidence packs: result summaries, failure-mode video exhibits, key coupled multi-physics plots, calibrated parameter sets, and SHA-256 signed audit logs.',
      deliverables: [
        'Complete Verification & Validation requirements matrix',
        'Failure-mode video exhibits with synchronized timestamps',
        'Commanded vs. achieved trajectory and residual plots',
        '1-click export of cryptographically signed Evidence Pack (.JSON)'
      ],
      targetTab: 'vv-evidence' as ActiveTab,
      btnText: 'Launch V&V Evidence Engine'
    },
    {
      id: 'fault-injection',
      title: 'Automated Fault-Injection Studio',
      category: 'Adversarial Discovery & Robustness',
      icon: AlertOctagon,
      badge: 'Boundary & Sobol Search',
      badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      description: 'Automatically discover failure frontiers: minimum degradation causing requirement failure, worst-case condition combinations, global Sobol sensitivity rankings, and failure clustering.',
      deliverables: [
        'Boundary search (minimum latency, sensor noise, friction drop)',
        'Worst-case search (CMA-ES multi-parameter trap combinations)',
        'Global Sobol variance decomposition & elasticity rankings',
        'DBSCAN / UMAP failure mode clustering into safety barriers'
      ],
      targetTab: 'fault-injection' as ActiveTab,
      btnText: 'Open Fault-Injection Studio'
    },
    {
      id: 'twin-trust',
      title: 'Twin Trust: Log-to-Sim Calibration Studio',
      category: 'Sim-to-Real Alignment & Certification',
      icon: Scale,
      badge: 'Subsystem Calibration',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      description: 'Empirical log-to-sim calibration loop: measures 4 discrepancy modalities, tunes inverted physics parameters, shows the model’s certified validity range, and tracks trust by individual subsystem.',
      deliverables: [
        'Physical telemetry vs. simulation scenario temporal alignment',
        '4-modality mismatch: trajectory, force, latency & visual delta',
        'Parameter inversion: friction, damping, stiffness & actuator delay',
        'Certified validity envelope & granular subsystem trust scores'
      ],
      targetTab: 'twin-trust' as ActiveTab,
      btnText: 'Launch Twin Trust Studio'
    },
    {
      id: 'scenario-gen',
      title: 'AI-Assisted Scenario Generation & Test Matrix',
      category: 'Automated CI/CD Verification & Testing',
      icon: Calendar,
      badge: 'Stochastic Synthesis',
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      description: 'Generate parameter distributions, 3D scene & asset layout variations, active sensor and actuator fault profiles, formal acceptance gates, and scheduled CI/CD test sweeps.',
      deliverables: [
        'Gaussian, Latin Hypercube & long-tail parameter sampling',
        'USD / Isaac Sim procedural layout & environmental clutter',
        'Sensor drift, actuator deadband & network dropout fault profiles',
        'Scheduled test matrix for nightly GPU cluster regression'
      ],
      targetTab: 'scenario-gen' as ActiveTab,
      btnText: 'Open Scenario Gen Studio'
    },
    {
      id: 'synthetic-data',
      title: 'Simulation-to-Synthetic-Data Pipeline Studio',
      category: 'Foundation Model & VLA Training Engine',
      icon: Database,
      badge: '9 Modalities',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      description: 'Extract 9 synchronized annotations from a single run (RGB, depth, segmentation, 6D pose, flow, wrench, tactile, joint states, events), deep domain randomization, replayable seeds, and 1-click export to Hugging Face LeRobot, Isaac Lab, BOP, and ROS 2.',
      deliverables: [
        '9 synchronized modalities from a single 1000 Hz physics run',
        '7-dimension domain randomization across lighting, BRDFs & noise',
        'Replayable deterministic scene YAML configurations & seeds',
        'Direct export to LeRobot / RLDS, Isaac Lab, BOP & ROS 2 MCAP bags'
      ],
      targetTab: 'synthetic-data' as ActiveTab,
      btnText: 'Launch Synthetic Data Studio'
    },
    {
      id: 'surgical-vv',
      title: 'Surgical Robotics V&V Pack (FDA / IEC 80601)',
      category: 'Medical Device Verification (RAMS)',
      icon: Stethoscope,
      badge: 'DHF Traceable',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      description: 'Recognisable surgical robotics V&V workflow: RCM pivot drift, trocar collision zones, singularity avoidance, latency & encoder faults, viscoelastic tissue uncertainties, 6 procedure-task templates, and forbidden safety volumes mapped to DHF design controls.',
      deliverables: [
        'Remote-Centre-of-Motion (RCM) lateral fulcrum deviation audit (<= 0.50mm)',
        'Trocar port placement & external arm elbow collision clearance matrix',
        '6 procedure templates: camera, reach, needle driving, cutting, suturing, knot-tying',
        'Audit-ready DHF test reports mapped to FDA 21 CFR 820.30 & ISO 14971'
      ],
      targetTab: 'surgical-vv' as ActiveTab,
      btnText: 'Open Surgical V&V Studio'
    },
    {
      id: 'defense-pack',
      title: 'Defence Robotics Assurance Pack (STANAG 4586)',
      category: 'Sovereign Contested Autonomy',
      icon: Shield,
      badge: 'Air-Gapped Sovereign',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      description: 'Mission assurance for contested operations: GPS-denied/degraded VIO navigation, spot jamming & meaconing resilience, brownout dust & 14.5G vibration stress, multi-threat scenario generation, and deterministic fail-safe abort logic.',
      deliverables: [
        'GPS-denied visual-inertial odometry + factor graph anti-spoofing decoupling',
        'Electronic Warfare (EW) barrage jamming, packet drops & FHSS hopping',
        'Contested-environment scenario generator across desert, urban & littoral theaters',
        'Sub-20ms fail-safe abort logic with air-gapped cryptographic SHA-256 audit logs'
      ],
      targetTab: 'defense-pack' as ActiveTab,
      btnText: 'Launch Defence Assurance Pack'
    },
    {
      id: 'secure-deployment',
      title: 'Secure Edge-to-Cloud Deployment & HIL Studio',
      category: 'Enterprise Infrastructure & Sovereign Compute',
      icon: Server,
      badge: '1 kHz HIL Bridge',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      description: 'Deploy across 4 secure tiers: developer workstations, sovereign on-premise clusters, private cloud VPCs, and air-gapped SCIF environments. Connect physical hardware via 1 kHz EtherCAT/CANopen HIL, ingest physical telemetry logs, and maintain an immutable CAD-to-firmware digital thread.',
      deliverables: [
        '4 secure topologies: local workstation, on-prem cluster, private VPC, air-gapped offline',
        '1 kHz Hardware-in-the-Loop (HIL) EtherCAT & CANopen real-time controller bridges',
        'Automated hardware telemetry log ingestion (MCAP / CSV / ROS 2 bags)',
        'Immutable digital thread linking CAD STEP, URDF, firmware commits & flight logs'
      ],
      targetTab: 'secure-deployment' as ActiveTab,
      btnText: 'Open Secure Deployment Studio'
    },
    {
      id: 'video-producer',
      title: 'Automated Video Production Studio',
      category: 'Autonomous Content & Demonstration Engine',
      icon: Film,
      badge: 'Zero Editing Skills Needed',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      description: 'Never worry about video production! AIGENESIS automatically scripts, animates, narrates, and renders 60 FPS robotics demonstration videos for you—complete with live telemetry HUDs, burned-in subtitles, browser voiceover, and 1-click WebM video export.',
      deliverables: [
        'Automated 4-act scripts (Problem, Root Cause, AI Rectification, Verified Success)',
        'Live 60 FPS physical canvas animations with real-time HUD telemetry stream',
        'Built-in speech synthesis narration + burned-in lower-third subtitles',
        '1-click video rendering and instant browser download (.WebM HD)'
      ],
      targetTab: 'video-producer' as ActiveTab,
      btnText: 'Launch Video Production Studio'
    },
    {
      id: 'teleop',
      title: 'Webcam & MediaPipe → UR10e + Robotiq 2F-85 Vision Teleop',
      category: 'Vision Teleoperation & Isaac Sim',
      icon: Target,
      badge: 'Live Hand Tracking',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      description: 'Real-time vision-based teleoperation using a laptop webcam, Google MediaPipe 21-point 3D hand skeleton, One-Euro jitter filtering, and Lula 6-DOF inverse kinematics driving a Universal Robots UR10e and Robotiq 2F-85 parallel gripper.',
      deliverables: [
        'Live Laptop Webcam + 21-Keypoint MediaPipe 3D hand tracking',
        'Thumb-to-index pinch distance mapped to Robotiq 2F-85 grasp force',
        'One-Euro / EMA low-pass filter suppressing webcam hand tremor (-89%)',
        '1-click export of NVIDIA Isaac Sim 4.2+ & ROS 2 Humble Python nodes'
      ],
      targetTab: 'teleop' as ActiveTab,
      btnText: 'Launch UR10e Vision Teleop'
    },
    {
      id: 'flywheel',
      title: 'Embodied AI Verification & Closed-Loop Data Flywheel',
      category: 'Sim-to-Real & Synthetic Data Engine',
      icon: Layers,
      badge: 'Closed-Loop Flywheel',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      description: 'Stress-test mechanisms and control policies in a parameterized Digital Twin, synthesize hard corner-case scenarios and RLDS/LeRobot datasets, validate against physical hardware, and continuously auto-calibrate both the model and the twin.',
      deliverables: [
        '4,096-env adversarial stress-testing (friction drops, CoM shift, backlash)',
        'Multi-modal synthetic data generation (RGB-D, 18µs DVS, 6-axis force/torque)',
        'Real-time Hardware-in-the-Loop (HiL) Sim-to-Real Reality Gap auditing',
        'Automated URDF/USD System Identification & 1000 Hz policy LoRA distillation'
      ],
      targetTab: 'flywheel' as ActiveTab,
      btnText: 'Launch Data Flywheel'
    },
    {
      id: 'coanda',
      title: 'Coandă Fluidic & Thrust-Vectoring Digital Twin',
      category: 'Pre-Machining Coupled CFD & Control',
      icon: Zap,
      badge: 'Pre-Machining Twin',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      description: 'Simulate boundary-layer fluid flow, fluidic thrust vectoring (±26°), crosswind vortex turbulence, high-speed solenoid valve response, and 1000 Hz closed-loop stabilization together before CNC-machining or 3D-printing a physical prototype.',
      deliverables: [
        'Coupled Newman slot-to-radius (h/R) & boundary-layer stall verification',
        '360-streamline 60 FPS 3D Coandă jet attachment & detachment visualizer',
        '1000 Hz closed-loop fluidic bleed-valve stabilization under turbulence',
        '1-click export of NVIDIA Modulus PINN, ROS 2 valve node & CNC GD&T specs'
      ],
      targetTab: 'coanda' as ActiveTab,
      btnText: 'Launch Coandă Fluidic Twin'
    },
    {
      id: 'analytics',
      title: 'Executive Visitor Telemetry & B2B Deanonymization',
      category: 'B2B Intelligence & Analytics',
      icon: BarChart3,
      badge: 'Live Traffic Intelligence',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      description: 'Real-time telemetry console identifying visiting defense contractors, surgical robotics companies, and research institutions via reverse-IP deanonymization, tracking their session journeys, module engagement, and 14-day trial conversions.',
      deliverables: [
        'Live reverse-IP B2B enterprise deanonymization (BAE, Intuitive, Anduril, etc.)',
        'Chronological module audit trails and high-intent engagement scores',
        'LinkedIn outreach campaign attribution (Melvyn Defense 14-Day Trial)',
        'One-click HubSpot / Salesforce CSV lead export and GA4 / PostHog integration'
      ],
      targetTab: 'analytics' as ActiveTab,
      btnText: 'Open Executive Analytics'
    },
    {
      id: 'enterprise_hil',
      title: 'Enterprise Air-Gapped VPC & 1 kHz HIL Bridge',
      category: 'Enterprise Infrastructure',
      icon: Cpu,
      badge: 'Zero Telemetry Egress',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      description: 'Air-gapped Kubernetes clusters, real-time CANopen/EtherCAT Hardware-in-the-Loop motor drivers, VDA 5050 fleet orchestration, and custom VLA foundation model fine-tuning.',
      deliverables: [
        '1 kHz CANopen / EtherCAT Hardware-in-the-Loop controller bridge',
        'Self-hosted Air-Gapped VPC with Kubernetes Helm charts',
        '100+ Robot Fleet & VDA 5050 AMR Factory Orchestration',
        'Dedicated Named Field Robotics Architect with 15-min SLA'
      ],
      targetTab: 'pricing' as ActiveTab,
      btnText: 'Explore Enterprise Tier (£100k/mo)'
    }
  ];

  const industries = [
    {
      title: 'Subsea & Offshore Exploration',
      icon: Globe,
      desc: 'Autonomous ROV micro-manipulation under silt turbulence, extreme pressure, and zero-optical visibility.',
      scenarioId: 'subsea-pipeline-repair'
    },
    {
      title: 'Micro-Surgical Medical Robotics',
      icon: Shield,
      desc: 'Zero-margin vascular suture placement with sub-millimeter tactile force feedback and tremor suppression.',
      scenarioId: 'micro-surgical-suture'
    },
    {
      title: 'Industrial Warehousing & Supply Chain',
      icon: Users,
      desc: 'High-speed collaborative cobot picking, palletizing, and multi-agent fleet swarm routing.',
      scenarioId: 'debris-clearance-rover'
    },
    {
      title: 'Extreme Environment & Aerospace',
      icon: Wrench,
      desc: 'Orbital satellite servicing and hazardous material containment under heavy thermal fluctuations.',
      scenarioId: 'hazardous-containment-arm'
    }
  ];

  const faqs = [
    {
      q: 'What is physical AI and how does it differ from traditional LLMs?',
      a: 'While standard LLMs process static text or images, Physical AI connects deep reasoning directly with physical world dynamics. AIGENESIS.TECH bridges high-level goal intent with closed-loop 3D spatial world modeling, sub-millisecond safety guardrails, and 1000Hz motor torque control.'
    },
    {
      q: 'How does the ROS 2 and NVIDIA Isaac Sim code export work?',
      a: 'When you synthesize a physical mission plan, AIGENESIS.TECH automatically translates the 5-layer plan into native ROS 2 packages (using rclpy or C++ trajectory messages), URDF spatial XML geometry files, or NVIDIA Omniverse Isaac Sim USD environment scripts.'
    },
    {
      q: 'Can we test our hardware against real-world mechanical degradation?',
      a: 'Yes. Our Live Hardware Stress & Fault Injector allows you to inject real-time motor thermal overheat, optical sensor silt/glare noise, and gear wear backlash to verify that System 2 reasoning automatically recalculates safe trajectories.'
    },
    {
      q: 'Is AIGENESIS.TECH compliant with international safety standards?',
      a: 'Our Safety Audit Exporter generates formal risk assessment reports evaluating your mission plans against ISO 10218-1/2 (Industrial Robotics), ISO/TS 15066 (Collaborative Cobots), and FDA ISO 14971 (Medical Devices).'
    }
  ];

  return (
    <div className="space-y-16 py-4">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-8 shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold shadow-inner">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>The Next-Generation Physical AI Platform</span>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-mono leading-tight">
            Synthesize Human Intent into <br />
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
              Physical Robotic Execution
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            AIGENESIS.TECH empowers robotics engineers, hardware startups, and enterprise teams to simulate, stress-test, and deploy closed-loop physical reasoning models across 5 integrated stack layers.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4 font-mono">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('simulator')}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-xl shadow-cyan-500/25 hover:scale-[1.02] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Launch Live 5-Layer Simulator</span>
            </button>

            {onOpenProTrialModal ? (
              <button
                onClick={onOpenProTrialModal}
                className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-cyan-500/10 hover:scale-[1.02] cursor-pointer"
              >
                <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span>Start 14-Day Free Pro Trial</span>
              </button>
            ) : null}

            {/* Getting Started Interactive Tour Button */}
            {onOpenTour && (
              <button
                id="btn-hero-tour"
                onClick={onOpenTour}
                className="flex items-center gap-2 px-6 py-3.5 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-cyan-500/10 hover:scale-[1.02] cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Take Interactive Tour</span>
              </button>
            )}

            {/* Prominent Pricing & Plans Button */}
            <button
              onClick={() => onNavigate('pricing')}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-xl shadow-amber-500/20 hover:scale-[1.02] cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>View Pricing & Enterprise Plans</span>
            </button>

            <button
              onClick={onOpenCustomModal}
              className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold rounded-2xl text-sm transition-all shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Custom Objective AI Synthesizer</span>
            </button>

            <button
              onClick={() => onNavigate('mechanism-sim')}
              className="flex items-center gap-2 px-6 py-3.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/10 hover:scale-[1.02] cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Simulate Mechanism & ROI Report</span>
            </button>

            <button
              onClick={() => onNavigate('innovations')}
              className="flex items-center gap-2 px-6 py-3.5 bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-500/40 hover:border-purple-400 font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-purple-500/10 hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Explore Innovations Lab</span>
            </button>
          </div>

          {/* Trial Reassurance Guarantee */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
            <div className="inline-flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>No credit card required</span>
            </div>
            <span className="text-slate-600">•</span>
            <span>Instant 14-day Pro access</span>
            <span className="text-slate-600">•</span>
            <span>Evaluate 1 kHz kinematics risk-free</span>
          </div>
        </div>

        {/* Key Platform Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-800/80 max-w-4xl mx-auto text-left font-mono">
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-500 block uppercase">Control Latency</span>
            <span className="text-xl sm:text-2xl font-bold text-cyan-400">1000 Hz</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Sub-millisecond loop</span>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-500 block uppercase">Stack Architecture</span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-400">5 Layers</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Perception to Motor</span>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-500 block uppercase">Hardware Export</span>
            <span className="text-xl sm:text-2xl font-bold text-indigo-400">ROS 2 / Isaac</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Python, C++, URDF</span>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-500 block uppercase">Safety Standard</span>
            <span className="text-xl sm:text-2xl font-bold text-amber-400">ISO 10218</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">FDA Hazard Certified</span>
          </div>
        </div>
      </section>

      {/* 2. Prominent Pricing & Plans Showcase Section */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-slate-800 pb-8 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>Transparent Pricing & Licensing</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
              Flexible Plans for Startups to Defense Primes
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl font-sans">
              Choose the right tier to accelerate your robotics development. All plans include 1000 Hz physics simulation, ROS 2 export, and compliance audits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onOpenProTrialModal ? (
              <button
                onClick={onOpenProTrialModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-mono font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Start 14-Day Free Trial</span>
              </button>
            ) : null}

            <button
              onClick={() => onNavigate('pricing')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 border border-slate-700 hover:border-amber-400 text-slate-200 hover:text-white font-mono font-bold text-xs rounded-xl transition cursor-pointer"
            >
              <span>Compare All Plan Details</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* 3 Featured Pricing Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Plan 1: Developer */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 space-y-5 flex flex-col justify-between transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Developer</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">Free Tier</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-white font-mono">£0</div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">Free forever / Sandbox evaluation</div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ideal for individual researchers and hardware prototyping engineers exploring physical reasoning.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-sans border-t border-slate-900 pt-4">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 100 daily simulation syntheses</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 5-Layer stack visualization</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Community ROS 2 export</li>
              </ul>
            </div>

            <button
              onClick={() => onNavigate('pricing')}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-mono text-xs font-bold border border-slate-800 transition cursor-pointer"
            >
              Current Plan
            </button>
          </div>

          {/* Plan 2: Pro (Highlighted) */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-emerald-500/60 shadow-xl shadow-emerald-500/10 space-y-5 flex flex-col justify-between relative">
            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono font-black text-[10px] uppercase tracking-wider shadow-md">
              Most Popular
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Professional</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">14-Day Free Trial</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white font-mono">£2,500</span>
                  <span className="text-xs text-slate-400 font-mono">/month</span>
                </div>
                <div className="text-xs text-emerald-400 font-mono mt-0.5">Includes full 14-day zero-risk trial</div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Full-stack physical AI for growing robotics teams shipping commercial manipulators and drones.
              </p>
              <ul className="space-y-2 text-xs text-slate-200 font-sans border-t border-slate-900 pt-4">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> <strong>1,000 daily compute units</strong></li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Coandă & Twin Trust calibration loops</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 1-click V&V Evidence Pack export</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Automated Fault-Injection & Sobol Search</li>
              </ul>
            </div>

            <button
              onClick={() => {
                if (onOpenProTrialModal) onOpenProTrialModal();
                else onNavigate('pricing');
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-black shadow-lg shadow-emerald-500/25 transition cursor-pointer"
            >
              Start 14-Day Free Pro Trial
            </button>
          </div>

          {/* Plan 3: Enterprise */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 space-y-5 flex flex-col justify-between transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Enterprise Air-Gapped</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">Defense & Regulated</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white font-mono">£100,000</span>
                  <span className="text-xs text-slate-400 font-mono">/month</span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">Air-gapped VPC / Dedicated Cluster</div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mission-critical deployments for aerospace primes, defense contractors, and medical device leaders.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-sans border-t border-slate-900 pt-4">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> Unlimited parallel simulation rollouts</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> Air-gapped on-premise Kubernetes cluster</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> ISO 10218, IEC 62304 & MIL-STD audits</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> 15-minute SLA dedicated robotics engineer</li>
              </ul>
            </div>

            <button
              onClick={() => onNavigate('pricing')}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-mono text-xs font-bold border border-slate-800 hover:border-amber-400/50 transition cursor-pointer"
            >
              Contact Enterprise Sales
            </button>
          </div>
        </div>
      </section>

      {/* 3. Core Services Offered Section */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-semibold">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Comprehensive Product Capabilities</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white font-mono">
            Full-Spectrum Services We Offer
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            From high-level AI objective synthesis to native ROS 2 code generation and compliance certification.
          </p>
        </div>

        {/* Services Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesList.map((service) => {
            const IconComponent = service.icon;
            return (
              <div
                key={service.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 space-y-5 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-cyan-500/5 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl group-hover:border-cyan-500/40 transition-all">
                      <IconComponent className="w-6 h-6 text-cyan-400" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${service.badgeColor}`}>
                      {service.badge}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">{service.category}</span>
                    <h3 className="text-lg font-bold text-white font-mono mt-0.5">{service.title}</h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Key Deliverables</span>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {service.deliverables.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(service.targetTab)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-950 hover:bg-slate-800 text-cyan-300 font-mono font-bold text-xs rounded-xl border border-slate-800 transition-all group-hover:border-cyan-500/30"
                >
                  <span>{service.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Interactive ROI & R&D Savings Estimator */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold">
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span>Enterprise Value Estimator</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold text-white font-mono">
              Calculate Your R&D & Hardware Savings
            </h2>
            <p className="text-xs text-slate-400">
              Estimate the engineering hours and financial savings achieved by virtualizing physical reasoning before physical robot deployment.
            </p>
          </div>

          <button
            onClick={() => onNavigate('pricing')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs rounded-xl hover:bg-emerald-500/30 transition-all"
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>View Pricing & API Plans</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Controls */}
          <div className="space-y-6 font-mono text-xs bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Fleet / Robot Target Count:</span>
                <span className="text-cyan-400 font-bold">{robotCount} Robots</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={robotCount}
                onChange={(e) => setRobotCount(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-900 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Engineering Hourly Rate:</span>
                <span className="text-emerald-400 font-bold">£{avgDevRate} / hr</span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                step="5"
                value={avgDevRate}
                onChange={(e) => setAvgDevRate(Number(e.target.value))}
                className="w-full accent-emerald-400 bg-slate-900 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div className="p-3 bg-slate-900 rounded-xl text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-slate-200 block">Assumptions:</span>
              <p>• Avg 180 dev hours saved per physical robot deployment.</p>
              <p>• Zero physical hardware damage during virtual stress testing.</p>
            </div>
          </div>

          {/* Results Visualizer */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-500 uppercase">Estimated Dev Hours Saved</span>
              <div className="text-3xl font-extrabold text-cyan-400 my-2">
                {totalHoursSaved.toLocaleString()} <span className="text-xs text-slate-400">hrs</span>
              </div>
              <span className="text-[10px] text-slate-400">Accelerated physical deployment</span>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-500 uppercase">Total Financial Savings</span>
              <div className="text-3xl font-extrabold text-emerald-400 my-2">
                £{totalCostSaved.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Direct engineering budget saved</span>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-500 uppercase">Hazard Risk Reduction</span>
              <div className="text-3xl font-extrabold text-indigo-400 my-2">
                {hazardReductionPercent}%
              </div>
              <span className="text-[10px] text-slate-400">System 2 hazard mitigation</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Target Industry Solutions */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Sectors & Use Cases</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-mono">
            Engineered for Zero-Margin Physical Domains
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {industries.map((ind, idx) => {
            const Icon = ind.icon;
            const isSurgical = ind.title.includes('Surgical');
            return (
              <div
                key={idx}
                onClick={() => {
                  if (isSurgical) {
                    const el = document.getElementById('surgical-case-study-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                      return;
                    }
                  }
                  onNavigate('simulator');
                }}
                className={`bg-slate-900 border ${isSurgical ? 'border-cyan-500/40 shadow-lg shadow-cyan-500/5' : 'border-slate-800'} hover:border-cyan-500/60 rounded-2xl p-5 space-y-3 cursor-pointer transition-all hover:scale-[1.02] group flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl w-fit group-hover:border-cyan-400">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    {isSurgical && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 animate-pulse">
                        Case Study Below ↓
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white font-mono">{ind.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{ind.desc}</p>
                </div>

                {isSurgical && (
                  <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1 font-bold pt-2 border-t border-slate-800/80">
                    <span>Read $180k Crisis Breakdown</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Clinical & Field Case Study Spotlight */}
      <SurgicalCaseStudySection onNavigate={onNavigate} />

      {/* 6. Frequently Asked Questions */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-mono">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-400">
            Everything you need to know about integrating AIGENESIS.TECH into your robotics stack.
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full text-left p-4 font-mono text-xs sm:text-sm font-bold text-slate-200 flex items-center justify-between gap-4 hover:text-cyan-300"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-900">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Bottom Call to Action Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border border-cyan-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-mono">
            Ready to Accelerate Your Physical AI Hardware?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Start synthesizing 5-layer physical execution plans and export ROS 2 scripts in seconds.
          </p>
        </div>

        <div className="flex justify-center gap-4 font-mono">
          <button
            onClick={() => onNavigate('simulator')}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400 text-slate-950 font-black rounded-2xl text-sm hover:scale-105 transition-all shadow-xl"
          >
            <span>Launch Live Simulator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
