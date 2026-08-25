import React, { useState, useEffect } from 'react';
import { 
  Bot, Users, Network, Activity, Zap, Shield, Sparkles, RefreshCw, 
  Layers, ChevronRight, CheckCircle2, AlertTriangle, Radio, Lock, Download, Crown
} from 'lucide-react';
import { useQuota } from '../hooks/useQuota';
import { PLAN_DEFINITIONS } from '../utils/quotaManager';

interface SwarmSandboxProps {
  onOpenBarrier?: (barrierInfo: any) => void;
  onNavigateToPricing?: () => void;
}

export const SwarmSandbox: React.FC<SwarmSandboxProps> = ({
  onOpenBarrier,
  onNavigateToPricing
}) => {
  const { quota, limits } = useQuota();
  const isTeamTierOrAbove = quota.plan === 'team' || quota.plan === 'enterprise';

  const [agentCount, setAgentCount] = useState<number>(5);
  const [topology, setTopology] = useState<'mesh' | 'star' | 'decentralized'>('mesh');
  const [latencyMs, setLatencyMs] = useState<number>(12);
  const [obstaclesSpawned, setObstaclesSpawned] = useState<boolean>(true);
  const [consensusScore, setConsensusScore] = useState<number>(0.994);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Dynamic agent states
  const [agents, setAgents] = useState<{ id: number; name: string; status: string; role: string; battery: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const roles = ['Perception Lead', 'Path Optimizer', 'Force Balancer', 'Safety Verifier', 'Actuator Guard', 'Tactile Monitor', 'Acoustic Scan', 'Swarm Router'];
    const newAgents = Array.from({ length: agentCount }, (_, i) => ({
      id: i + 1,
      name: `Agent Alpha-${i + 1}`,
      status: 'SYNCHRONIZED',
      role: roles[i % roles.length],
      battery: Math.floor(88 + Math.random() * 12),
      x: 15 + (i * 70) / Math.max(1, agentCount - 1),
      y: 25 + (i % 2 === 0 ? 30 : -5)
    }));
    setAgents(newAgents);
  }, [agentCount]);

  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setConsensusScore(prev => {
        const jitter = (Math.random() - 0.5) * 0.006;
        return Math.min(0.999, Math.max(0.950, prev + jitter));
      });

      setAgents(prev => prev.map(a => ({
        ...a,
        x: Math.min(85, Math.max(15, a.x + (Math.random() - 0.5) * 3)),
        y: Math.min(75, Math.max(20, a.y + (Math.random() - 0.5) * 3))
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleAgentCountChange = (newVal: number) => {
    if (newVal > 8 && !isTeamTierOrAbove) {
      if (onOpenBarrier) {
        onOpenBarrier({
          title: 'High-Density Swarm Scaling (Team Studio)',
          description: 'Deploying swarms larger than 8 agents with distributed DAG consensus and real-time mesh routing requires the Team Studio or Enterprise plan (supports 100+ boids).',
          currentPlan: quota.plan,
          recommendedPlan: 'team',
          used: agentCount,
          limit: 8,
          featureName: 'High-Density Swarm Engine'
        });
      }
      return;
    }
    setAgentCount(newVal);
  };

  const handleExportMultiAgentLaunch = () => {
    if (!isTeamTierOrAbove) {
      if (onOpenBarrier) {
        onOpenBarrier({
          title: 'ROS 2 Multi-Agent Launch Package (Team Studio)',
          description: 'Exporting multi-robot namespace launchfiles (`ros2 launch aigenesis_swarm swarm_bringup.launch.py`) with CycloneDDS zenoh bridge requires the Team Studio plan.',
          currentPlan: quota.plan,
          recommendedPlan: 'team',
          used: 0,
          limit: 0,
          featureName: 'Multi-Agent Launch Generator'
        });
      }
      return;
    }

    const launchContent = `from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    ld = LaunchDescription()
    
    # AIGENESIS.TECH Team Studio - Multi-Robot Swarm Bringup
    # Agents Active: ${agentCount}
    # Topology: ${topology}
    
    for i in range(1, ${agentCount + 1}):
        ld.add_action(
            Node(
                package='aigenesis_agent',
                namespace=f'robot_{i}',
                executable='swarm_node',
                name='mesh_controller',
                parameters=[{
                    'mesh_latency_ms': ${latencyMs},
                    'consensus_threshold': ${consensusScore},
                    'topology': '${topology}'
                }],
                output='screen'
            )
        )
    return ld
`;
    const blob = new Blob([launchContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aigenesis_swarm_${agentCount}_agents_bringup.launch.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 text-xs font-mono font-semibold">
            <Network className="w-3.5 h-3.5 text-teal-400" />
            <span>Multi-Agent Consensus Engine • Team Studio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-mono">
            Interactive Multi-Agent Swarm Sandbox
          </h2>
          <p className="text-xs text-slate-400">
            Simulate real-time consensus voting, Directed Acyclic Graph (DAG) task allocation, and mesh communication across collaborative physical agent swarms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              isSimulating
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            {isSimulating ? 'PAUSE SWARM' : 'RESUME SWARM'}
          </button>

          <button
            onClick={() => setObstaclesSpawned(!obstaclesSpawned)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border cursor-pointer ${
              obstaclesSpawned
                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {obstaclesSpawned ? 'Clear Obstacles' : 'Spawn Obstacles'}
          </button>

          <button
            onClick={handleExportMultiAgentLaunch}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              isTeamTierOrAbove
                ? 'bg-teal-600 hover:bg-teal-500 text-white border-teal-400'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-300 hover:border-amber-500/50'
            }`}
          >
            {isTeamTierOrAbove ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
            <span>Export ROS 2 Launch</span>
          </button>
        </div>
      </div>

      {/* Swarm Controls & Arena Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Swarm Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bot className="w-4 h-4 text-teal-400" />
            <span>Swarm Topology & Network</span>
          </h3>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Active Swarm Size:</span>
                <span className="text-teal-400 font-bold">{agentCount} AIGENESIS Agents</span>
              </div>
              <input
                type="range"
                min="3"
                max={isTeamTierOrAbove ? "24" : "12"}
                value={agentCount}
                onChange={(e) => handleAgentCountChange(Number(e.target.value))}
                className="w-full accent-teal-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>3 Agents</span>
                <span>{isTeamTierOrAbove ? '24 Active Nodes (Team)' : '8 Max (Free/Pro) • Up to 100 on Team'}</span>
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-[10px] block mb-1">Communication Topology</label>
              <div className="grid grid-cols-3 gap-2">
                {(['mesh', 'star', 'decentralized'] as const).map(top => (
                  <button
                    key={top}
                    onClick={() => setTopology(top)}
                    className={`py-2 px-2 rounded-xl text-[10px] font-bold uppercase transition-all border cursor-pointer ${
                      topology === top
                        ? 'bg-teal-600 text-white border-teal-400 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {top}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Inter-Agent Mesh Latency:</span>
                <span className="text-cyan-400 font-bold">{latencyMs} ms</span>
              </div>
              <input
                type="range"
                min="2"
                max="80"
                value={latencyMs}
                onChange={(e) => setLatencyMs(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-500 block uppercase">Consensus Metrics</span>
              <div className="flex justify-between text-slate-300">
                <span>Consensus Score:</span>
                <span className="text-emerald-400 font-bold">{(consensusScore * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>DAG Sub-Goal Status:</span>
                <span className="text-teal-400 font-bold">LOCKED & VERIFIED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: 2D Interactive Swarm Arena */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[420px]">
          {/* Top Status Overlay */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 z-10 font-mono text-xs">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-slate-200 font-bold">Collaborative Mesh Arena ({topology.toUpperCase()})</span>
            </div>

            <div className="px-2.5 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-300 rounded-full text-[10px] font-bold">
              {agentCount} AGENTS ACTIVE
            </div>
          </div>

          {/* Canvas Simulation Area */}
          <div className="relative w-full h-[280px] bg-slate-900/60 rounded-2xl border border-slate-800/60 p-4 my-4 overflow-hidden">
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Simulated Obstacles */}
            {obstaclesSpawned && (
              <>
                <div className="absolute top-1/3 left-1/2 w-16 h-16 bg-red-500/10 border border-red-500/40 rounded-2xl backdrop-blur-sm flex items-center justify-center text-[10px] font-mono text-red-400 font-bold">
                  HAZARD A
                </div>
                <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-red-500/10 border border-red-500/40 rounded-full backdrop-blur-sm flex items-center justify-center text-[10px] font-mono text-red-400 font-bold">
                  HAZARD B
                </div>
              </>
            )}

            {/* Mesh Lines connecting agents */}
            {topology === 'mesh' && agents.map((agentA, idxA) => (
              agents.slice(idxA + 1).map((agentB) => (
                <svg key={`line-${agentA.id}-${agentB.id}`} className="absolute inset-0 w-full h-full pointer-events-none">
                  <line
                    x1={`${agentA.x}%`}
                    y1={`${agentA.y}%`}
                    x2={`${agentB.x}%`}
                    y2={`${agentB.y}%`}
                    stroke="rgba(20, 184, 166, 0.25)"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                </svg>
              ))
            ))}

            {/* Render Agents */}
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 flex flex-col items-center gap-1 group"
                style={{ left: `${agent.x}%`, top: `${agent.y}%` }}
              >
                <div className="relative flex items-center justify-center w-8 h-8 bg-slate-950 border border-teal-500 rounded-xl shadow-lg shadow-teal-500/20 text-teal-300 font-mono text-[10px] font-bold">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-950" />
                </div>
                <span className="text-[9px] font-mono font-semibold text-slate-300 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                  A{agent.id}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Agent Role Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px]">
            {agents.slice(0, 4).map((a) => (
              <div key={a.id} className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <span className="text-slate-400 font-bold">A{a.id}: {a.role}</span>
                <span className="text-emerald-400 font-bold">{a.battery}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
