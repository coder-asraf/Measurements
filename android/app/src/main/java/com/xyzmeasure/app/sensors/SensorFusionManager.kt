package com.xyzmeasure.app.sensors

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.math.*

/**
 * SensorFusionManager
 * Multi-axis attitude estimation fusing Accelerometer and Gyroscope via Complementary Filter,
 * with Rotation Vector fallback, Zero-Angle calibration, and Vibration/Stability detection.
 */
class SensorFusionManager(context: Context) : SensorEventListener {

    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val accelerometer: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    private val gyroscope: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
    private val rotationVector: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
    private val magnetometer: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)

    data class SensorState(
        val pitchDegrees: Float = 0f,          // Elevation angle (-90 to +90)
        val rollDegrees: Float = 0f,           // Side tilt (-180 to +180)
        val azimuthDegrees: Float = 0f,        // Compass heading (0 to 360)
        val pitchUncertainty: Float = 0.2f,    // Estimated degree uncertainty
        val isStable: Boolean = true,          // Sensor stability indicator
        val vibrationIntensity: Float = 0f,    // Normalized vibration level
        val gyroBiasDegreesPerSec: Float = 0f, // Estimated gyro drift bias
        val zeroOffsetDegrees: Float = 0f,     // Calibration zero offset
        val sensorMode: String = "Fusion (Acc+Gyro)"
    )

    private val _sensorState = MutableStateFlow(SensorState())
    val sensorState: StateFlow<SensorState> = _sensorState.asStateFlow()

    // Complementary Filter parameters
    private val alpha = 0.96f // Weight for gyro integration (fast response, low drift)
    private var lastTimestamp: Long = 0L
    private var filteredPitch = 0f
    private var filteredRoll = 0f
    private var zeroOffset = 0f

    // Stability & variance tracking
    private val pitchHistory = ArrayDeque<Float>(15)
    private var gyroBiasEstimate = 0f

    fun startListening() {
        // Sample at 50Hz (GAME delay) for smooth surveying response
        accelerometer?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }
        gyroscope?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }
        rotationVector?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }
        magnetometer?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }
    }

    fun stopListening() {
        sensorManager.unregisterListener(this)
    }

    fun calibrateZeroAngle() {
        // Zero out current pitch angle to set new reference level
        zeroOffset = filteredPitch
        _sensorState.value = _sensorState.value.copy(zeroOffsetDegrees = zeroOffset)
    }

    fun resetCalibration() {
        zeroOffset = 0f
        _sensorState.value = _sensorState.value.copy(zeroOffsetDegrees = 0f)
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null) return

        when (event.sensor.type) {
            Sensor.TYPE_ROTATION_VECTOR -> {
                // If high-precision hardware rotation vector is active, use it for orientation matrix
                val rotationMatrix = FloatArray(9)
                SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values)
                val orientation = FloatArray(3)
                SensorManager.getOrientation(rotationMatrix, orientation)

                val pitch = Math.toDegrees(orientation[1].toDouble()).toFloat() - zeroOffset
                val roll = Math.toDegrees(orientation[2].toDouble()).toFloat()
                val azimuth = (Math.toDegrees(orientation[0].toDouble()).toFloat() + 360f) % 360f

                updateStability(pitch)

                _sensorState.value = _sensorState.value.copy(
                    pitchDegrees = pitch,
                    rollDegrees = roll,
                    azimuthDegrees = azimuth,
                    sensorMode = "Hardware Rotation Vector"
                )
            }

            Sensor.TYPE_ACCELEROMETER -> {
                val ax = event.values[0]
                val ay = event.values[1]
                val az = event.values[2]

                // Accelerometer angle calculation relative to gravity vector
                val rawPitch = Math.toDegrees(atan2(ay.toDouble(), sqrt((ax * ax + az * az).toDouble()))).toFloat()
                val rawRoll = Math.toDegrees(atan2(-ax.toDouble(), az.toDouble())).toFloat()

                if (lastTimestamp == 0L) {
                    filteredPitch = rawPitch
                    filteredRoll = rawRoll
                } else {
                    // Update complementary filter with accelerometer gravity vector
                    filteredPitch = alpha * filteredPitch + (1 - alpha) * rawPitch
                    filteredRoll = alpha * filteredRoll + (1 - alpha) * rawRoll
                }
            }

            Sensor.TYPE_GYROSCOPE -> {
                if (lastTimestamp != 0L) {
                    val dt = (event.timestamp - lastTimestamp) * 1.0e-9f // Convert ns to seconds
                    if (dt in 0.001f..0.2f) {
                        val gyroPitchRate = Math.toDegrees(event.values[0].toDouble()).toFloat()
                        // Complementary filter step: theta_t = alpha * (theta_{t-1} + omega*dt) + (1-alpha) * theta_acc
                        filteredPitch += gyroPitchRate * dt
                    }
                }
                lastTimestamp = event.timestamp
            }
        }
    }

    private fun updateStability(currentPitch: Float) {
        if (pitchHistory.size >= 15) {
            pitchHistory.removeFirst()
        }
        pitchHistory.addLast(currentPitch)

        if (pitchHistory.size >= 5) {
            val mean = pitchHistory.average().toFloat()
            val variance = pitchHistory.map { (it - mean) * (it - mean) }.average().toFloat()
            val isStable = variance < 0.08f // Stable when angle variance is within 0.08 deg^2
            val vibration = min(1.0f, sqrt(variance) / 2.0f)

            _sensorState.value = _sensorState.value.copy(
                isStable = isStable,
                vibrationIntensity = vibration,
                pitchUncertainty = max(0.1f, sqrt(variance))
            )
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}
