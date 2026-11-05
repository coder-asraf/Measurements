package com.xyzmeasure.app.math

import kotlin.math.*

/**
 * SurveyMathEngine
 * Mathematically rigorous coordinate transformation, trigonometry, height calculation,
 * and scientific error propagation based on ISO/IEC Guide 98-3 (GUM).
 */
object SurveyMathEngine {

    // WGS84 Ellipsoid constants
    private const val WGS84_A = 6378137.0 // Semi-major axis (meters)
    private const val WGS84_F = 1.0 / 298.257223563 // Flattening
    private const val WGS84_E2 = 2 * WGS84_F - WGS84_F * WGS84_F // Eccentricity squared

    data class GeoPoint(
        val latitude: Double,
        val longitude: Double,
        val altitudeMeters: Double,
        val horizontalAccuracyMeters: Float = 0f,
        val verticalAccuracyMeters: Float = 0f
    )

    data class EnuPoint(
        val east: Double,   // X (East-West)
        val north: Double,  // Y (North-South)
        val up: Double,     // Z (Vertical Elevation)
        val accuracy: Double
    )

    data class HeightResult(
        val heightMeters: Double,
        val horizontalDistanceMeters: Double,
        val baseAngleDegrees: Double,
        val topAngleDegrees: Double,
        val angleDifferenceDegrees: Double,
        val slopeDistanceMeters: Double,
        val estimatedUncertaintyMeters: Double,
        val isCriticalAngle: Boolean, // Warns if top angle > 75 deg where tan(theta) diverges
        val stepByStepExplanation: String
    )

    data class SlopeResult(
        val horizontalDistance: Double,
        val verticalRise: Double,
        val slopeAngleDegrees: Double,
        val slopePercent: Double,
        val slopeDistance: Double
    )

    /**
     * Haversine formula for great-circle distance between two geographic coordinates
     */
    fun calculateHaversineDistance(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val phi1 = Math.toRadians(lat1)
        val phi2 = Math.toRadians(lat2)
        val deltaPhi = Math.toRadians(lat2 - lat1)
        val deltaLambda = Math.toRadians(lon2 - lon1)

        val a = sin(deltaPhi / 2.0).pow(2) +
                cos(phi1) * cos(phi2) * sin(deltaLambda / 2.0).pow(2)
        val c = 2.0 * atan2(sqrt(a), sqrt(1.0 - a))
        return WGS84_A * c
    }

    /**
     * Converts WGS84 Geodetic coordinates (Lat, Lon, Alt) to Local Cartesian East-North-Up (ENU)
     * relative to an arbitrary reference origin point.
     */
    fun convertGeoToEnu(point: GeoPoint, origin: GeoPoint): EnuPoint {
        // Step 1: Convert Origin to ECEF (Earth-Centered, Earth-Fixed)
        val (ox, oy, oz) = geodeticToEcef(origin.latitude, origin.longitude, origin.altitudeMeters)
        // Step 2: Convert Target Point to ECEF
        val (px, py, pz) = geodeticToEcef(point.latitude, point.longitude, point.altitudeMeters)

        // Delta ECEF
        val dx = px - ox
        val dy = py - oy
        val dz = pz - oz

        // Step 3: Rotate into Local Tangent Plane (ENU)
        val latRad = Math.toRadians(origin.latitude)
        val lonRad = Math.toRadians(origin.longitude)

        val sinLat = sin(latRad)
        val cosLat = cos(latRad)
        val sinLon = sin(lonRad)
        val cosLon = cos(lonRad)

        val east = -sinLon * dx + cosLon * dy
        val north = -sinLat * cosLon * dx - sinLat * sinLon * dy + cosLat * dz
        val up = cosLat * cosLon * dx + cosLat * sinLon * dy + sinLat * dz

        val combinedAccuracy = sqrt(point.horizontalAccuracyMeters.toDouble().pow(2) + origin.horizontalAccuracyMeters.toDouble().pow(2))

        return EnuPoint(east, north, up, combinedAccuracy)
    }

    private fun geodeticToEcef(latDeg: Double, lonDeg: Double, altMeters: Double): Triple<Double, Double, Double> {
        val lat = Math.toRadians(latDeg)
        val lon = Math.toRadians(lonDeg)
        val n = WGS84_A / sqrt(1.0 - WGS84_E2 * sin(lat).pow(2))

        val x = (n + altMeters) * cos(lat) * cos(lon)
        val y = (n + altMeters) * cos(lat) * sin(lon)
        val z = (n * (1.0 - WGS84_E2) + altMeters) * sin(lat)
        return Triple(x, y, z)
    }

