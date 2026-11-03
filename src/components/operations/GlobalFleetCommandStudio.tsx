import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, Radio, Shield, AlertTriangle, Play, Pause, 
  RotateCcw, Download, Copy, Check, Activity, Server, 
  Cpu, Zap, Send, ShieldAlert, ArrowUpRight, CheckCircle2
} from 'lucide-react';

interface FleetTheater {
  id: string;
  name: string;
  region: string;
  coordinates: [number, number]; // [lat, lon]
  robotCount: number;
  robotType: string;
  avgLatencyMs: number;
  packetLossPct: number;
  batteryAvgPct: number;
  status: 'NOMINAL' | 'ELEVATED' | 'CANARY_ACTIVE';
  activeMission: string;
}

const THEATERS: FleetTheater[] = [
  {
    id: 'uk-logistics',
    name: 'London Heathrow Logistics Hub',
    region: 'United Kingdom',
    coordinates: [51.47, -0.45],
    robotCount: 68,
    robotType: 'Heavy-Payload AMR Swarm (Voronoi)',
    avgLatencyMs: 8.4,
    packetLossPct: 0.01,
    batteryAvgPct: 88,
    status: 'NOMINAL',
    activeMission: 'Cross-Docking Automated Sortation (1,400 parcels/hr)'
  },
  {
    id: 'us-surgical',
    name: 'Silicon Valley Surgical Innovation Hub',
    region: 'California, USA',
    coordinates: [37.38, -122.08],
    robotCount: 24,
    robotType: '7-DOF Endowrist Articulators (IEC 62304)',
    avgLatencyMs: 0.8,
    packetLossPct: 0.00,
    batteryAvgPct: 100, // Shore-powered
    status: 'NOMINAL',
    activeMission: 'Vascular Anastomosis Precision Tracking Test'
  },
  {
    id: 'northsea-uav',
    name: 'North Sea Offshore Energy Rig Alpha',
    region: 'North Sea (Offshore UK/Norway)',
    coordinates: [58.2, 1.9],
    robotCount: 32,
    robotType: 'Coandă Fluidic Thrust UAVs',
    avgLatencyMs: 24.2,
    packetLossPct: 0.12,
    batteryAvgPct: 76,
    status: 'CANARY_ACTIVE',
    activeMission: 'Flare Stack & Riser Structural Corrosion Scan'
  },
  {
    id: 'baltic-defense',
    name: 'Baltic NATO Forward Test Range',
    region: 'Poland / Baltic Littoral',
    coordinates: [54.5, 18.5],
    robotCount: 38,
    robotType: 'EW-Hardened UGVs (GPS-Denied VIO)',
    avgLatencyMs: 14.6,
    packetLossPct: 0.08,
    batteryAvgPct: 82,
    status: 'ELEVATED',
    activeMission: 'Contested GPS Jamming Perimeter Patrol'
  }
];

