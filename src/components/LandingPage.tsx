import React, { useState } from 'react';
import { 
  Cpu, Activity, Terminal, Network, Box, ShieldCheck, Sparkles, 
  ArrowRight, CheckCircle2, Zap, Layers, Play, Check, Shield, 
  Building2, Globe, FileCode, Flame, ChevronRight, Users, Wrench, 
  Calculator, ChevronDown, DollarSign, ExternalLink, Compass, Sliders,
  Target, GitFork
} from 'lucide-react';
import { ActiveTab } from '../types';

interface LandingPageProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenCustomModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenCustomModal
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
        <div className="flex flex-wrap items-center justify-center gap-4 font-mono">
          <button
            onClick={() => onNavigate('simulator')}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-xl shadow-cyan-500/25 hover:scale-[1.02]"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Launch Live 5-Layer Simulator</span>
          </button>

          <button
            onClick={onOpenCustomModal}
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold rounded-2xl text-sm transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Custom Objective AI Synthesizer</span>
          </button>
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

      {/* 2. Core Services Offered Section */}
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
            return (
              <div
                key={idx}
                onClick={() => onNavigate('simulator')}
                className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 space-y-3 cursor-pointer transition-all hover:scale-[1.02] group"
              >
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl w-fit group-hover:border-cyan-400">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-bold text-white font-mono">{ind.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{ind.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Frequently Asked Questions */}
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