    /**
     * Method B: Two-angle Height Measurement
     * Height = Distance * [tan(theta_top) - tan(theta_base)] + instrumentHeight
     * Works when viewing base and top from any elevation.
     */
    fun calculateTwoAngleHeight(
        horizontalDistanceMeters: Double,
        baseAngleDegrees: Double,
        topAngleDegrees: Double,
        instrumentHeightMeters: Double = 0.0,
        distanceUncertaintyMeters: Double = 0.5,
        angleUncertaintyDegrees: Double = 0.2
    ): HeightResult {
        val topRad = Math.toRadians(topAngleDegrees)
        val baseRad = Math.toRadians(baseAngleDegrees)

        val tanTop = tan(topRad)
        val tanBase = tan(baseRad)
        val angleDiff = topAngleDegrees - baseAngleDegrees

        val deltaZ = horizontalDistanceMeters * (tanTop - tanBase)
        val totalHeight = deltaZ + instrumentHeightMeters

        // 3D Slope distance to top
        val slopeDist = sqrt(horizontalDistanceMeters.pow(2) + (horizontalDistanceMeters * tanTop).pow(2))

        // Gaussian Error Propagation:
        // sigma_H = sqrt( (d/dD [H])^2 * sigma_D^2 + (d/dTheta_top [H])^2 * sigma_Theta^2 + (d/dTheta_base [H])^2 * sigma_Theta^2 )
        val sigmaThetaRad = Math.toRadians(angleUncertaintyDegrees)
        val dH_dD = tanTop - tanBase
        val dH_dTop = horizontalDistanceMeters * (1.0 / cos(topRad).pow(2))
        val dH_dBase = -horizontalDistanceMeters * (1.0 / cos(baseRad).pow(2))

        val varianceH = (dH_dD * distanceUncertaintyMeters).pow(2) +
                (dH_dTop * sigmaThetaRad).pow(2) +
                (dH_dBase * sigmaThetaRad).pow(2)
        val sigmaH = sqrt(max(0.0001, varianceH))

        val isCritical = abs(topAngleDegrees) >= 75.0 || abs(baseAngleDegrees) >= 75.0

        val explanation = buildString {
            append("1. Mathematical Formula:\n")
            append("   H = D × [tan(θ_top) - tan(θ_base)] + h_inst\n")
            append("2. Value Substitution:\n")
            append("   D = ${"%.3f".format(horizontalDistanceMeters)} m\n")
            append("   θ_top = ${"%.2f".format(topAngleDegrees)}° (tan = ${"%.4f".format(tanTop)})\n")
            append("   θ_base = ${"%.2f".format(baseAngleDegrees)}° (tan = ${"%.4f".format(tanBase)})\n")
            append("   h_inst = ${"%.3f".format(instrumentHeightMeters)} m\n")
            append("3. Step Calculation:\n")
            append("   Δtan = ${"%.4f".format(tanTop)} - (${"%.4f".format(tanBase)}) = ${"%.4f".format(tanTop - tanBase)}\n")
            append("   ΔZ = ${"%.3f".format(horizontalDistanceMeters)} × ${"%.4f".format(tanTop - tanBase)} = ${"%.3f".format(deltaZ)} m\n")
            append("4. Final Calculated Height:\n")
            append("   H = ${"%.3f".format(totalHeight)} m ± ${"%.3f".format(sigmaH)} m\n")
            if (isCritical) {
                append("⚠️ WARNING: High elevation angle (>75°). Small aiming deviations yield amplified vertical error due to steep derivative of tan(θ).")
            }
        }

        return HeightResult(
            heightMeters = totalHeight,
            horizontalDistanceMeters = horizontalDistanceMeters,
            baseAngleDegrees = baseAngleDegrees,
            topAngleDegrees = topAngleDegrees,
            angleDifferenceDegrees = angleDiff,
            slopeDistanceMeters = slopeDist,
            estimatedUncertaintyMeters = sigmaH,
            isCriticalAngle = isCritical,
            stepByStepExplanation = explanation
        )
    }

    /**
     * Slope and Terrain Calculation
     */
    fun calculateSlope(horizontalDistance: Double, verticalRise: Double): SlopeResult {
        val safeHorizontal = max(0.001, horizontalDistance)
        val slopeAngle = Math.toDegrees(atan(verticalRise / safeHorizontal))
        val slopePercent = (verticalRise / safeHorizontal) * 100.0
        val slopeDistance = sqrt(safeHorizontal.pow(2) + verticalRise.pow(2))

        return SlopeResult(
            horizontalDistance = safeHorizontal,
            verticalRise = verticalRise,
            slopeAngleDegrees = slopeAngle,
            slopePercent = slopePercent,
            slopeDistance = slopeDistance
        )
    }
}
