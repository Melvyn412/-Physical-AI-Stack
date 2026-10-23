import React, { useState } from 'react';
import {
  BookOpen, FolderGit2, Layers, Search, Filter, Play, CheckCircle2,
  ExternalLink, Download, Copy, Check, ArrowRight, Sparkles, Sliders,
  Compass, Target, GitFork, Database, Stethoscope, Shield, Server,
  Cpu, Activity, Zap, RefreshCw, Terminal, Eye, Boxes, Award, AlertTriangle, Film
} from 'lucide-react';
import { ActiveTab } from '../types';

export type ShowcaseMode = 'tutorials' | 'projects' | 'tools';
export type DomainCategory = 'all' | 'industrial' | 'mobile' | 'medical' | 'aerospace_defence' | 'foundations';
export type DifficultyLevel = 'all' | 'beginner' | 'intermediate' | 'advanced';

export interface TutorialStep {
  stepNumber: number;
  title: string;
  instruction: string;
  hint: string;
  verificationRule: string;
  defaultConfigKey: string;
  codeSnippet: string;
}

export interface InteractiveTutorial {
  id: string;
  title: string;
  domain: DomainCategory;
  domainLabel: string;
  difficulty: DifficultyLevel;
  difficultyLabel: string;
  estMinutes: number;
  summary: string;
  outcomes: string[];
  targetTab: ActiveTab;
  tabLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  interactiveParam: {
    label: string;
    unit: string;
    min: number;
    max: number;
    step: number;
    initialValue: number;
    optimalRange: [number, number];
    explanation: string;
  };
  steps: TutorialStep[];
}

export interface ProjectBlueprint {
  id: string;
  name: string;
  domain: DomainCategory;
  domainLabel: string;
  robotPlatform: string;
  controlFrequency: string;
  headline: string;
  description: string;
  keySpecs: { label: string; value: string }[];
  stackComponents: string[];
  targetTab: ActiveTab;
  tabLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  launchCommand: string;
  rosPackageName: string;
}

export interface PlatformToolShowcase {
  id: string;
  title: string;
  category: string;
  targetTab: ActiveTab;
  icon: React.ComponentType<{ className?: string }>;
  oneLiner: string;
  description: string;
  capabilities: string[];
  supportedStandards: string[];
  outputArtifacts: string[];
}

