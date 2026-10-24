import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useAnatomy } from '../interaction/AnatomyContext';
import { SceneController } from './SceneController';
import { PerformanceMonitor } from './PerformanceMonitor';
import { CanvasLoadingFallback } from './CanvasLoadingFallback';
import { ModelViewer } from './ModelViewer';

export const CanvasContainer: React.FC = () => {
  const { perfStats } = useAnatomy();

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        gl={{
          antialias: true,
          localClippingEnabled: true,
          powerPreference: 'high-performance',
        }}
        dpr={perfStats.resolutionScale * (typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1)}
        camera={{ position: [0, 0.0, 5.5], fov: 45 }}
        style={{ background: 'radial-gradient(circle at 50% 40%, #0f172a 0%, #020617 100%)' }}
      >
        {/* High-Tech Medical Studio Lighting */}
        <ambientLight intensity={0.85} />
        <directionalLight position={[4, 8, 6]} intensity={1.3} />
        <directionalLight position={[-4, 4, -4]} intensity={0.7} color="#93c5fd" />
        <pointLight position={[0, -2, 2]} intensity={0.35} color="#38bdf8" />

        {/* Photorealistic GLB Anatomy Models wrapped in React Suspense */}
        <Suspense fallback={<CanvasLoadingFallback />}>
          <ModelViewer />
        </Suspense>

        {/* Medical Floor Grid */}
        <gridHelper args={[10, 20, '#1e293b', '#0f172a']} position={[0, -2.15, 0]} />

        {/* Interactive Controls & View Orchestration */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.06}
          minDistance={0.6}
          maxDistance={9.0}
          target={[0, 0.0, 0]}
        />
        <SceneController />
        <PerformanceMonitor />
      </Canvas>
    </div>
  );
};
