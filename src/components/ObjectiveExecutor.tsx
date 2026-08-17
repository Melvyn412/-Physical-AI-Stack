import React, { useState } from 'react';
import { ObjectiveScenario, StackPillar, DynamicDecomposition } from '../types';
import { PRESET_SCENARIOS } from '../data/scenariosData';
import { PhysicalSimulationCanvas } from './PhysicalSimulationCanvas';
import { PhysicalSimulationCanvas3D } from './PhysicalSimulationCanvas3D';
import { OnboardingOverlay } from './OnboardingOverlay';
import { 
  Play, Pause, SkipForward, ShieldAlert, Cpu, Package, Rocket, CheckCircle2, 
  AlertTriangle, Eye, Globe, Brain, Bot, Sparkles, Activity, Layers, Terminal, ChevronRight, RefreshCw, Wand2, Move3D, Layers3,
  Stethoscope, Heart, Sprout, Anchor, HelpCircle, Compass
} from 'lucide-react';

interface ObjectiveExecutorProps {
  customDecomposition: DynamicDecomposition | null;
  customObjectiveTitle: string | null;
  onOpenCustomModal: () => void;
}

export const ObjectiveExecutor: React.FC<ObjectiveExecutorProps> = ({
  customDecomposition,
  customObjectiveTitle,
  onOpenCustomModal
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('search-and-rescue');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simMode, setSimMode] = useState<'3d' | '2d'>('3d');
  const [activeDetailTab, setActiveDetailTab] = useState<'pipeline' | 'reasoning' | 'agents' | 'world_model' | 'telemetry'>('pipeline');
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);

  // Selected scenario preset
  const scenarioPreset = PRESET_SCENARIOS.find(s => s.id === selectedScenarioId) || PRESET_SCENARIOS[0];

  // If custom decomposition exists and user wants to view it, merge or construct dynamic scenario
  const currentScenario: ObjectiveScenario = (customDecomposition && selectedScenarioId === 'custom')
    ? {
        id: 'custom',
        title: customObjectiveTitle || 'Custom Physical Objective',
        category: 'Custom AI Stack Execution',
        icon: 'Sparkles',
        environment: 'Dynamic Custom Physical Environment',
        embodiment: 'Adaptive 6-DOF Embodiment with Bimanual Tactile Grippers',
        difficulty: 'Standard',
        targetGoal: customObjectiveTitle || 'Decomposed Objective Goal',
        description: 'Dynamically synthesized real-world execution plan powered by Gemini 3.6 Flash.',
        defaultMultimodal: {
          sensors: customDecomposition.multimodality.sensors,
          fusionRateHz: customDecomposition.multimodality.fusionRateHz,
          noiseMitigation: customDecomposition.multimodality.noiseMitigation,
          dataVolumeMbps: customDecomposition.multimodality.dataVolumeMbps || 450
        },
        defaultWorldModel: {
          gridResolutionCm: customDecomposition.worldModel.gridResolutionCm || 1.0,
          predictionHorizonMs: customDecomposition.worldModel.predictionHorizonMs || 2000,
          physicsEngine: customDecomposition.worldModel.physicsEngine,
          confidenceScore: customDecomposition.worldModel.confidenceScore
        },
        defaultReasoning: {
          strategy: customDecomposition.reasoning.strategy,
          cotSteps: customDecomposition.reasoning.cotSteps,
          hazardLevel: (customDecomposition.reasoning.hazardLevel as any) || 'LOW'
        },
        defaultAgents: {
          activeAgents: customDecomposition.agents.activeAgents,
          subGoalDAG: customDecomposition.agents.subGoalDAG,
          consensusScore: customDecomposition.agents.consensusScore || 0.99
        },
        defaultRobotics: {
          kinematics: customDecomposition.robotics.kinematics,
          controlFrequencyHz: customDecomposition.robotics.controlFrequencyHz,
          targetTorqueNm: customDecomposition.robotics.targetTorqueNm || [12.4, 32.1, 18.5, 9.2, 4.1],
          gripForceN: customDecomposition.robotics.gripForceN
        },
        steps: customDecomposition.simulatedSteps.map(s => ({
          stepNumber: s.stepNumber,
          title: s.title,
          description: s.description,
          activeLayer: (s.activeLayer.toLowerCase().includes('multi') ? 'multimodality' :
                       s.activeLayer.toLowerCase().includes('world') ? 'world_models' :
                       s.activeLayer.toLowerCase().includes('reason') ? 'reasoning' :
                       s.activeLayer.toLowerCase().includes('agent') ? 'agents' : 'robotics') as StackPillar,
          status: (s.status as any) || 'NORMAL',
          confidence: s.confidence
        }))
      }
    : scenarioPreset;

  const getScenarioIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert': return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'Stethoscope': return <Stethoscope className="w-4 h-4 text-rose-400" />;
      case 'Heart': return <Heart className="w-4 h-4 text-pink-400" />;
      case 'Sprout': return <Sprout className="w-4 h-4 text-emerald-400" />;
      case 'Anchor': return <Anchor className="w-4 h-4 text-cyan-400" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'Package': return <Package className="w-4 h-4 text-amber-400" />;
      case 'Rocket': return <Rocket className="w-4 h-4 text-indigo-400" />;
      default: return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getShortTitle = (scenario: ObjectiveScenario) => {
    switch (scenario.id) {
      case 'search-and-rescue': return 'Disaster Rescue';
      case 'surgical-robotics': return 'Surgical Suturing';
      case 'patient-caregiver': return 'Patient Caregiver';
      case 'smart-agriculture': return 'Vineyard Harvest';
      case 'subsea-pipeline': return 'Subsea Pipeline';
      case 'micro-assembly': return 'Micro Assembly';
      case 'warehouse-sorting': return 'Warehouse Sort';
      case 'extraterrestrial-rover': return 'Space Rover';
      default: return scenario.title.split(' ')[0];
    }
  };

  const currentStep = currentScenario.steps[activeStepIndex] || currentScenario.steps[0];

  const handleNextStep = () => {
    setActiveStepIndex(prev => (prev + 1) % currentScenario.steps.length);
  };

  const handleReset = () => {
    setActiveStepIndex(0);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Scenario Selector & Objective Info */}
      <div id="objective-executor-header" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
                ACTIVE PHYSICAL OBJECTIVE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">
                {currentScenario.category}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1 font-mono">{currentScenario.title}</h2>
          </div>

          {/* Scenario Selector Pills & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_SCENARIOS.map(scenario => (
              <button
                key={scenario.id}
                id={`scenario-btn-${scenario.id}`}
                onClick={() => {
                  setSelectedScenarioId(scenario.id);
                  setActiveStepIndex(0);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                  selectedScenarioId === scenario.id && selectedScenarioId !== 'custom'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md font-bold'
                    : 'bg-slate-950/80 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {getScenarioIcon(scenario.icon)}
                <span>{getShortTitle(scenario)}</span>
              </button>
            ))}

            {customDecomposition && (
              <button
                id="scenario-btn-custom"
                onClick={() => {
                  setSelectedScenarioId('custom');
                  setActiveStepIndex(0);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                  selectedScenarioId === 'custom'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-md font-bold'
                    : 'bg-slate-950/80 text-emerald-400/80 border border-emerald-900/50 hover:bg-emerald-950/30'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Custom Objective</span>
              </button>
            )}

            <button
              id="btn-guided-tour"
              onClick={() => setIsTourOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-semibold shadow-md transition-all font-mono"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
              <span>Guided Tour</span>
            </button>

            <button
              id="btn-trigger-custom"
              onClick={onOpenCustomModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all border border-emerald-400/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ New Custom Goal</span>
            </button>
          </div>
        </div>

        {/* Target Goal Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">TARGET PHYSICAL OBJECTIVE</span>
            <span className="text-slate-200 font-semibold block mt-0.5">{currentScenario.targetGoal}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">OPERATIONAL ENVIRONMENT</span>
            <span className="text-cyan-300 block mt-0.5">{currentScenario.environment}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">ROBOTIC EMBODIMENT</span>
            <span className="text-emerald-300 block mt-0.5">{currentScenario.embodiment}</span>
          </div>
        </div>
      </div>

      {/* View Mode Bar: 3D WebGL Physics vs 2D Plan View */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Move3D className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Real-Time Physical Simulation Engine
          </span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-semibold">
            {simMode === '3d' ? '3D WebGL WebGL-1000Hz' : '2D Spatial Layout'}
          </span>
        </div>

        {/* 3D vs 2D Toggle Switch */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            id="toggle-sim-mode-3d"
            onClick={() => setSimMode('3d')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              simMode === '3d'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Move3D className="w-3.5 h-3.5" />
            <span>3D WebGL View</span>
          </button>

          <button
            id="toggle-sim-mode-2d"
            onClick={() => setSimMode('2d')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              simMode === '2d'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers3 className="w-3.5 h-3.5" />
            <span>2D Diagram View</span>
          </button>
        </div>
      </div>

      {/* Real-Time Physical Simulator Component (3D or 2D) */}
      <div id="sim-canvas-container">
        {simMode === '3d' ? (
          <PhysicalSimulationCanvas3D
            scenario={currentScenario}
            activeStepIndex={activeStepIndex}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onNextStep={handleNextStep}
            onReset={handleReset}
            activePillarHighlight={currentStep.activeLayer}
          />
        ) : (
          <PhysicalSimulationCanvas
            scenario={currentScenario}
            activeStepIndex={activeStepIndex}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onNextStep={handleNextStep}
            onReset={handleReset}
            activePillarHighlight={currentStep.activeLayer}
          />
        )}
      </div>

      {/* Step-by-Step Execution Pipeline Control Bar */}
      <div id="execution-sequence-container" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              5-Stack Execution Sequence
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Step {activeStepIndex + 1} of {currentScenario.steps.length}
          </span>
        </div>

        {/* Visual Progress Steps Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {currentScenario.steps.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            const isDone = idx < activeStepIndex;
            return (
              <button
                key={idx}
                id={`step-btn-${idx}`}
                onClick={() => {
                  setActiveStepIndex(idx);
                  setIsPlaying(false);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 border-cyan-400 text-white ring-1 ring-cyan-400/30 shadow-lg'
                    : isDone
                    ? 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className={isActive ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                    STEP 0{step.stepNumber}
                  </span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-xs font-semibold truncate font-mono">{step.title}</div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase font-mono tracking-tight">
                  {step.activeLayer}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Deep-Dive Live Telemetry & Inspector Tabs */}
      <div id="telemetry-terminal-container" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-slate-950/90 border-b border-slate-800/90">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white uppercase tracking-wider">Telemetry & Inspection Terminal</span>
          </div>

          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              id="inspector-tab-pipeline"
              onClick={() => setActiveDetailTab('pipeline')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeDetailTab === 'pipeline' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Step Details
            </button>
            <button
              id="inspector-tab-reasoning"
              onClick={() => setActiveDetailTab('reasoning')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeDetailTab === 'reasoning' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Reasoning CoT
            </button>
            <button
              id="inspector-tab-agents"
              onClick={() => setActiveDetailTab('agents')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeDetailTab === 'agents' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Agent Swarm DAG
            </button>
            <button
              id="inspector-tab-worldmodel"
              onClick={() => setActiveDetailTab('world_model')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeDetailTab === 'world_model' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              World Model Rollout
            </button>
            <button
              id="inspector-tab-telemetry"
              onClick={() => setActiveDetailTab('telemetry')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeDetailTab === 'telemetry' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Motor Torques
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeDetailTab === 'pipeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs">
                      Step {currentStep.stepNumber}
                    </span>
                    <span>{currentStep.title}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">{currentStep.description}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">STEP CONFIDENCE</span>
                  <span className="text-emerald-400 font-bold text-lg font-mono">{currentStep.confidence}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">ACTIVE STACK PILLAR</span>
                  <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>{currentStep.activeLayer.toUpperCase()}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Processes input tokens at high frequency, passing latent state representations downstream to maintain closed-loop real-world feedback.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">SAFETY & HAZARD VERIFICATION</span>
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                    <span>STATUS: {currentStep.status} (Passes Safety Boundaries)</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Formal logic safety verifiers inspect force limits, collision clearances, and temperature parameters before motor driver actuation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeDetailTab === 'reasoning' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <Brain className="w-4 h-4 text-violet-400" />
                  <span>Chain-of-Thought (CoT) Cognitive Decision Steps</span>
                </h4>
                <span className="text-xs font-mono text-slate-400">
                  Strategy: <strong className="text-violet-300">{currentScenario.defaultReasoning.strategy}</strong>
                </span>
              </div>

              <div className="space-y-2">
                {currentScenario.defaultReasoning.cotSteps.map((step, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold shrink-0">
                      0{idx + 1}
                    </span>
                    <p className="text-slate-200 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeDetailTab === 'agents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span>Autonomous Agent Swarm & Sub-Goal DAG</span>
                </h4>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Consensus Score: {currentScenario.defaultAgents.consensusScore * 100}%
                </span>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <div>
                  <span className="text-slate-500 uppercase block text-[10px]">SUB-GOAL DIRECTED ACYCLIC GRAPH (DAG)</span>
                  <div className="p-2.5 bg-slate-900 rounded-lg text-amber-300 font-semibold mt-1">
                    {currentScenario.defaultAgents.subGoalDAG}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 uppercase block text-[10px] mb-1.5">ACTIVE SWARM AGENT INSTANCES</span>
                  <div className="flex flex-wrap gap-2">
                    {currentScenario.defaultAgents.activeAgents.map((agent, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold text-xs">
                        🤖 {agent}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeDetailTab === 'world_model' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Generative Physics World Model Rollout</span>
                </h4>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Rollout Horizon: {currentScenario.defaultWorldModel.predictionHorizonMs} ms
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">PHYSICS ENGINE COUPLING</span>
                  <span className="text-emerald-300 font-bold block mt-1">{currentScenario.defaultWorldModel.physicsEngine}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">SPATIAL GRID RESOLUTION</span>
                  <span className="text-cyan-300 font-bold block mt-1">{currentScenario.defaultWorldModel.gridResolutionCm} cm Occupancy Grid</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">MODEL FORECAST CONFIDENCE</span>
                  <span className="text-emerald-400 font-bold block mt-1">{currentScenario.defaultWorldModel.confidenceScore}% Accuracy</span>
                </div>
              </div>
            </div>
          )}

          {activeDetailTab === 'telemetry' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-pink-400" />
                  <span>Robotic Joint Torques & EtherCAT Motor Telemetry</span>
                </h4>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  Control Loop Rate: {currentScenario.defaultRobotics.controlFrequencyHz} Hz
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-mono">
                {currentScenario.defaultRobotics.targetTorqueNm.map((torque, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                    <span className="text-slate-500 text-[10px] block">JOINT 0{idx + 1}</span>
                    <span className="text-pink-400 font-bold text-sm block">{torque} Nm</span>
                    <span className="text-[9px] text-slate-400 block">PID CLOSED-LOOP</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Guided Interactive Onboarding Overlay */}
      <OnboardingOverlay
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onOpenCustomModal={onOpenCustomModal}
      />
    </div>
  );
};
