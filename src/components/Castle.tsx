import { ShaderMaterial, Color } from 'three'
import { useGLTF } from '@react-three/drei'
import { Mesh, BufferGeometry, Object3D } from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const createFuturisticMaterial = (
  baseColor: string,
  intensity: number = 1.0
) => {
  return new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Color(baseColor) },
      uIntensity: { value: intensity },
      uGradientSpeed: { value: 0.5 },
      uWaveScale: { value: 2.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying float vElevation;
      
      uniform float uTime;
      uniform float uWaveScale;
      
      void main() {
        vUv = uv;
        vPosition = position;
        vNormal = normal;
        
        // Simple elevation calculation for gradient
        vElevation = position.y;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uIntensity;
      uniform float uGradientSpeed;
      uniform float uWaveScale;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying float vElevation;
      
      void main() {
        // Simple moving gradient based on UV and time
        float gradient1 = sin(vUv.x * uWaveScale + uTime * uGradientSpeed) * 0.5 + 0.5;
        float gradient2 = cos(vUv.y * uWaveScale + uTime * uGradientSpeed * 0.7) * 0.5 + 0.5;
        
        // Combine gradients
        float combined = gradient1 * 0.6 + gradient2 * 0.4;
        
        // Add subtle elevation variation
        float elevationFactor = sin(vElevation * 0.5 + uTime * 0.3) * 0.2 + 0.8;
        
        // Create color variation
        vec3 baseColor = uColor;
        vec3 brightColor = baseColor * 1.3;
        vec3 darkColor = baseColor * 0.7;
        
        // Mix colors based on gradient
        vec3 finalColor = mix(darkColor, brightColor, combined);
        finalColor *= elevationFactor * uIntensity;
        
        // Add subtle rim lighting effect
        float rimLight = 1.0 - abs(dot(vNormal, vec3(0.0, 1.0, 0.0)));
        finalColor += baseColor * rimLight * 0.3;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  })
}

interface ModelProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number] | number
  [key: string]: unknown
}

export function Castle(props: ModelProps = {}) {
  const gltf = useGLTF('/castle_low_poly.glb')

  const woodMaterial = useRef(createFuturisticMaterial('#8B4513', 0.1))
  const bricksMaterial = useRef(createFuturisticMaterial('#FF69B4', 1.5))
  const wallsMaterial = useRef(createFuturisticMaterial('#6A0DAD', 1.1))
  const groundMaterial = useRef(createFuturisticMaterial('#6A0DAD', 0.1))

  const nodes = gltf.nodes as {
    Cube001_0: Mesh
    Cube001_1: Mesh
    Cube001_1_1: Mesh
    Cube001_1_2: Mesh
    Cube001_2: Mesh
    Cube001_3: Mesh
    [key: string]: Object3D
  }

  useFrame((state) => {
    const time = state.clock.elapsedTime

    woodMaterial.current.uniforms.uTime.value = time
    bricksMaterial.current.uniforms.uTime.value = time
    wallsMaterial.current.uniforms.uTime.value = time
    groundMaterial.current.uniforms.uTime.value = time
  })

  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <group
          position={[1.315, 0.231, 1.595]}
          rotation={[0.007, 0, -Math.PI / 2]}
        >
          {/* Wood parts - brownish red */}
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube001_0.geometry as BufferGeometry}
            material={woodMaterial.current}
          />

          {/* Brick parts - hot pink */}
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube001_1.geometry as BufferGeometry}
            material={bricksMaterial.current}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube001_1_1.geometry as BufferGeometry}
            material={bricksMaterial.current}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube001_1_2.geometry as BufferGeometry}
            material={bricksMaterial.current}
          />

          {/* Walls - orchid pink */}
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube001_2.geometry as BufferGeometry}
            material={wallsMaterial.current}
          />

          {/* Ground - deep purple (will glow most with bloom) */}
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube001_3.geometry as BufferGeometry}
            material={groundMaterial.current}
          />
        </group>
      </group>
    </group>
  )
}

export function CastleOptimized(props: ModelProps = {}) {
  const gltf = useGLTF('/castle_low_poly.glb')

  const sharedMaterial = useRef(createFuturisticMaterial('#9932CC', 0.1))

  const nodes = gltf.nodes as {
    Cube001_0: Mesh
    Cube001_1: Mesh
    Cube001_1_1: Mesh
    Cube001_1_2: Mesh
    Cube001_2: Mesh
    Cube001_3: Mesh
    [key: string]: Object3D
  }

  useFrame((state) => {
    sharedMaterial.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  // Color variants using the same material
  const createColorVariant = (color: string, intensity: number) => {
    const material = sharedMaterial.current.clone()
    material.uniforms.uColor.value = new Color(color)
    material.uniforms.uIntensity.value = intensity
    return material
  }

  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <group
          position={[1.315, 0.231, 1.595]}
          rotation={[0.007, 0, -Math.PI / 2]}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube001_0.geometry as BufferGeometry}
            material={createColorVariant('#8B4513', 0.8)} // Wood
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube001_1.geometry as BufferGeometry}
            material={createColorVariant('#FF69B4', 1.0)} // Bricks
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube001_1_1.geometry as BufferGeometry}
            material={createColorVariant('#FF69B4', 1.0)} // Bricks
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube001_1_2.geometry as BufferGeometry}
            material={createColorVariant('#FF69B4', 1.0)} // Bricks
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube001_2.geometry as BufferGeometry}
            material={createColorVariant('#DA70D6', 1.2)} // Walls
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube001_3.geometry as BufferGeometry}
            material={createColorVariant('#6A0DAD', 1.5)} // Ground - brightest for bloom
          />
        </group>
      </group>
    </group>
  )
}
