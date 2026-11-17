import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, FileCheck, Scale, Stethoscope, Shield, DollarSign, 
  Crosshair, ChevronDown, Cpu, Activity, Compass, Sliders, Target, 
  GitFork, Terminal, Network, Box, Layers, Gauge, Sparkles, Boxes, 
  Zap, BarChart3, Hand, RefreshCw, Wind, AlertOctagon, Calendar, 
  Database, Server, Film, HelpCircle, BookOpen, Radio, Rocket, Globe
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

// Focused Primary Regulatory & Safety Engine Navigation
export const CORE_NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'tab-landing',
    tab: 'landing',
    label: 'Overview & Safety Engine',
    icon: ShieldCheck
  },
  {
    id: 'tab-compliance',
    tab: 'compliance',
    label: 'Safety Audit Studio',
    icon: FileCheck
  },
  {
    id: 'tab-formal-prover',
    tab: 'formal-prover',
    label: 'Formal Z3 Prover',
    icon: Scale
  },
  {
    id: 'tab-vv-evidence',
    tab: 'vv-evidence',
    label: 'V&V Evidence Pack',
    icon: Shield
  },
  {
    id: 'tab-surgical-vv',
    tab: 'surgical-vv',
    label: 'Surgical & Medical DHF',
    icon: Stethoscope
  },
  {
    id: 'tab-defense-pack',
    tab: 'defense-pack',
    label: 'Defence Assurance Pack',
    icon: Shield
  },
  {
    id: 'tab-commercial',
    tab: 'commercial',
    label: 'Commercial & SOW Store',
    icon: DollarSign
  },
  {
    id: 'tab-super-league',
    tab: 'super-league',
    label: 'Planetary Command Ops',
    icon: Crosshair
  }
];

