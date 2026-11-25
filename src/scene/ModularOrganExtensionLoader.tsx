import React, { useEffect, useState } from 'react';
import { type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {
  OPTIONAL_EXTENSION_MODELS,
  type OptionalExtensionModelSpec,
} from '../anatomy/anatomyRegistry';
import { useAnatomy } from '../interaction/AnatomyContext';

interface LoadedExtensionScene {
  spec: OptionalExtensionModelSpec;
  scene: THREE.Group;
  materials: THREE.MeshStandardMaterial[];
  geometries: THREE.BufferGeometry[];
  meshKeys: Record<string, string>;
}

interface ModularOrganExtensionLoaderProps {
  skinBoxRef: React.MutableRefObject<THREE.Box3 | null>;
  structureCentersRef: React.MutableRefObject<Record<string, THREE.Vector3>>;
  extensionMeshesRef: React.MutableRefObject<THREE.Mesh[]>;
}

const GLB_MAGIC = 0x46546c67; // "glTF" little-endian

/**
 * Probes an optional drop-in `.glb` asset cleanly without triggering Vite HTML fallback parse errors.
 */
async function probeValidGlb(url: string, signal: AbortSignal): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) return null;

    const buf = await res.arrayBuffer();
    if (buf.byteLength < 12) return null;
    const magic = new DataView(buf).getUint32(0, true);
    if (magic !== GLB_MAGIC) return null;
    return buf;
  } catch {
    return null;
  }
}

