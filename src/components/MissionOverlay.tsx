import React from 'react';
import {
  Heart,
  Bone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Trophy,
  Check,
  Compass,
} from 'lucide-react';
import { useMission } from '../missions/MissionContext';
import { CARDIAC_HIGHWAY_MISSION, APPENDICULAR_ASSEMBLY_MISSION } from '../missions/missionData';

export const MissionOverlay: React.FC = () => {
  const {
    activeMissionId,
    missionState,
    currentStepIndex,
    currentStep,
    hintTier,
    feedbackMessage,
    feedbackType,
    score,
    attempts,
    assemblyBones,
    selectedBoneToMove,
    setSelectedBoneToMove,
    moveBone,
    rotateBone,
    confirmBonePlacement,
    snapBoneToTarget,
    beginActiveExploration,
    requestNextHint,
    advanceToNextStep,
    restartMission,
    exitMission,
  } = useMission();

  if (!activeMissionId || missionState === 'NOT_STARTED') return null;

  // MISSION A: THE CARDIAC HIGHWAY
  if (activeMissionId === 'cardiac_highway') {
    // 1. INTRO MODAL
    if (missionState === 'INTRO') {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div className="glass-panel" style={{ maxWidth: 560, width: '100%', maxHeight: '88vh', overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid #ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                }}
              >
                <Heart size={24} />
              </div>
              <div>
                <span className="badge badge-rose">NCERT Class 11 • Chapter 18</span>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 0', color: '#f8fafc' }}>
                  The Cardiac Highway
                </h2>
              </div>
            </div>

            <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6 }}>
              {CARDIAC_HIGHWAY_MISSION.description}
            </p>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 10, padding: 14 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#38bdf8', marginBottom: 8 }}>
                Learning Objectives:
              </h3>
              <ul style={{ fontSize: 13, color: '#e2e8f0', paddingLeft: 18, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {CARDIAC_HIGHWAY_MISSION.learningObjectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
              <button className="btn btn-secondary" onClick={exitMission}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={beginActiveExploration}>
                <span>Begin Cardiac Highway</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 2. COMPLETED MODAL
    if (missionState === 'COMPLETED') {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div className="glass-panel" style={{ maxWidth: 540, width: '100%', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)',
              }}
            >
              <Trophy size={32} />
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#f8fafc' }}>
              Double Circulation Mastered!
            </h2>

            <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6 }}>
              You have accurately traced blood through all 14 checkpoints—from the Venae Cavae through pulmonary oxygenation, down the high-pressure left ventricle, and into systemic circulation!
            </p>

            <div className="badge badge-emerald" style={{ padding: '6px 16px', fontSize: 14 }}>
              Proficiency Score: {score}/100
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button className="btn btn-secondary" onClick={restartMission}>
                <RotateCcw size={15} />
                <span>Retrace Highway</span>
              </button>
              <button className="btn btn-primary" onClick={exitMission}>
                <Compass size={15} />
                <span>Return to Exploration</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 3. ACTIVE & STEP FEEDBACK HUD
    return (
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(92%, 820px)',
          zIndex: 25,
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Step Progress Tracker (14 checkpoints) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, overflowX: 'auto', paddingBottom: 4 }}>
          {CARDIAC_HIGHWAY_MISSION.steps?.map(s => {
            const isDone = s.stepIndex < currentStepIndex;
            const isCurrent = s.stepIndex === currentStepIndex;
            return (
              <div
                key={s.stepIndex}
                style={{
                  flex: 1,
                  minWidth: 20,
                  height: 6,
                  borderRadius: 3,
                  background: isDone
                    ? '#10b981'
                    : isCurrent
                    ? '#38bdf8'
                    : 'rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s',
                }}
                title={`Checkpoint ${s.stepIndex}: ${s.title}`}
              />
            );
          })}
        </div>

        {/* Current Checkpoint Header & Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge badge-cyan" style={{ fontSize: 12 }}>
              Checkpoint {currentStepIndex} of 14
            </span>
            <span className={currentStep?.isOxygenated ? 'badge badge-rose' : 'badge badge-cyan'}>
              {currentStep?.isOxygenated ? 'Oxygenated Blood (Red)' : 'Deoxygenated Blood (Blue)'}
            </span>
            <span className="badge badge-purple">
              {currentStep?.circuit === 'pulmonary' ? 'Pulmonary Circuit' : 'Systemic Circuit'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#94a3b8' }}>
            <span>Score: <strong style={{ color: '#38bdf8' }}>{score}</strong></span>
            <span>Attempts: {attempts}</span>
          </div>
        </div>

        {/* Challenge Prompt */}
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc', lineHeight: 1.4 }}>
          {currentStep?.learningPrompt}
        </div>

        {/* Progressive Hint Box */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', flex: 1 }}>
            {hintTier === 1 && `Tier 1 Concept: ${currentStep?.pedagogicalHintTier1}`}
            {hintTier === 2 && `Tier 2 Spatial: ${currentStep?.pedagogicalHintTier2}`}
            {hintTier === 3 && `Tier 3 Focus: ${currentStep?.pedagogicalHintTier3}`}
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={requestNextHint}
            title="Request progressive hint (Tier 1 -> Tier 2 -> Tier 3)"
            style={{ flexShrink: 0 }}
          >
            <HelpCircle size={13} color="#f59e0b" />
            <span>Hint ({hintTier}/3)</span>
          </button>
        </div>

        {/* Feedback Message Banner (if any) */}
        {feedbackMessage && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: feedbackType === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${feedbackType === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              color: feedbackType === 'success' ? '#6ee7b7' : '#fca5a5',
              fontSize: 13,
              lineHeight: 1.45,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {feedbackType === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{feedbackMessage}</span>
            </div>

            {missionState === 'STEP_FEEDBACK' && (
              <button className="btn btn-primary btn-sm" onClick={advanceToNextStep}>
                <span>Next Checkpoint</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // MISSION B: APPENDICULAR ASSEMBLY
  if (activeMissionId === 'appendicular_assembly') {
    // 1. INTRO
    if (missionState === 'INTRO') {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div className="glass-panel" style={{ maxWidth: 560, width: '100%', maxHeight: '88vh', overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid #f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24',
                }}
              >
                <Bone size={24} />
              </div>
              <div>
                <span className="badge badge-amber">NCERT Class 11 • Chapter 20</span>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 0', color: '#f8fafc' }}>
                  Appendicular Assembly: Forearm
                </h2>
              </div>
            </div>

            <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6 }}>
              {APPENDICULAR_ASSEMBLY_MISSION.description}
            </p>

            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 8, padding: '10px 14px' }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: '#f87171', margin: '0 0 4px' }}>
                CRITICAL ANATOMICAL RULE:
              </h4>
              <p style={{ fontSize: 12, color: '#fecaca', margin: 0, lineHeight: 1.45 }}>
                The <strong>Humerus</strong> is the upper-arm bone. The <strong>Radius</strong> and <strong>Ulna</strong> are the forearm bones. Never describe all three as forearm bones!
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
              <button className="btn btn-secondary" onClick={exitMission}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={beginActiveExploration}>
                <span>Begin Assembly</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 2. COMPLETED MODAL
    if (missionState === 'COMPLETED') {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div className="glass-panel" style={{ maxWidth: 540, width: '100%', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)',
              }}
            >
              <Trophy size={32} />
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#f8fafc' }}>
              Appendicular Limb Articulated!
            </h2>

            <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6 }}>
              You have successfully articulated the Right Forearm in canonical anatomical position! The Radius articulates laterally with the capitulum on the thumb side, and the Ulna articulates medially with the trochlea on the pinky side.
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button className="btn btn-secondary" onClick={restartMission}>
                <RotateCcw size={15} />
                <span>Disassemble & Retry</span>
              </button>
              <button className="btn btn-primary" onClick={exitMission}>
                <Compass size={15} />
                <span>Return to Exploration</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 3. ACTIVE ASSEMBLY CONTROLS HUD (with Full Accessible Step Controls)
    const activeBone = selectedBoneToMove ? assemblyBones[selectedBoneToMove] : null;

    return (
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(94%, 860px)',
          zIndex: 25,
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Bone Selection Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>Select Bone to Articulate:</span>
            <button
              className={`btn btn-sm ${selectedBoneToMove === 'bone_radius_r' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedBoneToMove('bone_radius_r')}
            >
              {assemblyBones.bone_radius_r.isPlaced ? <Check size={13} color="#10b981" /> : null}
              <span>Radius (Lateral / Thumb)</span>
            </button>
            <button
              className={`btn btn-sm ${selectedBoneToMove === 'bone_ulna_r' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedBoneToMove('bone_ulna_r')}
            >
              {assemblyBones.bone_ulna_r.isPlaced ? <Check size={13} color="#10b981" /> : null}
              <span>Ulna (Medial / Pinky)</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {selectedBoneToMove && !assemblyBones[selectedBoneToMove].isPlaced && (
              <>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => confirmBonePlacement(selectedBoneToMove)}
                >
                  <Check size={14} />
                  <span>Lock into Joint</span>
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => snapBoneToTarget(selectedBoneToMove)}
                  title="Accessible placement assist"
                >
                  <Sparkles size={14} color="#f59e0b" />
                  <span>Snap Assist</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Anatomical Reference description */}
        {activeBone && (
          <div style={{ fontSize: 12, color: '#bae6fd', background: 'rgba(56, 189, 248, 0.08)', padding: '6px 12px', borderRadius: 6 }}>
            <strong>{activeBone.displayName}:</strong> {activeBone.anatomicalReference}
          </div>
        )}

        {/* ACCESSIBLE NON-DRAG DISCRETE STEP CONTROLS */}
        {activeBone && !activeBone.isPlaced && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, background: 'rgba(15, 23, 42, 0.5)', padding: '8px 12px', borderRadius: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Spatial Steppers (Accessible Non-Drag Controls):
            </span>

            {/* X-axis (Medial / Lateral) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 11, color: '#cbd5e1' }}>X (Medial/Lat):</span>
              <button className="btn btn-secondary btn-sm" style={{ padding: '2px 8px' }} onClick={() => moveBone(selectedBoneToMove!, [-0.05, 0, 0])}>-</button>
              <button className="btn btn-secondary btn-sm" style={{ padding: '2px 8px' }} onClick={() => moveBone(selectedBoneToMove!, [0.05, 0, 0])}>+</button>
            </div>

            {/* Y-axis (Superior / Inferior) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 11, color: '#cbd5e1' }}>Y (Elbow/Wrist):</span>
              <button className="btn btn-secondary btn-sm" style={{ padding: '2px 8px' }} onClick={() => moveBone(selectedBoneToMove!, [0, -0.05, 0])}>-</button>
              <button className="btn btn-secondary btn-sm" style={{ padding: '2px 8px' }} onClick={() => moveBone(selectedBoneToMove!, [0, 0.05, 0])}>+</button>
            </div>

            {/* Z-axis (Anterior / Posterior) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 11, color: '#cbd5e1' }}>Z (Ant/Post):</span>
              <button className="btn btn-secondary btn-sm" style={{ padding: '2px 8px' }} onClick={() => moveBone(selectedBoneToMove!, [0, 0, -0.05])}>-</button>
              <button className="btn btn-secondary btn-sm" style={{ padding: '2px 8px' }} onClick={() => moveBone(selectedBoneToMove!, [0, 0, 0.05])}>+</button>
            </div>

            {/* Rotation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 11, color: '#cbd5e1' }}>Rotate:</span>
              <button className="btn btn-secondary btn-sm" style={{ padding: '2px 8px' }} onClick={() => rotateBone(selectedBoneToMove!, 'z', -0.1)}>↺</button>
              <button className="btn btn-secondary btn-sm" style={{ padding: '2px 8px' }} onClick={() => rotateBone(selectedBoneToMove!, 'z', 0.1)}>↻</button>
            </div>
          </div>
        )}

        {/* Feedback message */}
        {feedbackMessage && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              background: feedbackType === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${feedbackType === 'success' ? '#10b981' : '#ef4444'}`,
              color: feedbackType === 'success' ? '#6ee7b7' : '#fca5a5',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {feedbackType === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return null;
};
