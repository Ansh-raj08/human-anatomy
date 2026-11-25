import {
  ANATOMY_BY_KEY,
  ANATOMY_STRUCTURES,
  ATTRIBUTION,
  CATEGORY_COLORS,
  SYSTEMS,
  SYSTEM_LABELS,
  structuresFor,
  type AnatomySex,
  type AnatomyStructure,
  type AnatomySystem,
} from 'open-anatomy-3d';

export {
  ANATOMY_BY_KEY,
  ANATOMY_STRUCTURES,
  ATTRIBUTION,
  CATEGORY_COLORS,
  SYSTEMS,
  SYSTEM_LABELS,
  structuresFor,
  type AnatomySex,
  type AnatomyStructure,
  type AnatomySystem,
};

export type TopLayerId =
  | 'skin'
  | 'skeleton'
  | 'muscles'
  | 'organs'
  | 'arteries'
  | 'veins'
  | 'nerves';

export type NcertGrade = 'Class 11' | 'Class 12';

export interface NcertBookReference {
  grade: NcertGrade;
  chapterNumber: number;
  unitTitle: string;
  chapterTitle: string;
  pageRef: string;
  url: string;
}

export const NCERT_CHAPTER_REFS: Record<string, NcertBookReference> = {
  c11_ch16: {
    grade: 'Class 11',
    chapterNumber: 16,
    unitTitle: 'Unit V · Human Physiology',
    chapterTitle: 'Digestion and Absorption',
    pageRef: 'pp. 257–266',
    url: 'https://ncert.nic.in/textbook.php?kebo1=16-19',
  },
  c11_ch17: {
    grade: 'Class 11',
    chapterNumber: 17,
    unitTitle: 'Unit V · Human Physiology',
    chapterTitle: 'Breathing and Exchange of Gases',
    pageRef: 'pp. 268–277',
    url: 'https://ncert.nic.in/textbook.php?kebo1=17-19',
  },
  c11_ch18: {
    grade: 'Class 11',
    chapterNumber: 18,
    unitTitle: 'Unit V · Human Physiology',
    chapterTitle: 'Body Fluids and Circulation',
    pageRef: 'pp. 278–288',
    url: 'https://ncert.nic.in/textbook.php?kebo1=18-19',
  },
  c11_ch19: {
    grade: 'Class 11',
    chapterNumber: 19,
    unitTitle: 'Unit V · Human Physiology',
    chapterTitle: 'Excretory Products and their Elimination',
    pageRef: 'pp. 290–299',
    url: 'https://ncert.nic.in/textbook.php?kebo1=19-19',
  },
  c11_ch20: {
    grade: 'Class 11',
    chapterNumber: 20,
    unitTitle: 'Unit V · Human Physiology',
    chapterTitle: 'Locomotion and Movement',
    pageRef: 'pp. 302–313',
    url: 'https://ncert.nic.in/textbook.php?kebo1=14-19',
  },
  c11_ch21: {
    grade: 'Class 11',
    chapterNumber: 21,
    unitTitle: 'Unit V · Human Physiology',
    chapterTitle: 'Neural Control and Coordination',
    pageRef: 'pp. 315–327',
    url: 'https://ncert.nic.in/textbook.php?kebo1=14-19',
  },
  c12_ch2: {
    grade: 'Class 12',
    chapterNumber: 2,
    unitTitle: 'Unit VI · Reproduction',
    chapterTitle: 'Human Reproduction',
    pageRef: 'pp. 42–55',
    url: 'https://ncert.nic.in/textbook.php?lebo1=2-13',
  },
  c12_ch7: {
    grade: 'Class 12',
    chapterNumber: 7,
    unitTitle: 'Unit VIII · Biology in Human Welfare',
    chapterTitle: 'Human Health and Disease (Lymphoid Organs)',
    pageRef: 'pp. 153–156',
    url: 'https://ncert.nic.in/textbook.php?lebo1=7-13',
  },
};

export interface OptionalExtensionModelSpec {
  id: string;
  filename: string;
  url: string;
  label: string;
  layer: TopLayerId;
  ncertGrade: NcertGrade;
}

