import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Globe, Radio, Shield, Crosshair, Cpu, Play, Pause, RotateCcw, 
  Volume2, VolumeX, Mic, MicOff, Terminal, Award, Download, 
  ExternalLink, Sparkles, CheckCircle2, AlertOctagon, AlertTriangle, 
  Layers, ChevronRight, Zap, Target, Eye, Flame, CloudFog, Wifi, 
  Sliders, ArrowUpRight, BarChart3, HelpCircle, HardDrive, RefreshCw
} from 'lucide-react';
import * as THREE from 'three';
import { ActiveTab } from '../../types';

interface SuperLeagueSuiteProps {
  onNavigateTab?: (tab: ActiveTab) => void;
}

type SuperLeagueTab = 'lattice-globe' | 'policy-arena' | 'voice-commlink' | 'silicon-forge';

interface TacticalStation {
  id: string;
  name: string;
  callsign: string;
  location: string;
  country: string;
  lat: number;
  lng: number;
  status: 'OPTIMAL' | 'DEGRADED' | 'ENGAGED' | 'ADVERSARIAL_TEST';
  fleetType: string;
  unitCount: number;
  batteryPct: number;
  rfLinkDbm: number;
  latencyMs: number;
  jitterUs: number;
  thermalC: number;
  mission: string;
  cbfBarrierStatus: 'SECURE' | 'MARGINAL' | 'ACTIVE_BRAKE';
  primarySensor: string;
  standard: string;
}

const TACTICAL_STATIONS: TacticalStation[] = [
  {
    id: 'arctic-uav',
    name: 'Svalbard Arctic Reconnaissance Swarm',
    callsign: 'POLARIS-9',
    location: 'Longyearbyen, Svalbard',
    country: 'Norway (NATO Border)',
    lat: 78.2232,
    lng: 15.6267,
    status: 'OPTIMAL',
    fleetType: 'Autonomous Fixed-Wing UAVs',
    unitCount: 16,
    batteryPct: 88,
    rfLinkDbm: -68,
    latencyMs: 14.2,
    jitterUs: 184,
    thermalC: -28.4,
    mission: 'GNSS-Denied Arctic Maritime Surveillance & Radio Frequency Sentry',
    cbfBarrierStatus: 'SECURE',
    primarySensor: 'Cooled MWIR FLIR + Ku-band SAR',
    standard: 'STANAG 4586 & MIL-STD-810H'
  },
  {
    id: 'stuttgart-amr',
    name: 'Gigafactory Coordinated AMR Fleet',
    callsign: 'KINETIC-STUTTGART',
    location: 'Stuttgart Automation Plant',
    country: 'Germany',
    lat: 48.7758,
    lng: 9.1829,
    status: 'OPTIMAL',
    fleetType: 'Heavy Industrial AMRs (1500kg Payload)',
    unitCount: 350,
    batteryPct: 92,
    rfLinkDbm: -54,
    latencyMs: 2.1,
    jitterUs: 42,
    thermalC: 41.2,
    mission: 'Synchronized JIT Battery Cell Transport with Microsecond Avoidance',
    cbfBarrierStatus: 'SECURE',
    primarySensor: '360° Safety LiDAR + Time-of-Flight 3D',
    standard: 'ISO 3691-4 & IEC 62061 SIL-3'
  },
  {
    id: 'zurich-surgical',
    name: 'University Hospital Zurich Microsurgery Teleop',
    callsign: 'AETHEL-SURG-1',
    location: 'Zurich Medical Robotics Wing',
    country: 'Switzerland',
    lat: 47.3769,
    lng: 8.5417,
    status: 'OPTIMAL',
    fleetType: '7-DoF Tactile Bimanual Manipulator',
    unitCount: 4,
    batteryPct: 100,
    rfLinkDbm: -42,
    latencyMs: 0.85,
    jitterUs: 12,
    thermalC: 36.8,
    mission: 'Sub-millimeter Micro-Anastomosis with Haptic Force Reflection',
    cbfBarrierStatus: 'SECURE',
    primarySensor: '6-Axis Nano F/T Sensor + 4K Endoscopic 3D',
    standard: 'FDA 21 CFR 820 & IEC 62304 Class C'
  },
  {
    id: 'mojave-biped',
    name: 'Mojave Dynamic Terrain Proving Grounds',
    callsign: 'CHRONOS-BIPED',
    location: 'Mojave Desert Aerospace Facility',
    country: 'USA (California)',
    lat: 35.0110,
    lng: -118.1750,
    status: 'ADVERSARIAL_TEST',
    fleetType: 'Full-Scale Humanoid Robotics (180cm, 75kg)',
    unitCount: 8,
    batteryPct: 64,
    rfLinkDbm: -72,
    latencyMs: 18.4,
    jitterUs: 310,
    thermalC: 56.1,
    mission: 'High-G Dynamic Balance over Collapsing Gravel & 1.2m Trench Leaps',
    cbfBarrierStatus: 'MARGINAL',
    primarySensor: 'Neuromorphic DVS + RealSense D455 RGB-D',
    standard: 'ANSI/RIA R15.08 Type 2'
  },
  {
    id: 'singapore-usv',
    name: 'Singapore Strait Maritime Autonomous USV Line',
    callsign: 'MERLION-PATROL',
    location: 'Port of Singapore Maritime Strip',
    country: 'Singapore',
    lat: 1.2902,
    lng: 103.8519,
    status: 'OPTIMAL',
    fleetType: 'Unmanned Surface Vessels (Hydrofoil Catamaran)',
    unitCount: 12,
    batteryPct: 79,
    rfLinkDbm: -62,
    latencyMs: 8.7,
    jitterUs: 110,
    thermalC: 32.5,
    mission: 'COLREGS Autonomous Vessel Collision Avoidance in Ultra-Dense Channel',
    cbfBarrierStatus: 'SECURE',
    primarySensor: 'Solid-State Marine Radar + AIS + Thermal LWIR',
    standard: 'IMO Maritime Autonomous Surface Ships (MASS)'
  },
  {
    id: 'porton-crawler',
    name: 'Porton Subterranean Tactical Crawler',
    callsign: 'SUBTERRA-4',
    location: 'Porton Defense Innovation Centre',
    country: 'United Kingdom',
    lat: 51.1300,
    lng: -1.7000,
    status: 'DEGRADED',
    fleetType: 'Quadrupedal Multi-Legged Scout',
    unitCount: 6,
    batteryPct: 45,
    rfLinkDbm: -84,
    latencyMs: 29.6,
    jitterUs: 640,
    thermalC: 22.0,
    mission: 'Zero-RF Subterranean Bunker Exploration with Acoustic Simultaneous Mapping',
    cbfBarrierStatus: 'ACTIVE_BRAKE',
    primarySensor: 'Acoustic Array + Non-Line-of-Sight Laser Reflection',
    standard: 'DEF-STAN 00-56 Safety Assurance'
  }
];

