import { ShaderMaterial } from 'three'

export const createFireProjectileMaterial = () => {
  return new ShaderMaterial({
    uniforms: {
      uTime: { value: 15 },
      uIntensity: { value: 1.5 },
      uOpacity: { value: 0.5 },
    },
    lights: false,
    fog: false,
    toneMapped: false,
    vertexShader: `
      uniform float uTime;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      
      void main() {
        vUv = uv;
        vPosition = position;
        
        // More aggressive vertex displacement for fire movement
        vec3 pos = position;
        float wave = sin(uTime * 5.0 + position.y * 10.0) * 0.05;
        float wave2 = cos(uTime * 7.0 + position.x * 8.0) * 0.03;
        pos.x += wave;
        pos.z += wave2;
        pos.y += sin(uTime * 6.0 + position.x * 5.0) * 0.04;
        
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPosition = worldPos.xyz;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uIntensity;
      uniform float uOpacity;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vWorldPosition;
      
      // Better noise function for fire
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
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
        
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 =   v - i + dot(i, C.xxx) ;
        
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        i = mod289(i);
        vec4 p = permute( permute( permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
               
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );
        
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
      }
      
      // Fractal noise for more detail
      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 2.0;
        
        for (int i = 0; i < 4; i++) {
          value += amplitude * snoise(p * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        
        return value;
      }
      
      void main() {
        vec2 center = vUv - vec2(0.5);
        float dist = length(center);
        
        // Create very noisy, chaotic fire shape
        vec3 noiseCoord = vec3(vUv * 2.0, uTime * 0.8);
        float noise1 = fbm(noiseCoord + vec3(0.0, uTime * 0.5, 0.0));
        float noise2 = fbm(noiseCoord * 3.0 + vec3(100.0, uTime * 0.3, 50.0));
        float noise3 = snoise(noiseCoord * 5.0 + vec3(200.0, uTime * 0.7, 100.0));
        
        // Combine noises for maximum chaos - adjusted to be less extreme
        float combinedNoise = noise1 * 0.4 + noise2 * 0.3 + noise3 * 0.2;
        
        // Create irregular fire shape with smoother transitions
        float fireShape = 1.0 - smoothstep(0.0, 0.6, dist + combinedNoise * 0.2);
        
        // Add more turbulence based on position
        fireShape += combinedNoise * 0.3 * (1.0 - dist);
        
        // Ensure minimum opacity to avoid black spots
        fireShape = max(fireShape, 0.3); // Never go below 0.3
        
        // Fire colors - orange to red gradient
        vec3 fireRed = vec3(1.0, 0.1, 0.0);
        vec3 fireOrange = vec3(1.0, 0.5, 0.0);
        vec3 fireYellow = vec3(1.0, 0.8, 0.2);
        
        // Color based on noise and distance
        float colorMix = combinedNoise * 0.5 + 0.5 + dist * 0.3;
        vec3 fireColor = mix(fireYellow, fireOrange, smoothstep(0.0, 0.5, colorMix));
        fireColor = mix(fireColor, fireRed, smoothstep(0.3, 0.8, colorMix));
        
        // Add hot spots
        float hotSpots = pow(max(0.0, combinedNoise), 2.0);
        fireColor += vec3(0.3, 0.1, 0.0) * hotSpots;
        
        // More transparent overall with opacity control
        float alpha = fireShape * uOpacity; // Now uses uOpacity uniform
        alpha *= (1.0 - smoothstep(0.2, 0.6, dist)); // Smoother edge falloff
        
        // Ensure minimum alpha to prevent black spots
        alpha = max(alpha, 0.15);
        
        // Add flicker
        float flicker = 0.7 + 0.3 * sin(uTime * 15.0 + combinedNoise * 10.0);
        
        // Final color with intensity
        vec3 finalColor = fireColor * uIntensity * flicker;
        
        // Ensure color is never black - add minimum emission
        finalColor = max(finalColor, vec3(0.1, 0.05, 0.0));
        
        // Clamp final alpha to ensure it's within bounds
        alpha = clamp(alpha, 0.0, 1.0);
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: false,
    blending: 1,
    depthWrite: false,
    depthTest: true,
    side: 0,
  })
}
