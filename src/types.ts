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
  | 'profile';

export type Modality = 'X-Ray' | 'CT Scan' | 'MRI';

export type AIStatus = 'Critical' | 'Analyzed' | 'Pending' | 'Normal';

export type FractureType = 
  | 'Transverse' 
  | 'Comminuted' 
  | 'Spiral' 
  | 'Hairline' 
  | 'Colles' 
  | 'No Fracture Detected';

export interface ScanRecord {
  id: string; // e.g. PT-8892A or PX-2023-891A
  patientName: string;
  patientAge?: number;
  dob: string;
  mrn: string;
  gender: 'Male' | 'Female' | 'Other';
  date: string;
  time: string;
  modality: Modality;
  region: string; // e.g. "Left Femur", "Right Wrist", "Thoracic Spine"
  status: AIStatus;
  confidence: number | null; // e.g. 98.5 or null if pending
  imageUrl: string;
  primaryFinding: string;
  secondaryFinding?: string;
  secondaryConfidence?: number;
  recommendation: string;
  indication: string;
  technique: string;
  findingsList: string[];
  impression: string;
  radiologist: string;
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
  dateRange: string;
  fractureTypes: FractureType[];
  minConfidence: number;
  searchQuery: string;
}

export interface MeasurementPoint {
  x: number;
  y: number;
}

export interface CaliperMeasurement {
  id: string;
  p1: MeasurementPoint;
  p2: MeasurementPoint;
  distanceMm: number;
}

export interface AngleMeasurement {
  id: string;
  p1: MeasurementPoint;
  p2: MeasurementPoint;
  p3: MeasurementPoint;
  angleDegrees: number;
}
