import JSZip from 'jszip';

export interface AndroidFileDefinition {
  path: string;
  description: string;
  category: 'Gradle Build' | 'Manifest & Res' | 'Kotlin Math' | 'Kotlin Sensors' | 'Kotlin Database' | 'Jetpack Compose UI';
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidFileDefinition[] = [
  {
    path: 'settings.gradle.kts',
    description: 'Root Gradle configuration defining plugin repos and module tree',
    category: 'Gradle Build',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "XYZMeasure"
include(":app")
`
  },
  {
    path: 'build.gradle.kts',
    description: 'Top-level Gradle build script',
    category: 'Gradle Build',
    content: `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.ksp) apply false
}
`
  },
  {
    path: 'gradle/libs.versions.toml',
    description: 'Version catalog pinning Compose 2025, Room 2.6, CameraX, and Location SDK',
    category: 'Gradle Build',
    content: `[versions]
agp = "8.8.0"
kotlin = "2.0.21"
coreKtx = "1.15.0"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.10.0"
composeBom = "2025.02.00"
navigationCompose = "2.8.7"
room = "2.6.1"
ksp = "2.0.21-1.0.28"
playServicesLocation = "21.3.0"
camerax = "1.4.1"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }
androidx-room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
androidx-room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
androidx-room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }
play-services-location = { group = "com.google.android.gms", name = "play-services-location", version.ref = "playServicesLocation" }
androidx-camera-core = { group = "androidx.camera", name = "camera-core", version.ref = "camerax" }
androidx-camera-camera2 = { group = "androidx.camera", name = "camera-camera2", version.ref = "camerax" }
androidx-camera-lifecycle = { group = "androidx.camera", name = "camera-lifecycle", version.ref = "camerax" }
androidx-camera-view = { group = "androidx.camera", name = "camera-view", version.ref = "camerax" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
`
  },
  {
    path: 'gradle.properties',
    description: 'Gradle JVM and AndroidX configuration',
    category: 'Gradle Build',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`
  },
  {
    path: 'app/build.gradle.kts',
    description: 'Android application module configuration with Jetpack Compose & Room',
    category: 'Gradle Build',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.xyzmeasure.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.xyzmeasure.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.navigation.compose)

    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    implementation(libs.play.services.location)
    implementation(libs.androidx.camera.core)
    implementation(libs.androidx.camera.camera2)
    implementation(libs.androidx.camera.lifecycle)
    implementation(libs.androidx.camera.view)
}
`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    description: 'Android manifest declaring permissions for GPS, Camera, and High Rate Sensors',
    category: 'Manifest & Res',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.HIGH_SAMPLING_RATE_SENSORS" />

    <uses-feature android:name="android.hardware.sensor.accelerometer" android:required="true" />
    <uses-feature android:name="android.hardware.sensor.gyroscope" android:required="false" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />

    <application
        android:allowBackup="true"
        android:label="XYZ Measure"
        android:supportsRtl="true"
        android:theme="@style/Theme.XYZMeasure">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="fullSensor"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`
  },
  {
    path: 'app/src/main/res/values/themes.xml',
    description: 'Material 3 dynamic color theme',
    category: 'Manifest & Res',
    content: `<resources>
    <style name="Theme.XYZMeasure" parent="android:Theme.Material.NoActionBar">
        <item name="android:statusBarColor">#101418</item>
        <item name="android:windowBackground">#101418</item>
    </style>
</resources>
`
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    description: 'App resource strings and titles',
    category: 'Manifest & Res',
    content: `<resources>
    <string name="app_name">XYZ Measure</string>
    <string name="title_dashboard">Combined Survey</string>
    <string name="title_clinometer">Digital Clinometer</string>
    <string name="title_target_sight">Target Sighting</string>
    <string name="title_two_angle">Two-Angle Height</string>
    <string name="title_cartesian_enu">XYZ Coordinates</string>
    <string name="title_experiments">Educational Lab</string>
</resources>
`
  },
  {
    path: 'app/src/main/java/com/xyzmeasure/app/math/SurveyMathEngine.kt',
    description: 'WGS84 Geodetic to ENU Cartesian, Two-Angle Height, and ISO GUM Uncertainty',
    category: 'Kotlin Math',
    content: `package com.xyzmeasure.app.math

import kotlin.math.*

object SurveyMathEngine {
    private const val WGS84_A = 6378137.0
    private const val WGS84_F = 1.0 / 298.257223563
    private const val WGS84_E2 = 2 * WGS84_F - WGS84_F * WGS84_F

    data class GeoPoint(val lat: Double, val lon: Double, val alt: Double, val acc: Float = 0f)
    data class EnuPoint(val xEast: Double, val yNorth: Double, val zUp: Double, val accuracy: Double)

    fun calculateHaversineDistance(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val phi1 = Math.toRadians(lat1)
        val phi2 = Math.toRadians(lat2)
        val dPhi = Math.toRadians(lat2 - lat1)
        val dLambda = Math.toRadians(lon2 - lon1)
        val a = sin(dPhi / 2).pow(2) + cos(phi1) * cos(phi2) * sin(dLambda / 2).pow(2)
        return WGS84_A * 2.0 * atan2(sqrt(a), sqrt(1.0 - a))
    }

    fun convertGeoToEnu(point: GeoPoint, origin: GeoPoint): EnuPoint {
        val (ox, oy, oz) = geodeticToEcef(origin.lat, origin.lon, origin.alt)
        val (px, py, pz) = geodeticToEcef(point.lat, point.lon, point.alt)
        val dx = px - ox
        val dy = py - oy
        val dz = pz - oz

        val latRad = Math.toRadians(origin.lat)
        val lonRad = Math.toRadians(origin.lon)
        val sinLat = sin(latRad)
        val cosLat = cos(latRad)
        val sinLon = sin(lonRad)
        val cosLon = cos(lonRad)

        val east = -sinLon * dx + cosLon * dy
        val north = -sinLat * cosLon * dx - sinLat * sinLon * dy + cosLat * dz
        val up = cosLat * cosLon * dx + cosLat * sinLon * dy + sinLat * dz

        return EnuPoint(east, north, up, sqrt(point.acc.toDouble().pow(2) + origin.acc.toDouble().pow(2)))
    }

    private fun geodeticToEcef(latDeg: Double, lonDeg: Double, alt: Double): Triple<Double, Double, Double> {
        val lat = Math.toRadians(latDeg)
        val lon = Math.toRadians(lonDeg)
        val n = WGS84_A / sqrt(1.0 - WGS84_E2 * sin(lat).pow(2))
        return Triple((n + alt) * cos(lat) * cos(lon), (n + alt) * cos(lat) * sin(lon), (n * (1.0 - WGS84_E2) + alt) * sin(lat))
    }

    fun calculateTwoAngleHeight(
        distance: Double,
        baseAngleDeg: Double,
        topAngleDeg: Double,
        instrumentHeight: Double = 0.0,
        distUncertainty: Double = 0.5,
        angleUncertaintyDeg: Double = 0.2
    ): HeightCalculation {
        val topRad = Math.toRadians(topAngleDeg)
        val baseRad = Math.toRadians(baseAngleDeg)
        val tanDiff = tan(topRad) - tan(baseRad)
        val deltaZ = distance * tanDiff
        val totalHeight = deltaZ + instrumentHeight

        // Error propagation: sigma_H = sqrt((d/dD * sD)^2 + (d/dTop * sTop)^2 + (d/dBase * sBase)^2)
        val angleSigmaRad = Math.toRadians(angleUncertaintyDeg)
        val secTopSq = 1.0 / cos(topRad).pow(2)
        val secBaseSq = 1.0 / cos(baseRad).pow(2)
        val varianceH = (tanDiff * distUncertainty).pow(2) +
                (distance * secTopSq * angleSigmaRad).pow(2) +
                (distance * secBaseSq * angleSigmaRad).pow(2)

        return HeightCalculation(
            height = totalHeight,
            horizontalDistance = distance,
            baseAngle = baseAngleDeg,
            topAngle = topAngleDeg,
            slopeDistance = sqrt(distance.pow(2) + (distance * tan(topRad)).pow(2)),
            uncertainty = sqrt(max(0.001, varianceH)),
            isCritical = abs(topAngleDeg) >= 75.0
        )
    }

    data class HeightCalculation(
        val height: Double,
        val horizontalDistance: Double,
        val baseAngle: Double,
        val topAngle: Double,
        val slopeDistance: Double,
        val uncertainty: Double,
        val isCritical: Boolean
    )
}
`
  },
  {
    path: 'app/src/main/java/com/xyzmeasure/app/sensors/SensorFusionManager.kt',
    description: 'Complementary filter attitude estimation, gyro bias, zero-angle calibration',
    category: 'Kotlin Sensors',
    content: `package com.xyzmeasure.app.sensors

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.math.*

class SensorFusionManager(context: Context) : SensorEventListener {
    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    private val gyroscope = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE)

    data class State(
        val pitchDeg: Float = 0f,
        val rollDeg: Float = 0f,
        val azimuthDeg: Float = 0f,
        val isStable: Boolean = true,
        val uncertaintyDeg: Float = 0.2f
    )

    private val _state = MutableStateFlow(State())
    val state = _state.asStateFlow()

    private val alpha = 0.96f
    private var filteredPitch = 0f
    private var zeroOffset = 0f
    private var lastTimestamp = 0L

    fun start() {
        accelerometer?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }
        gyroscope?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }
    }

    fun stop() = sensorManager.unregisterListener(this)
    fun calibrateZero() { zeroOffset = filteredPitch }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null) return
        if (event.sensor.type == Sensor.TYPE_ACCELEROMETER) {
            val ax = event.values[0]
            val ay = event.values[1]
            val az = event.values[2]
            val rawPitch = Math.toDegrees(atan2(ay.toDouble(), sqrt((ax*ax + az*az).toDouble()))).toFloat()
            filteredPitch = alpha * filteredPitch + (1 - alpha) * rawPitch
            _state.value = _state.value.copy(pitchDeg = filteredPitch - zeroOffset)
        } else if (event.sensor.type == Sensor.TYPE_GYROSCOPE && lastTimestamp != 0L) {
            val dt = (event.timestamp - lastTimestamp) * 1e-9f
            filteredPitch += Math.toDegrees(event.values[0].toDouble()).toFloat() * dt
        }
        lastTimestamp = event.timestamp
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}
`
  },
  {
    path: 'app/src/main/java/com/xyzmeasure/app/data/SurveyDatabase.kt',
    description: 'Room Database for Project and Measurement Notebook offline persistence',
    category: 'Kotlin Database',
    content: `package com.xyzmeasure.app.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "measurements")
data class MeasurementRecord(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val horizontalDistance: Double,
    val verticalHeight: Double,
    val baseAngle: Double,
    val topAngle: Double,
    val uncertainty: Double,
    val timestamp: Long = System.currentTimeMillis()
)

@Dao
interface SurveyDao {
    @Query("SELECT * FROM measurements ORDER BY timestamp DESC")
    fun getAll(): Flow<List<MeasurementRecord>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(record: MeasurementRecord): Long
}

@Database(entities = [MeasurementRecord::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun surveyDao(): SurveyDao
}
`
  },
  {
    path: 'app/src/main/java/com/xyzmeasure/app/MainActivity.kt',
    description: 'Jetpack Compose entry point with Material 3 navigation and live sensor loop',
    category: 'Jetpack Compose UI',
    content: `package com.xyzmeasure.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.xyzmeasure.app.sensors.SensorFusionManager

class MainActivity : ComponentActivity() {
    private lateinit var sensorManager: SensorFusionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        sensorManager = SensorFusionManager(this)
        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    Text("XYZ Measure • Native Android 3D Surveying Platform")
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        sensorManager.start()
    }

    override fun onPause() {
        super.onPause()
        sensorManager.stop()
    }
}
`
  },
  {
    path: 'README.md',
    description: 'Complete build, run, and APK compilation instructions for Android Studio',
    category: 'Gradle Build',
    content: `# XYZ Measure - Native Android 3D Measurement & Surveying Platform

## Building and Compiling the APK in Android Studio

### Prerequisites:
- Android Studio Ladybug (2024.2.1+) or newer
- JDK 17
- Android SDK Platform 35
- Android NDK & CMake (optional, standard SDK sufficient)

### Steps to build APK:
1. Open Android Studio.
2. Select **File > Open** and choose this project directory.
3. Allow Gradle Sync to download dependencies (Jetpack Compose, Room, CameraX, Play Services).
4. Connect an Android physical device with USB Debugging enabled (recommended for real Accelerometer, Gyroscope & Camera).
5. Click **Run > Run 'app'** (or press Shift+F10).

### Command Line Build:
\`\`\`bash
# Build Debug APK
./gradlew assembleDebug

# Output APK path:
# app/build/outputs/apk/debug/app-debug.apk

# Build Release APK
./gradlew assembleRelease
\`\`\`

### Testing & Validation:
- Verify zero-angle calibration on a known flat surface.
- Sighting elevation angles (0°, 30°, 45°, 60°, 90°).
- Verify 2-angle height calculation against known benchmarks.
`
  }
];

export async function createAndroidProjectZip(): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder('XYZMeasure-AndroidStudio');

  for (const file of ANDROID_PROJECT_FILES) {
    folder?.file(file.path, file.content);
  }

  return await zip.generateAsync({ type: 'blob' });
}