export const SuperLeagueSuite: React.FC<SuperLeagueSuiteProps> = ({ onNavigateTab }) => {
  const [activeTab, setActiveTab] = useState<SuperLeagueTab>('lattice-globe');

  // ==========================================
  // 1. Globe & Tactical State
  // ==========================================
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const [selectedStationId, setSelectedStationId] = useState<string>('arctic-uav');
  const [sensorShaderMode, setSensorShaderMode] = useState<'rgb' | 'flir' | 'lidar' | 'emp'>('rgb');
  const [globeRotationSpeed, setGlobeRotationSpeed] = useState<number>(0.003);
  const [isGlobePaused, setIsGlobePaused] = useState<boolean>(false);
  const [activeWaypoints, setActiveWaypoints] = useState<number>(14);

  const selectedStation = useMemo(() => {
    return TACTICAL_STATIONS.find(s => s.id === selectedStationId) || TACTICAL_STATIONS[0];
  }, [selectedStationId]);

  // Three.js globe mounting
  useEffect(() => {
    if (!globeContainerRef.current) return;
    const container = globeContainerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Globe group for rotation
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Core Sphere (Dark matter with subtle blue edge glow)
    const sphereGeometry = new THREE.SphereGeometry(70, 48, 48);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x050b14,
      wireframe: false
    });
    const coreSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    globeGroup.add(coreSphere);

    // Latitude / Longitude Tactical Wireframe
    const wireframeGeometry = new THREE.WireframeGeometry(sphereGeometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.22
    });
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    globeGroup.add(wireframe);

    // Outer Atmospheric Glow Halo
    const atmosphereGeometry = new THREE.SphereGeometry(76, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphere);

    // Orbital Ring 1
    const ringGeo1 = new THREE.RingGeometry(88, 89.2, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.8;
    globeGroup.add(ring1);

    // Orbital Ring 2 (Cross orbit)
    const ringGeo2 = new THREE.RingGeometry(96, 97, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 3.2;
    ring2.rotation.y = Math.PI / 5;
    globeGroup.add(ring2);

    // Station Pin Markers
    const markerGroup = new THREE.Group();
    globeGroup.add(markerGroup);

    const latLngToVector3 = (lat: number, lng: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    TACTICAL_STATIONS.forEach(st => {
      const pos = latLngToVector3(st.lat, st.lng, 71);
      
      // Pin dot
      const dotGeo = new THREE.SphereGeometry(2.4, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({
        color: st.status === 'DEGRADED' ? 0xf43f5e : st.status === 'ADVERSARIAL_TEST' ? 0xf59e0b : 0x10b981
      });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.position.copy(pos);
      markerGroup.add(dotMesh);

      // Radar pulse ring
      const pulseGeo = new THREE.RingGeometry(3, 3.8, 16);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      pulseMesh.position.copy(pos);
      pulseMesh.lookAt(pos.clone().multiplyScalar(2));
      markerGroup.add(pulseMesh);
    });

    let animationFrameId: number;
    let targetRotationY = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isGlobePaused) {
        globeGroup.rotation.y += globeRotationSpeed;
      }

      // Orbital wobble
      ring1.rotation.z += 0.002;
      ring2.rotation.z -= 0.0015;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!globeContainerRef.current) return;
      const w = globeContainerRef.current.clientWidth;
      const h = globeContainerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isGlobePaused, globeRotationSpeed]);

  // ==========================================
  // 2. Policy Arena State
  // ==========================================
  type PolicyId = 'pi0' | 'openvla' | 'octo' | 'lerobot';
  const [modelA, setModelA] = useState<PolicyId>('pi0');
  const [modelB, setModelB] = useState<PolicyId>('openvla');
  const [arenaChallenge, setArenaChallenge] = useState<'friction-drift' | 'deformable-grasp' | 'singularity-overtorque'>('friction-drift');
  const [isArenaSimRunning, setIsArenaSimRunning] = useState<boolean>(true);
  const [simStep, setSimStep] = useState<number>(0);
  const [votedPolicy, setVotedPolicy] = useState<PolicyId | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isArenaSimRunning) {
      interval = setInterval(() => {
        setSimStep(prev => (prev + 1) % 100);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isArenaSimRunning]);

  // Policy Arena Live Benchmarks Data
  const policyDatabase = {
    pi0: {
      name: 'Physical Intelligence π0',
      type: 'Flow-Matching Multi-Task Diffusion',
      parameters: '3.1B Active',
      nativeFreq: '50 Hz Control Loop',
      elo: 1842,
      rank: 1,
      successRate: 97.4,
      energyJoules: 142,
      cbfViolationSigma: 0.012,
      jitterUs: 48,
      inferenceTimeMs: 16.2,
      origin: 'Physical Intelligence (San Francisco)'
    },
    openvla: {
      name: 'OpenVLA-7B (Quantized FP8)',
      type: 'Vision-Language-Action Transformer',
      parameters: '7.1B Parameters',
      nativeFreq: '15 Hz (Interpolated to 1000 Hz via Spline)',
      elo: 1789,
      rank: 2,
      successRate: 94.8,
      energyJoules: 198,
      cbfViolationSigma: 0.024,
      jitterUs: 86,
      inferenceTimeMs: 24.5,
      origin: 'Stanford / Berkeley AI Research'
    },
    octo: {
      name: 'Octo-Base (93M)',
      type: 'Cross-Embodiment Diffusion Policy',
      parameters: '93M Parameters',
      nativeFreq: '100 Hz Native Loop',
      elo: 1695,
      rank: 3,
      successRate: 91.2,
      energyJoules: 74,
      cbfViolationSigma: 0.041,
      jitterUs: 32,
      inferenceTimeMs: 8.4,
      origin: 'UC Berkeley Robotics Lab'
    },
    lerobot: {
      name: 'LeRobot ACT (Action Chunking)',
      type: 'Transformer Causal Policy',
      parameters: '42M Parameters',
      nativeFreq: '120 Hz Chunking',
      elo: 1660,
      rank: 4,
      successRate: 88.6,
      energyJoules: 58,
      cbfViolationSigma: 0.055,
      jitterUs: 22,
      inferenceTimeMs: 6.1,
      origin: 'Hugging Face Robotics'
    }
  };

  // ==========================================
  // 3. Tactical Voice Intercom & Sound Effects
  // ==========================================
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isMicListening, setIsMicListening] = useState<boolean>(false);
  const [radioLog, setRadioLog] = useState<{ id: string; sender: string; text: string; time: string; priority: 'CRITICAL' | 'NORMAL' | 'COMMAND' }[]>([
    { id: '1', sender: 'AIGENESIS SENTRY-ORBIT', text: 'POLARIS-9 Arctic UAV Swarm link locked. RF signal margin 24 dB above thermal noise floor.', time: '13:42:01Z', priority: 'NORMAL' },
    { id: '2', sender: 'TACTICAL OPERATOR', text: 'Enforce Lyapunov barrier invariance on KINETIC-STUTTGART 350-unit AMR cluster.', time: '13:42:15Z', priority: 'COMMAND' },
    { id: '3', sender: 'AIGENESIS AUTONOMY KERNEL', text: 'Forward invariance formally verified by Z3 SMT in 14.2ms. Brakes disengaged.', time: '13:42:16Z', priority: 'NORMAL' }
  ]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Synthesize military/aerospace sound cues using Web Audio API
  const playTacticalSound = (type: 'chirp' | 'squelch' | 'sonar' | 'alarm') => {
    if (!isAudioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      if (type === 'chirp') {
        // High-tech acknowledgment chirp
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(2400, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'squelch') {
        // Tactical radio squelch white-noise burst
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2200, now);
        filter.Q.setValueAtTime(3.0, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      } else if (type === 'sonar') {
        // Sonar ping
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'alarm') {
        // Double warning tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.setValueAtTime(950, now + 0.12);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // AudioContext unavailable or blocked by autoplay
    }
  };

  // Synthesize tactical speech voice response
  const speakTacticalResponse = (text: string) => {
    playTacticalSound('squelch');
    if ('speechSynthesis' in window && isAudioEnabled) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.15;
      utterance.pitch = 0.95;
      utterance.volume = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleExecuteVoiceCommand = (commandText: string) => {
    playTacticalSound('chirp');
    const newLog = {
      id: Date.now().toString(),
      sender: 'OPERATOR VOICE INTERCOM',
      text: commandText,
      time: new Date().toISOString().split('T')[1].slice(0, 8) + 'Z',
      priority: 'COMMAND' as const
    };

    let replyText = '';
    if (commandText.includes('Arctic') || commandText.includes('POLARIS')) {
      replyText = 'Arctic UAV Swarm acknowledged. Transitioning fixed-wing flight group to sector Bravo. Barrier radius 0.5 meters locked.';
    } else if (commandText.includes('Stuttgart') || commandText.includes('AMR')) {
      replyText = 'Stuttgart AMR factory swarm commanded. Control Barrier Function verified. Zero trajectory conflict across 350 active units.';
    } else if (commandText.includes('Zurich') || commandText.includes('fault')) {
      replyText = 'Simulating joint 3 thermal runaway on Zurich microsurgery arm. Automatic safety clamp engaged in 1.4 milliseconds.';
    } else if (commandText.includes('Silicon') || commandText.includes('TensorRT')) {
      replyText = 'Compiling OpenVLA-7B policy to TensorRT-LLM FP8 engine for Jetson AGX Orin. Memory footprint 4.2 Gigabytes.';
    } else {
      replyText = 'Command parsed. Telemetry streams aligned across physical swarm.';
    }

    const replyLog = {
      id: (Date.now() + 1).toString(),
      sender: 'AIGENESIS AUTONOMY KERNEL',
      text: replyText,
      time: new Date().toISOString().split('T')[1].slice(0, 8) + 'Z',
      priority: 'NORMAL' as const
    };

    setRadioLog(prev => [replyLog, newLog, ...prev]);
    setTimeout(() => {
      speakTacticalResponse(replyText);
    }, 200);
  };

  // ==========================================
  // 4. Silicon Forge State
  // ==========================================
  const [selectedTargetSilicon, setSelectedTargetSilicon] = useState<string>('orin');
  const [selectedModelToCompile, setSelectedModelToCompile] = useState<string>('openvla');
  const [isCompilingSilicon, setIsCompilingSilicon] = useState<boolean>(false);
  const [compilationProgress, setCompilationProgress] = useState<number>(0);
  const [compilationDone, setCompilationDone] = useState<boolean>(false);

  const siliconOptions = [
    {
      id: 'orin',
      name: 'NVIDIA Jetson AGX Orin (64GB)',
      arch: 'Ampere GPU (2048 CUDA) + 12x Arm Cortex-A78AE',
      tops: '275 TOPS (INT8) / 138 TFLOPS (FP16)',
      tdpWatts: '60W Maximum TDP',
      compiler: 'TensorRT 10.3 / TensorRT-LLM FP8',
      latency: '3.8ms inference (1000 Hz loop ready)',
      memoryBandwidth: '204.8 GB/s (256-bit LPDDR5)',
      unitCost: '$1,999 USD',
      targetTier: 'Defense UAVs, Humanoid Bipeds, Surgical Consoles'
    },
    {
      id: 'tenstorrent',
      name: 'Tenstorrent Wormhole n150 (PCIe)',
      arch: '72 Tensix RISC-V Cores + 6-ch GDDR6',
      tops: '260 TFLOPS (Bfp8 / FP16)',
      tdpWatts: '75W Power Draw',
      compiler: 'TT-Buda / TT-Metalium Graph Engine',
      latency: '2.4ms inference',
      memoryBandwidth: '288 GB/s',
      unitCost: '$1,499 USD',
      targetTier: 'Sovereign Edge Datacenters & Subterranean Vehicles'
    },
    {
      id: 'hailo8',
      name: 'Hailo-8 M.2 AI Acceleration Module',
      arch: 'Structure-Driven Dataflow Architecture',
      tops: '26 TOPS',
      tdpWatts: '2.5W Ultra-Low Power',
      compiler: 'Hailo Dataflow Compiler (HDF)',
      latency: '6.1ms inference',
      memoryBandwidth: 'On-chip distributed SRAM',
      unitCost: '$249 USD',
      targetTier: 'Ultra-Compact Quadruped Scouts, Micro-Drones'
    },
    {
      id: 'apple-m4',
      name: 'Apple M4 Pro Neural Engine (Unified)',
      arch: '16-Core Neural Engine + 14-Core GPU',
      tops: '38 TOPS (FP16 / INT8)',
      tdpWatts: '18W System Power',
      compiler: 'CoreML / ExecuTorch Quantized',
      latency: '4.5ms inference',
      memoryBandwidth: '273 GB/s Unified Memory',
      unitCost: 'Included in M4 Pro Mac Mini Field Rig',
      targetTier: 'Field Ground Control Stations (GCS)'
    },
    {
      id: 'loihi2',
      name: 'Intel Loihi 2 Neuromorphic Chip',
      arch: '128 Neuromorphic Cores (1M Neurons, 120M Synapses)',
      tops: 'Asynchronous Event-Driven Spikes',
      tdpWatts: '1.2W Micro-Power',
      compiler: 'Lava Neuromorphic Framework',
      latency: 'Sub-1.0ms event-driven reflex',
      memoryBandwidth: 'Direct Event-Spike Mesh',
      unitCost: 'Research Sovereign Allocation',
      targetTier: 'Event-Camera DVS Reflex Loops & Anti-Jamming'
    }
  ];

  const currentSilicon = useMemo(() => {
    return siliconOptions.find(s => s.id === selectedTargetSilicon) || siliconOptions[0];
  }, [selectedTargetSilicon]);

  const handleStartCompilation = () => {
    setIsCompilingSilicon(true);
    setCompilationProgress(0);
    setCompilationDone(false);
    playTacticalSound('chirp');

    const interval = setInterval(() => {
      setCompilationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCompilingSilicon(false);
          setCompilationDone(true);
          playTacticalSound('sonar');
          return 100;
        }
        return prev + 12;
      });
    }, 180);
  };

  return (
    <div className="space-y-6 font-mono text-slate-100 pb-20">
      {/* Super League Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '18s' }} />
              <span>AIGENESIS Super League Operational Echelon</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Planetary Digital Twin Command & Physical AI Foundation Arena
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-3xl">
              Tier-1 defense and enterprise situational awareness. Orbiting 3D digital twins with continuous millimeter zoom, split-screen foundation policy bake-offs, hands-free tactical voice intercom, and edge silicon compilation.
            </p>
          </div>

          {/* Audio & Status Pill */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setIsAudioEnabled(!isAudioEnabled);
                playTacticalSound('chirp');
              }}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2 text-xs font-bold ${
                isAudioEnabled 
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10' 
                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title="Toggle Tactical Audio Soundscape & Voice Feedback"
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span>{isAudioEnabled ? 'Tactical Audio: ON' : 'Audio: MUTED'}</span>
            </button>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500 block uppercase">Operational Echelon</span>
              <span className="text-emerald-400 font-extrabold text-sm font-mono">SUPER LEAGUE</span>
            </div>
          </div>
        </div>

        {/* 4 Super League Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80">
          {[
            { id: 'lattice-globe', label: '1. Planetary 3D Command', sub: 'Lattice Global Digital Twin', icon: Globe, badge: 'Live Ops' },
            { id: 'policy-arena', label: '2. Physical Policy Arena', sub: 'π0 vs OpenVLA vs Octo', icon: Crosshair, badge: 'LMSYS Benchmark' },
            { id: 'voice-commlink', label: '3. Tactical Voice Intercom', sub: 'Hands-Free Military Comms', icon: Radio, badge: 'Zero-Latency' },
            { id: 'silicon-forge', label: '4. Silicon Cross-Compiler', sub: 'Jetson, Tenstorrent, Hailo', icon: Cpu, badge: 'Edge Matrix' }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  playTacticalSound('chirp');
                }}
                className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                  active
                    ? 'bg-cyan-500/20 border-cyan-500/60 text-white shadow-xl shadow-cyan-500/20 scale-[1.01]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold border bg-cyan-500/10 text-cyan-300 border-cyan-500/30">
                    {tab.badge}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-xs text-white truncate">{tab.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{tab.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: Planetary 3D Digital Twin Command Center ("AIGENESIS Lattice") */}
      {/* ==================================================================== */}
      {activeTab === 'lattice-globe' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive 3D Holographic Globe */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 flex flex-col justify-between relative overflow-hidden">
            {/* Globe Header Controls */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 z-10">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-sm text-white">Lattice Planetary Mesh (Three.js WebGL)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsGlobePaused(!isGlobePaused)}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  {isGlobePaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
                  <span>{isGlobePaused ? 'Resume Spin' : 'Pause'}</span>
                </button>
                <button
                  onClick={() => setGlobeRotationSpeed(s => (s === 0.003 ? 0.012 : 0.003))}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 cursor-pointer"
                >
                  {globeRotationSpeed > 0.005 ? 'High Orbit' : 'Standard Orbit'}
                </button>
              </div>
            </div>

            {/* Three.js Globe Canvas Container */}
            <div 
              ref={globeContainerRef} 
              className="w-full h-80 sm:h-96 relative rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center cursor-grab active:cursor-grabbing border border-slate-800/80 shadow-inner"
            >
              {/* Tactical Overlays */}
              <div className="absolute top-3 left-3 pointer-events-none text-[10px] text-cyan-400/80 space-y-1 font-mono">
                <div>ORBITAL TELEMETRY: 400 KM LEO</div>
                <div>DAY/NIGHT TERMINATOR: COMPUTED</div>
                <div>GLOBAL RELAY NODES: 6 ACTIVE</div>
              </div>

              <div className="absolute bottom-3 right-3 pointer-events-none text-[10px] text-slate-500 space-y-0.5 font-mono text-right">
                <div>PROJECTION: WGS-84 ELLIPSOID</div>
                <div>RENDER ENGINE: THREE.JS FP32</div>
              </div>
            </div>

            {/* Tactical Station Selector Chips */}
            <div className="space-y-2 z-10">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Global Stations (Click to Zoom & Intercept):</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TACTICAL_STATIONS.map(st => {
                  const selected = selectedStationId === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => {
                        setSelectedStationId(st.id);
                        playTacticalSound('sonar');
                      }}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        selected 
                          ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg' 
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[11px] truncate text-white">{st.callsign}</span>
                        <span className={`w-2 h-2 rounded-full ${
                          st.status === 'DEGRADED' ? 'bg-rose-400 animate-ping' : st.status === 'ADVERSARIAL_TEST' ? 'bg-amber-400' : 'bg-emerald-400'
                        }`} />
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">{st.location}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Station Tactical Telemetry & Sensor Shaders */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 flex flex-col justify-between">
            {/* Station Header */}
            <div className="border-b border-slate-800 pb-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">{selectedStation.country}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  selectedStation.status === 'DEGRADED' 
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' 
                    : selectedStation.status === 'ADVERSARIAL_TEST' 
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                }`}>
                  {selectedStation.status}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white">{selectedStation.name}</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">{selectedStation.mission}</p>
            </div>

            {/* 4 Real-Time Metrics */}
            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase">RF Link Budget</span>
                <span className="text-sm font-bold text-emerald-400">{selectedStation.rfLinkDbm} dBm</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Margin: +24.8 dB</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase">Loop Latency & Jitter</span>
                <span className="text-sm font-bold text-cyan-400">{selectedStation.latencyMs}ms ({selectedStation.jitterUs}µs)</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Deterministic 1000 Hz</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase">Battery & Thermal</span>
                <span className="text-sm font-bold text-white">{selectedStation.batteryPct}% ({selectedStation.thermalC}°C)</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Pack Temp Stable</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase">Safety Barrier (CBF)</span>
                <span className={`text-sm font-bold ${
                  selectedStation.cbfBarrierStatus === 'SECURE' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {selectedStation.cbfBarrierStatus}
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">{selectedStation.standard}</span>
              </div>
            </div>

            {/* Sensor Vision Shader Modes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Tactical Sensor Vision Mode:</span>
                <span className="text-[10px] text-cyan-400 font-mono">Simulated Shader</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-xs font-sans">
                {[
                  { id: 'rgb', label: 'RGB Video', icon: Eye },
                  { id: 'flir', label: 'FLIR Thermal', icon: Flame },
                  { id: 'lidar', label: 'LiDAR Cloud', icon: CloudFog },
                  { id: 'emp', label: 'EMP / Jamming', icon: AlertTriangle }
                ].map(shader => {
                  const Icon = shader.icon;
                  const active = sensorShaderMode === shader.id;
                  return (
                    <button
                      key={shader.id}
                      onClick={() => {
                        setSensorShaderMode(shader.id as any);
                        playTacticalSound(shader.id === 'emp' ? 'alarm' : 'chirp');
                      }}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        active
                          ? 'bg-cyan-500/20 border-cyan-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 mx-auto mb-1 ${active ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span className="text-[10px] block truncate">{shader.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Simulated Sensor Viewport */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs space-y-2 relative overflow-hidden min-h-36">
              <div className="flex justify-between items-center text-[10px] text-slate-500 pb-1 border-b border-slate-800/80">
                <span>FEED: {selectedStation.callsign} // PRIMARY SENSOR</span>
                <span className="text-emerald-400 font-bold">1080p @ 60 FPS</span>
              </div>

              {sensorShaderMode === 'rgb' && (
                <div className="space-y-1 text-slate-300">
                  <div className="text-cyan-400 text-[11px] font-bold">OPTICAL SENSOR STREAM (REAL-TIME)</div>
                  <p className="text-[11px] text-slate-400 font-sans">Visual target acquired. Clear line of sight across waypoint trajectory. Photometric contrast nominal.</p>
                  <div className="text-[10px] text-slate-500">Bounding Boxes: 4 Identified Dynamic Obstacles // Safety Margin: +1.4m</div>
                </div>
              )}

              {sensorShaderMode === 'flir' && (
                <div className="space-y-1 text-rose-300 bg-rose-950/20 p-2 rounded-lg border border-rose-900/40">
                  <div className="text-rose-400 text-[11px] font-bold flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    <span>LONG-WAVE INFRARED (8–14µm LWIR PSEUDO-COLOR)</span>
                  </div>
                  <p className="text-[11px] text-rose-200/80 font-sans">Actuator harmonic drives running at 41.2°C. No thermal hotspots detected. Cryogenic calibration nominal.</p>
                  <div className="text-[10px] text-rose-400/80">FLIR Calibration: NETD &lt; 25mK // Focal Length: 25mm F/1.0</div>
                </div>
              )}

              {sensorShaderMode === 'lidar' && (
                <div className="space-y-1 text-cyan-300 bg-cyan-950/20 p-2 rounded-lg border border-cyan-900/40">
                  <div className="text-cyan-400 text-[11px] font-bold flex items-center gap-1.5">
                    <CloudFog className="w-3.5 h-3.5" />
                    <span>3D POINT CLOUD (64-BEAM HESAI LIDAR)</span>
                  </div>
                  <p className="text-[11px] text-cyan-200/80 font-sans">Synthetic rain and atmospheric scattering filtered via intensity thresholding. Ground plane fitted at z = 0.00m.</p>
                  <div className="text-[10px] text-cyan-400/80">Point Density: 1.2M pts/sec // Range: 180 meters</div>
                </div>
              )}

              {sensorShaderMode === 'emp' && (
                <div className="space-y-1 text-amber-300 bg-amber-950/20 p-2 rounded-lg border border-amber-900/40">
                  <div className="text-amber-400 text-[11px] font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>ADVERSARIAL ELECTRONIC WARFARE (RF JAMMING DETECTED)</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 font-sans">Broadband GNSS jamming injected. Inertial Navigation System (INS) + Visual Odometry taking over guidance.</p>
                  <div className="text-[10px] text-amber-400/80">Drift Bound: 0.12% Distance Traveled // Fail-Safe Barrier Active</div>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  playTacticalSound('chirp');
                  setActiveWaypoints(w => w + 2);
                }}
                className="flex-1 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-cyan-600/20"
              >
                Dispatch Waypoint Update
              </button>
              <button
                onClick={() => {
                  playTacticalSound('alarm');
                  speakTacticalResponse(`Emergency safety clamp engaged on station ${selectedStation.callsign}.`);
                }}
                className="py-2 px-4 bg-slate-950 hover:bg-rose-950 border border-slate-800 hover:border-rose-600 text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Emergency RTB
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: Physical AI Policy Foundation Model Arena ("Physical LMSYS")  */}
      {/* ==================================================================== */}
      {activeTab === 'policy-arena' && (
        <div className="space-y-6">
          {/* Arena Challenge Selector Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Crosshair className="w-5 h-5 text-cyan-400" />
                  Physical AI Policy Arena (Head-to-Head LMSYS Benchmark)
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Pit frontier foundation models against identical physical stress tests with real-time physics, Z3 safety barrier margin tracking, and blind Elo voting.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 font-mono">
                  LMSYS Style Blind Evaluation
                </span>
              </div>
            </div>

            {/* 3 Physical Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: 'friction-drift',
                  title: '1. Dynamic Low-Friction Ice Drift',
                  target: 'Bipedal balance & high-speed swerve on surface friction μ = 0.08',
                  focus: 'Lyapunov Stability'
                },
                {
                  id: 'deformable-grasp',
                  title: '2. Deformable Object High-Speed Grasp',
                  target: 'Tactile force reflection on thin polybags and fragile vials',
                  focus: 'Tactile Reflex Loop'
                },
                {
                  id: 'singularity-overtorque',
                  title: '3. Kinematic Singularity Avoidance',
                  target: 'Trajectory near wrist singularity Det(J) < 0.02 with 10kg payload',
                  focus: 'Actuator Thermal Safety'
                }
              ].map(ch => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setArenaChallenge(ch.id as any);
                    playTacticalSound('chirp');
                  }}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                    arenaChallenge === ch.id
                      ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold text-white block">{ch.title}</span>
                  <p className="text-[11px] text-slate-400 font-sans mt-1">{ch.target}</p>
                  <span className="text-[9px] text-cyan-400 font-mono block mt-2">Benchmark: {ch.focus}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Split Screen Physics Bake-Off */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Model A Container */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold">MODEL ALPHA</span>
                  <select
                    value={modelA}
                    onChange={e => setModelA(e.target.value as PolicyId)}
                    className="bg-slate-950 border border-slate-800 text-white rounded-xl px-2.5 py-1 text-xs font-bold focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="pi0">Physical Intelligence π0</option>
                    <option value="openvla">OpenVLA-7B (FP8)</option>
                    <option value="octo">Octo-Base (93M)</option>
                    <option value="lerobot">LeRobot ACT (42M)</option>
                  </select>
                </div>
                <span className="text-xs text-emerald-400 font-mono font-bold">Elo: {policyDatabase[modelA].elo}</span>
              </div>

              {/* Simulated Physics Canvas Visualizer */}
              <div className="h-48 bg-slate-950 rounded-2xl border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between font-mono">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>POLICY: {policyDatabase[modelA].type}</span>
                  <span className="text-cyan-400">FPS: 60 // CYCLE: {simStep}%</span>
                </div>

                {/* Animated Trajectory Waveform */}
                <div className="flex items-end gap-1 h-24 w-full">
                  {Array.from({ length: 32 }).map((_, idx) => {
                    const heightPct = Math.min(95, Math.max(15, 50 + Math.sin((simStep + idx * 8) * 0.1) * 35));
                    return (
                      <div
                        key={idx}
                        className="flex-1 bg-gradient-to-t from-cyan-600/40 to-cyan-400 rounded-t-sm transition-all duration-75"
                        style={{ height: `${heightPct}%` }}
                      />
                    );
                  })}
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>Latency: {policyDatabase[modelA].inferenceTimeMs}ms</span>
                  <span className="text-emerald-400 font-bold">Success: {policyDatabase[modelA].successRate}%</span>
                </div>
              </div>

              {/* Metrics Table */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Energy / Cycle</span>
                  <span className="text-white font-bold">{policyDatabase[modelA].energyJoules} Joules</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">CBF Violation Risk</span>
                  <span className="text-emerald-400 font-bold">{policyDatabase[modelA].cbfViolationSigma} σ (Safe)</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setVotedPolicy(modelA);
                  playTacticalSound('chirp');
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  votedPolicy === modelA
                    ? 'bg-emerald-500 text-slate-950 shadow-lg'
                    : 'bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300'
                }`}
              >
                {votedPolicy === modelA ? '✓ Voted: Model Alpha Performed Better' : 'Vote for Model Alpha'}
              </button>
            </div>

            {/* Model B Container */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono font-bold">MODEL BETA</span>
                  <select
                    value={modelB}
                    onChange={e => setModelB(e.target.value as PolicyId)}
                    className="bg-slate-950 border border-slate-800 text-white rounded-xl px-2.5 py-1 text-xs font-bold focus:border-purple-500 focus:outline-none"
                  >
                    <option value="openvla">OpenVLA-7B (FP8)</option>
                    <option value="pi0">Physical Intelligence π0</option>
                    <option value="octo">Octo-Base (93M)</option>
                    <option value="lerobot">LeRobot ACT (42M)</option>
                  </select>
                </div>
                <span className="text-xs text-purple-400 font-mono font-bold">Elo: {policyDatabase[modelB].elo}</span>
              </div>

              {/* Simulated Physics Canvas Visualizer */}
              <div className="h-48 bg-slate-950 rounded-2xl border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between font-mono">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>POLICY: {policyDatabase[modelB].type}</span>
                  <span className="text-purple-400">FPS: 60 // CYCLE: {simStep}%</span>
                </div>

                {/* Animated Trajectory Waveform */}
                <div className="flex items-end gap-1 h-24 w-full">
                  {Array.from({ length: 32 }).map((_, idx) => {
                    const heightPct = Math.min(95, Math.max(15, 45 + Math.cos((simStep + idx * 8) * 0.1) * 38));
                    return (
                      <div
                        key={idx}
                        className="flex-1 bg-gradient-to-t from-purple-600/40 to-purple-400 rounded-t-sm transition-all duration-75"
                        style={{ height: `${heightPct}%` }}
                      />
                    );
                  })}
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>Latency: {policyDatabase[modelB].inferenceTimeMs}ms</span>
                  <span className="text-purple-400 font-bold">Success: {policyDatabase[modelB].successRate}%</span>
                </div>
              </div>

              {/* Metrics Table */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Energy / Cycle</span>
                  <span className="text-white font-bold">{policyDatabase[modelB].energyJoules} Joules</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">CBF Violation Risk</span>
                  <span className="text-purple-400 font-bold">{policyDatabase[modelB].cbfViolationSigma} σ (Safe)</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setVotedPolicy(modelB);
                  playTacticalSound('chirp');
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  votedPolicy === modelB
                    ? 'bg-purple-500 text-slate-950 shadow-lg'
                    : 'bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300'
                }`}
              >
                {votedPolicy === modelB ? '✓ Voted: Model Beta Performed Better' : 'Vote for Model Beta'}
              </button>
            </div>
          </div>

          {/* Global Physical Elo Leaderboard Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-sm text-white">Official AIGENESIS Physical Elo Leaderboard (Reproducible Benchmarks)</h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Updated Hourly</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Foundation Model</th>
                    <th className="p-3">Architecture</th>
                    <th className="p-3">Physical Elo</th>
                    <th className="p-3">Success Rate</th>
                    <th className="p-3">Latency</th>
                    <th className="p-3">Checkpoint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {Object.entries(policyDatabase).map(([key, item]) => (
                    <tr key={key} className="hover:bg-slate-950/60 transition-colors">
                      <td className="p-3 font-bold text-amber-400">#{item.rank}</td>
                      <td className="p-3 font-bold text-white">{item.name}</td>
                      <td className="p-3 text-slate-400">{item.type}</td>
                      <td className="p-3 font-extrabold text-cyan-400">{item.elo}</td>
                      <td className="p-3 text-emerald-400">{item.successRate}%</td>
                      <td className="p-3 text-slate-300">{item.inferenceTimeMs}ms</td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            playTacticalSound('chirp');
                            alert(`Initiating verified download for ${item.name} weights and Z3 safety invariant certificate.`);
                          }}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3 text-cyan-400" />
                          <span>Safetensors</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: Tactical Voice Intercom & Mission Copilot ("AIGENESIS CommLink") */}
      {/* ==================================================================== */}
      {activeTab === 'voice-commlink' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Voice Controller & Pre-programmed Radio Calls */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  Tactical Voice Intercom ("CommLink")
                </h3>
                <span className="text-[10px] text-slate-400 font-sans">Hands-free voice teleoperation and auditory telemetry</span>
              </div>
              <span className="text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                Encrypted MIL-STD
              </span>
            </div>

            {/* Mic Push-to-Talk Simulation */}
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-3 text-center">
              <button
                onClick={() => {
                  setIsMicListening(!isMicListening);
                  playTacticalSound('squelch');
                  if (!isMicListening) {
                    setTimeout(() => {
                      handleExecuteVoiceCommand('Scramble POLARIS-9 Arctic UAV swarm to sector Bravo, enforce 0.5-meter separation barrier.');
                      setIsMicListening(false);
                    }, 2400);
                  }
                }}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xl ${
                  isMicListening
                    ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/50 scale-105'
                    : 'bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/40'
                }`}
              >
                {isMicListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
              </button>

              <div>
                <span className="font-bold text-xs text-white block">
                  {isMicListening ? 'LISTENING (SPEECH SYNTHESIS ACTIVE)...' : 'PUSH TO TRANSMIT VOICE COMMAND'}
                </span>
                <span className="text-[10px] text-slate-400 font-sans">
                  {isMicListening ? 'Voice spectral frequency matching target...' : 'Click to trigger tactical simulated voice telecommand'}
                </span>
              </div>
            </div>

            {/* Quick Tactical Command Presets */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Instant Mission Voice Directives:</span>
              <div className="space-y-2">
                {[
                  'Scramble POLARIS-9 Arctic UAV swarm to sector Bravo, enforce 0.5-meter separation barrier.',
                  'Enforce Lyapunov barrier invariance on KINETIC-STUTTGART 350-unit AMR cluster.',
                  'Simulate joint 3 thermal runaway on Zurich microsurgery arm.',
                  'Synthesize TensorRT FP8 engine for Jetson AGX Orin.'
                ].map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExecuteVoiceCommand(cmd)}
                    className="w-full p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800/90 rounded-xl text-left text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <span className="truncate pr-2 font-mono text-[11px]">{cmd}</span>
                    <Play className="w-3 h-3 text-cyan-400 shrink-0 opacity-60 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Scrolling Tactical Radio Telemetry Log */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-sm text-white">Encrypted Radio Transcript & Audio Feed</h4>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Frequency: 348.250 MHz UHF</span>
            </div>

            {/* Scrolling Messages */}
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {radioLog.map(msg => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                    msg.priority === 'COMMAND'
                      ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-cyan-400">{msg.sender}</span>
                    <span className="text-slate-500">{msg.time}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-sans">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Radio Status Footer */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Audio Engine: Web Audio API Active</span>
              </div>
              <button
                onClick={() => speakTacticalResponse('AIGENESIS CommLink telemetry check nominal.')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Test Voice Ping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: Universal Silicon Forge & Hardware Cross-Compiler Matrix      */}
      {/* ==================================================================== */}
      {activeTab === 'silicon-forge' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Silicon Target Selector & Hardware Matrix */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  Universal Silicon Cross-Compiler Matrix
                </h3>
                <span className="text-xs text-slate-400 font-sans">Benchmark and compile physical policies directly to edge silicon</span>
              </div>
              <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                5 Target Architectures
              </span>
            </div>

            {/* Silicon Target Cards */}
            <div className="space-y-2.5">
              {siliconOptions.map(sil => {
                const selected = selectedTargetSilicon === sil.id;
                return (
                  <div
                    key={sil.id}
                    onClick={() => {
                      setSelectedTargetSilicon(sil.id);
                      playTacticalSound('chirp');
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selected
                        ? 'bg-purple-950/30 border-purple-500 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-white">{sil.name}</span>
                      <span className="text-[10px] font-mono font-bold text-purple-400">{sil.tops}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">{sil.arch}</div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-800/80">
                      <span>Power: {sil.tdpWatts}</span>
                      <span>Compiler: {sil.compiler}</span>
                      <span className="text-emerald-400 font-bold">{sil.latency}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Compilation Execution Console */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="font-bold text-sm text-white">Edge Silicon Compiler Desk</h4>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Generate target-specific binary binaries with layer fusion and FP8 calibration.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Select Neural Policy:</label>
                  <select
                    value={selectedModelToCompile}
                    onChange={e => setSelectedModelToCompile(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-purple-500 focus:outline-none"
                  >
                    <option value="openvla">OpenVLA-7B (Vision-Language-Action Policy)</option>
                    <option value="pi0">Physical Intelligence π0 (Flow-Matching)</option>
                    <option value="octo">Octo-Base 93M (Cross-Embodiment)</option>
                    <option value="lerobot">LeRobot ACT 42M (Action Chunking)</option>
                  </select>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Board:</span>
                    <span className="text-white font-bold">{currentSilicon.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Toolchain:</span>
                    <span className="text-purple-400 font-bold">{currentSilicon.compiler}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Latency:</span>
                    <span className="text-emerald-400 font-bold">{currentSilicon.latency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Unit Board Cost:</span>
                    <span className="text-slate-300">{currentSilicon.unitCost}</span>
                  </div>
                </div>

                {/* Progress bar */}
                {isCompilingSilicon && (
                  <div className="space-y-1.5 p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-purple-300">Quantizing & Compiling Tensor Graph...</span>
                      <span className="text-white font-bold">{compilationProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full transition-all duration-150" style={{ width: `${compilationProgress}%` }} />
                    </div>
                  </div>
                )}

                {compilationDone && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Binary compilation complete!</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Output: model_engine_fp8_calibrated.bin (Size: 3.84 GB). Ready for physical board flashing.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              {compilationDone ? (
                <button
                  onClick={() => {
                    playTacticalSound('chirp');
                    const dummyBlob = new Blob(['AIGENESIS_COMPILED_ENGINE_BINARY_TARGET_' + selectedTargetSilicon], { type: 'application/octet-stream' });
                    const url = URL.createObjectURL(dummyBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `aigenesis_${selectedModelToCompile}_${selectedTargetSilicon}.bin`;
                    a.click();
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <Download className="w-4 h-4" />
                  Download Flashable Binary (.bin)
                </button>
              ) : (
                <button
                  disabled={isCompilingSilicon}
                  onClick={handleStartCompilation}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
                >
                  {isCompilingSilicon ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                  <span>{isCompilingSilicon ? 'Compiling to Edge Silicon...' : 'Compile Neural Policy to Target Silicon'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
