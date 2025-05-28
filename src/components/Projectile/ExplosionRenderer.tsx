import { useMemo } from 'react'

import { ExplosionEffect } from './types/projectiles'
import {
  createFireParticleGeometry,
  createSmokeGeometry,
} from './utils/geometries'
import { calculateExplosionProperties } from './utils/projectileHelpers'
import { EXPLOSION_CONFIG } from './constants/constants'

interface ExplosionRendererProps {
  explosion: ExplosionEffect
}

export const ExplosionRenderer = ({ explosion }: ExplosionRendererProps) => {
  const smokeGeometry = useMemo(() => createSmokeGeometry(), [])
  const fireParticleGeometry = useMemo(() => createFireParticleGeometry(), [])

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

  return (
    <group key={explosion.id} position={explosion.position}>
      {/* Fire explosion core */}
      <mesh>
        <sphereGeometry args={[scale * EXPLOSION_CONFIG.coreSize, 16, 16]} />
        <meshStandardMaterial
          color={coreColor}
          transparent
          opacity={opacity * 0.8}
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
          opacity={opacity * 0.5}
          blending={2}
        />
      </mesh>

      {/* Smoke lines spreading from impact */}
      <lineSegments geometry={smokeGeometry} scale={[scale, scale, scale]}>
        <lineBasicMaterial
          color={smokeColor}
          transparent
          opacity={opacity * 0.7}
          blending={2}
          linewidth={2}
        />
      </lineSegments>

      {/* Fire particles */}
      <points geometry={fireParticleGeometry}>
        <pointsMaterial
          size={0.2 * scale}
          transparent
          opacity={opacity}
          vertexColors
          sizeAttenuation
          blending={2}
        />
      </points>
    </group>
  )
}
