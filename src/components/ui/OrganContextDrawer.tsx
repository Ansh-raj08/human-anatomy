import React from 'react';
import { useAnatomy } from '../../interaction/AnatomyContext';
import { SYSTEM_LABELS, getStructureDetails } from '../../data/curriculum';
import { classifyAnatomicalMesh, MUSCLE_BIFURCATION_META } from '../../utils/anatomyClassifier';
import {
  ArrowExternalSvg,
  BookExternalSvg,
  CloseSvg,
  FocusSvg,
} from './AnatomyIcons';

export const OrganContextDrawer: React.FC = () => {
  const { selectedKey, selectStructure, focusStructure } = useAnatomy();

  if (!selectedKey) return null;

  const details = getStructureDetails(selectedKey);
  const classified = classifyAnatomicalMesh({ name: details.key }, details.color);

  const badgeLabel =
    classified.vascularSubtype === 'artery'
      ? 'Artery · Oxygenated'
      : classified.vascularSubtype === 'vein'
      ? 'Vein · Deoxygenated'
      : classified.muscleGroup
      ? MUSCLE_BIFURCATION_META[classified.muscleGroup].shortLabel
      : SYSTEM_LABELS[details.system];

  const badgeColor =
    classified.vascularSubtype === 'artery'
      ? '#ef4444'
      : classified.vascularSubtype === 'vein'
      ? '#3b82f6'
      : classified.muscleGroup
      ? MUSCLE_BIFURCATION_META[classified.muscleGroup].color
      : '#38bdf8';

  return (
    <aside className="context-drawer" aria-label="Selected Structure NCERT Details">
      <div className="drawer-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 5 }}>
            <span
              className="drawer-tag"
              style={{
                borderColor: `${badgeColor}55`,
                background: `${badgeColor}1a`,
                color: badgeColor,
              }}
            >
              {badgeLabel}
            </span>
            <span className="grade-chip">
              {details.ncertRef.grade} · Ch {details.ncertRef.chapterNumber}
            </span>
          </div>

          <h2 className="drawer-title">{details.label}</h2>
          <div className="mono-meta" style={{ marginTop: 2 }}>
            {details.ncertRef.unitTitle} · {details.ncertRef.pageRef}
          </div>
        </div>

        <button
          type="button"
          className="hud-icon-btn"
          onClick={() => selectStructure(null)}
          aria-label="Close Inspector"
        >
          <CloseSvg />
        </button>
      </div>

      <p className="drawer-body">{details.overview}</p>

      <div className="drawer-note">{details.clinicalNote}</div>

      <div className="drawer-actions">
        <a
          href={details.ncertRef.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ncert-link-btn"
        >
          <BookExternalSvg size={14} />
          <span>
            Read in NCERT Biology Book (Ch. {details.ncertRef.chapterNumber})
          </span>
          <ArrowExternalSvg size={12} />
        </a>

        <button
          type="button"
          className="hud-btn"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => focusStructure(details.key)}
        >
          <FocusSvg />
          <span>Focus 3D Camera</span>
        </button>
      </div>
    </aside>
  );
};
