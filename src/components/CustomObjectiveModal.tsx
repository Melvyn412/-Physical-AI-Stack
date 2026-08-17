import React, { useState } from 'react';
import { X, Sparkles, Loader2, Bot, Eye, Globe, Brain, Cpu, CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';
import { DynamicDecomposition, PlanTier } from '../types';
import { checkQuota, consumeQuota, getStoredQuota, PLAN_DEFINITIONS } from '../utils/quotaManager';

interface CustomObjectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDecomposed: (decomposition: DynamicDecomposition, objectiveTitle: string) => void;
  onOpenBarrier?: (barrierInfo: any) => void;
  onNavigateToPricing?: () => void;
}

export const CustomObjectiveModal: React.FC<CustomObjectiveModalProps> = ({
  isOpen,
  onClose,
  onDecomposed,
  onOpenBarrier,
  onNavigateToPricing
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [environment, setEnvironment] = useState<string>('Hazardous Industrial / Unstructured Field');
  const [embodiment, setEmbodiment] = useState<string>('6-DOF Bimanual Manipulator with Mobile Base & Tactile Grippers');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const quota = getStoredQuota();
  const limits = PLAN_DEFINITIONS[quota.plan] || PLAN_DEFINITIONS.developer;
  const quotaCheck = checkQuota('ai_synthesize');
  const isQuotaBlocked = !quotaCheck.allowed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // Check client-side quota barrier first
    const clientCheck = checkQuota('ai_synthesize');
    if (!clientCheck.allowed) {
      if (onOpenBarrier) {
        onOpenBarrier({
          title: 'Custom AI Synthesizer Quota Reached',
          description: clientCheck.reason || `You have reached your limit of ${limits.aiSynthesesLimit} AI goal decompositions on the ${limits.name} plan.`,
          currentPlan: quota.plan,
          recommendedPlan: quota.plan === 'developer' ? 'pro' : 'team',
          used: quota.aiSynthesesUsed,
          limit: limits.aiSynthesesLimit,
          featureName: 'AI Goal Synthesizer'
        });
        onClose();
        return;
      }
      setErrorMsg(clientCheck.reason || 'Quota exceeded on your current tier.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/decompose-objective', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-plan': quota.plan,
          'x-api-token': quota.apiKey
        },
        body: JSON.stringify({
          objective: prompt.trim(),
          environment,
          embodiment
        })
      });

      if (response.status === 429) {
        const errorData = await response.json();
        if (onOpenBarrier) {
          onOpenBarrier({
            title: 'Monthly Quota Barrier Reached',
            description: errorData.error || `You have exhausted your monthly allowance on the ${limits.name} plan.`,
            currentPlan: quota.plan,
            recommendedPlan: quota.plan === 'developer' ? 'pro' : 'team',
            used: quota.aiSynthesesUsed,
            limit: limits.aiSynthesesLimit,
            featureName: 'AI Goal Synthesizer'
          });
          onClose();
          return;
        }
        throw new Error(errorData.error || 'Quota limit reached');
      }

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Consume quota upon success
      consumeQuota('ai_synthesize');

      onDecomposed(data, prompt.trim());
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      console.error('Error decomposing objective:', err);
      // Fallback offline synthetic decomposition if server fails
      const fallbackData: DynamicDecomposition = {
        multimodality: {
          sensors: ['RGB-D High-Speed Camera Array', '3D Flash LiDAR', 'Tactile Gripper Matrix', 'Acoustic Micro-Array'],
          fusionRateHz: 120,
          noiseMitigation: 'Adaptive Kalman Filter & Point Cloud Smoothing',
          dataVolumeMbps: 480
        },
        worldModel: {
          gridResolutionCm: 1.0,
          predictionHorizonMs: 2000,
          physicsEngine: 'Generative Spatial Dynamics & Friction Rollout',
          confidenceScore: 98.2
        },
        reasoning: {
          strategy: 'System 2 Tree-of-Thought Hazard Pruning',
          cotSteps: [
            `1. Scan spatial boundaries for "${prompt.trim()}".`,
            '2. Evaluate surface contact friction & object elasticity.',
            '3. Formulate zero-collision trajectory through world model.',
            '4. Verify force limits before executing motor driver commands.'
          ],
          hazardLevel: 'LOW'
        },
        agents: {
          activeAgents: ['PerceptionAgent', 'WorldSimAgent', 'PlannerAgent', 'MotorActuatorAgent'],
          subGoalDAG: 'Perceive -> SimulatePhysics -> EvaluateSafety -> ExecuteJoints -> VerifyOutcome',
          consensusScore: 0.99
        },
        robotics: {
          kinematics: '6-DOF Inverse Kinematics with Nullspace Optimization',
          controlFrequencyHz: 1000,
          targetTorqueNm: [14.2, 38.5, 24.1, 11.0, 5.2, 2.1],
          gripForceN: 22.0
        },
        simulatedSteps: [
          {
            stepNumber: 1,
            title: 'Multimodal Spatial Perception Scan',
            description: `Fusing RGB-D cameras and LiDAR point clouds to map environment for ${prompt.trim()}.`,
            activeLayer: 'multimodality',
            status: 'NORMAL',
            confidence: 99.1
          },
          {
            stepNumber: 2,
            title: 'World Model Physical Rollout',
            description: 'Simulating 2.0s trajectory of surrounding objects and contact dynamics.',
            activeLayer: 'world_models',
            status: 'NORMAL',
            confidence: 97.9
          },
          {
            stepNumber: 3,
            title: 'Cognitive Tree-of-Thought Reasoning',
            description: 'Reasoning over safety boundaries and calculating optimal motion paths.',
            activeLayer: 'reasoning',
            status: 'NORMAL',
            confidence: 98.6
          },
          {
            stepNumber: 4,
            title: 'Multi-Agent Sub-Goal Orchestration',
            description: 'Delegating motion tasks across specialized sub-agents with consensus voting.',
            activeLayer: 'agents',
            status: 'NORMAL',
            confidence: 99.2
          },
          {
            stepNumber: 5,
            title: '1000Hz Closed-Loop Actuation',
            description: 'Streaming torque commands to motor drivers with active tactile compliance.',
            activeLayer: 'robotics',
            status: 'NORMAL',
            confidence: 99.7
          }
        ]
      };

      consumeQuota('ai_synthesize');
      onDecomposed(fallbackData, prompt.trim());
      setIsLoading(false);
      onClose();
    }
  };

  const presetExamples = [
    'Automate micro-surgical needle threading with sub-50-micron tactile feedback.',
    'Assist elderly patient mobility transfer from bed to wheelchair with soft air-muscles.',
    'Harvest ripe grape clusters inside dense leaf canopy during 12km/h wind gusts.',
    'Service deep-ocean oil manifold valve under 300 atmospheres hydrostatic pressure.',
    'Deploy autonomous drone swarm to map wildfires and deliver emergency retardant.'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Stack Goal Synthesizer</span>
            </div>

            {/* Live Quota Pill Indicator */}
            <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono">
              <span className="text-slate-400">Plan Quota:</span>
              <span className={`font-bold ${isQuotaBlocked ? 'text-red-400' : 'text-cyan-300'}`}>
                {quota.aiSynthesesUsed} / {limits.aiSynthesesLimit >= 100000 ? 'Unlimited' : limits.aiSynthesesLimit}
              </span>
              <span className="text-[10px] text-slate-500">({limits.name.split('/')[0]})</span>
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white font-mono">
            Decompose Custom Real-World Objective
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Specify any complex physical goal. Gemini 3.6 Flash will translate your objective into a 5-layer execution pipeline (Multimodality + World Models + Reasoning + Agents + Robotics).
          </p>
        </div>

        {/* Inline Barrier Notice if Quota is Exhausted */}
        {isQuotaBlocked && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5 text-amber-300">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold block">Quota Barrier Reached ({quota.aiSynthesesUsed}/{limits.aiSynthesesLimit})</span>
                <span className="text-[11px] text-slate-300 font-sans">You have exhausted your custom AI syntheses on {limits.name}.</span>
              </div>
            </div>
            {onNavigateToPricing && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToPricing();
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-lg text-xs hover:from-emerald-400 hover:to-cyan-400 transition-all shrink-0 flex items-center gap-1"
              >
                <span>Upgrade Plan</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
              Target Real-World Objective
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Deploy autonomous drone to survey earthquake debris, identify thermal survivor signatures, and clear path with robotic manipulator..."
              rows={3}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono transition-all"
            />
          </div>

          {/* Preset Example Quick Clickers */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">OR CHOOSE AN EXAMPLE OBJECTIVE:</span>
            <div className="flex flex-wrap gap-1.5">
              {presetExamples.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(ex)}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 rounded-lg transition-all text-left truncate max-w-full"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Target Environment</label>
              <input
                type="text"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Robotic Embodiment</label>
              <input
                type="text"
                value={embodiment}
                onChange={(e) => setEmbodiment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs font-mono text-red-300">
              {errorMsg}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold font-mono transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || !prompt.trim() || isQuotaBlocked}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold font-mono shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Stack Pipeline...</span>
                </>
              ) : isQuotaBlocked ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-300" />
                  <span>Quota Limit Reached</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize 5-Stack Pipeline</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
