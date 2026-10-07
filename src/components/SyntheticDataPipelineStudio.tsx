import React, { useState } from 'react';
import {
  Database, Camera, Layers, Eye, Activity, Download, Play, Pause,
  RotateCcw, Sparkles, CheckCircle2, AlertTriangle, FileCode, Sliders,
  Terminal, ShieldCheck, RefreshCw, Copy, Check, Boxes, Zap, Cpu,
  Radio, Film, Award, ArrowRight, Table, ExternalLink
} from 'lucide-react';
import { useQuota } from '../hooks/useQuota';

export type SyntheticDataTab = 'annotations' | 'domain_rand' | 'scene_replay' | 'export_stacks' | 'sim2real_checklist';

interface SynchronizedAnnotationStream {
  id: string;
  name: string;
  modality: string;
  dataType: string;
  resolutionOrRate: string;
  sampleValue: string;
  description: string;
  previewColor: string;
}

interface DomainRandomizationParam {
  category: 'Cameras' | 'Lighting' | 'Materials' | 'Motion & Blur' | 'Sensor Noise' | 'Backgrounds' | 'Object States';
  parameterName: string;
  rangeOrOptions: string;
  distribution: string;
  currentValue: string;
  simToRealBenefit: string;
}

interface ReplayableSceneConfig {
  id: string;
  sceneName: string;
  randomSeed: number;
  environmentType: string;
  objectCount: number;
  annotatedFrames: number;
  sceneYamlSnippet: string;
  downloadPayload: string;
}

interface TrainingStackExport {
  id: string;
  stackName: string;
  format: string;
  targetFramework: string;
  useCase: string;
  exportCommand: string;
  sampleDirectory: string;
  isPopular: boolean;
}

interface SimToRealChecklistItem {
  dimension: string;
  simulationRange: string;
  physicalHardwareObserved: string;
  status: 'AUDITED & BOUNDED' | 'NEEDS RESIDUAL CALIBRATION' | 'UNMODELED ARTIFACT';
  mitigationApplied: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
}

