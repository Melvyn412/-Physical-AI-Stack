import React from 'react';
import { 
  Cpu, Globe, Activity, Compass, Sliders, Target, GitFork, 
  Terminal, Network, Box, ShieldCheck, Layers, DollarSign, 
  Gauge, Sparkles, Boxes, Zap, BarChart3, Hand, RefreshCw, Wind, FileCheck, AlertOctagon, Scale, Calendar, Database, Stethoscope, Shield, Server, Film, HelpCircle
} from 'lucide-react';
import { ActiveTab, PlanTier } from '../types';
import { useQuota } from '../hooks/useQuota';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  hasApiKey: boolean;
  onOpenCustomModal: () => void;
  onOpenQuotaModal?: () => void;
  onOpenProTrialModal?: () => void;
  onOpenBarrier?: (barrierInfo: any) => void;
  onSwitchPlan?: (plan: PlanTier) => void;
  onOpenTour?: () => void;
}

export interface NavItemConfig {
  id: string;
  tab: ActiveTab;
  label: string;
  icon: React.ElementType;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'tab-landing',
    tab: 'landing',
    label: 'Overview',
    icon: Globe
  },
  {
    id: 'tab-simulator',
    tab: 'simulator',
    label: '5-Layer Engine',
    icon: Activity
  },
  {
    id: 'tab-flywheel',
    tab: 'flywheel',
    label: 'Data Flywheel',
    icon: RefreshCw
  },
  {
    id: 'tab-coanda',
    tab: 'coanda',
    label: 'Coandă Fluidic Twin',
    icon: Wind
  },
  {
    id: 'tab-teleop',
    tab: 'teleop',
    label: 'UR10e Vision Teleop',
    icon: Hand
  },
  {
    id: 'tab-slam',
    tab: 'slam',
    label: 'SLAM Studio',
    icon: Compass
  },
  {
    id: 'tab-pid',
    tab: 'pid',
    label: 'PID Studio',
    icon: Sliders
  },
  {
    id: 'tab-ik',
    tab: 'ik',
    label: 'IK & MoveIt 2',
    icon: Target
  },
  {
    id: 'tab-bt',
    tab: 'bt',
    label: 'Behavior Trees',
    icon: GitFork
  },
  {
    id: 'tab-export',
    tab: 'export',
    label: 'ROS 2 / Isaac Sim',
    icon: Terminal
  },
  {
    id: 'tab-kinematics',
    tab: 'kinematics',
    label: 'URDF Builder',
    icon: Box
  },
  {
    id: 'tab-cad',
    tab: 'cad',
    label: 'CAD Studio',
    icon: Boxes
  },
  {
    id: 'tab-mechanism-sim',
    tab: 'mechanism-sim',
    label: 'Mechanism Studio',
    icon: Cpu
  },
  {
    id: 'tab-innovations',
    tab: 'innovations',
    label: 'Innovations Lab',
    icon: Sparkles
  },
  {
    id: 'tab-analytics',
    tab: 'analytics',
    label: 'Executive Analytics',
    icon: BarChart3
  },
  {
    id: 'tab-swarm',
    tab: 'swarm',
    label: 'Swarm Sandbox',
    icon: Network
  },
  {
    id: 'tab-compliance',
    tab: 'compliance',
    label: 'Safety Audit',
    icon: ShieldCheck
  },
  {
    id: 'tab-vv-evidence',
    tab: 'vv-evidence',
    label: 'V&V Evidence Pack',
    icon: FileCheck
  },
  {
    id: 'tab-fault-injection',
    tab: 'fault-injection',
    label: 'Fault Injection',
    icon: AlertOctagon
  },
  {
    id: 'tab-twin-trust',
    tab: 'twin-trust',
    label: 'Twin Trust',
    icon: Scale
  },
  {
    id: 'tab-scenario-gen',
    tab: 'scenario-gen',
    label: 'Scenario Gen',
    icon: Calendar
  },
  {
    id: 'tab-synthetic-data',
    tab: 'synthetic-data',
    label: 'Synthetic Data',
    icon: Database
  },
  {
    id: 'tab-surgical-vv',
    tab: 'surgical-vv',
    label: 'Surgical V&V',
    icon: Stethoscope
  },
  {
    id: 'tab-defense-pack',
    tab: 'defense-pack',
    label: 'Defence Pack',
    icon: Shield
  },
  {
    id: 'tab-secure-deployment',
    tab: 'secure-deployment',
    label: 'Edge-to-Cloud',
    icon: Server
  },
  {
    id: 'tab-video-producer',
    tab: 'video-producer',
    label: 'Auto Video Maker',
    icon: Film
  },
  {
    id: 'tab-pillars',
    tab: 'pillars',
    label: '5 Pillars',
    icon: Layers
  }
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasApiKey,
  onOpenCustomModal,
  onOpenQuotaModal,
  onOpenProTrialModal,
  onOpenTour
}) => {
  const { quota, limits } = useQuota();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3 shadow-2xl space-y-3 font-mono">
      {/* Top Header Row: Brand, Custom Goal Action, Quota Pill, and Status */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand & Tagline */}
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
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
            <p className="text-xs text-slate-400 hidden sm:block font-sans">
              Reasoning • Agents • Multimodality • World Models • Robotics
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-2.5">
          {/* Getting Started Tour Button */}
          {onOpenTour && (
            <button
              id="btn-tour-nav"
              onClick={onOpenTour}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 rounded-full text-xs font-mono font-bold transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
              title="Launch Getting Started Interactive Workflow Tour"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Getting Started</span>
            </button>
          )}
          {/* 14-Day Pro Trial Button / Active Pill */}
          {quota.isTrialActive ? (
            <button
              id="btn-trial-active-nav"
              onClick={() => {
                if (onOpenProTrialModal) onOpenProTrialModal();
                else setActiveTab('pricing');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 to-indigo-500/15 border border-emerald-500/40 hover:border-emerald-400 rounded-full text-xs font-mono text-emerald-300 transition-all shadow-sm cursor-pointer hover:scale-[1.02]"
              title="14-Day Pro Trial Active (No Credit Card Required)"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/30" />
              <span className="font-bold text-slate-200">Pro Trial:</span>
              <span className="text-emerald-400 font-bold">{quota.trialDaysRemaining ?? 14}d left</span>
            </button>
          ) : quota.plan === 'developer' ? (
            <button
              id="btn-start-trial-nav"
              onClick={() => {
                if (onOpenProTrialModal) onOpenProTrialModal();
                else setActiveTab('pricing');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-indigo-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 text-cyan-200 hover:text-white border border-cyan-500/40 hover:border-cyan-400 rounded-full text-xs font-mono font-bold transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
              title="Start 14-Day Free Pro Trial (No Credit Card Required)"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>14-Day Pro Trial</span>
              <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-500/20 rounded-full">No Card</span>
            </button>
          ) : null}

          {/* Executive Analytics Pill */}
          <button
            id="btn-analytics-nav"
            onClick={() => setActiveTab('analytics')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all shadow-sm cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-cyan-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/60'
            }`}
            title="Open Executive Analytics & Visitor Telemetry Console"
          >
            <BarChart3 className={`w-3.5 h-3.5 ${activeTab === 'analytics' ? 'text-slate-950' : 'text-cyan-400'}`} />
            <span className="font-semibold">Analytics</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>

          {/* Pricing & Plans Button */}
          <button
            id="btn-pricing-nav"
            onClick={() => setActiveTab('pricing')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all shadow-sm cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-amber-400/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-amber-400/60'
            }`}
            title="View Pricing & Plans"
          >
            <DollarSign className={`w-3.5 h-3.5 ${activeTab === 'pricing' ? 'text-slate-950' : 'text-amber-400'}`} />
            <span className="font-semibold">Pricing</span>
          </button>

          {/* Quota & Usage Meter Pill */}
          {onOpenQuotaModal && (
            <button
              id="btn-quota-meter-nav"
              onClick={onOpenQuotaModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/60 rounded-full text-xs font-mono transition-all shadow-sm cursor-pointer"
              title="View Workspace Quota & Rate Limits"
            >
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-slate-300">Quota</span>
              <span className="text-[10px] text-cyan-400 font-bold">
                {quota.aiSynthesesUsed}/{limits.aiSynthesesLimit >= 100000 ? '∞' : limits.aiSynthesesLimit}
              </span>
            </button>
          )}

          {/* Custom Objective Button */}
          <button
            id="btn-custom-objective"
            onClick={onOpenCustomModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-full text-xs font-semibold shadow-md shadow-cyan-600/20 hover:shadow-cyan-500/30 transition-all border border-emerald-400/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span className="whitespace-nowrap">Decompose Goal</span>
          </button>

          {/* Engine Status Pill */}
          <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 shadow-inner">
            <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span>{hasApiKey ? 'Gemini AI' : '1 kHz Engine'}</span>
          </div>
        </div>
      </div>

      {/* Menu Items Row */}
      <div className="max-w-7xl mx-auto">
        <nav 
          aria-label="Main Module Navigation"
          className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-inner overflow-x-auto no-scrollbar scroll-smooth"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;

            return (
              <button
                key={item.id}
                id={item.id}
                onClick={() => setActiveTab(item.tab)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${
                  isActive ? 'text-slate-950' : 'text-slate-400'
                }`} />
                <span className="font-mono tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
