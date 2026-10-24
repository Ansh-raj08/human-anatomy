#!/usr/bin/env node
/**
 * Automated Anatomical Model Downloader
 * Downloads verified open-source (CC0 / CC-BY) GLB anatomical models
 * into public/models/ for production rendering with React Three Fiber useGLTF.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TARGET_DIR = path.resolve(__dirname, '../public/models');

const MODELS_CONFIG = [
  {
    filename: 'human_body_silhouette.glb',
    title: 'Translucent Reference Human Body Silhouette',
    source: 'NIH 3D / BhagyeshSave Medical Anatomical Boundary (CC0 / Open Source)',
    url: 'https://raw.githubusercontent.com/bhagyeshsave/human-3d-body/main/client/public/geometries/human_body.glb',
  },
  {
    filename: 'skeletal_system.glb',
    title: 'Full Articulated Human Skeleton (Skull, Spine, Thorax, Pelvis, Limbs)',
    source: 'BodyParts3D / OrganUI Anatomical Skeleton (CC BY-SA 2.1 JP)',
    url: 'https://raw.githubusercontent.com/organui/skeleton-3d/main/public/models/skeleton.glb',
  },
  {
    filename: 'circulatory_heart.glb',
    title: 'Human Heart with 4 Chambers & Great Vessels',
    source: 'NIH 3D Print Exchange (3DPX-021000) / Code4Fukui (CC BY 4.0)',
    url: 'https://code4fukui.github.io/human_organs/glb/VH_M_Heart.glb',
  },
  {
    filename: 'respiratory_system.glb',
    title: 'Respiratory Lungs with Bronchial Tree',
    source: 'NIH 3D Print Exchange (3DPX-021008) / Code4Fukui (CC BY 4.0)',
    url: 'https://code4fukui.github.io/human_organs/glb/3d-vh-f-lung.glb',
  },
  {
    filename: 'digestive_system.glb',
    title: 'Visceral Digestive Tract & Stomach',
    source: 'NIH 3D Print Exchange (3DPX-021124) / Code4Fukui (CC BY 4.0)',
    url: 'https://code4fukui.github.io/human_organs/glb/realistic_stomach.glb',
  },
];

async function downloadFile(url, destPath) {
  console.log(`📡 Fetching from: ${url}`);
  const response = await fetch(url, {
    headers: { 'User-Agent': 'InsideHumanBody-AnatomyEngine/2.0' },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Validate GLB binary magic number (0x46546C67 = "glTF")
  if (buffer.length < 12) {
    throw new Error('Downloaded file is too small to be a valid GLB container.');
  }

  const magic = buffer.readUInt32LE(0);
  if (magic !== 0x46546c67) {
    throw new Error(`Invalid GLB header magic: 0x${magic.toString(16)} (expected 0x46546c67 'glTF')`);
  }

  fs.writeFileSync(destPath, buffer);
  const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
  console.log(`✅ Saved ${path.basename(destPath)} (${sizeMB} MB)`);
}

async function main() {
  console.log('=====================================================');
  console.log(' 🔬 Inside the Human Body — Anatomical Asset Fetcher');
  console.log('=====================================================');

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
    console.log(`📁 Created directory: ${TARGET_DIR}`);
  }

  let successCount = 0;

  for (const model of MODELS_CONFIG) {
    const destPath = path.join(TARGET_DIR, model.filename);
    console.log(`\n⏳ [${model.filename}] ${model.title}`);
    console.log(`   Source: ${model.source}`);

    // If file already exists and is non-empty with valid GLB header, skip or re-verify
    if (fs.existsSync(destPath)) {
      try {
        const existing = fs.readFileSync(destPath);
        if (existing.length > 1024 && existing.readUInt32LE(0) === 0x46546c67) {
          const sizeMB = (existing.length / (1024 * 1024)).toFixed(2);
          console.log(`   ⚡ Already exists and verified valid GLB (${sizeMB} MB). Skipping download.`);
          successCount++;
          continue;
        }
      } catch (err) {
        console.warn('   Existing file unreadable, redownloading...');
      }
    }

    try {
      await downloadFile(model.url, destPath);
      successCount++;
    } catch (err) {
      console.error(`   ❌ Download failed for ${model.filename}: ${err.message}`);
    }
  }

  console.log('\n=====================================================');
  console.log(`🎉 Finished downloading anatomical assets (${successCount}/${MODELS_CONFIG.length} verified)`);
  console.log('=====================================================');
}

main().catch((err) => {
  console.error('Fatal downloader error:', err);
  process.exit(1);
});
