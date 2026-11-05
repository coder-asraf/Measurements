import React, { useState, useEffect, useRef } from 'react';
import { UnitSystem, LiveSensorState } from '../types/survey';
import { calculateTwoAngleHeight, formatWithUnit, toDegrees, toRadians } from '../services/mathEngine';
import {
  Crosshair,
  Camera,
  CameraOff,
  Compass,
  TrendingUp,
  Check,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Calculator,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  BookmarkPlus
} from 'lucide-react';

interface TargetSightingViewProps {
  sensorState: LiveSensorState;
  unit: UnitSystem;
  onSaveMeasurement: (record: any) => void;
}

export const TargetSightingView: React.FC<TargetSightingViewProps> = ({
  sensorState,
  unit,
  onSaveMeasurement,
}) => {
  // Method selection: 'twoAngle' (Method B) | 'singleAngle' (Method A) | 'solveAny' (Method C)
  const [method, setMethod] = useState<'twoAngle' | 'singleAngle' | 'solveAny'>('twoAngle');

  // Survey inputs
  const [distance, setDistance] = useState<number>(20.0);
  const [baseAngle, setBaseAngle] = useState<number>(-2.5);
  const [topAngle, setTopAngle] = useState<number>(45.0);
  const [instrumentHeight, setInstrumentHeight] = useState<number>(1.65);
  const [distanceUncertainty, setDistanceUncertainty] = useState<number>(0.2);

  // Method C known solver inputs
  const [solveUnknown, setSolveUnknown] = useState<'height' | 'distance' | 'angle'>('height');
  const [knownD, setKnownD] = useState<number>(20.0);
  const [knownH, setKnownH] = useState<number>(21.6);
  const [knownTheta, setKnownTheta] = useState<number>(45.0);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showFormulaSteps, setShowFormulaSteps] = useState<boolean>(true);

  // Start / stop camera stream
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isCameraActive) {
      navigator.mediaDevices
        ?.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
          audio: false,
        })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
          setCameraError(null);
        })
        .catch((err) => {
          console.warn('Camera stream error:', err);
          setCameraError('Camera access unavailable. Using virtual surveying backdrop.');
          setIsCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraActive]);

  // Height calculations
  const calcTwoAngle = calculateTwoAngleHeight(
    distance,
    baseAngle,
    topAngle,
    instrumentHeight,
    distanceUncertainty,
    sensorState.estimatedUncertainty
  );

  const singleAngleH = distance * Math.tan(toRadians(topAngle)) + instrumentHeight;

  const handleCaptureBase = () => {
    setBaseAngle(Number(sensorState.pitch.toFixed(2)));
  };

  const handleCaptureTop = () => {
    setTopAngle(Number(sensorState.pitch.toFixed(2)));
  };

  // Method C solver
  const computeSolveAny = () => {
    if (solveUnknown === 'height') {
      const h = knownD * Math.tan(toRadians(knownTheta));
      return {
        val: h,
        label: 'Calculated Height (H)',
        unitText: 'm',
        step: `H = D × tan(θ) = ${knownD}m × tan(${knownTheta}°) = ${h.toFixed(3)} m`,
      };
    } else if (solveUnknown === 'distance') {
      const d = knownH / Math.tan(toRadians(knownTheta));
      return {
        val: d,
        label: 'Calculated Baseline Distance (D)',
        unitText: 'm',
        step: `D = H / tan(θ) = ${knownH}m / tan(${knownTheta}°) = ${d.toFixed(3)} m`,
      };
    } else {
      const thetaRad = Math.atan(knownH / knownD);
      const thetaDeg = toDegrees(thetaRad);
      return {
        val: thetaDeg,
        label: 'Calculated Elevation Angle (θ)',
        unitText: '°',
        step: `θ = arctan(H / D) = arctan(${knownH}m / ${knownD}m) = ${thetaDeg.toFixed(2)}°`,
      };
    }
  };

  const solveResult = computeSolveAny();

  return (
    <div className="space-y-4 pb-20">
      {/* Title & Method Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">
              TARGET SIGHTING & TWO-ANGLE HEIGHT CALCULATOR
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-cyan-300 border border-zinc-700">
              Method A / B / C
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Sighting elevation angles toward base and top of poles, trees, and buildings.
          </p>
        </div>

        {/* Method Switcher Buttons */}
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
          <button
            onClick={() => setMethod('twoAngle')}
            className={`px-3 py-1 rounded-lg transition-all ${
              method === 'twoAngle'
                ? 'bg-cyan-500 text-black font-semibold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Method B: Two-Angle
          </button>
          <button
            onClick={() => setMethod('singleAngle')}
            className={`px-3 py-1 rounded-lg transition-all ${
              method === 'singleAngle'
                ? 'bg-cyan-500 text-black font-semibold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Method A: Level Base
          </button>
          <button
            onClick={() => setMethod('solveAny')}
            className={`px-3 py-1 rounded-lg transition-all ${
              method === 'solveAny'
                ? 'bg-cyan-500 text-black font-semibold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Method C: Known Solver
          </button>
        </div>
      </div>

      {/* Camera Sightline Viewport with Reticle Overlay */}
      <div className="relative w-full aspect-video max-h-[380px] bg-zinc-950 rounded-3xl overflow-hidden border-2 border-zinc-800 shadow-2xl flex items-center justify-center">
        {/* Real Camera Stream or Surveying Grid Backdrop */}
        {isCameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-sky-950/40 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center p-4">
            {/* Horizon line */}
            <div className="w-full h-px bg-cyan-500/30 absolute" style={{ top: '50%' }} />
            {/* Simulated Survey Target Graphic */}
            <div className="relative flex flex-col items-center opacity-60">
              <div className="w-1.5 h-44 bg-zinc-600 rounded" />
              <div className="w-20 h-1.5 bg-zinc-500 absolute top-4" />
              <div className="w-16 h-1.5 bg-zinc-500 absolute top-10" />
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/50 absolute top-[-10px] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
              </div>
            </div>
            <span className="text-[11px] font-mono text-zinc-500 mt-2 z-10">
              Virtual Survey Target • Camera is standby
            </span>
          </div>
        )}

        {/* Reticle HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10">
          {/* Top HUD bar */}
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-cyan-300">
              <Compass className="w-3.5 h-3.5" />
              <span>HEADING: {sensorState.azimuth.toFixed(0)}°</span>
            </div>
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-emerald-400">
              <span className={`w-2 h-2 rounded-full ${sensorState.isStable ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
              <span>LIVE PITCH: {sensorState.pitch.toFixed(2)}°</span>
            </div>
          </div>

          {/* Center Reticle Crosshairs */}
          <div className="relative flex items-center justify-center self-center">
            {/* Outer Ring */}
            <div className="w-28 h-28 rounded-full border-2 border-cyan-400/70 flex items-center justify-center">
              {/* Inner Bullseye */}
              <div className="w-10 h-10 rounded-full border border-cyan-300/80 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>
            </div>
            {/* Crosshair Spikes */}
            <div className="absolute w-36 h-0.5 bg-cyan-400/70" />
            <div className="absolute h-36 w-0.5 bg-cyan-400/70" />
            {/* Horizontal level bar */}
            <div
              style={{ transform: `rotate(${-sensorState.roll}deg)` }}
              className="absolute w-44 h-0.5 bg-emerald-400/80 transition-transform duration-75"
            />
          </div>

          {/* Bottom Aiming Guidance */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-zinc-300 border border-white/10">
              Roll: {sensorState.roll.toFixed(1)}°
            </span>
            <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-cyan-300 border border-white/10">
              Uncertainty: ±{sensorState.estimatedUncertainty}°
            </span>
          </div>
        </div>

        {/* Camera Toggle Button (Top Right inside viewport) */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={() => setIsCameraActive(!isCameraActive)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-xs font-mono text-zinc-200 border border-zinc-700 shadow-lg backdrop-blur-md transition-colors"
          >
            {isCameraActive ? (
              <>
                <CameraOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Pause Camera</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Open Camera Aim</span>
              </>
            )}
          </button>
        </div>
      </div>

      {cameraError && (
        <p className="text-xs text-amber-400/80 font-mono text-center">{cameraError}</p>
      )}

      {/* Sighting Controls & Two-Angle Resection Flow */}
      {method === 'twoAngle' && (
        <div className="space-y-4">
          {/* Step Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Step 1: Base Angle */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase text-cyan-400 font-bold">
                    STEP 1: SIGHT BASE (θ_base)
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                    {baseAngle >= 0 ? `+${baseAngle.toFixed(2)}` : baseAngle.toFixed(2)}°
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Align center reticle crosshair with the footing / lowest ground contact point of the target.
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={handleCaptureBase}
                  className="flex-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono transition-colors shadow flex items-center justify-center gap-1.5"
                >
                  <Crosshair className="w-4 h-4" />
                  <span>Lock Base Angle ({sensorState.pitch.toFixed(1)}°)</span>
                </button>
                <input
                  type="number"
                  step="0.1"
                  value={baseAngle}
                  onChange={(e) => setBaseAngle(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-cyan-300 font-mono text-xs text-center"
                />
              </div>
            </div>

            {/* Step 2: Top Angle */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold">
                    STEP 2: SIGHT TOP (θ_top)
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                    {topAngle >= 0 ? `+${topAngle.toFixed(2)}` : topAngle.toFixed(2)}°
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Pivot phone vertically to align crosshair with the crown apex, top crossarm, or roof parapet.
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={handleCaptureTop}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono transition-colors shadow flex items-center justify-center gap-1.5"
                >
                  <Crosshair className="w-4 h-4" />
                  <span>Lock Top Angle ({sensorState.pitch.toFixed(1)}°)</span>
                </button>
                <input
                  type="number"
                  step="0.1"
                  value={topAngle}
                  onChange={(e) => setTopAngle(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-emerald-300 font-mono text-xs text-center"
                />
              </div>
            </div>
          </div>

          {/* Baseline Distance & Instrument Height Inputs */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  Baseline Distance (D)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={distance}
                    onChange={(e) => setDistance(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-cyan-300 font-mono text-sm focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-zinc-500 font-mono text-xs">meters</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  Instrument Eye Height (h_inst)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={instrumentHeight}
                    onChange={(e) => setInstrumentHeight(parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-200 font-mono text-sm focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-zinc-500 font-mono text-xs">meters</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  Distance Uncertainty (σ_D)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.05"
                    min="0.01"
                    value={distanceUncertainty}
                    onChange={(e) => setDistanceUncertainty(parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-amber-300 font-mono text-sm focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-zinc-500 font-mono text-xs">±m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Big Result Card */}
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border-2 border-emerald-500/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  TOTAL CALCULATED VERTICAL HEIGHT (H)
                </span>
                <div className="text-5xl font-mono font-bold text-white tracking-tight mt-1">
                  {formatWithUnit(calcTwoAngle.height, unit, 3)}
                </div>
                <div className="text-xs font-mono text-zinc-400 mt-2 flex items-center gap-3">
                  <span>
                    Uncertainty: <strong className="text-emerald-400">±{formatWithUnit(calcTwoAngle.uncertainty, unit, 3)}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Slope Dist: <strong className="text-purple-300">{formatWithUnit(calcTwoAngle.slopeDistance, unit, 3)}</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() =>
                    onSaveMeasurement({
                      projectId: 'proj_default',
                      title: `Target Height @ ${calcTwoAngle.height.toFixed(2)}m`,
                      type: 'TWO_ANGLE_HEIGHT',
                      method: 'CLINOMETER_SIGHTING',
                      horizontalDistance: distance,
                      verticalHeight: calcTwoAngle.height,
                      baseAngle,
                      topAngle,
                      slopeDistance: calcTwoAngle.slopeDistance,
                      enuX: distance * 0.707,
                      enuY: distance * 0.707,
                      enuZ: calcTwoAngle.height,
                      instrumentHeight,
                      uncertainty: calcTwoAngle.uncertainty,
                      notes: `Target sighting: Base ${baseAngle}° | Top ${topAngle}° | Distance ${distance}m`,
                      timestamp: Date.now(),
                    })
                  }
                  className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono transition-colors shadow flex items-center justify-center gap-1.5"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Save to Project Notebook</span>
                </button>
              </div>
            </div>

            {calcTwoAngle.isCritical && (
              <div className="mt-4 p-3 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  Angle approaches or exceeds ±75°. The derivative sec²(θ) amplifies angular error dramatically. Recommend increasing distance D to achieve ~45° top angle.
                </span>
              </div>
            )}
          </div>

          {/* Mathematical Step-by-Step Solution Breakdown */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
            <button
              onClick={() => setShowFormulaSteps(!showFormulaSteps)}
              className="w-full flex items-center justify-between text-xs font-mono font-bold uppercase text-zinc-300 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-cyan-400" />
                <span>MATHEMATICAL DEDUCTION & SUBSTITUTION STEPS</span>
              </span>
              {showFormulaSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showFormulaSteps && (
              <div className="mt-3 space-y-2 text-xs font-mono border-t border-zinc-800 pt-3">
                {calcTwoAngle.formulaSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`py-1 px-2 rounded ${
                      idx === 0
                        ? 'bg-zinc-950 text-cyan-300 font-semibold border border-zinc-800'
                        : idx === calcTwoAngle.formulaSteps.length - 1
                        ? 'bg-emerald-950/50 text-emerald-300 font-bold border border-emerald-800/40'
                        : 'text-zinc-300'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Method A: Level Base */}
      {method === 'singleAngle' && (
        <div className="space-y-4">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
            <div className="text-xs font-mono uppercase text-cyan-400 font-bold mb-2">
              METHOD A: SINGLE ANGLE (LEVEL GROUND)
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Assumes observer footing and target base are on a horizontal datum plane. Height = D × tan(θ) + h_inst.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Distance (D)</label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-cyan-300 font-mono text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Top Elevation Angle (θ)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={topAngle}
                    onChange={(e) => setTopAngle(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-emerald-300 font-mono text-sm"
                  />
                  <button
                    onClick={handleCaptureTop}
                    className="px-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-mono text-zinc-300"
                  >
                    Aim
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Instrument Height (h_inst)</label>
                <input
                  type="number"
                  value={instrumentHeight}
                  onChange={(e) => setInstrumentHeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-200 font-mono text-sm"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800 flex items-baseline justify-between">
              <div>
                <span className="text-xs font-mono text-zinc-400">Object Height (H):</span>
                <div className="text-3xl font-mono font-bold text-white mt-1">
                  {formatWithUnit(singleAngleH, unit, 3)}
                </div>
              </div>
              <div className="text-xs font-mono text-zinc-400">
                Formula: {distance}m × tan({topAngle}°) + {instrumentHeight}m
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Method C: Known Distance Solver */}
      {method === 'solveAny' && (
        <div className="space-y-4">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
            <div className="text-xs font-mono uppercase text-cyan-400 font-bold mb-2">
              METHOD C: KNOWN-DISTANCE TRIGONOMETRIC RECTANGLE SOLVER
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Enter any two known quantities to solve for the third: Distance (D), Angle (θ), or Height (H).
            </p>

            {/* Select Unknown */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-mono text-zinc-400">Calculate Unknown:</span>
              {(['height', 'distance', 'angle'] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setSolveUnknown(item)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-colors ${
                    solveUnknown === item
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Inputs based on unknown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {solveUnknown !== 'distance' && (
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Baseline Distance D (m)</label>
                  <input
                    type="number"
                    value={knownD}
                    onChange={(e) => setKnownD(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-cyan-300 font-mono text-sm"
                  />
                </div>
              )}
              {solveUnknown !== 'height' && (
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Vertical Height H (m)</label>
                  <input
                    type="number"
                    value={knownH}
                    onChange={(e) => setKnownH(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-emerald-300 font-mono text-sm"
                  />
                </div>
              )}
              {solveUnknown !== 'angle' && (
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Elevation Angle θ (°)</label>
                  <input
                    type="number"
                    value={knownTheta}
                    onChange={(e) => setKnownTheta(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-amber-300 font-mono text-sm"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800 flex items-baseline justify-between">
              <div>
                <span className="text-xs font-mono text-zinc-400">{solveResult.label}:</span>
                <div className="text-3xl font-mono font-bold text-white mt-1">
                  {solveResult.val.toFixed(3)} {solveResult.unitText}
                </div>
              </div>
              <div className="text-xs font-mono text-cyan-300 max-w-sm text-right">
                {solveResult.step}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
