import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { MissionId, MissionState, MissionStep, AssemblyBoneState } from './types';
import { CARDIAC_HIGHWAY_MISSION, INITIAL_ASSEMBLY_BONES } from './missionData';
import { useAnatomy } from '../interaction/AnatomyContext';
import confetti from 'canvas-confetti';

interface MissionContextValue {
  activeMissionId: MissionId | null;
  missionState: MissionState;
  currentStepIndex: number;
  currentStep: MissionStep | null;
  attempts: number;
  hintTier: 1 | 2 | 3;
  feedbackMessage: string | null;
  feedbackType: 'success' | 'error' | 'info' | null;
  score: number;

  // Assembly state
  assemblyBones: Record<'bone_radius_r' | 'bone_ulna_r', AssemblyBoneState>;
  selectedBoneToMove: 'bone_radius_r' | 'bone_ulna_r' | null;
  setSelectedBoneToMove: (bone: 'bone_radius_r' | 'bone_ulna_r' | null) => void;
  moveBone: (boneId: 'bone_radius_r' | 'bone_ulna_r', delta: [number, number, number]) => void;
  rotateBone: (boneId: 'bone_radius_r' | 'bone_ulna_r', axis: 'x' | 'y' | 'z', delta: number) => void;
  confirmBonePlacement: (boneId: 'bone_radius_r' | 'bone_ulna_r') => boolean;
  snapBoneToTarget: (boneId: 'bone_radius_r' | 'bone_ulna_r') => void;

  // Lifecycle
  startMission: (missionId: MissionId) => void;
  beginActiveExploration: () => void;
  handleStructureSelected: (structureId: string) => boolean;
  requestNextHint: () => void;
  advanceToNextStep: () => void;
  restartMission: () => void;
  exitMission: () => void;
  pauseMission: () => void;
  resumeMission: () => void;
}

