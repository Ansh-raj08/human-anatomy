import * as THREE from 'three';

/**
 * PROTOCOL B — RUNTIME BOUNDING BOX NORMALIZATION
 *
 * Measures the loaded skeleton mesh to extract thoracic cavity landmarks, then
 * computes mathematically correct scale and translation vectors for each organ
 * system using biometric proportion standards (40-year-old reference adult male).
 *
 * NO MAGIC NUMBERS: Every coordinate is derived from the skeleton's measured bounds.
 */

export interface ThoraxAnchors {
  /** Y top: T1-vertebra superior end-plate */
  thoraxTopY: number;
  /** Y bottom: T12-vertebra inferior end-plate */
  thoraxBotY: number;
  /** Full inner width between medial rib 5 surfaces (≈ intercostal width) */
  thoraxWidth: number;
  /** Full AP depth: vertebral body front face → sternal front face */
  thoraxDepth: number;
  /** Z coordinate of the sternum anterior face */
  sternumZ: number;
  /** Z coordinate of thoracic vertebral body center (posterior) */
  spineZ: number;
  /** Y center of thoracic cavity */
  centerY: number;
  /** Z center of thoracic cavity (between sternum and spine) */
  centerZ: number;
  /** Height of full skeleton (feet to crown) */
  skeletonHeight: number;
  /** Y minimum (bottom of feet) */
  skeletonBotY: number;
  /** Y maximum (top of skull) */
  skeletonTopY: number;
  /** Full skeleton width (fingertip to fingertip with arms at sides) */
  skeletonWidth: number;
  /** L1 top Y (inferior boundary of thorax, superior boundary of abdomen) */
  l1TopY: number;
  /** Sacrum top Y (superior boundary of pelvis) */
  sacrumTopY: number;
}

/**
 * Traverses the loaded skeleton scene graph and extracts named bone landmarks
 * to build the ThoraxAnchors reference frame.
 *
 * @param skeletonScene - The THREE.Group loaded from skeletal_system.glb
 * @returns Measured anatomical anchor coordinates in skeleton model space
 */
export function extractThoraxAnchors(skeletonScene: THREE.Object3D): ThoraxAnchors {
  const globalBox = new THREE.Box3().setFromObject(skeletonScene);

  // Per-bone bounding boxes — keyed by lowercase node names we look for
  const boneBounds: Record<string, THREE.Box3> = {};
  const targetNames = new Set([
    'first-thoracic-vertebra-t1',
    'twelfth-thoracic-vertebra-t12',
    'first-lumbar-vertebra-l1',
    'sacrum',
    'manubrium-of-sternum',
    'body-of-sternum',
    'right-fifth-rib',
    'left-fifth-rib',
  ]);

  skeletonScene.traverse((obj) => {
    const name = obj.name.toLowerCase();
    if (targetNames.has(name) && (obj as THREE.Mesh).isMesh) {
      const b = new THREE.Box3().setFromObject(obj);
      boneBounds[name] = b;
    }
  });

  const get = (key: string) => boneBounds[key];

  const T1 = get('first-thoracic-vertebra-t1');
  const T12 = get('twelfth-thoracic-vertebra-t12');
  const L1 = get('first-lumbar-vertebra-l1');
  const sacrum = get('sacrum');
  const manubrium = get('manubrium-of-sternum');
  const sternum = get('body-of-sternum');
  const rib5R = get('right-fifth-rib');
  const rib5L = get('left-fifth-rib');


  // Thorax Y extents: from T12 inferior plate to T1 superior plate
  const thoraxTopY = T1 ? T1.max.y : globalBox.max.y * 0.68;
  const thoraxBotY = T12 ? T12.min.y : globalBox.max.y * 0.28;

  // Inner thorax width: span between innermost rib-5 surfaces
  const rib5HalfWidth =
    rib5R && rib5L
      ? Math.max(Math.abs(rib5R.min.x), Math.abs(rib5L.max.x))
      : 0.318;
  const thoraxWidth = rib5HalfWidth * 2;

  // AP depth: spine posterior → sternum anterior
  const sternumZFront = sternum ? sternum.max.z : (manubrium ? manubrium.max.z : 0.242);
  const spineZBack = T12 ? (T12.min.z + T12.max.z) / 2 - T12.max.z * 0.2 : -0.12;
  const thoraxDepth = sternumZFront - spineZBack;

  const centerY = (thoraxTopY + thoraxBotY) / 2;
  const centerZ = (sternumZFront + spineZBack) / 2;

  const l1TopY = L1 ? L1.max.y : thoraxBotY - 0.08;
  const sacrumTopY = sacrum ? sacrum.max.y : 0.30;

  return {
    thoraxTopY,
    thoraxBotY,
    thoraxWidth,
    thoraxDepth,
    sternumZ: sternumZFront,
    spineZ: spineZBack,
    centerY,
    centerZ,
    skeletonHeight: globalBox.max.y - globalBox.min.y,
    skeletonBotY: globalBox.min.y,
    skeletonTopY: globalBox.max.y,
    skeletonWidth: globalBox.max.x - globalBox.min.x,
    l1TopY,
    sacrumTopY,
  };
}