const ANNOTATION_STREAMS: SynchronizedAnnotationStream[] = [
  {
    id: 'stream_rgb',
    name: 'Photorealistic RGB Camera',
    modality: 'Camera (RGB)',
    dataType: 'uint8 [1920, 1080, 3] @ sRGB',
    resolutionOrRate: '60 FPS / 1080p',
    sampleValue: 'frame_00428.png (PNG / WebP)',
    description: 'Path-traced raymarched camera view with physically based specular reflections & lens distortion.',
    previewColor: 'text-cyan-400',
  },
  {
    id: 'stream_depth',
    name: 'Metric 32-Bit Floating Point Depth',
    modality: 'Depth (Metric Z)',
    dataType: 'float32 [1920, 1080] in meters',
    resolutionOrRate: '60 FPS / Metric Z',
    sampleValue: 'Z_min: 0.182m, Z_max: 3.450m',
    description: 'Sub-millimeter radial & linear depth map calibrated with simulated infrared noise & edge shadow blur.',
    previewColor: 'text-indigo-400',
  },
  {
    id: 'stream_seg',
    name: 'Instance & Semantic Segmentation Mask',
    modality: 'Segmentation',
    dataType: 'uint16 [1920, 1080] category + instance ID',
    resolutionOrRate: 'Pixel-Perfect Ground Truth',
    sampleValue: 'ID 1: robot_arm, ID 2: gripper, ID 3: part_flange',
    description: 'COCO / Panoptic masks separating foreground workpiece, robotic links, table, and background clutter.',
    previewColor: 'text-purple-400',
  },
  {
    id: 'stream_pose',
    name: '6D Object & Joint Ground-Truth Poses',
    modality: '6D Pose Estimation',
    dataType: 'SE(3) [x, y, z, qx, qy, qz, qw] 7-DOF',
    resolutionOrRate: '1000 Hz Sub-ms',
    sampleValue: 'T = [-0.142, 0.450, 0.210], Q = [0, 0.707, 0, 0.707]',
    description: 'Absolute 6D bounding cuboids and transform matrices in robot base coordinates with ±0.01mm ground-truth.',
    previewColor: 'text-emerald-400',
  },
  {
    id: 'stream_flow',
    name: 'Forward/Backward Optical Flow',
    modality: 'Optical Flow',
    dataType: 'float32 [1920, 1080, 2] (u, v vectors in px)',
    resolutionOrRate: '60 FPS Dense Flow',
    sampleValue: 'max_velocity = 84.2 px/frame',
    description: 'Sub-pixel 2D motion vector flow across consecutive frames for optical tracking and flow-matching policies.',
    previewColor: 'text-amber-400',
  },
  {
    id: 'stream_force',
    name: '6-Axis Wrench Force/Torque (F/T)',
    modality: 'Contact & Load Wrench',
    dataType: 'float64 [Fx, Fy, Fz, Tx, Ty, Tz] in N & N·m',
    resolutionOrRate: '1000 Hz Hardware Bus',
    sampleValue: 'F = [0.2, -1.8, 14.5] N, T = [0.02, 0.14, -0.05] Nm',
    description: 'Simulated strain-gauge load cell with structural compliance, dynamic vibration ring, and Coulomb friction.',
    previewColor: 'text-rose-400',
  },
  {
    id: 'stream_tactile',
    name: 'Optical Tactile GelSight Array',
    modality: 'Tactile Elastomer',
    dataType: 'uint8 [640, 480, 3] + Depth Delta [640, 480]',
    resolutionOrRate: '100 Hz Tactile Stream',
    sampleValue: 'gel_deformation_max = 0.84 mm',
    description: 'Sub-surface marker tracking & photometric stereo elastomer indentation during grasp contact.',
    previewColor: 'text-teal-400',
  },
  {
    id: 'stream_joint',
    name: 'Actuator Joint-State Telemetry',
    modality: 'Joint State (q, q_dot, tau)',
    dataType: 'float64 [q(1..7), q_dot(1..7), tau(1..7)]',
    resolutionOrRate: '1000 Hz ros2_control',
    sampleValue: 'q_elbow = -1.5708 rad, tau = 18.4 Nm',
    description: 'Synchronized encoder position, velocity, and effort torque with motor backlash deadband.',
    previewColor: 'text-sky-400',
  },
  {
    id: 'stream_dvs',
    name: 'Neuromorphic Event Stream (DVS)',
    modality: 'Event Camera (DVS)',
    dataType: 'AER events [timestamp_us, x, y, polarity ±1]',
    resolutionOrRate: '142,000 events/sec',
    sampleValue: 't=124018us, x=482, y=210, pol=+1',
    description: 'Asynchronous event spikes fired whenever pixel log-intensity changes, simulating Prophesee Metavision DVS.',
    previewColor: 'text-violet-400',
  },
];

