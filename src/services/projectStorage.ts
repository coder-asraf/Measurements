import { MeasurementRecord, SurveyProject } from '../types/survey';

const STORAGE_KEY_PROJECTS = 'xyz_measure_projects_v1';
const STORAGE_KEY_RECORDS = 'xyz_measure_records_v1';

const DEFAULT_PROJECTS: SurveyProject[] = [
  {
    id: 'proj_default',
    name: 'Campus Topography & Structural Survey',
    description: 'Field survey measurements of campus buildings, utility lines, and terrain slopes.',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'proj_civil',
    name: 'Bridge Approach Ramp Slope Study',
    description: 'Highway engineering slope and elevation verification project.',
    createdAt: Date.now() - 86400000 * 5,
  }
];

const DEFAULT_MEASUREMENTS: MeasurementRecord[] = [
  {
    id: 'rec_1',
    projectId: 'proj_default',
    title: 'North Telecom Tower',
    type: 'TWO_ANGLE_HEIGHT',
    method: 'CLINOMETER_SIGHTING',
    horizontalDistance: 20.0,
    verticalHeight: 21.6,
    baseAngle: -2.5,
    topAngle: 45.0,
    slopeDistance: 28.284,
    enuX: 12.45,
    enuY: 8.25,
    enuZ: 21.6,
    instrumentHeight: 1.65,
    uncertainty: 0.35,
    notes: 'Base sighted at concrete footing, top sighted at lightning arrestor apex. Calm wind.',
    weatherTempC: 22,
    weatherPressureHpa: 1013,
    timestamp: Date.now() - 3600000 * 4,
  },
  {
    id: 'rec_2',
    projectId: 'proj_default',
    title: 'Quad Oak Tree Height',
    type: 'TWO_ANGLE_HEIGHT',
    method: 'CLINOMETER_SIGHTING',
    horizontalDistance: 15.2,
    verticalHeight: 12.8,
    baseAngle: -1.2,
    topAngle: 38.4,
    slopeDistance: 19.42,
    enuX: 6.8,
    enuY: 13.6,
    enuZ: 12.8,
    instrumentHeight: 1.6,
    uncertainty: 0.28,
    notes: 'Measured from central walkway bench. High leaf density.',
    weatherTempC: 24,
    weatherPressureHpa: 1012,
    timestamp: Date.now() - 3600000 * 8,
  },
  {
    id: 'rec_3',
    projectId: 'proj_civil',
    title: 'Access Ramp 4B Incline',
    type: 'SLOPE',
    method: 'HYBRID_SURVEY',
    horizontalDistance: 35.0,
    verticalHeight: 2.8,
    baseAngle: 0.0,
    topAngle: 4.57,
    slopeDistance: 35.11,
    enuX: 24.5,
    enuY: 25.0,
    enuZ: 2.8,
    instrumentHeight: 0.0,
    uncertainty: 0.08,
    notes: 'Grade verified at 8.00% (within ADA accessibility specifications).',
    timestamp: Date.now() - 3600000 * 24,
  }
];

export function getProjects(): SurveyProject[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (!data) {
      saveProjects(DEFAULT_PROJECTS);
      return DEFAULT_PROJECTS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_PROJECTS;
  }
}

export function saveProjects(projects: SurveyProject[]) {
  localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
}

export function getMeasurements(projectId?: string): MeasurementRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_RECORDS);
    const records: MeasurementRecord[] = data ? JSON.parse(data) : DEFAULT_MEASUREMENTS;
    if (!data) {
      saveMeasurements(DEFAULT_MEASUREMENTS);
    }
    if (projectId) {
      return records.filter((r) => r.projectId === projectId);
    }
    return records;
  } catch {
    return DEFAULT_MEASUREMENTS;
  }
}

export function saveMeasurements(records: MeasurementRecord[]) {
  localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
}

export function addMeasurement(record: Omit<MeasurementRecord, 'id' | 'timestamp'>): MeasurementRecord {
  const newRec: MeasurementRecord = {
    ...record,
    id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };
  const list = getMeasurements();
  list.unshift(newRec);
  saveMeasurements(list);
  return newRec;
}

export function deleteMeasurement(id: string) {
  const list = getMeasurements().filter((r) => r.id !== id);
  saveMeasurements(list);
}

export function exportToCSV(records: MeasurementRecord[]): string {
  const headers = [
    'ID',
    'Timestamp',
    'Title',
    'Type',
    'Method',
    'Horizontal Distance (m)',
    'Vertical Height (m)',
    'Base Angle (deg)',
    'Top Angle (deg)',
    'Slope Distance (m)',
    'ENU X (m)',
    'ENU Y (m)',
    'ENU Z (m)',
    'Uncertainty (m)',
    'Notes'
  ];

  const rows = records.map((r) => [
    r.id,
    new Date(r.timestamp).toISOString(),
    `"${r.title.replace(/"/g, '""')}"`,
    r.type,
    r.method,
    r.horizontalDistance.toFixed(3),
    r.verticalHeight.toFixed(3),
    r.baseAngle.toFixed(2),
    r.topAngle.toFixed(2),
    r.slopeDistance.toFixed(3),
    r.enuX.toFixed(3),
    r.enuY.toFixed(3),
    r.enuZ.toFixed(3),
    r.uncertainty.toFixed(3),
    `"${(r.notes || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
