import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, Vector3 } from 'three'
import { useRapier } from '@react-three/rapier'

// Enhanced explosion effect interface
export interface ExplosionEffect {
  id: string
  position: Vector3
  velocity?: Vector3
  force?: number
  radius?: number
  createdAt: number
  disposed?: boolean
}

// Configuration for explosions
interface ExplosionConfig {
  defaultForce: number
  defaultRadius: number
  lifetime: number
  maxExplosions: number
  cleanupInterval: number
}

const DEFAULT_EXPLOSION_CONFIG: ExplosionConfig = {
  defaultForce: 10,
  defaultRadius: 5,
  lifetime: 1000, // 3 seconds
  maxExplosions: 10, // Prevent memory bloat
  cleanupInterval: 50, // Cleanup every 100ms
}

// Options for creating explosions
interface CreateExplosionOptions {
  position: Vector3
  velocity?: Vector3
  force?: number
  radius?: number
}

export const useExplosions = (config: Partial<ExplosionConfig> = {}) => {
  // Merge config with defaults
  const explosionConfig = useMemo(
    () => ({ ...DEFAULT_EXPLOSION_CONFIG, ...config }),
    [config]
  )

  // State for explosions
  const [explosions, setExplosions] = useState<ExplosionEffect[]>([])

  // Refs for cleanup and physics
  const { world } = useRapier()
  const geometriesRef = useRef<Map<string, BufferGeometry[]>>(new Map())
  const lastCleanupRef = useRef<number>(Date.now())
  const explosionCountRef = useRef<number>(0)

  // Generate unique explosion ID
  const generateExplosionId = useCallback((): string => {
    explosionCountRef.current += 1
    return `explosion-${Date.now()}-${explosionCountRef.current}`
  }, [])

  // Apply physics explosion force to nearby rigid bodies
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

            // Only affect bodies within radius
            if (distance < radius && distance > 0.01) {
              // Avoid division by zero
              // Calculate explosion direction
              const direction = bodyPosition.clone().sub(center)

              // Normalize only if distance is significant
              if (direction.length() > 0.01) {
                direction.normalize()
              } else {
                // Random direction for objects at exact same position
                direction
                  .set(
                    (Math.random() - 0.5) * 2,
                    Math.random(),
                    (Math.random() - 0.5) * 2
                  )
                  .normalize()
              }

              // Calculate force with falloff (quadratic for more realistic effect)
              const falloff = Math.max(0, 1 - distance / radius)
              const explosionForce = force * falloff * falloff

              // Add upward bias for more dramatic effect
              direction.y = Math.max(direction.y, 0.2)
              direction.normalize()

              // Apply linear impulse
              const impulse = direction.multiplyScalar(explosionForce)
              rigidBody.applyImpulse(impulse, true)

              // Apply angular impulse for spinning effect (smaller magnitude)
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

  // Create explosion with options
  const createExplosion = useCallback(
    (options: CreateExplosionOptions) => {
      try {
        // Validate position
        if (!options.position || !options.position.isVector3) {
          console.error('Invalid position provided to createExplosion')
          return null
        }

        // Check explosion limit
        if (explosions.length >= explosionConfig.maxExplosions) {
          console.warn('Maximum explosions reached, removing oldest')
          setExplosions((prev) => prev.slice(1)) // Remove oldest
        }

        const explosionId = generateExplosionId()
        const force = options.force ?? explosionConfig.defaultForce
        const radius = options.radius ?? explosionConfig.defaultRadius

        const explosion: ExplosionEffect = {
          id: explosionId,
          position: options.position.clone(), // Always clone to avoid reference issues
          velocity: options.velocity?.clone(),
          force,
          radius,
          createdAt: Date.now(),
          disposed: false,
        }

        // Apply physics force
        applyExplosionForce(explosion.position, force, radius)

        // Add to state
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

  // Simple create explosion (backward compatibility)
  const createSimpleExplosion = useCallback(
    (position: Vector3, velocity?: Vector3) => {
      return createExplosion({ position, velocity })
    },
    [createExplosion]
  )

  // Register geometry for cleanup
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

  // Clean up geometry for specific explosion
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

  // Remove specific explosion
  const removeExplosion = useCallback(
    (explosionId: string) => {
      try {
        // Clean up geometry first
        cleanupExplosionGeometry(explosionId)

        // Remove from state
        setExplosions((prev) => prev.filter((e) => e.id !== explosionId))
      } catch (error) {
        console.error('Error removing explosion:', error)
      }
    },
    [cleanupExplosionGeometry]
  )

  // Clear all explosions
  const clearAllExplosions = useCallback(() => {
    try {
      // Clean up all geometries
      for (const [explosionId] of geometriesRef.current) {
        cleanupExplosionGeometry(explosionId)
      }

      // Clear state
      setExplosions([])
    } catch (error) {
      console.error('Error clearing all explosions:', error)
    }
  }, [cleanupExplosionGeometry])

  // Frame-based cleanup with throttling
  useFrame(() => {
    const now = Date.now()

    // Only cleanup every cleanupInterval ms to avoid performance issues
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

        // Clean up geometries for expired explosions IMMEDIATELY
        expiredExplosions.forEach((id) => {
          console.log('Cleaning up geometries for expired explosion:', id)
          cleanupExplosionGeometry(id)
        })

        // Aggressive cleanup: also clean any geometries for explosions that no longer exist
        const activeExplosionIds = new Set(newExplosions.map((e) => e.id))
        const geometryIds = Array.from(geometriesRef.current.keys())

        geometryIds.forEach((geometryId) => {
          if (!activeExplosionIds.has(geometryId)) {
            console.log('Cleaning up orphaned geometries for:', geometryId)
            cleanupExplosionGeometry(geometryId)
          }
        })

        // Only update state if there were changes
        return newExplosions.length !== prev.length ? newExplosions : prev
      })
    } catch (error) {
      console.error('Error during explosion cleanup:', error)
    }
  })

  // Cleanup on unmount
  useEffect(() => {
    // Capture the current geometries map
    const currentGeometries = geometriesRef.current

    return () => {
      try {
        // Clean up all geometries on unmount using captured value
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
        // Clear the map
        currentGeometries.clear()
      } catch (error) {
        console.error('Error during cleanup on unmount:', error)
      }
    }
  }, []) // Remove cleanupExplosionGeometry dependency since we're doing direct cleanup

  // Debug info
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
    // Main API
    explosions,
    createExplosion,
    createSimpleExplosion, // Backward compatibility
    removeExplosion,
    clearAllExplosions,

    // Geometry management
    registerGeometry,
    cleanupExplosionGeometry,

    // Physics
    applyExplosionForce,

    // Utils
    getDebugInfo,
    logDebugInfo: () => getDebugInfo(), // Easy debug function

    // Config
    config: explosionConfig,
  }
}
