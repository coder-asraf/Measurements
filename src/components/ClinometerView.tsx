import React, { useState } from 'react';
import { LiveSensorState } from '../types/survey';
import { sensorManager } from '../services/sensorManager';
import {
  Compass,
  RotateCcw,
  Sliders,
  CheckCircle,
  Activity,
  Layers,
  Info,
  Maximize2,
  Volume2
} from 'lucide-react';

interface ClinometerViewProps {
  sensorState: LiveSensorState;
  onCalibrateZero: () => void;
  onResetCalibration: () => void;
}

export const ClinometerView: React.FC<ClinometerViewProps> = ({
  sensorState,
  onCalibrateZero,
  onResetCalibration,
}) => {
  const [alphaFilter, setAlphaFilter] = useState<number>(sensorState.activeFilterAlpha);
  const [simPitch, setSimPitch] = useState<number>(sensorState.pitch);
  const [simRoll, setSimRoll] = useState<number>(sensorState.roll);
  const [showFilterSettings, setShowFilterSettings] = useState<boolean>(false);

  // Bubble level physics simulation
  // Max bubble displacement for 45 deg tilt is 70px
  const maxDisplacement = 65;
  const bubbleX = Math.max(-maxDisplacement, Math.min(maxDisplacement, (sensorState.roll / 45) * maxDisplacement));
  const bubbleY = Math.max(-maxDisplacement, Math.min(maxDisplacement, (-sensorState.pitch / 45) * maxDisplacement));

  const isLevel = Math.abs(sensorState.pitch) < 0.25 && Math.abs(sensorState.roll) < 0.25;

  const handleTestAngle = (deg: number) => {
    setSimPitch(deg);
    sensorManager.testKnownAngle(deg);
  };

  const handleManualPitchChange = (deg: number) => {
    setSimPitch(deg);
    sensorManager.setSimulatedAngles(deg, simRoll);
  };

  const handleManualRollChange = (deg: number) => {
    setSimRoll(deg);
    sensorManager.setSimulatedAngles(simPitch, deg);
  };

  const handleAlphaChange = (val: number) => {
    setAlphaFilter(val);
    sensorManager.setFilterAlpha(val);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">
              DIGITAL CLINOMETER & 2D SPIRIT LEVEL
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-cyan-300 border border-zinc-700">
              Precision Attitude Fusion
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Complementary filter fusing gravity accelerometer & gyroscope angular velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilterSettings(!showFilterSettings)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filter (α = {alphaFilter.toFixed(2)})</span>
          </button>
          <button
            onClick={onCalibrateZero}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono transition-colors shadow"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Zero (0°)</span>
          </button>
        </div>
      </div>

      {/* Main Digital Readout & Bubble Level Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Huge Numerical Readout & Gauge */}
        <div className="lg:col-span-7 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isLevel ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-medium">
                {isLevel ? 'PERFECTLY LEVEL (0.00°)' : 'INCLINATION ANGLE'}
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              Res: <span className="text-white">0.01°</span> | Acc: <span className="text-cyan-300">±{sensorState.estimatedUncertainty}°</span>
            </div>
          </div>

          {/* Large Hero Angle */}
          <div className="my-6 text-center">
            <div className="text-6xl sm:text-7xl font-mono font-bold tracking-tighter text-white">
              {sensorState.pitch >= 0 ? `+${sensorState.pitch.toFixed(2)}` : sensorState.pitch.toFixed(2)}
              <span className="text-cyan-400 text-4xl sm:text-5xl ml-1">°</span>
            </div>
            <div className="text-xs font-mono text-zinc-400 mt-2 flex items-center justify-center gap-4">
              <span>Roll (Side-Tilt): <strong className="text-zinc-200">{sensorState.roll.toFixed(2)}°</strong></span>
              <span>•</span>
              <span>Heading: <strong className="text-zinc-200">{sensorState.azimuth.toFixed(0)}° N</strong></span>
            </div>
          </div>

          {/* Semicircle Protractor Scale Visualizer */}
          <div className="relative w-full h-24 overflow-hidden flex items-end justify-center mb-2">
            <svg viewBox="-120 -120 240 130" className="w-full max-w-xs h-auto">
              {/* Background Arc */}
              <path
                d="M -100 0 A 100 100 0 0 1 100 0"
                fill="none"
                stroke="#27272a"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Reference ticks */}
              {[-90, -60, -45, -30, 0, 30, 45, 60, 90].map((angle) => {
                const rad = ((angle - 90) * Math.PI) / 180;
                const x1 = Math.cos(rad) * 92;
                const y1 = Math.sin(rad) * 92;
                const x2 = Math.cos(rad) * 108;
                const y2 = Math.sin(rad) * 108;
                return (
                  <line
                    key={angle}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={angle === 0 ? '#34d399' : '#71717a'}
                    strokeWidth={angle === 0 ? '3' : '1.5'}
                  />
                );
              })}
              {/* Needle Indicator */}
              {(() => {
                const needleRad = ((sensorState.pitch - 90) * Math.PI) / 180;
                const nx = Math.cos(needleRad) * 88;
                const ny = Math.sin(needleRad) * 88;
                return (
                  <g>
                    <line
                      x1="0"
                      y1="0"
                      x2={nx}
                      y2={ny}
                      stroke="#22d3ee"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <circle cx="0" cy="0" r="6" fill="#00e5ff" />
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Quick Test Angle Buttons (0°, 30°, 45°, 60°, 90°) */}
          <div className="border-t border-zinc-800 pt-3">
            <div className="text-[11px] font-mono text-zinc-400 mb-2 flex items-center justify-between">
              <span>TEST AT STANDARD CALIBRATED ANGLES:</span>
              <button
                onClick={onResetCalibration}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Zero</span>
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[0, 30, 45, 60, 90].map((ang) => (
                <button
                  key={ang}
                  onClick={() => handleTestAngle(ang)}
                  className={`py-2 rounded-xl text-xs font-mono font-medium border transition-all ${
                    Math.abs(sensorState.pitch - ang) < 0.5
                      ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow-md shadow-cyan-900/40'
                      : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800'
                  }`}
                >
                  {ang}°
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: 2D Spirit Level & Tubular Spirit Level */}
        <div className="lg:col-span-5 space-y-4">
          {/* Circular Bullseye Bubble Level */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 flex flex-col items-center justify-center relative">
            <div className="w-full flex items-center justify-between mb-3 text-xs font-mono text-zinc-400">
              <span className="font-semibold uppercase text-zinc-200">2D CIRCULAR BUBBLE LEVEL</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${isLevel ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-zinc-800 text-zinc-400'}`}>
                {isLevel ? 'PLUMB' : 'TILTED'}
              </span>
            </div>

            {/* Target Ring Container */}
            <div className="relative w-48 h-48 rounded-full bg-gradient-to-b from-zinc-950 to-zinc-900 border-4 border-zinc-700 shadow-inner flex items-center justify-center overflow-hidden">
              {/* Outer 5 deg ring */}
              <div className="absolute w-36 h-36 rounded-full border border-dashed border-zinc-700 pointer-events-none" />
              {/* 2 deg ring */}
              <div className="absolute w-24 h-24 rounded-full border border-zinc-700 pointer-events-none" />
              {/* Target Bullseye Center (0.5 deg) */}
              <div className="absolute w-12 h-12 rounded-full border-2 border-emerald-500/60 pointer-events-none flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              {/* Crosshair Lines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-px bg-zinc-800" />
                <div className="h-full w-px bg-zinc-800 absolute" />
              </div>

              {/* The Floating Bubble */}
              <div
                style={{
                  transform: `translate(${bubbleX}px, ${bubbleY}px)`,
                  transition: 'transform 80ms ease-out',
                }}
                className={`w-9 h-9 rounded-full shadow-lg pointer-events-none flex items-center justify-center transition-colors ${
                  isLevel
                    ? 'bg-gradient-to-tr from-emerald-500 to-lime-300 shadow-emerald-500/50'
                    : 'bg-gradient-to-tr from-cyan-400 to-emerald-400 shadow-cyan-500/40'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-white/70 blur-[1px]" />
              </div>
            </div>

            <div className="mt-3 text-[11px] font-mono text-zinc-400 text-center">
              Target center circle represents &lt; 0.25° level plane
            </div>
          </div>

          {/* Horizontal Spirit Tubular Level */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
              <span className="text-zinc-200">TUBULAR VIAL (ROLL AXIS)</span>
              <span className="text-cyan-300 font-bold">{sensorState.roll.toFixed(1)}°</span>
            </div>
            <div className="relative w-full h-8 rounded-full bg-zinc-950 border-2 border-zinc-700 overflow-hidden flex items-center justify-center shadow-inner">
              {/* Center indicators */}
              <div className="absolute w-8 h-full border-x-2 border-emerald-500/60 pointer-events-none" />
              {/* Center line */}
              <div className="absolute w-px h-full bg-zinc-700 pointer-events-none" />
              {/* Vial Bubble */}
              <div
                style={{
                  transform: `translateX(${Math.max(-80, Math.min(80, (sensorState.roll / 30) * 80))}px)`,
                  transition: 'transform 70ms ease-out',
                }}
                className="w-7 h-6 rounded-full bg-gradient-to-b from-cyan-300 to-emerald-400 shadow-md flex items-center justify-center"
              >
                <div className="w-2 h-2 rounded-full bg-white/80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Tilt & Sensor Fusion Sliders (Ideal for Desktop Testing & Fine Tuning) */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
              TACTILE TILT SIMULATOR & COMPLEMENTARY FILTER PARAMETERS
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            Current mode: <strong className="text-cyan-300">{sensorState.sensorMode}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-zinc-300">Pitch Tilt (Front/Back)</span>
              <span className="text-cyan-400 font-bold">{simPitch.toFixed(1)}°</span>
            </div>
            <input
              type="range"
              min="-90"
              max="90"
              step="0.5"
              value={simPitch}
              onChange={(e) => handleManualPitchChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-0.5">
              <span>-90° (Down)</span>
              <span>0° (Level)</span>
              <span>+90° (Up)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-zinc-300">Roll Tilt (Side-to-Side)</span>
              <span className="text-emerald-400 font-bold">{simRoll.toFixed(1)}°</span>
            </div>
            <input
              type="range"
              min="-60"
              max="60"
              step="0.5"
              value={simRoll}
              onChange={(e) => handleManualRollChange(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-0.5">
              <span>-60° (Left)</span>
              <span>0° (Center)</span>
              <span>+60° (Right)</span>
            </div>
          </div>
        </div>

        {/* Filter Details Accordion */}
        {showFilterSettings && (
          <div className="mt-4 pt-4 border-t border-zinc-800 text-xs font-mono space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">Complementary Weight (α):</span>
              <span className="text-cyan-400 font-bold">{alphaFilter.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.99"
              step="0.01"
              value={alphaFilter}
              onChange={(e) => handleAlphaChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[11px] text-zinc-400">
              Formula: θ_t = α(θ_(t-1) + ω·Δt) + (1-α)θ_acc. High α (0.95–0.98) eliminates jitter from hand tremors while avoiding long-term gyroscope bias.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
