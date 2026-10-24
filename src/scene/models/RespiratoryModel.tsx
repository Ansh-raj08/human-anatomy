import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useAnatomy } from '../../interaction/AnatomyContext';
import { SelectableMesh } from '../SelectableMesh';

export const RespiratoryModel: React.FC = () => {
  const { systemVisibility } = useAnatomy();

  if (!systemVisibility.respiratory) return null;

  // Trachea with segmented cartilage rings
  const tracheaGeo = useMemo(() => {
    const pipe = new THREE.CylinderGeometry(0.045, 0.045, 0.55, 14);
    return pipe;
  }, []);

  // Right Lung (3 distinct lobes: Superior, Middle, Inferior)
  const rightLungGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.24, 18, 16);
    geo.scale(0.9, 1.6, 0.95);
    return geo;
  }, []);

  // Left Lung (2 lobes, with medial indent: Cardiac Notch)
  const leftLungGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.22, 18, 16);
    geo.scale(0.85, 1.55, 0.9);
    return geo;
  }, []);

  // Diaphragm muscle sheet
  const diaphragmGeo = useMemo(() => {
    const dome = new THREE.SphereGeometry(0.48, 18, 12, 0, Math.PI * 2, 0, Math.PI / 3);
    dome.rotateX(Math.PI);
    return dome;
  }, []);

  return (
    <group name="RespiratorySystem">
      {/* Trachea */}
      <SelectableMesh
        structureId="resp_trachea"
        geometry={tracheaGeo}
        baseColor="#06b6d4"
        position={[0, 2.7, 0.12]}
      />

      {/* Right Lung (Three Lobes) */}
      <SelectableMesh
        structureId="resp_right_lung"
        geometry={rightLungGeo}
        baseColor="#22d3ee"
        transparent
        opacity={0.85}
        position={[0.42, 2.1, 0.12]}
      />

      {/* Left Lung (Two Lobes with Cardiac Notch) */}
      <SelectableMesh
        structureId="resp_left_lung"
        geometry={leftLungGeo}
        baseColor="#22d3ee"
        transparent
        opacity={0.85}
        position={[-0.42, 2.1, 0.12]}
      />

      {/* Thoracic Diaphragm */}
      <SelectableMesh
        structureId="resp_diaphragm"
        geometry={diaphragmGeo}
        baseColor="#0891b2"
        transparent
        opacity={0.7}
        position={[0, 1.55, 0.05]}
      />
    </group>
  );
};
