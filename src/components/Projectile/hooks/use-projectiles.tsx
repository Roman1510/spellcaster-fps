import { useState, useRef, useCallback, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RapierRigidBody } from '@react-three/rapier'
import { Vector3 } from 'three'
import { ProjectileData } from '../types/projectiles'
import { PROJECTILE_CONFIG } from '../constants/constants'

export const useProjectiles = () => {
  const [projectiles, setProjectiles] = useState<ProjectileData[]>([])
  const projectileRefs = useRef<Map<string, RapierRigidBody>>(new Map())

  const addProjectile = useCallback((projectileData: ProjectileData) => {
    setProjectiles((prev) => [...prev, projectileData])
  }, [])

  const removeProjectile = useCallback((projectileId: string) => {
    setProjectiles((prev) => prev.filter((p) => p.id !== projectileId))
    projectileRefs.current.delete(projectileId)
  }, [])

  const markProjectileImpacted = useCallback((projectileId: string) => {
    setProjectiles((prev) =>
      prev.map((p) =>
        p.id === projectileId ? { ...p, impactedAt: Date.now() } : p
      )
    )
  }, [])

  const getProjectileRigidBody = useCallback((projectileId: string) => {
    return projectileRefs.current.get(projectileId)
  }, [])

  const setProjectileRef = useCallback(
    (projectileId: string, ref: RapierRigidBody | null) => {
      if (ref) {
        projectileRefs.current.set(projectileId, ref)
      } else {
        projectileRefs.current.delete(projectileId)
      }
    },
    []
  )

  // Apply physics to projectiles
  useEffect(() => {
    projectiles.forEach((projectile) => {
      const ref = projectileRefs.current.get(projectile.id)
      if (ref) {
        const dir = projectile.direction
        const velocity = PROJECTILE_CONFIG.velocity
        ref.setLinvel(
          new Vector3(dir.x * velocity, dir.y * velocity, dir.z * velocity),
          false
        )
      }
    })
  }, [projectiles])

  // Cleanup old projectiles
  useFrame(() => {
    const now = Date.now()

    setProjectiles((prev) => {
      const newProjectiles = prev.filter((p) => {
        if (
          p.impactedAt &&
          now - p.impactedAt > PROJECTILE_CONFIG.impactDisappearTime
        ) {
          projectileRefs.current.delete(p.id)
          return false
        }
        if (now - p.createdAt > PROJECTILE_CONFIG.lifetime) {
          projectileRefs.current.delete(p.id)
          return false
        }
        return true
      })
      return newProjectiles.length !== prev.length ? newProjectiles : prev
    })
  })

  return {
    projectiles,
    addProjectile,
    removeProjectile,
    markProjectileImpacted,
    getProjectileRigidBody,
    setProjectileRef,
  }
}
