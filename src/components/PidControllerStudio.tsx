import React, { useState, useEffect, useRef } from 'react';
import { 
  Sliders, Play, Pause, RotateCcw, Download, Copy, Check, 
  Activity, Zap, Shield, Terminal, ArrowRight, Gauge, 
  Sparkles, RefreshCw, AlertCircle, TrendingUp, Wind, BarChart2
} from 'lucide-react';
import { PlanTier } from '../types';

interface PidStudioProps {
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

type PlantType = 'robotic_joint' | 'quadcopter_altitude' | 'motor_velocity';

export const PidControllerStudio: React.FC<PidStudioProps> = ({
  onOpenBarrier,
  onNavigateToPricing
}) => {
  // Physical Plant Selection
  const [plant, setPlant] = useState<PlantType>('robotic_joint');
  
  // PID Gains
  const [kp, setKp] = useState<number>(4.8);
  const [ki, setKi] = useState<number>(1.2);
  const [kd, setKd] = useState<number>(0.65);
  
  // Advanced Filter & Anti-windup
  const [antiWindupLimit, setAntiWindupLimit] = useState<number>(50.0);
  const [setpoint, setSetpoint] = useState<number>(60.0); // e.g. 60 degrees or 60%
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'chart' | 'cpp_code' | 'ros2_control'>('chart');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Performance Telemetry
  const [riseTime, setRiseTime] = useState<number>(0.38); // seconds
  const [overshootPercent, setOvershootPercent] = useState<number>(4.2); // %
  const [settlingTime, setSettlingTime] = useState<number>(0.85); // seconds
  const [steadyStateError, setSteadyStateError] = useState<number>(0.02);
  const [controlEffort, setControlEffort] = useState<number>(0);
  const [pTerm, setPTerm] = useState<number>(0);
  const [iTerm, setITerm] = useState<number>(0);
  const [dTerm, setDTerm] = useState<number>(0);

  // Canvas Refs
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const physicalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulation State Refs
  const stateRef = useRef({
    position: 0,
    velocity: 0,
    integral: 0,
    prevError: 0,
    time: 0,
    disturbance: 0,
    history: [] as Array<{
      time: number;
      setpoint: number;
      position: number;
      error: number;
      p: number;
      i: number;
      d: number;
      effort: number;
    }>
  });

  // Inject External Load Disturbance (e.g. wind gust or payload step)
  const injectDisturbance = () => {
    stateRef.current.disturbance = 45.0; // sudden torque/force disturbance
    setTimeout(() => {
      stateRef.current.disturbance = 0;
    }, 400);
  };

  // Preset Auto-Tuning Profiles
  const applyPreset = (type: 'critically_damped' | 'aggressive' | 'smooth' | 'underdamped') => {
    if (plant === 'robotic_joint') {
      if (type === 'critically_damped') { setKp(5.2); setKi(1.4); setKd(0.85); }
      if (type === 'aggressive') { setKp(9.5); setKi(3.2); setKd(0.4); }
      if (type === 'smooth') { setKp(2.8); setKi(0.6); setKd(1.2); }
      if (type === 'underdamped') { setKp(8.0); setKi(0.5); setKd(0.1); }
    } else if (plant === 'quadcopter_altitude') {
      if (type === 'critically_damped') { setKp(4.2); setKi(1.8); setKd(1.1); }
      if (type === 'aggressive') { setKp(7.5); setKi(4.0); setKd(0.6); }
      if (type === 'smooth') { setKp(2.5); setKi(0.9); setKd(1.5); }
      if (type === 'underdamped') { setKp(6.0); setKi(0.8); setKd(0.15); }
    } else {
      if (type === 'critically_damped') { setKp(3.8); setKi(2.2); setKd(0.3); }
      if (type === 'aggressive') { setKp(6.5); setKi(5.0); setKd(0.15); }
      if (type === 'smooth') { setKp(2.0); setKi(1.2); setKd(0.5); }
      if (type === 'underdamped') { setKp(5.5); setKi(1.0); setKd(0.05); }
    }
  };

  // Reset State
  const handleReset = () => {
    stateRef.current = {
      position: 0,
      velocity: 0,
      integral: 0,
      prevError: setpoint,
      time: 0,
      disturbance: 0,
      history: []
    };
  };

  // Main PID Simulation & Physics Engine Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const dt = Math.min(0.04, (timestamp - lastTimestamp) / 1000);
      lastTimestamp = timestamp;

      if (isRunning) {
        const state = stateRef.current;
        state.time += dt;

        // 1. Calculate Error: e(t) = Setpoint - Process Variable
        const error = setpoint - state.position;

        // 2. P-Term: Proportional to current error
        const p = kp * error;

        // 3. I-Term: Accumulated error with anti-windup clamping
        state.integral += error * dt;
        if (state.integral > antiWindupLimit) state.integral = antiWindupLimit;
        if (state.integral < -antiWindupLimit) state.integral = -antiWindupLimit;
        const i = ki * state.integral;

        // 4. D-Term: Derivative of error (rate of change)
        const dError = dt > 0 ? (error - state.prevError) / dt : 0;
        const d = kd * dError;
        state.prevError = error;

        // 5. Total Control Effort u(t) = P + I + D
        let u = p + i + d;
        // Saturation limits of actuator [-100, 100]
        if (u > 100) u = 100;
        if (u < -100) u = -100;

        // Update telemetry states
        setControlEffort(parseFloat(u.toFixed(1)));
        setPTerm(parseFloat(p.toFixed(1)));
        setITerm(parseFloat(i.toFixed(1)));
        setDTerm(parseFloat(d.toFixed(1)));

        // 6. Physics Plant Simulation
        let mass = 1.2;
        let damping = 1.8;
        let gravity = 0;

        if (plant === 'robotic_joint') {
          mass = 1.0;
          damping = 2.2;
          // Gravity torque depends on arm angle (sin theta)
          gravity = Math.sin((state.position * Math.PI) / 180) * 8.0;
        } else if (plant === 'quadcopter_altitude') {
          mass = 1.5;
          damping = 1.2;
          gravity = 9.81 * 1.5; // Constant gravity pulling down
        } else {
          // Motor Velocity
          mass = 0.8;
          damping = 3.5;
          gravity = 0;
        }

        // Acceleration = (Effort - Damping*Vel - Gravity + Disturbance) / Mass
        const accel = (u - damping * state.velocity - gravity + state.disturbance) / mass;
        state.velocity += accel * dt;
        state.position += state.velocity * dt;

        // Prevent negative values for altitude/speed if bounded
        if (plant === 'quadcopter_altitude' && state.position < 0) {
          state.position = 0;
          state.velocity = 0;
        }

        // Record history for oscilloscope
        state.history.push({
          time: state.time,
          setpoint,
          position: state.position,
          error,
          p,
          i,
          d,
          effort: u
        });

        if (state.history.length > 250) {
          state.history.shift();
        }

        // Calculate dynamic step response characteristics
        const maxPos = Math.max(...state.history.map(h => h.position));
        if (setpoint > 0 && maxPos > setpoint) {
          const overshoot = ((maxPos - setpoint) / setpoint) * 100;
          setOvershootPercent(parseFloat(overshoot.toFixed(1)));
        } else {
          setOvershootPercent(0.0);
        }
        setSteadyStateError(parseFloat(Math.abs(error).toFixed(2)));
      }

      // Render Oscilloscope & Plant Canvases
      drawOscilloscope();
      drawPhysicalPlant();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning, kp, ki, kd, setpoint, antiWindupLimit, plant]);

  // Draw Step-Response Waveform Oscilloscope
  const drawOscilloscope = () => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = '#020617'; // slate-950
    ctx.fillRect(0, 0, width, height);

    // Grid Lines
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
    ctx.lineWidth = 1;
    for (let y = 30; y < height; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let x = 40; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const history = stateRef.current.history;
    if (history.length < 2) return;

    // Scale calculation (Max value mapped to height)
    const maxVal = Math.max(100, setpoint * 1.5);
    const scaleY = (val: number) => height - 30 - (val / maxVal) * (height - 60);

    // 1. Draw Target Setpoint Line (Yellow Dotted)
    const targetY = scaleY(setpoint);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, targetY);
    ctx.lineTo(width, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Draw Process Variable y(t) Output Curve (Bright Cyan)
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    history.forEach((pt, idx) => {
      const x = (idx / 250) * width;
      const y = scaleY(pt.position);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 3. Draw Control Effort u(t) (Translucent Purple)
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    history.forEach((pt, idx) => {
      const x = (idx / 250) * width;
      const y = height - 20 - (pt.effort / 100) * 40;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };

  // Draw 2D Physical Plant Model (Robotic Joint / Quadcopter / Motor)
  const drawPhysicalPlant = () => {
    const canvas = physicalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const currentPos = stateRef.current.position;

    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, width, height);

    if (plant === 'robotic_joint') {
      // 1-DoF Robotic Arm
      const originX = width / 2;
      const originY = height - 40;
      const armLength = 90;
      const rad = (-currentPos * Math.PI) / 180; // convert angle

      // Base mount
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(originX, originY, 18, 0, Math.PI * 2);
      ctx.fill();

      // Target Ghost Arm (Dotted)
      const targetRad = (-setpoint * Math.PI) / 180;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(originX + Math.cos(targetRad) * armLength, originY + Math.sin(targetRad) * armLength);
      ctx.stroke();
      ctx.setLineDash([]);

      // Actual Arm Link
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      const endX = originX + Math.cos(rad) * armLength;
      const endY = originY + Math.sin(rad) * armLength;
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // End Effector Tool
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(endX, endY, 8, 0, Math.PI * 2);
      ctx.fill();

    } else if (plant === 'quadcopter_altitude') {
      // Quadcopter Vertical Height
      const groundY = height - 30;
      const altitudeY = groundY - (currentPos / 100) * (height - 60);
      const targetY = groundY - (setpoint / 100) * (height - 60);

      // Target Altitude Line
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(20, targetY);
      ctx.lineTo(width - 20, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Drone Body
      const droneX = width / 2;
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(droneX - 35, altitudeY - 5, 70, 10);

      // Propellers
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(droneX - 45, altitudeY - 9, 20, 3);
      ctx.fillRect(droneX + 25, altitudeY - 9, 20, 3);

      // Thrust flame / particles if effort > 0
      if (controlEffort > 0) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.beginPath();
        ctx.moveTo(droneX - 35, altitudeY + 6);
        ctx.lineTo(droneX - 25, altitudeY + 6 + (controlEffort / 100) * 20);
        ctx.lineTo(droneX - 15, altitudeY + 6);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(droneX + 15, altitudeY + 6);
        ctx.lineTo(droneX + 25, altitudeY + 6 + (controlEffort / 100) * 20);
        ctx.lineTo(droneX + 35, altitudeY + 6);
        ctx.fill();
      }

      // Ground Line
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, groundY);
      ctx.lineTo(width - 10, groundY);
      ctx.stroke();

    } else {
      // Motor Velocity Tachometer
      const centerX = width / 2;
      const centerY = height / 2 + 10;
      const radius = 65;

      // Gauge Arc
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();

      // Active Velocity Arc
      const pct = Math.min(1, Math.max(0, currentPos / 100));
      const endAngle = Math.PI * 0.8 + pct * (Math.PI * 1.4);
      ctx.strokeStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, Math.PI * 0.8, endAngle);
      ctx.stroke();

      // Needle
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(endAngle) * (radius - 12), centerY + Math.sin(endAngle) * (radius - 12));
      ctx.stroke();
    }
  };

  // C++ Header-only PID Controller Code
  const cppPidCode = `// ========================================================
// AIGENESIS.TECH // Fast Micro-ROS / C++ PID Controller
// Auto-tuned: Kp=${kp}, Ki=${ki}, Kd=${kd}
// ========================================================

#pragma once
#include <algorithm>

class PidController {
public:
    PidController(double kp, double ki, double kd, double anti_windup = 50.0)
        : kp_(kp), ki_(ki), kd_(kd), anti_windup_(anti_windup),
          integral_(0.0), prev_error_(0.0) {}

    double compute(double setpoint, double process_variable, double dt) {
        if (dt <= 0.0) return 0.0;

        // 1. Proportional Error
        double error = setpoint - process_variable;
        double p_term = kp_ * error;

        // 2. Integral Error with Anti-Windup Clamping
        integral_ += error * dt;
        integral_ = std::clamp(integral_, -anti_windup_, anti_windup_);
        double i_term = ki_ * integral_;

        // 3. Derivative Error (Rate of Change)
        double derivative = (error - prev_error_) / dt;
        double d_term = kd_ * derivative;
        prev_error_ = error;

        // 4. Combined Control Effort (Saturated)
        double effort = p_term + i_term + d_term;
        return std::clamp(effort, -100.0, 100.0);
    }

    void reset() {
        integral_ = 0.0;
        prev_error_ = 0.0;
    }

private:
    double kp_, ki_, kd_, anti_windup_;
    double integral_;
    double prev_error_;
};
`;

  // ROS 2 ros2_control YAML
  const ros2ControlYaml = `# ========================================================
# AIGENESIS.TECH // ros2_control_pid.yaml
# Production ros2_control Hardware Controller Configuration
# ========================================================

controller_manager:
  ros__parameters:
    update_rate: 1000 # 1 kHz real-time control loop

    joint_trajectory_controller:
      type: joint_trajectory_controller/JointTrajectoryController

    pid_effort_controller:
      type: effort_controllers/JointGroupEffortController

joint_trajectory_controller:
  ros__parameters:
    joints:
      - actuator_joint_1
    command_interfaces:
      - effort
    state_interfaces:
      - position
      - velocity

    gains:
      actuator_joint_1:
        p: ${kp}
        i: ${ki}
        d: ${kd}
        i_clamp: ${antiWindupLimit}
        ff_velocity_scale: 0.0
        antiwindup: true
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
    <div className="space-y-8 py-2 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Closed-Loop Dynamics & Actuator Control</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight flex items-center gap-3">
            PID Controller & Step-Response Studio
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 font-normal">
              1 kHz Real-Time Loop
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Real-time Proportional–Integral–Derivative (PID) control loop simulator. Tune joint servos, drone altitude, and motor velocity with anti-windup clamping, disturbance injection, and auto-tuning presets.
          </p>
        </div>

        {/* Global Controls */}
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
            <span>{isRunning ? 'Pause Engine' : 'Resume Loop'}</span>
          </button>

          <button
            onClick={injectDisturbance}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs font-mono border border-red-500/40 transition-all shadow-sm"
            title="Inject Load Spike"
          >
            <Wind className="w-3.5 h-3.5 animate-pulse" />
            <span>Inject Disturbance</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* KPI Telemetry & Dynamic Term Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>P-Term (Error)</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400">{pTerm}</div>
          <span className="text-[10px] text-slate-500">Kp · e(t)</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>I-Term (Integral)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">{iTerm}</div>
          <span className="text-[10px] text-slate-500">Ki · ∫e dt</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>D-Term (Derivative)</span>
            <span className="w-2 h-2 rounded-full bg-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400">{dTerm}</div>
          <span className="text-[10px] text-slate-500">Kd · de/dt</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Control Effort u(t)</span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400">{controlEffort}%</div>
          <span className="text-[10px] text-slate-500">Actuator Saturation</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Peak Overshoot</span>
            <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400">{overshootPercent}%</div>
          <span className="text-[10px] text-slate-500">Mp (% of step)</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Steady-State Error</span>
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-indigo-400">{steadyStateError}</div>
          <span className="text-[10px] text-slate-500">ess offset</span>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Oscilloscope & Physical Simulation (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Oscilloscope Step-Response Canvas */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase">
                  Step-Response Oscilloscope
                </span>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-amber-400 inline-block border-b border-dashed" />
                  <span className="text-amber-300">Setpoint r(t)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" />
                  <span className="text-cyan-300">Position y(t)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-purple-400 inline-block" />
                  <span className="text-purple-300">Effort u(t)</span>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
              <canvas
                ref={chartCanvasRef}
                width={560}
                height={230}
                className="w-full aspect-[2.4/1] block"
              />
            </div>

            {/* Setpoint Slider */}
            <div className="pt-2 font-mono">
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Target Step Setpoint:</span>
                <span className="text-amber-400 font-bold">{setpoint.toFixed(1)} Units</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={setpoint}
                onChange={(e) => setSetpoint(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Physical Plant Canvas */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 font-mono">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase">
                  Physical Plant Visualization
                </span>
              </div>

              {/* Plant Selector */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => { setPlant('robotic_joint'); handleReset(); }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    plant === 'robotic_joint' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400'
                  }`}
                >
                  Robotic Arm Joint
                </button>
                <button
                  onClick={() => { setPlant('quadcopter_altitude'); handleReset(); }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    plant === 'quadcopter_altitude' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400'
                  }`}
                >
                  Drone Altitude
                </button>
                <button
                  onClick={() => { setPlant('motor_velocity'); handleReset(); }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    plant === 'motor_velocity' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400'
                  }`}
                >
                  Motor Speed
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex justify-center">
              <canvas
                ref={physicalCanvasRef}
                width={560}
                height={160}
                className="w-full aspect-[3.5/1] block"
              />
            </div>
          </div>
        </div>

        {/* Right Column: PID Parameter Tuning & Code Exporter (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* PID Gain Sliders */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase">Tuning Parameters</h3>
              </div>
              <span className="text-[10px] text-slate-500">Live Adjustment</span>
            </div>

            {/* Tuning Presets */}
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-bold block">Auto-Tune Presets:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => applyPreset('critically_damped')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-[11px] border border-slate-700 text-left"
                >
                  ⚡ Critically Damped
                </button>
                <button
                  onClick={() => applyPreset('aggressive')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-lg text-[11px] border border-slate-700 text-left"
                >
                  🔥 Fast & Aggressive
                </button>
                <button
                  onClick={() => applyPreset('smooth')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-[11px] border border-slate-700 text-left"
                >
                  🛡️ Smooth (No Overshoot)
                </button>
                <button
                  onClick={() => applyPreset('underdamped')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-[11px] border border-slate-700 text-left"
                >
                  〰️ Oscillating / Ringing
                </button>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 text-xs pt-2">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>P Gain (Proportional Kp):</span>
                  <span className="text-cyan-400 font-bold">{kp.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="15.0"
                  step="0.1"
                  value={kp}
                  onChange={(e) => setKp(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>I Gain (Integral Ki):</span>
                  <span className="text-emerald-400 font-bold">{ki.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="8.0"
                  step="0.1"
                  value={ki}
                  onChange={(e) => setKi(Number(e.target.value))}
                  className="w-full accent-emerald-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>D Gain (Derivative Kd):</span>
                  <span className="text-purple-400 font-bold">{kd.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="3.0"
                  step="0.05"
                  value={kd}
                  onChange={(e) => setKd(Number(e.target.value))}
                  className="w-full accent-purple-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Anti-Windup Integral Clamp:</span>
                  <span className="text-amber-400 font-bold">±{antiWindupLimit.toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={antiWindupLimit}
                  onChange={(e) => setAntiWindupLimit(Number(e.target.value))}
                  className="w-full accent-amber-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* C++ & ros2_control Code Exporter */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase">
                  Firmware Exporter
                </h3>
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => setActiveTab('chart')}
                  className={`px-2 py-0.5 rounded ${activeTab === 'chart' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}
                >
                  C++ Header
                </button>
                <button
                  onClick={() => setActiveTab('ros2_control')}
                  className={`px-2 py-0.5 rounded ${activeTab === 'ros2_control' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}
                >
                  ros2_control YAML
                </button>
              </div>
            </div>

            <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800 font-mono text-xs text-slate-300 max-h-56 overflow-y-auto">
              <pre className="text-[11px] leading-relaxed">
                {activeTab === 'chart' ? cppPidCode : ros2ControlYaml}
              </pre>
            </div>

            <div className="flex items-center gap-2 pt-1 font-mono">
              <button
                onClick={() => handleCopy(activeTab === 'chart' ? cppPidCode : ros2ControlYaml)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>

              <button
                onClick={() => {
                  const filename = activeTab === 'chart' ? 'PidController.hpp' : 'ros2_control_pid.yaml';
                  const content = activeTab === 'chart' ? cppPidCode : ros2ControlYaml;
                  handleDownload(filename, content);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
