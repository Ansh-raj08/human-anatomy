import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardHelpModal: React.FC<KeyboardHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Left Click + Drag', desc: 'Orbit and rotate 3D camera around anatomical target' },
    { key: 'Right Click + Drag', desc: 'Pan camera laterally across the body' },
    { key: 'Scroll Wheel', desc: 'Zoom in / out on specific organs or joint landmarks' },
    { key: 'Esc', desc: 'Reset camera view and clear active structure selection' },
    { key: 'High-Contrast Button', desc: 'Enables high-contrast neon outlines and sharp borders' },
    { key: 'Accessible Steppers', desc: 'Non-drag buttons in Mission B allowing discrete spatial bone articulation' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2, 6, 23, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: 520,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 24,
          gap: 16,
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid #38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <Keyboard size={20} />
            </div>
            <div>
              <h2 id="help-modal-title" style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                Navigation & Accessibility
              </h2>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                Spatial controls designed for desktop, touch, and motor accessibility
              </p>
            </div>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={onClose} aria-label="Close Help Modal">
            <X size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'rgba(15, 23, 42, 0.5)',
                borderRadius: 8,
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <span style={{ fontSize: 13, color: '#e2e8f0' }}>{s.desc}</span>
              <kbd
                style={{
                  background: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: '#38bdf8',
                }}
              >
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 12,
            color: '#a7f3d0',
            lineHeight: 1.5,
          }}
        >
          <strong>Assistive Technology Note:</strong> All interactive selections, mission steps, and hints trigger live ARIA announcements for screen readers. Students with motor difficulties can assemble bones without dragging by using the discrete directional steppers.
        </div>
      </div>
    </div>
  );
};
