import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useAnatomy } from '../interaction/AnatomyContext';

export const PerformanceMonitor: React.FC = () => {
  const { gl } = useThree();
  const { updatePerfStats, setContextLost } = useAnatomy();

  const frameTimes = useRef<number[]>([]);
  const lastTime = useRef<number>(performance.now());
  const lowFpsDuration = useRef<number>(0);
  const lastStatBroadcast = useRef<number>(performance.now());

  // Listen to WebGL context loss and restoration events on the canvas
  useEffect(() => {
    const canvas = gl.domElement;

    const handleContextLost = (event: Event) => {
      // Must prevent default to allow browser to trigger webglcontextrestored
      event.preventDefault();
      setContextLost(true);
    };

    const handleContextRestored = () => {
      setContextLost(false);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl, setContextLost]);

  useFrame(() => {
    const now = performance.now();
    const delta = now - lastTime.current;
    lastTime.current = now;

    if (delta > 0) {
      frameTimes.current.push(delta);
      if (frameTimes.current.length > 60) {
        frameTimes.current.shift();
      }
    }

    // Broadcast stats every 500ms to avoid React state thrashing
    if (now - lastStatBroadcast.current > 500) {
      lastStatBroadcast.current = now;

      const sum = frameTimes.current.reduce((a, b) => a + b, 0);
      const avgDelta = sum / (frameTimes.current.length || 1);
      const currentFps = Math.min(60, Math.round(1000 / avgDelta));

      // Check degradation threshold (FPS < 24 for 3 continuous seconds)
      if (currentFps < 24) {
        lowFpsDuration.current += 0.5;
      } else {
        lowFpsDuration.current = Math.max(0, lowFpsDuration.current - 0.5);
      }

      const isDegraded = lowFpsDuration.current >= 3.0;
      const targetResolutionScale = isDegraded ? 0.75 : 1.0;

      updatePerfStats({
        fps: currentFps,
        drawCalls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        resolutionScale: targetResolutionScale,
        isLowPerformance: isDegraded,
      });
    }
  });

  return null;
};
