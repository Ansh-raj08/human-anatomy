import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAnatomy } from '../interaction/AnatomyContext';

export const SceneController: React.FC = () => {
  const { camera } = useThree();
  const { cameraFocusTarget, cameraDistance, cameraPreset, reducedMotion } = useAnatomy();

  // Current smoothed target and camera position
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const desiredCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 5.5));

  // Update desired camera position based on preset or custom target
  useEffect(() => {
    const center = cameraFocusTarget ? new THREE.Vector3(...cameraFocusTarget) : new THREE.Vector3(0, 0, 0);
    const dist = cameraDistance || 4.5;

    let offset = new THREE.Vector3(0, 0, dist);

    switch (cameraPreset) {
      case 'anterior':
        offset.set(0, 0, dist);
        break;
      case 'posterior':
        offset.set(0, 0, -dist);
        break;
      case 'left_lateral':
        offset.set(-dist, 0, 0);
        break;
      case 'right_lateral':
        offset.set(dist, 0, 0);
        break;
      case 'thorax':
        offset.set(0, 0, dist * 0.7);
        break;
      case 'forearm':
        offset.set(dist * 0.5, 0, dist * 0.8);
        break;
      case 'cranial':
        offset.set(0, dist * 0.4, dist * 0.8);
        break;
      case 'default':
      default:
        offset.set(0, 0, dist);
        break;
    }

    desiredCamPos.current.copy(center).add(offset);
    targetLookAt.current.copy(center);

    // If user has reduced motion preference enabled, jump immediately
    if (reducedMotion) {
      camera.position.copy(desiredCamPos.current);
      camera.lookAt(targetLookAt.current);
    }
  }, [camera, cameraFocusTarget, cameraDistance, cameraPreset, reducedMotion]);

  useFrame((_, delta) => {
    if (reducedMotion) return;

    // Smooth exponential decay lerp for responsive, non-jarring camera motion
    const lerpFactor = Math.min(1.0, delta * 3.5);
    camera.position.lerp(desiredCamPos.current, lerpFactor);

    // Ensure camera looks toward the smoothed target
    camera.lookAt(targetLookAt.current);
  });

  return null;
};
