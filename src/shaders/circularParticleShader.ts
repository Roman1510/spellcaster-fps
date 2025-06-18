// utils/circularParticleShader.ts - Animated version
import { ShaderMaterial } from 'three'

export const createCircularParticleMaterial = () => {
  return new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uExplosionTime: { value: 0 }, // Time since explosion started
    },
    vertexShader: `
      uniform float uTime;
      uniform float uExplosionTime;
      
      attribute float size;
      attribute vec3 color;
      attribute vec3 velocity;
      attribute float lifetime;
      attribute float chaos;
      
      varying vec3 vColor;
      varying float vAlpha;
      
      // Simple noise for chaos
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }
      
      void main() {
        // Calculate particle age
        float age = uExplosionTime;
        float normalizedAge = age / lifetime;
        
        // Fade out over lifetime
        float alpha = 1.0 - smoothstep(0.7, 1.0, normalizedAge);
        vAlpha = alpha;
        
        // Start with original position
        vec3 pos = position;
        
        // Add velocity-based movement
        pos += velocity * age;
        
        // Add chaotic movement using noise
        float chaosTime = uTime * chaos;
        vec3 chaosOffset = vec3(
          sin(chaosTime * 3.0 + position.x * 10.0) * chaos * 0.3,
          cos(chaosTime * 2.5 + position.y * 8.0) * chaos * 0.3,
          sin(chaosTime * 4.0 + position.z * 6.0) * chaos * 0.3
        );
        pos += chaosOffset * age * 0.5;
        
        // Add turbulence
        float turbulence = sin(uTime * 8.0 + position.x * 5.0) * 0.1 * chaos;
        pos.y += turbulence * age;
        
        // Gravity effect (particles fall down slightly)
        pos.y -= age * age * 0.5;
        
        vColor = color * alpha;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        
        // Particles get smaller as they age and fade
        float ageScale = 1.0 - normalizedAge * 0.3;
        gl_PointSize = size * ageScale * (300.0 / -mvPosition.z);
        
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      
      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float distance = length(center);
        
        if (distance > 0.5) discard;
        
        // Softer edges
        float alpha = 1.0 - smoothstep(0.2, 0.5, distance);
        
        // Add flickering effect
        float flicker = 0.8 + 0.2 * sin(gl_FragCoord.x * 0.1 + gl_FragCoord.y * 0.1);
        
        // Inner glow
        float glow = 1.0 - smoothstep(0.0, 0.4, distance);
        vec3 finalColor = vColor * (0.7 + glow * 0.5) * flicker;
        
        gl_FragColor = vec4(finalColor, alpha * vAlpha);
      }
    `,
    transparent: true,
    blending: 2, // AdditiveBlending
    depthWrite: false,
  })
}
