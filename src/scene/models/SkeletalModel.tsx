import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useAnatomy } from '../../interaction/AnatomyContext';
import { useMission } from '../../missions/MissionContext';
import { SelectableMesh } from '../SelectableMesh';

export const SkeletalModel: React.FC = () => {
  const { systemVisibility } = useAnatomy();
  const { activeMissionId, assemblyBones, selectedBoneToMove, setSelectedBoneToMove } = useMission();

  if (!systemVisibility.skeletal) return null;

  const isAssemblyMission = activeMissionId === 'appendicular_assembly';

  // Geometries for skeletal structures
  const skullGeo = useMemo(() => {
    // Cranial dome + facial block
    const dome = new THREE.SphereGeometry(0.35, 20, 18);
    dome.scale(1, 1.15, 1.1);
    return dome;
  }, []);

  const spineGeo = useMemo(() => {
    // S-curved vertebral column
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 3.2, -0.05),
      new THREE.Vector3(0, 2.7, 0.05),
      new THREE.Vector3(0, 2.1, -0.08),
      new THREE.Vector3(0, 1.4, 0.06),
      new THREE.Vector3(0, 0.7, -0.02),
      new THREE.Vector3(0, 0.2, 0.0),
    ]);
    return new THREE.TubeGeometry(curve, 32, 0.06, 12, false);
  }, []);

  const ribcageGeo = useMemo(() => {
    // Ribcage barrel with sternum
    const ribGroup = new THREE.CylinderGeometry(0.42, 0.38, 1.1, 16, 6, true);
    return ribGroup;
  }, []);

  const pelvisGeo = useMemo(() => {
    // Basin-shaped pelvis
    const basin = new THREE.TorusGeometry(0.35, 0.12, 12, 20, Math.PI * 1.5);
    basin.rotateX(Math.PI / 2);
    basin.rotateZ(Math.PI / 4);
    return basin;
  }, []);

  // Upper limb bones
  const humerusGeo = useMemo(() => {
    // Right Humerus: hemispherical head proximally, shaft, and distal condyles
    const shaft = new THREE.CylinderGeometry(0.045, 0.055, 0.9, 14);
    return shaft;
  }, []);

  const radiusGeo = useMemo(() => {
    // Right Radius: cylindrical proximal head, expanding distal styloid
    const rShaft = new THREE.CylinderGeometry(0.035, 0.05, 0.82, 14);
    return rShaft;
  }, []);

  const ulnaGeo = useMemo(() => {
    // Right Ulna: hooked proximal olecranon process, tapering distal shaft
    const uShaft = new THREE.CylinderGeometry(0.055, 0.03, 0.85, 14);
    return uShaft;
  }, []);

  // Lower limb bones
  const femurGeo = useMemo(() => new THREE.CylinderGeometry(0.07, 0.065, 1.4, 14), []);
  const tibiaGeo = useMemo(() => new THREE.CylinderGeometry(0.06, 0.045, 1.3, 14), []);

  // Assembly joint anchor target geometries
  const jointAnchorGeo = useMemo(() => new THREE.TorusGeometry(0.09, 0.02, 10, 20), []);

  // Positions and rotations for Radius and Ulna
  const radiusPos: [number, number, number] = isAssemblyMission
    ? assemblyBones.bone_radius_r.currentPosition
    : [1.48, 1.15, 0];
  const radiusRot: [number, number, number] = isAssemblyMission
    ? assemblyBones.bone_radius_r.currentRotation
    : [0, 0, 0];

  const ulnaPos: [number, number, number] = isAssemblyMission
    ? assemblyBones.bone_ulna_r.currentPosition
    : [1.32, 1.15, 0];
  const ulnaRot: [number, number, number] = isAssemblyMission
    ? assemblyBones.bone_ulna_r.currentRotation
    : [0, 0, 0];

  return (
    <group name="SkeletalSystem">
      {/* Cranium */}
      <SelectableMesh
        structureId="bone_skull"
        geometry={skullGeo}
        baseColor="#e2e8f0"
        position={[0, 3.8, 0]}
      />

      {/* Vertebral Column (Spine) */}
      <SelectableMesh
        structureId="bone_spine"
        geometry={spineGeo}
        baseColor="#cbd5e1"
        position={[0, 0, 0]}
      />

      {/* Thoracic Ribcage & Sternum */}
      <SelectableMesh
        structureId="bone_ribcage"
        geometry={ribcageGeo}
        baseColor="#e2e8f0"
        wireframe
        position={[0, 2.1, 0.05]}
      />

      {/* Pelvic Girdle */}
      <SelectableMesh
        structureId="bone_pelvis"
        geometry={pelvisGeo}
        baseColor="#e2e8f0"
        position={[0, 0.15, 0]}
      />

      {/* Right Humerus (Fixed Proximal Reference) */}
      <SelectableMesh
        structureId="bone_humerus_r"
        geometry={humerusGeo}
        baseColor={isAssemblyMission ? '#38bdf8' : '#e2e8f0'}
        position={[1.4, 2.05, 0]}
        rotation={[0, 0, -0.05]}
      >
        {isAssemblyMission && (
          <group position={[0, -0.48, 0]}>
            {/* Visual joint landmark label for Capitulum (lateral) and Trochlea (medial) */}
            <mesh position={[0.08, 0, 0]}>
              <sphereGeometry args={[0.04, 12, 12]} />
              <meshBasicMaterial color="#10b981" />
            </mesh>
            <mesh position={[-0.08, 0, 0]}>
              <sphereGeometry args={[0.04, 12, 12]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
          </group>
        )}
      </SelectableMesh>

      {/* Left Humerus (Context) */}
      <mesh geometry={humerusGeo} position={[-1.4, 2.05, 0]} rotation={[0, 0, 0.05]}>
        <meshStandardMaterial color="#cbd5e1" opacity={0.6} transparent />
      </mesh>

      {/* Right Radius (Lateral Forearm Bone, on thumb side) */}
      <group
        onClick={(e) => {
          if (isAssemblyMission) {
            e.stopPropagation();
            setSelectedBoneToMove('bone_radius_r');
          }
        }}
      >
        <SelectableMesh
          structureId="bone_radius_r"
          geometry={radiusGeo}
          baseColor={
            isAssemblyMission
              ? assemblyBones.bone_radius_r.isPlaced
                ? '#10b981'
                : selectedBoneToMove === 'bone_radius_r'
                ? '#38bdf8'
                : '#f87171'
              : '#e2e8f0'
          }
          position={radiusPos}
          rotation={radiusRot}
        />
      </group>

      {/* Right Ulna (Medial Forearm Bone, on pinky side) */}
      <group
        onClick={(e) => {
          if (isAssemblyMission) {
            e.stopPropagation();
            setSelectedBoneToMove('bone_ulna_r');
          }
        }}
      >
        <SelectableMesh
          structureId="bone_ulna_r"
          geometry={ulnaGeo}
          baseColor={
            isAssemblyMission
              ? assemblyBones.bone_ulna_r.isPlaced
                ? '#10b981'
                : selectedBoneToMove === 'bone_ulna_r'
                ? '#38bdf8'
                : '#fbbf24'
              : '#e2e8f0'
          }
          position={ulnaPos}
          rotation={ulnaRot}
        />
      </group>

      {/* Assembly Target Anchors (Shown only during Mission B) */}
      {isAssemblyMission && (
        <group>
          {/* Radius Target Anchor (Lateral / Capitulum side) */}
          <mesh
            geometry={jointAnchorGeo}
            position={assemblyBones.bone_radius_r.targetPosition}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshBasicMaterial
              color="#10b981"
              wireframe
              transparent
              opacity={assemblyBones.bone_radius_r.isPlaced ? 0.3 : 0.8}
            />
          </mesh>

          {/* Ulna Target Anchor (Medial / Trochlea side) */}
          <mesh
            geometry={jointAnchorGeo}
            position={assemblyBones.bone_ulna_r.targetPosition}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshBasicMaterial
              color="#fbbf24"
              wireframe
              transparent
              opacity={assemblyBones.bone_ulna_r.isPlaced ? 0.3 : 0.8}
            />
          </mesh>
        </group>
      )}

      {/* Lower limbs */}
      <SelectableMesh
        structureId="bone_femur_r"
        geometry={femurGeo}
        baseColor="#e2e8f0"
        position={[0.38, -0.65, 0]}
      />
      <mesh geometry={femurGeo} position={[-0.38, -0.65, 0]}>
        <meshStandardMaterial color="#cbd5e1" opacity={0.6} transparent />
      </mesh>

      <SelectableMesh
        structureId="bone_tibia_r"
        geometry={tibiaGeo}
        baseColor="#e2e8f0"
        position={[0.38, -2.1, 0]}
      />
      <mesh geometry={tibiaGeo} position={[-0.38, -2.1, 0]}>
        <meshStandardMaterial color="#cbd5e1" opacity={0.6} transparent />
      </mesh>
    </group>
  );
};
