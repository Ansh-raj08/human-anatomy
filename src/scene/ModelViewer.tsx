import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useAnatomy } from '../interaction/AnatomyContext';
import { useMission } from '../missions/MissionContext';
import {
  extractThoraxAnchors,
  computeHeartTransform,
  computeLungsTransform,
  computeStomachTransform,
  computeSilhouetteTransform,
  type ThoraxAnchors,
} from './AnatomicalNormalizer';
import { createSilhouetteMaterial } from './SilhouetteMaterial';

// ─── Preload all production GLB models ────────────────────────────────────────
useGLTF.preload('/models/human_body_silhouette.glb');
useGLTF.preload('/models/skeletal_system.glb');
useGLTF.preload('/models/circulatory_heart.glb');
useGLTF.preload('/models/respiratory_system.glb');
useGLTF.preload('/models/digestive_system.glb');

// ─── Anatomical ID resolver ────────────────────────────────────────────────────
function resolveStructureId(nodeName: string, system: string): string {
  const name = nodeName.toLowerCase();

  // Skeletal System
  if (name.includes('humerus')) return 'bone_humerus_r';
  if (name.includes('radius')) return 'bone_radius_r';
  if (name.includes('ulna')) return 'bone_ulna_r';
  if (name.includes('femur')) return 'bone_femur_r';
  if (name.includes('tibia') || name.includes('fibula')) return 'bone_tibia_r';
  if (
    name.includes('frontal') ||
    name.includes('parietal') ||
    name.includes('occipital') ||
    name.includes('mandible') ||
    name.includes('temporal') ||
    name.includes('sphenoid')
  ) return 'bone_skull';
  if (name.includes('vertebra') || name.includes('sacrum') || name.includes('coccyx'))
    return 'bone_spine';
  if (name.includes('rib') || name.includes('sternum') || name.includes('costal'))
    return 'bone_ribcage';
  if (
    name.includes('hip') ||
    name.includes('ilium') ||
    name.includes('pelvis') ||
    name.includes('pubis') ||
    name.includes('ischium')
  ) return 'bone_pelvis';

  // Cardiovascular System
  if (name.includes('tricuspid')) return 'circ_tricuspid_valve';
  if (name.includes('mitral') || name.includes('bicuspid')) return 'circ_mitral_valve';
  if (name.includes('pulmonary_valve')) return 'circ_pulmonary_valve';
  if (name.includes('aortic_valve')) return 'circ_aortic_valve';
  if (name.includes('right_cardiac_atrium') || name.includes('right_atrium'))
    return 'circ_right_atrium';
  if (name.includes('left_cardiac_atrium') || name.includes('left_atrium'))
    return 'circ_left_atrium';
  if (name.includes('right_ventricle')) return 'circ_right_ventricle';
  if (name.includes('left_ventricle')) return 'circ_left_ventricle';
  if (name.includes('aorta')) return 'circ_aorta';
  if (name.includes('vena_cava') || name.includes('cava')) return 'circ_svc_ivc';
  if (name.includes('pulmonary_artery') || name.includes('pulmonary_trunk'))
    return 'circ_pulmonary_artery';
  if (name.includes('pulmonary_vein')) return 'circ_pulmonary_veins';

  // Respiratory System
  if (name.includes('r_lung_upper') || name.includes('right_lung') || name.includes('r_lung'))
    return 'resp_right_lung';
  if (
    name.includes('l_lung') ||
    name.includes('left_lung') ||
    name.includes('cardiac_notch') ||
    name.includes('lingula')
  ) return 'resp_left_lung';
  if (name.includes('trachea') || name.includes('bronch') || name.includes('hilum'))
    return 'resp_trachea';

  // Digestive System
  if (name.includes('stomach') || name.includes('gaster')) return 'digest_stomach';
  if (name.includes('liver') || name.includes('hepar')) return 'digest_liver';
  if (name.includes('pancreas')) return 'digest_pancreas';
  if (name.includes('intestine') || name.includes('colon') || name.includes('duodenum'))
    return 'digest_intestines';

  // Fallbacks
  if (system === 'skeletal') return 'bone_spine';
  if (system === 'circulatory') return 'circ_right_atrium';
  if (system === 'respiratory') return 'resp_right_lung';
  if (system === 'digestive') return 'digest_stomach';
  return 'body_silhouette';
}

// ─── PBR material calibration constants ───────────────────────────────────────
const BONE_COLOR = new THREE.Color('#f3efe6');
const BONE_SELECTED = new THREE.Color('#38bdf8');
const BONE_HOVER = new THREE.Color('#a5f3fc');
const EMISSIVE_SELECT = new THREE.Color('#06b6d4');
const EMISSIVE_HOVER = new THREE.Color('#06b6d4');
const EMISSIVE_OFF = new THREE.Color('#000000');

