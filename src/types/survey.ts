export type UnitSystem = 'm' | 'cm' | 'mm' | 'km' | 'ft' | 'in' | 'miles';

export interface GeoLocationPoint {
  latitude: number;
  longitude: number;
  altitude: number; // meters above sea level
  accuracy: number; // horizontal accuracy in meters
  altitudeAccuracy: number | null; // vertical accuracy in meters
  timestamp: number;
}

export interface EnuCoordinate {
  east: number;  // X (meters)
  north: number; // Y (meters)
  up: number;    // Z (meters)
  accuracy: number;
}

export interface LiveSensorState {
  pitch: number;        // Elevation angle (-90 to +90 degrees)
  roll: number;         // Side tilt (-180 to +180 degrees)
  azimuth: number;      // Compass heading (0 to 360 degrees)
  rawAccelPitch: number;
  rawGyroPitchRate: number;
  isStable: boolean;
  vibrationIntensity: number; // 0 to 1
  estimatedUncertainty: number; // degrees
  zeroOffset: number;   // degrees
  sensorMode: 'Hardware Fusion' | 'Web DeviceOrientation' | 'Precision Simulation';
  activeFilterAlpha: number;
  gyroBias: number;
}

export interface MeasurementRecord {
  id: string;
  projectId: string;
  title: string;
  type: 'TWO_ANGLE_HEIGHT' | 'SLOPE' | '3D_ENU_COORDINATE' | 'POINT_TO_POINT_DISTANCE';
  method: 'GNSS_ENU' | 'CLINOMETER_SIGHTING' | 'MANUAL_MATH' | 'HYBRID_SURVEY';
  horizontalDistance: number; // meters
  verticalHeight: number;     // meters
  baseAngle: number;          // degrees
  topAngle: number;           // degrees
  slopeDistance: number;      // meters
  enuX: number;
  enuY: number;
  enuZ: number;
  instrumentHeight: number;   // meters
  uncertainty: number;        // meters
  notes: string;
  weatherTempC?: number;
  weatherPressureHpa?: number;
  timestamp: number;
}

export interface SurveyProject {
  id: string;
  name: string;
  description: string;
  createdAt: number;
}

export interface EducationalExperiment {
  id: string;
  title: string;
  subtitle: string;
  objective: string;
  category: 'Trigonometry' | 'Elevation' | 'Coordinates' | 'Error Analysis' | 'Slope';
  requiredInputs: {
    key: string;
    label: string;
    unit: string;
    defaultValue: number;
    description: string;
    min?: number;
    max?: number;
  }[];
  instructions: string[];
  formulas: string[];
  conceptualExplanation: string;
  limitations: string;
  calculate: (inputs: Record<string, number>) => {
    primaryValue: number;
    primaryLabel: string;
    primaryUnit: string;
    steps: string[];
    uncertainty: number;
    warning?: string;
  };
}
