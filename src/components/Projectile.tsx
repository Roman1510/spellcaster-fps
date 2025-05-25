import { useThree, useFrame } from '@react-three/fiber'
import { RapierRigidBody, RigidBody } from '@react-three/rapier'
import { Trail, Points } from '@react-three/drei'
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
}

interface ImpactEffect {
  id: string
  position: Vector3
  createdAt: number
}

export const Projectile = () => {
  const { camera } = useThree()
  const [projectiles, setProjectiles] = useState<ProjectileData[]>([])
  const [impactEffects, setImpactEffects] = useState<ImpactEffect[]>([])
  const projectileRefs = useRef<Map<string, RapierRigidBody>>(new Map())

  const position = useMemo(() => new Vector3(), [])
  const direction = useMemo(() => new Vector3(), [])
  const offset = useMemo(() => new Vector3(0.5, -0.1, -3.6), [])

  const muzzleFlashGeometry = useMemo(() => {
    const geometry = new BufferGeometry()
    const positions = []
    const colors = []

    // Create random points for particle explosion
    for (let i = 0; i < 50; i++) {
      const radius = Math.random() * 3
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      positions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      )

      // Orange to red colors for muzzle flash
      const color = new Color().setHSL(
        0.02 + Math.random() * 0.1,
        1,
        0.6 + Math.random() * 0.5
      )
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

  const createImpactEffect = useCallback((position: Vector3) => {
    const impactId = `impact-${Date.now()}-${Math.random()}`
    setImpactEffects((prev) => [
      ...prev,
      {
        id: impactId,
        position: position.clone(),
        createdAt: Date.now(),
      },
    ])
  }, [])

  const clickToCreateBox = useCallback(() => {
    if (document.pointerLockElement && camera) {
      camera.getWorldPosition(position)
      camera.getWorldDirection(direction)

      addRandomness(direction, 0.02)
      direction.normalize()

      const projectileStartPosition = position
        .clone()
        .add(offset.clone().applyQuaternion(camera.quaternion))

      const projectileId = `projectile-${Date.now()}-${Math.random()}`

      const newMesh = (
        <group key={projectileId}>
          {/* Main projectile with trail */}
          <Trail
            width={2}
            length={8}
            color={'#ff4400'}
            attenuation={(t) => t * t}
          >
            <RigidBody
              mass={15}
              ref={(ref) => {
                if (ref) {
                  projectileRefs.current.set(projectileId, ref)
                }
              }}
              friction={0.1}
              colliders="ball"
              onCollisionEnter={() => {
                // Create impact effect on collision
                const rigidBody = projectileRefs.current.get(projectileId)
                const worldPos = rigidBody?.translation()
                if (worldPos) {
                  createImpactEffect(
                    new Vector3(worldPos.x, worldPos.y, worldPos.z)
                  )
                }
              }}
            >
              <mesh
                position={[
                  projectileStartPosition.x,
                  projectileStartPosition.y,
                  projectileStartPosition.z,
                ]}
              >
                <sphereGeometry args={[0.8, 16, 16]} />
                <meshStandardMaterial
                  color="#ff6600"
                  emissive="#ff2200"
                  emissiveIntensity={2}
                  transparent
                  opacity={0.9}
                />
              </mesh>
            </RigidBody>
          </Trail>

          {/* Outer glow effect */}
          <Trail
            width={4}
            length={12}
            color={'#ff8844'}
            attenuation={(t) => t * t * t}
          >
            <mesh
              position={[
                projectileStartPosition.x,
                projectileStartPosition.y,
                projectileStartPosition.z,
              ]}
            >
              <sphereGeometry args={[1.2, 8, 8]} />
              <meshBasicMaterial color="#ff4400" transparent opacity={0.3} />
            </mesh>
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
  }, [camera, position, direction, offset, createImpactEffect])

  // Apply physics to projectiles
  useEffect(() => {
    projectiles.forEach((projectile) => {
      const ref = projectileRefs.current.get(projectile.id)
      if (ref) {
        const dir = projectile.direction
        const velocity = 120
        ref.setLinvel(
          new Vector3(dir.x * velocity, dir.y * velocity, dir.z * velocity),
          false
        )
      }
    })
  }, [projectiles])

  // Cleanup old projectiles and impact effects
  useFrame(() => {
    const now = Date.now()
    const projectileLifetime = 8000 // 8 seconds
    const impactLifetime = 1000 // 1 second

    // Remove old projectiles
    setProjectiles((prev) => {
      const newProjectiles = prev.filter((p) => {
        if (now - p.createdAt > projectileLifetime) {
          projectileRefs.current.delete(p.id)
          return false
        }
        return true
      })
      return newProjectiles.length !== prev.length ? newProjectiles : prev
    })

    // Remove old impact effects
    setImpactEffects((prev) => {
      const newEffects = prev.filter(
        (effect) => now - effect.createdAt < impactLifetime
      )
      return newEffects.length !== prev.length ? newEffects : prev
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

      {/* Render impact effects */}
      {impactEffects.map((effect) => {
        const age = (Date.now() - effect.createdAt) / 1000 // age in seconds
        const scale = 1 + age * 2 // grow over time
        const opacity = Math.max(0, 1 - age) // fade over time

        return (
          <group key={effect.id} position={effect.position}>
            {/* Explosion particles */}
            <Points limit={50} geometry={muzzleFlashGeometry}>
              <pointsMaterial
                size={0.1 * scale}
                transparent
                opacity={opacity}
                vertexColors
                sizeAttenuation
                blending={2}
              />
            </Points>

            {/* Shockwave ring */}
            <mesh>
              <ringGeometry args={[scale * 0.5, scale * 1.5, 16]} />
              <meshBasicMaterial
                color="#ffaa44"
                transparent
                opacity={opacity * 0.5}
                side={2} // DoubleSide
              />
            </mesh>
          </group>
        )
      })}
    </>
  )
}
