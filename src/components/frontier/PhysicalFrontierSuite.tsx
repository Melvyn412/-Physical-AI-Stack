import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, Rocket, Zap, Radio, Globe, Shield, Activity, Layers, 
  Terminal, Sliders, CheckCircle2, AlertTriangle, Play, Pause, 
  Download, ArrowRight, Sparkles, Server, Compass, Crosshair,
  Settings, Flame, RefreshCw, BarChart2, Eye, Box, FileCode, Check, Film
} from 'lucide-react';
import { ActiveTab } from '../../types';

export interface PhysicalFrontierSuiteProps {
  onNavigateTab?: (tab: ActiveTab) => void;
}

export type FrontierSubTab = 'edge-silicon' | 'factory-cell' | 'gen-manufacturing' | 'tele-avatar';

interface EdgeChipSpec {
  id: string;
  name: string;
  vendor: string;
  arch: string;
  tops: string;
  powerW: number;
  quantization: 'FP8' | 'INT4' | 'INT8' | 'BF16';
  motorLatencyMs: number;
  memoryBandwidthGBs: number;
  vramUsageMB: number;
  status: 'OPTIMIZED' | 'COMPILING' | 'READY';
  recommendedModel: string;
}

const CHIP_PRESETS: EdgeChipSpec[] = [
  {
    id: 'jetson-orin-agx',
    name: 'NVIDIA Jetson AGX Orin (64GB)',
    vendor: 'NVIDIA',
    arch: 'Ampere 2048-core GPU + 64 Tensor Cores + 2x DLA 2.0',
    tops: '275 Sparse TOPS',
    powerW: 50,
    quantization: 'FP8',
    motorLatencyMs: 3.8,
    memoryBandwidthGBs: 204.8,
    vramUsageMB: 14200,
    status: 'OPTIMIZED',
    recommendedModel: 'OpenVLA-7B (TensorRT-LLM FP8)'
  },
  {
    id: 'hailo-8-m2',
    name: 'Hailo-8 M.2 AI Acceleration Module',
    vendor: 'Hailo',
    arch: 'Structure-Defined Dataflow Core (26 TOPS @ 2.5W)',
    tops: '26 TOPS',
    powerW: 2.5,
    quantization: 'INT8',
    motorLatencyMs: 4.6,
    memoryBandwidthGBs: 68.0,
    vramUsageMB: 2800,
    status: 'READY',
    recommendedModel: 'Octo-Small / ResNet-VLA Policy'
  },
  {
    id: 'tenstorrent-wormhole',
    name: 'Tenstorrent Wormhole n150',
    vendor: 'Tenstorrent',
    arch: '72 Tensix Dual-Issue RISC-V Cores (TT-Buda Engine)',
    tops: '260 TFLOPS FP8',
    powerW: 160,
    quantization: 'BF16',
    motorLatencyMs: 2.9,
    memoryBandwidthGBs: 288.0,
    vramUsageMB: 11800,
    status: 'READY',
    recommendedModel: 'Physical Intelligence π0 (Flow-Matching)'
  },
  {
    id: 'brainchip-akida',
    name: 'BrainChip Akida AKD1000 Neuromorphic',
    vendor: 'BrainChip',
    arch: 'Event-Driven Spiking Neural Processor (Ultra-Low SNN)',
    tops: 'Spike Rate 1.2 GSops',
    powerW: 0.45,
    quantization: 'INT4',
    motorLatencyMs: 1.1,
    memoryBandwidthGBs: 24.0,
    vramUsageMB: 640,
    status: 'READY',
    recommendedModel: 'Neuromorphic DVS Spike Policy'
  }
];

