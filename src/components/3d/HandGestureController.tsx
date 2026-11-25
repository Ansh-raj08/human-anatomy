import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { FilesetResolver, HandLandmarker, type NormalizedLandmark } from '@mediapipe/tasks-vision';
import { useAnatomy } from '../../interaction/AnatomyContext';
import { useHandSettingsStore } from '../../store/handSettingsStore';
import { CloseSvg, HandSvg } from '../ui/AnatomyIcons';

export interface HandSceneBridge {
  camera: THREE.Camera | null;
  controls: OrbitControlsImpl | null;
  getInteractiveMeshes: () => THREE.Mesh[];
  getViewportElement: () => HTMLElement | null;
}

interface HandGestureControllerProps {
  sceneBridgeRef: React.MutableRefObject<HandSceneBridge>;
}

const TRACK_INTERVAL_MS = 33; // ~30 FPS decoupled tracking loop
const FIST_COOLDOWN_MS = 1200;
const HAND_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

function dist2D(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function isFingerExtended(lms: NormalizedLandmark[], tipIdx: number, pipIdx: number): boolean {
  const wrist = lms[0];
  return dist2D(lms[tipIdx], wrist) > dist2D(lms[pipIdx], wrist) * 1.12;
}

export const HandGestureController: React.FC<HandGestureControllerProps> = ({ sceneBridgeRef }) => {
  const {
    handControlEnabled,
    setHandControlEnabled,
    setHandStatusText,
    selectStructure,
    setHoveredStructure,
    toggleXrayOrSkeletonIsolation,
  } = useAnatomy();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dwellRingRef = useRef<SVGCircleElement | null>(null);
  const dwellCursorRef = useRef<HTMLDivElement | null>(null);

  const [gestureLabel, setGestureLabel] = useState<string>('Initializing...');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const selectRef = useRef(selectStructure);
  const hoverRef = useRef(setHoveredStructure);
  const toggleXrayRef = useRef(toggleXrayOrSkeletonIsolation);
  useEffect(() => {
    selectRef.current = selectStructure;
    hoverRef.current = setHoveredStructure;
    toggleXrayRef.current = toggleXrayOrSkeletonIsolation;
  }, [selectStructure, setHoveredStructure, toggleXrayOrSkeletonIsolation]);

  useEffect(() => {
    if (!handControlEnabled) return;

    let cancelled = false;
    let rafId = 0;
    let stream: MediaStream | null = null;
    let handLandmarker: HandLandmarker | null = null;

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const spherical = new THREE.Spherical();
    const offset = new THREE.Vector3();

    let lastDetectTime = 0;
    let framesInSecond = 0;
    let fpsWindowStart = performance.now();
    let measuredFps = 0;

    let prevWrist: { x: number; y: number } | null = null;
    let lastFistToggleTime = 0;
    let dwellTargetKey: string | null = null;
    let dwellStartTime = 0;
    let targetAzimuthVel = 0;
    let targetPolarVel = 0;
    let targetZoomDist: number | null = null;

    const updateDwellCursor = (visible: boolean, clientX = 0, clientY = 0, progress = 0) => {
      const cursor = dwellCursorRef.current;
      const ring = dwellRingRef.current;
      if (!cursor || !ring) return;
      if (!visible) {
        cursor.style.opacity = '0';
        return;
      }
      cursor.style.opacity = '1';
      cursor.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`;
      const circumference = 2 * Math.PI * 14;
      ring.style.strokeDasharray = `${circumference}`;
      ring.style.strokeDashoffset = `${circumference * (1 - Math.min(1, progress))}`;
    };

    const drawPipSkeleton = (lms: NormalizedLandmark[] | null) => {
      const canvas = pipCanvasRef.current;
      const video = videoRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (video && video.readyState >= 2 && video.videoWidth > 0) {
        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.globalAlpha = 0.45;
        ctx.drawImage(video, 0, 0, w, h);
        ctx.restore();
      } else {
        ctx.fillStyle = '#070b12';
        ctx.fillRect(0, 0, w, h);
      }

      if (!lms) return;

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.6;
      for (const conn of HandLandmarker.HAND_CONNECTIONS) {
        const a = lms[conn.start];
        const b = lms[conn.end];
        if (!a || !b) continue;
        ctx.beginPath();
        ctx.moveTo((1 - a.x) * w, a.y * h);
        ctx.lineTo((1 - b.x) * w, b.y * h);
        ctx.stroke();
      }

      lms.forEach((lm, idx) => {
        ctx.beginPath();
        ctx.arc((1 - lm.x) * w, lm.y * h, idx === 4 || idx === 8 ? 3.8 : 2.2, 0, Math.PI * 2);
        ctx.fillStyle = idx === 8 ? '#f43f5e' : idx === 4 ? '#10b981' : '#e2e8f0';
        ctx.fill();
      });
    };

    async function createLandmarkerWithFallback(
      vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>
    ): Promise<HandLandmarker> {
      try {
        return await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: HAND_MODEL_URL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.6,
          minHandPresenceConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });
      } catch (gpuErr) {
        console.warn('[HandTrack] GPU delegate unavailable, falling back to CPU:', gpuErr);
        return await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: HAND_MODEL_URL, delegate: 'CPU' },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.6,
          minHandPresenceConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });
      }
    }

    async function startTracking() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Webcam API unavailable in this browser.');
        }

        console.info('[HandTrack] Requesting camera...');
        setGestureLabel('Requesting camera...');
        setHandStatusText('Requesting camera...');

        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        console.info('[HandTrack] Loading WASM & HandLandmarker...');
        setGestureLabel('Loading WASM & HandLandmarker...');
        const vision = await FilesetResolver.forVisionTasks('/mediapipe/wasm');
        if (cancelled) return;

        handLandmarker = await createLandmarkerWithFallback(vision);
        if (cancelled) {
          handLandmarker.close();
          return;
        }

        console.info('[HandTrack] Tracking active at ~30 FPS');
        setErrorBanner(null);
        setGestureLabel('Tracking active (~30 FPS)');
        setHandStatusText('Hand Control Active');

        const tick = () => {
          if (cancelled) return;
          rafId = requestAnimationFrame(tick);

          const now = performance.now();
          const settings = useHandSettingsStore.getState();

          // Smooth camera update decoupled from MediaPipe inference cadence
          const bridge = sceneBridgeRef.current;
          if (bridge.camera && bridge.controls) {
            const controls = bridge.controls;
            const prevDamping = controls.enableDamping;

            if (
              Math.abs(targetAzimuthVel) > 0.0004 ||
              Math.abs(targetPolarVel) > 0.0004 ||
              targetZoomDist !== null
            ) {
              // Temporarily bypass OrbitControls internal damping so it doesn't fight hand lerps
              controls.enableDamping = false;
              offset.copy(bridge.camera.position).sub(controls.target);
              spherical.setFromVector3(offset);

              spherical.theta = THREE.MathUtils.lerp(
                spherical.theta,
                spherical.theta + targetAzimuthVel,
                settings.smoothing
              );
              spherical.phi = THREE.MathUtils.clamp(
                THREE.MathUtils.lerp(
                  spherical.phi,
                  spherical.phi + targetPolarVel,
                  settings.smoothing
                ),
                0.2,
                Math.PI - 0.2
              );
              targetAzimuthVel *= 1 - settings.smoothing;
              targetPolarVel *= 1 - settings.smoothing;

              if (targetZoomDist !== null) {
                spherical.radius = THREE.MathUtils.lerp(
                  spherical.radius,
                  THREE.MathUtils.clamp(targetZoomDist, controls.minDistance, controls.maxDistance),
                  settings.smoothing
                );
              }

              offset.setFromSpherical(spherical);
              bridge.camera.position.copy(controls.target).add(offset);
              controls.update();
              controls.enableDamping = prevDamping;
            }
          }

          // Throttle MediaPipe detectForVideo strictly to ~30 FPS
          if (now - lastDetectTime < TRACK_INTERVAL_MS) return;
          lastDetectTime = now;

          if (!video || video.readyState < 2 || video.videoWidth === 0 || !handLandmarker) return;

          const result = handLandmarker.detectForVideo(video, now);
          framesInSecond += 1;
          if (now - fpsWindowStart >= 1000) {
            measuredFps = framesInSecond;
            framesInSecond = 0;
            fpsWindowStart = now;
          }

          const lms = result.landmarks?.[0] ?? null;
          drawPipSkeleton(lms);

          if (!lms) {
            prevWrist = null;
            targetZoomDist = null;
            dwellTargetKey = null;
            updateDwellCursor(false);
            setGestureLabel(`No hand (${measuredFps} FPS)`);
            return;
          }

          const indexUp = isFingerExtended(lms, 8, 6);
          const middleUp = isFingerExtended(lms, 12, 10);
          const ringUp = isFingerExtended(lms, 16, 14);
          const pinkyUp = isFingerExtended(lms, 20, 18);
          const pinchDist = dist2D(lms[4], lms[8]);
          const palmScale = Math.max(0.05, dist2D(lms[0], lms[9]));

          // 1. Closed Fist -> Toggle X-Ray / Skeleton Isolation (1.2s cooldown)
          if (!indexUp && !middleUp && !ringUp && !pinkyUp) {
            prevWrist = null;
            targetZoomDist = null;
            dwellTargetKey = null;
            updateDwellCursor(false);
            setGestureLabel(`Fist · X-Ray (${measuredFps} FPS)`);
            if (now - lastFistToggleTime > FIST_COOLDOWN_MS) {
              lastFistToggleTime = now;
              toggleXrayRef.current();
            }
            return;
          }

          // 2. Index Finger Pointing -> Raycaster Hover & Configurable Dwell Select
          if (indexUp && !middleUp && !ringUp && !pinkyUp) {
            prevWrist = null;
            targetZoomDist = null;
            const vp = bridge.getViewportElement();
            if (vp && bridge.camera) {
              const rect = vp.getBoundingClientRect();
              const mirroredX = 1 - lms[8].x;
              const yNorm = lms[8].y;
              ndc.set(mirroredX * 2 - 1, -(yNorm * 2 - 1));

              raycaster.setFromCamera(ndc, bridge.camera);
              const meshes = bridge.getInteractiveMeshes().filter((m) => m.visible);
              const hits = raycaster.intersectObjects(meshes, false);
              const hitKey = (hits[0]?.object?.userData?.structKey as string | undefined) ?? null;

              const px = mirroredX * rect.width;
              const py = yNorm * rect.height;
              const dwellMs = settings.dwellTimeSec * 1000;

              if (hitKey) {
                hoverRef.current(hitKey);
                if (dwellTargetKey !== hitKey) {
                  dwellTargetKey = hitKey;
                  dwellStartTime = now;
                }
                const progress = (now - dwellStartTime) / dwellMs;
                updateDwellCursor(true, px, py, progress);
                setGestureLabel(`Point · ${hitKey} (${Math.min(100, Math.round(progress * 100))}%)`);
                if (progress >= 1.0) {
                  selectRef.current(hitKey, false);
                  dwellStartTime = now + 600;
                }
              } else {
                hoverRef.current(null);
                dwellTargetKey = null;
                updateDwellCursor(true, px, py, 0);
                setGestureLabel(`Point · Aim (${measuredFps} FPS)`);
              }
            }
            return;
          }

          dwellTargetKey = null;
          updateDwellCursor(false);

          // 3. Thumb–Index Pinch (#4 - #8) -> Zoom scaled by zoomSpeed
          const normalizedPinch = pinchDist / palmScale;
          if (normalizedPinch < 1.15 && (!middleUp || !ringUp)) {
            prevWrist = null;
            if (bridge.controls) {
              const span = bridge.controls.maxDistance - bridge.controls.minDistance;
              const norm = THREE.MathUtils.clamp((normalizedPinch - 0.18) / (1.1 - 0.18), 0, 1);
              const target =
                bridge.controls.maxDistance - norm * span * THREE.MathUtils.clamp(settings.zoomSpeed, 0.4, 2.0);
              targetZoomDist = THREE.MathUtils.clamp(
                target,
                bridge.controls.minDistance,
                bridge.controls.maxDistance
              );
            }
            setGestureLabel(`Pinch Zoom (${measuredFps} FPS)`);
            return;
          }

          // 4. Open Palm Movement -> Deadzone-filtered Orbit Rotation
          targetZoomDist = null;
          const wrist = lms[0];
          if (prevWrist) {
            const rawDx = wrist.x - prevWrist.x;
            const rawDy = wrist.y - prevWrist.y;
            const dx = Math.abs(rawDx) > settings.deadzone ? rawDx : 0;
            const dy = Math.abs(rawDy) > settings.deadzone ? rawDy : 0;
            if (dx !== 0 || dy !== 0) {
              // Mirrored X direction feels natural when facing the webcam
              targetAzimuthVel += -dx * 4.2 * settings.orbitSpeed;
              targetPolarVel += dy * 2.6 * settings.orbitSpeed;
            }
          }
          prevWrist = { x: wrist.x, y: wrist.y };
          setGestureLabel(`Palm Orbit (${measuredFps} FPS)`);
        };

        rafId = requestAnimationFrame(tick);
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Unable to start webcam hand control';
          console.warn('[HandTrack] Error:', msg);
          setErrorBanner(msg);
          setGestureLabel('Camera unavailable');
          setHandStatusText('Camera unavailable');
        }
      }
    }

    void startTracking();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (handLandmarker) {
        handLandmarker.close();
      }
      updateDwellCursor(false);
      setErrorBanner(null);
      setHandStatusText('Hand Control Off');
    };
  }, [handControlEnabled, sceneBridgeRef, setHandStatusText]);

  if (!handControlEnabled) return null;

  return (
    <>
      <video ref={videoRef} playsInline muted style={{ display: 'none' }} />

      {/* Circular SVG Dwell-Selection Cursor */}
      <div
        ref={dwellCursorRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          pointerEvents: 'none',
          zIndex: 25,
          opacity: 0,
        }}
      >
        <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(56,189,248,0.25)" strokeWidth="3" />
          <circle
            ref={dwellRingRef}
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
          />
          <circle cx="18" cy="18" r="3" fill="#f43f5e" />
        </svg>
      </div>

      {/* Picture-in-Picture Mirror-Flipped Hand Skeleton Overlay */}
      <div
        className="pip-hand-card"
        aria-label="Hand Gesture Tracking Preview"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span className="pip-title">
            <HandSvg size={11} color="#38bdf8" />
            <span>HAND TRACK</span>
          </span>
          <button
            type="button"
            className="hud-icon-btn"
            style={{ width: 20, height: 20 }}
            onClick={() => setHandControlEnabled(false)}
            title="Disable Hand Control & Release Webcam"
            aria-label="Disable Hand Control"
          >
            <CloseSvg size={10} />
          </button>
        </div>

        <canvas
          ref={pipCanvasRef}
          width={176}
          height={118}
          className="pip-canvas"
        />

        <div className="mono-meta" style={{ color: errorBanner ? '#fb7185' : '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {errorBanner || gestureLabel}
        </div>
      </div>
    </>
  );
};