const TUTORIALS: InteractiveTutorial[] = [
  {
    id: 'tut-pid-tuning',
    title: 'Zero-to-1000Hz Closed-Loop PID Tuning with Anti-Windup',
    domain: 'industrial',
    domainLabel: 'Industrial Cobots',
    difficulty: 'beginner',
    difficultyLabel: 'Beginner',
    estMinutes: 8,
    summary: 'Learn how to tune high-frequency joint control loops for high-speed manipulation. Simulate step responses, suppress overshoot, and prevent integrator windup under heavy payloads.',
    outcomes: [
      'Understand proportional, integral, and derivative torque responses at 1000 Hz',
      'Apply anti-windup clamping to prevent actuator saturation during high-acceleration steps',
      'Export production ros2_control YAML configuration files ready for real servo drives'
    ],
    targetTab: 'pid',
    tabLabel: 'Open PID Control Studio',
    icon: Sliders,
    interactiveParam: {
      label: 'Proportional Gain (Kp)',
      unit: 'N·m/rad',
      min: 10,
      max: 120,
      step: 1,
      initialValue: 42,
      optimalRange: [38, 55],
      explanation: 'Kp drives response speed. Values below 38 lead to sluggish tracking; values above 55 induce resonant oscillation.'
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Analyze Open-Loop Plant Dynamics',
        instruction: 'Inspect the actuator inertia (0.042 kg·m²) and baseline friction coefficient before applying feedback.',
        hint: 'High payload inertia requires higher proportional authority to overcome static breakaway friction.',
        verificationRule: 'Verify that breakaway torque exceeds 4.5 N·m before ramping command position.',
        defaultConfigKey: 'kp_baseline',
        codeSnippet: `// Step 1: ros2_control Joint Velocity Configuration
hardware_interface:
  joints:
    - name: ur10e_wrist_1_joint
      state_interfaces: [position, velocity, effort]
      command_interfaces: [effort]
      limits:
        max_effort: 54.0 # Nm
        max_velocity: 3.14 # rad/s`
      },
      {
        stepNumber: 2,
        title: 'Inject Integral Anti-Windup Clamping',
        instruction: 'Clamp the accumulator between -15.0 and +15.0 N·m to eliminate overshoot after sudden stops.',
        hint: 'Without anti-windup, integral error accumulates during saturation and causes severe overshoot.',
        verificationRule: 'Step overshoot must remain under 8.5% with steady-state error <= 0.002 rad.',
        defaultConfigKey: 'ki_clamp',
        codeSnippet: `// Step 2: C++ Header-Only Anti-Windup Governor
double error = target_pos - measured_pos;
integral_accum += error * dt;
// Dynamic conditional integration clamping
if (actuator_saturated) {
  integral_accum = std::clamp(integral_accum, -15.0, 15.0);
}
double torque = Kp * error + Ki * integral_accum - Kd * measured_vel;`
      },
      {
        stepNumber: 3,
        title: 'Verify 1000 Hz Disturbance Rejection',
        instruction: 'Inject a simulated 15 N external collision wrench and verify recovery time within 18 milliseconds.',
        hint: 'A critically damped loop returns to nominal trajectory without ringing.',
        verificationRule: 'Actuator torque must not exceed continuous thermal limit of 54.0 N·m.',
        defaultConfigKey: 'disturbance_rejection',
        codeSnippet: `// Step 3: Fast Disturbance Recovery Gate
if (std::abs(measured_torque - expected_torque) > 12.0) {
  // Rapid disturbance observer activates secondary damping
  Kd_active = Kd * 1.45;
}`
      }
    ]
  },
  {
    id: 'tut-slam-ceres',
    title: '3D LiDAR SLAM, Ceres Loop Closures & Nav2 Bringup',
    domain: 'mobile',
    domainLabel: 'Autonomous Mobile',
    difficulty: 'intermediate',
    difficultyLabel: 'Intermediate',
    estMinutes: 12,
    summary: 'Master 3D spatial perception, raycasting LiDAR point clouds, measuring wheel slip drift, and eliminating cumulative errors with Ceres Levenberg-Marquardt pose graph optimization.',
    outcomes: [
      'Simulate 64-beam 360° LiDAR raycasting with occupancy grid generation',
      'Distinguish raw odometry dead-reckoning drift from ground-truth trajectories',
      'Configure Ceres sparse normal Cholesky solver to close loops within 5 milliseconds'
    ],
    targetTab: 'slam',
    tabLabel: 'Open SLAM & Nav2 Studio',
    icon: Compass,
    interactiveParam: {
      label: 'LiDAR Max Range',
      unit: 'meters',
      min: 4,
      max: 25,
      step: 1,
      initialValue: 12,
      optimalRange: [10, 18],
      explanation: 'Shorter range misses distant corridor walls; excessive range incorporates noisy grazing-incidence ray scatter.'
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Generate Bresenham 2D/3D Occupancy Grids',
        instruction: 'Stream 360° laser scans through the Bresenham line algorithm to map free space versus occupied obstacles.',
        hint: 'Log-odds updating prevents transient dynamic occlusions from corrupting static walls.',
        verificationRule: 'Occupancy grid resolution set to 0.05m per cell with 95% spatial coverage.',
        defaultConfigKey: 'grid_mapping',
        codeSnippet: `// Step 1: Nav2 Costmap Layer YAML
local_costmap:
  local_costmap:
    ros__parameters:
      update_frequency: 10.0
      publish_frequency: 5.0
      global_frame: odom
      robot_base_frame: base_footprint
      resolution: 0.05
      plugins: ["obstacle_layer", "inflation_layer"]`
      },
      {
        stepNumber: 2,
        title: 'Quantify Wheel Slip Odometry Drift',
        instruction: 'Observe trajectory divergence exceeding 140 mm as the mobile robot traverses low-friction terrain.',
        hint: 'Tire slip accumulates unbounded dead-reckoning error without scan-to-map registration.',
        verificationRule: 'Drift metric logged and flagged for graph optimization trigger.',
        defaultConfigKey: 'drift_check',
        codeSnippet: `// Step 2: Measure Mahalanobis Distance for Drift
double odom_error = std::hypot(odom_x - ground_truth_x, odom_y - ground_truth_y);
if (odom_error > 0.10) {
  trigger_scan_matcher(ScanMatcherType::CORRELATIVE);
}`
      },
      {
        stepNumber: 3,
        title: 'Execute Ceres Non-Linear Loop Closure',
        instruction: 'Engage the Ceres Sparse Normal Cholesky solver upon revisiting the starting corridor to snap the map.',
        hint: 'Loop closure minimizes pose error from 184 mm down to sub-centimeter bounds.',
        verificationRule: 'Ceres residual chi-squared drops below 0.005 with zero map tearing.',
        defaultConfigKey: 'ceres_closure',
        codeSnippet: `// Step 3: Ceres Problem Formulation
ceres::Problem problem;
for (const auto& constraint : loop_constraints) {
  ceres::CostFunction* cost_function = PoseGraph3DErrorTerm::Create(constraint.relative_pose);
  problem.AddResidualBlock(cost_function, new ceres::HuberLoss(0.1), 
                           pose_nodes[constraint.id_a].data(), 
                           pose_nodes[constraint.id_b].data());
}
ceres::Solver::Options options;
options.linear_solver_type = ceres::SPARSE_NORMAL_CHOLESKY;
ceres::Solve(options, &problem, &summary);`
      }
    ]
  },
  {
    id: 'tut-ik-singularity',
    title: '6-DOF MoveIt 2 Inverse Kinematics & Singularity Avoidance',
    domain: 'industrial',
    domainLabel: 'Industrial Cobots',
    difficulty: 'intermediate',
    difficultyLabel: 'Intermediate',
    estMinutes: 10,
    summary: 'Solve Cartesian trajectories for 6-DOF robotic arms. Detect boundary singularities, monitor Jacobian condition numbers, and apply Damped Least-Squares damping to prevent runaway joint velocity surges.',
    outcomes: [
      'Calculate end-effector reachability envelopes and joint limits',
      'Detect kinematic gimbal lock and wrist boundary singularities',
      'Implement Levenberg-Marquardt damping (λ = 0.04) to guarantee smooth tool motion'
    ],
    targetTab: 'ik',
    tabLabel: 'Open Inverse Kinematics Studio',
    icon: Target,
    interactiveParam: {
      label: 'DLS Damping Factor (λ)',
      unit: 'damping coeff',
      min: 0.0,
      max: 0.15,
      step: 0.01,
      initialValue: 0.04,
      optimalRange: [0.03, 0.06],
      explanation: 'Damping prevents joint velocities from spiking near singular positions. λ = 0.04 eliminates runaway surges while maintaining sub-millimeter tool precision.'
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Evaluate Jacobian Condition Number',
        instruction: 'Compute the ratio of maximum to minimum singular values of the 6x6 manipulator Jacobian.',
        hint: 'When condition number κ exceeds 100, standard pseudoinverse IK triggers dangerous velocity spikes.',
        verificationRule: 'Jacobian determinant must be monitored continuously at 1000 Hz.',
        defaultConfigKey: 'jacobian_cond',
        codeSnippet: `// Step 1: Jacobian SVD Analysis
Eigen::JacobiSVD<Eigen::MatrixXd> svd(J, Eigen::ComputeThinU | Eigen::ComputeThinV);
double cond_num = svd.singularValues()(0) / svd.singularValues()(svd.singularValues().size() - 1);
if (cond_num > 100.0) {
  engage_damped_least_squares(0.04);
}`
      },
      {
        stepNumber: 2,
        title: 'Apply Adaptive Damped Least-Squares (DLS)',
        instruction: 'Replace standard matrix inversion with J^T (J J^T + λ² I)^(-1) to clamp joint velocity near singularities.',
        hint: 'DLS gracefully sacrifices negligible Cartesian deviation in exchange for bounded joint speeds.',
        verificationRule: 'Joint velocities clamped under 18.0 deg/s when traversing gimbal lock.',
        defaultConfigKey: 'dls_solve',
        codeSnippet: `// Step 2: Damped Least Squares IK Equation
Eigen::MatrixXd I = Eigen::MatrixXd::Identity(6, 6);
Eigen::MatrixXd J_dls = J.transpose() * (J * J.transpose() + lambda_sq * I).inverse();
Eigen::VectorXd joint_velocity = J_dls * cartesian_velocity;`
      }
    ]
  },
  {
    id: 'tut-synthetic-data-modalities',
    title: 'Simulation-to-Synthetic-Data Pipeline: 9 Synchronized Modalities',
    domain: 'foundations',
    domainLabel: 'Perceptual AI',
    difficulty: 'advanced',
    difficultyLabel: 'Production',
    estMinutes: 15,
    summary: 'Generate massive multimodal robotics training datasets from simulation runs with zero registration drift. Master Latin Hypercube domain randomization, event DVS streams, and Hugging Face LeRobot exports.',
    outcomes: [
      'Extract 9 modalities simultaneously: RGB, depth, segmentation, 6D pose, optical flow, wrench, tactile, joint states, and DVS events',
      'Apply Latin Hypercube sampling across camera poses, lighting, surface friction, and object mass',
      'Export training-ready HDF5 datasets compatible with OpenVLA, Octo, and ACT policies'
    ],
    targetTab: 'synthetic-data',
    tabLabel: 'Open Synthetic Data Studio',
    icon: Database,
    interactiveParam: {
      label: 'Randomization Spread (Latin Hypercube)',
      unit: '% variance',
      min: 5,
      max: 60,
      step: 5,
      initialValue: 25,
      optimalRange: [20, 35],
      explanation: 'A 25% spread covers physical real-world friction and mass variance without distorting visual geometry.'
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Configure 9 Synchronized Sensors at 1000 Hz',
        instruction: 'Bind camera depth buffers, tactile elastomer normal fields, and 6-axis FT sensors to a single simulation clock.',
        hint: 'Shared simulation clock eliminates the spatial-temporal drift common in hardware sensor rigs.',
        verificationRule: 'All 9 modality streams timestamped with zero clock skew.',
        defaultConfigKey: 'modality_clock',
        codeSnippet: `// Step 1: Multimodal Sensor Synchronizer
sensor_manifest = {
  "clock_hz": 1000,
  "streams": [
    "camera_rgb", "metric_depth_z", "semantic_segmentation",
    "ground_truth_pose_6d", "optical_flow_dense", "wrist_ft_wrench_6d",
    "gelsight_tactile_elastomer", "joint_encoder_telemetry", "neuromorphic_dvs_events"
  ]
}`
      },
      {
        stepNumber: 2,
        title: 'Export to Hugging Face LeRobot / RLDS Format',
        instruction: 'Package simulated trajectories into standard HDF5 episodes with observation groups and action chunks.',
        hint: 'LeRobot format allows direct plug-and-play training with OpenVLA and Diffusion Policy models.',
        verificationRule: 'Verify HDF5 schema compliance and action trajectory integrity.',
        defaultConfigKey: 'lerobot_export',
        codeSnippet: `// Step 2: LeRobot Dataset HDF5 Packager
import h5py
with h5py.File("aigenesis_synthetic_ep001.hdf5", "w") as f:
  obs = f.create_group("observations")
  obs.create_dataset("qpos", data=joint_positions)
  obs.create_dataset("wrist_wrench_6d", data=measured_wrenches)
  f.create_dataset("action", data=expert_actions_1khz)`
      }
    ]
  },
  {
    id: 'tut-surgical-rcm',
    title: 'Surgical Robotics V&V: Remote-Centre-of-Motion & FDA DHF',
    domain: 'medical',
    domainLabel: 'Surgical Robotics',
    difficulty: 'advanced',
    difficultyLabel: 'Production',
    estMinutes: 14,
    summary: 'Verify robotic laparoscopic instruments against rigorous clinical standards. Audit Remote-Centre-of-Motion (RCM) pivot deviation (<= 0.50mm), trocar collision zones, and generate FDA 21 CFR 820.30 DHF reports.',
    outcomes: [
      'Enforce kinematic RCM fulcrum constraints to prevent patient abdominal wall tear',
      'Model viscoelastic soft-tissue contact mechanics with explicit puncture thresholds',
      'Export cryptographically sealed Design History File (DHF) verification dossiers'
    ],
    targetTab: 'surgical-vv',
    tabLabel: 'Open Surgical Robotics Studio',
    icon: Stethoscope,
    interactiveParam: {
      label: 'RCM Fulcrum Tolerance',
      unit: 'mm allowable pivot',
      min: 0.1,
      max: 1.5,
      step: 0.05,
      initialValue: 0.45,
      optimalRange: [0.2, 0.5],
      explanation: 'Surgical safety guidelines (IEC 80601-2-77) mandate maximum trocar fulcrum deviation <= 0.50 mm during all tool maneuvers.'
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Constrain Kinematic Fulcrum Invariant',
        instruction: 'Project joint commands onto the nullspace of the abdominal trocar point to guarantee zero lateral displacement.',
        hint: 'The instrument shaft must only translate and rotate through the fixed entry incision.',
        verificationRule: 'Fulcrum lateral deviation remains under 0.50 mm throughout suturing trajectory.',
        defaultConfigKey: 'rcm_nullspace',
        codeSnippet: `// Step 1: Nullspace RCM Kinematic Constraint
Eigen::Vector3d p_trocar = get_trocar_world_position();
Eigen::Vector3d shaft_axis = get_shaft_direction_vector();
Eigen::Vector3d lateral_displacement = (tool_position - p_trocar) - 
  ((tool_position - p_trocar).dot(shaft_axis)) * shaft_axis;
assert(lateral_displacement.norm() <= 0.0005); // 0.50 mm safety bound`
      },
      {
        stepNumber: 2,
        title: 'Generate ISO 14971 Risk Mitigation Dossier',
        instruction: 'Link Design Input Requirements (DIR) to Design Output Verifications (DOV) with SHA-256 evidence seals.',
        hint: 'Audit-ready traceability is required for FDA 510(k) and CE MDR submissions.',
        verificationRule: 'All hazards mapped to verifiable test execution artifacts.',
        defaultConfigKey: 'dhf_audit',
        codeSnippet: `// Step 2: DHF Traceability Record
{
  "hazard_id": "HAZ-102",
  "requirement": "DIR-042: Trocar incision force <= 4.5 N",
  "verification": "DOV-019: Peak simulated force 3.12 N (PASS)",
  "sha256_evidence_seal": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}`
      }
    ]
  },
  {
    id: 'tut-behaviortree',
    title: 'Autonomous Decision Graphs with BehaviorTree.CPP v4',
    domain: 'industrial',
    domainLabel: 'Industrial Cobots',
    difficulty: 'intermediate',
    difficultyLabel: 'Intermediate',
    estMinutes: 9,
    summary: 'Build fault-tolerant autonomous mission logic. Configure reactive fallbacks, battery condition gates, and spin-recovery nodes with direct ROS 2 Nav2 BT Navigator XML export.',
    outcomes: [
      'Construct reactive sequence and fallback control flow nodes',
      'Simulate failure injection and spin-recovery behaviors in real time',
      'Generate production BehaviorTree.CPP v4 XML and C++ StatefulActionNode templates'
    ],
    targetTab: 'bt',
    tabLabel: 'Open Behavior Tree Studio',
    icon: GitFork,
    interactiveParam: {
      label: 'Tree Tick Frequency',
      unit: 'Hz',
      min: 10,
      max: 100,
      step: 5,
      initialValue: 20,
      optimalRange: [20, 50],
      explanation: '20 Hz provides sub-50ms reactive fallback response while minimizing CPU scheduling overhead.'
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Define Reactive Fallback with Recovery Node',
        instruction: 'Create a primary action sequence with a fallback to obstacle spin recovery if an obstruction is flagged.',
        hint: 'Fallback nodes execute the next child immediately if the current child returns FAILURE.',
        verificationRule: 'Tree returns RUNNING during maneuver and SUCCESS upon payload placement.',
        defaultConfigKey: 'bt_fallback',
        codeSnippet: `<!-- Step 1: BehaviorTree.CPP v4 XML Definition -->
<root BTCPP_format="4">
  <BehaviorTree ID="AutonomousPickAndDeliver">
    <Fallback name="PrimaryOrRecovery">
      <Sequence name="NominalMission">
        <CheckBatteryLevel min_charge="20%"/>
        <NavigateToPose target="Station_A"/>
        <GraspWorkpiece grip_force="45N"/>
        <NavigateToPose target="Station_B"/>
      </Sequence>
      <RecoveryNode number_of_retries="2">
        <ClearCostmapAroundRobot radius="1.2m"/>
        <SpinRecovery angle="180deg"/>
      </RecoveryNode>
    </Fallback>
  </BehaviorTree>
</root>`
      }
    ]
  }
];

