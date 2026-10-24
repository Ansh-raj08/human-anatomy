import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useAnatomy } from '../../interaction/AnatomyContext';
import { SelectableMesh } from '../SelectableMesh';

export const UrinaryModel: React.FC = () => {
  const { systemVisibility } = useAnatomy();

  if (!systemVisibility.urinary) return null;

  // Bean-shaped kidneys
  const kidneyGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.09, 14, 12);
    geo.scale(0.8, 1.4, 0.7);
    return geo;
  }, []);

  // Bilateral Ureters
  const ureterGeo = useMemo(() => {
    const tube = new THREE.CylinderGeometry(0.015, 0.015, 0.75, 8);
    return tube;
  }, []);

  // Urinary Bladder
  const bladderGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.12, 14, 12);
    geo.scale(1.1, 0.9, 1.0);
    return geo;
  }, []);

  return (
    <group name="UrinarySystem">
      {/* Right Kidney (sits slightly lower due to liver) */}
      <SelectableMesh
        structureId="urinary_kidneys"
        geometry={kidneyGeo}
        baseColor="#8b5cf6"
        position={[0.32, 1.0, -0.05]}
      />

      {/* Left Kidney */}
      <SelectableMesh
        structureId="urinary_kidneys"
        geometry={kidneyGeo}
        baseColor="#8b5cf6"
        position={[-0.32, 1.08, -0.05]}
      />

      {/* Right & Left Ureters */}
      <SelectableMesh
        structureId="urinary_ureters"
        geometry={ureterGeo}
        baseColor="#a78bfa"
        position={[0.22, 0.62, -0.02]}
        rotation={[0, 0, 0.12]}
      />
      <SelectableMesh
        structureId="urinary_ureters"
        geometry={ureterGeo}
        baseColor="#a78bfa"
        position={[-0.22, 0.62, -0.02]}
        rotation={[0, 0, -0.12]}
      />

      {/* Urinary Bladder */}
      <SelectableMesh
        structureId="urinary_bladder"
        geometry={bladderGeo}
        baseColor="#7c3aed"
        position={[0, 0.12, 0.08]}
      />
    </group>
  );
};
