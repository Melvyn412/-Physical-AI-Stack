import React, { useState } from 'react';
import { PILLARS_DATA } from '../data/stackData';
import { Eye, Globe, Brain, Bot, Cpu, ArrowRight, Sparkles, CheckCircle2, ChevronRight, Terminal, Zap } from 'lucide-react';
import { StackPillar } from '../types';

interface StackOverviewProps {
  onSelectPillar: (pillarId: StackPillar) => void;
}

export const StackOverview: React.FC<StackOverviewProps> = ({ onSelectPillar }) => {
  const [selectedPillarId, setSelectedPillarId] = useState<StackPillar>('multimodality');

  const getPillarIcon = (name: string) => {
    switch (name) {
      case 'Eye': return <Eye className="w-5 h-5" />;
      case 'Globe': return <Globe className="w-5 h-5" />;
      case 'Brain': return <Brain className="w-5 h-5" />;
      case 'Bot': return <Bot className="w-5 h-5" />;
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const selectedPillar = PILLARS_DATA[selectedPillarId];

  return (
    <section className="space-y-8">
      {/* Hero Core Thesis Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 lg:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>The Paradigm Shift in Embodied Intelligence</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Reasoning + Agents + Multimodality + World Models + Robotics
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            That is the technology stack that turns AI from a tool you interact with in a chatbox into an embodied intelligence capable of <span className="text-emerald-400 font-semibold underline decoration-emerald-500/40">independently accomplishing real-world physical objectives</span>.
          </p>

          {/* Interactive Flow Loop Indicator */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono">
            {Object.values(PILLARS_DATA).map((pillar, idx) => (
              <React.Fragment key={pillar.id}>
                <button
                  onClick={() => setSelectedPillarId(pillar.id as StackPillar)}
                  className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
                    selectedPillarId === pillar.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-md shadow-cyan-500/10 font-bold'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span style={{ color: pillar.color }}>{getPillarIcon(pillar.iconName)}</span>
                  <span>{pillar.name}</span>
                </button>
                {idx < 4 && <ArrowRight className="w-3 h-3 text-slate-600" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of 5 Stack Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.values(PILLARS_DATA).map((pillar) => {
          const isSelected = selectedPillarId === pillar.id;
          return (
            <div
              key={pillar.id}
              onClick={() => setSelectedPillarId(pillar.id as StackPillar)}
              className={`group relative cursor-pointer p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900/90 border-cyan-500/60 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/80 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: pillar.accentBg, color: pillar.color }}
                  >
                    {getPillarIcon(pillar.iconName)}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    Layer {Object.keys(PILLARS_DATA).indexOf(pillar.id) + 1}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                    {pillar.name}
                  </h3>
                  <p className="text-xs text-cyan-400/90 font-mono mt-0.5">
                    {pillar.shortTag}
                  </p>
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {pillar.tagline}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">{pillar.benchmarkMetric}</span>
                <span className="font-bold text-emerald-400">{pillar.benchmarkValue}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Pillar Deep Detail Panel */}
      {selectedPillar && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center p-3"
                style={{ backgroundColor: selectedPillar.accentBg, color: selectedPillar.color }}
              >
                {getPillarIcon(selectedPillar.iconName)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white font-mono">{selectedPillar.name}</h3>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold"
                    style={{ backgroundColor: selectedPillar.accentBg, color: selectedPillar.color }}
                  >
                    {selectedPillar.shortTag}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">{selectedPillar.tagline}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
                <span className="text-slate-500 block text-[10px]">REAL-TIME METRIC</span>
                <span className="text-emerald-400 font-bold text-base">{selectedPillar.benchmarkValue}</span>
              </div>

              <button
                onClick={() => onSelectPillar(selectedPillar.id as StackPillar)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
              >
                <span>Focus Simulator on {selectedPillar.name}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description & Key Tech Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Role in the Physical Stack</span>
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                {selectedPillar.description}
              </p>

              <div className="space-y-2">
                <h5 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Real-World Objective Impact</h5>
                <p className="text-sm text-emerald-300/90 bg-emerald-950/30 p-3 rounded-xl border border-emerald-800/40 font-mono">
                  "{selectedPillar.realWorldImpact}"
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Core Architectural Technologies</span>
              </h4>
              <ul className="space-y-2">
                {selectedPillar.keyTechnologies.map((tech, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs font-mono text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{tech}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Low-Level Code Pattern</span>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300/90 overflow-x-auto">
                  {selectedPillar.codeSnippet}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
