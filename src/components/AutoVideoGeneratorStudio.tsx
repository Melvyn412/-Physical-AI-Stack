import React, { useState, useEffect, useRef } from 'react';
import {
  Video, Play, Pause, RotateCcw, Download, Sparkles, CheckCircle2,
  AlertTriangle, ShieldCheck, Zap, Sliders, RefreshCw, Layers, Film,
  Volume2, VolumeX, Eye, ArrowRight, Gauge, Activity, Scissors, Copy, Check,
  Mail, FileText, Send, BookOpen, GraduationCap
} from 'lucide-react';
import { useQuota } from '../hooks/useQuota';

export type DemoScenarioId = 'tactile_slip_fix' | 'coanda_stall_fix' | 'surgical_singularity_fix';

interface SceneStep {
  startSec: number;
  endSec: number;
  phaseLabel: string;
  badgeType: 'problem' | 'analysis' | 'ai_fix' | 'success';
  title: string;
  narrationVoiceover: string;
  subtitle: string;
  metricLabel: string;
  metricValue: string;
}

interface DemoVideoScript {
  id: DemoScenarioId;
  name: string;
  targetDomain: string;
  aspectRatio: '16:9 (Landscape HD)';
  durationSeconds: number;
  steps: SceneStep[];
  headline: string;
  exportFilename: string;
  socialPostCaption: string;
  universityOutreachEmail: {
    subject: string;
    targetDepartments: string;
    emailBody: string;
  };
}

