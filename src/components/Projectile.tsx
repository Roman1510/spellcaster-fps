import { useThree, useFrame } from '@react-three/fiber'
import { RapierRigidBody, RigidBody } from '@react-three/rapier'
import { Trail } from '@react-three/drei'
import {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
  ReactElement,
} from 'react'
import { Vector3, BufferGeometry, Float32BufferAttribute, Color } from 'three'

interface ProjectileData {
  id: string
  mesh: ReactElement
  direction: Vector3
  createdAt: number
  position: Vector3
  impactedAt?: number
}

interface ExplosionEffect {
  id: string
  position: Vector3
  createdAt: number
}

export const Projectile = () => {
  const { camera } = useThree()
  const [projectiles, setProjectiles] = useState<ProjectileData[]>([])
  const [explosions, setExplosions] = useState<ExplosionEffect[]>([])
  const projectileRefs = useRef<Map<string, RapierRigidBody>>(new Map())

  const position = useMemo(() => new Vector3(), [])
  const direction = useMemo(() => new Vector3(), [])
  const offset = useMemo(() => new Vector3(0.5, -0.1, -3.6), [])

  // Fire particle geometry for explosions
  const fireParticleGeometry = useMemo(() => {
    const geometry = new BufferGeometry()
    const positions = []
    const colors = []

    // Create random points for fire explosion
    for (let i = 0; i < 80; i++) {
      const radius = Math.random() * 4
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      positions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      )

      // Fire colors: yellow to red gradient
      const fireIntensity = Math.random()
      const color = new Color()
      if (fireIntensity > 0.7) {
        color.setHSL(0.15, 1, 0.8) // Bright yellow core
      } else if (fireIntensity > 0.4) {
        color.setHSL(0.08, 1, 0.6) // Orange
      } else {
        color.setHSL(0.02, 1, 0.5) // Red
      }
      colors.push(color.r, color.g, color.b)
    }

    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
    return geometry
  }, [])

  const addRandomness = (vec: Vector3, magnitude: number) => {
    vec.x += (Math.random() - 0.5) * magnitude
    vec.y += (Math.random() - 0.5) * magnitude
    vec.z += (Math.random() - 0.5) * magnitude
  }

  const createExplosion = useCallback((position: Vector3) => {
    const explosionId = `explosion-${Date.now()}-${Math.random()}`
    setExplosions((prev) => [
      ...prev,
      {
        id: explosionId,
        position: position.clone(),
        createdAt: Date.now(),
      },
    ])
  }, [])

  const handleProjectileImpact = useCallback(
    (projectileId: string) => {
      // Mark projectile as impacted and create explosion
      setProjectiles((prev) =>
        prev.map((p) =>
          p.id === projectileId ? { ...p, impactedAt: Date.now() } : p
        )
      )

      // Create explosion effect
      const rigidBody = projectileRefs.current.get(projectileId)
      const worldPos = rigidBody?.translation()
      if (worldPos) {
        createExplosion(new Vector3(worldPos.x, worldPos.y, worldPos.z))
      }
    },
    [createExplosion]
  )

  const clickToCreateBox = useCallback(() => {
    if (document.pointerLockElement && camera) {
      camera.getWorldPosition(position)
      camera.getWorldDirection(direction)

      addRandomness(direction, 0.015)
      direction.normalize()

      const projectileStartPosition = position
        .clone()
        .add(offset.clone().applyQuaternion(camera.quaternion))

      const projectileId = `projectile-${Date.now()}-${Math.random()}`

      const newMesh = (
        <group key={projectileId}>
          {/* Main projectile with fire trail */}
          <Trail
            width={2}
            length={8}
            color={'#ff3300'}
            attenuation={(t) => t * t}
          >
            <RigidBody
              mass={12}
              position={[
                projectileStartPosition.x,
                projectileStartPosition.y,
                projectileStartPosition.z,
              ]}
              ref={(ref) => {
                if (ref) {
                  projectileRefs.current.set(projectileId, ref)
                }
              }}
              friction={0.05}
              colliders="ball"
              onCollisionEnter={() => {
                handleProjectileImpact(projectileId)
              }}
            >
              <mesh>
                <sphereGeometry args={[0.6, 12, 12]} />
                <meshStandardMaterial
                  color="#ff4400"
                  emissive="#ff1100"
                  emissiveIntensity={3}
                  transparent
                  opacity={0.95}
                />
              </mesh>
            </RigidBody>
          </Trail>
        </group>
      )

      setProjectiles((prevProjectiles) => [
        ...prevProjectiles,
        {
          id: projectileId,
          mesh: newMesh,
          direction: direction.clone(),
          createdAt: Date.now(),
          position: projectileStartPosition.clone(),
        },
      ])
    }
  }, [camera, position, direction, offset, handleProjectileImpact])

  // Apply physics to projectiles
  useEffect(() => {
    projectiles.forEach((projectile) => {
      const ref = projectileRefs.current.get(projectile.id)
      if (ref) {
        const dir = projectile.direction
        const velocity = 140
        ref.setLinvel(
          new Vector3(dir.x * velocity, dir.y * velocity, dir.z * velocity),
          false
        )
      }
    })
  }, [projectiles])

  // Cleanup old projectiles and explosions
  useFrame(() => {
    const now = Date.now()
    const projectileLifetime = 6000 // 6 seconds
    const impactDisappearTime = 200 // 0.2 seconds after impact
    const explosionLifetime = 800 // 0.8 seconds for fire explosion

    // Remove old projectiles and impacted projectiles
    setProjectiles((prev) => {
      const newProjectiles = prev.filter((p) => {
        // Remove if impacted and 0.2 seconds have passed
        if (p.impactedAt && now - p.impactedAt > impactDisappearTime) {
          projectileRefs.current.delete(p.id)
          return false
        }
        // Remove if lifetime exceeded (for projectiles that never hit anything)
        if (now - p.createdAt > projectileLifetime) {
          projectileRefs.current.delete(p.id)
          return false
        }
        return true
      })
      return newProjectiles.length !== prev.length ? newProjectiles : prev
    })

    // Remove old explosions
    setExplosions((prev) => {
      const newExplosions = prev.filter(
        (explosion) => now - explosion.createdAt < explosionLifetime
      )
      return newExplosions.length !== prev.length ? newExplosions : prev
    })
  })

  useEffect(() => {
    const handleClick = () => clickToCreateBox()
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [clickToCreateBox])

  return (
    <>
      {/* Render projectiles */}
      {projectiles.map((proj) => proj.mesh)}

      {/* Render fire explosions */}
      {explosions.map((explosion) => {
        const age = (Date.now() - explosion.createdAt) / 1000 // age in seconds
        const scale = 1 + age * 3 // expand faster
        const opacity = Math.max(0, 1 - age * 1.2) // fade faster

        return (
          <group key={explosion.id} position={explosion.position}>
            {/* Fire explosion core */}
            <mesh>
              <sphereGeometry args={[scale * 0.8, 16, 16]} />
              <meshStandardMaterial
                color={`hsl(${15 + Math.sin(age * 10) * 10}, 100%, ${
                  70 - age * 30
                }%)`}
                transparent
                opacity={opacity * 0.8}
                emissive={`hsl(${10 + Math.sin(age * 15) * 5}, 100%, ${
                  40 - age * 20
                }%)`}
                emissiveIntensity={2 - age}
              />
            </mesh>

            {/* Outer fire blast */}
            <mesh>
              <sphereGeometry args={[scale * 1.5, 12, 12]} />
              <meshBasicMaterial
                color={`hsl(${5 + Math.sin(age * 8) * 8}, 100%, ${
                  50 - age * 25
                }%)`}
                transparent
                opacity={opacity * 0.4}
                blending={2} // Additive
              />
            </mesh>

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
      })}
    </>
  )
}
