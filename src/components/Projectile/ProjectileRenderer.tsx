import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import { Trail } from '@react-three/drei'
import { ShaderMaterial, Vector3 } from 'three'
import {
  PROJECTILE_CONFIG,
  TRAIL_CONFIG,
  PHYSICS_DELAY,
} from './constants/constants'
import { createFireProjectileMaterial } from '../../shaders/fireShaderMaterial'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

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
  const materialRef = useRef<ShaderMaterial>(createFireProjectileMaterial())
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })
  return (
    <group key={id}>
      <RigidBody
        key={id}
        name="projectile"
        mass={PROJECTILE_CONFIG.mass}
        gravityScale={0.3}
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
        <Trail
          width={TRAIL_CONFIG.width}
          length={TRAIL_CONFIG.length}
          color={TRAIL_CONFIG.color}
          attenuation={(t: number) => {
            return --t * t * t + 1
          }}
          interval={3}
        ></Trail>
        <mesh>
          <dodecahedronGeometry args={[PROJECTILE_CONFIG.size, 1]} />
          <primitive object={materialRef.current} attach="material" />
        </mesh>
      </RigidBody>
    </group>
  )
}