export const ModularOrganExtensionLoader: React.FC<ModularOrganExtensionLoaderProps> = ({
  skinBoxRef,
  structureCentersRef,
  extensionMeshesRef,
}) => {
  const {
    visibleLayers,
    selectedKey,
    hoveredKey,
    selectStructure,
    setHoveredStructure,
    setExtensionStatus,
  } = useAnatomy();

  const [loadedExtensions, setLoadedExtensions] = useState<LoadedExtensionScene[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.setMeshoptDecoder(MeshoptDecoder);

    const mounted: LoadedExtensionScene[] = [];

    async function loadAllExtensions() {
      await MeshoptDecoder.ready;

      for (const spec of OPTIONAL_EXTENSION_MODELS) {
        if (controller.signal.aborted) break;
        setExtensionStatus(spec.id, { status: 'checking' });

        const buf = await probeValidGlb(spec.url, controller.signal);
        if (!buf) {
          if (!disposed) {
            setExtensionStatus(spec.id, {
              status: 'pending',
              boxSummary: `Asset pending: drop ${spec.filename} into public/models/`,
            });
          }
          continue;
        }

        try {
          const gltf = await loader.parseAsync(buf, '');
          if (disposed) break;

          const scene = gltf.scene;
          scene.scale.set(1, 1, 1);
          scene.position.set(0, 0, 0);
          scene.rotation.set(0, 0, 0);
          scene.updateMatrixWorld(true);

          const materials: THREE.MeshStandardMaterial[] = [];
          const geometries: THREE.BufferGeometry[] = [];
          const meshKeys: Record<string, string> = {};
          const meshBox = new THREE.Box3();
          let meshCount = 0;

          scene.traverse((node) => {
            if (!(node as THREE.Mesh).isMesh) return;
            const mesh = node as THREE.Mesh;
            meshCount += 1;

            const srcMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
            const clonedMat =
              srcMat && (srcMat as THREE.MeshStandardMaterial).isMeshStandardMaterial
                ? (srcMat.clone() as THREE.MeshStandardMaterial)
                : new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.45 });

            mesh.material = clonedMat;
            mesh.userData.baseColor = clonedMat.color.clone();
            mesh.userData.structKey = mesh.name || `${spec.id}_${meshCount}`;
            meshKeys[mesh.uuid] = mesh.userData.structKey;

            materials.push(clonedMat);
            if (mesh.geometry) geometries.push(mesh.geometry);

            meshBox.setFromObject(mesh);
            if (!meshBox.isEmpty()) {
              structureCentersRef.current[mesh.userData.structKey] = meshBox.getCenter(new THREE.Vector3());
            }
          });

          const extBox = new THREE.Box3().setFromObject(scene);
          const skinBox = skinBoxRef.current;
          const withinSkin = skinBox ? skinBox.containsBox(extBox) : true;
          const fmt = (v: THREE.Vector3) =>
            `[${v.x.toFixed(3)}, ${v.y.toFixed(3)}, ${v.z.toFixed(3)}]`;
          const boxSummary = `min=${fmt(extBox.min)} max=${fmt(extBox.max)} scale=[1,1,1]`;

          console.info(
            `[Gate 2 Extension · ${spec.filename}] Loaded ${meshCount} meshes | ${boxSummary} | withinSkin=${withinSkin}`
          );

          mounted.push({ spec, scene, materials, geometries, meshKeys });
          setExtensionStatus(spec.id, {
            status: 'loaded',
            meshCount,
            withinSkin,
            boxSummary,
          });
        } catch (err) {
          console.warn(`[Extension Loader] Failed to parse ${spec.filename}:`, err);
          if (!disposed) {
            setExtensionStatus(spec.id, { status: 'error' });
          }
        }
      }

      if (!disposed) {
        setLoadedExtensions([...mounted]);
        const meshes: THREE.Mesh[] = [];
        for (const ext of mounted) {
          ext.scene.traverse((n) => {
            if ((n as THREE.Mesh).isMesh) meshes.push(n as THREE.Mesh);
          });
        }
        extensionMeshesRef.current = meshes;
      }
    }

    void loadAllExtensions();

    return () => {
      disposed = true;
      controller.abort();
      dracoLoader.dispose();
      extensionMeshesRef.current = [];
      for (const ext of mounted) {
        ext.materials.forEach((m) => m.dispose());
        ext.geometries.forEach((g) => g.dispose());
      }
    };
  }, [skinBoxRef, structureCentersRef, extensionMeshesRef, setExtensionStatus]);

  // Apply visibility & selection highlights on loaded extension meshes
  useEffect(() => {
    for (const ext of loadedExtensions) {
      const visible = visibleLayers[ext.spec.layer] ?? true;
      ext.scene.visible = visible;

      ext.scene.traverse((node) => {
        if (!(node as THREE.Mesh).isMesh) return;
        const mesh = node as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const key = mesh.userData.structKey as string;
        const baseColor = (mesh.userData.baseColor as THREE.Color) ?? new THREE.Color('#cbd5e1');

        if (selectedKey === key) {
          mat.color.copy(baseColor).lerp(new THREE.Color('#38bdf8'), 0.45);
          mat.emissive.set('#0ea5e9');
          mat.emissiveIntensity = 0.55;
        } else if (hoveredKey === key) {
          mat.color.copy(baseColor).lerp(new THREE.Color('#7dd3fc'), 0.35);
          mat.emissive.set('#0284c7');
          mat.emissiveIntensity = 0.35;
        } else {
          mat.color.copy(baseColor);
          mat.emissive.set('#000000');
          mat.emissiveIntensity = 0.0;
        }
      });
    }
  }, [loadedExtensions, visibleLayers, selectedKey, hoveredKey]);

  return (
    <group name="ModularOrganExtensions">
      {loadedExtensions.map((ext) => (
        <primitive
          key={ext.spec.id}
          object={ext.scene}
          scale={[1, 1, 1]}
          position={[0, 0, 0]}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            const k = e.object?.userData?.structKey as string | undefined;
            if (k) {
              setHoveredStructure(k);
              document.body.style.cursor = 'pointer';
            }
          }}
          onPointerOut={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            setHoveredStructure(null);
            document.body.style.cursor = 'auto';
          }}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            const k = e.object?.userData?.structKey as string | undefined;
            if (k) selectStructure(k, false);
          }}
        />
      ))}
    </group>
  );
};
