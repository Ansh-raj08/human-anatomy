/**
 * Inside the Human Body: Medical Anatomy Adventure
 * Anatomical Domain Types & System Schema
 * Aligned with NCERT Classes 9-12 and NEET Foundation
 */

export type AnatomicalSystemId =
  | 'skeletal'
  | 'circulatory'
  | 'respiratory'
  | 'digestive'
  | 'urinary'
  | 'nervous'
  | 'integumentary';

export type CurriculumGradeLevel =
  | 'Class 9'
  | 'Class 10'
  | 'Class 11'
  | 'Class 12'
  | 'NEET Foundation';

export interface AnatomicalStructure {
  id: string; // Stable anatomical identifier (never display label)
  displayName: string;
  latinName?: string;
  system: AnatomicalSystemId;
  subsystem?: string;
  curriculumLevel: CurriculumGradeLevel;
  shortDescription: string;
  biologicalFunction: string;
  clinicalSignificance?: string;
  ncertReference: string;
  neighboringStructureIds: string[];
  cameraFocus: {
    target: [number, number, number];
    distance: number;
    preferredAngle?: [number, number, number];
  };
  approximateTriangles: number;
  isMissionCritical?: boolean;
}

export interface AnatomicalSystemDefinition {
  id: AnatomicalSystemId;
  displayName: string;
  themeColor: string;
  iconName: string;
  summary: string;
  defaultVisible: boolean;
  structureCount: number;
}
