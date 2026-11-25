import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useAnatomy } from '../interaction/AnatomyContext';
import { ANATOMY_BY_KEY } from '../data/curriculum';

interface SceneControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  isUserDraggingRef: React.RefObject<boolean>;
  structureCentersRef: React.MutableRefObject<Record<string, THREE.Vector3>>;
}

const WHOLE_BODY_CENTER = new THREE.Vector3(0, 0.88, 0);
const DEFAULT_CAMERA_DISTANCE = 2.45;

export const SceneController: React.FC<SceneControllerProps> = ({
  controlsRef,
  isUserDraggingRef,
  structureCentersRef,
}) => {
  const { camera } = useThree();
  const {
    cameraFocusKey,
    cameraPreset,
    cameraRequestNonce,
    zoomRequestDelta,
    zoomRequestNonce,
    setZoomPercent,
  } = useAnatomy();

  const targetLookAt = useRef<THREE.Vector3>(WHOLE_BODY_CENTER.clone());
  const desiredCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.96, DEFAULT_CAMERA_DISTANCE));
  const isTransitioning = useRef<boolean>(false);
  const lastReportedZoom = useRef<number>(100);

  // One-shot camera preset or structure focus transition
  useEffect(() => {
    if (cameraRequestNonce === 0) return;

    const focusCenter =
      cameraFocusKey && structureCentersRef.current[cameraFocusKey]
        ? structureCentersRef.current[cameraFocusKey].clone()
        : WHOLE_BODY_CENTER.clone();

    let dist = DEFAULT_CAMERA_DISTANCE;
    if (cameraFocusKey && ANATOMY_BY_KEY[cameraFocusKey]) {
      const sys = ANATOMY_BY_KEY[cameraFocusKey].system;
      dist = sys === 'skeleton' ? 1.15 : 0.72;
    }

    const offset = new THREE.Vector3(0, 0.05, dist);
    if (!cameraFocusKey) {
      switch (cameraPreset) {
        case 'posterior':
          offset.set(0, 0.05, -DEFAULT_CAMERA_DISTANCE);
          break;
        case 'left_lateral':
          offset.set(DEFAULT_CAMERA_DISTANCE, 0.05, 0);
          break;
        case 'right_lateral':
          offset.set(-DEFAULT_CAMERA_DISTANCE, 0.05, 0);
          break;
        case 'thorax':
          focusCenter.set(0, 1.24, 0.02);
          offset.set(0, 0.02, 0.95);
          break;
        case 'cranial':
          focusCenter.set(0, 1.58, 0.02);
          offset.set(0, 0.02, 0.65);
          break;
        case 'anterior':
        case 'default':
        default:
          offset.set(0, 0.08, DEFAULT_CAMERA_DISTANCE);
          break;
      }
    }

    targetLookAt.current.copy(focusCenter);
    desiredCamPos.current.copy(focusCenter).add(offset);
    isTransitioning.current = true;
  }, [cameraFocusKey, cameraPreset, cameraRequestNonce, structureCentersRef]);

  // Discrete zoom pill (+/-) requests
  useEffect(() => {
    if (zoomRequestNonce === 0 || !controlsRef.current) return;
    const ctrl = controlsRef.current;
    const dir = new THREE.Vector3().subVectors(camera.position, ctrl.target);
    const currentDist = dir.length();
    const nextDist = THREE.MathUtils.clamp(currentDist + zoomRequestDelta, 0.45, 4.5);
    dir.normalize().multiplyScalar(nextDist);
    desiredCamPos.current.copy(ctrl.target).add(dir);
    targetLookAt.current.copy(ctrl.target);
    isTransitioning.current = true;
  }, [zoomRequestDelta, zoomRequestNonce, camera, controlsRef]);

  useFrame((_, delta) => {
    // Update live zoom percentage readout without spamming state
    if (controlsRef.current) {
      const dist = camera.position.distanceTo(controlsRef.current.target);
      const pct = Math.round(THREE.MathUtils.clamp((DEFAULT_CAMERA_DISTANCE / Math.max(dist, 0.35)) * 100, 35, 320));
      if (Math.abs(pct - lastReportedZoom.current) >= 2) {
        lastReportedZoom.current = pct;
        setZoomPercent(pct);
      }
    }

    if (isUserDraggingRef.current) {
      isTransitioning.current = false;
      return;
    }

    if (!isTransitioning.current) return;

    const lerpFactor = Math.min(1.0, delta * 5.5);
    camera.position.lerp(desiredCamPos.current, lerpFactor);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, lerpFactor);
      controlsRef.current.update();
    }

    const posDist = camera.position.distanceTo(desiredCamPos.current);
    const tgtDist = controlsRef.current
      ? controlsRef.current.target.distanceTo(targetLookAt.current)
      : 0;

    if (posDist < 0.01 && tgtDist < 0.01) {
      camera.position.copy(desiredCamPos.current);
      if (controlsRef.current) {
        controlsRef.current.target.copy(targetLookAt.current);
        controlsRef.current.update();
      }
      isTransitioning.current = false;
    }
  });

  return null;
};
