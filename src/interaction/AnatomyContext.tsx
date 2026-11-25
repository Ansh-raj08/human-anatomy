import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  ANATOMY_BY_KEY,
  COURSE_CHAPTERS,
  OPTIONAL_EXTENSION_MODELS,
  type AnatomySex,
  type NcertGrade,
  type TopLayerId,
} from '../data/curriculum';
import type { MuscleBifurcationGroup } from '../utils/anatomyClassifier';

export type CameraPreset = 'default' | 'anterior' | 'posterior' | 'left_lateral' | 'right_lateral' | 'thorax' | 'cranial';

export interface PinProjection {
  key: string;
  label: string;
  color: string;
  x: number;
  y: number;
  visible: boolean;
}

export interface ExtensionAssetStatus {
  id: string;
  filename: string;
  label: string;
  status: 'checking' | 'loaded' | 'pending' | 'error';
  meshCount?: number;
  withinSkin?: boolean;
  boxSummary?: string;
}

export interface PerformanceStats {
  fps: number;
  drawCalls: number;
  triangles: number;
  contextLost: boolean;
}

interface AnatomyContextValue {
  sex: AnatomySex;
  setSex: (sex: AnatomySex) => void;
  selectedKey: string | null;
  hoveredKey: string | null;
  selectStructure: (key: string | null, focusCamera?: boolean) => void;
  setHoveredStructure: (key: string | null) => void;

  // Strict Top-Level Layer Toggles (with zero cross-system leaks)
  visibleLayers: Record<TopLayerId, boolean>;
  toggleLayer: (layer: TopLayerId) => void;
  muscleGroupVisibility: Record<MuscleBifurcationGroup, boolean>;
  toggleMuscleGroup: (group: MuscleBifurcationGroup) => void;
  xrayMode: boolean;
  setXrayMode: (enabled: boolean) => void;
  toggleXrayOrSkeletonIsolation: () => void;
  showPins: boolean;
  setShowPins: (show: boolean) => void;
  resetLayers: () => void;

  // NCERT Filter & Chapter Context
  ncertFilter: 'ALL' | NcertGrade;
  setNcertFilter: (filter: 'ALL' | NcertGrade) => void;
  activeChapterId: string;
  setActiveChapterId: (id: string) => void;

  // Drop-In Extension Status
  extensionStatuses: Record<string, ExtensionAssetStatus>;
  setExtensionStatus: (id: string, update: Partial<ExtensionAssetStatus>) => void;

  // Hand Gesture Control
  handControlEnabled: boolean;
  setHandControlEnabled: (enabled: boolean) => void;
  handStatusText: string;
  setHandStatusText: (text: string) => void;

  // Camera & Zoom
  cameraPreset: CameraPreset;
  setCameraPreset: (preset: CameraPreset) => void;
  cameraFocusKey: string | null;
  cameraRequestNonce: number;
  zoomPercent: number;
  setZoomPercent: (pct: number) => void;
  zoomRequestDelta: number;
  zoomRequestNonce: number;
  triggerZoom: (delta: number) => void;
  focusStructure: (key: string) => void;
  resetCamera: () => void;

  // Diagnostics & Attribution
  perfStats: PerformanceStats;
  updatePerfStats: (stats: Partial<PerformanceStats>) => void;
  setContextLost: (lost: boolean) => void;
  isAttributionOpen: boolean;
  setAttributionOpen: (open: boolean) => void;
  liveAnnouncement: string;
}

const DEFAULT_VISIBLE_LAYERS: Record<TopLayerId, boolean> = {
  skin: true,
  skeleton: true,
  muscles: true,
  organs: true,
  arteries: true,
  veins: true,
  nerves: false,
};

const DEFAULT_MUSCLE_GROUPS: Record<MuscleBifurcationGroup, boolean> = {
  axial_head_neck: true,
  thoracic_abdominal: true,
  upper_limb: true,
  lower_limb: true,
  cardiac_visceral: true,
};

const INITIAL_EXTENSION_STATUSES: Record<string, ExtensionAssetStatus> = Object.fromEntries(
  OPTIONAL_EXTENSION_MODELS.map((m) => [
    m.id,
    { id: m.id, filename: m.filename, label: m.label, status: 'checking' },
  ])
);

