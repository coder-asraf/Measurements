import React, { useState } from 'react';
import { LiveSensorState } from '../types/survey';
import { sensorManager } from '../services/sensorManager';
import {
  Sliders,
  CheckCircle,
  RotateCcw,
  Activity,
  Compass,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Clock
} from 'lucide-react';

interface CalibrationViewProps {
  sensorState: LiveSensorState;
  gpsAccuracy: number;
  onCalibrateZero: () => void;
  onResetCalibration: () => void;
}

export const CalibrationView: React.FC<CalibrationViewProps> = ({
  sensorState,
  gpsAccuracy,
  onCalibrateZero,
  onResetCalibration,
}) => {
  const [lastZeroCalTime, setLastZeroCalTime] = useState<string>('Not calibrated this session');
  const [lastGyroCalTime, setLastGyroCalTime] = useState<string>('Factory Default');
  const [calibrationSuccessMessage, setCalibrationSuccessMessage] = useState<string | null>(null);

  const handleZeroCalibrate = () => {
    sensorManager.calibrateZero();
    const timeStr = new Date().toLocaleTimeString();
    setLastZeroCalTime(timeStr);
    showNotice(`Zero plane set at ${sensorState.rawAccelPitch.toFixed(2)}° (Offset: ${sensorState.pitch.toFixed(2)}°)`);
  };

  const handleGyroBiasCalibrate = () => {
    sensorManager.calibrateGyroBias();
    const timeStr = new Date().toLocaleTimeString();
    setLastGyroCalTime(timeStr);
    showNotice(`Stationary gyroscope bias nullified at rate ${sensorState.rawGyroPitchRate.toFixed(3)}°/s`);
  };

  const showNotice = (msg: string) => {
    setCalibrationSuccessMessage(msg);
    setTimeout(() => setCalibrationSuccessMessage(null), 3500);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">
              CALIBRATION CENTER & SENSOR VALIDATION
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-cyan-300 border border-zinc-700">
              Metrology Diagnostic Suite
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Zero-angle offsets, gyroscope drift compensation, accelerometer integrity, and GPS quality checks.
          </p>
        </div>

        <button
          onClick={onResetCalibration}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Calibrations</span>
        </button>
      </div>

      {calibrationSuccessMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 font-mono shadow-md">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{calibrationSuccessMessage}</span>
        </div>
      )}

      {/* Grid of 6 Calibration Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Module 1: Zero-Angle Horizontal Reference Calibration */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>1. ZERO-ANGLE DATUM CALIBRATION</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                Offset: {sensorState.zeroOffset.toFixed(2)}°
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Place the smartphone on a verified level surface (such as a precision machinist granite plate, spirit-level table, or flat countertop).
            </p>
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center justify-between">
              <span>Current Raw Sensor Pitch:</span>
              <span className="text-white font-bold">{sensorState.rawAccelPitch.toFixed(2)}°</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{lastZeroCalTime}</span>
            </span>
            <button
              onClick={handleZeroCalibrate}
              className="py-1.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono shadow"
            >
              Set Zero Reference
            </button>
          </div>
        </div>

        {/* Module 2: Gyroscope Drift & Bias Calibration */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                <span>2. GYROSCOPE BIAS DRIFT ESTIMATION</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                Bias: {sensorState.gyroBias.toFixed(3)}°/s
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Keep the device completely stationary for 3 seconds to measure the static DC offset of the angular rate MEMS gyro sensor.
            </p>
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center justify-between">
              <span>Live Angular Rate:</span>
              <span className="text-emerald-400 font-bold">{sensorState.rawGyroPitchRate.toFixed(3)} °/s</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{lastGyroCalTime}</span>
            </span>
            <button
              onClick={handleGyroBiasCalibrate}
              className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono shadow"
            >
              Nullify Gyro Bias
            </button>
          </div>
        </div>

        {/* Module 3: Accelerometer Calibration Checks */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>3. ACCELEROMETER INTEGRITY & NOISE</span>
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${sensorState.isStable ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                {sensorState.isStable ? 'Stable' : 'Tremor'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Monitors vibration variance and gravity norm. Confirms sensor responsiveness without stuck axes.
            </p>
            <div className="space-y-1.5 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-400">Vibration Index:</span>
                <span className="text-purple-300">{(sensorState.vibrationIntensity * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Noise StdDev (1σ):</span>
                <span className="text-white">±{sensorState.estimatedUncertainty}°</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[10px] font-mono text-zinc-500">
            Sampling Rate: 50 Hz Hardware Sensor Delay
          </div>
        </div>

        {/* Module 4: GPS Signal Quality & Constellation Monitor */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>4. GNSS / GPS ACCURACY ASSESSMENT</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                ±{gpsAccuracy.toFixed(1)}m
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Standard GPS multipath error rejection. Evaluates horizontal confidence ellipse before surveying baselines.
            </p>
            <div className="space-y-1.5 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-400">Survey Grade Status:</span>
                <span className={gpsAccuracy < 3 ? 'text-emerald-400' : 'text-amber-400'}>
                  {gpsAccuracy < 3 ? 'High Precision Fix' : 'Coarse Mobile GNSS'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Recommended Baseline:</span>
                <span className="text-white">&gt; 15 m (to minimize % error)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[10px] font-mono text-zinc-500">
            WGS84 Ellipsoidal Geodetic Reference Frame
          </div>
        </div>
      </div>
    </div>
  );
};
