import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, ShieldAlert, ShieldCheck, Compass, Activity, 
  Play, Pause, Sliders, AlertTriangle, Eye, RotateCcw, Zap, Terminal
} from 'lucide-react';

export const GpsDeniedNavStudio: React.FC = () => {
  const [jammingLevelPct, setJammingLevelPct] = useState<number>(85); // 85% RF noise
  const [isSpoofingActive, setIsSpoofingActive] = useState<boolean>(true);
  const [activeSensors, setActiveSensors] = useState({
    vio: true,
    uwb: true,
    magAnomaly: true,
    gnss: false
  });
  const [driftErrorCm, setDriftErrorCm] = useState<number>(4.2);
  const [swarmCohesionPct, setSwarmCohesionPct] = useState<number>(97.4);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic calculation of drift based on jamming & active sensors
  useEffect(() => {
    let baseDrift = 1.2;
    if (jammingLevelPct > 40 && !activeSensors.vio) baseDrift += 15;
    if (jammingLevelPct > 70 && !activeSensors.uwb) baseDrift += 22;
    if (isSpoofingActive && activeSensors.gnss) baseDrift += 48; // Spoofed GNSS causes massive drift
    if (activeSensors.vio && activeSensors.uwb) {
      baseDrift = Math.max(1.8, 1.8 + (jammingLevelPct / 100) * 3.5);
    }
    setDriftErrorCm(Number(baseDrift.toFixed(1)));
    setSwarmCohesionPct(Number(Math.max(60, 100 - baseDrift * 1.5).toFixed(1)));
  }, [jammingLevelPct, isSpoofingActive, activeSensors]);

  // Tactical EW Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.025;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Dark tactical radar background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // Radar concentric rings
      const cx = w * 0.5;
      const cy = h * 0.5;
      [40, 80, 120].forEach(r => {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Radar rotating sweep
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 120 * Math.cos(t), cy + 120 * Math.sin(t));
      ctx.stroke();

      // Waypoints
      const waypoints = [
        { x: cx - 100, y: cy - 60 },
        { x: cx - 20, y: cy - 80 },
        { x: cx + 80, y: cy - 30 },
        { x: cx + 40, y: cy + 60 },
        { x: cx - 60, y: cy + 70 }
      ];

      // Draw nominal mission flight path
      ctx.strokeStyle = '#475569';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      waypoints.forEach((wp, idx) => {
        if (idx === 0) ctx.moveTo(wp.x, wp.y);
        else ctx.lineTo(wp.x, wp.y);
      });
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Spoofed GNSS Trajectory (Divergent Red Path if spoofing)
      if (isSpoofingActive) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        waypoints.forEach((wp, idx) => {
          const spoofOffset = (idx + 1) * (jammingLevelPct / 100) * 18;
          if (idx === 0) ctx.moveTo(wp.x + spoofOffset, wp.y - spoofOffset);
          else ctx.lineTo(wp.x + spoofOffset, wp.y - spoofOffset);
        });
        ctx.stroke();
      }

      // Draw Resilient VIO/UWB Fused Path (Cyan/Emerald)
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      waypoints.forEach((wp, idx) => {
        const resilientJitter = Math.sin(t + idx) * (driftErrorCm * 0.4);
        if (idx === 0) ctx.moveTo(wp.x + resilientJitter, wp.y + resilientJitter);
        else ctx.lineTo(wp.x + resilientJitter, wp.y + resilientJitter);
      });
      ctx.closePath();
      ctx.stroke();

      // Current UAV Agent Position
      const agentIdx = Math.floor(t) % waypoints.length;
      const nextIdx = (agentIdx + 1) % waypoints.length;
      const alpha = t - Math.floor(t);
      const currX = waypoints[agentIdx].x + (waypoints[nextIdx].x - waypoints[agentIdx].x) * alpha;
      const currY = waypoints[agentIdx].y + (waypoints[nextIdx].y - waypoints[agentIdx].y) * alpha;

      // Agent marker
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(currX, currY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Swarm Peer UWB ranging lines
      [
        { x: currX + 35, y: currY - 25 },
        { x: currX - 30, y: currY + 30 }
      ].forEach(peer => {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(currX, currY);
        ctx.lineTo(peer.x, peer.y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(peer.x, peer.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Text Status
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText(`EW Environment: ${jammingLevelPct}% Jamming Power`, 12, 20);
      ctx.fillStyle = isSpoofingActive ? '#f87171' : '#34d399';
      ctx.fillText(`GNSS Status: ${isSpoofingActive ? 'SPOOFED (REJECTED BY RAIM)' : 'UNLOCKED'}`, 12, 36);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [jammingLevelPct, isSpoofingActive, driftErrorCm]);

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Innovation 3 of 6: GPS-Denied & EW Navigation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              GPS-Denied & Electronic-Warfare (EW) Resilient Navigation Studio
            </h2>
            <p className="text-xs text-slate-300 font-sans max-w-3xl leading-relaxed">
              Maintain sub-decimeter mission positioning in severe electronic jamming and spoofing conditions. Fuses <strong className="text-cyan-300">Visual-Inertial Odometry (VIO)</strong>, <strong className="text-emerald-300">Ultra-Wideband (UWB) peer ranging</strong>, and magnetic anomaly mapping.
            </p>
          </div>
          <div className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold shrink-0">
            Drift Error: {driftErrorCm} cm
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Radar & Tactical Canvas */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-bold flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Tactical EW Jamming & Trajectory Arena</span>
              </span>
              <span className="text-[10px] text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-md">
                UWB Swarm Mesh: ONLINE
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 h-64 flex items-center justify-center">
              <canvas ref={canvasRef} width={460} height={256} className="w-full h-full object-contain" />
              <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] text-emerald-400">
                Swarm Cohesion: {swarmCohesionPct}%
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Position Drift</span>
                <span className="text-emerald-400 font-bold">{driftErrorCm} cm</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">UWB Peer Mesh</span>
                <span className="text-cyan-400 font-bold">12 Nodes Locked</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">GNSS Spoof Rejection</span>
                <span className="text-amber-400 font-bold">RAIM Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Electronic Warfare Parameters */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Electronic Warfare (EW) Threat Simulation</span>
            </h3>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Broadband RF Jamming Power:</span>
                <strong className="text-amber-400">{jammingLevelPct}% Noise Floor</strong>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={jammingLevelPct}
                onChange={(e) => setJammingLevelPct(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-white font-bold block">GPS L1/L2 Spoofing Attack</span>
                <span className="text-[10px] text-slate-400">Transmits false ephemeris clock drift</span>
              </div>
              <button
                onClick={() => setIsSpoofingActive(!isSpoofingActive)}
                className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                  isSpoofingActive
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isSpoofingActive ? 'Spoofing: ENGAGED' : 'Spoofing: INACTIVE'}
              </button>
            </div>

            {/* Resilient Sensor Fusion Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Resilient Sensor Fusion Pipeline:</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'vio', label: 'Visual-Inertial Odometry (VIO)' },
                  { key: 'uwb', label: 'UWB Inter-Agent Ranging' },
                  { key: 'magAnomaly', label: 'Magnetic Anomaly SLAM' },
                  { key: 'gnss', label: 'Raw GNSS Receiver' }
                ].map(s => (
                  <button
                    key={s.key}
                    onClick={() => setActiveSensors(prev => ({ ...prev, [s.key]: !prev[s.key as keyof typeof prev] }))}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer text-[11px] ${
                      activeSensors[s.key as keyof typeof activeSensors]
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    ✓ {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
