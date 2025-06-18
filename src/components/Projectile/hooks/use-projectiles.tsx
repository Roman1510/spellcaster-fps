import { useState, useRef, useCallback, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RapierRigidBody } from '@react-three/rapier'

import { ProjectileData } from '../types/projectiles'
import { PROJECTILE_CONFIG } from '../constants/constants'

export const useProjectiles = () => {
  const [projectiles, setProjectiles] = useState<ProjectileData[]>([])
  const projectileRefs = useRef<Map<string, RapierRigidBody>>(new Map())

  const projectilesToRemove = useRef<Set<string>>(new Set())

  const addProjectile = useCallback((projectileData: ProjectileData) => {
    setProjectiles((prev) => [...prev, projectileData])
  }, [])

  const removeProjectile = useCallback((projectileId: string) => {
    projectilesToRemove.current.add(projectileId)
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

  useFrame(() => {
    const now = Date.now()
    const toRemove = new Set<string>()

    projectiles.forEach((projectile) => {
      const shouldRemove =
        (projectile.impactedAt &&
          now - projectile.impactedAt >
            PROJECTILE_CONFIG.impactDisappearTime) ||
        now - projectile.createdAt > PROJECTILE_CONFIG.lifetime

      if (shouldRemove) {
        toRemove.add(projectile.id)
      }
    })

    projectilesToRemove.current.forEach((id) => toRemove.add(id))

    if (toRemove.size > 0) {
      toRemove.forEach((id) => {
        projectileRefs.current.delete(id)
      })

      setProjectiles((prev) => prev.filter((p) => !toRemove.has(p.id)))

      projectilesToRemove.current.clear()
    }
  })

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      projectileRefs.current.clear()
    }
  }, [])

  return {
    projectiles,
    addProjectile,
    removeProjectile,
    markProjectileImpacted,
    getProjectileRigidBody,
    setProjectileRef,
  }
}
