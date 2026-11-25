import { describe, it, expect } from 'vitest';
import {
  ANATOMY_BY_KEY,
  ANATOMY_STRUCTURES,
  ATTRIBUTION,
  COURSE_CHAPTERS,
  NCERT_CHAPTER_REFS,
  getStructureDetails,
  structuresFor,
} from '../src/data/curriculum';
import { classifyAnatomicalMesh } from '../src/utils/anatomyClassifier';
import { useHandSettingsStore } from '../src/store/handSettingsStore';

describe('Classifier, NCERT Textbook Links & Hand Sensitivity Store', () => {
  it('classifies both femur_l and femur_r strictly as skeleton with zero visibility leak', () => {
    const femurL = classifyAnatomicalMesh({ name: 'femur_l', parent: { name: 'skeleton' } });
    const femurR = classifyAnatomicalMesh({ name: 'femur_r', parent: { name: 'skeleton' } });
    const femurLNoParent = classifyAnatomicalMesh({ name: 'femur_l' });
    expect(femurL.system).toBe('skeleton');
    expect(femurR.system).toBe('skeleton');
    expect(femurLNoParent.system).toBe('skeleton');
  });

  it('color-codes arteries red (#dc2626), veins blue (#2563eb), and bifurcates muscles', () => {
    const aorta = classifyAnatomicalMesh({ name: 'aorta', parent: { name: 'vessels' } });
    const svc = classifyAnatomicalMesh({ name: 'vena_cava_superior', parent: { name: 'vessels' } });
    const deltoid = classifyAnatomicalMesh({ name: 'deltoid_r', parent: { name: 'muscles' } });
    const quad = classifyAnatomicalMesh({ name: 'quadriceps_l', parent: { name: 'muscles' } });
    const heart = classifyAnatomicalMesh({ name: 'heart', parent: { name: 'organs' } });

    expect(aorta.vascularSubtype).toBe('artery');
    expect(aorta.pbrColor).toBe('#dc2626');
    expect(svc.vascularSubtype).toBe('vein');
    expect(svc.pbrColor).toBe('#2563eb');
    expect(deltoid.muscleGroup).toBe('upper_limb');
    expect(quad.muscleGroup).toBe('lower_limb');
    expect(heart.muscleGroup).toBe('cardiac_visceral');
  });

  it('maps Class 11 & Class 12 NCERT chapters to official ncert.nic.in textbook URLs', () => {
    expect(ANATOMY_STRUCTURES.length).toBe(147);
    expect(ATTRIBUTION).toContain('CC BY 4.0');
    for (const ref of Object.values(NCERT_CHAPTER_REFS)) {
      expect(ref.url.startsWith('https://ncert.nic.in/textbook.php?')).toBe(true);
    }
    for (const ch of COURSE_CHAPTERS) {
      expect(ANATOMY_BY_KEY[ch.defaultFocusKey]).toBeDefined();
    }
    expect(getStructureDetails('thymus').ncertRef.url).toContain('lebo1=7-13');
    expect(getStructureDetails('uterus').ncertRef.url).toContain('lebo1=2-13');
    expect(getStructureDetails('heart').ncertRef.url).toContain('kebo1=18-19');
    expect(structuresFor('female').some((s) => s.key === 'uterus')).toBe(true);
  });

  it('persists and updates Hand Sensitivity Settings in Zustand store', () => {
    const s = useHandSettingsStore.getState();
    expect(s.orbitSpeed).toBe(1.2);
    expect(s.zoomSpeed).toBe(1.0);
    expect(s.smoothing).toBe(0.15);
    expect(s.deadzone).toBe(0.03);
    expect(s.dwellTimeSec).toBe(1.0);

    s.setOrbitSpeed(2.4);
    s.setDwellTimeSec(0.6);
    expect(useHandSettingsStore.getState().orbitSpeed).toBe(2.4);
    expect(useHandSettingsStore.getState().dwellTimeSec).toBe(0.6);
    useHandSettingsStore.getState().resetDefaults();
    expect(useHandSettingsStore.getState().orbitSpeed).toBe(1.2);
  });
});