const DOMAIN_RANDOMIZATION_CONFIGS: DomainRandomizationParam[] = [
  {
    category: 'Cameras',
    parameterName: 'Camera Extrinsics & FOV',
    rangeOrOptions: 'Pose ±80mm X/Y/Z, Angle ±15° Pitch/Yaw, FOV 55°–85°',
    distribution: 'Uniform Gaussian Jitter',
    currentValue: 'X: +24mm, Pitch: -4.2°, FOV: 68.5°',
    simToRealBenefit: 'Prevents policies from memorizing exact camera mounting positions.',
  },
  {
    category: 'Lighting',
    parameterName: 'Sun Direction, CCT & Shadows',
    rangeOrOptions: 'CCT 2800K–7500K, Intensity 200–2500 lux, 3x Fill Lights',
    distribution: 'Poisson Random Walk',
    currentValue: 'CCT: 5200K, Intensity: 1450 lux (High Daylight Glare)',
    simToRealBenefit: 'Ensures vision models operate under fluorescent tubes, night shifts, and daylight skylights.',
  },
  {
    category: 'Materials',
    parameterName: 'Roughness, Metalness & Friction (μ)',
    rangeOrOptions: 'Roughness 0.1–0.9, Friction μ 0.18–0.85, Restitution 0.05–0.60',
    distribution: 'Latin Hypercube Sampled',
    currentValue: 'Ra: 3.2 µm, μ: 0.38 (Wet Lubricant Contamination)',
    simToRealBenefit: 'Calibrates for oil mist, anodized coatings, and surface scratches.',
  },
  {
    category: 'Motion & Blur',
    parameterName: 'Shutter Time & Micro-Tremor',
    rangeOrOptions: 'Shutter 1/120s – 1/2000s, Tremor freq 12–45 Hz',
    distribution: 'Weibull Distribution',
    currentValue: 'Shutter: 1/250s, Hand tremor amplitude: 1.8 px',
    simToRealBenefit: 'Prevents vision model failure during high-velocity robotic sweeps.',
  },
  {
    category: 'Sensor Noise',
    parameterName: 'Depth Dropouts & Salt-and-Pepper',
    rangeOrOptions: 'IR multipath noise 1%–12%, Gaussian readout noise σ=0.03',
    distribution: 'Heavy-Tailed Cauchy Noise',
    currentValue: 'Missing depth edge pixels: 5.4%',
    simToRealBenefit: 'Simulates RealSense D435 specular dropouts on shiny sheet metal.',
  },
  {
    category: 'Backgrounds',
    parameterName: 'Procedural Distractor Clutter',
    rangeOrOptions: '500+ HDRI factory backgrounds, 12 procedural floor textures',
    distribution: 'Categorical Randomized',
    currentValue: 'Background #142 (Automotive Body Shop Assembly Hall)',
    simToRealBenefit: 'Forces policy to attend to the workpiece rather than static workshop wallpaper.',
  },
  {
    category: 'Object States',
    parameterName: 'Payload Mass & In-Hand Slip Angle',
    rangeOrOptions: 'Mass 1.2kg – 5.8kg, Grasp yaw offset ±35°',
    distribution: 'Normal (Gaussian)',
    currentValue: 'Mass: 4.22 kg, Initial Grasp Offset: +12.4°',
    simToRealBenefit: 'Validates policy robustness against manufacturing batch variance.',
  },
];

const REPLAYABLE_SCENES: ReplayableSceneConfig[] = [
  {
    id: 'SCENE-SEED-9081',
    sceneName: 'Coandă Thrust Vectoring Gust Inflow & High-Speed Valve Transient',
    randomSeed: 9081,
    environmentType: 'High-Altitude Crosswind Defile (Mach 0.38)',
    objectCount: 6,
    annotatedFrames: 3600,
    sceneYamlSnippet: `scenario_id: "coanda_gust_9081"
seed: 9081
wind_tunnel:
  crosswind_gust_knots: 48.5
  turbulence_intensity_pct: 38.2
nozzle:
  throat_height_mm: 1.12
  collar_roughness_ra_um: 3.15
  actuator_latency_ms: 1.85
sensors_enabled: ["rgb", "depth", "pressure_kulite", "dvs_events"]`,
    downloadPayload: 'AIGENESIS_SCENE_CONFIG_9081.yaml',
  },
  {
    id: 'SCENE-SEED-4412',
    sceneName: 'UR10e Industrial Bin-Picking with Wet Lubricant Stamped Parts',
    randomSeed: 4412,
    environmentType: 'Factory Floor Anodized Jig Tray',
    objectCount: 24,
    annotatedFrames: 4800,
    sceneYamlSnippet: `scenario_id: "ur10e_kitting_4412"
seed: 4412
lighting:
  lux: 1650
  cct_kelvin: 5800
workpiece:
  friction_mu: 0.38
  mass_kg: 4.22
camera_pose:
  x_offset_mm: 18.4
  pitch_deg: -32.5
sensors_enabled: ["rgb", "depth", "segmentation", "pose_6d", "ft_wrench", "tactile_gelsight"]`,
    downloadPayload: 'AIGENESIS_SCENE_CONFIG_4412.yaml',
  },
];

