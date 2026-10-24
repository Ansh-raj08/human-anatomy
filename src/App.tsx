import React, { useState, useEffect } from 'react';
import { AnatomyProvider, useAnatomy } from './interaction/AnatomyContext';
import { MissionProvider } from './missions/MissionContext';
import { CanvasContainer } from './scene/CanvasContainer';
import { Header } from './components/Header';
import { SystemControls } from './components/SystemControls';
import { AnatomyInfoPanel } from './components/AnatomyInfoPanel';
import { MissionOverlay } from './components/MissionOverlay';
import { SocraticTutorModal } from './components/SocraticTutorModal';
import { KeyboardHelpModal } from './components/KeyboardHelpModal';
import { AccessibilityLiveRegion } from './components/AccessibilityLiveRegion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { highContrast, reducedMotion, perfStats, resetCamera, clearSelection } = useAnatomy();
  const [isSocraticOpen, setIsSocraticOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Global keydown handler for Escape to reset/clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSelection();
        resetCamera();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection, resetCamera]);

  return (
    <div
      className={`app-container ${highContrast ? 'high-contrast' : ''} ${reducedMotion ? 'reduced-motion' : ''}`}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: '#090d16',
      }}
    >
      {/* 1. Header Toolbar */}
      <Header
        onOpenSocratic={() => setIsSocraticOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* 2. Fullscreen Interactive 3D WebGL Canvas */}
      <main style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} aria-label="3D Anatomy Viewer">
        <CanvasContainer />
      </main>

      {/* 3. Left System Layers & Dissection Drawer */}
      <SystemControls />

      {/* 4. Right Reviewed Educational Information Drawer */}
      <AnatomyInfoPanel />

      {/* 5. Bottom Gamified Mission HUD (Cardiac Highway / Arm Assembly) */}
      <MissionOverlay />

      {/* 6. Modals */}
      <SocraticTutorModal
        isOpen={isSocraticOpen}
        onClose={() => setIsSocraticOpen(false)}
      />

      <KeyboardHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* 7. Screen Reader Live Announcer */}
      <AccessibilityLiveRegion />

      {/* 8. WebGL Context Loss Recovery Banner */}
      {perfStats.contextLost && (
        <div
          role="alert"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '2px solid #ef4444',
            borderRadius: 16,
            padding: '24px 32px',
            zIndex: 100,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)',
          }}
        >
          <AlertTriangle size={36} color="#ef4444" />
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#f8fafc' }}>
            WebGL Context Temporarily Lost
          </h2>
          <p style={{ fontSize: 14, color: '#cbd5e1', maxWidth: 380, margin: 0, lineHeight: 1.5 }}>
            Your GPU device driver refreshed or suspended graphics resources. The engine is preserving your anatomical session state and automatically awaiting context restoration.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
            style={{ marginTop: 8 }}
          >
            <RefreshCw size={14} />
            <span>Force Reload Laboratory</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AnatomyProvider>
      <MissionProvider>
        <MainAppContent />
      </MissionProvider>
    </AnatomyProvider>
  );
}
