import React from 'react';

interface SvgProps {
  size?: number;
  color?: string;
}

export const BrandLogoSvg: React.FC<SvgProps> = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="5" r="2.2" />
    <path d="M8 9.5c0-1 .8-1.5 4-1.5s4 .5 4 1.5l1 5.5h-2l-.6 6.5h-4.8L9 15H7l1-5.5z" />
    <path d="M12 10v5" stroke="#38bdf8" strokeWidth="1.4" />
  </svg>
);

export const SkinSvg: React.FC<SvgProps> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" aria-hidden="true">
    <path d="M8 1.5C5.5 3.5 3 6.2 3 9.2a5 5 0 0 0 10 0c0-3-2.5-5.7-5-7.7z" strokeDasharray="2 1.5" />
  </svg>
);

export const SkeletonSvg: React.FC<SvgProps> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <circle cx="5" cy="3.5" r="1.4" />
    <circle cx="11" cy="3.5" r="1.4" />
    <path d="M6 4.5l4 7" />
    <circle cx="5" cy="12.5" r="1.4" />
    <circle cx="11" cy="12.5" r="1.4" />
  </svg>
);

export const MuscleSvg: React.FC<SvgProps> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="M2.5 8c2.2-3.5 8.8-3.5 11 0-2.2 3.5-8.8 3.5-11 0z" />
    <path d="M4.5 8h7" strokeOpacity="0.65" />
  </svg>
);

export const OrganSvg: React.FC<SvgProps> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 13.5S2.5 10 2.5 6.1A3.1 3.1 0 0 1 8 4.2a3.1 3.1 0 0 1 5.5 1.9C13.5 10 8 13.5 8 13.5z" />
  </svg>
);

export const ArterySvg: React.FC<SvgProps> = ({ size = 13, color = '#ef4444' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
    <path d="M8 14V7m0 0L4 3m4 4l4-4" />
    <circle cx="8" cy="7" r="1.5" fill={color} stroke="none" />
  </svg>
);

export const VeinSvg: React.FC<SvgProps> = ({ size = 13, color = '#3b82f6' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
    <path d="M8 2v7m0 0l-4 4m4-4l4 4" />
    <circle cx="8" cy="9" r="1.5" fill={color} stroke="none" />
  </svg>
);

export const NerveSvg: React.FC<SvgProps> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 8h3l1.8-4 2.4 8L11 8h3" />
  </svg>
);

export const XraySvg: React.FC<SvgProps> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <rect x="2.5" y="2.5" width="11" height="11" rx="2" />
    <path d="M8 4.5v7M5.5 7h5M6 10h4" />
  </svg>
);

export const PinSvg: React.FC<SvgProps> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" aria-hidden="true">
    <path d="M8 14s4-4.2 4-7.3a4 4 0 1 0-8 0C4 9.8 8 14 8 14z" />
    <circle cx="8" cy="6.7" r="1.3" fill={color} stroke="none" />
  </svg>
);

export const ResetSvg: React.FC<SvgProps> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 7a5 5 0 1 1 1.4 3.5" />
    <path d="M3 3.5V7h3.5" />
  </svg>
);

export const HandSvg: React.FC<SvgProps> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 8V3.5a.8.8 0 0 1 1.6 0V7m0-4.2a.8.8 0 0 1 1.6 0V7m0-3.7a.8.8 0 0 1 1.6 0V8m0-3.2a.8.8 0 0 1 1.6 0v4.7c0 2.5-1.5 4.2-3.8 4.2-1.8 0-3.2-1-4-2.7L2.6 8.5a.9.9 0 0 1 1.5-.9L5 8.8" />
  </svg>
);

export const SlidersSvg: React.FC<SvgProps> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
    <circle cx="6" cy="4.5" r="1.5" fill="#0d121e" />
    <circle cx="10.5" cy="8" r="1.5" fill="#0d121e" />
    <circle cx="5" cy="11.5" r="1.5" fill="#0d121e" />
  </svg>
);

export const BookExternalSvg: React.FC<SvgProps> = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.5 3.5h4a1.5 1.5 0 0 1 1.5 1.5v8.5a1.2 1.2 0 0 0-1.2-1.2H2.5V3.5z" />
    <path d="M13.5 3.5h-4A1.5 1.5 0 0 0 8 5v8.5a1.2 1.2 0 0 1 1.2-1.2h4.3V3.5z" />
  </svg>
);

export const ArrowExternalSvg: React.FC<SvgProps> = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 3.5h6.5V10M12.5 3.5l-7 7" />
  </svg>
);

export const FocusSvg: React.FC<SvgProps> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <circle cx="8" cy="8" r="4.5" />
    <circle cx="8" cy="8" r="1.2" fill={color} stroke="none" />
    <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2" />
  </svg>
);

export const CloseSvg: React.FC<SvgProps> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);

export const SearchSvg: React.FC<SvgProps> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <circle cx="7" cy="7" r="4.2" />
    <path d="M10.2 10.2L13.5 13.5" />
  </svg>
);

export const ZoomOutSvg: React.FC<SvgProps> = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
    <path d="M3.5 8h9" />
  </svg>
);

export const ZoomInSvg: React.FC<SvgProps> = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
    <path d="M3.5 8h9M8 3.5v9" />
  </svg>
);

export const InfoSvg: React.FC<SvgProps> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <circle cx="8" cy="8" r="6" />
    <path d="M8 7.2v4M8 5h.01" />
  </svg>
);