const MissionContext = createContext<MissionContextValue | null>(null);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectStructure, focusStructure, announce, isolateSystem, restoreAllSystems } = useAnatomy();

  const [activeMissionId, setActiveMissionId] = useState<MissionId | null>(null);
  const [missionState, setMissionState] = useState<MissionState>('NOT_STARTED');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(1);
  const [attempts, setAttempts] = useState<number>(0);
  const [hintTier, setHintTier] = useState<1 | 2 | 3>(1);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info' | null>(null);
  const [score, setScore] = useState<number>(100);

  // Assembly specific state
  const [assemblyBones, setAssemblyBones] = useState<Record<'bone_radius_r' | 'bone_ulna_r', AssemblyBoneState>>(INITIAL_ASSEMBLY_BONES);
  const [selectedBoneToMove, setSelectedBoneToMove] = useState<'bone_radius_r' | 'bone_ulna_r' | null>('bone_radius_r');

  const currentStep = useMemo<MissionStep | null>(() => {
    if (activeMissionId === 'cardiac_highway' && CARDIAC_HIGHWAY_MISSION.steps) {
      return CARDIAC_HIGHWAY_MISSION.steps.find(s => s.stepIndex === currentStepIndex) || null;
    }
    return null;
  }, [activeMissionId, currentStepIndex]);

  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#38bdf8', '#10b981', '#f59e0b', '#8b5cf6'],
      });
    } catch {
      // Fallback if canvas-confetti is not in browser DOM yet
    }
  }, []);

  const startMission = useCallback((missionId: MissionId) => {
    setActiveMissionId(missionId);
    setMissionState('INTRO');
    setCurrentStepIndex(1);
    setAttempts(0);
    setHintTier(1);
    setScore(100);
    setFeedbackMessage(null);
    setFeedbackType(null);

    if (missionId === 'cardiac_highway') {
      isolateSystem('circulatory');
      focusStructure('circ_right_atrium');
      announce('Started Mission A: The Cardiac Highway. Please read the learning objectives.');
    } else {
      isolateSystem('skeletal');
      setAssemblyBones(INITIAL_ASSEMBLY_BONES);
      setSelectedBoneToMove('bone_radius_r');
      focusStructure('bone_humerus_r');
      announce('Started Mission B: Appendicular Assembly. The right humerus is locked in place as anchor.');
    }
  }, [announce, focusStructure, isolateSystem]);

  const beginActiveExploration = useCallback(() => {
    setMissionState('ACTIVE');
    if (activeMissionId === 'cardiac_highway' && CARDIAC_HIGHWAY_MISSION.steps) {
      const step1 = CARDIAC_HIGHWAY_MISSION.steps[0];
      focusStructure(step1.cameraFocusId);
      announce(`Step 1: ${step1.title}. ${step1.learningPrompt}`);
    } else if (activeMissionId === 'appendicular_assembly') {
      focusStructure('bone_humerus_r');
      announce('Appendicular Assembly active. Use the 3D scene or accessible step controls to articulate Radius and Ulna.');
    }
  }, [activeMissionId, announce, focusStructure]);

  const requestNextHint = useCallback(() => {
    setHintTier(prev => {
      const next = (prev < 3 ? (prev + 1) : 3) as 1 | 2 | 3;
      setScore(s => Math.max(10, s - 5)); // Small deduction for hint usage
      return next;
    });
  }, []);

  const advanceToNextStep = useCallback(() => {
    if (activeMissionId === 'cardiac_highway') {
      const totalSteps = CARDIAC_HIGHWAY_MISSION.totalSteps;
      if (currentStepIndex >= totalSteps) {
        setMissionState('COMPLETED');
        triggerCelebration();
        announce('Congratulations! You completed the Cardiac Highway Mission with excellence!');
      } else {
        const nextIdx = currentStepIndex + 1;
        setCurrentStepIndex(nextIdx);
        setMissionState('ACTIVE');
        setAttempts(0);
        setHintTier(1);
        setFeedbackMessage(null);
        setFeedbackType(null);
        const nextStep = CARDIAC_HIGHWAY_MISSION.steps?.find(s => s.stepIndex === nextIdx);
        if (nextStep) {
          focusStructure(nextStep.cameraFocusId);
          announce(`Step ${nextIdx}: ${nextStep.title}. ${nextStep.learningPrompt}`);
        }
      }
    }
  }, [activeMissionId, currentStepIndex, announce, focusStructure, triggerCelebration]);

  const handleStructureSelected = useCallback((structureId: string): boolean => {
    if (missionState !== 'ACTIVE' || activeMissionId !== 'cardiac_highway' || !currentStep) {
      return false;
    }

    setAttempts(a => a + 1);

    if (structureId === currentStep.targetStructureId) {
      setMissionState('STEP_FEEDBACK');
      setFeedbackType('success');
      setFeedbackMessage(currentStep.explanatoryFeedbackOnSuccess);
      selectStructure(structureId);
      announce(`Correct! ${currentStep.explanatoryFeedbackOnSuccess}`);
      return true;
    } else {
      setFeedbackType('error');
      setScore(s => Math.max(10, s - 8));
      const specificMsg = currentStep.specificErrorFeedback?.[structureId];
      const errorMsg = specificMsg || `Not quite. That structure is not the next checkpoint in the blood circulation pathway. Review Hint Tier ${hintTier} for guidance.`;
      setFeedbackMessage(errorMsg);
      announce(`Incorrect: ${errorMsg}`);
      return false;
    }
  }, [activeMissionId, currentStep, hintTier, missionState, announce, selectStructure]);

  // Assembly actions
  const moveBone = useCallback((boneId: 'bone_radius_r' | 'bone_ulna_r', delta: [number, number, number]) => {
    setAssemblyBones(prev => {
      const bone = prev[boneId];
      if (bone.isPlaced) return prev;
      const nextPos: [number, number, number] = [
        bone.currentPosition[0] + delta[0],
        bone.currentPosition[1] + delta[1],
        bone.currentPosition[2] + delta[2],
      ];
      return {
        ...prev,
        [boneId]: { ...bone, currentPosition: nextPos },
      };
    });
  }, []);

  const rotateBone = useCallback((boneId: 'bone_radius_r' | 'bone_ulna_r', axis: 'x' | 'y' | 'z', delta: number) => {
    setAssemblyBones(prev => {
      const bone = prev[boneId];
      if (bone.isPlaced) return prev;
      const nextRot: [number, number, number] = [...bone.currentRotation];
      if (axis === 'x') nextRot[0] += delta;
      if (axis === 'y') nextRot[1] += delta;
      if (axis === 'z') nextRot[2] += delta;
      return {
        ...prev,
        [boneId]: { ...bone, currentRotation: nextRot },
      };
    });
  }, []);

  const confirmBonePlacement = useCallback((boneId: 'bone_radius_r' | 'bone_ulna_r'): boolean => {
    const bone = assemblyBones[boneId];
    if (bone.isPlaced) return true;

    // Calculate Euclidean distance between current position and target anchor
    const dx = bone.currentPosition[0] - bone.targetPosition[0];
    const dy = bone.currentPosition[1] - bone.targetPosition[1];
    const dz = bone.currentPosition[2] - bone.targetPosition[2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (dist <= bone.toleranceDistance) {
      setAssemblyBones(prev => ({
        ...prev,
        [boneId]: {
          ...prev[boneId],
          isPlaced: true,
          currentPosition: [...prev[boneId].targetPosition],
          currentRotation: [...prev[boneId].targetRotation],
        },
      }));
      setFeedbackType('success');
      setFeedbackMessage(`Perfect anatomical alignment! The ${bone.displayName} is securely articulated at the joint.`);
      announce(`The ${bone.displayName} is now locked in its correct anatomical articulation.`);

      // Check if both bones are now placed
      const otherId = boneId === 'bone_radius_r' ? 'bone_ulna_r' : 'bone_radius_r';
      if (assemblyBones[otherId].isPlaced) {
        setMissionState('COMPLETED');
        triggerCelebration();
        announce('Appendicular Assembly Mission Complete! Both forearm bones are articulated in anatomical position.');
      } else {
        setSelectedBoneToMove(otherId);
      }
      return true;
    } else {
      setFeedbackType('error');
      setFeedbackMessage(
        `Placement tolerance exceeded (Distance: ${dist.toFixed(2)} units; tolerance: ${bone.toleranceDistance} units). ` +
        (bone.anatomicalSide === 'lateral'
          ? 'Remember: The Radius is LATERAL (on the thumb side), articulating with the capitulum of the humerus.'
          : 'Remember: The Ulna is MEDIAL (on the little-finger side), articulating with the trochlea of the humerus.')
      );
      announce(`Placement misaligned. Move closer to the joint anchor.`);
      return false;
    }
  }, [assemblyBones, announce, triggerCelebration]);

  const snapBoneToTarget = useCallback((boneId: 'bone_radius_r' | 'bone_ulna_r') => {
    setAssemblyBones(prev => ({
      ...prev,
      [boneId]: {
        ...prev[boneId],
        isPlaced: true,
        currentPosition: [...prev[boneId].targetPosition],
        currentRotation: [...prev[boneId].targetRotation],
      },
    }));
    setFeedbackType('success');
    setFeedbackMessage(`${assemblyBones[boneId].displayName} snapped into anatomical position.`);
    announce(`${assemblyBones[boneId].displayName} locked.`);

    const otherId = boneId === 'bone_radius_r' ? 'bone_ulna_r' : 'bone_radius_r';
    if (assemblyBones[otherId].isPlaced) {
      setMissionState('COMPLETED');
      triggerCelebration();
    } else {
      setSelectedBoneToMove(otherId);
    }
  }, [assemblyBones, announce, triggerCelebration]);

  const restartMission = useCallback(() => {
    if (activeMissionId) {
      startMission(activeMissionId);
    }
  }, [activeMissionId, startMission]);

  const exitMission = useCallback(() => {
    setActiveMissionId(null);
    setMissionState('NOT_STARTED');
    restoreAllSystems();
    announce('Exited mission mode. Returned to free exploration.');
  }, [announce, restoreAllSystems]);

  const pauseMission = useCallback(() => {
    setMissionState('PAUSED');
  }, []);

  const resumeMission = useCallback(() => {
    setMissionState('ACTIVE');
  }, []);

  const value = useMemo<MissionContextValue>(() => ({
    activeMissionId,
    missionState,
    currentStepIndex,
    currentStep,
    attempts,
    hintTier,
    feedbackMessage,
    feedbackType,
    score,
    assemblyBones,
    selectedBoneToMove,
    setSelectedBoneToMove,
    moveBone,
    rotateBone,
    confirmBonePlacement,
    snapBoneToTarget,
    startMission,
    beginActiveExploration,
    handleStructureSelected,
    requestNextHint,
    advanceToNextStep,
    restartMission,
    exitMission,
    pauseMission,
    resumeMission,
  }), [
    activeMissionId,
    missionState,
    currentStepIndex,
    currentStep,
    attempts,
    hintTier,
    feedbackMessage,
    feedbackType,
    score,
    assemblyBones,
    selectedBoneToMove,
    moveBone,
    rotateBone,
    confirmBonePlacement,
    snapBoneToTarget,
    startMission,
    beginActiveExploration,
    handleStructureSelected,
    requestNextHint,
    advanceToNextStep,
    restartMission,
    exitMission,
    pauseMission,
    resumeMission,
  ]);

  return (
    <MissionContext.Provider value={value}>
      {children}
    </MissionContext.Provider>
  );
};

export const useMission = (): MissionContextValue => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
};
