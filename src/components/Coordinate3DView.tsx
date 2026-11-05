import React, { useState, useRef, useEffect } from 'react';
import { UnitSystem, EnuCoordinate } from '../types/survey';
import { formatWithUnit, toDegrees, toRadians } from '../services/mathEngine';
import {
  Box,
  Rotate3d,
  ZoomIn,
  ZoomOut,
  Maximize,
  Compass,
  Layers,
  Sliders,
  Move,
  RefreshCw,
  Eye
} from 'lucide-react';

interface Coordinate3DViewProps {
  unit: UnitSystem;
}

export const Coordinate3DView: React.FC<Coordinate3DViewProps> = ({ unit }) => {
  // Observation Origin P1 (0, 0, 0)
  // Target Point P2 (X, Y, Z)
  const [targetX, setTargetX] = useState<number>(12.45);
  const [targetY, setTargetY] = useState<number>(8.25);
  const [targetZ, setTargetZ] = useState<number>(21.6);
  const [baseAngleDeg, setBaseAngleDeg] = useState<number>(-2.5);

  // 3D Canvas Camera transformation states
  const [cameraRotX, setCameraRotX] = useState<number>(25); // Pitch (deg)
  const [cameraRotY, setCameraRotY] = useState<number>(45); // Yaw (deg)
  const [zoom, setZoom] = useState<number>(1.0);
  const [isPerspective, setIsPerspective] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Displacements
  const deltaX = targetX;
  const deltaY = targetY;
  const deltaZ = targetZ;
  const horizontalDist = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  const dist3D = Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);
  const topElevationAngle = toDegrees(Math.atan2(deltaZ, Math.max(0.001, horizontalDist)));
  const azimuthHeading = (toDegrees(Math.atan2(deltaX, deltaY)) + 360) % 360;

  // Render 3D Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear background
    ctx.fillStyle = '#0a0d10';
    ctx.fillRect(0, 0, width, height);

    // 3D Projection math
    // Coordinate system: X = East (right), Y = North (depth), Z = Up (vertical)
    const cx = width / 2;
    const cy = height / 2 + 30;
    const scale = (Math.min(width, height) / 45) * zoom;

    const radX = toRadians(cameraRotX);
    const radY = toRadians(cameraRotY);

    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    // Project 3D (x, y, z) to 2D canvas (px, py)
    const project = (x: number, y: number, z: number): [number, number, number] => {
      // Rotate around Z (Yaw)
      const x1 = x * cosY - y * sinY;
      const y1 = x * sinY + y * cosY;
      const z1 = z;

      // Rotate around X (Pitch)
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      let px: number;
      let py: number;

      if (isPerspective) {
        const fov = 350;
        const depth = fov / (fov + y2 * 4);
        px = cx + x2 * scale * depth;
        py = cy - z2 * scale * depth;
      } else {
        px = cx + x2 * scale;
        py = cy - z2 * scale;
      }

      return [px, py, y2];
    };

    // 1. Draw Ground Grid (Z = 0)
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#182026';
    const gridLimit = 25;
    const gridStep = 5;

    for (let g = -gridLimit; g <= gridLimit; g += gridStep) {
      // East-West lines
      const [x1, y1] = project(-gridLimit, g, 0);
      const [x2, y2] = project(gridLimit, g, 0);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // North-South lines
      const [nx1, ny1] = project(g, -gridLimit, 0);
      const [nx2, ny2] = project(g, gridLimit, 0);
      ctx.beginPath();
      ctx.moveTo(nx1, ny1);
      ctx.lineTo(nx2, ny2);
      ctx.stroke();
    }

    // 2. Draw 3D Axes
    const axisLen = 22;
    const [origX, origY] = project(0, 0, 0);

    // X Axis (East - Red)
    const [eX, eY] = project(axisLen, 0, 0);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(origX, origY);
    ctx.lineTo(eX, eY);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('+X (EAST)', eX + 4, eY);

    // Y Axis (North - Green)
    const [nY_px, nY_py] = project(0, axisLen, 0);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(origX, origY);
    ctx.lineTo(nY_px, nY_py);
    ctx.stroke();
    ctx.fillStyle = '#22c55e';
    ctx.fillText('+Y (NORTH)', nY_px, nY_py - 6);

    // Z Axis (Up - Blue)
    const [uZ_px, uZ_py] = project(0, 0, axisLen);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(origX, origY);
    ctx.lineTo(uZ_px, uZ_py);
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('+Z (UP)', uZ_px - 8, uZ_py - 6);

    // 3. Draw Observation Origin Point (0,0,0)
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.arc(origX, origY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.fillText('Station P0 (0,0,0)', origX - 45, origY + 15);

    // 4. Target Projection Points
    const [tGroundX, tGroundY] = project(targetX, targetY, 0);
    const [tApexX, tApexY] = project(targetX, targetY, targetZ);

    // Horizontal baseline vector (P0 to Ground Base)
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(origX, origY);
    ctx.lineTo(tGroundX, tGroundY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vertical Target Structure (Ground Base to Apex)
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(tGroundX, tGroundY);
    ctx.lineTo(tApexX, tApexY);
    ctx.stroke();

    // 3D Slope Line of Sight (P0 to Apex)
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(origX, origY);
    ctx.lineTo(tApexX, tApexY);
    ctx.stroke();

    // Base point marker
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(tGroundX, tGroundY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Apex marker
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(tApexX, tApexY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`Target Apex (${targetX}m, ${targetY}m, ${targetZ}m)`, tApexX + 8, tApexY);

    // Label on vertical structure
    const midVertX = (tGroundX + tApexX) / 2;
    const midVertY = (tGroundY + tApexY) / 2;
    ctx.fillStyle = '#d8b4fe';
    ctx.font = '10px monospace';
    ctx.fillText(`ΔZ = ${targetZ.toFixed(2)}m`, midVertX + 8, midVertY);

    // Label on baseline
    const midBaseX = (origX + tGroundX) / 2;
    const midBaseY = (origY + tGroundY) / 2;
    ctx.fillStyle = '#67e8f9';
    ctx.fillText(`Dh = ${horizontalDist.toFixed(2)}m`, midBaseX, midBaseY + 12);

    // Label on 3D hypotenuse
    const midHypX = (origX + tApexX) / 2;
    const midHypY = (origY + tApexY) / 2;
    ctx.fillStyle = '#fde047';
    ctx.fillText(`D_3D = ${dist3D.toFixed(2)}m`, midHypX - 35, midHypY - 10);
  }, [targetX, targetY, targetZ, cameraRotX, cameraRotY, zoom, isPerspective]);

  // Mouse drag handlers for orbit
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setCameraRotY((prev) => (prev + dx * 0.5) % 360);
    setCameraRotX((prev) => Math.max(-85, Math.min(85, prev - dy * 0.5)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // View Presets
  const setPresetView = (view: 'isometric' | 'top' | 'side' | 'front') => {
    if (view === 'isometric') {
      setCameraRotX(25);
      setCameraRotY(45);
    } else if (view === 'top') {
      setCameraRotX(89);
      setCameraRotY(0);
    } else if (view === 'side') {
      setCameraRotX(0);
      setCameraRotY(90);
    } else {
      setCameraRotX(0);
      setCameraRotY(0);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Title & Orbit Guidance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">
              3D CARTESIAN (ENU) GEOMETRIC VISUALIZER
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-cyan-300 border border-zinc-700">
              Interactive 3D Engine
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Local Tangent Plane: X=East, Y=North, Z=Vertical Elevation. Drag canvas to orbit camera.
          </p>
        </div>

        {/* View preset buttons */}
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
          <button
            onClick={() => setPresetView('isometric')}
            className="px-2 py-1 rounded hover:bg-zinc-800 text-zinc-300"
          >
            3D Iso
          </button>
          <button
            onClick={() => setPresetView('top')}
            className="px-2 py-1 rounded hover:bg-zinc-800 text-zinc-300"
          >
            Top (X-Y)
          </button>
          <button
            onClick={() => setPresetView('side')}
            className="px-2 py-1 rounded hover:bg-zinc-800 text-zinc-300"
          >
            Side (Y-Z)
          </button>
          <button
            onClick={() => setPresetView('front')}
            className="px-2 py-1 rounded hover:bg-zinc-800 text-zinc-300"
          >
            Front (X-Z)
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative w-full aspect-video min-h-[380px] bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Canvas HUD overlays */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none text-[11px] font-mono">
          <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-cyan-300">
            D_h: {horizontalDist.toFixed(2)}m | D_3D: {dist3D.toFixed(2)}m
          </div>
          <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-emerald-400">
            Azimuth: {azimuthHeading.toFixed(1)}° | Elev: {topElevationAngle.toFixed(2)}°
          </div>
        </div>

        {/* Zoom & Projection Controls */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-xl border border-zinc-700">
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPerspective(!isPerspective)}
            className={`px-2 py-1 rounded text-[10px] font-mono ${
              isPerspective ? 'bg-cyan-500 text-black font-semibold' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {isPerspective ? 'PERSPECTIVE' : 'ORTHO'}
          </button>
        </div>
      </div>

      {/* Target Coordinates Input Sliders & Vectors */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>ADJUST TARGET POINT VECTOR P(X, Y, Z) IN REAL-TIME</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* East (X) */}
          <div className="bg-zinc-950/70 border border-red-900/30 rounded-xl p-3">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-red-400 font-semibold">East Displacement (ΔX)</span>
              <span className="text-white font-bold">{targetX.toFixed(2)}m</span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              step="0.5"
              value={targetX}
              onChange={(e) => setTargetX(parseFloat(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
            />
          </div>

          {/* North (Y) */}
          <div className="bg-zinc-950/70 border border-emerald-900/30 rounded-xl p-3">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-emerald-400 font-semibold">North Displacement (ΔY)</span>
              <span className="text-white font-bold">{targetY.toFixed(2)}m</span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              step="0.5"
              value={targetY}
              onChange={(e) => setTargetY(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Up (Z) */}
          <div className="bg-zinc-950/70 border border-blue-900/30 rounded-xl p-3">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-blue-400 font-semibold">Vertical Elevation (ΔZ)</span>
              <span className="text-white font-bold">{targetZ.toFixed(2)}m</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="50"
              step="0.5"
              value={targetZ}
              onChange={(e) => setTargetZ(parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Vector decomposition summary */}
        <div className="mt-4 pt-3 border-t border-zinc-800 text-xs font-mono grid grid-cols-2 sm:grid-cols-4 gap-2 text-zinc-300">
          <div>Horizontal Run: <strong className="text-cyan-300">{formatWithUnit(horizontalDist, unit, 2)}</strong></div>
          <div>Vertical Height: <strong className="text-purple-300">{formatWithUnit(targetZ, unit, 2)}</strong></div>
          <div>3D Hypotenuse: <strong className="text-amber-300">{formatWithUnit(dist3D, unit, 2)}</strong></div>
          <div>True Azimuth: <strong className="text-emerald-300">{azimuthHeading.toFixed(1)}°</strong></div>
        </div>
      </div>
    </div>
  );
};
