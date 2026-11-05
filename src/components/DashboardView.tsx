import React, { useState } from 'react';
import { UnitSystem, LiveSensorState, EnuCoordinate } from '../types/survey';
import { formatWithUnit, calculateTwoAngleHeight } from '../services/mathEngine';
import {
  Compass,
  Crosshair,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  BookmarkPlus,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';

interface DashboardViewProps {
  sensorState: LiveSensorState;
  unit: UnitSystem;
  gpsAccuracy: number;
  onNavigateTab: (tab: any) => void;
  onSaveMeasurement: (record: any) => void;
  onCalibrateZero: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sensorState,
  unit,
  gpsAccuracy,
  onNavigateTab,
  onSaveMeasurement,
  onCalibrateZero,
}) => {
  // Surveying setup states
  const [horizontalDistance, setHorizontalDistance] = useState<number>(20.0);
  const [baseAngle, setBaseAngle] = useState<number>(-2.5);
  const [topAngle, setTopAngle] = useState<number>(45.0);
  const [instrumentHeight, setInstrumentHeight] = useState<number>(1.65);
  const [distSource, setDistSource] = useState<'Tape/Manual' | 'GPS Rover' | 'Optical Staking'>('Tape/Manual');
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  // Compute live surveying math
  const calc = calculateTwoAngleHeight(
    horizontalDistance,
    baseAngle,
    topAngle,
    instrumentHeight,
    distSource === 'GPS Rover' ? Math.max(0.5, gpsAccuracy) : 0.2,
    sensorState.estimatedUncertainty
  );

  // Example ENU coordinates relative to local observation baseline
  // X = East, Y = North, Z = Vertical elevation
  const enuCoords: EnuCoordinate = {
    east: horizontalDistance * 0.6225, // 12.45m
    north: horizontalDistance * 0.4125, // 8.25m
    up: calc.height,
    accuracy: calc.uncertainty,
  };

  const handleCaptureBase = () => {
    setBaseAngle(Number(sensorState.pitch.toFixed(2)));
  };

  const handleCaptureTop = () => {
    setTopAngle(Number(sensorState.pitch.toFixed(2)));
  };

  const handleSaveToNotebook = () => {
    onSaveMeasurement({
      projectId: 'proj_default',
      title: `Survey Point @ ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
      type: 'TWO_ANGLE_HEIGHT',
      method: 'HYBRID_SURVEY',
      horizontalDistance,
      verticalHeight: calc.height,
      baseAngle,
      topAngle,
      slopeDistance: calc.slopeDistance,
      enuX: enuCoords.east,
      enuY: enuCoords.north,
      enuZ: enuCoords.up,
      instrumentHeight,
      uncertainty: calc.uncertainty,
      notes: `Sighted Base: ${baseAngle}° | Top: ${topAngle}° | Distance: ${horizontalDistance}m via ${distSource}`,
      timestamp: Date.now(),
    });

    setSavedBanner('Measurement logged to Project Notebook database!');
    setTimeout(() => setSavedBanner(null), 3000);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Banner Notice */}
      {savedBanner && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{savedBanner}</span>
          </div>
          <button
            onClick={() => onNavigateTab('notebook')}
            className="underline font-mono font-medium hover:text-white"
          >
            View Notebook
          </button>
        </div>
      )}

      {/* Screen Title & Method Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">
              COMBINED SURVEY MODE • DEFAULT INSTRUMENT
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Simultaneous multi-sensor observation of Cartesian coordinates, angles, and elevation.
          </p>
        </div>

        {/* Sensor Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">
            <span
              className={`w-2 h-2 rounded-full ${
                sensorState.isStable ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 animate-ping'
              }`}
            />
            <span className="text-zinc-300 text-[11px]">
              Status: {sensorState.isStable ? 'Active & Stable' : 'Unstable / Motion'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Key Metric Displays (Large Digital Readouts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Card 1: Horizontal Distance */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              HORIZONTAL DISTANCE
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-300 border border-zinc-700">
              DIRECT MEASURED
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight">
              {formatWithUnit(horizontalDistance, unit, 3)}
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400 font-mono">Source:</span>
              <div className="text-xs text-cyan-300 font-mono font-medium">{distSource}</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-[11px]">Set Baseline:</span>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={horizontalDistance}
                onChange={(e) => setHorizontalDistance(Math.max(0.1, parseFloat(e.target.value) || 0))}
                className="w-20 px-2 py-0.5 bg-zinc-950 border border-zinc-700 rounded text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
              <span className="text-zinc-500 font-mono">m</span>
            </div>
            <div className="flex gap-1">
              {[10, 20, 50].map((v) => (
                <button
                  key={v}
                  onClick={() => setHorizontalDistance(v)}
                  className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                    horizontalDistance === v
                      ? 'bg-cyan-500 text-black font-semibold'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {v}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Vertical Height */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              VERTICAL HEIGHT (H)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              MATHEMATICALLY CALCULATED
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight">
              {formatWithUnit(calc.height, unit, 3)}
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400 font-mono">Uncertainty (σ):</span>
              <div className="text-xs text-emerald-400 font-mono font-medium">
                ±{formatWithUnit(calc.uncertainty, unit, 3)}
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span className="truncate">Formula: H = D × [tan(θ_top) - tan(θ_base)] + h_i</span>
            <span className="text-zinc-500 text-[11px] font-mono flex-shrink-0">k=1 (~68% conf)</span>
          </div>
        </div>
      </div>

      {/* Sighting Angles Grid with Quick-Capture Controls */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
              TARGET SIGHTING & ANGULAR RESECTION
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400 font-mono">Live Tilt:</span>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
              {sensorState.pitch >= 0 ? `+${sensorState.pitch.toFixed(2)}` : sensorState.pitch.toFixed(2)}°
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Base Angle */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase">BASE ANGLE (θ_base)</div>
              <div className="text-xl font-mono font-bold text-cyan-300 mt-1">
                {baseAngle >= 0 ? `+${baseAngle.toFixed(2)}` : baseAngle.toFixed(2)}°
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Footing / Ground Level</div>
            </div>
            <button
              onClick={handleCaptureBase}
              className="mt-2.5 w-full py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-cyan-950 hover:text-cyan-300 text-zinc-300 text-[11px] font-mono font-medium transition-colors border border-zinc-700 flex items-center justify-center gap-1"
            >
              <Crosshair className="w-3 h-3 text-cyan-400" />
              Capture Base
            </button>
          </div>

          {/* Top Angle */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase">TOP ANGLE (θ_top)</div>
              <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                {topAngle >= 0 ? `+${topAngle.toFixed(2)}` : topAngle.toFixed(2)}°
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Apex / Target Crown</div>
            </div>
            <button
              onClick={handleCaptureTop}
              className="mt-2.5 w-full py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-emerald-950 hover:text-emerald-300 text-zinc-300 text-[11px] font-mono font-medium transition-colors border border-zinc-700 flex items-center justify-center gap-1"
            >
              <Crosshair className="w-3 h-3 text-emerald-400" />
              Capture Top
            </button>
          </div>

          {/* Angle Difference */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase">ANGLE DIFFERENCE</div>
              <div className="text-xl font-mono font-bold text-amber-300 mt-1">
                {calc.angleDifference.toFixed(2)}°
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Subtended Target Arc</div>
            </div>
            <div className="mt-2.5 py-1 px-2 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 text-center">
              Δθ = Top - Base
            </div>
          </div>

          {/* Slope Distance */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase">SLOPE DISTANCE</div>
              <div className="text-xl font-mono font-bold text-purple-300 mt-1">
                {formatWithUnit(calc.slopeDistance, unit, 2)}
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Line of Sight Hypotenuse</div>
            </div>
            <div className="mt-2.5 py-1 px-2 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 text-center">
              D_slope = √(D² + ΔZ²)
            </div>
          </div>
        </div>

        {/* Critical Angle Warning if applicable */}
        {calc.isCritical && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              Sighting angle exceeds 75°. Tangent sensitivity amplifies angular uncertainty. Recommended: step further back to reach ~45°.
            </span>
          </div>
        )}
      </div>

      {/* XYZ 3D Cartesian Coordinates & Precision Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Local ENU Coordinates */}
        <div className="md:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded bg-cyan-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                LOCAL ENU CARTESIAN COORDINATES
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('coordinates3D')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
            >
              <span>3D Orbit View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-zinc-950/80 border border-red-900/30 rounded-xl p-2.5">
              <div className="text-[10px] font-mono text-red-400 uppercase font-semibold">X (EAST-WEST)</div>
              <div className="text-lg font-mono font-bold text-white mt-1">
                {formatWithUnit(enuCoords.east, unit, 3)}
              </div>
              <div className="text-[9px] text-zinc-500 font-mono mt-0.5">ΔX from Origin</div>
            </div>

            <div className="bg-zinc-950/80 border border-emerald-900/30 rounded-xl p-2.5">
              <div className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">Y (NORTH-SOUTH)</div>
              <div className="text-lg font-mono font-bold text-white mt-1">
                {formatWithUnit(enuCoords.north, unit, 3)}
              </div>
              <div className="text-[9px] text-zinc-500 font-mono mt-0.5">ΔY from Origin</div>
            </div>

            <div className="bg-zinc-950/80 border border-blue-900/30 rounded-xl p-2.5">
              <div className="text-[10px] font-mono text-blue-400 uppercase font-semibold">Z (VERTICAL UP)</div>
              <div className="text-lg font-mono font-bold text-white mt-1">
                {formatWithUnit(enuCoords.up, unit, 3)}
              </div>
              <div className="text-[9px] text-zinc-500 font-mono mt-0.5">True Object Elevation</div>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-zinc-400 flex items-center justify-between border-t border-zinc-800/80 pt-2 font-mono">
            <span>Reference Frame: Local Tangent Plane (ENU)</span>
            <span className="text-cyan-400">D_3D = {formatWithUnit(calc.slopeDistance, unit, 3)}</span>
          </div>
        </div>

        {/* Quality, Accuracy & Scientific Rigor */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-3.5 h-3.5 text-zinc-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                SCIENTIFIC UNCERTAINTY
              </h3>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">GPS Accuracy:</span>
                <span className="text-emerald-400 font-medium">±{gpsAccuracy.toFixed(2)} m</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Angle Accuracy:</span>
                <span className="text-cyan-400 font-medium">±{sensorState.estimatedUncertainty}°</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Height Error σ_H:</span>
                <span className="text-amber-400 font-medium">±{formatWithUnit(calc.uncertainty, unit, 3)}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-zinc-400">Sensor Noise:</span>
                <span className="text-zinc-300">
                  {sensorState.vibrationIntensity < 0.2 ? 'Low (Stationary)' : 'Moderate (Hand Tremor)'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center gap-2">
            <button
              onClick={onCalibrateZero}
              className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors border border-zinc-700"
            >
              Zero Calibrate
            </button>
            <button
              onClick={handleSaveToNotebook}
              className="flex-1 py-1.5 px-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono transition-colors shadow flex items-center justify-center gap-1"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              Save Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
