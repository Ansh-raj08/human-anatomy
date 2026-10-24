import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { AnatomicalStructure, AnatomicalSystemId } from '../anatomy/types';
import { ANATOMY_REGISTRY, ANATOMICAL_SYSTEMS } from '../anatomy/registry';

export type CameraPreset = 'default' | 'anterior' | 'posterior' | 'left_lateral' | 'right_lateral' | 'thorax' | 'forearm' | 'cranial';

export interface ClippingConfig {
  enabled: boolean;
  axis: 'x' | 'y' | 'z';
  position: number;
  negate: boolean;
}

export interface PerformanceStats {
  fps: number;
  drawCalls: number;
  triangles: number;
  resolutionScale: number;
  isLowPerformance: boolean;
  contextLost: boolean;
}

interface AnatomyContextValue {
  // Selection
  selectedStructureId: string | null;
  hoveredStructureId: string | null;
  selectedStructure: AnatomicalStructure | null;
  selectStructure: (id: string | null) => void;
  setHoveredStructure: (id: string | null) => void;
  clearSelection: () => void;

  // System visibility
  systemVisibility: Record<AnatomicalSystemId, boolean>;
  setSystemVisibility: (systemId: AnatomicalSystemId, visible: boolean) => void;
  toggleSystemVisibility: (systemId: AnatomicalSystemId) => void;
  isolateSystem: (systemId: AnatomicalSystemId) => void;
  restoreAllSystems: () => void;

  // Camera & view controls
  cameraPreset: CameraPreset;
  setCameraPreset: (preset: CameraPreset) => void;
  cameraFocusTarget: [number, number, number] | null;
  cameraDistance: number;
  focusStructure: (id: string) => void;
  resetCamera: () => void;

  // Clipping / Cutaway
  clipping: ClippingConfig;
  setClipping: React.Dispatch<React.SetStateAction<ClippingConfig>>;
  resetClipping: () => void;

  // Performance & Quality adaptation
  perfStats: PerformanceStats;
  updatePerfStats: (stats: Partial<PerformanceStats>) => void;
  setContextLost: (lost: boolean) => void;

  // Accessibility
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;
  liveAnnouncement: string;
  announce: (message: string) => void;
}

const AnatomyContext = createContext<AnatomyContextValue | null>(null);

const DEFAULT_VISIBILITY: Record<AnatomicalSystemId, boolean> = {
  skeletal: true,
  circulatory: true,
  respiratory: true,
  digestive: true,
  urinary: true,
  nervous: true,
  integumentary: true,
};