const TRAINING_STACK_EXPORTS: TrainingStackExport[] = [
  {
    id: 'lerobot_rlds',
    stackName: 'Hugging Face LeRobot & RLDS (OpenVLA / ACT / Diffusion Policy)',
    format: 'Hugging Face Datasets / Arrow / RLDS TFDS',
    targetFramework: 'LeRobot, OpenVLA, π₀ (Physical Intelligence), Octo',
    useCase: 'Action Chunking with Transformers (ACT) & Diffusion visual policy training',
    exportCommand: 'python -m aigenesis.export --dataset ./runs/4412 --format lerobot --out ./hf_dataset',
    sampleDirectory: 'dataset/data/chunk-000.parquet (RGB + Depth + Joint State + 7D Action)',
    isPopular: true,
  },
  {
    id: 'isaac_lab',
    stackName: 'NVIDIA Isaac Lab & Orbit (PPO / GPU Vectorized RL)',
    format: 'USD + PyTorch Tensor Clones (.pt / .h5)',
    targetFramework: 'Isaac Lab, Isaac Sim 4.2+, Isaac Gym Envs',
    useCase: 'Massively parallel GPU reinforcement learning across 4,096 environments',
    exportCommand: 'python -m aigenesis.export --dataset ./runs/4412 --format isaac_lab --env-usd ./scene.usd',
    sampleDirectory: 'isaac_lab_env/policy_buffer.pt (Parallel Observation & Reward Tensors)',
    isPopular: true,
  },
  {
    id: 'bop_pose',
    stackName: 'BOP Benchmark (6D Object Pose Estimation & Vision)',
    format: 'BOP standard (RGB, Depth, Camera Intrinsics, 6D ground truth)',
    targetFramework: 'CosyPose, MegaPose, FoundationPose, PointNet++',
    useCase: 'Zero-shot and fine-tuned 6D CAD-to-camera pose estimation',
    exportCommand: 'python -m aigenesis.export --dataset ./runs/4412 --format bop --cad ./workpiece.ply',
    sampleDirectory: 'bop_dataset/train_pbr/000000/{rgb,depth,scene_gt.json}',
    isPopular: false,
  },
  {
    id: 'ros2_bag',
    stackName: 'ROS 2 MCAP Native Bag (Hardware Replay)',
    format: 'MCAP / ROS 2 Humble bag (sensor_msgs, geometry_msgs)',
    targetFramework: 'Foxglove Studio, ROS 2 Nav2, MoveIt 2, Zenoh',
    useCase: 'Hardware-in-the-Loop playback into physical robot motor controllers',
    exportCommand: 'ros2 bag play ./aigenesis_run_4412.mcap --clock 1000',
    sampleDirectory: 'aigenesis_telemetry.mcap (1000 Hz Clock, Image, TF, JointState, Wrench)',
    isPopular: true,
  },
];

