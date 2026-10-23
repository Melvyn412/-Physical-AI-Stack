import React, { useState, useEffect } from 'react';
import {
  Sparkles, ArrowRight, ArrowLeft, Check, X, Play, Shield, Cpu,
  Database, Stethoscope, Server, Sliders, Target, GitFork, RefreshCw,
  ExternalLink, HelpCircle, Layers, CheckCircle2, Zap, Calendar, AlertOctagon, Terminal, BookOpen
} from 'lucide-react';
import { ActiveTab } from '../types';

export interface TourStep {
  id: string;
  stepNumber: number;
  category: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  keyFeatures: string[];
  targetTab: ActiveTab;
  tabLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  proTip: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step_1_intent',
    stepNumber: 1,
    category: 'Core Foundation · Layer 1',
    title: 'Natural Language Intent to 5-Pillar Robotics Decomposition',
    badge: 'Intent Decomposition',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    description: 'Transform high-level human goals (e.g. "Assemble drone battery pack in high-vibration environment") into a mathematically grounded 5-pillar execution plan: Reasoning, Agents, Multimodality, World Models, and Robotics.',
    keyFeatures: [
      'Deconstructs plain English briefs into 5 physical AI pillars',
      'Dynamic allocation of simulation frequencies (100 Hz to 1000 Hz)',
      'Identifies safety invariants, sensor failure risks, and actuation delays'
    ],
    targetTab: 'simulator',
    tabLabel: 'Intent & 5 Pillars',
    icon: Sparkles,
    proTip: 'Click "Decompose Custom Goal" in the top navbar to synthesize your own robotics mission statement.'
  },
  {
    id: 'step_2_simulator',
    stepNumber: 2,
    category: 'Kinematics & Multi-Physics · Layer 2',
    title: 'Interactive 5-Layer Multi-Physics Simulator & Hardware Tuning',
    badge: '1000 Hz Closed-Loop',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    description: 'Tune closed-loop PID control loops, solve 6-DOF Cartesian inverse kinematics with MoveIt 2 singularity avoidance, and tick Behavior Tree (BT.CPP) mission graphs in real time.',
    keyFeatures: [
      'Real-time PID step-response oscilloscope with anti-windup clamping',
      'MoveIt 2 Damped Least-Squares (DLS) IK & Jacobian condition monitor',
      'BehaviorTree.CPP v4 reactive fallback trees with spin-recovery nodes'
    ],
    targetTab: 'simulator',
    tabLabel: '1000 Hz Engine',
    icon: Sliders,
    proTip: 'Drag the end-effector in the IK studio to see Jacobian condition numbers adapt in real time.'
  },
  {
    id: 'step_3_synthetic_data',
    stepNumber: 3,
    category: 'Data Flywheel · Layer 3',
    title: 'Simulation-to-Synthetic-Data Pipeline (9 Synchronized Modalities)',
    badge: '9 Modalities',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description: 'Convert physics runs into production ML training data. Extract 9 synchronized streams from a single run with zero sensor registration drift and deep Latin Hypercube domain randomization.',
    keyFeatures: [
      'RGB, Metric Z-Depth, Segmentation masks, 6D ground truth pose, Optical flow',
      '6-Axis force/torque wrench, GelSight tactile elastomer, joint states & DVS events',
      '1-click export to Hugging Face LeRobot (OpenVLA / ACT), Isaac Lab, and ROS 2'
    ],
    targetTab: 'synthetic-data',
    tabLabel: 'Synthetic Data',
    icon: Database,
    proTip: 'Download the complete JSON manifest or copy the CLI export command to feed directly into PyTorch.'
  },
  {
    id: 'step_4_scenario_gen',
    stepNumber: 4,
    category: 'Stochastic Verification · Layer 4',
    title: 'AI Scenario Generation & Automated Fault Injection Studio',
    badge: 'Automated Matrix',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    description: 'Replace brittle single-point testing with stochastic parameter distributions, automated fault injection, and ISO 26262 / MIL-STD acceptance gate evaluations.',
    keyFeatures: [
      'Physics-grounded distributions: Gaussian wind shears, uniform frictions, Poisson faults',
      'Actuator failure injection: thermal throttling, gear backlash, encoder packet drops',
      'Export reproducible test matrices (.JSON) ready for headless CI/CD cloud pipelines'
    ],
    targetTab: 'scenario-gen',
    tabLabel: 'Scenario & Faults',
    icon: Calendar,
    proTip: 'Use AI Inversion Prompts to generate corner-case stress scenarios automatically.'
  },
  {
    id: 'step_5_specialized_verticals',
    stepNumber: 5,
    category: 'Domain Packs · Layer 5',
    title: 'Industry-Specific Assurance: Surgical V&V & Defence Contested Autonomy',
    badge: 'FDA / STANAG Certified',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    description: 'Verify mission-critical systems against stringent international regulatory standards with pre-built domain benchmark packs.',
    keyFeatures: [
      'Surgical V&V: Remote-Centre-of-Motion (RCM) pivot deviation (<= 0.50mm) & FDA DHF traces',
      'Defence Assurance: GPS-denied VIO, spot jamming resilience & MIL-STD-810H vibration',
      'Sub-20ms autonomous fail-safe abort logic and 100% air-gapped on-premise security'
    ],
    targetTab: 'surgical-vv',
    tabLabel: 'Surgical & Defence',
    icon: Stethoscope,
    proTip: 'Check the "Surgical V&V" and "Defence Pack" tabs to view cryptographically sealed compliance reports.'
  },
  {
    id: 'step_6_edge_cloud_export',
    stepNumber: 6,
    category: 'Deployment & Teleop · Layer 6',
    title: '1 kHz Hardware-in-the-Loop (HIL) & 1-Click Code Generation',
    badge: 'Deployment & Export',
    badgeColor: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30',
    description: 'Bridge digital twins to physical hardware controllers via 1 kHz EtherCAT/CANopen bridges, ingest hardware DAQ logs, or export clean ROS 2 Humble packages and NVIDIA Isaac Sim 4.2+ code.',
    keyFeatures: [
      'Deploy across 4 tiers: workstation, on-prem cluster, private VPC, or air-gapped SCIF',
      'Webcam MediaPipe 3D hand tracking teleoperating UR10e & Robotiq 2F-85 grippers',
      '1-click production-ready C++ and Python node code generation'
    ],
    targetTab: 'secure-deployment',
    tabLabel: 'Edge-to-Cloud & Export',
    icon: Server,
    proTip: 'Visit the "Export" or "Edge-to-Cloud" tabs to download ready-to-run ROS 2 launch files.'
  },
  {
    id: 'step_7_tutorials',
    stepNumber: 7,
    category: 'Hands-On Labs & Project Library',
    title: 'Interactive Tutorials, Project Blueprints & Tool Showcase',
    badge: '18+ Studios Hub',
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    description: 'Practice with guided step-by-step interactive labs, load production-ready robotics blueprints (Cobot workcell, AMR swarm, laparoscopic wrist, Coandă jet, defence rover), and launch any of our 18+ specialized physical AI studios.',
    keyFeatures: [
      'Interactive parameter sliders with live step verification & syntax-highlighted code',
      '6 production blueprints complete with ROS 2 and Isaac Sim CLI bringup commands',
      'Instant 1-click launcher for all 18+ specialized simulation & verification studios'
    ],
    targetTab: 'tutorials',
    tabLabel: 'Tutorials & Showcase',
    icon: BookOpen,
    proTip: 'Head to "Tutorials & Showcase" in the top navigation bar to explore all guided labs anytime!'
  }
];