type SystemId = 'skeletal' | 'circulatory' | 'respiratory' | 'digestive' | 'integumentary';

function getOrganBaseColor(system: SystemId, structId: string): THREE.Color {
  if (system === 'circulatory') {
    return new THREE.Color(
      structId.includes('left') || structId.includes('aorta') || structId.includes('mitral')
        ? '#dc2626'
        : '#2563eb'
    );
  }
  if (system === 'respiratory') return new THREE.Color('#06b6d4');
  return new THREE.Color('#f59e0b'); // digestive
}

// ─── Organ System Component (GLB-loaded, Protocol-B positioned) ───────────────
interface OrganSystemProps {
  modelPath: string;
  system: SystemId;
  position: [number, number, number];
  scale: number | [number, number, number];
  rotation?: [number, number, number];
}

const OrganSystem: React.FC<OrganSystemProps> = ({
  modelPath,
  system,
  position,
  scale,
  rotation = [0, 0, 0],
}) => {
  const { scene } = useGLTF(modelPath);
  const {
    systemVisibility,
    selectedStructureId,
    hoveredStructureId,
    selectStructure,
    setHoveredStructure,
    highContrast,
    clipping,
  } = useAnatomy();
  const { activeMissionId, handleStructureSelected } = useMission();

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  const clippingPlanes = useMemo(() => {
    if (!clipping.enabled) return [];
    let normal = new THREE.Vector3(0, 0, 1);
    if (clipping.axis === 'x') normal = new THREE.Vector3(1, 0, 0);
    if (clipping.axis === 'y') normal = new THREE.Vector3(0, 1, 0);
    if (clipping.negate) normal.negate();
    return [new THREE.Plane(normal, -clipping.position)];
  }, [clipping]);

  const isVisible = systemVisibility[system];
  if (!isVisible) return null;

  const hasActiveSelection = Boolean(selectedStructureId);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const structId = resolveStructureId(mesh.name || child.parent?.name || '', system);
      const isSelected = selectedStructureId === structId;
      const isHovered = hoveredStructureId === structId;
      const systemOpacity = hasActiveSelection && !isSelected ? 0.15 : 1.0;

      let mat = mesh.material as THREE.MeshStandardMaterial;
      if (!mat || !(mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
        mat = new THREE.MeshStandardMaterial();
        mesh.material = mat;
      }

      mat.clippingPlanes = clippingPlanes;
      mat.clipShadows = true;

      if (system === 'skeletal') {
        mat.color.copy(isSelected ? BONE_SELECTED : isHovered ? BONE_HOVER : BONE_COLOR);
        mat.roughness = 0.70;
        mat.metalness = 0.05;
        mat.transparent = systemOpacity < 1.0;
        mat.opacity = systemOpacity;
        mat.side = THREE.DoubleSide;
      } else {
        const baseColor = getOrganBaseColor(system, structId);
        mat.color.copy(isSelected ? BONE_SELECTED : isHovered ? BONE_HOVER : baseColor);
        mat.roughness = 0.28;
        mat.metalness = 0.05;
        mat.transparent = systemOpacity < 1.0;
        mat.opacity = systemOpacity;
        mat.side = THREE.DoubleSide;
      }

      mat.emissive.copy(
        isSelected
          ? highContrast ? new THREE.Color('#ffff00') : EMISSIVE_SELECT
          : isHovered
          ? EMISSIVE_HOVER
          : EMISSIVE_OFF
      );
      mat.emissiveIntensity = isSelected ? 0.7 : isHovered ? 0.4 : 0.0;
      mat.needsUpdate = true;
    });
  }, [clonedScene, system, selectedStructureId, hoveredStructureId, hasActiveSelection, highContrast, clippingPlanes]);

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    const meshName = e.object?.name || e.object?.parent?.name || '';
    setHoveredStructure(resolveStructureId(meshName, system));
    document.body.style.cursor = 'pointer';
  };
  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHoveredStructure(null);
    document.body.style.cursor = 'auto';
  };
  const handleClick = (e: any) => {
    e.stopPropagation();
    const meshName = e.object?.name || e.object?.parent?.name || '';
    const structId = resolveStructureId(meshName, system);
    activeMissionId ? handleStructureSelected(structId) : selectStructure(structId);
  };

  const scaleVec: [number, number, number] = Array.isArray(scale)
    ? (scale as [number, number, number])
    : [scale, scale, scale];

  return (
    <primitive
      object={clonedScene}
      position={position}
      rotation={rotation}
      scale={scaleVec}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    />
  );
};

