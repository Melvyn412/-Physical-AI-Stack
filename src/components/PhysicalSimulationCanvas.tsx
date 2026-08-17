import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, AlertTriangle, Eye, Globe, Zap, RotateCcw, ShieldCheck, Sliders } from 'lucide-react';
import { ObjectiveScenario, StackPillar } from '../types';

interface PhysicalSimulationCanvasProps {
  scenario: ObjectiveScenario;
  activeStepIndex: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextStep: () => void;
  onReset: () => void;
  activePillarHighlight?: StackPillar | null;
}

export const PhysicalSimulationCanvas: React.FC<PhysicalSimulationCanvasProps> = ({
  scenario,
  activeStepIndex,
  isPlaying,
  onTogglePlay,
  onNextStep,
  onReset,
  activePillarHighlight
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [injectObstacle, setInjectObstacle] = useState<boolean>(false);
  const [showWorldModelRollout, setShowWorldModelRollout] = useState<boolean>(true);
  const [showSensors, setShowSensors] = useState<boolean>(true);
  const [noiseLevel, setNoiseLevel] = useState<number>(0.1);
  const animFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 360);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = 360;
      }
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      phaseRef.current += isPlaying ? 0.03 : 0.005;
      const phase = phaseRef.current;

      // 1. Clear & Canvas Background
      ctx.fillStyle = '#090d16'; // Deep space dark slate
      ctx.fillRect(0, 0, width, height);

      // Grid Lines (Spatial Coordinates in meters)
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Origin Ground Platform
      const groundY = height - 50;
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, groundY);
      ctx.lineTo(width - 20, groundY);
      ctx.stroke();

      // Axis Markers
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.font = '10px monospace';
      ctx.fillText('SPATIAL ORIGIN (0.0m, 0.0m, 0.0m)', 30, groundY + 20);
      ctx.fillText(`WORLD MODEL GRID: ${scenario.defaultWorldModel.gridResolutionCm}cm`, width - 210, 25);

      // Base Position of Robot Base
      const baseX = width * 0.25;
      const baseY = groundY;

      // Robot Base Stand
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.fillRect(baseX - 35, baseY - 20, 70, 20);
      ctx.strokeRect(baseX - 35, baseY - 20, 70, 20);

      // Calculate Arm Angles based on step progress & animation phase
      const stepFactor = (activeStepIndex + 1) / scenario.steps.length;
      const arm1Len = 100;
      const arm2Len = 80;

      // Angles in radians
      const baseAngle = -Math.PI / 2 + Math.sin(phase * 0.8) * 0.15 + (stepFactor * 0.4 - 0.2);
      const elbowAngle = Math.PI / 4 + Math.cos(phase * 0.9) * 0.2 + (stepFactor * 0.3);

      // Joint 1 Position (Base Joint)
      const j1X = baseX;
      const j1Y = baseY - 20;

      // Joint 2 Position (Elbow)
      const j2X = j1X + Math.cos(baseAngle) * arm1Len;
      const j2Y = j1Y + Math.sin(baseAngle) * arm1Len;

      // End Effector Position (Hand / Gripper)
      const endX = j2X + Math.cos(baseAngle + elbowAngle) * arm2Len;
      const endY = j2Y + Math.sin(baseAngle + elbowAngle) * arm2Len;

      // Target Object Position
      const targetX = width * 0.72;
      const targetY = groundY - 25;

      // Draw Multimodal Sensor Vision Beams if enabled
      if (showSensors) {
        ctx.save();
        // Sensor beam from Robot Hand/Head toward Target
        const beamAngle = Math.atan2(targetY - j1Y, targetX - j1X);
        const fov = 0.45; // Radians

        // RGB-D Depth Cone
        const grad = ctx.createRadialGradient(j1X, j1Y, 10, j1X, j1Y, 320);
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.35)'); // Cyan
        grad.addColorStop(0.7, 'rgba(6, 182, 212, 0.08)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(j1X, j1Y);
        ctx.arc(j1X, j1Y, 320, beamAngle - fov / 2, beamAngle + fov / 2);
        ctx.closePath();
        ctx.fill();

        // 3D LiDAR Point Cloud Sweep Line
        const lidarSweepX = j1X + Math.cos(beamAngle + Math.sin(phase * 3) * (fov / 2)) * 300;
        const lidarSweepY = j1Y + Math.sin(beamAngle + Math.sin(phase * 3) * (fov / 2)) * 300;
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(j1X, j1Y);
        ctx.lineTo(lidarSweepX, lidarSweepY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Simulated LiDAR Point Cloud Dots near target
        ctx.fillStyle = 'rgba(34, 211, 238, 0.8)';
        for (let p = 0; p < 18; p++) {
          const px = targetX + (Math.random() - 0.5) * 60 + Math.sin(phase + p) * 3;
          const py = targetY + (Math.random() - 0.5) * 50 + Math.cos(phase + p) * 3;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Draw World Model Predicted Future Trajectory (Ghost Rollout)
      if (showWorldModelRollout) {
        ctx.save();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)'; // Emerald
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);

        ctx.beginPath();
        ctx.moveTo(endX, endY);

        // Simulated 2-second future rollout curve
        const cp1X = (endX + targetX) / 2 + Math.sin(phase) * 15;
        const cp1Y = Math.min(endY, targetY) - 50 + Math.cos(phase) * 10;
        const cp2X = targetX - 20;
        const cp2Y = targetY - 10;

        ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, targetX, targetY - 10);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ghost End-Effector at predicted T+1s
        const tFactor = (Math.sin(phase * 1.5) + 1) / 2;
        const ghostX = endX + (targetX - endX) * tFactor;
        const ghostY = endY + (targetY - 10 - endY) * tFactor;

        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.beginPath();
        ctx.arc(ghostX, ghostY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.font = '10px monospace';
        ctx.fillText('WM ROLLOUT (T+1.5s)', ghostX - 45, ghostY - 16);
        ctx.restore();
      }

      // Draw Dynamic Obstacle if Injected
      if (injectObstacle) {
        const obsX = width * 0.52;
        const obsY = groundY - 35;
        ctx.save();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)'; // Red
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.fillRect(obsX - 25, obsY - 25, 50, 50);
        ctx.strokeRect(obsX - 25, obsY - 25, 50, 50);

        // Warning Hazard Icon Text
        ctx.fillStyle = '#f87171';
        ctx.font = '10px monospace';
        ctx.fillText('⚠️ UNEXPECTED OBSTACLE', obsX - 50, obsY - 32);

        // Safety Collision Radius
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.arc(obsX, obsY, 45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Robotic Arm Segments (Arm 1 and Arm 2)
      ctx.save();
      // Segment 1 (Shoulder to Elbow)
      ctx.strokeStyle = '#38bdf8'; // Sky blue
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(j1X, j1Y);
      ctx.lineTo(j2X, j2Y);
      ctx.stroke();

      // Segment 2 (Elbow to Hand)
      ctx.strokeStyle = '#818cf8'; // Indigo
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(j2X, j2Y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Joints (Shoulder & Elbow)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(j1X, j1Y, 10, 0, Math.PI * 2);
      ctx.arc(j2X, j2Y, 8, 0, Math.PI * 2);
      ctx.fill();

      // End-Effector Gripper / Hand
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(endX, endY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Gripper Fingers
      const fingerAngle = Math.sin(phase * 2) * 0.2 + 0.2;
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(endX, endY - 6);
      ctx.lineTo(endX + 15 * Math.cos(fingerAngle), endY - 12);
      ctx.moveTo(endX, endY + 6);
      ctx.lineTo(endX + 15 * Math.cos(fingerAngle), endY + 12);
      ctx.stroke();
      ctx.restore();

      // Draw Target Object
      ctx.save();
      ctx.fillStyle = '#f59e0b'; // Amber target
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Target Label
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`TARGET OBJECT`, targetX - 40, targetY + 32);
      ctx.restore();

      // Layer Active Highlight Badge on Top Canvas
      const currentStep = scenario.steps[activeStepIndex];
      if (currentStep) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.fillRect(15, 15, 290, 48);
        ctx.strokeRect(15, 15, 290, 48);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px font-mono';
        ctx.fillText(`ACTIVE LAYER: ${currentStep.activeLayer.toUpperCase()}`, 25, 32);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '10px font-mono';
        ctx.fillText(`Step ${activeStepIndex + 1}/${scenario.steps.length}: ${currentStep.title}`, 25, 48);
      }

      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [scenario, activeStepIndex, isPlaying, injectObstacle, showWorldModelRollout, showSensors, noiseLevel]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Canvas Top Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>2D REAL-TIME PHYSICAL SIMULATOR</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            CONTROL FREQ: <strong className="text-cyan-300">{scenario.defaultRobotics.controlFrequencyHz}Hz</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Controls */}
          <button
            id="sim-btn-play"
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Sim' : 'Start Simulation'}</span>
          </button>

          <button
            id="sim-btn-next"
            onClick={onNextStep}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs border border-slate-700 transition-all"
            title="Step Forward"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Next Step</span>
          </button>

          <button
            id="sim-btn-reset"
            onClick={onReset}
            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-md border border-slate-700 transition-all"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative w-full bg-slate-950">
        <canvas ref={canvasRef} className="w-full h-[360px] block cursor-crosshair" />

        {/* Overlay Interactive Controls */}
        <div className="absolute bottom-3 right-3 flex flex-wrap items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-slate-800/90 backdrop-blur-md shadow-lg text-xs font-mono">
          <button
            id="toggle-world-model"
            onClick={() => setShowWorldModelRollout(!showWorldModelRollout)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
              showWorldModelRollout
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>World Model Ghost</span>
          </button>

          <button
            id="toggle-sensors"
            onClick={() => setShowSensors(!showSensors)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
              showSensors
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Multimodal Beams</span>
          </button>

          <button
            id="toggle-obstacle"
            onClick={() => setInjectObstacle(!injectObstacle)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
              injectObstacle
                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>{injectObstacle ? 'Remove Obstacle' : 'Inject Hazard'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Live Metrics & Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-slate-950 border-t border-slate-800/80 text-xs font-mono">
        <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px]">MULTIMODAL SENSOR RATE</span>
          <span className="text-cyan-400 font-bold">{scenario.defaultMultimodal.fusionRateHz} Hz</span>
          <span className="text-[10px] text-slate-400 block">RGB-D + LiDAR + Tactile</span>
        </div>

        <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px]">WORLD MODEL ACCURACY</span>
          <span className="text-emerald-400 font-bold">{scenario.defaultWorldModel.confidenceScore}%</span>
          <span className="text-[10px] text-slate-400 block">2.0s Generative Rollout</span>
        </div>

        <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px]">REASONING HAZARD MATRIX</span>
          <span className={`font-bold ${injectObstacle ? 'text-red-400' : 'text-violet-400'}`}>
            {injectObstacle ? 'WARN: OBSTACLE DETECTED' : scenario.defaultReasoning.hazardLevel}
          </span>
          <span className="text-[10px] text-slate-400 block">System 2 Tree-of-Thought</span>
        </div>

        <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px]">ACTUATOR TORQUE COMPLIANCE</span>
          <span className="text-pink-400 font-bold">{scenario.defaultRobotics.gripForceN} N Force Limit</span>
          <span className="text-[10px] text-slate-400 block">EtherCAT Closed-Loop</span>
        </div>
      </div>
    </div>
  );
};
