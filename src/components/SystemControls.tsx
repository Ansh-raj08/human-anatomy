import React, { useState } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Scissors,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Heart,
  Bone,
  Wind,
  Utensils,
  Droplets,
  Activity,
  User,
} from 'lucide-react';
import { useAnatomy } from '../interaction/AnatomyContext';
import { ANATOMICAL_SYSTEMS } from '../anatomy/registry';
import type { AnatomicalSystemId } from '../anatomy/types';

export const SystemControls: React.FC = () => {
  const {
    systemVisibility,
    toggleSystemVisibility,
    isolateSystem,
    restoreAllSystems,
    clipping,
    setClipping,
    resetClipping,
  } = useAnatomy();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'systems' | 'dissection'>('systems');

  const getSystemIcon = (systemId: AnatomicalSystemId) => {
    switch (systemId) {
      case 'circulatory':
        return <Heart size={14} color="#ef4444" />;
      case 'skeletal':
        return <Bone size={14} color="#e2e8f0" />;
      case 'respiratory':
        return <Wind size={14} color="#06b6d4" />;
      case 'digestive':
        return <Utensils size={14} color="#f59e0b" />;
      case 'urinary':
        return <Droplets size={14} color="#8b5cf6" />;
      case 'nervous':
        return <Activity size={14} color="#ec4899" />;
      case 'integumentary':
      default:
        return <User size={14} color="#38bdf8" />;
    }
  };

  const systemList: AnatomicalSystemId[] = [
    'skeletal',
    'circulatory',
    'respiratory',
    'digestive',
    'urinary',
    'nervous',
    'integumentary',
  ];

  return (
    <aside
      className="glass-panel"
      style={{
        position: 'absolute',
        top: 80,
        left: 16,
        width: isCollapsed ? 48 : 300,
        maxHeight: 'calc(100vh - 100px)',
        zIndex: 20,
        padding: isCollapsed ? '12px 6px' : '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      aria-label="Anatomical System Layers and Dissection Controls"
    >
      {/* Header & Collapse Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={16} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#f8fafc' }}>Anatomical Systems</h2>
          </div>
        )}
        <button
          className="btn btn-secondary btn-sm"
          style={{ padding: '4px', width: 28, height: 28 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand systems menu' : 'Collapse systems menu'}
          aria-label={isCollapsed ? 'Expand systems menu' : 'Collapse systems menu'}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Subtabs: Layers vs. Dissection Plane */}
          <div style={{ display: 'flex', gap: 4, background: 'rgba(15, 23, 42, 0.6)', padding: 3, borderRadius: 8 }}>
            <button
              className={`btn btn-sm ${activeTab === 'systems' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '4px 8px', fontSize: 12 }}
              onClick={() => setActiveTab('systems')}
            >
              <Layers size={13} />
              <span>Layers</span>
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'dissection' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '4px 8px', fontSize: 12 }}
              onClick={() => setActiveTab('dissection')}
            >
              <Scissors size={13} />
              <span>Dissection</span>
            </button>
          </div>

          {/* TAB 1: System Layers */}
          {activeTab === 'systems' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
              {systemList.map(sysId => {
                const sys = ANATOMICAL_SYSTEMS[sysId];
                const isVis = systemVisibility[sysId];
                return (
                  <div
                    key={sysId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: 8,
                      background: isVis ? 'rgba(30, 41, 59, 0.45)' : 'rgba(15, 23, 42, 0.4)',
                      border: `1px solid ${isVis ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)'}`,
                      opacity: isVis ? 1 : 0.5,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {getSystemIcon(sysId)}
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{sys.displayName}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 6px', fontSize: 10 }}
                        onClick={() => isolateSystem(sysId)}
                        title={`Isolate ${sys.displayName} (hide other systems)`}
                      >
                        Isolate
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 6px' }}
                        onClick={() => toggleSystemVisibility(sysId)}
                        title={isVis ? `Hide ${sys.displayName}` : `Show ${sys.displayName}`}
                        aria-label={isVis ? `Hide ${sys.displayName}` : `Show ${sys.displayName}`}
                      >
                        {isVis ? <Eye size={12} color="#38bdf8" /> : <EyeOff size={12} color="#64748b" />}
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 8 }}
                onClick={restoreAllSystems}
                title="Restore all anatomical systems"
              >
                <RotateCcw size={13} />
                <span>Restore All Systems</span>
              </button>
            </div>
          )}

          {/* TAB 2: Dissection / Clipping Plane Controls */}
          {activeTab === 'dissection' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Enable Cutaway Plane</span>
                <input
                  type="checkbox"
                  id="clipping-plane-toggle"
                  checked={clipping.enabled}
                  onChange={(e) => setClipping(prev => ({ ...prev, enabled: e.target.checked }))}
                  style={{ cursor: 'pointer', width: 16, height: 16 }}
                  aria-label="Toggle Cutaway Dissection Plane"
                />
              </div>

              {clipping.enabled && (
                <>
                  <div>
                    <label htmlFor="anatomical-plane-select" style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                      Anatomical Section Plane
                    </label>
                    <select
                      id="anatomical-plane-select"
                      value={clipping.axis}
                      onChange={(e) => setClipping(prev => ({ ...prev, axis: e.target.value as 'x' | 'y' | 'z' }))}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: 6,
                        background: '#1e293b',
                        color: '#f8fafc',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      <option value="z">Coronal (Front-to-Back Cutaway)</option>
                      <option value="x">Sagittal (Left-to-Right Cutaway)</option>
                      <option value="y">Transverse (Cross-Section Cutaway)</option>
                    </select>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
                      <label htmlFor="cutaway-depth-slider">Cutaway Depth</label>
                      <span>{clipping.position.toFixed(2)}</span>
                    </div>
                    <input
                      id="cutaway-depth-slider"
                      type="range"
                      min="-2.0"
                      max="3.5"
                      step="0.05"
                      value={clipping.position}
                      onChange={(e) => setClipping(prev => ({ ...prev, position: parseFloat(e.target.value) }))}
                      style={{ width: '100%', cursor: 'pointer' }}
                      aria-label="Cutaway Depth Slider"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => setClipping(prev => ({ ...prev, negate: !prev.negate }))}
                    >
                      Invert Cut
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={resetClipping}
                      title="Reset dissection plane"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>

                  <div
                    style={{
                      background: 'rgba(6, 182, 212, 0.1)',
                      border: '1px solid rgba(6, 182, 212, 0.25)',
                      borderRadius: 6,
                      padding: '8px',
                      fontSize: 11,
                      color: '#a5f3fc',
                      lineHeight: 1.4,
                    }}
                  >
                    Adjust Coronal plane to ~0.35 to view the internal Tricuspid and Mitral valves inside the cardiac chambers!
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </aside>
  );
};
