export type ActiveTab = 
  | 'landing'
  | 'simulator' 
  | 'flywheel'
  | 'coanda'
  | 'teleop'
  | 'slam'
  | 'pid'
  | 'ik'
  | 'bt'
  | 'cad'
  | 'mechanism-sim'
  | 'innovations'
  | 'pillars' 
  | 'architecture' 
  | 'pricing' 
  | 'export' 
  | 'kinematics' 
  | 'swarm' 
  | 'compliance'
  | 'vv-evidence'
  | 'fault-injection'
  | 'twin-trust'
  | 'analytics';

export type InnovationModuleId = 
  | 'vla-distillation'
  | 'tactile-reflex'
  | 'gps-denied'
  | 'sim2real-cert'
  | 'firmware-synth'
  | 'neuromorphic-dvs';

export interface VisitorSessionEvent {
  id: string;
  sessionId: string;
  visitorId: string;
  timestamp: string;
  tab: string;
  eventType: 'pageview' | 'action' | 'trial_open' | 'trial_start' | 'export' | 'simulation_run';
  details?: Record<string, any>;
  path?: string;
  referrer?: string;
  durationSec?: number;
  userAgent?: string;
  companyName?: string;
  industry?: string;
  country?: string;
  countryCode?: string;
  city?: string;
}

export interface IdentifiedCompany {
  id: string;
  name: string;
  domain: string;
  industry: 'Defense & Aerospace' | 'Surgical & Medical' | 'Autonomous Systems' | 'Industrial Robotics' | 'Research & Government';
  size: string;
  location: string;
  country: string;
  countryCode: string;
  flag: string;
  totalVisits: number;
  totalPageviews: number;
  firstSeen: string;
  lastSeen: string;
  intentScore: number; // 0 - 100
  intentLevel: 'HOT LEAD' | 'HIGH' | 'MEDIUM' | 'EVALUATING';
  modulesExplored: string[];
  likelyDecisionMaker: string;
  status: 'Active Now' | 'Visited Today' | 'Follow-Up Recommended' | 'Trial Activated';
  sourceCampaign: string;
  journey: {
    timestamp: string;
    action: string;
    module: string;
    details?: string;
  }[];
}

export interface AnalyticsSummary {
  activeNow: number;
  totalSessions: number;
  totalPageviews: number;
  uniqueCompaniesCount: number;
  avgSessionDurationSec: number;
  trialConversionsCount: number;
  trialConversionRatePct: number;
  topModules: { id: string; name: string; views: number; timeSpentSec: number; pct: number }[];
  funnel: { step: string; count: number; dropoffPct: number; conversionPct: number }[];
  topReferrers: { source: string; visits: number; leads: number; conversionRate: number }[];
  geoDistribution: { country: string; countryCode: string; visits: number; companies: number }[];
  recentActivity: { id: string; timestamp: string; companyName: string; action: string; module: string; location: string }[];
}

export interface CompanyMechanism {
  id: string;
  companyName: string;
  mechanismName: string;
  industry: 'Surgical & Medical' | 'Defense & Aerospace' | 'Industrial Robotics' | 'Autonomous Vehicles' | 'Humanoid Robotics';
  dof: number;
  nominalPayloadKg: number;
  operatingFrequencyHz: number;
  actuatorType: string;
  gearReduction: string;
  nominalCycleDurationSec: number;
  typicalIterationCostUsd: number;
  typicalIterationWeeks: number;
  cadModelDescription: string;
  nominalTorqueNm: number;
  maxTorqueNm: number;
  gearBacklashArcmin: number;
  thermalLimitCelsius: number;
}

export interface FailureModeItem {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  subsystem: 'Kinematics & Singularity' | 'Thermal & Winding' | 'Backlash & Resonance' | 'Structural / Fatigue' | 'Control Loop Latency';
  telemetryTrigger: string;
  rootCause: string;
  hardwareRisk: string;
  simulatedFix: string;
  confidenceScore: number;
}

export interface IterationSavingsReport {
  mechanismId: string;
  mechanismName: string;
  companyName: string;
  generatedDate: string;
  physicalIterationsAvoided: number;
  machiningCostSavedUsd: number;
  benchTestHoursSaved: number;
  scrappedHardwareSavedUsd: number;
  scheduleWeeksAccelerated: number;
  totalFinancialSavingsUsd: number;
  energyEfficiencyGainPct: number;
  roiMultiplier: number;
  failureModesCount: number;
  summaryNote: string;
}

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
  isTrialActive?: boolean;
  trialStartDate?: string;
  trialEndDate?: string;
  trialDaysRemaining?: number;
}

export interface PayPalCheckoutResponse {
  orderId: string;
  status: string;
  mode: 'live' | 'sandbox' | 'simulated';
  tier: PlanTier;
  amount: number;
  approvalUrl?: string;
}
