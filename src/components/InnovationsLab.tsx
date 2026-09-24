import React, { useState } from 'react';
import { 
  Sparkles, Brain, Fingerprint, Radio, Award, Cpu, Eye, 
  ChevronRight, ArrowUpRight, Zap, ShieldCheck, Download, Share2
} from 'lucide-react';
import { InnovationModuleId, ActiveTab } from '../types';
import { VlaDistillationStudio } from './innovations/VlaDistillationStudio';
import { TactileReflexStudio } from './innovations/TactileReflexStudio';
import { GpsDeniedNavStudio } from './innovations/GpsDeniedNavStudio';
import { Sim2RealCertStudio } from './innovations/Sim2RealCertStudio';
import { FirmwareSynthStudio } from './innovations/FirmwareSynthStudio';
import { NeuromorphicDvsStudio } from './innovations/NeuromorphicDvsStudio';

interface InnovationsLabProps {
  initialModule?: InnovationModuleId;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const InnovationsLab: React.FC<InnovationsLabProps> = ({
  initialModule = 'vla-distillation',
  onNavigateTab
}) => {
  const [activeModule, setActiveModule] = useState<InnovationModuleId>(initialModule);

  const MODULES: {
    id: InnovationModuleId;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    tag: string;
    tagColor: string;
  }[] = [
    {
      id: 'vla-distillation',
      title: '1. VLA Policy Distillation',
      subtitle: 'OpenVLA / π₀ to 1000 Hz Continuous Joint Flow',
      icon: Brain,
      tag: 'Foundation Models',
      tagColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30'
    },
    {
      id: 'tactile-reflex',
      title: '2. Optical Tactile & Slip Reflex',
      subtitle: 'GelSight Array & <3ms Closed-Loop Grip Governor',
      icon: Fingerprint,
      tag: 'Surgical & Manipulation',
      tagColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
    },
    {
      id: 'gps-denied',
      title: '3. GPS-Denied & EW Nav',
      subtitle: 'VIO + UWB Swarm Ranging in 100% Jamming Noise',
      icon: Radio,
      tag: 'Defense Autonomy',
      tagColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'sim2real-cert',
      title: '4. Sim2Real Certification',
      subtitle: 'Monte Carlo Randomization & ISO/IEC/MIL Certs',
      icon: Award,
      tag: 'Functional Safety',
      tagColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
    },
    {
      id: 'firmware-synth',
      title: '5. Micro-ROS & EtherCAT',
      subtitle: 'Bare-Metal C++20 / Rust for STM32, TI & Jetson',
      icon: Cpu,
      tag: 'Embedded Firmware',
      tagColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
    },
    {
      id: 'neuromorphic-dvs',
      title: '6. Neuromorphic Event Vision',
      subtitle: 'Microsecond DVS Sensor with Zero Motion Blur',
      icon: Eye,
      tag: 'Neuromorphic AI',
      tagColor: 'bg-blue-500/10 text-blue-300 border-blue-500/30'
    }
  ];

  return (
    <div className="space-y-8 font-mono">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next-Generation Physical AI Innovations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              AIGenesis Innovations Lab (2025–2026 SOTA)
            </h1>
            <p className="text-sm text-slate-300 font-sans max-w-3xl leading-relaxed">
              Explore 6 bleeding-edge physical intelligence breakthroughs: from VLA foundation model distillation to &lt;3ms tactile slip reflexes, EW-hardened navigation, Sim2Real digital verification, bare-metal EtherCAT firmware, and neuromorphic DVS vision.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500 block uppercase">Control Frequency</span>
              <span className="text-cyan-400 font-extrabold text-sm">1000 Hz Sub-ms</span>
            </div>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500 block uppercase">Innovations Active</span>
              <span className="text-emerald-400 font-extrabold text-sm">6 / 6 Modules</span>
            </div>
          </div>
        </div>

        {/* 6 Innovations Navigation Pills */}
        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {MODULES.map((mod) => {
            const IconComponent = mod.icon;
            const isSelected = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`p-3 rounded-2xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10 scale-[1.02]'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${mod.tagColor}`}>
                    {mod.tag.split(' ')[0]}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-xs truncate">{mod.title}</div>
                  <div className="text-[9px] text-slate-500 truncate mt-0.5">{mod.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Innovation Viewport */}
      <div className="transition-all">
        {activeModule === 'vla-distillation' && <VlaDistillationStudio />}
        {activeModule === 'tactile-reflex' && <TactileReflexStudio />}
        {activeModule === 'gps-denied' && <GpsDeniedNavStudio />}
        {activeModule === 'sim2real-cert' && <Sim2RealCertStudio />}
        {activeModule === 'firmware-synth' && <FirmwareSynthStudio />}
        {activeModule === 'neuromorphic-dvs' && <NeuromorphicDvsStudio />}
      </div>
    </div>
  );
};
