import React from 'react';
import { ShieldCheck, Zap, Activity, ArrowRight, Brain, Globe, Bot, Cpu, Eye, CheckCircle2, XCircle, Sparkles, AlertCircle } from 'lucide-react';

export const ArchitectureImpact: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Paradigm Evolution: From Chatbot to Embodiment</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            Why This 5-Pillar Stack Changes Everything
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            Traditional AI operates as a passive conversational interface—generating text or pixels inside a browser tab. To solve real-world physical objectives (manufacturing, disaster rescue, space coring, surgery), AI requires an integrated physical OS stack.
          </p>
        </div>
      </div>

      {/* Comparison Grid: Traditional LLM Chat vs Embodied Physical Stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traditional Passive AI */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-mono">Passive Chatbot Model</h3>
              <p className="text-xs text-slate-400">Isolated Text / Digital Output</p>
            </div>
          </div>

          <ul className="space-y-3 text-xs font-mono text-slate-400">
            <li className="flex items-start gap-2.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-red-400 font-bold">✕</span>
              <span><strong>No Physical Feedback:</strong> Cannot measure force, weight, friction, or torque.</span>
            </li>
            <li className="flex items-start gap-2.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-red-400 font-bold">✕</span>
              <span><strong>Static World View:</strong> Lacks spatial memory or predictive physical dynamics.</span>
            </li>
            <li className="flex items-start gap-2.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-red-400 font-bold">✕</span>
              <span><strong>Hallucination Risk:</strong> No safety-critical verifier to prevent catastrophic real-world failure.</span>
            </li>
            <li className="flex items-start gap-2.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-red-400 font-bold">✕</span>
              <span><strong>Open-Loop Execution:</strong> Fires a response once without continuous sensor adjustments.</span>
            </li>
          </ul>
        </div>

        {/* Embodied Physical AI Stack */}
        <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 space-y-4 shadow-xl shadow-cyan-500/5">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-mono">AIGENESIS.TECH Objective OS Stack</h3>
              <p className="text-xs text-emerald-400 font-mono">5-Layer Real-World Autonomous Engine</p>
            </div>
          </div>

          <ul className="space-y-3 text-xs font-mono text-slate-200">
            <li className="flex items-start gap-2.5 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>1000Hz Force Compliance:</strong> Actuates motors with sub-millimeter precision and real-time tactile pressure arrays.</span>
            </li>
            <li className="flex items-start gap-2.5 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Generative World Model:</strong> Forecasts gravity, momentum, and obstacle motion $T+n$ seconds ahead.</span>
            </li>
            <li className="flex items-start gap-2.5 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>System 2 Safety Logic:</strong> Verifies formal rules and hazard matrices before hardware execution.</span>
            </li>
            <li className="flex items-start gap-2.5 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Closed-Loop Feedback:</strong> Continuously adjusts motor torques at 120Hz-2000Hz based on sensory shifts.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* The 5 Stack Layers Flow Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Closed-Loop Tech Stack Data Flow</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono text-xs">
          <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Eye className="w-4 h-4" />
              <span>1. Multimodality</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Fuses RGB-D depth, LiDAR point clouds, thermal arrays, and 100-zone tactile pressure.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Globe className="w-4 h-4" />
              <span>2. World Models</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Runs generative 3D spatial rollouts predicting physics, friction, and gravity.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-violet-500/30 space-y-2">
            <div className="flex items-center gap-1.5 text-violet-400 font-bold">
              <Brain className="w-4 h-4" />
              <span>3. Reasoning</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              System 2 Tree-of-Thought planning evaluates safety rules and hazard contingencies.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Bot className="w-4 h-4" />
              <span>4. Agents</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Orchestrates specialized agent swarms into a Directed Acyclic Graph (DAG) of sub-goals.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-pink-500/30 space-y-2">
            <div className="flex items-center gap-1.5 text-pink-400 font-bold">
              <Cpu className="w-4 h-4" />
              <span>5. Robotics</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Streams 1000Hz EtherCAT motor commands with active inverse kinematics and PID torque loops.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
