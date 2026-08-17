import React, { useState } from 'react';
import { 
  Box, Wrench, Cpu, Code, Download, Copy, Check, Eye, Move3D, 
  Layers, Sparkles, RefreshCw, Sliders
} from 'lucide-react';
import { checkQuota, consumeQuota, getStoredQuota, PLAN_DEFINITIONS } from '../utils/quotaManager';

interface UrdfKinematicsBuilderProps {
  onOpenBarrier?: (barrierInfo: any) => void;
}

export const UrdfKinematicsBuilder: React.FC<UrdfKinematicsBuilderProps> = ({
  onOpenBarrier
}) => {
  const [dof, setDof] = useState<number>(6);
  const [linkLength1, setLinkLength1] = useState<number>(0.45);
  const [linkLength2, setLinkLength2] = useState<number>(0.38);
  const [linkLength3, setLinkLength3] = useState<number>(0.25);
  const [maxTorqueNm, setMaxTorqueNm] = useState<number>(85);
  const [endEffectorTool, setEndEffectorTool] = useState<string>('Parallel Jaw Gripper');
  const [copied, setCopied] = useState<boolean>(false);

  const quota = getStoredQuota();
  const limits = PLAN_DEFINITIONS[quota.plan] || PLAN_DEFINITIONS.developer;

  // Joint angle sliders for live 3D forward kinematics preview
  const [j1Angle, setJ1Angle] = useState<number>(15);
  const [j2Angle, setJ2Angle] = useState<number>(-30);
  const [j3Angle, setJ3Angle] = useState<number>(45);

  // Calculate Forward Kinematics End-Effector (X, Y, Z) in meters
  const rad1 = (j1Angle * Math.PI) / 180;
  const rad2 = (j2Angle * Math.PI) / 180;
  const rad3 = (j3Angle * Math.PI) / 180;

  const endX = (linkLength1 * Math.cos(rad1) + linkLength2 * Math.cos(rad1 + rad2) + linkLength3 * Math.cos(rad1 + rad2 + rad3)).toFixed(3);
  const endY = (linkLength1 * Math.sin(rad1) + linkLength2 * Math.sin(rad1 + rad2) + linkLength3 * Math.sin(rad1 + rad2 + rad3)).toFixed(3);
  const endZ = (0.2 + linkLength1 * Math.sin(rad2) + linkLength2 * Math.sin(rad2 + rad3)).toFixed(3);

  const generateUrdfCode = () => {
    return `<?xml version="1.0" ?>
<!-- AIGENESIS.TECH Custom Generated URDF Kinematic Specification -->
<!-- Degrees of Freedom: ${dof}-DOF -->
<!-- Tool End-Effector: ${endEffectorTool} -->

<robot name="custom_aigenesis_${dof}dof_arm">
  <!-- Base Link -->
  <link name="base_link">
    <visual>
      <geometry><cylinder length="0.2" radius="0.12"/></geometry>
      <material name="dark_slate"><color rgba="0.1 0.12 0.18 1.0"/></material>
    </visual>
  </link>

  <!-- Link 1 (${linkLength1}m) -->
  <joint name="joint_1" type="revolute">
    <parent link="base_link"/>
    <child link="link_1"/>
    <origin xyz="0 0 0.1" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-3.14" upper="3.14" effort="${maxTorqueNm}" velocity="2.5"/>
  </joint>

  <link name="link_1">
    <visual>
      <geometry><box size="0.08 0.08 ${linkLength1}"/></geometry>
      <material name="cyan_metallic"><color rgba="0.0 0.8 0.9 1.0"/></material>
    </visual>
  </link>

  <!-- Link 2 (${linkLength2}m) -->
  <joint name="joint_2" type="revolute">
    <parent link="link_1"/>
    <child link="link_2"/>
    <origin xyz="0 0 ${linkLength1}" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-2.5" upper="2.5" effort="${Math.round(maxTorqueNm * 0.8)}" velocity="3.0"/>
  </joint>

  <link name="link_2">
    <visual>
      <geometry><box size="0.07 0.07 ${linkLength2}"/></geometry>
      <material name="emerald_link"><color rgba="0.1 0.85 0.4 1.0"/></material>
    </visual>
  </link>

  <!-- Tool Joint & End-Effector (${endEffectorTool}) -->
  <joint name="tool_joint" type="fixed">
    <parent link="link_2"/>
    <child link="end_effector"/>
    <origin xyz="0 0 ${linkLength2}" rpy="0 0 0"/>
  </joint>

  <link name="end_effector">
    <visual>
      <geometry><sphere radius="0.06"/></geometry>
      <material name="gold_tool"><color rgba="0.95 0.75 0.2 1.0"/></material>
    </visual>
  </link>
</robot>
`;
  };

  const handleCopy = () => {
    const quotaCheck = checkQuota('export_code');
    if (!quotaCheck.allowed) {
      if (onOpenBarrier) {
        onOpenBarrier({
          title: 'Code Export Limit Reached',
          description: quotaCheck.reason || `You have reached your limit of ${limits.exportsLimit} code exports on the ${limits.name} plan.`,
          currentPlan: quota.plan,
          recommendedPlan: 'pro',
          used: quota.exportsUsed,
          limit: limits.exportsLimit,
          featureName: 'URDF Builder Exporter'
        });
      }
      return;
    }

    consumeQuota('export_code');
    navigator.clipboard.writeText(generateUrdfCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold">
            <Box className="w-3.5 h-3.5 text-emerald-400" />
            <span>3D Kinematics CAD Workbench</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-mono">
            Interactive URDF & Robot Arm Builder
          </h2>
          <p className="text-xs text-slate-400">
            Design custom robotic manipulators, adjust spatial link lengths and joint torque limits, and calculate forward kinematics in real time.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-mono font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20"
        >
          {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'URDF XML Copied!' : 'Export URDF XML'}</span>
        </button>
      </div>

      {/* Main Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Kinematic Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Arm Geometry & Limits</span>
          </h3>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Degrees of Freedom (DOF):</span>
                <span className="text-cyan-400 font-bold">{dof}-DOF</span>
              </div>
              <input
                type="range"
                min="3"
                max="7"
                value={dof}
                onChange={(e) => setDof(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Link 1 Length ($L_1$):</span>
                <span className="text-emerald-400 font-bold">{linkLength1.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.80"
                step="0.05"
                value={linkLength1}
                onChange={(e) => setLinkLength1(Number(e.target.value))}
                className="w-full accent-emerald-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Link 2 Length ($L_2$):</span>
                <span className="text-emerald-400 font-bold">{linkLength2.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.80"
                step="0.05"
                value={linkLength2}
                onChange={(e) => setLinkLength2(Number(e.target.value))}
                className="w-full accent-emerald-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Max Motor Torque Limit:</span>
                <span className="text-amber-400 font-bold">{maxTorqueNm} Nm</span>
              </div>
              <input
                type="range"
                min="10"
                max="350"
                step="5"
                value={maxTorqueNm}
                onChange={(e) => setMaxTorqueNm(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="text-slate-400 text-[10px] block mb-1">End-Effector Tool Payload</label>
              <select
                value={endEffectorTool}
                onChange={(e) => setEndEffectorTool(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="Parallel Jaw Gripper">Parallel Jaw Gripper</option>
                <option value="Micro-Surgical Needle Wrist">Micro-Surgical Needle Wrist</option>
                <option value="Soft Silicone Pneumatic Pod">Soft Silicone Pneumatic Pod</option>
                <option value="Vacuum Suction Array">Vacuum Suction Array</option>
                <option value="Heavy Subsea Hydraulic Claws">Heavy Subsea Hydraulic Claws</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Live Kinematic 3D Visualizer & Forward Kinematics Output */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono text-xs">
            <span className="text-white font-bold flex items-center gap-2">
              <Move3D className="w-4 h-4 text-cyan-400" />
              <span>Forward Kinematics Spatial Viewport</span>
            </span>

            <div className="flex items-center gap-3">
              <span className="text-slate-400">Target Tool:</span>
              <span className="text-cyan-300 font-bold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                {endEffectorTool}
              </span>
            </div>
          </div>

          {/* Interactive Joint Sliders */}
          <div className="grid grid-cols-3 gap-3 font-mono text-xs bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div>
              <span className="text-slate-400 text-[10px] block">Joint 1 Angle: {j1Angle}°</span>
              <input
                type="range"
                min="-90"
                max="90"
                value={j1Angle}
                onChange={(e) => setJ1Angle(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-950 h-1.5 rounded-lg cursor-pointer mt-1"
              />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Joint 2 Angle: {j2Angle}°</span>
              <input
                type="range"
                min="-90"
                max="90"
                value={j2Angle}
                onChange={(e) => setJ2Angle(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-950 h-1.5 rounded-lg cursor-pointer mt-1"
              />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Joint 3 Angle: {j3Angle}°</span>
              <input
                type="range"
                min="-90"
                max="90"
                value={j3Angle}
                onChange={(e) => setJ3Angle(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-950 h-1.5 rounded-lg cursor-pointer mt-1"
              />
            </div>
          </div>

          {/* End-Effector Spatial Coordinates Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-3 gap-4 text-center font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Spatial Position X</span>
              <span className="text-xl font-bold text-cyan-400">{endX} m</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Spatial Position Y</span>
              <span className="text-xl font-bold text-emerald-400">{endY} m</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Spatial Position Z</span>
              <span className="text-xl font-bold text-indigo-400">{endZ} m</span>
            </div>
          </div>

          {/* Generated URDF XML Preview */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-cyan-200 overflow-auto max-h-[180px]">
            <pre>{generateUrdfCode()}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
