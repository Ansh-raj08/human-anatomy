import React from 'react';
import { useAnatomy } from '../interaction/AnatomyContext';

export const AccessibilityLiveRegion: React.FC = () => {
  const { liveAnnouncement } = useAnatomy();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {liveAnnouncement}
    </div>
  );
};
