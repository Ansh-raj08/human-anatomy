import React, { useState } from 'react';
import { Sparkles, X, Send, Compass, BookOpen, HelpCircle } from 'lucide-react';
import { useAnatomy } from '../interaction/AnatomyContext';
import { useMission } from '../missions/MissionContext';
import { generateSocraticGuidance, type SocraticResponse } from '../content/socraticTutor';
import { ANATOMY_REGISTRY } from '../anatomy/registry';

interface SocraticTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SocraticTutorModal: React.FC<SocraticTutorModalProps> = ({ isOpen, onClose }) => {
  const { selectedStructureId, selectStructure } = useAnatomy();
  const { activeMissionId, currentStepIndex, attempts } = useMission();

  const [inputQuery, setInputQuery] = useState('');
  const [response, setResponse] = useState<SocraticResponse | null>(() => {
    return generateSocraticGuidance({
      current_organ_id: selectedStructureId,
      current_mission_id: activeMissionId,
      attempt_count: attempts,
      student_query: '',
      current_mission_step: currentStepIndex,
      selected_structure_ids: selectedStructureId ? [selectedStructureId] : [],
      student_level: 'Class 11 NEET Foundation',
      available_interactions: ['select', 'rotate', 'zoom', 'clipping'],
    });
  });

  if (!isOpen) return null;

  const handleAsk = (queryText: string) => {
    if (!queryText.trim()) return;
    const res = generateSocraticGuidance({
      current_organ_id: selectedStructureId,
      current_mission_id: activeMissionId,
      attempt_count: attempts,
      student_query: queryText,
      current_mission_step: currentStepIndex,
      selected_structure_ids: selectedStructureId ? [selectedStructureId] : [],
      student_level: 'Class 11 NEET Foundation',
      available_interactions: ['select', 'rotate', 'zoom', 'clipping'],
    });
    setResponse(res);
    setInputQuery('');
  };

  const sampleQuestions = [
    'Why is the left ventricle wall thicker than the right?',
    'How do the atrioventricular valves prevent backflow?',
    'Which forearm bone is on the thumb side?',
    'Why does the pulmonary artery carry deoxygenated blood?',
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2, 6, 23, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: 620,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 24,
          gap: 16,
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="socratic-title"
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h2 id="socratic-title" style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                Socratic Biology Tutor
              </h2>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                Pedagogical guidance aligned with NCERT Biology & NEET Foundation
              </p>
            </div>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={onClose} aria-label="Close Tutor Modal">
            <X size={15} />
          </button>
        </div>

        {/* Current Tutor Guidance Card */}
        {response && (
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: 12,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span className="badge badge-purple" style={{ fontSize: 11 }}>
                Tier {response.hint_tier} Guided Hint
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                <BookOpen size={12} color="#a855f7" />
                {response.concept}
              </span>
            </div>

            <p style={{ fontSize: 14, color: '#f8fafc', lineHeight: 1.55 }}>
              {response.response_text}
            </p>

            <div
              style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                color: '#bae6fd',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Compass size={14} color="#38bdf8" />
              <span><strong>Suggested 3D Investigation:</strong> {response.suggested_investigation}</span>
            </div>

            {response.referenced_structure_ids.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Explore landmark:</span>
                {response.referenced_structure_ids.map(id => {
                  const organ = ANATOMY_REGISTRY[id];
                  if (!organ) return null;
                  return (
                    <button
                      key={id}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11, padding: '2px 8px' }}
                      onClick={() => {
                        selectStructure(id);
                        onClose();
                      }}
                    >
                      <span>{organ.displayName}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Suggested Prompts */}
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Suggested Curriculum Inquiries:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: 11, padding: '4px 10px', textAlign: 'left' }}
                onClick={() => handleAsk(q)}
              >
                <HelpCircle size={12} color="#38bdf8" />
                <span>{q}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Query Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(inputQuery);
          }}
          style={{ display: 'flex', gap: 8 }}
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a question about heart valves, bone alignment, or circulation..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 8,
              background: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              fontSize: 13,
              outline: 'none',
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={!inputQuery.trim()}>
            <Send size={15} />
            <span>Ask Tutor</span>
          </button>
        </form>
      </div>
    </div>
  );
};
