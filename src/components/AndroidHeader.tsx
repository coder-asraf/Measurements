import React from 'react';
import { UnitSystem } from '../types/survey';
import { UNIT_CONVERSIONS } from '../services/mathEngine';
import { ShieldAlert, Compass, Navigation, Zap, BatteryCharging, Wifi, Sliders } from 'lucide-react';

interface AndroidHeaderProps {
  unit: UnitSystem;
  onUnitChange: (unit: UnitSystem) => void;
  isStable: boolean;
  vibrationIntensity: number;
  sensorMode: string;
  gpsAccuracy: number;
  onOpenCalibration: () => void;
  onOpenAndroidHub: () => void;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  unit,
  onUnitChange,
  isStable,
  sensorMode,
  gpsAccuracy,
  onOpenCalibration,
  onOpenAndroidHub,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 text-zinc-100 select-none">
      {/* Android System Status Bar Simulation */}
      <div className="flex items-center justify-between px-4 py-1 text-[11px] font-mono text-zinc-400 bg-black/60 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-200">XYZ MEASURE</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
            ANDROID NATIVE ENGINE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-cyan-400" />
            <span>GNSS</span>
          </span>
          <span className="flex items-center gap-1">
            <BatteryCharging className="w-3 h-3 text-emerald-400" />
            <span>100%</span>
          </span>
          <span className="text-zinc-300">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Main App Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-950/50 flex-shrink-0">
            <Compass className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 truncate">
              <span>XYZ Measure</span>
              <span className="text-[10px] font-mono font-normal px-1.5 py-0.2 rounded bg-zinc-800 text-cyan-300 border border-zinc-700">
                v1.0.0
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isStable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="truncate">{sensorMode}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400 font-mono">GPS ±{gpsAccuracy.toFixed(1)}m</span>
            </p>
          </div>
        </div>

        {/* Actions & Unit Selector */}
        <div className="flex items-center gap-1.5">
          {/* Unit Selector */}
          <div className="relative">
            <select
              value={unit}
              onChange={(e) => onUnitChange(e.target.value as UnitSystem)}
              className="appearance-none bg-zinc-900 border border-zinc-700 text-cyan-300 text-xs font-mono font-medium rounded-lg px-2.5 py-1.5 pr-6 hover:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              title="Select Measurement Unit"
            >
              {Object.entries(UNIT_CONVERSIONS).map(([key, item]) => (
                <option key={key} value={key} className="bg-zinc-900 text-zinc-200">
                  {item.symbol} ({item.label})
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[9px]">
              ▼
            </div>
          </div>

          {/* Quick Calibration shortcut */}
          <button
            onClick={onOpenCalibration}
            title="Sensor Calibration Center"
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-cyan-400 transition-colors"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Android Studio Source & APK Hub button */}
          <button
            onClick={onOpenAndroidHub}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors shadow-sm"
            title="Inspect Android Studio Source Code & Download APK Project"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline font-mono">Android Studio Project</span>
            <span className="sm:hidden font-mono text-[11px]">APK Code</span>
          </button>
        </div>
      </div>
    </header>
  );
};
