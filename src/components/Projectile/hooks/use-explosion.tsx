import { useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { ExplosionEffect } from '../types/projectiles'
import { EXPLOSION_CONFIG } from '../constants/constants'
import { generateExplosionId } from '../utils/projectileHelpers'

export const useExplosions = () => {
  const [explosions, setExplosions] = useState<ExplosionEffect[]>([])

  const createExplosion = useCallback((position: Vector3) => {
    const explosionId = generateExplosionId()
    setExplosions((prev) => [
      ...prev,
      {
        id: explosionId,
        position: position.clone(),
        createdAt: Date.now(),
      },
    ])
  }, [])

  const removeExplosion = useCallback((explosionId: string) => {
    setExplosions((prev) => prev.filter((e) => e.id !== explosionId))
  }, [])

  useFrame(() => {
    const now = Date.now()

    setExplosions((prev) => {
      const newExplosions = prev.filter(
        (explosion) => now - explosion.createdAt < EXPLOSION_CONFIG.lifetime
      )
      return newExplosions.length !== prev.length ? newExplosions : prev
    })
  })

  return {
    explosions,
    createExplosion,
    removeExplosion,
  }
}
