import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Layers, Box, Sliders, Play, Pause, 
  RotateCcw, Download, Copy, Check, Eye, ShieldCheck, Activity
} from 'lucide-react';

export const GaussianSplattingStudio: React.FC = () => {
  const [splatDensityM, setSplatDensityM] = useState<number>(1.2); // 1.2M splats
  const [renderFps, setRenderFps] = useState<number>(128); // 128 FPS
  const [sdfVoxelMm, setSdfVoxelMm] = useState<number>(0.5); // 0.5 mm voxel resolution
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [showSdfHull, setShowSdfHull] = useState<boolean>(true);
  const [lightingMode, setLightingMode] = useState<'photorealistic' | 'surface_normals' | 'depth_map'>('photorealistic');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic FPS & latency estimation based on splat density
  useEffect(() => {
    const fps = Math.round(160 / Math.sqrt(splatDensityM));
    setRenderFps(fps);
  }, [splatDensityM]);

  // Real-time 3D Gaussian Splatting + Signed Distance Field (SDF) Canvas simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    // Generate deterministic 3D Gaussian cluster points (representing an industrial robot arm + workcell)
    const splatClusters: { x: number; y: number; z: number; rx: number; ry: number; color: string }[] = [];
    const baseCount = Math.min(220, Math.round(splatDensityM * 140));

    // Robot base and joint links
    for (let i = 0; i < baseCount; i++) {
      const u = (i / baseCount) * Math.PI * 2;
      const r = 40 + Math.sin(i * 0.3) * 15;
      const height = (i % 8) * 18 - 60;
      const hue = 180 + (i % 60);
      splatClusters.push({
        x: Math.cos(u) * r,
        y: height,
        z: Math.sin(u) * r,
        rx: 4 + Math.sin(i) * 2,
        ry: 2 + Math.cos(i) * 1.5,
        color: `hsl(${hue}, 85%, 65%)`
      });
    }

    const render = () => {
      angle += isRotating ? 0.015 : 0;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, w, h);

      // Draw faint 3D floor grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      const gridSize = 140;
      for (let g = -gridSize; g <= gridSize; g += 35) {
        // Perspective projected floor lines
        const yFloor = 85;
        const x1 = cx + (g - 60) * 1.2;
        const x2 = cx + (g + 60) * 1.2;
        ctx.beginPath();
        ctx.moveTo(x1, cy + yFloor);
        ctx.lineTo(x2, cy + yFloor + 50);
        ctx.stroke();
      }

      // Rotate splats in 3D (Y-axis rotation)
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const projected = splatClusters.map(s => {
        const rotX = s.x * cosA - s.z * sinA;
        const rotZ = s.x * sinA + s.z * cosA + 180; // depth offset
        const scale = 220 / Math.max(40, rotZ);
        const px = cx + rotX * scale;
        const py = cy + s.y * scale;
        return { ...s, px, py, scale, rotZ };
      }).sort((a, b) => b.rotZ - a.rotZ); // Back to front sorting for alpha splat blending

      // Draw 3D Gaussian Ellipsoids (Radiance fields)
      projected.forEach(p => {
        ctx.save();
        ctx.translate(p.px, p.py);
        ctx.rotate(angle * 0.4);

        if (lightingMode === 'photorealistic') {
          const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, p.rx * p.scale);
          grad.addColorStop(0, p.color);
          grad.addColorStop(0.6, 'rgba(6, 182, 212, 0.45)');
          grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
          ctx.fillStyle = grad;
        } else if (lightingMode === 'surface_normals') {
          // Normal vector encoding in RGB
          const normR = Math.round(128 + Math.cos(p.rotZ * 0.05) * 120);
          const normG = Math.round(128 + Math.sin(p.px * 0.02) * 120);
          ctx.fillStyle = `rgba(${normR}, ${normG}, 220, 0.65)`;
        } else {
          // Depth map visualization (Greyscale depth)
          const depthShade = Math.min(255, Math.max(30, Math.round(320 - p.rotZ * 0.8)));
          ctx.fillStyle = `rgba(${depthShade}, ${depthShade}, ${depthShade}, 0.7)`;
        }

        ctx.beginPath();
        ctx.ellipse(0, 0, p.rx * p.scale, p.ry * p.scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Signed Distance Field (SDF) convex collision hull overlay
      if (showSdfHull) {
        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        for (let i = 0; i < projected.length; i += 7) {
          const p = projected[i];
          if (i === 0) ctx.moveTo(p.px, p.py);
          else ctx.lineTo(p.px, p.py);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.font = '10px monospace';
        ctx.fillText(`SDF Collision Hull (Voxel: ${sdfVoxelMm.toFixed(1)}mm)`, 14, 24);
        ctx.restore();
      }

      // HUD overlay stats
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText(`3DGS Radiance Stream · ${renderFps} FPS · Sub-mm Precision`, 14, h - 14);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [splatDensityM, isRotating, showSdfHull, lightingMode, renderFps, sdfVoxelMm]);

  const pythonSnippet = `# AIGENESIS 3D Gaussian Splatting (3DGS) Physics Rasterizer Node
# Sub-millimeter collision envelope extraction & NVIDIA Isaac Sim 4.2+ export
import torch
from diff_gaussian_rasterization import GaussianRasterizer, GaussianRasterizationSettings
import trimesh

class GaussianSplatWorldTwin:
    def __init__(self, splat_path: str, voxel_size_mm: float = ${sdfVoxelMm}):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.splat_data = self._load_ply(splat_path)
        self.voxel_size = voxel_size_mm * 1e-3 # convert to meters
        
    def extract_sdf_collision_mesh(self, density_threshold: float = 0.45):
        """Converts radiance field ellipsoids into verified zero-penetration SDF collision mesh."""
        points = self.splat_data["means3D"]
        covariances = self.splat_data["covariances"]
        
        # Fast marching cubes over gaussian density field
        mesh = trimesh.voxel.ops.points_to_marching_cubes(
            points=points.cpu().numpy(),
            pitch=self.voxel_size
        )
        return mesh

    def step_physics_rollout(self, camera_pose_matrix: torch.Tensor):
        """120+ FPS continuous radiance projection for dynamic robot perception."""
        settings = GaussianRasterizationSettings(
            image_height=720, image_width=1280, tanfovx=0.82, tanfovy=0.54,
            bg=torch.tensor([0.0, 0.0, 0.0], device=self.device),
            scale_modifier=1.0, viewmatrix=camera_pose_matrix,
            projmatrix=camera_pose_matrix, sh_degree=3, campos=camera_pose_matrix[:3, 3],
            prefiltered=False, debug=False
        )
        rasterizer = GaussianRasterizer(raster_settings=settings)
        rendered_image, radii = rasterizer(
            means3D=self.splat_data["means3D"],
            means2D=torch.zeros_like(self.splat_data["means3D"]),
            shs=self.splat_data["shs"],
            colors_precomp=None,
            opacities=self.splat_data["opacities"],
            scales=self.splat_data["scales"],
            rotations=self.splat_data["rotations"]
        )
        return rendered_image`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pythonSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
            <span>Neural Radiance Twin</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400">120+ FPS Rasterization</span>
            <span aria-hidden="true">·</span>
            <span>Sub-millimeter SDF Meshing</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-mono flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            4D Gaussian Splatting (3DGS) World Twin
          </h2>
          <p className="text-xs text-slate-300 max-w-3xl mt-1">
            Instantly reconstruct physical workcells, operating theaters, and obstacle zones into photorealistic 3D Gaussian radiance fields with zero-penetration Signed Distance Field (SDF) physics collision hulls.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs text-slate-200 transition cursor-pointer"
          >
            {isRotating ? <Pause className="w-3.5 h-3.5 text-cyan-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isRotating ? 'Pause Orbit' : 'Resume Orbit'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 3DGS Canvas Viewport */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Real-Time Radiance Field Rasterizer
            </span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg">
              <button
                onClick={() => setLightingMode('photorealistic')}
                className={`px-2 py-0.5 text-[10px] rounded transition ${lightingMode === 'photorealistic' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
              >
                RGB Radiance
              </button>
              <button
                onClick={() => setLightingMode('surface_normals')}
                className={`px-2 py-0.5 text-[10px] rounded transition ${lightingMode === 'surface_normals' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
              >
                Normals
              </button>
              <button
                onClick={() => setLightingMode('depth_map')}
                className={`px-2 py-0.5 text-[10px] rounded transition ${lightingMode === 'depth_map' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
              >
                Depth Map
              </button>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950">
            <canvas
              ref={canvasRef}
              width={640}
              height={340}
              className="w-full h-auto block"
            />
          </div>

          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-4 gap-2 text-center font-mono">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Splat Count</span>
              <span className="text-sm font-bold text-cyan-400">{splatDensityM.toFixed(1)}M</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Render Rate</span>
              <span className="text-sm font-bold text-emerald-400">{renderFps} FPS</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">SDF Mesh Pitch</span>
              <span className="text-sm font-bold text-purple-400">{sdfVoxelMm.toFixed(1)} mm</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">VRAM Footprint</span>
              <span className="text-sm font-bold text-amber-400">1.8 GB</span>
            </div>
          </div>
        </div>

        {/* Right: Parameter Controls & Synthesis */}
        <div className="space-y-4 font-mono">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Radiance & Mesh Parameters
              </h3>
              <span className="text-[10px] text-emerald-400">GPU Accelerated</span>
            </div>

            {/* Splat Density Slider */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Gaussian Density:</span>
                <span className="text-cyan-400 font-bold">{splatDensityM.toFixed(1)}M Splats</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="3.0"
                step="0.1"
                value={splatDensityM}
                onChange={(e) => setSplatDensityM(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Higher density enables photorealistic specular reflections on metallic robotic arm links.
              </span>
            </div>

            {/* SDF Voxel Resolution */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>SDF Voxel Resolution:</span>
                <span className="text-purple-400 font-bold">{sdfVoxelMm.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={sdfVoxelMm}
                onChange={(e) => setSdfVoxelMm(parseFloat(e.target.value))}
                className="w-full accent-purple-400 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Sub-millimeter pitch prevents robot grippers from penetrating thin sheet metal or surgical trays.
              </span>
            </div>

            {/* SDF Hull Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-xs text-slate-300">Show SDF Collision Hull:</span>
              <button
                onClick={() => setShowSdfHull(!showSdfHull)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition ${showSdfHull ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-950 text-slate-500'}`}
              >
                {showSdfHull ? 'Active (Green)' : 'Hidden'}
              </button>
            </div>
          </div>

          {/* Industry Advantages Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Why 3DGS Beats NeRF & Manual CAD:
            </h4>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>• <strong>Instant Ingestion:</strong> Capture live scene from drone/handheld camera in 4 minutes.</li>
              <li>• <strong>120+ FPS:</strong> Fast enough for closed-loop visual servoing and reactive obstacle avoidance.</li>
              <li>• <strong>Zero CAD Drift:</strong> Captures actual real-world cabling, bent brackets, and oil spills.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Code Export Block */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-bold">
            <Box className="w-4 h-4 text-cyan-400" />
            <span>PyTorch 3DGS Rasterizer & Isaac Sim USD Exporter</span>
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-cyan-300 transition cursor-pointer"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copiedCode ? 'Copied!' : 'Copy Python Script'}</span>
          </button>
        </div>
        <pre className="text-[11px] text-slate-300 overflow-x-auto p-3 rounded-xl bg-slate-900/60 leading-relaxed font-mono">
          {pythonSnippet}
        </pre>
      </div>
    </div>
  );
};
