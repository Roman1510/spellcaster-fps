import { ShaderMaterial, AdditiveBlending, DoubleSide } from 'three'

export const createExplosionMaterial = () => {
  return new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAge: { value: 0.3 },
      uIntensity: { value: 55.0 },
      uOpacity: { value: 1.0 },
      uExpansion: { value: 1.1 },
    },
    lights: false,
    fog: false,
    toneMapped: false,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    depthTest: true,
    side: DoubleSide,
    vertexShader: `
      uniform float uTime;
      uniform float uAge;
      uniform float uExpansion;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      
      // Safer noise function with bounds checking
      float hash(float n) {
        return fract(sin(n) * 43758.5453);
      }
      
      float noise(vec3 x) {
        vec3 p = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        float n = p.x + p.y * 57.0 + 113.0 * p.z;
        
        // Clamp to prevent extreme values
        n = clamp(n, -1000.0, 1000.0);
        
        return mix(
          mix(
            mix(hash(n + 0.0), hash(n + 1.0), f.x),
            mix(hash(n + 57.0), hash(n + 58.0), f.x),
            f.y
          ),
          mix(
            mix(hash(n + 113.0), hash(n + 114.0), f.x),
            mix(hash(n + 170.0), hash(n + 171.0), f.x),
            f.y
          ),
          f.z
        );
      }
      
      void main() {
        vUv = uv;
        vPosition = position;
        vNormal = normalize(normal); // FIXED: Ensure normal is normalized
        
        // Explosion expansion and distortion
        vec3 pos = position;
        
        // Add turbulent displacement based on age
        float noiseScale = 3.0;
        vec3 noisePos = position * noiseScale + uTime * 0.5;
        float displacement = noise(noisePos) * 0.3;
        
        // FIXED: Clamp displacement to prevent extreme values
        displacement = clamp(displacement, -2.0, 2.0);
        
        // More displacement at the beginning, less as it ages
        displacement *= (1.0 - clamp(uAge, 0.0, 1.0) * 0.5);
        
        // Expand outward with some noise
        pos += vNormal * (uExpansion + displacement);
        
        // Add some fast flickering movement with clamping
        float flicker = sin(uTime * 20.0 + position.y * 10.0) * 0.05 * (1.0 - clamp(uAge, 0.0, 1.0));
        pos += vNormal * clamp(flicker, -0.1, 0.1);
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uAge;
      uniform float uIntensity;
      uniform float uOpacity;
      uniform float uExpansion;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      
      // Safer simplex noise implementation
      vec3 mod289(vec3 x) { 
        return x - floor(x * (1.0 / 289.0)) * 289.0; 
      }
      
      vec4 mod289(vec4 x) { 
        return x - floor(x * (1.0 / 289.0)) * 289.0; 
      }
      
      vec4 permute(vec4 x) { 
        return mod289(((x*34.0)+1.0)*x); 
      }
      
      vec4 taylorInvSqrt(vec4 r) { 
        return 1.79284291400159 - 0.85373472095314 * r; 
      }
      
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        i = mod289(i);
        vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
        
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        
        float result = 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        
        // FIXED: Clamp noise output to prevent NaN/extreme values
        return clamp(result, -1.0, 1.0);
      }
      
      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 2.0;
        
        for (int i = 0; i < 4; i++) {
          float noiseVal = snoise(p * frequency);
          // FIXED: Check for NaN and clamp
          if (noiseVal != noiseVal) noiseVal = 0.0; // NaN check
          value += amplitude * noiseVal;
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        
        return clamp(value, -1.0, 1.0);
      }
      
      void main() {
        // FIXED: Safer view direction calculation
        vec3 viewDir = normalize(cameraPosition - vPosition);
        vec3 safeNormal = normalize(vNormal);
        
        // FIXED: Clamp dot product to prevent extreme fresnel values
        float dotProduct = clamp(dot(viewDir, safeNormal), 0.0, 1.0);
        float fresnel = pow(1.0 - dotProduct, 1.5);
        
        // Create animated noise with bounds checking
        vec3 noiseCoord = vPosition * 2.0 + vec3(uTime * 0.3);
        float noise1 = fbm(noiseCoord);
        float noise2 = fbm(noiseCoord * 3.0 + vec3(100.0));
        float noise3 = snoise(noiseCoord * 5.0 + vec3(uTime * 2.0));
        
        float combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
        combinedNoise = clamp(combinedNoise, -1.0, 1.0);
        
        // FIXED: Safer age clamping
        float safeAge = clamp(uAge, 0.0, 2.0);
        
        // Create explosion shape that changes with age
        float explosionShape = 1.0;
        vec2 centeredUV = vUv - 0.5;
        float uvDist = length(centeredUV);
        
        // Initial blast is bright and solid
        if (safeAge < 0.2) {
          explosionShape = 1.0 - smoothstep(0.0, 0.3, uvDist);
        } else {
          // As it ages, it becomes more chaotic and hollow
          float hollowness = smoothstep(0.2, 1.0, safeAge);
          float innerRadius = 0.2 * hollowness;
          
          explosionShape = smoothstep(innerRadius, 0.5, uvDist) * (1.0 - smoothstep(0.3, 0.5, uvDist));
          explosionShape += combinedNoise * 0.4 * (1.0 - safeAge);
        }
        
        // Add fresnel for edge glow
        explosionShape += fresnel * 0.3 * (1.0 - safeAge);
        explosionShape = clamp(explosionShape, 0.0, 2.0);
        
        // Color gradient - changes over time
        vec3 coreColor = vec3(1.0, 1.0, 0.8); // White-yellow core
        vec3 midColor = vec3(1.0, 0.5, 0.1);  // Orange middle
        vec3 outerColor = vec3(0.8, 0.1, 0.0); // Red outer
        vec3 smokeColor = vec3(0.2, 0.2, 0.2); // Dark smoke
        
        // Color based on age and position
        float colorMix = combinedNoise * 0.5 + 0.5 + safeAge;
        colorMix = clamp(colorMix, 0.0, 1.0);
        
        vec3 fireColor = mix(coreColor, midColor, smoothstep(0.0, 0.3, colorMix));
        fireColor = mix(fireColor, outerColor, smoothstep(0.3, 0.7, colorMix));
        
        // Transition to smoke as it ages
        fireColor = mix(fireColor, smokeColor, smoothstep(0.5, 1.5, safeAge));
        
        // Hot spots and bright areas
        float hotSpots = pow(max(0.0, noise1), 2.0) * (1.0 - smoothstep(0.0, 0.4, safeAge));
        fireColor += vec3(0.5, 0.2, 0.0) * hotSpots;
        
        // FIXED: Safer opacity calculation
        float alpha = explosionShape * clamp(uOpacity, 0.0, 1.0);
        alpha *= (1.0 - smoothstep(0.0, 1.0, safeAge * 0.7));
        alpha = clamp(alpha, 0.0, 1.0);
        
        // Add flicker for realism
        float flicker = 0.8 + 0.2 * sin(uTime * 30.0 + combinedNoise * 20.0);
        flicker = mix(1.0, flicker, 1.0 - safeAge);
        flicker = clamp(flicker, 0.5, 1.5);
        
        // Final color with intensity
        float safeIntensity = clamp(uIntensity, 0.0, 100.0);
        vec3 finalColor = fireColor * safeIntensity * flicker;
        
        // FIXED: Ensure colors don't go extreme
        finalColor = clamp(finalColor, vec3(0.0), vec3(10.0));
        
        // Ensure minimum visibility for the core during initial blast
        if (safeAge < 0.1) {
          finalColor = max(finalColor, vec3(0.5, 0.2, 0.0));
          alpha = max(alpha, 0.8);
        }
        
        // FIXED: Final safety check for output
        if (alpha <= 0.001) {
          discard; // Discard completely transparent pixels to prevent artifacts
        }
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
  })
}