export const GlobalFleetCommandStudio: React.FC = () => {
  const [selectedTheaterId, setSelectedTheaterId] = useState<string>('uk-logistics');
  const [canaryActive, setCanaryActive] = useState<boolean>(false);
  const [canaryProgress, setCanaryProgress] = useState<number>(0);
  const [safeStateTriggered, setSafeStateTriggered] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectedTheater = THEATERS.find(t => t.id === selectedTheaterId) || THEATERS[0];

  // Total Fleet Metrics
  const totalRobots = THEATERS.reduce((acc, t) => acc + t.robotCount, 0);
  const totalOnline = safeStateTriggered ? 0 : totalRobots;

  // Canary OTA Rollout Simulation Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (canaryActive && canaryProgress < 100) {
      timer = setInterval(() => {
        setCanaryProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 5;
        });
      }, 300);
    }
    return () => clearInterval(timer);
  }, [canaryActive, canaryProgress]);

  // 3D Tactical Vector Globe Canvas Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotation = 0;

    const render = () => {
      rotation += isRotating ? 0.008 : 0;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const r = 110;

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, w, h);

      // Deep space starfield
      ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
      for (let s = 0; s < 45; s++) {
        const sx = ((s * 47) + (rotation * 50)) % w;
        const sy = (s * 31) % h;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Globe Base Atmosphere Glow
      const globeGlow = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r * 1.25);
      globeGlow.addColorStop(0, 'rgba(6, 182, 212, 0.08)');
      globeGlow.addColorStop(0.8, 'rgba(6, 182, 212, 0.02)');
      globeGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = globeGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Globe Sphere Silhouette
      ctx.fillStyle = '#0a101f';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Latitude Parallels
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 0.7;
      for (let lat = -60; lat <= 60; lat += 30) {
        const latRad = (lat * Math.PI) / 180;
        const latY = cy - Math.sin(latRad) * r;
        const latR = Math.cos(latRad) * r;
        ctx.beginPath();
        ctx.ellipse(cx, latY, latR, latR * 0.25, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Longitude Meridians (Rotating with time)
      for (let lon = 0; lon < 360; lon += 45) {
        const lonRad = (lon * Math.PI) / 180 + rotation;
        const xOffset = Math.sin(lonRad) * r;
        const isFront = Math.cos(lonRad) > 0;

        if (isFront) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
          ctx.beginPath();
          ctx.ellipse(cx, cy, Math.abs(xOffset), r, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // 4 Operational Theaters Plotting on 3D Globe
      THEATERS.forEach(theater => {
        const [lat, lon] = theater.coordinates;
        const latRad = (lat * Math.PI) / 180;
        const lonRad = (lon * Math.PI) / 180 + rotation;

        // 3D Spherical projection
        const x3D = r * Math.cos(latRad) * Math.sin(lonRad);
        const y3D = -r * Math.sin(latRad);
        const z3D = r * Math.cos(latRad) * Math.cos(lonRad);

        // Only draw if on front hemisphere (z3D > 0)
        if (z3D > -15) {
          const px = cx + x3D;
          const py = cy + y3D;
          const isSelected = theater.id === selectedTheaterId;

          // Pulse rings around theater
          const pulseR = 6 + (Math.sin(rotation * 4 + theater.robotCount) * 2);
          let markerColor = '#10b981';
          if (theater.status === 'CANARY_ACTIVE') markerColor = '#06b6d4';
          if (theater.status === 'ELEVATED') markerColor = '#f59e0b';
          if (safeStateTriggered) markerColor = '#ef4444';

          ctx.fillStyle = markerColor;
          ctx.beginPath();
          ctx.arc(px, py, pulseR, 0, Math.PI * 2);
          ctx.fill();

          // Selection radar target ring
          if (isSelected) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(px, py, pulseR + 5, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Theater City Label
          ctx.fillStyle = '#ffffff';
          ctx.font = '9px monospace';
          ctx.fillText(`${theater.region} (${theater.robotCount})`, px + 12, py + 3);
        }
      });

      // Bottom HUD on Canvas
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText(
        safeStateTriggered 
          ? 'EMERGENCY SWARM SAFE-STATE ACTIVE · 162 ROBOTS HALTED' 
          : `GLOBAL FLEET OPERATIONS · ${totalRobots} ROBOTS ONLINE · 4 CONTINENTAL THEATERS`, 
        14, h - 14
      );

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isRotating, selectedTheaterId, safeStateTriggered, totalRobots]);

  const zenohFleetCode = `# AIGENESIS Global Multi-Robot Fleet Orchestrator Node
# CycloneDDS / Zenoh P2P Zero-Trust Mesh with Automatic Canary Rollback
import zenoh
import json
import time

class GlobalFleetOrchestrator:
    def __init__(self, theater_id: str = "${selectedTheater.id}"):
        conf = zenoh.Config()
        conf.insert_json5("mode", '"peer"')
        self.session = zenoh.open(conf)
        self.theater_id = theater_id
        self.canary_threshold_err_mm = 0.8
        
        # Subscribe to 1000 Hz aggregate tracking residuals across the cluster
        self.sub = self.session.declare_subscriber(
            f"aigen/fleet/{self.theater_id}/*/telemetry",
            self.on_cluster_telemetry
        )

    def trigger_canary_ota(self, target_version: str = "v2.8.5-prod", canary_pct: float = 10.0):
        """Broadcasts staged OTA package to 10% canary partition with health latch."""
        payload = {
            "action": "CANARY_UPDATE",
            "version": target_version,
            "partition_pct": canary_pct,
            "rollback_trigger_rms_mm": self.canary_threshold_err_mm,
            "timestamp": time.time()
        }
        self.session.put(f"aigen/fleet/{self.theater_id}/ota_manifest", json.dumps(payload))
        print(f"[Canary Governor] Staged rollout active across {canary_pct}% of {self.theater_id}")

    def on_cluster_telemetry(self, sample):
        telemetry = json.loads(sample.payload.decode())
        if telemetry.get("tracking_error_mm", 0.0) > self.canary_threshold_err_mm:
            self.execute_automated_rollback()

    def execute_automated_rollback(self):
        """Emergency <40ms firmware rollback latch upon safety boundary violation."""
        rollback_msg = {"command": "ROLLBACK_PREVIOUS_STABLE", "priority": "CRITICAL_0"}
        self.session.put(f"aigen/fleet/{self.theater_id}/abort_signal", json.dumps(rollback_msg))
        print("[WARNING] Canary boundary breached. Emergency fleet rollback engaged.")`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(zenohFleetCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header and Fleet Overview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Enterprise Operations Deck</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400">162 Autonomous Units</span>
            <span aria-hidden="true">·</span>
            <span>Zero-Trust Zenoh / DDS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            Global Multi-Robot Fleet Operations Command Deck
          </h2>
          <p className="text-xs text-slate-300 max-w-3xl mt-1">
            Monitor, orchestrate, and fail-safe heterogeneous robot fleets operating across four global theaters in real time. Features staged Canary OTA deployments with microsecond rollback and encrypted safe-state halt commands.
          </p>
        </div>

        {/* Global Emergency Swarm Kill Switch */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            onClick={() => setSafeStateTriggered(!safeStateTriggered)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              safeStateTriggered
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black'
                : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 hover:border-rose-400'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{safeStateTriggered ? 'Resume Nominal Operations' : 'Emergency Safe-State Halt'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Fleet Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 3D Tactical Globe Canvas & Theater Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${safeStateTriggered ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                Live Planetary Telemetry Mesh (Zenoh P2P Protocol)
              </span>
              <button
                onClick={() => setIsRotating(!isRotating)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
              >
                {isRotating ? 'Pause Orbit' : 'Resume Orbit'}
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950">
              <canvas
                ref={canvasRef}
                width={640}
                height={330}
                className="w-full h-auto block"
              />
            </div>

            {/* Quick Fleet HUD */}
            <div className="grid grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Total Robots</span>
                <span className="text-sm font-bold text-white">{totalRobots}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Operational</span>
                <span className={`text-sm font-bold ${safeStateTriggered ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {totalOnline} / {totalRobots}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Packet Loss</span>
                <span className="text-sm font-bold text-cyan-400">0.03%</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Fleet Power</span>
                <span className="text-sm font-bold text-amber-400">42.8 kW</span>
              </div>
            </div>
          </div>

          {/* Continental Theaters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THEATERS.map(theater => {
              const isSelected = theater.id === selectedTheaterId;
              return (
                <div
                  key={theater.id}
                  onClick={() => setSelectedTheaterId(theater.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{theater.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      theater.status === 'CANARY_ACTIVE' 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                        : theater.status === 'ELEVATED'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {theater.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 truncate">
                    {theater.robotType}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>{theater.robotCount} Robots Active</span>
                    <span className="text-cyan-400 font-bold">{theater.avgLatencyMs} ms Latency</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Theater Diagnostics & Canary OTA Governor */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                Theater Live Telemetry
              </h3>
              <span className="text-[10px] text-emerald-400">Sub-ms Zenoh</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Theater Name:</span>
                <span className="text-white font-bold">{selectedTheater.name}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Embodiment:</span>
                <span className="text-cyan-400">{selectedTheater.robotType}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Average RTT:</span>
                <span className="text-emerald-400 font-bold">{selectedTheater.avgLatencyMs} ms</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Packet Loss:</span>
                <span className="text-purple-400">{selectedTheater.packetLossPct}%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Battery Level:</span>
                <span className="text-amber-400 font-bold">{selectedTheater.batteryAvgPct}% Avg</span>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Current Autonomous Mission</span>
                <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  {selectedTheater.activeMission}
                </p>
              </div>
            </div>
          </div>

          {/* Canary Over-The-Air (OTA) Deployment Governor */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Canary OTA Firmware Governor
              </h4>
              <span className="text-[10px] text-amber-400 font-bold">Target: v2.8.5-prod</span>
            </div>

            <p className="text-[11px] text-slate-300">
              Stages firmware update across 10% of cluster with sub-40ms automated rollback if kinematics tracking error exceeds 0.8 mm.
            </p>

            {canaryActive ? (
              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-cyan-400 font-bold">Canary Partition Deploying:</span>
                  <span className="text-white font-bold">{canaryProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${canaryProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Tracking Error: 0.24mm (Nominal)</span>
                  <button 
                    onClick={() => { setCanaryActive(false); setCanaryProgress(0); }}
                    className="text-rose-400 hover:underline cursor-pointer"
                  >
                    Abort Canary
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setCanaryActive(true); setCanaryProgress(10); }}
                className="w-full py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Deploy 10% Canary Partition
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Code Export Block */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-bold">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>ROS 2 Humble / Zenoh P2P Fleet Orchestrator & Canary Governor Node</span>
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-cyan-300 transition cursor-pointer"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copiedCode ? 'Copied!' : 'Copy Fleet Python Script'}</span>
          </button>
        </div>
        <pre className="text-[11px] text-slate-300 overflow-x-auto p-3 rounded-xl bg-slate-900/60 leading-relaxed font-mono">
          {zenohFleetCode}
        </pre>
      </div>
    </div>
  );
};
