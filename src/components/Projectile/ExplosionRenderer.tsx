import { useMemo, useRef, useEffect } from 'react'
import {
  Vector3,
  Color,
  BufferGeometry,
  ShaderMaterial,
  SphereGeometry,
} from 'three'
import { useFrame } from '@react-three/fiber'
import { ExplosionEffect } from './hooks/use-explosion'
import {
  createCircularFireParticles,
  createFireParticleGeometry,
  createSmokeGeometry,
} from './utils/geometries'
import { calculateExplosionProperties } from './utils/projectileHelpers'
import { EXPLOSION_CONFIG } from './constants/constants'
import { createCircularParticleMaterial } from '../../shaders/circularParticleShader'
import { createExplosionMaterial } from '../../shaders/explosionShader'

let sharedExplosionGeometry: SphereGeometry | null = null
let sharedExplosionMaterial: ShaderMaterial | null = null
let sharedSmokeGeometry: BufferGeometry | null = null
let sharedFireParticleGeometry: BufferGeometry | null = null
let sharedCircularParticleGeometry: BufferGeometry | null = null
let explosionInstanceCount = 0

const getSharedResources = () => {
  if (!sharedExplosionGeometry) {
    sharedExplosionGeometry = new SphereGeometry(
      EXPLOSION_CONFIG.blastSize,
      16,
      16
    )
  }
  if (!sharedExplosionMaterial) {
    sharedExplosionMaterial = createExplosionMaterial()
  }
  if (!sharedSmokeGeometry) {
    sharedSmokeGeometry = createSmokeGeometry()
  }
  if (!sharedFireParticleGeometry) {
    sharedFireParticleGeometry = createFireParticleGeometry()
  }
  if (!sharedCircularParticleGeometry) {
    sharedCircularParticleGeometry = createCircularFireParticles()
  }

  explosionInstanceCount++

  return {
    explosionGeometry: sharedExplosionGeometry,
    explosionMaterial: sharedExplosionMaterial,
    smokeGeometry: sharedSmokeGeometry,
    fireParticleGeometry: sharedFireParticleGeometry,
    circularParticleGeometry: sharedCircularParticleGeometry,
  }
}

const releaseSharedResources = () => {
  explosionInstanceCount--

  if (explosionInstanceCount === 0) {
    sharedExplosionGeometry?.dispose()
    sharedExplosionMaterial?.dispose()
    sharedSmokeGeometry?.dispose()
    sharedFireParticleGeometry?.dispose()
    sharedCircularParticleGeometry?.dispose()

    sharedExplosionGeometry = null
    sharedExplosionMaterial = null
    sharedSmokeGeometry = null
    sharedFireParticleGeometry = null
    sharedCircularParticleGeometry = null
  }
}

interface ExplosionRendererProps {
  explosion: ExplosionEffect
  registerGeometry?: (explosionId: string, geometry: BufferGeometry) => void
}

export const ExplosionRenderer = ({
  explosion,
  registerGeometry,
}: ExplosionRendererProps) => {
  const resources = useRef(getSharedResources())
  const hasCleanedUp = useRef(false)

  const explosionMaterialInstance = useMemo(() => {
    const mat = resources.current.explosionMaterial.clone()
    return mat
  }, [])

  const circularParticleMaterial = useMemo(
    () => createCircularParticleMaterial(),
    []
  )

  useFrame((state) => {
    if (hasCleanedUp.current) return

    const age = (Date.now() - explosion.createdAt) / 1000

    if (explosionMaterialInstance) {
      explosionMaterialInstance.uniforms.uTime.value = state.clock.elapsedTime
      explosionMaterialInstance.uniforms.uAge.value = age
      explosionMaterialInstance.uniforms.uExpansion.value = Math.min(
        age * 2,
        1.5
      )
      explosionMaterialInstance.uniforms.uOpacity.value = 1.0 - age / 2
      explosionMaterialInstance.uniforms.uIntensity.value = Math.max(
        0.5,
        2.0 - age
      )
    }
  })

  useEffect(() => {
    if (registerGeometry) {
      registerGeometry(explosion.id, resources.current.explosionGeometry)
      registerGeometry(explosion.id, resources.current.smokeGeometry)
      registerGeometry(explosion.id, resources.current.fireParticleGeometry)
    }

    return () => {
      if (!hasCleanedUp.current) {
        hasCleanedUp.current = true
        explosionMaterialInstance.dispose()
        circularParticleMaterial.dispose()
        releaseSharedResources()
      }
    }
  }, [
    explosion.id,
    explosionMaterialInstance,
    circularParticleMaterial,
    registerGeometry,
  ])

  const age = (Date.now() - explosion.createdAt) / 1000
  const { scale, opacity, smokeColor } = calculateExplosionProperties(age)

  const velocityOffset = explosion.velocity
    ? new Vector3(
        explosion.velocity.x * age * 0.1,
        explosion.velocity.y * age * 0.2,
        explosion.velocity.z * age * 0.1
      )
    : new Vector3(0, 0, 0)

  return (
    <group position={explosion.position}>
      {/* Main explosion with shader */}
      <mesh scale={scale}>
        <primitive
          object={resources.current.explosionGeometry}
          attach="geometry"
        />
        <primitive object={explosionMaterialInstance} attach="material" />
      </mesh>

      {/* Smoke lines spreading from impact */}
      <lineSegments
        geometry={resources.current.smokeGeometry}
        scale={[scale * 1.3, scale * 1.2, scale * 1.3]}
      >
        <lineBasicMaterial
          color={smokeColor}
          transparent
          opacity={opacity * 0.55}
          blending={2}
          linewidth={1}
        />
      </lineSegments>

      {/* Fire particles with velocity influence */}
      <points
        geometry={resources.current.fireParticleGeometry}
        position={velocityOffset}
      >
        <pointsMaterial
          size={0.2 * scale}
          transparent
          opacity={opacity}
          vertexColors
          sizeAttenuation
          blending={2}
        />
      </points>

      {/* Circular particles */}
      <points geometry={resources.current.circularParticleGeometry}>
        <primitive object={circularParticleMaterial} attach="material" />
      </points>

      {/* Hot sparks effect (only during initial explosion) */}
      {age < 0.3 && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(
                  Array.from(
                    { length: 45 },
                    () => (Math.random() - 0.5) * scale * 2
                  )
                ),
                3,
              ]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.05 * scale}
            transparent
            opacity={opacity * 0.8}
            color={new Color(0xffff88)}
            blending={2}
          />
        </points>
      )}
    </group>
  )
}
