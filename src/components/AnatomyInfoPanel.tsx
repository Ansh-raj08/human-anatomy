import React from 'react';
import { BookOpen, Stethoscope, X, ArrowUpRight, Crosshair } from 'lucide-react';
import { useAnatomy } from '../interaction/AnatomyContext';
import { ANATOMY_REGISTRY, ANATOMICAL_SYSTEMS } from '../anatomy/registry';

export const AnatomyInfoPanel: React.FC = () => {
  const { selectedStructure, selectStructure, clearSelection, focusStructure } = useAnatomy();

  if (!selectedStructure) return null;

  const systemDef = ANATOMICAL_SYSTEMS[selectedStructure.system];

  return (
    <aside
      className="glass-panel"
      style={{
        position: 'absolute',
        top: 80,
        right: 16,
        width: 360,
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
        zIndex: 20,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
      aria-label="Anatomical Structure Details"
    >
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            <span
              className="badge"
              style={{
                background: `${systemDef?.themeColor || '#38bdf8'}22`,
                color: systemDef?.themeColor || '#38bdf8',
                border: `1px solid ${systemDef?.themeColor || '#38bdf8'}44`,
              }}
            >
              {systemDef?.displayName || selectedStructure.system}
            </span>
            <span className="badge badge-purple">{selectedStructure.curriculumLevel}</span>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#f8fafc', lineHeight: 1.25 }}>
            {selectedStructure.displayName}
          </h2>

          {selectedStructure.latinName && (
            <p style={{ fontSize: 12, fontStyle: 'italic', color: '#94a3b8', margin: '2px 0 0' }}>
              {selectedStructure.latinName}
            </p>
          )}
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={clearSelection}
          title="Deselect structure"
          aria-label="Close Information Panel"
          style={{ padding: '6px' }}
        >
          <X size={14} />
        </button>
      </div>

      {/* NCERT Curricular Citation */}
      <div
        style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: 8,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          color: '#bae6fd',
        }}
      >
        <BookOpen size={14} color="#38bdf8" />
        <span style={{ fontWeight: 600 }}>{selectedStructure.ncertReference}</span>
      </div>

      {/* Short Overview */}
      <div>
        <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: 4 }}>
          Overview
        </h3>
        <p style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.5 }}>
          {selectedStructure.shortDescription}
        </p>
      </div>

      {/* Biological Function & Mechanics */}
      <div>
        <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: 4 }}>
          Physiological Function
        </h3>
        <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>
          {selectedStructure.biologicalFunction}
        </p>
      </div>

      {/* Clinical Significance / High-Yield NEET Notes */}
      {selectedStructure.clinicalSignificance && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 8,
            padding: '10px 12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: '#fbbf24' }}>
            <Stethoscope size={14} />
            <h4 style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>Clinical & NEET High-Yield Note</h4>
          </div>
          <p style={{ fontSize: 12, color: '#fef3c7', margin: 0, lineHeight: 1.45 }}>
            {selectedStructure.clinicalSignificance}
          </p>
        </div>
      )}

      {/* Neighboring Structures (Click to navigate) */}
      {selectedStructure.neighboringStructureIds.length > 0 && (
        <div>
          <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: 6 }}>
            Articulated / Neighboring Landmarks
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {selectedStructure.neighboringStructureIds.map(nId => {
              const neighbor = ANATOMY_REGISTRY[nId];
              if (!neighbor) return null;
              return (
                <button
                  key={nId}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11, padding: '3px 8px' }}
                  onClick={() => selectStructure(nId)}
                  title={`Navigate directly to ${neighbor.displayName}`}
                >
                  <span>{neighbor.displayName}</span>
                  <ArrowUpRight size={10} style={{ opacity: 0.7 }} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={() => focusStructure(selectedStructure.id)}
          title="Zoom camera to focus closely on this structure"
        >
          <Crosshair size={14} />
          <span>Focus Camera</span>
        </button>
      </div>
    </aside>
  );
};