export const OPTIONAL_EXTENSION_MODELS: OptionalExtensionModelSpec[] = [
  {
    id: 'ext_respiratory',
    filename: 'respiratory_lungs.glb',
    url: '/models/respiratory_lungs.glb',
    label: 'Respiratory High-Res Lungs',
    layer: 'organs',
    ncertGrade: 'Class 11',
  },
  {
    id: 'ext_venous',
    filename: 'venous_system.glb',
    url: '/models/venous_system.glb',
    label: 'Systemic Venous Tree',
    layer: 'veins',
    ncertGrade: 'Class 11',
  },
  {
    id: 'ext_lymphoid',
    filename: 'lymphoid_system.glb',
    url: '/models/lymphoid_system.glb',
    label: 'Lymphoid & MALT Network',
    layer: 'organs',
    ncertGrade: 'Class 12',
  },
  {
    id: 'ext_male_repro',
    filename: 'male_reproductive.glb',
    url: '/models/male_reproductive.glb',
    label: 'Male Reproductive Tract',
    layer: 'organs',
    ncertGrade: 'Class 12',
  },
  {
    id: 'ext_female_repro',
    filename: 'female_reproductive.glb',
    url: '/models/female_reproductive.glb',
    label: 'Female Reproductive Tract',
    layer: 'organs',
    ncertGrade: 'Class 12',
  },
];

export interface StructureNcertDetails {
  key: string;
  label: string;
  system: AnatomySystem;
  category: string;
  color: string;
  ncertRef: NcertBookReference;
  overview: string;
  clinicalNote: string;
}

const STRUCTURE_TO_NCERT_REF: Record<string, string> = {
  // Ch 16 Digestion
  esophagus: 'c11_ch16',
  stomach: 'c11_ch16',
  liver: 'c11_ch16',
  gallbladder: 'c11_ch16',
  pancreas: 'c11_ch16',
  small_intestine: 'c11_ch16',
  colon: 'c11_ch16',
  salivary_glands: 'c11_ch16',
  tongue: 'c11_ch16',
  // Ch 17 Breathing
  larynx: 'c11_ch17',
  trachea: 'c11_ch17',
  bronchi: 'c11_ch17',
  lung_l: 'c11_ch17',
  lung_r: 'c11_ch17',
  diaphragm: 'c11_ch17',
  // Ch 18 Circulation
  heart: 'c11_ch18',
  aorta: 'c11_ch18',
  vena_cava_superior: 'c11_ch18',
  vena_cava_inferior: 'c11_ch18',
  pulmonary_vessels: 'c11_ch18',
  coronary_arteries: 'c11_ch18',
  carotid_l: 'c11_ch18',
  carotid_r: 'c11_ch18',
  // Ch 19 Excretion
  kidney_l: 'c11_ch19',
  kidney_r: 'c11_ch19',
  ureter_l: 'c11_ch19',
  ureter_r: 'c11_ch19',
  bladder: 'c11_ch19',
  // Ch 20 Locomotion
  skull: 'c11_ch20',
  femur_l: 'c11_ch20',
  femur_r: 'c11_ch20',
  humerus_l: 'c11_ch20',
  humerus_r: 'c11_ch20',
  pelvis: 'c11_ch20',
  sternum: 'c11_ch20',
  ribs_l: 'c11_ch20',
  ribs_r: 'c11_ch20',
  // Ch 21 Neural
  brain: 'c11_ch21',
  cerebellum: 'c11_ch21',
  brainstem: 'c11_ch21',
  spinal_cord: 'c11_ch21',
  cranial_nerves: 'c11_ch21',
  // Class 12 Ch 2 Reproduction
  reproductive: 'c12_ch2',
  prostate: 'c12_ch2',
  ovary_l: 'c12_ch2',
  ovary_r: 'c12_ch2',
  fallopian_tubes: 'c12_ch2',
  uterus: 'c12_ch2',
  vagina: 'c12_ch2',
  breast_l: 'c12_ch2',
  breast_r: 'c12_ch2',
  // Class 12 Ch 7 Lymphoid / Immunity
  thymus: 'c12_ch7',
  spleen: 'c12_ch7',
  appendix: 'c12_ch7',
  pharynx: 'c12_ch7',
};

