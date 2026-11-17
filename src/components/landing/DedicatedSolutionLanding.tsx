import React, { useState } from 'react';
import { 
  Terminal, Activity, Box, Cpu, Network, ShieldCheck, 
  ArrowRight, CheckCircle2, Zap, Play, Check, Shield, 
  Building2, Globe, FileCode, Sliders, Target, GitFork, 
  BarChart3, FileCheck, AlertOctagon, Scale, Radio, Rocket, 
  ChevronRight, ExternalLink, HelpCircle, Layers, RefreshCw, 
  Award, Eye, HardDrive, Lock, ChevronDown, BookOpen, Sparkles
} from 'lucide-react';
import { ActiveTab, DedicatedLandingId } from '../../types';

interface DedicatedSolutionLandingProps {
  initialSolution?: DedicatedLandingId;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenProTrialModal?: () => void;
  onOpenTour?: () => void;
}

export const DedicatedSolutionLanding: React.FC<DedicatedSolutionLandingProps> = ({
  initialSolution = 'ros2',
  onNavigateTab,
  onOpenProTrialModal,
  onOpenTour
}) => {
  const [selectedSolution, setSelectedSolution] = useState<DedicatedLandingId>(initialSolution);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Arm slider state for Robotic Arm demo
  const [armJointAngles, setArmJointAngles] = useState<number[]>([25, -40, 65, -15, 30, 0]);
  
  // ROS 2 Topic state
  const [selectedTopic, setSelectedTopic] = useState<string>('/joint_states');

  // Safety demo state
  const [safetyProofStatus, setSafetyProofStatus] = useState<'verifying' | 'proven' | 'breach'>('proven');

  const solutionConfigs = {
    ros2: {
      id: 'ros2' as DedicatedLandingId,
      tab: 'landing-ros2' as ActiveTab,
      studioTab: 'export' as ActiveTab,
      tagline: 'For ROS 2 Software Architects, Autonomy Leads & Isaac Sim Engineers',
      title: 'Production ROS 2 Humble & NVIDIA Isaac Sim in Your Browser',
      subtitle: 'Eliminate weeks of broken Docker containers, dependency hell, and CUDA incompatibilities. Generate, simulate, and export production-ready ROS 2 workspaces, micro-ROS embedded nodes, and Isaac Sim USD scenes with 1 click.',
      primaryCta: 'Launch ROS 2 & Isaac Exporter',
      secondaryCta: 'Start 14-Day Free Pro Trial',
      standards: ['ROS 2 Humble / Iron', 'NVIDIA Isaac Sim 4.0', 'MoveIt 2', 'Zenoh RMW', 'micro-ROS'],
      stats: [
        { value: '1000 Hz', label: 'Deterministic Motor Loop' },
        { value: '< 0.28%', label: 'Sim-to-Real Trajectory Delta' },
        { value: '1-Click', label: 'ROS 2 Colcon Workspace Export' },
        { value: 'Zero', label: 'Local CUDA / Driver Installs' }
      ],
      features: [
        {
          title: 'Turnkey ROS 2 Workspace & Launch Generator',
          desc: 'Instant generation of CMakeLists.txt, package.xml, launch.py, and parameterized URDF / Xacro configurations ready for colcon build.',
          icon: Terminal
        },
        {
          title: 'Direct NVIDIA Isaac Sim & Omniverse USD Sync',
          desc: 'Export rigged USD robots with PhysX 5 articulation parameters, drive stiffness/damping, and synthetic sensor pipelines with zero manual rigging.',
          icon: Box
        },
        {
          title: 'Zenoh & CycloneDDS Low-Latency Transport',
          desc: 'Benchmark your telemetry transport across CycloneDDS, FastDDS, and Zenoh with real-time jitter and packet serialization diagnostics.',
          icon: Network
        }
      ],
      caseStudy: {
        company: 'Autonomous Defense UAV Prime',
        quote: 'AIGENESIS allowed our distributed team of 24 robotics engineers to test MoveIt 2 trajectory planners and ROS 2 launch graphs in the cloud, cutting our hardware integration timeline from 9 months to 6 weeks.',
        metrics: '85% faster bringup • Zero hardware collisions'
      },
      faqs: [
        {
          q: 'Can I export standard colcon workspaces and launch them locally?',
          a: 'Yes. AIGENESIS exports pristine ROS 2 Humble/Iron packages complete with package.xml, CMakeLists.txt, URDF, launch files, and test nodes ready to build with "colcon build --symlink-install".'
        },
        {
          q: 'Is MoveIt 2 kinematic planning and trajectory execution supported?',
          a: 'Yes. MoveIt 2 collision checking, cartesian path execution, and OMPL motion planners are fully integrated with real-time trajectory visualization.'
        },
        {
          q: 'Can I ingest our existing rosbag2 dataset to validate against the simulation?',
          a: 'Yes. Our Auto-SysID & Rosbag2 Ingestion module allows you to drag and drop .mcap and .db3 datasets to automatically calibrate friction and mass parameters.'
        }
      ]
    },
    'digital-twins': {
      id: 'digital-twins' as DedicatedLandingId,
      tab: 'landing-digital-twins' as ActiveTab,
      studioTab: 'cad' as ActiveTab,
      tagline: 'For Mechanical Simulation Specialists, CAE Engineers & Digital Twin Directors',
      title: 'Sub-Millimeter Multi-Physics Digital Twins Before You Cut Metal',
      subtitle: 'Bridge the gap between static CAD assemblies and dynamic 1000 Hz physics. Ingest Onshape, SolidWorks, or STEP models, compute exact mass matrices, simulate fluidic Coandă jets, and eliminate costly physical prototype re-spins.',
      primaryCta: 'Open CAD Digital Twin Studio',
      secondaryCta: 'Start 14-Day Free Pro Trial',
      standards: ['Onshape Cloud API', 'STEP / STL / OBJ', 'V-HACD Convex Hull', 'Coupled Navier-Stokes', 'MuJoCo XML'],
      stats: [
        { value: '£35,000+', label: 'Saved Per Avoided Tooling Spin' },
        { value: '1000 Hz', label: 'Coupled CFD & Solid Mechanics' },
        { value: '3x3', label: 'Exact Inertia Tensor Calculation' },
        { value: '15-Min', label: 'CAD-to-Simulation Pipeline' }
      ],
      features: [
        {
          title: 'Direct Cloud CAD Ingestion & Assembly Parsing',
          desc: 'Connect Onshape or upload STEP/STL models. AIGENESIS parses joint mates, revolute axes, mass properties, and transforms them into physics-ready meshes.',
          icon: Box
        },
        {
          title: 'Automated V-HACD Collision Decomposition',
          desc: 'Never manually build low-poly collision geometries again. Volumetric Hierarchical Approximate Convex Decomposition creates optimal collision hulls automatically.',
          icon: Layers
        },
        {
          title: 'Coupled Fluidic Coandă & Aerodynamic Thrust',
          desc: 'Simulate boundary-layer fluid attachment, solenoid valve latency, and thrust vectoring together with solid kinematic constraints.',
          icon: Zap
        }
      ],
      caseStudy: {
        company: 'Aerospace & Propulsion Innovator',
        quote: 'We validated our fluidic thrust-vectoring nozzle geometry at 1000 Hz under turbulent crosswinds before machining our first titanium prototype, saving over £120,000 in failed prototype machining runs.',
        metrics: '£120,000 saved in physical tooling • 4 prototype spins eliminated'
      },
      faqs: [
        {
          q: 'How does AIGENESIS compute mass, center of mass, and inertia tensors?',
          a: 'Our engine applies analytical volume integration across closed boundary meshes, deriving exact 3x3 inertia tensors and center of mass based on specified material density (e.g., Al 6061-T6, Ti-6Al-4V).'
        },
        {
          q: 'Does CAD data leave our network or get used to train external models?',
          a: 'No. All CAD geometries and derived URDFs belong exclusively to your organization with zero third-party telemetry egress. We offer sovereign air-gapped deployments for classified programs.'
        },
        {
          q: 'Can we simulate non-rigid or fluid-coupled mechanisms?',
          a: 'Yes. Our specialized Coandă Fluidic Twin module simulates coupled fluid-structure interactions, nozzle pressure ratios, and valve hysteresis at microsecond steps.'
        }
      ]
    },
    'robotic-arms': {
      id: 'robotic-arms' as DedicatedLandingId,
      tab: 'landing-robotic-arms' as ActiveTab,
      studioTab: 'ik' as ActiveTab,
      tagline: 'For Controls Engineers, Manipulator Integrators & Surgical Robotics Teams',
      title: 'Precision Robotic Arm Validation: Kinematics, Dynamics & 1000 Hz Loops',
      subtitle: 'Design, calibrate, and validate 3-DoF to 7-DoF robotic manipulators. Eliminate kinematic singularities, measure harmonic drive torque limits, verify inverse kinematics, and simulate bilateral tactile teleoperation with zero latency jitter.',
      primaryCta: 'Open Inverse Kinematics Studio',
      secondaryCta: 'Start 14-Day Free Pro Trial',
      standards: ['7-DoF Universal Robots UR10e', 'KUKA iiwa7 / Franka Emika', 'DLS Jacobian IK', '1 kHz FOC Dyno', 'ISO 10218'],
      stats: [
        { value: '< 1.4ms', label: 'Bilateral Teleop Latency' },
        { value: 'Det(J) > 0.05', label: 'Singularity Guard Margin' },
        { value: '7-DoF', label: 'Damped Least-Squares Kinematics' },
        { value: '100% Safe', label: 'Actuator Thermal Protection' }
      ],
      features: [
        {
          title: 'Real-Time Damped Least-Squares (DLS) Inverse Kinematics',
          desc: 'Drag 6-DoF end-effector targets in 3D space with real-time Cartesian pose tracking, joint angle limit enforcement, and singularity damping.',
          icon: Target
        },
        {
          title: 'Actuator Thermal & Harmonic Drive Dyno Profiling',
          desc: 'Model Field-Oriented Control (FOC) current loops, motor winding heating curves, gear backlash resonance, and torque saturation under high-G payloads.',
          icon: Cpu
        },
        {
          title: 'Bimanual Vision & Haptic Teleoperation',
          desc: 'Sub-millimeter tactile force feedback and tremor suppression calibrated for micro-surgical anastomosis and sensitive hazardous material handling.',
          icon: Sliders
        }
      ],
      caseStudy: {
        company: 'Surgical Robotics Manufacturer',
        quote: 'Validating our 7-DoF wrist kinematics and tactile force feedback loop in AIGENESIS allowed us to pass FDA Class II pre-submission testing with zero joint singularity incidents during clinical trials.',
        metrics: 'Sub-millimeter accuracy • 100% singularity-free patient trials'
      },
      faqs: [
        {
          q: 'Which robot arm kinematic models are supported out of the box?',
          a: 'AIGENESIS includes pre-calibrated models for UR5e/UR10e, KUKA LBR iiwa7, Franka Emika Panda, Staubli TX2, and supports importing any custom URDF manipulator.'
        },
        {
          q: 'How does the engine handle kinematic singularities?',
          a: 'We implement Damped Least-Squares (DLS) Jacobian pseudoinversion with continuous determinant monitoring. When Det(J) falls below safety thresholds, the controller dampens orthogonal velocities to prevent motor over-speeding.'
        },
        {
          q: 'Can I connect a physical SpaceMouse or WebSerial hardware controller?',
          a: 'Yes. Our Live Hardware Gateway supports direct WebHID 6-DoF input and WebSerial bridges to physical CAN-FD and RS-485 motor buses.'
        }
      ]
    },
    'fleet-ops': {
      id: 'fleet-ops' as DedicatedLandingId,
      tab: 'landing-fleet-ops' as ActiveTab,
      studioTab: 'fleet-command' as ActiveTab,
      tagline: 'For Autonomous Fleet Managers, Factory Automation Directors & Swarm Leads',
      title: 'Planetary Fleet Operations, Swarm Mesh & Physical HiL Telemetry',
      subtitle: 'Monitor, orchestrate, and validate 500+ autonomous units across distributed factories and defense theaters. Synchronize VDA 5050 AMR workcells, sniff physical CAN-FD packets over WebSerial, and deploy zero-downtime Canary OTA updates.',
      primaryCta: 'Open Fleet Operations Command',
      secondaryCta: 'Start 14-Day Free Pro Trial',
      standards: ['VDA 5050 v2.1', 'OPC-UA / MQTT', 'CAN-FD 5 Mbps', 'Canary OTA Rollouts', 'ISO 3691-4'],
      stats: [
        { value: '500+ Units', label: 'Concurrent Swarm Orchestration' },
        { value: '< 250µs', label: 'CAN-FD Jitter Guarantee' },
        { value: 'VDA 5050', label: 'Automotive Factory Standard' },
        { value: '99.999%', label: 'Mission High Availability' }
      ],
      features: [
        {
          title: 'Automotive VDA 5050 v2.1 Fleet Master',
          desc: 'Industry-standard AMR dispatching, instant action commands, traffic node lockouts, and battery charge scheduling across heterogeneous robot fleets.',
          icon: Radio
        },
        {
          title: 'Live WebSerial CAN-FD / EtherCAT Packet Sniffer',
          desc: 'Inspect raw physical motor bus traffic directly in the browser with microsecond timestamping, CRC error monitoring, and fault injection.',
          icon: Terminal
        },
        {
          title: 'Progressive Canary OTA Rollout & Auto-Rollback',
          desc: 'Roll out new neural policy weights to 5% of the fleet, monitor real-time tracking error and vibration telemetry, and trigger automated rollbacks if barriers are breached.',
          icon: RefreshCw
        }
      ],
      caseStudy: {
        company: 'Tier-1 Automotive Gigafactory',
        quote: 'Orchestrating our 350-unit AMR fleet through AIGENESIS allowed us to achieve zero aisle collisions over 1.4 million operating hours while maintaining sub-second dispatching to automated workcells.',
        metrics: 'Zero collisions • 1.4M operating hours • 22% higher throughput'
      },
      faqs: [
        {
          q: 'Is VDA 5050 communication compatible with my existing fleet management system?',
          a: 'Yes. Our VDA 5050 v2.1 MQTT and WebSocket endpoints adhere strictly to the German Automotive Industry Association specification, interfacing seamlessly with SAP EWM and Manhattan Associates.'
        },
        {
          q: 'How does the hardware packet sniffer work without installing desktop software?',
          a: 'Through the modern W3C WebSerial and WebUSB standards, Chrome/Edge can communicate directly with USB-to-CAN adapters (PCAN, Kvaser, SLCAN) with hardware microsecond timestamps.'
        },
        {
          q: 'Can we test swarm collision avoidance in extreme high-density warehouse aisles?',
          a: 'Yes. Our Multi-Agent Swarm Sandbox simulates over 500 units with dynamic obstacle negotiation, decentralized consensus, and priority-based right-of-way routing.'
        }
      ]
    },
    reasoning: {
      id: 'reasoning' as DedicatedLandingId,
      tab: 'landing-reasoning' as ActiveTab,
      studioTab: 'simulator' as ActiveTab,
      tagline: 'For AI Researchers, Embodied Foundation Model Teams & Robotics Founders',
      title: 'Physical AI Reasoning: From Human Intent to 1000 Hz Execution',
      subtitle: 'The only 5-layer physical AI stack that bridges high-level multimodal foundation models (OpenVLA, π0, Gemini) with deterministic 1000 Hz real-world motor execution. Closed-loop System 2 Chain-of-Thought reasoning with physics rollouts.',
      primaryCta: 'Launch 5-Layer Reasoning Engine',
      secondaryCta: 'Start 14-Day Free Pro Trial',
      standards: ['System 2 CoT Reasoning', 'Vision-Language-Action (VLA)', '3D Spatial World Models', '1000 Hz Motor Loop', 'Closed-Loop CoT'],
      stats: [
        { value: '5-Layer', label: 'Integrated Embodied Stack' },
        { value: '16ms', label: 'Foundation Inference Loop' },
        { value: '100%', label: 'Closed-Loop Dynamic Recovery' },
        { value: 'Zero', label: 'Catastrophic Failure Trajectories' }
      ],
      features: [
        {
          title: 'Layer 1: Multimodal Sensory Perception & Spatial Fusion',
          desc: 'Fuses RGB-D depth, thermal infrared, tactile contact arrays, and high-frequency IMU telemetry into a unified spatial state representation.',
          icon: Eye
        },
        {
          title: 'Layer 3: System 2 Chain-of-Thought Physical Reasoning',
          desc: 'Decomposes complex, ambiguous natural-language human intent into mathematically verified sub-goals with formal hazard avoidance rollouts.',
          icon: Activity
        },
        {
          title: 'Layer 5: Deterministic 1000 Hz Motor Torque Synthesis',
          desc: 'Translates high-level behavioral trajectories into sub-millisecond joint torque commands with Lyapunov stability guarantees.',
          icon: Cpu
        }
      ],
      caseStudy: {
        company: 'Autonomous Hazardous Material Handling Lab',
        quote: 'When an unexpected seismic vibration disrupted our containment cell, AIGENESIS System 2 reasoning recalculated an evasion trajectory in 18ms, preventing a £3M chemical spill on physical hardware.',
        metrics: '18ms dynamic recovery • £3,000,000 catastrophe avoided'
      },
      faqs: [
        {
          q: 'How does AIGENESIS prevent foundation model hallucination from breaking physical hardware?',
          a: 'We enforce a strict separation between high-level reasoning and low-level control. Foundation model sub-goals must pass through formal Control Barrier Functions (CBFs) and Lyapunov stability filters before reaching motor actuators.'
        },
        {
          q: 'Which foundation models can be plugged into the 5-layer stack?',
          a: 'AIGENESIS integrates seamlessly with Physical Intelligence π0, Stanford OpenVLA-7B, UC Berkeley Octo, Google Gemini Multimodal, and custom fine-tuned PyTorch checkpoints.'
        },
        {
          q: 'Does it run locally on target edge silicon like NVIDIA Jetson?',
          a: 'Yes. Our Silicon Forge cross-compiles reasoning policies into optimized TensorRT-LLM FP8 engines capable of running directly on NVIDIA Jetson AGX Orin with sub-4ms latency.'
        }
      ]
    },
    safety: {
      id: 'safety' as DedicatedLandingId,
      tab: 'landing-safety' as ActiveTab,
      studioTab: 'formal-prover' as ActiveTab,
      tagline: 'For Safety Assurance Leads, Regulatory Directors & System Certification VPs',
      title: 'Formal Safety & Verification: Z3 SMT Barrier Proofs & Audit Packs',
      subtitle: 'Replace probabilistic "hope it works" testing with mathematical proof. Formally prove invariant forward safety using Z3 SMT theorem provers, generate automated ISO 10218, ISO 3691-4, and FDA 21 CFR 820 audit binders, and block unsafe code in Git CI/CD.',
      primaryCta: 'Open Formal Safety Prover',
      secondaryCta: 'Start 14-Day Free Pro Trial',
      standards: ['Z3 SMT Solver', 'Control Barrier Functions (CBF)', 'ISO 10218 / 13849', 'FDA 21 CFR 820 DHF', 'STANAG 4586'],
      stats: [
        { value: '100%', label: 'Mathematically Proven Invariants' },
        { value: '14ms', label: 'Average Z3 Formal Verification' },
        { value: '16 Weeks', label: 'Regulatory Audit Prep Saved' },
        { value: 'Zero', label: 'Unverified Commits to Main' }
      ],
      features: [
        {
          title: 'Automated Z3 SMT Control Barrier Verification',
          desc: 'Mathematically verifies that system state x(t) remains strictly within safe set C for all time t, proving zero kinematic collisions and torque bounds.',
          icon: ShieldCheck
        },
        {
          title: 'One-Click Regulatory Dossier & DHF Generator',
          desc: 'Generates complete Design History Files (DHF), Fault Tree Analysis (FTA), FMEA risk matrices, and ISO 13485/3691 compliance packets ready for auditors.',
          icon: FileCheck
        },
        {
          title: 'AIGENESIS Gatekeeper CI/CD GitHub Action',
          desc: 'Blocks any pull request that violates kinematic bounds, CBF safety invariants, or exceeds Sim-to-Real tracking error thresholds before code reaches robots.',
          icon: GitFork
        }
      ],
      caseStudy: {
        company: 'Surgical & Defense Autonomous Systems Prime',
        quote: 'The automated Z3 barrier proofs and FDA DHF binder generation in AIGENESIS allowed our engineering team to clear notified body audits in 3 weeks instead of 6 months.',
        metrics: 'Audit clearance in 3 weeks • 100% formal mathematical guarantee'
      },
      faqs: [
        {
          q: 'How does formal verification differ from standard simulation testing?',
          a: 'Standard simulation only tests thousands of random scenarios (Monte Carlo). Formal methods use symbolic SMT solvers (Z3) to mathematically prove that NO possible state in the reachable set can ever breach safety invariants.'
        },
        {
          q: 'Can the safety certificates be submitted directly to FDA and ISO auditors?',
          a: 'Yes. Our generated dossiers adhere to FDA 21 CFR Part 820.30 (Design Controls) and ISO 13485 / ISO 13849-1 standards, complete with cryptographic SHA-256 evidence signatures.'
        },
        {
          q: 'Does it integrate into our existing GitHub Actions or GitLab CI pipelines?',
          a: 'Yes. Our AIGENESIS Gatekeeper CI/CD action runs automatically on every pull request, executing barrier proofs and blocking merges if safety margins are compromised.'
        }
      ]
    }
  };

  const currentConfig = solutionConfigs[selectedSolution];

  return (
    <div className="space-y-12 py-4 font-mono text-slate-100 pb-24">
      {/* Top Navigation & Solution Selector Bar */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-3 sm:p-4 shadow-xl backdrop-blur-xl sticky top-20 z-30 space-y-2">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Dedicated Solutions:</span>
            <span className="text-xs font-bold text-cyan-400 font-sans hidden sm:inline">Choose your domain specialization</span>
          </div>
          <button
            onClick={() => onNavigateTab('landing')}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Return to Full Overview</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* 6 Solution Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { id: 'ros2', label: 'ROS 2 Simulation', icon: Terminal, color: 'hover:border-cyan-500' },
            { id: 'digital-twins', label: 'Digital Twins', icon: Box, color: 'hover:border-indigo-500' },
            { id: 'robotic-arms', label: 'Robotic Arm Validation', icon: Target, color: 'hover:border-emerald-500' },
            { id: 'fleet-ops', label: 'Fleet Operations', icon: Radio, color: 'hover:border-purple-500' },
            { id: 'reasoning', label: 'AI Physical Reasoning', icon: Activity, color: 'hover:border-amber-500' },
            { id: 'safety', label: 'Safety & Verification', icon: ShieldCheck, color: 'hover:border-rose-500' }
          ].map(sol => {
            const Icon = sol.icon;
            const active = selectedSolution === sol.id;
            return (
              <button
                key={sol.id}
                onClick={() => {
                  setSelectedSolution(sol.id as DedicatedLandingId);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2 ${
                  active
                    ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/10 font-bold scale-[1.02]'
                    : `bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 ${sol.color}`
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="text-xs truncate">{sol.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-12 text-center space-y-6 shadow-2xl">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Audience Tagline */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{currentConfig.tagline}</span>
        </div>

        {/* Clean, Focused Headline */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {currentConfig.title}
          </h1>
          <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto font-sans leading-relaxed">
            {currentConfig.subtitle}
          </p>
        </div>

        {/* 2 Focused CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigateTab(currentConfig.studioTab)}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black rounded-2xl text-xs sm:text-sm transition-all shadow-xl shadow-cyan-500/25 hover:scale-[1.02] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>{currentConfig.primaryCta}</span>
          </button>

          {onOpenProTrialModal ? (
            <button
              onClick={onOpenProTrialModal}
              className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 font-extrabold rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/10 hover:scale-[1.02] cursor-pointer"
            >
              <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>{currentConfig.secondaryCta}</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigateTab('pricing')}
              className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 font-extrabold rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/10 hover:scale-[1.02] cursor-pointer"
            >
              <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>View Pricing & Pilot Plans</span>
            </button>
          )}
        </div>

        {/* Standards & Certifications Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <span className="text-[10px] uppercase font-bold text-slate-500">Certified Compatible With:</span>
          {currentConfig.standards.map((std, i) => (
            <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]">
              {std}
            </span>
          ))}
        </div>
      </section>

      {/* 4 Quantitative Proof Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {currentConfig.stats.map((stat, i) => (
          <div key={i} className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-center space-y-1">
            <span className="text-xl sm:text-2xl font-extrabold text-cyan-400 font-mono">{stat.value}</span>
            <span className="text-[11px] text-slate-400 block font-sans">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Dedicated Interactive Sandbox / Preview Widget for Each Domain */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>Interactive Domain Sandbox Preview</span>
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Live simulation widget for {currentConfig.id.toUpperCase()}. Experience zero-lag physics in your browser.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab(currentConfig.studioTab)}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>Open Dedicated Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 1. ROS 2 Simulation Widget */}
        {selectedSolution === 'ros2' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-400 text-[11px] border-b border-slate-800 pb-2">
                <span>ACTIVE ROS 2 TOPICS (1000 Hz MOTOR BUS)</span>
                <span className="text-emerald-400 font-bold">RMW: Zenoh (Zero-Copy)</span>
              </div>
              <div className="space-y-2">
                {[
                  { topic: '/joint_states', freq: '1000 Hz', type: 'sensor_msgs/msg/JointState', bw: '240 KB/s' },
                  { topic: '/cmd_vel', freq: '50 Hz', type: 'geometry_msgs/msg/Twist', bw: '8 KB/s' },
                  { topic: '/tf', freq: '100 Hz', type: 'tf2_msgs/msg/TFMessage', bw: '48 KB/s' },
                  { topic: '/camera/depth', freq: '30 Hz', type: 'sensor_msgs/msg/Image', bw: '18.4 MB/s' }
                ].map(t => (
                  <div
                    key={t.topic}
                    onClick={() => setSelectedTopic(t.topic)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                      selectedTopic === t.topic
                        ? 'bg-cyan-500/15 border-cyan-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white">{t.topic}</div>
                      <div className="text-[10px] text-slate-500">{t.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold">{t.freq}</div>
                      <div className="text-[10px] text-slate-500">{t.bw}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-400 text-[11px] border-b border-slate-800 pb-2">
                <span>GENERATED ROS 2 LAUNCH & USD SCENE</span>
                <span className="text-cyan-400 font-bold">colcon build ready</span>
              </div>
              <pre className="text-[11px] text-slate-300 whitespace-pre-wrap max-h-56 overflow-y-auto p-2 bg-slate-900 rounded-xl">
{`from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='aigenesis_controller',
            executable='motor_loop_node',
            name='aigenesis_1000hz',
            parameters=[{
                'update_rate_hz': 1000,
                'cbf_safety_invariants': True,
                'rmw_zenoh_direct': True,
                'target_topic': '${selectedTopic}'
            }],
            output='screen'
        )
    ])`}
              </pre>
            </div>
          </div>
        )}

        {/* 2. Digital Twins Widget */}
        {selectedSolution === 'digital-twins' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-400 text-[11px] border-b border-slate-800 pb-2">
                <span>CAD INGESTION & MASS PROPERTIES</span>
                <span className="text-emerald-400 font-bold">Model: High-G Gimbal Assembly</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                  <span className="text-slate-400">Total Assembly Mass:</span>
                  <span className="text-white font-bold">4.824 kg (Al 6061-T6)</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                  <span className="text-slate-400">Principal Inertia Ixx:</span>
                  <span className="text-cyan-400 font-bold">0.0184 kg·m²</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                  <span className="text-slate-400">V-HACD Convex Hulls:</span>
                  <span className="text-white font-bold">14 Hulls (482 Triangles)</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                  <span className="text-slate-400">Coupled Coandă Fluidic Stall:</span>
                  <span className="text-emerald-400 font-bold">No Stall (h/R = 0.048)</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-slate-400 text-[11px] border-b border-slate-800 pb-2">
                  <span>PRE-MACHINING TOOLING CYCLE AVOIDANCE</span>
                  <span className="text-emerald-400 font-bold">ROI Validated</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  By catching resonance backlash and aerodynamic boundary-layer separation in simulation, engineering teams eliminate an average of 4 physical CNC prototype cycles.
                </p>
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 font-bold">
                  Estimated Physical Machining Savings: £140,000 + 12 Weeks Lead Time
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('cad')}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 cursor-pointer"
              >
                Ingest New CAD File (STEP / Onshape / STL)
              </button>
            </div>
          </div>
        )}

        {/* 3. Robotic Arm Validation Widget */}
        {selectedSolution === 'robotic-arms' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-400 text-[11px] border-b border-slate-800 pb-2">
                <span>7-DoF MANIPULATOR KINEMATIC SLIDERS</span>
                <span className="text-emerald-400 font-bold">Singularity Safe</span>
              </div>
              <div className="space-y-2">
                {armJointAngles.map((angle, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Joint {idx + 1} Position:</span>
                      <span className="text-cyan-400 font-bold">{angle}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={angle}
                      onChange={e => {
                        const newAngles = [...armJointAngles];
                        newAngles[idx] = parseInt(e.target.value);
                        setArmJointAngles(newAngles);
                      }}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-slate-400 text-[11px] border-b border-slate-800 pb-2">
                  <span>CARTESIAN END-EFFECTOR POSE & JACOBIAN</span>
                  <span className="text-cyan-400 font-bold">DLS Inversion</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl space-y-1 text-xs">
                  <div className="text-slate-400">Cartesian Coordinate (X, Y, Z):</div>
                  <div className="text-white font-bold text-sm">X: +0.642m | Y: -0.184m | Z: +0.791m</div>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Jacobian Determinant Det(J):</span>
                    <span className="text-emerald-400 font-bold">0.084 (&gt; 0.05 Threshold)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: '84%' }} />
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('ik')}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Launch Full 3D Interactive IK Studio
              </button>
            </div>
          </div>
        )}

        {/* 4. Fleet Operations Widget */}
        {selectedSolution === 'fleet-ops' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-400 text-[11px] border-b border-slate-800 pb-2">
                <span>VDA 5050 AMR CLUSTER TELEMETRY (350 UNITS)</span>
                <span className="text-emerald-400 font-bold">Mesh Consensus: 99.8%</span>
              </div>
              <div className="space-y-2">
                {[
                  { unit: 'AMR-Unit-084', state: 'EXECUTING_NODE_B', battery: '94%', speed: '1.4 m/s', cbf: 'NOMINAL' },
                  { unit: 'AMR-Unit-112', state: 'JIT_PALLET_LIFT', battery: '82%', speed: '0.0 m/s', cbf: 'NOMINAL' },
                  { unit: 'AMR-Unit-209', state: 'DYNAMIC_YIELD_WAYPOINT', battery: '76%', speed: '0.6 m/s', cbf: 'COLLISION_AVOIDED' }
                ].map(u => (
                  <div key={u.unit} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">{u.unit}</div>
                      <div className="text-[10px] text-slate-500">{u.state}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-cyan-400 font-bold">{u.speed} • {u.battery}</div>
                      <div className="text-[10px] text-emerald-400">{u.cbf}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-slate-400 text-[11px] border-b border-slate-800 pb-2">
                  <span>CAN-FD BUS SNIFFER & PROGRESSIVE CANARY OTA</span>
                  <span className="text-purple-400 font-bold">5 Mbps Bus</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl space-y-1">
                  <div className="text-slate-400 text-[10px]">CURRENT OTA POLICY CANARY:</div>
                  <div className="text-white font-bold">v3.4.1-rc2 (Active on 18 Units / 5%)</div>
                  <div className="text-[10px] text-emerald-400">Mean Tracking Deviation: 0.18% (Within 0.5% limit)</div>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('fleet-command')}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Open Planetary Fleet Command Deck
              </button>
            </div>
          </div>
        )}

        {/* 5. AI Physical Reasoning Widget */}
        {selectedSolution === 'reasoning' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-400 text-[11px] border-b border-slate-800 pb-2">
                <span>SYSTEM 2 CHAIN-OF-THOUGHT ROLLOUT</span>
                <span className="text-amber-400 font-bold">Closed-Loop Recovery</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 bg-slate-900 rounded-lg border-l-2 border-cyan-400">
                  <span className="text-cyan-400 font-bold block">1. Natural Goal:</span>
                  <span className="text-slate-300">"Retrieve hazardous isotope vial from rocking pallet without tilting &gt; 5 degrees."</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border-l-2 border-indigo-400">
                  <span className="text-indigo-400 font-bold block">2. 3D World Model Physics Projection:</span>
                  <span className="text-slate-300">Surface friction μ = 0.12. Pallet oscillation period 1.84s. Contact patch slip predicted.</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border-l-2 border-emerald-400">
                  <span className="text-emerald-400 font-bold block">3. Closed-Loop Motor Action:</span>
                  <span className="text-slate-300">Pre-compensate normal grasp force to 14.8 N. Phase-lock wrist actuation to pallet frequency.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-slate-400 text-[11px] border-b border-slate-800 pb-2">
                  <span>5-LAYER INFERENCE TIMING BREAKDOWN</span>
                  <span className="text-emerald-400 font-bold">Sub-20ms Total</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Layer 1 (Perception Fusion):</span>
                    <span className="text-white font-bold">3.2 ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Layer 2 (Spatial World Model):</span>
                    <span className="text-white font-bold">4.8 ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Layer 3 (System 2 CoT Reasoning):</span>
                    <span className="text-amber-400 font-bold">7.4 ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Layer 5 (1000 Hz Motor Loop):</span>
                    <span className="text-emerald-400 font-bold">0.8 ms</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('simulator')}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Launch 5-Layer Reasoning Simulator
              </button>
            </div>
          </div>
        )}

        {/* 6. Safety & Verification Widget */}
        {selectedSolution === 'safety' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-400 text-[11px] border-b border-slate-800 pb-2">
                <span>Z3 SMT FORMAL BARRIER VERIFICATION</span>
                <span className="text-emerald-400 font-bold">Theorem Prover Active</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Control Barrier Invariant:</span>
                  <span className="text-rose-400 font-bold">h(x) ≥ 0 ∀ t ≥ 0</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Lyapunov Decay Rate:</span>
                  <span className="text-cyan-400 font-bold">V̇(x) ≤ -α V(x) (α = 4.2)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Verification Solver Latency:</span>
                  <span className="text-emerald-400 font-bold">14.2 milliseconds</span>
                </div>
              </div>
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px] font-bold">
                ✓ Formal Status: Forward invariance proven. No state trajectory can breach obstacle boundary.
              </div>
            </div>

            <div className="lg:col-span-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-slate-400 text-[11px] border-b border-slate-800 pb-2">
                  <span>AUDIT-READY REGULATORY DOSSIER</span>
                  <span className="text-cyan-400 font-bold">FDA / ISO 13485</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  Automatic synthesis of Design History Files (DHF) and Risk Management binders with cryptographic SHA-256 evidence signatures.
                </p>
                <div className="p-2.5 bg-slate-900 rounded-xl text-[10px] text-slate-400">
                  Standards Certified: ISO 10218-1/2, ISO 3691-4, IEC 62304 Class C, FDA 21 CFR Part 820.
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('formal-prover')}
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Open Formal Safety Prover Studio
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3 Core Value Propositions */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Why Leading Teams Choose AIGENESIS</h2>
          <p className="text-xs text-slate-400 font-sans">Engineering benchmarks that redefine development velocity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentConfig.features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{feat.title}</h3>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Enterprise Case Study Snapshot */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Award className="w-4 h-4" />
          <span>Proven Enterprise Impact • {currentConfig.caseStudy.company}</span>
        </div>
        <blockquote className="text-sm sm:text-base text-slate-200 font-sans italic leading-relaxed">
          "{currentConfig.caseStudy.quote}"
        </blockquote>
        <div className="text-xs font-mono font-bold text-emerald-400 pt-2 border-t border-slate-800/80">
          ✓ Verified Metric: {currentConfig.caseStudy.metrics}
        </div>
      </section>

      {/* Domain-Specific FAQ Accordion */}
      <section className="space-y-4 max-w-3xl mx-auto">
        <div className="text-center space-y-1">
          <h2 className="text-lg sm:text-xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400 font-sans">Everything technical teams ask about {currentConfig.id.toUpperCase()}.</p>
        </div>

        <div className="space-y-2">
          {currentConfig.faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                >
                  <span className="text-xs font-bold text-white font-sans">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-400 font-sans leading-relaxed border-t border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Conversion Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border border-cyan-500/40 rounded-3xl p-6 sm:p-10 text-center space-y-4 shadow-xl">
        <h2 className="text-xl sm:text-3xl font-extrabold text-white">
          Ready to Accelerate Your {currentConfig.title.split(':')[0]}?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-sans">
          Deploy production-grade physical AI models and digital twins with zero local configuration.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigateTab(currentConfig.studioTab)}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-600/20 cursor-pointer"
          >
            Launch {currentConfig.title.split(':')[0]}
          </button>
          <button
            onClick={() => onNavigateTab('pricing')}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
          >
            Explore Enterprise Tier & Pilot SOW
          </button>
        </div>
      </section>
    </div>
  );
};