// ─── Fresnel Silhouette Overlay ────────────────────────────────────────────────
interface SilhouetteProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale: number | [number, number, number];
  highContrast: boolean;
  visible: boolean;
  clippingPlanes: THREE.Plane[];
}

const FresnelSilhouette: React.FC<SilhouetteProps> = ({
  position,
  rotation = [0, -Math.PI / 2, 0],
  scale,
  highContrast,
  visible,
  clippingPlanes,
}) => {
  const { scene } = useGLTF('/models/human_body_silhouette.glb');
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const matRef = useRef<THREE.ShaderMaterial | null>(null);

  // Build Fresnel material
  const fresnelMat = useMemo(
    () => createSilhouetteMaterial(highContrast),
    [highContrast]
  );
  matRef.current = fresnelMat;

  // Apply Fresnel material to all meshes and add clipping planes
  useEffect(() => {
    fresnelMat.clippingPlanes = clippingPlanes;
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = fresnelMat;
        (child as THREE.Mesh).renderOrder = -1; // Render silhouette behind organs
      }
    });
  }, [clonedScene, fresnelMat, clippingPlanes]);

  if (!visible) return null;

  const scaleVec: [number, number, number] = Array.isArray(scale)
    ? scale
    : [scale, scale, scale];

  return (
    <primitive
      object={clonedScene}
      position={position}
      rotation={rotation}
      scale={scaleVec}
    />
  );
};

// ─── Skeleton Component with anchor extraction ────────────────────────────────
interface SkeletonProps {
  onAnchorsReady: (anchors: ThoraxAnchors) => void;
  position: [number, number, number];
  scale: [number, number, number];
  systemVisibility: Record<string, boolean>;
  selectedStructureId: string | null;
  hoveredStructureId: string | null;
  selectStructure: (id: string) => void;
  setHoveredStructure: (id: string | null) => void;
  highContrast: boolean;
  clippingPlanes: THREE.Plane[];
  activeMissionId: string | null;
  handleStructureSelected: (id: string) => void;
}

const SkeletonSystem: React.FC<SkeletonProps> = ({
  onAnchorsReady,
  position,
  scale,
  systemVisibility,
  selectedStructureId,
  hoveredStructureId,
  selectStructure,
  setHoveredStructure,
  highContrast,
  clippingPlanes,
  activeMissionId,
  handleStructureSelected,
}) => {
  const { scene } = useGLTF('/models/skeletal_system.glb');
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const anchorsExtracted = useRef(false);

  // Extract thorax anchors once after the skeleton is loaded
  useEffect(() => {
    if (!anchorsExtracted.current) {
      const anchors = extractThoraxAnchors(clonedScene);
      onAnchorsReady(anchors);
      anchorsExtracted.current = true;
    }
  }, [clonedScene, onAnchorsReady]);

  // Apply bone PBR materials
  useEffect(() => {
    const hasActiveSelection = Boolean(selectedStructureId);
    clonedScene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const structId = resolveStructureId(mesh.name || child.parent?.name || '', 'skeletal');
      const isSelected = selectedStructureId === structId;
      const isHovered = hoveredStructureId === structId;
      const systemOpacity = hasActiveSelection && !isSelected ? 0.15 : 1.0;

      let mat = mesh.material as THREE.MeshStandardMaterial;
      if (!mat || !mat.isMeshStandardMaterial) {
        mat = new THREE.MeshStandardMaterial();
        mesh.material = mat;
      }

      mat.clippingPlanes = clippingPlanes;
      mat.clipShadows = true;
      mat.color.copy(isSelected ? BONE_SELECTED : isHovered ? BONE_HOVER : BONE_COLOR);
      mat.roughness = 0.70;
      mat.metalness = 0.05;
      mat.transparent = systemOpacity < 1.0;
      mat.opacity = systemOpacity;
      mat.side = THREE.DoubleSide;
      mat.emissive.copy(
        isSelected
          ? highContrast ? new THREE.Color('#ffff00') : EMISSIVE_SELECT
          : isHovered ? EMISSIVE_HOVER : EMISSIVE_OFF
      );
      mat.emissiveIntensity = isSelected ? 0.7 : isHovered ? 0.4 : 0.0;
      mat.needsUpdate = true;
    });
  }, [clonedScene, selectedStructureId, hoveredStructureId, highContrast, clippingPlanes]);

  if (!systemVisibility['skeletal']) return null;

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    const meshName = e.object?.name || e.object?.parent?.name || '';
    setHoveredStructure(resolveStructureId(meshName, 'skeletal'));
    document.body.style.cursor = 'pointer';
  };
  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHoveredStructure(null);
    document.body.style.cursor = 'auto';
  };
  const handleClick = (e: any) => {
    e.stopPropagation();
    const meshName = e.object?.name || e.object?.parent?.name || '';
    const structId = resolveStructureId(meshName, 'skeletal');
    activeMissionId ? handleStructureSelected(structId) : selectStructure(structId);
  };

  return (
    <primitive
      object={clonedScene}
      position={position}
      scale={scale}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    />
  );
};

