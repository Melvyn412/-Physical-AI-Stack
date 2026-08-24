import React, { useState, useEffect } from 'react';
import { 
  GitFork, Play, Pause, RotateCcw, Download, Copy, Check, 
  Terminal, ShieldCheck, Zap, AlertTriangle, ArrowRight, 
  CheckCircle2, XCircle, Clock, RefreshCw, Layers, Shield
} from 'lucide-react';
import { PlanTier } from '../types';

interface BtStudioProps {
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

type NodeStatus = 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILURE';

interface BtNode {
  id: string;
  name: string;
  type: 'sequence' | 'fallback' | 'action' | 'condition' | 'decorator';
  label: string;
  status: NodeStatus;
  children?: BtNode[];
}

export const BehaviorTreeStudio: React.FC<BtStudioProps> = ({
  onOpenBarrier,
  onNavigateToPricing
}) => {
  const [missionPreset, setMissionPreset] = useState<'warehouse_amr' | 'arm_pick_place' | 'drone_patrol'>('warehouse_amr');
  const [isTicking, setIsTicking] = useState<boolean>(true);
  const [tickIntervalMs, setTickIntervalMs] = useState<number>(800);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'bt_xml' | 'cpp_plugin'>('visual');

  // Dynamic tree structure state
  const [treeState, setTreeState] = useState<BtNode>({
    id: 'root',
    name: 'Main Autonomous Mission',
    type: 'fallback',
    label: 'Fallback (?)',
    status: 'RUNNING',
    children: [
      {
        id: 'safety_check',
        name: 'Battery & E-Stop Safe',
        type: 'sequence',
        label: 'Sequence (→)',
        status: 'SUCCESS',
        children: [
          { id: 'c1', name: 'BatteryLevel > 20%', type: 'condition', label: 'Cond', status: 'SUCCESS' },
          { id: 'c2', name: 'E-Stop Disengaged', type: 'condition', label: 'Cond', status: 'SUCCESS' }
        ]
      },
      {
        id: 'deliver_sequence',
        name: 'Autonomous Delivery Pipeline',
        type: 'sequence',
        label: 'Sequence (→)',
        status: 'RUNNING',
        children: [
          { id: 'a1', name: 'ComputeGlobalPath(Goal)', type: 'action', label: 'Nav2 Action', status: 'SUCCESS' },
          { id: 'a2', name: 'FollowPath(ObstacleAvoidance)', type: 'action', label: 'Nav2 Action', status: 'RUNNING' },
          { id: 'a3', name: 'DockAtPayloadStation()', type: 'action', label: 'Action', status: 'IDLE' }
        ]
      },
      {
        id: 'recovery_branch',
        name: 'Fault Recovery Branch',
        type: 'sequence',
        label: 'Sequence (→)',
        status: 'IDLE',
        children: [
          { id: 'r1', name: 'SpinRecovery(360°)', type: 'action', label: 'Recovery Action', status: 'IDLE' },
          { id: 'r2', name: 'ClearCostmaps()', type: 'action', label: 'Action', status: 'IDLE' }
        ]
      }
    ]
  });

  // Tick simulation loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTicking) {
      timer = setInterval(() => {
        setActiveStep(prev => (prev + 1) % 6);
      }, tickIntervalMs);
    }
    return () => clearInterval(timer);
  }, [isTicking, tickIntervalMs]);

  // Update visual node statuses based on active step
  useEffect(() => {
    setTreeState(prev => {
      const cloned = JSON.parse(JSON.stringify(prev)) as BtNode;
      const pipeline = cloned.children?.[1]?.children;
      const recovery = cloned.children?.[2]?.children;

      if (!pipeline || !recovery) return cloned;

      if (activeStep === 0) {
        pipeline[0].status = 'RUNNING';
        pipeline[1].status = 'IDLE';
        pipeline[2].status = 'IDLE';
        recovery[0].status = 'IDLE';
      } else if (activeStep === 1) {
        pipeline[0].status = 'SUCCESS';
        pipeline[1].status = 'RUNNING';
      } else if (activeStep === 2) {
        pipeline[1].status = 'RUNNING';
      } else if (activeStep === 3) {
        // Simulated temporary obstacle detection / path blocked
        pipeline[1].status = 'FAILURE';
        recovery[0].status = 'RUNNING';
      } else if (activeStep === 4) {
        // Recovery spin clearing obstacles
        recovery[0].status = 'SUCCESS';
        recovery[1].status = 'RUNNING';
      } else if (activeStep === 5) {
        // Re-routed and docked
        recovery[1].status = 'SUCCESS';
        pipeline[1].status = 'SUCCESS';
        pipeline[2].status = 'SUCCESS';
      }

      return cloned;
    });
  }, [activeStep]);

  // BehaviorTree.CPP v4 Standard XML
  const btXmlContent = `<!-- ======================================================== -->
<!-- AIGENESIS.TECH // BehaviorTree.CPP v4 Specification       -->
<!-- Target: ROS 2 Humble / Nav2 BT Navigator Engine          -->
<!-- ======================================================== -->

<root BTCPP_format="4" main_tree_to_execute="MainWarehouseMission">
  <BehaviorTree ID="MainWarehouseMission">
    <Fallback name="AutonomousRootFallback">
      
      <!-- 1. Safety Envelopes -->
      <Sequence name="SafetyVerification">
        <Condition ID="IsBatteryAboveThreshold" min_battery="20.0"/>
        <Condition ID="IsEmergencyStopClear"/>
      </Sequence>

      <!-- 2. Primary Mission Sequence -->
      <Sequence name="DeliveryTaskSequence">
        <Action ID="ComputePathToPose" goal="{target_pose}" path="{planned_path}"/>
        <Action ID="FollowPath" path="{planned_path}" controller_id="FollowPath"/>
        <Action ID="DockAtStation" station_id="STATION_BAY_04"/>
      </Sequence>

      <!-- 3. Dynamic Recovery & Re-Planning -->
      <Sequence name="RecoveryFallback">
        <Action ID="Spin360Recovery" spin_dist="1.57"/>
        <Action ID="ClearEntireCostmap" costmap_name="global_costmap"/>
      </Sequence>

    </Fallback>
  </BehaviorTree>

  <!-- Node Custom Models -->
  <TreeNodesModel>
    <Condition ID="IsBatteryAboveThreshold">
      <input_port name="min_battery" default="20.0"/>
    </Condition>
    <Action ID="DockAtStation">
      <input_port name="station_id"/>
    </Action>
  </TreeNodesModel>
</root>
`;

  // C++ Custom Action Node Template
  const cppBtNode = `// ========================================================
// AIGENESIS.TECH // BehaviorTree.CPP Custom Action Node
// ========================================================

#include <behaviortree_cpp/action_node.h>
#include <rclcpp/rclcpp.hpp>

class DockAtStation : public BT::StatefulActionNode {
public:
    DockAtStation(const std::string& name, const BT::NodeConfig& config)
        : BT::StatefulActionNode(name, config) {}

    static BT::PortsList providedPorts() {
        return { BT::InputPort<std::string>("station_id") };
    }

    BT::NodeStatus onStart() override {
        std::string station;
        if (!getInput("station_id", station)) {
            throw BT::RuntimeError("Missing required input [station_id]");
        }
        RCLCPP_INFO(rclcpp::get_logger("BT"), "Beginning alignment with station: %s", station.c_str());
        return BT::NodeStatus::RUNNING;
    }

    BT::NodeStatus onRunning() override {
        // Check optical IR docking sensors
        bool is_docked = check_docking_latches();
        return is_docked ? BT::NodeStatus::SUCCESS : BT::NodeStatus::RUNNING;
    }

    void onHalted() override {
        RCLCPP_WARN(rclcpp::get_logger("BT"), "Docking aborted by parent tree tick");
    }

private:
    bool check_docking_latches() { return true; }
};
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

  const renderStatusBadge = (status: NodeStatus) => {
    if (status === 'RUNNING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono animate-pulse">
          <Clock className="w-3 h-3" /> RUNNING
        </span>
      );
    }
    if (status === 'SUCCESS') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">
          <CheckCircle2 className="w-3 h-3" /> SUCCESS
        </span>
      );
    }
    if (status === 'FAILURE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono">
          <XCircle className="w-3 h-3" /> FAILURE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono">
        IDLE
      </span>
    );
  };

  return (
    <div className="space-y-8 py-2 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold">
            <GitFork className="w-3.5 h-3.5 text-cyan-400" />
            <span>Autonomous Mission & Decision Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight flex items-center gap-3">
            Behavior Tree (BT.CPP) Mission Studio
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-normal">
              Nav2 BT Navigator
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Visual Behavior Tree engine for autonomous mobile robots and manipulators. Simulate sequence execution, fallback recoveries, condition gates, and export production BehaviorTree.CPP v4 XML.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsTicking(!isTicking)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              isTicking 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isTicking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isTicking ? 'Pause Ticks' : 'Tick Engine'}</span>
          </button>

          <button
            onClick={() => setActiveStep(0)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Mission</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Visual Behavior Tree Execution Canvas (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase">
                  Live Behavior Tree Execution Graph
                </span>
              </div>

              <div className="text-xs text-slate-400">
                Tick Rate: <span className="text-cyan-300 font-bold">{(1000 / tickIntervalMs).toFixed(1)} Hz</span>
              </div>
            </div>

            {/* Visual Behavior Tree Flow Structure */}
            <div className="space-y-4 font-mono">
              
              {/* Root Node */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold text-sm">
                    ?
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Root Fallback: {treeState.name}</div>
                    <div className="text-[10px] text-slate-400">Tries children in order until one succeeds</div>
                  </div>
                </div>
                {renderStatusBadge(treeState.status)}
              </div>

              {/* Child Branches */}
              <div className="pl-6 border-l-2 border-slate-800 space-y-4">
                {treeState.children?.map((branch) => (
                  <div key={branch.id} className="space-y-2">
                    {/* Branch Header */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center text-xs font-bold">
                          →
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-200">{branch.name}</span>
                          <span className="text-[10px] text-slate-500 ml-2">({branch.label})</span>
                        </div>
                      </div>
                      {renderStatusBadge(branch.status)}
                    </div>

                    {/* Leaf Actions / Conditions */}
                    <div className="pl-6 border-l-2 border-slate-800/60 space-y-1.5">
                      {branch.children?.map((leaf) => (
                        <div 
                          key={leaf.id} 
                          className={`p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                            leaf.status === 'RUNNING' 
                              ? 'bg-amber-500/10 border-amber-500/40' 
                              : leaf.status === 'SUCCESS'
                              ? 'bg-emerald-500/10 border-emerald-500/30'
                              : leaf.status === 'FAILURE'
                              ? 'bg-rose-500/10 border-rose-500/40'
                              : 'bg-slate-950/40 border-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                              leaf.type === 'condition' ? 'bg-sky-500/20 text-sky-300' : 'bg-indigo-500/20 text-indigo-300'
                            }`}>
                              {leaf.label}
                            </span>
                            <span className="text-xs text-slate-300">{leaf.name}</span>
                          </div>
                          {renderStatusBadge(leaf.status)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Mission Log */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
              <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800 pb-1">
                <span>Mission Telemetry Event Feed</span>
                <span className="text-emerald-400">Live Tick Flow</span>
              </div>
              <div className="text-cyan-300">
                [Step {activeStep}] {activeStep === 3 ? '⚠️ Obstacle detected in local costmap! Triggering SpinRecovery branch...' : 'Normal execution pipeline active.'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: XML & C++ Exporter (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase">
                  Behavior Tree Exporter
                </h3>
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => setActiveTab('bt_xml')}
                  className={`px-2 py-0.5 rounded ${activeTab === 'bt_xml' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'}`}
                >
                  BT.CPP XML
                </button>
                <button
                  onClick={() => setActiveTab('cpp_plugin')}
                  className={`px-2 py-0.5 rounded ${activeTab === 'cpp_plugin' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'}`}
                >
                  C++ Action Node
                </button>
              </div>
            </div>

            <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs text-slate-300 max-h-72 overflow-y-auto">
              <pre className="text-[11px] leading-relaxed">
                {activeTab === 'bt_xml' ? btXmlContent : cppBtNode}
              </pre>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleCopy(activeTab === 'bt_xml' ? btXmlContent : cppBtNode)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy XML'}</span>
              </button>

              <button
                onClick={() => {
                  const filename = activeTab === 'bt_xml' ? 'main_warehouse_mission.xml' : 'DockAtStationAction.cpp';
                  const content = activeTab === 'bt_xml' ? btXmlContent : cppBtNode;
                  handleDownload(filename, content);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>

          {/* Nav2 BT Integration Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>ROS 2 Nav2 BT Navigator Compatible</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              The exported XML format directly integrates into the ROS 2 Humble / Iron / Rolling <code className="text-cyan-300">nav2_bt_navigator</code> node. It supports standard blackboards, reactive sequences, and fallback error recoveries.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
