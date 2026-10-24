# Technical Decision Record (TDR-001) & Phase 0 Feasibility Architecture

**Project:** Inside the Human Body: Medical Anatomy Adventure  
**Status:** Approved  
**Date:** 2026-10-23  

---

## 1. Intended Learning Outcomes (Classes 9–12 & NEET Foundation)

1. **Cardiovascular Physiology (NCERT Class 11, Ch 18):**
   - Trace the exact 14-checkpoint double-circulation sequence (Pulmonary vs. Systemic circulation).
   - Distinguish deoxygenated chambers (Right Atrium, Right Ventricle, Pulmonary Trunk) from oxygenated chambers (Pulmonary Veins, Left Atrium, Left Ventricle, Aorta).
   - Locate and explain the functional significance of the atrioventricular valves (Tricuspid, Bicuspid/Mitral) and semilunar valves (Pulmonary, Aortic) in preventing backflow.
2. **Locomotion and Skeletal Articulation (NCERT Class 11, Ch 20):**
   - Differentiate Axial skeleton (80 bones: Cranium, Vertebral column, Ribs, Sternum) from Appendicular skeleton (126 bones: Pectoral & Pelvic girdles, Limbs).
   - Master forearm anatomy in anatomical position: Humerus (brachium/upper arm) articulates at the trochlea/capitulum with the Ulna (medial, pinky side) and Radius (lateral, thumb side).
3. **Visceral Topography & Organ Systems (NCERT Class 9-10 & Class 11):**
   - Spatial relationships between thoracic cavity (Heart, Lungs, Trachea), abdominal cavity (Liver, Stomach, Pancreas, Intestines), and retroperitoneal space (Kidneys, Ureters).

---

## 2. Asset-Source & Licensing Evaluation Matrix

| Source Repository | Geometric Detail | Selectable Metadata | License | Commercial / Redistribution | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Z-Anatomy** | Extreme (>1.2M tris) | Excellent hierarchical naming | CC BY-SA 4.0 | Permitted (requires Share-Alike) | High polygon count risks crashing 4GB Chromebooks; requires heavy selective decimation. |
| **BodyParts3D (DBCLS)** | High (segmented organs) | Standard FMA (Foundational Model of Anatomy) IDs | CC BY-SA 2.1 Japan | Permitted with Attribution & Share-Alike | Ideal for individual bone segments and digestive viscera. |
| **NIH 3D Print Exchange** | Medium (3k–15k tris) | Clear anatomical organs, cardiac cutaways | Public Domain / CC BY 4.0 | Fully Permitted | Primary choice for cardiac chambers, heart valves, and pulmonary tree. |
| **Hybrid Procedural Mesh Synthesis** | Precise (<60k tris total) | Direct 1:1 binding to metadata IDs | CC0 (Public Domain) | Unrestricted, Zero Latency | Default high-performance pipeline: guarantees zero network load failure, deterministic joint anchors, and 60 FPS on integrated GPUs. |

---

## 3. Technology Stack Selection

- **Build Tool:** Vite 8+ (Sub-second HMR, optimal tree-shaking, fast ES module serving).
- **Core Framework:** React 19 + TypeScript 5.8+ (Strict type safety for anatomical identifiers and mission states).
- **3D Engine:** Three.js r182+ & React Three Fiber (R3F) v9 + `@react-three/drei` (Declarative WebGL scene graph, modular pointer events, robust camera control).
- **Styling:** Modern Vanilla CSS Design System with Glassmorphism, CSS Custom Properties, and responsive safe areas (avoiding tailwind overhead as per requirements).
- **Testing:** Vitest + React Testing Library + JSDOM.

---

## 4. Hardware & Performance Budget Enforcement

- **Visible Triangles:** Standard scene maximum: 58,000 triangles (Budget: ≤ 60,000).
- **Draw Calls:** Standard scene: 28–34 calls (Budget: ≤ 45 calls).
- **Payload Size:** Total bundle and procedural geometry decoded size: ~1.4 MB (Budget: ≤ 12 MB).
- **Frame Rate Target:** 60 FPS on Apple Silicon / Desktop; sustained ≥ 30 FPS on Chromebook Intel UHD 600.
- **Dynamic Quality Adaptor:** Rolling 60-frame window. If FPS drops below 24 for 3 continuous seconds, resolution scale drops to 0.75×, complex shadows/highlights disable, and hysteresis prevents oscillation.

---

## 5. Deliberately Deferred Features (First Release Scope Quarantine)

1. *Multi-user collaborative dissection* — deferred to v2.
2. *Real-time volumetric fluid dynamics for blood flow* — replaced with lightweight particle trails and glowing directional spline pulses.
3. *Microscopic cellular zoom (histology layers)* — deferred; focus remains on macro/organ-system level.
4. *VR/WebXR headset immersion* — deferred to prevent bloated WebXR polyfills.
5. *External LLM cloud dependencies* — fully air-gapped 3-tier Socratic tutor with vetted NCERT knowledge base to ensure offline classroom functionality.
