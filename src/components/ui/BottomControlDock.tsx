import React, { useState } from 'react';
import { useAnatomy } from '../../interaction/AnatomyContext';
import { useHandSettingsStore } from '../../store/handSettingsStore';
import { ATTRIBUTION } from '../../data/curriculum';
import {
  MUSCLE_BIFURCATION_META,
  type MuscleBifurcationGroup,
} from '../../utils/anatomyClassifier';
import {
  HandSvg,
  MuscleSvg,
  PinSvg,
  ResetSvg,
  SlidersSvg,
  XraySvg,
  ZoomInSvg,
  ZoomOutSvg,
} from './AnatomyIcons';

const MUSCLE_GROUPS = Object.values(MUSCLE_BIFURCATION_META);

export const BottomControlDock: React.FC = () => {
  const {
    xrayMode,
    setXrayMode,
    showPins,
    setShowPins,
    resetLayers,
    resetCamera,
    zoomPercent,
    triggerZoom,
    handControlEnabled,
    setHandControlEnabled,
    muscleGroupVisibility,
    toggleMuscleGroup,
    setAttributionOpen,
  } = useAnatomy();

  const {
    orbitSpeed,
    zoomSpeed,
    smoothing,
    deadzone,
    dwellTimeSec,
    setOrbitSpeed,
    setZoomSpeed,
    setSmoothing,
    setDeadzone,
    setDwellTimeSec,
    resetDefaults,
  } = useHandSettingsStore();

  const [showMuscleLegend, setShowMuscleLegend] = useState(false);
  const [showHandSettings, setShowHandSettings] = useState(false);

  return (
    <>
      {/* Muscle Bifurcation Legend Popover */}
      {showMuscleLegend && (
        <div
          className="glass-popover"
          style={{
            position: 'absolute',
            bottom: 72,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 340,
            maxWidth: 'calc(100vw - 24px)',
          }}
          aria-label="Muscular Bifurcation Legend"
        >
          <div className="popover-header">
            <span>Muscular Bifurcation Legend</span>
            <span className="mono-meta">5 Groups</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {MUSCLE_GROUPS.map((grp) => {
              const active = muscleGroupVisibility[grp.id as MuscleBifurcationGroup];
              return (
                <button
                  key={grp.id}
                  type="button"
                  className={`popover-row ${active ? 'is-active' : ''}`}
                  onClick={() => toggleMuscleGroup(grp.id)}
                  aria-pressed={active}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: grp.color,
                        flexShrink: 0,
                        opacity: active ? 1 : 0.35,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600 }}>{grp.label}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{grp.description}</div>
                    </div>
                  </div>
                  <span className="mono-meta">{active ? 'ON' : 'OFF'}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hand Sensitivity Settings Popover (Zustand Persisted) */}
      {handControlEnabled && showHandSettings && (
        <div
          className="glass-popover"
          style={{
            position: 'absolute',
            bottom: 72,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 320,
            maxWidth: 'calc(100vw - 24px)',
          }}
          aria-label="Hand Sensitivity Settings"
        >
          <div className="popover-header">
            <span>Hand Sensitivity Settings</span>
            <button type="button" className="hud-link-btn" onClick={resetDefaults}>
              Reset
            </button>
          </div>

          <div className="slider-stack">
            <label className="slider-row">
              <div className="slider-label">
                <span>Orbit Rotation Speed</span>
                <span className="mono-meta">{orbitSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={orbitSpeed}
                onChange={(e) => setOrbitSpeed(parseFloat(e.target.value))}
              />
            </label>

            <label className="slider-row">
              <div className="slider-label">
                <span>Pinch Zoom Speed</span>
                <span className="mono-meta">{zoomSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={zoomSpeed}
                onChange={(e) => setZoomSpeed(parseFloat(e.target.value))}
              />
            </label>

            <label className="slider-row">
              <div className="slider-label">
                <span>Smoothing / Damping</span>
                <span className="mono-meta">{smoothing.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.01"
                value={smoothing}
                onChange={(e) => setSmoothing(parseFloat(e.target.value))}
              />
            </label>

            <label className="slider-row">
              <div className="slider-label">
                <span>Gesture Deadzone</span>
                <span className="mono-meta">{deadzone.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.10"
                step="0.005"
                value={deadzone}
                onChange={(e) => setDeadzone(parseFloat(e.target.value))}
              />
            </label>

            <label className="slider-row">
              <div className="slider-label">
                <span>Point-to-Select Dwell</span>
                <span className="mono-meta">{dwellTimeSec.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.0"
                step="0.1"
                value={dwellTimeSec}
                onChange={(e) => setDwellTimeSec(parseFloat(e.target.value))}
              />
            </label>
          </div>
        </div>
      )}

      {/* Main Bottom Floating Control Dock */}
      <div className="bottom-dock-wrap">
        <div className="bottom-dock" role="toolbar" aria-label="3D Viewport Controls">
          <button
            type="button"
            className={`hud-btn ${xrayMode ? 'is-active' : ''}`}
            onClick={() => setXrayMode(!xrayMode)}
            aria-pressed={xrayMode}
          >
            <XraySvg />
            <span>X-Ray</span>
          </button>

          <button
            type="button"
            className={`hud-btn ${showPins ? 'is-active' : ''}`}
            onClick={() => setShowPins(!showPins)}
            aria-pressed={showPins}
          >
            <PinSvg />
            <span>Pins</span>
          </button>

          <button
            type="button"
            className={`hud-btn ${showMuscleLegend ? 'is-active' : ''}`}
            onClick={() => {
              setShowMuscleLegend((v) => !v);
              setShowHandSettings(false);
            }}
          >
            <MuscleSvg color="#d45d5d" />
            <span>Muscles Legend</span>
          </button>

          <div className="dock-sep" />

          <div className="zoom-group" role="group" aria-label="Zoom Controls">
            <button
              type="button"
              className="hud-icon-btn"
              onClick={() => triggerZoom(0.35)}
              aria-label="Zoom Out"
            >
              <ZoomOutSvg />
            </button>
            <span className="zoom-readout">{zoomPercent}%</span>
            <button
              type="button"
              className="hud-icon-btn"
              onClick={() => triggerZoom(-0.35)}
              aria-label="Zoom In"
            >
              <ZoomInSvg />
            </button>
          </div>

          <button
            type="button"
            className="hud-btn"
            onClick={() => {
              resetLayers();
              resetCamera();
            }}
          >
            <ResetSvg />
            <span>Reset View</span>
          </button>

          <div className="dock-sep" />

          <button
            type="button"
            className={`hud-btn ${handControlEnabled ? 'is-hand-active' : ''}`}
            onClick={() => {
              const next = !handControlEnabled;
              setHandControlEnabled(next);
              if (next) {
                setShowHandSettings(true);
                setShowMuscleLegend(false);
              }
            }}
            aria-pressed={handControlEnabled}
          >
            <HandSvg />
            <span>Hand Control</span>
          </button>

          {handControlEnabled && (
            <button
              type="button"
              className={`hud-icon-btn ${showHandSettings ? 'is-active' : ''}`}
              onClick={() => {
                setShowHandSettings((v) => !v);
                setShowMuscleLegend(false);
              }}
              title="Hand Sensitivity Settings"
              aria-label="Hand Sensitivity Settings"
            >
              <SlidersSvg />
            </button>
          )}
        </div>

        <button
          type="button"
          className="dock-attribution"
          onClick={() => setAttributionOpen(true)}
          title={ATTRIBUTION}
        >
          {ATTRIBUTION}
        </button>
      </div>
    </>
  );
};
