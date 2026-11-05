package com.xyzmeasure.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.xyzmeasure.app.sensors.SensorFusionManager

class MainActivity : ComponentActivity() {

    private lateinit var sensorFusionManager: SensorFusionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        sensorFusionManager = SensorFusionManager(this)

        setContent {
            XYZMeasureTheme {
                MainAppScaffold(sensorFusionManager = sensorFusionManager)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        sensorFusionManager.startListening()
    }

    override fun onPause() {
        super.onPause()
        sensorFusionManager.stopListening()
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScaffold(sensorFusionManager: SensorFusionManager) {
    var selectedTab by remember { mutableStateOf(0) }
    val sensorState by sensorFusionManager.sensorState.collectAsState()

    val navItems = listOf(
        "Dashboard" to Icons.Default.Dashboard,
        "Clinometer" to Icons.Default.ScreenRotation,
        "Target Sight" to Icons.Default.CameraAlt,
        "Calculator" to Icons.Default.Calculate,
        "3D Coordinates" to Icons.Default.ViewInAr,
        "Experiments" to Icons.Default.School,
        "Notebook" to Icons.Default.Book
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("XYZ Measure • Survey & Math") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                ),
                actions = {
                    IconButton(onClick = { sensorFusionManager.calibrateZeroAngle() }) {
                        Icon(Icons.Default.Tune, contentDescription = "Calibrate Zero")
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar {
                navItems.take(5).forEachIndexed { index, (label, icon) ->
                    NavigationBarItem(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        icon = { Icon(icon, contentDescription = label) },
                        label = { Text(label) }
                    )
                }
            }
        }
    ) { innerPadding ->
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            color = MaterialTheme.colorScheme.background
        ) {
            // Render active screen based on selectedTab
            // In Android Studio, screens are wired to SurveyViewModel & Room DB
        }
    }
}

@Composable
fun XYZMeasureTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Color(0xFF00E5FF),
            secondary = Color(0xFF76FF03),
            background = Color(0xFF101418),
            surface = Color(0xFF1B2228),
            onPrimary = Color.Black,
            onBackground = Color.White
        ),
        content = content
    )
}
