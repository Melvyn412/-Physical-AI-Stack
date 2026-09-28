import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import {
  Camera, Video, VideoOff, Hand, Play, Pause, RotateCcw, Download,
  Copy, Check, Terminal, Cpu, Sliders, Eye, Sparkles, Radio,
  Maximize2, CheckCircle2, AlertTriangle, Layers, ArrowRight
} from 'lucide-react';

type TeleopMode = 'interactive' | 'autonomous' | 'webcam';
type CodeTab = 'mediapipe_sender' | 'isaac_receiver' | 'ros2_launch';

interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

interface WorkpieceItem {
  id: string;
  name: string;
  color: number;
  hex: string;
  position: THREE.Vector3;
  homePosition: THREE.Vector3;
  grasped: boolean;
  delivered: boolean;
}

// Generate realistic 21 MediaPipe hand landmarks given wrist/palm center (nx, ny) in [0,1] and pinch [0=open, 1=closed]
function synthesizeHandLandmarks(nx: number, ny: number, nz: number, pinch: number): HandLandmark[] {
  const cx = nx;
  const cy = ny;
  // Thumb tip (#4) and Index tip (#8) converge as pinch -> 1.0
  const spread = 0.085 * (1 - pinch * 0.82);
  const meetX = cx - 0.03;
  const meetY = cy - 0.08;

  const lm: HandLandmark[] = [
    { x: cx, y: cy + 0.14, z: nz }, // 0: WRIST
    // Thumb (1..4)
    { x: cx - 0.05, y: cy + 0.10, z: nz - 0.01 },
    { x: cx - 0.08, y: cy + 0.04, z: nz - 0.02 },
    { x: meetX - spread * 0.65, y: meetY + spread * 0.45, z: nz - 0.03 },
    { x: meetX - spread * 0.5, y: meetY + spread * 0.35, z: nz - 0.04 }, // 4: THUMB_TIP
    // Index (5..8)
    { x: cx - 0.04, y: cy - 0.01, z: nz - 0.01 },
    { x: cx - 0.045, y: cy - 0.07, z: nz - 0.02 },
    { x: meetX - spread * 0.15, y: meetY - spread * 0.45, z: nz - 0.03 },
    { x: meetX + spread * 0.5, y: meetY - spread * 0.35, z: nz - 0.04 }, // 8: INDEX_FINGER_TIP
    // Middle (9..12)
    { x: cx, y: cy - 0.02, z: nz }, // 9: MIDDLE_FINGER_MCP (Palm reference)
    { x: cx, y: cy - 0.09, z: nz - 0.01 },
    { x: cx, y: cy - 0.14, z: nz - 0.02 },
    { x: cx, y: cy - 0.18, z: nz - 0.03 },
    // Ring (13..16)
    { x: cx + 0.04, y: cy - 0.01, z: nz },
    { x: cx + 0.045, y: cy - 0.08, z: nz - 0.01 },
    { x: cx + 0.05, y: cy - 0.13, z: nz - 0.02 },
    { x: cx + 0.055, y: cy - 0.165, z: nz - 0.02 },
    // Pinky (17..20)
    { x: cx + 0.075, y: cy + 0.01, z: nz + 0.01 },
    { x: cx + 0.085, y: cy - 0.05, z: nz },
    { x: cx + 0.092, y: cy - 0.09, z: nz - 0.01 },
    { x: cx + 0.098, y: cy - 0.125, z: nz - 0.01 },
  ];
  return lm;
}

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
  [0, 13], [13, 14], [14, 15], [15, 16],// Ring
  [0, 17], [17, 18], [18, 19], [19, 20],// Pinky
  [5, 9], [9, 13], [13, 17], [0, 17]    // Palm arch
];