const SIM2REAL_CHECKLIST: SimToRealChecklistItem[] = [
  {
    dimension: 'Camera Opticals & ISP Lens Distortion',
    simulationRange: 'Brown-Conrady radial k1, k2, tangential p1, p2 randomized ±8%',
    physicalHardwareObserved: 'RealSense D435 factory calibration factory report loaded',
    status: 'AUDITED & BOUNDED',
    mitigationApplied: 'OpenCV camera matrix undistortion node applied pre-inference.',
    riskRating: 'LOW',
  },
  {
    dimension: 'Surface Friction & Lubricant Degradation',
    simulationRange: 'Friction μ randomized across [0.18, 0.85] (Latin Hypercube)',
    physicalHardwareObserved: 'Industrial coolant mist drops dry rubber grip to μ = 0.38',
    status: 'AUDITED & BOUNDED',
    mitigationApplied: 'Tactile micro-slip reflex clamps normal force within 4.2ms.',
    riskRating: 'LOW',
  },
  {
    dimension: 'Harmonic Drive Backlash & Gear Deadband',
    simulationRange: 'Backlash deadband modeled as 0.5 arcmin nominal ±0.8 arcmin',
    physicalHardwareObserved: 'Joint 4 exhibits 1.2 arcmin backlash after 2,000 thermal cycles',
    status: 'NEEDS RESIDUAL CALIBRATION',
    mitigationApplied: 'Dual-encoder load side observer compensation loop enabled in firmware.',
    riskRating: 'MEDIUM',
  },
  {
    dimension: 'Actuator Transport & Linux Kernel Jitter',
    simulationRange: 'Uniform delay 0.5ms – 3.5ms (randomized packet loss 0%–5%)',
    physicalHardwareObserved: 'EtherCAT cycle measured at 1.82ms with 180µs kernel jitter',
    status: 'AUDITED & BOUNDED',
    mitigationApplied: 'PREEMPT_RT kernel thread tuning + anticipatory feedforward.',
    riskRating: 'LOW',
  },
  {
    dimension: 'High-Frequency Acoustic Resonance (>2 kHz)',
    simulationRange: 'CFD mesh cut-off frequency at 1.2 kHz (acoustic modes truncated)',
    physicalHardwareObserved: 'Transducer detects 2.4 kHz cavity whistle at Mach 0.45',
    status: 'UNMODELED ARTIFACT',
    mitigationApplied: 'Analog Butterworth notch filter in hardware DAQ prevents aliasing.',
    riskRating: 'HIGH',
  },
];

