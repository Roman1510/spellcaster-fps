import { useMemo, useRef } from 'react'
import { Vector3, Color, BufferGeometry, ShaderMaterial } from 'three'
import { ExplosionEffect } from './hooks/use-explosion'
import {
  createCircularFireParticles,
  createFireParticleGeometry,
  createSmokeGeometry,
} from './utils/geometries'
import { calculateExplosionProperties } from './utils/projectileHelpers'
import { EXPLOSION_CONFIG } from './constants/constants'
import { createCircularParticleMaterial } from '../../shaders/circularParticleShader'

interface ExplosionRendererProps {
  explosion: ExplosionEffect
  registerGeometry?: (explosionId: string, geometry: BufferGeometry) => void
}

export const ExplosionRenderer = ({
  explosion,
  registerGeometry,
}: ExplosionRendererProps) => {
  const smokeGeometry = useMemo(() => {
    const geom = createSmokeGeometry()
    if (registerGeometry) {
      registerGeometry(explosion.id, geom)
    }
    return geom
  }, [explosion.id, registerGeometry])

  const fireParticleGeometry = useMemo(() => {
    const geom = createFireParticleGeometry()
    if (registerGeometry) {
      registerGeometry(explosion.id, geom)
    }
    return geom
  }, [explosion.id, registerGeometry])

  const age = (Date.now() - explosion.createdAt) / 1000
  const {
    scale,
    opacity,
    coreColor,
    emissiveColor,
    emissiveIntensity,
    blastColor,
    smokeColor,
  } = calculateExplosionProperties(age)

  // Use velocity if available for dynamic effects
  const velocityOffset = explosion.velocity
    ? new Vector3(
        explosion.velocity.x * age * 0.1,
        explosion.velocity.y * age * 0.05,
        explosion.velocity.z * age * 0.1
      )
    : new Vector3(0, 0, 0)

  const circularParticleGeometry = useMemo(
    () => createCircularFireParticles(),
    []
  )
  const particleRef = useRef<ShaderMaterial>(null)
  const circularParticleMaterial = useMemo(
    () => createCircularParticleMaterial(),
    []
  )

  return (
    <group position={explosion.position}>
      {/* Fire explosion core */}
      <mesh>
        <sphereGeometry args={[scale * EXPLOSION_CONFIG.coreSize, 16, 16]} />
        <meshStandardMaterial
          color={coreColor}
          transparent
          opacity={opacity * 0.75}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      {/* Outer fire blast */}
      <mesh>
        <sphereGeometry args={[scale * EXPLOSION_CONFIG.blastSize, 12, 12]} />
        <meshBasicMaterial
          color={blastColor}
          transparent
          opacity={opacity * 0.4}
          blending={2} // Additive blending
        />
      </mesh>
      {/* Secondary blast wave for more depth */}
      <mesh>
        <sphereGeometry
          args={[scale * EXPLOSION_CONFIG.blastSize * 1.3, 10, 10]}
        />
        <meshBasicMaterial
          color={new Color(0xff4400)}
          transparent
          opacity={opacity * 0.3}
          blending={2}
        />
      </mesh>
      {/* Smoke lines spreading from impact */}
      <lineSegments
        geometry={smokeGeometry}
        scale={[scale * 1.5, scale, scale * 1.5]}
      >
        <lineBasicMaterial
          color={smokeColor}
          transparent
          opacity={opacity * 0.7}
          blending={2}
          linewidth={2}
        />
      </lineSegments>
      Fire particles with velocity influence
      <points geometry={fireParticleGeometry} position={velocityOffset}>
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
      <points geometry={circularParticleGeometry}>
        <primitive object={circularParticleMaterial} ref={particleRef} />
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