const DEMO_SCRIPTS: Record<DemoScenarioId, DemoVideoScript> = {
  tactile_slip_fix: {
    id: 'tactile_slip_fix',
    name: 'Tactile Slip Reflex: High-Speed Deceleration Recovery',
    targetDomain: 'Industrial Cobots · UR10e & Robotiq 2F-85',
    aspectRatio: '16:9 (Landscape HD)',
    durationSeconds: 12,
    headline: 'Eliminating High-Velocity Part Drops via <3ms Optical Tactile Closed-Loop Control',
    exportFilename: 'AIGENESIS_Tactile_Slip_Rectification_Demo.webm',
    steps: [
      {
        startSec: 0,
        endSec: 3,
        phaseLabel: '01. THE PROBLEM',
        badgeType: 'problem',
        title: 'Emergency Deceleration & Friction Cone Breach',
        narrationVoiceover: 'At 2.4 meters per second squared deceleration, lubricated workpieces slip out of standard grippers.',
        subtitle: '🚨 Lubricated part (μ = 0.22) begins slipping under 2.4 m/s² deceleration...',
        metricLabel: 'Surface Slip Distance',
        metricValue: '14.2 mm (FATAL DROP)',
      },
      {
        startSec: 3,
        endSec: 6,
        phaseLabel: '02. ROOT CAUSE ANALYSIS',
        badgeType: 'analysis',
        title: 'Vision Feedback Latency Bottleneck (>50ms)',
        narrationVoiceover: 'Vision cameras take over 50 milliseconds to react. By then, the workpiece has already dropped.',
        subtitle: '🔍 Standard vision / force feedback latency (55ms) is too slow to stop micro-shear.',
        metricLabel: 'Loop Reaction Latency',
        metricValue: '55.0 ms (Too Slow)',
      },
      {
        startSec: 6,
        endSec: 9,
        phaseLabel: '03. THE AI RECTIFICATION',
        badgeType: 'ai_fix',
        title: '<3ms Closed-Loop Optical Tactile Micro-Governor',
        narrationVoiceover: 'AIGENESIS synthesizes a sub-3 millisecond tactile governor, clamping normal force to 48.5 Newtons.',
        subtitle: '⚡ AIGENESIS engages <3ms closed-loop tactile reflex, clamping force to 48.5 N in 4.2ms.',
        metricLabel: 'Clamped Squeeze Force',
        metricValue: '48.5 N @ 4.2 ms',
      },
      {
        startSec: 9,
        endSec: 12,
        phaseLabel: '04. VERIFIED SUCCESS',
        badgeType: 'success',
        title: '100% Workpiece Retention & Zero Slippage',
        narrationVoiceover: 'Part slip is reduced by 99.1%. The robot arm comes to a complete safe stop with zero drop.',
        subtitle: '✅ Slip reduced to 0.12 mm (-99.1%). Part held securely under emergency stop.',
        metricLabel: 'Final Verified Slip',
        metricValue: '0.12 mm (RECOVERED)',
      },
    ],
    socialPostCaption: `⚡ High-Speed Part Slip Rectification in Robotics:

When industrial cobots decelerate at >2.4 m/s², lubricated sheet-metal parts frequently slip out of standard parallel grippers. Conventional vision or force feedback is far too slow (>50ms reaction time), resulting in dropped parts, ruined workpieces, and factory downtime.

In AIGENESIS, we synthesized and verified a <3ms closed-loop optical tactile micro-slip governor:
• Optical elastomer shear deflection detected in 1.8ms
• Clamping squeeze force dynamically boosted to 48.5 N within 4.2ms
• Part slip reduced by 99.1% (from 14.2 mm fatal drop down to 0.12 mm)

Full physical AI simulation & digital twin: https://aigenesis.tech

#Robotics #PhysicalAI #Automation #Manufacturing #SimToReal`,
    universityOutreachEmail: {
      subject: 'Physical AI Robotics Digital Twin for [University Name] Robotics Lab (14-Day Free Access)',
      targetDepartments: 'Department of Mechanical Engineering, Robotics Institute, Autonomous Systems Labs',
      emailBody: `Dear Professor [Last Name] / Robotics Research Team,

I hope this email finds you well.

I am writing from AIGENESIS (https://aigenesis.tech). We build a physics-grounded robotics simulation and digital-twin verification platform designed to bridge the Sim-to-Real reality gap for physical AI, manipulators, and autonomous systems.

We recently recorded a short demonstration showing how our <3ms closed-loop tactile reflex eliminates high-speed workpiece slip during emergency deceleration on a UR10e / Robotiq 2F-85 setup (video demo attached).

Given your lab’s ongoing research in robotics, manipulation, and control engineering, we would love to support your faculty and graduate researchers with full, unrestricted access to our platform.

We are offering your department a complimentary 14-day zero-risk trial of our Pro Research Tier, which includes:
• 1000 Hz multi-physics simulation (tactile arrays, contact mechanics, and sensor noise)
• Native 1-click export to ROS 2 Humble packages and NVIDIA Isaac Sim 4.2+
• 9 synchronized annotation streams (RGB, depth, segmentation, 6D pose, tactile, wrench)
• Pre-built robotics benchmarks (Coandă fluidics, surgical kinematics, and industrial manipulators)

You can activate your 14-day university access directly at:
https://aigenesis.tech

Would you or one of your lab leads be open to a brief 10-minute walkthrough this week to explore how this could accelerate your team's upcoming papers and hardware experiments?

Best regards,

[Your Name]
Robotics & Academic Partnerships Lead | AIGENESIS
https://aigenesis.tech
[Your Email / Phone]`,
    },
  },
  coanda_stall_fix: {
    id: 'coanda_stall_fix',
    name: 'Coandă Fluidic Boundary Snap Stall Rectification',
    targetDomain: 'Aerospace UAV · Gimballess Thrust Vectoring',
    aspectRatio: '16:9 (Landscape HD)',
    durationSeconds: 12,
    headline: 'Preventing 78% Aerodynamic Vector Collapse During Sudden Crosswind Gusts',
    exportFilename: 'AIGENESIS_Coanda_Fluidic_Stall_Recovery_Demo.webm',
    steps: [
      {
        startSec: 0,
        endSec: 3,
        phaseLabel: '01. THE PROBLEM',
        badgeType: 'problem',
        title: '52-Knot Crosswind Gust Triggers Wall Stall',
        narrationVoiceover: 'During extreme 52-knot crosswinds, the Coandă boundary layer detaches, collapsing thrust torque by 78%.',
        subtitle: '🚨 Sudden 52-knot crosswind gust triggers boundary detachment stall at 24° vector pull.',
        metricLabel: 'Attitude Control Torque',
        metricValue: '-78% (COLLAPSE)',
      },
      {
        startSec: 3,
        endSec: 6,
        phaseLabel: '02. ROOT CAUSE ANALYSIS',
        badgeType: 'analysis',
        title: 'Adverse Boundary Gradient Cliff',
        narrationVoiceover: 'The pressure gradient exceeds the turbulent momentum ratio, breaking the attachment seal.',
        subtitle: '🔍 Adverse pressure gradient breaks the wall jet attachment layer (Newman h/R > 0.052).',
        metricLabel: 'Newman Ratio h/R',
        metricValue: '0.058 (Detached)',
      },
      {
        startSec: 6,
        endSec: 9,
        phaseLabel: '03. THE AI RECTIFICATION',
        badgeType: 'ai_fix',
        title: '350 Hz Pulsed Bleed Phase Modulation',
        narrationVoiceover: 'AIGENESIS injects 350 Hertz pulsed bleed modulation, re-energizing the boundary layer in 8.4 milliseconds.',
        subtitle: '⚡ 350 Hz pulsed pneumatic modulation with 1.2ms phase advance re-attaches wall jet.',
        metricLabel: 'Re-Attachment Speed',
        metricValue: '8.4 ms (Fast Lock)',
      },
      {
        startSec: 9,
        endSec: 12,
        phaseLabel: '04. VERIFIED SUCCESS',
        badgeType: 'success',
        title: 'Full 22° Thrust Vector Continuous Flight',
        narrationVoiceover: 'Thrust vectoring is completely restored with zero attitude divergence. Flight envelope certified.',
        subtitle: '✅ Continuous 22.0° thrust vector restored with zero overshoot. MIL-STD-810H certified.',
        metricLabel: 'Continuous Vector Angle',
        metricValue: '22.0° (LOCKED)',
      },
    ],
    socialPostCaption: `✈️ Aerodynamic Boundary Detachment Stall Solved in Gimballess UAV Control:

Coandă fluidic nozzles eliminate moving mechanical gimbals in UAV thrust vectoring. However, during 50+ knot crosswind gusts, the boundary layer can suddenly snap and detach—collapsing attitude torque by 78% in just 18 milliseconds.

In AIGENESIS, we simulated and verified high-frequency pulsed bleed modulation:
• Wall-jet detachment onset detected via micro-transducer pressure rise
• 350 Hz pulsed pneumatic actuation re-energizes the boundary layer within 8.4ms
• Full 22° deflection restored with zero pitch overshoot

Explore the aerodynamic digital twin: https://aigenesis.tech

#Aerospace #FluidDynamics #UAV #Drones #Simulation #PhysicalAI`,
    universityOutreachEmail: {
      subject: 'Aerospace & Fluidic Simulation Lab Access for [University Name] (14-Day Free Trial)',
      targetDepartments: 'Aerospace Engineering, Fluid Dynamics Labs, UAV Autonomy Groups',
      emailBody: `Dear Professor [Last Name] / Aerospace Research Group,

I hope you are having a productive week.

I am reaching out from AIGENESIS (https://aigenesis.tech). We develop a multi-physics simulation platform tailored for high-speed fluidic thrust vectoring, boundary-layer aerodynamics, and UAV flight control.

We recently generated a short simulation study demonstrating how active 350 Hz pulsed bleed modulation prevents Coandă boundary snap detachment stall during severe 52-knot crosswind gusts (video attached).

We would like to invite your research lab to explore AIGENESIS with a complimentary 14-day zero-risk trial of our Pro Research Tier.

What your lab can run immediately:
• 1000 Hz fluid-structure & pneumatic boundary layer simulation
• Full parametric CAD-to-CFD sweep engine for Coandă collars
• MIL-STD-810H and flight readiness verification export
• Native ROS 2 & C++ controller code generation

You can access your 14-day academic trial here:
https://aigenesis.tech

Could we schedule a quick 10-minute demonstration with your team to see how this can assist your upcoming experimental campaigns or student thesis projects?

Warm regards,

[Your Name]
Aerospace & Academic Partnerships | AIGENESIS
https://aigenesis.tech
[Your Email / Phone]`,
    },
  },
  surgical_singularity_fix: {
    id: 'surgical_singularity_fix',
    name: 'Surgical Arm Wrist Singularity Surge Rectification',
    targetDomain: 'Medical RAMS · 6-DOF Laparoscopic Articulator',
    aspectRatio: '16:9 (Landscape HD)',
    durationSeconds: 12,
    headline: 'Eliminating Runaway 140°/s Wrist Surges Near Anatomical Tissue',
    exportFilename: 'AIGENESIS_Surgical_Singularity_Rectification_Demo.webm',
    steps: [
      {
        startSec: 0,
        endSec: 3,
        phaseLabel: '01. THE PROBLEM',
        badgeType: 'problem',
        title: 'Gimbal Lock Singularity Triggers Velocity Surge',
        narrationVoiceover: 'Passing near the wrist singularity causes runaway joint velocity exceeding 140 degrees per second.',
        subtitle: '🚨 Approaching wrist gimbal lock (θ₄ = 0°) induces runaway joint velocity (>140 deg/s).',
        metricLabel: 'Peak Wrist Velocity',
        metricValue: '142.0 deg/s (HAZARD)',
      },
      {
        startSec: 3,
        endSec: 6,
        phaseLabel: '02. ROOT CAUSE ANALYSIS',
        badgeType: 'analysis',
        title: 'Jacobian Inversion Ill-Conditioning (κ = 148)',
        narrationVoiceover: 'Standard pseudoinverse kinematics blows up as the Jacobian determinant approaches zero.',
        subtitle: '🔍 Standard pseudoinverse IK determinant approaches zero, driving velocity spikes.',
        metricLabel: 'Condition Number (κ)',
        metricValue: '148.0 (Singular Trap)',
      },
      {
        startSec: 6,
        endSec: 9,
        phaseLabel: '03. THE AI RECTIFICATION',
        badgeType: 'ai_fix',
        title: 'Adaptive Damped Least-Squares (DLS) IK',
        narrationVoiceover: 'AIGENESIS applies adaptive Damped Least-Squares damping, capping joint velocities to safe clinical bounds.',
        subtitle: '⚡ AIGENESIS engages Damped Least-Squares (λ = 0.04) clamping velocity <= 18 deg/s.',
        metricLabel: 'Adaptive Damping λ',
        metricValue: 'λ = 0.04 (Active Clamp)',
      },
      {
        startSec: 9,
        endSec: 12,
        phaseLabel: '04. VERIFIED SUCCESS',
        badgeType: 'success',
        title: 'Smooth 16.4°/s Motion with 0.08mm Tool Accuracy',
        narrationVoiceover: 'Singularity smoothly traversed with zero tool deviation. IEC 80601-2-77 surgical safety compliant.',
        subtitle: '✅ Wrist moves smoothly at 16.4 deg/s. Sub-millimeter tool precision preserved.',
        metricLabel: 'Safe Traversed Velocity',
        metricValue: '16.4 deg/s (SAFE)',
      },
    ],
    socialPostCaption: `🩺 Eliminating Surgical Robotic Wrist Singularity Spikes:

In robotic minimally invasive surgery, passing through wrist gimbal lock can trigger uncontrollable joint velocity surges (>140 deg/s), risking organ trauma and emergency system shutdowns.

In AIGENESIS, we verified adaptive Damped Least-Squares (DLS) Inverse Kinematics:
• Jacobian condition number monitored at 1000 Hz
• Adaptive Levenberg-Marquardt damping (λ = 0.04) automatically engages
• Peak joint velocity clamped to a clinically safe 16.4 deg/s with sub-millimeter tool tip accuracy

Full surgical V&V test pack: https://aigenesis.tech

#SurgicalRobotics #MedTech #MedicalDevices #InverseKinematics #Robotics`,
    universityOutreachEmail: {
      subject: 'Medical Robotics & Surgical V&V Digital Twin for [University Name] (14-Day Free Access)',
      targetDepartments: 'Biomedical Engineering, Surgical Robotics Labs, Medical Mechatronics',
      emailBody: `Dear Professor [Last Name] / Medical Robotics Research Group,

I hope this email finds you well.

I am contacting you from AIGENESIS (https://aigenesis.tech). We build digital-twin verification and simulation software specifically configured for robotically assisted surgical systems (RAMS).

We recently produced a short video simulation demonstrating how adaptive Damped Least-Squares inverse kinematics prevents dangerous runaway joint velocity spikes near wrist singularities (attached).

We would love to extend a complimentary 14-day zero-risk trial of our Pro Research Tier to your department and graduate students.

Platform capabilities available to your lab:
• Remote-Centre-of-Motion (RCM) fulcrum constraint auditing (IEC 80601-2-77)
• Viscoelastic organ contact mechanics and puncture snap-through modeling
• Automated Design History File (DHF) traceability mapped to FDA 21 CFR 820.30
• 6 standard surgical procedure templates (camera navigation, suturing, knot-tying)

You can activate your 14-day trial anytime at:
https://aigenesis.tech

Would you or one of your researchers be available for a brief 10-minute demo to see how this can support your upcoming grant applications and publications?

Best regards,

[Your Name]
Medical Robotics & Academic Relations | AIGENESIS
https://aigenesis.tech
[Your Email / Phone]`,
    },
  },
};