export const AnatomyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>('circ_right_atrium');
  const [hoveredStructureId, setHoveredStructureId] = useState<string | null>(null);
  const [systemVisibility, setSystemVisibilityState] = useState<Record<AnatomicalSystemId, boolean>>(DEFAULT_VISIBILITY);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('default');
  const [cameraFocusTarget, setCameraFocusTarget] = useState<[number, number, number] | null>([0, 2.0, 0]);
  const [cameraDistance, setCameraDistance] = useState<number>(4.2);

  const [clipping, setClipping] = useState<ClippingConfig>({
    enabled: false,
    axis: 'z',
    position: 0.35,
    negate: false,
  });

  const [perfStats, setPerfStats] = useState<PerformanceStats>({
    fps: 60,
    drawCalls: 32,
    triangles: 42500,
    resolutionScale: 1.0,
    isLowPerformance: false,
    contextLost: false,
  });

  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('Welcome to Inside the Human Body 3D Explorer.');

  const announce = useCallback((message: string) => {
    setLiveAnnouncement(message);
  }, []);

  const selectStructure = useCallback((id: string | null) => {
    setSelectedStructureId(id);
    if (id && ANATOMY_REGISTRY[id]) {
      const struct = ANATOMY_REGISTRY[id];
      setCameraFocusTarget(struct.cameraFocus.target);
      setCameraDistance(struct.cameraFocus.distance);
      announce(`Selected ${struct.displayName}. ${struct.shortDescription}`);
    } else {
      announce('Selection cleared');
    }
  }, [announce]);

  const setHoveredStructure = useCallback((id: string | null) => {
    setHoveredStructureId(id);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedStructureId(null);
    announce('Selection cleared');
  }, [announce]);

  const setSystemVisibility = useCallback((systemId: AnatomicalSystemId, visible: boolean) => {
    setSystemVisibilityState(prev => ({ ...prev, [systemId]: visible }));
    announce(`${ANATOMICAL_SYSTEMS[systemId].displayName} ${visible ? 'shown' : 'hidden'}`);
  }, [announce]);

  const toggleSystemVisibility = useCallback((systemId: AnatomicalSystemId) => {
    setSystemVisibilityState(prev => {
      const next = !prev[systemId];
      announce(`${ANATOMICAL_SYSTEMS[systemId].displayName} ${next ? 'shown' : 'hidden'}`);
      return { ...prev, [systemId]: next };
    });
  }, [announce]);

  const isolateSystem = useCallback((systemId: AnatomicalSystemId) => {
    setSystemVisibilityState({
      skeletal: systemId === 'skeletal',
      circulatory: systemId === 'circulatory',
      respiratory: systemId === 'respiratory',
      digestive: systemId === 'digestive',
      urinary: systemId === 'urinary',
      nervous: systemId === 'nervous',
      integumentary: false,
    });
    announce(`Isolated ${ANATOMICAL_SYSTEMS[systemId].displayName}`);
  }, [announce]);

  const restoreAllSystems = useCallback(() => {
    setSystemVisibilityState(DEFAULT_VISIBILITY);
    announce('All anatomical systems restored');
  }, [announce]);

  const focusStructure = useCallback((id: string) => {
    const struct = ANATOMY_REGISTRY[id];
    if (struct) {
      setSelectedStructureId(id);
      setCameraFocusTarget(struct.cameraFocus.target);
      setCameraDistance(struct.cameraFocus.distance);
      announce(`Focused camera on ${struct.displayName}`);
    }
  }, [announce]);

  const resetCamera = useCallback(() => {
    setCameraPreset('default');
    setCameraFocusTarget([0, 1.2, 0]);
    setCameraDistance(5.2);
    announce('Camera reset to default whole body view');
  }, [announce]);

  const resetClipping = useCallback(() => {
    setClipping({
      enabled: false,
      axis: 'z',
      position: 0.35,
      negate: false,
    });
    announce('Dissection cutaway plane reset');
  }, [announce]);

  const updatePerfStats = useCallback((stats: Partial<PerformanceStats>) => {
    setPerfStats(prev => ({ ...prev, ...stats }));
  }, []);

  const setContextLost = useCallback((lost: boolean) => {
    setPerfStats(prev => ({ ...prev, contextLost: lost }));
    if (lost) {
      announce('Warning: WebGL context lost. Pausing 3D rendering pipeline.');
    } else {
      announce('WebGL context restored successfully.');
    }
  }, [announce]);

  // Check user OS reduced motion preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (media.matches) {
        setReducedMotion(true);
      }
    }
  }, []);

  const selectedStructure = useMemo(() => {
    return selectedStructureId ? ANATOMY_REGISTRY[selectedStructureId] || null : null;
  }, [selectedStructureId]);

  const value = useMemo<AnatomyContextValue>(() => ({
    selectedStructureId,
    hoveredStructureId,
    selectedStructure,
    selectStructure,
    setHoveredStructure,
    clearSelection,
    systemVisibility,
    setSystemVisibility,
    toggleSystemVisibility,
    isolateSystem,
    restoreAllSystems,
    cameraPreset,
    setCameraPreset,
    cameraFocusTarget,
    cameraDistance,
    focusStructure,
    resetCamera,
    clipping,
    setClipping,
    resetClipping,
    perfStats,
    updatePerfStats,
    setContextLost,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    liveAnnouncement,
    announce,
  }), [
    selectedStructureId,
    hoveredStructureId,
    selectedStructure,
    selectStructure,
    setHoveredStructure,
    clearSelection,
    systemVisibility,
    setSystemVisibility,
    toggleSystemVisibility,
    isolateSystem,
    restoreAllSystems,
    cameraPreset,
    cameraFocusTarget,
    cameraDistance,
    focusStructure,
    resetCamera,
    clipping,
    resetClipping,
    perfStats,
    updatePerfStats,
    setContextLost,
    highContrast,
    reducedMotion,
    liveAnnouncement,
    announce,
  ]);

  return (
    <AnatomyContext.Provider value={value}>
      {children}
    </AnatomyContext.Provider>
  );
};

export const useAnatomy = (): AnatomyContextValue => {
  const context = useContext(AnatomyContext);
  if (!context) {
    throw new Error('useAnatomy must be used within an AnatomyProvider');
  }
  return context;
};