export const SyntheticDataPipelineStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SyntheticDataTab>('annotations');
  const [isSynthesizingDataset, setIsSynthesizingDataset] = useState<boolean>(false);
  const [datasetProgress, setDatasetProgress] = useState<number>(100);
  const [selectedFormat, setSelectedFormat] = useState<string>('lerobot_rlds');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const handleSynthesizeBatch = () => {
    setIsSynthesizingDataset(true);
    setDatasetProgress(0);

    const interval = setInterval(() => {
      setDatasetProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSynthesizingDataset(false);
          setNotification('Synthesized 10,000 multi-modal annotated frames across 64 randomized domain variants!');
          setTimeout(() => setNotification(null), 4000);
          return 100;
        }
        return prev + 15;
      });
    }, 120);
  };

  const handleExportFullDataset = () => {
    const datasetManifest = {
      pipelineVersion: 'AIGENESIS Synthetic Data Engine v5.2',
      exportTimestamp: new Date().toISOString(),
      trainingStackTarget: selectedFormat,
      totalFramesGenerated: 10000,
      modalitiesProvided: ANNOTATION_STREAMS.map(s => s.modality),
      domainRandomizationParameters: DOMAIN_RANDOMIZATION_CONFIGS,
      replayableSceneConfigs: REPLAYABLE_SCENES,
      simToRealGapChecklist: SIM2REAL_CHECKLIST,
    };

    const blob = new Blob([JSON.stringify(datasetManifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIGENESIS_SYNTHETIC_DATASET_MANIFEST_${selectedFormat.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setNotification(`Exported complete Synthetic Dataset Manifest for ${selectedFormat.toUpperCase()}!`);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-8 animate-fadeIn font-mono pb-16">
      {/* Studio Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-400">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>SIMULATION-TO-SYNTHETIC-DATA PIPELINE</span>
            </span>
            <span>·</span>
            <span className="text-emerald-400">9 Synchronized Modalities</span>
            <span>·</span>
            <span className="text-purple-400">LeRobot / Isaac Lab / ROS 2 Ready</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Simulation-to-Synthetic-Data Pipeline Studio
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl font-sans">
            Convert physics simulations into production-grade multi-modal training datasets. Extract 9 synchronized annotations from a single run, apply deep domain randomization, replay deterministic scenes, export to standard ML stacks, and verify your Sim-to-Real gap checklist.
          </p>
        </div>

        {/* Action Controls */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleSynthesizeBatch}
            disabled={isSynthesizingDataset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer shadow-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSynthesizingDataset ? 'animate-spin' : ''}`} />
            <span>{isSynthesizingDataset ? `Generating Batch (${datasetProgress}%)...` : 'Synthesize 10k Frames'}</span>
          </button>

          <button
            onClick={handleExportFullDataset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Dataset Manifest (.JSON)</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Header Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-500 block uppercase">Single-Run Modalities</span>
          <span className="text-xl sm:text-2xl font-bold text-cyan-400">9 Streams</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">RGB to Neuromorphic DVS</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-500 block uppercase">Domain Randomization</span>
          <span className="text-xl sm:text-2xl font-bold text-purple-400">7 Dimensions</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Latin Hypercube Sampled</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-500 block uppercase">Supported ML Stacks</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-400">4 Stacks</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">LeRobot, Isaac Lab, BOP, ROS2</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-500 block uppercase">Sim-to-Real Audit</span>
          <span className="text-xl sm:text-2xl font-bold text-amber-400">100% Bounded</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Empirical Hardware Check</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'annotations', label: '1. 9-Modality Annotations', icon: Eye },
          { id: 'domain_rand', label: '2. Domain Randomization', icon: Sliders },
          { id: 'scene_replay', label: '3. Replayable Scenes & Seeds', icon: Film },
          { id: 'export_stacks', label: '4. ML Training Stacks Export', icon: FileCode },
          { id: 'sim2real_checklist', label: '5. Sim-to-Real Gap Checklist', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SyntheticDataTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 border border-cyan-500/50 text-cyan-300 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: 9-MODALITY SYNCHRONIZED ANNOTATIONS */}
      {activeTab === 'annotations' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-cyan-400 font-bold uppercase">
                  ZERO-OVERHEAD MULTI-MODAL SYNCHRONIZATION
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  9 Synchronized Modalities Extracted from a Single Simulation Rollout
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
                1000 Hz Shared Physics Clock
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Collecting these 9 streams on physical hardware requires tens of thousands of pounds in synchronizer clocks, optical motion tracking rigs, and tactile arrays. In AIGENESIS, all 9 modalities are generated simultaneously from the underlying multi-physics world model with zero sensor registration drift.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {ANNOTATION_STREAMS.map((s) => (
                <div key={s.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold font-mono ${s.previewColor}`}>{s.modality}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {s.resolutionOrRate}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white font-mono">{s.name}</h4>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">{s.description}</p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-900 font-mono text-[11px]">
                    <div className="text-slate-500">Tensor Schema: <span className="text-slate-300">{s.dataType}</span></div>
                    <div className="p-2 rounded-lg bg-slate-900 text-cyan-300 truncate font-mono text-[10px]">
                      {s.sampleValue}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOMAIN RANDOMIZATION */}
      {activeTab === 'domain_rand' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-purple-400 font-bold uppercase">
                  UNSTRUCTURED ENVIRONMENT ROBUSTNESS
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Deep Domain Randomization: 7 Controlled Physics & Perception Dimensions
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
                Latin Hypercube Sampling Engine
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Domain randomization closes the reality gap by training models on an envelope that encapsulates the real world. Every simulation batch randomizes camera poses, light spectrums, material BRDFs, motion blur, and sensor noise characteristics.
            </p>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Randomized Parameter</th>
                    <th className="py-3 px-3">Sampled Bounds / Options</th>
                    <th className="py-3 px-3">Distribution Type</th>
                    <th className="py-3 px-3">Current Active Value</th>
                    <th className="py-3 px-3">Sim-to-Real Protection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {DOMAIN_RANDOMIZATION_CONFIGS.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 border border-purple-500/30 text-purple-300">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-white">{item.parameterName}</td>
                      <td className="py-3.5 px-3 text-slate-300 font-sans">{item.rangeOrOptions}</td>
                      <td className="py-3.5 px-3 text-slate-400">{item.distribution}</td>
                      <td className="py-3.5 px-3 font-semibold text-cyan-400">{item.currentValue}</td>
                      <td className="py-3.5 px-3 text-slate-400 font-sans text-[11px] max-w-xs">{item.simToRealBenefit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REPLAYABLE SCENES & DETERMINISTIC SEEDS */}
      {activeTab === 'scene_replay' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-amber-400 font-bold uppercase">
                  100% BIT-DETERMINISTIC SIMULATION REPLAY
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Replayable Scene Configurations & Automated Ground-Truth Labels
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
                Reproducible Failure Debugging
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              When a policy or vision model fails in production, replayable seeds allow engineers to reconstruct the exact multi-physics state down to individual ray hits and friction micro-slips for deterministic regression testing.
            </p>

            <div className="space-y-4 pt-2">
              {REPLAYABLE_SCENES.map((scene) => (
                <div key={scene.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-cyan-400 font-mono">{scene.id}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-xs font-bold text-white">{scene.sceneName}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 font-sans">
                        Environment: <strong className="text-slate-200">{scene.environmentType}</strong> · Seed: <strong className="text-amber-400 font-mono">#{scene.randomSeed}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[10px] bg-slate-900 text-slate-300 border border-slate-800 font-mono">
                        {scene.annotatedFrames} Frames Available
                      </span>
                      <button
                        onClick={() => handleCopyCode(scene.sceneYamlSnippet, scene.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs border border-slate-800 transition cursor-pointer"
                      >
                        {copiedCodeId === scene.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCodeId === scene.id ? 'Copied' : 'Copy Scene YAML'}</span>
                      </button>
                    </div>
                  </div>

                  <pre className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto">
                    <code>{scene.sceneYamlSnippet}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMMON ML TRAINING STACKS EXPORT */}
      {activeTab === 'export_stacks' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-emerald-400 font-bold uppercase">
                  ZERO-CODE ML ADAPTER EXPORTERS
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  1-Click Export to Industry-Standard Training Frameworks
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
                LeRobot / RLDS / Isaac Lab / BOP / ROS 2
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Skip custom ETL data pipelines. AIGENESIS serializes simulation trajectories directly into format-native Parquet chunks, PyTorch tensor clones, or ROS 2 MCAP bags ready to train policies immediately.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {TRAINING_STACK_EXPORTS.map((stack) => (
                <div key={stack.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 font-mono">{stack.format}</span>
                      {stack.isPopular && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Production Standard
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-white text-sm">{stack.stackName}</h4>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">{stack.useCase}</p>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
                      <div>Target Models: <span className="text-slate-200">{stack.targetFramework}</span></div>
                      <div>Sample Structure: <span className="text-cyan-300">{stack.sampleDirectory}</span></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 uppercase font-mono">CLI Command:</span>
                      <button
                        onClick={() => handleCopyCode(stack.exportCommand, stack.id)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCodeId === stack.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCodeId === stack.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-200 text-xs overflow-x-auto">
                      <code>{stack.exportCommand}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SIM-TO-REAL GAP CHECKLIST */}
      {activeTab === 'sim2real_checklist' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-amber-400 font-bold uppercase">
                  EMPIRICAL DISCREPANCY AUDIT CHECKLIST
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Simulation Variance vs. Physical Hardware Reality Gap Matrix
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-400">
                Air-Gapped Deployment Verifier
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              A comprehensive checklist mapping what varied in simulation against what actually exists on physical hardware. This ensures engineers never deploy a model believing it was stress-tested across a parameter that remained static.
            </p>

            <div className="space-y-3 pt-2">
              {SIM2REAL_CHECKLIST.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-bold text-white text-sm">{item.dimension}</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      item.status === 'AUDITED & BOUNDED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : item.status === 'NEEDS RESIDUAL CALIBRATION'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                      <div className="text-[10px] text-cyan-400 uppercase font-mono">Simulation Variance Range</div>
                      <div className="text-slate-200 mt-0.5">{item.simulationRange}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                      <div className="text-[10px] text-amber-400 uppercase font-mono">Physical Hardware Ground Truth</div>
                      <div className="text-slate-200 mt-0.5">{item.physicalHardwareObserved}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs font-sans text-emerald-300">
                    <strong>Mitigation & Guardrail:</strong> {item.mitigationApplied}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
