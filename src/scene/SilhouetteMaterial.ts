import * as THREE from 'three';

/**
 * Fresnel / Rim-light shader for the translucent human body silhouette boundary.
 * Interior organs and bones remain 100% visible. Only the glancing edges are lit.
 * Uses AdditiveBlending so it never occludes inner structures.
 */
export function createSilhouetteMaterial(highContrast = false): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(highContrast ? '#ffff00' : '#00d2c4') },
      uRimPower: { value: 3.2 },
      uRimIntensity: { value: 1.4 },
      uBaseOpacity: { value: 0.03 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uRimPower;
      uniform float uRimIntensity;
      uniform float uBaseOpacity;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        float rim = 1.0 - abs(dot(viewDir, normal));
        rim = pow(clamp(rim, 0.0, 1.0), uRimPower) * uRimIntensity;
        float alpha = clamp(uBaseOpacity + rim, 0.0, 0.85);
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
  });
}
