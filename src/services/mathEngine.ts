import { UnitSystem, EnuCoordinate, GeoLocationPoint } from '../types/survey';

// WGS84 Constants
const WGS84_A = 6378137.0; // semi-major axis (meters)
const WGS84_F = 1.0 / 298.257223563;
const WGS84_E2 = 2 * WGS84_F - WGS84_F * WGS84_F;

export const UNIT_CONVERSIONS: Record<UnitSystem, { toMeters: number; symbol: string; label: string }> = {
  m: { toMeters: 1.0, symbol: 'm', label: 'Meters' },
  cm: { toMeters: 0.01, symbol: 'cm', label: 'Centimeters' },
  mm: { toMeters: 0.001, symbol: 'mm', label: 'Millimeters' },
  km: { toMeters: 1000.0, symbol: 'km', label: 'Kilometers' },
  ft: { toMeters: 0.3048, symbol: 'ft', label: 'Feet' },
  in: { toMeters: 0.0254, symbol: 'in', label: 'Inches' },
  miles: { toMeters: 1609.344, symbol: 'mi', label: 'Miles' },
};

export function convertFromMeters(meters: number, targetUnit: UnitSystem): number {
  return meters / UNIT_CONVERSIONS[targetUnit].toMeters;
}

export function convertToMeters(value: number, fromUnit: UnitSystem): number {
  return value * UNIT_CONVERSIONS[fromUnit].toMeters;
}

export function formatWithUnit(meters: number, unit: UnitSystem, precision = 3): string {
  const converted = convertFromMeters(meters, unit);
  return `${converted.toFixed(precision)} ${UNIT_CONVERSIONS[unit].symbol}`;
}

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Haversine formula for spherical great circle distance
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaPhi = toRadians(lat2 - lat1);
  const deltaLambda = toRadians(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return WGS84_A * c;
}

/**
 * Geodetic coordinates (Lat, Lon, Alt) to ECEF Cartesian (X, Y, Z)
 */
function geodeticToEcef(latDeg: number, lonDeg: number, altMeters: number): [number, number, number] {
  const lat = toRadians(latDeg);
  const lon = toRadians(lonDeg);
  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);
  const sinLon = Math.sin(lon);
  const cosLon = Math.cos(lon);

  const n = WGS84_A / Math.sqrt(1.0 - WGS84_E2 * sinLat * sinLat);
  const x = (n + altMeters) * cosLat * cosLon;
  const y = (n + altMeters) * cosLat * sinLon;
  const z = (n * (1.0 - WGS84_E2) + altMeters) * sinLat;
  return [x, y, z];
}

/**
 * Converts geographic location to local East-North-Up (ENU) coordinate relative to a local origin
 */
export function convertGeoToEnu(point: GeoLocationPoint, origin: GeoLocationPoint): EnuCoordinate {
  const [ox, oy, oz] = geodeticToEcef(origin.latitude, origin.longitude, origin.altitude);
  const [px, py, pz] = geodeticToEcef(point.latitude, point.longitude, point.altitude);

  const dx = px - ox;
  const dy = py - oy;
  const dz = pz - oz;

  const latRad = toRadians(origin.latitude);
  const lonRad = toRadians(origin.longitude);

  const sinLat = Math.sin(latRad);
  const cosLat = Math.cos(latRad);
  const sinLon = Math.sin(lonRad);
  const cosLon = Math.cos(lonRad);

  const east = -sinLon * dx + cosLon * dy;
  const north = -sinLat * cosLon * dx - sinLat * sinLon * dy + cosLat * dz;
  const up = cosLat * cosLon * dx + cosLat * sinLon * dy + sinLat * dz;

  const combinedAccuracy = Math.sqrt(point.accuracy ** 2 + origin.accuracy ** 2);
  return { east, north, up, accuracy: combinedAccuracy };
}

export interface TwoAngleHeightCalculation {
  height: number;              // meters
  deltaZ: number;              // meters from base to top
  horizontalDistance: number;  // meters
  baseAngle: number;           // degrees
  topAngle: number;            // degrees
  angleDifference: number;     // degrees
  slopeDistance: number;       // meters
  instrumentHeight: number;    // meters
  uncertainty: number;         // estimated sigma_H in meters
  isCritical: boolean;         // true if |theta| >= 75 deg
  formulaSteps: string[];
}

/**
 * Two-angle height measurement method:
 * H = D * [tan(theta_top) - tan(theta_base)] + instrumentHeight
 */
