import { PillarInfo } from '../types';

export const PILLARS_DATA: Record<string, PillarInfo> = {
  multimodality: {
    id: 'multimodality',
    name: 'Multimodality',
    shortTag: 'Perception & Sensing',
    tagline: 'Translating rich physical world signals into real-time neural representations.',
    iconName: 'Eye',
    color: '#06b6d4', // Cyan
    accentBg: 'rgba(6, 182, 212, 0.1)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    description: 'Physical embodiment requires far more than camera pixels. Multimodality fuses high-frame-rate RGB-D depth arrays, 3D LiDAR point clouds, tactile force/vibration matrices, thermal gradients, and acoustic harmonics into a unified 4D latent tensor representation.',
    keyTechnologies: [
      'RGB-D Stereo Depth Processing',
      'Solid-State 3D LiDAR Point Cloud Fusion',
      'Tactile Fingertip Micro-Sensor Arrays',
      'Acoustic Vibration & Thermal Imaging',
      'Cross-Modal Latent Embedding Spaces'
    ],
    roleInStack: 'First layer of the physical stack. Serves as the eyes, ears, and sense of touch, converting analog physical realities into structured neural tokens at 120Hz+',
    realWorldImpact: 'Eliminates blind spots in dynamic environments, enables gripping delicate glass without breaking or slipping, and senses thermal hazards through heavy smoke.',
    benchmarkMetric: 'Sensor Fusion Latency',
    benchmarkValue: '< 4.2 ms',
    codeSnippet: `// 120Hz Cross-Modal Stream Aggregator
const sensoryInput = await SensorStream.aggregate({
  rgbd: cameraArray.readDepthPointcloud(),
  lidar: solidStateLidar.read3DOcupancy(),
  tactile: gripperSensors.readForceMatrix(),
  thermal: IRArray.readHeatmap()
});
const multimodalEmbedding = Encoder.fuseCrossModal(sensoryInput);`
  },

  world_models: {
    id: 'world_models',
    name: 'World Models',
    shortTag: 'Physics & Spatial Simulation',
    tagline: 'Predicting the physical consequences of actions before executing them in reality.',
    iconName: 'Globe',
    color: '#10b981', // Emerald
    accentBg: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    description: 'Generative physical world models learn the intuitive physics of the universe—gravity, momentum, friction, fluid dynamics, and deformable materials. By running internal high-speed generative rollouts (mental simulations), the system forecasts future physical states $T+n$ seconds ahead.',
    keyTechnologies: [
      'Generative 3D Spatial Rollouts',
      'Differentiable Physics Engine Coupling',
      'Occupancy Grid Forecasting',
      'Friction & Deformable Material Simulators',
      'Uncertainty Estimation & Hallucination Guard'
    ],
    roleInStack: 'The predictive sandbox. Allows agents to test 1,000 candidate motor trajectories internally in milliseconds, filtering out paths that would cause collisions, drops, or tip-overs.',
    realWorldImpact: 'Enables robots to catch falling objects, navigate slipping ice surfaces, and predict object behavior when pushed or stacked.',
    benchmarkMetric: 'Prediction Trajectory Accuracy',
    benchmarkValue: '99.1% @ 2.0s',
    codeSnippet: `// Generative World Model Physical Rollout
const futureStates = await WorldModel.simulateRollout({
  currentState: multimodalEmbedding,
  candidateAction: motorActionPlan,
  timeHorizonSec: 2.0,
  physicsParams: { frictionCoeff: 0.42, gravity: 9.81 }
});
if (futureStates.hasCollisionRisk) {
  replanTrajectory(futureStates.hazardVector);
}`
  },

  reasoning: {
    id: 'reasoning',
    name: 'Reasoning',
    shortTag: 'Cognitive System',
    tagline: 'System 2 cognitive deliberation, hazard evaluation, and constraint logic.',
    iconName: 'Brain',
    color: '#8b5cf6', // Violet
    accentBg: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    description: 'System 2 deliberate reasoning breaks complex long-horizon goals into logically verified steps. It evaluates strict physical safety constraints, performs formal logic checks, balances competing trade-offs, and dynamically replans when real-world execution deviates from assumptions.',
    keyTechnologies: [
      'Tree-of-Thought (ToT) Planning',
      'Formal Logic & Safety Verifiers',
      'Real-Time Hazard Matrix Calculation',
      'Self-Correction & Fallback Logic',
      'Chain-of-Embodied-Thought (CoET)'
    ],
    roleInStack: 'The cognitive decision engine. Evaluates goal feasibility, enforces strict safety boundaries, and selects the optimal path through the World Model\'s simulated outcomes.',
    realWorldImpact: 'Ensures zero human endangerment during collaboration, automatically identifies edge cases, and adjusts strategy when tools fail or paths become blocked.',
    benchmarkMetric: 'Constraint Satisfaction Rate',
    benchmarkValue: '99.998%',
    codeSnippet: `// System 2 Deliberate Reasoning & Constraint Logic
const decisionTree = await ReasoningEngine.evaluateTreeOfThought({
  goal: "Clear path without spilling chemical container",
  simulatedOutcomes: futureStates,
  safetyRules: [NoHumanIntersection, ForceThresholdMax25N]
});
const validatedPlan = decisionTree.selectOptimalPath();`
  },

  agents: {
    id: 'agents',
    name: 'Autonomous Agents',
    shortTag: 'Goal Decomposition',
    tagline: 'Orchestrating specialized sub-agents and tool calls to achieve long-horizon goals.',
    iconName: 'Bot',
    color: '#f59e0b', // Amber
    accentBg: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    description: 'A single monolithic model cannot execute complex tasks reliably. Autonomous Agent Swarms decompose macro-objectives into a Directed Acyclic Graph (DAG) of sub-goals, invoking specialized tools, APIs, vision modules, and robotic motor sub-controllers with consensus voting.',
    keyTechnologies: [
      'Hierarchical Sub-Goal Decomposition',
      'Multi-Agent Consensus Protocols',
      'Tool & Sensor API Invocation',
      'Episodic Task Memory Retrieval',
      'Real-Time Inter-Agent Bus'
    ],
    roleInStack: 'The executive director. Coordinates specialized sub-agents (Planner, Perception, Controller, Safety Monitor) and manages persistent memory across multi-step missions.',
    realWorldImpact: 'Allows single robots or swarms to complete multi-hour missions autonomously—such as exploring cave systems, assembling furniture from manual instructions, or sorting thousands of warehouse packages.',
    benchmarkMetric: 'Multi-Task Success Rate',
    benchmarkValue: '98.7%',
    codeSnippet: `// Multi-Agent Task Orchestrator
const taskDAG = AgentOrchestrator.decompose(macroGoal);
await Promise.all([
  PerceptionAgent.trackObjectPose(),
  SafetyAgent.monitorForceLimits(),
  PlannerAgent.stepSubGoal(taskDAG.nextStep())
]);`
  },

  robotics: {
    id: 'robotics',
    name: 'Robotics',
    shortTag: 'Physical Embodiment',
    tagline: 'Translating digital cognition into sub-millimeter physical joint actuation.',
    iconName: 'Cpu',
    color: '#ec4899', // Pink
    accentBg: 'rgba(236, 72, 153, 0.1)',
    borderColor: 'rgba(236, 72, 153, 0.3)',
    description: 'The physical embodiment layer converts high-level action intents into high-frequency motor torque commands, inverse kinematics calculations, closed-loop PID control, impedance control for soft contact, and real-time end-effector trajectories.',
    keyTechnologies: [
      'Real-Time Inverse Kinematics (IK)',
      '1000Hz Impedance & Torque Control',
      'Force-Compliant End-Effector Grippers',
      'Whole-Body Dynamic Balancing',
      'CAN-bus & EtherCAT Low-Latency Motor Drivers'
    ],
    roleInStack: 'The muscles and joints. Executes physical work in the material world, transforming cognitive plans into fluid, compliant, highly precise physical movement.',
    realWorldImpact: 'Achieves delicate contact with glass, operates heavy machinery, maintains balance on uneven terrain, and executes high-speed surgical or manufacturing movements.',
    benchmarkMetric: 'Actuation Frequency',
    benchmarkValue: '1,000 Hz',
    codeSnippet: `// 1000Hz Low-Level Actuation Loop
motorController.onTick((sensorFeedback) => {
  const targetTorques = InverseKinematics.computeTorque({
    desiredPose: currentSubGoal.targetPose,
    actualJoints: sensorFeedback.jointAngles,
    complianceGains: { Kp: 120, Kd: 15 }
  });
  motorController.sendEtherCAT(targetTorques);
});`
  }
};
