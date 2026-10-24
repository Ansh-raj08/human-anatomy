import type { MissionDefinition, AssemblyBoneState } from './types';

export const CARDIAC_HIGHWAY_MISSION: MissionDefinition = {
  id: 'cardiac_highway',
  title: 'Mission A: The Cardiac Highway',
  subtitle: 'Trace the 14-Checkpoint Double Circulation Pathway',
  curriculumStandard: 'NCERT Class 11 Biology, Chapter 18 (Body Fluids and Circulation)',
  estimatedTime: '10–15 mins',
  description:
    'A molecule of deoxygenated blood has just arrived from systemic metabolizing tissues. Guide it through all 14 anatomical checkpoints across pulmonary gas exchange and systemic arterial distribution without backflow!',
  learningObjectives: [
    'Trace the continuous anatomical pathway of blood through the human heart and vascular circuits.',
    'Distinguish between Pulmonary Circulation (right heart to lungs) and Systemic Circulation (left heart to body).',
    'Understand the one-way mechanical valve actions of the atrioventricular (Tricuspid, Bicuspid) and semilunar valves.',
    'Master high-yield NEET cardiology concepts: deoxygenated pulmonary arteries vs. oxygenated pulmonary veins.',
  ],
  prerequisites: ['Basic 4-chamber heart anatomy', 'Directional concepts (anterior, posterior, superior, inferior)'],
  totalSteps: 14,
  steps: [
    {
      stepIndex: 1,
      title: 'Venous Inflow',
      targetStructureId: 'circ_svc_ivc',
      learningPrompt: 'Locate the large systemic veins returning deoxygenated blood from the upper and lower body into the heart.',
      pedagogicalHintTier1: 'Which massive vessels collect venous return from the upper head/arms and lower viscera?',
      pedagogicalHintTier2: 'Look for the two large blue venous conduits entering the posterior-superior and inferior aspect of the right atrium.',
      pedagogicalHintTier3: 'Inspect the Superior & Inferior Vena Cava entering the right atrium.',
      explanatoryFeedbackOnSuccess:
        'Correct! The Superior Vena Cava (SVC) drains blood from above the diaphragm, while the Inferior Vena Cava (IVC) drains blood from below the diaphragm into the right atrium.',
      specificErrorFeedback: {
        circ_pulmonary_veins: 'Pulmonary veins carry freshly oxygenated blood from the lungs into the left atrium, not venous return from the body!',
        circ_aorta: 'The aorta carries high-pressure oxygenated blood away from the left ventricle into systemic circulation.',
      },
      cameraFocusId: 'circ_svc_ivc',
      isOxygenated: false,
      circuit: 'systemic',
    },
    {
      stepIndex: 2,
      title: 'Right Inflow Chamber',
      targetStructureId: 'circ_right_atrium',
      learningPrompt: 'Identify the receiving chamber of the heart where the venae cavae empty their deoxygenated blood.',
      pedagogicalHintTier1: 'Blood entering the heart from systemic veins first collects in a thin-walled atrium on which side?',
      pedagogicalHintTier2: 'Look at the upper right chamber (anatomical right, viewer’s left). It houses the Sinoatrial (SA) node pacemaker.',
      pedagogicalHintTier3: 'Select the Right Atrium directly connected to the Venae Cavae.',
      explanatoryFeedbackOnSuccess:
        'Splendid! The Right Atrium acts as the receiving reservoir for deoxygenated systemic venous return. The SA node in its superior-lateral wall generates regular myogenic action potentials.',
      specificErrorFeedback: {
        circ_left_atrium: 'The left atrium receives oxygen-rich blood returning from the lungs via pulmonary veins.',
        circ_right_ventricle: 'The right ventricle is inferior to the right atrium; blood must enter the atrium first before crossing the valve into the ventricle.',
      },
      cameraFocusId: 'circ_right_atrium',
      isOxygenated: false,
      circuit: 'pulmonary',
    },
    {
      stepIndex: 3,
      title: 'Right Atrioventricular Gate',
      targetStructureId: 'circ_tricuspid_valve',
      learningPrompt: 'Find the atrioventricular valve through which blood flows from the right atrium into the right ventricle.',
      pedagogicalHintTier1: 'What structure prevents blood from regurgitating back into the right atrium when the ventricle contracts?',
      pedagogicalHintTier2: 'Look for the fibrous valve with three distinct triangular cusps located at the right atrioventricular orifice.',
      pedagogicalHintTier3: 'Inspect the interior cutaway between the right atrium and right ventricle: the Tricuspid Valve.',
      explanatoryFeedbackOnSuccess:
        'Accurate! The Tricuspid Valve features three fibrous cusps tethered to chordae tendineae and papillary muscles, preventing ventricular-atrial regurgitation during systole.',
      specificErrorFeedback: {
        circ_mitral_valve: 'The bicuspid (mitral) valve is on the LEFT side of the heart, between the left atrium and left ventricle.',
        circ_pulmonary_valve: 'The pulmonary valve guards the exit of the right ventricle into the pulmonary trunk, not the entrance from the atrium.',
      },
      cameraFocusId: 'circ_tricuspid_valve',
      isOxygenated: false,
      circuit: 'pulmonary',
    },
    {
      stepIndex: 4,
      title: 'Pulmonary Pumping Chamber',
      targetStructureId: 'circ_right_ventricle',
      learningPrompt: 'Select the muscular chamber that receives blood across the tricuspid valve and pumps it toward the lungs.',
      pedagogicalHintTier1: 'Which chamber forms the anterior-inferior border of the right cardiac silhouette?',
      pedagogicalHintTier2: 'Follow blood past the tricuspid cusps into this crescent-shaped muscular chamber.',
      pedagogicalHintTier3: 'Select the Right Ventricle.',
      explanatoryFeedbackOnSuccess:
        'Excellent! The Right Ventricle pumps blood under moderate pressure into the low-resistance pulmonary circuit.',
      specificErrorFeedback: {
        circ_left_ventricle: 'The left ventricle is the thick-walled systemic pump on the anatomical left side.',
      },
      cameraFocusId: 'circ_right_ventricle',
      isOxygenated: false,
      circuit: 'pulmonary',
    },
    {
      stepIndex: 5,
      title: 'Pulmonary Outflow Gate',
      targetStructureId: 'circ_pulmonary_valve',
      learningPrompt: 'Locate the semilunar valve at the exit of the right ventricle leading into the pulmonary artery.',
      pedagogicalHintTier1: 'What semilunar structure prevents blood in the pulmonary trunk from back-flowing into the relaxing right ventricle?',
      pedagogicalHintTier2: 'Observe the base of the anterior blue arterial trunk emerging superiorly from the right ventricle.',
      pedagogicalHintTier3: 'Select the Pulmonary Semilunar Valve.',
      explanatoryFeedbackOnSuccess:
        'Correct! The Pulmonary Valve consists of three pocket-like semilunar cusps that snap shut when ventricular pressure drops below arterial pressure.',
      specificErrorFeedback: {
        circ_aortic_valve: 'The aortic valve is located at the base of the aorta exiting the left ventricle.',
      },
      cameraFocusId: 'circ_pulmonary_valve',
      isOxygenated: false,
      circuit: 'pulmonary',
    },
    {
      stepIndex: 6,
      title: 'Pulmonary Arterial Conduit',
      targetStructureId: 'circ_pulmonary_artery',
      learningPrompt: 'Select the great vessel that carries deoxygenated blood away from the heart toward both lungs.',
      pedagogicalHintTier1: 'Remember the NEET high-yield rule: which artery is the primary exception that carries DEOXYGENATED blood in an adult?',
      pedagogicalHintTier2: 'Look for the bifurcating blue arterial trunk curving beneath the aortic arch toward the right and left lungs.',
      pedagogicalHintTier3: 'Select the Pulmonary Trunk / Pulmonary Artery.',
      explanatoryFeedbackOnSuccess:
        'Outstanding! The Pulmonary Trunk branches into the left and right pulmonary arteries. It is the only adult artery conveying deoxygenated blood.',
      specificErrorFeedback: {
        circ_aorta: 'The aorta conveys oxygenated blood from the left ventricle to systemic tissues.',
      },
      cameraFocusId: 'circ_pulmonary_artery',
      isOxygenated: false,
      circuit: 'pulmonary',
    },
    {
      stepIndex: 7,
      title: 'Pulmonary Alveolar Capillaries',
      targetStructureId: 'circ_lung_capillaries',
      learningPrompt: 'Where does external gas exchange occur, eliminating carbon dioxide and saturating hemoglobin with oxygen?',
      pedagogicalHintTier1: 'Where does blood meet alveolar air to discard CO2 and pick up fresh O2?',
      pedagogicalHintTier2: 'Navigate to the capillary beds interlaced throughout both lungs.',
      pedagogicalHintTier3: 'Select the Pulmonary Capillary Beds in the lungs.',
      explanatoryFeedbackOnSuccess:
        'Spot on! In the pulmonary capillaries, gas diffusion occurs across the ultra-thin 0.5 µm respiratory membrane. Blood transforms from deoxygenated (dark maroon) to oxygenated (bright scarlet red).',
      specificErrorFeedback: {
        circ_systemic_tissues: 'Systemic tissues are where oxygen is UNLOADED, not where blood is oxygenated.',
      },
      cameraFocusId: 'circ_lung_capillaries',
      isOxygenated: true,
      circuit: 'pulmonary',
    },
    {
      stepIndex: 8,
      title: 'Oxygenated Pulmonary Return',
      targetStructureId: 'circ_pulmonary_veins',
      learningPrompt: 'Find the veins that return freshly oxygen-rich blood from both lungs back to the heart.',
      pedagogicalHintTier1: 'Which four vessels constitute the only adult VEINS carrying OXYGENATED blood?',
      pedagogicalHintTier2: 'Look at the red vessels extending from the hilum of each lung entering the posterior-superior chamber of the left heart.',
      pedagogicalHintTier3: 'Select the Pulmonary Veins (two left, two right).',
      explanatoryFeedbackOnSuccess:
        'Masterful! The four Pulmonary Veins return oxygenated blood into the left atrium, concluding the pulmonary circulatory loop.',
      specificErrorFeedback: {
        circ_svc_ivc: 'The venae cavae carry deoxygenated blood from systemic organs.',
      },
      cameraFocusId: 'circ_pulmonary_veins',
      isOxygenated: true,
      circuit: 'pulmonary',
    },
    {
      stepIndex: 9,
      title: 'Left Receiving Chamber',
      targetStructureId: 'circ_left_atrium',
      learningPrompt: 'Identify the posterior chamber of the heart that receives oxygenated blood from all four pulmonary veins.',
      pedagogicalHintTier1: 'Which chamber sits on the upper left side and receives blood from the pulmonary veins?',
      pedagogicalHintTier2: 'Look at the smooth-walled upper chamber on the left side of the heart.',
      pedagogicalHintTier3: 'Select the Left Atrium.',
      explanatoryFeedbackOnSuccess:
        'Great work! The Left Atrium collects oxygenated blood and primes the high-pressure left ventricle during atrial systole.',
      specificErrorFeedback: {
        circ_right_atrium: 'The right atrium receives deoxygenated systemic venous return.',
      },
      cameraFocusId: 'circ_left_atrium',
      isOxygenated: true,
      circuit: 'systemic',
    },
    {
      stepIndex: 10,
      title: 'Left Atrioventricular Gate',
      targetStructureId: 'circ_mitral_valve',
      learningPrompt: 'Locate the atrioventricular valve that has only two cusps, through which blood passes into the left ventricle.',
      pedagogicalHintTier1: 'Which valve is named for its resemblance to a bishop’s miter and contains only two leaflets?',
      pedagogicalHintTier2: 'Look at the valve between the left atrium and left ventricle: the Bicuspid or Mitral valve.',
      pedagogicalHintTier3: 'Select the Bicuspid (Mitral) Valve.',
      explanatoryFeedbackOnSuccess:
        'Correct! The Bicuspid (Mitral) Valve possesses two sturdy cusps capable of withstanding the immense pressures of left ventricular contraction.',
      specificErrorFeedback: {
        circ_tricuspid_valve: 'The tricuspid valve is on the right side between the right atrium and right ventricle.',
      },
      cameraFocusId: 'circ_mitral_valve',
      isOxygenated: true,
      circuit: 'systemic',
    },
    {
      stepIndex: 11,
      title: 'Systemic Muscular Powerhouse',
      targetStructureId: 'circ_left_ventricle',
      learningPrompt: 'Select the thickest, most muscular chamber of the heart that pumps oxygenated blood into the systemic circuit.',
      pedagogicalHintTier1: 'Which chamber has myocardium 3 times thicker than the other chambers to overcome total peripheral resistance?',
      pedagogicalHintTier2: 'Observe the apex of the heart on the anatomical left side.',
      pedagogicalHintTier3: 'Select the Left Ventricle.',
      explanatoryFeedbackOnSuccess:
        'Brilliant! The Left Ventricle produces systolic pressures of ~120 mm Hg to propel blood through the entire body from cranium to toes.',
      specificErrorFeedback: {
        circ_right_ventricle: 'The right ventricle pumps solely to the nearby lungs under low pressure (~25 mm Hg).',
      },
      cameraFocusId: 'circ_left_ventricle',
      isOxygenated: true,
      circuit: 'systemic',
    },
    {
      stepIndex: 12,
      title: 'Systemic Outflow Gate',
      targetStructureId: 'circ_aortic_valve',
      learningPrompt: 'Find the semilunar valve at the outflow tract of the left ventricle opening into the aorta.',
      pedagogicalHintTier1: 'What semilunar valve prevents blood from falling back into the left ventricle during ventricular diastole?',
      pedagogicalHintTier2: 'Look deep at the base of the ascending aorta just superior to the left ventricle.',
      pedagogicalHintTier3: 'Select the Aortic Semilunar Valve.',
      explanatoryFeedbackOnSuccess:
        'Spot on! The Aortic Valve allows high-velocity blood ejection during systole and seals during diastole, maintaining systemic diastolic pressure (~80 mm Hg).',
      specificErrorFeedback: {
        circ_pulmonary_valve: 'The pulmonary valve is on the right side leading into the pulmonary trunk.',
      },
      cameraFocusId: 'circ_aortic_valve',
      isOxygenated: true,
      circuit: 'systemic',
    },
    {
      stepIndex: 13,
      title: 'Great Systemic Trunk',
      targetStructureId: 'circ_aorta',
      learningPrompt: 'Identify the largest artery in the human body, which arches superiorly before descending through the thorax and abdomen.',
      pedagogicalHintTier1: 'Which massive arch gives rise to the carotid and subclavian arteries before continuing as the descending aorta?',
      pedagogicalHintTier2: 'Look for the large red arched vessel emerging from the left ventricle.',
      pedagogicalHintTier3: 'Select the Aorta & Aortic Arch.',
      explanatoryFeedbackOnSuccess:
        'Accurate! The Aorta branches into the brachiocephalic trunk, left common carotid, and left subclavian arteries before continuing inferiorly as the descending aorta.',
      specificErrorFeedback: {
        circ_pulmonary_artery: 'The pulmonary artery goes to the lungs, not systemic organs.',
      },
      cameraFocusId: 'circ_aorta',
      isOxygenated: true,
      circuit: 'systemic',
    },
    {
      stepIndex: 14,
      title: 'Systemic Cellular Delivery',
      targetStructureId: 'circ_systemic_tissues',
      learningPrompt: 'Complete the loop: identify where oxygen and nutrients are delivered to metabolizing body tissues and organs.',
      pedagogicalHintTier1: 'Where does arterial blood unload O2 to fuel cellular respiration throughout the organs and limbs?',
      pedagogicalHintTier2: 'Look across the whole body peripheral tissues where blood exchanges O2 for CO2.',
      pedagogicalHintTier3: 'Select Systemic Body Tissues & Organs.',
      explanatoryFeedbackOnSuccess:
        '🎉 Mission Complete! You have successfully guided blood through all 14 checkpoints of the human double circulation! Deoxygenated blood returns to the venae cavae, and the life-sustaining cycle repeats ~100,000 times each day!',
      specificErrorFeedback: {},
      cameraFocusId: 'circ_systemic_tissues',
      isOxygenated: false,
      circuit: 'systemic',
    },
  ],
};

