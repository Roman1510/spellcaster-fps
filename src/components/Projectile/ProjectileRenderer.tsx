import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import { Trail } from '@react-three/drei'
import { Vector3 } from 'three'
import {
  PROJECTILE_CONFIG,
  TRAIL_CONFIG,
  PROJECTILE_COLORS,
  PHYSICS_DELAY,
} from './constants/constants'

interface ProjectileRendererProps {
  id: string
  position: Vector3
  direction: Vector3
  onCollision: (projectileId: string) => void
  setRef: (projectileId: string, ref: RapierRigidBody | null) => void
}

export const ProjectileRenderer = ({
  id,
  position,
  direction,
  onCollision,
  setRef,
}: ProjectileRendererProps) => {
  return (
    <group key={id}>
      <Trail
        width={TRAIL_CONFIG.width}
        length={TRAIL_CONFIG.length}
        color={TRAIL_CONFIG.color}
        attenuation={(t: number) => {
          return --t * t * t + 1
        }}
        interval={3}
      >
        <RigidBody
          name="projectile"
          mass={PROJECTILE_CONFIG.mass}
          position={[position.x, position.y, position.z]}
          ref={(ref) => {
            if (ref) {
              setRef(id, ref)
              setTimeout(() => {
                const dir = direction.clone()
                const velocity = PROJECTILE_CONFIG.velocity
                ref.setLinvel(
                  new Vector3(
                    dir.x * velocity,
                    dir.y * velocity,
                    dir.z * velocity
                  ),
                  true
                )
              }, PHYSICS_DELAY)
            }
          }}
          friction={PROJECTILE_CONFIG.friction}
          colliders="ball"
          linearDamping={PROJECTILE_CONFIG.linearDamping}
          restitution={PROJECTILE_CONFIG.restitution}
          onCollisionEnter={() => {
            onCollision(id)
          }}
        >
          <mesh>
            <sphereGeometry args={[PROJECTILE_CONFIG.size, 10, 10]} />
            <meshStandardMaterial
              color={PROJECTILE_COLORS.main}
              emissive={PROJECTILE_COLORS.emissive}
              emissiveIntensity={PROJECTILE_COLORS.emissiveIntensity}
              transparent
              opacity={PROJECTILE_COLORS.opacity}
            />
          </mesh>
        </RigidBody>
      </Trail>
    </group>
  )
}
