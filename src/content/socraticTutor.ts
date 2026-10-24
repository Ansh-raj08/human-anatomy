import { ANATOMY_REGISTRY } from '../anatomy/registry';
import type { MissionId } from '../missions/types';
import { CARDIAC_HIGHWAY_MISSION } from '../missions/missionData';

export interface SocraticContext {
  current_organ_id: string | null;
  current_mission_id: MissionId | null;
  attempt_count: number;
  student_query: string;
  current_mission_step?: number;
  selected_structure_ids: string[];
  approved_learning_context?: string;
  student_level: string;
  available_interactions: string[];
}

export interface SocraticResponse {
  response_text: string;
  hint_tier: 1 | 2 | 3;
  concept: string;
  suggested_investigation: string;
  referenced_structure_ids: string[];
  confidence: number;
  requires_content_review: boolean;
}

/**
 * Validates a candidate Socratic response against rigorous domain constraints.
 */
export function validateSocraticResponse(response: unknown): response is SocraticResponse {
  if (typeof response !== 'object' || response === null) return false;
  const r = response as Record<string, unknown>;

  if (typeof r.response_text !== 'string' || r.response_text.trim().length === 0) return false;
  if (r.hint_tier !== 1 && r.hint_tier !== 2 && r.hint_tier !== 3) return false;
  if (typeof r.concept !== 'string') return false;
  if (typeof r.suggested_investigation !== 'string') return false;
  if (!Array.isArray(r.referenced_structure_ids)) return false;

  // Validate that all referenced structure IDs exist in our vetted registry
  for (const id of r.referenced_structure_ids) {
    if (typeof id !== 'string' || !ANATOMY_REGISTRY[id]) {
      return false;
    }
  }

  if (typeof r.confidence !== 'number' || r.confidence < 0 || r.confidence > 1) return false;
  if (typeof r.requires_content_review !== 'boolean') return false;

  return true;
}

/**
 * Reviewed deterministic Socratic knowledge generator.
 * Operates offline without network credentials while providing 3-tier progressive pedagogical guidance.
 */
export function generateSocraticGuidance(context: SocraticContext): SocraticResponse {
  const query = context.student_query.toLowerCase();
  const currentOrganId = context.current_organ_id;
  const currentMissionId = context.current_mission_id;
  const currentStepNum = context.current_mission_step || 1;

  // Scenario 1: Cardiac Highway Mission in progress
  if (currentMissionId === 'cardiac_highway') {
    const step = CARDIAC_HIGHWAY_MISSION.steps?.find(s => s.stepIndex === currentStepNum);
    if (step) {
      // Determine appropriate hint tier based on query tone or prior attempts
      let tier: 1 | 2 | 3 = 1;
      if (query.includes('where') || query.includes('locate') || context.attempt_count >= 1) {
        tier = 2;
      }
      if (query.includes('tell me') || query.includes('answer') || context.attempt_count >= 2) {
        tier = 3;
      }

      let responseText = '';
      if (tier === 1) {
        responseText = `${step.pedagogicalHintTier1} Think about whether blood at this stage is deoxygenated or oxygenated, and whether it is heading to the pulmonary or systemic circuit.`;
      } else if (tier === 2) {
        responseText = `${step.pedagogicalHintTier2} Rotate the 3D model and look at how the chambers and major vessels connect.`;
      } else {
        responseText = `${step.pedagogicalHintTier3} Look closely at the highlighted region or use the Systemic/Pulmonary focus button to inspect the landmark.`;
      }

      return {
        response_text: responseText,
        hint_tier: tier,
        concept: `NCERT Class 11 Ch 18: Cardiac Pathway Step ${step.stepIndex} (${step.title})`,
        suggested_investigation: 'Orbit the heart in 3D to observe the outflow and inflow tract orientations.',
        referenced_structure_ids: [step.targetStructureId],
        confidence: 0.98,
        requires_content_review: false,
      };
    }
  }

  // Scenario 2: Appendicular Assembly Mission in progress
  if (currentMissionId === 'appendicular_assembly') {
    let tier: 1 | 2 | 3 = 1;
    if (query.includes('radius') || query.includes('thumb') || query.includes('lateral')) {
      tier = 2;
    }
    if (query.includes('ulna') || query.includes('pinky') || query.includes('elbow') || context.attempt_count >= 2) {
      tier = 3;
    }

    let responseText = '';
    if (tier === 1) {
      responseText =
        'In standard anatomical position (standing erect with palms facing forward), is the thumb side considered medial (toward the midline) or lateral (away from the midline)?';
    } else if (tier === 2) {
      responseText =
        'The Radius is always on the lateral (thumb) side! It articulates at the elbow with the rounded capitulum of the humerus. The Ulna is medial (pinky side) and articulates with the spool-shaped trochlea.';
    } else {
      responseText =
        'Align the proximal head of the Radius under the lateral humerus capitulum, and fit the olecranon notch of the Ulna onto the medial humerus trochlea.';
    }

    return {
      response_text: responseText,
      hint_tier: tier,
      concept: 'NCERT Class 11 Ch 20: Forearm Articulation (Radius vs. Ulna)',
      suggested_investigation: 'Rotate the camera to view the elbow joint anteriorly and match the condylar surfaces.',
      referenced_structure_ids: ['bone_humerus_r', 'bone_radius_r', 'bone_ulna_r'],
      confidence: 0.99,
      requires_content_review: false,
    };
  }

  // Scenario 3: Free exploration of an anatomical structure
  if (currentOrganId && ANATOMY_REGISTRY[currentOrganId]) {
    const organ = ANATOMY_REGISTRY[currentOrganId];
    return {
      response_text: `You are examining the ${organ.displayName}. ${organ.shortDescription} What biological role does this structure play in maintaining homeostasis? Check its connection with ${organ.neighboringStructureIds.map(id => ANATOMY_REGISTRY[id]?.displayName || id).join(', ')}.`,
      hint_tier: 1,
      concept: `${organ.ncertReference}`,
      suggested_investigation: `Observe how the ${organ.displayName} is positioned relative to surrounding skeletal landmarks and vascular pathways.`,
      referenced_structure_ids: [organ.id],
      confidence: 0.95,
      requires_content_review: false,
    };
  }

  // Default fallback guidance
  return {
    response_text:
      'Welcome to the Human Anatomy Laboratory! Select any organ or bone in the 3D viewport to investigate its structure, or launch "The Cardiac Highway" or "Appendicular Assembly" from the Missions bar above.',
    hint_tier: 1,
    concept: 'NCERT Anatomy & Physiology Fundamentals',
    suggested_investigation: 'Use left-click orbit, right-click pan, and scroll wheel to inspect the 3D anatomical model.',
    referenced_structure_ids: ['heart_right_atrium'],
    confidence: 0.9,
    requires_content_review: false,
  };
}
