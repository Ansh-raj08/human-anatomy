import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useAnatomy } from '../interaction/AnatomyContext';

export const PerformanceMonitor: React.FC = () => {
  const { gl } = useThree();
  const { updatePerfStats, setContextLost } = useAnatomy();

  const frameTimes = useRef<number[]>([]);
  const lastTime = useRef<number>(0);
  const lastStatBroadcast = useRef<number>(0);

  useEffect(() => {
    const now = performance.now();
    lastTime.current = now;
    lastStatBroadcast.current = now;

    const canvas = gl.domElement;
    const handleContextLost = (event: Event) => {
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
    if (lastTime.current === 0) {
      lastTime.current = now;
      lastStatBroadcast.current = now;
      return;
    }

    const delta = now - lastTime.current;
    lastTime.current = now;

    if (delta > 0) {
      frameTimes.current.push(delta);
      if (frameTimes.current.length > 60) frameTimes.current.shift();
    }

    if (now - lastStatBroadcast.current > 500) {
      lastStatBroadcast.current = now;
      const sum = frameTimes.current.reduce((a, b) => a + b, 0);
      const avgDelta = sum / (frameTimes.current.length || 1);
      const currentFps = Math.min(60, Math.round(1000 / avgDelta));

      updatePerfStats({
        fps: currentFps,
        drawCalls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
      });
    }
  });

  return null;
};
