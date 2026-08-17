import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ChevronRight, ChevronLeft, X, Play, CheckCircle2, 
  HelpCircle, Eye, Layers, Brain, Bot, Move3D, Terminal, Rocket, Lightbulb
} from 'lucide-react';

export interface TourStep {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  targetId?: string;
  badge: string;
  tip: string;
  actionText?: string;
  action?: () => void;
}

interface OnboardingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCustomModal: () => void;
  onSelectTab?: (tab: string) => void;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  isOpen,
  onClose,
  onOpenCustomModal,
  onSelectTab
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Auto scroll into view or highlight target elements when step changes
  useEffect(() => {
    if (!isOpen) return;
    const steps = getSteps();
    const step = steps[currentStepIndex];
    if (step && step.targetId) {
      const el = document.getElementById(step.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStepIndex, isOpen]);

  if (!isOpen) return null;

  const getSteps = (): TourStep[] => [
    {
      title: "Welcome to AIGENESIS.TECH Physical AI Executor",
      subtitle: "Deconstructing Real-World Physical Intelligence",
      description: "This interactive workspace converts high-level human objectives into closed-loop physical execution pipelines across 5 integrated stack pillars: Multimodality, World Models, System 2 Reasoning, Swarm Agents, and Robotics.",
      icon: Sparkles,
      badge: "Step 1 of 5 • Overview",
      tip: "Use this workspace to simulate, inspect, and verify physical AI deployments before transferring code to real robots.",
      targetId: "objective-executor-header"
    },
    {
      title: "Select or Synthesize Objective Missions",
      subtitle: "Preset Scenarios & Custom AI Goal Generator",
      description: "Choose from pre-configured high-stakes missions—such as Subsea Pipeline Repair, Surgical Suturing, and Space Rovers—or click '+ New Custom Goal' to decompose any physical task in natural language.",
      icon: Rocket,
      badge: "Step 2 of 5 • Goal Selector",
      tip: "You can prompt Gemini to synthesize customized multi-pillar plans for any robotic embodiment.",
      targetId: "btn-trigger-custom",
      actionText: "Try Custom Goal Modal",
      action: () => {
        onClose();
        onOpenCustomModal();
      }
    },
    {
      title: "Real-Time 1000Hz Physics Simulator",
      subtitle: "3D WebGL vs 2D Diagram Views",
      description: "Watch spatial trajectory generation, obstacle avoidance, and end-effector kinematics in real-time. Toggle between the high-fidelity 3D WebGL physics canvas and the 2D spatial layout diagram.",
      icon: Move3D,
      badge: "Step 3 of 5 • Physics Canvas",
      tip: "Use your mouse to drag, rotate, and zoom the 3D scene. The simulator reflects real-time closed-loop torque feedback.",
      targetId: "sim-canvas-container"
    },
    {
      title: "5-Stack Execution Sequence Pipeline",
      subtitle: "Step-by-Step Task Decomposition",
      description: "Real-world goals are broken down into sequential steps. Click any step button (Step 01 - 05) to isolate its active stack pillar, hazard status, and execution confidence.",
      icon: Layers,
      badge: "Step 4 of 5 • Pipeline Controls",
      tip: "Notice how safety guardrails verify force limits and clearance distances before motor driver actuation.",
      targetId: "execution-sequence-container"
    },
    {
      title: "Telemetry & CoT Inspection Terminal",
      subtitle: "Deep-Dive Cognitive & Hardware State",
      description: "Inspect live Chain-of-Thought (CoT) reasoning, sub-goal Agent Swarm DAGs, generative physics rollouts, and EtherCAT motor joint torque vectors in real time.",
      icon: Terminal,
      badge: "Step 5 of 5 • Inspector Terminal",
      tip: "Switch between the tabs to audit System 2 cognitive decision steps and motor torque values.",
      targetId: "telemetry-terminal-container"
    }
  ];

  const steps = getSteps();
  const currentStep = steps[currentStepIndex];
  const IconComponent = currentStep.icon;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-cyan-500/10">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl">
              <IconComponent className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase tracking-wider">
                {currentStep.badge}
              </span>
              <h3 className="text-lg font-bold text-white mt-1">{currentStep.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all"
            title="Close Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Body */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
            {currentStep.subtitle}
          </h4>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            {currentStep.description}
          </p>

          {/* Pro Tip Box */}
          <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <strong className="text-amber-400 font-bold block mb-0.5">Pro Tip:</strong>
              {currentStep.tip}
            </div>
          </div>

          {/* Optional Action Button */}
          {currentStep.actionText && currentStep.action && (
            <div className="pt-2">
              <button
                onClick={currentStep.action}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl border border-emerald-400/30 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{currentStep.actionText}</span>
              </button>
            </div>
          )}
        </div>

        {/* Step Navigation Dots & Controls */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-5">
          {/* Progress Dots */}
          <div className="flex items-center gap-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'w-6 bg-cyan-400'
                    : idx < currentStepIndex
                    ? 'w-2 bg-cyan-600/60'
                    : 'w-2 bg-slate-800'
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center gap-3">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20"
            >
              <span>{currentStepIndex === steps.length - 1 ? "Finish Tour" : "Next Step"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
