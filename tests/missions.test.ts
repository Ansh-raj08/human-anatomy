import { describe, it, expect } from 'vitest';
import { CARDIAC_HIGHWAY_MISSION, INITIAL_ASSEMBLY_BONES } from '../src/missions/missionData';

describe('Gamified Spatial Missions Logic', () => {
  describe('Mission A: The Cardiac Highway', () => {
    it('defines the strict 14-checkpoint double-circulation sequence', () => {
      const steps = CARDIAC_HIGHWAY_MISSION.steps!;
      expect(steps.length).toBe(14);

      const sequenceIds = steps.map(s => s.targetStructureId);
      expect(sequenceIds).toEqual([
        'circ_svc_ivc',
        'circ_right_atrium',
        'circ_tricuspid_valve',
        'circ_right_ventricle',
        'circ_pulmonary_valve',
        'circ_pulmonary_artery',
        'circ_lung_capillaries',
        'circ_pulmonary_veins',
        'circ_left_atrium',
        'circ_mitral_valve',
        'circ_left_ventricle',
        'circ_aortic_valve',
        'circ_aorta',
        'circ_systemic_tissues',
      ]);
    });

    it('correctly categorizes oxygenation status across pulmonary and systemic circuits', () => {
      const steps = CARDIAC_HIGHWAY_MISSION.steps!;

      // Deoxygenated stages before lungs (steps 1 to 6)
      for (let i = 0; i < 6; i++) {
        expect(steps[i].isOxygenated).toBe(false);
      }

      // Oxygenated stage at lungs and left heart (steps 7 to 13)
      for (let i = 6; i < 13; i++) {
        expect(steps[i].isOxygenated).toBe(true);
      }

      // Systemic tissues completing the loop
      expect(steps[13].isOxygenated).toBe(false);
    });

    it('provides distinct 3-tier progressive hints for every checkpoint', () => {
      for (const step of CARDIAC_HIGHWAY_MISSION.steps!) {
        expect(step.pedagogicalHintTier1.length).toBeGreaterThan(15);
        expect(step.pedagogicalHintTier2.length).toBeGreaterThan(15);
        expect(step.pedagogicalHintTier3.length).toBeGreaterThan(15);
        expect(step.explanatoryFeedbackOnSuccess.length).toBeGreaterThan(20);
      }
    });
  });

  describe('Mission B: Appendicular Assembly', () => {
    it('defines initial displaced positions and verified target anchors', () => {
      const radius = INITIAL_ASSEMBLY_BONES.bone_radius_r;
      const ulna = INITIAL_ASSEMBLY_BONES.bone_ulna_r;

      expect(radius.anatomicalSide).toBe('lateral');
      expect(ulna.anatomicalSide).toBe('medial');

      // Check distance tolerance logic
      const targetPos = radius.targetPosition;
      const validOffsetPos: [number, number, number] = [
        targetPos[0] + 0.1,
        targetPos[1] + 0.05,
        targetPos[2],
      ];

      const dx = validOffsetPos[0] - targetPos[0];
      const dy = validOffsetPos[1] - targetPos[1];
      const dz = validOffsetPos[2] - targetPos[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      expect(dist).toBeLessThanOrEqual(radius.toleranceDistance);

      // Verify that placing on opposite (medial) side exceeds tolerance and fails
      const invalidOppositePos: [number, number, number] = [
        ulna.targetPosition[0],
        ulna.targetPosition[1],
        ulna.targetPosition[2],
      ];
      const wrongDx = invalidOppositePos[0] - targetPos[0];
      const wrongDy = invalidOppositePos[1] - targetPos[1];
      const wrongDz = invalidOppositePos[2] - targetPos[2];
      const wrongDist = Math.sqrt(wrongDx * wrongDx + wrongDy * wrongDy + wrongDz * wrongDz);

      expect(wrongDist).toBeGreaterThan(radius.toleranceDistance);
    });
  });
});
