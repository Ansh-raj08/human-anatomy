import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useAnatomy } from '../../interaction/AnatomyContext';
import { SelectableMesh } from '../SelectableMesh';

export const DigestiveModel: React.FC = () => {
  const { systemVisibility } = useAnatomy();

  if (!systemVisibility.digestive) return null;

  // J-shaped stomach
  const stomachGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.08, 1.45, 0.12),
      new THREE.Vector3(-0.18, 1.35, 0.16),
      new THREE.Vector3(-0.25, 1.15, 0.16),
      new THREE.Vector3(-0.16, 1.05, 0.14),
      new THREE.Vector3(-0.02, 1.12, 0.12),
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.09, 12, false);
  }, []);

  // Bi-lobed liver
  const liverGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.28, 16, 14);
    geo.scale(1.3, 0.8, 0.9);
    geo.rotateZ(-0.2);
    return geo;
  }, []);

  // Pancreas
  const pancreasGeo = useMemo(() => {
    const pipe = new THREE.CylinderGeometry(0.035, 0.045, 0.32, 10);
    pipe.rotateZ(Math.PI / 2.3);
    return pipe;
  }, []);

  // Intestines
  const intestineGeo = useMemo(() => {
    // Curled intestinal loops in lower abdomen
    const torus = new THREE.TorusGeometry(0.24, 0.08, 12, 20);
    torus.rotateX(Math.PI / 2.2);
    return torus;
  }, []);

  return (
    <group name="DigestiveSystem">
      {/* J-Shaped Stomach */}
      <SelectableMesh
        structureId="digest_stomach"
        geometry={stomachGeo}
        baseColor="#f59e0b"
        position={[0, 0, 0]}
      />

      {/* Liver */}
      <SelectableMesh
        structureId="digest_liver"
        geometry={liverGeo}
        baseColor="#b45309"
        position={[0.26, 1.35, 0.15]}
      />

      {/* Pancreas */}
      <SelectableMesh
        structureId="digest_pancreas"
        geometry={pancreasGeo}
        baseColor="#fbbf24"
        position={[-0.04, 1.12, 0.08]}
      />

      {/* Small & Large Intestines */}
      <SelectableMesh
        structureId="digest_intestines"
        geometry={intestineGeo}
        baseColor="#d97706"
        position={[0, 0.65, 0.12]}
      />
    </group>
  );
};
