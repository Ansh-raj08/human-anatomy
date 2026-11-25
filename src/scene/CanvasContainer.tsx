import React, { Suspense, useRef, useCallback, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useAnatomy, type PinProjection } from '../interaction/AnatomyContext';
import { UnifiedAnatomyViewer } from './UnifiedAnatomyViewer';
import { ModularOrganExtensionLoader } from './ModularOrganExtensionLoader';
import { SceneController } from './SceneController';
import { PerformanceMonitor } from './PerformanceMonitor';
import { CanvasLoadingFallback } from './CanvasLoadingFallback';
import { WorldPinsOverlay } from '../components/WorldPinsOverlay';
import { HandGestureController, type HandSceneBridge } from '../components/3d/HandGestureController';

interface HandSceneBridgeComponentProps {
  sceneBridgeRef: React.MutableRefObject<HandSceneBridge>;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  interactiveMeshesRef: React.MutableRefObject<THREE.Mesh[]>;
  extensionMeshesRef: React.MutableRefObject<THREE.Mesh[]>;
  stageRef: React.RefObject<HTMLDivElement | null>;
}

const HandSceneBridgeComponent: React.FC<HandSceneBridgeComponentProps> = ({
  sceneBridgeRef,
  controlsRef,
  interactiveMeshesRef,
  extensionMeshesRef,
  stageRef,
}) => {
  const { camera } = useThree();

  useEffect(() => {
    sceneBridgeRef.current = {
      camera,
      controls: controlsRef.current,
      getInteractiveMeshes: () => [
        ...interactiveMeshesRef.current,
        ...extensionMeshesRef.current,
      ],
      getViewportElement: () => stageRef.current,
    };
  }, [camera, controlsRef, interactiveMeshesRef, extensionMeshesRef, stageRef, sceneBridgeRef]);

  return null;
};

export const CanvasContainer: React.FC = () => {
  const { selectStructure } = useAnatomy();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const isUserDraggingRef = useRef(false);
  const structureCentersRef = useRef<Record<string, THREE.Vector3>>({});
  const skinBoxRef = useRef<THREE.Box3 | null>(null);
  const interactiveMeshesRef = useRef<THREE.Mesh[]>([]);
  const extensionMeshesRef = useRef<THREE.Mesh[]>([]);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const sceneBridgeRef = useRef<HandSceneBridge>({
    camera: null,
    controls: null,
    getInteractiveMeshes: () => [],
    getViewportElement: () => null,
  });

  const pinsUpdateRef = useRef<((pins: Record<string, PinProjection>) => void) | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  const handlePinsFrame = useCallback((pins: Record<string, PinProjection>) => {
    pinsUpdateRef.current?.(pins);
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setStageSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={stageRef}
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
    >
      <Canvas
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: true,
        }}
        dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
        camera={{ position: [0, 0.96, 2.45], fov: 40 }}
        onPointerMissed={() => selectStructure(null)}
        style={{
          background: 'radial-gradient(circle at 50% 42%, #131c2e 0%, #090d16 70%, #05070c 100%)',
          touchAction: 'none',
        }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 5, 4]} intensity={1.35} color="#f8fafc" />
        <directionalLight position={[-3, 2, -3]} intensity={0.65} color="#93c5fd" />
        <pointLight position={[0, 1.2, 1.8]} intensity={0.4} color="#38bdf8" />

        <Suspense fallback={<CanvasLoadingFallback />}>
          <UnifiedAnatomyViewer
            structureCentersRef={structureCentersRef}
            skinBoxRef={skinBoxRef}
            interactiveMeshesRef={interactiveMeshesRef}
            onPinsFrame={handlePinsFrame}
          />
          <ModularOrganExtensionLoader
            skinBoxRef={skinBoxRef}
            structureCentersRef={structureCentersRef}
            extensionMeshesRef={extensionMeshesRef}
          />
        </Suspense>

        <gridHelper args={[4, 16, '#1e293b', '#0f172a']} position={[0, -0.01, 0]} />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={0.45}
          maxDistance={4.5}
          target={[0, 0.88, 0]}
          onStart={() => {
            isUserDraggingRef.current = true;
          }}
          onEnd={() => {
            isUserDraggingRef.current = false;
          }}
        />
        <SceneController
          controlsRef={controlsRef}
          isUserDraggingRef={isUserDraggingRef}
          structureCentersRef={structureCentersRef}
        />
        <HandSceneBridgeComponent
          sceneBridgeRef={sceneBridgeRef}
          controlsRef={controlsRef}
          interactiveMeshesRef={interactiveMeshesRef}
          extensionMeshesRef={extensionMeshesRef}
          stageRef={stageRef}
        />
        <PerformanceMonitor />
      </Canvas>

      <WorldPinsOverlay
        pinsUpdateRef={pinsUpdateRef}
        stageWidth={stageSize.width}
        stageHeight={stageSize.height}
      />

      <HandGestureController sceneBridgeRef={sceneBridgeRef} />
    </div>
  );
};
