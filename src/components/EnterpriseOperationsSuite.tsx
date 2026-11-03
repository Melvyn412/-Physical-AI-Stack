import React, { useState, useEffect } from 'react';
import { 
  Globe, Cpu, RefreshCw, ShieldCheck, Layers, 
  ArrowRight, Sparkles, Activity, Radio, Terminal
} from 'lucide-react';
import { ActiveTab } from '../types';
import { GlobalFleetCommandStudio } from './operations/GlobalFleetCommandStudio';
import { HilBusSnifferStudio } from './operations/HilBusSnifferStudio';
import { SystemIdentificationStudio } from './operations/SystemIdentificationStudio';
import { FormalLyapunovProverStudio } from './operations/FormalLyapunovProverStudio';
import { LiveHardwareGatewayStudio } from './operations/LiveHardwareGatewayStudio';
import { Usb } from 'lucide-react';

export type OperationsViewMode = 'fleet-command' | 'hil-bus-sniffer' | 'sysid-replay' | 'formal-prover' | 'live-hardware';

interface EnterpriseOperationsSuiteProps {
  initialMode?: OperationsViewMode;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const EnterpriseOperationsSuite: React.FC<EnterpriseOperationsSuiteProps> = ({
  initialMode = 'fleet-command',
  onNavigateTab
}) => {
  const [activeMode, setActiveMode] = useState<OperationsViewMode>(initialMode);

  useEffect(() => {
    setActiveMode(initialMode);
  }, [initialMode]);

  const MODES: {
    id: OperationsViewMode;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    badge: string;
    badgeColor: string;
  }[] = [
    {
      id: 'fleet-command',
      title: '1. Fleet Command Deck',
      subtitle: '162 Robots Global 3D Tactical War Room & Canary OTA',
      icon: Globe,
      badge: 'Global Fleet Ops',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
    },
    {
      id: 'hil-bus-sniffer',
      title: '2. HiL CAN-FD & EtherCAT',
      subtitle: 'Real-Time Hardware Scope & Fault Injector',
      icon: Cpu,
      badge: 'WebSerial & CoE',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
    },
    {
      id: 'sysid-replay',
      title: '3. Auto-SysID & Rosbag2',
      subtitle: 'Levenberg-Marquardt Sim-to-Real Inversion',
      icon: RefreshCw,
      badge: 'Reality Gap 0.28%',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'formal-prover',
      title: '4. Formal SMT Prover',
      subtitle: 'Control Barrier Functions & Lyapunov Proofs',
      icon: ShieldCheck,
      badge: 'Z3 Theorem Prover',
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30'
    },
    {
      id: 'live-hardware',
      title: '5. Live Hardware Gateway',
      subtitle: 'WebSerial, WebHID 6-DoF, Dyno FOC & RealSense Depth',
      icon: Usb,
      badge: 'Direct Physical Link',
      badgeColor: 'bg-teal-500/10 text-teal-300 border-teal-500/30'
    }
  ];

  const handleSelectMode = (mode: OperationsViewMode) => {
    setActiveMode(mode);
    if (onNavigateTab) {
      onNavigateTab(mode as ActiveTab);
    }
  };

  return (
    <div className="space-y-8 font-mono">
      {/* Top Banner & Segmented Control */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Enterprise Physical Operations & Hardware Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              AIGENESIS Autonomous Fleet & Hardware Engine
            </h1>
            <p className="text-sm text-slate-300 font-sans max-w-3xl leading-relaxed">
              From global planetary fleet orchestration across 4 continents and microsecond WebSerial CAN-FD bus sniffing, to automated rosbag2 system identification, Z3 SMT formal mathematical safety theorem proving, and direct WebSerial/WebHID physical hardware dyno calibration.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500 block uppercase">Orchestrated Units</span>
              <span className="text-cyan-400 font-extrabold text-sm">162 Autonomous</span>
            </div>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500 block uppercase">Physical Hardware</span>
              <span className="text-teal-400 font-extrabold text-sm">Direct WebSerial</span>
            </div>
          </div>
        </div>

        {/* 5 Operations Viewport Tabs */}
        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {MODES.map((mod) => {
            const IconComponent = mod.icon;
            const isSelected = activeMode === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => handleSelectMode(mod.id)}
                className={`p-3 rounded-2xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-500/60 text-white shadow-xl shadow-cyan-500/10 scale-[1.02]'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold border ${mod.badgeColor}`}>
                    {mod.badge}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-xs truncate text-white">{mod.title}</div>
                  <div className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{mod.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Studio Viewport */}
      <div className="transition-all">
        {activeMode === 'fleet-command' && <GlobalFleetCommandStudio />}
        {activeMode === 'hil-bus-sniffer' && <HilBusSnifferStudio />}
        {activeMode === 'sysid-replay' && <SystemIdentificationStudio />}
        {activeMode === 'formal-prover' && <FormalLyapunovProverStudio />}
        {activeMode === 'live-hardware' && <LiveHardwareGatewayStudio />}
      </div>
    </div>
  );
};