export function calculateTwoAngleHeight(
  distanceMeters: number,
  baseAngleDeg: number,
  topAngleDeg: number,
  instrumentHeight = 0,
  distanceUncertainty = 0.5,
  angleUncertaintyDeg = 0.2
): TwoAngleHeightCalculation {
  const topRad = toRadians(topAngleDeg);
  const baseRad = toRadians(baseAngleDeg);

  const tanTop = Math.tan(topRad);
  const tanBase = Math.tan(baseRad);
  const tanDiff = tanTop - tanBase;

  const deltaZ = distanceMeters * tanDiff;
  const totalHeight = deltaZ + instrumentHeight;

  // Slope distance from observer eye to object top
  const slopeDistance = Math.sqrt(distanceMeters ** 2 + (distanceMeters * tanTop) ** 2);

  // Gaussian Error Propagation:
  // sigma_H = sqrt((d/dD * sigma_D)^2 + (d/dTop * sigma_Top)^2 + (d/dBase * sigma_Base)^2)
  const angleSigmaRad = toRadians(angleUncertaintyDeg);
  const secTopSq = 1.0 / (Math.cos(topRad) ** 2);
  const secBaseSq = 1.0 / (Math.cos(baseRad) ** 2);

  const termD = (tanDiff * distanceUncertainty) ** 2;
  const termTop = (distanceMeters * secTopSq * angleSigmaRad) ** 2;
  const termBase = (distanceMeters * secBaseSq * angleSigmaRad) ** 2;

  const sigmaH = Math.sqrt(termD + termTop + termBase);
  const isCritical = Math.abs(topAngleDeg) >= 75 || Math.abs(baseAngleDeg) >= 75;

  const formulaSteps = [
    `Formula: H = D × [tan(θ_top) - tan(θ_base)] + h_inst`,
    `Input Distance D = ${distanceMeters.toFixed(3)} m (±${distanceUncertainty.toFixed(2)} m)`,
    `Top Angle θ_top = ${topAngleDeg.toFixed(2)}° ⟹ tan(θ_top) = ${tanTop.toFixed(4)}`,
    `Base Angle θ_base = ${baseAngleDeg.toFixed(2)}° ⟹ tan(θ_base) = ${tanBase.toFixed(4)}`,
    `Angular Differential Δtan = ${tanTop.toFixed(4)} - (${tanBase.toFixed(4)}) = ${tanDiff.toFixed(4)}`,
    `Vertical Rise ΔZ = ${distanceMeters.toFixed(3)} m × ${tanDiff.toFixed(4)} = ${deltaZ.toFixed(3)} m`,
    `Instrument Offset h_inst = ${instrumentHeight.toFixed(3)} m`,
    `Total Object Height H = ${totalHeight.toFixed(3)} m`,
    `Estimated Standard Uncertainty σ_H = ±${sigmaH.toFixed(3)} m (coverage k=1, ~68% confidence)`,
    `Slope Distance to Top = ${slopeDistance.toFixed(3)} m`
  ];

  if (isCritical) {
    formulaSteps.push(
      `⚠️ SENSITIVITY WARNING: Aiming angle exceeds 75°. At high angles, sec²(θ) grows exponentially, amplifying angular jitter into large vertical height errors.`
    );
  }

  return {
    height: totalHeight,
    deltaZ,
    horizontalDistance: distanceMeters,
    baseAngle: baseAngleDeg,
    topAngle: topAngleDeg,
    angleDifference: topAngleDeg - baseAngleDeg,
    slopeDistance,
    instrumentHeight,
    uncertainty: sigmaH,
    isCritical,
    formulaSteps
  };
}

/**
 * Slope and Terrain Calculation
 */
export function calculateSlopeMetrics(horizontalRun: number, verticalRise: number) {
  const safeRun = Math.max(0.0001, horizontalRun);
  const slopeAngleRad = Math.atan(verticalRise / safeRun);
  const slopeAngleDeg = toDegrees(slopeAngleRad);
  const slopePercent = (verticalRise / safeRun) * 100;
  const slopeDistance = Math.sqrt(safeRun ** 2 + verticalRise ** 2);

  return {
    horizontalRun: safeRun,
    verticalRise,
    slopeAngleDeg,
    slopePercent,
    slopeDistance,
    ratio: `1 : ${(safeRun / Math.max(0.0001, Math.abs(verticalRise))).toFixed(2)}`
  };
}

/**
 * 3D Coordinate Displacement and Euclidean metrics
 */
export function calculate3DDisplacement(p1: EnuCoordinate, p2: EnuCoordinate) {
  const dx = p2.east - p1.east;
  const dy = p2.north - p1.north;
  const dz = p2.up - p1.up;

  const horizontalDistance = Math.sqrt(dx ** 2 + dy ** 2);
  const distance3D = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
  const azimuthRad = Math.atan2(dx, dy); // Azimuth clockwise from North (Y)
  const azimuthDeg = (toDegrees(azimuthRad) + 360) % 360;
  const elevationAngleDeg = toDegrees(Math.atan2(dz, horizontalDistance));

  return {
    dx,
    dy,
    dz,
    horizontalDistance,
    distance3D,
    azimuthDeg,
    elevationAngleDeg,
  };
}
