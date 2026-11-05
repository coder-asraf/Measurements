import React, { useState } from 'react';
import { UnitSystem } from '../types/survey';
import { formatWithUnit, toDegrees, toRadians } from '../services/mathEngine';
import {
  Calculator,
  Triangle,
  Box,
  TrendingUp,
  Circle,
  Square,
  CheckCircle2,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface TrigCalculatorViewProps {
  unit: UnitSystem;
}

export const TrigCalculatorView: React.FC<TrigCalculatorViewProps> = ({ unit }) => {
  const [activeCategory, setActiveCategory] = useState<
    'rightTriangle' | 'pythagoras3D' | 'slopeGradient' | 'areaVolume'
  >('rightTriangle');

  // Right Triangle states
  // Mode: given Adjacent & Opposite, or Hypotenuse & Angle, etc.
  const [adjacent, setAdjacent] = useState<number>(20.0);
  const [opposite, setOpposite] = useState<number>(15.0);
  const [rtAngle, setRtAngle] = useState<number>(36.87);

  // 3D Pythagoras states
  const [px, setPx] = useState<number>(12.0);
  const [py, setPy] = useState<number>(9.0);
  const [pz, setPz] = useState<number>(20.0);

  // Slope & Gradient states
  const [run, setRun] = useState<number>(50.0);
  const [rise, setRise] = useState<number>(4.0);

  // Area & Volume states
  const [geomType, setGeomType] = useState<'triangle' | 'rectangle' | 'circle' | 'cylinder'>('triangle');
  const [dimA, setDimA] = useState<number>(10.0); // base / length / radius
  const [dimB, setDimB] = useState<number>(6.0);  // height / width
  const [dimC, setDimC] = useState<number>(15.0); // cylinder length

  // Right Triangle math
  const rtHypotenuse = Math.sqrt(adjacent ** 2 + opposite ** 2);
  const rtThetaRad = Math.atan2(opposite, Math.max(0.0001, adjacent));
  const rtThetaDeg = toDegrees(rtThetaRad);
  const rtSin = opposite / rtHypotenuse;
  const rtCos = adjacent / rtHypotenuse;
  const rtTan = opposite / adjacent;

  // 3D Pythagoras math
  const dist2D = Math.sqrt(px ** 2 + py ** 2);
  const dist3D = Math.sqrt(px ** 2 + py ** 2 + pz ** 2);

  // Slope math
  const slopePercent = (rise / Math.max(0.0001, run)) * 100;
  const slopeAngleDeg = toDegrees(Math.atan(rise / Math.max(0.0001, run)));
  const slopeHypot = Math.sqrt(run ** 2 + rise ** 2);

  return (
    <div className="space-y-4 pb-20">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">
              TRIGONOMETRY & GEOMETRY MATHEMATICAL ENGINE
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-cyan-300 border border-zinc-700">
              Rigorous 7-Step Deductions
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Step-by-step substitution, formulas, unit conversions, and uncertainty estimates.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
          <button
            onClick={() => setActiveCategory('rightTriangle')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeCategory === 'rightTriangle' ? 'bg-cyan-500 text-black font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Right Triangle
          </button>
          <button
            onClick={() => setActiveCategory('pythagoras3D')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeCategory === 'pythagoras3D' ? 'bg-cyan-500 text-black font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            3D Distance
          </button>
          <button
            onClick={() => setActiveCategory('slopeGradient')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeCategory === 'slopeGradient' ? 'bg-cyan-500 text-black font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Slope & Gradient
          </button>
          <button
            onClick={() => setActiveCategory('areaVolume')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeCategory === 'areaVolume' ? 'bg-cyan-500 text-black font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Area & Volume
          </button>
        </div>
      </div>

      {/* 1. Right Triangle Solver */}
      {activeCategory === 'rightTriangle' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inputs & Visual Triangle */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-2">
                  <Triangle className="w-4 h-4 text-cyan-400" />
                  <span>RIGHT TRIANGLE SIDES & ANGLE INPUTS</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                      Adjacent Side (Run / Baseline)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0.1"
                        value={adjacent}
                        onChange={(e) => setAdjacent(Math.max(0.01, parseFloat(e.target.value) || 0))}
                        className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-cyan-300 font-mono text-sm"
                      />
                      <span className="text-zinc-500 font-mono text-xs">meters</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                      Opposite Side (Rise / Height)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0.1"
                        value={opposite}
                        onChange={(e) => setOpposite(Math.max(0.01, parseFloat(e.target.value) || 0))}
                        className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-emerald-300 font-mono text-sm"
                      />
                      <span className="text-zinc-500 font-mono text-xs">meters</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Triangle SVG diagram */}
              <div className="mt-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center">
                <svg viewBox="0 0 200 130" className="w-48 h-auto">
                  {/* Baseline (Adjacent) */}
                  <line x1="30" y1="100" x2="170" y2="100" stroke="#22d3ee" strokeWidth="2.5" />
                  {/* Vertical (Opposite) */}
                  <line x1="170" y1="100" x2="170" y2="30" stroke="#34d399" strokeWidth="2.5" />
                  {/* Hypotenuse */}
                  <line x1="30" y1="100" x2="170" y2="30" stroke="#f59e0b" strokeWidth="2.5" />
                  {/* Right angle symbol */}
                  <polyline points="155,100 155,85 170,85" fill="none" stroke="#71717a" strokeWidth="1.5" />
                  {/* Labels */}
                  <text x="100" y="118" fill="#22d3ee" fontSize="10" fontFamily="monospace" textAnchor="middle">
                    Adj = {adjacent}m
                  </text>
                  <text x="178" y="70" fill="#34d399" fontSize="10" fontFamily="monospace">
                    Opp = {opposite}m
                  </text>
                  <text x="85" y="55" fill="#f59e0b" fontSize="10" fontFamily="monospace">
                    Hyp = {rtHypotenuse.toFixed(2)}m
                  </text>
                  {/* Angle arc */}
                  <path d="M 55 100 A 25 25 0 0 0 50 88" fill="none" stroke="#e4e4e7" strokeWidth="1.5" />
                  <text x="58" y="90" fill="#ffffff" fontSize="9" fontFamily="monospace">
                    {rtThetaDeg.toFixed(1)}°
                  </text>
                </svg>
              </div>
            </div>

            {/* Step-by-Step 7-Part Mathematical Breakdown */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>STEP-BY-STEP MATHEMATICAL SOLUTION</span>
                </h3>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500">1. INPUT VALUES:</span>
                    <div className="text-zinc-200 mt-0.5">
                      Adjacent = {adjacent} m, Opposite = {opposite} m, Angle C = 90.00°
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500">2. SELECTED FORMULAS:</span>
                    <div className="text-cyan-300 mt-0.5 space-y-0.5">
                      <div>Hypotenuse = √(Adjacent² + Opposite²)</div>
                      <div>Elevation Angle θ = arctan(Opposite / Adjacent)</div>
                      <div>sin(θ) = Opp/Hyp | cos(θ) = Adj/Hyp | tan(θ) = Opp/Adj</div>
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500">3. SUBSTITUTION:</span>
                    <div className="text-zinc-300 mt-0.5">
                      Hyp = √({adjacent}² + {opposite}²) = √({(adjacent ** 2).toFixed(1)} + {(opposite ** 2).toFixed(1)}) = √{(adjacent ** 2 + opposite ** 2).toFixed(1)}
                    </div>
                    <div className="text-zinc-300 mt-0.5">
                      θ = arctan({opposite} / {adjacent}) = arctan({(opposite / adjacent).toFixed(4)})
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500">4. TRIG RATIOS:</span>
                    <div className="text-emerald-400 mt-0.5 grid grid-cols-3 gap-1">
                      <span>sin(θ) = {rtSin.toFixed(4)}</span>
                      <span>cos(θ) = {rtCos.toFixed(4)}</span>
                      <span>tan(θ) = {rtTan.toFixed(4)}</span>
                    </div>
                  </div>

                  <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-500/40">
                    <span className="text-emerald-400 font-bold">5. FINAL ANSWERS:</span>
                    <div className="text-white text-sm font-bold mt-1">
                      Hypotenuse = {formatWithUnit(rtHypotenuse, unit, 3)}
                    </div>
                    <div className="text-cyan-300 text-sm font-bold">
                      Elevation Angle θ = {rtThetaDeg.toFixed(2)}° ({(rtThetaRad).toFixed(4)} rad)
                    </div>
                    <div className="text-zinc-400 text-xs mt-1">
                      Complementary Angle = {(90 - rtThetaDeg).toFixed(2)}°
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. 3D Pythagoras & Displacement */}
      {activeCategory === 'pythagoras3D' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Box className="w-4 h-4" />
            <span>3D EUCLIDEAN DISPLACEMENT & VECTOR NORM CALCULATOR</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">ΔX (East Displacement)</label>
              <input
                type="number"
                value={px}
                onChange={(e) => setPx(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-red-400 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">ΔY (North Displacement)</label>
              <input
                type="number"
                value={py}
                onChange={(e) => setPy(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-emerald-400 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">ΔZ (Vertical Elevation)</label>
              <input
                type="number"
                value={pz}
                onChange={(e) => setPz(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-blue-400 font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-800">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Horizontal 2D Planar Distance</span>
              <div className="text-3xl font-mono font-bold text-cyan-300 mt-1">
                {formatWithUnit(dist2D, unit, 3)}
              </div>
              <div className="text-xs font-mono text-zinc-400 mt-2">
                D_h = √(ΔX² + ΔY²) = √({px}² + {py}²) = √{(px ** 2 + py ** 2).toFixed(1)}
              </div>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">3D Space Vector Norm (D_3D)</span>
              <div className="text-3xl font-mono font-bold text-emerald-400 mt-1">
                {formatWithUnit(dist3D, unit, 3)}
              </div>
              <div className="text-xs font-mono text-zinc-400 mt-2">
                D_3D = √(ΔX² + ΔY² + ΔZ²) = √({px}² + {py}² + {pz}²)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Slope & Gradient */}
      {activeCategory === 'slopeGradient' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>SLOPE PERCENTAGE, GRADE & GRADIENT CALCULATIONS</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Horizontal Run (m)</label>
              <input
                type="number"
                value={run}
                onChange={(e) => setRun(Math.max(0.01, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-cyan-300 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Vertical Rise (m)</label>
              <input
                type="number"
                value={rise}
                onChange={(e) => setRise(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-emerald-300 font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-800 font-mono">
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase">Grade Percentage</span>
              <div className="text-2xl font-bold text-amber-300 mt-1">{slopePercent.toFixed(2)}%</div>
              <div className="text-[10px] text-zinc-500 mt-1">({rise} / {run}) × 100</div>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase">Slope Angle (θ)</span>
              <div className="text-2xl font-bold text-cyan-300 mt-1">{slopeAngleDeg.toFixed(2)}°</div>
              <div className="text-[10px] text-zinc-500 mt-1">arctan({rise}/{run})</div>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase">Slope Hypotenuse</span>
              <div className="text-2xl font-bold text-emerald-300 mt-1">{formatWithUnit(slopeHypot, unit, 2)}</div>
              <div className="text-[10px] text-zinc-500 mt-1">√(Run² + Rise²)</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Area & Volume */}
      {activeCategory === 'areaVolume' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Square className="w-4 h-4" />
              <span>GEOMETRIC AREA & VOLUME CALCULATOR</span>
            </h3>

            <div className="flex gap-1 text-xs font-mono">
              {(['triangle', 'rectangle', 'circle', 'cylinder'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setGeomType(type)}
                  className={`px-2 py-1 rounded-lg capitalize ${
                    geomType === type ? 'bg-cyan-500 text-black font-semibold' : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                {geomType === 'circle' || geomType === 'cylinder' ? 'Radius (r)' : 'Base / Length (a)'}
              </label>
              <input
                type="number"
                value={dimA}
                onChange={(e) => setDimA(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-cyan-300 font-mono text-sm"
              />
            </div>

            {geomType !== 'circle' && (
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  {geomType === 'cylinder' ? 'Cylinder Height (h)' : 'Height / Width (b)'}
                </label>
                <input
                  type="number"
                  value={dimB}
                  onChange={(e) => setDimB(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-emerald-300 font-mono text-sm"
                />
              </div>
            )}
          </div>

          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex items-baseline justify-between font-mono">
            <div>
              <span className="text-xs text-zinc-400">Calculated Quantity:</span>
              <div className="text-3xl font-bold text-white mt-1">
                {geomType === 'triangle' && `${((dimA * dimB) / 2).toFixed(3)} m² (Area)`}
                {geomType === 'rectangle' && `${(dimA * dimB).toFixed(3)} m² (Area)`}
                {geomType === 'circle' && `${(Math.PI * dimA ** 2).toFixed(3)} m² (Circumference: ${(2 * Math.PI * dimA).toFixed(3)}m)`}
                {geomType === 'cylinder' && `${(Math.PI * dimA ** 2 * dimB).toFixed(3)} m³ (Volume)`}
              </div>
            </div>
            <div className="text-xs text-zinc-500">
              {geomType === 'triangle' && 'Formula: A = ½ × base × height'}
              {geomType === 'rectangle' && 'Formula: A = length × width'}
              {geomType === 'circle' && 'Formula: A = π × r²'}
              {geomType === 'cylinder' && 'Formula: V = π × r² × h'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
