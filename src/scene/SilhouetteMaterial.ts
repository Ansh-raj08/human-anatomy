import * as THREE from 'three';

/**
 * Translucent Fresnel / X-Ray shader for the `skin` boundary layer.
 * Uses `depthWrite: false` and low base opacity so internal bones, organs,
 * vessels, and nerves remain clearly visible inside the unified coordinate space.
 */
export function createSilhouetteMaterial(xrayMode = true): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.FrontSide,
    blending: THREE.NormalBlending,
    uniforms: {
      uColor: { value: new THREE.Color('#38bdf8') },
      uRimPower: { value: 2.8 },
      uRimIntensity: { value: xrayMode ? 0.68 : 0.42 },
      uBaseOpacity: { value: xrayMode ? 0.045 : 0.14 },
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
        float alpha = clamp(uBaseOpacity + rim, 0.0, 0.65);
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
  });
}
