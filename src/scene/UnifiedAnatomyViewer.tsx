import React, { useMemo, useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { ANATOMY_BY_KEY, COURSE_CHAPTERS } from '../data/curriculum';
import {
  classifyAnatomicalMesh,
  type MuscleBifurcationGroup,
  type VascularSubtype,
} from '../utils/anatomyClassifier';
import { useAnatomy, type PinProjection } from '../interaction/AnatomyContext';
import { createSilhouetteMaterial } from './SilhouetteMaterial';

void MeshoptDecoder.ready;

const configureMeshopt = (loader: { setMeshoptDecoder?: (decoder: unknown) => void }) => {
  if (typeof loader.setMeshoptDecoder === 'function') {
    loader.setMeshoptDecoder(MeshoptDecoder);
  }
};

useGLTF.preload('/models/anatomy-male.glb', false, false, configureMeshopt);
useGLTF.preload('/models/anatomy-female.glb', false, false, configureMeshopt);

interface MeshRecord {
  mesh: THREE.Mesh;
  key: string;
  system: string;
  vascularSubtype: VascularSubtype;
  muscleGroup: MuscleBifurcationGroup | null;
  baseColor: THREE.Color;
  baseRoughness: number;
  baseMetalness: number;
  baseClearcoat: number;
  baseOpacity: number;
  baseTransparent: boolean;
  clonedMaterial: THREE.MeshPhysicalMaterial;
}

export interface UnifiedAnatomyViewerProps {
  structureCentersRef: React.MutableRefObject<Record<string, THREE.Vector3>>;
  skinBoxRef: React.MutableRefObject<THREE.Box3 | null>;
  interactiveMeshesRef: React.MutableRefObject<THREE.Mesh[]>;
  onPinsFrame: (projections: Record<string, PinProjection>) => void;
}

const HOVER_EMISSIVE = new THREE.Color('#0284c7');
const SELECT_EMISSIVE = new THREE.Color('#0ea5e9');
const ZERO_COLOR = new THREE.Color('#000000');

export const UnifiedAnatomyViewer: React.FC<UnifiedAnatomyViewerProps> = ({
  structureCentersRef,
  skinBoxRef,
  interactiveMeshesRef,
  onPinsFrame,
}) => {
  const { camera, size } = useThree();
  const {
    sex,
    selectedKey,
    hoveredKey,
    selectStructure,
    setHoveredStructure,
    visibleLayers,
    muscleGroupVisibility,
    xrayMode,
    showPins,
    activeChapterId,
  } = useAnatomy();

  const modelPath = sex === 'female' ? '/models/anatomy-female.glb' : '/models/anatomy-male.glb';
  const gltf = useGLTF(modelPath, false, false, configureMeshopt);

  const skinMaterial = useMemo(() => createSilhouetteMaterial(xrayMode), [xrayMode]);

  const { clonedScene, meshRecords, boundingCenters, skinBox } = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.scale.set(1, 1, 1);
    clone.position.set(0, 0, 0);
    clone.rotation.set(0, 0, 0);
    clone.updateMatrixWorld(true);

    const records: MeshRecord[] = [];
    const centers: Record<string, THREE.Vector3> = {};
    const box = new THREE.Box3();

    clone.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const mesh = node as THREE.Mesh;
      const srcMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const srcColorHex =
        srcMat && (srcMat as THREE.MeshStandardMaterial).color
          ? `#${(srcMat as THREE.MeshStandardMaterial).color.getHexString()}`
          : '#cbd5e1';

      const info = classifyAnatomicalMesh(mesh, srcColorHex);

      // Clone per-mesh MeshPhysicalMaterial so arteries/veins/muscles/bones never share mutable state
      const clonedMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(info.pbrColor),
        roughness: info.roughness,
        metalness: info.metalness,
        clearcoat: info.clearcoat,
        clearcoatRoughness: 0.35,
      });

      if (info.system !== 'skin') {
        mesh.material = clonedMat;
      }
      mesh.userData.structKey = info.key;
      mesh.userData.system = info.system;
      mesh.userData.vascularSubtype = info.vascularSubtype;
      mesh.userData.muscleGroup = info.muscleGroup;

      box.setFromObject(mesh);
      if (!box.isEmpty()) {
        centers[info.key] = box.getCenter(new THREE.Vector3());
      }

      records.push({
        mesh,
        key: info.key,
        system: info.system,
        vascularSubtype: info.vascularSubtype,
        muscleGroup: info.muscleGroup,
        baseColor: new THREE.Color(info.pbrColor),
        baseRoughness: info.roughness,
        baseMetalness: info.metalness,
        baseClearcoat: info.clearcoat,
        baseOpacity: 1.0,
        baseTransparent: false,
        clonedMaterial: clonedMat,
      });
    });

    const skinObj = clone.getObjectByName('skin');
    const sBox = skinObj ? new THREE.Box3().setFromObject(skinObj) : new THREE.Box3();

    return {
      clonedScene: clone,
      meshRecords: records,
      boundingCenters: centers,
      skinBox: sBox,
    };
  }, [gltf.scene]);

  useEffect(() => {
    structureCentersRef.current = {
      ...structureCentersRef.current,
      ...boundingCenters,
    };
    skinBoxRef.current = skinBox;
    interactiveMeshesRef.current = meshRecords
      .filter((r) => r.system !== 'skin')
      .map((r) => r.mesh);
  }, [boundingCenters, skinBox, meshRecords, structureCentersRef, skinBoxRef, interactiveMeshesRef]);

  useEffect(() => {
    return () => {
      skinMaterial.dispose();
    };
  }, [skinMaterial]);

  useEffect(() => {
    return () => {
      for (const rec of meshRecords) {
        rec.clonedMaterial.dispose();
        rec.mesh.geometry?.dispose();
      }
    };
  }, [meshRecords]);

  // Gate 1 startup audit log: verifies Left & Right Femurs + Artery/Vein + Muscle counts
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const femurL = meshRecords.find((r) => r.key === 'femur_l');
    const femurR = meshRecords.find((r) => r.key === 'femur_r');
    const arteries = meshRecords.filter((r) => r.vascularSubtype === 'artery').length;
    const veins = meshRecords.filter((r) => r.vascularSubtype === 'vein').length;
    const muscleCounts = {
      axial_head_neck: meshRecords.filter((r) => r.muscleGroup === 'axial_head_neck').length,
      thoracic_abdominal: meshRecords.filter((r) => r.muscleGroup === 'thoracic_abdominal').length,
      upper_limb: meshRecords.filter((r) => r.muscleGroup === 'upper_limb').length,
      lower_limb: meshRecords.filter((r) => r.muscleGroup === 'lower_limb').length,
      cardiac_visceral: meshRecords.filter((r) => r.muscleGroup === 'cardiac_visceral').length,
    };
    console.info(
      `[Gate 1 Audit · ${sex}] femur_l=${femurL?.system}, femur_r=${femurR?.system}, arteries=${arteries}, veins=${veins}, muscles=${JSON.stringify(muscleCounts)}`
    );
  }, [meshRecords, sex]);

  // Apply strict per-layer visibility (fixing Left Femur persistence) and X-Ray PBR styling
  useEffect(() => {
    for (const rec of meshRecords) {
      if (rec.system === 'skin') {
        rec.mesh.visible = visibleLayers.skin;
        rec.mesh.material = skinMaterial;
        rec.mesh.renderOrder = 2;
        continue;
      }

      let visible = false;
      if (rec.system === 'skeleton') {
        // Strict: 100% of skeleton bones (including femur_l & femur_r) honor visibleLayers.skeleton
        visible = visibleLayers.skeleton;
      } else if (rec.system === 'vessels') {
        visible = rec.vascularSubtype === 'vein' ? visibleLayers.veins : visibleLayers.arteries;
      } else if (rec.system === 'muscles') {
        visible =
          visibleLayers.muscles &&
          (rec.muscleGroup ? muscleGroupVisibility[rec.muscleGroup] : true);
      } else if (rec.system === 'nerves') {
        visible = visibleLayers.nerves;
      } else {
        // Organs (including cardiac/visceral smooth muscle sub-filter)
        visible =
          visibleLayers.organs &&
          (rec.muscleGroup === 'cardiac_visceral'
            ? muscleGroupVisibility.cardiac_visceral
            : true);
      }

      rec.mesh.visible = visible;
      rec.mesh.material = rec.clonedMaterial;

      const isSelected = selectedKey === rec.key;
      const isHovered = hoveredKey === rec.key;
      const mat = rec.clonedMaterial;

      if (isSelected) {
        mat.color.copy(rec.baseColor).lerp(new THREE.Color('#38bdf8'), 0.42);
        mat.emissive.copy(SELECT_EMISSIVE);
        mat.emissiveIntensity = 0.55;
        mat.transparent = false;
        mat.opacity = 1.0;
        mat.depthWrite = true;
      } else if (isHovered) {
        mat.color.copy(rec.baseColor).lerp(new THREE.Color('#7dd3fc'), 0.3);
        mat.emissive.copy(HOVER_EMISSIVE);
        mat.emissiveIntensity = 0.35;
        mat.transparent = rec.baseTransparent;
        mat.opacity = rec.baseOpacity;
        mat.depthWrite = true;
      } else {
        mat.color.copy(rec.baseColor);
        mat.emissive.copy(ZERO_COLOR);
        mat.emissiveIntensity = 0.0;

        const dimOuter =
          xrayMode &&
          selectedKey &&
          ANATOMY_BY_KEY[selectedKey]?.system !== 'skeleton' &&
          ANATOMY_BY_KEY[selectedKey]?.system !== 'muscles' &&
          (rec.system === 'skeleton' || rec.system === 'muscles');

        if (dimOuter) {
          mat.transparent = true;
          mat.opacity = rec.system === 'skeleton' ? 0.28 : 0.14;
          mat.depthWrite = false;
        } else {
          mat.transparent = rec.baseTransparent;
          mat.opacity = rec.baseOpacity;
          mat.depthWrite = !rec.baseTransparent;
        }
      }

      mat.needsUpdate = true;
    }
  }, [
    meshRecords,
    visibleLayers,
    muscleGroupVisibility,
    selectedKey,
    hoveredKey,
    xrayMode,
    skinMaterial,
  ]);

  // Project active chapter & selected Box3 centers into 2D viewport space
  const tempVec = useRef(new THREE.Vector3());
  const pinnedKeys = useMemo(() => {
    const ch = COURSE_CHAPTERS.find((c) => c.id === activeChapterId);
    const set = new Set<string>(ch ? ch.structureKeys.slice(0, 5) : ['heart', 'aorta']);
    if (selectedKey) set.add(selectedKey);
    return Array.from(set);
  }, [activeChapterId, selectedKey]);

  useFrame(() => {
    if (!showPins) {
      onPinsFrame({});
      return;
    }

    const next: Record<string, PinProjection> = {};
    const allCenters = structureCentersRef.current;

    for (const key of pinnedKeys) {
      const center = allCenters[key];
      if (!center) continue;
      const struct = ANATOMY_BY_KEY[key];

      tempVec.current.copy(center).project(camera);
      const inFront = tempVec.current.z >= -1 && tempVec.current.z <= 1;
      const x = (tempVec.current.x * 0.5 + 0.5) * size.width;
      const y = (-tempVec.current.y * 0.5 + 0.5) * size.height;

      next[key] = {
        key,
        label: struct?.label ?? key,
        color: struct?.color ?? '#38bdf8',
        x,
        y,
        visible: inFront && x >= 16 && x <= size.width - 16 && y >= 16 && y <= size.height - 16,
      };
    }

    onPinsFrame(next);
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    const key = e.object?.userData?.structKey as string | undefined;
    if (!key || e.object?.userData?.system === 'skin') return;
    e.stopPropagation();
    setHoveredStructure(key);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    const key = e.object?.userData?.structKey as string | undefined;
    if (!key || e.object?.userData?.system === 'skin') return;
    e.stopPropagation();
    setHoveredStructure(null);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    const key = e.object?.userData?.structKey as string | undefined;
    if (!key || e.object?.userData?.system === 'skin') return;
    e.stopPropagation();
    selectStructure(key, false);
  };

  return (
    <primitive
      object={clonedScene}
      scale={[1, 1, 1]}
      position={[0, 0, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    />
  );
};
