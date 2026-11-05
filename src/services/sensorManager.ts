import { LiveSensorState, GeoLocationPoint } from '../types/survey';

type SensorCallback = (state: LiveSensorState) => void;
type LocationCallback = (point: GeoLocationPoint) => void;

class SurveySensorManager {
  private callbacks: Set<SensorCallback> = new Set();
  private locationCallbacks: Set<LocationCallback> = new Set();
  private watchId: number | null = null;

  // Sensor state
  private state: LiveSensorState = {
    pitch: 0,
    roll: 0,
    azimuth: 0,
    rawAccelPitch: 0,
    rawGyroPitchRate: 0,
    isStable: true,
    vibrationIntensity: 0,
    estimatedUncertainty: 0.15,
    zeroOffset: 0,
    sensorMode: 'Precision Simulation',
    activeFilterAlpha: 0.95,
    gyroBias: 0.0,
  };

  private lastTime = 0;
  private filteredPitch = 0;
  private recentPitches: number[] = [];
  private hasHardwareSensors = false;
  private simulatedPitch = 0;
  private simulatedRoll = 0;
  private simulatedAzimuth = 45;

  constructor() {
    this.initSensors();
  }

  private initSensors() {
    if (typeof window === 'undefined') return;

    // Check deviceorientation
    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', this.handleDeviceOrientation);
    }

    if ('DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', this.handleDeviceMotion);
    }

    // Geolocation
    if ('geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const pt: GeoLocationPoint = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude || 120.0,
            accuracy: pos.coords.accuracy || 2.5,
            altitudeAccuracy: pos.coords.altitudeAccuracy,
            timestamp: pos.timestamp,
          };
          this.locationCallbacks.forEach((cb) => cb(pt));
        },
        (err) => {
          console.warn('Geolocation warning or denied:', err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
      );
    }
  }

  private handleDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (event.beta === null || event.gamma === null) return;
    this.hasHardwareSensors = true;

    // Beta: front-to-back tilt (-180 to 180), Gamma: left-to-right tilt (-90 to 90), Alpha: compass (0 to 360)
    const rawPitch = event.beta;
    const roll = event.gamma;
    const azimuth = event.alpha || 0;

    const now = performance.now();
    const dt = this.lastTime ? (now - this.lastTime) / 1000 : 0.02;
    this.lastTime = now;

    // Complementary filter
    const alpha = this.state.activeFilterAlpha;
    // Gyro rate integration + Accel correction
    this.filteredPitch = alpha * (this.filteredPitch + this.state.rawGyroPitchRate * dt) + (1 - alpha) * rawPitch;

    this.updatePitchHistory(this.filteredPitch);

    this.state = {
      ...this.state,
      pitch: this.filteredPitch - this.state.zeroOffset,
      roll,
      azimuth,
      rawAccelPitch: rawPitch,
      sensorMode: 'Hardware Fusion',
    };

    this.notify();
  };

  private handleDeviceMotion = (event: DeviceMotionEvent) => {
    if (event.rotationRate && event.rotationRate.beta !== null) {
      this.state.rawGyroPitchRate = event.rotationRate.beta - this.state.gyroBias;
    }
  };

  private updatePitchHistory(val: number) {
    this.recentPitches.push(val);
    if (this.recentPitches.length > 20) this.recentPitches.shift();

    if (this.recentPitches.length >= 8) {
      const mean = this.recentPitches.reduce((a, b) => a + b, 0) / this.recentPitches.length;
      const variance =
        this.recentPitches.reduce((sum, p) => sum + (p - mean) ** 2, 0) / this.recentPitches.length;
      const stdDev = Math.sqrt(variance);

      this.state.isStable = stdDev < 0.2;
      this.state.vibrationIntensity = Math.min(1.0, stdDev / 2.0);
      this.state.estimatedUncertainty = Math.max(0.1, Number(stdDev.toFixed(2)));
    }
  }

  public subscribe(cb: SensorCallback): () => void {
    this.callbacks.add(cb);
    cb(this.state);
    return () => this.callbacks.delete(cb);
  }

  public subscribeLocation(cb: LocationCallback): () => void {
    this.locationCallbacks.add(cb);
    return () => this.locationCallbacks.delete(cb);
  }

  private notify() {
    this.callbacks.forEach((cb) => cb({ ...this.state }));
  }

  public calibrateZero() {
    this.state.zeroOffset = this.filteredPitch || this.simulatedPitch;
    this.state.pitch = (this.filteredPitch || this.simulatedPitch) - this.state.zeroOffset;
    this.notify();
  }

  public resetCalibration() {
    this.state.zeroOffset = 0;
    this.state.gyroBias = 0;
    this.notify();
  }

  public calibrateGyroBias() {
    // Take mean of recent gyro reading as stationary bias
    this.state.gyroBias = this.state.rawGyroPitchRate;
    this.notify();
  }

  public setFilterAlpha(alpha: number) {
    this.state.activeFilterAlpha = Math.max(0.5, Math.min(0.99, alpha));
    this.notify();
  }

  // Simulation controls for testing when device is desktop or flat on table
  public setSimulatedAngles(pitch: number, roll: number, azimuth?: number) {
    this.simulatedPitch = pitch;
    this.simulatedRoll = roll;
    if (azimuth !== undefined) this.simulatedAzimuth = azimuth;

    this.filteredPitch = pitch;
    this.updatePitchHistory(pitch);

    this.state = {
      ...this.state,
      pitch: pitch - this.state.zeroOffset,
      roll,
      azimuth: this.simulatedAzimuth,
      rawAccelPitch: pitch,
      sensorMode: this.hasHardwareSensors ? 'Hardware Fusion' : 'Precision Simulation',
    };
    this.notify();
  }

  public testKnownAngle(targetDeg: number) {
    this.setSimulatedAngles(targetDeg, 0);
  }

  public getState(): LiveSensorState {
    return { ...this.state };
  }
}

export const sensorManager = new SurveySensorManager();
