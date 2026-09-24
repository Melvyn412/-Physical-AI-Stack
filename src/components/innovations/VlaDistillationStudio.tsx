import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, Brain, Zap, Play, Pause, RotateCcw, CheckCircle2, 
  Terminal, Sliders, Layers, Download, Sparkles, AlertCircle, 
  ArrowRight, ShieldCheck, Activity, Copy, Check
} from 'lucide-react';

export const VlaDistillationStudio: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<'openvla' | 'octo' | 'pi0'>('pi0');
  const [prompt, setPrompt] = useState<string>('Grasp titanium micro-needle and orient along laparoscopic incision axis with <0.5N compliance');
  const [chunkSize, setChunkSize] = useState<number>(32);
  const [distillFreqHz, setDistillFreqHz] = useState<number>(1000);
  const [isExecuting, setIsExecuting] = useState<boolean>(true);
  const [safetyThreshold, setSafetyThreshold] = useState<number>(98.5);
  const [copied, setCopied] = useState<boolean>(false);

  // Latency metrics
  const [vlaLatencyMs, setVlaLatencyMs] = useState<number>(42);
  const [diffusionLatencyMs, setDiffusionLatencyMs] = useState<number>(1.4);
  const [governorLatencyUs, setGovernorLatencyUs] = useState<number>(380); // 380 microseconds
  const [distilledRate, setDistilledRate] = useState<number>(1000);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Suggested prompts
  const PROMPTS = [
    'Grasp titanium micro-needle and orient along laparoscopic incision axis with <0.5N compliance',
    'Align defense EO/IR payload connector without exceeding 12 Nm back-torque',
    'Pick cycloidal gear tooth ring and seat onto high-speed spline shaft',
    'Execute bimanual dual-arm suture knot with dynamic cable tension compensation'
  ];

  // Canvas visualizer for VLA action trajectory distillation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += isExecuting ? 0.03 : 0.005;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Background grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Base mount
      const baseX = w * 0.3;
      const baseY = h * 0.75;

      ctx.fillStyle = '#334155';
      ctx.fillRect(baseX - 30, baseY - 10, 60, 25);
      ctx.strokeStyle = '#64748b';
      ctx.strokeRect(baseX - 30, baseY - 10, 60, 25);

      // 3-DoF arm kinematics driven by VLA policy
      const l1 = 80;
      const l2 = 70;
      const l3 = 45;

      const a1 = Math.sin(t * 0.9) * 0.4 - Math.PI / 2.8;
      const a2 = Math.cos(t * 1.1) * 0.6 + 0.4;
      const a3 = Math.sin(t * 1.4) * 0.5 - 0.2;

      const j1x = baseX + l1 * Math.cos(a1);
      const j1y = baseY + l1 * Math.sin(a1);

      const j2x = j1x + l2 * Math.cos(a1 + a2);
      const j2y = j1y + l2 * Math.sin(a1 + a2);

      const eeX = j2x + l3 * Math.cos(a1 + a2 + a3);
      const eeY = j2y + l3 * Math.sin(a1 + a2 + a3);

      // Draw high-level VLA coarse goal trajectory (dotted line)
      ctx.strokeStyle = '#a855f7';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(baseX + 110, baseY - 70, 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Distilled 1000 Hz Sub-ms Smooth Trajectory (Cyan)
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(j1x, j1y);
      ctx.stroke();

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(j1x, j1y);
      ctx.lineTo(j2x, j2y);
      ctx.stroke();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(j2x, j2y);
      ctx.lineTo(eeX, eeY);
      ctx.stroke();

      // Joints
      [
        { x: baseX, y: baseY, c: '#0284c7' },
        { x: j1x, y: j1y, c: '#10b981' },
        { x: j2x, y: j2y, c: '#38bdf8' }
      ].forEach(pt => {
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = pt.c;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // End Effector Gripper & Target Object
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(eeX, eeY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Target workpiece
      const targetX = baseX + 130;
      const targetY = baseY - 60;
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(targetX - 8, targetY - 8, 16, 16);

      // Distance indicator
      const dist = Math.hypot(eeX - targetX, eeY - targetY);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`Target Err: ${dist.toFixed(1)} mm`, eeX + 10, eeY - 10);
      ctx.fillText(`1 kHz DLS Filter: ACTIVE`, 15, 25);
      ctx.fillText(`Distilled Chunks: ${chunkSize} steps`, 15, 42);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isExecuting, chunkSize]);

  const exportCode = `// AIGENESIS.TECH // VLA-to-1000Hz Distilled Motor Policy (C++ / TensorRT)
#include <aigenesis/vla_distiller.hpp>
#include <aigenesis/safety_governor.hpp>

class VlaRealtimeController : public aigenesis::RealtimeController<1000 /* Hz */> {
public:
    VlaRealtimeController() : 
        vla_model_("${selectedModel}"),
        action_horizon_(${chunkSize}),
        safety_cert_(${safetyThreshold}f) {}

    void on_1khz_tick(const RobotState& state, MotorCommand& cmd) override {
        // Asynchronous VLA action chunk buffer (20 Hz semantic -> 1000 Hz joint)
        if (action_buffer_.needs_inference()) {
            trigger_async_vla_inference(state.rgb_camera, "${prompt}");
        }
        
        // Sub-millisecond continuous diffusion interpolation (1.4 ms)
        JointAction raw_action = action_buffer_.interpolate_1khz(state.timestamp_ns);
        
        // Layer 5 Deterministic Safety Governor (380 microseconds)
        cmd = safety_governor_.clamp_to_admissible_polytope(raw_action, state);
    }
};`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>Innovation 1 of 6: Vision-Language-Action (VLA) Distillation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              VLA Foundation Model Policy Distillation Studio
            </h2>
            <p className="text-xs text-slate-300 font-sans max-w-3xl leading-relaxed">
              Bridge slow 5–20 Hz vision-language foundation models (<strong className="text-purple-300">OpenVLA, Octo, Physical Intelligence π₀</strong>) into deterministic <strong className="text-cyan-300">1000 Hz sub-millisecond joint execution</strong> with formal safety polytope guarantees.
            </p>
          </div>
          <button
            onClick={() => setIsExecuting(!isExecuting)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              isExecuting
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
            }`}
          >
            {isExecuting ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>{isExecuting ? 'Pause Policy Stream' : 'Resume 1 kHz Execution'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Visualizer & Real-Time Metrics */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>1000 Hz Distilled Execution Canvas</span>
              </span>
              <span className="text-[11px] text-emerald-400 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                Deterministic 1 kHz Loop Active
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 h-64 flex items-center justify-center">
              <canvas ref={canvasRef} width={460} height={256} className="w-full h-full object-contain" />
              <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] text-purple-300">
                Model: {selectedModel.toUpperCase()}
              </div>
            </div>

            {/* Pipeline Latency Decomposition */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Sub-Millisecond Pipeline Latency:</div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">VLA Semantic (Async)</span>
                  <span className="text-purple-400 font-bold">{vlaLatencyMs} ms</span>
                  <span className="text-[9px] text-slate-600 block">20 Hz Loop</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Diffusion Distillation</span>
                  <span className="text-cyan-400 font-bold">{diffusionLatencyMs} ms</span>
                  <span className="text-[9px] text-slate-600 block">Continuous Flow</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Layer 5 Governor</span>
                  <span className="text-emerald-400 font-bold">{governorLatencyUs} µs</span>
                  <span className="text-[9px] text-slate-600 block">&lt;1 ms Guarantee</span>
                </div>
              </div>
            </div>
          </div>

          {/* Model Architecture Selection */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Foundation VLA Architecture</span>
            </h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'pi0', name: 'Physical Intelligence π₀', size: '3.1B', desc: 'Flow Matching 1000Hz' },
                { id: 'openvla', name: 'OpenVLA (Prismatic)', size: '7B', desc: 'Vision Tokenizer' },
                { id: 'octo', name: 'Octo-Base', size: '93M', desc: 'Transformer Diffusion' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id as any)}
                  className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                    selectedModel === m.id
                      ? 'bg-purple-500/20 border-purple-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-[11px]">{m.name}</div>
                  <div className="text-[9px] text-purple-400">{m.size} • {m.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Prompt Configuration & Code Export */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Natural Language Prompt Formulation */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Natural Language Task Directive</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Semantic Goal</span>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-sans focus:outline-none focus:border-purple-500"
              placeholder="Describe physical robotic task in natural language..."
            />

            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Recommended Engineering Prompts:</span>
              <div className="space-y-1">
                {PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(p)}
                    className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 text-[11px] text-slate-300 truncate cursor-pointer transition-all hover:text-purple-300"
                  >
                    • {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Tuning Sliders */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Action Horizon: {chunkSize} steps</label>
                <input
                  type="range"
                  min={8}
                  max={64}
                  step={4}
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Safety Polytope: {safetyThreshold}%</label>
                <input
                  type="range"
                  min={90}
                  max={99.9}
                  step={0.1}
                  value={safetyThreshold}
                  onChange={(e) => setSafetyThreshold(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Generated C++ / TensorRT Embedded Node */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Synthesized C++ Realtime Controller</span>
              </span>
              <button
                onClick={copyToClipboard}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-[11px] text-cyan-300 font-mono overflow-x-auto max-h-48 scrollbar-thin">
              {exportCode}
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
};