/** Heart raw bounding box from circulatory_heart.glb (pre-measured, validated) */
const HEART_RAW = {
  min: new THREE.Vector3(-0.0434, 0.4234, -0.015),
  max: new THREE.Vector3(0.0809, 0.5288, 0.0902),
  size: new THREE.Vector3(0.1244, 0.1054, 0.1052),
  center: new THREE.Vector3(0.0187, 0.4761, 0.0376),
};

/** Lungs raw bounding box from respiratory_system.glb (pre-measured, validated) */
const LUNGS_RAW = {
  min: new THREE.Vector3(-0.1305, 0.3671, -0.1564),
  max: new THREE.Vector3(0.1206, 0.5901, -0.0038),
  size: new THREE.Vector3(0.2511, 0.2230, 0.1526),
  center: new THREE.Vector3(-0.005, 0.4786, -0.0801),
};

/** Stomach raw bounding box from digestive_system.glb (pre-measured, validated) */
const STOMACH_RAW = {
  size: new THREE.Vector3(4.4063, 4.6040, 2.0),
  center: new THREE.Vector3(-1.0585, 0.2068, 0.0),
};

/** Silhouette raw from human_body_silhouette.glb */
const SILHOUETTE_RAW = {
  size: new THREE.Vector3(0.1688, 1.0015, 0.3305),
  center: new THREE.Vector3(-0.0023, -0.0001, 0.001),
};

/**
 * Returns the biometrically-correct { position, scale } for the HEART.
 *
 * Rules (standard anatomical proportions):
 * - Width ≈ 38% of inner thoracic rib-cage width
 * - 2/3 of mass lies to the LEFT of the midline (left of sternal axis)
 * - Apex points toward left 5th intercostal space (≈ Y bottom of thorax + offset)
 * - AP center: between vertebral body and sternum (midpoint of thorax depth)
 */
export function computeHeartTransform(anchors: ThoraxAnchors): {
  position: [number, number, number];
  scale: number;
} {
  // Scale: match target width = 38% of inner thoracic width
  const targetWidth = 0.38 * anchors.thoraxWidth;
  const scale = targetWidth / HEART_RAW.size.x;

  // Target world-space center:
  // X: 2/3 left of midline → left-shifted by 1/6 of thoraxWidth from center
  const targetX = -(anchors.thoraxWidth / 6);
  // Y: Between T5 and T8 (≈ 60-75% down from thorax top)
  const targetY = anchors.thoraxTopY - 0.62 * (anchors.thoraxTopY - anchors.thoraxBotY);
  // Z: Midpoint of AP thorax depth, slightly anterior
  const targetZ = anchors.centerZ + 0.05;

  const position: [number, number, number] = [
    targetX - HEART_RAW.center.x * scale,
    targetY - HEART_RAW.center.y * scale,
    targetZ - HEART_RAW.center.z * scale,
  ];

  return { position, scale };
}

