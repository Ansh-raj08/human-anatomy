import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HandSensitivitySettings {
  orbitSpeed: number;   // 0.2x - 3.0x (default 1.2)
  zoomSpeed: number;    // 0.2x - 3.0x (default 1.0)
  smoothing: number;    // 0.05 - 0.50 (default 0.15)
  deadzone: number;     // 0.01 - 0.10 (default 0.03)
  dwellTimeSec: number; // 0.4s - 2.0s (default 1.0)
}

interface HandSettingsStore extends HandSensitivitySettings {
  setOrbitSpeed: (val: number) => void;
  setZoomSpeed: (val: number) => void;
  setSmoothing: (val: number) => void;
  setDeadzone: (val: number) => void;
  setDwellTimeSec: (val: number) => void;
  resetDefaults: () => void;
}

const DEFAULTS: HandSensitivitySettings = {
  orbitSpeed: 1.2,
  zoomSpeed: 1.0,
  smoothing: 0.15,
  deadzone: 0.03,
  dwellTimeSec: 1.0,
};

export const useHandSettingsStore = create<HandSettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setOrbitSpeed: (orbitSpeed) => set({ orbitSpeed }),
      setZoomSpeed: (zoomSpeed) => set({ zoomSpeed }),
      setSmoothing: (smoothing) => set({ smoothing }),
      setDeadzone: (deadzone) => set({ deadzone }),
      setDwellTimeSec: (dwellTimeSec) => set({ dwellTimeSec }),
      resetDefaults: () => set(DEFAULTS),
    }),
    { name: 'anatomy-hand-sensitivity-v1' }
  )
);
