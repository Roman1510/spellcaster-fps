import { ReactElement } from 'react'
import { Vector3 } from 'three'

export interface ProjectileData {
  id: string
  mesh: ReactElement
  direction: Vector3
  createdAt: number
  position: Vector3
  impactedAt?: number
}

export interface ExplosionEffect {
  id: string
  position: Vector3
  createdAt: number
}

export interface ProjectileConfig {
  mass: number
  velocity: number
  friction: number
  linearDamping: number
  restitution: number
  size: number
  lifetime: number
  impactDisappearTime: number
}

export interface ExplosionConfig {
  lifetime: number
  maxScale: number
  coreSize: number
  blastSize: number
}
