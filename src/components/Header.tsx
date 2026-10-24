import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Bone,
  Compass,
  RotateCcw,
  Sparkles,
  Eye,
  Sliders,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { useAnatomy, type CameraPreset } from '../interaction/AnatomyContext';
import { useMission } from '../missions/MissionContext';

interface HeaderProps {
  onOpenSocratic: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSocratic, onOpenHelp }) => {
  const {
    cameraPreset,
    setCameraPreset,
    resetCamera,
    perfStats,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
  } = useAnatomy();

  const { activeMissionId, startMission, exitMission } = useMission();

  const [showPresetsMenu, setShowPresetsMenu] = useState(false);

  const presets: { id: CameraPreset; label: string }[] = [
    { id: 'anterior', label: 'Anterior (Front)' },
    { id: 'posterior', label: 'Posterior (Back)' },
    { id: 'thorax', label: 'Thoracic Close-Up' },
    { id: 'forearm', label: 'Forearm Close-Up' },
    { id: 'cranial', label: 'Cranial Close-Up' },
  ];

  return (
    <header
      className="glass-panel"
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        zIndex: 20,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        gap: 12,
      }}
    >
      {/* Brand & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)',
          }}
        >
          <Activity size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#f8fafc' }}>
            Inside the Human Body
          </h1>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, fontWeight: 500 }}>
            Medical Anatomy Adventure • NCERT & NEET Foundation
          </p>
        </div>
      </div>

      {/* Primary Mission Navigation Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }} aria-label="Mode Navigation">
        <button
          className={`btn ${activeMissionId === null ? 'btn-primary' : 'btn-secondary'}`}
          onClick={exitMission}
          aria-current={activeMissionId === null ? 'page' : undefined}
          title="Free interactive exploration across all 6 anatomical systems"
        >
          <Compass size={15} />
          <span>Explore</span>
        </button>

        <button
          className={`btn ${activeMissionId === 'cardiac_highway' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => startMission('cardiac_highway')}
          aria-current={activeMissionId === 'cardiac_highway' ? 'page' : undefined}
          title="Trace the 14-checkpoint double circulation pathway"
        >
          <Heart size={15} color="#ef4444" />
          <span>Mission A: Cardiac Highway</span>
          <span className="badge badge-rose" style={{ padding: '1px 6px', fontSize: 10 }}>14 Steps</span>
        </button>

        <button
          className={`btn ${activeMissionId === 'appendicular_assembly' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => startMission('appendicular_assembly')}
          aria-current={activeMissionId === 'appendicular_assembly' ? 'page' : undefined}
          title="Articulate Radius and Ulna with the upper-arm Humerus anchor"
        >
          <Bone size={15} color="#e2e8f0" />
          <span>Mission B: Arm Assembly</span>
          <span className="badge badge-amber" style={{ padding: '1px 6px', fontSize: 10 }}>Forearm</span>
        </button>
      </nav>

      {/* Right Tools: Camera Presets, Socratic Tutor, Performance, Settings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Socratic AI Tutor Button */}
        <button
          className="btn"
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(147, 51, 234, 0.35) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.5)',
            color: '#d8b4fe',
          }}
          onClick={onOpenSocratic}
          title="Ask the Socratic Biology Tutor questions and get 3-tier guided hints"
        >
          <Sparkles size={15} />
          <span>Socratic Tutor</span>
        </button>

        {/* Camera Preset Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowPresetsMenu(!showPresetsMenu)}
            title="Choose anatomical camera view preset"
          >
            <Eye size={14} />
            <span>View</span>
          </button>
          {showPresetsMenu && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: 170,
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                zIndex: 30,
              }}
            >
              {presets.map(p => (
                <button
                  key={p.id}
                  className="btn btn-secondary btn-sm"
                  style={{
                    justifyContent: 'flex-start',
                    background: cameraPreset === p.id ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    border: cameraPreset === p.id ? '1px solid var(--accent-cyan)' : 'none',
                  }}
                  onClick={() => {
                    setCameraPreset(p.id);
                    setShowPresetsMenu(false);
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset Camera */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={resetCamera}
          title="Reset camera to default view (Esc)"
          aria-label="Reset Camera"
        >
          <RotateCcw size={14} />
        </button>

        {/* Real-time Performance Diagnostic Pill */}
        <div
          className="badge"
          style={{
            background: perfStats.isLowPerformance ? 'rgba(239, 68, 68, 0.2)' : 'rgba(15, 23, 42, 0.7)',
            border: `1px solid ${perfStats.isLowPerformance ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: perfStats.isLowPerformance ? '#fca5a5' : '#94a3b8',
          }}
          title={`FPS: ${perfStats.fps} | Tris: ${perfStats.triangles.toLocaleString()} | Calls: ${perfStats.drawCalls} | DpiScale: ${perfStats.resolutionScale}x`}
        >
          <Zap size={11} color={perfStats.fps >= 45 ? '#10b981' : perfStats.fps >= 25 ? '#f59e0b' : '#ef4444'} />
          <span>{perfStats.fps} FPS</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>{perfStats.drawCalls} calls</span>
        </div>

        {/* High Contrast Toggle */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setHighContrast(!highContrast)}
          style={{ background: highContrast ? '#ffff00' : undefined, color: highContrast ? '#000000' : undefined }}
          title={highContrast ? 'Disable High-Contrast Mode' : 'Enable High-Contrast Mode'}
          aria-label="Toggle High-Contrast Mode"
        >
          <Sliders size={13} />
        </button>

        {/* Reduced Motion Toggle */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setReducedMotion(!reducedMotion)}
          style={{ background: reducedMotion ? '#a855f7' : undefined, color: reducedMotion ? '#ffffff' : undefined }}
          title={reducedMotion ? 'Disable Reduced-Motion' : 'Enable Reduced-Motion'}
          aria-label="Toggle Reduced Motion"
        >
          <Eye size={13} />
        </button>

        {/* Keyboard Help Modal Trigger */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenHelp}
          title="Keyboard shortcuts & Accessibility Guide"
          aria-label="Keyboard Shortcuts"
        >
          <HelpCircle size={14} />
        </button>
      </div>
    </header>
  );
};
