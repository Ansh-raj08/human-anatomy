import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useAnatomy } from '../../interaction/AnatomyContext';

export const BodySilhouetteModel: React.FC = () => {
  const { systemVisibility, selectedStructureId, selectStructure } = useAnatomy();

  // If integumentary system is disabled, do not render
  if (!systemVisibility.integumentary) return null;

  const isSelected = selectedStructureId === 'body_silhouette';

  // Head, Neck, Torso, Limbs parametric composite geometries
  const headGeo = useMemo(() => new THREE.SphereGeometry(0.38, 24, 20), []);
  const neckGeo = useMemo(() => new THREE.CylinderGeometry(0.18, 0.22, 0.35, 18), []);
  const thoraxGeo = useMemo(() => new THREE.CylinderGeometry(0.55, 0.48, 1.4, 22), []);
  const abdomenGeo = useMemo(() => new THREE.CylinderGeometry(0.48, 0.52, 1.1, 22), []);
  const armGeo = useMemo(() => new THREE.CylinderGeometry(0.14, 0.11, 1.9, 16), []);
  const legGeo = useMemo(() => new THREE.CylinderGeometry(0.19, 0.13, 2.7, 18), []);

  const handleClick = (e: { stopPropagation: () => void }) => {
    // Allows selecting silhouette if clicked directly on unoccupied background area
    e.stopPropagation();
    selectStructure('body_silhouette');
  };

  return (
    <group onClick={handleClick}>
      {/* Head */}
      <mesh geometry={headGeo} position={[0, 3.8, 0]}>
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.8}
          transparent
          opacity={isSelected ? 0.35 : 0.08}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Neck */}
      <mesh geometry={neckGeo} position={[0, 3.25, 0]}>
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.8}
          transparent
          opacity={isSelected ? 0.35 : 0.08}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Thorax / Chest */}
      <mesh geometry={thoraxGeo} position={[0, 2.3, 0]}>
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.8}
          transparent
          opacity={isSelected ? 0.35 : 0.08}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Abdomen & Pelvis */}
      <mesh geometry={abdomenGeo} position={[0, 1.0, 0]}>
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.8}
          transparent
          opacity={isSelected ? 0.35 : 0.08}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Left & Right Arms */}
      <mesh geometry={armGeo} position={[-1.25, 1.7, 0]} rotation={[0, 0, -0.08]}>
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.8}
          transparent
          opacity={isSelected ? 0.35 : 0.07}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={armGeo} position={[1.25, 1.7, 0]} rotation={[0, 0, 0.08]}>
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.8}
          transparent
          opacity={isSelected ? 0.35 : 0.07}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Left & Right Legs */}
      <mesh geometry={legGeo} position={[-0.45, -1.5, 0]}>
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.8}
          transparent
          opacity={isSelected ? 0.35 : 0.07}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={legGeo} position={[0.45, -1.5, 0]}>
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.8}
          transparent
          opacity={isSelected ? 0.35 : 0.07}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