const PROJECTS: ProjectBlueprint[] = [
  {
    id: 'proj-warehouse-cell',
    name: 'High-Speed Logistics Cobot Workcell',
    domain: 'industrial',
    domainLabel: 'Industrial Cobots',
    robotPlatform: 'Universal Robots UR10e + Robotiq 2F-85',
    controlFrequency: '1000 Hz Closed-Loop',
    headline: 'High-Velocity Bin Picking with GelSight Optical Tactile Micro-Slip Recovery',
    description: 'A production-grade workcell blueprint designed for industrial fulfillment centers. Incorporates 6-DOF MoveIt 2 Cartesian trajectory planning, sub-3ms optical tactile slip recovery, and Latin Hypercube randomized workpiece picking.',
    keySpecs: [
      { label: 'Cycle Time', value: '0.42 sec / pick' },
      { label: 'Payload Capacity', value: '12.5 kg' },
      { label: 'Tactile Reflex Latency', value: '< 3.2 ms' },
      { label: 'Friction Cone Margin', value: 'μ = 0.18 - 0.75' }
    ],
    stackComponents: ['MoveIt 2 Servo', 'GelSight Tactile Array', 'ros2_control EtherCAT', 'OpenVLA Teacher'],
    targetTab: 'teleop',
    tabLabel: 'Launch UR10e Workcell',
    icon: Cpu,
    launchCommand: 'ros2 launch aigenesis_ur10e_workcell bin_picking.launch.py',
    rosPackageName: 'aigenesis_ur10e_workcell'
  },
  {
    id: 'proj-amr-fleet',
    name: 'Autonomous Mobile Robot (AMR) Logistics Fleet',
    domain: 'mobile',
    domainLabel: 'Autonomous Mobile',
    robotPlatform: 'Clearpath Jackal / Husky Differential Drive',
    controlFrequency: '50 Hz Nav2 / 20 Hz SLAM',
    headline: 'Multi-Agent Warehouse Swarm with 3D LiDAR & Nav2 BT Navigator',
    description: 'Complete multi-agent autonomous logistics blueprint. Employs 360° LiDAR raycasting, graph-based Ceres loop closures, dynamic obstacle costmap inflation, and decentralized multi-robot fleet routing.',
    keySpecs: [
      { label: 'Max Traverse Speed', value: '2.4 m/s' },
      { label: 'Pose Estimation Error', value: '< 4.2 mm' },
      { label: 'Costmap Resolution', value: '0.05 m/cell' },
      { label: 'Fleet Capacity', value: 'Up to 32 agents' }
    ],
    stackComponents: ['Nav2 BT Navigator', 'Ceres Graph SLAM', 'Cartographer 3D', 'FastDDS Discovery'],
    targetTab: 'slam',
    tabLabel: 'Launch AMR SLAM Studio',
    icon: Compass,
    launchCommand: 'ros2 launch aigenesis_amr_fleet nav2_swarm_bringup.launch.py',
    rosPackageName: 'aigenesis_amr_fleet'
  },
  {
    id: 'proj-surgical-endowrist',
    name: '7-DOF Cable-Driven Laparoscopic Articulator',
    domain: 'medical',
    domainLabel: 'Surgical Robotics',
    robotPlatform: 'EndoWrist 7-DOF Minimally Invasive Manipulator',
    controlFrequency: '1000 Hz Haptic & Kinematics',
    headline: 'Sub-Millimeter Tremor-Suppressed Vascular Suture with FDA DHF Dossier',
    description: 'Class C medical device software blueprint adhering to IEC 62304 and ISO 14971. Features fulcrum Remote-Centre-of-Motion kinematic locks, viscoelastic soft-tissue deformation models, and automated FDA 21 CFR 820.30 traceability matrices.',
    keySpecs: [
      { label: 'RCM Fulcrum Deviation', value: '< 0.38 mm' },
      { label: 'Tremor Filter Cutoff', value: '6.5 Hz Butterworth' },
      { label: 'Tissue Contact Fidelity', value: '45 kPa Soft Tissue' },
      { label: 'Audit Trail Seal', value: 'SHA-256 Cryptographic' }
    ],
    stackComponents: ['IEC 62304 Class C Arch', 'RCM Nullspace Lock', 'DHF Traceability Engine', 'Tissue Puncture FEA'],
    targetTab: 'surgical-vv',
    tabLabel: 'Launch Surgical V&V Studio',
    icon: Stethoscope,
    launchCommand: 'ros2 launch aigenesis_surgical_rams laparoscopic_rcm.launch.py',
    rosPackageName: 'aigenesis_surgical_rams'
  },
  {
    id: 'proj-coanda-uav',
    name: 'Coandă Fluidic Thrust-Vectoring Aerospace Twin',
    domain: 'aerospace_defence',
    domainLabel: 'Aerospace & Defence',
    robotPlatform: 'Inconel-718 Active Bleed Coandă Nozzle',
    controlFrequency: '1000 Hz Pneumatic Valve Loop',
    headline: 'Maneuvering UAV Jet Without Mechanical Flaps via 350 Hz Bleed Air Modulation',
    description: 'Fluidic thrust-vectoring digital twin. Pre-machining CAD-to-CFD aerodynamics sweep engine modeling boundary-layer snap detachment, crosswind stall recovery, and 22° pitch deflection without mechanical wear.',
    keySpecs: [
      { label: 'Deflection Angle', value: '22.0° Vector' },
      { label: 'Valve Cycle Frequency', value: '350 Hz Pneumatic' },
      { label: 'Crosswind Resilience', value: '52 knots (tested)' },
      { label: 'Response Transient', value: '8.4 ms recovery' }
    ],
    stackComponents: ['Navier-Stokes CFD Twin', '350 Hz High-Speed Solenoid', 'Boundary Layer Governor', 'MIL-STD-810H'],
    targetTab: 'coanda',
    tabLabel: 'Launch Coandă Jet Studio',
    icon: Activity,
    launchCommand: 'ros2 launch aigenesis_coanda_aero fluidic_thrust_twin.launch.py',
    rosPackageName: 'aigenesis_coanda_aero'
  },
  {
    id: 'proj-defense-contested',
    name: 'Contested Environment Autonomous Ground Rover',
    domain: 'aerospace_defence',
    domainLabel: 'Aerospace & Defence',
    robotPlatform: 'MIL-STD Extreme All-Terrain UGV',
    controlFrequency: '1000 Hz Safe-State Gate',
    headline: 'GPS-Denied Visual-Inertial Navigation under Spot Jamming & Dust Occlusion',
    description: 'Defense robotics assurance pack for missions in electronic-warfare environments. Implements tightly-coupled VIO with thermal-inertial fusion, spoofing detection, sub-20ms fail-safe abort logic, and strict air-gapped on-premise security.',
    keySpecs: [
      { label: 'GPS Jamming Tolerance', value: '100% Denied Comms' },
      { label: 'Fail-Safe Abort Time', value: '< 18.5 ms' },
      { label: 'Vibration Standard', value: 'MIL-STD-810H Method 514' },
      { label: 'Deployment Mode', value: '100% Air-Gapped SCIF' }
    ],
    stackComponents: ['VIO Sensor Fusion', 'Spot Jamming Detector', 'Sub-20ms Safe State', 'Airgap Immutable Audit'],
    targetTab: 'defense-pack',
    tabLabel: 'Launch Defence Assurance Studio',
    icon: Shield,
    launchCommand: 'ros2 launch aigenesis_defense_assurance contested_mission.launch.py',
    rosPackageName: 'aigenesis_defense_assurance'
  },
  {
    id: 'proj-synthetic-vla-pipeline',
    name: 'Foundation Model & VLA Multimodal Training Pipeline',
    domain: 'foundations',
    domainLabel: 'Perceptual AI',
    robotPlatform: 'Universal Multi-Arm & Mobile Base Fleet',
    controlFrequency: '1000 Hz Physics / 30 Hz Vision',
    headline: 'High-Throughput Synthetic Data Factory for OpenVLA, Octo & ACT Distillation',
    description: 'Scalable pipeline extracting 9 synchronized annotation streams from single simulation runs. Features Latin Hypercube domain randomization, Sim-to-Real gap checklists, and 1-click dataset export to Hugging Face LeRobot and NVIDIA Isaac Lab.',
    keySpecs: [
      { label: 'Synchronized Streams', value: '9 Modalities' },
      { label: 'Clock Skew', value: '0.00 μs (hardware synchronized)' },
      { label: 'Export Stack', value: 'LeRobot HDF5 / Isaac Lab' },
      { label: 'Domain Variations', value: '7 Physical Parameters' }
    ],
    stackComponents: ['Latin Hypercube Sampler', 'Event DVS Synthesizer', 'Sim-to-Real Checklist', 'LeRobot Exporter'],
    targetTab: 'synthetic-data',
    tabLabel: 'Launch Synthetic Data Studio',
    icon: Database,
    launchCommand: 'python3 -m aigenesis_pipeline.generate_lerobot_dataset --episodes 10000',
    rosPackageName: 'aigenesis_synthetic_pipeline'
  }
];

