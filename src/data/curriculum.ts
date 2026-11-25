import {
  ANATOMY_BY_KEY,
  ANATOMY_STRUCTURES,
  ATTRIBUTION,
  CATEGORY_COLORS,
  NCERT_CHAPTER_REFS,
  OPTIONAL_EXTENSION_MODELS,
  SYSTEMS,
  SYSTEM_LABELS,
  getStructureDetails,
  resolveNcertRefForStructure,
  structuresFor,
  type AnatomySex,
  type AnatomyStructure,
  type AnatomySystem,
  type NcertBookReference,
  type NcertGrade,
  type OptionalExtensionModelSpec,
  type StructureNcertDetails,
  type TopLayerId,
} from '../anatomy/anatomyRegistry';

export {
  ANATOMY_BY_KEY,
  ANATOMY_STRUCTURES,
  ATTRIBUTION,
  CATEGORY_COLORS,
  NCERT_CHAPTER_REFS,
  OPTIONAL_EXTENSION_MODELS,
  SYSTEMS,
  SYSTEM_LABELS,
  getStructureDetails,
  resolveNcertRefForStructure,
  structuresFor,
  type AnatomySex,
  type AnatomyStructure,
  type AnatomySystem,
  type NcertBookReference,
  type NcertGrade,
  type OptionalExtensionModelSpec,
  type StructureNcertDetails,
  type TopLayerId,
};

export interface CourseChapter {
  id: string;
  ncertGrade: NcertGrade;
  title: string;
  ncertRef: NcertBookReference;
  defaultFocusKey: string;
  recommendedSex?: AnatomySex;
  layers: TopLayerId[];
  structureKeys: string[];
}

export const COURSE_CHAPTERS: CourseChapter[] = [
  {
    id: 'ch-1',
    ncertGrade: 'Class 11',
    title: 'Ch 20 · Skeletal & Muscular Movement',
    ncertRef: NCERT_CHAPTER_REFS.c11_ch20,
    defaultFocusKey: 'femur_l',
    layers: ['skin', 'skeleton', 'muscles'],
    structureKeys: ['skull', 'sternum', 'ribs_l', 'ribs_r', 'femur_l', 'femur_r', 'humerus_r'],
  },
  {
    id: 'ch-2',
    ncertGrade: 'Class 11',
    title: 'Ch 18 · Body Fluids & Circulation',
    ncertRef: NCERT_CHAPTER_REFS.c11_ch18,
    defaultFocusKey: 'heart',
    layers: ['skin', 'skeleton', 'organs', 'arteries', 'veins'],
    structureKeys: ['heart', 'aorta', 'vena_cava_superior', 'vena_cava_inferior', 'pulmonary_vessels', 'coronary_arteries'],
  },
  {
    id: 'ch-3',
    ncertGrade: 'Class 11',
    title: 'Ch 17 · Breathing & Gas Exchange',
    ncertRef: NCERT_CHAPTER_REFS.c11_ch17,
    defaultFocusKey: 'lung_l',
    layers: ['skin', 'skeleton', 'organs'],
    structureKeys: ['trachea', 'bronchi', 'lung_l', 'lung_r', 'larynx'],
  },
  {
    id: 'ch-4',
    ncertGrade: 'Class 11',
    title: 'Ch 16/19 · Digestion & Excretion',
    ncertRef: NCERT_CHAPTER_REFS.c11_ch16,
    defaultFocusKey: 'stomach',
    layers: ['skin', 'organs', 'arteries', 'veins'],
    structureKeys: ['esophagus', 'stomach', 'liver', 'pancreas', 'small_intestine', 'kidney_l', 'kidney_r', 'bladder'],
  },
  {
    id: 'ch-5',
    ncertGrade: 'Class 11',
    title: 'Ch 21 · Neural Control',
    ncertRef: NCERT_CHAPTER_REFS.c11_ch21,
    defaultFocusKey: 'brain',
    layers: ['skin', 'skeleton', 'organs', 'nerves'],
    structureKeys: ['brain', 'cerebellum', 'brainstem', 'spinal_cord', 'cranial_nerves'],
  },
  {
    id: 'ch-6',
    ncertGrade: 'Class 12',
    title: 'Ch 2 · Human Reproduction',
    ncertRef: NCERT_CHAPTER_REFS.c12_ch2,
    defaultFocusKey: 'uterus',
    recommendedSex: 'female',
    layers: ['skin', 'skeleton', 'organs'],
    structureKeys: ['ovary_l', 'ovary_r', 'fallopian_tubes', 'uterus', 'vagina', 'breast_l', 'reproductive', 'prostate'],
  },
  {
    id: 'ch-7',
    ncertGrade: 'Class 12',
    title: 'Ch 7 · Lymphoid Organs & Immunity',
    ncertRef: NCERT_CHAPTER_REFS.c12_ch7,
    defaultFocusKey: 'thymus',
    layers: ['skin', 'skeleton', 'organs'],
    structureKeys: ['thymus', 'spleen', 'pharynx', 'small_intestine', 'appendix', 'femur_l'],
  },
];