const CUSTOM_SUMMARIES: Record<string, { overview: string; clinicalNote: string }> = {
  heart: {
    overview:
      'Four-chambered myogenic pump in the middle mediastinum driving pulmonary (deoxygenated) and systemic (oxygenated) circulation.',
    clinicalNote:
      'Left ventricular wall is ~3x thicker than the right to sustain ~120 mmHg systemic pressure; SA node initiates rhythmic contraction.',
  },
  femur_l: {
    overview:
      'Longest and strongest bone of the left lower limb; houses red bone marrow (primary lymphoid site for B-cell hematopoiesis).',
    clinicalNote:
      'Proximal head articulates with the pelvic acetabulum; distal condyles articulate with the tibia and patella.',
  },
  femur_r: {
    overview:
      'Longest and strongest bone of the right lower limb bearing axial weight between hip and knee joints.',
    clinicalNote:
      'Femoral neck fractures compromise medial circumflex femoral arterial supply to the femoral head.',
  },
  lung_l: {
    overview:
      'Two-lobed left lung featuring the cardiac notch along its anterior border to accommodate the leftward heart apex.',
    clinicalNote:
      'Alveolar-capillary membrane (~0.5 µm) enables rapid O2/CO2 partial-pressure diffusion.',
  },
  lung_r: {
    overview:
      'Three-lobed right lung (superior, middle, inferior) separated by horizontal and oblique fissures.',
    clinicalNote:
      'Sits slightly higher than the left lung above the right dome of the diaphragm and liver.',
  },
  thymus: {
    overview:
      'Primary lymphoid organ beneath the sternum providing the microenvironment for T-lymphocyte maturation.',
    clinicalNote:
      'Large at birth and gradually involutes with age, reducing thymosin output in adulthood.',
  },
  spleen: {
    overview:
      'Bean-shaped secondary lymphoid organ in the upper-left abdomen filtering blood-borne antigens and storing erythrocytes.',
    clinicalNote:
      'Packed with lymphocytes and phagocytes; serves as the primary graveyard for senescent red blood cells.',
  },
  uterus: {
    overview:
      'Inverted pear-shaped pelvic organ with perimetrium, smooth-muscle myometrium, and cyclic glandular endometrium.',
    clinicalNote:
      'Supports blastocyst implantation and fetal development; communicates with ampullary oviducts.',
  },
};

export function resolveNcertRefForStructure(struct: AnatomyStructure): NcertBookReference {
  const mappedId = STRUCTURE_TO_NCERT_REF[struct.key];
  if (mappedId && NCERT_CHAPTER_REFS[mappedId]) {
    return NCERT_CHAPTER_REFS[mappedId];
  }
  if (struct.system === 'skeleton' || struct.system === 'muscles' || struct.system === 'joints') {
    return NCERT_CHAPTER_REFS.c11_ch20;
  }
  if (struct.system === 'vessels') return NCERT_CHAPTER_REFS.c11_ch18;
  if (struct.system === 'nerves') return NCERT_CHAPTER_REFS.c11_ch21;
  if (struct.category === 'Respiratory') return NCERT_CHAPTER_REFS.c11_ch17;
  if (struct.category === 'Renal / Urinary') return NCERT_CHAPTER_REFS.c11_ch19;
  if (struct.category === 'Reproductive') return NCERT_CHAPTER_REFS.c12_ch2;
  if (struct.category === 'Immune / Lymphatic') return NCERT_CHAPTER_REFS.c12_ch7;
  if (struct.category === 'Cardiovascular') return NCERT_CHAPTER_REFS.c11_ch18;
  return NCERT_CHAPTER_REFS.c11_ch16;
}

export function getStructureDetails(key: string): StructureNcertDetails {
  const struct = ANATOMY_BY_KEY[key] ?? ANATOMY_BY_KEY['heart'];
  const ncertRef = resolveNcertRefForStructure(struct);
  const custom = CUSTOM_SUMMARIES[struct.key];

  return {
    key: struct.key,
    label: struct.label,
    system: struct.system,
    category: struct.category,
    color: struct.color,
    ncertRef,
    overview:
      custom?.overview ??
      `${struct.label} is part of the ${SYSTEM_LABELS[struct.system]} layer (${struct.category}) in unified anatomical space.`,
    clinicalNote:
      custom?.clinicalNote ??
      `Aligned at origin (0, 0, 0) in ${ncertRef.grade} NCERT (${ncertRef.chapterTitle}).`,
  };
}
