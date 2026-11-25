import { ANATOMY_BY_KEY, type AnatomySystem } from 'open-anatomy-3d';

export type VascularSubtype = 'artery' | 'vein' | null;

export type MuscleBifurcationGroup =
  | 'axial_head_neck'
  | 'thoracic_abdominal'
  | 'upper_limb'
  | 'lower_limb'
  | 'cardiac_visceral';

export interface MuscleGroupMeta {
  id: MuscleBifurcationGroup;
  label: string;
  shortLabel: string;
  color: string;
  description: string;
}

export const MUSCLE_BIFURCATION_META: Record<MuscleBifurcationGroup, MuscleGroupMeta> = {
  axial_head_neck: {
    id: 'axial_head_neck',
    label: 'Axial & Head/Neck Musculature',
    shortLabel: 'Axial / Neck',
    color: '#b93838',
    description: 'Deep crimson-terracotta: cervical, trapezius, and dorsal axial stabilizers',
  },
  thoracic_abdominal: {
    id: 'thoracic_abdominal',
    label: 'Thoracic & Abdominal Wall Musculature',
    shortLabel: 'Thoracic / Core',
    color: '#c84b4b',
    description: 'Warm striated sienna: pectorals, intercostals, diaphragm, abdominal & pelvic floor',
  },
  upper_limb: {
    id: 'upper_limb',
    label: 'Upper Limb (Appendicular) Musculature',
    shortLabel: 'Upper Limb',
    color: '#d45d5d',
    description: 'Rich rose-myoglobin: deltoid, rotator cuff, brachium, forearm, and hand muscles',
  },
  lower_limb: {
    id: 'lower_limb',
    label: 'Lower Limb (Appendicular) Musculature',
    shortLabel: 'Lower Limb',
    color: '#9e2a2b',
    description: 'Deep burgundy-crimson: gluteal, iliopsoas, quadriceps, hamstrings, calf, and foot',
  },
  cardiac_visceral: {
    id: 'cardiac_visceral',
    label: 'Cardiac / Smooth Visceral Musculature',
    shortLabel: 'Cardiac / Smooth',
    color: '#e11d48',
    description: 'Saturated scarlet: myocardium and visceral smooth muscle organs',
  },
};

export interface ClassifiedMeshInfo {
  key: string;
  system: AnatomySystem;
  vascularSubtype: VascularSubtype;
  muscleGroup: MuscleBifurcationGroup | null;
  pbrColor: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
}

const ARTERY_REGEX = /arter|aort|carotid|subclavian|iliac|femoral_a|brachial|radial_a|ulnar_a|pulmonary_artery|coronary/i;
const VEIN_REGEX = /vein|vena|jugular|saphenous|portal|femoral_v|brachial_v|pulmonary_vein|iliac_v|pulmonary_vessels/i;

const BONE_BILATERAL_REGEX = /femur|thigh|patella|tibia|fibula|humerus|forearm|radius|ulna|clavicle|scapula|rib|hand|foot|skull|mandible|sternum|pelvis|spine|teeth|bone|skel/i;

const AXIAL_MUSCLE_KEYS = new Set([
  'neck_muscles_l',
  'neck_muscles_r',
  'trapezius_l',
  'trapezius_r',
  'back_muscles_l',
  'back_muscles_r',
]);

const THORACIC_ABDOMINAL_MUSCLE_KEYS = new Set([
  'chest_muscles_l',
  'chest_muscles_r',
  'abdominal_muscles',
  'intercostals_l',
  'intercostals_r',
  'diaphragm',
  'pelvic_floor',
]);

const UPPER_LIMB_MUSCLE_KEYS = new Set([
  'deltoid_l',
  'deltoid_r',
  'rotator_cuff_l',
  'rotator_cuff_r',
  'shoulder_muscles_l',
  'shoulder_muscles_r',
  'upper_arm_muscles_l',
  'upper_arm_muscles_r',
  'forearm_muscles_l',
  'forearm_muscles_r',
  'hand_muscles_l',
  'hand_muscles_r',
]);

const LOWER_LIMB_MUSCLE_KEYS = new Set([
  'gluteal_l',
  'gluteal_r',
  'iliopsoas_l',
  'iliopsoas_r',
  'quadriceps_l',
  'quadriceps_r',
  'hamstrings_l',
  'hamstrings_r',
  'adductors_l',
  'adductors_r',
  'shin_muscles_l',
  'shin_muscles_r',
  'calf_l',
  'calf_r',
  'foot_muscles_l',
  'foot_muscles_r',
]);

const CARDIAC_VISCERAL_MUSCLE_KEYS = new Set([
  'heart',
  'stomach',
  'esophagus',
  'small_intestine',
  'colon',
  'uterus',
  'bladder',
]);

