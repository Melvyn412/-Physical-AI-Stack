import React from 'react';
import { 
  Cpu, Eye, Globe, Brain, Bot, Shield, Sparkles, Play, Layers, Activity, 
  BookOpen, DollarSign, Terminal, Flame, Network, Box, ShieldCheck, Wrench,
  Gauge
} from 'lucide-react';
import { ActiveTab, PlanTier } from '../types';
import { useQuota } from '../hooks/useQuota';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  hasApiKey: boolean;
  onOpenCustomModal: () => void;
  onOpenQuotaModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasApiKey,
  onOpenCustomModal,
  onOpenQuotaModal
}) => {
  const { quota, limits } = useQuota();
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 space-y-2">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-mono">
                AIGENESIS<span className="text-cyan-400">.TECH</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                Physical Stack
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Reasoning • Agents • Multimodality • World Models • Robotics
            </p>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          <button
            id="tab-landing"
            onClick={() => setActiveTab('landing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'landing'
                ? 'bg-gradient-to-r from-cyan-500/30 to-indigo-500/30 text-cyan-300 border border-cyan-500/50 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Services & Platform</span>
          </button>

          <button
            id="tab-simulator"
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'simulator'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>5-Layer Engine</span>
          </button>

          <button
            id="tab-export"
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'export'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>ROS 2 / Isaac</span>
          </button>

          <button
            id="tab-swarm"
            onClick={() => setActiveTab('swarm')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'swarm'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-indigo-400" />
            <span>Swarm Sandbox</span>
          </button>

          <button
            id="tab-kinematics"
            onClick={() => setActiveTab('kinematics')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'kinematics'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-emerald-400" />
            <span>URDF Builder</span>
          </button>

          <button
            id="tab-compliance"
            onClick={() => setActiveTab('compliance')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'compliance'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Safety Audit</span>
          </button>

          <button
            id="tab-pillars"
            onClick={() => setActiveTab('pillars')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'pillars'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>5 Pillars</span>
          </button>

          <button
            id="tab-pricing"
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'pricing'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pricing</span>
          </button>
        </nav>

        {/* Actions & Gemini Status Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quota & Plan Tier Pill */}
          {onOpenQuotaModal && (
            <button
              id="btn-quota-meter-nav"
              onClick={onOpenQuotaModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-cyan-500/40 rounded-lg text-xs font-mono transition-all"
              title="View Plan Quota & Barriers"
            >
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-cyan-300">
                {limits.tier === 'developer' ? 'Free' : limits.tier === 'pro' ? 'Pro' : limits.tier === 'team' ? 'Team' : 'Enterprise'}
              </span>
              <span className="text-[10px] text-slate-400">
                ({quota.aiSynthesesUsed}/{limits.aiSynthesesLimit >= 100000 ? '∞' : limits.aiSynthesesLimit})
              </span>
            </button>
          )}

          <button
            id="btn-custom-objective"
            onClick={onOpenCustomModal}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all border border-emerald-400/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Decompose Custom Goal</span>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span>{hasApiKey ? 'Gemini 3.6 Flash Active' : 'Local Physical Sim Engine'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

