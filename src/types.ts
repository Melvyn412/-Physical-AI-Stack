export type ActiveTab = 
  | 'landing'
  | 'simulator' 
  | 'slam'
  | 'pid'
  | 'ik'
  | 'bt'
  | 'pillars' 
  | 'architecture' 
  | 'pricing' 
  | 'export' 
  | 'kinematics' 
  | 'swarm' 
  | 'compliance';

export type StackPillar = 
  | 'multimodality'
  | 'world_models'
  | 'reasoning'
  | 'agents'
  | 'robotics';

export interface PillarInfo {
  id: StackPillar;
  name: string;
  shortTag: string;
  tagline: string;
  iconName: string;
  color: string;
  accentBg: string;
  borderColor: string;
  description: string;
  keyTechnologies: string[];
  roleInStack: string;
  realWorldImpact: string;
  benchmarkMetric: string;
  benchmarkValue: string;
  codeSnippet: string;
}

export interface ObjectiveScenario {
  id: string;
  title: string;
  category: string;
  icon: string;
  environment: string;
  embodiment: string;
  difficulty: 'Standard' | 'High Precision' | 'Extreme Environment' | 'Zero-Margin Safety';
  description: string;
  targetGoal: string;
  defaultMultimodal: {
    sensors: string[];
    fusionRateHz: number;
    noiseMitigation: string;
    dataVolumeMbps: number;
  };
  defaultWorldModel: {
    gridResolutionCm: number;
    predictionHorizonMs: number;
    physicsEngine: string;
    confidenceScore: number;
  };
  defaultReasoning: {
    strategy: string;
    cotSteps: string[];
    hazardLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  defaultAgents: {
    activeAgents: string[];
    subGoalDAG: string;
    consensusScore: number;
  };
  defaultRobotics: {
    kinematics: string;
    controlFrequencyHz: number;
    targetTorqueNm: number[];
    gripForceN: number;
  };
  steps: {
    stepNumber: number;
    title: string;
    description: string;
    activeLayer: StackPillar;
    status: 'NORMAL' | 'WARN' | 'CRITICAL';
    confidence: number;
  }[];
}

export interface DynamicDecomposition {
  multimodality: {
    sensors: string[];
    fusionRateHz: number;
    noiseMitigation: string;
    dataVolumeMbps?: number;
  };
  worldModel: {
    gridResolutionCm?: number;
    predictionHorizonMs?: number;
    physicsEngine: string;
    confidenceScore: number;
  };
  reasoning: {
    strategy: string;
    cotSteps: string[];
    hazardLevel: string;
  };
  agents: {
    activeAgents: string[];
    subGoalDAG: string;
    consensusScore?: number;
  };
  robotics: {
    kinematics: string;
    controlFrequencyHz: number;
    targetTorqueNm?: number[];
    gripForceN: number;
  };
  simulatedSteps: {
    stepNumber: number;
    title: string;
    description: string;
    activeLayer: string;
    status: string;
    confidence: number;
  }[];
}

export interface SimulationControlState {
  isPlaying: boolean;
  currentStepIndex: number;
  speedMultiplier: number;
  sensorNoiseLevel: number; // 0 to 1
  obstacleInjected: boolean;
  worldModelRolloutVisible: boolean;
  activeViewMode: 'canvas' | 'pipeline' | 'telemetry' | 'architecture';
}

export type PlanTier = 'developer' | 'pro' | 'team' | 'enterprise';

export interface PlanLimits {
  tier: PlanTier;
  name: string;
  badge: string;
  priceMonthly: number;
  aiSynthesesLimit: number;
  simulationsLimit: number;
  stressTestsLimit: number;
  exportsLimit: number;
  hasRos2Export: boolean;
  hasIsaacSim: boolean;
  hasSyntheticDataset: boolean;
  hasComplianceAudit: boolean;
  hasAirGapped: boolean;
  seats: number;
  description: string;
}

export interface QuotaUsage {
  plan: PlanTier;
  aiSynthesesUsed: number;
  simulationsUsed: number;
  stressTestsUsed: number;
  exportsUsed: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  apiKey: string;
  subscriptionId?: string;
  paypalOrderId?: string;
  paypalPayerId?: string;
  customerEmail?: string;
  licenseKey?: string;
  billingCycle?: 'monthly' | 'annual';
  isPayPalActive?: boolean;
}

export interface PayPalCheckoutResponse {
  orderId: string;
  status: string;
  mode: 'live' | 'sandbox' | 'simulated';
  tier: PlanTier;
  amount: number;
  approvalUrl?: string;
}