/**
 * Resolves a glTF node (or its parent group, e.g. `skin` -> `skin_1`) into a canonical key.
 */
export function resolveCanonicalMeshKey(node: { name?: string; parent?: { name?: string } | null }): string | null {
  if (node.name && ANATOMY_BY_KEY[node.name]) return node.name;
  if (node.parent?.name && ANATOMY_BY_KEY[node.parent.name]) return node.parent.name;
  return node.name || node.parent?.name || null;
}

/**
 * Classifies every mesh node cleanly by system, vascular subtype (artery/vein),
 * and muscular bifurcation category. Guarantees symmetric bilateral bone mapping
 * (e.g. both `femur_l` and `femur_r` strictly resolve to `system === 'skeleton'`).
 */
export function classifyAnatomicalMesh(
  node: { name?: string; parent?: { name?: string } | null },
  fallbackBaseColor = '#cbd5e1'
): ClassifiedMeshInfo {
  const key = resolveCanonicalMeshKey(node) ?? 'unknown';
  const catalogEntry = ANATOMY_BY_KEY[key];

  // Determine canonical system (explicitly honoring bilateral skeletal patterns & parent group)
  let system: AnatomySystem = catalogEntry?.system ?? 'organs';
  const parentName = node.parent?.name?.toLowerCase() ?? '';
  if (
    parentName === 'skeleton' ||
    BONE_BILATERAL_REGEX.test(key)
  ) {
    if (!key.includes('muscles')) {
      system = 'skeleton';
    }
  }
  if (parentName === 'skin' || key === 'skin' || key === 'skin_1') {
    system = 'skin';
  }
  if (parentName === 'vessels') {
    system = 'vessels';
  }
  if (parentName === 'muscles') {
    system = 'muscles';
  }
  if (parentName === 'nerves') {
    system = 'nerves';
  }

  // Vascular bifurcation (Arteries Red vs Veins Blue)
  let vascularSubtype: VascularSubtype = null;
  if (system === 'vessels' || ARTERY_REGEX.test(key) || VEIN_REGEX.test(key)) {
    if (VEIN_REGEX.test(key)) {
      vascularSubtype = 'vein';
      return {
        key,
        system: 'vessels',
        vascularSubtype,
        muscleGroup: null,
        pbrColor: '#2563eb',
        roughness: 0.35,
        metalness: 0.05,
        clearcoat: 0.3,
      };
    }
    if (ARTERY_REGEX.test(key)) {
      vascularSubtype = 'artery';
      return {
        key,
        system: 'vessels',
        vascularSubtype,
        muscleGroup: null,
        pbrColor: '#dc2626',
        roughness: 0.3,
        metalness: 0.05,
        clearcoat: 0.35,
      };
    }
  }

  // Muscular bifurcation (5 categories)
  let muscleGroup: MuscleBifurcationGroup | null = null;
  if (system === 'muscles') {
    if (AXIAL_MUSCLE_KEYS.has(key)) muscleGroup = 'axial_head_neck';
    else if (THORACIC_ABDOMINAL_MUSCLE_KEYS.has(key)) muscleGroup = 'thoracic_abdominal';
    else if (UPPER_LIMB_MUSCLE_KEYS.has(key)) muscleGroup = 'upper_limb';
    else if (LOWER_LIMB_MUSCLE_KEYS.has(key)) muscleGroup = 'lower_limb';
    else muscleGroup = 'axial_head_neck';

    return {
      key,
      system: 'muscles',
      vascularSubtype: null,
      muscleGroup,
      pbrColor: MUSCLE_BIFURCATION_META[muscleGroup].color,
      roughness: 0.48,
      metalness: 0.04,
      clearcoat: 0.18,
    };
  }

  if (CARDIAC_VISCERAL_MUSCLE_KEYS.has(key)) {
    muscleGroup = 'cardiac_visceral';
    return {
      key,
      system,
      vascularSubtype: null,
      muscleGroup,
      pbrColor: key === 'heart' ? MUSCLE_BIFURCATION_META.cardiac_visceral.color : (catalogEntry?.color ?? fallbackBaseColor),
      roughness: 0.36,
      metalness: 0.04,
      clearcoat: key === 'heart' ? 0.28 : 0.15,
    };
  }

  // Skeleton calibrated ivory bone PBR
  if (system === 'skeleton') {
    return {
      key,
      system: 'skeleton',
      vascularSubtype: null,
      muscleGroup: null,
      pbrColor: '#e7dfd0',
      roughness: 0.72,
      metalness: 0.04,
      clearcoat: 0.05,
    };
  }

  return {
    key,
    system,
    vascularSubtype: null,
    muscleGroup: null,
    pbrColor: catalogEntry?.color ?? fallbackBaseColor,
    roughness: 0.45,
    metalness: 0.05,
    clearcoat: 0.15,
  };
}
