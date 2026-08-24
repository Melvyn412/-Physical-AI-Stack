import React from 'react';
import { 
  Cpu, Globe, Activity, Compass, Sliders, Target, GitFork, 
  Terminal, Network, Box, ShieldCheck, Layers, DollarSign, 
  Gauge, Sparkles
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

interface NavItem {
  id: string;
  tab: ActiveTab;
  label: string;
  icon: React.ElementType;
  activeColor: string;
  badge?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasApiKey,
  onOpenCustomModal,
  onOpenQuotaModal
}) => {
  const { quota, limits } = useQuota();

  const navItems: NavItem[] = [
    {
      id: 'tab-landing',
      tab: 'landing',
      label: 'Services & Overview',
      icon: Globe,
      activeColor: 'bg-cyan-500 text-slate-950 shadow-cyan-500/25 border-cyan-400 font-bold'
    },
    {
      id: 'tab-simulator',
      tab: 'simulator',
      label: '5-Layer Engine',
      icon: Activity,
      activeColor: 'bg-cyan-500 text-slate-950 shadow-cyan-500/25 border-cyan-400 font-bold'
    },
    {
      id: 'tab-slam',
      tab: 'slam',
      label: 'SLAM Studio',
      icon: Compass,
      activeColor: 'bg-emerald-500 text-slate-950 shadow-emerald-500/25 border-emerald-400 font-bold'
    },
    {
      id: 'tab-pid',
      tab: 'pid',
      label: 'PID Studio',
      icon: Sliders,
      activeColor: 'bg-purple-500 text-slate-950 shadow-purple-500/25 border-purple-400 font-bold'
    },
    {
      id: 'tab-ik',
      tab: 'ik',
      label: 'IK & MoveIt 2',
      icon: Target,
      activeColor: 'bg-sky-500 text-slate-950 shadow-sky-500/25 border-sky-400 font-bold'
    },
    {
      id: 'tab-bt',
      tab: 'bt',
      label: 'Behavior Trees',
      icon: GitFork,
      activeColor: 'bg-amber-500 text-slate-950 shadow-amber-500/25 border-amber-400 font-bold'
    },
    {
      id: 'tab-export',
      tab: 'export',
      label: 'ROS 2 / Isaac Sim',
      icon: Terminal,
      activeColor: 'bg-indigo-500 text-slate-950 shadow-indigo-500/25 border-indigo-400 font-bold'
    },
    {
      id: 'tab-swarm',
      tab: 'swarm',
      label: 'Swarm Sandbox',
      icon: Network,
      activeColor: 'bg-teal-500 text-slate-950 shadow-teal-500/25 border-teal-400 font-bold'
    },
    {
      id: 'tab-kinematics',
      tab: 'kinematics',
      label: 'URDF Builder',
      icon: Box,
      activeColor: 'bg-emerald-500 text-slate-950 shadow-emerald-500/25 border-emerald-400 font-bold'
    },
    {
      id: 'tab-compliance',
      tab: 'compliance',
      label: 'Safety Audit',
      icon: ShieldCheck,
      activeColor: 'bg-amber-500 text-slate-950 shadow-amber-500/25 border-amber-400 font-bold'
    },
    {
      id: 'tab-pillars',
      tab: 'pillars',
      label: '5 Pillars',
      icon: Layers,
      activeColor: 'bg-cyan-500 text-slate-950 shadow-cyan-500/25 border-cyan-400 font-bold'
    },
    {
      id: 'tab-pricing',
      tab: 'pricing',
      label: 'Pricing',
      icon: DollarSign,
      activeColor: 'bg-emerald-500 text-slate-950 shadow-emerald-500/25 border-emerald-400 font-bold'
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-6 lg:px-8 py-3 shadow-2xl space-y-3">
      {/* Top Header Row: Brand & Quick Action Pills */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Tagline */}
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 via-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white font-mono">
                AIGENESIS<span className="text-cyan-400">.TECH</span>
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                Physical Stack
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Reasoning • Agents • Multimodality • World Models • Robotics
            </p>
          </div>
        </div>

        {/* Action Pills & Status */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Quota & Plan Tier Pill */}
          {onOpenQuotaModal && (
            <button
              id="btn-quota-meter-nav"
              onClick={onOpenQuotaModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/60 rounded-full text-xs font-mono transition-all shadow-sm"
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

          {/* Custom Objective Pill Button */}
          <button
            id="btn-custom-objective"
            onClick={onOpenCustomModal}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-full text-xs font-semibold shadow-md shadow-cyan-600/20 hover:shadow-cyan-500/30 transition-all border border-emerald-400/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span className="whitespace-nowrap">Decompose Custom Goal</span>
          </button>

          {/* Engine Status Pill */}
          <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300 shadow-inner">
            <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span>{hasApiKey ? 'Gemini 3.6 Flash Active' : 'Physical Sim Engine'}</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Pill Navigation Bar */}
      <div className="max-w-7xl mx-auto">
        <nav 
          aria-label="Main Navigation"
          className="flex items-center gap-1.5 p-1.5 rounded-full bg-slate-900/80 border border-slate-800/90 shadow-inner overflow-x-auto no-scrollbar scroll-smooth"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;

            return (
              <button
                key={item.id}
                id={item.id}
                onClick={() => setActiveTab(item.tab)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? `${item.activeColor} shadow-md border-transparent`
                    : 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent hover:border-slate-700/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className="font-mono tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