// ─── Main ModelViewer ──────────────────────────────────────────────────────────
/**
 * ModelViewer — Protocol B implementation.
 *
 * 1. Loads the skeleton first and extracts ThoraxAnchors via extractThoraxAnchors().
 * 2. Computes all organ transforms mathematically from those anchors.
 * 3. Renders the Fresnel silhouette with correct uniform scale.
 * 4. Zero hardcoded coordinates — all positions/scales are derived at runtime.
 */
export const ModelViewer: React.FC = () => {
  const [anchors, setAnchors] = useState<ThoraxAnchors | null>(null);
  const {
    systemVisibility,
    selectedStructureId,
    hoveredStructureId,
    selectStructure,
    setHoveredStructure,
    highContrast,
    clipping,
  } = useAnatomy();
  const { activeMissionId, handleStructureSelected } = useMission();

  const clippingPlanes = useMemo(() => {
    if (!clipping.enabled) return [];
    let normal = new THREE.Vector3(0, 0, 1);
    if (clipping.axis === 'x') normal = new THREE.Vector3(1, 0, 0);
    if (clipping.axis === 'y') normal = new THREE.Vector3(0, 1, 0);
    if (clipping.negate) normal.negate();
    return [new THREE.Plane(normal, -clipping.position)];
  }, [clipping]);

  // Compute all organ transforms once anchors are available
  const heartTransform = useMemo(
    () => (anchors ? computeHeartTransform(anchors) : null),
    [anchors]
  );
  const lungsTransform = useMemo(
    () => (anchors ? computeLungsTransform(anchors) : null),
    [anchors]
  );
  const stomachTransform = useMemo(
    () => (anchors ? computeStomachTransform(anchors) : null),
    [anchors]
  );
  const silhouetteTransform = useMemo(
    () => (anchors ? computeSilhouetteTransform(anchors) : null),
    [anchors]
  );

  // Group is offset so the skeleton pelvis (Y≈0) sits at world origin,
  // and the skull top (Y≈2.05) is clearly above camera. No extra Y offset needed.
  return (
    <group>
      {/* SKELETON — loaded first; triggers anchor extraction */}
      <SkeletonSystem
        onAnchorsReady={setAnchors}
        position={[0, 0, 0]}
        scale={[1, 1, 1]}
        systemVisibility={systemVisibility}
        selectedStructureId={selectedStructureId}
        hoveredStructureId={hoveredStructureId}
        selectStructure={selectStructure}
        setHoveredStructure={setHoveredStructure}
        highContrast={highContrast}
        clippingPlanes={clippingPlanes}
        activeMissionId={activeMissionId}
        handleStructureSelected={handleStructureSelected}
      />

      {/* ORGANS — rendered only after anchors are computed from skeleton */}
      {anchors && heartTransform && (
        <OrganSystem
          modelPath="/models/circulatory_heart.glb"
          system="circulatory"
          position={heartTransform.position}
          scale={heartTransform.scale}
        />
      )}

      {anchors && lungsTransform && (
        <OrganSystem
          modelPath="/models/respiratory_system.glb"
          system="respiratory"
          position={lungsTransform.position}
          scale={lungsTransform.scale}
        />
      )}

      {anchors && stomachTransform && (
        <OrganSystem
          modelPath="/models/digestive_system.glb"
          system="digestive"
          position={stomachTransform.position}
          scale={stomachTransform.scale}
        />
      )}

      {/* FRESNEL SILHOUETTE — rotated -90° to face front, uniform scale, Fresnel rim shader */}
      {anchors && silhouetteTransform && (
        <FresnelSilhouette
          position={silhouetteTransform.position}
          rotation={silhouetteTransform.rotation}
          scale={silhouetteTransform.scale}
          highContrast={highContrast}
          visible={systemVisibility['integumentary'] ?? true}
          clippingPlanes={clippingPlanes}
        />
      )}
    </group>
  );
};
