import { ScanRecord } from '../types';

export const SAMPLE_SCANS: ScanRecord[] = [
  {
    id: 'PX-2023-891A',
    patientName: 'Doe, John',
    dob: '1985-04-12',
    mrn: 'MRN-99281',
    gender: 'Male',
    date: '2023-10-25',
    time: '14:32',
    modality: 'X-Ray',
    region: 'Left Forearm (Radius/Ulna)',
    status: 'Critical',
    confidence: 98.4,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBnpGHUHKZVpWevgfrN1E8bHJIkD4J5-pkYDTDeNza2vVvz2tM-1wEp0YV6N7phwyauik3YCb3T_hMWJFz1Vk6kHoQ3pVTdM0rBgwtnLzOjNLScbj-vkXiPUkvJne7-4DfveyaqrepMPBcpIK0z_JC5SftXIkuvN1zH2A4MkfL649mr4LnFtrjw5YZ0gb5rQE6DKeTHsUifPPmGWPTr2lbMc-hlKE1bCTfHGrOLqimEW0QHNAV5DsIsVK807JL3IY4KmqYjqHUJpZm',
    primaryFinding: 'Transverse Fracture',
    secondaryFinding: 'Soft Tissue Swelling',
    secondaryConfidence: 82.1,
    recommendation: 'Orthopedic consultation recommended. Immobilization required. High probability of stable transverse fracture pattern. Monitor for compartment syndrome given associated soft tissue swelling.',
    indication: '38-year-old male presenting with acute left forearm deformity following fall from height.',
    technique: 'Left forearm AP and Lateral radiographs.',
    findingsList: [
      'Acute transverse fracture through the mid-diaphysis of the radius.',
      'Minor posterior angulation noted at fracture site.',
      'Ulna remains grossly intact without acute cortical disruption.',
      'Associated surrounding soft tissue edema surrounding radial shaft.'
    ],
    impression: '1. Complete mid-shaft radius transverse fracture.\n2. Intact ulna.\n3. Moderate soft tissue swelling.',
    radiologist: 'Dr. A. Chen',
    obbBox: {
      top: '35%',
      left: '40%',
      width: '20%',
      height: '25%',
      rotation: '-5deg',
      label: 'Fracture (98.4%)'
    }
  },
  {
    id: 'XRAY-2409-A4',
    patientName: 'Doe, Jane E.',
    dob: '1978-05-14',
    mrn: '100984-RX',
    gender: 'Female',
    date: '2023-10-24',
    time: '14:32',
    modality: 'X-Ray',
    region: 'Right Wrist',
    status: 'Critical',
    confidence: 98.4,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBqsiKgMivdu9rdC4-1A_DbnboSniZzPuRHcNiZGlbyyGv2H-_1O6mlwGiu48V2gbH9ZTjv7b73O4gJ-5MgOLPvF87VmMjzTuu-wFw0LEDclhCBo2lE9YO6blMnS63VJITH0gxXJUBWHJwBzA-C1pOY9u4wiUp-f2qcsECDhumMT-UvXo50CGU2RWu_MzYjeKLyXoTiZiie1Pugz38kZxwCWGzaEfRGB4yPdOPfETvaYRpnrzX24P3AnmpaQ5Xs-4iP20601oSMUwQ',
    primaryFinding: "Distal Radius Fracture - Colles' Type",
    secondaryFinding: 'Dorsal Soft Tissue Swelling',
    secondaryConfidence: 89.5,
    recommendation: 'Urgent orthopedic evaluation for closed reduction and splinting. High dorsal angulation measured at 18 degrees.',
    indication: '45-year-old female presenting with acute right wrist pain and swelling following a FOOSH (fall on outstretched hand) injury 2 hours prior.',
    technique: 'Right wrist, 3 views (PA, Lateral, Oblique).',
    findingsList: [
      "Bones: There is an acute, impacted, dorsally angulated fracture of the distal radius metaphyseal region (Colles' fracture). The fracture extends approximately 2.5 cm proximal to the radiocarpal joint.",
      'Dorsal angulation is measured at 18 degrees.',
      'Radial shortening is approximately 4 mm.',
      'No definite intra-articular extension is appreciated.',
      'The ulnar styloid process appears intact. No other acute fracture or malalignment is identified.',
      'Soft Tissues: Significant dorsal soft tissue swelling over the radiocarpal joint.'
    ],
    impression: "1. Acute, impacted distal radius fracture with dorsal angulation (Colles' type).\n2. No definitive intra-articular extension.\n3. Associated soft tissue swelling.",
    radiologist: 'Dr. S. Chen',
    obbBox: {
      top: '35%',
      left: '45%',
      width: '120px',
      height: '80px',
      rotation: '0deg',
      label: 'Colles Fracture (98.4%)'
    }
  },
  {
    id: 'PT-8892A',
    patientName: 'Kovacs, Peter',
    dob: '1990-11-03',
    mrn: 'MRN-88921',
    gender: 'Male',
    date: '2023-10-24',
    time: '11:20',
    modality: 'X-Ray',
    region: 'Left Femur',
    status: 'Critical',
    confidence: 98.5,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBnpGHUHKZVpWevgfrN1E8bHJIkD4J5-pkYDTDeNza2vVvz2tM-1wEp0YV6N7phwyauik3YCb3T_hMWJFz1Vk6kHoQ3pVTdM0rBgwtnLzOjNLScbj-vkXiPUkvJne7-4DfveyaqrepMPBcpIK0z_JC5SftXIkuvN1zH2A4MkfL649mr4LnFtrjw5YZ0gb5rQE6DKeTHsUifPPmGWPTr2lbMc-hlKE1bCTfHGrOLqimEW0QHNAV5DsIsVK807JL3IY4KmqYjqHUJpZm',
    primaryFinding: 'Mid-Shaft Femoral Fracture',
    secondaryFinding: 'Cortical Displacement',
    secondaryConfidence: 91.0,
    recommendation: 'Requires immediate surgical trauma consult for intramedullary nailing.',
    indication: 'High-energy motor vehicle accident trauma protocol.',
    technique: 'Left Femur AP and Lateral X-rays.',
    findingsList: [
      'Displaced fracture through the proximal third of the left femoral diaphysis.',
      'Moderate anterior displacement of proximal fracture segment.',
      'Soft tissue swelling evident.'
    ],
    impression: '1. Acute displaced left femoral fracture.',
    radiologist: 'Dr. S. Chen',
    obbBox: {
      top: '30%',
      left: '35%',
      width: '30%',
      height: '30%',
      label: 'Femur Break (98.5%)'
    }
  },
  {
    id: 'PT-1024B',
    patientName: 'Miller, Sarah',
    dob: '1962-08-19',
    mrn: 'MRN-10242',
    gender: 'Female',
    date: '2023-10-24',
    time: '09:45',
    modality: 'CT Scan',
    region: 'Thoracic Spine',
    status: 'Analyzed',
    confidence: 88.0,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBqsiKgMivdu9rdC4-1A_DbnboSniZzPuRHcNiZGlbyyGv2H-_1O6mlwGiu48V2gbH9ZTjv7b73O4gJ-5MgOLPvF87VmMjzTuu-wFw0LEDclhCBo2lE9YO6blMnS63VJITH0gxXJUBWHJwBzA-C1pOY9u4wiUp-f2qcsECDhumMT-UvXo50CGU2RWu_MzYjeKLyXoTiZiie1Pugz38kZxwCWGzaEfRGB4yPdOPfETvaYRpnrzX24P3AnmpaQ5Xs-4iP20601oSMUwQ',
    primaryFinding: 'T8 Compression Fracture',
    secondaryFinding: 'Mild Loss of Height',
    secondaryConfidence: 78.4,
    recommendation: 'Spine specialist evaluation for kyphoplasty vs conservative brace therapy.',
    indication: 'Back pain following slip and fall.',
    technique: 'CT Thoracic Spine axial sagittal 1mm slices.',
    findingsList: [
      'T8 vertebral body demonstrates ~20% anterior compression fracture.',
      'No posterior element disruption or retropulsion into spinal canal.'
    ],
    impression: '1. T8 acute wedge compression fracture.',
    radiologist: 'Dr. A. Chen'
  },
  {
    id: 'PT-8472-A',
    patientName: 'Doe, Jane M.',
    dob: '1982-01-20',
    mrn: 'MRN-84729',
    gender: 'Female',
    date: '2023-10-24',
    time: '14:32',
    modality: 'X-Ray',
    region: 'Left Tibia',
    status: 'Critical',
    confidence: 98.2,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBnpGHUHKZVpWevgfrN1E8bHJIkD4J5-pkYDTDeNza2vVvz2tM-1wEp0YV6N7phwyauik3YCb3T_hMWJFz1Vk6kHoQ3pVTdM0rBgwtnLzOjNLScbj-vkXiPUkvJne7-4DfveyaqrepMPBcpIK0z_JC5SftXIkuvN1zH2A4MkfL649mr4LnFtrjw5YZ0gb5rQE6DKeTHsUifPPmGWPTr2lbMc-hlKE1bCTfHGrOLqimEW0QHNAV5DsIsVK807JL3IY4KmqYjqHUJpZm',
    primaryFinding: 'Comminuted Tibia',
    secondaryFinding: 'Fibula Disruption',
    secondaryConfidence: 91.2,
    recommendation: 'Emergency orthopedic stabilization required.',
    indication: 'Bicycle impact trauma.',
    technique: 'Tibia/Fibula 2 views.',
    findingsList: [
      'Comminuted fracture of the mid tibial shaft with multiple butterfly fragments.',
      'Associated transverse fibular shaft fracture.'
    ],
    impression: '1. Severe comminuted tibial and fibular fractures.',
    radiologist: 'Dr. S. Chen'
  },
  {
    id: 'PT-9104-B',
    patientName: 'Smith, Robert T.',
    dob: '1995-03-30',
    mrn: 'MRN-91048',
    gender: 'Male',
    date: '2023-10-24',
    time: '09:15',
    modality: 'X-Ray',
    region: 'Right Radius',
    status: 'Analyzed',
    confidence: 76.5,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBqsiKgMivdu9rdC4-1A_DbnboSniZzPuRHcNiZGlbyyGv2H-_1O6mlwGiu48V2gbH9ZTjv7b73O4gJ-5MgOLPvF87VmMjzTuu-wFw0LEDclhCBo2lE9YO6blMnS63VJITH0gxXJUBWHJwBzA-C1pOY9u4wiUp-f2qcsECDhumMT-UvXo50CGU2RWu_MzYjeKLyXoTiZiie1Pugz38kZxwCWGzaEfRGB4yPdOPfETvaYRpnrzX24P3AnmpaQ5Xs-4iP20601oSMUwQ',
    primaryFinding: 'Hairline Radius',
    secondaryFinding: 'Minimal Cortical Periosteal Elevation',
    secondaryConfidence: 65.0,
    recommendation: 'Short arm cast immobilization and repeat X-ray in 10 days.',
    indication: 'Gymnastics wrist impact pain.',
    technique: 'Right Radius AP/Lateral views.',
    findingsList: [
      'Nondisplaced hairline fracture along distal radial cortex.',
      'No frank step-off or joint involvement.'
    ],
    impression: '1. Hairline nondisplaced distal radial fracture.',
    radiologist: 'Dr. A. Chen'
  },
  {
    id: 'PT-1123-C',
    patientName: 'Williams, A.',
    dob: '1989-07-12',
    mrn: 'MRN-11230',
    gender: 'Male',
    date: '2023-10-23',
    time: '16:45',
    modality: 'X-Ray',
    region: 'Left Wrist',
    status: 'Normal',
    confidence: 99.1,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBqsiKgMivdu9rdC4-1A_DbnboSniZzPuRHcNiZGlbyyGv2H-_1O6mlwGiu48V2gbH9ZTjv7b73O4gJ-5MgOLPvF87VmMjzTuu-wFw0LEDclhCBo2lE9YO6blMnS63VJITH0gxXJUBWHJwBzA-C1pOY9u4wiUp-f2qcsECDhumMT-UvXo50CGU2RWu_MzYjeKLyXoTiZiie1Pugz38kZxwCWGzaEfRGB4yPdOPfETvaYRpnrzX24P3AnmpaQ5Xs-4iP20601oSMUwQ',
    primaryFinding: 'No Abnormalities',
    secondaryFinding: 'Intact Carpal Alignment',
    secondaryConfidence: 99.5,
    recommendation: 'No acute fracture detected. Symptomatic supportive management.',
    indication: 'Minor wrist sprain.',
    technique: 'Left wrist 3 views.',
    findingsList: [
      'Bone mineralization and cortical continuity are normal.',
      'Joint spaces preserved without acute dislocation.'
    ],
    impression: '1. Normal left wrist radiograph.',
    radiologist: 'Dr. S. Chen'
  },
  {
    id: 'PT-7731C',
    patientName: 'Rodriguez, Maria',
    dob: '1993-02-14',
    mrn: 'MRN-77319',
    gender: 'Female',
    date: '2023-10-24',
    time: '15:10',
    modality: 'X-Ray',
    region: 'Right Wrist',
    status: 'Pending',
    confidence: null,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBqsiKgMivdu9rdC4-1A_DbnboSniZzPuRHcNiZGlbyyGv2H-_1O6mlwGiu48V2gbH9ZTjv7b73O4gJ-5MgOLPvF87VmMjzTuu-wFw0LEDclhCBo2lE9YO6blMnS63VJITH0gxXJUBWHJwBzA-C1pOY9u4wiUp-f2qcsECDhumMT-UvXo50CGU2RWu_MzYjeKLyXoTiZiie1Pugz38kZxwCWGzaEfRGB4yPdOPfETvaYRpnrzX24P3AnmpaQ5Xs-4iP20601oSMUwQ',
    primaryFinding: 'Calculating AI Pipeline...',
    recommendation: 'Pending automated fracture classification.',
    indication: 'Acute fall on outstretched hand.',
    technique: 'PA and Lateral wrist X-rays.',
    findingsList: [
      'Image uploaded to diagnostic queue. AI engine processing.'
    ],
    impression: 'Pending radiologist review.',
    radiologist: 'Dr. A. Chen'
  },
  {
    id: 'PT-4410D',
    patientName: 'Al-Mansoor, Tariq',
    dob: '1975-10-08',
    mrn: 'MRN-44102',
    gender: 'Male',
    date: '2023-10-24',
    time: '13:05',
    modality: 'MRI',
    region: 'Pelvis',
    status: 'Critical',
    confidence: 94.1,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBnpGHUHKZVpWevgfrN1E8bHJIkD4J5-pkYDTDeNza2vVvz2tM-1wEp0YV6N7phwyauik3YCb3T_hMWJFz1Vk6kHoQ3pVTdM0rBgwtnLzOjNLScbj-vkXiPUkvJne7-4DfveyaqrepMPBcpIK0z_JC5SftXIkuvN1zH2A4MkfL649mr4LnFtrjw5YZ0gb5rQE6DKeTHsUifPPmGWPTr2lbMc-hlKE1bCTfHGrOLqimEW0QHNAV5DsIsVK807JL3IY4KmqYjqHUJpZm',
    primaryFinding: 'Left Acetabular Fracture',
    secondaryFinding: 'Pelvic Ring Asymmetry',
    secondaryConfidence: 87.4,
    recommendation: 'Non-weight bearing status and urgent pelvic orthopedic trauma team consultation.',
    indication: 'Crushing impact injury.',
    technique: 'MRI Pelvis T1, T2 fat-suppressed sequences.',
    findingsList: [
      'Nondisplaced fracture line extending through posterior column of left acetabulum.',
      'Surrounding bone marrow edema on T2 FS sequences.'
    ],
    impression: '1. Left posterior acetabular wall fracture with intra-osseous edema.',
    radiologist: 'Dr. S. Chen'
  }
];

export const APP_SOURCE_CODE_FILES = [
  {
    filename: 'src/App.tsx',
    language: 'typescript',
    description: 'Main Workstation Controller & Tab Routing Engine'
  },
  {
    filename: 'server.ts',
    language: 'typescript',
    description: 'Express Server with Server-Side Gemini API Diagnostics Proxy'
  },
  {
    filename: 'src/components/DetectView.tsx',
    language: 'typescript',
    description: 'Interactive Medical Diagnostic Station Canvas (Image 2)'
  },
  {
    filename: 'src/components/ExplainView.tsx',
    language: 'typescript',
    description: 'AI Explanation & Radiologic Report Dashboard (Image 3)'
  },
  {
    filename: 'src/components/DatabaseView.tsx',
    language: 'typescript',
    description: 'Patient Database & Filtered Diagnostic Archive (Image 4)'
  }
];