const PLATFORM_TOOLS: PlatformToolShowcase[] = [
  {
    id: 'tool-sim-5layer',
    title: '5-Layer Physical AI Multi-Physics Engine',
    category: 'Core Multi-Physics & Invariants',
    targetTab: 'simulator',
    icon: Cpu,
    oneLiner: '1000 Hz physics simulation linking System 2 reasoning to sub-millisecond motor torque vectors.',
    description: 'Bridges high-level natural language intent with perception fusion, 3D world modeling, hazard prevention invariants, and closed-loop motor torque actuation.',
    capabilities: [
      '1000 Hz closed-loop physics update cycle',
      'Multimodal sensor fusion (optical, LiDAR, acoustic, tactile)',
      'System 2 Chain-of-Thought safety invariants',
      'Real-time joint velocity and torque limit clamping'
    ],
    supportedStandards: ['ROS 2 Humble', 'NVIDIA Isaac Sim 4.2+', 'ISO 10218-1/2', 'EtherCAT'],
    outputArtifacts: ['rclpy nodes', 'C++ trajectory actions', 'URDF spatial geometry', 'physics telemetry logs']
  },
  {
    id: 'tool-slam',
    title: 'SLAM & Occupancy Grid Studio',
    category: 'State Estimation & Navigation',
    targetTab: 'slam',
    icon: Compass,
    oneLiner: '360° LiDAR raycasting, Bresenham occupancy grid mapping, and Ceres loop closure optimizer.',
    description: 'Interactive SLAM simulation suite. Models wheel slip odometry drift, correlative scan matching, Ceres non-linear least-squares optimization, and Nav2 costmap parameter synthesis.',
    capabilities: [
      '64-beam 360° LiDAR raycasting simulation',
      'Bresenham 2D/3D occupancy grid updates',
      'Ceres Sparse Normal Cholesky pose graph solver',
      'Odometry drift vs ground-truth error metrics'
    ],
    supportedStandards: ['ROS 2 Nav2', 'slam_toolbox', 'Cartographer', 'ORB-SLAM3'],
    outputArtifacts: ['slam_toolbox_params.yaml', 'nav2_bringup_slam.launch.py', 'occupancy_grid.pgm']
  },
  {
    id: 'tool-pid',
    title: 'PID Control & Step-Response Studio',
    category: 'Closed-Loop Actuation',
    targetTab: 'pid',
    icon: Sliders,
    oneLiner: 'Real-time oscilloscope, anti-windup clamping, and Ziegler-Nichols auto-tuning presets.',
    description: 'High-frequency closed-loop PID tuning environment for robotic joints, drone thrust, and motor velocity with disturbance rejection and actuator saturation protection.',
    capabilities: [
      '1000 Hz step-response oscilloscope with live setpoint tracking',
      'Individual P, I, D torque decomposition telemetry',
      'Integrator anti-windup conditional clamping',
      'Ziegler-Nichols & critically damped auto-tuning presets'
    ],
    supportedStandards: ['ros2_control', 'CANopen DS402', 'EtherCAT CoE', 'POSIX RT PREEMPT'],
    outputArtifacts: ['pid_controller_config.yaml', 'anti_windup_pid.hpp', 'step_response_telemetry.json']
  },
  {
    id: 'tool-ik',
    title: 'Inverse Kinematics & MoveIt 2 Studio',
    category: 'Manipulators & Arm Planning',
    targetTab: 'ik',
    icon: Target,
    oneLiner: '6-DOF Cartesian solver with MoveIt 2 DLS damping and singularity avoidance.',
    description: 'Interactive end-effector target solver. Calculates Jacobian condition numbers, applies Levenberg-Marquardt damping to eliminate velocity runaway near gimbal lock, and synthesizes MoveGroup action code.',
    capabilities: [
      'Interactive 3D draggable end-effector target reticle',
      'Jacobian condition number (κ) & determinant monitoring',
      'Adaptive Damped Least-Squares (DLS) velocity clamping',
      'Cartesian spline and inspection arc trajectory generator'
    ],
    supportedStandards: ['MoveIt 2', 'MoveGroup C++', 'KDL Kinematics', 'URDF 1.0'],
    outputArtifacts: ['kinematics.yaml', 'moveit_trajectory_node.cpp', 'joint_limits.yaml']
  },
  {
    id: 'tool-bt',
    title: 'Behavior Tree (BT.CPP) Mission Studio',
    category: 'Autonomous Decision Engine',
    targetTab: 'bt',
    icon: GitFork,
    oneLiner: 'Visual tree ticking simulation with reactive fallbacks and spin-recovery behaviors.',
    description: 'Execution graph engine for autonomous robotics missions. Model complex mission sequences, fallback branches, battery gates, and obstacle spin-recovery behaviors with BehaviorTree.CPP v4 export.',
    capabilities: [
      'Real-time tree ticking visualization (Success / Running / Failure)',
      'Fault injection and obstacle spin-recovery branch execution',
      'Blackboard variable inspection and condition gates',
      'Sub-50ms reactive fallback decision latency'
    ],
    supportedStandards: ['BehaviorTree.CPP v4', 'Nav2 BT Navigator', 'ROS 2 Actions'],
    outputArtifacts: ['mission_tree.xml', 'custom_action_nodes.hpp', 'nav2_bt_navigator.yaml']
  },
  {
    id: 'tool-synthetic-data',
    title: 'Simulation-to-Synthetic-Data Pipeline Studio',
    category: 'Foundation Model & VLA Training Engine',
    targetTab: 'synthetic-data',
    icon: Database,
    oneLiner: 'Extract 9 synchronized modalities from a single run with Latin Hypercube randomization.',
    description: 'Converts multi-physics simulation rollouts into production ML training datasets with zero spatial or temporal sensor drift. Features 7-parameter domain randomization and a Sim-to-Real gap checklist.',
    capabilities: [
      '9 synchronized streams: RGB, depth, segmentation, 6D pose, flow, wrench, tactile, encoders, DVS',
      'Latin Hypercube domain randomization across mass, friction, lighting, blur',
      'Sim-to-Real gap checklist based on simulation vs hardware variances',
      '1-Click dataset export to Hugging Face LeRobot and Isaac Lab'
    ],
    supportedStandards: ['LeRobot HDF5', 'RLDS Format', 'NVIDIA Isaac Lab', 'OpenVLA / Octo'],
    outputArtifacts: ['dataset_manifest.json', 'generate_lerobot_dataset.py', 'sim2real_checklist.md']
  },
  {
    id: 'tool-surgical-vv',
    title: 'Surgical Robotics V&V Pack',
    category: 'High-Assurance Medical RAMS',
    targetTab: 'surgical-vv',
    icon: Stethoscope,
    oneLiner: 'Remote-Centre-of-Motion (RCM) audit, soft-tissue puncture, and FDA DHF traceability.',
    description: 'Medical robotics verification suite. Validates trocar fulcrum deviation (<= 0.50mm), instrument collision envelopes, tissue contact uncertainty, and compiles audit-ready Design History File (DHF) dossiers.',
    capabilities: [
      'Kinematic RCM fulcrum constraint auditing (<= 0.50 mm)',
      'Viscoelastic soft-tissue contact mechanics with puncture thresholds',
      '6 clinical procedure templates (camera navigation, suturing, knot-tying)',
      'Cryptographically sealed SHA-256 DHF evidence matrix export'
    ],
    supportedStandards: ['IEC 62304 Class C', 'ISO 14971 Risk', 'FDA 21 CFR 820.30', 'IEC 80601-2-77'],
    outputArtifacts: ['surgical_dhf_dossier.json', 'rcm_fulcrum_audit.csv', 'fda_510k_trace_matrix.md']
  },
  {
    id: 'tool-defense-assurance',
    title: 'Defence Robotics Assurance Pack',
    category: 'Contested Autonomy & EW',
    targetTab: 'defense-pack',
    icon: Shield,
    oneLiner: 'GPS-denied visual-inertial navigation, RF jamming resilience, and sub-20ms safe-state aborts.',
    description: 'Military-grade robotics verification platform for contested electronic-warfare environments. Tests spot jamming, dust/thermal occlusions, MIL-STD vibration, and strict air-gapped on-premise execution.',
    capabilities: [
      'GPS-denied tightly coupled Visual-Inertial Odometry (VIO)',
      'Sensor spoofing, RF jamming, and packet loss resilience testing',
      'Sub-20ms autonomous fail-safe abort and safe-state logic',
      'Immutable air-gapped cryptographic audit trail'
    ],
    supportedStandards: ['MIL-STD-810H Method 514', 'STANAG 4586', 'ISO 26262 ASIL-D', 'NIST SP 800-53'],
    outputArtifacts: ['defense_assurance_audit.json', 'safe_state_abort_node.cpp', 'mil_std_vibration_report.pdf']
  },
  {
    id: 'tool-data-flywheel',
    title: 'Autonomous Data Flywheel & Calibration Studio',
    category: 'Sim-to-Real Closed Loop',
    targetTab: 'flywheel',
    icon: RefreshCw,
    oneLiner: 'Continuously closes the sim-to-real gap by stress-testing, generating synthetic episodes, and recalibrating twins.',
    description: '4-stage continuous improvement loop: stress-tests policies in simulation, synthesizes multimodal datasets around failure boundaries, ingests hardware telemetry, and auto-calibrates digital twin physics.',
    capabilities: [
      '4-stage closed loop: Stress Test -> Synthesize Data -> Validate HiL -> Recalibrate',
      'Differentiable physics parameter tuning (friction, backlash, delay)',
      'Edge case failure boundary isolation and LoRA policy distillation',
      'Sim-to-Real gap reduction from 18% down to < 2.5%'
    ],
    supportedStandards: ['Isaac Sim USD', 'URDF Differentiable', 'PyTorch / JAX', 'EtherCAT HiL'],
    outputArtifacts: ['twin_calibrated_physics.json', 'flywheel_manifest.json', 'policy_weights.onnx']
  },
  {
    id: 'tool-video-producer',
    title: 'Automated 3D Video Production Studio',
    category: 'Video & Simulation Demos',
    targetTab: 'video-producer',
    icon: Film,
    oneLiner: 'Zero-video-skill engine generating 60 FPS 3D simulation videos with narration and 1-click WebM download.',
    description: 'Produces professional high-impact 60 FPS simulation demonstration videos automatically. Includes 3D LiDAR SLAM, tactile slip recovery, fluidic Coandă stall, and surgical singularity fixes with subtitles and voiceover.',
    capabilities: [
      'Real-time 60 FPS canvas rendering with 3D isometric perspectives',
      'Synchronized speech synthesis voiceover and burned-in subtitles',
      'Live diagnostic telemetry HUD and timeline progress scrubbers',
      '1-Click browser-native WebM video recording and download'
    ],
    supportedStandards: ['HTML5 WebM VP9', 'MediaRecorder API', 'Web Speech API', '16:9 Landscape HD'],
    outputArtifacts: ['simulation_demo.webm', 'social_media_post.txt', 'university_outreach_email.txt']
  }
];

interface TutorialsAndShowcaseStudioProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenProTrial?: () => void;
}

export const TutorialsAndShowcaseStudio: React.FC<TutorialsAndShowcaseStudioProps> = ({
  onNavigateTab,
  onOpenProTrial
}) => {
  const [activeMode, setActiveMode] = useState<ShowcaseMode>('tutorials');
  const [selectedDomain, setSelectedDomain] = useState<DomainCategory>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Interactive Tutorial Workbench State
  const [activeTutorialId, setActiveTutorialId] = useState<string>(TUTORIALS[0].id);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [interactiveParamVal, setInteractiveParamVal] = useState<number>(TUTORIALS[0].interactiveParam.initialValue);
  const [isStepVerified, setIsStepVerified] = useState<boolean>(false);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const activeTutorial = TUTORIALS.find(t => t.id === activeTutorialId) || TUTORIALS[0];
  const activeStep = activeTutorial.steps[activeStepIndex] || activeTutorial.steps[0];

  // Filtering Logic
  const filteredTutorials = TUTORIALS.filter(t => {
    const matchesDomain = selectedDomain === 'all' || t.domain === selectedDomain;
    const matchesDifficulty = selectedDifficulty === 'all' || t.difficulty === selectedDifficulty;
    const matchesSearch = searchQuery === '' || 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.domainLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesDifficulty && matchesSearch;
  });

  const filteredProjects = PROJECTS.filter(p => {
    const matchesDomain = selectedDomain === 'all' || p.domain === selectedDomain;
    const matchesSearch = searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.robotPlatform.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.stackComponents.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDomain && matchesSearch;
  });

  const filteredTools = PLATFORM_TOOLS.filter(tool => {
    const matchesSearch = searchQuery === '' ||
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.oneLiner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.capabilities.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tool.supportedStandards.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(cmd);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const handleVerifyStep = () => {
    setIsStepVerified(true);
  };

  const handleSelectTutorial = (tut: InteractiveTutorial) => {
    setActiveTutorialId(tut.id);
    setActiveStepIndex(0);
    setInteractiveParamVal(tut.interactiveParam.initialValue);
    setIsStepVerified(false);
  };

  // Check if current interactive param is within optimal bounds
  const isOptimal = interactiveParamVal >= activeTutorial.interactiveParam.optimalRange[0] &&
                    interactiveParamVal <= activeTutorial.interactiveParam.optimalRange[1];

  return (
    <div className="space-y-8 animate-fadeIn font-mono pb-20">
      {/* Studio Header Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-400">
            <span>KNOWLEDGE HUB & PLATFORM DIRECTORY</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Interactive Hands-On Labs</span>
            <span aria-hidden="true">·</span>
            <span className="text-purple-400">Production Project Library</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400">Tool Showcase</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Hands-On Tutorials, Project Library & Tool Showcase
          </h2>
          <p className="text-sm text-slate-400 font-sans leading-relaxed">
            Accelerate your physical AI robotics development. Work through step-by-step interactive labs with live parameter experimentation, clone production robotics project blueprints, or explore the complete suite of 18+ verification studios.
          </p>
        </div>

        {/* Mode Selector Segmented Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 pt-6 border-t border-slate-800/80">
          <button
            onClick={() => setActiveMode('tutorials')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeMode === 'tutorials'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Interactive Hands-On Tutorials</span>
            <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-slate-900/60 text-current">
              {TUTORIALS.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMode('projects')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeMode === 'projects'
                ? 'bg-purple-500 text-slate-950 shadow-lg shadow-purple-500/20'
                : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Production Project Library</span>
            <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-slate-900/60 text-current">
              {PROJECTS.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMode('tools')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeMode === 'tools'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Tool & Product Showcase</span>
            <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-slate-900/60 text-current">
              {PLATFORM_TOOLS.length}
            </span>
          </button>
        </div>
      </div>

      {/* Search and Domain Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tutorials, projects, robot models, ROS 2 topics, standards..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-mono"
          />
        </div>

        {/* Domain Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-500 text-[11px] mr-1 hidden lg:inline">Domain:</span>
          {(['all', 'industrial', 'mobile', 'medical', 'aerospace_defence', 'foundations'] as DomainCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedDomain(cat)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                selectedDomain === cat
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-950'
              }`}
            >
              {cat === 'all' ? 'All Domains' :
               cat === 'industrial' ? 'Cobots' :
               cat === 'mobile' ? 'Mobile' :
               cat === 'medical' ? 'Medical' :
               cat === 'aerospace_defence' ? 'Aerospace' : 'Perception'}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: HANDS-ON INTERACTIVE TUTORIALS WORKBENCH                          */}
      {/* ========================================================================= */}
      {activeMode === 'tutorials' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Tutorial Catalog List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Available Tutorials ({filteredTutorials.length})
              </span>
              <span className="text-[11px] text-slate-500">
                Click any lab to load interactive workbench
              </span>
            </div>

            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {filteredTutorials.map((tut) => {
                const isSelected = tut.id === activeTutorial.id;
                const IconComponent = tut.icon;
                return (
                  <div
                    key={tut.id}
                    onClick={() => handleSelectTutorial(tut)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-slate-950 border-cyan-500 shadow-xl shadow-cyan-500/10'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-semibold">{tut.domainLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-400">{tut.difficultyLabel}</span>
                      </div>
                      <span>{tut.estMinutes} min lab</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                          {tut.title}
                        </h4>
                        <p className="text-xs text-slate-400 font-sans mt-1 line-clamp-2">
                          {tut.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Interactive Tutorial Workbench */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
            {/* Tutorial Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-cyan-400 font-bold">{activeTutorial.domainLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeTutorial.difficultyLabel} Level</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeTutorial.estMinutes} Minutes</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  {activeTutorial.title}
                </h3>
              </div>

              {/* Direct Jump to Studio CTA */}
              <button
                onClick={() => onNavigateTab(activeTutorial.targetTab)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer shrink-0"
                title="Launch this dedicated studio in full workspace"
              >
                <span>Launch Full Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Step {activeStepIndex + 1} of {activeTutorial.steps.length}</span>
                <span className="font-bold text-white">{activeStep.title}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {activeTutorial.steps.map((st, sIdx) => {
                  const isCurrent = sIdx === activeStepIndex;
                  const isDone = sIdx < activeStepIndex;
                  return (
                    <button
                      key={st.stepNumber}
                      onClick={() => {
                        setActiveStepIndex(sIdx);
                        setIsStepVerified(false);
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        isCurrent ? 'bg-cyan-400 shadow-sm shadow-cyan-400' :
                        isDone ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                      title={`Step ${sIdx + 1}: ${st.title}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Step Instructions Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase">
                  Instruction & Expected Invariant
                </span>
                <span className="text-[11px] text-slate-500">Checkpoint #{activeStep.stepNumber}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
                {activeStep.instruction}
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 font-sans flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-300">Engineering Hint:</strong> {activeStep.hint}</span>
              </div>
            </div>

            {/* Interactive Parameter Experimentation Slider */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-300 uppercase block">
                    Interactive Parameter Tuning
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Adjust the parameter below to observe physical stability response
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-base font-bold ${isOptimal ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {interactiveParamVal} {activeTutorial.interactiveParam.unit}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {isOptimal ? 'Optimal Range' : 'Sub-Optimal'}
                  </span>
                </div>
              </div>

              {/* Slider Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>{activeTutorial.interactiveParam.min} {activeTutorial.interactiveParam.unit}</span>
                  <span className="text-cyan-400 font-semibold">{activeTutorial.interactiveParam.label}</span>
                  <span>{activeTutorial.interactiveParam.max} {activeTutorial.interactiveParam.unit}</span>
                </div>
                <input
                  type="range"
                  min={activeTutorial.interactiveParam.min}
                  max={activeTutorial.interactiveParam.max}
                  step={activeTutorial.interactiveParam.step}
                  value={interactiveParamVal}
                  onChange={(e) => {
                    setInteractiveParamVal(parseFloat(e.target.value));
                    setIsStepVerified(false);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                />
              </div>

              <p className="text-xs text-slate-400 font-sans">
                {activeTutorial.interactiveParam.explanation}
              </p>

              {/* Step Verification Button & Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-900">
                <div className="flex items-center gap-2 text-xs">
                  {isStepVerified ? (
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Invariant Verified: Pass (Optimal Stability)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <span>Ready to test physical invariants</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleVerifyStep}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-slate-700 transition cursor-pointer"
                >
                  Verify Step Invariant
                </button>
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Production Firmware & ROS 2 Snippet
                </span>
                <button
                  onClick={() => handleCopyCode(activeStep.codeSnippet)}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                >
                  {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSnippet ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 max-h-56 overflow-y-auto">
                <pre className="text-[11px] leading-relaxed">
                  {activeStep.codeSnippet}
                </pre>
              </div>
            </div>

            {/* Next / Previous Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                disabled={activeStepIndex === 0}
                onClick={() => {
                  setActiveStepIndex(p => Math.max(0, p - 1));
                  setIsStepVerified(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous Step
              </button>

              {activeStepIndex < activeTutorial.steps.length - 1 ? (
                <button
                  onClick={() => {
                    setActiveStepIndex(p => p + 1);
                    setIsStepVerified(false);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => onNavigateTab(activeTutorial.targetTab)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Complete Lab & Open Studio</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: PRODUCTION PROJECT LIBRARY                                        */}
      {/* ========================================================================= */}
      {activeMode === 'projects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Production Robotics Blueprints ({filteredProjects.length})
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Ready-to-clone robotics projects with kinematic configurations, launch scripts, and verifiable performance gates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((proj) => {
              const IconComp = proj.icon;
              return (
                <div
                  key={proj.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400 font-bold">{proj.domainLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-400">{proj.controlFrequency}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-snug">
                          {proj.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                          {proj.robotPlatform}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {proj.description}
                    </p>

                    {/* Key Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                      {proj.keySpecs.map((spec, spIdx) => (
                        <div key={spIdx} className="p-2 rounded-xl bg-slate-950 border border-slate-800/60">
                          <span className="text-[10px] text-slate-500 block">{spec.label}</span>
                          <span className="text-xs font-bold text-slate-200 mt-0.5 block">{spec.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Stack Components Tags */}
                    <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] text-slate-400 font-mono">
                      {proj.stackComponents.map((comp, cIdx) => (
                        <span key={cIdx} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Launch Command */}
                  <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
                    {/* Launch command snippet */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono">
                      <span className="truncate max-w-[200px]" title={proj.launchCommand}>
                        {proj.launchCommand}
                      </span>
                      <button
                        onClick={() => handleCopyCommand(proj.launchCommand)}
                        className="text-purple-400 hover:text-purple-300 shrink-0 ml-2 cursor-pointer"
                        title="Copy launch command"
                      >
                        {copiedCommand === proj.launchCommand ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      onClick={() => onNavigateTab(proj.targetTab)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
                    >
                      <span>{proj.tabLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: TOOL & PRODUCT SHOWCASE                                           */}
      {/* ========================================================================= */}
      {activeMode === 'tools' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Platform Studio & Tool Matrix ({filteredTools.length})
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Complete directory of all 18+ physical AI verification, simulation, and synthesis tools available in AIGENESIS.TECH.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTools.map((tool) => {
              const ToolIcon = tool.icon;
              return (
                <div
                  key={tool.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-4 hover:border-slate-700 transition shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="text-emerald-400 font-bold">{tool.category}</span>
                      <button
                        onClick={() => onNavigateTab(tool.targetTab)}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold text-xs cursor-pointer"
                      >
                        <span>Open Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                        <ToolIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white leading-snug">
                          {tool.title}
                        </h4>
                        <p className="text-xs text-slate-300 font-sans mt-0.5">
                          {tool.oneLiner}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      {tool.description}
                    </p>

                    {/* Capabilities list */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Core Engine Capabilities:
                      </span>
                      <ul className="space-y-1">
                        {tool.capabilities.map((cap, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-2 text-xs text-slate-300 font-sans">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{cap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Supported Standards */}
                    <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                      <span className="text-slate-500 mr-1">Standards:</span>
                      {tool.supportedStandards.map((std, sIdx) => (
                        <span key={sIdx} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
                          {std}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Launch button */}
                  <div className="pt-4 border-t border-slate-800/80">
                    <button
                      onClick={() => onNavigateTab(tool.targetTab)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Launch {tool.title}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trial Reassurance Banner at bottom */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-purple-950/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">
            Need custom tutorial scenarios or proprietary CAD models integrated?
          </h4>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Evaluate all 18+ studios and project blueprints risk-free with our 14-day Pro Research Trial.
          </p>
        </div>
        {onOpenProTrial && (
          <button
            onClick={onOpenProTrial}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer shrink-0"
          >
            Start 14-Day Free Trial
          </button>
        )}
      </div>
    </div>
  );
};
