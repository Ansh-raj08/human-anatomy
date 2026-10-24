import { describe, it, expect } from 'vitest';
import { ANATOMY_REGISTRY, ANATOMICAL_SYSTEMS } from '../src/anatomy/registry';
import { CARDIAC_HIGHWAY_MISSION, APPENDICULAR_ASSEMBLY_MISSION } from '../src/missions/missionData';

describe('Anatomical Registry Integrity', () => {
  it('registers all primary anatomical systems', () => {
    const expectedSystems = ['skeletal', 'circulatory', 'respiratory', 'digestive', 'urinary', 'nervous', 'integumentary'];
    for (const sys of expectedSystems) {
      expect(ANATOMICAL_SYSTEMS).toHaveProperty(sys);
      expect(ANATOMICAL_SYSTEMS[sys as keyof typeof ANATOMICAL_SYSTEMS].displayName).toBeDefined();
    }
  });

  it('validates every structure possesses valid metadata and camera targets', () => {
    const structures = Object.values(ANATOMY_REGISTRY);
    expect(structures.length).toBeGreaterThanOrEqual(25);

    for (const struct of structures) {
      expect(struct.id).toBeTruthy();
      expect(struct.displayName).toBeTruthy();
      expect(struct.system).toBeTruthy();
      expect(struct.shortDescription).toBeTruthy();
      expect(struct.biologicalFunction).toBeTruthy();
      expect(struct.ncertReference).toBeTruthy();

      // Camera anchors
      expect(struct.cameraFocus.target.length).toBe(3);
      expect(struct.cameraFocus.distance).toBeGreaterThan(0);

      // Verify all neighbors exist in registry
      for (const neighborId of struct.neighboringStructureIds) {
        expect(ANATOMY_REGISTRY).toHaveProperty(neighborId);
      }
    }
  });

  it('ensures all 14 checkpoints in the Cardiac Highway exist in the registry', () => {
    expect(CARDIAC_HIGHWAY_MISSION.steps).toBeDefined();
    expect(CARDIAC_HIGHWAY_MISSION.steps?.length).toBe(14);

    for (const step of CARDIAC_HIGHWAY_MISSION.steps!) {
      expect(ANATOMY_REGISTRY).toHaveProperty(step.targetStructureId);
      const organ = ANATOMY_REGISTRY[step.targetStructureId];
      expect(organ.displayName).toBeTruthy();
    }
  });

  it('verifies humerus, radius, and ulna are in appendicular skeleton with correct lateral/medial anatomy', () => {
    const humerus = ANATOMY_REGISTRY['bone_humerus_r'];
    const radius = ANATOMY_REGISTRY['bone_radius_r'];
    const ulna = ANATOMY_REGISTRY['bone_ulna_r'];

    expect(humerus).toBeDefined();
    expect(radius).toBeDefined();
    expect(ulna).toBeDefined();

    expect(humerus.subsystem).toContain('Brachium');
    expect(radius.shortDescription.toLowerCase()).toContain('lateral');
    expect(radius.shortDescription.toLowerCase()).toContain('thumb');
    expect(ulna.shortDescription.toLowerCase()).toContain('medial');
    expect(ulna.shortDescription.toLowerCase()).toContain('pinky');
  });
});