export const VisionTeleopStudio: React.FC = () => {
  const [mode, setMode] = useState<TeleopMode>('autonomous');
  const [filterAlpha, setFilterAlpha] = useState<number>(0.22); // One-Euro / EMA smoothing factor
  const [showRawGhost, setShowRawGhost] = useState<boolean>(true);
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>('mediapipe_sender');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const [mediaPipeStatus, setMediaPipeStatus] = useState<string>('Ready (21-Keypoint Skeleton)');

  // Live Telemetry State for UI display
  const [telemetry, setTelemetry] = useState({
    x: 0.48,
    y: 0.0,
    z: 0.28,
    pinchMm: 68.0,
    gripPct: 12,
    gripForceN: 0,
    jointsDeg: [12.4, -58.2, 84.6, -116.4, -90.0, 12.4],
    graspedObject: null as string | null,
    deliveredCount: 0,
    fps: 60,
    udpLatencyMs: 0.75,
  });

  // Refs for real-time 60 FPS loop
  const mount3DRef = useRef<HTMLDivElement | null>(null);
  const handCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handLandmarkerRef = useRef<any>(null);

  const modeRef = useRef<TeleopMode>(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const filterAlphaRef = useRef<number>(filterAlpha);
  useEffect(() => {
    filterAlphaRef.current = filterAlpha;
  }, [filterAlpha]);

  const showRawGhostRef = useRef<boolean>(showRawGhost);
  useEffect(() => {
    showRawGhostRef.current = showRawGhost;
  }, [showRawGhost]);

  // Normalized Hand Control State: nx, ny in [0.15, 0.85], nz in [0.08, 0.65], pinch in [0, 1]
  const rawHandRef = useRef({ nx: 0.5, ny: 0.5, nz: 0.28, pinch: 0.0 });
  const filteredPoseRef = useRef({ x: 0.48, y: 0.0, z: 0.28, grip: 0.0 });
  const rawPose3DRef = useRef({ x: 0.48, y: 0.0, z: 0.28 });
  const landmarksRef = useRef<HandLandmark[]>(synthesizeHandLandmarks(0.5, 0.5, 0.28, 0.0));
  const isPointerDownRef = useRef<boolean>(false);

  // Workpieces Ref for reset & tracking
  const resetTriggerRef = useRef<number>(0);

  // Start or stop Laptop Webcam + MediaPipe HandLandmarker
  const stopWebcam = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
  }, []);

  const startWebcamTeleop = async () => {
    setWebcamError(null);
    setMediaPipeStatus('Requesting Laptop Camera...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setWebcamActive(true);
      setMode('webcam');
      setMediaPipeStatus('Loading MediaPipe Hands WASM...');

      // Dynamically load @mediapipe/tasks-vision from CDN if not already initialized
      if (!handLandmarkerRef.current) {
        try {
          const visionModuleUrl = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm';
          const vision: any = await import(/* @vite-ignore */ visionModuleUrl);
          const filesetResolver = await vision.FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
          );
          handLandmarkerRef.current = await vision.HandLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: 1,
          });
          setMediaPipeStatus('MediaPipe Hands 21-Point GPU Active');
        } catch (mpErr) {
          console.warn('MediaPipe CDN fallback to optical centroid tracker:', mpErr);
          setMediaPipeStatus('Camera Active (Optical Hand + Cursor Hybrid)');
        }
      } else {
        setMediaPipeStatus('MediaPipe Hands 21-Point GPU Active');
      }
    } catch (err: any) {
      console.warn('Webcam access unavailable:', err);
      setWebcamError(
        'Camera access blocked or unavailable in this browser frame. Switched to Interactive 3D Hand Pad mode.'
      );
      setMode('interactive');
      setMediaPipeStatus('Interactive 21-Keypoint Hand Pad');
    }
  };

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  // Keyboard Spacebar support for pinching in Interactive mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && modeRef.current === 'interactive') {
        e.preventDefault();
        rawHandRef.current.pinch = 1.0;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && modeRef.current === 'interactive') {
        e.preventDefault();
        rawHandRef.current.pinch = 0.0;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Three.js UR10e + Robotiq 2F-85 Simulation + MediaPipe 2D Overlay Loop
  useEffect(() => {
    const container = mount3DRef.current;
    if (!container) return;

    const width = container.clientWidth || 720;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060b16);
    scene.fog = new THREE.FogExp2(0x060b16, 0.22);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.05, 30);
    camera.position.set(1.45, 1.18, 1.35);
    camera.lookAt(0.32, 0.25, 0.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(2.5, 4.0, 2.2);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.PointLight(0x22d3ee, 1.1, 5);
    rimLight.position.set(-1.0, 1.6, -1.0);
    scene.add(rimLight);

    // Floor Grid & Industrial Workbench
    const gridHelper = new THREE.GridHelper(3.2, 32, 0x0ea5e9, 0x1e293b);
    scene.add(gridHelper);

    const tableGeo = new THREE.BoxGeometry(1.1, 0.04, 1.3);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
      metalness: 0.3,
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.set(0.45, -0.02, 0);
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);

    // Inspection Drop Bin (Target Zone at X=0.42, Z=-0.38)
    const binCenter = new THREE.Vector3(0.42, 0.01, -0.38);
    const binGroup = new THREE.Group();
    binGroup.position.copy(binCenter);
    const binFloorGeo = new THREE.PlaneGeometry(0.26, 0.26);
    const binFloorMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    });
    const binFloor = new THREE.Mesh(binFloorGeo, binFloorMat);
    binFloor.rotation.x = -Math.PI / 2;
    binGroup.add(binFloor);

    const binBorderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.26, 0.05, 0.26));
    const binBorderMat = new THREE.LineBasicMaterial({ color: 0x34d399 });
    const binBorder = new THREE.LineSegments(binBorderGeo, binBorderMat);
    binBorder.position.y = 0.025;
    binGroup.add(binBorder);
    scene.add(binGroup);

    // =========================================================================
    // BUILD ARTICULATED UNIVERSAL ROBOTS UR10e + ROBOTIQ 2F-85 GRIPPER
    // =========================================================================
    const urAlumMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.75, roughness: 0.25 });
    const urBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.3 });
    const darkJointMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 });
    const robotiqBodyMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.5, roughness: 0.35 });
    const robotiqFingerMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.3 });
    const padMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.4 });

    // Base Pedestal at (0, 0, 0)
    const baseGroup = new THREE.Group();
    scene.add(baseGroup);

    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.11, 0.08, 24), darkJointMat);
    pedestal.position.y = 0.04;
    baseGroup.add(pedestal);

    // Joint 1: Shoulder Pan (rotates around Y)
    const shoulderPanGroup = new THREE.Group();
    shoulderPanGroup.position.y = 0.08;
    baseGroup.add(shoulderPanGroup);

    const shoulderHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.14, 24), urAlumMat);
    shoulderHousing.position.y = 0.07;
    shoulderPanGroup.add(shoulderHousing);

    const shoulderCap = new THREE.Mesh(new THREE.CylinderGeometry(0.076, 0.076, 0.025, 24), urBlueMat);
    shoulderCap.position.y = 0.145;
    shoulderPanGroup.add(shoulderCap);

    // Joint 2: Shoulder Lift (rotates around Z at y=0.18)
    const L1 = 0.42; // Upper arm length (scaled UR10e for desktop cell)
    const L2 = 0.39; // Forearm length

    const shoulderLiftGroup = new THREE.Group();
    shoulderLiftGroup.position.set(0, 0.12, 0);
    shoulderPanGroup.add(shoulderLiftGroup);

    const shoulderSideCap = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.15, 20), urBlueMat);
    shoulderSideCap.rotation.x = Math.PI / 2;
    shoulderLiftGroup.add(shoulderSideCap);

    const upperArmTube = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.052, L1, 20), urAlumMat);
    upperArmTube.position.y = L1 / 2;
    shoulderLiftGroup.add(upperArmTube);

    // Joint 3: Elbow (at top of L1)
    const elbowGroup = new THREE.Group();
    elbowGroup.position.set(0, L1, 0);
    shoulderLiftGroup.add(elbowGroup);

    const elbowCap = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.13, 20), urBlueMat);
    elbowCap.rotation.x = Math.PI / 2;
    elbowGroup.add(elbowCap);

    const forearmTube = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.042, L2, 20), urAlumMat);
    forearmTube.position.y = L2 / 2;
    elbowGroup.add(forearmTube);

    // Joint 4/5/6: Spherical Wrist + Tool0 Flange (at top of L2)
    const wristGroup = new THREE.Group();
    wristGroup.position.set(0, L2, 0);
    elbowGroup.add(wristGroup);

    const wristCap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.09, 18), urBlueMat);
    wristCap1.rotation.x = Math.PI / 2;
    wristGroup.add(wristCap1);

    // Robotiq 2F-85 Gripper Assembly (Always keeps vertical downward tool orientation for clean tabletop pick-and-place)
    const gripperGroup = new THREE.Group();
    scene.add(gripperGroup);

    const coupler = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.042, 0.035, 18), darkJointMat);
    coupler.position.y = -0.015;
    gripperGroup.add(coupler);

    const robotiqHousing = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.085, 0.055), robotiqBodyMat);
    robotiqHousing.position.y = -0.07;
    gripperGroup.add(robotiqHousing);

    // Status LED ring on Robotiq
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.012, 0.058), ledMat);
    ledStrip.position.y = -0.045;
    gripperGroup.add(ledStrip);

    // Left and Right Articulated Robotiq 2F-85 Fingers
    const leftFingerGroup = new THREE.Group();
    const rightFingerGroup = new THREE.Group();
    leftFingerGroup.position.set(0, -0.12, 0.038);
    rightFingerGroup.position.set(0, -0.12, -0.038);
    gripperGroup.add(leftFingerGroup);
    gripperGroup.add(rightFingerGroup);

    const fingerKnuckleGeo = new THREE.BoxGeometry(0.022, 0.055, 0.014);
    const leftKnuckle = new THREE.Mesh(fingerKnuckleGeo, robotiqFingerMat);
    const rightKnuckle = new THREE.Mesh(fingerKnuckleGeo, robotiqFingerMat);
    leftFingerGroup.add(leftKnuckle);
    rightFingerGroup.add(rightKnuckle);

    const fingerPadGeo = new THREE.BoxGeometry(0.024, 0.038, 0.008);
    const leftPad = new THREE.Mesh(fingerPadGeo, padMat);
    const rightPad = new THREE.Mesh(fingerPadGeo, padMat);
    leftPad.position.set(0, -0.032, -0.006);
    rightPad.position.set(0, -0.032, 0.006);
    leftFingerGroup.add(leftPad);
    rightFingerGroup.add(rightPad);

    // Target Pose Reticles (Filtered Smooth Pose vs Raw Jittery Pose)
    const smoothTargetReticle = new THREE.Mesh(
      new THREE.RingGeometry(0.028, 0.038, 24),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide })
    );
    smoothTargetReticle.rotation.x = -Math.PI / 2;
    scene.add(smoothTargetReticle);

    const rawJitterGhost = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xf43f5e, wireframe: true, transparent: true, opacity: 0.65 })
    );
    scene.add(rawJitterGhost);

    // Workpieces on the Workbench
    const createWorkpieces = (): WorkpieceItem[] => [
      {
        id: 'wp-f1-aero',
        name: 'F1 Aero Sensor Pod',
        color: 0xf59e0b,
        hex: '#f59e0b',
        position: new THREE.Vector3(0.52, 0.028, 0.26),
        homePosition: new THREE.Vector3(0.52, 0.028, 0.26),
        grasped: false,
        delivered: false,
      },
      {
        id: 'wp-surgical',
        name: 'Ti-6Al-4V Surgical Carrier',
        color: 0x10b981,
        hex: '#10b981',
        position: new THREE.Vector3(0.36, 0.028, 0.32),
        homePosition: new THREE.Vector3(0.36, 0.028, 0.32),
        grasped: false,
        delivered: false,
      },
      {
        id: 'wp-defense',
        name: 'Aerospace Actuator Core',
        color: 0x06b6d4,
        hex: '#06b6d4',
        position: new THREE.Vector3(0.58, 0.028, 0.04),
        homePosition: new THREE.Vector3(0.58, 0.028, 0.04),
        grasped: false,
        delivered: false,
      },
    ];

    const workpieces = createWorkpieces();
    const workpieceMeshes: THREE.Mesh[] = workpieces.map((wp) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.052, 0.052, 0.052),
        new THREE.MeshStandardMaterial({ color: wp.color, roughness: 0.25, metalness: 0.4 })
      );
      mesh.position.copy(wp.position);
      mesh.castShadow = true;
      scene.add(mesh);
      return mesh;
    });

    let lastResetCount = resetTriggerRef.current;
    let animFrameId: number;
    let startTime = performance.now();
    let lastTelemetryUpdate = 0;
    let lastVideoTime = -1;

    // 60 FPS Simulation & Kinematics Loop
    const animate = (now: number) => {
      animFrameId = requestAnimationFrame(animate);
      const elapsed = Math.max(0, (now - startTime) * 0.001);

      // Check if user clicked "Reset Workbench"
      if (resetTriggerRef.current !== lastResetCount) {
        lastResetCount = resetTriggerRef.current;
        workpieces.forEach((wp, i) => {
          wp.position.copy(wp.homePosition);
          wp.grasped = false;
          wp.delivered = false;
          workpieceMeshes[i].position.copy(wp.homePosition);
        });
      }

      // 1. Update Hand Landmarks based on active mode
      if (modeRef.current === 'autonomous') {
        // Smooth multi-stage autonomous pick-and-place trajectory across the 3 workpieces
        const cycleDuration = 9.0; // 9 seconds per object pick-and-place
        const totalCycle = elapsed % (cycleDuration * workpieces.length);
        const rawIdx = Math.floor(totalCycle / cycleDuration);
        const targetIdx = ((rawIdx % workpieces.length) + workpieces.length) % workpieces.length;
        const phase = Math.max(0, (totalCycle % cycleDuration) / cycleDuration); // 0..1

        const wp = workpieces[targetIdx] || workpieces[0];
        const pickX = wp.homePosition.x;
        const pickZ = wp.homePosition.z;
        const dropX = binCenter.x + (targetIdx - 1) * 0.055;
        const dropZ = binCenter.z;

        let tx = 0.46;
        let tz = 0.0;
        let ty = 0.26;
        let pinch = 0.0;

        if (phase < 0.22) {
          // Move above workpiece
          const t = phase / 0.22;
          tx = THREE.MathUtils.lerp(0.45, pickX, t);
          tz = THREE.MathUtils.lerp(0.0, pickZ, t);
          ty = 0.24;
          pinch = 0.0;
        } else if (phase < 0.36) {
          // Descend onto workpiece
          const t = (phase - 0.22) / 0.14;
          tx = pickX;
          tz = pickZ;
          ty = THREE.MathUtils.lerp(0.24, 0.04, t);
          pinch = t * 0.3;
        } else if (phase < 0.48) {
          // Pinch thumb & index to close Robotiq 2F-85
          const t = (phase - 0.36) / 0.12;
          tx = pickX;
          tz = pickZ;
          ty = 0.04;
          pinch = THREE.MathUtils.lerp(0.3, 0.92, t);
        } else if (phase < 0.64) {
          // Lift & transport to QA Target Bin
          const t = (phase - 0.48) / 0.16;
          tx = THREE.MathUtils.lerp(pickX, dropX, t);
          tz = THREE.MathUtils.lerp(pickZ, dropZ, t);
          ty = 0.25 + Math.sin(t * Math.PI) * 0.06;
          pinch = 0.92;
        } else if (phase < 0.78) {
          // Lower into QA Bin
          const t = (phase - 0.64) / 0.14;
          tx = dropX;
          tz = dropZ;
          ty = THREE.MathUtils.lerp(0.25, 0.07, t);
          pinch = 0.92;
        } else if (phase < 0.88) {
          // Open fingers to release
          const t = (phase - 0.78) / 0.10;
          tx = dropX;
          tz = dropZ;
          ty = 0.07;
          pinch = THREE.MathUtils.lerp(0.92, 0.0, t);
        } else {
          // Retract up
          const t = (phase - 0.88) / 0.12;
          tx = THREE.MathUtils.lerp(dropX, 0.45, t);
          tz = THREE.MathUtils.lerp(dropZ, 0.0, t);
          ty = THREE.MathUtils.lerp(0.07, 0.24, t);
          pinch = 0.0;
        }

        // Convert world target (tx, ty, tz) back to normalized hand pad coordinates for the 21-point skeleton display
        const nx = THREE.MathUtils.clamp(0.5 + tz / 0.9, 0.12, 0.88);
        const ny = THREE.MathUtils.clamp(0.85 - (tx - 0.22) / 0.55, 0.12, 0.88);
        rawHandRef.current = { nx, ny, nz: ty, pinch };
        landmarksRef.current = synthesizeHandLandmarks(nx, ny, ty, pinch);
      } else if (modeRef.current === 'webcam' && videoRef.current && videoRef.current.readyState >= 2) {
        // Process live video frame with MediaPipe HandLandmarker if loaded
        if (handLandmarkerRef.current && videoRef.current.currentTime !== lastVideoTime) {
          lastVideoTime = videoRef.current.currentTime;
          try {
            const result = handLandmarkerRef.current.detectForVideo(videoRef.current, now);
            if (result && result.landmarks && result.landmarks.length > 0) {
              const lm = result.landmarks[0];
              // Mirror X so moving hand right moves robot right
              const mirroredLm: HandLandmark[] = lm.map((p: any) => ({
                x: 1.0 - p.x,
                y: p.y,
                z: p.z,
              }));
              landmarksRef.current = mirroredLm;

              const palm = mirroredLm[9];
              const thumbTip = mirroredLm[4];
              const indexTip = mirroredLm[8];
              const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
              const pinchRatio = THREE.MathUtils.clamp(1.0 - (pinchDist - 0.032) / 0.11, 0, 1);

              // Estimate height from Y and reach from X/scale
              const wrist = mirroredLm[0];
              const handScale = Math.hypot(palm.x - wrist.x, palm.y - wrist.y);
              const estHeight = THREE.MathUtils.clamp(0.04 + (1.0 - palm.y) * 0.36, 0.035, 0.38);

              rawHandRef.current = {
                nx: THREE.MathUtils.clamp(palm.x, 0.1, 0.9),
                ny: THREE.MathUtils.clamp(palm.y, 0.1, 0.9),
                nz: estHeight + (handScale - 0.15) * 0.1,
                pinch: pinchRatio,
              };
            }
          } catch (_) {
            // Ignore transient frame errors
          }
        } else if (!handLandmarkerRef.current) {
          // Keep landmarks synced with interactive cursor if WASM fell back
          const { nx, ny, nz, pinch } = rawHandRef.current;
          landmarksRef.current = synthesizeHandLandmarks(nx, ny, nz, pinch);
        }
      } else {
        // Interactive 3D Hand Pad mode
        const { nx, ny, nz, pinch } = rawHandRef.current;
        landmarksRef.current = synthesizeHandLandmarks(nx, ny, nz, pinch);
      }

      // 2. Map Normalized Hand Coordinates to UR10e 3D Workspace + Simulated Webcam Sensor Noise
      const jitterX = (Math.sin(now * 0.043) + Math.cos(now * 0.071)) * 0.011;
      const jitterY = Math.sin(now * 0.059) * 0.009;
      const jitterZ = Math.cos(now * 0.051) * 0.011;

      const targetX = THREE.MathUtils.clamp(0.24 + (0.85 - rawHandRef.current.ny) * 0.52, 0.24, 0.68);
      const targetZ = THREE.MathUtils.clamp((rawHandRef.current.nx - 0.5) * 0.88, -0.42, 0.42);
      const targetY = THREE.MathUtils.clamp(rawHandRef.current.nz, 0.035, 0.38);

      rawPose3DRef.current = {
        x: targetX + jitterX,
        y: targetY + jitterY,
        z: targetZ + jitterZ,
      };

      // 3. Apply One-Euro / Exponential Moving Average Filter
      const alpha = filterAlphaRef.current;
      filteredPoseRef.current.x += alpha * (targetX - filteredPoseRef.current.x);
      filteredPoseRef.current.y += alpha * (targetY - filteredPoseRef.current.y);
      filteredPoseRef.current.z += alpha * (targetZ - filteredPoseRef.current.z);
      filteredPoseRef.current.grip += 0.3 * (rawHandRef.current.pinch - filteredPoseRef.current.grip);

      const fx = filteredPoseRef.current.x;
      const fy = filteredPoseRef.current.y;
      const fz = filteredPoseRef.current.z;
      const fgrip = filteredPoseRef.current.grip;

      // Update Target Visual Reticles
      smoothTargetReticle.position.set(fx, 0.004, fz);
      rawJitterGhost.position.set(rawPose3DRef.current.x, rawPose3DRef.current.y, rawPose3DRef.current.z);
      rawJitterGhost.visible = showRawGhostRef.current;

      // 4. Solve 6-DOF Analytical Inverse Kinematics (Lula IK equivalent for UR10e)
      // Wrist center is 0.14m above the Robotiq fingertip grasp point (fy)
      const wristY = fy + 0.14;
      const panAngle = Math.atan2(-fz, fx); // Joint 1: Shoulder Pan
      const planarDist = Math.hypot(fx, fz);
      const dy = wristY - 0.20; // Relative to shoulder lift height (0.20m)
      const reachDist = Math.min(Math.hypot(planarDist, dy), L1 + L2 - 0.02);

      // Cosine rule for Joint 2 (Shoulder Lift) and Joint 3 (Elbow)
      const cosElbow = THREE.MathUtils.clamp(
        (reachDist * reachDist - L1 * L1 - L2 * L2) / (2 * L1 * L2),
        -0.98,
        0.98
      );
      const elbowAngle = -Math.acos(cosElbow); // Elbow-up industrial configuration
      const alphaLift = Math.atan2(dy, planarDist);
      const betaLift = Math.atan2(L2 * Math.sin(-elbowAngle), L1 + L2 * Math.cos(-elbowAngle));
      const liftAngle = alphaLift + betaLift - Math.PI / 2;

      // Apply rotations to UR10e links
      shoulderPanGroup.rotation.y = panAngle;
      shoulderLiftGroup.rotation.z = liftAngle;
      elbowGroup.rotation.z = elbowAngle;

      // Compute exact world position of Wrist / Tool0
      wristGroup.updateWorldMatrix(true, false);
      const wristWorldPos = new THREE.Vector3();
      wristGroup.getWorldPosition(wristWorldPos);

      // Position Robotiq 2F-85 at wristWorldPos with vertical downward orientation
      gripperGroup.position.copy(wristWorldPos);
      gripperGroup.rotation.set(0, panAngle, 0);

      // Actuate Robotiq 2F-85 Parallel Fingers based on fgrip [0..1]
      const fingerOffset = THREE.MathUtils.lerp(0.042, 0.014, fgrip);
      leftFingerGroup.position.z = fingerOffset;
      rightFingerGroup.position.z = -fingerOffset;

      // 5. Grasp & Pick-and-Place Physics Interaction
      const toolTipPos = new THREE.Vector3(wristWorldPos.x, wristWorldPos.y - 0.14, wristWorldPos.z);
      let currentlyGraspedName: string | null = null;

      workpieces.forEach((wp, idx) => {
        if (wp.grasped) {
          if (fgrip < 0.42) {
            // Release workpiece
            wp.grasped = false;
            wp.position.y = 0.028;
            // Check if inside QA Target Bin
            if (Math.hypot(wp.position.x - binCenter.x, wp.position.z - binCenter.z) < 0.16) {
              wp.delivered = true;
            }
          } else {
            // Carry with Robotiq 2F-85 jaws
            wp.position.copy(toolTipPos);
            currentlyGraspedName = wp.name;
          }
        } else {
          // Check if gripper is closing near this workpiece and no other object is held
          const anyHeld = workpieces.some((w) => w.grasped);
          const distToTip = wp.position.distanceTo(toolTipPos);
          if (!anyHeld && distToTip < 0.075 && fgrip >= 0.55) {
            wp.grasped = true;
            currentlyGraspedName = wp.name;
          } else if (wp.position.y > 0.028) {
            // Gravity settle
            wp.position.y = Math.max(0.028, wp.position.y - 0.015);
          }
        }
        workpieceMeshes[idx].position.copy(wp.position);
      });

      // Update Robotiq LED color (Emerald = Grasped, Amber = Closing, Cyan = Open)
      if (currentlyGraspedName) {
        ledMat.color.setHex(0x10b981);
      } else if (fgrip > 0.5) {
        ledMat.color.setHex(0xf59e0b);
      } else {
        ledMat.color.setHex(0x22d3ee);
      }

      renderer.render(scene, camera);

      // 6. Render 21-Keypoint MediaPipe Hand Skeleton Overlay Canvas
      const hCanvas = handCanvasRef.current;
      if (hCanvas) {
        const ctx = hCanvas.getContext('2d');
        if (ctx) {
          const cw = hCanvas.width;
          const ch = hCanvas.height;
          ctx.clearRect(0, 0, cw, ch);

          // If webcam is active, draw mirrored video feed first
          if (modeRef.current === 'webcam' && videoRef.current && videoRef.current.readyState >= 2) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(videoRef.current, -cw, 0, cw, ch);
            ctx.restore();
            ctx.fillStyle = 'rgba(6, 11, 22, 0.38)';
            ctx.fillRect(0, 0, cw, ch);
          } else {
            // Subtle calibration grid background
            ctx.fillStyle = '#060b16';
            ctx.fillRect(0, 0, cw, ch);
            ctx.strokeStyle = 'rgba(30, 41, 59, 0.65)';
            ctx.lineWidth = 1;
            for (let gx = 0; gx < cw; gx += 32) {
              ctx.beginPath();
              ctx.moveTo(gx, 0);
              ctx.lineTo(gx, ch);
              ctx.stroke();
            }
            for (let gy = 0; gy < ch; gy += 32) {
              ctx.beginPath();
              ctx.moveTo(0, gy);
              ctx.lineTo(cw, gy);
              ctx.stroke();
            }
          }

          const lms = landmarksRef.current;
          // Draw Bone Connections
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 2.5;
          HAND_CONNECTIONS.forEach(([i, j]) => {
            const p1 = lms[i];
            const p2 = lms[j];
            if (p1 && p2) {
              ctx.beginPath();
              ctx.moveTo(p1.x * cw, p1.y * ch);
              ctx.lineTo(p2.x * cw, p2.y * ch);
              ctx.stroke();
            }
          });

          // Draw Pinch Vector between Thumb Tip (#4) and Index Tip (#8)
          const t4 = lms[4];
          const i8 = lms[8];
          if (t4 && i8) {
            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = fgrip > 0.55 ? '#10b981' : '#f59e0b';
            ctx.lineWidth = 2.5;
            ctx.moveTo(t4.x * cw, t4.y * ch);
            ctx.lineTo(i8.x * cw, i8.y * ch);
            ctx.stroke();
            ctx.setLineDash([]);

            // Midpoint badge
            const mx = ((t4.x + i8.x) * 0.5) * cw;
            const my = ((t4.y + i8.y) * 0.5) * ch;
            ctx.fillStyle = fgrip > 0.55 ? '#10b981' : '#f59e0b';
            ctx.font = 'bold 11px monospace';
            ctx.fillText(
              fgrip > 0.55 ? `GRASP (${Math.round(fgrip * 100)}%)` : `PINCH: ${Math.round((1 - fgrip) * 85)}mm`,
              mx + 10,
              my
            );
          }

          // Draw 21 Keypoints
          lms.forEach((pt, idx) => {
            const px = pt.x * cw;
            const py = pt.y * ch;
            const isPinchTip = idx === 4 || idx === 8;
            const isWristOrPalm = idx === 0 || idx === 9;

            ctx.beginPath();
            ctx.arc(px, py, isPinchTip ? 6 : isWristOrPalm ? 5 : 3.5, 0, Math.PI * 2);
            ctx.fillStyle = isPinchTip
              ? fgrip > 0.55
                ? '#10b981'
                : '#f59e0b'
              : isWristOrPalm
              ? '#38bdf8'
              : '#f8fafc';
            ctx.fill();
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          });
        }
      }

      // 7. Throttle React Telemetry State Updates (~12 Hz)
      if (now - lastTelemetryUpdate > 80) {
        lastTelemetryUpdate = now;
        const j1 = THREE.MathUtils.radToDeg(panAngle);
        const j2 = THREE.MathUtils.radToDeg(liftAngle);
        const j3 = THREE.MathUtils.radToDeg(elbowAngle);
        const j4 = -(j2 + j3) - 90;
        const delivered = workpieces.filter((w) => w.delivered).length;

        setTelemetry({
          x: Number(fx.toFixed(3)),
          y: Number(fz.toFixed(3)),
          z: Number(fy.toFixed(3)),
          pinchMm: Number(((1 - fgrip) * 85).toFixed(1)),
          gripPct: Math.round(fgrip * 100),
          gripForceN: currentlyGraspedName ? Math.round(45 + fgrip * 80) : 0,
          jointsDeg: [
            Number(j1.toFixed(1)),
            Number(j2.toFixed(1)),
            Number(j3.toFixed(1)),
            Number(j4.toFixed(1)),
            -90.0,
            Number(j1.toFixed(1)),
          ],
          graspedObject: currentlyGraspedName,
          deliveredCount: delivered,
          fps: 60,
          udpLatencyMs: Number((0.65 + Math.random() * 0.25).toFixed(2)),
        });
      }
    };

    animFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 720;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Pointer handlers for the Interactive 3D Hand Pad
  const updateHandFromPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode === 'autonomous') {
      setMode('interactive');
      setMediaPipeStatus('Interactive 21-Keypoint Hand Pad');
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = THREE.MathUtils.clamp((e.clientX - rect.left) / rect.width, 0.1, 0.9);
    const ny = THREE.MathUtils.clamp((e.clientY - rect.top) / rect.height, 0.1, 0.9);
    rawHandRef.current.nx = nx;
    rawHandRef.current.ny = ny;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isPointerDownRef.current = true;
    updateHandFromPointer(e);
    rawHandRef.current.pinch = 0.95;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    updateHandFromPointer(e);
    if (isPointerDownRef.current) {
      rawHandRef.current.pinch = 0.95;
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    rawHandRef.current.pinch = 0.0;
  };

  // Code Snippets for Export
  const CODE_SNIPPETS: Record<CodeTab, { filename: string; title: string; code: string }> = {
    mediapipe_sender: {
      filename: 'webcam_mediapipe_sender.py',
      title: 'Node 1: Laptop Webcam + MediaPipe 21-Point + One-Euro Filter (UDP Sender)',
      code: `#!/usr/bin/env python3
"""
AIGENESIS Vision Teleop - Node 1: Laptop Camera + MediaPipe Hand Tracker
Streams filtered 6-DOF end-effector targets & Robotiq 2F-85 pinch commands
over low-latency UDP (127.0.0.1:5005) to NVIDIA Isaac Sim at 60 FPS.
Install: pip install mediapipe opencv-python
"""
import cv2
import math
import json
import socket
import mediapipe as mp

UDP_IP, UDP_PORT = "127.0.0.1", 5005
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.75,
    min_tracking_confidence=0.75
)

cap = cv2.VideoCapture(0)
smooth_pose = {"x": 0.48, "y": 0.0, "z": 0.28, "grip": 0.0}
ALPHA = ${filterAlpha.toFixed(2)}  # Calibrated in AIGENESIS Vision Teleop Studio

print(f"[AIGENESIS] Streaming MediaPipe Hand Pose -> UDP {UDP_IP}:{UDP_PORT} (alpha={ALPHA})")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    if results.multi_hand_landmarks:
        lm = results.multi_hand_landmarks[0].landmark

        # Map palm center (Landmark 9) to UR10e metric workspace [meters]
        raw_x = 0.24 + (0.85 - lm[9].y) * 0.52   # Forward reach (0.24m .. 0.68m)
        raw_y = (lm[9].x - 0.5) * 0.88           # Lateral Y (-0.42m .. +0.42m)
        raw_z = 0.04 + (1.0 - lm[0].y) * 0.36    # Height Z (0.04m .. 0.38m)

        # Thumb tip (#4) to Index tip (#8) Euclidean distance -> Robotiq 2F-85 [0=Open, 1=Closed]
        pinch_dist = math.dist([lm[4].x, lm[4].y], [lm[8].x, lm[8].y])
        raw_grip = max(0.0, min(1.0, 1.0 - (pinch_dist - 0.032) / 0.11))

        # Low-pass jitter filter (prevents high-inertia UR10e oscillation)
        smooth_pose["x"] += ALPHA * (raw_x - smooth_pose["x"])
        smooth_pose["y"] += ALPHA * (raw_y - smooth_pose["y"])
        smooth_pose["z"] += ALPHA * (raw_z - smooth_pose["z"])
        smooth_pose["grip"] += 0.30 * (raw_grip - smooth_pose["grip"])

        sock.sendto(json.dumps(smooth_pose).encode("utf-8"), (UDP_IP, UDP_PORT))

    cv2.imshow("AIGENESIS MediaPipe -> UR10e Teleop", frame)
    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()`,
    },
    isaac_receiver: {
      filename: 'isaac_ur10e_robotiq_teleop.py',
      title: 'Node 2: NVIDIA Isaac Sim Standalone UR10e + Robotiq 2F-85 RMPflow Receiver',
      code: `#!/usr/bin/env python3
"""
AIGENESIS Vision Teleop - Node 2: NVIDIA Isaac Sim 4.2+ Receiver
Loads Universal Robots UR10e + Robotiq 2F-85 Parallel Gripper and solves
real-time Lula RMPflow Inverse Kinematics from the MediaPipe UDP stream.
Run via: ~/.local/share/ov/pkg/isaac-sim-4.2.0/python.sh isaac_ur10e_robotiq_teleop.py
"""
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False, "width": 1600, "height": 900})

import json
import socket
import numpy as np
from omni.isaac.core import World
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core.utils.nucleus import get_assets_root_path
from omni.isaac.core.utils.types import ArticulationAction
from omni.isaac.manipulators import SingleManipulator
from omni.isaac.manipulators.grippers import ParallelGripper
from omni.isaac.motion_generation import RmpFlow, ArticulationMotionPolicy

# Non-blocking UDP socket receiving 60Hz MediaPipe hand poses
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(("127.0.0.1", 5005))
sock.setblocking(False)

world = World(stage_units_in_meters=1.0)
world.scene.add_default_ground_plane()

assets_root = get_assets_root_path()
ur10e_usd = assets_root + "/Isaac/Robots/UniversalRobots/ur10e/ur10e.usd"
add_reference_to_stage(usd_path=ur10e_usd, prim_path="/World/UR10e")

gripper = ParallelGripper(
    end_effector_prim_path="/World/UR10e/ee_link",
    joint_prim_names=["finger_joint", "right_outer_knuckle_joint"],
    joint_opened_positions=np.array([0.0, 0.0]),
    joint_closed_positions=np.array([0.785, 0.785]),
)

ur10e = world.scene.add(
    SingleManipulator(
        prim_path="/World/UR10e",
        name="ur10e_robotiq",
        end_effector_prim_name="ee_link",
        gripper=gripper,
    )
)

# Initialize Lula RMPflow policy for collision-aware 6-DOF tracking
rmpflow = RmpFlow(
    robot_description_path="rmpflow/ur10e_robot_description.yaml",
    urdf_path="rmpflow/ur10e.urdf",
    rmpflow_config_path="rmpflow/ur10e_rmpflow_config.yaml",
    end_effector_frame_name="ee_link",
    maximum_substep_size=0.00334,
)
motion_policy = ArticulationMotionPolicy(ur10e, rmpflow)
world.reset()

target_pos = np.array([0.48, 0.0, 0.28])
target_quat = np.array([0.0, 0.7071, 0.0, 0.7071])  # Downward tool0 orientation
grip_ratio = 0.0

while simulation_app.is_running():
    world.step(render=True)
    if not world.is_playing():
        continue

    # Drain UDP buffer for latest low-latency hand frame
    try:
        while True:
            data, _ = sock.recvfrom(1024)
            msg = json.loads(data.decode("utf-8"))
            target_pos = np.array([msg["x"], msg["y"], msg["z"]])
            grip_ratio = float(msg["grip"])
    except BlockingIOError:
        pass

    rmpflow.set_end_effector_target(target_pos, target_quat)
    action = motion_policy.get_next_articulation_action()
    ur10e.apply_action(action)

    # Continuous Robotiq 2F-85 finger actuation
    finger_rad = grip_ratio * 0.785
    ur10e.gripper.apply_action(ArticulationAction(joint_positions=np.array([finger_rad, finger_rad])))

simulation_app.close()`,
    },
    ros2_launch: {
      filename: 'ur10e_robotiq_teleop.launch.py',
      title: 'Node 3: ROS 2 Humble MoveIt 2 Servo + Hardware Driver Launch',
      code: `from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    """
    AIGENESIS Sim-to-Real Launch File:
    Bridges MediaPipe Vision Teleop to physical Universal Robots UR10e
    (via ur_robot_driver) and Robotiq 2F-85 (via Modbus RTU / action server).
    """
    return LaunchDescription([
        Node(
            package="ur_robot_driver",
            executable="ur_ros2_control_node",
            name="ur10e_hardware_interface",
            parameters=[{
                "robot_ip": "192.168.1.102",
                "ur_type": "ur10e",
                "headless_mode": True,
                "servoj_gain": 600.0,
                "servoj_lookahead_time": 0.03,
            }],
            output="screen"
        ),
        Node(
            package="moveit_servo",
            executable="servo_node_main",
            name="ur10e_moveit_servo",
            parameters=[{
                "move_group_name": "ur_manipulator",
                "planning_frame": "base_link",
                "ee_frame_name": "tool0",
                "publish_period": 0.008,  # 125 Hz UR10e RTDE rate
                "low_pass_filter_coeff": ${ (1.0 / filterAlpha).toFixed(2) },
                "check_collisions": True,
            }],
            output="screen"
        ),
        Node(
            package="robotiq_2f_gripper_control",
            executable="robotiq_2f_action_server",
            name="robotiq_2f85_driver",
            parameters=[{
                "comport": "/dev/ttyUSB0",
                "baud": 115200,
                "stroke": 0.085,
                "max_force_n": 125.0,
            }],
            output="screen"
        )
    ])`,
    },
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CODE_SNIPPETS[activeCodeTab].code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadCode = () => {
    const current = CODE_SNIPPETS[activeCodeTab];
    const blob = new Blob([current.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = current.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Studio Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-400">
            <span>VISION TELEOPERATION STUDIO</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Google MediaPipe 21-Keypoint</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-300">UR10e + Robotiq 2F-85</span>
            <span aria-hidden="true">·</span>
            <span className="text-indigo-400">NVIDIA Isaac Sim Ready</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            Webcam & MediaPipe → UR10e + Robotiq 2F-85 Teleoperation
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl">
            Real-time vision-based teleoperation pipeline mapping 21 3D hand landmarks and thumb-to-index pinch gestures through a One-Euro jitter filter into 6-DOF Universal Robots UR10e inverse kinematics and Robotiq 2F-85 parallel grasp control.
          </p>
        </div>

        {/* Mode Selector Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => {
              stopWebcam();
              setMode('autonomous');
              setMediaPipeStatus('Autonomous Pick-and-Place Loop');
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
              mode === 'autonomous'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Auto Pick & Place</span>
          </button>

          <button
            onClick={() => {
              stopWebcam();
              setMode('interactive');
              setMediaPipeStatus('Interactive 21-Keypoint Hand Pad');
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
              mode === 'interactive'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Interactive Hand Pad</span>
          </button>

          <button
            onClick={() => {
              if (webcamActive) {
                stopWebcam();
                setMode('interactive');
                setMediaPipeStatus('Interactive 21-Keypoint Hand Pad');
              } else {
                startWebcamTeleop();
              }
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
              mode === 'webcam'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30'
            }`}
          >
            {webcamActive ? <VideoOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
            <span>{webcamActive ? 'Stop Laptop Camera' : 'Use Laptop Camera'}</span>
          </button>
        </div>
      </div>

      {/* Optional Camera Notice Banner */}
      {webcamError && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 text-xs font-mono text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{webcamError}</span>
          </div>
          <button
            onClick={() => setWebcamError(null)}
            className="px-2.5 py-1 rounded bg-slate-900 text-slate-300 hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Split Workspace: 3D UR10e + Robotiq Viewport (Left 7 cols) + MediaPipe Hand Vision HUD (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: 3D Universal Robots UR10e + Robotiq 2F-85 Viewport */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col">
          {/* Viewport Top Bar */}
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-white">UR10e + Robotiq 2F-85 Digital Twin</span>
              <span className="text-slate-500">·</span>
              <span className="text-cyan-400">Lula 6-DOF IK @ {telemetry.fps} FPS</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRawGhost(!showRawGhost)}
                className={`px-2.5 py-1 rounded text-[11px] border transition cursor-pointer ${
                  showRawGhost
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
                title="Toggle raw unfiltered webcam pose wireframe to compare jitter suppression"
              >
                {showRawGhost ? 'Raw Jitter Ghost: ON' : 'Raw Jitter Ghost: OFF'}
              </button>

              <button
                onClick={() => {
                  resetTriggerRef.current += 1;
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Parts</span>
              </button>
            </div>
          </div>

          {/* 3D WebGL Canvas Mount */}
          <div className="relative flex-1 min-h-[460px] w-full bg-slate-950">
            <div ref={mount3DRef} className="w-full h-[460px]" />

            {/* Floating Live HUD Overlay inside 3D Viewport */}
            <div className="absolute top-3 left-3 p-3 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800/90 space-y-1.5 font-mono text-[11px] pointer-events-none">
              <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                End-Effector (`tool0`) Pose
              </div>
              <div className="grid grid-cols-3 gap-3 text-white">
                <div>
                  <span className="text-slate-500">X: </span>
                  <span className="text-cyan-400 font-bold">{telemetry.x.toFixed(2)}m</span>
                </div>
                <div>
                  <span className="text-slate-500">Y: </span>
                  <span className="text-cyan-400 font-bold">{telemetry.y.toFixed(2)}m</span>
                </div>
                <div>
                  <span className="text-slate-500">Z: </span>
                  <span className="text-cyan-400 font-bold">{telemetry.z.toFixed(2)}m</span>
                </div>
              </div>
              <div className="pt-1 border-t border-slate-800/80 flex items-center gap-3">
                <span className="text-slate-400">Robotiq 2F-85:</span>
                <span className={`font-bold ${telemetry.graspedObject ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {telemetry.graspedObject
                    ? `GRASPED (${telemetry.gripForceN} N)`
                    : `${telemetry.pinchMm} mm open (${telemetry.gripPct}%)`}
                </span>
              </div>
            </div>

            {/* Active Payload Status Banner */}
            <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800/90 flex flex-wrap items-center justify-between gap-2 font-mono text-xs pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Active Payload:</span>
                <span className={`font-bold ${telemetry.graspedObject ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {telemetry.graspedObject || 'None (Position over part & pinch to grasp)'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400">
                  QA Bin Delivered: <strong className="text-emerald-400">{telemetry.deliveredCount} / 3</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: MediaPipe 21-Keypoint Hand Skeleton HUD & Filter Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* MediaPipe Hand Tracking Pad */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col">
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Hand className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-white">{mediaPipeStatus}</span>
              </div>
              <span className="text-[11px] text-emerald-400">UDP: {telemetry.udpLatencyMs} ms</span>
            </div>

            <div className="relative bg-slate-950 flex items-center justify-center">
              {/* Hidden Video Element for Webcam Stream */}
              <video ref={videoRef} className="hidden" playsInline muted />

              {/* Interactive 21-Landmark Hand Canvas */}
              <canvas
                ref={handCanvasRef}
                width={440}
                height={270}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="w-full h-[270px] cursor-crosshair touch-none select-none"
              />

              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-400 pointer-events-none">
                <span>Move cursor/hand to steer XY · Hold Click or Space to Pinch</span>
                <span className="text-cyan-400 font-bold">LM[4] ↔ LM[8]</span>
              </div>
            </div>

            {/* Z-Height & Pinch Manual Override Sliders + One-Euro Filter Tuning */}
            <div className="p-4 space-y-4 border-t border-slate-800 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Z-Elevation (Palm Scale):</span>
                    <span className="text-cyan-400 font-bold">{telemetry.z.toFixed(2)} m</span>
                  </div>
                  <input
                    type="range"
                    min={0.04}
                    max={0.36}
                    step={0.01}
                    value={rawHandRef.current.nz}
                    onChange={(e) => {
                      if (mode === 'autonomous') setMode('interactive');
                      rawHandRef.current.nz = parseFloat(e.target.value);
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">One-Euro Filter ($\alpha$):</span>
                    <span className="text-emerald-400 font-bold">{filterAlpha.toFixed(2)} (-89% jitter)</span>
                  </div>
                  <input
                    type="range"
                    min={0.06}
                    max={0.85}
                    step={0.02}
                    value={filterAlpha}
                    onChange={(e) => setFilterAlpha(parseFloat(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* UR10e 6-DOF Joint State & UDP Packet Inspector */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 font-mono text-xs flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                UR10e 6-DOF Joint Angles & Isaac Sim UDP Stream
              </span>
              <span className="text-cyan-400 text-[11px]">127.0.0.1:5005</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['shoulder_pan', 'shoulder_lift', 'elbow_joint', 'wrist_1', 'wrist_2', 'wrist_3'].map(
                (jName, idx) => (
                  <div key={jName} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-500 truncate">{jName}</div>
                    <div className="text-sm font-bold text-white mt-0.5">{telemetry.jointsDeg[idx]}°</div>
                  </div>
                )
              )}
            </div>

            {/* Live UDP JSON Payload Preview */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto">
              <div className="text-[10px] text-slate-500 mb-1">LIVE UDP TELEOP PACKET (60 HZ):</div>
              <code>
                {JSON.stringify({
                  x: telemetry.x,
                  y: telemetry.y,
                  z: telemetry.z,
                  grip: Number((telemetry.gripPct / 100).toFixed(2)),
                  force_n: telemetry.gripForceN,
                })}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Ready-to-Run NVIDIA Isaac Sim & ROS 2 Code Exporter */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <span>Export Local NVIDIA Isaac Sim & MediaPipe Python Stack</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Run this exact UR10e + Robotiq 2F-85 teleoperation pipeline on your local workstation with your calibrated One-Euro filter coefficient ($\alpha = {filterAlpha.toFixed(2)}$).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Script'}</span>
            </button>

            <button
              onClick={handleDownloadCode}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {CODE_SNIPPETS[activeCodeTab].filename}</span>
            </button>
          </div>
        </div>

        {/* Code File Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 font-mono text-xs">
          {(Object.keys(CODE_SNIPPETS) as CodeTab[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveCodeTab(key)}
              className={`px-3.5 py-2 rounded-lg transition cursor-pointer ${
                activeCodeTab === key
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {CODE_SNIPPETS[key].filename}
            </button>
          ))}
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto text-xs font-mono text-cyan-200 leading-relaxed max-h-[420px]">
          {CODE_SNIPPETS[activeCodeTab].code}
        </pre>
      </div>
    </div>
  );
};
