import React from 'react';
import { Html, useProgress } from '@react-three/drei';
import { BrandLogoSvg } from '../components/ui/AnatomyIcons';

export const CanvasLoadingFallback: React.FC = () => {
  const { progress, item } = useProgress();
  const currentAsset = item ? item.split('/').pop() : 'Unified GLB';
  const pct = Math.min(100, Math.round(progress));

  return (
    <Html center>
      <div className="loader-card">
        <div className="loader-header">
          <span className="loader-icon">
            <BrandLogoSvg size={16} />
          </span>
          <div>
            <div className="loader-title">Loading 3D Anatomy</div>
            <div className="loader-subtitle">{currentAsset}</div>
          </div>
        </div>

        <div className="loader-track">
          <div className="loader-fill" style={{ width: `${pct}%` }} />
        </div>

        <div className="loader-meta">
          <span>Meshopt GLB</span>
          <span>{pct}%</span>
        </div>
      </div>
    </Html>
  );
};
