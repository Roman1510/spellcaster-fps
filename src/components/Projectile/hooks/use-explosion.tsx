import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, Vector3 } from 'three'
import { useRapier } from '@react-three/rapier'

export interface ExplosionEffect {
  id: string
  position: Vector3
  velocity?: Vector3
  force?: number
  radius?: number
  createdAt: number
  disposed?: boolean
}

interface ExplosionConfig {
  defaultForce: number
  defaultRadius: number
  lifetime: number
  maxExplosions: number
  cleanupInterval: number
}

const DEFAULT_EXPLOSION_CONFIG: ExplosionConfig = {
  defaultForce: 50,
  defaultRadius: 5,
  lifetime: 1000,
  maxExplosions: 5,
  cleanupInterval: 150,
}

interface CreateExplosionOptions {
  position: Vector3
  velocity?: Vector3
  force?: number
  radius?: number
}

export const useExplosions = (config: Partial<ExplosionConfig> = {}) => {
  const explosionConfig = useMemo(
    () => ({ ...DEFAULT_EXPLOSION_CONFIG, ...config }),
    [config]
  )

  const [explosions, setExplosions] = useState<ExplosionEffect[]>([])

  const { world } = useRapier()
  const geometriesRef = useRef<Map<string, BufferGeometry[]>>(new Map())
  const lastCleanupRef = useRef<number>(Date.now())
  const explosionCountRef = useRef<number>(0)

  const generateExplosionId = useCallback((): string => {
    explosionCountRef.current += 1
    return `explosion-${Date.now()}-${explosionCountRef.current}`
  }, [])

  const applyExplosionForce = useCallback(
    (center: Vector3, force: number, radius: number) => {
      if (!world) {
        console.warn('Physics world not available for explosion force')
        return
      }

      try {
        let affectedBodies = 0

        world.forEachActiveRigidBody((rigidBody) => {
          try {
            if (!rigidBody || rigidBody.isFixed() || rigidBody.isKinematic()) {
              return
            }

            const bodyPos = rigidBody.translation()
            const bodyPosition = new Vector3(bodyPos.x, bodyPos.y, bodyPos.z)
            const distance = center.distanceTo(bodyPosition)

            if (distance < radius && distance > 0.01) {
              const direction = bodyPosition.clone().sub(center)

              if (direction.length() > 0.01) {
                direction.normalize()
              } else {
                direction
                  .set(
                    (Math.random() - 0.5) * 2,
                    Math.random(),
                    (Math.random() - 0.5) * 2
                  )
                  .normalize()
              }

              const falloff = Math.max(0, 1 - distance / radius)
              const explosionForce = force * falloff * falloff

              direction.y = Math.max(direction.y, 0.2)
              direction.normalize()

              const impulse = direction.multiplyScalar(explosionForce)
              rigidBody.applyImpulse(impulse, true)

              const torqueStrength = explosionForce * 0.05
              const torque = new Vector3(
                (Math.random() - 0.5) * torqueStrength,
                (Math.random() - 0.5) * torqueStrength,
                (Math.random() - 0.5) * torqueStrength
              )
              rigidBody.applyTorqueImpulse(torque, true)

              affectedBodies++
            }
          } catch (error) {
            console.error('Error applying force to rigid body:', error)
          }
        })

        console.log(`Explosion affected ${affectedBodies} bodies`)
      } catch (error) {
        console.error('Error applying explosion force:', error)
      }
    },
    [world]
  )

  const createExplosion = useCallback(
    (options: CreateExplosionOptions) => {
      try {
        if (!options.position || !options.position.isVector3) {
          console.error('Invalid position provided to createExplosion')
          return null
        }

        if (explosions.length >= explosionConfig.maxExplosions) {
          console.warn('Maximum explosions reached, removing oldest')
          setExplosions((prev) => prev.slice(1))
        }

        const explosionId = generateExplosionId()
        const force = options.force ?? explosionConfig.defaultForce
        const radius = options.radius ?? explosionConfig.defaultRadius

        const explosion: ExplosionEffect = {
          id: explosionId,
          position: options.position.clone(),
          velocity: options.velocity?.clone(),
          force,
          radius,
          createdAt: Date.now(),
          disposed: false,
        }

        applyExplosionForce(explosion.position, force, radius)

        setExplosions((prev) => [...prev, explosion])

        return explosionId
      } catch (error) {
        console.error('Error creating explosion:', error)
        return null
      }
    },
    [
      explosions.length,
      explosionConfig,
      generateExplosionId,
      applyExplosionForce,
    ]
  )

  const registerGeometry = useCallback(
    (explosionId: string, geometry: BufferGeometry) => {
      if (!geometry) return

      try {
        const existing = geometriesRef.current.get(explosionId) || []
        geometriesRef.current.set(explosionId, [...existing, geometry])
      } catch (error) {
        console.error('Error registering geometry:', error)
      }
    },
    []
  )

  const cleanupExplosionGeometry = useCallback((explosionId: string) => {
    try {
      const geometries = geometriesRef.current.get(explosionId)
      if (geometries) {
        geometries.forEach((geometry) => {
          try {
            geometry.dispose()
          } catch (error) {
            console.error('Error disposing geometry:', error)
          }
        })
        geometriesRef.current.delete(explosionId)
      }
    } catch (error) {
      console.error('Error cleaning up explosion geometry:', error)
    }
  }, [])

  const removeExplosion = useCallback(
    (explosionId: string) => {
      try {
        cleanupExplosionGeometry(explosionId)

        setExplosions((prev) => prev.filter((e) => e.id !== explosionId))
      } catch (error) {
        console.error('Error removing explosion:', error)
      }
    },
    [cleanupExplosionGeometry]
  )

  const clearAllExplosions = useCallback(() => {
    try {
      for (const [explosionId] of geometriesRef.current) {
        cleanupExplosionGeometry(explosionId)
      }

      setExplosions([])
    } catch (error) {
      console.error('Error clearing all explosions:', error)
    }
  }, [cleanupExplosionGeometry])

  useFrame(() => {
    const now = Date.now()

    if (now - lastCleanupRef.current < explosionConfig.cleanupInterval) {
      return
    }

    lastCleanupRef.current = now

    try {
      setExplosions((prev) => {
        const expiredExplosions: string[] = []

        const newExplosions = prev.filter((explosion) => {
          const isExpired = now - explosion.createdAt > explosionConfig.lifetime
          if (isExpired) {
            expiredExplosions.push(explosion.id)
          }
          return !isExpired
        })

        expiredExplosions.forEach((id) => {
          console.log('Cleaning up geometries for expired explosion:', id)
          cleanupExplosionGeometry(id)
        })

        const activeExplosionIds = new Set(newExplosions.map((e) => e.id))
        const geometryIds = Array.from(geometriesRef.current.keys())

        geometryIds.forEach((geometryId) => {
          if (!activeExplosionIds.has(geometryId)) {
            console.log('Cleaning up orphaned geometries for:', geometryId)
            cleanupExplosionGeometry(geometryId)
          }
        })

        return newExplosions.length !== prev.length ? newExplosions : prev
      })
    } catch (error) {
      console.error('Error during explosion cleanup:', error)
    }
  })

  useEffect(() => {
    const currentGeometries = geometriesRef.current

    return () => {
      try {
        for (const [, geometries] of currentGeometries) {
          if (geometries) {
            geometries.forEach((geometry) => {
              try {
                geometry.dispose()
              } catch (error) {
                console.error('Error disposing geometry during unmount:', error)
              }
            })
          }
        }

        currentGeometries.clear()
      } catch (error) {
        console.error('Error during cleanup on unmount:', error)
      }
    }
  }, [])

  const getDebugInfo = useCallback(() => {
    const geometryCount = Array.from(geometriesRef.current.values()).reduce(
      (total, geometries) => total + geometries.length,
      0
    )

    console.log('=== EXPLOSION DEBUG ===')
    console.log('Active explosions:', explosions.length)
    console.log('Tracked geometry groups:', geometriesRef.current.size)
    console.log('Total geometries:', geometryCount)
    console.log(
      'Explosion IDs:',
      explosions.map((e) => e.id)
    )
    console.log('Geometry IDs:', Array.from(geometriesRef.current.keys()))
    console.log('======================')

    return {
      explosionCount: explosions.length,
      geometryCount,
      config: explosionConfig,
    }
  }, [explosionConfig, explosions])

  return {
    explosions,
    createExplosion,

    removeExplosion,
    clearAllExplosions,

    registerGeometry,
    cleanupExplosionGeometry,

    applyExplosionForce,

    getDebugInfo,
    logDebugInfo: () => getDebugInfo(),

    config: explosionConfig,
  }
}
