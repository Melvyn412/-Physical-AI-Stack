import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Play, Pause, SkipForward, AlertTriangle, Eye, Globe, Zap, RotateCcw, 
  Box, Camera, Layers, Activity, Maximize2, Move3D, Compass
} from 'lucide-react';
import { ObjectiveScenario, StackPillar } from '../types';

interface PhysicalSimulationCanvas3DProps {
  scenario: ObjectiveScenario;
  activeStepIndex: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextStep: () => void;
  onReset: () => void;
  activePillarHighlight?: StackPillar | null;
}

export const PhysicalSimulationCanvas3D: React.FC<PhysicalSimulationCanvas3DProps> = ({
  scenario,
  activeStepIndex,
  isPlaying,
  onTogglePlay,
  onNextStep,
  onReset,
  activePillarHighlight
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  
  // Controls state
  const [injectObstacle, setInjectObstacle] = useState<boolean>(false);
  const [showWorldModelRollout, setShowWorldModelRollout] = useState<boolean>(true);
  const [showSensors, setShowSensors] = useState<boolean>(true);
  const [cameraView, setCameraView] = useState<'iso' | 'top' | 'wrist' | 'target'>('iso');

  // Real-time telemetry state
  const [endEffectorPos, setEndEffectorPos] = useState<{ x: number; y: number; z: number }>({ x: 0.8, y: 0.4, z: 0 });
  const [jointAnglesDeg, setJointAnglesDeg] = useState<number[]>([0, -30, 45, 0, 15, 0]);

  // Refs for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  // Robot Joints
  const joint1Ref = useRef<THREE.Group | null>(null); // Base Rotation
  const joint2Ref = useRef<THREE.Group | null>(null); // Shoulder Pitch
  const joint3Ref = useRef<THREE.Group | null>(null); // Elbow Pitch
  const joint4Ref = useRef<THREE.Group | null>(null); // Wrist Roll
  const gripperLeftRef = useRef<THREE.Mesh | null>(null);
  const gripperRightRef = useRef<THREE.Mesh | null>(null);

  // Ghost Robot Arm for World Model
  const ghostJoint1Ref = useRef<THREE.Group | null>(null);
  const ghostJoint2Ref = useRef<THREE.Group | null>(null);
  const ghostJoint3Ref = useRef<THREE.Group | null>(null);

  // Sensor Vision Cone & Point Cloud
  const sensorConeRef = useRef<THREE.Mesh | null>(null);
  const pointCloudRef = useRef<THREE.Points | null>(null);
  const obstacleRef = useRef<THREE.Group | null>(null);
  const targetMeshRef = useRef<THREE.Mesh | null>(null);
  const trajectoryLineRef = useRef<THREE.Line | null>(null);

  // Mouse Orbit Drag Controls
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: Math.PI / 4,
    phi: Math.PI / 5,
    radius: 4.2
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = 380;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a12);
    scene.fog = new THREE.FogExp2(0x070a12, 0.12);
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Clear previous children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    dirLight.position.set(3, 5, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const accentPointLight = new THREE.PointLight(0x10b981, 2, 8);
    accentPointLight.position.set(0, 1.5, 0);
    scene.add(accentPointLight);

    // 5. Ground Floor & Spatial Grid
    const gridHelper = new THREE.GridHelper(10, 20, 0x0284c7, 0x1e293b);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1d,
      roughness: 0.8,
      metalness: 0.2
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Coordinate Axes Helper
    const axesHelper = new THREE.AxesHelper(0.8);
    axesHelper.position.set(-1.8, 0.01, -1.8);
    scene.add(axesHelper);

    // 6. Build Articulated Robotic Arm Model
    const armMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.8,
      roughness: 0.2
    });
    const jointMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x0284c7,
      emissiveIntensity: 0.2
    });
    const forearmMaterial = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      metalness: 0.7,
      roughness: 0.3
    });

    // Base Stand
    const baseGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.2, 32);
    const baseMesh = new THREE.Mesh(baseGeo, armMaterial);
    baseMesh.position.y = 0.1;
    baseMesh.castShadow = true;
    scene.add(baseMesh);

    // Joint 1: Base Yaw Rotation Group
    const joint1Group = new THREE.Group();
    joint1Group.position.set(0, 0.2, 0);
    scene.add(joint1Group);
    joint1Ref.current = joint1Group;

    const j1Sphere = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), jointMaterial);
    joint1Group.add(j1Sphere);

    // Upper Arm Link
    const upperArmGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.7, 16);
    const upperArmMesh = new THREE.Mesh(upperArmGeo, armMaterial);
    upperArmMesh.position.set(0, 0.35, 0);
    upperArmMesh.castShadow = true;
    joint1Group.add(upperArmMesh);

    // Joint 2: Shoulder Pitch Group
    const joint2Group = new THREE.Group();
    joint2Group.position.set(0, 0.7, 0);
    joint1Group.add(joint2Group);
    joint2Ref.current = joint2Group;

    const j2Sphere = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 24), jointMaterial);
    joint2Group.add(j2Sphere);

    // Forearm Link
    const forearmGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.6, 16);
    const forearmMesh = new THREE.Mesh(forearmGeo, forearmMaterial);
    forearmMesh.position.set(0, 0.3, 0);
    forearmMesh.castShadow = true;
    joint2Group.add(forearmMesh);

    // Joint 3: Elbow Pitch Group
    const joint3Group = new THREE.Group();
    joint3Group.position.set(0, 0.6, 0);
    joint2Group.add(joint3Group);
    joint3Ref.current = joint3Group;

    const j3Sphere = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 24), jointMaterial);
    joint3Group.add(j3Sphere);

    // Wrist Link
    const wristGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.3, 16);
    const wristMesh = new THREE.Mesh(wristGeo, armMaterial);
    wristMesh.position.set(0, 0.15, 0);
    joint3Group.add(wristMesh);

    // Joint 4: Wrist Roll Group
    const joint4Group = new THREE.Group();
    joint4Group.position.set(0, 0.3, 0);
    joint3Group.add(joint4Group);
    joint4Ref.current = joint4Group;

    // End-Effector Gripper Base
    const gripperBaseGeo = new THREE.BoxGeometry(0.16, 0.06, 0.1);
    const gripperBaseMesh = new THREE.Mesh(gripperBaseGeo, jointMaterial);
    joint4Group.add(gripperBaseMesh);

    // Gripper Finger Left & Right
    const fingerGeo = new THREE.BoxGeometry(0.03, 0.12, 0.03);
    const fingerMat = new THREE.MeshStandardMaterial({ color: 0x22d3ee, metalness: 0.9, roughness: 0.1 });

    const fingerLeft = new THREE.Mesh(fingerGeo, fingerMat);
    fingerLeft.position.set(-0.06, 0.08, 0);
    joint4Group.add(fingerLeft);
    gripperLeftRef.current = fingerLeft;

    const fingerRight = new THREE.Mesh(fingerGeo, fingerMat);
    fingerRight.position.set(0.06, 0.08, 0);
    joint4Group.add(fingerRight);
    gripperRightRef.current = fingerRight;

    // 7. Sensor Volumetric Vision Cone (RGB-D + LiDAR Beam)
    const coneGeo = new THREE.ConeGeometry(0.6, 1.2, 24, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.25,
      wireframe: false,
      side: THREE.DoubleSide
    });
    const sensorCone = new THREE.Mesh(coneGeo, coneMat);
    sensorCone.rotation.x = Math.PI;
    sensorCone.position.set(0, 0.6, 0);
    joint4Group.add(sensorCone);
    sensorConeRef.current = sensorCone;

    // 8. 3D Point Cloud Particles (Simulated 3D LiDAR Sensor Points)
    const pointCount = 180;
    const pointGeo = new THREE.BufferGeometry();
    const pointPositions = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount * 3; i += 3) {
      pointPositions[i] = (Math.random() - 0.5) * 0.8 + 1.2;
      pointPositions[i + 1] = Math.random() * 0.5 + 0.1;
      pointPositions[i + 2] = (Math.random() - 0.5) * 0.8;
    }
    pointGeo.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
    const pointMat = new THREE.PointsMaterial({
      color: 0x22d3ee,
      size: 0.035,
      transparent: true,
      opacity: 0.8
    });
    const pointCloud = new THREE.Points(pointGeo, pointMat);
    scene.add(pointCloud);
    pointCloudRef.current = pointCloud;

    // 9. World Model Ghost Robot (Translucent Emerald Future Rollout)
    const ghostMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.35,
      wireframe: true
    });

    const ghostJ1 = new THREE.Group();
    ghostJ1.position.set(0, 0.2, 0);
    scene.add(ghostJ1);
    ghostJoint1Ref.current = ghostJ1;

    const ghostArm1 = new THREE.Mesh(upperArmGeo, ghostMat);
    ghostArm1.position.set(0, 0.35, 0);
    ghostJ1.add(ghostArm1);

    const ghostJ2 = new THREE.Group();
    ghostJ2.position.set(0, 0.7, 0);
    ghostJ1.add(ghostJ2);
    ghostJoint2Ref.current = ghostJ2;

    const ghostArm2 = new THREE.Mesh(forearmGeo, ghostMat);
    ghostArm2.position.set(0, 0.3, 0);
    ghostJ2.add(ghostArm2);

    const ghostJ3 = new THREE.Group();
    ghostJ3.position.set(0, 0.6, 0);
    ghostJ2.add(ghostJ3);
    ghostJoint3Ref.current = ghostJ3;

    const ghostWrist = new THREE.Mesh(wristGeo, ghostMat);
    ghostWrist.position.set(0, 0.15, 0);
    ghostJ3.add(ghostWrist);

    // 10. Target Object Mesh
    const targetGeo = new THREE.DodecahedronGeometry(0.18, 1);
    const targetMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0xd97706,
      emissiveIntensity: 0.3
    });
    const targetMesh = new THREE.Mesh(targetGeo, targetMat);
    targetMesh.position.set(1.2, 0.18, 0);
    targetMesh.castShadow = true;
    scene.add(targetMesh);
    targetMeshRef.current = targetMesh;

    // Target Ground Halo
    const haloGeo = new THREE.RingGeometry(0.2, 0.25, 32);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = -Math.PI / 2;
    haloMesh.position.set(1.2, 0.01, 0);
    scene.add(haloMesh);

    // 11. Dynamic Obstacle Group (Injected Hazard Block)
    const obstacleGroup = new THREE.Group();
    obstacleGroup.position.set(0.6, 0.25, 0.3);

    const obsGeo = new THREE.BoxGeometry(0.35, 0.5, 0.35);
    const obsMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.4,
      metalness: 0.6,
      emissive: 0x991b1b,
      emissiveIntensity: 0.4
    });
    const obsMesh = new THREE.Mesh(obsGeo, obsMat);
    obsMesh.castShadow = true;
    obstacleGroup.add(obsMesh);

    const obsHaloGeo = new THREE.RingGeometry(0.35, 0.4, 32);
    const obsHaloMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const obsHalo = new THREE.Mesh(obsHaloGeo, obsHaloMat);
    obsHalo.rotation.x = -Math.PI / 2;
    obsHalo.position.y = -0.24;
    obstacleGroup.add(obsHalo);

    scene.add(obstacleGroup);
    obstacleRef.current = obstacleGroup;

    // 12. Spline Curve Trajectory Line for World Model
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.9, 0),
      new THREE.Vector3(0.5, 1.1, 0.1),
      new THREE.Vector3(1.0, 0.6, 0.0),
      new THREE.Vector3(1.2, 0.2, 0.0)
    ]);
    const points = curve.getPoints(50);
    const splineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const splineMat = new THREE.LineDashedMaterial({
      color: 0x10b981,
      dashSize: 0.08,
      gapSize: 0.04,
      scale: 1
    });
    const splineLine = new THREE.Line(splineGeo, splineMat);
    splineLine.computeLineDistances();
    scene.add(splineLine);
    trajectoryLineRef.current = splineLine;

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 800;
      const h = 380;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Update Camera Orbit Position based on angle state or camera view mode
  const updateCameraPosition = () => {
    const camera = cameraRef.current;
    if (!camera) return;

    if (cameraView === 'iso') {
      const { theta, phi, radius } = cameraAngleRef.current;
      camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
      camera.lookAt(0.4, 0.4, 0);
    } else if (cameraView === 'top') {
      camera.position.set(0.4, 4.5, 0.001);
      camera.lookAt(0.4, 0, 0);
    } else if (cameraView === 'wrist') {
      camera.position.set(0.1, 1.1, 0.2);
      camera.lookAt(1.2, 0.2, 0);
    } else if (cameraView === 'target') {
      camera.position.set(1.8, 0.8, 0.8);
      camera.lookAt(1.2, 0.2, 0);
    }
  };

  useEffect(() => {
    updateCameraPosition();
  }, [cameraView]);

  // Main Render Loop & Kinematic Animation
  useEffect(() => {
    const animate = () => {
      phaseRef.current += isPlaying ? 0.025 : 0.003;
      const phase = phaseRef.current;

      const stepProgress = (activeStepIndex + 1) / scenario.steps.length;

      // Kinematic angles calculation based on step and animation phase
      const j1Yaw = Math.sin(phase * 0.5) * 0.25 + (stepProgress * 0.3 - 0.15);
      const j2Pitch = -Math.PI / 4 + Math.sin(phase * 0.8) * 0.12 - (stepProgress * 0.35);
      const j3Elbow = Math.PI / 3 + Math.cos(phase * 0.9) * 0.15 + (stepProgress * 0.4);
      const j4Wrist = Math.sin(phase * 1.2) * 0.3;

      // Apply angles to primary robotic arm joints
      if (joint1Ref.current) joint1Ref.current.rotation.y = j1Yaw;
      if (joint2Ref.current) joint2Ref.current.rotation.z = j2Pitch;
      if (joint3Ref.current) joint3Ref.current.rotation.z = j3Elbow;
      if (joint4Ref.current) joint4Ref.current.rotation.x = j4Wrist;

      // Gripper Claw Action
      const clawPinch = Math.sin(phase * 2) * 0.02 + 0.04;
      if (gripperLeftRef.current) gripperLeftRef.current.position.x = -clawPinch;
      if (gripperRightRef.current) gripperRightRef.current.position.x = clawPinch;

      // Apply angles to World Model Ghost Arm (with +1.2s phase lead offset)
      if (ghostJoint1Ref.current) ghostJoint1Ref.current.rotation.y = j1Yaw + Math.sin(phase + 1.2) * 0.2;
      if (ghostJoint2Ref.current) ghostJoint2Ref.current.rotation.z = j2Pitch - 0.15;
      if (ghostJoint3Ref.current) ghostJoint3Ref.current.rotation.z = j3Elbow + 0.2;

      // Visibility Toggles
      if (ghostJoint1Ref.current) ghostJoint1Ref.current.visible = showWorldModelRollout;
      if (trajectoryLineRef.current) trajectoryLineRef.current.visible = showWorldModelRollout;
      if (sensorConeRef.current) sensorConeRef.current.visible = showSensors;
      if (pointCloudRef.current) pointCloudRef.current.visible = showSensors;
      if (obstacleRef.current) obstacleRef.current.visible = injectObstacle;

      // Rotate Target Object
      if (targetMeshRef.current) {
        targetMeshRef.current.rotation.y += 0.01;
      }

      // Animate LiDAR Point Cloud Particles
      if (pointCloudRef.current && showSensors) {
        const positions = pointCloudRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += Math.sin(phase + i) * 0.002;
        }
        pointCloudRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Calculate approximate End-Effector Position in 3D Space
      const eX = Number((0.8 + Math.sin(j1Yaw) * 0.4 + Math.cos(j2Pitch) * 0.3).toFixed(2));
      const eY = Number((0.4 + Math.sin(j3Elbow) * 0.3 + Math.cos(j2Pitch) * 0.2).toFixed(2));
      const eZ = Number((Math.sin(j4Wrist) * 0.2).toFixed(2));

      setEndEffectorPos({ x: eX, y: eY, z: eZ });
      setJointAnglesDeg([
        Math.round((j1Yaw * 180) / Math.PI),
        Math.round((j2Pitch * 180) / Math.PI),
        Math.round((j3Elbow * 180) / Math.PI),
        Math.round((j4Wrist * 180) / Math.PI),
        15,
        0
      ]);

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [scenario, activeStepIndex, isPlaying, injectObstacle, showWorldModelRollout, showSensors, cameraView]);

  // Orbit Mouse Drag Handler
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    cameraAngleRef.current.theta -= deltaX * 0.008;
    cameraAngleRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, cameraAngleRef.current.phi - deltaY * 0.008));

    if (cameraView === 'iso') {
      updateCameraPosition();
    }

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top 3D Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/90 border-b border-slate-800/80 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Move3D className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>3D WEBGL REAL-TIME PHYSICAL SIMULATOR</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            FREQ: <strong className="text-emerald-400">{scenario.defaultRobotics.controlFrequencyHz}Hz</strong>
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="sim3d-btn-play"
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play 3D Sim'}</span>
          </button>

          <button
            id="sim3d-btn-next"
            onClick={onNextStep}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs border border-slate-700 transition-all"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Next Step</span>
          </button>

          <button
            id="sim3d-btn-reset"
            onClick={onReset}
            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-md border border-slate-700 transition-all"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3D Viewport Canvas Container */}
      <div
        className="relative w-full bg-slate-950 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div ref={mountRef} className="w-full h-[380px] block" />

        {/* 3D Camera Preset Overlay Switcher */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800/90 backdrop-blur-md shadow-lg text-[11px] font-mono">
          <span className="text-slate-500 px-2 flex items-center gap-1">
            <Camera className="w-3 h-3 text-cyan-400" />
            <span>CAMERA:</span>
          </span>
          <button
            id="cam-iso"
            onClick={() => setCameraView('iso')}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              cameraView === 'iso' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold' : 'bg-slate-800/60 text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Perspective 3D
          </button>
          <button
            id="cam-top"
            onClick={() => setCameraView('top')}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              cameraView === 'top' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold' : 'bg-slate-800/60 text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Top Sensor
          </button>
          <button
            id="cam-wrist"
            onClick={() => setCameraView('wrist')}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              cameraView === 'wrist' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold' : 'bg-slate-800/60 text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Wrist Cam
          </button>
          <button
            id="cam-target"
            onClick={() => setCameraView('target')}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              cameraView === 'target' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold' : 'bg-slate-800/60 text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Target Focus
          </button>
        </div>

        {/* 3D Feature Toggles Overlay */}
        <div className="absolute bottom-3 right-3 flex flex-wrap items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-slate-800/90 backdrop-blur-md shadow-lg text-xs font-mono">
          <button
            id="toggle-world-model-3d"
            onClick={() => setShowWorldModelRollout(!showWorldModelRollout)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
              showWorldModelRollout
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
          >
            <Globe className="w-3 h-3 text-emerald-400" />
            <span>WM Rollout Ghost</span>
          </button>

          <button
            id="toggle-sensors-3d"
            onClick={() => setShowSensors(!showSensors)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
              showSensors
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
          >
            <Eye className="w-3 h-3 text-cyan-400" />
            <span>Sensors & LiDAR</span>
          </button>

          <button
            id="toggle-obstacle-3d"
            onClick={() => setInjectObstacle(!injectObstacle)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
              injectObstacle
                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span>{injectObstacle ? 'Remove Hazard' : 'Inject Hazard'}</span>
          </button>
        </div>

        {/* Drag Hint */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-slate-950/70 border border-slate-800/80 rounded-lg text-[10px] font-mono text-slate-400 pointer-events-none">
          💡 Drag mouse to orbit 3D camera
        </div>
      </div>

      {/* Spatial Telemetry & Joint Angles Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 p-3 bg-slate-950 border-t border-slate-800/80 text-xs font-mono">
        <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px]">END-EFFECTOR (X,Y,Z)</span>
          <span className="text-cyan-400 font-bold">
            [{endEffectorPos.x}, {endEffectorPos.y}, {endEffectorPos.z}] m
          </span>
        </div>

        <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px]">JOINT 1 (BASE YAW)</span>
          <span className="text-emerald-400 font-bold">{jointAnglesDeg[0]}°</span>
        </div>

        <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px]">JOINT 2 (SHOULDER)</span>
          <span className="text-emerald-400 font-bold">{jointAnglesDeg[1]}°</span>
        </div>

        <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px]">JOINT 3 (ELBOW)</span>
          <span className="text-emerald-400 font-bold">{jointAnglesDeg[2]}°</span>
        </div>

        <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px]">HAZARD PERIMETER</span>
          <span className={`font-bold ${injectObstacle ? 'text-red-400' : 'text-slate-300'}`}>
            {injectObstacle ? 'WARN: HAZARD IN PATH' : 'CLEAR'}
          </span>
        </div>

        <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px]">ACTUATOR COMPLIANCE</span>
          <span className="text-pink-400 font-bold">{scenario.defaultRobotics.gripForceN} N</span>
        </div>
      </div>
    </div>
  );
};
