import React, { useState, useRef, useEffect } from 'react';
import { useAnatomy } from '../../interaction/AnatomyContext';
import {
  COURSE_CHAPTERS,
  structuresFor,
  type NcertGrade,
  type TopLayerId,
} from '../../data/curriculum';
import {
  ArterySvg,
  BrandLogoSvg,
  InfoSvg,
  MuscleSvg,
  NerveSvg,
  OrganSvg,
  SearchSvg,
  SkeletonSvg,
  SkinSvg,
  VeinSvg,
} from './AnatomyIcons';

const SYSTEM_TOGGLES: {
  id: TopLayerId;
  label: string;
  renderIcon: (active: boolean) => React.ReactNode;
}[] = [
  { id: 'skin', label: 'Skin', renderIcon: (a) => <SkinSvg color={a ? '#38bdf8' : 'currentColor'} /> },
  { id: 'skeleton', label: 'Skeleton', renderIcon: (a) => <SkeletonSvg color={a ? '#e7dfd0' : 'currentColor'} /> },
  { id: 'muscles', label: 'Muscles', renderIcon: (a) => <MuscleSvg color={a ? '#d45d5d' : 'currentColor'} /> },
  { id: 'organs', label: 'Organs', renderIcon: (a) => <OrganSvg color={a ? '#fbbf24' : 'currentColor'} /> },
  { id: 'arteries', label: 'Arteries', renderIcon: () => <ArterySvg color="#ef4444" /> },
  { id: 'veins', label: 'Veins', renderIcon: () => <VeinSvg color="#3b82f6" /> },
  { id: 'nerves', label: 'Nerves', renderIcon: (a) => <NerveSvg color={a ? '#f472b6' : 'currentColor'} /> },
];

export const TopMinimalHeader: React.FC = () => {
  const {
    sex,
    setSex,
    visibleLayers,
    toggleLayer,
    ncertFilter,
    setNcertFilter,
    activeChapterId,
    setActiveChapterId,
    selectStructure,
    perfStats,
    setAttributionOpen,
  } = useAnatomy();

  const [showSyllabusPopover, setShowSyllabusPopover] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSyllabusPopover) return;
    const onOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowSyllabusPopover(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [showSyllabusPopover]);

  const filteredChapters = COURSE_CHAPTERS.filter((ch) =>
    ncertFilter === 'ALL' ? true : ch.ncertGrade === ncertFilter
  );

  const searchMatches = searchQuery.trim()
    ? structuresFor(sex)
        .filter((s) => s.system !== 'joints')
        .filter(
          (s) =>
            s.label.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
            s.key.toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
        .slice(0, 8)
    : [];

  return (
    <header className="minimal-topbar">
      {/* Brand + NCERT Filter Pill */}
      <div className="minimal-topbar-group">
        <div className="minimal-brand">
          <span className="minimal-logo">
            <BrandLogoSvg size={16} />
          </span>
          <span className="minimal-brand-name">Inside the Human Body</span>
        </div>

        {/* Class 11 / Class 12 NCERT Filter Pill */}
        <div className="segmented-pill" role="group" aria-label="NCERT Class Filter">
          {(['ALL', 'Class 11', 'Class 12'] as ('ALL' | NcertGrade)[]).map((grade) => {
            const active = ncertFilter === grade;
            return (
              <button
                key={grade}
                type="button"
                className={`pill-tab ${active ? 'is-active' : ''}`}
                onClick={() => {
                  setNcertFilter(grade);
                  setShowSyllabusPopover(true);
                }}
              >
                {grade === 'ALL' ? 'All NCERT' : grade}
              </button>
            );
          })}
        </div>

        {/* Compact Chapter & Structure Finder Popover */}
        <div ref={popoverRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="hud-btn"
            onClick={() => setShowSyllabusPopover((v) => !v)}
            aria-expanded={showSyllabusPopover}
          >
            <SearchSvg size={12} />
            <span>Syllabus &amp; Find</span>
          </button>

          {showSyllabusPopover && (
            <div className="glass-popover" style={{ left: 0, right: 'auto', width: 320 }}>
              <div className="search-field">
                <SearchSvg size={12} color="#64748b" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Jump to organ, bone, artery, vein..."
                  aria-label="Search anatomical structures"
                />
              </div>

              {searchMatches.length > 0 ? (
                <div className="popover-list">
                  {searchMatches.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      className="popover-row"
                      onClick={() => {
                        selectStructure(m.key, true);
                        setShowSyllabusPopover(false);
                      }}
                    >
                      <span>{m.label}</span>
                      <span className="mono-meta">{m.system}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="popover-list">
                  {filteredChapters.map((ch) => {
                    const isCur = ch.id === activeChapterId;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        className={`popover-row ${isCur ? 'is-active' : ''}`}
                        onClick={() => {
                          setActiveChapterId(ch.id);
                          setShowSyllabusPopover(false);
                        }}
                      >
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{ch.title}</div>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>
                            {ch.ncertRef.unitTitle} · {ch.ncertRef.pageRef}
                          </div>
                        </div>
                        <span className="grade-chip">{ch.ncertGrade}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Compact System Layer Toggles */}
      <nav className="minimal-system-bar" aria-label="Anatomical System Toggles">
        {SYSTEM_TOGGLES.map((sys) => {
          const active = visibleLayers[sys.id];
          return (
            <button
              key={sys.id}
              type="button"
              className={`sys-pill ${active ? 'is-active' : ''}`}
              onClick={() => toggleLayer(sys.id)}
              aria-pressed={active}
              title={`Toggle ${sys.label}`}
            >
              {sys.renderIcon(active)}
              <span>{sys.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Sex Switcher + Telemetry + Attribution */}
      <div className="minimal-topbar-group">
        <div className="segmented-pill" role="group" aria-label="Anatomical Model Sex">
          <button
            type="button"
            className={`pill-tab ${sex === 'male' ? 'is-active' : ''}`}
            onClick={() => setSex('male')}
          >
            Male
          </button>
          <button
            type="button"
            className={`pill-tab ${sex === 'female' ? 'is-active' : ''}`}
            onClick={() => setSex('female')}
          >
            Female
          </button>
        </div>

        <span className="fps-chip" title={`Triangles: ${perfStats.triangles.toLocaleString()}`}>
          {perfStats.fps} FPS
        </span>

        <button
          type="button"
          className="hud-icon-btn"
          onClick={() => setAttributionOpen(true)}
          title="Model Attribution (CC BY 4.0)"
          aria-label="Model Attribution"
        >
          <InfoSvg size={13} />
        </button>
      </div>
    </header>
  );
};
