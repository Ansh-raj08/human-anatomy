export type MissionState =
  | 'NOT_STARTED'
  | 'INTRO'
  | 'ACTIVE'
  | 'STEP_FEEDBACK'
  | 'COMPLETED'
  | 'PAUSED';

export type MissionId = 'cardiac_highway' | 'appendicular_assembly';

export interface MissionStep {
  stepIndex: number;
  title: string;
  targetStructureId: string;
  learningPrompt: string;
  pedagogicalHintTier1: string; // Conceptual orientation
  pedagogicalHintTier2: string; // Anatomical relationship
  pedagogicalHintTier3: string; // Focused reasoning
  explanatoryFeedbackOnSuccess: string;
  specificErrorFeedback?: Record<string, string>; // Tailored feedback for common misidentifications
  cameraFocusId: string;
  isOxygenated?: boolean;
  circuit?: 'pulmonary' | 'systemic';
}

export interface AssemblyBoneState {
  id: 'bone_radius_r' | 'bone_ulna_r';
  displayName: string;
  isPlaced: boolean;
  currentPosition: [number, number, number];
  currentRotation: [number, number, number]; // Euler angles in radians
  targetPosition: [number, number, number];
  targetRotation: [number, number, number];
  toleranceDistance: number;
  anatomicalSide: 'lateral' | 'medial';
  anatomicalReference: string;
}

export interface MissionDefinition {
  id: MissionId;
  title: string;
  subtitle: string;
  curriculumStandard: string;
  estimatedTime: string;
  description: string;
  learningObjectives: string[];
  prerequisites: string[];
  totalSteps: number;
  steps?: MissionStep[];
}
