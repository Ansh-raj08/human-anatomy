import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useAnatomy } from '../../interaction/AnatomyContext';
import { useMission } from '../../missions/MissionContext';
import { SelectableMesh } from '../SelectableMesh';

export const CardiovascularModel: React.FC = () => {
  const { systemVisibility } = useAnatomy();
  const { activeMissionId, currentStep } = useMission();

  if (!systemVisibility.circulatory) return null;

  const isCardiacMission = activeMissionId === 'cardiac_highway';
  const targetId = isCardiacMission ? currentStep?.targetStructureId : null;

  // 1. Superior & Inferior Vena Cava
  const svcIvcGeo = useMemo(() => {
    // Top SVC tube + bottom IVC tube entering RA
    const svc = new THREE.CylinderGeometry(0.045, 0.05, 0.35, 12);
    return svc;
  }, []);

  // 2. Right Atrium
  const raGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.12, 16, 14);
    geo.scale(1.1, 1.2, 0.9);
    return geo;
  }, []);

  // 3. Tricuspid Valve (3 distinct cusps)
  const tricuspidGeo = useMemo(() => {
    const ring = new THREE.TorusGeometry(0.055, 0.012, 8, 16);
    return ring;
  }, []);

  // 4. Right Ventricle
  const rvGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.14, 0.28, 16);
    geo.rotateZ(0.2);
    return geo;
  }, []);

  // 5. Pulmonary Semilunar Valve (3 pocket cusps)
  const pulmValveGeo = useMemo(() => {
    return new THREE.TorusGeometry(0.048, 0.01, 8, 16);
  }, []);

  // 6. Pulmonary Trunk & Arteries
  const pulmArteryGeo = useMemo(() => {
    // Curved conduit emerging from RV base
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.06, 2.05, 0.42),
      new THREE.Vector3(-0.08, 2.18, 0.38),
      new THREE.Vector3(-0.04, 2.25, 0.32),
      new THREE.Vector3(0.15, 2.22, 0.25),
    ]);
    return new THREE.TubeGeometry(curve, 18, 0.04, 10, false);
  }, []);

  // 7. Pulmonary Capillary Beds (Alveolar network in lungs)
  const lungCapillariesGeo = useMemo(() => {
    const group = new THREE.SphereGeometry(0.16, 12, 10);
    return group;
  }, []);

  // 8. Pulmonary Veins (entering posterior LA)
  const pulmVeinsGeo = useMemo(() => {
    const vein = new THREE.CylinderGeometry(0.035, 0.035, 0.32, 10);
    vein.rotateZ(Math.PI / 2);
    return vein;
  }, []);

  // 9. Left Atrium
  const laGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.12, 16, 14);
    geo.scale(1.0, 1.1, 0.95);
    return geo;
  }, []);

  // 10. Bicuspid (Mitral) Valve (2 sturdy cusps)
  const mitralGeo = useMemo(() => {
    const ring = new THREE.TorusGeometry(0.055, 0.015, 8, 16);
    return ring;
  }, []);

  // 11. Left Ventricle (Thick myocardium, cardiac apex)
  const lvGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.17, 0.36, 18);
    geo.rotateZ(-0.25);
    return geo;
  }, []);

  // 12. Aortic Semilunar Valve
  const aorticValveGeo = useMemo(() => {
    return new THREE.TorusGeometry(0.05, 0.012, 8, 16);
  }, []);

  // 13. Aorta & Aortic Arch
  const aortaGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.16, 2.05, 0.35),
      new THREE.Vector3(-0.14, 2.28, 0.35),
      new THREE.Vector3(-0.18, 2.38, 0.32),
      new THREE.Vector3(-0.24, 2.25, 0.26),
      new THREE.Vector3(-0.24, 1.6, 0.22),
    ]);
    return new THREE.TubeGeometry(curve, 24, 0.055, 12, false);
  }, []);

  // 14. Systemic Body Tissues & Organs
  const systemicGeo = useMemo(() => {
    const ring = new THREE.TorusGeometry(0.48, 0.02, 10, 24);
    ring.rotateX(Math.PI / 2);
    return ring;
  }, []);

  return (
    <group name="CardiovascularSystem">
      {/* 1. Vena Cavae */}
      <SelectableMesh
        structureId="circ_svc_ivc"
        geometry={svcIvcGeo}
        baseColor="#2563eb"
        position={[0.08, 2.25, 0.35]}
      />
      <SelectableMesh
        structureId="circ_svc_ivc"
        geometry={svcIvcGeo}
        baseColor="#2563eb"
        position={[0.08, 1.82, 0.35]}
      />

      {/* 2. Right Atrium */}
      <SelectableMesh
        structureId="circ_right_atrium"
        geometry={raGeo}
        baseColor="#3b82f6"
        position={[0.06, 2.1, 0.38]}
      />

      {/* 3. Tricuspid Valve */}
      <SelectableMesh
        structureId="circ_tricuspid_valve"
        geometry={tricuspidGeo}
        baseColor="#93c5fd"
        position={[0.02, 1.98, 0.42]}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* 4. Right Ventricle */}
      <SelectableMesh
        structureId="circ_right_ventricle"
        geometry={rvGeo}
        baseColor="#1d4ed8"
        position={[-0.04, 1.84, 0.42]}
        rotation={[Math.PI, 0, 0.2]}
      />

      {/* 5. Pulmonary Semilunar Valve */}
      <SelectableMesh
        structureId="circ_pulmonary_valve"
        geometry={pulmValveGeo}
        baseColor="#60a5fa"
        position={[-0.06, 2.05, 0.42]}
        rotation={[0.4, 0, 0]}
      />

      {/* 6. Pulmonary Trunk & Arteries */}
      <SelectableMesh
        structureId="circ_pulmonary_artery"
        geometry={pulmArteryGeo}
        baseColor="#3b82f6"
        position={[0, 0, 0]}
      />

      {/* 7. Pulmonary Capillary Beds (Bilateral lungs) */}
      <SelectableMesh
        structureId="circ_lung_capillaries"
        geometry={lungCapillariesGeo}
        baseColor="#818cf8"
        position={[0.38, 2.15, 0.18]}
      />
      <SelectableMesh
        structureId="circ_lung_capillaries"
        geometry={lungCapillariesGeo}
        baseColor="#818cf8"
        position={[-0.38, 2.15, 0.18]}
      />

      {/* 8. Pulmonary Veins (Oxygenated - Red) */}
      <SelectableMesh
        structureId="circ_pulmonary_veins"
        geometry={pulmVeinsGeo}
        baseColor="#ef4444"
        position={[-0.22, 2.14, 0.24]}
      />
      <SelectableMesh
        structureId="circ_pulmonary_veins"
        geometry={pulmVeinsGeo}
        baseColor="#ef4444"
        position={[0.18, 2.14, 0.24]}
      />

      {/* 9. Left Atrium */}
      <SelectableMesh
        structureId="circ_left_atrium"
        geometry={laGeo}
        baseColor="#dc2626"
        position={[-0.18, 2.1, 0.3]}
      />

      {/* 10. Bicuspid (Mitral) Valve */}
      <SelectableMesh
        structureId="circ_mitral_valve"
        geometry={mitralGeo}
        baseColor="#fca5a5"
        position={[-0.18, 1.98, 0.36]}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* 11. Left Ventricle (Apex pointed to anatomical left) */}
      <SelectableMesh
        structureId="circ_left_ventricle"
        geometry={lvGeo}
        baseColor="#b91c1c"
        position={[-0.22, 1.82, 0.38]}
        rotation={[Math.PI, 0, -0.28]}
      />

      {/* 12. Aortic Semilunar Valve */}
      <SelectableMesh
        structureId="circ_aortic_valve"
        geometry={aorticValveGeo}
        baseColor="#f87171"
        position={[-0.16, 2.05, 0.36]}
        rotation={[0.3, 0, 0]}
      />

      {/* 13. Aorta & Aortic Arch */}
      <SelectableMesh
        structureId="circ_aorta"
        geometry={aortaGeo}
        baseColor="#ef4444"
        position={[0, 0, 0]}
      />

      {/* 14. Systemic Capillary Bed */}
      <SelectableMesh
        structureId="circ_systemic_tissues"
        geometry={systemicGeo}
        baseColor="#f59e0b"
        position={[0, 1.1, 0]}
      />

      {/* Dynamic Target Indicator in Mission Mode */}
      {isCardiacMission && targetId && (
        <pointLight
          position={[-0.1, 2.0, 0.5]}
          color="#38bdf8"
          intensity={1.2}
          distance={1.5}
        />
      )}
    </group>
  );
};
