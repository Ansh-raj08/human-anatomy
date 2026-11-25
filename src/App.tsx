import React, { useEffect } from 'react';
import { AnatomyProvider, useAnatomy } from './interaction/AnatomyContext';
import { CanvasContainer } from './scene/CanvasContainer';
import { TopMinimalHeader } from './components/ui/TopMinimalHeader';
import { BottomControlDock } from './components/ui/BottomControlDock';
import { OrganContextDrawer } from './components/ui/OrganContextDrawer';
import { AccessibilityLiveRegion } from './components/AccessibilityLiveRegion';
import { ATTRIBUTION } from './data/curriculum';
import { CloseSvg, InfoSvg, ResetSvg } from './components/ui/AnatomyIcons';

const MainAppContent: React.FC = () => {
  const {
    perfStats,
    resetCamera,
    selectStructure,
    isAttributionOpen,
    setAttributionOpen,
  } = useAnatomy();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isAttributionOpen) {
        setAttributionOpen(false);
        return;
      }
      selectStructure(null);
      resetCamera();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isAttributionOpen, setAttributionOpen, selectStructure, resetCamera]);

  return (
    <div className="minimal-shell">
      {/* Unobstructed Fullscreen 3D Canvas (>=75% open viewport) */}
      <main className="minimal-stage" aria-label="Unified 3D Anatomy Viewport">
        <CanvasContainer />
      </main>

      {/* Minimal Floating Top Header */}
      <TopMinimalHeader />

      {/* Contextual Floating Right Organ/NCERT Drawer */}
      <OrganContextDrawer />

      {/* Bottom Floating Control Dock */}
      <BottomControlDock />

      {/* Attribution & License Modal */}
      {isAttributionOpen && (
        <div className="modal-backdrop" onClick={() => setAttributionOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <InfoSvg size={15} color="#38bdf8" />
                <h2 style={{ fontSize: 14, fontWeight: 700 }}>Attribution &amp; Open Licensing</h2>
              </div>
              <button
                type="button"
                className="hud-icon-btn"
                onClick={() => setAttributionOpen(false)}
                aria-label="Close Attribution Modal"
              >
                <CloseSvg />
              </button>
            </div>
            <p style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.6 }}>{ATTRIBUTION}</p>
            <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>
              Unified male &amp; female glTF models compressed with EXT_meshopt_compression at origin (0, 0, 0). NCERT Biology textbook links connect to official ncert.nic.in chapters.
            </p>
          </div>
        </div>
      )}

      <AccessibilityLiveRegion />

      {perfStats.contextLost && (
        <div className="modal-backdrop" role="alert">
          <div className="modal-dialog" style={{ maxWidth: 400, textAlign: 'center', alignItems: 'center' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>WebGL Context Interrupted</h2>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>
              Graphics resources were suspended by the browser. Reload to restore the 3D scene.
            </p>
            <button type="button" className="hud-btn is-active" onClick={() => window.location.reload()}>
              <ResetSvg />
              <span>Reload Lab</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AnatomyProvider>
      <MainAppContent />
    </AnatomyProvider>
  );
}