interface GettingStartedTourOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenProTrial?: () => void;
}

export const GettingStartedTourOverlay: React.FC<GettingStartedTourOverlayProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenProTrial
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  const step = TOUR_STEPS[currentStepIndex];
  const totalSteps = TOUR_STEPS.length;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;

  const handleNext = () => {
    if (!isLast) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleCompleteTour();
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleJumpToStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  const handleExploreModule = (tab: ActiveTab) => {
    if (dontShowAgain) {
      localStorage.setItem('aigenesis_onboarding_completed', 'true');
    }
    onNavigateTab(tab);
    onClose();
  };

  const handleCompleteTour = () => {
    if (dontShowAgain) {
      localStorage.setItem('aigenesis_onboarding_completed', 'true');
    }
    onClose();
  };

  // Keyboard navigation (Arrow keys + Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (!isLast) setCurrentStepIndex(p => p + 1);
      } else if (e.key === 'ArrowLeft') {
        if (!isFirst) setCurrentStepIndex(p => p - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFirst, isLast, onClose]);

  if (!isOpen) return null;

  const IconComponent = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-mono">
      {/* Tour Modal Card */}
      <div 
        className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background accents */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950 font-bold">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white font-mono">
                  Welcome to AIGENESIS<span className="text-cyan-400">.TECH</span>
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Getting Started Tour
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Explore the {totalSteps} core workflows powering physical AI robotics verification.
              </p>
            </div>
          </div>

          {/* Close 'X' Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close Tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators Bar */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar relative z-10">
          <div className="flex items-center gap-2">
            {TOUR_STEPS.map((s, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isPast = idx < currentStepIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => handleJumpToStep(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : isPast
                      ? 'bg-slate-800/80 text-emerald-400 hover:bg-slate-800'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{idx + 1}.</span>
                  <span className="hidden sm:inline">{s.tabLabel}</span>
                  {isPast && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
              );
            })}
          </div>

          <span className="text-xs text-slate-400 font-mono shrink-0 pl-2">
            Step <strong className="text-cyan-400">{currentStepIndex + 1}</strong> of {totalSteps}
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-950 h-1 relative overflow-hidden">
          <div 
            className="bg-gradient-to-r from-cyan-500 via-emerald-400 to-indigo-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Active Step Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto relative z-10 flex-1">
          {/* Category & Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">
              {step.category}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${step.badgeColor}`}>
              {step.badge}
            </span>
          </div>

          {/* Title with Icon */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-mono leading-tight">
                {step.title}
              </h2>
              <p className="text-sm text-slate-300 font-sans mt-2 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          {/* Key Deliverables Bulleted List */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <span className="text-xs font-bold text-slate-400 uppercase font-mono block">
              Core Capabilities in this Workflow:
            </span>
            <ul className="space-y-2">
              {step.keyFeatures.map((feat, fIdx) => (
                <li key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-200 font-sans">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Tip Box */}
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs font-mono text-cyan-300 flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            <span><strong>Pro Tip:</strong> {step.proTip}</span>
          </div>
        </div>

        {/* Modal Bottom Action Footer Bar */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          {/* Checkbox to remember choice */}
          <label className="flex items-center gap-2 text-xs font-mono text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Don't show this tour on next visit</span>
          </label>

          {/* Navigation & Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 w-full sm:w-auto">
            {/* Direct Jump to Module CTA */}
            <button
              onClick={() => handleExploreModule(step.targetTab)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-bold transition cursor-pointer"
            >
              <span>Explore {step.tabLabel}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Back Button */}
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono font-semibold transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}

            {/* Next / Finish Button */}
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-mono font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer hover:scale-[1.02]"
            >
              <span>{isLast ? 'Complete Tour & Start Building' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
