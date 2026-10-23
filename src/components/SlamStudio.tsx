import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, Play, Pause, RotateCcw, Download, Copy, Check, 
  Layers, Cpu, Radio, Sparkles, AlertTriangle, Eye, Activity, 
  MapPin, Shield, Terminal, ArrowRight, Zap, Target, Gauge, Crosshair, Film,
  X, Volume2, VolumeX, ExternalLink
} from 'lucide-react';
import { PlanTier } from '../types';
import { useQuota } from '../hooks/useQuota';

interface SlamSimulatorProps {
  onOpenBarrier?: (barrier: {
    title: string;
    description: string;
    currentPlan: PlanTier;
    recommendedPlan: PlanTier;
    used?: number;
    limit?: number;
    featureName?: string;
  }) => void;
  onNavigateToPricing?: () => void;
  onOpenVideoStudio?: () => void;
}

interface RobotPose {
  x: number;
  y: number;
  theta: number; // in radians
}

interface LidarHit {
  x: number;
  y: number;
  distance: number;
  angle: number;
  isObstacle: boolean;
}

interface KeyframePoint {
  id: number;
  x: number;
  y: number;
  descriptor: string;
}

export const SlamStudio: React.FC<SlamSimulatorProps> = ({
  onOpenBarrier,
  onNavigateToPricing,
  onOpenVideoStudio
}) => {
  const { quota, limits } = useQuota();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [is3DVideoModalOpen, setIs3DVideoModalOpen] = useState<boolean>(false);

  // Mode Selection: 2D LiDAR Grid SLAM vs Visual SLAM (vSLAM)
  const [slamMode, setSlamMode] = useState<'lidar_2d' | 'visual_vslam'>('lidar_2d');
  const [slamAlgorithm, setSlamAlgorithm] = useState<'slam_toolbox' | 'cartographer' | 'orb_slam3'>('slam_toolbox');

  // Simulation Controls & Telemetry
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [autonomousExplore, setAutonomousExplore] = useState<boolean>(true);
  const [lidarBeams, setLidarBeams] = useState<number>(64);
  const [lidarMaxRange, setLidarMaxRange] = useState<number>(140);
  const [sensorNoise, setSensorNoise] = useState<number>(1.5); // px
  const [odometryDrift, setOdometryDrift] = useState<number>(2.0); // %
  const [activeTab, setActiveTab] = useState<'canvas' | 'code' | 'nav2_params'>('canvas');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Telemetry Metrics
  const [coveragePercent, setCoveragePercent] = useState<number>(18);
  const [poseErrorMm, setPoseErrorMm] = useState<number>(12.4);
  const [loopClosuresCount, setLoopClosuresCount] = useState<number>(0);
  const [detectedLandmarksCount, setDetectedLandmarksCount] = useState<number>(42);
  const [scanRateHz, setScanRateHz] = useState<number>(20);

  // Robot State & Odometry
  const robotPoseRef = useRef<RobotPose>({ x: 120, y: 120, theta: 0 });
  const noisyOdomPoseRef = useRef<RobotPose>({ x: 120, y: 120, theta: 0 });
  const correctedSlamPoseRef = useRef<RobotPose>({ x: 120, y: 120, theta: 0 });
  const groundTruthPathRef = useRef<{ x: number; y: number }[]>([]);
  const estimatedSlamPathRef = useRef<{ x: number; y: number }[]>([]);
  const noisyOdomPathRef = useRef<{ x: number; y: number }[]>([]);

  // Environment Map (0 = Unknown, 1 = Free, 2 = Occupied)
  // Grid dimension: 40x30 cells (each 10x10 px on 400x300 canvas, scaled to 600x400)
  const GRID_COLS = 60;
  const GRID_ROWS = 40;
  const CELL_SIZE = 10;
  const occupancyGridRef = useRef<number[]>(new Array(GRID_COLS * GRID_ROWS).fill(0));

  // Static Obstacles defined in arena
  const obstacles = useRef<Array<{ x: number; y: number; w: number; h: number }>>([
    // Outer boundaries are implicitly checked
    { x: 160, y: 60, w: 20, h: 120 },   // Central vertical wall
    { x: 160, y: 180, w: 100, h: 20 },  // Horizontal partition
    { x: 340, y: 80, w: 80, h: 80 },    // Pillar / Machine Block
    { x: 420, y: 220, w: 25, h: 100 },  // Lower divider
    { x: 80, y: 260, w: 140, h: 25 },   // Left lower wall
    { x: 480, y: 60, w: 60, h: 60 },    // Top right crate
    { x: 260, y: 280, w: 50, h: 50 },   // Center bottom obstacle
  ]);

  // Visual SLAM Keyframes & Feature Points
  const keyframeLandmarks = useRef<KeyframePoint[]>([]);

  // Initialize landmarks once
  useEffect(() => {
    const landmarks: KeyframePoint[] = [];
    for (let i = 0; i < 60; i++) {
      landmarks.push({
        id: i,
        x: 40 + Math.random() * 520,
        y: 40 + Math.random() * 320,
        descriptor: `ORB_DESC_${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      });
    }
    keyframeLandmarks.current = landmarks;
  }, []);

  // Check collision with defined obstacles
  const checkCollision = (x: number, y: number, radius = 12) => {
    if (x - radius <= 10 || x + radius >= 590 || y - radius <= 10 || y + radius >= 390) {
      return true;
    }
    for (const obs of obstacles.current) {
      if (
        x + radius >= obs.x &&
        x - radius <= obs.x + obs.w &&
        y + radius >= obs.y &&
        y - radius <= obs.y + obs.h
      ) {
        return true;
      }
    }
    return false;
  };

  // Cast a single LiDAR ray
  const castRay = (
    startX: number, 
    startY: number, 
    angle: number, 
    maxRange: number
  ): LidarHit => {
    const stepSize = 3;
    let currDist = 0;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    while (currDist < maxRange) {
      currDist += stepSize;
      const testX = startX + cosA * currDist;
      const testY = startY + sinA * currDist;

      // Check arena boundaries
      if (testX <= 10 || testX >= 590 || testY <= 10 || testY >= 390) {
        const noise = (Math.random() - 0.5) * sensorNoise;
        return {
          x: testX,
          y: testY,
          distance: currDist + noise,
          angle,
          isObstacle: true
        };
      }

      // Check obstacles
      for (const obs of obstacles.current) {
        if (
          testX >= obs.x &&
          testX <= obs.x + obs.w &&
          testY >= obs.y &&
          testY <= obs.y + obs.h
        ) {
          const noise = (Math.random() - 0.5) * sensorNoise;
          return {
            x: testX,
            y: testY,
            distance: currDist + noise,
            angle,
            isObstacle: true
          };
        }
      }
    }

    return {
      x: startX + cosA * maxRange,
      y: startY + sinA * maxRange,
      distance: maxRange,
      angle,
      isObstacle: false
    };
  };

  // Update Occupancy Grid via Bresenham Raytracing
  const updateOccupancyGrid = (hits: LidarHit[], origin: RobotPose) => {
    const grid = occupancyGridRef.current;
    let mappedCount = 0;

    hits.forEach((hit) => {
      const steps = Math.floor(hit.distance / CELL_SIZE);
      const cosA = Math.cos(hit.angle);
      const sinA = Math.sin(hit.angle);

      // Ray trace free space
      for (let s = 1; s < steps; s++) {
        const px = origin.x + cosA * s * CELL_SIZE;
        const py = origin.y + sinA * s * CELL_SIZE;
        const col = Math.floor(px / CELL_SIZE);
        const row = Math.floor(py / CELL_SIZE);

        if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
          const idx = row * GRID_COLS + col;
          if (grid[idx] !== 2) {
            grid[idx] = 1; // Mark Free
          }
        }
      }

      // Mark Obstacle Cell
      if (hit.isObstacle) {
        const col = Math.floor(hit.x / CELL_SIZE);
        const row = Math.floor(hit.y / CELL_SIZE);
        if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
          grid[row * GRID_COLS + col] = 2; // Mark Occupied
        }
      }
    });

    // Calculate exploration coverage
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] > 0) mappedCount++;
    }
    const coverage = Math.min(100, Math.round((mappedCount / (GRID_COLS * GRID_ROWS)) * 100));
    setCoveragePercent(coverage);
  };

  // Main SLAM Simulation Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let navTargetAngle = 0;

    const renderLoop = (time: number) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      if (isRunning) {
        const pose = robotPoseRef.current;

        // Autonomous Exploration Movement Logic
        if (autonomousExplore) {
          // Cast forward rays to look for obstacles
          const frontHit = castRay(pose.x, pose.y, pose.theta, 55);
          const leftHit = castRay(pose.x, pose.y, pose.theta - 0.7, 45);
          const rightHit = castRay(pose.x, pose.y, pose.theta + 0.7, 45);

          if (frontHit.isObstacle || leftHit.isObstacle || rightHit.isObstacle) {
            // Turn away from obstacles
            const turnDir = leftHit.distance > rightHit.distance ? -1 : 1;
            pose.theta += turnDir * 2.5 * dt;
          } else {
            // Move forward with gentle wandering
            pose.theta += (Math.sin(time / 800) * 0.4) * dt;
            const speed = 45; // px/sec
            const nextX = pose.x + Math.cos(pose.theta) * speed * dt;
            const nextY = pose.y + Math.sin(pose.theta) * speed * dt;

            if (!checkCollision(nextX, nextY)) {
              pose.x = nextX;
              pose.y = nextY;
            } else {
              pose.theta += Math.PI * 0.6;
            }
          }
        }

        // Simulate noisy raw odometry (wheel slip & drift)
        const noisyOdom = noisyOdomPoseRef.current;
        const driftFactor = 1 + (odometryDrift / 100) * 0.3;
        noisyOdom.theta = pose.theta + (Math.sin(time / 2000) * 0.15 * (odometryDrift / 2));
        noisyOdom.x += Math.cos(noisyOdom.theta) * 45 * dt * driftFactor;
        noisyOdom.y += Math.sin(noisyOdom.theta) * 45 * dt * driftFactor;

        // SLAM Graph / Particle Filter Pose Correction
        // (Calculates loop closure and realigns estimated pose toward ground truth)
        const slamPose = correctedSlamPoseRef.current;
        const correctionRate = 0.92;
        slamPose.x = slamPose.x * (1 - correctionRate * dt) + pose.x * (correctionRate * dt);
        slamPose.y = slamPose.y * (1 - correctionRate * dt) + pose.y * (correctionRate * dt);
        slamPose.theta = pose.theta;

        // Calculate dynamic error in mm (simulated scale: 1px = 20mm)
        const errPx = Math.sqrt(Math.pow(slamPose.x - pose.x, 2) + Math.pow(slamPose.y - pose.y, 2));
        setPoseErrorMm(parseFloat((errPx * 18.5 + 4.2).toFixed(1)));

        // Record Trajectory Paths
        if (groundTruthPathRef.current.length === 0 || 
            Math.hypot(groundTruthPathRef.current[groundTruthPathRef.current.length - 1].x - pose.x, 
                       groundTruthPathRef.current[groundTruthPathRef.current.length - 1].y - pose.y) > 6) {
          groundTruthPathRef.current.push({ x: pose.x, y: pose.y });
          estimatedSlamPathRef.current.push({ x: slamPose.x, y: slamPose.y });
          noisyOdomPathRef.current.push({ x: noisyOdom.x, y: noisyOdom.y });

          // Keep path arrays manageable
          if (groundTruthPathRef.current.length > 250) {
            groundTruthPathRef.current.shift();
            estimatedSlamPathRef.current.shift();
            noisyOdomPathRef.current.shift();
          }

          // Trigger simulated Loop Closures when revisiting regions
          if (groundTruthPathRef.current.length > 80 && Math.random() < 0.04) {
            setLoopClosuresCount(prev => prev + 1);
          }
        }

        // Raycast LiDAR scan
        const hits: LidarHit[] = [];
        const angleStep = (Math.PI * 2) / lidarBeams;
        for (let i = 0; i < lidarBeams; i++) {
          const angle = pose.theta + i * angleStep;
          hits.push(castRay(pose.x, pose.y, angle, lidarMaxRange));
        }

        // Update occupancy grid
        updateOccupancyGrid(hits, pose);
      }

      // Draw Canvas
      drawCanvas();

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning, autonomousExplore, lidarBeams, lidarMaxRange, sensorNoise, odometryDrift, slamMode]);

  // Canvas Rendering Routine
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Clear background
    ctx.fillStyle = '#020617'; // slate-950
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Occupancy Grid (SLAM Map)
    const grid = occupancyGridRef.current;
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const val = grid[r * GRID_COLS + c];
        const x = c * CELL_SIZE;
        const y = r * CELL_SIZE;

        if (val === 1) {
          // Free space
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'; // Slate-900
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        } else if (val === 2) {
          // Occupied obstacle
          ctx.fillStyle = 'rgba(6, 182, 212, 0.45)'; // Cyan occupied cell
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
          ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
        } else {
          // Unknown space: subtle grid dots
          if (c % 3 === 0 && r % 3 === 0) {
            ctx.fillStyle = 'rgba(51, 65, 85, 0.3)';
            ctx.fillRect(x + 4, y + 4, 1.5, 1.5);
          }
        }
      }
    }

    // 3. Draw Actual Physical Obstacles (Ground Truth)
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.strokeStyle = '#334155'; // slate-700
    ctx.lineWidth = 1.5;
    for (const obs of obstacles.current) {
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);

      // Warning hazard stripes on obstacles
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.fillRect(obs.x + 2, obs.y + 2, obs.w - 4, obs.h - 4);
      ctx.fillStyle = '#1e293b';
    }

    // Arena Outer Boundary
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    const robot = robotPoseRef.current;

    // 4. Draw LiDAR Scan Rays & Hit Points (if in LiDAR mode)
    if (slamMode === 'lidar_2d') {
      const angleStep = (Math.PI * 2) / lidarBeams;
      for (let i = 0; i < lidarBeams; i++) {
        const angle = robot.theta + i * angleStep;
        const hit = castRay(robot.x, robot.y, angle, lidarMaxRange);

        // Scan ray line
        ctx.strokeStyle = hit.isObstacle ? 'rgba(34, 211, 238, 0.22)' : 'rgba(56, 189, 248, 0.07)';
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(robot.x, robot.y);
        ctx.lineTo(hit.x, hit.y);
        ctx.stroke();

        // Hit point
        if (hit.isObstacle) {
          ctx.fillStyle = '#22d3ee'; // Bright cyan
          ctx.beginPath();
          ctx.arc(hit.x, hit.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 5. Draw Visual SLAM Feature Landmarks (if in vSLAM mode)
    if (slamMode === 'visual_vslam') {
      for (const lm of keyframeLandmarks.current) {
        const dist = Math.hypot(lm.x - robot.x, lm.y - robot.y);
        const inFrustum = dist < lidarMaxRange && Math.abs(Math.atan2(lm.y - robot.y, lm.x - robot.x) - robot.theta) < 1.0;

        ctx.fillStyle = inFrustum ? '#10b981' : 'rgba(100, 116, 139, 0.3)';
        ctx.beginPath();
        ctx.arc(lm.x, lm.y, inFrustum ? 3 : 1.5, 0, Math.PI * 2);
        ctx.fill();

        if (inFrustum) {
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
          ctx.beginPath();
          ctx.moveTo(robot.x, robot.y);
          ctx.lineTo(lm.x, lm.y);
          ctx.stroke();
        }
      }
    }

    // 6. Draw Trajectory Paths (Ground Truth vs. Corrected SLAM vs. Drifted Odometry)
    // Noisy raw Odometry path (Red dotted)
    if (noisyOdomPathRef.current.length > 1) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(noisyOdomPathRef.current[0].x, noisyOdomPathRef.current[0].y);
      for (let i = 1; i < noisyOdomPathRef.current.length; i++) {
        ctx.lineTo(noisyOdomPathRef.current[i].x, noisyOdomPathRef.current[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Estimated SLAM Graph Path (Cyan solid)
    if (estimatedSlamPathRef.current.length > 1) {
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(estimatedSlamPathRef.current[0].x, estimatedSlamPathRef.current[0].y);
      for (let i = 1; i < estimatedSlamPathRef.current.length; i++) {
        ctx.lineTo(estimatedSlamPathRef.current[i].x, estimatedSlamPathRef.current[i].y);
      }
      ctx.stroke();
    }

    // 7. Draw Robot Body & Heading Indicator
    // Sensor range outer ring
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(robot.x, robot.y, lidarMaxRange, 0, Math.PI * 2);
    ctx.stroke();

    // Robot base footprint
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(robot.x, robot.y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Robot Heading Vector Arrow
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(robot.x, robot.y);
    const tipX = robot.x + Math.cos(robot.theta) * 18;
    const tipY = robot.y + Math.sin(robot.theta) * 18;
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    // Center point
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(robot.x, robot.y, 3, 0, Math.PI * 2);
    ctx.fill();
  };

  // Reset Map and Telemetry
  const handleReset = () => {
    occupancyGridRef.current = new Array(GRID_COLS * GRID_ROWS).fill(0);
    robotPoseRef.current = { x: 120, y: 120, theta: 0 };
    noisyOdomPoseRef.current = { x: 120, y: 120, theta: 0 };
    correctedSlamPoseRef.current = { x: 120, y: 120, theta: 0 };
    groundTruthPathRef.current = [];
    estimatedSlamPathRef.current = [];
    noisyOdomPathRef.current = [];
    setCoveragePercent(0);
    setLoopClosuresCount(0);
  };

  // Handle Manual Click-to-Drive
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const targetX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const targetY = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (!checkCollision(targetX, targetY)) {
      const robot = robotPoseRef.current;
      robot.theta = Math.atan2(targetY - robot.y, targetX - robot.x);
      robot.x = targetX;
      robot.y = targetY;
    }
  };

  // Code snippets for ROS 2 and SLAM Toolbox
  const ros2SlamToolboxConfig = `# =========================================================
# AIGENESIS.TECH // slam_toolbox_params.yaml
# Production Configuration for ROS 2 Humble & Nav2 Stack
# =========================================================

slam_toolbox:
  ros__parameters:
    # Solver & Graph Optimization Parameters
    solver_plugin: solver_plugins::CeresSolver
    ceres_linear_solver: SPARSE_NORMAL_CHOLESKY
    ceres_preconditioner: SCHUR_JACOBI
    ceres_trust_strategy: LEVENBERG_MARQUARDT
    ceres_dogleg_type: TRADITIONAL_DOGLEG
    ceres_loss_function: HuberLoss

    # Matcher & Scan Processing
    odom_frame: odom
    map_frame: map
    base_frame: base_footprint
    scan_topic: /scan
    mode: mapping # Options: mapping, localization, lifespan

    # Resolution & Spatial Grid Settings
    resolution: 0.05 # 5cm per grid cell
    max_laser_range: ${lidarMaxRange / 20.0} # Meters
    minimum_time_interval: 0.05
    transform_timeout: 0.2
    tf_buffer_duration: 30.0
    stack_size_to_use: 40000000

    # Scan Matcher Constraints
    distance_variance_penalty: 0.5
    angle_variance_penalty: 1.0
    fine_search_angle_offset: 0.00349 # 0.2 degrees
    coarse_search_angle_offset: 0.349
    coarse_angle_resolution: 0.0349
    minimum_distance_penalty: 0.5
    use_response_expansion: true

    # Loop Closure Parameters
    do_loop_closing: true
    loop_search_maximum_distance: 5.0 # meters
    loop_match_minimum_chain_size: 10
    loop_match_maximum_variance_coarse: 3.0
    loop_match_minimum_response_coarse: 0.35
    loop_match_minimum_response_fine: 0.45
`;

  const nav2BringupLaunchPy = `#!/usr/bin/env python3
# =========================================================
# AIGENESIS.TECH // nav2_bringup_slam.launch.py
# Automated ROS 2 Humble Bringup with Nav2 & SLAM Toolbox
# =========================================================

import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

def generate_launch_description():
    use_sim_time = LaunchConfiguration('use_sim_time', default='true')
    params_file = LaunchConfiguration('params_file', default='slam_toolbox_params.yaml')

    # 1. SLAM Toolbox Asynchronous Node
    slam_toolbox_node = Node(
        package='slam_toolbox',
        executable='async_slam_toolbox_node',
        name='slam_toolbox',
        output='screen',
        parameters=[params_file, {'use_sim_time': use_sim_time}]
    )

    # 2. Robot State Publisher & Kinematic TF
    robot_state_publisher = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        name='robot_state_publisher',
        output='screen',
        parameters=[{'use_sim_time': use_sim_time}]
    )

    # 3. Costmap 2D Node for Obstacle Inflation
    local_costmap_node = Node(
        package='nav2_costmap_2d',
        executable='nav2_costmap_2d',
        name='local_costmap',
        parameters=[params_file]
    )

    return LaunchDescription([
        DeclareLaunchArgument('use_sim_time', default_value='true', description='Use simulation/Gazebo clock'),
        slam_toolbox_node,
        robot_state_publisher,
        local_costmap_node
    ])
`;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownload = (filename: string, text: string) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-8 py-2">
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>State Estimation & Spatial Perception Layer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight flex items-center gap-3">
            SLAM & Occupancy Grid Studio
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-normal">
              ROS 2 Humble / Nav2
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Real-time Simultaneous Localization and Mapping engine. Simulate 360° LiDAR raycasting, Bresenham occupancy grid mapping, graph loop closure optimization, and export production Nav2 configurations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIs3DVideoModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 via-indigo-600 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-slate-950 font-mono font-extrabold rounded-xl text-xs shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] cursor-pointer"
            title="Watch Real-Time 3D Video of SLAM Studio in Progress"
          >
            <Film className="w-4 h-4 fill-slate-950" />
            <span>Watch 3D Video in Progress</span>
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              isRunning 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Pause Engine' : 'Resume SLAM'}</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono border border-slate-700 transition-all"
            title="Reset Map & Pose"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Map</span>
          </button>
        </div>
      </div>

      {/* 3D Video Studio In-Progress Callout Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-cyan-950/40 border border-purple-500/30 text-xs font-mono shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0">
            <Film className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <span className="text-white font-bold block">
              3D Video of SLAM Studio in Progress Available
            </span>
            <span className="text-slate-400 text-[11px] font-sans">
              Watch animated 3D LiDAR point clouds, wheel slip drift vs. Ceres loop closures, and download full 60 FPS WebM video demo.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIs3DVideoModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-mono font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>Play 3D Video Now</span>
            <Play className="w-3 h-3 fill-white" />
          </button>
          {onOpenVideoStudio && (
            <button
              onClick={onOpenVideoStudio}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Open Full Video Generator with Outreach Emails"
            >
              <span>Full Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Live Telemetry KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Map Coverage</span>
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-cyan-400">{coveragePercent}%</div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-cyan-400 h-full rounded-full transition-all duration-300" style={{ width: `${coveragePercent}%` }} />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Estimated Pose Drift</span>
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400">{poseErrorMm} mm</div>
          <span className="text-[10px] text-slate-500">Graph SLAM Corrected</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Loop Closures</span>
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-indigo-400">{loopClosuresCount} detected</div>
          <span className="text-[10px] text-slate-500">Ceres Graph Residuals</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Scan Frequency</span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400">{scanRateHz} Hz</div>
          <span className="text-[10px] text-slate-500">{lidarBeams} beams/rev</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active Algorithm</span>
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-base font-bold text-purple-300 truncate">
            {slamAlgorithm === 'slam_toolbox' ? 'SLAM Toolbox' : slamAlgorithm === 'cartographer' ? 'Google Cartographer' : 'ORB-SLAM3 vSLAM'}
          </div>
          <span className="text-[10px] text-slate-500">ROS 2 Humble Node</span>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas on Left, Controls & Exporter on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Canvas & Mode Switcher (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl">
            
            {/* Canvas Header & Mode Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-white uppercase">
                  Live Spatial SLAM Sandbox
                </span>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => { setSlamMode('lidar_2d'); setSlamAlgorithm('slam_toolbox'); }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    slamMode === 'lidar_2d'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  2D LiDAR Grid
                </button>

                <button
                  onClick={() => { setSlamMode('visual_vslam'); setSlamAlgorithm('orb_slam3'); }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    slamMode === 'visual_vslam'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Visual SLAM (Keyframes)
                </button>
              </div>
            </div>

            {/* Interactive HTML5 Canvas */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner flex justify-center">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                onClick={handleCanvasClick}
                className="w-full max-w-full aspect-[3/2] cursor-crosshair block"
              />

              {/* In-Canvas Overlays */}
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-2 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Click arena to manually dispatch robot waypoint</span>
              </div>

              <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 space-y-0.5 pointer-events-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-0.5 bg-cyan-400 inline-block" />
                  <span className="text-cyan-300">Corrected SLAM Path</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-0.5 bg-red-400 inline-block border-b border-dashed" />
                  <span className="text-red-300">Raw Drifted Odometry</span>
                </div>
              </div>
            </div>

            {/* Navigation Assist Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-mono">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autonomousExplore}
                  onChange={(e) => setAutonomousExplore(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 bg-slate-950 w-4 h-4 cursor-pointer"
                />
                <span>Autonomous Frontier Exploration (Obstacle Avoidance)</span>
              </label>

              <div className="text-slate-400 text-[11px]">
                Arena Scale: <span className="text-cyan-300 font-bold">12m x 8m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Sensor Parameters & Code Exporter (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SLAM Sensor & Noise Tuning Parameters */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase">Sensor & Filter Parameters</h3>
              </div>
              <span className="text-[10px] text-slate-500">Live Calibration</span>
            </div>

            {/* Parameter Sliders */}
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>LiDAR Beams (Ray Resolution):</span>
                  <span className="text-cyan-400 font-bold">{lidarBeams} Rays</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="128"
                  step="16"
                  value={lidarBeams}
                  onChange={(e) => setLidarBeams(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>LiDAR Max Detection Range:</span>
                  <span className="text-cyan-400 font-bold">{(lidarMaxRange / 20).toFixed(1)} meters</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="240"
                  step="10"
                  value={lidarMaxRange}
                  onChange={(e) => setLidarMaxRange(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>LiDAR Gaussian Range Noise:</span>
                  <span className="text-amber-400 font-bold">±{sensorNoise.toFixed(1)} px</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="5.0"
                  step="0.5"
                  value={sensorNoise}
                  onChange={(e) => setSensorNoise(Number(e.target.value))}
                  className="w-full accent-amber-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Wheel Slip & Odometry Drift:</span>
                  <span className="text-red-400 font-bold">{odometryDrift.toFixed(1)}% / meter</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="8.0"
                  step="0.5"
                  value={odometryDrift}
                  onChange={(e) => setOdometryDrift(Number(e.target.value))}
                  className="w-full accent-red-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* ROS 2 Code & Configuration Exporter Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  ROS 2 Package Exporter
                </h3>
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
                <button
                  onClick={() => setActiveTab('canvas')}
                  className={`px-2 py-0.5 rounded ${activeTab === 'canvas' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'}`}
                >
                  Params YAML
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-2 py-0.5 rounded ${activeTab === 'code' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'}`}
                >
                  Launch Script
                </button>
              </div>
            </div>

            {/* Code Block Container */}
            <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800 font-mono text-xs text-slate-300 max-h-64 overflow-y-auto">
              <pre className="text-[11px] leading-relaxed">
                {activeTab === 'canvas' ? ros2SlamToolboxConfig : nav2BringupLaunchPy}
              </pre>
            </div>

            {/* Exporter Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleCopy(activeTab === 'canvas' ? ros2SlamToolboxConfig : nav2BringupLaunchPy)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold text-xs rounded-xl border border-slate-700 transition-all"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied to Clipboard' : 'Copy Config'}</span>
              </button>

              <button
                onClick={() => {
                  const filename = activeTab === 'canvas' ? 'slam_toolbox_params.yaml' : 'nav2_bringup_slam.launch.py';
                  const content = activeTab === 'canvas' ? ros2SlamToolboxConfig : nav2BringupLaunchPy;
                  handleDownload(filename, content);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>

        </div>
      </div>
      {/* In-Place 3D Video Modal of SLAM Studio in Progress */}
      {is3DVideoModalOpen && (
        <Slam3DVideoModal
          isOpen={is3DVideoModalOpen}
          onClose={() => setIs3DVideoModalOpen(false)}
          onOpenFullProducer={onOpenVideoStudio}
        />
      )}
    </div>
  );
};

interface Slam3DVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullProducer?: () => void;
}

const Slam3DVideoModal: React.FC<Slam3DVideoModalProps> = ({
  isOpen,
  onClose,
  onOpenFullProducer
}) => {
  const modalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [isVoiceoverEnabled, setIsVoiceoverEnabled] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordProgress, setRecordProgress] = useState<number>(0);
  const lastSpokenIndex = useRef<number>(-1);

  const durationSec = 12;

  const STEPS = [
    {
      startSec: 0,
      endSec: 3,
      phaseLabel: '01. DRIFT ACCUMULATION',
      badgeColor: '#f43f5e',
      title: 'Dead-Reckoning Wheel Odometry Divergence (>180mm)',
      subtitle: '🚨 Raw wheel slip odometry accumulates dead-reckoning drift (>180mm error), distorting spatial grid...',
      metricLabel: 'Odometry Drift Error',
      metricValue: '184.2 mm (DIVERGENT)',
      voiceover: 'Wheel odometry dead-reckoning accumulates wheel slip and terrain errors, causing over 180 millimeters of trajectory divergence.'
    },
    {
      startSec: 3,
      endSec: 6,
      phaseLabel: '02. 3D PERCEPTION IN PROGRESS',
      badgeColor: '#fbbf24',
      title: '64-Beam 3D LiDAR Raycasting & Point Cloud Voxels',
      subtitle: '🔍 64-beam LiDAR sweeps 360° arena, raycasting 1,240 points/sec and voxelizing obstacles...',
      metricLabel: 'Point Cloud Scan Rate',
      metricValue: '1,240 pts/sec (20 Hz)',
      voiceover: 'AIGENESIS activates 64-beam 360-degree LiDAR raycasting and ORB-SLAM3 visual features, extracting 1,200 surface points per second.'
    },
    {
      startSec: 6,
      endSec: 9,
      phaseLabel: '03. CERES GRAPH OPTIMIZATION',
      badgeColor: '#06b6d4',
      title: 'Loop Closure & Ceres Non-Linear Graph Solver',
      subtitle: '⚡ Loop closure detected! Ceres sparse normal Cholesky solver eliminates accumulated drift in 4.8ms.',
      metricLabel: 'Ceres Residual χ²',
      metricValue: '0.0042 (CONVERGED)',
      voiceover: 'Loop closure candidate recognized! Ceres Levenberg-Marquardt solver optimizes the Mahalanobis pose graph constraints.'
    },
    {
      startSec: 9,
      endSec: 12,
      phaseLabel: '04. VERIFIED 3D MAP RECONSTRUCTION',
      badgeColor: '#10b981',
      title: 'Unified 3D Occupancy Grid & Sub-Centimeter Accuracy',
      subtitle: '✅ 98.6% arena mapped with sub-centimeter (4.2mm) precision. Ready for Nav2 autonomous navigation.',
      metricLabel: 'Final Pose Accuracy',
      metricValue: '4.2 mm (SUB-CM LOCKED)',
      voiceover: 'Loop closed successfully. The 3D occupancy grid is fully unified with 4.2 millimeter precision, export-ready for Nav2 costmaps.'
    }
  ];

  const currentStepIndex = Math.min(
    Math.floor((currentTimeSec / durationSec) * STEPS.length),
    STEPS.length - 1
  );
  const activeStep = STEPS[currentStepIndex];

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Voiceover narration
  useEffect(() => {
    if (!isVoiceoverEnabled || !isPlaying || !isOpen) return;
    if (currentStepIndex !== lastSpokenIndex.current) {
      lastSpokenIndex.current = currentStepIndex;
      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(activeStep.voiceover);
          utterance.rate = 1.05;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        console.warn('Speech synthesis unavailable in iframe:', err);
      }
    }
  }, [currentStepIndex, isVoiceoverEnabled, isPlaying, isOpen, activeStep]);

  // Main 3D Canvas Rendering Loop
  useEffect(() => {
    if (!isOpen) return;
    const canvas = modalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now() - (currentTimeSec || 0) * 1000;
    let lastTimeUpdate = 0;

    const render = (now: number) => {
      try {
        let elapsed = (now - startTime) / 1000;
        if (elapsed >= durationSec) {
          elapsed = 0;
          startTime = now;
          lastSpokenIndex.current = -1;
        }

        if (isPlaying && (now - lastTimeUpdate > 120)) {
          lastTimeUpdate = now;
          setCurrentTimeSec(elapsed);
        }

        const w = canvas.width;
        const h = canvas.height;
        const progress = Math.min(Math.max(elapsed / durationSec, 0), 1);
        const curStep = STEPS.find(s => elapsed >= s.startSec && elapsed < s.endSec) || STEPS[0];
        const isProblemPhase = curStep.startSec < 6;

        // 1. Background
        const bgGrad = ctx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, '#090d16');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // 2. High-Tech Grid
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 40) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y < h; y += 40) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        // 3. Header bar inside frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, 56);
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 15px monospace';
        ctx.fillText('AIGENESIS.TECH // 3D SLAM STUDIO IN PROGRESS', 24, 34);

        ctx.fillStyle = curStep.badgeColor;
        ctx.fillRect(w - 230, 16, 206, 26);
        ctx.fillStyle = '#090d16';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(curStep.phaseLabel, w - 216, 33);

        // 4. 3D Isometric Viewport
        const originX = 265;
        const originY = 275;
        const iso = (x: number, y: number, z: number) => ({
          sx: originX + (x - y) * 0.866 * 0.70,
          sy: originY + (x + y) * 0.5 * 0.70 * 0.62 - z * 0.70
        });

        // 3D Ground Plane Grid
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let gx = -130; gx <= 170; gx += 30) {
          const p1 = iso(gx, -130, 0);
          const p2 = iso(gx, 170, 0);
          ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.stroke();
        }
        for (let gy = -130; gy <= 170; gy += 30) {
          const p1 = iso(-130, gy, 0);
          const p2 = iso(170, gy, 0);
          ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.stroke();
        }

        // 3D Obstacle Drawer
        const drawBox3D = (bx: number, by: number, bw: number, bh: number, bz: number, fillTop: string, fillSide: string) => {
          const b0 = iso(bx, by, 0);
          const b1 = iso(bx + bw, by, 0);
          const b2 = iso(bx + bw, by + bh, 0);
          const t0 = iso(bx, by, bz);
          const t1 = iso(bx + bw, by, bz);
          const t2 = iso(bx + bw, by + bh, bz);
          const t3 = iso(bx, by + bh, bz);

          // Left/front
          ctx.fillStyle = fillSide;
          ctx.beginPath();
          ctx.moveTo(b0.sx, b0.sy); ctx.lineTo(b1.sx, b1.sy); ctx.lineTo(t1.sx, t1.sy); ctx.lineTo(t0.sx, t0.sy);
          ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#334155'; ctx.stroke();

          // Right
          ctx.beginPath();
          ctx.moveTo(b1.sx, b1.sy); ctx.lineTo(b2.sx, b2.sy); ctx.lineTo(t2.sx, t2.sy); ctx.lineTo(t1.sx, t1.sy);
          ctx.closePath(); ctx.fill(); ctx.stroke();

          // Top
          ctx.fillStyle = fillTop;
          ctx.beginPath();
          ctx.moveTo(t0.sx, t0.sy); ctx.lineTo(t1.sx, t1.sy); ctx.lineTo(t2.sx, t2.sy); ctx.lineTo(t3.sx, t3.sy);
          ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5; ctx.stroke();
        };

        // Obstacles
        drawBox3D(10, 10, 55, 55, 65, '#1e293b', '#0f172a');
        drawBox3D(-85, 40, 20, 80, 50, '#1e293b', '#0f172a');
        drawBox3D(75, -80, 55, 40, 42, '#1e293b', '#0f172a');

        // Mobile Robot trajectory
        const loopRate = 0.95;
        const robotAngle = elapsed * loopRate;
        const radiusX = 115;
        const radiusY = 95;
        const rx = 10 + Math.cos(robotAngle) * radiusX;
        const ry = 10 + Math.sin(robotAngle) * radiusY;

        // Ground-Truth SLAM Ribbon in 3D
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.2) {
          const pt = iso(10 + Math.cos(a) * radiusX, 10 + Math.sin(a) * radiusY, 0);
          if (a === 0) ctx.moveTo(pt.sx, pt.sy);
          else ctx.lineTo(pt.sx, pt.sy);
        }
        ctx.closePath();
        ctx.stroke();

        // Loop closure state
        const hasLoopClosed = elapsed >= 6.0;
        let odomX = rx;
        let odomY = ry;

        if (!hasLoopClosed) {
          const driftMag = Math.min((elapsed / 6.0) * 45, 45);
          odomX = rx + Math.cos(robotAngle - 0.7) * driftMag;
          odomY = ry + Math.sin(robotAngle - 0.7) * driftMag;

          // Red dashed noisy drift path
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          const rPt = iso(rx, ry, 0);
          const oPt = iso(odomX, odomY, 0);
          ctx.moveTo(rPt.sx, rPt.sy); ctx.lineTo(oPt.sx, oPt.sy); ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
          ctx.beginPath(); ctx.arc(oPt.sx, oPt.sy, 8, 0, Math.PI * 2); ctx.fill();
        } else {
          // Loop Closure Ceres link
          const loopKeyframe = iso(10 + radiusX, 10, 0);
          const currPt = iso(rx, ry, 0);
          const pulse = Math.sin(elapsed * 12.0) * 0.5 + 0.5;
          ctx.strokeStyle = `rgba(236, 72, 153, ${0.4 + pulse * 0.6})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(loopKeyframe.sx, loopKeyframe.sy);
          ctx.lineTo(currPt.sx, currPt.sy);
          ctx.stroke();

          // Convergence wave
          if (elapsed >= 6.0 && elapsed <= 8.5) {
            const rippleR = ((elapsed - 6.0) / 2.5) * 80;
            ctx.strokeStyle = `rgba(6, 182, 212, ${1 - (elapsed - 6.0) / 2.5})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(currPt.sx, currPt.sy, rippleR, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // Mapped 3D Occupancy Grid Voxels
        const voxels = [
          { x: 10, y: 70, z: 12 }, { x: 30, y: 70, z: 12 }, { x: 50, y: 70, z: 12 },
          { x: -85, y: 125, z: 14 }, { x: -65, y: 125, z: 14 }, { x: -85, y: 35, z: 14 },
          { x: 75, y: -40, z: 10 }, { x: 95, y: -40, z: 10 }, { x: 115, y: -40, z: 10 }
        ];
        voxels.forEach(v => {
          const pt = iso(v.x, v.y, v.z);
          ctx.fillStyle = hasLoopClosed ? '#059669' : '#0284c7';
          ctx.fillRect(pt.sx - 4, pt.sy - 4, 8, 8);
          ctx.strokeStyle = hasLoopClosed ? '#34d399' : '#38bdf8';
          ctx.strokeRect(pt.sx - 4, pt.sy - 4, 8, 8);
        });

        // 3D Robot
        const robotBase = iso(rx, ry, 0);
        const robotDeck = iso(rx, ry, 14);
        const lidarPuck = iso(rx, ry, 28);

        ctx.fillStyle = '#334155';
        ctx.beginPath(); ctx.arc(robotBase.sx, robotBase.sy, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2; ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath(); ctx.arc(robotDeck.sx, robotDeck.sy, 9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5; ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(lidarPuck.sx, lidarPuck.sy, 4.5, 0, Math.PI * 2); ctx.fill();

        // Heading arrow
        const headingAngle = robotAngle + Math.PI / 2;
        const dirPt = iso(rx + Math.cos(headingAngle) * 25, ry + Math.sin(headingAngle) * 25, 0);
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(robotBase.sx, robotBase.sy); ctx.lineTo(dirPt.sx, dirPt.sy); ctx.stroke();

        // 3D Sweeping LiDAR Beams
        const beamCount = 32;
        const puckSpin = elapsed * 24.0;
        for (let b = 0; b < beamCount; b++) {
          const bAngle = puckSpin + (b / beamCount) * Math.PI * 2;
          const beamElevation = Math.sin(b * 0.75 + elapsed * 5.0) * 22;
          const beamRange = 90 + (b % 4) * 22;
          const hitPt = iso(rx + Math.cos(bAngle) * beamRange, ry + Math.sin(bAngle) * beamRange, Math.max(0, beamElevation));

          ctx.strokeStyle = b % 2 === 0 ? 'rgba(56, 189, 248, 0.45)' : 'rgba(52, 211, 153, 0.35)';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(lidarPuck.sx, lidarPuck.sy); ctx.lineTo(hitPt.sx, hitPt.sy); ctx.stroke();

          ctx.fillStyle = b % 3 === 0 ? '#38bdf8' : b % 3 === 1 ? '#34d399' : '#a855f7';
          ctx.beginPath(); ctx.arc(hitPt.sx, hitPt.sy, 2.5, 0, Math.PI * 2); ctx.fill();
        }

        // Viewport status tag
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(20, 70, 240, 52);
        ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
        ctx.strokeRect(20, 70, 240, 52);
        ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 11px monospace';
        ctx.fillText('3D LiDAR SLAM · ENGINE ACTIVE', 30, 88);
        ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace';
        ctx.fillText(hasLoopClosed ? 'Ceres Solver: CONVERGED (4.2mm)' : 'Wheel Odom: ACCUMULATING DRIFT', 30, 108);

        // Right Telemetry HUD Card
        const cardX = w - 320;
        const cardY = 80;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#334155';
        ctx.fillRect(cardX, cardY, 296, 170);
        ctx.strokeRect(cardX, cardY, 296, 170);
        ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace';
        ctx.fillText('DIAGNOSTIC TELEMETRY STREAM', cardX + 16, cardY + 24);
        ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 13px monospace';
        ctx.fillText(curStep.title, cardX + 16, cardY + 48, 260);
        ctx.fillStyle = '#64748b'; ctx.font = '10px monospace';
        ctx.fillText(curStep.metricLabel.toUpperCase(), cardX + 16, cardY + 95);
        ctx.fillStyle = isProblemPhase ? '#f43f5e' : '#10b981';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(curStep.metricValue, cardX + 16, cardY + 120);
        ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace';
        ctx.fillText(`TIME: ${elapsed.toFixed(1)}s / ${durationSec}s`, cardX + 16, cardY + 150);

        // Lower Subtitle Bar
        ctx.fillStyle = 'rgba(2, 6, 23, 0.95)';
        ctx.fillRect(24, h - 86, w - 48, 56);
        ctx.strokeStyle = curStep.badgeColor; ctx.lineWidth = 2;
        ctx.strokeRect(24, h - 86, w - 48, 56);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 13px sans-serif';
        ctx.fillText(curStep.subtitle, 42, h - 52);

        // Progress bar
        ctx.fillStyle = '#1e293b'; ctx.fillRect(0, h - 6, w, 6);
        ctx.fillStyle = curStep.badgeColor; ctx.fillRect(0, h - 6, w * progress, 6);

      } catch (err) {
        console.error('SLAM 3D video render frame error:', err);
      }

      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, isPlaying, durationSec]);

  // Video recording
  const handleExportWebM = () => {
    const canvas = modalCanvasRef.current;
    if (!canvas) return;

    setIsRecording(true);
    setRecordProgress(0);
    recordedChunksRef.current = [];

    try {
      const stream = canvas.captureStream(60);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000,
      });

      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'AIGENESIS_3D_SLAM_Studio_In_Progress.webm';
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
      };

      recorder.start();
      setCurrentTimeSec(0);
      setIsPlaying(true);

      let elapsed = 0;
      const interval = setInterval(() => {
        elapsed += 0.5;
        setRecordProgress(Math.min(Math.round((elapsed / durationSec) * 100), 100));
        if (elapsed >= durationSec) {
          clearInterval(interval);
          recorder.stop();
        }
      }, 500);
    } catch (err) {
      console.warn('Video recorder error:', err);
      setIsRecording(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn font-mono">
      <div 
        className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background accents */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-purple-500/20">
              <Film className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white font-mono">
                  3D LiDAR SLAM Studio in Progress
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  60 FPS 3D Simulation
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                360° LiDAR Raycasting, Wheel Odometry Drift vs. Ceres Graph Optimization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenFullProducer && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFullProducer();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition cursor-pointer"
                title="Open in Full Video Generator Studio with Outreach Emails"
              >
                <span>Full Studio</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close 3D Video"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas Screen */}
        <div className="p-4 sm:p-6 bg-slate-950/80 flex flex-col items-center justify-center relative z-10 flex-1 overflow-y-auto">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl w-full max-w-3xl">
            <canvas
              ref={modalCanvasRef}
              width={800}
              height={450}
              className="w-full h-auto block"
            />
          </div>

          {/* Video Control Bar */}
          <div className="w-full max-w-3xl mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={() => {
                  setCurrentTimeSec(0);
                  lastSpokenIndex.current = -1;
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition cursor-pointer border border-slate-800"
                title="Restart Video"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>

              <button
                onClick={() => setIsVoiceoverEnabled(!isVoiceoverEnabled)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer border ${
                  isVoiceoverEnabled
                    ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {isVoiceoverEnabled ? <Volume2 className="w-3.5 h-3.5 text-purple-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                <span>Voiceover: {isVoiceoverEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">
                {currentTimeSec.toFixed(1)}s / {durationSec}s
              </span>

              <button
                onClick={handleExportWebM}
                disabled={isRecording}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-600 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-slate-950 font-extrabold shadow-md transition cursor-pointer disabled:opacity-60"
              >
                <Download className={`w-3.5 h-3.5 ${isRecording ? 'animate-bounce' : ''}`} />
                <span>{isRecording ? `Recording (${recordProgress}%)...` : 'Download Video (.WebM)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-6 border-t border-slate-800/80 bg-slate-950/90 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Simulating 64-Beam LiDAR, Bresenham 3D Occupancy, & Ceres Sparse Normal Cholesky Graph Optimization.</span>
          </div>

          <button
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};

