globalThis.self = globalThis;
import fs from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      if (this.onloadend) this.onloadend();
    });
  }
};

const loader = new GLTFLoader();

function loadGLB(path) {
  return new Promise((resolve, reject) => {
    const buf = fs.readFileSync(path);
    loader.parse(
      buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
      '',
      resolve,
      reject
    );
  });
}

async function buildUnifiedCompositeGLB() {
  console.log('Loading 5 source anatomical models...');
  const [heart, lungs, skel, dig, sil] = await Promise.all([
    loadGLB('public/models/circulatory_heart.glb'),
    loadGLB('public/models/respiratory_system.glb'),
    loadGLB('public/models/skeletal_system.glb'),
    loadGLB('public/models/digestive_system.glb'),
    loadGLB('public/models/human_body_silhouette.glb'),
  ]);

  const compositeScene = new THREE.Scene();
  compositeScene.name = 'Human_Anatomy_Composite';

  // yShift centers thoracic cavity / heart precisely at Y ≈ 0.20,
  // perfectly matching the target interactive pin coordinates.
  const yShift = -0.875;

  // 1. Mesh_Musculature_Superficial (Rotated -90° around Y to orient coronal plane along X axis)
  const muscGroup = new THREE.Group();
  muscGroup.name = 'Mesh_Musculature_Superficial';
  const silScale = 4.106;
  const silPos = [0, yShift, 0.04];
  const qSil = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
  const silMat = new THREE.Matrix4().compose(
    new THREE.Vector3(...silPos),
    qSil,
    new THREE.Vector3(silScale, silScale, silScale)
  );

  sil.scene.traverse((child) => {
    if (child.isMesh) {
      const cloned = child.clone();
      cloned.name = 'Mesh_Musculature_Superficial';
      cloned.geometry = cloned.geometry.clone();
      const m = child.matrixWorld.clone().premultiply(silMat);
      cloned.geometry.applyMatrix4(m);
      cloned.position.set(0, 0, 0);
      cloned.rotation.set(0, 0, 0);
      cloned.scale.set(1, 1, 1);
      cloned.updateMatrix();
      muscGroup.add(cloned);
    }
  });
  compositeScene.add(muscGroup);

  // 2. Mesh_Skeletal_Torso
  const skelGroup = new THREE.Group();
  skelGroup.name = 'Mesh_Skeletal_Torso';
  skel.scene.updateMatrixWorld(true);

  skel.scene.traverse((child) => {
    if (child.isMesh) {
      const cloned = child.clone();
      const worldMat = child.matrixWorld.clone();
      worldMat.elements[13] += yShift;
      cloned.geometry = cloned.geometry.clone();
      cloned.geometry.applyMatrix4(worldMat);
      cloned.position.set(0, 0, 0);
      cloned.rotation.set(0, 0, 0);
      cloned.scale.set(1, 1, 1);
      cloned.updateMatrix();
      skelGroup.add(cloned);
    }
  });
  compositeScene.add(skelGroup);

  // 3. Mesh_Organ_Heart
  const heartGroup = new THREE.Group();
  heartGroup.name = 'Mesh_Organ_Heart';
  const heartScale = 1.9409;
  const heartPos = [-0.1063, 0.1509 + yShift, 0.007];
  const heartMat = new THREE.Matrix4().compose(
    new THREE.Vector3(...heartPos),
    new THREE.Quaternion(),
    new THREE.Vector3(heartScale, heartScale, heartScale)
  );

  heart.scene.traverse((child) => {
    if (child.isMesh) {
      const cloned = child.clone();
      cloned.geometry = cloned.geometry.clone();
      const m = child.matrixWorld.clone().premultiply(heartMat);
      cloned.geometry.applyMatrix4(m);
      cloned.position.set(0, 0, 0);
      cloned.rotation.set(0, 0, 0);
      cloned.scale.set(1, 1, 1);
      cloned.updateMatrix();
      heartGroup.add(cloned);
    }
  });
  compositeScene.add(heartGroup);

  // 4. Mesh_Organ_Lungs
  const lungsGroup = new THREE.Group();
  lungsGroup.name = 'Mesh_Organ_Lungs';
  const lungsScale = 2.2774;
  const lungsPos = [0.0114, -0.02 + yShift, 0.1674];
  const lungsMat = new THREE.Matrix4().compose(
    new THREE.Vector3(...lungsPos),
    new THREE.Quaternion(),
    new THREE.Vector3(lungsScale, lungsScale, lungsScale)
  );

  lungs.scene.traverse((child) => {
    if (child.isMesh) {
      const cloned = child.clone();
      cloned.geometry = cloned.geometry.clone();
      const m = child.matrixWorld.clone().premultiply(lungsMat);
      cloned.geometry.applyMatrix4(m);
      cloned.position.set(0, 0, 0);
      cloned.rotation.set(0, 0, 0);
      cloned.scale.set(1, 1, 1);
      cloned.updateMatrix();
      lungsGroup.add(cloned);
    }
  });
  compositeScene.add(lungsGroup);

  // 5. Mesh_Organ_Digestive
  const digGroup = new THREE.Group();
  digGroup.name = 'Mesh_Organ_Digestive';
  const digScale = 0.0586;
  const digPos = [0.1321, 0.4679 + yShift, 0.08];
  const digMat = new THREE.Matrix4().compose(
    new THREE.Vector3(...digPos),
    new THREE.Quaternion(),
    new THREE.Vector3(digScale, digScale, digScale)
  );

  dig.scene.traverse((child) => {
    if (child.isMesh) {
      const cloned = child.clone();
      cloned.geometry = cloned.geometry.clone();
      const m = child.matrixWorld.clone().premultiply(digMat);
      cloned.geometry.applyMatrix4(m);
      cloned.position.set(0, 0, 0);
      cloned.rotation.set(0, 0, 0);
      cloned.scale.set(1, 1, 1);
      cloned.updateMatrix();
      digGroup.add(cloned);
    }
  });
  compositeScene.add(digGroup);

  console.log('Exporting unified GLB...');
  const exporter = new GLTFExporter();
  exporter.parse(
    compositeScene,
    (glb) => {
      const outPath = 'public/models/human_anatomy_composite.glb';
      fs.writeFileSync(outPath, Buffer.from(glb));
      console.log(`Successfully generated ${outPath} (${(glb.byteLength / 1024 / 1024).toFixed(2)} MB)`);
      console.log('All nodes share position=[0,0,0], scale=[1,1,1], rotation=[0,0,0]');
    },
    (err) => console.error('Export error:', err),
    { binary: true }
  );
}

buildUnifiedCompositeGLB().catch(console.error);
