#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ANATOMY_STRUCTURES,
  ATTRIBUTION,
  CATEGORIES,
  MODEL_FILES,
  SYSTEMS,
  SYSTEM_LABELS,
} from 'open-anatomy-3d';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const PKG_DIR = path.join(ROOT, 'node_modules', 'open-anatomy-3d');
const PUBLIC_MODELS_DIR = path.join(ROOT, 'public', 'models');
const SRC_DATA_DIR = path.join(ROOT, 'src', 'data');

fs.mkdirSync(PUBLIC_MODELS_DIR, { recursive: true });
fs.mkdirSync(SRC_DATA_DIR, { recursive: true });

for (const filename of Object.values(MODEL_FILES)) {
  const src = path.join(PKG_DIR, 'models', filename);
  const dest = path.join(PUBLIC_MODELS_DIR, filename);
  fs.copyFileSync(src, dest);
}

// Write typed catalog JSON into src/data/
fs.writeFileSync(
  path.join(SRC_DATA_DIR, 'openAnatomyCatalog.json'),
  JSON.stringify(ANATOMY_STRUCTURES, null, 2) + '\n'
);

// Copy official ATTRIBUTION.md into public/assets/licenses/
fs.copyFileSync(
  path.join(PKG_DIR, 'ATTRIBUTION.md'),
  path.join(ROOT, 'public', 'assets', 'licenses', 'ATTRIBUTION.md')
);

// Print verifiable Gate 1 summary
const bySystem = SYSTEMS.reduce((acc, sys) => {
  acc[sys] = ANATOMY_STRUCTURES.filter((s) => s.system === sys).length;
  return acc;
}, {});

const sampleKeys = [
  'heart',
  'lung_l',
  'lung_r',
  'liver',
  'stomach',
  'kidney_l',
  'kidney_r',
  'femur_l',
  'femur_r',
  'rib_cage',
  'skull',
  'brain',
  'aorta',
  'skin',
].filter((k) => ANATOMY_STRUCTURES.some((s) => s.key === k));

console.log('=== OPEN-ANATOMY-3D EXTRACTION SUMMARY ===');
console.log('Total anatomical structures:', ANATOMY_STRUCTURES.length);
console.log('Systems:', JSON.stringify(SYSTEM_LABELS));
console.log('Counts by system:', JSON.stringify(bySystem));
console.log('Categories:', JSON.stringify(CATEGORIES));
console.log('Verified sample node keys:', sampleKeys.join(', '));
console.log('ATTRIBUTION:', ATTRIBUTION);
