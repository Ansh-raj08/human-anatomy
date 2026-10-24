import { describe, it, expect } from 'vitest';
import { generateSocraticGuidance, validateSocraticResponse, type SocraticResponse } from '../src/content/socraticTutor';

describe('Socratic AI Learning Assistant', () => {
  it('validates compliant Socratic responses matching schema', () => {
    const validRes: SocraticResponse = {
      response_text: 'Which chamber of the heart first receives venous blood from systemic circulation?',
      hint_tier: 1,
      concept: 'NCERT Class 11 Ch 18 (Cardiac Inflow)',
      suggested_investigation: 'Orbit the heart to examine the entrance of the superior vena cava.',
      referenced_structure_ids: ['circ_right_atrium'],
      confidence: 0.98,
      requires_content_review: false,
    };

    expect(validateSocraticResponse(validRes)).toBe(true);
  });

  it('rejects malformed responses with invalid tiers, empty text, or fabricated structure IDs', () => {
    expect(validateSocraticResponse(null)).toBe(false);
    expect(validateSocraticResponse({})).toBe(false);

    // Empty text
    expect(
      validateSocraticResponse({
        response_text: '',
        hint_tier: 1,
        concept: 'Concept',
        suggested_investigation: 'Look',
        referenced_structure_ids: [],
        confidence: 0.5,
        requires_content_review: false,
      })
    ).toBe(false);

    // Invalid tier (must be 1, 2, or 3)
    expect(
      validateSocraticResponse({
        response_text: 'Hint',
        hint_tier: 4,
        concept: 'Concept',
        suggested_investigation: 'Look',
        referenced_structure_ids: [],
        confidence: 0.5,
        requires_content_review: false,
      })
    ).toBe(false);

    // Fabricated structure ID not in registry
    expect(
      validateSocraticResponse({
        response_text: 'Hint',
        hint_tier: 1,
        concept: 'Concept',
        suggested_investigation: 'Look',
        referenced_structure_ids: ['fabricated_nonexistent_organ_123'],
        confidence: 0.5,
        requires_content_review: false,
      })
    ).toBe(false);
  });

  it('generates 3-tier progressive hints dynamically based on query and mission context', () => {
    const t1Res = generateSocraticGuidance({
      current_organ_id: 'circ_right_atrium',
      current_mission_id: 'cardiac_highway',
      attempt_count: 0,
      student_query: 'What is this chamber?',
      current_mission_step: 2,
      selected_structure_ids: ['circ_right_atrium'],
      student_level: 'Class 11 NEET Foundation',
      available_interactions: ['select', 'rotate', 'zoom'],
    });

    expect(t1Res.hint_tier).toBe(1);
    expect(validateSocraticResponse(t1Res)).toBe(true);

    const t2Res = generateSocraticGuidance({
      current_organ_id: 'circ_right_atrium',
      current_mission_id: 'cardiac_highway',
      attempt_count: 1,
      student_query: 'Where is it located?',
      current_mission_step: 2,
      selected_structure_ids: ['circ_right_atrium'],
      student_level: 'Class 11 NEET Foundation',
      available_interactions: ['select', 'rotate', 'zoom'],
    });

    expect(t2Res.hint_tier).toBe(2);
    expect(validateSocraticResponse(t2Res)).toBe(true);
  });
});
