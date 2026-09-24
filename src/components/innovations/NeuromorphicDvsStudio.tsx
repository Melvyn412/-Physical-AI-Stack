import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, Zap, Activity, Play, Pause, Sliders, 
  RotateCcw, Sparkles, CheckCircle2, AlertCircle, Layers
} from 'lucide-react';

export const NeuromorphicDvsStudio: React.FC = () => {
  const [rpmSpeed, setRpmSpeed] = useState<number>(3600); // 3600 RPM high-speed rotor
  const [contrastThreshold, setContrastThreshold] = useState<number>(0.15); // log intensity threshold
  const [eventRateKeps, setEventRateKeps] = useState<number>(142); // 142 k-events/sec
  const [latencyUs, setLatencyUs] = useState<number>(18); // 18 microseconds latency
  const [isSpinning, setIsSpinning] = useState<boolean>(true);

  const canvasStandardRef = useRef<HTMLCanvasElement | null>(null);
  const canvasDvsRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic event rate calculation based on RPM
  useEffect(() => {
    const keps = Math.round((rpmSpeed / 60) * 2.4 * (1 / contrastThreshold));
    setEventRateKeps(keps);
    setLatencyUs(Math.max(8, Math.round(25000 / keps)));
  }, [rpmSpeed, contrastThreshold]);

  // Dual Canvas Animation: Standard 60 FPS Blurred vs Neuromorphic Event Stream
  useEffect(() => {
    const canvasStd = canvasStandardRef.current;
    const canvasDvs = canvasDvsRef.current;
    if (!canvasStd || !canvasDvs) return;

    const ctxStd = canvasStd.getContext('2d');
    const ctxDvs = canvasDvs.getContext('2d');
    if (!ctxStd || !ctxDvs) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      const angularVel = (rpmSpeed / 60) * 2 * Math.PI * 0.016;
      angle += isSpinning ? angularVel : 0.01;

      const w = canvasStd.width;
      const h = canvasStd.height;
      const cx = w / 2;
      const cy = h / 2;

      // --- 1. Conventional 60 FPS Camera (Heavy Motion Blur) ---
      ctxStd.fillStyle = '#090d16';
      ctxStd.fillRect(0, 0, w, h);

      // Motion blur simulation: draw multiple faded passes across past 16ms
      const blurSteps = 12;
      for (let s = 0; s < blurSteps; s++) {
        const subAngle = angle - (s * angularVel * 0.08);
        ctxStd.fillStyle = `rgba(148, 163, 184, ${0.12 - s * 0.008})`;
        ctxStd.save();
        ctxStd.translate(cx, cy);
        ctxStd.rotate(subAngle);

        // 3-blade high-speed rotor
        for (let b = 0; b < 3; b++) {
          ctxStd.rotate((2 * Math.PI) / 3);
          ctxStd.fillRect(-5, -65, 10, 65);
        }
        ctxStd.restore();
      }

      ctxStd.fillStyle = '#ef4444';
      ctxStd.font = '10px monospace';
      ctxStd.fillText(`Standard 60 FPS: SEVERE BLUR (16.6ms latency)`, 12, 22);

      // --- 2. Neuromorphic DVS Event Stream (Microsecond Polarity Events) ---
      ctxDvs.fillStyle = '#05070d';
      ctxDvs.fillRect(0, 0, w, h);

      // Draw sharp asynchronous edge events (+1 = Cyan, -1 = Orange/Red)
      const eventBladeCount = 3;
      for (let b = 0; b < eventBladeCount; b++) {
        const bladeAngle = angle + (b * (2 * Math.PI) / eventBladeCount);

        // Leading edge: Positive intensity delta (Cyan)
        ctxDvs.strokeStyle = '#06b6d4';
        ctxDvs.lineWidth = 2;
        ctxDvs.beginPath();
        ctxDvs.moveTo(cx, cy);
        ctxDvs.lineTo(cx + 65 * Math.cos(bladeAngle + 0.04), cy + 65 * Math.sin(bladeAngle + 0.04));
        ctxDvs.stroke();

        // Trailing edge: Negative intensity delta (Orange/Red)
        ctxDvs.strokeStyle = '#f97316';
        ctxDvs.lineWidth = 2;
        ctxDvs.beginPath();
        ctxDvs.moveTo(cx, cy);
        ctxDvs.lineTo(cx + 65 * Math.cos(bladeAngle - 0.04), cy + 65 * Math.sin(bladeAngle - 0.04));
        ctxDvs.stroke();
      }

      // Hub event circle
      ctxDvs.fillStyle = '#38bdf8';
      ctxDvs.beginPath();
      ctxDvs.arc(cx, cy, 4, 0, Math.PI * 2);
      ctxDvs.fill();

      // Dynamic DVS event dots (random micro-events along edges)
      for (let i = 0; i < 25; i++) {
        const rRad = Math.random() * 65;
        const bIdx = Math.floor(Math.random() * 3);
        const bAng = angle + (bIdx * (2 * Math.PI) / 3) + (Math.random() - 0.5) * 0.08;
        const px = cx + rRad * Math.cos(bAng);
        const py = cy + rRad * Math.sin(bAng);

        ctxDvs.fillStyle = Math.random() > 0.5 ? '#38bdf8' : '#fb923c';
        ctxDvs.fillRect(px, py, 1.5, 1.5);
      }

      ctxDvs.fillStyle = '#34d399';
      ctxDvs.font = '10px monospace';
      ctxDvs.fillText(`Neuromorphic DVS: ZERO BLUR (${latencyUs}µs latency)`, 12, 22);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [rpmSpeed, isSpinning, contrastThreshold, latencyUs]);

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Innovation 6 of 6: Neuromorphic Event Vision (DVS)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Event-Based Neuromorphic Vision Telemetry (DVS Sensor Simulator)
            </h2>
            <p className="text-xs text-slate-300 font-sans max-w-3xl leading-relaxed">
              Simulate asynchronous event cameras (Prophesee / Sony IMX636 class) producing pixel-level brightness polarity events at <strong className="text-cyan-300">microsecond temporal resolution (18 µs)</strong> with zero motion blur and 140 dB dynamic range.
            </p>
          </div>
          <button
            onClick={() => setIsSpinning(!isSpinning)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              isSpinning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            {isSpinning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>{isSpinning ? 'Pause Rotor' : 'Spin Rotor'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Dual Comparison Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Side-by-Side Canvas Visualizer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Side-by-Side Sensor Comparison ({rpmSpeed} RPM Rotor)</span>
              </span>
              <span className="text-[10px] text-cyan-400 px-2 py-0.5 bg-cyan-500/10 rounded-md">
                Temporal Resolution: {latencyUs} µs
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Conventional Camera */}
              <div className="rounded-2xl overflow-hidden border border-red-500/30 bg-slate-950 h-56 flex items-center justify-center relative">
                <canvas ref={canvasStandardRef} width={240} height={224} className="w-full h-full object-contain" />
              </div>

              {/* Neuromorphic DVS Camera */}
              <div className="rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-950 h-56 flex items-center justify-center relative">
                <canvas ref={canvasDvsRef} width={240} height={224} className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Microsecond Telemetry Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">DVS Event Stream</span>
                <span className="text-cyan-400 font-bold">{eventRateKeps} k-events/s</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">DVS Response Lag</span>
                <span className="text-emerald-400 font-bold">{latencyUs} µs</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">60 FPS Frame Lag</span>
                <span className="text-red-400 font-bold">16,666 µs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: High-Speed Rotor & DVS Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Neuromorphic Sensor Configuration</span>
            </h3>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Target Rotational Velocity:</span>
                <strong className="text-cyan-400">{rpmSpeed} RPM</strong>
              </div>
              <input
                type="range"
                min={600}
                max={9000}
                step={200}
                value={rpmSpeed}
                onChange={(e) => setRpmSpeed(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Log-Intensity Contrast Threshold (C):</span>
                <strong className="text-amber-400">Δln(I) = {contrastThreshold}</strong>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.4}
                step={0.01}
                value={contrastThreshold}
                onChange={(e) => setContrastThreshold(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-300 font-sans leading-relaxed space-y-1.5">
              <div className="text-cyan-300 font-bold font-mono">Why Neuromorphic for Defense & High-Speed Robotics?</div>
              <p>
                Standard CMOS global-shutter cameras blur completely at velocities over 2,000 RPM. Neuromorphic DVS outputs pure temporal edges at microsecond intervals, enabling supersonic projectile tracking and millisecond drone obstacle avoidance with &lt;10mW sensor power consumption.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
