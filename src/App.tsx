import React, { useState, useEffect } from 'react';
import { UnitSystem, LiveSensorState, GeoLocationPoint } from './types/survey';
import { sensorManager } from './services/sensorManager';
import { addMeasurement } from './services/projectStorage';
import { AndroidHeader } from './components/AndroidHeader';
import { AndroidNavBar, ActiveTab } from './components/AndroidNavBar';
import { DashboardView } from './components/DashboardView';
import { ClinometerView } from './components/ClinometerView';
import { TargetSightingView } from './components/TargetSightingView';
import { Coordinate3DView } from './components/Coordinate3DView';
import { TrigCalculatorView } from './components/TrigCalculatorView';
import { SlopeTerrainView } from './components/SlopeTerrainView';
import { EducationalView } from './components/EducationalView';
import { CalibrationView } from './components/CalibrationView';
import { NotebookView } from './components/NotebookView';
import { AndroidProjectHub } from './components/AndroidProjectHub';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [unit, setUnit] = useState<UnitSystem>('m');
  const [sensorState, setSensorState] = useState<LiveSensorState>(() => sensorManager.getState());
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(1.8);
  const [showCalibrationModal, setShowCalibrationModal] = useState<boolean>(false);

  // Subscribe to live sensor manager updates (DeviceOrientation, Gyro, Accel, GPS)
  useEffect(() => {
    const unsubSensors = sensorManager.subscribe((state) => {
      setSensorState(state);
    });

    const unsubLocation = sensorManager.subscribeLocation((pt: GeoLocationPoint) => {
      if (pt.accuracy) {
        setGpsAccuracy(pt.accuracy);
      }
    });

    return () => {
      unsubSensors();
      unsubLocation();
    };
  }, []);

  const handleSaveMeasurement = (record: any) => {
    addMeasurement(record);
  };

  const handleCalibrateZero = () => {
    sensorManager.calibrateZero();
  };

  const handleResetCalibration = () => {
    sensorManager.resetCalibration();
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Material 3 Android Header */}
      <AndroidHeader
        unit={unit}
        onUnitChange={setUnit}
        isStable={sensorState.isStable}
        vibrationIntensity={sensorState.vibrationIntensity}
        sensorMode={sensorState.sensorMode}
        gpsAccuracy={gpsAccuracy}
        onOpenCalibration={() => setShowCalibrationModal(true)}
        onOpenAndroidHub={() => setActiveTab('androidHub')}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <DashboardView
            sensorState={sensorState}
            unit={unit}
            gpsAccuracy={gpsAccuracy}
            onNavigateTab={setActiveTab}
            onSaveMeasurement={handleSaveMeasurement}
            onCalibrateZero={handleCalibrateZero}
          />
        )}

        {activeTab === 'clinometer' && (
          <ClinometerView
            sensorState={sensorState}
            onCalibrateZero={handleCalibrateZero}
            onResetCalibration={handleResetCalibration}
          />
        )}

        {activeTab === 'targetSight' && (
          <TargetSightingView
            sensorState={sensorState}
            unit={unit}
            onSaveMeasurement={handleSaveMeasurement}
          />
        )}

        {activeTab === 'coordinates3D' && (
          <Coordinate3DView unit={unit} />
        )}

        {activeTab === 'calculator' && (
          <TrigCalculatorView unit={unit} />
        )}

        {activeTab === 'slopeTerrain' && (
          <SlopeTerrainView
            sensorState={sensorState}
            unit={unit}
            onSaveMeasurement={handleSaveMeasurement}
          />
        )}

        {activeTab === 'educational' && (
          <EducationalView
            unit={unit}
            onSaveMeasurement={handleSaveMeasurement}
          />
        )}

        {activeTab === 'notebook' && (
          <NotebookView unit={unit} />
        )}

        {activeTab === 'androidHub' && (
          <AndroidProjectHub />
        )}
      </main>

      {/* Bottom Material 3 Android Navigation Bar */}
      <AndroidNavBar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Calibration Modal */}
      {showCalibrationModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-700 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold font-mono uppercase text-cyan-400">
                SENSOR CALIBRATION & METROLOGY CENTER
              </h3>
              <button
                onClick={() => setShowCalibrationModal(false)}
                className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 transition-colors"
              >
                Close
              </button>
            </div>

            <CalibrationView
              sensorState={sensorState}
              gpsAccuracy={gpsAccuracy}
              onCalibrateZero={handleCalibrateZero}
              onResetCalibration={handleResetCalibration}
            />
          </div>
        </div>
      )}
    </div>
  );
}
