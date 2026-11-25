import React, { useEffect, useRef } from 'react';
import { useAnatomy, type PinProjection } from '../interaction/AnatomyContext';
import { ANATOMY_BY_KEY, COURSE_CHAPTERS, SYSTEM_LABELS, getStructureDetails } from '../data/curriculum';
import { FocusSvg } from './ui/AnatomyIcons';

interface WorldPinsOverlayProps {
  pinsUpdateRef: React.MutableRefObject<((pins: Record<string, PinProjection>) => void) | null>;
  stageWidth: number;
  stageHeight: number;
}

export const WorldPinsOverlay: React.FC<WorldPinsOverlayProps> = ({
  pinsUpdateRef,
  stageWidth,
  stageHeight,
}) => {
  const { selectedKey, selectStructure, focusStructure, showPins, activeChapterId } = useAnatomy();

  const pinsLayerRef = useRef<HTMLDivElement>(null);
  const leaderLineRef = useRef<SVGPolylineElement>(null);
  const anchorRingRef = useRef<SVGCircleElement>(null);
  const calloutRef = useRef<HTMLDivElement>(null);
  const selectedKeyRef = useRef(selectedKey);
  const sizeRef = useRef({ w: stageWidth, h: stageHeight });

  useEffect(() => {
    selectedKeyRef.current = selectedKey;
  }, [selectedKey]);

  useEffect(() => {
    sizeRef.current = { w: stageWidth, h: stageHeight };
  }, [stageWidth, stageHeight]);

  useEffect(() => {
    pinsUpdateRef.current = (projections: Record<string, PinProjection>) => {
      const container = pinsLayerRef.current;
      if (!container) return;

      const pinElements = container.querySelectorAll<HTMLButtonElement>('[data-pin-key]');
      pinElements.forEach((btn) => {
        const key = btn.dataset.pinKey;
        if (!key) return;
        const proj = projections[key];
        if (!proj || !proj.visible) {
          btn.style.opacity = '0';
          btn.style.pointerEvents = 'none';
          return;
        }
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        btn.style.transform = `translate3d(${proj.x}px, ${proj.y}px, 0) translate(-50%, -50%)`;
      });

      const activeKey = selectedKeyRef.current;
      const activeProj = activeKey ? projections[activeKey] : undefined;
      const line = leaderLineRef.current;
      const ring = anchorRingRef.current;
      const card = calloutRef.current;

      if (!activeProj || !activeProj.visible || !line || !ring || !card) {
        if (line) line.setAttribute('points', '');
        if (ring) ring.setAttribute('opacity', '0');
        if (card) card.style.opacity = '0';
        return;
      }

      const { w, h } = sizeRef.current;
      // Anchor leader line cleanly toward the contextual right drawer when open, or floating left chip
      const targetCardX = Math.max(18, w - 344);
      const targetCardY = Math.max(72, Math.min(activeProj.y - 36, h - 180));
      const anchorX = targetCardX;
      const anchorY = targetCardY + 24;
      const elbowX = Math.max(activeProj.x + 28, anchorX - 36);

      card.style.opacity = '1';
      card.style.transform = `translate3d(${Math.max(18, activeProj.x - 260)}px, ${targetCardY}px, 0)`;

      ring.setAttribute('cx', String(activeProj.x));
      ring.setAttribute('cy', String(activeProj.y));
      ring.setAttribute('opacity', '1');

      // Leader line points cleanly from the 3D Box3 center to the contextual right drawer
      line.setAttribute(
        'points',
        `${activeProj.x},${activeProj.y} ${elbowX},${anchorY} ${anchorX},${anchorY}`
      );
    };

    return () => {
      pinsUpdateRef.current = null;
    };
  }, [pinsUpdateRef]);

  if (!showPins) return null;

  const selectedDetails = selectedKey ? getStructureDetails(selectedKey) : null;
  const activeChapter = COURSE_CHAPTERS.find((c) => c.id === activeChapterId);
  const pinSet = new Set<string>(activeChapter ? activeChapter.structureKeys.slice(0, 5) : ['heart', 'aorta']);
  if (selectedKey) pinSet.add(selectedKey);
  const visiblePinKeys = Array.from(pinSet).filter((k) => Boolean(ANATOMY_BY_KEY[k]));

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 12,
        overflow: 'hidden',
      }}
      aria-label="3D Anatomical Pins and Leader Line"
    >
      <svg
        width={stageWidth}
        height={stageHeight}
        viewBox={`0 0 ${Math.max(1, stageWidth)} ${Math.max(1, stageHeight)}`}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <polyline
          ref={leaderLineRef}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          ref={anchorRingRef}
          r="9"
          fill="rgba(56, 189, 248, 0.14)"
          stroke="#38bdf8"
          strokeWidth="1.5"
          opacity="0"
        />
      </svg>

      <div ref={pinsLayerRef} style={{ position: 'absolute', inset: 0 }}>
        {visiblePinKeys.map((key) => {
          const struct = ANATOMY_BY_KEY[key];
          const isSelected = selectedKey === key;
          return (
            <button
              key={key}
              type="button"
              data-pin-key={key}
              className={`world-pin ${isSelected ? 'is-selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                selectStructure(key, true);
              }}
              title={`${struct.label} (${SYSTEM_LABELS[struct.system]})`}
              style={{ opacity: 0 }}
            >
              <span className="world-pin-dot" style={{ background: struct.color || '#38bdf8' }} />
              <span className="world-pin-label">{struct.label}</span>
            </button>
          );
        })}
      </div>

      {/* Compact Floating Anchor Pill when Drawer is active */}
      {selectedDetails && (
        <div ref={calloutRef} className="pin-floating-chip" style={{ opacity: 0, pointerEvents: 'auto' }}>
          <span className="mono-meta" style={{ color: '#38bdf8' }}>{selectedDetails.label}</span>
          <button
            type="button"
            className="hud-icon-btn"
            style={{ width: 20, height: 20 }}
            onClick={() => focusStructure(selectedDetails.key)}
            aria-label={`Focus ${selectedDetails.label}`}
          >
            <FocusSvg size={11} />
          </button>
        </div>
      )}
    </div>
  );
};
