import { EducationalExperiment } from '../types/survey';
import { calculateTwoAngleHeight, calculateSlopeMetrics, toRadians } from './mathEngine';

export const EXPERIMENTS_LIST: EducationalExperiment[] = [
  {
    id: 'exp_1',
    title: 'Experiment 1: Measure Tree Height',
    subtitle: 'Two-Angle Tangent Method with Ground Foliage Correction',
    category: 'Elevation',
    objective: 'Measure the true vertical height of a living tree without climbing or cutting, using trigonometric angle resection.',
    requiredInputs: [
      { key: 'distance', label: 'Baseline Distance D', unit: 'm', defaultValue: 15.0, description: 'Horizontal distance from observer to tree trunk', min: 1, max: 200 },
      { key: 'baseAngle', label: 'Base Angle θ_base', unit: '°', defaultValue: -2.1, description: 'Sightline angle to lowest root flare', min: -45, max: 30 },
      { key: 'topAngle', label: 'Top Angle θ_top', unit: '°', defaultValue: 38.5, description: 'Sightline angle to highest crown branch', min: 0, max: 85 },
      { key: 'instHeight', label: 'Observer Eye Height h_inst', unit: 'm', defaultValue: 1.65, description: 'Elevation of sighting instrument above observation ground', min: 0.5, max: 2.5 }
    ],
    instructions: [
      '1. Step back from the tree until the highest branch is comfortably visible (ideal distance is roughly equal to expected tree height, around 45°).',
      '2. Measure horizontal distance D to the trunk center using tape measure or GPS rover mode.',
      '3. Point phone crosshair to the base ground level where the trunk emerges, capture θ_base.',
      '4. Tilt upward to sight the highest branch crown, capture θ_top.',
      '5. Observe calculated height and verify with the two-angle tangent formula.'
    ],
    formulas: [
      'H_tree = D × [tan(θ_top) - tan(θ_base)]',
      'If observing from level ground: H = D × tan(θ_top) + h_inst'
    ],
    conceptualExplanation:
      'Because trees frequently grow on irregular turf or slopes, a single-angle method that assumes level ground induces severe systematic height errors. By sighting both the base angle (negative if below horizon) and top angle, the tangent differential tan(θ_top) - tan(θ_base) cancels the ground elevation offset cleanly.',
    limitations:
      'Trees do not have a razor-sharp apex; leaning trunks shift the effective apex away from the vertical baseline, causing up to ±5% parallax uncertainty.',
    calculate: (inputs) => {
      const res = calculateTwoAngleHeight(inputs.distance, inputs.baseAngle, inputs.topAngle, 0, 0.3, 0.2);
      return {
        primaryValue: res.height,
        primaryLabel: 'Tree Height',
        primaryUnit: 'm',
        steps: res.formulaSteps,
        uncertainty: res.uncertainty,
        warning: res.isCritical ? 'High sighting angle increases crown parallax sensitivity.' : undefined
      };
    }
  },
  {
    id: 'exp_2',
    title: 'Experiment 2: Estimate Utility Pole Height',
    subtitle: 'Standardized Telecommunication Infrastructure Inspection',
    category: 'Trigonometry',
    objective: 'Determine clearance height and total structure elevation of an electrical distribution or telecom pole.',
    requiredInputs: [
      { key: 'distance', label: 'Horizontal Baseline D', unit: 'm', defaultValue: 20.0, description: 'Distance from observer to pole base', min: 2, max: 100 },
      { key: 'baseAngle', label: 'Base Angle θ_base', unit: '°', defaultValue: -2.5, description: 'Sight angle to concrete base pad', min: -30, max: 20 },
      { key: 'topAngle', label: 'Top Angle θ_top', unit: '°', defaultValue: 28.5, description: 'Sight angle to pole apex / crossarm', min: 5, max: 80 },
      { key: 'instHeight', label: 'Instrument Height h_inst', unit: 'm', defaultValue: 1.6, description: 'Observer instrument eye-level', min: 0.5, max: 2.2 }
    ],
    instructions: [
      '1. Position yourself outside the safety boundary of high-voltage transmission lines (minimum 15m away).',
      '2. Keep phone in portrait orientation and align horizontal crosshair with the ground pad.',
      '3. Lock Base Angle reading.',
      '4. Pivot along the vertical axis only (maintaining heading) up to the top insulator cap.',
      '5. Lock Top Angle and check structural clearance.'
    ],
    formulas: [
      'H_pole = D × [tan(θ_top) - tan(θ_base)]',
      'D_slope = √(D² + (D × tan(θ_top))²)'
    ],
    conceptualExplanation:
      'Utility poles are plumb vertical structures, making them ideal canonical targets for testing right triangle trigonometric resection. The tangent ratio opposite/adjacent holds with high precision.',
    limitations:
      'Power cables and guys can obscure the true apex; always confirm the crossarm is perpendicular to your line of sight.',
    calculate: (inputs) => {
      const res = calculateTwoAngleHeight(inputs.distance, inputs.baseAngle, inputs.topAngle, 0, 0.2, 0.15);
      return {
        primaryValue: res.height,
        primaryLabel: 'Pole Height',
        primaryUnit: 'm',
        steps: res.formulaSteps,
        uncertainty: res.uncertainty
      };
    }
  },
  {
    id: 'exp_3',
    title: 'Experiment 3: Estimate Building Height',
    subtitle: 'Multi-Storey Architectural Survey from Street Level',
    category: 'Elevation',
    objective: 'Calculate the total vertical elevation and per-storey height of an architectural building or tower.',
    requiredInputs: [
      { key: 'distance', label: 'Street Baseline D', unit: 'm', defaultValue: 35.0, description: 'Horizontal distance across street to building facade', min: 5, max: 500 },
      { key: 'baseAngle', label: 'Sidewalk Angle θ_base', unit: '°', defaultValue: -1.8, description: 'Sightline to foundation plinth', min: -30, max: 15 },
      { key: 'topAngle', label: 'Parapet Angle θ_top', unit: '°', defaultValue: 49.2, description: 'Sightline to roof parapet edge', min: 10, max: 85 },
      { key: 'numFloors', label: 'Storey Count (Estimate)', unit: 'floors', defaultValue: 10, description: 'Observed window storeys', min: 1, max: 100 }
    ],
    instructions: [
      '1. Stand across the street where you have an unobstructed line of sight to the roof parapet.',
      '2. Verify that your baseline distance is measured perpendicular to the building facade.',
      '3. Sighting the base sidewalk joint gives θ_base; sighting the top roof coping gives θ_top.',
      '4. Enter the estimated floor count to calculate average ceiling-to-ceiling storey clearance.'
    ],
    formulas: [
      'H_building = D × [tan(θ_top) - tan(θ_base)]',
      'Average Floor Height = H_building / Floors'
    ],
    conceptualExplanation:
      'In urban canyons, direct tape measurement is impossible. Trigonometric sighting enables rapid building height acquisition from safe pedestrian zones. Sighting both base and parapet accounts for sidewalk crown and street curbs.',
    limitations:
      'Setbacks on upper penthouse floors will cause underestimation if you sight a recessed roofline without adjusting baseline distance D.',
    calculate: (inputs) => {
      const res = calculateTwoAngleHeight(inputs.distance, inputs.baseAngle, inputs.topAngle, 0, 0.5, 0.2);
      const perFloor = res.height / Math.max(1, inputs.numFloors);
      return {
        primaryValue: res.height,
        primaryLabel: 'Total Building Height',
        primaryUnit: 'm',
        steps: [
          ...res.formulaSteps,
          `Floor Count = ${inputs.numFloors} levels`,
          `Estimated Height Per Storey = ${(perFloor).toFixed(2)} m/floor (Standard commercial is 3.5 - 4.2m, residential 2.8 - 3.2m)`
        ],
        uncertainty: res.uncertainty
      };
    }
  },
  {
    id: 'exp_4',
    title: 'Experiment 4: Measure Slope of a Road or Ramp',
    subtitle: 'Civil Engineering Gradient & Accessibility Compliance',
    category: 'Slope',
    objective: 'Measure grade percentage, vertical rise, and slope angle of a driveway, wheelchair access ramp, or highway.',
    requiredInputs: [
      { key: 'run', label: 'Horizontal Run', unit: 'm', defaultValue: 12.0, description: 'Horizontal projection length', min: 0.5, max: 200 },
      { key: 'rise', label: 'Vertical Rise', unit: 'm', defaultValue: 0.96, description: 'Total vertical height gain', min: 0.01, max: 50 }
    ],
    instructions: [
      '1. Place phone flat on the ramp surface with screen pointing in direction of slope, or measure run and rise.',
      '2. Check digital clinometer inclination angle directly against calculated arctan(Rise / Run).',
      '3. Compare Grade Percentage against ADA accessibility standard (max 8.33% or 1:12 slope).'
    ],
    formulas: [
      'Slope % = (Vertical Rise / Horizontal Run) × 100',
      'Slope Angle θ = arctan(Vertical Rise / Horizontal Run)',
      'Slope Distance = √(Run² + Rise²)'
    ],
    conceptualExplanation:
      'Civil engineering designates terrain slopes in Grade Percentage (%) rather than degrees because it directly informs vehicular traction, braking distances, stormwater runoff velocity, and wheelchair barrier-free design standards.',
    limitations:
      'Local asphalt undulations and pavement ruts can bias point inclinometer readings; average multiple readings across a 2-meter straightedge board.',
    calculate: (inputs) => {
      const slope = calculateSlopeMetrics(inputs.run, inputs.rise);
      const isAdaCompliant = slope.slopePercent <= 8.333;
      return {
        primaryValue: slope.slopePercent,
        primaryLabel: 'Road Grade',
        primaryUnit: '%',
        steps: [
          `Formula: Grade % = (Rise / Run) × 100`,
          `Horizontal Run = ${slope.horizontalRun.toFixed(3)} m`,
          `Vertical Rise = ${slope.verticalRise.toFixed(3)} m`,
          `Grade Percentage = (${slope.verticalRise.toFixed(3)} / ${slope.horizontalRun.toFixed(3)}) × 100 = ${slope.slopePercent.toFixed(2)}%`,
          `Slope Angle θ = ${slope.slopeAngleDeg.toFixed(2)}°`,
          `Slope Hypotenuse Distance = ${slope.slopeDistance.toFixed(3)} m`,
          `Ratio Representation = ${slope.ratio}`,
          `Accessibility Status: ${isAdaCompliant ? '✅ Compliant with ADA ramp guidelines (<= 8.33% / 1:12)' : '⚠️ Exceeds ADA wheelchair accessibility limit of 8.33%'}`
        ],
        uncertainty: 0.05
      };
    }
  },
  {
    id: 'exp_5',
    title: 'Experiment 5: Calculate Distance Between Locations',
    subtitle: 'Haversine Ellipsoidal Geodesic Calculation vs Euclidean Run',
    category: 'Coordinates',
    objective: 'Compute great-circle geographic distance and local Cartesian displacement between two GNSS points.',
    requiredInputs: [
      { key: 'lat1', label: 'Station 1 Latitude', unit: '°N', defaultValue: 37.7749, description: 'Origin GPS coordinate', min: -90, max: 90 },
      { key: 'lon1', label: 'Station 1 Longitude', unit: '°E', defaultValue: -122.4194, description: 'Origin GPS longitude', min: -180, max: 180 },
      { key: 'lat2', label: 'Station 2 Latitude', unit: '°N', defaultValue: 37.7765, description: 'Target GPS latitude', min: -90, max: 90 },
      { key: 'lon2', label: 'Station 2 Longitude', unit: '°E', defaultValue: -122.4170, description: 'Target GPS longitude', min: -180, max: 180 }
    ],
    instructions: [
      '1. Stand at starting point A and log GNSS rover fix.',
      '2. Walk along the baseline to target point B and log second fix.',
      '3. Observe the Haversine formula computation accounting for Earth curvature.'
    ],
    formulas: [
      'a = sin²(Δφ/2) + cos(φ1)cos(φ2)sin²(Δλ/2)',
      'c = 2 × atan2(√a, √(1−a))',
      'd = R_earth × c (R ≈ 6,371,000 m)'
    ],
    conceptualExplanation:
      'Because lines of longitude converge toward the poles, one degree of longitude shrinks as cos(latitude). The Haversine formula correctly resolves spherical trigonometry on Earth’s curved ellipsoid, avoiding planar Cartesian distortion.',
    limitations:
      'Consumer smartphone GPS receivers have multipath interference and ionospheric delay resulting in typical horizontal uncertainty of ±2 to 5 meters.',
    calculate: (inputs) => {
      const phi1 = toRadians(inputs.lat1);
      const phi2 = toRadians(inputs.lat2);
      const deltaPhi = toRadians(inputs.lat2 - inputs.lat1);
      const deltaLambda = toRadians(inputs.lon2 - inputs.lon1);

      const a =
        Math.sin(deltaPhi / 2) ** 2 +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = 6378137.0 * c;

      return {
        primaryValue: dist,
        primaryLabel: 'Geodesic Distance',
        primaryUnit: 'm',
        steps: [
          `Station A: (${inputs.lat1.toFixed(6)}°, ${inputs.lon1.toFixed(6)}°)`,
          `Station B: (${inputs.lat2.toFixed(6)}°, ${inputs.lon2.toFixed(6)}°)`,
          `ΔLatitude = ${(inputs.lat2 - inputs.lat1).toFixed(6)}°`,
          `ΔLongitude = ${(inputs.lon2 - inputs.lon1).toFixed(6)}°`,
          `Haversine intermediate a = ${a.toFixed(8)}`,
          `Angular distance c = ${c.toFixed(8)} radians`,
          `Calculated Distance = ${dist.toFixed(2)} m (${(dist / 1000).toFixed(3)} km)`
        ],
        uncertainty: 3.5
      };
    }
  },
  {
    id: 'exp_6',
    title: 'Experiment 6: Explore 3D Cartesian Coordinates',
    subtitle: 'Local East-North-Up (ENU) Tangent Frame Vector Analysis',
    category: 'Coordinates',
    objective: 'Understand how real-world spatial vectors decompose into East (X), North (Y), and Up (Z) orthogonal axes.',
    requiredInputs: [
      { key: 'x', label: 'East Displacement (ΔX)', unit: 'm', defaultValue: 12.45, description: 'Distance east of origin', min: -500, max: 500 },
      { key: 'y', label: 'North Displacement (ΔY)', unit: 'm', defaultValue: 8.25, description: 'Distance north of origin', min: -500, max: 500 },
      { key: 'z', label: 'Vertical Elevation (ΔZ)', unit: 'm', defaultValue: 21.6, description: 'Height gain above origin', min: -200, max: 500 }
    ],
    instructions: [
      '1. Select a benchmark reference station on the ground as origin (0, 0, 0).',
      '2. Enter or measure the 3D displacement vectors along cardinal East, North, and Up axes.',
      '3. View the resultant 3D vector norm and spatial inclination angle.'
    ],
    formulas: [
      'Horizontal Distance D_h = √(ΔX² + ΔY²)',
      '3D Space Distance D_3D = √(ΔX² + ΔY² + ΔZ²)',
      'Azimuth Heading α = arctan2(ΔX, ΔY)',
      'Spatial Elevation θ = arctan(ΔZ / D_h)'
    ],
    conceptualExplanation:
      'Rather than curved latitude and longitude coordinates, engineers require local flat Cartesian orthogonal frames. The East-North-Up (ENU) convention aligns X with true East, Y with true North, and Z perpendicular to gravity (Up).',
    limitations:
      'ENU plane projection assumes local flatness; beyond ~10 km distance, Earth curvature begins introducing vertical drop (8 cm per km squared).',
    calculate: (inputs) => {
      const dh = Math.sqrt(inputs.x ** 2 + inputs.y ** 2);
      const d3d = Math.sqrt(inputs.x ** 2 + inputs.y ** 2 + inputs.z ** 2);
      const az = (Math.atan2(inputs.x, inputs.y) * 180 / Math.PI + 360) % 360;
      const elev = Math.atan2(inputs.z, Math.max(0.001, dh)) * 180 / Math.PI;

      return {
        primaryValue: d3d,
        primaryLabel: '3D Spatial Distance',
        primaryUnit: 'm',
        steps: [
          `East Coordinate X = ${inputs.x.toFixed(3)} m`,
          `North Coordinate Y = ${inputs.y.toFixed(3)} m`,
          `Vertical Coordinate Z = ${inputs.z.toFixed(3)} m`,
          `Planar Horizontal Distance D_h = √(${inputs.x}² + ${inputs.y}²) = ${dh.toFixed(3)} m`,
          `3D Euclidean Norm D_3D = √(${inputs.x}² + ${inputs.y}² + ${inputs.z}²) = ${d3d.toFixed(3)} m`,
          `Azimuth Heading = ${az.toFixed(1)}° from North`,
          `Spatial Vector Elevation Angle = ${elev.toFixed(2)}°`
        ],
        uncertainty: 0.15
      };
    }
  },
  {
    id: 'exp_7',
    title: 'Experiment 7: Compare Two Elevation Measurements',
    subtitle: 'Direct Inclinometer vs Trigonometric Tangent Cross-Verification',
    category: 'Error Analysis',
    objective: 'Test measurement repeatability and quantify discrepancies between two distinct measurement setups.',
    requiredInputs: [
      { key: 'val1', label: 'Method 1 Result (e.g. Near Station)', unit: 'm', defaultValue: 21.65, description: 'First height measurement', min: 0.1, max: 200 },
      { key: 'unc1', label: 'Method 1 Uncertainty (σ1)', unit: 'm', defaultValue: 0.35, description: 'Estimated uncertainty of method 1', min: 0.01, max: 10 },
      { key: 'val2', label: 'Method 2 Result (e.g. Far Station)', unit: 'm', defaultValue: 21.48, description: 'Second height measurement', min: 0.1, max: 200 },
      { key: 'unc2', label: 'Method 2 Uncertainty (σ2)', unit: 'm', defaultValue: 0.42, description: 'Estimated uncertainty of method 2', min: 0.01, max: 10 }
    ],
    instructions: [
      '1. Measure an object from a nearby observation point (Station 1).',
      '2. Move further away to Station 2 and repeat the measurement independently.',
      '3. Enter both height and estimated uncertainty values to run a statistical compatibility test (En score / t-test).'
    ],
    formulas: [
      'Difference |Δ| = |H1 - H2|',
      'Combined Expanded Uncertainty U_diff = 2 × √(σ1² + σ2²)',
      'Normalized Error En = |H1 - H2| / √(U1² + U2²)  (En < 1 confirms consistency)'
    ],
    conceptualExplanation:
      'In professional surveying and metrology, no single measurement is accepted without independent verification. Comparing two setups with error propagation proves whether differences are random noise or systematic errors.',
    limitations:
      'If two methods share the same flawed baseline distance or miscalibrated sensor offset, systematic error will not be revealed.',
    calculate: (inputs) => {
      const diff = Math.abs(inputs.val1 - inputs.val2);
      const combSigma = Math.sqrt(inputs.unc1 ** 2 + inputs.unc2 ** 2);
      const enScore = diff / (2 * combSigma);
      const isConsistent = enScore <= 1.0;

      return {
        primaryValue: diff,
        primaryLabel: 'Discrepancy |H1 - H2|',
        primaryUnit: 'm',
        steps: [
          `Measurement 1: ${inputs.val1.toFixed(3)} m ± ${inputs.unc1.toFixed(3)} m`,
          `Measurement 2: ${inputs.val2.toFixed(3)} m ± ${inputs.unc2.toFixed(3)} m`,
          `Absolute Difference = ${diff.toFixed(3)} m (${(diff * 100).toFixed(1)} cm)`,
          `Combined Standard Deviation σ_diff = ${combSigma.toFixed(3)} m`,
          `Metrological En-Ratio = ${enScore.toFixed(3)}`,
          `Validation Conclusion: ${isConsistent ? '✅ PASS: Measurements are statistically indistinguishable within experimental uncertainty bounds.' : '⚠️ WARNING: Discrepancy exceeds 95% confidence interval. Check baseline distance tape or sighting parallax.'}`
        ],
        uncertainty: combSigma
      };
    }
  },
  {
    id: 'exp_8',
    title: 'Experiment 8: Investigate Angle vs Height Sensitivity',
    subtitle: 'The Tangent Singularity: Why High Angles Explode Error',
    category: 'Trigonometry',
    objective: 'Demonstrate why sighting angles above 70° amplify angular measurement noise, and determine the optimal distance ratio.',
    requiredInputs: [
      { key: 'height', label: 'True Object Height H', unit: 'm', defaultValue: 20.0, description: 'True vertical object height', min: 2, max: 100 },
      { key: 'angleError', label: 'Instrument Angle Jitter', unit: '°', defaultValue: 0.5, description: 'Hand shake / sensor angle noise', min: 0.1, max: 5 }
    ],
    instructions: [
      '1. Compare standing close (steep angle > 75°) versus standing at optimal distance (approx 45°).',
      '2. Observe how the derivative d/dθ [tan(θ)] = sec²(θ) = 1/cos²(θ) skyrockets as θ approaches 90°.',
      '3. Formulate the surveyor rule of thumb: Baseline distance should roughly equal target height.'
    ],
    formulas: [
      'H = D × tan(θ) ⟹ dH/dθ = D × sec²(θ)',
      'Fractional Error: (dH/H) / dθ = sec²(θ) / tan(θ) = 1 / (sin(θ)cos(θ)) = 2 / sin(2θ)',
      'Minimum Error occurs at 2θ = 90° ⟹ θ_optimal = 45°'
    ],
    conceptualExplanation:
      'As an angle nears 90°, cos(θ) approaches 0. Because sec²(θ) = 1/cos²(θ), a tiny hand tremor of just 0.5° can cause the calculated height to swing by tens of meters! At θ = 45°, 2/sin(2θ) reaches its absolute mathematical minimum of 2.0, providing maximal noise immunity.',
    limitations:
      'Urban buildings or steep cliffs may physically prevent standing back at the ideal 45° distance.',
    calculate: (inputs) => {
      const h = inputs.height;
      const sigmaDeg = inputs.angleError;
      const sigmaRad = toRadians(sigmaDeg);

      // Compare at 30 deg, 45 deg, 75 deg, 85 deg
      const testAngles = [30, 45, 60, 75, 85];
      const table = testAngles.map((theta) => {
        const rad = toRadians(theta);
        const d = h / Math.tan(rad);
        const dH = d * (1 / (Math.cos(rad) ** 2)) * sigmaRad;
        return `• At θ = ${theta}° (Baseline D = ${d.toFixed(1)} m): Error from ±${sigmaDeg}° jitter = ±${dH.toFixed(2)} m (${((dH / h) * 100).toFixed(1)}%)`;
      });

      return {
        primaryValue: 45.0,
        primaryLabel: 'Mathematically Optimal Angle',
        primaryUnit: '°',
        steps: [
          `Investigation of Height Error dH = D × sec²(θ) × σ_θ:`,
          ...table,
          `Key Mathematical Insight: The relative error 2/sin(2θ) has its absolute global minimum at exactly 45°.`,
          `Surveyor Best Practice: Always stand at a distance roughly equal to the height of the object (D ≈ H).`
        ],
        uncertainty: 0
      };
    }
  }
];
