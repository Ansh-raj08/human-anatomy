import React, { useRef } from 'react';
import * as THREE from 'three';
import { useAnatomy } from '../interaction/AnatomyContext';
import { useMission } from '../missions/MissionContext';

interface SelectableMeshProps {
  structureId: string;
  geometry: THREE.BufferGeometry;
  baseColor: string;
  wireframe?: boolean;
  opacity?: number;
  transparent?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  children?: React.ReactNode;
}

export const SelectableMesh: React.FC<SelectableMeshProps> = ({
  structureId,
  geometry,
  baseColor,
  wireframe = false,
  opacity = 1.0,
  transparent = false,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  children,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { selectedStructureId, hoveredStructureId, selectStructure, setHoveredStructure, highContrast, clipping } = useAnatomy();
  const { activeMissionId, handleStructureSelected } = useMission();

  const isSelected = selectedStructureId === structureId;
  const isHovered = hoveredStructureId === structureId;

  // Clipping plane calculation if enabled
  const clippingPlanes = React.useMemo(() => {
    if (!clipping.enabled) return [];
    let normal = new THREE.Vector3(0, 0, 1);
    if (clipping.axis === 'x') normal = new THREE.Vector3(1, 0, 0);
    if (clipping.axis === 'y') normal = new THREE.Vector3(0, 1, 0);
    if (clipping.negate) normal.negate();
    return [new THREE.Plane(normal, -clipping.position)];
  }, [clipping]);

  // Determine final material color based on state
  let displayColor = baseColor;
  let emissiveColor = '#000000';
  let emissiveIntensity = 0.0;

  if (isSelected) {
    displayColor = highContrast ? '#ffff00' : '#38bdf8';
    emissiveColor = highContrast ? '#ffff00' : '#0284c7';
    emissiveIntensity = 0.6;
  } else if (isHovered) {
    displayColor = highContrast ? '#ffffff' : '#67e8f9';
    emissiveColor = '#0369a1';
    emissiveIntensity = 0.35;
  }

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (activeMissionId) {
      handleStructureSelected(structureId);
    } else {
      selectStructure(structureId);
    }
  };

  const handlePointerOver = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHoveredStructure(structureId);
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = () => {
    if (hoveredStructureId === structureId) {
      setHoveredStructure(null);
    }
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'auto';
    }
  };

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <meshStandardMaterial
          color={displayColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.35}
          metalness={0.15}
          wireframe={wireframe}
          transparent={transparent || isSelected || opacity < 1.0}
          opacity={opacity}
          side={THREE.DoubleSide}
          clippingPlanes={clippingPlanes}
          clipShadows
        />
      </mesh>

      {/* Visible Selection Glow Ring if selected */}
      {isSelected && (
        <mesh geometry={geometry} scale={[1.04, 1.04, 1.04]}>
          <meshBasicMaterial
            color={highContrast ? '#ffff00' : '#38bdf8'}
            wireframe
            transparent
            opacity={0.7}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {children}
    </group>
  );
};
