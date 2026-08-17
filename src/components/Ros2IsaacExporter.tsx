import React, { useState } from 'react';
import { 
  Code, Download, Copy, Check, Terminal, FileCode, Cpu, Box, 
  Sparkles, Layers, ArrowRight, ShieldCheck, Share2, AlertTriangle, Lock
} from 'lucide-react';
import { ObjectiveScenario } from '../types';
import { PRESET_SCENARIOS } from '../data/scenariosData';
import { checkQuota, consumeQuota, getStoredQuota, PLAN_DEFINITIONS } from '../utils/quotaManager';

interface Ros2IsaacExporterProps {
  currentScenario?: ObjectiveScenario;
  onOpenBarrier?: (barrierInfo: any) => void;
  onNavigateToPricing?: () => void;
}

export const Ros2IsaacExporter: React.FC<Ros2IsaacExporterProps> = ({
  currentScenario = PRESET_SCENARIOS[0],
  onOpenBarrier,
  onNavigateToPricing
}) => {
  const [activeFormat, setActiveFormat] = useState<'ros2_python' | 'ros2_cpp' | 'urdf_xml' | 'isaac_sim'>('ros2_python');
  const [copied, setCopied] = useState<boolean>(false);
  const [robotTarget, setRobotTarget] = useState<string>(currentScenario.embodiment);

  const quota = getStoredQuota();
  const limits = PLAN_DEFINITIONS[quota.plan] || PLAN_DEFINITIONS.developer;

  const scenarioNameClean = currentScenario.id.replace(/-/g, '_');

/*!
 * AIGENESIS.TECH Code Exporter
 */

  const generateRos2Python = () => {
    return `#!/usr/bin/env font_mono python3
"""
AIGENESIS.TECH Generated ROS 2 Node
Target Mission: ${currentScenario.title}
Embodiment: ${robotTarget}
Environment: ${currentScenario.environment}
Control Frequency: ${currentScenario.defaultRobotics.controlFrequencyHz} Hz
"""

import rclpy
from rclpy.node import Node
from trajectory_msgs.msg import JointTrajectory, JointTrajectoryPoint
from sensor_msgs.msg import JointState
from std_msgs.msg import Float64MultiArray, Header
import time

class AigenesisPhysicalExecutor(Node):
    def __init__(self):
        super().__init__('${scenarioNameClean}_physical_executor')
        
        # Publishers for 1000Hz motor trajectory & System 2 safety override
        self.trajectory_pub = self.create_publisher(JointTrajectory, '/${scenarioNameClean}/joint_trajectory_controller/joint_trajectory', 10)
        self.torque_pub = self.create_publisher(Float64MultiArray, '/${scenarioNameClean}/target_torques_nm', 10)
        
        # Subscriptions for Multimodal Perception & Force Feedback
        self.create_subscription(JointState, '/joint_states', self.joint_state_callback, 10)
        
        # Control Loop Timer (${currentScenario.defaultRobotics.controlFrequencyHz} Hz)
        self.timer_period = 1.0 / ${currentScenario.defaultRobotics.controlFrequencyHz}
        self.timer = self.create_timer(self.timer_period, self.control_loop_callback)
        
        # Target Torque Limits (Nm) from AIGENESIS.TECH Reasoning Layer
        self.target_torques = ${JSON.stringify(currentScenario.defaultRobotics.targetTorqueNm)}
        self.grip_force_n = ${currentScenario.defaultRobotics.gripForceN}
        
        self.get_logger().info('AIGENESIS.TECH ROS 2 Physical Controller initialized for ${currentScenario.title}')

    def joint_state_callback(self, msg: JointState):
        # Real-time state feedback verification
        pass

    def control_loop_callback(self):
        # Publish closed-loop motor trajectory point
        msg = JointTrajectory()
        msg.header = Header()
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.joint_names = ['joint_1', 'joint_2', 'joint_3', 'joint_4', 'joint_5', 'joint_6', 'wrist_roll']
        
        point = JointTrajectoryPoint()
        point.positions = [0.12, -0.45, 0.88, 0.05, 0.32, -0.10, 0.00]
        point.velocities = [0.01, 0.02, 0.00, 0.01, 0.00, 0.00, 0.00]
        point.effort = self.target_torques
        point.time_from_start.nanosec = int(self.timer_period * 1e9)
        
        msg.points.append(point)
        self.trajectory_pub.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = AigenesisPhysicalExecutor()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
`;
  };

  const generateRos2Cpp = () => {
    return `// AIGENESIS.TECH Generated ROS 2 C++ High-Frequency Controller
// Target Mission: ${currentScenario.title}
// Control Frequency: ${currentScenario.defaultRobotics.controlFrequencyHz} Hz

#include <chrono>
#include <memory>
#include <vector>
#include "rclcpp/rclcpp.hpp"
#include "trajectory_msgs/msg/joint_trajectory.hpp"
#include "std_msgs/msg/float64_multi_array.hpp"

using namespace std::chrono_literals;

class AigenesisCppController : public rclcpp::Node {
public:
  AigenesisCppController() : Node("${scenarioNameClean}_cpp_controller") {
    publisher_ = this->create_publisher<trajectory_msgs::msg::JointTrajectory>(
      "/${scenarioNameClean}/joint_trajectory", 10);
    
    // Timer frequency set to ${currentScenario.defaultRobotics.controlFrequencyHz} Hz
    timer_ = this->create_wall_timer(
      ${(1000 / currentScenario.defaultRobotics.controlFrequencyHz).toFixed(2)}ms,
      std::bind(&AigenesisCppController::timer_callback, this));
      
    RCLCPP_INFO(this->get_logger(), "C++ Physical Controller Active for ${currentScenario.title}");
  }

private:
  void timer_callback() {
    auto message = trajectory_msgs::msg::JointTrajectory();
    message.header.stamp = this->now();
    message.joint_names = {"j1", "j2", "j3", "j4", "j5", "j6", "j7"};
    
    trajectory_msgs::msg::JointTrajectoryPoint point;
    point.effort = {${currentScenario.defaultRobotics.targetTorqueNm.join(', ')}};
    point.positions = {0.0, 0.25, -0.5, 0.1, 0.0, 0.0, 0.0};
    
    message.points.push_back(point);
    publisher_->publish(message);
  }

  rclcpp::Publisher<trajectory_msgs::msg::JointTrajectory>::SharedPtr publisher_;
  rclcpp::TimerBase::SharedPtr timer_;
};

int main(int argc, char * argv[]) {
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<AigenesisCppController>());
  rclcpp::shutdown();
  return 0;
}
`;
  };

  const generateUrdfXml = () => {
    return `<?xml version="1.0" ?>
<!-- AIGENESIS.TECH URDF Spatial Kinematic Manifest -->
<!-- Robot Target: ${robotTarget} -->
<!-- Scenario: ${currentScenario.title} -->

<robot name="${scenarioNameClean}_robot">
  <link name="base_link">
    <visual>
      <geometry>
        <cylinder length="0.2" radius="0.15"/>
      </geometry>
      <material name="dark_gray">
        <color rgba="0.2 0.2 0.25 1.0"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder length="0.2" radius="0.15"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="12.5"/>
      <inertia ixx="0.1" ixy="0.0" ixz="0.0" iyy="0.1" iyz="0.0" izz="0.15"/>
    </inertial>
  </link>

  <joint name="joint_1" type="revolute">
    <parent link="base_link"/>
    <child link="link_1"/>
    <origin xyz="0 0 0.1" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-3.14" upper="3.14" effort="${currentScenario.defaultRobotics.targetTorqueNm[0] || 100}" velocity="2.5"/>
  </joint>

  <link name="link_1">
    <visual>
      <geometry>
        <box size="0.1 0.1 0.4"/>
      </geometry>
      <material name="cyan_metallic">
        <color rgba="0.0 0.8 0.9 1.0"/>
      </material>
    </visual>
  </link>

  <joint name="end_effector_joint" type="fixed">
    <parent link="link_1"/>
    <child link="end_effector_tool"/>
    <origin xyz="0 0 0.4" rpy="0 0 0"/>
  </joint>

  <link name="end_effector_tool">
    <visual>
      <geometry>
        <sphere radius="0.05"/>
      </geometry>
      <material name="emerald_active">
        <color rgba="0.1 0.9 0.4 1.0"/>
      </material>
    </visual>
  </link>
</robot>
`;
  };

  const generateIsaacSim = () => {
    return `# AIGENESIS.TECH NVIDIA Isaac Sim / Omniverse Python Script
# Goal Target: ${currentScenario.title}
# Environment USD: ${currentScenario.environment}

import omni.isaac.core as isaac
from omni.isaac.core.robots import Robot
from omni.isaac.core.utils.stage import add_reference_to_stage
import numpy as np

def setup_aigenesis_physical_simulation():
    # 1. Initialize Isaac Sim World
    world = isaac.World(stage_units_in_meters=1.0)
    world.scene.add_default_ground_plane()

    # 2. Add Robot USD Spatial Asset
    usd_path = "omniverse://localhost/NVIDIA/Assets/Robots/${scenarioNameClean}.usd"
    add_reference_to_stage(usd_path=usd_path, prim_path="/World/AigenesisRobot")

    aigenesis_robot = world.scene.add(
        Robot(prim_path="/World/AigenesisRobot", name="${scenarioNameClean}_robot")
    )

    # 3. Apply Target Torques & Control Loop (${currentScenario.defaultRobotics.controlFrequencyHz} Hz)
    target_torques = np.array(${JSON.stringify(currentScenario.defaultRobotics.targetTorqueNm)})
    aigenesis_robot.get_articulation_controller().set_effort_modes("force")

    world.reset()
    print("AIGENESIS.TECH NVIDIA Isaac Sim Pipeline Ready. Running Physics Loop...")

    for i in range(1000):
        world.step(render=True)
        aigenesis_robot.get_articulation_controller().apply_action(
            isaac.utils.types.ArticulationAction(joint_efforts=target_torques)
        )

if __name__ == "__main__":
    setup_aigenesis_physical_simulation()
`;
  };

  const getCode = () => {
    switch (activeFormat) {
      case 'ros2_python': return generateRos2Python();
      case 'ros2_cpp': return generateRos2Cpp();
      case 'urdf_xml': return generateUrdfXml();
      case 'isaac_sim': return generateIsaacSim();
      default: return generateRos2Python();
    }
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
          featureName: 'Code Exporter'
        });
      }
      return;
    }

    consumeQuota('export_code');
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
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
          featureName: 'Code Exporter'
        });
      }
      return;
    }

    consumeQuota('export_code');
    const code = getCode();
    let filename = `${scenarioNameClean}_node.py`;
    if (activeFormat === 'ros2_cpp') filename = `${scenarioNameClean}_node.cpp`;
    if (activeFormat === 'urdf_xml') filename = `${scenarioNameClean}.urdf`;
    if (activeFormat === 'isaac_sim') filename = `${scenarioNameClean}_isaac_sim.py`;

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold">
            <Terminal className="w-3.5 h-3.5" />
            <span>Hardware Export Bridge</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-mono">
            ROS 2 & NVIDIA Isaac Sim Code Exporter
          </h2>
          <p className="text-xs text-slate-400">
            Export synthesized 5-layer physical execution plans directly into native robotics middleware and simulator scripts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono font-semibold transition-all border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 rounded-xl text-xs font-mono font-extrabold transition-all shadow-md shadow-cyan-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Download Script</span>
          </button>
        </div>
      </div>

      {/* Target Mission & Format Selector Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Target Config */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Export Configuration</span>
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 text-[10px] block mb-1">Target Scenario</label>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold truncate">
                {currentScenario.title}
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-[10px] block mb-1">Target Robot Embodiment</label>
              <input
                type="text"
                value={robotTarget}
                onChange={(e) => setRobotTarget(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-500 block uppercase">Embedded Parameters</span>
              <div className="flex justify-between text-slate-300">
                <span>Control Freq:</span>
                <span className="text-emerald-400 font-bold">{currentScenario.defaultRobotics.controlFrequencyHz} Hz</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Target Grip Force:</span>
                <span className="text-cyan-400 font-bold">{currentScenario.defaultRobotics.gripForceN} N</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Code Tabs & Viewer */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col">
          {/* Format Selection Buttons */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveFormat('ros2_python')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                activeFormat === 'ros2_python'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>ROS 2 Python (rclpy)</span>
            </button>

            <button
              onClick={() => setActiveFormat('ros2_cpp')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                activeFormat === 'ros2_cpp'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>ROS 2 C++ Node</span>
            </button>

            <button
              onClick={() => setActiveFormat('urdf_xml')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                activeFormat === 'urdf_xml'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>URDF XML Kinematics</span>
            </button>

            <button
              onClick={() => setActiveFormat('isaac_sim')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                activeFormat === 'isaac_sim'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>NVIDIA Isaac Sim (Python)</span>
            </button>
          </div>

          {/* Code Viewer Container */}
          <div className="relative flex-1 bg-slate-950 border border-slate-800/80 rounded-2xl p-4 overflow-auto font-mono text-xs text-cyan-200 leading-relaxed max-h-[500px]">
            <pre>{getCode()}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