// Deep Multi-Physics Simulation & Tools for Under-the-Hood Engineering
export const SIMULATION_TOOLS = [
  { id: 'simulator', label: '5-Layer Reasoning Engine', icon: Activity, desc: 'Perception, World Models & 1000 Hz Loop' },
  { id: 'fleet-command', label: 'Fleet Operations (VDA 5050)', icon: Radio, desc: 'AMR Swarm & CAN-FD Bus Sniffer' },
  { id: 'export', label: 'ROS 2 & Isaac Sim Exporter', icon: Terminal, desc: 'Colcon Workspace & USD Scene Exporter' },
  { id: 'cad', label: 'CAD Ingestion Studio', icon: Box, desc: 'Onshape, STEP & V-HACD Mass Tensors' },
  { id: 'kinematics', label: 'URDF Kinematics Builder', icon: Boxes, desc: 'Custom 3D Manipulator Prototyping' },
  { id: 'ik', label: 'Inverse Kinematics (MoveIt 2)', icon: Target, desc: 'DLS Jacobian Singularity Damping' },
  { id: 'coanda', label: 'Coandă Fluidic Twin', icon: Wind, desc: 'Coupled Aerodynamic Boundary Control' },
  { id: 'swarm', label: 'Swarm Consensus Sandbox', icon: Network, desc: 'Multi-Agent Mesh Collision Avoidance' },
  { id: 'frontier', label: 'Physical Frontier Suite', icon: Rocket, desc: 'Edge Silicon & VDA 5050 Factory Engine' },
  { id: 'tutorials', label: 'Tutorials & Project Library', icon: BookOpen, desc: 'Hands-On Robotics Blueprints' },
  { id: 'mechanism-sim', label: 'Mechanism ROI Simulator', icon: Cpu, desc: 'Prototype Tooling Cycle Savings' },
  { id: 'pid', label: 'PID Controller Studio', icon: Sliders, desc: 'Frequency-Domain Closed-Loop Tuning' },
  { id: 'slam', label: 'SLAM Studio', icon: Compass, desc: 'LiDAR / Visual Inertial Odometry' },
  { id: 'fault-injection', label: 'Automated Fault Injection', icon: AlertOctagon, desc: 'Adversarial Hardware Stress Testing' },
  { id: 'twin-trust', label: 'Twin Trust Calibration', icon: Scale, desc: 'Sim-to-Real Trajectory Delta Tuning' },
  { id: 'synthetic-data', label: 'Synthetic Data Pipeline', icon: Database, desc: 'LeRobot DaaS Training Demonstrations' },
  { id: 'secure-deployment', label: 'Edge-to-Cloud Deployment', icon: Server, desc: 'SCIF Air-Gapped Kubernetes Clusters' },
  { id: 'live-hardware', label: 'Live Hardware Dyno', icon: Radio, desc: '20 kHz FOC Motor Oscilloscope' }
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
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDeepToolActive = SIMULATION_TOOLS.some(t => t.id === activeTab);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3 shadow-2xl space-y-3 font-mono">
      {/* Top Header Row: Brand, Safety Dossier Action, Quota Pill, and Status */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand & Refocused Tagline */}
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 via-emerald-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white font-mono">
                AIGENESIS<span className="text-cyan-400">.SAFETY</span>
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                Robotics Safety Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block font-sans">
              Automated ISO 10218 · ISO 3691-4 · ISO 13485 · FDA 21 CFR 820 Compliance Dossiers
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

          {/* 14-Day Pro Trial Button */}
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
            title="View Compliance Pricing & Pilot Plans"
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

          {/* Primary Solution Action Button: Generate Safety Dossier */}
          <button
            id="btn-generate-dossier-nav"
            onClick={() => setActiveTab('compliance')}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 rounded-full text-xs font-mono font-black shadow-md shadow-cyan-600/20 hover:shadow-cyan-500/30 transition-all border border-cyan-400/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 fill-slate-950" />
            <span className="whitespace-nowrap">Generate Safety Dossier</span>
          </button>

          {/* Engine Status Pill */}
          <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 shadow-inner">
            <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span>{hasApiKey ? 'Z3 SMT Solver' : 'Formal Prover'}</span>
          </div>
        </div>
      </div>

      {/* Focused Navigation Row */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <nav 
          aria-label="Core Regulatory Navigation"
          className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-inner overflow-x-auto no-scrollbar scroll-smooth flex-1"
        >
          {CORE_NAV_ITEMS.map((item) => {
            const isActive = 
              activeTab === item.tab || 
              (item.tab === 'landing' && activeTab.startsWith('landing-'));
            const Icon = item.icon;

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

        {/* Deep Multi-Physics Engine Dropdown (Under-The-Hood Modules) */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-mono font-bold transition-all cursor-pointer ${
              isDeepToolActive || isToolsDropdownOpen
                ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-lg'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Multi-Physics Engine & Tools</span>
            <span className="sm:hidden">Physics Tools</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isToolsDropdownOpen ? 'rotate-180 text-cyan-400' : ''}`} />
          </button>

          {/* Dropdown Menu Popover */}
          {isToolsDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-950 border border-slate-800 rounded-3xl p-4 shadow-2xl z-50 space-y-3 font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>1 kHz Multi-Physics & Simulation Foundation</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Under the Hood</span>
              </div>

              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                The mathematical verification and regulatory dossiers are calculated and validated using our underlying 1000 Hz multi-physics simulation suite:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-80 overflow-y-auto pr-1">
                {SIMULATION_TOOLS.map(tool => {
                  const Icon = tool.icon;
                  const active = activeTab === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setActiveTab(tool.id as ActiveTab);
                        setIsToolsDropdownOpen(false);
                      }}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        active
                          ? 'bg-cyan-500/20 border-cyan-500 text-white font-bold'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className={`w-3.5 h-3.5 ${active ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span className="text-[11px] font-bold text-white truncate">{tool.label}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 line-clamp-1">{tool.desc}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <span>All tools export to ROS 2 & Isaac Sim</span>
                <button
                  onClick={() => {
                    onOpenCustomModal();
                    setIsToolsDropdownOpen(false);
                  }}
                  className="text-cyan-400 hover:underline cursor-pointer"
                >
                  Custom Goal Decomposer →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
