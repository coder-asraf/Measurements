package com.xyzmeasure.app.data

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.RoomDatabase
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "projects")
data class ProjectEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val description: String,
    val createdAtEpoch: Long = System.currentTimeMillis()
)

@Entity(tableName = "measurements")
data class MeasurementEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val projectId: Long,
    val title: String,
    val measurementType: String, // "TWO_ANGLE_HEIGHT", "SLOPE", "3D_ENU_COORDINATE", "DISTANCE"
    val measurementMethod: String, // "GNSS_ENU", "SIGHTING_CLINOMETER", "MANUAL_MATH"
    val horizontalDistanceMeters: Double,
    val verticalHeightMeters: Double,
    val baseAngleDeg: Double,
    val topAngleDeg: Double,
    val slopeDistanceMeters: Double,
    val enuX: Double,
    val enuY: Double,
    val enuZ: Double,
    val estimatedUncertaintyMeters: Double,
    val notes: String = "",
    val timestampEpoch: Long = System.currentTimeMillis()
)

@Dao
interface SurveyDao {
    @Query("SELECT * FROM projects ORDER BY createdAtEpoch DESC")
    fun getAllProjects(): Flow<List<ProjectEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProject(project: ProjectEntity): Long

    @Query("SELECT * FROM measurements WHERE projectId = :projectId ORDER BY timestampEpoch DESC")
    fun getMeasurementsForProject(projectId: Long): Flow<List<MeasurementEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMeasurement(measurement: MeasurementEntity): Long

    @Query("DELETE FROM measurements WHERE id = :id")
    suspend fun deleteMeasurement(id: Long)
}

@Database(entities = [ProjectEntity::class, MeasurementEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun surveyDao(): SurveyDao
}
