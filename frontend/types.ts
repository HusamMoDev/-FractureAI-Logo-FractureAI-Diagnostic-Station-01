export type Modality = 'X-Ray' | 'CT' | 'MRI';

export type AIStatus =
  | 'Normal'
  | 'Critical'
  | 'Pending'
  | 'Review';

export type FractureType =
  | 'Transverse'
  | 'Comminuted'
  | 'Spiral'
  | 'Hairline'
  | 'Colles'
  | 'No Fracture Detected';

export type PageTab =
  | 'dashboard'
  | 'detect'
  | 'analyze'
  | 'explain'
  | 'heatmap'
  | 'measurement'
  | 'angle'
  | 'report'
  | 'database'
  | 'upload'
  | 'profile'
  | 'admin-management'
  | 'case-details';

export interface ScanRecord {
  id: string;
  patientName: string;
  mrn: string;
  gender: string;
  dob: string;
  modality: Modality;
  region: string;
  date: string;
  time: string;

  status: AIStatus;

  confidence: number | null;

  primaryFinding: string;

  recommendation: string;

  indication: string;

  findingsList: string[];

  impression: string;

  imageUrl?: string;

  obbBox?: {
    top: string;
    left: string;
    width: string;
    height: string;
    rotation?: string;
    label: string;
  };
}

export interface FilterState {
  date: string;
  fractureTypes: FractureType[];
  minConfidence: number;
  search: string;
}

export interface MeasurementPoint {
  x: number;
  y: number;
}

export interface CaliperMeasurement {
  id: string;
  start: MeasurementPoint;
  end: MeasurementPoint;
  distance: number;
  unit: string;
}

export interface AngleMeasurement {
  id: string;
  pointA: MeasurementPoint;
  vertex: MeasurementPoint;
  pointB: MeasurementPoint;
  angle: number;
}