import React, { useState } from 'react';
import { UnitSystem, LiveSensorState } from '../types/survey';
import { calculateSlopeMetrics, formatWithUnit } from '../services/mathEngine';
import {
  TrendingUp,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  BookmarkPlus
} from 'lucide-react';

interface SlopeTerrainViewProps {
  sensorState: LiveSensorState;
  unit: UnitSystem;
  onSaveMeasurement: (record: any) => void;
}

export const SlopeTerrainView: React.FC<SlopeTerrainViewProps> = ({
  sensorState,
  unit,
  onSaveMeasurement,
}) => {
  const [mode, setMode] = useState<'directSurface' | 'runRise'>('directSurface');
  const [run, setRun] = useState<number>(30.0);
  const [rise, setRise] = useState<number>(2.4);

  // If direct surface mode, calculate rise from current pitch angle over given run length
  const activeAngle = mode === 'directSurface' ? sensorState.pitch : (calculateSlopeMetrics(run, rise).slopeAngleDeg);
  const activeRun = run;
  const activeRise = mode === 'directSurface'
    ? activeRun * Math.tan((activeAngle * Math.PI) / 180)
    : rise;

  const slope = calculateSlopeMetrics(activeRun, activeRise);
  const isAdaRamp = Math.abs(slope.slopePercent) <= 8.333;

  return (
    <div className="space-y-4 pb-20">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">
              SLOPE & TERRAIN GRADIENT INSTRUMENT
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-cyan-300 border border-zinc-700">
              Civil Engineering & ADA Compliance
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Measure road gradients, wheelchair ramps, ground elevation falls, and surface grades.
          </p>
        </div>

        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
          <button
            onClick={() => setMode('directSurface')}
            className={`px-3 py-1 rounded-lg transition-all ${
              mode === 'directSurface' ? 'bg-cyan-500 text-black font-semibold shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Direct Surface Inclinometer
          </button>
          <button
            onClick={() => setMode('runRise')}
            className={`px-3 py-1 rounded-lg transition-all ${
              mode === 'runRise' ? 'bg-cyan-500 text-black font-semibold shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Run & Rise Entry
          </button>
        </div>
      </div>

      {/* Primary Slope Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Slope Percentage */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <span className="text-[10px] font-mono text-zinc-400 uppercase">GRADE PERCENTAGE</span>
          <div className="text-3xl font-mono font-bold text-amber-300 mt-1">
            {slope.slopePercent >= 0 ? `+${slope.slopePercent.toFixed(2)}` : slope.slopePercent.toFixed(2)}%
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">Rise / Run × 100</div>
        </div>

        {/* Slope Angle */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <span className="text-[10px] font-mono text-zinc-400 uppercase">SLOPE ANGLE (θ)</span>
          <div className="text-3xl font-mono font-bold text-cyan-300 mt-1">
            {slope.slopeAngleDeg >= 0 ? `+${slope.slopeAngleDeg.toFixed(2)}` : slope.slopeAngleDeg.toFixed(2)}°
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">arctan(Rise / Run)</div>
        </div>

        {/* Vertical Rise / Fall */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <span className="text-[10px] font-mono text-zinc-400 uppercase">VERTICAL ELEVATION (ΔZ)</span>
          <div className="text-3xl font-mono font-bold text-emerald-400 mt-1">
            {formatWithUnit(slope.verticalRise, unit, 2)}
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">{slope.verticalRise >= 0 ? 'Rise (Climb)' : 'Fall (Drop)'}</div>
        </div>

        {/* Slope Distance (Hypotenuse) */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
          <span className="text-[10px] font-mono text-zinc-400 uppercase">SLOPE DISTANCE</span>
          <div className="text-3xl font-mono font-bold text-purple-300 mt-1">
            {formatWithUnit(slope.slopeDistance, unit, 2)}
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">√(Run² + Rise²)</div>
        </div>
      </div>

      {/* Visual Road Gradient Diagram */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>CROSS-SECTION TERRAIN & INCLINE PROFILE</span>
          </h3>
          <span className="text-xs font-mono text-zinc-400">
            Ratio: <strong className="text-cyan-300">{slope.ratio}</strong>
          </span>
        </div>

        {/* Road Ramp Cross Section SVG */}
        <div className="relative w-full h-44 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-center p-4 overflow-hidden">
          <svg viewBox="0 0 500 180" className="w-full h-full max-w-xl">
            {/* Ground datum plane */}
            <line x1="40" y1="140" x2="460" y2="140" stroke="#3f3f46" strokeWidth="2" strokeDasharray="4 4" />
            <text x="50" y="155" fill="#71717a" fontSize="11" fontFamily="monospace">
              Datum Plane: Horizontal Run = {slope.horizontalRun.toFixed(2)}m
            </text>

            {/* Inclined Road Surface */}
            {(() => {
              const clampedRisePx = Math.max(-80, Math.min(80, (slope.verticalRise / slope.horizontalRun) * 200));
              const startX = 60;
              const startY = 140;
              const endX = 420;
              const endY = 140 - clampedRisePx;

              return (
                <g>
                  {/* Fill terrain wedge */}
                  <polygon
                    points={`${startX},${startY} ${endX},${endY} ${endX},140`}
                    fill="rgba(34, 211, 238, 0.08)"
                    stroke="none"
                  />
                  {/* Slope line */}
                  <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="#22d3ee" strokeWidth="4" />
                  {/* Vertical rise line */}
                  <line x1={endX} y1="140" x2={endX} y2={endY} stroke="#34d399" strokeWidth="2.5" />
                  {/* Right angle indicator */}
                  <rect x={endX - 12} y={140 - 12} width="12" height="12" fill="none" stroke="#71717a" strokeWidth="1.5" />

                  {/* Dimension callouts */}
                  <text x={endX + 8} y={(140 + endY) / 2} fill="#34d399" fontSize="12" fontFamily="monospace" fontWeight="bold">
                    Rise: {slope.verticalRise.toFixed(2)}m
                  </text>
                  <text x={(startX + endX) / 2 - 40} y={(startY + endY) / 2 - 12} fill="#fde047" fontSize="12" fontFamily="monospace" fontWeight="bold">
                    Slope Dist: {slope.slopeDistance.toFixed(2)}m
                  </text>
                  {/* Angle arc */}
                  <path d={`M ${startX + 35} ${startY} A 35 35 0 0 0 ${startX + 32} ${startY - 12}`} fill="none" stroke="#ffffff" strokeWidth="2" />
                  <text x={startX + 45} y={startY - 6} fill="#ffffff" fontSize="11" fontFamily="monospace">
                    {slope.slopeAngleDeg.toFixed(1)}°
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        {/* ADA accessibility check notice */}
        <div className="mt-4 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className={`w-5 h-5 ${isAdaRamp ? 'text-emerald-400' : 'text-amber-400'}`} />
            <div>
              <div className="text-xs font-mono font-bold text-white">
                {isAdaRamp
                  ? 'ADA Wheelchair Accessibility Standard: COMPLIANT (<= 8.33% / 1:12)'
                  : 'ADA Wheelchair Standard: EXCEEDED (> 8.33% grade)'}
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">
                Current slope is {slope.slopePercent.toFixed(2)}% (Ratio: {slope.ratio})
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              onSaveMeasurement({
                projectId: 'proj_civil',
                title: `Slope Profile @ ${slope.slopePercent.toFixed(1)}% Grade`,
                type: 'SLOPE',
                method: mode === 'directSurface' ? 'CLINOMETER_SIGHTING' : 'MANUAL_MATH',
                horizontalDistance: slope.horizontalRun,
                verticalHeight: slope.verticalRise,
                baseAngle: 0,
                topAngle: slope.slopeAngleDeg,
                slopeDistance: slope.slopeDistance,
                enuX: slope.horizontalRun,
                enuY: 0,
                enuZ: slope.verticalRise,
                instrumentHeight: 0,
                uncertainty: 0.05,
                notes: `Grade: ${slope.slopePercent.toFixed(2)}% | Ratio: ${slope.ratio} | ADA: ${isAdaRamp ? 'Pass' : 'Fail'}`,
                timestamp: Date.now(),
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono shadow"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>Save to Notebook</span>
          </button>
        </div>
      </div>
    </div>
  );
};