export const AutoVideoGeneratorStudio: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<DemoScenarioId>('tactile_slip_fix');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [isVoiceoverEnabled, setIsVoiceoverEnabled] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [activeCompanionTab, setActiveCompanionTab] = useState<'video_text' | 'university_email'>('video_text');
  const [copiedSection, setCopiedSection] = useState<'video_text' | 'university_email' | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const lastSpokenStepIndex = useRef<number>(-1);

  const script = DEMO_SCRIPTS[selectedScenarioId];

  // Determine current active step based on time
  const currentStepIndex = Math.min(
    Math.floor((currentTimeSec / script.durationSeconds) * script.steps.length),
    script.steps.length - 1
  );
  const currentStep = script.steps[currentStepIndex];

  // Browser Web Speech API Voiceover narration
  useEffect(() => {
    if (!isVoiceoverEnabled || !isPlaying) return;

    if (currentStepIndex !== lastSpokenStepIndex.current) {
      lastSpokenStepIndex.current = currentStepIndex;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop prior narration
        const utterance = new SpeechSynthesisUtterance(currentStep.narrationVoiceover);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [currentStepIndex, isVoiceoverEnabled, isPlaying, currentStep]);

  // Main 60 FPS Canvas Video Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now() - currentTimeSec * 1000;

    const render = (now: number) => {
      let elapsedSec = (now - startTime) / 1000;
      if (elapsedSec >= script.durationSeconds) {
        elapsedSec = 0;
        startTime = now;
        lastSpokenStepIndex.current = -1;
      }

      if (isPlaying) {
        setCurrentTimeSec(elapsedSec);
      }

      const w = canvas.width;
      const h = canvas.height;
      const progress = elapsedSec / script.durationSeconds;
      const activeStep = script.steps.find(s => elapsedSec >= s.startSec && elapsedSec < s.endSec) || script.steps[0];
      const isProblemPhase = activeStep.badgeType === 'problem' || activeStep.badgeType === 'analysis';

      // 1. Cinema Dark Gradient Background
      const bgGradient = ctx.createLinearGradient(0, 0, w, h);
      bgGradient.addColorStop(0, '#090d16');
      bgGradient.addColorStop(1, '#020617');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, w, h);

      // 2. High-Tech Background Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 3. Top Header Brand Bar
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, 56);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('AIGENESIS.TECH · PHYSICAL AI VERIFICATION', 24, 34);

      // Status pill badge
      const badgeColor = activeStep.badgeType === 'problem' ? '#f43f5e' : activeStep.badgeType === 'analysis' ? '#fbbf24' : activeStep.badgeType === 'ai_fix' ? '#06b6d4' : '#10b981';
      ctx.fillStyle = badgeColor;
      ctx.fillRect(w - 220, 16, 196, 26);
      ctx.fillStyle = '#090d16';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(activeStep.phaseLabel, w - 204, 33);

      // 4. ANIMATED PHYSICAL 2D VISUALIZATION
      // SCENARIO 1: GRIPPER SLIP RECTIFICATION
      if (selectedScenarioId === 'tactile_slip_fix') {
        const baseX = 180;
        const baseY = 290;
        const link1 = 140;
        const link2 = 110;

        const theta1 = -Math.PI / 4 + Math.sin(elapsedSec * 2.2) * 0.22;
        const theta2 = Math.PI / 6 + Math.cos(elapsedSec * 2.2) * 0.32;

        const elbowX = baseX + Math.cos(theta1) * link1;
        const elbowY = baseY + Math.sin(theta1) * link1;
        const wristX = elbowX + Math.cos(theta2) * link2;
        const wristY = elbowY + Math.sin(theta2) * link2;

        // Robotic Arm links
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(elbowX, elbowY);
        ctx.lineTo(wristX, wristY);
        ctx.stroke();

        // Arm joints
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(baseX, baseY, 14, 0, Math.PI * 2);
        ctx.arc(elbowX, elbowY, 10, 0, Math.PI * 2);
        ctx.arc(wristX, wristY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Gripper fingers
        ctx.fillStyle = '#64748b';
        ctx.fillRect(wristX - 8, wristY - 26, 18, 8);
        ctx.fillRect(wristX - 8, wristY + 18, 18, 8);

        // Workpiece part (drops in problem phase, locked in solution phase)
        let partDropY = 0;
        let partDropX = 0;
        let partAngle = 0;

        if (isProblemPhase && elapsedSec > 1.8) {
          const t = elapsedSec - 1.8;
          partDropY = Math.min(t * t * 180, 160);
          partDropX = t * 45;
          partAngle = t * 1.2;
        }

        ctx.save();
        ctx.translate(wristX + partDropX, wristY + partDropY);
        ctx.rotate(partAngle);
        ctx.fillStyle = isProblemPhase ? (elapsedSec > 1.8 ? '#f43f5e' : '#fbbf24') : '#10b981';
        ctx.fillRect(-15, -18, 30, 36);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-15, -18, 30, 36);
        ctx.restore();

        // Tactile force waves in AI fix phase
        if (!isProblemPhase) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(wristX, wristY - 20, 12, 0, Math.PI);
          ctx.arc(wristX, wristY + 20, 12, Math.PI, Math.PI * 2);
          ctx.stroke();
        }
      }

      // SCENARIO 2: COANDA FLUIDIC STALL
      else if (selectedScenarioId === 'coanda_stall_fix') {
        const nozX = 220;
        const nozY = 220;

        // Nozzle block
        ctx.fillStyle = '#475569';
        ctx.fillRect(nozX - 110, nozY - 45, 110, 90);

        // Curved Coanda wall
        ctx.beginPath();
        ctx.arc(nozX, nozY, 45, -Math.PI / 2, Math.PI / 2);
        ctx.fillStyle = '#64748b';
        ctx.fill();

        // Thrust stream
        ctx.lineWidth = 16;
        ctx.lineCap = 'round';

        if (isProblemPhase) {
          // Detached stall flow
          ctx.strokeStyle = '#f43f5e';
          ctx.beginPath();
          ctx.moveTo(nozX, nozY - 38);
          ctx.lineTo(nozX + 220, nozY - 50);
          ctx.stroke();
        } else {
          // Re-attached curved flow
          ctx.strokeStyle = '#06b6d4';
          ctx.beginPath();
          ctx.moveTo(nozX, nozY - 38);
          ctx.bezierCurveTo(nozX + 80, nozY - 25, nozX + 130, nozY + 70, nozX + 190, nozY + 95);
          ctx.stroke();
        }
      }

      // SCENARIO 3: SURGICAL SINGULARITY
      else {
        const shaftX = 240;
        const shaftY = 130;

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(shaftX, shaftY);
        ctx.lineTo(shaftX, shaftY + 150);
        ctx.stroke();

        const wristJitter = isProblemPhase
          ? Math.sin(elapsedSec * 16.0) * 1.5
          : Math.sin(elapsedSec * 2.0) * 0.35;

        const tipX = shaftX + Math.sin(wristJitter) * 50;
        const tipY = shaftY + 150 + Math.cos(wristJitter) * 50;

        ctx.strokeStyle = isProblemPhase ? '#f43f5e' : '#10b981';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(shaftX, shaftY + 150);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();
      }

      // 5. On-Screen Live Telemetry HUD Card (Right side)
      const cardX = w - 320;
      const cardY = 80;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.fillRect(cardX, cardY, 296, 170);
      ctx.strokeRect(cardX, cardY, 296, 170);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText('DIAGNOSTIC TELEMETRY STREAM', cardX + 16, cardY + 24);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(activeStep.title, cardX + 16, cardY + 48, 260);

      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText(activeStep.metricLabel.toUpperCase(), cardX + 16, cardY + 95);

      ctx.fillStyle = isProblemPhase ? '#f43f5e' : '#10b981';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(activeStep.metricValue, cardX + 16, cardY + 120);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      ctx.fillText(`TIME: ${elapsedSec.toFixed(1)}s / ${script.durationSeconds}s`, cardX + 16, cardY + 150);

      // 6. Cinematic Lower Third Subtitle Bar
      ctx.fillStyle = 'rgba(2, 6, 23, 0.95)';
      ctx.fillRect(24, h - 86, w - 48, 56);
      ctx.strokeStyle = badgeColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(24, h - 86, w - 48, 56);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(activeStep.subtitle, 42, h - 52);

      // 7. Timeline Progress Bar
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, h - 6, w, 6);
      ctx.fillStyle = badgeColor;
      ctx.fillRect(0, h - 6, w * progress, 6);

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, selectedScenarioId, script]);

  // One-Click Video Recording & Download (.WebM HD)
  const handleExportVideo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    setExportProgress(0);
    recordedChunksRef.current = [];

    // Capture canvas stream at 60 FPS
    const stream = canvas.captureStream(60);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 5000000, // 5 Mbps High Quality
    });

    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = script.exportFilename;
      a.click();
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setNotification(`Successfully produced and downloaded "${script.exportFilename}"!`);
      setTimeout(() => setNotification(null), 4500);
    };

    mediaRecorder.start();

    // Reset video to start
    setCurrentTimeSec(0);
    setIsPlaying(true);

    // Track recording progress over script.durationSeconds
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 0.5;
      const pct = Math.min(Math.round((elapsed / script.durationSeconds) * 100), 100);
      setExportProgress(pct);

      if (elapsed >= script.durationSeconds) {
        clearInterval(interval);
        mediaRecorder.stop();
      }
    }, 500);
  };

  return (
    <div className="space-y-8 animate-fadeIn font-mono pb-16">
      {/* Studio Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-400">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI AUTOMATED VIDEO PRODUCTION ENGINE</span>
            </span>
            <span>·</span>
            <span className="text-emerald-400">Zero Video Skills Needed</span>
            <span>·</span>
            <span className="text-amber-300">Ready-Made Narration, Script & Render</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Automated Video Production Studio
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl font-sans">
            You don't need any editing software or video confidence! We script, simulate, narrate, and render high-impact 60 FPS robotics demonstration videos for you automatically—complete with animated problem-solving phases, live telemetry HUDs, burned-in subtitles, and 1-click video download.
          </p>
        </div>

        {/* 1-Click Produce & Download Video Button */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setIsVoiceoverEnabled(!isVoiceoverEnabled)}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isVoiceoverEnabled
                ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            {isVoiceoverEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span>Voiceover: {isVoiceoverEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            id="btn-produce-video-download"
            onClick={handleExportVideo}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition cursor-pointer hover:scale-[1.02] disabled:opacity-60"
          >
            <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? `Rendering Video (${exportProgress}%)...` : 'Produce & Download Video (.WebM)'}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Scenario Picker Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(DEMO_SCRIPTS) as DemoScenarioId[]).map((id) => {
          const item = DEMO_SCRIPTS[id];
          const isSelected = selectedScenarioId === id;
          return (
            <div
              key={id}
              onClick={() => {
                setSelectedScenarioId(id);
                setCurrentTimeSec(0);
                lastSpokenStepIndex.current = -1;
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-950 border-cyan-500 shadow-xl shadow-cyan-500/10'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block">{item.targetDomain}</span>
                <h3 className="text-sm font-bold text-white font-mono leading-snug">{item.name}</h3>
                <p className="text-xs text-slate-400 font-sans">{item.headline}</p>
              </div>

              <div className="pt-3 border-t border-slate-900 mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Duration: <strong className="text-slate-300">{item.durationSeconds}s</strong></span>
                <span className="text-cyan-400 font-bold">{item.aspectRatio}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN VIDEO MONITOR & SCRIPT TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 60 FPS Real-Time Rendered Video Screen */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase font-mono">{script.targetDomain}</span>
              <h3 className="text-base font-bold text-white font-mono mt-0.5">{script.name}</h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                {currentTimeSec.toFixed(1)}s / {script.durationSeconds}s
              </span>
            </div>
          </div>

          {/* Canvas Video Frame */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              className="w-full h-auto block"
            />

            {/* In-Frame Playback Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white hover:text-cyan-400 transition cursor-pointer shadow-md"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>
                <button
                  onClick={() => {
                    setCurrentTimeSec(0);
                    lastSpokenStepIndex.current = -1;
                  }}
                  className="p-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer shadow-md"
                  title="Restart Video"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-400 font-mono px-2 py-1 rounded bg-slate-950/80 border border-slate-800">
                  {isPlaying ? 'Playing' : 'Paused'}
                </span>
              </div>

              {/* Progress step badge */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-950/90 border border-slate-800 text-slate-300">
                  Scene {currentStepIndex + 1} of {script.steps.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pre-Produced Script & Narration Storyboard */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white font-mono">Automated 4-Act Storyboard</h4>
              <span className="text-[10px] text-slate-400 font-sans">Synced Narration & Visual Timing</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Auto-Produced
            </span>
          </div>

          {/* Script Step Cards */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {script.steps.map((step, idx) => {
              const isActive = idx === currentStepIndex;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentTimeSec(step.startSec);
                    lastSpokenStepIndex.current = -1;
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-950 border-cyan-500 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold uppercase ${
                      step.badgeType === 'problem' ? 'text-rose-400' : step.badgeType === 'analysis' ? 'text-amber-400' : step.badgeType === 'ai_fix' ? 'text-cyan-400' : 'text-emerald-400'
                    }`}>
                      {step.phaseLabel} ({step.startSec}s–{step.endSec}s)
                    </span>
                    {isActive && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                      </span>
                    )}
                  </div>

                  <h5 className="text-xs font-bold text-white font-mono mt-1">{step.title}</h5>
                  <p className="text-[11px] text-slate-300 font-sans mt-1 leading-relaxed">{step.narrationVoiceover}</p>

                  <div className="mt-2 pt-1.5 border-t border-slate-900 flex justify-between text-[10px] font-mono">
                    <span className="text-slate-500">{step.metricLabel}</span>
                    <strong className={step.badgeType === 'problem' ? 'text-rose-400' : 'text-emerald-400'}>{step.metricValue}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 1-Click Action Button */}
          <button
            onClick={handleExportVideo}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-mono font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? `Rendering (${exportProgress}%)...` : 'Produce & Download Video File (.WebM)'}</span>
          </button>
        </div>
      </div>

      {/* COMPANION TEXT & UNIVERSITY OUTREACH EMAIL SECTION */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>ACCOMPANYING COPY & OUTREACH PACK</span>
            </div>
            <h3 className="text-lg font-bold text-white font-mono">
              Ready-to-Use Video Text & University Cold Outreach Email
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Copy pre-drafted social copy to accompany your downloaded video, or use the academic outreach email template to pitch robotics research labs with your 14-day free trial.
            </p>
          </div>

          {/* Sub-Tabs: Video Text vs University Outreach */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveCompanionTab('video_text')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                activeCompanionTab === 'video_text'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Video Caption Text</span>
            </button>
            <button
              onClick={() => setActiveCompanionTab('university_email')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                activeCompanionTab === 'university_email'
                  ? 'bg-purple-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>University Cold Email (14-Day Trial)</span>
            </button>
          </div>
        </div>

        {/* TAB 1: SOCIAL VIDEO CAPTION TEXT */}
        {activeCompanionTab === 'video_text' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase font-mono">Video Caption & Post Copy</span>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Paste this caption alongside your downloaded video file ({script.exportFilename}) on LinkedIn, YouTube, Twitter/X, or your portfolio.
                </p>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(script.socialPostCaption);
                  setCopiedSection('video_text');
                  setNotification('Copied video caption text to clipboard!');
                  setTimeout(() => {
                    setNotification(null);
                    setCopiedSection(null);
                  }, 3500);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold transition cursor-pointer shrink-0"
              >
                {copiedSection === 'video_text' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSection === 'video_text' ? 'Copied to Clipboard!' : 'Copy Video Caption'}</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed select-all">
              {script.socialPostCaption}
            </div>
          </div>
        )}

        {/* TAB 2: UNIVERSITY COLD OUTREACH EMAIL */}
        {activeCompanionTab === 'university_email' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase font-mono">Academic Cold Outreach Template</span>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Target: {script.universityOutreachEmail.targetDepartments}
                </p>
              </div>

              <button
                onClick={() => {
                  const fullEmail = `Subject: ${script.universityOutreachEmail.subject}\n\n${script.universityOutreachEmail.emailBody}`;
                  navigator.clipboard.writeText(fullEmail);
                  setCopiedSection('university_email');
                  setNotification('Copied complete university cold outreach email (with subject line) to clipboard!');
                  setTimeout(() => {
                    setNotification(null);
                    setCopiedSection(null);
                  }, 3500);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-purple-300 text-xs font-mono font-bold transition cursor-pointer shrink-0"
              >
                {copiedSection === 'university_email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSection === 'university_email' ? 'Copied Entire Email!' : 'Copy Email & Subject'}</span>
              </button>
            </div>

            {/* Email Subject Line Box */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="truncate pr-2">
                <span className="text-slate-500">Subject: </span>
                <strong className="text-white">{script.universityOutreachEmail.subject}</strong>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(script.universityOutreachEmail.subject);
                  setNotification('Copied email subject line to clipboard!');
                  setTimeout(() => setNotification(null), 3000);
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition cursor-pointer shrink-0"
              >
                Copy Subject
              </button>
            </div>

            {/* Email Body Box */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed select-all">
              {script.universityOutreachEmail.emailBody}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
