import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, Play, Pause, RotateCcw, Download, Copy, Check, 
  Layers, Cpu, Radio, Sparkles, AlertTriangle, Eye, Activity, 
  MapPin, Shield, Terminal, ArrowRight, Zap, Target, Gauge, Crosshair
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
  onNavigateToPricing
}) => {
  const { quota, limits } = useQuota();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    </div>
  );
};