export const INITIAL_ASSEMBLY_BONES: Record<'bone_radius_r' | 'bone_ulna_r', AssemblyBoneState> = {
  bone_radius_r: {
    id: 'bone_radius_r',
    displayName: 'Right Radius (Lateral / Thumb Side)',
    isPlaced: false,
    currentPosition: [2.1, 1.4, 0.4], // Displaced initially for student assembly
    currentRotation: [0, 0, 0.35],
    targetPosition: [1.50, 1.15, 0.0], // Anatomically verified lateral position
    targetRotation: [0, 0, 0.0],
    toleranceDistance: 0.12,
    anatomicalSide: 'lateral',
    anatomicalReference:
      'Articulates proximally with the capitulum of the humerus at the elbow and distally forms the wrist joint on the lateral (thumb) side in standard anatomical position.',
  },
  bone_ulna_r: {
    id: 'bone_ulna_r',
    displayName: 'Right Ulna (Medial / Pinky Side)',
    isPlaced: false,
    currentPosition: [1.9, 0.7, -0.3], // Displaced initially
    currentRotation: [0, 0, -0.4],
    targetPosition: [1.32, 1.15, 0.0], // Anatomically verified medial position
    targetRotation: [0, 0, 0.0],
    toleranceDistance: 0.12,
    anatomicalSide: 'medial',
    anatomicalReference:
      'Articulates proximally with the trochlea of the humerus via the olecranon process (elbow point) and sits on the medial (little-finger) side in standard anatomical position.',
  },
};

export const APPENDICULAR_ASSEMBLY_MISSION: MissionDefinition = {
  id: 'appendicular_assembly',
  title: 'Mission B: Appendicular Assembly',
  subtitle: 'Forearm Articulation: Radius vs. Ulna Placement',
  curriculumStandard: 'NCERT Class 11 Biology, Chapter 20 (Locomotion and Movement)',
  estimatedTime: '8–12 mins',
  description:
    'The right humerus is locked in place as our proximal anatomical anchor. Position and articulate the Radius and Ulna into their correct anatomical orientations at the elbow and wrist.',
  learningObjectives: [
    'Distinguish between the upper arm bone (Humerus) and forearm bones (Radius and Ulna). Never confuse all three as forearm bones!',
    'Identify the Radius as the lateral forearm bone on the thumb side in anatomical position.',
    'Identify the Ulna as the medial forearm bone on the pinky (little finger) side in anatomical position.',
    'Articulate elbow landmarks: Capitulum aligns with Radius head, Trochlea articulates with Ulna trochlear notch.',
  ],
  prerequisites: ['Standard anatomical position (palms facing forward/anterior)', 'Medial vs. Lateral directional terms'],
  totalSteps: 2,
};
