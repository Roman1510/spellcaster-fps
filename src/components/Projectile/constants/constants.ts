import { Vector3 } from 'three'
import { ProjectileConfig, ExplosionConfig } from '../types/projectiles'

export const PROJECTILE_CONFIG: ProjectileConfig = {
  mass: 70,
  velocity: 140,
  friction: 0.05,
  linearDamping: 0.1,
  restitution: 0.2,
  size: 0.6,
  lifetime: 5000,
  impactDisappearTime: 170,
}

export const EXPLOSION_CONFIG: ExplosionConfig = {
  lifetime: 1200,
  maxScale: 2,
  coreSize: 0.6,
  blastSize: 1.0,
}

export const CAMERA_OFFSET = new Vector3(0.5, -0.1, -3.6)

export const TRAIL_CONFIG = {
  width: 2,
  length: 2,
  color: '#ff3300',
}

export const PROJECTILE_COLORS = {
  main: '#ff4400',
  emissive: '#ff1100',
  emissiveIntensity: 3,
  opacity: 0.95,
}

export const RANDOMNESS_MAGNITUDE = 0.03
export const PHYSICS_DELAY = 10