const AnatomyContext = createContext<AnatomyContextValue | null>(null);

export const AnatomyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sex, setSex] = useState<AnatomySex>('male');
  const [selectedKey, setSelectedKey] = useState<string | null>('heart');
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const [visibleLayers, setVisibleLayers] = useState<Record<TopLayerId, boolean>>(DEFAULT_VISIBLE_LAYERS);
  const [muscleGroupVisibility, setMuscleGroupVisibility] = useState<Record<MuscleBifurcationGroup, boolean>>(DEFAULT_MUSCLE_GROUPS);
  const [xrayMode, setXrayMode] = useState<boolean>(true);
  const [showPins, setShowPins] = useState<boolean>(true);

  const [ncertFilter, setNcertFilter] = useState<'ALL' | NcertGrade>('ALL');
  const [activeChapterId, setActiveChapterIdState] = useState<string>('ch-2');

  const [extensionStatuses, setExtensionStatuses] = useState<Record<string, ExtensionAssetStatus>>(INITIAL_EXTENSION_STATUSES);

  const [handControlEnabled, setHandControlEnabled] = useState<boolean>(false);
  const [handStatusText, setHandStatusText] = useState<string>('Hand Control Off');

  const [cameraPreset, setCameraPresetState] = useState<CameraPreset>('default');
  const [cameraFocusKey, setCameraFocusKey] = useState<string | null>('heart');
  const [cameraRequestNonce, setCameraRequestNonce] = useState<number>(0);
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [zoomRequestDelta, setZoomRequestDelta] = useState<number>(0);
  const [zoomRequestNonce, setZoomRequestNonce] = useState<number>(0);

  const [perfStats, setPerfStats] = useState<PerformanceStats>({
    fps: 60,
    drawCalls: 0,
    triangles: 0,
    contextLost: false,
  });
  const [isAttributionOpen, setAttributionOpen] = useState<boolean>(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('3D Anatomy Lab ready.');

  const selectStructure = useCallback((key: string | null, shouldFocus = false) => {
    setSelectedKey(key);
    if (key && ANATOMY_BY_KEY[key]) {
      setLiveAnnouncement(`Selected ${ANATOMY_BY_KEY[key].label}`);
      if (shouldFocus) {
        setCameraFocusKey(key);
        setCameraRequestNonce((n) => n + 1);
      }
    } else if (key) {
      setLiveAnnouncement(`Selected ${key}`);
      if (shouldFocus) {
        setCameraFocusKey(key);
        setCameraRequestNonce((n) => n + 1);
      }
    } else {
      setLiveAnnouncement('Selection cleared');
    }
  }, []);

  const setHoveredStructure = useCallback((key: string | null) => {
    setHoveredKey(key);
  }, []);

  const toggleLayer = useCallback((layer: TopLayerId) => {
    setVisibleLayers((prev) => {
      const next = !prev[layer];
      setLiveAnnouncement(`${layer} layer ${next ? 'visible' : 'hidden'}`);
      return { ...prev, [layer]: next };
    });
  }, []);

  const toggleMuscleGroup = useCallback((group: MuscleBifurcationGroup) => {
    setMuscleGroupVisibility((prev) => ({ ...prev, [group]: !prev[group] }));
  }, []);

  const toggleXrayOrSkeletonIsolation = useCallback(() => {
    setXrayMode((prev) => {
      const next = !prev;
      setVisibleLayers((layers) => ({
        ...layers,
        skin: next,
        skeleton: true,
        muscles: next,
      }));
      return next;
    });
  }, []);

  const resetLayers = useCallback(() => {
    setVisibleLayers(DEFAULT_VISIBLE_LAYERS);
    setMuscleGroupVisibility(DEFAULT_MUSCLE_GROUPS);
    setXrayMode(true);
    setShowPins(true);
    setLiveAnnouncement('Layers reset');
  }, []);

  const setActiveChapterId = useCallback((id: string) => {
    setActiveChapterIdState(id);
    const ch = COURSE_CHAPTERS.find((c) => c.id === id);
    if (!ch) return;
    if (ch.recommendedSex) setSex(ch.recommendedSex);
    setVisibleLayers({
      skin: ch.layers.includes('skin'),
      skeleton: ch.layers.includes('skeleton'),
      muscles: ch.layers.includes('muscles'),
      organs: ch.layers.includes('organs'),
      arteries: ch.layers.includes('arteries'),
      veins: ch.layers.includes('veins'),
      nerves: ch.layers.includes('nerves'),
    });
    setSelectedKey(ch.defaultFocusKey);
    setCameraFocusKey(ch.defaultFocusKey);
    setCameraRequestNonce((n) => n + 1);
    setLiveAnnouncement(`Opened ${ch.title}`);
  }, []);

  const setExtensionStatus = useCallback((id: string, update: Partial<ExtensionAssetStatus>) => {
    setExtensionStatuses((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      return { ...prev, [id]: { ...existing, ...update } };
    });
  }, []);

  const setCameraPreset = useCallback((preset: CameraPreset) => {
    setCameraPresetState(preset);
    setCameraFocusKey(null);
    setCameraRequestNonce((n) => n + 1);
  }, []);

  const focusStructure = useCallback((key: string) => {
    setSelectedKey(key);
    setCameraFocusKey(key);
    setCameraRequestNonce((n) => n + 1);
  }, []);

  const resetCamera = useCallback(() => {
    setCameraPresetState('default');
    setCameraFocusKey(null);
    setCameraRequestNonce((n) => n + 1);
    setZoomPercent(100);
  }, []);

  const triggerZoom = useCallback((delta: number) => {
    setZoomRequestDelta(delta);
    setZoomRequestNonce((n) => n + 1);
  }, []);

  const updatePerfStats = useCallback((stats: Partial<PerformanceStats>) => {
    setPerfStats((prev) => ({ ...prev, ...stats }));
  }, []);

  const setContextLost = useCallback((lost: boolean) => {
    setPerfStats((prev) => ({ ...prev, contextLost: lost }));
  }, []);

  const value = useMemo<AnatomyContextValue>(
    () => ({
      sex,
      setSex,
      selectedKey,
      hoveredKey,
      selectStructure,
      setHoveredStructure,
      visibleLayers,
      toggleLayer,
      muscleGroupVisibility,
      toggleMuscleGroup,
      xrayMode,
      setXrayMode,
      toggleXrayOrSkeletonIsolation,
      showPins,
      setShowPins,
      resetLayers,
      ncertFilter,
      setNcertFilter,
      activeChapterId,
      setActiveChapterId,
      extensionStatuses,
      setExtensionStatus,
      handControlEnabled,
      setHandControlEnabled,
      handStatusText,
      setHandStatusText,
      cameraPreset,
      setCameraPreset,
      cameraFocusKey,
      cameraRequestNonce,
      zoomPercent,
      setZoomPercent,
      zoomRequestDelta,
      zoomRequestNonce,
      triggerZoom,
      focusStructure,
      resetCamera,
      perfStats,
      updatePerfStats,
      setContextLost,
      isAttributionOpen,
      setAttributionOpen,
      liveAnnouncement,
    }),
    [
      sex,
      selectedKey,
      hoveredKey,
      selectStructure,
      setHoveredStructure,
      visibleLayers,
      toggleLayer,
      muscleGroupVisibility,
      toggleMuscleGroup,
      xrayMode,
      toggleXrayOrSkeletonIsolation,
      showPins,
      resetLayers,
      ncertFilter,
      activeChapterId,
      setActiveChapterId,
      extensionStatuses,
      setExtensionStatus,
      handControlEnabled,
      handStatusText,
      cameraPreset,
      setCameraPreset,
      cameraFocusKey,
      cameraRequestNonce,
      zoomPercent,
      zoomRequestDelta,
      zoomRequestNonce,
      triggerZoom,
      focusStructure,
      resetCamera,
      perfStats,
      updatePerfStats,
      setContextLost,
      isAttributionOpen,
      liveAnnouncement,
    ]
  );

  return <AnatomyContext.Provider value={value}>{children}</AnatomyContext.Provider>;
};

export const useAnatomy = (): AnatomyContextValue => {
  const ctx = useContext(AnatomyContext);
  if (!ctx) throw new Error('useAnatomy must be used within AnatomyProvider');
  return ctx;
};