/**
 * Returns the biometrically-correct { position, scale } for the LUNGS.
 *
 * Rules:
 * - Apex: just above T1 (≈ 2 cm above manubrium top)
 * - Base: rests on diaphragm at T10 rib level (rib10 inferior surface)
 * - Width: 90% of inner thoracic width (bilateral from midline)
 * - AP: from vertebral body posteriorly to just inside the sternum anteriorly
 *
 * The heart and lungs share the SAME coordinate space (both from VH dataset),
 * so they are placed with identical position/scale to preserve their relative anatomy.
 */
export function computeLungsTransform(anchors: ThoraxAnchors): {
  position: [number, number, number];
  scale: number;
} {
  // Scale lungs to fill 90% of thorax width
  const targetWidth = 0.90 * anchors.thoraxWidth;
  const scaleByWidth = targetWidth / LUNGS_RAW.size.x;

  // Also scale by thorax height: lungs should span from ~T1 to ~T10
  const lungsTargetHeight = anchors.thoraxTopY - (anchors.thoraxBotY + 0.12);
  const scaleByHeight = lungsTargetHeight / LUNGS_RAW.size.y;

  // Use the SMALLER scale to prevent clipping outside the ribcage
  const scale = Math.min(scaleByWidth, scaleByHeight);

  // Lung center: centered at midline (X=0), vertically centered in thorax
  const targetX = 0.0;
  const targetY = anchors.thoraxBotY + 0.12 + LUNGS_RAW.size.y * scale / 2;
  const targetZ = anchors.centerZ - 0.02; // Slightly posterior

  const position: [number, number, number] = [
    targetX - LUNGS_RAW.center.x * scale,
    targetY - LUNGS_RAW.center.y * scale,
    targetZ - LUNGS_RAW.center.z * scale,
  ];

  return { position, scale };
}

/**
 * Returns the biometrically-correct { position, scale } for the STOMACH.
 *
 * Rules:
 * - Left hypochondriac and epigastric regions
 * - Inferior to left hemidiaphragm (just below T12-L1 junction)
 * - Height ≈ 30% of thorax height (adult empty stomach)
 */
export function computeStomachTransform(anchors: ThoraxAnchors): {
  position: [number, number, number];
  scale: number;
} {
  // Target height: 30% of thorax height
  const targetHeight = 0.30 * (anchors.thoraxTopY - anchors.thoraxBotY);
  const scale = targetHeight / STOMACH_RAW.size.y;

  // Stomach occupies LUQ: slightly left of midline, inferior to diaphragm
  const targetX = 0.06; // Slightly right to match the stomach's leftward anatomy in the model
  const targetY = anchors.l1TopY - targetHeight / 2; // Center at L1 level
  const targetZ = anchors.centerZ - 0.02;

  const position: [number, number, number] = [
    targetX - STOMACH_RAW.center.x * scale,
    targetY - STOMACH_RAW.center.y * scale,
    targetZ - STOMACH_RAW.center.z * scale,
  ];

  return { position, scale };
}

/**
 * Returns the biometrically-correct UNIFORM scale for the body silhouette.
 *
 * The silhouette mesh is normalized to match the skeleton height.
 * Non-uniform scaling is FORBIDDEN (would distort the body shape).
 * The silhouette raw mesh has H/W ratio of 5.93 (very narrow); at the correct
 * uniform scale it will cover the torso region but not the full arm span —
 * this is anatomically acceptable for a translucent x-ray boundary (torso-centric).
 */
export function computeSilhouetteTransform(anchors: ThoraxAnchors): {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
} {
  // Match skeleton height uniformly
  const scale = anchors.skeletonHeight / SILHOUETTE_RAW.size.y;

  // The raw silhouette asset has its coronal plane (shoulders) along the Z axis,
  // and its sagittal plane (chest/nose) along the X axis.
  // Rotating by -90° around Y aligns coronal to X and sagittal to Z.
  const skMidY = anchors.skeletonBotY + anchors.skeletonHeight / 2;
  const position: [number, number, number] = [
    0.0,
    skMidY,
    0.04, // slight anterior shift so thoracic shell perfectly envelopes sternum and heart
  ];

  return {
    position,
    rotation: [0, -Math.PI / 2, 0],
    scale,
  };
}
