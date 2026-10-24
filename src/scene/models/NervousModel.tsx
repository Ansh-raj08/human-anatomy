import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useAnatomy } from '../../interaction/AnatomyContext';
import { SelectableMesh } from '../SelectableMesh';

export const NervousModel: React.FC = () => {
  const { systemVisibility } = useAnatomy();

  if (!systemVisibility.nervous) return null;

  // Cerebrum (Cerebral Hemispheres)
  const cerebrumGeo = useMemo(() => {
    const dome = new THREE.SphereGeometry(0.24, 18, 16);
    dome.scale(1.15, 1.0, 1.25);
    return dome;
  }, []);

  // Cerebellum (Posterior-inferior brain)
  const cerebellumGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.12, 14, 12);
    geo.scale(1.3, 0.8, 1.0);
    return geo;
  }, []);

  // Brainstem (Pons and Medulla)
  const stemGeo = useMemo(() => {
    const stem = new THREE.CylinderGeometry(0.045, 0.05, 0.35, 12);
    return stem;
  }, []);

  return (
    <group name="NervousSystem">
      {/* Cerebrum */}
      <SelectableMesh
        structureId="brain_cerebrum"
        geometry={cerebrumGeo}
        baseColor="#ec4899"
        position={[0, 3.88, 0.02]}
      />

      {/* Cerebellum */}
      <SelectableMesh
        structureId="brain_cerebellum"
        geometry={cerebellumGeo}
        baseColor="#db2777"
        position={[0, 3.65, -0.15]}
      />

      {/* Brainstem */}
      <SelectableMesh
        structureId="brain_stem"
        geometry={stemGeo}
        baseColor="#f472b6"
        position={[0, 3.48, -0.04]}
      />
    </group>
  );
};
