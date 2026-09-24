import React, { useState, useEffect, useRef } from 'react';
import { 
  Fingerprint, Activity, ShieldCheck, AlertTriangle, Play, Pause, 
  RotateCcw, Sliders, Zap, CheckCircle2, Droplets, Layers, Terminal
} from 'lucide-react';

export const TactileReflexStudio: React.FC = () => {
  const [material, setMaterial] = useState<'titanium' | 'tissue' | 'carbon' | 'steel'>('titanium');
  const [appliedLoadN, setAppliedLoadN] = useState<number>(2.4);
  const [shearPerturbationN, setShearPerturbationN] = useState<number>(1.2);
  const [isReflexEnabled, setIsReflexEnabled] = useState<boolean>(true);
  const [isSlipping, setIsSlipping] = useState<boolean>(false);
  const [microSlipMetric, setMicroSlipMetric] = useState<number>(0.35);
  const [reactionTimeMs, setReactionTimeMs] = useState<number>(2.6); // 2.6 ms response time

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Material properties
  const MATERIALS = {
    titanium: { name: 'Titanium Surgical Needle', staticMu: 0.36, compliance: 'High-Rigidity', safeGripRange: '1.8N - 4.5N' },
    tissue: { name: 'Visceral Wet Tissue', staticMu: 0.18, compliance: 'Soft-Viscoelastic', safeGripRange: '0.4N - 1.2N' },
    carbon: { name: 'Carbon-Fiber Aero Spar', staticMu: 0.52, compliance: 'Semi-Rigid', safeGripRange: '3.0N - 8.0N' },
    steel: { name: 'Polished Bearing Steel', staticMu: 0.22, compliance: 'High-Rigidity', safeGripRange: '2.5N - 6.0N' }
  };

  const activeMat = MATERIALS[material];

  // Dynamic slip evaluation
  useEffect(() => {
    const frictionRatio = shearPerturbationN / Math.max(0.1, appliedLoadN);
    setMicroSlipMetric(frictionRatio);

    if (frictionRatio > activeMat.staticMu) {
      if (isReflexEnabled) {
        // Closed-loop reflex instantly boosts normal force to suppress slip
        setIsSlipping(false);
        const compensatedLoad = Math.round((shearPerturbationN / (activeMat.staticMu * 0.75)) * 10) / 10;
        setAppliedLoadN(Math.min(12, compensatedLoad));
      } else {
        // Without reflex, slip occurs!
        setIsSlipping(true);
      }
    } else {
      setIsSlipping(false);
    }
  }, [shearPerturbationN, material, isReflexEnabled]);

  // Tactile Array Heatmap & Shear Vector Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.04;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // GelSight elastomeric membrane background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // Draw tactile sensor contact array (16x16 taxel markers)
      const cols = 16;
      const rows = 12;
      const cellW = w / cols;
      const cellH = h / rows;

      const centerX = w / 2;
      const centerY = h / 2;
      const contactRadius = 55 + appliedLoadN * 4;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const tx = i * cellW + cellW / 2;
          const ty = j * cellH + cellH / 2;

          const dist = Math.hypot(tx - centerX, ty - centerY);
          const inContact = dist < contactRadius;

          // Compute indentation and shear displacement
          const depthRatio = inContact ? Math.max(0, 1 - dist / contactRadius) : 0;
          const shearX = inContact ? (shearPerturbationN * 6 * Math.sin(t * 2)) : 0;
          const shearY = inContact ? (shearPerturbationN * 4) : 0;

          // Taxel marker color
          if (inContact) {
            if (isSlipping) {
              ctx.fillStyle = '#ef4444'; // Red slip
            } else {
              // Smooth gradient from yellow/green to cyan
              ctx.fillStyle = depthRatio > 0.6 ? '#f59e0b' : '#06b6d4';
            }
          } else {
            ctx.fillStyle = '#1e293b';
          }

          // Taxel point
          ctx.beginPath();
          ctx.arc(tx + shearX, ty + shearY, inContact ? 3 + depthRatio * 3 : 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Shear displacement vector lines
          if (inContact && shearPerturbationN > 0.5) {
            ctx.strokeStyle = isSlipping ? '#f87171' : '#38bdf8';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx + shearX, ty + shearY);
            ctx.stroke();
          }
        }
      }

      // Contact perimeter circle
      ctx.strokeStyle = isSlipping ? '#ef4444' : isReflexEnabled ? '#10b981' : '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, contactRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Status text overlay
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px monospace';
      ctx.fillText(`Tactile Array: 192 Taxels (GelSight Class)`, 14, 24);
      ctx.fillStyle = isSlipping ? '#f87171' : '#34d399';
      ctx.fillText(`State: ${isSlipping ? 'MACROSCOPIC SLIP DETECTED!' : 'STABLE CONTACT MAINTAINED'}`, 14, 42);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [appliedLoadN, shearPerturbationN, isSlipping, isReflexEnabled]);

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
              <span>Innovation 2 of 6: Optical Tactile & Micro-Slip Reflex</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              High-Resolution Optical Tactile Sensing & &lt;3ms Slip Reflex Studio
            </h2>
            <p className="text-xs text-slate-300 font-sans max-w-3xl leading-relaxed">
              Simulate elastomeric contact array deformation (GelSight/BioTac class) at 1000 Hz. A closed-loop <strong className="text-cyan-300">&lt;3 ms reflex governor</strong> detects micro-slip vectors and adjusts normal grip force before macroscopic drop occurs.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsReflexEnabled(!isReflexEnabled)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                isReflexEnabled
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isReflexEnabled ? 'Reflex Governor: ACTIVE' : 'Reflex: BYPASSED'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: 3D Contact Deformation Heatmap */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Elastomeric Tactile Contact Membrane</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                isSlipping ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {isSlipping ? 'SLIP FAILURE' : 'STABLE GRIP'}
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 h-64 flex items-center justify-center">
              <canvas ref={canvasRef} width={460} height={256} className="w-full h-full object-contain" />
              <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] text-slate-300">
                Material: {activeMat.name}
              </div>
              <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] text-cyan-400 font-mono">
                Reaction Time: {reactionTimeMs} ms
              </div>
            </div>

            {/* Force Vector Telemetry */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Normal Load (Fn)</span>
                <span className="text-cyan-400 font-bold">{appliedLoadN.toFixed(1)} N</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Shear Perturbation (Fs)</span>
                <span className="text-amber-400 font-bold">{shearPerturbationN.toFixed(1)} N</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Friction Coeff (μ)</span>
                <span className={microSlipMetric > activeMat.staticMu ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {microSlipMetric.toFixed(2)} / {activeMat.staticMu}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Controls & Material Properties */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Material Presets */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>Contact Interface Material Presets</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(MATERIALS).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setMaterial(key as any)}
                  className={`p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                    material === key
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-xs">{item.name}</div>
                  <div className="text-[10px] text-cyan-400 mt-0.5">μ: {item.staticMu} • {item.compliance}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Sliders: Normal Load & Shear Perturbation */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Dynamic Load Perturbation Controls</span>
            </h3>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Baseline Normal Force (Fn):</span>
                <strong className="text-cyan-400">{appliedLoadN} N</strong>
              </div>
              <input
                type="range"
                min={0.5}
                max={10.0}
                step={0.1}
                value={appliedLoadN}
                onChange={(e) => setAppliedLoadN(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">External Disturbance Shear Force (Fs):</span>
                <strong className="text-amber-400">{shearPerturbationN} N</strong>
              </div>
              <input
                type="range"
                min={0.0}
                max={8.0}
                step={0.1}
                value={shearPerturbationN}
                onChange={(e) => setShearPerturbationN(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Drag slider to simulate needle snag or external load pull. With reflex enabled, normal force auto-boosts in 2.6 ms!
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-300 font-sans leading-relaxed">
              <strong className="text-emerald-400 font-mono">Simulated Clinical & Defense Impact: </strong>
              Prevents dropped surgical suture needles during continuous robotic laparoscopic procedures and eliminates dropped payloads on high-vibration UAV cargo grippers.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
