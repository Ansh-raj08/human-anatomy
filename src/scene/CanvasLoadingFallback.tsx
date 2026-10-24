import React from 'react';
import { Html, useProgress } from '@react-three/drei';
import { Activity } from 'lucide-react';

export const CanvasLoadingFallback: React.FC = () => {
  const { progress, item } = useProgress();
  const currentAsset = item ? item.split('/').pop() : 'Anatomical Model Assets';

  return (
    <Html center>
      <div
        className="glass-panel"
        style={{
          width: 320,
          padding: '24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 0 35px rgba(56, 189, 248, 0.35)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          background: 'rgba(15, 23, 42, 0.92)',
        }}
      >
        {/* Animated Medical Pulse Icon */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.6)',
            animation: 'pulse 1.8s infinite',
          }}
        >
          <Activity size={28} />
        </div>

        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px', color: '#f8fafc' }}>
            Streaming Photorealistic Anatomy
          </h3>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontFamily: 'var(--font-mono)' }}>
            Loading: {currentAsset}
          </p>
        </div>

        {/* Progress Bar Container */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            style={{
              width: '100%',
              height: 8,
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.round(progress)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #38bdf8 0%, #0284c7 100%)',
                boxShadow: '0 0 10px #38bdf8',
                transition: 'width 0.25s ease-out',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            <span>Decoding GLB Meshes</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </Html>
  );
};