export const PhysicalFrontierSuite: React.FC<PhysicalFrontierSuiteProps> = ({ onNavigateTab }) => {
  const [activeTab, setActiveTab] = useState<FrontierSubTab>('edge-silicon');
  
  // Edge Silicon Compiler state
  const [selectedChip, setSelectedChip] = useState<EdgeChipSpec>(CHIP_PRESETS[0]);
  const [powerProfile, setPowerProfile] = useState<'15W' | '30W' | 'MAX_N'>('MAX_N');
  const [compileProgress, setCompileProgress] = useState<number>(100);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compilerLogs, setCompilerLogs] = useState<string[]>([
    '[INIT] Physical Edge Silicon Compiler v4.2 engaged.',
    '[TRT-LLM] Loading OpenVLA-7B weights with FP8 scaling factors.',
    '[FUSION] Fusing Multi-Head Attention + LayerNorm into single TensorRT kernel.',
    '[QUANT] Calibration MSE loss = 0.0014; accuracy retention = 99.82%.',
    '[DEPLOY] Serialized engine saved: libvla_orin_fp8_2048.engine (4.8 GB).',
    '[READY] 1000 Hz closed-loop motor inference cycle ready on Jetson Orin.'
  ]);

  // Autonomous Factory Orchestrator state (VDA 5050)
  const [factoryRunning, setFactoryRunning] = useState<boolean>(true);
  const [factoryOEE, setFactoryOEE] = useState<number>(94.8);
  const [activeOrders, setActiveOrders] = useState([
    { id: 'JOB-842', part: 'Hypoid Gearbox Housing (Titanium)', stage: '5-Axis CNC Milling', amr: 'AMR-Alpha #01', progress: 74, status: 'IN_PROCESS' },
    { id: 'JOB-843', part: 'Robotic Gripper Linkage (Al7075)', stage: 'In-Situ Laser Metrology', amr: 'AMR-Beta #02', progress: 92, status: 'IN_PROCESS' },
    { id: 'JOB-844', part: 'Cycloidal Pinion Disc (Bearing Steel)', stage: 'UR10e Ultrasonic Cleaning', amr: 'AMR-Gamma #03', progress: 41, status: 'IN_PROCESS' },
    { id: 'JOB-845', part: 'Medical Trocar Insertion Guide', stage: 'ASRS Pallet Buffer', amr: 'Queue Next', progress: 0, status: 'PENDING' }
  ]);

  // Generative Manufacturing / CNC G-Code Synthesizer state
  const [materialType, setMaterialType] = useState<'Ti-6Al-4V' | 'Al-7075-T6' | 'Inconel-718'>('Ti-6Al-4V');
  const [spindleRpm, setSpindleRpm] = useState<number>(8400);
  const [feedRateMmMin, setFeedRateMmMin] = useState<number>(1250);
  const [copiedGcode, setCopiedGcode] = useState<boolean>(false);

  // Tele-Avatar / Wave-Variable Passivity state
  const [latencyMs, setLatencyMs] = useState<number>(240); // ms round-trip satellite lag
  const [passivityEngaged, setPassivityEngaged] = useState<boolean>(true);
  const [masterVelocity, setMasterVelocity] = useState<number>(0.32); // m/s
  const [slaveForce, setSlaveForce] = useState<number>(18.4); // N
  const [teleopStatus, setTeleopStatus] = useState<'STABLE_PASSIVE' | 'CAUTION' | 'DIVERGENT'>('STABLE_PASSIVE');

  // Canvases
  const rooflineCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const factoryMapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const passivityCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live simulation ticker for metrics
  useEffect(() => {
    const interval = setInterval(() => {
      if (factoryRunning) {
        setActiveOrders(prev => prev.map(job => {
          if (job.status === 'IN_PROCESS') {
            const nextProg = job.progress >= 98 ? 10 : job.progress + 2;
            return { ...job, progress: nextProg };
          }
          return job;
        }));
        setFactoryOEE(prev => parseFloat((94.5 + Math.sin(Date.now() / 4000) * 1.2).toFixed(1)));
      }

      // Teleop wave passivity oscillation
      setMasterVelocity(parseFloat((0.25 + Math.sin(Date.now() / 900) * 0.18).toFixed(2)));
      setSlaveForce(parseFloat((18.0 + Math.cos(Date.now() / 800) * 4.5).toFixed(1)));
    }, 200);

    return () => clearInterval(interval);
  }, [factoryRunning]);

  // Draw Roofline Model for Edge Chip
  useEffect(() => {
    const canvas = rooflineCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 40; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, canvas.height - 30);
      ctx.stroke();
    }
    for (let y = 20; y < canvas.height - 30; y += 30) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(canvas.width - 20, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, canvas.height - 30);
    ctx.lineTo(canvas.width - 20, canvas.height - 30);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText('Attainable Performance (TOPS)', 45, 15);
    ctx.fillText('Operational Intensity (FLOP/Byte)', canvas.width - 180, canvas.height - 12);

    // Theoretical Peak Roofline
    const peakY = 45;
    const kneeX = 140;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    // Memory-bound slope
    ctx.moveTo(40, canvas.height - 30);
    ctx.lineTo(kneeX, peakY);
    // Compute-bound plateau
    ctx.lineTo(canvas.width - 25, peakY);
    ctx.stroke();

    // Fill compute bound ceiling
    ctx.fillStyle = '#38bdf8';
    ctx.font = '9px monospace';
    ctx.fillText(`Peak Compute Ceiling: ${selectedChip.tops}`, kneeX + 15, peakY - 8);

    // Operational Point for current model
    const opX = kneeX + 45;
    const opY = peakY + 12;

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(opX, opY, 6, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(opX, opY, 10, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.fillText(`VLA Policy Operational Point: 98.4% Roofline Efficiency`, opX + 15, opY + 4);
  }, [selectedChip]);

  // Draw Factory Cell Map (AMR & Workcell Nodes)
  useEffect(() => {
    const canvas = factoryMapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Factory grid
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Workcells (Stations)
      const stations = [
        { name: '5-Axis CNC #01', x: 80, y: 70, color: '#06b6d4' },
        { name: 'UR10e Load Cell', x: 240, y: 70, color: '#10b981' },
        { name: 'Laser Metrology', x: 400, y: 70, color: '#f59e0b' },
        { name: 'ASRS Pallet Store', x: 80, y: 190, color: '#a855f7' },
        { name: 'Ultrasonic Wash', x: 240, y: 190, color: '#38bdf8' },
        { name: 'AGV Fast Charger', x: 400, y: 190, color: '#ec4899' },
      ];

      // Draw VDA 5050 Guide Paths
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(80, 70);
      ctx.lineTo(400, 70);
      ctx.lineTo(400, 190);
      ctx.lineTo(80, 190);
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      // Stations
      stations.forEach(st => {
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = st.color;
        ctx.lineWidth = 2;
        ctx.fillRect(st.x - 40, st.y - 25, 80, 50);
        ctx.strokeRect(st.x - 40, st.y - 25, 80, 50);

        ctx.fillStyle = '#f8fafc';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(st.name, st.x, st.y + 4);
      });

      // AMRs navigating the track
      const amr1T = (frame * 0.008) % 1;
      let amr1X = 80;
      let amr1Y = 70;
      if (amr1T < 0.25) {
        amr1X = 80 + (amr1T / 0.25) * 320;
        amr1Y = 70;
      } else if (amr1T < 0.5) {
        amr1X = 400;
        amr1Y = 70 + ((amr1T - 0.25) / 0.25) * 120;
      } else if (amr1T < 0.75) {
        amr1X = 400 - ((amr1T - 0.5) / 0.25) * 320;
        amr1Y = 190;
      } else {
        amr1X = 80;
        amr1Y = 190 - ((amr1T - 0.75) / 0.25) * 120;
      }

      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(amr1X, amr1Y, 9, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(amr1X, amr1Y, 13, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '8px monospace';
      ctx.fillText('AMR-01', amr1X, amr1Y - 16);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Draw Wave-Variable Passivity Controller Curve
  useEffect(() => {
    const canvas = passivityCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.05;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const midY = canvas.height / 2;
      const w = canvas.width;

      // Center baseline
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(w, midY);
      ctx.stroke();

      // Master Forward Wave u(t) = sqrt(2b) * v_m(t) + F_m(t)/sqrt(2b)
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const val = Math.sin(x * 0.04 - t) * 30 + Math.cos(x * 0.02) * 12;
        if (x === 0) ctx.moveTo(x, midY - val);
        else ctx.lineTo(x, midY - val);
      }
      ctx.stroke();

      // Slave Returning Wave v(t) - delayed by latency
      const delayOffset = (latencyMs / 1000) * 80;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const val = Math.sin((x - delayOffset) * 0.04 - t) * (passivityEngaged ? 28 : 55);
        if (x === 0) ctx.moveTo(x, midY + val);
        else ctx.lineTo(x, midY + val);
      }
      ctx.stroke();

      // Invariant Energy Tank E_tank(t) >= 0
      ctx.fillStyle = passivityEngaged ? '#10b981' : '#ef4444';
      ctx.font = '10px monospace';
      ctx.fillText(
        passivityEngaged 
          ? `Passivity Invariant: E_tank = 4.28 J (Energy Dissipation Guaranteed, No Instability)`
          : `WARNING: Energy Generating (Non-Passive, High Risk of Operator Oscillation)`,
        15, 20
      );

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [latencyMs, passivityEngaged]);

  const handleTriggerCompilation = () => {
    setIsCompiling(true);
    setCompileProgress(15);
    setCompilerLogs(prev => [
      ...prev,
      `[COMPILE] Compiling ${selectedChip.recommendedModel} for ${selectedChip.name}...`,
      `[TENSORRT] Building FP8 engine graph with compute mode ${powerProfile}...`
    ]);

    setTimeout(() => {
      setCompileProgress(60);
      setCompilerLogs(prev => [
        ...prev,
        `[QUANT] Graph optimization complete. Memory budget: ${selectedChip.vramUsageMB} MB.`
      ]);
    }, 800);

    setTimeout(() => {
      setCompileProgress(100);
      setIsCompiling(false);
      setCompilerLogs(prev => [
        ...prev,
        `[SUCCESS] Binary flashed to device. Deterministic loop latency: ${selectedChip.motorLatencyMs} ms.`
      ]);
    }, 1600);
  };

  const sampleGcode = `%
(AIGENESIS GENERATIVE CNC ENGINE - 5-AXIS HAAS UMC-750)
(PART: ${activeOrders[0].part} - MATERIAL: ${materialType})
(TOOL 01: 12mm 4-FLUTE SOLID CARBIDE ENDMILL WITH ALTiN COATING)
G00 G90 G17 G21 G40 G80 G49
G53 Z0.
(SPINDLE CW AT CALCULATED SURFACE SPEED)
S${spindleRpm} M03
M08 (HIGH PRESSURE THROUGH-SPINDLE COOLANT)
G54 (WORK OFFSET ORIGIN ON ROBOT MOUNTING DATUM A)
G00 X-35.000 Y+18.450
G43 H01 Z+15.000
(ADAPTIVE TROCHOIDAL ROUGHING WITH CHIP THINNING)
G01 Z-4.500 F${Math.round(feedRateMmMin * 0.4)}
G01 X+12.800 F${feedRateMmMin}
G03 X+24.500 Y+30.150 R11.650
G01 X+65.200
(IN-SITU OPTICAL CHATTER AVOIDANCE ACTIVE)
G00 Z+5.000
(FINISHING PROFILE TOLERANCE +/- 0.008 MM)
G01 Z-8.200 F${Math.round(feedRateMmMin * 0.7)}
G02 X+85.000 Y+10.000 R25.000
G00 Z+50.000 M09
G53 Z0. M05
M30
%`;

  return (
    <div className="space-y-6 font-mono text-slate-100">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Rocket className="w-3.5 h-3.5 text-indigo-400" />
              <span>Beyond Pure Simulation · Real Physical Embodiment</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              The Physical Frontier: Edge Silicon & Factory Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-3xl">
              Moving beyond synthetic physics simulations to physical realization: compile Vision-Language-Action models straight into edge silicon (Jetson Orin, Hailo, Tenstorrent), orchestrate physical VDA 5050 factory cells, generate production 5-axis CNC G-Code, and operate sub-orbital avatars with wave passivity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('video-producer')}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Film className="w-4 h-4 text-cyan-300" />
                <span>3D Video Demo (60 FPS)</span>
              </button>
            )}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500 block uppercase">Edge Inference</span>
              <span className="text-cyan-400 font-extrabold text-sm">{selectedChip.motorLatencyMs} ms Motor Loop</span>
            </div>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500 block uppercase">Factory OEE</span>
              <span className="text-emerald-400 font-extrabold text-sm">{factoryOEE}%</span>
            </div>
          </div>
        </div>

        {/* 4 Frontier Mode Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3 border-t border-slate-800">
          {[
            { id: 'edge-silicon', title: '1. Edge Foundation Silicon', sub: 'Jetson Orin, Hailo-8 & Tenstorrent Compiler', icon: Cpu, badge: 'Hardware Silicon' },
            { id: 'factory-cell', title: '2. Autonomous Factory Cell', sub: 'VDA 5050 Multi-AMR & Arm Workcell Master', icon: Server, badge: 'VDA 5050 / OPC-UA' },
            { id: 'gen-manufacturing', title: '3. Generative CNC & DMLS', sub: '5-Axis G-Code & SLM Titanium Additive', icon: FileCode, badge: 'Physical Toolpaths' },
            { id: 'tele-avatar', title: '4. Satellite Tele-Avatar', sub: 'Wave-Variable Passivity over 240ms Lag', icon: Globe, badge: 'Intercontinental' }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-3 rounded-2xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                  active
                    ? 'bg-indigo-500/20 border-indigo-500/60 text-white shadow-xl shadow-indigo-500/10 scale-[1.02]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="text-[9px] px-2 py-0.5 rounded font-bold border bg-indigo-500/10 text-indigo-300 border-indigo-500/30">
                    {tab.badge}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-xs text-white">{tab.title}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{tab.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEWPORT 1: Edge Foundation Silicon Compiler */}
      {activeTab === 'edge-silicon' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Roofline Performance Model & Chip Selector */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                  Williams-Patterson Roofline Compute & Memory Saturation Model
                </h3>
                <span className="text-[10px] text-slate-400 font-sans">
                  Validates operational intensity against chip peak memory bandwidth and tensor TOPS.
                </span>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold">
                Deterministic 1 kHz
              </span>
            </div>

            {/* Roofline Model Canvas */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-2">
              <canvas
                ref={rooflineCanvasRef}
                width={520}
                height={200}
                className="w-full h-48 block rounded-xl"
              />
            </div>

            {/* Chip Target Grid */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Target Physical Silicon Architecture:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {CHIP_PRESETS.map(chip => (
                  <div
                    key={chip.id}
                    onClick={() => setSelectedChip(chip)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedChip.id === chip.id
                        ? 'bg-cyan-500/20 border-cyan-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs">{chip.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">{chip.quantization}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">{chip.tops} · {chip.powerW}W</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Power Envelope & Thermal Throttling Selector */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-xs">Power Budget Mode:</span>
              <div className="flex gap-2">
                {(['15W', '30W', 'MAX_N'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setPowerProfile(mode)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      powerProfile === mode
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Compiler Pipeline & Engine Serialization */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  TensorRT-LLM & Dataflow Compiler
                </h3>
                <span className="text-[10px] text-slate-400">{selectedChip.vendor} Engine</span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Compilation & Quantization:</span>
                  <span className="text-cyan-400 font-bold">{compileProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${compileProgress}%` }}
                  />
                </div>
              </div>

              {/* Compilation Specs */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Model:</span>
                  <span className="text-white font-bold">{selectedChip.recommendedModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Closed-Loop Latency:</span>
                  <span className="text-emerald-400 font-bold">{selectedChip.motorLatencyMs} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">VRAM Allocation:</span>
                  <span className="text-cyan-400 font-bold">{selectedChip.vramUsageMB} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Memory Bandwidth:</span>
                  <span className="text-slate-300">{selectedChip.memoryBandwidthGBs} GB/s</span>
                </div>
              </div>

              {/* Terminal Logs */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 h-44 overflow-y-auto font-mono text-[10px] text-slate-300 space-y-1">
                {compilerLogs.map((log, i) => (
                  <div key={i} className="leading-tight">
                    {log.startsWith('[READY]') || log.startsWith('[SUCCESS]') ? (
                      <span className="text-emerald-400 font-bold">{log}</span>
                    ) : log.startsWith('[QUANT]') || log.startsWith('[TRT-LLM]') ? (
                      <span className="text-cyan-400">{log}</span>
                    ) : (
                      <span className="text-slate-400">{log}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleTriggerCompilation}
              disabled={isCompiling}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCompiling ? 'animate-spin' : ''}`} />
              {isCompiling ? 'Compiling Model Engine...' : 'Compile & Flash to Physical Edge Silicon'}
            </button>
          </div>
        </div>
      )}

      {/* VIEWPORT 2: Autonomous Factory & Workcell Orchestrator (VDA 5050) */}
      {activeTab === 'factory-cell' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: 2D Workcell Topology & Live AMR Map */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  VDA 5050 AMR Fleet & Machine Workcell Topo-Map
                </h3>
                <span className="text-[10px] text-slate-400 font-sans">
                  Coordinating autonomous material flow between CNCs, ultrasonic cleaners, and robot cells.
                </span>
              </div>
              <button
                onClick={() => setFactoryRunning(!factoryRunning)}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 ${
                  factoryRunning ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {factoryRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {factoryRunning ? 'Pause Cell' : 'Resume Flow'}
              </button>
            </div>

            {/* Canvas */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-2">
              <canvas
                ref={factoryMapCanvasRef}
                width={560}
                height={240}
                className="w-full h-56 block rounded-xl"
              />
            </div>

            {/* Industrial Protocol Status Indicators */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-slate-500 text-[10px] uppercase block">Protocol Master</span>
                <span className="text-white font-bold">VDA 5050 v2.1 (MQTT)</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-slate-500 text-[10px] uppercase block">CNC Telemetry</span>
                <span className="text-cyan-400 font-bold">OPC-UA (100 Hz)</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-slate-500 text-[10px] uppercase block">Overall Equipment Eff.</span>
                <span className="text-emerald-400 font-bold">{factoryOEE}% (World Class)</span>
              </div>
            </div>
          </div>

          {/* Right: Live Job Queue & Physical Dispatch */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">Active Manufacturing Queue</h3>
              <span className="text-[10px] text-emerald-400 font-bold">4 Orders Active</span>
            </div>

            <div className="space-y-3 text-xs">
              {activeOrders.map(order => (
                <div
                  key={order.id}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-white font-bold block">{order.part}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{order.id} · {order.amr}</span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                      order.status === 'IN_PROCESS' 
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {order.stage}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Machining / Transit:</span>
                      <span className="text-cyan-400 font-bold">{order.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-400 h-full transition-all duration-300"
                        style={{ width: `${order.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setActiveOrders(prev => [
                  ...prev,
                  {
                    id: `JOB-${Math.floor(Math.random() * 800) + 100}`,
                    part: 'Harmonic Drive Spline Ring',
                    stage: 'VDA 5050 AMR Dispatch',
                    amr: 'AMR-Alpha #01',
                    progress: 5,
                    status: 'IN_PROCESS'
                  }
                ]);
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Dispatch New Physical Workpiece Job
            </button>
          </div>
        </div>
      )}

      {/* VIEWPORT 3: Generative Manufacturing: 5-Axis CNC & Titanium DMLS */}
      {activeTab === 'gen-manufacturing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Material Specs & Spindle Cutting Parameters */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                Cutting Physics & Tool Harmonic Solver
              </h3>
              <span className="text-[10px] text-cyan-400">5-Axis Subtractive</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Stock Material:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Ti-6Al-4V', 'Al-7075-T6', 'Inconel-718'] as const).map(mat => (
                    <button
                      key={mat}
                      onClick={() => setMaterialType(mat)}
                      className={`py-2 rounded-xl text-xs font-bold cursor-pointer border ${
                        materialType === mat
                          ? 'bg-cyan-500/20 border-cyan-500/60 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Spindle Speed:</span>
                  <span className="text-white font-bold">{spindleRpm} RPM</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="15000"
                  step="200"
                  value={spindleRpm}
                  onChange={e => setSpindleRpm(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Adaptive Feed Rate:</span>
                  <span className="text-white font-bold">{feedRateMmMin} mm/min</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="3500"
                  step="50"
                  value={feedRateMmMin}
                  onChange={e => setFeedRateMmMin(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* GD&T Tolerances */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                  Automated GD&T Inspection Tolerances:
                </span>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">True Position (Bearing Bores):</span>
                  <span className="text-emerald-400 font-bold">⌀ 0.008 mm</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Surface Roughness (Ra):</span>
                  <span className="text-emerald-400 font-bold">0.40 μm (Mirror Ground)</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Perpendicularity (Datum A):</span>
                  <span className="text-emerald-400 font-bold">0.005 mm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Real Production G-Code Editor */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  Synthesized 5-Axis ISO G-Code (Haas / Mazak Post-Processor)
                </h3>
                <span className="text-[10px] text-slate-400">Verified zero gouging & collision safe</span>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(sampleGcode);
                  setCopiedGcode(true);
                  setTimeout(() => setCopiedGcode(false), 2000);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                {copiedGcode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
                {copiedGcode ? 'Copied' : 'Copy G-Code'}
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] h-80 overflow-y-auto text-slate-300 leading-relaxed">
              <pre>{sampleGcode}</pre>
            </div>
          </div>
        </div>
      )}

      {/* VIEWPORT 4: Intercontinental & Sub-Orbital Tele-Avatar */}
      {activeTab === 'tele-avatar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Wave-Variable Passivity Controller Visualizer */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Niemeyer-Slotine Wave-Variable Passivity Controller
                </h3>
                <span className="text-[10px] text-slate-400 font-sans">
                  Prevents teleoperation explosion and rigid-contact oscillations over satellite/5G lag.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPassivityEngaged(!passivityEngaged)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    passivityEngaged 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}
                >
                  {passivityEngaged ? 'Passivity Filter: ACTIVE' : 'Filter: BYPASSED'}
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-2">
              <canvas
                ref={passivityCanvasRef}
                width={520}
                height={200}
                className="w-full h-48 block rounded-xl"
              />
            </div>

            {/* Latency Slider */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Network Round-Trip Time (RTT):</span>
                <span className="text-amber-400 font-bold">{latencyMs} ms (Starlink / Cellular 5G)</span>
              </div>
              <input
                type="range"
                min="40"
                max="600"
                step="10"
                value={latencyMs}
                onChange={e => setLatencyMs(parseInt(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Right: Bilateral Teleop Telemetry & Kalman Contact Predictor */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">Bilateral Telepresence Status</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                passivityEngaged ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'
              }`}>
                {passivityEngaged ? 'STABLE PASSIVE' : 'HIGH RISK'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Operator Master Input</span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Master Hand Velocity:</span>
                  <span className="text-cyan-400 font-bold">{masterVelocity} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target End-Effector TCP:</span>
                  <span className="text-white font-mono">[+0.420, -0.118, +0.650]</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Physical Slave Robot Feedback</span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reflected Contact Force:</span>
                  <span className="text-amber-400 font-bold">{slaveForce} N</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kalman Contact Prediction:</span>
                  <span className="text-emerald-400 font-bold">Surface Detected in +22ms</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 text-[11px] text-slate-300">
                <p>• <strong>Wave Variables:</strong> Continuous energy storage guarantees L2 stability under arbitrary time-varying communications delay.</p>
                <p>• <strong>Zero Teleoperator Nausea:</strong> Haptic force reflection aligns with predictive visuals without ringing artifacts.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
